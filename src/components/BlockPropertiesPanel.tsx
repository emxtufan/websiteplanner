import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Image,
  ChevronDown, ChevronUp, Palette, Layout, Sliders, Type,
  Square, Layers, X, Minus, Plus as PlusIcon,
} from "lucide-react";
import { InvitationBlock, TextStyle } from "../types";
import { FONT_OPTIONS } from "../config/fonts";


// ─── Block type classification ─────────────────────────────────────────────────
type BlockCategory = 'photo' | 'text' | 'structural' | 'hero';
function getCategory(type: string): BlockCategory {
  if (type === 'photo')                                         return 'photo';
  if (type === '__hero__')                                      return 'hero';
  if (['music','calendar','countdown'].includes(type))          return 'structural';
  return 'text'; // quote, location, parents, godparents, dresscode, gift, nokids, thankyou
}

// ─── Clip shapes ───────────────────────────────────────────────────────────────
type ClipShape = 'rect'|'rounded'|'rounded-lg'|'squircle'|'circle'|'arch'|'arch-b'|'hexagon'|'diamond'|'triangle'|'star'|'heart'|'diagonal'|'diagonal-r'|'wave-b'|'wave-t'|'wave-both'|'blob'|'blob2'|'blob3'|'blob4';
type MaskEffect = 'fade-b'|'fade-t'|'fade-l'|'fade-r'|'vignette';

const CLIPS: { id: ClipShape; label: string; path: string }[] = [
  { id:'rect',       label:'Drept',     path:'M4 6 h24 v20 H4 Z' },
  { id:'rounded',    label:'Rotund',    path:'M8 6 h16 a4 4 0 0 1 4 4 v12 a4 4 0 0 1 -4 4 H8 a4 4 0 0 1 -4 -4 V10 a4 4 0 0 1 4 -4 Z' },
  { id:'rounded-lg', label:'Rotund+',   path:'M12 6 h8 a8 8 0 0 1 8 8 v4 a8 8 0 0 1 -8 8 h-8 a8 8 0 0 1 -8 -8 v-4 a8 8 0 0 1 8 -8 Z' },
  { id:'squircle',   label:'Squircle',  path:'M16 5 C24 5 27 8 27 16 C27 24 24 27 16 27 C8 27 5 24 5 16 C5 8 8 5 16 5 Z' },
  { id:'circle',     label:'Cerc',      path:'M16 6 a10 10 0 1 1 0 20 a10 10 0 1 1 0 -20 Z' },
  { id:'arch',       label:'Arc sus',   path:'M4 26 L4 18 Q16 4 28 18 L28 26 Z' },
  { id:'arch-b',     label:'Arc jos',   path:'M4 6 L4 14 Q16 28 28 14 L28 6 Z' },
  { id:'hexagon',    label:'Hexagon',   path:'M16 5 L27 11 L27 23 L16 29 L5 23 L5 11 Z' },
  { id:'diamond',    label:'Romb',      path:'M16 5 L27 16 L16 27 L5 16 Z' },
  { id:'triangle',   label:'Triunghi',  path:'M16 5 L28 27 L4 27 Z' },
  { id:'star',       label:'Stea',      path:'M16 5 L18 12 L25 12 L20 17 L22 24 L16 20 L10 24 L12 17 L7 12 L14 12 Z' },
  { id:'heart',      label:'Inimă',     path:'M16 26 C16 26 4 18 4 11 C4 7 7 5 10 6 C13 7 16 10 16 10 C16 10 19 7 22 6 C25 5 28 7 28 11 C28 18 16 26 16 26 Z' },
  { id:'diagonal',   label:'Diag ↗',   path:'M4 6 h24 v18 L4 26 Z' },
  { id:'diagonal-r', label:'Diag ↘',   path:'M4 6 h24 v20 L4 24 Z' },
  { id:'wave-b',     label:'Val jos',   path:'M4 6 h24 v14 Q22 18 16 22 Q10 26 4 22 Z' },
  { id:'wave-t',     label:'Val sus',   path:'M4 10 Q10 6 16 10 Q22 14 28 10 L28 26 H4 Z' },
  { id:'wave-both',  label:'Val dublu', path:'M4 10 Q10 6 16 10 Q22 14 28 10 L28 22 Q22 18 16 22 Q10 26 4 22 Z' },
  { id:'blob',       label:'Blob 1',    path:'M16 5 C21 4 27 8 28 14 C29 20 25 27 19 28 C13 29 6 25 5 18 C4 11 8 6 16 5 Z' },
  { id:'blob2',      label:'Blob 2',    path:'M19 5 C24 6 28 11 27 17 C26 23 21 28 15 27 C9 26 4 21 5 15 C6 9 10 4 15 4 C17 4 18 5 19 5 Z' },
  { id:'blob3',      label:'Blob 3',    path:'M16 4 C22 3 28 8 28 15 C28 22 23 28 16 28 C9 28 3 23 4 16 C5 9 10 5 16 4 Z' },
  { id:'blob4',      label:'Blob 4',    path:'M14 5 C20 4 27 8 27 15 C27 22 22 28 16 28 C10 28 4 23 4 16 C4 9 8 6 14 5 Z' },
];
const MASKS: { id: MaskEffect; label: string; icon: string }[] = [
  { id:'fade-b', label:'Fade jos',     icon:'↓' },
  { id:'fade-t', label:'Fade sus',     icon:'↑' },
  { id:'fade-l', label:'Fade stg.',    icon:'←' },
  { id:'fade-r', label:'Fade dr.',     icon:'→' },
  { id:'vignette',label:'Vignetă',    icon:'◎' },
];

