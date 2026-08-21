# Les Terrasses de Risoul

Site de réservation pour un appartement au ski à Risoul. Voir [CLAUDE.md](./CLAUDE.md) pour le contexte complet (stack, modèle de données, conventions).

## Démarrer

```bash
npm install
cp .env.local.example .env.local   # renseigner les clés Supabase
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Sans `.env.local` renseigné, le site public fonctionne quand même ; seule la console `/admin` reste inaccessible (redirection vers `/admin/login`).

## Commandes

- `npm run dev` — lancer en local
- `npm run build` — vérifier que le build passe avant de push
- `npm run lint` — linter avant chaque commit
