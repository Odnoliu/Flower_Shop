<?php

namespace App\Controllers;

use App\Models\UserModel;

class UserController {
    private $model;

    public function __construct(){
        $this->model = new UserModel();
    }

    // This function sends a JSON response with the given data and HTTP status code in case of format error
    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public function index(){
        $users = $this->model->readAll();
        $this->jsonResponse($users);
    }

    public function createUser(){
        $data = json_decode(file_get_contents('php://input'), true);
        if(isset($data['USER_Phone']) 
            && !empty($data['USER_Phone'])
            && isset($data['USER_Email']) 
            && !empty($data['USER_Email'])
            && isset($data['USER_Name']) 
            && !empty($data['USER_Name'])
            && isset($data['USER_Gender']) 
            && !empty($data['USER_Gender'])            
        ){
            $this->model->create($data['USER_Phone'], 
                                        $data['USER_Email'], 
                                        $data['USER_Name'], 
                                        $data['USER_Gender']);
            $this->jsonResponse([
                'success' => true, 
                'USER_Phone' => $data['USER_Phone'],
                'USER_Email' => $data['USER_Email'],
                'USER_Name' => $data['USER_Name'],
                'USER_Gender' => $data['USER_Gender']
            ], 201);    
        }else $this->jsonResponse(['error' => 'Invalid data'], 400);
    }

    public function readUserByInfo($keyword){
        $user = $this->model->readByInfo($keyword);
        if($user){
            $this->jsonResponse($user);
        }else $this->jsonResponse(['error' => 'User not found'], 404);
    }

    public function updateUser($phone){
        $data = json_decode(file_get_contents('php://input'), true);
        if(isset($data['USER_Email']) 
            && !empty($data['USER_Email'])
            && isset($data['USER_Name']) 
            && !empty($data['USER_Name'])
            && isset($data['USER_Gender']) 
            && !empty($data['USER_Gender'])            
        ){
            $success = $this->model->update($phone, 
                                        $data['USER_Email'], 
                                        $data['USER_Name'], 
                                        $data['USER_Gender']);
            if($success){
                $this->jsonResponse(['success' => true]);    
            }else $this->jsonResponse(['error' => 'Update failed'], 500);
        }else $this->jsonResponse(['error' => 'Invalid data'], 400);
    }

    public function deleteUser($phone){
        $success = $this->model->delete($phone);
        if ($success) {
            $this->jsonResponse(['success' => true]);
        } else {
            $this->jsonResponse(['error' => 'Delete failed'], 500);
        }        
    }
}
?>