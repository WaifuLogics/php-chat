<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . "/../vendor/autoload.php";

use pmill\Chat\parsedown\ParseDownExtension;

$roomId = isset($_GET['room']) && !empty($_GET['room']) ? ((integer)$_GET['room']) : 0;

$db = \pmill\Chat\Database\DBDriver::getDatabase();

$smt = $db->prepare("SELECT * FROM chat_room_messages WHERE chat_room_id = :room ;");
$smt->execute([
    'room' => $roomId
]);

$messages = [];
$parsedown = new ParseDownExtension();
$parsedown->setSafeMode(true)
    ->setBreaksEnabled(true);

foreach ($smt->fetchAll(PDO::FETCH_ASSOC) as $message) {
    $messages[] = [
        'account_name' => $message['account_name'],
        'chat_message' => $parsedown->line($message['chat_message']),
        'timestamp' => $message['chat_date']
    ];
}

die(
    json_encode([
        'messages' => $messages
    ])
);