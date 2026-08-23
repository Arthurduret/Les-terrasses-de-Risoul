interface LogoProps {
  className?: string;
}

// Marque "toit de chalet" stylisée + garde-corps de terrasse (deux barres),
// reprise de la maquette Claude Design ("Logo 1b") — variante compacte,
// pensée pour la barre de navigation.
export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 220 180" className="h-8 w-auto shrink-0" aria-hidden="true">
        <path
          d="M14 168 L14 78 L96 12 L206 78 L206 168"
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M32 96 H86 M32 132 H86"
          stroke="var(--color-wood-500)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
      <span className="leading-tight">
        <span className="block font-display text-base tracking-[0.05em] text-foreground uppercase">
          Les Terrasses
        </span>
        <span className="mt-0.5 block text-[9px] tracking-[0.32em] text-wood-500 uppercase">
          de Risoul
        </span>
      </span>
    </div>
  );
}
