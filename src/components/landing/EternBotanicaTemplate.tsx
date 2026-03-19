import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "../invitations/types";
import { cn } from "../../lib/utils";
import { InvitationBlock } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "../invitations/InlineEdit";

export const meta: TemplateMeta = {
  id: 'etern-botanica',
  name: 'Etern Botanica',
  category: 'wedding',
  description: 'Botanică acuarelă — trandafiri pastel, ramuri aurii, siluetă mireasă, cadru geometric gold.',
  colors: ['#fdfaf7', '#f2c4ce', '#c9a84c'],
  previewClass: "bg-rose-50 border-rose-200",
  elementsClass: "bg-rose-300",
};

// ─── Tokens ───────────────────────────────────────────────────────────────────
const IVORY  = '#fdfaf7';
const CREAM  = '#f5f0e8';
const TEXT   = '#2a2118';
const MUTED  = '#9a8a7a';
const GOLD   = '#c9a84c';
const GOLD_L = '#e8c84a';
const GOLD_D = '#a07828';
const ROSE   = '#e8a8b8';
const ROSE_D = '#c97890';
const GREEN  = '#8aaa78';
const GREEN_D= '#5a7848';
const SERIF  = "'Cormorant Garamond','Playfair Display',Georgia,serif";
const SANS   = "'DM Sans','Helvetica Neue',system-ui,sans-serif";

// ─── SVG: Watercolor rose cluster ─────────────────────────────────────────────
const RoseCluster: React.FC<{ flip?: boolean; scale?: number; style?: React.CSSProperties }> =
  ({ flip, scale = 1, style }) => (
  <svg viewBox="0 0 320 280" fill="none"
    style={{ width: 320 * scale, height: 280 * scale,
      transform: flip ? 'scaleX(-1)' : undefined, pointerEvents: 'none', ...style }}>
    <defs>
      <filter id="eb-blur1"><feGaussianBlur stdDeviation="3.5"/></filter>
      <filter id="eb-blur2"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="eb-blur3"><feGaussianBlur stdDeviation="1.5"/></filter>
    </defs>

    {/* Watercolor blobs — diffuse background wash */}
    <ellipse cx="110" cy="110" rx="100" ry="80" fill="#f9d8e0" opacity="0.35" filter="url(#eb-blur2)"/>
    <ellipse cx="180" cy="80" rx="80" ry="60" fill="#f2c4ce" opacity="0.28" filter="url(#eb-blur2)"/>
    <ellipse cx="80" cy="160" rx="70" ry="55" fill="#e8f5e0" opacity="0.3" filter="url(#eb-blur2)"/>

    {/* Eucalyptus stems */}
    <path d="M60 260 C65 220 70 180 80 150 C90 120 100 95 115 70"
      stroke={GREEN_D} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.65"/>
    <path d="M40 280 C50 240 60 200 75 165 C88 132 105 108 120 85"
      stroke={GREEN_D} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/>
    <path d="M120 70 C135 50 155 38 175 30 C195 22 220 20 250 25"
      stroke={GREEN_D} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55"/>

    {/* Eucalyptus leaves — left stem */}
    {[
      [75, 150, -35], [85, 128, -28], [94, 108, -22],
      [103, 90, -18], [112, 74, -12],
    ].map(([lx, ly, rot], i) => (
      <g key={i} transform={`rotate(${rot}, ${lx}, ${ly})`}>
        <ellipse cx={lx} cy={ly} rx="14" ry="9" fill="#a8c490" opacity="0.55"/>
        <ellipse cx={lx - 5} cy={ly} rx="10" ry="6" fill="#8aaa78" opacity="0.4"/>
      </g>
    ))}
    {/* Right leaves on second stem */}
    {[
      [78, 158, 20], [90, 136, 22], [102, 116, 18],
    ].map(([lx, ly, rot], i) => (
      <g key={i} transform={`rotate(${rot}, ${lx}, ${ly})`}>
        <ellipse cx={lx} cy={ly} rx="12" ry="8" fill="#a8c490" opacity="0.45"/>
      </g>
    ))}
    {/* Top horizontal leaves */}
    {[
      [148, 34, 12], [168, 28, 5], [190, 25, 0], [215, 26, -8], [238, 30, -14],
    ].map(([lx, ly, rot], i) => (
      <g key={i} transform={`rotate(${rot}, ${lx}, ${ly})`}>
        <ellipse cx={lx} cy={ly} rx="18" ry="10" fill="#8aaa78" opacity="0.5"/>
        <ellipse cx={lx + 3} cy={ly - 2} rx="12" ry="7" fill="#a8c490" opacity="0.35"/>
      </g>
    ))}

    {/* Gold geometric branches */}
    <path d="M130 55 L200 20 L280 35" stroke={GOLD} strokeWidth="0.9" fill="none" opacity="0.7" strokeLinecap="round"/>
    <path d="M145 62 L155 30" stroke={GOLD} strokeWidth="0.7" fill="none" opacity="0.55"/>
    <path d="M200 20 L195 0" stroke={GOLD} strokeWidth="0.7" fill="none" opacity="0.5"/>
    <path d="M240 28 L248 8" stroke={GOLD} strokeWidth="0.7" fill="none" opacity="0.5"/>
    {/* Gold dots on branches */}
    {[[200, 20], [165, 38], [232, 25], [280, 35]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="2.5" fill={GOLD} opacity="0.7"/>
    ))}

    {/* ── Main roses ── */}
    {/* Large center rose */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const px = 120 + Math.cos(rad) * 28, py = 120 + Math.sin(rad) * 28;
      return <ellipse key={i} cx={px} cy={py} rx="18" ry="24"
        fill="#f5c4cc" opacity="0.75"
        transform={`rotate(${a}, ${px}, ${py})`}/>;
    })}
    {[0, 60, 120, 180, 240, 300].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const px = 120 + Math.cos(rad) * 16, py = 120 + Math.sin(rad) * 16;
      return <ellipse key={i} cx={px} cy={py} rx="14" ry="18"
        fill="#e8a8b8" opacity="0.82"
        transform={`rotate(${a + 15}, ${px}, ${py})`}/>;
    })}
    {[0, 72, 144, 216, 288].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const px = 120 + Math.cos(rad) * 8, py = 120 + Math.sin(rad) * 8;
      return <ellipse key={i} cx={px} cy={py} rx="9" ry="13"
        fill="#d4849a" opacity="0.88"
        transform={`rotate(${a + 30}, ${px}, ${py})`}/>;
    })}
    <circle cx="120" cy="120" r="7" fill="#c07080" opacity="0.9"/>
    <circle cx="120" cy="120" r="3.5" fill="#e8a8b8" opacity="0.6"/>

    {/* Medium rose upper right */}
    {[0, 60, 120, 180, 240, 300].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const px = 215 + Math.cos(rad) * 20, py = 65 + Math.sin(rad) * 20;
      return <ellipse key={i} cx={px} cy={py} rx="13" ry="17"
        fill="#fde4e8" opacity="0.7"
        transform={`rotate(${a + 10}, ${px}, ${py})`}/>;
    })}
    {[0, 72, 144, 216, 288].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const px = 215 + Math.cos(rad) * 11, py = 65 + Math.sin(rad) * 11;
      return <ellipse key={i} cx={px} cy={py} rx="8" ry="11"
        fill="#f2b8c4" opacity="0.85"
        transform={`rotate(${a + 25}, ${px}, ${py})`}/>;
    })}
    <circle cx="215" cy="65" r="6" fill="#d4849a" opacity="0.88"/>

    {/* Small rose lower left */}
    {[0, 72, 144, 216, 288].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const px = 55 + Math.cos(rad) * 18, py = 195 + Math.sin(rad) * 18;
      return <ellipse key={i} cx={px} cy={py} rx="11" ry="15"
        fill="#fae0e4" opacity="0.65"
        transform={`rotate(${a + 20}, ${px}, ${py})`}/>;
    })}
    {[0, 90, 180, 270].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const px = 55 + Math.cos(rad) * 9, py = 195 + Math.sin(rad) * 9;
      return <ellipse key={i} cx={px} cy={py} rx="7" ry="10"
        fill="#e8a8b8" opacity="0.8"
        transform={`rotate(${a + 35}, ${px}, ${py})`}/>;
    })}
    <circle cx="55" cy="195" r="5" fill="#c97890" opacity="0.85"/>

    {/* White accent flowers */}
    {[[175, 45], [88, 82], [260, 95]].map(([fx, fy], wi) => (
      <g key={wi}>
        {[0, 72, 144, 216, 288].map((a, i) => {
          const rad = (a * Math.PI) / 180;
          const px = fx + Math.cos(rad) * 10, py = fy + Math.sin(rad) * 10;
          return <ellipse key={i} cx={px} cy={py} rx="6" ry="9"
            fill="white" opacity="0.7"
            transform={`rotate(${a}, ${px}, ${py})`}/>;
        })}
        <circle cx={fx} cy={fy} r="4" fill="#fde68a" opacity="0.85"/>
        <circle cx={fx} cy={fy} r="2" fill="white" opacity="0.5"/>
      </g>
    ))}

    {/* Scattered gold sparkle dots */}
    {[[145, 95, 2], [250, 55, 1.5], [95, 165, 1.8], [185, 140, 1.2], [300, 80, 1.5]].map(([sx, sy, sr], i) => (
      <g key={i}>
        <circle cx={sx} cy={sy} r={sr} fill={GOLD} opacity="0.7"/>
        <circle cx={sx} cy={sy} r={sr as number * 2.5} fill={GOLD_L} opacity="0.15"/>
      </g>
    ))}
  </svg>
);

