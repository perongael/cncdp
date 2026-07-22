# Guide de Déploiement Automatique : VS Code → GitHub → Infomaniak (SSH)

Ce guide explique comment configurer un déploiement automatique d'un projet Symfony depuis VS Code vers un hébergement Infomaniak via GitHub Actions et SSH.

## Architecture

```
VS Code (local) → git push → GitHub → GitHub Actions → SSH/rsync → Infomaniak
```

Chaque `git push` sur la branche `main` déclenche automatiquement le déploiement.

---

## Prérequis

- Un projet Symfony fonctionnel en local
- Un compte GitHub
- Un hébergement web Infomaniak avec accès SSH
- Git installé sur la machine locale

---

## Étape 1 : Initialiser le dépôt Git

```bash
cd /chemin/vers/projet
git init
git add .
git commit -m "Initial commit"
```

## Étape 2 : Créer le dépôt GitHub

1. Aller sur https://github.com/new
2. Créer un nouveau dépôt (public ou privé)
3. Ne PAS initialiser avec README

Puis lier le dépôt local :

```bash
git remote add origin https://github.com/UTILISATEUR/NOM_REPO.git
git branch -M main
git push -u origin main
```

---

## Étape 3 : Générer une clé SSH

Sur la machine locale :

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/infomaniak_deploy -N ""
```

Cela crée deux fichiers :
- `~/.ssh/infomaniak_deploy` (clé privée)
- `~/.ssh/infomaniak_deploy.pub` (clé publique)

**Important :** Infomaniak exige l'algorithme `ed25519`. Les clés RSA sont refusées.

---

## Étape 4 : Déposer la clé publique sur Infomaniak

1. Se connecter en SSH à Infomaniak avec le mot de passe :
   ```bash
   ssh UTILISATEUR@SERVEUR_FTP
   ```

2. Créer le dossier `.ssh` et le fichier `authorized_keys` :
   ```bash
   cd ~
   mkdir -p .ssh
   chmod 700 .ssh
   echo "CONTENU_DE_LA_CLE_PUBLIQUE" >> .ssh/authorized_keys
   chmod 600 .ssh/authorized_keys
   exit
   ```

   Remplacer `CONTENU_DE_LA_CLE_PUBLIQUE` par le contenu de `~/.ssh/infomaniak_deploy.pub` (une seule ligne commençant par `ssh-ed25519 ...`).

---

## Étape 5 : Configurer les secrets GitHub

Aller dans **GitHub** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Ajouter ces secrets :

| Nom | Valeur |
|-----|--------|
| `FTP_SERVER` | Serveur SSH/FTP Infomaniak (ex: `xxxxx.ftp.infomaniak.com`) |
| `FTP_USERNAME` | Utilisateur SSH Infomaniak (ex: `uid257669`) |
| `SSH_PRIVATE_KEY` | Contenu complet de `~/.ssh/infomaniak_deploy` (de `-----BEGIN` à `-----END-----`) |

---

## Étape 6 : Créer le workflow GitHub Actions

Créer le fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Infomaniak

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Install SSH key
        uses: shimataro/ssh-key-action@v2
        with:
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          known_hosts: unnecessary
          if_key_exists: replace
      
      - name: Add known hosts
        run: ssh-keyscan -p 22 ${{ secrets.FTP_SERVER }} >> ~/.ssh/known_hosts
      
      - name: Deploy via rsync
        run: |
          rsync -avz --delete \
            --exclude '.git*' \
            --exclude '.github/' \
            --exclude 'node_modules/' \
            --exclude 'var/' \
            --exclude '.env.local' \
            --exclude '.env.prod' \
            --exclude '.env.dev' \
            --exclude '.env.test' \
            --exclude 'public/uploads/' \
            --exclude 'vendor/' \
            --exclude '*.md' \
            --exclude 'docs/' \
            --exclude 'guides_import/' \
            --exclude 'csv_import/' \
            ./ ${{ secrets.FTP_USERNAME }}@${{ secrets.FTP_SERVER }}:~/sites/NOM_DU_SITE/
      
      - name: Install dependencies on server
        run: |
          ssh ${{ secrets.FTP_USERNAME }}@${{ secrets.FTP_SERVER }} << 'EOF'
            cd ~/sites/NOM_DU_SITE/
            # Créer .env.local seulement s'il n'existe pas (pour ne pas écraser DATABASE_URL)
            if [ ! -f .env.local ]; then
              echo "APP_ENV=prod" > .env.local
              echo "APP_SECRET=$(openssl rand -hex 16)" >> .env.local
              echo "⚠️ .env.local créé - Ajouter DATABASE_URL manuellement"
            fi
            export APP_ENV=prod
            composer install --no-dev --optimize-autoloader --no-interaction
            php bin/console asset-map:compile
            php bin/console cache:clear
          EOF
```

**⚠️ IMPORTANT** : Le workflow ne crée le `.env.local` que s'il n'existe pas. La première fois, vous devez ajouter manuellement le `DATABASE_URL` (voir Étape 7.1).

