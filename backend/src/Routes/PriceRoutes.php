<?php

namespace App\Routes;

use App\Controllers\PriceController;

class PriceRoutes{
    private $controller;

    public function __construct(){
        $this->controller = new PriceController();
    }

    public function handle($method, $path){
        if($path == '/price'){
            if($method == 'GET'){
                $this->controller->index();
                return;
            }
            if($method == 'POST'){
                $this->controller->createPrice();
                return;
            }
        }
        if(preg_match('#^/price/([^/]+)$#', $path, $matches)){
            $keyword = urlencode($matches[1]);

            if($method == 'GET'){
                $this->controller->readPriceByInfo($keyword);
                return;
            }
        }
        if(preg_match('#^/price/([^/]+)#', $path, $matches)){
            $productId = urldecode($matches[1]);
            
            if($method == 'PUT'){
                $this->controller->updatePrice($productId);
                return;                
            }
            if($method == 'DELETE'){
                $this->controller->deletePrice( $productId);
                return;                
            }
        }
    }
}
?>