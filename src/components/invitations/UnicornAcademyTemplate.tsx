import React, { useState, useEffect, useRef, useCallback } from "react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { getUnicornTheme } from "./castleDefaults";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";
import type { InvitationBlock, InvitationBlockType } from "../../types";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload, Camera, Music, Play, Pause, SkipBack, SkipForward,
} from "lucide-react";

const API_URL =
  (typeof window !== "undefined" && (window as any).__API_URL__) ||
  (import.meta as any)?.env?.VITE_API_URL ||
  "http://localhost:3005/api";

function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const _session = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
  fetch(`${API_URL}/upload`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${_session?.token || ""}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

export const meta: TemplateMeta = {
  id: 'unicorn-academy',
  name: 'Unicorn Academy',
  category: 'kids',
  description: 'Magie purpurie — Sophia & Wildstar te invită la petrecere, cu lumini de stele și corn de unicorn.',
  colors: ['#3a006f', '#F5A623', '#DDB6F8'],
  previewClass: "bg-purple-950 border-yellow-500",
  elementsClass: "bg-yellow-500",
};

// ─── IMAGE DATA (base64 embedded) ────────────────────────────────────────────
const IMG_SOPHIA = "/unicornacademy/sophia.jpg";
const IMG_WILDSTAR = "/unicornacademy/wildstar.jpg";
const IMG_BG = "/unicornacademy/bg.jpg";
const IMG_MEDALLION = "/unicornacademy/medallion.jpg";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const F = {
  display : "'Cinzel','Trajan Pro','Times New Roman',serif",
  body    : "'Nunito','Quicksand',sans-serif",
  label   : "'Cinzel','Times New Roman',serif",
} as const;

let C = {
  purple      : "#3a006f",
  purpleMid   : "#5c0099",
  purpleLight : "#7c18c0",
  purpleGlow  : "#9b30e0",
  lavender    : "#DDB6F8",
  lavLight    : "#EED9FF",
  gold        : "#F5A623",
  goldDeep    : "#C8860F",
  goldPale    : "#FFD580",
  goldGlow    : "rgba(245,166,35,0.4)",
  white       : "#FFFFFF",
  offWhite    : "#F8F0FF",
  starBlue    : "#88C8FF",
  starPink    : "#FF88C8",
  shadow      : "rgba(0,0,0,0.55)",
};

const hexToRgba = (hex: string, alpha: number) => {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return hex;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const UA_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes ua-float       { 0%,100%{transform:translateY(0)rotate(0deg)}50%{transform:translateY(-12px)rotate(1.5deg)} }
  @keyframes ua-floatR      { 0%,100%{transform:translateY(0)rotate(0deg)}50%{transform:translateY(-10px)rotate(-1.5deg)} }
  @keyframes ua-spin        { 0%{transform:rotate(0deg)}100%{transform:rotate(360deg)} }
  @keyframes ua-spinSlow    { 0%{transform:rotate(0deg)}100%{transform:rotate(360deg)} }
  @keyframes ua-pulse       { 0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.12)} }
  @keyframes ua-glow        { 0%,100%{box-shadow:0 0 18px rgba(245,166,35,.35)}50%{box-shadow:0 0 42px rgba(245,166,35,.75),0 0 80px rgba(245,166,35,.3)} }
  @keyframes ua-twinkle     { 0%,100%{opacity:.2;transform:scale(.7)rotate(0deg)}50%{opacity:1;transform:scale(1.4)rotate(20deg)} }
  @keyframes ua-slideUp     { 0%{transform:translateY(36px);opacity:0}100%{transform:translateY(0);opacity:1} }
  @keyframes ua-slideLeft   { 0%{transform:translateX(-60px);opacity:0}100%{transform:translateX(0);opacity:1} }
  @keyframes ua-slideRight  { 0%{transform:translateX(60px);opacity:0}100%{transform:translateX(0);opacity:1} }
  @keyframes ua-popIn       { 0%{transform:scale(0)rotate(-8deg);opacity:0}65%{transform:scale(1.1)rotate(3deg);opacity:1}100%{transform:scale(1)rotate(0);opacity:1} }
  @keyframes ua-fadeIn      { 0%{opacity:0}100%{opacity:1} }
  @keyframes ua-starBurst   { 0%{transform:scale(0)rotate(0deg);opacity:0}40%{transform:scale(1.3)rotate(180deg);opacity:1}70%{transform:scale(.95)rotate(340deg);opacity:1}100%{transform:scale(1)rotate(360deg);opacity:1} }
  @keyframes ua-hornGlow    { 0%,100%{filter:drop-shadow(0 0 6px rgba(245,166,35,.5))}50%{filter:drop-shadow(0 0 22px rgba(245,166,35,1))drop-shadow(0 0 40px rgba(200,134,15,.6))} }
  @keyframes ua-drift       { 0%{transform:translateX(0)translateY(0)}25%{transform:translateX(12px)translateY(-8px)}50%{transform:translateX(5px)translateY(-16px)}75%{transform:translateX(-8px)translateY(-6px)}100%{transform:translateX(0)translateY(0)} }
  @keyframes ua-shimmer     { 0%{background-position:-200% 0}100%{background-position:200% 0} }
  @keyframes ua-flip        { 0%{transform:translateY(-5px);opacity:.3}100%{transform:translateY(0);opacity:1} }
  @keyframes ua-bgPulse     { 0%,100%{opacity:.08}50%{opacity:.18} }
  @keyframes ua-borderRot   { 0%{transform:rotate(0deg)}100%{transform:rotate(360deg)} }
  @keyframes ua-countIn     { 0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1} }
`;

// ─── SCROLL-REVEAL HOOK ───────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(threshold = 0.1): [React.RefObject<T>, boolean] {
  const ref  = useRef<T>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; from?: 'bottom'|'left'|'right'|'fade'; style?: React.CSSProperties }> =
  ({ children, delay = 0, from = 'bottom', style }) => {
  const [ref, vis] = useReveal<HTMLDivElement>();
  const t: Record<string,string> = { bottom:'translateY(30px)', left:'translateX(-30px)', right:'translateX(30px)', fade:'translateY(0)' };
  return (
    <div ref={ref} style={{ opacity: vis?1:0, transform: vis?'translate(0,0)':t[from],
      transition:`opacity .7s ${delay}s cubic-bezier(.22,1,.36,1),transform .7s ${delay}s cubic-bezier(.22,1,.36,1)`, ...style }}>
      {children}
    </div>
  );
};

// ─── ANIMATED STAR PARTICLES ──────────────────────────────────────────────────
const StarField: React.FC<{ count?: number; dark?: boolean }> = ({ count = 32, dark = false }) => {
  const stars = useRef(Array.from({ length: count }, (_, i) => ({
    x: (i * 137.5) % 100, y: (i * 97.3) % 100,
    size: 0.5 + (i % 5) * 0.5,
    delay: (i % 13) * 0.6, dur: 2.5 + (i % 7) * 0.8,
    bright: i % 3 === 0,
  }))).current;
  return (
    <>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          fontSize: s.bright ? 14 + s.size * 4 : 8,
          color: [C.gold, C.starBlue, C.starPink, C.white][i % 4],
          opacity: s.bright ? 0.7 : 0.3,
          animation: `ua-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          pointerEvents: 'none', userSelect: 'none', zIndex: 1,
        }}>{s.bright ? '✦' : '·'}</div>
      ))}
    </>
  );
};

// ─── GOLD FRAME (circular, like in the show) ─────────────────────────────────
const GoldFrame: React.FC<{ src: string; size: number; float?: boolean; floatDelay?: number }> =
  ({ src, size, float = false, floatDelay = 0 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', position: 'relative',
    animation: float ? `ua-float 4s ${floatDelay}s ease-in-out infinite` : undefined,
    flexShrink: 0,
  }}>
    {/* Outer spinning ring */}
    <div style={{
      position: 'absolute', inset: -4, borderRadius: '50%',
      border: `3px solid transparent`,
      borderTopColor: C.gold, borderRightColor: C.goldPale,
      animation: 'ua-spinSlow 8s linear infinite',
    }}/>
    {/* Gold frame base */}
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      border: `4px solid ${C.gold}`,
      boxShadow: `0 0 18px ${C.goldGlow}, inset 0 0 12px ${hexToRgba(C.gold,.15)}, 0 0 0 2px ${C.goldDeep}`,
      animation: 'ua-glow 3s ease-in-out infinite',
      zIndex: 2,
    }}/>
    {/* Inner accent ring */}
    <div style={{
      position: 'absolute', inset: 5, borderRadius: '50%',
      border: `1.5px solid ${hexToRgba(C.gold,.4)}`,
      zIndex: 2,
    }}/>
    {/* Image */}
    <img src={src} alt="" style={{
      width: '100%', height: '100%', borderRadius: '50%',
      objectFit: 'cover', display: 'block', position: 'relative', zIndex: 1,
    }}/>
    {/* Bottom ornament (like the show's frame) */}
    <svg style={{ position:'absolute', bottom:-18, left:'50%', transform:'translateX(-50%)', zIndex:3, opacity:0.8 }}
      width="48" height="22" viewBox="0 0 48 22" fill="none">
      <path d="M4 2 Q24 18 44 2" stroke={C.gold} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="4" cy="2" r="2.5" fill={C.gold}/>
      <circle cx="44" cy="2" r="2.5" fill={C.gold}/>
      <circle cx="24" cy="16" r="4" fill={C.gold}/>
      <circle cx="24" cy="16" r="2" fill={C.goldPale}/>
    </svg>
  </div>
);

// ─── GOLD STAR MEDALLION ──────────────────────────────────────────────────────
const StarMedallion: React.FC<{ size?: number; style?: React.CSSProperties }> =
  ({ size = 56, style }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', position: 'relative',
    animation: 'ua-hornGlow 2.5s ease-in-out infinite', flexShrink: 0, ...style }}>
    <img src={IMG_MEDALLION} alt="★" style={{ width:'100%', height:'100%',
      borderRadius:'50%', objectFit:'cover', display:'block' }}/>
  </div>
);

// ─── UNICORN HORN SVG ─────────────────────────────────────────────────────────
const UnicornHorn: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size * 1.8} viewBox="0 0 36 65" fill="none"
    style={{ animation: 'ua-hornGlow 2.5s ease-in-out infinite', filter:`drop-shadow(0 0 8px ${C.goldGlow})` }}>
    <path d="M18 0 L26 55 L18 62 L10 55 Z" fill="url(#horn-grad)"/>
    <path d="M18 0 L26 55" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
    <path d="M18 0 L10 55" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
    {[10,20,30,40,50].map((y,i)=>
      <ellipse key={i} cx="18" cy={y} rx={3+i*0.8} ry={1} fill="rgba(255,255,255,0.2)"/>)}
    <defs>
      <linearGradient id="horn-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={C.goldPale}/>
        <stop offset="50%" stopColor={C.gold}/>
        <stop offset="100%" stopColor={C.goldDeep}/>
      </linearGradient>
    </defs>
  </svg>
);

