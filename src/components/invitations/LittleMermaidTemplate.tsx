import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import { BlockStyleProvider } from "../BlockStyleContext";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { getMermaidTheme } from "./castleDefaults";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload, Camera,
  Play, Pause, SkipForward, SkipBack, Gift, Music, MessageCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// META
// ─────────────────────────────────────────────────────────────────────────────
export const meta: TemplateMeta = {
  id: 'little-mermaid',
  name: 'Mica Sirenă',
  category: 'kids',
  description: 'Lumea subacvatică a Arielei — corali, perle, stele de mare curcubeu și uși oceanice pe scroll!',
  colors: ['#0A3D6B', '#7FFFDA', '#CC3366'],
  previewClass: "bg-blue-900 border-teal-400",
  elementsClass: "bg-teal-400",
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
  fetch(`${API_URL}/upload`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_s?.token || ''}` }, body: JSON.stringify({ url }) }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${alpha})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — exact from reference
// ─────────────────────────────────────────────────────────────────────────────
const F = {
  display: "'Cinzel','Palatino Linotype',serif",
  body   : "'Nunito','Quicksand',sans-serif",
  label  : "'Cinzel',serif",
  magic  : "'Great Vibes','Dancing Script',cursive",
} as const;

let C = {
  ocean      : "#041E42",
  deep       : "#0A2D5A",
  mid        : "#0D4A8A",
  bright     : "#1877C9",
  teal       : "#00C8AA",
  tealPale   : "#7FFFDA",
  purple     : "#7B4FBE",
  purpleLight: "#C77DFF",
  coral      : "#FF6B6B",
  pink       : "#CC3366",
  gold       : "#F5C842",
  goldPale   : "#FFF0A0",
  shell      : "#F8D7E3",
  white      : "#FFFFFF",
  pearl      : "#F0F8FF",
};

const RAINBOW = ['#FF4D4D','#FF9500','#FFE500','#4DFF91','#00C8FF','#7B4FBE','#FF4DC8'];
const RAINBOW_CSS = RAINBOW.join(',');

// Card style — dinamic, citit din C la fiecare render
const getSectionStyle = (): React.CSSProperties => ({
  background: `linear-gradient(135deg,${hexToRgba(C.deep,.9)},${hexToRgba(C.mid,.85)})`,
  border: `1.5px solid ${hexToRgba(C.teal,.2)}`,
  borderRadius: 20,
  backdropFilter: 'blur(12px)',
  padding: '22px 20px',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 8px 32px rgba(0,0,0,.5)`,
  marginTop: 6,
});
const getScanlines = (): React.CSSProperties => ({
  position: 'absolute', inset: 0, pointerEvents: 'none',
  background: `linear-gradient(90deg,transparent,${hexToRgba(C.teal,.05)},transparent)`,
  backgroundSize: '200% 100%',
  animation: 'ar-shimmer 4s linear infinite',
});

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE PATHS — /public/mermaid/
// ─────────────────────────────────────────────────────────────────────────────
const IMG_ARIEL     = "/mermaid/ariel.png";     // Ariel sirenă
const IMG_BABY      = "/mermaid/baby.png";       // Baby Ariel / copilul
const IMG_BANNER    = "/mermaid/banner.png";     // Banner scenă (Disney)
const IMG_CORAL     = "/mermaid/coral.png";      // Fundal corali subacvatici
const IMG_MOONSCENE = "/mermaid/moonscene.png";  // Scenă lună pe ocean
const IMG_LOGO      = "/mermaid/logo.png";       // Logo Mica Sirenă
const IMG_SEBASTIAN = "/mermaid/sebastian.png";  // Sebastian racul
const IMG_FLOUNDER  = "/mermaid/flounder.png";   // Flounder peștele
const IMG_SHELL     = "/mermaid/shell.png";      // Scoică decorativă
const IMG_PEARL     = "/mermaid/pearl.png";      // Perlă
const IMG_BG        = "/mermaid/ariel.png"; 
// ─────────────────────────────────────────────────────────────────────────────
// CSS — exact reference keyframes + door extras
// ─────────────────────────────────────────────────────────────────────────────
const getArCss = () => `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Nunito:wght@400;600;700;800;900&family=Great+Vibes&display=swap');

  @keyframes ar-float    { 0%,100%{transform:translateY(0) rotate(-.8deg)}50%{transform:translateY(-12px) rotate(.8deg)} }
  @keyframes ar-floatR   { 0%,100%{transform:translateY(0) rotate(.8deg)}50%{transform:translateY(-10px) rotate(-.8deg)} }
  @keyframes ar-swim     { 0%,100%{transform:translateY(0) translateX(0)}25%{transform:translateY(-8px) translateX(4px)}50%{transform:translateY(-4px) translateX(-2px)}75%{transform:translateY(-10px) translateX(-4px)} }
  @keyframes ar-bubble   { 0%{transform:translateY(0) scale(1);opacity:.7}100%{transform:translateY(-100px) scale(1.5);opacity:0} }
  @keyframes ar-shimmer  { 0%{background-position:-200% 0}100%{background-position:200% 0} }
  @keyframes ar-pulse    { 0%,100%{box-shadow:0 0 0 0 ${hexToRgba(C.teal,.5)}}50%{box-shadow:0 0 0 18px ${hexToRgba(C.teal,0)}} }
  @keyframes ar-starRain { 0%{transform:translateY(-20px) rotate(0deg);opacity:0}10%{opacity:1}80%{opacity:.6}100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
  @keyframes ar-rainbow  { 0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)} }
  @keyframes ar-starSpin { 0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.3)}100%{transform:rotate(360deg) scale(1)} }
  @keyframes ar-twinkle  { 0%,100%{opacity:.2;transform:scale(.6) rotate(0deg)}50%{opacity:1;transform:scale(1.5) rotate(20deg)} }
  @keyframes ar-popIn    { 0%{transform:scale(0) rotate(-8deg);opacity:0}65%{transform:scale(1.1) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes ar-barAnim  { 0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)} }
  @keyframes seam-pulse  { 0%,100%{opacity:.88}50%{opacity:1} }
  @keyframes seam-halo   { 0%,100%{opacity:.65}50%{opacity:.95} }
  @keyframes dh-down     { 0%{opacity:0;transform:translateY(-2px)}50%{opacity:1;transform:translateY(2px)}100%{opacity:0;transform:translateY(6px)} }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(th=0.1):[React.RefObject<T>,boolean] {
  const ref=useRef<T>(null); const [v,sv]=useState(false);
  useEffect(()=>{
    const el=ref.current; if(!el)return;
    const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting){sv(true);ob.disconnect();}},{threshold:th});
    ob.observe(el); return()=>ob.disconnect();
  },[th]); return[ref,v];
}
const Reveal: React.FC<{children:React.ReactNode;delay?:number;from?:'bottom'|'left'|'right'|'fade';style?:React.CSSProperties}> =
  ({children,delay=0,from='bottom',style})=>{
  const [ref,vis]=useReveal<HTMLDivElement>();
  const t:Record<string,string>={bottom:'translateY(32px)',left:'translateX(-32px)',right:'translateX(32px)',fade:'translateY(0)'};
  return <div ref={ref} style={{opacity:vis?1:0,transform:vis?'none':t[from],transition:`opacity .7s ${delay}s cubic-bezier(.22,1,.36,1),transform .7s ${delay}s cubic-bezier(.22,1,.36,1)`,...style}}>{children}</div>;
};

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN COMPONENTS — exact from reference
// ─────────────────────────────────────────────────────────────────────────────

// Sea Star SVG
const SeaStar: React.FC<{size?:number;color?:string;style?:React.CSSProperties}> =
  ({size=32,color=C.gold,style})=>(
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{
    animation:'ar-starSpin 4s ease-in-out infinite',
    filter:`drop-shadow(0 0 ${size*.15}px ${color})`,...style}}>
    <path d="M30 4 L34.5 22 L52 16 L40 29 L56 36 L38 36 L36 56 L30 40 L24 56 L22 36 L4 36 L20 29 L8 16 L25.5 22 Z" fill={color} opacity=".9"/>
    <path d="M30 10 L33 22 L44 18 L37 27 L48 32 L36 32 L34.5 50 L30 36 L25.5 50 L24 32 L12 32 L23 27 L16 18 L27 22 Z" fill="rgba(255,255,255,.25)"/>
  </svg>
);

// Starfish scatter on sides
const StarfishScatter: React.FC<{fixed?:boolean}> = ({fixed=false})=>{
  const items=[
    {x:2,y:14,c:'#FF4D4D',s:20,d:0},{x:93,y:10,c:'#00C8FF',s:18,d:.8},
    {x:4,y:36,c:'#FFE500',s:16,d:1.5},{x:95,y:34,c:'#4DFF91',s:22,d:.4},
    {x:1,y:58,c:'#FF9500',s:18,d:2.1},{x:96,y:56,c:'#7B4FBE',s:20,d:1.0},
    {x:3,y:78,c:'#FF4DC8',s:16,d:.6},{x:94,y:76,c:'#00C8FF',s:18,d:1.8},
    {x:48,y:2,c:'#FF4D4D',s:24,d:.2},
  ];
  return<>{items.map((it,i)=>(
    <div key={i} style={{position:fixed?'fixed':'absolute',left:`${it.x}%`,top:`${it.y}%`,
      animation:`ar-twinkle ${2+i*.3}s ${it.d}s ease-in-out infinite`,
      pointerEvents:'none',zIndex:2,filter:`drop-shadow(0 0 8px ${it.c})`}}>
      <SeaStar size={it.s} color={it.c}/>
    </div>
  ))}</>;
};

// Bubble Layer
const BubbleLayer: React.FC = ()=>{
  const bs=useRef(Array.from({length:14},(_,i)=>({
    x:5+(i*13.7)%90,size:6+((i*5)%16),dur:4+((i*3)%6),del:(i*.55)%7,
  }))).current;
  return<>{bs.map((b,i)=>(
    <div key={i} style={{position:'fixed',left:`${b.x}%`,bottom:0,
      width:b.size,height:b.size,borderRadius:'50%',
      background:`radial-gradient(circle at 35% 30%,rgba(255,255,255,.5),${hexToRgba(C.teal,.15)})`,
      border:`1px solid ${hexToRgba(C.tealPale,.4)}`,
      animation:`ar-bubble ${b.dur}s ${b.del}s ease-in infinite`,
      pointerEvents:'none',zIndex:1}}/>
  ))}</>;
};

// Rainbow falling stars
const FallingStars: React.FC = ()=>{
  const stars=useRef(Array.from({length:20},(_,i)=>({
    x:(i*13.3+2)%96,delay:(i*.4)%7,dur:4+(i*.3)%5,
    size:10+((i*5)%14),color:RAINBOW[i%RAINBOW.length],
  }))).current;
  return<>{stars.map((s,i)=>(
    <div key={i} style={{
      position:'fixed',left:`${s.x}%`,top:-20,
      fontSize:s.size,color:s.color,
      animation:`ar-starRain ${s.dur}s ${s.delay}s linear infinite`,
      pointerEvents:'none',zIndex:3,userSelect:'none',
      filter:`drop-shadow(0 0 6px ${s.color})`,
    }}>{['✦','✧','★','⭐','✨'][i%5]}</div>
  ))}</>;
};

// Wave bar
const WaveBar: React.FC<{rainbow?:boolean}> = ({rainbow=false})=>(
  <div style={{height:4,borderRadius:2,overflow:'hidden',position:'relative'}}>
    <div style={{
      position:'absolute',inset:0,
      background:rainbow?`linear-gradient(90deg,${RAINBOW_CSS})`:`linear-gradient(90deg,${C.teal},${C.bright},${C.teal})`,
      backgroundSize:rainbow?'300% 100%':'200% 100%',
      animation:'ar-shimmer 3s linear infinite',
    }}/>
  </div>
);

// Shell divider
const ShellDivider: React.FC<{rainbow?:boolean}> = ({rainbow=false})=>(
  <div style={{display:'flex',alignItems:'center',gap:10,margin:'4px 0'}}>
    <div style={{flex:1,height:'.8px',background:`linear-gradient(to right,transparent,${C.teal})`,opacity:.5}}/>
    {rainbow
      ? <span style={{fontSize:22,animation:'ar-rainbow 3s linear infinite',filter:`drop-shadow(0 0 8px ${C.teal})`}}>🌟</span>
      : <SeaStar size={26} color={C.teal} style={{animation:'ar-starSpin 5s ease-in-out infinite',filter:`drop-shadow(0 0 8px ${C.teal})`}}/>}
    <div style={{flex:1,height:'.8px',background:`linear-gradient(to left,transparent,${C.teal})`,opacity:.5}}/>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// OCEAN DOOR SEAM — teal + rainbow glow
// ─────────────────────────────────────────────────────────────────────────────
const OceanDoorSeam: React.FC<{side:'left'|'right'}> = ({side})=>(
  <div style={{position:'absolute',top:0,right:side==='left'?'0px':'auto',left:side==='right'?'-2px':'auto',width:2,height:'100%',pointerEvents:'none',overflow:'visible',zIndex:20}}>
    <div style={{
      position:'absolute',top:0,left:side==='left'?'100%':0,width:3,height:'100%',
      background:`linear-gradient(to bottom,transparent 0%,${C.tealPale} 6%,${C.tealPale} 94%,transparent 100%)`,
      boxShadow:`0 0 8px 4px ${hexToRgba(C.tealPale,.95)},0 0 20px 10px ${hexToRgba(C.teal,.8)},0 0 50px 22px ${hexToRgba(C.bright,.5)},0 0 100px 40px rgba(122,79,190,.3)`,
      animation:'seam-pulse 2.8s ease-in-out infinite',
    }}/>
    <div style={{position:'absolute',top:0,left:0,width:220,height:'100%',transform:side==='left'?'translateX(-100%)':'translateX(0%)',background:side==='left'?`linear-gradient(to left,${C.tealPale} 0%,${hexToRgba(C.teal,.6)} 3%,${hexToRgba(C.bright,.25)} 12%,transparent 100%)`:`linear-gradient(to right,${C.tealPale} 0%,${hexToRgba(C.teal,.6)} 3%,${hexToRgba(C.bright,.25)} 12%,transparent 100%)`,filter:'blur(10px)',animation:'seam-halo 2.8s ease-in-out infinite',pointerEvents:'none'}}/>
    <div style={{position:'absolute',top:0,left:0,width:400,height:'100%',transform:side==='left'?'translateX(-100%)':'translateX(0%)',background:side==='left'?`linear-gradient(to left,${hexToRgba(C.teal,.3)} 0%,rgba(122,79,190,.1) 20%,transparent 100%)`:`linear-gradient(to right,${hexToRgba(C.teal,.3)} 0%,rgba(122,79,190,.1) 20%,transparent 100%)`,filter:'blur(30px)',animation:'seam-halo 2.8s ease-in-out infinite',pointerEvents:'none'}}/>
  </div>
);

const DoorHint: React.FC = ()=>(
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
    <span style={{fontFamily:F.label,fontSize:8,letterSpacing:'.4em',textTransform:'uppercase',color:hexToRgba(C.tealPale,.85)}}>Scroll down</span>
    <span style={{fontSize:14,color:hexToRgba(C.tealPale,.85),animation:'dh-down 1.6s ease-in-out infinite'}}>↓</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MERMAID OVERLAY TEXT — pe uși (faza 1 + faza 2)
// ─────────────────────────────────────────────────────────────────────────────
const MermaidOverlayText: React.FC<{
  childName:string; subtitle:string; isWedding?:boolean; partner2Name?:string;
  editMode?:boolean;
  overlayRef?:React.RefObject<HTMLDivElement>;
  nameRef?:React.RefObject<HTMLDivElement>;
  inviteRef?:React.RefObject<HTMLDivElement>;
  onChildNameChange?:(v:string)=>void; onSubtitleChange?:(v:string)=>void;
  inviteTop?:string; inviteMiddle?:string; inviteBottom?:string; inviteTag?:string; dateStr?:string;
  onInviteTopChange?:(v:string)=>void; onInviteMiddleChange?:(v:string)=>void;
  onInviteBottomChange?:(v:string)=>void; onInviteTagChange?:(v:string)=>void;
  previewMode?:'doors'|'static';
  i: any;
}> = ({childName,subtitle,isWedding,partner2Name,editMode,overlayRef,nameRef,inviteRef,
       onChildNameChange,onSubtitleChange,inviteTop,inviteMiddle,inviteBottom,inviteTag,dateStr,
       onInviteTopChange,onInviteMiddleChange,onInviteBottomChange,onInviteTagChange,previewMode,i})=>{
  const S = '0 2px 12px rgba(0,0,0,.95),0 4px 28px rgba(0,0,0,.7)';
  const isStatic = previewMode==='static';
  const nameTop       = isStatic?'33%':(editMode?'14%':'50%');
  const nameTransform = isStatic?'translateY(-50%)':(editMode?'none':'translateY(-50%)');
  const nameOpacity   = isStatic?1:(editMode?.45:1);
  const inviteTopPos  = isStatic?'73%':(editMode?'52%':'50%');
  const inviteTransform = isStatic?'translateY(-50%)':(editMode?'translateY(-50%)':'translateY(-50%) scale(.88)');
  const inviteOpacity = isStatic?1:(editMode?1:0);

  return(
    <div ref={overlayRef} style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:15,pointerEvents:editMode?'auto':'none'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse 70% 60% at 50% 50%,rgba(0,0,0,.1) 0%,transparent 100%)'}}/>

      {/* Logo top */}
      <div style={{position:'absolute',top:'4%',left:0,right:0,textAlign:'center',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
        <img src={i.logo} alt="Mica Sirenă" style={{width:'min(180px,48vw)',objectFit:'contain',filter:`brightness(0) invert(1) drop-shadow(0 0 16px ${hexToRgba(C.teal,.7)})`,opacity:.9}}/>
        <div style={{display:'flex',gap:6,justifyContent:'center'}}>
          {RAINBOW.slice(0,5).map((c,i)=>(
            <SeaStar key={i} size={14+((i*3)%6)} color={c} style={{animation:`ar-starSpin ${2+i*.4}s ${i*.2}s ease-in-out infinite`,filter:`drop-shadow(0 0 5px ${c})`}}/>
          ))}
        </div>
      </div>

      {/* Phase 1 — name */}
      <div style={{position:'absolute',top:nameTop,left:0,right:0,transform:nameTransform,textAlign:'center',zIndex:1,padding:'0 28px',opacity:nameOpacity}}>
        <div ref={nameRef} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,width:'100%'}}>
          {isWedding?(
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.2em'}}>
              <InlineEdit tag="span" editMode={!!editMode} value={childName} onChange={v=>onChildNameChange?.(v)}
                style={{fontFamily:F.display,fontSize:'clamp(36px,9vw,62px)',fontWeight:900,color:C.white,textShadow:S,lineHeight:1}}/>
              <span style={{fontFamily:F.magic,fontSize:'clamp(22px,5vw,36px)',color:C.tealPale,textShadow:S}}>&amp;</span>
              <span style={{fontFamily:F.display,fontSize:'clamp(36px,9vw,62px)',fontWeight:900,color:C.white,textShadow:S,lineHeight:1}}>{partner2Name}</span>
            </div>
          ):(
            <InlineEdit tag="h2" editMode={!!editMode} value={childName} onChange={v=>onChildNameChange?.(v)}
              style={{fontFamily:F.display,fontSize:'clamp(38px,10vw,68px)',fontWeight:900,lineHeight:1.05,color:C.white,textShadow:S,margin:'2px auto 0',maxWidth:'100%',overflowWrap:'anywhere',wordBreak:'break-word',letterSpacing:3}}/>
          )}
          <InlineEdit tag="p" editMode={!!editMode} value={subtitle} onChange={v=>onSubtitleChange?.(v)}
            style={{fontFamily:F.magic,fontSize:'1.3rem',color:C.tealPale,textShadow:S,marginTop:2,opacity:.9}}/>
          {/* Ariel + Baby */}
          <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:8}}>
            <div style={{animation:'ar-swim 5s ease-in-out infinite'}}>
              <img src={i.baby} alt="" style={{height:58,objectFit:'contain',filter:`drop-shadow(0 4px 12px rgba(255,107,107,.6))`}}/>
            </div>
            <div style={{animation:'ar-float 4s .4s ease-in-out infinite'}}>
              <img src={i.ariel} alt="" style={{height:70,objectFit:'contain',filter:`drop-shadow(0 4px 14px ${hexToRgba(C.teal,.6)})`}}/>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 2 — invite */}
      <div style={{position:'absolute',top:inviteTopPos,left:0,right:0,transform:inviteTransform,textAlign:'center',zIndex:1,padding:'0 36px',pointerEvents:editMode?'auto':'none'}}>
        <div ref={inviteRef} style={{display:'flex',flexDirection:'column',gap:12,width:'100%',opacity:inviteOpacity}}>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteTop||'Cu bucurie vă anunțăm'} onChange={v=>onInviteTopChange?.(v)}
            style={{fontFamily:F.label,fontSize:'.65rem',fontWeight:700,letterSpacing:'.5em',textTransform:'uppercase',color:C.white,textShadow:S,margin:0}}/>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteMiddle||dateStr||'Data Evenimentului'} onChange={v=>onInviteMiddleChange?.(v)}
            style={{fontFamily:F.magic,fontSize:'2rem',lineHeight:1.2,color:C.tealPale,textShadow:S,margin:0}}/>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteBottom||'va fi botezată'} onChange={v=>onInviteBottomChange?.(v)}
            style={{fontFamily:F.label,fontSize:'.68rem',fontWeight:400,letterSpacing:'.35em',textTransform:'uppercase',color:C.white,textShadow:S,margin:0,lineHeight:2}}/>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteTag||'🐚 deschide valurile 🌊'} onChange={v=>onInviteTagChange?.(v)}
            style={{fontFamily:F.label,fontSize:'.55rem',fontWeight:700,letterSpacing:'.5em',textTransform:'uppercase',color:C.tealPale,textShadow:S,margin:'2px 0 0',opacity:.85}}/>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MERMAID DOOR INTRO — GSAP ScrollTrigger (identic cu LordEffects)
// ─────────────────────────────────────────────────────────────────────────────
const MermaidDoorIntro: React.FC<{
  editMode?:boolean; previewMode?:'doors'|'static';
  contentEl?:HTMLElement|null; scrollContainer?:HTMLElement|null;
  childName?:string; partner2Name?:string; isWedding?:boolean;
  subtitle?:string; inviteTop?:string; inviteMiddle?:string; inviteBottom?:string; inviteTag?:string; dateStr?:string;
  onChildNameChange?:(v:string)=>void; onSubtitleChange?:(v:string)=>void;
  onInviteTopChange?:(v:string)=>void; onInviteMiddleChange?:(v:string)=>void;
  onInviteBottomChange?:(v:string)=>void; onInviteTagChange?:(v:string)=>void;
  onDoorsOpen?:()=>void;
  doorImg?: string; doorImgMobile?: string;
  i?: any;
}> = ({
  editMode,previewMode='doors',contentEl,scrollContainer,
  childName='Ariel',partner2Name='',isWedding=false,
  subtitle='te invită în lumea subacvatică',
  inviteTop,inviteMiddle,inviteBottom,inviteTag,dateStr,
  onChildNameChange,onSubtitleChange,
  onInviteTopChange,onInviteMiddleChange,onInviteBottomChange,onInviteTagChange,
  onDoorsOpen,
  doorImg: doorImgProp, doorImgMobile: doorImgMobileProp,
  i: iProp,
})=>{
  const i = iProp || { logo: IMG_LOGO, ariel: IMG_ARIEL, baby: IMG_BABY, banner: IMG_BANNER, coral: IMG_CORAL };
  const leftRef   = useRef<HTMLDivElement>(null);
  const rightRef  = useRef<HTMLDivElement>(null);
  const hintRef   = useRef<HTMLDivElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const seamRef   = useRef<HTMLDivElement>(null);
  const seamRef2  = useRef<HTMLDivElement>(null);
  const nameRef   = useRef<HTMLDivElement>(null);
  const inviteRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(()=>{
    if(editMode||!leftRef.current||!rightRef.current||!contentEl)return;
    gsap.set(contentEl,{opacity:0});
    gsap.set(seamRef.current,{opacity:0});
    gsap.set(seamRef2.current,{opacity:0});

    const tl=gsap.timeline({paused:true});
    tl.to(leftRef.current, {xPercent:-100,ease:'none',duration:1},0);
    tl.to(rightRef.current,{xPercent:100, ease:'none',duration:1},0);
    tl.to(contentEl,       {opacity:1,   ease:'none',duration:1},0);
    if(hintRef.current)    tl.to(hintRef.current,   {opacity:0,ease:'none',duration:.2},0);
    if(overlayRef.current) tl.to(overlayRef.current,{opacity:0,ease:'none',duration:.3},0);
    if(seamRef.current)  { tl.to(seamRef.current, {opacity:1,ease:'none',duration:.08},0); tl.to(seamRef.current, {opacity:0,ease:'power2.in',duration:.25},.75); }
    if(seamRef2.current) { tl.to(seamRef2.current,{opacity:1,ease:'none',duration:.08},0); tl.to(seamRef2.current,{opacity:0,ease:'power2.in',duration:.25},.75); }

    const DEAD=60/160;
    const textTl=gsap.timeline({paused:true});
    if(nameRef.current)   textTl.to(nameRef.current,  {opacity:0,scale:.82,ease:'power2.in',duration:1});
    if(inviteRef.current) textTl.fromTo(inviteRef.current,{opacity:0,scale:.82},{opacity:1,scale:1,ease:'power2.out',duration:1});

    let _mf=false;
    const st=ScrollTrigger.create({
      trigger:contentEl,scroller:scrollContainer||undefined,
      start:'top top',end:'+=500%',pin:true,scrub:true,invalidateOnRefresh:true,
      onUpdate:(self)=>{
        if(self.progress<=DEAD){textTl.progress(self.progress/DEAD);tl.progress(0);}
        else{textTl.progress(1);const p=(self.progress-DEAD)/(1-DEAD);tl.progress(p);if(!_mf&&p>.05){_mf=true;onDoorsOpen?.();}}
      },
      onLeave:()=>{if(wrapRef.current)wrapRef.current.style.display='none';},
      onEnterBack:()=>{_mf=false;if(wrapRef.current)wrapRef.current.style.display='block';textTl.progress(0);if(nameRef.current)gsap.set(nameRef.current,{opacity:1,scale:1});if(inviteRef.current)gsap.set(inviteRef.current,{opacity:0,scale:.88});},
    });
    requestAnimationFrame(()=>ScrollTrigger.refresh());
    return()=>{st.kill();tl.kill();gsap.set(contentEl,{clearProps:'all'});};
  },[editMode,contentEl,scrollContainer]);

    const doorImg = (isMobile ? doorImgMobileProp : doorImgProp) || doorImgProp || IMG_BG;

  const overlayProps={childName,subtitle,isWedding,partner2Name,editMode:!!editMode,inviteTop,inviteMiddle,inviteBottom,inviteTag,dateStr,onChildNameChange,onSubtitleChange,onInviteTopChange,onInviteMiddleChange,onInviteBottomChange,onInviteTagChange,previewMode,i};

  const DoorHalf: React.FC<{side:'left'|'right'}> = ({side})=>(
    <>
      {/* width:200% + ancorat pe aceeași latură → fiecare ușă vede JUMĂTATEA ei din imagine */}
      <div style={{position:'absolute',top:0,[side]:0,width:'200%',height:'100%',backgroundImage:`url(${doorImg})`,backgroundSize:'cover',backgroundPosition:'center'}}/>
      {/* Bubbles */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        {Array.from({length:6},(_,idx)=>(
          <div key={idx} style={{position:'absolute',left:`${20+idx*14}%`,bottom:0,width:8+idx*3,height:8+idx*3,borderRadius:'50%',background:`radial-gradient(circle at 35% 30%,rgba(255,255,255,.4),${hexToRgba(C.teal,.1)})`,border:`1px solid ${hexToRgba(C.tealPale,.3)}`,animation:`ar-bubble ${3+idx*.8}s ${idx*.6}s ease-in infinite`}}/>
        ))}
      </div>
    </>
  );

  if(editMode&&previewMode==='static'){
    return(
      <div style={{position:'relative',height:800,borderRadius:12,marginBottom:32,overflow:'hidden'}}>
        {/* Static: imagine completă pe toată suprafața */}
        <div style={{position:'absolute',inset:0,backgroundImage:`url(${doorImg})`,backgroundSize:'cover',backgroundPosition:'center'}}/>
        <MermaidOverlayText {...overlayProps}/>
      </div>
    );
  }
  if(editMode){
    return(
      <div style={{position:'relative',height:800,borderRadius:12,marginBottom:32}}>
        <div style={{position:'absolute',top:0,left:0,width:'50%',height:'100%',overflow:'hidden',borderRadius:'12px 0 0 12px'}}><DoorHalf side="left"/></div>
        <div style={{position:'absolute',top:0,right:0,width:'50%',height:'100%',overflow:'hidden',borderRadius:'0 12px 12px 0'}}><DoorHalf side="right"/></div>
        <div style={{position:'absolute',bottom:28,left:'50%',transform:'translateX(-50%)',zIndex:20}}><DoorHint/></div>
        <MermaidOverlayText {...overlayProps}/>
      </div>
    );
  }
  return(
    <div ref={wrapRef} style={{position:'fixed',inset:0,height:'100dvh',zIndex:9999,overflow:'hidden',pointerEvents:'none'}}>
      <div ref={leftRef} style={{position:'absolute',top:0,left:0,width:'50%',height:'100dvh',overflow:'visible',willChange:'transform'}}>
        <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',overflow:'hidden'}}><DoorHalf side="left"/></div>
        <div ref={seamRef} style={{opacity:0}}><OceanDoorSeam side="left"/></div>
      </div>
      <div ref={rightRef} style={{position:'absolute',top:0,right:0,width:'50%',height:'100dvh',overflow:'visible',willChange:'transform'}}>
        <div style={{position:'absolute',top:0,right:0,width:'100%',height:'100%',overflow:'hidden'}}><DoorHalf side="right"/></div>
        <div ref={seamRef2} style={{opacity:0}}><OceanDoorSeam side="right"/></div>
      </div>
      <MermaidOverlayText {...overlayProps} overlayRef={overlayRef as any} nameRef={nameRef as any} inviteRef={inviteRef as any}/>
      <div ref={hintRef} style={{position:'absolute',bottom:36,left:'50%',transform:'translateX(-50%)',zIndex:20}}><DoorHint/></div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO PERMISSION MODAL — mermaid themed
// ─────────────────────────────────────────────────────────────────────────────
const AudioPermissionModal: React.FC<{childName:string;onAllow:()=>void;onDeny:()=>void;i?:any}> = ({childName,onAllow,onDeny,i})=>(
  <div style={{position:'fixed',inset:0,zIndex:10000,display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{position:'absolute',inset:0,background:hexToRgba(C.ocean,.88),backdropFilter:'blur(14px)'}}/>
    <div style={{position:'relative',...getSectionStyle(),maxWidth:320,width:'90%',textAlign:'center',padding:'40px 32px 28px',borderTop:`3px solid ${C.teal}`}}>
      <div style={getScanlines()}/>
      {/* Ariel floating above */}
      <div style={{position:'absolute',top:-52,left:'50%',transform:'translateX(-50%)'}}>
        <img src={i?.ariel||IMG_ARIEL} alt="" style={{height:96,objectFit:'contain',filter:`drop-shadow(0 0 18px ${hexToRgba(C.teal,.6)})`,animation:'ar-float 3s ease-in-out infinite'}}/>
      </div>
      <div style={{marginTop:20,position:'relative',zIndex:1}}>
        {/* Rainbow sea stars */}
        <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:10}}>
          {RAINBOW.slice(0,5).map((c,i)=><SeaStar key={i} size={14} color={c} style={{animation:`ar-starSpin ${2+i*.4}s ${i*.2}s ease-in-out infinite`}}/>)}
        </div>
        <p style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:C.white,margin:'0 0 4px',letterSpacing:2,textShadow:`0 0 14px ${hexToRgba(C.teal,.4)}`}}>{childName}</p>
        <p style={{fontFamily:F.body,fontSize:12,fontWeight:700,color:C.tealPale,margin:'0 0 8px'}}>te invită în lumea subacvatică 🐚</p>
        <p style={{fontFamily:F.body,fontSize:11,fontStyle:'italic',color:hexToRgba(C.tealPale,.5),margin:'0 0 24px',lineHeight:1.65}}>Această invitație are o melodie specială.<br/>Vrei să activezi muzica?</p>
        <button type="button" onClick={onAllow}
          style={{width:'100%',padding:'14px 0',background:`linear-gradient(135deg,${C.teal},${C.mid})`,border:'none',borderRadius:50,cursor:'pointer',fontFamily:F.label,fontSize:10,fontWeight:700,color:C.white,letterSpacing:3,textTransform:'uppercase',marginBottom:10,boxShadow:`0 6px 20px ${hexToRgba(C.teal,.5)}`,transition:'transform .15s'}}
          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(1.03)'}
          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(1)'}>
          🎵 Da, activează muzica
        </button>
        <button type="button" onClick={onDeny}
          style={{width:'100%',padding:'10px 0',background:'transparent',border:'none',cursor:'pointer',fontFamily:F.body,fontSize:11,color:hexToRgba(C.tealPale,.4)}}>
          Nu, continuă fără muzică
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION CARD — exact from reference
// ─────────────────────────────────────────────────────────────────────────────
const LocCard: React.FC<{block:InvitationBlock;editMode:boolean;onUpdate:(p:Partial<InvitationBlock>)=>void}> = ({block,editMode,onUpdate})=>{
  const addr=block.locationAddress||block.locationName||'';
  return(
    <div style={{background:`linear-gradient(135deg,${hexToRgba(C.deep,.88)},${hexToRgba(C.mid,.82)})`,border:`1.5px solid ${hexToRgba(C.teal,.35)}`,borderTop:`3px solid ${C.teal}`,borderRadius:16,padding:'18px 22px',backdropFilter:'blur(10px)',boxShadow:`0 6px 28px rgba(0,0,0,.5),inset 0 1px 0 ${hexToRgba(C.teal,.1)}`,position:'relative',overflow:'hidden'}}>
      <div style={getScanlines()}/>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <SeaStar size={18} color={C.teal}/>
          <InlineEdit editMode={editMode} value={block.label||'Locație'} onChange={v=>onUpdate({label:v})}
            style={{fontFamily:F.label,fontSize:8,letterSpacing:'.5em',textTransform:'uppercase',color:C.teal,margin:0,opacity:.9}}/>
        </div>
        {(block.time||editMode)&&(
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke={C.tealPale} strokeWidth=".8" opacity=".7"/>
              <path d="M6.5 3.5L6.5 6.5L9 8.5" stroke={C.tealPale} strokeWidth=".9" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
            </svg>
            <InlineTime editMode={editMode} value={block.time||'11:00'} onChange={v=>onUpdate({time:v})}
              style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.tealPale,margin:0,letterSpacing:1}}/>
          </div>
        )}
        <InlineEdit tag="p" editMode={editMode} value={block.locationName||''} onChange={v=>onUpdate({locationName:v})}
          style={{fontFamily:F.display,fontSize:13,fontWeight:600,color:C.white,margin:'0 0 3px',lineHeight:1.5}}/>
        {(block.locationAddress||editMode)&&(
          <div style={{display:'flex',alignItems:'flex-start',gap:6,marginTop:5}}>
            <span style={{fontSize:10,flexShrink:0,marginTop:2}}>🐚</span>
            <InlineEdit tag="p" editMode={editMode} value={block.locationAddress||''} onChange={v=>onUpdate({locationAddress:v})} multiline
              style={{fontFamily:F.body,fontSize:11,fontWeight:600,fontStyle:'italic',color:hexToRgba(C.tealPale,.5),margin:0,lineHeight:1.6}}/>
          </div>
        )}
        <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:12}}>
          <InlineWaze value={block.wazeLink||''} onChange={v=>onUpdate({wazeLink:v})} editMode={editMode}/>
          {addr&&<a href={`https://maps.google.com/?q=${encodeURIComponent(addr)}`} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:4,padding:'6px 16px',borderRadius:50,background:'transparent',color:C.tealPale,border:`1.5px solid ${hexToRgba(C.teal,.45)}`,fontFamily:F.label,fontSize:8,letterSpacing:'.3em',textTransform:'uppercase',textDecoration:'none'}}>🐚 Maps</a>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN — exact from reference
