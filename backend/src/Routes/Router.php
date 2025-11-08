<?php

namespace App\Routes;

class Router
{
    public function dispatch($requestMethod, $requestPath)
    {
        $requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $requestPath = rtrim($requestPath, '/');
        //instead of writing a lot of IFs, make an array of routes and use a LOOP to handle the routes

        $routes = [
            '#^/city(/.*)?$#'          => CityRoutes::class,
            '#^/authorization(/.*)?$#' => AuthorizationRoutes::class,
            '#^/ward(/.*)?$#'          => WardRoutes::class,
            '#^/user(/.*)?$#'          => UserRoutes::class,
            // Add new route here >>
        ];

        foreach ($routes as $pattern => $class) {
            if (preg_match($pattern, $requestPath)) {
                $handler = new $class();
                $handler->handle($requestMethod, $requestPath);
                return;
            }
        }

        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'API endpoint not found']);
        exit;
    }
}