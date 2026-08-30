import { ADRESSE, COORDONNEES } from "@/lib/site";

const { latitude, longitude } = COORDONNEES;

// Cadrage autour de la résidence : assez large pour situer la station,
// assez serré pour distinguer les rues.
const MARGE_LON = 0.008;
const MARGE_LAT = 0.004;
const bbox = [
  longitude - MARGE_LON,
  latitude - MARGE_LAT,
  longitude + MARGE_LON,
  latitude + MARGE_LAT,
].join(",");

// OpenStreetMap plutôt que Google Maps : la carte s'affiche sans cookie ni
// traceur, donc sans bandeau de consentement à ajouter — le site n'en pose
// aucun aujourd'hui et ce serait dommage d'en arriver là pour une carte.
const CARTE_OSM =
  `https://www.openstreetmap.org/export/embed.html` +
  `?bbox=${encodeURIComponent(bbox)}&layer=mapnik` +
  `&marker=${latitude}%2C${longitude}`;

// Les liens d'itinéraire, eux, ne déclenchent rien tant qu'on ne clique pas.
const ITINERAIRE_GOOGLE = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
const ITINERAIRE_APPLE = `https://maps.apple.com/?daddr=${latitude},${longitude}`;

export function LocationMap() {
  return (
    <div className="mt-12">
      <div className="overflow-hidden rounded-lg border border-wood-700 bg-anthracite-700">
        <iframe
          src={CARTE_OSM}
          title="Carte de situation de la résidence Les Terrasses de Risoul"
          loading="lazy"
          referrerPolicy="no-referrer"
          className="block h-[320px] w-full border-0 sm:h-[400px]"
        />
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <address className="text-base leading-relaxed text-mist-400 not-italic">
          Résidence Les Terrasses de Risoul
          <br />
          {ADRESSE.rue}
          <br />
          {ADRESSE.codePostal} {ADRESSE.ville}, {ADRESSE.region}
        </address>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-[0.16em] uppercase">
          <a
            href={ITINERAIRE_GOOGLE}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 text-wood-500 underline underline-offset-4 hover:text-wood-300"
          >
            Itinéraire Google Maps
          </a>
          <a
            href={ITINERAIRE_APPLE}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 text-wood-500 underline underline-offset-4 hover:text-wood-300"
          >
            Itinéraire Plans
          </a>
        </div>
      </div>
    </div>
  );
}
