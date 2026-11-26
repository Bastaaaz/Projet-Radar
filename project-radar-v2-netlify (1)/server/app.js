import express from 'express';
import {
  FREE_SOURCES,
  extractProductTokens,
  isDuplicateByTitle,
  runExternalWebSearch,
  runFreeFeedsScan,
} from './sources.js';
import {
  refreshDiscoveryWithAi,
  synthesizeLeadToDiscovery,
  testApiConnection,
} from './ai-synthesizer.js';
import {
  SECRET_KEYS,
  getRadarStore,
  getSecrets,
  isNetlifyRuntime,
  maskSecrets,
  readRawSecrets,
  saveRadarStore,
  saveSecrets,
} from './storage.js';

export async function executeAutonomousScan({ theme = 'all', customQuery = '', trigger = 'manual' } = {}) {
  const store = await getRadarStore();
  const secrets = await getSecrets();

  const existingUrls = new Set();
  const existingTokenSets = [];

  const makeTokenEntry = (text) => {
    const arr = extractProductTokens(text);
    const bigrams = new Set();
    for (let i = 0; i < arr.length - 1; i += 1) bigrams.add(`${arr[i]} ${arr[i + 1]}`);
    return { tokens: new Set(arr), bigrams };
  };

  for (const d of store.discoveries) {
    for (const l of d.liens || []) existingUrls.add(l.url);
    existingTokenSets.push(makeTokenEntry(d.nom));
  }
  for (const w of store.watchlist || []) {
    if (w.lien) existingUrls.add(w.lien);
    existingTokenSets.push(makeTokenEntry(w.nom));
  }

  const hasExternal = Boolean(
    secrets.TAVILY_API_KEY ||
      secrets.BRAVE_API_KEY ||
      secrets.SERPER_API_KEY ||
      secrets.X_BEARER_TOKEN
  );

  // Exécute les flux gratuits et la recherche web/X en parallèle pour rester rapide (< 9 s sur Netlify)
  const [freeResult, externalRes] = await Promise.all([
    runFreeFeedsScan({ theme, existingUrls, maxPerSource: 8 }),
    hasExternal
      ? runExternalWebSearch({ secrets, theme, customQuery }).catch((err) => ({
          provider: null,
          leads: [],
          error: err.message,
        }))
      : Promise.resolve({ provider: null, leads: [], error: null }),
  ]);

  const allCandidates = [...(externalRes.leads || []), ...freeResult.leads].sort(
    (a, b) => b.relevanceScore - a.relevanceScore
  );

  const combinedMap = new Map();
  const keptTokenSets = [...existingTokenSets];
  let duplicatesSkipped = freeResult.stats.duplicatesSkipped || 0;

  for (const lead of allCandidates) {
    if (!lead.url || existingUrls.has(lead.url) || combinedMap.has(lead.url)) {
      duplicatesSkipped += 1;
      continue;
    }
    if (isDuplicateByTitle(lead.title, keptTokenSets)) {
      duplicatesSkipped += 1;
      continue;
    }
    combinedMap.set(lead.url, lead);
    keptTokenSets.push(makeTokenEntry(lead.title));
  }

  const mergedLeads = Array.from(combinedMap.values()).slice(0, 45);

  const runRecord = {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    trigger,
    theme,
    customQuery: customQuery || null,
    sourcesQueried: freeResult.stats.sourcesQueried + (externalRes.provider ? 1 : 0),
    sourcesSucceeded: freeResult.stats.sourcesSucceeded + (externalRes.provider ? 1 : 0),
    rawItems: freeResult.stats.rawItems + (externalRes.leads?.length || 0),
    rejectedNoise: freeResult.stats.rejectedNoise,
    duplicatesSkipped,
    keptLeads: mergedLeads.length,
    externalProvider: externalRes.provider,
    externalError: externalRes.error || null,
    sourceErrors: freeResult.stats.sourceErrors,
  };

  store.leads = mergedLeads;
  store.scanHistory = [runRecord, ...(store.scanHistory || [])].slice(0, 15);
  await saveRadarStore(store);

  return { run: runRecord, leads: mergedLeads };
}

