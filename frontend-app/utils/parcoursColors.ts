/**
 * Centralized color palette for the 3 parcours levels.
 * Use getParcoursColorBySlug() or getParcoursColorByIndex() everywhere.
 */

export interface ParcoursColorScheme {
  /** Main brand color – used for headers, strong buttons */
  primary: string;
  /** Darker shade – hover/active states */
  primaryDark: string;
  /** Light tint – row backgrounds, card fill */
  soft: string;
  /** Text color on the soft background */
  softText: string;
  /** Very light check-cell fill */
  checkBg: string;
  /** Border accent */
  border: string;
  /** CSS gradient for big block headers */
  gradient: string;
  /** Tailwind-safe ring color string (for focus rings) */
  ring: string;
}

/* ─── Palette ─────────────────────────────────────────────── */

const PALETTE: ParcoursColorScheme[] = [
  // 0 · Découvrir – Teal #2d969a
  {
    primary:     '#2d969a',
    primaryDark: '#207478',
    soft:        '#e0f5f6',
    softText:    '#1a6b6e',
    checkBg:     '#b2e6e8',
    border:      '#9edde0',
    gradient:    'linear-gradient(135deg, #2d969a 0%, #1d7275 100%)',
    ring:        '#2d969a',
  },
  // 1 · Approfondir – Purple #64508d
  {
    primary:     '#64508d',
    primaryDark: '#4e3d73',
    soft:        '#ede9f7',
    softText:    '#4e3d73',
    checkBg:     '#d5cff0',
    border:      '#c0b8e8',
    gradient:    'linear-gradient(135deg, #64508d 0%, #4e3d73 100%)',
    ring:        '#64508d',
  },
  // 2 · Transmettre – Orange #ff7d2d
  {
    primary:     '#ff7d2d',
    primaryDark: '#e06020',
    soft:        '#fff0e6',
    softText:    '#b84500',
    checkBg:     '#ffd5b0',
    border:      '#ffba80',
    gradient:    'linear-gradient(135deg, #ff7d2d 0%, #e06020 100%)',
    ring:        '#ff7d2d',
  },
];

const FALLBACK: ParcoursColorScheme = {
  primary:     '#64748b',
  primaryDark: '#475569',
  soft:        '#f1f5f9',
  softText:    '#334155',
  checkBg:     '#e2e8f0',
  border:      '#cbd5e1',
  gradient:    'linear-gradient(135deg, #64748b 0%, #475569 100%)',
  ring:        '#64748b',
};

/* ─── Helpers ──────────────────────────────────────────────── */

/** Color by 0-based position in parcoursList array */
export function getParcoursColorByIndex(index: number): ParcoursColorScheme {
  return PALETTE[index] ?? FALLBACK;
}

/** Color by parcours slug (decouvrir / approfondir / transmettre) */
export function getParcoursColorBySlug(slug: string = ''): ParcoursColorScheme {
  const s = slug.toLowerCase();
  if (s.includes('decouvrir') || s.includes('découvrir')) return PALETTE[0];
  if (s.includes('approfondir'))                           return PALETTE[1];
  if (s.includes('transmettre'))                          return PALETTE[2];
  return FALLBACK;
}

/** Hex → rgba helper for inline styles */
export function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
