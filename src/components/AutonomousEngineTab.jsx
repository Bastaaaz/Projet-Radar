import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Bot,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Loader2,
  PlusCircle,
  Radar,
  RefreshCw,
  Rss,
  Sparkles,
} from 'lucide-react';
import { SECTION_STYLES } from './DomainBadge';

const THEMES = [
  { id: 'all', label: 'Veille globale (Objets + Apps + Réseaux + X.com)' },
  { id: 'social', label: 'Réseaux sociaux (Instagram, Facebook, Threads, X, Reddit, Bluesky)' },
  { id: 'prelaunch', label: 'Pré-lancement & Idées avant sortie (Waitlists, Prototypes, Ulule/KS)' },
  { id: 'apps', label: 'Nouvelles Apps innovantes (iOS / Android / IA / Web)' },
  { id: 'bestsellers', label: 'Top & Best-Sellers (Produits phares + Apps incontournables)' },
  { id: 'france', label: 'France & Salons (Lépine / MIF)' },
  { id: 'home', label: 'Maison, Eau & Énergie' },
  { id: 'mobility', label: 'Mobilité, Vélo, Moto & Nautisme' },
  { id: 'photo', label: 'Photo, Optique & Hardware' },
  { id: 'crowdfunding', label: 'Crowdfunding & Prototypes' },
  { id: 'x', label: 'X.com uniquement (Makers, Apps & Lancements)' },
];

