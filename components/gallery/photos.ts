export interface Photo {
  filename: string;
  alt: string;
}

// Photos attendues dans /public/images/apartment/.
// Déposer un fichier portant exactement l'un de ces noms remplace
// automatiquement le placeholder correspondant — aucune modification de
// code n'est nécessaire. Formats attendus : .jpg (adapter l'extension
// dans photoSrc ci-dessous si un autre format est utilisé).
export const APARTMENT_PHOTOS: Photo[] = [
  { filename: "sejour.jpg", alt: "Séjour avec vue sur les pistes" },
  { filename: "chambre-1.jpg", alt: "Chambre principale" },
  { filename: "chambre-2.jpg", alt: "Deuxième chambre" },
  { filename: "cuisine.jpg", alt: "Cuisine équipée" },
  { filename: "salle-de-bain.jpg", alt: "Salle de bain" },
  { filename: "terrasse.jpg", alt: "Terrasse et vue sur la montagne" },
  { filename: "exterieur.jpg", alt: "Vue extérieure de la résidence" },
  { filename: "sejour-hiver.jpg", alt: "Le séjour sous la neige" },
];

export function photoSrc(filename: string): string {
  return `/images/apartment/${filename}`;
}
