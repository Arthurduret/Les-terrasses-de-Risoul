import { AvailabilityEditor } from "@/components/admin/AvailabilityEditor";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDisponibilitesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("availability")
    .select("date, status, note")
    .order("date", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">
        Disponibilités
      </h1>
      <p className="mt-2 text-mist-500">
        Cliquez sur une date pour la bloquer ou la libérer.
      </p>

      <div className="mt-8 border border-foreground/10 bg-anthracite-800 p-6">
        <AvailabilityEditor
          initialRows={(data ?? []).map((row) => ({
            date: row.date,
            status: row.status as "blocked" | "booked",
            note: row.note,
          }))}
        />
      </div>
    </div>
  );
}
