import {
  confirmBookingRequest,
  declineBookingRequest,
} from "@/app/admin/(protected)/actions/bookingRequests";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import { formatShortDate, parseISODate } from "@/components/calendar/utils";
import type { Database } from "@/lib/supabase/database.types";

type BookingRequest = Database["public"]["Tables"]["booking_requests"]["Row"];

function formatReceivedAt(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function PendingRequestsSection({
  requests,
}: {
  requests: BookingRequest[];
}) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-mist-600">
        Aucune demande en attente pour l&apos;instant.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const fullName = `${request.first_name} ${request.last_name}`;
        return (
          <div
            key={request.id}
            className="border border-wood-500/40 bg-anthracite-800 p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-lg text-foreground">{fullName}</p>
              <p className="text-sm text-mist-400">
                {formatShortDate(parseISODate(request.start_date))} →{" "}
                {formatShortDate(parseISODate(request.end_date))}
              </p>
            </div>
            <p className="mt-1 text-sm text-mist-500">
              {request.email} · {request.phone}
            </p>
            <p className="mt-1 text-sm text-mist-500">
              {request.address}, {request.postal_code} {request.city}
            </p>
            <p className="mt-2 text-sm text-mist-400">
              {request.adults} adulte{request.adults > 1 ? "s" : ""}
              {request.children > 0
                ? ` · ${request.children} enfant${request.children > 1 ? "s" : ""}`
                : ""}
              {" · "}
              {request.cleaning_requested ? "Ménage souhaité" : "Sans ménage"}
            </p>
            {request.message && (
              <p className="mt-3 text-sm text-mist-400 italic">
                « {request.message} »
              </p>
            )}
            <p className="mt-3 text-xs text-mist-700">
              Reçue le {formatReceivedAt(request.created_at)}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <ConfirmSubmitButton
                action={confirmBookingRequest.bind(
                  null,
                  request.id,
                  request.start_date,
                  request.end_date,
                  fullName
                )}
                confirmMessage={`Confirmer la demande de ${fullName} du ${formatShortDate(
                  parseISODate(request.start_date)
                )} au ${formatShortDate(
                  parseISODate(request.end_date)
                )} ? Ces dates seront bloquées sur le calendrier.`}
                variant="primary"
              >
                Confirmer
              </ConfirmSubmitButton>
              <ConfirmSubmitButton
                action={declineBookingRequest.bind(null, request.id)}
                confirmMessage={`Décliner la demande de ${fullName} ?`}
                variant="secondary"
              >
                Décliner
              </ConfirmSubmitButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}
