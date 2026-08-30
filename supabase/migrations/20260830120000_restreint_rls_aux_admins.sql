-- Restreint l'accès en écriture (et la lecture des données personnelles)
-- aux seuls comptes explicitement désignés comme administrateurs.
--
-- LE PROBLÈME CORRIGÉ
-- Les policies initiales accordaient tout au rôle `authenticated` sans
-- distinction (`to authenticated using (true)`). Or la clé `anon` est
-- publique par construction — elle est servie dans le bundle JavaScript de
-- chaque visiteur. Toute personne pouvant créer un compte obtenait donc un
-- jeton `authenticated`, et avec lui : la lecture de TOUTES les demandes de
-- réservation (noms, emails, téléphones, adresses postales) et l'écriture
-- sur les disponibilités, les tarifs et les paramètres.
--
-- Fermer l'inscription publique dans le tableau de bord Supabase règle le
-- symptôme immédiat. Cette migration règle la cause : même un compte créé
-- par erreur, ou une inscription rouverte un jour par inadvertance, n'a
-- plus aucun privilège tant qu'il n'est pas inscrit dans `admins`.

-- =========================================================
-- Table des administrateurs
-- =========================================================
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

-- Aucune policy en écriture : la table ne se modifie que depuis le tableau
-- de bord Supabase ou l'éditeur SQL, jamais via l'API publique. Un
-- administrateur peut en revanche vérifier sa propre appartenance.
drop policy if exists "admins_read_self" on admins;
create policy "admins_read_self"
  on admins for select
  to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- Fonction d'appartenance
-- =========================================================
-- SECURITY DEFINER est nécessaire : les policies ci-dessous interrogent
-- `admins`, que l'appelant ne peut pas lire entièrement. La fonction ne
-- révèle rien d'autre que le statut de l'appelant lui-même — elle ne prend
-- aucun paramètre et se limite à auth.uid().
create or replace function public.is_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- =========================================================
-- availability — lecture publique conservée, écriture restreinte
-- =========================================================
drop policy if exists "availability_admin_write" on availability;
create policy "availability_admin_write"
  on availability for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- pricing_rules
-- =========================================================
drop policy if exists "pricing_rules_admin_write" on pricing_rules;
create policy "pricing_rules_admin_write"
  on pricing_rules for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- settings
-- =========================================================
drop policy if exists "settings_admin_write" on settings;
create policy "settings_admin_write"
  on settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- booking_requests — le plus sensible : données personnelles
-- =========================================================
-- L'insertion publique reste ouverte (c'est le formulaire du site), mais
-- la lecture, la modification et la suppression passent aux seuls admins.
drop policy if exists "booking_requests_admin_read" on booking_requests;
create policy "booking_requests_admin_read"
  on booking_requests for select
  to authenticated
  using (public.is_admin());

drop policy if exists "booking_requests_admin_update" on booking_requests;
create policy "booking_requests_admin_update"
  on booking_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "booking_requests_admin_delete" on booking_requests;
create policy "booking_requests_admin_delete"
  on booking_requests for delete
  to authenticated
  using (public.is_admin());

-- =========================================================
-- ⚠️ ÉTAPE MANUELLE INDISPENSABLE
-- =========================================================
-- Sans cette étape, PLUS PERSONNE ne peut administrer le site : la table
-- `admins` est vide, donc is_admin() renvoie false pour tout le monde.
--
-- 1. Relever l'identifiant des comptes légitimes :
--
--      select id, email, created_at from auth.users order by created_at;
--
-- 2. Vérifier qu'aucun compte inconnu ne figure dans cette liste. Le cas
--    échéant, le supprimer avant de continuer.
--
-- 3. Insérer les comptes à autoriser, un par ligne :
--
--      insert into admins (user_id) values ('COLLER-ICI-L-IDENTIFIANT');
--
-- 4. Se reconnecter à la console d'administration et vérifier qu'une
--    modification de disponibilité est bien enregistrée.
