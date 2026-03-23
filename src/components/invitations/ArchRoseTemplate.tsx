import React, { useState, useEffect, useRef, useCallback } from "react";
import { BlockStyleCtx, BlockStyleProvider, BlockStyle } from '../BlockStyleContext';

// ─── Asset images ─────────────────────────────────────────────────────────────
const archWhiteImg   = '/ArchRoseTemplate/arch-white.png';
const archPinkImg    = '/ArchRoseTemplate/arch-pink.png';
const rosesCornerImg = '/ArchRoseTemplate/roses-corner.jpg';
const rosesSideImg   = '/ArchRoseTemplate/roses-side.jpg';


import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus,
  Upload, Camera, Play, Pause, SkipForward, SkipBack,
  MapPin, Gift, Music, Shirt, Baby, Heart,
} from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";

const API_URL = (typeof window !== 'undefined' && (window as any).__API_URL__)
  || (import.meta as any)?.env?.VITE_API_URL
  || 'http://localhost:3005/api';

function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith('/uploads/')) return;
  const _session = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  const token    = _session?.token || '';
  fetch(`${API_URL}/upload`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

export const meta: TemplateMeta = {
  id: 'arch-rose',
  name: 'Arch & Rose',
  category: 'wedding',
  description: 'Arcadă floreală cu trandafiri · fundal alb clasic, decorații roz & crem, design romantic de lux.',
  colors: ['#f9f0ee', '#c4917a', '#8b4a6b'],
  previewClass: "bg-rose-50 border-rose-300",
  elementsClass: "bg-rose-400",
};

// ─── Design tokens ─────────────────────────────────────────────────────────────
const ROSE     = '#c4917a';   // dusty rose
const ROSE_D   = '#7a4040';   // deep rose / burgundy
const ROSE_L   = '#e8c4b8';   // light blush
const ROSE_XL  = '#f5e0d8';   // very light blush
const PINK     = '#d4789a';   // accent pink
const CREAM    = '#fdf7f5';   // warm cream
const IVORY    = '#fffcfb';   // near white
const STONE    = '#f0e4e0';   // warm stone
const TEXT     = '#2d1f1a';   // deep text
const MUTED    = '#9a7272';   // muted rose-grey
const SERIF    = "'Playfair Display','Cormorant Garamond',Georgia,serif";
const SCRIPT   = "'Great Vibes','Parisienne',cursive,serif";
const SANS     = "'Raleway','Montserrat',system-ui,sans-serif";

// ─── Shared helpers (photo shape system) ─────────────────────────────────────
type ClipShape = 'rect'|'rounded'|'rounded-lg'|'squircle'|'circle'|'arch'|'arch-b'|'hexagon'|'diamond'|'triangle'|'star'|'heart'|'diagonal'|'diagonal-r'|'wave-b'|'wave-t'|'wave-both'|'blob'|'blob2'|'blob3'|'blob4';
type MaskEffect = 'fade-b'|'fade-t'|'fade-l'|'fade-r'|'vignette';

function getClipStyle(clip: ClipShape): React.CSSProperties {
  const clips: Record<ClipShape, React.CSSProperties> = {
    rect: {borderRadius:0}, rounded:{borderRadius:16}, 'rounded-lg':{borderRadius:32}, squircle:{borderRadius:'30% 30% 30% 30% / 30% 30% 30% 30%'},
    circle:{borderRadius:'50%'}, arch:{borderRadius:'50% 50% 0 0 / 40% 40% 0 0'}, 'arch-b':{borderRadius:'0 0 50% 50% / 0 0 40% 40%'},
    hexagon:{clipPath:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'}, diamond:{clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'},
    triangle:{clipPath:'polygon(50% 0%,100% 100%,0% 100%)'}, star:{clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'},
    heart:{clipPath:'url(#clip-heart)'}, diagonal:{clipPath:'polygon(0 0,100% 0,100% 80%,0 100%)'}, 'diagonal-r':{clipPath:'polygon(0 0,100% 0,100% 100%,0 80%)'},
    'wave-b':{clipPath:'url(#clip-wave-b)'}, 'wave-t':{clipPath:'url(#clip-wave-t)'}, 'wave-both':{clipPath:'url(#clip-wave-both)'},
    blob:{clipPath:'url(#clip-blob)'}, blob2:{clipPath:'url(#clip-blob2)'}, blob3:{clipPath:'url(#clip-blob3)'}, blob4:{clipPath:'url(#clip-blob4)'},
  };
  return clips[clip] || {};
}

function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers = effects.map(e => ({
    'fade-b':'linear-gradient(to bottom,black 40%,transparent 100%)',
    'fade-t':'linear-gradient(to top,black 40%,transparent 100%)',
    'fade-l':'linear-gradient(to left,black 40%,transparent 100%)',
    'fade-r':'linear-gradient(to right,black 40%,transparent 100%)',
    'vignette':'radial-gradient(ellipse 80% 80% at center,black 40%,transparent 100%)',
  }[e] || 'none'));
  const mask = layers.join(', ');
  return { WebkitMaskImage:mask, maskImage:mask, WebkitMaskComposite:effects.length>1?'source-in':'unset', maskComposite:effects.length>1?'intersect':'unset' };
}

const PhotoClipDefs: React.FC = () => (
  <svg width="0" height="0" style={{position:'absolute',overflow:'hidden',pointerEvents:'none'}}>
    <defs>
      <clipPath id="clip-wave-b" clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="clip-wave-t" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath>
      <clipPath id="clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath>
      <clipPath id="clip-blob" clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath>
      <clipPath id="clip-blob2" clipPathUnits="objectBoundingBox"><path d="M0.75,-0.276 C0.831,-0.229 0.911,-0.158 0.921,-0.078 C0.93,0.002 0.869,0.09 0.808,0.161 C0.747,0.232 0.685,0.285 0.611,0.316 C0.538,0.347 0.453,0.356 0.389,0.324 C0.326,0.292 0.285,0.22 0.233,0.147 C0.181,0.073 0.119,-0.003 0.113,-0.086 C0.107,-0.169 0.157,-0.259 0.231,-0.307 C0.305,-0.355 0.402,-0.362 0.493,-0.353 C0.584,-0.345 0.668,-0.322 0.75,-0.276Z" transform="translate(0.5,0.5) scale(0.9)"/></clipPath>
      <clipPath id="clip-blob3" clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath>
      <clipPath id="clip-blob4" clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath>
    </defs>
  </svg>
);

// ─── Reveal on scroll ─────────────────────────────────────────────────────────
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVis(true), delay); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return { ref, vis };
}

