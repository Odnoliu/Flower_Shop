<?php
// src/routes/order.php

namespace App\Routes;

use App\Controllers\OrderController;

class OrderRoutes {
    private $controller;

    public function __construct() {
        $this->controller = new OrderController();
    }

    public function handle($method, $path) {
    
        if ($path == '/order') {
            if ($method == 'GET') {
                $this->controller->index();
            } elseif ($method == 'POST') {
                $this->controller->createOrder();
            }
        }

        // /cities/123
        if (preg_match('#^/order/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];

            if ($method == 'GET') {
                $this->controller->readOrderById($id);
            } elseif ($method == 'PUT') {
                $this->controller->updateOrder($id);
            } elseif ($method == 'PATCH') {
                $this->controller->updateOrderStatus($id);
            } elseif ($method == 'DELETE') {
                $this->controller->deleteOrder($id);
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        exit;
    }
}