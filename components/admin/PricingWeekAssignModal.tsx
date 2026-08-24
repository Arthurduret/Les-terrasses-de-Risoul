"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { formatShortDate } from "@/components/calendar/utils";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

const FALLBACK_COLOR = "#c79267";

interface PricingWeekAssignModalProps {
  weeks: Date[];
  rules: PricingRule[];
  pending: boolean;
  onAssign: (ruleId: string | null, recurYearly: boolean) => void;
  onClose: () => void;
}

// Nombre d'années (année en cours incluse) sur lesquelles une assignation
// "récurrente" est répétée — même semaine +364 jours à chaque fois (un
// multiple exact de 7 jours : tombe toujours un samedi, contrairement à
// "même date l'an prochain" qui dérive du jour de la semaine).
export const RECURRING_YEARS = 5;

// Popup ouverte après un glisser sur le calendrier de tarifs : choisir le
// tarif à appliquer aux semaines sélectionnées (ou le retirer). Même
// famille visuelle que les autres popups admin (portail, mêmes couleurs).
export function PricingWeekAssignModal({
  weeks,
  rules,
  pending,
  onAssign,
  onClose,
}: PricingWeekAssignModalProps) {
  const [mounted, setMounted] = useState(false);
  const [recurYearly, setRecurYearly] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (weeks.length > 0) setRecurYearly(false);
  }, [weeks]);

  useEffect(() => {
    if (weeks.length === 0) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [weeks, onClose, pending]);

  if (!mounted || weeks.length === 0) return null;

  const first = weeks[0];
  const last = weeks[weeks.length - 1];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => !pending && onClose()}
    >
      <div
        className="w-full max-w-sm border border-foreground/15 bg-anthracite-800 p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-display text-xl text-foreground">
          {weeks.length === 1
            ? `Semaine du ${formatShortDate(first)}`
            : `${weeks.length} semaines, du ${formatShortDate(first)} au ${formatShortDate(last)}`}
        </p>

        {rules.length === 0 ? (
          <p className="mt-4 text-sm text-mist-600">
            Ajoutez d&apos;abord un tarif ci-dessous pour pouvoir l&apos;assigner à
            des semaines.
          </p>
        ) : (
          <>
            <div className="mt-4 space-y-2">
              {rules.map((rule) => (
                <button
                  key={rule.id}
                  type="button"
                  disabled={pending}
                  onClick={() => onAssign(rule.id, recurYearly)}
                  className="flex w-full items-center gap-3 border border-foreground/15 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:border-wood-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: rule.color ?? FALLBACK_COLOR }}
                  />
                  {rule.label}
                </button>
              ))}
            </div>

            <label className="mt-4 flex items-center gap-2.5 text-sm text-mist-400">
              <input
                type="checkbox"
                checked={recurYearly}
                onChange={(e) => setRecurYearly(e.target.checked)}
                className="h-4 w-4 accent-wood-500"
              />
              Répéter chaque année (les {RECURRING_YEARS} prochaines années)
            </label>
          </>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => onAssign(null, false)}
          >
            Retirer le tarif
          </Button>
          <Button type="button" variant="secondary" disabled={pending} onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
