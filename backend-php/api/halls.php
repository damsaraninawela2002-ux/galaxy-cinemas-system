<?php
// api/halls.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id > 0) {
        $stmt = $pdo->prepare("
            SELECT s.*, t.name as cinema_name, t.location
            FROM screens s
            JOIN theaters t ON s.theater_id = t.theater_id
            WHERE s.screen_id = ?
        ");
        $stmt->execute([$id]);
        $hall = $stmt->fetch();
        if (!$hall) send_response(404, false, 'Hall not found');

        // Fetch scheduled showtimes for this hall
        $sStmt = $pdo->prepare("
            SELECT sh.*, m.title as movie_title, m.poster_url, m.duration_minutes
            FROM showtimes sh
            JOIN movies m ON sh.movie_id = m.movie_id
            WHERE sh.screen_id = ? AND sh.show_date >= CURDATE()
            ORDER BY sh.show_date ASC, sh.start_time ASC
        ");
        $sStmt->execute([$id]);
        $hall['showtimes'] = $sStmt->fetchAll();

        // Fetch seats summary
        $seatStmt = $pdo->prepare("
            SELECT seat_id, seat_number, seat_type, row_label, price, status
            FROM seats
            WHERE screen_id = ?
            ORDER BY row_label ASC, seat_number ASC
        ");
        $seatStmt->execute([$id]);
        $hall['seats'] = $seatStmt->fetchAll();

        send_response(200, true, 'Hall details retrieved', $hall);
    }

    $cinemaId = isset($_GET['cinema_id']) ? (int)$_GET['cinema_id'] : 0;
    $sql = "
        SELECT s.*, t.name as cinema_name, t.location,
               COUNT(DISTINCT sh.showtime_id) as active_showtimes,
               COUNT(DISTINCT st.seat_id) as actual_seats_count
        FROM screens s
        JOIN theaters t ON s.theater_id = t.theater_id
        LEFT JOIN showtimes sh ON s.screen_id = sh.screen_id AND sh.show_date >= CURDATE()
        LEFT JOIN seats st ON s.screen_id = st.screen_id
        WHERE 1=1
    ";
    $params = [];
    if ($cinemaId > 0) {
        $sql .= " AND s.theater_id = ?";
        $params[] = $cinemaId;
    }
    $sql .= " GROUP BY s.screen_id ORDER BY s.theater_id ASC, s.screen_id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    send_response(200, true, 'Halls retrieved', $stmt->fetchAll());
}

if ($method === 'POST') {
    $input = get_json_input();
    $theaterId = (int)($input['theater_id'] ?? $input['cinema_id'] ?? 0);
    $screenName = trim($input['screen_name'] ?? $input['name'] ?? '');
    $totalSeats = (int)($input['total_seats'] ?? $input['capacity'] ?? 50);
    $screenType = trim($input['screen_type'] ?? '2D');

    if ($theaterId <= 0 || empty($screenName)) {
        send_response(400, false, 'Cinema and Hall Name are required');
    }

    $stmt = $pdo->prepare("INSERT INTO screens (theater_id, screen_name, total_seats, screen_type) VALUES (?, ?, ?, ?)");
    $stmt->execute([$theaterId, $screenName, $totalSeats, $screenType]);
    $hallId = $pdo->lastInsertId();

    send_response(201, true, 'Hall created successfully', ['screen_id' => $hallId]);
}

if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'edit')) {
    $input = get_json_input();
    $id = (int)($input['screen_id'] ?? $input['id'] ?? $_GET['id'] ?? 0);
    $theaterId = (int)($input['theater_id'] ?? 0);
    $screenName = trim($input['screen_name'] ?? '');
    $totalSeats = (int)($input['total_seats'] ?? 0);
    $screenType = trim($input['screen_type'] ?? '2D');

    if ($id <= 0 || empty($screenName)) {
        send_response(400, false, 'Valid screen ID and name required');
    }

    $stmt = $pdo->prepare("UPDATE screens SET theater_id = ?, screen_name = ?, total_seats = ?, screen_type = ? WHERE screen_id = ?");
    $stmt->execute([$theaterId, $screenName, $totalSeats, $screenType, $id]);
    send_response(200, true, 'Hall updated successfully');
}

if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = (int)($_GET['id'] ?? get_json_input()['screen_id'] ?? 0);
    if ($id <= 0) send_response(400, false, 'Invalid screen ID');
    $stmt = $pdo->prepare("DELETE FROM screens WHERE screen_id = ?");
    $stmt->execute([$id]);
    send_response(200, true, 'Hall deleted successfully');
}
