# RELAIS CONTEXTE — CNCDP

---

## En-tête

Date : 22/07/2026
Session : Finalisation UX avis — filtres AJAX, refonte liste, formulaire admin, corrections CSS/header
Tag : [AVIS] [FILTRES] [UX] [FIX] [ADMIN] [CSS]

---

## Historique

### Session [AVIS] [FILTRES] [UX] [FIX] [ADMIN] [CSS] — 22/07/2026

**Objectif :** Finaliser l'UX du système d'avis : filtres AJAX sans rechargement, refonte de la liste et du formulaire admin, corrections CSS header/footer, documentation.

**Résumé :**
- **Filtres AJAX** : les filtres de la page `/avis` fonctionnent maintenant sans rechargement de page. La liste se met à jour dynamiquement via `fetch()` + partial Twig `_list.html.twig`. L'URL est synchronisée avec `history.replaceState()`.
- **Logique ET/OU corrigée** : les critères sont groupés par slug dans l'URL (`criteres[thematique][]=1`). ET entre groupes différents, OU au sein d'un même groupe. Résout le bug où combiner Consentement + Psychologue ramenait trop de résultats.
- **Refonte liste** : passage des cards à une liste sobre (fond `#fafafa`, bordures fines, résumé intégral, tags pastel violets). Hero et filtres conservés dans leur design d'origine.
- **Refonte formulaire admin** : correction `admin-input` → `admin-form-control` (les champs prennent maintenant toute la largeur), layout repensé (grille `1fr 340px`), boutons dans le header.
- **Correction police header** : ajout `body { font-family: var(--font-principale); }` dans `cncdp.css`. Les pages sans style GrapesJS (comme `/avis`) tombaient sur la police système Bootstrap au lieu d'Inter.
- **Cache Infomaniak** : ajout `Cache-Control: no-cache` dans `SecurityHeadersSubscriber` pour éviter les incohérences de menu entre pages.
- **Bouton PDF** : déplacé dans la sidebar de la fiche avis, sous le bloc Informations.
- **Documentation** : création de `Docs_technique/15-avis.md` couvrant l'ensemble du système.

**⚠️ Règles apprises :**
- `admin-input` n'existe pas dans admin.css → utiliser `admin-form-control`
- Les `<style>` injectés par GrapesJS dans le body affectent TOUTE la page (y compris le header)
- Le cache nginx/Varnish d'Infomaniak peut servir des versions différentes du menu selon les pages
- Les filtres combinés nécessitent une logique ET entre critères différents (JOIN distincts par groupe) et non un simple IN

### Session [AVIS] [FILTRES] [PDF] [CRUD] [ADMIN] — 22/07/2026

**Objectif :** Créer un système complet de gestion des avis consultatifs du CNCDP avec filtres dynamiques, import PDF et interface publique de consultation.

**Résumé :**
- **3 nouvelles entités Doctrine** créées :
  - `Avis` : numéro, titre, slug, résumé, contenu HTML, date, année, PDF, statut (draft/published)
  - `Critere` : catégories de filtres dynamiques (nom, slug, actif, ordre) — les admins peuvent créer/modifier/supprimer des critères sans toucher au code
  - `CritereValeur` : valeurs pour chaque critère, liées en ManyToMany avec `Avis`
- **5 critères par défaut** insérés dans la migration : Thématique, Type de demandeur, Contexte, Article du Code, Mot-clé — avec des valeurs prédéfinies pour chaque
- **Migration** `Version20260722000003` : crée les tables `avis`, `critere`, `critere_valeur`, `avis_critere` (MySQL/InnoDB)
- **Back-office admin :**
  - `AvisCrudController` (`/admin/avis`) : liste, création, modification, suppression, toggle publication, upload PDF, suppression PDF
  - `CritereController` (`/admin/criteres`) : gestion complète des critères et valeurs (ajout, modification, suppression, activation/désactivation)
  - Interface d'édition d'avis avec sélection des critères via checkboxes groupés par catégorie
  - Upload PDF : fichier stocké dans `public/uploads/avis/`, nommé `{slug}-{date}.pdf`
- **Partie publique :**
  - `AvisController` : liste avec recherche plein texte + filtres par année + filtres par critères combinables
  - Fiche détaillée : numéro, titre, date, résumé, contenu complet, catégories groupées, téléchargement PDF, avis similaires
  - Routes : `/avis` (liste, priority 10) et `/avis/{slug}` (fiche, priority 10) — pas de conflit avec la route `/{slug}` générique
- **Templates :**
  - `admin/avis_list.html.twig` : tableau avec numéro, titre, tags, date, PDF, statut, actions (éditer, publier/dépublier, supprimer)
  - `admin/avis_edit.html.twig` : formulaire 2 colonnes (contenu + métadonnées/critères/PDF)
  - `admin/criteres.html.twig` : gestion des critères avec formulaires d'édition inline
  - `avis/index.html.twig` : Hero + barre de recherche + filtres dropdown + cartes d'avis
  - `avis/show.html.twig` : fiche détaillée avec sidebar métadonnées + avis similaires
- **Modifications existant :**
  - Sidebar admin : ajout lien « Avis consultatifs »
  - Dashboard : compteurs dynamiques (pages publiées, avis publiés)
  - `config/menu.json` : URL corrigée `/avis` (était `demande-avis-consultatifs` sans `/`)
  - `config/footer.json` : lien « Index des avis » pointe vers `/avis`

**⚠️ Règles apprises :**
- `getParameter()` n'est pas disponible dans le constructeur des contrôleurs (AbstractController injecte le container après construction) → utiliser une méthode privée lazy
- Les critères sont entièrement dynamiques : ajouter une thématique dans l'admin la rend immédiatement disponible dans les filtres publics ET dans le formulaire d'édition des avis
- Le système de filtres repose sur `CritereValeur` en ManyToMany avec `Avis` : les filtres publics utilisent des `<select>` qui envoient des IDs de valeurs de critères
- Les avis similaires sont déterminés par le nombre de critères en commun (requête DQL avec GROUP BY + COUNT)

### Session [DEPLOY] [PAGES] [STYLE] [GRAPESJS] [FIX] — 22/07/2026

**Objectif :** Déployer le site sur Infomaniak, reconstruire les 6 pages manquantes avec le contenu officiel, corriger le Style Manager (dégradés, couleurs, text-shadow).

