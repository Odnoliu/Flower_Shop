<?php

namespace App\Controllers;

use App\Models\TypeModel;

class TypeController
{
    private $model;

    public function __construct()
    {
        $this->model = new TypeModel();
    }

    private function jsonResponse($data, $status = 200)
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public function index()
    {
        $result = $this->model->readAll();
        $this->jsonResponse($result);
    }

    public function createType()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (
            isset($data['TYPE_Name']) &&
            is_string($data['TYPE_Name']) &&
            trim($data['TYPE_Name']) !== ''
        ) {
            $name = trim($data['TYPE_Name']);
            $id = $this->model->create($name);

            $this->jsonResponse([
                'success' => true,
                'TYPE_Id' => (int)$id,
                'TYPE_Name' => $name
            ], 201);
        } else {
            $this->jsonResponse(['error' => 'Invalid or missing TYPE_Name'], 400);
        }
    }

    public function readTypeByInfo($keyword)
    {
        $types = $this->model->readByInfo($keyword);

        if ($types) {
            $this->jsonResponse($types);
        } else {
            $this->jsonResponse(['error' => 'No types found'], 404);
        }
    }

    public function updateType($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid ID'], 400);
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (
            isset($data['TYPE_Name']) &&
            is_string($data['TYPE_Name']) &&
            trim($data['TYPE_Name']) !== ''
        ) {
            $name = trim($data['TYPE_Name']);
            $success = $this->model->update((int)$id, $name);

            if ($success) {
                $this->jsonResponse(['success' => true, 'message' => 'Type updated']);
            } else {
                $this->jsonResponse(['error' => 'Update failed or type not found'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid or missing TYPE_Name'], 400);
        }
    }

    public function deleteType($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid ID'], 400);
        }

        $success = $this->model->delete((int)$id);
        if ($success) {
            $this->jsonResponse(['success' => true, 'message' => 'Type deleted']);
        } else {
            $this->jsonResponse(['error' => 'Delete failed or type not found'], 500);
        }
    }
}
?>