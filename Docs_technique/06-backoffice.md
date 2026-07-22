# Back-office administrateur

> Créé le 16/07/2026 — Session [INIT-DOC]

## Accès

| Champ | Valeur |
|---|---|
| URL | `/admin` (redirige vers `/admin/login` si non connecté) |
| Identifiant | `admin@cncdp.fr` |
| Mot de passe | `admin` |
| Rôle | `ROLE_ADMIN` |

## Architecture

```
Authentification (form_login)
        │
        ▼
┌───────────────────────────────────────┐
│           AdminController             │
│  Toutes les routes protégées par     │
│  #[IsGranted('ROLE_ADMIN')]          │
│  Préfixe : /admin                    │
├───────────────────────────────────────┤
│  /admin            → dashboard       │
│  /admin/pages      → pages           │
│  /admin/accueil    → homepage edit   │
│  /admin/organisations → organizations │
│  /admin/apparence  → appearance      │
└───────────────────────────────────────┘
```

## Routes

| Nom | Chemin | Méthode | Description |
|---|---|---|---|
| `admin_login` | `/admin/login` | GET/POST | Connexion |
| `admin_logout` | `/admin/logout` | GET | Déconnexion (intercepté par firewall) |
| `admin_dashboard` | `/admin` | GET | Tableau de bord |
| `admin_pages` | `/admin/pages` | GET | Liste des pages du site |
| `admin_homepage` | `/admin/accueil` | GET/POST | Édition page d'accueil |
| `admin_organizations` | `/admin/organisations` | GET | Gestion des organisations |
| `admin_appearance` | `/admin/apparence` | GET/POST | Personnalisation apparence |

## Structure des templates

```
templates/admin/
├── base_admin.html.twig    ← Layout admin (sidebar + topbar) — réservé aux pages authentifiées
├── login.html.twig          ← Page de connexion AUTONOME (n'étend PAS base_admin)
├── dashboard.html.twig      ← Tableau de bord
├── pages.html.twig          ← Liste des pages
├── homepage_edit.html.twig  ← Formulaire édition page d'accueil
├── organizations.html.twig  ← Gestion des organisations
└── appearance.html.twig     ← Personnalisation apparence
```

> 🔒 **Important :** `login.html.twig` est une page HTML complète et indépendante. Elle n'étend PAS `base_admin.html.twig` afin de ne jamais exposer la sidebar ou la navigation admin à un utilisateur non authentifié.

## Layout admin (`base_admin.html.twig`)

Le layout est composé de 3 zones :

### 1. Sidebar (navigation latérale)

- **Fixe** à gauche, masquée sur mobile (toggle via bouton ☰)
- Largeur : `16rem` (variable CSS `--admin-sidebar-width`)
- Fond sombre (`#2d2540`)
- Sections organisées :

| Section | Liens |
|---|---|
| **Principal** | Tableau de bord, Voir le site |
| **Contenu du site** | Pages, Page d'accueil, Organisations |
| **Paramètres** | Apparence |
| **Footer sidebar** | Déconnexion |

- Lien actif : surligné en violet (`--violet-vif`)
- Responsive : `transform: translateX(-100%)` sur mobile, classe `.open` pour afficher

### 2. Topbar

- Barre horizontale en haut de la zone de contenu
- Bouton de toggle sidebar (☰) à gauche
- Identité de l'utilisateur connecté à droite (`app.user.userIdentifier`)
- Fil d'Ariane (breadcrumb)

### 3. Zone de contenu (`{% block admin_body %}`)

- Chaque page admin étend `base_admin.html.twig` et remplit ce bloc

## Pages du back-office

### Dashboard (`/admin`)

**Cartes statistiques** (4 cards) :
- Pages du site (violet)
- Organisations adhérentes (rose)
- Avis publiés (orange)
- Visites cette semaine (violet)

**Actions rapides** :
- Modifier la page d'accueil → `/admin/accueil`
- Gérer les organisations → `/admin/organisations`
- Personnaliser l'apparence → `/admin/apparence`
- Voir le site public → `/` (nouvel onglet)

**Guide rapide** : résumé des sections avec icônes

### Pages (`/admin/pages`)

- Tableau listant les pages du site (titre, URL, dernière modification, statut, actions)
- 4 pages en dur : Accueil, Le CNCDP, Code de déontologie, Contact
- Statuts : `Publié` (vert) ou `Brouillon` (orange)
- Bouton "Nouvelle page" (non fonctionnel)

### Page d'accueil (`/admin/accueil`)

Formulaire d'édition en 3 blocs :

1. **Bannière Hero** : titre, sous-titre, texte du bouton, lien du bouton
2. **Section Présentation** : titre de section, texte
3. **Section Accès rapides** : 3 cartes avec titre, description, lien

⚠️ Formulaire non fonctionnel : pas de handler POST côté contrôleur.

### Organisations (`/admin/organisations`)

- Tableau : Logo, Sigle, Nom complet, Statut, Actions
- 3 entrées statiques : FFPP, SNP, UNCP
- Boutons Ajouter/Modifier/Supprimer (non fonctionnels)
- Badge "Actif" en vert

### Apparence (`/admin/apparence`)

- **Couleurs principales** : 5 variables (violets + roses) avec sélecteurs `color`
- **Typographie** : select parmi Inter, Roboto, Open Sans, Lato
- **Logo** : aperçu du logo actuel + zone d'upload

⚠️ Non relié aux variables CSS réelles — purement visuel.

## Comportement responsive

| Breakpoint | Comportement |
|---|---|
| < 992px (mobile) | Sidebar masquée, toggle via bouton ☰, overlay semi-transparent |
| ≥ 992px (desktop) | Sidebar visible en permanence, position sticky |

## Styles CSS

Le fichier `assets/styles/admin.css` définit :
- Variables CSS admin (couleurs, dimensions)
- Layout flexbox (`admin-wrapper`)
- Sidebar (fixe, animée, responsive)
- Topbar, cards, tableaux, badges, boutons, formulaires
- États : `.admin-badge-success` (vert), `.admin-badge-warning` (orange)
- Classes utilitaires : `.admin-mb-*`, `.admin-text-muted`, `.admin-d-flex`

## Flux de connexion

```
GET /admin → firewall détecte non authentifié
   → redirect /admin/login
   → affiche formulaire (login.html.twig)

POST /admin/login → form_login vérifie credentials
   ✅ Succès → redirect /admin (admin_dashboard)
   ❌ Échec  → retour formulaire avec message d'erreur
```

Si déjà connecté, `SecurityController::login()` redirige directement vers le dashboard.

## Sécurité

- Firewall dédié `admin` avec `form_login`
- CSRF sur le formulaire de connexion
- Contrôle d'accès : `^/admin` → `ROLE_ADMIN`, `^/admin/login` → `PUBLIC_ACCESS`
- Toutes les routes de `AdminController` ont `#[IsGranted('ROLE_ADMIN')]`
- Logout : intercepté par Symfony, pas de logique dans le contrôleur
- Meta `robots: noindex, nofollow` sur le layout admin
