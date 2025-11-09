<?php

namespace App\Controllers;

use App\Models\AccountModel;

class AccountController {
    private $model;

    public function __construct() {
        $this->model = new AccountModel();
    }

    public function index() {
        $accounts = $this->model->readAll();
        $this->jsonResponse($accounts);
    }
    
    public function createAccount(){
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['USER_Phone']) && !empty($data['USER_Phone']) &&
            isset($data['ACCOUNT_Password']) && !empty($data['ACCOUNT_Password'])) {
            $id = $this->model->create($data['USER_Phone'], $data['ACCOUNT_Password']);
            $this->jsonResponse([
                'success' => true,
                'ACCOUNT_Id' => $id,
                'USER_Phone' => $data['USER_Phone'],
                'ACCOUNT_Password' => $data['ACCOUNT_Password']
            ], 201);
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function readAccountById($id) {
        $authorization = $this->model->readById($id);
        if ($authorization) {
            $this->jsonResponse($authorization);
        } else {
            $this->jsonResponse(['error' => 'Account not found'], 404);
        }
    }

    public function updateAccount($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['ACCOUNT_Password']) && !empty($data['ACCOUNT_Password'])) {
            $success = $this->model->update($id, $data['ACCOUNT_Password']);
            if ($success) {
                $this->jsonResponse([
                    'success' => true,
                    'ACCOUNT_Id' => $id,
                    'ACCOUNT_Password' => $data['ACCOUNT_Password']
                ]);
            } else {
                $this->jsonResponse(['error' => 'Update failed'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function deleteAccount($id) {
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