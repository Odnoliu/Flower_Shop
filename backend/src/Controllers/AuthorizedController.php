<?php

namespace App\Controllers;

use App\Models\AuthorizedModel;

class AuthorizedController {
    private $model;

    public function __construct() {
        $this->model = new AuthorizedModel();
    }

    public function index() {
        $cities = $this->model->readAll();
        $this->jsonResponse($cities);
    }
    
    public function createAuthorized(){
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['ACCOUNT_Id']) && !empty($data['ACCOUNT_Id']) &&
            isset($data['AUTHORIZATION_Id']) && !empty($data['AUTHORIZATION_Id'])) {
            $this->model->create($data['ACCOUNT_Id'], $data['AUTHORIZATION_Id']);
            $this->jsonResponse([
                'success' => true,
                'ACCOUNT_Id' => $data['ACCOUNT_Id'],
                'AUTHORIZATION_Id' => $data['AUTHORIZATION_Id']
            ], 201);
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function readAuthorizedByAccountId($id) {
        $authorized = $this->model->readByAccountId($id);
        if ($authorized) {
            $this->jsonResponse($authorized);
        } else {
            $this->jsonResponse(['error' => 'Authorized not found'], 404);
        }
    }

    public function updateAuthorized($account_id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['AUTHORIZATION_Id']) && !empty($data['AUTHORIZATION_Id'])) {
            $success = $this->model->update($account_id, $data['AUTHORIZATION_Id']);
            if ($success) {
                $this->jsonResponse([
                    'success' => true,
                    'ACCOUNT_Id' => $account_id,
                    'AUTHORIZATION_Id' => $data['AUTHORIZATION_Id']
                ]);
            } else {
                $this->jsonResponse(['error' => 'Update failed'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function deleteAuthorized($id) {
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