// ─────────────────────────────────────────────────────────────────────────────
interface TL{days:number;hours:number;minutes:number;seconds:number;total:number}
function calcTL(d:string):TL{
  const diff=new Date(d).getTime()-Date.now();
  if(diff<=0)return{days:0,hours:0,minutes:0,seconds:0,total:0};
  return{days:Math.floor(diff/86400000),hours:Math.floor((diff/3600000)%24),minutes:Math.floor((diff/60000)%60),seconds:Math.floor((diff/1000)%60),total:diff};
}
const FlipDigit: React.FC<{value:number;label:string;color:string}> = ({value,label,color})=>{
  const prev=useRef(value);const[fl,setFl]=useState(false);
  useEffect(()=>{if(prev.current!==value){setFl(true);const t=setTimeout(()=>setFl(false),300);prev.current=value;return()=>clearTimeout(t);}},[value]);
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
      <div style={{width:56,height:62,background:`linear-gradient(160deg,${C.deep},${C.ocean})`,border:`1.5px solid ${color}88`,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',boxShadow:`0 4px 16px rgba(0,0,0,.55),inset 0 1px 0 ${color}33`,transform:fl?'scale(1.09)':'scale(1)',transition:'transform .14s'}}>
        <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 60% 50% at 35% 30%,${color}${fl?'22':'08'},transparent)`,pointerEvents:'none'}}/>
        <span style={{fontFamily:F.display,fontSize:24,fontWeight:700,color:fl?color:C.white,lineHeight:1,textShadow:`0 0 ${fl?'16':'6'}px ${color}${fl?'99':'44'}`,transition:'color .3s'}}>{String(value).padStart(2,'0')}</span>
      </div>
      <span style={{fontFamily:F.label,fontSize:8,letterSpacing:'.35em',textTransform:'uppercase',color:`${color}99`}}>{label}</span>
    </div>
  );
};
const Countdown: React.FC<{targetDate:string|undefined}> = ({targetDate})=>{
  const[tl,setTl]=useState<TL|null>(null);const[rdy,setRdy]=useState(false);
  useEffect(()=>{setRdy(true);if(!targetDate)return;setTl(calcTL(targetDate));const id=setInterval(()=>setTl(calcTL(targetDate!)),1000);return()=>clearInterval(id);},[targetDate]);
  if(!rdy||!targetDate)return null;
  const over=tl?.total===0;const soon=(tl?.total??0)<86400000;
  if(over)return<div style={{textAlign:'center',padding:'12px',border:`1.5px solid ${C.teal}44`,borderRadius:12,background:`${C.deep}88`}}><p style={{fontFamily:F.label,fontSize:9,letterSpacing:'.45em',textTransform:'uppercase',color:C.teal,margin:0}}>🐚 Petrecerea a început! 🐚</p></div>;
  const vals=[tl?.days??0,tl?.hours??0,tl?.minutes??0,tl?.seconds??0];
  const lbls=['Zile','Ore','Min','Sec'];
  const cols=[C.teal,C.gold,C.coral,RAINBOW[4]];
  return(
    <div>
      <div style={{display:'flex',justifyContent:'center',marginBottom:14}}>
        <span style={{fontFamily:F.label,fontSize:8,letterSpacing:'.48em',textTransform:'uppercase',color:C.teal,opacity:.8,padding:'4px 16px',border:`1px solid ${C.teal}44`,borderRadius:50}}>{soon?'🐠 Mâine!':'🌊 Timp rămas'}</span>
      </div>
      <div style={{display:'flex',justifyContent:'center',alignItems:'flex-start',gap:8}}>
        {vals.map((v,i)=>(
          <React.Fragment key={i}>
            <FlipDigit value={v} label={lbls[i]} color={cols[i]}/>
            {i<3&&<span style={{fontFamily:F.display,fontSize:22,color:`${C.teal}55`,paddingTop:14,flexShrink:0}}>:</span>}
          </React.Fragment>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:5,marginTop:10}}>
        <div style={{width:5,height:5,borderRadius:'50%',background:C.teal,animation:'ar-pulse 2s ease-in-out infinite'}}/>
        <span style={{fontFamily:F.label,fontSize:7,letterSpacing:'.35em',textTransform:'uppercase',color:`${C.teal}55`}}>live</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR
// ─────────────────────────────────────────────────────────────────────────────
const CalendarMonth: React.FC<{date:string|undefined}> = ({date})=>{
  if(!date)return null;
  const d=new Date(date),year=d.getFullYear(),month=d.getMonth(),day=d.getDate();
  const firstDay=new Date(year,month,1).getDay();
  const dim=new Date(year,month+1,0).getDate();
  const mNames=['IANUARIE','FEBRUARIE','MARTIE','APRILIE','MAI','IUNIE','IULIE','AUGUST','SEPTEMBRIE','OCTOMBRIE','NOIEMBRIE','DECEMBRIE'];
  const dLabs=['L','M','M','J','V','S','D'];
  const start=(firstDay+6)%7;
  const cells:(number|null)[]=[...Array(start).fill(null),...Array.from({length:dim},(_,i)=>i+1)];
  return(
    <div>
      <p style={{fontFamily:F.label,fontSize:10,letterSpacing:'.3em',color:C.teal,textAlign:'center',marginBottom:14,opacity:.9}}>{mNames[month]} {year}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:5}}>
        {dLabs.map((l,i)=><div key={`${l}-${i}`} style={{fontSize:9,fontWeight:700,color:hexToRgba(C.tealPale,.4),fontFamily:F.label,textAlign:'center',letterSpacing:1}}>{l}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
        {cells.map((cell,i)=>{
          const isDay=cell===day;
          return <div key={i} style={{height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:isDay?700:600,fontFamily:isDay?F.display:F.body,color:isDay?C.ocean:cell?`${hexToRgba(C.tealPale,.6)}`:'transparent',background:isDay?C.teal:'transparent',borderRadius:isDay?8:0,boxShadow:isDay?`0 0 10px ${hexToRgba(C.teal,.6)}`:'none'}}>{cell||''}</div>;
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO BLOCK
// ─────────────────────────────────────────────────────────────────────────────
type ClipShape='rect'|'rounded'|'rounded-lg'|'squircle'|'circle'|'arch'|'arch-b'|'hexagon'|'diamond'|'triangle'|'star'|'heart'|'diagonal'|'diagonal-r'|'wave-b'|'wave-t'|'wave-both'|'blob'|'blob2'|'blob3'|'blob4';
type MaskEffect='fade-b'|'fade-t'|'fade-l'|'fade-r'|'vignette';
function getClipStyle(clip:ClipShape):React.CSSProperties{const m:Record<ClipShape,React.CSSProperties>={rect:{borderRadius:0},rounded:{borderRadius:16},'rounded-lg':{borderRadius:32},squircle:{borderRadius:'30% 30% 30% 30% / 30% 30% 30% 30%'},circle:{borderRadius:'50%'},arch:{borderRadius:'50% 50% 0 0 / 40% 40% 0 0'},'arch-b':{borderRadius:'0 0 50% 50% / 0 0 40% 40%'},hexagon:{clipPath:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'},diamond:{clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'},triangle:{clipPath:'polygon(50% 0%,100% 100%,0% 100%)'},star:{clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'},heart:{clipPath:'url(#lm-clip-heart)'},diagonal:{clipPath:'polygon(0 0,100% 0,100% 80%,0 100%)'},'diagonal-r':{clipPath:'polygon(0 0,100% 0,100% 100%,0 80%)'},'wave-b':{clipPath:'url(#lm-clip-wave-b)'},'wave-t':{clipPath:'url(#lm-clip-wave-t)'},'wave-both':{clipPath:'url(#lm-clip-wave-both)'},blob:{clipPath:'url(#lm-clip-blob)'},blob2:{clipPath:'url(#lm-clip-blob2)'},blob3:{clipPath:'url(#lm-clip-blob3)'},blob4:{clipPath:'url(#lm-clip-blob4)'}};return m[clip]||{};}
function getMaskStyle(effects:MaskEffect[]):React.CSSProperties{if(!effects.length)return{};const layers=effects.map(e=>{switch(e){case'fade-b':return'linear-gradient(to bottom, black 40%, transparent 100%)';case'fade-t':return'linear-gradient(to top, black 40%, transparent 100%)';case'fade-l':return'linear-gradient(to left, black 40%, transparent 100%)';case'fade-r':return'linear-gradient(to right, black 40%, transparent 100%)';case'vignette':return'radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)';default:return'none';}});const mask=layers.join(', ');return{WebkitMaskImage:mask,maskImage:mask,WebkitMaskComposite:effects.length>1?'source-in':'unset',maskComposite:effects.length>1?'intersect':'unset'};}
const PhotoClipDefs:React.FC=()=>(<svg width="0" height="0" style={{position:'absolute',overflow:'hidden',pointerEvents:'none'}}><defs><clipPath id="lm-clip-wave-b" clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath><clipPath id="lm-clip-wave-t" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath><clipPath id="lm-clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath><clipPath id="lm-clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath><clipPath id="lm-clip-blob" clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath><clipPath id="lm-clip-blob2" clipPathUnits="objectBoundingBox"><path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z"/></clipPath><clipPath id="lm-clip-blob3" clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath><clipPath id="lm-clip-blob4" clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath></defs></svg>);

const PhotoBlock: React.FC<{block:InvitationBlock;editMode:boolean;onUpdate:(p:Partial<InvitationBlock>)=>void;placeholderInitial?:string}> = ({block,editMode,onUpdate,placeholderInitial='A'})=>{
  const fileRef=useRef<HTMLInputElement>(null);
  const [uploading,setUploading]=useState(false);
  const{imageData,altText,aspectRatio='free',photoClip='rect',photoMasks=[]}=block;
  const pt:Record<string,string>={'1:1':'100%','4:3':'75%','3:4':'133%','16:9':'56.25%','free':'66.6%'};
  const combined={...getClipStyle(photoClip as ClipShape),...getMaskStyle(photoMasks as MaskEffect[])};
  const handleFile=async(file:File)=>{if(!file.type.startsWith('image/'))return;setUploading(true);deleteUploadedFile(imageData);try{const form=new FormData();form.append('file',file);const _s=JSON.parse(localStorage.getItem('weddingPro_session')||'{}');const res=await fetch(`${API_URL}/upload`,{method:'POST',headers:{Authorization:`Bearer ${_s?.token||''}`},body:form});const{url}=await res.json();onUpdate({imageData:url});}catch{}finally{setUploading(false);}};
  if(imageData)return(<div style={{position:'relative'}}><PhotoClipDefs/><div style={{position:'relative',paddingTop:pt[aspectRatio],overflow:'hidden',...combined}}><img src={imageData} alt={altText||''} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>{editMode&&<div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0)',opacity:0,transition:'opacity .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.opacity='1'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.opacity='0'}><div style={{background:'rgba(0,0,0,.55)',position:'absolute',inset:0}}/><button onClick={()=>fileRef.current?.click()} style={{position:'relative',zIndex:1,padding:8,background:'white',borderRadius:'50%',border:'none',cursor:'pointer'}}><Camera style={{width:20,height:20,color:C.teal}}/></button><button onClick={()=>{deleteUploadedFile(imageData);onUpdate({imageData:undefined});}} style={{position:'relative',zIndex:1,padding:8,background:'white',borderRadius:'50%',border:'none',cursor:'pointer'}}><Trash2 style={{width:20,height:20,color:'#dc2626'}}/></button></div>}</div><input ref={fileRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} style={{display:'none'}}/></div>);
  return(<div style={{position:'relative'}}><PhotoClipDefs/><div style={{position:'relative',paddingTop:pt[aspectRatio],...combined,overflow:'hidden',cursor:editMode?'pointer':'default'}} onClick={editMode?()=>fileRef.current?.click():undefined}><div style={{position:'absolute',inset:0,background:`linear-gradient(135deg,${C.deep},${C.ocean})`,display:'flex',alignItems:'center',justifyContent:'center'}}>{uploading?<div style={{width:32,height:32,border:`4px solid ${C.teal}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>:<div style={{textAlign:'center'}}><span style={{fontFamily:F.display,fontSize:52,fontWeight:700,color:`${hexToRgba(C.teal,.3)}`}}>{(placeholderInitial||'A')[0].toUpperCase()}</span>{editMode&&<p style={{fontFamily:F.body,fontSize:11,color:`${hexToRgba(C.tealPale,.35)}`,margin:'4px 0 0'}}>Adaugă fotografie</p>}</div>}</div></div><input ref={fileRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} style={{display:'none'}}/></div>);
};

