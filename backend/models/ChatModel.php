<?php

namespace backend\models;

class ChatModel
{
    public $db;

    public function __construct()
    {
        $this->db = require "backend/db_connect.php";
    }

    public function create(): int
    {
        $id = pg_fetch_assoc(pg_query($this->db, "insert into chats(is_active) values(true) returning id"))['id'];
        pg_query_params($this->db,
        "insert into chat_messages(chat_id, message, is_from_support, is_read) 
                values($1, $2, $3, $4)", [$id, 'Здравствуйте, чем можем вам помочь ?', true, true]
        );
        return $id;
    }

    public function get(): array
    {
        $res = pg_query($this->db, "select * from chats where is_active=true order by id desc");
        $response = [];
        if ($res == false) {
            return $response;
        }

        while ($row = pg_fetch_assoc($res)) {
            $response[] = $row;
        }
        return $response;
    }

    public function messages($id): array
    {
        $res = pg_query_params($this->db, "select * from chat_messages where chat_id = $1 order by id asc", [$id]);

        $arr = [];
        while ($row = pg_fetch_assoc($res)) {
            $arr[] = $row;
        }

        return $arr;
    }

    public function addMessage($id, $message, $is_from_support) {
        pg_query_params($this->db,
            "insert into chat_messages(chat_id, message, is_from_support) 
                values($1, $2, $3)",
            [$id, $message, $is_from_support]
        );
    }

    public function readMessages($id) {
        pg_query_params($this->db, "update chat_messages set is_read=true where chat_id = $1", [$id]);
    }
}