export function createApiApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Normalise les routes quand Express tourne derrière /.netlify/functions/api
  app.use((req, _res, next) => {
    if (req.url.startsWith('/.netlify/functions/api')) {
      const stripped = req.url.slice('/.netlify/functions/api'.length) || '/';
      req.url = stripped.startsWith('/api') ? stripped : `/api${stripped === '/' ? '' : stripped}`;
    } else if (!req.url.startsWith('/api') && /^\/(health|radar|scan|watchlist|connections|export)\b/.test(req.url)) {
      req.url = `/api${req.url}`;
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'PROJECT RADAR V2',
      runtime: isNetlifyRuntime() ? 'netlify-serverless' : 'node-standalone',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/radar', async (_req, res) => {
    try {
      const store = await getRadarStore();
      const secrets = await getSecrets();
      res.json({
        editionDate: store.editionDate,
        editionLabel: store.editionLabel,
        discoveries: store.discoveries,
        watchlist: store.watchlist,
        favorites: store.favorites,
        testedIds: store.testedIds,
        hiddenIds: store.hiddenIds,
        leads: store.leads,
        scanHistory: store.scanHistory,
        schedule: store.schedule,
        runtime: isNetlifyRuntime() ? 'netlify-serverless' : 'node-standalone',
        freeSourcesCount: FREE_SOURCES.length,
        freeSources: FREE_SOURCES.map((s) => ({
          id: s.id,
          name: s.name,
          region: s.region,
          categoryHint: s.categoryHint,
        })),
        connections: maskSecrets(secrets),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/radar/discoveries/:id/state', async (req, res) => {
    try {
      const { id } = req.params;
      const { action } = req.body || {};
      const store = await getRadarStore();

      const toggleIn = (arr, item) => (arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

      if (action === 'favorite') store.favorites = toggleIn(store.favorites, id);
      else if (action === 'tested') store.testedIds = toggleIn(store.testedIds, id);
      else if (action === 'hide') store.hiddenIds = toggleIn(store.hiddenIds, id);
      else if (action === 'delete') {
        store.discoveries = store.discoveries.filter((d) => d.id !== id);
      } else {
        return res.status(400).json({ error: 'Action invalide' });
      }

      await saveRadarStore(store);
      res.json({
        favorites: store.favorites,
        testedIds: store.testedIds,
        hiddenIds: store.hiddenIds,
        discoveriesCount: store.discoveries.length,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/radar/reset-hidden', async (_req, res) => {
    try {
      const store = await getRadarStore();
      store.hiddenIds = [];
      await saveRadarStore(store);
      res.json({ hiddenIds: [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/radar/discoveries/:id/notes', async (req, res) => {
    try {
      const { id } = req.params;
      const { userNote = '' } = req.body || {};
      const store = await getRadarStore();
      const idx = store.discoveries.findIndex((d) => d.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Fiche introuvable.' });
      store.discoveries[idx] = {
        ...store.discoveries[idx],
        userNote: String(userNote).slice(0, 1500),
      };
      await saveRadarStore(store);
      res.json({ discovery: store.discoveries[idx] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/radar/discoveries/:id/refresh', async (req, res) => {
    try {
      const { id } = req.params;
      const store = await getRadarStore();
      const secrets = await getSecrets();
      const idx = store.discoveries.findIndex((d) => d.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Fiche introuvable.' });

      const updatedDiscovery = await refreshDiscoveryWithAi(store.discoveries[idx], secrets);
      store.discoveries[idx] = updatedDiscovery;
      await saveRadarStore(store);
      res.json({ discovery: updatedDiscovery });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/watchlist', async (req, res) => {
    try {
      const { leadId, nom, categorie, raison, lien } = req.body || {};
      const store = await getRadarStore();
      let newItem = null;

      if (leadId) {
        const lead = (store.leads || []).find((l) => l.id === leadId);
        if (!lead) return res.status(404).json({ error: 'Piste introuvable.' });
        newItem = {
          id: `watch-${Date.now().toString(36)}`,
          nom: lead.title,
          categorie: lead.categoryHint || 'Piste du scanner',
          raison: lead.summary || `Repérée sur ${lead.sourceName}`,
          lien: lead.url,
          sourceName: lead.sourceName,
          addedAt: new Date().toISOString(),
        };
        store.leads = (store.leads || []).filter((l) => l.id !== leadId);
      } else if (nom && lien) {
        newItem = {
          id: `watch-${Date.now().toString(36)}`,
          nom: String(nom).trim(),
          categorie: String(categorie || 'À surveiller').trim(),
          raison: String(raison || '').trim(),
          lien: String(lien).trim(),
          addedAt: new Date().toISOString(),
        };
      } else {
        return res.status(400).json({ error: 'leadId ou (nom + lien) requis.' });
      }

      store.watchlist = [newItem, ...(store.watchlist || [])];
      await saveRadarStore(store);
      res.json({ watchlist: store.watchlist, leads: store.leads, added: newItem });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/watchlist/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const store = await getRadarStore();
      store.watchlist = (store.watchlist || []).filter((w) => w.id !== id);
      await saveRadarStore(store);
      res.json({ watchlist: store.watchlist });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/watchlist/:id/promote', async (req, res) => {
    try {
      const { id } = req.params;
      const store = await getRadarStore();
      const secrets = await getSecrets();
      const item = (store.watchlist || []).find((w) => w.id === id);
      if (!item) return res.status(404).json({ error: 'Piste en observation introuvable.' });

      const leadLike = {
        id: item.id,
        title: item.nom,
        summary: item.raison,
        url: item.lien,
        sourceName: item.sourceName || 'Watchlist Radar',
        region: 'GLOBAL',
        categoryHint: item.categorie,
        publishedAt: item.addedAt || new Date().toISOString(),
        matchedTags: ['Watchlist'],
        relevanceScore: 75,
      };
      const discovery = await synthesizeLeadToDiscovery(leadLike, secrets);
      store.discoveries = [discovery, ...store.discoveries];
      store.watchlist = (store.watchlist || []).filter((w) => w.id !== id);
      await saveRadarStore(store);
      res.json({ discovery, watchlist: store.watchlist });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/scan/run', async (req, res) => {
    try {
      const { theme = 'all', customQuery = '' } = req.body || {};
      const result = await executeAutonomousScan({ theme, customQuery, trigger: 'manual' });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/scan/promote', async (req, res) => {
    try {
      const { leadId, leadOverride } = req.body || {};
      const store = await getRadarStore();
      const secrets = await getSecrets();

      const lead = leadOverride || (store.leads || []).find((l) => l.id === leadId);
      if (!lead) return res.status(404).json({ error: 'Piste introuvable dans le dernier scan.' });

      const discovery = await synthesizeLeadToDiscovery(lead, secrets);
      store.discoveries = [discovery, ...store.discoveries];
      store.leads = (store.leads || []).filter((l) => l.id !== lead.id);
      await saveRadarStore(store);

      res.json({ discovery, leads: store.leads });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/connections', async (_req, res) => {
    try {
      const secrets = await getSecrets();
      const store = await getRadarStore();
      res.json({
        connections: maskSecrets(secrets),
        schedule: store.schedule,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/connections', async (req, res) => {
    try {
      const { keys = {}, schedule } = req.body || {};
      const current = await readRawSecrets();
      const updated = { ...current };

      for (const k of SECRET_KEYS) {
        if (Object.prototype.hasOwnProperty.call(keys, k)) {
          const val = String(keys[k] || '').trim();
          if (val === '__CLEAR__') delete updated[k];
          else if (val && !val.includes('••••')) updated[k] = val;
        }
      }

      await saveSecrets(updated);

      const store = await getRadarStore();
      if (schedule && typeof schedule === 'object') {
        store.schedule = {
          ...store.schedule,
          enabled: Boolean(schedule.enabled),
          hourParis: Math.min(23, Math.max(0, Number(schedule.hourParis ?? 8))),
        };
        await saveRadarStore(store);
      }

      const secrets = await getSecrets();
      res.json({
        ok: true,
        connections: maskSecrets(secrets),
        schedule: store.schedule,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/connections/test', async (req, res) => {
    try {
      const { provider, apiKey } = req.body || {};
      const secrets = await getSecrets();
      const keyMap = {
        tavily: secrets.TAVILY_API_KEY,
        brave: secrets.BRAVE_API_KEY,
        serper: secrets.SERPER_API_KEY,
        x: secrets.X_BEARER_TOKEN,
        gemini: secrets.GEMINI_API_KEY,
        anthropic: secrets.ANTHROPIC_API_KEY,
        openai: secrets.OPENAI_API_KEY,
      };
      const keyToTest = apiKey && !apiKey.includes('••••') ? apiKey : keyMap[provider];
      const result = await testApiConnection(provider, keyToTest);
      res.json(result);
    } catch (err) {
      res.status(500).json({ ok: false, message: err.message });
    }
  });

  app.get('/api/export/markdown', async (_req, res) => {
    try {
      const store = await getRadarStore();
      const lines = [
        `# PROJECT RADAR — DISCOVERY ENGINE V2`,
        `**Date de consultation :** ${store.editionDate}`,
        ``,
      ];
      for (const d of store.discoveries) {
        lines.push(`## [${d.section}] ${d.nom} — ${d.scoreTotal}/100`);
        lines.push(`1. **Nom :** ${d.nom}`);
        lines.push(`2. **Catégorie :** ${d.categorie}`);
        lines.push(`3. **Marque & pays :** ${d.marquePays}`);
        lines.push(`4. **Date de lancement/annonce :** ${d.dateLancement}`);
        lines.push(`5. **Description simple :** ${d.descriptionSimple}`);
        lines.push(`6. **Innovation réelle :** ${d.innovationReelle}`);
        lines.push(`7. **Utilité concrète :** ${d.utiliteConcrete}`);
        lines.push(`8. **Différence vs alternatives :** ${d.differenceAlternatives}`);
        lines.push(`9. **Prix & abonnements :** ${d.prixAbonnements}`);
        lines.push(`10. **Disponibilité géographique :** ${d.disponibiliteGeo}`);
        lines.push(`11. **Maturité :** Niveau ${d.maturiteNiveau} — ${d.maturiteLabel}`);
        lines.push(`12. **Confiance :** ${d.confiance} (${d.confianceDetail})`);
        lines.push(`13. **Traction :** ${d.traction}`);
        lines.push(`14. **Avantages :** ${(d.avantages || []).join(' ; ')}`);
        lines.push(`15. **Limites :** ${(d.limites || []).join(' ; ')}`);
        lines.push(`16. **Avis personnel :** ${d.avisPersonnel}`);
        lines.push(`17. **Liens :** ${(d.liens || []).map((l) => `[${l.label}](${l.url})`).join(' · ')}`);
        lines.push(``);
      }
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="project-radar-${store.editionDate}.md"`);
      res.send(lines.join('\n'));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}
