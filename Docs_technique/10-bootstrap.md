# Bootstrap 4.6 — Référence technique CNCDP

> Créé le 19/07/2026 — Session [BOOTSTRAP] [DOC]
> Bootstrap 4.6 est le framework CSS de référence pour l'ensemble du site CNCDP (front, back-office et éditeur GrapesJS).

---

## Principes fondamentaux

### 🎯 Règle d'or CNCDP

Tout contenu de page doit être structuré selon le modèle :

```
.container (ou .container-fluid)
  └── .row
        └── .col-* (ou .col-md-*, etc.)
              └── Contenu (texte, image, bouton…)
```

**Jamais** de contenu directement dans `.container` sans `.row` > `.col-*`.

---

## 📐 Système de grille (Grid)

> 📖 [Documentation officielle](https://getbootstrap.com/docs/4.6/layout/grid/)

### Concept

- **12 colonnes** par ligne
- Basé sur **Flexbox**
- **Mobile-first** : les classes de base s'appliquent à tous les écrans, les classes `-sm-`, `-md-`, `-lg-`, `-xl-` s'appliquent à partir du breakpoint

### Structure obligatoire

```html
<div class="container">
  <div class="row">
    <div class="col-md-6">Colonne 1</div>
    <div class="col-md-6">Colonne 2</div>
  </div>
</div>
```

### Classes de colonnes

| Classe | Comportement |
|---|---|
| `.col` | Largeur égale automatique |
| `.col-{1-12}` | Largeur fixe (n/12) — tous les écrans |
| `.col-sm-{1-12}` | À partir de 576px |
| `.col-md-{1-12}` | À partir de 768px |
| `.col-lg-{1-12}` | À partir de 992px |
| `.col-xl-{1-12}` | À partir de 1200px |
| `.col-auto` | Largeur du contenu |

### Combinaisons responsive

```html
<!-- Colonne 100% sur mobile, 50% sur desktop -->
<div class="col-12 col-md-6">Contenu</div>

<!-- Colonne 50% sur mobile, 33% sur tablette, 25% sur desktop -->
<div class="col-6 col-md-4 col-lg-3">Contenu</div>
```

### ⚠️ Règles à respecter

- **Les `.col-*` doivent être enfants directs de `.row`**
- **Seules les `.col-*` peuvent être enfants de `.row`**
- **Le total des colonnes par `.row` doit être ≤ 12** (sinon wrapping)
- **`.row` a des marges négatives** compensées par le padding de `.container`
- **Pas de `.container` imbriqué dans un `.container`** (sauf cas très spécifiques)

---

## 📦 Conteneurs (Containers)

> 📖 [Documentation officielle](https://getbootstrap.com/docs/4.6/layout/overview/#containers)

| Classe | Largeur max | Comportement |
|---|---|---|
| `.container` | 540 / 720 / 960 / 1140px | Responsive, centré |
| `.container-fluid` | 100% | Pleine largeur |
| `.container-sm` | 100% → 540px à partir de sm | Semi-responsive |
| `.container-md` | 100% → 720px à partir de md | Semi-responsive |
| `.container-lg` | 100% → 960px à partir de lg | Semi-responsive |
| `.container-xl` | 100% → 1140px à partir de xl | Semi-responsive |

### Utilisation dans CNCDP

- **`.container`** par défaut pour toutes les sections de page
- **`.container-fluid`** pour la navbar et le footer
- Ne pas utiliser `.container` imbriqué

---

## 📱 Breakpoints responsive

> 📖 [Documentation officielle](https://getbootstrap.com/docs/4.6/layout/overview/#responsive-breakpoints)

| Breakpoint | Min-width | Appareil |
|---|---|---|
| **xs** (extra small) | < 576px | Mobile portrait |
| **sm** (small) | ≥ 576px | Mobile paysage |
| **md** (medium) | ≥ 768px | Tablette |
| **lg** (large) | ≥ 992px | Desktop |
| **xl** (extra large) | ≥ 1200px | Grand écran |

### Convention CNCDP

Utiliser les classes `-md-` comme référence pour le layout desktop. Les blocs de l'éditeur doivent utiliser `.col-md-*` pour garantir un bon rendu responsive.

---

## 📏 Utilitaires d'espacement (Spacing)

> 📖 [Documentation officielle](https://getbootstrap.com/docs/4.6/utilities/spacing/)

### Format

```
{propriété}{côtés}-{taille}
{propriété}{côtés}-{breakpoint}-{taille}
```

| Propriété | Côtés | Tailles |
|---|---|---|
| `m` = margin | `t` = top | `0` = 0 |
| `p` = padding | `b` = bottom | `1` = 0.25rem (4px) |
| | `l` = left | `2` = 0.5rem (8px) |
| | `r` = right | `3` = 1rem (16px) |
| | `x` = left + right | `4` = 1.5rem (24px) |
| | `y` = top + bottom | `5` = 3rem (48px) |
| | (vide) = 4 côtés | `auto` = auto |

### Exemples

```html
<div class="mt-3 mb-4 px-2 py-5">…</div>
<!-- margin-top: 1rem, margin-bottom: 1.5rem, padding-x: 0.5rem, padding-y: 3rem -->

<div class="mx-auto" style="width:200px">Centré</div>
<!-- margin-left/right: auto → centrage horizontal -->

<div class="mt-md-5 mb-md-0">…</div>
<!-- Appliqué seulement à partir de md (≥ 768px) -->
```

### Marges négatives

```html
<div class="mt-n1">…</div>  <!-- margin-top: -0.25rem -->
<div class="mx-md-n5">…</div> <!-- margin-x: -3rem à partir de md -->
```

---

## 🔲 Utilitaires Flexbox

> 📖 [Documentation officielle](https://getbootstrap.com/docs/4.6/utilities/flex/)

### Conteneur flex

| Classe | Effet |
|---|---|
| `.d-flex` | Display flex |
| `.d-inline-flex` | Display inline-flex |
| `.d-md-flex` | Flex à partir de md |

### Direction

| Classe | Effet |
|---|---|
| `.flex-row` | Horizontal (défaut) |
| `.flex-column` | Vertical |
| `.flex-md-column` | Vertical à partir de md |

### Alignement

| Axe principal (justify) | Axe secondaire (align) |
|---|---|
| `.justify-content-start` | `.align-items-start` |
| `.justify-content-center` | `.align-items-center` |
| `.justify-content-end` | `.align-items-end` |
| `.justify-content-between` | `.align-items-stretch` |
| `.justify-content-around` | `.align-items-baseline` |

### Grow / Shrink / Wrap

| Classe | Effet |
|---|---|
| `.flex-grow-1` | Peut grandir |
| `.flex-shrink-1` | Peut rétrécir |
| `.flex-fill` | Remplit l'espace dispo |
| `.flex-wrap` | Retour à la ligne |
| `.flex-nowrap` | Pas de retour |

---

## 👁️ Visibilité responsive (Display)

> 📖 [Documentation officielle](https://getbootstrap.com/docs/4.6/utilities/display/)

| Classe | Effet |
|---|---|
| `.d-none` | Caché sur tous les écrans |
| `.d-md-none` | Caché à partir de md |
| `.d-md-block` | Visible (block) à partir de md |
| `.d-none .d-md-block` | Visible uniquement sur md+ |

### Pattern responsive

```html
<!-- Visible sur mobile, caché sur desktop -->
<div class="d-md-none">Menu mobile</div>

<!-- Caché sur mobile, visible sur desktop -->
<div class="d-none d-md-block">Menu desktop</div>
```

---

## 📐 Sizing (Largeur/Hauteur)

> 📖 [Documentation officielle](https://getbootstrap.com/docs/4.6/utilities/sizing/)

| Classe | Effet |
|---|---|
| `.w-25` `.w-50` `.w-75` `.w-100` | Largeur 25/50/75/100% |
| `.h-25` `.h-50` `.h-75` `.h-100` | Hauteur 25/50/75/100% |
| `.mw-100` | Max-width 100% |
| `.mh-100` | Max-height 100% |
| `.vw-100` | 100vw (viewport width) |
| `.vh-100` | 100vh (viewport height) |

---

## 🎨 Bonnes pratiques CNCDP

### 1. Structure de page type

```html
<!-- Section avec fond -->
<section class="container-fluid bg-light py-5">
  <div class="container">
    <div class="row">
      <div class="col-12">
        <h2 class="text-center mb-4">Titre de section</h2>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 mb-3 mb-md-0">Bloc 1</div>
      <div class="col-md-4 mb-3 mb-md-0">Bloc 2</div>
      <div class="col-md-4">Bloc 3</div>
    </div>
  </div>
</section>
```

### 2. Dans l'éditeur GrapesJS

- Les blocs **📐 Mise en page** (Section, Colonnes) fournissent la structure `.container` > `.row` > `.col-*`
- Les blocs de **contenu** (📝 Texte, 🖼️ Médias, 🔗 Navigation) se glissent **à l'intérieur** des colonnes
- Ne pas utiliser de styles `margin`/`padding` en dur (CSS inline) — préférer les classes `.p-*`, `.m-*`, `.py-*`, etc.
- Pour le responsive, utiliser les classes `.col-md-*` et non `.col-*` fixes

### 3. Anti-patterns à éviter

```
❌ <div class="container">
     <h2>Titre</h2>          ← Pas dans une .row > .col
   </div>

❌ <div class="row">
     <h2>Titre</h2>          ← Pas dans une .col
   </div>

❌ <div class="col-md-6">
     <div class="container"> ← Container imbriqué inutilement
       …
     </div>
   </div>

❌ <div style="margin-top:20px">  ← Éviter les marges en dur
```

---

## 🧩 Composants Bootstrap utilisés dans CNCDP

| Composant | Classes | Utilisation |
|---|---|---|
| **Carousel** | `.carousel`, `.carousel-inner`, `.carousel-item` | Diaporama d'images |
| **Accordion** | `.accordion`, `.card`, `.collapse` | Contenu pliable |
| **Jumbotron** | `.jumbotron` | Bandeau de mise en avant |
| **List group** | `.list-group`, `.list-group-item` | Liste stylisée |
| **Alert** | `.alert`, `.alert-warning`, `.alert-dismissible` | Message d'alerte |
| **Tabs** | `.nav`, `.nav-tabs`, `.tab-content` | Navigation par onglets |
| **Card** | `.card`, `.card-body` | Conteneur visuel |
| **Button** | `.btn`, `.btn-lg`, `.btn-primary` | Boutons |
| **Badge** | `.badge`, `.badge-success` | Étiquettes |
| **Form** | `.form-group`, `.form-control`, `.form-check` | Formulaire |

---

## 🔗 Liens utiles

| Ressource | URL |
|---|---|
| Documentation Bootstrap 4.6 | https://getbootstrap.com/docs/4.6/getting-started/introduction/ |
| Grid system | https://getbootstrap.com/docs/4.6/layout/grid/ |
| Layout overview | https://getbootstrap.com/docs/4.6/layout/overview/ |
| Spacing utilities | https://getbootstrap.com/docs/4.6/utilities/spacing/ |
| Flex utilities | https://getbootstrap.com/docs/4.6/utilities/flex/ |
| Display utilities | https://getbootstrap.com/docs/4.6/utilities/display/ |
| Sizing utilities | https://getbootstrap.com/docs/4.6/utilities/sizing/ |
| Components | https://getbootstrap.com/docs/4.6/components/alerts/ |
| Reboot (base CSS) | https://getbootstrap.com/docs/4.6/content/reboot/ |

---

> Dernière mise à jour : 19/07/2026 — Session [BOOTSTRAP] [DOC]
