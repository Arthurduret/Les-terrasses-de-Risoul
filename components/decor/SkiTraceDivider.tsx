"use client";

import { useEffect, useRef } from "react";

const PATH_1 =
  "M0,20 C100,0 150,40 250,20 C350,0 400,40 500,20 C600,0 650,40 750,20 L800,20";
const PATH_2 =
  "M0,26 C100,6 150,46 250,26 C350,6 400,46 500,26 C600,6 650,46 750,26 L800,26";

// Trait qui se dessine au fil du scroll (pas juste à l'apparition) : la
// progression est recalculée à chaque scroll (throttlée par rAF) et pilote
// stroke-dashoffset directement en style, sans re-render React — même
// esprit que le parallax du hero. Une petite luge suit le premier tracé.
export function SkiTraceDivider() {
  const svgRef = useRef<SVGSVGElement>(null);
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const sledRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const p1 = path1Ref.current;
    const p2 = path2Ref.current;
    if (!svg || !p1 || !p2) return;

    const len1 = p1.getTotalLength();
    const len2 = p2.getTotalLength();
    p1.style.strokeDasharray = String(len1);
    p2.style.strokeDasharray = String(len2);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      p1.style.strokeDashoffset = "0";
      p2.style.strokeDashoffset = "0";
      return;
    }

    p1.style.strokeDashoffset = String(len1);
    p2.style.strokeDashoffset = String(len2);

    let ticking = false;

    function update() {
      const rect = svg!.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(
          1,
          (window.innerHeight * 0.9 - rect.top) /
            (rect.height + window.innerHeight * 0.35)
        )
      );

      p1!.style.strokeDashoffset = String(len1 * (1 - progress));
      p2!.style.strokeDashoffset = String(len2 * (1 - progress));

      if (sledRef.current) {
        const point = p1!.getPointAtLength(len1 * progress);
        const sx = rect.width / 800;
        const sy = rect.height / 40;
        sledRef.current.style.transform = `translate3d(${point.x * sx}px, ${point.y * sy}px, 0)`;
        sledRef.current.style.opacity =
          progress > 0.02 && progress < 0.98 ? "1" : "0";
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
  }, []);

  return (
    <div className="relative py-8" aria-hidden="true">
      <div
        ref={sledRef}
        className="absolute left-0 top-0 z-10 h-2.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-600 opacity-0 shadow-[0_0_8px_rgba(142,47,38,0.6)]"
        style={{ transition: "opacity 300ms" }}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 40"
        preserveAspectRatio="none"
        className="h-8 w-full"
      >
        <path
          ref={path1Ref}
          d={PATH_1}
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity="0.5"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          ref={path2Ref}
          d={PATH_2}
          fill="none"
          stroke="var(--color-wood-500)"
          strokeOpacity="0.55"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
