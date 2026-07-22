# Gestion du menu de navigation (Header)

> Créé le 19/07/2026 — Session [MENU-SYSTEM]

---

## Vue d'ensemble

Le menu de navigation du site CNCDP est entièrement **dynamique et administrable** via le back-office. Il supporte une hiérarchie illimitée de sous-menus (menu → sous-menu → sous-sous-menu...).

```
┌──────────────────────────────────────────────────┐
│  Accueil | Le CNCDP ▾ | Code | Avis | ...       │
│            ├─ Qui sommes-nous ?                  │
│            └─ Nos missions                       │
│                └─ (sous-sous-menu possible)       │
└──────────────────────────────────────────────────┘
```

---

## Architecture

| Fichier | Rôle |
|---|---|
| `config/menu.json` | Stockage des données (JSON hiérarchique) |
| `src/Controller/Admin/AdminController.php` | Route `POST/GET /admin/menu` — lecture/écriture |
| `src/Twig/MenuExtension.php` | Extension Twig `menu_config()` — expose les données aux templates front |
| `templates/admin/menu_edit.html.twig` | Interface d'édition avec builder JS interactif |
| `templates/base.html.twig` | Rendu front-office du menu dans le header |
| `config/services.yaml` | Enregistrement du service `MenuExtension` |

### Flux de données

```
┌──────────────┐     POST      ┌──────────────┐     JSON      ┌──────────────┐
│  Admin form   │ ────────────→ │ AdminController│ ──────────→ │  menu.json   │
│ menu_edit     │               │   menu()     │              │  (stockage)  │
│ (JS builder)  │               └──────────────┘              └──────┬───────┘
└──────────────┘                                                     │
                                                                     │
┌──────────────┐               ┌──────────────┐                      │
│  Front-end   │ ←──────────── │ MenuExtension │ ←──────────────────┘
│ base.html.twig│  menu_config()│ getMenuConfig()
└──────────────┘               └──────────────┘
```

---

## Configuration JSON

### Fichier `config/menu.json`

```json
{
    "items": [
        {
            "id": "accueil",
            "label": "Accueil",
            "url": "/",
            "children": []
        },
        {
            "id": "cncdp",
            "label": "Le CNCDP",
            "url": "#",
            "children": [
                {
                    "id": "cncdp-qui",
                    "label": "Qui sommes-nous ?",
                    "url": "/qui-sommes-nous",
                    "children": []
                }
            ]
        }
    ]
}
```

### Structure d'un item

| Champ | Type | Description |
|---|---|---|
| `id` | string | Identifiant unique (généré auto si vide) |
| `label` | string | Texte affiché du lien |
| `url` | string | URL du lien (`#` si non-cliquable, sert de conteneur) |
| `children` | array | Sous-items (tableau d'items de même structure) |

La profondeur est illimitée : un `children` peut contenir d'autres items avec leurs propres `children`.

---

## Controller

**Route :** `/admin/menu` — `admin_menu`

```php
#[Route('/menu', name: 'admin_menu')]
public function menu(Request $request): Response
```

- **GET** : lit `config/menu.json`, affiche le builder JS
- **POST** : reçoit `menu_data` (JSON string), nettoie les labels via `strip_tags()`, écrit `config/menu.json`
- La méthode privée `sanitizeMenuItems()` nettoie récursivement tous les niveaux

---

## Extension Twig

**Classe :** `App\Twig\MenuExtension`

```php
public function getMenuConfig(): array
```

- Retourne un tableau avec la clé `items`
- Si `config/menu.json` existe, le lit ; sinon renvoie les valeurs par défaut (6 items)
- Enregistrée dans `config/services.yaml` avec l'argument `$projectDir`

**Utilisation dans Twig :**
```twig
{% set menu = menu_config() %}
{% for item in menu.items %}
    <a href="{{ item.url }}">{{ item.label }}</a>
{% endfor %}
```

---

## Template front (`base.html.twig`)

Le menu est rendu de manière récursive dans le `<nav>` header :

```twig
{% for item in menu.items %}
    <li class="nav-item{% if item.children|length > 0 %} has-submenu{% endif %}">
        <a href="{{ item.url }}">{{ item.label }}</a>
        {% if item.children|length > 0 %}
            <ul class="submenu">
                {% for child in item.children %}
                    <li><a href="{{ child.url }}">{{ child.label }}</a></li>
                {% endfor %}
            </ul>
        {% endif %}
    </li>
{% endfor %}
```

**Limitation actuelle :** Le template front supporte 2 niveaux (menu → sous-menu). Pour supporter 3+ niveaux, il faudrait utiliser un partial Twig récursif.

### CSS des sous-menus

```css
.nav-item { position: relative; }
.nav-item.has-submenu > a::after { content: ' ▾'; }  /* Flèche dropdown */
.submenu { display: none; position: absolute; ... }
.nav-item.has-submenu:hover .submenu { display: block; }  /* Apparition au survol */
```

Sur mobile, les sous-menus s'ouvrent au clic (classe `.open`).

---

## Template admin (`templates/admin/menu_edit.html.twig`)

### Builder JS interactif

L'interface utilise du **JavaScript vanilla** pour construire un éditeur d'arbre :

- **Ajout** : bouton "Ajouter un élément" (top-level) ou bouton `⤼` (sous-menu)
- **Suppression** : bouton `🗑️` avec confirmation
- **Réorganisation** : flèches `↑↓`
- **Sérialisation** : à la soumission, le DOM est lu intégralement pour reconstruire le JSON (évite les corruptions de données)

### Indentation visuelle par niveau

| Niveau | Marge gauche | Bordure gauche | Fond |
|---|---|---|---|
| 0 (racine) | 0 | 4px `#d4845a` (terracotta) | `#fff` |
| 1 (sous-menu) | 2.5rem | 3px `#9d38da` (violet) | `#fdfbff` |
| 2 | 2.5rem | 3px `#fd82bb` (rose) | `#fff5f9` |
| 3+ | 2.5rem | 2px `#adb5bd` (gris) | `#f8f9fa` |

Chaque niveau ajoute un retrait de 2.5rem par rapport au niveau précédent.

---

## Menu admin

L'entrée "Menu" est dans la sidebar admin, section **Contenu du site** :

```twig
<a href="{{ path('admin_menu') }}" class="sidebar-link ...">
    <i class="fa-solid fa-bars"></i> Menu
</a>
```

---

## Résumé des opérations

| Action | Fichier |
|---|---|
| Stockage JSON | `config/menu.json` (nouveau) |
| Controller | `src/Controller/Admin/AdminController.php` |
| Extension Twig | `src/Twig/MenuExtension.php` (nouveau) |
| Service declaration | `config/services.yaml` |
| Template admin | `templates/admin/menu_edit.html.twig` (nouveau) |
| Template front | `templates/base.html.twig` |
| Menu sidebar | `templates/admin/base_admin.html.twig` |
| CSS front | `assets/styles/cncdp.css` |
