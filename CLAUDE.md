# LabicoProPress - Regles Claude

## Regles de versioning

**IMPORTANT : Avant chaque commit + push, incrementer la version dans `src/version.js`**

Format de version : `MAJEUR.MINEUR.PATCH`
- MAJEUR : Changements majeurs incompatibles
- MINEUR : Nouvelles fonctionnalites
- PATCH : Corrections de bugs

Exemple :
- Bug fix : 1.0.0 -> 1.0.1
- Nouvelle feature : 1.0.1 -> 1.1.0
- Refonte majeure : 1.1.0 -> 2.0.0

## Commandes

```bash
# Developpement
npm run dev

# Build production
npm run build

# Deploy Vercel
npx vercel --prod
```

## Structure projet

- `src/version.js` - Version de l'app (affichee sur page login)
- `src/lib/brotherPrinter.js` - Service impression Brother PT-P710BT
- `src/components/LabelModal.jsx` - Modal impression etiquette
- `docs/` - Documentation technique

## Variables d'environnement (Vercel)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
