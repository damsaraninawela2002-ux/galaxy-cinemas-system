<?php
// api/payments.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET Payments
if ($method === 'GET') {
    $status = isset($_GET['status']) && $_GET['status'] !== 'all' ? $_GET['status'] : null;
    $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;

    $sql = "
        SELECT p.*, 
               b.total_amount as booking_total, b.booking_status,
               u.full_name as customer_name, u.email as customer_email,
               m.title as movie_title, s.show_date, s.start_time
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        JOIN users u ON b.user_id = u.user_id
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        WHERE 1=1
    ";
    $params = [];

    if ($status) {
        $sql .= " AND p.payment_status = ?";
        $params[] = $status;
    }
    if ($search) {
        $sql .= " AND (u.full_name LIKE ? OR u.email LIKE ? OR m.title LIKE ? OR CAST(p.payment_id AS CHAR) LIKE ?)";
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    $sql .= " ORDER BY p.paid_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $payments = $stmt->fetchAll();

    foreach ($payments as &$p) {
        $p['amount'] = (float)$p['amount'];
    }

    // Totals summary
    $summary = [
        'totalSuccess' => (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'success'")->fetchColumn(),
        'totalRefunded' => (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'refunded'")->fetchColumn(),
        'totalFailed' => (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'failed'")->fetchColumn(),
    ];

    send_response(200, true, 'Payments retrieved', [
        'payments' => $payments,
        'summary' => $summary
    ]);
}

// 2. Process Refund
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'refund') {
    $input = get_json_input();
    $paymentId = (int)($input['payment_id'] ?? 0);
    $reason = trim($input['reason'] ?? 'Customer cancellation request');

    if ($paymentId <= 0) send_response(400, false, 'Valid payment_id required');

    $stmt = $pdo->prepare("UPDATE payments SET payment_status = 'refunded' WHERE payment_id = ?");
    $stmt->execute([$paymentId]);

    // Also mark linked booking cancelled
    $pdo->prepare("
        UPDATE bookings 
        SET booking_status = 'cancelled' 
        WHERE booking_id = (SELECT booking_id FROM payments WHERE payment_id = ?)
    ")->execute([$paymentId]);

    send_response(200, true, 'Refund processed successfully', ['reason' => $reason]);
}
