# Création de pages — Guide pour agents IA

> Créé le 20/07/2026 — Suite aux nombreux problèmes rencontrés lors de la création de la page Contact.
> Mis à jour le 21/07/2026 — Ajout note sur `componentFirst` et le stylage par composant.
> **À lire avant toute création ou modification de page.**

---

## 🎯 Règle d'or

**Une page doit être construite via l'API GrapesJS native (`editor.getWrapper().components().add()`), pas en injectant du HTML brut dans la BDD.**

GrapesJS n'est PAS un préservateur de HTML. Il parse, transforme et régénère le HTML à chaque sauvegarde. Tout HTML injecté directement dans `html_content` sera détruit au premier cycle édition → sauvegarde.

### ⚡ Styles par composant

Depuis le 21/07/2026, `selectorManager.componentFirst: true` est activé. Cela signifie que :
- Les styles appliqués via le Style Manager (🎨) ciblent l'ID unique du composant, pas sa classe
- Modifier la bordure d'une `.card` ne modifie QUE cette carte, pas les autres `.card`
- Les classes Bootstrap (`.card`, `.row`, `.col-*`) restent dans le HTML pour le design system
- Le panneau « Classes CSS » est masqué pour les utilisateurs non techniques

---

## 📐 Architecture d'une page

```
┌────────────────────────────────────────────┐
│                grapsejsData                 │  ← Source de vérité
│           (JSON, arbre de composants)       │     Stocké en BDD
│                                             │     Chargé par l'éditeur
│  {                                          │     Survivant aux sauvegardes
│    pages: [{ frames: [{ component: {        │
│      type: "wrapper",                       │
│      components: [...]  ← l'arbre entier    │
│    }}]}]                                    │
│  }                                          │
├────────────────────────────────────────────┤
│                html_content                 │  ← Export HTML
│  (généré par editor.getHtml() à la sauve-  │     Rendu front-end
│   garde, wrappé dans <!DOCTYPE><html>...)   │     Régénéré à chaque save
└────────────────────────────────────────────┘
```

- **`grapesjsData`** : le format natif de GrapesJS. C'est lui qui permet de rouvrir l'éditeur et de retrouver l'état exact.
- **`htmlContent`** : généré automatiquement à partir du `grapesjsData` lors de la sauvegarde. C'est ce qui est affiché sur le front.

---

## ✅ Méthode correcte : construire via l'API GrapesJS

### Étape 1 : Créer une page vierge en BDD

```php
$conn->executeStatement(
    "INSERT INTO page (title, slug, html_content, grapesjs_data, status, created_at, updated_at) 
     VALUES ('Titre', 'slug', '', NULL, 'published', NOW(), NOW())"
);
$pageId = $conn->lastInsertId();
```

### Étape 2 : Ouvrir l'éditeur GrapesJS

Naviguer vers `/admin/pages/{id}/edit` et cliquer sur « Modifier le contenu avec l'éditeur visuel ».

### Étape 3 : Construire la page via l'API JavaScript

```javascript
const editor = grapesjs.editors[0];  // Récupérer l'instance de l'éditeur
const wrapper = editor.getWrapper();

// Ajouter des composants
wrapper.components().add({
    tagName: 'section',                   // Balise HTML
    style: { background: '#9d38da' },     // Styles INLINE obligatoires
    classes: ['container'],               // Classes Bootstrap UNIQUEMENT
    components: [                         // Enfants (récursif)
        {
            type: 'text',                 // Type GrapesJS
            tagName: 'h1',
            content: 'Mon titre'
        }
    ]
});
```

### Étape 4 : Sauvegarder

**Toujours utiliser le bouton « 💾 Enreg. » (AJAX) en premier**, puis « ✓ Terminer » :

```javascript
// Clic sur 💾 Enreg. (sauvegarde AJAX, fiable)
await page.click('#editor-save-progress-btn');
await page.waitForTimeout(3000);

// Puis ✓ Terminer (soumet le formulaire et ferme)
await page.click('#editor-save-btn');
```

