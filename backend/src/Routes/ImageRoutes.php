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
        // Exact /image -> list or create
        if ($path === '/image') {
            if ($method === 'GET') {
                $this->controller->index();
                return;
            }
            if ($method === 'POST') {
                $this->controller->createImage();
                return;
            }
        }

        // /image/id/{id} -> return raw binary image
        if (preg_match('#^/image/id/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];
            if ($method === 'GET') {
                $this->controller->readImageById($id);
                return;
            }
            // PUT/DELETE should use /image/{id} (without "id" segment)
            $this->notFound();
            return;
        }

        // /image/{keyword} -> search (GET) OR update/delete by numeric id (PUT/DELETE)
        if (preg_match('#^/image/([^/]+)$#', $path, $matches)) {
            $keyword = urldecode($matches[1]);

            if ($method === 'GET') {
                // search by keyword (could be numeric or text)
                $this->controller->readImageByInfo($keyword);
                return;
            }

            if ($method === 'PUT' || $method === 'DELETE') {
                // update/delete require numeric IMAGE_Id
                if (!is_numeric($keyword)) {
                    $this->notFound();
                    return;
                }

                $id = (int)$keyword;

                if ($method === 'PUT') {
                    $this->controller->updateImage($id);
                    return;
                }

                if ($method === 'DELETE') {
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
