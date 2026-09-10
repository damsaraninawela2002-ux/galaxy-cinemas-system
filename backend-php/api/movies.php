<?php
// api/movies.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

// Ensure uploads folder exists
$uploadDir = __DIR__ . '/../uploads/posters/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// 1. GET Movies
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id > 0) {
        $stmt = $pdo->prepare("
            SELECT m.*, GROUP_CONCAT(DISTINCT g.genre_name SEPARATOR ', ') as genres,
                   GROUP_CONCAT(DISTINCT g.genre_id SEPARATOR ',') as genre_ids
            FROM movies m
            LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.genre_id
            WHERE m.movie_id = ?
            GROUP BY m.movie_id
        ");
        $stmt->execute([$id]);
        $movie = $stmt->fetch();
        if (!$movie) {
            send_response(404, false, 'Movie not found');
        }

        // Normalize genres
        $genresList = [];
        if (!empty($movie['genres'])) {
            $genresList = array_map('trim', explode(', ', $movie['genres']));
        } elseif (!empty($movie['genre'])) {
            $genresList = array_filter(array_map('trim', explode(',', $movie['genre'])));
        }
        $movie['genres'] = array_values($genresList);
        $movie['genre'] = array_values($genresList);
        $movie['genre_ids'] = !empty($movie['genre_ids']) ? array_map('intval', explode(',', $movie['genre_ids'])) : [];
        $movie['duration'] = (int)($movie['duration'] ?? $movie['duration_minutes'] ?? 120);
        $movie['duration_minutes'] = $movie['duration'];
        $movie['movie_id'] = (int)$movie['movie_id'];
        $movie['id'] = (int)$movie['movie_id'];

        send_response(200, true, 'Movie found', $movie);
    }

    $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;
    $status = isset($_GET['status']) && $_GET['status'] !== 'all' ? $_GET['status'] : null;
    $genreId = isset($_GET['genre_id']) && (int)$_GET['genre_id'] > 0 ? (int)$_GET['genre_id'] : null;

    $sql = "
        SELECT m.*, 
               GROUP_CONCAT(DISTINCT g.genre_name SEPARATOR ', ') as genres,
               GROUP_CONCAT(DISTINCT g.genre_id SEPARATOR ',') as genre_ids,
               COUNT(DISTINCT s.showtime_id) as total_showtimes
        FROM movies m
        LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.genre_id
        LEFT JOIN showtimes s ON m.movie_id = s.movie_id
        WHERE 1=1
    ";
    $params = [];

    if ($search) {
        $sql .= " AND (m.title LIKE ? OR m.cast LIKE ? OR m.language LIKE ? OR m.director LIKE ?)";
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }
    if ($status) {
        if ($status === 'coming_soon') {
            $sql .= " AND (m.status = 'coming_soon' OR m.status = 'upcoming')";
        } else {
            $sql .= " AND m.status = ?";
            $params[] = $status;
        }
    }
    if ($genreId) {
        $sql .= " AND m.movie_id IN (SELECT movie_id FROM movie_genres WHERE genre_id = ?)";
        $params[] = $genreId;
    }

    $sql .= " GROUP BY m.movie_id ORDER BY m.movie_id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $movies = $stmt->fetchAll();

    foreach ($movies as &$m) {
        $genresList = [];
        if (!empty($m['genres'])) {
            $genresList = array_map('trim', explode(', ', $m['genres']));
        } elseif (!empty($m['genre'])) {
            $genresList = array_filter(array_map('trim', explode(',', $m['genre'])));
        }
        $m['genres'] = array_values($genresList);
        $m['genre'] = array_values($genresList);
        $m['genre_ids'] = !empty($m['genre_ids']) ? array_map('intval', explode(',', $m['genre_ids'])) : [];
        $m['total_showtimes'] = (int)$m['total_showtimes'];
        $m['duration'] = (int)($m['duration'] ?? $m['duration_minutes'] ?? 120);
        $m['duration_minutes'] = $m['duration'];
        $m['movie_id'] = (int)$m['movie_id'];
        $m['id'] = (int)$m['movie_id'];
    }

    send_response(200, true, 'Movies retrieved', $movies);
}

