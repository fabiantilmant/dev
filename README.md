# 🛍️ Votre Boutique

Application web mobile-first pour aider les commerçants locaux à créer et publier des posts Facebook grâce à l'IA.

---

## 🚀 Mise en place (30 minutes)

### 1. Cloner et installer

```bash
git clone https://github.com/fabiantilmant/superette.git
cd superette
npm install
```

### 2. Variables d'environnement

Copiez `.env.example` en `.env.local` et remplissez :

```bash
cp .env.example .env.local
```

| Variable | Où la trouver |
|---|---|
| `VITE_SUPABASE_URL` | supabase.com > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | supabase.com > Settings > API |
| `VITE_FACEBOOK_APP_ID` | developers.facebook.com > Settings > Basic |
| `FACEBOOK_APP_SECRET` | developers.facebook.com > Settings > Basic |
| `ANTHROPIC_API_KEY` | console.anthropic.com > API Keys |
| `VITE_APP_URL` | `http://localhost:5173` en dev |

### 3. Base de données Supabase

Dans votre projet Supabase > SQL Editor, exécutez :

```
supabase/migrations/001_initial_schema.sql
```

### 4. Lancer en local

```bash
npm run dev
```

Ouvrez http://localhost:5173

---

## 📦 Déploiement sur Vercel

1. Importez le repo GitHub dans Vercel
2. Ajoutez les variables d'environnement dans Vercel > Settings > Environment Variables :
   - `ANTHROPIC_API_KEY`
   - `FACEBOOK_APP_SECRET`
   - `FACEBOOK_APP_ID`
   - `APP_URL` = votre URL Vercel (ex: https://superette.vercel.app)
3. Vercel déploie automatiquement à chaque push sur `main`

---

## 🏗️ Structure du projet

```
superette/
├── api/                    # Vercel Functions (côté serveur)
│   ├── generate-post.js    # Génération de posts via Claude
│   ├── generate-reply.js   # Génération de réponses
│   └── auth/
│       └── facebook.js     # OAuth Facebook (échange du token)
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── OnboardingPage.jsx
│   │   ├── CreatePostPage.jsx
│   │   ├── RepliesPage.jsx
│   │   ├── ShopInfoPage.jsx
│   │   └── FbCallbackPage.jsx
│   ├── components/
│   │   └── BottomNav.jsx
│   ├── lib/
│   │   ├── supabase.js     # Client DB + helpers
│   │   ├── facebook.js     # Graph API Facebook
│   │   └── ai.js           # Appels à l'API Anthropic
│   └── styles/
│       └── index.css
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── vercel.json
```

---

## 🔐 Sécurité

- Les secrets (`ANTHROPIC_API_KEY`, `FACEBOOK_APP_SECRET`) ne sont **jamais** exposés côté client
- Tous les appels sensibles passent par les Vercel Functions (`/api/...`)
- Supabase Row Level Security : chaque boutique ne voit que ses propres données
- Les tokens Facebook sont stockés en base (à chiffrer en production)

---

## 📋 Roadmap v1 (test utilisateurs)

- [x] Auth email/password
- [x] Onboarding boutique
- [x] Génération de posts par IA
- [x] Connexion Facebook OAuth
- [x] Publication sur Facebook
- [x] Gestion des réponses
- [ ] Upload de vraies photos
- [ ] Sélection de la Page Facebook (si plusieurs)
- [ ] Historique des publications
- [ ] Notifications push
