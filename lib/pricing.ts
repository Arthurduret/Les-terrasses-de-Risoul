import type { Database } from "./supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

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
  pricingRules: PricingRule[]
): PriceBreakdown {
  const nights = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) {
    throw new Error("La date de fin doit être postérieure à la date de début.");
  }

  const applicableRule = selectPricingRule(startDate, nights, pricingRules);

  if (!applicableRule) {
    throw new Error("Aucun tarif applicable trouvé pour ces dates.");
  }

  const subtotal = nights * applicableRule.price_per_night;
  const discountPercent = applicableRule.discount_percent ?? 0;
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

// Sélectionne la règle de tarification applicable :
// - filtre sur la saison si season_start/season_end sont définis
// - la réduction dégressive s'applique au nombre de nuits total du séjour
// - on prend la règle avec le min_nights le plus élevé encore atteint
function selectPricingRule(
  startDate: Date,
  nights: number,
  pricingRules: PricingRule[]
): PricingRule | undefined {
  const seasonalRules = pricingRules.filter((rule) =>
    isWithinSeason(startDate, rule)
  );

  const candidates = seasonalRules.length > 0 ? seasonalRules : pricingRules;

  return [...candidates]
    .sort((a, b) => (b.min_nights ?? 0) - (a.min_nights ?? 0))
    .find((rule) => nights >= (rule.min_nights ?? 0));
}

function isWithinSeason(date: Date, rule: PricingRule): boolean {
  if (!rule.season_start || !rule.season_end) return true;

  const seasonStart = new Date(rule.season_start);
  const seasonEnd = new Date(rule.season_end);

  return date >= seasonStart && date <= seasonEnd;
}
