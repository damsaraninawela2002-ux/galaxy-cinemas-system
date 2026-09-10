<?php
// api/genres.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT g.*, COUNT(mg.movie_id) as movie_count
        FROM genres g
        LEFT JOIN movie_genres mg ON g.genre_id = mg.genre_id
        GROUP BY g.genre_id
        ORDER BY g.genre_name ASC
    ");
    $genres = $stmt->fetchAll();
    send_response(200, true, 'Genres retrieved', $genres);
}

if ($method === 'POST') {
    $input = get_json_input();
    $name = trim($input['genre_name'] ?? $input['name'] ?? '');
    if (empty($name)) {
        send_response(400, false, 'Genre name is required');
    }
    $stmt = $pdo->prepare("INSERT INTO genres (genre_name) VALUES (?)");
    try {
        $stmt->execute([$name]);
        send_response(201, true, 'Genre added', ['genre_id' => $pdo->lastInsertId(), 'genre_name' => $name]);
    } catch (\Exception $e) {
        send_response(400, false, 'Genre name already exists');
    }
}

if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'edit')) {
    $input = get_json_input();
    $id = (int)($input['genre_id'] ?? $_GET['id'] ?? 0);
    $name = trim($input['genre_name'] ?? '');
    if ($id <= 0 || empty($name)) {
        send_response(400, false, 'Valid genre ID and name required');
    }
    $stmt = $pdo->prepare("UPDATE genres SET genre_name = ? WHERE genre_id = ?");
    $stmt->execute([$name, $id]);
    send_response(200, true, 'Genre updated');
}

if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = (int)($_GET['id'] ?? get_json_input()['genre_id'] ?? 0);
    if ($id <= 0) {
        send_response(400, false, 'Valid genre ID required');
    }
    $stmt = $pdo->prepare("DELETE FROM genres WHERE genre_id = ?");
    $stmt->execute([$id]);
    send_response(200, true, 'Genre deleted');
}
