"use client";

import { useEffect, useRef, useState } from "react";

const PATH_LENGTH = 1500;

// Même mécanisme que Reveal (IntersectionObserver natif, déclenché une
// fois) appliqué à stroke-dashoffset plutôt qu'à l'opacité.
export function SkiTraceDivider() {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="py-6" aria-hidden="true">
      <svg
        ref={ref}
        viewBox="0 0 800 40"
        preserveAspectRatio="none"
        className="h-8 w-full text-wood-500"
      >
        <path
          d="M0,20 C100,0 150,40 250,20 C350,0 400,40 500,20 C600,0 650,40 750,20 L800,20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={drawn ? 0 : PATH_LENGTH}
          style={{ transition: "stroke-dashoffset 1.8s ease-out" }}
        />
      </svg>
    </div>
  );
}