export default function AutonomousEngineTab({
  leads = [],
  scanHistory = [],
  freeSources = [],
  connections = {},
  schedule = {},
  onScanComplete,
  onPromoted,
  onWatchlisted,
  onGoToConnections,
}) {
  const [theme, setTheme] = useState('all');
  const [customQuery, setCustomQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [promotingId, setPromotingId] = useState(null);
  const [watchingId, setWatchingId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showSources, setShowSources] = useState(false);

  const hasWebSearch =
    connections.TAVILY_API_KEY?.configured ||
    connections.BRAVE_API_KEY?.configured ||
    connections.SERPER_API_KEY?.configured ||
    connections.X_BEARER_TOKEN?.configured;

  const hasXDirect = connections.X_BEARER_TOKEN?.configured || connections.TAVILY_API_KEY?.configured;

  const hasLlm =
    connections.GEMINI_API_KEY?.configured ||
    connections.ANTHROPIC_API_KEY?.configured ||
    connections.OPENAI_API_KEY?.configured;

  async function handleRunScan(e) {
    e?.preventDefault();
    setScanning(true);
    setError('');
    setToast('');
    try {
      const res = await fetch('/api/scan/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, customQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du scan');
      onScanComplete(data);
      const dupCount = data.run.duplicatesSkipped || 0;
      setToast(
        `Scan terminé : ${data.run.keptLeads} pistes retenues (${data.run.rejectedNoise} bruits/listicles et ${dupCount} doublons écartés sur ${data.run.rawItems} articles).`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  }

  async function handleSendToWatchlist(lead) {
    setWatchingId(lead.id);
    setError('');
    setToast('');
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impossible de mettre en observation');
      if (onWatchlisted) onWatchlisted(data);
      setToast(`« ${lead.title} » placée dans vos Pistes en observation (onglet Radar / Surprise).`);
    } catch (err) {
      setError(err.message);
    } finally {
      setWatchingId(null);
    }
  }

  async function handlePromote(lead) {
    setPromotingId(lead.id);
    setError('');
    setToast('');
    try {
      const res = await fetch('/api/scan/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impossible de promouvoir cette piste');
      onPromoted(data);
      setToast(
        hasLlm
          ? `« ${data.discovery.nom} » synthétisée en 17 points par l'IA et ajoutée au Radar !`
          : `« ${data.discovery.nom} » ajoutée au Radar en fiche brouillon (mode sans clé IA).`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setPromotingId(null);
    }
  }

  const latestRun = scanHistory[0];

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <section className="rounded-3xl border border-[#E4E0D8] bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#D94E28]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#D94E28]">
              <Radar className="h-3.5 w-3.5" />
              Moteur autonome en direct
            </div>
            <h2 className="font-editorial text-2xl font-bold text-[#17181A]">
              Scanner de découvertes & filtre anti-déjà-connu
            </h2>
            <p className="mt-1 text-sm text-[#5B5E66]">
              Interroge en direct {freeSources.length} flux RSS/APIs ouverts
              {hasWebSearch ? ' + votre API de recherche Web connectée' : ' (sans clé requise)'}, filtre le bruit
              mainstream et isole les nouveaux objets/services prometteurs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                hasWebSearch
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-[#E4E0D8] bg-[#F8F6F1] text-[#45474D]'
              }`}
            >
              <Rss className="h-3.5 w-3.5" />
              {hasWebSearch
                ? hasXDirect
                  ? 'Flux + Web + X.com actifs'
                  : 'Flux gratuits + Recherche Web'
                : 'Mode 100 % gratuit actif'}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                hasLlm
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              {hasLlm ? 'Synthèse IA 17 pts active' : 'Synthèse locale (sans clé IA)'}
            </span>
          </div>
        </div>

        {/* Scan Form */}
        <form onSubmit={handleRunScan} className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#72757D]">
              Domaine / Angle de scan
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full rounded-xl border border-[#DCD6CA] bg-[#FAF8F4] px-3 py-2.5 text-sm font-medium text-[#17181A] focus:border-[#D94E28] focus:outline-none"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#72757D]">
              Requête libre {hasWebSearch ? '(Recherche Web API)' : '(Nécessite Tavily / Brave / Serper)'}
            </label>
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              disabled={!hasWebSearch}
              placeholder={
                hasWebSearch
                  ? 'Ex : lampe solaire portable 2026 test prix euros'
                  : 'Activez une API de recherche Web dans Connexions & API...'
              }
              className="w-full rounded-xl border border-[#DCD6CA] bg-[#FAF8F4] px-3 py-2.5 text-sm text-[#17181A] placeholder:text-[#8E9199] focus:border-[#D94E28] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex items-end md:col-span-3">
            <button
              type="submit"
              disabled={scanning}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D94E28] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#BF411F] disabled:opacity-65"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scan en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Lancer un scan
                </>
              )}
            </button>
          </div>
        </form>

        {/* Status messages */}
        {error && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}
        {toast && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
            {toast}
          </div>
        )}

        {/* Quick meta bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#EEEAE2] pt-3 text-xs text-[#5B5E66]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#D94E28]" />
              Veille auto quotidienne :{' '}
              <strong className="text-[#17181A]">
                {schedule.enabled ? `Activée (${String(schedule.hourParis ?? 8).padStart(2, '0')}h00 Paris)` : 'Désactivée'}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              className="font-semibold text-[#17181A] underline decoration-[#D94E28]/50 underline-offset-2 hover:text-[#D94E28]"
            >
              {showSources ? `Masquer les ${freeSources.length} sources gratuites` : `Voir les ${freeSources.length} sources gratuites branchées`}
            </button>
          </div>

          <button
            type="button"
            onClick={onGoToConnections}
            className="inline-flex items-center gap-1 font-semibold text-[#D94E28] hover:underline"
          >
            Configurer les clés API (Tavily / Gemini / Claude)
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {showSources && (
          <div className="mt-3 grid gap-2 rounded-2xl border border-[#ECE8DF] bg-[#FAF8F4] p-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {freeSources.map((s) => (
              <div key={s.id} className="rounded-lg border border-[#E4E0D8] bg-white px-3 py-2 text-xs">
                <div className="font-semibold text-[#17181A]">{s.name}</div>
                <div className="mt-0.5 text-[11px] text-[#72757D]">
                  Zone : {s.region} · {s.categoryHint}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Latest Run Telemetry */}
      {latestRun && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-2xl border border-[#E4E0D8] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#72757D]">Sources OK</div>
            <div className="font-mono-num mt-1 text-2xl font-bold text-[#17181A]">
              {latestRun.sourcesSucceeded}/{latestRun.sourcesQueried}
            </div>
          </div>
          <div className="rounded-2xl border border-[#E4E0D8] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#72757D]">Articles bruts</div>
            <div className="font-mono-num mt-1 text-2xl font-bold text-[#17181A]">{latestRun.rawItems}</div>
          </div>
          <div className="rounded-2xl border border-[#E4E0D8] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#72757D]">Bruits / Listicles</div>
            <div className="font-mono-num mt-1 text-2xl font-bold text-amber-700">{latestRun.rejectedNoise}</div>
          </div>
          <div className="rounded-2xl border border-[#E4E0D8] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#72757D]">Doublons écartés</div>
            <div className="font-mono-num mt-1 text-2xl font-bold text-indigo-700">
              {latestRun.duplicatesSkipped || 0}
            </div>
          </div>
          <div className="col-span-2 rounded-2xl border border-[#E4E0D8] bg-white p-4 sm:col-span-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#72757D]">Pistes retenues</div>
            <div className="font-mono-num mt-1 text-2xl font-bold text-emerald-700">{leads.length}</div>
          </div>
        </div>
      )}

      {/* Leads Results */}
      {leads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#D6D0C4] bg-white/70 p-8 text-center">
          <Activity className="mx-auto mb-3 h-8 w-8 text-[#D94E28]" />
          <h3 className="font-editorial text-xl font-bold text-[#17181A]">
            Aucun scan lancé dans cette session pour l’instant
          </h3>
          <p className="mx-auto mt-1.5 max-w-lg text-sm text-[#5B5E66]">
            Cliquez sur « Lancer un scan » ci-dessus pour interroger en temps réel nos {freeSources.length} sources d’innovations mondiales (produits & applications) et
            extraire les nouvelles découvertes du jour.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-editorial text-lg font-bold text-[#17181A]">
              <Filter className="h-4 w-4 text-[#D94E28]" />
              Pistes détectées et classées ({leads.length})
            </h3>
            <span className="text-xs text-[#72757D]">
              Triées par indice de nouveauté / signaux faibles
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {leads.map((lead) => {
              const sec = SECTION_STYLES[lead.suggestedSection] || SECTION_STYLES.C;
              const isPromoting = promotingId === lead.id;
              return (
                <div
                  key={lead.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#E4E0D8] bg-white p-4 shadow-2xs"
                >
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${sec.pill}`}>
                          {sec.short}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            lead.itemType === 'app'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-[#ECE8DF] text-[#45474D]'
                          }`}
                        >
                          {lead.itemType === 'app' ? 'App' : 'Produit'}
                        </span>
                        <span className="rounded-md bg-[#F3F0E9] px-2 py-0.5 text-[10.5px] font-medium text-[#45474D]">
                          {lead.sourceName}
                        </span>
                        {lead.provider && lead.provider !== 'free-rss' && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                            <Sparkles className="h-3 w-3" />
                            {lead.provider}
                          </span>
                        )}
                      </div>
                      <span className="font-mono-num rounded-lg bg-[#17181A] px-2 py-0.5 text-xs font-bold text-white">
                        {lead.relevanceScore}/100
                      </span>
                    </div>

                    <h4 className="font-editorial text-base font-bold leading-snug text-[#17181A]">
                      {lead.title}
                    </h4>
                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[#494B50]">
                      {lead.summary || 'Pas de résumé fourni par le flux — ouvrir le lien source.'}
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {(lead.matchedTags || []).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[#E8E4DB] bg-[#FAF8F4] px-1.5 py-0.5 text-[10.5px] font-medium text-[#5B5E66]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#EFECE4] pt-2.5">
                    <a
                      href={lead.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B5E66] hover:text-[#17181A]"
                    >
                      Source originale
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        disabled={watchingId === lead.id || isPromoting}
                        onClick={() => handleSendToWatchlist(lead)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#DCD6CA] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#3C3E44] transition hover:bg-[#F4F1EA] disabled:opacity-60"
                        title="Placer en observation sans créer tout de suite de fiche complète"
                      >
                        {watchingId === lead.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        Observer
                      </button>

                      <button
                        type="button"
                        disabled={isPromoting || watchingId === lead.id}
                        onClick={() => handlePromote(lead)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#17181A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#D94E28] disabled:opacity-60"
                      >
                        {isPromoting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Vérif. & Synthèse...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="h-3.5 w-3.5" />
                            {hasLlm ? 'Vérifier (IA) & Ajouter' : 'Ajouter au Radar'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
