# Personnalisation de l'apparence

> Créé le 16/07/2026 — Session [INIT-DOC]
> Mis à jour le 21/07/2026 — Session [COLORS] — Palette complète 9 couleurs

## État actuel

✅ Palette complète 9 couleurs (3 × 3 teintes) définie en variables CSS dans `cncdp.css`.
✅ Page Apparence admin affiche les 9 couleurs avec sélecteurs.
⚠️ Les sélecteurs de couleur sont purement visuels (pas de sauvegarde dynamique).

## Palette complète

### 🟣 Violets — Identité principale, navigation, footer

| Variable CSS | Hex | Usage |
|---|---|---|
| `--violet-vif` | `#9d38da` | Boutons principaux, liens, Hero sections |
| `--violet-profond` | `#9335e4` | Hover, footer, dégradés |
| `--violet-clair` | `#daafff` | Fonds de survol, accents légers |

### 🌸 Roses — Sections secondaires, accents, témoignages

| Variable CSS | Hex | Usage |
|---|---|---|
| `--rose-vif` | `#fd82bb` | Badges, accents forts, boutons secondaires |
| `--rose-clair` | `#ffdaeb` | Fonds de section alternés |
| `--rose-tres-clair` | `#ffe3e7` | Fonds subtils, cartes |

### 🍊 Oranges — Mise en avant, alertes, appels à l'action

| Variable CSS | Hex | Usage |
|---|---|---|
| `--orange-vif` | `#de6d11` | Boutons CTA, liens importants |
| `--orange-moyen` | `#fcbc63` | Éléments interactifs, bordures |
| `--orange-clair` | `#feeed4` | Fonds de mise en avant, alertes |

## Typographie

- Police : Inter (par défaut), choix parmi Inter, Roboto, Open Sans, Lato

## Logo

- Logo actuel : `public/images/logo_cncdp_transp.png`
- Upload fonctionnel via la page Apparence (PNG, JPEG, SVG)

## Fichiers CSS

- `assets/styles/cncdp.css` — Variables CSS globales + styles front-office
- `assets/styles/admin.css` — Styles back-office

## Route

| Nom | Chemin | Contrôleur |
|---|---|---|
| `admin_appearance` | `/admin/apparence` | `AdminController::appearance` |

## Règles d'utilisation des couleurs

- **Violet** : réservé à l'identité CNCDP (header, footer, Hero principal, navigation)
- **Rose** : sections alternées, cartes, témoignages — pour casser la monotonie du violet
- **Orange** : boutons d'appel à l'action, alertes, mises en avant — pour attirer l'attention
- Ne pas utiliser une seule teinte sur toute une page
- Alterner les fonds de section : blanc → violet clair/rose clair/orange clair → blanc
- Les boutons importants (saisine, adhésion) utilisent l'orange vif

## Évolution prévue

1. Sauvegarde dynamique des couleurs (fichier JSON ou BDD)
2. Génération des variables CSS à partir des valeurs stockées
3. Prévisualisation en temps réel des changements
