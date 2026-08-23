import type { WeekAssignments } from "./pricing";
import type { createClient } from "./supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getWeekAssignments(
  supabase: SupabaseServerClient
): Promise<WeekAssignments> {
  const { data, error } = await supabase.from("pricing_rule_weeks").select("week_start, rule_id");

  if (error) {
    console.error("Erreur lors du chargement du calendrier de tarifs :", error.message);
    return {};
  }

  return Object.fromEntries(data.map((row) => [row.week_start, row.rule_id]));
}
