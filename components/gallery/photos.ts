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
  { id: "salon", alt: "Salon", count: 2 },
  { id: "chambre-1", alt: "Chambre 1", count: 2 },
  { id: "chambre-2", alt: "Chambre 2", count: 1 },
  { id: "coin-montagne", alt: "Coin montagne (clic-clac)", count: 2 },
  { id: "cuisine", alt: "Cuisine", count: 1 },
  { id: "entree", alt: "Entrée", count: 1 },
  { id: "toilette", alt: "Toilettes — rangement chaussures de ski", count: 1 },
  { id: "dortoir", alt: "Dortoir", count: 4 },
  { id: "salle-de-bain-1", alt: "Salle de bain 1", count: 1 },
  { id: "salle-de-bain-2", alt: "Salle de bain 2", count: 1 },
  { id: "terrasse", alt: "Terrasse / balcon", count: 1 },
  { id: "vue-drone-station", alt: "Vue drone de la station", count: 1 },
  { id: "vue-haut-station", alt: "Vue depuis le haut de la station", count: 1 },
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
