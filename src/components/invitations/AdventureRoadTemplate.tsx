import React, { useState, useEffect, useRef, useCallback } from "react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";
import { getAdventureTheme } from "./castleDefaults";
import { TimelineInsertButton } from "./TimelineInsertButton";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload, Camera,
  Play, Pause, SkipForward, SkipBack, Gift, Music, MessageCircle, Sparkles
} from "lucide-react";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";

export const meta: TemplateMeta = {
  id: 'adventure-road',
  name: 'Adventure Road',
  category: 'baptism',
  description: 'Mașinuțe, avioane și trenuri — aventura vieții începe azi! Tema băiețel.',
  colors: ['#1e3a5f', '#e8f4fd', '#f59e0b'],
  previewClass: "bg-sky-900 border-sky-500",
  elementsClass: "bg-yellow-400"
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const API_URL = (typeof window !== "undefined" && (window as any).__API_URL__) ||
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3005/api";
function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith('/uploads/')) return;
  const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  fetch(`${API_URL}/upload`, { method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_s?.token || ''}` },
    body: JSON.stringify({ url }) }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme color state (module level, updated at render)
// ─────────────────────────────────────────────────────────────────────────────

let C = {
  navyDark : "#0c2340",
  navyMid  : "#1e3a5f",
  sky      : "#0ea5e9",
  skyLight : "#7dd3fc",
  skyPale  : "#e0f2fe",
  cream    : "#f0f9ff",
  text     : "#e2e8f0",
  muted    : "rgba(148,163,184,0.8)",
  gold     : "#f59e0b",
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG VEHICLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const CarSVG: React.FC<{ x:number; y:number; scale?:number; color?:string; flip?:boolean }> =
  ({ x, y, scale=1, color="#e85d04", flip }) => (
  <g transform={`translate(${x},${y}) scale(${flip?-scale:scale},${scale})`}>
    {/* body */}
    <rect x="-28" y="-14" width="56" height="22" rx="8" fill={color}/>
    {/* roof */}
    <rect x="-16" y="-26" width="32" height="16" rx="6" fill={color} opacity="0.85"/>
    {/* windows */}
    <rect x="-13" y="-24" width="12" height="11" rx="3" fill="#bfdbfe" opacity="0.9"/>
    <rect x="1"   y="-24" width="12" height="11" rx="3" fill="#bfdbfe" opacity="0.9"/>
    {/* wheels */}
    <circle cx="-16" cy="10" r="8"  fill="#1e293b"/>
    <circle cx="16"  cy="10" r="8"  fill="#1e293b"/>
    <circle cx="-16" cy="10" r="4"  fill="#94a3b8"/>
    <circle cx="16"  cy="10" r="4"  fill="#94a3b8"/>
    {/* headlight */}
    <ellipse cx={flip?-26:26} cy="-4" rx="4" ry="3" fill="#fde68a" opacity="0.9"/>
    {/* exhaust puff */}
    {flip && <>
      <circle cx="32"  cy="2" r="3" fill="white" opacity="0.3"/>
      <circle cx="37"  cy="0" r="2" fill="white" opacity="0.2"/>
    </>}
  </g>
);

const PlaneSVG: React.FC<{ x:number; y:number; scale?:number; color?:string; flip?:boolean }> =
  ({ x, y, scale=1, color="#3b82f6", flip }) => (
  <g transform={`translate(${x},${y}) scale(${flip?-scale:scale},${scale})`}>
    {/* fuselage */}
    <ellipse cx="0" cy="0" rx="32" ry="10" fill={color}/>
    {/* nose cone */}
    <path d="M28,-4 Q40,0 28,4 Z" fill={color}/>
    {/* main wing */}
    <path d="M-5,-8 L-20,-28 L8,-28 L18,-8 Z" fill={color} opacity="0.8"/>
    <path d="M-5, 8 L-20, 28 L8, 28 L18, 8 Z" fill={color} opacity="0.8"/>
    {/* tail fin */}
    <path d="M-28,-8 L-38,-22 L-20,-8 Z" fill={color} opacity="0.85"/>
    {/* tail horiz */}
    <path d="M-24,-4 L-36,2 L-24,6 Z" fill={color} opacity="0.7"/>
    {/* windows */}
    {[-8,-2,4,10].map((wx,i) => (
      <circle key={i} cx={wx} cy="0" r="3.5" fill="#bfdbfe" opacity="0.9"/>
    ))}
    {/* engine */}
    <ellipse cx="0" cy="-18" rx="5" ry="3.5" fill="#1d4ed8" opacity="0.8"/>
    {/* contrail */}
    {!flip && <>
      <ellipse cx="-38" cy="0" rx="6" ry="2.5" fill="white" opacity="0.4"/>
      <ellipse cx="-48" cy="0" rx="4" ry="2"   fill="white" opacity="0.25"/>
      <ellipse cx="-56" cy="0" rx="3" ry="1.5" fill="white" opacity="0.15"/>
    </>}
  </g>
);

const TrainSVG: React.FC<{ x:number; y:number; scale?:number }> =
  ({ x, y, scale=1 }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    {/* locomotive body */}
    <rect x="-40" y="-18" width="44" height="26" rx="6" fill="#16a34a"/>
    {/* cab */}
    <rect x="-40" y="-30" width="20" height="18" rx="4" fill="#15803d"/>
    {/* chimney */}
    <rect x="-32" y="-38" width="8" height="12" rx="3" fill="#166534"/>
    <ellipse cx="-28" cy="-38" rx="7" ry="4" fill="#166534"/>
    {/* smoke puffs */}
    <circle cx="-28" cy="-46" r="5"  fill="white" opacity="0.35"/>
    <circle cx="-22" cy="-52" r="4"  fill="white" opacity="0.25"/>
    <circle cx="-34" cy="-50" r="3"  fill="white" opacity="0.2"/>
    {/* window */}
    <rect x="-37" y="-27" width="12" height="10" rx="3" fill="#bfdbfe" opacity="0.9"/>
    {/* boiler */}
    <ellipse cx="2" cy="-5" rx="18" ry="12" fill="#15803d"/>
    {/* wheels */}
    <circle cx="-28" cy="10" r="9"  fill="#1e293b"/>
    <circle cx="-28" cy="10" r="5"  fill="#64748b"/>
    <circle cx="-8"  cy="10" r="7"  fill="#1e293b"/>
    <circle cx="-8"  cy="10" r="4"  fill="#64748b"/>
    <circle cx="8"   cy="10" r="7"  fill="#1e293b"/>
    <circle cx="8"   cy="10" r="4"  fill="#64748b"/>
    {/* carriage */}
    <rect x="6"  y="-14" width="34" height="22" rx="4" fill="#dc2626" opacity="0.9"/>
    <rect x="10" y="-20" width="26" height="10" rx="3" fill="#b91c1c"/>
    {[14,24,32].map((wx,i) => (
      <rect key={i} x={wx} y="-18" width="8" height="7" rx="2" fill="#bfdbfe" opacity="0.9"/>
    ))}
    <circle cx="16" cy="10" r="6"  fill="#1e293b"/>
    <circle cx="16" cy="10" r="3"  fill="#64748b"/>
    <circle cx="32" cy="10" r="6"  fill="#1e293b"/>
    <circle cx="32" cy="10" r="3"  fill="#64748b"/>
    {/* coupling */}
    <rect x="3" y="-2" width="6" height="4" rx="1" fill="#475569"/>
    {/* cowcatcher */}
    <path d="M-42,4 L-50,10 L-40,10 Z" fill="#166534"/>
    <rect x="-52" y="10" width="94" height="4" rx="2" fill="#374151" opacity="0.6"/>
  </g>
);

const RocketSVG: React.FC<{ x:number; y:number; scale?:number }> =
  ({ x, y, scale=1 }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    {/* body */}
    <ellipse cx="0" cy="0" rx="10" ry="28" fill="#e0e7ff"/>
    {/* nose */}
    <path d="M-10,-22 Q0,-42 10,-22 Z" fill="#6366f1"/>
    {/* window */}
    <circle cx="0" cy="-8" r="7" fill="#bfdbfe" opacity="0.9"/>
    <circle cx="0" cy="-8" r="5" fill="#93c5fd"/>
    {/* fins */}
    <path d="M-10,14 L-22,30 L-10,22 Z" fill="#6366f1" opacity="0.9"/>
    <path d="M10, 14 L22, 30 L10, 22 Z" fill="#6366f1" opacity="0.9"/>
    {/* exhaust */}
    <ellipse cx="0" cy="32" rx="7"  ry="5"  fill="#fbbf24" opacity="0.9"/>
    <ellipse cx="0" cy="38" rx="5"  ry="7"  fill="#f97316" opacity="0.7"/>
    <ellipse cx="0" cy="44" rx="3"  ry="6"  fill="#ef4444" opacity="0.5"/>
    <ellipse cx="-4" cy="36" rx="3" ry="5"  fill="#fde68a" opacity="0.6"/>
    <ellipse cx="4"  cy="36" rx="3" ry="5"  fill="#fde68a" opacity="0.6"/>
    {/* stars around rocket */}
    {[[-18,-14],[18,-14],[-20,2],[20,2]].map(([sx,sy],i) => (
      <path key={i} d={`M${sx},${sy} L${sx+2},${sy-4} L${sx+4},${sy} L${sx},${sy+1.5} L${sx+4},${sy+3} Z`}
        fill="#fde68a" opacity="0.7" transform={`scale(0.7) translate(${-sx*0.3},${-sy*0.3})`}/>
    ))}
  </g>
);

const HelicopterSVG: React.FC<{ x:number; y:number; scale?:number; color?:string }> =
  ({ x, y, scale=1, color="#f97316" }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    {/* main rotor */}
    <rect x="-30" y="-24" width="60" height="5" rx="2.5" fill="#475569" opacity="0.8"
      style={{ animation:"ar-rotor 0.4s linear infinite", transformOrigin:"0px -21px" }}/>
    {/* rotor hub */}
    <circle cx="0" cy="-21" r="4" fill="#374151"/>
    {/* body */}
    <path d="M-20,-18 Q-22,0 -18,12 Q0,18 18,12 Q22,0 20,-18 Z" fill={color}/>
    {/* cockpit bubble */}
    <path d="M-16,-18 Q-18,-4 -14,8 Q0,14 14,8 Q18,-4 16,-18 Z" fill="#bfdbfe" opacity="0.5"/>
    {/* windows */}
    <ellipse cx="-6"  cy="-8" rx="6"  ry="8" fill="#bfdbfe" opacity="0.85"/>
    <ellipse cx="8"   cy="-8" rx="5"  ry="8" fill="#bfdbfe" opacity="0.85"/>
    {/* tail boom */}
    <path d="M20,0 Q35,-2 42,-6 Q38,-2 35,4 Q28,4 20,2 Z" fill={color} opacity="0.85"/>
    {/* tail rotor */}
    <ellipse cx="42" cy="-6" rx="2"  ry="8" fill="#475569" opacity="0.7"/>
    {/* skids */}
    <path d="M-18,14 Q0,18 18,14" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <line x1="-10" y1="12" x2="-14" y2="17" stroke="#374151" strokeWidth="2"/>
    <line x1="10"  y1="12" x2="14"  y2="17" stroke="#374151" strokeWidth="2"/>
  </g>
);

// ─────────────────────────────────────────────────────────────────────────────
// INTRO — mașinuța intră din dreapta, avionul zboară, racheta decolează
// ─────────────────────────────────────────────────────────────────────────────

const RoadIntro: React.FC<{ initial:string; name:string; onDone:()=>void }> = ({ initial, name, onDone }) => {
  const [phase, setPhase] = useState(0);
  // 0→1 sky+road | 2 plane flies in | 3 car drives in | 4 rocket launches | 5 initial pops | 6 name | 7 hold | 8 fade

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => setPhase(4), 1500),
      setTimeout(() => setPhase(5), 1900),
      setTimeout(() => setPhase(6), 2400),
      setTimeout(() => setPhase(7), 3100),
      setTimeout(() => setPhase(8), 3700),
      setTimeout(onDone, 4400),
    ];
    return () => t.forEach(clearTimeout);
  }, [onDone]);

  const display = "'Baloo 2','Nunito',system-ui,sans-serif";
  const serif   = "'Cormorant Garamond',Georgia,serif";

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      overflow:"hidden",
      background: phase>=1
        ? "linear-gradient(180deg,#0ea5e9 0%,#38bdf8 30%,#7dd3fc 60%,#e0f2fe 100%)"
        : "#0c4a6e",
      transition:"background 0.8s",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      opacity: phase===8 ? 0 : 1,
      ...(phase===8 ? { transition:"opacity 0.7s ease-in-out" } : {}),
      pointerEvents: phase===8 ? "none" : "auto",
    }}>

      {/* Clouds */}
      {[[8,12],[35,8],[65,15],[82,10]].map(([cx,cy],i) => (
        <div key={i} style={{
          position:"absolute", left:`${cx}%`, top:`${cy}%`,
          opacity: phase>=1 ? 1 : 0,
          transform: phase>=1 ? "translateY(0)" : "translateY(-20px)",
          transition:`opacity 0.6s ${i*0.15}s, transform 0.6s ${i*0.15}s`,
          pointerEvents:"none",
        }}>
          <svg width="100" height="50" viewBox="0 0 100 50" fill="none">
            <ellipse cx="50" cy="35" rx="45" ry="20" fill="white" opacity="0.7"/>
            <ellipse cx="30" cy="28" rx="28" ry="18" fill="white" opacity="0.65"/>
            <ellipse cx="65" cy="25" rx="24" ry="16" fill="white" opacity="0.6"/>
            <ellipse cx="48" cy="20" rx="18" ry="14" fill="white" opacity="0.7"/>
          </svg>
        </div>
      ))}

      {/* Sun */}
      <div style={{
        position:"absolute", top:20, right:40,
        opacity: phase>=1 ? 1 : 0,
        transition:"opacity 0.8s 0.2s",
        pointerEvents:"none",
      }}>
        <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
          {Array.from({length:10},(_,i) => {
            const a = (i/10)*2*Math.PI - Math.PI/2;
            return <line key={i}
              x1={35+Math.cos(a)*20} y1={35+Math.sin(a)*20}
              x2={35+Math.cos(a)*30} y2={35+Math.sin(a)*30}
              stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>;
          })}
          <circle cx="35" cy="35" r="16" fill="#fbbf24"/>
          <circle cx="35" cy="35" r="22" fill="#fbbf24" opacity="0.12"/>
        </svg>
      </div>

      {/* Plane flying across */}
      <div style={{
        position:"absolute", top:"22%",
        left: phase>=2 ? "calc(100% - 80px)" : "-120px",
        transition:"left 1.4s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents:"none",
      }}>
        <svg width="100" height="60" viewBox="-50 -30 100 60" fill="none">
          <PlaneSVG x={0} y={0} scale={0.7} color="#3b82f6"/>
        </svg>
      </div>

      {/* Helicopter hovering */}
      <div style={{
        position:"absolute", top:"28%", right: phase>=2 ? "5%" : "-120px",
        transition:"right 0.9s 0.3s cubic-bezier(0.34,1.2,0.64,1)",
        animation: phase>=2 ? "ar-hover 2.2s ease-in-out infinite" : "none",
        pointerEvents:"none",
      }}>
        <svg width="90" height="70" viewBox="-45 -35 90 70" fill="none">
          <HelicopterSVG x={0} y={0} scale={0.85} color="#f97316"/>
        </svg>
      </div>

      {/* Road */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        height:"28%",
        opacity: phase>=1 ? 1 : 0,
        transform: phase>=1 ? "translateY(0)" : "translateY(40px)",
        transition:"opacity 0.5s, transform 0.5s",
        pointerEvents:"none",
      }}>
        <svg viewBox="0 0 420 120" style={{ width:"100%", height:"100%" }} fill="none">
          {/* grass strip */}
          <rect width="420" height="30" y="0"  fill="#4ade80" opacity="0.5"/>
          <rect width="420" height="90" y="30" fill="#374151"/>
          {/* road lines */}
          {[0,60,120,180,240,300,360,420].map((lx,i) => (
            <rect key={i} x={lx+10} y="70" width="40" height="6" rx="3"
              fill="white" opacity="0.5"/>
          ))}
          {/* kerb */}
          <rect y="28" width="420" height="6" fill="#e5e7eb" opacity="0.3"/>
        </svg>
      </div>

      {/* Car driving in */}
      <div style={{
        position:"absolute",
        bottom:"17%",
        left: phase>=3 ? "calc(50% - 55px)" : "-140px",
        transition:"left 0.9s cubic-bezier(0.34,1.1,0.64,1)",
        pointerEvents:"none",
      }}>
        <svg width="110" height="60" viewBox="-55 -30 110 60" fill="none">
          <CarSVG x={0} y={5} scale={1.1} color="#e85d04"/>
        </svg>
      </div>

      {/* Train on bottom edge */}
      <div style={{
        position:"absolute",
        bottom:"2%",
        left: phase>=3 ? "calc(50% - 200px)" : "110%",
        transition:"left 1.1s 0.2s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents:"none",
      }}>
        <svg width="130" height="60" viewBox="-65 -30 130 60" fill="none">
          <TrainSVG x={0} y={5} scale={0.75}/>
        </svg>
      </div>

      {/* Rocket launching */}
      <div style={{
        position:"absolute",
        left:"50%", marginLeft:-30,
        bottom: phase>=4 ? "85%" : "45%",
        transition:"bottom 0.8s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents:"none",
      }}>
        <svg width="60" height="90" viewBox="-30 -45 60 90" fill="none">
          <RocketSVG x={0} y={0} scale={0.8}/>
        </svg>
      </div>

      {/* Initial badge — drops from rocket */}
      <div style={{
        position:"relative", zIndex:10,
        opacity:   phase>=5 ? 1 : 0,
        transform: phase>=5 ? "scale(1) translateY(0)" : "scale(0.3) translateY(-60px)",
        transition:"opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.34,1.5,0.64,1)",
        marginTop: -20,
      }}>
        <div style={{
          width:100, height:100,
          background:"linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#3b82f6 100%)",
          borderRadius:20,
          transform:"rotate(-8deg)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 12px 40px rgba(29,78,216,0.5), 0 2px 0 rgba(255,255,255,0.3) inset",
          border:"3px solid rgba(255,255,255,0.3)",
          position:"relative",
          overflow:"hidden",
        }}>
          {/* Checkered flag pattern inside */}
          <div style={{ position:"absolute", inset:0, opacity:0.08,
            backgroundImage:"repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)",
            backgroundSize:"12px 12px" }}/>
          <span style={{ fontFamily:display, fontSize:54, fontWeight:800,
            color:"white", lineHeight:1, position:"relative", zIndex:1,
            textShadow:"0 3px 12px rgba(0,0,0,0.3)" }}>
            {initial}
          </span>
        </div>
      </div>

      {/* Name */}
      <div style={{ marginTop:18, textAlign:"center", position:"relative", zIndex:10,
        opacity:   phase>=6 ? 1 : 0,
        transform: phase>=6 ? "translateY(0)" : "translateY(12px)",
        transition:"opacity 0.5s, transform 0.5s",
      }}>
        <p style={{ fontFamily:display, fontSize:26, fontWeight:800,
          color:"white", margin:0, letterSpacing:1,
          textShadow:"0 2px 12px rgba(0,0,0,0.2)" }}>
          {name}
        </p>
        <p style={{ fontFamily:serif, fontSize:13, fontStyle:"italic",
          color:"rgba(255,255,255,0.6)", marginTop:6, letterSpacing:2 }}>
          vă invită
        </p>
      </div>

      <style>{`
        @keyframes ar-hover  { 0%,100%{transform:translateY(0)}    50%{transform:translateY(-6px)} }
        @keyframes ar-rotor  { from{transform:rotate(0deg) translateZ(0)} to{transform:rotate(360deg) translateZ(0)} }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN
// ─────────────────────────────────────────────────────────────────────────────

interface TimeLeft { days:number; hours:number; minutes:number; seconds:number; total:number }

function calcTimeLeft(date:string): TimeLeft {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0, total:0 };
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000)   % 60),
    seconds: Math.floor((diff / 1000)    % 60),
    total:   diff,
  };
}