// ─── GOLD DIVIDER ─────────────────────────────────────────────────────────────
const GoldDivider: React.FC<{ medallion?: boolean }> = ({ medallion = false }) => (
  <div style={{ display:'flex', alignItems:'center', gap:12, margin:'4px 0' }}>
    <div style={{ flex:1, height:'1px', background:`linear-gradient(to right,transparent,${C.gold})`, opacity:.5 }}/>
    {medallion
      ? <StarMedallion size={36}/>
      : <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 1 L11.8 7.8 L19 10 L11.8 12.2 L10 19 L8.2 12.2 L1 10 L8.2 7.8 Z"
            fill={C.gold} opacity=".85"/>
        </svg>}
    <div style={{ flex:1, height:'1px', background:`linear-gradient(to left,transparent,${C.gold})`, opacity:.5 }}/>
  </div>
);

// ─── LOCATION CARD ────────────────────────────────────────────────────────────
const LocCard: React.FC<{
  label: string; time?: string; name?: string; address?: string; wazeLink?: string;
  editMode?: boolean;
  onLabelChange?: (v: string) => void;
  onTimeChange?: (v: string) => void;
  onNameChange?: (v: string) => void;
  onAddressChange?: (v: string) => void;
  onWazeChange?: (v: string) => void;
}> = ({ label, time, name, address, wazeLink, editMode = false, onLabelChange, onTimeChange, onNameChange, onAddressChange, onWazeChange }) => {
  if (!editMode && !name && !time && !address && !wazeLink) return null;
  const enc = address ? encodeURIComponent(address) : '';
  return (
    <div style={{
      background: `linear-gradient(135deg,${hexToRgba(C.purpleMid,.55)},${hexToRgba(C.purple,.7)})`,
      border: `1.5px solid ${hexToRgba(C.gold,.3)}`,
      borderTop: `3px solid ${C.gold}`,
      borderRadius: 16, padding: '18px 22px',
      backdropFilter: 'blur(8px)',
      boxShadow: `0 6px 28px rgba(0,0,0,.45), inset 0 1px 0 ${hexToRgba(C.gold,.12)}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(90deg,transparent,${hexToRgba(C.gold,.04)},transparent)`,
        backgroundSize:'200% 100%', animation:'ua-shimmer 4s linear infinite', pointerEvents:'none' }}/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 .5 L7 4.8 L11.5 6 L7 7.2 L6 11.5 L5 7.2 L.5 6 L5 4.8 Z" fill={C.gold}/>
          </svg>
          <InlineEdit tag="p" editMode={editMode} value={label} onChange={v => onLabelChange?.(v)}
            textLabel="Locatie - eticheta"
            style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.5em', textTransform:'uppercase', color:C.gold, margin:0, opacity:.85 }}/>
        </div>
        {(time !== undefined || editMode) && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke={C.lavender} strokeWidth=".8" opacity=".7"/>
              <path d="M6.5 3.5 L6.5 6.5 L8.8 8.5" stroke={C.lavender} strokeWidth=".9"
                strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
            </svg>
            <InlineTime editMode={editMode} value={time || ''} onChange={v => onTimeChange?.(v)}
              textKey="loc-time" textLabel="Locatie - ora"
              style={{ fontFamily:F.body, fontSize:22, fontWeight:800, color:C.lavender, margin:0, letterSpacing:1 }}/>
          </div>
        )}
        <InlineEdit tag="p" editMode={editMode} value={name || ''} onChange={v => onNameChange?.(v)}
          placeholder="Nume locatie..." textLabel="Locatie - nume"
          style={{ fontFamily:F.label, fontSize:12, color:C.white, margin:'0 0 3px', letterSpacing:.5, lineHeight:1.5 }}/>
        {(address || editMode) && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginTop:5 }}>
            <svg width="10" height="13" viewBox="0 0 10 14" fill="none" style={{ flexShrink:0, marginTop:2 }}>
              <path d="M5 0C2.8 0 1 1.8 1 4c0 3 4 9 4 9s4-6 4-9C9 1.8 7.2 0 5 0z" fill={`${C.gold}88`}/>
              <circle cx="5" cy="4" r="1.5" fill={C.purpleMid}/>
            </svg>
            <InlineEdit tag="p" editMode={editMode} value={address || ''} onChange={v => onAddressChange?.(v)}
              placeholder="Adresa..." textLabel="Locatie - adresa"
              style={{ fontFamily:F.body, fontSize:11, fontWeight:600, color:hexToRgba(C.lavender,.55), margin:0, lineHeight:1.6, fontStyle:'italic' }}/>
          </div>
        )}
        {editMode && (
          <div style={{ marginTop:8 }}>
            <InlineWaze editMode={editMode} value={wazeLink || ''} onChange={v => onWazeChange?.(v)}/>
          </div>
        )}
        {!editMode && (wazeLink || address) && (
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:12 }}>
            {wazeLink && (
              <a href={wazeLink} target="_blank" rel="noopener noreferrer" style={{
                display:'inline-flex', alignItems:'center', gap:5, padding:'6px 16px',
                borderRadius:50, background:C.gold, color:C.purple,
                fontFamily:F.label, fontSize:9, letterSpacing:'.3em', textTransform:'uppercase',
                textDecoration:'none', fontWeight:700, boxShadow:`0 3px 12px ${C.goldGlow}`,
              }}>✦ Waze</a>
            )}
            {address && (
              <a href={`https://maps.google.com/?q=${enc}`} target="_blank" rel="noopener noreferrer" style={{
                display:'inline-flex', alignItems:'center', gap:5, padding:'6px 16px',
                borderRadius:50, background:'transparent', color:C.gold,
                border:`1.5px solid ${hexToRgba(C.gold,.5)}`,
                fontFamily:F.label, fontSize:9, letterSpacing:'.3em', textTransform:'uppercase',
                textDecoration:'none',
              }}>◉ Maps</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────
interface TimeLeft { days:number; hours:number; minutes:number; seconds:number; total:number }
function calcTimeLeft(date: string): TimeLeft {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0, total:0 };
  return { days:Math.floor(diff/86400000), hours:Math.floor((diff/3600000)%24),
    minutes:Math.floor((diff/60000)%60), seconds:Math.floor((diff/1000)%60), total:diff };
}

const FlipDigit: React.FC<{ value:number; label:string }> = ({ value, label }) => {
  const prev  = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 300);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <div style={{
        width:58, height:66,
        background:`linear-gradient(160deg,${C.purpleMid},${C.purple})`,
        border:`1.5px solid ${hexToRgba(C.gold,.45)}`,
        borderRadius:12,
        display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', overflow:'hidden',
        boxShadow:`0 4px 18px rgba(0,0,0,.5), inset 0 1px 0 ${hexToRgba(C.gold,.15)}`,
        transform: flash ? 'scale(1.07)' : 'scale(1)',
        transition:'transform .15s',
      }}>
        <div style={{ position:'absolute', inset:0,
          background:`linear-gradient(135deg,${hexToRgba(C.gold,.12)},transparent)`,
          pointerEvents:'none' }}/>
        <span style={{
          fontFamily:F.display, fontSize:26, fontWeight:600,
          color: flash ? C.goldPale : C.white, lineHeight:1,
          textShadow:`0 0 16px ${hexToRgba(C.gold,flash?.5:.2)}`,
          transition:'color .3s',
        }}>{String(value).padStart(2,'0')}</span>
      </div>
      <span style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.38em',
        textTransform:'uppercase', color:hexToRgba(C.lavender,.6) }}>{label}</span>
    </div>
  );
};

const Countdown: React.FC<{ targetDate: string | undefined }> = ({ targetDate }) => {
  const [tl, setTl]       = useState<TimeLeft|null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    if (!targetDate) return;
    setTl(calcTimeLeft(targetDate));
    const id = setInterval(() => setTl(calcTimeLeft(targetDate!)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  if (!ready || !targetDate) return null;
  if (tl?.total === 0) return (
    <div style={{ textAlign:'center', padding:'12px 20px',
      border:`1.5px solid ${hexToRgba(C.gold,.25)}`, borderRadius:12,
      background:hexToRgba(C.purpleMid,.3) }}>
      <p style={{ fontFamily:F.label, fontSize:9, letterSpacing:'.45em',
        textTransform:'uppercase', color:C.gold, margin:0 }}>✦ Evenimentul a avut loc ✦</p>
    </div>
  );
  const isSoon = (tl?.total ?? 0) < 86400000;
  const vals = [tl?.days??0, tl?.hours??0, tl?.minutes??0, tl?.seconds??0];
  const lbls = ['Zile','Ore','Min','Sec'];
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
        <span style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.48em',
          textTransform:'uppercase', color:C.gold, opacity:.75,
          padding:'4px 16px', border:`1px solid ${hexToRgba(C.gold,.2)}`, borderRadius:50 }}>
          {isSoon ? '✦ Mâine ✦' : 'Timp rămas'}
        </span>
      </div>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-start', gap:8 }}>
        {vals.map((v,i) => (
          <React.Fragment key={i}>
            <FlipDigit value={v} label={lbls[i]}/>
            {i < 3 && <span style={{ fontFamily:F.display, fontSize:22,
              color:hexToRgba(C.lavender,.4), paddingTop:16, flexShrink:0 }}>:</span>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:5, marginTop:10 }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background:C.gold,
          animation:'ua-pulse 2s ease-in-out infinite' }}/>
        <span style={{ fontFamily:F.label, fontSize:7, letterSpacing:'.35em',
          textTransform:'uppercase', color:hexToRgba(C.gold,.4) }}>live</span>
      </div>
    </div>
  );
};

// ─── INTRO — MAGIC PORTAL OPENING ────────────────────────────────────────────
interface IntroProps { l1: string; l2: string; onDone: () => void }

