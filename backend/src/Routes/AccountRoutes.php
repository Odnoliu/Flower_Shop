<?php
// src/routes/account.php

namespace App\Routes;

use App\Controllers\AccountController;

class AccountRoutes {
    private $controller;

    public function __construct() {
        $this->controller = new AccountController();
    }

    public function handle($method, $path) {
    
        if ($path == '/account') {
            if ($method == 'GET') {
                $this->controller->index();
            } elseif ($method == 'POST') {
                $this->controller->createAccount();
            }
        }

        // /cities/123
        if (preg_match('#^/account/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];

            if ($method == 'GET') {
                $this->controller->readAccountById($id);
            } elseif ($method == 'PUT') {
                $this->controller->updateAccount($id);
            } elseif ($method == 'DELETE') {
                $this->controller->deleteAccount($id);
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        exit;
    }
}