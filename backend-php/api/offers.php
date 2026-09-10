<?php
// api/offers.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM offers ORDER BY created_at DESC");
    $offers = $stmt->fetchAll();
    foreach ($offers as &$o) {
        $o['discount_value'] = (float)$o['discount_value'];
    }
    send_response(200, true, 'Offers retrieved', $offers);
}

if ($method === 'POST') {
    $input = get_json_input();
    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $discountType = $input['discount_type'] ?? 'percentage';
    $discountValue = (float)($input['discount_value'] ?? 10);
    $startDate = $input['start_date'] ?? date('Y-m-d');
    $endDate = $input['end_date'] ?? date('Y-m-d', strtotime('+30 days'));
    $banner = trim($input['banner'] ?? 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80');
    $status = $input['status'] ?? 'active';

    if (empty($title)) send_response(400, false, 'Offer title is required');

    $stmt = $pdo->prepare("
        INSERT INTO offers (title, description, discount_type, discount_value, start_date, end_date, banner, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$title, $description, $discountType, $discountValue, $startDate, $endDate, $banner, $status]);
    send_response(201, true, 'Offer created successfully', ['id' => $pdo->lastInsertId()]);
}

if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'edit')) {
    $input = get_json_input();
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $discountType = $input['discount_type'] ?? 'percentage';
    $discountValue = (float)($input['discount_value'] ?? 10);
    $startDate = $input['start_date'] ?? date('Y-m-d');
    $endDate = $input['end_date'] ?? date('Y-m-d');
    $banner = trim($input['banner'] ?? '');
    $status = $input['status'] ?? 'active';

    if ($id <= 0 || empty($title)) send_response(400, false, 'Valid ID and title required');

    $stmt = $pdo->prepare("
        UPDATE offers
        SET title = ?, description = ?, discount_type = ?, discount_value = ?, start_date = ?, end_date = ?, banner = ?, status = ?
        WHERE id = ?
    ");
    $stmt->execute([$title, $description, $discountType, $discountValue, $startDate, $endDate, $banner, $status, $id]);
    send_response(200, true, 'Offer updated successfully');
}

if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = (int)($_GET['id'] ?? get_json_input()['id'] ?? 0);
    if ($id <= 0) send_response(400, false, 'Valid offer ID required');
    $stmt = $pdo->prepare("DELETE FROM offers WHERE id = ?");
    $stmt->execute([$id]);
    send_response(200, true, 'Offer deleted');
}
