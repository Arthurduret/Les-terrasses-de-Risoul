export type BusinessCategory =
  | "boulangerie"
  | "courses"
  | "restaurant"
  | "loisir"
  | "ski";

export interface LocalBusiness {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  // Réservé pour mettre en avant des commerces partenaires plus tard
  // (mise en forme spéciale, tri en tête de liste, etc.) — false par défaut.
  featured: boolean;
}

export const LOCAL_BUSINESSES: LocalBusiness[] = [
  {
    id: "le-fournil",
    name: "Le Fournil",
    category: "boulangerie",
    description: "Boulangerie artisanale",
    featured: false,
  },
  {
    id: "le-pain-des-pistes",
    name: "Le Pain des Pistes",
    category: "boulangerie",
    description: "Boulangerie-pâtisserie",
    featured: false,
  },
  {
    id: "feuillassier",
    name: "Boucherie Feuillassier",
    category: "courses",
    description: "Boucherie traditionnelle",
    featured: false,
  },
  {
    id: "proxi-spar",
    name: "Proxi / Spar",
    category: "courses",
    description: "Supérette de proximité",
    featured: false,
  },
  {
    id: "le-chardon-bleu",
    name: "Le Chardon Bleu",
    category: "restaurant",
    description: "Restaurant",
    featured: false,
  },
  {
    id: "lecureuil",
    name: "L'Écureuil",
    category: "restaurant",
    description: "Restaurant",
    featured: false,
  },
  {
    id: "cine-foret-blanche",
    name: "Ciné la Forêt Blanche",
    category: "loisir",
    description: "Cinéma de la station",
    featured: false,
  },
  {
    id: "skiseo",
    name: "Centre aqualudique Skiseo",
    category: "loisir",
    description: "Piscine et espace aquatique",
    featured: false,
  },
  {
    id: "tyrolienne-geante",
    name: "Tyrolienne géante",
    category: "loisir",
    description: "Sensations fortes au-dessus des pistes",
    featured: false,
  },
  {
    id: "esf-risoul",
    name: "ESF Risoul",
    category: "ski",
    description: "Cours de ski pour tous niveaux",
    featured: false,
  },
];

export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  boulangerie: "Boulangeries",
  courses: "Courses",
  restaurant: "Restaurants",
  loisir: "Loisirs",
  ski: "Ski & cours",
};

const CATEGORY_ORDER: BusinessCategory[] = [
  "boulangerie",
  "courses",
  "restaurant",
  "loisir",
  "ski",
];

export interface BusinessGroup {
  category: BusinessCategory;
  businesses: LocalBusiness[];
}

export function groupBusinessesByCategory(
  businesses: LocalBusiness[]
): BusinessGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    businesses: businesses
      .filter((b) => b.category === category)
      .sort((a, b) => Number(b.featured) - Number(a.featured)),
  })).filter((group) => group.businesses.length > 0);
}
