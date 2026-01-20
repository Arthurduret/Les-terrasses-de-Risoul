<?php
// admin.php
// ICI : Ajouter un système de mot de passe plus tard pour la sécurité
include 'db.php'; 

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $newPrice = $_POST['price'];
    $stmt = $pdo->prepare("UPDATE settings SET setting_value = ? WHERE setting_key = 'winter_price'");
    $stmt->execute([$newPrice]);
    echo "<p style='color:green;'>Prix mis à jour !</p>";
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Administration - Les Terrasses de Risoul</title>
</head>
<body class="bg-gray-100 p-10">
    <div class="max-w-lg mx-auto bg-white p-8 rounded-xl shadow">
        <h1 class="text-2xl font-bold mb-6">Configuration du Chalet</h1>
        
        <form method="POST">
            <label class="block mb-2 font-semibold">Prix par nuit (Hiver) :</label>
            <input type="number" name="price" class="w-full border p-2 rounded mb-4" placeholder="Ex: 120">
            
            <label class="block mb-2 font-semibold">Code Promo :</label>
            <input type="text" name="promo" class="w-full border p-2 rounded mb-4" placeholder="Ex: RISOUL10">
            
            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded font-bold">Enregistrer les réglages</button>
        </form>
    </div>
</body>
</html>