import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Upload, Check, Loader2, Trash2, ChevronDown, ChevronUp, RefreshCw, Plus } from 'lucide-react';
import { CASTLE_THEMES, GIRL_THEMES, BOY_THEMES, getCastleTheme, getLordTheme, CastleColorTheme, ROMANTIC_THEMES, LORD_MONO_THEMES, JURASSIC_BOY_THEMES, JURASSIC_GIRL_THEMES, getJurassicTheme } from '../components/invitations/castleDefaults';

const API_URL =
  (typeof window !== 'undefined' && (window as any).__API_URL__) ||
  (import.meta as any)?.env?.VITE_API_URL ||
  'http://localhost:3005/api';

const tok = () =>
  JSON.parse(localStorage.getItem('weddingPro_session') || '{}')?.token || '';

// ── Tipuri ────────────────────────────────────────────────────────────────────
interface ThemeImages { desktop?: string; mobile?: string; }
interface IntroVariant { label: string; desktop?: string; mobile?: string; }
interface VariantConfig {
  colorTheme: string;
  themeImages: Record<string, ThemeImages>;
  heroBgImage?: string;
  heroBgImageMobile?: string;
  videoUrl?: string;
  introVariants: Record<string, IntroVariant>;
  defaultIntroVariant?: string;
}
type AllConfigs = Record<string, VariantConfig>;

// ── Template-uri ──────────────────────────────────────────────────────────────
const VARIANTS = [
  { id: 'castle-magic',      label: 'Castle Magic',   emoji: '🏰', color: '#be185d', bg: '#fdf2f8', desc: 'Versiunea clasică roz pentru botez' },
  { id: 'castle-magic-boys', label: 'Boy Castle',     emoji: '🏯', color: '#1d4ed8', bg: '#eff6ff', desc: 'Versiunea pentru băieți' },
  { id: 'castle-magic-girl', label: 'Girl Castle',    emoji: '🌸', color: '#7c3aed', bg: '#faf5ff', desc: 'Versiunea pentru fete' },
  { id: 'lord-effects',      label: 'Lord Effects',   emoji: '👑', color: '#1d4ed8', bg: '#eff6ff', desc: 'Varianta Lord Effects cu imagini per temă' },
  { id: 'romantic', label: 'Romantic',    emoji: '🌸', color: '#7f0000', bg: '#faf5ff', desc: 'Versiunea pentru fete' },
  { id: 'regal',         label: 'Regal',        emoji: '👑', color: '#92400e', bg: '#fffbeb', desc: 'Template royal cu video intro' },
  { id: 'jurassic-park', label: 'Jurassic Park', emoji: '🦕', color: '#c87820', bg: '#fdf8ec', desc: 'Aventură jurasică — teme băieți & fete' },
];

const emptyConfig = (): VariantConfig => ({ colorTheme: 'default', themeImages: {}, introVariants: {} });