const FlipDigit: React.FC<{ value:number }> = ({ value }) => {
  const prev  = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 320);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return (
    <div style={{ width:54, height:64,
      background:"rgba(255,255,255,0.12)",
      border:"2px solid rgba(125,211,252,0.3)",
      borderRadius:10,
      display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden",
      boxShadow:"0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
      <div style={{ position:"absolute", left:0, right:0, top:"50%",
        height:"1px", background:"rgba(125,211,252,0.2)", zIndex:2 }}/>
      <span style={{ fontFamily:"'Baloo 2','Nunito',system-ui,sans-serif",
        fontSize:28, fontWeight:800, color:"white", lineHeight:1, zIndex:1,
        transform: flash ? "translateY(-3px)" : "translateY(0)",
        transition:"transform 0.16s cubic-bezier(0.4,0,0.2,1)", display:"block",
        textShadow:"0 0 10px rgba(125,211,252,0.5)" }}>
        {String(value).padStart(2,'0')}
      </span>
      <div style={{ position:"absolute", inset:0, background:"#38bdf8",
        opacity:flash?0.1:0, transition:"opacity 0.32s", pointerEvents:"none" }}/>
    </div>
  );
};

const RoadCountdown: React.FC<{ targetDate:string|undefined }> = ({ targetDate }) => {
  const [tl, setTl]       = useState<TimeLeft|null>(null);
  const [ready, setReady] = useState(false);
  const display = "'Baloo 2','Nunito',system-ui,sans-serif";
  const serif   = "'Cormorant Garamond',Georgia,serif";

  useEffect(() => {
    setReady(true);
    if (!targetDate) return;
    setTl(calcTimeLeft(targetDate));
    const id = setInterval(() => setTl(calcTimeLeft(targetDate!)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!ready || !targetDate) return null;
  const isOver = tl?.total === 0;
  const isSoon = (tl?.total ?? 0) < 86400000;

  if (isOver) return (
    <div style={{ textAlign:"center", padding:"12px 20px", borderRadius:12,
      background:"rgba(56,189,248,0.1)", border:"2px solid rgba(56,189,248,0.3)" }}>
      <p style={{ fontFamily:display, fontSize:14, fontWeight:700,
        color:"rgba(125,211,252,0.9)", margin:0 }}>🚀 Ziua a sosit! 🚀</p>
    </div>
  );

  const vals   = [tl?.days??0, tl?.hours??0, tl?.minutes??0, tl?.seconds??0];
  const labels = ['Zile','Ore','Min','Sec'];
  const sep = (
    <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"center",
      paddingBottom:20, flexShrink:0 }}>
      <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(125,211,252,0.5)" }}/>
      <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(125,211,252,0.5)" }}/>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
        <span style={{ fontFamily:display, fontSize:9, fontWeight:700,
          letterSpacing:"0.35em", textTransform:"uppercase",
          color:"rgba(125,211,252,0.8)",
          padding:"5px 16px", borderRadius:99,
          background:"rgba(56,189,248,0.1)", border:"2px solid rgba(56,189,248,0.25)" }}>
          {isSoon ? "🎉 Mâine!" : "🚗 Timp rămas"}
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"center", gap:6 }}>
        {vals.map((v,i) => (
          <React.Fragment key={i}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>
              <FlipDigit value={v}/>
              <span style={{ fontFamily:serif, fontSize:11, fontStyle:"italic",
                color:"rgba(125,211,252,0.5)" }}>{labels[i]}</span>
            </div>
            {i < 3 && sep}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:5, marginTop:10 }}>
        <div style={{ width:5, height:5, borderRadius:"50%", background:"#38bdf8",
          animation:"ar-cd-pulse 2s ease-in-out infinite", opacity:0.8 }}/>
        <span style={{ fontFamily:display, fontSize:8, fontWeight:700,
          letterSpacing:"0.3em", textTransform:"uppercase",
          color:"rgba(125,211,252,0.4)" }}>live</span>
        <style>{`@keyframes ar-cd-pulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.7);opacity:1}}`}</style>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO SCENE
// ─────────────────────────────────────────────────────────────────────────────

const HeroScene: React.FC = () => (
  <svg viewBox="0 0 420 240" fill="none"
    style={{ position:"absolute", top:0, left:0, width:"100%", height:240, pointerEvents:"none" }}>
    <defs>
      <linearGradient id="ar-sky" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#0369a1"/>
        <stop offset="60%"  stopColor="#0ea5e9"/>
        <stop offset="100%" stopColor="#38bdf8"/>
      </linearGradient>
    </defs>
    <rect width="420" height="240" fill="url(#ar-sky)"/>

    {/* Sun */}
    {Array.from({length:10},(_,i) => {
      const a = (i/10)*2*Math.PI - Math.PI/2;
      return <line key={i}
        x1={370+Math.cos(a)*22} y1={35+Math.sin(a)*22}
        x2={370+Math.cos(a)*32} y2={35+Math.sin(a)*32}
        stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>;
    })}
    <circle cx="370" cy="35" r="18" fill="#fbbf24"/>
    <circle cx="370" cy="35" r="28" fill="#fbbf24" opacity="0.1"/>

    {/* Clouds */}
    <ellipse cx="80"  cy="45"  rx="55" ry="20" fill="white" opacity="0.65"/>
    <ellipse cx="55"  cy="38"  rx="32" ry="18" fill="white" opacity="0.6"/>
    <ellipse cx="105" cy="40"  rx="36" ry="16" fill="white" opacity="0.55"/>
    <ellipse cx="260" cy="35"  rx="45" ry="16" fill="white" opacity="0.5"/>
    <ellipse cx="240" cy="28"  rx="26" ry="14" fill="white" opacity="0.5"/>

    {/* Plane with contrail */}
    <line x1="100" y1="80" x2="185" y2="80" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3"/>
    <PlaneSVG x={195} y={80} scale={0.55} color="#3b82f6"/>

    {/* Helicopter */}
    <HelicopterSVG x={80} y={130} scale={0.65} color="#f97316"/>

    {/* Rocket in corner */}
    <g transform="translate(350,140) rotate(-20)">
      <RocketSVG x={0} y={0} scale={0.5}/>
    </g>

    {/* Green hill */}
    <path d="M0 240 L0 185 Q60 155 120 178 Q180 198 240 168 Q300 138 360 165 L420 155 L420 240 Z"
      fill="#16a34a" opacity="0.55"/>
    <path d="M0 240 L0 200 Q80 172 160 195 Q240 215 320 192 Q370 180 420 195 L420 240 Z"
      fill="#15803d" opacity="0.65"/>

    {/* Road at bottom */}
    <rect y="208" width="420" height="32" fill="#374151"/>
    {[0,60,120,180,240,300,360].map((lx,i) => (
      <rect key={i} x={lx+8} y="222" width="44" height="5" rx="2" fill="white" opacity="0.4"/>
    ))}
    <rect y="206" width="420" height="4" fill="#4b5563" opacity="0.6"/>

    {/* Car on road */}
    <CarSVG x={120} y={218} scale={0.8} color="#e85d04"/>
    {/* Second car */}
    <CarSVG x={290} y={218} scale={0.7} color="#16a34a" flip/>
    {/* Train peeking at bottom */}
    <g transform="translate(210,228) scale(0.55)">
      <TrainSVG x={0} y={0}/>
    </g>
  </svg>
);

// Road divider
const RoadDivider: React.FC = () => (
  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
    <div style={{ flex:1, height:"1.5px",
      background:"linear-gradient(to right,transparent,rgba(56,189,248,0.4))",
      borderRadius:99 }}/>
    {/* Tiny car icon */}
    <svg width="32" height="18" viewBox="-16 -9 32 18" fill="none">
      <rect x="-14" y="-7"  width="28" height="11" rx="4" fill="#3b82f6" opacity="0.9"/>
      <rect x="-8"  y="-13" width="16" height="9"  rx="3" fill="#2563eb" opacity="0.85"/>
      <circle cx="-7" cy="5" r="4" fill="#1e293b"/>
      <circle cx="7"  cy="5" r="4" fill="#1e293b"/>
      <circle cx="-7" cy="5" r="2" fill="#64748b"/>
      <circle cx="7"  cy="5" r="2" fill="#64748b"/>
    </svg>
    <div style={{ flex:1, height:"1.5px",
      background:"linear-gradient(to left,transparent,rgba(56,189,248,0.4))",
      borderRadius:99 }}/>
  </div>
);

const RoadStrip: React.FC<{ icon?: string }> = ({ icon = '🚗' }) => (
  <div style={{
    height: 10, position: 'relative', overflow: 'hidden',
    background: 'rgba(0,0,0,0.25)',
    borderBottom: `1px solid ${hexToRgba(C.sky,.15)}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      position: 'absolute', left: 0, right: 0, top: '50%', height: 2, marginTop: -1,
      background: `repeating-linear-gradient(to right, ${hexToRgba(C.gold,.65)} 0px, ${hexToRgba(C.gold,.65)} 10px, transparent 10px, transparent 20px)`,
    }}/>
    <span style={{ position:'relative', zIndex:2, fontSize:8, lineHeight:1, filter:'drop-shadow(0 0 3px rgba(0,0,0,.6))' }}>{icon}</span>
  </div>
);

// Glass card
const GlassCard: React.FC<{ children:React.ReactNode; style?:React.CSSProperties; roadIcon?:string }> = ({ children, style, roadIcon }) => (
  <div style={{
    background:`linear-gradient(135deg,${hexToRgba(C.navyMid,.55)},${hexToRgba(C.navyDark,.7)})`,
    backdropFilter:"blur(12px)",
    borderRadius:16,
    border: `1.5px solid ${hexToRgba(C.sky,.18)}`,
    boxShadow:`rgba(0,0,0,0.45) 0px 6px 28px, ${hexToRgba(C.sky,.06)} 0px 1px 0px inset`,
    position:"relative",
    overflow:"hidden",
    padding: 0,
    ...style,
  }}>
    <RoadStrip icon={roadIcon}/>
    <div style={{ padding: '16px 22px 20px' }}>
      {children}
    </div>
  </div>
);

// Location card
const LocCard: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
}> = ({ block, editMode, onUpdate }) => {
  const {
    label,
    time,
    locationName,
    locationAddress,
    wazeLink,
    icon = "🚩",
  } = block;
  const display = "'Baloo 2','Nunito',system-ui,sans-serif";
  const serif = "'Cormorant Garamond',Georgia,serif";
  const address = locationAddress || locationName;
  const enc = encodeURIComponent(address || "");

  return (
    <GlassCard>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
        <span style={{ fontSize:14 }}>🚩</span>
        <InlineEdit
          editMode={editMode}
          value={label || 'Locație'}
          onChange={v => onUpdate({ label: v })}
          style={{ fontFamily:display, fontSize:8, fontWeight:700, letterSpacing:"0.42em",
            textTransform:"uppercase", color:hexToRgba(C.sky,.8), margin:0 }}
        />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"auto 1.5px 1fr", gap:"0 16px", alignItems:"start" }}>
        <div style={{ textAlign:"center" }}>
          <InlineTime
            editMode={editMode}
            value={time || '11:00'}
            onChange={v => onUpdate({ time: v })}
            style={{ fontFamily:display, fontSize:28, fontWeight:800, color:"white",
            margin:0, lineHeight:1, textShadow:`0 0 16px ${hexToRgba(C.sky,.45)}` }}
          />
          <p style={{ fontFamily:serif, fontSize:10, fontStyle:"italic",
            color:hexToRgba(C.skyLight,.45), margin:"2px 0 0" }}>ora</p>
        </div>
        <div style={{ background:hexToRgba(C.sky,.2), alignSelf:"stretch" }}/>
        <div style={{ paddingTop:2 }}>
          <InlineEdit
            editMode={editMode}
            value={locationName || ''}
            onChange={v => onUpdate({ locationName: v })}
            style={{ fontFamily:display, fontSize:13, fontWeight:700, color:"white",
            margin:"0 0 4px", lineHeight:1.3, display:'block' }}
          />
          <InlineEdit
            editMode={editMode}
            value={locationAddress || ''}
            onChange={v => onUpdate({ locationAddress: v })}
            style={{ fontFamily:display, fontSize:11, fontWeight:500,
            color:hexToRgba(C.skyLight,.65), margin:0, lineHeight:1.5 }}
            multiline
          />
        </div>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:12 }}>
        <InlineWaze value={wazeLink || ""} onChange={v => onUpdate({ wazeLink: v })} editMode={editMode} />
        {address && (
          <a href={`https://maps.google.com/?q=${enc}`} target="_blank" rel="noopener noreferrer" style={{
            display:"flex", alignItems:"center", gap:4, padding:"5px 14px", borderRadius:99,
            fontSize:9, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase",
            textDecoration:"none", fontFamily:display,
            background:hexToRgba(C.sky,.12), border:`2px solid ${hexToRgba(C.sky,.35)}`,
            color:hexToRgba(C.sky,.95) }}>📍 Maps</a>
        )}
      </div>
    </GlassCard>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const CASTLE_DEFAULTS = {
  partner1Name: "Alexandru",
  partner2Name: "",
  welcomeText: "Vă invităm să fiți alături de noi",
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
  churchLabel: "Sfântul Botez",
  venueLabel: "Petrecerea",
  civilLabel: "Cununie Civilă",
  civilTime: "10:00",
  churchTime: "11:00",
  eventTime: "14:00",
  civilLocationName: "Primăria",
  civilLocationAddress: "Strada Principală 1, București",
  churchLocationName: "Biserica Sfântul Alexandru",
  churchLocationAddress: "Strada Bisericii 5, București",
  locationName: "Salon Adventure",
  locationAddress: "Strada Aventurii 1, București",
  civilWazeLink: "",
  churchWazeLink: "",
  venueWazeLink: "",
  godparents: JSON.stringify([{ godfather: "Nume Naș", godmother: "Nume Nașă" }]),
  timeline: JSON.stringify([]),
  colorTheme: "sky",
  rsvpButtonText: "Confirmă Prezența",
};

export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = [
  {
    id: "def-photo-1",
    type: "photo" as const,
    show: true,
    imageData: "",
    altText: "Alexandru",
    aspectRatio: "3:4" as const,
    photoClip: "arch" as const,
    photoMasks: ["fade-b"] as any,
  },
  {
    id: "def-text-1",
    type: "text" as const,
    show: true,
    content: "O aventură de neuitat începe — te invităm să fii parte din ea!",
  },
  {
    id: "def-family-1",
    type: "family" as const,
    show: true,
    label: "Părinții",
    content: "Cu drag și bucurie",
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
  {
    id: "def-countdown",
    type: "countdown" as const,
    show: true,
    countdownTitle: "Timp rămas până la eveniment",
  },
  { id: "def-divider-1", type: "divider" as const, show: true },
  {
    id: "def-location-1",
    type: "location" as const,
    show: true,
    label: "Sfântul Botez",
    time: "11:00",
    locationName: "Biserica Sfântul Alexandru",
    locationAddress: "Strada Bisericii 5, București",
    wazeLink: "",
  },
  {
    id: "def-location-2",
    type: "location" as const,
    show: true,
    label: "Petrecerea",
    time: "14:00",
    locationName: "Salon Adventure",
    locationAddress: "Strada Aventurii 1, București",
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
    id: "def-text-3",
    type: "text" as const,
    show: true,
    content: "Ne-ar bucura să ne confirmați prezența pentru o bună organizare.",
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
  project: { selectedTemplate: "adventure-road" },
  profile: {
    ...CASTLE_DEFAULTS,
    weddingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    customSections: JSON.stringify(CASTLE_DEFAULT_BLOCKS),
  },
};

// ── Shape / Clip system ───────────────────────────────────────────────────────
type ClipShape = 'rect' | 'rounded' | 'rounded-lg' | 'squircle' | 'circle' | 'arch' | 'arch-b' | 'hexagon' | 'diamond' | 'triangle' | 'star' | 'heart' | 'diagonal' | 'diagonal-r' | 'wave-b' | 'wave-t' | 'wave-both' | 'blob' | 'blob2' | 'blob3' | 'blob4';
type MaskEffect = 'fade-b' | 'fade-t' | 'fade-l' | 'fade-r' | 'vignette';

const sectionStyle: React.CSSProperties = {
  background:`linear-gradient(135deg,${hexToRgba(C.navyMid,.55)},${hexToRgba(C.navyDark,.7)})`,
  border: `1.5px solid ${hexToRgba(C.sky,.18)}`,
  borderRadius:16, backdropFilter:'blur(8px)', padding:'18px 22px',
  position:'relative', overflow:'hidden',
  boxShadow:`rgba(0,0,0,0.45) 0px 6px 28px`,
};

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

const PhotoBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  placeholderInitial1?: string;
}> = ({ block, editMode, onUpdate, placeholderInitial1 }) => {
  const { imageData, altText, aspectRatio = 'free', photoClip = 'rect', photoMasks = [] } = block;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const pt: Record<string, string> = { '1:1': '100%', '4:3': '75%', '3:4': '133%', '16:9': '56.25%', free: '66.6%' };
  const combined = { ...getClipStyle(photoClip as ClipShape), ...getMaskStyle(photoMasks as MaskEffect[]) };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    deleteUploadedFile(imageData);
    try {
      const form = new FormData(); form.append('file', file);
      const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${_s?.token || ''}` }, body: form });
      const { url } = await res.json(); onUpdate({ imageData: url });
    } catch {} finally { setUploading(false); }
  };

  if (imageData) return (
    <div style={{ position: 'relative' }}>
      <PhotoClipDefs />
      <div style={{ position: 'relative', paddingTop: pt[aspectRatio as string], overflow: 'hidden', ...combined }}>
        <img src={imageData} alt={altText || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {editMode && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
          >
            <button onClick={() => fileRef.current?.click()} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '50%', color: C.navyDark }}><Camera style={{width: 20, height: 20}}/></button>
            <button onClick={() => { deleteUploadedFile(imageData); onUpdate({ imageData: undefined }); }} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '50%', color: '#ef4444' }}><Trash2 style={{width: 20, height: 20}}/></button>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <PhotoClipDefs />
      <div style={{ position: 'relative', paddingTop: pt[aspectRatio as string], ...combined, overflow: 'hidden', cursor: editMode ? 'pointer' : 'default' }}
        onClick={editMode ? () => fileRef.current?.click() : undefined}>
        <div style={{...sectionStyle, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {uploading
            ? <div style={{ width: 32, height: 32, border: '4px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            : <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <Camera style={{ width: 48, height: 48,  margin: '0 auto 8px' }} />
                <span style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 14 }}>Adaugă o fotografie</span>
              </div>
          }
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────

const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: '🖼', text: '✏️', location: '📍', calendar: '📅',
  countdown: '⏱', music: '🎵', gift: '🎁', whatsapp: '💬', rsvp: '✉️', divider: '—', family: '👨‍👩‍👧',
  date: '📆', description: '📝', timeline: '🗓',
};

const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => {
  const btn: React.CSSProperties = {
    background: 'none', border: 'none', padding: 5, borderRadius: 99,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1, flexShrink: 0,
  };
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div
      onClick={stop}
      style={{
        position: 'absolute', top: -18, right: 6, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 2,
        borderRadius: 99,
        border: '1.5px solid rgba(56,189,248,.35)',
        backgroundColor: 'rgba(8,24,48,0.92)',
        backdropFilter: 'blur(8px)',
        padding: '3px 5px',
        pointerEvents: 'auto',
        boxShadow: '0 4px 16px rgba(0,0,0,.5)',
      }}
    >
      <button type="button" onClick={(e) => { stop(e); onUp(); }} disabled={isFirst} style={{ ...btn, opacity: isFirst ? 0.2 : 1 }}><ChevronUp style={{ width: 13, height: 13, color: 'rgba(125,211,252,.9)' }}/></button>
      <button type="button" onClick={(e) => { stop(e); onDown(); }} disabled={isLast} style={{ ...btn, opacity: isLast ? 0.2 : 1 }}><ChevronDown style={{ width: 13, height: 13, color: 'rgba(125,211,252,.9)' }}/></button>
      <div style={{ width: 1, height: 12, backgroundColor: 'rgba(56,189,248,.3)', margin: '0 1px' }} />
      <button type="button" onClick={(e) => { stop(e); onToggle(); }} style={btn}>
        {visible ? <Eye style={{ width: 13, height: 13, color: 'rgba(125,211,252,.9)' }}/> : <EyeOff style={{ width: 13, height: 13, color: 'rgba(125,211,252,.4)' }}/>}
      </button>
      <button type="button" onClick={(e) => { stop(e); onDelete(); }} style={btn}><Trash2 style={{ width: 13, height: 13, color: 'rgba(252,165,165,.9)' }}/></button>
    </div>
  );
};

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
        background: `repeating-linear-gradient(to right, rgba(56,189,248,.4) 0, rgba(56,189,248,.4) 6px, transparent 6px, transparent 12px)`,
        opacity: 1, transition: 'opacity 0.15s', zIndex: 1
      }} />
      <button
        type="button"
        onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{
          width: 26, height: 26, borderRadius: '50%',
          background: isOpen ? C.navyDark : 'white',
          border: `1.5px solid rgba(56,189,248,.4)`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: isOpen ? 'white' : C.navyDark,
          boxShadow: `0 2px 10px ${C.navyDark}22`,
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
            background: C.navyDark,
            borderRadius: 16,
            border: `1px solid rgba(56,189,248,.4)`,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
            padding: '16px',
            zIndex: 100,
            width: 260,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.muted, margin: '0 0 10px', textAlign: 'center' }}>
            Adauga bloc
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button" onClick={() => onInsert(bt.type, bt.def)}
                style={{
                  background: C.navyMid,
                  border: `1px solid rgba(56,189,248,.4)`,
                  borderRadius: 10, padding: '8px 4px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{BLOCK_TYPE_ICONS[bt.type] || '+'}</span>
                <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text, lineHeight: 1.2, textAlign: 'center' }}>
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

const AdventureRoadTemplate: React.FC<InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
  scrollContainer?: HTMLElement | null;
}> = ({
  data, onOpenRSVP, editMode = false, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId,
}) => {
  const { profile, guest } = data;

  const theme = getAdventureTheme((profile as any).colorTheme);
  C = {
    navyDark : theme.PINK_DARK,
    navyMid  : theme.PINK_D,
    sky      : theme.PINK_L,
    skyLight : theme.PINK_XL,
    skyPale  : theme.CREAM,
    cream    : theme.CREAM,
    text     : theme.TEXT,
    muted    : theme.MUTED,
    gold     : theme.GOLD,
  };

  // ── Block state management ────────────────────────────────────────────────
  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const blocksFromDB: InvitationBlock[] | null = safeJSON((profile as any).customSections, null);
  const hasDBBlocks = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;
  const [blocks, setBlocks] = useState<InvitationBlock[]>(() =>
    hasDBBlocks ? blocksFromDB! : CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]
  );
  useEffect(() => {
    const fresh: InvitationBlock[] | null = safeJSON((profile as any).customSections, null);
    if (Array.isArray(fresh) && fresh.length > 0) setBlocks(fresh);
    else if (fresh !== null && Array.isArray(fresh) && fresh.length === 0) {
      setBlocks(CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
    }
  }, [(profile as any).customSections]);

  const [openInsertAt, setOpenInsertAt] = useState<number | null>(null);

  const updBlock = useCallback((idx: number, patch: Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb = prev.map((b,i) => i===idx ? {...b,...patch} : b); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const movBlock = useCallback((idx: number, dir: -1|1) => {
    setBlocks(prev => { const nb=[...prev]; const to=idx+dir; if(to<0||to>=nb.length) return prev; [nb[idx],nb[to]]=[nb[to],nb[idx]]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const delBlock = useCallback((idx: number) => {
    setBlocks(prev => { const nb=prev.filter((_,i)=>i!==idx); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const addBlock = useCallback((type: string, def: any) => {
    setBlocks(prev => { const nb=[...prev,{id:Date.now().toString(),type:type as InvitationBlockType,show:true,...def}]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const addBlockAt = useCallback((afterIdx: number, type: string, def: any) => {
    setBlocks(prev => {
      const nb=[...prev];
      nb.splice(afterIdx+1,0,{id:Date.now().toString(),type:type as InvitationBlockType,show:true,...def});
      onBlocksUpdate?.(nb); return nb;
    });
  }, [onBlocksUpdate]);

  const upProfile = useCallback((field: string, value: any) => {
    onProfileUpdate?.({ [field]: value });
  }, [onProfileUpdate]);

  const getTimelineItems = () => safeJSON((profile as any).timeline, []);
  const updateTimeline = (next: any[]) => onProfileUpdate?.({ timeline: JSON.stringify(next) } as any);
  const addTimelineItem = () => {
    updateTimeline([...getTimelineItems(), { id: Date.now().toString(), time: '', title: '' }]);
  };
  const updateTimelineItem = (id: string, patch: any) => {
    updateTimeline(getTimelineItems().map((t: any) => t.id === id ? { ...t, ...patch } : t));
  };
  const removeTimelineItem = (id: string) => {
    updateTimeline(getTimelineItems().filter((t: any) => t.id !== id));
  };

  const handleInsertAt = (afterIdx: number, type: string, def: any) => {
    addBlockAt(afterIdx, type, def);
    setOpenInsertAt(null);
  };

  const heroBlock: InvitationBlock = { id:"__hero__", type:"__hero__" as any, show:true, textStyles:(profile as any).heroTextStyles||{} } as any;

  const BLOCK_TYPES = [
    { type:'photo',     label:'📷 Foto',      def:{ imageData:'', aspectRatio:'1:1', photoClip:'rect', photoMasks:[] } },
    { type:'text',      label:'Text',         def:{ content:'O aventură de neuitat...' } },
    { type:'location',  label:'Locatie',      def:{ label:'Locatie', time:'11:00', locationName:'Locatie eveniment', locationAddress:'Strada Exemplu, Nr. 1' } },
    { type:'calendar',  label:'📅 Calendar',  def:{} },
    { type:'countdown', label:'⏱ Countdown',  def:{} },
    { type:'timeline',  label:'🗓 Cronologie', def:{} },
    { type:'music',     label:'🎵 Muzica',    def:{ musicTitle:'', musicArtist:'', musicType:'none' } },
    { type:'gift',      label:'🎁 Cadouri',   def:{ sectionTitle:'Sugestie cadou', content:'', iban:'', ibanName:'' } },
    { type:'whatsapp',  label:'WhatsApp',     def:{ label:'Contact WhatsApp', content:'0700000000' } },
    { type:'rsvp',      label:'RSVP',         def:{ label:'Confirmă Prezența' } },
    { type:'divider',   label:'Linie',        def:{} },
    { type:'family',    label:'👨‍👩‍👧 Familie', def:{ label:'Părinții', content:'Cu drag', members:JSON.stringify([{name1:'Mama',name2:'Tata'}]) } },
  ];

  // ── Existing intro/content state ──────────────────────────────────────────
  const [showIntro, setShowIntro]           = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow  = 'hidden';
      document.body.style.position  = 'fixed';
      document.body.style.top       = '0';
      document.body.style.left      = '0';
      document.body.style.right     = '0';
    } else {
      document.body.style.overflow  = '';
      document.body.style.position  = '';
      document.body.style.top       = '';
      document.body.style.left      = '';
      document.body.style.right     = '';
    }
    return () => {
      document.body.style.overflow  = '';
      document.body.style.position  = '';
      document.body.style.top       = '';
      document.body.style.left      = '';
      document.body.style.right     = '';
    };
  }, [showIntro]);

  useEffect(() => { if (editMode) { setShowIntro(false); setContentVisible(true); } }, [editMode]);

  const handleIntroDone = () => {
    window.scrollTo(0, 0);
    setShowIntro(false);
    setTimeout(() => { window.scrollTo(0, 0); setContentVisible(true); }, 60);
  };

  const initial  = (profile.partner1Name || 'B').charAt(0).toUpperCase();
  const babyName = profile.partner1Name || 'Prenume';

  const getEventText = () => {
    const map: Record<string,any> = {
      baptism:     { welcome:'Vă invităm să fiți alături de noi',  celebration:'botezului',         eventLabel:'Sfântul Botez',   partyLabel:'Petrecerea',   civilLabel:'' },
      kids:        { welcome:'Pornește motoarele! 🚗',             celebration:'zilei mele',         eventLabel:'Ziua de naștere', partyLabel:'Petrecerea',   civilLabel:'' },
      wedding:     { welcome:'Împreună cu familiile lor',           celebration:'căsătoriei lor',    eventLabel:'Ceremonia',       partyLabel:'Petrecerea',   civilLabel:'Cununia Civilă' },
      anniversary: { welcome:'Vă invităm să sărbătorim',           celebration:'aniversării',        eventLabel:'Ceremonia',       partyLabel:'Recepția',     civilLabel:'' },
    };
    const d = map[profile.eventType||'baptism']||map.baptism;
    return {
      welcome:     profile.welcomeText?.trim()     || d.welcome,
      celebration: profile.celebrationText?.trim() || d.celebration,
      eventLabel:  profile.churchLabel?.trim()     || d.eventLabel,
      partyLabel:  profile.venueLabel?.trim()      || d.partyLabel,
      civilLabel:  profile.civilLabel?.trim()      || d.civilLabel,
    };
  };
  const texts = getEventText();

  const display = "'Baloo 2','Nunito',system-ui,sans-serif";
  const serif   = "'Cormorant Garamond',Georgia,serif";
  const sans    = "'Nunito','DM Sans',system-ui,sans-serif";

  const formattedDate = profile.weddingDate
    ? new Date(profile.weddingDate).toLocaleDateString('ro-RO',{
        weekday:'long', day:'numeric', month:'long', year:'numeric'
      })
    : 'Data Evenimentului';

  // ── Section styles ────────────────────────────────────────────────────────
  const sectionStyle: React.CSSProperties = {
    background:`linear-gradient(135deg,${hexToRgba(C.navyMid,.55)},${hexToRgba(C.navyDark,.7)})`,
    border: `1.5px solid ${hexToRgba(C.sky,.18)}`,
    borderRadius:16, backdropFilter:'blur(8px)', padding:'0 0 18px',
    position:'relative', overflow:'hidden',
    boxShadow:`rgba(0,0,0,0.45) 0px 6px 28px, ${hexToRgba(C.sky,.06)} 0px 1px 0px inset`,
  };


  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {showIntro && (
        <RoadIntro initial={initial} name={babyName} onDone={handleIntroDone}/>
      )}

      <div style={{
        minHeight:"100vh",
        background:`linear-gradient(180deg,${C.navyDark} 0%,${hexToRgba(C.navyMid,.85)} 30%,${C.navyMid} 70%,${hexToRgba(C.navyDark,.9)} 100%)`,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"0 16px 48px",
        fontFamily: sans,
        position:"relative", overflow:"hidden",
        opacity:    contentVisible ? 1 : 0,
        transform:  contentVisible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* Ambient glows */}
        <div style={{ position:"fixed", top:"10%", left:"5%", width:320, height:320,
          borderRadius:"50%", pointerEvents:"none", zIndex:0,
          background:`radial-gradient(circle,${hexToRgba(C.sky,.12)} 0%,transparent 70%)` }}/>
        <div style={{ position:"fixed", bottom:"15%", right:"5%", width:280, height:280,
          borderRadius:"50%", pointerEvents:"none", zIndex:0,
          background:`radial-gradient(circle,${hexToRgba(C.gold,.08)} 0%,transparent 70%)` }}/>

        {/* Animated bg vehicles — subtle */}
        <div style={{ position:"fixed", top:"70%", left:0, right:0, pointerEvents:"none", zIndex:0, opacity:0.08 }}>
          <svg viewBox="0 0 420 40" style={{ width:"100%" }} fill="none">
            <rect width="420" height="4" y="18" fill="white" opacity="0.3"/>
            {[0,80,180,280,360].map((lx,i) => (
              <rect key={i} x={lx+8} y="18" width="35" height="4" rx="2" fill="white" opacity="0.5"/>
            ))}
          </svg>
        </div>

        <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>

          {/* ── HERO CARD ── */}
          <BlockStyleProvider value={{ blockId: heroBlock.id, textStyles: (heroBlock as any).textStyles, onTextSelect: (textKey, textLabel) => onBlockSelect?.(heroBlock, -1, textKey, textLabel) }}>
          <div style={{
            background:"rgba(255,255,255,0.05)",
            backdropFilter:"blur(16px)",
            borderRadius:24,
            border:"1.5px solid rgba(125,211,252,0.15)",
            overflow:"hidden",
            position:"relative",
            boxShadow:"0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}>
            <HeroScene/>

            <div style={{ position:"relative", zIndex:1, textAlign:"center",
              padding:"248px 32px 40px" }}>

              {/* Welcome */}
              {profile.showWelcomeText && (
                <InlineEdit
                  editMode={editMode}
                  value={texts.welcome}
                  onChange={(v) => onProfileUpdate?.({ welcomeText: v })}
                  textLabel="Hero · Welcome"
                  style={{ fontFamily:serif, fontSize:14, fontStyle:"italic",
                  color:"rgba(255,255,255,0.45)", margin:"0 0 16px", lineHeight:1.7 }}
                />
              )}

              {/* Name */}
              <InlineEdit
                editMode={editMode}
                value={profile.partner1Name || "Prenume"}
                onChange={(v) => onProfileUpdate?.({ partner1Name: v })}
                tag="h1"
                textLabel="Hero · Name"
                style={{ fontFamily:display, fontSize:58, fontWeight:800,
                color:"white", margin:"0 0 4px", lineHeight:1.05,
                textShadow:`0 4px 20px ${hexToRgba(C.sky,.4)}, 0 2px 0 rgba(0,0,0,0.2)`,
                letterSpacing:-1 }}
              />

              {profile.showCelebrationText && (
                <InlineEdit
                  editMode={editMode}
                  value={`vă invită la ${texts.celebration}`}
                  onChange={(v) => onProfileUpdate?.({ celebrationText: v.replace('vă invită la ','') })}
                  textLabel="Hero · Celebration"
                  style={{ fontFamily:serif, fontSize:15, fontStyle:"italic",
                  color:hexToRgba(C.skyLight,.55), margin:"10px 0 0" }}
                />
              )}

              <div style={{ margin:"22px 0" }}><RoadDivider/></div>

              {/* Date */}
              <InlineEdit
                editMode={editMode}
                value={`🗓 ${formattedDate}`}
                onChange={(v) => {
                  const newDate = v.replace('🗓 ','');
                  // This is tricky, because formattedDate is 'luni, 1 ianuarie 2024'
                  // We can't easily convert it back to a date object.
                  // For now, we will not allow editing the date this way.
                }}
                textLabel="Hero · Date"
                style={{ fontFamily:display, fontSize:13, fontWeight:700,
                color:"rgba(255,255,255,0.55)", textTransform:"capitalize",
                letterSpacing:"0.03em", margin:"0 0 22px" }}
              />

              {/* COUNTDOWN */}
              <div style={{ margin:"0 0 24px" }}>
                <RoadCountdown targetDate={profile.weddingDate}/>
              </div>

              <div style={{ margin:"0 0 20px" }}><RoadDivider/></div>

              {/* Guest */}
              <div style={{ background:`${hexToRgba(C.sky,.08)}`,
                border:`2px solid ${hexToRgba(C.sky,.2)}`,
                borderRadius:14, padding:"14px 20px" }}>
                <p style={{ fontFamily:display, fontSize:9, fontWeight:700,
                  letterSpacing:"0.38em", textTransform:"uppercase",
                  color:hexToRgba(C.skyLight,.5), margin:"0 0 5px" }}>
                  🎟 Invitat special
                </p>
                <InlineEdit
                  editMode={false} // Guest name should not be editable in the template view
                  value={guest?.name || "Nume Invitat"}
                  onChange={()=>{}}
                  textLabel="Hero · Guest Name"
                  style={{ fontFamily:serif, fontSize:22, fontWeight:400,
                  color:"white", margin:0, letterSpacing:1 }}
                />
              </div>
            </div>
          </div>
          </BlockStyleProvider>

          {/* ── BLOCKS ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {editMode && (
              <InsertBlockButton
                insertIdx={-1}
                openInsertAt={openInsertAt}
                setOpenInsertAt={setOpenInsertAt}
                BLOCK_TYPES={BLOCK_TYPES}
                onInsert={(type, def) => handleInsertAt(-1, type, def)}
              />
            )}
            {blocks
              .filter((b) => editMode || b.show !== false)
              .map((block, idx) => (
              <div key={block.id} style={{ position: 'relative' }}>
                {editMode && (
                  <BlockToolbar
                    onUp={() => movBlock(idx, -1)}
                    onDown={() => movBlock(idx, 1)}
                    onToggle={() => updBlock(idx, { show: !block.show })}
                    onDelete={() => delBlock(idx)}
                    visible={block.show !== false}
                    isFirst={idx === 0}
                    isLast={idx === blocks.length - 1}
                  />
                )}
                <div
                  style={{ position: 'relative', padding: '10px 0', opacity: block.show ? 1 : 0.4 }}
                  onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}
                >
                  
                  {block.type === 'divider' && <RoadDivider />}
                  {block.type === 'rsvp' && (
                    <button onClick={() => onOpenRSVP && onOpenRSVP()} style={{
                      width:"100%", padding:"18px 24px",
                      background:`linear-gradient(135deg,${C.sky} 0%,${C.navyMid} 60%,${C.navyDark} 100%)`,
                      border:`2px solid ${hexToRgba(C.sky,.4)}`,
                      borderRadius:18, cursor:"pointer",
                      fontFamily:display, fontWeight:800, fontSize:13,
                      letterSpacing:"0.25em", textTransform:"uppercase", color:"white",
                      boxShadow:`0 8px 28px ${hexToRgba(C.sky,.4)}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}>
                      <InlineEdit
                        editMode={editMode}
                        value={`🚀 ${(block as any).label || 'Confirmă Prezența'} 🚀`}
                        onChange={(v) => updBlock(idx, { label: v.replace(/🚀/g, '').trim() })}
                        textLabel="RSVP Button"
                      />
                    </button>
                  )}
                  {block.type === 'countdown' && (
                    <div style={{...sectionStyle}}>
                      <RoadStrip icon="🚂"/>
                      <div style={{ padding:'16px 22px 18px' }}>
                        <RoadCountdown targetDate={profile.weddingDate}/>
                      </div>
                    </div>
                  )}
                  {block.type === 'location' && (
                    <LocCard
                      block={block}
                      editMode={editMode}
                      onUpdate={(p) => updBlock(idx, p)}
                    />
                  )}
                  {block.type === 'photo' && (
                    <PhotoBlock
                      block={block}
                      editMode={editMode}
                      onUpdate={(p) => updBlock(idx, p)}
                      placeholderInitial1={initial}
                    />
                  )}
                  {block.type === 'text' && (
                    <div style={{...sectionStyle, textAlign:'center'}}>
                      <RoadStrip icon="✈️"/>
                      <div style={{ padding:'16px 22px 18px' }}>
                        <InlineEdit
                          editMode={editMode}
                          value={block.content || 'Text invitație...'}
                          onChange={v => updBlock(idx, { content: v })}
                          style={{ fontFamily:serif, fontSize:15, fontStyle:'italic', color:'rgba(255,255,255,.75)', margin:0, lineHeight:1.7 }}
                          multiline
                        />
                      </div>
                    </div>
                  )}
                  {block.type === 'family' && (() => {
                    const members: { name1: string; name2: string }[] = safeJSON(block.members, []);
                    const updateMembers = (nm: { name1: string; name2: string }[]) =>
                      updBlock(idx, { members: JSON.stringify(nm) } as any);

                    const vehicleIcons = ['🚗','✈️','🚂','🚁','🚀'];
                    const vehicleIcon = vehicleIcons[idx % vehicleIcons.length];

                    return (
                      <div style={{
                        position: 'relative',
                        background: `linear-gradient(160deg, ${hexToRgba(C.navyDark, .85)} 0%, ${hexToRgba(C.navyMid, .75)} 100%)`,
                        borderRadius: 16,
                        border: `1.5px solid ${hexToRgba(C.sky,.18)}`,
                        backdropFilter: 'blur(12px)',
                        boxShadow: `rgba(0,0,0,0.45) 0px 6px 28px, ${hexToRgba(C.sky,.06)} 0px 1px 0px inset`,
                        overflow: 'hidden',
                        textAlign: 'center',
                      }}>
                        <RoadStrip icon={vehicleIcon}/>

                        <div style={{ padding: '16px 22px 22px' }}>
                          {/* Label with side lines */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${hexToRgba(C.sky, .3)})` }}/>
                            <InlineEdit
                              editMode={editMode}
                              value={block.label || 'Părinții'}
                              onChange={v => updBlock(idx, { label: v })}
                              style={{
                                fontFamily: display, fontSize: 8, fontWeight: 700,
                                letterSpacing: '0.45em', textTransform: 'uppercase',
                                color: hexToRgba(C.sky, .75), margin: 0,
                              }}
                            />
                            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${hexToRgba(C.sky, .3)})` }}/>
                          </div>

                          {/* Italic subtitle */}
                          <InlineEdit
                            editMode={editMode}
                            value={block.content || 'Cu drag și recunoștință'}
                            onChange={v => updBlock(idx, { content: v })}
                            style={{
                              fontFamily: serif, fontSize: 12, fontStyle: 'italic',
                              color: hexToRgba(C.skyLight, .5), margin: '0 0 16px', display: 'block',
                            }}
                          />

                          {/* Member rows */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {members.map((m, mi) => (
                              <div key={mi}>
                                <div style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  gap: 10, flexWrap: 'wrap',
                                  background: hexToRgba(C.sky, .06),
                                  border: `1px solid ${hexToRgba(C.sky, .15)}`,
                                  borderRadius: 12, padding: '10px 14px',
                                }}>
                                  <InlineEdit
                                    tag="span"
                                    editMode={editMode}
                                    value={m.name1}
                                    onChange={v => { const nm=[...members]; nm[mi]={...nm[mi],name1:v}; updateMembers(nm); }}
                                    style={{ fontFamily:display, fontSize:17, fontWeight:700, color:'rgba(255,255,255,.9)', letterSpacing:.5 }}
                                  />
                                  <span style={{
                                    fontSize: 13,
                                    filter: `drop-shadow(0 0 4px ${hexToRgba(C.sky, .6)})`,
                                  }}>{vehicleIcon}</span>
                                  <InlineEdit
                                    tag="span"
                                    editMode={editMode}
                                    value={m.name2}
                                    onChange={v => { const nm=[...members]; nm[mi]={...nm[mi],name2:v}; updateMembers(nm); }}
                                    style={{ fontFamily:display, fontSize:17, fontWeight:700, color:'rgba(255,255,255,.9)', letterSpacing:.5 }}
                                  />
                                  {editMode && members.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => updateMembers(members.filter((_,i) => i !== mi))}
                                      style={{ background:'none', border:'none', cursor:'pointer', color:hexToRgba(C.sky,.4), fontSize:13, padding:'0 2px', lineHeight:1, marginLeft:4 }}
                                    >✕</button>
                                  )}
                                </div>
                                {mi < members.length - 1 && (
                                  <div style={{ height:1, margin:'2px 28px 0', background:`linear-gradient(to right, transparent, ${hexToRgba(C.sky,.18)}, transparent)` }}/>
                                )}
                              </div>
                            ))}
                          </div>

                          {editMode && (
                            <button
                              type="button"
                              onClick={() => updateMembers([...members, { name1:'Nume 1', name2:'Nume 2' }])}
                              style={{
                                marginTop: 14,
                                background: hexToRgba(C.sky, .1),
                                border: `1px dashed ${hexToRgba(C.sky, .35)}`,
                                borderRadius: 99, padding: '5px 18px',
                                cursor: 'pointer', fontFamily: display,
                                fontSize: 9, fontWeight: 700,
                                letterSpacing: '0.25em', textTransform: 'uppercase',
                                color: hexToRgba(C.sky, .7),
                              }}
                            >+ Adaugă</button>
                          )}
                        </div>

                        {/* Bottom dashed road decoration */}
                        <div style={{
                          position: 'absolute', bottom: 7, left: '10%', right: '10%', height: 1,
                          background: `repeating-linear-gradient(to right, ${hexToRgba(C.gold,.35)} 0px, ${hexToRgba(C.gold,.35)} 6px, transparent 6px, transparent 12px)`,
                        }}/>
                      </div>
                    );
                  })()}
                  {block.type === 'calendar' && (() => {
                    const wd = profile.weddingDate ? new Date(profile.weddingDate) : null;
                    return (
                      <div style={{...sectionStyle, textAlign:'center'}}>
                        <RoadStrip icon="📅"/>
                        <div style={{ padding:'16px 22px 18px' }}>
                          <p style={{ fontFamily:display, fontSize:8, fontWeight:700, letterSpacing:'0.42em', textTransform:'uppercase', color:hexToRgba(C.sky,.7), margin:'0 0 14px' }}>📅 Data Evenimentului</p>
                          {wd ? (
                            <div>
                              <p style={{ fontFamily:display, fontSize:48, fontWeight:800, color:'white', margin:0, lineHeight:1, textShadow:`0 0 20px ${hexToRgba(C.sky,.4)}` }}>{wd.getDate()}</p>
                              <p style={{ fontFamily:serif, fontSize:14, fontStyle:'italic', color:hexToRgba(C.sky,.8), margin:'4px 0' }}>{wd.toLocaleDateString('ro-RO',{month:'long',year:'numeric'})}</p>
                              <p style={{ fontFamily:display, fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'capitalize', margin:0 }}>{wd.toLocaleDateString('ro-RO',{weekday:'long'})}</p>
                            </div>
                          ) : <p style={{ color:'rgba(255,255,255,.3)', fontFamily:display, fontSize:12 }}>Dată neconfigurată</p>}
                        </div>
                      </div>
                    );
                  })()}
                  {block.type === 'timeline' && (() => {
                    const items = getTimelineItems();
                    if (!items.length && !editMode) return null;
                    return (
                      <GlassCard roadIcon="🗺">
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:16 }}>
                          <div style={{ flex:1, height:1, background:`linear-gradient(to right,transparent,${hexToRgba(C.sky,.25)})` }}/>
                          <p style={{ fontFamily:display, fontSize:8, fontWeight:700, letterSpacing:'0.42em', textTransform:'uppercase', color:hexToRgba(C.sky,.6), margin:0 }}>Programul Zilei</p>
                          <div style={{ flex:1, height:1, background:`linear-gradient(to left,transparent,${hexToRgba(C.sky,.25)})` }}/>
                        </div>

                        {items.length === 0 && editMode && (
                          <p style={{ fontFamily:serif, fontSize:12, fontStyle:'italic', color:hexToRgba(C.skyLight,.4), textAlign:'center', margin:'0 0 14px' }}>
                            Adaugă primul moment al zilei
                          </p>
                        )}

                        <div style={{ display:'flex', flexDirection:'column' }}>
                          {items.map((item: any, i: number) => (
                            <div key={item.id} style={{ display:'grid', gridTemplateColumns:'56px 20px 1fr auto', alignItems:'stretch', minHeight:44 }}>
                              {/* Time */}
                              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'flex-end', paddingRight:8, paddingTop:4 }}>
                                <InlineEdit
                                  editMode={editMode}
                                  value={item.time || ''}
                                  onChange={v => updateTimelineItem(item.id, { time: v })}
                                  style={{ fontFamily:display, fontSize:12, fontWeight:700, color:hexToRgba(C.sky,.9), textAlign:'right', lineHeight:1.2 }}
                                />
                              </div>
                              {/* Dot + line */}
                              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                                <div style={{ width:10, height:10, borderRadius:'50%', background:C.sky, boxShadow:`0 0 6px ${hexToRgba(C.sky,.6)}`, flexShrink:0, marginTop:4 }}/>
                                {i < items.length-1 && <div style={{ flex:1, width:'1.5px', background:`linear-gradient(to bottom,${hexToRgba(C.sky,.35)},transparent)`, marginTop:3, borderRadius:99 }}/>}
                              </div>
                              {/* Title */}
                              <div style={{ paddingLeft:10, paddingTop:2, paddingBottom: i < items.length-1 ? 18 : 0 }}>
                                <InlineEdit
                                  editMode={editMode}
                                  value={item.title || ''}
                                  onChange={v => updateTimelineItem(item.id, { title: v })}
                                  placeholder="Moment..."
                                  style={{ fontFamily:display, fontSize:13, fontWeight:600, color:'rgba(255,255,255,.8)', lineHeight:1.3 }}
                                />
                              </div>
                              {/* Delete button */}
                              {editMode && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeTimelineItem(item.id); }}
                                  style={{ background:'none', border:'none', cursor:'pointer', color:hexToRgba(C.sky,.35), fontSize:12, padding:'4px 2px', alignSelf:'flex-start', lineHeight:1 }}
                                >✕</button>
                              )}
                            </div>
                          ))}
                        </div>

                        {editMode && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); addTimelineItem(); }}
                            style={{
                              marginTop:14, width:'100%',
                              background: hexToRgba(C.sky,.08),
                              border: `1px dashed ${hexToRgba(C.sky,.3)}`,
                              borderRadius: 10, padding: '8px 0',
                              cursor: 'pointer', fontFamily: display,
                              fontSize: 9, fontWeight: 700,
                              letterSpacing: '0.25em', textTransform: 'uppercase',
                              color: hexToRgba(C.sky,.65),
                            }}
                          >+ Adaugă moment</button>
                        )}
                      </GlassCard>
                    );
                  })()}
                  {block.type === 'gift' && (
                    <div style={{...sectionStyle, textAlign:'center'}}>
                      <RoadStrip icon="🎁"/>
                      <div style={{ padding:'16px 22px 18px' }}>
                        <InlineEdit editMode={editMode} value={(block as any).sectionTitle || '🎁 Sugestie cadou'} onChange={v => updBlock(idx, { sectionTitle: v.replace('🎁 ','') })} style={{ fontFamily:display, fontSize:8, fontWeight:700, letterSpacing:'0.42em', textTransform:'uppercase', color:hexToRgba(C.sky,.7), margin:'0 0 10px' }} />
                        <InlineEdit editMode={editMode} value={block.content || ''} onChange={v => updBlock(idx, { content: v })} style={{ fontFamily:serif, fontSize:13, color:'rgba(255,255,255,.65)', margin:'0 0 8px' }} />
                        <InlineEdit editMode={editMode} value={block.iban || ''} onChange={v => updBlock(idx, { iban: v })} style={{ fontFamily:display, fontSize:12, color:C.gold, margin:0 }} />
                      </div>
                    </div>
                  )}
                  {block.type === 'whatsapp' && (
                    <div style={{...sectionStyle, textAlign:'center'}}>
                      <RoadStrip icon="💬"/>
                      <div style={{ padding:'16px 22px 18px' }}>
                        <a href={`https://wa.me/${(block.content||'').replace(/\D/g,'')}`} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:99, background:hexToRgba(C.sky,.15), border:`2px solid ${hexToRgba(C.sky,.3)}`, color:hexToRgba(C.sky,.9), textDecoration:'none', fontFamily:display, fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>
                          <InlineEdit editMode={editMode} value={`💬 ${block.label || 'WhatsApp'}`} onChange={v => updBlock(idx, { label: v.replace('💬 ','') })} />
                        </a>
                      </div>
                    </div>
                  )}
                  {block.type === 'music' && (
                    <div style={{...sectionStyle, textAlign:'center'}}>
                      <RoadStrip icon="🎵"/>
                      <div style={{ padding:'16px 22px 18px' }}>
                        <p style={{ fontFamily:display, fontSize:8, fontWeight:700, letterSpacing:'0.42em', textTransform:'uppercase', color:hexToRgba(C.sky,.7), margin:'0 0 8px' }}>🎵 Muzică</p>
                        <InlineEdit
                          editMode={editMode}
                          value={block.musicTitle || 'Melodia evenimentului'}
                          onChange={v => updBlock(idx, { musicTitle: v })}
                          style={{ fontFamily:serif, fontSize:13, fontStyle:'italic', color:'rgba(255,255,255,.5)', margin:0 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {editMode && (
                  <InsertBlockButton
                    insertIdx={idx}
                    openInsertAt={openInsertAt}
                    setOpenInsertAt={setOpenInsertAt}
                    BLOCK_TYPES={BLOCK_TYPES}
                    onInsert={(type, def) => handleInsertAt(idx, type, def)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop:24, textAlign:"center" }}>
            <RoadDivider/>
            <p style={{ fontFamily:serif, fontSize:11, fontStyle:"italic",
              color:"rgba(255,255,255,0.2)", marginTop:12 }}>
              cu drag · WeddingPro ✈️
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdventureRoadTemplate;