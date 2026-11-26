const SECTION_LABELS = {
  A: 'Disponible en France',
  B: 'Disponible ailleurs dans le monde',
  C: 'Nouveautés émergentes',
  D: 'Les meilleures tractions du moment',
  E: 'La surprise du jour',
  TOP: 'Top Moment · Produits & Apps phares',
};

const MATURITY_LABELS = {
  1: 'Concept / Prototype',
  2: 'Précommercialisation',
  3: 'Première commercialisation',
  4: 'Adoption émergente',
  5: 'Produit confirmé',
};

// Chaîne de modèles Gemini actifs fin 2026 avec repli automatique en cas de 404/503
const GEMINI_MODELS = [
  'models/gemini-3-flash-preview',
  'models/gemini-flash-latest',
  'models/gemini-flash-lite-latest',
];

// En mode standalone ou sans Netlify, on garde aussi l'extraction page + image + cross-vérification Tavily
function upgradeImageUrl(rawUrl, baseUrl) {
  if (!rawUrl) return '';
  try {
    const resolved = new URL(rawUrl, baseUrl).href;
    if (/logo|favicon|sprite|placeholder|1x1|pixel/i.test(resolved)) return '';
    return resolved.replace(/^http:\/\//i, 'https://');
  } catch {
    return '';
  }
}

export async function fetchPageMetadata(url) {
  if (!url) return { text: '', imageUrl: '' };
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProjectRadarBot/2.0)' },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return { text: '', imageUrl: '' };
    const html = await res.text();

    let imageUrl = '';
    const imgPatterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];
    for (const rx of imgPatterns) {
      const m = html.match(rx);
      if (m && m[1]) {
        imageUrl = upgradeImageUrl(m[1], url);
        if (imageUrl) break;
      }
    }

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 7000);

    return { text, imageUrl };
  } catch {
    return { text: '', imageUrl: '' };
  }
}

async function runTavilyCrossVerification(queryText, tavilyKey) {
  if (!tavilyKey || !queryText) return { summary: '', urls: [] };
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: queryText,
        search_depth: 'basic',
        max_results: 4,
        include_answer: false,
      }),
      signal: AbortSignal.timeout(6500),
    });
    if (!res.ok) return { summary: '', urls: [] };
    const json = await res.json();
    const results = json.results || [];
    const summary = results
      .map((r, i) => `[Source ${i + 1}] ${r.title} (${r.url}) : ${(r.content || '').slice(0, 360)}`)
      .join('\n');
    return {
      summary,
      urls: results.map((r) => ({ title: r.title, url: r.url })),
    };
  } catch {
    return { summary: '', urls: [] };
  }
}

export async function testApiConnection(provider, apiKey) {
  const key = (apiKey || '').trim();
  if (!key) return { ok: false, message: 'Clé vide.' };

  const started = Date.now();
  try {
    if (provider === 'tavily') {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key, query: 'test', max_results: 1 }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, message: `Tavily connecté (${Date.now() - started} ms)` };
    }

    if (provider === 'brave') {
      const res = await fetch('https://api.search.brave.com/res/v1/web/search?q=test&count=1', {
        headers: { Accept: 'application/json', 'X-Subscription-Token': key },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, message: `Brave Search connecté (${Date.now() - started} ms)` };
    }

    if (provider === 'serper') {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': key },
        body: JSON.stringify({ q: 'test', num: 1 }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, message: `Serper connecté (${Date.now() - started} ms)` };
    }

    if (provider === 'x') {
      const res = await fetch('https://api.x.com/2/tweets/search/recent?query=innovation&max_results=10', {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, message: `API X.com connectée (${Date.now() - started} ms)` };
    }

    if (provider === 'gemini') {
      let lastErr = '';
      for (const model of GEMINI_MODELS) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'OK' }] }] }),
            signal: AbortSignal.timeout(12000),
          }
        );
        if (res.ok) {
          return { ok: true, message: `Google Gemini connecté via ${model} (${Date.now() - started} ms)` };
        }
        lastErr = `HTTP ${res.status} (${model})`;
      }
      throw new Error(lastErr);
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, message: `OpenAI connecté (${Date.now() - started} ms)` };
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, message: `Anthropic Claude connecté (${Date.now() - started} ms)` };
    }

    return { ok: false, message: `Fournisseur inconnu : ${provider}` };
  } catch (err) {
    return { ok: false, message: `Échec de connexion (${err.message})` };
  }
}