// ── Component ─────────────────────────────────────────────────────────────────
const TemplateManagement: React.FC = () => {
  const [configs,  setConfigs]  = useState<AllConfigs>({});
  const [loading,  setLoading]  = useState<Record<string, boolean>>({});
  const [saving,   setSaving]   = useState<Record<string, boolean>>({});
  const [saved,    setSaved]    = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'castle-magic': true, 'castle-magic-boys': true, 'castle-magic-girl': true, 'lord-effects': true, 'jurassic-park': true,
  });

  // ── Load all variants on mount ─────────────────────────────────────────────
  useEffect(() => {
    VARIANTS.forEach(v => loadVariant(v.id));
  }, []);

  const loadVariant = async (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const r = await fetch(`${API_URL}/admin/config/template-defaults/${id}`, {
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const d = r.ok ? await r.json() : {};
      const themeImages: Record<string, ThemeImages> = d.themeImages || {};
      // Migrare format vechi
      if ((d.heroBgImage || d.heroBgImageMobile) && !themeImages['default']) {
        themeImages['default'] = { desktop: d.heroBgImage, mobile: d.heroBgImageMobile };
      }
      setConfigs(prev => ({
        ...prev,
        [id]: { colorTheme: d.colorTheme || 'default', themeImages, heroBgImage: d.heroBgImage, heroBgImageMobile: d.heroBgImageMobile, videoUrl: d.videoUrl || undefined, introVariants: d.introVariants || {}, defaultIntroVariant: d.defaultIntroVariant || undefined },
      }));
    } catch {}
    finally { setLoading(prev => ({ ...prev, [id]: false })); }
  };

  const saveVariant = async (id: string) => {
    const cfg = configs[id] || emptyConfig();
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      // Folosim imaginile temei active (colorTheme) ca fallback pentru heroBgImage
      const activeThemeImgs = cfg.themeImages[cfg.colorTheme] || {};
      const defaultImgs = activeThemeImgs.desktop ? activeThemeImgs : (cfg.themeImages['default'] || {});
      await fetch(`${API_URL}/admin/config/template-defaults/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({
          colorTheme:          cfg.colorTheme,
          themeImages:         cfg.themeImages,
          heroBgImage:         defaultImgs.desktop || null,
          heroBgImageMobile:   defaultImgs.mobile  || null,
          videoUrl:            cfg.videoUrl || null,
          introVariants:       cfg.introVariants || {},
          defaultIntroVariant: cfg.defaultIntroVariant || null,
        }),
      });
      setSaved(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(prev => ({ ...prev, [id]: false })); }
  };

  const resetVariant = async (id: string) => {
    const variant = VARIANTS.find(v => v.id === id);
    if (!window.confirm(`Resetezi toate imaginile și config-ul pentru "${variant?.label}"?

Fișierele vor fi șterse permanent.`)) return;
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const r = await fetch(`${API_URL}/admin/config/template-defaults/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const d = await r.json();
      setConfigs(prev => ({ ...prev, [id]: emptyConfig() }));
      alert(`✅ Reset complet. ${d.deleted || 0} fișiere șterse.`);
    } catch (e) {
      alert('Eroare la reset.');
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const patchConfig = (variantId: string, patch: Partial<VariantConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [variantId]: { ...(prev[variantId] || emptyConfig()), ...patch },
    }));
  };

  const setThemeImage = (variantId: string, themeId: string, side: 'desktop' | 'mobile', url?: string) => {
    setConfigs(prev => {
      const cfg = prev[variantId] || emptyConfig();
      return {
        ...prev,
        [variantId]: {
          ...cfg,
          themeImages: {
            ...cfg.themeImages,
            [themeId]: { ...cfg.themeImages[themeId], [side]: url },
          },
        },
      };
    });
  };

  const removeThemeImages = (variantId: string, themeId: string) => {
    setConfigs(prev => {
      const cfg = { ...(prev[variantId] || emptyConfig()) };
      const imgs = { ...cfg.themeImages };
      delete imgs[themeId];
      return { ...prev, [variantId]: { ...cfg, themeImages: imgs } };
    });
  };

  // ── Intro Variants helpers (regal) ────────────────────────────────────────
  const addIntroVariant = (variantId: string) => {
    const id = `v_${Date.now()}`;
    setConfigs(prev => {
      const cfg = prev[variantId] || emptyConfig();
      return { ...prev, [variantId]: { ...cfg, introVariants: { ...cfg.introVariants, [id]: { label: 'Variantă nouă' } } } };
    });
  };

  const updateIntroVariant = (variantId: string, ivId: string, patch: Partial<IntroVariant>) => {
    setConfigs(prev => {
      const cfg = prev[variantId] || emptyConfig();
      return { ...prev, [variantId]: { ...cfg, introVariants: { ...cfg.introVariants, [ivId]: { ...cfg.introVariants[ivId], ...patch } } } };
    });
  };

  const removeIntroVariant = (variantId: string, ivId: string) => {
    setConfigs(prev => {
      const cfg = { ...(prev[variantId] || emptyConfig()) };
      const ivs = { ...cfg.introVariants };
      delete ivs[ivId];
      const defaultIv = cfg.defaultIntroVariant === ivId ? undefined : cfg.defaultIntroVariant;
      return { ...prev, [variantId]: { ...cfg, introVariants: ivs, defaultIntroVariant: defaultIv } };
    });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .img-field-hover:hover .img-overlay { opacity: 1 !important; background: rgba(0,0,0,0.5) !important; }
        .img-field-hover:hover .img-overlay button { opacity: 1 !important; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111' }}>🏰 Castle Templates</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
          Configurare globală pentru toate variantele — imagini uși per temă, paletă implicită.
        </p>
      </div>

      {/* ── Un card per variantă ────────────────────────────────────────────── */}
      {VARIANTS.map(variant => {
        const cfg     = configs[variant.id] || emptyConfig();
        const isLoading = loading[variant.id];
        const isSaving  = saving[variant.id];
        const isSaved   = saved[variant.id];
        const isExpanded = expanded[variant.id] !== false;
        const themesWithImgs = Object.entries(cfg.themeImages).filter(([, v]) => v.desktop || v.mobile).length;

        return (
          <div key={variant.id} style={{ background: 'white', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderBottom: isExpanded ? '1px solid #f3f4f6' : 'none', background: variant.bg, cursor: 'pointer' }}
              onClick={() => setExpanded(p => ({ ...p, [variant.id]: !isExpanded }))}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: variant.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: `0 4px 12px ${variant.color}44` }}>
                {variant.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111' }}>{variant.label}</h3>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 8px', borderRadius: 6 }}>{variant.id}</span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
                  {variant.desc} · Temă implicită: <strong style={{ color: variant.color }}>{variant.id === 'lord-effects' ? getLordTheme(cfg.colorTheme).emoji : variant.id === 'jurassic-park' ? getJurassicTheme(cfg.colorTheme).emoji : getCastleTheme(cfg.colorTheme).emoji} {variant.id === 'lord-effects' ? getLordTheme(cfg.colorTheme).name : variant.id === 'jurassic-park' ? getJurassicTheme(cfg.colorTheme).name : getCastleTheme(cfg.colorTheme).name}</strong>
                  {themesWithImgs > 0 && <> · <span style={{ color: '#4f46e5' }}>🚪 {themesWithImgs} teme cu imagini</span></>}
                </p>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                <button type="button" onClick={() => loadVariant(variant.id)} disabled={isLoading}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Reîncarcă">
                  <RefreshCw size={13} style={{ color: '#6b7280', animation: isLoading ? 'spin 0.7s linear infinite' : 'none' }} />
                </button>
                <button type="button" onClick={() => saveVariant(variant.id)} disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', background: isSaved ? '#10b981' : variant.color, color: 'white', fontSize: 12, fontWeight: 700, transition: 'background 0.2s', opacity: isSaving ? 0.7 : 1 }}>
                  {isSaving ? <Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> : isSaved ? <Check size={12} /> : <Save size={12} />}
                  {isSaved ? 'Salvat!' : isSaving ? '...' : 'Salvează'}
                </button>
                <button type="button" onClick={() => resetVariant(variant.id)} disabled={isLoading || isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, border: '1.5px solid #fee2e2', cursor: 'pointer', background: 'white', color: '#ef4444', fontSize: 11, fontWeight: 700 }}
                  title="Șterge toate imaginile și resetează config-ul">
                  <Trash2 size={11} /> Reset
                </button>
              </div>
              <div style={{ color: '#9ca3af', marginLeft: 4 }}>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {/* Card body */}
           {isExpanded && (
  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 28, animation: 'fadeIn 0.15s ease' }}>
    {isLoading ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 32, color: '#9ca3af' }}>
        <Loader2 size={20} style={{ animation: 'spin 0.7s linear infinite', color: variant.color }} />
        <span style={{ fontSize: 13 }}>Se încarcă configurarea...</span>
      </div>
    ) : variant.id === 'regal' ? (
      // ── Regal: intro variants grid ────────────────────────────────────────
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header + Add button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>🖼 Variante Intro</span>
            <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>— utilizatorul alege varianta preferată din Settings</span>
          </div>
          <button type="button" onClick={() => addIntroVariant(variant.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1.5px dashed #92400e44', background: '#fffbeb', color: '#92400e', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={13} /> Adaugă variantă
          </button>
        </div>

        {Object.keys(cfg.introVariants).length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13, border: '1.5px dashed #e5e7eb', borderRadius: 14 }}>
            Nicio variantă. Apasă <strong>Adaugă variantă</strong> pentru a începe.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {Object.entries(cfg.introVariants).map(([ivId, iv]: [string, IntroVariant]) => {
            const isDefault = cfg.defaultIntroVariant === ivId;
            return (
              <div key={ivId} style={{ borderRadius: 14, border: `1.5px solid ${isDefault ? '#92400e66' : '#e5e7eb'}`, overflow: 'hidden', background: isDefault ? '#fffbeb' : 'white' }}>
                {/* Header variantă */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <input
                    value={iv.label}
                    onChange={e => updateIntroVariant(variant.id, ivId, { label: e.target.value })}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#111', outline: 'none', minWidth: 0 }}
                    placeholder="Nume variantă..."
                  />
                  {isDefault ? (
                    <span style={{ fontSize: 9, fontWeight: 700, background: '#92400e', color: 'white', borderRadius: 99, padding: '2px 7px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      DEFAULT
                    </span>
                  ) : (
                    <button type="button"
                      onClick={() => patchConfig(variant.id, { defaultIntroVariant: ivId })}
                      style={{ fontSize: 9, fontWeight: 700, background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 99, padding: '2px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      SET DEFAULT
                    </button>
                  )}
                  <button type="button" onClick={() => removeIntroVariant(variant.id, ivId)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }} title="Șterge varianta">
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Upload slots desktop + mobile */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: '12px 14px' }}>
                  <MiniImageField
                    label="Desktop 16:9"
                    url={iv.desktop}
                    aspect="56.25%"
                    accentColor="#92400e"
                    onUpload={url => updateIntroVariant(variant.id, ivId, { desktop: url })}
                    onRemove={() => updateIntroVariant(variant.id, ivId, { desktop: undefined })}
                  />
                  <MiniImageField
                    label="Mobile 9:16"
                    url={iv.mobile}
                    aspect="177.78%"
                    accentColor="#92400e"
                    width={52}
                    onUpload={url => updateIntroVariant(variant.id, ivId, { mobile: url })}
                    onRemove={() => updateIntroVariant(variant.id, ivId, { mobile: undefined })}
                  />
                </div>

                {/* Warning dacă nu are imagini */}
                {!iv.desktop && !iv.mobile && (
                  <div style={{ padding: '0 14px 10px', fontSize: 9, color: '#b45309' }}>
                    ⚠ Nicio imagine — varianta nu va fi afișată utilizatorilor
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info box */}
        {Object.keys(cfg.introVariants).length > 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 11, color: '#166534' }}>
            💡 Varianta marcată <strong>DEFAULT</strong> apare automat dacă utilizatorul nu a ales nimic. Apasă <strong>Salvează</strong> după orice modificare.
          </div>
        )}
      </div>
    ) : (
      // Secțiunea imagini uși per temă
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>🚪 Imagini uși per temă</span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>— fiecare temă poate avea imagini diferite</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {(variant.id === 'lord-effects'
            ? LORD_MONO_THEMES
            : variant.id === 'castle-magic-boys'
            ? BOY_THEMES
            : variant.id === 'castle-magic-girl'
                ? GIRL_THEMES
                : variant.id === 'romantic'
                ? ROMANTIC_THEMES
                : variant.id === 'jurassic-park'
                ? [...JURASSIC_BOY_THEMES, ...JURASSIC_GIRL_THEMES] as unknown as CastleColorTheme[]
                : CASTLE_THEMES
          ).map(theme => {
            const imgs = cfg.themeImages[theme.id] || {};
            const hasImgs = !!(imgs.desktop || imgs.mobile);
            const isDefault = cfg.colorTheme === theme.id;

            return (
              <div key={theme.id} style={{
                borderRadius: 14,
                border: `1.5px solid ${hasImgs ? theme.PINK_DARK + '66' : '#e5e7eb'}`,
                overflow: 'hidden',
                background: hasImgs ? theme.PINK_XL : 'white',
                transition: 'all 0.15s'
              }}>
                {/* Tema header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[theme.PINK_DARK, theme.PINK_L, theme.PINK_XL].map((c, i) => (
                      <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme.PINK_DARK, flex: 1 }}>
                    {theme.emoji} {theme.name}
                  </span>
                  {isDefault ? (
                    <span style={{ fontSize: 9, fontWeight: 700, background: theme.PINK_DARK, color: 'white', borderRadius: 99, padding: '2px 7px', letterSpacing: '0.05em' }}>
                      DEFAULT
                    </span>
                  ) : (
                    <button type="button"
                      onClick={() => patchConfig(variant.id, { colorTheme: theme.id })}
                      style={{ fontSize: 9, fontWeight: 700, background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 99, padding: '2px 8px', cursor: 'pointer', letterSpacing: '0.05em' }}>
                      SET DEFAULT
                    </button>
                  )}
                  {hasImgs && (
                    <button type="button" onClick={() => removeThemeImages(variant.id, theme.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }} title="Șterge imaginile">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Upload slots */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: '12px 14px' }}>
                  <MiniImageField
                    label="Desktop 16:9"
                    url={imgs.desktop}
                    aspect="56.25%"
                    accentColor={theme.PINK_DARK}
                    onUpload={url => setThemeImage(variant.id, theme.id, 'desktop', url)}
                    onRemove={() => setThemeImage(variant.id, theme.id, 'desktop', undefined)}
                  />
                  <MiniImageField
                    label="Mobile 9:16"
                    url={imgs.mobile}
                    aspect="177.78%"
                    accentColor={theme.PINK_DARK}
                    width={52}
                    onUpload={url => setThemeImage(variant.id, theme.id, 'mobile', url)}
                    onRemove={() => setThemeImage(variant.id, theme.id, 'mobile', undefined)}
                  />
                </div>

                {/* Fallback warnings */}
                {!hasImgs && theme.id !== 'default' && !cfg.themeImages['default']?.desktop && (
                  <div style={{ padding: '4px 14px 10px', fontSize: 9, color: '#b45309' }}>
                    ⚠ Fără imagini — se va folosi SVG placeholder
                  </div>
                )}
                {!hasImgs && theme.id !== 'default' && cfg.themeImages['default']?.desktop && (
                  <div style={{ padding: '4px 14px 10px', fontSize: 9, color: '#6b7280' }}>
                    → Folosește imaginile temei Default
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
)}
          </div>
        );
      })}

      {/* ── Info ───────────────────────────────────────────────────────────── */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 20px', display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#92400e' }}>Cum funcționează?</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#78350f', lineHeight: 1.7 }}>
            Fiecare variantă Castle (Magic / Boys / Girl) are propriile setări salvate în MongoDB.<br />
            Imaginile de la uși se servesc per temă activă — dacă tema utilizatorului nu are imagini proprii, se folosesc cele de la <strong>Default</strong>.<br />
            Modificările devin active <em>imediat</em> la următoarea deschidere a invitației.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Mini Image Field ──────────────────────────────────────────────────────────
const MiniImageField: React.FC<{
  label: string;
  url?: string;
  aspect: string;
  accentColor: string;
  width?: number;
  onUpload: (url: string) => void;
  onRemove: () => void;
}> = ({ label, url, aspect, accentColor, width, onUpload, onRemove }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}` },
        body: form,
      });
      const { url: newUrl } = await res.json();
      onUpload(newUrl);
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ width: width ? `${width}px` : '100%' }}>
      <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      <div
        className="img-field-hover"
        style={{ position: 'relative', paddingTop: aspect, borderRadius: 8, overflow: 'hidden', border: `1.5px dashed ${url ? accentColor + '66' : '#e5e7eb'}`, background: url ? 'transparent' : '#f9fafb', cursor: 'pointer', transition: 'border-color 0.15s' }}
        onClick={() => !url && ref.current?.click()}
        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.borderColor = accentColor; }}
        onDragLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = url ? accentColor + '66' : '#e5e7eb'; }}
        onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.borderColor = url ? accentColor + '66' : '#e5e7eb'; const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
        {url ? (
          <>
            <img src={url} alt={label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="img-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all 0.15s' }}>
              <button type="button" onClick={e => { e.stopPropagation(); ref.current?.click(); }}
                style={{ opacity: 0, background: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700, transition: 'opacity 0.15s' }}>
                ✎
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
                style={{ opacity: 0, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Trash2 size={9} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {uploading
              ? <Loader2 size={14} style={{ color: accentColor, animation: 'spin 0.7s linear infinite' }} />
              : <><Upload size={14} style={{ color: '#d1d5db' }} />{!width && <span style={{ fontSize: 9, color: '#d1d5db', fontWeight: 600 }}>Upload</span>}</>
            }
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
};

// ── Mini Video Field ──────────────────────────────────────────────────────────
const MiniVideoField: React.FC<{
  url?: string;
  accentColor: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}> = ({ url, accentColor, onUpload, onRemove }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/')) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}` },
        body: form,
      });
      const { url: newUrl } = await res.json();
      onUpload(newUrl);
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#6b7280' }}>
        🎬 Video Intro — apare în locul imaginii de fundal
      </p>
      <div
        className="img-field-hover"
        style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', border: `2px dashed ${url ? accentColor + '88' : '#e5e7eb'}`, background: url ? 'black' : '#f9fafb', cursor: url ? 'default' : 'pointer', transition: 'border-color 0.15s' }}
        onClick={() => !url && ref.current?.click()}
      >
        {url ? (
          <>
            <video
              src={url} autoPlay muted loop playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="img-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}>
              <button type="button" onClick={e => { e.stopPropagation(); ref.current?.click(); }}
                style={{ opacity: 0, background: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'opacity 0.15s' }}>
                ✎ Înlocuiește
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
                style={{ opacity: 0, background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trash2 size={11} /> Șterge
              </button>
            </div>
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {uploading
              ? <Loader2 size={20} style={{ color: accentColor, animation: 'spin 0.7s linear infinite' }} />
              : <>
                  <Upload size={20} style={{ color: '#d1d5db' }} />
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Click sau drag & drop — .mp4</span>
                </>
            }
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="video/mp4,video/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
};

export default TemplateManagement;
