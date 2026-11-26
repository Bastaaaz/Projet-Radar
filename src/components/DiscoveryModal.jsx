import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  StickyNote,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react';
import { CONFIDENCE_STYLES, CountryTag, DomainIcon, SECTION_STYLES } from './DomainBadge';

const SCORE_CRITERIA = [
  { key: 'originalite', label: 'Originalité / innovation', max: 25 },
  { key: 'utilite', label: 'Intérêt concret particulier', max: 20 },
  { key: 'precocite', label: 'Précocité (avant le grand public)', max: 20 },
  { key: 'credibilite', label: 'Qualité / crédibilité', max: 15 },
  { key: 'potentiel', label: 'Potentiel de développement', max: 10 },
  { key: 'accessibilite', label: 'Accessibilité pour un particulier', max: 10 },
];

function FieldBlock({ num, label, children }) {
  return (
    <div className="rounded-xl border border-[#ECE8DF] bg-[#FCFBF8] p-3.5">
      <div className="mb-1 flex items-center gap-2">
        <span className="font-mono-num inline-flex h-5 w-6 items-center justify-center rounded bg-[#EFECE5] text-[10.5px] font-bold text-[#494B50]">
          {String(num).padStart(2, '0')}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#72757D]">
          {label}
        </span>
      </div>
      <div className="text-[13.5px] leading-relaxed text-[#1F2124]">{children}</div>
    </div>
  );
}

