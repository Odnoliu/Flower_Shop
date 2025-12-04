<?php

namespace App\Controllers;

use App\Models\CartModel;

class CartController {
    private $model;

    public function __construct() {
        $this->model = new CartModel();
    }

    public function index() {
        $carts = $this->model->readAll();
        $this->jsonResponse($carts);
    }
    
    public function createCart(){
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['ACCOUNT_Id']) && !empty($data['ACCOUNT_Id']) &&
            isset($data['PRODUCT_Id']) && !empty($data['PRODUCT_Id']) &&
            isset($data['CART_Quantity']) && !empty($data['CART_Quantity'])) {
            $id = $this->model->create($data['ACCOUNT_Id'], $data['PRODUCT_Id'], $data['CART_Quantity']);
            $this->jsonResponse([
                'success' => true,
                'CART_Id' => $id,
                'ACCOUNT_Id' => $data['ACCOUNT_Id'],
                'PRODUCT_Id' => $data['PRODUCT_Id'],
                'CART_Quantity' => $data['CART_Quantity']
            ], 201);
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function readCartById($id) {
        $cart = $this->model->readById($id);
        if ($cart) {
            $this->jsonResponse($cart);
        } else {
            $this->jsonResponse(['error' => 'Cart not found'], 404);
        }
    }

    public function updateQuantity($product_id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['CART_Quantity']) && !empty($data['CART_Quantity'])) {
            $success = $this->model->updateQuantity($product_id, $data['USER_Phone'],$data['CART_Quantity']);
            if ($success) {
                $this->jsonResponse([
                    'success' => true,
                    'PRODUCT_Id' => $product_id,
                    'CART_Quantity' => $data['CART_Quantity']
                ]);
            } else {
                $this->jsonResponse(['error' => 'Update failed'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function deleteCart($id) {
        $success = $this->model->deleteAll($id);
        if ($success) {
            $this->jsonResponse(['success' => true]);
        } else {
            $this->jsonResponse(['error' => 'Delete failed'], 500);
        }
    }
    // This function sends a JSON response with the given data and HTTP status code in case of format error
    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}