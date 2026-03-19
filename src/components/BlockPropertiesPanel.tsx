import React, { useState, useRef } from "react";
import {
  Image,
  ChevronDown, ChevronUp, Palette, Layout, Sliders,
  Square, Layers, X, Minus, Plus as PlusIcon,
} from "lucide-react";
import { InvitationBlock } from "../types";


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
  const border = dark ? 'border-white/10' : 'border-zinc-100';
  const txt    = dark ? 'text-white/40'   : 'text-zinc-400';
  const hover  = dark ? 'hover:bg-white/5' : 'hover:bg-zinc-50';
  return (
    <div className={`border-b ${border} last:border-0`}>
      <button type="button" onClick={() => setOpen(o=>!o)}
        className={`w-full flex items-center justify-between px-4 py-2.5 ${hover} transition-colors`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${txt}`}/>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-white/50' : 'text-zinc-500'}`}>{title}</span>
        </div>
        {open ? <ChevronUp className={`w-3 h-3 ${txt}`}/> : <ChevronDown className={`w-3 h-3 ${txt}`}/>}
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
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
  const isTrans = !value || value==='transparent';
  const uid = `cp-${label.replace(/\s/g,'_')}`;
  const bg  = dark ? 'bg-zinc-800 border-white/20 hover:border-white/40' : 'bg-white border-zinc-200 hover:border-zinc-300';
  const lb  = dark ? 'bg-zinc-800 border-white/10 shadow-2xl' : 'bg-white border-zinc-200 shadow-xl';
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o=>!o)}
        className={`w-full flex items-center gap-2 h-8 px-2.5 rounded-lg border transition-colors ${bg}`}>
        <div className="w-4 h-4 rounded border border-zinc-200 shrink-0"
          style={{ background: isTrans ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px' : value }}/>
        <span className={`text-[10px] font-mono flex-1 text-left truncate ${dark ? 'text-white/50' : 'text-zinc-500'}`}>
          {isTrans ? 'transparent' : value}
        </span>
        <ChevronDown className={`w-3 h-3 shrink-0 ${dark ? 'text-white/30' : 'text-zinc-300'}`}/>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)}/>
          <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl z-[100] p-3 ${lb}`}>
            <div className="grid grid-cols-8 gap-1 mb-2.5">
              {PALETTE.map(col => (
                <button key={col} type="button" onClick={() => { onChange(col); setOpen(false); }}
                  className="w-6 h-6 rounded border-2 hover:scale-110 transition-all"
                  style={{
                    background: col==='transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px' : col,
                    borderColor: value===col ? '#f59e0b' : 'transparent',
                  }} title={col}/>
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
        </>
      )}
    </div>
  );
}

const BLOCK_LABELS: Record<string,string> = {
  photo:'📷 Fotografie', quote:'💬 Citat', location:'📍 Locație',
  music:'🎵 Muzică', countdown:'⏱ Countdown', calendar:'📅 Calendar',
  parents:'👨‍👩‍👧 Părinți', godparents:'💍 Nași', dresscode:'👔 Vestimentar',
  gift:'🎁 Cadou', nokids:'🚫 Fără copii', thankyou:'🙏 Mulțumire',
  divider:'─ Separator', text:'¶ Text', title:'T Titlu', __hero__:'🪧 Hero',
};

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export interface BlockPropertiesPanelProps {
  block: InvitationBlock | null;
  onUpdate: (patch: Partial<InvitationBlock>) => void;
  onClose: () => void;
  forceDark?: boolean;
}

const BlockPropertiesPanel: React.FC<BlockPropertiesPanelProps> = ({ block, onUpdate, onClose, forceDark }) => {
  const dark = forceDark ?? false;
  if (!block) return null;

  const cat = getCategory(block.type as string);
  const isPhoto      = cat === 'photo';
  const isStructural = cat === 'structural';

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

  const panelBg   = dark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900';
  const headerBg  = dark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-100';
  const divider   = dark ? 'border-white/10' : 'border-zinc-100';
  const mutedTxt  = dark ? 'text-white/40' : 'text-zinc-400';
  const subTxt    = dark ? 'text-white/25' : 'text-zinc-300';

  return (
    <div className={`shrink-0 flex flex-col h-full overflow-hidden ${panelBg}`}
      style={{ borderLeft: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f1f1' }}>

      {/* Header */}
      <div className={`shrink-0 px-4 py-3 border-b flex items-center justify-between ${headerBg}`}>
        <div className="min-w-0">
          <p className={`text-[9px] uppercase tracking-widest font-bold ${mutedTxt}`}>Proprietăți</p>
          <p className={`text-xs font-bold mt-0.5 truncate ${dark ? 'text-white' : 'text-zinc-800'}`}>
            {BLOCK_LABELS[block.type as string] || block.type}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">

          <button type="button" onClick={onClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              dark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-zinc-100 text-zinc-400'
            }`}>
            <X className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">

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

        {/* ── COLORS — all types except structural ── */}
        {!isStructural && (
          <Sec title="Culori" icon={Palette} dark={dark} open={false}>
            <div className="space-y-2">

              <Row label="Fundal" dark={dark}>
                <ColorPick value={block.bgColor||'transparent'} label="bg" dark={dark}
                  onChange={v => onUpdate({ bgColor: v==='transparent'?undefined:v })}/>
              </Row>
            </div>
          </Sec>
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
            onClick={() => onUpdate({
              photoClip: undefined, photoMasks: [], aspectRatio: undefined,
              blockPaddingTop: undefined, blockPaddingBottom: undefined, blockPaddingH: undefined,
              blockMarginTop: undefined, blockMarginBottom: undefined,
              bgColor: undefined, blockRadius: undefined, opacity: undefined,
            })}
            className={`w-full py-2 rounded-xl border text-[10px] font-bold ${
              dark ? 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/50' : 'border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600'
            }`}>
            Resetează stilizarea
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockPropertiesPanel;