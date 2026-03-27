import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import { BlockStyleProvider } from "../BlockStyleContext";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { getZootropolisTheme } from "./castleDefaults";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload, Camera,
  Play, Pause, SkipForward, SkipBack, Gift, Music, MessageCircle, MapPin,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// META
// ─────────────────────────────────────────────────────────────────────────────
export const meta: TemplateMeta = {
  id: 'zootropolis',
  name: 'Zootropolis',
  category: 'kids',
  description: 'Metropola animală — urban colorat, personaje pline de viață, energie de poveste Disney!',
  colors: ['#ff7b2e', '#7c3aed', '#fbbf24', '#f0f4ff'],
  previewClass: "bg-violet-50 border-orange-400",
  elementsClass: "bg-orange-400",
};

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────
const API_URL =
  (typeof window !== "undefined" && (window as any).__API_URL__) ||
  (import.meta as any)?.env?.VITE_API_URL ||
  "http://localhost:3005/api";

function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith('/uploads/')) return;
  const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  fetch(`${API_URL}/upload`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_s?.token || ''}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COLORS & FONTS — exact from reference
// ─────────────────────────────────────────────────────────────────────────────
let C = {
  city      : "#0D1B2A",
  cityMid   : "#1B2838",
  steel     : "#2B4162",
  steelLight: "#4361EE",
  orange    : "#E85D04",
  orangeLight: "#F4A261",
  orangePale: "#FFBA49",
  sky       : "#90E0EF",
  skyDeep   : "#48CAE4",
  white     : "#FFFFFF",
};

const F = {
  display: "'Montserrat','Arial Black',sans-serif",
  body   : "'Nunito','Quicksand',sans-serif",
  label  : "'Montserrat','Arial',sans-serif",
  badge  : "'Bebas Neue','Impact','Arial Black',sans-serif",
} as const;

// Card style — computed from theme C at render time
const getSectionStyle = (): React.CSSProperties => ({
  background: `linear-gradient(135deg,${hexToRgba(C.cityMid,.85)},${hexToRgba(C.city,.9)})`,
  border: `1.5px solid ${hexToRgba(C.steelLight,.22)}`,
  borderRadius: 18,
  backdropFilter: "blur(10px)",
  padding: "22px 22px",
  position: "relative",
  overflow: "hidden",
  boxShadow: `0 8px 32px rgba(0,0,0,.5)`,
});
const scanlines: React.CSSProperties = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 4px)",
};

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE PATHS — /public/zootropolis/
// ─────────────────────────────────────────────────────────────────────────────
const IMG_LOGO    = "/zootropolis/logo.png";     // Zootropolis logo
const IMG_NICK    = "/zootropolis/nick.png";     // Nick Wilde — vulpea
const IMG_JUDY    = "/zootropolis/judy.png";     // Judy Hopps — iepurașa
const IMG_BG      = "/zootropolis/bg.png";       // Fundal oraș (pentru uși)
const IMG_BADGE   = "/zootropolis/badge.png";    // Insigna ZPD
const IMG_PAW     = "/zootropolis/paw.png";      // Amprentă lăbuță
const IMG_STARS   = "/zootropolis/stars.png";    // Stele decorative
const IMG_FLOWER  = "/zootropolis/flower.png";   // Floare decorativă
const IMG_CITY1   = "/zootropolis/city1.png";    // Clădire stânga
const IMG_CITY2   = "/zootropolis/city2.png";    // Clădire dreapta
const IMG_CARROT  = "/zootropolis/carrot.png";   // Morcov (Judy)
const IMG_CLOUD   = "/zootropolis/cloud.png";    // Nor decorativ
const IMG_SCENE   = "/zootropolis/scene.png";    // City scene banner
const IMG_DUO     = "/zootropolis/duo.png";      // Nick & Judy duo

// ─────────────────────────────────────────────────────────────────────────────
// CSS — reference keyframes + door extras
// ─────────────────────────────────────────────────────────────────────────────
const ZT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Nunito:wght@400;600;700;800;900&family=Bebas+Neue&display=swap');
  @keyframes zt-float   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)} }
  @keyframes zt-bob     { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
  @keyframes zt-pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(232,93,4,.5)}50%{box-shadow:0 0 0 14px rgba(232,93,4,0)} }
  @keyframes zt-spin    { 0%{transform:rotate(-360deg) scale(0);opacity:0}70%{transform:rotate(10deg) scale(1.1);opacity:1}100%{transform:rotate(0) scale(1);opacity:1} }
  @keyframes zt-shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }
  @keyframes zt-twinkle { 0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)} }
  @keyframes zt-sirens  { 0%,100%{background:rgba(67,97,238,.08)}50%{background:rgba(232,93,4,.08)} }
  @keyframes zt-ticker  { 0%{transform:translateX(100%)}100%{transform:translateX(-200%)} }
  @keyframes zt-badgeGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(232,93,4,.4))}50%{filter:drop-shadow(0 0 18px rgba(232,93,4,.9))drop-shadow(0 0 32px rgba(244,162,97,.4))}}
  @keyframes zt-slideUp { 0%{transform:translateY(36px);opacity:0}100%{transform:translateY(0);opacity:1} }
  @keyframes zt-barAnim { 0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)} }
  @keyframes seam-pulse { 0%,100%{opacity:.88}50%{opacity:1} }
  @keyframes seam-halo  { 0%,100%{opacity:.65}50%{opacity:.95} }
  @keyframes dh-down    { 0%{opacity:0;transform:translateY(-2px)}50%{opacity:1;transform:translateY(2px)}100%{opacity:0;transform:translateY(6px)} }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(threshold = 0.1): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties; from?: string }> = ({ children, delay = 0, style }) => {
  const [ref, vis] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)', transition: `opacity .6s ${delay}s cubic-bezier(.22,1,.36,1), transform .6s ${delay}s cubic-bezier(.22,1,.36,1)`, ...style }}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DISTRICT COLORS — palette per photo/card slot
// ─────────────────────────────────────────────────────────────────────────────
const DISTRICT_COLORS: { from: string; to: string }[] = [
  { from: '#ff7b2e', to: '#fbbf24' },
  { from: '#7c3aed', to: '#a78bfa' },
  { from: '#0d9488', to: '#ccfbf1' },
  { from: '#ec4899', to: '#fce7f3' },
  { from: '#4361EE', to: '#90E0EF' },
];

// ─────────────────────────────────────────────────────────────────────────────
// DISTRICT CARD — styled card wrapper
// ─────────────────────────────────────────────────────────────────────────────
const DistrictCard: React.FC<{ children: React.ReactNode; colorIdx?: number }> = ({ children, colorIdx = 0 }) => {
  const c = DISTRICT_COLORS[colorIdx % DISTRICT_COLORS.length];
  return (
    <div style={{ ...getSectionStyle(), borderTop: `3px solid ${c.from}` }}>
      <div style={scanlines}/>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MUTABLE PALETTE — reset at component mount
// ─────────────────────────────────────────────────────────────────────────────
let Z: Record<string, string> = {};

// ─────────────────────────────────────────────────────────────────────────────
// CITY DOOR SEAM — colorful rainbow burst (vs. amber in Jurassic)
// ─────────────────────────────────────────────────────────────────────────────
const CityDoorSeam: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <div style={{ position: 'absolute', top: 0, right: side === 'left' ? '0px' : 'auto', left: side === 'right' ? '-2px' : 'auto', width: 2, height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: 20 }}>
    {/* Core line — white with orange glow */}
    <div style={{
      position: 'absolute', top: 0,
      left: side === 'left' ? '100%' : 0,
      width: 3, height: '100%',
      background: `linear-gradient(to bottom, transparent 0%, #ffffff 6%, #ffffff 94%, transparent 100%)`,
      boxShadow: `0 0 8px 4px rgba(255,255,255,.95), 0 0 20px 10px rgba(255,123,46,.8), 0 0 50px 22px rgba(124,58,237,.5), 0 0 100px 40px rgba(251,191,36,.3)`,
      animation: 'seam-pulse 2.8s ease-in-out infinite',
    }}/>
    {/* Inner halo */}
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 220, height: '100%',
      transform: side === 'left' ? 'translateX(-100%)' : 'translateX(0%)',
      background: side === 'left'
        ? `linear-gradient(to left, #ffffff 0%, rgba(255,123,46,.7) 3%, rgba(124,58,237,.3) 12%, transparent 100%)`
        : `linear-gradient(to right, #ffffff 0%, rgba(255,123,46,.7) 3%, rgba(124,58,237,.3) 12%, transparent 100%)`,
      filter: 'blur(10px)', animation: 'seam-halo 2.8s ease-in-out infinite', pointerEvents: 'none',
    }}/>
    {/* Outer diffuse */}
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 400, height: '100%',
      transform: side === 'left' ? 'translateX(-100%)' : 'translateX(0%)',
      background: side === 'left'
        ? `linear-gradient(to left, rgba(255,123,46,.3) 0%, rgba(251,191,36,.12) 20%, transparent 100%)`
        : `linear-gradient(to right, rgba(255,123,46,.3) 0%, rgba(251,191,36,.12) 20%, transparent 100%)`,
      filter: 'blur(30px)', animation: 'seam-halo 2.8s ease-in-out infinite', pointerEvents: 'none',
    }}/>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DOOR HINT
// ─────────────────────────────────────────────────────────────────────────────
const DoorHint: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
    <span style={{ fontFamily: F.badge, fontSize: 9, fontWeight: 800, letterSpacing: '.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,.9)' }}>Scroll down</span>
    <span style={{ fontSize: 14, color: 'rgba(255,255,255,.9)', animation: 'dh-down 1.6s ease-in-out infinite' }}>↓</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ZOOTROPOLIS OVERLAY TEXT
