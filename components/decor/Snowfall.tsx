// Purement statique/déterministe : aucun état, aucun "use client" nécessaire.
// Coût runtime nul au-delà des noeuds DOM + l'animation CSS (native, pas de
// boucle JS par frame).

const FLAKE_COUNT = 22;

const flakes = Array.from({ length: FLAKE_COUNT }, (_, i) => ({
  left: (i * 43) % 100,
  size: 2 + (i % 4),
  duration: 12 + (i % 6) * 2,
  delay: -((i * 5) % 20),
  opacity: 0.2 + (i % 5) * 0.08,
  drift: i % 2 === 0 ? 10 : -10,
}));

export function Snowfall() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {flakes.map((flake, i) => (
        <span
          key={i}
          className="snowflake"
          style={
            {
              left: `${flake.left}%`,
              width: flake.size,
              height: flake.size,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
              "--flake-opacity": flake.opacity,
              "--drift": `${flake.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
