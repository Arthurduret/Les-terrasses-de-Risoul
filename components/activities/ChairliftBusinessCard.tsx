"use client";

import { useEffect, useRef } from "react";
import type { LocalBusiness } from "./local-businesses";

interface ChairliftBusinessCardProps {
  business: LocalBusiness;
}

// Piste de déplacement du siège, en unités du viewBox (0 0 100 220).
const TRACK_TOP = 34;
const TRACK_BOTTOM = 186;

// Variante test de LocalBusinessCard : le badge/initiale est remplacé par
// une scène de télésiège dont le siège se déplace verticalement au fil du
// scroll — même technique que SkiTraceDivider (progression recalculée par
// scroll+rAF, transform posé directement en style, pas de re-render React).
export function ChairliftBusinessCard({ business }: ChairliftBusinessCardProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<SVGGElement>(null);
  // Défaut défensif : ce composant n'est censé être monté que pour les
  // commerces où accentColor est défini (voir la condition dans page.tsx).
  const accentColor = business.accentColor ?? "var(--color-wood-500)";

  useEffect(() => {
    const scene = sceneRef.current;
    const car = carRef.current;
    if (!scene || !car) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      car.style.transform = `translate(50px, ${(TRACK_TOP + TRACK_BOTTOM) / 2}px)`;
      return;
    }

    let ticking = false;

    function update() {
      const rect = scene!.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(
          1,
          (window.innerHeight - rect.top) / (rect.height + window.innerHeight)
        )
      );
      const y = TRACK_TOP + (TRACK_BOTTOM - TRACK_TOP) * progress;
      car!.style.transform = `translate(50px, ${y}px)`;
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
      <div ref={sceneRef} className="relative -mx-1 h-56 w-[calc(100%+0.5rem)]" aria-hidden="true">
        <svg
          viewBox="0 0 100 220"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
        >
          <line
            x1="50"
            y1="0"
            x2="50"
            y2="220"
            stroke="var(--color-wood-700)"
            strokeWidth="1.5"
            strokeDasharray="1 3"
          />

          <line
            x1="22"
            y1="16"
            x2="78"
            y2="16"
            stroke="var(--color-wood-500)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line x1="50" y1="0" x2="50" y2="16" stroke="var(--color-wood-500)" strokeWidth="3" />
          <circle cx="50" cy="16" r="2.4" fill="var(--color-wood-500)" />

          <line
            x1="26"
            y1="204"
            x2="74"
            y2="204"
            stroke="var(--color-wood-700)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <g ref={carRef} style={{ willChange: "transform" }}>
            <line x1="0" y1="-16" x2="0" y2="-2" stroke="var(--color-mist-700)" strokeWidth="1.5" />
            <rect x="-16" y="-2" width="32" height="4" rx="2" fill="var(--color-wood-700)" />

            <line
              x1="-9"
              y1="2"
              x2="-15"
              y2="9"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="9"
              y1="2"
              x2="15"
              y2="9"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
            />

            <rect x="-7" y="-19" width="14" height="15" rx="4" fill={accentColor} />
            <circle cx="0" cy="-25" r="5" fill={accentColor} />
          </g>
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
