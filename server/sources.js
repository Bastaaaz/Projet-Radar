import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 5500,
  headers: {
    'User-Agent': 'ProjectRadarDiscoveryEngine/2.0 (+https://radar.local)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
});

export const FREE_SOURCES = [
  {
    id: 'newatlas',
    name: 'New Atlas (Inventions & Consumer Tech)',
    type: 'rss',
    url: 'https://newatlas.com/index.rss',
    region: 'GLOBAL',
    categoryHint: 'Hardware & Inventions',
    themes: ['all', 'hardware', 'mobility', 'home'],
  },
  {
    id: 'yankodesign',
    name: 'Yanko Design (Objets & Design industriel)',
    type: 'rss',
    url: 'https://www.yankodesign.com/feed/',
    region: 'GLOBAL',
    categoryHint: 'Design & Objets',
    themes: ['all', 'design', 'hardware', 'home'],
  },
  {
    id: 'core77',
    name: 'Core77 (Design produit & Outils)',
    type: 'rss',
    url: 'https://www.core77.com/blog/rss.xml',
    region: 'US/GLOBAL',
    categoryHint: 'Design & Outils',
    themes: ['all', 'design', 'diy'],
  },
  {
    id: 'gadgeteer',
    name: 'The Gadgeteer (Tests terrain & Objets)',
    type: 'rss',
    url: 'https://the-gadgeteer.com/feed/',
    region: 'US',
    categoryHint: 'Gadgets & Quotidien',
    themes: ['all', 'hardware', 'home'],
  },
  {
    id: 'revolution-energetique',
    name: 'Révolution Énergétique (Tests énergie FR)',
    type: 'rss',
    url: 'https://www.revolution-energetique.com/feed/',
    region: 'FR',
    categoryHint: 'Énergie & Maison',
    themes: ['all', 'home', 'energy'],
  },
  {
    id: 'frandroid',
    name: 'Frandroid (Maison, Mobilité & Tests FR)',
    type: 'rss',
    url: 'https://www.frandroid.com/feed',
    region: 'FR',
    categoryHint: 'Tech & Maison FR',
    themes: ['all', 'home', 'mobility'],
  },
  {
    id: 'petapixel',
    name: 'PetaPixel (Photo & Optique)',
    type: 'rss',
    url: 'https://petapixel.com/feed/',
    region: 'GLOBAL',
    categoryHint: 'Photographie',
    themes: ['all', 'photo', 'hardware'],
  },
  {
    id: 'electrek',
    name: 'Electrek (Mobilité & VAE)',
    type: 'rss',
    url: 'https://electrek.co/feed/',
    region: 'GLOBAL',
    categoryHint: 'Mobilité',
    themes: ['all', 'mobility'],
  },
  {
    id: 'kicktraq',
    name: 'Kicktraq (Nouveautés Kickstarter Tech/Gadgets)',
    type: 'rss',
    url: 'https://www.kicktraq.com/categories/technology/gadgets/latest.rss',
    region: 'CROWDFUNDING',
    categoryHint: 'Crowdfunding',
    themes: ['all', 'crowdfunding', 'hardware'],
  },
  {
    id: 'producthunt',
    name: 'Product Hunt (Nouveautés du jour)',
    type: 'rss',
    url: 'https://www.producthunt.com/feed',
    region: 'GLOBAL',
    categoryHint: 'Apps & Outils',
    themes: ['all', 'apps', 'crowdfunding'],
  },
  {
    id: 'gnews-fr-lepine',
    name: 'Google News FR (Concours Lépine & Made in France)',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=Concours+L%C3%A9pine+OR+%22Made+in+France%22+innovation+produit+2026&hl=fr&gl=FR&ceid=FR:fr',
    region: 'FR',
    categoryHint: 'France & Salons',
    themes: ['all', 'france', 'home', 'diy'],
  },
  {
    id: 'gnews-fr-produits',
    name: 'Google News FR (Nouveaux objets & tests FR)',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=innovation+produit+particulier+prix+euros+disponible+France&hl=fr&gl=FR&ceid=FR:fr',
    region: 'FR',
    categoryHint: 'France',
    themes: ['all', 'france', 'home', 'energy'],
  },
  {
    id: 'gnews-awards',
    name: 'Google News Salons (Good Design / Eurobike / METSTRADE)',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22Good+Design+Award%22+OR+%22Eurobike+Award%22+OR+%22DAME+Design+Award%22+OR+%22James+Dyson+Award%22&hl=en&gl=US&ceid=US:en',
    region: 'GLOBAL',
    categoryHint: 'Salons & Prix',
    themes: ['all', 'design', 'mobility', 'crowdfunding'],
  },
  {
    id: 'hn-show',
    name: 'Hacker News (Show HN — Projets indépendants)',
    type: 'algolia',
    url: 'https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&hitsPerPage=18',
    region: 'GLOBAL',
    categoryHint: 'Indie & Open-Source',
    themes: ['all', 'apps', 'diy', 'hardware'],
  },
  {
    id: 'gnews-apps-new',
    name: 'Google News FR (Nouvelles Applications IA & Mobiles)',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=nouvelle+application+iOS+Android+IA+innovante+2026&hl=fr&gl=FR&ceid=FR:fr',
    region: 'FR',
    categoryHint: 'Apps innovantes',
    themes: ['all', 'apps'],
  },
  {
    id: 'frandroid-apps',
    name: 'Frandroid (Applications & Logiciels)',
    type: 'rss',
    url: 'https://www.frandroid.com/telecharger/feed',
    region: 'FR',
    categoryHint: 'Apps & Outils',
    themes: ['all', 'apps', 'bestsellers'],
  },
  {
    id: 'gnews-apps-top',
    name: 'Google News FR (Meilleures Apps & Best-Sellers Stores)',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=meilleures+applications+2026+%22App+Store%22+OR+%22Google+Play%22+France&hl=fr&gl=FR&ceid=FR:fr',
    region: 'FR',
    categoryHint: 'Apps incontournables',
    themes: ['bestsellers', 'apps'],
  },
  {
    id: 'gnews-top-tech',
    name: 'Google News FR (Produits Phares & Best-Sellers Tech)',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=smartphone+OR+produit+high-tech+test+France+prix+euros+2026&hl=fr&gl=FR&ceid=FR:fr',
    region: 'FR',
    categoryHint: 'Top Produits FR',
    themes: ['bestsellers'],
  },
];

