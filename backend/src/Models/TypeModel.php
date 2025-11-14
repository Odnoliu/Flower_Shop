<?php

namespace App\Models;

use PDO;
use App\Config\Database;

class TypeModel
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance();
    }

    public function create($name)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO type (TYPE_Name)
            VALUES (:name)
        ");
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->execute();
        return $this->pdo->lastInsertId(); 
    }

    public function readAll()
    {
        $countStmt = $this->pdo->query("SELECT COUNT(*) FROM type");
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->pdo->query("
            SELECT TYPE_Id, TYPE_Name
            FROM type
            ORDER BY TYPE_Name ASC
        ");
        $types = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'total' => $total,
            'types' => $types
        ];
    }

    public function readByInfo($keyword)
    {

        if (is_numeric($keyword) && $keyword > 0) {
            $stmt = $this->pdo->prepare("
                SELECT TYPE_Id, TYPE_Name
                FROM type
                WHERE TYPE_Id = :id
                ORDER BY TYPE_Name ASC
            ");
            $stmt->bindParam(':id', $keyword, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }else{
            $search = "%{$keyword}%";
            $stmt = $this->pdo->prepare("
                SELECT TYPE_Id, TYPE_Name
                FROM type
                WHERE TYPE_Name LIKE :keyword
                ORDER BY TYPE_Name ASC
            ");
            error_log($keyword);
            error_log($search);
            $stmt->bindParam(':keyword', $search, PDO::PARAM_STR);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

    }

    public function update($id, $name)
    {
        $stmt = $this->pdo->prepare("
            UPDATE type
            SET TYPE_Name = :name
            WHERE TYPE_Id = :id
        ");
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM type
            WHERE TYPE_Id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
?>