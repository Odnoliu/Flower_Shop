<?php

namespace App\Controllers;

use App\Models\ImageModel;

class ImageController {
    private $model;

    public function __construct(){
        $this->model = new ImageModel();
    }


    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public function index(){
        $result = $this->model->readAll();
        foreach ($result['images'] as &$image) {
            if (!empty($image['IMAGE_Image'])) {
                $image['IMAGE_Image'] = 'data:image/png;base64,' . base64_encode($image['IMAGE_Image']);
            } else {
                $image['IMAGE_Image'] = null;
            }
        }

        $this->jsonResponse($result);
    }

    public function createImage()
    {
        if (!empty($_FILES['IMAGE_Image']) && $_FILES['IMAGE_Image']['error'] == UPLOAD_ERR_OK) {
            $tmp = $_FILES['IMAGE_Image']['tmp_name'];
            $imageBinary = file_get_contents($tmp);
            $productId = isset($_POST['PRODUCT_Id']) ? (int)$_POST['PRODUCT_Id'] : null;

            if ($productId == null || $productId <= 0) {
                $this->jsonResponse(['error' => 'PRODUCT_Id is required and must be valid (form-data)'], 400);
            }

            $created = $this->model->create($imageBinary, $productId);
            if ($created) {
                $this->jsonResponse(['success' => true, 'PRODUCT_Id' => $productId], 201);
            } else {
                $this->jsonResponse(['error' => 'Create failed'], 500);
            }
            return;
        }

        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!empty($raw) && json_last_error() != JSON_ERROR_NONE) {
            $this->jsonResponse(['error' => 'Invalid JSON body', 'json_error' => json_last_error_msg()], 400);
        }

        if ($data && isset($data['IMAGE_Image']) && isset($data['PRODUCT_Id'])) {
            $productId = (int)$data['PRODUCT_Id'];
            if ($productId <= 0) {
                $this->jsonResponse(['error' => 'PRODUCT_Id must be a positive integer'], 400);
            }

            $imageInput = $data['IMAGE_Image'];

            // HÀM GIẢI MÃ: Hỗ trợ cả base64 thuần và data:image/...
            $imageBinary = $this->decodeImageData($imageInput);
            if ($imageBinary == false) {
                $this->jsonResponse(['error' => 'IMAGE_Image is not valid (must be base64 or data:image/...;base64,...)'], 400);
            }

            $created = $this->model->create($imageBinary, $productId);
            if ($created) {
                $this->jsonResponse(['success' => true, 'PRODUCT_Id' => $productId], 201);
            } else {
                $this->jsonResponse(['error' => 'Create failed'], 500);
            }
            return;
        }

        $this->jsonResponse([
            'error' => 'Invalid request',
            'hint' => 'Use multipart/form-data (file + PRODUCT_Id) or application/json (IMAGE_Image base64 + PRODUCT_Id)'
        ], 400);
    }

    private function decodeImageData($input)
    {
        $input = trim($input);
        if (preg_match('#^data:image/(\w+);base64,(.*)$#i', $input, $matches)) {
            $base64 = $matches[2];
        }
        else {
            $base64 = $input;
        }

        $binary = base64_decode($base64, true);
        return $binary !== false ? $binary : false;
    }

    public function readImageById($id){
        $image = $this->model->readById($id);
        if (!empty($image['IMAGE_Image'])) {
            $image['IMAGE_Image'] = 'data:image/png;base64,' . base64_encode($image['IMAGE_Image']);
        } else {
            $image['IMAGE_Image'] = null;
        }
        $this->jsonResponse($image);
    }

    public function readImageByProduct($productId)
    {
        if (!is_numeric($productId) || $productId <= 0) {
            $this->jsonResponse(['error' => 'Invalid PRODUCT_Id'], 400);
        }

        $result = $this->model->readByProduct((int)$productId);

        // BÂY GIỜ $result['images'] LÀ MẢNG → foreach() HOÀN TOÀN OK
        foreach ($result['images'] as &$image) {
            if (!empty($image['IMAGE_Image'])) {
                $image['IMAGE_Image'] = 'data:image/png;base64,' . base64_encode($image['IMAGE_Image']);
            } else {
                $image['IMAGE_Image'] = null;
            }
        }

        $this->jsonResponse($result);
    }

    public function updateImage($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid IMAGE_Id in URL'], 400);
        }
        $id = (int)$id;

        // === 2. Đọc JSON body ===
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!empty($raw) && json_last_error() !== JSON_ERROR_NONE) {
            $this->jsonResponse(['error' => 'Invalid JSON', 'detail' => json_last_error_msg()], 400);
        }

        if (!$data) {
            $this->jsonResponse(['error' => 'Request body is required'], 400);
        }

        // === 3. Validate PRODUCT_Id ===
        if (!isset($data['PRODUCT_Id']) || !is_numeric($data['PRODUCT_Id']) || $data['PRODUCT_Id'] <= 0) {
            $this->jsonResponse(['error' => 'PRODUCT_Id is required and must be a positive integer'], 400);
        }
        $productId = (int)$data['PRODUCT_Id'];

        // === 4. Xử lý IMAGE_Image (có thể null hoặc base64) ===
        $imageBinary = null;

        if (isset($data['IMAGE_Image']) && $data['IMAGE_Image'] !== null) {
            $imageInput = $data['IMAGE_Image'];

            // Hỗ trợ: data:image/png;base64,... hoặc base64 thuần
            $imageBinary = $this->decodeImageData($imageInput);
            if ($imageBinary === false) {
                $this->jsonResponse(['error' => 'IMAGE_Image is not valid base64'], 400);
            }
        }
        // Nếu IMAGE_Image = null → xóa ảnh

        // === 5. Gọi Model để cập nhật ===
        $success = $this->model->update($id, $imageBinary, $productId);

        if ($success) {
            $this->jsonResponse([
                'success' => true,
                'message' => 'Image updated successfully',
                'IMAGE_Id' => $id,
                'PRODUCT_Id' => $productId
            ], 200);
        } else {
            $this->jsonResponse(['error' => 'Update failed. Image not found or database error.'], 500);
        }
    }



    // Delete image
    public function deleteImage($id){
        if (!is_numeric($id)) $this->jsonResponse(['error' => 'Invalid id'], 400);

        $success = $this->model->delete((int)$id);
        if ($success) $this->jsonResponse(['success' => true]);
        else $this->jsonResponse(['error' => 'Delete failed'], 500);
    }
}
