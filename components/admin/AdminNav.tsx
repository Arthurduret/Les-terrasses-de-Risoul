"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/disponibilites", label: "Disponibilités" },
  { href: "/admin/tarifs", label: "Tarifs" },
  { href: "/admin/demandes", label: "Demandes" },
  { href: "/admin/parametres", label: "Paramètres" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-sm px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-anthracite-700 text-foreground"
                : "text-mist-400 hover:bg-anthracite-700 hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
