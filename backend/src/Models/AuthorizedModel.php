<?php

namespace App\Models;

use App\Config\Database;

class AuthorizedModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }
    public function create($account_id, $authorization_id){
        $stmt = $this->pdo->prepare("INSERT INTO Authorized (ACCOUNT_Id, AUTHORIZATION_Id) VALUES (:account_id, :authorization_id)");
        $stmt->bindParam(':account_id', $account_id, \PDO::PARAM_STR);
        $stmt->bindParam(':authorization_id', $authorization_id, \PDO::PARAM_STR);
        $stmt->execute();
    }

    public function readAll() {
        $stmt = $this->pdo->prepare("SELECT * FROM Authorized");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function readByAccountId($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM Authorized WHERE ACCOUNT_Id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function update($account_id, $authorization_id) {
        $stmt = $this->pdo->prepare("UPDATE Authorized SET AUTHORIZATION_Id = :authorization_id WHERE ACCOUNT_Id = :account_id");
        $stmt->bindParam(':authorization_id', $authorization_id, \PDO::PARAM_STR);
        $stmt->bindParam(':account_id', $account_id, \PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM Authorized WHERE ACCOUNT_Id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        return $stmt->execute();
    }
}