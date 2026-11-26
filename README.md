# PROJECT RADAR — DISCOVERY ENGINE V2

Plateforme web responsive (desktop & mobile) de veille technologique et d’innovations grand public avec moteur autonome intégré, compatible serveur Node classique **et** hébergement serverless **Netlify**.

## 1. Déploiement sur Netlify (recommandé pour un accès 24h/24 sur ordi & mobile)

Le dépôt contient déjà `netlify.toml`, les fonctions serverless `netlify/functions/api.mjs` et `netlify/functions/daily-scan.mjs`, ainsi que la persistance automatique sur **Netlify Blobs** (sans base de données externe à installer).

1. Poussez ce dossier sur GitHub (`.gitignore` protège automatiquement `.env`, `data/secrets.json` et `data/store.json`).
2. Sur **Netlify** -> *Add new site* -> *Import an existing project* -> sélectionnez le dépôt :
   - Build command : `npm run build`
   - Publish directory : `dist`
3. Dans **Site configuration -> Environment variables**, ajoutez vos clés :
   - `TAVILY_API_KEY` (recherche web + X.com)
   - `GEMINI_API_KEY` (synthèse 17 points en français)
   - *(Optionnel)* `X_BEARER_TOKEN` si vous souhaitez utiliser l’API officielle X en plus de Tavily.
4. Déployez : votre site HTTPS est accessible sur mobile et ordinateur, et la fonction planifiée `daily-scan` exécute une veille automatique chaque matin à `07h00 UTC` (`08h00` Paris).

## 2. Démarrage sur serveur Node / VPS / local

```bash
npm install
npm run build
npm start
```

L’application est alors accessible sur `http://localhost:3000`.
