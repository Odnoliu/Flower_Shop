<?php
namespace App\Controllers;

use App\Models\WardModel;

class WardController{
    private $model;

    public function __construct(){
        $this->model = new WardModel();
    }

    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    public function index(){
        $wards = $this->model->readAll();
        $this->jsonResponse($wards);
    }

    public function createWard(){
        $data = json_decode(file_get_contents('php://input'),true);
        if(isset($data['WARD_Id']) && !empty($data['WARD_Id'])
            && isset($data['WARD_Name']) && !empty($data['WARD_Name'])
        ){
            $this->model->create($data['WARD_Id'], $data['WARD_Name']);
            $this->jsonResponse([
                'success' => 'true',
                'WARD_Id' => $data['WARD_Id'],
                'WARD_Name' => $data['WARD_Name']
            ], 201);
        }else $this->model->jsonResponse(['error' => 'Invalid date'], 400);
    }

    public function readWardById($id){
        $ward = $this->model->readbyId($id);
        if($ward){
            $this->model->jsonResponse($ward);
        }else $this->jsonResponse(['error' => 'Ward not found'], 404);
    }

    public function updateWard($id){
        $data = json_decode(file_get_contents('php://input'),true);
        if(isset($data['WARD_Name']) && !empty($data['WARD_Name'])){
            $success = $this->model->update($id, $data['WARD_Name']);
            if($success){
                $this->model->jsonResponse(['success' => true]);
            }else $this->jsonResponse(['error' => 'Update failed'], 500);
        }else $this->jsonResponse(['error' => 'Invalid data'], 400);
    }

    public function deleteWard($id){
        $success = $this->model->delete($id);
        if ($success) {
            $this->jsonResponse(['success' => true]);
        } else {
            $this->jsonResponse(['error' => 'Delete failed'], 500);
        }        
    }    
}
?>