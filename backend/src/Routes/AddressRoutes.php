<?php 

namespace App\Routes;

use App\Controllers\AddressController;

class AddressRoutes
{
    private $controller;

    public function __construct()
    {
        $this->controller = new AddressController();
    }

    public function handle($method, $path)
    {
        if ($path == '/address') {
            if ($method == 'GET') {
                $this->controller->index();
                return;
            }
            if ($method == 'POST') {
                $this->controller->createAddress();
                return;
            }
        }

        if (preg_match('#^/address/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];

            if ($method == 'GET') {
                $this->controller->readAddressById($id);
                return;
            }
            if ($method == 'PUT') {
                $this->controller->updateAddress($id);
                return;
            }
            if ($method == 'DELETE') {
                $this->controller->deleteAddress($id);
                return;
            }
        }

        if (preg_match('#^/address/user/(\d{10})$#', $path, $matches)) {
            $phone = $matches[1];

            if ($method == 'GET') {
                $this->controller->readAddressesByUserPhone($phone);
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