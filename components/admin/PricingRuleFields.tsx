import { FormField } from "./FormField";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

export function PricingRuleFields({
  defaultValues,
}: {
  defaultValues?: PricingRule;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        name="label"
        label="Nom du tarif"
        placeholder="Ex. Semaine hiver"
        defaultValue={defaultValues?.label}
        required
      />
      <FormField
        name="price_per_night"
        label="Prix par nuit (€)"
        type="number"
        step="0.01"
        defaultValue={defaultValues?.price_per_night}
        required
      />
      <FormField
        name="min_nights"
        label="S'applique à partir de (nombre de nuits, optionnel)"
        type="number"
        defaultValue={defaultValues?.min_nights ?? ""}
      />
      <FormField
        name="discount_percent"
        label="Réduction (%, optionnel)"
        type="number"
        step="0.1"
        defaultValue={defaultValues?.discount_percent ?? ""}
      />
      <FormField
        name="season_start"
        label="Période — du (optionnel)"
        type="date"
        defaultValue={defaultValues?.season_start ?? ""}
      />
      <FormField
        name="season_end"
        label="Période — au (optionnel)"
        type="date"
        defaultValue={defaultValues?.season_end ?? ""}
      />
    </div>
  );
}
