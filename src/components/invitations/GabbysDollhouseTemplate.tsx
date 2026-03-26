import React, { useState, useEffect, useRef, useCallback } from "react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime } from "./InlineEdit";
import FlipClock from "./FlipClock";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";
import { getGabbyTheme } from "./castleDefaults";
import { WeddingIcon } from "../TimelineIcons";
import { TimelineInsertButton } from "./TimelineInsertButton";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload, Camera,
  Play, Pause, SkipForward, SkipBack, Gift, Music, MessageCircle, Sparkles
} from "lucide-react";

export const meta: TemplateMeta = {
  id: 'gabbys-dollhouse',
  name: "Gabby's Dollhouse",
  category: 'kids',
  description: 'Casuta magica a lui Gabby — pisici vesele, cupcakes, curcubeie si distractie fara sfarsit!',
  colors: ['#FFE6F2', '#EFDFFF', '#DFF7FF', '#FFF4D6'],
  previewClass: "bg-pink-200 border-purple-400",
  elementsClass: "bg-pink-400",
};

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

// ─── IMAGES ───────────────────────────────────────────────────────────────────
const IMG_HEART = "/gabbys-dollhouse/homepage-s13-hero6.png";
const IMG_LOGO = "/gabbys-dollhouse/gabby-logoGG.png";
const IMG_RAINBOW = "/gabbys-dollhouse/homepage-s13-hero6.png";
const IMG_CUPCAKE = "/gabbys-dollhouse/cakey-hero2.png";
const IMG_JELLYCAT = "/gabbys-dollhouse/mercat-hero3.png";
const IMG_PANDY = "/gabbys-dollhouse/pandy-hero2.png";
const IMG_BABYBOX = "/gabbys-dollhouse/babybox-hero.png";
const IMG_DJCATNIP = "/gabbys-dollhouse/djcatnip-hero2.png";
const IMG_CARLITA = "/gabbys-dollhouse/carlita-hero.png";
const IMG_CATRAT = "/gabbys-dollhouse/catrat-hero3.png";
const IMG_MARTY = "/gabbys-dollhouse/marty-the-party-cat-hero3.png";
const IMG_PILLOWCAT = "/gabbys-dollhouse/pillowcat-hero.png";
const IMG_WEBSITE = "/gabbys-dollhouse/kittyfairy-hero.png";
const IMG_BOXCAT  = "/gabbys-dollhouse/kittyfairy-hero.png";
const HERO_IMG = '/gabbys-dollhouse/BGIMAGES.png';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const F = {
  display : "'Fredoka One','Nunito',sans-serif",
  body    : "'Nunito','Quicksand',sans-serif",
  label   : "'Fredoka One',sans-serif",
} as const;

type GabbyColors = {
  hotPink: string;
  deepPink: string;
  purple: string;
  deepPurple: string;
  mint: string;
  deepMint: string;
  yellow: string;
  coral: string;
  skyBlue: string;
  lavender: string;
  white: string;
  cream: string;
  inkDark: string;
  pinkLight: string;
};

let C: GabbyColors = {
  hotPink   : "#FF69B4",
  deepPink  : "#E91E8C",
  purple    : "#C77DFF",
  deepPurple: "#7B2FBE",
  mint      : "#7FE5D4",
  deepMint  : "#00B4A0",
  yellow    : "#FFE566",
  coral     : "#FF7F6B",
  skyBlue   : "#74D7F7",
  lavender  : "#EDD9FF",
  white     : "#FFFCFF",
  cream     : "#FFF8F0",
  inkDark   : "#2D1B69",
  pinkLight : "#FFB3D9",
};

let PINK_DARK = C.deepPurple;
let PINK_D    = C.deepPink;
let PINK_L    = C.pinkLight;
let PINK_XL   = C.cream;
let CREAM     = C.cream;
let TEXT      = C.inkDark;
let MUTED     = "rgba(45,27,105,0.6)";
let GOLD      = C.yellow;

