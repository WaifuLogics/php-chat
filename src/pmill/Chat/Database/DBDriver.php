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

    public static function getDatabase() {
        return new PDO("mysql:host=localhost;dbname=it_connection;",
            'pro', '30Fos5L1Y');
    }

}