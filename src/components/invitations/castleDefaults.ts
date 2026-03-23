// ── castleDefaults.ts ─────────────────────────────────────────────────────────
// Sursă unică de adevăr pentru toate templateurile tip Castle.
// Importă din acest fișier în: CastleMagicTemplate, BoyCastelMagicTemplates,
// GirlCastelMagicTemplates, SettingsView și orice alt fișier care are nevoie.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CastleColorTheme {
  id: string;
  name: string;
  emoji: string;
  PINK_DARK: string;
  PINK_D: string;
  PINK_L: string;
  PINK_XL: string;
  CREAM: string;
  TEXT: string;
  MUTED: string;
  GOLD: string;
}

// ── Teme de culori ────────────────────────────────────────────────────────────
export const CASTLE_THEMES: CastleColorTheme[] = [
  { id: 'default',      emoji: '🌸', name: 'Pink Powder',    PINK_DARK: '#be185d', PINK_D: '#9d174d', PINK_L: '#fbcfe8', PINK_XL: '#fdf2f8', CREAM: '#fff5f7', TEXT: '#4a1d1f', MUTED: '#9d7074', GOLD: '#d4af37' },
  { id: 'rose',         emoji: '🌷', name: 'Rose Blush',     PINK_DARK: '#881337', PINK_D: '#be123c', PINK_L: '#fecdd3', PINK_XL: '#fff1f2', CREAM: '#fff5f5', TEXT: '#3b0d13', MUTED: '#a1626a', GOLD: '#c9a227' },
  { id: 'raspberry',    emoji: '🌺', name: 'Raspberry Pink', PINK_DARK: '#9d174d', PINK_D: '#db2777', PINK_L: '#f9a8d4', PINK_XL: '#fdf2f8', CREAM: '#fff5f7', TEXT: '#4a1d1f', MUTED: '#9d7074', GOLD: '#d4af37' },
  { id: 'ballet',       emoji: '🩰', name: 'Ballet Pink',    PINK_DARK: '#a21caf', PINK_D: '#e879f9', PINK_L: '#f5d0fe', PINK_XL: '#fdf4ff', CREAM: '#fff7fb', TEXT: '#3b1d2e', MUTED: '#a78b95', GOLD: '#e0b84f' },
  { id: 'vintage',      emoji: '🌹', name: 'Vintage Rose',   PINK_DARK: '#7f1d1d', PINK_D: '#b91c1c', PINK_L: '#fca5a5', PINK_XL: '#fef2f2', CREAM: '#fff7f7', TEXT: '#3f1517', MUTED: '#9b6b6e', GOLD: '#c9a227' },
  { id: 'powder_blush', emoji: '🩷', name: 'Powder Blush',   PINK_DARK: '#FFB2CF', PINK_D: '#f9a8d4', PINK_L: '#FFB2CF', PINK_XL: '#fdf4ff', CREAM: '#fff7fb', TEXT: '#4a1d1f', MUTED: '#b48a92', GOLD: '#e0b84f' },
  { id: 'dusty_pink',   emoji: '🌺', name: 'Dusty Pink',     PINK_DARK: '#fbcfe8', PINK_D: '#e75480', PINK_L: '#f8bbd0', PINK_XL: '#fff',    CREAM: '#fff6f8', TEXT: '#4a1d1f', MUTED: '#a06a74', GOLD: '#d4af37' },
  { id: 'powder_blue',  emoji: '💧', name: 'Powder Blue',    PINK_DARK: '#a3c4f3', PINK_D: '#6495ed', PINK_L: '#b0d4f1', PINK_XL: '#e6f2fb', CREAM: '#f4f7fa', TEXT: '#1f2e3d', MUTED: '#7d8b99', GOLD: '#d4af37' },
  { id: 'sage_green',   emoji: '🌿', name: 'Sage Green',     PINK_DARK: '#4a7c59', PINK_D: '#6b9e7a', PINK_L: '#b2d8b2', PINK_XL: '#f0f7f0', CREAM: '#f5faf5', TEXT: '#1a2e1f', MUTED: '#6b8c72', GOLD: '#c9a227' },
  { id: 'lavender',     emoji: '💜', name: 'Lavender',       PINK_DARK: '#7c3aed', PINK_D: '#8b5cf6', PINK_L: '#ddd6fe', PINK_XL: '#f5f3ff', CREAM: '#faf5ff', TEXT: '#2e1a47', MUTED: '#8b7aa0', GOLD: '#e0b84f' },
  { id: 'peach',        emoji: '🍑', name: 'Peach',          PINK_DARK: '#c2410c', PINK_D: '#ea580c', PINK_L: '#fed7aa', PINK_XL: '#fff7ed', CREAM: '#fffbf5', TEXT: '#431407', MUTED: '#9a6a50', GOLD: '#d4af37' },
  { id: 'champagne',    emoji: '🥂', name: 'Champagne',      PINK_DARK: '#92400e', PINK_D: '#b45309', PINK_L: '#fde68a', PINK_XL: '#fffbeb', CREAM: '#fefce8', TEXT: '#1c1007', MUTED: '#92856a', GOLD: '#d4af37' },
];