function buildRadarPrompt(lead, pageText, crossSummary = '') {
  return `Tu es le moteur éditorial "PROJECT RADAR — DISCOVERY ENGINE V2".
Analyse la source et la vérification croisée ci-dessous, puis génère UNE fiche JSON stricte en FRANÇAIS au format exact demandé.
RÈGLES IMPÉRATIVES :
- N'invente JAMAIS un prix, une date, un chiffre de ventes ou une disponibilité absents des textes fournis. Si une info manque, indique honnêtement "Non communiqué dans la source vérifiée".
- Distingue explicitement les annonces du fabricant des tests indépendants.
- Distingue clairement concept/prototype (niveau 1), campagne/précommande (niveau 2), première commercialisation (niveau 3), adoption émergente (niveau 4), produit confirmé (niveau 5).
- Choisis la rubrique la plus pertinente : "A" (Produit/app émergent disponible en France en euros), "B" (Commercialisé ailleurs mais indisponible en France), "C" (Nouveauté émergente / Prototype / Crowdfunding / App tout juste lancée), "D" (Forte traction / Test indépendant / Prix salon), "E" (Surprise du jour), ou "TOP" (Produit phare ou best-seller du moment type flagship très commenté / application incontournable primée ou best-seller des stores).
- Indique aussi "itemType": "app" s'il s'agit d'une application/logiciel/service numérique (iOS, Android, macOS, Windows, Web/IA) ou "product" s'il s'agit d'un objet matériel / produit physique.

SOURCE PRINCIPALE :
- Titre : ${lead.title}
- Type pressenti : ${lead.itemType || 'product'}
- Rubrique pressentie : ${lead.suggestedSection || 'C'}
- Source : ${lead.sourceName} (${lead.region})
- Date : ${lead.publishedAt}
- URL : ${lead.url}
- Résumé : ${lead.summary}
- Extrait page : ${pageText || '(Indisponible)'}

VÉRIFICATION CROISÉE WEB (prix, disponibilité France, tests récents) :
${crossSummary || '(Aucune source croisée supplémentaire)'}

Réponds UNIQUEMENT par un objet JSON valide (sans markdown) avec ces clés exactes :
{
  "section": "A|B|C|D|E|TOP",
  "itemType": "product|app",
  "nom": "string",
  "categorie": "string",
  "domaineTag": "string (max 3 mots)",
  "marquePays": "string",
  "paysCode": "FR|US|JP|CN|GB|DE|CA|TR|INT",
  "dateLancement": "string",
  "descriptionSimple": "string",
  "innovationReelle": "string",
  "utiliteConcrete": "string",
  "differenceAlternatives": "string",
  "prixAbonnements": "string",
  "disponibiliteGeo": "string",
  "maturiteNiveau": 1,
  "confiance": "Faible|Moyenne|Élevée",
  "confianceDetail": "string",
  "traction": "string",
  "avantages": ["string", "string"],
  "limites": ["string", "string"],
  "avisPersonnel": "string",
  "scoreBreakdown": {
    "originalite": 0,
    "utilite": 0,
    "precocite": 0,
    "credibilite": 0,
    "potentiel": 0,
    "accessibilite": 0
  },
  "scoreNotes": "string"
}`;
}

function parseJsonSafe(rawText) {
  const cleaned = String(rawText || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Réponse JSON introuvable');
  return JSON.parse(match[0]);
}

async function callConfiguredLlm(prompt, secrets) {
  if (secrets.GEMINI_API_KEY) {
    let lastError = 'Gemini indisponible';
    for (const model of GEMINI_MODELS) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${encodeURIComponent(
          secrets.GEMINI_API_KEY
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(22000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return { provider: model.replace('models/', ''), parsed: parseJsonSafe(text) };
      }
      lastError = `Gemini HTTP ${res.status} (${model})`;
    }
    throw new Error(lastError);
  }

  if (secrets.ANTHROPIC_API_KEY) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': secrets.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1800,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
    const data = await res.json();
    const text = data.content?.[0]?.text;
    return { provider: 'anthropic', parsed: parseJsonSafe(text) };
  }

  if (secrets.OPENAI_API_KEY) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secrets.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    return { provider: 'openai', parsed: parseJsonSafe(text) };
  }

  return null;
}

