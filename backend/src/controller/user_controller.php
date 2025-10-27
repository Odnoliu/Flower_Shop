<?php
namespace App\Controllers;

use App\Models\UserModel;

class UserController {
    public function index() {
        $model = new UserModel();
        $users = $model->getAll();
        echo json_encode($users);
    }

    public function create() {
        // Xử lý POST data
        $data = json_decode(file_get_contents('php://input'), true);
        // Validate và save...
    }
}