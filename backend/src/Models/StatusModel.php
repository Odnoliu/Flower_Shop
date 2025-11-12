<?php

namespace App\Models;
use PDO;
use App\Config\Database;

class StatusModel
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance();
    }

    public function create($name)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO status (STATUS_Name)
            VALUES (:name)
        ");
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->execute();
        return $this->pdo->lastInsertId();
    }

    public function readAll()
    {
        $countStmt = $this->pdo->query("SELECT COUNT(*) FROM status");
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->pdo->query("
            SELECT STATUS_Id, STATUS_Name
            FROM status
            ORDER BY STATUS_Name ASC
        ");
        $statuses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'total' => $total,
            'statuses' => $statuses
        ];
    }

    public function readById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT STATUS_Id, STATUS_Name
            FROM status
            WHERE STATUS_Id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    public function readByName($keyword)
    {
        $search = "%{$keyword}%";
        $stmt = $this->pdo->prepare("
            SELECT STATUS_Id, STATUS_Name
            FROM status
            WHERE STATUS_Name LIKE :keyword
            ORDER BY STATUS_Name ASC
        ");
        $stmt->bindParam(':keyword', $search, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($id, $name)
    {
        $stmt = $this->pdo->prepare("
            UPDATE status
            SET STATUS_Name = :name
            WHERE STATUS_Id = :id
        ");
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM status
            WHERE STATUS_Id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
?>