// ─────────────────────────────────────────────────────────────────────────────
const ZootropolisOverlayText: React.FC<{
  childName: string; subtitle: string; isWedding?: boolean; partner2Name?: string;
  editMode?: boolean;
  overlayRef?: React.RefObject<HTMLDivElement>;
  nameRef?: React.RefObject<HTMLDivElement>;
  inviteRef?: React.RefObject<HTMLDivElement>;
  onChildNameChange?: (v: string) => void;
  onSubtitleChange?: (v: string) => void;
  inviteTop?: string; inviteMiddle?: string; inviteBottom?: string; inviteTag?: string; dateStr?: string;
  onInviteTopChange?: (v: string) => void;
  onInviteMiddleChange?: (v: string) => void;
  onInviteBottomChange?: (v: string) => void;
  onInviteTagChange?: (v: string) => void;
  previewMode?: 'doors' | 'static';
}> = ({ childName, subtitle, isWedding, partner2Name, editMode, overlayRef, nameRef, inviteRef,
        onChildNameChange, onSubtitleChange, inviteTop, inviteMiddle, inviteBottom, inviteTag, dateStr,
        onInviteTopChange, onInviteMiddleChange, onInviteBottomChange, onInviteTagChange, previewMode }) => {
  const S = '0 2px 12px rgba(0,0,0,.9), 0 4px 28px rgba(0,0,0,.7)';
  const isStatic = previewMode === 'static';

  const nameTop       = isStatic ? '35%' : (editMode ? '15%' : '50%');
  const nameTransform = isStatic ? 'translateY(-50%)' : (editMode ? 'none' : 'translateY(-50%)');
  const nameOpacity   = isStatic ? 1 : (editMode ? 0.45 : 1);
  const inviteTopPos  = isStatic ? '75%' : (editMode ? '52%' : '50%');
  const inviteTransform = isStatic ? 'translateY(-50%)' : (editMode ? 'translateY(-50%)' : 'translateY(-50%) scale(.88)');
  const inviteOpacity = isStatic ? 1 : (editMode ? 1 : 0);

  return (
    <div ref={overlayRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15, pointerEvents: editMode ? 'auto' : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,.08) 0%, transparent 100%)' }}/>

      {/* Logo top center */}
      <div style={{ position: 'absolute', top: '5%', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
        <img src={IMG_LOGO} alt="Zootropolis" style={{ width: 'min(200px,52vw)', objectFit: 'contain', display: 'block', margin: '0 auto', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.9)) brightness(0) invert(1)' }}/>
      </div>

      {/* Phase 1 — name */}
      <div style={{ position: 'absolute', top: nameTop, left: 0, right: 0, transform: nameTransform, textAlign: 'center', zIndex: 1, padding: '0 28px', opacity: nameOpacity }}>
        <div ref={nameRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
          {isWedding ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25em' }}>
              <InlineEdit tag="span" editMode={!!editMode} value={childName} onChange={v => onChildNameChange?.(v)}
                style={{ fontFamily: F.display, fontSize: 'clamp(36px,9vw,64px)', fontWeight: 900, color: '#ffffff', textShadow: S, lineHeight: 1 }}/>
              <span style={{ fontFamily: F.badge, fontStyle: 'italic', fontSize: 'clamp(22px,5vw,36px)', color: C.orangePale, textShadow: S }}>&amp;</span>
              <span style={{ fontFamily: F.display, fontSize: 'clamp(36px,9vw,64px)', fontWeight: 900, color: '#ffffff', textShadow: S, lineHeight: 1 }}>{partner2Name}</span>
            </div>
          ) : (
            <InlineEdit tag="h2" editMode={!!editMode} value={childName} onChange={v => onChildNameChange?.(v)}
              style={{ fontFamily: F.display, fontSize: 'clamp(40px,10vw,72px)', fontWeight: 900, lineHeight: 1.1, color: '#ffffff', textShadow: S, margin: '2px auto 0', maxWidth: '100%', overflowWrap: 'anywhere', wordBreak: 'break-word' }}/>
          )}
          <InlineEdit tag="p" editMode={!!editMode} value={subtitle} onChange={v => onSubtitleChange?.(v)}
            style={{ fontFamily: F.badge, fontSize: '.9rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: C.orangePale, textShadow: S, marginTop: 4 }}/>
          {/* Nick & Judy flanking */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 8 }}>
            <div style={{ animation: 'zt-float 3.5s ease-in-out infinite' }}>
              <img src={IMG_NICK} alt="" style={{ height: 64, objectFit: 'contain', filter: 'drop-shadow(0 4px 14px rgba(0,0,0,.8))' }}/>
            </div>
            <div style={{ animation: 'zt-floatR 4s .4s ease-in-out infinite' }}>
              <img src={IMG_JUDY} alt="" style={{ height: 64, objectFit: 'contain', filter: 'drop-shadow(0 4px 14px rgba(0,0,0,.8))' }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 2 — invite text */}
      <div style={{ position: 'absolute', top: inviteTopPos, left: 0, right: 0, transform: inviteTransform, textAlign: 'center', zIndex: 1, padding: '0 36px', pointerEvents: editMode ? 'auto' : 'none' }}>
        <div ref={inviteRef} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', opacity: inviteOpacity }}>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteTop || 'Cu drag vă anunțăm'} onChange={v => onInviteTopChange?.(v)}
            style={{ fontFamily: F.badge, fontSize: '.65rem', fontWeight: 800, letterSpacing: '.5em', textTransform: 'uppercase', color: '#ffffff', textShadow: S, margin: 0 }}/>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteMiddle || dateStr || 'Data Evenimentului'} onChange={v => onInviteMiddleChange?.(v)}
            style={{ fontFamily: F.display, fontSize: '2rem', fontWeight: 900, lineHeight: 1.2, color: C.orangePale, textShadow: S, margin: 0 }}/>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteBottom || 'va fi botezat'} onChange={v => onInviteBottomChange?.(v)}
            style={{ fontFamily: F.badge, fontSize: '.7rem', fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: '#ffffff', textShadow: S, margin: 0, lineHeight: 2 }}/>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteTag || '★ deschide orașul ★'} onChange={v => onInviteTagChange?.(v)}
            style={{ fontFamily: F.badge, fontSize: '.55rem', fontWeight: 800, letterSpacing: '.6em', textTransform: 'uppercase', color: C.orangePale, textShadow: S, margin: '2px 0 0', opacity: .85 }}/>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CITY DOOR INTRO — GSAP ScrollTrigger identical mechanic
// ─────────────────────────────────────────────────────────────────────────────
const CityDoorIntro: React.FC<{
  editMode?: boolean; previewMode?: 'doors' | 'static';
  contentEl?: HTMLElement | null; scrollContainer?: HTMLElement | null;
  childName?: string; partner2Name?: string; isWedding?: boolean;
  subtitle?: string; inviteTop?: string; inviteMiddle?: string; inviteBottom?: string; inviteTag?: string; dateStr?: string;
  onChildNameChange?: (v: string) => void; onSubtitleChange?: (v: string) => void;
  onInviteTopChange?: (v: string) => void; onInviteMiddleChange?: (v: string) => void;
  onInviteBottomChange?: (v: string) => void; onInviteTagChange?: (v: string) => void;
  onDoorsOpen?: () => void;
  doorImg?: string; doorImgMobile?: string;
}> = ({
  editMode, previewMode = 'doors', contentEl, scrollContainer,
  childName = 'Rex', partner2Name = '', isWedding = false,
  subtitle = 'te invită în Zootropolis',
  inviteTop, inviteMiddle, inviteBottom, inviteTag, dateStr,
  onChildNameChange, onSubtitleChange,
  onInviteTopChange, onInviteMiddleChange, onInviteBottomChange, onInviteTagChange,
  onDoorsOpen,
  doorImg: doorImgProp, doorImgMobile: doorImgMobileProp,
}) => {
  const leftDoorRef  = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const hintRef      = useRef<HTMLDivElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const seamRef      = useRef<HTMLDivElement>(null);
  const seamRef2     = useRef<HTMLDivElement>(null);
  const nameRef      = useRef<HTMLDivElement>(null);
  const inviteRef    = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (editMode || !leftDoorRef.current || !rightDoorRef.current || !contentEl) return;
    gsap.set(contentEl, { opacity: 0 });
    gsap.set(seamRef.current,  { opacity: 0 });
    gsap.set(seamRef2.current, { opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(leftDoorRef.current,  { xPercent: -100, ease: 'none', duration: 1 }, 0);
    tl.to(rightDoorRef.current, { xPercent:  100, ease: 'none', duration: 1 }, 0);
    tl.to(contentEl,            { opacity: 1,     ease: 'none', duration: 1 }, 0);
    if (hintRef.current)    tl.to(hintRef.current,    { opacity: 0, ease: 'none', duration: .2 }, 0);
    if (overlayRef.current) tl.to(overlayRef.current, { opacity: 0, ease: 'none', duration: .3 }, 0);
    if (seamRef.current)  { tl.to(seamRef.current,  { opacity: 1, ease: 'none', duration: .08 }, 0); tl.to(seamRef.current,  { opacity: 0, ease: 'power2.in', duration: .25 }, .75); }
    if (seamRef2.current) { tl.to(seamRef2.current, { opacity: 1, ease: 'none', duration: .08 }, 0); tl.to(seamRef2.current, { opacity: 0, ease: 'power2.in', duration: .25 }, .75); }

    const DEAD = 60 / 160;
    const textTl = gsap.timeline({ paused: true });
    if (nameRef.current)   textTl.to(nameRef.current,   { opacity: 0, scale: .82, ease: 'power2.in', duration: 1 });
    if (inviteRef.current) textTl.fromTo(inviteRef.current, { opacity: 0, scale: .82 }, { opacity: 1, scale: 1, ease: 'power2.out', duration: 1 });

    let _musicFired = false;
    const st = ScrollTrigger.create({
      trigger: contentEl, scroller: scrollContainer || undefined,
      start: 'top top', end: '+=500%', pin: true, scrub: true, invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (self.progress <= DEAD) { textTl.progress(self.progress / DEAD); tl.progress(0); }
        else {
          textTl.progress(1);
          const p = (self.progress - DEAD) / (1 - DEAD);
          tl.progress(p);
          if (!_musicFired && p > .05) { _musicFired = true; onDoorsOpen?.(); }
        }
      },
      onLeave: () => { if (wrapRef.current) wrapRef.current.style.display = 'none'; },
      onEnterBack: () => {
        _musicFired = false;
        if (wrapRef.current) wrapRef.current.style.display = 'block';
        textTl.progress(0);
        if (nameRef.current)   gsap.set(nameRef.current,   { opacity: 1, scale: 1 });
        if (inviteRef.current) gsap.set(inviteRef.current, { opacity: 0, scale: .88 });
      },
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { st.kill(); tl.kill(); gsap.set(contentEl, { clearProps: 'all' }); };
  }, [editMode, contentEl, scrollContainer]);

  const doorImg = (isMobile ? doorImgMobileProp : doorImgProp) || doorImgProp || IMG_BG;

  // Confetti dots on doors
  const confettiColors = ["#E85D04", "#FFBA49", "#4361EE", "#ec4899", "#0d9488", '#60a5fa'];
  const ConfettiEl = () => (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${(i * 8.5 + 5) % 100}%`, top: `${(i * 13 + 10) % 60}%`, width: 6 + (i % 3) * 2, height: 6 + (i % 4) * 2, borderRadius: i % 2 === 0 ? '50%' : 2, background: confettiColors[i % confettiColors.length], opacity: .55, animation: `zt-bounce ${1.2 + (i * .18) % 1.2}s ${(i * .22) % 2}s ease-in-out infinite`, pointerEvents: 'none' }}/>
      ))}
    </>
  );

  const OverlayProps = { childName, subtitle, isWedding, partner2Name, editMode: !!editMode, inviteTop, inviteMiddle, inviteBottom, inviteTag, dateStr, onChildNameChange, onSubtitleChange, onInviteTopChange, onInviteMiddleChange, onInviteBottomChange, onInviteTagChange, previewMode };

  if (editMode && previewMode === 'static') {
    return (
      <div style={{ position: 'relative', height: 800, borderRadius: 12, marginBottom: 32, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${doorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,27,75,.35)' }}/>
        <ZootropolisOverlayText {...OverlayProps}/>
      </div>
    );
  }

  if (editMode) {
    return (
      <div style={{ position: 'relative', height: 800, borderRadius: 12, marginBottom: 32 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', overflow: 'hidden', borderRadius: '12px 0 0 12px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', backgroundImage: `url(${doorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,27,75,.3)' }}/>
          <ConfettiEl/>
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', overflow: 'hidden', borderRadius: '0 12px 12px 0' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', backgroundImage: `url(${doorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,27,75,.3)' }}/>
          <ConfettiEl/>
        </div>
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}><DoorHint/></div>
        <ZootropolisOverlayText {...OverlayProps}/>
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: 'fixed', inset: 0, height: '100dvh', zIndex: 9999, overflow: 'hidden', pointerEvents: 'none' }}>
      <div ref={leftDoorRef} style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100dvh', overflow: 'visible', willChange: 'transform' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', backgroundImage: `url(${doorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,27,75,.3)' }}/>
          <ConfettiEl/>
        </div>
        <div ref={seamRef} style={{ opacity: 0 }}><CityDoorSeam side="left"/></div>
      </div>
      <div ref={rightDoorRef} style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100dvh', overflow: 'visible', willChange: 'transform' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', backgroundImage: `url(${doorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,27,75,.3)' }}/>
          <ConfettiEl/>
        </div>
        <div ref={seamRef2} style={{ opacity: 0 }}><CityDoorSeam side="right"/></div>
      </div>
      <ZootropolisOverlayText {...OverlayProps} overlayRef={overlayRef as any} nameRef={nameRef as any} inviteRef={inviteRef as any}/>
      <div ref={hintRef} style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}><DoorHint/></div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO PERMISSION MODAL
// ─────────────────────────────────────────────────────────────────────────────
const AudioPermissionModal: React.FC<{ childName: string; onAllow: () => void; onDeny: () => void }> = ({ childName, onAllow, onDeny }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ position: 'absolute', inset: 0, background: hexToRgba("#0D1B2A", .7), backdropFilter: 'blur(12px)' }}/>
    <div style={{ position: 'relative', background: "rgba(27,40,56,.9)", borderRadius: 28, padding: '36px 32px 28px', maxWidth: 320, width: '90%', textAlign: 'center', boxShadow: `0 24px 80px rgba(0,0,0,.3), 0 0 0 3px ${hexToRgba(C.orange, .3)}` }}>
      <div style={{ position: 'absolute', top: -36, left: '50%', transform: 'translateX(-50%)', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={IMG_BADGE} alt="" style={{ width: 64, objectFit: 'contain', filter: `drop-shadow(0 4px 12px ${hexToRgba(C.orange, .5)})`, animation: 'apm-pulse 2s ease-in-out infinite' }}/>
      </div>
      <div style={{ marginTop: 20 }}>
        <img src={IMG_LOGO} alt="Zootropolis" style={{ width: 110, objectFit: 'contain', display: 'block', margin: '0 auto 14px', filter: `drop-shadow(0 2px 6px ${hexToRgba("#4361EE", .25)})` }}/>
        <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 800, color: "#0D1B2A", margin: '0 0 4px' }}>{childName}</p>
        <p style={{ fontFamily: F.badge, fontSize: 12, fontWeight: 700, color: "#FFFFFF", margin: '0 0 8px' }}>te invită în Zootropolis 🦊</p>
        <p style={{ fontFamily: F.badge, fontSize: 11, color: "rgba(144,224,239,.5)", margin: '0 0 24px', lineHeight: 1.65 }}>Această invitație are o melodie specială.<br/>Vrei să activezi muzica?</p>
        <button type="button" onClick={onAllow}
          style={{ width: '100%', padding: '14px 0', background: `linear-gradient(135deg,${C.orange},${C.orangePale})`, border: 'none', borderRadius: 50, cursor: 'pointer', fontFamily: F.display, fontSize: 12, fontWeight: 800, color: "#0D1B2A", letterSpacing: '.08em', marginBottom: 10, boxShadow: `0 6px 20px ${hexToRgba(C.orange, .45)}`, transition: 'transform .15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}>
          🎵 Da, activează muzica
        </button>
        <button type="button" onClick={onDeny}
          style={{ width: '100%', padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: F.badge, fontSize: 11, color: "rgba(144,224,239,.5)" }}>
          Nu, continuă fără muzică
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ZPD BADGE + PAW SCATTER + POLICE TICKER + CITY SKYLINE — exact from reference
// ─────────────────────────────────────────────────────────────────────────────
const ZPDBadge: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size=56, style }) => (
  <svg width={size} height={size*1.1} viewBox="0 0 60 66" fill="none" style={style}>
    <defs>
      <linearGradient id="zt-badge-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFBA49"/>
        <stop offset="50%" stopColor="#E85D04"/>
        <stop offset="100%" stopColor="#C44B00"/>
      </linearGradient>
    </defs>
    <path d="M30 2 L54 12 L54 36 Q54 54 30 64 Q6 54 6 36 L6 12 Z" fill="url(#zt-badge-g)"/>
    <path d="M30 2 L54 12 L54 36 Q54 54 30 64 Q6 54 6 36 L6 12 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <path d="M30 8 L48 16 L48 36 Q48 50 30 58 Q12 50 12 36 L12 16 Z" fill="rgba(255,255,255,0.1)"/>
    <path d="M30 18 L32.5 25 L40 25 L34 29.5 L36.5 37 L30 32.5 L23.5 37 L26 29.5 L20 25 L27.5 25 Z" fill="white" opacity="0.95"/>
    <text x="30" y="48" textAnchor="middle" fontSize="7" fontWeight="900" fill="white" opacity="0.9" fontFamily="'Montserrat','Arial',sans-serif" letterSpacing="1">ZPD</text>
    <path d="M14 12 Q22 8 30 10 L28 20 Q20 16 14 20 Z" fill="rgba(255,255,255,0.18)"/>
  </svg>
);

const PawScatter: React.FC = () => {
  const paws = [
    {x:4,y:10,d:0,s:14,r:-15},{x:88,y:6,d:1.2,s:12,r:20},
    {x:6,y:38,d:2.4,s:10,r:-30},{x:91,y:35,d:.8,s:13,r:15},
    {x:3,y:68,d:1.8,s:11,r:-10},{x:93,y:65,d:3,s:12,r:25},
    {x:8,y:90,d:.5,s:10,r:-20},{x:89,y:88,d:2,s:11,r:18},
  ];
  return (
    <>
      {paws.map((p,i)=>(
        <div key={i} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,fontSize:p.s,transform:`rotate(${p.r}deg)`,animation:`zt-twinkle ${3+i*.4}s ${p.d}s ease-in-out infinite`,pointerEvents:"none",userSelect:"none",zIndex:1,opacity:.3}}>🐾</div>
      ))}
    </>
  );
};

const PoliceTicker: React.FC = () => (
  <div style={{background:`linear-gradient(90deg,${C.steel},${C.cityMid},${C.steel})`,borderBottom:"1px solid rgba(67,97,238,.4)",overflow:"hidden",height:24,display:"flex",alignItems:"center",position:"relative"}}>
    <div style={{display:"inline-flex",gap:40,whiteSpace:"nowrap",animation:"zt-ticker 22s linear infinite"}}>
      {["🐭 Bun venit în Zootropolis!","🦊 Nick & Judy vă invită!","🐇 Toată lumea e binevenită!","🐘 Petrecerea anului!","🦁 ZPD - Departamentul Petrecerilor","🐾 Pregătiți-vă!","🐭 Bun venit în Zootropolis!","🦊 Nick & Judy vă invită!"].map((t,i)=>(
        <span key={i} style={{fontFamily:F.badge,fontSize:10,color:C.orangePale,letterSpacing:2}}>{t}</span>
      ))}
    </div>
  </div>
);

const CitySkyline: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const bgColor   = dark ? C.city    : C.steel;
  const bldColor  = dark ? C.cityMid : C.steel;
  return (
  <svg viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" style={{width:"100%",height:"100%",display:"block"}}>
    <defs>
      <linearGradient id="zt-sky-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={bgColor} stopOpacity="0"/>
        <stop offset="100%" stopColor={bgColor} stopOpacity="1"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="420" height="120" fill="url(#zt-sky-g)" opacity="0.8"/>
    <g fill={bldColor} opacity="0.9">
      <rect x="0" y="60" width="22" height="60"/><rect x="18" y="40" width="18" height="80"/>
      <rect x="32" y="50" width="26" height="70"/><rect x="54" y="30" width="20" height="90"/>
      <rect x="70" y="55" width="24" height="65"/><rect x="90" y="45" width="30" height="75"/>
      <rect x="116" y="58" width="18" height="62"/><rect x="130" y="35" width="24" height="85"/>
      <rect x="150" y="48" width="32" height="72"/><rect x="178" y="25" width="20" height="95"/>
      <rect x="194" y="55" width="28" height="65"/><rect x="218" y="42" width="22" height="78"/>
      <rect x="236" y="30" width="26" height="90"/><rect x="258" y="52" width="20" height="68"/>
      <rect x="274" y="38" width="34" height="82"/><rect x="304" y="60" width="20" height="60"/>
      <rect x="320" y="44" width="28" height="76"/><rect x="344" y="50" width="22" height="70"/>
      <rect x="362" y="35" width="30" height="85"/><rect x="388" y="55" width="32" height="65"/>
    </g>
    {([[22,65],[40,55],[58,42],[72,60],[95,52],[135,45],[155,58],[182,38],[200,62],[240,42],[280,48],[330,52],[370,45]] as [number,number][]).map(([x,y],i)=>(
      <rect key={i} x={x} y={y} width="4" height="5" rx="1"
        fill={i%3===0?C.orangePale:i%3===1?C.sky:C.orangeLight}
        opacity={0.35+(i%4)*0.12}
        style={{animation:`zt-twinkle ${3+i*.4}s ${i*.15}s ease-in-out infinite`}}/>
    ))}
  </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN — exact from reference
// ─────────────────────────────────────────────────────────────────────────────
interface TimeLeft { days:number; hours:number; minutes:number; seconds:number; total:number }
function calcTimeLeft(date:string):TimeLeft {
  const diff=new Date(date).getTime()-Date.now();
  if(diff<=0)return{days:0,hours:0,minutes:0,seconds:0,total:0};
  return{days:Math.floor(diff/86400000),hours:Math.floor((diff/3600000)%24),minutes:Math.floor((diff/60000)%60),seconds:Math.floor((diff/1000)%60),total:diff};
}
const FlipDigit: React.FC<{value:number;label:string}> = ({value,label}) => {
  const prev=useRef(value);
  const [flash,setFlash]=useState(false);
  useEffect(()=>{if(prev.current!==value){setFlash(true);const t=setTimeout(()=>setFlash(false),280);prev.current=value;return()=>clearTimeout(t);}},[value]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{width:56,height:62,background:`linear-gradient(160deg,${C.steel},${C.city})`,border:"1.5px solid rgba(67,97,238,.4)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,.55)",transform:flash?"scale(1.08)":"scale(1)",transition:"transform .14s"}}>
        <div style={{position:"absolute",inset:0,background:flash?"rgba(232,93,4,.1)":"rgba(67,97,238,.05)",transition:"background .28s",pointerEvents:"none"}}/>
        <span style={{fontFamily:F.badge,fontSize:26,color:flash?C.orangePale:C.white,lineHeight:1,letterSpacing:2,transition:"color .28s"}}>{String(value).padStart(2,"0")}</span>
      </div>
      <span style={{fontFamily:F.badge,fontSize:8,letterSpacing:".38em",textTransform:"uppercase",color:"rgba(144,224,239,.55)"}}>{label}</span>
    </div>
  );
};
const Countdown: React.FC<{targetDate:string|undefined}> = ({targetDate}) => {
  const [tl,setTl]=useState<TimeLeft|null>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{setReady(true);if(!targetDate)return;setTl(calcTimeLeft(targetDate));const id=setInterval(()=>setTl(calcTimeLeft(targetDate!)),1000);return()=>clearInterval(id);},[targetDate]);
  if(!ready||!targetDate)return null;
  if(tl?.total===0)return<div style={{textAlign:"center",padding:"12px 20px",border:"1.5px solid rgba(67,97,238,.3)",borderRadius:10,background:"rgba(27,40,56,.4)"}}><p style={{fontFamily:F.badge,fontSize:10,letterSpacing:".45em",textTransform:"uppercase",color:C.orange,margin:0}}>🎉 Evenimentul a avut loc!</p></div>;
  const isSoon=(tl?.total??0)<86400000;
  const vals=[tl?.days??0,tl?.hours??0,tl?.minutes??0,tl?.seconds??0];
  const lbls=["Zile","Ore","Min","Sec"];
  return (
    <div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
        <span style={{fontFamily:F.badge,fontSize:10,letterSpacing:".48em",textTransform:"uppercase",color:C.orange,opacity:.8,padding:"4px 16px",border:"1px solid rgba(232,93,4,.3)",borderRadius:50}}>{isSoon?"🚨 Mâine!":"⏱ Timp rămas"}</span>
      </div>
      <div style={{display:"flex",justifyContent:"center",alignItems:"flex-start",gap:8}}>
        {vals.map((v,i)=>(
          <React.Fragment key={i}>
            <FlipDigit value={v} label={lbls[i]}/>
            {i<3&&<span style={{fontFamily:F.badge,fontSize:22,color:"rgba(67,97,238,.45)",paddingTop:14,flexShrink:0}}>:</span>}
          </React.Fragment>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:5,marginTop:10}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:C.orange,animation:"zt-pulse 2s ease-in-out infinite"}}/>
        <span style={{fontFamily:F.badge,fontSize:8,letterSpacing:".35em",textTransform:"uppercase",color:"rgba(232,93,4,.4)"}}>live</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR — reference style
// ─────────────────────────────────────────────────────────────────────────────
const CalendarMonth: React.FC<{date:string|undefined}> = ({date}) => {
  if(!date)return null;
  const d=new Date(date),year=d.getFullYear(),month=d.getMonth(),day=d.getDate();
  const firstDay=new Date(year,month,1).getDay();
  const dim=new Date(year,month+1,0).getDate();
  const mNames=["IANUARIE","FEBRUARIE","MARTIE","APRILIE","MAI","IUNIE","IULIE","AUGUST","SEPTEMBRIE","OCTOMBRIE","NOIEMBRIE","DECEMBRIE"];
  const dLabs=["L","M","M","J","V","S","D"];
  const start=(firstDay+6)%7;
  const cells:(number|null)[]=[...Array(start).fill(null),...Array.from({length:dim},(_,i)=>i+1)];
  return (
    <div>
      <p style={{fontFamily:F.badge,fontSize:10,letterSpacing:".3em",color:C.orange,textAlign:"center",marginBottom:14,opacity:.9}}>{mNames[month]} {year}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:5}}>
        {dLabs.map((l,i)=><div key={`${l}-${i}`} style={{fontSize:9,fontWeight:700,color:"rgba(144,224,239,.4)",fontFamily:F.badge,textAlign:"center",letterSpacing:1}}>{l}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {cells.map((cell,i)=>{
          const isDay=cell===day;
          return <div key={i} style={{height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:isDay?900:600,fontFamily:isDay?F.display:F.body,color:isDay?C.white:cell?"rgba(144,224,239,.6)":"transparent",background:isDay?`radial-gradient(circle,${C.steel},${C.city})`:"transparent",borderRadius:isDay?8:0,border:isDay?`1.5px solid ${C.orange}`:"none",boxShadow:isDay?"0 0 10px rgba(232,93,4,.4)":"none"}}>{cell||""}</div>;
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION CARD — exact from reference
// ─────────────────────────────────────────────────────────────────────────────
const LocCard: React.FC<{block:InvitationBlock;editMode:boolean;onUpdate:(p:Partial<InvitationBlock>)=>void}> = ({block,editMode,onUpdate}) => {
  const addr=block.locationAddress||block.locationName||"";
  return (
    <div style={{background:`linear-gradient(135deg,${hexToRgba(C.cityMid,.85)},${hexToRgba(C.city,.9)})`,border:`1.5px solid ${hexToRgba(C.steelLight,.3)}`,borderLeft:`4px solid ${C.orange}`,borderRadius:14,padding:"18px 22px",backdropFilter:"blur(8px)",boxShadow:"0 6px 28px rgba(0,0,0,.5)",position:"relative",overflow:"hidden"}}>
      <div style={scanlines}/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <ZPDBadge size={22}/>
          <InlineEdit editMode={editMode} value={block.label||"Locație"} onChange={v=>onUpdate({label:v})}
            style={{fontFamily:F.badge,fontSize:11,letterSpacing:".45em",textTransform:"uppercase",color:C.orange,margin:0}}/>
        </div>
        {(block.time||editMode)&&(
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke={C.sky} strokeWidth=".8" opacity=".7"/>
              <path d="M6.5 3.5 L6.5 6.5 L9 8.5" stroke={C.sky} strokeWidth=".9" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
            </svg>
            <InlineTime editMode={editMode} value={block.time||"11:00"} onChange={v=>onUpdate({time:v})}
              style={{fontFamily:F.label,fontSize:22,fontWeight:800,color:C.sky,margin:0,letterSpacing:1}}/>
          </div>
        )}
        <InlineEdit tag="p" editMode={editMode} value={block.locationName||""} onChange={v=>onUpdate({locationName:v})}
          style={{fontFamily:F.display,fontSize:13,fontWeight:700,color:C.white,margin:"0 0 3px",lineHeight:1.5}}/>
        {(block.locationAddress||editMode)&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:6,marginTop:5}}>
            <svg width="10" height="13" viewBox="0 0 10 14" fill="none" style={{flexShrink:0,marginTop:2}}>
              <path d={`M5 0C2.8 0 1 1.8 1 4c0 3 4 9 4 9s4-6 4-9C9 1.8 7.2 0 5 0z`} fill={`${C.orange}77`}/>
              <circle cx="5" cy="4" r="1.5" fill={C.cityMid}/>
            </svg>
            <InlineEdit tag="p" editMode={editMode} value={block.locationAddress||""} onChange={v=>onUpdate({locationAddress:v})} multiline
              style={{fontFamily:F.body,fontSize:11,fontWeight:600,fontStyle:"italic",color:"rgba(144,224,239,.5)",margin:0,lineHeight:1.6}}/>
          </div>
        )}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
          <InlineWaze value={block.wazeLink||""} onChange={v=>onUpdate({wazeLink:v})} editMode={editMode}/>
          {addr&&<a href={`https://maps.google.com/?q=${encodeURIComponent(addr)}`} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 16px",borderRadius:50,background:"transparent",color:C.sky,border:"1.5px solid rgba(67,97,238,.5)",fontFamily:F.badge,fontSize:10,letterSpacing:".3em",textTransform:"uppercase",textDecoration:"none"}}>◉ Maps</a>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO BLOCK
// ─────────────────────────────────────────────────────────────────────────────
type ClipShape = 'rect'|'rounded'|'rounded-lg'|'squircle'|'circle'|'arch'|'arch-b'|'hexagon'|'diamond'|'triangle'|'star'|'heart'|'diagonal'|'diagonal-r'|'wave-b'|'wave-t'|'wave-both'|'blob'|'blob2'|'blob3'|'blob4';
type MaskEffect = 'fade-b'|'fade-t'|'fade-l'|'fade-r'|'vignette';
function getClipStyle(clip: ClipShape): React.CSSProperties {
  const m: Record<ClipShape, React.CSSProperties> = {
    rect:{borderRadius:0},rounded:{borderRadius:16},'rounded-lg':{borderRadius:32},
    squircle:{borderRadius:'30% 30% 30% 30% / 30% 30% 30% 30%'},circle:{borderRadius:'50%'},
    arch:{borderRadius:'50% 50% 0 0 / 40% 40% 0 0'},'arch-b':{borderRadius:'0 0 50% 50% / 0 0 40% 40%'},
    hexagon:{clipPath:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'},
    diamond:{clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'},
    triangle:{clipPath:'polygon(50% 0%,100% 100%,0% 100%)'},
    star:{clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'},
    heart:{clipPath:'url(#zt-clip-heart)'},diagonal:{clipPath:'polygon(0 0,100% 0,100% 80%,0 100%)'},
    'diagonal-r':{clipPath:'polygon(0 0,100% 0,100% 100%,0 80%)'},
    'wave-b':{clipPath:'url(#zt-clip-wave-b)'},'wave-t':{clipPath:'url(#zt-clip-wave-t)'},
    'wave-both':{clipPath:'url(#zt-clip-wave-both)'},
    blob:{clipPath:'url(#zt-clip-blob)'},blob2:{clipPath:'url(#zt-clip-blob2)'},
    blob3:{clipPath:'url(#zt-clip-blob3)'},blob4:{clipPath:'url(#zt-clip-blob4)'},
  };
  return m[clip] || {};
}
function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers = effects.map(e => { switch(e) { case 'fade-b':return 'linear-gradient(to bottom, black 40%, transparent 100%)'; case 'fade-t':return 'linear-gradient(to top, black 40%, transparent 100%)'; case 'fade-l':return 'linear-gradient(to left, black 40%, transparent 100%)'; case 'fade-r':return 'linear-gradient(to right, black 40%, transparent 100%)'; case 'vignette':return 'radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)'; default:return 'none'; } });
  const mask = layers.join(', ');
  return { WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: effects.length>1?'source-in':'unset', maskComposite: effects.length>1?'intersect':'unset' };
}
const PhotoClipDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position:'absolute', overflow:'hidden', pointerEvents:'none' }}>
    <defs>
      <clipPath id="zt-clip-wave-b" clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="zt-clip-wave-t" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath>
      <clipPath id="zt-clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="zt-clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath>
      <clipPath id="zt-clip-blob" clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath>
      <clipPath id="zt-clip-blob2" clipPathUnits="objectBoundingBox"><path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z"/></clipPath>
      <clipPath id="zt-clip-blob3" clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath>
      <clipPath id="zt-clip-blob4" clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath>
    </defs>
  </svg>
);

const PhotoBlock: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void; placeholderInitial?: string; colorIdx?: number }> = ({ block, editMode, onUpdate, placeholderInitial = 'Z', colorIdx = 0 }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { imageData, altText, aspectRatio = 'free', photoClip = 'rect', photoMasks = [] } = block;
  const pt: Record<string,string> = { '1:1':'100%','4:3':'75%','3:4':'133%','16:9':'56.25%','free':'66.6%' };
  const combined = { ...getClipStyle(photoClip as ClipShape), ...getMaskStyle(photoMasks as MaskEffect[]) };
  const c = DISTRICT_COLORS[colorIdx % DISTRICT_COLORS.length];
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return; setUploading(true); deleteUploadedFile(imageData);
    try { const form = new FormData(); form.append('file', file); const _s = JSON.parse(localStorage.getItem('weddingPro_session')||'{}'); const res = await fetch(`${API_URL}/upload`,{method:'POST',headers:{Authorization:`Bearer ${_s?.token||''}`},body:form}); const {url}=await res.json(); onUpdate({imageData:url}); } catch {} finally { setUploading(false); }
  };
  if (imageData) return (
    <div style={{ position: 'relative' }}>
      <PhotoClipDefs/>
      <div style={{ position: 'relative', paddingTop: pt[aspectRatio], overflow: 'hidden', ...combined }}>
        <img src={imageData} alt={altText||''} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover' }}/>
        {editMode && (
          <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0)',opacity:0,transition:'opacity .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}
            onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.opacity='1'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.opacity='0'}>
            <div style={{ background:'rgba(0,0,0,.5)',position:'absolute',inset:0 }}/>
            <button onClick={()=>fileRef.current?.click()} style={{ position:'relative',zIndex:1,padding:8,background:'white',borderRadius:'50%',border:'none',cursor:'pointer' }}><Camera style={{width:20,height:20,color:C.orange}}/></button>
            <button onClick={()=>{deleteUploadedFile(imageData);onUpdate({imageData:undefined});}} style={{ position:'relative',zIndex:1,padding:8,background:'white',borderRadius:'50%',border:'none',cursor:'pointer' }}><Trash2 style={{width:20,height:20,color:'#dc2626'}}/></button>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} style={{display:'none'}}/>
    </div>
  );
  return (
    <div style={{ position: 'relative' }}>
      <PhotoClipDefs/>
      <div style={{ position: 'relative', paddingTop: pt[aspectRatio], ...combined, overflow: 'hidden', cursor: editMode?'pointer':'default' }} onClick={editMode?()=>fileRef.current?.click():undefined}>
        <div style={{ position:'absolute',inset:0,background:`linear-gradient(135deg,${hexToRgba(c.from,.15)},${hexToRgba(c.to,.1)})`,display:'flex',alignItems:'center',justifyContent:'center' }}>
          {uploading ? <div style={{width:32,height:32,border:`4px solid ${c.from}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> :
            <div style={{textAlign:'center'}}>
              <span style={{fontFamily:F.display,fontSize:52,fontWeight:900,color:hexToRgba(c.from,.4)}}>{(placeholderInitial||'Z')[0].toUpperCase()}</span>
              {editMode&&<p style={{fontFamily:F.badge,fontSize:11,color:"rgba(144,224,239,.5)",margin:'4px 0 0',fontWeight:600}}>Adaugă fotografie</p>}
            </div>}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} style={{display:'none'}}/>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MUSIC BLOCK
// ─────────────────────────────────────────────────────────────────────────────
const MusicBlock: React.FC<{
  block: InvitationBlock; editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  imperativeRef?: React.MutableRefObject<{unlock:()=>void;play:()=>void;pause:()=>void}|null>;
}> = ({ block, editMode, onUpdate, imperativeRef }) => {
  const audioRef=useRef<HTMLAudioElement>(null);
  const mp3Ref=useRef<HTMLInputElement>(null);
  const [playing,setPlaying]=useState(false);
  const [progress,setProgress]=useState(0);
  const [duration,setDuration]=useState(0);
  const [showYt,setShowYt]=useState(false);
  const [ytUrl,setYtUrl]=useState('');
  const [ytDownloading,setYtDownloading]=useState(false);
  const [ytError,setYtError]=useState('');

  useEffect(()=>{
    const a=audioRef.current; if(!a) return;
    const onTime=()=>setProgress(a.currentTime), onDur=()=>setDuration(a.duration), onEnd=()=>{setPlaying(false);setProgress(0);}, onPlay=()=>setPlaying(true), onPause=()=>setPlaying(false);
    a.addEventListener('timeupdate',onTime);a.addEventListener('loadedmetadata',onDur);a.addEventListener('ended',onEnd);a.addEventListener('play',onPlay);a.addEventListener('pause',onPause);
    return()=>{a.removeEventListener('timeupdate',onTime);a.removeEventListener('loadedmetadata',onDur);a.removeEventListener('ended',onEnd);a.removeEventListener('play',onPlay);a.removeEventListener('pause',onPause);};
  },[block.musicUrl,block.musicType]);
  useEffect(()=>{
    if(!imperativeRef) return;
    imperativeRef.current={unlock:()=>{if(block.musicType==='mp3'&&audioRef.current&&block.musicUrl){audioRef.current.play().then(()=>{audioRef.current!.pause();audioRef.current!.currentTime=0;}).catch(()=>{});}},play:()=>{if(audioRef.current&&block.musicUrl)audioRef.current.play().catch(()=>{});},pause:()=>{if(audioRef.current)audioRef.current.pause();}};
  });

  const fmt=(s:number)=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const pct=duration?`${(progress/duration)*100}%`:'0%';
  const toggle=()=>{const a=audioRef.current;if(!a)return;if(playing){a.pause();setPlaying(false);}else{a.play().then(()=>setPlaying(true)).catch(()=>{});}};
  const seek=(e:React.MouseEvent<HTMLDivElement>)=>{if(!audioRef.current||!duration)return;const r=e.currentTarget.getBoundingClientRect();audioRef.current.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*duration;};
  const handleMp3=async(file:File)=>{
    if(!file.type.startsWith('audio/'))return;const _s=JSON.parse(localStorage.getItem('weddingPro_session')||'{}');
    try{const form=new FormData();form.append('file',file);const res=await fetch(`${API_URL}/upload`,{method:'POST',headers:{Authorization:`Bearer ${_s?.token||''}`},body:form});if(!res.ok)throw new Error();const{url}=await res.json();onUpdate({musicUrl:url,musicType:'mp3'});}catch(e){console.error(e);}
  };
  const submitYt=async()=>{
    const t=ytUrl.trim();if(!t)return;const _s=JSON.parse(localStorage.getItem('weddingPro_session')||'{}');setYtDownloading(true);setYtError('');
    try{const res=await fetch(`${API_URL}/download-yt-audio`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${_s?.token||''}`},body:JSON.stringify({url:t})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Eroare');onUpdate({musicUrl:data.url,musicType:'mp3',musicTitle:data.title||'',musicArtist:data.author||''});setShowYt(false);setYtUrl('');}
    catch(e:any){setYtError(e.message||'Nu s-a putut descărca.');}finally{setYtDownloading(false);}
  };
  const isActive=!!block.musicUrl;

  return (
    <DistrictCard colorIdx={2}>
      {block.musicType==='mp3'&&block.musicUrl&&<audio ref={audioRef} src={block.musicUrl} preload="metadata"/>}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
        <div style={{width:34,height:34,borderRadius:'50%',background:playing?`linear-gradient(135deg,${C.orange},${C.orangePale})`:`linear-gradient(135deg,${hexToRgba(C.orange,.15)},${hexToRgba(C.orangePale,.15)})`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .3s',boxShadow:playing?`0 4px 14px ${hexToRgba(C.orange,.5)}`:'none'}}>
          <Music style={{width:15,height:15,color:playing?C.city:C.orange}}/>
        </div>
        <span style={{fontFamily:F.badge,fontSize:10,fontWeight:800,letterSpacing:'.3em',textTransform:'uppercase',color:playing?C.orange:"rgba(144,224,239,.5)",transition:'color .3s'}}>
          {playing?'Se redă acum':'Melodia Zilei'}
        </span>
        {playing&&(
          <div style={{display:'flex',alignItems:'flex-end',gap:2,height:14,marginLeft:'auto'}}>
            {[0,.2,.1,.3].map((d,i)=><div key={i} style={{width:3,height:14,background:`linear-gradient(to top,${C.orange},${C.orangePale})`,borderRadius:2,transformOrigin:'bottom',animation:`zt-bar .7s ease-in-out ${d}s infinite`}}/>)}
          </div>
        )}
      </div>
      {!isActive&&editMode&&(!showYt?(
        <div style={{display:'flex',gap:8}}>
          <button type="button" onClick={()=>mp3Ref.current?.click()} style={{flex:1,background:`linear-gradient(135deg,${hexToRgba(C.orange,.08)},${hexToRgba(C.orangePale,.08)})`,border:`1.5px dashed ${hexToRgba(C.orange,.4)}`,borderRadius:12,padding:'14px 0',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <Upload style={{width:20,height:20,color:C.orange,opacity:.8}}/><span style={{fontFamily:F.badge,fontSize:9,color:C.orange,fontWeight:800,letterSpacing:'.2em',textTransform:'uppercase'}}>MP3</span>
          </button>
          <button type="button" onClick={()=>setShowYt(true)} style={{flex:1,background:`linear-gradient(135deg,${hexToRgba(C.orange,.08)},${hexToRgba(C.orangePale,.08)})`,border:`1.5px dashed ${hexToRgba(C.orange,.4)}`,borderRadius:12,padding:'14px 0',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="red" opacity=".8"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/></svg>
            <span style={{fontFamily:F.badge,fontSize:9,color:C.orange,fontWeight:800,letterSpacing:'.2em',textTransform:'uppercase'}}>YouTube</span>
          </button>
          <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e=>{const f=e.target.files?.[0];if(f)handleMp3(f);}} style={{display:'none'}}/>
        </div>
      ):(
        <div style={{marginBottom:10}}>
          <div style={{display:'flex',gap:6,marginBottom:ytError?6:0}}>
            <input value={ytUrl} onChange={e=>{setYtUrl(e.target.value);setYtError('');}} onKeyDown={e=>e.key==='Enter'&&!ytDownloading&&submitYt()} placeholder="https://youtu.be/..." autoFocus disabled={ytDownloading}
              style={{flex:1,background:"rgba(13,27,42,.8)",border:`1.5px solid ${ytError?'#ef4444':hexToRgba("#4361EE",.3)}`,borderRadius:10,padding:'9px 12px',fontFamily:F.badge,fontSize:11,color:C.white,outline:'none'}}/>
            <button type="button" onClick={submitYt} disabled={ytDownloading} style={{background:`linear-gradient(135deg,${C.orange},${C.orangePale})`,border:'none',borderRadius:10,padding:'0 14px',cursor:ytDownloading?'not-allowed':'pointer',color:C.city,fontWeight:800}}>
              {ytDownloading?<div style={{width:14,height:14,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>:'✓'}
            </button>
            <button type="button" onClick={()=>{setShowYt(false);setYtUrl('');setYtError('');}} style={{background:"rgba(13,27,42,.8)",border:'none',borderRadius:10,padding:'0 10px',cursor:'pointer',color:"rgba(144,224,239,.5)"}}>✕</button>
          </div>
          {ytDownloading&&<p style={{fontFamily:F.badge,fontSize:9,color:C.orange,margin:0,textAlign:'center',fontWeight:700}}>⏳ Se descarcă...</p>}
          {ytError&&<p style={{fontFamily:F.badge,fontSize:9,color:'#ef4444',margin:0}}>⚠ {ytError}</p>}
        </div>
      ))}
      {!isActive&&!editMode&&(
        <div style={{textAlign:'center',padding:'16px 0',opacity:.5}}>
          <Music style={{width:32,height:32,color:C.orange,display:'block',margin:'0 auto 6px'}}/>
          <p style={{fontFamily:F.badge,fontSize:12,color:"rgba(144,224,239,.5)",margin:0,fontWeight:600}}>Melodia va apărea aici</p>
        </div>
      )}
      {isActive&&(
        <div>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
            <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${hexToRgba(C.orange,.12)},${hexToRgba(C.orangePale,.12)})`,border:`2px solid ${hexToRgba(C.orange,.2)}`,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Music style={{width:20,height:20,color:C.orange,opacity:.8}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle||''} onChange={v=>onUpdate({musicTitle:v})} placeholder="Titlul melodiei..." style={{fontFamily:F.display,fontSize:14,fontWeight:700,color:C.city,margin:0,lineHeight:1.3}}/>
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist||''} onChange={v=>onUpdate({musicArtist:v})} placeholder="Artist..." style={{fontFamily:F.badge,fontSize:11,color:"rgba(144,224,239,.5)",margin:'2px 0 0',fontWeight:600}}/>
            </div>
          </div>
          <div onClick={seek} style={{height:5,background:hexToRgba(C.orange,.15),borderRadius:99,marginBottom:6,cursor:'pointer',position:'relative'}}>
            <div style={{height:'100%',borderRadius:99,background:`linear-gradient(to right,${C.orange},${C.orangePale})`,width:pct,transition:'width .3s linear'}}/>
            <div style={{position:'absolute',top:'50%',transform:'translateY(-50%)',left:pct,marginLeft:-6,width:12,height:12,borderRadius:'50%',background:C.orange,boxShadow:`0 2px 8px ${hexToRgba(C.orange,.5)}`,transition:'left .3s linear'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
            <span style={{fontFamily:F.badge,fontSize:9,color:"rgba(144,224,239,.5)",fontWeight:600}}>{fmt(progress)}</span>
            <span style={{fontFamily:F.badge,fontSize:9,color:"rgba(144,224,239,.5)",fontWeight:600}}>{duration?fmt(duration):'--:--'}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20}}>
            <button type="button" onClick={()=>{const a=audioRef.current;if(a)a.currentTime=Math.max(0,a.currentTime-10);}} style={{background:'none',border:'none',cursor:'pointer',padding:4,opacity:.5}}><SkipBack style={{width:16,height:16,color:C.city}}/></button>
            <button type="button" onClick={toggle} style={{width:46,height:46,borderRadius:'50%',background:`linear-gradient(135deg,${C.orange},${C.orangePale})`,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 6px 18px ${hexToRgba(C.orange,.45)}`}}>
              {playing?<Pause style={{width:16,height:16,color:C.city}}/>:<Play style={{width:16,height:16,color:C.city,marginLeft:2}}/>}
            </button>
            <button type="button" onClick={()=>{const a=audioRef.current;if(a)a.currentTime=Math.min(duration,a.currentTime+10);}} style={{background:'none',border:'none',cursor:'pointer',padding:4,opacity:.5}}><SkipForward style={{width:16,height:16,color:C.city}}/></button>
          </div>
          {editMode&&<div style={{marginTop:12,textAlign:'center'}}><button type="button" onClick={()=>onUpdate({musicUrl:'',musicType:'none' as any})} style={{background:"rgba(13,27,42,.8)",border:`1.5px solid ${hexToRgba(C.orange,.3)}`,borderRadius:99,padding:'4px 14px',cursor:'pointer',fontFamily:F.badge,fontSize:9,color:"rgba(144,224,239,.5)",fontWeight:700}}>Schimbă sursa</button></div>}
        </div>
      )}
    </DistrictCard>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK TOOLBAR
// ─────────────────────────────────────────────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => {
  const btn: React.CSSProperties = { background:'none',border:'none',padding:5,borderRadius:99,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' };
  const stop=(e:React.MouseEvent)=>e.stopPropagation();
  return (
    <div onClick={stop} style={{ position:'absolute',top:-18,right:6,zIndex:9999,display:'flex',alignItems:'center',gap:2,borderRadius:99,border:`2px solid ${hexToRgba(C.orange,.25)}`,backgroundColor:"rgba(27,40,56,.85)",boxShadow:'0 4px 16px rgba(0,0,0,.12)',padding:'3px 5px',pointerEvents:'auto' }}>
      <button type="button" onClick={e=>{stop(e);onUp();}} disabled={isFirst} style={{...btn,opacity:isFirst?.2:1}}><ChevronUp style={{width:13,height:13,color:C.orange}}/></button>
      <button type="button" onClick={e=>{stop(e);onDown();}} disabled={isLast} style={{...btn,opacity:isLast?.2:1}}><ChevronDown style={{width:13,height:13,color:C.orange}}/></button>
      <div style={{width:1,height:12,backgroundColor:hexToRgba(C.orange,.2),margin:'0 1px'}}/>
      <button type="button" onClick={e=>{stop(e);onToggle();}} style={btn}>
        {visible?<Eye style={{width:13,height:13,color:"#4361EE"}}/>:<EyeOff style={{width:13,height:13,color:"rgba(144,224,239,.5)"}}/>}
      </button>
      <button type="button" onClick={e=>{stop(e);onDelete();}} style={btn}><Trash2 style={{width:13,height:13,color:'#ef4444'}}/></button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INSERT BLOCK BUTTON
// ─────────────────────────────────────────────────────────────────────────────
const BLOCK_TYPE_ICONS: Record<string,string> = { photo:'🖼',text:'✏️',location:'📍',calendar:'📅',countdown:'⏱',music:'🎵',gift:'🎁',whatsapp:'💬',rsvp:'✉️',divider:'—',family:'👨‍👩‍👧',date:'📆',description:'📝',timeline:'🗓' };
const InsertBlockButton: React.FC<{ insertIdx:number; openInsertAt:number|null; setOpenInsertAt:(v:number|null)=>void; BLOCK_TYPES:{type:string;label:string;def:any}[]; onInsert:(type:string,def:any)=>void }> = ({ insertIdx, openInsertAt, setOpenInsertAt, BLOCK_TYPES, onInsert }) => {
  const isOpen=openInsertAt===insertIdx;
  const [hov,setHov]=React.useState(false);
  return (
    <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',height:32,zIndex:20}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{position:'absolute',left:0,right:0,height:2,background:`repeating-linear-gradient(to right,${hexToRgba(C.orange,.35)} 0,${hexToRgba(C.orange,.35)} 8px,transparent 8px,transparent 16px)`,borderRadius:99,zIndex:1}}/>
      <button type="button" onClick={()=>setOpenInsertAt(isOpen?null:insertIdx)} style={{width:28,height:28,borderRadius:'50%',background:isOpen?`linear-gradient(135deg,${C.orange},${C.orangePale})`:"rgba(27,40,56,.85)",border:`2px solid ${hexToRgba(C.orange,.5)}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:isOpen?C.city:C.orange,boxShadow:`0 2px 10px ${hexToRgba(C.orange,.25)}`,opacity:1,transition:'transform .15s,background .15s',transform:(hov||isOpen)?'scale(1)':'scale(.7)',zIndex:2,position:'relative',lineHeight:1,fontWeight:800}}>{isOpen?'×':'+'}</button>
      {isOpen&&(
        <div style={{position:'absolute',bottom:36,left:'50%',transform:'translateX(-50%)',background:"rgba(27,40,56,.85)",borderRadius:20,border:`2px solid ${hexToRgba(C.orange,.15)}`,boxShadow:`0 16px 48px rgba(0,0,0,.12)`,padding:16,zIndex:100,width:260}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
          <p style={{fontFamily:F.badge,fontSize:'.5rem',fontWeight:800,letterSpacing:'.3em',textTransform:'uppercase',color:"rgba(144,224,239,.5)",margin:'0 0 10px',textAlign:'center'}}>Adaugă bloc</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
            {BLOCK_TYPES.map(bt=>(
              <button key={bt.type} type="button" onClick={()=>onInsert(bt.type,bt.def)}
                style={{background:"rgba(13,27,42,.8)",border:`1.5px solid ${hexToRgba(C.orange,.15)}`,borderRadius:12,padding:'8px 4px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4,transition:'all .15s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=hexToRgba(C.orange,.08);(e.currentTarget as HTMLButtonElement).style.borderColor=hexToRgba(C.orange,.45);}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(13,27,42,.8)";(e.currentTarget as HTMLButtonElement).style.borderColor=hexToRgba(C.orange,.15);}}>
                <span style={{fontSize:18,lineHeight:1}}>{BLOCK_TYPE_ICONS[bt.type]||'+'}</span>
                <span style={{fontFamily:F.badge,fontSize:'.5rem',fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:C.city,lineHeight:1.2,textAlign:'center'}}>{bt.label.replace(/^[^\s]+\s/,'')}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────
export const CASTLE_DEFAULTS = {
  partner1Name:         'Rex',
  partner2Name:         '',
  eventType:            'baptism',
  welcomeText:          'Vă invităm cu drag',
  celebrationText:      'la botezul lui',
  showWelcomeText:      true,
  showCelebrationText:  true,
  weddingDate:          '',
  rsvpButtonText:       'Confirmă Prezența',
  castleIntroSubtitle:  'te invită în Zootropolis',
  castleInviteTop:      'Cu multă bucurie vă anunțăm',
  castleInviteMiddle:   '',
  castleInviteBottom:   'va fi botezat',
  castleInviteTag:      '★ deschide orașul ★',
  colorTheme:           'default',
};

export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = [
  {id:'def-music',    type:'music'    as const,show:true,musicTitle:'',musicArtist:'',musicUrl:'',musicType:'none' as const},
  {id:'def-photo-1',  type:'photo'    as const,show:true,imageData:'',altText:'Foto',aspectRatio:'3:4' as const,photoClip:'arch' as const,photoMasks:['fade-b'] as any},
  {id:'def-text-1',   type:'text'     as const,show:true,content:'Orice animal, indiferent de specie, poate fi orice vrea să fie. Vă invităm să fiți parte din povestea noastră!'},
  {id:'def-divider-1',type:'divider'  as const,show:true},
  {id:'def-family-1', type:'family'   as const,show:true,label:'Părinții',content:'Cu drag și bucurie',members:JSON.stringify([{name1:'Mama',name2:'Tata'}])},
  {id:'def-family-2', type:'family'   as const,show:true,label:'Nașii',content:'Cu drag și recunoștință',members:JSON.stringify([{name1:'Nașa',name2:'Nașul'}])},
  {id:'def-calendar', type:'calendar' as const,show:true},
  {id:'def-countdown',type:'countdown'as const,show:true,countdownTitle:'Timp rămas'},
  {id:'def-divider-2',type:'divider'  as const,show:true},
  {id:'def-loc-1',    type:'location' as const,show:true,label:'Botezul',time:'11:00',locationName:'Zootropolis Central',locationAddress:'Str. Mamiferelor 1, București',wazeLink:''},
  {id:'def-loc-2',    type:'location' as const,show:true,label:'Petrecerea',time:'15:00',locationName:'Savanna Central Events',locationAddress:'Aleea Animalelor 5, București',wazeLink:''},
  {id:'def-divider-3',type:'divider'  as const,show:true},
  {id:'def-photo-2',  type:'photo'    as const,show:true,imageData:'',altText:'Foto',aspectRatio:'1:1' as const,photoClip:'circle' as const,photoMasks:['vignette'] as any},
  {id:'def-gift',     type:'gift'     as const,show:true,sectionTitle:'Sugestie de cadou',content:'Cel mai frumos cadou este prezența voastră alături de noi.',iban:'',ibanName:''},
  {id:'def-rsvp',     type:'rsvp'     as const,show:true,label:'Confirmă Prezența'},
];

export const CASTLE_PREVIEW_DATA = {
  guest:{name:'Invitat Drag',status:'pending',type:'adult'},
  project:{selectedTemplate:'zootropolis'},
  profile:{...CASTLE_DEFAULTS,weddingDate:new Date(Date.now()+60*24*60*60*1000).toISOString().split('T')[0],customSections:JSON.stringify(CASTLE_DEFAULT_BLOCKS)},
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
const ZootropolisTemplate: React.FC<InvitationTemplateProps & {
  editMode?: boolean; introPreview?: boolean;
  onProfileUpdate?: (patch: Record<string,any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock|null, idx:number, textKey?:string, textLabel?:string) => void;
  selectedBlockId?: string; scrollContainer?: HTMLElement|null;
}> = ({ data, onOpenRSVP, editMode=false, introPreview=false, scrollContainer, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId }) => {
  const { profile, guest } = data;

  const safeJSON=(s:string|undefined,fb:any)=>{try{return s?JSON.parse(s):fb;}catch{return fb;}};
  const pr = profile as any;

  // Apply color theme
  const theme = getZootropolisTheme(pr.colorTheme);
  C = {
    city       : theme.city,
    cityMid    : theme.cityMid,
    steel      : theme.steel,
    steelLight : theme.steelLight,
    orange     : theme.orange,
    orangeLight: theme.orangeLight,
    orangePale : theme.orangePale,
    sky        : theme.sky,
    skyDeep    : theme.skyDeep,
    white      : "#FFFFFF",
  };
  const p = {
    partner1Name:        pr.partner1Name        ?? CASTLE_DEFAULTS.partner1Name,
    partner2Name:        pr.partner2Name        ?? '',
    eventType:           pr.eventType           ?? 'baptism',
    weddingDate:         pr.weddingDate          ?? '',
    welcomeText:         pr.welcomeText          ?? CASTLE_DEFAULTS.welcomeText,
    celebrationText:     pr.celebrationText      ?? CASTLE_DEFAULTS.celebrationText,
    showWelcomeText:     pr.showWelcomeText      ?? true,
    showCelebrationText: pr.showCelebrationText  ?? true,
    castleIntroSubtitle: pr.castleIntroSubtitle  ?? CASTLE_DEFAULTS.castleIntroSubtitle,
    castleInviteTop:     pr.castleInviteTop      ?? CASTLE_DEFAULTS.castleInviteTop,
    castleInviteMiddle:  pr.castleInviteMiddle   ?? CASTLE_DEFAULTS.castleInviteMiddle,
    castleInviteBottom:  pr.castleInviteBottom   ?? CASTLE_DEFAULTS.castleInviteBottom,
    castleInviteTag:     pr.castleInviteTag      ?? CASTLE_DEFAULTS.castleInviteTag,
  };

  const isWedding = ['wedding','anniversary'].includes(p.eventType.toLowerCase());
  const babyName  = p.partner1Name;
  const heroTitle = isWedding ? [p.partner1Name, p.partner2Name].filter(Boolean).join(' & ') : p.partner1Name;
  const wd             = p.weddingDate ? new Date(p.weddingDate) : null;
  const dateStr        = wd ? wd.toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'}) : 'Data Evenimentului';
  const displayDay     = wd ? String(wd.getDate()) : '--';
  const displayMonth   = wd ? wd.toLocaleDateString('ro-RO',{month:'long'}) : '----';
  const displayYear    = wd ? String(wd.getFullYear()) : '----';
  const displayWeekday = wd ? wd.toLocaleDateString('ro-RO',{weekday:'long'}) : '----';

  // Blocks
  const blocksFromDB: InvitationBlock[]|null = safeJSON(pr.customSections, null);
  const hasDB = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;
  const [blocks,setBlocks] = useState<InvitationBlock[]>(()=>hasDB?blocksFromDB!:CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
  useEffect(()=>{ const fresh:InvitationBlock[]|null=safeJSON(pr.customSections,null); if(Array.isArray(fresh)&&fresh.length>0)setBlocks(fresh); else if(fresh!==null&&Array.isArray(fresh)&&fresh.length===0)setBlocks(CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]); },[pr.customSections]);

  const [openInsertAt,setOpenInsertAt]=useState<number|null>(null);
  const musicPlayRef=useRef<{unlock:()=>void;play:()=>void;pause:()=>void}|null>(null);

  const updBlock=useCallback((idx:number,patch:Partial<InvitationBlock>)=>{setBlocks(prev=>{const nb=prev.map((b,i)=>i===idx?{...b,...patch}:b);onBlocksUpdate?.(nb);return nb;});},[onBlocksUpdate]);
  const movBlock=useCallback((idx:number,dir:-1|1)=>{setBlocks(prev=>{const nb=[...prev];const to=idx+dir;if(to<0||to>=nb.length)return prev;[nb[idx],nb[to]]=[nb[to],nb[idx]];onBlocksUpdate?.(nb);return nb;});},[onBlocksUpdate]);
  const delBlock=useCallback((idx:number)=>{setBlocks(prev=>{const nb=prev.filter((_,i)=>i!==idx);onBlocksUpdate?.(nb);return nb;});},[onBlocksUpdate]);
  const addBlockAt=useCallback((afterIdx:number,type:string,def:any)=>{setBlocks(prev=>{const nb=[...prev];nb.splice(afterIdx+1,0,{id:Date.now().toString(),type:type as InvitationBlockType,show:true,...def});onBlocksUpdate?.(nb);return nb;});},[onBlocksUpdate]);
  const handleInsertAt=(afterIdx:number,type:string,def:any)=>{addBlockAt(afterIdx,type,def);setOpenInsertAt(null);};

  const _pq=useRef<Record<string,any>>({});
  const _pt=useRef<ReturnType<typeof setTimeout>|null>(null);
  const upProfile=useCallback((field:string,value:any)=>{_pq.current={..._pq.current,[field]:value};if(_pt.current)clearTimeout(_pt.current);_pt.current=setTimeout(()=>{onProfileUpdate?.(_pq.current);_pq.current={};},400);},[onProfileUpdate]);

  // Timeline
  const getTimelineItems=()=>safeJSON(pr.timeline,[]);
  const updateTimeline=(next:any[])=>onProfileUpdate?.({timeline:JSON.stringify(next),showTimeline:true});
  const addTimelineItem=()=>updateTimeline([...getTimelineItems(),{id:Date.now().toString(),title:'',time:''}]);
  const updateTimelineItem=(id:string,patch:any)=>updateTimeline(getTimelineItems().map((t:any)=>t.id===id?{...t,...patch}:t));
  const removeTimelineItem=(id:string)=>updateTimeline(getTimelineItems().filter((t:any)=>t.id!==id));

  // Global config — door images per theme
  const [globalConfig, setGlobalConfig] = useState<Record<string, any>>({});
  useEffect(() => {
    fetch(`${API_URL}/config/template-defaults/${meta.id}`)
      .then(r => r.ok ? r.json() : {})
      .then((cfg: any) => setGlobalConfig(cfg))
      .catch(() => {});
  }, []);
  const activeColorTheme = pr.colorTheme || 'default';
  const themeImgs   = globalConfig.themeImages?.[activeColorTheme] || {};
  const defaultImgs = globalConfig.themeImages?.['default'] || {};
  const heroBgImage       = themeImgs.desktop || defaultImgs.desktop || globalConfig.heroBgImage;
  const heroBgImageMobile = themeImgs.mobile  || defaultImgs.mobile  || globalConfig.heroBgImageMobile;

  // Intro & audio
  const hasMusicBlock=useCallback(()=>blocks.some(b=>b.type==='music'&&b.musicType!=='none'&&b.musicUrl),[blocks]);
  const [showAudioModal,setShowAudioModal]=useState(false);
  const audioAllowedRef=useRef(false);
  const [showIntro,setShowIntro]=useState(!editMode);
  const contentRef=useRef<HTMLDivElement>(null);
  const [contentEl,setContentEl]=useState<HTMLElement|null>(null);

  useEffect(()=>{if(!editMode)setShowAudioModal(hasMusicBlock());},[]);
  useEffect(()=>{setShowIntro(!editMode);},[editMode]);

  const resetToDefaults=useCallback(()=>{
    if(!window.confirm('Resetezi templateul la valorile implicite?'))return;
    onProfileUpdate?.({...CASTLE_DEFAULTS,weddingDate:pr.weddingDate??''});
    const fb=CASTLE_DEFAULT_BLOCKS.map((b,i)=>({...b,id:`def-${Date.now()}-${i}`}));
    setBlocks(fb as unknown as InvitationBlock[]); onBlocksUpdate?.(fb as unknown as InvitationBlock[]);
  },[onProfileUpdate,onBlocksUpdate,pr.weddingDate]);

  const BLOCK_TYPES = [
    {type:'photo',      label:'📷 Foto',     def:{imageData:'',aspectRatio:'1:1',photoClip:'rect',photoMasks:[]}},
    {type:'text',       label:'Text',         def:{content:'Orice animal poate fi orice vrea...'}},
    {type:'location',   label:'Locatie',      def:{label:'Locație',time:'11:00',locationName:'Zootropolis',locationAddress:'Adresa'}},
    {type:'calendar',   label:'📅 Calendar', def:{}},
    {type:'countdown',  label:'⏱ Countdown', def:{}},
    {type:'timeline',   label:'🗓 Cronologie',def:{}},
    {type:'music',      label:'🎵 Muzică',   def:{musicTitle:'',musicArtist:'',musicType:'none'}},
    {type:'gift',       label:'🎁 Cadouri',  def:{sectionTitle:'Sugestie cadou',content:'',iban:'',ibanName:''}},
    {type:'whatsapp',   label:'WhatsApp',     def:{label:'Contact WhatsApp',content:'0700000000'}},
    {type:'rsvp',       label:'RSVP',         def:{label:'Confirmă Prezența'}},
    {type:'divider',    label:'Linie',        def:{}},
    {type:'family',     label:'👨‍👩‍👧 Familie',def:{label:'Părinții',content:'Cu drag',members:JSON.stringify([{name1:'Mama',name2:'Tata'}])}},
    {type:'date',       label:'📆 Data',      def:{}},
    {type:'description',label:'Descriere',    def:{content:'O scurtă descriere...'}},
  ];

  // Deco images cycling per block
  const decoImages = [IMG_NICK, IMG_JUDY, IMG_BADGE, IMG_CARROT, IMG_FLOWER, IMG_STARS];
  const familyIcons = ['🦊','🐰','🐘','🦁','🐻','🐼'];

  const fullCSS = ZT_CSS + ' html,body{background:' + C.city + '!important;}';

  return (
    <div style={{ background: C.city }}>
      <style dangerouslySetInnerHTML={{ __html: fullCSS }}/>

      {showAudioModal && !editMode && (
        <AudioPermissionModal childName={babyName}
          onAllow={()=>{audioAllowedRef.current=true;musicPlayRef.current?.unlock();setShowAudioModal(false);}}
          onDeny={()=>{audioAllowedRef.current=false;setShowAudioModal(false);}}/>
      )}

      {showIntro && (
        <BlockStyleProvider value={{blockId:'__intro__',textStyles:pr.introTextStyles}}>
          <CityDoorIntro
            contentEl={contentEl} scrollContainer={scrollContainer}
            childName={p.partner1Name} partner2Name={p.partner2Name}
            isWedding={isWedding} subtitle={p.castleIntroSubtitle}
            inviteTop={p.castleInviteTop} inviteMiddle={p.castleInviteMiddle||dateStr}
            inviteBottom={p.castleInviteBottom} inviteTag={p.castleInviteTag} dateStr={dateStr}
            onDoorsOpen={()=>{if(audioAllowedRef.current)musicPlayRef.current?.play();}}
            doorImg={heroBgImage} doorImgMobile={heroBgImageMobile}
          />
        </BlockStyleProvider>
      )}

      {editMode && introPreview && (
        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <div style={{marginBottom:32,padding:20,background:hexToRgba("#4361EE",.08),borderRadius:20,border:`2px solid ${hexToRgba("#4361EE",.15)}`}}>
            <p style={{fontFamily:F.badge,fontSize:10,letterSpacing:'.3em',fontWeight:800,color:"#4361EE",textTransform:'uppercase',marginBottom:12}}>Preview intro (editabil)</p>
            <div style={{borderRadius:14,overflow:'hidden',border:`2px solid ${hexToRgba("#4361EE",.15)}`}}>
              <BlockStyleProvider value={{blockId:'__intro__',textStyles:pr.introTextStyles,onTextSelect:(k,l)=>onBlockSelect?.({id:'__intro__',type:'intro' as any,show:true} as any,-1,k,l)}}>
                <CityDoorIntro editMode previewMode="static"
                  childName={p.partner1Name} partner2Name={p.partner2Name}
                  isWedding={isWedding} subtitle={p.castleIntroSubtitle}
                  inviteTop={p.castleInviteTop} inviteMiddle={p.castleInviteMiddle||dateStr}
                  inviteBottom={p.castleInviteBottom} inviteTag={p.castleInviteTag} dateStr={dateStr}
                  onChildNameChange={v=>upProfile('partner1Name',v)}
                  onSubtitleChange={v=>upProfile('castleIntroSubtitle',v)}
                  onInviteTopChange={v=>upProfile('castleInviteTop',v)}
                  onInviteMiddleChange={v=>upProfile('castleInviteMiddle',v)}
                  onInviteBottomChange={v=>upProfile('castleInviteBottom',v)}
                  onInviteTagChange={v=>upProfile('castleInviteTag',v)}
                  doorImg={heroBgImage} doorImgMobile={heroBgImageMobile}
                />
              </BlockStyleProvider>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div
        ref={el=>{contentRef.current=el;setContentEl(el);}}
        style={{ minHeight:'100vh', fontFamily:F.badge, position:'relative', paddingBottom:80 }}>

        {/* Background decoration — floating shapes */}
        <div style={{position:'fixed',top:'5%',right:'-5%',width:280,height:280,borderRadius:'50%',background:`radial-gradient(circle,${hexToRgba(C.orange,.08)} 0%,transparent 70%)`,pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'fixed',bottom:'15%',left:'-5%',width:240,height:240,borderRadius:'50%',background:`radial-gradient(circle,${hexToRgba(C.steelLight,.08)} 0%,transparent 70%)`,pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'fixed',top:'45%',left:'50%',transform:'translateX(-50%)',width:400,height:200,borderRadius:'50%',background:`radial-gradient(ellipse,${hexToRgba(C.orangePale,.05)} 0%,transparent 70%)`,pointerEvents:'none',zIndex:0}}/>
        {/* Decorative city buildings — fixed */}
        <img src={IMG_CITY1} alt="" style={{position:'fixed',bottom:0,left:0,width:100,opacity:.12,pointerEvents:'none',zIndex:0}}/>
        <img src={IMG_CITY2} alt="" style={{position:'fixed',bottom:0,right:0,width:100,opacity:.12,pointerEvents:'none',zIndex:0}}/>
        <div style={{position:"relative",zIndex:2,maxWidth:440,margin:"0 auto",padding:"36px 16px 0"}}>

          {/* ── HERO CARD — exact from reference ── */}
          <BlockStyleProvider value={{blockId:"__hero__",textStyles:pr.heroTextStyles||{},onTextSelect:(k,l)=>onBlockSelect?.({id:"__hero__",type:"__hero__" as any,show:true} as any,-1,k,l)}}>
            <Reveal from="fade">
              <div style={{...getSectionStyle(),textAlign:"center",padding:"0 0 28px",borderTop:`3px solid ${C.orange}`,overflow:"hidden"}}>
                <div style={scanlines}/>
                {/* Scene banner */}
                <div style={{position:"relative",height:195,overflow:"hidden",borderRadius:"16px 16px 0 0"}}>
                  <img src={IMG_SCENE} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%",filter:"brightness(.65) saturate(1.3)"}}/>
                  <div style={{position:"absolute",bottom:0,left:0,right:0}}><CitySkyline dark/></div>
                  {/* <div style={{position:"absolute",right:-8,bottom:0,animation:"zt-bob 3s ease-in-out infinite"}}>
                    <img src={IMG_DUO} alt="Nick & Judy" style={{height:155,objectFit:"contain",objectPosition:"bottom",filter:"drop-shadow(0 4px 16px rgba(0,0,0,.85))"}}/>
                  </div> */}
                  <div style={{position:"absolute",inset:0,pointerEvents:"none",animation:"zt-sirens 2s ease-in-out infinite",background:"linear-gradient(135deg,rgba(67,97,238,.07),transparent,rgba(232,93,4,.05))"}}/>
                </div>

                <div style={{padding:"20px 26px 0"}}>
                  <Reveal from="fade" delay={0.15}>
                    <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:12,marginBottom:12}}>
                      <div style={{flex:1,height:".7px",background:`linear-gradient(to right,transparent,${C.orange})`,opacity:.4}}/>
                      <ZPDBadge size={40}/>
                      <div style={{flex:1,height:".7px",background:`linear-gradient(to left,transparent,${C.orange})`,opacity:.4}}/>
                    </div>
                    <p style={{fontFamily:F.badge,fontSize:9,letterSpacing:".62em",textTransform:"uppercase",color:C.orange,margin:"0 0 12px",opacity:.9}}>Zootropolis · Invitație Oficială</p>
                  </Reveal>

                  {p.showWelcomeText&&(
                    <Reveal from="bottom" delay={0.2}>
                      <InlineEdit tag="p" editMode={editMode} value={p.welcomeText} onChange={v=>upProfile("welcomeText",v)}
                        style={{fontFamily:F.body,fontSize:13,fontWeight:700,fontStyle:"italic",color:"rgba(144,224,239,.6)",margin:"0 0 12px",lineHeight:1.7}}/>
                    </Reveal>
                  )}

                  <Reveal from="bottom" delay={0.25}>
                    {!isWedding?(
                      <InlineEdit tag="h1" editMode={editMode} value={p.partner1Name||"Prenume"} onChange={v=>upProfile("partner1Name",v)}
                        style={{fontFamily:F.display,fontWeight:900,fontSize:"clamp(32px,8vw,50px)",color:C.white,margin:"0 0 4px",lineHeight:1.05,letterSpacing:3,textShadow:"0 0 28px rgba(232,93,4,.4),0 2px 0 rgba(0,0,0,.6)"}}/>
                    ):(
                      <div style={{margin:"0 0 4px"}}>
                        <InlineEdit tag="h1" editMode={editMode} value={p.partner1Name||"Prenume 1"} onChange={v=>upProfile("partner1Name",v)}
                          style={{fontFamily:F.display,fontWeight:900,fontSize:"clamp(26px,7vw,42px)",color:C.white,margin:0,lineHeight:1.1,letterSpacing:3,textShadow:"0 0 24px rgba(232,93,4,.35),0 2px 0 rgba(0,0,0,.6)"}}/>
                        <div style={{margin:"10px 0",display:"flex",alignItems:"center",gap:14,justifyContent:"center"}}>
                          <div style={{flex:1,height:".7px",background:`linear-gradient(to right,transparent,${C.orange})`,opacity:.5}}/>
                          <ZPDBadge size={28}/>
                          <div style={{flex:1,height:".7px",background:`linear-gradient(to left,transparent,${C.orange})`,opacity:.5}}/>
                        </div>
                        <InlineEdit tag="h1" editMode={editMode} value={p.partner2Name||"Prenume 2"} onChange={v=>upProfile("partner2Name",v)}
                          style={{fontFamily:F.display,fontWeight:900,fontSize:"clamp(26px,7vw,42px)",color:C.white,margin:0,lineHeight:1.1,letterSpacing:3,textShadow:"0 0 24px rgba(232,93,4,.35),0 2px 0 rgba(0,0,0,.6)"}}/>
                      </div>
                    )}
                  </Reveal>

                  {p.showCelebrationText&&(
                    <Reveal from="bottom" delay={0.3}>
                      <InlineEdit tag="p" editMode={editMode} value={p.celebrationText} onChange={v=>upProfile("celebrationText",v)}
                        style={{fontFamily:F.body,fontSize:13,fontWeight:700,fontStyle:"italic",color:"rgba(144,224,239,.5)",margin:"10px 0 0",lineHeight:1.7}}/>
                    </Reveal>
                  )}

                  <div style={{margin:"22px 0",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{flex:1,height:".7px",background:`linear-gradient(to right,transparent,${C.steelLight})`,opacity:.45}}/>
                    <span style={{color:"rgba(67,97,238,.55)",fontSize:12}}>✦</span>
                    <div style={{flex:1,height:".7px",background:`linear-gradient(to left,transparent,${C.steelLight})`,opacity:.45}}/>
                  </div>

                  {/* DATE — exact reference */}
                  <Reveal from="bottom" delay={0.35}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:14,marginBottom:24}}>
                      <div style={{textAlign:"right"}}>
                        <p style={{fontFamily:F.badge,fontSize:8,letterSpacing:".4em",textTransform:"uppercase",color:"rgba(232,93,4,.75)",margin:"0 0 2px"}}>{displayMonth}</p>
                        <p style={{fontFamily:F.badge,fontSize:8,letterSpacing:".3em",color:"rgba(232,93,4,.45)",margin:0}}>{displayYear}</p>
                      </div>
                      <div style={{width:66,height:66,borderRadius:"50%",background:`radial-gradient(circle at 38% 35%,${C.steel},${C.city})`,border:`2.5px solid ${C.orange}`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",boxShadow:"0 0 22px rgba(232,93,4,.4),0 4px 16px rgba(0,0,0,.6)",animation:"zt-pulse 3s ease-in-out infinite"}}>
                        <div style={{position:"absolute",inset:5,border:"1px solid rgba(232,93,4,.3)",borderRadius:"50%"}}/>
                        <span style={{fontFamily:F.display,fontWeight:900,fontSize:22,color:C.white,lineHeight:1,textShadow:"0 0 10px rgba(232,93,4,.5)"}}>{displayDay}</span>
                      </div>
                      <div style={{textAlign:"left"}}>
                        <p style={{fontFamily:F.body,fontSize:12,fontStyle:"italic",color:"rgba(144,224,239,.45)",margin:0,lineHeight:1.5,textTransform:"capitalize"}}>{displayWeekday}</p>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal from="bottom" delay={0.4}>
                    <Countdown targetDate={p.weddingDate}/>
                  </Reveal>

                  <div style={{margin:"22px 0 18px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{flex:1,height:".7px",background:`linear-gradient(to right,transparent,${C.orange})`,opacity:.35}}/>
                    <ZPDBadge size={30}/>
                    <div style={{flex:1,height:".7px",background:`linear-gradient(to left,transparent,${C.orange})`,opacity:.35}}/>
                  </div>

                  {/* GUEST */}
                  <Reveal from="bottom" delay={0.45}>
                    <div style={{padding:"16px 20px",background:"rgba(27,40,56,.4)",border:"1.5px solid rgba(232,93,4,.22)",borderLeft:`4px solid ${C.orange}`,borderRadius:10,position:"relative"}}>
                      <p style={{fontFamily:F.badge,fontSize:8,letterSpacing:".55em",textTransform:"uppercase",color:"rgba(232,93,4,.55)",margin:"0 0 6px"}}>🐾 Invitație pentru</p>
                      <p style={{fontFamily:F.display,fontWeight:900,fontSize:19,color:C.white,margin:0,letterSpacing:1.5,textShadow:"0 0 16px rgba(232,93,4,.3)"}}>{guest?.name||"Invitatul Special"}</p>
                    </div>
                  </Reveal>
                </div>
              </div>
            </Reveal>
          </BlockStyleProvider>

          {/* ── BLOCKS ── */}
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {editMode&&<InsertBlockButton insertIdx={-1} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt} BLOCK_TYPES={BLOCK_TYPES} onInsert={(t,d)=>handleInsertAt(-1,t,d)}/>}

            {blocks.filter(b=>editMode||b.show!==false).map((block,idx)=>(
              <div key={block.id} style={{position:"relative"}}>
                {editMode&&<BlockToolbar onUp={()=>movBlock(idx,-1)} onDown={()=>movBlock(idx,1)} onToggle={()=>updBlock(idx,{show:!block.show})} onDelete={()=>delBlock(idx)} visible={block.show!==false} isFirst={idx===0} isLast={idx===blocks.length-1}/>}

                <div style={{position:"relative",padding:"6px 0",opacity:block.show===false?.4:1}} onClick={editMode?()=>onBlockSelect?.(block,idx):undefined}>
                  <BlockStyleProvider value={{blockId:block.id,textStyles:(block as any).textStyles,onTextSelect:(k,l)=>onBlockSelect?.(block,idx,k,l)}}>

                    {editMode&&block.show===false&&(
                      <div style={{position:"absolute",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:18,pointerEvents:"none"}}>
                        <div style={{position:"absolute",inset:0,borderRadius:18,background:"rgba(0,0,0,.25)",backdropFilter:"blur(2px)"}}/>
                        <div style={{position:"relative",zIndex:10}}><EyeOff size={22} color={"rgba(144,224,239,.5)"}/></div>
                      </div>
                    )}

                    {/* divider */}
                    {block.type==="divider"&&(
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{flex:1,height:".7px",background:`linear-gradient(to right,transparent,${C.steelLight})`,opacity:.4}}/>
                        <ZPDBadge size={28}/>
                        <div style={{flex:1,height:".7px",background:`linear-gradient(to left,transparent,${C.steelLight})`,opacity:.4}}/>
                      </div>
                    )}

                    {/* rsvp */}
                    {block.type==="rsvp"&&(
                      <button type="button" onClick={()=>!editMode&&onOpenRSVP?.()}
                        style={{width:"100%",padding:"20px",background:`linear-gradient(135deg,${C.orange},#C44B00)`,border:"none",borderRadius:50,cursor:"pointer",fontFamily:F.display,fontSize:14,fontWeight:900,color:C.white,letterSpacing:3,textTransform:"uppercase",boxShadow:"0 6px 28px rgba(232,93,4,.55),0 0 0 3px rgba(232,93,4,.2)",transition:"all .25s",position:"relative",overflow:"hidden"}}
                        onMouseEnter={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.transform="scale(1.04)";b.style.boxShadow="0 10px 40px rgba(232,93,4,.7),0 0 0 5px rgba(232,93,4,.3)";}}
                        onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.transform="scale(1)";b.style.boxShadow="0 6px 28px rgba(232,93,4,.55),0 0 0 3px rgba(232,93,4,.2)";}}>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)",backgroundSize:"200% 100%",animation:"zt-shimmer 2s linear infinite",borderRadius:50}}/>
                        <span style={{position:"relative"}}>
                          <InlineEdit editMode={editMode} value={`🐾 ${block.label||"Confirmă Prezența"} 🐾`} onChange={v=>updBlock(idx,{label:v.replace(/🐾/g,"").trim()})}/>
                        </span>
                      </button>
                    )}

                    {/* photo */}
                    {block.type==="photo"&&(
                      <Reveal>
                        <div onClick={editMode?()=>onBlockSelect?.(block,idx):undefined} style={editMode?{cursor:"pointer",outline:selectedBlockId===block.id?`2px solid ${C.orange}`:"none",outlineOffset:4,borderRadius:16}:undefined}>
                          <PhotoBlock block={block} editMode={editMode} onUpdate={p=>updBlock(idx,p)} placeholderInitial={babyName[0]}/>
                        </div>
                      </Reveal>
                    )}

                    {/* text */}
                    {block.type==="text"&&(
                      <Reveal>
                        <div style={{...getSectionStyle()}}>
                          <div style={scanlines}/>
                          <div style={{position:"relative",zIndex:1}}>
                            <InlineEdit editMode={editMode} value={block.content||""} onChange={v=>updBlock(idx,{content:v})} multiline
                              style={{fontFamily:F.body,fontSize:13,fontWeight:600,fontStyle:"italic",color:"rgba(144,224,239,.7)",margin:0,lineHeight:1.85,textAlign:"center"}}/>
                          </div>
                        </div>
                      </Reveal>
                    )}

                    {/* location */}
                    {block.type==="location"&&(
                      <Reveal from="left">
                        <LocCard block={block} editMode={editMode} onUpdate={p=>updBlock(idx,p)}/>
                      </Reveal>
                    )}

                    {/* calendar */}
                    {block.type==="calendar"&&(
                      <Reveal>
                        <div style={{...getSectionStyle()}}>
                          <div style={scanlines}/>
                          <div style={{position:"relative",zIndex:1}}><CalendarMonth date={p.weddingDate}/></div>
                        </div>
                      </Reveal>
                    )}

                    {/* countdown */}
                    {block.type==="countdown"&&(
                      <Reveal>
                        <div style={{...getSectionStyle()}}>
                          <div style={scanlines}/>
                          <div style={{position:"relative",zIndex:1}}><Countdown targetDate={p.weddingDate}/></div>
                        </div>
                      </Reveal>
                    )}

                    {/* timeline */}
                    {block.type==="timeline"&&(()=>{
                      const items=getTimelineItems();
                      if(!items.length&&!editMode)return null;
                      return(
                        <Reveal>
                          <div style={{...getSectionStyle()}}>
                            <div style={scanlines}/>
                            <div style={{position:"relative",zIndex:1}}>
                              <p style={{fontFamily:F.badge,fontSize:9,letterSpacing:".55em",textTransform:"uppercase",color:C.orange,textAlign:"center",margin:"0 0 18px",opacity:.9}}>🐾 Programul Zilei</p>
                              {!items.length&&editMode&&<p style={{fontFamily:F.body,fontSize:12,fontStyle:"italic",color:"rgba(144,224,239,.4)",textAlign:"center",margin:"0 0 14px"}}>Adaugă primul moment al zilei</p>}
                              <div style={{display:"flex",flexDirection:"column"}}>
                                {items.map((item:any,i:number)=>(
                                  <div key={item.id} style={{display:"grid",gridTemplateColumns:"58px 22px 1fr auto",alignItems:"stretch",minHeight:44}}>
                                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"flex-end",paddingRight:12,paddingTop:4}}>
                                      <InlineEdit editMode={editMode} value={item.time||""} onChange={v=>updateTimelineItem(item.id,{time:v})} style={{fontFamily:F.badge,fontSize:11,color:C.orange,letterSpacing:.5,opacity:.9}}/>
                                    </div>
                                    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                                      <div style={{width:12,height:12,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${C.orangeLight},${C.orange})`,marginTop:5,flexShrink:0,boxShadow:"0 0 8px rgba(232,93,4,.5)"}}/>
                                      {i<items.length-1&&<div style={{flex:1,width:"1px",marginTop:3,background:"linear-gradient(to bottom,rgba(232,93,4,.4),transparent)"}}/>}
                                    </div>
                                    <div style={{paddingLeft:12,paddingTop:2,paddingBottom:i<items.length-1?18:0}}>
                                      <InlineEdit editMode={editMode} value={item.title||""} onChange={v=>updateTimelineItem(item.id,{title:v})} placeholder="Moment..." style={{fontFamily:F.body,fontSize:13,fontWeight:700,fontStyle:"italic",color:"rgba(144,224,239,.7)"}}/>
                                    </div>
                                    {editMode&&<button type="button" onClick={e=>{e.stopPropagation();removeTimelineItem(item.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(144,224,239,.35)",fontSize:12,padding:"4px 2px",alignSelf:"flex-start",lineHeight:1}}>✕</button>}
                                  </div>
                                ))}
                              </div>
                              {editMode&&<button type="button" onClick={e=>{e.stopPropagation();addTimelineItem();}} style={{marginTop:14,width:"100%",background:"rgba(43,65,98,.4)",border:"1px dashed rgba(67,97,238,.3)",borderRadius:10,padding:"8px 0",cursor:"pointer",fontFamily:F.badge,fontSize:9,letterSpacing:".3em",textTransform:"uppercase",color:"rgba(144,224,239,.5)"}}>+ Adaugă moment</button>}
                            </div>
                          </div>
                        </Reveal>
                      );
                    })()}

                    {/* music */}
                    {block.type==="music"&&<Reveal><MusicBlock block={block} editMode={editMode} onUpdate={p=>updBlock(idx,p)} imperativeRef={musicPlayRef}/></Reveal>}

                    {/* gift */}
                    {block.type==="gift"&&(
                      <Reveal>
                        <div style={{...getSectionStyle()}}>
                          <div style={scanlines}/>
                          <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
                            <ZPDBadge size={44} style={{display:"block",margin:"0 auto 12px",animation:"zt-badgeGlow 2.5s ease-in-out infinite"}}/>
                            <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle||"Sugestie de cadou"} onChange={v=>updBlock(idx,{sectionTitle:v})} style={{fontFamily:F.display,fontSize:17,fontWeight:900,color:C.white,marginBottom:8,letterSpacing:2}}/>
                            <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v=>updBlock(idx,{content:v})} multiline style={{fontFamily:F.body,fontSize:12,fontStyle:"italic",color:"rgba(144,224,239,.6)",lineHeight:1.65}}/>
                            {(block.iban||editMode)&&(
                              <div style={{marginTop:12,padding:"10px 14px",background:"rgba(27,40,56,.5)",borderRadius:10,border:"1px solid rgba(67,97,238,.3)",borderLeft:`3px solid ${C.orange}`}}>
                                <InlineEdit tag="p" editMode={editMode} value={block.iban||""} onChange={v=>updBlock(idx,{iban:v})} placeholder="IBAN..." style={{fontFamily:F.badge,fontSize:10,color:C.orangePale,letterSpacing:2}}/>
                              </div>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    )}

                    {/* whatsapp */}
                    {block.type==="whatsapp"&&(
                      <Reveal>
                        <div style={{textAlign:"center"}}>
                          <a href={`https://wa.me/${(block.content||"").replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                            style={{display:"inline-flex",alignItems:"center",gap:12,padding:"14px 24px",borderRadius:14,...getSectionStyle(),textDecoration:"none"}}>
                            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#25D366,#128C7E)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(37,211,102,.4)",flexShrink:0}}>
                              <MessageCircle style={{width:22,height:22,color:"white"}}/>
                            </div>
                            <div style={{textAlign:"left"}}>
                              <InlineEdit tag="p" editMode={editMode} value={block.label||"Contact WhatsApp"} onChange={v=>updBlock(idx,{label:v})} style={{fontFamily:F.display,fontWeight:900,fontSize:13,color:C.white,margin:0,letterSpacing:1}}/>
                              <p style={{fontFamily:F.body,fontSize:10,color:"rgba(144,224,239,.45)",margin:0}}>Răspundem rapid 🐰</p>
                            </div>
                          </a>
                          {editMode&&(
                            <div style={{display:"flex",alignItems:"center",gap:8,...getSectionStyle(),justifyContent:"center",padding:"8px 16px",borderRadius:10,marginTop:8}}>
                              <span style={{fontFamily:F.badge,fontSize:9,letterSpacing:".3em",textTransform:"uppercase",color:"rgba(144,224,239,.4)"}}>Număr:</span>
                              <InlineEdit tag="span" editMode={editMode} value={block.content||"0700000000"} onChange={v=>updBlock(idx,{content:v})} style={{fontFamily:F.label,fontSize:".9rem",color:C.white,fontWeight:700}}/>
                            </div>
                          )}
                        </div>
                      </Reveal>
                    )}

                    {/* family */}
                    {block.type==="family"&&(()=>{
                      const members:{name1:string;name2:string}[]=safeJSON(block.members,[]);
                      const updateMembers=(nm:{name1:string;name2:string}[])=>updBlock(idx,{members:JSON.stringify(nm)} as any);
                      return(
                        <Reveal>
                          <div style={{...getSectionStyle()}}>
                            <div style={scanlines}/>
                            <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
                              <InlineEdit editMode={editMode} value={block.label||"Părinții"} onChange={v=>updBlock(idx,{label:v})} style={{fontFamily:F.badge,fontSize:9,letterSpacing:".55em",textTransform:"uppercase",color:C.orange,margin:"0 0 14px",opacity:.9,display:"block"}}/>
                              <InlineEdit editMode={editMode} value={block.content||"Cu drag și recunoștință"} onChange={v=>updBlock(idx,{content:v})} style={{fontFamily:F.body,fontSize:12,fontStyle:"italic",color:"rgba(144,224,239,.45)",margin:"0 0 16px",display:"block"}}/>
                              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                                {members.map((m,mi)=>(
                                  <div key={mi}>
                                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
                                      <InlineEdit tag="span" editMode={editMode} value={m.name1} onChange={v=>{const nm=[...members];nm[mi]={...nm[mi],name1:v};updateMembers(nm);}} style={{fontFamily:F.body,fontSize:17,fontWeight:800,color:"rgba(144,224,239,.85)",letterSpacing:1.5}}/>
                                      <span style={{color:C.orange,margin:"0 10px",fontSize:16}}>&amp;</span>
                                      <InlineEdit tag="span" editMode={editMode} value={m.name2} onChange={v=>{const nm=[...members];nm[mi]={...nm[mi],name2:v};updateMembers(nm);}} style={{fontFamily:F.body,fontSize:17,fontWeight:800,color:"rgba(144,224,239,.85)",letterSpacing:1.5}}/>
                                      {editMode&&members.length>1&&<button type="button" onClick={()=>updateMembers(members.filter((_,i)=>i!==mi))} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(144,224,239,.35)",fontSize:13,lineHeight:1}}>✕</button>}
                                    </div>
                                    {mi<members.length-1&&<div style={{height:".7px",margin:"8px 32px",background:"linear-gradient(to right,transparent,rgba(67,97,238,.3),transparent)"}}/>}
                                  </div>
                                ))}
                              </div>
                              {editMode&&<button type="button" onClick={()=>updateMembers([...members,{name1:"Nume 1",name2:"Nume 2"}])} style={{marginTop:16,background:"rgba(43,65,98,.5)",border:"1px dashed rgba(67,97,238,.4)",borderRadius:99,padding:"5px 18px",cursor:"pointer",fontFamily:F.badge,fontSize:9,letterSpacing:".3em",textTransform:"uppercase",color:"rgba(144,224,239,.5)"}}>+ Adaugă</button>}
                            </div>
                          </div>
                        </Reveal>
                      );
                    })()}

                    {/* date */}
                    {block.type==="date"&&(
                      <Reveal>
                        <div style={{textAlign:"center",padding:"4px 0"}}>
                          <p style={{fontFamily:F.badge,letterSpacing:".4em",fontSize:".85rem",color:C.orange,margin:0,opacity:.9}}>
                            {p.weddingDate?new Date(p.weddingDate).toLocaleDateString("ro-RO",{day:"numeric",month:"long",year:"numeric"}):"Data Evenimentului"}
                          </p>
                        </div>
                      </Reveal>
                    )}

                    {/* description */}
                    {block.type==="description"&&(
                      <Reveal>
                        <div style={{textAlign:"center",padding:"0 16px"}}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v=>updBlock(idx,{content:v})} style={{fontFamily:F.body,fontSize:".9rem",fontStyle:"italic",color:"rgba(144,224,239,.5)",lineHeight:1.75,margin:0}}/>
                        </div>
                      </Reveal>
                    )}

                  </BlockStyleProvider>
                </div>
                {editMode&&<InsertBlockButton insertIdx={idx} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt} BLOCK_TYPES={BLOCK_TYPES} onInsert={(t,d)=>handleInsertAt(idx,t,d)}/>}
              </div>
            ))}
          </div>

          {/* Reset */}
          {editMode&&(
            <div style={{marginTop:24,textAlign:"center"}}>
              <button onClick={resetToDefaults} style={{padding:"10px 24px",background:"rgba(13,27,42,.9)",border:"1px solid rgba(67,97,238,.3)",borderRadius:99,fontFamily:F.badge,fontSize:10,letterSpacing:".3em",textTransform:"uppercase",color:"rgba(144,224,239,.45)",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Resetează la valorile implicite
              </button>
            </div>
          )}

          {/* FOOTER — exact reference */}
          <Reveal from="fade" delay={0.1}>
            <div style={{marginTop:28,textAlign:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <div style={{flex:1,height:".7px",background:`linear-gradient(to right,transparent,${C.steelLight})`,opacity:.4}}/>
                <ZPDBadge size={34}/>
                <div style={{flex:1,height:".7px",background:`linear-gradient(to left,transparent,${C.steelLight})`,opacity:.4}}/>
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:10}}>
                <div style={{animation:"zt-float 3.5s ease-in-out infinite"}}>
                  <img src={IMG_NICK} alt="Nick" style={{height:70,objectFit:"contain",filter:"drop-shadow(0 4px 14px rgba(232,93,4,.35)) brightness(.9)"}}/>
                </div>
                <div style={{animation:"zt-bob 3s .4s ease-in-out infinite"}}>
                  <img src={IMG_JUDY} alt="Judy" style={{height:70,objectFit:"contain",filter:"drop-shadow(0 4px 14px rgba(67,97,238,.35)) brightness(.9)"}}/>
                </div>
              </div>
              <p style={{fontFamily:F.badge,fontSize:9,letterSpacing:".45em",textTransform:"uppercase",color:"rgba(232,93,4,.3)",margin:0}}>Zootropolis · Departamentul Petrecerilor · {displayYear}</p>
            </div>
          </Reveal>

        </div>
        
      </div>
    </div>
  );
};

export default ZootropolisTemplate;