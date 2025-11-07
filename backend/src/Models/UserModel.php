<?php

namespace App\Models;
use PDO;
use App\Config\Database;

class UserModel{
    private $pdo;

    public function __construct(){
        $this->pdo = Database::getInstance();
    }

    public function create($phone, $email, $name, $gender){
        $stmt = $this->pdo->prepare("
            INSERT INTO user (USER_Phone, USER_Email, USER_Name, USER_Gender)
            VALUES (:phone, :email, :name, :gender)
        ");
        $stmt->bindParam(':phone', $phone, \PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, \PDO::PARAM_STR);
        $stmt->bindParam(':name', $name, \PDO::PARAM_STR);
        $stmt->bindParam(':gender', $gender, \PDO::PARAM_STR);
        $stmt->execute();
        return;
    }

    public function readAll(){
        $countStmt = $this->pdo->prepare("
            SELECT COUNT(*) 
            FROM user
        ");
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();
        
        $stmt = $this->pdo->prepare("
            SELECT * 
            FROM user
            ORDER BY USER_Name ASC
        ");
        $stmt->execute();
        $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        return [
            'total' => $total,
            'users' => $users
        ];
    }
    // Use this for search function
    public function readByInfo($keyword){
        $search = "%{$keyword}%";
        $stmt = $this->pdo->prepare("
            SELECT * 
            FROM user
            WHERE USER_Phone LIKE :keyword 
                OR USER_Email LIKE :keyword
                OR USER_Name LIKE :keyword
            ORDER BY USER_Name ASC
        ");
        $stmt->bindParam(':keyword', $search, \PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function update($phone, $email, $name, $gender){
        $stmt = $this->pdo->prepare("
            UPDATE user
            SET USER_Name = :name, USER_Email = :email, USER_Gender = :gender 
            WHERE USER_Phone = :phone
        ");
        $stmt->bindParam(':name', $name, \PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, \PDO::PARAM_STR);
        $stmt->bindParam(':gender', $gender, \PDO::PARAM_STR);
        $stmt->bindParam(':phone', $phone, \PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function delete($phone){
        $stmt = $this->pdo->prepare("
            DELETE FROM user
            WHERE USER_Phone = :phone
        ");
        $stmt->bindParam('phone', $phone, \PDO::PARAM_INT);
        return $stmt->execute();
    }
}
?>