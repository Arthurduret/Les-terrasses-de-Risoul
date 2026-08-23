"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Distance (px) au bas de la page à partir de laquelle le bouton apparaît.
const VISIBILITY_MARGIN_PX = 400;
// Durée de la "course" le long du tracé, jusqu'en haut de l'écran.
const LAUNCH_DURATION_MS = 1100;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Construit un tracé en petits virages (chicane) depuis la position du
// bouton (bas-droite) jusqu'en haut de l'écran, recalculé à chaque
// lancement pour s'adapter à la taille de fenêtre courante.
function buildLaunchPath(): string {
  const right = window.innerWidth - 44;
  const left = Math.max(24, window.innerWidth - 116);
  const bottom = window.innerHeight - 56;
  const top = 48;
  const segments = 5;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    points.push({
      x: i % 2 === 0 ? right : left,
      y: bottom + ((top - bottom) * i) / segments,
    });
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return d;
}

// Motoneige "figure" partagée entre le bouton au repos et le clone qui
// file le long du tracé au clic.
function SnowmobileIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 64" className={className} aria-hidden="true">
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
  );
}

// Bouton "remonter en haut de page", habillé en motoneige. Au clic, une
// deuxième motoneige (portail) démarre depuis le bouton et grimpe un
// tracé en petits virages jusqu'en haut de l'écran — le tracé se dessine
// au fur et à mesure, pendant que la page défile réellement vers le haut
// en parallèle. Respecte prefers-reduced-motion : saut instantané, pas de
// course animée.
export function ScrollToTopSnowmobile() {
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [pathD, setPathD] = useState("");
  const [mounted, setMounted] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Course le long du tracé une fois le clone monté (pathRef prêt).
  useEffect(() => {
    if (!launching) return;
    const path = pathRef.current;
    const icon = iconRef.current;
    if (!path || !icon) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);

    let raf = 0;
    const start = performance.now();

    function frame(now: number) {
      const t = Math.min(1, (now - start) / LAUNCH_DURATION_MS);
      const eased = easeInOutCubic(t);

      path!.style.strokeDashoffset = String(length * (1 - eased));

      const at = length * eased;
      const point = path!.getPointAtLength(at);
      const ahead = path!.getPointAtLength(Math.min(length, at + 2));
      const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
      icon!.style.transform = `translate(${point.x}px, ${point.y}px) rotate(${angle}deg) translate(-50%, -50%)`;

      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        setLaunching(false);
      }
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [launching]);

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (reduceMotion || launching) return;
    setPathD(buildLaunchPath());
    setLaunching(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Remonter en haut de la page"
        className={`fixed bottom-6 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-wood-500/45 bg-anthracite-800/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-wood-300 hover:-translate-y-1 sm:right-8 ${
          visible && !launching
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <SnowmobileIcon className="snowmobile-idle h-9 w-9" />
      </button>

      {mounted &&
        launching &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
            <svg className="h-full w-full">
              <path
                ref={pathRef}
                d={pathD}
                fill="none"
                stroke="var(--color-wood-500)"
                strokeOpacity="0.55"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1 6"
              />
            </svg>
            <div ref={iconRef} className="absolute left-0 top-0">
              <SnowmobileIcon className="h-10 w-10" />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
