"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AvailabilityCalendar } from "@/components/calendar/AvailabilityCalendar";
import { BookingRequestModal } from "./BookingRequestModal";
import { calculateTotalPrice, type PriceBreakdown, type WeekAssignments } from "@/lib/pricing";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

const MAX_GUESTS = 12;

interface BookingWidgetProps {
  blockedDates: string[];
  pricingRules: PricingRule[];
  weekAssignments: WeekAssignments;
  settings: Record<string, string>;
}

function eur(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} €`;
}

function CounterButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-foreground/18 text-base text-mist-300 transition-colors hover:border-wood-500 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

// Aperçu de prix (nuits × tarif de la semaine d'arrivée) : le détail complet
// — ménage, taxe de séjour selon adultes/enfants — se calcule dans le popup
// de demande, une fois ces informations connues (voir BookingRequestModal,
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
  const [guests, setGuests] = useState(2);
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
    <div className="rounded-[4px] border border-foreground/[0.12] bg-anthracite-800 p-[26px]">
      <div className="mb-[22px] flex min-h-[38px] items-baseline justify-between gap-3">
        {breakdown && !priceError ? (
          <>
            <div>
              <span className="font-display text-[34px] font-medium text-foreground">
                {eur(breakdown.pricePerNight * 7)}
              </span>
              <span className="ml-1 text-sm text-mist-600">/ semaine</span>
            </div>
            <span className="text-xs tracking-[0.14em] text-wood-500 uppercase">
              {breakdown.ruleLabel}
            </span>
          </>
        ) : (
          <span className="text-sm text-mist-600">
            Choisissez vos dates pour voir le tarif
          </span>
        )}
      </div>

      <AvailabilityCalendar
        blockedDates={blockedDates}
        months={1}
        onSelectionChange={setRange}
      />

      <div className="mt-5 flex items-center justify-between border-t border-foreground/[0.12] pt-5">
        <div>
          <div className="text-xs tracking-[0.14em] text-mist-600 uppercase">
            Voyageurs
          </div>
          <div className="mt-1 text-base text-foreground">
            {guests} voyageur{guests > 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CounterButton
            label="Retirer un voyageur"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            disabled={guests <= 1}
          >
            −
          </CounterButton>
          <CounterButton
            label="Ajouter un voyageur"
            onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))}
            disabled={guests >= MAX_GUESTS}
          >
            +
          </CounterButton>
        </div>
      </div>

      {priceError && (
        <p className="mt-5 border-t border-foreground/[0.12] pt-5 text-sm text-mist-500">
          {priceError}
        </p>
      )}

      {breakdown && !priceError && (
        <div className="mt-5 border-t border-foreground/[0.12] pt-5">
          <div className="flex items-baseline justify-between text-sm text-mist-400">
            <span>
              {eur(breakdown.pricePerNight * 7)} / semaine × {weeks} semaine
              {weeks > 1 ? "s" : ""}
            </span>
            <span className="text-foreground">{eur(breakdown.subtotal)}</span>
          </div>
          {breakdown.discountPercent > 0 && (
            <div className="mt-2.5 flex items-baseline justify-between text-sm text-wood-500">
              <span>Remise séjour long (-{breakdown.discountPercent}%)</span>
              <span>-{eur(breakdown.subtotal - breakdown.total)}</span>
            </div>
          )}
          <div className="mt-4 flex items-baseline justify-between border-t border-foreground/[0.12] pt-4">
            <span className="text-xs tracking-[0.16em] text-mist-600 uppercase">
              Total
            </span>
            <span className="font-display text-[30px] text-foreground">
              {eur(breakdown.total)}
            </span>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        className="mt-5 w-full"
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
        defaultAdults={guests}
        onClose={() => setRequestOpen(false)}
      />
    </div>
  );
}
