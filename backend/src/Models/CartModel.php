<?php

namespace App\Models;

use App\Config\Database;

class CartModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }
    public function create($account_id, $product_id, $quantity) {
        $stmt = $this->pdo->prepare(
            "INSERT INTO Cart (ACCOUNT_Id, PRODUCT_Id, CART_Quantity)
            VALUES (:account_id, :product_id, :quantity)"
        );
        $stmt->bindParam(':account_id', $account_id, \PDO::PARAM_STR);
        $stmt->bindParam(':product_id', $product_id, \PDO::PARAM_STR);
        $stmt->bindParam(':quantity', $quantity, \PDO::PARAM_INT);
        $stmt->execute();
        return $this->pdo->lastInsertId();
    }

    public function readAll() {
        $stmt = $this->pdo->prepare("SELECT * FROM Cart");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function readById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM Cart WHERE USER_Phone = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function updateQuantity($id, $phone, $quantity) {
        $stmt = $this->pdo->prepare(
            "UPDATE Cart
            SET CART_Quantity = :quantity
            WHERE PRODUCT_Id = :id
            AND USER_Phone = :phone");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->bindParam(':phone', $phone, \PDO::PARAM_INT);
        $stmt->bindParam(':quantity', $quantity, \PDO::PARAM_INT);
        return $stmt->execute();
    }


    public function deleteAll($id) {
        $stmt = $this->pdo->prepare("DELETE FROM Cart WHERE ACCOUNT_Id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        return $stmt->execute();
    }
    public function deleteItem($phone, $product_id){
        $stmt = $this->pdo->prepare("DELETE FROM Cart WHERE USER_Phone = :phone AND PRODUCT_Id = :product_id");
        $stmt->bindParam(':id', $phone, \PDO::PARAM_INT);
        $stmt->bindParam(':product_id', $product_id, \PDO::PARAM_INT);
        return $stmt->execute();
    }
}