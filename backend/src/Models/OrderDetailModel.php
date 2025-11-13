<?php

namespace App\Models;

use App\Config\Database;

class OrderDetailModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }
    public function create($order_id, $product_id, $quantity, $price) {
        $stmt = $this->pdo->prepare(
            "INSERT INTO OrderDetail (ORDER_Id, PRODUCT_Id, ORDERDETAIL_Quantity, ORDERDETAIL_Price)
            VALUES (:order_id, :product_id, :quantity, :price)"
        );
        $stmt->bindParam(':order_id', $order_id, \PDO::PARAM_STR);
        $stmt->bindParam(':product_id', $product_id, \PDO::PARAM_STR);
        $stmt->bindParam(':quantity', $quantity, \PDO::PARAM_INT);
        $stmt->bindParam(':price', $price, \PDO::PARAM_STR);
        $stmt->execute();
    }

    public function readAll() {
        $stmt = $this->pdo->prepare("SELECT * FROM OrderDetail");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function readByOrderId($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM OrderDetail WHERE ORDER_Id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function updateQuantity($product_id, $order_id, $quantity) {
        $stmt = $this->pdo->prepare(
            "UPDATE OrderDetail
            SET ORDERDETAIL_Quantity = :quantity
            WHERE ORDER_Id = :product_id
            AND PRODUCT_Id = :order_id");
        $stmt->bindParam(':order_id', $order_id, \PDO::PARAM_STR);
        $stmt->bindParam(':product_id', $product_id, \PDO::PARAM_INT);
        $stmt->bindParam(':quantity', $quantity, \PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function updatePrice($product_id, $order_id, $price) {
        $stmt = $this->pdo->prepare(
            "UPDATE OrderDetail
            SET ORDERDETAIL_Price = :price
            WHERE ORDER_Id = :product_id
            AND PRODUCT_Id = :order_id");
        $stmt->bindParam(':order_id', $order_id, \PDO::PARAM_STR);
        $stmt->bindParam(':product_id', $product_id, \PDO::PARAM_INT);
        $stmt->bindParam(':price', $price, \PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function delete($product_id, $order_id) {
        $stmt = $this->pdo->prepare("DELETE FROM OrderDetail WHERE ORDER_Id = :id AND PRODUCT_Id = :product_id");
        $stmt->bindParam(':order_id', $order_id, \PDO::PARAM_STR);
        $stmt->bindParam(':product_id', $product_id, \PDO::PARAM_STR);
        return $stmt->execute();
    }
}