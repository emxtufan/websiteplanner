import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";

export const meta: TemplateMeta = {
  id: 'garden-romantic',
  name: 'Garden Romantic',
  category: 'wedding',
  description: 'Nuntă în grădină — arcade florale, fairy lights, pasteluri și petale în vânt.',
  colors: ['#1a0e2e', '#d4a0b0', '#6b8f5e'],
  previewClass: "bg-purple-950 border-rose-300",
  elementsClass: "bg-rose-400",
};

const SERIF   = "'Cormorant Garamond','Playfair Display',Georgia,serif";
const SANS    = "'DM Sans','Helvetica Neue',system-ui,sans-serif";

// ─── Petal particles ──────────────────────────────────────────────────────────
interface Petal { id:number; x:number; size:number; dur:number; delay:number; color:string; rot:number }
function makeParticles(n: number): Petal[] {
  const colors = ["#f9b8c4","#fde68a","#c4b5fd","#bbf7d0","#fbcfe8","#fca5a5","#d9f99d"];
  return Array.from({length:n}, (_,i) => ({
    id:i, x:Math.random()*100, size:6+Math.random()*10,
    dur:3+Math.random()*3, delay:Math.random()*3,
    color:colors[Math.floor(Math.random()*colors.length)], rot:Math.random()*360,
  }));
}

