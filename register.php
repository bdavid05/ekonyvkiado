<?php
// Adatbázis kapcsolódás beállításai
$servername = "localhost"; // Az adatbázis szerver címe
$username = "root"; // Az adatbázis felhasználónév
$password = ""; // Az adatbázis jelszó
$database = "lapozzfel"; // Az adatbázis neve

// Kapcsolódás az adatbázishoz
$conn = new mysqli($servername, $username, $password, $database);

// Kapcsolódási hiba ellenőrzése
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Kapcsolódás sikertelen: " . $conn->connect_error]));
}

// Beérkező adatok JSON formátumban
$data = json_decode(file_get_contents("php://input"), true);

// Adatok kinyerése
$username = $conn->real_escape_string($data['username']);
$email = $conn->real_escape_string($data['email']);
$password = $conn->real_escape_string($data['password']);
$profile_picture = $conn->real_escape_string($data['profile_picture']);

// Jelszó titkosítása
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// SQL lekérdezés az adatok beszúrására
$sql = "INSERT INTO users (username, email, password, profile_picture) VALUES ('$username', '$email', '$hashed_password', '$profile_picture')";

// Lekérdezés végrehajtása
if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Sikeresen regisztráltál!"]);
} else {
    echo json_encode(["success" => false, "message" => "Hiba: " . $conn->error]);
}

// Kapcsolat bezárása
$conn->close();
?>
