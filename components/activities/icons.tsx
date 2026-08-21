interface IconProps {
  className?: string;
}

function IconBase({
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
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
      {children}
    </svg>
  );
}

export function SkiIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 20L10 4" />
      <path d="M14 20L20 4" />
      <circle cx="7.5" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="9" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function RestaurantIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M8 3v6a2 2 0 1 0 4 0V3" />
      <path d="M10 9v12" />
      <path d="M16 3v8a2 2 0 0 1-2 2" />
      <path d="M16 3v18" />
    </IconBase>
  );
}

export function ShopIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 9l1-5h16l1 5" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-6h6v6" />
      <path d="M3 9a3 3 0 0 0 6 0" />
      <path d="M9 9a3 3 0 0 0 6 0" />
      <path d="M15 9a3 3 0 0 0 6 0" />
    </IconBase>
  );
}

export function BakeryIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3c-2 0-3.5 1.6-3.5 3.5 0 .9.3 1.6.8 2.2C7.7 9.3 6 11 6 13.5A5.5 5.5 0 0 0 11.5 19h1A5.5 5.5 0 0 0 18 13.5c0-2.5-1.7-4.2-3.3-4.8.5-.6.8-1.3.8-2.2C15.5 4.6 14 3 12 3z" />
      <path d="M12 9c-.5-1-.5-2 0-3" />
    </IconBase>
  );
}

export function LeisureIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.6 5-.7z" />
    </IconBase>
  );
}

export const ACTIVITY_ICONS = {
  boulangerie: BakeryIcon,
  courses: ShopIcon,
  restaurant: RestaurantIcon,
  loisir: LeisureIcon,
  ski: SkiIcon,
};
