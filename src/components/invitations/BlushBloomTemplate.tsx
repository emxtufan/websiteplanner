import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus, Camera, Upload } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";
import { WeddingIcon } from "../TimelineIcons";

export const meta: TemplateMeta = {
  id: 'blush-bloom',
  name: 'Blush Bloom',
  category: 'wedding',
  description: 'Romantic airy — botanical branches, flip countdown, animație botanică de deschidere.',
  colors: ['#fdf8f5', '#e8b4b8', '#8b5e6b'],
  previewClass: "bg-rose-50 border-rose-200",
  elementsClass: "bg-rose-300",
};

// ─── Fonts ─────────────────────────────────────────────────────────────────────
const SERIF   = "'Cormorant Garamond','Playfair Display',Georgia,serif";
const DISPLAY = "'Bodoni Moda','Didot','Playfair Display',Georgia,serif";
const SANS    = "'DM Sans','Helvetica Neue',system-ui,sans-serif";

// ─── Design tokens ──────────────────────────────────────────────────────────
const BLUSH     = '#e8a0ac';
const BLUSH_D   = '#c97090';
const BLUSH_L   = '#f2c8cf';
const BLUSH_XL  = '#fdf0f2';
const PLUM      = '#5a3a44';
const MUTED     = 'rgba(139,94,107,0.5)';

// ─── API helpers ─────────────────────────────────────────────────────────────
const API_URL = (typeof window !== 'undefined' && (window as any).__API_URL__)
  || (import.meta as any)?.env?.VITE_API_URL
  || 'http://localhost:3005/api';

function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith('/uploads/')) return;
  const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  fetch(`${API_URL}/upload`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_s?.token || ''}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

// ─── Photo shape system ───────────────────────────────────────────────────────
type ClipShape = 'rect'|'rounded'|'rounded-lg'|'squircle'|'circle'|'arch'|'arch-b'|'hexagon'|'diamond'|'triangle'|'star'|'heart'|'diagonal'|'diagonal-r'|'wave-b'|'wave-t'|'wave-both'|'blob'|'blob2'|'blob3'|'blob4';
type MaskEffect = 'fade-b'|'fade-t'|'fade-l'|'fade-r'|'vignette';

function getClipStyle(clip: ClipShape): React.CSSProperties {
  const c: Record<ClipShape, React.CSSProperties> = {
    rect:{borderRadius:0}, rounded:{borderRadius:16}, 'rounded-lg':{borderRadius:32}, squircle:{borderRadius:'30% 30% 30% 30% / 30% 30% 30% 30%'},
    circle:{borderRadius:'50%'}, arch:{borderRadius:'50% 50% 0 0 / 40% 40% 0 0'}, 'arch-b':{borderRadius:'0 0 50% 50% / 0 0 40% 40%'},
    hexagon:{clipPath:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'}, diamond:{clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'},
    triangle:{clipPath:'polygon(50% 0%,100% 100%,0% 100%)'}, star:{clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'},
    heart:{clipPath:'url(#clip-heart)'}, diagonal:{clipPath:'polygon(0 0,100% 0,100% 80%,0 100%)'}, 'diagonal-r':{clipPath:'polygon(0 0,100% 0,100% 100%,0 80%)'},
    'wave-b':{clipPath:'url(#clip-wave-b)'}, 'wave-t':{clipPath:'url(#clip-wave-t)'}, 'wave-both':{clipPath:'url(#clip-wave-both)'},
    blob:{clipPath:'url(#clip-blob)'}, blob2:{clipPath:'url(#clip-blob2)'}, blob3:{clipPath:'url(#clip-blob3)'}, blob4:{clipPath:'url(#clip-blob4)'},
  };
  return c[clip] || {};
}
function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers = effects.map(e => ({'fade-b':'linear-gradient(to bottom,black 40%,transparent 100%)','fade-t':'linear-gradient(to top,black 40%,transparent 100%)','fade-l':'linear-gradient(to left,black 40%,transparent 100%)','fade-r':'linear-gradient(to right,black 40%,transparent 100%)','vignette':'radial-gradient(ellipse 80% 80% at center,black 40%,transparent 100%)'}[e] || 'none'));
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

// ─── Photo Placeholder ────────────────────────────────────────────────────────
interface PhotoPlaceholderProps {
  aspectRatio: string; photoClip: ClipShape; photoMasks: MaskEffect[];
  initial1?: string; initial2?: string; variant?: number; editMode: boolean; onClick: () => void;
}
const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({aspectRatio,photoClip,photoMasks,initial1='S',initial2='A',variant=0,editMode,onClick}) => {
  const pads: Record<string,string> = {'1:1':'100%','4:3':'75%','3:4':'133%','16:9':'56.25%','free':'75%'};
  const pt = pads[aspectRatio] || '75%';
  const g = [['#f2c8cf','#e8a0ac'],['#fad4da','#d4889a'],['#e8b8c0','#c97090'],['#fce0e5','#d4a0b0']][variant%4];
  const gId = `bb-ph-${variant}`;
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
          {/* Rose petal accents */}
          {[0,72,144,216,288].map((a,i)=>{const r=Math.PI*a/180;const cx=200+Math.cos(r)*110;const cy=250+Math.sin(r)*110;return <ellipse key={i} cx={cx} cy={cy} rx="14" ry="22" fill="rgba(255,255,255,0.18)" transform={`rotate(${a},${cx},${cy})`}/>;})}
          <text x="200" y="215" fontFamily="Bodoni Moda,Didot,Playfair Display,Georgia,serif" fontSize="100" fill="rgba(255,255,255,0.9)" textAnchor="middle" fontStyle="italic">{(initial1||'S')[0].toUpperCase()}</text>
          <text x="200" y="268" fontFamily="Cormorant Garamond,Georgia,serif" fontSize="36" fill="rgba(255,255,255,0.6)" textAnchor="middle" fontStyle="italic">&amp;</text>
          <text x="200" y="330" fontFamily="Bodoni Moda,Didot,Playfair Display,Georgia,serif" fontSize="100" fill="rgba(255,255,255,0.9)" textAnchor="middle" fontStyle="italic">{(initial2||'A')[0].toUpperCase()}</text>
          <line x1="150" y1="345" x2="250" y2="345" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
          {editMode && <><rect x="130" y="390" width="140" height="36" rx="18" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/><text x="200" y="413" fontFamily="DM Sans,sans-serif" fontSize="12" fill="white" textAnchor="middle" fontWeight="600" opacity="0.9">+ Adaugă fotografie</text></>}
        </svg>
      </div>
    </div>
  );
};

