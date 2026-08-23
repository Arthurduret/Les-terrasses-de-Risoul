-- Corrige une fuite : la policy de lecture publique sur `availability`
-- exposait aussi `note` (texte privé, ex. "Réservé par Tonton Michel") à
-- quiconque interroge l'API avec la clé anon, même si le site public ne
-- l'affiche jamais lui-même. On restreint la lecture directe de la table
-- à l'admin connecté, et on expose une vue `availability_public`
-- (date + status uniquement) pour le calendrier public.
drop policy "availability_public_read" on availability;

create policy "availability_authenticated_read"
  on availability for select
  to authenticated
  using (true);

-- Vue exécutée avec les droits de son propriétaire (comportement par
-- défaut de Postgres, pas de security_invoker) : elle continue de
-- fonctionner malgré la RLS restreinte ci-dessus sur la table de base,
-- tout en ne renvoyant jamais `note`.
create view availability_public as
  select date, status from availability;

grant select on availability_public to anon, authenticated;

-- Attribution : qui a bloqué une date / traité une demande, pour que
-- l'admin qui consulte le calendrier ou l'historique sache qui a agi.
-- Rempli côté serveur depuis la session authentifiée, jamais depuis une
-- valeur envoyée par le client.
alter table availability add column updated_by text;
alter table booking_requests add column processed_by text;
