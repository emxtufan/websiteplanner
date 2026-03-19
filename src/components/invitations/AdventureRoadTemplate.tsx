import React, { useState, useEffect, useRef } from "react";
import { InvitationTemplateProps, TemplateMeta } from "./types";

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

// Nav buttons
const NavButtons: React.FC<{ address?:string }> = ({ address }) => {
  if (!address) return null;
  const enc = encodeURIComponent(address);
  const display = "'Baloo 2','Nunito',system-ui,sans-serif";
  return (
    <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:10 }}>
      {[
        [`https://waze.com/ul?q=${enc}&navigate=yes`,"🧭 Waze"],
        [`https://maps.google.com/?q=${enc}`,"📍 Maps"],
      ].map(([href,label]) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
          display:"flex", alignItems:"center", gap:4, padding:"5px 14px", borderRadius:99,
          fontSize:9, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase",
          textDecoration:"none", fontFamily:display,
          background:"rgba(56,189,248,0.1)", border:"2px solid rgba(56,189,248,0.3)",
          color:"rgba(125,211,252,0.9)" }}>{label}</a>
      ))}
    </div>
  );
};

// Glass card
const GlassCard: React.FC<{ children:React.ReactNode; style?:React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background:"rgba(255,255,255,0.07)",
    backdropFilter:"blur(12px)",
    borderRadius:18,
    border:"1.5px solid rgba(125,211,252,0.2)",
    padding:"20px 24px",
    boxShadow:"0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
    position:"relative",
    overflow:"hidden",
    ...style,
  }}>
    <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:"1.5px",
      background:"linear-gradient(to right,transparent,rgba(125,211,252,0.3),transparent)",
      pointerEvents:"none" }}/>
    {children}
  </div>
);

// Location card
const LocCard: React.FC<{ label:string; time?:string; name?:string; address?:string; icon?:string }> =
  ({ label, time, name, address, icon="🚩" }) => {
  const display = "'Baloo 2','Nunito',system-ui,sans-serif";
  const serif   = "'Cormorant Garamond',Georgia,serif";
  return (
    <GlassCard>
      <p style={{ fontFamily:display, fontSize:8, fontWeight:700, letterSpacing:"0.42em",
        textTransform:"uppercase", color:"rgba(125,211,252,0.6)", margin:"0 0 12px" }}>
        {icon} {label}
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"auto 1.5px 1fr", gap:"0 16px", alignItems:"start" }}>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontFamily:display, fontSize:28, fontWeight:800, color:"white",
            margin:0, lineHeight:1, textShadow:"0 0 16px rgba(56,189,248,0.4)" }}>{time}</p>
          <p style={{ fontFamily:serif, fontSize:10, fontStyle:"italic",
            color:"rgba(255,255,255,0.3)", margin:"2px 0 0" }}>ora</p>
        </div>
        <div style={{ background:"rgba(125,211,252,0.15)", alignSelf:"stretch" }}/>
        <div style={{ paddingTop:2 }}>
          <p style={{ fontFamily:display, fontSize:13, fontWeight:700, color:"white",
            margin:"0 0 2px", lineHeight:1.3 }}>{name}</p>
          {address && (
            <p style={{ fontFamily:"'Nunito',system-ui", fontSize:11,
              color:"rgba(255,255,255,0.38)", margin:0, lineHeight:1.5 }}>{address}</p>
          )}
        </div>
      </div>
      <NavButtons address={address || name}/>
    </GlassCard>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────

