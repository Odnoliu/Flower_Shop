<?php

namespace App\Controllers;

use App\Models\CityModel;

class CityController {
    private $model;

    public function __construct() {
        $this->model = new CityModel();
    }

    public function index() {
        $cities = $this->model->readAll();
        $this->jsonResponse($cities);
    }
    
    public function createCity(){
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['CITY_Name']) && !empty($data['CITY_Name'])) {
            $id = $this->model->create($data['CITY_Name']);
            $this->jsonResponse(['success' => true, 'id' => $id], 201);
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function readCityById($id) {
        $city = $this->model->readById($id);
        if ($city) {
            $this->jsonResponse($city);
        } else {
            $this->jsonResponse(['error' => 'City not found'], 404);
        }
    }

    public function updateCity($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['CITY_Name']) && !empty($data['CITY_Name'])) {
            $success = $this->model->update($id, $data['CITY_Name']);
            if ($success) {
                $this->jsonResponse(['success' => true]);
            } else {
                $this->jsonResponse(['error' => 'Update failed'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid data'], 400);
        }
    }

    public function deleteCity($id) {
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