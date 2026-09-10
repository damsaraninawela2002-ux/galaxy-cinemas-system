<?php
// api/bookings.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET Bookings
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id > 0) {
        $stmt = $pdo->prepare("
            SELECT b.*, 
                   u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
                   m.title as movie_title, m.poster_url, m.duration_minutes, m.rating as movie_rating,
                   s.show_date, s.start_time, s.end_time, s.ticket_price,
                   sc.screen_id, sc.screen_name, sc.screen_type,
                   t.name as cinema_name, t.location as cinema_location,
                   p.payment_id, p.payment_method, p.payment_status, p.paid_at
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN showtimes s ON b.showtime_id = s.showtime_id
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN screens sc ON s.screen_id = sc.screen_id
            JOIN theaters t ON sc.theater_id = t.theater_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            WHERE b.booking_id = ?
        ");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();
        if (!$booking) send_response(404, false, 'Booking not found');

        // Fetch booked seats
        $seatStmt = $pdo->prepare("
            SELECT st.seat_id, st.seat_number, st.seat_type, st.row_label, st.price
            FROM booking_seats bs
            JOIN seats st ON bs.seat_id = st.seat_id
            WHERE bs.booking_id = ?
        ");
        $seatStmt->execute([$id]);
        $booking['seats'] = $seatStmt->fetchAll();

        send_response(200, true, 'Booking details retrieved', $booking);
    }

    $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;
    $status = isset($_GET['status']) && $_GET['status'] !== 'all' ? $_GET['status'] : null;
    $startDate = $_GET['start_date'] ?? null;
    $endDate = $_GET['end_date'] ?? null;

    $sql = "
        SELECT b.booking_id, b.total_amount, b.booking_status, b.created_at,
               u.user_id, u.full_name as customer_name, u.email as customer_email,
               m.movie_id, m.title as movie_title, m.poster_url,
               s.showtime_id, s.show_date, s.start_time,
               sc.screen_name, t.name as cinema_name,
               p.payment_method, p.payment_status,
               GROUP_CONCAT(st.seat_number ORDER BY st.seat_number ASC SEPARATOR ', ') as seat_numbers,
               COUNT(bs.seat_id) as seat_count
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN screens sc ON s.screen_id = sc.screen_id
        JOIN theaters t ON sc.theater_id = t.theater_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        LEFT JOIN booking_seats bs ON b.booking_id = bs.booking_id
        LEFT JOIN seats st ON bs.seat_id = st.seat_id
        WHERE 1=1
    ";
    $params = [];

    if ($search) {
        $sql .= " AND (u.full_name LIKE ? OR u.email LIKE ? OR m.title LIKE ? OR CAST(b.booking_id AS CHAR) LIKE ?)";
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }
    if ($status) {
        $sql .= " AND b.booking_status = ?";
        $params[] = $status;
    }
    if ($startDate) {
        $sql .= " AND DATE(b.created_at) >= ?";
        $params[] = $startDate;
    }
    if ($endDate) {
        $sql .= " AND DATE(b.created_at) <= ?";
        $params[] = $endDate;
    }

    $sql .= " GROUP BY b.booking_id ORDER BY b.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();

    foreach ($bookings as &$bk) {
        $bk['total_amount'] = (float)$bk['total_amount'];
        $bk['seat_count'] = (int)$bk['seat_count'];
    }

    send_response(200, true, 'Bookings retrieved', $bookings);
}

// 2. Update Booking Status / Cancel
if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'status')) {
    $input = get_json_input();
    $bookingId = (int)($input['booking_id'] ?? $_GET['id'] ?? 0);
    $newStatus = trim($input['status'] ?? 'cancelled');
    $refundPayment = !empty($input['refund']);

    if ($bookingId <= 0) send_response(400, false, 'Valid booking ID required');

    $stmt = $pdo->prepare("UPDATE bookings SET booking_status = ? WHERE booking_id = ?");
    $stmt->execute([$newStatus, $bookingId]);

    if ($refundPayment || $newStatus === 'cancelled') {
        $pdo->prepare("UPDATE payments SET payment_status = 'refunded' WHERE booking_id = ?")->execute([$bookingId]);
    }

    send_response(200, true, 'Booking status updated successfully');
}

