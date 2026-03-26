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

// 🌈 Gabby Dollhouse themes — candy, pastel, aqua
export const GABBY_THEMES: CastleColorTheme[] = [
  { id: 'default',      emoji: '🐾', name: 'Candy Pop',       PINK_DARK: '#7b2fbe', PINK_D: '#e91e8c', PINK_L: '#ffb3d9', PINK_XL: '#fff3fa', CREAM: '#fff8f0', TEXT: '#2d1b69', MUTED: '#6e5aa0', GOLD: '#ffe566' },
  { id: 'lavender',     emoji: '💜', name: 'Lavender Mint',   PINK_DARK: '#6d28d9', PINK_D: '#a855f7', PINK_L: '#e9d5ff', PINK_XL: '#f6f2ff', CREAM: '#f4fffb', TEXT: '#2b1d4d', MUTED: '#7a6fa3', GOLD: '#facc15' },
  { id: 'aqua',         emoji: '🫧', name: 'Aqua Dream',      PINK_DARK: '#0f766e', PINK_D: '#14b8a6', PINK_L: '#99f6e4', PINK_XL: '#ecfeff', CREAM: '#f0fdfa', TEXT: '#083344', MUTED: '#4a8a98', GOLD: '#fde68a' },
  { id: 'sunshine',     emoji: '🌞', name: 'Sunshine Peach',  PINK_DARK: '#c2410c', PINK_D: '#fb7185', PINK_L: '#fed7aa', PINK_XL: '#fff7ed', CREAM: '#fffaf2', TEXT: '#4c0519', MUTED: '#9a6a50', GOLD: '#fbbf24' },
  { id: 'bubblegum',    emoji: '🍬', name: 'Bubblegum',      PINK_DARK: '#be185d', PINK_D: '#f472b6', PINK_L: '#fbcfe8', PINK_XL: '#fdf2f8', CREAM: '#fff5f9', TEXT: '#4a1d1f', MUTED: '#a0607a', GOLD: '#f0c040' },
];
// Frozen themes - ice, aurora, snow
export const FROZEN_THEMES: CastleColorTheme[] = [
  { id: 'ice',     emoji: '??', name: 'Ice Blue',     PINK_DARK: '#1F4E7A', PINK_D: '#2C7BB6', PINK_L: '#A8D8EA', PINK_XL: '#E8F4FD', CREAM: '#F7FBFF', TEXT: '#0A2A4A', MUTED: '#5B7A95', GOLD: '#F0C040' },
  { id: 'aurora',  emoji: '??', name: 'Aurora',       PINK_DARK: '#2C3E8F', PINK_D: '#4F6BD6', PINK_L: '#BFD3FF', PINK_XL: '#F2F6FF', CREAM: '#F7F9FF', TEXT: '#16213B', MUTED: '#6B7A9C', GOLD: '#F5D06F' },
  { id: 'snow',    emoji: '??', name: 'Snow White',   PINK_DARK: '#3C5A6B', PINK_D: '#5F7C8C', PINK_L: '#CFE4F1', PINK_XL: '#F6FBFF', CREAM: '#FFFFFF', TEXT: '#1C2B35', MUTED: '#7A8A94', GOLD: '#E3C77A' },
  { id: 'fjord',   emoji: '??', name: 'Fjord',        PINK_DARK: '#21405A', PINK_D: '#3E6B8A', PINK_L: '#B7D4E8', PINK_XL: '#EAF4FB', CREAM: '#F4FAFF', TEXT: '#102333', MUTED: '#6C8291', GOLD: '#D9C27C' },
];

