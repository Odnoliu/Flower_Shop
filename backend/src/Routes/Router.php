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
            '#^/authorized(/.*)?$#'    => AuthorizedRoutes::class,
            '#^/account(/.*)?$#'       => AccountRoutes::class,
            '#^/ward(/.*)?$#'          => WardRoutes::class,
            '#^/user(/.*)?$#'          => UserRoutes::class,
            '#^/order/(\d+)/detail(/.*)?$#' => OrderDetailRoutes::class,
            '#^/order(/.*)?$#'         => OrderRoutes::class,
            '#^/cart(/.*)?$#'          => CartRoutes::class,
            // Add new route here >>
        ];

        foreach ($routes as $pattern => $class) {
            if (preg_match($pattern, $requestPath)) {
                $handler = new $class();
                $handler->handle($requestMethod, $requestPath);
                return;
            }
        }

        if(preg_match('#^/user(/.*)?$#', $requestPath)){
            $userRoutes = new UserRoutes();
            $userRoutes->handle($requestMethod, $requestPath);
            return;
        }

        if (preg_match('#^/users/email/.+$#', $requestPath)) {
            $userRoutes = new UserRoutes();
            $userRoutes->handle($requestMethod, $requestPath);
            return;
        }

        if(preg_match('#^/ward(/.*)?$#', $requestPath)){
            $wardRoutes = new WardRoutes();
            $wardRoutes->handle($requestMethod, $requestPath);
            return;
        }

        if (preg_match('#^/address(/.*)?$#', $requestPath)) {
            $addressRoutes = new AddressRoutes();
            $addressRoutes->handle($requestMethod, $requestPath);
            return;
        }

        if (preg_match('#^/status(/.*)?$#', $requestPath)) {
            $statusRoutes = new StatusRoutes();
            $statusRoutes->handle($requestMethod, $requestPath);
            return;
        }        

        if (preg_match('#^/price(/.*)?$#', $requestPath)) {
            $priceRoutes = new PriceRoutes();
            $priceRoutes->handle($requestMethod, $requestPath);
            return;
        }

        if (preg_match('#^/image(/.*)?$#', $requestPath)) {
            $imageRoutes = new ImageRoutes();
            $imageRoutes->handle($requestMethod, $requestPath);
            return;
        }

        if (preg_match('#^/type(/.*)?$#', $requestPath)) {
            $typeRoutes = new TypeRoutes();
            $typeRoutes->handle($requestMethod, $requestPath);
            return;
        }
        // 2. Sau này thêm route khác ở đây...
        // Ví dụ: ProductRoutes, UserRoutes,...

        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'API endpoint not found']);
        exit;
    }
}