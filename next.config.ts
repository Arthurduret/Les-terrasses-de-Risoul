import type { NextConfig } from "next";

// Origine Supabase, lue au build : le client navigateur l'appelle depuis
// /admin/login, elle doit donc figurer dans connect-src.
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";

// api-adresse.data.gouv.fr alimente l'autocomplétion d'adresse du
// formulaire de réservation (voir components/booking/AddressAutocomplete).
const connectSrc = ["'self'", "https://api-adresse.data.gouv.fr", supabaseOrigin]
  .filter(Boolean)
  .join(" ");

// `unsafe-inline` reste nécessaire sur script-src : Next.js injecte les
// données d'hydratation en scripts inline, sans nonce dans cette
// configuration. La directive garde tout son intérêt malgré cela — elle
// interdit le chargement de scripts depuis un domaine tiers, qui est le
// vecteur d'exfiltration le plus courant.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Un an, sous-domaines inclus. Pas de `preload` volontairement : cette
  // liste est difficile à quitter, alors qu'un max-age finit par expirer.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Doublon volontaire de frame-ancestors, pour les navigateurs anciens.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Nécessaire pour l'image Docker (voir Dockerfile) : produit un build
  // autonome (.next/standalone) qui n'a besoin ni de node_modules complet
  // ni du reste du projet pour tourner — image bien plus légère.
  output: "standalone",

  // Empêche Next d'annoncer sa présence et sa version.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
