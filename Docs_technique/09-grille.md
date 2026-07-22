# Outil Grille de mise en page

> Créé le 18/07/2026 — Session [GRID] [CSSGRID]
> Retiré le 18/07/2026 — Même session

## Historique

### Version 1 — Bootstrap (abandonnée)

Approche basée sur les classes Bootstrap (`row` + `col-md-X offset-md-Y`) avec un overlay de grille 12 colonnes.

**Problèmes rencontrés :**
- Calculs d'offsets complexes et fragiles
- Marges négatives de `.row` Bootstrap qui décallent tout
- `align-items: stretch` qui étire les colonnes
- Tracking complexe (`gridRows[]`, `cols[]`) avec recalculs à chaque ajout
- Bugs de décalage, de redimensionnement, d'ordre de création
- ~250 lignes de JS

### Version 2 — CSS Grid (abandonnée)

Migration vers CSS Grid natif : `grid-template-columns: repeat(12, 1fr)`, `grid-auto-rows`, `grid-column` / `grid-row`.

**Avancées :**
- Code réduit à ~80 lignes
- Positionnement natif, sans calcul d'offset
- Aucune interférence entre zones
- Indépendance de l'ordre de création
- Blocage des cellules déjà occupées (hachurage visuel)
- Alignement overlay ↔ CSS Grid dynamique

**Fonctionnalités implémentées :**
- Overlay de grille 12×N avec quadrillage visible
- Sélection clic-glissé avec retour visuel
- Création de zones CSS Grid
- Cellules occupées hachurées, clic bloqué
- Détection de conflit (sélection qui chevauche une zone existante)
- Survie à la désactivation/réactivation

### Code retiré

| Fichier | Sections supprimées |
|---|---|
| `templates/admin/page_editor.html.twig` | Bouton 📐 Grille, `<div id="grid-overlay">`, CSS grille (~60 lignes) |
| `assets/page-editor.js` | Section `// === Outil Grille CSS Grid (📐) ===` (~130 lignes) |

## Raison du retrait

1. **Redondance avec GrapesJS** : l'éditeur permet déjà de créer des layouts par glisser-déposer de blocs Row/Column depuis la palette, avec un rendu Bootstrap natif et responsive.
2. **Incohérence technique** : la grille produisait un conteneur CSS Grid, alors que tout le site utilise Bootstrap 4.6. Les zones créées n'étaient pas responsives.
3. **Workflow peu intuitif** : créer une zone vide, puis y glisser du contenu manuellement → moins fluide que le glisser-déposer direct de blocs.
4. **Complexité pour l'utilisateur final** : risque de confusion entre « zones grille » et « blocs Bootstrap ».

## Leçon apprise

Un outil de grille visuelle n'est pas nécessaire quand l'éditeur WYSIWYG sous-jacent (GrapesJS) fournit déjà des blocs de mise en page (Row, Column, Grid Bootstrap). L'approche « glisser-déposer de composants » est plus naturelle et produit un code cohérent avec le framework CSS du site.

## Code conservé pour référence future

Si le besoin d'un outil de grille visuelle revient, l'approche CSS Grid (version 2) est la bonne piste. Le code est documenté ci-dessous :

```js
// Approche CSS Grid (simplifiée)
var container = editor.getWrapper().components().add({
    style: { 'display': 'grid', 'grid-template-columns': 'repeat(12, 1fr)', 'grid-auto-rows': '70px' }
});
container.components().add({
    style: { 'grid-column': '5 / span 4', 'grid-row': '1 / span 3' },
    content: 'Zone'
});
```

> Dernière mise à jour : 18/07/2026 — Retrait de l'outil
