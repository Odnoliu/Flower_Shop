<?php

namespace App\Controllers;

use App\Models\AddressModel;

class AddressController
{
    private $model;

    public function __construct(){
        $this->model = new AddressModel();
    }

    private function jsonResponse($data, $status = 200){
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public function index(){
        $addresses = $this->model->readAll();
        $this->jsonResponse($addresses);
    }

    public function createAddress(){
        $data = json_decode(file_get_contents('php://input'), true);

        if (
            isset($data['ADDRESS_Address']) 
            && !empty(trim($data['ADDRESS_Address'])) 
            && isset($data['ADDRESS_Description']) 
            && !empty(trim($data['ADDRESS_Description'])) 
            && isset($data['USER_Phone']) 
            && !empty($data['USER_Phone']) 
            && isset($data['WARD_Id']) 
            && is_numeric($data['WARD_Id'])
        ) {
            $this->model->create(
                $data['ADDRESS_Address'],
                $data['ADDRESS_Description'],
                $data['USER_Phone'],
                $data['WARD_Id']
            );
            $this->jsonResponse([
                'success' => true,
                'ADDRESS_Address' => $data['ADDRESS_Address'],
                'ADDRESS_Description' => $data['ADDRESS_Description'],
                'USER_Phone' => $data['USER_Phone'],
                'WARD_Id' => $data['WARD_Id']
            ]);
        } else {
            $this->jsonResponse(['error' => 'Invalid or missing data'], 400);
        }
    }

    public function readAddressById($id){
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid ID'], 400);
        }

        $address = $this->model->readById((int)$id);
        if ($address) {
            $this->jsonResponse($address);
        } else {
            $this->jsonResponse(['error' => 'Address not found'], 404);
        }
    }

    public function readAddressesByUserPhone($phone){
        if (!preg_match('/^\d{10}$/', $phone)) {
            $this->jsonResponse(['error' => 'Invalid phone format'], 400);
        }

        $addresses = $this->model->readByUserPhone($phone);
        if ($addresses) {
            $this->jsonResponse($addresses);
        } else {
            $this->jsonResponse(['error' => 'No addresses found for this user'], 404);
        }
    }

    public function updateAddress($id){
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid ID'], 400);
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (
            isset($data['ADDRESS_Address']) && !empty(trim($data['ADDRESS_Address'])) &&
            isset($data['ADDRESS_Description']) && !empty(trim($data['ADDRESS_Description'])) &&
            isset($data['USER_Phone']) && preg_match('/^\d{10}$/', $data['USER_Phone']) &&
            isset($data['WARD_Id']) && is_numeric($data['WARD_Id'])
        ) {
            $success = $this->model->update(
                (int)$id,
                $data['ADDRESS_Address'],
                $data['ADDRESS_Description'],
                $data['USER_Phone'],
                (int)$data['WARD_Id']
            );

            if ($success) {
                $this->jsonResponse(['success' => true, 'message' => 'Address updated']);
            } else {
                $this->jsonResponse(['error' => 'Update failed or address not found'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid or missing data'], 400);
        }
    }

    public function deleteAddress($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid ID'], 400);
        }

        $success = $this->model->delete((int)$id);
        if ($success) {
            $this->jsonResponse(['success' => true, 'message' => 'Address deleted']);
        } else {
            $this->jsonResponse(['error' => 'Delete failed or address not found'], 500);
        }
    }
}