const Reveal: React.FC<{children: React.ReactNode; delay?: number; style?: React.CSSProperties}> = ({children, delay=0, style}) => {
  const {ref, vis} = useReveal(delay);
  return (
    <div ref={ref} style={{ opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(20px)', transition:'opacity 0.75s cubic-bezier(0.4,0,0.2,1),transform 0.75s cubic-bezier(0.4,0,0.2,1)', ...style }}>
      {children}
    </div>
  );
};

// ─── Rose divider ─────────────────────────────────────────────────────────────
const RoseDivider = () => (
  <div style={{display:'flex', alignItems:'center', gap:10}}>
    <div style={{flex:1, height:0.5, background:`linear-gradient(to right, transparent, ${ROSE_L})`}}/>
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
      {/* Simple rose SVG */}
      <circle cx="16" cy="10" r="4" fill={ROSE_L}/>
      <circle cx="16" cy="10" r="2.5" fill={ROSE}/>
      <circle cx="16" cy="10" r="1.2" fill={ROSE_D} opacity="0.6"/>
      {[0,45,90,135,180,225,270,315].map((a,i)=>{
        const r=Math.PI*a/180; return <ellipse key={i} cx={16+Math.cos(r)*5.5} cy={10+Math.sin(r)*5.5} rx="2.2" ry="3.5" fill={ROSE_L} opacity="0.85" transform={`rotate(${a},${16+Math.cos(r)*5.5},${10+Math.sin(r)*5.5})`}/>;
      })}
      {/* Leaves */}
      <ellipse cx="8" cy="14" rx="3.5" ry="1.5" fill="#6b9e5e" opacity="0.5" transform="rotate(-30 8 14)"/>
      <ellipse cx="24" cy="6" rx="3.5" ry="1.5" fill="#6b9e5e" opacity="0.5" transform="rotate(-30 24 6)"/>
    </svg>
    <div style={{flex:1, height:0.5, background:`linear-gradient(to left, transparent, ${ROSE_L})`}}/>
  </div>
);

// ─── Small rose sprig (used as inline decoration) ─────────────────────────────
const RoseSprig: React.FC<{flip?: boolean; opacity?: number}> = ({flip, opacity=0.18}) => (
  <div style={{pointerEvents:'none', opacity, transform: flip ? 'scaleX(-1)' : undefined, display:'inline-block'}}>
    <img src={rosesSideImg} alt="" style={{width:90, height:90, objectFit:'cover', objectPosition:'top left', mixBlendMode:'multiply'}}/>
  </div>
);

// ─── Block toolbar ─────────────────────────────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-3.5 right-2 flex items-center gap-0.5 rounded-full border shadow-lg px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto"
    style={{background: IVORY, borderColor: ROSE_L}}>
    <button type="button" onClick={e=>{e.stopPropagation();onUp();}} disabled={isFirst} className="p-0.5 rounded-full disabled:opacity-20"><ChevronUp className="w-3 h-3" style={{color:ROSE}}/></button>
    <button type="button" onClick={e=>{e.stopPropagation();onDown();}} disabled={isLast} className="p-0.5 rounded-full disabled:opacity-20"><ChevronDown className="w-3 h-3" style={{color:ROSE}}/></button>
    <div className="w-px h-3 mx-0.5" style={{background: ROSE_L}}/>
    <button type="button" onClick={e=>{e.stopPropagation();onToggle();}} className="p-0.5 rounded-full">
      {visible ? <Eye className="w-3 h-3" style={{color:ROSE}}/> : <EyeOff className="w-3 h-3" style={{color:MUTED}}/>}
    </button>
    <button type="button" onClick={e=>{e.stopPropagation();onDelete();}} className="p-0.5 rounded-full hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400"/></button>
  </div>
);

// ─── Photo placeholder ────────────────────────────────────────────────────────
interface PhotoPlaceholderProps {
  aspectRatio: string; photoClip: ClipShape; photoMasks: MaskEffect[];
  initial1?: string; initial2?: string; variant?: number; editMode: boolean; onClick: () => void;
}
const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({aspectRatio,photoClip,photoMasks,initial1='A',initial2='B',variant=0,editMode,onClick}) => {
  const pads: Record<string,string> = {'1:1':'100%','4:3':'75%','3:4':'133%','16:9':'56.25%','free':'75%'};
  const pt = pads[aspectRatio]||'75%';
  const g = [['#e8c4b8','#c4917a'],['#f0d4cc','#b8827a'],['#ddb4a8','#a07068'],['#f5ddd6','#cc9888']][variant%4];
  const gId = `ar-ph-${variant}`;
  return (
    <div style={{position:'relative',paddingTop:pt,cursor:editMode?'pointer':'default',...getClipStyle(photoClip),...getMaskStyle(photoMasks),overflow:'hidden'}} onClick={editMode?onClick:undefined}>
      <div style={{position:'absolute',inset:0}}>
        <svg width="100%" height="100%" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={g[0]}/><stop offset="100%" stopColor={g[1]}/>
            </linearGradient>
          </defs>
          <rect width="400" height="500" fill={`url(#${gId})`}/>
          <rect x="18" y="18" width="364" height="464" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          <text x="200" y="215" fontFamily="Playfair Display,Georgia,serif" fontSize="100" fill="rgba(255,255,255,0.9)" textAnchor="middle" fontStyle="italic">{(initial1||'A')[0].toUpperCase()}</text>
          <text x="200" y="268" fontFamily="Great Vibes,cursive" fontSize="36" fill="rgba(255,255,255,0.6)" textAnchor="middle">&amp;</text>
          <text x="200" y="330" fontFamily="Playfair Display,Georgia,serif" fontSize="100" fill="rgba(255,255,255,0.9)" textAnchor="middle" fontStyle="italic">{(initial2||'B')[0].toUpperCase()}</text>
          <line x1="150" y1="345" x2="250" y2="345" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
          {editMode && <><rect x="130" y="390" width="140" height="36" rx="18" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/><text x="200" y="413" fontFamily="Raleway,sans-serif" fontSize="12" fill="white" textAnchor="middle" fontWeight="600" opacity="0.9">+ Adaugă fotografie</text></>}
        </svg>
      </div>
    </div>
  );
};

// ─── Photo block ───────────────────────────────────────────────────────────────
interface PhotoBlockProps {
  imageData: string|undefined; altText?: string; editMode: boolean;
  onUpload:(data:string)=>void; onRemove:()=>void;
  onClipChange:(c:ClipShape)=>void; onMasksChange:(m:MaskEffect[])=>void; onRatioChange:(r:'1:1'|'4:3'|'3:4'|'16:9'|'free')=>void;
  aspectRatio?:'1:1'|'4:3'|'3:4'|'16:9'|'free'; photoClip?:ClipShape; photoMasks?:MaskEffect[];
  placeholder?:string; placeholderInitial1?:string; placeholderInitial2?:string; placeholderVariant?:number;
}
const PhotoBlock: React.FC<PhotoBlockProps> = ({imageData,altText,editMode,onUpload,onRemove,onClipChange,onMasksChange,onRatioChange,aspectRatio='free',photoClip='rect',photoMasks=[],placeholder='Adaugă fotografie',placeholderInitial1,placeholderInitial2,placeholderVariant=0}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging,setDragging] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [uploadErr,setUploadErr] = useState('');
  const pads:Record<string,string> = {'1:1':'100%','4:3':'75%','3:4':'133%','16:9':'56.25%','free':'66.6%'};
  const pt = pads[aspectRatio];
  const clipStyle = getClipStyle(photoClip);
  const maskStyle = getMaskStyle(photoMasks);
  const combined:React.CSSProperties = {...clipStyle,...maskStyle};

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setUploadErr('Doar imagini sunt acceptate.'); return; }
    if (file.size > 12*1024*1024) { setUploadErr('Fișierul depășește 12 MB.'); return; }
    setUploadErr(''); setUploading(true);
    deleteUploadedFile(imageData);
    try {
      const form = new FormData(); form.append('file', file);
      const _s = JSON.parse(localStorage.getItem('weddingPro_session')||'{}');
      const res = await fetch(`${API_URL}/upload`,{method:'POST',headers:{Authorization:`Bearer ${_s?.token||''}`},body:form});
      if (!res.ok) { const e=await res.json(); throw new Error(e.error||'Upload eșuat.'); }
      const {url} = await res.json(); onUpload(url);
    } catch(e:any) { setUploadErr(e.message||'Eroare upload.'); }
    finally { setUploading(false); }
  };

  const imgSrc = imageData||undefined;
  const isDemoPhoto = !!imageData && imageData.includes('picsum.photos');
  const handleRemove = () => { deleteUploadedFile(imageData); onRemove(); };

  if (imgSrc) {
    return (
      <div>
        <PhotoClipDefs/>
        {uploading && <div style={{position:'relative',paddingTop:pt,background:ROSE_XL,...combined}}><div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10}}><div style={{width:32,height:32,border:`3px solid ${ROSE_L}`,borderTop:`3px solid ${ROSE}`,borderRadius:'50%',animation:'ar-spin 0.8s linear infinite'}}/><span style={{fontFamily:SANS,fontSize:11,fontWeight:700,color:ROSE}}>Se încarcă...</span></div></div>}
        {!uploading && (
          <div style={{position:'relative'}}>
            <div style={{position:'relative',paddingTop:pt,overflow:'hidden',...combined}}>
              <img src={imgSrc} alt={altText||''} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            </div>
            {editMode && (
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:0,transition:'opacity 0.2s',...combined}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.opacity='1'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.opacity='0'}>
                <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.42)'}}/>
                <button type="button" onClick={()=>fileRef.current?.click()} style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:99,background:'white',border:'none',cursor:'pointer',fontFamily:SANS,fontSize:11,fontWeight:700,color:TEXT}}><Camera className="w-3.5 h-3.5"/> Schimbă</button>
                <button type="button" onClick={handleRemove} style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:99,background:'rgba(220,40,40,0.88)',border:'none',cursor:'pointer',fontFamily:SANS,fontSize:11,fontWeight:700,color:'white'}}><Trash2 className="w-3.5 h-3.5"/> Șterge</button>
                {isDemoPhoto && <div style={{position:'absolute',bottom:10,left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,0.7)',color:'white',borderRadius:99,padding:'4px 14px',fontFamily:SANS,fontSize:9,fontWeight:700,whiteSpace:'nowrap',zIndex:2}}>📷 Fotografie demo</div>}
              </div>
            )}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);e.target.value='';}} style={{display:'none'}}/>
      </div>
    );
  }

  return (
    <div style={{position:'relative'}}>
      <PhotoClipDefs/>
      <PhotoPlaceholder aspectRatio={aspectRatio} photoClip={photoClip} photoMasks={photoMasks} initial1={placeholderInitial1} initial2={placeholderInitial2} variant={placeholderVariant} editMode={editMode} onClick={()=>fileRef.current?.click()}/>
      {editMode && (
        <div style={{position:'absolute',inset:0,opacity:0,transition:'opacity 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.opacity='1'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.opacity='0'} onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragging(true);(e.currentTarget as HTMLDivElement).style.opacity='1';}} onDragLeave={e=>{setDragging(false);(e.currentTarget as HTMLDivElement).style.opacity='0';}} onDrop={e=>{e.preventDefault();setDragging(false);(e.currentTarget as HTMLDivElement).style.opacity='0';const f=e.dataTransfer.files?.[0];if(f)handleFile(f);}}>
          <div style={{position:'absolute',inset:0,background:dragging?'rgba(196,145,122,0.55)':'rgba(0,0,0,0.35)',transition:'background 0.2s',...getClipStyle(photoClip)}}/>
          <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'2px solid rgba(255,255,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}><Upload className="w-5 h-5" style={{color:'white'}}/></div>
            <span style={{fontFamily:SANS,fontSize:11,fontWeight:700,color:'white',textShadow:'0 1px 4px rgba(0,0,0,0.5)'}}>{dragging?'Eliberează':'Înlocuiește fotografia'}</span>
          </div>
        </div>
      )}
      {uploading && <div style={{position:'absolute',inset:0,background:'rgba(253,247,245,0.85)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,...getClipStyle(photoClip)}}><div style={{width:32,height:32,border:`3px solid ${ROSE_L}`,borderTop:`3px solid ${ROSE}`,borderRadius:'50%',animation:'ar-spin 0.8s linear infinite'}}/><span style={{fontFamily:SANS,fontSize:11,fontWeight:700,color:ROSE}}>Se încarcă...</span></div>}
      {uploadErr && <div style={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',background:'rgba(200,40,40,0.9)',color:'white',borderRadius:99,padding:'4px 14px',fontFamily:SANS,fontSize:10,fontWeight:700,whiteSpace:'nowrap'}}>{uploadErr}</div>}
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}} style={{display:'none'}}/>
    </div>
  );
};

// ─── Calendar ─────────────────────────────────────────────────────────────────
const CalendarMonth: React.FC<{date: string|undefined}> = ({date}) => {
  if (!date) return null;
  const d = new Date(date);
  const year=d.getFullYear(), month=d.getMonth(), day=d.getDate();
  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const monthNames = ['IANUARIE','FEBRUARIE','MARTIE','APRILIE','MAI','IUNIE','IULIE','AUGUST','SEPTEMBRIE','OCTOMBRIE','NOIEMBRIE','DECEMBRIE'];
  const dayLabels = ['LUN','MAR','MIE','JOI','VIN','SÂM','DUM'];
  const startOffset = (firstDay+6)%7;
  const cells: (number|null)[] = [...Array(startOffset).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
  return (
    <div style={{background:`linear-gradient(135deg, ${ROSE_D}, #5a2a3a)`, borderRadius:12, padding:'20px 16px', textAlign:'center'}}>
      <p style={{fontFamily:SERIF,fontSize:11,fontWeight:600,letterSpacing:'0.38em',color:'rgba(255,255,255,0.8)',textTransform:'uppercase',margin:'0 0 14px'}}>{monthNames[month]} {year}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7, 1fr)',gap:2,marginBottom:6}}>
        {dayLabels.map(l=><div key={l} style={{fontFamily:SANS,fontSize:8,fontWeight:700,color:'rgba(255,255,255,0.4)',textAlign:'center',letterSpacing:'0.05em'}}>{l}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7, 1fr)',gap:2}}>
        {cells.map((cell,i)=>{
          const isToday = cell===day;
          return <div key={i} style={{height:28,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:isToday?SERIF:SANS,fontSize:isToday?16:11,fontWeight:isToday?600:400,color:isToday?ROSE_D:cell?'rgba(255,255,255,0.7)':'transparent',background:isToday?'white':'transparent',borderRadius:isToday?'50%':0,width:28,margin:'0 auto',boxShadow:isToday?'0 2px 8px rgba(0,0,0,0.2)':'none'}}>{cell||''}</div>;
        })}
      </div>
      <p style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.3em',color:'rgba(255,255,255,0.5)',textTransform:'uppercase',margin:'14px 0 0'}}>{d.toLocaleDateString('ro-RO',{weekday:'long'}).toUpperCase()}</p>
    </div>
  );
};

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(target: string) {
  const calc = () => { const diff=new Date(target).getTime()-Date.now(); if(diff<=0)return{days:0,hours:0,minutes:0,seconds:0,expired:true}; return{days:Math.floor(diff/86400000),hours:Math.floor((diff%86400000)/3600000),minutes:Math.floor((diff%3600000)/60000),seconds:Math.floor((diff%60000)/1000),expired:false}; };
  const [t,setT] = useState(calc);
  useEffect(()=>{ if(!target)return; const id=setInterval(()=>setT(calc()),1000); return ()=>clearInterval(id); },[target]);
  return t;
}

const CountdownSection: React.FC<{date: string|undefined}> = ({date}) => {
  const cd = useCountdown(date||'');
  if (!date||cd.expired) return null;
  const d = new Date(date);
  const monthNames=['IAN','FEB','MAR','APR','MAI','IUN','IUL','AUG','SEP','OCT','NOV','DEC'];
  return (
    <div style={{background:`linear-gradient(135deg, ${ROSE_D}, #5a2a3a)`, borderRadius:12, padding:'24px 20px', textAlign:'center'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,borderBottom:'0.5px solid rgba(255,255,255,0.15)',paddingBottom:12}}>
        <p style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.35em',textTransform:'uppercase',color:'rgba(255,255,255,0.45)',margin:0}}>{monthNames[d.getMonth()]}</p>
        <p style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.35em',textTransform:'uppercase',color:'rgba(255,255,255,0.45)',margin:0}}>{d.toLocaleDateString('ro-RO',{weekday:'long'}).toUpperCase()}</p>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginBottom:20}}>
        <div style={{textAlign:'left'}}><div style={{width:48,height:0.5,background:'rgba(255,255,255,0.25)',marginBottom:4}}/><p style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.3em',color:'rgba(255,255,255,0.35)',margin:0}}>{d.toLocaleDateString('ro-RO',{weekday:'short'}).toUpperCase()}</p></div>
        <span style={{fontFamily:SERIF,fontSize:72,fontWeight:300,color:'white',lineHeight:0.9}}>{d.getDate()}</span>
        <div style={{textAlign:'right'}}><p style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.25em',color:'rgba(255,255,255,0.35)',margin:0}}>{d.getFullYear()}</p><div style={{width:48,height:0.5,background:'rgba(255,255,255,0.25)',marginTop:4,marginLeft:'auto'}}/></div>
      </div>
      <p style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.4em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',margin:'0 0 14px'}}>FALTAN</p>
      <div style={{display:'flex',justifyContent:'center',alignItems:'flex-start',gap:2}}>
        {[{val:cd.days,label:'ZILE'},{val:cd.hours,label:'ORE'},{val:cd.minutes,label:'MIN'},{val:cd.seconds,label:'SEC'}].map(({val,label},i)=>(
          <React.Fragment key={i}>
            <div style={{textAlign:'center'}}>
              <span style={{fontFamily:SERIF,fontSize:42,fontWeight:300,color:'white',lineHeight:1,display:'block',minWidth:52}}>{String(val).padStart(2,'0')}</span>
              <span style={{fontFamily:SANS,fontSize:7,fontWeight:700,letterSpacing:'0.25em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase'}}>{label}</span>
            </div>
            {i<3 && <span style={{fontFamily:SERIF,fontSize:38,fontWeight:300,color:'rgba(255,255,255,0.4)',lineHeight:1,alignSelf:'flex-start',padding:'0 2px'}}>:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─── Location card ────────────────────────────────────────────────────────────
const LocCard: React.FC<{block: InvitationBlock; editMode: boolean; onUpdate:(p:Partial<InvitationBlock>)=>void; textColorOverride?:string}> = ({block,editMode,onUpdate,textColorOverride}) => {
  const {ref,vis} = useReveal();
  return (
    <div ref={ref} style={{background:IVORY,border:`1px solid ${ROSE_L}`,borderRadius:12,padding:'20px 24px',textAlign:(block.blockAlign as any)||'center',opacity:vis?1:0,transform:vis?'translateY(0)':'translateY(18px)',transition:'opacity 0.7s,transform 0.7s',position:'relative',overflow:'hidden'}}>
      {/* Subtle rose corner */}
      <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,pointerEvents:'none',opacity:0.12}}>
        <img src={rosesCornerImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)'}}/>
      </div>
      <MapPin className="w-6 h-6" style={{color:ROSE,opacity:0.7,display:'block',margin:'0 auto 10px'}}/>
      <InlineEdit tag="p" editMode={editMode} value={block.label||''} onChange={v=>onUpdate({label:v})} placeholder="Eveniment..." style={{fontFamily:SANS,fontSize:8,fontWeight:700,letterSpacing:'0.4em',textTransform:'uppercase',color:MUTED,margin:'0 0 8px',display:'block'}}/>
      <InlineTime value={block.time||''} onChange={v=>onUpdate({time:v})} editMode={editMode} style={{fontFamily:SERIF,fontSize:22,fontWeight:300,color:textColorOverride||ROSE_D,display:'block',marginBottom:4}}/>
      <InlineEdit tag="p" editMode={editMode} value={block.locationName||''} onChange={v=>onUpdate({locationName:v})} placeholder="Locație..." style={{fontFamily:SCRIPT,fontSize:22,color:textColorOverride||ROSE_D,margin:'0 0 4px',display:'block'}}/>
      <InlineEdit tag="p" editMode={editMode} value={block.locationAddress||''} onChange={v=>onUpdate({locationAddress:v})} placeholder="Adresă..." multiline style={{fontFamily:SANS,fontSize:11,color:textColorOverride||MUTED,margin:0,lineHeight:1.5}}/>
      {(block.wazeLink||editMode) && <div style={{marginTop:12}}><InlineWaze value={block.wazeLink||''} onChange={v=>onUpdate({wazeLink:v})} editMode={editMode}/></div>}
    </div>
  );
};

// ─── YouTube helpers ──────────────────────────────────────────────────────────
declare global { interface Window { YT: any; onYouTubeIframeAPIReady:()=>void; } }
let ytApiLoaded=false, ytApiLoading=false;
const ytReadyCbs: Array<()=>void> = [];
function loadYtApi(cb:()=>void){if(ytApiLoaded&&window.YT?.Player){cb();return;}ytReadyCbs.push(cb);if(ytApiLoading)return;ytApiLoading=true;const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);window.onYouTubeIframeAPIReady=()=>{ytApiLoaded=true;ytReadyCbs.forEach(f=>f());ytReadyCbs.length=0;};}
function extractYoutubeId(url:string):string|null{if(!url)return null;const ps=[/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/];for(const p of ps){const m=url.match(p);if(m)return m[1];}return null;}

// ─── YouTube audio player ─────────────────────────────────────────────────────
const YoutubeAudioPlayer:React.FC<{ytId:string;title:string;artist:string;editMode:boolean;onTitleChange:(v:string)=>void;onArtistChange:(v:string)=>void}>=({ytId,title,artist,editMode,onTitleChange,onArtistChange})=>{
  const cid=useRef(`yt-${ytId}-${Math.random().toString(36).slice(2)}`).current;
  const playerRef=useRef<any>(null);const tickRef=useRef<any>(null);
  const [ready,setReady]=useState(false);const [playing,setPlaying]=useState(false);const [progress,setProgress]=useState(0);const [duration,setDuration]=useState(0);const [loading,setLoading]=useState(true);
  useEffect(()=>{loadYtApi(()=>{playerRef.current=new window.YT.Player(cid,{videoId:ytId,playerVars:{autoplay:0,controls:0,disablekb:1,fs:0,iv_load_policy:3,modestbranding:1,rel:0,showinfo:0},events:{onReady:(e:any)=>{setDuration(e.target.getDuration()||0);setReady(true);setLoading(false);},onStateChange:(e:any)=>{const YT=window.YT.PlayerState;if(e.data===YT.PLAYING){setPlaying(true);setDuration(playerRef.current?.getDuration()||0);tickRef.current=setInterval(()=>{setProgress(playerRef.current?.getCurrentTime()||0);setDuration(playerRef.current?.getDuration()||0);},500);}else{setPlaying(false);if(tickRef.current){clearInterval(tickRef.current);tickRef.current=null;}if(e.data===window.YT.PlayerState.ENDED){setProgress(0);playerRef.current?.seekTo(0,true);}}},onError:()=>setLoading(false)}});});return()=>{if(tickRef.current)clearInterval(tickRef.current);try{playerRef.current?.destroy();}catch{}};
  },[ytId]);
  const togglePlay=()=>{if(!ready||!playerRef.current)return;if(playing)playerRef.current.pauseVideo();else playerRef.current.playVideo();};
  const seek=(e:React.MouseEvent<HTMLDivElement>)=>{if(!ready||!duration||!playerRef.current)return;const rect=e.currentTarget.getBoundingClientRect();const ratio=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));playerRef.current.seekTo(ratio*duration,true);setProgress(ratio*duration);};
  const skip=(delta:number)=>{if(!ready||!playerRef.current)return;const c=playerRef.current.getCurrentTime()||0;playerRef.current.seekTo(Math.max(0,Math.min(duration,c+delta)),true);};
  const fmt=(s:number)=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const pct=duration?`${(progress/duration)*100}%`:'0%';
  return (
    <div>
      <div style={{position:'absolute',width:1,height:1,overflow:'hidden',opacity:0,pointerEvents:'none',zIndex:-1}}><div id={cid}/></div>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
        <div style={{width:56,height:56,borderRadius:10,overflow:'hidden',flexShrink:0,background:ROSE_D,position:'relative',boxShadow:playing?'0 4px 20px rgba(0,0,0,0.35)':'0 2px 10px rgba(0,0,0,0.2)',transition:'box-shadow 0.3s'}}>
          <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
          {loading&&<div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'ar-spin 0.8s linear infinite'}}/></div>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <InlineEdit tag="p" editMode={editMode} value={title} onChange={onTitleChange} placeholder="Titlul cântecului..." style={{fontFamily:SERIF,fontSize:14,fontStyle:'italic',color:'white',margin:0,lineHeight:1.3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}/>
          <InlineEdit tag="p" editMode={editMode} value={artist} onChange={onArtistChange} placeholder="Artist..." style={{fontFamily:SANS,fontSize:10,color:'rgba(255,255,255,0.55)',margin:'3px 0 0'}}/>
          {playing&&<div style={{display:'flex',gap:2,alignItems:'flex-end',height:12,marginTop:5}}>{[1,1.5,0.8,1.3,1].map((h,i)=><div key={i} style={{width:3,background:'rgba(255,255,255,0.5)',borderRadius:2,height:`${h*8}px`,animation:`mp3-bar ${0.55+i*0.1}s ease-in-out infinite alternate`,animationDelay:`${i*0.08}s`}}/>)}</div>}
        </div>
      </div>
      <div onClick={seek} style={{height:4,background:'rgba(255,255,255,0.15)',borderRadius:99,marginBottom:6,cursor:ready?'pointer':'default',position:'relative',opacity:ready?1:0.4,transition:'opacity 0.3s'}}>
        <div style={{height:'100%',borderRadius:99,background:'white',width:pct,transition:'width 0.4s linear'}}/>
        <div style={{position:'absolute',top:'50%',transform:'translateY(-50%)',left:pct,marginLeft:-5,width:10,height:10,borderRadius:'50%',background:'white',boxShadow:'0 1px 4px rgba(0,0,0,0.3)',transition:'left 0.4s linear'}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
        <span style={{fontFamily:SANS,fontSize:9,color:'rgba(255,255,255,0.4)'}}>{fmt(progress)}</span>
        <span style={{fontFamily:SANS,fontSize:9,color:'rgba(255,255,255,0.4)'}}>{duration?fmt(duration):'--:--'}</span>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:22}}>
        <button type="button" onClick={()=>skip(-10)} style={{background:'none',border:'none',cursor:'pointer',padding:4,opacity:ready?0.7:0.3}}><SkipBack className="w-4 h-4" style={{color:'white'}}/></button>
        <button type="button" onClick={togglePlay} disabled={!ready} style={{width:46,height:46,borderRadius:'50%',background:ready?'white':'rgba(255,255,255,0.3)',border:'none',cursor:ready?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:ready?'0 3px 16px rgba(0,0,0,0.3)':'none',transform:playing?'scale(0.93)':'scale(1)',transition:'transform 0.12s,background 0.2s'}}>
          {playing?<Pause className="w-4 h-4" style={{color:ROSE_D}}/>:<Play className="w-4 h-4" style={{color:ROSE_D,marginLeft:2}}/>}
        </button>
        <button type="button" onClick={()=>skip(10)} style={{background:'none',border:'none',cursor:'pointer',padding:4,opacity:ready?0.7:0.3}}><SkipForward className="w-4 h-4" style={{color:'white'}}/></button>
      </div>
    </div>
  );
};

// ─── Music player ─────────────────────────────────────────────────────────────
interface MusicPlayerProps { title:string; artist:string; musicUrl:string; musicType:'youtube'|'mp3'|'none'; editMode:boolean; onTitleChange:(v:string)=>void; onArtistChange:(v:string)=>void; onUrlChange:(url:string,type:'youtube'|'mp3'|'none')=>void; }

const MusicPlayer: React.FC<MusicPlayerProps> = ({title,artist,musicUrl,musicType,editMode,onTitleChange,onArtistChange,onUrlChange}) => {
  const audioRef=useRef<HTMLAudioElement>(null);const mp3Ref=useRef<HTMLInputElement>(null);
  const [playing,setPlaying]=useState(false);const [progress,setProgress]=useState(0);const [duration,setDuration]=useState(0);const [dragging,setDragging]=useState(false);
  const [ytUrl,setYtUrl]=useState('');const [showYtInput,setShowYtInput]=useState(false);const [ytError,setYtError]=useState('');const [ytFetching,setYtFetching]=useState(false);
  const ytId=musicType==='youtube'?extractYoutubeId(musicUrl):null;
  useEffect(()=>{const a=audioRef.current;if(!a)return;const onTime=()=>setProgress(a.currentTime);const onDur=()=>setDuration(a.duration);const onEnd=()=>{setPlaying(false);setProgress(0);};a.addEventListener('timeupdate',onTime);a.addEventListener('loadedmetadata',onDur);a.addEventListener('ended',onEnd);return()=>{a.removeEventListener('timeupdate',onTime);a.removeEventListener('loadedmetadata',onDur);a.removeEventListener('ended',onEnd);};},[musicUrl,musicType]);
  const togglePlay=()=>{const a=audioRef.current;if(!a||musicType!=='mp3')return;if(playing){a.pause();setPlaying(false);}else{a.play().then(()=>setPlaying(true)).catch(()=>{});}};
  const seek=(e:React.MouseEvent<HTMLDivElement>)=>{if(musicType!=='mp3'||!audioRef.current||!duration)return;const rect=e.currentTarget.getBoundingClientRect();const ratio=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));audioRef.current.currentTime=ratio*duration;setProgress(ratio*duration);};
  const fmt=(s:number)=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const handleMp3File=(file:File)=>{if(!file.type.startsWith('audio/'))return;const r=new FileReader();r.onload=e=>{const d=e.target?.result as string;onUrlChange(d,'mp3');setPlaying(false);setProgress(0);};r.readAsDataURL(file);};
  const submitYt=async()=>{const rawUrl=ytUrl.trim();const id=extractYoutubeId(rawUrl);if(!id){setYtError('Link YouTube invalid.');return;}setYtError('');setYtFetching(true);try{const res=await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);if(res.ok){const d=await res.json();if(d.title)onTitleChange(d.title);if(d.author_name)onArtistChange(d.author_name);}}catch(_){}finally{setYtFetching(false);}onUrlChange(rawUrl,'youtube');setShowYtInput(false);setYtUrl('');};
  const removeSource=()=>{setPlaying(false);setProgress(0);onUrlChange('','none');if(audioRef.current)audioRef.current.src='';};
  return (
    <div style={{background:`linear-gradient(135deg, ${ROSE_D}, #5a2a3a)`, borderRadius:12, padding:'16px 20px'}}>
      {musicType==='mp3'&&musicUrl&&<audio ref={audioRef} src={musicUrl} preload="metadata"/>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:5}}>
          <Music className="w-3 h-3" style={{color:'rgba(255,255,255,0.5)'}}/>
          <span style={{fontFamily:SANS,fontSize:8,fontWeight:700,letterSpacing:'0.35em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)'}}>Cântecul nostru</span>
        </div>
        {editMode&&(musicType==='youtube'||musicType==='mp3')&&<button type="button" onClick={removeSource} style={{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:99,padding:'3px 10px',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}><Trash2 className="w-3 h-3" style={{color:'rgba(255,255,255,0.5)'}}/><span style={{fontFamily:SANS,fontSize:9,color:'rgba(255,255,255,0.5)'}}>Șterge</span></button>}
      </div>
      {(musicType==='none'||!musicUrl)&&editMode&&(
        showYtInput?(
          <div style={{marginBottom:10}}>
            <div style={{display:'flex',gap:6}}>
              <input value={ytUrl} onChange={e=>{setYtUrl(e.target.value);setYtError('');}} onKeyDown={e=>{if(e.key==='Enter')submitYt();if(e.key==='Escape'){setShowYtInput(false);setYtError('');setYtUrl('');}}} placeholder="https://youtu.be/..." autoFocus style={{flex:1,background:'rgba(255,255,255,0.12)',border:`1px solid ${ytError?'#ff6b6b':'rgba(255,255,255,0.2)'}`,borderRadius:6,padding:'9px 12px',fontFamily:SANS,fontSize:11,color:'white',outline:'none'}}/>
              <button type="button" onClick={submitYt} disabled={ytFetching} style={{background:ytFetching?ROSE_L:'white',border:'none',borderRadius:6,padding:'0 14px',cursor:ytFetching?'wait':'pointer',fontFamily:SANS,fontSize:11,fontWeight:700,color:ROSE_D,whiteSpace:'nowrap'}}>{ytFetching?'Se încarcă...':'✓ Adaugă'}</button>
              <button type="button" onClick={()=>{setShowYtInput(false);setYtError('');setYtUrl('');}} style={{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:6,padding:'0 10px',cursor:'pointer',color:'rgba(255,255,255,0.5)',fontSize:14}}>✕</button>
            </div>
            {ytError&&<p style={{fontFamily:SANS,fontSize:10,color:'#ff9999',margin:'6px 0 0',lineHeight:1.4}}>{ytError}</p>}
          </div>
        ):(
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <button type="button" onClick={()=>setShowYtInput(true)} style={{flex:1,background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.25)',borderRadius:6,padding:'10px 0',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect width="20" height="14" rx="3" fill="#FF0000" opacity="0.8"/><path d="M8 4.5 L14 7 L8 9.5Z" fill="white"/></svg>
              <span style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.65)',letterSpacing:'0.05em'}}>Link YouTube</span>
            </button>
            <button type="button" onClick={()=>mp3Ref.current?.click()} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files?.[0];if(f)handleMp3File(f);}} style={{flex:1,background:dragging?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.1)',border:`1px dashed ${dragging?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.25)'}`,borderRadius:6,padding:'10px 0',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <Upload className="w-5 h-5" style={{color:'rgba(255,255,255,0.65)'}}/>
              <span style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.65)',letterSpacing:'0.05em'}}>Încarcă MP3</span>
            </button>
            <input ref={mp3Ref} type="file" accept="audio/*,.mp3,.m4a,.ogg,.wav" onChange={e=>{const f=e.target.files?.[0];if(f)handleMp3File(f);}} style={{display:'none'}}/>
          </div>
        )
      )}
      {musicType==='youtube'&&ytId&&<YoutubeAudioPlayer ytId={ytId} title={title} artist={artist} editMode={editMode} onTitleChange={onTitleChange} onArtistChange={onArtistChange}/>}
      {musicType==='mp3'&&musicUrl&&(
        <div>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:12}}>
            <div style={{width:52,height:52,borderRadius:8,background:ROSE_D,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
              {playing?<div style={{display:'flex',gap:2,alignItems:'flex-end',height:20}}>{[1,1.6,0.8,1.4,1].map((h,i)=><div key={i} style={{width:3,background:'rgba(255,255,255,0.6)',borderRadius:2,height:`${h*12}px`,animation:`mp3-bar ${0.6+i*0.1}s ease-in-out infinite alternate`,animationDelay:`${i*0.1}s`}}/>)}</div>:<Music className="w-5 h-5" style={{color:'rgba(255,255,255,0.5)'}}/>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <InlineEdit tag="p" editMode={editMode} value={title} onChange={onTitleChange} placeholder="Titlul cântecului..." style={{fontFamily:SERIF,fontSize:14,fontStyle:'italic',color:'white',margin:0,lineHeight:1.3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}/>
              <InlineEdit tag="p" editMode={editMode} value={artist} onChange={onArtistChange} placeholder="Artist..." style={{fontFamily:SANS,fontSize:10,color:'rgba(255,255,255,0.55)',margin:'2px 0 0'}}/>
            </div>
          </div>
          <div onClick={seek} style={{height:4,background:'rgba(255,255,255,0.15)',borderRadius:99,marginBottom:6,cursor:'pointer',position:'relative'}}>
            <div style={{height:'100%',borderRadius:99,background:'white',width:duration?`${(progress/duration)*100}%`:'0%',transition:'width 0.25s linear'}}/>
            <div style={{position:'absolute',top:'50%',transform:'translateY(-50%)',left:duration?`${(progress/duration)*100}%`:'0%',width:10,height:10,borderRadius:'50%',background:'white',boxShadow:'0 1px 4px rgba(0,0,0,0.3)',marginLeft:-5,transition:'left 0.25s linear'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontFamily:SANS,fontSize:9,color:'rgba(255,255,255,0.4)'}}>{fmt(progress)}</span>
            <span style={{fontFamily:SANS,fontSize:9,color:'rgba(255,255,255,0.4)'}}>{duration?fmt(duration):'--:--'}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20}}>
            <button type="button" onClick={()=>{if(audioRef.current)audioRef.current.currentTime=Math.max(0,audioRef.current.currentTime-10);}} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><SkipBack className="w-4 h-4" style={{color:'rgba(255,255,255,0.55)'}}/></button>
            <button type="button" onClick={togglePlay} style={{width:44,height:44,borderRadius:'50%',background:'white',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 3px 14px rgba(0,0,0,0.25)',transform:playing?'scale(0.94)':'scale(1)',transition:'transform 0.15s'}}>
              {playing?<Pause className="w-4 h-4" style={{color:ROSE_D}}/>:<Play className="w-4 h-4" style={{color:ROSE_D,marginLeft:2}}/>}
            </button>
            <button type="button" onClick={()=>{if(audioRef.current)audioRef.current.currentTime=Math.min(duration,audioRef.current.currentTime+10);}} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><SkipForward className="w-4 h-4" style={{color:'rgba(255,255,255,0.55)'}}/></button>
          </div>
        </div>
      )}
      {editMode&&(musicType==='youtube'||musicType==='mp3')&&(
        <div style={{marginTop:12,display:'flex',gap:6,justifyContent:'center'}}>
          <button type="button" onClick={()=>{setShowYtInput(true);removeSource();}} style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.18)',borderRadius:99,padding:'5px 14px',cursor:'pointer',fontFamily:SANS,fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.55)',display:'flex',alignItems:'center',gap:5}}>
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><rect width="12" height="9" rx="2" fill="#FF0000" opacity="0.7"/><path d="M4.5 2.5 L8.5 4.5 L4.5 6.5Z" fill="white"/></svg>
            Schimbă YouTube
          </button>
          <button type="button" onClick={()=>{removeSource();mp3Ref.current?.click();}} style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.18)',borderRadius:99,padding:'5px 14px',cursor:'pointer',fontFamily:SANS,fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.55)',display:'flex',alignItems:'center',gap:5}}><Upload className="w-3 h-3"/> MP3</button>
          <input ref={mp3Ref} type="file" accept="audio/*,.mp3,.m4a,.ogg,.wav" onChange={e=>{const f=e.target.files?.[0];if(f)handleMp3File(f);}} style={{display:'none'}}/>
        </div>
      )}
      <style>{`@keyframes mp3-bar{from{transform:scaleY(0.4);}to{transform:scaleY(1.2);}}`}</style>
    </div>
  );
};

// ─── Small block sub-components ───────────────────────────────────────────────
const Card: React.FC<{children:React.ReactNode; align?:string; roseCorner?:boolean}> = ({children,align='center',roseCorner=false}) => (
  <div style={{background:IVORY, border:`1px solid ${ROSE_L}`, borderRadius:12, padding:'20px 24px', textAlign:align as any, position:'relative', overflow:'hidden'}}>
    {roseCorner && <div style={{position:'absolute',bottom:-12,right:-12,width:70,height:70,pointerEvents:'none',opacity:0.15,transform:'rotate(180deg)'}}><img src={rosesCornerImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>}
    {children}
  </div>
);

const DressCodeBlock:React.FC<{block:InvitationBlock;editMode:boolean;onUpdate:(p:Partial<InvitationBlock>)=>void;textColorOverride?:string}> = ({block,editMode,onUpdate,textColorOverride}) => (
  <Card align={(block.blockAlign as any)||'center'} roseCorner>
    <div style={{display:'flex',justifyContent:'center',marginBottom:12}}><Shirt className="w-8 h-8" style={{color:ROSE,opacity:0.8}}/></div>
    <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle||'Cod vestimentar'} onChange={v=>onUpdate({sectionTitle:v})} placeholder="Titlu..." style={{fontFamily:SCRIPT,fontSize:24,color:textColorOverride||ROSE_D,margin:'0 0 4px',display:'block'}}/>
    <InlineEdit tag="p" editMode={editMode} value={block.label||'Elegant'} onChange={v=>onUpdate({label:v})} placeholder="Ex: Formal, Elegant..." style={{fontFamily:SANS,fontSize:11,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:MUTED,margin:'0 0 14px',display:'block'}}/>
    <div style={{textAlign:'left'}}><InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>onUpdate({content:v})} placeholder="Detalii cod vestimentar..." multiline style={{fontFamily:SANS,fontSize:12,color:textColorOverride||TEXT,lineHeight:1.7,opacity:0.75}}/></div>
  </Card>
);

const GiftBlock:React.FC<{block:InvitationBlock;editMode:boolean;onUpdate:(p:Partial<InvitationBlock>)=>void;textColorOverride?:string}> = ({block,editMode,onUpdate,textColorOverride}) => (
  <div style={{background:`linear-gradient(135deg, ${ROSE_D}, #5a2a3a)`,borderRadius:12,padding:'20px 24px',textAlign:(block.blockAlign as any)||'center'}}>
    <Gift className="w-7 h-7" style={{color:'rgba(255,255,255,0.6)',display:'block',margin:'0 auto 10px'}}/>
    <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle||'Sugestie de cadou'} onChange={v=>onUpdate({sectionTitle:v})} placeholder="Titlu..." style={{fontFamily:SCRIPT,fontSize:22,color:textColorOverride||'white',margin:'0 0 8px',display:'block'}}/>
    <InlineEdit tag="p" editMode={editMode} value={block.content||'Cel mai frumos cadou este prezența voastră.'} onChange={v=>onUpdate({content:v})} placeholder="Mesaj introductiv..." multiline style={{fontFamily:SANS,fontSize:11,color:'rgba(255,255,255,0.65)',lineHeight:1.7,margin:'0 0 16px',display:'block'}}/>
    <div style={{background:'rgba(0,0,0,0.12)',borderRadius:6,padding:'12px 16px',textAlign:'left'}}>
      <p style={{fontFamily:SANS,fontSize:8,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:'rgba(255,255,255,0.45)',margin:'0 0 6px'}}>Transfer bancar</p>
      <InlineEdit tag="p" editMode={editMode} value={block.iban||''} onChange={v=>onUpdate({iban:v})} placeholder="IBAN: RO49 AAAA 0000..." style={{fontFamily:SANS,fontSize:12,fontWeight:600,color:'white',margin:0,letterSpacing:'0.05em'}}/>
      <InlineEdit tag="p" editMode={editMode} value={block.ibanName||''} onChange={v=>onUpdate({ibanName:v})} placeholder="Prenume Nume" style={{fontFamily:SANS,fontSize:11,color:'rgba(255,255,255,0.55)',margin:'3px 0 0'}}/>
    </div>
  </div>
);

const NoKidsBlock:React.FC<{block:InvitationBlock;editMode:boolean;onUpdate:(p:Partial<InvitationBlock>)=>void;textColorOverride?:string}> = ({block,editMode,onUpdate,textColorOverride}) => (
  <Card align={(block.blockAlign as any)||'center'}>
    <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:10}}><Baby className="w-6 h-6" style={{color:ROSE,opacity:0.5}}/><div style={{width:2,height:24,background:ROSE,opacity:0.3,transform:'rotate(15deg)',alignSelf:'center'}}/></div>
    <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle||'Eveniment fără copii'} onChange={v=>onUpdate({sectionTitle:v})} placeholder="Titlu..." style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.35em',textTransform:'uppercase',color:textColorOverride||ROSE,margin:'0 0 8px',display:'block'}}/>
    <InlineEdit tag="p" editMode={editMode} value={block.content||'Nunta noastră va fi un eveniment pentru adulți.'} onChange={v=>onUpdate({content:v})} placeholder="Mesaj..." multiline style={{fontFamily:SANS,fontSize:11,color:textColorOverride||MUTED,lineHeight:1.7}}/>
  </Card>
);

const QuoteBlock:React.FC<{block:InvitationBlock;editMode:boolean;onUpdate:(p:Partial<InvitationBlock>)=>void;textColorOverride?:string}> = ({block,editMode,onUpdate,textColorOverride}) => (
  <div style={{textAlign:(block.blockAlign as any)||'center',padding:'8px 16px'}}>
    <span style={{fontFamily:SERIF,fontSize:28,color:ROSE_L,lineHeight:0.5,display:'block',marginBottom:-8}}>"</span>
    <InlineEdit tag="p" editMode={editMode} value={block.content||'Iubirea este răbdătoare, este plină de bunătate...'} onChange={v=>onUpdate({content:v})} placeholder="Citat sau text personalizat..." multiline style={{fontFamily:SERIF,fontSize:14,fontStyle:'italic',color:textColorOverride||TEXT,lineHeight:1.8,opacity:0.75,margin:'0 0 6px'}}/>
    {block.label&&<InlineEdit tag="p" editMode={editMode} value={block.label||''} onChange={v=>onUpdate({label:v})} placeholder="Sursă..." style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:MUTED}}/>}
  </div>
);

