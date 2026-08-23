-- Remplace la période début/fin unique par tarif (season_start/season_end)
-- par une association explicite semaine -> tarif : permet d'assigner des
-- semaines non contiguës (ex. Noël et février) au même tarif, et rend le
-- calendrier de tarifs trivial à afficher (une semaine = une couleur).

alter table pricing_rules add column color text;
alter table pricing_rules drop column season_start;
alter table pricing_rules drop column season_end;

create table pricing_rule_weeks (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references pricing_rules(id) on delete cascade,
  week_start date not null unique,
  check (extract(dow from week_start) = 6)
);

alter table pricing_rule_weeks enable row level security;

create policy "pricing_rule_weeks_public_read"
  on pricing_rule_weeks for select
  to anon, authenticated
  using (true);

create policy "pricing_rule_weeks_admin_write"
  on pricing_rule_weeks for all
  to authenticated
  using (true)
  with check (true);
