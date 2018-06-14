<?php
namespace pmill\Chat;

use pmill\Chat\Database\DBDriver;
use pmill\Chat\Interfaces\ConnectedClientInterface;
use pmill\Chat\parsedown\ParseDownExtension;
use Ratchet\ConnectionInterface;

class BasicMultiRoomServer extends AbstractMultiRoomServer
{

    private $parsedown;

    public function __construct()
    {
        parent::__construct();
        $this->parsedown = new ParseDownExtension();
        $this->parsedown->setSafeMode(true)
                        ->setBreaksEnabled(true);
    }

    protected function makeUserWelcomeMessage(ConnectedClientInterface $client, $timestamp)
    {
        return vsprintf('Welcome %s!', array($client->getName()));
    }

    protected function makeUserConnectedMessage(ConnectedClientInterface $client, $timestamp)
    {
        return vsprintf('%s has connected', array($client->getName()));
    }

    protected function makeUserDisconnectedMessage(ConnectedClientInterface $client, $timestamp)
    {
        return vsprintf('%s has left', array($client->getName()));
    }

    protected function makeMessageReceivedMessage(ConnectedClientInterface $from, $message, $timestamp)
    {
        return $this->parsedown->line($message);
    }

    protected function logMessageReceived(ConnectedClientInterface $from, $roomId, $message, $timestamp)
    {
        /** save messages to a database, etc... */
        echo 'Saving message to database' . PHP_EOL;
        $db = DBDriver::getDatabase();
        echo 'Got database' . PHP_EOL;
        $smt = $db->prepare("
                                  INSERT INTO chat_room_messages(chat_room_id, account_name, chat_message, chat_date)
                                  VALUES (:chat_room_id , :account_name , :message , :chat_date )
                                  ");
        echo 'Made statements' . PHP_EOL;

        if (!$smt) {
            echo "\nPDO::errorInfo():\n";
        }

        $result = $smt->execute([
            'chat_room_id' => $roomId,
            'account_name' => $from->getName(),
            'message' => $message,
            'chat_date' => $timestamp
        ]);
        echo 'Timestamp: ' . $timestamp . PHP_EOL;
        echo 'Executed' . PHP_EOL;

        echo $result . PHP_EOL;
        print_r($db->errorInfo());
        echo PHP_EOL;
    }

    protected function createClient(ConnectionInterface $conn, $name)
    {
        $client = new ConnectedClient;
        $client->setResourceId($conn->resourceId);
        $client->setConnection($conn);
        $client->setName($name);

        return $client;
    }

}