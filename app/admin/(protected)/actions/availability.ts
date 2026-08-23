"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// L'email de l'admin qui agit vient toujours de sa session vérifiée
// côté serveur, jamais d'une valeur envoyée par le client — impossible
// à falsifier en trafiquant la requête.
async function currentAdminEmail(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export async function blockDate(date: string, note: string | null) {
  const supabase = await createClient();
  const updated_by = await currentAdminEmail(supabase);
  const { error } = await supabase
    .from("availability")
    .upsert({ date, status: "blocked", note, updated_by }, { onConflict: "date" });

  if (error) {
    return { error: "Impossible de bloquer cette date." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}

export async function unblockDate(date: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("availability").delete().eq("date", date);

  if (error) {
    return { error: "Impossible de libérer cette date." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}

export async function blockDates(dates: string[], note: string | null) {
  if (dates.length === 0) return { error: null };

  const supabase = await createClient();
  const updated_by = await currentAdminEmail(supabase);
  const rows = dates.map((date) => ({ date, status: "blocked" as const, note, updated_by }));
  const { error } = await supabase.from("availability").upsert(rows, { onConflict: "date" });

  if (error) {
    return { error: "Impossible de bloquer ces dates." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}

export async function unblockDates(dates: string[]) {
  if (dates.length === 0) return { error: null };

  const supabase = await createClient();
  const { error } = await supabase.from("availability").delete().in("date", dates);

  if (error) {
    return { error: "Impossible de libérer ces dates." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}
