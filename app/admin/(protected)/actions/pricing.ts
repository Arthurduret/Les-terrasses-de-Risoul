"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseDate(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s || null;
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

  const supabase = await createClient();
  await supabase.from("pricing_rules").insert({
    label,
    price_per_night: weeklyToNightly(pricePerWeek),
    min_nights: minWeeks !== null ? weeksToNights(minWeeks) : null,
    discount_percent: parseNumber(formData.get("discount_percent")),
    season_start: parseDate(formData.get("season_start")),
    season_end: parseDate(formData.get("season_end")),
  });

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updatePricingRule(id: string, formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const pricePerWeek = parseNumber(formData.get("price_per_week"));
  if (!label || pricePerWeek === null) return;

  const minWeeks = parseNumber(formData.get("min_weeks"));

  const supabase = await createClient();
  await supabase
    .from("pricing_rules")
    .update({
      label,
      price_per_night: weeklyToNightly(pricePerWeek),
      min_nights: minWeeks !== null ? weeksToNights(minWeeks) : null,
      discount_percent: parseNumber(formData.get("discount_percent")),
      season_start: parseDate(formData.get("season_start")),
      season_end: parseDate(formData.get("season_end")),
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
