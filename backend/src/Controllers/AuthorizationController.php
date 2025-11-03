<?php

namespace App\Controllers;

use App\Models\AuthorizationModel;

class AuthorizationController {
    private $model;

    public function __construct() {
        $this->model = new AuthorizationModel();
    }

    public function index() {
        $cities = $this->model->readAll();
        $this->jsonResponse($cities);
    }
    
    public function authorization_create(){
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['AUTHORIZATION_Name']) && !empty($data['AUTHORIZATION_Name'])) {
            $id = $this->model->create($data['AUTHORIZATION_Name']);
            $this->jsonResponse(['success' => true, 'id' => $id], 201);
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function authorization_readById($id) {
        $authorization = $this->model->readById($id);
        if ($authorization) {
            $this->jsonResponse($authorization);
        } else {
            $this->jsonResponse(['error' => 'Authorization not found'], 404);
        }
    }

    public function authorization_update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['AUTHORIZATION_Name']) && !empty($data['AUTHORIZATION_Name'])) {
            $success = $this->model->update($id, $data['AUTHORIZATION_Name']);
            if ($success) {
                $this->jsonResponse(['success' => true]);
            } else {
                $this->jsonResponse(['error' => 'Update failed'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function authorization_delete($id) {
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