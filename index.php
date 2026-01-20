<?php 
include 'db.php'; // On ouvre le tuyau

// On récupère le prix de l'hiver
$stmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'winter_price'");
$priceFromDB = $stmt->fetchColumn();

// Si la base est vide, on met 95 par défaut
if (!$priceFromDB) { $priceFromDB = 95; }
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Appartement - Style Airbnb</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>

<body class="bg-white text-gray-900">

    <nav class="border-b px-8 py-4 flex justify-between items-center sticky top-0 bg-white z-50">
        <div class="text-rose-500 font-bold text-2xl">MonLogis</div>
        <div class="hidden md:flex gap-6 font-medium text-sm text-gray-600">
            <a href="#">Logement</a> <a href="#">Équipements</a> <a href="#">Localisation</a>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-8 py-6">
        <h1 class="text-2xl font-semibold mb-4">Bel appartement au calme</h1>

        <div class="relative grid grid-cols-4 grid-rows-2 gap-2 h-[450px] rounded-xl overflow-hidden mb-8">
            <div class="col-span-2 row-span-2 bg-gray-200">
                <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200" class="w-full h-full object-cover">
            </div>
            <div class="bg-gray-200"><img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600" class="w-full h-full object-cover"></div>
            <div class="bg-gray-200"><img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600" class="w-full h-full object-cover"></div>
            <div class="bg-gray-200"><img src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=600" class="w-full h-full object-cover"></div>
            <div class="bg-gray-200"><img src="https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600" class="w-full h-full object-cover"></div>
            
            <button onclick="openGallery()" class="absolute bottom-4 right-4 bg-white border border-black px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-gray-100 flex items-center gap-2">
                Afficher toutes les photos
            </button>
        </div>

        <div class="flex flex-col md:flex-row gap-16">
            <div class="flex-1">
                <h2 class="text-xl font-semibold border-b pb-6">Logement entier : appartement · 4 voyageurs</h2>
                <div class="py-8 border-b">
                    <h3 class="text-xl font-semibold mb-4">Équipements</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <span>💻 Travail</span> <span>🌐 Wifi</span> <span>🚗 Parking</span> <span>❄️ Clim</span>
                    </div>
                </div>
            </div>

            <div class="w-full md:w-[380px]">
                <div class="sticky top-28 border rounded-xl p-6 shadow-xl bg-white">
                    <div class="flex justify-between items-center mb-4 text-xl font-bold">
                        <span>95€ <span class="text-sm font-normal text-gray-500">par nuit</span></span>
                    </div>

                    <div class="border rounded-lg mb-4 p-2">
                        <label class="text-[10px] font-bold uppercase">Dates de séjour</label>
                        <input type="text" id="calendar-input" placeholder="Ajouter des dates" class="w-full text-sm outline-none">
                    </div>

                    <button id="book-btn" class="w-full py-3 bg-rose-600 text-white font-bold rounded-lg mb-4 hover:bg-rose-700">
                        Réserver
                    </button>
                    
                    <div id="price-summary" class="hidden space-y-3 border-t pt-4">
                        <div class="flex justify-between"><span>Total</span> <span id="total-val">0€</span></div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <div id="gallery-modal" class="fixed inset-0 bg-white z-[100] hidden overflow-y-auto p-12">
        <button onclick="closeGallery()" class="fixed top-6 left-6 font-bold text-xl">X</button>
        <div class="max-w-3xl mx-auto space-y-4">
            <h2 class="text-2xl font-bold mb-6">Toutes les photos</h2>
            <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200" class="w-full rounded-lg">
            <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200" class="w-full rounded-lg">
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script>

        const pricePerNight = <?php echo $priceFromDB ? $priceFromDB : 95; ?>;
        // Fonctions pour la Galerie
        function openGallery() { document.getElementById('gallery-modal').classList.remove('hidden'); }
        function closeGallery() { document.getElementById('gallery-modal').classList.add('hidden'); }

        flatpickr("#calendar-input", {
            mode: "range",
            minDate: "today",
            dateFormat: "d/m/Y",
            "locale": "fr",
            // On permet de cliquer sur tous les jours, MAIS...
            onChange: function(selectedDates, dateStr, instance) {
                // Si l'utilisateur a choisi une date de début
                if (selectedDates.length === 1) {
                    // Si ce n'est pas un samedi (6), on annule et on prévient
                    if (selectedDates[0].getDay() !== 6) {
                        alert("Les arrivées se font uniquement le samedi.");
                        instance.clear();
                        return;
                    }
                }

                // Si l'utilisateur a choisi la date de fin
                if (selectedDates.length === 2) {
                    const d1 = selectedDates[0];
                    const d2 = selectedDates[1];
                    const nights = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));

                    // Vérification : est-ce que le départ est un samedi ET est-ce que c'est bien 7, 14, 21 nuits ?
                    if (d2.getDay() !== 6 || nights % 7 !== 0) {
                        alert("Les séjours doivent se faire par semaines complètes (du samedi au samedi).");
                        instance.clear();
                        return;
                    }

                    // Si tout est OK, on affiche le prix
                    document.getElementById('total-val').innerText = (nights * pricePerNight) + "€";
                    document.getElementById('price-summary').classList.remove('hidden');
                }
            }
        });

    </script>
</body>
</html>