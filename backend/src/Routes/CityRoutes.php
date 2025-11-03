<?php
// src/routes/city.php

namespace App\Routes;

use App\Controllers\CityController;

class CityRoutes {
    private $controller;

    public function __construct() {
        $this->controller = new CityController();
    }

    public function handle($method, $path) {
    
        if ($path == '/city') {
            if ($method == 'GET') {
                $this->controller->index();
            } elseif ($method == 'POST') {
                $this->controller->city_create();
            }
        }

        // /cities/123
        if (preg_match('#^/city/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];

            if ($method == 'GET') {
                $this->controller->city_readById($id);
            } elseif ($method == 'PUT') {
                $this->controller->city_update($id);
            } elseif ($method == 'DELETE') {
                $this->controller->city_delete($id);
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        exit;
    }
}