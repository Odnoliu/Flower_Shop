<?php
namespace App\Controllers;

// use App\Models\UserModel;

class UserController {
    private $model;

    public function __construct(){
        $this->model = new UserModel();
    }
}
?>