// ─────────────────────────────────────────────────────────────────────────────
// MUSIC BLOCK
// ─────────────────────────────────────────────────────────────────────────────
const MusicBlock: React.FC<{block:InvitationBlock;editMode:boolean;onUpdate:(p:Partial<InvitationBlock>)=>void;imperativeRef?:React.MutableRefObject<{unlock:()=>void;play:()=>void;pause:()=>void}|null>}> = ({block,editMode,onUpdate,imperativeRef})=>{
  const audioRef=useRef<HTMLAudioElement>(null);
  const mp3Ref=useRef<HTMLInputElement>(null);
  const [playing,setPlaying]=useState(false);
  const [progress,setProgress]=useState(0);
  const [duration,setDuration]=useState(0);
  const [showYt,setShowYt]=useState(false);
  const [ytUrl,setYtUrl]=useState('');
  const [ytDownloading,setYtDownloading]=useState(false);
  const [ytError,setYtError]=useState('');
  useEffect(()=>{const a=audioRef.current;if(!a)return;const onTime=()=>setProgress(a.currentTime),onDur=()=>setDuration(a.duration),onEnd=()=>{setPlaying(false);setProgress(0);},onPlay=()=>setPlaying(true),onPause=()=>setPlaying(false);a.addEventListener('timeupdate',onTime);a.addEventListener('loadedmetadata',onDur);a.addEventListener('ended',onEnd);a.addEventListener('play',onPlay);a.addEventListener('pause',onPause);return()=>{a.removeEventListener('timeupdate',onTime);a.removeEventListener('loadedmetadata',onDur);a.removeEventListener('ended',onEnd);a.removeEventListener('play',onPlay);a.removeEventListener('pause',onPause);};},[block.musicUrl,block.musicType]);
  useEffect(()=>{if(!imperativeRef)return;imperativeRef.current={unlock:()=>{if(block.musicType==='mp3'&&audioRef.current&&block.musicUrl){audioRef.current.play().then(()=>{audioRef.current!.pause();audioRef.current!.currentTime=0;}).catch(()=>{});}},play:()=>{if(audioRef.current&&block.musicUrl)audioRef.current.play().catch(()=>{});},pause:()=>{if(audioRef.current)audioRef.current.pause();}};});
  const fmt=(s:number)=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const pct=duration?`${(progress/duration)*100}%`:'0%';
  const toggle=()=>{const a=audioRef.current;if(!a)return;if(playing){a.pause();setPlaying(false);}else{a.play().then(()=>setPlaying(true)).catch(()=>{});}};
  const seek=(e:React.MouseEvent<HTMLDivElement>)=>{if(!audioRef.current||!duration)return;const r=e.currentTarget.getBoundingClientRect();audioRef.current.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*duration;};
  const handleMp3=async(file:File)=>{if(!file.type.startsWith('audio/'))return;const _s=JSON.parse(localStorage.getItem('weddingPro_session')||'{}');try{const form=new FormData();form.append('file',file);const res=await fetch(`${API_URL}/upload`,{method:'POST',headers:{Authorization:`Bearer ${_s?.token||''}`},body:form});if(!res.ok)throw new Error();const{url}=await res.json();onUpdate({musicUrl:url,musicType:'mp3'});}catch(e){console.error(e);}};
  const submitYt=async()=>{const t=ytUrl.trim();if(!t)return;const _s=JSON.parse(localStorage.getItem('weddingPro_session')||'{}');setYtDownloading(true);setYtError('');try{const res=await fetch(`${API_URL}/download-yt-audio`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${_s?.token||''}`},body:JSON.stringify({url:t})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Eroare');onUpdate({musicUrl:data.url,musicType:'mp3',musicTitle:data.title||'',musicArtist:data.author||''});setShowYt(false);setYtUrl('');}catch(e:any){setYtError(e.message||'Nu s-a putut descărca.');}finally{setYtDownloading(false);}};
  const isActive=!!block.musicUrl;
  return(
    <div style={{...getSectionStyle()}}>
      <div style={getScanlines()}/>
      {block.musicType==='mp3'&&block.musicUrl&&<audio ref={audioRef} src={block.musicUrl} preload="metadata"/>}
      <div style={{position:'relative',zIndex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:playing?C.teal:`${hexToRgba(C.teal,.12)}`,border:`1.5px solid ${playing?C.teal:hexToRgba(C.teal,.3)}`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .3s',boxShadow:playing?`0 0 12px ${hexToRgba(C.teal,.6)}`:'none'}}>
            <Music style={{width:14,height:14,color:playing?C.ocean:C.teal}}/>
          </div>
          <span style={{fontFamily:F.label,fontSize:9,letterSpacing:'.4em',textTransform:'uppercase',color:playing?C.teal:hexToRgba(C.tealPale,.4),transition:'color .3s'}}>{playing?'Se redă acum':'Melodia Zilei'}</span>
          {playing&&<div style={{display:'flex',alignItems:'flex-end',gap:2,height:14,marginLeft:'auto'}}>{[0,.2,.1,.3].map((d,i)=><div key={i} style={{width:3,height:14,background:C.teal,borderRadius:2,transformOrigin:'bottom',animation:`ar-barAnim .7s ease-in-out ${d}s infinite`}}/>)}</div>}
        </div>
        {!isActive&&editMode&&(!showYt?(
          <div style={{display:'flex',gap:8}}>
            <button type="button" onClick={()=>mp3Ref.current?.click()} style={{flex:1,background:`${hexToRgba(C.teal,.06)}`,border:`1px dashed ${hexToRgba(C.teal,.3)}`,borderRadius:10,padding:'14px 0',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
              <Upload style={{width:20,height:20,color:C.teal,opacity:.8}}/><span style={{fontFamily:F.label,fontSize:9,color:hexToRgba(C.tealPale,.5),letterSpacing:'.3em',textTransform:'uppercase'}}>MP3</span>
            </button>
            <button type="button" onClick={()=>setShowYt(true)} style={{flex:1,background:`${hexToRgba(C.teal,.06)}`,border:`1px dashed ${hexToRgba(C.teal,.3)}`,borderRadius:10,padding:'14px 0',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="red" opacity=".8"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/></svg>
              <span style={{fontFamily:F.label,fontSize:9,color:hexToRgba(C.tealPale,.5),letterSpacing:'.3em',textTransform:'uppercase'}}>YouTube</span>
            </button>
            <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e=>{const f=e.target.files?.[0];if(f)handleMp3(f);}} style={{display:'none'}}/>
          </div>
        ):(
          <div style={{marginBottom:10}}>
            <div style={{display:'flex',gap:6,marginBottom:ytError?6:0}}>
              <input value={ytUrl} onChange={e=>{setYtUrl(e.target.value);setYtError('');}} onKeyDown={e=>e.key==='Enter'&&!ytDownloading&&submitYt()} placeholder="https://youtu.be/..." autoFocus disabled={ytDownloading} style={{flex:1,background:hexToRgba(C.deep,.5),border:`1px solid ${ytError?'#ef4444':hexToRgba(C.teal,.3)}`,borderRadius:8,padding:'9px 12px',fontFamily:F.body,fontSize:11,color:C.white,outline:'none'}}/>
              <button type="button" onClick={submitYt} disabled={ytDownloading} style={{background:C.teal,border:'none',borderRadius:8,padding:'0 14px',cursor:ytDownloading?'not-allowed':'pointer',color:C.ocean,fontWeight:700}}>{ytDownloading?<div style={{width:14,height:14,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>:'✓'}</button>
              <button type="button" onClick={()=>{setShowYt(false);setYtUrl('');setYtError('');}} style={{background:hexToRgba(C.deep,.5),border:'none',borderRadius:8,padding:'0 10px',cursor:'pointer',color:hexToRgba(C.tealPale,.6)}}>✕</button>
            </div>
            {ytDownloading&&<p style={{fontFamily:F.label,fontSize:9,color:C.teal,margin:0,textAlign:'center',letterSpacing:'.2em'}}>⏳ Se descarcă...</p>}
            {ytError&&<p style={{fontFamily:F.body,fontSize:9,color:'#ef4444',margin:0}}>⚠ {ytError}</p>}
          </div>
        ))}
        {!isActive&&!editMode&&<div style={{textAlign:'center',padding:'16px 0',opacity:.4}}><Music style={{width:32,height:32,color:C.teal,display:'block',margin:'0 auto 6px'}}/><p style={{fontFamily:F.magic,fontSize:14,color:hexToRgba(C.tealPale,.5),margin:0}}>Melodia va apărea aici</p></div>}
        {isActive&&(<div>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
            <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(160deg,${C.deep},${C.ocean})`,border:`1.5px solid ${hexToRgba(C.teal,.3)}`,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}><Music style={{width:20,height:20,color:hexToRgba(C.tealPale,.65)}}/></div>
            <div style={{flex:1,minWidth:0}}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle||''} onChange={v=>onUpdate({musicTitle:v})} placeholder="Titlul melodiei..." style={{fontFamily:F.body,fontSize:14,fontWeight:700,fontStyle:'italic',color:C.white,margin:0,lineHeight:1.3}}/>
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist||''} onChange={v=>onUpdate({musicArtist:v})} placeholder="Artist..." style={{fontFamily:F.label,fontSize:10,color:hexToRgba(C.tealPale,.45),margin:'2px 0 0',letterSpacing:1}}/>
            </div>
          </div>
          <div onClick={seek} style={{height:4,background:hexToRgba(C.teal,.15),borderRadius:99,marginBottom:6,cursor:'pointer',position:'relative'}}>
            <div style={{height:'100%',borderRadius:99,background:`linear-gradient(to right,${C.teal},${C.tealPale})`,width:pct,transition:'width .3s linear'}}/>
            <div style={{position:'absolute',top:'50%',transform:'translateY(-50%)',left:pct,marginLeft:-5,width:10,height:10,borderRadius:'50%',background:C.teal,boxShadow:`0 0 6px ${hexToRgba(C.teal,.7)}`,transition:'left .3s linear'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
            <span style={{fontFamily:F.label,fontSize:9,color:hexToRgba(C.tealPale,.35),letterSpacing:1}}>{fmt(progress)}</span>
            <span style={{fontFamily:F.label,fontSize:9,color:hexToRgba(C.tealPale,.35),letterSpacing:1}}>{duration?fmt(duration):'--:--'}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20}}>
            <button type="button" onClick={()=>{const a=audioRef.current;if(a)a.currentTime=Math.max(0,a.currentTime-10);}} style={{background:'none',border:'none',cursor:'pointer',padding:4,opacity:.5}}><SkipBack style={{width:16,height:16,color:C.tealPale}}/></button>
            <button type="button" onClick={toggle} style={{width:44,height:44,borderRadius:'50%',background:`linear-gradient(135deg,${C.teal},${C.mid})`,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 16px ${hexToRgba(C.teal,.5)}`}}>{playing?<Pause style={{width:16,height:16,color:C.white}}/>:<Play style={{width:16,height:16,color:C.white,marginLeft:2}}/>}</button>
            <button type="button" onClick={()=>{const a=audioRef.current;if(a)a.currentTime=Math.min(duration,a.currentTime+10);}} style={{background:'none',border:'none',cursor:'pointer',padding:4,opacity:.5}}><SkipForward style={{width:16,height:16,color:C.tealPale}}/></button>
          </div>
          {editMode&&<div style={{marginTop:12,textAlign:'center'}}><button type="button" onClick={()=>onUpdate({musicUrl:'',musicType:'none' as any})} style={{background:hexToRgba(C.deep,.5),border:`1px solid ${hexToRgba(C.teal,.25)}`,borderRadius:99,padding:'4px 14px',cursor:'pointer',fontFamily:F.label,fontSize:9,color:hexToRgba(C.tealPale,.45),letterSpacing:1}}>Schimbă sursa</button></div>}
        </div>)}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK TOOLBAR
// ─────────────────────────────────────────────────────────────────────────────
const BlockToolbar = ({onUp,onDown,onToggle,onDelete,visible,isFirst,isLast}:any)=>{
  const btn:React.CSSProperties={background:'none',border:'none',padding:5,borderRadius:99,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'};
  const stop=(e:React.MouseEvent)=>e.stopPropagation();
  return(
    <div onClick={stop} style={{position:'absolute',top:-18,right:6,zIndex:9999,display:'flex',alignItems:'center',gap:2,borderRadius:99,border:`1px solid ${hexToRgba(C.teal,.4)}`,backgroundColor:hexToRgba(C.ocean,.95),backdropFilter:'blur(8px)',padding:'3px 5px',pointerEvents:'auto',boxShadow:'0 4px 16px rgba(0,0,0,.6)'}}>
      <button type="button" onClick={e=>{stop(e);onUp();}} disabled={isFirst} style={{...btn,opacity:isFirst?.2:1}}><ChevronUp style={{width:13,height:13,color:C.teal}}/></button>
      <button type="button" onClick={e=>{stop(e);onDown();}} disabled={isLast} style={{...btn,opacity:isLast?.2:1}}><ChevronDown style={{width:13,height:13,color:C.teal}}/></button>
      <div style={{width:1,height:12,backgroundColor:`${hexToRgba(C.teal,.3)}`,margin:'0 1px'}}/>
      <button type="button" onClick={e=>{stop(e);onToggle();}} style={btn}>{visible?<Eye style={{width:13,height:13,color:C.tealPale}}/>:<EyeOff style={{width:13,height:13,color:hexToRgba(C.tealPale,.3)}}/>}</button>
      <button type="button" onClick={e=>{stop(e);onDelete();}} style={btn}><Trash2 style={{width:13,height:13,color:'rgba(252,165,165,.9)'}}/></button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INSERT BLOCK BUTTON
// ─────────────────────────────────────────────────────────────────────────────
const BLOCK_TYPE_ICONS:Record<string,string>={photo:'🖼',text:'✏️',location:'📍',calendar:'📅',countdown:'⏱',music:'🎵',gift:'🎁',whatsapp:'💬',rsvp:'✉️',divider:'—',family:'👨‍👩‍👧',date:'📆',description:'📝',timeline:'🗓'};
const InsertBlockButton: React.FC<{insertIdx:number;openInsertAt:number|null;setOpenInsertAt:(v:number|null)=>void;BLOCK_TYPES:{type:string;label:string;def:any}[];onInsert:(type:string,def:any)=>void}> = ({insertIdx,openInsertAt,setOpenInsertAt,BLOCK_TYPES,onInsert})=>{
  const isOpen=openInsertAt===insertIdx;
  const [hov,setHov]=React.useState(false);
  return(
    <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',height:32,zIndex:20}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{position:'absolute',left:0,right:0,height:1,background:`repeating-linear-gradient(to right,${hexToRgba(C.teal,.4)} 0,${hexToRgba(C.teal,.4)} 6px,transparent 6px,transparent 12px)`,zIndex:1}}/>
      <button type="button" onClick={()=>setOpenInsertAt(isOpen?null:insertIdx)} style={{width:26,height:26,borderRadius:'50%',background:isOpen?C.teal:hexToRgba(C.ocean,.92),border:`1.5px solid ${hexToRgba(C.teal,.5)}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:isOpen?C.ocean:C.teal,boxShadow:`0 2px 10px ${hexToRgba(C.teal,.3)}`,opacity:1,transition:'transform .15s,background .15s',transform:(hov||isOpen)?'scale(1)':'scale(.7)',zIndex:2,position:'relative',lineHeight:1,fontWeight:700}}>{isOpen?'×':'+'}</button>
      {isOpen&&(
        <div style={{position:'absolute',bottom:34,left:'50%',transform:'translateX(-50%)',background:hexToRgba(C.ocean,.97),backdropFilter:'blur(12px)',borderRadius:16,border:`1px solid ${hexToRgba(C.teal,.35)}`,boxShadow:`0 16px 48px rgba(0,0,0,.7)`,padding:16,zIndex:100,width:260}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
          <p style={{fontFamily:F.label,fontSize:'.5rem',letterSpacing:'.4em',textTransform:'uppercase',color:hexToRgba(C.tealPale,.5),margin:'0 0 10px',textAlign:'center'}}>Adaugă bloc</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
            {BLOCK_TYPES.map(bt=>(
              <button key={bt.type} type="button" onClick={()=>onInsert(bt.type,bt.def)}
                style={{background:hexToRgba(C.deep,.5),border:`1px solid ${hexToRgba(C.teal,.25)}`,borderRadius:10,padding:'8px 4px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4,transition:'all .15s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=hexToRgba(C.teal,.12);(e.currentTarget as HTMLButtonElement).style.borderColor=hexToRgba(C.teal,.5);}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background=hexToRgba(C.deep,.5);(e.currentTarget as HTMLButtonElement).style.borderColor=hexToRgba(C.teal,.25);}}>
                <span style={{fontSize:18,lineHeight:1}}>{BLOCK_TYPE_ICONS[bt.type]||'+'}</span>
                <span style={{fontFamily:F.label,fontSize:'.5rem',letterSpacing:'.2em',textTransform:'uppercase',color:C.tealPale,lineHeight:1.2,textAlign:'center'}}>{bt.label.replace(/^[^\s]+\s/,'')}</span>
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
  partner1Name:'Ariel', partner2Name:'', eventType:'baptism',
  welcomeText:'Cu bucurie vă invităm', celebrationText:'la botezul ei',
  showWelcomeText:true, showCelebrationText:true,
  weddingDate:'', rsvpButtonText:'Confirmă Prezența',
  castleIntroSubtitle:'te invită în lumea subacvatică',
  castleInviteTop:'Cu multă bucurie vă anunțăm',
  castleInviteMiddle:'', castleInviteBottom:'va fi botezată',
  castleInviteTag:'🐚 deschide valurile 🌊', colorTheme:'default',
};

export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = [
  {id:'def-music',    type:'music'    as const,show:true,musicTitle:'',musicArtist:'',musicUrl:'',musicType:'none' as const},
  {id:'def-photo-1',  type:'photo'    as const,show:true,imageData:'',altText:'Foto',aspectRatio:'3:4' as const,photoClip:'arch' as const,photoMasks:['fade-b'] as any},
  {id:'def-text-1',   type:'text'     as const,show:true,content:'Undeva, departe, sub valurile mării, se află o lume de poveste. Vă invităm să fiți alături de noi în această zi magică!'},
  {id:'def-divider-1',type:'divider'  as const,show:true},
  {id:'def-family-1', type:'family'   as const,show:true,label:'Părinții',content:'Cu drag și bucurie',members:JSON.stringify([{name1:'Mama',name2:'Tata'}])},
  {id:'def-family-2', type:'family'   as const,show:true,label:'Nașii',content:'Cu drag și recunoștință',members:JSON.stringify([{name1:'Nașa',name2:'Nașul'}])},
  {id:'def-calendar', type:'calendar' as const,show:true},
  {id:'def-countdown',type:'countdown'as const,show:true},
  {id:'def-divider-2',type:'divider'  as const,show:true},
  {id:'def-loc-1',    type:'location' as const,show:true,label:'Botezul',time:'11:00',locationName:'Paraclisul Sfânta Maria',locationAddress:'Str. Mării 1, București',wazeLink:''},
  {id:'def-loc-2',    type:'location' as const,show:true,label:'Petrecerea',time:'15:00',locationName:'Salon Sub Valuri',locationAddress:'Aleea Coralilor 5, București',wazeLink:''},
  {id:'def-divider-3',type:'divider'  as const,show:true},
  {id:'def-photo-2',  type:'photo'    as const,show:true,imageData:'',altText:'Foto',aspectRatio:'1:1' as const,photoClip:'circle' as const,photoMasks:['vignette'] as any},
  {id:'def-gift',     type:'gift'     as const,show:true,sectionTitle:'Sugestie de cadou',content:'Cel mai frumos cadou este prezența voastră alături de noi.',iban:'',ibanName:''},
  {id:'def-rsvp',     type:'rsvp'     as const,show:true,label:'Confirmă Prezența'},
];

export const CASTLE_PREVIEW_DATA = {
  guest:{name:'Invitat Drag',status:'pending',type:'adult'},
  project:{selectedTemplate:'little-mermaid'},
  profile:{...CASTLE_DEFAULTS,weddingDate:new Date(Date.now()+60*24*60*60*1000).toISOString().split('T')[0],customSections:JSON.stringify(CASTLE_DEFAULT_BLOCKS)},
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
const LittleMermaidTemplate: React.FC<InvitationTemplateProps & {
  editMode?:boolean; introPreview?:boolean;
  onProfileUpdate?:(patch:Record<string,any>)=>void;
  onBlocksUpdate?:(blocks:InvitationBlock[])=>void;
  onBlockSelect?:(block:InvitationBlock|null,idx:number,textKey?:string,textLabel?:string)=>void;
  selectedBlockId?:string; scrollContainer?:HTMLElement|null;
}> = ({data,onOpenRSVP,editMode=false,introPreview=false,scrollContainer,onProfileUpdate,onBlocksUpdate,onBlockSelect,selectedBlockId})=>{
  const {profile,guest}=data;

  // Apply color theme each render (module-level C is mutated like Jurassic)
  const _t = getMermaidTheme((profile as any).colorTheme);
  C = { ...C, ocean:_t.ocean, deep:_t.deep, mid:_t.mid, bright:_t.bright, teal:_t.teal, tealPale:_t.tealPale, coral:_t.coral, pink:_t.pink, gold:_t.gold };

  const safeJSON=(s:string|undefined,fb:any)=>{try{return s?JSON.parse(s):fb;}catch{return fb;}};
  const pr=profile as any;
  const p={
    partner1Name: pr.partner1Name??CASTLE_DEFAULTS.partner1Name,
    partner2Name: pr.partner2Name??'',
    eventType:    pr.eventType??'baptism',
    weddingDate:  pr.weddingDate??'',
    welcomeText:  pr.welcomeText??CASTLE_DEFAULTS.welcomeText,
    celebrationText: pr.celebrationText??CASTLE_DEFAULTS.celebrationText,
    showWelcomeText:     pr.showWelcomeText??true,
    showCelebrationText: pr.showCelebrationText??true,
    castleIntroSubtitle: pr.castleIntroSubtitle??CASTLE_DEFAULTS.castleIntroSubtitle,
    castleInviteTop:     pr.castleInviteTop??CASTLE_DEFAULTS.castleInviteTop,
    castleInviteMiddle:  pr.castleInviteMiddle??CASTLE_DEFAULTS.castleInviteMiddle,
    castleInviteBottom:  pr.castleInviteBottom??CASTLE_DEFAULTS.castleInviteBottom,
    castleInviteTag:     pr.castleInviteTag??CASTLE_DEFAULTS.castleInviteTag,
  };
  const isWedding=['wedding','anniversary'].includes(p.eventType.toLowerCase());
  const babyName=p.partner1Name;
  const wd=p.weddingDate?new Date(p.weddingDate):null;
  const displayDay     = wd?wd.getDate():'';
  const displayMonth   = wd?wd.toLocaleDateString('ro-RO',{month:'long'}).toUpperCase():'';
  const displayYear    = wd?wd.getFullYear():'';
  const displayWeekday = wd?wd.toLocaleDateString('ro-RO',{weekday:'long'}):'';
  const dateStr        = wd?wd.toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'}):'Data Evenimentului';

  // Blocks
  const blocksFromDB:InvitationBlock[]|null=safeJSON(pr.customSections,null);
  const hasDB=Array.isArray(blocksFromDB)&&blocksFromDB.length>0;
  const [blocks,setBlocks]=useState<InvitationBlock[]>(()=>hasDB?blocksFromDB!:CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
  useEffect(()=>{const fresh:InvitationBlock[]|null=safeJSON(pr.customSections,null);if(Array.isArray(fresh)&&fresh.length>0)setBlocks(fresh);else if(fresh!==null&&Array.isArray(fresh)&&fresh.length===0)setBlocks(CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);},[pr.customSections]);

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

    const i = {
      logo:      themeImgs.logo      || defaultImgs.logo      || globalConfig.logo      || IMG_LOGO,
      ariel:     themeImgs.ariel     || defaultImgs.ariel     || globalConfig.ariel     || IMG_ARIEL,
      baby:      themeImgs.baby      || defaultImgs.baby      || globalConfig.baby      || IMG_BABY,
      banner:    themeImgs.banner    || defaultImgs.banner    || globalConfig.banner    || IMG_BANNER,
      coral:     themeImgs.coral     || defaultImgs.coral     || globalConfig.coral     || IMG_CORAL,
      moonscene: themeImgs.moonscene || defaultImgs.moonscene || globalConfig.moonscene || IMG_MOONSCENE,
      sebastian: themeImgs.sebastian || defaultImgs.sebastian || globalConfig.sebastian || IMG_SEBASTIAN,
      flounder:  themeImgs.flounder  || defaultImgs.flounder  || globalConfig.flounder  || IMG_FLOUNDER,
      shell:     themeImgs.shell     || defaultImgs.shell     || globalConfig.shell     || IMG_SHELL,
      pearl:     themeImgs.pearl     || defaultImgs.pearl     || globalConfig.pearl     || IMG_PEARL,
    };




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
    setBlocks(fb as unknown as InvitationBlock[]);onBlocksUpdate?.(fb as unknown as InvitationBlock[]);
  },[onProfileUpdate,onBlocksUpdate,pr.weddingDate]);

  const BLOCK_TYPES=[
    {type:'photo',label:'📷 Foto',def:{imageData:'',aspectRatio:'1:1',photoClip:'rect',photoMasks:[]}},
    {type:'text',label:'Text',def:{content:'Sub valurile mării...'}},
    {type:'location',label:'Locatie',def:{label:'Locație',time:'11:00',locationName:'Palatul Subacvatic',locationAddress:'Aleea Coralilor 1'}},
    {type:'calendar',label:'📅 Calendar',def:{}},
    {type:'countdown',label:'⏱ Countdown',def:{}},
    {type:'timeline',label:'🗓 Cronologie',def:{}},
    {type:'music',label:'🎵 Muzică',def:{musicTitle:'',musicArtist:'',musicType:'none'}},
    {type:'gift',label:'🎁 Cadouri',def:{sectionTitle:'Sugestie cadou',content:'',iban:'',ibanName:''}},
    {type:'whatsapp',label:'WhatsApp',def:{label:'Contact WhatsApp',content:'0700000000'}},
    {type:'rsvp',label:'RSVP',def:{label:'Confirmă Prezența'}},
    {type:'divider',label:'Linie',def:{}},
    {type:'family',label:'👨‍👩‍👧 Familie',def:{label:'Părinții',content:'Cu drag',members:JSON.stringify([{name1:'Mama',name2:'Tata'}])}},
    {type:'date',label:'📆 Data',def:{}},
    {type:'description',label:'Descriere',def:{content:'O scurtă descriere...'}},
  ];

  return(
    <>
      <style dangerouslySetInnerHTML={{__html:getArCss()}}/>

      {showAudioModal&&!editMode&&(
        <AudioPermissionModal childName={babyName} i={i}
          onAllow={()=>{audioAllowedRef.current=true;musicPlayRef.current?.unlock();setShowAudioModal(false);}}
          onDeny={()=>{audioAllowedRef.current=false;setShowAudioModal(false);}}/>
      )}

      {showIntro&&(
        <BlockStyleProvider value={{blockId:'__intro__',textStyles:pr.introTextStyles}}>
          <MermaidDoorIntro contentEl={contentEl} scrollContainer={scrollContainer}
            childName={p.partner1Name} partner2Name={p.partner2Name}
            isWedding={isWedding} subtitle={p.castleIntroSubtitle}
            inviteTop={p.castleInviteTop} inviteMiddle={p.castleInviteMiddle||dateStr}
            inviteBottom={p.castleInviteBottom} inviteTag={p.castleInviteTag} dateStr={dateStr}
            doorImg={heroBgImage} doorImgMobile={heroBgImageMobile}
            i={i}
            onDoorsOpen={()=>{if(audioAllowedRef.current)musicPlayRef.current?.play();}}/>
        </BlockStyleProvider>
      )}

      {editMode&&introPreview&&(
        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <div style={{marginBottom:32,padding:20,background:`${hexToRgba(C.ocean,.9)}`,borderRadius:20,border:`1px solid ${hexToRgba(C.teal,.3)}`}}>
            <p style={{fontFamily:F.label,fontSize:10,letterSpacing:'.4em',color:C.teal,textTransform:'uppercase',marginBottom:12}}>Preview intro (editabil)</p>
            <div style={{borderRadius:14,overflow:'hidden',border:`1px solid ${hexToRgba(C.teal,.25)}`}}>
              <BlockStyleProvider value={{blockId:'__intro__',textStyles:pr.introTextStyles,onTextSelect:(k,l)=>onBlockSelect?.({id:'__intro__',type:'intro' as any,show:true} as any,-1,k,l)}}>
                <MermaidDoorIntro editMode previewMode="static"
                  childName={p.partner1Name} partner2Name={p.partner2Name}
                  isWedding={isWedding} subtitle={p.castleIntroSubtitle}
                  inviteTop={p.castleInviteTop} inviteMiddle={p.castleInviteMiddle||dateStr}
                  inviteBottom={p.castleInviteBottom} inviteTag={p.castleInviteTag} dateStr={dateStr}
                  doorImg={heroBgImage} doorImgMobile={heroBgImageMobile}
                  i={i}
                  onChildNameChange={v=>upProfile('partner1Name',v)}
                  onSubtitleChange={v=>upProfile('castleIntroSubtitle',v)}
                  onInviteTopChange={v=>upProfile('castleInviteTop',v)}
                  onInviteMiddleChange={v=>upProfile('castleInviteMiddle',v)}
                  onInviteBottomChange={v=>upProfile('castleInviteBottom',v)}
                  onInviteTagChange={v=>upProfile('castleInviteTag',v)}/>
              </BlockStyleProvider>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div ref={el=>{contentRef.current=el;setContentEl(el);}}
        style={{
          minHeight:'100dvh',
          position:'relative',
          fontFamily:F.body,
          paddingBottom:'max(60px, env(safe-area-inset-bottom))',
          backgroundColor:C.ocean,
          overflow:'hidden',
        }}>

        {/* Fixed background — coral scene */}
        <div style={{position:'fixed',inset:0,zIndex:0}}>
          <img src={i.coral} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',filter:'brightness(.4) saturate(1.3)'}}/>
          <div style={{position:'absolute',inset:0,background:`linear-gradient(180deg,${hexToRgba(C.ocean,.75)} 0%,${hexToRgba(C.deep,.8)} 40%,${hexToRgba(C.ocean,.9)} 100%)`}}/>
        </div>
        {/* Vignette */}
        <div style={{position:'fixed',inset:0,zIndex:1,pointerEvents:'none',background:`radial-gradient(ellipse 85% 85% at 50% 50%,transparent 40%,${hexToRgba(C.ocean,.7)} 100%)`}}/>
        {/* Always-on effects */}
        <FallingStars/>
        <BubbleLayer/>
        <div style={{position:'fixed',inset:0,zIndex:1,pointerEvents:'none'}}><StarfishScatter fixed/></div>

        <div style={{position:'relative',zIndex:2,maxWidth:440,margin:'0 auto',padding:'28px 16px 0'}}>

          {/* ── HERO CARD — exact reference structure ── */}
          <BlockStyleProvider value={{blockId:'__hero__',textStyles:pr.heroTextStyles||{},onTextSelect:(k,l)=>onBlockSelect?.({id:'__hero__',type:'__hero__' as any,show:true} as any,-1,k,l)}}>
            <Reveal from="fade">
              <div style={{...getSectionStyle(),textAlign:'center',padding:'0 0 28px'}}>
                <WaveBar rainbow/>

                {/* Banner scene */}
                <div style={{position:'relative',height:185,overflow:'hidden',borderRadius:'18px 18px 0 0'}}>
                  <img src={i.banner} alt="Mica Sirenă" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 25%',filter:'brightness(.75) saturate(1.3)'}}/>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,height:80,background:`linear-gradient(to top,${hexToRgba(C.ocean,.98)},transparent)`}}/>
                  {/* Ariel floats over banner */}
                  <div style={{position:'absolute',right:-8,bottom:0,animation:'ar-float 4s ease-in-out infinite',filter:`drop-shadow(0 6px 20px ${hexToRgba(C.teal,.4)})`}}>
                    <img src={i.ariel} alt="Ariel" style={{height:160,objectFit:'contain',objectPosition:'bottom',filter:'drop-shadow(0 4px 14px rgba(0,0,0,.75))'}}/>
                  </div>
                  {/* Rainbow stars in banner */}
                  <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
                    {RAINBOW.map((c,i)=>(
                      <div key={i} style={{position:'absolute',left:`${12+i*12}%`,top:`${20+((i*7)%40)}%`,fontSize:10+((i*3)%8),color:c,animation:`ar-twinkle ${1.5+i*.2}s ${i*.15}s ease-in-out infinite`,filter:`drop-shadow(0 0 4px ${c})`}}>{['✦','⭐','✧','★','✨'][i%5]}</div>
                    ))}
                  </div>
                </div>

                <div style={{padding:'18px 24px 0'}}>
                  {/* Wave + sea star */}
                  <Reveal from="fade" delay={0.15}>
                    <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:10,marginBottom:10}}>
                      <div style={{flex:1,height:'.8px',background:`linear-gradient(to right,transparent,${C.teal})`,opacity:.45}}/>
                      <SeaStar size={34} color={C.teal} style={{animation:'ar-starSpin 5s ease-in-out infinite',filter:`drop-shadow(0 0 10px ${C.teal})`}}/>
                      <div style={{flex:1,height:'.8px',background:`linear-gradient(to left,transparent,${C.teal})`,opacity:.45}}/>
                    </div>
                    <p style={{fontFamily:F.label,fontSize:8,letterSpacing:'.65em',textTransform:'uppercase',color:C.teal,margin:'0 0 12px',opacity:.9}}>Mica Sirenă · Invitație Magică</p>
                  </Reveal>

                  {/* Rainbow starfish row */}
                  <Reveal from="fade" delay={0.18}>
                    <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:12}}>
                      {RAINBOW.map((c,i)=>(
                        <SeaStar key={i} size={14+((i*3)%8)} color={c} style={{animation:`ar-starSpin ${2+i*.4}s ${i*.2}s ease-in-out infinite`,filter:`drop-shadow(0 0 5px ${c})`}}/>
                      ))}
                    </div>
                  </Reveal>

                  {p.showWelcomeText&&(
                    <Reveal from="bottom" delay={0.2}>
                      <InlineEdit tag="p" editMode={editMode} value={p.welcomeText} onChange={v=>upProfile('welcomeText',v)}
                        style={{fontFamily:F.body,fontSize:13,fontWeight:700,fontStyle:'italic',color:hexToRgba(C.tealPale,.6),margin:'0 0 14px',lineHeight:1.7}}/>
                    </Reveal>
                  )}

                  {/* Names */}
                  <Reveal from="bottom" delay={0.25}>
                    {!isWedding?(
                      <InlineEdit tag="h1" editMode={editMode} value={p.partner1Name||'Prenume'} onChange={v=>upProfile('partner1Name',v)}
                        style={{fontFamily:F.display,fontWeight:900,fontSize:'clamp(32px,8vw,50px)',color:C.white,margin:'0 0 4px',lineHeight:1.05,letterSpacing:3,textShadow:`0 0 28px ${hexToRgba(C.teal,.6)},0 2px 0 rgba(0,0,0,.5)`}}/>
                    ):(
                      <div style={{margin:'0 0 4px'}}>
                        <InlineEdit tag="h1" editMode={editMode} value={p.partner1Name||'Prenume 1'} onChange={v=>upProfile('partner1Name',v)}
                          style={{fontFamily:F.display,fontWeight:900,fontSize:'clamp(26px,7vw,40px)',color:C.white,margin:0,lineHeight:1.1,letterSpacing:3,textShadow:`0 0 24px ${hexToRgba(C.teal,.5)},0 2px 0 rgba(0,0,0,.5)`}}/>
                        <div style={{margin:'10px 0',display:'flex',alignItems:'center',gap:14,justifyContent:'center'}}>
                          <div style={{flex:1,height:'.8px',background:`linear-gradient(to right,transparent,${C.teal})`,opacity:.5}}/>
                          <span style={{fontSize:20,animation:'ar-rainbow 3s linear infinite'}}>🌊</span>
                          <div style={{flex:1,height:'.8px',background:`linear-gradient(to left,transparent,${C.teal})`,opacity:.5}}/>
                        </div>
                        <InlineEdit tag="h1" editMode={editMode} value={p.partner2Name||'Prenume 2'} onChange={v=>upProfile('partner2Name',v)}
                          style={{fontFamily:F.display,fontWeight:900,fontSize:'clamp(26px,7vw,40px)',color:C.white,margin:0,lineHeight:1.1,letterSpacing:3,textShadow:`0 0 24px ${hexToRgba(C.teal,.5)},0 2px 0 rgba(0,0,0,.5)`}}/>
                      </div>
                    )}
                  </Reveal>

                  {p.showCelebrationText&&(
                    <Reveal from="bottom" delay={0.3}>
                      <InlineEdit tag="p" editMode={editMode} value={p.celebrationText} onChange={v=>upProfile('celebrationText',v)}
                        style={{fontFamily:F.magic,fontSize:18,color:C.tealPale,margin:'10px 0 0',textShadow:`0 0 14px ${hexToRgba(C.teal,.5)}`}}/>
                    </Reveal>
                  )}

                  <div style={{margin:'20px 0'}}><ShellDivider/></div>

                  {/* DATE — exact reference */}
                  <Reveal from="bottom" delay={0.35}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:14,marginBottom:22}}>
                      <div style={{textAlign:'right'}}>
                        <p style={{fontFamily:F.label,fontSize:8,letterSpacing:'.4em',textTransform:'uppercase',color:`${C.teal}bb`,margin:'0 0 2px'}}>{displayMonth}</p>
                        <p style={{fontFamily:F.label,fontSize:8,letterSpacing:'.3em',color:`${C.teal}66`,margin:0}}>{displayYear}</p>
                      </div>
                      <div style={{width:68,height:68,borderRadius:'50%',background:`radial-gradient(circle at 38% 35%,${C.mid},${C.ocean})`,border:`2.5px solid ${C.teal}`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',boxShadow:`0 0 24px ${hexToRgba(C.teal,.45)},0 4px 16px rgba(0,0,0,.6)`,animation:'ar-pulse 3.5s ease-in-out infinite'}}>
                        <div style={{position:'absolute',inset:5,border:`1px solid ${C.teal}44`,borderRadius:'50%'}}/>
                        <span style={{fontFamily:F.display,fontWeight:700,fontSize:24,color:C.white,lineHeight:1,textShadow:`0 0 12px ${hexToRgba(C.teal,.6)}`}}>{displayDay}</span>
                      </div>
                      <div style={{textAlign:'left'}}>
                        <p style={{fontFamily:F.body,fontSize:12,fontStyle:'italic',color:`${hexToRgba(C.tealPale,.45)}`,margin:0,lineHeight:1.5,textTransform:'capitalize'}}>{displayWeekday}</p>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal from="bottom" delay={0.4}>
                    <Countdown targetDate={p.weddingDate}/>
                  </Reveal>

                  <div style={{margin:'20px 0'}}><ShellDivider rainbow/></div>

                  {/* Baby Ariel + sea stars */}
                  <Reveal from="bottom" delay={0.42}>
                    <div style={{display:'flex',justifyContent:'center',alignItems:'flex-end',gap:10,marginBottom:16}}>
                      <div style={{animation:'ar-swim 5s ease-in-out infinite'}}>
                        <img src={i.baby} alt="" style={{height:80,objectFit:'contain',filter:`drop-shadow(0 4px 14px rgba(255,107,107,.4))`}}/>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:5,alignItems:'center',paddingBottom:12}}>
                        {[C.teal,C.gold,C.coral].map((c,i)=>(
                          <SeaStar key={i} size={16+i*4} color={c} style={{animation:`ar-starSpin ${2+i*.5}s ${i*.3}s ease-in-out infinite`,filter:`drop-shadow(0 0 8px ${c})`}}/>
                        ))}
                      </div>
                    </div>
                  </Reveal>

                  {/* Guest */}
                  <Reveal from="bottom" delay={0.45}>
                    <div style={{padding:'16px 20px',background:`${hexToRgba(C.ocean,.45)}`,border:`1.5px solid ${hexToRgba(C.teal,.28)}`,borderTop:`3px solid ${C.teal}`,borderRadius:14,position:'relative'}}>
                      <div style={{position:'absolute',top:0,left:'15%',right:'15%',height:'1.5px',background:`linear-gradient(to right,transparent,${C.teal},transparent)`,opacity:.4}}/>
                      <p style={{fontFamily:F.label,fontSize:7,letterSpacing:'.55em',textTransform:'uppercase',color:`${hexToRgba(C.teal,.5)}`,margin:'0 0 7px'}}>🐚 Invitaţie pentru</p>
                      <p style={{fontFamily:F.display,fontWeight:700,fontSize:19,color:C.white,margin:0,letterSpacing:1.5,textShadow:`0 0 16px ${hexToRgba(C.teal,.3)}`}}>{guest?.name||'Invitatul Special'}</p>
                    </div>
                  </Reveal>
                </div>

                <div style={{margin:'20px 20px 0'}}><WaveBar rainbow/></div>
              </div>
            </Reveal>
          </BlockStyleProvider>

          {/* ── BLOCKS ── */}
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {editMode&&<InsertBlockButton insertIdx={-1} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt} BLOCK_TYPES={BLOCK_TYPES} onInsert={(t,d)=>handleInsertAt(-1,t,d)}/>}

            {blocks.filter(b=>editMode||b.show!==false).map((block,idx)=>(
              <div key={block.id} style={{position:'relative'}}>
                {editMode&&<BlockToolbar onUp={()=>movBlock(idx,-1)} onDown={()=>movBlock(idx,1)} onToggle={()=>updBlock(idx,{show:!block.show})} onDelete={()=>delBlock(idx)} visible={block.show!==false} isFirst={idx===0} isLast={idx===blocks.length-1}/>}

                <div style={{position:'relative',padding:'6px 0',opacity:block.show===false?.4:1}} onClick={editMode?()=>onBlockSelect?.(block,idx):undefined}>
                  <BlockStyleProvider value={{blockId:block.id,textStyles:(block as any).textStyles,onTextSelect:(k,l)=>onBlockSelect?.(block,idx,k,l)}}>

                    {editMode&&block.show===false&&(
                      <div style={{position:'absolute',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:20,pointerEvents:'none'}}>
                        <div style={{position:'absolute',inset:0,borderRadius:20,background:'rgba(0,0,0,.3)',backdropFilter:'blur(2px)'}}/>
                        <div style={{position:'relative',zIndex:10}}><EyeOff size={22} color={hexToRgba(C.tealPale,.5)}/></div>
                      </div>
                    )}

                    {/* divider */}
                    {block.type==='divider'&&<ShellDivider/>}

                    {/* rsvp */}
                    {block.type==='rsvp'&&(
                      <button type="button" onClick={()=>!editMode&&onOpenRSVP?.()}
                        style={{width:'100%',padding:'20px',background:`linear-gradient(135deg,${C.teal},${C.mid})`,border:'none',borderRadius:50,cursor:'pointer',fontFamily:F.display,fontSize:13,fontWeight:700,color:C.white,letterSpacing:2,textTransform:'uppercase',boxShadow:`0 6px 28px ${hexToRgba(C.teal,.5)},0 0 0 3px ${hexToRgba(C.teal,.2)}`,transition:'all .25s',position:'relative',overflow:'hidden'}}
                        onMouseEnter={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.transform='scale(1.04)';b.style.boxShadow=`0 10px 40px ${hexToRgba(C.teal,.7)},0 0 0 5px ${hexToRgba(C.teal,.3)}`;}}
                        onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.transform='scale(1)';b.style.boxShadow=`0 6px 28px ${hexToRgba(C.teal,.5)},0 0 0 3px ${hexToRgba(C.teal,.2)}`;}}>
                        <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)',backgroundSize:'200% 100%',animation:'ar-shimmer 2s linear infinite',borderRadius:50}}/>
                        <span style={{position:'relative'}}>
                          <InlineEdit editMode={editMode} value={`🐚 ${block.label||'Confirmă Prezența'} 🌊`} onChange={v=>updBlock(idx,{label:v.replace(/[🐚🌊]/g,'').trim()})}/>
                        </span>
                      </button>
                    )}

                    {/* photo */}
                    {block.type==='photo'&&(
                      <Reveal>
                        <div onClick={editMode?()=>onBlockSelect?.(block,idx):undefined} style={editMode?{cursor:'pointer',outline:selectedBlockId===block.id?`2px solid ${C.teal}`:'none',outlineOffset:4,borderRadius:16}:undefined}>
                          <PhotoBlock block={block} editMode={editMode} onUpdate={p=>updBlock(idx,p)} placeholderInitial={babyName[0]}/>
                        </div>
                      </Reveal>
                    )}

                    {/* text */}
                    {block.type==='text'&&(
                      <Reveal>
                        <div style={{...getSectionStyle()}}>
                          <div style={getScanlines()}/>
                          <div style={{position:'relative',zIndex:1}}>
                            <InlineEdit editMode={editMode} value={block.content||''} onChange={v=>updBlock(idx,{content:v})} multiline
                              style={{fontFamily:F.body,fontSize:13,fontWeight:600,fontStyle:'italic',color:hexToRgba(C.tealPale,.7),margin:0,lineHeight:1.85,textAlign:'center'}}/>
                          </div>
                        </div>
                      </Reveal>
                    )}

                    {/* location */}
                    {block.type==='location'&&(
                      <Reveal from="left">
                        <LocCard block={block} editMode={editMode} onUpdate={p=>updBlock(idx,p)}/>
                      </Reveal>
                    )}

                    {/* calendar */}
                    {block.type==='calendar'&&(
                      <Reveal>
                        <div style={{...getSectionStyle()}}>
                          <div style={getScanlines()}/>
                          <div style={{position:'relative',zIndex:1}}><CalendarMonth date={p.weddingDate}/></div>
                        </div>
                      </Reveal>
                    )}

                    {/* countdown */}
                    {block.type==='countdown'&&(
                      <Reveal>
                        <div style={{...getSectionStyle()}}>
                          <div style={getScanlines()}/>
                          <div style={{position:'relative',zIndex:1}}><Countdown targetDate={p.weddingDate}/></div>
                        </div>
                      </Reveal>
                    )}

                    {/* timeline */}
                    {block.type==='timeline'&&(()=>{
                      const items=getTimelineItems();
                      if(!items.length&&!editMode)return null;
                      return(
                        <Reveal>
                          <div style={{...getSectionStyle()}}>
                            <div style={getScanlines()}/>
                            <div style={{position:'relative',zIndex:1}}>
                              <p style={{fontFamily:F.label,fontSize:8,letterSpacing:'.55em',textTransform:'uppercase',color:C.teal,textAlign:'center',margin:'0 0 18px',opacity:.9}}>🐚 Programul Zilei 🌊</p>
                              {!items.length&&editMode&&<p style={{fontFamily:F.body,fontSize:12,fontStyle:'italic',color:hexToRgba(C.tealPale,.4),textAlign:'center',margin:'0 0 14px'}}>Adaugă primul moment al zilei</p>}
                              <div style={{display:'flex',flexDirection:'column'}}>
                                {items.map((item:any,i:number)=>(
                                  <div key={item.id} style={{display:'grid',gridTemplateColumns:'58px 22px 1fr auto',alignItems:'stretch',minHeight:44}}>
                                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'flex-end',paddingRight:12,paddingTop:4}}>
                                      <InlineEdit editMode={editMode} value={item.time||''} onChange={v=>updateTimelineItem(item.id,{time:v})} style={{fontFamily:F.label,fontSize:10,color:C.teal,letterSpacing:.5,opacity:.9}}/>
                                    </div>
                                    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                                      <div style={{width:13,height:13,borderRadius:'50%',background:`radial-gradient(circle at 35% 35%,${C.tealPale},${C.teal})`,marginTop:5,flexShrink:0,boxShadow:`0 0 8px ${C.teal}88`}}/>
                                      {i<items.length-1&&<div style={{flex:1,width:'1px',marginTop:3,background:`linear-gradient(to bottom,${C.teal}55,transparent)`}}/>}
                                    </div>
                                    <div style={{paddingLeft:12,paddingTop:2,paddingBottom:i<items.length-1?18:0}}>
                                      <InlineEdit editMode={editMode} value={item.title||''} onChange={v=>updateTimelineItem(item.id,{title:v})} placeholder="Moment..." style={{fontFamily:F.body,fontSize:13,fontWeight:700,fontStyle:'italic',color:hexToRgba(C.tealPale,.7)}}/>
                                    </div>
                                    {editMode&&<button type="button" onClick={e=>{e.stopPropagation();removeTimelineItem(item.id);}} style={{background:'none',border:'none',cursor:'pointer',color:hexToRgba(C.tealPale,.35),fontSize:12,padding:'4px 2px',alignSelf:'flex-start',lineHeight:1}}>✕</button>}
                                  </div>
                                ))}
                              </div>
                              {editMode&&<button type="button" onClick={e=>{e.stopPropagation();addTimelineItem();}} style={{marginTop:14,width:'100%',background:`${hexToRgba(C.teal,.06)}`,border:`1px dashed ${hexToRgba(C.teal,.3)}`,borderRadius:10,padding:'8px 0',cursor:'pointer',fontFamily:F.label,fontSize:9,letterSpacing:'.3em',textTransform:'uppercase',color:`${hexToRgba(C.tealPale,.5)}`}}>+ Adaugă moment</button>}
                            </div>
                          </div>
                        </Reveal>
                      );
                    })()}

                    {/* music */}
                    {block.type==='music'&&<Reveal><MusicBlock block={block} editMode={editMode} onUpdate={p=>updBlock(idx,p)} imperativeRef={musicPlayRef}/></Reveal>}

                    {/* gift */}
                    {block.type==='gift'&&(
                      <Reveal>
                        <div style={{...getSectionStyle()}}>
                          <div style={getScanlines()}/>
                          <div style={{position:'relative',zIndex:1,textAlign:'center'}}>
                            <SeaStar size={48} color={C.gold} style={{display:'block',margin:'0 auto 12px',animation:'ar-starSpin 4s ease-in-out infinite',filter:`drop-shadow(0 0 12px ${C.gold})`}}/>
                            <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle||'Sugestie de cadou'} onChange={v=>updBlock(idx,{sectionTitle:v})} style={{fontFamily:F.display,fontSize:17,fontWeight:700,color:C.white,marginBottom:8,letterSpacing:2}}/>
                            <InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(idx,{content:v})} multiline style={{fontFamily:F.body,fontSize:12,fontStyle:'italic',color:`${hexToRgba(C.tealPale,.6)}`,lineHeight:1.65}}/>
                            {(block.iban||editMode)&&(
                              <div style={{marginTop:12,padding:'10px 14px',background:`${hexToRgba(C.ocean,.5)}`,borderRadius:10,border:`1px solid ${hexToRgba(C.teal,.25)}`,borderTop:`2px solid ${C.teal}`}}>
                                <InlineEdit tag="p" editMode={editMode} value={block.iban||''} onChange={v=>updBlock(idx,{iban:v})} placeholder="IBAN..." style={{fontFamily:F.label,fontSize:10,color:C.tealPale,letterSpacing:2}}/>
                              </div>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    )}

                    {/* whatsapp */}
                    {block.type==='whatsapp'&&(
                      <Reveal>
                        <div style={{textAlign:'center'}}>
                          <a href={`https://wa.me/${(block.content||'').replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                            style={{display:'inline-flex',alignItems:'center',gap:12,padding:'14px 24px',borderRadius:16,...getSectionStyle(),textDecoration:'none',marginTop:0}}>
                            <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#25D366,#128C7E)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(37,211,102,.4)',flexShrink:0}}>
                              <MessageCircle style={{width:22,height:22,color:'white'}}/>
                            </div>
                            <div style={{textAlign:'left'}}>
                              <InlineEdit tag="p" editMode={editMode} value={block.label||'Contact WhatsApp'} onChange={v=>updBlock(idx,{label:v})} style={{fontFamily:F.display,fontWeight:700,fontSize:13,color:C.white,margin:0,letterSpacing:1}}/>
                              <p style={{fontFamily:F.body,fontSize:10,color:hexToRgba(C.tealPale,.4),margin:0}}>Răspundem rapid 🐚</p>
                            </div>
                          </a>
                          {editMode&&(
                            <div style={{display:'flex',alignItems:'center',gap:8,...getSectionStyle(),justifyContent:'center',padding:'8px 16px',borderRadius:10,marginTop:6}}>
                              <span style={{fontFamily:F.label,fontSize:9,letterSpacing:'.3em',textTransform:'uppercase',color:hexToRgba(C.tealPale,.4)}}>Număr:</span>
                              <InlineEdit tag="span" editMode={editMode} value={block.content||'0700000000'} onChange={v=>updBlock(idx,{content:v})} style={{fontFamily:F.body,fontSize:'.9rem',color:C.white,fontWeight:700}}/>
                            </div>
                          )}
                        </div>
                      </Reveal>
                    )}

                    {/* family */}
                    {block.type==='family'&&(()=>{
                      const members:{name1:string;name2:string}[]=safeJSON(block.members,[]);
                      const updateMembers=(nm:{name1:string;name2:string}[])=>updBlock(idx,{members:JSON.stringify(nm)} as any);
                      return(
                        <Reveal>
                          <div style={{...getSectionStyle()}}>
                            <div style={getScanlines()}/>
                            <div style={{position:'relative',zIndex:1,textAlign:'center'}}>
                              <InlineEdit editMode={editMode} value={block.label||'Părinții'} onChange={v=>updBlock(idx,{label:v})} style={{fontFamily:F.label,fontSize:8,letterSpacing:'.55em',textTransform:'uppercase',color:C.teal,margin:'0 0 14px',opacity:.9,display:'block'}}/>
                              <InlineEdit editMode={editMode} value={block.content||'Cu drag și recunoștință'} onChange={v=>updBlock(idx,{content:v})} style={{fontFamily:F.magic,fontSize:14,color:hexToRgba(C.tealPale,.45),margin:'0 0 16px',display:'block'}}/>
                              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                                {members.map((m,mi)=>(
                                  <div key={mi}>
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,flexWrap:'wrap'}}>
                                      <InlineEdit tag="span" editMode={editMode} value={m.name1} onChange={v=>{const nm=[...members];nm[mi]={...nm[mi],name1:v};updateMembers(nm);}} style={{fontFamily:F.body,fontSize:17,fontWeight:800,color:hexToRgba(C.tealPale,.85),letterSpacing:1.5}}/>
                                      <span style={{color:C.teal,margin:'0 10px',fontSize:16}}>🌊</span>
                                      <InlineEdit tag="span" editMode={editMode} value={m.name2} onChange={v=>{const nm=[...members];nm[mi]={...nm[mi],name2:v};updateMembers(nm);}} style={{fontFamily:F.body,fontSize:17,fontWeight:800,color:hexToRgba(C.tealPale,.85),letterSpacing:1.5}}/>
                                      {editMode&&members.length>1&&<button type="button" onClick={()=>updateMembers(members.filter((_,i)=>i!==mi))} style={{background:'none',border:'none',cursor:'pointer',color:hexToRgba(C.tealPale,.35),fontSize:13,lineHeight:1}}>✕</button>}
                                    </div>
                                    {mi<members.length-1&&<div style={{height:'.8px',margin:'8px 28px',background:`linear-gradient(to right,transparent,${hexToRgba(C.teal,.3)},transparent)`}}/>}
                                  </div>
                                ))}
                              </div>
                              {editMode&&<button type="button" onClick={()=>updateMembers([...members,{name1:'Nume 1',name2:'Nume 2'}])} style={{marginTop:16,background:`${hexToRgba(C.teal,.07)}`,border:`1px dashed ${hexToRgba(C.teal,.35)}`,borderRadius:99,padding:'5px 18px',cursor:'pointer',fontFamily:F.label,fontSize:9,letterSpacing:'.3em',textTransform:'uppercase',color:`${hexToRgba(C.tealPale,.5)}`}}>+ Adaugă</button>}
                            </div>
                          </div>
                        </Reveal>
                      );
                    })()}

                    {/* date */}
                    {block.type==='date'&&(
                      <Reveal>
                        <div style={{textAlign:'center',padding:'4px 0'}}>
                          <p style={{fontFamily:F.label,letterSpacing:'.4em',fontSize:'.85rem',color:C.teal,margin:0,opacity:.9}}>
                            {p.weddingDate?new Date(p.weddingDate).toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'}):'Data Evenimentului'}
                          </p>
                        </div>
                      </Reveal>
                    )}

                    {/* description */}
                    {block.type==='description'&&(
                      <Reveal>
                        <div style={{textAlign:'center',padding:'0 16px'}}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(idx,{content:v})} style={{fontFamily:F.magic,fontSize:'1.1rem',color:hexToRgba(C.tealPale,.5),lineHeight:1.75,margin:0}}/>
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
            <div style={{marginTop:24,textAlign:'center'}}>
              <button onClick={resetToDefaults} style={{padding:'10px 24px',background:`${hexToRgba(C.ocean,.9)}`,border:`1px solid ${hexToRgba(C.teal,.3)}`,borderRadius:99,fontFamily:F.label,fontSize:9,letterSpacing:'.3em',textTransform:'uppercase',color:`${hexToRgba(C.tealPale,.45)}`,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Resetează la valorile implicite
              </button>
            </div>
          )}

          {/* Footer — exact reference */}
          <Reveal from="fade" delay={0.1}>
            <div style={{marginTop:28,textAlign:'center'}}>
              <ShellDivider rainbow/>
              <div style={{display:'flex',justifyContent:'center',gap:6,margin:'14px 0 12px',flexWrap:'wrap'}}>
                {RAINBOW.map((c,i)=>(
                  <SeaStar key={i} size={20+((i*4)%10)} color={c} style={{animation:`ar-starSpin ${2.5+i*.4}s ${i*.25}s ease-in-out infinite`,filter:`drop-shadow(0 0 8px ${c})`}}/>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'center',alignItems:'flex-end',gap:18,margin:'0 0 12px'}}>
                <div style={{animation:'ar-swim 5s ease-in-out infinite'}}>
                  <img src={i.baby} alt="" style={{height:64,objectFit:'contain',filter:`drop-shadow(0 4px 12px rgba(255,107,107,.4))`}}/>
                </div>
                <div style={{animation:'ar-float 4.5s ease-in-out infinite',marginBottom:8}}>
                  <img src={i.ariel} alt="" style={{height:80,objectFit:'contain',filter:`drop-shadow(0 4px 16px ${hexToRgba(C.teal,.4)})`}}/>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:8}}>
                {['🐠','🐚','🌊','⭐','🐟','🌟','🐡','💫','🪸'].map((e,i)=>(
                  <span key={i} style={{fontSize:14,display:'inline-block',animation:`ar-twinkle ${1.5+i*.2}s ${i*.12}s ease-in-out infinite`}}>{e}</span>
                ))}
              </div>
              <p style={{fontFamily:F.label,fontSize:9,letterSpacing:'.45em',textTransform:'uppercase',color:`${hexToRgba(C.teal,.3)}`,margin:0}}>
                ✦ Mica Sirenă · Lumea Subacvatică · {displayYear} ✦
              </p>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
};

export default LittleMermaidTemplate;
