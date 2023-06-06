<?php

require __DIR__ . "/../backend/api/ApiController.php";
use backend\api\ApiController;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: *");

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );

$requestMethod = $_SERVER["REQUEST_METHOD"];
//error_reporting(E_ERROR);

// pass the request method and user ID to the PersonController and process the HTTP request:
$controller = new ApiController($uri[2], mb_strtolower($requestMethod) == 'post' ? $_POST : $_GET);
try {
    $controller->processRequest();
} catch (Exception $exception) {
    http_response_code(404);
    echo "Not Found";
}