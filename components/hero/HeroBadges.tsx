interface IconProps {
  className?: string;
}

function PinIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ParkingIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 17V7h3.5a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

function WifiIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 8.5a16 16 0 0 1 18 0" />
      <path d="M6.5 12.5a11 11 0 0 1 11 0" />
      <path d="M10 16.5a5.5 5.5 0 0 1 4 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface Badge {
  icon: (props: IconProps) => React.ReactNode;
  label: string;
}

// Repères pratiques — remplacer les libellés par les vraies infos.
const BADGES: Badge[] = [
  { icon: PinIcon, label: "[Distance] des pistes" },
  { icon: ParkingIcon, label: "Parking inclus" },
  { icon: WifiIcon, label: "Wifi gratuit" },
];

export function HeroBadges() {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {BADGES.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-wood-700 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/80"
        >
          <Icon className="h-3.5 w-3.5 text-wood-300" />
          {label}
        </span>
      ))}
    </div>
  );
}
