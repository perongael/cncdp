# Système de consultation et gestion des avis

> Créé le 22/07/2026 — Session [AVIS] [FILTRES] [PDF] [CRUD] [ADMIN] [UX]

## Objectif

Plateforme moderne de consultation des avis déontologiques du CNCDP, avec recherche, filtres dynamiques, fiches détaillées, téléchargement PDF, et back-office complet pour les administrateurs.

---

## Fonctionnement métier

### Partie publique

- **Page liste** (`/avis`) : recherche plein texte + filtres combinables par année et critères dynamiques (thématique, type de demandeur, contexte, articles du Code, mots-clés)
- **Filtres AJAX** : mise à jour instantanée sans rechargement de page, URL synchronisée
- **Logique de filtres** : ET entre critères de types différents, OU au sein d'un même critère
- **Fiche détaillée** (`/avis/{slug}`) : résumé, contenu complet, références, catégories, téléchargement PDF, avis similaires

### Back-office administrateur

- **Gestion des avis** (`/admin/avis`) : CRUD complet (création, modification, suppression, publication/dépublication), upload PDF, taguage par critères
- **Gestion des critères** (`/admin/criteres`) : création/modification/suppression de catégories de filtres et de leurs valeurs, entièrement dynamique (sans toucher au code)

---

## Fonctionnement technique

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Base de données                         │
│  ┌──────┐    ┌──────────────┐    ┌──────────┐              │
│  │ avis │───▶│ avis_critere │◀───│ critere  │              │
│  └──────┘    │ (ManyToMany) │    │ _valeur  │              │
│              └──────────────┘    └────┬─────┘              │
│                                       │                     │
│                                  ┌────▼─────┐              │
│                                  │ critere  │              │
│                                  └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Entités

| Entité | Rôle | Champs clés |
|---|---|---|
| `Avis` | L'avis déontologique | `numero` (unique), `titre`, `slug`, `resume`, `contenu` (HTML), `dateAvis`, `annee` (dénormalisé), `pdfFilename`, `status` (draft/published) |
| `Critere` | Catégorie de filtre dynamique | `nom`, `slug`, `actif`, `ordre` |
| `CritereValeur` | Valeur d'un critère | `valeur`, `slug`, `critere_id` (FK), `actif`, `ordre` |

### Filtres AJAX

1. Les `<select>` de filtres ont `data-filter="change"` et envoient leurs valeurs groupées par slug de critère : `criteres[thematique][]=1&criteres[type-demandeur][]=3`
2. Le contrôleur détecte la requête XHR (`X-Requested-With: XMLHttpRequest` ou `?_partial=1`) et renvoie uniquement le partial `avis/_list.html.twig`
3. Le JavaScript remplace le conteneur `#avis-results` et met à jour `window.history` sans rechargement
4. La recherche texte utilise un debounce de 300 ms

### Logique de filtres combinés

