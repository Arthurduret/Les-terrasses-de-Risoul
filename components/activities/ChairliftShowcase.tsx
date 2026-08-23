"use client";

import { useEffect, useRef, useState } from "react";
import type { LocalBusiness } from "./local-businesses";

interface ChairliftShowcaseProps {
  businesses: LocalBusiness[];
}

// Défilement dédié à chaque commerce avant de passer au suivant.
const DWELL_PX = 260;
// Amplitude de la petite montée le long du câble pendant ce défilement.
const SEGMENT_TRAVEL = 34;

// Scène partagée (pas une par commerce) : une cabine glisse sur un câble
// en diagonale, et le nom affiché passe d'un commerce au suivant au fil
// du scroll — inspirée d'une maquette Canva fournie par l'utilisateur.
// La cabine reste en position "sticky" pendant que la page défile sur la
// hauteur du conteneur ; la position le long du câble est pilotée par
// scroll+rAF (transform en style direct, pas de re-render), le nom
// affiché ne déclenche un re-render que lorsqu'on change de commerce.
export function ChairliftShowcase({ businesses }: ChairliftShowcaseProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cabinRef = useRef<SVGGElement>(null);
  const indexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const cabin = cabinRef.current;
    if (!wrapper || !cabin || businesses.length === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      cabin.style.transform = "translate(0, 0)";
      return;
    }

    let ticking = false;

    function update() {
      const rect = wrapper!.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight * 0.6);
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));

      const rawIndex = progress * businesses.length;
      const index = Math.min(businesses.length - 1, Math.floor(rawIndex));
      const withinProgress = rawIndex - index;

      const glide = withinProgress * SEGMENT_TRAVEL;
      cabin!.style.transform = `translate(${glide}px, ${-glide}px)`;

      if (index !== indexRef.current) {
        indexRef.current = index;
        setCurrentIndex(index);
      }
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
  }, [businesses.length]);

  if (businesses.length === 0) return null;

  const current = businesses[currentIndex];
  const accentColor = current.accentColor ?? "var(--color-wood-500)";

  return (
    <div
      ref={wrapperRef}
      style={{ height: businesses.length * DWELL_PX }}
      className="relative"
    >
      <div className="sticky top-24 flex flex-col items-center gap-8 overflow-hidden py-6 sm:flex-row sm:justify-center">
        <div className="relative h-56 w-56 shrink-0 sm:h-64 sm:w-64" aria-hidden="true">
          <svg viewBox="0 0 300 300" className="h-full w-full">
            <line
              x1="20"
              y1="280"
              x2="280"
              y2="20"
              stroke="var(--color-wood-700)"
              strokeWidth="2"
              strokeDasharray="1 4"
            />

            <g ref={cabinRef} transform="translate(140, 160)" style={{ willChange: "transform" }}>
              <line x1="0" y1="-40" x2="0" y2="-18" stroke="var(--color-mist-700)" strokeWidth="2" />
              <rect
                x="-22"
                y="-18"
                width="44"
                height="34"
                rx="9"
                fill="var(--color-anthracite-800)"
                stroke={accentColor}
                strokeWidth="2"
              />
              <line x1="-13" y1="-9" x2="13" y2="-9" stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.55" />

              <circle cx="0" cy="-1" r="5.5" fill={accentColor} />
              <rect x="-6.5" y="4" width="13" height="11" rx="4.5" fill={accentColor} />

              <line x1="-8" y1="16" x2="-16" y2="30" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="8" y1="16" x2="16" y2="30" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        <div className="text-center sm:text-left">
          <p className="text-xs tracking-[0.28em] text-wood-500 uppercase">
            Sur le télésiège
          </p>
          <p
            className="mt-2 font-display text-3xl text-foreground transition-colors duration-300 sm:text-4xl"
            style={{ color: accentColor }}
          >
            {current.name}
          </p>
          <p className="mt-1 text-sm text-mist-500">{current.category}</p>
        </div>
      </div>
    </div>
  );
}