const SERIF = F.body;
const SCRIPT = F.display;
const SANS = F.body;

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GD_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes gd-float    { 0%,100%{transform:translateY(0) rotate(-.5deg)}50%{transform:translateY(-12px) rotate(.5deg)} }
  @keyframes gd-floatR   { 0%,100%{transform:translateY(0) rotate(.5deg)}50%{transform:translateY(-10px) rotate(-.5deg)} }
  @keyframes gd-bob      { 0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.04)} }
  @keyframes gd-bounce   { 0%,100%{transform:translateY(0) scaleY(1)}25%{transform:translateY(-14px) scaleY(1.05)}50%{transform:translateY(0) scaleY(.93)}75%{transform:translateY(-6px) scaleY(1.02)} }
  @keyframes gd-wiggle   { 0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-8deg) scale(1.1)}40%{transform:rotate(8deg) scale(1.1)}60%{transform:rotate(-4deg) scale(1.05)}80%{transform:rotate(4deg) scale(1.05)} }
  @keyframes gd-pulse    { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,105,180,.5)}50%{transform:scale(1.04);box-shadow:0 0 0 16px rgba(255,105,180,0)} }
  @keyframes gd-shimmer  { 0%{background-position:-200% 0}100%{background-position:200% 0} }
  @keyframes gd-rainbow  { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
  @keyframes gd-twinkle  { 0%,100%{opacity:.2;transform:scale(.7) rotate(0deg)}50%{opacity:1;transform:scale(1.4) rotate(20deg)} }
  @keyframes gd-sparkle  { 0%,100%{opacity:0;transform:scale(0) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(180deg)} }
  @keyframes gd-popIn    { 0%{transform:scale(0) rotate(-6deg);opacity:0}65%{transform:scale(1.1) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes gd-slideUp  { 0%{transform:translateY(36px);opacity:0}100%{transform:translateY(0);opacity:1} }
  @keyframes gd-paw      { 0%{opacity:0;transform:scale(0)}30%{opacity:.6;transform:scale(1.2)}70%{opacity:.4;transform:scale(1)}100%{opacity:0;transform:scale(1) translateX(20px)} }
  @keyframes gd-confetti { 0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
  @keyframes gd-heartPop { 0%{transform:scale(0) rotate(-10deg);opacity:0}60%{transform:scale(1.25) rotate(4deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes gd-bgShift  { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
  @keyframes gd-logoIn   { 0%{transform:scale(0) rotate(-12deg);opacity:0}60%{transform:scale(1.12) rotate(3deg);opacity:1}80%{transform:scale(.96) rotate(-1deg)}100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes gd-heartBeat{ 0%,100%{transform:scale(1)}14%{transform:scale(1.15)}28%{transform:scale(1)}42%{transform:scale(1.08)}70%{transform:scale(1)} }
  .gd-hover:hover { animation:gd-wiggle .5s ease-in-out !important; cursor:pointer; }
`;

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(threshold=0.1):[React.RefObject<T>,boolean]{
  const ref=useRef<T>(null);
  const [vis,setVis]=useState(false);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{threshold});
    obs.observe(el);
    return()=>obs.disconnect();
  },[threshold]);
  return [ref,vis];
}

const Reveal:React.FC<{children:React.ReactNode;delay?:number;from?:'bottom'|'left'|'right'|'fade';style?:React.CSSProperties}>=
  ({children,delay=0,from='bottom',style})=>{
  const [ref,vis]=useReveal<HTMLDivElement>();
  const t:Record<string,string>={bottom:'translateY(30px)',left:'translateX(-30px)',right:'translateX(30px)',fade:'translateY(0)'};
  return(
    <div ref={ref} style={{opacity:vis?1:0,transform:vis?'translate(0,0)':t[from],
      transition:`opacity .7s ${delay}s cubic-bezier(.22,1,.36,1),transform .7s ${delay}s cubic-bezier(.22,1,.36,1)`,...style}}>
      {children}
    </div>
  );
};

// ─── SPARKLE PARTICLE ─────────────────────────────────────────────────────────
const Sparkle:React.FC<{x:number;y:number;color:string;size:number;delay:number;fixed?:boolean}>=
  ({x,y,color,size,delay,fixed=false})=>(
  <div style={{
    position:fixed?'fixed':'absolute',left:`${x}%`,top:`${y}%`,
    fontSize:size,color,
    animation:`gd-sparkle ${2+Math.random()}s ${delay}s ease-in-out infinite`,
    pointerEvents:'none',zIndex:2,userSelect:'none',
    filter:`drop-shadow(0 0 4px ${color})`,
  }}>✦</div>
);

// ─── CONFETTI BURST ───────────────────────────────────────────────────────────
const Confetto:React.FC<{x:number;color:string;delay:number;size:number;shape:string}>=
  ({x,color,delay,size,shape})=>(
  <div style={{
    position:'fixed',left:`${x}%`,top:'-10px',
    width:size,height:size,
    background:color,
    borderRadius:shape==='circle'?'50%':'3px',
    animation:`gd-confetti ${2.5+Math.random()*2}s ${delay}s linear forwards`,
    pointerEvents:'none',zIndex:999,
  }}/>
);

// ─── RAINBOW DIVIDER ─────────────────────────────────────────────────────────
const RainbowBar:React.FC<{thin?:boolean}>=({thin=false})=>(
  <div style={{
    height:thin?3:5,borderRadius:3,
    background:`linear-gradient(90deg,${C.hotPink},${C.purple},${C.mint},${C.yellow},${C.coral},${C.skyBlue},${C.hotPink})`,
    backgroundSize:'200% 100%',animation:'gd-rainbow 3s linear infinite',
  }}/>
);

// ─── PAW PRINTS ───────────────────────────────────────────────────────────────
const PawScatter:React.FC<{fixed?:boolean}>=({fixed=false})=>{
  const paws=[
    {x:3,y:12,d:0},{x:91,y:8,d:1.5},{x:5,y:40,d:2.8},{x:93,y:38,d:.7},
    {x:2,y:68,d:1.9},{x:95,y:65,d:3.1},{x:7,y:88,d:.4},{x:90,y:85,d:2.2},
  ];
  return(
    <>
      {paws.map((p,i)=>(
        <div key={i} style={{
          position:fixed?'fixed':'absolute',left:`${p.x}%`,top:`${p.y}%`,
          fontSize:14,opacity:0,
          animation:`gd-paw ${3.5+i*.3}s ${p.d}s ease-in-out infinite`,
          pointerEvents:'none',userSelect:'none',zIndex:1,
        }}>🐾</div>
      ))}
    </>
  );
};

// ─── LOCATION CARD ────────────────────────────────────────────────────────────
const LocCard: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void; stickerSrc?: string }> =
  ({ block, editMode, onUpdate, stickerSrc }) => {
    const [editWaze, setEditWaze] = useState(false);
    const name = block.locationName || "";
    const time = block.time || "";
    const address = block.locationAddress || "";
    const label = block.label || "Locatie";
    const wazeLink = block.wazeLink || "";
    if (!editMode && !name && !time && !address && !wazeLink) return null;
    const enc = address ? encodeURIComponent(address) : "";
    return (
      <div style={{
        background: `linear-gradient(135deg,rgba(255,255,255,.85),rgba(237,217,255,.7))`,
        border: `3px solid ${C.purple}`, borderRadius: 22, padding: '18px 22px',
        backdropFilter: 'blur(8px)', boxShadow: `0 6px 24px rgba(199,125,255,.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {stickerSrc && (
          <img
            src={stickerSrc}
            alt=""
            style={{
              position: "absolute",
              top: -22,
              right: -6,
              width: 82,
              height: 82,
              objectFit: "contain",
              filter: "drop-shadow(0 6px 14px rgba(0,0,0,.18))",
              pointerEvents: "none",
            }}
          />
        )}
        <RainbowBar thin />
        <div style={{ paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16, animation: 'gd-twinkle 2s ease-in-out infinite' }}>🐾</span>
            <InlineEdit
              tag="p"
              editMode={editMode}
              value={label}
              onChange={v => onUpdate({ label: v })}
              placeholder="Tip locatie..."
              textLabel="Locatie · label"
              style={{
                fontFamily: F.label, fontSize: 9, letterSpacing: '.4em', textTransform: 'uppercase',
                color: C.deepPurple, margin: 0,
              }}
            />
          </div>
          {(editMode || time) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 14 }}>⏰</span>
              <InlineTime
                value={time}
                onChange={v => onUpdate({ time: v })}
                editMode={editMode}
                textLabel="Locatie · ora"
                style={{ fontFamily: F.display, fontSize: 22, color: C.deepPink, margin: 0, letterSpacing: 1 }}
              />
            </div>
          )}
          <InlineEdit
            tag="p"
            editMode={editMode}
            value={name}
            onChange={v => onUpdate({ locationName: v })}
            placeholder="Numele locatiei..."
            textLabel="Locatie · nume"
            style={{ fontFamily: F.body, fontSize: 14, fontWeight: 800, color: C.inkDark, margin: '0 0 3px' }}
          />
          {(editMode || address) && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginTop: 4 }}>
              <span style={{ fontSize: 12, flexShrink: 0, marginTop: 2 }}>📍</span>
              <InlineEdit
                tag="p"
                editMode={editMode}
                value={address}
                onChange={v => onUpdate({ locationAddress: v })}
                placeholder="Adresa completa..."
                multiline
                textLabel="Locatie · adresa"
                style={{
                  fontFamily: F.body, fontSize: 11, fontWeight: 600,
                  color: `${C.deepPurple}99`, margin: 0, lineHeight: 1.6, fontStyle: 'italic',
                }}
              />
            </div>
          )}
          {(editMode || wazeLink || address) && (
            <div style={{ marginTop: 14 }}>
              {editMode && editWaze && (
                <input
                  autoFocus
                  value={wazeLink}
                  onChange={e => onUpdate({ wazeLink: e.target.value })}
                  onBlur={() => setEditWaze(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') setEditWaze(false);
                  }}
                  placeholder="https://waze.com/ul?..."
                  style={{
                    width: '100%',
                    fontFamily: F.body,
                    fontSize: 12,
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: `2px solid ${C.purple}`,
                    outline: 'none',
                    background: 'white',
                    marginBottom: 10,
                  }}
                />
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
              }}>
                {(editMode || wazeLink) && (
                  editMode ? (
                    <button
                      type="button"
                      onClick={() => setEditWaze(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 16,
                        border: `2px solid ${C.purple}`,
                        background: 'white',
                        color: C.deepPurple,
                        fontFamily: F.label,
                        fontSize: 10,
                        letterSpacing: '.25em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        boxShadow: `0 6px 18px rgba(199,125,255,.25)`,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>🚗</span>
                      {wazeLink ? 'Waze' : 'Adauga Waze'}
                    </button>
                  ) : (
                    <a
                      href={wazeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 16,
                        border: `2px solid ${C.purple}`,
                        background: 'white',
                        color: C.deepPurple,
                        fontFamily: F.label,
                        fontSize: 10,
                        letterSpacing: '.25em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        boxShadow: `0 6px 18px rgba(199,125,255,.25)`,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>🚗</span>
                      Waze
                    </a>
                  )
                )}
                {address && (
                  <a
                    href={`https://maps.google.com/?q=${enc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 16,
                      border: `2px solid ${C.purple}`,
                      background: 'white',
                      color: C.deepPurple,
                      fontFamily: F.label,
                      fontSize: 10,
                      letterSpacing: '.25em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      boxShadow: `0 6px 18px rgba(199,125,255,.25)`,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>📍</span>
                    Google Maps
                  </a>
                )}
              </div>
              {editMode && (wazeLink || !address) && !editWaze && (
                <p style={{
                  margin: '8px 0 0',
                  textAlign: 'center',
                  fontFamily: F.body,
                  fontSize: 10,
                  color: `${C.deepPurple}99`,
                }}>
                  click pentru a edita link
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

// ── Shape / Clip system ───────────────────────────────────────────────────────
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
    heart: { clipPath: 'url(#gd-clip-heart)' }, diagonal: { clipPath: 'polygon(0 0,100% 0,100% 80%,0 100%)' },
    'diagonal-r': { clipPath: 'polygon(0 0,100% 0,100% 100%,0 80%)' },
    'wave-b': { clipPath: 'url(#gd-clip-wave-b)' }, 'wave-t': { clipPath: 'url(#gd-clip-wave-t)' },
    'wave-both': { clipPath: 'url(#gd-clip-wave-both)' },
    blob: { clipPath: 'url(#gd-clip-blob)' }, blob2: { clipPath: 'url(#gd-clip-blob2)' },
    blob3: { clipPath: 'url(#gd-clip-blob3)' }, blob4: { clipPath: 'url(#gd-clip-blob4)' },
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
      <clipPath id="gd-clip-wave-b" clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="gd-clip-wave-t" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath>
      <clipPath id="gd-clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="gd-clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath>
      <clipPath id="gd-clip-blob" clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath>
      <clipPath id="gd-clip-blob2" clipPathUnits="objectBoundingBox"><path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z"/></clipPath>
      <clipPath id="gd-clip-blob3" clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath>
      <clipPath id="gd-clip-blob4" clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath>
    </defs>
  </svg>
);

// ── Photo block ───────────────────────────────────────────────────────────────
const PhotoBlock: React.FC<{
  imageData?: string; altText?: string; editMode: boolean;
  onUpload: (url: string) => void; onRemove: () => void;
  onClipChange: (c: ClipShape) => void; onMasksChange: (m: MaskEffect[]) => void;
  onRatioChange: (r: '1:1' | '4:3' | '3:4' | '16:9' | 'free') => void;
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | 'free';
  photoClip?: ClipShape; photoMasks?: MaskEffect[];
  placeholderInitial1?: string;
}> = ({ imageData, altText, editMode, onUpload, onRemove, aspectRatio = 'free', photoClip = 'rect', photoMasks = [], placeholderInitial1 }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const pt: Record<string, string> = { '1:1': '100%', '4:3': '75%', '3:4': '133%', '16:9': '56.25%', free: '66.6%' };
  const combined = { ...getClipStyle(photoClip), ...getMaskStyle(photoMasks) };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    deleteUploadedFile(imageData);
    try {
      const form = new FormData(); form.append('file', file);
      const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${_s?.token || ''}` }, body: form });
      const { url } = await res.json(); onUpload(url);
    } catch {} finally { setUploading(false); }
  };

  if (imageData) return (
    <div style={{ position: 'relative' }}>
      <PhotoClipDefs />
      <div style={{ position: 'relative', paddingTop: pt[aspectRatio], overflow: 'hidden', ...combined }}>
        <img src={imageData} alt={altText || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {editMode && (
          <div className="absolute inset-0 bg-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="p-2 bg-white/90 rounded-full text-pink-600 shadow"><Camera className="w-5 h-5"/></button>
            <button onClick={() => { deleteUploadedFile(imageData); onRemove(); }} className="p-2 bg-white/90 rounded-full text-red-600 shadow"><Trash2 className="w-5 h-5"/></button>
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
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${PINK_L} 0%, ${PINK_DARK} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {uploading
            ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            : <div style={{ textAlign: 'center' }}>
                <Sparkles className="w-12 h-12 text-white/40 mb-2 mx-auto" />
                <span style={{ fontFamily: SCRIPT, fontSize: 48, color: 'white' }}>{(placeholderInitial1 || 'G')[0].toUpperCase()}</span>
              </div>
          }
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
    </div>
  );
};

// ── Calendar ──────────────────────────────────────────────────────────────────
const CalendarMonth: React.FC<{ date: string | undefined }> = ({ date }) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear(), month = d.getMonth(), day = d.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['IANUARIE','FEBRUARIE','MARTIE','APRILIE','MAI','IUNIE','IULIE','AUGUST','SEPTEMBRIE','OCTOMBRIE','NOIEMBRIE','DECEMBRIE'];
  const dayLabels = ['L','M','M','J','V','S','D'];
  const startOffset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <div style={{ background: 'white', borderRadius: 18, padding: 22, textAlign: 'center', border: `2px solid ${PINK_L}` }}>
      <p style={{ fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', color: PINK_DARK, marginBottom: 14 }}>{monthNames[month]} {year}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
        {dayLabels.map((l, i) => <div key={`${l}-${i}`} style={{ fontSize: 9, fontWeight: 700, color: MUTED }}>{l}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {cells.map((cell, i) => {
          const isToday = cell === day;
          return <div key={i} style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? 'white' : cell ? TEXT : 'transparent', background: isToday ? PINK_DARK : 'transparent', borderRadius: '50%' }}>{cell || ''}</div>;
        })}
      </div>
    </div>
  );
};

// ── Music block ───────────────────────────────────────────────────────────────
const MusicBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  imperativeRef?: React.MutableRefObject<{ unlock: () => void; play: () => void; pause: () => void } | null>;
}> = ({ block, editMode, onUpdate, imperativeRef }) => {
  const audioRef  = useRef<HTMLAudioElement>(null);
  const mp3Ref    = useRef<HTMLInputElement>(null);
  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showYt,   setShowYt]   = useState(false);
  const [ytUrl,    setYtUrl]    = useState('');

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onTime  = () => setProgress(a.currentTime);
    const onDur   = () => setDuration(a.duration);
    const onEnd   = () => { setPlaying(false); setProgress(0); };
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onDur);
    a.addEventListener('ended', onEnd);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onDur);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
    };
  }, [block.musicUrl, block.musicType]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const pct = duration ? `${(progress / duration) * 100}%` : '0%';

  const toggleMp3 = () => {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => {}); }
  };
  const seekMp3 = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
  };
  const handleMp3 = async (file: File) => {
    if (!file.type.startsWith('audio/')) return;
    const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
    try {
      const form = new FormData(); form.append('file', file);
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${_s?.token || ''}` }, body: form });
      if (!res.ok) throw new Error('Upload esuat');
      const { url } = await res.json();
      onUpdate({ musicUrl: url, musicType: 'mp3' });
      deleteUploadedFile;
    } catch (e) { console.error('Audio upload:', e); }
  };
  const [ytDownloading, setYtDownloading] = useState(false);
  const [ytError, setYtError] = useState('');

  const submitYt = async () => {
    const trimmed = ytUrl.trim(); if (!trimmed) return;
    const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
    setYtDownloading(true); setYtError('');
    try {
      const res = await fetch(`${API_URL}/download-yt-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_s?.token || ''}` },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Eroare download');
      onUpdate({ musicUrl: data.url, musicType: 'mp3', musicTitle: data.title || '', musicArtist: data.author || '' });
      setShowYt(false); setYtUrl('');
    } catch (e: any) {
      setYtError(e.message || 'Nu s-a putut descarca melodia.');
    } finally {
      setYtDownloading(false);
    }
  };

  const isActive  = !!block.musicUrl;
  const isPlaying = playing;

  useEffect(() => {
    if (!imperativeRef) return;
    imperativeRef.current = {
      unlock: () => {
        if (block.musicType === 'mp3' && audioRef.current && block.musicUrl) {
          audioRef.current.play().then(() => { audioRef.current!.pause(); audioRef.current!.currentTime = 0; }).catch(() => {});
        }
      },
      play: () => {
        if (audioRef.current && block.musicUrl) {
          audioRef.current.play().catch(() => {});
        }
      },
      pause: () => {
        if (audioRef.current) audioRef.current.pause();
      },
    };
  });
  const toggle = toggleMp3;
  const seek   = seekMp3;

  return (
    <div style={{ background: 'white', border: `1.5px solid ${isPlaying ? PINK_DARK : PINK_L}`, borderRadius: 16, padding: '20px 24px', transition: 'border-color 0.4s, box-shadow 0.4s', boxShadow: isPlaying ? `0 0 0 3px ${PINK_DARK}22` : 'none' }}>
      <style>{`@keyframes gd-bar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}`}</style>
      {block.musicType === 'mp3' && block.musicUrl && (
        <audio ref={audioRef} src={block.musicUrl} preload="metadata" />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isPlaying ? PINK_DARK : PINK_XL, border: `1.5px solid ${isPlaying ? PINK_DARK : PINK_L}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
          <Music className="w-4 h-4" style={{ color: isPlaying ? 'white' : PINK_DARK }} />
        </div>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: isPlaying ? PINK_DARK : MUTED, transition: 'color 0.3s' }}>
          {isPlaying ? 'Se reda acum' : 'Melodia Zilei'}
        </span>
        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14, marginLeft: 'auto' }}>
            {[0, 0.2, 0.1, 0.3].map((delay, i) => (
              <div key={i} style={{ width: 3, height: 14, background: PINK_DARK, borderRadius: 2, transformOrigin: 'bottom', animation: `gd-bar 0.7s ease-in-out ${delay}s infinite` }} />
            ))}
          </div>
        )}
      </div>
      {!isActive && editMode && (
        <div>
          {showYt ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: ytError ? 6 : 0 }}>
                <input
                  value={ytUrl} onChange={e => { setYtUrl(e.target.value); setYtError(''); }}
                  onKeyDown={e => e.key === 'Enter' && !ytDownloading && submitYt()}
                  placeholder="https://youtu.be/..." autoFocus disabled={ytDownloading}
                  style={{ flex: 1, background: PINK_XL, border: `1px solid ${ytError ? '#ef4444' : PINK_L}`, borderRadius: 8, padding: '9px 12px', fontFamily: SANS, fontSize: 11, color: TEXT, outline: 'none', opacity: ytDownloading ? 0.6 : 1 }}
                />
                <button type="button" onClick={submitYt} disabled={ytDownloading}
                  style={{ background: PINK_DARK, border: 'none', borderRadius: 8, padding: '0 14px', cursor: ytDownloading ? 'not-allowed' : 'pointer', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'white', opacity: ytDownloading ? 0.7 : 1, minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ytDownloading ? <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : '✓'}
                </button>
                <button type="button" onClick={() => { setShowYt(false); setYtUrl(''); setYtError(''); }} disabled={ytDownloading}
                  style={{ background: PINK_XL, border: 'none', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: MUTED, fontSize: 14 }}>✕</button>
              </div>
              {ytDownloading && <p style={{ fontFamily: SANS, fontSize: 9, color: PINK_DARK, margin: 0, textAlign: 'center', letterSpacing: '0.1em' }}>⏳ Se descarca melodia de pe YouTube...</p>}
              {ytError && <p style={{ fontFamily: SANS, fontSize: 9, color: '#ef4444', margin: 0 }}>⚠ {ytError}</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => mp3Ref.current?.click()}
                style={{ flex: 1, background: PINK_XL, border: `1px dashed ${PINK_L}`, borderRadius: 10, padding: '14px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Upload className="w-5 h-5" style={{ color: PINK_DARK, opacity: 0.7 }} />
                <span style={{ fontFamily: SANS, fontSize: 9, color: MUTED, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>MP3</span>
              </button>
              <input ref={mp3Ref} type="file" accept="audio/*,.mp3"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleMp3(f); }}
                style={{ display: 'none' }} />
            </div>
          )}
        </div>
      )}
      {!isActive && !editMode && (
        <div style={{ textAlign: 'center', padding: '16px 0', opacity: 0.4 }}>
          <Music className="w-8 h-8" style={{ color: PINK_DARK, display: 'block', margin: '0 auto 6px' }} />
          <p style={{ fontFamily: SERIF, fontSize: 12, fontStyle: 'italic', color: MUTED, margin: 0 }}>Melodia va aparea aici</p>
        </div>
      )}
      {isActive && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: `linear-gradient(135deg, ${PINK_XL}, ${PINK_L})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${PINK_L}` }}>
              <Music className="w-5 h-5" style={{ color: PINK_DARK, opacity: 0.7 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle || ''} onChange={v => onUpdate({ musicTitle: v })} placeholder="Titlul melodiei..."
                style={{ fontFamily: SERIF, fontSize: 14, fontStyle: 'italic', color: TEXT, margin: 0, lineHeight: 1.3 }} />
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist || ''} onChange={v => onUpdate({ musicArtist: v })} placeholder="Artist..."
                style={{ fontFamily: SANS, fontSize: 10, color: MUTED, margin: '2px 0 0' }} />
            </div>
          </div>
          <div onClick={seek} style={{ height: 4, background: PINK_L, borderRadius: 99, marginBottom: 6, cursor: 'pointer', position: 'relative' }}>
            <div style={{ height: '100%', borderRadius: 99, background: PINK_DARK, width: pct, transition: 'width 0.3s linear' }} />
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: pct, marginLeft: -5, width: 10, height: 10, borderRadius: '50%', background: PINK_DARK, transition: 'left 0.3s linear' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: SANS, fontSize: 9, color: MUTED }}>{fmt(progress)}</span>
            <span style={{ fontFamily: SANS, fontSize: 9, color: MUTED }}>{duration ? fmt(duration) : '--:--'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <button type="button"
              onClick={() => {
                const a = audioRef.current; if (a) a.currentTime = Math.max(0, a.currentTime - 10);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.5 }}>
              <SkipBack className="w-4 h-4" style={{ color: PINK_DARK }} />
            </button>
            <button type="button" onClick={toggle}
              style={{ width: 44, height: 44, borderRadius: '50%', background: PINK_DARK, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${PINK_DARK}44` }}>
              {isPlaying
                ? <Pause className="w-4 h-4" style={{ color: 'white' }} />
                : <Play  className="w-4 h-4" style={{ color: 'white', marginLeft: 2 }} />}
            </button>
            <button type="button"
              onClick={() => {
                const a = audioRef.current; if (a) a.currentTime = Math.min(duration, a.currentTime + 10);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.5 }}>
              <SkipForward className="w-4 h-4" style={{ color: PINK_DARK }} />
            </button>
          </div>
          {editMode && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button type="button"
                onClick={() => { onUpdate({ musicUrl: '', musicType: 'none' as any }); setShowYt(true); }}
                style={{ background: PINK_XL, border: `1px solid ${PINK_L}`, borderRadius: 99, padding: '4px 14px', cursor: 'pointer', fontFamily: SANS, fontSize: 9, color: MUTED, fontWeight: 700 }}>
                Schimba sursa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────
interface TimeLeft{days:number;hours:number;minutes:number;seconds:number;total:number}
function calcTimeLeft(date:string):TimeLeft{
  const diff=new Date(date).getTime()-Date.now();
  if(diff<=0) return{days:0,hours:0,minutes:0,seconds:0,total:0};
  return{days:Math.floor(diff/86400000),hours:Math.floor((diff/3600000)%24),
    minutes:Math.floor((diff/60000)%60),seconds:Math.floor((diff/1000)%60),total:diff};
}

const FlipDigit:React.FC<{value:number;label:string;color:string}>=({value,label,color})=>{
  const prev=useRef(value);
  const [flash,setFlash]=useState(false);
  useEffect(()=>{
    if(prev.current!==value){setFlash(true);const t=setTimeout(()=>setFlash(false),300);prev.current=value;return()=>clearTimeout(t);}
  },[value]);
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
      <div style={{width:56,height:62,
        background:`linear-gradient(135deg,${color},${color}cc)`,
        borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',
        position:'relative',overflow:'hidden',
        boxShadow:`0 4px 16px ${color}66,inset 0 1px 0 rgba(255,255,255,.3)`,
        transform:flash?'scale(1.1)':'scale(1)',transition:'transform .14s'}}>
        <div style={{position:'absolute',inset:0,
          background:'linear-gradient(135deg,rgba(255,255,255,.25),transparent)',pointerEvents:'none'}}/>
        <span style={{fontFamily:F.display,fontSize:24,color:'white',lineHeight:1,
          textShadow:'0 2px 4px rgba(0,0,0,.2)'}}>{String(value).padStart(2,'0')}</span>
      </div>
      <span style={{fontFamily:F.label,fontSize:8,letterSpacing:'.3em',
        textTransform:'uppercase',color,fontWeight:700}}>{label}</span>
    </div>
  );
};

const Countdown:React.FC<{targetDate:string|undefined}>=({targetDate})=>{
  const [tl,setTl]=useState<TimeLeft|null>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    setReady(true);
    if(!targetDate) return;
    setTl(calcTimeLeft(targetDate));
    const id=setInterval(()=>setTl(calcTimeLeft(targetDate!)),1000);
    return()=>clearInterval(id);
  },[targetDate]);
  if(!ready||!targetDate) return null;
  const isOver=tl?.total===0;
  const isSoon=(tl?.total??0)<86400000;
  if(isOver) return(
    <div style={{textAlign:'center',padding:'12px 20px',
      background:`${C.pinkLight}55`,border:`3px solid ${C.hotPink}`,borderRadius:18}}>
      <p style={{fontFamily:F.label,fontSize:12,color:C.deepPink,margin:0}}>🎉 Petrecerea a inceput! 🎉</p>
    </div>
  );
  const vals=[tl?.days??0,tl?.hours??0,tl?.minutes??0,tl?.seconds??0];
  const lbls=['Zile','Ore','Min','Sec'];
  const cols=[C.hotPink,C.purple,C.mint,C.coral];
  return(
    <div>
      <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
        <span style={{fontFamily:F.label,fontSize:9,letterSpacing:'.4em',textTransform:'uppercase',
          color:C.deepPurple,padding:'4px 16px',borderRadius:50,
          background:`${C.lavender}`,border:`2px solid ${C.purple}55`}}>
          {isSoon?'🎉 Maine!':'⏳ Timp ramas'}
        </span>
      </div>
      <div style={{display:'flex',justifyContent:'center',alignItems:'flex-start',gap:8}}>
        {vals.map((v,i)=>(
          <React.Fragment key={i}>
            <FlipDigit value={v} label={lbls[i]} color={cols[i]}/>
            {i<3&&<span style={{fontFamily:F.display,fontSize:22,color:C.purple,paddingTop:14,flexShrink:0,opacity:.5}}>:</span>}
          </React.Fragment>
        ))}
      </div>
      
    </div>
  );
};

// ── Template Defaults (blocks) ────────────────────────────────────────────────
export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = [
 {
    id: 'def-photo-1',
    type: 'photo' as const,
    show: true,
    imageData: 'https://clubulbebelusilor.ro/wp-content/uploads/2021/02/bebelusi-sfaturi-pentru-mamici.jpg',
    altText: 'Fotografia printesei',
    aspectRatio: '3:4' as const,
    photoClip: 'arch' as const,
    photoMasks: ['fade-b'] as any,
  },
  { id: 'def-text-1', type: 'text', show: true, content: 'O poveste magica incepe odata cu venirea pe lume a celui mai iubit copil. Va asteptam cu drag sa fiti parte din aceasta zi de poveste.' },

  { id: 'def-calendar', type: 'calendar', show: true },
  { id: 'def-divider-1', type: 'divider', show: true },
  { id: 'def-text-2', type: 'text', show: true, content: 'Sub ocrotirea si dragostea celor care ne indruma pasii si ne sunt alaturi la fiecare inceput' },
  { id: 'def-family-1', type: 'family', show: true, label: 'Parintii', content: 'Cu drag si recunostinta', members: JSON.stringify([{ name1: 'Mama', name2: 'Tata' }]) },
  { id: 'def-family-1', type: 'family', show: true, label: 'Nasii', content: 'Cu drag si recunostinta', members: JSON.stringify([{ name1: 'Nasa', name2: 'Nasul' }]) },
{ id: 'def-text-1', type: 'text', show: true, content: 'Momentele speciale ale acestei zile vor avea loc in urmatoarele locatii:' },
  { id: 'def-location-1', type: 'location', show: true, label: 'Slujba Sfintei Taine a Botezului', time: '15:00', locationName: 'Manastirea Pasarea', locationAddress: 'Strada Basmului nr. 1', wazeLink: 'https://www.waze.com/ro/live-map/' },
  { id: 'def-divider-1', type: 'divider', show: true },
 { id: 'def-location-1', type: 'location', show: true, label: 'Petrecerea', time: '20:00', locationName: 'Restaurant Monato', locationAddress: ' Strada Plaiului 1, 085100', wazeLink: 'https://www.waze.com/ro/live-map/' },
{ id: 'def-divider-1', type: 'divider', show: true },
{
    id: 'def-photo-2',
    type: 'photo' as const,
    show: true,
    imageData: 'https://clubulbebelusilor.ro/wp-content/uploads/2021/02/bebelusi-sfaturi-pentru-mamici.jpg',
    altText: 'Fotografia printesei',
    aspectRatio: '1:1' as const,
    photoClip: 'blob' as const,
    photoMasks: [] as any,
  },

{ id: 'def-text-1', type: 'text', show: true, content: 'O piesa de suflet, aleasa cu drag pentru aceasta zi de neuitat, care ne va insoti emotiile si bucuria fiecarui moment.' },
  { id: 'def-music-1', type: 'music', show: true, musicTitle: '', musicArtist: '', musicUrl: '', musicType: 'none' },
{ id: 'def-divider-1', type: 'divider', show: true },
{ id: 'def-text-1', type: 'text', show: true, content: 'Ne-ar bucura sa ne confirmati prezenta dumneavoastra, pentru o buna organizare a evenimentului.' },
  { id: 'def-rsvp-1', type: 'rsvp', show: true, label: 'Confirma Prezenta' },



];


// ─── INTRO ────────────────────────────────────────────────────────────────────
interface IntroProps{l1:string;l2:string;onDone:()=>void}

const GabbyIntro:React.FC<IntroProps>=({l1,l2,onDone})=>{
  const showSecond=Boolean(l2&&l2!==l1);
  const [phase,setPhase]=useState(0);   // 0=sealed, 1→5=opening, 6=fade
  const [fade,setFade]=useState(false);
  const [btnClicked,setBtnClicked]=useState(false);
  const [confetti,setConfetti]=useState<any[]>([]);

  const handleOpen=useCallback(()=>{
    if(btnClicked) return;
    setBtnClicked(true);
    // burst confetti
    const cols=[C.hotPink,C.purple,C.mint,C.yellow,C.coral,C.skyBlue,C.pinkLight];
    const shps=['circle','rect','circle'];
    setConfetti(Array.from({length:55},(_,i)=>({
      id:i,x:15+Math.random()*70,
      color:cols[i%cols.length],shape:shps[i%shps.length],
      delay:Math.random()*.9,size:5+Math.random()*9,
    })));
    setPhase(1);
    setTimeout(()=>setPhase(2),400);
    setTimeout(()=>setPhase(3),900);
    setTimeout(()=>setPhase(4),1500);
    setTimeout(()=>setPhase(5),2100);
    setTimeout(()=>{setFade(true);setTimeout(onDone,700);},3100);
  },[btnClicked,onDone]);

  const sparkles=[
    {x:5,y:8,c:C.hotPink,s:16,d:0},{x:91,y:6,c:C.yellow,s:14,d:.5},
    {x:8,y:32,c:C.purple,s:18,d:.9},{x:90,y:30,c:C.mint,s:14,d:.3},
    {x:4,y:62,c:C.coral,s:13,d:1.2},{x:94,y:58,c:C.pinkLight,s:15,d:.7},
    {x:48,y:3,c:C.purple,s:20,d:.2},{x:3,y:82,c:C.yellow,s:12,d:1.5},{x:94,y:80,c:C.hotPink,s:14,d:.9},
  ];

  return(
    <div style={{position:'fixed',inset:0,zIndex:9999,overflow:'hidden',
      background:`linear-gradient(135deg,#FFD6EC 0%,#E8D5FF 35%,#C5F5FF 65%,#FFF9C4 100%)`,
      backgroundSize:'400% 400%',animation:'gd-bgShift 6s ease infinite',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      opacity:fade?0:1,transition:fade?'opacity .75s ease':'none',
      pointerEvents:fade?'none':'auto'}}>
      <style>{GD_CSS}</style>

      {/* Confetti */}
      {confetti.map(c=><Confetto key={c.id} {...c}/>)}

      {/* Sparkles */}
      {sparkles.map((s,i)=><Sparkle key={i} x={s.x} y={s.y} color={s.c} size={s.s} delay={s.d}/>)}
      <PawScatter/>

      {/* Floating bubbles */}
      {[...Array(6)].map((_,i)=>(
        <div key={i} style={{position:'absolute',
          width:28+i*18,height:28+i*18,borderRadius:'50%',
          background:`rgba(255,255,255,${.12+i*.03})`,
          left:`${(i*16+5)%88}%`,top:`${(i*19+8)%80}%`,
          animation:`gd-float ${4+i}s ${i*.4}s ease-in-out infinite`,
          border:'1.5px solid rgba(255,255,255,.4)',backdropFilter:'blur(4px)',
          pointerEvents:'none'}}/>
      ))}

      {/* ── SEALED STATE ── */}
      {phase===0&&(
        <div style={{position:'relative',zIndex:10,textAlign:'center',
          display:'flex',flexDirection:'column',alignItems:'center',gap:18}}>

          {/* Logo */}
          <div style={{animation:'gd-float 3.5s ease-in-out infinite'}}>
            <img src={IMG_LOGO} alt="Gabby's Dollhouse"
              style={{width:'min(280px,75vw)',objectFit:'contain',
                filter:`drop-shadow(0 4px 18px rgba(233,30,140,.4))`}}/>
          </div>

          {/* Heart image */}
          <div style={{animation:'gd-heartBeat 2.5s ease-in-out infinite',
            filter:`drop-shadow(0 0 20px rgba(255,105,180,.6))`}}>
            <img src={IMG_HEART} alt="Gabby & friends"
              style={{width:'min(260px,70vw)',objectFit:'contain'}}/>
          </div>

          {/* Name */}
          <div>
            <h1 style={{fontFamily:F.display,fontSize:'clamp(28px,7vw,44px)',
              background:`linear-gradient(135deg,${C.deepPink},${C.deepPurple})`,
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              margin:'0 0 4px',lineHeight:1.1,
              filter:`drop-shadow(2px 3px 0 rgba(233,30,140,.2))`}}>
              {showSecond?`${l1} & ${l2}`:l1}
            </h1>
            <p style={{fontFamily:F.display,fontSize:14,color:C.deepPurple,margin:0,opacity:.75}}>
              Te invita in casuta magica!
            </p>
          </div>

          {/* Cats row */}
          <div style={{display:'flex',alignItems:'flex-end',gap:16}}>
            {[{src:IMG_CUPCAKE,d:0},{src:IMG_JELLYCAT,d:.3},{src:IMG_BOXCAT,d:.6}].map((ch,i)=>(
              <div key={i} className="gd-hover"
                style={{animation:`gd-bob ${3+i*.4}s ${ch.d}s ease-in-out infinite`}}>
                <img src={ch.src} alt="" style={{height:75,objectFit:'contain',
                  filter:'drop-shadow(0 4px 12px rgba(0,0,0,.3))'}}/>
              </div>
            ))}
          </div>

          {/* PRESS TO OPEN button */}
          <button onClick={handleOpen} style={{
            fontFamily:F.label,fontSize:13,letterSpacing:'.4em',
            textTransform:'uppercase',color:C.white,
            background:`linear-gradient(135deg,${C.deepPink},${C.deepPurple})`,
            border:'none',borderRadius:50,padding:'16px 36px',cursor:'pointer',
            boxShadow:`0 6px 26px rgba(233,30,140,.55),0 0 0 4px ${C.pinkLight}`,
            animation:'gd-pulse 2.2s ease-in-out infinite',
            transition:'all .2s',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,
              background:'linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)',
              backgroundSize:'200% 100%',animation:'gd-shimmer 2s linear infinite',borderRadius:50}}/>
            <span style={{position:'relative'}}>Deschide Casuta</span>
          </button>

          {/* <p style={{fontFamily:F.body,fontWeight:800,fontSize:10,color:C.deepPurple,
            opacity:.6,letterSpacing:2,textTransform:'uppercase',margin:0}}>
            apasa pentru a vedea invitatia
          </p> */}
        </div>
      )}

      {/* ── OPENING SEQUENCE ── */}
      {phase>=1&&(
        <div style={{position:'relative',zIndex:10,textAlign:'center',
          display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>

          {/* Rainbow scene */}
          <div style={{
            opacity:phase>=2?1:0,
            transform:phase>=2?'translateY(0) scale(1)':'translateY(30px) scale(.9)',
            transition:'opacity .55s .05s,transform .6s .05s cubic-bezier(.22,1,.36,1)'}}>
            <img src={IMG_RAINBOW} alt="Gabby cast"
              style={{width:'min(340px,88vw)',borderRadius:16,objectFit:'cover',
                filter:'brightness(1.05) saturate(1.2)',
                boxShadow:`0 8px 32px rgba(233,30,140,.35)`,
                border:`3px solid rgba(255,255,255,.6)`}}/>
          </div>

          {/* Logo spins in */}
          <div style={{
            opacity:phase>=2?1:0,
            animation:phase>=2?'gd-logoIn .65s cubic-bezier(.34,1.4,.64,1) both':'none',
            marginTop:2}}>
            <img src={IMG_LOGO} alt="Gabby's Dollhouse"
              style={{width:'min(240px,65vw)',objectFit:'contain',
                filter:`drop-shadow(0 4px 16px rgba(233,30,140,.4))`}}/>
          </div>

          {/* Title */}
          <div style={{
            opacity:phase>=3?1:0,
            transform:phase>=3?'translateY(0) scale(1)':'translateY(16px) scale(.9)',
            transition:'opacity .5s,transform .5s cubic-bezier(.22,1,.36,1)'}}>
            <p style={{fontFamily:F.label,fontSize:9,letterSpacing:'.55em',
              textTransform:'uppercase',color:C.deepPink,margin:'0 0 3px',opacity:.9}}>
              ✨ GABBY'S DOLLHOUSE ✨
            </p>
            <h1 style={{fontFamily:F.display,fontSize:'clamp(30px,7.5vw,50px)',
              background:`linear-gradient(135deg,${C.deepPink},${C.deepPurple})`,
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              margin:'0 0 2px',lineHeight:1.05,
              filter:`drop-shadow(2px 3px 0 rgba(233,30,140,.2))`}}>
              {showSecond?`${l1} & ${l2}`:l1}
            </h1>
            <p style={{fontFamily:F.display,fontSize:14,color:C.deepPurple,margin:0,opacity:.75}}>
              te invita in Casuta Magica! 🐱
            </p>
          </div>

          {/* Cats appear */}
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'center',gap:12,
            marginTop:8,
            opacity:phase>=4?1:0,transition:'opacity .5s .05s'}}>
            {[
              {src:IMG_CUPCAKE,from:'left',d:0},
              {src:IMG_JELLYCAT,from:'bottom',d:.12},
              {src:IMG_BOXCAT,from:'right',d:.24},
            ].map((ch,i)=>(
              <div key={i} style={{
                opacity:phase>=4?1:0,
                transform:phase>=4?'translateX(0) translateY(0)'
                  :ch.from==='left'?'translateX(-50px)'
                  :ch.from==='right'?'translateX(50px)':'translateY(40px)',
                transition:`opacity .5s ${ch.d}s,transform .55s ${ch.d}s cubic-bezier(.22,1,.36,1)`,
                animation:phase>=4?`gd-bounce ${1.4+i*.3}s ${ch.d*2}s ease-in-out infinite`:'none',
              }}>
                <img src={ch.src} alt="" style={{height:72,objectFit:'contain',
                  filter:'drop-shadow(0 4px 12px rgba(0,0,0,.3))'}}/>
              </div>
            ))}
          </div>

          <p style={{fontFamily:F.label,fontSize:8,letterSpacing:'.4em',
            textTransform:'uppercase',color:`rgba(123,47,190,.55)`,margin:'6px 0 0',
            opacity:phase>=5?1:0,transition:'opacity .5s'}}>
            🐾 Casuta te asteapta! 🐾
          </p>
        </div>
      )}
    </div>
  );
};