**Résumé :**
- **Déploiement Infomaniak réussi** sur https://gperontest.online
  - Git initialisé, dépôt GitHub `perongael/cncdp`
  - Clé SSH ed25519, workflow GitHub Actions `deploy.yml` (push main → rsync → composer → importmap:install → asset-map:compile → cache:clear)
  - `.env.local` production avec MySQL (⚠️ MDP changé pour éviter les `$`)
  - `.htaccess` dans `public/` commité dans Git (était exclu et supprimé par rsync)
  - Document Root → `public/`, migrations exécutées
- **6 pages reconstruites** avec contenu des `.docx` de `Pages_site/` :
  - Le CNCDP : Bureau (3 pers.), CA (17 orgs avec titulaires/suppléants), documents fondateurs
  - Adhésion : 7 valeurs, conditions, cotisation 250 €, 3 étapes, contact le.cncdp@gmail.com
  - Avis consultatifs : procédure 4 étapes, tarifs (gratuit/50 €/150 €), paiement
  - Journées d'études, Formations, Contact : contenu enrichi
- **Hero uniformisé** sur les 7 pages : dégradé 3 tons (#2d2540→#9d38da→#9335e4) + halos radiaux rose/orange + text-shadow
- **Style Manager** :
  - `text-shadow` ajouté dans secteur Effets (5 niveaux)
  - Dégradés utilisent `var(--grad-start)` et `var(--grad-end)` → changement des couleurs met à jour le fond
  - `syncBgToStyleManager()` : détecte le type de dégradé, recalcul le background-image quand les variables changent, convertit les couleurs en dur vers CSS variables
  - Nouveau bloc ✨ Hero avec halo dans 🧩 Compositions
- **Fix éditeur** : extraction du `<body>` avant `setComponents()` (évite `<html>`, `<head>`, `<meta>` parasites)
- **Fix accents** : `cleanHtml()` décode `\uXXXX` → UTF-8 + script de correction des données existantes
- **Fix `importmap.php`** : retiré des exclusions rsync + ajout `importmap:install` dans deploy.yml

**⚠️ Problèmes rencontrés :**
- **MDP MySQL avec `$`** → conflits d'échappement DotEnv/Shell/URL → changé pour MDP sans caractères spéciaux
- **`importmap.php` exclu du déploiement** → entrypoint `app` introuvable → ajouté au git + `importmap:install` dans CI
- **`var/log` inexistant** → créé avec permissions
- **`DEFAULT_URI` absent du .env.local** → ajouté
- **`.htaccess` supprimé par `rsync --delete`** → commité dans Git
- **Pages absentes en production** → seulement Accueil migré, les 6 autres recréées
- **`grapesjsData` désynchronisé** → l'éditeur chargeait l'ancien état → mis à NULL pour parser le HTML
- **HTML wrapper (`<html>`, `<head>`, `<meta>`) dans l'éditeur** → sélection parasite → extraction body uniquement

**⚠️ Règles apprises :**
- Toujours commiter `.htaccess` dans Git (sinon rsync --delete le supprime)
- `importmap.php` ne doit PAS être exclu du déploiement
- Toujours exécuter `importmap:install` avant `asset-map:compile` en production
- Les `$` dans les MDP MySQL sont un cauchemar d'échappement (DotEnv → Shell → URL) → utiliser des MDP sans `$`
- Pour que les dégradés soient éditables dans le Style Manager, utiliser `var(--grad-start)` et `var(--grad-end)` + recalcul dans `syncBgToStyleManager()`
- Injecter le HTML sans wrapper DOCTYPE/html/head/body pour éviter les composants parasites dans l'éditeur

### Session [PAGE] [FORMATION] [GRAPESJS] [FRONT] — 21/07/2026 (soir)

**Objectif :** Créer une page « Journées d'études » (type Formation) servant de modèle pour les formations et événements du CNCDP.

**Résumé :**
- **Page créée** (ID 14, slug `journees-detudes`, statut `published`) via l'API GrapesJS dans le navigateur (`editor.getWrapper().components().add()`)
- **5 sections** construites :
  1. 🎯 **Hero** — fond dégradé violet, titre H1 + sous-titre « 7ᵉ Journée d'Études — Lien, sanction, réparation »
  2. 📋 **Programme** — 12 entrées avec badges horaires (violets `#9d38da`, roses `#fd82bb` pour la pause), intervenants, présentateurs, articles du Code de déontologie en pastilles orange
  3. 👤 **Intervenants** — 9 cartes en grille 2 colonnes (fond `#f8f9fa`)
  4. 🏛️ **Comité d'organisation** — 9 cartes en grille 3 colonnes avec bordure supérieure rose
  5. 📎 **Documents associés** — 3 blocs placeholder (Programme PDF, Replay, Supports)
- **`config/menu.json`** modifié : lien « Journées d'études » pointe vers `/journees-detudes` (était `#`)
- **Contenu sauvegardé** : `htmlContent` (23 966 car.), `grapesjsData` (41 000 car.) — la page est rééditable

**⚠️ Problèmes rencontrés :**
- **Autosave → doublon slug** : l'autosave AJAX a créé la page avant la soumission du formulaire → erreur 500 `Duplicate entry`. Résolu : la page existait déjà, il suffisait de la modifier.
- **Perte de styles au `remove()`/`add()`** : la réorganisation des sections (Programme après Hero) a fait perdre les styles de la section déplacée. Cause : GrapesJS convertit les styles inline en règles CSS par ID ; après `remove()`+`add()`, les IDs sont régénérés et les règles CSS orphelines. Solution : supprimer et reconstruire entièrement la section au bon index (`add(..., { at: 1 })`).
- **CSS non « cassé » mais invisible aux sélecteurs d'attributs** : GrapesJS 0.23.2 extrait les styles inline vers une balise `<style>` avec sélecteurs d'ID. Les `window.getComputedStyle()` confirment que tout est correctement appliqué.

**⚠️ Règle apprise :** Ne JAMAIS utiliser `remove()` puis `add()` pour déplacer un composant GrapesJS — les styles sont perdus. Privilégier la suppression + reconstruction complète au bon index.

### Session [DEPLOY] [INFOMANIAK] [AUDIT] — 21/07/2026 (fin de journée)

**Objectif :** Préparer le déploiement du site CNCDP sur un hébergement Infomaniak via GitHub Actions et SSH.

**Résumé :**
- **Audit pré-déploiement** : vérification de l'état du projet (Git non initialisé, pas de `.env.local`, pas de dossier `.github/`)
- **Analyse de compatibilité BDD** : le projet utilise PostgreSQL en local (Docker) mais Infomaniak fournit MySQL. Les migrations existantes utilisent une syntaxe compatible MySQL (`LONGTEXT`, `ENGINE=InnoDB`, `AUTO_INCREMENT`) — la migration devrait fonctionner.
- **`doctrine.yaml`** : présence de `identity_generation_preferences` pour `PostgreSQLPlatform` — sans impact sur MySQL (ne s'applique pas), mais à nettoyer à terme.
- **Lecture et validation du guide** `Docs_technique/14-GUIDE_DEPLOIEMENT_GITHUB_INFOMANIAK.md`
- **Plan de déploiement établi** en 9 étapes : init Git → créer repo GitHub → workflow GitHub Actions → clé SSH ed25519 → secrets GitHub → base MySQL Infomaniak → push → config serveur (.env.local, document root, migrations)
- **Blocage** : les identifiants Infomaniak (serveur FTP/SSH, nom d'utilisateur, nom du dossier site) sont nécessaires pour créer le fichier `deploy.yml`

**⚠️ Points d'attention :**
- Infomaniak exige des clés SSH **ed25519** (RSA refusé)
- Le workflow `deploy.yml` doit protéger `.env.local` contre l'écrasement (déjà prévu avec `if [ ! -f .env.local ]`)
- Après déploiement, exécuter `doctrine:migrations:migrate` manuellement sur le serveur
- Le Document Root Infomaniak doit pointer vers `public/`

### Session [FRONT] [GRAPESJS] [FIX] [BLOCS] [CSS] — 21/07/2026 (soir)

**Objectif :** Refondre la page d'Accueil, corriger le bug récurrent du `background` shorthand qui bloque le Style Manager, ajouter un bloc « Carte accent » réutilisable.

**Résumé :**
- **Refonte Accueil (page ID 6)** : 3 sections — Héro (dégradé violet identique à Adhésion), Notre mission, Accès rapides (3 cartes avec bordures supérieures colorées violet/rose/orange)
- **Bug `background` shorthand** : le shorthand `background: linear-gradient(...)` écrasait tout et empêchait `background-color` du Style Manager de fonctionner. Résolu en 3 étapes :
  1. Remplacement du shorthand `background` par `background-image` + `background-color` séparés
  2. Alignement des valeurs sur les variables CSS (`var(--grad-start, ...)`) pour que le select « Style de fond » du Style Manager soit synchronisé
  3. Utilisation de `addStyle()` au lieu de `setStyle()` dans les scripts de build pour éviter d'écraser les propriétés existantes
- **Style Manager** : ajout de la propriété `border-top-color` (« Couleur bordure sup. ») dans le secteur Bordure & Arrondi
- **Nouveau bloc** : `comp-card-accent` (« 🃏 Carte accent ») dans 🎨 Composants — icône + titre + description + bouton, bordure supérieure 4px personnalisable via le Style Manager

**⚠️ Règle apprise :** Toujours utiliser `addStyle()` (pas `setStyle()`) pour modifier des propriétés CSS dans GrapesJS. `setStyle()` remplace TOUT l'objet style, écrasant les propriétés non mentionnées.

### Session [AUDIT] [GRAPESJS] [UX] [FIX] [BLOCS] [CSS] — 21/07/2026 (matin)

**Objectif :** Audit complet de l'éditeur GrapesJS, corrections de bugs, améliorations UX et enrichissement du catalogue de blocs. Corrections header/menu front.

**Résumé :**
- **Header front** : menu centré (grille 3 colonnes), burger à droite sur mobile, animation de déroulement du menu mobile (max-height + opacity 300ms)
- **Palette 3 couleurs** : page admin Apparence complétée (violet/rose/orange, 9 nuances), doc `05-apparence.md` refaite, page Contact diversifiée (rose/orange)
- **`componentFirst: true`** activé dans `selectorManager` — les styles du Style Manager ciblent le composant sélectionné, plus la classe partagée. **Bug majeur résolu** (modifier une carte modifiait toutes les cartes)
- **Style Manager Bordure enrichi** : couleur, épaisseur, style de trait, coins arrondis
- **Audit complet réalisé** : 12 bugs (B1-B12), 7 failles sécurité (S1-S7), 8 écarts UX documentés
- **Corrections appliquées :**
  - CSRF token `page_save` sur le formulaire page + validation dans `handleSave()`
  - IndexedDB : clé par page (`gjsProject-{pageId}`) — fini l'écrasement croisé
  - Plugin `grapesjs-custom-code` retiré (injection HTML arbitraire)
  - Bloc Vidéo : iframe → carte cliquable (l'iframe était supprimée à la sauvegarde de toute façon)
  - Aperçu responsive : boutons 🖥️📱📲 dans la topbar
  - Confirmation avant suppression de bloc
  - Autosave AJAX toutes les 60s si modifications
  - Bouton ✕ : compte les modifs perdues + restaure l'état sauvegardé
  - Style Manager réorganisé : 6 secteurs, dégradés fragiles retirés, ajout Interligne/Ombre/Transparence
  - Traits jargon (ID, title) retirés des colonnes
  - Intervalles suspendus quand l'éditeur est fermé (perfs)
  - Indicateur sauvegardé/modifié événementiel (plus de polling)
- **4 nouveaux blocs Compositions** : 💬 Témoignages, ❓ FAQ (accordéon), 📣 Appel à l'action, 🖼️ Galerie 8 images
- **Préparé mais non activé** : `sanitizeDocument()` + config sanitizer (max_input_length 1M, style retiré des éléments autorisés) — à activer après tests de non-régression sur les pages existantes

**⚠️ Sécurité (audit S1-S7) :**
- S1 ✅ CSRF `page_save`
- S2 ✅ Sanitizer activé : 2 passes (regex `cleanHtml()` → Symfony `sanitizeDocument()`)
- S3 ✅ Plugin custom-code retiré
- S4 ✅ Bloc vidéo converti en carte cliquable (plus d'iframe)
- S5 ⏳ Asset Manager upload — à faire (endpoint Symfony)
- S6 ✅ CSP + X-Frame-Options + X-Content-Type-Options + Referrer-Policy via `SecurityHeadersSubscriber`
- S7 ✅ `rel="noopener noreferrer"` forcé sur `target="_blank"` dans `cleanHtml()`
- Sanitizer YAML : `max_input_length` 1M, `<style>` retiré des `allow_elements` (CSS nettoyé séparément)

### Session [PAGES] [MENU] [CONTACT] [GRAPESJS] [FIX] [DOC] — 20/07/2026

**Objectif :** Créer la page Contact du site, corriger les bugs de l'éditeur GrapesJS, créer les pages du menu principal.

**Résumé :**
- Création de 6 pages pour le menu principal (Code de déontologie, Adhésion, CNCDP, Demande d'avis, Formations, Contact)
- Refonte du menu (`config/menu.json`) avec 7 entrées
- Élargissement du header (1320px max, espacements réduits)
- Page Contact entièrement construite via l'API native GrapesJS (`getWrapper().components().add()`) — formulaire + coordonnées
- 2 nouveaux blocs « Carte » dans l'éditeur (vide et avec titre, style CNCDP)
- **4 bugs critiques corrigés :**
  1. « ✓ Terminer » ne soumettait pas le formulaire → ajout `document.getElementById("page-form").submit()`
  2. Le sanitizer Symfony (`htmlSanitizer->sanitize()`) détruisait les formulaires → remplacé par `cleanHtml()` dans `PageCrudController`
  3. Assets JS servis avec MIME `text/plain` → suppression des assets compilés en mode debug
  4. Toolbar RTE positionnée sur le texte → décalage CSS `translateY(calc(-100% - 8px))` + curseur terracotta
- **RTE amélioré :** config `richTextEditor`, curseur orange, contour d'édition, contrôles customs (police, taille, couleur)
  - L'EntityManager altère le HTML → utiliser SQL direct (DBAL)
- Documentation : `Docs_technique/13-creation-pages.md` créé (guide complet pour agents IA)
- Header élargi à 1320px, espacements réduits

### Session [FOOTER] [MENU] [LOGO] [ADMIN] [TWIG] [JS] [CSS] — 19/07/2026

**Objectif :** Rendre administrables le pied de page, le menu de navigation et le logo du site. Interface de gestion de menu avec builder JS interactif (hiérarchie, promotion/rétrogradation).

**Résumé global :**
- **Footer** : stockage JSON, formulaire admin en grille 3 rangées, Twig Extension `footer_config()`
- **Menu** : stockage JSON hiérarchique, builder JS avec ↑↓/⤻⤼/＋/🗑️, limite 3 niveaux, macro Twig récursive, dropdown CSS
- **Logo** : stockage JSON, upload dans Apparence, Twig Extension `site_config()`, header spacing
- **Docs** : `11-bas-de-page.md`, `12-menu.md`, RELAIS_CONTEXTE.md à jour

### Session [MENU] [ADMIN] [TWIG] [JS] — 19/07/2026

**Objectif :** Créer un système de gestion dynamique du menu de navigation, avec support des sous-menus hiérarchiques (3 niveaux max).

**Résumé :**
- Création de `config/menu.json` — stockage hiérarchique (items → children récursif)
- Nouvelle route `GET/POST /admin/menu` dans `AdminController::menu()` avec sanitization récursive
- Nouvelle extension Twig `MenuExtension` — fonction `menu_config()` disponible dans tous les templates front
- Nouveau template `templates/admin/menu_edit.html.twig` — builder JS interactif :
  - Ajout/suppression d'items et sous-items
  - Réorganisation par flèches ↑↓
  - **Promotion** (⤻ outdent) : remonter un sous-menu d'un niveau
  - **Rétrogradation** (⤼ indent) : descendre un item en sous-menu de l'élément au-dessus
  - Indentation visuelle cumulative par wrapper (terracotta/violet/rose/gris)
  - Limitation à 3 niveaux max (bouton ＋ grisé au niveau 2)
  - Sérialisation fiable : lecture du DOM à la soumission
- Mise à jour de `templates/base.html.twig` — **macro Twig récursive** `menu_item()` pour profondeur illimitée, dropdown CSS (▾ niveau 1, ▸ niveaux 2+)
- Mise à jour de `assets/styles/cncdp.css` — sous-menus desktop (flyout droite), mobile (indentation verticale), `.nav-list` en `flex-wrap` pour 2 lignes si trop d'items
- Ajout du lien "Menu" dans la sidebar admin
- Documentation : `Docs_technique/12-menu.md` créé

### Session [LOGO] [ADMIN] [TWIG] — 19/07/2026

**Objectif :** Permettre le changement du logo du site via l'admin, et améliorer l'espacement header.

**Résumé :**
- Création de `config/site.json` — stockage du nom de fichier logo actif
- Nouvelle extension Twig `SiteExtension` — fonction `site_config()` (logo + futur settings)
- Mise à jour de `AdminController::appearance()` — gestion upload fichier (PNG/JPEG/SVG), stockage dans `public/images/`
- Mise à jour de `templates/admin/appearance.html.twig` — preview logo dynamique, formulaire upload, flash messages
- Mise à jour de `templates/base.html.twig` — logo chargé via `asset('images/' ~ site_config().logo)`
- Mise à jour de `assets/styles/cncdp.css` — `.header-inner` utilise `gap` au lieu de `space-between`, logo et menu décollés

### Session [FOOTER] [ADMIN] [TWIG] — 19/07/2026

**Objectif :** Créer un système de gestion dynamique du bas de page (footer), administrable via le back-office.

**Résumé :**
- Création de `config/footer.json` — stockage des données footer (adresse, email, liens, copyright, liens légaux)
- Nouvelle route `GET/POST /admin/bas-de-page` dans `AdminController::footer()`
- Nouvelle extension Twig `FooterExtension` — fonction `footer_config()` disponible dans tous les templates front
- Enregistrement du service dans `config/services.yaml` avec `$projectDir`
- Nouveau template `templates/admin/footer_edit.html.twig` — formulaire en grille 2 colonnes × 3 rangées (Coordonnées|Liens utiles, Liens Contact|Liens légaux, Copyright)
- Mise à jour de `templates/base.html.twig` — footer dynamique avec 3 colonnes + bandeau inférieur
- Ajout du lien "Bas de page" dans la sidebar admin (section Contenu du site)
- Styles CSS footer dans `assets/styles/cncdp.css` (`.footer-legal`, `.footer-copyright`)
- Documentation : `Docs_technique/11-bas-de-page.md` créé
- Format des liens : `Texte du lien | URL` — un lien par ligne, parsé avec filtre Twig `split('|')`

### Session [UX] [GRAPESJS] [FRONT] [REFACTOR] — 19/07/2026

**Objectif :** Refondre l'interface de l'éditeur GrapesJS en s'inspirant du Studio SDK (https://app.grapesjs.com/studio) et enrichir les blocs disponibles.

**Résumé :**
- Étude de GrapesJS Studio SDK : documentation lue (Getting Started, Configuration Overview), comparaison avec notre intégration
- Décision : ne pas migrer vers le SDK (licence payante requise), mais rapprocher visuellement notre éditeur du Studio
- Refonte complète de l'overlay éditeur :
  - **Topbar** façon Studio : boutons icônes (🧩 Blocs, 📑 Calques, 🎨 Styles, ⚙️ Propriétés) synchronisés avec les panels GrapesJS natifs
  - **Barre d'état inférieure** : composant sélectionné + compteur de modifications (getDirtyCount)
  - **Thème sombre** aligné sur la sidebar admin (`#2d2540`), blocs en fond `#372e4a`, bordures terracotta `#d4845a`
  - Boutons Undo/Redo, Aperçu, Code, Galerie dans la topbar
- **Blocs** :
  - Présentation compacte en grille 2 colonnes (au lieu de liste verticale)
  - Icônes réduites (24px SVG, 1.1rem FontAwesome)
  - 9 nouveaux blocs "📐 Mise en page" : Section, Séparateur, 2 Col. 50/50, 2 Col. 25/75, 2 Col. 75/25, 3 Colonnes, 4 Colonnes, Lien Carte, Image + Texte
  - Traduction française de tous les blocs natifs des plugins (1 Column → 1 colonne, etc.)
  - Uniformisation couleur terracotta `#d4845a` sur tous les blocs
- **Correction** : bug collapse des catégories (CSS `display:flex !important` ciblait tous les `.gjs-blocks-c`, empêchant GrapesJS de masquer les blocs → corrigé en ciblant `.gjs-block-category.gjs-open .gjs-blocks-c`)
- **Dette technique** : les styles sont appliqués à la fois en CSS et en JavaScript (`applyBlockStyles()` toutes les 500ms) car GrapesJS écrase le CSS via des styles inline

### Session [GRID] [CSSGRID] [MIGRATION] [GRAPESJS] [REFACTOR] — 18/07/2026

**Objectif :** Corriger les bugs de l'outil Grille Bootstrap, puis le réécrire en CSS Grid, migrer GrapesJS en v0.23.2, finalement retirer l'outil Grille.

**Résumé :**
- Multiples tentatives de correction de l'outil Grille Bootstrap (offsets, marges, align-items, tracking) — échec dû à la complexité inhérente
- Tentative d'intégration du plugin `grapesjs-plugin-toolbox` — incompatible avec GrapesJS
- Migration GrapesJS 0.21.10 → 0.23.2 réussie (Symbols dispo, dynamic plugins, meilleur typage)
- Réécriture de l'outil Grille en CSS Grid natif (~80 lignes au lieu de ~250) : fonctionnel, robuste, sans bug
- Décision de retirer l'outil Grille (redondant avec les blocs Row/Column natifs de GrapesJS, incohérent avec Bootstrap)
- Code grille retiré, documenté dans `Docs_technique/09-grille.md`
- Bug critique corrigé : accolade en double dans `pluginsOpts` qui empêchait le chargement de `page-editor.js`
- `Docs_technique/07-grapesjs.md` mis à jour pour v0.23.2

### Session [PLUGINS] [GRAPESJS] [UX] — 18/07/2026

**Objectif :** Évaluer et intégrer des plugins GrapesJS, refondre l'interface éditeur (thème chaud, i18n français, RTE enrichi, outil Grille).

**Résumé :**
- 27 plugins GrapesJS évalués depuis gjs.market et GitHub
- 5 plugins intégrés : IndexedDB, Forms, TOAST UI Image Editor, Custom Code, Blocks Flexbox
- Refonte UX complète : thème chaleureux (terracotta #d4845a), interface 100% en français, RTE enrichi (police/taille/couleur), outil Grille 12 colonnes
- Documentation : `Docs_technique/08-plugins.md` créé (27 plugins évalués avec verdicts)
- Corrections : IndexedDB fonctionnel, CDN TOAST UI corrigé, bug `});` manquant réparé

### Session [DOC] [GRAPESJS] — 17/07/2026

**Objectif :** Documenter exhaustivement l'intégration GrapesJS à partir de la documentation officielle (24 pages lues).

**Résumé :**
- Création de `Docs_technique/07-grapesjs.md` — documentation complète (~1400 lignes)
- Couvre 24/24 pages de la doc officielle : tous les modules (Components, Traits, Blocks, Commands, Storage, Style Manager, Assets, Pages, Selectors, Layers, Modal, I18n, Plugins, Device Manager, Undo Manager, Keymaps), tous les guides (Symbols, RTE, CSS Parser, Telemetry), et les API (Editor, Canvas, Panels, Component)
- Glossaire, flux de transformation HTML→Component, cycle de vie, 27 liens vers la doc officielle
- Documente les spécificités CNCDP : blocs customs, composant carousel-img, galerie templates, overlay éditeur, sauvegarde AJAX, stockage inline
- ⚠️ Interactions JS dans le canvas (carousel, accordéon) ne fonctionnent pas car GrapesJS intercepte les clics
- ⚠️ Plugin `grapesjs-indexeddb` manquant — le `type: "indexeddb"` configuré est inopérant
- ⚠️ Symbols non disponibles (v0.21.11+ requis, nous sommes en v0.21.10)
- ⚠️ Risque XSS : HTML stocké brut sans sanitization

### Session [FIX] [GRAPESJS] [FRONT] — 16/07/2026

**Objectif :** Corriger l'incohérence CSS admin, ajouter le routage dynamique des pages, ajouter jQuery/Bootstrap JS, et enrichir l'éditeur GrapesJS avec des blocs Bootstrap.

**Résumé :**
- Bootstrap 4.6 ajouté à `base_admin.html.twig` (manquait → incohérence visuelle entre les pages admin et l'éditeur)
- Route générique `/{slug}` ajoutée dans `PageController` (priority -10) → toutes les pages publiées accessibles
- jQuery 3.6.4 slim + Bootstrap 4.6 JS bundle ajoutés au front (`base.html.twig`) et au canvas GrapesJS
- 6 nouveaux blocs dans l'éditeur GrapesJS (catégorie Bootstrap) : Carousel, Accordéon, Jumbotron, Liste groupée, Alerte, Onglets
- Composant custom `carousel-img` avec champs URL image et texte alternatif éditables

### Session [GRAPESJS] — 16/07/2026
Intégration GrapesJS + CRUD Pages (voir détails plus bas)

---

## Informations globales du projet

### Projet

- **Nom :** CNCDP — Comité National Consultatif de Déontologie des Psychologues
- **Objectif :** Site institutionnel avec espace public (front-office) et back-office d'administration
- **Utilisateurs :** Grand public, psychologues, administrateurs du CNCDP
- **Stack :** PHP ≥8.2, Symfony 7.4, Doctrine ORM 3.6, PostgreSQL 16 (Docker), Twig, AssetMapper, Stimulus, Turbo
- **Architecture :** Symfony full-stack — `App\Controller\` (front) et `App\Controller\Admin\` (back-office protégé par firewall `form_login`)

### Conventions

- Contrôleurs front → `src/Controller/`, admin → `src/Controller/Admin/`
- Templates front → `templates/pages/`, admin → `templates/admin/`
- CSS → `assets/styles/cncdp.css` (front) et `assets/styles/admin.css` (back)
- Authentification : provider `in_memory`, à migrer vers BDD
- Base de données : PostgreSQL 16, naming `underscore_number_aware`
- Framework CSS : Bootstrap 4.6 (CDN) sur tout le site (front + admin)
- JS : jQuery 3.6.4 slim + Bootstrap 4.6 JS bundle (CDN) sur le front

---

## Section Inventaire

### [NEW]
- `.github/workflows/deploy.yml` — Workflow CI/CD Infomaniak (push main → rsync → composer → importmap → assets → cache)
- `public/.htaccess` — Réécriture URL Apache pour Symfony (commitée dans Git)
- `Pages_site/` — 4 fichiers .docx (Accueil, Le CNCDP, Adhésion, Avis consultatifs) contenant le contenu officiel
- Page BDD `page` (ID 2-7) — 6 pages recréées avec contenu officiel (Le CNCDP, Adhésion, Avis consultatifs, Journées d'études, Formations, Contact)
- `assets/page-editor.js` — **[STYLE-MANAGER]** `text-shadow` dans secteur Effets ; **[BLOC]** ✨ Hero avec halo dans 🧩 Compositions ; **[FIX]** extraction body avant setComponents ; **[FIX]** syncBgToStyleManager recalcule background-image depuis CSS variables ; **[FIX]** dégradés utilisent var(--grad-start)/var(--grad-end) avec recalcul automatique
- `Docs_technique/13-creation-pages.md` — **Guide complet pour agents IA** : comment créer une page compatible GrapesJS, bugs connus, checklist
- `Docs_technique/12-menu.md` — Documentation du système de menu dynamique administrable
- `Docs_technique/11-bas-de-page.md` — Documentation du système de footer dynamique administrable
- `Docs_technique/09-grille.md` — Documentation de l'outil Grille (Bootstrap + CSS Grid), historique, raison du retrait, code de référence
- `Docs_technique/01-architecture.md` — Architecture globale, stack, arborescence
- `Docs_technique/02-authentification.md` — Système d'authentification admin
- `Docs_technique/03-pages.md` — Gestion des pages (front + admin)
- `Docs_technique/04-organisations.md` — Gestion des organisations adhérentes
- `Docs_technique/05-apparence.md` — Personnalisation de l'apparence du site
- `Docs_technique/06-backoffice.md` — Documentation complète du back-office admin (layout, routes, pages, responsive, sécurité)
- `Docs_technique/07-grapesjs.md` — Documentation technique de l'intégration GrapesJS (architecture, blocs, canvas, sauvegarde, templates)
- `Docs_technique/08-plugins.md` — Évaluation de 27 plugins GrapesJS avec description, verdict et URLs. Structure extensible à d'autres types d'extensions.
- `src/Twig/SiteExtension.php` — Extension Twig `site_config()` pour le logo et paramètres du site
- `config/site.json` — Stockage JSON du logo et paramètres généraux
- `src/Twig/MenuExtension.php` — Extension Twig `menu_config()` pour le menu dynamique
- `templates/admin/menu_edit.html.twig` — Builder JS interactif pour le menu (admin)
- `config/menu.json` — Stockage JSON hiérarchique du menu
- `src/Twig/FooterExtension.php` — Extension Twig `footer_config()` pour le footer dynamique
- `templates/admin/footer_edit.html.twig` — Formulaire d'édition du bas de page (admin)
- `config/footer.json` — Stockage JSON des données du footer
- `src/Entity/Page.php` — Entité Page avec champs GrapesJS (htmlContent, grapesjsData)
- `src/Repository/PageRepository.php` — Repository Page
- `src/Controller/Admin/PageCrudController.php` — CRUD pages (list, new, edit, delete) avec GrapesJS
- `templates/admin/pages_list.html.twig` — Liste dynamique des pages (BDD)
- `templates/admin/page_editor.html.twig` — Éditeur GrapesJS intégré
- `migrations/Version20260716000001.php` — Migration table page
 ; **[MENU]** Header dynamique via `menu_config()`, dropdown CSS pour sous-menus
- `templates/admin/base_admin.html.twig` — **[FOOTER]** Ajout lien "Bas de page" ; **[MENU]** Ajout lien "Menu" dans la sidebar
- `src/Controller/Admin/AdminController.php` — **[FOOTER]** Ajout route `admin_footer` (GET/POST) pour l'édition du bas de page
- `templates/base.html.twig` — **[FOOTER]** Footer dynamique via `footer_config()`, 3 colonnes + bandeau inférieur
- `templates/admin/base_admin.html.twig` — **[FOOTER]** Ajout lien "Bas de page" dans la sidebar admin
- `config/services.yaml` — **[FOOTER]** Enregistrement du service `FooterExtension` avec `$projectDir`
- `assets/styles/cncdp.css` — **[FOOTER]** Styles `.footer-legal`, `.footer-copyright`
- `assets/page-editor.js` — **[UX]** Refonte topbar Studio-like (boutons icônes, undo/redo, aperçu, code, galerie, status bar) ; **[BLOCS]** 9 nouveaux blocs "📐 Mise en page" (Section, Séparateur, colonnes 50/50, 25/75, 75/25, 3 col, 4 col, Lien Carte, Image+Texte) ; **[I18N]** Traduction française de tous les blocs natifs (1 Column → 1 colonne, etc.) ; **[STYLE]** `applyBlockStyles()` JS (intervalle 500ms) pour forcer fond sombre, bordures terracotta, grille 2 colonnes
- `templates/admin/page_editor.html.twig` — **[UX]** Topbar façon Studio SDK (🧩📑🎨⚙️ + ↩️↪️👁️📋🖼️ + 💾✓✕) ; **[THÈME]** Thème sombre aligné sidebar (#2d2540), blocs #372e4a, bordures terracotta, texte clair #c4bdd4 ; **[CSS]** Grille 2 colonnes, icônes compactes 24px, labels 0.65rem
- `Docs_technique/07-grapesjs.md` — **[DOC]** Section Personnalisation du thème mise à jour (palette sombre, topbar custom) ; Section Fonctionnalités modifiées enrichie (topbar native masquée, barre d'état, synchro panels)
- `templates/admin/login.html.twig` — **[FIX-SECURITY]** Template de login rendu autonome (n'étend plus `base_admin.html.twig`)
- `Docs_technique/02-authentification.md` — Mise à jour de la section Templates
- `templates/admin/base_admin.html.twig` — **[FIX-ADMIN-CSS]** Bootstrap 4.6 CDN ajouté (était manquant → incohérence visuelle avec l'éditeur) ; Retrait du texte "CNCDP Admin" dans la sidebar ; lien Pages mis à jour vers `admin_pages_list`
- `templates/admin/page_editor.html.twig` — **[FIX-ADMIN-CSS]** Bootstrap 4.6 CDN retiré du bloc stylesheets (hérité de base_admin maintenant)
- `src/Controller/Admin/AdminController.php` — Route `admin_pages` redirige vers `admin_pages_list`
- `Docs_technique/03-pages.md` — Refonte complète (entité, CRUD, GrapesJS)
- `src/Controller/PageController.php` — **[FIX-ROUTES]** Ajout route `/{slug}` (priority -10) + refactoring avec méthode privée `renderPage()`
- `templates/base.html.twig` — **[FRONT-JS]** Ajout jQuery 3.6.4 slim + Bootstrap 4.6 JS bundle
- `assets/page-editor.js` — **[GRAPESJS-BLOCKS]** 6 nouveaux blocs Bootstrap (Carousel, Accordéon, Jumbotron, Liste groupée, Alerte, Onglets) ; composant custom `carousel-img` avec traits src/alt ; Bootstrap JS ajouté au canvas

### [MODIF]
- `src/Controller/Admin/PageCrudController.php` — **[FIX]** `cleanHtml()` décode les échappements Unicode `\uXXXX` → UTF-8
- `assets/page-editor.js` — **[STYLE-MANAGER]** Ajout `text-shadow` (5 niveaux : légère/moyenne/forte/claire) ; **[FIX]** Dégradés avec `var(--grad-start)`/`var(--grad-end)` + recalcul automatique ; **[FIX]** syncBgToStyleManager détecte et convertit les couleurs ; **[BLOC]** ✨ Hero avec halo ; **[FIX]** Extraction body avant setComponents
- `config/menu.json` — **[MODIF]** URL « Journées d'études » : `#` → `/journees-detudes`
- `.env.local` — **[MODIF]** Configuration PostgreSQL locale restaurée
- `assets/page-editor.js` — **[BLOC]** Nouveau bloc `comp-card-accent` (« 🃏 Carte accent ») : icône + titre + description + bouton, bordure supérieure colorée personnalisable
- `assets/page-editor.js` — **[FIX]** Tous les blocs rebuild utilisent `addStyle()` au lieu de `setStyle()` pour éviter l'écrasement de propriétés
- `src/Controller/Admin/PageCrudController.php` — **[FIX]** Remplacement du sanitizer Symfony par `cleanHtml()` (préserve formulaires)
- `assets/page-editor.js` — **[FIX]** Bouton « ✓ Terminer » soumet maintenant le formulaire (`page-form.submit()`)
- `assets/page-editor.js` — **[CANVAS]** URL CSS dynamique via `data-cncdp-css` (AssetMapper)
- `templates/admin/page_editor.html.twig` — Data attribute `data-cncdp-css` pour l'URL du CSS
- `templates/pages/dynamic.html.twig` — Simplifié (injection formulaire retirée)
- `templates/base.html.twig` — **[FIX]** Intégrité jQuery erronée retirée
- `assets/styles/cncdp.css` — **[HEADER]** Largeur max 1320px, espacements réduits
- `config/packages/html_sanitizer.yaml` — **[FIX]** `allow_elements` + `style` ajoutés (note: le sanitizer n'est plus utilisé pour les pages)
- `config/menu.json` — **[MODIF]** URL « Journées d'études » : `#` → `/journees-detudes`
- `config/menu.json` — Refonte avec 7 entrées (Accueil, Code, Adhésion, CNCDP, Avis, Formations, Contact) [session antérieure]
- `src/Controller/PageController.php` — Passage de l'objet `page` au template

### [DEL]
- Aucune suppression

### [RESTRUCTURE]
- Aucune restructuration

---

## Section État

### ✅ Terminé
- **Déploiement Infomaniak** : site en ligne sur https://gperontest.online, CI/CD GitHub Actions, MySQL, SSH
- **7 pages en ligne** avec contenu officiel (Accueil, Le CNCDP, Adhésion, Avis consultatifs, Journées d'études, Formations, Contact)
- **Système Avis** : entités Avis/Critere/CritereValeur, CRUD admin complet, import PDF avec taguage, filtres dynamiques (admin gérables sans code), partie publique (recherche, filtres, fiches, téléchargement PDF)
- **Hero uniformisé** sur toutes les pages (dégradé 3 tons + halos + text-shadow)
- **Style Manager enrichi** : text-shadow, dégradés éditables via CSS variables, détection auto du type de fond
- **Nouveau bloc** ✨ Hero avec halo
- **Fix éditeur** : extraction body, .htaccess commité, importmap.php dans CI
- **Fix accents** : cleanHtml() décode Unicode + données existantes corrigées
- **Dashboard dynamique** : compteurs pages publiées et avis publiés calculés depuis la BDD
- **Menu et Footer** : liens « Avis consultatifs » et « Index des avis » corrigés

### 🚧 En cours
- **Entité Organization** : page admin Organisations encore statique (3 entrées en dur). À finaliser.

### ⚠️ Attention
- **Dette technique — styles en doublon CSS + JS** : les styles des blocs sont appliqués à la fois en CSS et en JavaScript (`applyBlockStyles()` via `setInterval` 500ms) car GrapesJS écrase les styles CSS par des styles inline.
- **Pas de tests** unitaires/fonctionnels
- **Interactions JS dans le canvas inopérantes** — GrapesJS intercepte les clics pour la sélection. Le carrousel/accordéon ne fonctionnent pas dans l'éditeur
- **`identity_generation_preferences` PostgreSQL** dans `doctrine.yaml` — sans impact sur MySQL, à nettoyer à terme
- **MDP MySQL sans caractères spéciaux** obligatoire (les `$` causent des conflits d'échappement en cascade : DotEnv → Shell → URL)
- **`fix_unicode_final.php`** commité par erreur dans Git — à nettoyer
- CSP warning : `data:application/javascript` bloqué (Stimulus/Turbo)

### [À VÉRIFIER]
- Test du carrousel avec de vraies images (les placeholders placehold.co fonctionnent-ils ?)
- Comportement du carrousel sur mobile (Bootstrap 4 responsive)
- Pas de conflit entre Bootstrap JS du canvas GrapesJS et l'éditeur lui-même
- Compatibilité CSP si le site déploie une Content Security Policy stricte (scripts CDN dans l'iframe)

---

## Section Next Step

**Prochaine action prioritaire :** Créer l'entité `Organization` avec migration Doctrine et finaliser la page admin Organisations (CRUD).

---

## Section Décisions importantes

Décision : Ne pas migrer vers GrapesJS Studio SDK
Date : 19/07/2026
Raison : Le SDK nécessite une licence payante pour un domaine public. L'interface a été rapprochée visuellement du Studio tout en conservant GrapesJS open-source gratuit. Le SDK utilise React et un build step npm, incompatible avec notre stack AssetMapper sans build.

Décision : Thème sombre aligné sur la sidebar admin (#2d2540) pour l'éditeur
Date : 19/07/2026
Raison : Cohérence visuelle avec le back-office. Les blocs ont un fond #372e4a avec bordures terracotta #d4845a. Le texte est en #c4bdd4 pour la lisibilité.

Décision : Application des styles de blocs en JavaScript (setInterval 500ms)
Date : 19/07/2026
Raison : GrapesJS applique des styles inline qui écrasent le CSS. La seule façon fiable de garantir l'uniformité visuelle est de réappliquer les styles en JS périodiquement. Dette technique assumée en l'absence d'API GrapesJS pour le styling des blocs.

Décision : Abandon de l'outil Grille de mise en page
Date : 18/07/2026
Raison : Redondant avec les blocs Row/Column natifs de GrapesJS. L'outil créait des conteneurs CSS Grid incohérents avec Bootstrap 4.6 utilisé sur tout le site. Complexité inutile pour l'utilisateur final. Code documenté dans `Docs_technique/09-grille.md` pour référence future.

Décision : Migration GrapesJS 0.21.10 → 0.23.2
Date : 18/07/2026
Raison : Accès aux Symbols (composants réutilisables), dynamic plugins, nested CSS rules, meilleures performances. Aucune régression constatée.

Décision : Bootstrap 4.6 comme framework CSS unique du site (front + admin + éditeur)
Date : 16/07/2026
Raison : Uniformité visuelle entre l'éditeur GrapesJS et le site publié. Les blocs Bootstrap sont disponibles dans l'éditeur.

Décision : jQuery + Bootstrap JS chargés via CDN sur le front (et dans le canvas GrapesJS)
Date : 16/07/2026
Raison : Les composants interactifs Bootstrap (carousel, accordéon, onglets) nécessitent jQuery et Bootstrap JS. Pas d'alternative sans JS.

Décision : Route `/{slug}` avec priorité -10 pour les pages dynamiques
Date : 16/07/2026
Raison : Permet à toute page publiée d'être accessible sans créer une route par page. La priorité basse évite les conflits avec les routes admin et assets.

Décision : Composant custom `carousel-img` plutôt que d'utiliser le type `image` par défaut de GrapesJS
Date : 16/07/2026
Raison : Le type `image` natif n'était pas détecté dans le HTML du carrousel. Un type custom garantit les champs URL et alt éditables.

Décision : Documentation technique exhaustive de GrapesJS comme référence unique pour le projet
Date : 17/07/2026
Raison : La documentation officielle (24 pages) a été intégralement lue et synthétisée dans `Docs_technique/07-grapesjs.md`. Ce document sert de référence unique pour toute modification future de l'éditeur. Chaque module documenté pointe vers sa source officielle.

Décision : Palette de couleurs chaudes (terracotta #d4845a / brun #3d322d) pour l'éditeur
Date : 18/07/2026
Raison : Remplacer le violet froid (#2d2540) par une palette chaleureuse et professionnelle. Cohérent avec l'identité CNCDP tout en étant plus accueillant. Les blocs customs CNCDP utilisent aussi le terracotta.

Décision : Tailles de police en `rem` pour le RTE
Date : 18/07/2026
Raison : Unité responsive qui s'adapte aux préférences utilisateur et au zoom navigateur. Remplace les tailles HTML 1-7 obsolètes. Appliquées via `addStyle()` pour persistance dans le modèle GrapesJS.

Décision : Outil Grille 12 colonnes plutôt que le plugin Toolbox
Date : 18/07/2026
Raison : Le plugin Toolbox (0 avis, 2023) n'est pas fiable et fait trop de choses. Notre outil sur mesure est centré sur le besoin réel : dessiner des zones de mise en page comme dans un tableur. Approche Bootstrap row+col pour le responsive.

---

## 📍 Next Step

Créer l'entité `Organization` avec migration Doctrine et finaliser la page admin Organisations (CRUD : ajout, modification, suppression, upload logo).

---

> Dernière mise à jour : 22/07/2026 — Session [DEPLOY] [PAGES] [STYLE] [GRAPESJS] [FIX]

### Session [GRAPESJS-UX-COMPLETION] — 19/07/2026

**Objectif :** Finaliser l'UX GrapesJS : Style Manager, compositions, bugs de liaison, couleurs.

**Résumé :**
- Style Manager : 7 secteurs → 5 en français (Apparence, Texte, Espacement, Bordure, Taille)
- Dégradés : 2 pipettes + direction via CSS custom properties
- Classes CSS masquées du SelectorManager
- Noms composants en français via getName() (Titre, Texte, Image, Lien, Bouton...)
- Boutons Monter/Descendre (↑↓) dans la toolbar avec préservation des styles
- Colonnes Bootstrap : XS/SM/MD/LG/XL → Largeur en %
- 5 compositions : Bannière Hero, Cartes x3, Texte+Image, Chiffres Clés, Contact Split
- Classes uniques sur tous les éléments répétés (23+ corrections)
- Couleurs CNCDP uniformisées sur tous les templates
- Correction bg-light (conflit !important Bootstrap)
- 2 nouveaux templates : Visuel+Texte, Cartes en Escalier (total 14)
- Docs_technique/07-grapesjs.md mis à jour

**⚠️ Règles GrapesJS à retenir :**
- Toujours ajouter une classe unique à chaque élément répété dans un template
- Éviter les styles inline → convertis en règle ID non écrasable
- avoidInlineStyle: false est ignoré par GrapesJS 0.23.2
