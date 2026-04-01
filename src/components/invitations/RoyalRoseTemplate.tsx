import React, { useState, useEffect, useCallback, useRef} from "react";
import { Calendar, Clock, ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus, Camera, Sparkles, Upload, Music, Play, Pause, SkipForward, SkipBack, Gift, MessageCircle } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";
import { getRoyalRoseTheme } from "./castleDefaults";
import FlipClock from "./FlipClock";

const API_URL =
  (typeof window !== "undefined" && (window as any).__API_URL__) ||
  (import.meta as any)?.env?.VITE_API_URL ||
  "http://localhost:3005/api";

function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith('/uploads/')) return;
  const _session = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  fetch(`${API_URL}/upload`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_session?.token || ''}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

// Module-level theme — updated on each render by the main component
let T = getRoyalRoseTheme();

export const meta: TemplateMeta = {
  id: 'royal-rose',
  name: 'Royal Rose',
  category: 'wedding',
  description: 'Design romantic roz cu animație de deschidere și inițiale.',
  colors: ['#fff0f3', '#f9a8c9', '#c084a0'],
  previewClass: "bg-pink-50 border-pink-200",
  elementsClass: "bg-pink-200"
};

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return { days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000), minutes: Math.floor((diff%3600000)/60000), seconds: Math.floor((diff%60000)/1000), expired: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => { if (!target) return; const id = setInterval(() => setTime(calc()), 1000); return () => clearInterval(id); }, [target]);
  return time;
}

// ─── SVG decorations ──────────────────────────────────────────────────────────

const FloralCorner = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M5 5 Q20 5 20 20 Q20 5 35 5" stroke={T.PINK_L} strokeWidth="1" fill="none" opacity="0.6"/>
    <path d="M5 5 Q5 20 20 20 Q5 20 5 35" stroke={T.PINK_L} strokeWidth="1" fill="none" opacity="0.6"/>
    <circle cx="20" cy="20" r="3" fill={T.PINK_L} opacity="0.5"/>
    <circle cx="8" cy="8" r="1.5" fill={T.PINK_D} opacity="0.4"/>
    <path d="M12 20 Q16 14 20 20 Q24 14 28 20" stroke={T.PINK_D} strokeWidth="0.8" fill="none" opacity="0.5"/>
    <path d="M20 12 Q14 16 20 20 Q14 24 20 28" stroke={T.PINK_D} strokeWidth="0.8" fill="none" opacity="0.5"/>
    <circle cx="20" cy="20" r="1.5" fill={T.PINK_DARK} opacity="0.6"/>
    <path d="M35 5 Q42 12 35 20 Q28 12 35 5" fill={T.PINK_XL} opacity="0.4"/>
    <path d="M5 35 Q12 28 20 35 Q12 42 5 35" fill={T.PINK_XL} opacity="0.4"/>
  </svg>
);

const RoseDivider = () => (
  <div className="flex items-center justify-center gap-3 my-2">
    <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${T.PINK_L})` }} />
    <svg viewBox="0 0 40 20" className="w-10 h-5 shrink-0" fill="none">
      <path d="M20 10 Q15 4 10 10 Q15 16 20 10Z" fill={T.PINK_L} opacity="0.7"/>
      <path d="M20 10 Q25 4 30 10 Q25 16 20 10Z" fill={T.PINK_L} opacity="0.7"/>
      <path d="M20 10 Q14 10 10 6 Q14 14 20 10Z" fill={T.PINK_D} opacity="0.5"/>
      <circle cx="20" cy="10" r="2" fill={T.PINK_DARK} opacity="0.5"/>
      <circle cx="5" cy="10" r="1.5" fill={T.PINK_L} opacity="0.5"/>
      <circle cx="35" cy="10" r="1.5" fill={T.PINK_L} opacity="0.5"/>
    </svg>
    <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${T.PINK_L})` }} />
  </div>
);

// ─── Opening animation — initials circle ─────────────────────────────────────
const InitialsIntro = ({ initials, onDone }: { initials: string; onDone: () => void }) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2800);
    const t3 = setTimeout(onDone, 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center transition-all duration-700",
      phase === 'exit' ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
    )} style={{ background: `linear-gradient(135deg, ${T.PINK_XL} 0%, ${T.CREAM} 50%, ${T.PINK_L} 100%)` }}>
      {/* Petals background */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: `${20 + (i % 4) * 15}px`,
            height: `${20 + (i % 4) * 15}px`,
            top: `${10 + (i * 7.5) % 80}%`,
            left: `${5 + (i * 8.3) % 90}%`,
            animationDelay: `${i * 0.2}s`,
            transform: `rotate(${i * 30}deg)`,
            opacity: 0.4 + (i % 3) * 0.15,
            background: `${[T.PINK_L, T.PINK_D, T.PINK_XL][i % 3]}66`,
          }} />
      ))}

      {/* Main circle */}
      <div className={cn(
        "relative flex items-center justify-center transition-all duration-700",
        phase === 'enter' ? "opacity-0 scale-75" : "opacity-100 scale-100"
      )}>
        {/* Outer ring - animated */}
        <svg className="absolute w-72 h-72 -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke={T.PINK_L} strokeWidth="1.5"/>
          <circle cx="100" cy="100" r="90" fill="none" stroke={T.PINK_D} strokeWidth="1"
            strokeDasharray="565" strokeDashoffset={phase === 'enter' ? 565 : 0}
            style={{ transition: 'stroke-dashoffset 1.8s ease-out' }}/>
          {/* Dots on circle */}
          {[0,45,90,135,180,225,270,315].map((angle, i) => (
            <circle key={i}
              cx={100 + 90 * Math.cos((angle * Math.PI) / 180)}
              cy={100 + 90 * Math.sin((angle * Math.PI) / 180)}
              r="2" fill={T.PINK_D} opacity="0.6"/>
          ))}
        </svg>

        {/* Middle ring */}
        <svg className="absolute w-60 h-60" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke={T.PINK_XL} strokeWidth="8"/>
          <circle cx="100" cy="100" r="80" fill="none" stroke="url(#roseGrad)" strokeWidth="0.5" strokeDasharray="4 4"/>
          <defs>
            <radialGradient id="roseGrad">
              <stop offset="0%" stopColor={T.PINK_D}/>
              <stop offset="100%" stopColor={T.PINK_DARK}/>
            </radialGradient>
          </defs>
        </svg>

        {/* Inner decorative circle */}
        <div className="absolute w-52 h-52 rounded-full border" style={{ borderColor: `${T.PINK_L}99` }} />
        <div className="absolute w-44 h-44 rounded-full backdrop-blur-sm shadow-2xl" style={{ background: `${T.CREAM}cc`, boxShadow: `0 18px 40px ${T.PINK_L}88` }} />

        {/* Floral corners inside */}
        <div className="absolute w-44 h-44">
          <FloralCorner className="absolute top-1 left-1 w-10 h-10 opacity-60" />
          <FloralCorner className="absolute top-1 right-1 w-10 h-10 opacity-60 scale-x-[-1]" />
          <FloralCorner className="absolute bottom-1 left-1 w-10 h-10 opacity-60 scale-y-[-1]" />
          <FloralCorner className="absolute bottom-1 right-1 w-10 h-10 opacity-60 scale-[-1]" />
        </div>

        {/* Initials */}
        <div className={cn(
          "relative text-center transition-all duration-500",
          phase === 'enter' ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
        )} style={{ transitionDelay: '0.4s' }}>
          <p className="font-serif text-5xl tracking-widest leading-none" style={{ fontVariant: 'small-caps', color: T.PINK_DARK }}>
            {initials}
          </p>
          <p className="text-[9px] uppercase tracking-[0.4em] mt-2 font-sans font-bold" style={{ color: T.PINK_D }}>
            se căsătoresc
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Block toolbar ────────────────────────────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: {
  onUp: () => void; onDown: () => void; onToggle: () => void; onDelete: () => void;
  visible: boolean; isFirst: boolean; isLast: boolean;
}) => (
  <div className="absolute -top-3.5 right-3 flex items-center gap-0.5 bg-white border border-pink-200 rounded-full shadow-lg px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto">
    <button type="button" onClick={e => { e.stopPropagation(); onUp(); }} disabled={isFirst} className="p-0.5 rounded-full hover:bg-pink-50 disabled:opacity-25 transition-colors"><ChevronUp className="w-3 h-3 text-pink-400" /></button>
    <button type="button" onClick={e => { e.stopPropagation(); onDown(); }} disabled={isLast} className="p-0.5 rounded-full hover:bg-pink-50 disabled:opacity-25 transition-colors"><ChevronDown className="w-3 h-3 text-pink-400" /></button>
    <div className="w-px h-3 bg-pink-100 mx-0.5" />
    <button type="button" onClick={e => { e.stopPropagation(); onToggle(); }} className="p-0.5 rounded-full hover:bg-pink-50 transition-colors">
      {visible ? <Eye className="w-3 h-3 text-pink-400" /> : <EyeOff className="w-3 h-3 text-pink-300" />}
    </button>
    <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }} className="p-0.5 rounded-full hover:bg-red-50 transition-colors"><Trash2 className="w-3 h-3 text-red-400" /></button>
  </div>
);