const AudioPermissionModal: React.FC<{ childName: string; onAllow: () => void; onDeny: () => void }> = ({ childName, onAllow, onDeny }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 10020, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "absolute", inset: 0, background: "rgba(123,47,190,0.65)", backdropFilter: "blur(8px)" }} />
    <div style={{ position: "relative", background: "white", borderRadius: 24, padding: "36px 32px 28px", maxWidth: 340, width: "90%", textAlign: "center", boxShadow: "0 24px 80px rgba(123,47,190,0.35)", border: `1px solid ${PINK_L}` }}>
      <style>{`@keyframes gd-audio-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${PINK_L},${PINK_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "gd-audio-pulse 2s ease-in-out infinite", boxShadow: `0 8px 24px rgba(233,30,140,.35)` }}>
        <Music className="w-8 h-8" style={{ color: "white" }} />
      </div>
      <p style={{ fontFamily: F.display, fontSize: 30, color: PINK_DARK, margin: "0 0 6px", lineHeight: 1.1 }}>{childName}</p>
      <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.deepPurple, margin: "0 0 8px" }}>te invita la o poveste magica</p>
      <p style={{ fontFamily: F.body, fontSize: 11, color: MUTED, margin: "0 0 28px", lineHeight: 1.6 }}>Invitatia are o melodie speciala.<br />Vrei sa activezi muzica?</p>
      <button
        type="button"
        onClick={onAllow}
        style={{ width: "100%", padding: "14px 0", background: `linear-gradient(135deg,${PINK_DARK},${PINK_D})`, border: "none", borderRadius: 50, cursor: "pointer", fontFamily: F.label, fontSize: 11, fontWeight: 700, color: "white", letterSpacing: "0.1em", marginBottom: 10, boxShadow: `0 6px 20px rgba(123,47,190,.4)` }}
      >
        Da, activeaza muzica
      </button>
      <button
        type="button"
        onClick={onDeny}
        style={{ width: "100%", padding: "10px 0", background: "transparent", border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 11, color: MUTED }}
      >
        Nu, continua fara muzica
      </button>
    </div>
  </div>
);

// ── Insert + Toolbar ──────────────────────────────────────────────────────────
const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: '🖼', text: '✏️', location: '📍', calendar: '📅',
  countdown: '⏱', music: '🎵', gift: '🎁', whatsapp: '💬', rsvp: '✉️', divider: '—', family: '👨‍👩‍👧',
  date: '📆', description: '📝', timeline: '🗓',
};

const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-4 right-2 flex items-center gap-1 rounded-full border bg-white shadow-lg px-2 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-[9999999999999999999999] pointer-events-none group-hover/block:pointer-events-auto">
    <button onClick={onUp} disabled={isFirst} className="p-1 rounded-full hover:bg-pink-50 disabled:opacity-20"><ChevronUp className="w-3 h-3 text-pink-600"/></button>
    <button onClick={onDown} disabled={isLast} className="p-1 rounded-full hover:bg-pink-50 disabled:opacity-20"><ChevronDown className="w-3 h-3 text-pink-600"/></button>
    <div className="w-px h-3 bg-pink-100 mx-1" />
    <button onClick={onToggle} className="p-1 rounded-full hover:bg-pink-50">
      {visible ? <Eye className="w-3 h-3 text-pink-600"/> : <EyeOff className="w-3 h-3 text-gray-400"/>}
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
    <div
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, zIndex: 20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `repeating-linear-gradient(to right, ${PINK_L} 0, ${PINK_L} 6px, transparent 6px, transparent 12px)`,
        opacity: 1, transition: 'opacity 0.15s', zIndex: 1
      }} />
      <button
        type="button"
        onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{
          width: 26, height: 26, borderRadius: '50%',
          background: isOpen ? PINK_DARK : 'white',
          border: `1.5px solid ${PINK_L}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: isOpen ? 'white' : PINK_DARK,
          boxShadow: `0 2px 10px ${PINK_DARK}22`,
          opacity: 1,
          transition: 'opacity 0.15s, transform 0.15s, background 0.15s',
          transform: visible ? 'scale(1)' : 'scale(0.7)',
          zIndex: 2, position: 'relative',
          lineHeight: 1, fontWeight: 700,
        }}
      >{isOpen ? '×' : '+'}</button>

      {isOpen && (
        <div
          style={{
            position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)',
            background: 'white',
            borderRadius: 16,
            border: `1px solid ${PINK_L}`,
            boxShadow: '0 16px 48px rgba(190,24,93,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            padding: '16px',
            zIndex: 100,
            width: 260,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <p style={{ fontFamily: SANS, fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: MUTED, margin: '0 0 10px', textAlign: 'center' }}>
            Adauga bloc
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button" onClick={() => onInsert(bt.type, bt.def)}
                style={{
                  background: PINK_XL,
                  border: `1px solid ${PINK_L}`,
                  borderRadius: 10, padding: '8px 4px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = PINK_L; (e.currentTarget as HTMLButtonElement).style.borderColor = PINK_DARK; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = PINK_XL; (e.currentTarget as HTMLButtonElement).style.borderColor = PINK_L; }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{BLOCK_TYPE_ICONS[bt.type] || '+'}</span>
                <span style={{ fontFamily: SANS, fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: PINK_DARK, lineHeight: 1.2, textAlign: 'center' }}>
                  {bt.label.replace(/^[^\s]+\s/, '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN TEMPLATE ────────────────────────────────────────────────────────────
const GabbysDollhouseTemplate: React.FC<InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
  introPreview?: boolean;
  scrollContainer?: HTMLElement | null;
}> = ({
  data,
  onOpenRSVP,
  editMode = false,
  onProfileUpdate,
  onBlocksUpdate,
  onBlockSelect,
  selectedBlockId,
}) => {
  const { profile, guest } = data;
  const theme = getGabbyTheme((profile as any).colorTheme);
  C = {
    hotPink: theme.PINK_D,
    deepPink: theme.PINK_DARK,
    purple: theme.PINK_L,
    deepPurple: theme.PINK_DARK,
    mint: theme.CREAM,
    deepMint: theme.MUTED,
    yellow: theme.GOLD,
    coral: theme.PINK_D,
    skyBlue: theme.PINK_XL,
    lavender: theme.PINK_XL,
    white: "#FFFCFF",
    cream: theme.CREAM,
    inkDark: theme.TEXT,
    pinkLight: theme.PINK_L,
  };
  PINK_DARK = theme.PINK_DARK;
  PINK_D    = theme.PINK_D;
  PINK_L    = theme.PINK_L;
  PINK_XL   = theme.PINK_XL;
  CREAM     = theme.CREAM;
  TEXT      = theme.TEXT;
  MUTED     = theme.MUTED;
  GOLD      = theme.GOLD;
  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };
  const isWedding  = !profile.eventType || profile.eventType==='wedding'
                     || profile.eventType==='anniversary';

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
  const addBlock = useCallback((type: string, def: any) => {
    setBlocks(prev => { const nb = [...prev, { id: Date.now().toString(), type: type as InvitationBlockType, show: true, ...def }]; onBlocksUpdate?.(nb); return nb; });
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
  const updateTimeline = (next: any[]) => {
    onProfileUpdate?.({
      timeline: JSON.stringify(next),
      showTimeline: true,
    } as any);
  };
  const addTimelineItem = (preset: { icon?: string; title?: string } | null) => {
    const current = getTimelineItems();
    const next = [
      ...current,
      {
        id: Date.now().toString(),
        title: preset?.title || "",
        time: "",
        location: "",
        icon: preset?.icon || "party",
        notice: "",
      },
    ];
    updateTimeline(next);
  };
  const updateTimelineItem = (id: string, patch: any) => {
    const current = getTimelineItems();
    updateTimeline(current.map((t: any) => (t.id === id ? { ...t, ...patch } : t)));
  };
  const removeTimelineItem = (id: string) => {
    const current = getTimelineItems();
    updateTimeline(current.filter((t: any) => t.id !== id));
  };

  const handleInsertAt = (afterIdx: number, type: string, def: any) => {
    if (type === "timeline") {
      const items = getTimelineItems();
      if (items.length === 0) addTimelineItem(null);
      addBlockAt(afterIdx, type, def);
      setOpenInsertAt(null);
      return;
    }
    addBlockAt(afterIdx, type, def);
    setOpenInsertAt(null);
  };

  const _pq = useRef<Record<string, any>>({});
  const _pt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const upProfile = useCallback((field: string, value: any) => {
    _pq.current = { ..._pq.current, [field]: value };
    if (_pt.current) clearTimeout(_pt.current);
    _pt.current = setTimeout(() => { onProfileUpdate?.(_pq.current); _pq.current = {}; }, 400);
  }, [onProfileUpdate]);

  const [showIntro, setShowIntro] = useState(!editMode);
  const [contentVisible, setContentVisible] = useState(editMode);
  const hasPlayableMusic = blocks.some(
    (b: any) => b.type === "music" && b.show !== false && !!b.musicUrl
  );
  useEffect(() => { if (editMode) { setShowIntro(false); setContentVisible(true); } }, [editMode]);

  useEffect(() => {
    if (!editMode && showIntro && hasPlayableMusic && !audioAllowedRef.current) {
      setShowAudioModal(true);
    } else {
      setShowAudioModal(false);
    }
  }, [editMode, showIntro, hasPlayableMusic]);

  useEffect(()=>{
    if(showIntro){
      document.body.style.overflow='hidden'; document.body.style.position='fixed';
      document.body.style.top='0'; document.body.style.left='0'; document.body.style.right='0';
    } else {
      document.body.style.overflow=''; document.body.style.position='';
      document.body.style.top=''; document.body.style.left=''; document.body.style.right='';
    }
    return()=>{
      document.body.style.overflow=''; document.body.style.position='';
      document.body.style.top=''; document.body.style.left=''; document.body.style.right='';
    };
  },[showIntro]);

  const handleIntroDone=()=>{
    window.scrollTo(0,0);
    setShowIntro(false);
    setTimeout(()=>{
      window.scrollTo(0,0);
      setContentVisible(true);
      if (audioAllowedRef.current) {
        musicPlayRef.current?.play();
      }
    },60);
  };

  const l1=(profile.partner1Name||'Prenume').trim() || 'Prenume';
  const l2=!isWedding?'':(profile.partner2Name||'').trim();

  const getEventText=()=>{
    const map:Record<string,any>={
      wedding:     {welcome:'Cu onoare va invitam',celebration:'casatoriei',churchLabel:'Cununia',venueLabel:'Receptia',civilLabel:'Cununie Civila'},
      baptism:     {welcome:'Cu bucurie va invitam',celebration:'botezului',churchLabel:'Botezul',venueLabel:'Petrecerea',civilLabel:''},
      anniversary: {welcome:'Cu drag va invitam',celebration:'aniversarii',churchLabel:'Ceremonia',venueLabel:'Receptia',civilLabel:''},
      kids:        {welcome:'Te invitam la',celebration:'ziua de nastere',churchLabel:'Distractia',venueLabel:'Petrecerea',civilLabel:''},
    };
    const d=map[profile.eventType||'wedding']||map.wedding;
    return{
      welcome:     profile.welcomeText?.trim()     ||d.welcome,
      celebration: profile.celebrationText?.trim() ||d.celebration,
      churchLabel: profile.churchLabel?.trim()     ||d.churchLabel,
      venueLabel:  profile.venueLabel?.trim()      ||d.venueLabel,
      civilLabel:  profile.civilLabel?.trim()      ||d.civilLabel,
    };
  };
  const texts=getEventText();

  const wd             = profile.weddingDate?new Date(profile.weddingDate):null;
  const displayDay     = wd?wd.getDate():'';
  const displayMonth   = wd?wd.toLocaleDateString('ro-RO',{month:'long'}).toUpperCase():'';
  const displayYear    = wd?wd.getFullYear():'';
  const displayWeekday = wd?wd.toLocaleDateString('ro-RO',{weekday:'long'}):'';

  const card:React.CSSProperties={
    background:'rgba(255,255,255,.78)',
    backdropFilter:'blur(12px)',borderRadius:26,
    border:'3px solid rgba(255,255,255,.9)',
    boxShadow:`0 6px 28px rgba(199,125,255,.2)`,
    padding:'22px 20px',marginTop:8,position:'relative',overflow:'hidden',
  };

  const sparklesContent=[
    {x:2,y:10,c:C.hotPink,s:14,d:0},{x:95,y:7,c:C.yellow,s:12,d:.5},
    {x:1,y:42,c:C.purple,s:15,d:.9},{x:97,y:38,c:C.mint,s:13,d:.3},
    {x:3,y:72,c:C.coral,s:11,d:1.2},{x:96,y:68,c:C.pinkLight,s:14,d:.7},
    {x:48,y:1,c:C.purple,s:18,d:.2},
  ];

  const heroBlock: InvitationBlock = { id: "__hero__", type: "__hero__" as any, show: true, textStyles: (profile as any).heroTextStyles } as any;
  const locationStickers = [
    IMG_WEBSITE,
    IMG_PANDY,
    IMG_BABYBOX,
    IMG_DJCATNIP,
    IMG_CARLITA,
    IMG_CATRAT,
    IMG_MARTY,
    IMG_PILLOWCAT,
  ];

  const BLOCK_TYPES = [
    { type: 'photo',     label: '📷 Foto',      def: { imageData: undefined, aspectRatio: '1:1', photoClip: 'rect', photoMasks: [] } },
    { type: 'text',      label: 'Text',         def: { content: 'Te asteptam cu drag...' } },
    { type: 'location',  label: 'Locatie',      def: { label: 'Locatie', time: '11:00', locationName: 'Locatie eveniment', locationAddress: 'Strada Exemplu, Nr. 1' } },
    { type: 'calendar',  label: '📅 Calendar',  def: {} },
    { type: 'countdown', label: '⏱ Countdown',  def: {} },
    { type: 'timeline',  label: '🗓 Cronologie', def: {} },
    { type: 'music',     label: '🎵 Muzica',    def: { musicTitle: '', musicArtist: '', musicType: 'none' } },
    { type: 'gift',      label: '🎁 Cadouri',   def: { sectionTitle: 'Sugestie cadou', content: '', iban: '', ibanName: '' } },
    { type: 'whatsapp',  label: 'WhatsApp',     def: { label: 'Contact WhatsApp', content: '0700000000' } },
    { type: 'rsvp',      label: 'RSVP',         def: { label: 'Confirma Prezenta' } },
    { type: 'divider',   label: 'Linie',        def: {} },
    { type: 'family',    label: '👨‍👩‍👧 Familie', def: { label: 'Parintii copilului', content: 'Cu drag si recunostinta', members: JSON.stringify([{ name1: 'Mama', name2: 'Tata' }]) } },
    { type: 'date',      label: '📆 Data',      def: {} },
    { type: 'description', label: 'Descriere', def: { content: 'O scurta descriere...' } },
  ];

  return(
    <>
      <style>{GD_CSS}</style>
      {showAudioModal && (
        <AudioPermissionModal
          childName={profile.partner1Name || "Invitatia"}
          onAllow={() => {
            audioAllowedRef.current = true;
            musicPlayRef.current?.unlock();
            setShowAudioModal(false);
          }}
          onDeny={() => {
            audioAllowedRef.current = false;
            setShowAudioModal(false);
          }}
        />
      )}
      {showIntro&&<GabbyIntro l1={l1} l2={l2} onDone={handleIntroDone}/>}

      <div style={{minHeight:'100vh',position:'relative',fontFamily:F.body,
        opacity:contentVisible?1:0,transform:contentVisible?'translateY(0)':'translateY(16px)',
        transition:'opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)',
        paddingBottom:60}}>

        {/* Background — soft candy gradient */}
        <div style={{position:'fixed',inset:0,zIndex:0}}>
          <div style={{
            position:'absolute',inset:0,
            background: [
              `radial-gradient(circle at 15% 12%, ${PINK_XL}ee 0%, ${PINK_XL}00 45%)`,
              `radial-gradient(circle at 85% 15%, ${PINK_L}cc 0%, ${PINK_L}00 45%)`,
              `radial-gradient(circle at 12% 85%, ${CREAM}cc 0%, ${CREAM}00 45%)`,
              `radial-gradient(circle at 85% 85%, ${GOLD}66 0%, ${GOLD}00 45%)`,
              `linear-gradient(135deg,${PINK_XL} 0%,${PINK_L} 35%,${CREAM} 65%,${GOLD} 100%)`,
            ].join(', '),
          }}/>
          <div style={{
            position:'absolute',inset:0,
            backgroundImage:'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize:'48px 48px',
            opacity:0.25,
          }}/>
        </div>
        <div style={{position:'fixed',inset:0,zIndex:1,pointerEvents:'none',
          background:'radial-gradient(ellipse 80% 80% at 50% 50%,transparent 55%,rgba(123,47,190,0.08) 100%)'}}/>

        {/* Sparkles + paws fixed */}
        {sparklesContent.map((s,i)=><Sparkle key={i} x={s.x} y={s.y} color={s.c} size={s.s} delay={s.d} fixed/>)}
        <div style={{position:'fixed',inset:0,zIndex:1,pointerEvents:'none'}}><PawScatter fixed/></div>

        {/* Floating bubbles */}
        {[...Array(5)].map((_,i)=>(
          <div key={i} style={{position:'fixed',
            width:22+i*16,height:22+i*16,borderRadius:'50%',
            background:`rgba(255,255,255,${.1+i*.03})`,
            left:`${(i*17+4)%90}%`,top:`${(i*21+5)%85}%`,
            animation:`gd-float ${5+i}s ${i*.5}s ease-in-out infinite`,
            border:'1.5px solid rgba(255,255,255,.35)',backdropFilter:'blur(3px)',
            pointerEvents:'none',zIndex:0}}/>
        ))}

        <div style={{position:'relative',zIndex:2,maxWidth:440,margin:'0 auto',padding:'28px 16px 0'}}>

          {/* ── HERO CARD ── */}
          <Reveal from="fade">
            <BlockStyleProvider
              value={{
                blockId: heroBlock.id,
                textStyles: heroBlock.textStyles,
                onTextSelect: (textKey, textLabel) =>
                  onBlockSelect?.(heroBlock, -1, textKey, textLabel),
              }}
            >
              <div style={{...card,textAlign:'center',padding:'0 0 28px'}}>
                <RainbowBar/>

                {/* Rainbow scene hero */}
                <div style={{position:'relative',height:200,overflow:'hidden',borderRadius:'22px 22px 0 0'}}>
                  <img src={HERO_IMG} alt="Gabby cast" style={{width:'100%',height:'100%',
                    objectFit:'cover',objectPosition:'center 20%',filter:'brightness(1.05) saturate(1.15)'}}/>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,height:80,
                    background:'linear-gradient(to top,rgba(255,240,250,.95),transparent)'}}/>
                </div>

                <div style={{padding:'16px 24px 0'}}>
                {/* Logo */}
                <Reveal from="fade" delay={0.15}>
                  <div style={{display:'flex',justifyContent:'center',marginBottom:10}}>
                    <img src={IMG_LOGO} alt="Gabby's Dollhouse"
                      style={{width:'min(200px,55vw)',objectFit:'contain',
                        filter:`drop-shadow(0 3px 10px rgba(233,30,140,.3))`}}/>
                  </div>
                </Reveal>

                {/* Badge */}
                <Reveal from="fade" delay={0.2}>
                  <div style={{display:'inline-block',
                    background:`linear-gradient(135deg,${C.deepPink},${C.deepPurple})`,
                    color:C.white,fontFamily:F.label,
                    fontSize:9,padding:'4px 18px',borderRadius:20,
                    letterSpacing:2,marginBottom:14}}>✨ EsTI INVITAT ✨</div>
                </Reveal>

                {(editMode || profile.showWelcomeText !== false) && (
                  <Reveal from="bottom" delay={0.22}>
                    <InlineEdit
                      tag="p"
                      editMode={editMode}
                      value={texts.welcome}
                      onChange={(v) => upProfile("welcomeText", v)}
                      textLabel="Hero · welcome"
                      style={{fontFamily:F.body,fontSize:13,fontWeight:700,fontStyle:'italic',
                        color:`rgba(123,47,190,.65)`,margin:'0 0 12px',lineHeight:1.7}}
                    />
                  </Reveal>
                )}

                {/* NAMES */}
                <Reveal from="bottom" delay={0.25}>
                  {!isWedding?(
                    <InlineEdit
                      tag="h1"
                      editMode={editMode}
                      value={profile.partner1Name||'Prenume'}
                      onChange={(v) => upProfile('partner1Name', v)}
                      textLabel="Hero · nume"
                      style={{fontFamily:F.display,fontSize:'clamp(32px,8vw,50px)',
                        background:`linear-gradient(135deg,${C.deepPink},${C.deepPurple})`,
                        WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                        margin:'0 0 4px',lineHeight:1.1,
                        filter:`drop-shadow(2px 3px 0 rgba(233,30,140,.15))`}}
                    />
                  ):(
                    <div style={{margin:'0 0 4px'}}>
                      <InlineEdit
                        tag="h1"
                        editMode={editMode}
                        value={profile.partner1Name||'Prenume'}
                        onChange={(v) => upProfile('partner1Name', v)}
                        textLabel="Hero · nume 1"
                        style={{fontFamily:F.display,fontSize:'clamp(26px,7vw,40px)',
                          background:`linear-gradient(135deg,${C.deepPink},${C.deepPurple})`,
                          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                          margin:0,lineHeight:1.1}}
                      />
                      <div style={{margin:'8px 0',display:'flex',alignItems:'center',gap:12,justifyContent:'center'}}>
                        <div style={{flex:1,height:'2px',borderRadius:2,
                          background:`linear-gradient(to right,transparent,${C.hotPink})`}}/>
                        <span style={{fontFamily:F.display,fontSize:24,color:C.hotPink}}>❤️</span>
                        <div style={{flex:1,height:'2px',borderRadius:2,
                          background:`linear-gradient(to left,transparent,${C.hotPink})`}}/>
                      </div>
                      <InlineEdit
                        tag="h1"
                        editMode={editMode}
                        value={profile.partner2Name||'Prenume'}
                        onChange={(v) => upProfile('partner2Name', v)}
                        textLabel="Hero · nume 2"
                        style={{fontFamily:F.display,fontSize:'clamp(26px,7vw,40px)',
                          background:`linear-gradient(135deg,${C.deepPurple},${C.deepMint})`,
                          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                          margin:0,lineHeight:1.1}}
                      />
                    </div>
                  )}
                </Reveal>

                {(editMode || profile.showCelebrationText !== false) && (
                  <Reveal from="bottom" delay={0.3}>
                    <InlineEdit
                      tag="p"
                      editMode={editMode}
                      value={texts.celebration}
                      onChange={(v) => upProfile("celebrationText", v)}
                      textLabel="Hero · celebrare"
                      style={{fontFamily:F.display,fontSize:14,
                        color:C.deepPink,margin:'8px 0 0'}}
                    />
                  </Reveal>
                )}

                {/* DATE */}
                <Reveal from="bottom" delay={0.35}>
                  <div style={{margin:'18px 0'}}>
                    <RainbowBar thin/>
                    <div style={{display:'flex',alignItems:'center',gap:12,justifyContent:'center',
                      margin:'16px 0'}}>
                      <div style={{flex:1,height:'1.5px',borderRadius:2,
                        background:`linear-gradient(to right,transparent,${C.purple}66)`}}/>
                      <div style={{
                        width:68,height:68,borderRadius:'50%',
                        background:`linear-gradient(135deg,${C.deepPink},${C.deepPurple})`,
                        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                        boxShadow:`0 6px 22px ${C.deepPink}55,0 0 0 4px ${C.pinkLight}`,
                        animation:'gd-pulse 3s ease-in-out infinite',
                      }}>
                        <span style={{fontFamily:F.display,fontSize:26,color:C.white,lineHeight:1}}>{displayDay}</span>
                        <span style={{fontFamily:F.label,fontSize:8,color:'rgba(255,255,255,.8)',letterSpacing:1}}>{displayMonth?.slice(0,3)}</span>
                      </div>
                      <div style={{flex:1,height:'1.5px',borderRadius:2,
                        background:`linear-gradient(to left,transparent,${C.purple}66)`}}/>
                    </div>
                    <div style={{fontFamily:F.body,fontWeight:800,fontSize:12,
                      color:C.inkDark,opacity:.6,textTransform:'capitalize',marginBottom:4}}>
                      {displayWeekday} · {displayMonth} · {displayYear}
                    </div>
                    <RainbowBar thin/>
                  </div>
                </Reveal>

                {/* COUNTDOWN */}
                <Reveal from="bottom" delay={0.4}>
                  <Countdown targetDate={profile.weddingDate}/>
                </Reveal>

                {/* Heart image */}
                

                {/* Characters */}
                <Reveal from="bottom" delay={0.44}>
                  <div style={{display:'flex',justifyContent:'center',gap:14,marginBottom:16}}>
                    {[
                      {src:IMG_CUPCAKE,d:0},{src:IMG_JELLYCAT,d:.2},{src:IMG_BOXCAT,d:.4},
                    ].map((ch,i)=>(
                      <div key={i} className="gd-hover"
                        style={{animation:`gd-bounce ${1.4+i*.3}s ${ch.d}s ease-in-out infinite`}}>
                        <img src={ch.src} alt="" style={{height:64,objectFit:'contain',
                          filter:'drop-shadow(0 4px 10px rgba(0,0,0,.25))'}}/>
                      </div>
                    ))}
                  </div>
                </Reveal>

                {/* GUEST */}
                <Reveal from="bottom" delay={0.45}>
                  <div style={{padding:'14px 20px',
                    background:`linear-gradient(135deg,${C.lavender}88,${C.pinkLight}44)`,
                    border:`3px solid ${C.purple}66`,borderRadius:18,position:'relative'}}>
                    <img
                      src={IMG_PILLOWCAT}
                      alt=""
                      style={{
                        position: "absolute",
                        bottom: -18,
                        right: -6,
                        width: 74,
                        height: 74,
                        objectFit: "contain",
                        filter: "drop-shadow(0 6px 14px rgba(0,0,0,.2))",
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',fontSize:20}}>🐾</div>
                    <p style={{fontFamily:F.label,fontSize:8,letterSpacing:'.5em',
                      textTransform:'uppercase',color:C.deepPurple,margin:'0 0 6px',opacity:.7}}>
                      invitatie pentru
                    </p>
                    <p style={{fontFamily:F.display,fontSize:20,
                      color:C.deepPurple,margin:0,letterSpacing:1}}>
                      {guest?.name||'Invitatul Special'}
                    </p>
                  </div>
                </Reveal>
                </div>

                <div style={{margin:'18px 20px 0'}}><RainbowBar/></div>
              </div>
            </BlockStyleProvider>
          </Reveal>

          {/* BLOCKS */}
          <div className="space-y-0">
            {editMode && (
              <InsertBlockButton
                insertIdx={-1}
                openInsertAt={openInsertAt}
                setOpenInsertAt={setOpenInsertAt}
                BLOCK_TYPES={BLOCK_TYPES}
                onInsert={(type, def) => {
                  handleInsertAt(-1, type, def);
                }}
              />
            )}
            {blocks
              .filter((b) => editMode || b.show !== false)
              .map((block, idx) => (
                <div key={block.id} className="group/insert">
                  <div
                    className={`relative group/block ${block.type === "divider" ? "" : "py-5"}`}
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
                    }}
                  >
                    <BlockStyleProvider
                      value={
                        block.type === "timeline"
                          ? ({
                              blockId: "__timeline__",
                              textStyles: (profile as any).timelineTextStyles,
                              onTextSelect: (textKey, textLabel) =>
                                onBlockSelect?.(
                                  {
                                    id: "__timeline__",
                                    type: "timeline",
                                    textStyles: (profile as any).timelineTextStyles,
                                  } as any,
                                  idx,
                                  textKey,
                                  textLabel
                                ),
                            } as BlockStyle)
                          : ({
                              blockId: block.id,
                              textStyles: block.textStyles,
                              onTextSelect: (textKey, textLabel) =>
                                onBlockSelect?.(block, idx, textKey, textLabel),
                              fontFamily: block.blockFontFamily,
                              fontSize: block.blockFontSize,
                              fontWeight: block.blockFontWeight,
                              fontStyle: block.blockFontStyle,
                              letterSpacing: block.blockLetterSpacing,
                              lineHeight: block.blockLineHeight,
                              textColor:
                                block.textColor && block.textColor !== "transparent"
                                  ? block.textColor
                                  : undefined,
                              textAlign: block.blockAlign,
                            } as BlockStyle)
                      }
                    >
                      {editMode && (
                        <BlockToolbar
                          onUp={() => movBlock(idx, -1)}
                          onDown={() => movBlock(idx, 1)}
                          onToggle={() => updBlock(idx, { show: block.show === false })}
                          onDelete={() => delBlock(idx)}
                          visible={block.show !== false}
                          isFirst={idx === 0}
                          isLast={idx === blocks.length - 1}
                        />
                      )}
                      {editMode && block.show === false && (
                        <div
                          className="absolute inset-0 z-10 flex items-center justify-center p-4"
                          aria-hidden="false"
                          style={{ pointerEvents: "auto" }}
                        >
                          <div
                            className="absolute inset-0 rounded-lg"
                            style={{
                              background: "rgba(0,0,0,0.1)",
                              backdropFilter: "blur(3px)",
                            }}
                          />
                          <div
                            className="relative z-10 flex flex-col items-center gap-3"
                            style={{
                              borderRadius: 14,
                              boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                              minWidth: 260,
                              textAlign: "center",
                            }}
                          >
                            <EyeOff size={22} color={C.deepPurple} />
                          </div>
                        </div>
                      )}

                      {block.type === "photo" && (
                        <Reveal>
                          <div
                            onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}
                            style={
                              editMode
                                ? {
                                    cursor: "pointer",
                                    outline:
                                      selectedBlockId === block.id
                                        ? `2px solid ${C.deepPurple}`
                                        : "none",
                                    outlineOffset: 4,
                                    borderRadius: 16,
                                  }
                                : undefined
                            }
                          >
                            <PhotoBlock
                              imageData={block.imageData}
                              altText={block.altText}
                              editMode={editMode}
                              onUpload={(url) => updBlock(idx, { imageData: url })}
                              onRemove={() => updBlock(idx, { imageData: undefined })}
                              onRatioChange={(r) => updBlock(idx, { aspectRatio: r })}
                              onClipChange={(c) => updBlock(idx, { photoClip: c })}
                              onMasksChange={(m) => updBlock(idx, { photoMasks: m } as any)}
                              aspectRatio={block.aspectRatio as any}
                              photoClip={block.photoClip as any}
                              photoMasks={block.photoMasks as any}
                              placeholderInitial1={l1}
                            />
                          </div>
                        </Reveal>
                      )}
                      {block.type === "text" && (
                        <Reveal>
                          <div style={{ textAlign: "center", padding: "0 12px" }}>
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(idx, { content: v })}
                              textLabel="Text"
                              style={{
                                fontFamily: F.body,
                                fontSize: 14,
                                color: C.inkDark,
                                lineHeight: 1.7,
                              }}
                            />
                          </div>
                        </Reveal>
                      )}
                      {block.type === "location" && (
                        <Reveal>
                          <LocCard
                            block={block}
                            editMode={editMode}
                            onUpdate={(p) => updBlock(idx, p)}
                            stickerSrc={locationStickers[idx % locationStickers.length]}
                          />
                        </Reveal>
                      )}
                      {block.type === "calendar" && (
                        <Reveal>
                          <div style={{ position: "relative" }}>
                            <img
                              src={IMG_PANDY}
                              alt=""
                              style={{
                                position: "absolute",
                                top: -18,
                                left: -8,
                                width: 72,
                                height: 72,
                                objectFit: "contain",
                                filter: "drop-shadow(0 6px 12px rgba(0,0,0,.18))",
                                pointerEvents: "none",
                                zIndex: 2,
                              }}
                            />
                            <CalendarMonth date={profile.weddingDate} />
                          </div>
                        </Reveal>
                      )}
                      {block.type === "countdown" && (
                        <div style={{ position: "relative" }}>
                          <img
                            src={IMG_CARLITA}
                            alt=""
                            style={{
                              position: "absolute",
                              top: -18,
                              right: -8,
                              width: 70,
                              height: 70,
                              objectFit: "contain",
                              filter: "drop-shadow(0 6px 12px rgba(0,0,0,.18))",
                              pointerEvents: "none",
                              zIndex: 2,
                            }}
                          />
                          <FlipClock
                            targetDate={profile.weddingDate}
                            bgColor={C.deepPurple}
                            textColor="white"
                            accentColor={C.pinkLight}
                            labelColor="rgba(255,255,255,0.8)"
                            editMode={editMode}
                            titleText={block.countdownTitle || "Timp ramas pana la Marele Eveniment"}
                            onTitleChange={(text) => updBlock(idx, { countdownTitle: text })}
                          />
                        </div>
                      )}

                      {block.type === "timeline" &&
                        (() => {
                          const timelineItems = getTimelineItems();
                          if (!editMode && timelineItems.length === 0) return null;
                          return (
                            <Reveal style={editMode ? { position: "relative", zIndex: 200 } : undefined}>
                              <div
                                style={{
                                  background: "white",
                                  border: `1px solid ${PINK_L}`,
                                  borderRadius: 16,
                                  padding: "20px 24px",
                                  position: "relative",
                                }}
                              >
                                <img
                                  src={IMG_DJCATNIP}
                                  alt=""
                                  style={{
                                    position: "absolute",
                                    top: -18,
                                    right: -8,
                                    width: 70,
                                    height: 70,
                                    objectFit: "contain",
                                    filter: "drop-shadow(0 6px 12px rgba(0,0,0,.18))",
                                    pointerEvents: "none",
                                  }}
                                />
                                <p
                                  style={{
                                    fontFamily: F.label,
                                    fontSize: 8,
                                    fontWeight: 700,
                                    letterSpacing: "0.42em",
                                    textTransform: "uppercase",
                                    color: PINK_DARK,
                                    textAlign: "center",
                                    margin: "0 0 16px",
                                  }}
                                >
                                  Programul Zilei
                                </p>
                                {timelineItems.length === 0 && editMode && (
                                  <p
                                    style={{
                                      fontFamily: F.body,
                                      fontSize: 12,
                                      fontStyle: "italic",
                                      color: MUTED,
                                      textAlign: "center",
                                      margin: "0 0 8px",
                                    }}
                                  >
                                    Adauga primul moment al zilei.
                                  </p>
                                )}
                                {timelineItems.map((item: any, i: number) => (
                                  <div
                                    key={item.id}
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "58px 44px 1fr",
                                      alignItems: "stretch",
                                      minHeight: 64,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "center",
                                        paddingTop: 10,
                                      }}
                                    >
                                      <InlineTime
                                        editMode={editMode}
                                        value={item.time || ""}
                                        onChange={(v) =>
                                          updateTimelineItem(item.id, { time: v })
                                        }
                                        textKey={`timeline:${item.id}:time`}
                                        textLabel={`Ora ${i + 1}`}
                                        style={{
                                          fontFamily: F.body,
                                          fontSize: 15,
                                          fontWeight: 700,
                                          color: PINK_DARK,
                                          lineHeight: 1.2,
                                          textAlign: "center",
                                          width: "100%",
                                        }}
                                      />
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: 38,
                                          height: 38,
                                          borderRadius: "50%",
                                          background: PINK_XL,
                                          border: `1.5px solid ${PINK_L}`,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          flexShrink: 0,
                                        }}
                                      >
                                        <WeddingIcon
                                          iconKey={item.icon || "party"}
                                          size={20}
                                          color={PINK_DARK}
                                        />
                                      </div>
                                      {i < timelineItems.length - 1 && (
                                        <div
                                          style={{
                                            flex: 1,
                                            width: 1,
                                            background: `linear-gradient(to bottom, ${PINK_L}, transparent)`,
                                            marginTop: 4,
                                          }}
                                        />
                                      )}
                                    </div>
                                    <div
                                      style={{
                                        paddingLeft: 12,
                                        paddingTop: 10,
                                        paddingBottom:
                                          i < timelineItems.length - 1 ? 20 : 0,
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                        }}
                                      >
                                        <InlineEdit
                                          tag="span"
                                          editMode={editMode}
                                          value={item.title || ""}
                                          onChange={(v) =>
                                            updateTimelineItem(item.id, { title: v })
                                          }
                                          placeholder="Moment..."
                                          textKey={`timeline:${item.id}:title`}
                                          textLabel={`Titlu ${i + 1}`}
                                          style={{
                                            fontFamily: F.body,
                                            fontSize: 15,
                                            fontWeight: 700,
                                            color: TEXT,
                                            display: "block",
                                            lineHeight: 1.3,
                                          }}
                                        />
                                        {editMode && (
                                          <button
                                            type="button"
                                            onClick={() => removeTimelineItem(item.id)}
                                            style={{
                                              background: "none",
                                              border: "none",
                                              cursor: "pointer",
                                              color: MUTED,
                                              fontSize: 14,
                                              padding: "0 4px",
                                              opacity: 0.5,
                                              lineHeight: 1,
                                            }}
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                      {(editMode || item.notice) && (
                                        <InlineEdit
                                          tag="span"
                                          editMode={editMode}
                                          value={item.notice || ""}
                                          onChange={(v) =>
                                            updateTimelineItem(item.id, { notice: v })
                                          }
                                          placeholder="Nota..."
                                          textKey={`timeline:${item.id}:notice`}
                                          textLabel={`Nota ${i + 1}`}
                                          style={{
                                            fontFamily: F.body,
                                            fontSize: 13,
                                            fontStyle: "italic",
                                            color: MUTED,
                                            display: "block",
                                            marginTop: 4,
                                            lineHeight: 1.5,
                                          }}
                                        />
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <TimelineInsertButton
                                  editMode={editMode}
                                  colors={{
                                    dark: PINK_DARK,
                                    light: PINK_L,
                                    xl: PINK_XL,
                                    muted: MUTED,
                                  }}
                                  onAdd={(preset) => addTimelineItem(preset)}
                                />
                              </div>
                            </Reveal>
                          );
                        })()}
                      {block.type === "music" && (
                        <Reveal>
                          <MusicBlock block={block} editMode={editMode} onUpdate={(p) => updBlock(idx, p)} imperativeRef={musicPlayRef} />
                        </Reveal>
                      )}
                      {block.type === "gift" && (
                        <Reveal>
                          <div style={{background:`linear-gradient(135deg,${C.deepPink},${C.deepPurple})`,
                            borderRadius:18,padding:24,textAlign:'center',color:'white',position:'relative',
                            boxShadow:`0 10px 28px ${C.deepPink}66`}}>
                            <img
                              src={IMG_MARTY}
                              alt=""
                              style={{
                                position: "absolute",
                                top: -18,
                                right: -6,
                                width: 78,
                                height: 78,
                                objectFit: "contain",
                                filter: "drop-shadow(0 6px 14px rgba(0,0,0,.22))",
                                pointerEvents: "none",
                              }}
                            />
                            <Gift className="w-8 h-8 mx-auto mb-4 opacity-80" />
                            <InlineEdit
                              tag="h3"
                              editMode={editMode}
                              value={block.sectionTitle || "Sugestie de cadou"}
                              onChange={(v) => updBlock(idx, { sectionTitle: v })}
                              textLabel="Cadou · titlu"
                              style={{fontFamily:F.display,fontSize:20,marginBottom:8}}
                            />
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(idx, { content: v })}
                              multiline
                              textLabel="Cadou · text"
                              style={{fontFamily:F.body,fontSize:12,opacity:0.9,lineHeight:1.6}}
                            />
                            {(block.iban || editMode) && (
                              <div style={{marginTop:12,padding:'8px 10px',background:'rgba(255,255,255,.15)',borderRadius:10}}>
                                <InlineEdit
                                  tag="p"
                                  editMode={editMode}
                                  value={block.iban || ""}
                                  onChange={(v) => updBlock(idx, { iban: v })}
                                  placeholder="IBAN..."
                                  textLabel="Cadou · IBAN"
                                  style={{fontFamily:F.body,fontSize:10,fontWeight:700}}
                                />
                              </div>
                            )}
                          </div>
                        </Reveal>
                      )}
                      {block.type === "whatsapp" && (
                        <Reveal>
                          <div className="flex flex-col items-center gap-4">
                            <img
                              src={IMG_BABYBOX}
                              alt=""
                              style={{
                                width: 86,
                                height: 86,
                                objectFit: "contain",
                                filter: "drop-shadow(0 6px 14px rgba(0,0,0,.2))",
                              }}
                            />
                            <a
                              href={`https://wa.me/${(block.content || "").replace(/\\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/wa flex items-center gap-4 px-8 py-4 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border"
                              style={{borderColor:`${C.purple}55`}}
                            >
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover/wa:scale-110 transition-transform"
                                style={{background:`linear-gradient(135deg,${C.deepMint},${C.mint})`,boxShadow:`0 8px 22px ${C.mint}55`}}>
                                <MessageCircle className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <InlineEdit
                                  tag="p"
                                  editMode={editMode}
                                  value={block.label || "Contact WhatsApp"}
                                  onChange={(v) => updBlock(idx, { label: v })}
                                  textLabel="WhatsApp · label"
                                  style={{fontWeight:800,fontSize:13,color:C.inkDark,margin:0}}
                                />
                                <p style={{fontFamily:F.body,fontSize:10,color:`${C.deepPurple}99`,margin:0}}>
                                  Raspundem rapid
                                </p>
                              </div>
                            </a>
                            {editMode && (
                              <div style={{display:"flex",alignItems:"center",gap:8,background:"white",
                                border:`1px solid ${C.purple}55`,borderRadius:12,padding:"8px 16px",
                                boxShadow:"0 4px 12px rgba(0,0,0,0.03)"}}>
                                <span style={{fontFamily:F.label,fontSize:"0.6rem",fontWeight:800,letterSpacing:"0.1em",
                                  textTransform:"uppercase",color:`${C.deepPurple}99`}}>
                                  Numar:
                                </span>
                                <InlineEdit
                                  tag="span"
                                  editMode={editMode}
                                  value={block.content || "0700000000"}
                                  onChange={(v) => updBlock(idx, { content: v })}
                                  textLabel="WhatsApp · numar"
                                  style={{fontFamily:F.body,fontSize:"0.9rem",color:C.inkDark,fontWeight:700}}
                                />
                              </div>
                            )}
                          </div>
                        </Reveal>
                      )}

                      {block.type === "rsvp" && (
                        <Reveal>
                          <div style={{marginTop:6}}>
                            <div style={{display:'flex',justifyContent:'center',marginBottom:10}}>
                              <img
                                src={IMG_CATRAT}
                                alt=""
                                style={{
                                  width: 80,
                                  height: 80,
                                  objectFit: "contain",
                                  filter: "drop-shadow(0 6px 14px rgba(0,0,0,.2))",
                                }}
                              />
                            </div>
                            <button
                              onClick={() => { if (!editMode) onOpenRSVP?.(); }}
                              style={{width:'100%',padding:'20px',
                                background:`linear-gradient(135deg,${C.deepPink},${C.deepPurple})`,
                                border:'none',borderRadius:50,cursor:'pointer',
                                fontFamily:F.display,fontSize:16,
                                color:C.white,letterSpacing:.5,
                                boxShadow:`0 8px 28px ${C.deepPink}66,0 0 0 4px ${C.pinkLight}`,
                                animation:'gd-pulse 2.5s ease-in-out infinite',
                                transition:'all .25s',position:'relative',overflow:'hidden'}}
                              onMouseEnter={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.transform='scale(1.04)';b.style.boxShadow=`0 12px 36px ${C.deepPink}88,0 0 0 6px ${C.pinkLight}`;}}
                              onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.transform='scale(1)';b.style.boxShadow=`0 8px 28px ${C.deepPink}66,0 0 0 4px ${C.pinkLight}`;}}
                            >
                              <div style={{position:'absolute',inset:0,
                                background:'linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)',
                                backgroundSize:'200% 100%',animation:'gd-shimmer 2s linear infinite',borderRadius:50}}/>
                              <span style={{position:'relative'}}>
                                <InlineEdit
                                  tag="span"
                                  editMode={editMode}
                                  value={block.label || "Confirma Prezenta"}
                                  onChange={(v) => updBlock(idx, { label: v })}
                                  textLabel="RSVP · text"
                                />
                              </span>
                            </button>
                          </div>
                        </Reveal>
                      )}
                      {block.type === "divider" && (
                        <Reveal>
                          <RainbowBar />
                        </Reveal>
                      )}
                      {block.type === "date" && (
                        <Reveal>
                          <div style={{ textAlign: "center", padding: "4px 0" }}>
                            <p style={{
                              fontFamily: F.label,
                              fontWeight: 700,
                              letterSpacing: "0.3em",
                              fontSize: "0.85rem",
                              color: C.deepPurple,
                              margin: 0,
                            }}>
                              {profile.weddingDate
                                ? new Date(profile.weddingDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
                                : 'Data Evenimentului'}
                            </p>
                          </div>
                        </Reveal>
                      )}
                      {block.type === "description" && (
                        <Reveal>
                          <div style={{ textAlign: "center", padding: "0 16px" }}>
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(idx, { content: v })}
                              textLabel="Descriere"
                              style={{
                                fontFamily: F.body,
                                fontSize: "0.9rem",
                                color: `${C.deepPurple}99`,
                                lineHeight: 1.7,
                                margin: 0,
                              }}
                            />
                          </div>
                        </Reveal>
                      )}
                      {block.type === "family" && (
                        <Reveal>
                          {(() => {
                            const members: { name1: string; name2: string }[] =
                              (() => {
                                try {
                                  return JSON.parse(block.members || "[]");
                                } catch {
                                  return [];
                                }
                              })();
                            const updateMembers = (
                              newMembers: { name1: string; name2: string }[],
                            ) => {
                              updBlock(idx, {
                                members: JSON.stringify(newMembers),
                              } as any);
                            };
                            return (
                              <div style={{...card,textAlign:'center'}}>
                                <RainbowBar />
                                <div style={{ marginTop: 14 }}>
                                  <InlineEdit
                                    tag="p"
                                    editMode={editMode}
                                    value={block.label || "Parintii copilului"}
                                    onChange={(v) => updBlock(idx, { label: v })}
                                    textLabel="Familie · titlu"
                                    style={{
                                      fontFamily: F.label,
                                      fontSize: "0.55rem",
                                      fontWeight: 700,
                                      letterSpacing: "0.35em",
                                      textTransform: "uppercase",
                                      color: `${C.deepPurple}99`,
                                      margin: "0 0 8px",
                                    }}
                                  />
                                  <InlineEdit
                                    tag="p"
                                    editMode={editMode}
                                    value={block.content || "Cu drag si recunostinta"}
                                    onChange={(v) => updBlock(idx, { content: v })}
                                    textLabel="Familie · text"
                                    style={{
                                      fontFamily: F.body,
                                      fontStyle: "italic",
                                      fontSize: "0.9rem",
                                      color: `${C.deepPurple}99`,
                                      margin: 0,
                                      lineHeight: 1.6,
                                    }}
                                  />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                                  {members.map((m, mi) => (
                                    <div key={mi} style={{ position: "relative" }}>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                                        <InlineEdit
                                          tag="span"
                                          editMode={editMode}
                                          value={m.name1}
                                          onChange={(v) => {
                                            const nm = [...members];
                                            nm[mi] = { ...nm[mi], name1: v };
                                            updateMembers(nm);
                                          }}
                                          textLabel={`Familie · nume ${mi + 1}A`}
                                          style={{ fontFamily: F.display, fontSize: "1.4rem", color: C.deepPurple }}
                                        />
                                        <span style={{ fontFamily: F.display, color: C.hotPink, fontSize: "1.3rem" }}>&amp;</span>
                                        <InlineEdit
                                          tag="span"
                                          editMode={editMode}
                                          value={m.name2}
                                          onChange={(v) => {
                                            const nm = [...members];
                                            nm[mi] = { ...nm[mi], name2: v };
                                            updateMembers(nm);
                                          }}
                                          textLabel={`Familie · nume ${mi + 1}B`}
                                          style={{ fontFamily: F.display, fontSize: "1.4rem", color: C.deepPurple }}
                                        />
                                        {editMode && members.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => updateMembers(members.filter((_, i) => i !== mi))}
                                            style={{
                                              background: "none",
                                              border: "none",
                                              cursor: "pointer",
                                              color: `${C.deepPurple}99`,
                                              fontSize: 14,
                                              padding: "0 4px",
                                              opacity: 0.7,
                                              lineHeight: 1,
                                            }}
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                      {mi < members.length - 1 && (
                                        <div
                                          style={{
                                            height: 1,
                                            background: `linear-gradient(to right, transparent, ${C.pinkLight}88, transparent)`,
                                            margin: "8px 32px 0",
                                          }}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                                {editMode && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateMembers([
                                        ...members,
                                        { name1: "Nume 1", name2: "Nume 2" },
                                      ])
                                    }
                                    style={{
                                      marginTop: 16,
                                      background: C.pinkLight,
                                      border: `1px dashed ${C.purple}`,
                                      borderRadius: 99,
                                      padding: "5px 16px",
                                      cursor: "pointer",
                                      fontFamily: F.label,
                                      fontSize: "0.6rem",
                                      fontWeight: 700,
                                      letterSpacing: "0.2em",
                                      textTransform: "uppercase",
                                      color: C.deepPurple,
                                    }}
                                  >
                                    + Adauga
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </Reveal>
                      )}
                    </BlockStyleProvider>
                  </div>
                  {editMode && (
                    <InsertBlockButton
                      insertIdx={idx}
                      openInsertAt={openInsertAt}
                      setOpenInsertAt={setOpenInsertAt}
                      BLOCK_TYPES={BLOCK_TYPES}
                      onInsert={(type, def) => {
                        handleInsertAt(idx, type, def);
                      }}
                    />
                  )}
                </div>
              ))}
          </div>

          {/* FOOTER */}
          <Reveal from="fade" delay={0.1}>
            <div style={{marginTop:24,textAlign:'center'}}>
              <RainbowBar/>
              <div style={{display:'flex',justifyContent:'center',alignItems:'flex-end',
                gap:16,margin:'16px 0 12px'}}>
                <div style={{animation:'gd-float 3.5s ease-in-out infinite'}}>
                  <img src={IMG_CUPCAKE} alt="" style={{height:58,objectFit:'contain',
                    filter:'drop-shadow(0 4px 10px rgba(255,105,180,.4))'}}/>
                </div>
                <div style={{animation:'gd-heartBeat 2.5s ease-in-out infinite',marginBottom:8}}>
                  <img src={IMG_LOGO} alt="Gabby's Dollhouse"
                    style={{width:100,objectFit:'contain',filter:`drop-shadow(0 2px 8px rgba(233,30,140,.3))`}}/>
                </div>
                <div style={{animation:'gd-floatR 4s ease-in-out infinite'}}>
                  <img src={IMG_JELLYCAT} alt="" style={{height:58,objectFit:'contain',
                    filter:'drop-shadow(0 4px 10px rgba(199,125,255,.4))'}}/>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'center',gap:10,marginBottom:8}}>
                {['🐱','🌈','⭐','🎀','🏠','💖','🎂','🐾','✨'].map((e,i)=>(
                  <span key={i} style={{fontSize:15,
                    animation:`gd-twinkle ${1.5+i*.2}s ${i*.15}s ease-in-out infinite`,display:'inline-block'}}>{e}</span>
                ))}
              </div>
              <p style={{fontFamily:F.display,fontSize:10,color:C.deepPurple,opacity:.5,margin:0}}>
                Gabby's Dollhouse · {displayYear}
              </p>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
};

export default GabbysDollhouseTemplate;

