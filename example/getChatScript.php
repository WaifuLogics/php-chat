<?php
header('Content-Type: application/javascript');
$roomId = isset($_GET['room']) && !empty($_GET['room']) ? ((integer)$_GET['room']) : 0;
$chat = isset($_GET['ip']) && !empty($_GET['ip']) ? $_GET['ip'] : 'ws://protask.duncte123.me:9911';
$username = isset($_GET['user']) && !empty($_GET['user']) ? $_GET['user'] : null;

echo 'let room = ' . $roomId . ';' . PHP_EOL;
echo 'let chatUrl = "' . $chat . '";' . PHP_EOL;
echo 'let user = "' . $username . '";' . PHP_EOL;

echo file_get_contents(__DIR__ . '/chat.js');