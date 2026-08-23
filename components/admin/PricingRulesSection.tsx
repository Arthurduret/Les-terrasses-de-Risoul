"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PricingRuleModal } from "./PricingRuleModal";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

const FALLBACK_COLOR = "#c79267";

function eur(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} €`;
}

// Liste compacte : chaque tarif tient sur une ligne, le formulaire complet
// ne s'ouvre (en fenêtre) que pour créer ou modifier un tarif précis.
export function PricingRulesSection({ rules }: { rules: PricingRule[] }) {
  const [target, setTarget] = useState<PricingRule | "new" | null>(null);

  return (
    <div>
      <div className="space-y-2.5">
        {rules.map((rule) => (
          <button
            key={rule.id}
            type="button"
            onClick={() => setTarget(rule)}
            className="flex w-full items-center gap-4 border border-foreground/10 bg-anthracite-800 px-5 py-3.5 text-left transition-colors hover:border-wood-500/45"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: rule.color ?? FALLBACK_COLOR }}
            />
            <span className="flex-1 truncate text-sm text-foreground">{rule.label}</span>
            <span className="shrink-0 text-sm text-mist-400">
              {eur(rule.price_per_night * 7)} / semaine
            </span>
          </button>
        ))}

        {rules.length === 0 && (
          <p className="text-sm text-mist-600">
            Aucun tarif enregistré pour l&apos;instant — le site affichera
            « Tarifs à venir » tant qu&apos;aucun n&apos;est ajouté.
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="secondary"
        className="mt-5"
        onClick={() => setTarget("new")}
      >
        Ajouter un tarif
      </Button>

      <PricingRuleModal target={target} onClose={() => setTarget(null)} />
    </div>
  );
}
