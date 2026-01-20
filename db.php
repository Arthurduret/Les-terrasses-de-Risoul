<?php
// Configuration pour ton PC (XAMPP)
$host = '127.0.0.1';
$port = '3307'; // Ton port MySQL personnalisé
$dbname = 'risoul_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>