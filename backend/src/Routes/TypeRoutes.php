<?php 

namespace App\Routes;

use App\Controllers\TypeController;

class TypeRoutes
{
    private $controller;

    public function __construct()
    {
        $this->controller = new TypeController();
    }

    public function handle($method, $path)
    {

        if ($path == '/type') {
            if ($method == 'GET') {
                $this->controller->index();
                return;
            }
            if ($method == 'POST') {
                $this->controller->createType();
                return;
            }
        }

        if (preg_match('#^/type/(.+)$#', $path, $matches)) {
            $keyword = urldecode($matches[1]);

            if ($method == 'GET') {
                $this->controller->readTypeByInfo($keyword);
                return;
            }
            if ($method == 'PUT') {
                $this->controller->updateType($keyword);
                return;
            }
            if ($method == 'DELETE') {
                $this->controller->deleteType($keyword);
                return;
            }
        }

        $this->notFound();
    }

    private function notFound()
    {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Route not found']);
        exit;
    }
}