// ─── Photo Block ──────────────────────────────────────────────────────────────
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
  const combined:React.CSSProperties = {...getClipStyle(photoClip),...getMaskStyle(photoMasks)};

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
        {uploading && <div style={{position:'relative',paddingTop:pt,background:BLUSH_XL,...combined}}><div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10}}><div style={{width:32,height:32,border:`3px solid ${BLUSH_L}`,borderTop:`3px solid ${BLUSH_D}`,borderRadius:'50%',animation:'bb-spin 0.8s linear infinite'}}/><span style={{fontFamily:SANS,fontSize:11,fontWeight:700,color:BLUSH_D}}>Se încarcă...</span></div></div>}
        {!uploading && (
          <div style={{position:'relative'}}>
            <div style={{position:'relative',paddingTop:pt,overflow:'hidden',...combined}}>
              <img src={imgSrc} alt={altText||''} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            </div>
            {editMode && (
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:0,transition:'opacity 0.2s',...combined}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.opacity='1'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.opacity='0'}>
                <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.42)'}}/>
                <button type="button" onClick={()=>fileRef.current?.click()} style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:99,background:'white',border:'none',cursor:'pointer',fontFamily:SANS,fontSize:11,fontWeight:700,color:PLUM}}><Camera className="w-3.5 h-3.5"/> Schimbă</button>
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
          <div style={{position:'absolute',inset:0,background:dragging?'rgba(201,112,144,0.5)':'rgba(0,0,0,0.35)',transition:'background 0.2s',...getClipStyle(photoClip)}}/>
          <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'2px solid rgba(255,255,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}><Upload className="w-5 h-5" style={{color:'white'}}/></div>
            <span style={{fontFamily:SANS,fontSize:11,fontWeight:700,color:'white',textShadow:'0 1px 4px rgba(0,0,0,0.5)'}}>{dragging?'Eliberează':'Înlocuiește fotografia'}</span>
          </div>
        </div>
      )}
      {uploading && <div style={{position:'absolute',inset:0,background:'rgba(253,240,242,0.88)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,...getClipStyle(photoClip)}}><div style={{width:32,height:32,border:`3px solid ${BLUSH_L}`,borderTop:`3px solid ${BLUSH_D}`,borderRadius:'50%',animation:'bb-spin 0.8s linear infinite'}}/><span style={{fontFamily:SANS,fontSize:11,fontWeight:700,color:BLUSH_D}}>Se încarcă...</span></div>}
      {uploadErr && <div style={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',background:'rgba(200,40,40,0.9)',color:'white',borderRadius:99,padding:'4px 14px',fontFamily:SANS,fontSize:10,fontWeight:700,whiteSpace:'nowrap'}}>{uploadErr}</div>}
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}} style={{display:'none'}}/>
    </div>
  );
};

// ─── INTRO ANIMATION ──────────────────────────────────────────────────────────
const BlushIntro: React.FC<{ l1: string; l2: string; onDone: () => void }> = ({ l1, l2, onDone }) => {
  const [phase, setPhase] = useState(0);
  const showSecond = !!l2 && l2 !== l1;
  const circleLen = 2 * Math.PI * 85;
  const petalAngles = [0, 72, 144, 216, 288];

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 480),
      setTimeout(() => setPhase(3), 950),
      setTimeout(() => setPhase(4), 1950),
      setTimeout(() => setPhase(5), 2850),
      setTimeout(onDone, 3700),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(160deg,#fdf8f5 0%,#faf0ee 50%,#fdf5f7 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: phase === 5 ? 0 : 1,
      transform: phase === 5 ? "scale(1.04)" : "scale(1)",
      transition: phase === 5 ? "opacity 0.85s cubic-bezier(0.4,0,0.2,1), transform 0.85s" : "none",
      pointerEvents: phase === 5 ? "none" : "auto",
      overflow: "hidden",
    }}>

      {/* Ambient blobs */}
      {[
        { top: "-12%", left: "-8%",  w: 420, c: "rgba(232,160,172,0.22)", delay: "0s"    },
        { top: "50%",  right: "-8%", w: 340, c: "rgba(201,116,138,0.16)", delay: "0.3s"  },
        { bottom: "-8%", left: "20%", w: 300, c: "rgba(248,200,210,0.2)",  delay: "0.5s"  },
      ].map((b, i) => (
        <div key={i} style={{
          position: "absolute", ...b as any,
          width: b.w, height: b.w, borderRadius: "50%",
          background: `radial-gradient(circle,${b.c} 0%,transparent 70%)`,
          filter: "blur(45px)", pointerEvents: "none",
          opacity: phase >= 1 ? 1 : 0,
          transition: `opacity 1.2s ${b.delay}`,
        }}/>
      ))}

      {/* Floating petals */}
      {phase >= 1 && [...Array(14)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${10 + (i * 6.5) % 80}%`,
          top: `${5 + (i * 7.3) % 90}%`,
          width: `${6 + (i % 4) * 4}px`,
          height: `${10 + (i % 4) * 5}px`,
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          background: `rgba(${[232, 201, 248][i % 3]},${[160, 116, 180][i % 3]},${[172, 138, 195][i % 3]},${0.15 + (i % 4) * 0.05})`,
          transform: `rotate(${i * 27}deg)`,
          animation: `bb-float-${i % 3} ${3 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${i * 0.25}s`,
          pointerEvents: "none",
        }}/>
      ))}

      <style>{`
        @keyframes bb-float-0{0%,100%{transform:translateY(0) rotate(20deg)}50%{transform:translateY(-12px) rotate(25deg)}}
        @keyframes bb-float-1{0%,100%{transform:translateY(0) rotate(-15deg)}50%{transform:translateY(-8px) rotate(-20deg)}}
        @keyframes bb-float-2{0%,100%{transform:translateY(0) rotate(45deg)}50%{transform:translateY(-15px) rotate(50deg)}}
        @keyframes bb-pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.7);opacity:1}}
        @keyframes bb-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
      `}</style>

      {/* Main scene */}
      <div style={{ position: "relative", width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none" style={{ position: "absolute", inset: 0 }}>

          {/* Outer glow ring */}
          <circle cx="140" cy="140" r="112" stroke="rgba(232,160,172,0.12)" strokeWidth="20"/>

          {/* Dashed inner ring */}
          <circle cx="140" cy="140" r="78" stroke="rgba(201,116,144,0.18)" strokeWidth="0.6"
            strokeDasharray="3 9"
            opacity={phase >= 3 ? 1 : 0}
            style={{ transition: "opacity 0.6s 0.4s" }}/>

          {/* Animated circle */}
          <circle cx="140" cy="140" r="95"
            stroke="rgba(232,160,172,0.2)" strokeWidth="0.5"/>
          <circle cx="140" cy="140" r="95"
            stroke="url(#bb-ring-grad)" strokeWidth="1.2"
            strokeDasharray={2 * Math.PI * 95}
            strokeDashoffset={phase >= 3 ? 0 : 2 * Math.PI * 95}
            strokeLinecap="round"
            style={{
              transformOrigin: "140px 140px", transform: "rotate(-90deg)",
              transition: phase >= 3 ? "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)" : "none",
            }}/>

          {/* Second animated ring (delayed) */}
          <circle cx="140" cy="140" r="85"
            stroke="rgba(232,160,172,0.35)" strokeWidth="0.5"/>
          <circle cx="140" cy="140" r="85"
            stroke="#e8a0ac" strokeWidth="0.8"
            strokeDasharray={circleLen}
            strokeDashoffset={phase >= 3 ? 0 : circleLen}
            strokeLinecap="round"
            style={{
              transformOrigin: "140px 140px", transform: "rotate(-90deg)",
              transition: phase >= 3 ? "stroke-dashoffset 1.2s 0.3s cubic-bezier(0.4,0,0.2,1)" : "none",
            }}/>

          <defs>
            <linearGradient id="bb-ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f4b8c4" stopOpacity="0.9"/>
              <stop offset="50%" stopColor="#e8a0ac"/>
              <stop offset="100%" stopColor="#c97090" stopOpacity="0.6"/>
            </linearGradient>
          </defs>

          {/* Tick marks on outer ring */}
          {[...Array(24)].map((_, i) => {
            const angle = (i * 15 - 90) * Math.PI / 180;
            const r1 = 107, r2 = i % 6 === 0 ? 100 : 103;
            return (
              <line key={i}
                x1={140 + r1 * Math.cos(angle)} y1={140 + r1 * Math.sin(angle)}
                x2={140 + r2 * Math.cos(angle)} y2={140 + r2 * Math.sin(angle)}
                stroke="rgba(201,116,144,0.25)" strokeWidth={i % 6 === 0 ? 1 : 0.5}
                opacity={phase >= 3 ? 1 : 0}
                style={{ transition: `opacity 0.3s ${0.5 + i * 0.02}s` }}/>
            );
          })}

          {/* Rose blooms on ring */}
          {petalAngles.map((angle, idx) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const cx = 140 + Math.cos(rad) * 95;
            const cy = 140 + Math.sin(rad) * 95;
            return (
              <g key={idx} opacity={phase >= 3 ? 1 : 0}
                style={{ transition: `opacity 0.4s ${0.4 + idx * 0.12}s`, transformOrigin: `${cx}px ${cy}px`,
                  transform: phase >= 3 ? "scale(1)" : "scale(0.2)" }}>
                {[0, 72, 144, 216, 288].map((pa, pi) => {
                  const pr = ((pa - 90) * Math.PI) / 180;
                  const px = cx + Math.cos(pr) * 5.5, py = cy + Math.sin(pr) * 5.5;
                  return <ellipse key={pi} cx={px} cy={py} rx="2.5" ry="4.5" fill="#e8a0ac" opacity="0.65"
                    transform={`rotate(${pa},${px},${py})`}/>;
                })}
                <circle cx={cx} cy={cy} r="3.5" fill="#e8a0ac" opacity="0.9"/>
                <circle cx={cx} cy={cy} r="2" fill="#e07888"/>
              </g>
            );
          })}

          {/* Leaf accents */}
          {[[45, 45], [235, 55], [55, 235]].map(([lx, ly], li) => (
            <ellipse key={li} cx={lx} cy={ly} rx="10" ry="5" fill="#b8d4a8"
              opacity={phase >= 3 ? 0.6 : 0}
              transform={`rotate(${li * 45 - 20} ${lx} ${ly})`}
              style={{ transition: `opacity 0.4s ${0.8 + li * 0.12}s` }}/>
          ))}

          {/* Diamond accents */}
          {[0, 90, 180, 270].map((angle, i) => {
            const rad = (angle - 90) * Math.PI / 180;
            const cx = 140 + Math.cos(rad) * 95;
            const cy = 140 + Math.sin(rad) * 95;
            return (
              <rect key={i} x={cx - 3} y={cy - 3} width="6" height="6"
                fill="#e8a0ac" opacity={phase >= 4 ? 0.7 : 0}
                transform={`rotate(45 ${cx} ${cy})`}
                style={{ transition: `opacity 0.3s ${0.6 + i * 0.08}s` }}/>
            );
          })}
        </svg>

        {/* Central initials */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: showSecond ? 0 : 0 }}>
            {[l1, showSecond ? "&" : null, showSecond ? l2 : null].filter(Boolean).map((ch, i) => (
              <span key={i} style={{
                fontFamily: i === 1 ? SERIF : DISPLAY,
                fontSize: i === 1 ? 32 : 80, fontWeight: i === 1 ? 400 : 400,
                lineHeight: 1, letterSpacing: i === 1 ? 0 : -3,
                color: i === 1 ? "#c97090" : "#5a3a44",
                fontStyle: i === 1 ? "italic" : "normal",
                paddingTop: i === 1 ? 12 : 0, margin: i === 1 ? "0 4px" : 0,
                opacity: phase >= 2 ? 1 : 0,
                transform: phase >= 2 ? "translateY(0) scale(1)" : i === 1 ? "scale(0.3)" : "translateY(24px) scale(0.9)",
                textShadow: i !== 1 ? "0 0 50px rgba(232,160,172,0.4)" : undefined,
                transition: `opacity 0.7s ${i * 0.1}s cubic-bezier(0.22,1,0.36,1), transform 0.7s ${i * 0.1}s cubic-bezier(0.22,1,0.36,1)`,
              }}>{ch}</span>
            ))}
          </div>

          {/* Shimmer line under initials */}
          <div style={{
            height: 1, margin: "8px auto 0", width: 60,
            background: "linear-gradient(90deg, transparent, #e8a0ac, transparent)",
            backgroundSize: "200% auto",
            animation: phase >= 3 ? "bb-shimmer 2s linear infinite" : "none",
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.5s 0.5s",
          }}/>
        </div>
      </div>

      {/* Tagline */}
      <p style={{
        fontFamily: SERIF, fontSize: 13, fontStyle: "italic",
        color: "rgba(139,94,107,0.55)", marginTop: 24,
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s 0.7s, transform 0.5s 0.7s",
      }}>se căsătoresc</p>

      {/* Bottom rose divider */}
      <div style={{
        position: "absolute", bottom: 36,
        display: "flex", alignItems: "center", gap: 12, width: 200,
        opacity: phase >= 3 ? 1 : 0,
        transition: "opacity 0.5s 0.9s",
      }}>
        <div style={{ flex: 1, height: "0.6px", background: "linear-gradient(to right,transparent,rgba(201,116,144,0.4))" }}/>
        <RoseDividerIcon/>
        <div style={{ flex: 1, height: "0.6px", background: "linear-gradient(to left,transparent,rgba(201,116,144,0.4))" }}/>
      </div>
    </div>
  );
};

// ─── Decorative SVG components ────────────────────────────────────────────────
const RoseDividerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    {[0, 72, 144, 216, 288].map((a, i) => {
      const r = ((a - 90) * Math.PI) / 180;
      const cx = 10 + Math.cos(r) * 6, cy = 10 + Math.sin(r) * 6;
      return <ellipse key={i} cx={cx} cy={cy} rx="3" ry="5.5" fill="#e8a0ac" opacity="0.55"
        transform={`rotate(${a},${cx},${cy})`}/>;
    })}
    <circle cx="10" cy="10" r="4" fill="#e8a0ac" opacity="0.9"/>
    <circle cx="10" cy="10" r="2.5" fill="#e07888"/>
  </svg>
);

const RoseDivider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ flex: 1, height: "0.6px", background: "linear-gradient(to right,transparent,rgba(201,116,144,0.3))" }}/>
    <RoseDividerIcon/>
    <div style={{ flex: 1, height: "0.6px", background: "linear-gradient(to left,transparent,rgba(201,116,144,0.3))" }}/>
  </div>
);

const SplashTopLeft = () => (
  <svg viewBox="0 0 320 280" fill="none"
    style={{ position: "absolute", top: -30, left: -40, width: 280, height: 240, pointerEvents: "none", opacity: 0.5 }}>
    <defs>
      <radialGradient id="bb-s1" cx="40%" cy="35%" r="60%">
        <stop offset="0%"   stopColor="#f2b8c0" stopOpacity="0.7"/>
        <stop offset="60%"  stopColor="#e8a0ac" stopOpacity="0.35"/>
        <stop offset="100%" stopColor="#e8a0ac" stopOpacity="0"/>
      </radialGradient>
      <filter id="bb-blur1"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>
    <ellipse cx="120" cy="100" rx="140" ry="110" fill="url(#bb-s1)" filter="url(#bb-blur1)"/>
    <path d="M20 60 Q60 40 110 55 Q80 65 20 60Z"      fill="#e8a0ac" opacity="0.22"/>
    <path d="M5  90 Q30 70  80 85  Q50 95  5  90Z"    fill="#e8a0ac" opacity="0.16"/>
    <path d="M40 140 Q90 125 130 140 Q100 155 40 140Z" fill="#d4849a" opacity="0.18"/>
  </svg>
);

const SplashBottomRight = () => (
  <svg viewBox="0 0 300 260" fill="none"
    style={{ position: "absolute", bottom: -20, right: -30, width: 260, height: 220, pointerEvents: "none", opacity: 0.45 }}>
    <defs>
      <radialGradient id="bb-s3" cx="60%" cy="65%" r="55%">
        <stop offset="0%"   stopColor="#c9748a" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#c9748a" stopOpacity="0"/>
      </radialGradient>
      <filter id="bb-blur2"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <ellipse cx="180" cy="170" rx="130" ry="100" fill="url(#bb-s3)" filter="url(#bb-blur2)"/>
  </svg>
);

const RoseBranch: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <svg viewBox="0 0 180 320" fill="none"
    style={{ width: 155, height: 285, opacity: 0.65, transform: flip ? "scaleX(-1)" : undefined, pointerEvents: "none" }}>
    <path d="M90 310 C88 260 82 210 88 160 C92 120 80 80 85 40"
      stroke="#9a6670" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M87 240 C70 230 50 220 30 215"  stroke="#9a6670" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
    <path d="M86 185 C68 175 50 165 32 155"  stroke="#9a6670" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
    <path d="M87 130 C72 118 56 108 42 100"  stroke="#9a6670" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
    <path d="M88 210 C106 200 124 192 142 188" stroke="#9a6670" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
    <path d="M87 160 C104 150 118 142 135 138" stroke="#9a6670" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="22"  cy="213" rx="14" ry="8"  fill="#b8d4a8" opacity="0.6"  transform="rotate(-20 22 213)"/>
    <ellipse cx="25"  cy="153" rx="13" ry="7"  fill="#a8c898" opacity="0.55" transform="rotate(-15 25 153)"/>
    <ellipse cx="35"  cy="98"  rx="12" ry="7"  fill="#b8d4a8" opacity="0.5"  transform="rotate(-10 35 98)"/>
    <ellipse cx="148" cy="186" rx="13" ry="7"  fill="#a8c898" opacity="0.55" transform="rotate(25 148 186)"/>
    <ellipse cx="140" cy="136" rx="12" ry="6"  fill="#b8d4a8" opacity="0.5"  transform="rotate(20 140 136)"/>
    <circle cx="85" cy="38" r="10"  fill="#e8a0ac" opacity="0.85"/>
    <circle cx="85" cy="38" r="7"   fill="#e07888"/>
    <path d="M78 36 Q85 28 92 36 Q85 44 78 36Z" fill="#f4c0c8" opacity="0.6"/>
    <circle cx="40"  cy="99"  r="7"   fill="#e8a0ac" opacity="0.75"/>
    <circle cx="40"  cy="99"  r="4.5" fill="#e07888"/>
    <circle cx="137" cy="136" r="6"   fill="#e8a0ac" opacity="0.7"/>
    <circle cx="137" cy="136" r="4"   fill="#e07888"/>
    <circle cx="148" cy="188" r="4.5" fill="#e8a0ac" opacity="0.65"/>
    <circle cx="24"  cy="155" r="4"   fill="#e8a0ac" opacity="0.6"/>
  </svg>
);

const Sprig = () => (
  <svg viewBox="0 0 120 60" fill="none" style={{ width: 100, height: 50, opacity: 0.45, pointerEvents: "none" }}>
    <path d="M10 50 Q40 30 60 20 Q80 10 110 8" stroke="#9a6670" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
    {[20, 40, 60, 80, 100].map((x, i) => {
      const y = 50 - i * 8;
      return (
        <g key={i}>
          <ellipse cx={x-8} cy={y-5} rx="9" ry="5" fill="#b8d4a8" opacity="0.5" transform={`rotate(-30 ${x-8} ${y-5})`}/>
          <ellipse cx={x+4} cy={y-8} rx="8" ry="4" fill="#a8c898" opacity="0.45" transform={`rotate(15 ${x+4} ${y-8})`}/>
        </g>
      );
    })}
    <circle cx="110" cy="8" r="5" fill="#e8a0ac" opacity="0.75"/>
    <circle cx="110" cy="8" r="3" fill="#e07888"/>
  </svg>
);

// ─── Flip countdown digit ──────────────────────────────────────────────────────
const FlipDigit: React.FC<{ value: number }> = ({ value }) => {
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
    <div style={{ width: 56, height: 66, background: "rgba(255,255,255,0.9)",
      border: "1px solid rgba(232,160,172,0.4)", borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      boxShadow: "0 4px 18px rgba(184,120,140,0.1), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "0.5px", background: "rgba(201,116,144,0.2)", zIndex: 2 }}/>
      <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 400, color: "#5a3a44",
        lineHeight: 1, zIndex: 1, letterSpacing: -1,
        transform: flash ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.16s cubic-bezier(0.4,0,0.2,1)", display: "block" }}>
        {String(value).padStart(2, '0')}
      </span>
      <div style={{ position: "absolute", inset: 0, background: "#e8a0ac",
        opacity: flash ? 0.08 : 0, transition: "opacity 0.32s", pointerEvents: "none" }}/>
    </div>
  );
};

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return { days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000), minutes: Math.floor((diff%3600000)/60000), seconds: Math.floor((diff%60000)/1000), expired: false };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { if (!target) return; const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [target]);
  return t;
}

// ─── Block toolbar ────────────────────────────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-3.5 right-2 flex items-center gap-0.5 bg-white border border-rose-200 rounded-full shadow-lg px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto">
    <button type="button" onClick={e => { e.stopPropagation(); onUp(); }} disabled={isFirst} className="p-0.5 rounded-full hover:bg-rose-50 disabled:opacity-25 transition-colors"><ChevronUp className="w-3 h-3 text-rose-400"/></button>
    <button type="button" onClick={e => { e.stopPropagation(); onDown(); }} disabled={isLast} className="p-0.5 rounded-full hover:bg-rose-50 disabled:opacity-25 transition-colors"><ChevronDown className="w-3 h-3 text-rose-400"/></button>
    <div className="w-px h-3 bg-rose-100 mx-0.5"/>
    <button type="button" onClick={e => { e.stopPropagation(); onToggle(); }} className="p-0.5 rounded-full hover:bg-rose-50 transition-colors">
      {visible ? <Eye className="w-3 h-3 text-rose-400"/> : <EyeOff className="w-3 h-3 text-rose-300"/>}
    </button>
    <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }} className="p-0.5 rounded-full hover:bg-red-50 transition-colors"><Trash2 className="w-3 h-3 text-red-400"/></button>
  </div>
);

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Location card ────────────────────────────────────────────────────────────
const LocCard: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void }> = ({ block, editMode, onUpdate }) => {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{
      background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)",
      borderRadius: 4, border: "1px solid rgba(232,160,172,0.25)",
      padding: "20px 24px", boxShadow: "0 4px 24px rgba(184,120,140,0.07)",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <InlineEdit tag="p" editMode={editMode} value={block.label || ''} onChange={v => onUpdate({ label: v })} placeholder="Eveniment..."
        style={{ fontFamily: SANS, fontSize: 8, fontWeight: 800, letterSpacing: "0.42em",
          textTransform: "uppercase", color: "rgba(139,94,107,0.5)", display: "block", marginBottom: 12 }}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 0, alignItems: "start" }}>
        <div>
          <InlineTime value={block.time || ''} onChange={v => onUpdate({ time: v })} editMode={editMode}
            className="font-serif text-3xl font-light" style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 300, color: "#5a3a44", display: "block" }}/>
          <p style={{ fontFamily: SANS, fontSize: 8, color: "rgba(139,94,107,0.45)", margin: "2px 0 0" }}>ora</p>
        </div>
        <div style={{ background: "rgba(201,116,144,0.18)", margin: "4px 18px 0", alignSelf: "stretch" }}/>
        <div>
          <InlineEdit tag="p" editMode={editMode} value={block.locationName || ''} onChange={v => onUpdate({ locationName: v })} placeholder="Locație..."
            style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#5a3a44", margin: "0 0 3px", lineHeight: 1.3 }}/>
          <InlineEdit tag="p" editMode={editMode} value={block.locationAddress || ''} onChange={v => onUpdate({ locationAddress: v })} placeholder="Adresă..."
            style={{ fontFamily: SANS, fontSize: 11, color: "rgba(90,58,68,0.48)", margin: 0, lineHeight: 1.5, fontStyle: "italic" }} multiline/>
        </div>
      </div>
      {(block.wazeLink || editMode) && (
        <div style={{ marginTop: 10 }}>
          <InlineWaze value={block.wazeLink || ''} onChange={v => onUpdate({ wazeLink: v })} editMode={editMode}/>
        </div>
      )}
    </div>
  );
};

// ─── Main Template ─────────────────────────────────────────────────────────────
export type BlushBloomProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const BlushBloomTemplate: React.FC<BlushBloomProps> = ({
  data, onOpenRSVP, editMode = false, introPreview = false, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId,
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

  // Lock scroll during intro
  useEffect(() => {
    if (editMode) {
      ['overflow','position','top','left','right'].forEach(p => (document.body.style as any)[p] = '');
      return;
    }
    if (showIntro) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.inset = '0';
    } else {
      ['overflow','position','top','left','right'].forEach(p => (document.body.style as any)[p] = '');
    }
    return () => { ['overflow','position','top','left','right'].forEach(p => (document.body.style as any)[p] = ''); };
  }, [showIntro, editMode]);

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const [blocks, setBlocks]           = useState<InvitationBlock[]>(() => safeJSON(profile.customSections, []));
  const [godparents, setGodparents]   = useState<any[]>(() => safeJSON(profile.godparents, []));
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

  const debouncedBlocks = useCallback((nb: InvitationBlock[]) => {
    if (_bt.current) clearTimeout(_bt.current);
    _bt.current = setTimeout(() => onBlocksUpdate?.(nb), 500);
  }, [onBlocksUpdate]);

  const updBlock = useCallback((idx: number, patch: Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb = prev.map((b, i) => i === idx ? { ...b, ...patch } : b); debouncedBlocks(nb); return nb; });
  }, [debouncedBlocks]);

  const movBlock = useCallback((idx: number, dir: -1 | 1) => {
    setBlocks(prev => { const nb = [...prev]; const to = idx + dir; if (to < 0 || to >= nb.length) return prev; [nb[idx], nb[to]] = [nb[to], nb[idx]]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const delBlock = useCallback((idx: number) => {
    setBlocks(prev => { const nb = prev.filter((_, i) => i !== idx); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const addBlock = useCallback((type: string, def: any) => {
    setBlocks(prev => { const nb = [...prev, { id: Date.now().toString(), type: type as any, show: true, ...def }]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const updGodparent = (i: number, f: 'godfather'|'godmother', v: string) => {
    setGodparents(prev => { const ng = prev.map((g, j) => j === i ? { ...g, [f]: v } : g); upProfile('godparents', JSON.stringify(ng)); return ng; });
  };
  const addGodparent = () => setGodparents(prev => { const ng = [...prev, { godfather: '', godmother: '' }]; upProfile('godparents', JSON.stringify(ng)); return ng; });
  const delGodparent = (i: number) => setGodparents(prev => { const ng = prev.filter((_, j) => j !== i); upProfile('godparents', JSON.stringify(ng)); return ng; });
  const updParent = (field: string, val: string) => setParentsData((prev: any) => { const np = { ...prev, [field]: val }; upProfile('parents', JSON.stringify(np)); return np; });

  const welcomeText     = profile.welcomeText?.trim()     || 'Împreună cu familiile noastre';
  const celebrationText = profile.celebrationText?.trim() || 'nunții noastre';
  const rsvpText        = profile.rsvpButtonText?.trim()  || 'Confirmă Prezența';
  const showRsvp        = profile.showRsvpButton !== false;
  const isBaptism       = profile.eventType === 'baptism' || profile.eventType === 'kids';
  const displayBlocks   = editMode ? blocks : blocks.filter(b => b.show !== false);

  const l1 = (profile.partner1Name || 'S').charAt(0).toUpperCase();
  const l2 = isBaptism ? '' : (profile.partner2Name || 'A').charAt(0).toUpperCase();

  const formattedDate = profile.weddingDate
    ? new Date(profile.weddingDate).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Data Evenimentului';

  const sep = (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "center", paddingBottom: 22, flexShrink: 0 }}>
      <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(201,116,144,0.4)" }}/>
      <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(201,116,144,0.4)" }}/>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes bb-float-0{0%,100%{transform:translateY(0) rotate(20deg)}50%{transform:translateY(-12px) rotate(25deg)}}
        @keyframes bb-float-1{0%,100%{transform:translateY(0) rotate(-15deg)}50%{transform:translateY(-8px) rotate(-20deg)}}
        @keyframes bb-float-2{0%,100%{transform:translateY(0) rotate(45deg)}50%{transform:translateY(-15px) rotate(50deg)}}
        @keyframes bb-pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.7);opacity:1}}
        @keyframes bb-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes bb-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      `}</style>

      {editMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-1.5 shadow-xl text-[10px] font-bold pointer-events-none select-none"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(232,160,172,0.4)", color: "#8b5e6b", backdropFilter: "blur(8px)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e8a0ac" }}/>
          <span className="uppercase tracking-widest">Editare Directă</span>
          <span style={{ color: "rgba(139,94,107,0.5)" }} className="font-normal">— click pe orice text</span>
        </div>
      )}

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#fdf8f5 0%,#faf0ee 40%,#fdf5f7 100%)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        fontFamily: SANS, position: "relative", overflow: "hidden",
        paddingTop: editMode ? 56 : 0, paddingBottom: 40,
        opacity: contentVisible ? 1 : 0,
        transform: contentVisible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s",
      }}>

        {/* Ambient blobs */}
        <div style={{ position: "fixed", top: "8%", left: "2%", width: 420, height: 420, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(232,160,172,0.11) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }}/>
        <div style={{ position: "fixed", bottom: "4%", right: "2%", width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(201,116,138,0.09) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }}/>

        <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1, padding: "20px 16px" }}>

          {/* ── HERO CARD ── */}
          <div style={{ background: "rgba(255,255,255,0.88)", borderRadius: 4,
            border: "1px solid rgba(232,160,172,0.28)",
            boxShadow: "0 8px 60px rgba(184,120,140,0.12), 0 2px 12px rgba(184,120,140,0.07)",
            position: "relative", overflow: "hidden", padding: "50px 36px 42px" }}>
            <SplashTopLeft/>
            <SplashBottomRight/>
            <div style={{ position: "absolute", top: 0, left: -10, zIndex: 0 }}><RoseBranch/></div>
            <div style={{ position: "absolute", top: 0, right: -10, zIndex: 0 }}><RoseBranch flip/></div>

            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              {profile.showWelcomeText && (
                <InlineEdit tag="p" editMode={editMode} value={welcomeText} onChange={v => upProfile('welcomeText', v)}
                  placeholder="Text intro..." multiline
                  style={{ fontFamily: SERIF, fontSize: 14, fontStyle: "italic", color: "rgba(139,94,107,0.65)", margin: "0 0 20px", lineHeight: 1.7, display: "block" }}/>
              )}

              <BlockStyleProvider value={{
                fontFamily:    (profile as any).heroFontFamily,
                fontSize:      (profile as any).heroNameSize,
                letterSpacing: (profile as any).heroLetterSpacing,
                lineHeight:    (profile as any).heroLineHeight,
                textColor:     (profile as any).heroTextColor || '#5a3a44',
                textAlign:     ((profile as any).heroAlign as any) || 'center',
              } as BlockStyle}>
              {isBaptism ? (
                <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || ''}
                  onChange={v => upProfile('partner1Name', v)} placeholder="Prenume"
                  style={{ fontFamily: DISPLAY, fontSize: 58, fontWeight: 400, lineHeight: 1, color: "#5a3a44", display: "block", margin: "0 0 8px", letterSpacing: 1 }}/>
              ) : (
                <div style={{ margin: "0 0 8px" }}>
                  <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || ''}
                    onChange={v => upProfile('partner1Name', v)} placeholder="Sofia"
                    style={{ fontFamily: DISPLAY, fontSize: 50, fontWeight: 400, lineHeight: 1.05, color: "#5a3a44", margin: 0, letterSpacing: 2, display: "block" }}/>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "12px 0" }}>
                    <div style={{ flex: 1, height: "0.5px", background: "rgba(201,116,144,0.22)" }}/>
                    <span style={{ fontFamily: SERIF, fontSize: 30, fontStyle: "italic", color: "#c97090", lineHeight: 1 }}>&</span>
                    <div style={{ flex: 1, height: "0.5px", background: "rgba(201,116,144,0.22)" }}/>
                  </div>
                  <InlineEdit tag="h1" editMode={editMode} value={profile.partner2Name || ''}
                    onChange={v => upProfile('partner2Name', v)} placeholder="Andrei"
                    style={{ fontFamily: DISPLAY, fontSize: 50, fontWeight: 400, lineHeight: 1.05, color: "#5a3a44", margin: 0, letterSpacing: 2, display: "block" }}/>
                </div>
              )}
              </BlockStyleProvider>

              {profile.showCelebrationText && (
                <InlineEdit tag="p" editMode={editMode} value={celebrationText} onChange={v => upProfile('celebrationText', v)}
                  placeholder="descriere eveniment..."
                  style={{ fontFamily: SERIF, fontSize: 15, fontStyle: "italic", color: "rgba(90,58,68,0.52)", margin: "12px 0 0", display: "block" }}/>
              )}

              <div style={{ margin: "24px 0 16px" }}><RoseDivider/></div>

              {/* Date */}
              {editMode ? (
                <input type="date" value={profile.weddingDate ? new Date(profile.weddingDate).toISOString().split('T')[0] : ''}
                  onChange={e => upProfile('weddingDate', e.target.value)}
                  style={{ fontFamily: SERIF, fontSize: 15, color: "rgba(90,58,68,0.72)", letterSpacing: "0.06em",
                    background: "transparent", border: "none", borderBottom: "1px solid rgba(201,116,144,0.3)",
                    outline: "none", textAlign: "center", cursor: "pointer", padding: "2px 0", margin: "0 0 22px", display: "block", width: "100%" }}/>
              ) : (
                <p style={{ fontFamily: SERIF, fontSize: 15, color: "rgba(90,58,68,0.72)", letterSpacing: "0.06em",
                  textTransform: "capitalize", margin: "0 0 22px" }}>{formattedDate}</p>
              )}

              {/* Flip countdown */}
              {profile.showCountdown && profile.weddingDate && !countdown.expired && (
                <div style={{ margin: "0 0 24px" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                    <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 800, letterSpacing: "0.4em",
                      textTransform: "uppercase", color: "rgba(139,94,107,0.6)",
                      padding: "4px 14px", borderRadius: 99,
                      background: "rgba(232,160,172,0.1)", border: "1px solid rgba(232,160,172,0.35)" }}>
                      Timp rămas
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 6 }}>
                    {[countdown.days, countdown.hours, countdown.minutes, countdown.seconds].map((v, i) => (
                      <React.Fragment key={i}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                          <FlipDigit value={v}/>
                          <span style={{ fontFamily: SERIF, fontSize: 11, fontStyle: "italic", color: "rgba(139,94,107,0.55)" }}>
                            {['Zile','Ore','Min','Sec'][i]}
                          </span>
                        </div>
                        {i < 3 && sep}
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 12 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c97090",
                      animation: "bb-pulse 2s ease-in-out infinite", opacity: 0.7 }}/>
                    <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(139,94,107,0.4)" }}>live</span>
                  </div>
                </div>
              )}

              <div style={{ margin: "0 0 20px" }}><RoseDivider/></div>

              {/* Guest badge */}
              <div style={{ background: "rgba(232,180,184,0.11)", border: "1px solid rgba(232,160,172,0.28)", borderRadius: 2, padding: "14px 20px" }}>
                <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(139,94,107,0.5)", margin: "0 0 5px" }}>Dragă</p>
                <p style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 400, color: "#5a3a44", margin: 0, letterSpacing: 1 }}>
                  {guest?.name || 'Nume Invitat'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}><Sprig/></div>

          {/* ── BLOCURI ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {displayBlocks.map((block, idx) => {
              const isVisible = block.show !== false;
              const realIdx   = blocks.indexOf(block);

              return (
                <div key={block.id} className={cn("relative group/block", !isVisible && editMode && "opacity-35")}
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
                    <LocCard block={block} editMode={editMode} onUpdate={p => updBlock(realIdx, p)}/>
                  )}

                  {/* NAȘI */}
                  {block.type === 'godparents' && (
                    <div style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)",
                      borderRadius: 4, border: "1px solid rgba(232,160,172,0.25)", padding: "20px 28px", textAlign: "center",
                      boxShadow: "0 4px 24px rgba(184,120,140,0.07)" }}>
                      <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Nașii Noștri'} onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                        style={{ fontFamily: SANS, fontSize: 8, fontWeight: 800, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(139,94,107,0.5)", margin: "0 0 10px", display: "block" }}/>
                      <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..." multiline
                        style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: "rgba(139,94,107,0.6)", margin: "0 0 12px", display: "block" }}/>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {godparents.map((g: any, i: number) => (
                          <div key={i} className={cn("flex items-center justify-center gap-2", editMode && "group/gp")}>
                            <InlineEdit tag="span" editMode={editMode} value={g.godfather || ''} onChange={v => updGodparent(i, 'godfather', v)} placeholder="Naș"
                              style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 400, color: "#5a3a44", letterSpacing: 1 }}/>
                            <span style={{ fontFamily: SERIF, fontStyle: "italic", color: "#c97090", margin: "0 6px" }}>&</span>
                            <InlineEdit tag="span" editMode={editMode} value={g.godmother || ''} onChange={v => updGodparent(i, 'godmother', v)} placeholder="Nașă"
                              style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 400, color: "#5a3a44", letterSpacing: 1 }}/>
                            {editMode && <button type="button" onClick={() => delGodparent(i)} className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400"/></button>}
                          </div>
                        ))}
                        {editMode && <button type="button" onClick={addGodparent} className="text-[10px] text-rose-300 hover:text-rose-500 border border-dashed border-rose-200 rounded-full px-2 py-0.5 flex items-center gap-1 mx-auto transition-colors"><Plus className="w-2.5 h-2.5"/> adaugă</button>}
                      </div>
                    </div>
                  )}

                  {/* PĂRINȚI */}
                  {block.type === 'parents' && (
                    <div style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)",
                      borderRadius: 4, border: "1px solid rgba(232,160,172,0.25)", padding: "20px 28px", textAlign: "center",
                      boxShadow: "0 4px 24px rgba(184,120,140,0.07)" }}>
                      <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Părinții Noștri'} onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                        style={{ fontFamily: SANS, fontSize: 8, fontWeight: 800, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(139,94,107,0.5)", margin: "0 0 10px", display: "block" }}/>
                      <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..." multiline
                        style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: "rgba(139,94,107,0.6)", margin: "0 0 12px", display: "block" }}/>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                        {([
                          { key: 'p1_father', ph: 'Tatăl Miresei' }, { key: 'p1_mother', ph: 'Mama Miresei' },
                          { key: 'p2_father', ph: 'Tatăl Mirelui' }, { key: 'p2_mother', ph: 'Mama Mirelui' },
                        ] as const).map(({ key, ph }) => {
                          const val = parentsData?.[key];
                          if (!val && !editMode) return null;
                          return <InlineEdit key={key} tag="p" editMode={editMode} value={val || ''} onChange={v => updParent(key, v)} placeholder={ph}
                            style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 400, color: "#5a3a44", margin: 0, letterSpacing: 0.5 }}/>;
                        })}
                      </div>
                    </div>
                  )}

                  {/* TEXT */}
                  {block.type === 'text' && (
                    <div style={{ textAlign: "center", padding: "8px 4px" }}>
                      <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(realIdx, { content: v })} placeholder="Scrieți un mesaj..." multiline
                        style={{ fontFamily: SERIF, fontSize: 14, fontStyle: "italic", color: "rgba(90,58,68,0.6)", lineHeight: 1.8 }}/>
                    </div>
                  )}

                  {/* TITLU */}
                  {block.type === 'title' && (
                    <div style={{ textAlign: "center", padding: "4px 0" }}>
                      <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(realIdx, { content: v })} placeholder="Titlu secțiune..."
                        style={{ fontFamily: SANS, fontSize: 8, fontWeight: 800, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(139,94,107,0.5)" }}/>
                    </div>
                  )}

                  {block.type === 'divider' && <RoseDivider/>}
                  {block.type === 'spacer'  && <div style={{ height: 16 }}/>}

                  {/* FOTO */}
                  {block.type === 'photo' && (
                    <PhotoBlock
                      imageData={block.imageData} altText={block.altText} editMode={editMode}
                      onUpload={data => updBlock(realIdx, { imageData: data })}
                      onRemove={() => updBlock(realIdx, { imageData: undefined })}
                      onRatioChange={r => updBlock(realIdx, { aspectRatio: r })}
                      onClipChange={cl => updBlock(realIdx, { photoClip: cl as any })}
                      onMasksChange={ms => updBlock(realIdx, { photoMasks: ms as any })}
                      aspectRatio={(block.aspectRatio as any) || 'free'}
                      photoClip={((block as any).photoClip as ClipShape) || 'rect'}
                      photoMasks={((block as any).photoMasks as MaskEffect[]) || []}
                      placeholderInitial1={(profile.partner1Name || 'S')[0]}
                      placeholderInitial2={(profile.partner2Name || 'A')[0]}
                      placeholderVariant={realIdx % 4}
                    />
                  )}
                  </BlockStyleProvider>
                </div>
              );
            })}
          </div>

          {/* Add block strip */}
          {editMode && (
            <div className="text-center mt-4 py-4 border-2 border-dashed border-rose-100 hover:border-rose-200 rounded transition-colors">
              <p className="text-[9px] uppercase tracking-widest mb-2.5 font-bold" style={{ color: "rgba(139,94,107,0.4)", fontFamily: SANS }}>Adaugă bloc</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { type: 'location',   label: 'Locație',  def: { label: '', time: '', locationName: '', locationAddress: '', wazeLink: '' } },
                  { type: 'godparents', label: 'Nași',     def: { sectionTitle: 'Nașii Noștri', content: '' } },
                  { type: 'parents',    label: 'Părinți',  def: { sectionTitle: 'Părinții Noștri', content: '' } },
                  { type: 'text',       label: 'Text',     def: { content: '' } },
                  { type: 'title',      label: 'Titlu',    def: { content: '' } },
                  { type: 'divider',    label: 'Linie',    def: {} },
                  { type: 'photo',      label: 'Foto',     def: { aspectRatio: 'free', photoClip: 'rect', photoMasks: [] } },
                ].map(({ type, label, def }) => (
                  <button key={type} type="button" onClick={() => addBlock(type, def)}
                    className="px-3 py-1 text-[10px] font-bold border rounded-full transition-all"
                    style={{ color: "#8b5e6b", borderColor: "rgba(232,160,172,0.5)", fontFamily: SANS }}>
                    + {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {profile.showTimeline && timeline.length > 0 && (
            <div style={{ marginTop: 8, background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)",
              borderRadius: 4, border: "1px solid rgba(232,160,172,0.25)", padding: "20px 28px",
              boxShadow: "0 4px 24px rgba(184,120,140,0.07)" }}>
              <p style={{ fontFamily: SANS, fontSize: 8, fontWeight: 800, letterSpacing: "0.4em", textTransform: "uppercase",
                color: "rgba(139,94,107,0.5)", textAlign: "center", margin: "0 0 18px" }}>Programul Zilei</p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {timeline.map((item: any, i: number) => (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "58px 52px 1fr", alignItems: "stretch", minHeight: 46 }}>
                    {/* Time */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 10 }}>
                      <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: BLUSH_D }}>{item.time}</span>
                    </div>
                    {/* Icon column */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#fdf8f5",
                        border: `1.5px solid ${BLUSH_L}`, boxShadow: `0 2px 8px rgba(232,160,172,0.18)`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        color: BLUSH_D }}>
                        
                      </div>
                      {i < timeline.length - 1 && (
                        <div style={{ flex: 1, width: "0.6px", background: `rgba(232,160,172,0.25)`, marginTop: 2, marginBottom: 2 }}/>
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ paddingLeft: 10, paddingTop: 10, paddingBottom: i < timeline.length - 1 ? 16 : 0 }}>
                      <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: "rgba(90,58,68,0.85)", display: "block" }}>{item.title}</span>
                      {item.notice && <span style={{ fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: BLUSH_D, display: "block", marginTop: 2 }}>{item.notice}</span>}
                      {item.location && <span style={{ fontFamily: SANS, fontSize: 11, color: MUTED, display: "block", marginTop: 2 }}>{item.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RSVP */}
          {showRsvp && (
            <div style={{ marginTop: 8 }}>
              {editMode ? (
                <div style={{ width: "100%", padding: "18px 24px", borderRadius: 4, textAlign: "center",
                  background: "linear-gradient(135deg,#c97090 0%,#a85570 60%,#8b3d5a 100%)" }}>
                  <InlineEdit tag="span" editMode={editMode} value={rsvpText} onChange={v => upProfile('rsvpButtonText', v)}
                    style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "white", cursor: "text" }}/>
                </div>
              ) : (
                <button onClick={() => onOpenRSVP && onOpenRSVP()} style={{ width: "100%", padding: "18px 24px",
                  background: "linear-gradient(135deg,#c97090 0%,#a85570 60%,#8b3d5a 100%)",
                  border: "none", borderRadius: 4, cursor: "pointer",
                  fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.35em",
                  textTransform: "uppercase", color: "white",
                  boxShadow: "0 8px 28px rgba(168,85,112,0.32), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                  {rsvpText}
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <RoseDivider/>
            <p style={{ fontFamily: SERIF, fontSize: 11, fontStyle: "italic", color: "rgba(139,94,107,0.38)", marginTop: 12 }}>
              cu drag · WeddingPro
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default BlushBloomTemplate;
