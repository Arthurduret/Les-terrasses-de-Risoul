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

export async function createPricingRule(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const pricePerNight = parseNumber(formData.get("price_per_night"));
  if (!label || pricePerNight === null) return;

  const supabase = await createClient();
  await supabase.from("pricing_rules").insert({
    label,
    price_per_night: pricePerNight,
    min_nights: parseNumber(formData.get("min_nights")),
    discount_percent: parseNumber(formData.get("discount_percent")),
    season_start: parseDate(formData.get("season_start")),
    season_end: parseDate(formData.get("season_end")),
  });

  revalidatePath("/admin/tarifs");
  revalidatePath("/");
}

export async function updatePricingRule(id: string, formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const pricePerNight = parseNumber(formData.get("price_per_night"));
  if (!label || pricePerNight === null) return;

  const supabase = await createClient();
  await supabase
    .from("pricing_rules")
    .update({
      label,
      price_per_night: pricePerNight,
      min_nights: parseNumber(formData.get("min_nights")),
      discount_percent: parseNumber(formData.get("discount_percent")),
      season_start: parseDate(formData.get("season_start")),
      season_end: parseDate(formData.get("season_end")),
    })
    .eq("id", id);

  revalidatePath("/admin/tarifs");
  revalidatePath("/");
}

export async function deletePricingRule(id: string) {
  const supabase = await createClient();
  await supabase.from("pricing_rules").delete().eq("id", id);

  revalidatePath("/admin/tarifs");
  revalidatePath("/");
}
