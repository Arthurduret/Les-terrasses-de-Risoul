export interface LocalBusiness {
  id: string;
  name: string;
  category: string;
  description: string;
  // Réservé pour mettre en avant des commerces partenaires plus tard
  // (mise en forme spéciale, tri en tête de liste, etc.) — false par défaut.
  featured: boolean;
}

export const LOCAL_BUSINESSES: LocalBusiness[] = [
  {
    id: "le-fournil",
    name: "Le Fournil",
    category: "Boulangerie",
    description:
      "Pains au levain, viennoiseries et sandwichs à emporter avant la première remontée.",
    featured: false,
  },
  {
    id: "le-pain-des-pistes",
    name: "Le Pain des Pistes",
    category: "Boulangerie",
    description:
      "La halte du retour de ski : brioches, tartes maison et chocolat chaud.",
    featured: false,
  },
  {
    id: "feuillassier",
    name: "Boucherie Feuillassier",
    category: "Boucherie",
    description:
      "Viandes du pays, saucisses et charcuteries de montagne pour les soirs de raclette.",
    featured: false,
  },
  {
    id: "proxi-spar",
    name: "Proxi / Spar",
    category: "Supérette",
    description:
      "Les courses du séjour au pied des résidences, ouvert tôt le matin et en fin de journée.",
    featured: false,
  },
  {
    id: "le-chardon-bleu",
    name: "Le Chardon Bleu",
    category: "Restaurant",
    description:
      "Cuisine savoyarde généreuse et carte du jour, à réserver le week-end.",
    featured: false,
  },
  {
    id: "lecureuil",
    name: "L'Écureuil",
    category: "Restaurant d'altitude",
    description:
      "Déjeuner en terrasse sur les pistes, face au massif de la Forêt Blanche.",
    featured: false,
  },
  {
    id: "cine-foret-blanche",
    name: "Ciné la Forêt Blanche",
    category: "Cinéma",
    description:
      "Séances tous les soirs en saison : la bonne idée des jours de mauvais temps.",
    featured: false,
  },
  {
    id: "skiseo",
    name: "Skiseo",
    category: "Centre aqualudique",
    description:
      "Bassins, espace bien-être et détente après une grosse journée de ski.",
    featured: false,
  },
  {
    id: "tyrolienne-geante",
    name: "Tyrolienne géante",
    category: "Sensations",
    description:
      "Un vol au-dessus de la station, l'une des plus longues des Alpes du Sud.",
    featured: false,
  },
  {
    id: "esf-risoul",
    name: "ESF Risoul",
    category: "École de ski",
    description:
      "Cours collectifs et particuliers, du Club Piou-Piou au hors-piste encadré.",
    featured: false,
  },
];

// Lettre d'initiale affichée dans le badge de la carte — on saute les
// articles ("Le ", "La ", "L'") pour retomber sur le mot notable.
export function getInitial(name: string): string {
  const stripped = name.replace(/^(Le |La |L['’])/i, "");
  return stripped.charAt(0).toUpperCase();
}
