import type { ACTIVITY_ICONS } from "./icons";

export interface Activity {
  title: string;
  description: string;
  icon: keyof typeof ACTIVITY_ICONS;
}

// Textes d'exemple à adapter avec les vraies infos locales (noms,
// distances, adresses).
export const ACTIVITIES: Activity[] = [
  {
    title: "Ski & pistes",
    description:
      "Le domaine skiable de Risoul, accessible à pied ou en quelques minutes.",
    icon: "ski",
  },
  {
    title: "Randonnée",
    description:
      "Des sentiers balisés autour de Risoul pour tous les niveaux, été comme hiver.",
    icon: "hike",
  },
  {
    title: "Restaurants locaux",
    description:
      "Quelques adresses de montagne à deux pas de l'appartement.",
    icon: "restaurant",
  },
  {
    title: "Village & commerces",
    description:
      "Commerces, marché et animations au cœur de la station.",
    icon: "shop",
  },
];
