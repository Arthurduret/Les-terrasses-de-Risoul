"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { confirmBookingRequest } from "@/app/admin/(protected)/actions/bookingRequests";
import { Button } from "@/components/ui/Button";
import { formatShortDate, parseISODate } from "@/components/calendar/utils";
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

interface ConfirmBookingModalProps {
  request: BookingRequest | null;
  pricingRules: PricingRule[];
  weekAssignments: WeekAssignments;
  settings: Record<string, string>;
  onClose: () => void;
}

// Avant de confirmer une demande, l'admin revoit et peut corriger le
// nombre d'adultes/enfants et le ménage — le prix, la taxe de séjour et le
// total affichés dans cette fenêtre sont exactement ceux qui partiront
// dans l'email de confirmation au client (même calculateGrandTotal,
// aucune valeur recalculée séparément).
export function ConfirmBookingModal({
  request,
  pricingRules,
  weekAssignments,
  settings,
  onClose,
}: ConfirmBookingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [cleaningRequested, setCleaningRequested] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!request) return;
    setAdults(request.adults);
    setChildren(request.children);
    setCleaningRequested(request.cleaning_requested);
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

  const start = parseISODate(request.start_date);
  const end = parseISODate(request.end_date);
  const cleaningFee = Number(settings.cleaning_fee ?? 0) || 0;
  const touristTaxRate = Number(settings.tourist_tax_per_person_per_night ?? 0) || 0;

  let grandTotal: ReturnType<typeof calculateGrandTotal> | null = null;
  let priceError: string | null = null;
  try {
    grandTotal = calculateGrandTotal(start, end, pricingRules, weekAssignments, {
      adults,
      cleaningRequested,
      cleaningFee,
      touristTaxPerPersonPerNight: touristTaxRate,
    });
  } catch (err) {
    priceError = err instanceof Error ? err.message : "Tarif indisponible pour ces dates.";
  }

  async function handleConfirm() {
    setPending(true);
    await confirmBookingRequest(request!.id, { adults, children, cleaningRequested });
    setPending(false);
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
          {request.first_name} {request.last_name} — Du{" "}
          <span className="font-semibold text-foreground">{formatShortDate(start)}</span> au{" "}
          <span className="font-semibold text-foreground">{formatShortDate(end)}</span>
        </p>

        <div className="mt-6 space-y-3 border-t border-foreground/10 pt-5">
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
          Ménage de fin de séjour{cleaningFee > 0 ? ` (${eur(cleaningFee)})` : ""}
        </label>

        {priceError ? (
          <p className="mt-5 border-t border-foreground/10 pt-5 text-sm text-mist-500">
            {priceError}
          </p>
        ) : (
          grandTotal && (
            <div className="mt-5 space-y-2 border-t border-foreground/10 pt-5 text-sm text-mist-500">
              <div className="flex justify-between gap-3">
                <span>
                  {eur(grandTotal.breakdown.pricePerNight * 7)} / semaine ×{" "}
                  {grandTotal.breakdown.nights / 7} semaine
                  {grandTotal.breakdown.nights / 7 > 1 ? "s" : ""}
                </span>
                <span className="text-foreground">{eur(grandTotal.breakdown.total)}</span>
              </div>
              {grandTotal.cleaningFee > 0 && (
                <div className="flex justify-between gap-3">
                  <span>Ménage</span>
                  <span className="text-foreground">{eur(grandTotal.cleaningFee)}</span>
                </div>
              )}
              {grandTotal.touristTax > 0 && (
                <div className="flex justify-between gap-3">
                  <span>Taxe de séjour</span>
                  <span className="text-foreground">{eur(grandTotal.touristTax)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-foreground/10 pt-3">
                <span className="text-xs tracking-[0.16em] text-mist-600 uppercase">Total</span>
                <span className="font-display text-2xl text-foreground">
                  {eur(grandTotal.grandTotal)}
                </span>
              </div>
            </div>
          )
        )}

        <p className="mt-5 text-xs text-mist-700">
          Ces valeurs seront enregistrées sur la demande et utilisées dans l&apos;email de
          confirmation envoyé à {request.email}.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="primary" disabled={pending} onClick={handleConfirm}>
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
