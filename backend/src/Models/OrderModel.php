<?php

namespace App\Models;

use App\Config\Database;

class OrderModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }
    public function create($createdDate, $userPhone, $total) {
        $stmt = $this->pdo->prepare("INSERT INTO Orders (ORDER_CreatedDate, USER_Phone, ORDER_Total, STATUS_Id) VALUES (:createdDate, :userPhone, :total, 1)");
        $stmt->bindParam(':createdDate', $createdDate, \PDO::PARAM_STR);
        $stmt->bindParam(':userPhone', $userPhone, \PDO::PARAM_STR);
        $stmt->bindParam(':total', $total, \PDO::PARAM_STR);
        $stmt->execute();
        return $this->pdo->lastInsertId();
    }

    public function readAll() {
        $stmt = $this->pdo->prepare("SELECT * FROM Orders");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function readById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM Orders WHERE ORDER_Id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }


    public function update($id, $userPhone, $status) {
        $stmt = $this->pdo->prepare(
            "UPDATE Orders
            SET USER_Phone = :phone,
                STATUS_Id = :status
            WHERE ORDER_Id = :id"
        );
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->bindParam(':phone', $userPhone, \PDO::PARAM_STR);
        $stmt->bindParam(':status', $status, \PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function updateStatus($id, $status) {
        $stmt = $this->pdo->prepare(
            "UPDATE Orders
            SET STATUS_Id = :status
            WHERE ORDER_Id = :id"
        );
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->bindParam(':status', $status, \PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM Orders WHERE ORDER_Id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function getTotal($order_id) {
        $stmt = $this->pdo->prepare(
            "SELECT SUM(ORDERDETAIL_Quantity * ORDERDETAIL_Price) AS total
            FROM OrderDetail
            WHERE ORDER_Id = :order_id"
        );
        $stmt->bindParam(':order_id', $order_id, \PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ? $result['total'] : 0;
    }

    public function setTotal($order_id, $total) {
        $stmt = $this->pdo->prepare(
            "UPDATE Orders
            SET ORDER_Total = :total
            WHERE ORDER_Id = :order_id"
        );
        $stmt->bindParam(':order_id', $order_id, \PDO::PARAM_STR);
        $stmt->bindParam(':total', $total, \PDO::PARAM_STR);
        return $stmt->execute();
    }
}