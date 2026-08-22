import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { formatShortDate, parseISODate } from "@/components/calendar/utils";
import { createClient } from "@/lib/supabase/server";
import { confirmBookingRequest, declineBookingRequest } from "./actions";

function formatReceivedAt(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function AdminDemandesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const requests = data ?? [];
  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Demandes</h1>
      <p className="mt-2 text-mist-500">
        Confirmez ou déclinez les demandes de réservation reçues via le site.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-xl text-foreground">
          En attente ({pending.length})
        </h2>

        {pending.length === 0 && (
          <p className="mt-3 text-sm text-mist-600">
            Aucune demande en attente pour l&apos;instant.
          </p>
        )}

        <div className="mt-4 space-y-4">
          {pending.map((request) => (
            <div
              key={request.id}
              className="border border-wood-500/40 bg-anthracite-800 p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-lg text-foreground">
                  {request.name}
                </p>
                <p className="text-sm text-mist-400">
                  {formatShortDate(parseISODate(request.start_date))} →{" "}
                  {formatShortDate(parseISODate(request.end_date))}
                </p>
              </div>
              <p className="mt-1 text-sm text-mist-500">
                {request.email} · {request.phone}
              </p>
              {request.message && (
                <p className="mt-3 text-sm text-mist-400 italic">
                  « {request.message} »
                </p>
              )}
              <p className="mt-3 text-xs text-mist-700">
                Reçue le {formatReceivedAt(request.created_at)}
              </p>

              <form className="mt-5 flex flex-wrap gap-3">
                <ConfirmSubmitButton
                  formAction={confirmBookingRequest.bind(
                    null,
                    request.id,
                    request.start_date,
                    request.end_date,
                    request.name
                  )}
                  confirmMessage={`Confirmer la demande de ${request.name} du ${formatShortDate(
                    parseISODate(request.start_date)
                  )} au ${formatShortDate(
                    parseISODate(request.end_date)
                  )} ? Ces dates seront bloquées sur le calendrier.`}
                  variant="primary"
                >
                  Confirmer
                </ConfirmSubmitButton>
                <ConfirmSubmitButton
                  formAction={declineBookingRequest.bind(null, request.id)}
                  confirmMessage={`Décliner la demande de ${request.name} ?`}
                  variant="secondary"
                >
                  Décliner
                </ConfirmSubmitButton>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-mist-500">
          Demandes traitées
        </h2>

        {processed.length === 0 ? (
          <p className="mt-3 text-sm text-mist-700">
            Aucune demande traitée pour l&apos;instant.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-foreground/10 border-t border-foreground/10">
            {processed.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <span className="text-mist-400">
                  {request.name} — {formatShortDate(parseISODate(request.start_date))} →{" "}
                  {formatShortDate(parseISODate(request.end_date))}
                </span>
                <span
                  className={
                    request.status === "confirmed"
                      ? "text-wood-500"
                      : "text-mist-700"
                  }
                >
                  {request.status === "confirmed" ? "Confirmée" : "Déclinée"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
