import {
  createPricingRule,
  deletePricingRule,
  updatePricingRule,
} from "@/app/admin/(protected)/actions/pricing";
import { Button } from "@/components/ui/Button";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import { PricingRuleFields } from "./PricingRuleFields";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

export function PricingRulesSection({ rules }: { rules: PricingRule[] }) {
  return (
    <div>
      <div className="space-y-6">
        {rules.map((rule) => (
          <form
            key={rule.id}
            action={updatePricingRule.bind(null, rule.id)}
            className="border border-foreground/10 bg-anthracite-800 p-6"
          >
            <PricingRuleFields defaultValues={rule} />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary">
                Enregistrer
              </Button>
              <ConfirmSubmitButton
                formAction={deletePricingRule.bind(null, rule.id)}
                confirmMessage={`Supprimer le tarif "${rule.label}" ?`}
                variant="secondary"
              >
                Supprimer
              </ConfirmSubmitButton>
            </div>
          </form>
        ))}

        {rules.length === 0 && (
          <p className="text-sm text-mist-600">
            Aucun tarif enregistré pour l&apos;instant — le site affichera
            « Tarifs à venir » tant qu&apos;aucun n&apos;est ajouté.
          </p>
        )}
      </div>

      <div className="mt-10 border-t border-foreground/10 pt-8">
        <h3 className="font-display text-lg text-foreground">
          Ajouter un tarif
        </h3>
        <form
          action={createPricingRule}
          className="mt-4 border border-foreground/10 bg-anthracite-800 p-6"
        >
          <PricingRuleFields />
          <Button type="submit" variant="primary" className="mt-5">
            Ajouter
          </Button>
        </form>
      </div>
    </div>
  );
}
