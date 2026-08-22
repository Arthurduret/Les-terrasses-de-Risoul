"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function blockDate(date: string, note: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("availability")
    .upsert({ date, status: "blocked", note }, { onConflict: "date" });

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
  const rows = dates.map((date) => ({ date, status: "blocked" as const, note }));
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