export async function synthesizeLeadToDiscovery(lead, secrets = {}) {
  const cleanSearchName = String(lead.title || '')
    .replace(/\|.*$/, '')
    .replace(/[-–:].{20,}$/, '')
    .trim()
    .slice(0, 75);

  const [meta, cross] = await Promise.all([
    fetchPageMetadata(lead.url),
    secrets.TAVILY_API_KEY
      ? runTavilyCrossVerification(`${cleanSearchName} price euros France review OR shipping 2026`, secrets.TAVILY_API_KEY)
      : Promise.resolve({ summary: '', urls: [] }),
  ]);

  const pageText = meta.text;
  const imageUrl = meta.imageUrl || lead.imageUrl || '';
  const extraLinks = (cross.urls || [])
    .filter((u) => u.url && u.url !== lead.url)
    .slice(0, 2)
    .map((u) => ({ label: `Vérif. croisée — ${u.title.slice(0, 42)}`, url: u.url, type: 'presse' }));

  const llmConfigured = Boolean(
    secrets.GEMINI_API_KEY || secrets.ANTHROPIC_API_KEY || secrets.OPENAI_API_KEY
  );

  if (llmConfigured) {
    try {
      const { provider, parsed } = await callConfiguredLlm(
        buildRadarPrompt(lead, pageText, cross.summary),
        secrets
      );
      const sec = ['A', 'B', 'C', 'D', 'E', 'TOP'].includes(parsed.section) ? parsed.section : lead.suggestedSection || 'C';
      const itemType = ['app', 'product'].includes(parsed.itemType) ? parsed.itemType : lead.itemType || 'product';
      const mat = Math.min(5, Math.max(1, Number(parsed.maturiteNiveau) || 3));
      const sb = parsed.scoreBreakdown || {};
      const breakdown = {
        originalite: Math.min(25, Math.max(0, Number(sb.originalite) || 15)),
        utilite: Math.min(20, Math.max(0, Number(sb.utilite) || 13)),
        precocite: Math.min(20, Math.max(0, Number(sb.precocite) || 14)),
        credibilite: Math.min(15, Math.max(0, Number(sb.credibilite) || 10)),
        potentiel: Math.min(10, Math.max(0, Number(sb.potentiel) || 7)),
        accessibilite: Math.min(10, Math.max(0, Number(sb.accessibilite) || 6)),
      };
      const scoreTotal = Object.values(breakdown).reduce((a, b) => a + b, 0);

      return {
        id: `disc-${Date.now().toString(36)}`,
        section: sec,
        sectionLabel: SECTION_LABELS[sec],
        itemType,
        nom: parsed.nom || lead.title,
        categorie: parsed.categorie || lead.categoryHint,
        domaineTag: parsed.domaineTag || lead.categoryHint,
        marquePays: parsed.marquePays || `Source : ${lead.sourceName}`,
        paysCode: parsed.paysCode || 'INT',
        dateLancement: parsed.dateLancement || new Date(lead.publishedAt).toLocaleDateString('fr-FR'),
        descriptionSimple: parsed.descriptionSimple || lead.summary,
        innovationReelle: parsed.innovationReelle || 'À confirmer par lecture directe de la source.',
        utiliteConcrete: parsed.utiliteConcrete || 'Usage grand public identifié dans la source.',
        differenceAlternatives: parsed.differenceAlternatives || 'Comparatif détaillé non fourni.',
        prixAbonnements: parsed.prixAbonnements || 'Non communiqué dans la source vérifiée.',
        disponibiliteGeo: parsed.disponibiliteGeo || `Repérée via ${lead.sourceName} (${lead.region}).`,
        maturiteNiveau: mat,
        maturiteLabel: MATURITY_LABELS[mat],
        confiance: parsed.confiance || 'Moyenne',
        confianceDetail: `${parsed.confianceDetail || ''} [Synthèse IA via ${provider}${cross.summary ? ' + vérif. Tavily' : ''}]`.trim(),
        traction: parsed.traction || `Signal détecté le ${new Date(lead.publishedAt).toLocaleDateString('fr-FR')}.`,
        avantages: Array.isArray(parsed.avantages) && parsed.avantages.length ? parsed.avantages : ['Signal d’innovation récent'],
        limites: Array.isArray(parsed.limites) && parsed.limites.length ? parsed.limites : ['Vérification terrain complémentaire recommandée'],
        avisPersonnel: parsed.avisPersonnel || 'Ajoutée automatiquement par le moteur Radar IA — à valider selon vos critères.',
        liens: [{ label: `Source — ${lead.sourceName}`, url: lead.url, type: 'source' }, ...extraLinks],
        imageUrl,
        tavilyVerified: Boolean(cross.summary),
        scoreTotal,
        scoreBreakdown: breakdown,
        scoreNotes: parsed.scoreNotes || 'Notation calculée par le moteur IA connecté.',
        addedAutomatically: true,
        synthesizedBy: provider,
        addedAt: new Date().toISOString(),
      };
    } catch (err) {
      lead._llmError = err.message;
    }
  }

  const sec = lead.suggestedSection || 'C';
  const isCrowdfunding = /kickstarter|indiegogo|prototype/i.test(`${lead.title} ${lead.summary}`);
  const mat = isCrowdfunding ? 2 : 3;
  const baseScore = Math.min(82, Math.max(58, Math.round((lead.relevanceScore || 65) * 0.85)));
  const breakdown = {
    originalite: Math.round(baseScore * 0.24),
    utilite: Math.round(baseScore * 0.2),
    precocite: Math.round(baseScore * 0.2),
    credibilite: Math.round(baseScore * 0.14),
    potentiel: Math.round(baseScore * 0.11),
    accessibilite: Math.max(
      4,
      baseScore - (Math.round(baseScore * 0.24) + Math.round(baseScore * 0.2) * 2 + Math.round(baseScore * 0.14) + Math.round(baseScore * 0.11))
    ),
  };
  const scoreTotal = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    id: `disc-${Date.now().toString(36)}`,
    section: sec,
    sectionLabel: SECTION_LABELS[sec],
    itemType: lead.itemType || 'product',
    nom: lead.title,
    categorie: lead.categoryHint || 'Découverte issue du scanner',
    domaineTag: lead.categoryHint || 'Veille live',
    marquePays: `Repérée via ${lead.sourceName} (${lead.region})`,
    paysCode: lead.region === 'FR' ? 'FR' : lead.region === 'US' ? 'US' : 'INT',
    dateLancement: `Publiée le ${new Date(lead.publishedAt).toLocaleDateString('fr-FR')}`,
    descriptionSimple:
      lead.summary || 'Article repéré par le scanner autonome. Consultez la source directe ci-dessous pour le détail complet.',
    innovationReelle: `Signaux repérés automatiquement : ${(lead.matchedTags || []).join(', ')}.`,
    utiliteConcrete: 'À qualifier après lecture complète de la source (mode sans clé IA).',
    differenceAlternatives:
      'Branchez une clé Gemini, Claude ou OpenAI dans « Connexions & API » pour générer automatiquement la comparaison concurrentielle.',
    prixAbonnements: 'Voir la source directe (extraction automatique des prix complète disponible avec clé IA).',
    disponibiliteGeo: `Zone source : ${lead.region}. Vérifier la livraison France sur le site lié.`,
    maturiteNiveau: mat,
    maturiteLabel: MATURITY_LABELS[mat],
    confiance: 'Faible',
    confianceDetail: lead._llmError
      ? `Fiche pré-remplie localement (erreur LLM : ${lead._llmError}).`
      : 'Fiche pré-remplie localement depuis le flux brut (sans clé IA connectée) — à vérifier sur la source.',
    traction: `Score de détection scanner : ${lead.relevanceScore}/100 · Source : ${lead.sourceName}.`,
    avantages: [
      `Détection fraîche (${new Date(lead.publishedAt).toLocaleDateString('fr-FR')})`,
      `Signaux : ${(lead.matchedTags || []).join(', ')}`,
    ],
    limites: [
      'Fiche générée en mode local sans synthèse IA : prix, disponibilité France et limites techniques à vérifier via le lien direct',
    ],
    avisPersonnel:
      'Piste promue depuis votre scanner autonome gratuit. Cliquez sur le lien source pour valider les détails.',
    liens: [{ label: `Lire la source (${lead.sourceName})`, url: lead.url, type: 'source' }, ...extraLinks],
    imageUrl,
    tavilyVerified: Boolean(cross.summary),
    scoreTotal,
    scoreBreakdown: breakdown,
    scoreNotes: 'Pré-scoring heuristique basé sur les signaux faibles détectés dans le titre et l’extrait.',
    addedAutomatically: true,
    synthesizedBy: 'local-heuristic',
    addedAt: new Date().toISOString(),
  };
}

