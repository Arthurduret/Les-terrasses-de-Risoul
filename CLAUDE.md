# Les Terrasses de Risoul

Site de réservation pour un appartement au ski à Risoul. Deux faces :
1. **Site public** — calendrier de disponibilité, tarifs, demande de réservation.
2. **Console admin** — mes parents doivent pouvoir gérer les disponibilités et les tarifs sans coder, via un accès sécurisé.

## Stack
- Next.js 15 (App Router), TypeScript
- Tailwind CSS
- Supabase : DB (Postgres) + Auth (magic link pour l'admin) + éventuellement Storage pour les photos de l'appart
- Déployé sur Vercel
- Domaine : lesterrassesderisoul.fr (ou équivalent déjà acheté)

## Commandes utiles
- `npm run dev` — lancer en local
- `npm run build` — vérifier que le build passe avant de push
- `npm run lint` — linter avant chaque commit
- `npx supabase db push` — appliquer les migrations sur Supabase (à adapter si CLI pas encore configurée)

## Modèle de données (Supabase)

### `availability`
Représente les jours bloqués/réservés. Un jour non présent dans la table = disponible par défaut.
- `id`
- `date` (date, unique)
- `status` (`blocked` | `booked`)
- `note` (text, optionnel — ex: "réservé par la famille Dupont")

### `pricing_rules`
- `id`
- `label` (ex: "Semaine hiver", "Prix nuit standard")
- `price_per_night` (numeric)
- `min_nights` (int, optionnel — seuil pour appliquer un tarif dégressif)
- `discount_percent` (numeric, optionnel — ex: 10 pour -10% à partir de min_nights)
- `season_start` / `season_end` (date, optionnel — si tarifs saisonniers)

### `settings`
Table clé/valeur simple pour les paramètres modifiables par les parents sans toucher au code.
- `key` (text, unique — ex: "min_nights_booking", "contact_email", "airbnb_link")
- `value` (text)

### `booking_requests`
Demandes de réservation envoyées via le site public (pas de paiement en ligne prévu au départ — juste une demande que les parents valident).
- `id`
- `start_date`, `end_date`
- `name`, `email`, `phone`
- `message` (text, optionnel)
- `status` (`pending` | `confirmed` | `declined`)
- `created_at`

## Authentification admin
- Un seul rôle : "admin" (mes parents). Auth Supabase par **magic link** envoyé à leur email — pas de mot de passe à retenir/perdre.
- Route `/admin` protégée : redirection vers `/admin/login` si pas de session valide.
- Ne jamais exposer la clé `service_role` côté client — uniquement dans les Server Actions / Route Handlers.

## Structure du projet
- `app/(public)/` — pages publiques (accueil, calendrier, contact)
- `app/admin/` — console admin (dashboard, gestion dispo, gestion tarifs, paramètres)
- `components/calendar/` — composant calendrier réutilisable (vue publique lecture seule + vue admin éditable)
- `components/ui/` — composants génériques
- `lib/supabase/client.ts` et `lib/supabase/server.ts` — séparer clients Supabase browser/serveur
- `lib/pricing.ts` — logique de calcul de prix (nuits × tarif, application des réductions selon `pricing_rules`)

## Logique métier importante
- Le calcul du prix total d'un séjour doit être **centralisé dans `lib/pricing.ts`**, jamais dupliqué entre le site public et l'admin (source unique de vérité).
- La réduction dégressive s'applique au nombre de nuits total de la demande, pas par semaine — vérifier les règles dans `pricing_rules` triées par `min_nights` décroissant.
- Un jour marqué `booked` ou `blocked` dans `availability` ne doit jamais pouvoir être sélectionné dans le formulaire de demande côté public.
- Les dates sont manipulées en UTC/ISO côté DB, converties en local uniquement à l'affichage (`Europe/Paris`).

## Design
- Style chalet authentique : noir/anthracite comme base, bois (tons chauds marron) en accent, touche de rouge profond pour les CTA

## Conventions de code
- Composants petits, un rôle clair chacun
- Pas de logique de prix ou de disponibilité dans le JSX — toujours passer par `lib/`
- Variables d'env : `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` côté client, `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur

## Règles spécifiques au projet
- Ne jamais commit directement sur `main`, toujours une branche + review avant merge
- Toute modification du modèle de données (tables Supabase) doit être proposée en plan avant exécution
- La console admin doit rester utilisable par quelqu'un de non technique : pas de jargon, actions confirmées avant suppression/modification de dates
- Pas de paiement en ligne dans une v1 — le site collecte des demandes, la confirmation/paiement reste géré par mes parents en direct (à réévaluer plus tard si besoin)