<?php
require_once __DIR__ . "/../config/auth.php";
require_once __DIR__ . "/../config/database.php";
require_login();

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$lat = $data["latitude"] ?? null;
$lng = $data["longitude"] ?? null;
$accuracy = $data["accuracy"] ?? null;
$jamaahId = $_SESSION["jamaah_id"] ?? null;

if (!$jamaahId || !$lat || !$lng) {
    http_response_code(422);
    echo json_encode(["ok" => false, "message" => "Data lokasi tidak lengkap"]);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO locations (jamaah_id, latitude, longitude, accuracy, created_at) VALUES (?,?,?,?,NOW())");
$stmt->execute([$jamaahId, $lat, $lng, $accuracy]);

echo json_encode(["ok" => true]);
