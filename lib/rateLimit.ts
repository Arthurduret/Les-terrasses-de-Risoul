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

// Adresse IP du visiteur, à partir des en-têtes posés par le proxy.
//
// `cf-connecting-ip` d'abord : le site est servi derrière Cloudflare, qui
// écrase toujours cet en-tête avec l'IP réelle du client. `x-forwarded-for`
// ne peut PAS lui être préféré — Cloudflare y ajoute l'IP du client à la
// suite de ce que le client a lui-même envoyé. Un visiteur qui émet
// `X-Forwarded-For: 1.2.3.4` ferait donc arriver « 1.2.3.4, <son IP> », et
// prendre le premier élément lui donnerait un compartiment neuf à chaque
// requête : limitation de débit contournée.
//
// Les deux replis servent aux autres contextes (accès direct au conteneur,
// développement local). "unknown" en dernier recours plutôt que de faire
// échouer l'action — mieux vaut un compartiment partagé que bloquer l'envoi.
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const cloudflare = h.get("cf-connecting-ip");
  if (cloudflare) return cloudflare.trim();

  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return h.get("x-real-ip") ?? "unknown";
}
