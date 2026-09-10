<?php
// api/promo_codes.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM promo_codes ORDER BY created_at DESC");
    $promos = $stmt->fetchAll();
    foreach ($promos as &$p) {
        $p['discount_value'] = (float)$p['discount_value'];
        $p['usage_limit'] = (int)$p['usage_limit'];
        $p['used_count'] = (int)$p['used_count'];
    }
    send_response(200, true, 'Promo codes retrieved', $promos);
}

if ($method === 'POST') {
    $input = get_json_input();
    $code = strtoupper(trim($input['code'] ?? ''));
    $discountType = $input['discount_type'] ?? 'percentage';
    $discountValue = (float)($input['discount_value'] ?? 10);
    $usageLimit = (int)($input['usage_limit'] ?? 100);
    $expiryDate = $input['expiry_date'] ?? date('Y-m-d', strtotime('+30 days'));
    $status = $input['status'] ?? 'active';

    if (empty($code)) send_response(400, false, 'Promo code is required');

    $stmt = $pdo->prepare("
        INSERT INTO promo_codes (code, discount_type, discount_value, usage_limit, used_count, expiry_date, status)
        VALUES (?, ?, ?, ?, 0, ?, ?)
    ");
    try {
        $stmt->execute([$code, $discountType, $discountValue, $usageLimit, $expiryDate, $status]);
        send_response(201, true, 'Promo code created', ['id' => $pdo->lastInsertId()]);
    } catch (\Exception $e) {
        send_response(400, false, 'Promo code already exists');
    }
}

if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'edit')) {
    $input = get_json_input();
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    $code = strtoupper(trim($input['code'] ?? ''));
    $discountType = $input['discount_type'] ?? 'percentage';
    $discountValue = (float)($input['discount_value'] ?? 10);
    $usageLimit = (int)($input['usage_limit'] ?? 100);
    $expiryDate = $input['expiry_date'] ?? date('Y-m-d');
    $status = $input['status'] ?? 'active';

    if ($id <= 0 || empty($code)) send_response(400, false, 'Valid ID and code required');

    $stmt = $pdo->prepare("
        UPDATE promo_codes
        SET code = ?, discount_type = ?, discount_value = ?, usage_limit = ?, expiry_date = ?, status = ?
        WHERE id = ?
    ");
    $stmt->execute([$code, $discountType, $discountValue, $usageLimit, $expiryDate, $status, $id]);
    send_response(200, true, 'Promo code updated');
}

if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = (int)($_GET['id'] ?? get_json_input()['id'] ?? 0);
    if ($id <= 0) send_response(400, false, 'Valid promo ID required');
    $stmt = $pdo->prepare("DELETE FROM promo_codes WHERE id = ?");
    $stmt->execute([$id]);
    send_response(200, true, 'Promo code deleted');
}
