# Plugins & Extensions

> Créé le 18/07/2026 — Session [PLUGINS] [GRAPESJS]
> Ce document recense et évalue les plugins/extensions envisagés pour le projet CNCDP.
> Il est structuré par **type d'extension** afin de pouvoir référencer d'autres catégories (Symfony, Doctrine, Twig, etc.) indépendamment de GrapesJS.

---

# 📦 GrapesJS — Plugins évalués

27 plugins analysés le 18/07/2026. Source : [gjs.market](https://gjs.market/), [github.com/GrapesJS](https://github.com/GrapesJS), [github.com/silexlabs](https://github.com/silexlabs), [github.com/bgrand-ch](https://github.com/bgrand-ch).

---

## 🟢 À intégrer (priorité élevée)

### 1. TOAST UI Image Editor
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | BSD-3 |
| **Prix** | Gratuit |
| **Stars** | ⭐94 |
| **Dernière release** | v1.0.2 (juin 2023) |
| **Compatibilité** | Toutes versions GrapesJS ✅ |
| **URL** | https://github.com/GrapesJS/tui-image-editor |
| **CDN** | `unpkg.com/grapesjs-tui-image-editor` |

**Description :** Ajoute un éditeur d'image complet (filtres, recadrage, rotation, texte, dessin) basé sur TOAST UI Image Editor. S'intègre directement sur les composants Image dans le canvas GrapesJS. L'image modifiée peut être ajoutée à l'Asset Manager.

**Verdict CNCDP :** Comble une lacune majeure : les admins ne peuvent pas éditer/retoucher les images sans quitter l'éditeur. Plugin officiel, mature, bien testé. **À intégrer en priorité.**

---

### 2. Forms
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | BSD-3 |
| **Prix** | Gratuit |
| **Stars** | ⭐79 |
| **Dernière release** | v2.0.6 (juin 2023) |
| **Compatibilité** | Toutes versions GrapesJS ✅ |
| **URL** | https://github.com/GrapesJS/components-forms |
| **CDN** | `unpkg.com/grapesjs-plugin-forms` |

**Description :** Ensemble de composants et blocs de formulaire : `form`, `input`, `textarea`, `select`, `checkbox`, `radio`, `button`, `label`. Traits complets (method, action, placeholder, required, options). Support i18n intégré.

**Verdict CNCDP :** Le CNCDP a besoin de formulaires (saisine, contact, adhésion). Actuellement, aucun bloc formulaire n'existe dans l'éditeur. Plugin officiel, mature. **À intégrer.**

---

### 3. Blocks Flexbox
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | BSD-3 |
| **Prix** | Gratuit |
| **Stars** | ⭐39 |
| **Dernière release** | v1.0.1 (juin 2023) |
| **Compatibilité** | Toutes versions GrapesJS ✅ |
| **URL** | https://github.com/GrapesJS/blocks-flexbox |
| **CDN** | `unpkg.com/grapesjs-blocks-flexbox` |

**Description :** Bloc Flexbox (Row + Column) pour créer des colonnes flexibles et responsives. Complète les blocs `column1/2/3` de `blocks-basic` avec une approche moderne.

**Verdict CNCDP :** Bootstrap 4 étant basé sur flexbox, pas de conflit. Offre plus de contrôle layout que les colonnes basiques. **À intégrer.**

---

### 4. IndexedDB Storage
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | BSD-3 |
| **Prix** | Gratuit |
| **Stars** | ⭐22 |
| **Dernière release** | v1.0.5 (juin 2023) |
| **Compatibilité** | GrapesJS ≥ 0.19.* ✅ |
| **URL** | https://github.com/GrapesJS/storage-indexeddb |
| **CDN** | `unpkg.com/grapesjs-indexeddb` |

**Description :** Wrapper de stockage IndexedDB pour GrapesJS. Permet la persistance locale dans le navigateur. Configuration : clé de projet, nom de base, nom d'object store.

**Verdict CNCDP :** **Corrige un bug documenté.** Notre `storageManager: { type: "indexeddb" }` est inopérant sans ce plugin. Active la persistance locale (même avec `autosave: false`, le `store()`/`load()` manuels fonctionneront). **À intégrer.**

---

### 5. Custom Code
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | BSD-3 |
| **Prix** | Gratuit |
| **Stars** | ⭐82 |
| **Dernière release** | v1.0.2 (juin 2023) |
| **Compatibilité** | GrapesJS ≥ 0.14.25 ✅ |
| **URL** | https://github.com/GrapesJS/components-custom-code |
| **CDN** | `unpkg.com/grapesjs-custom-code` |

**Description :** Permet d'embarquer du code HTML/CSS/JS personnalisé. Modal avec éditeur de code, composant `custom-code`, bloc dédié. Supporte les scripts.

**Verdict CNCDP :** Utile pour les admins avancés qui veulent intégrer des widgets tiers (iframe, scripts externes). Comble le gap entre blocs prédéfinis et liberté totale. **À intégrer.**

---

## 🟡 Intéressant (priorité moyenne)

### 6. Style Bg
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | MIT |
| **Prix** | Gratuit |
| **Stars** | ⭐36 |
| **URL** | https://github.com/GrapesJS/style-bg |

**Description :** Propriété `background` full-stack (images + couleurs + dégradés) dans le Style Manager. Dépend de Grapick CSS.

**Verdict :** Le plus abouti des plugins « style », mais le Style Manager n'est pas activement utilisé dans CNCDP. À réévaluer si on active le Style Manager.

---

### 7. Style Gradient
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | BSD-3 |
| **Prix** | Gratuit |
| **Stars** | ⭐19 |
| **URL** | https://github.com/GrapesJS/style-gradient |

**Description :** Sélecteur de dégradé visuel (basé sur Grapick) dans le Style Manager. Type `gradient`, extension `background-image`.

**Verdict :** Même réserve que Style Bg — dépend du Style Manager. À activer ensemble si on développe cette fonctionnalité.

---

### 8. Tabs
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | BSD-3 |
| **Prix** | Gratuit |
| **Stars** | ⭐39 |
| **URL** | https://github.com/GrapesJS/components-tabs |

**Description :** Composant onglets (tabs, tab-container, tab, tab-content, tab-contents). Bloc `tabs` dans la palette.

**Verdict :** CNCDP a déjà un bloc Bootstrap Tabs maison. Ce plugin fait doublon, mais avec une approche plus structurée (composants individuels). À considérer si le bloc maison montre des limites.

---

### 9. Tooltip
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | BSD-3 |
| **Prix** | Gratuit |
| **Stars** | ⭐20 |
| **URL** | https://github.com/GrapesJS/components-tooltip |

**Description :** Infobulle CSS-only (tooltip). Attributs `data-tooltip`, classes privées, stylisable.

**Verdict :** Petit plus ergonomique, pas essentiel. Peut être ajouté rapidement si besoin.

---

### 10. Parser PostCSS
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | BSD-3 |
| **Prix** | Gratuit |
| **Stars** | ⭐31 |
| **URL** | https://github.com/GrapesJS/parser-postcss |

**Description :** Parser CSS custom basé sur PostCSS. Évite les incohérences du CSSOM navigateur (conversion rgba, réorganisation des valeurs). Recommandé si on importe du HTML/CSS externe ou utilise `grapesjs-custom-code`.

**Verdict :** Devient pertinent si on intègre Custom Code. À coupler avec ce plugin pour une gestion propre des styles importés.

---

### 11. UI Suggest Classes
| | |
|---|---|
| **Auteur** | Silexlabs (lexoyo) |
| **Licence** | MIT |
| **Prix** | Gratuit |
| **Stars** | ⭐12 |
| **URL** | https://github.com/silexlabs/grapesjs-ui-suggest-classes |

**Description :** Auto-complétion des classes CSS dans le SelectorManager. Affiche les classes existantes et leur nombre d'utilisations.

**Verdict :** Améliore l'UX du SelectorManager. Léger, facile à intégrer. Confort utilisateur, pas critique.

---

### 12. Toolbox
| | |
|---|---|
| **Auteur** | Blocomposer (Ju99ernaut) |
| **Licence** | Gratuit |
| **Prix** | Gratuit |
| **Stars** | — |
| **URL** | https://github.com/Ju99ernaut/grapesjs-plugin-toolbox |

**Description :** 5 outils : CSS Grid layout, canvas resizer, générateur de palette depuis image, fil d'Ariane (breadcrumbs), icônes dans le Layer Manager.

**Verdict :** Plugin peu connu (0 avis). Les breadcrumbs et les icônes de layers amélioreraient l'UX. À surveiller.

---

### 13. ScribeJS RTE
| | |
|---|---|
| **Auteur** | DevFuture Development |
| **Licence** | Gratuit |
| **Prix** | Gratuit |
| **Stars** | — |
| **URL** | https://gjs.market/products/rte-scribejs-for-grapesjs-inline-toolbar |

**Description :** Remplacement du RTE natif par ScribeJS, un éditeur de texte enrichi léger avec toolbar inline. Détection d'état des commandes fiable, compatible iframe.

**Verdict :** Plugin jeune (février 2026), 1 seul avis mentionnant des bugs (toolbar qui disparaît). **À surveiller dans quelques mois**, pas maintenant.

---

### 14. Style Filter
| | |
|---|---|
| **Auteur** | GrapesJS Official (artf) |
| **Licence** | BSD-3 |
| **Prix** | Gratuit |
| **Stars** | ⭐20 |
| **URL** | https://github.com/GrapesJS/style-filter |

**Description :** Propriétés CSS `filter` et `backdrop-filter` (flou, luminosité, contraste…) dans le Style Manager.

**Verdict :** Usage niche pour un site institutionnel. Dépend du Style Manager. Faible priorité.

---

### 15. Fonts ⚠️ Archivé
| | |
|---|---|
| **Auteur** | Silexlabs (lexoyo) |
| **Licence** | MIT |
| **Prix** | Gratuit |
| **Stars** | ⭐32 |
| **URL** | https://github.com/silexlabs/grapesjs-fonts |

**Description :** Gestion des Google Fonts avec UI (parcourir, installer, gérer les polices). API Google Fonts V3, sauvegarde dans les données du projet, génération CSS/HTML pour le site final.

**Verdict :** ⚠️ **Repo archivé le 2 juillet 2026.** Le code a migré vers le monorepo Silex. Le package npm n'est plus maintenu indépendamment. **Ne pas intégrer en l'état.**

---

### 16. Symbols ⚠️ Archivé + AGPL
| | |
|---|---|
| **Auteur** | Silexlabs (lexoyo) |
| **Licence** | **AGPL-3.0** ⚠️ |
| **Prix** | Gratuit |
| **Stars** | ⭐24 |
| **URL** | https://github.com/silexlabs/grapesjs-symbols |

**Description :** Composants réutilisables (symbols) synchronisés : modifiez une instance, toutes sont mises à jour. Idéal pour headers, footers, composants récurrents. UI complète : création, instances, détachement, icônes. Génération automatique d'IDs uniques pour éviter les conflits DOM.

**Verdict :** ⚠️ **Double problème :** repo archivé (2 juillet 2026) + licence AGPL-3.0 (copyleft fort, obligations de publication du code source). Le concept est excellent mais ces deux facteurs sont rédhibitoires pour le moment. **Ne pas intégrer.**

---

## 🔴 Non pertinent

| # | Plugin | ⭐ | Raison | URL |
|---|---|---|---|---|
| 17 | **Navbar** | 39 | Doublon : la navbar est gérée par Twig (`base.html.twig`) | https://github.com/GrapesJS/components-navbar |
| 18 | **Lory Slider** | 28 | Doublon du Bootstrap Carousel maison + code 9 ans sans mise à jour | https://github.com/GrapesJS/components-lory |
| 19 | **Countdown** | 21 | Aucun besoin de compte à rebours pour un site institutionnel | https://github.com/GrapesJS/components-countdown |
| 20 | **Touch** | 20 | Code vieux de 8 ans, support tactile probablement intégré au core | https://github.com/GrapesJS/touch |
| 21 | **Firestore** | 32 | Stockage Firebase — CNCDP utilise PostgreSQL, pas Firebase | https://github.com/GrapesJS/storage-firestore |
| 22 | **Typed** | 25 | Animation texte « typing » — gadget, pas d'usage institutionnel | https://github.com/GrapesJS/components-typed |
| 23 | **Click** | 7 | Remplacer drag-and-drop par clic — 0 release, trop niche | https://github.com/bgrand-ch/grapesjs-click |
| 24 | **Float** | 2 | Positionnement floating UI — 0 release, ⭐2, trop niche | https://github.com/bgrand-ch/grapesjs-float |
| 25 | **Preset Newsletter** | 216 | Builder newsletter email — hors scope (CNCDP = site web) | https://github.com/GrapesJS/preset-newsletter |
| 26 | **MJML** | 711 | Builder newsletter MJML — hors scope | https://github.com/GrapesJS/mjml |
| 27 | **grapesjs-vue** | — | Wrapper Vue 3 — CNCDP est Symfony/Twig, pas Vue | https://gjs.market/products/grapesjs-vue |

---

## 🔵 Déjà intégrés dans CNCDP

| Plugin | Rôle | URL |
|---|---|---|
| **gjs-blocks-basic** | Blocs de base (colonnes, texte, image, vidéo, map) | https://github.com/GrapesJS/blocks-basic |
| **grapesjs-preset-webpage** | Preset page web (import, devices, blocs link/quote/text-basic) | https://github.com/GrapesJS/preset-webpage |
| **grapesjs-blocks-bootstrap4** | Blocs Bootstrap 4 (grille, cartes, badges…) | https://github.com/GrapesJS/blocks-bootstrap4 |

---

# 📊 Résumé

## Plugins GrapesJS — Plan d'intégration recommandé

| Ordre | Plugin | Justification |
|---|---|---|
| **1** | IndexedDB | Corrige un bug documenté (storage inopérant) |
| **2** | Forms | Comble l'absence totale de formulaires |
| **3** | TOAST UI Image Editor | Ajoute l'édition d'image sans quitter l'éditeur |
| **4** | Custom Code | Permet le code libre pour les admins avancés |
| **5** | Blocks Flexbox | Améliore les possibilités de layout |
| *(optionnel)* | Parser PostCSS | Si Custom Code est intégré, pour la robustesse CSS |
| *(optionnel)* | UI Suggest Classes | Confort UX, ajout rapide |
| *(futur)* | Style Bg + Gradient + Filter | Si le Style Manager est activé |

---

# 📦 Autres extensions

> *Cette section est réservée aux futurs plugins d'autres types (bundles Symfony, extensions Twig, packages Doctrine, etc.).*

*Aucune autre extension évaluée pour le moment.*

---

> Dernière mise à jour : 18/07/2026 — Session [PLUGINS] [GRAPESJS]