export default function DiscoveryModal({
  discovery,
  isFavorite,
  isTested,
  onClose,
  onToggleAction,
  onRefreshDiscovery,
  onSaveNote,
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteStatus, setNoteStatus] = useState('');

  useEffect(() => {
    setImgFailed(false);
    setNoteDraft(discovery?.userNote || '');
    setNoteStatus('');
  }, [discovery?.id, discovery?.userNote]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!discovery) return null;

  const sec = SECTION_STYLES[discovery.section] || SECTION_STYLES.C;
  const confStyle = CONFIDENCE_STYLES[discovery.confiance] || CONFIDENCE_STYLES.Moyenne;
  const breakdown = discovery.scoreBreakdown || {};

  async function handleRefreshClick() {
    if (!onRefreshDiscovery) return;
    setRefreshing(true);
    try {
      await onRefreshDiscovery(discovery.id);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSaveNoteClick() {
    if (!onSaveNote) return;
    setSavingNote(true);
    setNoteStatus('');
    try {
      await onSaveNote(discovery.id, noteDraft);
      setNoteStatus('Note enregistrée.');
    } catch {
      setNoteStatus('Erreur de sauvegarde.');
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#141517]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-[#E0DBD0] bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#ECE8DF] bg-[#FAF8F4] px-5 py-4 sm:px-7">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#E4E0D8] bg-white text-[#D94E28] shadow-xs">
              <DomainIcon discovery={discovery} className="h-5 w-5" />
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${sec.pill}`}>
                  {sec.full}
                </span>
                <CountryTag code={discovery.paysCode} />
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${confStyle}`}>
                  Confiance : {discovery.confiance}
                </span>
              </div>
              <h2 className="font-editorial text-xl font-bold leading-snug text-[#17181A] sm:text-2xl">
                {discovery.nom}
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden rounded-xl bg-[#17181A] px-3 py-1.5 text-center text-white sm:block">
              <div className="font-mono-num text-lg font-bold leading-none">
                {discovery.scoreTotal}
                <span className="text-xs font-normal text-white/65">/100</span>
              </div>
              <div className="mt-0.5 text-[9px] uppercase tracking-wider text-white/65">Score Radar</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E0DBD0] bg-white p-2 text-[#45474D] transition hover:bg-[#F2EFE8]"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable 17-Point Dossier */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
          {/* Product Visual Banner */}
          {discovery.imageUrl && !imgFailed && (
            <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-[#ECE8DF] bg-[#F4F1EA] sm:h-52">
              <img
                src={discovery.imageUrl}
                alt={discovery.nom}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#ECE8DF] bg-[#F7F5F0] px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#494B50]">
              <span className="font-semibold text-[#17181A]">
                Niveau {discovery.maturiteNiveau}/5 : {discovery.maturiteLabel}
              </span>
              <span className="sm:hidden font-mono-num font-bold text-[#D94E28]">
                · Score {discovery.scoreTotal}/100
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleRefreshClick}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 disabled:opacity-60"
                title="Vérifier via Tavily + Gemini si la disponibilité en France ou le prix ont évolué"
              >
                {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Revérifier statut / dispo FR
              </button>

              <button
                type="button"
                onClick={() => onToggleAction(discovery.id, 'favorite')}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  isFavorite
                    ? 'border-[#D94E28]/30 bg-[#D94E28]/10 text-[#D94E28]'
                    : 'border-[#DCD6CA] bg-white text-[#45474D]'
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'En favoris' : 'Favori'}
              </button>
              <button
                type="button"
                onClick={() => onToggleAction(discovery.id, 'tested')}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  isTested
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-[#DCD6CA] bg-white text-[#45474D]'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isTested ? 'Vu / Testé' : 'Marquer vu'}
              </button>
              {discovery.addedAutomatically && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleAction(discovery.id, 'delete');
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              )}
            </div>
          </div>

          {discovery.refreshSummary && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 text-xs text-blue-900">
              <strong>Dernière revérification ({new Date(discovery.lastRefreshedAt).toLocaleDateString('fr-FR')}) :</strong>{' '}
              {discovery.refreshSummary}
            </div>
          )}

          {/* Grid Points 1-4 */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldBlock num={1} label="Nom du produit ou service">
              {discovery.nom}
            </FieldBlock>
            <FieldBlock num={2} label="Catégorie">
              {discovery.categorie}
            </FieldBlock>
            <FieldBlock num={3} label="Marque et pays d’origine">
              {discovery.marquePays}
            </FieldBlock>
            <FieldBlock num={4} label="Date de lancement ou d’annonce">
              {discovery.dateLancement}
            </FieldBlock>
          </div>

          {/* Points 5-8 */}
          <div className="grid gap-3">
            <FieldBlock num={5} label="Description simple et claire">
              {discovery.descriptionSimple}
            </FieldBlock>
            <div className="rounded-xl border border-[#D94E28]/25 bg-[#FFF9F6] p-3.5">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-mono-num inline-flex h-5 w-6 items-center justify-center rounded bg-[#D94E28] text-[10.5px] font-bold text-white">
                  06
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D94E28]">
                  Ce qui le rend réellement innovant
                </span>
              </div>
              <p className="text-[13.5px] leading-relaxed text-[#1F2124]">{discovery.innovationReelle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldBlock num={7} label="Utilité concrète pour un particulier">
                {discovery.utiliteConcrete}
              </FieldBlock>
              <FieldBlock num={8} label="Différence vs alternatives existantes">
                {discovery.differenceAlternatives}
              </FieldBlock>
            </div>
          </div>

          {/* Points 9-13 */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldBlock num={9} label="Prix et abonnements éventuels">
              {discovery.prixAbonnements}
            </FieldBlock>
            <FieldBlock num={10} label="Disponibilité géographique & réalité d’achat">
              {discovery.disponibiliteGeo}
            </FieldBlock>
            <FieldBlock num={11} label="Niveau de maturité (1 à 5)">
              <strong>Niveau {discovery.maturiteNiveau}/5</strong> — {discovery.maturiteLabel}
            </FieldBlock>
            <FieldBlock num={12} label="Niveau de confiance & vérification">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                {discovery.confiance}
              </div>
              <p className="mt-1 text-xs text-[#494B50]">{discovery.confianceDetail}</p>
            </FieldBlock>
          </div>

          <FieldBlock num={13} label="Popularité / traction (chiffres vérifiables)">
            {discovery.traction}
          </FieldBlock>

          {/* Points 14-15: Avantages & Limites */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono-num inline-flex h-5 w-6 items-center justify-center rounded bg-emerald-700 text-[10.5px] font-bold text-white">
                  14
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Principaux avantages
                </span>
              </div>
              <ul className="space-y-1.5 text-[13px] text-[#1F2124]">
                {(discovery.avantages || []).map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono-num inline-flex h-5 w-6 items-center justify-center rounded bg-amber-700 text-[10.5px] font-bold text-white">
                  15
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Limites et inconvénients
                </span>
              </div>
              <ul className="space-y-1.5 text-[13px] text-[#1F2124]">
                {(discovery.limites || []).map((l, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Point 16: Avis personnel */}
          <FieldBlock num={16} label="Avis personnel & verdict Radar">
            <p className="italic text-[#2C2E33]">« {discovery.avisPersonnel} »</p>
          </FieldBlock>

          {/* Point 17: Liens officiels */}
          <FieldBlock num={17} label="Liens directs vérifiés">
            <div className="flex flex-wrap gap-2 pt-1">
              {(discovery.liens || []).map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCD6CA] bg-white px-3 py-1.5 text-xs font-semibold text-[#17181A] transition hover:border-[#D94E28] hover:text-[#D94E28]"
                >
                  {l.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </FieldBlock>

          {/* Personal Notes */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900">
                <StickyNote className="h-4 w-4 text-indigo-700" />
                Mes notes personnelles
              </div>
              {noteStatus && <span className="text-xs font-semibold text-emerald-700">{noteStatus}</span>}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <textarea
                rows={2}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Ex : À surveiller pour Noël, attendre la V2, vérifier compatibilité..."
                className="flex-1 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs text-[#17181A] placeholder:text-[#8E9199] focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveNoteClick}
                disabled={savingNote}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-indigo-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-800 disabled:opacity-60"
              >
                {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Enregistrer
              </button>
            </div>
          </div>

          {/* 6-Axis Score Breakdown */}
          <div className="rounded-2xl border border-[#E4E0D8] bg-[#17181A] p-5 text-white">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#D94E28]">
                  Grille d’évaluation Radar /100
                </div>
                <p className="mt-0.5 text-xs text-white/75">{discovery.scoreNotes}</p>
              </div>
              <div className="font-mono-num text-2xl font-bold">
                {discovery.scoreTotal}
                <span className="text-sm font-normal text-white/60">/100</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SCORE_CRITERIA.map((c) => {
                const val = Number(breakdown[c.key] ?? 0);
                const pct = Math.min(100, Math.round((val / c.max) * 100));
                return (
                  <div key={c.key} className="rounded-xl bg-white/6 p-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-white/85">{c.label}</span>
                      <span className="font-mono-num font-bold text-white">
                        {val}/{c.max}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full bg-[#D94E28]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
