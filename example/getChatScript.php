<?php
header('Content-Type: application/javascript');
$roomId = isset($_GET['room']) && !empty($_GET['room']) ? ((integer)$_GET['room']) : 0;
$chat = isset($_GET['chat']) && !empty($_GET['chat']) ? $_GET['chat'] : 'ws://protask.duncte123.me:9911';

echo 'let room = ' . $roomId . ';' . PHP_EOL;
echo 'let chatUrl = ' . $chat . ';' . PHP_EOL;

echo file_get_contents(__DIR__ . '/chat.js');