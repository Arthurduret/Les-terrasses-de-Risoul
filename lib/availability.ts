import type { createClient } from "./supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Renvoie les dates (ISO) marquées blocked/booked à partir d'aujourd'hui.
// Un jour absent de la table availability est disponible par défaut.
export async function getBlockedDates(
  supabase: SupabaseServerClient
): Promise<string[]> {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("availability_public")
    .select("date")
    .gte("date", todayIso)
    .order("date", { ascending: true });

  if (error) {
    console.error(
      "Erreur lors du chargement des disponibilités :",
      error.message
    );
    return [];
  }

  // La vue availability_public ne déclare pas `date` comme non-nullable
  // (limite de l'inférence de type sur les vues), même si la colonne
  // d'origine l'est bien (contrainte not null sur availability.date).
  return data
    .map((row) => row.date)
    .filter((date): date is string => date !== null);
}
