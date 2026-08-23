interface LogoProps {
  className?: string;
}

// Marque complète "toit de chalet" (arête centrale, rampants en
// perspective, garde-corps de terrasse à trois barres), reprise fidèlement
// de la maquette Claude Design ("Logo 1b", version pleine) — pas la
// variante simplifiée à deux barres utilisée initialement.
export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg viewBox="0 0 220 180" className="h-12 w-auto sm:h-14" aria-hidden="true">
        <path
          d="M14 168 L14 78 L96 12 L206 78 L206 168"
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M96 12 L96 168"
          stroke="var(--foreground)"
          strokeOpacity="0.28"
          strokeWidth="1.5"
        />
        <path
          d="M120 74 V168 M144 82 V168 M168 96 V168 M192 110 V168"
          stroke="var(--color-wood-500)"
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
        <path
          d="M32 92 H86 M32 118 H86 M32 144 H86"
          stroke="var(--color-wood-500)"
          strokeOpacity="0.95"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M0 176 H220"
          stroke="var(--foreground)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-1.5 text-center">
        <div className="font-display text-lg tracking-[0.05em] text-foreground sm:text-xl">
          Les Terrasses
        </div>
        <div className="mt-1 flex items-center justify-center gap-2.5">
          <span className="h-px w-5 bg-wood-500/60" />
          <span className="text-[9px] tracking-[0.3em] text-wood-500 uppercase">
            de Risoul
          </span>
          <span className="h-px w-5 bg-wood-500/60" />
        </div>
      </div>
    </div>
  );
}
