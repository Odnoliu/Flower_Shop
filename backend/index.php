<?php

// THÊM HEADER CORS NGAY ĐẦU FILE
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// XỬ LÝ PREFIGHT (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

require_once __DIR__ . '/src/routes/Router.php';
require_once __DIR__ . '/src/routes/AuthorizationRoutes.php';
require_once __DIR__ . '/src/routes/UserRoutes.php';
require_once __DIR__ . '/src/routes/CityRoutes.php';
require_once __DIR__ . '/src/routes/WardRoutes.php';

use App\Routes\Router;

$router = new Router();

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');

$router->dispatch($method, $uri);