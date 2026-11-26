import React, { useEffect } from 'react';
import { Award, Scale, X } from 'lucide-react';
import { CountryTag, DomainIcon, SECTION_STYLES } from './DomainBadge';

const AXES = [
  { key: 'originalite', label: 'Originalité / Innovation', max: 25 },
  { key: 'utilite', label: 'Intérêt concret particulier', max: 20 },
  { key: 'precocite', label: 'Précocité (avant le grand public)', max: 20 },
  { key: 'credibilite', label: 'Qualité / Crédibilité', max: 15 },
  { key: 'potentiel', label: 'Potentiel de développement', max: 10 },
  { key: 'accessibilite', label: 'Accessibilité particulier', max: 10 },
];

export default function CompareModal({ items = [], onClose, onRemoveItem, onOpenDetail }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!items || items.length < 2) return null;

  const maxTotal = Math.max(...items.map((d) => d.scoreTotal || 0));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#141517]/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl border border-[#E0DBD0] bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#ECE8DF] bg-[#FAF8F4] px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#17181A] text-white">
              <Scale className="h-5 w-5 text-[#D94E28]" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-[#17181A]">
                Comparateur côte à côte ({items.length} découvertes)
              </h2>
              <p className="text-xs text-[#5B5E66]">
                Comparez scores sur 100, prix, disponibilité France, maturité et limites.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#E0DBD0] bg-white p-2 text-[#45474D] hover:bg-[#F2EFE8]"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Comparison Grid */}
        <div className="flex-1 overflow-auto p-5 sm:p-7">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${items.length}, minmax(240px, 1fr))` }}
          >
            {/* Column Headers */}
            {items.map((d) => {
              const sec = SECTION_STYLES[d.section] || SECTION_STYLES.C;
              const isWinner = (d.scoreTotal || 0) === maxTotal;
              return (
                <div
                  key={d.id}
                  className={`rounded-2xl border p-4 ${
                    isWinner ? 'border-[#D94E28]/50 bg-[#FFF9F6]' : 'border-[#E4E0D8] bg-[#FCFBF8]'
                  }`}
                >
                  {d.imageUrl && (
                    <img
                      src={d.imageUrl}
                      alt={d.nom}
                      referrerPolicy="no-referrer"
                      className="mb-3 h-28 w-full rounded-xl border border-[#ECE8DF] object-cover"
                    />
                  )}
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${sec.pill}`}>
                        {sec.short}
                      </span>
                      <CountryTag code={d.paysCode} />
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(d.id)}
                      className="text-xs font-medium text-[#72757D] hover:text-rose-700"
                    >
                      Retirer
                    </button>
                  </div>

                  <div className="mb-2 flex items-start gap-2">
                    <DomainIcon discovery={d} className="mt-1 h-4 w-4 shrink-0 text-[#D94E28]" />
                    <h3
                      onClick={() => {
                        onClose();
                        onOpenDetail(d);
                      }}
                      className="cursor-pointer font-editorial text-lg font-bold leading-snug text-[#17181A] hover:text-[#D94E28]"
                    >
                      {d.nom}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-[#17181A] px-3 py-2 text-white">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-white/80">
                      {isWinner && <Award className="h-3.5 w-3.5 text-amber-400" />}
                      Score Radar
                    </span>
                    <span className="font-mono-num text-base font-bold">
                      {d.scoreTotal}
                      <span className="text-xs font-normal text-white/60">/100</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 6-Axis Comparison */}
          <div className="mt-6 rounded-2xl border border-[#E4E0D8] bg-white p-4 sm:p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#72757D]">
              Détail des 6 critères (/100)
            </h3>
            <div className="space-y-3">
              {AXES.map((axis) => {
                const bestAxis = Math.max(...items.map((d) => Number(d.scoreBreakdown?.[axis.key] ?? 0)));
                return (
                  <div key={axis.key} className="border-t border-[#F0EDE6] pt-2.5 first:border-t-0 first:pt-0">
                    <div className="mb-1.5 text-xs font-semibold text-[#17181A]">
                      {axis.label} <span className="text-[#72757D]">(max {axis.max})</span>
                    </div>
                    <div
                      className="grid gap-3"
                      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(200px, 1fr))` }}
                    >
                      {items.map((d) => {
                        const val = Number(d.scoreBreakdown?.[axis.key] ?? 0);
                        const pct = Math.min(100, Math.round((val / axis.max) * 100));
                        const isBest = val === bestAxis && bestAxis > 0;
                        return (
                          <div key={d.id} className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ECE8DF]">
                              <div
                                className={`h-full rounded-full ${isBest ? 'bg-emerald-600' : 'bg-[#D94E28]'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span
                              className={`font-mono-num w-11 text-right text-xs font-bold ${
                                isBest ? 'text-emerald-700' : 'text-[#383A40]'
                              }`}
                            >
                              {val}/{axis.max}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Structured Attributes Comparison */}
          {[
            { label: 'Prix & abonnements', key: 'prixAbonnements' },
            { label: 'Disponibilité & réalité d’achat', key: 'disponibiliteGeo' },
            { label: 'Innovation réelle', key: 'innovationReelle' },
            { label: 'Différence vs alternatives', key: 'differenceAlternatives' },
            { label: 'Verdict Radar', key: 'avisPersonnel' },
          ].map((row) => (
            <div key={row.key} className="mt-4 rounded-2xl border border-[#E4E0D8] bg-[#FCFBF8] p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#D94E28]">
                {row.label}
              </div>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${items.length}, minmax(220px, 1fr))` }}
              >
                {items.map((d) => (
                  <div key={d.id} className="text-xs leading-relaxed text-[#242629]">
                    <div className="mb-1 font-bold text-[#17181A]">{d.nom}</div>
                    <p>{d[row.key]}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Pros & Cons */}
          <div className="mt-4 rounded-2xl border border-[#E4E0D8] bg-white p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#72757D]">
              Avantages & Limites clés
            </div>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${items.length}, minmax(220px, 1fr))` }}
            >
              {items.map((d) => (
                <div key={d.id} className="space-y-2 text-xs">
                  <div className="font-bold text-[#17181A]">{d.nom}</div>
                  <ul className="space-y-1 text-emerald-900">
                    {(d.avantages || []).map((a, i) => (
                      <li key={i}>+ {a}</li>
                    ))}
                  </ul>
                  <ul className="space-y-1 text-amber-900">
                    {(d.limites || []).map((l, i) => (
                      <li key={i}>− {l}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