// ── Teme FETE — roz, lavandă, lila, piersică ────────────────────────────────
export const GIRL_THEMES: CastleColorTheme[] = [
  { id: 'default',       emoji: '🌸', name: 'Pink Powder',    PINK_DARK: '#fbcfe8', PINK_D: '#9d174d', PINK_L: '#fbcfe8', PINK_XL: '#fdf2f8', CREAM: '#fff5f7', TEXT: '#4a1d1f', MUTED: '#9d7074', GOLD: '#d4af37' },
  { id: 'rose',          emoji: '🌷', name: 'Rose Blush',     PINK_DARK: '#881337', PINK_D: '#be123c', PINK_L: '#fecdd3', PINK_XL: '#fff1f2', CREAM: '#fff5f5', TEXT: '#3b0d13', MUTED: '#a1626a', GOLD: '#c9a227' },
  { id: 'raspberry',     emoji: '🌺', name: 'Raspberry',      PINK_DARK: '#9d174d', PINK_D: '#db2777', PINK_L: '#f9a8d4', PINK_XL: '#fdf2f8', CREAM: '#fff5f7', TEXT: '#4a1d1f', MUTED: '#9d7074', GOLD: '#d4af37' },
  { id: 'ballet',        emoji: '🩰', name: 'Ballet Pink',    PINK_DARK: '#a21caf', PINK_D: '#e879f9', PINK_L: '#f5d0fe', PINK_XL: '#fdf4ff', CREAM: '#fff7fb', TEXT: '#3b1d2e', MUTED: '#a78b95', GOLD: '#e0b84f' },
  { id: 'powder_blush',  emoji: '🩷', name: 'Powder Blush',   PINK_DARK: '#d63384', PINK_D: '#e91e8c', PINK_L: '#FFB2CF', PINK_XL: '#fff0f7', CREAM: '#fff7fb', TEXT: '#4a1d1f', MUTED: '#b48a92', GOLD: '#e0b84f' },
  { id: 'lavender',      emoji: '💜', name: 'Lavender',       PINK_DARK: '#7c3aed', PINK_D: '#8b5cf6', PINK_L: '#ddd6fe', PINK_XL: '#f5f3ff', CREAM: '#faf5ff', TEXT: '#2e1a47', MUTED: '#8b7aa0', GOLD: '#e0b84f' },
  { id: 'peach',         emoji: '🍑', name: 'Peach',          PINK_DARK: '#c2410c', PINK_D: '#ea580c', PINK_L: '#fed7aa', PINK_XL: '#fff7ed', CREAM: '#fffbf5', TEXT: '#431407', MUTED: '#9a6a50', GOLD: '#d4af37' },
  { id: 'lilac',         emoji: '🪷', name: 'Lilac Dream',    PINK_DARK: '#9333ea', PINK_D: '#a855f7', PINK_L: '#e9d5ff', PINK_XL: '#faf5ff', CREAM: '#fdf4ff', TEXT: '#3b0764', MUTED: '#9d7ebc', GOLD: '#e0b84f' },
  { id: 'coral',         emoji: '🪸', name: 'Coral',          PINK_DARK: '#e11d48', PINK_D: '#f43f5e', PINK_L: '#fda4af', PINK_XL: '#fff1f2', CREAM: '#fff5f6', TEXT: '#4c0519', MUTED: '#9f6472', GOLD: '#d4af37' },
  { id: 'bubblegum',     emoji: '🍬', name: 'Bubblegum',      PINK_DARK: '#ec4899', PINK_D: '#f472b6', PINK_L: '#fbcfe8', PINK_XL: '#fdf2f8', CREAM: '#fff5f9', TEXT: '#4a1d1f', MUTED: '#a0607a', GOLD: '#f0c040' },
  { id: 'mauve',         emoji: '🌑', name: 'Mauve',          PINK_DARK: '#6d3b6e', PINK_D: '#9d4e9e', PINK_L: '#e8b4e8', PINK_XL: '#fdf0fd', CREAM: '#fdf5fd', TEXT: '#2e132e', MUTED: '#9a7a9a', GOLD: '#d4af37' },
  { id: 'champagne',     emoji: '🥂', name: 'Champagne Gold', PINK_DARK: '#92400e', PINK_D: '#b45309', PINK_L: '#fde68a', PINK_XL: '#fffbeb', CREAM: '#fefce8', TEXT: '#1c1007', MUTED: '#92856a', GOLD: '#d4af37' },
];

