<?php

namespace App\Routes;

use App\Controllers\PaymentController;

class PaymentRoutes
{
    private $controller;

    public function __construct()
    {
        $this->controller = new PaymentController();
    }

    public function handle($method, $path)
    {
        if ($path == '/payment/qr' && $method == 'POST') {
            $this->controller->createQR();
            return;
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }
}