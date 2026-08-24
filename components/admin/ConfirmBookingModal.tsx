"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  confirmBookingRequest,
  type ConfirmBookingOverrides,
} from "@/app/admin/(protected)/actions/bookingRequests";
import { Button } from "@/components/ui/Button";
import { formatISO, parseISODate } from "@/components/calendar/utils";
import { calculateGrandTotal, type WeekAssignments } from "@/lib/pricing";
import type { Database } from "@/lib/supabase/database.types";

type BookingRequest = Database["public"]["Tables"]["booking_requests"]["Row"];
type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

// L'appartement peut au besoin accueillir jusqu'à 16 personnes avec des
// couchages d'appoint — au-delà du plafond de 12 affiché côté public
// (voir MAX_OCCUPANTS dans BookingRequestModal), l'admin garde la main
// pour ajuster au moment de valider une demande réelle.
const ADMIN_MAX_OCCUPANTS = 16;

function eur(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} €`;
}

function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-mist-400">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Retirer un ${label.toLowerCase()}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/18 text-mist-300 hover:border-wood-500 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>
        <span className="w-4 text-center text-foreground">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Ajouter un ${label.toLowerCase()}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/18 text-mist-300 hover:border-wood-500 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Ligne de prix avec remplacement manuel optionnel : champ vide = valeur
// calculée (affichée en aperçu) conservée, une valeur saisie la remplace.
function OverrideRow({
  label,
  caption,
  computedValue,
  overrideValue,
  onOverrideChange,
}: {
  label: string;
  caption?: string;
  computedValue: number | null;
  overrideValue: string;
  onOverrideChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-mist-500">{label}</span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={overrideValue}
            onChange={(e) => onOverrideChange(e.target.value)}
            placeholder={computedValue != null ? String(Math.round(computedValue)) : "—"}
            className="w-24 border border-foreground/15 bg-background px-2 py-1 text-right text-sm text-foreground placeholder:text-mist-700 focus:border-wood-500 focus:outline-none"
          />
          <span className="text-sm text-mist-500">€</span>
        </div>
      </div>
      {caption && <p className="mt-0.5 text-xs text-mist-700">{caption}</p>}
    </div>
  );
}

interface ConfirmBookingModalProps {
  request: BookingRequest | null;
  pricingRules: PricingRule[];
  weekAssignments: WeekAssignments;
  settings: Record<string, string>;
  onClose: () => void;
}

// Avant de confirmer une demande, l'admin revoit et peut corriger les
// dates, adultes/enfants/ménage et — individuellement — le prix du
// séjour, le ménage et la taxe de séjour (ex. tarif négocié). Tout ce qui
// est affiché ici est exactement ce qui part dans l'email de confirmation
// (voir sendConfirmationEmail, même logique de repli sur les valeurs
// calculées quand un champ n'est pas remplacé).
export function ConfirmBookingModal({
  request,
  pricingRules,
  weekAssignments,
  settings,
  onClose,
}: ConfirmBookingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [cleaningRequested, setCleaningRequested] = useState(true);
  const [stayOverride, setStayOverride] = useState("");
  const [cleaningOverride, setCleaningOverride] = useState("");
  const [taxOverride, setTaxOverride] = useState("");
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!request) return;
    setStartDateInput(request.start_date);
    setEndDateInput(request.end_date);
    setAdults(request.adults);
    setChildren(request.children);
    setCleaningRequested(request.cleaning_requested);
    setStayOverride(request.stay_price_override != null ? String(request.stay_price_override) : "");
    setCleaningOverride(
      request.cleaning_fee_override != null ? String(request.cleaning_fee_override) : ""
    );
    setTaxOverride(request.tourist_tax_override != null ? String(request.tourist_tax_override) : "");
    setSubmitError(null);
  }, [request]);

  useEffect(() => {
    if (!request) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [request, pending, onClose]);

  if (!request || !mounted) return null;

  const start = parseISODate(startDateInput);
  const end = parseISODate(endDateInput);
  // Contrairement au site public, l'admin peut confirmer des dates hors
  // samedi-samedi (séjour exceptionnel, arrangement particulier) — seule
  // règle : le départ doit être après l'arrivée.
  const datesValid = startDateInput !== "" && endDateInput !== "" && end.getTime() > start.getTime();
  const nights = datesValid ? Math.round((end.getTime() - start.getTime()) / 86400000) : 0;
  const weeks = nights / 7;

  const cleaningFeeSetting = Number(settings.cleaning_fee ?? 0) || 0;
  const touristTaxRate = Number(settings.tourist_tax_per_person_per_night ?? 0) || 0;

  let grandTotal: ReturnType<typeof calculateGrandTotal> | null = null;
  let dateError: string | null = null;
  if (!datesValid) {
    dateError = "La date de départ doit être après la date d'arrivée.";
  } else {
    try {
      grandTotal = calculateGrandTotal(start, end, pricingRules, weekAssignments, {
        adults,
        cleaningRequested,
        cleaningFee: cleaningFeeSetting,
        touristTaxPerPersonPerNight: touristTaxRate,
      });
    } catch {
      // Pas de tarif assigné à cette semaine — pas bloquant si un tarif de
      // séjour est fourni à la main ci-dessous.
    }
  }

  const stayOverrideNum = stayOverride.trim() !== "" ? Number(stayOverride) : null;
  const cleaningOverrideNum = cleaningOverride.trim() !== "" ? Number(cleaningOverride) : null;
  const taxOverrideNum = taxOverride.trim() !== "" ? Number(taxOverride) : null;

  const effectiveStay = stayOverrideNum ?? grandTotal?.breakdown.total ?? null;
  const effectiveCleaning =
    cleaningOverrideNum ?? grandTotal?.cleaningFee ?? (cleaningRequested ? cleaningFeeSetting : 0);
  const effectiveTax = taxOverrideNum ?? grandTotal?.touristTax ?? nights * adults * touristTaxRate;
  const effectiveTotal = effectiveStay != null ? effectiveStay + effectiveCleaning + effectiveTax : null;

  const canConfirm = datesValid && effectiveStay != null && !pending;

  async function handleConfirm() {
    if (!canConfirm) return;
    setPending(true);
    setSubmitError(null);

    const overrides: ConfirmBookingOverrides = {
      startDate: formatISO(start),
      endDate: formatISO(end),
      adults,
      children,
      cleaningRequested,
      stayPriceOverride: stayOverrideNum,
      cleaningFeeOverride: cleaningOverrideNum,
      touristTaxOverride: taxOverrideNum,
    };

    const result = await confirmBookingRequest(request!.id, overrides);
    setPending(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 py-10"
      onClick={() => !pending && onClose()}
    >
      <div
        className="w-full max-w-lg border border-foreground/15 bg-anthracite-800 p-6 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-display text-2xl text-foreground">Confirmer la réservation</p>
        <p className="mt-2 text-sm text-mist-500">
          {request.first_name} {request.last_name}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-foreground/10 pt-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-mist-400">Arrivée</span>
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="w-full border border-foreground/15 bg-background px-3 py-2 text-foreground focus:border-wood-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-mist-400">Départ</span>
            <input
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="w-full border border-foreground/15 bg-background px-3 py-2 text-foreground focus:border-wood-500 focus:outline-none"
            />
          </label>
        </div>
        {dateError ? (
          <p className="mt-2 text-xs text-red-400">{dateError}</p>
        ) : (
          <p className="mt-2 text-xs text-mist-700">
            {nights} nuit{nights > 1 ? "s" : ""}
          </p>
        )}

        <div className="mt-5 space-y-3 border-t border-foreground/10 pt-5">
          <Counter
            label="Adultes"
            value={adults}
            min={1}
            max={ADMIN_MAX_OCCUPANTS - children}
            onChange={setAdults}
          />
          <Counter
            label="Enfants"
            value={children}
            min={0}
            max={ADMIN_MAX_OCCUPANTS - adults}
            onChange={setChildren}
          />
          <p className="text-xs text-mist-700">
            Jusqu&apos;à {ADMIN_MAX_OCCUPANTS} personnes avec couchages d&apos;appoint. La taxe
            de séjour s&apos;applique aux adultes uniquement.
          </p>
        </div>

        <label className="mt-5 flex items-center gap-2.5 border-t border-foreground/10 pt-5 text-sm text-mist-400">
          <input
            type="checkbox"
            checked={cleaningRequested}
            onChange={(e) => setCleaningRequested(e.target.checked)}
            className="h-4 w-4 accent-wood-500"
          />
          Ménage de fin de séjour
        </label>

        <div className="mt-5 space-y-4 border-t border-foreground/10 pt-5">
          <p className="text-xs tracking-[0.14em] text-mist-600 uppercase">
            Prix — laisser vide pour garder le calcul automatique
          </p>
          <OverrideRow
            label="Prix du séjour"
            caption={
              datesValid
                ? grandTotal
                  ? `${eur(grandTotal.breakdown.pricePerNight * 7)} / semaine × ${weeks} semaine${weeks > 1 ? "s" : ""}`
                  : "Aucun tarif assigné à cette semaine — saisir un montant."
                : undefined
            }
            computedValue={grandTotal?.breakdown.total ?? null}
            overrideValue={stayOverride}
            onOverrideChange={setStayOverride}
          />
          {cleaningRequested && (
            <OverrideRow
              label="Ménage"
              computedValue={grandTotal?.cleaningFee ?? cleaningFeeSetting}
              overrideValue={cleaningOverride}
              onOverrideChange={setCleaningOverride}
            />
          )}
          <OverrideRow
            label="Taxe de séjour"
            computedValue={grandTotal?.touristTax ?? nights * adults * touristTaxRate}
            overrideValue={taxOverride}
            onOverrideChange={setTaxOverride}
          />
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-foreground/10 pt-5">
          <span className="text-xs tracking-[0.16em] text-mist-600 uppercase">Total</span>
          <span className="font-display text-2xl text-foreground">
            {effectiveTotal != null ? eur(effectiveTotal) : "—"}
          </span>
        </div>

        <p className="mt-5 text-xs text-mist-700">
          Ces valeurs seront enregistrées sur la demande et utilisées dans l&apos;email de
          confirmation envoyé à {request.email}.
        </p>

        {submitError && <p className="mt-3 text-sm text-red-400">{submitError}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="primary" disabled={!canConfirm} onClick={handleConfirm}>
            {pending ? "Confirmation…" : "Confirmer la réservation"}
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
