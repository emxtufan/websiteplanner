import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus, Navigation } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";

export const meta: TemplateMeta = {
  id: 'velum',
  name: 'Velum',
  category: 'wedding',
  description: 'Plic sigilat cu ceară — animație 3D de deschidere, tipografie editorial ivory & gold.',
  colors: ['#f7f3ec', '#ede8dc', '#c9a84c'],
  previewClass: "bg-amber-50 border-yellow-600",
  elementsClass: "bg-yellow-700",
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const SERIF   = "'Cormorant Garamond','Playfair Display',Georgia,serif";
const SANS    = "'DM Sans','Helvetica Neue',system-ui,sans-serif";
const IVORY   = '#f7f3ec';
const ENV_BG  = '#ede8dc';
const ENV_MID = '#e4ddd0';
const ENV_DRK = '#d8d0c0';
const TEXT    = '#2a2118';
const MUTED   = '#9a8a7a';
const GOLD    = '#c9a84c';
const GOLD_D  = '#a07828';

// ─── Wax seal SVG ─────────────────────────────────────────────────────────────
const WaxSeal: React.FC<{ size?: number; cracked?: boolean }> = ({ size = 88, cracked = false }) => {
  const r = size / 2;
  // Laurel wreath paths (simplified)
  const leafPairs = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * 360 - 90;
    const rad   = (angle * Math.PI) / 180;
    const dist  = r * 0.62;
    const x = r + Math.cos(rad) * dist;
    const y = r + Math.sin(rad) * dist;
    return { x, y, angle };
  });

  // Crack lines paths (radiating from center)
  const cracks = [
    `M${r},${r} L${r - 14},${r - 18}`,
    `M${r},${r} L${r + 16},${r - 12}`,
    `M${r},${r} L${r + 12},${r + 17}`,
    `M${r},${r} L${r - 8},${r + 20}`,
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none"
      style={{ filter: 'drop-shadow(0 6px 18px rgba(160,120,40,0.38)) drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}>
      <defs>
        <radialGradient id="v-seal-grad" cx="38%" cy="32%" r="70%">
          <stop offset="0%"   stopColor="#e8c84a"/>
          <stop offset="40%"  stopColor="#c9a84c"/>
          <stop offset="75%"  stopColor="#a07828"/>
          <stop offset="100%" stopColor="#8a6418"/>
        </radialGradient>
        <radialGradient id="v-seal-shine" cx="35%" cy="28%" r="45%">
          <stop offset="0%"  stopColor="rgba(255,255,255,0.32)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>

      {/* Outer textured ring */}
      <circle cx={r} cy={r} r={r - 2} fill="url(#v-seal-grad)"/>

      {/* Shine */}
      <circle cx={r} cy={r} r={r - 2} fill="url(#v-seal-shine)"/>

      {/* Rope-like outer border */}
      {Array.from({ length: 36 }, (_, i) => {
        const a  = ((i / 36) * 360 * Math.PI) / 180;
        const a2 = (((i + 0.5) / 36) * 360 * Math.PI) / 180;
        const ro = r - 3, ri = r - 7;
        return (
          <path key={i}
            d={`M${r + Math.cos(a) * ri},${r + Math.sin(a) * ri} L${r + Math.cos(a) * ro},${r + Math.sin(a) * ro} L${r + Math.cos(a2) * ro},${r + Math.sin(a2) * ro}`}
            stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none"/>
        );
      })}

      {/* Inner circle */}
      <circle cx={r} cy={r} r={r * 0.7} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
      <circle cx={r} cy={r} r={r * 0.56} fill="rgba(0,0,0,0.08)"/>

      {/* Laurel leaves */}
      {leafPairs.map(({ x, y, angle }, i) => (
        <ellipse key={i} cx={x} cy={y} rx={3.5} ry={2}
          fill="rgba(255,255,255,0.22)"
          transform={`rotate(${angle + 90}, ${x}, ${y})`}/>
      ))}

      {/* Monogram area */}
      <circle cx={r} cy={r} r={r * 0.28} fill="rgba(0,0,0,0.12)"/>

      {/* Center dot */}
      <circle cx={r} cy={r} r={2.5} fill="rgba(255,255,255,0.5)"/>

      {/* Crack lines — animated */}
      {cracks.map((d, i) => (
        <path key={i} d={d}
          stroke="rgba(80,50,10,0.7)" strokeWidth="1.2" strokeLinecap="round"
          strokeDasharray="28" strokeDashoffset={cracked ? 0 : 28}
          style={{ transition: `stroke-dashoffset 0.28s ease-out ${i * 0.06}s` }}/>
      ))}
    </svg>
  );
};

// ─── Envelope fold decorations ────────────────────────────────────────────────
const EnvelopeFolds: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none"
    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    {/* Left triangle */}
    <polygon points={`0,0 0,${h} ${w * 0.48},${h * 0.52}`}
      fill={ENV_MID} opacity="0.6"/>
    {/* Right triangle */}
    <polygon points={`${w},0 ${w},${h} ${w * 0.52},${h * 0.52}`}
      fill={ENV_DRK} opacity="0.45"/>
    {/* Bottom triangle */}
    <polygon points={`0,${h} ${w},${h} ${w * 0.5},${h * 0.52}`}
      fill={ENV_MID} opacity="0.55"/>
    {/* Fold crease lines */}
    <line x1="0" y1="0" x2={w * 0.48} y2={h * 0.52}
      stroke={ENV_DRK} strokeWidth="0.8" opacity="0.5"/>
    <line x1={w} y1="0" x2={w * 0.52} y2={h * 0.52}
      stroke={ENV_DRK} strokeWidth="0.8" opacity="0.5"/>
    <line x1="0" y1={h} x2={w * 0.48} y2={h * 0.52}
      stroke={ENV_DRK} strokeWidth="0.7" opacity="0.4"/>
    <line x1={w} y1={h} x2={w * 0.52} y2={h * 0.52}
      stroke={ENV_DRK} strokeWidth="0.7" opacity="0.4"/>
  </svg>
);

