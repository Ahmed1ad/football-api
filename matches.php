<?php
header("Content-Type: application/json");
include "db.php";

$q = $pdo->query("SELECT * FROM matches");

echo json_encode($q->fetchAll(PDO::FETCH_ASSOC));
