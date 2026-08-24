"use server";

import { revalidatePath } from "next/cache";
import { eachNightInclusive, isSaturday, parseISODate } from "@/components/calendar/utils";
import { sendEmail } from "@/lib/email";
import { bookingRequestReceivedEmail } from "@/lib/emailTemplates";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, isValidPhone } from "@/lib/validation";

const MAX_OCCUPANTS = 12;
// Un visiteur légitime ne soumet pas plus de quelques demandes en 10
// minutes — au-delà, on coupe court plutôt que de laisser un script
// spammer le formulaire (et les emails envoyés à chaque demande).
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export interface BookingRequestInput {
  startDate: string;
  endDate: string;
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
  adults: number;
  children: number;
  cleaningRequested: boolean;
  message: string;
}

// Revalidation serveur des règles déjà appliquées côté calendrier public
// (samedi-samedi, pas de jour bloqué dans la période) : une requête
// directe à l'API pourrait contourner l'interface.
export async function submitBookingRequest(
  input: BookingRequestInput
): Promise<{ error: string | null }> {
  const ip = await getClientIp();
  if (isRateLimited(`booking:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return { error: "Trop de demandes envoyées récemment — réessayez dans quelques minutes." };
  }

  const start = parseISODate(input.startDate);
  const end = parseISODate(input.endDate);

  if (!isSaturday(start) || !isSaturday(end) || end.getTime() <= start.getTime()) {
    return { error: "Les séjours se réservent du samedi au samedi." };
  }

  if (
    !input.firstName.trim() ||
    !input.lastName.trim() ||
    !input.address.trim() ||
    !input.postalCode.trim() ||
    !input.city.trim() ||
    !input.email.trim() ||
    !input.phone.trim()
  ) {
    return { error: "Merci de compléter tous les champs." };
  }

  if (!isValidEmail(input.email)) {
    return { error: "Adresse email invalide." };
  }

  if (!isValidPhone(input.phone)) {
    return { error: "Numéro de téléphone invalide." };
  }

  if (input.adults < 1 || input.children < 0) {
    return { error: "Nombre de voyageurs invalide." };
  }

  if (input.adults + input.children > MAX_OCCUPANTS) {
    return {
      error: `L'appartement accueille au maximum ${MAX_OCCUPANTS} personnes.`,
    };
  }

  const supabase = await createClient();
  const dates = eachNightInclusive(input.startDate, input.endDate);

  const { data: blockedRows, error: availabilityError } = await supabase
    .from("availability_public")
    .select("date")
    .in("date", dates);

  if (availabilityError) {
    return { error: "Impossible de vérifier la disponibilité, réessayez." };
  }

  if (blockedRows.length > 0) {
    return {
      error: "Ces dates ne sont plus disponibles — merci de choisir une autre période.",
    };
  }

  const { error } = await supabase.from("booking_requests").insert({
    start_date: input.startDate,
    end_date: input.endDate,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    address: input.address.trim(),
    postal_code: input.postalCode.trim(),
    city: input.city.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    adults: input.adults,
    children: input.children,
    cleaning_requested: input.cleaningRequested,
    message: input.message.trim() || null,
  });

  if (error) {
    return { error: "Impossible d'envoyer la demande, réessayez." };
  }

  const { subject, html } = bookingRequestReceivedEmail({
    firstName: input.firstName.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
  });
  await sendEmail({ to: input.email.trim(), subject, html });

  revalidatePath("/admin");
  return { error: null };
}
