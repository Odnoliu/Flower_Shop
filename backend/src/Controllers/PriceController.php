<?php

namespace App\Controllers;

use App\Models\PriceModel;

class PriceController {
    private $model;

    public function __construct(){
        $this->model = new PriceModel();
    }

    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public function index(){
        $prices = $this->model->readAll();
        $this->jsonResponse($prices);
    }

    public function createPrice(){
        $data = json_decode(file_get_contents('php://input'), true);

        if (
            isset($data['PRICE_EffectiveDate']) && !empty($data['PRICE_EffectiveDate'])
            && isset($data['PRICE_UpdatedDate']) && !empty($data['PRICE_UpdatedDate'])
            && isset($data['PRICE_Price']) && (is_numeric($data['PRICE_Price']) || $data['PRICE_Price'] == "0" || $data['PRICE_Price'] == 0)
            && isset($data['PRODUCT_Id']) && is_numeric($data['PRODUCT_Id'])
        ) {
            $effectiveDate = $data['PRICE_EffectiveDate'];
            $updatedDate = $data['PRICE_UpdatedDate'];
            $price = $data['PRICE_Price'];
            $productId = (int)$data['PRODUCT_Id'];

            $created = $this->model->create($effectiveDate, $updatedDate, $price, $productId);
            if ($created) {
                $this->jsonResponse([
                    'success' => true,
                    'PRICE_EffectiveDate' => $effectiveDate,
                    'PRICE_UpdatedDate' => $updatedDate,
                    'PRICE_Price' => $price,
                    'PRODUCT_Id' => $productId
                ], 201);
            } else {
                $this->jsonResponse(['error' => 'Create failed (maybe duplicate primary key)'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function readPriceByInfo($keyword){
        $result = $this->model->readByInfo($keyword);
        if ($result) {
            $this->jsonResponse($result);
        } else {
            $this->jsonResponse(['error' => 'No records found'], 404);
        }
    }

    public function updatePrice($productId){
        $data = json_decode(file_get_contents('php://input'), true);

        if (
            isset($data['PRICE_UpdatedDate']) && !empty($data['PRICE_UpdatedDate'])
            && isset($data['PRICE_Price']) && (is_numeric($data['PRICE_Price']) || $data['PRICE_Price'] == "0" || $data['PRICE_Price'] === 0)
        ) {
            $updatedDate = $data['PRICE_UpdatedDate'];
            $price = $data['PRICE_Price'];
            $productIdInt = (int)$productId;

            $success = $this->model->update($productIdInt, $updatedDate, $price);
            if ($success) {
                $this->jsonResponse(['success' => true]);
            } else {
                $this->jsonResponse(['error' => 'Update failed'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function deletePrice($productId){
        $productIdInt = (int)$productId;
        $success = $this->model->delete($productIdInt);
        if ($success) {
            $this->jsonResponse(['success' => true]);
        } else {
            $this->jsonResponse(['error' => 'Delete failed'], 500);
        }
    }
}
