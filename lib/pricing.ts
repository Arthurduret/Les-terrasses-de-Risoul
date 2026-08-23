import { formatISO } from "@/components/calendar/utils";
import type { Database } from "./supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

// Date de début de semaine (YYYY-MM-DD) -> id du tarif assigné à cette
// semaine (table pricing_rule_weeks). Une semaine sans entrée n'a pas
// de tarif — voir le calendrier de tarifs dans la console admin.
export type WeekAssignments = Record<string, string>;

export interface PriceBreakdown {
  nights: number;
  pricePerNight: number;
  ruleLabel: string;
  discountPercent: number;
  subtotal: number;
  total: number;
}

// Source unique de vérité pour le calcul du prix d'un séjour.
// Ne pas dupliquer cette logique côté site public ou côté admin.
export function calculateTotalPrice(
  startDate: Date,
  endDate: Date,
  pricingRules: PricingRule[],
  weekAssignments: WeekAssignments
): PriceBreakdown {
  const nights = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) {
    throw new Error("La date de fin doit être postérieure à la date de début.");
  }

  const applicableRule = selectPricingRule(startDate, pricingRules, weekAssignments);

  if (!applicableRule) {
    throw new Error("Aucun tarif défini pour cette semaine d'arrivée.");
  }

  const subtotal = nights * applicableRule.price_per_night;
  // La réduction dégressive du tarif assigné à la semaine ne s'applique que
  // si le séjour atteint son propre seuil (min_nights) — sinon on garde le
  // prix de base de ce même tarif, plutôt que d'échouer faute de règle.
  const discountPercent =
    nights >= (applicableRule.min_nights ?? 0) ? applicableRule.discount_percent ?? 0 : 0;
  const total = subtotal * (1 - discountPercent / 100);

  return {
    nights,
    pricePerNight: applicableRule.price_per_night,
    ruleLabel: applicableRule.label,
    discountPercent,
    subtotal,
    total,
  };
}

export interface GrandTotal {
  breakdown: PriceBreakdown;
  cleaningFee: number;
  touristTax: number;
  grandTotal: number;
}

// Total complet d'une demande : séjour + ménage (optionnel) + taxe de
// séjour (uniquement les adultes — les mineurs en sont exonérés par la
// loi française). Source unique de vérité, utilisée à la fois par
// l'aperçu du widget et le récapitulatif du formulaire de demande.
export function calculateGrandTotal(
  startDate: Date,
  endDate: Date,
  pricingRules: PricingRule[],
  weekAssignments: WeekAssignments,
  options: {
    adults: number;
    cleaningRequested: boolean;
    cleaningFee: number;
    touristTaxPerPersonPerNight: number;
  }
): GrandTotal {
  const breakdown = calculateTotalPrice(startDate, endDate, pricingRules, weekAssignments);
  const cleaningFee = options.cleaningRequested ? options.cleaningFee : 0;
  const touristTax =
    breakdown.nights * options.adults * options.touristTaxPerPersonPerNight;

  return {
    breakdown,
    cleaningFee,
    touristTax,
    grandTotal: breakdown.total + cleaningFee + touristTax,
  };
}

// Tarif de la semaine à venir la plus proche (aujourd'hui compris) parmi
// celles ayant un tarif assigné — utilisé pour afficher un prix de départ
// réel avant toute sélection de dates, plutôt qu'un prix statique
// déconnecté du calendrier.
export function getUpcomingRule(
  pricingRules: PricingRule[],
  weekAssignments: WeekAssignments,
  todayISO: string
): PricingRule | null {
  const nextWeekIso = Object.keys(weekAssignments)
    .filter((iso) => iso >= todayISO)
    .sort()[0];
  if (!nextWeekIso) return null;
  return pricingRules.find((rule) => rule.id === weekAssignments[nextWeekIso]) ?? null;
}

// Le tarif d'un séjour est entièrement déterminé par le tarif assigné à sa
// semaine d'arrivée (calendrier de tarifs, un tarif par semaine) — pas de
// répartition si un séjour de plusieurs semaines traverse des tarifs
// différents, la semaine d'arrivée fixe le prix par nuit pour tout le séjour.
function selectPricingRule(
  startDate: Date,
  pricingRules: PricingRule[],
  weekAssignments: WeekAssignments
): PricingRule | undefined {
  const ruleId = weekAssignments[formatISO(startDate)];
  if (!ruleId) return undefined;
  return pricingRules.find((rule) => rule.id === ruleId);
}
