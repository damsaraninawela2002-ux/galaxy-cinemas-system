<?php
// api/settings.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET Settings
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
    $rows = $stmt->fetchAll();
    $settings = [];
    foreach ($rows as $r) {
        $settings[$r['setting_key']] = $r['setting_value'];
    }

    // Default fallbacks if empty
    $defaults = [
        'site_name' => 'Galaxy Cinema',
        'site_logo' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&auto=format&fit=crop&q=80',
        'currency_symbol' => '$',
        'tax_rate' => '8.5',
        'max_seats_per_booking' => '8',
        'cancellation_window_hours' => '2',
        'admin_email' => 'admin@galaxycinema.com',
        'contact_phone' => '+1 (555) 382-4400',
        'contact_address' => '49C, Rathnapura Road, Poruwadanda'
    ];
    $settings = array_merge($defaults, $settings);

    send_response(200, true, 'Settings retrieved', $settings);
}

// 2. POST / PUT - Update Settings
if ($method === 'POST' || $method === 'PUT') {
    $input = get_json_input();
    $stmt = $pdo->prepare("
        INSERT INTO settings (setting_key, setting_value) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");

    foreach ($input as $key => $val) {
        if (!is_array($val)) {
            $stmt->execute([$key, (string)$val]);
        }
    }

    send_response(200, true, 'Settings updated successfully');
}