// 3. Create Booking with Database Transaction (Atomic Finalization)
if ($method === 'POST' && (!isset($_GET['action']) || $_GET['action'] === 'create')) {
    $input = get_json_input();
    $userId = (int)($input['user_id'] ?? 4);
    $showtimeId = (int)($input['showtime_id'] ?? 0);
    $seatIds = $input['seat_ids'] ?? [];
    $totalAmount = (float)($input['total_amount'] ?? 0);
    $paymentMethod = trim($input['payment_method'] ?? 'card');
    $transactionRef = trim($input['transaction_ref'] ?? ('TXN-' . time()));

    if ($showtimeId <= 0) {
        send_response(400, false, 'A valid showtime ID is required');
    }
    if (empty($seatIds) || !is_array($seatIds)) {
        send_response(400, false, 'At least one seat must be selected');
    }
    if ($totalAmount <= 0) {
        send_response(400, false, 'Invalid total amount');
    }

    try {
        $pdo->beginTransaction();

        // Step 1: Re-validate seat availability for this specific showtime
        $placeholders = implode(',', array_fill(0, count($seatIds), '?'));
        $checkSql = "
            SELECT bs.seat_id
            FROM booking_seats bs
            JOIN bookings b ON bs.booking_id = b.booking_id
            WHERE b.showtime_id = ? 
              AND b.booking_status != 'cancelled'
              AND bs.seat_id IN ($placeholders)
            FOR UPDATE
        ";
        $checkStmt = $pdo->prepare($checkSql);
        $checkParams = array_merge([$showtimeId], $seatIds);
        $checkStmt->execute($checkParams);
        $alreadyBooked = $checkStmt->fetchAll(PDO::FETCH_COLUMN);

        if (!empty($alreadyBooked)) {
            $pdo->rollBack();
            send_response(409, false, 'One or more of the selected seats were already booked by another customer. Please choose different seats.');
        }

        // Step 2: Create the booking record
        $bStmt = $pdo->prepare("
            INSERT INTO bookings (user_id, showtime_id, total_amount, booking_status, created_at)
            VALUES (?, ?, ?, 'confirmed', NOW())
        ");
        $bStmt->execute([$userId, $showtimeId, $totalAmount]);
        $bookingId = (int)$pdo->lastInsertId();

        // Step 3: Link seats to that booking
        $bsStmt = $pdo->prepare("INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)");
        foreach ($seatIds as $sId) {
            $bsStmt->execute([$bookingId, (int)$sId]);
        }

        // Step 4: Record payment
        $pStmt = $pdo->prepare("
            INSERT INTO payments (booking_id, amount, payment_method, payment_status, paid_at)
            VALUES (?, ?, ?, 'success', NOW())
        ");
        $pStmt->execute([$bookingId, $totalAmount, $paymentMethod]);
        $paymentId = (int)$pdo->lastInsertId();

        // Step 5: Generate Booking ID (format: GC-YYYYMMDD-###)
        $bookingCode = 'GC-' . date('Ymd') . '-' . str_pad($bookingId % 1000, 3, '0', STR_PAD_LEFT);

        $pdo->commit();

        send_response(201, true, 'Booking confirmed successfully', [
            'booking_id' => $bookingId,
            'booking_code' => $bookingCode,
            'payment_id' => $paymentId,
            'total_amount' => $totalAmount,
            'booking_status' => 'confirmed',
            'transaction_ref' => $transactionRef,
            'seat_count' => count($seatIds)
        ]);

    } catch (\Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        send_response(500, false, 'Failed to complete booking: ' . $e->getMessage());
    }
}
