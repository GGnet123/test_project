<?php

require __DIR__ . '/../../vendor/autoload.php';


$worker = new \Workerman\Worker('websocket://0.0.0.0:6001');
$worker->count=6;

$worker->onWorkerStart = function($worker)
{
    Channel\Client::connect('127.0.0.1', 2206);
    Channel\Client::on('messages', function($data)use($worker){
        foreach ($worker->connections as $connection) {
            $connection->send($data);
        }
    });
};

$worker->onConnect = function ($connection) use ($worker) {
    $connection->send('Successfully connected');
};

$channel_server = new Channel\Server('0.0.0.0', 2206);

$worker->onMessage = function($connection, $data) {
    Channel\Client::publish('messages', $data);
};

\Workerman\Worker::runAll();