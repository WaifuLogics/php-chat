<?php
namespace pmill\Chat;

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