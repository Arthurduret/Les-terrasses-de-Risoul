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
