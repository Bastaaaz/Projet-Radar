import React, { useState } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  EyeOff,
  Scale,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import { CONFIDENCE_STYLES, CountryTag, DomainIcon, SECTION_STYLES } from './DomainBadge';

export default function DiscoveryCard({
  discovery,
  isFavorite,
  isTested,
  isCompared,
  onOpen,
  onToggleAction,
  onToggleCompare,
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const sec = SECTION_STYLES[discovery.section] || SECTION_STYLES.C;
  const confStyle = CONFIDENCE_STYLES[discovery.confiance] || CONFIDENCE_STYLES.Moyenne;
  const hasImage = Boolean(discovery.imageUrl) && !imgFailed;

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E4E0D8] bg-white shadow-[0_1px_2px_rgba(20,21,23,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CBC4B7] hover:shadow-[0_10px_28px_-12px_rgba(20,21,23,0.14)]">
      <div>
        {/* Product Thumbnail Header */}
        <div
          onClick={() => onOpen(discovery)}
          className="relative h-36 w-full cursor-pointer overflow-hidden border-b border-[#ECE8DF] bg-gradient-to-br from-[#F4F1EA] via-[#FAF8F4] to-[#EDE8DD]"
        >
          {hasImage ? (
            <img
              src={discovery.imageUrl}
              alt={discovery.nom}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E2DDD2] bg-white/90 text-[#D94E28] shadow-xs">
                <DomainIcon discovery={discovery} className="h-7 w-7" />
              </div>
            </div>
          )}

          {/* Subtle top gradient for crisp badge legibility */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />

          {/* Top overlaid Meta + Score */}
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight shadow-xs backdrop-blur-xs ${sec.pill}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${sec.dot}`} />
                {sec.short}
              </span>
              <CountryTag code={discovery.paysCode} />
              {discovery.addedAutomatically && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-2 py-0.5 text-[11px] font-semibold text-[#D94E28] shadow-xs">
                  <Sparkles className="h-3 w-3" />
                  Scan
                </span>
              )}
            </div>

            <div
              className="flex shrink-0 items-center gap-1 rounded-xl border border-white/15 bg-[#17181A]/90 px-2.5 py-1 text-white shadow-sm backdrop-blur-xs"
              title={discovery.scoreNotes || 'Score Radar argumenté sur 100'}
            >
              <span className="font-mono-num text-sm font-bold leading-none">{discovery.scoreTotal}</span>
              <span className="font-mono-num text-[10px] text-white/65">/100</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 pb-2">
          <div className="mb-3 flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E6E2D8] bg-[#F8F6F1] text-[#D94E28]">
              <DomainIcon discovery={discovery} className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#72757D]">
                  {discovery.domaineTag || discovery.categorie}
                </p>
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    discovery.itemType === 'app'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-[#F2EFE8] text-[#5B5E66]'
                  }`}
                >
                  {discovery.itemType === 'app' ? 'App' : 'Produit'}
                </span>
              </div>
              <h3
                onClick={() => onOpen(discovery)}
                className="cursor-pointer font-editorial text-lg font-bold leading-snug text-[#17181A] transition-colors group-hover:text-[#D94E28]"
              >
                {discovery.nom}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-[#5B5E66]">{discovery.marquePays}</p>
            </div>
          </div>

          <p className="mb-3 line-clamp-3 text-[13.5px] leading-relaxed text-[#383A40]">
            {discovery.descriptionSimple}
          </p>

          <div className="mb-3.5 rounded-xl border border-[#ECE8DF] bg-[#FAF8F4] p-3">
            <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-[#D94E28]">
              Ce qui le rend innovant
            </div>
            <p className="line-clamp-3 text-xs leading-relaxed text-[#2C2E33]">
              {discovery.innovationReelle}
            </p>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded-md bg-[#F2EFE8] px-2 py-0.5 font-medium text-[#3C3E44]">
              Niv. {discovery.maturiteNiveau}/5 · {discovery.maturiteLabel}
            </span>
            <span className={`rounded-md border px-2 py-0.5 font-medium ${confStyle}`}>
              Confiance {discovery.confiance}
            </span>
            {discovery.userNote && (
              <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-medium text-indigo-800">
                <StickyNote className="h-3 w-3" />
                Note
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Price + Actions */}
      <div className="mt-1 border-t border-[#EEEAE2] px-5 pt-3 pb-4">
        <p className="mb-3 line-clamp-2 text-xs font-medium text-[#222428]">
          <span className="text-[#72757D]">Prix : </span>
          {discovery.prixAbonnements}
        </p>

        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleAction(discovery.id, 'favorite')}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                isFavorite
                  ? 'border-[#D94E28]/30 bg-[#D94E28]/10 text-[#D94E28]'
                  : 'border-[#E4E0D8] bg-white text-[#5B5E66] hover:bg-[#F7F5F0]'
              }`}
              title="Enregistrer en favori"
            >
              <Bookmark className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onToggleAction(discovery.id, 'tested')}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                isTested
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-[#E4E0D8] bg-white text-[#5B5E66] hover:bg-[#F7F5F0]'
              }`}
              title="Marquer comme vu / testé"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onToggleCompare(discovery.id)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                isCompared
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                  : 'border-[#E4E0D8] bg-white text-[#5B5E66] hover:bg-[#F7F5F0]'
              }`}
              title="Ajouter au comparateur côte à côte"
            >
              <Scale className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isCompared ? 'Comparé' : 'Comparer'}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleAction(discovery.id, 'hide')}
              className="inline-flex items-center rounded-lg border border-[#E4E0D8] bg-white p-1.5 text-[#72757D] transition hover:bg-rose-50 hover:text-rose-700"
              title="Déjà connu — masquer de cette vue"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpen(discovery)}
            className="inline-flex items-center gap-1 rounded-xl bg-[#17181A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#D94E28]"
          >
            Fiche 17 pts
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
