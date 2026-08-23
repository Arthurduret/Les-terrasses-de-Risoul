"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AvailabilityCalendar } from "@/components/calendar/AvailabilityCalendar";
import { BookingRequestModal } from "./BookingRequestModal";
import { calculateTotalPrice, type PriceBreakdown, type WeekAssignments } from "@/lib/pricing";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

interface BookingWidgetProps {
  blockedDates: string[];
  pricingRules: PricingRule[];
  weekAssignments: WeekAssignments;
  settings: Record<string, string>;
}

function eur(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} €`;
}

// Aperçu de prix simple (nuits × tarif) : le détail complet — ménage,
// taxe de séjour selon adultes/enfants — se calcule dans le popup de
// demande, une fois ces informations connues (voir BookingRequestModal,
// qui réutilise calculateGrandTotal, la même source de vérité).
export function BookingWidget({
  blockedDates,
  pricingRules,
  weekAssignments,
  settings,
}: BookingWidgetProps) {
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>(
    { start: null, end: null }
  );
  const [requestOpen, setRequestOpen] = useState(false);

  let breakdown: PriceBreakdown | null = null;
  let priceError: string | null = null;

  if (range.start && range.end) {
    try {
      breakdown = calculateTotalPrice(range.start, range.end, pricingRules, weekAssignments);
    } catch (err) {
      priceError =
        err instanceof Error ? err.message : "Tarif indisponible pour ces dates.";
    }
  }

  const weeks = breakdown ? Math.round(breakdown.nights / 7) : 0;

  return (
    <div className="rounded-[4px] border border-foreground/10 bg-anthracite-800 p-7">
      <AvailabilityCalendar
        blockedDates={blockedDates}
        months={1}
        onSelectionChange={setRange}
      />

      {priceError && (
        <p className="mt-5 border-t border-foreground/10 pt-5 text-sm text-mist-500">
          {priceError}
        </p>
      )}

      {breakdown && !priceError && (
        <div className="mt-5 border-t border-foreground/10 pt-5">
          <span className="inline-block rounded-[3px] bg-wood-900/25 px-2 py-1 text-[10px] tracking-[0.14em] text-wood-300 uppercase">
            {breakdown.ruleLabel}
          </span>
          <div className="mt-3 flex items-baseline justify-between text-sm text-mist-500">
            <span>
              {eur(breakdown.pricePerNight * 7)} / semaine × {weeks} semaine
              {weeks > 1 ? "s" : ""}
            </span>
            <span>{eur(breakdown.subtotal)}</span>
          </div>
          {breakdown.discountPercent > 0 && (
            <div className="mt-1.5 flex items-baseline justify-between text-sm text-wood-500">
              <span>Remise séjour long (-{breakdown.discountPercent}%)</span>
              <span>-{eur(breakdown.subtotal - breakdown.total)}</span>
            </div>
          )}
          <div className="mt-3 flex items-baseline justify-between border-t border-foreground/10 pt-3">
            <span className="text-xs tracking-[0.16em] text-mist-600 uppercase">
              Total
            </span>
            <span className="font-display text-3xl text-foreground">
              {eur(breakdown.total)}
            </span>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        className="mt-6 w-full"
        disabled={!range.start || !range.end}
        onClick={() => setRequestOpen(true)}
      >
        Demander ces dates
      </Button>
      <p className="mt-3 text-center text-xs text-mist-700">
        Réponse rapide · Aucun frais de dossier
      </p>

      <BookingRequestModal
        startDate={requestOpen ? range.start : null}
        endDate={requestOpen ? range.end : null}
        pricingRules={pricingRules}
        weekAssignments={weekAssignments}
        settings={settings}
        onClose={() => setRequestOpen(false)}
      />
    </div>
  );
}
