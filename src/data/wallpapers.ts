// Cinematic wallpaper presets for MedVerse.
// Each preset is rendered as a layered CSS background applied to <body>.
// We deliberately keep everything as pure CSS (gradients + SVG data-URIs) so the
// app stays offline-friendly and bundles no external imagery. Each entry has a
// "category" so the gallery can group medical references and Monster (Naoki
// Urasawa) inspired moods.

export type WallpaperCategory = 'default' | 'medical' | 'monster';

export interface Wallpaper {
  id: string;
  name: string;
  /** Short evocative subtitle. */
  caption: string;
  category: WallpaperCategory;
  /** CSS background-image value applied to body. */
  bg: string;
  /** Optional override for body background-color (else uses theme default). */
  color?: string;
  /** Small swatch for the picker preview (CSS background shorthand). */
  swatch: string;
}

// ────────────────────────────────────────────────────────────────────────────
// helpers
// ────────────────────────────────────────────────────────────────────────────
const svgUri = (svg: string) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

// A faint hex-grid lattice (great as a top-layer for "lab" / "MRI" feels)
const HEX_GRID = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'>
    <path d='M15 1 L45 1 L60 26 L45 51 L15 51 L0 26 Z' fill='none' stroke='rgba(217,199,167,0.06)' stroke-width='0.6'/>
  </svg>`,
);

// ECG-like horizon line (used in a Monster preset to evoke the hospital monitor)
const ECG_LINE = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='80' viewBox='0 0 600 80'>
    <path d='M0 40 L120 40 L140 40 L150 18 L160 60 L170 30 L185 40 L300 40 L320 40 L330 22 L345 56 L355 40 L600 40'
      fill='none' stroke='rgba(220,80,80,0.18)' stroke-width='1.2' stroke-linejoin='round' stroke-linecap='round'/>
  </svg>`,
);

