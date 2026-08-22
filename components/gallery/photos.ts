export interface Space {
  id: string;
  alt: string;
  count: number;
}

export interface Photo {
  filename: string;
  alt: string;
  spaceId: string;
}

// Espaces de l'appartement, avec le nombre de photos disponibles pour
// chacun. Convention de nommage des fichiers dans
// /public/images/apartment/ :
//
//   {id-de-l-espace}-{numéro}.jpg     (numéro à partir de 1, TOUJOURS
//   présent, même s'il n'y a qu'une seule photo pour cet espace)
//
// Exemples : chambre-1-1.jpg, chambre-1-2.jpg, sejour-1.jpg
//
// Pour ajouter une photo à un espace existant, incrémente simplement
// `count` ci-dessous et dépose le fichier au bon numéro — aucune autre
// modification de code n'est nécessaire. Pour un nouvel espace, ajoute une
// entrée à la liste.
export const APARTMENT_SPACES: Space[] = [
  { id: "sejour", alt: "Séjour avec vue sur les pistes", count: 1 },
  { id: "chambre-1", alt: "Chambre principale", count: 2 },
  { id: "chambre-2", alt: "Deuxième chambre", count: 1 },
  { id: "cuisine", alt: "Cuisine équipée", count: 1 },
  { id: "salle-de-bain", alt: "Salle de bain", count: 1 },
  { id: "terrasse", alt: "Terrasse et vue sur la montagne", count: 1 },
  { id: "exterieur", alt: "Vue extérieure de la résidence", count: 1 },
  { id: "sejour-hiver", alt: "Le séjour sous la neige", count: 1 },
];

export function photoSrc(filename: string): string {
  return `/images/apartment/${filename}`;
}

export function getSpacePhotos(space: Space): Photo[] {
  return Array.from({ length: space.count }, (_, i) => ({
    filename: `${space.id}-${i + 1}.jpg`,
    alt: space.count > 1 ? `${space.alt} — vue ${i + 1}` : space.alt,
    spaceId: space.id,
  }));
}

// Liste à plat de toutes les photos, dans l'ordre des espaces — utilisée
// par le carrousel/lightbox pour naviguer à travers tout, y compris
// plusieurs photos d'un même espace à la suite.
export const APARTMENT_PHOTOS: Photo[] = APARTMENT_SPACES.flatMap(getSpacePhotos);
