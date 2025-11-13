<?php

namespace App\Controllers;

use App\Models\OrderModel;
use App\Models\OrderDetailModel;

class OrderController {
    private $model;
    private $detailModel;

    public function __construct() {
        $this->model = new OrderModel();
        $this->detailModel = new OrderDetailModel();
    }

    public function index() {
        $orders = $this->model->readAll();
        $this->jsonResponse($orders);
    }
    
    public function createOrder(){
        $json = json_decode(file_get_contents('php://input'), true);
        $data = $json['data'];
        $detail = $json['detail'];
        if (isset($data['ORDER_CreatedDate']) && !empty($data['ORDER_CreatedDate']) &&
            isset($data['USER_Phone']) && !empty($data['USER_Phone']) &&
            isset($data['ORDER_Total']) && !empty($data['ORDER_Total'])) {
            $id = $this->model->create($data['ORDER_CreatedDate'], $data['USER_Phone'], $data['ORDER_Total']);
            

            if (!empty($detail) && is_array($detail)) {
                foreach ($detail as $item) {
                    if (
                        isset($item['PRODUCT_Id']) && !empty($item['PRODUCT_Id']) &&
                        isset($item['ORDERDETAIL_Quantity']) && !empty($item['ORDERDETAIL_Quantity']) &&
                        isset($item['ORDERDETAIL_Price']) && !empty($item['ORDERDETAIL_Price'])
                    ) {
                        $this->detailModel->create(
                            $id,
                            $item['PRODUCT_Id'],
                            $item['ORDERDETAIL_Quantity'],
                            $item['ORDERDETAIL_Price']
                        );
                    } else {
                        $this->model->delete($id); // Rollback order creation
                        $this->jsonResponse(['error' => 'Invalid detail'], 400);
                    }
                }
            }

            $this->jsonResponse([
                'success' => true,
                'ORDER_Id' => $id,
                'ORDER_CreatedDate' => $data['ORDER_CreatedDate'],
                'USER_Phone' => $data['USER_Phone'],
                'ORDER_Total' => $data['ORDER_Total'],
                'STATUS_Id' => 1
            ], 201);
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function readOrderById($id) {
        $order = $this->model->readById($id);
        if ($order) {
            $this->jsonResponse($order);
        } else {
            $this->jsonResponse(['error' => 'Order not found'], 404);
        }
    }

    public function updateOrder($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['ORDER_CreatedDate']) && !empty($data['ORDER_CreatedDate']) &&
            isset($data['USER_Phone']) && !empty($data['USER_Phone']) &&
            isset($data['ORDER_Total']) && !empty($data['ORDER_Total']) &&
            isset($data['STATUS_Id']) && !empty($data['STATUS_Id'])) {
            $success = $this->model->update($id, $data['USER_Phone'], $data['ORDER_Total'], $data['STATUS_Id']);
            if ($success) {
                $this->jsonResponse([
                    'success' => true,
                    'ORDER_Id' => $id,
                    'ORDER_CreatedDate' => $data['ORDER_CreatedDate'],
                    'USER_Phone' => $data['USER_Phone'],
                    'ORDER_Total' => $data['ORDER_Total'],
                    'STATUS_Id' => $data['STATUS_Id']
                ]);
            } else {
                $this->jsonResponse(['error' => 'Update failed'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function updateOrderStatus($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['STATUS_Id']) && !empty($data['STATUS_Id'])) {
            $success = $this->model->updateStatus($id, $data['STATUS_Id']);
            if ($success) {
                $this->jsonResponse([
                    'success' => true,
                    'ORDER_Id' => $id,
                    'STATUS_Id' => $data['STATUS_Id']
                ]);
            } else {
                $this->jsonResponse(['error' => 'Update failed'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function deleteOrder($id) {
        $success = $this->model->delete($id);
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