// ─── INTRO ────────────────────────────────────────────────────────────────────
const GardenIntro: React.FC<{ l1:string; l2:string; name1:string; name2:string; onDone:()=>void }> =
  ({ l1, l2, name1, name2, onDone }) => {
  const showSecond = !!l2 && l2 !== l1;
  const [phase, setPhase] = useState(0);
  const [petals]  = useState(() => makeParticles(22));
  const [lights]  = useState(() => Array.from({length:28}, (_,i) => ({
    id:i, x:8+(i%14)*6.5+(Math.floor(i/14)*3),
    y:20+Math.sin(i*0.8)*8+(Math.floor(i/14)*18),
    size:3+Math.random()*3, delay:Math.random()*0.6,
    color:["#fde68a","#fef3c7","#fff7ed","#fffbeb"][i%4],
  })));

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => setPhase(4), 1500),
      setTimeout(() => setPhase(5), 2000),
      setTimeout(() => setPhase(6), 2400),
      setTimeout(() => setPhase(7), 3200),
      setTimeout(() => setPhase(8), 3900),
      setTimeout(onDone, 4600),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const archLen = 2 * Math.PI * 110;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999, overflow:"hidden",
      background: phase>=1
        ? "linear-gradient(180deg,#1a0e2e 0%,#2d1b3d 35%,#3d2952 70%,#1e1628 100%)"
        : "#0d0812",
      transition:"background 1.2s",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      opacity: phase===8 ? 0 : 1,
      transition2: phase===8 ? "opacity 0.8s ease-in-out" : undefined,
      pointerEvents: phase===8 ? "none" : "auto",
    } as any}>

      {/* Starfield */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:70}, (_,i) => (
          <circle key={i}
            cx={Math.sin(i*37.3)*50+50} cy={Math.cos(i*22.7)*50+50}
            r={i%7===0?0.55:i%4===0?0.4:0.25} fill="white"
            opacity={phase>=1 ? (0.15+Math.sin(i)*0.12) : 0}
            style={{ transition:`opacity 0.5s ${i*0.01}s`,
              animation:phase>=1 ? `gr-star ${2+i%4}s ease-in-out infinite ${i*0.15}s` : "none" }}/>
        ))}
      </svg>

      {/* Moon */}
      <div style={{ position:"absolute", top:"6%", right:"8%",
        opacity: phase>=1 ? 1 : 0, transition:"opacity 1.5s" }}>
        <div style={{ position:"relative", width:50, height:50 }}>
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"#fef9c3", opacity:0.88 }}/>
          <div style={{ position:"absolute", top:-4, right:-4, width:36, height:36, borderRadius:"50%",
            background:"#2d1b3d", opacity:0.92 }}/>
          <div style={{ position:"absolute", inset:-10, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(253,230,138,0.15) 0%,transparent 70%)" }}/>
        </div>
      </div>

      {/* Fairy lights string 1 */}
      <svg style={{ position:"absolute", top:"6%", left:0, width:"100%", height:90, pointerEvents:"none" }}
        viewBox="0 0 100 18" preserveAspectRatio="xMidYMin slice">
        <path d="M0,8 Q25,4 50,8 Q75,12 100,6" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" fill="none"/>
        {lights.slice(0,14).map(l => (
          <g key={l.id} opacity={phase>=3?1:0} style={{ transition:`opacity 0.3s ${l.delay}s` }}>
            <circle cx={l.x} cy={l.y} r={l.size*1.8} fill={l.color} opacity="0.07"/>
            <circle cx={l.x} cy={l.y} r={l.size*1.2} fill={l.color} opacity="0.14"/>
            <ellipse cx={l.x} cy={l.y} rx={l.size*0.55} ry={l.size*0.7} fill={l.color} opacity="0.92"/>
            <rect x={l.x-0.8} y={l.y-l.size*0.7-1.2} width="1.6" height="1.5" rx="0.4" fill="rgba(255,255,255,0.3)"/>
          </g>
        ))}
      </svg>

      {/* Fairy lights string 2 */}
      <svg style={{ position:"absolute", top:"18%", left:0, width:"100%", height:60, pointerEvents:"none" }}
        viewBox="0 0 100 12" preserveAspectRatio="xMidYMin slice">
        <path d="M0,6 Q25,2 50,6 Q75,10 100,6" stroke="rgba(255,255,255,0.07)" strokeWidth="0.3" fill="none"/>
        {[8,18,29,40,51,62,72,82,92].map((lx,i) => {
          const ly=6+Math.sin(i)*2; const c=["#fde68a","#fef3c7","#fff7ed"][i%3];
          return (
            <g key={i} opacity={phase>=3?1:0} style={{ transition:`opacity 0.3s ${i*0.08+0.3}s` }}>
              <circle cx={lx} cy={ly} r="2.2" fill={c} opacity="0.12"/>
              <ellipse cx={lx} cy={ly} rx="1.1" ry="1.4" fill={c} opacity="0.88"/>
            </g>
          );
        })}
      </svg>

      {/* Floral arch */}
      <svg width="320" height="340" viewBox="0 0 320 340" fill="none"
        style={{ position:"absolute", bottom:"6%", left:"50%", transform:"translateX(-50%)", pointerEvents:"none" }}>
        {phase>=2 && <>
          <path d="M50 340 C50 280 60 220 80 170 C90 150 100 130 110 115"
            stroke="#6b8f5e" strokeWidth="2.5" fill="none" strokeLinecap="round"
            strokeDasharray="220" strokeDashoffset="0"
            style={{ animation:"gr-draw 0.9s ease-out forwards" }}/>
          <path d="M270 340 C270 280 260 220 240 170 C230 150 220 130 210 115"
            stroke="#6b8f5e" strokeWidth="2.5" fill="none" strokeLinecap="round"
            strokeDasharray="220" strokeDashoffset="0"
            style={{ animation:"gr-draw 0.9s 0.1s ease-out forwards" }}/>
          <path d="M108 115 Q135 88 160 82 Q185 76 212 115"
            stroke="#6b8f5e" strokeWidth="2" fill="none" strokeLinecap="round"
            style={{ animation:"gr-draw 0.7s 0.3s ease-out forwards" }}/>
        </>}

        {/* Foliage */}
        {phase>=2 && [
          [62,310,1.0],[70,280,0.85],[82,250,0.9],[95,222,0.8],[108,195,0.85],[118,168,0.8],[112,140,0.75],
          [258,310,1.0],[250,280,0.85],[238,250,0.9],[225,222,0.8],[212,195,0.85],[202,168,0.8],[208,140,0.75],
          [138,100,0.8],[155,88,0.85],[170,84,0.85],[185,88,0.8],[200,98,0.75],
        ].map(([lx,ly,ls],i) => (
          <g key={i} opacity={phase>=2?(ls as number):0} style={{ transition:`opacity 0.3s ${i*0.04}s` }}>
            <ellipse cx={lx} cy={ly} rx={10*(ls as number)} ry={8*(ls as number)}
              fill="#6b8f5e" opacity="0.7" transform={`rotate(${(i%3-1)*20} ${lx} ${ly})`}/>
            <ellipse cx={lx-4} cy={ly-4} rx={7*(ls as number)} ry={6*(ls as number)}
              fill="#7aaa6e" opacity="0.55" transform={`rotate(${(i%2)*15} ${lx-4} ${ly-4})`}/>
          </g>
        ))}

        {/* Flowers */}
        {[
          [72,295,"#f9b8c4","#fde68a",0],[88,262,"#c4b5fd","#fde68a",0.1],
          [104,230,"#fca5a5","#fbbf24",0.05],[116,200,"#f9b8c4","#fde68a",0.15],
          [112,168,"#c4b5fd","#fbbf24",0.08],[118,140,"#fbcfe8","#fde68a",0.2],
          [248,295,"#f9b8c4","#fde68a",0.03],[232,262,"#a7f3d0","#fde68a",0.12],
          [216,230,"#fca5a5","#fbbf24",0.08],[204,200,"#f9b8c4","#fde68a",0.18],
          [208,168,"#c4b5fd","#fbbf24",0.04],[202,140,"#fbcfe8","#fde68a",0.22],
          [140,102,"#f9b8c4","#fde68a",0.18],[157,88,"#fca5a5","#fbbf24",0.22],
          [173,84,"#c4b5fd","#fde68a",0.25],[190,90,"#f9b8c4","#fbbf24",0.2],
        ].map(([fx,fy,pc,cc,fd],i) => (
          <g key={i} opacity={phase>=2?1:0} style={{ transition:`opacity 0.4s ${(fd as number)+0.3}s` }}>
            {[0,72,144,216,288].map((a,pi) => {
              const rad=((a-90)*Math.PI)/180;
              const px=(fx as number)+Math.cos(rad)*7, py=(fy as number)+Math.sin(rad)*7;
              return <ellipse key={pi} cx={px} cy={py} rx="4.5" ry="7"
                fill={pc as string} opacity="0.82" transform={`rotate(${a},${px},${py})`}/>;
            })}
            <circle cx={fx as number} cy={fy as number} r="4.5" fill={cc as string} opacity="0.95"/>
            <circle cx={fx as number} cy={fy as number} r="2.5" fill="white" opacity="0.4"/>
          </g>
        ))}
      </svg>

      {/* Falling petals */}
      {phase>=6 && petals.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:"-5%",
          width:p.size, height:p.size, borderRadius:"50% 0 50% 0",
          background:p.color, opacity:0.7,
          animation:`gr-petal ${p.dur}s ${p.delay}s ease-in infinite`,
          transform:`rotate(${p.rot}deg)`, pointerEvents:"none",
        }}/>
      ))}

      {/* Ground glow */}
      <div style={{
        position:"absolute", bottom:"6%", left:"50%", transform:"translateX(-50%)",
        width:200, height:60,
        background:"radial-gradient(ellipse,rgba(212,160,176,0.18) 0%,transparent 70%)",
        opacity:phase>=3?1:0, transition:"opacity 1s", pointerEvents:"none",
      }}/>

      {/* Initials */}
      <div style={{
        position:"relative", zIndex:10, textAlign:"center", marginBottom:14,
        opacity:phase>=4?1:0, transform:phase>=4?"translateY(0) scale(1)":"translateY(20px) scale(0.85)",
        transition:"opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
          <span style={{ fontFamily:SERIF, fontSize:100, fontWeight:300, lineHeight:1,
            color:"white", letterSpacing:-4,
            textShadow:"0 0 60px rgba(212,160,176,0.5), 0 2px 0 rgba(0,0,0,0.15)" }}>{l1}</span>
          {showSecond && <>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              opacity:phase>=4?1:0, transform:phase>=4?"scale(1)":"scale(0)",
              transition:"opacity 0.35s 0.25s, transform 0.35s 0.25s cubic-bezier(0.34,1.6,0.64,1)" }}>
              <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(253,230,138,0.6)" }}/>
              <span style={{ fontFamily:SERIF, fontSize:28, fontStyle:"italic",
                color:"rgba(253,230,138,0.8)", lineHeight:1 }}>&</span>
              <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(253,230,138,0.6)" }}/>
            </div>
            <span style={{ fontFamily:SERIF, fontSize:100, fontWeight:300, lineHeight:1,
              color:"white", letterSpacing:-4,
              textShadow:"0 0 60px rgba(212,160,176,0.5), 0 2px 0 rgba(0,0,0,0.15)" }}>{l2}</span>
          </>}
        </div>
      </div>

      {/* Names */}
      <div style={{ textAlign:"center", position:"relative", zIndex:10,
        opacity:phase>=5?1:0, transform:phase>=5?"translateY(0)":"translateY(10px)",
        transition:"opacity 0.5s, transform 0.5s" }}>
        <p style={{ fontFamily:SERIF, fontSize:17, fontWeight:300, fontStyle:"italic",
          color:"rgba(255,255,255,0.65)", letterSpacing:3, margin:0 }}>
          {name1}{showSecond?` & ${name2}`:''}
        </p>
        <p style={{ fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:"0.5em",
          textTransform:"uppercase", color:"rgba(253,230,138,0.4)", marginTop:8 }}>
          vă invită{showSecond?' la nunta lor':''}
        </p>
      </div>

      <style>{`
        @keyframes gr-star  { 0%,100%{opacity:.15} 50%{opacity:.45} }
        @keyframes gr-petal { 0%{transform:translateY(0) rotate(0deg) translateX(0);opacity:.7}
                              100%{transform:translateY(110vh) rotate(540deg) translateX(40px);opacity:0} }
        @keyframes gr-draw  { from{stroke-dashoffset:220} to{stroke-dashoffset:0} }
      `}</style>
    </div>
  );
};

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0, expired:true };
    return { days:Math.floor(diff/86400000), hours:Math.floor((diff%86400000)/3600000),
      minutes:Math.floor((diff%3600000)/60000), seconds:Math.floor((diff%60000)/1000), expired:false };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { if (!target) return; const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [target]);
  return t;
}

