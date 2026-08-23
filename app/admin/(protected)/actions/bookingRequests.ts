"use server";

import { revalidatePath } from "next/cache";
import { formatISO, parseISODate } from "@/components/calendar/utils";
import { currentAdminLabel } from "@/lib/adminLabel";
import { createClient } from "@/lib/supabase/server";

// Toutes les dates entre deux jours inclus, au format YYYY-MM-DD — même
// borne inclusive que la validation du calendrier public
// (rangeHasBlockedDay), pour que confirmer une demande bloque exactement
// les dates que le site public considère comme faisant partie du séjour.
function eachDateInclusive(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = parseISODate(start);
  const last = parseISODate(end);
  while (cursor.getTime() <= last.getTime()) {
    dates.push(formatISO(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export async function confirmBookingRequest(
  id: string,
  startDate: string,
  endDate: string,
  guestName: string
): Promise<void> {
  const supabase = await createClient();
  const adminLabel = await currentAdminLabel(supabase);

  const rows = eachDateInclusive(startDate, endDate).map((date) => ({
    date,
    status: "booked" as const,
    note: `Réservé par ${guestName}`,
    updated_by: adminLabel,
  }));

  const { error: availabilityError } = await supabase
    .from("availability")
    .upsert(rows, { onConflict: "date" });

  if (availabilityError) {
    console.error(
      "Erreur lors du blocage des dates confirmées :",
      availabilityError.message
    );
    return;
  }

  const { error: requestError } = await supabase
    .from("booking_requests")
    .update({ status: "confirmed", processed_by: adminLabel })
    .eq("id", id);

  if (requestError) {
    console.error(
      "Dates bloquées mais statut de la demande non mis à jour :",
      requestError.message
    );
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function declineBookingRequest(id: string): Promise<void> {
  const supabase = await createClient();
  const adminLabel = await currentAdminLabel(supabase);

  const { error } = await supabase
    .from("booking_requests")
    .update({ status: "declined", processed_by: adminLabel })
    .eq("id", id);

  if (error) {
    console.error("Erreur lors du refus de la demande :", error.message);
    return;
  }

  revalidatePath("/admin");
}