---

## ❌ Méthodes à NE PAS utiliser

### 1. Injection de HTML brut dans `html_content`

```php
// ❌ NE JAMAIS FAIRE
$html = '<section class="contact-hero"><div class="container">...';
$conn->executeStatement('UPDATE page SET html_content = :h', ['h' => $html]);
```

**Pourquoi ça échoue :** Au premier cycle édition → sauvegarde, GrapesJS parse le HTML, le transforme en composants, puis régénère un HTML complètement différent. Les classes CSS custom, les formulaires, et les styles sont perdus.

### 2. Classes CSS custom (`.contact-hero`, `.mon-style`)

```html
<!-- ❌ NE PAS FAIRE -->
<div class="contact-hero">...</div>
```

**Pourquoi ça échoue :** GrapesJS ne connaît pas ces classes. Il les supprime lors de l'export HTML. Utiliser UNIQUEMENT des classes Bootstrap reconnues (`.container`, `.row`, `.col-*`, `.form-group`, etc.) et des styles **inline** (`style="..."`).

### 3. Injection via `setComponents()` avec du HTML

```javascript
// ❌ NE PAS FAIRE
editorInstance.setComponents('<section class="mon-hero">...');
```

**Pourquoi ça échoue :** Même problème — le HTML est parsé et les éléments non reconnus sont perdus.

### 4. Utiliser des `<i class="fa-solid fa-...">` FontAwesome

```html
<!-- ❌ À ÉVITER dans le contenu GrapesJS -->
<i class="fa-solid fa-envelope"></i>
```

**Problème :** Les classes FontAwesome sont souvent perdues. Utiliser des **emojis** à la place : 📍, ✉️, 📞, etc.

---

## 🐛 Bugs connus et leurs corrections

### Bug 1 : Le bouton « ✓ Terminer » ne sauvegarde pas

**Symptôme :** Après avoir cliqué sur « ✓ Terminer », la page front n'a pas changé. Le contenu en BDD est vide ou inchangé.

**Cause :** Le handler du bouton appelait `sync()` (qui remplit les champs cachés) mais ne soumettait PAS le formulaire. Il se contentait de cacher l'overlay.

**Correction dans `assets/page-editor.js` :**
```javascript
// AVANT (cassé)
document.getElementById("editor-save-btn").addEventListener("click", function() { 
    sync(); 
    overlay.style.display = "none"; 
});

// APRÈS (corrigé)
document.getElementById("editor-save-btn").addEventListener("click", function() { 
    sync(); 
    overlay.style.display = "none"; 
    document.getElementById("page-form").submit();  // ← AJOUTÉ
});
```

### Bug 2 : Le sanitizer Symfony détruit les formulaires

**Symptôme :** Après sauvegarde, tous les `<form>`, `<input>`, `<button>` ont disparu.

**Cause :** `PageCrudController::handleSave()` utilisait `$this->htmlSanitizer->sanitize()` du bundle `symfony/html-sanitizer` qui, même configuré avec `allow_elements`, continuait à supprimer les éléments de formulaire.

**Correction dans `src/Controller/Admin/PageCrudController.php` :**
```php
// AVANT (cassé)
$safeHtml = $htmlContent ? $this->htmlSanitizer->sanitize($htmlContent) : null;

// APRÈS (corrigé)
$safeHtml = $htmlContent ? $this->cleanHtml($htmlContent) : null;

// Méthode cleanHtml() ajoutée :
private function cleanHtml(string $html): string
{
    $html = preg_replace('/<script\b[^>]*>.*?<\/script>/si', '', $html);
    $html = preg_replace('/\s+on\w+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $html);
    $html = preg_replace('/<iframe\b[^>]*>.*?<\/iframe>/si', '', $html);
    return $html;
}
```

### Bug 3 : Assets JS servis avec MIME type `text/plain`

