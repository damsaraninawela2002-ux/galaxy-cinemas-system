<?php
// api/showtimes.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

// Helper to check hall scheduling conflict
function check_showtime_conflict($pdo, $screenId, $showDate, $startTime, $endTime, $excludeShowtimeId = 0) {
    $sql = "
        SELECT s.showtime_id, m.title as movie_title, s.start_time, s.end_time
        FROM showtimes s
        JOIN movies m ON s.movie_id = m.movie_id
        WHERE s.screen_id = ?
          AND s.show_date = ?
          AND s.showtime_id != ?
          AND (
            (? >= s.start_time AND ? < s.end_time) OR
            (? > s.start_time AND ? <= s.end_time) OR
            (? <= s.start_time AND ? >= s.end_time)
          )
        LIMIT 1
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$screenId, $showDate, $excludeShowtimeId, $startTime, $startTime, $endTime, $endTime, $startTime, $endTime]);
    return $stmt->fetch();
}

// 1. GET Showtimes
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id > 0) {
        $stmt = $pdo->prepare("
            SELECT s.*, m.title as movie_title, m.poster_url, m.duration_minutes,
                   sc.screen_name, sc.screen_type, t.theater_id, t.name as cinema_name, t.location
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN screens sc ON s.screen_id = sc.screen_id
            JOIN theaters t ON sc.theater_id = t.theater_id
            WHERE s.showtime_id = ?
        ");
        $stmt->execute([$id]);
        $show = $stmt->fetch();
        if (!$show) send_response(404, false, 'Showtime not found');
        send_response(200, true, 'Showtime retrieved', $show);
    }

    $movieId = isset($_GET['movie_id']) && (int)$_GET['movie_id'] > 0 ? (int)$_GET['movie_id'] : null;
    $cinemaId = isset($_GET['cinema_id']) && (int)$_GET['cinema_id'] > 0 ? (int)$_GET['cinema_id'] : null;
    $date = isset($_GET['date']) && !empty($_GET['date']) ? $_GET['date'] : null;

    $sql = "
        SELECT s.*, 
               m.title as movie_title, m.poster_url, m.duration_minutes, m.rating as movie_rating,
               sc.screen_name, sc.screen_type, sc.total_seats,
               t.theater_id, t.name as cinema_name, t.location,
               COUNT(DISTINCT b.booking_id) as total_bookings,
               COUNT(DISTINCT bs.seat_id) as booked_seats_count
        FROM showtimes s
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN screens sc ON s.screen_id = sc.screen_id
        JOIN theaters t ON sc.theater_id = t.theater_id
        LEFT JOIN bookings b ON s.showtime_id = b.showtime_id AND b.booking_status != 'cancelled'
        LEFT JOIN booking_seats bs ON b.booking_id = bs.booking_id
        WHERE 1=1
    ";
    $params = [];

    if ($movieId) {
        $sql .= " AND s.movie_id = ?";
        $params[] = $movieId;
    }
    if ($cinemaId) {
        $sql .= " AND sc.theater_id = ?";
        $params[] = $cinemaId;
    }
    if ($date) {
        $sql .= " AND s.show_date = ?";
        $params[] = $date;
    }

    $sql .= " GROUP BY s.showtime_id ORDER BY s.show_date DESC, s.start_time ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $showtimes = $stmt->fetchAll();

    foreach ($showtimes as &$st) {
        $st['ticket_price'] = (float)$st['ticket_price'];
        $st['total_seats'] = (int)$st['total_seats'];
        $st['booked_seats_count'] = (int)$st['booked_seats_count'];
        $st['available_seats'] = max(0, $st['total_seats'] - $st['booked_seats_count']);
    }

    send_response(200, true, 'Showtimes retrieved', $showtimes);
}

// 2. POST - Add Showtime
if ($method === 'POST') {
    $input = get_json_input();
    $movieId = (int)($input['movie_id'] ?? 0);
    $screenId = (int)($input['screen_id'] ?? 0);
    $showDate = $input['show_date'] ?? date('Y-m-d');
    $startTime = $input['start_time'] ?? '';
    $endTime = $input['end_time'] ?? '';
    $price = (float)($input['ticket_price'] ?? 15.00);

    if ($movieId <= 0 || $screenId <= 0 || empty($startTime)) {
        send_response(400, false, 'Movie, Screen, Show date and start time are required');
    }

    // Auto calculate end time if not provided
    if (empty($endTime)) {
        $mStmt = $pdo->prepare("SELECT duration_minutes FROM movies WHERE movie_id = ?");
        $mStmt->execute([$movieId]);
        $duration = (int)($mStmt->fetchColumn() ?: 120);
        $endTime = date('H:i:s', strtotime($startTime) + ($duration + 20) * 60); // 20m buffer
    }

    // Check conflict
    $conflict = check_showtime_conflict($pdo, $screenId, $showDate, $startTime, $endTime);
    if ($conflict) {
        send_response(409, false, "Hall conflict: Movie '{$conflict['movie_title']}' is already scheduled from {$conflict['start_time']} to {$conflict['end_time']}", [
            'conflict' => $conflict
        ]);
    }

    $stmt = $pdo->prepare("INSERT INTO showtimes (movie_id, screen_id, show_date, start_time, end_time, ticket_price) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$movieId, $screenId, $showDate, $startTime, $endTime, $price]);
    send_response(201, true, 'Showtime scheduled successfully', ['showtime_id' => $pdo->lastInsertId()]);
}

// 3. PUT - Edit Showtime
if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'edit')) {
    $input = get_json_input();
    $id = (int)($input['showtime_id'] ?? $input['id'] ?? $_GET['id'] ?? 0);
    $movieId = (int)($input['movie_id'] ?? 0);
    $screenId = (int)($input['screen_id'] ?? 0);
    $showDate = $input['show_date'] ?? date('Y-m-d');
    $startTime = $input['start_time'] ?? '';
    $endTime = $input['end_time'] ?? '';
    $price = (float)($input['ticket_price'] ?? 15.00);

    if ($id <= 0) send_response(400, false, 'Valid showtime ID is required');

    // Conflict check
    $conflict = check_showtime_conflict($pdo, $screenId, $showDate, $startTime, $endTime, $id);
    if ($conflict) {
        send_response(409, false, "Hall conflict: Movie '{$conflict['movie_title']}' already scheduled at {$conflict['start_time']}", [
            'conflict' => $conflict
        ]);
    }

    $stmt = $pdo->prepare("UPDATE showtimes SET movie_id = ?, screen_id = ?, show_date = ?, start_time = ?, end_time = ?, ticket_price = ? WHERE showtime_id = ?");
    $stmt->execute([$movieId, $screenId, $showDate, $startTime, $endTime, $price, $id]);
    send_response(200, true, 'Showtime updated successfully');
}

// 4. DELETE Showtime
if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = (int)($_GET['id'] ?? get_json_input()['showtime_id'] ?? 0);
    if ($id <= 0) send_response(400, false, 'Invalid showtime ID');
    $stmt = $pdo->prepare("DELETE FROM showtimes WHERE showtime_id = ?");
    $stmt->execute([$id]);
    send_response(200, true, 'Showtime deleted successfully');
}