const ThankyouBlock:React.FC<{block:InvitationBlock;editMode:boolean;onUpdate:(p:Partial<InvitationBlock>)=>void;initials:string;textColorOverride?:string}> = ({block,editMode,onUpdate,initials,textColorOverride}) => (
  <div style={{textAlign:(block.blockAlign as any)||'center',padding:'12px 0'}}>
    <InlineEdit tag="p" editMode={editMode} value={block.label||'VĂ AȘTEPTĂM CU DRAG'} onChange={v=>onUpdate({label:v})} placeholder="Text subtitlu..." style={{fontFamily:SANS,fontSize:8,fontWeight:700,letterSpacing:'0.4em',textTransform:'uppercase',color:MUTED,margin:'0 0 10px'}}/>
    <InlineEdit tag="p" editMode={editMode} value={block.content||'Mulțumim din suflet!'} onChange={v=>onUpdate({content:v})} placeholder="Text mulțumire..." style={{fontFamily:SCRIPT,fontSize:32,color:textColorOverride||ROSE_D,lineHeight:1.2}}/>
    {initials&&<div style={{display:'inline-flex',alignItems:'center',gap:8,marginTop:16,border:`1px solid ${ROSE_L}`,padding:'8px 20px',borderRadius:2}}><span style={{fontFamily:SERIF,fontSize:18,fontWeight:300,color:ROSE}}>{initials}</span></div>}
  </div>
);

