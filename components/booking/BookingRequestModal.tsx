"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { submitBookingRequest } from "@/app/(public)/actions/bookingRequest";
import { Button } from "@/components/ui/Button";
import { formatISO, formatShortDate } from "@/components/calendar/utils";
import { calculateGrandTotal, type WeekAssignments } from "@/lib/pricing";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { AddressAutocomplete } from "./AddressAutocomplete";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

const MAX_OCCUPANTS = 12;

interface BookingRequestModalProps {
  startDate: Date | null;
  endDate: Date | null;
  pricingRules: PricingRule[];
  weekAssignments: WeekAssignments;
  settings: Record<string, string>;
  defaultAdults?: number;
  defaultChildren?: number;
  onClose: () => void;
}

const inputClass =
  "w-full border border-foreground/15 bg-background px-3.5 py-2.5 text-foreground placeholder:text-mist-700 focus:border-wood-500 focus:outline-none";

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

export function BookingRequestModal({
  startDate,
  endDate,
  pricingRules,
  weekAssignments,
  settings,
  defaultAdults,
  defaultChildren,
  onClose,
}: BookingRequestModalProps) {
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [cleaningRequested, setCleaningRequested] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "sent">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({});

  useEffect(() => setMounted(true), []);

  // Pré-remplit adultes/enfants avec le compteur du widget à chaque
  // ouverture — reste modifiable ici avant l'envoi de la demande.
  useEffect(() => {
    if (!startDate) return;
    if (defaultChildren === undefined && defaultAdults === undefined) return;
    const nextChildren = Math.min(MAX_OCCUPANTS - 1, Math.max(0, defaultChildren ?? 0));
    const nextAdults = Math.min(MAX_OCCUPANTS - nextChildren, Math.max(1, defaultAdults ?? 1));
    setChildren(nextChildren);
    setAdults(nextAdults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate]);

  useEffect(() => {
    if (!startDate) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [startDate, onClose]);

  if (!startDate || !endDate || !mounted) return null;

  const cleaningFee = Number(settings.cleaning_fee ?? 0) || 0;
  const touristTaxRate = Number(settings.tourist_tax_per_person_per_night ?? 0) || 0;

  let grandTotal: ReturnType<typeof calculateGrandTotal> | null = null;
  let priceError: string | null = null;
  try {
    grandTotal = calculateGrandTotal(startDate, endDate, pricingRules, weekAssignments, {
      adults,
      cleaningRequested,
      cleaningFee,
      touristTaxPerPersonPerNight: touristTaxRate,
    });
  } catch (err) {
    priceError = err instanceof Error ? err.message : "Tarif indisponible pour ces dates.";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    const errors: { email?: string; phone?: string } = {};
    if (!isValidEmail(email)) errors.email = "Adresse email invalide.";
    if (!isValidPhone(phone)) {
      errors.phone = "Numéro invalide — ex. 06 12 34 56 78.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("loading");

    const result = await submitBookingRequest({
      startDate: formatISO(startDate!),
      endDate: formatISO(endDate!),
      firstName,
      lastName,
      address,
      postalCode,
      city,
      email,
      phone,
      adults,
      children,
      cleaningRequested,
      message,
    });

    if (result.error) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    setStatus("sent");
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-foreground/15 bg-anthracite-800 p-6 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        {status === "sent" ? (
          <>
            <p className="font-display text-2xl text-foreground">
              Demande envoyée
            </p>
            <p className="mt-3 text-sm text-mist-400">
              Merci {firstName} ! Nous revenons vers vous rapidement pour
              confirmer votre séjour du{" "}
              {formatShortDate(startDate)} au {formatShortDate(endDate)}.
            </p>
            <Button type="button" variant="primary" onClick={onClose} className="mt-6 w-full">
              Fermer
            </Button>
          </>
        ) : (
          <>
            <p className="font-display text-2xl text-foreground">
              Demande de réservation
            </p>
            <p className="mt-2 text-sm text-mist-500">
              Du{" "}
              <span className="font-semibold text-foreground">
                {formatShortDate(startDate)}
              </span>{" "}
              au{" "}
              <span className="font-semibold text-foreground">
                {formatShortDate(endDate)}
              </span>
            </p>
            {(settings.checkin_time || settings.checkout_time) && (
              <p className="mt-1 text-xs text-mist-700">
                {settings.checkin_time && `Arrivée à partir de ${settings.checkin_time}`}
                {settings.checkin_time && settings.checkout_time && " · "}
                {settings.checkout_time && `Départ avant ${settings.checkout_time}`}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-mist-400">Prénom</span>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-mist-400">Nom</span>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm text-mist-400">Adresse</span>
                <AddressAutocomplete
                  value={address}
                  onChange={setAddress}
                  onSelect={(suggestion) => {
                    setAddress(suggestion.address);
                    setPostalCode(suggestion.postalCode);
                    setCity(suggestion.city);
                  }}
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[140px_1fr]">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-mist-400">Code postal</span>
                  <input
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-mist-400">Ville</span>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-mist-400">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((f) => ({ ...f, email: undefined }));
                    }}
                    className={inputClass}
                  />
                  {fieldErrors.email && (
                    <span className="mt-1 block text-xs text-red-400">{fieldErrors.email}</span>
                  )}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-mist-400">Téléphone</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setFieldErrors((f) => ({ ...f, phone: undefined }));
                    }}
                    placeholder="06 12 34 56 78"
                    className={inputClass}
                  />
                  {fieldErrors.phone && (
                    <span className="mt-1 block text-xs text-red-400">{fieldErrors.phone}</span>
                  )}
                </label>
              </div>

              <div className="space-y-3 border-t border-foreground/10 pt-5">
                <Counter
                  label="Adultes"
                  value={adults}
                  min={1}
                  max={MAX_OCCUPANTS - children}
                  onChange={setAdults}
                />
                <Counter
                  label="Enfants"
                  value={children}
                  min={0}
                  max={MAX_OCCUPANTS - adults}
                  onChange={setChildren}
                />
                <p className="text-xs text-mist-700">
                  L&apos;appartement accueille jusqu&apos;à {MAX_OCCUPANTS} personnes. La
                  taxe de séjour s&apos;applique aux adultes uniquement.
                </p>
              </div>

              <label className="flex items-center gap-2.5 border-t border-foreground/10 pt-5 text-sm text-mist-400">
                <input
                  type="checkbox"
                  checked={cleaningRequested}
                  onChange={(e) => setCleaningRequested(e.target.checked)}
                  className="h-4 w-4 accent-wood-500"
                />
                Ménage de fin de séjour{cleaningFee > 0 ? ` (${eur(cleaningFee)})` : ""}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-mist-400">
                  Message (optionnel)
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </label>

              {priceError ? (
                <p className="text-sm text-mist-500">{priceError}</p>
              ) : (
                grandTotal && (
                  <div className="space-y-2 border-t border-foreground/10 pt-5 text-sm text-mist-500">
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
                      <span className="text-xs tracking-[0.16em] text-mist-600 uppercase">
                        Total
                      </span>
                      <span className="font-display text-2xl text-foreground">
                        {eur(grandTotal.grandTotal)}
                      </span>
                    </div>
                  </div>
                )
              )}

              {status === "error" && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={status === "loading"}
                  className="flex-1"
                >
                  {status === "loading" ? "Envoi…" : "Envoyer la demande"}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Annuler
                </Button>
              </div>
              <p className="text-center text-xs text-mist-700">
                Réponse rapide · Aucun frais de dossier
              </p>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
