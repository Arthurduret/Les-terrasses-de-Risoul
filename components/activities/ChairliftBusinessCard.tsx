"use client";

import { useEffect, useId, useRef } from "react";
import type { LocalBusiness } from "./local-businesses";

interface ChairliftBusinessCardProps {
  business: LocalBusiness;
}

// Hauteur d'un "wagon" (câble + siège + personnage) dans le motif répété,
// égale à la hauteur du viewBox (0 0 100 260) : un seul wagon, centré,
// remplit la fenêtre de la carte à la fois — le suivant ne fait son
// entrée qu'en scrollant, plutôt que d'en voir deux empilés en
// permanence. Motif SVG <pattern>, pas des wagons dessinés un par un,
// pour un défilement infini sans point de bouclage à gérer.
const TILE_HEIGHT = 260;
// Vitesse de défilement : unités de motif par pixel de scroll.
const SCROLL_SPEED = 0.35;

// Variante test de LocalBusinessCard, vue de face : un câble continu sur
// lequel défilent des sièges au fil du scroll (translation du motif via
// l'attribut patternTransform, recalculée par scroll+rAF — même
// technique que SkiTraceDivider, sans re-render React).
export function ChairliftBusinessCard({ business }: ChairliftBusinessCardProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<SVGPatternElement>(null);
  const patternId = useId();
  // Défensif : ce composant n'est censé être monté que pour les
  // commerces où accentColor est défini (voir la condition dans page.tsx).
  const accentColor = business.accentColor ?? "var(--color-wood-500)";

  useEffect(() => {
    const scene = sceneRef.current;
    const pattern = patternRef.current;
    if (!scene || !pattern) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      // Le wagon est déjà centré dans la tuile (voir les coordonnées
      // ci-dessous) : décalage nul = un wagon entier, immobile, bien cadré.
      pattern.setAttribute("patternTransform", "translate(0, 0)");
      return;
    }

    let ticking = false;

    function update() {
      const rect = scene!.getBoundingClientRect();
      const offset = ((window.innerHeight - rect.top) * SCROLL_SPEED) % TILE_HEIGHT;
      pattern!.setAttribute("patternTransform", `translate(0, ${offset})`);
    }

    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="group border border-foreground/10 bg-anthracite-800 p-6 transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:border-wood-500/45">
      <div ref={sceneRef} className="relative -mx-1 h-64 w-[calc(100%+0.5rem)] overflow-hidden" aria-hidden="true">
        <svg
          viewBox="0 0 100 260"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <pattern
              ref={patternRef}
              id={patternId}
              x="0"
              y="0"
              width="100"
              height={TILE_HEIGHT}
              patternUnits="userSpaceOnUse"
            >
              {/* Câble : une ligne continue par tuile, bout à bout d'une
                  tuile à l'autre une fois répétée -> un seul trait sans
                  coupure sur toute la hauteur de la scène. */}
              <line
                x1="50"
                y1="0"
                x2="50"
                y2={TILE_HEIGHT}
                stroke="var(--color-wood-700)"
                strokeWidth="1.5"
                strokeDasharray="1 3"
              />

              {/* Siège — centré au milieu de la tuile (y=130) pour qu'un
                  wagon entier soit bien cadré dans la fenêtre au repos. */}
              <rect x="30" y="135" width="40" height="4" rx="2" fill="var(--color-wood-700)" />
              {/* Barre de sécurité */}
              <path
                d="M 30 137 Q 50 145 70 137"
                fill="none"
                stroke="var(--color-wood-700)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Personnage, vu de face */}
              <circle cx="50" cy="111" r="6" fill={accentColor} />
              <rect x="41" y="115" width="18" height="18" rx="6" fill={accentColor} />
              <line x1="41" y1="121" x2="34" y2="135" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="59" y1="121" x2="66" y2="135" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="44" y1="139" x2="40" y2="153" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="56" y1="139" x2="60" y2="153" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="40" cy="155" r="2.2" fill="var(--color-mist-700)" />
              <circle cx="60" cy="155" r="2.2" fill="var(--color-mist-700)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="260" fill={`url(#${patternId})`} />
        </svg>
      </div>

      <div className="mt-1 text-[11px] tracking-[0.2em] text-mist-700 uppercase">
        {business.category}
      </div>
      <div className="mt-2 font-display text-2xl text-foreground">
        {business.name}
        {business.featured && (
          <span className="ml-2 rounded-full bg-ember-600/20 px-2 py-0.5 align-middle text-[10px] font-sans font-semibold tracking-wide text-ember-500 uppercase">
            Partenaire
          </span>
        )}
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-mist-500">
        {business.description}
      </p>
    </div>
  );
}