// ─── Countdown unit ───────────────────────────────────────────────────────────
const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: "📷",
  text: "T",
  location: "📍",
  calendar: "📅",
  countdown: "⏱",
  music: "🎵",
  gift: "🎁",
  whatsapp: "💬",
  rsvp: "RSVP",
  divider: "—",
  family: "👨‍👩‍👧",
  date: "📆",
  description: "📝",
  title: "Aa",
  godparents: "💍",
  parents: "👪",
  spacer: "↕",
};

const InsertBlockButton: React.FC<{
  insertIdx: number;
  openInsertAt: number | null;
  setOpenInsertAt: (v: number | null) => void;
  blockTypes: { type: string; label: string; def: any }[];
  onInsert: (type: string, def: any) => void;
}> = ({ insertIdx, openInsertAt, setOpenInsertAt, blockTypes, onInsert }) => {
  const isOpen = openInsertAt === insertIdx;
  const [hovered, setHovered] = useState(false);
  const visible = hovered || isOpen;

  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 30, zIndex: 40 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        background: `repeating-linear-gradient(to right, ${T.PINK_L} 0, ${T.PINK_L} 6px, transparent 6px, transparent 12px)`,
      }} />

      <button
        type="button"
        onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: `1.5px solid ${T.PINK_L}`,
          background: isOpen ? T.PINK_DARK : "white",
          color: isOpen ? "white" : T.PINK_DARK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          lineHeight: 1,
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          transform: visible ? "scale(1)" : "scale(0.7)",
          transition: "all .15s",
          zIndex: 2,
        }}
      >
        {isOpen ? "x" : "+"}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: 34,
            left: "50%",
            transform: "translateX(-50%)",
            width: 280,
            background: "white",
            border: `1px solid ${T.PINK_L}`,
            borderRadius: 16,
            boxShadow: "0 16px 48px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
            padding: 14,
            zIndex: 200,
          }}
        >
          <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: T.PINK_DARK, margin: "0 0 10px", textAlign: "center" }}>
            Adauga bloc
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {blockTypes.map(bt => (
              <button
                key={bt.type}
                type="button"
                onClick={() => onInsert(bt.type, bt.def)}
                style={{
                  border: `1px solid ${T.PINK_L}`,
                  borderRadius: 10,
                  background: T.PINK_XL,
                  color: T.PINK_DARK,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "8px 4px",
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{BLOCK_TYPE_ICONS[bt.type] || "+"}</span>
                <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.15, textAlign: "center" }}>
                  {bt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center" style={{ border: `1px solid ${T.PINK_L}` }}>
      <span className="text-2xl font-bold tabular-nums" style={{ color: T.PINK_DARK }}>{String(value).padStart(2,'0')}</span>
    </div>
    <span className="text-[9px] uppercase tracking-widest font-bold font-sans" style={{ color: T.MUTED }}>{label}</span>
  </div>
);

// Template defaults
export const CASTLE_DEFAULTS = {
  partner1Name: 'Maria',
  partner2Name: 'Andrei',
  welcomeText: 'Impreuna cu familiile noastre',
  invitationLeadText: 'Va invita cu drag la',
  celebrationText: 'nuntii noastre',
  heroCountdownText: 'Pana la marele eveniment',
  showWelcomeText: true,
  showCelebrationText: true,
  showTimeline: true,
  showCountdown: true,
  showRsvpButton: true,
  rsvpButtonText: 'Confirma Prezenta',
  colorTheme: 'rose',
};

export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = [
  { id: 'rr-date', type: 'date', show: true, content: '' },
  { id: 'rr-description', type: 'description', show: true, content: 'Va asteptam cu drag sa celebram impreuna o zi speciala din povestea noastra.' },
  { id: 'rr-location', type: 'location', show: true, label: 'Locatie', time: '17:00', locationName: 'Royal Garden Ballroom', locationAddress: 'Strada Florilor 10', wazeLink: '' },
  { id: 'rr-text', type: 'text', show: true, content: 'Va asteptam cu drag sa celebram impreuna o zi speciala din povestea noastra.' },
  { id: 'rr-photo', type: 'photo', show: true, imageData: '', altText: 'Foto cuplu', aspectRatio: '3:4', photoClip: 'arch', photoMasks: ['fade-b'] },
  { id: 'rr-calendar', type: 'calendar', show: true },
  { id: 'rr-countdown', type: 'countdown', show: true, countdownTitle: 'Timp ramas pana la marele eveniment' },
  { id: 'rr-music', type: 'music', show: true, musicTitle: '', musicArtist: '', musicType: 'none' },
  { id: 'rr-gift', type: 'gift', show: true, sectionTitle: 'Sugestie cadou', content: '', iban: '', ibanName: '' },
  { id: 'rr-whatsapp', type: 'whatsapp', show: true, label: 'Contact WhatsApp', content: '0700000000' },
  { id: 'rr-family', type: 'family', show: true, label: 'Familie', content: 'Cu drag si recunostinta', members: JSON.stringify([{ name1: 'Mama', name2: 'Tata' }]) },
  { id: 'rr-rsvp', type: 'rsvp', show: true, label: 'Confirma Prezenta' },
  { id: 'rr-divider', type: 'divider', show: true },
];

export const CASTLE_PREVIEW_DATA = {
  guest: { name: 'Familia Popescu', status: 'pending', type: 'family' },
  project: { selectedTemplate: 'royal-rose' },
  profile: {
    ...CASTLE_DEFAULTS,
    weddingDate: '',
    customSections: JSON.stringify(CASTLE_DEFAULT_BLOCKS),
    godparents: JSON.stringify([{ godfather: 'Nume Nas', godmother: 'Nume Nasa' }]),
    parents: JSON.stringify({ p1_father: 'Tatal Miresei', p1_mother: 'Mama Miresei', p2_father: 'Tatal Mirelui', p2_mother: 'Mama Mirelui' }),
    timeline: JSON.stringify([]),
  },
};

type ClipShape = 'rect' | 'rounded' | 'rounded-lg' | 'squircle' | 'circle' | 'arch' | 'arch-b' | 'hexagon' | 'diamond' | 'triangle' | 'star' | 'heart' | 'diagonal' | 'diagonal-r' | 'wave-b' | 'wave-t' | 'wave-both' | 'blob' | 'blob2' | 'blob3' | 'blob4';
type MaskEffect = 'fade-b' | 'fade-t' | 'fade-l' | 'fade-r' | 'vignette';

function getClipStyle(clip: ClipShape): React.CSSProperties {
  const m: Record<ClipShape, React.CSSProperties> = {
    rect: { borderRadius: 0 }, rounded: { borderRadius: 16 }, 'rounded-lg': { borderRadius: 32 },
    squircle: { borderRadius: '30% 30% 30% 30% / 30% 30% 30% 30%' }, circle: { borderRadius: '50%' },
    arch: { borderRadius: '50% 50% 0 0 / 40% 40% 0 0' }, 'arch-b': { borderRadius: '0 0 50% 50% / 0 0 40% 40%' },
    hexagon: { clipPath: 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)' },
    diamond: { clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' },
    triangle: { clipPath: 'polygon(50% 0%,100% 100%,0% 100%)' },
    star: { clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' },
    heart: { clipPath: 'url(#rr-clip-heart)' }, diagonal: { clipPath: 'polygon(0 0,100% 0,100% 80%,0 100%)' },
    'diagonal-r': { clipPath: 'polygon(0 0,100% 0,100% 100%,0 80%)' },
    'wave-b': { clipPath: 'url(#rr-clip-wave-b)' }, 'wave-t': { clipPath: 'url(#rr-clip-wave-t)' },
    'wave-both': { clipPath: 'url(#rr-clip-wave-both)' },
    blob: { clipPath: 'url(#rr-clip-blob)' }, blob2: { clipPath: 'url(#rr-clip-blob2)' },
    blob3: { clipPath: 'url(#rr-clip-blob3)' }, blob4: { clipPath: 'url(#rr-clip-blob4)' },
  };
  return m[clip] || {};
}

function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers = effects.map(e => {
    switch (e) {
      case 'fade-b': return 'linear-gradient(to bottom, black 40%, transparent 100%)';
      case 'fade-t': return 'linear-gradient(to top, black 40%, transparent 100%)';
      case 'fade-l': return 'linear-gradient(to left, black 40%, transparent 100%)';
      case 'fade-r': return 'linear-gradient(to right, black 40%, transparent 100%)';
      case 'vignette': return 'radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)';
      default: return 'none';
    }
  });
  const mask = layers.join(', ');
  return { WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: effects.length > 1 ? 'source-in' : 'unset', maskComposite: effects.length > 1 ? 'intersect' : 'unset' };
}

const PhotoClipDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none' }}>
    <defs>
      <clipPath id="rr-clip-wave-b" clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="rr-clip-wave-t" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath>
      <clipPath id="rr-clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="rr-clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath>
      <clipPath id="rr-clip-blob" clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath>
      <clipPath id="rr-clip-blob2" clipPathUnits="objectBoundingBox"><path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z"/></clipPath>
      <clipPath id="rr-clip-blob3" clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath>
      <clipPath id="rr-clip-blob4" clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath>
    </defs>
  </svg>
);

const PhotoBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (patch: Partial<InvitationBlock>) => void;
  placeholderInitial1?: string;
}> = ({ block, editMode, onUpdate, placeholderInitial1 }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const pt: Record<string, string> = { '1:1': '100%', '4:3': '75%', '3:4': '133%', '16:9': '56.25%', free: '66.6%' };
  const aspectRatio = (block.aspectRatio || 'free') as any;
  const photoClip = (block.photoClip || 'rect') as ClipShape;
  const photoMasks = (block.photoMasks || []) as MaskEffect[];
  const combined = { ...getClipStyle(photoClip), ...getMaskStyle(photoMasks) };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    deleteUploadedFile(block.imageData);
    try {
      const form = new FormData();
      form.append('file', file);
      const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${_s?.token || ''}` }, body: form });
      const { url } = await res.json();
      onUpdate({ imageData: url });
    } finally {
      setUploading(false);
    }
  };

  if (block.imageData) return (
    <div style={{ position: 'relative' }}>
      <PhotoClipDefs />
      <div style={{ position: 'relative', paddingTop: pt[aspectRatio], overflow: 'hidden', ...combined }}>
        <img src={block.imageData} alt={block.altText || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {editMode && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="p-2 bg-white rounded-full text-pink-600"><Camera className="w-5 h-5"/></button>
            <button type="button" onClick={() => { deleteUploadedFile(block.imageData); onUpdate({ imageData: undefined }); }} className="p-2 bg-white rounded-full text-red-600"><Trash2 className="w-5 h-5"/></button>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <PhotoClipDefs />
      <div style={{ position: 'relative', paddingTop: pt[aspectRatio], ...combined, overflow: 'hidden', cursor: editMode ? 'pointer' : 'default' }}
        onClick={editMode ? () => fileRef.current?.click() : undefined}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${T.PINK_L} 0%, ${T.PINK_DARK} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {uploading
            ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            : <div style={{ textAlign: 'center' }}>
                <Sparkles className="w-12 h-12 text-white/40 mb-2 mx-auto" />
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 48, color: 'white' }}>{(placeholderInitial1 || 'M')[0].toUpperCase()}</span>
              </div>
          }
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
    </div>
  );
};

// ─── Main Template ────────────────────────────────────────────────────────────
const MusicBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
}> = ({ block, editMode, onUpdate }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const mp3Ref = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDur);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [block.musicUrl, block.musicType]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = duration ? `${(progress / duration) * 100}%` : "0%";

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
  };

  const handleMp3 = async (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    setUploading(true);
    deleteUploadedFile(block.musicUrl);
    try {
      const form = new FormData();
      form.append("file", file);
      const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${_s?.token || ""}` },
        body: form,
      });
      if (!res.ok) throw new Error("Audio upload failed");
      const { url } = await res.json();
      onUpdate({ musicUrl: url, musicType: "mp3" });
    } catch (e) {
      console.error("Audio upload:", e);
    } finally {
      setUploading(false);
    }
  };

  const isActive = !!block.musicUrl;

  return (
    <div style={{ background: "white", border: `1.5px solid ${playing ? T.PINK_DARK : T.PINK_L}`, borderRadius: 16, padding: "18px 20px", boxShadow: playing ? `0 0 0 3px ${T.PINK_DARK}22` : "none" }}>
      {block.musicType === "mp3" && block.musicUrl && <audio ref={audioRef} src={block.musicUrl} preload="metadata" />}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: playing ? T.PINK_DARK : T.PINK_XL, border: `1.5px solid ${playing ? T.PINK_DARK : T.PINK_L}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Music className="w-4 h-4" style={{ color: playing ? "white" : T.PINK_DARK }} />
        </div>
        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: playing ? T.PINK_DARK : T.MUTED }}>
          {playing ? "Se reda acum" : "Muzica"}
        </span>
      </div>

      {!isActive && editMode && (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => mp3Ref.current?.click()}
            disabled={uploading}
            style={{ flex: 1, background: T.PINK_XL, border: `1px dashed ${T.PINK_L}`, borderRadius: 10, padding: "14px 0", cursor: uploading ? "not-allowed" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
          >
            {uploading ? <div className="w-5 h-5 border-2 border-rose-700 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-5 h-5" style={{ color: T.PINK_DARK, opacity: 0.7 }} />}
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 9, color: T.MUTED, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>MP3</span>
          </button>
          <input
            ref={mp3Ref}
            type="file"
            accept="audio/*,.mp3"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleMp3(f);
            }}
            style={{ display: "none" }}
          />
        </div>
      )}

      {!isActive && !editMode && (
        <div style={{ textAlign: "center", padding: "12px 0", opacity: 0.45 }}>
          <Music className="w-8 h-8" style={{ color: T.PINK_DARK, display: "block", margin: "0 auto 6px" }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.MUTED, margin: 0 }}>Melodia va aparea aici</p>
        </div>
      )}

      {isActive && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: `linear-gradient(135deg, ${T.PINK_XL}, ${T.PINK_L})`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.PINK_L}` }}>
              <Music className="w-5 h-5" style={{ color: T.PINK_DARK, opacity: 0.7 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit
                tag="p"
                editMode={editMode}
                value={block.musicTitle || ""}
                onChange={v => onUpdate({ musicTitle: v })}
                placeholder="Titlul melodiei..."
                style={{ fontFamily: "Georgia, serif", fontSize: 14, fontStyle: "italic", color: T.PINK_DARK, margin: 0 }}
              />
              <InlineEdit
                tag="p"
                editMode={editMode}
                value={block.musicArtist || ""}
                onChange={v => onUpdate({ musicArtist: v })}
                placeholder="Artist..."
                style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, color: T.MUTED, margin: "2px 0 0" }}
              />
            </div>
          </div>

          <div onClick={seek} style={{ height: 4, background: T.PINK_L, borderRadius: 99, marginBottom: 6, cursor: "pointer", position: "relative" }}>
            <div style={{ height: "100%", borderRadius: 99, background: T.PINK_DARK, width: pct }} />
            <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: pct, marginLeft: -5, width: 10, height: 10, borderRadius: "50%", background: T.PINK_DARK }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 9, color: T.MUTED }}>{fmt(progress)}</span>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 9, color: T.MUTED }}>{duration ? fmt(duration) : "--:--"}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.max(0, a.currentTime - 10); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.55 }}>
              <SkipBack className="w-4 h-4" style={{ color: T.PINK_DARK }} />
            </button>
            <button type="button" onClick={toggle} style={{ width: 42, height: 42, borderRadius: "50%", background: T.PINK_DARK, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {playing ? <Pause className="w-4 h-4" style={{ color: "white" }} /> : <Play className="w-4 h-4" style={{ color: "white", marginLeft: 2 }} />}
            </button>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.min(duration || a.currentTime + 10, a.currentTime + 10); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.55 }}>
              <SkipForward className="w-4 h-4" style={{ color: T.PINK_DARK }} />
            </button>
          </div>

          {editMode && (
            <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8 }}>
              <button type="button" onClick={() => mp3Ref.current?.click()} style={{ background: T.PINK_XL, border: `1px solid ${T.PINK_L}`, borderRadius: 99, padding: "4px 12px", cursor: "pointer", fontFamily: "Montserrat, sans-serif", fontSize: 9, color: T.MUTED, fontWeight: 700 }}>
                Schimba sursa
              </button>
              <button type="button" onClick={() => { deleteUploadedFile(block.musicUrl); onUpdate({ musicUrl: "", musicType: "none" as any }); setPlaying(false); setProgress(0); setDuration(0); }} style={{ background: "transparent", border: `1px dashed ${T.PINK_L}`, borderRadius: 99, padding: "4px 12px", cursor: "pointer", fontFamily: "Montserrat, sans-serif", fontSize: 9, color: T.MUTED, fontWeight: 700 }}>
                Sterge
              </button>
              <input
                ref={mp3Ref}
                type="file"
                accept="audio/*,.mp3"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleMp3(f);
                }}
                style={{ display: "none" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CalendarMonth: React.FC<{ date: string | undefined }> = ({ date }) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ["IANUARIE", "FEBRUARIE", "MARTIE", "APRILIE", "MAI", "IUNIE", "IULIE", "AUGUST", "SEPTEMBRIE", "OCTOMBRIE", "NOIEMBRIE", "DECEMBRIE"];
  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];
  const startOffset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div style={{ background: "white", borderRadius: 16, padding: 20, textAlign: "center", border: `1px solid ${T.PINK_L}` }}>
      <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: T.PINK_DARK, marginBottom: 12 }}>{monthNames[month]} {year}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
        {dayLabels.map((l, i) => <div key={`${l}-${i}`} style={{ fontSize: 9, fontWeight: 700, color: T.MUTED }}>{l}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {cells.map((cell, i) => {
          const isToday = cell === day;
          return (
            <div key={i} style={{ height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "white" : cell ? T.PINK_DARK : "transparent", background: isToday ? T.PINK_DARK : "transparent", borderRadius: "50%" }}>
              {cell || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export type RoyalRoseProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const RoyalRoseTemplate: React.FC<RoyalRoseProps> = ({
  data, onOpenRSVP,
  editMode = false,
  introPreview = false,
  onProfileUpdate,
  onBlocksUpdate,
  onBlockSelect,
  selectedBlockId,
}) => {
  const { profile, guest } = data;
  T = getRoyalRoseTheme((profile as any).colorTheme || CASTLE_DEFAULTS.colorTheme);

  const [showIntro, setShowIntro] = useState(!editMode || introPreview);
  const [contentVisible, setContentVisible] = useState(editMode && !introPreview);

  useEffect(() => {
    if (editMode) {
      if (introPreview) { setShowIntro(true); setContentVisible(false); }
      else { setShowIntro(false); setContentVisible(true); }
      return;
    }
    setShowIntro(true); setContentVisible(false);
  }, [editMode, introPreview]);

  const handleIntroDone = () => {
    setShowIntro(false);
    setTimeout(() => setContentVisible(true), 100);
  };

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const [blocks, setBlocks]         = useState<InvitationBlock[]>(() => {
    const fromDb = safeJSON(profile.customSections, null);
    return Array.isArray(fromDb) && fromDb.length ? fromDb : CASTLE_DEFAULT_BLOCKS;
  });
  const [openInsertAt, setOpenInsertAt] = useState<number | null>(null);
  const [godparents, setGodparents] = useState<any[]>(() => safeJSON(profile.godparents, [{ godfather: 'Nume Nas', godmother: 'Nume Nasa' }]));
  const [parentsData, setParentsData] = useState<any>(() => safeJSON(profile.parents, { p1_father: 'Tatal Miresei', p1_mother: 'Mama Miresei', p2_father: 'Tatal Mirelui', p2_mother: 'Mama Mirelui' }));

  useEffect(() => {
    const fromDb = safeJSON(profile.customSections, null);
    setBlocks(Array.isArray(fromDb) && fromDb.length ? fromDb : CASTLE_DEFAULT_BLOCKS);
  }, [profile.customSections]);
  useEffect(() => { setGodparents(safeJSON(profile.godparents, [{ godfather: 'Nume Nas', godmother: 'Nume Nasa' }])); }, [profile.godparents]);
  useEffect(() => { setParentsData(safeJSON(profile.parents, { p1_father: 'Tatal Miresei', p1_mother: 'Mama Miresei', p2_father: 'Tatal Mirelui', p2_mother: 'Mama Mirelui' })); }, [profile.parents]);

  const p = {
    partner1Name: profile.partner1Name ?? CASTLE_DEFAULTS.partner1Name,
    partner2Name: profile.partner2Name ?? CASTLE_DEFAULTS.partner2Name,
    welcomeText: profile.welcomeText ?? CASTLE_DEFAULTS.welcomeText,
    invitationLeadText: (profile as any).invitationLeadText ?? CASTLE_DEFAULTS.invitationLeadText,
    celebrationText: profile.celebrationText ?? CASTLE_DEFAULTS.celebrationText,
    heroCountdownText: (profile as any).heroCountdownText ?? CASTLE_DEFAULTS.heroCountdownText,
    showWelcomeText: profile.showWelcomeText ?? CASTLE_DEFAULTS.showWelcomeText,
    showCelebrationText: profile.showCelebrationText ?? CASTLE_DEFAULTS.showCelebrationText,
    showCountdown: profile.showCountdown ?? CASTLE_DEFAULTS.showCountdown,
    showTimeline: profile.showTimeline ?? CASTLE_DEFAULTS.showTimeline,
    showRsvpButton: profile.showRsvpButton ?? CASTLE_DEFAULTS.showRsvpButton,
    rsvpButtonText: profile.rsvpButtonText ?? CASTLE_DEFAULTS.rsvpButtonText,
    weddingDate: profile.weddingDate ?? '',
  };

  const countdown = useCountdown(p.weddingDate || '');

  // Debounce profile & blocks updates — prevents API call on every keystroke
  const _profileQueue = useRef<Record<string, any>>({});
  const _profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const _blocksTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upProfile = useCallback((field: string, value: any) => {
    _profileQueue.current = { ..._profileQueue.current, [field]: value };
    if (_profileTimer.current) clearTimeout(_profileTimer.current);
    _profileTimer.current = setTimeout(() => {
      onProfileUpdate?.(_profileQueue.current);
      _profileQueue.current = {};
    }, 500);
  }, [onProfileUpdate]);

  const _debouncedBlocksSave = useCallback((nb: InvitationBlock[]) => {
    if (_blocksTimer.current) clearTimeout(_blocksTimer.current);
    _blocksTimer.current = setTimeout(() => onBlocksUpdate?.(nb), 500);
  }, [onBlocksUpdate]);

  const updBlock = useCallback((idx: number, patch: Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb = prev.map((b, i) => i === idx ? { ...b, ...patch } : b); _debouncedBlocksSave(nb); return nb; });
  }, [_debouncedBlocksSave]);

  const movBlock = useCallback((idx: number, dir: -1 | 1) => {
    setBlocks(prev => { const nb = [...prev]; const to = idx + dir; if (to < 0 || to >= nb.length) return prev; [nb[idx], nb[to]] = [nb[to], nb[idx]]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const delBlock = useCallback((idx: number) => {
    setBlocks(prev => { const nb = prev.filter((_, i) => i !== idx); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const addBlockAt = useCallback((afterIdx: number, type: string, def: any) => {
    setBlocks(prev => {
      const nb = [...prev];
      nb.splice(afterIdx + 1, 0, { id: Date.now().toString(), type: type as InvitationBlockType, show: true, ...def });
      onBlocksUpdate?.(nb);
      return nb;
    });
  }, [onBlocksUpdate]);
  const addBlock = useCallback((type: string, def: any) => {
    setBlocks(prev => {
      const nb = [...prev, { id: Date.now().toString(), type: type as InvitationBlockType, show: true, ...def }];
      onBlocksUpdate?.(nb);
      return nb;
    });
  }, [onBlocksUpdate]);

  const updGodparent = (i: number, field: 'godfather' | 'godmother', val: string) => {
    setGodparents(prev => { const ng = prev.map((g, j) => j === i ? { ...g, [field]: val } : g); upProfile('godparents', JSON.stringify(ng)); return ng; });
  };
  const addGodparent = () => setGodparents(prev => { const ng = [...prev, { godfather: '', godmother: '' }]; upProfile('godparents', JSON.stringify(ng)); return ng; });
  const delGodparent = (i: number) => setGodparents(prev => { const ng = prev.filter((_, j) => j !== i); upProfile('godparents', JSON.stringify(ng)); return ng; });
  const updParent = (field: string, val: string) => setParentsData((prev: any) => { const np = { ...prev, [field]: val }; upProfile('parents', JSON.stringify(np)); return np; });

  // Compute initials
  const p1 = (p.partner1Name || 'A').trim()[0]?.toUpperCase() || 'A';
  const p2 = (p.partner2Name || 'M').trim()[0]?.toUpperCase() || 'M';
  const initials = `${p1} & ${p2}`;

  const welcomeText     = p.welcomeText?.trim()    || 'Împreună cu familiile noastre';
  const invitationLeadText = ((p as any).invitationLeadText || CASTLE_DEFAULTS.invitationLeadText).trim() || CASTLE_DEFAULTS.invitationLeadText;
  const celebrationText = p.celebrationText?.trim() || 'nunții noastre';
  const heroCountdownText = ((p as any).heroCountdownText || CASTLE_DEFAULTS.heroCountdownText).trim() || CASTLE_DEFAULTS.heroCountdownText;
  const rsvpText        = p.rsvpButtonText?.trim()  || 'Confirmă Prezența';
  const showRsvp        = p.showRsvpButton !== false;
  const isBaptism       = profile.eventType === 'baptism' || profile.eventType === 'kids';
  const displayBlocks   = editMode ? blocks : blocks.filter(b => b.show !== false);
  const hasRsvpBlock    = blocks.some(b => b.type === 'rsvp' && (editMode || b.show !== false));
  const dateStr         = p.weddingDate
    ? new Date(p.weddingDate).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Data Evenimentului';
  const BLOCK_TYPES: { type: string; label: string; def: any }[] = [
    { type: 'photo', label: 'Foto', def: { imageData: undefined, altText: '', aspectRatio: '3:4', photoClip: 'arch', photoMasks: ['fade-b'] } },
    { type: 'text', label: 'Text', def: { content: 'O poveste frumoasa incepe...' } },
    { type: 'location', label: 'Locatie', def: { label: 'Locatie', time: '17:00', locationName: 'Nume locatie', locationAddress: 'Adresa', wazeLink: '' } },
    { type: 'calendar', label: 'Calendar', def: {} },
    { type: 'countdown', label: 'Countdown', def: { countdownTitle: 'Timp ramas pana la marele eveniment' } },
    { type: 'music', label: 'Muzica', def: { musicTitle: '', musicArtist: '', musicType: 'none' } },
    { type: 'gift', label: 'Cadouri', def: { sectionTitle: 'Sugestie cadou', content: '', iban: '', ibanName: '' } },
    { type: 'whatsapp', label: 'WhatsApp', def: { label: 'Contact WhatsApp', content: '0700000000' } },
    { type: 'rsvp', label: 'RSVP', def: { label: 'Confirma Prezenta' } },
    { type: 'divider', label: 'Linie', def: {} },
    { type: 'family', label: 'Familie', def: { label: 'Familie', content: 'Cu drag si recunostinta', members: JSON.stringify([{ name1: 'Mama', name2: 'Tata' }]) } },
    { type: 'date', label: 'Data', def: { content: '' } },
    { type: 'description', label: 'Descriere', def: { content: 'O scurta descriere...' } },
    { type: 'title', label: 'Titlu', def: { content: 'Titlu sectiune' } },
    { type: 'godparents', label: 'Nasi', def: { sectionTitle: 'Nasii Nostri', content: '' } },
    { type: 'parents', label: 'Parinti', def: { sectionTitle: 'Parintii Nostri', content: '' } },
    { type: 'spacer', label: 'Spatiu', def: {} },
  ];
  const handleInsertAt = (afterIdx: number, type: string, def: any) => {
    addBlockAt(afterIdx, type, def);
    setOpenInsertAt(null);
  };
  const timeline: any[] = (() => { try { return profile.timeline ? JSON.parse(profile.timeline) : []; } catch { return []; } })();
  const updateTimelineItem = (id: string, patch: Record<string, any>) => {
    const next = timeline.map((it: any) => it.id === id ? { ...it, ...patch } : it);
    upProfile('timeline', JSON.stringify(next));
  };
  const themeCSS = `
    .rr-wrap .rr-accent { color: ${T.PINK_D} !important; }
    .rr-wrap .rr-text-main { color: ${T.PINK_DARK} !important; }
    .rr-wrap .rr-text-muted { color: ${T.MUTED} !important; }
    .rr-wrap .rr-surface { background: ${T.PINK_XL} !important; border-color: ${T.PINK_L} !important; }
    .rr-wrap .rr-border-soft { border-color: ${T.PINK_L} !important; }
    .rr-wrap .rr-hover:hover { background: ${T.PINK_XL} !important; }
    .rr-wrap .text-pink-300 { color: ${T.PINK_L} !important; }
    .rr-wrap .text-pink-400 { color: ${T.PINK_D} !important; }
    .rr-wrap .text-pink-500 { color: ${T.PINK_D} !important; }
    .rr-wrap .text-rose-400 { color: ${T.MUTED} !important; }
    .rr-wrap .text-rose-500 { color: ${T.PINK_D} !important; }
    .rr-wrap .text-rose-600 { color: ${T.PINK_DARK} !important; }
    .rr-wrap .text-rose-700 { color: ${T.PINK_DARK} !important; }
    .rr-wrap .text-rose-800 { color: ${T.PINK_DARK} !important; }
    .rr-wrap .border-pink-100 { border-color: ${T.PINK_L}66 !important; }
    .rr-wrap .border-pink-200 { border-color: ${T.PINK_L} !important; }
    .rr-wrap .border-pink-300 { border-color: ${T.PINK_D} !important; }
    .rr-wrap .border-pink-400 { border-color: ${T.PINK_D} !important; }
    .rr-wrap .border-rose-300 { border-color: ${T.PINK_D} !important; }
    .rr-wrap .border-rose-400 { border-color: ${T.PINK_D} !important; }
    .rr-wrap .border-rose-500 { border-color: ${T.PINK_DARK} !important; }
    .rr-wrap .bg-pink-50 { background-color: ${T.PINK_XL} !important; }
    .rr-wrap .bg-pink-100 { background-color: ${T.PINK_XL} !important; }
    .rr-wrap .hover\\:bg-pink-50:hover { background-color: ${T.PINK_XL} !important; }
    .rr-wrap .hover\\:border-pink-300:hover { border-color: ${T.PINK_D} !important; }
    .rr-wrap .hover\\:border-pink-400:hover { border-color: ${T.PINK_D} !important; }
    .rr-wrap .focus\\:border-rose-500:focus { border-color: ${T.PINK_DARK} !important; }
    .rr-wrap .bg-gradient-to-br {
      background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)) !important;
    }
    .rr-wrap .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
    }
    .rr-wrap .from-pink-50 {
      --tw-gradient-from: ${T.PINK_XL} var(--tw-gradient-from-position) !important;
      --tw-gradient-to: ${T.CREAM}00 var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .rr-wrap .from-pink-100 {
      --tw-gradient-from: ${T.PINK_XL} var(--tw-gradient-from-position) !important;
      --tw-gradient-to: ${T.CREAM}00 var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .rr-wrap .from-pink-200 {
      --tw-gradient-from: ${T.PINK_L} var(--tw-gradient-from-position) !important;
      --tw-gradient-to: ${T.PINK_XL}00 var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .rr-wrap .via-rose-300 {
      --tw-gradient-stops: var(--tw-gradient-from), ${T.PINK_D} var(--tw-gradient-via-position), var(--tw-gradient-to) !important;
    }
    .rr-wrap .to-rose-50 {
      --tw-gradient-to: ${T.CREAM} var(--tw-gradient-to-position) !important;
    }
    .rr-wrap .to-pink-100 {
      --tw-gradient-to: ${T.PINK_XL} var(--tw-gradient-to-position) !important;
    }
    .rr-wrap .to-pink-200 {
      --tw-gradient-to: ${T.PINK_L} var(--tw-gradient-to-position) !important;
    }
    .rr-wrap .hover\\:text-rose-600:hover { color: ${T.PINK_DARK} !important; }
    .rr-wrap .shadow-pink-200\\/60 { --tw-shadow-color: ${T.PINK_L}99 !important; }
    .rr-wrap .shadow-pink-300\\/40 { --tw-shadow-color: ${T.PINK_L}88 !important; }
    .rr-wrap .hover\\:shadow-pink-400\\/50:hover { --tw-shadow-color: ${T.PINK_D}88 !important; }
  `;

  return (
    <div className="rr-wrap relative min-h-screen font-serif" style={{ background: `linear-gradient(160deg, ${T.CREAM} 0%, ${T.PINK_XL} 45%, ${T.CREAM} 100%)` }}>
      <style>{themeCSS}</style>

      {/* Opening intro */}
      {showIntro && <InitialsIntro initials={initials} onDone={handleIntroDone} />}

      {/* Edit hint bar */}
      {editMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-rose-900/90 backdrop-blur text-white rounded-full px-4 py-1.5 shadow-2xl text-[10px] font-bold pointer-events-none select-none">
          <span className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse" />
          <span className="uppercase tracking-widest">Editare Directă</span>
          <span className="text-rose-300 font-normal">— click pe orice text</span>
        </div>
      )}

      {/* Main content */}
      <div className={cn(
        "flex items-start justify-center p-4 min-h-screen transition-all duration-1000",
        editMode ? "py-12 pt-16 opacity-100" : contentVisible ? "py-12 opacity-100" : "opacity-0"
      )}>
        <div className="max-w-lg w-full relative">

          {/* Corner florals */}
          <FloralCorner className="absolute -top-3 -left-3 w-20 h-20 opacity-70" />
          <FloralCorner className="absolute -top-3 -right-3 w-20 h-20 opacity-70 scale-x-[-1]" />
          <FloralCorner className="absolute -bottom-3 -left-3 w-20 h-20 opacity-70 scale-y-[-1]" />
          <FloralCorner className="absolute -bottom-3 -right-3 w-20 h-20 opacity-70 scale-[-1]" />

          {/* Card */}
          <div className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl shadow-pink-200/60 border border-pink-100 overflow-hidden">

            {/* Top gradient bar */}
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${T.PINK_L}, ${T.PINK_D}, ${T.PINK_DARK}, ${T.PINK_D}, ${T.PINK_L})` }} />

            <div className="p-8 md:p-12 text-center space-y-8">

              {/* ── INITIALS MEDALLION ── */}
              <div className="flex justify-center">
                <div className="relative w-28 h-28">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="56" fill="none" stroke={T.PINK_XL} strokeWidth="2"/>
                    <circle cx="60" cy="60" r="52" fill="none" stroke={T.PINK_D} strokeWidth="0.5" strokeDasharray="3 3"/>
                    <circle cx="60" cy="60" r="46" fill="url(#medalGrad)" />
                    <defs>
                      <radialGradient id="medalGrad" cx="40%" cy="35%">
                        <stop offset="0%" stopColor={T.CREAM}/>
                        <stop offset="100%" stopColor={T.PINK_XL}/>
                      </radialGradient>
                    </defs>
                    {[0,60,120,180,240,300].map((a, i) => (
                      <circle key={i}
                        cx={60 + 56 * Math.cos((a * Math.PI) / 180)}
                        cy={60 + 56 * Math.sin((a * Math.PI) / 180)}
                        r="2.5" fill={T.PINK_D} opacity="0.6"/>
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl tracking-widest" style={{ fontVariant: 'small-caps', fontFamily: 'Georgia, serif', color: T.PINK_DARK }}>
                      {p1}&amp;{p2}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── HERO ── */}
              <BlockStyleProvider value={{
                blockId: "__hero__",
                textStyles: (profile as any).heroTextStyles,
                onTextSelect: (textKey, textLabel) => onBlockSelect?.(
                  { id: "__hero__", type: "title", show: true, textStyles: (profile as any).heroTextStyles } as any,
                  -1,
                  textKey,
                  textLabel
                ),
              }}>
              <div className="space-y-3">
                {p.showWelcomeText && (
                  <InlineEdit tag="p" editMode={editMode} value={welcomeText}
                    onChange={v => upProfile('welcomeText', v)}
                    textKey="hero:intro-welcome"
                    textLabel="Intro welcome"
                    placeholder="Cine invită..."
                    className="text-pink-400 uppercase tracking-[0.25em] text-[10px] font-sans font-bold" />
                )}

                {isBaptism ? (
                  <InlineEdit tag="h1" editMode={editMode} value={p.partner1Name || ''}
                    onChange={v => upProfile('partner1Name', v)} placeholder="Prenume"
                    textKey="hero:partner1" textLabel="Partener 1"
                    className="block text-5xl md:text-6xl text-rose-800 leading-tight"
                    style={{ fontFamily: 'Georgia, Palatino, serif' } as any} />
                ) : (
                  <div className="flex flex-col items-center gap-1" style={{ fontFamily: 'Georgia, Palatino, serif' }}>
                    <InlineEdit tag="span" editMode={editMode} value={p.partner1Name || ''}
                      onChange={v => upProfile('partner1Name', v)} placeholder="Ea"
                      textKey="hero:partner1" textLabel="Partener 1"
                      className="block text-5xl md:text-6xl text-rose-800 leading-tight text-center break-words w-full" />
                    <span className="text-pink-300 italic text-4xl leading-none">&</span>
                    <InlineEdit tag="span" editMode={editMode} value={p.partner2Name || ''}
                      onChange={v => upProfile('partner2Name', v)} placeholder="El"
                      textKey="hero:partner2" textLabel="Partener 2"
                      className="block text-5xl md:text-6xl text-rose-800 leading-tight text-center break-words w-full" />
                  </div>
                )}

                {p.showCelebrationText && (
                  <p className="text-base italic text-pink-500 font-serif">
                    <InlineEdit tag="span" editMode={editMode} value={invitationLeadText}
                      onChange={v => upProfile('invitationLeadText', v)}
                      placeholder="Text invitatie..."
                      textKey="hero:intro-invite-lead"
                      textLabel="Intro text 1" />{' '}
                    <InlineEdit tag="span" editMode={editMode} value={celebrationText}
                      onChange={v => upProfile('celebrationText', v)}
                      placeholder="descriere eveniment..."
                      textKey="hero:intro-celebration"
                      textLabel="Intro text 2" />
                  </p>
                )}
              </div>
              </BlockStyleProvider>

              <RoseDivider />

              {/* ── GUEST BADGE ── */}
              <div className="mx-auto max-w-xs rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 py-4 px-6 shadow-sm">
                <p className="font-bold text-lg text-rose-800">{guest?.name || 'Nume Invitat'}</p>
                <p className="text-[10px] text-pink-400 uppercase tracking-widest mt-1 font-sans">invitat de onoare</p>
              </div>
              
              {/* ── DATE ── */}
              <div className="flex flex-col items-center gap-2 font-sans">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-pink-400" />
                </div>
                {editMode ? (
                  <input type="date"
                    value={p.weddingDate ? new Date(p.weddingDate).toISOString().split('T')[0] : ''}
                    onChange={e => upProfile('weddingDate', e.target.value)}
                    className="font-bold uppercase tracking-widest text-rose-700 bg-transparent border-b-2 border-pink-200 hover:border-pink-400 focus:border-rose-500 text-center outline-none cursor-pointer transition-colors text-sm py-1" />
                ) : (
                  <p className="font-bold uppercase tracking-widest text-rose-700 text-sm">
                    {p.weddingDate
                      ? new Date(p.weddingDate).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Data Evenimentului'}
                  </p>
                )}
              </div>

              {/* ── COUNTDOWN ── */}
              {p.showCountdown && p.weddingDate && !countdown.expired && (
                <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 py-6 px-4">
                  <InlineEdit
                    tag="p"
                    editMode={editMode}
                    value={heroCountdownText}
                    onChange={v => upProfile('heroCountdownText', v)}
                    placeholder="Titlu countdown..."
                    textKey="hero:countdown-title"
                    textLabel="Hero countdown title"
                    className="text-[9px] uppercase tracking-widest text-pink-400 font-bold font-sans mb-4"
                  />
                  <div className="flex justify-center gap-4">
                    <CUnit value={countdown.days}    label="Zile" />
                    <CUnit value={countdown.hours}   label="Ore" />
                    <CUnit value={countdown.minutes} label="Min" />
                    <CUnit value={countdown.seconds} label="Sec" />
                  </div>
                </div>
              )}

              {/* ── BLOCURI ── */}
              {editMode && (
                <InsertBlockButton
                  insertIdx={-1}
                  openInsertAt={openInsertAt}
                  setOpenInsertAt={setOpenInsertAt}
                  blockTypes={BLOCK_TYPES}
                  onInsert={(type, def) => handleInsertAt(-1, type, def)}
                />
              )}
              {displayBlocks.map((block, idx) => {
                const isVisible = block.show !== false;
                const realIdx   = blocks.indexOf(block);

                return (
                  <div key={block.id} className="group/insert">
                  <div className={cn("relative group/block", !isVisible && editMode && "opacity-35")}
                    onClick={editMode ? () => onBlockSelect?.(block, realIdx) : undefined}>
                    {editMode && (
                      <BlockToolbar
                        onUp={() => movBlock(realIdx, -1)} onDown={() => movBlock(realIdx, 1)}
                        onToggle={() => updBlock(realIdx, { show: !isVisible })} onDelete={() => delBlock(realIdx)}
                        visible={isVisible} isFirst={realIdx === 0} isLast={realIdx === blocks.length - 1}
                      />
                    )}
                    {editMode && <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover/block:ring-pink-200 transition-all pointer-events-none" />}

                    <BlockStyleProvider value={{
                      blockId: block.id,
                      textStyles: block.textStyles,
                      onTextSelect: (textKey, textLabel) => onBlockSelect?.(block, realIdx, textKey, textLabel),
                      fontFamily: block.blockFontFamily,
                      fontSize: block.blockFontSize,
                      fontWeight: block.blockFontWeight,
                      fontStyle: block.blockFontStyle,
                      letterSpacing: block.blockLetterSpacing,
                      lineHeight: block.blockLineHeight,
                      textColor: block.textColor && block.textColor !== 'transparent' ? block.textColor : undefined,
                      textAlign: block.blockAlign,
                    } as BlockStyle}>

                    {/* LOCAȚIE */}
                    {block.type === 'location' && (
                      <div className={cn("rounded-2xl border border-pink-100 bg-white/80 shadow-sm overflow-hidden", editMode && "hover:shadow-md transition-all")}>
                        <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200" />
                        <div className="p-5 space-y-4 text-sm font-sans">
                          <div className="flex items-center justify-between gap-3">
                            <InlineEdit tag="p" editMode={editMode} value={block.label || ''}
                              onChange={v => updBlock(realIdx, { label: v })} placeholder="Titlu locație..."
                              textKey={`${block.id}:location-label`} textLabel="Locatie · Label"
                              className="font-bold uppercase text-[10px] text-pink-400 tracking-widest" />
                            <div className="inline-flex items-center gap-1.5 bg-pink-50 border border-pink-100 rounded-full px-2.5 py-1">
                              <Clock className="w-3 h-3 text-pink-400" />
                              <InlineTime value={block.time || ''} onChange={v => updBlock(realIdx, { time: v })} editMode={editMode}
                                textKey={`${block.id}:location-time`} textLabel="Locatie · Ora"
                                className="font-bold text-[11px] text-rose-800" />
                            </div>
                          </div>
                          <InlineEdit tag="p" editMode={editMode} value={block.locationName || ''}
                            onChange={v => updBlock(realIdx, { locationName: v })} placeholder="Numele locației..."
                            textKey={`${block.id}:location-name`} textLabel="Locatie · Nume"
                            className="text-lg font-semibold text-rose-700" />
                          <InlineEdit tag="p" editMode={editMode} value={block.locationAddress || ''}
                            onChange={v => updBlock(realIdx, { locationAddress: v })} placeholder="Adresă..."
                            textKey={`${block.id}:location-address`} textLabel="Locatie · Adresa"
                            className="text-xs text-rose-400 italic leading-snug" />
                          <InlineWaze value={block.wazeLink || ''} onChange={v => updBlock(realIdx, { wazeLink: v })} editMode={editMode} />
                        </div>
                      </div>
                    )}

                    {/* NAȘI */}
                    {block.type === 'godparents' && (
                      <div className={cn("rounded-2xl border border-pink-100 bg-white/80 shadow-sm overflow-hidden", editMode && "hover:shadow-md transition-all")}>
                        <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200" />
                        <div className="p-5 space-y-3 font-sans text-sm">
                          <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Nașii Noștri'}
                            onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                            textKey={`${block.id}:godparents-title`} textLabel="Nasi · Titlu"
                            className="text-[10px] font-bold uppercase text-pink-400 tracking-widest" />
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                            onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..."
                            textKey={`${block.id}:godparents-content`} textLabel="Nasi · Text"
                            className="text-sm italic text-rose-500 font-serif" multiline />
                          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            {godparents.map((g: any, i: number) => (
                              <div key={i} className={cn("text-sm italic text-rose-700 flex items-center gap-1.5", editMode && "group/gp relative")}>
                                <InlineEdit tag="span" editMode={editMode} value={g.godfather || ''} onChange={v => updGodparent(i, 'godfather', v)} placeholder="Naș"
                                  textKey={`${block.id}:godparent-${i}-godfather`} textLabel={`Nasi · Nas ${i + 1}`} />
                                <span className="text-pink-300">&</span>
                                <InlineEdit tag="span" editMode={editMode} value={g.godmother || ''} onChange={v => updGodparent(i, 'godmother', v)} placeholder="Nașă"
                                  textKey={`${block.id}:godparent-${i}-godmother`} textLabel={`Nasi · Nasa ${i + 1}`} />
                                {editMode && <button type="button" onClick={() => delGodparent(i)} className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400" /></button>}
                              </div>
                            ))}
                            {editMode && <button type="button" onClick={addGodparent} className="text-[10px] text-pink-300 hover:text-pink-500 border border-dashed border-pink-200 hover:border-pink-300 rounded-full px-2 py-0.5 flex items-center gap-1 transition-colors"><Plus className="w-2.5 h-2.5" /> adaugă</button>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PĂRINȚI */}
                    {block.type === 'parents' && (
                      <div className={cn("rounded-2xl border border-pink-100 bg-white/80 shadow-sm overflow-hidden", editMode && "hover:shadow-md transition-all")}>
                        <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200" />
                        <div className="p-5 space-y-3 font-sans text-sm">
                          <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Părinții Noștri'}
                            onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                            textKey={`${block.id}:parents-title`} textLabel="Parinti · Titlu"
                            className="text-[10px] font-bold uppercase text-pink-400 tracking-widest" />
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                            onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..."
                            textKey={`${block.id}:parents-content`} textLabel="Parinti · Text"
                            className="text-sm italic text-rose-500 font-serif" multiline />
                          <div className="flex flex-col items-center gap-1">
                            {([
                              { key: 'p1_father', ph: 'Tatăl Miresei' }, { key: 'p1_mother', ph: 'Mama Miresei' },
                              { key: 'p2_father', ph: 'Tatăl Mirelui' }, { key: 'p2_mother', ph: 'Mama Mirelui' },
                            ] as const).map(({ key, ph }) => {
                              const val = parentsData?.[key];
                              if (!val && !editMode) return null;
                              return <InlineEdit key={key} tag="p" editMode={editMode} value={val || ''}
                                onChange={v => updParent(key, v)} placeholder={ph}
                                textKey={`${block.id}:parent-${key}`} textLabel={`Parinti · ${ph}`}
                                className="text-sm italic text-rose-700" />;
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === 'photo' && (
                      <PhotoBlock
                        block={block}
                        editMode={editMode}
                        onUpdate={(patch) => updBlock(realIdx, patch)}
                        placeholderInitial1={p.partner1Name?.[0] || 'M'}
                      />
                    )}

                    {block.type === 'text' && (
                      <div className={cn(editMode && "rounded-2xl px-3 py-2 hover:bg-pink-50/40 transition-colors")}>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Scrieți un mesaj..."
                          textKey={`${block.id}:text-content`} textLabel="Text · Continut"
                          className="text-sm text-rose-600 italic leading-relaxed font-serif" multiline />
                      </div>
                    )}

                    {block.type === 'title' && (
                      <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                        onChange={v => updBlock(realIdx, { content: v })} placeholder="Titlu secțiune..."
                        textKey={`${block.id}:title-content`} textLabel="Titlu bloc"
                        className="text-[10px] font-bold uppercase text-pink-400 tracking-widest font-sans" />
                    )}

                    {block.type === 'description' && (
                      <div className={cn(editMode && "rounded-2xl px-3 py-2 hover:bg-pink-50/40 transition-colors")}>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Descriere..."
                          textKey={`${block.id}:description-content`} textLabel="Descriere bloc"
                          className="text-sm text-rose-600 italic leading-relaxed font-serif" multiline />
                      </div>
                    )}

                    {block.type === 'date' && (
                      <div style={{ textAlign: "center", padding: "4px 0" }}>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || dateStr}
                          onChange={v => updBlock(realIdx, { content: v })}
                          textKey={`${block.id}:date-content`} textLabel="Data bloc"
                          className="text-[11px] font-bold uppercase tracking-[0.25em] text-rose-700 font-sans" />
                      </div>
                    )}

                    {block.type === 'calendar' && (
                      <div className="rounded-2xl border border-pink-100 bg-white/80 shadow-sm p-4">
                        <CalendarMonth date={p.weddingDate} />
                      </div>
                    )}

                    {block.type === 'countdown' && (
                      <div className="rounded-2xl border border-pink-100 bg-white/80 shadow-sm p-4">
                        <FlipClock
                          targetDate={p.weddingDate}
                          bgColor={T.PINK_DARK}
                          textColor="white"
                          accentColor={T.PINK_L}
                          labelColor="rgba(255,255,255,0.75)"
                          editMode={editMode}
                          titleText={block.countdownTitle || "Timp ramas pana la marele eveniment"}
                          onTitleChange={text => updBlock(realIdx, { countdownTitle: text })}
                          titleTextKey={`${block.id}:countdown-title`}
                          titleTextLabel="Countdown · Titlu"
                        />
                      </div>
                    )}

                    {block.type === 'music' && (
                      <MusicBlock block={block} editMode={editMode} onUpdate={patch => updBlock(realIdx, patch)} />
                    )}

                    {block.type === 'gift' && (
                      <div className="rounded-2xl border border-pink-100 bg-white/80 shadow-sm p-5 text-center">
                        <Gift className="w-7 h-7 mx-auto mb-3" style={{ color: T.PINK_DARK, opacity: 0.75 }} />
                        <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle || "Sugestie cadou"}
                          onChange={v => updBlock(realIdx, { sectionTitle: v })}
                          textKey={`${block.id}:gift-title`} textLabel="Cadou · Titlu"
                          className="text-xl text-rose-700 mb-2" style={{ fontFamily: "Georgia, serif" }} />
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ""}
                          onChange={v => updBlock(realIdx, { content: v })}
                          textKey={`${block.id}:gift-content`} textLabel="Cadou · Text"
                          className="text-sm text-rose-500 italic mb-2" multiline />
                        {(block.iban || editMode) && (
                          <InlineEdit tag="p" editMode={editMode} value={block.iban || ""} onChange={v => updBlock(realIdx, { iban: v })}
                            textKey={`${block.id}:gift-iban`} textLabel="Cadou · IBAN"
                            placeholder="IBAN..." className="text-xs font-bold text-rose-700 mb-1" style={{ fontFamily: "Montserrat, sans-serif" }} />
                        )}
                        {(block.ibanName || editMode) && (
                          <InlineEdit tag="p" editMode={editMode} value={block.ibanName || ""} onChange={v => updBlock(realIdx, { ibanName: v })}
                            textKey={`${block.id}:gift-iban-name`} textLabel="Cadou · Beneficiar"
                            placeholder="Beneficiar..." className="text-xs text-rose-500" style={{ fontFamily: "Montserrat, sans-serif" }} />
                        )}
                      </div>
                    )}

                    {block.type === 'whatsapp' && (
                      <div className="rounded-2xl border border-pink-100 bg-white/80 shadow-sm p-5 text-center">
                        <a
                          href={`https://wa.me/${(block.content || "").replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-white text-[11px] font-bold uppercase tracking-[0.2em]"
                          style={{ background: `linear-gradient(135deg, ${T.PINK_D}, ${T.PINK_DARK})` }}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <InlineEdit tag="span" editMode={editMode} value={block.label || "Contact WhatsApp"} onChange={v => updBlock(realIdx, { label: v })}
                            textKey={`${block.id}:whatsapp-label`} textLabel="WhatsApp · Label" />
                        </a>
                        {editMode && (
                          <div className="mt-2">
                            <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(realIdx, { content: v })}
                              textKey={`${block.id}:whatsapp-number`} textLabel="WhatsApp · Numar"
                              placeholder="Numar..." className="text-xs text-rose-600" style={{ fontFamily: "Montserrat, sans-serif" }} />
                          </div>
                        )}
                      </div>
                    )}

                    {block.type === 'rsvp' && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => { if (!editMode) onOpenRSVP?.(); }}
                          className="rounded-full px-8 py-3 text-white uppercase text-[10px] font-bold tracking-[0.3em] shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${T.PINK_D}, ${T.PINK_DARK})` }}
                        >
                          <InlineEdit tag="span" editMode={editMode} value={block.label || "Confirma Prezenta"} onChange={v => updBlock(realIdx, { label: v })}
                            textKey={`${block.id}:rsvp-label`} textLabel="RSVP · Label" />
                        </button>
                      </div>
                    )}

                    {block.type === 'family' && (() => {
                      const members: { name1: string; name2: string }[] = (() => {
                        try { return JSON.parse(block.members || "[]"); } catch { return []; }
                      })();
                      const updateMembers = (newMembers: { name1: string; name2: string }[]) => {
                        updBlock(realIdx, { members: JSON.stringify(newMembers) } as any);
                      };
                      return (
                        <div className="rounded-2xl border border-pink-100 bg-white/80 shadow-sm p-5 text-center">
                          <InlineEdit tag="p" editMode={editMode} value={block.label || "Familie"}
                            onChange={v => updBlock(realIdx, { label: v })}
                            textKey={`${block.id}:family-label`} textLabel="Familie · Titlu"
                            className="text-[10px] font-bold uppercase text-pink-400 tracking-widest mb-2" />
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ""}
                            onChange={v => updBlock(realIdx, { content: v })}
                            textKey={`${block.id}:family-content`} textLabel="Familie · Text"
                            className="text-sm text-rose-500 italic mb-3" multiline />
                          <div className="flex flex-col items-center gap-2">
                            {members.map((m, mi) => (
                              <div key={mi} className="flex items-center justify-center gap-2 flex-wrap">
                                <InlineEdit tag="span" editMode={editMode} value={m.name1}
                                  onChange={v => { const nm=[...members]; nm[mi] = { ...nm[mi], name1: v }; updateMembers(nm); }}
                                  textKey={`${block.id}:family-member-${mi}-1`} textLabel={`Familie · Nume ${mi + 1}.1`}
                                  className="text-lg text-rose-700" style={{ fontFamily: "Georgia, serif" }} />
                                <span className="text-pink-300">&amp;</span>
                                <InlineEdit tag="span" editMode={editMode} value={m.name2}
                                  onChange={v => { const nm=[...members]; nm[mi] = { ...nm[mi], name2: v }; updateMembers(nm); }}
                                  textKey={`${block.id}:family-member-${mi}-2`} textLabel={`Familie · Nume ${mi + 1}.2`}
                                  className="text-lg text-rose-700" style={{ fontFamily: "Georgia, serif" }} />
                                {editMode && members.length > 1 && (
                                  <button type="button" onClick={() => updateMembers(members.filter((_, i) => i !== mi))}
                                    className="text-red-400 hover:text-red-500 text-sm">x</button>
                                )}
                              </div>
                            ))}
                          </div>
                          {editMode && (
                            <button type="button" onClick={() => updateMembers([...members, { name1: "Nume 1", name2: "Nume 2" }])}
                              className="mt-3 text-[10px] uppercase tracking-[0.2em] font-bold border border-dashed rounded-full px-3 py-1"
                              style={{ borderColor: T.PINK_L, color: T.PINK_DARK }}>
                              + Adauga
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {block.type === 'divider' && <RoseDivider />}
                    {block.type === 'spacer'  && <div className="h-4" />}
                    </BlockStyleProvider>
                  </div>
                  {editMode && (
                    <InsertBlockButton
                      insertIdx={realIdx}
                      openInsertAt={openInsertAt}
                      setOpenInsertAt={setOpenInsertAt}
                      blockTypes={BLOCK_TYPES}
                      onInsert={(type, def) => handleInsertAt(realIdx, type, def)}
                    />
                  )}
                  </div>
                );
              })}

              {/* Add block strip */}
              {false && editMode && (
                <div className="border-2 border-dashed border-pink-100 hover:border-pink-200 rounded-2xl py-4 transition-colors">
                  <p className="text-[9px] text-pink-300 uppercase tracking-widest mb-2.5 font-sans">Adaugă bloc</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { type:'location', label:'Locație', def: { label:'', time:'', locationName:'', locationAddress:'', wazeLink:'' } },
                      { type:'text',     label:'Text',    def: { content:'' } },
                      { type:'title',    label:'Titlu',   def: { content:'' } },
                      { type:'photo',    label:'Foto',    def: { imageData: undefined, altText: '', aspectRatio: '3:4', photoClip: 'arch', photoMasks: ['fade-b'] } },
                      { type:'divider',  label:'Linie',   def: {} },
                    ].map(({ type, label, def }) => (
                      <button key={type} type="button" onClick={() => addBlock(type, def)}
                        className="px-3 py-1 text-[10px] font-bold border border-pink-200 hover:border-pink-300 rounded-full text-pink-400 hover:text-rose-600 hover:bg-pink-50 transition-all font-sans">
                        + {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CRONOLOGIE ── */}
              {p.showTimeline && timeline.length > 0 && (
                <BlockStyleProvider value={{
                  blockId: "__timeline__",
                  textStyles: (profile as any).timelineTextStyles,
                  onTextSelect: (textKey, textLabel) => onBlockSelect?.(
                    { id: "__timeline__", type: "timeline" as any, show: true, textStyles: (profile as any).timelineTextStyles } as any,
                    -1,
                    textKey,
                    textLabel
                  ),
                }}>
                <div className="space-y-3 font-sans">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.PINK_D }}>Programul Zilei</p>
                  <div className="space-y-2 max-w-xs mx-auto">
                    {timeline.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                        <InlineEdit tag="span" editMode={editMode} value={item.time || ''} onChange={v => updateTimelineItem(item.id, { time: v })} textKey={`timeline:${item.id}:time`} textLabel="Timeline · Ora" className="font-bold tabular-nums shrink-0" style={{ color: T.PINK_D }} />
                        <div className="flex-1 h-px" style={{ background: T.PINK_L }} />
                        <InlineEdit tag="span" editMode={editMode} value={item.title || ''} onChange={v => updateTimelineItem(item.id, { title: v })} textKey={`timeline:${item.id}:title`} textLabel="Timeline · Titlu" className="font-medium text-right" style={{ color: T.PINK_DARK }} />
                      </div>
                    ))}
                  </div>
                </div>
                </BlockStyleProvider>
              )}

              <RoseDivider />

              {/* RSVP */}
              {showRsvp && !hasRsvpBlock && (
                <div>
                  {editMode ? (
                    <div className="inline-block rounded-full px-10 py-3 font-sans"
                      style={{ background: `linear-gradient(135deg, ${T.PINK_D}, ${T.PINK_DARK})` }}>
                      <InlineEdit tag="span" editMode={editMode} value={rsvpText}
                        onChange={v => upProfile('rsvpButtonText', v)}
                        className="text-white uppercase text-[10px] font-bold tracking-[0.3em] cursor-text" />
                    </div>
                  ) : (
                    <button onClick={() => onOpenRSVP && onOpenRSVP()}
                      className="rounded-full px-10 py-3 text-white uppercase text-[10px] font-bold tracking-[0.3em] shadow-lg shadow-pink-300/40 hover:shadow-pink-400/50 hover:scale-105 transition-all duration-200 font-sans"
                      style={{ background: `linear-gradient(135deg, ${T.PINK_D}, ${T.PINK_DARK})` }}>
                      {rsvpText}
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Bottom gradient bar */}
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${T.PINK_L}, ${T.PINK_D}, ${T.PINK_DARK}, ${T.PINK_D}, ${T.PINK_L})` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyalRoseTemplate;
