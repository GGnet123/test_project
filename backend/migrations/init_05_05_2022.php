<?php
require_once realpath(__DIR__ . '/../../vendor/autoload.php');

$db = require "backend/db_connect.php";

pg_query($db, "CREATE TABLE IF NOT EXISTS chats (
    id serial primary key,
    is_active bool not null default true,
    created_at timestamptz not null default now()
);");

pg_query($db, "CREATE TABLE IF NOT EXISTS chat_messages (
    id serial primary key,
    chat_id integer not null,
    message text not null,
    is_from_support bool not null,
    is_read bool default false not null,
    created_at timestamptz not null default now(),
    foreign key(chat_id) references chats (id) on delete cascade
);");