<?php

namespace App\Controllers;

use App\Models\ProductModel;

class ProductController
{
    private $model;

    public function __construct()
    {
        $this->model = new ProductModel();
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

        foreach ($result['products'] as &$product) {
            if (!empty($product['PRODUCT_Avartar'])) {
                $product['PRODUCT_Avartar'] = 'data:image/png;base64,' . base64_encode($product['PRODUCT_Avartar']);
            } else {
                $product['PRODUCT_Avartar'] = null;
            }
        }

        $this->jsonResponse($result);
    }

    public function createProduct()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (
            isset($data['PRODUCT_Name']) && !empty(trim($data['PRODUCT_Name'])) &&
            isset($data['TYPE_Id']) && is_numeric($data['TYPE_Id']) && $data['TYPE_Id'] > 0
        ) {
            $name = trim($data['PRODUCT_Name']);
            $typeId = (int)$data['TYPE_Id'];
            $avatar = null;

            if (isset($data['PRODUCT_Avartar']) && !empty($data['PRODUCT_Avartar'])) {
                $avatar = $this->decodeBase64Image($data['PRODUCT_Avartar']);
                if ($avatar == false) {
                    $this->jsonResponse(['error' => 'Invalid image format'], 400);
                }
            }

            $id = $this->model->create($name, $avatar, $typeId);

            $this->jsonResponse([
                'success' => true,
                'PRODUCT_Id' => (int)$id,
                'PRODUCT_Name' => $name,
                'TYPE_Id' => $typeId
            ], 201);
        } else {
            $this->jsonResponse(['error' => 'Invalid or missing data'], 400);
        }
    }

    public function readProductByInfo($keyword)
    {
        $products = $this->model->readByInfo($keyword);

        if (!empty($products)) {
            foreach ($products as &$p) {
                if (!empty($p['PRODUCT_Avartar'])) {
                    $p['PRODUCT_Avartar'] = 'data:image/png;base64,' . base64_encode($p['PRODUCT_Avartar']);
                }
            }
            $this->jsonResponse($products);
        } else {
            $this->jsonResponse(['error' => 'Product not found'], 404);
        }
    }

    public function updateProduct($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid ID'], 400);
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (
            isset($data['PRODUCT_Name']) && !empty(trim($data['PRODUCT_Name'])) &&
            isset($data['TYPE_Id']) && is_numeric($data['TYPE_Id']) && $data['TYPE_Id'] > 0
        ) {
            $name = trim($data['PRODUCT_Name']);
            $typeId = (int)$data['TYPE_Id'];
            $avatar = null;

            if (isset($data['PRODUCT_Avartar']) && !empty($data['PRODUCT_Avartar'])) {
                $avatar = $this->decodeBase64Image($data['PRODUCT_Avartar']);
                if ($avatar == false) {
                    $this->jsonResponse(['error' => 'Invalid image format'], 400);
                }
            }

            $success = $this->model->update((int)$id, $name, $avatar, $typeId);

            if ($success) {
                $this->jsonResponse(['success' => true, 'message' => 'Product updated']);
            } else {
                $this->jsonResponse(['error' => 'Update failed or product not found'], 500);
            }
        } else {
            $this->jsonResponse(['error' => 'Invalid or missing data'], 400);
        }
    }

    public function deleteProduct($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            $this->jsonResponse(['error' => 'Invalid ID'], 400);
        }

        $success = $this->model->delete((int)$id);
        if ($success) {
            $this->jsonResponse(['success' => true, 'message' => 'Product deleted']);
        } else {
            $this->jsonResponse(['error' => 'Delete failed or product not found'], 500);
        }
    }

    private function decodeBase64Image($base64String)
    {
        if (!preg_match('#^data:image/(\w+);base64,(.+)$#', $base64String, $matches)) {
            return false;
        }

        $imageData = base64_decode($matches[2]);
        if ($imageData == false) {
            return false;
        }

        return $imageData;
    }
}
?>