export async function refreshDiscoveryWithAi(discovery, secrets = {}) {
  const firstUrl = discovery.liens?.[0]?.url || '';
  const [meta, cross] = await Promise.all([
    fetchPageMetadata(firstUrl),
    secrets.TAVILY_API_KEY
      ? runTavilyCrossVerification(
          `"${discovery.nom}" disponible France livraison prix euros test review 2026`,
          secrets.TAVILY_API_KEY
        )
      : Promise.resolve({ summary: '', urls: [] }),
  ]);

  const imageUrl = discovery.imageUrl || meta.imageUrl || '';
  const llmConfigured = Boolean(
    secrets.GEMINI_API_KEY || secrets.ANTHROPIC_API_KEY || secrets.OPENAI_API_KEY
  );

  if (!llmConfigured || (!cross.summary && !meta.text)) {
    return {
      ...discovery,
      imageUrl,
      lastRefreshedAt: new Date().toISOString(),
      refreshSummary: cross.summary
        ? 'Vérification Tavily effectuée (ajoutez une clé IA pour réévaluer automatiquement la fiche).'
        : 'Aucune nouvelle donnée détectée sur la source principale.',
    };
  }

  const prompt = `Tu es le moteur de mise à jour "PROJECT RADAR — DISCOVERY ENGINE V2".
Voici la fiche actuelle d'un produit/service et les résultats Web les plus récents.
Vérifie si :
- Le produit est désormais livré ou disponible en France en euros (rubrique A),
- Le prix ou les conditions ont évolué,
- De nouveaux tests indépendants ou livraisons changent sa maturité (1-5) ou sa confiance.
Ne modifie PAS les faits confirmés s'il n'y a aucune évolution réelle.

FICHE ACTUELLE :
- Nom : ${discovery.nom}
- Rubrique actuelle : ${discovery.section}
- Prix actuel : ${discovery.prixAbonnements}
- Disponibilité actuelle : ${discovery.disponibiliteGeo}
- Maturité actuelle : ${discovery.maturiteNiveau}/5
- Traction actuelle : ${discovery.traction}

NOUVELLES SOURCES WEB :
${cross.summary || meta.text.slice(0, 3000)}

Réponds UNIQUEMENT par un objet JSON valide avec ces clés :
{
  "section": "A|B|C|D|E|TOP",
  "prixAbonnements": "string",
  "disponibiliteGeo": "string",
  "maturiteNiveau": 1,
  "confiance": "Faible|Moyenne|Élevée",
  "confianceDetail": "string",
  "traction": "string",
  "avisPersonnel": "string",
  "refreshSummary": "string (1 phrase courte résumant ce qui a changé ou 'Statut inchangé après revérification.')"
}`;

  const res = await callConfiguredLlm(prompt, secrets);
  const parsed = res?.parsed || {};
  const sec = ['A', 'B', 'C', 'D', 'E', 'TOP'].includes(parsed.section) ? parsed.section : discovery.section;
  const mat = Math.min(5, Math.max(1, Number(parsed.maturiteNiveau) || discovery.maturiteNiveau));

  return {
    ...discovery,
    section: sec,
    sectionLabel: SECTION_LABELS[sec],
    prixAbonnements: parsed.prixAbonnements || discovery.prixAbonnements,
    disponibiliteGeo: parsed.disponibiliteGeo || discovery.disponibiliteGeo,
    maturiteNiveau: mat,
    maturiteLabel: MATURITY_LABELS[mat],
    confiance: parsed.confiance || discovery.confiance,
    confianceDetail: parsed.confianceDetail || discovery.confianceDetail,
    traction: parsed.traction || discovery.traction,
    avisPersonnel: parsed.avisPersonnel || discovery.avisPersonnel,
    imageUrl,
    tavilyVerified: Boolean(cross.summary) || discovery.tavilyVerified,
    lastRefreshedAt: new Date().toISOString(),
    refreshSummary: parsed.refreshSummary || 'Statut vérifié en direct.',
  };
}
