import React, { useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Clock,
  Cloud,
  ExternalLink,
  Globe,
  KeyRound,
  Loader2,
  Save,
  Shield,
  Smartphone,
  Trash2,
} from 'lucide-react';

const SEARCH_PROVIDERS = [
  {
    key: 'TAVILY_API_KEY',
    providerId: 'tavily',
    name: 'Tavily Search API (Recommandée · inclut X.com)',
    tier: 'Palier gratuit (~1 000 requêtes/mois)',
    url: 'https://app.tavily.com/',
    role: 'Cherche en direct sur le web mondial (FR, US, JP) ET interroge déjà les posts publics sur x.com sans frais d’API X supplémentaires.',
  },
  {
    key: 'X_BEARER_TOKEN',
    providerId: 'x',
    name: 'X.com API officielle (Optionnelle)',
    tier: 'Pay-Per-Use 2026 : 0,005 $/post lu (pas de palier gratuit)',
    url: 'https://console.x.com/',
    role: 'Uniquement utile si vous voulez lire la timeline temps réel via l’API X directe. Déjà remplacée gratuitement pour la veille par Tavily (x.com).',
  },
  {
    key: 'BRAVE_API_KEY',
    providerId: 'brave',
    name: 'Brave Search API',
    tier: 'Offre développeur',
    url: 'https://api.search.brave.com/',
    role: 'Index web indépendant de Google pour repérer les nouveautés récentes par zone géographique.',
  },
  {
    key: 'SERPER_API_KEY',
    providerId: 'serper',
    name: 'Serper.dev (Google Search API)',
    tier: 'Crédits gratuits à l’inscription',
    url: 'https://serper.dev/',
    role: 'Idéal pour vérifier prix en euros, stock Amazon.fr / Leroy Merlin et tests presse français.',
  },
];

const LLM_PROVIDERS = [
  {
    key: 'GEMINI_API_KEY',
    providerId: 'gemini',
    name: 'Google Gemini API (gemini-3-flash / flash-lite)',
    tier: 'Palier gratuit Google AI Studio',
    url: 'https://aistudio.google.com/apikey',
    role: 'Option la plus économique : lit l’article source, applique le filtre anti-déjà-connu et rédige la fiche complète en 17 points + score /100.',
  },
  {
    key: 'ANTHROPIC_API_KEY',
    providerId: 'anthropic',
    name: 'Anthropic Claude API',
    tier: 'Paiement à l’usage (~quelques centimes/rapport)',
    url: 'https://console.anthropic.com/',
    role: 'Excellente rigueur éditoriale : sépare annonces marketing et preuves indépendantes sans inventer de chiffres.',
  },
  {
    key: 'OPENAI_API_KEY',
    providerId: 'openai',
    name: 'OpenAI API (gpt-4o-mini / gpt-4.1)',
    tier: 'Paiement à l’usage',
    url: 'https://platform.openai.com/',
    role: 'Alternative rapide pour structurer automatiquement vos trouvailles en JSON 17 points.',
  },
];