// ── Teme BĂIEȚI — albastru, verde, navy, teal ────────────────────────────────
export const BOY_THEMES: CastleColorTheme[] = [
  { id: 'powder_blue',   emoji: '💙', name: 'Powder Blue',    PINK_DARK: '#2563eb', PINK_D: '#1d4ed8', PINK_L: '#bfdbfe', PINK_XL: '#eff6ff', CREAM: '#f0f7ff', TEXT: '#1e3a5f', MUTED: '#607a99', GOLD: '#f59e0b' },
  { id: 'sky_blue',      emoji: '☁️',  name: 'Sky Blue',       PINK_DARK: '#0284c7', PINK_D: '#0369a1', PINK_L: '#bae6fd', PINK_XL: '#f0f9ff', CREAM: '#f4fbff', TEXT: '#0c2d48', MUTED: '#5a8aa8', GOLD: '#f59e0b' },
  { id: 'navy',          emoji: '⚓',  name: 'Navy',           PINK_DARK: '#1e3a5f', PINK_D: '#1e40af', PINK_L: '#93c5fd', PINK_XL: '#eff6ff', CREAM: '#f0f4fb', TEXT: '#0f172a', MUTED: '#5a7a9a', GOLD: '#f59e0b' },
  { id: 'teal',          emoji: '🌊', name: 'Teal',           PINK_DARK: '#0f766e', PINK_D: '#0d9488', PINK_L: '#99f6e4', PINK_XL: '#f0fdfa', CREAM: '#f5fffd', TEXT: '#0d2b28', MUTED: '#5a8a84', GOLD: '#f59e0b' },
  { id: 'sage_green',    emoji: '🌿', name: 'Sage Green',     PINK_DARK: '#15803d', PINK_D: '#16a34a', PINK_L: '#bbf7d0', PINK_XL: '#f0fdf4', CREAM: '#f3fef6', TEXT: '#0f2a1a', MUTED: '#5a8a6a', GOLD: '#a3e635' },
  { id: 'forest',        emoji: '🌲', name: 'Forest',         PINK_DARK: '#166534', PINK_D: '#15803d', PINK_L: '#86efac', PINK_XL: '#f0fdf4', CREAM: '#f2fdf5', TEXT: '#052e16', MUTED: '#4a7a5a', GOLD: '#84cc16' },
  { id: 'ocean',         emoji: '🌏', name: 'Ocean',          PINK_DARK: '#0e7490', PINK_D: '#0891b2', PINK_L: '#a5f3fc', PINK_XL: '#ecfeff', CREAM: '#f0feff', TEXT: '#083344', MUTED: '#4a8a98', GOLD: '#f59e0b' },
  { id: 'midnight',      emoji: '🌙', name: 'Midnight',       PINK_DARK: '#312e81', PINK_D: '#3730a3', PINK_L: '#c7d2fe', PINK_XL: '#eef2ff', CREAM: '#f0f3ff', TEXT: '#1e1b4b', MUTED: '#6b7280', GOLD: '#fbbf24' },
  { id: 'steel',         emoji: '🔵', name: 'Steel Blue',     PINK_DARK: '#334155', PINK_D: '#475569', PINK_L: '#cbd5e1', PINK_XL: '#f1f5f9', CREAM: '#f4f7fa', TEXT: '#0f172a', MUTED: '#64748b', GOLD: '#f59e0b' },
  { id: 'mint',          emoji: '🍃', name: 'Mint Fresh',     PINK_DARK: '#059669', PINK_D: '#10b981', PINK_L: '#a7f3d0', PINK_XL: '#ecfdf5', CREAM: '#f0fdf7', TEXT: '#022c22', MUTED: '#4a9a78', GOLD: '#84cc16' },
  { id: 'royal_blue',    emoji: '👑', name: 'Royal Blue',     PINK_DARK: '#1d4ed8', PINK_D: '#2563eb', PINK_L: '#93c5fd', PINK_XL: '#eff6ff', CREAM: '#f0f5ff', TEXT: '#1e3a8a', MUTED: '#5a7abb', GOLD: '#fbbf24' },
  { id: 'turquoise',     emoji: '💎', name: 'Turquoise',      PINK_DARK: '#0d9488', PINK_D: '#14b8a6', PINK_L: '#99f6e4', PINK_XL: '#f0fdfa', CREAM: '#f2fefc', TEXT: '#042f2e', MUTED: '#4a8a84', GOLD: '#f59e0b' },
];

