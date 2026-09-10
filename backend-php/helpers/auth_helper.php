<?php
// helpers/auth_helper.php

define('JWT_SECRET_KEY', 'galaxy_cinema_secret_jwt_admin_key_2024');

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4 === 0 ? strlen($data) : strlen($data) + (4 - strlen($data) % 4), '=', STR_PAD_RIGHT));
}

function generate_jwt($payload, $expire_seconds = 86400 * 7) {
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];
    $payload['exp'] = time() + $expire_seconds;
    $payload['iat'] = time();

    $header_encoded = base64url_encode(json_encode($header));
    $payload_encoded = base64url_encode(json_encode($payload));

    $signature = hash_hmac('sha256', "$header_encoded.$payload_encoded", JWT_SECRET_KEY, true);
    $signature_encoded = base64url_encode($signature);

    return "$header_encoded.$payload_encoded.$signature_encoded";
}

function verify_jwt($token) {
    if (!$token) return false;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    list($header_b64, $payload_b64, $signature_b64) = $parts;

    $signature = base64url_decode($signature_b64);
    $expected_signature = hash_hmac('sha256', "$header_b64.$payload_b64", JWT_SECRET_KEY, true);

    if (!hash_equals($signature, $expected_signature)) {
        return false;
    }

    $payload = json_decode(base64url_decode($payload_b64), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return false;
    }

    return $payload;
}

function get_auth_token() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }

    if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        return $matches[1];
    }
    return null;
}

function get_current_user_from_token() {
    $token = get_auth_token();
    if (!$token) return null;
    return verify_jwt($token);
}

function require_admin_auth() {
    $user = get_current_user_from_token();
    if (!$user || !isset($user['role']) || $user['role'] !== 'admin') {
        send_response(401, false, 'Unauthorized: Admin access required');
    }
    return $user;
}