// ─── Intro animation ──────────────────────────────────────────────────────────
const ArchRoseIntro: React.FC<{name1:string; name2:string; date:string; onDone:()=>void}> = ({name1,name2,date,onDone}) => {
  const [phase, setPhase] = useState(0);
  useEffect(()=>{
    const ts=[
      setTimeout(()=>setPhase(1), 300),
      setTimeout(()=>setPhase(2), 1200),
      setTimeout(()=>setPhase(3), 2000),
      setTimeout(()=>setPhase(4), 3200),
      setTimeout(()=>onDone(), 4200),
    ];
    return ()=>ts.forEach(clearTimeout);
  },[]);
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,overflow:'hidden',cursor:'pointer'}} onClick={onDone}>
      {/* Arch pink background */}
      <div style={{position:'absolute',inset:0,background:`linear-gradient(to bottom, #fce4ec, #f8d7e3, #fce4ec)`,transition:'opacity 1s',opacity:phase>=4?0:1}}/>
      {/* Pink arch image */}
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',opacity:phase>=1?0.85:0,transition:'opacity 1.2s cubic-bezier(0.4,0,0.2,1)'}}>
        <img src={archPinkImg} alt="" style={{width:'100%',height:'100%',objectFit:'contain',objectPosition:'center bottom',filter:'brightness(1.05)'}}/>
      </div>
      {/* Names */}
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',paddingBottom:'15%',gap:0}}>
        <p style={{fontFamily:SCRIPT,fontSize:64,color:'white',margin:0,textShadow:'0 4px 30px rgba(90,20,40,0.4)',opacity:phase>=2?1:0,transform:phase>=2?'translateY(0)':'translateY(20px)',transition:'all 1.0s cubic-bezier(0.4,0,0.2,1)'}}>{name1}</p>
        <p style={{fontFamily:SERIF,fontSize:28,fontStyle:'italic',color:'rgba(255,255,255,0.7)',margin:'0',lineHeight:1,opacity:phase>=2?1:0,transition:'all 0.8s ease-out 0.3s'}}>&</p>
        <p style={{fontFamily:SCRIPT,fontSize:64,color:'white',margin:0,textShadow:'0 4px 30px rgba(90,20,40,0.4)',opacity:phase>=2?1:0,transform:phase>=2?'translateY(0)':'translateY(20px)',transition:'all 1.0s cubic-bezier(0.4,0,0.2,1) 0.2s'}}>{name2}</p>
        <div style={{width:60,height:0.5,background:'rgba(255,255,255,0.4)',margin:'18px 0 14px',opacity:phase>=3?1:0,transition:'opacity 0.6s ease-out'}}/>
        <p style={{fontFamily:SANS,fontSize:12,fontWeight:600,letterSpacing:'0.35em',textTransform:'uppercase',color:'rgba(255,255,255,0.65)',margin:0,opacity:phase>=3?1:0,transition:'opacity 0.6s ease-out 0.2s'}}>{date}</p>
        <p style={{fontFamily:SANS,fontSize:10,fontWeight:500,color:'rgba(255,255,255,0.4)',margin:'24px 0 0',letterSpacing:'0.15em',opacity:phase>=3?1:0,transition:'opacity 0.5s ease-out 0.5s'}}>atingeți pentru a continua →</p>
      </div>
    </div>
  );
};