**Remplacer `NOM_DU_SITE`** par le nom du dossier du site (ex: `test.ffppespaceadherent.space`).

---

## Étape 7 : Configurer le serveur Infomaniak

### 7.1 Créer le fichier `.env.local` sur le serveur

Se connecter en SSH et créer le fichier :

```bash
ssh UTILISATEUR@SERVEUR
cd ~/sites/NOM_DU_SITE/
nano .env.local
```

Contenu :
```
APP_ENV=prod
APP_SECRET=UNE_CLE_SECRETE_ALEATOIRE
DATABASE_URL="mysql://USER_BDD:MOT_DE_PASSE@SERVEUR_MYSQL:3306/NOM_BDD?serverVersion=8.0&charset=utf8mb4"
```

Sauvegarder : `Ctrl+O` puis `Ctrl+X`

### 7.2 Configurer le Document Root

Dans le **Manager Infomaniak** → **Hébergement Web** → **Sites** :
- Modifier le **dossier racine** pour qu'il pointe vers `/sites/NOM_DU_SITE/public/`

### 7.3 Exécuter les migrations

```bash
php bin/console doctrine:migrations:migrate --no-interaction
```

---

## Étape 8 : Premier déploiement

Pousser le code :

```bash
git add .
git commit -m "Setup deployment"
git push
```

Surveiller le déploiement sur : `https://github.com/UTILISATEUR/REPO/actions`

---

## Utilisation quotidienne

Pour déployer des modifications :

```bash
git add .
git commit -m "Description du changement"
git push
```

Le déploiement prend environ **10-30 secondes**.

---

## Fichiers exclus du déploiement

Ces fichiers/dossiers ne sont **pas** synchronisés (ils restent sur le serveur) :

| Exclusion | Raison |
|-----------|--------|
| `.git*` | Historique Git non nécessaire en production |
| `.github/` | Workflows GitHub Actions |
| `vendor/` | Réinstallé via `composer install` sur le serveur |
| `var/` | Cache et logs (régénérés automatiquement) |
| `node_modules/` | Dépendances Node.js |
| `.env.local` | Configuration locale du serveur (BDD, secrets) |
| `public/uploads/` | Fichiers uploadés par les utilisateurs |

---

## Dépannage

### Erreur "DebugBundle not found"
Le fichier `.env.local` n'existe pas ou `APP_ENV` n'est pas `prod`.

### Erreur 403 Forbidden
Le document root ne pointe pas vers le dossier `public/`.

### CSS/JS non chargés
Exécuter `php bin/console asset-map:compile` sur le serveur.

### Connexion SSH refusée
- Vérifier que la clé est en `ed25519` (pas RSA)
- Vérifier les permissions : `.ssh` = 700, `authorized_keys` = 600

### Site cassé après déploiement (erreur connexion BDD)
**Cause** : Le workflow a écrasé le `.env.local` et supprimé le `DATABASE_URL`.

**Solution** : Recréer le `.env.local` sur le serveur :
```bash
ssh UTILISATEUR@SERVEUR
cd ~/sites/NOM_DU_SITE/
nano .env.local
```

Remettre :
```
APP_ENV=prod
APP_SECRET=votre_secret
DATABASE_URL="mysql://USER:PASS@SERVEUR:3306/BDD?serverVersion=8.0&charset=utf8mb4"
```

**Prévention** : Le workflow doit utiliser `if [ ! -f .env.local ]` pour ne créer le fichier que s'il n'existe pas.
- Vérifier que la clé publique est sur une seule ligne

---

## Informations de connexion Infomaniak

| Type | Où trouver |
|------|------------|
| Serveur FTP/SSH | Manager → Hébergement Web → Accès FTP/SSH |
| Utilisateur | Manager → Hébergement Web → Accès FTP/SSH |
| Serveur MySQL | Manager → Hébergement Web → Bases de données |
| Utilisateur BDD | Manager → Hébergement Web → Bases de données |

---

## Structure du projet Symfony

```
projet/
├── .github/
│   └── workflows/
│       └── deploy.yml       # Workflow de déploiement
├── bin/
├── config/
├── public/                  # Document root du serveur
│   └── index.php
├── src/
├── templates/
├── var/                     # Cache, logs (exclu du git)
├── vendor/                  # Dépendances (exclu du git)
├── .env                     # Configuration par défaut
├── .env.local               # Configuration locale (non versionné)
├── .gitignore
└── composer.json
```

---

## Résumé des commandes

```bash
# Initialisation unique
git init
git remote add origin https://github.com/USER/REPO.git
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/infomaniak_deploy -N ""

# Déploiement quotidien
git add .
git commit -m "Message"
git push

# Sur le serveur (maintenance)
ssh USER@SERVER
cd ~/sites/NOM_SITE/
php bin/console cache:clear
php bin/console doctrine:migrations:migrate
```

> Mis à jour le 14 avril 2026 — Session [FIX-PROD]
