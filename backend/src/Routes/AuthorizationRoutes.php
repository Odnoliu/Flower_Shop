<?php
// src/routes/authorization.php

namespace App\Routes;

use App\Controllers\AuthorizationController;

class AuthorizationRoutes {
    private $controller;

    public function __construct() {
        $this->controller = new AuthorizationController();
    }

    public function handle($method, $path) {
    
        if ($path == '/authorization') {
            if ($method == 'GET') {
                $this->controller->index();
            } elseif ($method == 'POST') {
                $this->controller->authorization_create();
            }
        }

        // /cities/123
        if (preg_match('#^/authorization/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];

            if ($method == 'GET') {
                $this->controller->authorization_readById($id);
            } elseif ($method == 'PUT') {
                $this->controller->authorization_update($id);
            } elseif ($method == 'DELETE') {
                $this->controller->authorization_delete($id);
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        exit;
    }
}