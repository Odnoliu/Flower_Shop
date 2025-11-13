<?php

namespace App\Models;

use PDO;
use App\Config\Database;

class PriceModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    public function create($effectiveDate, $updatedDate, $price, $productId) {
        $stmt = $this->pdo->prepare("
            INSERT INTO price (PRICE_EffectiveDate, PRICE_UpdatedDate, PRICE_Price, PRODUCT_Id)
            VALUES (:effectiveDate, :updatedDate, :price, :productId)
        ");

        $stmt->bindParam(':effectiveDate', $effectiveDate, PDO::PARAM_STR);
        $stmt->bindParam(':updatedDate', $updatedDate, PDO::PARAM_STR);
        $stmt->bindParam(':price', $price, PDO::PARAM_STR);
        $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function readAll() {
        $countStmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM price
        ");
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->pdo->prepare("
            SELECT * 
            FROM price
            ORDER BY PRODUCT_Id ASC, PRICE_EffectiveDate DESC
        ");
        $stmt->execute();
        $prices = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'total' => $total,
            'prices' => $prices
        ];
    }

    public function readByInfo($keyword) {
        $search = "%{$keyword}%";

        $stmt = $this->pdo->prepare("
            SELECT *
            FROM price
            WHERE PRODUCT_Id LIKE :keyword
               OR PRICE_EffectiveDate LIKE :keyword
               OR PRICE_UpdatedDate LIKE :keyword
            ORDER BY PRODUCT_Id ASC, PRICE_EffectiveDate DESC
        ");

        $stmt->bindParam(':keyword', $search, PDO::PARAM_STR);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($effectiveDate, $productId, $updatedDate, $price) {
        $stmt = $this->pdo->prepare("
            UPDATE price
            SET PRICE_UpdatedDate = :updatedDate,
                PRICE_Price = :price
            WHERE PRICE_EffectiveDate = :effectiveDate
            AND PRODUCT_Id = :productId
        ");

        $stmt->bindParam(':updatedDate', $updatedDate, PDO::PARAM_STR);
        $stmt->bindParam(':price', $price, PDO::PARAM_STR);
        $stmt->bindParam(':effectiveDate', $effectiveDate, PDO::PARAM_STR);
        $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function delete($effectiveDate, $productId) {
        $stmt = $this->pdo->prepare("
            DELETE FROM price
            WHERE PRICE_EffectiveDate = :effectiveDate
              AND PRODUCT_Id = :productId
        ");

        $stmt->bindParam(':effectiveDate', $effectiveDate, PDO::PARAM_STR);
        $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function getPrice($productId, $date) {
        $stmt = $this->pdo->prepare("
            SELECT PRICE_Price
            FROM price
            WHERE PRODUCT_Id = :productId
              AND PRICE_EffectiveDate <= :date
            ORDER BY PRICE_EffectiveDate DESC
            LIMIT 1
        ");

        $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);
        $stmt->bindParam(':date', $date, PDO::PARAM_STR);
        $stmt->execute();

        return $stmt->fetchColumn();
    }
}

?>
