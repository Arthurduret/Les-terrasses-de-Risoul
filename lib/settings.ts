import type { createClient } from "./supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Table clé/valeur générique — voir CLAUDE.md. Clés lues par le widget de
// réservation : "cleaning_fee" et "tourist_tax_per_person_per_night"
// (numériques, en euros). Absentes = 0 par défaut, aucune migration requise
// pour en ajouter d'autres plus tard.
export async function getSettings(
  supabase: SupabaseServerClient
): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("settings").select("key, value");

  if (error) {
    console.error("Erreur lors du chargement des paramètres :", error.message);
    return {};
  }

  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}