export const ROMANTIC_THEMES: CastleColorTheme[] = [
  { 
    id: 'romantic_castle',
    emoji: '👑',
    name: 'Romantic Castle',
    PINK_DARK: '#7f1d1d',
    PINK_D:    '#be123c',
    PINK_L:    '#fda4af',
    PINK_XL:   '#fff1f2',
    CREAM:     '#fff7f5',
    TEXT:      '#3b0a0f',
    MUTED:     '#a1626a',
    GOLD:      '#d4af37',
  },
];

export const LORD_MONO_THEMES: CastleColorTheme[] = [
  {
    id: 'default',
    emoji: 'BW',
    name: 'Monochrome',
    PINK_DARK: '#161616',
    PINK_D: '#2c2c2c',
    PINK_L: '#d9d1c5',
    PINK_XL: '#faf7f2',
    CREAM: '#f3eee6',
    TEXT: '#171717',
    MUTED: '#6c645b',
    GOLD: '#ece4d8',
  },
  {
  id: 'RS',
  emoji: 'RS',
  name: 'Romantic Sunset',
  PINK_DARK: '#8c5a5a',
  PINK_D: '#d9a5a5',
  PINK_L: '#f2c6a0',
  PINK_XL: '#fffaf5',
  CREAM: '#f7e7ce',
  TEXT: '#3a2e2e',
  MUTED: '#8a7f7a',
  GOLD: '#e8d8c3',
},{
  id: 'LG',
  emoji: 'LG',
  name: 'Luxury Gold',
  PINK_DARK: '#0f0f0f',
  PINK_D: '#1f1f1f',
  PINK_L: '#ffffff',
  PINK_XL: '#f7f7f7',
  CREAM: '#f2efe9',
  TEXT: '#111111',
  MUTED: '#6e6e6e',
  GOLD: '#d4af37',
},{
  id: 'BN',
  emoji: 'BN',
  name: 'Boho Natural',
  PINK_DARK: '#5e4b3c',
  PINK_D: '#a78c6d',
  PINK_L: '#d7c2a3',
  PINK_XL: '#f8f3ec',
  CREAM: '#efe6d8',
  TEXT: '#3b2f2f',
  MUTED: '#8c7a6b',
  GOLD: '#c9a97a',
},
{
  id: 'SP',
  emoji: 'SP',
  name: 'Soft Pastel',
  PINK_DARK: '#a68c9b',
  PINK_D: '#d6b8c4',
  PINK_L: '#f0dbe4',
  PINK_XL: '#fdf7fa',
  CREAM: '#f6efe9',
  TEXT: '#4a3f45',
  MUTED: '#9c8f95',
  GOLD: '#e6d8c9',
}
];
export const getCastleTheme = (id?: string): CastleColorTheme =>
  [...CASTLE_THEMES, ...GIRL_THEMES, ...ROMANTIC_THEMES, ...BOY_THEMES, ...LORD_MONO_THEMES]
    .find(t => t.id === id) ?? CASTLE_THEMES[0];