export default function ConnectionsTab({ connections = {}, schedule = {}, onUpdated }) {
  const [draftKeys, setDraftKeys] = useState({});
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [schedEnabled, setSchedEnabled] = useState(Boolean(schedule.enabled ?? true));
  const [schedHour, setSchedHour] = useState(Number(schedule.hourParis ?? 8));

  async function handleSaveAll(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keys: draftKeys,
          schedule: { enabled: schedEnabled, hourParis: schedHour },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur sauvegarde');
      setDraftKeys({});
      onUpdated(data);
      setSaveMessage('Configuration enregistrée en sécurité sur le serveur.');
    } catch (err) {
      setSaveMessage(`Erreur : ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleClearKey(envKey) {
    setSaving(true);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: { [envKey]: '__CLEAR__' } }),
      });
      const data = await res.json();
      onUpdated(data);
      setDraftKeys((prev) => ({ ...prev, [envKey]: '' }));
      setTestResults((prev) => ({ ...prev, [envKey]: null }));
    } finally {
      setSaving(false);
    }
  }

  async function handleTest(p) {
    setTesting((prev) => ({ ...prev, [p.key]: true }));
    setTestResults((prev) => ({ ...prev, [p.key]: null }));
    try {
      const res = await fetch('/api/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: p.providerId,
          apiKey: draftKeys[p.key] || '',
        }),
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [p.key]: data }));
    } catch (err) {
      setTestResults((prev) => ({ ...prev, [p.key]: { ok: false, message: err.message } }));
    } finally {
      setTesting((prev) => ({ ...prev, [p.key]: false }));
    }
  }

  function renderProviderCard(p) {
    const status = connections[p.key] || { configured: false, preview: '' };
    const testRes = testResults[p.key];
    return (
      <div key={p.key} className="rounded-2xl border border-[#E4E0D8] bg-[#FCFBF8] p-4">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-[#17181A]">{p.name}</h4>
              {status.configured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  Configurée ({status.preview})
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] font-semibold text-[#D94E28]">{p.tier}</p>
          </div>
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#45474D] hover:text-[#D94E28]"
          >
            Créer une clé
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-[#5B5E66]">{p.role}</p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={draftKeys[p.key] ?? ''}
            onChange={(e) => setDraftKeys((prev) => ({ ...prev, [p.key]: e.target.value }))}
            placeholder={
              status.configured
                ? `Clé enregistrée (${status.preview}) — saisir pour remplacer`
                : `Coller votre clé ${p.key}...`
            }
            className="flex-1 rounded-xl border border-[#DCD6CA] bg-white px-3 py-2 text-xs font-mono-num text-[#17181A] focus:border-[#D94E28] focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleTest(p)}
              disabled={testing[p.key] || (!draftKeys[p.key] && !status.configured)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#DCD6CA] bg-white px-3 py-2 text-xs font-semibold text-[#17181A] hover:bg-[#F2EFE8] disabled:opacity-50"
            >
              {testing[p.key] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Tester'}
            </button>
            {status.configured && (
              <button
                type="button"
                onClick={() => handleClearKey(p.key)}
                className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"
                title="Effacer la clé"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {testRes && (
          <p
            className={`mt-2 text-xs font-medium ${
              testRes.ok ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {testRes.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Architecture summary */}
      <section className="rounded-3xl border border-[#E4E0D8] bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#17181A] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
          <KeyRound className="h-3.5 w-3.5 text-[#D94E28]" />
          Autonomie & Connexions
        </div>
        <h2 className="font-editorial text-2xl font-bold text-[#17181A]">
          Connexions Web, X.com, IA et hébergement Netlify
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#494B50]">
          Vos clés <strong>Tavily</strong> et <strong>Google Gemini</strong> permettent déjà de combiner les 18 flux
          gratuits, la recherche Web mondiale, la veille <strong>X.com, Instagram, Facebook, Threads, Reddit &amp; Bluesky</strong> et la rédaction automatique
          des fiches en 17 points.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              1. Flux gratuits + Anti-bruit
            </div>
            <p className="text-xs leading-relaxed text-[#242629]">
              18 sources RSS/APIs (New Atlas, Yanko Design, Kicktraq, Product Hunt, Frandroid &amp; Apps, Révolution Énergétique,
              Show HN, Google News FR/Apps/Salons) actives sans aucune clé.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-800">
              2. Recherche Web + Réseaux sociaux
            </div>
            <p className="text-xs leading-relaxed text-[#242629]">
              <strong>Tavily</strong> couvre le web mondial, <code>x.com</code>, <strong>Instagram</strong>,{' '}
              <strong>Facebook</strong>, <strong>Threads</strong>, <strong>Reddit</strong> et <strong>Bluesky</strong>{' '}
              (contenus publics indexés). Pour capter sur X de tout nouveaux comptes à 0–50 abonnés au « Jour 1 »,
              ajoutez une clé optionnelle <code>X_BEARER_TOKEN</code>. Pour les toutes nouvelles pubs Instagram/Facebook,
              complétez avec{' '}
              <a
                href="https://www.facebook.com/ads/library/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                Meta Ad Library
              </a>{' '}
              (gratuit).
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-900">
              3. Cerveau IA 17 points
            </div>
            <p className="text-xs leading-relaxed text-[#242629]">
              <strong>Google Gemini</strong> (<code>gemini-3-flash</code> / <code>flash-lite</code>) lit la source,
              vérifie les faits et génère automatiquement la fiche Radar + note /100.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        <section className="rounded-3xl border border-[#E4E0D8] bg-white p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#D94E28]" />
            <h3 className="font-editorial text-xl font-bold text-[#17181A]">
              A. API de Recherche Web & X.com
            </h3>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">{SEARCH_PROVIDERS.map(renderProviderCard)}</div>
        </section>

        <section className="rounded-3xl border border-[#E4E0D8] bg-white p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#D94E28]" />
            <h3 className="font-editorial text-xl font-bold text-[#17181A]">
              B. API Cerveau IA — Synthèse & notation (1 au choix)
            </h3>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">{LLM_PROVIDERS.map(renderProviderCard)}</div>
        </section>

        {/* Daily Scheduler + Security */}
        <section className="rounded-3xl border border-[#E4E0D8] bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#D94E28]" />
                <h3 className="font-editorial text-lg font-bold text-[#17181A]">
                  Planificateur autonome quotidien
                </h3>
              </div>
              <p className="text-xs text-[#5B5E66]">
                Exécute automatiquement un scan complet chaque matin (sur Netlify via la fonction planifiée{' '}
                <code>daily-scan</code> à 07h00 UTC / 08h00 Paris).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#DCD6CA] bg-[#FAF8F4] px-3 py-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={schedEnabled}
                  onChange={(e) => setSchedEnabled(e.target.checked)}
                  className="h-4 w-4 accent-[#D94E28]"
                />
                Activer la veille auto
              </label>

              <select
                value={schedHour}
                onChange={(e) => setSchedHour(Number(e.target.value))}
                disabled={!schedEnabled}
                className="rounded-xl border border-[#DCD6CA] bg-[#FAF8F4] px-3 py-2 text-xs font-semibold text-[#17181A]"
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    Tous les jours à {String(h).padStart(2, '0')}h00
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-[#EEEAE2] pt-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-xs text-[#5B5E66]">
              <Shield className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>
                En local, les clés sont stockées dans <code>data/secrets.json</code> (ignoré par Git). Sur Netlify,
                placez-les idéalement dans <strong>Environment variables</strong>.
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#17181A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D94E28] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer la configuration
            </button>
          </div>

          {saveMessage && (
            <p className="mt-3 text-xs font-semibold text-emerald-700">{saveMessage}</p>
          )}
        </section>
      </form>

      {/* Netlify + Mobile Guide */}
      <section className="rounded-3xl border border-[#E4E0D8] bg-[#FAF8F4] p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Cloud className="h-5 w-5 text-[#D94E28]" />
          <Smartphone className="h-5 w-5 text-[#17181A]" />
          <h3 className="font-editorial text-lg font-bold text-[#17181A]">
            Déployer sur Netlify (URL permanente HTTPS pour mobile & ordi)
          </h3>
        </div>
        <div className="grid gap-4 text-xs leading-relaxed text-[#3C3E44] md:grid-cols-2">
          <div className="rounded-2xl border border-[#E4E0D8] bg-white p-4">
            <div className="mb-1 font-bold text-[#17181A]">1. Architecture prête pour Netlify Free</div>
            <p>
              Le projet inclut <code>netlify.toml</code>, les fonctions serverless (<code>api.mjs</code> +{' '}
              <code>daily-scan.mjs</code>) et la persistance automatique sur <strong>Netlify Blobs</strong> (inclus
              dans les 300 crédits/mois du plan gratuit Netlify, sans base de données externe).
            </p>
          </div>
          <div className="rounded-2xl border border-[#E4E0D8] bg-white p-4">
            <div className="mb-1 font-bold text-[#17181A]">2. Variables à coller dans Netlify</div>
            <p>
              Dans Netlify → <em>Site configuration → Environment variables</em>, créez{' '}
              <code>TAVILY_API_KEY</code> et <code>GEMINI_API_KEY</code> (puis redéployez). Votre plateforme
              restera accessible 24h/24 sur votre smartphone et votre ordinateur.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
