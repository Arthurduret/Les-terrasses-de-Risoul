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

export function HikeIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 19L9 8l4 6 2-3 6 8H3z" />
      <path d="M9 12l1.5 2.5" />
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

export const ACTIVITY_ICONS = {
  ski: SkiIcon,
  hike: HikeIcon,
  restaurant: RestaurantIcon,
  shop: ShopIcon,
};
