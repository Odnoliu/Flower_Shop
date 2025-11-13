<?php

namespace App\Controllers;

use App\Models\ImageModel;

class ImageController {
    private $model;

    public function __construct(){
        $this->model = new ImageModel();
    }

    // JSON response helper
    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    // GET /image -> list metadata only
    public function index(){
        $images = $this->model->readAll();

        // Remove blob if present and keep lightweight metadata
        if (isset($images['images']) && is_array($images['images'])) {
            foreach ($images['images'] as &$img) {
                if (isset($img['IMAGE_Image'])) unset($img['IMAGE_Image']);
            }
        }

        $this->jsonResponse($images);
    }

    // Create image - supports JSON (base64) OR multipart/form-data (file)
    public function createImage(){
        // 1) multipart/form-data + file
        if (!empty($_FILES['IMAGE_Image']) && $_FILES['IMAGE_Image']['error'] === UPLOAD_ERR_OK) {
            $tmp = $_FILES['IMAGE_Image']['tmp_name'];
            $imageBinary = file_get_contents($tmp);
            $productId = isset($_POST['PRODUCT_Id']) ? (int)$_POST['PRODUCT_Id'] : null;

            if ($productId === null) {
                $this->jsonResponse(['error' => 'PRODUCT_Id is required (form-data)'], 400);
            }

            $created = $this->model->create($imageBinary, $productId);
            if ($created) $this->jsonResponse(['success' => true, 'PRODUCT_Id' => $productId], 201);
            else $this->jsonResponse(['error' => 'Create failed'], 500);
        }

        // 2) JSON body (base64)
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        // If body is present but invalid JSON, return.
        if (!empty($raw) && json_last_error() !== JSON_ERROR_NONE) {
            $this->jsonResponse(['error' => 'Invalid JSON body', 'json_error' => json_last_error_msg()], 400);
        }

        if ($data && isset($data['IMAGE_Image']) && isset($data['PRODUCT_Id'])) {
            $productId = (int)$data['PRODUCT_Id'];
            $imageBase64 = $data['IMAGE_Image'];

            $imageBinary = base64_decode($imageBase64, true);
            if ($imageBinary === false) {
                $this->jsonResponse(['error' => 'IMAGE_Image is not valid base64'], 400);
            }

            $created = $this->model->create($imageBinary, $productId);
            if ($created) $this->jsonResponse(['success' => true, 'PRODUCT_Id' => $productId], 201);
            else $this->jsonResponse(['error' => 'Create failed'], 500);
        }

        $this->jsonResponse(['error' => 'Invalid request. Send multipart/form-data (file) or application/json (base64).'], 400);
    }

    // GET /image/{id} where id is numeric -> return raw binary image directly
    // If id is not numeric, use readImageByInfo (search)
    public function readImageById($id){
        if (!is_numeric($id)) {
            $this->jsonResponse(['error' => 'Invalid id'], 400);
        }

        $record = $this->model->readImageById((int)$id);
        if (!$record) {
            $this->jsonResponse(['error' => 'Image not found'], 404);
        }

        if (!isset($record['IMAGE_Image']) || $record['IMAGE_Image'] === null) {
            $this->jsonResponse(['error' => 'Image binary not found'], 404);
        }

        $binary = $record['IMAGE_Image'];

        // Detect MIME type
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->buffer($binary);
        if ($mime === false) $mime = 'application/octet-stream';

        // Send binary directly
        http_response_code(200);
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . strlen($binary));
        if (isset($record['IMAGE_Id'])) {
            header('Content-Disposition: inline; filename="image_' . $record['IMAGE_Id'] . '"');
        }
        echo $binary;
        exit;
    }

    // GET /image/{keyword} where keyword is non-numeric -> search metadata
    public function readImageByInfo($keyword){
        $result = $this->model->readByInfo($keyword);
        if ($result) {
            foreach ($result as &$r) {
                if (isset($r['IMAGE_Image'])) unset($r['IMAGE_Image']);
            }
            $this->jsonResponse($result);
        } else {
            $this->jsonResponse(['error' => 'No records found'], 404);
        }
    }

    // Update image - supports JSON (base64) or multipart/form-data
    public function updateImage($id){
        if (!is_numeric($id)) {
            $this->jsonResponse(['error' => 'Invalid id'], 400);
        }
        $id = (int)$id;

        // Fetch current data
        $current = $this->model->readImageById($id);
        if (!$current) $this->jsonResponse(['error' => 'Image not found'], 404);

        // multipart/form-data
        if (!empty($_FILES['IMAGE_Image']) && $_FILES['IMAGE_Image']['error'] === UPLOAD_ERR_OK) {
            $tmp = $_FILES['IMAGE_Image']['tmp_name'];
            $imageBinary = file_get_contents($tmp);
            $productId = isset($_POST['PRODUCT_Id']) ? (int)$_POST['PRODUCT_Id'] : (int)$current['PRODUCT_Id'];

            $success = $this->model->update($id, $imageBinary, $productId);
            if ($success) $this->jsonResponse(['success' => true]);
            else $this->jsonResponse(['error' => 'Update failed'], 500);
        }

        // JSON body
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        if (!empty($raw) && json_last_error() !== JSON_ERROR_NONE) {
            $this->jsonResponse(['error' => 'Invalid JSON body', 'json_error' => json_last_error_msg()], 400);
        }

        if (empty($data) && empty($_FILES)) {
            $this->jsonResponse(['error' => 'No data to update'], 400);
        }

        $imageBinary = $current['IMAGE_Image'];
        $productId = (int)$current['PRODUCT_Id'];

        if (!empty($data)) {
            if (isset($data['IMAGE_Image']) && $data['IMAGE_Image'] !== '') {
                $decoded = base64_decode($data['IMAGE_Image'], true);
                if ($decoded === false) $this->jsonResponse(['error' => 'IMAGE_Image is not valid base64'], 400);
                $imageBinary = $decoded;
            }
            if (isset($data['PRODUCT_Id']) && $data['PRODUCT_Id'] !== '') {
                if (!is_numeric($data['PRODUCT_Id'])) $this->jsonResponse(['error' => 'PRODUCT_Id must be numeric'], 400);
                $productId = (int)$data['PRODUCT_Id'];
            }
        }

        $success = $this->model->update($id, $imageBinary, $productId);
        if ($success) $this->jsonResponse(['success' => true]);
        else $this->jsonResponse(['error' => 'Update failed'], 500);
    }

    // Delete image
    public function deleteImage($id){
        if (!is_numeric($id)) $this->jsonResponse(['error' => 'Invalid id'], 400);

        $success = $this->model->delete((int)$id);
        if ($success) $this->jsonResponse(['success' => true]);
        else $this->jsonResponse(['error' => 'Delete failed'], 500);
    }
}
