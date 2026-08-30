"use server";

import { revalidatePath } from "next/cache";
import { currentAdminLabel } from "@/lib/adminLabel";
import { adminClient } from "@/lib/adminAuth";

type AvailabilityStatus = "blocked" | "booked";

export async function setAvailability(
  date: string,
  status: AvailabilityStatus,
  note: string | null
) {
  const supabase = await adminClient();
  const updated_by = await currentAdminLabel(supabase);
  const { error } = await supabase
    .from("availability")
    .upsert({ date, status, note, updated_by }, { onConflict: "date" });

  if (error) {
    return { error: "Impossible d'enregistrer cette date." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}

export async function unblockDate(date: string) {
  const supabase = await adminClient();
  const { error } = await supabase.from("availability").delete().eq("date", date);

  if (error) {
    return { error: "Impossible de libérer cette date." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}

export async function setAvailabilityRange(
  dates: string[],
  status: AvailabilityStatus,
  note: string | null
) {
  if (dates.length === 0) return { error: null };

  const supabase = await adminClient();
  const updated_by = await currentAdminLabel(supabase);
  const rows = dates.map((date) => ({ date, status, note, updated_by }));
  const { error } = await supabase.from("availability").upsert(rows, { onConflict: "date" });

  if (error) {
    return { error: "Impossible d'enregistrer ces dates." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}

export async function unblockDates(dates: string[]) {
  if (dates.length === 0) return { error: null };

  const supabase = await adminClient();
  const { error } = await supabase.from("availability").delete().in("date", dates);

  if (error) {
    return { error: "Impossible de libérer ces dates." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}
