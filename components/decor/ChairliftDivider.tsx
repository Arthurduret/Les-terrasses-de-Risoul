// Pas d'état, pas d'interactivité : glisse + balancement portés entièrement
// par CSS (voir .chairlift-car / .chairlift-sway dans globals.css), pas de
// "use client" nécessaire.
function ChairliftCar({ variant }: { variant?: "second" }) {
  return (
    <div
      className={`chairlift-car absolute top-1/2 -mt-6 ${variant === "second" ? "chairlift-car--2" : ""}`}
    >
      <div className="chairlift-sway flex flex-col items-center">
        <div className="h-4 w-px bg-wood-300/70" />
        <div className="h-3 w-7 rounded-sm border border-wood-500/70 bg-anthracite-800" />
        <div className="mt-0.5 flex gap-3.5">
          <div className="h-2 w-px bg-wood-300/50" />
          <div className="h-2 w-px bg-wood-300/50" />
        </div>
      </div>
    </div>
  );
}

export function ChairliftDivider() {
  return (
    <div
      className="relative h-16 overflow-hidden border-y border-wood-700 bg-anthracite-700"
      aria-hidden="true"
    >
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-wood-700" />
      <ChairliftCar />
      <ChairliftCar variant="second" />
    </div>
  );
}
