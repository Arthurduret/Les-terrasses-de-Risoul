# Héberger ce site sur un NAS (au lieu de Vercel)

Ce document s'adresse à toute personne (ou instance de Claude) qui reprend ce
projet pour le faire tourner sur un NAS personnel plutôt que sur Vercel, où
il est actuellement déployé. Il contient tout le contexte nécessaire pour
partir de zéro.

## Le projet en deux mots

Site de réservation pour un appartement de vacances à Risoul (Hautes-Alpes) :
calendrier de disponibilité, tarifs à la semaine, formulaire de demande de
réservation, et une console d'administration pour gérer tout ça. Construit
avec Next.js 15 (App Router) + TypeScript + Tailwind CSS.

Le site ne dépend d'aucune fonctionnalité propre à Vercel (pas d'Edge
Functions, pas d'optimisation d'image Vercel). Deux services externes sont
utilisés, tous deux resteront exactement les mêmes après le changement
d'hébergeur — rien à migrer de ce côté :

- **Supabase** — base de données (Postgres) + authentification admin.
  Le projet Supabase continue de tourner chez Supabase, le NAS ne fait que
  s'y connecter comme le fait Vercel aujourd'hui.
- **Resend** — envoi des emails transactionnels (confirmation de
  réservation, mots de passe admin). Les enregistrements DNS déjà en place
  pour `lesterrassesderisoul.fr` (SPF/DKIM sur le sous-domaine `send.`) ne
  doivent pas être touchés — ils ne concernent que l'email, pas l'hébergement
  du site.

## Ce qu'il faut sur le NAS

- Docker (la plupart des NAS récents l'ont via "Container Manager" sur
  Synology, "Container Station" sur QNAP, etc.)
- Un moyen d'exposer un port du NAS sur internet avec un vrai certificat
  HTTPS (reverse proxy — souvent déjà en place si un autre site tourne déjà
  sur ce NAS).

## Variables d'environnement

Toutes les valeurs nécessaires sont documentées (sans les vraies valeurs)
dans `.env.local.example` à la racine du projet. Il faut créer un fichier
`.env.local` à côté, rempli avec les vraies valeurs — **ces valeurs
n'existent pas dans ce dossier et doivent être transmises séparément par la
personne qui gère le projet actuellement**, pas par un canal de partage de
fichiers classique (ce sont des clés d'accès à la base de données et à
l'envoi d'email).

### ⚠️ Un second fichier `.env` est indispensable avec Docker Compose

En plus de `.env.local`, il faut créer un fichier **`.env`** à la racine,
contenant les deux variables publiques :

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

La raison est subtile. Dans `docker-compose.yml`, les deux arguments de
build s'écrivent `${NEXT_PUBLIC_SUPABASE_URL}` : ce sont des substitutions
de variables, et Docker Compose ne les cherche **que** dans l'environnement
du shell ou dans un fichier nommé `.env`. La clé `env_file: .env.local` ne
sert qu'à peupler l'environnement du conteneur au *lancement*, jamais à la
substitution au moment du *build*.

Sans ce fichier, la construction réussit sans le moindre avertissement,
mais les deux arguments valent chaîne vide. Le site public continue de
fonctionner — il est rendu côté serveur et lit les variables à l'exécution
— tandis que **la console admin est silencieusement cassée** :
`app/admin/login`, `app/admin/reset-password` et `SignOutButton` utilisent
le client Supabase *navigateur*, dont les valeurs sont figées dans le
bundle au moment de la compilation.

Pour vérifier après un déploiement, l'URL Supabase doit apparaître dans le
bundle JavaScript de la page de connexion :

```bash
curl -s http://localhost:3000/admin/login | grep -o 'chunks/app/admin/login/[^"]*js'
```

Récupérez le chemin affiché, puis :

```bash
curl -s http://localhost:3000/_next/static/CHEMIN_AFFICHE | grep -c 'supabase.co'
```

Un résultat supérieur à zéro signifie que les arguments de build ont bien
été pris en compte. Zéro signifie que le fichier `.env` manquait.

Les deux fichiers sont couverts par `.gitignore` (`.env*`).

## Build et lancement

Avec Docker Compose (le plus simple) :

```bash
docker compose up -d --build
```

Le site écoute alors sur le port 3000 du NAS. Il ne reste qu'à faire pointer
le reverse proxy du NAS vers ce port, avec le nom de domaine
`lesterrassesderisoul.fr`.

Sans Docker Compose (build/run manuels) :

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -t terrasses-risoul .

docker run -d --restart unless-stopped -p 3000:3000 --env-file .env.local terrasses-risoul
```

## Basculer le domaine

Le site tourne actuellement sur Vercel, avec `lesterrassesderisoul.fr`
pointé dessus. Le NAS peut tourner en parallèle pour tester (accessible via
son IP ou un sous-domaine de test) avant de couper. Une fois prêt, il suffit
de changer l'enregistrement DNS du domaine (chez OVH, où le domaine est
enregistré) pour qu'il pointe vers le NAS au lieu de Vercel — le reste du
site (Supabase, Resend) continue de fonctionner sans aucun changement
puisque ces services ne dépendent pas de l'hébergeur du site.
