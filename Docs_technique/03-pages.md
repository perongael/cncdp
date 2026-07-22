# Gestion des pages

> Créé le 16/07/2026 — Session [INIT-DOC]
> Mis à jour le 16/07/2026 — Session [GRAPESJS]
> Mis à jour le 21/07/2026 — Session [AUDIT] — Refonte éditeur, RTE, compositions, Style Manager 6 secteurs

## État actuel

✅ Entité `Page` créée avec support GrapesJS.
✅ CRUD complet dans `PageCrudController`.
✅ Éditeur visuel GrapesJS intégré avec 6 blocs Bootstrap + 3 blocs CNCDP.
✅ Route générique `/{slug}` → toutes les pages publiées accessibles en front.

## Entité Page

| Champ | Type | Description |
|---|---|---|
| `id` | int (PK) | Identifiant unique |
| `title` | string(255) | Titre de la page |
| `slug` | string(255) unique | Slug URL (généré automatiquement depuis le titre) |
| `htmlContent` | text (nullable) | HTML final généré par GrapesJS (CSS inline inclus) |
| `grapesjsData` | text (nullable) | Projet GrapesJS au format JSON (restaure l'éditeur) |
| `status` | string(20) | `draft` (brouillon) ou `published` (publié) |
| `createdAt` | datetime_immutable | Date de création (auto) |
| `updatedAt` | datetime_immutable | Date de mise à jour (auto, PreUpdate) |

## Routes

| Nom | Chemin | Contrôleur | Méthode |
|---|---|---|---|
| `app_home` | `/` | `PageController::index` | GET |
| `app_homepage` | `/accueil` | `PageController::index` | GET |
| `app_page` | `/{slug}` | `PageController::show` | GET |
| `admin_pages_list` | `/admin/pages` | `PageCrudController::list` | GET |
| `admin_page_new` | `/admin/pages/new` | `PageCrudController::new` | GET/POST |
| `admin_page_edit` | `/admin/pages/{id}/edit` | `PageCrudController::edit` | GET/POST |
| `admin_page_delete` | `/admin/pages/{id}/delete` | `PageCrudController::delete` | POST |
| `admin_pages` | `/admin/pages` | `AdminController::pages` | GET → redirige vers `admin_pages_list` |

### Routage front dynamique

La route `/{slug}` (priority -10) capture tous les slugs non matchés par d'autres routes.
- Si la page existe en BDD avec `status = published` → affichage via `pages/dynamic.html.twig`
- Sinon → erreur 404

Le `PageController` utilise une méthode privée `renderPage()` partagée entre `index()` (accueil) et `show()` (pages génériques).

## Templates

- `templates/admin/pages_list.html.twig` — Liste des pages (tableau dynamique avec données BDD)
- `templates/admin/page_editor.html.twig` — Éditeur GrapesJS (création + modification)
- `templates/admin/pages.html.twig` — Ancien template statique (conservé, non utilisé)

## Éditeur GrapesJS

### Version et intégration

- GrapesJS 0.23.2 chargé via CDN jsdelivr
- Plugins : `gjs-blocks-basic`, `grapesjs-preset-webpage`, `grapesjs-blocks-bootstrap4`, `grapesjs-indexeddb`, `grapesjs-plugin-forms`, `grapesjs-tui-image-editor`, `grapesjs-blocks-flexbox`
- `selectorManager.componentFirst: true` — les styles ciblent l'ID du composant, pas la classe
- Style Manager réorganisé en 6 secteurs : Général, Typographie, Espacement, Bordure & Arrondi, Effets, Taille
- RTE enrichi : polices, tailles, couleurs (barre d'outils customs injectées)
- Aperçu responsive : 🖥️📱📲 dans la topbar (Desktop / Tablette 768px / Mobile 375px)
- Autosave AJAX toutes les 60s si modifications
- Confirmation avant suppression de bloc
- 38 blocs customs en 7 catégories (📐 Mise en page, 🎨 Composants, 📝 Texte, 🖼️ Médias, 🔗 Navigation, 📋 Formulaire, 🧩 Compositions)
- 14 compositions dans la galerie de templates
- Thème blocs en CSS statique (plus de `setInterval`)
- Police Inter chargée dans le canvas (fidélité WYSIWYG)
- IndexedDB par page (clé `gjsProject-{pageId}`)
- Sanitization : `cleanHtml()` regex (scripts/on*/iframes) + `sanitizeDocument()` Symfony (désactivé temporairement — conflit IDs)

#### Catégorie Bootstrap (6 blocs)
- **Carousel** — 3 diapositives avec `<img>` (composant custom `carousel-img`, champs URL et alt éditables)
- **Accordéon** — 3 sections pliables (`data-toggle="collapse"`)
- **Jumbotron** — Bandeau de mise en avant avec titre + bouton
- **Liste groupée** — `list-group` avec 5 éléments
- **Alerte** — Message d'avertissement avec bouton fermeture (`alert-dismissible`)
- **Onglets** — 3 onglets (`nav-tabs`) avec contenu associé

### Composant custom carousel-img

Type : `carousel-img`
Traits éditables :
- `URL de l'image` (src) — champ texte pour l'URL de l'image
- `Texte alternatif` (alt) — champ texte pour l'accessibilité

### Fonctionnement

1. **Création** : éditeur vide avec placeholder texte
2. **Édition** : le contenu HTML existant est injecté dans le `<div id="gjs">`, le projet JSON (`grapesjsData`) est passé via `projectData` pour restaurer l'état complet
3. **Sauvegarde** : avant soumission du formulaire, le JS injecte :
   - `html_content` ← HTML + CSS inline (balise `<style>` fusionnée)
   - `grapesjs_data` ← `editor.getProjectData()` en JSON

### Personnalisation

- Le thème de l'éditeur est adapté aux couleurs CNCDP (sidebar violette `#2d2540`)
- FontAwesome 6 chargé dans le canvas pour les icônes
- Galerie de templates (8 templates, 4 par page, navigation)

### Boutons d'action

- **Enregistrer** (💾 dans la topbar) — sauvegarde AJAX sans fermer l'éditeur
- **Terminer l'édition** — sauvegarde et fermeture de l'overlay
- **Enregistrer** (formulaire) — sauvegarde classique du formulaire

## Migration

Fichier : `migrations/Version20260716000001.php`

⚠️ Pour exécuter la migration, le driver `pdo_pgsql` doit être installé ou utiliser Docker :

```bash
# Via Docker (recommandé)
docker compose exec -T php php bin/console doctrine:migrations:migrate

# Ou en local si pdo_pgsql est installé
php bin/console doctrine:migrations:migrate
```

## Évolutions futures

- ~~Rendre les pages dynamiques accessibles via `/{slug}` sur le front-office~~ ✅ Fait
- Ajouter la prévisualisation avant publication
- Supporter des blocs personnalisés GrapesJS (plugins)
- Ajouter un sélecteur d'images/upload média dans l'éditeur
- Gérer automatiquement les IDs uniques pour éviter les conflits (carouselDemo, etc.)
