import { FormField } from "./FormField";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

const DEFAULT_COLOR = "#c79267";

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
        <label className="block">
          <span className="block text-sm text-mist-400">Couleur</span>
          <input
            type="color"
            name="color"
            defaultValue={defaultValues?.color ?? DEFAULT_COLOR}
            className="mt-1.5 h-[42px] w-full cursor-pointer border border-foreground/15 bg-background"
          />
        </label>
        <FormField
          name="price_per_week"
          label="Prix par semaine (€)"
          type="number"
          step="0.01"
          defaultValue={
            defaultValues
              ? Math.round(defaultValues.price_per_night * 7 * 100) / 100
              : undefined
          }
          required
        />
        <FormField
          name="min_weeks"
          label="Réduction à partir de (nombre de semaines, optionnel)"
          type="number"
          defaultValue={
            defaultValues?.min_nights ? defaultValues.min_nights / 7 : ""
          }
        />
        <FormField
          name="discount_percent"
          label="Réduction (%, optionnel)"
          type="number"
          step="0.1"
          defaultValue={defaultValues?.discount_percent ?? ""}
        />
      </div>
      <p className="text-xs text-mist-700">
        Les semaines où ce tarif s&apos;applique se choisissent dans le
        calendrier de tarifs, plus bas.
      </p>
    </div>
  );
}
