"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Les séjours se réservent toujours par semaine complète (samedi-samedi) :
// le tarif se saisit et s'affiche par semaine, mais reste stocké par nuit
// (price_per_night) pour ne pas changer le schéma ni le calcul existant
// (nights × price_per_night, correct pour 1 semaine comme pour plusieurs).
function weeklyToNightly(value: number): number {
  return Math.round((value / 7) * 1_000_000) / 1_000_000;
}

function weeksToNights(value: number): number {
  return Math.round(value * 7);
}

export async function createPricingRule(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const pricePerWeek = parseNumber(formData.get("price_per_week"));
  if (!label || pricePerWeek === null) return;

  const minWeeks = parseNumber(formData.get("min_weeks"));
  const color = String(formData.get("color") ?? "").trim() || null;

  const supabase = await createClient();
  await supabase.from("pricing_rules").insert({
    label,
    color,
    price_per_night: weeklyToNightly(pricePerWeek),
    min_nights: minWeeks !== null ? weeksToNights(minWeeks) : null,
    discount_percent: parseNumber(formData.get("discount_percent")),
  });

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updatePricingRule(id: string, formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const pricePerWeek = parseNumber(formData.get("price_per_week"));
  if (!label || pricePerWeek === null) return;

  const minWeeks = parseNumber(formData.get("min_weeks"));
  const color = String(formData.get("color") ?? "").trim() || null;

  const supabase = await createClient();
  await supabase
    .from("pricing_rules")
    .update({
      label,
      color,
      price_per_night: weeklyToNightly(pricePerWeek),
      min_nights: minWeeks !== null ? weeksToNights(minWeeks) : null,
      discount_percent: parseNumber(formData.get("discount_percent")),
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deletePricingRule(id: string) {
  const supabase = await createClient();
  await supabase.from("pricing_rules").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function assignPricingWeeks(weekStarts: string[], ruleId: string | null) {
  if (weekStarts.length === 0) return { error: null };

  const supabase = await createClient();

  if (ruleId === null) {
    const { error } = await supabase
      .from("pricing_rule_weeks")
      .delete()
      .in("week_start", weekStarts);

    if (error) return { error: "Impossible de désassigner ces semaines." };
  } else {
    const rows = weekStarts.map((week_start) => ({ week_start, rule_id: ruleId }));
    const { error } = await supabase
      .from("pricing_rule_weeks")
      .upsert(rows, { onConflict: "week_start" });

    if (error) return { error: "Impossible d'assigner ce tarif à ces semaines." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}
