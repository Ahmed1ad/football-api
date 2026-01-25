<?php

$dsn = "pgsql:host=ep-bold-rice-a4pm6qq-pooler.c-3.us-east-1.aws.neon.tech;dbname=neondb;sslmode=require";

$user = "neondb_owner";
$pass = "ngB_1HprOf0a5M";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("DB Connection Failed");
}
