<?php
/**
 * Created by PhpStorm.
 * User: duncte123
 * Date: 24-May-18
 * Time: 10:14
 */

namespace pmill\Chat\Database;


use PDO;

class DBDriver
{
    private static $database;

    public static function getDatabase() {
        if(self::$database == null) {
            self::$database = new PDO("mysql:host=protask.duncte123.me;dbname=it_connection;",
                'pro', '30Fos5L1Y');
        }
        return new PDO("mysql:host=protask.duncte123.me;dbname=it_connection;",
            'pro', '30Fos5L1Y');
    }

}