// Crosshatched paper texture for the Monster "manga page" mood
const HATCH = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'>
    <path d='M-1 5 L5 -1 M0 8 L8 0 M3 9 L9 3' stroke='rgba(20,18,16,0.18)' stroke-width='0.4'/>
  </svg>`,
);

// ────────────────────────────────────────────────────────────────────────────
// presets
// ────────────────────────────────────────────────────────────────────────────
export const WALLPAPERS: Wallpaper[] = [
  // ── default ────────────────────────────────────────────────────────────
  {
    id: 'default',
    name: 'Ambient',
    caption: 'The original MedVerse stage.',
    category: 'default',
    bg: [
      'radial-gradient(1200px 800px at 20% -10%, rgba(184,153,104,0.08), transparent 60%)',
      'radial-gradient(900px 700px at 110% 20%, rgba(111,179,184,0.05), transparent 60%)',
      'linear-gradient(180deg, #0B0907 0%, #0E0C0A 40%, #0A0907 100%)',
    ].join(','),
    swatch:
      'radial-gradient(circle at 30% 30%, #B89968, transparent 60%), linear-gradient(135deg, #0B0907, #1a140e)',
  },

  // ── medical ────────────────────────────────────────────────────────────
  {
    id: 'med-anatomy',
    name: 'Anatomy Theatre',
    caption: 'Lamplight on the dissection table.',
    category: 'medical',
    bg: [
      'radial-gradient(700px 500px at 50% 0%, rgba(255,210,160,0.10), transparent 65%)',
      'radial-gradient(900px 700px at 80% 100%, rgba(120,40,30,0.18), transparent 60%)',
      'linear-gradient(180deg, #100a08 0%, #1a1310 50%, #0b0807 100%)',
    ].join(','),
    swatch:
      'radial-gradient(circle at 50% 20%, #ffd2a0, transparent 60%), linear-gradient(180deg, #1a1310, #0b0807)',
  },
  {
    id: 'med-mri',
    name: 'MRI Suite',
    caption: 'Cold blue under the magnet.',
    category: 'medical',
    bg: [
      `${HEX_GRID}`,
      'radial-gradient(800px 600px at 20% 30%, rgba(111,179,184,0.18), transparent 60%)',
      'radial-gradient(900px 700px at 90% 80%, rgba(60,90,130,0.16), transparent 60%)',
      'linear-gradient(180deg, #07090c 0%, #0a1015 60%, #060809 100%)',
    ].join(','),
    swatch:
      'radial-gradient(circle at 30% 40%, #6FB3B8, transparent 60%), linear-gradient(135deg, #07090c, #0a1015)',
  },
  {
    id: 'med-ecg',
    name: 'Sinus Rhythm',
    caption: 'A monitor in a quiet ward.',
    category: 'medical',
    bg: [
      `${ECG_LINE}`,
      'radial-gradient(800px 500px at 50% 100%, rgba(200,40,40,0.12), transparent 60%)',
      'linear-gradient(180deg, #0a0807 0%, #120c0a 100%)',
    ].join(','),
    color: '#0a0807',
    swatch:
      'linear-gradient(180deg, #120c0a 0%, #0a0807 100%), radial-gradient(circle at 50% 60%, #c83838, transparent 60%)',
  },
  {
    id: 'med-apothecary',
    name: 'Apothecary',
    caption: 'Amber glass, dried herbs.',
    category: 'medical',
    bg: [
      'radial-gradient(700px 500px at 15% 20%, rgba(184,153,104,0.20), transparent 60%)',
      'radial-gradient(900px 700px at 95% 90%, rgba(140,107,58,0.20), transparent 60%)',
      'linear-gradient(180deg, #1a120a 0%, #120c08 60%, #0a0705 100%)',
    ].join(','),
    swatch:
      'linear-gradient(135deg, #B89968, #8C6B3A 60%, #1a120a)',
  },
  {
    id: 'med-radiology',
    name: 'Radiology',
    caption: 'X-rays clipped to a light box.',
    category: 'medical',
    bg: [
      `${HEX_GRID}`,
      'radial-gradient(500px 380px at 50% 20%, rgba(220,235,255,0.10), transparent 60%)',
      'linear-gradient(180deg, #06080a 0%, #0a0c10 100%)',
    ].join(','),
    swatch:
      'radial-gradient(circle at 50% 30%, #dcebff, transparent 55%), linear-gradient(180deg, #06080a, #0a0c10)',
  },
  {
    id: 'med-or',
    name: 'Operating Theatre',
    caption: 'The light above the table.',
    category: 'medical',
    bg: [
      'radial-gradient(420px 320px at 50% 18%, rgba(255,245,220,0.22), transparent 55%)',
      'radial-gradient(900px 700px at 50% 110%, rgba(70,120,110,0.18), transparent 60%)',
      'linear-gradient(180deg, #060808 0%, #0a0d0c 60%, #060707 100%)',
    ].join(','),
    swatch:
      'radial-gradient(circle at 50% 25%, #fff5dc, transparent 55%), linear-gradient(180deg, #060808, #0a0d0c)',
  },

  // ── Monster (Naoki Urasawa) ───────────────────────────────────────────
  {
    id: 'monster-page',
    name: 'Manga Page',
    caption: 'Ink and silence.',
    category: 'monster',
    bg: [
      `${HATCH}`,
      'radial-gradient(800px 600px at 50% 50%, rgba(20,18,16,0.0), rgba(20,18,16,0.4) 70%)',
      'linear-gradient(180deg, #d8cfbf 0%, #c7bca8 100%)',
    ].join(','),
    color: '#c7bca8',
    swatch:
      'linear-gradient(135deg, #d8cfbf, #8a8170 60%, #2a2520)',
  },
  {
    id: 'monster-rose',
    name: 'Die Rose',
    caption: '"The nameless monster."',
    category: 'monster',
    bg: [
      'radial-gradient(700px 500px at 30% 25%, rgba(200,60,60,0.18), transparent 60%)',
      'radial-gradient(900px 700px at 80% 90%, rgba(30,10,10,0.5), transparent 60%)',
      'linear-gradient(180deg, #0a0606 0%, #160a0a 50%, #070303 100%)',
    ].join(','),
    swatch:
      'radial-gradient(circle at 30% 30%, #c83c3c, transparent 60%), linear-gradient(135deg, #160a0a, #0a0606)',
  },
  {
    id: 'monster-prague',
    name: 'Prague at Dusk',
    caption: 'Old stone, colder rain.',
    category: 'monster',
    bg: [
      'radial-gradient(800px 600px at 20% 80%, rgba(90,110,140,0.18), transparent 60%)',
      'radial-gradient(700px 500px at 80% 10%, rgba(180,150,110,0.10), transparent 60%)',
      'linear-gradient(180deg, #0a0c10 0%, #131418 50%, #08090c 100%)',
    ].join(','),
    swatch:
      'linear-gradient(135deg, #1a1d22, #3a3f48 60%, #0a0c10)',
  },
  {
    id: 'monster-511k',
    name: '511 Kinderheim',
    caption: 'Corridors that remember.',
    category: 'monster',
    bg: [
      `${HEX_GRID}`,
      'radial-gradient(700px 500px at 50% 0%, rgba(180,180,180,0.06), transparent 60%)',
      'linear-gradient(180deg, #0c0c0d 0%, #131314 60%, #08080a 100%)',
    ].join(','),
    swatch:
      'linear-gradient(180deg, #1a1a1c, #08080a), radial-gradient(circle at 50% 30%, #888, transparent 60%)',
  },
  {
    id: 'monster-tenma',
    name: 'Dr. Tenma',
    caption: 'A vow taken at a bedside.',
    category: 'monster',
    bg: [
      'radial-gradient(500px 380px at 50% 15%, rgba(255,240,210,0.12), transparent 60%)',
      'radial-gradient(800px 600px at 90% 100%, rgba(80,40,30,0.20), transparent 60%)',
      'linear-gradient(180deg, #0a0807 0%, #15100c 50%, #080606 100%)',
    ].join(','),
    swatch:
      'radial-gradient(circle at 50% 25%, #fff0d2, transparent 55%), linear-gradient(180deg, #15100c, #080606)',
  },
  {
    id: 'monster-johan',
    name: 'Johan',
    caption: 'The quiet at the end of the hall.',
    category: 'monster',
    bg: [
      'radial-gradient(600px 500px at 50% 50%, rgba(255,255,255,0.04), transparent 60%)',
      'radial-gradient(900px 700px at 50% 110%, rgba(0,0,0,0.6), transparent 60%)',
      'linear-gradient(180deg, #050505 0%, #0a0a0a 50%, #020202 100%)',
    ].join(','),
    color: '#050505',
    swatch:
      'radial-gradient(circle at 50% 50%, #ffffff10, transparent 60%), linear-gradient(180deg, #0a0a0a, #020202)',
  },
  {
    id: 'monster-runaway',
    name: 'Runaway Train',
    caption: 'A long blue night across Europe.',
    category: 'monster',
    bg: [
      'radial-gradient(700px 500px at 10% 20%, rgba(70,120,180,0.22), transparent 60%)',
      'radial-gradient(800px 600px at 95% 90%, rgba(20,20,40,0.50), transparent 60%)',
      'linear-gradient(180deg, #050a14 0%, #0a1226 50%, #04060c 100%)',
    ].join(','),
    swatch:
      'linear-gradient(135deg, #1a3060, #050a14 60%, #04060c)',
  },
];

export const WALLPAPER_MAP: Record<string, Wallpaper> = Object.fromEntries(
  WALLPAPERS.map((w) => [w.id, w]),
);

export const getWallpaper = (id?: string): Wallpaper =>
  (id && WALLPAPER_MAP[id]) || WALLPAPER_MAP['default'];
