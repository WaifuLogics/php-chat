<?php

require_once __DIR__ . "/../vendor/autoload.php";

use pmill\Chat\BasicMultiRoomServer;

$port = 9911;
$server = new BasicMultiRoomServer;

BasicMultiRoomServer::run($server, $port);
