"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const SETTINGS_KEYS = [
  "cleaning_fee",
  "tourist_tax_per_person_per_night",
  "min_nights_booking",
  "contact_email",
  "airbnb_link",
] as const;

export async function updateAdminName(formData: FormData) {
  const supabase = await createClient();
  const full_name = String(formData.get("full_name") ?? "").trim();

  await supabase.auth.updateUser({ data: { full_name } });

  revalidatePath("/admin/parametres");
  revalidatePath("/admin");
}

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();

  const entries = SETTINGS_KEYS.map((key) => ({
    key,
    value: String(formData.get(key) ?? "").trim(),
  }));

  const toSave = entries.filter((entry) => entry.value !== "");
  const toClear = entries.filter((entry) => entry.value === "").map((e) => e.key);

  if (toSave.length > 0) {
    await supabase.from("settings").upsert(toSave, { onConflict: "key" });
  }
  if (toClear.length > 0) {
    await supabase.from("settings").delete().in("key", toClear);
  }

  revalidatePath("/admin/parametres");
  revalidatePath("/");
}
