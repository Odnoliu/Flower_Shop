<?php
// src/routes/cart.php

namespace App\Routes;

use App\Controllers\CartController;

class CartRoutes {
    private $controller;

    public function __construct() {
        $this->controller = new CartController();
    }

    public function handle($method, $path) {
    
        if ($path == '/cart') {
            if ($method == 'GET') {
                $this->controller->index();
            } elseif ($method == 'POST') {
                $this->controller->createCart();
            }
        }

        // /cities/123
        if (preg_match('#^/cart/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];

            if ($method == 'GET') {
                $this->controller->readCartById($id);
            } elseif ($method == 'PUT') {
                $this->controller->updateQuantity($id);
            } elseif ($method == 'DELETE') {
                $this->controller->deleteCart($id);
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        exit;
    }
}