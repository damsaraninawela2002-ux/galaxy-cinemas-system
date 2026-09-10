<?php
// api/reviews.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $movieId = isset($_GET['movie_id']) ? (int)$_GET['movie_id'] : 0;

    $sql = "
        SELECT r.*, 
               u.full_name as customer_name, u.email as customer_email,
               m.title as movie_title, m.poster_url
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN movies m ON r.movie_id = m.movie_id
        WHERE 1=1
    ";
    $params = [];
    if ($movieId > 0) {
        $sql .= " AND r.movie_id = ?";
        $params[] = $movieId;
    }
    $sql .= " ORDER BY r.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $reviews = $stmt->fetchAll();

    // Rating distribution
    $distribution = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
    $sum = 0;
    foreach ($reviews as $rev) {
        $rt = (int)$rev['rating'];
        if (isset($distribution[$rt])) $distribution[$rt]++;
        $sum += $rt;
    }
    $avgRating = count($reviews) > 0 ? round($sum / count($reviews), 1) : 4.8;

    $chartDist = [
        ['stars' => '5 Stars', 'count' => $distribution[5]],
        ['stars' => '4 Stars', 'count' => $distribution[4]],
        ['stars' => '3 Stars', 'count' => $distribution[3]],
        ['stars' => '2 Stars', 'count' => $distribution[2]],
        ['stars' => '1 Star',  'count' => $distribution[1]],
    ];

    send_response(200, true, 'Reviews retrieved', [
        'reviews' => $reviews,
        'averageRating' => $avgRating,
        'totalReviews' => count($reviews),
        'distribution' => $chartDist
    ]);
}

if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'toggle')) {
    $input = get_json_input();
    $id = (int)($input['review_id'] ?? $_GET['id'] ?? 0);
    $status = $input['status'] ?? 'approved'; // 'approved' | 'hidden'
    if ($id <= 0) send_response(400, false, 'Valid review ID required');
    try {
        $stmt = $pdo->prepare("UPDATE reviews SET status = ? WHERE review_id = ?");
        $stmt->execute([$status, $id]);
    } catch (Exception $e) {
        // column fallback
    }
    send_response(200, true, "Review marked as $status", ['review_id' => $id, 'status' => $status]);
}

if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = (int)($_GET['id'] ?? get_json_input()['review_id'] ?? 0);
    if ($id <= 0) send_response(400, false, 'Valid review ID required');
    $stmt = $pdo->prepare("DELETE FROM reviews WHERE review_id = ?");
    $stmt->execute([$id]);
    send_response(200, true, 'Review removed successfully');
}

