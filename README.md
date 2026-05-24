# LCSI Lab Website

## Description

Ce projet est le site web du laboratoire LCSI, conçu pour présenter les équipes, les publications, et les avancées en recherche et innovation. Le site est multilingue (français et anglais) et inclut des fonctionnalités avancées telles que l'authentification via Google OAuth, le stockage d'images avec Cloudinary, et la gestion des données avec Neon.

---

## Structure des fichiers

```
├── prisma/
│   ├── schema.prisma          # Définition du schéma de la base de données
│   ├── migrations/            # Fichiers de migration Prisma
├── public/
│   ├── fonts/                 # Polices locales
│   ├── uploads/               # Dossier pour les fichiers uploadés (Cloudinary)
├── src/
│   ├── app/                   # Pages et API Next.js
│   │   ├── [locale]/          # Pages multilingues
│   │   ├── api/               # Routes API (auth, upload, etc.)
│   ├── components/            # Composants réutilisables
│   ├── contexts/              # Gestion des contextes React
│   ├── hooks/                 # Hooks personnalisés
│   ├── lib/                   # Fonctions utilitaires
│   ├── types/                 # Définition des types TypeScript
├── .env                       # Variables d'environnement
├── next.config.ts             # Configuration Next.js
├── tailwind.config.ts         # Configuration Tailwind CSS
├── tsconfig.json              # Configuration TypeScript
```

---

## Technologies utilisées

### 1. **Stockage d'images avec Cloudinary**

- **Cloudinary** est utilisé pour le stockage des fichiers uploadés.
- **Configuration** :
  - Ajoutez les variables suivantes dans votre fichier `.env` :
    ```env
    CLOUDINARY_CLOUD_NAME=your-cloud-name
    CLOUDINARY_API_KEY=your-api-key
    CLOUDINARY_API_SECRET=your-api-secret
    CLOUDINARY_UPLOAD_PRESET=lcsi
    ```
  - Les fichiers sont uploadés directement vers Cloudinary via l'API dans `src/app/api/upload/route.ts`.

---

### 3. **Authentification avec Google OAuth**

- **Configuration** :

  - Ajoutez les variables suivantes dans votre fichier `.env` :
    ```env
    GOOGLE_CLIENT_ID=your-client-id
    GOOGLE_CLIENT_SECRET=your-client-secret
    NEXTAUTH_URL=https://lcsi-lab-website-six.vercel.app
    ```
  - Configurez les URLs dans Google Console :
    - **Origines JavaScript autorisées** :
      - `https://lcsi-lab-website-six.vercel.app`
      - `http://localhost:3000`
    - **URI de redirection autorisées** :
      - `https://lcsi-lab-website-six.vercel.app/api/auth/callback/google`
      - `http://localhost:3000/api/auth/callback/google`

- **Intégration dans le code** :
  - L'authentification est gérée via NextAuth.js.
  - Exemple de configuration dans `src/app/api/auth/[...nextauth].ts`.

---

## Développement

### Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/lahcenbcf/LCSI-website.git
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```

### Lancer le projet en développement

1. Ajoutez un fichier `.env` avec les configurations nécessaires.
2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## Déploiement

### 1.Préparer toutes les variables d'environnement :

0. here's link to a drive to know how to get each variable : 

1. DATABASE_URL : local Database URL deployed in Docker (postgres)
2. NEXTAUTH_SECRET : générez un secret fort ex via Node (node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")

3. Google OAuth: GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.
4. Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET, CLOUDINARY_UPLOAD_PRESET.

### 2.Déployer sur Vercel (obtenir vercel.app)

1. Vous obtiendrez une url du type https://your-project.vercel.app. Gardez-la pour tester.

### 3.Configurer Google Oauth

1. Authorized JavaScript origins (exact origin, pas de slash) :
   - https://lcsi.esi.dz
   - https://your-project.vercel.app
   - http://localhost:3000
2. Authorized redirect URIs (exact path) :
   - https://lcsi.esi.dz/api/auth/callback/google
   - https://your-project.vercel.app/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google

#### 5.Mettre les environnements dans Vercel

Allez dans Vercel → Project → Settings → Environment Variables.
Ajoutez ces variables:
NEXTAUTH_URL = https://your-project.vercel.app mais aprés la config de DNS vous devez changer vers https://lcsi.esi.dz
NEXTAUTH_SECRET = (valeur générée)
DATABASE_URL = (Neon url)
CLOUDINARY_CLOUD_NAME =
CLOUDINARY_API_KEY =
CLOUDINARY_API_SECRET =
CLOUDINARY_UPLOAD_PRESET =
GOOGLE_CLIENT_ID = ...
GOOGLE_CLIENT_SECRET = ...

### 6. Ajouter domaine lcsi.esi.dz dans Vercel et DNS

In Vercel project > Domains, add lcsi.esi.dz.
Vercel gives you DNS records (CNAME / A / TXT) to set at your DNS provider.
Add them; wait for verification and propagation.
After the domain is verified, Vercel will serve your project at https://lcsi.esi.dz
