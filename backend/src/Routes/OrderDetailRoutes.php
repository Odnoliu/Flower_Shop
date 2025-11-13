<?php
// src/routes/orderDetail.php

namespace App\Routes;

use App\Controllers\OrderDetailController;

class OrderDetailRoutes {
    private $controller;

    public function __construct() {
        $this->controller = new OrderDetailController();
    }

    public function handle($method, $path) {
    
        if (preg_match('#^/order/(\d+)/detail$#', $path, $matches)) {
            $order_id = (int)$matches[1];

            if ($method == 'GET') {
                $this->controller->index($order_id);
            } elseif ($method == 'POST') {
                $this->controller->createOrderDetail($order_id);
            }
        }

        if (preg_match('#^/order/(\d+)/detail/(\d+)$#', $path, $matches)) {
            $order_id = (int)$matches[1];
            $product_id = (int)$matches[2];

            if ($method == 'GET') {
                $this->controller->readOrderDetailsByProductId($order_id, $product_id);
            } elseif ($method == 'PUT') {
                $this->controller->updateOrderDetail($order_id, $product_id);
            } elseif ($method == 'DELETE') {
                $this->controller->deleteOrderDetail($order_id, $product_id);
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        exit;
    }
}