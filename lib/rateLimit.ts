import { headers } from "next/headers";

const buckets = new Map<string, { count: number; resetAt: number }>();

// Limiteur en mémoire, volontairement simple (pas de Redis/service externe)
// : suffisant pour dissuader un spam basique sur un site à faible trafic.
// Se réinitialise à chaque redémarrage de l'instance serveur — une
// protection en profondeur, pas une garantie absolue sur une infra
// serverless à plusieurs instances.
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (now > v.resetAt) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

// Adresse IP du visiteur, à partir des en-têtes posés par le proxy
// (Vercel, ou tout reverse proxy). "unknown" en dernier recours plutôt que
// de faire échouer l'action — mieux vaut un compartiment partagé que
// bloquer l'envoi.
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