const UnicornIntro: React.FC<IntroProps> = ({ l1, l2, onDone }) => {
  const showSecond = Boolean(l2 && l2 !== l1);
  // 0=dark  1=bg+stars  2=medallion spins in  3=characters slide in  4=title reveals  5=hold  6=fade
  const [phase, setPhase] = useState(0);
  const [fade,  setFade]  = useState(false);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1150),
      setTimeout(() => setPhase(4), 1700),
      setTimeout(() => setPhase(5), 2500),
      setTimeout(() => { setFade(true); setTimeout(onDone, 750); }, 3200),
    ];
    return () => t.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'#1a0030',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      overflow:'hidden',
      opacity: fade ? 0 : 1,
      transition: fade ? 'opacity .75s ease' : 'none',
      pointerEvents: fade ? 'none' : 'auto',
    }}>
      <style>{UA_CSS}</style>

      {/* Purple starry background */}
      <div style={{
        position:'absolute', inset:0,
        background:`linear-gradient(160deg,${C.purple} 0%,${C.purpleMid} 50%,${C.purpleLight} 100%)`,
        opacity: phase >= 1 ? 1 : 0,
        transition:'opacity .8s ease',
      }}/>

      {/* Extra star field overlay */}
      <div style={{ position:'absolute', inset:0, zIndex:1 }}>
        <StarField count={28}/>
      </div>

      {/* Glow radial center */}
      <div style={{
        position:'absolute', left:'50%', top:'50%',
        transform:'translate(-50%,-50%)',
        width:400, height:400, borderRadius:'50%',
        background:`radial-gradient(circle,${hexToRgba(C.purpleMid,.45)} 0%,transparent 70%)`,
        opacity: phase >= 2 ? 1 : 0,
        transition:'opacity .6s',
        pointerEvents:'none', zIndex:2,
        animation: phase >= 2 ? 'ua-bgPulse 3s ease-in-out infinite' : 'none',
      }}/>

      {/* Star Medallion — spins in */}
      <div style={{
        position:'relative', zIndex:10, marginBottom:8,
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
        transition:'opacity .6s, transform .6s cubic-bezier(.34,1.4,.64,1)',
      }}>
        <StarMedallion size={72}/>
      </div>

      {/* UNICORN ACADEMY title */}
      <div style={{
        textAlign:'center', zIndex:10,
        opacity: phase >= 4 ? 1 : 0,
        transform: phase >= 4 ? 'translateY(0) scale(1)' : 'translateY(16px) scale(.9)',
        transition:'opacity .5s, transform .5s cubic-bezier(.22,1,.36,1)',
        marginBottom:4,
      }}>
        <p style={{ fontFamily:F.label, fontSize:9, letterSpacing:'.65em',
          textTransform:'uppercase', color:C.gold, margin:'0 0 4px', opacity:.85 }}>
          ✦ UNICORN ACADEMY ✦
        </p>
        <h1 style={{
          fontFamily:F.display, fontWeight:900,
          fontSize:'clamp(34px,9vw,58px)',
          color:C.offWhite, margin:'0 0 4px', lineHeight:1.05, letterSpacing:3,
          textShadow:`0 0 32px ${hexToRgba(C.gold,.5)}, 0 2px 0 rgba(0,0,0,.6)`,
        }}>
          {showSecond ? `${l1} & ${l2}` : l1}
        </h1>
        <p style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.5em',
          textTransform:'uppercase', color:hexToRgba(C.lavender,.6), margin:0 }}>
          — te invită la petrecere —
        </p>
      </div>

      {/* Characters row */}
      <div style={{
        display:'flex', alignItems:'flex-end', gap:20,
        zIndex:10, marginTop:18,
      }}>
        {/* Sophia */}
        <div style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateX(0)' : 'translateX(-80px)',
          transition:'opacity .55s .05s, transform .55s .05s cubic-bezier(.22,1,.36,1)',
        }}>
          <GoldFrame src={IMG_SOPHIA} size={110} float floatDelay={0}/>
        </div>

        {/* Horn in center */}
        <div style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(.5)',
          transition:'opacity .5s .2s, transform .55s .2s cubic-bezier(.34,1.4,.64,1)',
          flexShrink:0,
        }}>
          <UnicornHorn size={32}/>
        </div>

        {/* Wildstar */}
        <div style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateX(0)' : 'translateX(80px)',
          transition:'opacity .55s .1s, transform .55s .1s cubic-bezier(.22,1,.36,1)',
        }}>
          <GoldFrame src={IMG_WILDSTAR} size={110} float floatDelay={0.5}/>
        </div>
      </div>

      {/* Light magic tagline */}
      <p style={{
        fontFamily:F.label, fontSize:9, letterSpacing:'.55em',
        textTransform:'uppercase', color:hexToRgba(C.gold,.5),
        marginTop:20, zIndex:10,
        opacity: phase >= 5 ? 1 : 0,
        transition:'opacity .5s',
      }}>✦ Light Magic ✦</p>
    </div>
  );
};

// ─── NAV BUTTONS ─────────────────────────────────────────────────────────────
const NavBtns: React.FC<{ address?:string; wazeLink?:string }> = ({ address, wazeLink }) => {
  if (!address && !wazeLink) return null;
  const enc = address ? encodeURIComponent(address) : '';
  return (
    <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:12 }}>
      {wazeLink && (
        <a href={wazeLink} target="_blank" rel="noopener noreferrer" style={{
          display:'inline-flex', alignItems:'center', gap:5, padding:'5px 14px',
          fontFamily:F.label, fontSize:8, letterSpacing:'.3em', textTransform:'uppercase',
          textDecoration:'none', color:C.purple,
          background:C.gold, borderRadius:50,
          boxShadow:`0 3px 10px ${C.goldGlow}`,
        }}>✦ Waze</a>
      )}
      {address && (
        <a href={`https://maps.google.com/?q=${enc}`} target="_blank" rel="noopener noreferrer" style={{
          display:'inline-flex', alignItems:'center', gap:5, padding:'5px 14px',
          fontFamily:F.label, fontSize:8, letterSpacing:'.3em', textTransform:'uppercase',
          textDecoration:'none', color:C.gold,
          border:`1.5px solid ${hexToRgba(C.gold,.4)}`, borderRadius:50,
          background:'transparent',
        }}>◉ Maps</a>
      )}
    </div>
  );
};

// ─── BLOCK TOOLBAR & INSERT ───────────────────────────────────────────────────
const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: "🖼", text: "✏️", location: "📍", calendar: "📅", countdown: "⏱",
  timeline: "🕒", music: "🎵", gift: "🎁", whatsapp: "💬", rsvp: "✉️",
  divider: "—", family: "👨‍👩‍👧", date: "📆", description: "📝",
};

const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-4 right-2 flex items-center gap-1 rounded-full border bg-white shadow-lg px-2 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-[9999999999999999999999] pointer-events-none group-hover/block:pointer-events-auto">
    <button onClick={onUp} disabled={isFirst} className="p-1 rounded-full hover:bg-purple-50 disabled:opacity-20"><ChevronUp className="w-3 h-3 text-purple-600"/></button>
    <button onClick={onDown} disabled={isLast} className="p-1 rounded-full hover:bg-purple-50 disabled:opacity-20"><ChevronDown className="w-3 h-3 text-purple-600"/></button>
    <div className="w-px h-3 bg-purple-100 mx-1" />
    <button onClick={onToggle} className="p-1 rounded-full hover:bg-purple-50">
      {visible ? <Eye className="w-3 h-3 text-purple-600"/> : <EyeOff className="w-3 h-3 text-gray-400"/>}
    </button>
    <button onClick={onDelete} className="p-1 rounded-full hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-500"/></button>
  </div>
);

const InsertBlockButton: React.FC<{
  insertIdx: number;
  openInsertAt: number | null;
  setOpenInsertAt: (v: number | null) => void;
  BLOCK_TYPES: { type: string; label: string; def: any }[];
  onInsert: (type: string, def: any) => void;
}> = ({ insertIdx, openInsertAt, setOpenInsertAt, BLOCK_TYPES, onInsert }) => {
  const isOpen = openInsertAt === insertIdx;
  const [hovered, setHovered] = React.useState(false);
  const visible = hovered || isOpen;
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", height:32, zIndex:20 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ position:"absolute", left:0, right:0, height:1,
        background:`repeating-linear-gradient(to right,${C.gold} 0,${C.gold} 6px,transparent 6px,transparent 12px)`,
        opacity:.4, zIndex:1 }}/>
      <button type="button" onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{ width:26, height:26, borderRadius:"50%",
          background: isOpen ? C.purple : "white",
          border:`1.5px solid ${C.gold}`, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16, color: isOpen ? "white" : C.purple,
          boxShadow:"0 2px 10px rgba(0,0,0,0.12)",
          transition:"opacity 0.15s,transform 0.15s,background 0.15s",
          transform: visible ? "scale(1)" : "scale(0.7)", zIndex:2,
          position:"relative", lineHeight:1, fontWeight:700,
        }}>{isOpen ? "x" : "+"}</button>
      {isOpen && (
        <div style={{ position:"absolute", bottom:34, left:"50%", transform:"translateX(-50%)",
          background:"white", borderRadius:16, border:`1px solid ${C.lavender}`,
          boxShadow:`0 16px 48px ${hexToRgba(C.purple,0.18)},0 4px 16px rgba(0,0,0,0.06)`,
          padding:"16px", zIndex:100, width:260 }}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <p style={{ fontFamily:F.label, fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.3em",
            textTransform:"uppercase", color:C.purple, margin:"0 0 10px", textAlign:"center" }}>
            Adauga bloc
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button" onClick={() => onInsert(bt.type, bt.def)}
                style={{ background:C.offWhite, border:`1px solid ${C.lavender}`, borderRadius:10,
                  padding:"8px 4px", cursor:"pointer",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background=C.lavLight; (e.currentTarget as HTMLButtonElement).style.borderColor=C.purple; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background=C.offWhite; (e.currentTarget as HTMLButtonElement).style.borderColor=C.lavender; }}>
                <span style={{ fontSize:18, lineHeight:1 }}>{BLOCK_TYPE_ICONS[bt.type] || "+"}</span>
                <span style={{ fontFamily:F.label, fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.1em",
                  textTransform:"uppercase", color:C.purple, lineHeight:1.2, textAlign:"center" }}>
                  {bt.label.replace(/^[^\s]+\s/, "")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TimelineInsertButton: React.FC<{ editMode: boolean; onAdd: () => void }> = ({ editMode, onAdd }) => {
  if (!editMode) return null;
  return (
    <div style={{ textAlign:"center", marginTop:10 }}>
      <button type="button" onClick={onAdd} style={{
        background:"transparent", border:`1px dashed ${C.lavender}`, borderRadius:999,
        padding:"4px 14px", fontFamily:F.label, fontSize:9, letterSpacing:"0.25em",
        textTransform:"uppercase", color:C.lavender, cursor:"pointer",
      }}>+ Adauga eveniment</button>
    </div>
  );
};

// ─── PHOTO BLOCK ──────────────────────────────────────────────────────────────
const PhotoBlock: React.FC<{
  imageData?: string; altText?: string; editMode: boolean;
  onUpload: (url: string) => void; onAltChange: (v: string) => void; onRemove: () => void;
  aspectRatio?: "1:1"|"4:3"|"3:4"|"16:9"|"free";
}> = ({ imageData, altText, editMode, onUpload, onAltChange, onRemove, aspectRatio = "free" }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const pt: Record<string,string> = { "1:1":"100%","4:3":"75%","3:4":"133%","16:9":"56.25%",free:"66.6%" };
  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    deleteUploadedFile(imageData);
    try {
      const form = new FormData(); form.append("file", file);
      const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, { method:"POST", headers:{ Authorization:`Bearer ${_s?.token||""}` }, body:form });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json(); onUpload(url);
    } catch(e) { console.error(e); } finally { setUploading(false); }
  };
  return (
    <div>
      <div style={{ position:"relative", borderRadius:16, overflow:"hidden", border:`1.5px solid ${C.lavender}`, boxShadow:"0 6px 18px rgba(0,0,0,.35)" }}>
        <div style={{ position:"relative", paddingTop:pt[aspectRatio], overflow:"hidden" }}>
          {imageData ? (
            <img src={imageData} alt={altText||""} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
          ) : (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
              background:`linear-gradient(135deg,${C.purpleMid},${C.purple})`, color:C.lavender,
              cursor:editMode ? "pointer" : "default" }}
              onClick={editMode ? () => fileRef.current?.click() : undefined}>
              {uploading ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"/>
              ) : (
                <div style={{ textAlign:"center" }}>
                  <Upload className="w-8 h-8" style={{ margin:"0 auto 6px", opacity:.85 }}/>
                  <span style={{ fontFamily:F.label, fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" }}>Adauga imagine</span>
                </div>
              )}
            </div>
          )}
          {editMode && imageData && (
            <div className="absolute inset-0 bg-black/35 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="p-2 bg-white rounded-full text-purple-600"><Camera className="w-5 h-5"/></button>
              <button type="button" onClick={() => { deleteUploadedFile(imageData); onRemove(); }} className="p-2 bg-white rounded-full text-red-600"><Trash2 className="w-5 h-5"/></button>
            </div>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f=e.target.files?.[0]; if(f) handleFile(f); }} style={{ display:"none" }}/>
      {editMode && (
        <div style={{ marginTop:8 }}>
          <InlineEdit tag="p" editMode={editMode} value={altText||""} onChange={v => onAltChange(v)} placeholder="Text alternativ..."
            textLabel="Foto · alt" style={{ fontFamily:F.body, fontSize:11, color:C.lavender, margin:0, textAlign:"center" }}/>
        </div>
      )}
    </div>
  );
};