// ─── Envelope + opening animation ─────────────────────────────────────────────
type EnvPhase = 'idle' | 'cracking' | 'opening' | 'rising' | 'done';

const EnvelopeScene: React.FC<{
  profile: any;
  onDone: () => void;
  editMode: boolean;
}> = ({ profile, onDone, editMode }) => {
  const [phase, setPhase] = useState<EnvPhase>('idle');
  const [flapZ, setFlapZ] = useState(6);
  const [interacted, setInteracted] = useState(false);

  const EW = Math.min(window.innerWidth - 48, 360);
  const EH = Math.round(EW * 1.38);

  const handleTap = () => {
    if (interacted || phase !== 'idle') return;
    setInteracted(true);

    // Haptic feedback on mobile
    if (navigator.vibrate) navigator.vibrate([8, 20, 8]);

    setPhase('cracking');
    setTimeout(() => {
      setPhase('opening');
      // when flap passes ~90deg, move it behind letter
      setTimeout(() => setFlapZ(1), 480);
    }, 320);
    setTimeout(() => setPhase('rising'),  900);
    setTimeout(() => {
      setPhase('done');
      setTimeout(onDone, 650);
    }, 1700);
  };

  const flapAngle = phase === 'opening' || phase === 'rising' || phase === 'done' ? -165 : 0;
  const sealCracked = phase === 'cracking' || phase === 'opening' || phase === 'rising' || phase === 'done';

  const letterY = phase === 'rising' || phase === 'done' ? -(EH * 0.38) : 20;
  const letterOpacity = phase === 'rising' || phase === 'done' ? 1 : 0;

  const envelopeScale = phase === 'done' ? 0.88 : 1;
  const envelopeOpacity = phase === 'done' ? 0 : 1;

  const name1 = profile.partner1Name || 'Sofia';
  const name2 = profile.partner2Name || 'Andrei';
  const isWedding = !profile.eventType || profile.eventType === 'wedding';
  const nameDisplay = isWedding ? `${name1} & ${name2}` : name1;
  const d = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const dateStr = d
    ? d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
    : 'DATA EVENIMENTULUI';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: IVORY,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: phase === 'idle' ? 'pointer' : 'default',
        overflow: 'hidden',
      }}
      onClick={handleTap}>

      <style>{`
        @keyframes velum-breathe {
          0%,100%{ transform:translateY(0px) }
          50%{ transform:translateY(-7px) }
        }
        @keyframes velum-seal-pulse {
          0%,100%{ filter:drop-shadow(0 5px 14px rgba(160,120,40,0.32)) drop-shadow(0 2px 4px rgba(0,0,0,0.1)) }
          50%{ filter:drop-shadow(0 8px 22px rgba(160,120,40,0.52)) drop-shadow(0 3px 6px rgba(0,0,0,0.14)) }
        }
        @keyframes velum-deschide {
          0%,100%{ opacity:0.38 }
          50%{ opacity:0.72 }
        }
        @keyframes velum-grain {
          0%,100%{ transform:translate(0,0) }
          10%{ transform:translate(-1px,1px) }
          20%{ transform:translate(1px,-1px) }
          30%{ transform:translate(-1px,0) }
          40%{ transform:translate(1px,1px) }
          50%{ transform:translate(0,-1px) }
          60%{ transform:translate(-1px,1px) }
          70%{ transform:translate(1px,0) }
          80%{ transform:translate(0,1px) }
          90%{ transform:translate(-1px,-1px) }
        }
      `}</style>

      {/* Paper grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.6,
        animation: 'velum-grain 0.5s steps(1) infinite',
      }}/>

      {/* Ambient gold glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 280, height: 180, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      {/* ── ENVELOPE WRAPPER ── */}
      <div style={{
        position: 'relative',
        width: EW, height: EH,
        transform: `scale(${envelopeScale})`,
        opacity: envelopeOpacity,
        transition: phase === 'done'
          ? 'transform 0.5s ease-in, opacity 0.5s ease-in'
          : phase === 'idle'
          ? 'none'
          : 'none',
        animation: phase === 'idle' ? 'velum-breathe 4s ease-in-out infinite' : 'none',
        userSelect: 'none',
      }}>

        {/* Envelope body */}
        <div style={{
          position: 'absolute', inset: 0,
          background: ENV_BG,
          borderRadius: 6,
          boxShadow: '0 20px 60px rgba(42,33,24,0.14), 0 6px 20px rgba(42,33,24,0.08), 0 2px 4px rgba(42,33,24,0.06)',
          overflow: 'hidden',
        }}>
          {/* Paper texture inside envelope */}
          <div style={{ position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(42,33,24,0.012) 28px, rgba(42,33,24,0.012) 29px)',
          }}/>
        </div>

        {/* Fold decorations */}
        <EnvelopeFolds w={EW} h={EH}/>

        {/* Inside envelope surface (visible when flap opens) */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: `linear-gradient(180deg, #f0ece3 0%, ${ENV_BG} 40%)`,
          borderRadius: 6,
          clipPath: `polygon(0 0, 100% 0, 50% ${EH * 0.48}px)`,
          opacity: phase === 'opening' || phase === 'rising' || phase === 'done' ? 1 : 0,
          transition: 'opacity 0.3s ease-in 0.4s',
        }}/>

        {/* Names + date printed on envelope (top area) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          zIndex: 3,
          paddingTop: EH * 0.1,
          textAlign: 'center',
          opacity: phase === 'rising' || phase === 'done' ? 0 : 1,
          transition: 'opacity 0.4s ease-in',
        }}>
          <p style={{
            fontFamily: SERIF, fontSize: EW * 0.098, fontWeight: 300,
            fontStyle: 'italic', color: TEXT, lineHeight: 1.15,
            margin: '0 20px',
            letterSpacing: '-0.01em',
          }}>
            {isWedding ? (
              <>
                <span style={{ display: 'block' }}>{name1}</span>
                <span style={{ fontFamily: SANS, fontSize: EW * 0.032, fontStyle: 'normal',
                  letterSpacing: '0.25em', color: GOLD, display: 'block', margin: '4px 0' }}>& </span>
                <span style={{ display: 'block' }}>{name2}</span>
              </>
            ) : nameDisplay}
          </p>
          <p style={{
            fontFamily: SANS, fontSize: EW * 0.028, fontWeight: 600,
            letterSpacing: '0.35em', color: MUTED, marginTop: EH * 0.028,
            textTransform: 'uppercase',
          }}>{dateStr}</p>
        </div>

        {/* ── ANIMATED FLAP ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: EH * 0.52,
          clipPath: `polygon(0 0, 100% 0, 50% 80%)`,
          background: `linear-gradient(170deg, ${ENV_BG} 0%, ${ENV_MID} 70%, ${ENV_DRK} 100%)`,
          transformOrigin: '50% 0%',
          transform: `perspective(${EW * 2}px) rotateX(${flapAngle}deg)`,
          transition: flapAngle !== 0
            ? 'transform 0.9s cubic-bezier(0.6, 0, 0.4, 1)'
            : 'none',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          zIndex: flapZ,
          boxShadow: flapAngle === 0 ? '0 4px 12px rgba(42,33,24,0.06)' : 'none',
        }}>
          {/* Subtle texture on flap */}
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }}/>
        </div>

        {/* Wax seal */}
        <div style={{
          position: 'absolute',
          left: '50%', top: EH * 0.445,
          transform: 'translateX(-50%) translateY(-50%)',
          zIndex: 7,
          animation: phase === 'idle' ? 'velum-seal-pulse 3.5s ease-in-out infinite' : 'none',
          transition: phase === 'cracking' ? 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
          pointerEvents: 'none',
        }}>
          <WaxSeal size={EW * 0.24} cracked={sealCracked}/>
        </div>

        {/* DESCHIDE text */}
        <div style={{
          position: 'absolute', bottom: EH * 0.12,
          left: 0, right: 0, textAlign: 'center', zIndex: 8,
          opacity: phase === 'idle' ? 1 : 0,
          transition: 'opacity 0.3s',
          animation: phase === 'idle' ? 'velum-deschide 2.8s ease-in-out infinite' : 'none',
          pointerEvents: 'none',
        }}>
          {/* Hand/cursor SVG */}
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none" style={{ display: 'block', margin: '0 auto 8px' }}>
            <path d="M7 12V4.5a1.5 1.5 0 013 0V10M10 10v-1.5a1.5 1.5 0 013 0V10M13 10v-1a1.5 1.5 0 013 0v5c0 4.4-3.6 8-8 8a6 6 0 01-6-6v-3.5a1.5 1.5 0 013 0V12"
              stroke={MUTED} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700,
            letterSpacing: '0.48em', color: MUTED, textTransform: 'uppercase', margin: 0 }}>
            Deschide
          </p>
        </div>
      </div>

      {/* ── LETTER RISING ── */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translateX(-50%) translateY(calc(-50% + ${letterY}px))`,
        width: EW - 24,
        zIndex: 5,
        opacity: letterOpacity,
        transition: 'transform 0.75s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease-out',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: IVORY,
          borderRadius: 4,
          padding: '32px 28px 28px',
          boxShadow: '0 12px 40px rgba(42,33,24,0.18), 0 4px 12px rgba(42,33,24,0.1)',
          textAlign: 'center',
          filter: letterOpacity < 1 ? 'blur(4px)' : 'blur(0px)',
          transition: 'filter 0.4s ease-out',
        }}>
          {/* Top gold line */}
          <div style={{ width: 32, height: 1, background: GOLD, margin: '0 auto 20px' }}/>
          <p style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 300, fontStyle: 'italic',
            color: TEXT, margin: '0 0 8px', lineHeight: 1.2 }}>
            {isWedding ? `${name1} & ${name2}` : name1}
          </p>
          <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 600, letterSpacing: '0.4em',
            color: GOLD, textTransform: 'uppercase', margin: 0 }}>{dateStr}</p>
          <div style={{ width: 32, height: 1, background: GOLD, margin: '20px auto 0' }}/>
        </div>
      </div>
    </div>
  );
};

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return { days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000),
      minutes: Math.floor((diff%3600000)/60000), seconds: Math.floor((diff%60000)/1000), expired: false };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal(delay = 0) {
  const ref  = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVis(true), delay); obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

// ─── Gold divider ─────────────────────────────────────────────────────────────
const GoldDivider: React.FC<{ wide?: boolean }> = ({ wide }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '2px 0' }}>
    <div style={{ flex: 1, height: 0.6,
      background: `linear-gradient(to right, transparent, ${GOLD}55)` }}/>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="10" y="2" width="11.3" height="11.3" rx="0.5" fill={GOLD} opacity="0.8" transform="rotate(45 10 10)"/>
      <rect x="10" y="5" width="7" height="7" rx="0.3" fill={GOLD} opacity="0.4" transform="rotate(45 10 10)"/>
    </svg>
    <div style={{ flex: 1, height: 0.6,
      background: `linear-gradient(to left, transparent, ${GOLD}55)` }}/>
  </div>
);

// ─── Block toolbar ────────────────────────────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-3.5 right-2 flex items-center gap-0.5 rounded-full border shadow-lg px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto"
    style={{ background: IVORY, borderColor: `${GOLD}44` }}>
    <button type="button" onClick={e => { e.stopPropagation(); onUp(); }} disabled={isFirst} className="p-0.5 rounded-full disabled:opacity-20 transition-opacity"><ChevronUp className="w-3 h-3" style={{ color: GOLD }}/></button>
    <button type="button" onClick={e => { e.stopPropagation(); onDown(); }} disabled={isLast} className="p-0.5 rounded-full disabled:opacity-20 transition-opacity"><ChevronDown className="w-3 h-3" style={{ color: GOLD }}/></button>
    <div className="w-px h-3 mx-0.5" style={{ background: `${GOLD}44` }}/>
    <button type="button" onClick={e => { e.stopPropagation(); onToggle(); }} className="p-0.5 rounded-full transition-opacity">
      {visible ? <Eye className="w-3 h-3" style={{ color: GOLD }}/> : <EyeOff className="w-3 h-3" style={{ color: MUTED }}/>}
    </button>
    <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }} className="p-0.5 rounded-full hover:bg-red-50 transition-colors"><Trash2 className="w-3 h-3 text-red-400"/></button>
  </div>
);

// ─── Location card ────────────────────────────────────────────────────────────
const LocCard: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void; idx?: number }> =
  ({ block, editMode, onUpdate, idx = 0 }) => {
  const { ref, vis } = useReveal(idx * 80);
  return (
    <div ref={ref} style={{
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(8px)',
      border: `1px solid rgba(201,168,76,0.2)`,
      borderRadius: 2,
      padding: '20px 24px',
      boxShadow: '0 2px 16px rgba(42,33,24,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
      position: 'relative', overflow: 'hidden',
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Gold top accent */}
      <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 1,
        background: `linear-gradient(to right, transparent, ${GOLD}66, transparent)` }}/>

      <InlineEdit tag="p" editMode={editMode} value={block.label || ''} onChange={v => onUpdate({ label: v })}
        placeholder="Eveniment..."
        style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.45em',
          textTransform: 'uppercase', color: `${GOLD}cc`, margin: '0 0 14px', display: 'block' }}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1px 1fr', gap: '0 20px', alignItems: 'start' }}>
        <div>
          <InlineTime value={block.time || ''} onChange={v => onUpdate({ time: v })} editMode={editMode}
            style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 300, color: TEXT, display: 'block', lineHeight: 1 }}/>
          <p style={{ fontFamily: SANS, fontSize: 8, color: MUTED, margin: '3px 0 0' }}>ora</p>
        </div>
        <div style={{ background: `${GOLD}30`, alignSelf: 'stretch', marginTop: 2 }}/>
        <div>
          <InlineEdit tag="p" editMode={editMode} value={block.locationName || ''} onChange={v => onUpdate({ locationName: v })}
            placeholder="Locație..."
            style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: TEXT, margin: '0 0 3px', lineHeight: 1.35 }}/>
          <InlineEdit tag="p" editMode={editMode} value={block.locationAddress || ''} onChange={v => onUpdate({ locationAddress: v })}
            placeholder="Adresă..." multiline
            style={{ fontFamily: SANS, fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.5 }}/>
        </div>
      </div>
      {(block.wazeLink || editMode) && (
        <div style={{ marginTop: 12 }}>
          <InlineWaze value={block.wazeLink || ''} onChange={v => onUpdate({ wazeLink: v })} editMode={editMode}/>
        </div>
      )}
    </div>
  );
};

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const { ref, vis } = useReveal(delay);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
};

// ─── Glass card ───────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'rgba(255,255,255,0.65)',
    backdropFilter: 'blur(8px)',
    border: `1px solid rgba(201,168,76,0.18)`,
    borderRadius: 2,
    padding: '20px 24px',
    boxShadow: '0 2px 16px rgba(42,33,24,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
    ...style,
  }}>{children}</div>
);

// ─── Main Template ─────────────────────────────────────────────────────────────
export type VelumProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const VelumTemplate: React.FC<VelumProps> = ({
  data, onOpenRSVP, editMode = false, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId,
}) => {
  const { profile, guest } = data;
  const [showEnvelope, setShowEnvelope] = useState(!editMode);
  const [contentVis,   setContentVis]   = useState(editMode);

  useEffect(() => {
    if (editMode) { setShowEnvelope(false); setContentVis(true); }
    else          { setShowEnvelope(true);  setContentVis(false); }
  }, [editMode]);

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const [blocks, setBlocks]         = useState<InvitationBlock[]>(() => safeJSON(profile.customSections, []));
  const [godparents, setGodparents] = useState<any[]>(() => safeJSON(profile.godparents, []));
  const [parentsData, setParentsData] = useState<any>(() => safeJSON(profile.parents, {}));

  useEffect(() => { setBlocks(safeJSON(profile.customSections, [])); }, [profile.customSections]);
  useEffect(() => { setGodparents(safeJSON(profile.godparents, [])); }, [profile.godparents]);
  useEffect(() => { setParentsData(safeJSON(profile.parents, {})); }, [profile.parents]);

  const timeline: any[] = safeJSON(profile.timeline, []);
  const countdown = useCountdown(profile.weddingDate || '');

  // Debounced updates
  const _pq = useRef<Record<string, any>>({});
  const _pt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const _bt = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upProfile = useCallback((field: string, value: any) => {
    _pq.current = { ..._pq.current, [field]: value };
    if (_pt.current) clearTimeout(_pt.current);
    _pt.current = setTimeout(() => { onProfileUpdate?.(_pq.current); _pq.current = {}; }, 500);
  }, [onProfileUpdate]);

  const debBlocks = useCallback((nb: InvitationBlock[]) => {
    if (_bt.current) clearTimeout(_bt.current);
    _bt.current = setTimeout(() => onBlocksUpdate?.(nb), 500);
  }, [onBlocksUpdate]);

  const updBlock = useCallback((idx: number, patch: Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb = prev.map((b, i) => i === idx ? { ...b, ...patch } : b); debBlocks(nb); return nb; });
  }, [debBlocks]);

  const movBlock = useCallback((idx: number, dir: -1 | 1) => {
    setBlocks(prev => { const nb = [...prev]; const to = idx + dir; if (to < 0 || to >= nb.length) return prev; [nb[idx], nb[to]] = [nb[to], nb[idx]]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const delBlock = useCallback((idx: number) => {
    setBlocks(prev => { const nb = prev.filter((_, i) => i !== idx); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const addBlock = useCallback((type: string, def: any) => {
    setBlocks(prev => { const nb = [...prev, { id: Date.now().toString(), type: type as any, show: true, ...def }]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const updGodparent = (i: number, f: 'godfather' | 'godmother', v: string) => {
    setGodparents(prev => { const ng = prev.map((g, j) => j === i ? { ...g, [f]: v } : g); upProfile('godparents', JSON.stringify(ng)); return ng; });
  };
  const addGodparent = () => setGodparents(prev => { const ng = [...prev, { godfather: '', godmother: '' }]; upProfile('godparents', JSON.stringify(ng)); return ng; });
  const delGodparent = (i: number) => setGodparents(prev => { const ng = prev.filter((_, j) => j !== i); upProfile('godparents', JSON.stringify(ng)); return ng; });
  const updParent = (field: string, val: string) => setParentsData((prev: any) => { const np = { ...prev, [field]: val }; upProfile('parents', JSON.stringify(np)); return np; });

  const welcomeText     = profile.welcomeText?.trim()     || 'Împreună cu familiile noastre';
  const celebrationText = profile.celebrationText?.trim() || 'vă invităm să împărtășiți cu noi';
  const rsvpText        = profile.rsvpButtonText?.trim()  || 'Confirmă Prezența';
  const showRsvp        = profile.showRsvpButton !== false;
  const isBaptism       = profile.eventType === 'baptism' || profile.eventType === 'kids';
  const displayBlocks   = editMode ? blocks : blocks.filter(b => b.show !== false);

  const name1 = profile.partner1Name || 'Sofia';
  const name2 = profile.partner2Name || 'Andrei';
  const d     = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const dateStr = d
    ? d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Data Evenimentului';

  const sep = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', paddingBottom: 20, flexShrink: 0 }}>
      <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${GOLD}66` }}/>
      <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${GOLD}66` }}/>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes velum-name-reveal {
          from { opacity:0; filter:blur(10px); transform:translateY(8px) }
          to   { opacity:1; filter:blur(0px);  transform:translateY(0) }
        }
        @keyframes velum-line-grow {
          from { width:0; opacity:0 }
          to   { width:40px; opacity:1 }
        }
        @keyframes velum-date-in {
          from { opacity:0; letter-spacing:0.6em }
          to   { opacity:1; letter-spacing:0.38em }
        }
        @keyframes velum-cd-pulse {
          0%,100%{ transform:scale(1);opacity:.7 }
          50%{ transform:scale(1.6);opacity:1 }
        }
      `}</style>

      {/* Envelope opening scene */}
      {showEnvelope && (
        <EnvelopeScene profile={profile} editMode={editMode}
          onDone={() => { setShowEnvelope(false); setContentVis(true); }}/>
      )}

      {/* ── FULL INVITATION CONTENT ── */}
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${IVORY} 0%, #f0ebe0 50%, ${IVORY} 100%)`,
        fontFamily: SANS,
        position: 'relative',
        opacity:    contentVis ? 1 : 0,
        transform:  contentVis ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)',
        paddingTop: editMode ? 56 : 0,
      }}>

        {/* Grain texture */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          opacity: 0.7,
        }}/>

        {/* Ambient gold glow top */}
        <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 400, height: 300, borderRadius: '0 0 50% 50%',
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0 }}/>

        {editMode && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-1.5 shadow-lg text-[10px] font-bold pointer-events-none select-none"
            style={{ background: IVORY, border: `1px solid ${GOLD}44`, color: GOLD_D, backdropFilter: 'blur(8px)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }}/>
            <span className="uppercase tracking-widest">Editare Directă</span>
            <span className="font-normal" style={{ color: MUTED }}>— click pe orice text</span>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', position: 'relative', zIndex: 1, padding: '0 20px 48px' }}>

          {/* ── HERO ── */}
          <div style={{ textAlign: 'center', padding: editMode ? '32px 0 40px' : '56px 0 40px' }}>

            {profile.showWelcomeText && (
              <Reveal delay={100}>
                <InlineEdit tag="p" editMode={editMode} value={welcomeText}
                  onChange={v => upProfile('welcomeText', v)} placeholder="Text introductiv..." multiline
                  style={{ fontFamily: SERIF, fontSize: 14, fontStyle: 'italic', color: MUTED,
                    lineHeight: 1.8, margin: '0 0 28px', display: 'block' }}/>
              </Reveal>
            )}

            {/* Names — centerpiece */}
            <div style={{ marginBottom: 8 }}>
              {isBaptism ? (
                <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || ''}
                  onChange={v => upProfile('partner1Name', v)} placeholder="Prenume"
                  style={{
                    fontFamily: SERIF, fontSize: 'clamp(44px, 11vw, 64px)', fontWeight: 300,
                    fontStyle: 'italic', color: TEXT, display: 'block',
                    lineHeight: 1.1, letterSpacing: '-0.01em',
                    animation: contentVis ? 'velum-name-reveal 1.2s cubic-bezier(0.4,0,0.2,1) both' : 'none',
                    animationDelay: '0.2s',
                  }}/>
              ) : (
                <>
                  <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || ''}
                    onChange={v => upProfile('partner1Name', v)} placeholder="Sofia"
                    style={{
                      fontFamily: SERIF, fontSize: 'clamp(44px, 11vw, 62px)', fontWeight: 300,
                      fontStyle: 'italic', color: TEXT, display: 'block',
                      lineHeight: 1.1, letterSpacing: '-0.01em',
                      animation: contentVis ? 'velum-name-reveal 1.2s cubic-bezier(0.4,0,0.2,1) 0.15s both' : 'none',
                    }}/>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px auto',
                    maxWidth: 200, justifyContent: 'center' }}>
                    <div style={{
                      height: 0.6, flex: 1,
                      background: `linear-gradient(to right, transparent, ${GOLD}55)`,
                      animation: contentVis ? 'velum-line-grow 0.8s ease-out 0.8s both' : 'none',
                    }}/>
                    <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic',
                      color: GOLD, lineHeight: 1,
                      animation: contentVis ? 'velum-name-reveal 0.6s ease-out 0.8s both' : 'none',
                    }}>&</span>
                    <div style={{
                      height: 0.6, flex: 1,
                      background: `linear-gradient(to left, transparent, ${GOLD}55)`,
                      animation: contentVis ? 'velum-line-grow 0.8s ease-out 0.8s both' : 'none',
                    }}/>
                  </div>

                  <InlineEdit tag="h1" editMode={editMode} value={profile.partner2Name || ''}
                    onChange={v => upProfile('partner2Name', v)} placeholder="Andrei"
                    style={{
                      fontFamily: SERIF, fontSize: 'clamp(44px, 11vw, 62px)', fontWeight: 300,
                      fontStyle: 'italic', color: TEXT, display: 'block',
                      lineHeight: 1.1, letterSpacing: '-0.01em',
                      animation: contentVis ? 'velum-name-reveal 1.2s cubic-bezier(0.4,0,0.2,1) 0.35s both' : 'none',
                    }}/>
                </>
              )}
            </div>

            {profile.showCelebrationText && (
              <Reveal delay={400}>
                <InlineEdit tag="p" editMode={editMode} value={celebrationText}
                  onChange={v => upProfile('celebrationText', v)} placeholder="Descriere eveniment..."
                  style={{ fontFamily: SERIF, fontSize: 15, fontStyle: 'italic', color: MUTED,
                    lineHeight: 1.7, margin: '16px 0 0', display: 'block' }}/>
              </Reveal>
            )}

            <Reveal delay={500}>
              <div style={{ margin: '28px 0' }}><GoldDivider/></div>
            </Reveal>

            {/* Date */}
            <Reveal delay={550}>
              {editMode ? (
                <input type="date"
                  value={profile.weddingDate ? new Date(profile.weddingDate).toISOString().split('T')[0] : ''}
                  onChange={e => upProfile('weddingDate', e.target.value)}
                  style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: TEXT,
                    letterSpacing: '0.38em', textTransform: 'uppercase',
                    background: 'transparent', border: 'none',
                    borderBottom: `1px solid ${GOLD}44`, outline: 'none',
                    textAlign: 'center', cursor: 'pointer', padding: '3px 0',
                    display: 'block', margin: '0 auto 20px', width: 'auto' }}/>
              ) : (
                <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: TEXT,
                  letterSpacing: '0.38em', textTransform: 'capitalize',
                  margin: '0 0 20px',
                  animation: contentVis ? 'velum-date-in 1s ease-out 0.6s both' : 'none' }}>
                  {dateStr}
                </p>
              )}
            </Reveal>

            {/* Countdown */}
            {profile.showCountdown && profile.weddingDate && !countdown.expired && (
              <Reveal delay={600}>
                <div style={{ margin: '0 0 24px' }}>
                  <p style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.4em',
                    textTransform: 'uppercase', color: MUTED, marginBottom: 14 }}>Timp rămas</p>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 6 }}>
                    {[countdown.days, countdown.hours, countdown.minutes, countdown.seconds].map((v, i) => (
                      <React.Fragment key={i}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 54, height: 62, background: 'rgba(255,255,255,0.8)',
                            border: `1px solid ${GOLD}33`, borderRadius: 3,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: '0 2px 12px rgba(42,33,24,0.06), inset 0 1px 0 white' }}>
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 0.5,
                              background: `${GOLD}22` }}/>
                            <span style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 300, color: TEXT, lineHeight: 1 }}>
                              {String(v).padStart(2, '0')}
                            </span>
                          </div>
                          <span style={{ fontFamily: SERIF, fontSize: 10, fontStyle: 'italic', color: MUTED }}>
                            {['zile', 'ore', 'min', 'sec'][i]}
                          </span>
                        </div>
                        {i < 3 && sep}
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 10 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: GOLD,
                      animation: 'velum-cd-pulse 2.5s ease-in-out infinite', opacity: 0.7 }}/>
                    <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700,
                      letterSpacing: '0.35em', textTransform: 'uppercase', color: `${MUTED}88` }}>live</span>
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal delay={650}>
              <div style={{ margin: '0 0 24px' }}><GoldDivider/></div>
            </Reveal>

            {/* Guest badge */}
            {guest?.name && guest.name !== 'Nume Invitat' && (
              <Reveal delay={700}>
                <div style={{ display: 'inline-block', border: `1px solid ${GOLD}33`,
                  borderRadius: 2, padding: '14px 24px', margin: '0 0 8px' }}>
                  <p style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.42em',
                    textTransform: 'uppercase', color: MUTED, margin: '0 0 6px' }}>Dragă</p>
                  <p style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 300, fontStyle: 'italic',
                    color: TEXT, margin: 0, letterSpacing: 0.5 }}>{guest.name}</p>
                </div>
              </Reveal>
            )}
          </div>

          {/* ── BLOCKS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayBlocks.map((block, displayIdx) => {
              const isVisible = block.show !== false;
              const realIdx   = blocks.indexOf(block);
              const locIdx    = displayBlocks.filter((b, i) => i < displayIdx && b.type === 'location').length;

              return (
                <div key={block.id} className={cn("relative group/block", !isVisible && editMode && "opacity-30")}
                  onClick={editMode ? () => onBlockSelect?.(block, realIdx) : undefined}>
                  {editMode && (
                    <BlockToolbar
                      onUp={() => movBlock(realIdx, -1)} onDown={() => movBlock(realIdx, 1)}
                      onToggle={() => updBlock(realIdx, { show: !isVisible })} onDelete={() => delBlock(realIdx)}
                      visible={isVisible} isFirst={realIdx === 0} isLast={realIdx === blocks.length - 1}
                    />
                  )}

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
                    <LocCard block={block} editMode={editMode} onUpdate={p => updBlock(realIdx, p)} idx={locIdx}/>
                  )}

                  {/* NAȘI */}
                  {block.type === 'godparents' && (
                    <Reveal>
                      <Card style={{ textAlign: 'center' }}>
                        <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Nașii Noștri'}
                          onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                          style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.44em',
                            textTransform: 'uppercase', color: `${GOLD}cc`, margin: '0 0 10px', display: 'block' }}/>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..." multiline
                          style={{ fontFamily: SERIF, fontSize: 13, fontStyle: 'italic', color: MUTED,
                            margin: '0 0 14px', lineHeight: 1.7, display: 'block' }}/>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {godparents.map((g: any, i: number) => (
                            <div key={i} className={cn("flex items-center justify-center gap-2", editMode && "group/gp")}>
                              <InlineEdit tag="span" editMode={editMode} value={g.godfather || ''} onChange={v => updGodparent(i, 'godfather', v)} placeholder="Naș"
                                style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 300, color: TEXT, letterSpacing: 0.5 }}/>
                              <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: GOLD, margin: '0 8px' }}>&</span>
                              <InlineEdit tag="span" editMode={editMode} value={g.godmother || ''} onChange={v => updGodparent(i, 'godmother', v)} placeholder="Nașă"
                                style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 300, color: TEXT, letterSpacing: 0.5 }}/>
                              {editMode && <button type="button" onClick={() => delGodparent(i)} className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400"/></button>}
                            </div>
                          ))}
                          {editMode && <button type="button" onClick={addGodparent}
                            className="text-[10px] font-bold border border-dashed rounded-full px-2 py-0.5 flex items-center gap-1 mx-auto transition-colors"
                            style={{ color: GOLD, borderColor: `${GOLD}44` }}>
                            <Plus className="w-2.5 h-2.5"/> adaugă
                          </button>}
                        </div>
                      </Card>
                    </Reveal>
                  )}

                  {/* PĂRINȚI */}
                  {block.type === 'parents' && (
                    <Reveal>
                      <Card style={{ textAlign: 'center' }}>
                        <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Părinții Noștri'}
                          onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                          style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.44em',
                            textTransform: 'uppercase', color: `${GOLD}cc`, margin: '0 0 10px', display: 'block' }}/>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..." multiline
                          style={{ fontFamily: SERIF, fontSize: 13, fontStyle: 'italic', color: MUTED,
                            margin: '0 0 12px', lineHeight: 1.7, display: 'block' }}/>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                          {([
                            { key: 'p1_father', ph: 'Tatăl Miresei' }, { key: 'p1_mother', ph: 'Mama Miresei' },
                            { key: 'p2_father', ph: 'Tatăl Mirelui' }, { key: 'p2_mother', ph: 'Mama Mirelui' },
                          ] as const).map(({ key, ph }) => {
                            const val = parentsData?.[key];
                            if (!val && !editMode) return null;
                            return <InlineEdit key={key} tag="p" editMode={editMode} value={val || ''} onChange={v => updParent(key, v)} placeholder={ph}
                              style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 300, fontStyle: 'italic', color: TEXT, margin: '1px 0' }}/>;
                          })}
                        </div>
                      </Card>
                    </Reveal>
                  )}

                  {/* TEXT */}
                  {block.type === 'text' && (
                    <Reveal>
                      <div style={{ textAlign: 'center', padding: '4px' }}>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Text liber..." multiline
                          style={{ fontFamily: SERIF, fontSize: 15, fontStyle: 'italic', color: MUTED, lineHeight: 1.85 }}/>
                      </div>
                    </Reveal>
                  )}

                  {/* TITLU */}
                  {block.type === 'title' && (
                    <Reveal>
                      <div style={{ textAlign: 'center', padding: '4px 0' }}>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Titlu secțiune..."
                          style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.44em',
                            textTransform: 'uppercase', color: `${GOLD}bb` }}/>
                      </div>
                    </Reveal>
                  )}

                  {block.type === 'divider' && <Reveal><GoldDivider/></Reveal>}
                  {block.type === 'spacer'  && <div style={{ height: 16 }}/>}
                  </BlockStyleProvider>
                </div>
              );
            })}
          </div>

          {/* Add block strip */}
          {editMode && (
            <div className="text-center mt-4 py-4 border-2 border-dashed rounded transition-colors"
              style={{ borderColor: `${GOLD}33` }}>
              <p className="text-[9px] uppercase tracking-widest mb-2.5 font-bold"
                style={{ color: MUTED, fontFamily: SANS }}>Adaugă bloc</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { type: 'location',   label: 'Locație', def: { label: '', time: '', locationName: '', locationAddress: '', wazeLink: '' } },
                  { type: 'godparents', label: 'Nași',    def: { sectionTitle: 'Nașii Noștri', content: '' } },
                  { type: 'parents',    label: 'Părinți', def: { sectionTitle: 'Părinții Noștri', content: '' } },
                  { type: 'text',       label: 'Text',    def: { content: '' } },
                  { type: 'title',      label: 'Titlu',   def: { content: '' } },
                  { type: 'divider',    label: 'Linie',   def: {} },
                ].map(({ type, label, def }) => (
                  <button key={type} type="button" onClick={() => addBlock(type, def)}
                    className="px-3 py-1 text-[10px] font-bold border rounded-full transition-all"
                    style={{ color: GOLD_D, borderColor: `${GOLD}44`, fontFamily: SANS }}>
                    + {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {profile.showTimeline && timeline.length > 0 && (
            <Reveal>
              <Card style={{ marginTop: 8 }}>
                <p style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.44em',
                  textTransform: 'uppercase', color: `${GOLD}cc`, textAlign: 'center', margin: '0 0 18px' }}>
                  Programul Zilei
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {timeline.map((item: any, i: number) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '52px 20px 1fr',
                      alignItems: 'stretch', minHeight: 40 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                        paddingRight: 8, paddingTop: 2 }}>
                        <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: GOLD }}>
                          {item.time}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Diamond dot */}
                        <div style={{ width: 7, height: 7, background: GOLD, opacity: 0.7,
                          transform: 'rotate(45deg)', marginTop: 3, flexShrink: 0 }}/>
                        {i < timeline.length - 1 && (
                          <div style={{ flex: 1, width: 0.6, background: `${GOLD}30`, marginTop: 2 }}/>
                        )}
                      </div>
                      <div style={{ paddingLeft: 10, paddingTop: 2,
                        paddingBottom: i < timeline.length - 1 ? 18 : 0 }}>
                        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 400, color: TEXT, opacity: 0.75 }}>
                          {item.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>
          )}

          {/* ── RSVP ── */}
          {showRsvp && (
            <Reveal delay={100}>
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <GoldDivider/>
                <div style={{ marginTop: 24 }}>
                  {editMode ? (
                    <div style={{ display: 'inline-block', padding: '16px 40px',
                      border: `1px solid ${GOLD}55`, borderRadius: 1 }}>
                      <InlineEdit tag="span" editMode={editMode} value={rsvpText}
                        onChange={v => upProfile('rsvpButtonText', v)}
                        style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10,
                          letterSpacing: '0.42em', textTransform: 'uppercase', color: TEXT, cursor: 'text' }}/>
                    </div>
                  ) : (
                    <button onClick={() => onOpenRSVP && onOpenRSVP()}
                      style={{
                        padding: '16px 48px', border: `1px solid ${TEXT}`, borderRadius: 1,
                        background: 'transparent', cursor: 'pointer',
                        fontFamily: SANS, fontWeight: 700, fontSize: 10,
                        letterSpacing: '0.42em', textTransform: 'uppercase', color: TEXT,
                        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = TEXT;
                        (e.currentTarget as HTMLButtonElement).style.color = IVORY;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = TEXT;
                        (e.currentTarget as HTMLButtonElement).style.letterSpacing = '0.5em';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = TEXT;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = TEXT;
                        (e.currentTarget as HTMLButtonElement).style.letterSpacing = '0.42em';
                      }}>
                      {rsvpText}
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {/* Footer */}
          <Reveal delay={200}>
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <GoldDivider/>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <WaxSeal size={20}/>
                <p style={{ fontFamily: SERIF, fontSize: 11, fontStyle: 'italic', color: `${MUTED}99`, margin: 0 }}>
                  cu drag · WeddingPro
                </p>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
};

export default VelumTemplate;