// ─── Theme context ─────────────────────────────────────────────────────────────
type Theme = 'dark' | 'light';

// ─── Sub-components ────────────────────────────────────────────────────────────
function Sec({ title, icon: Icon, children, open: initOpen = true, dark }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  open?: boolean; dark: boolean;
}) {
  const [open, setOpen] = useState(initOpen);
  const border = dark ? 'border-white/10' : 'border-zinc-200';
  const txt    = dark ? 'text-white/40'   : 'text-zinc-500';
  const hover  = dark ? 'hover:bg-white/5' : 'hover:bg-zinc-100';
  const headBg = dark ? 'bg-white/5' : 'bg-zinc-50';
  return (
    <div className={`border ${border} rounded-xl overflow-hidden mb-3 last:mb-0`}>
      <button type="button" onClick={() => setOpen(o=>!o)}
        className={`w-full flex items-center justify-between px-4 py-2.5 ${headBg} ${hover} transition-colors border-b ${border}`}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-white'}`}>
            <Icon className={`w-3.5 h-3.5 ${txt}`}/>
          </div>
          <span className={`text-[11px] font-black uppercase tracking-widest ${dark ? 'text-white/70' : 'text-zinc-600'}`}>{title}</span>
        </div>
        {open ? <ChevronUp className={`w-3 h-3 ${txt}`}/> : <ChevronDown className={`w-3 h-3 ${txt}`}/>}
      </button>
      {open && <div className="px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

function Row({ label, children, dark }: { label: string; children: React.ReactNode; dark: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className={`text-[10px] w-16 shrink-0 ${dark ? 'text-white/40' : 'text-zinc-400'}`}>{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function Stepper({ value, onChange, min=0, max=200, step=2, unit='px', dark }: {
  value: number; onChange: (v:number)=>void; min?:number; max?:number; step?:number; unit?:string; dark: boolean;
}) {
  const v = (value == null || isNaN(value)) ? 0 : value;
  const bg    = dark ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-zinc-200 text-zinc-700';
  const btnBg = dark ? 'hover:bg-white/10 text-white/50 hover:text-white border-white/10' : 'hover:bg-zinc-50 text-zinc-400 hover:text-zinc-700 border-zinc-100';
  return (
    <div className={`flex items-center h-7 rounded-lg border overflow-hidden ${bg}`}>
      <button type="button" onClick={() => onChange(Math.max(min, v-step))}
        className={`w-7 h-full flex items-center justify-center transition-colors border-r select-none shrink-0 ${btnBg}`}>
        <Minus className="w-3 h-3"/>
      </button>
      <input type="number" value={v} min={min} max={max}
        onChange={e => { const n=parseInt(e.target.value,10); onChange(isNaN(n)?0:Math.min(max,Math.max(min,n))); }}
        className={`flex-1 min-w-0 text-center text-[11px] font-mono bg-transparent border-none outline-none py-0 h-full ${dark ? 'text-white' : 'text-zinc-700'}`}
        style={{WebkitAppearance:'none',MozAppearance:'textfield'} as any}
      />
      <span className={`text-[9px] pr-1 shrink-0 ${dark ? 'text-white/30' : 'text-zinc-300'}`}>{unit}</span>
      <button type="button" onClick={() => onChange(Math.min(max, v+step))}
        className={`w-7 h-full flex items-center justify-center transition-colors border-l select-none shrink-0 ${btnBg}`}>
        <PlusIcon className="w-3 h-3"/>
      </button>
    </div>
  );
}

const PALETTE = [
  '#ffffff','#f5f0eb','#e8d8cc','#c9a07a','#8b6355','#5c3d2e','#1a1008',
  '#f7f3ef','#d4b896','#a07855','#6b4c3b','#3d2214',
  '#fce4ec','#f8bbd0','#e91e63','#880e4f',
  '#e3f2fd','#90caf9','#1976d2','#0d47a1',
  '#e8f5e9','#a5d6a7','#388e3c','#1b5e20',
  '#fff8e1','#ffe082','#f9a825','#e65100',
  '#f3e5f5','#ce93d8','#7b1fa2','#212121',
  'transparent',
];

function ColorPick({ value, onChange, label, dark }: { value:string; onChange:(v:string)=>void; label:string; dark:boolean }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const isTrans = !value || value==='transparent';
  const uid = `cp-${label.replace(/\s/g,'_')}`;
  const bg  = dark ? 'bg-zinc-800 border-white/20 hover:border-white/40' : 'bg-white border-zinc-200 hover:border-zinc-300';
  const lb  = dark ? 'bg-zinc-800 border-white/10 shadow-2xl' : 'bg-white border-zinc-200 shadow-xl';
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (!btnRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);
  return (
    <div className="relative">
      <button ref={btnRef} type="button" onClick={() => setOpen(o=>!o)}
        className={`w-full flex items-center gap-2 h-8 px-2.5 rounded-lg border transition-colors ${bg}`}>
        <div className="w-4 h-4 rounded border border-zinc-200 shrink-0"
          style={{ background: isTrans ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px' : value }}/>
        <span className={`text-[10px] font-mono flex-1 text-left truncate ${dark ? 'text-white/50' : 'text-zinc-500'}`}>
          {isTrans ? 'culoarea implicita' : value}
        </span>
        <ChevronDown className={`w-3 h-3 shrink-0 ${dark ? 'text-white/30' : 'text-zinc-300'}`}/>
      </button>
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className={`fixed z-[9999] border rounded-xl p-3 ${lb}`} style={{ top: pos.top, left: pos.left, width: pos.width }}>
            <button type="button" onClick={() => { onChange('transparent'); setOpen(false); }}
              className={`w-full mb-2 flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[10px] ${
                dark ? 'border-white/10 text-white/50 hover:border-white/20' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
              }`}>
              <div className="w-4 h-4 rounded border border-zinc-200 shrink-0"
                style={{ background: 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px' }}/>
              <span className="flex-1 text-left">culoarea implicita</span>
              {isTrans && <span className={dark ? 'text-white/60' : 'text-zinc-600'}>✓</span>}
            </button>
            <div className="grid grid-cols-8 gap-1 mb-2.5">
              {PALETTE.map(col => (
                <button key={col} type="button" onClick={() => { onChange(col); setOpen(false); }}
                  className="w-6 h-6 rounded border-2 hover:scale-110 transition-all"
                  style={{
                    background: col==='transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px' : col,
                    borderColor: value===col ? '#f59e0b' : 'transparent',
                  }} title={col === 'transparent' ? 'culoarea implicita' : col}/>
              ))}
            </div>
            <div className={`flex items-center gap-2 border-t pt-2 ${dark ? 'border-white/10' : 'border-zinc-100'}`}>
              <div className="w-5 h-5 rounded border border-zinc-200" style={{ background: isTrans?'#fff':value }}/>
              <input type="color" value={isTrans?'#ffffff':value} onChange={e => onChange(e.target.value)} className="sr-only" id={uid}/>
              <label htmlFor={uid} className={`text-[10px] cursor-pointer ${dark ? 'text-white/40 hover:text-white/70' : 'text-zinc-400 hover:text-zinc-700'}`}>
                Hex personalizat →
              </label>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

const BLOCK_LABELS: Record<string,string> = {
  photo:'📷 Fotografie', quote:'💬 Citat', location:'📍 Locație',
  music:'🎵 Muzică', countdown:'⏱ Countdown', calendar:'📅 Calendar',
  parents:'👨‍👩‍👧 Părinți', godparents:'💍 Nași', dresscode:'👔 Vestimentar',
  gift:'🎁 Cadou', nokids:'🚫 Fără copii', thankyou:'🙏 Mulțumire',
  divider:'─ Separator', text:'¶ Text', title:'T Titlu', __hero__:'🪧 Hero', intro:'🎬 Intro',
};

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export interface BlockPropertiesPanelProps {
  block: InvitationBlock | null;
  onUpdate: (patch: Partial<InvitationBlock>) => void;
  onClose: () => void;
  forceDark?: boolean;
  selectedTextKey?: string;
  selectedTextLabel?: string;
  inline?: boolean;
}

const BlockPropertiesPanel: React.FC<BlockPropertiesPanelProps> = ({ block, onUpdate, onClose, forceDark, selectedTextKey, selectedTextLabel, inline }) => {
  const dark = forceDark ?? false;
  const panelBg   = dark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900';
  const headerBg  = dark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-100';
  const divider   = dark ? 'border-white/10' : 'border-zinc-100';
  const mutedTxt  = dark ? 'text-white/40' : 'text-zinc-400';
  const subTxt    = dark ? 'text-white/25' : 'text-zinc-300';

  if (!block) {
    if (!inline) return null;
    return (
      <div
        className={`flex flex-col overflow-hidden rounded-xl border ${panelBg}`}
        style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : '#f1f1f1' }}
      >
      <div className={`shrink-0 px-4 py-3 border-b ${headerBg}`}>
          <p className={`text-[9px] uppercase tracking-widest font-bold ${mutedTxt}`}>Proprietăți</p>
          <p className={`text-xs font-bold mt-0.5 ${dark ? 'text-white' : 'text-zinc-800'}`}>Text</p>
        </div>
        <div className="px-4 py-3">
          <div className={`text-[10px] rounded-lg border px-3 py-2 ${dark ? 'border-white/10 text-white/50 bg-white/5' : 'border-zinc-200 text-zinc-500 bg-zinc-50'}`}>
            Selectează un text din invitație pentru a-i edita stilul.
          </div>
        </div>
      </div>
    );
  }

  const cat = getCategory(block.type as string);
  const isPhoto      = cat === 'photo';
  const isStructural = cat === 'structural';
  const hasTextSelection = !!selectedTextKey;
  const textStyle: TextStyle | undefined = hasTextSelection
    ? (block.textStyles?.[selectedTextKey as string] || {})
    : undefined;

  const clip  = (block.photoClip as ClipShape) || 'rect';
  const masks = (block.photoMasks as MaskEffect[]) || [];
  const toggleMask = (m: MaskEffect) => {
    const has = masks.includes(m);
    onUpdate({ photoMasks: has ? masks.filter(x=>x!==m) : [...masks, m] });
  };

  const pt  = block.blockPaddingTop    ?? 0;
  const pb  = block.blockPaddingBottom ?? 0;
  const ph  = block.blockPaddingH      ?? 0;
  const mt  = block.blockMarginTop     ?? 0;
  const mb  = block.blockMarginBottom  ?? 0;
  const br  = block.blockRadius        ?? 0;
  const op  = block.opacity            ?? 100;
  const effectiveFontFamily = hasTextSelection ? (textStyle?.fontFamily ?? block.blockFontFamily) : block.blockFontFamily;
  const fs  = hasTextSelection ? (textStyle?.fontSize      ?? block.blockFontSize ?? 0)      : (block.blockFontSize ?? 0);
  const fw  = hasTextSelection ? (textStyle?.fontWeight    ?? block.blockFontWeight ?? 0)    : (block.blockFontWeight ?? 0);
  const ls  = hasTextSelection ? (textStyle?.letterSpacing ?? block.blockLetterSpacing ?? 0) : (block.blockLetterSpacing ?? 0);
  const lh  = hasTextSelection ? (textStyle?.lineHeight    ?? block.blockLineHeight ?? 0)    : (block.blockLineHeight ?? 0);
  const effectiveFontStyle = hasTextSelection ? (textStyle?.fontStyle ?? block.blockFontStyle) : block.blockFontStyle;
  const isItalic = effectiveFontStyle === 'italic';
  const currentFontId = FONT_OPTIONS.find(f => f.family === effectiveFontFamily)?.id || 'default';
  const currentAlign = hasTextSelection ? (textStyle?.textAlign ?? block.blockAlign) : block.blockAlign;
  const currentTextColor = hasTextSelection ? (textStyle?.color ?? block.textColor) : block.textColor;

  const updateTextStyle = (patch: Partial<TextStyle>) => {
    if (!hasTextSelection || !selectedTextKey) return;
    const existing = block.textStyles?.[selectedTextKey] || {};
    const merged = { ...existing, ...patch };
    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ) as TextStyle;
    const nextMap = { ...(block.textStyles || {}) } as Record<string, TextStyle>;
    if (Object.keys(cleaned).length === 0) delete nextMap[selectedTextKey];
    else nextMap[selectedTextKey] = cleaned;
    const type = String(block.type || "");
    const singleTextBlock =
      type === "text" || type === "description" || type === "title" || type === "date";
    if (singleTextBlock && Object.prototype.hasOwnProperty.call(patch, "color")) {
      onUpdate({ textStyles: nextMap, textColor: patch.color ?? undefined });
      return;
    }
    onUpdate({ textStyles: nextMap });
  };
  const resetTextStyle = () => {
    if (!hasTextSelection || !selectedTextKey) return;
    const nextMap = { ...(block.textStyles || {}) } as Record<string, TextStyle>;
    delete nextMap[selectedTextKey];
    onUpdate({ textStyles: nextMap });
  };


  const wrapperClass = inline
    ? `flex flex-col overflow-hidden rounded-xl border ${panelBg}`
    : `shrink-0 flex flex-col h-full overflow-hidden ${panelBg}`;
  const wrapperStyle = inline
    ? { borderColor: dark ? 'rgba(255,255,255,0.08)' : '#f1f1f1' }
    : { borderLeft: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f1f1' };

  return (
    <div className={wrapperClass} style={wrapperStyle}>

      {/* Header */}
      <div className={`shrink-0 px-4 py-3 border-b ${headerBg}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-[9px] uppercase tracking-widest font-bold ${mutedTxt}`}>Proprietăți</p>
            <p className={`text-xs font-bold mt-0.5 truncate ${dark ? 'text-white' : 'text-zinc-800'}`}>
              {BLOCK_LABELS[block.type as string] || block.type}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {hasTextSelection && (
              <button
                type="button"
                onClick={resetTextStyle}
                className={`h-7 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                  dark ? 'border-white/10 text-white/50 hover:text-white hover:border-white/20' : 'border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
              >
                Reset text
              </button>
            )}
            <button type="button" onClick={onClose}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                dark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-zinc-100 text-zinc-400'
              }`}>
              <X className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] uppercase tracking-widest ${mutedTxt}`}>Text</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${dark ? 'border-white/10 text-white/60 bg-white/5' : 'border-zinc-200 text-zinc-600 bg-zinc-50'}`}>
            {hasTextSelection ? (selectedTextLabel || 'Selectat') : 'Neselectat'}
          </span>
          <span className={`text-[9px] uppercase tracking-widest ${mutedTxt}`}>Element</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${dark ? 'border-white/10 text-white/60 bg-white/5' : 'border-zinc-200 text-zinc-600 bg-zinc-50'}`}>
            {BLOCK_LABELS[block.type as string] || block.type}
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {!isPhoto && !hasTextSelection && (
          <div className="px-4 py-3">
            <div className={`text-[10px] rounded-lg border px-3 py-2 ${dark ? 'border-white/10 text-white/50 bg-white/5' : 'border-zinc-200 text-zinc-500 bg-zinc-50'}`}>
              Selectează un text din invitație pentru a-i edita stilul.
            </div>
          </div>
        )}

        {/* ── PHOTO ONLY ── */}
        {isPhoto && (
          <>
            <Sec title="Formă" icon={Square} dark={dark}>
              <div className="grid grid-cols-4 gap-1">
                {CLIPS.map(s => (
                  <button key={s.id} type="button" onClick={() => onUpdate({ photoClip: s.id })}
                    title={s.label}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                      clip===s.id
                        ? (dark ? 'border-amber-500 bg-amber-500/10' : 'border-amber-700 bg-amber-50')
                        : (dark ? 'border-transparent hover:border-white/10 bg-white/5' : 'border-transparent hover:border-zinc-100 bg-zinc-50')
                    }`}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d={s.path} fill={
                        clip===s.id ? (dark ? '#f59e0b' : '#8b6355') : (dark ? 'rgba(255,255,255,0.15)' : '#e8d8cc')
                      }/>
                    </svg>
                    <span className={`text-[8px] text-center leading-tight truncate w-full font-medium ${
                      clip===s.id ? (dark?'text-amber-400':'text-amber-800') : mutedTxt
                    }`}>{s.label}</span>
                  </button>
                ))}
              </div>
            </Sec>
            <Sec title="Efecte fade" icon={Layers} dark={dark} open={false}>
              <div className="grid grid-cols-5 gap-1">
                {MASKS.map(m => {
                  const active = masks.includes(m.id);
                  return (
                    <button key={m.id} type="button" onClick={() => toggleMask(m.id)}
                      className={`relative flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all ${
                        active
                          ? (dark ? 'border-amber-500 bg-amber-500/10' : 'border-amber-600 bg-amber-50')
                          : (dark ? 'border-white/10 hover:border-white/20 bg-white/5' : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50')
                      }`}>
                      {active && (
                        <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center ${dark ? 'bg-amber-500' : 'bg-amber-600'}`}>
                          <span className="text-white text-[8px] font-bold">✓</span>
                        </div>
                      )}
                      <span className={`text-base leading-none ${active ? (dark?'text-amber-400':'text-amber-700') : mutedTxt}`}>{m.icon}</span>
                      <span className={`text-[8px] text-center leading-tight ${active ? (dark?'text-amber-400 font-bold':'text-amber-700 font-bold') : mutedTxt}`}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </Sec>
            <Sec title="Proporție" icon={Image} dark={dark} open={false}>
              <div className="flex gap-1.5 flex-wrap">
                {(['3:4','4:3','1:1','16:9','free'] as const).map(r => (
                  <button key={r} type="button" onClick={() => onUpdate({ aspectRatio: r })}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border-2 transition-all ${
                      block.aspectRatio===r
                        ? (dark ? 'border-amber-500 bg-amber-500/20 text-amber-400' : 'border-amber-700 bg-amber-700 text-white')
                        : (dark ? 'border-white/10 text-white/40 hover:border-white/20' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300')
                    }`}>{r}</button>
                ))}
              </div>
            </Sec>
          </>
        )}

        {/* ── TEXT STYLE ── */}
        {!isPhoto && hasTextSelection && (
          <>
            <Sec title="Tipografie" icon={Type} dark={dark} open>
              <div className="space-y-2">
                <Row label="Font" dark={dark}>
                <select
                  value={currentFontId}
                  onChange={(e) => {
                    const opt = FONT_OPTIONS.find(f => f.id === e.target.value);
                    updateTextStyle({ fontFamily: opt?.family });
                  }}
                  style={{ colorScheme: dark ? 'dark' : 'light' }}
                  className={`w-full h-8 rounded-lg border px-2 text-[11px] ${dark ? 'bg-zinc-900 border-white/20 text-white' : 'bg-white border-zinc-200 text-zinc-700'}`}
                >
                  {FONT_OPTIONS.map(f => (
                    <option key={f.id} value={f.id} style={f.family ? { fontFamily: f.family } : undefined}>
                      {f.label}
                    </option>
                  ))}
                  </select>
                </Row>

                <Row label="Mărime" dark={dark}>
                  <Stepper
                    value={fs}
                    onChange={(v) => updateTextStyle({ fontSize: v <= 0 ? undefined : v })}
                    min={0}
                    max={80}
                    step={1}
                    dark={dark}
                  />
                </Row>

                <Row label="Greutate" dark={dark}>
                <select
                  value={fw || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateTextStyle({ fontWeight: isNaN(val) ? undefined : val });
                  }}
                  style={{ colorScheme: dark ? 'dark' : 'light' }}
                  className={`w-full h-8 rounded-lg border px-2 text-[11px] ${dark ? 'bg-zinc-900 border-white/20 text-white' : 'bg-white border-zinc-200 text-zinc-700'}`}
                >
                    <option value="">Auto</option>
                    {[300,400,500,600,700,800].map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </Row>

                <Row label="Stil" dark={dark}>
                  <button
                    type="button"
                    onClick={() => updateTextStyle({ fontStyle: isItalic ? undefined : 'italic' })}
                    className={`w-full h-8 rounded-lg border text-[11px] font-semibold ${dark ? 'border-white/10 text-white/70 hover:bg-white/10' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'} ${isItalic ? (dark ? 'bg-white/10' : 'bg-zinc-100') : ''}`}
                  >
                    {isItalic ? 'Italic activ' : 'Italic'}
                  </button>
                </Row>

                <Row label="Spațiu" dark={dark}>
                  <Stepper
                    value={ls}
                    onChange={(v) => updateTextStyle({ letterSpacing: v <= 0 ? undefined : v })}
                    min={0}
                    max={60}
                    step={1}
                    unit="em"
                    dark={dark}
                  />
                </Row>

                <Row label="Linie" dark={dark}>
                  <Stepper
                    value={lh}
                    onChange={(v) => updateTextStyle({ lineHeight: v <= 0 ? undefined : v })}
                    min={0}
                    max={240}
                    step={5}
                    unit="%"
                    dark={dark}
                  />
                </Row>

                <Row label="Aliniere" dark={dark}>
                  <div className="flex gap-1">
                    {(['left','center','right'] as const).map(al => (
                      <button
                        key={al}
                        type="button"
                        onClick={() => updateTextStyle({ textAlign: al })}
                        className={`flex-1 h-8 rounded-lg border text-[11px] font-semibold ${
                          currentAlign === al
                            ? (dark ? 'border-amber-500 bg-amber-500/20 text-amber-400' : 'border-amber-600 bg-amber-50 text-amber-700')
                            : (dark ? 'border-white/10 text-white/50 hover:border-white/20' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300')
                        }`}
                      >
                        {al === 'left' ? 'Stânga' : al === 'center' ? 'Centru' : 'Dreapta'}
                      </button>
                    ))}
                  </div>
                </Row>
              </div>
            </Sec>

            <Sec title="Culori" icon={Palette} dark={dark} open>
              <div className="space-y-2">
                <Row label="Text" dark={dark}>
                  <ColorPick value={currentTextColor||'transparent'} label="text" dark={dark}
                    onChange={v => updateTextStyle({ color: v==='transparent'?undefined:v })}/>
                </Row>
              </div>
            </Sec>
          </>
        )}

        {/* ── SPACING — all types ── */}
        <Sec title="Spațiere" icon={Layout} dark={dark} open={false}>
          <div className="space-y-1.5">
            <p className={`text-[9px] uppercase tracking-widest font-bold mb-1 ${mutedTxt}`}>Padding intern</p>
            <Row label="Sus"     dark={dark}><Stepper value={pt} onChange={v=>onUpdate({blockPaddingTop:v})}    dark={dark}/></Row>
            <Row label="Jos"     dark={dark}><Stepper value={pb} onChange={v=>onUpdate({blockPaddingBottom:v})} dark={dark}/></Row>
            <Row label="Lateral" dark={dark}><Stepper value={ph} onChange={v=>onUpdate({blockPaddingH:v})}      dark={dark}/></Row>
            <p className={`text-[9px] uppercase tracking-widest font-bold mb-1 mt-2 ${mutedTxt}`}>Margine externă</p>
            <Row label="Sus" dark={dark}><Stepper value={mt} onChange={v=>onUpdate({blockMarginTop:v})}    dark={dark}/></Row>
            <Row label="Jos" dark={dark}><Stepper value={mb} onChange={v=>onUpdate({blockMarginBottom:v})} dark={dark}/></Row>
          </div>
        </Sec>

        {/* ── ASPECT — all types ── */}
        <Sec title="Aspect" icon={Sliders} dark={dark} open={false}>
          <div className="space-y-2">
            {!isPhoto && <Row label="Raze" dark={dark}><Stepper value={br} onChange={v=>onUpdate({blockRadius:v})} max={80} dark={dark}/></Row>}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] ${mutedTxt}`}>Opacitate</span>
                <span className={`text-[10px] font-mono ${dark ? 'text-white/50' : 'text-zinc-500'}`}>{op}%</span>
              </div>
              <input type="range" min={0} max={100} step={5} value={op}
                onChange={e => onUpdate({ opacity: Number(e.target.value) })}
                className={`w-full h-1.5 cursor-pointer rounded-full ${dark ? 'accent-amber-400' : 'accent-amber-700'}`}/>
            </div>
          </div>
        </Sec>

        {/* Reset */}
        <div className="px-4 py-3">
          <button type="button"
            onClick={() => {
              if (hasTextSelection) { resetTextStyle(); return; }
              onUpdate({
                photoClip: undefined, photoMasks: [], aspectRatio: undefined,
                blockPaddingTop: undefined, blockPaddingBottom: undefined, blockPaddingH: undefined,
                blockMarginTop: undefined, blockMarginBottom: undefined,
                blockFontFamily: undefined, blockFontSize: undefined, blockFontWeight: undefined,
                blockFontStyle: undefined, blockLetterSpacing: undefined, blockLineHeight: undefined,
                blockAlign: undefined, textColor: undefined,
                bgColor: undefined, blockRadius: undefined, opacity: undefined,
                textStyles: {},
              });
            }}
            className={`w-full py-2 rounded-xl border text-[10px] font-bold ${
              dark ? 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/50' : 'border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600'
            }`}>
            {hasTextSelection ? 'Resetează stilul textului' : 'Resetează stilizarea'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockPropertiesPanel;
