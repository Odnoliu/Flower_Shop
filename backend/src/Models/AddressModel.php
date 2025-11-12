<?php

namespace App\Models;
use PDO;
use App\Config\Database;

class AddressModel{
    private $pdo;

    public function __construct(){
        $this->pdo = Database::getInstance();
    }

    public function create($address, $description, $userPhone, $ward){
        $stmt = $this->pdo->prepare("
            INSERT INTO address (ADDRESS_Address, ADDRESS_Description, USER_Phone, WARD_Id)
            VALUES (:address, :description, :userPhone, :ward)
        ");
        $stmt->bindParam(':address', $address, \PDO::PARAM_STR);
        $stmt->bindParam(':description', $description, \PDO::PARAM_STR);
        $stmt->bindParam(':userPhone', $userPhone, \PDO::PARAM_STR);
        $stmt->bindParam(':ward', $ward, \PDO::PARAM_STR);
        $stmt->execute();
        return;
    }

    public function readAll(){
        $countStmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM address
        ");
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();
        
        $stmt = $this->pdo->prepare("
            SELECT * 
            FROM address
        ");
        $stmt->execute();
        $addresses = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        return [
            'total' => $total,
            'addresses' => $addresses
        ];
    }

    public function readById($id){
        $stmt = $this->pdo->prepare("
            SELECT * 
            FROM address
            WHERE ADDRESS_Id = :id
        ");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function update($id, $address, $description, $userPhone, $ward){
        $stmt = $this->pdo->prepare("
            UPDATE address
            SET ADDRESS_Address = :address, ADDRESS_Description = :description,
                USER_Phone = :userPhone, WARD_Id = :ward
            WHERE ADDRESS_Id = :id    
        ");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->bindParam(':address', $address, \PDO::PARAM_STR);
        $stmt->bindParam(':description', $description, \PDO::PARAM_STR);
        $stmt->bindParam(':address', $address, \PDO::PARAM_STR);
        $stmt->bindParam(':userPhone', $userPhone, \PDO::PARAM_STR);
        $stmt->bindParam(':ward', $ward, \PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function delete($id){
        $stmt = $this->pdo->prepare("
            DELETE 
            FROM address
            WHERE ADDRESS_Id = :id
        ");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        return $stmt->execute();        
    }
}

?>