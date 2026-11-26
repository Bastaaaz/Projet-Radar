import React from 'react';
import {
  Bot,
  Droplets,
  Sun,
  Phone,
  Clock,
  Box,
  Music,
  Headphones,
  KeyRound,
  Waves,
  Sparkles,
  Compass,
  Smartphone,
  Gamepad2,
  AppWindow,
} from 'lucide-react';

export const SECTION_STYLES = {
  TOP: {
    pill: 'bg-amber-50 text-amber-900 border-amber-300',
    dot: 'bg-[#D94E28]',
    short: 'TOP · Moment',
    full: 'Top Moment · Produits & Apps phares',
  },
  A: {
    pill: 'bg-teal-50 text-teal-800 border-teal-200',
    dot: 'bg-teal-600',
    short: 'A · En France',
    full: 'A. Disponible en France',
  },
  B: {
    pill: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-600',
    short: 'B · Monde',
    full: 'B. Disponible ailleurs dans le monde',
  },
  C: {
    pill: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-600',
    short: 'C · Émergent',
    full: 'C. Nouveautés émergentes',
  },
  D: {
    pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
    short: 'D · Traction',
    full: 'D. Meilleures tractions du moment',
  },
  E: {
    pill: 'bg-violet-50 text-violet-800 border-violet-200',
    dot: 'bg-violet-600',
    short: 'E · Surprise',
    full: 'E. La surprise du jour',
  },
};

export const CONFIDENCE_STYLES = {
  Élevée: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Moyenne: 'bg-amber-50 text-amber-700 border-amber-200',
  Faible: 'bg-rose-50 text-rose-700 border-rose-200',
};

const COUNTRY_NAMES = {
  FR: 'France',
  US: 'États-Unis',
  JP: 'Japon',
  CN: 'Chine',
  CA: 'Canada',
  TR: 'Turquie',
  GB: 'Royaume-Uni',
  DE: 'Allemagne',
  INT: 'International',
};

export function CountryTag({ code }) {
  const label = COUNTRY_NAMES[code] || code || 'Global';
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[#E2DDD3] bg-[#F8F6F1] px-2 py-0.5 text-[11px] font-medium text-[#45474D]">
      <span className="font-mono-num font-bold text-[#17181A]">{code || 'INT'}</span>
      <span>{label}</span>
    </span>
  );
}

export function DomainIcon({ discovery, className = 'w-5 h-5' }) {
  const id = (discovery?.id || '').toLowerCase();
  const cat = `${discovery?.categorie || ''} ${discovery?.domaineTag || ''}`.toLowerCase();

  if (id.includes('xiaomi') || cat.includes('smartphone')) {
    return <Smartphone className={className} />;
  }
  if (id.includes('roborock') || cat.includes('robotique')) {
    return <Bot className={className} />;
  }
  if (id.includes('switch') || cat.includes('gaming') || cat.includes('console')) {
    return <Gamepad2 className={className} />;
  }
  if (id.includes('qobuz') || cat.includes('audio')) {
    return <Music className={className} />;
  }
  if (discovery?.itemType === 'app' || cat.includes('application') || cat.includes('app ')) {
    return <AppWindow className={className} />;
  }
  if (id.includes('opty') || cat.includes('eau') || cat.includes('plomberie')) {
    return <Droplets className={className} />;
  }
  if (id.includes('bluetti') || cat.includes('solaire') || cat.includes('énergie')) {
    return <Sun className={className} />;
  }
  if (id.includes('waffle') || cat.includes('téléphon') || cat.includes('famille')) {
    return <Phone className={className} />;
  }
  if (id.includes('scent') || cat.includes('temps') || cat.includes('design')) {
    return <Clock className={className} />;
  }
  if (id.includes('quadro') || cat.includes('impression 3d') || cat.includes('maker')) {
    return <Box className={className} />;
  }
  if (id.includes('benjamin') || cat.includes('musique')) {
    return <Music className={className} />;
  }
  if (id.includes('reso') || cat.includes('moto') || cat.includes('intercom')) {
    return <Headphones className={className} />;
  }
  if (id.includes('autonomous') || cat.includes('hygiène') || cat.includes('nfc')) {
    return <KeyRound className={className} />;
  }
  if (id.includes('turbino') || cat.includes('nautisme') || cat.includes('océan')) {
    return <Waves className={className} />;
  }
  if (discovery?.addedAutomatically) {
    return <Sparkles className={className} />;
  }
  return <Compass className={className} />;
}
