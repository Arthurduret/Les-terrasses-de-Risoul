"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AvailabilityCalendar } from "@/components/calendar/AvailabilityCalendar";
import { calculateTotalPrice, type PriceBreakdown } from "@/lib/pricing";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

interface BookingWidgetProps {
  blockedDates: string[];
  pricingRules: PricingRule[];
  settings: Record<string, string>;
}

const MAX_GUESTS = 6;

function eur(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} €`;
}

export function BookingWidget({
  blockedDates,
  pricingRules,
  settings,
}: BookingWidgetProps) {
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>(
    { start: null, end: null }
  );
  const [guests, setGuests] = useState(2);

  const cleaningFee = Number(settings.cleaning_fee ?? 0) || 0;
  const touristTaxRate =
    Number(settings.tourist_tax_per_person_per_night ?? 0) || 0;

  let breakdown: PriceBreakdown | null = null;
  let priceError: string | null = null;

  if (range.start && range.end) {
    try {
      breakdown = calculateTotalPrice(range.start, range.end, pricingRules);
    } catch (err) {
      priceError =
        err instanceof Error ? err.message : "Tarif indisponible pour ces dates.";
    }
  }

  const touristTax = breakdown
    ? breakdown.nights * guests * touristTaxRate
    : 0;
  const grandTotal = breakdown ? breakdown.total + cleaningFee + touristTax : null;
  const fromPrice =
    pricingRules.length > 0
      ? Math.min(...pricingRules.map((rule) => rule.price_per_night))
      : null;

  return (
    <div className="border border-foreground/10 bg-anthracite-800 p-7">
      <div className="mb-6">
        {fromPrice !== null ? (
          <>
            <span className="font-display text-3xl text-foreground">
              {eur(fromPrice)}
            </span>
            <span className="text-sm text-mist-600"> / nuit</span>
          </>
        ) : (
          <span className="text-sm text-mist-600">Tarifs à venir</span>
        )}
      </div>

      <AvailabilityCalendar
        blockedDates={blockedDates}
        months={1}
        onSelectionChange={setRange}
      />

      <div className="mt-5 flex items-center justify-between border-t border-foreground/10 pt-5">
        <div>
          <div className="text-xs tracking-[0.14em] text-mist-600 uppercase">
            Voyageurs
          </div>
          <div className="mt-1 text-base text-foreground">
            {guests} voyageur{guests > 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            disabled={guests <= 1}
            aria-label="Retirer un voyageur"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/18 text-mist-300 hover:border-wood-500 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))}
            disabled={guests >= MAX_GUESTS}
            aria-label="Ajouter un voyageur"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/18 text-mist-300 hover:border-wood-500 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {priceError && (
        <p className="mt-5 border-t border-foreground/10 pt-5 text-sm text-mist-500">
          {priceError}
        </p>
      )}

      {breakdown && !priceError && (
        <div className="mt-5 flex flex-col gap-2.5 border-t border-foreground/10 pt-5 text-sm text-mist-500">
          <div className="flex justify-between gap-3">
            <span>
              {eur(breakdown.pricePerNight)} × {breakdown.nights} nuit
              {breakdown.nights > 1 ? "s" : ""}
            </span>
            <span className="text-foreground">{eur(breakdown.total)}</span>
          </div>
          {cleaningFee > 0 && (
            <div className="flex justify-between gap-3">
              <span>Ménage de fin de séjour</span>
              <span className="text-foreground">{eur(cleaningFee)}</span>
            </div>
          )}
          {touristTax > 0 && (
            <div className="flex justify-between gap-3">
              <span>Taxe de séjour</span>
              <span className="text-foreground">{eur(touristTax)}</span>
            </div>
          )}
        </div>
      )}

      {grandTotal !== null && (
        <div className="mt-5 flex items-baseline justify-between border-t border-foreground/10 pt-5">
          <span className="text-xs tracking-[0.16em] text-mist-600 uppercase">
            Total
          </span>
          <span className="font-display text-3xl text-foreground">
            {eur(grandTotal)}
          </span>
        </div>
      )}

      <a href="#contact" className="mt-6 block">
        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={!range.start || !range.end}
        >
          Demander ces dates
        </Button>
      </a>
      <p className="mt-3 text-center text-xs text-mist-700">
        Réponse rapide · Aucun frais de dossier
      </p>
    </div>
  );
}
