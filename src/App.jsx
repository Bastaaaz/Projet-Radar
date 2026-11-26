import React, { useEffect, useMemo, useState } from 'react';
import {
  AppWindow,
  Award,
  Bookmark,
  Compass,
  Download,
  ExternalLink,
  Eye,
  Flame,
  Globe2,
  KeyRound,
  Layers,
  Loader2,
  MapPin,
  Package,
  PlusCircle,
  Radar,
  Scale,
  Search,
  Smartphone,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import DiscoveryCard from './components/DiscoveryCard';
import DiscoveryModal from './components/DiscoveryModal';
import CompareModal from './components/CompareModal';
import AutonomousEngineTab from './components/AutonomousEngineTab';
import ConnectionsTab from './components/ConnectionsTab';

const TABS = [
  { id: 'overview', label: 'Vue d’ensemble', shortLabel: 'Radar', icon: Layers },
  { id: 'TOP', label: 'Top & Best-Sellers', shortLabel: 'Top', icon: Award },
  { id: 'A', label: 'A · En France', shortLabel: 'France', icon: MapPin },
  { id: 'B', label: 'B · Monde', shortLabel: 'Monde', icon: Globe2 },
  { id: 'C', label: 'C · Émergents', shortLabel: 'Émerg.', icon: Sparkles },
  { id: 'D', label: 'D · Tractions', shortLabel: 'Traction', icon: TrendingUp },
  { id: 'E', label: 'E · Surprise & Pistes', shortLabel: 'Surprise', icon: Flame },
  { id: 'engine', label: 'Moteur Autonome', shortLabel: 'Scanner', icon: Radar },
  { id: 'connections', label: 'Connexions & API', shortLabel: 'APIs', icon: KeyRound },
];

const SECTION_INTROS = {
  TOP: {
    title: 'Top du moment & Best-Sellers — Produits phares & Applications',
    desc: 'Les sorties marquantes, best-sellers et applications incontournables du moment (dont les flagships attendus comme le Xiaomi 18 Pro et les lauréats App Store / Google Play 2026) — triés avec le même niveau de preuve et de limites que le reste du Radar.',
  },
  A: {
    title: 'A. Disponible en France',
    desc: 'Produits ou services réellement commercialisés en France, avec prix en euros TTC, boutique directe, disponibilité vérifiée et délais d’expédition connus.',
  },
  B: {
    title: 'B. Disponible ailleurs dans le monde',
    desc: 'Innovations commercialisées à l’étranger (États-Unis, Japon) non distribuées normalement en France, avec analyse réaliste d’importation, de compatibilité et de garanties.',
  },
  C: {
    title: 'C. Nouveautés émergentes',
    desc: 'Projets en phase précoce (financement participatif, précommandes, prototypes avancés) en distinguant strictement annonce, campagne en cours et produit livré.',
  },
  D: {
    title: 'D. Les meilleures tractions du moment',
    desc: 'Découvertes validées par des essais indépendants concordants, des mesures réelles ou des récompenses de salons majeurs — au-delà du simple buzz social.',
  },
  E: {
    title: 'E. La surprise du jour & Pistes en observation',
    desc: 'Une trouvaille inattendue hors des sentiers battus technologiques, suivie des pistes surveillées avant leur déploiement grand public.',
  },
};

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'product' | 'app'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedDiscovery, setSelectedDiscovery] = useState(null);

  // Side-by-side comparator state (max 3 discoveries)
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Watchlist action loading
  const [watchBusyId, setWatchBusyId] = useState(null);

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState(null);

  async function fetchRadar() {
    try {
      const res = await fetch('/api/radar');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError('');
    } catch (err) {
      setError(`Impossible de charger le Radar (${err.message}).`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRadar();
  }, []);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  async function handleInstallPwa() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  async function handleToggleAction(id, action) {
    try {
      const res = await fetch(`/api/radar/discoveries/${id}/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          favorites: updated.favorites,
          testedIds: updated.testedIds,
          hiddenIds: updated.hiddenIds,
          discoveries:
            action === 'delete'
              ? prev.discoveries.filter((d) => d.id !== id)
              : prev.discoveries,
        };
      });
      if (action === 'delete') {
        setCompareIds((prev) => prev.filter((x) => x !== id));
      }
    } catch {
      // Ignore transient failure
    }
  }

  async function handleRefreshDiscovery(id) {
    const res = await fetch(`/api/radar/discoveries/${id}/refresh`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Échec de revérification');
    setData((prev) =>
      prev
        ? {
            ...prev,
            discoveries: prev.discoveries.map((d) => (d.id === id ? json.discovery : d)),
          }
        : prev
    );
    setSelectedDiscovery(json.discovery);
  }

  async function handleSaveNote(id, userNote) {
    const res = await fetch(`/api/radar/discoveries/${id}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userNote }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur note');
    setData((prev) =>
      prev
        ? {
            ...prev,
            discoveries: prev.discoveries.map((d) => (d.id === id ? json.discovery : d)),
          }
        : prev
    );
    setSelectedDiscovery(json.discovery);
  }

  async function handlePromoteWatchlist(id) {
    setWatchBusyId(id);
    try {
      const res = await fetch(`/api/watchlist/${id}/promote`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Impossible d’analyser cette piste');
      setData((prev) =>
        prev
          ? {
              ...prev,
              discoveries: [json.discovery, ...prev.discoveries],
              watchlist: json.watchlist,
            }
          : prev
      );
      setSelectedDiscovery(json.discovery);
    } catch (err) {
      setError(err.message);
    } finally {
      setWatchBusyId(null);
    }
  }

  async function handleRemoveWatchlist(id) {
    setWatchBusyId(id);
    try {
      const res = await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        setData((prev) => (prev ? { ...prev, watchlist: json.watchlist } : prev));
      }
    } finally {
      setWatchBusyId(null);
    }
  }

  async function handleResetHidden() {
    const res = await fetch('/api/radar/reset-hidden', { method: 'POST' });
    if (res.ok) {
      setData((prev) => (prev ? { ...prev, hiddenIds: [] } : prev));
    }
  }

  function handleToggleCompare(id) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  const discoveries = data?.discoveries || [];
  const favorites = data?.favorites || [];
  const testedIds = data?.testedIds || [];
  const hiddenIds = data?.hiddenIds || [];
  const watchlist = data?.watchlist || [];

  const comparedItems = useMemo(
    () => compareIds.map((id) => discoveries.find((d) => d.id === id)).filter(Boolean),
    [compareIds, discoveries]
  );

  const countsByTab = useMemo(() => {
    const visible = discoveries.filter((d) => !hiddenIds.includes(d.id));
    const radarMain = visible.filter((d) => d.section !== 'TOP');
    return {
      allVisible: visible.length,
      overview: radarMain.length,
      TOP: visible.filter((d) => d.section === 'TOP').length,
      A: visible.filter((d) => d.section === 'A').length,
      B: visible.filter((d) => d.section === 'B').length,
      C: visible.filter((d) => d.section === 'C').length,
      D: visible.filter((d) => d.section === 'D').length,
      E: visible.filter((d) => d.section === 'E').length,
      engine: (data?.leads || []).length,
    };
  }, [discoveries, hiddenIds, data?.leads]);

  const topHighlightPreview = useMemo(
    () =>
      discoveries
        .filter((d) => !hiddenIds.includes(d.id) && d.section === 'TOP')
        .sort((a, b) => (b.scoreTotal || 0) - (a.scoreTotal || 0))
        .slice(0, 3),
    [discoveries, hiddenIds]
  );

  const filteredDiscoveries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return discoveries
      .filter((d) => !hiddenIds.includes(d.id))
      .filter((d) => {
        if (activeTab === 'overview') return d.section !== 'TOP';
        return d.section === activeTab;
      })
      .filter((d) => {
        if (typeFilter === 'all') return true;
        return (d.itemType || 'product') === typeFilter;
      })
      .filter((d) => (onlyFavorites ? favorites.includes(d.id) : true))
      .filter((d) => {
        if (!q) return true;
        const hay = `${d.nom} ${d.categorie} ${d.domaineTag} ${d.marquePays} ${d.descriptionSimple} ${d.innovationReelle} ${d.userNote || ''}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'maturity') return (b.maturiteNiveau || 0) - (a.maturiteNiveau || 0);
        if (sortBy === 'recent') return (b.addedAt || b.dateLancement || '').localeCompare(a.addedAt || a.dateLancement || '');
        return (b.scoreTotal || 0) - (a.scoreTotal || 0);
      });
  }, [discoveries, hiddenIds, activeTab, typeFilter, onlyFavorites, searchQuery, sortBy, favorites]);

  const isDiscoveryTab = ['overview', 'TOP', 'A', 'B', 'C', 'D', 'E'].includes(activeTab);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F4EF]">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E4E0D8] bg-white px-5 py-3 shadow-xs">
          <Loader2 className="h-5 w-5 animate-spin text-[#D94E28]" />
          <span className="text-sm font-semibold text-[#17181A]">Chargement de PROJECT RADAR V2...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4EF] pb-32 sm:pb-20">
      {/* Top Sticky Masthead */}
      <header className="sticky top-0 z-30 border-b border-[#E4E0D8] bg-[#F6F4EF]/92 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 pt-3.5 pb-2.5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#17181A] text-white shadow-xs">
                <Compass className="h-5 w-5 text-[#D94E28]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-editorial text-lg font-bold tracking-tight text-[#17181A] sm:text-xl">
                    PROJECT RADAR
                  </h1>
                  <span className="rounded-full border border-[#D94E28]/30 bg-[#D94E28]/10 px-2 py-0.5 font-mono-num text-[10px] font-bold uppercase tracking-wider text-[#D94E28]">
                    Discovery Engine V2
                  </span>
                </div>
                <p className="text-xs text-[#5B5E66]">
                  {data?.editionLabel || '26 novembre 2026'} · {countsByTab.allVisible} fiches ({countsByTab.overview} découvertes + {countsByTab.TOP} Top moment)
                </p>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {installPrompt && (
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Installer l’app</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('engine')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#D94E28] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#BF411F]"
              >
                <Radar className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Scanner live</span>
                <span className="xs:hidden">Scan</span>
              </button>

              <a
                href="/api/export/markdown"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCD6CA] bg-white px-3 py-1.5 text-xs font-semibold text-[#17181A] transition hover:bg-[#FAF8F4]"
                title="Télécharger l'édition complète en Markdown"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Exporter (.md)</span>
              </a>
            </div>
          </div>

          {/* Horizontal Tab Strip */}
          <nav className="no-scrollbar -mx-1 mt-3 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = countsByTab[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#17181A] text-white shadow-2xs'
                      : 'border border-transparent text-[#494B50] hover:border-[#DFDBD2] hover:bg-white'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#D94E28]' : 'text-[#72757D]'}`} />
                  <span>{tab.label}</span>
                  {typeof count === 'number' && count > 0 && (
                    <span
                      className={`font-mono-num rounded-md px-1.5 py-0.5 text-[10px] leading-none ${
                        isActive ? 'bg-white/15 text-white' : 'bg-[#EAE6DC] text-[#383A40]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </div>
        )}

        {isDiscoveryTab && (
          <div className="space-y-6">
            {activeTab === 'overview' ? (
              <div className="space-y-4">
                <section className="rounded-3xl border border-[#E4E0D8] bg-white p-5 shadow-2xs sm:p-6">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="max-w-2xl">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#D94E28]">
                        Veille indépendante multi-univers · Consultation du 26 novembre 2026
                      </span>
                      <h2 className="mt-1 font-editorial text-2xl font-bold text-[#17181A] sm:text-3xl">
                        Ce qui sort du lot aujourd’hui — hors bruit mainstream
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#5B5E66]">
                        Cliquez sur n’importe quelle fiche pour lire les <strong>17 points</strong>, ajouter vos notes,
                        revérifier le statut en France en direct, ou cochez <strong>Comparer</strong> sur 2–3 cartes.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                      <div className="rounded-2xl border border-[#ECE8DF] bg-[#FAF8F4] px-3.5 py-2.5 text-center">
                        <div className="font-mono-num text-xl font-bold text-[#17181A]">{countsByTab.overview}</div>
                        <div className="text-[10.5px] font-medium text-[#72757D]">Découvertes</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('TOP')}
                        className="rounded-2xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-center transition hover:bg-amber-100/70"
                      >
                        <div className="font-mono-num text-xl font-bold text-amber-900">{countsByTab.TOP}</div>
                        <div className="text-[10.5px] font-medium text-amber-800">Top moment</div>
                      </button>
                      <div className="rounded-2xl border border-[#ECE8DF] bg-[#FAF8F4] px-3.5 py-2.5 text-center">
                        <div className="font-mono-num text-xl font-bold text-[#D94E28]">
                          {data?.freeSourcesCount || 18}
                        </div>
                        <div className="text-[10.5px] font-medium text-[#72757D]">Sources live</div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Teaser bar linking to Top & Best-Sellers */}
                {topHighlightPreview.length > 0 && (
                  <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/60 px-4 py-3 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#17181A] px-2.5 py-0.5 font-semibold text-white">
                        <Award className="h-3 w-3 text-[#D94E28]" />
                        Top & Best-Sellers
                      </span>
                      <span className="font-medium text-[#3C3E44]">
                        À voir aussi dans l’onglet dédié :{' '}
                        {topHighlightPreview.map((t) => t.nom).join(' · ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('TOP')}
                      className="shrink-0 self-start rounded-xl bg-[#D94E28] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#BF411F] sm:self-auto"
                    >
                      Ouvrir Top & Best-Sellers ({countsByTab.TOP})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <section className="rounded-3xl border border-[#E4E0D8] bg-white p-5 shadow-2xs">
                <h2 className="font-editorial text-2xl font-bold text-[#17181A]">
                  {SECTION_INTROS[activeTab]?.title}
                </h2>
                <p className="mt-1 text-sm text-[#5B5E66]">{SECTION_INTROS[activeTab]?.desc}</p>
              </section>
            )}

            {/* Search / Type / Sort / Filter Bar */}
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:w-72">
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#72757D]" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer par produit, app, domaine, note..."
                    className="w-full rounded-xl border border-[#DCD6CA] bg-white py-2 pr-3 pl-9 text-sm text-[#17181A] placeholder:text-[#8E9199] focus:border-[#D94E28] focus:outline-none"
                  />
                </div>

                {/* Product vs App filter pills */}
                <div className="inline-flex rounded-xl border border-[#DCD6CA] bg-white p-0.5 text-xs font-semibold">
                  {[
                    { id: 'all', label: 'Tout', icon: Layers },
                    { id: 'product', label: 'Produits', icon: Package },
                    { id: 'app', label: 'Applications', icon: AppWindow },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const active = typeFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTypeFilter(opt.id)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition ${
                          active ? 'bg-[#17181A] text-white' : 'text-[#5B5E66] hover:text-[#17181A]'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#D94E28]' : ''}`} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyFavorites((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    onlyFavorites
                      ? 'border-[#D94E28] bg-[#D94E28]/10 text-[#D94E28]'
                      : 'border-[#DCD6CA] bg-white text-[#494B50] hover:bg-[#FAF8F4]'
                  }`}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
                  Favoris ({favorites.length})
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-[#DCD6CA] bg-white px-3 py-2 text-xs font-semibold text-[#17181A] focus:border-[#D94E28] focus:outline-none"
                >
                  <option value="score">Trier : Score /100</option>
                  <option value="maturity">Trier : Maturité</option>
                  <option value="recent">Trier : Plus récents</option>
                </select>

                {hiddenIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetHidden}
                    className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Réafficher ({hiddenIds.length})
                  </button>
                )}
              </div>
            </div>

            {/* Cards Grid */}
            {filteredDiscoveries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#D6D0C4] bg-white/70 p-10 text-center">
                <p className="font-editorial text-lg font-bold text-[#17181A]">
                  Aucune découverte ne correspond à ce filtre.
                </p>
                <p className="mt-1 text-sm text-[#5B5E66]">
                  Essayez d’effacer la recherche, de désactiver le filtre Favoris ou lancez un nouveau scan dans
                  l’onglet « Moteur Autonome ».
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDiscoveries.map((discovery) => (
                  <DiscoveryCard
                    key={discovery.id}
                    discovery={discovery}
                    isFavorite={favorites.includes(discovery.id)}
                    isTested={testedIds.includes(discovery.id)}
                    isCompared={compareIds.includes(discovery.id)}
                    onOpen={setSelectedDiscovery}
                    onToggleAction={handleToggleAction}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            )}

            {/* Watchlist section shown on Overview & Tab E */}
            {(activeTab === 'overview' || activeTab === 'E') && watchlist.length > 0 && (
              <section className="rounded-3xl border border-[#E4E0D8] bg-white p-5 shadow-2xs sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#72757D]">
                      Prochaine édition
                    </span>
                    <h3 className="font-editorial text-xl font-bold text-[#17181A]">
                      Pistes en observation ({watchlist.length})
                    </h3>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {watchlist.map((item) => {
                    const busy = watchBusyId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between rounded-2xl border border-[#ECE8DF] bg-[#FAF8F4] p-4"
                      >
                        <div>
                          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D94E28]">
                              {item.domaine || item.categorie || 'Observation'}
                            </span>
                            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-[#45474D]">
                              {item.pays || item.sourceName || 'Web'}
                            </span>
                          </div>
                          <h4 className="font-editorial text-base font-bold text-[#17181A]">{item.nom}</h4>
                          {item.statut && (
                            <p className="mt-1 text-xs font-semibold text-[#3C3E44]">{item.statut}</p>
                          )}
                          <p className="mt-1.5 text-xs leading-relaxed text-[#5B5E66]">{item.raison}</p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6E2D8] pt-2.5">
                          <a
                            href={item.lien}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#17181A] hover:text-[#D94E28]"
                          >
                            Suivre la source
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handlePromoteWatchlist(item.id)}
                              className="inline-flex items-center gap-1 rounded-xl bg-[#17181A] px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-[#D94E28] disabled:opacity-60"
                            >
                              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlusCircle className="h-3 w-3" />}
                              Analyser (17 pts)
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleRemoveWatchlist(item.id)}
                              className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                              title="Retirer de la liste"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'engine' && (
          <AutonomousEngineTab
            leads={data?.leads || []}
            scanHistory={data?.scanHistory || []}
            freeSources={data?.freeSources || []}
            connections={data?.connections || {}}
            schedule={data?.schedule || {}}
            onScanComplete={(res) => {
              setData((prev) =>
                prev
                  ? {
                      ...prev,
                      leads: res.leads,
                      scanHistory: [res.run, ...(prev.scanHistory || [])].slice(0, 15),
                    }
                  : prev
              );
            }}
            onPromoted={(res) => {
              setData((prev) =>
                prev
                  ? {
                      ...prev,
                      discoveries: [res.discovery, ...prev.discoveries],
                      leads: res.leads,
                    }
                  : prev
              );
            }}
            onWatchlisted={(res) => {
              setData((prev) =>
                prev
                  ? {
                      ...prev,
                      watchlist: res.watchlist,
                      leads: res.leads,
                    }
                  : prev
              );
            }}
            onGoToConnections={() => setActiveTab('connections')}
          />
        )}

        {activeTab === 'connections' && (
          <ConnectionsTab
            connections={data?.connections || {}}
            schedule={data?.schedule || {}}
            onUpdated={(res) => {
              setData((prev) =>
                prev
                  ? {
                      ...prev,
                      connections: res.connections,
                      schedule: res.schedule,
                    }
                  : prev
              );
            }}
          />
        )}
      </main>

      {/* Floating Side-by-Side Comparison Pill */}
      {comparedItems.length > 0 && (
        <div className="fixed right-4 bottom-20 left-4 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-[#17181A] px-4 py-2.5 text-white shadow-xl sm:bottom-5">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <Scale className="h-4 w-4 shrink-0 text-[#D94E28]" />
            <span className="truncate font-semibold">
              {comparedItems.length === 1
                ? `1 fiche sélectionnée (${comparedItems[0].nom}) — choisissez-en une 2e`
                : `${comparedItems.length} fiches prêtes à comparer`}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="text-xs font-medium text-white/70 hover:text-white"
            >
              Vider
            </button>
            {comparedItems.length >= 2 && (
              <button
                type="button"
                onClick={() => setCompareOpen(true)}
                className="rounded-xl bg-[#D94E28] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#BF411F]"
              >
                Comparer côte à côte
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#DFDBD2] bg-white/95 px-2 py-1.5 backdrop-blur-md sm:hidden">
        <div className="grid grid-cols-5 gap-1">
          {[
            { id: 'overview', label: 'Radar', icon: Layers },
            { id: 'TOP', label: 'Top', icon: Award },
            { id: 'A', label: 'France', icon: MapPin },
            { id: 'engine', label: 'Scanner', icon: Radar },
            { id: 'connections', label: 'APIs', icon: KeyRound },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center rounded-xl py-1 text-[10px] font-semibold transition ${
                  active ? 'bg-[#17181A] text-white' : 'text-[#5B5E66]'
                }`}
              >
                <Icon className={`mb-0.5 h-4 w-4 ${active ? 'text-[#D94E28]' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 17-Point Full Dossier Modal */}
      {selectedDiscovery && (
        <DiscoveryModal
          discovery={selectedDiscovery}
          isFavorite={favorites.includes(selectedDiscovery.id)}
          isTested={testedIds.includes(selectedDiscovery.id)}
          onClose={() => setSelectedDiscovery(null)}
          onToggleAction={handleToggleAction}
          onRefreshDiscovery={handleRefreshDiscovery}
          onSaveNote={handleSaveNote}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      {compareOpen && (
        <CompareModal
          items={comparedItems}
          onClose={() => setCompareOpen(false)}
          onRemoveItem={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
          onOpenDetail={(d) => setSelectedDiscovery(d)}
        />
      )}
    </div>
  );
}
