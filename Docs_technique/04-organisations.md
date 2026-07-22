# Gestion des organisations adhérentes

> Créé le 16/07/2026 — Session [INIT-DOC]

## État actuel

Les organisations sont **statiques** : 3 entrées en dur dans le template `admin/organizations.html.twig`.

## Organisations en dur

| Sigle | Nom complet | Statut |
|---|---|---|
| FFPP | Fédération Française des Psychologues et de Psychologie | Actif |
| SNP | Syndicat National des Psychologues | Actif |
| UNCP | Union Nationale des Cliniciens Psychologues | Actif |

## Route

| Nom | Chemin | Contrôleur |
|---|---|---|
| `admin_organizations` | `/admin/organisations` | `AdminController::organizations` |

## Template

`templates/admin/organizations.html.twig` affiche un tableau avec :
- Logo (placeholder textuel)
- Sigle
- Nom complet
- Statut (badge)
- Actions (boutons Modifier/Supprimer — non fonctionnels)

Les boutons "Ajouter", "Modifier" et "Supprimer" sont purement décoratifs.

## Affichage front

Aucun affichage dynamique des organisations sur le front-office. Une carte "Adhésion des organisations" existe dans les accès rapides de la page d'accueil, mais renvoie vers `#`.

## Évolution prévue

1. Créer une entité `Organization` (sigle, nom, logo, statut, date d'adhésion, ordre d'affichage)
2. CRUD admin complet (ajout, modification, suppression, upload logo)
3. Affichage dynamique sur la page d'accueil (section "Accès rapides" → vraie page organisations)
4. Page publique listant toutes les organisations adhérentes
