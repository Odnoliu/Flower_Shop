<?php
namespace App\Routes;

function registerRoutes() {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'];

    // Ví dụ route
    if ($uri === '/api/users' && $method === 'GET') {
        $controller = new \App\Controllers\UserController();
        $controller->index();
    } elseif ($uri === '/api/users' && $method === 'POST') {
        $controller = new \App\Controllers\UserController();
        $controller->create();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
    }
}