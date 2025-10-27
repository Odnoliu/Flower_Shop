<?php
require_once __DIR__ . '/vendor/autoload.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Cho phép frontend React gọi API (CORS)

use App\Routes;

Routes\registerRoutes();