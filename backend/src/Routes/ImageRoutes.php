<?php

namespace App\Routes;

use App\Controllers\ImageController;

class ImageRoutes
{
    private $controller;

    public function __construct()
    {
        $this->controller = new ImageController();
    }

    public function handle($method, $path)
    {

        if ($path == '/image') {
            if ($method == 'GET') {
                $this->controller->index();
                return;
            }
            if ($method == 'POST') {
                $this->controller->createImage();
                return;
            }
        }

        if (preg_match('#^/image/id/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];
            if ($method == 'GET') {
                $this->controller->readImageById($id);
                return;
            }
            $this->notFound();
            return;
        }

        if (preg_match('#^/image/([^/]+)$#', $path, $matches)) {
            $keyword = urldecode($matches[1]);

            if ($method == 'GET') {
                $this->controller->readImageByInfo($keyword);
                return;
            }

            if ($method == 'PUT' || $method == 'DELETE') {
                if (!is_numeric($keyword)) {
                    $this->notFound();
                    return;
                }

                $id = (int)$keyword;

                if ($method == 'PUT') {
                    $this->controller->updateImage($id);
                    return;
                }

                if ($method == 'DELETE') {
                    $this->controller->deleteImage($id);
                    return;
                }
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