export const getGirlTheme  = (id?: string): CastleColorTheme =>
  GIRL_THEMES.find(t => t.id === id) ?? GIRL_THEMES[0];

export const getBoyTheme   = (id?: string): CastleColorTheme =>
  BOY_THEMES.find(t => t.id === id) ?? BOY_THEMES[0];

export const getRomanticTheme = (id?: string): CastleColorTheme =>
  ROMANTIC_THEMES.find(t => t.id === id) ?? ROMANTIC_THEMES[0];

export const getLordTheme = (id?: string): CastleColorTheme =>
  LORD_MONO_THEMES.find(t => t.id === id) ?? LORD_MONO_THEMES[0];


// ── Valori implicite profil ───────────────────────────────────────────────────
export const CASTLE_DEFAULTS = {
  partner1Name:           'Prințesa Maria',
  heroBgImage:            undefined as string | undefined,
  heroBgImageMobile:      undefined as string | undefined,
  heroContentImage:       undefined as string | undefined,
  heroContentImageMobile: undefined as string | undefined,
  castleIntroSubtitle:    'into my little kingdom',
  castleIntroWelcome:     'WELCOME',
  castleInviteTop:        'Cu multă bucurie vă anunțăm',
  castleInviteMiddle:     '',
  castleInviteBottom:     'va fii botezată',
  castleInviteTag:        '✦ deschide porțile ✦',
  welcomeText:            'Vă invităm cu drag',
  celebrationText:        'la botezul prințesei noastre',
  weddingDate:            '',
  showRsvpButton:         false,
  rsvpButtonText:         'Confirmă Prezența',
  showWelcomeText:        true,
  showCelebrationText:    true,
  showTimeline:           false,
  showCountdown:          false,
  colorTheme:             'default',
};

