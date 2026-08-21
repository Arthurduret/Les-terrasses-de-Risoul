-- Schéma initial — Les Terrasses de Risoul
-- Tables décrites dans CLAUDE.md : availability, pricing_rules, settings, booking_requests.
-- RLS activé sur toutes les tables : lecture publique pour le site (disponibilités,
-- tarifs, paramètres), écriture réservée à l'admin authentifié (magic link).
-- Exception : booking_requests accepte les insertions publiques (formulaire de
-- demande) mais seule l'admin peut lire/mettre à jour les demandes (données perso).

create extension if not exists pgcrypto;

-- =========================================================
-- availability
-- =========================================================
create table availability (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  status text not null check (status in ('blocked', 'booked')),
  note text
);

alter table availability enable row level security;

create policy "availability_public_read"
  on availability for select
  to anon, authenticated
  using (true);

create policy "availability_admin_write"
  on availability for all
  to authenticated
  using (true)
  with check (true);

-- =========================================================
-- pricing_rules
-- =========================================================
create table pricing_rules (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  price_per_night numeric not null check (price_per_night >= 0),
  min_nights int check (min_nights >= 0),
  discount_percent numeric check (discount_percent >= 0 and discount_percent <= 100),
  season_start date,
  season_end date,
  check (season_start is null or season_end is null or season_start <= season_end)
);

alter table pricing_rules enable row level security;

create policy "pricing_rules_public_read"
  on pricing_rules for select
  to anon, authenticated
  using (true);

create policy "pricing_rules_admin_write"
  on pricing_rules for all
  to authenticated
  using (true)
  with check (true);

-- =========================================================
-- settings
-- =========================================================
create table settings (
  key text primary key,
  value text not null
);

alter table settings enable row level security;

create policy "settings_public_read"
  on settings for select
  to anon, authenticated
  using (true);

create policy "settings_admin_write"
  on settings for all
  to authenticated
  using (true)
  with check (true);

-- =========================================================
-- booking_requests
-- =========================================================
create table booking_requests (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  name text not null,
  email text not null,
  phone text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

alter table booking_requests enable row level security;

-- Le formulaire public peut créer une demande, mais ne peut pas lire les
-- demandes existantes (données personnelles d'autres visiteurs).
create policy "booking_requests_public_insert"
  on booking_requests for insert
  to anon, authenticated
  with check (true);

create policy "booking_requests_admin_read"
  on booking_requests for select
  to authenticated
  using (true);

create policy "booking_requests_admin_update"
  on booking_requests for update
  to authenticated
  using (true)
  with check (true);

create policy "booking_requests_admin_delete"
  on booking_requests for delete
  to authenticated
  using (true);
