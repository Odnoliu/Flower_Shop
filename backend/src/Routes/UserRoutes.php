<?php 

namespace App\Routes;

use App\Controllers\UserController;

class UserRoutes
{
    private $controller;

    public function __construct()
    {
        $this->controller = new UserController();
    }

    public function handle($method, $path)
    {
        if ($path == '/user') {
            if ($method == 'GET') {
                $this->controller->index();
                return;
            }
            if ($method == 'POST') {
                $this->controller->createUser();
                return;
            }
        }

        if (preg_match('#^/user/(.+)$#', $path, $matches)) {
            $keyword = urldecode($matches[1]);

            if ($method == 'GET') {
                $this->controller->readUserByInfo($keyword);
                return;
            }

            if ($method == 'PUT' || $method == 'DELETE') {
                if (!preg_match('/^\d{10}$/', $keyword)) { // a phone number has 10 digits, this IF checks that condition
                    $this->notFound();
                    return;
                }
                $phone = $keyword;
                if ($method == 'PUT') {
                    $this->controller->updateUser($phone);
                } else {
                    $this->controller->deleteUser($phone);
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