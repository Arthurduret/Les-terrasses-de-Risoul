"use server";

import { revalidatePath } from "next/cache";
import { eachNightInclusive, parseISODate } from "@/components/calendar/utils";
import { currentAdminLabel } from "@/lib/adminLabel";
import { sendEmail } from "@/lib/email";
import { bookingConfirmedEmail } from "@/lib/emailTemplates";
import { calculateGrandTotal } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { getWeekAssignments } from "@/lib/pricingWeeks";
import { createClient } from "@/lib/supabase/server";

export async function confirmBookingRequest(id: string): Promise<void> {
  const supabase = await createClient();
  const adminLabel = await currentAdminLabel(supabase);

  const { data: request, error: requestFetchError } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (requestFetchError || !request) {
    console.error(
      "Impossible de charger la demande à confirmer :",
      requestFetchError?.message
    );
    return;
  }

  const fullName = `${request.first_name} ${request.last_name}`;

  const rows = eachNightInclusive(request.start_date, request.end_date).map((date) => ({
    date,
    status: "booked" as const,
    note: `Réservé par ${fullName}`,
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

  await sendConfirmationEmail(supabase, request);

  revalidatePath("/admin");
  revalidatePath("/");
}

async function sendConfirmationEmail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  request: {
    first_name: string;
    email: string;
    start_date: string;
    end_date: string;
    adults: number;
    cleaning_requested: boolean;
  }
) {
  const [{ data: pricingRules }, settings, weekAssignments] = await Promise.all([
    supabase.from("pricing_rules").select("*"),
    getSettings(supabase),
    getWeekAssignments(supabase),
  ]);

  const start = parseISODate(request.start_date);
  const end = parseISODate(request.end_date);

  let pricing = null;
  try {
    const grandTotal = calculateGrandTotal(start, end, pricingRules ?? [], weekAssignments, {
      adults: request.adults,
      cleaningRequested: request.cleaning_requested,
      cleaningFee: Number(settings.cleaning_fee ?? 0) || 0,
      touristTaxPerPersonPerNight: Number(settings.tourist_tax_per_person_per_night ?? 0) || 0,
    });
    pricing = {
      nights: grandTotal.breakdown.nights,
      pricePerNight: grandTotal.breakdown.pricePerNight,
      cleaningFee: grandTotal.cleaningFee,
      touristTax: grandTotal.touristTax,
      grandTotal: grandTotal.grandTotal,
    };
  } catch (err) {
    // Aucun tarif applicable configuré pour ces dates : l'email part quand
    // même, juste sans le récapitulatif de prix (voir bookingConfirmedEmail).
    console.error(
      "Prix non calculé pour l'email de confirmation :",
      err instanceof Error ? err.message : err
    );
  }

  const { subject, html } = bookingConfirmedEmail({
    firstName: request.first_name,
    startDate: request.start_date,
    endDate: request.end_date,
    pricing,
    checkinTime: settings.checkin_time || undefined,
    checkoutTime: settings.checkout_time || undefined,
    contactEmail: settings.contact_email || undefined,
  });

  await sendEmail({ to: request.email, subject, html });
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

// Suppression manuelle (ex. nettoyage de demandes de test) — si la demande
// était confirmée, libère aussi les dates qu'elle avait bloquées, pour ne
// pas laisser de dates "réservées" fantômes sans demande associée.
export async function deleteBookingRequest(id: string): Promise<void> {
  const supabase = await createClient();

  const { data: request, error: fetchError } = await supabase
    .from("booking_requests")
    .select("status, start_date, end_date")
    .eq("id", id)
    .single();

  if (fetchError || !request) {
    console.error("Impossible de charger la demande à supprimer :", fetchError?.message);
    return;
  }

  if (request.status === "confirmed") {
    const dates = eachNightInclusive(request.start_date, request.end_date);
    const { error: availabilityError } = await supabase
      .from("availability")
      .delete()
      .in("date", dates);

    if (availabilityError) {
      console.error(
        "Erreur lors de la libération des dates :",
        availabilityError.message
      );
      return;
    }
  }

  const { error } = await supabase.from("booking_requests").delete().eq("id", id);

  if (error) {
    console.error("Erreur lors de la suppression de la demande :", error.message);
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/");
}
