"use server";

import { revalidatePath } from "next/cache";
import { eachNightInclusive, parseISODate } from "@/components/calendar/utils";
import { currentAdminLabel } from "@/lib/adminLabel";
import { sendEmail } from "@/lib/email";
import { bookingConfirmedEmail } from "@/lib/emailTemplates";
import { calculateGrandTotal } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { getWeekAssignments } from "@/lib/pricingWeeks";
import { adminClient } from "@/lib/adminAuth";
import type { createClient } from "@/lib/supabase/server";

function eur(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} €`;
}

export interface ConfirmBookingOverrides {
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  cleaningRequested: boolean;
  // null = valeur calculée normalement conservée (voir sendConfirmationEmail).
  stayPriceOverride: number | null;
  cleaningFeeOverride: number | null;
  touristTaxOverride: number | null;
}

// Revue et confirmation d'une demande : les dates, adultes/enfants,
// ménage et prix (séjour/ménage/taxe, chacun remplaçable individuellement
// — ex. tarif négocié) affichés dans la fenêtre de confirmation
// remplacent ceux soumis par le client, et ce sont eux qui font foi pour
// bloquer les dates et pour l'email de confirmation.
export async function confirmBookingRequest(
  id: string,
  overrides: ConfirmBookingOverrides
): Promise<{ error: string | null }> {
  const supabase = await adminClient();
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
    return { error: "Impossible de charger la demande à confirmer." };
  }

  // Contrairement au formulaire public, l'admin peut confirmer des dates
  // hors samedi-samedi (séjour exceptionnel) — seule règle : le départ
  // doit être après l'arrivée (voir la contrainte en base côté migration).
  const start = parseISODate(overrides.startDate);
  const end = parseISODate(overrides.endDate);
  if (end.getTime() <= start.getTime()) {
    return { error: "La date de départ doit être après la date d'arrivée." };
  }

  const fullName = `${request.first_name} ${request.last_name}`;
  const nights = eachNightInclusive(overrides.startDate, overrides.endDate);

  // Si l'admin a changé les dates, vérifie qu'elles ne chevauchent pas une
  // autre réservation déjà bloquée avant d'écraser quoi que ce soit.
  const { data: conflictRows, error: conflictError } = await supabase
    .from("availability")
    .select("date")
    .in("date", nights);

  if (conflictError) {
    return { error: "Impossible de vérifier la disponibilité, réessayez." };
  }
  if (conflictRows.length > 0) {
    return { error: "Ces dates chevauchent une autre réservation déjà bloquée." };
  }

  const rows = nights.map((date) => ({
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
    return { error: "Erreur lors du blocage des dates." };
  }

  const { error: requestError } = await supabase
    .from("booking_requests")
    .update({
      status: "confirmed",
      processed_by: adminLabel,
      start_date: overrides.startDate,
      end_date: overrides.endDate,
      adults: overrides.adults,
      children: overrides.children,
      cleaning_requested: overrides.cleaningRequested,
      stay_price_override: overrides.stayPriceOverride,
      cleaning_fee_override: overrides.cleaningFeeOverride,
      tourist_tax_override: overrides.touristTaxOverride,
    })
    .eq("id", id);

  if (requestError) {
    console.error(
      "Dates bloquées mais statut de la demande non mis à jour :",
      requestError.message
    );
  }

  await sendConfirmationEmail(supabase, {
    first_name: request.first_name,
    email: request.email,
    start_date: overrides.startDate,
    end_date: overrides.endDate,
    adults: overrides.adults,
    cleaning_requested: overrides.cleaningRequested,
    stay_price_override: overrides.stayPriceOverride,
    cleaning_fee_override: overrides.cleaningFeeOverride,
    tourist_tax_override: overrides.touristTaxOverride,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
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
    stay_price_override: number | null;
    cleaning_fee_override: number | null;
    tourist_tax_override: number | null;
  }
) {
  const [{ data: pricingRules }, settings, weekAssignments] = await Promise.all([
    supabase.from("pricing_rules").select("*"),
    getSettings(supabase),
    getWeekAssignments(supabase),
  ]);

  const start = parseISODate(request.start_date);
  const end = parseISODate(request.end_date);
  const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const weeks = nights / 7;
  const cleaningFeeSetting = Number(settings.cleaning_fee ?? 0) || 0;
  const touristTaxRate = Number(settings.tourist_tax_per_person_per_night ?? 0) || 0;

  // Le tarif calculé (nuits × prix de la semaine assignée) sert de base
  // pour le ménage/la taxe quand ils ne sont pas remplacés individuellement
  // — mais un tarif du séjour remplacé par l'admin ne dépend d'aucune
  // règle de tarification : l'email part quand même si calculateGrandTotal
  // échoue (aucun tarif configuré pour ces dates), tant qu'au moins le
  // prix du séjour est connu (calculé ou remplacé).
  let computed: ReturnType<typeof calculateGrandTotal> | null = null;
  try {
    computed = calculateGrandTotal(start, end, pricingRules ?? [], weekAssignments, {
      adults: request.adults,
      cleaningRequested: request.cleaning_requested,
      cleaningFee: cleaningFeeSetting,
      touristTaxPerPersonPerNight: touristTaxRate,
    });
  } catch (err) {
    console.error(
      "Tarif calculé indisponible pour l'email de confirmation :",
      err instanceof Error ? err.message : err
    );
  }

  const stayAmount = request.stay_price_override ?? computed?.breakdown.total ?? null;
  const stayLabel =
    request.stay_price_override != null
      ? "Prix du séjour (tarif convenu)"
      : computed
        ? `${eur(computed.breakdown.pricePerNight * 7)} / semaine × ${weeks} semaine${weeks > 1 ? "s" : ""}`
        : "Prix du séjour";
  const cleaningFee =
    request.cleaning_fee_override ??
    computed?.cleaningFee ??
    (request.cleaning_requested ? cleaningFeeSetting : 0);
  const touristTax =
    request.tourist_tax_override ?? computed?.touristTax ?? nights * request.adults * touristTaxRate;

  const pricing =
    stayAmount != null
      ? {
          stayLabel,
          stayAmount,
          cleaningFee,
          touristTax,
          grandTotal: stayAmount + cleaningFee + touristTax,
        }
      : null;

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
  const supabase = await adminClient();
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
  const supabase = await adminClient();

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
