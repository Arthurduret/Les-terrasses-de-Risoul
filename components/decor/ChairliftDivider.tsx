// Pas d'état, pas d'interactivité : animation portée entièrement par CSS
// (voir .chairlift-car dans globals.css), pas de "use client" nécessaire.
export function ChairliftDivider() {
  return (
    <div
      className="relative h-16 overflow-hidden border-y border-wood-900 bg-anthracite-800"
      aria-hidden="true"
    >
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-wood-700" />
      <svg
        viewBox="0 0 40 40"
        className="chairlift-car absolute top-1/2 -mt-4 h-8 w-8 text-wood-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="20" y1="2" x2="20" y2="15" />
        <rect x="10" y="15" width="20" height="8" rx="2" />
        <line x1="14" y1="23" x2="14" y2="30" />
        <line x1="26" y1="23" x2="26" y2="30" />
      </svg>
    </div>
  );
}
