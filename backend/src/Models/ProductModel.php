<?php

namespace App\Models;

use PDO;
use App\Config\Database;

class ProductModel
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance();
    }

    public function create($name, $avatar, $typeId)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO product (PRODUCT_Name, PRODUCT_Avatar, TYPE_Id)
            VALUES (:name, :avatar, :typeId)
        ");
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->bindParam(':avatar', $avatar, PDO::PARAM_LOB); // BLOB
        $stmt->bindParam(':typeId', $typeId, PDO::PARAM_INT);
        $stmt->execute();
        return $this->pdo->lastInsertId(); // Trả về PRODUCT_Id mới
    }

    public function readAll()
    {
        $countStmt = $this->pdo->query("SELECT COUNT(*) FROM product");
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->pdo->query("
            SELECT p.PRODUCT_Id, p.PRODUCT_Name, p.PRODUCT_Avatar, p.TYPE_Id, t.TYPE_Name
            FROM product p
            LEFT JOIN type t ON p.TYPE_Id = t.TYPE_Id
            ORDER BY p.PRODUCT_Name ASC
        ");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("=== DEBUG readAll() - Products ===");
        error_log(print_r($products, true));
        error_log("Total products: " . $total);
        error_log("=====================================");
        return [
            'total' => $total,
            'products' => $products
        ];
    }

    public function readByInfo($keyword)
    {
        $keyword = trim($keyword);
        $search = "%{$keyword}%";

        $stmt = $this->pdo->prepare("
            SELECT p.PRODUCT_Id, p.PRODUCT_Name, p.PRODUCT_Avatar, p.TYPE_Id, t.TYPE_Name
            FROM product p
            LEFT JOIN type t ON p.TYPE_Id = t.TYPE_Id
            WHERE p.PRODUCT_Name LIKE :keyword
               OR p.PRODUCT_Id = :id
            ORDER BY p.PRODUCT_Name ASC
        ");

        $stmt->bindParam(':keyword', $search, PDO::PARAM_STR);

        if (is_numeric($keyword) && $keyword > 0) {
            $stmt->bindParam(':id', $keyword, PDO::PARAM_INT);
        } else {
            $dummy = 0;
            $stmt->bindParam(':id', $dummy, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($id, $name, $avatar, $typeId)
    {
        $sql = "
            UPDATE product
            SET PRODUCT_Name = :name,
                TYPE_Id = :typeId
        ";
        $params = [
            ':name' => $name,
            ':typeId' => $typeId,
            ':id' => $id
        ];

        if ($avatar !== null) {
            $sql .= ", PRODUCT_avatar = :avatar";
            $params[':avatar'] = $avatar;
        }

        $sql .= " WHERE PRODUCT_Id = :id";

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => &$val) {
            $type = ($key ==':avatar') ? PDO::PARAM_LOB : 
                   (($key == ':id' || $key == ':typeId') ? PDO::PARAM_INT : PDO::PARAM_STR);
            $stmt->bindParam($key, $val, $type);
        }
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM product
            WHERE PRODUCT_Id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function readById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT p.*, t.TYPE_Name
            FROM product p
            LEFT JOIN type t ON p.TYPE_Id = t.TYPE_Id
            WHERE p.PRODUCT_Id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }
}
?>