// 2. Poster Upload
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'upload') {
    if (!isset($_FILES['poster']) || $_FILES['poster']['error'] !== UPLOAD_ERR_OK) {
        send_response(400, false, 'No file uploaded or upload error');
    }
    $file = $_FILES['poster'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($ext, $allowed)) {
        send_response(400, false, 'Invalid file type. Allowed: jpg, jpeg, png, webp');
    }
    $newFileName = 'poster_' . time() . '_' . uniqid() . '.' . $ext;
    $targetPath = $uploadDir . $newFileName;
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $url = 'http://localhost/galaxy_cinema_api/uploads/posters/' . $newFileName;
        send_response(200, true, 'File uploaded successfully', ['url' => $url]);
    } else {
        send_response(500, false, 'Failed to save uploaded file');
    }
}

// 3. POST - Add Movie
if ($method === 'POST') {
    $input = get_json_input();
    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? $input['synopsis'] ?? '');
    $duration = (int)($input['duration'] ?? $input['duration_minutes'] ?? 120);
    $language = trim($input['language'] ?? 'English');
    $releaseDate = !empty($input['release_date']) ? $input['release_date'] : date('Y-m-d');
    $posterUrl = trim($input['poster_url'] ?? '/images/1.jfif');
    $backdropUrl = trim($input['backdrop_url'] ?? $posterUrl);
    $trailerUrl = trim($input['trailer_url'] ?? '');
    $director = trim($input['director'] ?? '');
    $ageRating = trim($input['age_rating'] ?? 'PG-13');
    $rating = trim($input['rating'] ?? '4.5');
    $status = trim($input['status'] ?? 'now_showing');

    // Normalize cast
    $castInput = $input['cast'] ?? '';
    if (is_array($castInput)) {
        $cast = implode(', ', array_filter(array_map('trim', $castInput)));
    } else {
        $cast = trim((string)$castInput);
    }

    // Normalize genres
    $genresInput = $input['genres'] ?? $input['genre'] ?? [];
    if (is_string($genresInput)) {
        $genres = array_filter(array_map('trim', explode(',', $genresInput)));
        $genreStr = implode(', ', $genres);
    } elseif (is_array($genresInput)) {
        $genres = array_filter(array_map('trim', $genresInput));
        $genreStr = implode(', ', $genres);
    } else {
        $genres = [];
        $genreStr = '';
    }

    if (empty($title)) {
        send_response(400, false, 'Movie title is required');
    }

    $stmt = $pdo->prepare("
        INSERT INTO movies (title, description, duration, duration_minutes, language, release_date, poster_url, backdrop_url, trailer_url, director, age_rating, cast, genre, rating, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $title,
        $description,
        $duration,
        $duration,
        $language,
        $releaseDate,
        $posterUrl,
        $backdropUrl,
        $trailerUrl,
        $director,
        $ageRating,
        $cast,
        $genreStr,
        $rating,
        $status
    ]);
    $movieId = (int)$pdo->lastInsertId();

    // Link genres in movie_genres table
    if (!empty($genres)) {
        $gStmt = $pdo->prepare("INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)");
        foreach ($genres as $g) {
            $gid = is_numeric($g) ? (int)$g : null;
            if (!$gid) {
                // Find or insert genre by name
                $findG = $pdo->prepare("SELECT genre_id FROM genres WHERE genre_name = ?");
                $findG->execute([$g]);
                $gid = $findG->fetchColumn();
                if (!$gid) {
                    $insG = $pdo->prepare("INSERT INTO genres (genre_name) VALUES (?)");
                    $insG->execute([$g]);
                    $gid = (int)$pdo->lastInsertId();
                }
            }
            if ($gid) {
                $gStmt->execute([$movieId, $gid]);
            }
        }
    }

    send_response(201, true, 'Movie added successfully', [
        'movie_id' => $movieId,
        'id' => $movieId,
        'title' => $title
    ]);
}