// ── Blocuri implicite ─────────────────────────────────────────────────────────
export const CASTLE_DEFAULT_BLOCKS = [
  // ── Muzică ──────────────────────────────────────────────────────────────────
  {
    id: 'def-music',
    type: 'music' as const,
    show: true,
    musicTitle: 'Melodia Zilei',
    musicArtist: 'Artist',
    musicUrl: '',
    musicType: 'none' as const,
  },

  // ── Foto principală — portret arc, fade jos ──────────────────────────────────
  {
    id: 'def-photo-1',
    type: 'photo' as const,
    show: true,
    imageData: 'https://clubulbebelusilor.ro/wp-content/uploads/2021/02/bebelusi-sfaturi-pentru-mamici.jpg',
    altText: 'Fotografia principală',
    aspectRatio: '3:4' as const,
    photoClip: 'arch' as const,
    photoMasks: ['fade-b'] as any,
  },

  // ── Text poetic ──────────────────────────────────────────────────────────────
  {
    id: 'def-text-1',
    type: 'text' as const,
    show: true,
    content: 'O poveste magică începe odată cu venirea pe lume a celui mai iubit copil. Vă așteptăm cu drag să fiți parte din această zi de poveste.',
  },

  // ── Countdown ────────────────────────────────────────────────────────────────
  {
    id: 'def-countdown',
    type: 'countdown' as const,
    show: true,
    countdownTitle: 'Timp rămas până la Marele Eveniment',
  },

  // ── Calendar ─────────────────────────────────────────────────────────────────
  {
    id: 'def-calendar',
    type: 'calendar' as const,
    show: true,
  },

  // ── Foto 2 — peisaj ──────────────────────────────────────────────────────────
  {
    id: 'def-photo-2',
    type: 'photo' as const,
    show: true,
    imageData: 'https://clubulbebelusilor.ro/wp-content/uploads/2021/02/bebelusi-sfaturi-pentru-mamici.jpg',
    altText: 'Decorațiuni',
    aspectRatio: '16:9' as const,
    photoClip: 'rounded' as const,
    photoMasks: [] as any,
  },

  // ── Locație Biserică ─────────────────────────────────────────────────────────
  {
    id: 'def-loc-church',
    type: 'location' as const,
    show: true,
    label: 'Slujba de Botez',
    time: '11:00',
    locationName: 'Biserica Sfânta Maria',
    locationAddress: 'Str. Bisericii nr. 5, București',
    wazeLink: '',
  },

  // ── Locație Petrecere ────────────────────────────────────────────────────────
  {
    id: 'def-loc-party',
    type: 'location' as const,
    show: true,
    label: 'Petrecere',
    time: '14:00',
    locationName: 'Salon Castelul Magic',
    locationAddress: 'Str. Basmului nr. 1, București',
    wazeLink: '',
  },

  // ── Foto 3 — cerc cu vignetă ─────────────────────────────────────────────────
  {
    id: 'def-photo-3',
    type: 'photo' as const,
    show: true,
    imageData: 'https://clubulbebelusilor.ro/wp-content/uploads/2021/02/bebelusi-sfaturi-pentru-mamici.jpg',
    altText: 'Fotografie',
    aspectRatio: '1:1' as const,
    photoClip: 'circle' as const,
    photoMasks: ['vignette'] as any,
  },

  // ── Cadouri ──────────────────────────────────────────────────────────────────
  {
    id: 'def-gift',
    type: 'gift' as const,
    show: true,
    sectionTitle: 'Sugestie de cadou',
    content: 'Cel mai frumos cadou este prezența voastră alături de noi. Dacă doriți să contribuiți la viitorul prințesei noastre, vă lăsăm datele de mai jos.',
    iban: 'RO00 BANK 0000 0000 0000 0000',
    ibanName: 'Familia Ionescu',
  },

  // ── Foto finală — blob ───────────────────────────────────────────────────────
  {
    id: 'def-photo-4',
    type: 'photo' as const,
    show: true,
    imageData: 'https://clubulbebelusilor.ro/wp-content/uploads/2021/02/bebelusi-sfaturi-pentru-mamici.jpg',
    altText: 'Fotografie finală',
    aspectRatio: '3:4' as const,
    photoClip: 'blob' as const,
    photoMasks: ['fade-b'] as any,
  },

  // ── WhatsApp ─────────────────────────────────────────────────────────────────
  {
    id: 'def-whatsapp',
    type: 'whatsapp' as const,
    show: true,
    label: 'Contactează-ne pe WhatsApp',
    content: '0700000000',
  },

  // ── RSVP ─────────────────────────────────────────────────────────────────────
  // {
  //   id: 'def-rsvp',
  //   type: 'rsvp' as const,
  //   show: true,
  //   label: 'Confirmă Prezența',
  // },
];

// ── Preview data (pentru InvitationMarketplace demo) ─────────────────────────
export const CASTLE_PREVIEW_DATA = {
  guest:   { name: 'Invitat Drag', status: 'pending', type: 'adult' },
  project: { selectedTemplate: 'castle-magic' },
  profile: {
    ...CASTLE_DEFAULTS,
    colorTheme: 'default',
    weddingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customSections: JSON.stringify(CASTLE_DEFAULT_BLOCKS),
  },
};
