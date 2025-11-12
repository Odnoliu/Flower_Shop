<?php

namespace App\Controllers;

use App\Models\StatusModel;

class StatusController
{
    private $model;

    public function __construct()
    {
        $this->model = new StatusModel();
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

    public function createStatus()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (
            isset($data['STATUS_Name']) &&
            is_string($data['STATUS_Name']) &&
            trim($data['STATUS_Name']) !== ''
        ) {
            $name = trim($data['STATUS_Name']);
            $id = $this->model->create($name);

            $this->jsonResponse([
                'success' => true,
                'STATUS_Id' => (int)$id,
                'STATUS_Name' => $name
            ], 201);
        } else {
            $this->jsonResponse(['error' => 'Invalid or missing STATUS_Name'], 400);
        }
    }

    public function readStatusById($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid ID'], 400);
        }

        $status = $this->model->readById((int)$id);
        if ($status) {
            $this->jsonResponse($status);
        } else {
            $this->jsonResponse(['error' => 'Status not found'], 404);
        }
    }

    public function searchStatusByName($keyword)
    {
        if (trim($keyword) === '') {
            $this->jsonResponse(['error' => 'Keyword cannot be empty'], 400);
        }

        $statuses = $this->model->readByName($keyword);
        if ($statuses) {
            $this->jsonResponse($statuses);
        } else {
            $this->jsonResponse(['error' => 'No statuses found'], 404);
        }
    }

    public function updateStatus($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid ID'], 400);
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (
            isset($data['STATUS_Name']) &&
            is_string($data['STATUS_Name']) &&
            trim($data['STATUS_Name']) !== ''
        ) {
            $name = trim($data['STATUS_Name']);
            $success = $this->model->update((int)$id, $name);

            if ($success) {
                $this->jsonResponse(['success' => true, 'message' => 'Status updated']);
            } else {
                $this->jsonResponse(['error' => 'Update failed or status not found'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid or missing STATUS_Name'], 400);
        }
    }

    public function deleteStatus($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid ID'], 400);
        }

        $success = $this->model->delete((int)$id);
        if ($success) {
            $this->jsonResponse(['success' => true, 'message' => 'Status deleted']);
        } else {
            $this->jsonResponse(['error' => 'Delete failed or status not found'], 500);
        }
    }
}