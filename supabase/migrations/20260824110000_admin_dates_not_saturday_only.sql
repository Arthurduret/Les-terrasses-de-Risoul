-- La contrainte samedi-samedi reste appliquée côté formulaire public
-- (site + submitBookingRequest), mais l'admin doit pouvoir confirmer une
-- demande avec des dates différentes (séjour exceptionnel, arrangement
-- particulier) sans que la base ne rejette la mise à jour.
alter table booking_requests drop constraint booking_requests_saturday_to_saturday;

alter table booking_requests add constraint booking_requests_end_after_start
  check (end_date > start_date);
