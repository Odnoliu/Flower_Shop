<?php 

namespace App\Routes;

use App\Controllers\UserController;

class UserRoutes{
    private $controller;

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
                $this->controller->readByInfo($keyword);
                return;
            }
            // the keyword can be phone, email or name, but UPDATE/DELETE must use a valid phone number
            // if the keyword is a name (example: Nguyen Van A), we cannot allow the function to UPDATE OR DELETE
            // the check below make sure the caller use the correct method, 
            // we assume if the caller wants to update or delete something, its keyword has to be a phone number and not a name
            if($method == 'PUT' && $method == 'DELETE'){
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

        http_response_code(404);
        echo json_encode([
            'error' => 'Route not found'
        ]);

        exit;
    }
}
?>