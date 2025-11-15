<?php

namespace App\Models;

use PDO;
use App\Config\Database;

class ImageModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    public function create($imageData, $productId) {
        $stmt = $this->pdo->prepare("
            INSERT INTO image (IMAGE_Image, PRODUCT_Id)
            VALUES (:imageData, :productId)
        ");

        $stmt->bindParam(':imageData', $imageData, PDO::PARAM_LOB);
        $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);

        return $stmt->execute();
    }


    public function readAll() {
        $countStmt = $this->pdo->query("
            SELECT COUNT(*) FROM image
        ");
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->pdo->query("
            SELECT IMAGE_Id, PRODUCT_Id, IMAGE_Image
            FROM image
            ORDER BY IMAGE_Id ASC
        ");
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("=== DEBUG readAll() - Images ===");
        error_log(print_r($images, true));
        error_log("Total products: " . $total);
        error_log("=====================================");
        return [
            'total' => $total,
            'images' => $images
        ];
    }

    public function readById($id) {
        $stmt = $this->pdo->prepare("
            SELECT IMAGE_Id, PRODUCT_Id, IMAGE_Image
            FROM image
            WHERE IMAGE_Id = :id
            ORDER BY IMAGE_Id ASC
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->execute();
        $image = $stmt->fetch(PDO::FETCH_ASSOC);
        error_log("=== DEBUG readById() - Images ===");
        error_log(print_r($image, true));
        error_log("=====================================");        
        return $image;
    }

    public function readByProduct($productId){
        $stmt = $this->pdo->prepare("
            SELECT IMAGE_Id, PRODUCT_Id, IMAGE_Image
            FROM image
            WHERE PRODUCT_Id = :productId
            ORDER BY IMAGE_Id ASC
        ");
        $stmt->bindParam(':productId', $productId, PDO::PARAM_STR);
        $stmt->execute();
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("=== DEBUG readByProduct() - Images ===");
        error_log(print_r($images, true));
        error_log("=====================================");       
        return [
            'total' => count($images),
            'images' => $images,
        ];
    }

    public function update($id, $imageData, $productId) {
        $stmt = $this->pdo->prepare("
            UPDATE image
            SET IMAGE_Image = :imageData,
                PRODUCT_Id = :productId
            WHERE IMAGE_Id = :id
        ");

        $stmt->bindParam(':imageData', $imageData, PDO::PARAM_LOB);
        $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("
            DELETE FROM image
            WHERE IMAGE_Id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }
}

?>
