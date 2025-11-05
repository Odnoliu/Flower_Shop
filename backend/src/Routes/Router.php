<?php

namespace App\Routes;

class Router {
    private $routes = [];

    public function add($method, $path, $handler) {
        $this->routes[] = compact('method', 'path', 'handler');
    }

    public function dispatch($requestMethod, $requestPath) {
    
        $requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $requestPath = rtrim($requestPath, '/');

        if (preg_match('#^/city(/.*)?$#', $requestPath)) {
            $cityRoutes = new CityRoutes();
            $cityRoutes->handle($requestMethod, $requestPath);
            return;
        }

        if (preg_match('#^/authorization(/.*)?$#', $requestPath)) {
            $authorizationRoutes = new AuthorizationRoutes();
            $authorizationRoutes->handle($requestMethod, $requestPath);
            return;
        }

        if(preg_match('#^/user(/.*)?$#', $requestPath)){
            $userRoutes = new UserRoutes();
            $userRoutes->handle($requestMethod, $requestPath);
            return;
        }
        // 2. Sau này thêm route khác ở đây...
        // Ví dụ: ProductRoutes, UserRoutes,...

        http_response_code(404);
        echo json_encode(['error' => 'API endpoint not found']);
    }
}