const AdventureRoadTemplate: React.FC<InvitationTemplateProps> = ({ data, onOpenRSVP }) => {
  const { profile, guest } = data;
  const timeline   = profile.timeline   ? JSON.parse(profile.timeline)   : [];
  const godparents = profile.godparents ? JSON.parse(profile.godparents) : [];

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

  return (
    <>
      {showIntro && (
        <RoadIntro initial={initial} name={babyName} onDone={handleIntroDone}/>
      )}

      <div style={{
        minHeight:"100vh",
        background:"linear-gradient(180deg,#0c2340 0%,#0d3460 30%,#1e3a5f 70%,#162e4d 100%)",
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
          background:"radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)" }}/>
        <div style={{ position:"fixed", bottom:"15%", right:"5%", width:280, height:280,
          borderRadius:"50%", pointerEvents:"none", zIndex:0,
          background:"radial-gradient(circle,rgba(251,191,36,0.08) 0%,transparent 70%)" }}/>

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
                <p style={{ fontFamily:serif, fontSize:14, fontStyle:"italic",
                  color:"rgba(255,255,255,0.45)", margin:"0 0 16px", lineHeight:1.7 }}>
                  {texts.welcome}
                </p>
              )}

              {/* Name */}
              <h1 style={{ fontFamily:display, fontSize:58, fontWeight:800,
                color:"white", margin:"0 0 4px", lineHeight:1.05,
                textShadow:"0 4px 20px rgba(14,165,233,0.4), 0 2px 0 rgba(0,0,0,0.2)",
                letterSpacing:-1 }}>
                {profile.partner1Name || "Prenume"}
              </h1>

              {profile.showCelebrationText && (
                <p style={{ fontFamily:serif, fontSize:15, fontStyle:"italic",
                  color:"rgba(125,211,252,0.55)", margin:"10px 0 0" }}>
                  vă invită la {texts.celebration}
                </p>
              )}

              <div style={{ margin:"22px 0" }}><RoadDivider/></div>

              {/* Date */}
              <p style={{ fontFamily:display, fontSize:13, fontWeight:700,
                color:"rgba(255,255,255,0.55)", textTransform:"capitalize",
                letterSpacing:"0.03em", margin:"0 0 22px" }}>
                🗓 {formattedDate}
              </p>

              {/* COUNTDOWN */}
              <div style={{ margin:"0 0 24px" }}>
                <RoadCountdown targetDate={profile.weddingDate}/>
              </div>

              <div style={{ margin:"0 0 20px" }}><RoadDivider/></div>

              {/* Guest */}
              <div style={{ background:"rgba(56,189,248,0.08)",
                border:"2px solid rgba(56,189,248,0.2)",
                borderRadius:14, padding:"14px 20px" }}>
                <p style={{ fontFamily:display, fontSize:9, fontWeight:700,
                  letterSpacing:"0.38em", textTransform:"uppercase",
                  color:"rgba(125,211,252,0.5)", margin:"0 0 5px" }}>
                  🎟 Invitat special
                </p>
                <p style={{ fontFamily:serif, fontSize:22, fontWeight:400,
                  color:"white", margin:0, letterSpacing:1 }}>
                  {guest?.name || "Nume Invitat"}
                </p>
              </div>
            </div>
          </div>

          {/* ── LOCATIONS ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:10 }}>
            {profile.showCivil && (
              <LocCard icon="🏛" label={texts.civilLabel} time={profile.civilTime||"11:00"}
                name={profile.civilLocationName||"Primăria"}
                address={profile.civilLocationAddress}/>
            )}
            {profile.showChurch && (
              <LocCard icon="✝️" label={texts.eventLabel} time={profile.churchTime||"11:00"}
                name={profile.churchLocationName||"Locație Ceremonie"}
                address={profile.churchLocationAddress}/>
            )}
            {profile.showVenue && (
              <LocCard icon="🎉" label={texts.partyLabel} time={profile.eventTime||"13:00"}
                name={profile.locationName||"Locație Petrecere"}
                address={profile.locationAddress}/>
            )}
          </div>

          {/* ── GODPARENTS ── */}
          {profile.showGodparents && godparents.length > 0 && (
            <GlassCard style={{ marginTop:10, textAlign:"center" }}>
              <p style={{ fontFamily:display, fontSize:8, fontWeight:700, letterSpacing:"0.42em",
                textTransform:"uppercase", color:"rgba(125,211,252,0.55)", margin:"0 0 14px" }}>
                🧿 Nași
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {godparents.map((p:any,i:number) => (
                  <p key={i} style={{ fontFamily:serif, fontSize:18, fontWeight:300,
                    color:"rgba(255,255,255,0.8)", margin:0, letterSpacing:1 }}>
                    {p.godfather}
                    <span style={{ color:"#fbbf24", margin:"0 8px", fontStyle:"italic" }}>&amp;</span>
                    {p.godmother}
                  </p>
                ))}
              </div>
            </GlassCard>
          )}

          {/* ── TIMELINE ── */}
          {profile.showTimeline && timeline.length > 0 && (
            <GlassCard style={{ marginTop:10 }}>
              <p style={{ fontFamily:display, fontSize:8, fontWeight:700, letterSpacing:"0.42em",
                textTransform:"uppercase", color:"rgba(125,211,252,0.55)",
                textAlign:"center", margin:"0 0 18px" }}>🗺 Programul Zilei</p>
              <div style={{ display:"flex", flexDirection:"column" }}>
                {timeline.map((item:any,i:number) => (
                  <div key={item.id} style={{ display:"grid",
                    gridTemplateColumns:"52px 24px 1fr", alignItems:"stretch", minHeight:40 }}>
                    <div style={{ display:"flex", alignItems:"flex-start",
                      justifyContent:"flex-end", paddingRight:8, paddingTop:3 }}>
                      <span style={{ fontFamily:display, fontSize:11, fontWeight:700,
                        color:"rgba(125,211,252,0.8)" }}>{item.time}</span>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                      {/* road dot */}
                      <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink:0, marginTop:4 }}>
                        <circle cx="6" cy="6" r="5" fill="none"
                          stroke="rgba(56,189,248,0.5)" strokeWidth="1.5"/>
                        <circle cx="6" cy="6" r="2.5" fill="#38bdf8"/>
                      </svg>
                      {i < timeline.length-1 && (
                        <div style={{ flex:1, width:"1.5px",
                          background:"rgba(56,189,248,0.2)",
                          marginTop:2, borderRadius:99,
                          backgroundImage:"repeating-linear-gradient(to bottom,rgba(56,189,248,0.3) 0,rgba(56,189,248,0.3) 5px,transparent 5px,transparent 10px)"
                        }}/>
                      )}
                    </div>
                    <div style={{ paddingLeft:10, paddingTop:2,
                      paddingBottom:i < timeline.length-1 ? 18 : 0 }}>
                      <span style={{ fontFamily:sans, fontSize:13, fontWeight:600,
                        color:"rgba(255,255,255,0.55)" }}>{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* ── RSVP ── */}
          <div style={{ marginTop:10 }}>
            <button
              onClick={() => onOpenRSVP && onOpenRSVP()}
              style={{
                width:"100%", padding:"18px 24px",
                background:"linear-gradient(135deg,#0ea5e9 0%,#2563eb 60%,#1d4ed8 100%)",
                border:"2px solid rgba(56,189,248,0.4)",
                borderRadius:18, cursor:"pointer",
                fontFamily:display, fontWeight:800, fontSize:13,
                letterSpacing:"0.25em", textTransform:"uppercase", color:"white",
                boxShadow:"0 8px 28px rgba(14,165,233,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                transition:"all 0.25s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px) scale(1.01)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 36px rgba(14,165,233,0.55), inset 0 1px 0 rgba(255,255,255,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(14,165,233,0.4), inset 0 1px 0 rgba(255,255,255,0.2)";
              }}
            >
              🚀 Confirmă Prezența 🚀
            </button>
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
