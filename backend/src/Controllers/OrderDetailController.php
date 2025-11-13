<?php

namespace App\Controllers;

use App\Models\OrderDetailModel;
use App\Models\PriceModel;
use App\Models\OrderModel;

class OrderDetailController {
    private $model;
    private $priceModel;
    private $orderModel;

    public function __construct() {
        $this->model = new OrderDetailModel();
        $this->priceModel = new PriceModel();
        $this->orderModel = new OrderModel();
    }

    public function index($order_id) {
        $orderdetail = $this->model->readAll($order_id);
        $this->jsonResponse($orderdetail);
    }
    
    public function createOrderDetail($order_id){
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['PRODUCT_Id']) && !empty($data['PRODUCT_Id']) &&
            isset($data['ORDERDETAIL_Quantity']) && !empty($data['ORDERDETAIL_Quantity'])) {
            
            $today = date('Y-m-d');
            $price = $this->priceModel->getPrice($data['PRODUCT_Id'], $today);
            $this->model->create($order_id, $data['PRODUCT_Id'], $data['ORDERDETAIL_Quantity'], $price);
            $total = $this->orderModel->getTotal($order_id);
            $this->orderModel->setTotal($order_id, $total);
            $this->jsonResponse([
                'success' => true,
                'ORDER_Id' => $order_id,
                'PRODUCT_Id' => $data['PRODUCT_Id'],
                'ORDERDETAIL_Quantity' => $data['ORDERDETAIL_Quantity'],
                'ORDERDETAIL_Price' => $price
            ], 201);
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function readOrderDetailsByProductId($order_id, $product_id) {
        $orderdetail = $this->model->readByProductId($order_id, $product_id);
        if ($orderdetail) {
            $this->jsonResponse($orderdetail);
        } else {
            $this->jsonResponse(['error' => 'OrderDetail not found'], 404);
        }
    }

    public function updateOrderDetail($order_id, $product_id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['ORDERDETAIL_Quantity']) && !empty($data['ORDERDETAIL_Quantity'])) {
            $success = $this->model->update($order_id, $product_id, $data['ORDERDETAIL_Quantity']);
            $total = $this->orderModel->getTotal($order_id);
            $this->orderModel->setTotal($order_id, $total);
            if ($success) {
                $this->jsonResponse([
                    'success' => true,
                    'ORDER_Id' => $order_id,
                    'PRODUCT_Id' => $product_id,
                    'ORDERDETAIL_Quantity' => $data['ORDERDETAIL_Quantity'],
                ]);
            } else {
                $this->jsonResponse(['error' => 'Update failed'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function deleteOrderDetail($order_id, $product_id) {
        $success = $this->model->delete($order_id, $product_id);
        $total = $this->orderModel->getTotal($order_id);
        $this->orderModel->setTotal($order_id, $total);
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