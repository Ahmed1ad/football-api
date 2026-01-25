<?php

$dsn = "pgsql:host=ep-xxx.neon.tech;dbname=YOUR_DB;sslmode=require";
$user = "YOUR_USER";
$pass = "YOUR_PASS";

$pdo = new PDO($dsn, $user, $pass);
