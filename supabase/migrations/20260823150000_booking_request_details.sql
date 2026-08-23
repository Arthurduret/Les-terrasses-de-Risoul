-- booking_requests est encore vide en prod (aucun formulaire public n'a
-- jamais été branché) : on peut modifier les colonnes directement, sans
-- migration de données.

alter table booking_requests drop column name;

alter table booking_requests add column first_name text not null;
alter table booking_requests add column last_name text not null;
alter table booking_requests add column address text not null;
alter table booking_requests add column postal_code text not null;
alter table booking_requests add column city text not null;

alter table booking_requests add column adults int not null default 1 check (adults >= 1);
alter table booking_requests add column children int not null default 0 check (children >= 0);
alter table booking_requests add column cleaning_requested boolean not null default true;

-- Séjours à la semaine, du samedi au samedi uniquement (contrainte déjà
-- appliquée côté calendrier public — vérification en base en filet de
-- sécurité, au cas où une requête contournerait le site).
alter table booking_requests add constraint booking_requests_saturday_to_saturday
  check (extract(dow from start_date) = 6 and extract(dow from end_date) = 6);
