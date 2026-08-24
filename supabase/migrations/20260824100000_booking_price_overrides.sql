-- Permet à l'admin de remplacer individuellement le prix du séjour, le
-- ménage et la taxe de séjour d'une demande au moment de la confirmer
-- (ex. tarif négocié) — nul = valeur calculée normalement conservée.
alter table booking_requests
  add column stay_price_override numeric,
  add column cleaning_fee_override numeric,
  add column tourist_tax_override numeric;