const FlipDigit: React.FC<{ value:number }> = ({ value }) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value) { setFlash(true); const t = setTimeout(() => setFlash(false), 320); prev.current = value; return () => clearTimeout(t); }
  }, [value]);
  return (
    <div style={{ width:54, height:64, background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(212,160,176,0.35)",
      borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden", boxShadow:"0 4px 18px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
      <div style={{ position:"absolute", left:0, right:0, top:"50%", height:1, background:"rgba(212,160,176,0.2)", zIndex:2 }}/>
      <span style={{ fontFamily:SERIF, fontSize:32, fontWeight:400, color:"white", lineHeight:1, zIndex:1,
        transform:flash?"translateY(-3px)":"translateY(0)", transition:"transform 0.16s cubic-bezier(0.4,0,0.2,1)", display:"block" }}>
        {String(value).padStart(2,'0')}
      </span>
      <div style={{ position:"absolute", inset:0, background:"#d4a0b0",
        opacity:flash?0.1:0, transition:"opacity 0.32s", pointerEvents:"none" }}/>
    </div>
  );
};

// ─── Decorative components ────────────────────────────────────────────────────
const FloralDivider = () => (
  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
    <div style={{ flex:1, height:"0.7px", background:"linear-gradient(to right,transparent,rgba(212,160,176,0.35))" }}/>
    <svg width="64" height="22" viewBox="0 0 64 22" fill="none">
      <path d="M2,11 Q8,6 14,9 Q8,10 2,11Z" fill="#7aaa6e" opacity="0.55"/>
      <path d="M2,11 Q8,16 14,13 Q8,12 2,11Z" fill="#7aaa6e" opacity="0.45"/>
      {[0,72,144,216,288].map((a,i) => {
        const r=((a-90)*Math.PI)/180;
        return <ellipse key={i} cx={32+Math.cos(r)*7} cy={11+Math.sin(r)*7}
          rx="3.5" ry="6" fill="#f9b8c4" opacity="0.8"
          transform={`rotate(${a},${32+Math.cos(r)*7},${11+Math.sin(r)*7})`}/>;
      })}
      <circle cx="32" cy="11" r="4.5" fill="#fbbf24" opacity="0.9"/>
      <circle cx="32" cy="11" r="2.5" fill="white" opacity="0.45"/>
      <path d="M62,11 Q56,6 50,9 Q56,10 62,11Z" fill="#7aaa6e" opacity="0.55"/>
      <path d="M62,11 Q56,16 50,13 Q56,12 62,11Z" fill="#7aaa6e" opacity="0.45"/>
    </svg>
    <div style={{ flex:1, height:"0.7px", background:"linear-gradient(to left,transparent,rgba(212,160,176,0.35))" }}/>
  </div>
);

const LightString = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:"4px 0", overflow:"hidden" }}>
    <svg viewBox="0 0 300 28" style={{ width:"100%", maxWidth:360, height:28 }} fill="none">
      <path d="M0,10 Q38,4 75,10 Q113,16 150,8 Q188,0 225,10 Q263,18 300,10"
        stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" fill="none"/>
      {[18,46,75,104,130,156,182,210,240,268].map((lx,i) => {
        const ly=10+Math.sin(i*0.9)*4;
        const c=["#fde68a","#fef3c7","#fca5a5","#fbcfe8","#c4b5fd"][i%5];
        return (
          <g key={i} style={{ animation:`gr-flicker2 ${1.8+i%3*0.5}s ease-in-out infinite ${i*0.18}s` }}>
            <circle cx={lx} cy={ly} r="4.5" fill={c} opacity="0.08"/>
            <ellipse cx={lx} cy={ly} rx="1.4" ry="1.9" fill={c} opacity="0.85"/>
            <rect x={lx-0.9} y={ly-2.9} width="1.8" height="1.4" rx="0.4" fill="rgba(212,160,176,0.3)"/>
          </g>
        );
      })}
    </svg>
    <style>{`@keyframes gr-flicker2{0%,100%{opacity:1}50%{opacity:0.55}}`}</style>
  </div>
);