export const UNICORN_THEMES: CastleColorTheme[] = [
  { id: 'default', emoji: '🦄', name: 'Magic Meadow', PINK_DARK: '#7c3aed', PINK_D: '#db2777', PINK_L: '#f9a8d4', PINK_XL: '#fdf2ff', CREAM: '#fff7fb', TEXT: '#2e1065', MUTED: '#8b6fa3', GOLD: '#facc15' },
  { id: 'sunset',  emoji: '🌈', name: 'Sunset Rainbow', PINK_DARK: '#be185d', PINK_D: '#f97316', PINK_L: '#fdba74', PINK_XL: '#fff7ed', CREAM: '#fffaf5', TEXT: '#4a1d1f', MUTED: '#a57a6a', GOLD: '#fde047' },
  { id: 'mint',    emoji: '🌿', name: 'Mint Stardust', PINK_DARK: '#0f766e', PINK_D: '#14b8a6', PINK_L: '#99f6e4', PINK_XL: '#ecfeff', CREAM: '#f0fdfa', TEXT: '#083344', MUTED: '#4a8a98', GOLD: '#fde68a' },
  { id: 'twilight',emoji: '🌙', name: 'Twilight Sky', PINK_DARK: '#312e81', PINK_D: '#6366f1', PINK_L: '#c7d2fe', PINK_XL: '#eef2ff', CREAM: '#f5f7ff', TEXT: '#1e1b4b', MUTED: '#6b7280', GOLD: '#facc15' },

  // 🔥 NEW ONES

  { id: 'rose', emoji: '🌹', name: 'Velvet Rose', PINK_DARK: '#881337', PINK_D: '#e11d48', PINK_L: '#fda4af', PINK_XL: '#fff1f2', CREAM: '#fff5f7', TEXT: '#4c0519', MUTED: '#9f6b7a', GOLD: '#fde68a' },

  { id: 'galaxy', emoji: '🌌', name: 'Galaxy Dream', PINK_DARK: '#1e1b4b', PINK_D: '#8b5cf6', PINK_L: '#c4b5fd', PINK_XL: '#f5f3ff', CREAM: '#fafaff', TEXT: '#0f172a', MUTED: '#7c7c9a', GOLD: '#eab308' },

  { id: 'peach', emoji: '🍑', name: 'Peach Glow', PINK_DARK: '#9a3412', PINK_D: '#fb923c', PINK_L: '#fed7aa', PINK_XL: '#fff7ed', CREAM: '#fffaf6', TEXT: '#431407', MUTED: '#b08968', GOLD: '#fde047' },

  { id: 'ice', emoji: '❄️', name: 'Frozen Crystal', PINK_DARK: '#0c4a6e', PINK_D: '#38bdf8', PINK_L: '#bae6fd', PINK_XL: '#f0f9ff', CREAM: '#f8fcff', TEXT: '#082f49', MUTED: '#7aa6c2', GOLD: '#facc15' },

  { id: 'lavender', emoji: '💜', name: 'Lavender Dream', PINK_DARK: '#5b21b6', PINK_D: '#a78bfa', PINK_L: '#ddd6fe', PINK_XL: '#f5f3ff', CREAM: '#faf7ff', TEXT: '#2e1065', MUTED: '#9a8cc5', GOLD: '#fde68a' },

  { id: 'candy', emoji: '🍬', name: 'Candy Pop', PINK_DARK: '#9d174d', PINK_D: '#ec4899', PINK_L: '#fbcfe8', PINK_XL: '#fdf2f8', CREAM: '#fff7fb', TEXT: '#500724', MUTED: '#c08497', GOLD: '#fde047' },

  { id: 'ocean', emoji: '🌊', name: 'Ocean Breeze', PINK_DARK: '#164e63', PINK_D: '#06b6d4', PINK_L: '#a5f3fc', PINK_XL: '#ecfeff', CREAM: '#f0fdff', TEXT: '#083344', MUTED: '#5e8c94', GOLD: '#facc15' },
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
  [...CASTLE_THEMES, ...GIRL_THEMES, ...ROMANTIC_THEMES, ...BOY_THEMES, ...LORD_MONO_THEMES, ...UNICORN_THEMES]
    .find(t => t.id === id) ?? CASTLE_THEMES[0];

export const getGirlTheme  = (id?: string): CastleColorTheme =>
  GIRL_THEMES.find(t => t.id === id) ?? GIRL_THEMES[0];

export const getBoyTheme   = (id?: string): CastleColorTheme =>
  BOY_THEMES.find(t => t.id === id) ?? BOY_THEMES[0];

export const getRomanticTheme = (id?: string): CastleColorTheme =>
  ROMANTIC_THEMES.find(t => t.id === id) ?? ROMANTIC_THEMES[0];

export const getLordTheme = (id?: string): CastleColorTheme =>
  LORD_MONO_THEMES.find(t => t.id === id) ?? LORD_MONO_THEMES[0];

export const getGabbyTheme = (id?: string): CastleColorTheme =>
  GABBY_THEMES.find(t => t.id === id) ?? GABBY_THEMES[0];
export const getFrozenTheme = (id?: string): CastleColorTheme =>
  FROZEN_THEMES.find(t => t.id === id) ?? FROZEN_THEMES[0];
export const getUnicornTheme = (id?: string): CastleColorTheme =>
  UNICORN_THEMES.find(t => t.id === id) ?? UNICORN_THEMES[0];

export const ROYAL_ROSE_THEMES: CastleColorTheme[] = [
  { id: 'rose',     emoji: '🌹', name: 'Royal Rose',     PINK_DARK: '#9f1239', PINK_D: '#e11d48', PINK_L: '#fda4af', PINK_XL: '#fff1f2', CREAM: '#fff0f5', TEXT: '#881337', MUTED: '#be7180', GOLD: '#fce7f3' },
  { id: 'lavender', emoji: '💜', name: 'Lavender Dream',  PINK_DARK: '#5b21b6', PINK_D: '#7c3aed', PINK_L: '#c4b5fd', PINK_XL: '#f5f3ff', CREAM: '#f3f0ff', TEXT: '#4c1d95', MUTED: '#7c6f9d', GOLD: '#ede9fe' },
  { id: 'sage',     emoji: '🌿', name: 'Sage Garden',     PINK_DARK: '#14532d', PINK_D: '#16a34a', PINK_L: '#86efac', PINK_XL: '#f0fdf4', CREAM: '#ecfdf5', TEXT: '#14532d', MUTED: '#5a8c6a', GOLD: '#dcfce7' },
  { id: 'azure',    emoji: '💙', name: 'Azure Dream',     PINK_DARK: '#1e3a8a', PINK_D: '#2563eb', PINK_L: '#93c5fd', PINK_XL: '#eff6ff', CREAM: '#f0f5ff', TEXT: '#1e3a8a', MUTED: '#5a7abb', GOLD: '#dbeafe' },
  { id: 'gold',     emoji: '✨', name: 'Golden Hour',     PINK_DARK: '#92400e', PINK_D: '#d97706', PINK_L: '#fcd34d', PINK_XL: '#fffbeb', CREAM: '#fefce8', TEXT: '#78350f', MUTED: '#9a7c3e', GOLD: '#fef3c7' },
  { id: 'slate',    emoji: '🩶', name: 'Slate Elegant',   PINK_DARK: '#1e293b', PINK_D: '#475569', PINK_L: '#cbd5e1', PINK_XL: '#f1f5f9', CREAM: '#f8fafc', TEXT: '#1e293b', MUTED: '#64748b', GOLD: '#e2e8f0' },
];

export const getRoyalRoseTheme = (id?: string): CastleColorTheme =>
  ROYAL_ROSE_THEMES.find(t => t.id === id) ?? ROYAL_ROSE_THEMES[0];

// ── Adventure Road themes — dark navy, sky, gold ──────────────────────────────
export const ADVENTURE_THEMES: CastleColorTheme[] = [
  { id: 'sky',       emoji: '✈️', name: 'Sky Blue',     PINK_DARK: '#0c2340', PINK_D: '#1e3a5f', PINK_L: '#0ea5e9', PINK_XL: '#7dd3fc', CREAM: '#e0f2fe', TEXT: '#e2e8f0', MUTED: 'rgba(148,163,184,0.8)', GOLD: '#f59e0b' },
  { id: 'navy',      emoji: '⚓', name: 'Navy',          PINK_DARK: '#0f172a', PINK_D: '#1e3a5f', PINK_L: '#3b82f6', PINK_XL: '#93c5fd', CREAM: '#dbeafe', TEXT: '#e2e8f0', MUTED: 'rgba(148,163,184,0.8)', GOLD: '#fbbf24' },
  { id: 'ocean',     emoji: '🌊', name: 'Ocean',         PINK_DARK: '#083344', PINK_D: '#0e7490', PINK_L: '#06b6d4', PINK_XL: '#a5f3fc', CREAM: '#ecfeff', TEXT: '#e0f2fe', MUTED: 'rgba(148,163,184,0.8)', GOLD: '#f59e0b' },
  { id: 'midnight',  emoji: '🌙', name: 'Midnight',      PINK_DARK: '#1e1b4b', PINK_D: '#312e81', PINK_L: '#6366f1', PINK_XL: '#c7d2fe', CREAM: '#eef2ff', TEXT: '#e2e8f0', MUTED: 'rgba(148,163,184,0.8)', GOLD: '#fbbf24' },
  { id: 'forest',    emoji: '🌲', name: 'Forest',        PINK_DARK: '#052e16', PINK_D: '#166534', PINK_L: '#16a34a', PINK_XL: '#86efac', CREAM: '#f0fdf4', TEXT: '#d1fae5', MUTED: 'rgba(148,163,184,0.8)', GOLD: '#a3e635' },
  { id: 'sunset',    emoji: '🌅', name: 'Sunset',        PINK_DARK: '#1c0a00', PINK_D: '#7c2d12', PINK_L: '#f97316', PINK_XL: '#fed7aa', CREAM: '#fff7ed', TEXT: '#fef3c7', MUTED: 'rgba(251,191,36,0.7)',  GOLD: '#fbbf24' },
];

export const getAdventureTheme = (id?: string): CastleColorTheme =>
  ADVENTURE_THEMES.find(t => t.id === id) ?? ADVENTURE_THEMES[0];

// ── Jurassic Park themes ───────────────────────────────────────────────────────
export interface JurassicColorTheme {
  id: string;
  name: string;
  emoji: string;
  // template fields
  darkJungle: string;
  midJungle: string;
  stone: string;
  amber: string;
  amberLight: string;
  cream: string;
  text: string;
  muted: string;
  moss: string;
  // swatch aliases (used by SettingsView color picker)
  PINK_DARK: string;  // = amber   (accent — vizibil)
  PINK_L: string;     // = moss    (secundar — vizibil)
  PINK_XL: string;    // = cream   (deschis — vizibil)
}

// helper to auto-fill swatch aliases from template fields
function jr(t: Omit<JurassicColorTheme, 'PINK_DARK'|'PINK_L'|'PINK_XL'>): JurassicColorTheme {
  return { ...t, PINK_DARK: t.amber, PINK_L: t.moss, PINK_XL: t.cream };
}

// ── Băieți ────────────────────────────────────────────────────────────────────
export const JURASSIC_BOY_THEMES: JurassicColorTheme[] = [
  jr({ id: 'default',  emoji: '🦕', name: 'Jurassic Classic', darkJungle:'#0b1508', midJungle:'#152510', stone:'#2a2818', amber:'#c87820', amberLight:'#e09830', cream:'#f0e8c8', text:'#e8dfc0', muted:'rgba(212,184,140,0.65)', moss:'#4a7a30' }),
  jr({ id: 'volcano',  emoji: '🌋', name: 'Volcano',          darkJungle:'#180400', midJungle:'#2a0800', stone:'#3c1208', amber:'#e63000', amberLight:'#ff5500', cream:'#ffd0a8', text:'#ffc898', muted:'rgba(255,150,90,0.65)',  moss:'#802000' }),
  jr({ id: 'ocean',    emoji: '🌊', name: 'Deep Ocean',       darkJungle:'#040d18', midJungle:'#081a2e', stone:'#0d2a40', amber:'#0080e0', amberLight:'#30a8ff', cream:'#c8e8f8', text:'#c0e0f0', muted:'rgba(90,160,210,0.65)',  moss:'#006880' }),
  jr({ id: 'midnight', emoji: '🌙', name: 'Midnight Run',     darkJungle:'#06060f', midJungle:'#0c0c20', stone:'#161635', amber:'#5b5bff', amberLight:'#7b7bff', cream:'#d8d8ff', text:'#d0d0f0', muted:'rgba(140,140,220,0.65)', moss:'#303090' }),
  jr({ id: 'stealth',  emoji: '🦖', name: 'Stealth Rex',      darkJungle:'#090909', midJungle:'#131313', stone:'#1e1e1e', amber:'#9aaa20', amberLight:'#bcd030', cream:'#e8eab8', text:'#e0e2b0', muted:'rgba(170,180,90,0.65)',  moss:'#505520' }),
  jr({ id: 'lava',     emoji: '🔥', name: 'Lava Flow',        darkJungle:'#120300', midJungle:'#200600', stone:'#301200', amber:'#ff4200', amberLight:'#ff6500', cream:'#ffe0b8', text:'#ffd0a8', muted:'rgba(255,130,70,0.65)',  moss:'#801000' }),
];

// ── Fete ──────────────────────────────────────────────────────────────────────
export const JURASSIC_GIRL_THEMES: JurassicColorTheme[] = [
  jr({ id: 'pink_dino',   emoji: '🩷', name: 'Pink Dino',   darkJungle:'#1a0812', midJungle:'#281020', stone:'#3a1830', amber:'#e03898', amberLight:'#f858b8', cream:'#ffe0f0', text:'#ffd4ea', muted:'rgba(220,130,175,0.65)', moss:'#903060' }),
  jr({ id: 'purple_dino', emoji: '💜', name: 'Purple Dino', darkJungle:'#0e0818', midJungle:'#180d28', stone:'#241538', amber:'#8c38d8', amberLight:'#a858f8', cream:'#f0d8ff', text:'#e8ccff', muted:'rgba(175,115,215,0.65)', moss:'#6020a0' }),
  jr({ id: 'teal_dino',   emoji: '🩵', name: 'Teal Dino',   darkJungle:'#041516', midJungle:'#082028', stone:'#0c3038', amber:'#00b8c0', amberLight:'#20d8e0', cream:'#d0f8f8', text:'#c8f0f0', muted:'rgba(70,195,195,0.65)',  moss:'#006878' }),
  jr({ id: 'coral_dino',  emoji: '🪸', name: 'Coral Dino',  darkJungle:'#180508', midJungle:'#25090e', stone:'#361418', amber:'#e84848', amberLight:'#ff6868', cream:'#ffe8e0', text:'#ffd8d0', muted:'rgba(220,135,115,0.65)', moss:'#903838' }),
  jr({ id: 'enchanted',   emoji: '✨', name: 'Enchanted',    darkJungle:'#100818', midJungle:'#1a1028', stone:'#281838', amber:'#cc58c0', amberLight:'#e878d8', cream:'#fde0ff', text:'#fad4ff', muted:'rgba(200,125,198,0.65)', moss:'#8030a0' }),
  jr({ id: 'rose_gold',   emoji: '🌹', name: 'Rose Gold',    darkJungle:'#180c08', midJungle:'#261410', stone:'#361c18', amber:'#cc8858', amberLight:'#e8a878', cream:'#fff0e4', text:'#ffe4d4', muted:'rgba(208,165,135,0.65)', moss:'#905040' }),
];

export const getJurassicTheme = (id?: string): JurassicColorTheme => {
  const all = [...JURASSIC_BOY_THEMES, ...JURASSIC_GIRL_THEMES];
  return all.find(t => t.id === id) ?? JURASSIC_BOY_THEMES[0];
};


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
