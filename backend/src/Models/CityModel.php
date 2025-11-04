<?php

namespace App\Models;

use App\Config\Database;

class CityModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }
    public function create($name){
        $stmt = $this->pdo->prepare("INSERT INTO City (CITY_Name) VALUES (:name)");
        $stmt->bindParam(':name', $name, \PDO::PARAM_STR);
        $stmt->execute();
        return $this->pdo->lastInsertId();
    }

    public function readAll() {
        $stmt = $this->pdo->prepare("SELECT * FROM City");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function readById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM City WHERE CITY_Id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }


    public function update($id, $name) { // $name is data['CITY_Name'] in the controller file
        $stmt = $this->pdo->prepare("UPDATE City SET CITY_Name = :name WHERE CITY_Id = :id");
        $stmt->bindParam(':name', $name, \PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM City WHERE CITY_Id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
        return $stmt->execute();
    }
}