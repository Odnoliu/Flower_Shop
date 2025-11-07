<?php

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();


require_once __DIR__ . '/src/routes/Router.php';
// require_once __DIR__ . '/src/routes/CityRoutes.php';
require_once __DIR__ . '/src/routes/AuthorizationRoutes.php';
require_once __DIR__ . '/src/routes/UserRoutes.php';

use App\Routes\Router;

$router = new Router();

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');

$router->dispatch($method, $uri);