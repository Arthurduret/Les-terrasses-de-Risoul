// Adresse canonique du site, source unique.
//
// Elle etait recopiee dans app/layout.tsx, app/(public)/page.tsx,
// app/sitemap.ts et app/robots.ts : quatre endroits a corriger le jour d'un
// changement de domaine, et autant d'occasions d'en oublier un.
export const SITE_URL = "https://lesterrassesderisoul.fr";

// Emplacement de la residence. Sert a la fois aux donnees structurees
// (schema.org) et a la carte de la page d'accueil : une seule verite, pour
// que Google et le visiteur ne voient jamais deux endroits differents.
export const ADRESSE = {
  rue: "ZAC Les Chalps",
  codePostal: "05600",
  ville: "Risoul",
  region: "Hautes-Alpes",
  pays: "FR",
} as const;

// 44°37'23.5"N 6°38'05.4"E, confirmees par le proprietaire et concordantes
// avec le geocodeur officiel (api-adresse.data.gouv.fr) a un metre pres.
export const COORDONNEES = {
  latitude: 44.623194,
  longitude: 6.634833,
} as const;
