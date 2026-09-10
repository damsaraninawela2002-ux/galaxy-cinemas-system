<?php
// helpers/response.php

function send_response($status_code, $success, $message = '', $data = null, $extra = []) {
    http_response_code($status_code);
    $response = array_merge([
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ], $extra);
    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit();
}

function get_json_input() {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}
