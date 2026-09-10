<?php
// api/cinemas.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id > 0) {
        $stmt = $pdo->prepare("
            SELECT t.*, COUNT(s.screen_id) as total_halls
            FROM theaters t
            LEFT JOIN screens s ON t.theater_id = s.theater_id
            WHERE t.theater_id = ?
            GROUP BY t.theater_id
        ");
        $stmt->execute([$id]);
        $cinema = $stmt->fetch();
        if (!$cinema) send_response(404, false, 'Cinema not found');
        send_response(200, true, 'Cinema retrieved', $cinema);
    }

    $stmt = $pdo->query("
        SELECT t.*, COUNT(s.screen_id) as total_halls,
               COALESCE(SUM(s.total_seats), 0) as total_capacity
        FROM theaters t
        LEFT JOIN screens s ON t.theater_id = s.theater_id
        GROUP BY t.theater_id
        ORDER BY t.theater_id ASC
    ");
    $cinemas = $stmt->fetchAll();
    send_response(200, true, 'Cinemas retrieved', $cinemas);
}

if ($method === 'POST') {
    $input = get_json_input();
    $name = trim($input['name'] ?? '');
    $location = trim($input['location'] ?? '');
    $address = trim($input['address'] ?? '');
    $contact = trim($input['contact_number'] ?? $input['contact'] ?? '');

    if (empty($name) || empty($location)) {
        send_response(400, false, 'Cinema name and location are required');
    }

    $stmt = $pdo->prepare("INSERT INTO theaters (name, location, address, contact_number) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $location, $address, $contact]);
    send_response(201, true, 'Cinema added successfully', ['theater_id' => $pdo->lastInsertId()]);
}

if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'edit')) {
    $input = get_json_input();
    $id = (int)($input['theater_id'] ?? $input['id'] ?? $_GET['id'] ?? 0);
    $name = trim($input['name'] ?? '');
    $location = trim($input['location'] ?? '');
    $address = trim($input['address'] ?? '');
    $contact = trim($input['contact_number'] ?? $input['contact'] ?? '');

    if ($id <= 0 || empty($name)) {
        send_response(400, false, 'Valid ID and name required');
    }

    $stmt = $pdo->prepare("UPDATE theaters SET name = ?, location = ?, address = ?, contact_number = ? WHERE theater_id = ?");
    $stmt->execute([$name, $location, $address, $contact, $id]);
    send_response(200, true, 'Cinema updated successfully');
}

if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = (int)($_GET['id'] ?? get_json_input()['theater_id'] ?? 0);
    if ($id <= 0) send_response(400, false, 'Invalid cinema ID');
    $stmt = $pdo->prepare("DELETE FROM theaters WHERE theater_id = ?");
    $stmt->execute([$id]);
    send_response(200, true, 'Cinema deleted successfully');
}
