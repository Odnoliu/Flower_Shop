<?php 

namespace App\Routes;

use App\Controllers\ProductController;

class ProductRoutes
{
    private $controller;

    public function __construct()
    {
        $this->controller = new ProductController();
    }

    public function handle($method, $path)
    {
        if ($path == '/product') {
            if ($method == 'GET') {
                $this->controller->index();
                return;
            }
            if ($method == 'POST') {
                $this->controller->createProduct();
                return;
            }
        }

        if (preg_match('#^/product/(.+)$#', $path, $matches)) {
            $keyword = urldecode($matches[1]); 

            if ($method == 'GET') {
                $this->controller->readProductByInfo($keyword);
                return;
            }

            if ($method == 'PUT' || $method == 'DELETE') {
                if (!is_numeric($keyword) || $keyword <= 0) {
                    $this->notFound();
                    return;
                }
                $id = (int)$keyword;

                if ($method == 'PUT') {
                    $this->controller->updateProduct($id);
                } else {
                    $this->controller->deleteProduct($id);
                }
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