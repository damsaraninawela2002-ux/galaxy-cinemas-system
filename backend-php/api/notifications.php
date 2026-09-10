<?php
// api/notifications.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT n.*, u.full_name as target_user_name, u.email as target_user_email
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.user_id
        ORDER BY n.sent_at DESC
    ");
    $notifications = $stmt->fetchAll();
    send_response(200, true, 'Notifications retrieved', $notifications);
}

if ($method === 'POST') {
    $input = get_json_input();
    $title = trim($input['title'] ?? '');
    $message = trim($input['message'] ?? '');
    $target = $input['target'] ?? 'all';
    $userId = !empty($input['user_id']) ? (int)$input['user_id'] : null;

    if (empty($title) || empty($message)) {
        send_response(400, false, 'Title and message are required');
    }

    $stmt = $pdo->prepare("
        INSERT INTO notifications (title, message, target, user_id, status, sent_at)
        VALUES (?, ?, ?, ?, 'sent', NOW())
    ");
    $stmt->execute([$title, $message, $target, $userId]);
    send_response(201, true, 'Notification dispatched successfully', ['id' => $pdo->lastInsertId()]);
}

if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = (int)($_GET['id'] ?? get_json_input()['id'] ?? 0);
    if ($id <= 0) send_response(400, false, 'Valid notification ID required');
    $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ?");
    $stmt->execute([$id]);
    send_response(200, true, 'Notification deleted');
}
