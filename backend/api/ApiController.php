<?php

namespace backend\api;

use backend\models\ChatModel;

require "backend/models/ChatModel.php";

class ApiController
{
    public $method;
    public $params;

    public function __construct($method, $params)
    {
        $this->method = $method;
        $this->params = $params;
    }

    public function processRequest() {
        return $this->{$this->method}(!empty($this->params) ? $this->params : null);
    }

    public function createNewChat() {
        $model = new ChatModel();
        echo $model->create();
    }

    public function getChats($params) {
        $model = new ChatModel();
        $response = $model->get();

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }

    public function getChatMessages($params) {
        $model = new ChatModel();
        $response = $model->messages($params['id']);

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }

    public function addMessage($params) {
        $model = new ChatModel();
        $model->addMessage($params['id'], $params['message'], $params['is_from_support']);
        echo json_encode(['status' => 'ok']);
    }

    public function readChat($params) {
        $model = new ChatModel();
        $model->readMessages($params['id']);
        echo json_encode(['status' => 'ok']);
    }
}