// Bruit toujours rejeté (macro-politique, crypto, subventions B2B)
const CORE_NOISE_PATTERNS = [
  /\b(crypto|bitcoin|ethereum|memecoin|nft|airdrop)\b/i,
  /\b(fusion\s*nucléaire|centrale\s*nucléaire|epr2|politique\s*énergétique|décret|assemblée\s*nationale|sénat|bourse|cac\s*40|nasdaq|droits\s*de\s*douane)\b/i,
  /\b(plan\s*jusqu['’]en\s*20[34]\d|budget\s*202[67]|ministre|gouvernement|call\s*for\s*proposals|european\s*innovation\s*act|european\s*commission)\b/i,
  /\b(france\s*2030|appel\s+à\s+projets|première\s+usine|bpifrance|french\s+tech\s+next\s*40|next\s*40|ft\s*120)\b/i,
  /\b(levée\s+de\s+fonds|série\s+[abc]|funding\s+round|raises\s+\$?\d+\s*[mb]|seed\s+round)\b/i,
  /\b(medef|banque\s+de\s+france|projections\s+macroéconomiques|croissance\s+du\s+pib|inflation\s+en\s+france)\b/i,
  /\b(prix\s+d['’]une\s+application|co[ûu]t\s+d['’]une\s+application|combien\s+co[ûu]te\s+une\s+app|cr[ée]er\s+une\s+application|agence\s+mobile|app\s+development\s+cost)\b/i,
  /\b(windows\s*11|ios\s*2[0-9]|macos|android\s*1[5-9])\s*(update|beta|patch|bug)\b/i,
  /\b(geforce|rtx\s*[45]0\d{2}|radeon|ryzen|intel\s*core\s*ultra)\b/i,
  /\b(tesla\s*model\s*[3yxs]|cybertruck\s*recall|stock\s*price|earnings|ipo)\b/i,
  /\b(chatgpt|openai|claude|gemini)\s*(prompt|wrapper|update|pricing|outage)\b/i,
];

// Filtre anti-déjà-connu / anti-listicles (appliqué en veille A–E, assoupli en mode Top & Best-sellers)
const MAINSTREAM_NOISE_PATTERNS = [
  /\biphone\s*(15|16|17|18|se|pro|air)\b/i,
  /\bgalaxy\s*(s2[4-7]|z\s*fold|z\s*flip|a\d{2})\b/i,
  /\bpixel\s*(9|10|11)\b/i,
  /\bblack\s*friday\b.*\b(deal|deals|promo|amazon|apple|samsung|tv|oled|airpods|ps5|xbox|nintendo)\b/i,
  /\bbest\s*(deals|laptops|phones|earbuds|vpn)\b/i,
  /\bbon\s*plan\b.*\b(forfait|vpn|smartphone|tv\s*4k|cdiscount|fnac)\b/i,
  // Listicles / guides fourre-tout ("best gadgets of 2026", "top 10...", "worth buying now")
  /\b(the\s+)?best\s+(new\s+)?(gadgets|tech|products|inventions|picks|gift\s+ideas|tools|devices)\b/i,
  /\b\d+\s+(new|best|top|amazing|cool|finest|weird|genius)\s+(gadgets|tech|products|inventions|items)\b/i,
  /\bles\s+\d+\s+(meilleurs?|nouveaux?)\s+(gadgets|objets|produits|inventions)\b/i,
  /\b(stole\s+the\s+show|worth\s+buying\s+now|should\s+be\s+illegal|so\s+far\s*[—–-]|guide\s+d['’]achat)\b/i,
];

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'new', '2025', '2026', '2027',
  'review', 'tested', 'hands', 'test', 'complet', 'prix', 'euros', 'disponible', 'france',
  'pour', 'avec', 'dans', 'une', 'des', 'les', 'sur', 'par', 'qui', 'est', 'son', 'ses',
  'how', 'why', 'what', 'can', 'you', 'your', 'now', 'best', 'first', 'launch', 'launched',
  'kickstarter', 'indiegogo', 'product', 'gadget', 'device', 'innovation', 'hardware', 'app',
  'preorder', 'reward', 'estimate', 'shipping', 'live', 'which', 'bundle', 'actually', 'worth',
]);

export function extractProductTokens(text = '') {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function extractBigrams(tokens) {
  const b = new Set();
  for (let i = 0; i < tokens.length - 1; i += 1) {
    b.add(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return b;
}

export function isDuplicateByTitle(title, tokenSets = []) {
  const tokens = extractProductTokens(title);
  if (tokens.length === 0) return false;
  const setA = new Set(tokens);
  const bigramsA = extractBigrams(tokens);

  for (const existing of tokenSets) {
    const existingSet = existing?.tokens ? existing.tokens : existing;
    const existingBigrams = existing?.bigrams || null;
    if (!existingSet || existingSet.size === 0) continue;

    if (existingBigrams && bigramsA.size > 0) {
      for (const bg of bigramsA) {
        if (existingBigrams.has(bg)) return true;
      }
    }

    let common = 0;
    for (const t of setA) {
      if (existingSet.has(t)) common += 1;
    }
    const minLen = Math.min(setA.size, existingSet.size);
    const ratio = common / Math.max(1, minLen);
    if ((common >= 2 && ratio >= 0.6) || (common >= 3 && ratio >= 0.5)) {
      return true;
    }
  }
  return false;
}

// Signaux positifs de vraie découverte produit ou application
const SIGNAL_PATTERNS = [
  { re: /\b(review|tested|hands-on|essai|test\s+complet|test\s+terrain|avis)\b/i, pts: 18, tag: 'Test / Avis' },
  { re: /\b(kickstarter|indiegogo|ulule|crowdfunding|pre-order|précommande|prototype)\b/i, pts: 16, tag: 'Émergent / Prototype' },
  { re: /\b(award|winner|lauréat|lépine|dyson|eurobike|dame\s*award|good\s*design|if\s*design|formnext|best\s*of\s*play|app\s*store\s*award)\b/i, pts: 18, tag: 'Prix / Salon' },
  { re: /(€|eur|euros|\$|usd|¥|yen|£)/i, pts: 10, tag: 'Prix identifié' },
  { re: /\b(no\s*subscription|subscription-free|sans\s*abonnement|open[- ]source|plug[- ]and[- ]play|zéro\s*travaux|gratuit)\b/i, pts: 14, tag: 'Usage concret' },
  { re: /\b(solar|solaire|battery|batterie|water|eau|shower|douche|bike|vélo|marine|boat|nautique|camera|3d\s*print|tool|outil|kitchen|cuisine|sleep|santé|kids|enfant|smartphone|robot)\b/i, pts: 10, tag: 'Domaine concret' },
  { re: /\b(application|app\s*store|google\s*play|ios|android|macos|extension|logiciel|saas|ai\s+app|dictée|notes)\b/i, pts: 14, tag: 'Application' },
  { re: /\b(japan|japon|france|french|français|europe|made\s*in)\b/i, pts: 8, tag: 'Ancrage géo' },
  { re: /\b(invented|inventor|invention|patented|brevet|first|world's\s*first|première)\b/i, pts: 12, tag: 'Invention' },
];

function stripHtml(text = '') {
  return String(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function classifyCandidate(item, source, options = {}) {
  const title = stripHtml(item.title || '');
  const summary = stripHtml(item.summary || item.contentSnippet || item.content || '').slice(0, 420);
  const combined = `${title} ${summary}`;
  const isBestsellerMode =
    options.theme === 'bestsellers' ||
    source.id === 'gnews-apps-top' ||
    source.id === 'gnews-top-tech';

  if (!title || title.length < 10) {
    return { rejected: true, reason: 'Titre vide ou trop court' };
  }

  for (const rx of CORE_NOISE_PATTERNS) {
    if (rx.test(combined)) {
      return { rejected: true, reason: 'Bruit hors-sujet (macro / crypto / B2B)' };
    }
  }

  if (!isBestsellerMode) {
    for (const rx of MAINSTREAM_NOISE_PATTERNS) {
      if (rx.test(combined)) {
        return { rejected: true, reason: 'Filtre anti-déjà-connu (bruit mainstream / listicle)' };
      }
    }
  }

  let relevanceScore = 34;
  const matchedTags = [];

  for (const sig of SIGNAL_PATTERNS) {
    if (sig.re.test(combined)) {
      relevanceScore += sig.pts;
      matchedTags.push(sig.tag);
    }
  }

  const isApp =
    source.id === 'producthunt' ||
    source.id === 'gnews-apps-new' ||
    source.id === 'gnews-apps-top' ||
    source.id === 'frandroid-apps' ||
    /\b(application|app\s+ios|app\s+android|apps|app\s+store|google\s+play|best\s+of\s+play|mobile\s+app|desktop\s+app|chrome\s+extension|logiciel|web\s+app|ai\s+app|ai\s+agent|voice-to-text|saas|ios\s+et\s+android|android\s+et\s+ios)\b/i.test(
      combined
    );

  const pubDate = item.isoDate || item.pubDate || item.created_at || new Date().toISOString();
  const ageHours = Math.max(0, (Date.now() - new Date(pubDate).getTime()) / 3600000);
  if (ageHours <= 48) relevanceScore += 10;
  else if (ageHours <= 120) relevanceScore += 5;

  if (source.id === 'x-tavily' || source.id === 'x-api') {
    matchedTags.unshift('X.com');
  }
  if (isApp && !matchedTags.includes('Application')) {
    matchedTags.unshift('Application');
  }

  relevanceScore = Math.min(98, relevanceScore);

  let suggestedSection = isBestsellerMode ? 'TOP' : 'C';
  if (!isBestsellerMode) {
    if (/\b(review|tested|hands-on|essai|test\s+complet|award|winner|lauréat|lépine|eurobike|dame|good\s*design)\b/i.test(combined)) {
      suggestedSection = 'D';
    }
    if (source.region === 'FR' && /(€|eur|euros|en\s*france|livraison|stock|disponible|boutique|amazon\.fr|leroy|castorama|app\s*store|google\s*play|gratuit)/i.test(combined)) {
      suggestedSection = 'A';
    } else if (/\b(japan\s*only|us\s*only|japon|états-unis|yen|¥|ships\s*to\s*us)\b/i.test(combined) && !/france/i.test(combined)) {
      suggestedSection = 'B';
    } else if (/\b(kickstarter|indiegogo|prototype|concept|beta|pre-order|précommande|formnext|launched|built)\b/i.test(combined)) {
      suggestedSection = 'C';
    }
  }

  return {
    rejected: false,
    id: `lead-${Buffer.from((item.link || title).slice(0, 80)).toString('base64url').slice(0, 18)}`,
    title,
    summary,
    url: item.link || item.url || '',
    sourceId: source.id,
    sourceName: source.name,
    region: source.region,
    categoryHint: isApp ? 'Application' : source.categoryHint,
    itemType: isApp ? 'app' : 'product',
    publishedAt: pubDate,
    relevanceScore,
    matchedTags: matchedTags.length ? [...new Set(matchedTags)].slice(0, 5) : ['Signal faible'],
    suggestedSection,
    provider: source.providerTag || 'free-rss',
  };
}

export async function runFreeFeedsScan({ theme = 'all', existingUrls = new Set(), maxPerSource = 8 } = {}) {
  const activeSources =
    theme === 'x'
      ? []
      : FREE_SOURCES.filter((s) => theme === 'all' || s.themes.includes(theme));

  const stats = {
    sourcesQueried: activeSources.length,
    sourcesSucceeded: 0,
    rawItems: 0,
    rejectedNoise: 0,
    duplicatesSkipped: 0,
    keptLeads: 0,
    sourceErrors: [],
  };

  const leads = [];
  const seenUrls = new Set(existingUrls);

  await Promise.all(
    activeSources.map(async (source) => {
      try {
        if (source.type === 'algolia') {
          const res = await fetch(source.url, { signal: AbortSignal.timeout(5500) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          stats.sourcesSucceeded += 1;
          const hits = (data.hits || []).slice(0, maxPerSource);
          for (const h of hits) {
            stats.rawItems += 1;
            const link = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
            if (seenUrls.has(link)) {
              stats.duplicatesSkipped += 1;
              continue;
            }
            const classified = classifyCandidate(
              {
                title: (h.title || '').replace(/^Show HN:\s*/i, ''),
                summary: h.story_text || `Show HN (${h.points || 0} pts, ${h.num_comments || 0} commentaires)`,
                link,
                isoDate: h.created_at,
              },
              source,
              { theme }
            );
            if (classified.rejected) {
              stats.rejectedNoise += 1;
            } else {
              seenUrls.add(link);
              leads.push(classified);
              stats.keptLeads += 1;
            }
          }
          return;
        }

        const feed = await parser.parseURL(source.url);
        stats.sourcesSucceeded += 1;
        const items = (feed.items || []).slice(0, maxPerSource);
        for (const item of items) {
          stats.rawItems += 1;
          const link = item.link || item.guid || '';
          if (!link || seenUrls.has(link)) {
            stats.duplicatesSkipped += 1;
            continue;
          }
          const classified = classifyCandidate(item, source, { theme });
          if (classified.rejected) {
            stats.rejectedNoise += 1;
          } else {
            seenUrls.add(link);
            leads.push(classified);
            stats.keptLeads += 1;
          }
        }
      } catch (err) {
        stats.sourceErrors.push({ source: source.name, error: err.message });
      }
    })
  );

  leads.sort((a, b) => b.relevanceScore - a.relevanceScore || new Date(b.publishedAt) - new Date(a.publishedAt));

  return {
    stats,
    leads: leads.slice(0, 40),
  };
}

// Recherche Web profonde + X.com via Tavily / Brave / Serper / X API
export async function runExternalWebSearch({ secrets, theme = 'all', customQuery = '' }) {
  const queriesByTheme = {
    all: [
      'nouveau produit innovation particulier prix euros disponible acheter 2026 -appel -france2030 -guide',
      '"review" OR "kickstarter" OR "ships" single hardware gadget invention 2026 price -best -top',
      'nouvelle application iOS Android IA téléchargement gratuit prix App Store Google Play 2026 -agence -devis -coût',
    ],
    apps: [
      'nouvelle application iOS Android macOS IA utile téléchargement App Store Google Play 2026 -agence -devis -coût',
      'new innovative mobile AI productivity app launched 2026 iOS Android Product Hunt pricing',
    ],
    bestsellers: [
      'Xiaomi 18 Pro OR meilleur smartphone OR produit high-tech populaire test France prix euros novembre 2026',
      'Google Play Best of 2026 OR App Store Award 2026 meilleures applications populaires incontournables iOS Android',
    ],
    home: ['innovation maison bricolage économie eau énergie France 2026 prix euros'],
    mobility: ['innovation vélo moto nautisme 2026 essai test prix euros'],
    photo: ['new photography camera lens analog audio invention 2026 review'],
    crowdfunding: ['Kickstarter hardware invention November 2026 OR December 2026 shipping'],
    france: ['Concours Lépine 2026 OR Made in France innovation produit disponible acheter euros'],
    x: ['launched hardware gadget OR new app OR invention OR prototype 2026'],
  };

  const queries = customQuery?.trim()
    ? [customQuery.trim()]
    : queriesByTheme[theme] || queriesByTheme.all;

  const leads = [];
  const providersUsed = [];

  // 1. Tavily Search (+ recherche dédiée X.com sans frais supplémentaires !)
  if (secrets.TAVILY_API_KEY) {
    providersUsed.push('tavily');
    const tasks =
      theme === 'x'
        ? []
        : queries.map((q) =>
            fetch('https://api.tavily.com/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                api_key: secrets.TAVILY_API_KEY,
                query: q,
                search_depth: 'basic',
                days: 30,
                max_results: 5,
                include_answer: false,
              }),
              signal: AbortSignal.timeout(9000),
            }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Tavily HTTP ${r.status}`))))
          );

    // Requête bonus X.com via Tavily (sur global, apps, bestsellers, crowdfunding ou X.com)
    if (theme === 'all' || theme === 'x' || theme === 'crowdfunding' || theme === 'apps' || theme === 'bestsellers') {
      let xQuery = 'launched built hardware gadget OR new app kickstarter prototype 2026 status';
      if (customQuery?.trim()) xQuery = `${customQuery.trim()} status`;
      else if (theme === 'apps') xQuery = 'launched new iOS Android AI app Product Hunt 2026 status';
      else if (theme === 'bestsellers') xQuery = 'Xiaomi 18 Pro OR best app 2026 launched viral trending status';

      tasks.push(
        fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: secrets.TAVILY_API_KEY,
            query: xQuery,
            include_domains: ['x.com'],
            search_depth: 'basic',
            days: 30,
            max_results: theme === 'x' ? 8 : 5,
            include_answer: false,
          }),
          signal: AbortSignal.timeout(9000),
        })
          .then((r) => (r.ok ? r.json() : { results: [] }))
          .then((json) => ({ ...json, _isX: true }))
      );
    }

    const resultsList = await Promise.all(tasks);
    for (const json of resultsList) {
      const isX = Boolean(json._isX);
      for (const r of json.results || []) {
        if (isX && !/x\.com\/[^/]+\/status\/\d+/i.test(r.url || '')) {
          continue;
        }
        const c = classifyCandidate(
          { title: r.title, summary: r.content, link: r.url, isoDate: r.published_date || new Date().toISOString() },
          isX
            ? { id: 'x-tavily', name: 'X.com (via Tavily)', region: 'X/GLOBAL', categoryHint: 'Veille X.com', providerTag: 'tavily-x' }
            : { id: 'tavily', name: 'Tavily Web Search', region: 'WEB', categoryHint: 'Recherche Web IA', providerTag: 'tavily' },
          { theme }
        );
        if (!c.rejected) {
          c.relevanceScore = Math.min(99, c.relevanceScore + 12);
          leads.push(c);
        }
      }
    }
  } else if (secrets.BRAVE_API_KEY) {
    providersUsed.push('brave');
    for (const q of queries) {
      const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=6&freshness=pm`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-Subscription-Token': secrets.BRAVE_API_KEY,
        },
        signal: AbortSignal.timeout(9000),
      });
      if (!res.ok) throw new Error(`Brave HTTP ${res.status}`);
      const json = await res.json();
      for (const r of json.web?.results || []) {
        const c = classifyCandidate(
          { title: r.title, summary: r.description, link: r.url, isoDate: new Date().toISOString() },
          { id: 'brave', name: 'Brave Search API', region: 'WEB', categoryHint: 'Recherche Web', providerTag: 'brave' },
          { theme }
        );
        if (!c.rejected) {
          c.relevanceScore = Math.min(99, c.relevanceScore + 10);
          leads.push(c);
        }
      }
    }
  } else if (secrets.SERPER_API_KEY) {
    providersUsed.push('serper');
    for (const q of queries) {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': secrets.SERPER_API_KEY,
        },
        body: JSON.stringify({ q, gl: 'fr', hl: 'fr', num: 6, tbs: 'qdr:m' }),
        signal: AbortSignal.timeout(9000),
      });
      if (!res.ok) throw new Error(`Serper HTTP ${res.status}`);
      const json = await res.json();
      for (const r of json.organic || []) {
        const c = classifyCandidate(
          { title: r.title, summary: r.snippet, link: r.link, isoDate: r.date || new Date().toISOString() },
          { id: 'serper', name: 'Serper (Google Search)', region: 'FR/WEB', categoryHint: 'Recherche Google', providerTag: 'serper' },
          { theme }
        );
        if (!c.rejected) {
          c.relevanceScore = Math.min(99, c.relevanceScore + 10);
          leads.push(c);
        }
      }
    }
  }

  // 2. X API officielle directe (Pay-Per-Use si X_BEARER_TOKEN fourni)
  if (secrets.X_BEARER_TOKEN) {
    providersUsed.push('x-api');
    const xQuery = customQuery?.trim()
      ? `${customQuery.trim()} -is:retweet (lang:en OR lang:fr)`
      : '(launched OR prototype OR kickstarter OR "new app") (hardware OR gadget OR invention OR iOS OR Android) -is:retweet -crypto';
    const xUrl = `https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(
      xQuery
    )}&max_results=10&tweet.fields=created_at,public_metrics,author_id`;
    const res = await fetch(xUrl, {
      headers: { Authorization: `Bearer ${secrets.X_BEARER_TOKEN}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`X API HTTP ${res.status}`);
    const json = await res.json();
    for (const t of json.data || []) {
      const link = `https://x.com/i/web/status/${t.id}`;
      const likes = t.public_metrics?.like_count || 0;
      const firstLine = (t.text || '').split('\n')[0].slice(0, 95);
      const c = classifyCandidate(
        {
          title: firstLine,
          summary: `${t.text} (${likes} likes)`,
          link,
          isoDate: t.created_at,
        },
        { id: 'x-api', name: 'X.com (API officielle)', region: 'X/LIVE', categoryHint: 'Veille X.com', providerTag: 'x-api' },
        { theme }
      );
      if (!c.rejected) {
        c.relevanceScore = Math.min(99, c.relevanceScore + (likes >= 50 ? 15 : 8));
        leads.push(c);
      }
    }
  }

  return { provider: providersUsed.join(' + ') || null, leads };
}