// ─── SVG: Gold geometric frame ────────────────────────────────────────────────
const GoldFrame: React.FC<{ w: number; h: number; phase: number }> = ({ w, h, phase }) => {
  const pad = 18;
  const innerPad = 36;
  const corner = 60;

  // Total perimeter for stroke-dashoffset
  const perim = 2 * ((w - 2*pad) + (h - 2*pad));

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <defs>
        <linearGradient id="eb-gold-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD_L} stopOpacity="0.9"/>
          <stop offset="50%" stopColor={GOLD}/>
          <stop offset="100%" stopColor={GOLD_D} stopOpacity="0.7"/>
        </linearGradient>
      </defs>

      {/* Outer frame rectangle */}
      <rect x={pad} y={pad} width={w - 2*pad} height={h - 2*pad}
        stroke="url(#eb-gold-grad)" strokeWidth="0.8" fill="none"
        strokeDasharray={perim}
        strokeDashoffset={phase >= 1 ? 0 : perim}
        style={{ transition: phase >= 1 ? 'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)' : 'none' }}/>

      {/* Inner frame (thinner, more inset) */}
      <rect x={innerPad} y={innerPad} width={w - 2*innerPad} height={h - 2*innerPad}
        stroke={GOLD} strokeWidth="0.4" fill="none"
        strokeDasharray="4 8"
        opacity={phase >= 2 ? 0.4 : 0}
        style={{ transition: 'opacity 0.6s ease-out 1.2s' }}/>

      {/* Corner ornaments */}
      {[
        [pad, pad, 1, 1],
        [w - pad, pad, -1, 1],
        [pad, h - pad, 1, -1],
        [w - pad, h - pad, -1, -1],
      ].map(([cx, cy, sx, sy], i) => (
        <g key={i} transform={`translate(${cx}, ${cy}) scale(${sx}, ${sy})`}
          opacity={phase >= 2 ? 1 : 0}
          style={{ transition: `opacity 0.4s ease-out ${1.4 + i * 0.08}s` }}>
          <line x1="0" y1="0" x2={corner * 0.5} y2="0" stroke={GOLD} strokeWidth="0.8" opacity="0.7"/>
          <line x1="0" y1="0" x2="0" y2={corner * 0.5} stroke={GOLD} strokeWidth="0.8" opacity="0.7"/>
          <rect x="-2" y="-2" width="4" height="4" fill={GOLD} opacity="0.6" transform="rotate(45, 0, 0)"/>
        </g>
      ))}

      {/* Center top flourish */}
      <g opacity={phase >= 3 ? 1 : 0} style={{ transition: 'opacity 0.5s ease-out 1.8s' }}>
        <line x1={w * 0.3} y1={pad} x2={w * 0.43} y2={pad} stroke={GOLD} strokeWidth="1.2" opacity="0.6"/>
        <circle cx={w * 0.5} cy={pad} r="3" fill={GOLD} opacity="0.7"/>
        <line x1={w * 0.57} y1={pad} x2={w * 0.7} y2={pad} stroke={GOLD} strokeWidth="1.2" opacity="0.6"/>
        <circle cx={w * 0.43} cy={pad} r="1.5" fill={GOLD} opacity="0.5"/>
        <circle cx={w * 0.57} cy={pad} r="1.5" fill={GOLD} opacity="0.5"/>
      </g>
    </svg>
  );
};

