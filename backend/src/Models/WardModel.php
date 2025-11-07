<?php 

namespace App\Models;
use PDO;
use App\Config\Database;

class WardModel{
    private $pdo;

    public function __construct(){
        $this->pdo = Database::getInstance();
    }

    public function create($name, $id){
        $stmt = $this->pdo->prepare("
            INSERT INTO ward (WARD_Name, CITY_Id)
            VALUES (:name, :id)
        ");
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function readAll(){
        $countStmt = $this->pdo->prepare("
            SELECT COUNT(*) 
            FROM ward
        ");
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->pdo->prepare("
            SELECT * 
            FROM ward
        ");
        $stmt->execute();
        $wards = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return [
            'total' => $total,
            'wards' => $wards
        ];
    }

    public function readById($id){
        $stmt = $this->pdo->prepare("
            SELECT *
            FROM ward
            WHERE WARD_Id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($id, $name){
        $stmt = $this->pdo->prepare("
            UPDATE ward 
            SET WARD_Name = :name
            WHERE WARD_Id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function delete($id){
        $stmt = $this->pdo->prepare("
            DELETE FROM ward
            WHERE WARD_Id = :id
        ");
        $stmt->bindParam(':id', id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
?>