// 4. PUT / PATCH - Edit Movie
if ($method === 'PUT' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'edit')) {
    $input = get_json_input();
    $movieId = (int)($input['movie_id'] ?? $input['id'] ?? $_GET['id'] ?? 0);
    if ($movieId <= 0) {
        send_response(400, false, 'Valid movie_id is required');
    }

    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? $input['synopsis'] ?? '');
    $duration = (int)($input['duration'] ?? $input['duration_minutes'] ?? 120);
    $language = trim($input['language'] ?? 'English');
    $releaseDate = !empty($input['release_date']) ? $input['release_date'] : date('Y-m-d');
    $posterUrl = trim($input['poster_url'] ?? '');
    $backdropUrl = trim($input['backdrop_url'] ?? $posterUrl);
    $trailerUrl = trim($input['trailer_url'] ?? '');
    $director = trim($input['director'] ?? '');
    $ageRating = trim($input['age_rating'] ?? 'PG-13');
    $rating = trim($input['rating'] ?? '4.5');
    $status = trim($input['status'] ?? 'now_showing');

    // Normalize cast
    $castInput = $input['cast'] ?? '';
    if (is_array($castInput)) {
        $cast = implode(', ', array_filter(array_map('trim', $castInput)));
    } else {
        $cast = trim((string)$castInput);
    }

    // Normalize genres
    $genresInput = $input['genres'] ?? $input['genre'] ?? [];
    if (is_string($genresInput)) {
        $genres = array_filter(array_map('trim', explode(',', $genresInput)));
        $genreStr = implode(', ', $genres);
    } elseif (is_array($genresInput)) {
        $genres = array_filter(array_map('trim', $genresInput));
        $genreStr = implode(', ', $genres);
    } else {
        $genres = [];
        $genreStr = '';
    }

    $stmt = $pdo->prepare("
        UPDATE movies 
        SET title = ?, description = ?, duration = ?, duration_minutes = ?, language = ?, release_date = ?, 
            poster_url = ?, backdrop_url = ?, trailer_url = ?, director = ?, age_rating = ?, cast = ?, genre = ?, rating = ?, status = ?
        WHERE movie_id = ?
    ");
    $stmt->execute([
        $title,
        $description,
        $duration,
        $duration,
        $language,
        $releaseDate,
        $posterUrl,
        $backdropUrl,
        $trailerUrl,
        $director,
        $ageRating,
        $cast,
        $genreStr,
        $rating,
        $status,
        $movieId
    ]);

    // Update genres in movie_genres
    if (!empty($genres)) {
        $pdo->prepare("DELETE FROM movie_genres WHERE movie_id = ?")->execute([$movieId]);
        $gStmt = $pdo->prepare("INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)");
        foreach ($genres as $g) {
            $gid = is_numeric($g) ? (int)$g : null;
            if (!$gid) {
                $findG = $pdo->prepare("SELECT genre_id FROM genres WHERE genre_name = ?");
                $findG->execute([$g]);
                $gid = $findG->fetchColumn();
                if (!$gid) {
                    $insG = $pdo->prepare("INSERT INTO genres (genre_name) VALUES (?)");
                    $insG->execute([$g]);
                    $gid = (int)$pdo->lastInsertId();
                }
            }
            if ($gid) {
                $gStmt->execute([$movieId, $gid]);
            }
        }
    }

    send_response(200, true, 'Movie updated successfully', ['movie_id' => $movieId]);
}

// 5. DELETE Movie
if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = (int)($_GET['id'] ?? get_json_input()['movie_id'] ?? get_json_input()['id'] ?? 0);
    if ($id <= 0) {
        send_response(400, false, 'Invalid movie ID');
    }

    // Clean up movie_genres relation
    $pdo->prepare("DELETE FROM movie_genres WHERE movie_id = ?")->execute([$id]);

    $stmt = $pdo->prepare("DELETE FROM movies WHERE movie_id = ?");
    $stmt->execute([$id]);

    send_response(200, true, 'Movie deleted successfully');
}
