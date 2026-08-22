import { Button } from "@/components/ui/Button";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { PricingRuleFields } from "@/components/admin/PricingRuleFields";
import { createClient } from "@/lib/supabase/server";
import { createPricingRule, deletePricingRule, updatePricingRule } from "./actions";

export default async function AdminTarifsPage() {
  const supabase = await createClient();
  const { data: rules } = await supabase
    .from("pricing_rules")
    .select("*")
    .order("min_nights", { ascending: true, nullsFirst: true });

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Tarifs</h1>
      <p className="mt-2 text-mist-500">
        Le site affiche automatiquement le tarif le plus bas parmi ceux
        renseignés ici. La réduction s&apos;applique au nombre total de
        nuits de la demande.
      </p>

      <div className="mt-8 space-y-6">
        {(rules ?? []).map((rule) => (
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

        {(rules ?? []).length === 0 && (
          <p className="text-sm text-mist-600">
            Aucun tarif enregistré pour l&apos;instant — le site affichera
            « Tarifs à venir » tant qu&apos;aucun n&apos;est ajouté.
          </p>
        )}
      </div>

      <div className="mt-10 border-t border-foreground/10 pt-8">
        <h2 className="font-display text-xl text-foreground">
          Ajouter un tarif
        </h2>
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
