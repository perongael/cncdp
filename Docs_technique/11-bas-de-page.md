# Gestion du bas de page (Footer)

> Créé le 19/07/2026 — Session [FOOTER-SYSTEM]

---

## Vue d'ensemble

Le bas de page du site CNCDP est entièrement **dynamique et administrable** via le back-office. Il est composé de 3 colonnes + un bandeau inférieur, le tout piloté par un fichier JSON de configuration.

```
┌──────────────────────────────────────────────────────┐
│  Colonne 1        Colonne 2        Colonne 3         │
│  ─────────        ─────────        ─────────         │
│  CNCDP            Contact           Liens utiles      │
│  Adresse          Email             Lien 1            │
│  postale          Lien contact 1    Lien 2            │
│                   Lien contact 2    Lien 3            │
├──────────────────────────────────────────────────────┤
│  Mentions légales | Politique de confidentialité      │
│  © 2026 CNCDP — Tous droits réservés                 │
└──────────────────────────────────────────────────────┘
```

---

## Architecture

| Fichier | Rôle |
|---|---|
| `config/footer.json` | Stockage des données (créé automatiquement à la 1ère sauvegarde) |
| `src/Controller/Admin/AdminController.php` | Route `POST/GET /admin/bas-de-page` — lecture/écriture |
| `src/Twig/FooterExtension.php` | Extension Twig `footer_config()` — expose les données aux templates front |
| `templates/admin/footer_edit.html.twig` | Formulaire d'édition back-office |
| `templates/base.html.twig` | Rendu front-office du footer |
| `config/services.yaml` | Enregistrement du service `FooterExtension` |

### Flux de données

```
┌──────────────┐     POST      ┌──────────────┐     JSON      ┌──────────────┐
│  Admin form  │ ────────────→ │ AdminController│ ──────────→ │ footer.json  │
│ footer_edit  │               │   footer()    │              │  (stockage)  │
└──────────────┘               └──────────────┘              └──────┬───────┘
                                                                   │
┌──────────────┐               ┌──────────────┐                    │
│  Front-end   │ ←──────────── │ FooterExtension│ ←────────────────┘
│ base.html.twig│  footer_config()│  getFooterConfig()
└──────────────┘               └──────────────┘
```

---

## Configuration JSON

### Fichier `config/footer.json`

```json
{
    "address": "Comité National Consultatif de Déontologie des Psychologues\n13 rue Letellier\n75015 Paris",
    "email": "contact@cncdp.fr",
    "links": "Code de déontologie 2021 | #\nIndex des avis | #\nAdhésion des organisations | #\nDemande d'avis consultatif | #",
    "bottom_text": "© 2026 CNCDP — Tous droits réservés",
    "contact_links": "",
    "bottom_links": "Mentions légales | #\nPolitique de confidentialité | #"
}
```

### Champs

| Champ | Type | Rendu front | Notes |
|---|---|---|---|
| `address` | texte multiligne | `nl2br` dans `<address>` | Colonne 1 |
| `email` | email | `mailto:` cliquable | Colonne 2 |
| `links` | `Texte \| URL` par ligne | Liste de liens | Colonne 3 |
| `contact_links` | `Texte \| URL` par ligne | Liens sous l'email | Colonne 2 |
| `bottom_links` | `Texte \| URL` par ligne | Liens inline séparés par `\|` | Bandeau inférieur |
| `bottom_text` | texte libre | Affiché tel quel | Copyright. Utiliser `{{ 'now'\|date('Y') }}` pour l'année dynamique. |

### Format des liens

Tous les champs de liens utilisent le format :
```
Texte du lien | URL
```
Un lien par ligne. Le séparateur est le pipe `|`. Exemple :
```
Code de déontologie 2021 | /code-de-deontologie
Index des avis | /avis
```

---

## Controller

**Route :** `/admin/bas-de-page` — `admin_footer`

```php
#[Route('/bas-de-page', name: 'admin_footer')]
public function footer(Request $request): Response
```

- **GET** : lit `config/footer.json`, merge avec les valeurs par défaut, affiche le formulaire
- **POST** : récupère les 6 champs, écrit `config/footer.json`, redirige avec flash message
- Les champs `address`, `email`, `bottom_text` sont nettoyés via `strip_tags()`
- Les champs de liens (`links`, `contact_links`, `bottom_links`) sont stockés bruts (le format `Texte | URL` est conservé)

---

## Extension Twig

**Classe :** `App\Twig\FooterExtension`

```php
public function getFooterConfig(): array
```

- Retourne un tableau associatif avec les 6 clés
- Si `config/footer.json` existe, merge avec les valeurs par défaut
- Les valeurs par défaut sont codées en dur (fallback si le fichier n'existe pas)
- Enregistrée dans `config/services.yaml` avec l'argument `$projectDir`

**Utilisation dans Twig :**
```twig
{% set footer = footer_config() %}
{{ footer.address|nl2br }}
{{ footer.email }}
```

---

## Template front (`base.html.twig`)

Le footer est intégré dans le layout de base, après le bloc `{% block body %}`.

Structure :
- **`.footer-grid`** : 3 colonnes (CNCDP, Contact, Liens utiles)
- **`.footer-bottom`** : bandeau inférieur avec liens légaux + copyright

Les liens sont parsés avec le filtre Twig :
```twig
{% for line in footer.links|split('\n')|filter(l => l|trim is not empty) %}
    {% set parts = line|split('|') %}
    {% if parts|length >= 2 %}
        <p><a href="{{ parts[1]|trim }}">{{ parts[0]|trim }}</a></p>
    {% endif %}
{% endfor %}
```

Le `|` est le séparateur entre le texte du lien et l'URL. Chaque ligne devient un lien.

---

## Template admin (`templates/admin/footer_edit.html.twig`)

Layout en grille CSS 2 colonnes sur 3 rangées :

| Rangée | Gauche | Droite |
|---|---|---|
| 1 | Coordonnées (adresse + email) | Liens utiles |
| 2 | Liens Contact | Liens légaux |
| 3 | Copyright (demi-largeur) | — |

Chaque carte utilise les classes `admin-card`, `admin-card-header`, `admin-card-body`.

La classe `admin-grid` avec `grid-template-columns: 1fr 1fr` assure l'alignement par rangée.

Les textareas de liens affichent un hint : `Format : Texte du lien | URL — un lien par ligne.`

---

## CSS

Les styles du footer sont dans `assets/styles/cncdp.css` :

```css
.footer-legal { /* liens légaux en ligne */ }
.footer-copyright { /* texte copyright */ }
```

Le reste du footer (`.site-footer`, `.footer-grid`, `.footer-col`, `.footer-bottom`) utilise les classes Bootstrap 4.6 et les variables CNCDP.

---

## Menu admin

L'entrée "Bas de page" est dans la sidebar admin, section **Contenu du site** :

```twig
<a href="{{ path('admin_footer') }}" class="sidebar-link {% if 'admin_footer' in app.current_route %}active{% endif %}">
    <i class="fa-solid fa-shoe-prints" aria-hidden="true"></i>
    Bas de page
</a>
```

---

## Résumé des opérations

| Action | Fichier modifié |
|---|---|
| Route + controller | `src/Controller/Admin/AdminController.php` |
| Extension Twig | `src/Twig/FooterExtension.php` (nouveau) |
| Service declaration | `config/services.yaml` |
| Template admin | `templates/admin/footer_edit.html.twig` (nouveau) |
| Menu sidebar | `templates/admin/base_admin.html.twig` |
| Footer front | `templates/base.html.twig` |
| CSS | `assets/styles/cncdp.css` |
