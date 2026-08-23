import type { createClient } from "./supabase/server";

// Nom affiché pour l'admin qui bloque une date / traite une demande —
// vient toujours de la session vérifiée côté serveur, jamais d'une
// valeur envoyée par le client, donc impossible à falsifier. Préfère le
// nom choisi dans Paramètres (user_metadata.full_name) ; à défaut,
// retombe sur l'email.
export async function currentAdminLabel(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim() !== "") {
    return fullName.trim();
  }

  return user.email ?? null;
}