// ─── MUSIC BLOCK ──────────────────────────────────────────────────────────────
const MusicBlock: React.FC<{
  block: InvitationBlock; editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  imperativeRef?: React.MutableRefObject<{ unlock:()=>void; play:()=>void; pause:()=>void }|null>;
}> = ({ block, editMode, onUpdate, imperativeRef }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const mp3Ref = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    const onPlay2 = () => setPlaying(true);
    const onPause2 = () => setPlaying(false);
    a.addEventListener("timeupdate",onTime); a.addEventListener("loadedmetadata",onDur);
    a.addEventListener("ended",onEnd); a.addEventListener("play",onPlay2); a.addEventListener("pause",onPause2);
    return () => {
      a.removeEventListener("timeupdate",onTime); a.removeEventListener("loadedmetadata",onDur);
      a.removeEventListener("ended",onEnd); a.removeEventListener("play",onPlay2); a.removeEventListener("pause",onPause2);
    };
  }, [block.musicUrl, block.musicType]);
  useEffect(() => {
    if (!imperativeRef) return;
    imperativeRef.current = {
      unlock: () => { if (block.musicType==="mp3" && audioRef.current && block.musicUrl) { audioRef.current.play().then(()=>{audioRef.current!.pause();audioRef.current!.currentTime=0;}).catch(()=>{}); } },
      play: () => { if (audioRef.current && block.musicUrl) audioRef.current.play().catch(()=>{}); },
      pause: () => { if (audioRef.current) audioRef.current.pause(); },
    };
  }, [imperativeRef, block.musicType, block.musicUrl]);
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
  const pct = duration ? `${(progress/duration)*100}%` : "0%";
  const toggle = () => { const a=audioRef.current; if(!a) return; if(playing){a.pause();}else{a.play().then(()=>setPlaying(true)).catch(()=>{}); } };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => { if(!audioRef.current||!duration) return; const r=e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*duration; };
  const handleMp3 = async (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    setUploading(true); deleteUploadedFile(block.musicUrl);
    try {
      const form = new FormData(); form.append("file", file);
      const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, { method:"POST", headers:{ Authorization:`Bearer ${_s?.token||""}` }, body:form });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json(); onUpdate({ musicUrl:url, musicType:"mp3" });
    } catch(e) { console.error(e); } finally { setUploading(false); }
  };
  const isActive = !!block.musicUrl;
  return (
    <div style={{ background:C.lavLight, border:`1.5px solid ${playing ? C.purpleLight : hexToRgba(C.lavender,.5)}`, borderRadius:16, padding:"20px 24px",
      transition:"border-color 0.4s,box-shadow 0.4s", boxShadow:playing ? `0 0 0 3px ${hexToRgba(C.purpleLight,0.25)}` : "none" }}>
      <style>{`@keyframes ua-music-bar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}`}</style>
      {block.musicType==="mp3" && block.musicUrl && <audio ref={audioRef} src={block.musicUrl} preload="metadata"/>}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:playing ? C.purple : C.offWhite,
          border:`1.5px solid ${playing ? C.purple : C.lavender}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.3s" }}>
          <Music className="w-4 h-4" style={{ color:playing ? "white" : C.purple }}/>
        </div>
        <span style={{ fontFamily:F.label, fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase",
          color:playing ? C.purple : C.purpleMid, transition:"color 0.3s" }}>
          {playing ? "Se redă acum" : "Melodia zilei"}
        </span>
        {playing && (
          <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:14, marginLeft:"auto" }}>
            {[0,0.2,0.1,0.3].map((delay,i) => (
              <div key={i} style={{ width:3, height:14, background:C.purple, borderRadius:2, transformOrigin:"bottom",
                animation:`ua-music-bar 0.7s ease-in-out ${delay}s infinite` }}/>
            ))}
          </div>
        )}
      </div>
      {!isActive && editMode && (
        <div>
          <button type="button" onClick={() => mp3Ref.current?.click()} disabled={uploading}
            style={{ width:"100%", background:C.offWhite, border:`1px dashed ${C.lavender}`, borderRadius:10, padding:"14px 0",
              cursor:uploading ? "not-allowed" : "pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, opacity:uploading ? 0.7 : 1 }}>
            {uploading ? <div className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"/> : <Upload className="w-5 h-5" style={{ color:C.purple, opacity:.7 }}/>}
            <span style={{ fontFamily:F.label, fontSize:9, color:C.purpleMid, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase" }}>MP3</span>
          </button>
          <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e => { const f=e.target.files?.[0]; if(f) handleMp3(f); }} style={{ display:"none" }}/>
        </div>
      )}
      {!isActive && !editMode && (
        <div style={{ textAlign:"center", padding:"16px 0", opacity:.4 }}>
          <Music className="w-8 h-8" style={{ color:C.purple, display:"block", margin:"0 auto 6px" }}/>
          <p style={{ fontFamily:F.body, fontSize:12, fontStyle:"italic", color:C.purpleMid, margin:0 }}>Melodia va apărea aici</p>
        </div>
      )}
      {isActive && (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
            <div style={{ width:52, height:52, borderRadius:10, background:`linear-gradient(135deg,${C.offWhite},${C.lavLight})`,
              flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", border:`1.5px solid ${C.lavender}` }}>
              <Music className="w-5 h-5" style={{ color:C.purple, opacity:.7 }}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle||""} onChange={v => onUpdate({musicTitle:v})}
                placeholder="Titlul melodiei..." textLabel="Muzica · titlu"
                style={{ fontFamily:F.display, fontSize:14, fontStyle:"italic", color:C.purple, margin:0, lineHeight:1.3 }}/>
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist||""} onChange={v => onUpdate({musicArtist:v})}
                placeholder="Artist..." textLabel="Muzica · artist"
                style={{ fontFamily:F.body, fontSize:10, color:C.purpleMid, margin:"2px 0 0" }}/>
            </div>
          </div>
          <div onClick={seek} style={{ height:4, background:C.lavender, borderRadius:99, marginBottom:6, cursor:"pointer", position:"relative" }}>
            <div style={{ height:"100%", borderRadius:99, background:C.purple, width:pct, transition:"width 0.3s linear" }}/>
            <div style={{ position:"absolute", top:"50%", transform:"translateY(-50%)", left:pct, marginLeft:-5,
              width:10, height:10, borderRadius:"50%", background:C.purple, transition:"left 0.3s linear" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
            <span style={{ fontFamily:F.body, fontSize:9, color:C.purpleMid }}>{fmt(progress)}</span>
            <span style={{ fontFamily:F.body, fontSize:9, color:C.purpleMid }}>{duration ? fmt(duration) : "--:--"}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20 }}>
            <button type="button" onClick={() => { const a=audioRef.current; if(a) a.currentTime=Math.max(0,a.currentTime-10); }}
              style={{ background:"none", border:"none", cursor:"pointer", padding:4, opacity:.5 }}>
              <SkipBack className="w-4 h-4" style={{ color:C.purple }}/>
            </button>
            <button type="button" onClick={toggle}
              style={{ width:44, height:44, borderRadius:"50%", background:C.purple, border:"none", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 4px 16px ${hexToRgba(C.purple,0.35)}` }}>
              {playing ? <Pause className="w-4 h-4" style={{ color:"white" }}/> : <Play className="w-4 h-4" style={{ color:"white", marginLeft:2 }}/>}
            </button>
            <button type="button" onClick={() => { const a=audioRef.current; if(a) a.currentTime=Math.min((duration||a.currentTime+10),a.currentTime+10); }}
              style={{ background:"none", border:"none", cursor:"pointer", padding:4, opacity:.5 }}>
              <SkipForward className="w-4 h-4" style={{ color:C.purple }}/>
            </button>
          </div>
          {editMode && (
            <div style={{ marginTop:12, textAlign:"center", display:"flex", justifyContent:"center", gap:8 }}>
              <button type="button" onClick={() => mp3Ref.current?.click()}
                style={{ background:C.offWhite, border:`1px solid ${C.lavender}`, borderRadius:99, padding:"4px 14px",
                  cursor:"pointer", fontFamily:F.label, fontSize:9, color:C.purpleMid, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                Schimba sursa
              </button>
              <button type="button" onClick={() => { deleteUploadedFile(block.musicUrl); onUpdate({musicUrl:"",musicType:"none" as any}); setPlaying(false); setProgress(0); setDuration(0); }}
                style={{ background:"transparent", border:`1px dashed ${C.lavender}`, borderRadius:99, padding:"4px 12px",
                  cursor:"pointer", fontFamily:F.label, fontSize:9, color:C.purpleMid, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                Sterge
              </button>
              <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e => { const f=e.target.files?.[0]; if(f) handleMp3(f); }} style={{ display:"none" }}/>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── AUDIO PERMISSION MODAL ───────────────────────────────────────────────────
const AudioPermissionModal: React.FC<{ childName: string; onAllow: () => void; onDeny: () => void }> = ({ childName, onAllow, onDeny }) => (
  <div style={{ position:"fixed", inset:0, zIndex:10020, display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ position:"absolute", inset:0, background:hexToRgba(C.purple,0.65), backdropFilter:"blur(8px)" }}/>
    <div style={{ position:"relative", background:"white", borderRadius:24, padding:"36px 32px 28px", maxWidth:340, width:"90%", textAlign:"center",
      boxShadow:"0 24px 80px rgba(0,0,0,0.35)", border:`1px solid ${C.lavender}` }}>
      <style>{`@keyframes ua-audio-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
      <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${C.lavLight},${C.purpleLight})`,
        display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px",
        animation:"ua-audio-pulse 2s ease-in-out infinite", boxShadow:`0 8px 24px ${hexToRgba(C.purpleLight,0.35)}` }}>
        <Music className="w-8 h-8" style={{ color:C.purple }}/>
      </div>
      <p style={{ fontFamily:F.display, fontSize:28, color:C.purple, margin:"0 0 6px", lineHeight:1.2 }}>{childName}</p>
      <p style={{ fontFamily:F.body, fontSize:13, fontWeight:700, color:C.purpleMid, margin:"0 0 8px" }}>te invită la petrecere magică</p>
      <p style={{ fontFamily:F.body, fontSize:11, color:"#5f6f84", margin:"0 0 28px", lineHeight:1.6 }}>Invitația are o melodie specială.<br/>Vrei să activezi muzica?</p>
      <button type="button" onClick={onAllow} style={{ width:"100%", padding:"14px 0",
        background:`linear-gradient(135deg,${C.purpleLight},${C.purple})`, border:"none", borderRadius:50,
        cursor:"pointer", fontFamily:F.label, fontSize:11, fontWeight:700, color:"white",
        letterSpacing:"0.1em", marginBottom:10, boxShadow:`0 6px 20px ${hexToRgba(C.purpleLight,0.4)}` }}>
        Da, activeaza muzica
      </button>
      <button type="button" onClick={onDeny} style={{ width:"100%", padding:"10px 0", background:"transparent",
        border:"none", cursor:"pointer", fontFamily:F.body, fontSize:11, color:"#718096" }}>
        Nu, continua fara muzica
      </button>
    </div>
  </div>
);

// ─── CALENDAR MONTH ───────────────────────────────────────────────────────────
const CalendarMonth: React.FC<{ date: string|undefined }> = ({ date }) => {
  if (!date) return null;
  const d = new Date(date);
  const year=d.getFullYear(), month=d.getMonth(), day=d.getDate();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const monthNames=['IANUARIE','FEBRUARIE','MARTIE','APRILIE','MAI','IUNIE','IULIE','AUGUST','SEPTEMBRIE','OCTOMBRIE','NOIEMBRIE','DECEMBRIE'];
  const dayLabels=['L','M','M','J','V','S','D'];
  const startOffset=(firstDay+6)%7;
  const cells:(number|null)[]=[...Array(startOffset).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
  return (
    <div style={{ background:C.lavLight, borderRadius:16, padding:20, textAlign:"center", border:`1px solid ${hexToRgba(C.lavender,.5)}` }}>
      <p style={{ fontFamily:F.label, fontSize:10, fontWeight:700, letterSpacing:"0.2em", color:C.purple, marginBottom:12 }}>{monthNames[month]} {year}</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:6 }}>
        {dayLabels.map((l,i) => <div key={`${l}-${i}`} style={{ fontSize:9, fontWeight:700, color:C.purpleLight }}>{l}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
        {cells.map((cell,i) => {
          const isToday = cell===day;
          return <div key={i} style={{ height:26, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, fontWeight:isToday?700:400,
            color:isToday?C.lavLight:cell?C.purple:"transparent",
            background:isToday?C.purpleLight:"transparent", borderRadius:"50%" }}>{cell||""}</div>;
        })}
      </div>
    </div>
  );
};

// ─── MAIN TEMPLATE ────────────────────────────────────────────────────────────
export type UnicornAcademyTemplateProps = InvitationTemplateProps & {
  editMode?: boolean;
  introPreview?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const UnicornAcademyTemplate: React.FC<UnicornAcademyTemplateProps> = ({
  data, onOpenRSVP, introPreview = false,
  editMode = false, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId,
}) => {
  const { profile, guest } = data;
  const upProfile = (key: string, value: any) => onProfileUpdate?.({ [key]: value });

  const theme = getUnicornTheme((profile as any).colorTheme);
  C = {
    ...C,
    purple: theme.TEXT,
    purpleMid: theme.PINK_DARK,
    purpleLight: theme.PINK_D,
    purpleGlow: hexToRgba(theme.PINK_D, 0.6),
    lavender: theme.PINK_L,
    lavLight: theme.PINK_XL,
    gold: theme.GOLD,
    goldDeep: hexToRgba(theme.GOLD, 0.8),
    goldPale: hexToRgba(theme.GOLD, 0.5),
    goldGlow: hexToRgba(theme.GOLD, 0.4),
    offWhite: theme.CREAM,
  };

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };
  const isWedding = !profile.eventType || profile.eventType === 'wedding' || profile.eventType === 'anniversary';

  const blocksFromDB: InvitationBlock[] | null = safeJSON(profile.customSections, null);
  const hasDBBlocks = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;
  const [blocks, setBlocks] = useState<InvitationBlock[]>(() =>
    hasDBBlocks ? blocksFromDB! : CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]
  );
  useEffect(() => {
    const fresh: InvitationBlock[] | null = safeJSON(profile.customSections, null);
    if (Array.isArray(fresh) && fresh.length > 0) setBlocks(fresh);
    else if (fresh !== null && Array.isArray(fresh) && fresh.length === 0) {
      setBlocks(CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
    }
  }, [profile.customSections]);

  const [openInsertAt, setOpenInsertAt] = useState<number | null>(null);
  const musicPlayRef = useRef<{ unlock: () => void; play: () => void; pause: () => void } | null>(null);
  const audioAllowedRef = useRef(false);
  const [showAudioModal, setShowAudioModal] = useState(false);

  const updBlock = useCallback((idx: number, patch: Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb = prev.map((b, i) => i === idx ? { ...b, ...patch } : b); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
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

  const getTimelineItems = () => safeJSON(profile.timeline, []);
  const updateTimeline = (next: any[]) => { onProfileUpdate?.({ timeline: JSON.stringify(next), showTimeline: true } as any); };
  const addTimelineItem = () => updateTimeline([...getTimelineItems(), { id: Date.now().toString(), title: "", time: "", notice: "" }]);
  const updateTimelineItem = (id: string, patch: any) => updateTimeline(getTimelineItems().map((t: any) => t.id === id ? { ...t, ...patch } : t));
  const removeTimelineItem = (id: string) => updateTimeline(getTimelineItems().filter((t: any) => t.id !== id));

  const handleInsertAt = (afterIdx: number, type: string, def: any) => {
    if (type === "timeline") { if (getTimelineItems().length === 0) addTimelineItem(); }
    addBlockAt(afterIdx, type, def);
    setOpenInsertAt(null);
  };

  const shouldUseIntro = !editMode && !introPreview;
  const [showIntro, setShowIntro] = useState(shouldUseIntro);
  const [contentVisible, setContentVisible] = useState(!shouldUseIntro);
  const hasPlayableMusic = blocks.some((b: any) => b.type === "music" && b.show !== false && !!b.musicUrl);

  useEffect(() => {
    if (!editMode && shouldUseIntro && showIntro && hasPlayableMusic && !audioAllowedRef.current) {
      setShowAudioModal(true);
    } else { setShowAudioModal(false); }
  }, [editMode, shouldUseIntro, showIntro, hasPlayableMusic]);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow='hidden'; document.body.style.position='fixed';
      document.body.style.top='0'; document.body.style.left='0'; document.body.style.right='0';
    } else {
      document.body.style.overflow=''; document.body.style.position='';
      document.body.style.top=''; document.body.style.left=''; document.body.style.right='';
    }
    return () => {
      document.body.style.overflow=''; document.body.style.position='';
      document.body.style.top=''; document.body.style.left=''; document.body.style.right='';
    };
  }, [showIntro]);

  const handleIntroDone = () => {
    window.scrollTo(0,0);
    setShowIntro(false);
    setTimeout(() => {
      window.scrollTo(0,0);
      setContentVisible(true);
      if (audioAllowedRef.current) musicPlayRef.current?.play();
    }, 60);
  };

  const l1 = (profile.partner1Name || 'S').charAt(0).toUpperCase();
  const l2 = !isWedding ? '' : (profile.partner2Name || 'W').charAt(0).toUpperCase();

  const getEventText = () => {
    const map: Record<string,any> = {
      wedding:     { welcome:'Cu onoare vă invităm',       celebration:'căsătoriei',     churchLabel:'Cununia',    venueLabel:'Recepția',   civilLabel:'Cununie Civilă' },
      baptism:     { welcome:'Cu bucurie vă invităm',      celebration:'botezului',       churchLabel:'Botezul',    venueLabel:'Petrecerea', civilLabel:'' },
      anniversary: { welcome:'Cu drag vă invităm alături', celebration:'aniversării',     churchLabel:'Ceremonia',  venueLabel:'Recepția',   civilLabel:'' },
      kids:        { welcome:'Te invităm la',               celebration:'ziua de naștere', churchLabel:'Distracția', venueLabel:'Petrecerea', civilLabel:'' },
    };
    const d = map[profile.eventType || 'wedding'] || map.wedding;
    return {
      welcome:     profile.welcomeText?.trim()     || d.welcome,
      celebration: profile.celebrationText?.trim() || d.celebration,
      churchLabel: profile.churchLabel?.trim()     || d.churchLabel,
      venueLabel:  profile.venueLabel?.trim()      || d.venueLabel,
      civilLabel:  profile.civilLabel?.trim()      || d.civilLabel,
    };
  };
  const texts = getEventText();

  const wd             = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const displayDay     = wd ? wd.getDate() : '';
  const displayMonth   = wd ? wd.toLocaleDateString('ro-RO',{month:'long'}).toUpperCase() : '';
  const displayYear    = wd ? wd.getFullYear() : '';
  const displayWeekday = wd ? wd.toLocaleDateString('ro-RO',{weekday:'long'}) : '';

  const sectionStyle: React.CSSProperties = {
    background:`linear-gradient(135deg,${hexToRgba(C.purpleMid,.55)},${hexToRgba(C.purple,.7)})`,
    borderWidth:'3px 1.5px 1.5px',
    borderStyle:'solid',
    borderColor:`${C.gold} ${hexToRgba(C.gold,.3)} ${hexToRgba(C.gold,.3)}`,
    borderRadius:16, backdropFilter:'blur(8px)', padding:'18px 22px',
    position:'relative', overflow:'hidden',
    boxShadow:`rgba(0,0,0,0.45) 0px 6px 28px, ${hexToRgba(C.gold,.12)} 0px 1px 0px inset`,
  };
  const starDots: React.CSSProperties = {
    position:'absolute', inset:0, pointerEvents:'none',
    backgroundImage:`radial-gradient(circle,${hexToRgba(C.gold,.04)} 1px,transparent 1px)`,
    backgroundSize:'16px 16px',
  };

  const heroTextStyles = (profile as any).heroTextStyles || {};
  const heroBlock: InvitationBlock = { id:"__hero__", type:"__hero__" as any, show:true, textStyles:heroTextStyles } as any;

  const BLOCK_TYPES = [
    { type:"photo",       label:"Foto",       def:{ imageData:"", altText:"", aspectRatio:"1:1", photoClip:"rect", photoMasks:[] } },
    { type:"text",        label:"Text",       def:{ content:"O poveste magică începe..." } },
    { type:"location",    label:"Locatie",    def:{ label:"Locatie", time:"11:00", locationName:"Locatie eveniment", locationAddress:"Strada Exemplu, Nr. 1", wazeLink:"" } },
    { type:"calendar",    label:"Calendar",   def:{} },
    { type:"countdown",   label:"Countdown",  def:{ countdownTitle:"Timp rămas până la eveniment" } },
    { type:"timeline",    label:"Cronologie", def:{} },
    { type:"music",       label:"Muzica",     def:{ musicTitle:"", musicArtist:"", musicType:"none" } },
    { type:"gift",        label:"Cadouri",    def:{ sectionTitle:"Sugestie cadou", content:"", iban:"", ibanName:"" } },
    { type:"whatsapp",    label:"WhatsApp",   def:{ label:"Contact WhatsApp", content:"0700000000" } },
    { type:"rsvp",        label:"RSVP",       def:{ label:"Confirmă Prezența" } },
    { type:"divider",     label:"Linie",      def:{} },
    { type:"family",      label:"Familie",    def:{ label:"Părinții copilului", content:"Cu drag și recunoștință", members:JSON.stringify([{name1:"Mama",name2:"Tata"}]) } },
    { type:"date",        label:"Data",       def:{} },
    { type:"description", label:"Descriere",  def:{ content:"O scurtă descriere..." } },
  ];

  return (
    <>
      <style>{UA_CSS}</style>
      {showAudioModal && (
        <AudioPermissionModal
          childName={profile.partner1Name || "Invitația"}
          onAllow={() => { audioAllowedRef.current = true; musicPlayRef.current?.unlock(); setShowAudioModal(false); }}
          onDeny={() => { audioAllowedRef.current = false; setShowAudioModal(false); }}
        />
      )}
      {showIntro && shouldUseIntro && <UnicornIntro l1={l1} l2={l2} onDone={handleIntroDone}/>}

      <div style={{
        minHeight:'100vh', position:'relative', fontFamily:F.body,
        opacity: contentVisible ? 1 : 0,
        transform: contentVisible ? 'translateY(0)' : 'translateY(16px)',
        transition:'opacity .7s cubic-bezier(.4,0,.2,1), transform .7s cubic-bezier(.4,0,.2,1)',
        paddingBottom:60,
      }}>
        <div style={{ position:'fixed', inset:0, zIndex:0,
          background:`linear-gradient(160deg,${C.purple} 0%,${C.purpleMid} 50%,${C.purpleLight} 100%)` }}/>
        <div style={{ position:'fixed', inset:0, zIndex:0,
          background:`radial-gradient(ellipse 80% 80% at 50% 50%,transparent 40%,${hexToRgba(C.purple,.6)} 100%)`,
          pointerEvents:'none' }}/>
        <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none' }}>
          <StarField count={22}/>
        </div>

        <div style={{ position:'relative', zIndex:2, maxWidth:440, margin:'0 auto', padding:'28px 16px 0' }}>

          {/* ── HERO CARD ── */}
          <Reveal from="fade">
            <BlockStyleProvider value={{
              blockId: heroBlock.id, textStyles: heroBlock.textStyles,
              onTextSelect: (textKey, textLabel) => onBlockSelect?.(heroBlock, -1, textKey, textLabel),
            }}>
              <div style={{ ...sectionStyle, textAlign:'center', padding:'36px 28px 32px', borderTop:`3px solid ${C.gold}` }}>
                <div style={{ position:'absolute', inset:0, pointerEvents:'none',
                  background:`linear-gradient(90deg,transparent,${hexToRgba(C.gold,.05)},transparent)`,
                  backgroundSize:'200% 100%', animation:'ua-shimmer 5s linear infinite' }}/>

                <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:18, marginBottom:20 }}>
                  <Reveal from="left" delay={0.1}><GoldFrame src={IMG_SOPHIA} size={100} float floatDelay={0}/></Reveal>
                  <div style={{ paddingBottom:16, animation:'ua-hornGlow 2.5s ease-in-out infinite' }}><UnicornHorn size={28}/></div>
                  <Reveal from="right" delay={0.1}><GoldFrame src={IMG_WILDSTAR} size={100} float floatDelay={0.5}/></Reveal>
                </div>

                <Reveal from="fade" delay={0.2}>
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12, marginBottom:14 }}>
                    <div style={{ flex:1, height:'.7px', background:`linear-gradient(to right,transparent,${C.gold})`, opacity:.4 }}/>
                    <StarMedallion size={42}/>
                    <div style={{ flex:1, height:'.7px', background:`linear-gradient(to left,transparent,${C.gold})`, opacity:.4 }}/>
                  </div>
                  <p style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.62em', textTransform:'uppercase',
                    color:C.gold, margin:'0 0 14px', opacity:.85 }}>
                    Unicorn Academy · Invitație
                  </p>
                </Reveal>

                {(editMode || profile.showWelcomeText !== false) && (
                  <Reveal from="bottom" delay={0.25}>
                    <InlineEdit tag="p" editMode={!!editMode} value={texts.welcome}
                      onChange={v => upProfile("welcomeText", v)} textLabel="Hero - welcome"
                      style={{ fontFamily:F.body, fontSize:13, fontWeight:700, fontStyle:'italic',
                        color:hexToRgba(C.lavender,.6), margin:'0 0 14px', lineHeight:1.7 }}/>
                  </Reveal>
                )}

                <Reveal from="bottom" delay={0.3}>
                  {!isWedding ? (
                    <InlineEdit tag="h1" editMode={!!editMode} value={profile.partner1Name || 'Prenume'}
                      onChange={v => upProfile("partner1Name", v)} textLabel="Hero - nume"
                      style={{ fontFamily:F.display, fontWeight:900, fontSize:'clamp(34px,8.5vw,52px)',
                        color:C.lavender, margin:'0 0 4px', lineHeight:1.05, letterSpacing:3,
                        textShadow:`0 0 32px ${hexToRgba(C.gold,.4)}, 0 2px 0 rgba(0,0,0,.5)`,
                        maxWidth:'100%', whiteSpace:'normal', overflowWrap:'anywhere', wordBreak:'break-word' }}/>
                  ) : (
                    <div style={{ margin:'0 0 4px' }}>
                      <InlineEdit tag="h1" editMode={!!editMode} value={profile.partner1Name || 'Prenume'}
                        onChange={v => upProfile("partner1Name", v)} textLabel="Hero - nume 1"
                        style={{ fontFamily:F.display, fontWeight:900, fontSize:'clamp(28px,7vw,44px)',
                          color:C.lavender, margin:0, lineHeight:1.1, letterSpacing:3,
                          textShadow:`0 0 28px ${hexToRgba(C.gold,.35)}, 0 2px 0 rgba(0,0,0,.5)`,
                          maxWidth:'100%', whiteSpace:'normal', overflowWrap:'anywhere', wordBreak:'break-word' }}/>
                      <div style={{ margin:'10px 0', display:'flex', alignItems:'center', gap:14, justifyContent:'center' }}>
                        <div style={{ flex:1, height:'.7px', background:`linear-gradient(to right,transparent,${C.gold})`, opacity:.5 }}/>
                        <span style={{ fontFamily:F.body, fontSize:26, fontWeight:800, color:C.gold, lineHeight:1 }}>&amp;</span>
                        <div style={{ flex:1, height:'.7px', background:`linear-gradient(to left,transparent,${C.gold})`, opacity:.5 }}/>
                      </div>
                      <InlineEdit tag="h1" editMode={!!editMode} value={profile.partner2Name || 'Prenume'}
                        onChange={v => upProfile("partner2Name", v)} textLabel="Hero - nume 2"
                        style={{ fontFamily:F.display, fontWeight:900, fontSize:'clamp(28px,7vw,44px)',
                          color:C.lavender, margin:0, lineHeight:1.1, letterSpacing:3,
                          textShadow:`0 0 28px ${hexToRgba(C.gold,.35)}, 0 2px 0 rgba(0,0,0,.5)`,
                          maxWidth:'100%', whiteSpace:'normal', overflowWrap:'anywhere', wordBreak:'break-word' }}/>
                    </div>
                  )}
                </Reveal>

                {(editMode || profile.showCelebrationText !== false) && (
                  <Reveal from="bottom" delay={0.35}>
                    <p style={{ fontFamily:F.body, fontSize:13, fontWeight:700, fontStyle:'italic',
                      color:hexToRgba(C.lavender,.5), margin:'12px 0 0', lineHeight:1.7 }}>
                      vă invită la{" "}
                      <InlineEdit tag="span" editMode={!!editMode} value={texts.celebration}
                        onChange={v => upProfile("celebrationText", v)} textLabel="Hero - celebrare"
                        style={{ fontFamily:F.body, fontSize:13, fontStyle:'italic', color:hexToRgba(C.lavender,.5) }}/>
                    </p>
                  </Reveal>
                )}

                <div style={{ margin:'24px 0' }}><GoldDivider/></div>

                <Reveal from="bottom" delay={0.4}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:14, marginBottom:24 }}>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.4em', textTransform:'uppercase', color:hexToRgba(C.gold,.7), margin:'0 0 2px' }}>{displayMonth}</p>
                      <p style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.3em', color:hexToRgba(C.gold,.4), margin:0 }}>{displayYear}</p>
                    </div>
                    <div style={{ width:68, height:68, borderRadius:'50%',
                      background:`radial-gradient(circle at 38% 35%,${C.purpleLight},${C.purple})`,
                      border:`2.5px solid ${C.gold}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:`0 0 22px ${C.goldGlow}, 0 4px 16px rgba(0,0,0,.5)`,
                      position:'relative', animation:'ua-glow 3s ease-in-out infinite' }}>
                      <div style={{ position:'absolute', inset:5, border:`1px solid ${hexToRgba(C.gold,.3)}`, borderRadius:'50%' }}/>
                      <span style={{ fontFamily:F.display, fontWeight:700, fontSize:24, color:C.white, lineHeight:1, textShadow:`0 0 10px ${hexToRgba(C.gold,.4)}` }}>{displayDay}</span>
                    </div>
                    <div style={{ textAlign:'left' }}>
                      <p style={{ fontFamily:F.body, fontSize:12, fontStyle:'italic', color:hexToRgba(C.lavender,.45), margin:0, lineHeight:1.5, textTransform:'capitalize' }}>{displayWeekday}</p>
                    </div>
                  </div>
                </Reveal>

                <Reveal from="bottom" delay={0.45}><Countdown targetDate={profile.weddingDate}/></Reveal>

                <div style={{ margin:'24px 0 18px' }}><GoldDivider medallion/></div>

                <Reveal from="bottom" delay={0.5}>
                  <div style={{ padding:'16px 20px', background:hexToRgba(C.purpleMid,.3),
                    border:`1.5px solid ${hexToRgba(C.gold,.2)}`, borderRadius:12, position:'relative' }}>
                    <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:'1.5px',
                      background:`linear-gradient(to right,transparent,${C.gold},transparent)`, opacity:.4 }}/>
                    <p style={{ fontFamily:F.label, fontSize:7, letterSpacing:'.55em', textTransform:'uppercase',
                      color:hexToRgba(C.gold,.5), margin:'0 0 7px' }}>Invitație pentru</p>
                    <p style={{ fontFamily:F.display, fontWeight:700, fontSize:19, color:C.offWhite, margin:0,
                      letterSpacing:1.5, textShadow:`0 0 18px ${hexToRgba(C.gold,.2)}` }}>
                      {guest?.name || 'Invitatul Special'}
                    </p>
                  </div>
                </Reveal>
              </div>
            </BlockStyleProvider>
          </Reveal>

          {/* ── BLOCKS ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:6 }}>
            {editMode && (
              <InsertBlockButton insertIdx={-1} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt}
                BLOCK_TYPES={BLOCK_TYPES} onInsert={(type,def) => handleInsertAt(-1, type, def)}/>
            )}
            {blocks.filter(b => editMode || b.show !== false).map((block, idx) => {
              const visible = block.show !== false;
              const isSelected = selectedBlockId === block.id;
              return (
                <div key={block.id} className="group/insert">
                  <div
                    className={`relative group/block ${block.type === "divider" ? "" : "py-3"}`}
                    onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}
                    style={{
                      marginTop: block.blockMarginTop != null ? `${block.blockMarginTop}px` : undefined,
                      marginBottom: block.blockMarginBottom != null ? `${block.blockMarginBottom}px` : undefined,
                      paddingTop: block.blockPaddingTop != null ? `${block.blockPaddingTop}px` : undefined,
                      paddingBottom: block.blockPaddingBottom != null ? `${block.blockPaddingBottom}px` : undefined,
                      paddingLeft: block.blockPaddingH != null ? `${block.blockPaddingH}px` : undefined,
                      paddingRight: block.blockPaddingH != null ? `${block.blockPaddingH}px` : undefined,
                      opacity: block.opacity != null ? block.opacity / 100 : 1,
                      backgroundColor: block.bgColor || undefined,
                      borderRadius: block.blockRadius != null ? `${block.blockRadius}px` : undefined,
                      outline: editMode && isSelected ? `2px solid ${C.gold}` : undefined,
                      outlineOffset: editMode && isSelected ? 4 : undefined,
                    }}
                  >
                    {editMode && (
                      <BlockToolbar onUp={() => movBlock(idx,-1)} onDown={() => movBlock(idx,1)}
                        onToggle={() => updBlock(idx,{show:!visible})} onDelete={() => delBlock(idx)}
                        visible={visible} isFirst={idx===0} isLast={idx===blocks.length-1}/>
                    )}
                    <BlockStyleProvider value={{
                      blockId: block.id, textStyles: block.textStyles,
                      onTextSelect: (textKey,textLabel) => onBlockSelect?.(block,idx,textKey,textLabel),
                      fontFamily: block.blockFontFamily, fontSize: block.blockFontSize,
                      fontWeight: block.blockFontWeight, fontStyle: block.blockFontStyle,
                      letterSpacing: block.blockLetterSpacing, lineHeight: block.blockLineHeight,
                      textColor: block.textColor && block.textColor !== "transparent" ? block.textColor : undefined,
                      textAlign: block.blockAlign,
                    } as BlockStyle}>

                      {block.type === "photo" && (
                        <div style={sectionStyle}><div style={starDots}/>
                          <PhotoBlock imageData={block.imageData} altText={block.altText} editMode={editMode}
                            onUpload={url => updBlock(idx,{imageData:url})} onAltChange={v => updBlock(idx,{altText:v})}
                            onRemove={() => updBlock(idx,{imageData:undefined})} aspectRatio={block.aspectRatio as any}/>
                        </div>
                      )}

                      {block.type === "text" && (
                        <div style={{...sectionStyle,textAlign:"center"}}><div style={starDots}/>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v => updBlock(idx,{content:v})}
                            placeholder="Text..." style={{fontFamily:F.body,fontSize:14,color:C.lavLight,lineHeight:1.7}}/>
                        </div>
                      )}

                      {block.type === "location" && (
                        <LocCard label={block.label||"Locatie"} time={block.time||""} name={block.locationName}
                          address={block.locationAddress} wazeLink={block.wazeLink} editMode={editMode}
                          onLabelChange={v => updBlock(idx,{label:v})} onTimeChange={v => updBlock(idx,{time:v})}
                          onNameChange={v => updBlock(idx,{locationName:v})} onAddressChange={v => updBlock(idx,{locationAddress:v})}
                          onWazeChange={v => updBlock(idx,{wazeLink:v})}/>
                      )}

                      {block.type === "calendar" && (
                        <div style={sectionStyle}><div style={starDots}/>
                          <CalendarMonth date={profile.weddingDate}/>
                        </div>
                      )}

                      {block.type === "countdown" && (
                        <div style={sectionStyle}><div style={starDots}/>
                          <InlineEdit tag="p" editMode={editMode} value={block.countdownTitle||"Timp rămas până la eveniment"}
                            onChange={v => updBlock(idx,{countdownTitle:v})} textLabel="Countdown - titlu"
                            style={{fontFamily:F.label,fontSize:9,letterSpacing:".4em",textTransform:"uppercase",color:C.gold,textAlign:"center",margin:"0 0 10px"}}/>
                          <Countdown targetDate={profile.weddingDate}/>
                        </div>
                      )}

                      {block.type === "timeline" && (() => {
                        const timelineItems = getTimelineItems();
                        if (!editMode && timelineItems.length === 0) return null;
                        return (
                          <div style={sectionStyle}><div style={starDots}/>
                            <p style={{fontFamily:F.label,fontSize:9,letterSpacing:".4em",textTransform:"uppercase",color:C.gold,textAlign:"center",margin:"0 0 14px"}}>Programul zilei</p>
                            {timelineItems.length === 0 && editMode && (
                              <p style={{fontFamily:F.body,fontSize:12,fontStyle:"italic",color:C.lavender,textAlign:"center",margin:"0 0 8px"}}>Adaugă primul moment al zilei.</p>
                            )}
                            {timelineItems.map((item: any, i: number) => (
                              <div key={item.id} style={{display:"grid",gridTemplateColumns:"58px 18px 1fr",alignItems:"stretch",minHeight:44}}>
                                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"flex-end",paddingRight:10,paddingTop:4}}>
                                  <InlineTime editMode={editMode} value={item.time||""} onChange={v => updateTimelineItem(item.id,{time:v})}
                                    textKey={`timeline:${item.id}:time`} textLabel={`Ora ${i+1}`}
                                    style={{fontFamily:F.body,fontSize:12,fontWeight:700,color:C.gold,textAlign:"center",width:"100%"}}/>
                                </div>
                                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                                  <div style={{width:10,height:10,borderRadius:"50%",background:C.gold}}/>
                                  {i < timelineItems.length-1 && (
                                    <div style={{flex:1,width:1,background:`linear-gradient(to bottom,${C.gold},transparent)`,marginTop:4}}/>
                                  )}
                                </div>
                                <div style={{paddingLeft:10,paddingTop:2,paddingBottom:i<timelineItems.length-1?18:0}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                                    <InlineEdit tag="span" editMode={editMode} value={item.title||""}
                                      onChange={v => updateTimelineItem(item.id,{title:v})} placeholder="Moment..."
                                      textKey={`timeline:${item.id}:title`} textLabel={`Titlu ${i+1}`}
                                      style={{fontFamily:F.body,fontSize:13,fontWeight:700,color:C.white}}/>
                                    {editMode && (
                                      <button type="button" onClick={() => removeTimelineItem(item.id)}
                                        style={{background:"none",border:"none",cursor:"pointer",color:C.lavender,fontSize:12,opacity:0.6}}>x</button>
                                    )}
                                  </div>
                                  {(editMode || item.notice) && (
                                    <InlineEdit tag="span" editMode={editMode} value={item.notice||""}
                                      onChange={v => updateTimelineItem(item.id,{notice:v})} placeholder="Nota..."
                                      textKey={`timeline:${item.id}:notice`} textLabel={`Nota ${i+1}`}
                                      style={{fontFamily:F.body,fontSize:11,fontStyle:"italic",color:C.lavender,display:"block",marginTop:4}}/>
                                  )}
                                </div>
                              </div>
                            ))}
                            <TimelineInsertButton editMode={editMode} onAdd={addTimelineItem}/>
                          </div>
                        );
                      })()}

                      {block.type === "music" && (
                        <div style={sectionStyle}><div style={starDots}/>
                          <MusicBlock block={block} editMode={editMode} onUpdate={p => updBlock(idx,p)} imperativeRef={musicPlayRef}/>
                        </div>
                      )}

                      {block.type === "gift" && (
                        <div style={{...sectionStyle,textAlign:"center"}}><div style={starDots}/>
                          <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle||"Sugestie de cadou"}
                            onChange={v => updBlock(idx,{sectionTitle:v})}
                            style={{fontFamily:F.display,fontSize:22,color:C.lavLight,margin:"0 0 8px"}}/>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v => updBlock(idx,{content:v})} multiline
                            style={{fontFamily:F.body,fontSize:12,color:C.lavender,opacity:0.9,lineHeight:1.6}}/>
                          {(block.iban||editMode) && (
                            <div style={{marginTop:10,padding:"8px 12px",borderRadius:12,border:`1px solid ${C.lavender}`,display:"inline-block"}}>
                              <InlineEdit tag="p" editMode={editMode} value={block.iban||""} onChange={v => updBlock(idx,{iban:v})}
                                placeholder="IBAN..." style={{fontFamily:F.body,fontSize:11,color:C.lavLight,margin:0}}/>
                            </div>
                          )}
                          {(block.ibanName||editMode) && (
                            <InlineEdit tag="p" editMode={editMode} value={block.ibanName||""} onChange={v => updBlock(idx,{ibanName:v})}
                              placeholder="Nume beneficiar..." style={{fontFamily:F.body,fontSize:10,color:C.lavender,margin:"6px 0 0"}}/>
                          )}
                        </div>
                      )}

                      {block.type === "whatsapp" && (
                        <div style={{...sectionStyle,textAlign:"center"}}><div style={starDots}/>
                          <a href={`https://wa.me/${(block.content||"").replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                            style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:999,
                              background:C.lavLight,color:C.purple,textDecoration:"none",
                              fontFamily:F.label,fontSize:9,letterSpacing:".3em",textTransform:"uppercase"}}>
                            {block.label||"Contact WhatsApp"}
                          </a>
                          {editMode && (
                            <div style={{marginTop:8}}>
                              <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v => updBlock(idx,{content:v})}
                                placeholder="Numar..." style={{fontFamily:F.body,fontSize:12,color:C.lavender,margin:0}}/>
                            </div>
                          )}
                        </div>
                      )}

                      {block.type === "rsvp" && (
                        <div style={{display:"flex",justifyContent:"center"}}>
                          <button onClick={() => { if(!editMode) onOpenRSVP?.(); }}
                            style={{padding:"14px 26px",borderRadius:999,
                              background:`linear-gradient(135deg,${C.gold},${C.goldDeep})`,
                              border:"none",fontFamily:F.label,fontSize:10,letterSpacing:".3em",
                              textTransform:"uppercase",color:C.purple,cursor:"pointer",
                              boxShadow:`0 6px 28px ${C.goldGlow}`}}>
                            <InlineEdit tag="span" editMode={editMode} value={block.label||"Confirmă Prezența"}
                              onChange={v => updBlock(idx,{label:v})}/>
                          </button>
                        </div>
                      )}

                      {block.type === "divider" && <GoldDivider/>}

                      {block.type === "family" && (() => {
                        const members: {name1:string;name2:string}[] = (() => { try { return JSON.parse(block.members||"[]"); } catch { return []; } })();
                        const updateMembers = (nm: {name1:string;name2:string}[]) => updBlock(idx,{members:JSON.stringify(nm)} as any);
                        return (
                          <div style={{...sectionStyle,textAlign:"center"}}><div style={starDots}/>
                            <InlineEdit tag="p" editMode={editMode} value={block.label||"Familie"}
                              onChange={v => updBlock(idx,{label:v})}
                              style={{fontFamily:F.label,fontSize:9,letterSpacing:".3em",textTransform:"uppercase",color:C.gold,margin:"0 0 8px"}}/>
                            <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v => updBlock(idx,{content:v})} multiline
                              style={{fontFamily:F.body,fontSize:12,color:C.lavender,margin:"0 0 12px"}}/>
                            <div style={{display:"flex",flexDirection:"column",gap:10}}>
                              {members.map((m,mi) => (
                                <div key={mi} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
                                  <InlineEdit tag="span" editMode={editMode} value={m.name1}
                                    onChange={v => { const nm=[...members]; nm[mi]={...nm[mi],name1:v}; updateMembers(nm); }}
                                    style={{fontFamily:F.display,fontSize:18,color:C.lavLight}}/>
                                  <span style={{fontFamily:F.body,fontSize:14,color:C.lavender}}>&amp;</span>
                                  <InlineEdit tag="span" editMode={editMode} value={m.name2}
                                    onChange={v => { const nm=[...members]; nm[mi]={...nm[mi],name2:v}; updateMembers(nm); }}
                                    style={{fontFamily:F.display,fontSize:18,color:C.lavLight}}/>
                                  {editMode && members.length>1 && (
                                    <button type="button" onClick={() => updateMembers(members.filter((_,i)=>i!==mi))}
                                      style={{background:"none",border:"none",cursor:"pointer",color:C.lavender,fontSize:14,opacity:0.6}}>x</button>
                                  )}
                                </div>
                              ))}
                            </div>
                            {editMode && (
                              <button type="button" onClick={() => updateMembers([...members,{name1:"Nume 1",name2:"Nume 2"}])}
                                style={{marginTop:12,background:"transparent",border:`1px dashed ${C.lavender}`,borderRadius:999,
                                  padding:"4px 14px",fontFamily:F.label,fontSize:9,letterSpacing:".2em",
                                  textTransform:"uppercase",color:C.lavender,cursor:"pointer"}}>
                                + Adauga
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      {block.type === "date" && (
                        <div style={{textAlign:"center",padding:"6px 0"}}>
                          <InlineEdit tag="p" editMode={editMode}
                            value={block.content || `${displayWeekday} ${displayDay} ${displayMonth} ${displayYear}`}
                            onChange={v => updBlock(idx,{content:v})}
                            style={{fontFamily:F.label,fontSize:11,letterSpacing:".3em",color:C.gold,margin:0}}/>
                        </div>
                      )}

                      {block.type === "description" && (
                        <div style={{textAlign:"center",padding:"0 12px"}}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v => updBlock(idx,{content:v})}
                            style={{fontFamily:F.body,fontSize:12,color:C.lavender,margin:0,lineHeight:1.7}}/>
                        </div>
                      )}

                    </BlockStyleProvider>
                  </div>
                  {editMode && (
                    <InsertBlockButton insertIdx={idx} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt}
                      BLOCK_TYPES={BLOCK_TYPES} onInsert={(type,def) => handleInsertAt(idx, type, def)}/>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── FOOTER ── */}
          <Reveal from="fade" delay={0.1}>
            <div style={{ marginTop:28, textAlign:'center' }}>
              <GoldDivider/>
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:14, margin:'16px 0 10px' }}>
                <GoldFrame src={IMG_SOPHIA} size={46}/>
                <StarMedallion size={32}/>
                <GoldFrame src={IMG_WILDSTAR} size={46}/>
              </div>
              <p style={{ fontFamily:F.label, fontSize:9, letterSpacing:'.45em', textTransform:'uppercase',
                color:hexToRgba(C.gold,.3), margin:0 }}>
                Unicorn Academy · {displayYear}
              </p>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
};

export const CASTLE_DEFAULTS = {
  partner1Name: "Sofia",
  partner2Name: "",
  welcomeText: "Cu bucurie vă invităm",
  celebrationText: "botezului",
  eventType: "baptism",
  weddingDate: "",
  showWelcomeText: true,
  showCelebrationText: true,
  showCountdown: true,
  showTimeline: false,
  showGodparents: true,
  showRsvpButton: true,
  showCivil: false,
  showChurch: true,
  showVenue: true,
  churchLabel: "Botezul",
  venueLabel: "Petrecerea",
  civilLabel: "Cununie Civilă",
  civilTime: "10:00",
  churchTime: "11:00",
  eventTime: "14:00",
  civilLocationName: "Primăria",
  civilLocationAddress: "Strada Principală 1, București",
  churchLocationName: "Biserica Sfânta Maria",
  churchLocationAddress: "Strada Bisericii 5, București",
  locationName: "Salon Unicorn",
  locationAddress: "Strada Magică 1, București",
  civilWazeLink: "",
  churchWazeLink: "",
  venueWazeLink: "",
  godparents: JSON.stringify([{ godfather: "Nume Naș", godmother: "Nume Nașă" }]),
  timeline: JSON.stringify([]),
  colorTheme: "magic",
  rsvpButtonText: "Confirmă Prezența",
};

export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = [
  {
    id: "def-photo-1",
    type: "photo" as const,
    show: true,
    imageData: "/unicornacademy/sophia.jpg",
    altText: "Sophia",
    aspectRatio: "3:4" as const,
    photoClip: "arch" as const,
    photoMasks: ["fade-b"] as any,
  },
  {
    id: "def-text-1",
    type: "text" as const,
    show: true,
    content: "Te așteptăm cu drag să fim împreună în această zi magică.",
  },
  {
    id: "def-family-1",
    type: "family" as const,
    show: true,
    label: "Părinții",
    content: "Cu drag și recunoștință",
    members: JSON.stringify([{ name1: "Mama", name2: "Tata" }]),
  },
  {
    id: "def-family-2",
    type: "family" as const,
    show: true,
    label: "Nașii",
    content: "Cu drag și recunoștință",
    members: JSON.stringify([{ name1: "Nașa", name2: "Nașul" }]),
  },
  {
    id: "def-calendar",
    type: "calendar" as const,
    show: true,
  },

  { id: "def-divider-1", type: "divider" as const, show: true },
  {
    id: "def-location-1",
    type: "location" as const,
    show: true,
    label: "Ceremonia",
    time: "11:00",
    locationName: "Biserica Sfânta Maria",
    locationAddress: "Strada Bisericii 5, București",
    wazeLink: "",
  },
  {
    id: "def-location-2",
    type: "location" as const,
    show: true,
    label: "Petrecerea",
    time: "14:00",
    locationName: "Salon Unicorn",
    locationAddress: "Strada Magică 1, București",
    wazeLink: "",
  },
  {
    id: "def-text-2",
    type: "text" as const,
    show: true,
    content: "O piesă de suflet, aleasă cu drag pentru această zi de neuitat.",
  },
  {
    id: "def-music",
    type: "music" as const,
    show: true,
    musicTitle: "",
    musicArtist: "",
    musicUrl: "",
    musicType: "none" as const,
  },
  {
    id: "def-photo-2",
    type: "photo" as const,
    show: true,
    imageData: "/unicornacademy/wildstar.jpg",
    altText: "Wildstar",
    aspectRatio: "1:1" as const,
    photoClip: "circle" as const,
    photoMasks: [] as any,
  },
  {
    id: "def-text-3",
    type: "text" as const,
    show: true,
    content: "Ne-ar bucura să ne confirmați prezența pentru o bună organizare a evenimentului.",
  },
  {
    id: "def-rsvp",
    type: "rsvp" as const,
    show: true,
    label: "Confirmă Prezența",
  },
];

export const CASTLE_PREVIEW_DATA = {
  guest: { name: "Invitat Drag", status: "pending", type: "adult" },
  project: { selectedTemplate: "unicorn-academy" },
  profile: {
    ...CASTLE_DEFAULTS,
    weddingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    customSections: JSON.stringify(CASTLE_DEFAULT_BLOCKS),
  },
};

export default UnicornAcademyTemplate;
