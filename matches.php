<?php
header("Content-Type: application/json; charset=UTF-8");

include "db.php";

$stmt = $pdo->query("SELECT * FROM matches ORDER BY match_time");

echo json_encode($stmt->fetchAll());
