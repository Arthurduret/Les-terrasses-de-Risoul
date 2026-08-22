import { FormField } from "./FormField";
import { PricingDateRangePicker } from "./PricingDateRangePicker";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

export function PricingRuleFields({
  defaultValues,
}: {
  defaultValues?: PricingRule;
}) {
  return (
    <div className="space-y-5">
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
      </div>

      <div>
        <span className="mb-2 block text-sm text-mist-400">
          Période d&apos;application (optionnel — cliquez une date de début
          puis une date de fin ; laissez vide pour un tarif valable toute
          l&apos;année)
        </span>
        <div className="border border-foreground/10 bg-background p-4">
          <PricingDateRangePicker
            defaultStart={defaultValues?.season_start}
            defaultEnd={defaultValues?.season_end}
          />
        </div>
      </div>
    </div>
  );
}
