<?php

namespace App\Routes;

use App\Controllers\StatusController;

class StatusRoutes{
    private $controller;

    public function __construct(){
        $this->controller = new StatusController();
    }

    public function handle($method, $path){
        if($path == '/status'){
            if($method == 'GET'){
                $this->controller->index();
                return;
            }
            if($method == 'POST'){
                $this->controller->createStatus();
            }
        }

        if(preg_match('#^/status/(\d+)$#', $path, $matches)){
            $id = $matches[1];
            if($method == 'GET'){
                $this->controller->readStatusById($id);
                return;
            }

            if ($method == 'PUT') {
                $this->controller->updateStatus($id);
                return;
            }

            if ($method == 'DELETE') {
                $this->controller->deleteStatus($id);
                return;
            }            
        }
    }
}
?> 