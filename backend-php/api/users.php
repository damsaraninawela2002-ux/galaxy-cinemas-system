<?php
// api/users.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id > 0) {
        $stmt = $pdo->prepare("
            SELECT u.user_id, u.full_name, u.email, u.phone, u.role, u.status, u.profile_image, u.created_at,
                   COUNT(DISTINCT b.booking_id) as total_bookings,
                   COALESCE(SUM(CASE WHEN p.payment_status = 'success' THEN p.amount ELSE 0 END), 0) as total_spend
            FROM users u
            LEFT JOIN bookings b ON u.user_id = b.user_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            WHERE u.user_id = ?
            GROUP BY u.user_id
        ");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if (!$user) send_response(404, false, 'User not found');

        // Fetch user bookings
        $bStmt = $pdo->prepare("
            SELECT b.booking_id, b.total_amount, b.booking_status, b.created_at,
                   m.title as movie_title, s.show_date, s.start_time, t.name as cinema_name
            FROM bookings b
            JOIN showtimes s ON b.showtime_id = s.showtime_id
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN screens sc ON s.screen_id = sc.screen_id
            JOIN theaters t ON sc.theater_id = t.theater_id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        ");
        $bStmt->execute([$id]);
        $user['bookings'] = $bStmt->fetchAll();

        send_response(200, true, 'User details retrieved', $user);
    }

    $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;
    $status = isset($_GET['status']) && $_GET['status'] !== 'all' ? $_GET['status'] : null;

    $sql = "
        SELECT u.user_id, u.full_name, u.email, u.phone, u.role, u.status, u.profile_image, u.created_at,
               COUNT(DISTINCT b.booking_id) as total_bookings,
               COALESCE(SUM(CASE WHEN p.payment_status = 'success' THEN p.amount ELSE 0 END), 0) as total_spend
        FROM users u
        LEFT JOIN bookings b ON u.user_id = b.user_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        WHERE 1=1
    ";
    $params = [];

    if ($search) {
        $sql .= " AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }
    if ($status) {
        $sql .= " AND u.status = ?";
        $params[] = $status;
    }

    $sql .= " GROUP BY u.user_id ORDER BY u.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll();

    foreach ($users as &$u) {
        $u['total_spend'] = (float)$u['total_spend'];
        $u['total_bookings'] = (int)$u['total_bookings'];
    }

    send_response(200, true, 'Users retrieved', $users);
}

// Toggle block/unblock or edit user
if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'status')) {
    $input = get_json_input();
    $id = (int)($input['user_id'] ?? $_GET['id'] ?? 0);
    $newStatus = trim($input['status'] ?? '');

    if ($id <= 0 || empty($newStatus)) {
        send_response(400, false, 'User ID and status are required');
    }

    $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE user_id = ?");
    $stmt->execute([$newStatus, $id]);
    send_response(200, true, "User marked as $newStatus");
}

// Delete user
if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = (int)($_GET['id'] ?? get_json_input()['user_id'] ?? 0);
    if ($id <= 0) send_response(400, false, 'Invalid user ID');
    $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->execute([$id]);
    send_response(200, true, 'User deleted successfully');
}
