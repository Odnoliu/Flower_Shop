<?php 

namespace App\Routes;

use App\Controllers\UserController;

class UserRoutes{
    private $controller;

    public function __construct(){
        $this->controller = new UserController();
    }

    public function handle($method, $path){
        if($path == '/user'){
            if($method == 'GET'){
                $this->controller->index();
            }elseif ($method == 'POST'){
                $this->controller->createUser();
            }
        }

        if(preg_match('#^/user/(\d+)$#', $path, $matches)){
            $keyword = $matches[1];

            if($method == 'GET'){
                $this->controller->readUserByInfo($keyword);
                return;
            }

            if($method == 'PUT' || $method == 'DELETE'){
                if (!preg_match('/^\d{10}$/', $keyword)) {
                    return;
                }   
                // at this point, $keyword is confirmed to be a valid phone number format
                // Rename variable for clarity since it will be used as the primary key           
                $phone = $keyword;
                if ($method == 'PUT') {
                    $this->controller->updateUser($phone);
                } elseif ($method == 'DELETE') {
                    $this->controller->deleteUser($phone);
                }
            }
        }
        elseif(preg_match('#^/users/email/([^/]+)$#', $path, $matches)) {
            $email = urldecode($matches[1]);
            if ($method === 'GET') {
                $this->controller->readUserByInfo($email);
            }
        }

        http_response_code(404);
        echo json_encode([
            'error' => 'Route not found'
        ]);

        exit;
    }
}
?>