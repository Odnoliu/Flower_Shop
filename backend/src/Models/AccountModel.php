<?php

namespace App\Models;

use App\Config\Database;

class AccountModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }
    public function create($phone, $pass){
        $stmt = $this->pdo->prepare("INSERT INTO Account (USER_Phone, ACCOUNT_Password) VALUES (:phone, :pass)");
        $stmt->bindParam(':phone', $phone, \PDO::PARAM_STR);
        $stmt->bindParam(':pass', $pass, \PDO::PARAM_STR);
        $stmt->execute();
        return $this->pdo->lastInsertId();
    }

    public function readAll() {
        $stmt = $this->pdo->prepare("SELECT * FROM Account");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function readById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM Account WHERE ACCOUNT_Id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }


    public function update($id, $pass) {
        $stmt = $this->pdo->prepare("UPDATE Account SET ACCOUNT_Password = :pass WHERE ACCOUNT_Id = :id");
        $stmt->bindParam(':pass', $pass, \PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM Account WHERE ACCOUNT_Id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        return $stmt->execute();
    }
}