// ─── SVG: Couple silhouette ───────────────────────────────────────────────────
const CoupleSilhouette: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 200 280" fill="none" style={{ width: 160, height: 224, pointerEvents: 'none', ...style }}>
    {/* Groom */}
    <ellipse cx="72" cy="42" rx="22" ry="26" fill="#3a3028"/>
    <path d="M50 68 C50 68 42 80 40 130 L50 130 L55 100 L60 130 L84 130 L88 68 Z" fill="#2a2118"/>
    <path d="M40 130 L38 200 L52 200 L58 155 L64 200 L78 200 L72 130 Z" fill="#1a1510"/>
    {/* Groom pants details */}
    <path d="M52 130 L60 155 L68 130 Z" fill="#3a3028" opacity="0.3"/>
    <path d="M40 130 L42 200" stroke="#3a3028" strokeWidth="0.5" opacity="0.3"/>
    <path d="M78 130 L76 200" stroke="#3a3028" strokeWidth="0.5" opacity="0.3"/>

    {/* Groom boutonniere */}
    <circle cx="78" cy="90" r="3" fill={ROSE} opacity="0.6"/>
    {[0, 72, 144, 216, 288].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      return <ellipse key={i} cx={78 + Math.cos(rad) * 3.5} cy={90 + Math.sin(rad) * 3.5}
        rx="2" ry="3" fill={ROSE} opacity="0.4" transform={`rotate(${a}, ${78 + Math.cos(rad) * 3.5}, ${90 + Math.sin(rad) * 3.5})`}/>;
    })}

    {/* Bride */}
    <ellipse cx="130" cy="36" rx="19" ry="23" fill="#c4a89a"/>
    {/* Hair with veil */}
    <ellipse cx="130" cy="30" rx="21" ry="14" fill="#8a6a5a"/>
    <path d="M149 30 C162 35 168 60 165 90 L160 90 C162 65 157 42 149 30 Z" fill="white" opacity="0.6"/>
    <path d="M149 30 C158 38 162 65 160 95" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>

    {/* Bride dress */}
    <path d="M111 59 C108 70 105 90 100 130 L160 130 C155 90 152 70 149 59 Z" fill="white"/>
    <path d="M100 130 C96 165 94 190 92 220 L168 220 C166 190 164 165 160 130 Z" fill="white"/>
    {/* Dress details */}
    <path d="M116 80 C118 85 120 88 122 85 C124 82 126 85 128 88 C130 85 132 82 134 85"
      stroke="#f0e8e0" strokeWidth="0.6" fill="none" opacity="0.6"/>
    {/* A-line silhouette */}
    <path d="M92 220 C90 225 88 240 86 260 L174 260 C172 240 170 225 168 220"
      fill="white" opacity="0.9"/>

    {/* Bride bouquet */}
    {[0, 60, 120, 180, 240, 300].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const bx = 102 + Math.cos(rad) * 11, by = 165 + Math.sin(rad) * 11;
      return <ellipse key={i} cx={bx} cy={by} rx="7" ry="9"
        fill={ROSE} opacity="0.75"
        transform={`rotate(${a + 20}, ${bx}, ${by})`}/>;
    })}
    {[0, 72, 144, 216, 288].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const bx = 102 + Math.cos(rad) * 5, by = 165 + Math.sin(rad) * 5;
      return <ellipse key={i} cx={bx} cy={by} rx="5" ry="7"
        fill="#f9d0d8" opacity="0.85"
        transform={`rotate(${a + 35}, ${bx}, ${by})`}/>;
    })}
    <circle cx="102" cy="165" r="4.5" fill={ROSE_D} opacity="0.9"/>

    {/* Hands joined */}
    <path d="M88 145 Q100 150 114 148" stroke="#c4a89a" strokeWidth="3" strokeLinecap="round" fill="none"/>

    {/* Ground shadow */}
    <ellipse cx="116" cy="268" rx="62" ry="6" fill="rgba(42,33,24,0.08)" filter="url(#eb-blur3)"/>
  </svg>
);