// ─── EventType badge ──────────────────────────────────────────────────────────
const EventTypeBadge: React.FC<{et: string}> = ({et}) => {
  const labels: Record<string,string> = {wedding:'Nuntă',baptism:'Botez',kids:'Botez',birthday:'Aniversare',engagement:'Logodnă'};
  return <span style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:MUTED,background:ROSE_XL,padding:'3px 8px',borderRadius:99}}>{labels[et]||'Nuntă'}</span>;
};

// ─── Main template ─────────────────────────────────────────────────────────────
export type ArchRoseProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string,any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock|null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const ArchRoseTemplate: React.FC<ArchRoseProps> = ({
  data, onOpenRSVP, editMode=false, introPreview = false, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId,
}) => {
  const {profile, guest} = data;
  const [showIntro, setShowIntro]   = useState(!editMode || introPreview);
  const [contentVis, setContentVis] = useState(editMode && !introPreview);

  useEffect(()=>{ 
    if(editMode){
      if (introPreview) { setShowIntro(true); setContentVis(false); }
      else { setShowIntro(false); setContentVis(true); }
    } else { setShowIntro(true); setContentVis(false); }
  },[editMode, introPreview]);

  const safeJSON = (s: string|undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const [blocks, setBlocks]           = useState<InvitationBlock[]>(()=>safeJSON(profile.customSections,[]));
  const [godparents, setGodparents]   = useState<any[]>(()=>safeJSON(profile.godparents,[]));
  const [parentsData, setParentsData] = useState<any>(()=>safeJSON(profile.parents,{}));

  useEffect(()=>{ setBlocks(prev=>{ const incoming:InvitationBlock[]=safeJSON(profile.customSections,[]); return incoming.map(b=>{ if(b.type==='photo'&&!b.imageData){const local=prev.find(pb=>pb.id===b.id);if(local?.imageData)return{...b,imageData:local.imageData};} return b; }); }); },[profile.customSections]);
  useEffect(()=>{ setGodparents(safeJSON(profile.godparents,[])); },[profile.godparents]);
  useEffect(()=>{ setParentsData(safeJSON(profile.parents,{})); },[profile.parents]);

  const _pq=useRef<Record<string,any>>({});
  const _pt=useRef<ReturnType<typeof setTimeout>|null>(null);
  const _bt=useRef<ReturnType<typeof setTimeout>|null>(null);

  const upProfile = useCallback((field:string, value:any)=>{ _pq.current={..._pq.current,[field]:value}; if(_pt.current)clearTimeout(_pt.current); _pt.current=setTimeout(()=>{onProfileUpdate?.(_pq.current);_pq.current={};},500); },[onProfileUpdate]);
  const debBlocks = useCallback((nb:InvitationBlock[])=>{ if(_bt.current)clearTimeout(_bt.current); _bt.current=setTimeout(()=>onBlocksUpdate?.(nb),600); },[onBlocksUpdate]);
  const debBlocksPhoto = useCallback((nb:InvitationBlock[])=>{ if(_bt.current)clearTimeout(_bt.current); _bt.current=setTimeout(()=>onBlocksUpdate?.(nb),100); },[onBlocksUpdate]);

  const updBlock = useCallback((idx:number, patch:Partial<InvitationBlock>)=>{ setBlocks(prev=>{ const nb=prev.map((b,i)=>i===idx?{...b,...patch}:b); if('imageData' in patch)debBlocksPhoto(nb);else debBlocks(nb); return nb; }); },[debBlocks,debBlocksPhoto]);
  const movBlock = useCallback((idx:number, dir:-1|1)=>{ setBlocks(prev=>{ const nb=[...prev];const to=idx+dir;if(to<0||to>=nb.length)return prev;[nb[idx],nb[to]]=[nb[to],nb[idx]];onBlocksUpdate?.(nb);return nb; }); },[onBlocksUpdate]);
  const delBlock = useCallback((idx:number)=>{ setBlocks(prev=>{ const block=prev[idx];if(block?.type==='photo'&&block.imageData)deleteUploadedFile(block.imageData);const nb=prev.filter((_,i)=>i!==idx);onBlocksUpdate?.(nb);return nb; }); },[onBlocksUpdate]);
  const addBlock = useCallback((type:string, def:any)=>{ setBlocks(prev=>{ const nb=[...prev,{id:Date.now().toString(),type:type as InvitationBlockType,show:true,...def}];onBlocksUpdate?.(nb);return nb; }); },[onBlocksUpdate]);

  const updGodparent = (i:number, f:'godfather'|'godmother', v:string)=>{ setGodparents(prev=>{const ng=prev.map((g,j)=>j===i?{...g,[f]:v}:g);upProfile('godparents',JSON.stringify(ng));return ng;}); };
  const addGodparent = ()=>setGodparents(prev=>{const ng=[...prev,{godfather:'',godmother:''}];upProfile('godparents',JSON.stringify(ng));return ng;});
  const delGodparent = (i:number)=>setGodparents(prev=>{const ng=prev.filter((_,j)=>j!==i);upProfile('godparents',JSON.stringify(ng));return ng;});
  const updParent = (field:string, val:string)=>setParentsData((prev:any)=>{const np={...prev,[field]:val};upProfile('parents',JSON.stringify(np));return np;});

  const name1       = profile.partner1Name||'Elena';
  const name2       = profile.partner2Name||'Alexandru';
  const isBaptism   = profile.eventType==='baptism'||profile.eventType==='kids';
  const showRsvp    = profile.showRsvpButton!==false;
  const rsvpText    = profile.rsvpButtonText?.trim()||'Confirmă Prezența';
  const displayBlocks = editMode ? blocks : blocks.filter(b=>b.show!==false);
  const et = profile.eventType||'wedding';

  const initials = isBaptism ? (name1[0]||'').toUpperCase() : `${(name1[0]||'').toUpperCase()} & ${(name2[0]||'').toUpperCase()}`;

  const d = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const dateStrShort = d ? `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}` : 'DD.MM.YYYY';

  const BLOCK_TYPES = [
    {type:'photo',      label:'📷 Fotografie',  def:{imageData:undefined,altText:'Fotografie',photoClip:'rect',photoMasks:[]}},
    {type:'location',   label:'Locație',         def:{label:'',time:'',locationName:'',locationAddress:''}},
    {type:'godparents', label:'Nași',            def:{sectionTitle:'Nașii Noștri',content:''}},
    {type:'parents',    label:'Părinți',         def:{sectionTitle:'Părinții Noștri',content:''}},
    {type:'calendar',   label:'📅 Calendar',    def:{}},
    {type:'countdown',  label:'⏱ Countdown',   def:{}},
    {type:'music',      label:'🎵 Muzică',      def:{musicTitle:'',musicArtist:''}},
    {type:'dresscode',  label:'Dress Code',      def:{sectionTitle:'Cod vestimentar',label:'Elegant',content:''}},
    {type:'gift',       label:'🎁 Cadouri',     def:{sectionTitle:'Sugestie cadou',content:'',iban:'',ibanName:''}},
    {type:'nokids',     label:'Fără copii',      def:{sectionTitle:'Eveniment fără copii',content:''}},
    {type:'quote',      label:'Citat',           def:{content:''}},
    {type:'thankyou',   label:'Mulțumire',       def:{content:'Mulțumim din suflet!',label:''}},
    {type:'text',       label:'Text',            def:{content:''}},
    {type:'title',      label:'Titlu',           def:{content:''}},
    {type:'divider',    label:'Linie',           def:{}},
  ];

  return (
    <>
      <style>{`
        @keyframes ar-spin { to { transform: rotate(360deg); } }
        @keyframes ar-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes ar-name-reveal { from{opacity:0;filter:blur(8px);transform:translateY(10px)} to{opacity:1;filter:blur(0);transform:translateY(0)} }
        @keyframes ar-petals { 0%,100%{opacity:0.12;transform:scale(1) rotate(0deg)} 50%{opacity:0.2;transform:scale(1.02) rotate(1deg)} }
        @keyframes mp3-bar{from{transform:scaleY(0.4);}to{transform:scaleY(1.2);}}
      `}</style>

      {showIntro && (
        <ArchRoseIntro name1={name1} name2={name2} date={dateStrShort}
          onDone={()=>{setShowIntro(false);setTimeout(()=>setContentVis(true),60);}}/>
      )}

      <div style={{
        minHeight:'100vh',
        background:`linear-gradient(180deg, ${IVORY} 0%, #fce8e4 30%, ${CREAM} 60%, ${IVORY} 100%)`,
        fontFamily:SANS, position:'relative', overflow:'hidden',
        opacity: contentVis?1:0, transform: contentVis?'translateY(0)':'translateY(10px)',
        transition:'opacity 0.7s cubic-bezier(0.4,0,0.2,1),transform 0.7s',
        paddingTop: editMode ? 56 : 0,
      }}>

        {/* ── Fixed rose corner decorations ── */}
        <div style={{position:'fixed',top:0,left:0,zIndex:0,pointerEvents:'none',width:140,height:140,opacity:0.22}}>
          <img src={rosesSideImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top left'}}/>
        </div>
        <div style={{position:'fixed',top:0,right:0,zIndex:0,pointerEvents:'none',width:140,height:140,opacity:0.22,transform:'scaleX(-1)'}}>
          <img src={rosesSideImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top left'}}/>
        </div>
        <div style={{position:'fixed',bottom:0,left:0,zIndex:0,pointerEvents:'none',width:120,height:120,opacity:0.18,transform:'scaleY(-1)'}}>
          <img src={rosesCornerImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        </div>
        <div style={{position:'fixed',bottom:0,right:0,zIndex:0,pointerEvents:'none',width:120,height:120,opacity:0.18,transform:'scale(-1,-1)'}}>
          <img src={rosesCornerImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        </div>

        {editMode && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-1.5 shadow-lg text-[10px] font-bold pointer-events-none select-none"
            style={{background:IVORY,border:`1px solid ${ROSE_L}`,color:ROSE_D,backdropFilter:'blur(8px)'}}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:ROSE}}/>
            <span className="uppercase tracking-widest">Editare Directă</span>
            <span className="font-normal" style={{color:MUTED}}>— click pe orice text</span>
          </div>
        )}

        <div style={{maxWidth:460, margin:'0 auto', position:'relative', zIndex:2, padding:'0 0 56px'}}>

          {/* ── HERO — Arch with white flowers ── */}
          <div style={{position:'relative', width:'100%'}}>
            {/* The arch image fills the hero */}
            <div style={{position:'relative', width:'100%', paddingTop:'130%', overflow:'hidden'}}>
              <img src={archWhiteImg} alt="Wedding arch" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}}/>

              {/* Overlay for text readability inside arch opening */}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, transparent 25%, rgba(253,247,245,0.05) 50%, rgba(253,247,245,0.15) 75%)'}}/>

              {/* Names positioned inside the arch opening */}
              <div style={{position:'absolute',top:'28%',left:'50%',transform:'translateX(-50%)',width:'62%',textAlign:'center',zIndex:2}}>
                <BlockStyleCtx.Provider value={{
                  fontFamily: profile.heroFontFamily, fontSize: profile.heroNameSize,
                  letterSpacing: (profile as any).heroLetterSpacing, lineHeight: (profile as any).heroLineHeight,
                  textColor: profile.heroTextColor||ROSE_D, textAlign: (profile.heroAlign as any)||'center',
                }}>
                  <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name||''} onChange={v=>upProfile('partner1Name',v)} placeholder="Elena"
                    style={{fontFamily:profile.heroFontFamily||SCRIPT,fontSize:profile.heroNameSize||56,lineHeight:1.05,color:profile.heroTextColor||ROSE_D,display:'block',margin:'0 0 0',textShadow:'0 2px 20px rgba(255,255,255,0.8)',animation:(!editMode&&contentVis)?'ar-name-reveal 1.2s cubic-bezier(0.4,0,0.2,1) 0.15s both':'none'}}/>
                  {!isBaptism&&<>
                    <span style={{fontFamily:SERIF,fontSize:26,fontStyle:'italic',color:MUTED,display:'block',lineHeight:1,opacity:0.7,animation:contentVis?'ar-name-reveal 0.8s ease-out 0.4s both':'none'}}>&</span>
                    <InlineEdit tag="h1" editMode={editMode} value={profile.partner2Name||''} onChange={v=>upProfile('partner2Name',v)} placeholder="Alexandru"
                      style={{fontFamily:profile.heroFontFamily||SCRIPT,fontSize:profile.heroNameSize||56,lineHeight:1.05,color:profile.heroTextColor||ROSE_D,display:'block',textShadow:'0 2px 20px rgba(255,255,255,0.8)',animation:(!editMode&&contentVis)?'ar-name-reveal 1.2s cubic-bezier(0.4,0,0.2,1) 0.35s both':'none'}}/>
                  </>}
                </BlockStyleCtx.Provider>

                <div style={{width:40,height:0.5,background:ROSE_L,margin:'14px auto 10px'}}/>

                {editMode ? (
                  <input type="date" value={profile.weddingDate?new Date(profile.weddingDate).toISOString().split('T')[0]:''} onChange={e=>upProfile('weddingDate',e.target.value)}
                    style={{fontFamily:SANS,fontSize:11,fontWeight:700,letterSpacing:'0.25em',color:MUTED,background:'transparent',border:'none',borderBottom:`1px solid ${ROSE_L}`,outline:'none',textAlign:'center',cursor:'pointer',display:'block',margin:'0 auto',width:'auto'}}/>
                ) : (
                  <p style={{fontFamily:SANS,fontSize:11,fontWeight:700,letterSpacing:'0.25em',color:MUTED,margin:0}}>{dateStrShort}</p>
                )}
              </div>

              {/* Edit hint in edit mode */}
              {editMode && (
                <div style={{position:'absolute',bottom:8,right:8,zIndex:10,background:'rgba(255,255,255,0.8)',color:ROSE_D,borderRadius:99,padding:'2px 8px',fontSize:9,fontWeight:700,fontFamily:'system-ui',display:'flex',alignItems:'center',gap:4,backdropFilter:'blur(4px)'}}>
                  Stil hero
                </div>
              )}
            </div>
          </div>

          {/* ── Monogram & welcome ── */}
          <Reveal delay={200}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,margin:'28px 20px 24px',textAlign:'center'}}>
              {/* Pink arch mini accent */}
              <div style={{width:48,height:24,position:'relative',overflow:'visible',pointerEvents:'none',opacity:0.45,marginBottom:4}}>
                <img src={archPinkImg} alt="" style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',height:56,width:'auto',objectFit:'contain'}}/>
              </div>
              <div style={{width:44,height:44,borderRadius:'50%',border:`1.5px solid ${ROSE_L}`,display:'flex',alignItems:'center',justifyContent:'center',background:IVORY}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 4 L11 18 M7 8 Q11 4 15 8" stroke={ROSE} strokeWidth="1.2" strokeLinecap="round"/>
                  <ellipse cx="11" cy="13" rx="3.5" ry="4" stroke={ROSE} strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <p style={{fontFamily:SERIF,fontSize:22,fontWeight:300,color:ROSE_D,margin:0}}>{initials}</p>
              {profile.showWelcomeText && (
                <InlineEdit tag="p" editMode={editMode} value={profile.welcomeText?.trim()||'Vă invităm cu drag să fiți alături de noi în această zi specială.'} onChange={v=>upProfile('welcomeText',v)} placeholder="Text introductiv..." multiline
                  style={{fontFamily:SERIF,fontSize:13,fontStyle:'italic',color:MUTED,lineHeight:1.8,textAlign:'center',maxWidth:320,padding:'0 20px'}}/>
              )}
            </div>
          </Reveal>

          {/* Guest badge */}
          {guest?.name && (
            <Reveal delay={300}>
              <div style={{display:'flex',justifyContent:'center',margin:'0 20px 16px'}}>
                <div style={{border:`1px solid ${ROSE_L}`,borderRadius:4,padding:'12px 24px',textAlign:'center',background:IVORY}}>
                  <p style={{fontFamily:SANS,fontSize:8,fontWeight:700,letterSpacing:'0.42em',textTransform:'uppercase',color:MUTED,margin:'0 0 5px'}}>Dragă</p>
                  <p style={{fontFamily:SERIF,fontSize:20,fontWeight:300,fontStyle:'italic',color:TEXT,margin:0}}>{guest.name}</p>
                </div>
              </div>
            </Reveal>
          )}

          {/* ── BLOCKS ── */}
          <div style={{display:'flex',flexDirection:'column',gap:10,padding:'0 20px'}}>
            {displayBlocks.map((block, displayIdx) => {
              const isVisible = block.show!==false;
              const realIdx   = blocks.indexOf(block);
              const isSelected = editMode && block.type==='photo' && selectedBlockId===block.id;
              return (
                <div key={block.id}
                  className={cn("relative group/block", !isVisible&&editMode&&"opacity-30")}
                  onClick={editMode?(e)=>{e.stopPropagation();onBlockSelect?.(block,realIdx);}:undefined}
                  style={{
                    cursor: editMode?'pointer':'default',
                    outline: isSelected?`2px solid ${ROSE}`:(editMode?'1px dashed transparent':'none'),
                    outlineOffset:'3px',
                    borderRadius: block.blockRadius?`${block.blockRadius}px`:undefined,
                    marginTop:    block.blockMarginTop!=null?`${block.blockMarginTop}px`:undefined,
                    marginBottom: block.blockMarginBottom!=null?`${block.blockMarginBottom}px`:undefined,
                    paddingTop:    block.blockPaddingTop!=null?`${block.blockPaddingTop}px`:undefined,
                    paddingBottom: block.blockPaddingBottom!=null?`${block.blockPaddingBottom}px`:undefined,
                    paddingLeft:   block.blockPaddingH!=null?`${block.blockPaddingH}px`:undefined,
                    paddingRight:  block.blockPaddingH!=null?`${block.blockPaddingH}px`:undefined,
                    background:   block.bgColor&&block.bgColor!=='transparent'?block.bgColor:undefined,
                    opacity:      block.opacity!=null&&block.opacity!==100?block.opacity/100:undefined,
                    textAlign:    block.blockAlign as any||undefined,
                    transition:   'outline-color 0.1s',
                  }}>
                  <BlockStyleProvider value={{blockId:block.id,textStyles:block.textStyles,onTextSelect:(textKey,textLabel)=>onBlockSelect?.(block,realIdx,textKey,textLabel),fontFamily:block.blockFontFamily,fontSize:block.blockFontSize,fontWeight:block.blockFontWeight,fontStyle:block.blockFontStyle,letterSpacing:block.blockLetterSpacing,lineHeight:block.blockLineHeight,textColor:block.textColor&&block.textColor!=='transparent'?block.textColor:undefined,textAlign:block.blockAlign} as BlockStyle}>
                    {editMode && <BlockToolbar onUp={()=>movBlock(realIdx,-1)} onDown={()=>movBlock(realIdx,1)} onToggle={()=>updBlock(realIdx,{show:!isVisible})} onDelete={()=>delBlock(realIdx)} visible={isVisible} isFirst={realIdx===0} isLast={realIdx===blocks.length-1}/>}
                    {editMode&&block.type==='photo'&&(
                      <div className="absolute bottom-1 right-1 opacity-0 group-hover/block:opacity-100 transition-opacity duration-100 pointer-events-none z-10">
                        <div style={{background:isSelected?ROSE:'rgba(0,0,0,0.55)',color:'white',borderRadius:99,padding:'2px 8px',fontSize:9,fontWeight:700,fontFamily:'system-ui',display:'flex',alignItems:'center',gap:4,backdropFilter:'blur(4px)',letterSpacing:'0.04em'}}>
                          {isSelected?'Activ →':'Stil'}
                        </div>
                      </div>
                    )}

                    {block.type==='photo' && <Reveal><PhotoBlock imageData={block.imageData} altText={block.altText} editMode={editMode} onUpload={data=>updBlock(realIdx,{imageData:data})} onRemove={()=>updBlock(realIdx,{imageData:undefined})} onRatioChange={r=>updBlock(realIdx,{aspectRatio:r})} onClipChange={cl=>updBlock(realIdx,{photoClip:cl})} onMasksChange={ms=>updBlock(realIdx,{photoMasks:ms} as any)} aspectRatio={block.aspectRatio||'free'} photoClip={(block.photoClip as any)||'rect'} photoMasks={(block.photoMasks as any)||[]} placeholderInitial1={name1[0]} placeholderInitial2={name2[0]} placeholderVariant={realIdx%4}/></Reveal>}
                    {block.type==='location' && <LocCard block={block} editMode={editMode} onUpdate={p=>updBlock(realIdx,p)} textColorOverride={block.textColor}/>}
                    {block.type==='calendar' && <Reveal><CalendarMonth date={profile.weddingDate}/></Reveal>}
                    {block.type==='countdown' && <Reveal><CountdownSection date={profile.weddingDate}/></Reveal>}
                    {block.type==='music' && <Reveal><MusicPlayer title={block.musicTitle||''} artist={block.musicArtist||''} musicUrl={block.musicUrl||''} musicType={block.musicType||'none'} editMode={editMode} onTitleChange={v=>updBlock(realIdx,{musicTitle:v})} onArtistChange={v=>updBlock(realIdx,{musicArtist:v})} onUrlChange={(url,type)=>updBlock(realIdx,{musicUrl:url,musicType:type})}/></Reveal>}
                    {block.type==='dresscode' && <Reveal><DressCodeBlock block={block} editMode={editMode} onUpdate={p=>updBlock(realIdx,p)} textColorOverride={block.textColor}/></Reveal>}
                    {block.type==='gift' && <Reveal><GiftBlock block={block} editMode={editMode} onUpdate={p=>updBlock(realIdx,p)} textColorOverride={block.textColor}/></Reveal>}
                    {block.type==='nokids' && <Reveal><NoKidsBlock block={block} editMode={editMode} onUpdate={p=>updBlock(realIdx,p)} textColorOverride={block.textColor}/></Reveal>}
                    {block.type==='quote' && <Reveal><QuoteBlock block={block} editMode={editMode} onUpdate={p=>updBlock(realIdx,p)} textColorOverride={block.textColor}/></Reveal>}
                    {block.type==='thankyou' && <Reveal><ThankyouBlock block={block} editMode={editMode} onUpdate={p=>updBlock(realIdx,p)} initials={initials} textColorOverride={block.textColor}/></Reveal>}

                    {block.type==='godparents' && (
                      <Reveal>
                        <Card align={(block.blockAlign as any)||'center'} roseCorner>
                          <Heart className="w-5 h-5" style={{color:ROSE,opacity:0.6,display:'block',margin:'0 auto 8px'}}/>
                          <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle||'Nașii Noștri'} onChange={v=>updBlock(realIdx,{sectionTitle:v})} placeholder="Titlu..." style={{fontFamily:SCRIPT,fontSize:22,color:ROSE_D,margin:'0 0 6px',display:'block'}}/>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(realIdx,{content:v})} placeholder="Text introductiv..." multiline style={{fontFamily:SERIF,fontSize:12,fontStyle:'italic',color:MUTED,margin:'0 0 12px',lineHeight:1.7,display:'block'}}/>
                          <div style={{display:'flex',flexDirection:'column',gap:6}}>
                            {godparents.map((g:any,i:number)=>(
                              <div key={i} className={cn("flex items-center justify-center gap-2",editMode&&"group/gp")}>
                                <InlineEdit tag="span" editMode={editMode} value={g.godfather||''} onChange={v=>updGodparent(i,'godfather',v)} placeholder="Naș" style={{fontFamily:SERIF,fontSize:17,fontWeight:300,color:block.textColor||TEXT}}/>
                                <span style={{color:ROSE,fontFamily:SERIF,fontStyle:'italic',margin:'0 6px'}}>&</span>
                                <InlineEdit tag="span" editMode={editMode} value={g.godmother||''} onChange={v=>updGodparent(i,'godmother',v)} placeholder="Nașă" style={{fontFamily:SERIF,fontSize:17,fontWeight:300,color:block.textColor||TEXT}}/>
                                {editMode&&<button type="button" onClick={()=>delGodparent(i)} className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400"/></button>}
                              </div>
                            ))}
                            {editMode&&<button type="button" onClick={addGodparent} className="text-[10px] font-bold border border-dashed rounded-full px-2 py-0.5 flex items-center gap-1 mx-auto" style={{color:ROSE,borderColor:ROSE_L}}><Plus className="w-2.5 h-2.5"/> adaugă</button>}
                          </div>
                        </Card>
                      </Reveal>
                    )}

                    {block.type==='parents' && (
                      <Reveal>
                        <Card align={(block.blockAlign as any)||'center'}>
                          <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle||'Părinții Noștri'} onChange={v=>updBlock(realIdx,{sectionTitle:v})} placeholder="Titlu..." style={{fontFamily:SCRIPT,fontSize:22,color:ROSE_D,margin:'0 0 6px',display:'block'}}/>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(realIdx,{content:v})} placeholder="Text introductiv..." multiline style={{fontFamily:SERIF,fontSize:12,fontStyle:'italic',color:MUTED,margin:'0 0 12px',lineHeight:1.7,display:'block'}}/>
                          <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'center'}}>
                            {([{key:'p1_father',ph:'Tatăl Miresei'},{key:'p1_mother',ph:'Mama Miresei'},{key:'p2_father',ph:'Tatăl Mirelui'},{key:'p2_mother',ph:'Mama Mirelui'}] as const).map(({key,ph})=>(
                              <InlineEdit key={key} tag="p" editMode={editMode} value={parentsData[key]||''} onChange={v=>updParent(key,v)} placeholder={ph} style={{fontFamily:SERIF,fontSize:16,fontWeight:300,color:block.textColor||TEXT,margin:0}}/>
                            ))}
                          </div>
                        </Card>
                      </Reveal>
                    )}

                    {block.type==='text' && <Reveal><div style={{textAlign:'center',padding:'6px 0'}}><InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(realIdx,{content:v})} placeholder="Text liber..." multiline style={{fontFamily:SERIF,fontSize:14,fontStyle:'italic',color:MUTED,lineHeight:1.85}}/></div></Reveal>}
                    {block.type==='title' && <Reveal><div style={{textAlign:'center',padding:'4px 0'}}><InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(realIdx,{content:v})} placeholder="Titlu secțiune..." style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.42em',textTransform:'uppercase',color:ROSE}}/></div></Reveal>}
                    {block.type==='divider' && <Reveal><RoseDivider/></Reveal>}
                    {block.type==='spacer'  && <div style={{height:16}}/>}
                  </BlockStyleProvider>
                </div>
              );
            })}
          </div>

          {/* ── ADD BLOCK STRIP ── */}
          {editMode && (
            <div style={{margin:'16px 20px 0',padding:'16px',border:`2px dashed ${ROSE_L}`,borderRadius:12,background:`${CREAM}88`,textAlign:'center'}}>
              <p style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:'0.4em',textTransform:'uppercase',color:MUTED,marginBottom:12}}>Adaugă bloc</p>
              <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:6}}>
                {BLOCK_TYPES.map(({type,label,def})=>(
                  <button key={type} type="button" onClick={()=>addBlock(type,def)}
                    style={{padding:'5px 12px',border:`1px solid ${ROSE_L}`,borderRadius:99,fontFamily:SANS,fontSize:10,fontWeight:700,background:type==='photo'?ROSE:'transparent',color:type==='photo'?'white':ROSE_D,cursor:'pointer'}}>
                    + {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Timeline ── */}
          {profile.showTimeline && (() => {
            const timeline = safeJSON(profile.timeline,[]);
            if (!timeline.length) return null;
            return (
              <Reveal style={{margin:'10px 20px 0'}}>
                <Card roseCorner>
                  <p style={{fontFamily:SANS,fontSize:8,fontWeight:700,letterSpacing:'0.42em',textTransform:'uppercase',color:ROSE,textAlign:'center',margin:'0 0 16px'}}>Programul Zilei</p>
                  {timeline.map((item:any,i:number)=>(
                    <div key={item.id} style={{display:'grid',gridTemplateColumns:'52px 20px 1fr',alignItems:'stretch',minHeight:40}}>
                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'flex-end',paddingRight:8,paddingTop:2}}>
                        <span style={{fontFamily:SERIF,fontSize:13,fontWeight:600,color:ROSE}}>{item.time}</span>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:ROSE,border:`1.5px solid ${ROSE_L}`,marginTop:3,flexShrink:0,opacity:0.7}}/>
                        {i<timeline.length-1&&<div style={{flex:1,width:0.7,background:ROSE_XL,marginTop:2}}/>}
                      </div>
                      <div style={{paddingLeft:10,paddingTop:2,paddingBottom:i<timeline.length-1?18:0}}>
                        <span style={{fontFamily:SANS,fontSize:13,fontWeight:400,color:TEXT,opacity:0.72}}>{item.title}</span>
                      </div>
                    </div>
                  ))}
                </Card>
              </Reveal>
            );
          })()}

          {/* ── Pink arch accent before RSVP ── */}
          {showRsvp && (
            <Reveal style={{margin:'20px 20px 0'}}>
              <div style={{textAlign:'center'}}>
                {/* Mini arch decoration */}
                <div style={{display:'flex',justifyContent:'center',marginBottom:16,opacity:0.35}}>
                  <img src={archPinkImg} alt="" style={{width:100,height:60,objectFit:'contain'}}/>
                </div>
                <RoseDivider/>
                <div style={{marginTop:24}}>
                  {editMode ? (
                    <div style={{display:'inline-block',padding:'16px 40px',background:`linear-gradient(135deg, ${ROSE}, ${ROSE_D})`,borderRadius:6}}>
                      <InlineEdit tag="span" editMode={editMode} value={rsvpText} onChange={v=>upProfile('rsvpButtonText',v)}
                        style={{fontFamily:SANS,fontWeight:700,fontSize:10,letterSpacing:'0.4em',textTransform:'uppercase',color:'white',cursor:'text'}}/>
                    </div>
                  ) : (
                    <button onClick={()=>onOpenRSVP?.()}
                      style={{padding:'16px 48px',background:`linear-gradient(135deg, ${ROSE}, ${ROSE_D})`,border:'none',borderRadius:6,cursor:'pointer',fontFamily:SANS,fontWeight:700,fontSize:10,letterSpacing:'0.4em',textTransform:'uppercase',color:'white',boxShadow:`0 8px 28px ${ROSE}55`,transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)'}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.letterSpacing='0.5em';(e.currentTarget as HTMLButtonElement).style.boxShadow=`0 12px 36px ${ROSE_D}55`;}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.letterSpacing='0.4em';(e.currentTarget as HTMLButtonElement).style.boxShadow=`0 8px 28px ${ROSE}55`;}}>
                      {rsvpText}
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {/* ── Footer ── */}
          <Reveal style={{marginTop:40,textAlign:'center',padding:'0 20px'}}>
            <RoseDivider/>
            <div style={{marginTop:16,display:'flex',justifyContent:'center',gap:8,opacity:0.25}}>
              <img src={rosesCornerImg} alt="" style={{width:40,height:40,objectFit:'cover',objectPosition:'top left',borderRadius:'50%'}}/>
              <img src={rosesCornerImg} alt="" style={{width:40,height:40,objectFit:'cover',objectPosition:'top left',borderRadius:'50%',transform:'scaleX(-1)'}}/>
            </div>
            <p style={{fontFamily:SERIF,fontSize:11,fontStyle:'italic',color:`${MUTED}88`,marginTop:12}}>cu drag · WeddingPro</p>
          </Reveal>
        </div>
      </div>
    </>
  );
};

export default ArchRoseTemplate;
