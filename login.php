<?php
header('Content-Type: application/json');
$servername = "localhost"; // Adatbázis szerver neve
$username = "root"; // Adatbázis felhasználónév
$password = ""; // Adatbázis jelszó
$dbname = "lapozzfel"; // Adatbázis neve

// Kapcsolódás az adatbázishoz
$conn = new mysqli($servername, $username, $password, $dbname);

// Ellenőrizzük a kapcsolatot
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Kérjük a JSON adatokat
$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'];
$password = $data['password'];

// Bejelentkezési lekérdezés
$sql = "SELECT id, password, profile_picture FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($id, $hashed_password, $profile_picture);
$stmt->fetch();

if ($stmt->num_rows > 0 && password_verify($password, $hashed_password)) {
    echo json_encode(["success" => true, "id" => $id, "profile_picture" => $profile_picture]);
} else {
    echo json_encode(["success" => false, "message" => "Hibás e-mail vagy jelszó."]);
}

$stmt->close();
$conn->close();
?>