// ─── Intro animation ───────────────────────────────────────────────────────────
const BotanicaIntro: React.FC<{
  name1: string; name2: string; date: string; isBaptism: boolean; onDone: () => void;
}> = ({ name1, name2, date, isBaptism, onDone }) => {
  const [phase, setPhase] = useState(0);
  // 0→bg | 1→frame draws | 2→corner ornaments | 3→flourish | 4→florals bloom | 5→names | 6→couple | 7→hold | 8→fade

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 1000),
      setTimeout(() => setPhase(5), 1600),
      setTimeout(() => setPhase(6), 2000),
      setTimeout(() => setPhase(7), 2800),
      setTimeout(() => setPhase(8), 3400),
      setTimeout(onDone, 4100),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const IW = Math.min(window.innerWidth, 480);
  const IH = window.innerHeight;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: IVORY, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 8 ? 0 : 1,
      transition: phase === 8 ? 'opacity 0.7s ease-in-out' : 'none',
      pointerEvents: phase === 8 ? 'none' : 'auto',
    }}>

      <style>{`
        @keyframes eb-bloom {
          from { opacity:0; transform:scale(0.6); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes eb-name-in {
          from { opacity:0; filter:blur(12px); transform:translateY(10px); }
          to   { opacity:1; filter:blur(0); transform:translateY(0); }
        }
        @keyframes eb-couple-rise {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes eb-sparkle {
          0%,100%{ opacity:0.4; transform:scale(1); }
          50%{ opacity:0.8; transform:scale(1.4); }
        }
      `}</style>

      {/* Paper grain */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.8 }}/>

      {/* Gold frame */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <GoldFrame w={IW} h={IH} phase={phase}/>
      </div>

      {/* Florals — top left */}
      <div style={{
        position: 'absolute', top: -20, left: -20, zIndex: 2,
        opacity: phase >= 4 ? 1 : 0, transform: phase >= 4 ? 'scale(1)' : 'scale(0.7)',
        transformOrigin: 'top left',
        transition: phase >= 4 ? 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)' : 'none',
      }}>
        <RoseCluster scale={0.9}/>
      </div>

      {/* Florals — bottom right (flipped) */}
      <div style={{
        position: 'absolute', bottom: -20, right: -20, zIndex: 2,
        opacity: phase >= 4 ? 1 : 0, transform: phase >= 4 ? 'scale(1)' : 'scale(0.7)',
        transformOrigin: 'bottom right',
        transition: phase >= 4 ? 'opacity 0.8s 0.2s cubic-bezier(0.22,1,0.36,1), transform 0.8s 0.2s cubic-bezier(0.22,1,0.36,1)' : 'none',
      }}>
        <RoseCluster flip scale={0.85}/>
      </div>

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 40px' }}>

        {/* Sub-title */}
        <p style={{
          fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: '0.42em',
          textTransform: 'uppercase', color: MUTED, marginBottom: 16,
          opacity: phase >= 5 ? 1 : 0,
          transition: 'opacity 0.5s ease-out 0.3s',
        }}>
          {isBaptism ? 'cu bucurie vă anunțăm' : 'cu inimile pline'}
        </p>

        {/* Name(s) */}
        <h1 style={{
          fontFamily: SERIF, fontWeight: 300, fontStyle: 'italic',
          fontSize: IW < 360 ? 46 : 58, lineHeight: 1.05, color: TEXT, margin: 0,
          animation: phase >= 5 ? 'eb-name-in 1.2s cubic-bezier(0.4,0,0.2,1) both' : 'none',
        }}>
          {name1}
          {!isBaptism && (
            <span style={{ color: ROSE_D, fontFamily: SERIF }}> & </span>
          )}
          {!isBaptism && name2}
        </h1>

        {/* Date */}
        <p style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: '0.38em',
          textTransform: 'uppercase', color: MUTED, marginTop: 18,
          opacity: phase >= 5 ? 1 : 0, transform: phase >= 5 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.6s ease-out 0.5s, transform 0.6s ease-out 0.5s',
        }}>{date}</p>

        {/* Gold divider */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20,
          opacity: phase >= 5 ? 1 : 0, transition: 'opacity 0.5s ease-out 0.7s',
        }}>
          <div style={{ width: 36, height: 0.6, background: `linear-gradient(to right, transparent, ${GOLD})` }}/>
          <div style={{ width: 8, height: 8, background: GOLD, opacity: 0.8, transform: 'rotate(45deg)' }}/>
          <div style={{ width: 36, height: 0.6, background: `linear-gradient(to left, transparent, ${GOLD})` }}/>
        </div>
      </div>

      {/* Couple silhouette */}
      <div style={{
        position: 'absolute', bottom: 36, zIndex: 3,
        animation: phase >= 6 ? 'eb-couple-rise 0.9s cubic-bezier(0.16,1,0.3,1) both' : 'none',
        opacity: phase >= 6 ? 1 : 0,
      }}>
        <CoupleSilhouette/>
      </div>

      {/* Gold sparkle dots */}
      {[[15, 22], [85, 12], [30, 78], [92, 68], [50, 35]].map(([px, py], i) => (
        <div key={i} style={{
          position: 'absolute', left: `${px}%`, top: `${py}%`,
          width: 4, height: 4, borderRadius: '50%', background: GOLD,
          opacity: phase >= 3 ? 1 : 0, transition: `opacity 0.3s ${0.8 + i * 0.1}s`,
          animation: phase >= 3 ? `eb-sparkle ${2 + i * 0.4}s ease-in-out infinite ${i * 0.3}s` : 'none',
        }}/>
      ))}
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
    if (!target) return; const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id);
  }, [target]);
  return t;
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
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

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const { ref, vis } = useReveal(delay);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)`,
      transitionDelay: `${delay}ms`,
      ...style,
    }}>{children}</div>
  );
};

// ─── Decorative dividers ──────────────────────────────────────────────────────
const RoseDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ flex: 1, height: 0.6, background: `linear-gradient(to right, transparent, ${ROSE}55)` }}/>
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
      {/* Tiny rose center */}
      {[0, 72, 144, 216, 288].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        return <ellipse key={i} cx={16 + Math.cos(rad) * 7} cy={12 + Math.sin(rad) * 7}
          rx="3.5" ry="5.5" fill={ROSE} opacity="0.7"
          transform={`rotate(${a}, ${16 + Math.cos(rad) * 7}, ${12 + Math.sin(rad) * 7})`}/>;
      })}
      <circle cx="16" cy="12" r="3.5" fill={ROSE_D} opacity="0.85"/>
      {/* Tiny leaves */}
      <ellipse cx="3" cy="12" rx="6" ry="3.5" fill={GREEN} opacity="0.55" transform="rotate(-15, 3, 12)"/>
      <ellipse cx="29" cy="12" rx="6" ry="3.5" fill={GREEN} opacity="0.5" transform="rotate(15, 29, 12)"/>
    </svg>
    <div style={{ flex: 1, height: 0.6, background: `linear-gradient(to left, transparent, ${ROSE}55)` }}/>
  </div>
);

const GoldLineDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to right, transparent, ${GOLD}55)` }}/>
    <div style={{ width: 6, height: 6, background: GOLD, opacity: 0.7, transform: 'rotate(45deg)', flexShrink: 0 }}/>
    <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to left, transparent, ${GOLD}55)` }}/>
  </div>
);

// ─── Block toolbar ────────────────────────────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-3.5 right-2 flex items-center gap-0.5 rounded-full border shadow-lg px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto"
    style={{ background: IVORY, borderColor: `${ROSE}55` }}>
    <button type="button" onClick={e => { e.stopPropagation(); onUp(); }} disabled={isFirst} className="p-0.5 rounded-full disabled:opacity-20"><ChevronUp className="w-3 h-3" style={{ color: ROSE_D }}/></button>
    <button type="button" onClick={e => { e.stopPropagation(); onDown(); }} disabled={isLast} className="p-0.5 rounded-full disabled:opacity-20"><ChevronDown className="w-3 h-3" style={{ color: ROSE_D }}/></button>
    <div className="w-px h-3 mx-0.5" style={{ background: `${ROSE}44` }}/>
    <button type="button" onClick={e => { e.stopPropagation(); onToggle(); }} className="p-0.5 rounded-full">
      {visible ? <Eye className="w-3 h-3" style={{ color: ROSE_D }}/> : <EyeOff className="w-3 h-3" style={{ color: MUTED }}/>}
    </button>
    <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }} className="p-0.5 rounded-full hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400"/></button>
  </div>
);

// ─── Location card ────────────────────────────────────────────────────────────
const LocCard: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void; idx?: number }> =
  ({ block, editMode, onUpdate, idx = 0 }) => {
  const { ref, vis } = useReveal(idx * 90);
  return (
    <div ref={ref} style={{
      background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)',
      border: `1px solid ${ROSE}33`, borderRadius: 2, padding: '20px 24px',
      boxShadow: '0 2px 18px rgba(42,33,24,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
      position: 'relative', overflow: 'hidden',
      opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 1,
        background: `linear-gradient(to right, transparent, ${ROSE}55, transparent)` }}/>
      <InlineEdit tag="p" editMode={editMode} value={block.label || ''} onChange={v => onUpdate({ label: v })}
        placeholder="Eveniment..."
        style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.44em',
          textTransform: 'uppercase', color: ROSE_D, margin: '0 0 14px', display: 'block', opacity: 0.8 }}/>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1px 1fr', gap: '0 20px', alignItems: 'start' }}>
        <div>
          <InlineTime value={block.time || ''} onChange={v => onUpdate({ time: v })} editMode={editMode}
            style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 300, color: TEXT, display: 'block', lineHeight: 1 }}/>
          <p style={{ fontFamily: SANS, fontSize: 8, color: MUTED, margin: '3px 0 0' }}>ora</p>
        </div>
        <div style={{ background: `${ROSE}35`, alignSelf: 'stretch', marginTop: 2 }}/>
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

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(8px)',
    border: `1px solid ${ROSE}28`, borderRadius: 2, padding: '20px 24px',
    boxShadow: '0 2px 18px rgba(42,33,24,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
    ...style,
  }}>{children}</div>
);

// ─── Main template ─────────────────────────────────────────────────────────────
export type EternBotanicaProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
};

const EternBotanicaTemplate: React.FC<EternBotanicaProps> = ({
  data, onOpenRSVP, editMode = false, onProfileUpdate, onBlocksUpdate,
}) => {
  const { profile, guest } = data;
  const [showIntro, setShowIntro]     = useState(!editMode);
  const [contentVis, setContentVis]   = useState(editMode);
  const [framePhase, setFramePhase]   = useState(0);

  useEffect(() => {
    if (editMode) { setShowIntro(false); setContentVis(true); }
    else          { setShowIntro(true);  setContentVis(false); }
  }, [editMode]);

  useEffect(() => {
    if (!contentVis) return;
    const t = setTimeout(() => setFramePhase(1), 200);
    return () => clearTimeout(t);
  }, [contentVis]);

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const [blocks, setBlocks]           = useState<InvitationBlock[]>(() => safeJSON(profile.customSections, []));
  const [godparents, setGodparents]   = useState<any[]>(() => safeJSON(profile.godparents, []));
  const [parentsData, setParentsData] = useState<any>(() => safeJSON(profile.parents, {}));

  useEffect(() => { setBlocks(safeJSON(profile.customSections, [])); }, [profile.customSections]);
  useEffect(() => { setGodparents(safeJSON(profile.godparents, [])); }, [profile.godparents]);
  useEffect(() => { setParentsData(safeJSON(profile.parents, {})); }, [profile.parents]);

  const timeline: any[] = safeJSON(profile.timeline, []);
  const countdown = useCountdown(profile.weddingDate || '');

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

  const welcomeText     = profile.welcomeText?.trim()     || 'Cu inimile pline de emoție și bucurie';
  const celebrationText = profile.celebrationText?.trim() || 'vă invităm să fiți alături de noi';
  const rsvpText        = profile.rsvpButtonText?.trim()  || 'Confirmă Prezența';
  const showRsvp        = profile.showRsvpButton !== false;
  const isBaptism       = profile.eventType === 'baptism' || profile.eventType === 'kids';
  const displayBlocks   = editMode ? blocks : blocks.filter(b => b.show !== false);

  const name1 = profile.partner1Name || 'Maria';
  const name2 = profile.partner2Name || 'Radu';
  const d     = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const dateStrFull = d
    ? d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Data Evenimentului';
  const dateStrShort = d
    ? d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
    : 'DATA EVENIMENTULUI';

  const sep = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', paddingBottom: 20, flexShrink: 0 }}>
      <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${ROSE}66` }}/>
      <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${ROSE}66` }}/>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes eb-name-reveal {
          from { opacity:0; filter:blur(10px); transform:translateY(8px); }
          to   { opacity:1; filter:blur(0);    transform:translateY(0); }
        }
        @keyframes eb-sparkle {
          0%,100%{ opacity:0.4; transform:scale(1); }
          50%{ opacity:0.8; transform:scale(1.5); }
        }
        @keyframes eb-cd-pulse {
          0%,100%{ transform:scale(1); opacity:.7 }
          50%{ transform:scale(1.6); opacity:1 }
        }
        @keyframes eb-couple-float {
          0%,100%{ transform:translateY(0); }
          50%{ transform:translateY(-5px); }
        }
      `}</style>

      {showIntro && (
        <BotanicaIntro
          name1={name1} name2={name2} date={dateStrShort}
          isBaptism={isBaptism}
          onDone={() => { setShowIntro(false); setTimeout(() => setContentVis(true), 60); }}
        />
      )}

      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${IVORY} 0%, ${CREAM} 50%, ${IVORY} 100%)`,
        fontFamily: SANS, position: 'relative', overflow: 'hidden',
        opacity: contentVis ? 1 : 0,
        transform: contentVis ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)',
        paddingTop: editMode ? 56 : 0,
      }}>

        {/* Paper grain */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.8 }}/>

        {/* Gold frame on content */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 420 100%" fill="none" preserveAspectRatio="xMidYMid meet"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <rect x="12" y="12" width="calc(100% - 24)" height="99%" rx="0"
              stroke={GOLD} strokeWidth="0.6" fill="none"
              strokeDasharray="4 12" opacity="0.25"/>
          </svg>
        </div>

        {/* Florals top left — fixed decorative */}
        <div style={{ position: 'fixed', top: -20, left: -20, zIndex: 0, pointerEvents: 'none' }}>
          <RoseCluster scale={0.72}/>
        </div>
        {/* Florals bottom right — fixed decorative */}
        <div style={{ position: 'fixed', bottom: -20, right: -20, zIndex: 0, pointerEvents: 'none' }}>
          <RoseCluster flip scale={0.65}/>
        </div>

        {/* Gold sparkles */}
        {[[8, 18], [88, 8], [5, 72], [94, 65], [50, 4]].map(([px, py], i) => (
          <div key={i} style={{
            position: 'fixed', left: `${px}%`, top: `${py}%`,
            width: 4, height: 4, borderRadius: '50%', background: GOLD,
            opacity: contentVis ? 0.5 : 0, transition: `opacity 0.5s ${0.5 + i * 0.1}s`,
            animation: contentVis ? `eb-sparkle ${2.5 + i * 0.4}s ease-in-out infinite ${i * 0.4}s` : 'none',
            pointerEvents: 'none', zIndex: 1,
          }}/>
        ))}

        {editMode && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-1.5 shadow-lg text-[10px] font-bold pointer-events-none select-none"
            style={{ background: IVORY, border: `1px solid ${ROSE}44`, color: ROSE_D, backdropFilter: 'blur(8px)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ROSE }}/>
            <span className="uppercase tracking-widest">Editare Directă</span>
            <span className="font-normal" style={{ color: MUTED }}>— click pe orice text</span>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: 460, margin: '0 auto', position: 'relative', zIndex: 2, padding: '0 24px 56px' }}>

          {/* ── HERO ── */}
          <div style={{ textAlign: 'center', padding: editMode ? '28px 0 36px' : '56px 0 36px' }}>

            {/* Welcome text */}
            {profile.showWelcomeText && (
              <Reveal delay={80}>
                <InlineEdit tag="p" editMode={editMode} value={welcomeText}
                  onChange={v => upProfile('welcomeText', v)} placeholder="Text introductiv..." multiline
                  style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em',
                    textTransform: 'uppercase', color: MUTED, lineHeight: 1.8,
                    margin: '0 0 20px', display: 'block' }}/>
              </Reveal>
            )}

            {/* ── NAMES — centerpiece ── */}
            {isBaptism ? (
              <Reveal delay={150}>
                <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || ''}
                  onChange={v => upProfile('partner1Name', v)} placeholder="Prenume"
                  style={{ fontFamily: SERIF, fontSize: 'clamp(48px, 12vw, 68px)', fontWeight: 300,
                    fontStyle: 'italic', color: ROSE_D, display: 'block', lineHeight: 1.05,
                    animation: contentVis ? 'eb-name-reveal 1.2s cubic-bezier(0.4,0,0.2,1) 0.2s both' : 'none' }}/>
              </Reveal>
            ) : (
              <div>
                <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || ''}
                  onChange={v => upProfile('partner1Name', v)} placeholder="Maria"
                  style={{ fontFamily: SERIF, fontSize: 'clamp(48px, 12vw, 68px)', fontWeight: 300,
                    fontStyle: 'italic', color: ROSE_D, display: 'block', lineHeight: 1.05,
                    animation: contentVis ? 'eb-name-reveal 1.2s cubic-bezier(0.4,0,0.2,1) 0.15s both' : 'none' }}/>

                <div style={{ display: 'flex', alignItems: 'center', margin: '12px auto 12px',
                  maxWidth: 220, gap: 16 }}>
                  <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to right, transparent, ${ROSE}55)`,
                    animation: contentVis ? 'none' : 'none' }}/>
                  <span style={{ fontFamily: SERIF, fontSize: 36, fontStyle: 'italic',
                    color: ROSE_D, lineHeight: 1,
                    animation: contentVis ? 'eb-name-reveal 0.8s ease-out 0.6s both' : 'none' }}>&</span>
                  <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to left, transparent, ${ROSE}55)` }}/>
                </div>

                <InlineEdit tag="h1" editMode={editMode} value={profile.partner2Name || ''}
                  onChange={v => upProfile('partner2Name', v)} placeholder="Radu"
                  style={{ fontFamily: SERIF, fontSize: 'clamp(48px, 12vw, 68px)', fontWeight: 300,
                    fontStyle: 'italic', color: ROSE_D, display: 'block', lineHeight: 1.05,
                    animation: contentVis ? 'eb-name-reveal 1.2s cubic-bezier(0.4,0,0.2,1) 0.35s both' : 'none' }}/>
              </div>
            )}

            {/* Celebration text */}
            {profile.showCelebrationText && (
              <Reveal delay={400}>
                <InlineEdit tag="p" editMode={editMode} value={celebrationText}
                  onChange={v => upProfile('celebrationText', v)} placeholder="Descriere..."
                  style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: '0.22em',
                    textTransform: 'uppercase', color: MUTED, margin: '20px 0 0', display: 'block' }}/>
              </Reveal>
            )}

            <Reveal delay={480}>
              <div style={{ margin: '24px 0' }}><RoseDivider/></div>
            </Reveal>

            {/* Date — big typographic treatment */}
            <Reveal delay={520}>
              {editMode ? (
                <input type="date"
                  value={profile.weddingDate ? new Date(profile.weddingDate).toISOString().split('T')[0] : ''}
                  onChange={e => upProfile('weddingDate', e.target.value)}
                  style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 300, fontStyle: 'italic', color: TEXT,
                    background: 'transparent', border: 'none',
                    borderBottom: `1px solid ${ROSE}44`, outline: 'none',
                    textAlign: 'center', cursor: 'pointer', padding: '2px 0',
                    display: 'block', margin: '0 auto 4px', width: 'auto' }}/>
              ) : (
                <div>
                  {/* Day of week + day number + month */}
                  {d && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 14, marginBottom: 4 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.38em',
                          textTransform: 'uppercase', color: MUTED, margin: 0 }}>
                          {d.toLocaleDateString('ro-RO', { weekday: 'long' }).toUpperCase()}
                        </p>
                        <div style={{ width: '100%', height: 0.5, background: `${MUTED}44`, marginTop: 3 }}/>
                      </div>
                      <span style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 300, color: TEXT, lineHeight: 0.9 }}>
                        {d.getDate()}
                      </span>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.38em',
                          textTransform: 'uppercase', color: MUTED, margin: 0 }}>
                          {d.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' }).toUpperCase()}
                        </p>
                        <div style={{ width: '100%', height: 0.5, background: `${MUTED}44`, marginTop: 3 }}/>
                      </div>
                    </div>
                  )}
                  {!d && (
                    <p style={{ fontFamily: SERIF, fontSize: 18, fontStyle: 'italic', color: TEXT }}>{dateStrFull}</p>
                  )}
                </div>
              )}
            </Reveal>

            {/* Countdown */}
            {profile.showCountdown && profile.weddingDate && !countdown.expired && (
              <Reveal delay={580}>
                <div style={{ margin: '20px 0 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.4em',
                      textTransform: 'uppercase', color: MUTED, padding: '4px 16px', borderRadius: 99,
                      background: `${ROSE}12`, border: `1px solid ${ROSE}35` }}>
                      ✿ Timp rămas
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 6 }}>
                    {[countdown.days, countdown.hours, countdown.minutes, countdown.seconds].map((v, i) => (
                      <React.Fragment key={i}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 54, height: 62,
                            background: 'rgba(255,255,255,0.8)', border: `1px solid ${ROSE}33`,
                            borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: `0 2px 12px rgba(42,33,24,0.06), inset 0 1px 0 white` }}>
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%',
                              height: 0.5, background: `${ROSE}22` }}/>
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
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: ROSE_D,
                      animation: 'eb-cd-pulse 2.5s ease-in-out infinite', opacity: 0.7 }}/>
                    <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700,
                      letterSpacing: '0.35em', textTransform: 'uppercase', color: `${MUTED}88` }}>live</span>
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal delay={620}>
              <div style={{ margin: '24px 0' }}><GoldLineDivider/></div>
            </Reveal>

            {/* Guest badge */}
            {guest?.name && (
              <Reveal delay={660}>
                <div style={{ display: 'inline-block', border: `1px solid ${ROSE}44`,
                  borderRadius: 2, padding: '14px 28px', margin: '0 0 8px',
                  background: 'rgba(255,255,255,0.6)' }}>
                  <p style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.44em',
                    textTransform: 'uppercase', color: MUTED, margin: '0 0 6px' }}>Dragă</p>
                  <p style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 300, fontStyle: 'italic',
                    color: TEXT, margin: 0 }}>{guest.name}</p>
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
                <div key={block.id} className={cn("relative group/block", !isVisible && editMode && "opacity-30")}>
                  {editMode && (
                    <BlockToolbar
                      onUp={() => movBlock(realIdx, -1)} onDown={() => movBlock(realIdx, 1)}
                      onToggle={() => updBlock(realIdx, { show: !isVisible })} onDelete={() => delBlock(realIdx)}
                      visible={isVisible} isFirst={realIdx === 0} isLast={realIdx === blocks.length - 1}
                    />
                  )}

                  {block.type === 'location' && (
                    <LocCard block={block} editMode={editMode} onUpdate={p => updBlock(realIdx, p)} idx={locIdx}/>
                  )}

                  {block.type === 'godparents' && (
                    <Reveal>
                      <Card style={{ textAlign: 'center' }}>
                        <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Nașii Noștri'}
                          onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                          style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.44em',
                            textTransform: 'uppercase', color: ROSE_D, margin: '0 0 10px', display: 'block', opacity: 0.8 }}/>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..." multiline
                          style={{ fontFamily: SERIF, fontSize: 13, fontStyle: 'italic', color: MUTED,
                            margin: '0 0 14px', lineHeight: 1.7, display: 'block' }}/>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {godparents.map((g: any, i: number) => (
                            <div key={i} className={cn("flex items-center justify-center gap-2", editMode && "group/gp")}>
                              <InlineEdit tag="span" editMode={editMode} value={g.godfather || ''} onChange={v => updGodparent(i, 'godfather', v)} placeholder="Naș"
                                style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 300, color: TEXT }}/>
                              <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: ROSE_D, margin: '0 8px' }}>&</span>
                              <InlineEdit tag="span" editMode={editMode} value={g.godmother || ''} onChange={v => updGodparent(i, 'godmother', v)} placeholder="Nașă"
                                style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 300, color: TEXT }}/>
                              {editMode && <button type="button" onClick={() => delGodparent(i)} className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400"/></button>}
                            </div>
                          ))}
                          {editMode && <button type="button" onClick={addGodparent}
                            className="text-[10px] font-bold border border-dashed rounded-full px-2 py-0.5 flex items-center gap-1 mx-auto"
                            style={{ color: ROSE_D, borderColor: `${ROSE}55` }}>
                            <Plus className="w-2.5 h-2.5"/> adaugă
                          </button>}
                        </div>
                      </Card>
                    </Reveal>
                  )}

                  {block.type === 'parents' && (
                    <Reveal>
                      <Card style={{ textAlign: 'center' }}>
                        <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Părinții Noștri'}
                          onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                          style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.44em',
                            textTransform: 'uppercase', color: ROSE_D, margin: '0 0 10px', display: 'block', opacity: 0.8 }}/>
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
                              style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 300, color: TEXT, margin: '1px 0' }}/>;
                          })}
                        </div>
                      </Card>
                    </Reveal>
                  )}

                  {block.type === 'text' && (
                    <Reveal>
                      <div style={{ textAlign: 'center', padding: '6px 0' }}>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Text liber..." multiline
                          style={{ fontFamily: SERIF, fontSize: 15, fontStyle: 'italic', color: MUTED, lineHeight: 1.85 }}/>
                      </div>
                    </Reveal>
                  )}

                  {block.type === 'title' && (
                    <Reveal>
                      <div style={{ textAlign: 'center', padding: '4px 0' }}>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Titlu secțiune..."
                          style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.44em',
                            textTransform: 'uppercase', color: ROSE_D, opacity: 0.8 }}/>
                      </div>
                    </Reveal>
                  )}

                  {block.type === 'divider' && <Reveal><RoseDivider/></Reveal>}
                  {block.type === 'spacer'  && <div style={{ height: 16 }}/>}
                </div>
              );
            })}
          </div>

          {/* Add block */}
          {editMode && (
            <div className="text-center mt-4 py-4 border-2 border-dashed rounded transition-colors"
              style={{ borderColor: `${ROSE}33` }}>
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
                    style={{ color: ROSE_D, borderColor: `${ROSE}55`, fontFamily: SANS }}>
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
                  textTransform: 'uppercase', color: ROSE_D, textAlign: 'center', margin: '0 0 18px', opacity: 0.8 }}>
                  Programul Zilei
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {timeline.map((item: any, i: number) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '52px 22px 1fr',
                      alignItems: 'stretch', minHeight: 40 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                        paddingRight: 8, paddingTop: 2 }}>
                        <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: ROSE_D }}>{item.time}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ROSE,
                          border: `1.5px solid ${ROSE_D}`, marginTop: 3, flexShrink: 0, opacity: 0.8 }}/>
                        {i < timeline.length - 1 && (
                          <div style={{ flex: 1, width: 0.7, background: `${ROSE}30`, marginTop: 2 }}/>
                        )}
                      </div>
                      <div style={{ paddingLeft: 10, paddingTop: 2,
                        paddingBottom: i < timeline.length - 1 ? 18 : 0 }}>
                        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 400, color: TEXT, opacity: 0.72 }}>
                          {item.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>
          )}

          {/* Couple silhouette — above RSVP */}
          <Reveal delay={100}>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, marginBottom: -8 }}>
              <div style={{ animation: contentVis ? 'eb-couple-float 5s ease-in-out infinite' : 'none' }}>
                <CoupleSilhouette/>
              </div>
            </div>
          </Reveal>

          {/* RSVP */}
          {showRsvp && (
            <Reveal>
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <RoseDivider/>
                <div style={{ marginTop: 24 }}>
                  {editMode ? (
                    <div style={{ display: 'inline-block', padding: '16px 44px',
                      background: ROSE_D, borderRadius: 1 }}>
                      <InlineEdit tag="span" editMode={editMode} value={rsvpText}
                        onChange={v => upProfile('rsvpButtonText', v)}
                        style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10,
                          letterSpacing: '0.42em', textTransform: 'uppercase', color: 'white', cursor: 'text' }}/>
                    </div>
                  ) : (
                    <button onClick={() => onOpenRSVP && onOpenRSVP()}
                      style={{ padding: '16px 48px', background: ROSE_D, border: 'none',
                        borderRadius: 1, cursor: 'pointer',
                        fontFamily: SANS, fontWeight: 700, fontSize: 10,
                        letterSpacing: '0.42em', textTransform: 'uppercase', color: 'white',
                        boxShadow: `0 6px 24px ${ROSE_D}44, inset 0 1px 0 rgba(255,255,255,0.15)`,
                        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = TEXT;
                        (e.currentTarget as HTMLButtonElement).style.letterSpacing = '0.5em';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = ROSE_D;
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
          <Reveal delay={150}>
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <GoldLineDivider/>
              <p style={{ fontFamily: SERIF, fontSize: 11, fontStyle: 'italic',
                color: `${MUTED}88`, marginTop: 14 }}>
                cu drag · WeddingPro
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
};

export default EternBotanicaTemplate;