// ─── Hero arch illustration (static, used in content) ─────────────────────────
const GardenHero = () => {
  const [lights] = useState(() => Array.from({length:32}, (_,i) => ({
    x:2+(i%16)*6.4, y:i<16?8+Math.sin(i*0.7)*5:22+Math.sin(i*0.9)*4,
    r:1.8+Math.sin(i)*0.8, c:["#fde68a","#fef3c7","#fff7ed","#fffbeb"][i%4], d:i*0.1,
  })));
  return (
    <svg viewBox="0 0 420 300" fill="none"
      style={{ position:"absolute", top:0, left:0, width:"100%", height:300, pointerEvents:"none" }}>
      <defs>
        <linearGradient id="gr-bg2" x1="0" y1="0" x2="0" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a0e2e"/><stop offset="55%" stopColor="#2d1b3d"/><stop offset="100%" stopColor="#3d2952"/>
        </linearGradient>
        <radialGradient id="gr-glow2" cx="50%" cy="80%" r="40%">
          <stop offset="0%" stopColor="#d4a0b0" stopOpacity="0.15"/><stop offset="100%" stopColor="#d4a0b0" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="420" height="300" fill="url(#gr-bg2)"/>
      <rect width="420" height="300" fill="url(#gr-glow2)"/>
      {Array.from({length:55},(_,i)=>(
        <circle key={i} cx={(Math.sin(i*41.3)*210)+210} cy={(Math.cos(i*23.7)*150)+75}
          r={i%9===0?1.1:i%5===0?0.75:0.45} fill="white" opacity={0.12+Math.sin(i)*0.1}/>
      ))}
      {/* Moon */}
      <circle cx="345" cy="42" r="22" fill="#fef9c3" opacity="0.88"/>
      <circle cx="356" cy="34" r="17" fill="#2d1b3d" opacity="0.92"/>
      <circle cx="345" cy="42" r="30" fill="#fde68a" opacity="0.06"/>
      {/* Light strings */}
      <path d="M0,28 Q105,18 210,26 Q315,34 420,22" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" fill="none"/>
      <path d="M0,42 Q105,50 210,40 Q315,30 420,45" stroke="rgba(255,255,255,0.07)" strokeWidth="0.35" fill="none"/>
      {lights.map((l,i)=>(
        <g key={i} style={{ animation:`gr-flicker ${1.5+i%4*0.4}s ease-in-out infinite ${l.d}s` }}>
          <circle cx={l.x*4.2} cy={l.y} r={l.r*2.5} fill={l.c} opacity="0.06"/>
          <ellipse cx={l.x*4.2} cy={l.y} rx={l.r*0.7} ry={l.r} fill={l.c} opacity="0.9"/>
        </g>
      ))}
      {/* Arch pillars */}
      <path d="M88 300 C88 240 96 180 108 130 C116 105 124 88 132 75" stroke="#4a6b3a" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M332 300 C332 240 324 180 312 130 C304 105 296 88 288 75" stroke="#4a6b3a" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M130 77 Q175 50 210 44 Q245 38 290 73" stroke="#4a6b3a" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      {/* Foliage */}
      {[[96,285],[100,260],[106,235],[112,210],[120,185],[126,160],[128,135],
        [324,285],[320,260],[314,235],[308,210],[300,185],[294,160],[292,135],
        [140,80],[158,60],[178,50],[198,46],[218,52],[238,68]
      ].map(([gx,gy],i)=>(
        <g key={i}>
          <ellipse cx={gx} cy={gy} rx={13} ry={9} fill="#5a8050" opacity="0.65" transform={`rotate(${(i%3-1)*22} ${gx} ${gy})`}/>
          <ellipse cx={gx+4} cy={gy-5} rx={8} ry={6} fill="#6b9660" opacity="0.5" transform={`rotate(${(i%2)*18} ${gx+4} ${gy-5})`}/>
        </g>
      ))}
      {/* Flowers */}
      {[[98,270,"#f9b8c4","#fde68a"],[104,242,"#c4b5fd","#fde68a"],[112,214,"#fca5a5","#fbbf24"],
        [118,185,"#fbcfe8","#fde68a"],[124,158,"#f9b8c4","#fde68a"],[128,132,"#c4b5fd","#fde68a"],
        [322,270,"#fca5a5","#fbbf24"],[316,242,"#f9b8c4","#fde68a"],[308,214,"#c4b5fd","#fde68a"],
        [302,185,"#fbcfe8","#fde68a"],[296,158,"#fca5a5","#fbbf24"],[292,132,"#f9b8c4","#fde68a"],
        [142,82,"#fbcfe8","#fde68a"],[158,64,"#fca5a5","#fbbf24"],[178,52,"#f9b8c4","#fde68a"],
        [198,47,"#c4b5fd","#fde68a"],[218,53,"#fbcfe8","#fde68a"],[236,68,"#fca5a5","#fbbf24"],
      ].map(([fx,fy,pc,cc],i)=>(
        <g key={i}>
          {[0,72,144,216,288].map((a,pi)=>{
            const r=((a-90)*Math.PI)/180;
            return <ellipse key={pi} cx={(fx as number)+Math.cos(r)*7} cy={(fy as number)+Math.sin(r)*7}
              rx="4" ry="6.5" fill={pc as string} opacity="0.8"
              transform={`rotate(${a},${(fx as number)+Math.cos(r)*7},${(fy as number)+Math.sin(r)*7})`}/>;
          })}
          <circle cx={fx as number} cy={fy as number} r="4.5" fill={cc as string} opacity="0.92"/>
          <circle cx={fx as number} cy={fy as number} r="2.2" fill="white" opacity="0.45"/>
        </g>
      ))}
      <ellipse cx="210" cy="295" rx="120" ry="20" fill="#d4a0b0" opacity="0.07"/>
      <style>{`@keyframes gr-flicker{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
    </svg>
  );
};

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold:0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Block toolbar ────────────────────────────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-3.5 right-2 flex items-center gap-0.5 rounded-full border px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto shadow-lg"
    style={{ background:"rgba(45,27,61,0.95)", borderColor:"rgba(212,160,176,0.3)" }}>
    <button type="button" onClick={e=>{e.stopPropagation();onUp();}} disabled={isFirst} className="p-0.5 rounded-full disabled:opacity-20" style={{ color:"#d4a0b0" }} ><ChevronUp className="w-3 h-3"/></button>
    <button type="button" onClick={e=>{e.stopPropagation();onDown();}} disabled={isLast} className="p-0.5 rounded-full disabled:opacity-20" style={{ color:"#d4a0b0" }}><ChevronDown className="w-3 h-3"/></button>
    <div className="w-px h-3 mx-0.5" style={{ background:"rgba(212,160,176,0.3)" }}/>
    <button type="button" onClick={e=>{e.stopPropagation();onToggle();}} className="p-0.5 rounded-full" style={{ color:"#d4a0b0" }}>
      {visible ? <Eye className="w-3 h-3"/> : <EyeOff className="w-3 h-3 opacity-50"/>}
    </button>
    <button type="button" onClick={e=>{e.stopPropagation();onDelete();}} className="p-0.5 rounded-full hover:bg-red-900/30"><Trash2 className="w-3 h-3 text-red-400"/></button>
  </div>
);

// ─── Location card (with scroll reveal + inline edit) ─────────────────────────
const LocCard: React.FC<{ block:InvitationBlock; editMode:boolean; onUpdate:(p:Partial<InvitationBlock>)=>void }> =
  ({ block, editMode, onUpdate }) => {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{
      background:"rgba(255,255,255,0.07)", backdropFilter:"blur(10px)",
      borderRadius:16, border:"1.5px solid rgba(212,160,176,0.25)", padding:"20px 26px",
      boxShadow:"0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
      position:"relative", overflow:"hidden",
      opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(18px)",
      transition:"opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {/* Shimmer top */}
      <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:"1.5px",
        background:"linear-gradient(to right,transparent,rgba(212,160,176,0.3),transparent)", pointerEvents:"none" }}/>
      <InlineEdit tag="p" editMode={editMode} value={block.label||''} onChange={v=>onUpdate({label:v})} placeholder="Eveniment..."
        style={{ fontFamily:SANS, fontSize:8, fontWeight:700, letterSpacing:"0.45em", textTransform:"uppercase",
          color:"rgba(212,160,176,0.6)", margin:"0 0 12px", display:"block" }}/>
      <div style={{ display:"grid", gridTemplateColumns:"auto 1.5px 1fr", gap:"0 18px", alignItems:"start" }}>
        <div>
          <InlineTime value={block.time||''} onChange={v=>onUpdate({time:v})} editMode={editMode}
            className="text-white font-light" style={{ fontFamily:SERIF, fontSize:32, fontWeight:300, color:"white", display:"block" }}/>
          <p style={{ fontFamily:SANS, fontSize:8, color:"rgba(212,160,176,0.4)", margin:"2px 0 0" }}>ora</p>
        </div>
        <div style={{ background:"rgba(212,160,176,0.2)", alignSelf:"stretch" }}/>
        <div>
          <InlineEdit tag="p" editMode={editMode} value={block.locationName||''} onChange={v=>onUpdate({locationName:v})} placeholder="Locație..."
            style={{ fontFamily:SANS, fontSize:13, fontWeight:600, color:"white", margin:"0 0 3px", lineHeight:1.35 }}/>
          <InlineEdit tag="p" editMode={editMode} value={block.locationAddress||''} onChange={v=>onUpdate({locationAddress:v})} placeholder="Adresă..."
            style={{ fontFamily:SANS, fontSize:11, color:"rgba(212,160,176,0.5)", margin:0, lineHeight:1.5, fontStyle:"italic" }} multiline/>
        </div>
      </div>
      {(block.wazeLink||editMode) && (
        <div style={{ marginTop:10 }}><InlineWaze value={block.wazeLink||''} onChange={v=>onUpdate({wazeLink:v})} editMode={editMode}/></div>
      )}
    </div>
  );
};

// ─── Card wrapper (glassmorphism dark) ────────────────────────────────────────
const GlassCard: React.FC<{ children:React.ReactNode; style?:React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background:"rgba(255,255,255,0.06)", backdropFilter:"blur(10px)", borderRadius:16,
    border:"1.5px solid rgba(212,160,176,0.22)", padding:"20px 26px",
    boxShadow:"0 4px 28px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)", ...style }}>
    {children}
  </div>
);

// ─── Main Template ────────────────────────────────────────────────────────────
export type GardenRomanticProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const GardenRomanticTemplate: React.FC<GardenRomanticProps> = ({
  data, onOpenRSVP, editMode = false, introPreview = false, onProfileUpdate, onBlocksUpdate,
  onBlockSelect, selectedBlockId,
}) => {
  const { profile, guest } = data;

  const [showIntro, setShowIntro]           = useState(!editMode || introPreview);
  const [contentVisible, setContentVisible] = useState(editMode && !introPreview);

  useEffect(() => {
    if (editMode) {
      if (introPreview) { setShowIntro(true); setContentVisible(false); }
      else { setShowIntro(false); setContentVisible(true); }
      return;
    }
    setShowIntro(true); setContentVisible(false);
  }, [editMode, introPreview]);

  useEffect(() => {
    if (editMode) {
      ['overflow','position','top','left','right'].forEach(p => (document.body.style as any)[p] = '');
      return;
    }
    if (showIntro) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.inset    = '0';
    } else {
      ['overflow','position','top','left','right'].forEach(p => (document.body.style as any)[p] = '');
    }
    return () => { ['overflow','position','top','left','right'].forEach(p => (document.body.style as any)[p] = ''); };
  }, [showIntro, editMode]);

  const safeJSON = (s:string|undefined, fb:any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const [blocks, setBlocks]         = useState<InvitationBlock[]>(() => safeJSON(profile.customSections, []));
  const [godparents, setGodparents] = useState<any[]>(() => safeJSON(profile.godparents, []));
  const [parentsData, setParentsData] = useState<any>(() => safeJSON(profile.parents, {}));

  useEffect(() => { setBlocks(safeJSON(profile.customSections, [])); }, [profile.customSections]);
  useEffect(() => { setGodparents(safeJSON(profile.godparents, [])); }, [profile.godparents]);
  useEffect(() => { setParentsData(safeJSON(profile.parents, {})); }, [profile.parents]);

  const timeline: any[] = safeJSON(profile.timeline, []);
  const countdown = useCountdown(profile.weddingDate || '');

  // Debounced updates
  const _pq = useRef<Record<string,any>>({});
  const _pt = useRef<ReturnType<typeof setTimeout>|null>(null);
  const _bt = useRef<ReturnType<typeof setTimeout>|null>(null);

  const upProfile = useCallback((field:string, value:any) => {
    _pq.current = { ..._pq.current, [field]:value };
    if (_pt.current) clearTimeout(_pt.current);
    _pt.current = setTimeout(() => { onProfileUpdate?.(_pq.current); _pq.current = {}; }, 500);
  }, [onProfileUpdate]);

  const debBlocks = useCallback((nb:InvitationBlock[]) => {
    if (_bt.current) clearTimeout(_bt.current);
    _bt.current = setTimeout(() => onBlocksUpdate?.(nb), 500);
  }, [onBlocksUpdate]);

  const updBlock = useCallback((idx:number, patch:Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb=prev.map((b,i)=>i===idx?{...b,...patch}:b); debBlocks(nb); return nb; });
  }, [debBlocks]);

  const movBlock = useCallback((idx:number, dir:-1|1) => {
    setBlocks(prev => { const nb=[...prev]; const to=idx+dir; if(to<0||to>=nb.length) return prev; [nb[idx],nb[to]]=[nb[to],nb[idx]]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const delBlock = useCallback((idx:number) => {
    setBlocks(prev => { const nb=prev.filter((_,i)=>i!==idx); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const addBlock = useCallback((type:string, def:any) => {
    setBlocks(prev => { const nb=[...prev,{id:Date.now().toString(),type:type as any,show:true,...def}]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const updGodparent = (i:number, f:'godfather'|'godmother', v:string) => {
    setGodparents(prev => { const ng=prev.map((g,j)=>j===i?{...g,[f]:v}:g); upProfile('godparents',JSON.stringify(ng)); return ng; });
  };
  const addGodparent = () => setGodparents(prev => { const ng=[...prev,{godfather:'',godmother:''}]; upProfile('godparents',JSON.stringify(ng)); return ng; });
  const delGodparent = (i:number) => setGodparents(prev => { const ng=prev.filter((_,j)=>j!==i); upProfile('godparents',JSON.stringify(ng)); return ng; });
  const updParent = (field:string, val:string) => setParentsData((prev:any) => { const np={...prev,[field]:val}; upProfile('parents',JSON.stringify(np)); return np; });

  const welcomeText     = profile.welcomeText?.trim()     || 'vă invită la nunta lor';
  const celebrationText = profile.celebrationText?.trim() || 'căsătoriei';
  const rsvpText        = profile.rsvpButtonText?.trim()  || 'Confirmă Prezența';
  const showRsvp        = profile.showRsvpButton !== false;
  const isBaptism       = profile.eventType === 'baptism' || profile.eventType === 'kids';
  const displayBlocks   = editMode ? blocks : blocks.filter(b => b.show !== false);

  const l1    = (profile.partner1Name || 'A').charAt(0).toUpperCase();
  const l2    = isBaptism ? '' : (profile.partner2Name || 'M').charAt(0).toUpperCase();
  const name1 = profile.partner1Name || 'Alina';
  const name2 = profile.partner2Name || 'Mihai';

  const formattedDate = profile.weddingDate
    ? new Date(profile.weddingDate).toLocaleDateString('ro-RO', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : 'Data Evenimentului';

  const sep = (
    <div style={{ display:"flex", flexDirection:"column", gap:7, alignItems:"center", paddingBottom:22, flexShrink:0 }}>
      <div style={{ width:3.5, height:3.5, borderRadius:"50%", background:"rgba(212,160,176,0.45)" }}/>
      <div style={{ width:3.5, height:3.5, borderRadius:"50%", background:"rgba(212,160,176,0.45)" }}/>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes gr-star   {0%,100%{opacity:.15}50%{opacity:.45}}
        @keyframes gr-petal  {0%{transform:translateY(0) rotate(0deg) translateX(0);opacity:.7}100%{transform:translateY(110vh) rotate(540deg) translateX(40px);opacity:0}}
        @keyframes gr-draw   {from{stroke-dashoffset:220}to{stroke-dashoffset:0}}
        @keyframes gr-flicker{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes gr-cd-pulse{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.7);opacity:1}}
      `}</style>

      {showIntro && (
        <GardenIntro l1={l1} l2={l2} name1={name1} name2={name2}
          onDone={() => { window.scrollTo(0,0); setShowIntro(false); setTimeout(()=>{ window.scrollTo(0,0); setContentVisible(true); },60); }}/>
      )}

      {editMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-1.5 shadow-xl text-[10px] font-bold pointer-events-none select-none"
          style={{ background:"rgba(45,27,61,0.92)", border:"1px solid rgba(212,160,176,0.3)", color:"#d4a0b0", backdropFilter:"blur(8px)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#d4a0b0" }}/>
          <span className="uppercase tracking-widest">Editare Directă</span>
          <span className="font-normal" style={{ color:"rgba(212,160,176,0.5)" }}>— click pe orice text</span>
        </div>
      )}

      <div style={{
        minHeight:"100vh",
        background:"linear-gradient(180deg,#1a0e2e 0%,#2d1b3d 30%,#3d2952 65%,#2a1e3d 100%)",
        display:"flex", alignItems:"flex-start", justifyContent:"center",
        padding:`${editMode?56:0}px 16px 48px`, fontFamily:SANS,
        position:"relative", overflow:"hidden",
        opacity:contentVisible?1:0, transform:contentVisible?"translateY(0)":"translateY(14px)",
        transition:"opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s",
      }}>

        {/* Ambient glows */}
        <div style={{ position:"fixed", top:"8%", left:"5%", width:360, height:360, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(212,160,176,0.08) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"fixed", bottom:"12%", right:"5%", width:300, height:300, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(107,143,94,0.06) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>

        <div style={{ width:"100%", maxWidth:440, position:"relative", zIndex:1 }}>

          {/* ── HERO CARD ── */}
          <div style={{
            background:"rgba(255,255,255,0.04)", backdropFilter:"blur(16px)", borderRadius:24,
            border:"1.5px solid rgba(212,160,176,0.15)", overflow:"hidden", position:"relative",
            boxShadow:"0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
            <GardenHero/>
            <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"306px 32px 40px" }}>

              {profile.showWelcomeText && (
                <InlineEdit tag="p" editMode={editMode} value={welcomeText} onChange={v=>upProfile('welcomeText',v)}
                  placeholder="Text intro..." multiline
                  style={{ fontFamily:SERIF, fontSize:14, fontStyle:"italic", color:"rgba(255,255,255,0.45)",
                    margin:"0 0 18px", lineHeight:1.7, display:"block" }}/>
              )}

              {isBaptism ? (
                <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name||''} onChange={v=>upProfile('partner1Name',v)}
                  placeholder="Prenume"
                  style={{ fontFamily:SERIF, fontSize:60, fontWeight:300, lineHeight:1, color:"white",
                    display:"block", margin:"0 0 6px", letterSpacing:1,
                    textShadow:"0 0 50px rgba(212,160,176,0.4)" }}/>
              ) : (
                <div style={{ margin:"0 0 6px" }}>
                  <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name||''} onChange={v=>upProfile('partner1Name',v)}
                    placeholder="Alina"
                    style={{ fontFamily:SERIF, fontSize:52, fontWeight:300, lineHeight:1.05, color:"white",
                      display:"block", margin:0, letterSpacing:2,
                      textShadow:"0 0 50px rgba(212,160,176,0.35)" }}/>
                  <div style={{ display:"flex", alignItems:"center", gap:18, margin:"10px 0" }}>
                    <div style={{ flex:1, height:"0.5px", background:"rgba(212,160,176,0.2)" }}/>
                    <span style={{ fontFamily:SERIF, fontSize:30, fontStyle:"italic", color:"rgba(253,230,138,0.7)", lineHeight:1 }}>&</span>
                    <div style={{ flex:1, height:"0.5px", background:"rgba(212,160,176,0.2)" }}/>
                  </div>
                  <InlineEdit tag="h1" editMode={editMode} value={profile.partner2Name||''} onChange={v=>upProfile('partner2Name',v)}
                    placeholder="Mihai"
                    style={{ fontFamily:SERIF, fontSize:52, fontWeight:300, lineHeight:1.05, color:"white",
                      display:"block", margin:0, letterSpacing:2,
                      textShadow:"0 0 50px rgba(212,160,176,0.35)" }}/>
                </div>
              )}

              {profile.showCelebrationText && (
                <InlineEdit tag="p" editMode={editMode} value={celebrationText} onChange={v=>upProfile('celebrationText',v)}
                  placeholder="descriere eveniment..."
                  style={{ fontFamily:SERIF, fontSize:14, fontStyle:"italic", color:"rgba(212,160,176,0.55)",
                    margin:"12px 0 0", display:"block" }}/>
              )}

              <div style={{ margin:"24px 0" }}><FloralDivider/></div>

              {editMode ? (
                <input type="date" value={profile.weddingDate?new Date(profile.weddingDate).toISOString().split('T')[0]:''}
                  onChange={e=>upProfile('weddingDate',e.target.value)}
                  style={{ fontFamily:SERIF, fontSize:15, color:"rgba(255,255,255,0.6)", background:"transparent",
                    border:"none", borderBottom:"1px solid rgba(212,160,176,0.3)", outline:"none",
                    textAlign:"center", cursor:"pointer", padding:"2px 0", margin:"0 0 20px",
                    display:"block", width:"100%" }}/>
              ) : (
                <p style={{ fontFamily:SERIF, fontSize:15, color:"rgba(255,255,255,0.6)",
                  letterSpacing:"0.06em", textTransform:"capitalize", margin:"0 0 20px" }}>{formattedDate}</p>
              )}

              {/* Countdown */}
              {profile.showCountdown && profile.weddingDate && !countdown.expired && (
                <div style={{ margin:"0 0 24px" }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
                    <span style={{ fontFamily:SANS, fontSize:8, fontWeight:700, letterSpacing:"0.42em",
                      textTransform:"uppercase", color:"rgba(212,160,176,0.65)",
                      padding:"5px 16px", borderRadius:99,
                      background:"rgba(212,160,176,0.08)", border:"1.5px solid rgba(212,160,176,0.3)" }}>
                      ✿ Timp rămas
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"center", gap:6 }}>
                    {[countdown.days, countdown.hours, countdown.minutes, countdown.seconds].map((v,i) => (
                      <React.Fragment key={i}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>
                          <FlipDigit value={v}/>
                          <span style={{ fontFamily:SERIF, fontSize:11, fontStyle:"italic", color:"rgba(212,160,176,0.55)" }}>
                            {['Zile','Ore','Min','Sec'][i]}
                          </span>
                        </div>
                        {i < 3 && sep}
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:5, marginTop:11 }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:"#d4a0b0",
                      animation:"gr-cd-pulse 2s ease-in-out infinite", opacity:0.75 }}/>
                    <span style={{ fontFamily:SANS, fontSize:8, fontWeight:700, letterSpacing:"0.3em",
                      textTransform:"uppercase", color:"rgba(212,160,176,0.35)" }}>live</span>
                  </div>
                </div>
              )}

              <div style={{ margin:"0 0 20px" }}><FloralDivider/></div>

              {/* Guest badge */}
              <div style={{ background:"rgba(212,160,176,0.08)", border:"1.5px solid rgba(212,160,176,0.25)",
                borderRadius:12, padding:"14px 20px" }}>
                <p style={{ fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:"0.4em",
                  textTransform:"uppercase", color:"rgba(212,160,176,0.5)", margin:"0 0 6px" }}>Dragă</p>
                <p style={{ fontFamily:SERIF, fontSize:22, fontWeight:300, color:"white", margin:0, letterSpacing:1 }}>
                  {guest?.name || 'Nume Invitat'}
                </p>
              </div>
            </div>
          </div>

          <LightString/>

          {/* ── BLOCURI ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {displayBlocks.map((block) => {
              const isVisible = block.show !== false;
              const realIdx   = blocks.indexOf(block);

              return (
                <div key={block.id} className={cn("relative group/block", !isVisible && editMode && "opacity-30")}
                  onClick={editMode ? () => onBlockSelect?.(block, realIdx) : undefined}>
                  {editMode && (
                    <BlockToolbar
                      onUp={()=>movBlock(realIdx,-1)} onDown={()=>movBlock(realIdx,1)}
                      onToggle={()=>updBlock(realIdx,{show:!isVisible})} onDelete={()=>delBlock(realIdx)}
                      visible={isVisible} isFirst={realIdx===0} isLast={realIdx===blocks.length-1}
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
                  {block.type === 'location' && (
                    <LocCard block={block} editMode={editMode} onUpdate={p=>updBlock(realIdx,p)}/>
                  )}

                  {block.type === 'godparents' && (
                    <GlassCard>
                      <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle||'Nașii Noștri'} onChange={v=>updBlock(realIdx,{sectionTitle:v})} placeholder="Titlu..."
                        style={{ fontFamily:SANS, fontSize:8, fontWeight:700, letterSpacing:"0.45em", textTransform:"uppercase",
                          color:"rgba(212,160,176,0.55)", margin:"0 0 10px", display:"block", textAlign:"center" }}/>
                      <InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(realIdx,{content:v})} placeholder="Text introductiv..." multiline
                        style={{ fontFamily:SERIF, fontSize:13, fontStyle:"italic", color:"rgba(212,160,176,0.45)",
                          margin:"0 0 14px", display:"block", textAlign:"center" }}/>
                      <div style={{ display:"flex", flexDirection:"column", gap:8, textAlign:"center" }}>
                        {godparents.map((g:any,i:number)=>(
                          <div key={i} className={cn("flex items-center justify-center gap-2",editMode&&"group/gp")}>
                            <InlineEdit tag="span" editMode={editMode} value={g.godfather||''} onChange={v=>updGodparent(i,'godfather',v)} placeholder="Naș"
                              style={{ fontFamily:SERIF, fontSize:18, fontWeight:300, color:"rgba(255,255,255,0.82)", letterSpacing:1 }}/>
                            <span style={{ color:"#fde68a", margin:"0 8px", fontStyle:"italic", fontFamily:SERIF }}>& </span>
                            <InlineEdit tag="span" editMode={editMode} value={g.godmother||''} onChange={v=>updGodparent(i,'godmother',v)} placeholder="Nașă"
                              style={{ fontFamily:SERIF, fontSize:18, fontWeight:300, color:"rgba(255,255,255,0.82)", letterSpacing:1 }}/>
                            {editMode && <button type="button" onClick={()=>delGodparent(i)} className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-900/30"><Trash2 className="w-3 h-3 text-red-400"/></button>}
                          </div>
                        ))}
                        {editMode && <button type="button" onClick={addGodparent}
                          className="text-[10px] font-bold border border-dashed rounded-full px-2 py-0.5 flex items-center gap-1 mx-auto transition-colors"
                          style={{ color:"#d4a0b0", borderColor:"rgba(212,160,176,0.35)" }}>
                          <Plus className="w-2.5 h-2.5"/> adaugă
                        </button>}
                      </div>
                    </GlassCard>
                  )}

                  {block.type === 'parents' && (
                    <GlassCard>
                      <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle||'Părinții Noștri'} onChange={v=>updBlock(realIdx,{sectionTitle:v})} placeholder="Titlu..."
                        style={{ fontFamily:SANS, fontSize:8, fontWeight:700, letterSpacing:"0.45em", textTransform:"uppercase",
                          color:"rgba(212,160,176,0.55)", margin:"0 0 10px", display:"block", textAlign:"center" }}/>
                      <InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(realIdx,{content:v})} placeholder="Text introductiv..." multiline
                        style={{ fontFamily:SERIF, fontSize:13, fontStyle:"italic", color:"rgba(212,160,176,0.45)",
                          margin:"0 0 12px", display:"block", textAlign:"center" }}/>
                      <div style={{ display:"flex", flexDirection:"column", gap:4, alignItems:"center" }}>
                        {([
                          {key:'p1_father',ph:'Tatăl Miresei'},{key:'p1_mother',ph:'Mama Miresei'},
                          {key:'p2_father',ph:'Tatăl Mirelui'},{key:'p2_mother',ph:'Mama Mirelui'},
                        ] as const).map(({key,ph})=>{
                          const val=parentsData?.[key];
                          if(!val&&!editMode) return null;
                          return <InlineEdit key={key} tag="p" editMode={editMode} value={val||''} onChange={v=>updParent(key,v)} placeholder={ph}
                            style={{ fontFamily:SERIF, fontSize:16, fontWeight:300, color:"rgba(255,255,255,0.7)", margin:0, letterSpacing:0.5 }}/>;
                        })}
                      </div>
                    </GlassCard>
                  )}

                  {block.type === 'text' && (
                    <div style={{ textAlign:"center", padding:"8px 4px" }}>
                      <InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(realIdx,{content:v})} placeholder="Scrieți un mesaj..." multiline
                        style={{ fontFamily:SERIF, fontSize:14, fontStyle:"italic", color:"rgba(255,255,255,0.45)", lineHeight:1.8 }}/>
                    </div>
                  )}

                  {block.type === 'title' && (
                    <div style={{ textAlign:"center", padding:"4px 0" }}>
                      <InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(realIdx,{content:v})} placeholder="Titlu secțiune..."
                        style={{ fontFamily:SANS, fontSize:8, fontWeight:700, letterSpacing:"0.45em", textTransform:"uppercase", color:"rgba(212,160,176,0.55)" }}/>
                    </div>
                  )}

                  {block.type === 'divider' && <FloralDivider/>}
                  {block.type === 'spacer'  && <div style={{ height:16 }}/>}

                  {/* LightString between location blocks */}
                  {block.type === 'location' && realIdx < blocks.length-1 && blocks[realIdx+1]?.type === 'location' && (
                    <div style={{ marginTop:0 }}><LightString/></div>
                  )}
                  </BlockStyleProvider>
                </div>
              );
            })}
          </div>

          {/* Add block strip */}
          {editMode && (
            <div className="text-center mt-4 py-4 border-2 border-dashed rounded-2xl transition-colors"
              style={{ borderColor:"rgba(212,160,176,0.2)" }}>
              <p className="text-[9px] uppercase tracking-widest mb-2.5 font-bold" style={{ color:"rgba(212,160,176,0.4)", fontFamily:SANS }}>Adaugă bloc</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  {type:'location',   label:'Locație', def:{label:'',time:'',locationName:'',locationAddress:'',wazeLink:''}},
                  {type:'godparents', label:'Nași',    def:{sectionTitle:'Nașii Noștri',content:''}},
                  {type:'parents',    label:'Părinți', def:{sectionTitle:'Părinții Noștri',content:''}},
                  {type:'text',       label:'Text',    def:{content:''}},
                  {type:'title',      label:'Titlu',   def:{content:''}},
                  {type:'divider',    label:'Linie',   def:{}},
                ].map(({type,label,def})=>(
                  <button key={type} type="button" onClick={()=>addBlock(type,def)}
                    className="px-3 py-1 text-[10px] font-bold border rounded-full transition-all"
                    style={{ color:"#d4a0b0", borderColor:"rgba(212,160,176,0.3)", fontFamily:SANS }}>
                    + {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {profile.showTimeline && timeline.length > 0 && (
            <>
              <LightString/>
              <GlassCard>
                <p style={{ fontFamily:SANS, fontSize:8, fontWeight:700, letterSpacing:"0.45em", textTransform:"uppercase",
                  color:"rgba(212,160,176,0.5)", textAlign:"center", margin:"0 0 18px" }}>Programul Zilei</p>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  {timeline.map((item:any,i:number)=>(
                    <div key={item.id} style={{ display:"grid", gridTemplateColumns:"52px 24px 1fr", alignItems:"stretch", minHeight:40 }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"flex-end", paddingRight:8, paddingTop:2 }}>
                        <span style={{ fontFamily:SERIF, fontSize:14, fontWeight:600, color:"#b06880" }}>{item.time}</span>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink:0, marginTop:4 }}>
                          {[0,90,180,270].map((a,pi)=>{
                            const r=((a-90)*Math.PI)/180;
                            return <ellipse key={pi} cx={5+Math.cos(r)*3} cy={5+Math.sin(r)*3}
                              rx="2" ry="3" fill="#f9b8c4" opacity="0.75"
                              transform={`rotate(${a},${5+Math.cos(r)*3},${5+Math.sin(r)*3})`}/>;
                          })}
                          <circle cx="5" cy="5" r="2" fill="#fde68a" opacity="0.9"/>
                        </svg>
                        {i < timeline.length-1 && (
                          <div style={{ flex:1, width:"0.7px", background:"rgba(212,160,176,0.2)", marginTop:2 }}/>
                        )}
                      </div>
                      <div style={{ paddingLeft:10, paddingTop:2, paddingBottom:i<timeline.length-1?18:0 }}>
                        <span style={{ fontFamily:SANS, fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.6)" }}>{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          )}

          {/* RSVP */}
          <LightString/>
          {showRsvp && (
            editMode ? (
              <div style={{ width:"100%", padding:"18px 24px", borderRadius:16, textAlign:"center",
                background:"linear-gradient(135deg,#a0526a 0%,#7d3850 50%,#5c2438 100%)",
                border:"1.5px solid rgba(212,160,176,0.3)" }}>
                <InlineEdit tag="span" editMode={editMode} value={rsvpText} onChange={v=>upProfile('rsvpButtonText',v)}
                  style={{ fontFamily:SANS, fontWeight:700, fontSize:11, letterSpacing:"0.35em",
                    textTransform:"uppercase", color:"white", cursor:"text" }}/>
              </div>
            ) : (
              <button onClick={()=>onOpenRSVP&&onOpenRSVP()} style={{
                width:"100%", padding:"18px 24px",
                background:"linear-gradient(135deg,#a0526a 0%,#7d3850 50%,#5c2438 100%)",
                border:"1.5px solid rgba(212,160,176,0.35)", borderRadius:16, cursor:"pointer",
                fontFamily:SANS, fontWeight:700, fontSize:11, letterSpacing:"0.35em",
                textTransform:"uppercase", color:"white",
                boxShadow:"0 8px 28px rgba(160,82,106,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
                transition:"all 0.25s",
              }}>
                ✿ {rsvpText} ✿
              </button>
            )
          )}

          {/* Footer */}
          <div style={{ marginTop:24, textAlign:"center" }}>
            <FloralDivider/>
            <p style={{ fontFamily:SERIF, fontSize:11, fontStyle:"italic", color:"rgba(255,255,255,0.18)", marginTop:12 }}>
              cu drag · WeddingPro 🌸
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default GardenRomanticTemplate;
