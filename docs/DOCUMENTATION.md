# LabicoProPress - Documentation Technique

## Presentation

Application PWA de gestion pour pressing avec:
- Gestion des commandes et clients
- Notifications SMS (smsmode API)
- Impression d'etiquettes
- Systeme d'avoirs clients

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.x | Framework frontend |
| Vite | 6.x | Build tool |
| Tailwind CSS | 3.x | Styles (theme Indigo) |
| Supabase | - | Backend PostgreSQL + Auth |
| VitePWA | - | Progressive Web App |

## Base de Donnees (Supabase)

### Tables principales

- **pressings** - Comptes pressing (auth avec bcrypt)
- **clients** - Clients du pressing (telephone, nom, solde_avoir)
- **commandes** - Commandes (numero, statut, montant_total)
- **lignes_commande** - Detail articles par commande
- **avoirs** - Credits/debits clients
- **categories** - Categories d'articles
- **articles** - Articles avec prix
- **sms_logs** - Historique SMS envoyes

### Format numero commande

```
AAAA-NNNN-XX
```
- AAAA = Annee (ex: 2026)
- NNNN = Numero sequentiel sur 4 chiffres
- XX = Suffixe aleatoire 2 caracteres (sans 0,O,1,I)

Exemple: `2026-0001-K7`

Le client peut s'identifier avec les 3 derniers caracteres (ex: "1-K7")

## Impression Etiquettes

### Imprimante

| Specification | Valeur |
|---------------|--------|
| Modele | Brother PT-P710BT (P-Touch Cube Plus) |
| Connexion | Bluetooth + USB |
| Largeur max | 24mm |
| Prix | ~80 EUR |
| App officielle | P-Touch Design&Print (iOS/Android) |

### Integration prevue

Options d'implementation:
1. **Web Bluetooth API** - Impression directe (protocole Brother proprietaire)
2. **Generation image** - Etiquette formatee pour app Brother
3. **Copier/Coller** - Texte formate pour l'app

### Contenu etiquette type

```
+------------------+
|   PRESSING XXX   |
+------------------+
|                  |
|      1-K7        |  <- 3 derniers caracteres (gros)
|                  |
|  2026-0001-K7    |  <- Numero complet
|  Client: Dupont  |
|  21/03/2026      |
+------------------+
```

## SMS (smsmode API)

### Configuration

Les credentials sont stockes dans la table `pressings`:
- `sms_api_key` - Cle API smsmode
- `sms_sender` - Nom expediteur (max 11 car)

### Messages automatiques

- **Commande prete** : SMS envoye au client quand statut passe a "pret"

## Theme Couleurs (Indigo)

```javascript
primary: {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',  // Couleur principale
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
}
```

## Structure Projet

```
src/
  components/     # Composants reutilisables
    AvoirModal.jsx
    ConfirmModal.jsx
  contexts/       # Contextes React
    AuthContext.jsx
    NotificationContext.jsx
  data/           # Donnees statiques
    tarifs.js     # Categories et articles
  lib/            # Utilitaires
    supabase.js   # Client Supabase
    sms.js        # Fonctions SMS
  pages/          # Pages de l'app
    Login.jsx
    Dashboard.jsx
    Clients.jsx
    Commandes.jsx
    CommandeForm.jsx
    Parametres.jsx
  App.jsx         # Routeur principal
  main.jsx        # Point d'entree
```

## Commandes

```bash
# Developpement
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

## Variables d'environnement

Fichier `.env`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

## Fonctionnalites

### Clients
- Recherche par nom ou telephone (autocomplete)
- Solde avoir affiche
- Creation auto a la validation commande

### Commandes
- Selection articles par categorie
- Calcul automatique du total
- Utilisation avoir (deduction du solde)
- Statuts: en_cours -> pret -> recupere

### Avoirs
- Accorder un avoir (credit)
- Utiliser un avoir (debit automatique)
- Annuler un avoir
- Motifs: retard, dommage, geste_commercial, autre

## TODO

- [ ] Impression etiquettes Brother PT-P710BT
- [ ] Web Bluetooth ou generation image
- [ ] Export statistiques
- [ ] Multi-pressing (SaaS)
