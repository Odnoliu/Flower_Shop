<?php
// src/routes/authorized.php

namespace App\Routes;

use App\Controllers\AuthorizedController;

class AuthorizedRoutes {
    private $controller;

    public function __construct() {
        $this->controller = new AuthorizedController();
    }

    public function handle($method, $path) {
    
        if ($path == '/authorized') {
            if ($method == 'GET') {
                $this->controller->index();
            } elseif ($method == 'POST') {
                $this->controller->createAuthorized();
            }
        }

        // /cities/123
        if (preg_match('#^/authorized/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];

            if ($method == 'GET') {
                $this->controller->readAuthorizedByAccountId($id);
            } elseif ($method == 'PUT') {
                $this->controller->updateAuthorized($id);
            } elseif ($method == 'DELETE') {
                $this->controller->deleteAuthorized($id);
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        exit;
    }
}