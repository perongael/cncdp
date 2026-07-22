# Éditeur visuel GrapesJS

> Créé le 17/07/2026 — Session [INIT-DOC]
> Enrichi le 17/07/2026 — Session [DOC-GRAPESJS] à partir de la documentation officielle grapesjs.com/docs

---

## Présentation

> 📖 [Introduction officielle](https://grapesjs.com/docs/)

GrapesJS est un **framework d'édition visuel WYSIWYG open-source** (multi-purpose Web Builder Framework) intégré au back-office CNCDP. Il permet aux administrateurs de créer et modifier les pages du site par glisser-déposer, sans écrire de code HTML/CSS.

Contrairement à un simple page builder, GrapesJS est conçu pour être intégré dans des CMS et permet de créer des builders pour tout type de contenu HTML-like (pages web, newsletters, templates d'emails, etc.).

Le rendu dans l'éditeur est fidèle au site public grâce au chargement de Bootstrap 4.6 et FontAwesome 6 dans le canvas.

**Version utilisée :** 0.23.2 (migré depuis 0.21.10 le 18/07/2026)

---

## Concepts fondamentaux

> 📖 [Components](https://grapesjs.com/docs/modules/Components.html) — [Getting Started](https://grapesjs.com/docs/getting-started.html)

GrapesJS repose sur une architecture **Model-View** (Backbone.js) :

| Concept | Rôle | Équivalent DOM |
|---|---|---|
| **Component (Model)** | Source de vérité des données. Stocke les propriétés, attributs, enfants. Produit le HTML final. | Élément DOM + état |
| **ComponentView (View)** | Rendu visuel dans le canvas. Peut différer du Model (ex: placeholder pour iframe vidéo). | Rendu visuel |
| **Component Definition** | Représentation JSON intermédiaire entre HTML parsé et Model. Équivalent d'un Virtual DOM. | AST HTML |
| **Component Type** | Classe de composant avec comportements spécifiques (image, texte, input…). | `HTMLImageElement`, etc. |
| **Traits** | Propriétés éditables d'un composant (attributs HTML ou propriétés custom). | Attributs HTML |
| **Blocks** | Éléments glissables dans la palette, connectés à un ou plusieurs Components. | Palette d'outils |

### Flux de transformation HTML → Component

```
Chaîne HTML
    │
    ▼ Parsing
Component Definition (JSON)  ──►  { tagName, attributes, components[], type }
    │
    ▼ Component Recognition (isComponent)
Type attribué (image, text, default…)
    │
    ▼ Instanciation
Component (Model)  ←──  Source de vérité
    │
    ▼ Rendu
ComponentView  ←──  Affichage canvas (peut différer du Model)
    │
    ▼ Export
HTML final (editor.getHtml())  ←──  Depuis le Model, pas la View
```

### Glossaire rapide

| Terme | Définition |
|---|---|
| **Wrapper** | Composant racine invisible qui contient tout le contenu du canvas. Équivalent de `<body>`. Accessible via `editor.getWrapper()`. |
| **Component** | Élément du template (div, image, texte…). Source de vérité pour le HTML exporté. |
| **Block** | Élément glissable depuis la palette. Connecté à un Component. |
| **Trait** | Propriété éditable d'un composant (attribut HTML ou propriété custom). Visible dans le panneau Settings. |
| **Style Manager** | Interface de stylisation CSS par propriétés (largeur, couleur, marge…). |
| **Device Manager** | Gestion des breakpoints responsive (desktop, tablette, mobile). |
| **Selector Manager** | Gestion des classes CSS et des états (:hover, :active…). |
| **Project Data** | JSON complet de l'état du projet (pages, styles, assets). Format de persistance recommandé. |
| **Canvas** | L'iframe isolée où le contenu est rendu et édité. |
| **Command** | Fonction centralisée, traçable et extensible (ex: undo, copy, custom). |
| **RTE** | Rich Text Editor — éditeur de texte enrichi activé au double-clic sur un texte. |
| **`getHtml()` vs `toHTML()`** | `editor.getHtml()` exporte tout le canvas (wrapper inclus). `component.toHTML()` exporte un composant spécifique (sans wrapper). Utiliser `editor.getHtml({ component })` pour une page spécifique. |

---

## Architecture d'intégration dans CNCDP

```
┌────────────────────────────────────────────────────┐
│              admin/page_editor.html.twig            │
│  ┌──────────────────────────────────────────────┐  │
│  │          #editor-overlay (fullscreen)         │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │  #editor-topbar (barre d'actions)       │  │  │
│  │  │  [Fermer] [Titre]  [💾 Enreg.] [✓ Fin] │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │         #gjs (canvas GrapesJS)          │  │  │
│  │  │  ┌──────┬──────────────────────────┐   │  │  │
│  │  │  │Blocs │   Zone de travail        │   │  │  │
│  │  │  │      │   (iframe sandbox)       │   │  │  │
│  │  │  │CNCDP │                          │   │  │  │
│  │  │  │Boots.│   Bootstrap 4.6 + FA6    │   │  │  │
│  │  │  │      │   jQuery + BS JS         │   │  │  │
│  │  │  └──────┴──────────────────────────┘   │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  <form> ── champs cachés html_content, grapesjs_data │
└────────────────────────────────────────────────────┘
```

---

## Dépendances CDN

Toutes les dépendances sont chargées via CDN jsDelivr, **aucune installation npm**.

| Librairie | Version | Usage | Chargé dans |
|---|---|---|---|
| `grapes.min.js` + `grapes.min.css` | 0.23.2 | Éditeur principal | Page admin |
| `grapesjs-blocks-basic` | 1.0.2 | Blocs de base (texte, image, vidéo…) | Page admin |
| `grapesjs-preset-webpage` | 1.0.2 | Preset page web (navbar, sections…) | Page admin |
| `grapesjs-blocks-bootstrap4` | 0.2.5 | Blocs Bootstrap 4 (grille, cartes, badges…) | Page admin |
| Bootstrap 4.6 CSS | 4.6.2 | Styles dans le canvas et la page admin | Canvas + Page admin (hérité de `base_admin`) |
| FontAwesome 6 | 6.5.1 | Icônes dans le canvas | Canvas |
| jQuery slim | 3.6.4 | Nécessaire à Bootstrap JS | Canvas |
| Bootstrap JS bundle | 4.6.2 | Composants interactifs (carousel, accordéon…) | Canvas |

### Note sur le chargement

Les scripts du canvas (`canvas.scripts`) sont exécutés **dans l'iframe du canvas** (contexte isolé). Ils ne font PAS partie du `document` principal de la page admin. C'est pourquoi jQuery et Bootstrap JS doivent être explicitement listés dans `canvas.scripts` — ils ne sont pas hérités de la page hôte.

> ⚠️ **Important — Interactions JS dans le canvas :** GrapesJS intercepte les clics pour la sélection des composants. Même avec Bootstrap JS correctement chargé, les interactions comme le défilement du carrousel ou l'ouverture d'un accordéon peuvent ne **pas fonctionner** dans l'éditeur. Le clic est capturé par GrapesJS avant d'atteindre le composant Bootstrap. Pour tester les interactions : utiliser le mode prévisualisation (`core:preview`) ou publier la page.

> ⚠️ **Content Security Policy (CSP) :** Si le site déploie un CSP strict, les scripts CDN chargés dans l'iframe canvas seront bloqués. Vérifier la configuration CSP pour autoriser `cdn.jsdelivr.net`, `code.jquery.com`, `cdnjs.cloudflare.com`.

---

## Initialisation

L'éditeur est initialisé dans `assets/page-editor.js` au clic sur le bouton **"Modifier le contenu avec l'éditeur visuel"**.

```javascript
editorInstance = grapesjs.init({
    container: "#gjs",
    fromElement: false,           // Ne pas parser le DOM existant
    height: "100%",
    width: "auto",
    storageManager: {
        type: "indexeddb",        // Stockage local navigateur
        autosave: false           // Pas d'autosave automatique
    },
    plugins: [
        "gjs-blocks-basic",
        "grapesjs-preset-webpage",
        "grapesjs-blocks-bootstrap4"
    ],
    pluginsOpts: {
        "gjs-blocks-basic": {},
        "grapesjs-preset-webpage": {},
        "grapesjs-blocks-bootstrap4": {}
    },
    canvas: {
        styles: [
            "https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css",
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        ],
        scripts: [
            "https://code.jquery.com/jquery-3.6.4.slim.min.js",
            "https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"
        ]
    },
    projectData: initialData      // Données JSON de restauration
});
```

### Points clés

- `fromElement: false` : l'éditeur part d'un état vierge ou restauré, il ne parse pas le HTML du `<div id="gjs">`
- `storageManager` configuré en `indexeddb` mais avec `autosave: false` — la sauvegarde est manuelle
- `projectData` : si la page a déjà du contenu, le JSON `grapesjsData` est injecté pour restaurer l'état complet (blocs, styles, structure)
- Les plugins sont chargés **avant** le fetch des composants (important pour l'ordre d'initialisation)

---

## Canvas (iframe)

Le canvas est l'iframe dans laquelle le contenu est rendu. Il est isolé du document principal.

### CSS chargés dans le canvas
- **Bootstrap 4.6.2** — pour que les blocs Bootstrap soient correctement stylisés
- **FontAwesome 6.5.1** — pour les icônes dans le contenu

### JS chargés dans le canvas
- **jQuery 3.6.4 slim** — prérequis de Bootstrap JS
- **Bootstrap 4.6 JS bundle** — pour les composants interactifs : carousel (`data-ride`), accordéon (`data-toggle="collapse"`), onglets (`data-toggle="tab"`), alertes (`data-dismiss="alert"`)

> **Important :** les scripts canvas suivent l'approche **template-related** (dépendances globales au template). Le JS n'est actif que dans le canvas. Sur le site publié, les mêmes scripts sont chargés dans `templates/base.html.twig`. L'éditeur ne les inclut PAS dans le HTML exporté — c'est au template front de les fournir.

---

## Module Components (DomComponents)

> 📖 [Components](https://grapesjs.com/docs/modules/Components.html) — [API Components](https://grapesjs.com/docs/api/components.html) — [API Component](https://grapesjs.com/docs/api/component.html)

Le module `DomComponents` est le cœur de GrapesJS. Il gère les types de composants, leur reconnaissance, leur modèle et leur vue.

### Component Definition

Représentation JSON intermédiaire entre HTML et Component :

```javascript
{
  tagName: 'div',
  type: 'image',            // Type de composant
  attributes: { src: '...' },
  components: [             // Enfants
    { type: 'textnode', content: 'Hello' }
  ]
}
```

### Component Recognition (isComponent)

Quand du HTML est parsé, GrapesJS détermine le `type` en parcourant la **pile de types** (Component Type Stack) du haut vers le bas. Chaque type définit une méthode `isComponent(el)` qui retourne `true` si l'élément correspond.

Les types personnalisés sont ajoutés **en haut de la pile** et ont priorité sur les types natifs.

```
Pile de types (ordre de priorité) :
  carousel-img (custom)     ← vérifié en premier
  my-input-type (custom)
  ...
  cell, row, table          ← types table
  map, link, label          ← types sémantiques
  video, image, script, svg ← types médias
  textnode, text            ← types texte
  default                   ← fallback (vérifié en dernier)
```

On peut aussi forcer un type sans passer par `isComponent` :
- En passant un objet `{ type: 'mon-type', ... }` au lieu d'un string HTML
- En utilisant l'attribut `data-gjs-type="mon-type"` dans le HTML

### Model (source de vérité)

Le Model stocke les données du composant. Toute modification du Model se répercute sur la View et sur le HTML exporté.

```javascript
// Lecture
component.get('tagName');
component.getAttributes();
component.components();  // Enfants

// Écriture
component.set('tagName', 'section');
component.addAttributes({ title: 'Test' });
component.components('<div>Nouveau contenu</div>');

// Recherche dans les enfants
component.find('.ma-classe[data-type="x"]');
```

### View (rendu canvas)

La View gère l'affichage dans le canvas. Elle peut différer du Model :
- **TextComponent** : la View ajoute un RTE (Rich Text Editor) au double-clic
- **VideoComponent** : la View désactive les interactions avec l'iframe et ajoute un wrapper
- **Notre carousel-img** : la View ne change rien, le Model suffit

### Cycle de vie des composants

| Hook local | Hook global | Quand |
|---|---|---|
| `model.init()` | `component:create` | Initialisation du modèle |
| `view.init()` | — | Initialisation de la vue |
| `view.onRender()` | `component:mount` | Rendu dans le canvas |
| `model.updated()` | `component:update` | Propriété modifiée |
| — | `component:update:{prop}` | Propriété spécifique modifiée |
| `model.removed()` | `component:remove` | Composant supprimé |

### Component-first styling

Par défaut, quand on stylise un composant via le Style Manager, les changements s'appliquent à **tous** les composants partageant les mêmes classes (ex: toutes les `.card`).

**Solution :** l'option `selectorManager.componentFirst` force GrapesJS à cibler l'ID unique du composant (`#c1234`) plutôt que sa classe (`.card`). Les styles ne s'appliquent alors qu'au composant sélectionné.

```javascript
grapesjs.init({
  selectorManager: {
    componentFirst: true,
  },
});
```

> ✅ **Activé dans CNCDP** (21/07/2026) — configuré dans `assets/page-editor.js`.  
> Le panneau « Classes CSS » du Selector Manager est masqué pour les utilisateurs non techniques (`.gjs-clm-tags`, `.gjs-clm-sels` → `display:none`).

---

## Module Traits

> 📖 [Traits](https://grapesjs.com/docs/modules/Traits.html) — [API Trait](https://grapesjs.com/docs/api/trait.html)

Les Traits sont les propriétés éditables d'un composant, visibles dans le panneau Settings (⚙️). Par défaut, un trait modifie un **attribut HTML** du composant.

### Types de traits natifs

| Type | UI | Options notables |
|---|---|---|
| `text` | Champ texte (défaut) | `placeholder` |
| `number` | Champ nombre | `min`, `max`, `step` |
| `checkbox` | Case à cocher | `valueTrue`, `valueFalse` |
| `select` | Liste déroulante | `options: [{id, label}]` |
| `color` | Sélecteur de couleur | — |
| `button` | Bouton d'action | `command`, `text` |

### Traits dans le projet CNCDP

Notre composant `carousel-img` utilise deux traits `text` :
```javascript
traits: [
    { type: "text", label: "URL de l'image", name: "src", placeholder: "https://..." },
    { type: "text", label: "Texte alternatif", name: "alt" }
]
```

Le trait `href` est injecté dynamiquement sur les `<button>` car le type natif n'en a pas. Le code exact dans `page-editor.js` :

```javascript
var bt = editorInstance.DomComponents.getType("button");
if (bt) {
    var hasHref = bt.model.prototype.defaults.traits.some(function(t) { return t.name === "href"; });
    if (!hasHref) {
        bt.model.prototype.defaults.traits.unshift({
            type: "text",
            label: "Lien (href)",
            name: "href",
            placeholder: "https://..."
        });
    }
}
```

### Traits liés aux propriétés (changeProp)

Par défaut, un trait modifie un attribut HTML. Avec `changeProp: true`, il modifie une **propriété du modèle** :

```javascript
traits: [{
    name: 'placeholder',
    changeProp: true,  // Modifie model.get('placeholder') au lieu de l'attribut
}]
```

### Catégories de traits

On peut grouper les traits en catégories :
```javascript
traits: [
    { name: 'trait-1', category: { id: 'first', label: 'Général' } },
    { name: 'trait-2', category: { id: 'second', label: 'Avancé', open: false } },
]
```

---

## Module Blocks

> 📖 [Blocks](https://grapesjs.com/docs/modules/Blocks.html) — [API Block Manager](https://grapesjs.com/docs/api/block_manager.html)

Les Blocks sont des éléments réutilisables dans la palette de gauche.

### Types de contenu de block

| Approche | Format | Usage |
|---|---|---|
| **Component-oriented** (recommandé) | `{ type: 'image' }` | Contrôle fin, propriétés typées |
| **HTML string** | `'<div>...</div>'` | Liberté utilisateur, parsing automatique |
| **Mixte** | `[{ type: 'image' }, '<div>...</div>']` | Combinaison des deux |

### Bonnes pratiques officielles

- ✅ **Préférer l'approche component-oriented** : plus de contrôle, JSON plus léger
- ✅ **Définir les styles dans les Components, pas dans les Blocks** — évite les conflits et les styles orphelins
- ✅ **Éviter les propriétés non-sérialisables** (fonctions) dans les blocks — elles disparaissent après sauvegarde/chargement
- ❌ **NE PAS mettre de `<style>` dans le HTML des blocks** — l'éditeur ne peut pas nettoyer ces styles si les éléments sont supprimés

---

## Blocs personnalisés CNCDP

> 🔄 Refonte complète le 19/07/2026 — Tous les blocs natifs des plugins sont supprimés et remplacés par des blocs customs organisés en 6 catégories françaises. Les IDs des blocs interactifs (carrousel, accordéon, onglets) sont générés aléatoirement pour éviter les conflits.

### 📐 Mise en page (9 blocs)

| Nom | Icône | Rendu |
|---|---|---|
| **Section** | 📄 | `<section>` avec container, titre centré et sous-titre |
| **Séparateur** | ➖ | `<hr>` stylisé terracotta |
| **2 Col. 50/50** | ▦ | `.row` > `.col-md-6` × 2 |
| **2 Col. 25/75** | ▦ | `.row` > `.col-md-3` + `.col-md-9` |
| **2 Col. 75/25** | ▦ | `.row` > `.col-md-9` + `.col-md-3` |
| **3 Colonnes** | ▦ | `.row` > `.col-md-4` × 3 |
| **4 Colonnes** | ▦ | `.row` > `.col-md-3` × 4 |
| **Lien Carte** | 🔗 | Card entière cliquable avec icône + titre + description |
| **Image + Texte** | 🖼️ | Image + texte côte à côte |

### 🎨 Composants (6 blocs)

| Nom | Icône | Composant Bootstrap | IDs |
|---|---|---|---|
| **Carrousel** | 🎠 | `.carousel` avec 3 slides | ✅ Générés aléatoirement |
| **Accordéon** | 📂 | `.accordion` avec 3 `.card` pliables | ✅ Générés aléatoirement |
| **Bandeau** | 📢 | `.jumbotron` avec titre, texte, bouton | — |
| **Liste groupée** | 📋 | `.list-group` avec 5 éléments | — |
| **Alerte** | ⚠️ | `.alert-warning` avec bouton fermeture | — |
| **Onglets** | 📑 | `.nav-tabs` avec 3 onglets + contenu | ✅ Générés aléatoirement |

### 📝 Texte (4 blocs)

| Nom | Icône | Rendu |
|---|---|---|
| **Titre** | 📌 | `<h2>` avec poids 700 et couleur sombre |
| **Paragraphe** | ¶ | `<p>` formaté (interligne 1.7, couleur #495057) |
| **Citation** | 💬 | `<blockquote>` avec barre latérale terracotta, fond beige |
| **Texte mis en avant** | 📢 | `<p class="lead">` en 1.25rem, graisse 300 |

### 🖼️ Médias (2 blocs)

| Nom | Icône | Rendu |
|---|---|---|
| **Image** | 🖼️ | `<img>` responsive avec placeholder, coins arrondis |
| **Vidéo** | 🎬 | `<div>` embed responsive 16:9 (YouTube) |

### 🔗 Navigation (2 blocs)

| Nom | Icône | Rendu |
|---|---|---|
| **Bouton** | 🔘 | `<a class="btn btn-lg">` stylisé terracotta |
| **Lien** | 🔗 | `<a>` simple couleur terracotta |

### 📋 Formulaire (4 blocs)

| Nom | Icône | Rendu |
|---|---|---|
| **Champ texte** | ✏️ | `<div class="form-group">` avec label + `<input>` |
| **Zone de texte** | 📝 | `<div class="form-group">` avec label + `<textarea>` |
| **Case à cocher** | ☑️ | `<div class="form-check">` avec label |
| **Bouton envoi** | 🚀 | `<button type="submit">` stylisé terracotta |

### Supprimés

| Ancienne catégorie | Raison |
|---|---|
| 🧭 CNCDP (3 blocs) | Supprimé |
| Basic, Media, Layout, Typography, Components, Extra | Blocs natifs des plugins — remplacés |
| Forms (blocs natifs) | Conservé le plugin, remplacé les blocs |

---

## Composant custom `carousel-img`

Identique à la version précédente. Les images du carrousel utilisent `data-gjs-type="carousel-img"` pour les traits d'édition **URL** et **Texte alternatif**.

---

## Galerie de templates

Accessible via le bouton 🖼️ dans la barre d'outils. Implémentée via une **commande custom** `open-gallery`.

### Fonctionnement

- **8 templates** prédéfinis, affichés par groupes de 4
- Navigation page par page (flèches ◀ ▶)
- Prévisualisation en iframe avec Bootstrap + FontAwesome appliqués
- Application : remplace tout le contenu via `editor.setComponents()`

### Templates disponibles

| Clé | Nom |
|---|---|
| `hero` | Hero + colonnes |
| `landing` | Landing page |
| `about` | À propos |
| `code` | Code de déontologie |
| `faq` | FAQ |
| `contact` | Contact |
| `testimonials` | Témoignages |
| `homepage` | Page d'accueil CNCDP |

### Template "Page d'accueil CNCDP"

Le template `homepage` est chargé dynamiquement depuis `assets/template-homepage.js` via `window.__cncdp_homepage_html`. C'est une reproduction fidèle de la maquette d'accueil (hero, mission, accès rapides, actualités).

---

## Mécanisme de sauvegarde

### Deux modes

| Mode | Déclencheur | Comportement |
|---|---|---|
| **Sauvegarde progressive** | Bouton 💾 "Enregistrer" dans la topbar | AJAX POST → sauvegarde sans fermer l'éditeur |
| **Sauvegarde finale** | Bouton ✓ "Terminer l'édition" | Sauvegarde + fermeture de l'overlay |

### Flux de données

```
Éditeur GrapesJS
      │
      ▼
  sync()
      │
      ├── editor.getHtml()  ──► html_content  (HTML + <style> fusionné)
      ├── editor.getCss()   ──► inclus dans html_content
      └── editor.getProjectData() ──► grapesjs_data (JSON)
                                          │
                                          ▼
                               Champs cachés du formulaire
                                          │
                                          ▼
                               POST → PageCrudController::handleSave()
```

### Détail de `sync()`

1. Récupère le HTML du canvas via `editor.getHtml()`
2. Récupère le CSS via `editor.getCss()`
3. Injecte une règle `body` par défaut (police Inter, couleur #212529)
4. Assemble le tout : `<!DOCTYPE html><html><head><style>…</style></head>…</html>`
5. Stocke dans `#html-content`
6. Stocke `editor.getProjectData()` (JSON) dans `#grapesjs-data`

### Sauvegarde AJAX

La sauvegarde progressive utilise `XMLHttpRequest` avec `X-Requested-With: XMLHttpRequest`. Le contrôleur détecte cet en-tête et retourne du JSON au lieu de rediriger. Un toast confirme : `✔ Sauvegarde en base`.

---

## Module Storage Manager

> 📖 [Storage Manager](https://grapesjs.com/docs/modules/Storage.html) — [API Storage](https://grapesjs.com/docs/api/storage_manager.html)

Le Storage Manager gère la persistance des données du projet.

### Configuration dans CNCDP

```javascript
storageManager: {
    type: "indexeddb",   // Stockage local navigateur (via plugin externe)
    autosave: false,     // Désactivé — sauvegarde manuelle uniquement
}
```

> **Note :** le type `"indexeddb"` utilisé dans `page-editor.js` ne fait pas partie des types natifs (`local`, `remote`). Il nécessite le plugin `grapesjs-indexeddb`. Dans les faits, la persistance est assurée par les champs cachés du formulaire, pas par le Storage Manager.

### Project Data

Le JSON retourné par `editor.getProjectData()` contient :
```javascript
{
  assets: [],        // Images uploadées
  styles: [],        // Règles CSS
  pages: [{          // Pages (une seule dans notre cas)
    component: "...",  // HTML de la page
    styles: [...],
  }],
  symbols: [],       // Symboles (non utilisés)
}
```

### Stratégies de stockage

| Type natif | Usage |
|---|---|
| `local` | localStorage du navigateur |
| `remote` | API REST (GET load, POST store) |
| Custom | Implémentation via `editor.Storage.add('nom', { load, store })` |

> **Note CNCDP :** Le `type: "indexeddb"` configuré nécessite le plugin [`grapesjs-indexeddb`](https://github.com/GrapesJS/storage-indexeddb) qui **n'est pas chargé** dans nos CDN. La persistance réelle passe par les champs cachés du formulaire (approche « inline »), pas par le Storage Manager.

### Bonnes pratiques

- `editor.getDirtyCount()` compte les changements depuis la dernière sauvegarde
- `editor.store()` sauvegarde et réinitialise le compteur
- `editor.load()` charge depuis le storage
- **Ne jamais se fier au HTML/CSS comme couche de persistance** — utiliser le JSON du projet (`projectData`)

---

## Module Commands

> 📖 [Commands](https://grapesjs.com/docs/modules/Commands.html) — [API Commands](https://grapesjs.com/docs/api/commands.html)

Les commandes sont des fonctions centralisées, traçables et extensibles.

### Types de commandes

**Commande simple (sans état)**
```javascript
editor.Commands.add('my-command', (editor) => {
    alert('Hello');
});
editor.runCommand('my-command');
```

**Commande avec état (stateful)**
```javascript
editor.Commands.add('my-command', {
    run(editor) { /* activer */ },
    stop(editor) { /* désactiver */ },
});
```

Une commande active ne se ré-exécute pas (sauf avec `{ force: true }`).

### Commandes natives importantes

| Commande | Action |
|---|---|
| `core:component-delete` | Supprimer le composant sélectionné |
| `core:component-enter` | Sélectionner le premier enfant |
| `core:component-exit` | Sélectionner le parent |
| `core:copy` / `core:paste` | Copier/coller |
| `core:preview` | Mode prévisualisation |
| `core:fullscreen` | Plein écran |
| `core:open-code` | Afficher le code exporté |
| `core:undo` / `core:redo` | Annuler/rétablir |
| `core:canvas-clear` | Vider le canvas |

### Événements

```javascript
// Intercepter avant exécution
editor.on('run:my-command:before', (opts) => {
    if (condition) opts.abort = true;  // Bloquer la commande
});
// Après exécution
editor.on('run:my-command', () => { ... });
```

### Commande custom dans CNCDP

`open-gallery` : commande stateful qui ouvre la galerie de templates dans une modale GrapesJS (`editor.Modal`).

---

## Module Style Manager

> 📖 [Style Manager](https://grapesjs.com/docs/modules/Style-manager.html) — [API Style Manager](https://grapesjs.com/docs/api/style_manager.html)

Le Style Manager permet de styliser les composants via des propriétés CSS organisées en secteurs.

> Dans le projet CNCDP, le Style Manager n'est **pas utilisé activement** — le styling passe principalement par les classes Bootstrap et les blocs prédéfinis.

### Types de propriétés

| Type | UI | Usage |
|---|---|---|
| `base` | Champ texte | Valeur CSS simple |
| `number` | Champ nombre + unités | `width`, `padding`… |
| `slider` | Slider | Valeurs numériques |
| `select` | Liste déroulante | Choix parmi options |
| `radio` | Boutons radio | Choix exclusif |
| `color` | Color picker | Couleurs |
| `composite` | Plusieurs sous-champs | Propriétés shorthand (`margin` → top/right/bottom/left) |
| `stack` | Liste empilable | Propriétés multiples (`text-shadow`, `transform`…) |

### Propriétés built-in

GrapesJS fournit des définitions prêtes à l'emploi pour les propriétés CSS courantes : `width`, `min-height`, `padding`, `margin`, `background-color`, `box-shadow`, `font-size`, `color`, `text-align`, etc.

### Contraintes par composant

```javascript
editor.Components.addType('mon-type', {
    model: {
        defaults: {
            stylable: ['width', 'height'],    // Seules ces propriétés disponibles
            unstylable: ['color'],            // Ces propriétés masquées
        },
    },
});
```

---

## Module Assets (Asset Manager)

> 📖 [Assets](https://grapesjs.com/docs/modules/Assets.html) — [API Assets](https://grapesjs.com/docs/api/assets.html)

Le gestionnaire d'assets gère les images et médias.

> Dans le projet CNCDP, l'Asset Manager n'est **pas configuré** (pas d'upload, pas de collection). Les images utilisent des URLs placeholders (placehold.co).

### Fonctionnalités disponibles (non activées)

- **Upload par drag-and-drop** : configurable via `assetManager.upload = 'https://...'`
- **Collections** : globale (`am.getAll()`) et visible (`am.getAllVisible()`)
- **Filtrage par type** : `am.open({ types: ['image'] })`
- **Custom UI** : remplacement complet de l'interface via `asset:custom`

### Événements d'upload

```javascript
editor.on('asset:upload:start', () => { ... });
editor.on('asset:upload:end', () => { ... });
editor.on('asset:upload:error', (err) => { ... });
editor.on('asset:upload:response', (response) => { ... });
```

---

## Module Components & JS

> 📖 [Components & JS](https://grapesjs.com/docs/modules/Components-js.html)

Permet d'attacher des scripts JavaScript aux composants (compteurs, galeries, sliders…).

> Dans le projet CNCDP, cette fonctionnalité n'est **pas utilisée** — les interactions JS passent par Bootstrap data-attributes et les scripts canvas globaux.

### Concept

```javascript
const script = function () {
    alert('Hi');
    this.innerHTML = 'Contenu modifié'; // this = élément DOM
};

editor.Components.addType('comp-with-js', {
    model: {
        defaults: {
            script,
            'script-props': ['prop1', 'prop2'], // Propriétés passées au script
        },
    },
});
```

### Important : scripts dans le canvas

- Les scripts sont exécutés dans l'**iframe du canvas** (contexte isolé)
- Les variables extérieures ne sont **PAS accessibles**
- Les IDs sont générés automatiquement (`#c764`, `#c765`…)
- Les scripts sont ré-exécutés si les `script-props` changent

### Gestion des dépendances

**Template-related** (utilisée dans CNCDP) : scripts chargés globalement dans le canvas
```javascript
canvas: {
    scripts: ['https://.../jquery.min.js'],
}
```

**Component-related** : dépendances chargées dynamiquement par le composant
```javascript
const script = function () {
    if (typeof someLib == 'undefined') {
        const s = document.createElement('script');
        s.onload = () => initLib(this);
        s.src = 'https://.../lib.js';
        document.body.appendChild(s);
    } else {
        initLib(this);
    }
};
```

---

## Module Panels

> 📖 [API Panels](https://grapesjs.com/docs/api/panels.html)

Les panels organisent l'interface utilisateur (boutons, sidebars…).

Dans CNCDP, l'interface par défaut est utilisée. Nous intervenons pour :
- Ajouter le bouton galerie dans le panel `options`
- Activer le panel `views` (blocs) au chargement

```javascript
editorInstance.on("load", function() {
    var b = editorInstance.Panels.getButton("views", "open-blocks");
    if (b) b.set("active", true);
});
```

---

## API Editor — Méthodes clés

> 📖 [API Editor](https://grapesjs.com/docs/api/editor.html)

| Méthode | Description |
|---|---|
| `editor.getHtml({ component })` | Export HTML |
| `editor.getCss({ component })` | Export CSS |
| `editor.getProjectData()` | JSON complet du projet |
| `editor.loadProjectData(json)` | Charger un projet JSON |
| `editor.setComponents(html\|obj)` | Remplacer tout le contenu |
| `editor.addComponents(html\|obj)` | Ajouter du contenu |
| `editor.getSelected()` | Composant sélectionné |
| `editor.select(component)` | Sélectionner un composant |
| `editor.getWrapper()` | Composant racine |
| `editor.getDirtyCount()` | Compteur de modifications |
| `editor.store()` / `editor.load()` | Sauvegarder/charger (storage) |
| `editor.runCommand(id)` | Exécuter une commande |
| `editor.setDevice(name)` | Changer le device (responsive) |
| `editor.on(event, callback)` | Écouter un événement |
| `editor.Modal` | Module de fenêtre modale |
| `editor.Panels` | Gestion des panels UI |
| `editor.Blocks` / `editor.BlockManager` | Gestion des blocs |
| `editor.DomComponents` / `editor.Components` | Gestion des types de composants |
| `editor.Traits` | Gestion des traits |
| `editor.Devices` | Gestion des devices (responsive) |
| `editor.UndoManager` | Gestion de l'historique |
| `editor.Keymaps` | Raccourcis clavier |
| `editor.refresh()` | Recalculer les positions (spots, toolbar). **Essentiel** après `setComponents()` ou modification programmatique du DOM. |

### Différence `getHtml()` vs `toHTML()`

| Méthode | Portée | Usage |
|---|---|---|
| `editor.getHtml()` | Canvas entier (wrapper inclus) | Export final de la page |
| `editor.getHtml({ component })` | Une page spécifique | Export multi-pages |
| `component.toHTML()` | Un composant spécifique (sans wrapper) | Export partiel |
| `component.toHTML({ withProps: true })` | Composant + attributs `data-gjs-*` | Ré-import fidèle dans l'éditeur |

---

## Événements clés

| Événement | Déclenchement |
|---|---|
| `load` | Éditeur chargé et rendu |
| `update` | Tout changement dans le projet |
| `component:create` | Composant créé |
| `component:mount` | Composant rendu dans le canvas |
| `component:update` | Propriété de composant modifiée |
| `component:remove` | Composant supprimé |
| `project:load` | Projet JSON chargé |
| `undo` / `redo` | Annuler / Rétablir |
| `change:device` | Changement de device |

---

## Intégration Twig

Le template `templates/admin/page_editor.html.twig` est utilisé pour la **création** et **l'édition** (`is_new`).

### Structure

```twig
{% extends 'admin/base_admin.html.twig' %}

{# Bloc Informations #}
<form method="post" id="page-form">
    Titre, Slug, Statut (brouillon / publié)

    {# Bloc Contenu #}
    Bouton "Modifier le contenu avec l'éditeur visuel"

    {# Champs cachés #}
    <input type="hidden" name="html_content" …>
    <input type="hidden" name="grapesjs_data" …>
</form>

{# Overlay éditeur (display:none) #}
<div id="editor-overlay">
    <div id="editor-topbar">…</div>
    <div id="gjs"></div>
</div>
```

### Blocs Twig

```twig
{% block stylesheets %}
    {{ parent() }}
    {# CSS GrapesJS + thème sombre CNCDP #}
{% endblock %}

{% block javascripts %}
    {{ parent() }}
    {# JS GrapesJS + plugins + page-editor.js + template-homepage.js #}
{% endblock %}
```

---

## Personnalisation du thème

> 📖 [Theming (Getting Started)](https://grapesjs.com/docs/getting-started.html#theming)
> 🔄 Mis à jour le 19/07/2026 — Refonte interface inspirée du Studio SDK

L'interface GrapesJS est retouchée pour l'identité CNCDP avec une approche inspirée de [GrapesJS Studio](https://app.grapesjs.com/studio) :

- **Topbar personnalisée** (remplace la topbar native GrapesJS masquée via `.gjs-pn-options { display: none }`) :
  - Boutons icônes pour toggler les 4 panneaux : 🧩 Blocs, 📑 Calques, 🎨 Styles, ⚙️ Propriétés
  - Synchronisation bidirectionnelle avec les boutons panels natifs de GrapesJS
  - Boutons Undo/Redo, Aperçu, Code export, Galerie templates
  - Boutons Sauvegarde progressive (💾) et Terminer (✓)
- **Fond clair** (#f5f3f0 / #faf9f7) au lieu du thème sombre précédent (#3d322d)
- **Barre d'état inférieure** : nom du composant sélectionné + compteur de modifications
- **Device switcher** : emplacement réservé pour les boutons responsive natifs GrapesJS
- **RTE** (barre d'édition texte) : fond blanc avec bordures douces (au lieu du fond sombre)

### Palette

| Rôle | Couleur |
|---|---|
| Fond overlay | `#f5f3f0` |
| Fond topbar/statusbar | `#ffffff` |
| Bordures | `#e5e0d8` |
| Texte principal | `#44403c` |
| Texte secondaire | `#78716c` |
| Accent (terracotta) | `#d4845a` |
| Hover boutons | `#f0ede8` |

### Approche avec CSS custom properties (recommandé par la doc officielle)

```css
:root {
    --gjs-primary-color: #44403c;
    --gjs-secondary-color: rgba(120,113,108,0.9);
    --gjs-tertiary-color: #f5f3f0;
    --gjs-quaternary-color: #d4845a;
}
```

### Ancienne approche (avant refonte du 19/07/2026)

```css
.gjs-one-bg      { background-color: #2d2540; }  /* Sidebar, panneaux */
.gjs-two-color   { color: #c4bdd4; }              /* Texte secondaire */
.gjs-three-bg    { background-color: #3d3355; }   /* Survol, actif */
.gjs-four-color,
.gjs-four-color-h:hover { color: var(--violet-vif); } /* Accents */
```

---

## Fonctionnalités modifiées / désactivées

- **Autosave activé** (21/07/2026) : sauvegarde AJAX automatique toutes les 60s si modifications en attente + horodatage dans la barre d'état
- **Aperçu responsive** (21/07/2026) : boutons 🖥️/📱/📲 dans la topbar (Desktop / Tablette 768px / Mobile 375px)
- **Confirmation avant suppression** (21/07/2026) : la commande `core:component-delete` demande confirmation avec le nom du bloc
- **Fermeture propre (✕)** (21/07/2026) : affiche le nombre de modifications perdues et restaure l'état sauvegardé via `loadProjectData()`
- **Plugin `grapesjs-custom-code` retiré** (21/07/2026) : risque d'injection HTML arbitraire par des utilisateurs non techniques
- **Bloc Vidéo remplacé** (21/07/2026) : carte cliquable vers la vidéo au lieu d'un iframe (les iframes sont supprimées à la sauvegarde)
- **IndexedDB par page** (21/07/2026) : clé `gjsProject-{pageId}` — plus d'écrasement croisé entre pages
- **CSRF** (21/07/2026) : token `page_save` sur le formulaire, validé dans `handleSave()`
- **Style Manager réorganisé** (21/07/2026) : 6 secteurs (Général, Typographie, Espacement, Bordure & Arrondi, Effets, Taille) ; dégradés retirés (trop fragiles) ; ajout Interligne, Ombre, Transparence
- **Traits jargon retirés** (21/07/2026) : « Identifiant (ID) » et « Titre (attribut) » supprimés des colonnes
- **Intervalles optimisés** (21/07/2026) : les `setInterval` (styles blocs, RTE) ne s'exécutent que si l'overlay est visible
- **Autosave désactivé côté Storage Manager** : la persistance passe par le formulaire + AJAX
- **Blocs natifs des plugins supprimés** (19/07/2026) : remplacés par blocs customs en 7 catégories françaises
- **IDs uniques pour blocs interactifs** (19/07/2026) : carrousel, accordéon, onglets, FAQ génèrent des IDs aléatoires
- **Modification des classes des liens neutralisée** : le prototype `classesChanged` de `<a>` est écrasé
- **Trait `href` ajouté aux boutons**
- **Panel blocs activé par défaut**
- **Topbar native masquée** (19/07/2026) : remplacée par notre topbar personnalisée
- **Barre d'état** (19/07/2026) : composant sélectionné + état sauvegardé/modifié (événementiel, plus de polling)
- **Synchronisation topbar ↔ panels** (19/07/2026)
- ⚠️ **Sanitization HTML minimale** : `cleanHtml()` (regex scripts/on*/iframes) — durcissement via `sanitizeDocument()` + symfony/html-sanitizer préparé dans `PageCrudController` mais non activé (à tester sur les pages existantes d'abord)

---

## Flux utilisateur complet

```
1. Admin sur /admin/pages → clique "Nouvelle page" ou "✏️"
        │
2. Page editor (titre, slug, statut)
        │
3. Clic "Modifier le contenu avec l'éditeur visuel"
        │
4. Overlay plein écran → GrapesJS initialisé
        │
5. Admin glisse-dépose des blocs, édite texte/images
        │
6. Sauvegarde progressive (💾) ou finale (✓)
        │
7. Formulaire soumis → PageCrudController::handleSave()
        │
8. Redirection vers /admin/pages avec message flash
```

---

## Points d'attention

### Compatibilité navigateur
GrapesJS 0.23.2 fonctionne sur tous les navigateurs modernes. Testé principalement sur Chrome.

### Performance
- Chargement initial : plusieurs CDN (~500 KB GrapesJS + plugins)
- Template "Page d'accueil CNCDP" : ~15 KB de HTML inline
- L'IndexedDB est configuré mais non exploité (autosave off)

### Sécurité
- ✅ **Sanitization HTML côté serveur** (19/07/2026) : le composant `symfony/html-sanitizer` nettoie le HTML avant persistance
  - Scripts (`<script>`) et styles (`<style>`) bloqués
  - Event handlers inline (`onclick`, `onerror`…) supprimés
  - Balises dangereuses (`iframe`, `embed`, `object`, `form`…) bloquées
  - Attributs `data-*` Bootstrap et `data-gjs-*` GrapesJS préservés
  - Liens relatifs (`href="#"`) et médias relatifs autorisés
  - Config : `config/packages/html_sanitizer.yaml` (profil `app.page_content`)
  - Intégration : `PageCrudController::handleSave()` — le HTML est nettoyé via `$this->htmlSanitizer->sanitize()` avant `setHtmlContent()`
- ✅ Route protégée par `ROLE_ADMIN`
- ✅ Formulaire protégé par CSRF

### Débogage
1. Console navigateur (F12) pour les erreurs JS
2. Vérifier l'accès aux CDN
3. Ctrl+F5 après mise à jour de `page-editor.js` (cache)
4. Vider l'IndexedDB si l'état local est corrompu

---

## Évolutions envisagées

| Priorité | Évolution | Impact |
|---|---|---|
| ~~🔴 Haute~~ | ~~Sanitization HTML côté serveur~~ ✅ Fait (19/07/2026) — `symfony/html-sanitizer` | Sécurité XSS |
| 🟡 Moyenne | Upload d'images dans l'éditeur (Asset Manager) | UX éditeur |
| ~~🟡 Moyenne~~ | ~~Génération d'IDs uniques pour les blocs Bootstrap~~ ✅ Fait (19/07/2026) | Éviter conflits JS |
| 🟡 Moyenne | Prévisualisation avant publication | Workflow éditorial |
| 🟢 Basse | Blocs customs supplémentaires (timeline, chiffres clés…) | Richesse éditoriale |
| 🟢 Basse | Migration CDN → AssetMapper pour GrapesJS | Cohérence stack |
| 🟢 Basse | Style Manager actif avec secteurs CNCDP (couleurs, typo) | Styling sans code |
| 🟢 Basse | Mode responsive dans l'éditeur (Device Manager) | Prévisualisation mobile |

---

## Module Plugins (création de plugins)

> 📖 [Plugins](https://grapesjs.com/docs/modules/Plugins.html)

Le système de plugins de GrapesJS permet d'encapsuler et de réutiliser des extensions. Un plugin est une **fonction** qui reçoit l'instance `editor` et des options.

### Structure

```js
function myPlugin(editor, options) {
  // Accès à tous les modules : editor.Blocks, editor.Components, etc.
  editor.Blocks.add('my-block', {
    label: 'Simple block',
    content: '<div class="my-block">Hello</div>',
  });
}

const editor = grapesjs.init({
  plugins: [myPlugin],
  pluginsOpts: {
    [myPlugin]: { customField: 'value' }
  },
});
```

### Import depuis NPM ou fichiers

```js
import myPlugin from './plugins/myPlugin';
import npmPackage from '@npm/package';

grapesjs.init({
  plugins: [myPlugin, npmPackage],
});
```

### Usage TypeScript

> ⚠️ `usePlugin` est disponible depuis **v0.22+**. En v0.23.2 (version CNCDP), utiliser `usePlugin` est possible.

```ts
import grapesjs from 'grapesjs';
import type { Plugin } from 'grapesjs';

interface MyPluginOptions { opt1: string; opt2?: number; }
const myPlugin: Plugin<MyPluginOptions> = (editor, options) => { /* ... */ };

grapesjs.init({
  plugins: [myPlugin],
  pluginsOpts: { [myPlugin]: { opt1: 'A', opt2: 1 } },
});
```

### Boilerplate

Utiliser `grapesjs-cli` pour initialiser un projet de plugin avec Webpack/Babel pré-configurés.

> **Note CNCDP :** Nos blocs customs (CNCDP, Bootstrap) sont ajoutés directement dans `page-editor.js` et non via un plugin séparé. Pour une meilleure maintenabilité, il serait recommandé de les extraire en plugins.

---

## Module Pages (multi-pages)

> 📖 [Pages](https://grapesjs.com/docs/modules/Pages.html) — [API Pages](https://grapesjs.com/docs/api/pages.html)

Le module Pages permet de gérer des projets **multi-pages**. Par défaut, une page unique est créée automatiquement.

> **Note CNCDP :** Le projet utilise une seule page (approche mono-page). Le module Pages n'est pas exploité actuellement.

### Initialisation

```js
// Mono-page (ce que fait CNCDP implicitement)
const editor = grapesjs.init({
  components: '<div>Hello</div>',
  style: '.my-el { color: red }',
});

// Équivaut à :
pageManager: {
  pages: [{
    id: 'my-first-page',
    styles: '.my-el { color: red }',
    component: '<div>Hello</div>',  // ⚠️ 'component' (singulier!)
  }],
}

// Multi-pages
pageManager: {
  pages: [
    { id: 'page1', styles: '...', component: '...' },
    { id: 'page2', styles: '...', component: '...' },
  ],
}
```

### API programmatique

```js
const pages = editor.Pages;
pages.getAll();           // Toutes les pages
pages.getSelected();      // Page active
pages.add({ id: 'new' }); // Ajouter
pages.select('new-id');   // Sélectionner
pages.remove('id');       // Supprimer

// HTML/CSS d'une page spécifique
const page = pages.getSelected();
const component = page.getMainComponent();
editor.getHtml({ component });
editor.getCss({ component });
```

> ⚠️ GrapesJS ne fournit **pas d'UI par défaut** pour le Page Manager.

---

## Module Selectors

> 📖 [Selectors](https://grapesjs.com/docs/modules/Selectors.html) — [API Selector Manager](https://grapesjs.com/docs/api/selector_manager.html)

Le Selector Manager gère les **classes CSS** et l'état de la sélection. Il permet la réutilisation des styles entre composants.

> **Note CNCDP :** Non utilisé activement. Les styles passent par les classes Bootstrap.

### Configuration

```js
// Le SelectorManager gère les classes CSS et détermine quel sélecteur
// est utilisé pour les règles de style. Dans CNCDP, componentFirst: true
// garantit que chaque composant est stylé individuellement.
selectorManager: {
  componentFirst: true,  // Style lié au composant (ID), pas à la classe partagée
}
```

Avec `componentFirst: true`, les styles du Style Manager ciblent `#c1234` (ID unique du composant) plutôt que `.card` (classe partagée). Résultat : chaque composant a ses propres styles, sans effet de bord sur les autres.

### API

```js
const sm = editor.SelectorManager;
sm.getSelected();        // Sélecteurs sélectionnés
sm.addSelector('name');  // Ajouter
sm.setState('hover');    // Changer d'état (hover, active…)
```

---

## Module Layers

> 📖 [Layers](https://grapesjs.com/docs/modules/Layers.html) — [API Layer Manager](https://grapesjs.com/docs/api/layer_manager.html)

Le Layer Manager affiche les composants sous forme d'**arborescence** (calques).

> **Note CNCDP :** Non utilisé — l'interface par défaut de GrapesJS inclut déjà les layers mais ils ne sont pas exposés dans notre overlay.

### Configuration

```js
layerManager: {
  root: '#my-root',  // Racine personnalisée
  sortable: false,    // Désactiver le tri
  hidable: false,     // Désactiver le masquage
}
```

---

## Module Modal (fenêtres de dialogue)

> 📖 [Modal](https://grapesjs.com/docs/modules/Modal.html) — [API Modal](https://grapesjs.com/docs/api/modal_dialog.html)

Le module Modal permet d'afficher du contenu dans une fenêtre de dialogue.

> **Note CNCDP :** Utilisé pour la **galerie de templates** (`editor.Modal`).

### API utilisée dans CNCDP

```js
editor.Modal.setTitle('Galerie de templates');
editor.Modal.setContent(renderPage(0));
editor.Modal.open();
editor.Modal.close();
```

### API complète

```js
editor.Modal.isOpen();            // État actuel
editor.Modal.onceClose(() => {}); // Callback à la fermeture
```

### Personnalisation CSS

```css
.gjs-mdl-dialog { background-color: white; }
.my-modal .gjs-mdl-dialog { max-width: 300px; }
```

### Custom Modal (remplacement complet)

```js
modal: { custom: true }
editor.on('modal', (props) => {
  // props.open, props.title, props.content, props.close()
});
```

---

## Module I18n (internationalisation)

> 📖 [I18n](https://grapesjs.com/docs/modules/I18n.html) — [API I18n](https://grapesjs.com/docs/api/i18n.html)

Permet de traduire l'interface de l'éditeur.

> **Note CNCDP :** Non utilisé — l'interface est en français mais les chaînes GrapesJS restent en anglais.

```js
i18n: {
  locale: 'fr',
  localeFallback: 'en',
  messages: { fr: { /* traductions */ } },
}
```

---

## Guide : Symbols (BETA v0.21.11+)

> 📖 [Symbols](https://grapesjs.com/docs/guides/Symbols.html)
> ✅ **Disponible en v0.23.2** (version CNCDP). Nécessite ≥ v0.21.11.

Les **Symbols** permettent de réutiliser des composants : une modification du **Main Symbol** est répliquée sur toutes les **Instances**.

```js
const symbolMain = editor.Components.addSymbol(component); // Créer
const instance = editor.Components.addSymbol(symbolMain);   // Nouvelle instance
editor.Components.detachSymbol(instance);                    // Détacher
component.setSymbolOverride(['prop']);                       // Empêcher propagation
```

> ⚠️ **BETA** — Pas d'UI intégrée. Non utilisé dans CNCDP.

---

## Guide : Replace Rich Text Editor

> 📖 [Replace RTE](https://grapesjs.com/docs/guides/Replace-Rich-Text-Editor.html) — [API RTE](https://grapesjs.com/docs/api/rich_text_editor.html)

Remplace l'éditeur de texte riche (RTE) natif par une bibliothèque tierce (CKEditor, TinyMCE…).

```js
editor.setCustomRte({
  enable(el, rte) { /* initialiser le RTE tiers */ },
  disable(el, rte) { /* désactiver */ },
  getContent(el, rte) { return rte.getData(); },
});
```

> **Note CNCDP :** Le RTE natif de GrapesJS est utilisé (double-clic sur un texte).

---

## Guide : Custom CSS Parser

> 📖 [Custom CSS Parser](https://grapesjs.com/docs/guides/Custom-CSS-parser.html)

Définit un parser CSS personnalisé pour contourner les incohérences du CSSOM navigateur (conversion rgba, réorganisation des valeurs…).

```js
const parserCss = (css, editor) => {
  return [{ selectors: '.class', style: { color: 'red' } }];
};
// Initialisation
parser: { parserCss }
// Ou via API
editor.setCustomParserCss(parserCss);
```

> Utile uniquement si on importe du HTML/CSS externe. Non utilisé dans CNCDP.

---

## Guide : Telemetry

> 📖 [Telemetry](https://grapesjs.com/docs/guides/Telemetry.html)

GrapesJS collecte des données de télémétrie (domaine, version, timestamp). Désactivable :

```js
telemetry: false
```

> Non désactivé dans CNCDP actuellement.

---

## Module Device Manager (responsive)

> 📖 [API Device Manager](https://grapesjs.com/docs/api/device_manager.html)

Le Device Manager permet de prévisualiser le template à différentes largeurs d'écran. Il est **natif** dans GrapesJS — aucune installation requise.

```js
// Configuration
deviceManager: {
  devices: [
    { name: 'Desktop', width: '' },
    { name: 'Tablet', width: '768px', widthMedia: '992px' },
    { name: 'Mobile', width: '320px', widthMedia: '480px' },
  ],
}

// API
editor.setDevice('Mobile');       // Changer de device
editor.getDevice();                // Device actuel
editor.on('change:device', () => { /* ... */ });

// Mobile-first (min-width au lieu de max-width)
mediaCondition: 'min-width',
```

> **Note CNCDP :** Le Device Manager n'est **pas activé** dans notre overlay. Les boutons de device n'apparaissent pas. À activer pour la prévisualisation responsive.

---

## Module Undo Manager

> 📖 [API Undo Manager](https://grapesjs.com/docs/api/undo_manager.html)

Le Undo Manager gère l'historique des actions (annuler/rétablir). Il est natif et toujours actif.

```js
editor.UndoManager;           // Module
editor.runCommand('core:undo'); // Annuler (ou Ctrl+Z)
editor.runCommand('core:redo'); // Rétablir (ou Ctrl+Y)
```

---

## Module Keymaps (raccourcis clavier)

> 📖 [API Keymaps](https://grapesjs.com/docs/api/keymaps.html)

Gère les raccourcis clavier de l'éditeur.

```js
editor.Keymaps.add('custom-shortcut', 'ctrl+shift+a', () => {
  alert('Raccourci activé');
});
```

### Raccourcis natifs importants

| Raccourci | Action |
|---|---|
| `Ctrl+Z` / `Ctrl+Y` | Annuler / Rétablir |
| `Ctrl+C` / `Ctrl+V` | Copier / Coller |
| `Suppr` | Supprimer le composant sélectionné |
| `Ctrl+A` | Sélectionner tout |
| `Échap` | Désélectionner / Quitter le mode édition |

---

## Module Components (API détaillée)

### Événements

| Événement | Quand |
|---|---|
| `component:create` | Modèle créé |
| `component:mount` | Rendu canvas |
| `component:add` | Ajouté à l'éditeur |
| `component:remove` | Supprimé |
| `component:remove:before` | Avant suppression (`opts.abort = true` pour annuler) |
| `component:clone` | Cloné |
| `component:update` | Propriété modifiée |
| `component:update:{prop}` | Propriété spécifique |
| `component:styleUpdate` | Style modifié |
| `component:selected` / `component:deselected` | Sélection |
| `component:drag:start` / `component:drag` / `component:drag:end` | Drag & drop |

### Méthodes

```js
const cmp = editor.Components;
cmp.getWrapper();        // Composant racine
cmp.getComponents();     // Tous les enfants
cmp.addComponent({...}); // Ajouter
cmp.clear();             // Vider
cmp.addType(name, def);  // Ajouter un type
cmp.getType(name);       // Définition d'un type
cmp.getTypes();          // Tous les types
cmp.canMove(target, source, index); // Vérifier si déplaçable
```

### Propriétés d'un Component

| Propriété | Défaut | Description |
|---|---|---|
| `type` | — | Type (`text`, `image`, `default`…) |
| `tagName` | `div` | Balise HTML |
| `attributes` | `{}` | Attributs HTML |
| `name` | — | Nom (affiché dans Layers) |
| `removable` | `true` | Supprimable |
| `draggable` | `true` | Déplaçable (accepte query string : `'.parent'`) |
| `droppable` | `true` | Accepte des enfants |
| `stylable` | `true` | Stylisable (ou `['width', 'height']`) |
| `unstylable` | `[]` | Propriétés CSS masquées |
| `copyable` | `true` | Copiable |
| `resizable` | `false` | Redimensionnable |
| `editable` | `false` | Éditable en ligne (double-clic) |
| `layerable` | `true` | Visible dans les Layers |
| `selectable` | `true` | Sélectionnable au clic |
| `hoverable` | `true` | Surbrillance au survol |
| `locked` | `undefined` | Verrouille le composant et ses enfants |
| `void` | `false` | Pas de balise fermante (`<br/>`) |
| `style` | — | Style par défaut `{ color: 'red' }` |
| `styles` | — | Styles relatifs au composant |
| `content` | `''` | Contenu texte |
| `script` | — | JS exécuté dans le canvas |
| `script-props` | `[]` | Propriétés passées au script |
| `traits` | `['id','title']` | Traits du composant |
| `toolbar` | — | Boutons de la toolbar |
| `components` | `null` | Enfants |

### Méthodes d'un Component

```js
component.is('image');              // Vérifier le type
component.props();                  // Toutes les propriétés
component.index();                  // Position dans le parent
component.find('.my-class');        // Rechercher descendants
component.findType('text');         // Par type
component.closest('.container');    // Parent par sélecteur
component.closestType('section');   // Parent par type
component.contains(child);          // Vérifier descendance
component.replaceWith('<div>...</div>'); // Remplacer
component.setAttributes({...});     // Remplacer attributs
component.addAttributes({...});     // Ajouter attributs
component.getStyle();               // Style
component.setStyle({...});          // Définir style
component.addClass('new-class');    // Ajouter classe
component.setClass('only-class');   // Remplacer classes
component.removeClass('old');       // Supprimer classe
component.append('<div>...</div>'); // Ajouter enfant (option: { at: 0 })
component.components();             // Collection enfants
component.empty();                  // Vider enfants
component.parent();                 // Parent
component.parents();                // Tous les parents
component.getTrait('name');         // Trait par nom
component.addTrait({...}, { at: 0 }); // Ajouter trait
component.removeTrait('name');      // Supprimer trait
component.toHTML();                 // Exporter en HTML
component.toHTML({ withProps: true }); // Avec data-gjs-* pour ré-import
component.getInnerHTML();           // HTML interne
component.getId();                  // ID unique
```

---

## API Canvas

> 📖 [API Canvas](https://grapesjs.com/docs/api/canvas.html)

Le module Canvas gère l'iframe, le drag & drop, le zoom et le scroll.

### Événements utiles

| Événement | Usage |
|---|---|
| `canvas:dragenter` / `canvas:dragover` / `canvas:dragend` | Suivi du drag |
| `canvas:dragdata` | Modifier `result.content` avant le drop |
| `canvas:drop` | Élément déposé |
| `canvas:frame:load` | Iframe chargée |
| `canvas:frame:load:body` | Body rendu avec les composants |

### Méthodes clés

```js
const canvas = editor.Canvas;
canvas.getElement();       // Élément DOM
canvas.getFrameEl();       // iframe
canvas.getWindow();        // Window de l'iframe
canvas.getDocument();      // Document de l'iframe
canvas.getBody();          // Body de l'iframe
canvas.scrollTo(el);       // Scroller vers un élément
canvas.setZoom(50);        // Zoom (0-100)
canvas.getZoom();          // Zoom actuel
canvas.getLastDragResult();// Dernier composant créé par drag
```

---

## API Panels

> 📖 [API Panels](https://grapesjs.com/docs/api/panels.html)

Gère les panels et boutons de l'interface.

```js
const panels = editor.Panels;

panels.addPanel({ id: 'my-panel', visible: true, buttons: [...] });
panels.getPanel('id');
panels.removePanel('id');

panels.addButton('panel-id', {
  id: 'btn-id',
  className: 'someClass',
  command: 'someCommand',        // ID de commande
  // Ou commande inline :
  command: { run(editor) {...}, stop(editor) {...} },
  command: function(editor) {...}, // Fonction = .run
  attributes: { title: 'Tooltip' },
  active: false,
});
panels.getButton('panel-id', 'btn-id');
panels.removeButton('panel-id', 'btn-id');
```

---

## Références

- [Documentation officielle GrapesJS](https://grapesjs.com/docs/)
- [API Reference](https://grapesjs.com/docs/api/)
- [GitHub GrapesJS](https://github.com/GrapesJS/grapesjs)
- [Preset Webpage](https://github.com/GrapesJS/preset-webpage)
- [Blocks Bootstrap 4](https://github.com/GrapesJS/blocks-bootstrap4)
- [grapesjs-cli](https://github.com/GrapesJS/cli) — Boilerplate de plugin

L'interface de GrapesJS est retouchée pour correspondre à l'identité CNCDP :

```css
.gjs-one-bg      { background-color: #2d2540; }  /* Sidebar, panneaux */
.gjs-two-color   { color: #c4bdd4; }              /* Texte secondaire */
.gjs-three-bg    { background-color: #3d3355; }   /* Survol, actif */
.gjs-four-color,
.gjs-four-color-h:hover { color: var(--violet-vif); } /* Accents */
```

Ces overrides sont définis dans le bloc `{% block stylesheets %}` de `page_editor.html.twig`.

---

## Fonctionnalités désactivées / modifiées

- **Autosave désactivé** : le `storageManager` en IndexedDB est présent mais `autosave: false`
- **Modification des classes des liens** : le prototype `classesChanged` des liens (`<a>`) est neutralisé pour éviter que GrapesJS ne supprime les classes Bootstrap des liens
- **Ajout du trait `href` sur les boutons** : le type `button` natif ne propose pas de champ lien → un trait `href` est injecté dynamiquement

---

## Flux utilisateur complet

```
1. Admin arrive sur /admin/pages
        │
        ▼
2. Clique "Nouvelle page" ou "✏️" sur une page existante
        │
        ▼
3. Page editor avec titre, slug, statut
        │
        ▼
4. Clique "Modifier le contenu avec l'éditeur visuel"
        │
        ▼
5. Overlay plein écran s'ouvre → GrapesJS initialisé
        │
        ▼
6. Admin glisse-dépose des blocs, édite le contenu
        │
        ▼
7. Sauvegarde progressive (💾) ou finale (✓)
        │
        ▼
8. Formulaire soumis → PageCrudController::handleSave()
        │
        ▼
9. Redirection vers /admin/pages avec message flash
```

---

## Points d'attention

### Compatibilité navigateur

GrapesJS 0.21.10 fonctionne sur tous les navigateurs modernes (Chrome, Firefox, Edge, Safari). Testé principalement sur Chrome.

### Performance

- Le chargement initial peut être lent (plusieurs CDN à charger : GrapesJS ~500 KB + plugins)
- Le template "Page d'accueil CNCDP" est volumineux (~15 KB de HTML inline)
- L'IndexedDB est utilisé pour le stockage local mais n'est pas exploité (autosave désactivé)

### Sécurité

- Le HTML généré par GrapesJS est stocké **brut** en base de données
- Aucune sanitization n'est appliquée côté serveur sur le HTML
- Le contenu est injecté via `|raw` dans les templates front → **risque XSS si un admin malveillant injecte du JS**
- ✅ La route d'édition est protégée par `ROLE_ADMIN`
- ✅ Le formulaire est protégé par CSRF

### Débogage

En cas de problème avec l'éditeur :
1. Vérifier la console navigateur (F12) pour les erreurs JS
2. Vérifier que les CDN sont accessibles (pas de blocage réseau)
3. Vider le stockage IndexedDB si l'état local est corrompu
4. Faire un **rafraîchissement dur** (Ctrl+F5) après mise à jour de `page-editor.js` (le fichier peut être en cache)

---

## Évolutions envisagées

- [ ] Sanitization HTML côté serveur (HTMLPurifier ou équivalent)
- [ ] Upload d'images dans l'éditeur (asset manager GrapesJS)
- [ ] Génération automatique d'IDs uniques pour les composants Bootstrap (éviter les conflits `carouselDemo`)
- [ ] Prévisualisation avant publication (ouvrir la page dans un nouvel onglet)
- [ ] Création de blocs customs supplémentaires (avis de synthèse, timeline, chiffres clés…)
- [ ] Migration des CDN vers AssetMapper pour les librairies GrapesJS
- [ ] Activation de l'autosave IndexedDB avec synchronisation périodique


---

## Évolutions du 19/07/2026

> Session [GRAPESJS-UX-COMPLETION] — 19/07/2026

### Style Manager simplifié

7 secteurs techniques → 5 secteurs simples en français : Apparence (Fond, Dégradé, Couleur texte), Texte (Taille, Style, Alignement), Espacement, Bordure, Taille.
Dégradés : deux pipettes (début/fin) + sélecteur de direction via CSS custom properties (--grad-start, --grad-end).

### Classes CSS masquées
Section SelectorManager masquée via CSS (.gjs-clm-tags, .gjs-clm-sels-info, .gjs-clm-sels) + fallback JS.

### Noms de composants en français
Surcharge de getName() sur le prototype du modèle par défaut. Types traduits : head→Titre, paragraph→Texte, image→Image, link→Lien, button→Bouton, section→Section, etc.

### Boutons Monter/Descendre (↑↓)
Ajoutés dans la toolbar du composant sélectionné. Fonction moveComp() remonte automatiquement dans l'arborescence.
Styles préservés via getStyle()/setStyle(). Toolbar repositionnée après déplacement.

### Colonnes Bootstrap simplifiées
Traits XS/SM/MD/LG/XL → unique sélecteur Largeur en %. Implémenté via DomComponents.addType().

### Compositions (🧩 Compositions)
5 blocs multi-éléments : Bannière Hero, Cartes x3, Texte+Image, Chiffres Clés, Contact Split.

### Correction ciblage par classe CSS
Problème : GrapesJS cible les classes (.py-5, .card) au lieu des éléments individuels.
Solution : classes uniques sur tous les éléments répétés (img-hero-1/2, card-g1/2/3, etc.).
Styles inline remplacés par classes canvas pour éviter les règles ID non écrasables.

### Standardisation couleurs CNCDP
Couleurs uniformisées : terracotta #d4845a, violet #2d2540, gris #6b647a, beige #e5e0d8, fond #f5f3f0.

### Nouveaux templates
Visuel + Texte (2 colonnes avec bordure), Cartes en Escalier (3 cartes décalées + bandeau). Total galerie : 14.

### Correction bug bg-light
Bootstrap .bg-light avec !important → retiré, remplacé par style inline background-color (pas le raccourci background).
