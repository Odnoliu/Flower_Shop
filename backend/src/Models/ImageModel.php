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
        $countStmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM image
        ");
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->pdo->prepare("
            SELECT IMAGE_Id, PRODUCT_Id, IMAGE_Image
            FROM image
            ORDER BY IMAGE_Id ASC
        ");
        $stmt->execute();
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'total' => $total,
            'images' => $images
        ];
    }

    public function readImageById($id) {
        $stmt = $this->pdo->prepare("
            SELECT IMAGE_Id, PRODUCT_Id, IMAGE_Image
            FROM image
            WHERE IMAGE_Id = :id
            ORDER BY IMAGE_Id ASC
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
