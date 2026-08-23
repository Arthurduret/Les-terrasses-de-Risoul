"use client";

import { useEffect, useState } from "react";

// Distance (px) au bas de la page à partir de laquelle le bouton apparaît.
const VISIBILITY_MARGIN_PX = 400;

// Bouton "remonter en haut de page", habillé en motoneige — apparaît une
// fois proche du bas de la page. Respecte prefers-reduced-motion : saut
// instantané au clic plutôt qu'un défilement fluide, pas d'animation
// d'attente (voir globals.css).
export function ScrollToTopSnowmobile() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    function update() {
      const doc = document.documentElement;
      const nearBottom =
        window.scrollY + window.innerHeight >= doc.scrollHeight - VISIBILITY_MARGIN_PX;
      setVisible(nearBottom);
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
    window.addEventListener("resize", handleScroll);
    update();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Remonter en haut de la page"
      className={`fixed bottom-6 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-wood-500/45 bg-anthracite-800/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-wood-300 hover:-translate-y-1 sm:right-8 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg viewBox="0 0 110 64" className="snowmobile-idle h-9 w-9" aria-hidden="true">
        <circle
          cx="4"
          cy="48"
          r="2.4"
          className="snowmobile-puff"
          style={{ animationDelay: "-0.4s" }}
          fill="var(--foreground)"
        />
        <circle
          cx="-2"
          cy="44"
          r="1.7"
          className="snowmobile-puff"
          style={{ animationDelay: "-1s" }}
          fill="var(--foreground)"
        />

        <rect
          x="4"
          y="40"
          width="32"
          height="14"
          rx="7"
          fill="var(--color-anthracite-700)"
          stroke="var(--color-wood-700)"
          strokeWidth="1.5"
        />
        <line x1="10" y1="44" x2="10" y2="50" stroke="var(--color-wood-500)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="44" x2="18" y2="50" stroke="var(--color-wood-500)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="26" y1="44" x2="26" y2="50" stroke="var(--color-wood-500)" strokeWidth="1.5" strokeLinecap="round" />

        <path
          d="M32,47 C34,30 46,22 62,20 L84,19 C92,19 98,24 98,32 L98,42 L32,47 Z"
          fill="var(--color-anthracite-700)"
          stroke="var(--color-wood-500)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d="M98,42 Q108,42 108,30"
          fill="none"
          stroke="var(--color-wood-500)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <path
          d="M66,20 L72,4 L80,6 L78,20 Z"
          fill="var(--color-wood-300)"
          fillOpacity="0.18"
          stroke="var(--color-wood-500)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <circle cx="94" cy="30" r="3" fill="var(--color-wood-500)" />

        <line x1="70" y1="6" x2="78" y2="6" stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="74" y1="6" x2="74" y2="19" stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round" />

        <line x1="59" y1="15" x2="73" y2="10" stroke="var(--color-ember-600)" strokeWidth="3" strokeLinecap="round" />

        <rect x="55" y="10" width="15" height="18" rx="6" fill="var(--color-ember-600)" />
        <circle cx="62" cy="6" r="6" fill="var(--foreground)" />
      </svg>
    </button>
  );
}