- **Même critère** : `JOIN cv ON ... WHERE cv.id IN (1, 2)` → OU (l'avis a la valeur 1 OU 2)
- **Critères différents** : `JOIN cv0 ... AND cv0.id IN (1) JOIN cv1 ... AND cv1.id IN (3)` → ET (l'avis a la valeur 1 ET la valeur 3)

### Filtres dynamiques administrables

Les critères sont stockés en base (pas en dur dans le code). L'admin peut :
- Créer un nouveau critère (ex: « Région ») → apparaît automatiquement dans les filtres publics et dans le formulaire d'édition d'avis
- Ajouter/modifier/supprimer des valeurs pour chaque critère
- Activer/désactiver des critères ou valeurs
- Réorganiser l'ordre d'affichage

---

## Fichiers concernés

| Fichier | Rôle |
|---|---|
| `src/Entity/Avis.php` | Entité avis |
| `src/Entity/Critere.php` | Entité critère de filtre |
| `src/Entity/CritereValeur.php` | Entité valeur de critère (ManyToMany avec Avis) |
| `src/Repository/AvisRepository.php` | Requêtes : `findByFilters()`, `findSimilaires()`, `findDistinctAnnees()`, `countPublished()` |
| `src/Repository/CritereRepository.php` | Requêtes : `findActifs()`, `findAllOrdered()` |
| `src/Repository/CritereValeurRepository.php` | Requêtes : `findByCritereActives()` |
| `src/Controller/AvisController.php` | Routes publiques : `GET /avis` (liste+filtres), `GET /avis/{slug}` (fiche), `GET /avis/{slug}/pdf` (téléchargement) |
| `src/Controller/Admin/AvisCrudController.php` | CRUD admin : liste, création, modification, suppression, toggle publication, upload/suppression PDF |
| `src/Controller/Admin/CritereController.php` | Gestion des critères : création, modification, suppression de critères et valeurs |
| `src/Command/GenerateAvisCommand.php` | Commande `app:generate-avis` : génération d'avis de démo (10 avis avec métadonnées) |
| `migrations/Version20260722000003.php` | Migration : création tables `avis`, `critere`, `critere_valeur`, `avis_critere` + données par défaut (5 critères, ~30 valeurs) |
| `templates/avis/index.html.twig` | Page publique : hero + filtres + liste (AJAX) |
| `templates/avis/_list.html.twig` | Partial : liste des avis uniquement (pour requêtes AJAX) |
| `templates/avis/show.html.twig` | Fiche détaillée d'un avis |
| `templates/admin/avis_list.html.twig` | Admin : tableau listant tous les avis |
| `templates/admin/avis_edit.html.twig` | Admin : formulaire édition/création d'avis |
| `templates/admin/criteres.html.twig` | Admin : gestion des critères et valeurs (édition inline) |
| `.github/workflows/deploy.yml` | CI/CD : ajout `doctrine:migrations:migrate` et `app:generate-avis` |
| `config/menu.json` | Menu : URL corrigée `/avis` |
| `config/footer.json` | Footer : lien « Index des avis » → `/avis` |
| `templates/admin/base_admin.html.twig` | Sidebar : ajout lien « Avis consultatifs » |
| `templates/admin/dashboard.html.twig` | Dashboard : compteur avis dynamique |
| `src/Controller/Admin/AdminController.php` | Dashboard : injection `AvisRepository` pour compteur |
| `src/EventSubscriber/SecurityHeadersSubscriber.php` | Ajout `Cache-Control: no-cache` pour éviter le cache Infomaniak |
| `assets/styles/cncdp.css` | Ajout `body { font-family: var(--font-principale); }` pour uniformiser la police |

---

## Base de données

### Tables créées

- `avis` : id, numero (UNIQUE), titre, slug (UNIQUE), resume (LONGTEXT), contenu (LONGTEXT), date_avis (DATE), annee (INT, INDEX), pdf_filename (VARCHAR), status (VARCHAR), created_at, updated_at
- `critere` : id, nom (UNIQUE), slug (UNIQUE), actif (TINYINT), ordre (INT), created_at, updated_at
- `critere_valeur` : id, critere_id (FK→critere ON DELETE CASCADE), valeur (VARCHAR), slug (VARCHAR), actif (TINYINT), ordre (INT), created_at, updated_at
- `avis_critere` : avis_id (FK→avis ON DELETE CASCADE), critere_valeur_id (FK→critere_valeur ON DELETE CASCADE), PRIMARY KEY(avis_id, critere_valeur_id)

### Données initiales (migration)

5 critères insérés par défaut :
- **Thématique** (6 valeurs) : Secret professionnel, Consentement, Indépendance professionnelle, Conflit d'intérêts, Secret professionnel partagé, Déontologie et numérique
- **Type de demandeur** (4 valeurs) : Psychologue, Organisation, Institution, Particulier
- **Contexte** (5 valeurs) : Exercice libéral, Institution, Expertise judiciaire, Formation, Recherche
- **Article du Code** (10 valeurs) : Articles 1 à 10 du Code de déontologie
- **Mot-clé** (6 valeurs) : Déontologie, Code de déontologie, Avis consultatif, Saisine, Psychologue clinicien, Expertise

---

## Sécurité

- CSRF sur tous les formulaires admin (création, modification, suppression, toggle, suppression PDF)
- Validation basique côté serveur (champs obligatoires, unicité numero/slug)
- `strip_tags()` sur les entrées texte dans les contrôleurs admin
- Les PDF sont stockés dans `public/uploads/avis/` (accessible publiquement, ce qui est voulu)
- Routes admin protégées par `#[IsGranted('ROLE_ADMIN')]`

---

## Points importants

- **`getParameter()` non disponible dans le constructeur** des contrôleurs Symfony (AbstractController injecte le container après) → utiliser une méthode privée appelée à la demande
- Les **filtres sont entièrement dynamiques** : ajouter une thématique dans l'admin la rend immédiatement disponible partout
- La **commande `app:generate-avis`** avec `--force` supprime et régénère les données ; sans `--force`, elle ne fait rien si des avis existent
- Le **cache Infomaniak** causait des incohérences de menu → résolu avec `Cache-Control: no-cache`
- La **police Inter** n'était pas appliquée sur les pages sans style GrapesJS → résolu avec `body { font-family: var(--font-principale); }` dans `cncdp.css`

---

## Évolutions possibles

- Import batch de PDF (dossier → création automatique avec métadonnées extraites des noms de fichiers)
- Pagination des avis (si le nombre devient important)
- Filtres avancés (plage de dates, recherche dans le contenu complet)
- Statistiques admin (avis par année, par thématique…)
- Export CSV/PDF des résultats de recherche
- API REST pour consultation externe

---

> Mis à jour le 22/07/2026 — Session [AVIS] [FILTRES] [PDF] [CRUD] [ADMIN] [UX]
