# Architecture globale

> Créé le 16/07/2026 — Session [INIT-DOC]

## Stack technique

| Composant | Technologie | Version |
|---|---|---|
| Langage | PHP | ≥ 8.2 |
| Framework | Symfony | 7.4.* |
| Base de données | PostgreSQL (Docker) | 16-alpine |
| ORM | Doctrine ORM | 3.6.* |
| Migrations | Doctrine Migrations Bundle | 3.7.* |
| Templates | Twig | 2.12+ / 3.x |
| Assets | AssetMapper + importmap | 7.4.* |
| Frontend JS | StimulusBundle + UX Turbo | 2.36.* |
| Icônes | FontAwesome 6.5 (CDN) | 6.5.1 |
| Authentification | Symfony Security (in-memory) | 7.4.* |
| Sanitization HTML | Symfony HTML Sanitizer | 7.4.* |

## Arborescence

```
cncdp/
├── assets/                  # JS, CSS, contrôleurs Stimulus
│   ├── controllers/         # Contrôleurs Stimulus
│   └── styles/
│       ├── cncdp.css        # Styles front-office
│       └── admin.css        # Styles back-office
├── config/
│   ├── packages/            # Configuration par bundle
│   └── routes/              # Routes YAML
├── migrations/              # Fichiers de migration Doctrine
├── public/                  # Point d'entrée (index.php)
│   └── images/              # Images statiques (logo, etc.)
├── src/
│   ├── Controller/
│   │   ├── PageController.php       # Routes publiques (front)
│   │   └── Admin/
│   │       ├── AdminController.php  # Routes back-office
│   │       └── SecurityController.php # Login/logout
│   ├── Entity/              # Entités Doctrine (vide actuellement)
│   ├── Repository/          # Repositories Doctrine (vide actuellement)
│   └── Kernel.php
├── templates/
│   ├── base.html.twig       # Layout front-office
│   ├── pages/               # Templates pages publiques
│   └── admin/               # Templates back-office
├── Docs_technique/          # Documentation technique
├── compose.yaml             # Docker Compose (PostgreSQL)
└── compose.override.yaml
```

## Conventions

- **Contrôleurs** : `App\Controller\` pour le front, `App\Controller\Admin\` pour le back-office
- **Routes admin** : préfixe `/admin`, protégées par `ROLE_ADMIN`
- **Templates** : `base.html.twig` pour le front, `admin/base_admin.html.twig` pour l'admin
- **CSS** : pas de framework CSS, feuilles personnalisées `cncdp.css` (front) et `admin.css` (back)
- **Nommage BDD** : `doctrine.orm.naming_strategy.underscore_number_aware`
- **Authentification** : actuellement `in_memory`, sera migrée vers BDD quand les entités seront créées

## Services Docker

Un seul service défini dans `compose.yaml` :
- **database** : PostgreSQL 16-alpine, ports exposés dynamiquement, volume nommé `database_data`