**Symptôme :** Console navigateur : `NS_ERROR_CORRUPTED_CONTENT` ou « Le script a été chargé alors que son type MIME ('text/plain') n'est pas valide ».

**Cause :** Les assets avaient été compilés avec `asset-map:compile` en mode debug. Les fichiers compilés dans `public/assets/` étaient servis sans Content-Type par le serveur Symfony.

**Correction :**
```bash
# Supprimer les assets compilés
rm -rf public/assets/*
# Vider le cache
php bin/console cache:clear
# Redémarrer le serveur
symfony server:stop
symfony serve -d
```

**Règle :** Ne **JAMAIS** lancer `asset-map:compile` en développement. Cette commande est réservée à la production.

### Bug 4 : L'EntityManager modifie le HTML à l'insertion

**Symptôme :** Le HTML stocké via `$em->persist()` + `$em->flush()` est différent du HTML passé à `setHtmlContent()`. Des classes et styles sont perdus.

**Cause :** Non identifiée précisément (probablement un listener Doctrine interne).

**Contournement :** Utiliser SQL direct (`DBAL connection`) plutôt que l'EntityManager pour insérer/mettre à jour le HTML :
```php
// ✅ Faire ceci
$conn->executeStatement('UPDATE page SET html_content = :h WHERE id = :id', ['h' => $html, 'id' => $id]);

// ❌ Plutôt que ceci
$page->setHtmlContent($html);
$em->flush();
```

---

## 📋 Checklist avant de créer une page

- [ ] Utiliser `grapesjs.editors[0].getWrapper().components().add()` pour construire
- [ ] Styles UNIQUEMENT en inline (`style="..."`)
- [ ] Classes Bootstrap UNIQUEMENT (`.container`, `.row`, `.col-*`, `.form-group`, etc.)
- [ ] Icônes en emoji (📍 ✉️), pas en `<i class="fa-solid ...">`
- [ ] Sauvegarder d'abord avec « 💾 Enreg. » (AJAX), puis « ✓ Terminer »
- [ ] Vérifier le front-end après sauvegarde
- [ ] Rouvrir l'éditeur pour confirmer que le contenu est toujours éditable
- [ ] Ne pas utiliser `asset-map:compile` en dev

---

## 🔄 Flux de sauvegarde

```
Éditeur GrapesJS ouvert
        │
        ▼
sync() appelé (remplit les champs cachés)
        │
        ├── html_content ← editor.getHtml() + editor.getCss()
        │   (format: <!DOCTYPE html><html><head><style>...</style></head><body>...</body></html>)
        │
        └── grapesjs_data ← editor.getProjectData()
            (format: JSON de l'arbre de composants)
        │
        ▼
Formulaire soumis (POST vers /admin/pages/{id}/edit)
        │
        ▼
PageCrudController::handleSave()
        │
        ├── cleanHtml() nettoie le html_content
        │   (supprime <script>, on*, <iframe>)
        │
        └── Stocke en BDD :
            ├── html_content = HTML nettoyé
            └── grapesjs_data = JSON brut (non nettoyé)
        │
        ▼
Redirection vers /admin/pages (liste)
```

---

## 📁 Fichiers concernés

| Fichier | Rôle |
|---|---|
| `src/Controller/Admin/PageCrudController.php` | Gère la sauvegarde : `handleSave()` + `cleanHtml()` |
| `assets/page-editor.js` | Initialise GrapesJS, gère `sync()`, les boutons de sauvegarde |
| `src/Controller/PageController.php` | Rend les pages front : `renderPage()` extrait le body du HTML wrappé |
| `templates/pages/dynamic.html.twig` | Template front : `{{ content\|raw }}` |
| `config/packages/html_sanitizer.yaml` | Configuration du sanitizer (remplacé par `cleanHtml()`) |

---

> Dernière mise à jour : 20/07/2026 — Suite aux correctifs de la page Contact.
