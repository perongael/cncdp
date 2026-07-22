# Authentification

> Créé le 16/07/2026 — Session [INIT-DOC]

## Fonctionnement

Authentification basée sur le composant **Symfony Security** avec un provider `in_memory`.

### Utilisateur unique

| Champ | Valeur |
|---|---|
| Identifiant | `admin@cncdp.fr` |
| Rôle | `ROLE_ADMIN` |
| Mot de passe | Hashé via `security:hash-password` (bcrypt) |

⚠️ Un seul compte admin configuré en dur dans `config/packages/security.yaml`.

### Firewalls

```
firewall main  → pattern: / (lazy, pas de login)
firewall admin → pattern: ^/admin
                  ├── form_login (login_path: admin_login, check_path: admin_login)
                  ├── logout (path: admin_logout, target: admin_login)
                  └── provider: users_in_memory
firewall dev   → pattern: ^/(_profiler|_wdt|assets|build)/ → security: false
```

### Contrôle d'accès

```
^/admin/login  → PUBLIC_ACCESS
^/admin        → ROLE_ADMIN
```

## Routes

| Nom | Chemin | Contrôleur | Accès |
|---|---|---|---|
| `admin_login` | `/admin/login` | `SecurityController::login` | Public |
| `admin_logout` | `/admin/logout` | `SecurityController::logout` (intercepté) | Admin |

## Flux de connexion

1. GET `/admin/login` → affiche le formulaire (`admin/login.html.twig`)
2. POST `/admin/login` → `form_login` intercepte, vérifie credentials
3. Succès → redirection vers `admin_dashboard`
4. Échec → retour au formulaire avec message d'erreur
5. Si déjà connecté → redirection immédiate vers `admin_dashboard`

## Templates

- `templates/admin/login.html.twig` — **Page autonome** (n'étend PAS `base_admin.html.twig`, pour ne pas exposer la sidebar)
- Champ `_username`, `_password`, `_csrf_token`
- Affichage conditionnel des erreurs via `{{ error }}`
- La page de login est un `<html>` complet indépendant, sans aucune navigation admin

## Sécurité

- CSRF activé sur le formulaire de login (`csrf_token('authenticate')`)
- Session protégée
- Le mot de passe n'est JAMAIS en clair dans les fichiers

## Évolution prévue

- Migrer le provider de `in_memory` vers une entité `User` en base de données
- Supporter plusieurs comptes admin
- Ajouter un `ROLE_SUPER_ADMIN` si nécessaire
