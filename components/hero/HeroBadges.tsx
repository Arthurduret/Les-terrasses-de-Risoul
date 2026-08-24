// Repères pratiques — remplacer les libellés par les vraies infos.
const BADGES: string[] = [
  "250 m des pistes",
  "Parking gratuit",
  "Wifi gratuit",
];

export function HeroBadges() {
  return (
    <div className="mt-8 flex flex-wrap gap-2.5">
      {BADGES.map((label) => (
        <span
          key={label}
          className="border border-foreground/20 bg-background/45 px-4 py-2.5 text-xs tracking-[0.1em] text-mist-300 uppercase backdrop-blur-sm"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
