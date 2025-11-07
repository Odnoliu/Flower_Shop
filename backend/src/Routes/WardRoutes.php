<?php

namespace App\Routes;

use App\Controllers\WardController;

class WardRoutes{
    private $controller;

    public function __construct(){
        $this->controller = new WardController();
    }

    public function handle($method, $path) {
    
        if ($path == '/ward') {
            if ($method == 'GET') {
                $this->controller->index();
            } elseif ($method == 'POST') {
                $this->controller->createWard();
            }
        }

        // /ward/123
        if (preg_match('#^/ward/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];

            if ($method == 'GET') {
                $this->controller->readWardById($id);
            } elseif ($method == 'PUT') {
                $this->controller->updateWard($id);
            } elseif ($method == 'DELETE') {
                $this->controller->deleteWard($id);
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        exit;
    }
}
?>

