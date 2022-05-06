<?php

require __DIR__ . "/backend/router.php";
require_once realpath(__DIR__ . '/vendor/autoload.php');

$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
