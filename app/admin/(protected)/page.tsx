import { AvailabilityEditor } from "@/components/admin/AvailabilityEditor";
import { BookingHistoryTable } from "@/components/admin/BookingHistoryTable";
import { PendingRequestsSection } from "@/components/admin/PendingRequestsSection";
import { PricingRulesSection } from "@/components/admin/PricingRulesSection";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { data: availabilityRows },
    { data: pricingRules },
    { data: bookingRequestsData },
  ] = await Promise.all([
    supabase
      .from("availability")
      .select("date, status, note")
      .order("date", { ascending: true }),
    supabase
      .from("pricing_rules")
      .select("*")
      .order("min_nights", { ascending: true, nullsFirst: true }),
    supabase
      .from("booking_requests")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const bookingRequests = bookingRequestsData ?? [];
  const pendingRequests = bookingRequests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-16">
      <div>
        <h1 className="font-display text-3xl text-foreground">Réservations</h1>
        <p className="mt-2 text-mist-500">
          Disponibilités, tarifs et demandes, au même endroit.
        </p>
      </div>

      <section>
        <h2 className="font-display text-xl text-foreground">
          Demandes en attente ({pendingRequests.length})
        </h2>
        <div className="mt-4">
          <PendingRequestsSection requests={pendingRequests} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl text-foreground">
          Calendrier de disponibilité
        </h2>
        <p className="mt-2 text-sm text-mist-500">
          Cliquez sur une date pour la bloquer ou la libérer.
        </p>
        <div className="mt-6 border border-foreground/10 bg-anthracite-800 p-6">
          <AvailabilityEditor
            initialRows={(availabilityRows ?? []).map((row) => ({
              date: row.date,
              status: row.status as "blocked" | "booked",
              note: row.note,
            }))}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl text-foreground">Tarifs</h2>
        <p className="mt-2 text-sm text-mist-500">
          Le site affiche automatiquement le tarif le plus bas parmi ceux
          renseignés ici.
        </p>
        <div className="mt-6">
          <PricingRulesSection rules={pricingRules ?? []} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-mist-500">
          Qui occupe quoi, et quand
        </h2>
        <p className="mt-2 text-sm text-mist-600">
          Toutes les réservations, passées et à venir — quel que soit leur
          statut.
        </p>
        <div className="mt-5">
          <BookingHistoryTable requests={bookingRequests} />
        </div>
      </section>
    </div>
  );
}
