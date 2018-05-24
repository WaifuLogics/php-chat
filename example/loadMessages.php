<?php
header('Content-Type: application/json');
require_once __DIR__ . "/../vendor/autoload.php";
$roomId = isset($_GET['room']) && !empty($_GET['room']) ? ((integer)$_GET['room']) : 0;

$db = \pmill\Chat\Database\DBDriver::getDatabase();

$smt = $db->prepare("SELECT * FROM chat_room_messages WHERE chat_room_id = :room ;");
$smt->execute([
    'room' => $roomId
]);

die(
    json_encode([
        'messages' => $smt->fetchAll(PDO::FETCH_ASSOC)
    ])
);