<?php
// api/seats.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET Seats for a hall or showtime
if ($method === 'GET') {
    $screenId = isset($_GET['screen_id']) ? (int)$_GET['screen_id'] : 0;
    $showtimeId = isset($_GET['showtime_id']) ? (int)$_GET['showtime_id'] : 0;

    if ($showtimeId > 0 && $screenId === 0) {
        $st = $pdo->prepare("SELECT screen_id FROM showtimes WHERE showtime_id = ?");
        $st->execute([$showtimeId]);
        $screenId = (int)$st->fetchColumn();
    }

    if ($screenId <= 0) {
        send_response(400, false, 'screen_id or showtime_id is required');
    }

    // Check booked seats for showtime if provided
    $bookedSeatIds = [];
    if ($showtimeId > 0) {
        $bStmt = $pdo->prepare("
            SELECT bs.seat_id
            FROM booking_seats bs
            JOIN bookings b ON bs.booking_id = b.booking_id
            WHERE b.showtime_id = ? AND b.booking_status != 'cancelled'
        ");
        $bStmt->execute([$showtimeId]);
        $bookedSeatIds = $bStmt->fetchAll(PDO::FETCH_COLUMN);
    }

    $stmt = $pdo->prepare("
        SELECT seat_id, screen_id, seat_number, seat_type, row_label, price, status
        FROM seats
        WHERE screen_id = ?
        ORDER BY row_label ASC, CAST(SUBSTRING(seat_number, 2) AS UNSIGNED) ASC, seat_number ASC
    ");
    $stmt->execute([$screenId]);
    $seats = $stmt->fetchAll();

    foreach ($seats as &$s) {
        $s['is_booked_for_show'] = in_array($s['seat_id'], $bookedSeatIds);
        if ($s['is_booked_for_show']) {
            $s['status'] = 'booked';
        }
        $s['price'] = (float)$s['price'];
    }

    // Group by row for convenience
    $grouped = [];
    foreach ($seats as $s) {
        $r = $s['row_label'] ?: substr($s['seat_number'], 0, 1);
        if (!isset($grouped[$r])) {
            $grouped[$r] = [];
        }
        $grouped[$r][] = $s;
    }

    send_response(200, true, 'Seats retrieved', [
        'total' => count($seats),
        'screen_id' => $screenId,
        'seats' => $seats,
        'grid' => $grouped
    ]);
}

// 2. Bulk Generate Seats (visual generator)
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'generate') {
    $input = get_json_input();
    $screenId = (int)($input['screen_id'] ?? 0);
    $rowsCount = (int)($input['rows'] ?? 5);
    $colsCount = (int)($input['cols'] ?? 10);
    $standardPrice = (float)($input['standard_price'] ?? 12.00);
    $vipPrice = (float)($input['vip_price'] ?? 20.00);
    $couplePrice = (float)($input['couple_price'] ?? 32.00);
    $vipRows = $input['vip_rows'] ?? []; // e.g. ['C', 'D']
    $coupleRows = $input['couple_rows'] ?? []; // e.g. ['E']
    $replaceExisting = !empty($input['replace']);

    if ($screenId <= 0) send_response(400, false, 'Valid screen_id is required');

    if ($replaceExisting) {
        $pdo->prepare("DELETE FROM seats WHERE screen_id = ?")->execute([$screenId]);
    }

    $letters = range('A', 'Z');
    $insertedCount = 0;
    $stmt = $pdo->prepare("
        INSERT INTO seats (screen_id, seat_number, seat_type, row_label, price, status)
        VALUES (?, ?, ?, ?, ?, 'available')
        ON DUPLICATE KEY UPDATE seat_type = VALUES(seat_type), price = VALUES(price)
    ");

    for ($r = 0; $r < $rowsCount && $r < count($letters); $r++) {
        $rowLetter = $letters[$r];
        $type = 'standard';
        $price = $standardPrice;

        if (in_array($rowLetter, $vipRows)) {
            $type = 'vip';
            $price = $vipPrice;
        } elseif (in_array($rowLetter, $coupleRows)) {
            $type = 'couple';
            $price = $couplePrice;
        }

        for ($c = 1; $c <= $colsCount; $c++) {
            $seatNumber = $rowLetter . $c;
            $stmt->execute([$screenId, $seatNumber, $type, $rowLetter, $price]);
            $insertedCount++;
        }
    }

    // Update screen total_seats count
    $totalActual = $pdo->prepare("SELECT COUNT(*) FROM seats WHERE screen_id = ?");
    $totalActual->execute([$screenId]);
    $count = $totalActual->fetchColumn();
    $pdo->prepare("UPDATE screens SET total_seats = ? WHERE screen_id = ?")->execute([$count, $screenId]);

    send_response(200, true, "Generated $insertedCount seats successfully", ['total_seats' => $count]);
}

// 3. Toggle Seat Status / Edit Seat
if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'toggle')) {
    $input = get_json_input();
    $seatId = (int)($input['seat_id'] ?? $_GET['id'] ?? 0);
    $status = $input['status'] ?? null;
    $seatType = $input['seat_type'] ?? null;
    $price = isset($input['price']) ? (float)$input['price'] : null;

    if ($seatId <= 0) send_response(400, false, 'Valid seat_id required');

    $fields = [];
    $params = [];
    if ($status) {
        $fields[] = "status = ?";
        $params[] = $status;
    }
    if ($seatType) {
        $fields[] = "seat_type = ?";
        $params[] = $seatType;
    }
    if ($price !== null) {
        $fields[] = "price = ?";
        $params[] = $price;
    }

    if (empty($fields)) {
        send_response(400, false, 'No fields to update');
    }

    $params[] = $seatId;
    $sql = "UPDATE seats SET " . implode(', ', $fields) . " WHERE seat_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    send_response(200, true, 'Seat updated successfully');
}

// 4. Delete Seat
if ($method === 'DELETE') {
    $seatId = (int)($_GET['id'] ?? get_json_input()['seat_id'] ?? 0);
    if ($seatId <= 0) send_response(400, false, 'Valid seat_id required');
    $stmt = $pdo->prepare("DELETE FROM seats WHERE seat_id = ?");
    $stmt->execute([$seatId]);
    send_response(200, true, 'Seat removed');
}
