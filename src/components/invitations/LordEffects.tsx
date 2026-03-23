import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WeddingIcon } from "../TimelineIcons";
gsap.registerPlugin(ScrollTrigger);
import { BlockStyleProvider, BlockStyle } from '../BlockStyleContext';
import { CastleColorTheme, getLordTheme } from './castleDefaults';

import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus,
  Upload, Camera, Play, Pause, SkipForward, SkipBack,
  MapPin, Gift, Music, Heart, Sparkles, MessageCircle, Image as ImageIcon,
  Cross,
  Check
} from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import FlipClock from "./FlipClock";

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

export const meta: TemplateMeta = {
  id: 'lord-effects',
  name: 'Lord Effects',
  category: 'wedding',
  tags: ['wedding'],
  description: 'Elegant wedding design in monochrome tones, with ivory glow doors.',
  colors: ['#faf7f2', '#161616', '#d9d1c5'],
  previewClass: "bg-stone-50 border-stone-200",
  elementsClass: "bg-stone-500",
};

// Runtime color vars - fixed monochrome palette for this template
let PINK_DARK = '#161616';
let PINK_D    = '#2c2c2c';
let PINK_L    = '#d9d1c5';
let PINK_XL   = '#faf7f2';
let CREAM     = '#f3eee6';
let TEXT      = '#171717';
let MUTED     = '#6c645b';
let GOLD      = '#ece4d8';

const SERIF = "'Poppins', sans-serif";
const SCRIPT = "'Montserrat', cursive";
const SANS   = "'Montserrat', sans-serif";
const INTO_TEXT = "'ROMANTIC', cursive";
const HeroText = "'Cormorant Garamond', serif"
// ── Music player ──────────────────────────────────────────────────────────────
declare global { interface Window { YT: any; onYouTubeIframeAPIReady: () => void; } }
let ytApiLoaded_cm  = false;
let ytApiLoading_cm = false;
const ytReadyCbs_cm: Array<() => void> = [];
function loadYtApi_cm(cb: () => void) {
  if (ytApiLoaded_cm && window.YT?.Player) { cb(); return; }
  ytReadyCbs_cm.push(cb);
  if (ytApiLoading_cm) return;
  ytApiLoading_cm = true;
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
  window.onYouTubeIframeAPIReady = () => {
    ytApiLoaded_cm = true;
    ytReadyCbs_cm.forEach(fn => fn());
    ytReadyCbs_cm.length = 0;
  };
}
function extractYtId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

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

  // YouTube player removed — audio is now downloaded server-side

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
      if (!res.ok) throw new Error('Upload eșuat');
      const { url } = await res.json();
      onUpdate({ musicUrl: url, musicType: 'mp3' });
      deleteUploadedFile; // keeps the import used
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
      setYtError(e.message || 'Nu s-a putut descărca melodia.');
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
      <style>{`@keyframes cm-bar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}`}</style>
      {block.musicType === 'mp3' && block.musicUrl && (
        <audio ref={audioRef} src={block.musicUrl} preload="metadata" />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isPlaying ? PINK_DARK : PINK_XL, border: `1.5px solid ${isPlaying ? PINK_DARK : PINK_L}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
          <Music className="w-4 h-4" style={{ color: isPlaying ? 'white' : PINK_DARK }} />
        </div>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: isPlaying ? PINK_DARK : MUTED, transition: 'color 0.3s' }}>
          {isPlaying ? 'Se redă acum' : 'Melodia Zilei'}
        </span>
        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14, marginLeft: 'auto' }}>
            {[0, 0.2, 0.1, 0.3].map((delay, i) => (
              <div key={i} style={{ width: 3, height: 14, background: PINK_DARK, borderRadius: 2, transformOrigin: 'bottom', animation: `cm-bar 0.7s ease-in-out ${delay}s infinite` }} />
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
              {ytDownloading && <p style={{ fontFamily: SANS, fontSize: 9, color: PINK_DARK, margin: 0, textAlign: 'center', letterSpacing: '0.1em' }}>⏳ Se descarcă melodia de pe YouTube...</p>}
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
          <p style={{ fontFamily: SERIF, fontSize: 12, fontStyle: 'italic', color: MUTED, margin: 0 }}>Melodia va apărea aici</p>
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
                Schimbă sursa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Decorative ────────────────────────────────────────────────────────────────
const CastleSparkles: React.FC<{ flip?: boolean; scale?: number; style?: React.CSSProperties }> = ({ flip, scale = 1, style }) => (
  <svg viewBox="0 0 200 200" fill="none" style={{ width: 200 * scale, height: 200 * scale, pointerEvents: 'none', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
    <g opacity="0.6">
      <circle cx="100" cy="100" r="2" fill={PINK_DARK}><animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite" /></circle>
      <path d="M100 80 L100 120 M80 100 L120 100" stroke={PINK_DARK} strokeWidth="0.5" />
      <circle cx="40" cy="60" r="1.5" fill={PINK_DARK} />
      <circle cx="160" cy="140" r="1" fill={PINK_DARK} />
      <circle cx="150" cy="50" r="2" fill={PINK_DARK} />
    </g>
  </svg>
);

const WazeButton: React.FC<{
  wazeLink: string;
  editMode: boolean;
  onChange: (v: string) => void;
}> = ({ wazeLink, editMode, onChange }) => {
  const [open, setOpen] = React.useState(false);

  if (editMode && open) {
    return (
      <div style={{ paddingTop: 16, borderTop: `1px solid ${PINK_L}44` }}>
        <input
          autoFocus
          defaultValue={wazeLink}
          onBlur={e => { onChange(e.target.value); setOpen(false); }}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setOpen(false); }}
          placeholder="https://waze.com/ul?ll=..."
          style={{
            width: '100%', fontFamily: SANS, fontSize: '0.65rem',
            border: `1.5px solid ${PINK_L}`, borderRadius: 12,
            padding: '10px 14px', outline: 'none', color: TEXT,
            background: PINK_XL, boxSizing: 'border-box' as const,
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 16, borderTop: `1px solid ${PINK_L}44`, display: 'flex', justifyContent: 'center' }}>
      {wazeLink ? (
        <a
          href={wazeLink} target="_blank" rel="noopener noreferrer"
          onClick={editMode ? (e) => { e.preventDefault(); setOpen(true); } : undefined}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px 0',
            background: PINK_XL, border: `1.5px solid ${PINK_L}`,
            borderRadius: 14, textDecoration: 'none',
            fontFamily: SANS, fontSize: '0.65rem', fontWeight: 700,
            color: PINK_DARK, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20.54 7.037C19.44 3.96 16.51 2 13.24 2c-4.41 0-8 3.36-8.12 7.77-.06 2.36.82 4.6 2.46 6.27l.67.69c.38.4.6.93.6 1.49v.77h1v2h4v-2h1v-.77c0-.56.22-1.1.6-1.49l.66-.68a8.14 8.14 0 0 0 2.29-4.11.86.86 0 0 0 .03-.23 8.01 8.01 0 0 0 2.1-4.67z" fill={PINK_DARK} opacity="0.2"/>
            <circle cx="9.5" cy="11.5" r="1.5" fill={PINK_DARK}/>
            <circle cx="14.5" cy="11.5" r="1.5" fill={PINK_DARK}/>
            <path d="M10 15s.75 1 2 1 2-1 2-1" stroke={PINK_DARK} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Deschide în Waze
        </a>
      ) : editMode ? (
        <button type="button" onClick={() => setOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px 0',
            background: 'transparent', border: `1.5px dashed ${PINK_L}`,
            borderRadius: 14, cursor: 'pointer',
            fontFamily: SANS, fontSize: '0.6rem', fontWeight: 700,
            color: MUTED, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
          }}>
          + Adaugă link Waze
        </button>
      ) : null}
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
    heart: { clipPath: 'url(#cm-clip-heart)' }, diagonal: { clipPath: 'polygon(0 0,100% 0,100% 80%,0 100%)' },
    'diagonal-r': { clipPath: 'polygon(0 0,100% 0,100% 100%,0 80%)' },
    'wave-b': { clipPath: 'url(#cm-clip-wave-b)' }, 'wave-t': { clipPath: 'url(#cm-clip-wave-t)' },
    'wave-both': { clipPath: 'url(#cm-clip-wave-both)' },
    blob: { clipPath: 'url(#cm-clip-blob)' }, blob2: { clipPath: 'url(#cm-clip-blob2)' },
    blob3: { clipPath: 'url(#cm-clip-blob3)' }, blob4: { clipPath: 'url(#cm-clip-blob4)' },
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
      <clipPath id="cm-clip-wave-b" clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="cm-clip-wave-t" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath>
      <clipPath id="cm-clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="cm-clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath>
      <clipPath id="cm-clip-blob" clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath>
      <clipPath id="cm-clip-blob2" clipPathUnits="objectBoundingBox"><path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z"/></clipPath>
      <clipPath id="cm-clip-blob3" clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath>
      <clipPath id="cm-clip-blob4" clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath>
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
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="p-2 bg-white rounded-full text-pink-600"><Camera className="w-5 h-5"/></button>
            <button onClick={() => { deleteUploadedFile(imageData); onRemove(); }} className="p-2 bg-white rounded-full text-red-600"><Trash2 className="w-5 h-5"/></button>
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
                <span style={{ fontFamily: SCRIPT, fontSize: 48, color: 'white' }}>{(placeholderInitial1 || 'M')[0].toUpperCase()}</span>
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
    <div style={{ background: 'white', borderRadius: 16, padding: 24, textAlign: 'center', border: `1px solid ${PINK_L}` }}>
      <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: PINK_DARK, marginBottom: 16 }}>{monthNames[month]} {year}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
        {dayLabels.map((l, i) => <div key={`${l}-${i}`} style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>{l}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {cells.map((cell, i) => {
          const isToday = cell === day;
          return <div key={i} style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: isToday ? 700 : 400, color: isToday ? 'white' : cell ? TEXT : 'transparent', background: isToday ? PINK_DARK : 'transparent', borderRadius: '50%' }}>{cell || ''}</div>;
        })}
      </div>
    </div>
  );
};

// ── Countdown ─────────────────────────────────────────────────────────────────
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
const CountdownSection: React.FC<{ date: string | undefined }> = ({ date }) => {
  const cd = useCountdown(date || '');
  if (!date || cd.expired) return null;
  return (
    <div style={{ background: PINK_DARK, borderRadius: 16, padding: 24, textAlign: 'center', color: 'white' }}>
      <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', marginBottom: 16 }}>AU MAI RĂMAS</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
        {[{ v: cd.days, l: 'ZILE' }, { v: cd.hours, l: 'ORE' }, { v: cd.minutes, l: 'MIN' }, { v: cd.seconds, l: 'SEC' }].map((x, i) => (
          <div key={i}>
            <span style={{ fontSize: 32, fontWeight: 300, display: 'block' }}>{String(x.v).padStart(2, '0')}</span>
            <span style={{ fontSize: 8, fontWeight: 700, opacity: 0.7 }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Reveal ────────────────────────────────────────────────────────────────────
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setVis(true), delay); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)', transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
};

// ── Misc UI ───────────────────────────────────────────────────────────────────
const WildDivider = () => (
  <div className="flex items-center gap-4">
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${PINK_L}, transparent)` }} />
    <Sparkles className="w-4 h-4 opacity-60" style={{ color: PINK_DARK }} />
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${PINK_L}, transparent)` }} />
  </div>
);

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
const LocCard: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void }> = ({ block, editMode, onUpdate }) => (
  <div style={{ background: 'white', border: `1px solid ${PINK_L}`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
    <MapPin className="w-8 h-8 text-pink-500 mx-auto mb-4" />
    <InlineEdit tag="h3" editMode={editMode} value={block.locationName || ''} onChange={v => onUpdate({ locationName: v })} placeholder="Locație..." style={{ fontFamily: SCRIPT, fontSize: 32, color: PINK_DARK, marginBottom: 8 }} />
    <InlineEdit tag="p" editMode={editMode} value={block.locationAddress || ''} onChange={v => onUpdate({ locationAddress: v })} placeholder="Adresă..." multiline style={{ fontFamily: SANS, fontSize: 12, color: MUTED, lineHeight: 1.6 }} />
    <div className="mt-4"><InlineWaze value={block.wazeLink || ''} onChange={v => onUpdate({ wazeLink: v })} editMode={editMode} /></div>
  </div>
);

// ── Profile Image Upload ───────────────────────────────────────────────────────
const ProfileImageUpload: React.FC<{ url?: string; onUpload: (url: string) => void; onRemove: () => void; label: string; editMode: boolean; className?: string; aspectRatio?: string }> =
  ({ url, onUpload, onRemove, label, editMode, className, aspectRatio = "aspect-video" }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true); deleteUploadedFile(url);
    try {
      const form = new FormData(); form.append('file', file);
      const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${_s?.token || ''}` }, body: form });
      const { url: newUrl } = await res.json(); onUpload(newUrl);
    } catch {} finally { setUploading(false); }
  };
  if (!editMode && !url) return null;
  return (
    <div className={cn("relative group", className)}>
      {url ? (
        <div className={cn("relative overflow-hidden rounded-lg", aspectRatio)}>
          <img src={url} alt={label} className="w-full h-full object-cover" />
          {editMode && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => fileRef.current?.click()} className="p-2 bg-white rounded-full text-pink-600"><Camera className="w-5 h-5" /></button>
              <button onClick={onRemove} className="p-2 bg-white rounded-full text-red-600"><Trash2 className="w-5 h-5" /></button>
            </div>
          )}
        </div>
      ) : editMode && (
        <button onClick={() => fileRef.current?.click()} className={cn("w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-pink-200 rounded-lg bg-pink-50/50 hover:bg-pink-50 transition-colors", aspectRatio)}>
          {uploading ? <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-6 h-6 text-pink-400" /><span className="text-xs font-bold text-pink-500 uppercase tracking-widest">{label}</span></>}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
};

// ── Door hint ─────────────────────────────────────────────────────────────────
const DoorHint: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
    <style>{`
      @keyframes dh-chevron { 0%{opacity:0;transform:translateX(var(--dx,0))} 40%{opacity:1} 80%{opacity:1} 100%{opacity:0;transform:translateX(var(--dx2,0))} }
      @keyframes dh-dot { 0%{transform:translateY(0);opacity:1} 55%{transform:translateY(11px);opacity:0.15} 56%{transform:translateY(0);opacity:0} 80%{opacity:1} 100%{opacity:1} }
    `}</style>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0,1,2].map(i => (<svg key={i} width="9" height="15" viewBox="0 0 9 15" style={{ animation: `dh-chevron 1.5s ease-in-out ${i*0.13}s infinite`, '--dx': '4px', '--dx2': '-5px' } as any}><polyline points="7,1 2,7.5 7,14" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>))}
      </div>
      <div style={{ width: 24, height: 38, borderRadius: 12, border: '2px solid rgba(255,255,255,0.85)', boxShadow: '0 0 16px rgba(244,114,182,0.45)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 3, height: 7, borderRadius: 2, background: 'white', animation: 'dh-dot 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[2,1,0].map(i => (<svg key={i} width="9" height="15" viewBox="0 0 9 15" style={{ animation: `dh-chevron 1.5s ease-in-out ${i*0.13}s infinite`, '--dx': '-4px', '--dx2': '5px' } as any}><polyline points="2,1 7,7.5 2,14" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>))}
      </div>
    </div>
  </div>
);

// ── Sun Rays ──────────────────────────────────────────────────────────────────
// Raze de soare care emană din cusătura dintre uși (linie verticală → raze orizontale)
const DoorSeam: React.FC<{ side: 'left' | 'right'; seamColor?: string; glowColor?: string }> = ({ side, seamColor = '#ffffff' }) => (
  <div style={{
    position: 'absolute', top: 0,
    right: side === 'left' ? '0px' : 'auto',
    left: side === 'right' ? '-2px' : 'auto',
    width: 2, height: '100%',
    pointerEvents: 'none', overflow: 'visible', zIndex: 20,
  }}>
    <style>{`
      @keyframes seam-pulse { 0%,100%{opacity:.88} 50%{opacity:1} }
      @keyframes seam-halo  { 0%,100%{opacity:.65} 50%{opacity:.95} }
    `}</style>

    {/* Linia centrală — albă, 100% opacitate */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: side === 'left' ? '100%' : 0,
      width: 3,
      height: '100%',
      background: `linear-gradient(to bottom,
        transparent 0%,
        #ffffff 6%,
        #ffffff 94%,
        transparent 100%)`,
      boxShadow: `
        0 0  6px  3px #ffffffee,
        0 0 18px  8px #ffffffcc,
        0 0 45px 18px #ffffffaa,
        0 0 90px 35px #ffffff77`,
      animation: 'seam-pulse 2.8s ease-in-out infinite',
    }} />

    {/* Halo interior larg — glow care se extinde în ușă */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 220,
      height: '100%',
      transform: side === 'left' ? 'translateX(-100%)' : 'translateX(0%)',
      background: side === 'left'
        ? `linear-gradient(to left,  #ffffff 0%, #ffffffcc 3%, #ffffff88 10%, #ffffff33 30%, #ffffff11 55%, transparent 100%)`
        : `linear-gradient(to right, #ffffff 0%, #ffffffcc 3%, #ffffff88 10%, #ffffff33 30%, #ffffff11 55%, transparent 100%)`,
      filter: 'blur(8px)',
      animation: 'seam-halo 2.8s ease-in-out infinite',
      pointerEvents: 'none',
    }} />

    {/* Halo exterior difuz — glow mare, moale */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 400,
      height: '100%',
      transform: side === 'left' ? 'translateX(-100%)' : 'translateX(0%)',
      background: side === 'left'
        ? `linear-gradient(to left,  #ffffff55 0%, #ffffff22 20%, #ffffff0a 45%, transparent 100%)`
        : `linear-gradient(to right, #ffffff55 0%, #ffffff22 20%, #ffffff0a 45%, transparent 100%)`,
      filter: 'blur(28px)',
      animation: 'seam-halo 2.8s ease-in-out infinite',
      pointerEvents: 'none',
    }} />
  </div>
);

const CastleOverlayText: React.FC<{
  childName: string; subtitle: string; welcomeText: string;
  partner2Name?: string; isWedding?: boolean;
  editMode?: boolean; overlayRef?: React.RefObject<HTMLDivElement>;
  nameRef?: React.RefObject<HTMLDivElement>; inviteRef?: React.RefObject<HTMLDivElement>;
  onChildNameChange?: (v: string) => void; onSubtitleChange?: (v: string) => void; onWelcomeChange?: (v: string) => void;
  inviteTop?: string; inviteMiddle?: string; inviteBottom?: string; inviteTag?: string; dateStr?: string;
  onInviteTopChange?: (v: string) => void; onInviteMiddleChange?: (v: string) => void; onInviteBottomChange?: (v: string) => void; onInviteTagChange?: (v: string) => void;
  themeColors?: { pinkDark: string; pinkL: string; pinkXL: string; gold: string };
}> = ({ childName, subtitle, welcomeText, partner2Name, isWedding, editMode, overlayRef, nameRef, inviteRef,
        onChildNameChange, onSubtitleChange, onWelcomeChange,
        inviteTop, inviteMiddle, inviteBottom, inviteTag, dateStr,
        onInviteTopChange, onInviteMiddleChange, onInviteBottomChange, onInviteTagChange,
        themeColors }) => {
  const tc = themeColors ?? { pinkDark: '#be185d', pinkL: '#fbcfe8', pinkXL: '#fff5f7', gold: '#d4af37' };
  // Shadow negru consistent pentru lizibilitate pe orice fundal
  const S = '0 2px 8px rgba(0,0,0,0.95), 0 4px 24px rgba(0,0,0,0.8)';

  // Inițialele pentru nuntă: primul caracter din fiecare nume
  const initial1 = (childName || 'E').trim().charAt(0).toUpperCase();
  const initial2 = (partner2Name || 'A').trim().charAt(0).toUpperCase();

  return (
  <div ref={overlayRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15, pointerEvents: editMode ? 'auto' : 'none' }}>
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0,0,0,0.15) 0%, transparent 100%)' }} />
    <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
      {editMode ? (
        <InlineEdit tag="p" editMode value={welcomeText} onChange={v => onWelcomeChange?.(v)} textKey="intro:welcome" textLabel="Intro Welcome" style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#ffffff', textShadow: S }} />
      ) : (
        <svg width="290" height="74" viewBox="0 0 290 74" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
          <defs>
            <path id="castleArc" d="M 22,68 A 122,122 0 0,1 268,68" />
            <filter id="castleGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <text filter="url(#castleGlow)" fontFamily="Cinzel, serif" fontSize="30" fontWeight="700" letterSpacing="11" fill="#ffffff">
            <textPath href="#castleArc" startOffset="50%" textAnchor="middle">{welcomeText}</textPath>
          </text>
        </svg>
      )}
    </div>

    {/* Phase 1 label (edit only) */}
    {editMode && <div style={{ position: 'absolute', top: '1%', left: 0, right: 0, textAlign: 'center', zIndex: 20, pointerEvents: 'none' }}><span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: `${tc.gold}cc`, background: 'rgba(0,0,0,0.35)', borderRadius: 99, padding: '2px 10px' }}>TEXT UȘI — FAZA 1</span></div>}

    {/* Phase 1: name / monogramă nuntă */}
    <div ref={nameRef} style={{ position: 'absolute', top: editMode ? '18%' : '50%', left: 0, right: 0, transform: editMode ? 'none' : 'translateY(-50%)', textAlign: 'center', zIndex: 1, padding: '0 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', opacity: editMode ? 0.45 : 1 }}>

      {isWedding ? (
        /* ── Monogramă nuntă ── */
        <>
          <style>{`
            @keyframes mono-ray-spin {
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
            @keyframes mono-glow-pulse { 0%,100%{opacity:0.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
            @keyframes mono-amp-pulse  { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.03)} }
          `}</style>

          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* Raze de soare SVG — rotite lent */}
            {/* <svg
              width="320" height="320" viewBox="-160 -160 320 320"
              style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              animation: 'mono-ray-spin 28s linear infinite',
              pointerEvents: 'none',
            }}
            >
              {Array.from({ length: 18 }, (_, i) => {
                const angle = (i / 18) * Math.PI * 2;
                const innerR = 72 + (i % 3) * 6;
                const outerR = 118 + (i % 4) * 14;
                const w = i % 3 === 0 ? 2.5 : 1.2;
                const op = i % 3 === 0 ? 0.55 : 0.25;
                const x1 = Math.cos(angle) * innerR;
                const y1 = Math.sin(angle) * innerR;
                const x2 = Math.cos(angle) * outerR;
                const y2 = Math.sin(angle) * outerR;
                return (
                  <line key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#ffffff"
                    strokeWidth={w}
                    strokeOpacity={op}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg> */}

            {/* Halo difuz mare */}
            <div style={{
              position: 'absolute',
              width: 200, height: 200,
              borderRadius: '50%',
              background: `radial-gradient(ellipse, #ffffff22 0%, #ffffff0f 40%, transparent 72%)`,
              animation: 'mono-glow-pulse 3.2s ease-in-out infinite',
              pointerEvents: 'none',
            }} />

            {/* Inițialele */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.1em', zIndex: 2 }}>
              {/* Inițiala 1 */}
              <span style={{
                fontFamily: INTO_TEXT,
                fontSize: '6.5rem',
                lineHeight: 1,
                color: '#ffffff',
                textShadow: S,
                animation: 'mono-amp-pulse 3.2s ease-in-out infinite',
                display: 'inline-block',
              }}>{initial1}</span>

              {/* & central */}
              <span style={{
                fontFamily: 'Great Vibes, cursive',
                fontSize: '2.8rem',
                lineHeight: 1,
                color: '#ffffff',
                margin: '0 0.15em',
                textShadow: S,
                opacity: 0.9,
                display: 'inline-block',
                transform: 'translateY(0.15em)',
              }}>&amp;</span>

              {/* Inițiala 2 */}
              <span style={{
                fontFamily: INTO_TEXT,
                fontSize: '6.5rem',
                lineHeight: 1,
                color: '#ffffff',
                textShadow: S,
                animation: 'mono-amp-pulse 3.2s ease-in-out infinite',
                display: 'inline-block',
              }}>{initial2}</span>
            </div>
          </div>

          {/* Subtitlu nuntă */}
          <InlineEdit tag="p" editMode={!!editMode} value={subtitle} onChange={v => onSubtitleChange?.(v)} textKey="intro:subtitle" textLabel="Intro Subtitle"
            style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#ffffff', textShadow: S, marginTop: 4, opacity: 0.9 }} />
        </>
      ) : (
        /* ── Botez — afișare originală ── */
        <>
          <InlineEdit tag="h2" editMode={!!editMode} value={childName} onChange={v => onChildNameChange?.(v)} textKey="intro:name" textLabel="Intro Name" style={{ fontFamily: INTO_TEXT, fontSize: '5.2rem', lineHeight: 1.15, color: '#ffffff', textShadow: S, margin: '2px auto 0', maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word', textWrap: 'balance' }} />
          <InlineEdit tag="p" editMode={!!editMode} value={subtitle} onChange={v => onSubtitleChange?.(v)} textKey="intro:subtitle" textLabel="Intro Subtitle" style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ffffff', textShadow: S, marginTop: 2 }} />
        </>
      )}
    </div>

    {/* Phase 2 label (edit only) */}
    {editMode && <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center', zIndex: 20, pointerEvents: 'none' }}><span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: tc.gold, background: 'rgba(0,0,0,0.4)', borderRadius: 99, padding: '2px 10px' }}>TEXT EFECT SCROLL — FAZA 2 ✎</span></div>}

    {/* Phase 2: invitation text */}
    <div ref={inviteRef} style={{ position: 'absolute', top: editMode ? '52%' : '50%', left: 0, right: 0, transform: editMode ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.88)', textAlign: 'center', zIndex: 1, padding: '0 36px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: editMode ? 1 : 0, pointerEvents: editMode ? 'auto' : 'none' }}>
      <InlineEdit tag="p" editMode={!!editMode} value={inviteTop || 'Cu bucurie vă anunțăm'} onChange={v => onInviteTopChange?.(v)} textKey="intro:inviteTop" textLabel="Intro Top"
        style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#ffffff', textShadow: S, margin: 0 }} />
      <InlineEdit tag="p" editMode={!!editMode} value={inviteMiddle || dateStr || 'Data Evenimentului'} onChange={v => onInviteMiddleChange?.(v)} textKey="intro:inviteMiddle" textLabel="Intro Middle"
        style={{ fontFamily: 'Great Vibes, cursive', fontSize: '2.6rem', lineHeight: 1.2, color: '#ffffff', textShadow: S, margin: 0 }} />
      <InlineEdit tag="p" editMode={!!editMode} value={inviteBottom || 'a fost botezat'} onChange={v => onInviteBottomChange?.(v)} textKey="intro:inviteBottom" textLabel="Intro Bottom"
        style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', fontWeight: 400, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#ffffff', textShadow: S, margin: 0, lineHeight: 2 }} />
      <InlineEdit tag="p" editMode={!!editMode} value={inviteTag || '✦ deschide porțile ✦'} onChange={v => onInviteTagChange?.(v)} textKey="intro:inviteTag" textLabel="Intro Tag"
        style={{ fontFamily: 'Cinzel, serif', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.6em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', textShadow: S, margin: '2px 0 0' }} />
    </div>
  </div>
  );
};


// ── Castle Intro ──────────────────────────────────────────────────────────────
const CastleIntro: React.FC<{
  onDone: () => void; castleUrl?: string; castleUrlMobile?: string;
  editMode?: boolean; contentEl?: HTMLElement | null;
  scrollContainer?: HTMLElement | null;
  previewMode?: 'doors' | 'static';
  childName?: string; partner2Name?: string; isWedding?: boolean;
  subtitle?: string; welcomeText?: string;
  inviteTop?: string; inviteMiddle?: string; inviteBottom?: string; inviteTag?: string; dateStr?: string;
  onChildNameChange?: (v: string) => void; onSubtitleChange?: (v: string) => void; onWelcomeChange?: (v: string) => void;
  onInviteTopChange?: (v: string) => void; onInviteMiddleChange?: (v: string) => void; onInviteBottomChange?: (v: string) => void; onInviteTagChange?: (v: string) => void;
  onDoorsOpen?: () => void;
  themeColors?: { pinkDark: string; pinkL: string; pinkXL: string; gold: string };
}> = ({ onDone, castleUrl, castleUrlMobile, editMode, contentEl, scrollContainer,
        previewMode = 'doors', childName = '', partner2Name = '', isWedding = false, subtitle = 'in my castle', welcomeText = 'WELCOME',
        inviteTop, inviteMiddle, inviteBottom, inviteTag, dateStr,
        onChildNameChange, onSubtitleChange, onWelcomeChange,
        onInviteTopChange, onInviteMiddleChange, onInviteBottomChange, onInviteTagChange,
        onDoorsOpen, themeColors }) => {
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
    if (hintRef.current)    tl.to(hintRef.current,    { opacity: 0, ease: 'none', duration: 0.2 }, 0);
    if (overlayRef.current) tl.to(overlayRef.current, { opacity: 0, ease: 'none', duration: 0.3 }, 0);
    if (seamRef.current) {
      tl.to(seamRef.current,  { opacity: 1, ease: 'none', duration: 0.08 }, 0);
      tl.to(seamRef.current,  { opacity: 0, ease: 'power2.in', duration: 0.25 }, 0.75);
    }
    if (seamRef2.current) {
      tl.to(seamRef2.current, { opacity: 1, ease: 'none', duration: 0.08 }, 0);
      tl.to(seamRef2.current, { opacity: 0, ease: 'power2.in', duration: 0.25 }, 0.75);
    }

    const DEAD = 60 / 160;
    const textTl = gsap.timeline({ paused: true });
    if (nameRef.current) {
      textTl.to(nameRef.current, { opacity: 0, scale: 0.82, ease: 'power2.in', duration: 1 });
    }
    if (inviteRef.current) {
      textTl.fromTo(inviteRef.current,
        { opacity: 0, scale: 0.82 },
        { opacity: 1, scale: 1, ease: 'power2.out', duration: 1 }
      );
    }

    let _musicFired = false;
    const st = ScrollTrigger.create({
      trigger: contentEl,
      scroller: scrollContainer || undefined,
      start: 'top top',
      end: '+=500%',
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (self.progress <= DEAD) {
          textTl.progress(self.progress / DEAD);
          tl.progress(0);
        } else {
          textTl.progress(1);
          const p = (self.progress - DEAD) / (1 - DEAD);
          tl.progress(p);
          if (!_musicFired && p > 0.05) { _musicFired = true; onDoorsOpen?.(); }
        }
      },
      onLeave: () => { if (wrapRef.current) wrapRef.current.style.display = 'none'; },
      onEnterBack: () => {
        _musicFired = false;
        if (wrapRef.current) wrapRef.current.style.display = 'block';
        textTl.progress(0);
        if (nameRef.current)   gsap.set(nameRef.current,   { opacity: 1, scale: 1 });
        if (inviteRef.current) gsap.set(inviteRef.current, { opacity: 0, scale: 0.88 });
      },
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { st.kill(); tl.kill(); gsap.set(contentEl, { clearProps: 'all' }); };
  }, [editMode, contentEl, scrollContainer]);

  const defaultCastle = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%231a0a1e'/%3E%3Cstop offset='0.4' stop-color='%23380d3f'/%3E%3Cstop offset='1' stop-color='%23be185d'/%3E%3C/linearGradient%3E%3ClinearGradient id='glow' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23fdf2f8' stop-opacity='0.12'/%3E%3Cstop offset='1' stop-color='%23be185d' stop-opacity='0.35'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23sky)'/%3E%3Cellipse cx='600' cy='820' rx='700' ry='200' fill='%239d174d' opacity='0.5'/%3E%3Cellipse cx='600' cy='850' rx='500' ry='140' fill='%23be185d' opacity='0.3'/%3E%3Crect x='440' y='320' width='320' height='340' rx='4' fill='%231e0a22'/%3E%3Crect x='440' y='320' width='320' height='340' rx='4' fill='url(%23glow)'/%3E%3Crect x='460' y='250' width='60' height='90' rx='3' fill='%231e0a22'/%3E%3Crect x='570' y='220' width='60' height='120' rx='3' fill='%231e0a22'/%3E%3Crect x='680' y='250' width='60' height='90' rx='3' fill='%231e0a22'/%3E%3Crect x='460' y='230' width='60' height='18' rx='2' fill='%23be185d' opacity='0.8'/%3E%3Crect x='570' y='200' width='60' height='18' rx='2' fill='%23be185d' opacity='0.8'/%3E%3Crect x='680' y='230' width='60' height='18' rx='2' fill='%23be185d' opacity='0.8'/%3E%3Crect x='540' y='460' width='120' height='200' rx='60' fill='%230d0514'/%3E%3Cellipse cx='360' cy='800' rx='180' ry='30' fill='%23380d3f' opacity='0.6'/%3E%3Cellipse cx='840' cy='800' rx='180' ry='30' fill='%23380d3f' opacity='0.6'/%3E%3Ccircle cx='200' cy='180' r='2' fill='white' opacity='0.8'%3E%3Canimate attributeName='opacity' values='0.3;1;0.3' dur='2.1s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='950' cy='120' r='1.5' fill='white' opacity='0.7'%3E%3Canimate attributeName='opacity' values='0.2;0.9;0.2' dur='1.7s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='100' cy='300' r='1' fill='white' opacity='0.6'%3E%3Canimate attributeName='opacity' values='0.1;0.8;0.1' dur='3s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='1100' cy='250' r='2' fill='%23f472b6' opacity='0.5'%3E%3Canimate attributeName='opacity' values='0.2;0.7;0.2' dur='2.5s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='600' cy='60' r='1.5' fill='white' opacity='0.9'%3E%3Canimate attributeName='opacity' values='0.4;1;0.4' dur='1.9s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E";
  const finalImg = isMobile ? (castleUrlMobile || castleUrl || defaultCastle) : (castleUrl || castleUrlMobile || defaultCastle);

  if (editMode && previewMode === 'static') {
    return (
      <div style={{ position: 'relative', height: 800, borderRadius: 12, marginBottom: 32, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${finalImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
        <CastleOverlayText
          childName={childName} partner2Name={partner2Name} isWedding={isWedding}
          subtitle={subtitle} welcomeText={welcomeText} editMode={true}
          onChildNameChange={onChildNameChange} onSubtitleChange={onSubtitleChange} onWelcomeChange={onWelcomeChange}
          inviteTop={inviteTop} inviteMiddle={inviteMiddle} inviteBottom={inviteBottom} inviteTag={inviteTag} dateStr={dateStr}
          onInviteTopChange={onInviteTopChange} onInviteMiddleChange={onInviteMiddleChange}
          onInviteBottomChange={onInviteBottomChange} onInviteTagChange={onInviteTagChange}
          themeColors={themeColors} />
      </div>
    );
  }

  if (editMode) {
    return (
      <div style={{ position: 'relative', height: 800, borderRadius: 12, marginBottom: 32 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', overflow: 'hidden', borderRadius: '12px 0 0 12px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', backgroundImage: `url(${finalImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', overflow: 'hidden', borderRadius: '0 12px 12px 0' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', backgroundImage: `url(${finalImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}><DoorHint /></div>
        <CastleOverlayText
          childName={childName} partner2Name={partner2Name} isWedding={isWedding}
          subtitle={subtitle} welcomeText={welcomeText} editMode={true}
          onChildNameChange={onChildNameChange} onSubtitleChange={onSubtitleChange} onWelcomeChange={onWelcomeChange}
          inviteTop={inviteTop} inviteMiddle={inviteMiddle} inviteBottom={inviteBottom} inviteTag={inviteTag} dateStr={dateStr}
          onInviteTopChange={onInviteTopChange} onInviteMiddleChange={onInviteMiddleChange}
          onInviteBottomChange={onInviteBottomChange} onInviteTagChange={onInviteTagChange}
          themeColors={themeColors} />
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: 'fixed', inset: 0, height: '100dvh', zIndex: 9999, overflow: 'hidden', pointerEvents: 'none' }}>
      <div ref={leftDoorRef} style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100dvh', overflow: 'visible', willChange: 'transform' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', backgroundImage: `url(${finalImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
        </div>
        <div ref={seamRef} style={{ opacity: 0 }}><DoorSeam side="left"  seamColor={themeColors?.pinkL ?? PINK_L} />
</div>
      </div>
      <div ref={rightDoorRef} style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100dvh', overflow: 'visible', willChange: 'transform' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', backgroundImage: `url(${finalImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
        </div>
        <div ref={seamRef2} style={{ opacity: 0 }}><DoorSeam side="right" seamColor={themeColors?.pinkL ?? PINK_L} />
</div>
      </div>
      <CastleOverlayText
        childName={childName} partner2Name={partner2Name} isWedding={isWedding}
        subtitle={subtitle} welcomeText={welcomeText}
        overlayRef={overlayRef} nameRef={nameRef} inviteRef={inviteRef}
        inviteTop={inviteTop} inviteMiddle={inviteMiddle} inviteBottom={inviteBottom} inviteTag={inviteTag} dateStr={dateStr}
        themeColors={themeColors} />
      <div ref={hintRef} style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}><DoorHint /></div>
    </div>
  );
};

// ── Audio Permission Modal ────────────────────────────────────────────────────
const AudioPermissionModal: React.FC<{ childName: string; onAllow: () => void; onDeny: () => void }> = ({ childName, onAllow, onDeny }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(157,23,77,0.65)', backdropFilter: 'blur(8px)' }} />
    <div style={{ position: 'relative', background: 'white', borderRadius: 24, padding: '36px 32px 28px', maxWidth: 320, width: '90%', textAlign: 'center', boxShadow: '0 24px 80px rgba(157,23,77,0.35)', border: `1px solid ${PINK_L}` }}>
      <style>{`@keyframes apm-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg,${PINK_L},${PINK_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'apm-pulse 2s ease-in-out infinite', boxShadow: `0 8px 24px rgba(190,24,93,0.35)` }}>
        <Music className="w-8 h-8" style={{ color: 'white' }} />
      </div>
      <p style={{ fontFamily: SCRIPT, fontSize: 26, color: PINK_DARK, margin: '0 0 6px', lineHeight: 1.2 }}>{childName}</p>
      <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>Te invită la o poveste magică 🌟</p>
      <p style={{ fontFamily: SANS, fontSize: 11, color: MUTED, margin: '0 0 28px', lineHeight: 1.6 }}>Această invitație are o melodie specială.<br/>Vrei să activezi muzica?</p>
      <button type="button" onClick={onAllow}
        style={{ width: '100%', padding: '14px 0', background: `linear-gradient(135deg,${PINK_DARK},${PINK_D})`, border: 'none', borderRadius: 50, cursor: 'pointer', fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.1em', marginBottom: 10, boxShadow: `0 6px 20px rgba(190,24,93,0.4)`, transition: 'transform 0.15s' }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}>
        🎵 Da, activează muzica
      </button>
      <button type="button" onClick={onDeny}
        style={{ width: '100%', padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 11, color: MUTED }}>
        Nu, continuă fără muzică
      </button>
    </div>
  </div>
);


// ── Template Defaults — sursa unică de adevăr ────────────────────────────────
export const CASTLE_DEFAULTS = {
  partner1Name:         'Printul Adam',
  heroBgImage:          undefined as string | undefined,
  heroBgImageMobile:    undefined as string | undefined,
  heroContentImage:       undefined as string | undefined,
  heroContentImageMobile: undefined as string | undefined,
  castleIntroSubtitle:  'into my little kingdom',
  castleIntroWelcome:   'WELCOME',
  castleInviteTop:      'Cu multă bucurie vă anunțăm',
  castleInviteMiddle:   '',
  castleInviteBottom:   'va fii botezată',
  castleInviteTag:      '✦ deschide porțile ✦',
  welcomeText:          'Vă invităm cu drag',
  celebrationText:      'la nunta noastră',
  weddingDate:          '',
  showRsvpButton:       true,
  rsvpButtonText:       'Confirmă Prezența',
  showWelcomeText:      true,
  showCelebrationText:  true,
  showTimeline:         false,
  showCountdown:        false,
  colorTheme:           'default',
};

export const CASTLE_DEFAULT_BLOCKS = [
  // ── Muzică ─────────────────────────────────────────────────────────────────
  {
    id: 'def-music',
    type: 'music' as const,
    show: true,
    musicTitle: 'Melodia Zilei',
    musicArtist: 'Artist',
    musicUrl: '',
    musicType: 'none' as const,
  },

  // ── Foto principală — portret arc, fade jos ────────────────────────────────
  {
    id: 'def-photo-1',
    type: 'photo' as const,
    show: true,
    imageData: 'https://clubulbebelusilor.ro/wp-content/uploads/2021/02/bebelusi-sfaturi-pentru-mamici.jpg',
    altText: 'Fotografia prințesei',
    aspectRatio: '3:4' as const,
    photoClip: 'arch' as const,
    photoMasks: ['fade-b'] as any,
  },

  // ── Text poetic ────────────────────────────────────────────────────────────
  {
    id: 'def-text-1',
    type: 'text' as const,
    show: true,
    content: 'O poveste magică începe odată cu venirea pe lume a celui mai iubit copil. Vă așteptăm cu drag să fiți parte din această zi de poveste.',
  },

  // ── Countdown ──────────────────────────────────────────────────────────────
  {
  id: 'def-countdown',
  type: 'countdown' as const,
  show: true,
  countdownTitle: 'Timp rămas până la Marele Eveniment',  // adaugă aici
},

  // ── Calendar ───────────────────────────────────────────────────────────────
  {
    id: 'def-calendar',
    type: 'calendar' as const,
    show: true,
  },

  // ── Foto 2 — peisaj ────────────────────────────────────────────────────────
  {
    id: 'def-photo-2',
    type: 'photo' as const,
    show: true,
    imageData: 'https://clubulbebelusilor.ro/wp-content/uploads/2021/02/bebelusi-sfaturi-pentru-mamici.jpg',
    altText: 'Decorațiuni',
    aspectRatio: '16:9' as const,
    photoClip: 'rounded' as const,
    photoMasks: [] as any,
  },

  // ── Locație Biserică ───────────────────────────────────────────────────────
  {
    id: 'def-loc-church',
    type: 'location' as const,
    show: true,
    label: 'Slujba de Botez',
    time: '11:00',
    locationName: 'Biserica Sfânta Maria',
    locationAddress: 'Str. Bisericii nr. 5, București',
    wazeLink: '',
  },

  // ── Locație Petrecere ──────────────────────────────────────────────────────
  {
    id: 'def-loc-party',
    type: 'location' as const,
    show: true,
    label: 'Petrecere',
    time: '14:00',
    locationName: 'Salon Castelul Magic',
    locationAddress: 'Str. Basmului nr. 1, București',
    wazeLink: '',
  },

  // ── Foto 3 — cerc cu vignetă ───────────────────────────────────────────────
  {
    id: 'def-photo-3',
    type: 'photo' as const,
    show: true,
    imageData: 'https://clubulbebelusilor.ro/wp-content/uploads/2021/02/bebelusi-sfaturi-pentru-mamici.jpg',
    altText: 'Fotografie',
    aspectRatio: '1:1' as const,
    photoClip: 'circle' as const,
    photoMasks: ['vignette'] as any,
  },

  // ── Cadouri ────────────────────────────────────────────────────────────────
  {
    id: 'def-gift',
    type: 'gift' as const,
    show: true,
    sectionTitle: 'Sugestie de cadou',
    content: 'Cel mai frumos cadou este prezența voastră alături de noi. Dacă doriți să contribuiți la viitorul prințesei noastre, vă lăsăm datele de mai jos.',
    iban: 'RO00 BANK 0000 0000 0000 0000',
    ibanName: 'Familia Ionescu',
  },

  // ── Foto finală — blob ─────────────────────────────────────────────────────
  {
    id: 'def-photo-4',
    type: 'photo' as const,
    show: true,
    imageData: 'https://clubulbebelusilor.ro/wp-content/uploads/2021/02/bebelusi-sfaturi-pentru-mamici.jpg',
    altText: 'Fotografie finală',
    aspectRatio: '3:4' as const,
    photoClip: 'blob' as const,
    photoMasks: ['fade-b'] as any,
  },

  // ── WhatsApp contact ───────────────────────────────────────────────────────
  {
    id: 'def-whatsapp',
    type: 'whatsapp' as const,
    show: true,
    label: 'Contactează-ne pe WhatsApp',
    content: '0700000000',
  },

  // ── RSVP ───────────────────────────────────────────────────────────────────
  {
    id: 'def-rsvp',
    type: 'rsvp' as const,
    show: true,
    label: 'Confirmă Prezența',
  },
];

// ── Preview data — folosit de InvitationMarketplace pentru demo ──────────────
export const CASTLE_PREVIEW_DATA = {
  guest:   { name: "Invitat Drag", status: "pending", type: "adult" },
  project: { selectedTemplate: 'lord-effects' },
  profile: {
    ...CASTLE_DEFAULTS,
    colorTheme: 'default',
    weddingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // peste 60 zile
    customSections: JSON.stringify(CASTLE_DEFAULT_BLOCKS),
  },
};

// ── Insert Block Button ───────────────────────────────────────────────────────
const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: '🖼', text: '✏️', location: '📍', calendar: '📅',
  countdown: '⏱', music: '🎵', gift: '🎁',   whatsapp: '💬', rsvp: '✉️', divider: '—', family: '👨‍👩‍👧',
  date: '📆', description: '📝',
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
      {/* linie punctată */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `repeating-linear-gradient(to right, ${PINK_L} 0, ${PINK_L} 6px, transparent 6px, transparent 12px)`,
        opacity: 1, transition: 'opacity 0.15s',zIndex:1
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
          boxShadow: '0 2px 10px rgba(190,24,93,0.2)',
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
            Adaugă bloc
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

// ── Main Template ─────────────────────────────────────────────────────────────
const CastleMagicTemplate: React.FC<InvitationTemplateProps & {
  editMode?: boolean;
  introPreview?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
}> = ({ data, onOpenRSVP, editMode = false, introPreview = false, scrollContainer, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId }) => {
  const { profile, guest } = data;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // SURSA DE ADEVĂR: templateul însuși.
  // DB-ul este doar un OVERRIDE opțional — dacă nu există nimic salvat,
  // templateul arată perfect cu propriile sale default-uri.
  // ─────────────────────────────────────────────────────────────────────────────
  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  // Profile: fiecare câmp citit cu fallback la CASTLE_DEFAULTS (niciun câmp nu referențiează `p`)
  const pr = profile as any;
  const p = {
    partner1Name:        pr.partner1Name        ?? CASTLE_DEFAULTS.partner1Name,
    partner2Name:        pr.partner2Name        ?? '',
    eventType:           pr.eventType           ?? 'baptism',
    weddingDate:         pr.weddingDate          ?? CASTLE_DEFAULTS.weddingDate,
    showRsvpButton:      pr.showRsvpButton       ?? CASTLE_DEFAULTS.showRsvpButton,
    rsvpButtonText:      pr.rsvpButtonText       ?? CASTLE_DEFAULTS.rsvpButtonText,
    showWelcomeText:     pr.showWelcomeText      ?? CASTLE_DEFAULTS.showWelcomeText,
    showCelebrationText: pr.showCelebrationText  ?? CASTLE_DEFAULTS.showCelebrationText,
    welcomeText:         pr.welcomeText          ?? CASTLE_DEFAULTS.welcomeText,
    celebrationText:     pr.celebrationText      ?? CASTLE_DEFAULTS.celebrationText,
    castleIntroSubtitle: pr.castleIntroSubtitle  ?? CASTLE_DEFAULTS.castleIntroSubtitle,
    castleIntroWelcome:  pr.castleIntroWelcome   ?? CASTLE_DEFAULTS.castleIntroWelcome,
    castleInviteTop:     pr.castleInviteTop      ?? CASTLE_DEFAULTS.castleInviteTop,
    castleInviteMiddle:  pr.castleInviteMiddle   ?? CASTLE_DEFAULTS.castleInviteMiddle,
    castleInviteBottom:  pr.castleInviteBottom   ?? CASTLE_DEFAULTS.castleInviteBottom,
    castleInviteTag:     pr.castleInviteTag      ?? CASTLE_DEFAULTS.castleInviteTag,
    heroBgImage:         pr.heroBgImage          ?? CASTLE_DEFAULTS.heroBgImage,
    heroBgImageMobile:   pr.heroBgImageMobile    ?? CASTLE_DEFAULTS.heroBgImageMobile,
    heroContentImage:       pr.heroContentImage       ?? CASTLE_DEFAULTS.heroContentImage,
    heroContentImageMobile: pr.heroContentImageMobile ?? CASTLE_DEFAULTS.heroContentImageMobile,
  };

    // ── Config global template (imagini uși + paletă) — vin din admin ───────────
  const [globalConfig, setGlobalConfig] = useState<Record<string, any>>({});
  useEffect(() => {
    fetch(`${API_URL}/config/template-defaults/${meta.id}`)
      .then(r => r.ok ? r.json() : {})
      .then((cfg: any) => {
        setGlobalConfig(cfg);
      })
      .catch(() => {});
  }, []);
  
  // ── Apply color theme ───────────────────────────────────────────────────────
  const activeColorTheme = (pr as any).colorTheme || 'default';
  const monoTheme: CastleColorTheme = getLordTheme(activeColorTheme);
  PINK_DARK = monoTheme.PINK_DARK;
  PINK_D    = monoTheme.PINK_D;
  PINK_L    = monoTheme.PINK_L;
  PINK_XL   = monoTheme.PINK_XL;
  CREAM     = monoTheme.CREAM;
  TEXT      = monoTheme.TEXT;
  MUTED     = monoTheme.MUTED;
  GOLD      = monoTheme.GOLD;
  // CSS vars for Tailwind-class replacements (injected as <style>)
  const themeCSS = `
    .cm-wrap { --cm-dark:${PINK_DARK}; --cm-d:${PINK_D}; --cm-l:${PINK_L}; --cm-xl:${PINK_XL}; --cm-text:${TEXT}; --cm-muted:${MUTED}; }
    .cm-wrap .text-pink-500 { color: ${PINK_L} !important; }
    .cm-wrap .text-pink-500 { color: ${PINK_D} !important; }
    .cm-wrap .text-pink-600 { color: ${PINK_DARK} !important; }
    .cm-wrap .bg-pink-50    { background-color: ${PINK_XL} !important; }
    .cm-wrap .bg-pink-100   { background-color: ${PINK_XL} !important; }
    .cm-wrap .bg-pink-200   { background-color: ${PINK_L}44 !important; }
    .cm-wrap .bg-pink-500   { background-color: ${PINK_D} !important; }
    .cm-wrap .bg-pink-600   { background-color: ${PINK_DARK} !important; }
    .cm-wrap .hover\:bg-pink-50:hover  { background-color: ${PINK_XL} !important; }
    .cm-wrap .hover\:bg-pink-700:hover { background-color: ${PINK_D} !important; }
    .cm-wrap .border-pink-100 { border-color: ${PINK_L}88 !important; }
    .cm-wrap .border-pink-200 { border-color: ${PINK_L} !important; }
    .cm-wrap .border-pink-500 { border-color: ${PINK_D} !important; }
    .cm-wrap .via-pink-300  { --tw-gradient-via: ${PINK_L} !important; }
    .cm-wrap .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
  `;

  // Imaginile default — în ordinea în care apar blocurile foto în template
  const DEFAULT_PHOTO_URLS = (CASTLE_DEFAULT_BLOCKS as any[])
    .filter(b => b.type === 'photo' && b.imageData)
    .map(b => b.imageData as string);

  // Merge: photo fără imageData preia URL-ul default după poziția sa (1st photo -> url[0] etc.)
  const mergeWithDefaults = (dbBlocks: InvitationBlock[]): InvitationBlock[] => {
    let photoIdx = 0;
    return dbBlocks.map(b => {
      if (b.type !== 'photo') return b;
      const defaultUrl = DEFAULT_PHOTO_URLS[photoIdx++] ?? '';
      if (!b.imageData) return { ...b, imageData: defaultUrl };
      return b;
    });
  };

  // Blocks: DB override sau CASTLE_DEFAULT_BLOCKS — niciodată gol
  const blocksFromDB: InvitationBlock[] | null = safeJSON(profile.customSections, null);
  const hasDBBlocks = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;

  const [blocks, setBlocks] = useState<InvitationBlock[]>(() =>
    hasDBBlocks ? mergeWithDefaults(blocksFromDB!) : CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]
  );

  // Sync blocks când DB-ul se actualizează din exterior (upload foto etc.)
  useEffect(() => {
    const fresh: InvitationBlock[] | null = safeJSON(profile.customSections, null);
    if (Array.isArray(fresh) && fresh.length > 0) {
      setBlocks(mergeWithDefaults(fresh));
    }
    // Dacă DB devine gol (reset), revenim la defaults
    else if (fresh !== null && Array.isArray(fresh) && fresh.length === 0) {
      setBlocks(CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
    }
  }, [profile.customSections]);

  // Door images come from admin per selected Lord theme.
  const themeImgs   = globalConfig.themeImages?.[activeColorTheme] || {};
  const defaultImgs = globalConfig.themeImages?.['default'] || {};
  const heroBgImage       = themeImgs.desktop || defaultImgs.desktop || globalConfig.heroBgImage;
  const heroBgImageMobile = themeImgs.mobile  || defaultImgs.mobile  || globalConfig.heroBgImageMobile;
  const [heroContentImage, setHeroContentImage] = useState<string | undefined>(p.heroContentImage);
  const [heroContentImageMobile, setHeroContentImageMobile] = useState<string | undefined>(p.heroContentImageMobile);
  useEffect(() => { setHeroContentImage((profile as any).heroContentImage ?? CASTLE_DEFAULTS.heroContentImage); }, [(profile as any).heroContentImage]);
  useEffect(() => { setHeroContentImageMobile((profile as any).heroContentImageMobile ?? CASTLE_DEFAULTS.heroContentImageMobile); }, [(profile as any).heroContentImageMobile]);

  // Alias-uri clare pentru câmpurile de profil (din `p`, nu din `profile`)
  const castleSubtitle   = p.castleIntroSubtitle;
  const castleWelcome    = p.castleIntroWelcome;
  const castleInviteTop  = p.castleInviteTop;
  const castleInviteMid  = p.castleInviteMiddle;
  const castleInviteBot  = p.castleInviteBottom;
  const castleInviteTag  = p.castleInviteTag;

  const [showIntro, setShowIntro] = useState(!editMode);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

  const hasMusicBlock = useCallback(() => {
    return blocks.some(b => b.type === 'music' && b.musicType !== 'none' && b.musicUrl);
  }, [blocks]);
  const [showAudioModal, setShowAudioModal] = useState<boolean>(false);
  const [audioAllowed,   setAudioAllowed]   = useState(false);
  const audioAllowedRef = useRef(false);
  const musicPlayRef = useRef<{ unlock: () => void; play: () => void; pause: () => void } | null>(null);

  useEffect(() => { if (!editMode) setShowAudioModal(hasMusicBlock()); }, []);
  useEffect(() => {
    setShowIntro(!editMode);
  }, [editMode]);

  const _pq = useRef<Record<string, any>>({});
  const _pt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const upProfile = useCallback((field: string, value: any) => {
    _pq.current = { ..._pq.current, [field]: value };
    if (_pt.current) clearTimeout(_pt.current);
    _pt.current = setTimeout(() => { onProfileUpdate?.(_pq.current); _pq.current = {}; }, 400);
  }, [onProfileUpdate]);

  const resetToDefaults = useCallback(() => {
    if (!window.confirm('Resetezi templateul la valorile implicite? Toate modificările vor fi pierdute.')) return;
    // Salvăm în DB default-urile (ca override explicit), dar păstrăm data evenimentului
    onProfileUpdate?.({ ...CASTLE_DEFAULTS, weddingDate: pr.weddingDate ?? CASTLE_DEFAULTS.weddingDate });
    const freshBlocks = CASTLE_DEFAULT_BLOCKS.map((b, i) => ({ ...b, id: `def-${Date.now()}-${i}` }));
    setBlocks(freshBlocks);
    onBlocksUpdate?.(freshBlocks);
    setHeroContentImage(CASTLE_DEFAULTS.heroContentImage);
    setHeroContentImageMobile(CASTLE_DEFAULTS.heroContentImageMobile);
  }, [onProfileUpdate, onBlocksUpdate]);

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

  const [openInsertAt, setOpenInsertAt] = useState<number | null>(null);

  const name1    = p.partner1Name;
  const name2    = p.partner2Name;
  const isWeddingTemplate = (p.eventType || '').toLowerCase() === 'wedding';
  const heroTitle = isWeddingTemplate
    ? [name1, name2].filter(Boolean).join(' & ')
    : name1;
  const dateStr  = p.weddingDate ? new Date(p.weddingDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Data Evenimentului';
  const showRsvp = p.showRsvpButton;
  const rsvpText = p.rsvpButtonText?.trim() || CASTLE_DEFAULTS.rsvpButtonText;

  const BLOCK_TYPES = [
    { type: 'photo',     label: '📷 Foto',      def: { imageData: undefined, aspectRatio: '1:1', photoClip: 'rect', photoMasks: [] } },
    { type: 'text',      label: 'Text',          def: { content: 'O poveste magică începe...' } },
    { type: 'location',  label: 'Locație',       def: { locationName: 'Castelul Magic', locationAddress: 'Strada Basmului nr. 1' } },
    { type: 'calendar',  label: '📅 Calendar',  def: {} },
    { type: 'countdown', label: '⏱ Countdown', def: {} },
    { type: 'music',     label: '🎵 Muzică',    def: { musicTitle: '', musicArtist: '', musicType: 'none' } },
    { type: 'gift',      label: '🎁 Cadouri',   def: { sectionTitle: 'Sugestie cadou', content: '', iban: '', ibanName: '' } },
    { type: 'whatsapp',  label: 'WhatsApp',      def: { label: 'Contact WhatsApp', content: '0700000000' } },
    { type: 'rsvp',      label: 'RSVP',          def: { label: 'Confirmă Prezența' } },
    { type: 'divider',     label: 'Linie',         def: {} },
    { type: 'family',      label: '👨‍👩‍👧 Familie',  def: { label: 'Părinții copilului', content: 'Cu drag și recunoștință', members: JSON.stringify([{ name1: 'Mama', name2: 'Tata' }]) } },
    { type: 'date',        label: '📆 Dată',       def: {} },
    { type: 'description', label: 'Descriere',      def: { content: 'O scurtă descriere...' } },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

      {showAudioModal && !editMode && (
        <AudioPermissionModal
          childName={p.partner1Name || "Prințesa"}
          onAllow={() => {
            audioAllowedRef.current = true;
            setAudioAllowed(true);
            musicPlayRef.current?.unlock();
            setShowAudioModal(false);
          }}
          onDeny={() => {
            audioAllowedRef.current = false;
            setShowAudioModal(false);
          }}
        />
      )}

      {showIntro && (
        <BlockStyleProvider
          value={{ blockId: "__intro__", textStyles: (profile as any).introTextStyles }}
        >
          <CastleIntro
            onDone={() => {}}
            castleUrl={heroBgImage}
            castleUrlMobile={heroBgImageMobile}
            contentEl={contentEl}
            scrollContainer={scrollContainer}
            childName={p.partner1Name || "Numele Copilului"}
            partner2Name={p.partner2Name || ''}
            isWedding={isWeddingTemplate}
            subtitle={castleSubtitle}
            welcomeText={castleWelcome}
            inviteTop={castleInviteTop}
            inviteMiddle={castleInviteMid}
            inviteBottom={castleInviteBot}
            inviteTag={castleInviteTag}
            dateStr={dateStr}
            themeColors={{
              pinkDark: PINK_DARK,
              pinkL: PINK_L,
              pinkXL: PINK_XL,
              gold: GOLD,
            }}
            onDoorsOpen={() => {
              if (audioAllowedRef.current && musicPlayRef.current) {
                musicPlayRef.current.play();
              }
            }}
          />
        </BlockStyleProvider>
      )}

      <div
        ref={(el) => {
          contentRef.current = el;
          setContentEl(el);
        }}
        className="cm-wrap min-h-screen"
        style={{
          backgroundColor: PINK_XL,
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(244, 114, 182, 0.05) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
          fontFamily: SANS,
          paddingTop: showIntro ? "0vh" : "0px",
        }}
      >
        {editMode && introPreview && (
          <div className="max-w-2xl mx-auto px-6 relative z-10">
            <div className="mb-10 p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-3">Preview intro (editabil)</p>
              <div className="border border-zinc-200 rounded-xl bg-zinc-50/60 overflow-hidden">
                <BlockStyleProvider value={{
                  blockId: "__intro__",
                  textStyles: (profile as any).introTextStyles,
                  onTextSelect: (textKey, textLabel) => onBlockSelect?.(
                    { id: "__intro__", type: "intro", textStyles: (profile as any).introTextStyles } as any,
                    -1,
                    textKey,
                    textLabel
                  ),
                }}>
                  <CastleIntro
                    editMode
                    previewMode="static"
                    castleUrl={heroBgImage}
                    castleUrlMobile={heroBgImageMobile}
                    onDone={() => {}}
                    childName={p.partner1Name || "Numele Copilului"}
                    partner2Name={p.partner2Name || ""}
                    isWedding={isWeddingTemplate}
                    subtitle={castleSubtitle}
                    welcomeText={castleWelcome}
                    inviteTop={castleInviteTop}
                    inviteMiddle={castleInviteMid}
                    inviteBottom={castleInviteBot}
                    inviteTag={castleInviteTag}
                    dateStr={dateStr}
                    themeColors={{ pinkDark: PINK_DARK, pinkL: PINK_L, pinkXL: PINK_XL, gold: GOLD }}
                    onChildNameChange={v => upProfile('partner1Name', v)}
                    onSubtitleChange={v => upProfile('castleIntroSubtitle', v)}
                    onWelcomeChange={v => upProfile('castleIntroWelcome', v)}
                    onInviteTopChange={v => upProfile('castleInviteTop', v)}
                    onInviteMiddleChange={v => upProfile('castleInviteMiddle', v)}
                    onInviteBottomChange={v => upProfile('castleInviteBottom', v)}
                    onInviteTagChange={v => upProfile('castleInviteTag', v)}
                  />
                </BlockStyleProvider>
              </div>
            </div>
          </div>
        )}

        {/* ── Hero content image — full width ──────────────────────────────── */}
        {(() => {
          const isMob =
            typeof window !== "undefined" && window.innerWidth < 768;
          const FALLBACK =
            "https://images.pexels.com/photos/28680696/pexels-photo-28680696.jpeg";
          const imgSrc = isMob
            ? heroContentImageMobile || heroContentImage || FALLBACK
            : heroContentImage || heroContentImageMobile || FALLBACK;
          return (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "60vh",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${imgSrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "top",
                  backgroundRepeat: "no-repeat",
                }}
              />
              {/* gradient fade to page bg */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: 400,
                  background: `linear-gradient(to top, ${PINK_XL} 0%, transparent 100%)`,
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />
              {/* editMode upload overlay */}
              {editMode && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: "0 24px 60px",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.92)",
                      backdropFilter: "blur(12px)",
                      borderRadius: 16,
                      padding: "16px 20px",
                      width: "100%",
                      maxWidth: 420,
                      boxShadow: `0 8px 32px ${PINK_DARK}22`,
                      border: `1px solid ${PINK_L}`,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: SANS,
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: PINK_DARK,
                        margin: "0 0 12px",
                        textAlign: "center",
                      }}
                    >
                      📸 Imagine Hero Conținut
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <ProfileImageUpload
                        url={heroContentImage}
                        onUpload={(url) => {
                          setHeroContentImage(url);
                          upProfile("heroContentImage", url);
                        }}
                        onRemove={() => {
                          setHeroContentImage(undefined);
                          upProfile("heroContentImage", undefined);
                        }}
                        label="Desktop"
                        editMode={editMode}
                        aspectRatio="aspect-video"
                      />
                      <ProfileImageUpload
                        url={heroContentImageMobile}
                        onUpload={(url) => {
                          setHeroContentImageMobile(url);
                          upProfile("heroContentImageMobile", url);
                        }}
                        onRemove={() => {
                          setHeroContentImageMobile(undefined);
                          upProfile("heroContentImageMobile", undefined);
                        }}
                        label="Mobile (Portrait)"
                        editMode={editMode}
                        aspectRatio="aspect-[9/16]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <div className="max-w-2xl mx-auto px-6 relative z-10">

          {/* {editMode && (
            <div className="mb-12 p-6 bg-white rounded-2xl border border-pink-100 shadow-sm">
              <h3 className="text-xs font-bold text-pink-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Imagini Intro (Uși)
              </h3>
              <div className="mb-6">
                <p className="text-[10px] text-muted uppercase font-bold mb-2">Previzualizare Uși — click pe text pentru editare:</p>
                <div className="border border-pink-100 rounded-xl shadow-inner bg-pink-50/20" style={{ position: 'relative' }}>
                  <CastleIntro
                    editMode castleUrl={heroBgImage} castleUrlMobile={heroBgImageMobile} onDone={() => {}}
                    childName={p.partner1Name || 'Numele Copilului'} subtitle={castleSubtitle} welcomeText={castleWelcome}
                    inviteTop={castleInviteTop} inviteMiddle={castleInviteMid} inviteBottom={castleInviteBot}
                    inviteTag={castleInviteTag} dateStr={dateStr}
                    themeColors={{ pinkDark: PINK_DARK, pinkL: PINK_L, pinkXL: PINK_XL, gold: GOLD }}
                    onChildNameChange={v => upProfile('partner1Name', v)}
                    onSubtitleChange={v => upProfile('castleIntroSubtitle', v)}
                    onWelcomeChange={v => upProfile('castleIntroWelcome', v)}
                    onInviteTopChange={v => upProfile('castleInviteTop', v)}
                    onInviteMiddleChange={v => upProfile('castleInviteMiddle', v)}
                    onInviteBottomChange={v => upProfile('castleInviteBottom', v)}
                    onInviteTagChange={v => upProfile('castleInviteTag', v)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileImageUpload url={heroBgImage} onUpload={url => { setHeroBgImage(url); upProfile('heroBgImage', url); }} onRemove={() => { setHeroBgImage(undefined); upProfile('heroBgImage', undefined); }} label="Desktop (Landscape)" editMode={editMode} aspectRatio="aspect-video" />
                <ProfileImageUpload url={heroBgImageMobile} onUpload={url => { setHeroBgImageMobile(url); upProfile('heroBgImageMobile', url); }} onRemove={() => { setHeroBgImageMobile(undefined); upProfile('heroBgImageMobile', undefined); }} label="Mobile (Portrait)" editMode={editMode} aspectRatio="aspect-[9/16]" />
              </div>
            </div>
          )} */}

          <div className="text-center">
            <Reveal>
              <div className="mb-6 inline-block relative">
                <div className="absolute -inset-4 bg-pink-200/30 blur-xl rounded-full" />
                {/* <Sparkles className="w-12 h-12 text-pink-400 relative z-10 animate-pulse" /> */}
                <svg
                  version="1.1"
                  viewBox="0 0 512 512"
                  className="w-12 h-12 relative z-10 animate-pulse"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{color: PINK_DARK}}
                >
                  <g>
                    <g>
                      <g>
                        <path
                          d="M443.733,170.667h-17.067V153.6c0-9.412-7.654-17.067-17.067-17.067h-34.133c-9.412,0-17.067,7.654-17.067,17.067v17.067
                    h-68.267V102.4H307.2c9.412,0,17.067-7.654,17.067-17.067V51.2c0-9.412-7.654-17.067-17.067-17.067h-17.067V17.067
                    C290.133,7.654,282.479,0,273.067,0h-34.133c-9.412,0-17.067,7.654-17.067,17.067v17.067H204.8
                    c-9.412,0-17.067,7.654-17.067,17.067v34.133c0,9.412,7.654,17.067,17.067,17.067h17.067v68.267H153.6V153.6
                    c0-9.412-7.654-17.067-17.067-17.067H102.4c-9.412,0-17.067,7.654-17.067,17.067v17.067H68.267
                    c-9.412,0-17.067,7.654-17.067,17.067v34.133c0,9.412,7.654,17.067,17.067,17.067h17.067V256c0,9.412,7.654,17.067,17.067,17.067
                    h34.133c9.412,0,17.067-7.654,17.067-17.067v-17.067h68.267V409.6H204.8c-9.412,0-17.067,7.654-17.067,17.067V460.8
                    c0,9.412,7.654,17.067,17.067,17.067h17.067v17.067c0,9.412,7.654,17.067,17.067,17.067h34.133
                    c9.412,0,17.067-7.654,17.067-17.067v-17.067H307.2c9.412,0,17.067-7.654,17.067-17.067v-34.133
                    c0-9.412-7.654-17.067-17.067-17.067h-17.067V238.933h76.8c4.71,0,8.533-3.823,8.533-8.533s-3.823-8.533-8.533-8.533H281.6
                    c-4.71,0-8.533,3.823-8.533,8.533v187.733c0,4.71,3.823,8.533,8.533,8.533h25.6V460.8h-25.6c-4.71,0-8.533,3.823-8.533,8.533
                    v25.6h-34.133v-25.6c0-4.71-3.823-8.533-8.533-8.533h-25.6v-34.133h25.6c4.71,0,8.533-3.823,8.533-8.533V230.4
                    c0-4.71-3.823-8.533-8.533-8.533h-85.333c-4.71,0-8.533,3.823-8.533,8.533V256H102.4v-25.6c0-4.71-3.823-8.533-8.533-8.533h-25.6
                    v-34.133h25.6c4.71,0,8.533-3.823,8.533-8.533v-25.6h34.133v25.6c0,4.71,3.823,8.533,8.533,8.533H230.4
                    c4.71,0,8.533-3.823,8.533-8.533V93.867c0-4.71-3.823-8.533-8.533-8.533h-25.6V51.2h25.6c4.71,0,8.533-3.823,8.533-8.533v-25.6
                    h34.133v25.6c0,4.71,3.823,8.533,8.533,8.533h25.6v34.133h-25.6c-4.71,0-8.533,3.823-8.533,8.533V179.2
                    c0,4.71,3.823,8.533,8.533,8.533h85.333c4.71,0,8.533-3.823,8.533-8.533v-25.6H409.6v25.6c0,4.71,3.823,8.533,8.533,8.533h25.6
                    v34.133h-25.6c-4.71,0-8.533,3.823-8.533,8.533V256l-34.133,0.009V256c0-4.71-3.823-8.533-8.533-8.533S358.4,251.29,358.4,256
                    c0,9.412,7.654,17.067,17.067,17.067H409.6c9.412,0,17.067-7.654,17.067-17.067v-17.067h17.067
                    c9.412,0,17.067-7.654,17.067-17.067v-34.133C460.8,178.321,453.146,170.667,443.733,170.667z"
                          fill="currentColor"
                        />
                        <path
                          d="M401.323,204.8c0-4.71-3.814-8.533-8.533-8.533h-0.085c-4.71,0-8.491,3.823-8.491,8.533c0,4.71,3.857,8.533,8.576,8.533
                    C397.508,213.333,401.323,209.51,401.323,204.8z"
                          fill="currentColor"
                        />
                        <path
                          d="M119.637,196.267c-4.71,0-8.491,3.823-8.491,8.533c0,4.71,3.857,8.533,8.576,8.533s8.533-3.823,8.533-8.533
                    c0-4.71-3.814-8.533-8.533-8.533H119.637z"
                          fill="currentColor"
                        />
                        <path
                          d="M256.256,435.2h-0.085c-4.71,0-8.491,3.823-8.491,8.533s3.857,8.533,8.576,8.533c4.71,0,8.533-3.823,8.533-8.533
                    S260.966,435.2,256.256,435.2z"
                          fill="currentColor"
                        />
                        <path
                          d="M256.256,59.733h-0.085c-4.71,0-8.491,3.823-8.491,8.533s3.857,8.533,8.576,8.533c4.71,0,8.533-3.823,8.533-8.533
                    S260.966,59.733,256.256,59.733z"
                          fill="currentColor"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>

              <InlineEdit
                tag="h1"
                editMode={editMode}
                value={heroTitle}
                onChange={(v) => {
                  if (!isWeddingTemplate) {
                    upProfile("partner1Name", v);
                    return;
                  }
                  const parts = v.split("&");
                  upProfile("partner1Name", parts[0]?.trim() || "");
                  upProfile("partner2Name", parts.slice(1).join("&").trim() || "");
                }}
                style={{
                  fontFamily: INTO_TEXT,
                  fontSize: "5rem",
                  color: PINK_DARK,
                  lineHeight: 1.2,
                }}
              />

              {/* Data — display custom cu zi / lună / an separate */}
              {p.weddingDate &&
                (() => {
                  const d = new Date(p.weddingDate);
                  const zi = d.getDate();
                  const luna = d.toLocaleDateString("ro-RO", { month: "long" });
                  const an = d.getFullYear();
                  const ziSapt = d.toLocaleDateString("ro-RO", {
                    weekday: "long",
                  });
                  return (
                    <div
                      style={{
                        margin: "20px auto 20px",
                        display: "inline-flex",
                        alignItems: "stretch",
                        gap: 0,
                        background: "white",
                        border: `1px solid ${PINK_L}`,
                        borderRadius: 16,
                        overflow: "hidden",
                        boxShadow: `0 2px 12px rgba(190,24,93,0.07)`,
                      }}
                    >
                      {/* Zi saptamana */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "12px 16px",
                          background: PINK_XL,
                          borderRight: `1px solid ${PINK_L}`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: SANS,
                            fontSize: "0.5rem",
                            fontWeight: 700,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: MUTED,
                            marginBottom: 2,
                          }}
                        >
                          {ziSapt}
                        </span>
                        <span
                          style={{
                            fontFamily: SCRIPT,
                            fontSize: "2.2rem",
                            color: PINK_DARK,
                            lineHeight: 1,
                          }}
                        >
                          {zi}
                        </span>
                      </div>
                      {/* Luna + an */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "12px 18px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: SANS,
                            fontSize: "0.55rem",
                            fontWeight: 700,
                            letterSpacing: "0.25em",
                            textTransform: "uppercase",
                            color: PINK_DARK,
                            marginBottom: 3,
                          }}
                        >
                          {luna}
                        </span>
                        <span
                          style={{
                            fontFamily: SCRIPT,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            color: MUTED,
                          }}
                        >
                          {an}
                        </span>
                      </div>
                    </div>
                  );
                })()}

              {/* Text intro — toggle vizibil/invizibil */}
              {(editMode || p.showWelcomeText !== false) && (
                <div className="relative inline-block w-full">
                  {editMode && (
                    <div
                      style={{
                        position: "absolute",
                        top: -4,
                        right: 0,
                        display: "flex",
                        gap: 4,
                        zIndex: 20,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          upProfile(
                            "showWelcomeText",
                            p.showWelcomeText === false ? true : false,
                          )
                        }
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "white",
                          border: `1px solid ${PINK_L}`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        }}
                      >
                        {p.showWelcomeText !== false ? (
                          <Eye
                            className="w-3 h-3"
                            style={{ color: PINK_DARK }}
                          />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  )}

                  <div
                    style={{
                      opacity: p.showWelcomeText === false ? 0.25 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <InlineEdit
                      tag="p"
                      editMode={editMode}
                      value={p.welcomeText}
                      onChange={(v) => upProfile("welcomeText", v)}
                      style={{
                        fontFamily: HeroText,
                        fontStyle: "italic",
                        fontWeight: 400,
                        color: PINK_DARK,
                        fontSize: "1.6rem",
                        marginBottom: 2,
                        lineHeight: 1.5,
                        letterSpacing: "0.02em",
                      }}
                    />
                  </div>
                </div>
              )}
              <p
                style={{
                  fontFamily: HeroText,
                  fontWeight: 400,
                  color: MUTED,
                  fontStyle: "italic",
                  fontSize: "1.8rem",
                }}
              >
                {guest?.name || ""}
              </p>
              {/* Text celebrare — toggle vizibil/invizibil */}
              {(p.showCelebrationText !== false || editMode) && (
                <div className="relative group/hero-celeb inline-block w-full">
                  {editMode && (
                    <div
                      style={{
                        position: "absolute",
                        top: -4,
                        right: 0,
                        display: "flex",
                        gap: 4,
                        zIndex: 20,
                      }}
                      className="group-hover/hero-celeb:!opacity-100"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          upProfile(
                            "showCelebrationText",
                            p.showCelebrationText === false ? true : false,
                          )
                        }
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "white",
                          border: `1px solid ${PINK_L}`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        }}
                      >
                        {p.showCelebrationText !== false ? (
                          <Eye
                            className="w-3 h-3"
                            style={{ color: PINK_DARK }}
                          />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  )}
                  <div
                    style={{
                      opacity: p.showCelebrationText === false ? 0.25 : 1,
                      transition: "opacity 0.2s",
                      marginBottom: "10px",
                    }}
                  >
                    <InlineEdit
                      tag="p"
                      editMode={editMode}
                      value={
                        (profile as any).celebrationText ||
                        CASTLE_DEFAULTS.celebrationText
                      }
                      onChange={(v) => upProfile("celebrationText", v)}
                      style={{
                        fontFamily: HeroText,
                        fontStyle: "italic",
                        fontWeight: 400,
                        color: PINK_DARK,
                        fontSize: "1.6rem",
                        marginBottom: 0,
                        lineHeight: 1.5,
                      }}
                    />
                  </div>
                </div>
              )}
            </Reveal>
          </div>

          <div className="space-y-0">
            {/* Buton insert ÎNAINTE de primul bloc */}
            {editMode && (
              <InsertBlockButton
                insertIdx={-1}
                openInsertAt={openInsertAt}
                setOpenInsertAt={setOpenInsertAt}
                BLOCK_TYPES={BLOCK_TYPES}
                onInsert={(type, def) => {
                  addBlockAt(-1, type, def);
                  setOpenInsertAt(null);
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
                        {
                          blockId: block.id,
                          textStyles: block.textStyles,
                          onTextSelect: (textKey, textLabel) => onBlockSelect?.(block, idx, textKey, textLabel),
                          fontFamily: block.blockFontFamily,
                          fontSize: block.blockFontSize,
                          fontWeight: block.blockFontWeight,
                          fontStyle: block.blockFontStyle,
                          letterSpacing: block.blockLetterSpacing,
                          lineHeight: block.blockLineHeight,
                          textColor: block.textColor && block.textColor !== 'transparent' ? block.textColor : undefined,
                          textAlign: block.blockAlign,
                        } as BlockStyle
                      }
                    >
                      {editMode && (
                        <BlockToolbar
                          onUp={() => movBlock(idx, -1)}
                          onDown={() => movBlock(idx, 1)}
                          onToggle={() =>
                            updBlock(idx, { show: block.show === false })
                          }
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
                          style={{ pointerEvents: "auto" }} // overlay interactiv doar în editMode
                        >
                          {/* backdrop semi-transparent */}
                          <div
                            className="absolute inset-0 rounded-lg"
                            style={{
                              background: "rgba(0,0,0,0.1)",
                              backdropFilter: "blur(3px)",
                            }}
                          />

                          {/* card central */}
                          <div
                            className="relative z-10 flex flex-col items-center gap-3"
                            style={{
                              borderRadius: 14,
                              boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                              minWidth: 260,
                              textAlign: "center",
                            }}
                          >
                            <EyeOff size={22} color={PINK_DARK} />
                          </div>
                        </div>
                      )}

                      {block.type === "photo" && (
                        <Reveal>
                          <div
                            onClick={
                              editMode
                                ? () => onBlockSelect?.(block, idx)
                                : undefined
                            }
                            style={
                              editMode
                                ? {
                                    cursor: "pointer",
                                    outline:
                                      selectedBlockId === block.id
                                        ? `2px solid ${PINK_DARK}`
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
                              onUpload={(url) =>
                                updBlock(idx, { imageData: url })
                              }
                              onRemove={() =>
                                updBlock(idx, { imageData: undefined })
                              }
                              onRatioChange={(r) =>
                                updBlock(idx, { aspectRatio: r })
                              }
                              onClipChange={(c) =>
                                updBlock(idx, { photoClip: c })
                              }
                              onMasksChange={(m) =>
                                updBlock(idx, { photoMasks: m } as any)
                              }
                              aspectRatio={block.aspectRatio as any}
                              photoClip={block.photoClip as any}
                              photoMasks={block.photoMasks as any}
                              placeholderInitial1={name1[0]}
                            />
                          </div>
                        </Reveal>
                      )}
                      {block.type === "text" && (
                        <Reveal>
                          <div className="text-center px-4">
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(idx, { content: v })}
                              style={{
                                fontFamily: HeroText,
                                fontSize: "1.1rem",
                                color: PINK_DARK,
                                lineHeight: "1.8",
                              }}
                            />
                          </div>
                        </Reveal>
                      )}
                      {block.type === "location" && (
                        <Reveal>
                          <div
                            style={{
                              background: "white",
                              borderRadius: 20,
                              overflow: "hidden",
                              boxShadow:
                                "0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(190,24,93,0.08)",
                              border: `1px solid ${PINK_L}`,
                            }}
                          >
                            {/* Top accent bar */}
                            <div
                              style={{
                                height: 3,
                                background: `linear-gradient(to right, ${PINK_L}, ${PINK_DARK}, ${PINK_L})`,
                              }}
                            />

                            <div style={{ padding: "22px 22px 20px" }}>
                              {/* Header row: badge ora + label */}
                              {(block.label || block.time) && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 18,
                                  }}
                                >
                                  {block.time && (
                                    <div
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 5,
                                        background: PINK_XL,
                                        border: `1px solid ${PINK_L}`,
                                        borderRadius: 10,
                                        padding: "5px 11px",
                                      }}
                                    >
                                      <svg
                                        width="11"
                                        height="11"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={PINK_DARK}
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                      </svg>
                                      <span
                                        style={{
                                          fontFamily: SANS,
                                          fontSize: "0.65rem",
                                          fontWeight: 700,
                                          color: PINK_DARK,
                                          letterSpacing: "0.04em",
                                        }}
                                      >
                                        {block.time}
                                      </span>
                                    </div>
                                  )}
                                  {block.label && (
                                    <InlineEdit
                                      tag="span"
                                      editMode={editMode}
                                      value={block.label}
                                      onChange={(v) =>
                                        updBlock(idx, { label: v })
                                      }
                                      placeholder="Tip locație..."
                                      style={{
                                        fontFamily: SANS,
                                        fontSize: "0.58rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.28em",
                                        textTransform: "uppercase",
                                        color: MUTED,
                                      }}
                                    />
                                  )}
                                </div>
                              )}

                              {/* Body: icon + info */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 14,
                                  marginBottom: 18,
                                }}
                              >
                                {/* Icon square */}
                                <div
                                  style={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: 14,
                                    flexShrink: 0,
                                    background: `linear-gradient(145deg, ${PINK_XL} 0%, ${PINK_L}44 100%)`,
                                    border: `1.5px solid ${PINK_L}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <MapPin
                                    className="w-5 h-5"
                                    style={{ color: PINK_DARK }}
                                  />
                                </div>

                                {/* Text info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <InlineEdit
                                    tag="h3"
                                    editMode={editMode}
                                    value={block.locationName || ""}
                                    onChange={(v) =>
                                      updBlock(idx, { locationName: v })
                                    }
                                    placeholder="Numele locației..."
                                    style={{
                                      fontFamily: SCRIPT,
                                      fontSize: "1.45rem",
                                      color: PINK_L,
                                      margin: "0 0 3px",
                                      lineHeight: 1.15,
                                      fontWeight: 600,
                                    }}
                                  />
                                  <InlineEdit
                                    tag="p"
                                    editMode={editMode}
                                    value={block.locationAddress || ""}
                                    onChange={(v) =>
                                      updBlock(idx, { locationAddress: v })
                                    }
                                    placeholder="Adresa completă..."
                                    multiline
                                    style={{
                                      fontFamily: SANS,
                                      fontSize: "0.68rem",
                                      color: MUTED,
                                      lineHeight: 1.65,
                                      margin: 0,
                                      letterSpacing: "0.01em",
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Waze button — full width, pink-themed, rounded-lg */}
                              {(block.wazeLink || editMode) && (
                                <WazeButton
                                  wazeLink={block.wazeLink || ""}
                                  editMode={editMode}
                                  onChange={(v) =>
                                    updBlock(idx, { wazeLink: v })
                                  }
                                />
                              )}
                            </div>
                          </div>
                        </Reveal>
                      )}
                      {block.type === "calendar" && (
                        <Reveal>
                          <CalendarMonth date={profile.weddingDate} />
                        </Reveal>
                      )}
                      {block.type === "countdown" && (
                        <FlipClock
                          targetDate={profile.weddingDate}
                          bgColor={PINK_DARK}
                          textColor="white"
                          accentColor={PINK_L}
                          labelColor="rgba(255,255,255,0.7)"
                          editMode={editMode}
                          titleText={
                            block.countdownTitle ||
                            "Timp rămas până la Marele Eveniment"
                          }
                          onTitleChange={(text) =>
                            updBlock(idx, { countdownTitle: text })
                          }
                        />
                      )}
                      {block.type === "music" && (
                        <Reveal>
                          <MusicBlock
                            block={block}
                            editMode={editMode}
                            onUpdate={(p) => updBlock(idx, p)}
                            imperativeRef={musicPlayRef}
                          />
                        </Reveal>
                      )}
                      {block.type === "gift" && (
                        <Reveal>
                          <div
                            style={{
                              background: PINK_DARK,
                              borderRadius: 16,
                              padding: 24,
                              textAlign: "center",
                              color: "white",
                            }}
                          >
                            <Gift className="w-8 h-8 mx-auto mb-4 opacity-70" />
                            <InlineEdit
                              tag="h3"
                              editMode={editMode}
                              value={block.sectionTitle || "Sugestie de cadou"}
                              onChange={(v) =>
                                updBlock(idx, { sectionTitle: v })
                              }
                              style={{
                                fontFamily: SCRIPT,
                                fontSize: "2rem",
                                marginBottom: 8,
                              }}
                            />
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(idx, { content: v })}
                              multiline
                              style={{
                                fontFamily: SANS,
                                fontSize: 11,
                                opacity: 0.8,
                                lineHeight: 1.6,
                              }}
                            />
                            {(block.iban || editMode) && (
                              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                                <InlineEdit
                                  tag="p"
                                  editMode={editMode}
                                  value={block.iban || ""}
                                  onChange={(v) => updBlock(idx, { iban: v })}
                                  placeholder="IBAN..."
                                  style={{
                                    fontFamily: SANS,
                                    fontSize: 10,
                                    fontWeight: 700,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </Reveal>
                      )}

                      {block.type === "whatsapp" && (
                        <Reveal>
                          <div className="flex flex-col items-center gap-4">
                            <a
                              href={`https://wa.me/${(block.content || "").replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/wa flex items-center gap-4 px-8 py-4 bg-white text-green-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-green-100 hover:-translate-y-1"
                            >
                              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 group-hover/wa:scale-110 transition-transform">
                                <MessageCircle className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <InlineEdit
                                  tag="p"
                                  editMode={editMode}
                                  value={block.label || "Contact WhatsApp"}
                                  onChange={(v) => updBlock(idx, { label: v })}
                                  style={{
                                    fontWeight: 800,
                                    fontSize: 13,
                                    color: "#1a1a1a",
                                    margin: 0,
                                  }}
                                />
                                <p
                                  style={{
                                    fontFamily: SANS,
                                    fontSize: 10,
                                    color: "#666",
                                    margin: 0,
                                  }}
                                >
                                  Răspundem rapid
                                </p>
                              </div>
                            </a>
                            {editMode && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  background: "white",
                                  border: `1px solid ${PINK_L}`,
                                  borderRadius: 12,
                                  padding: "8px 16px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: SANS,
                                    fontSize: "0.6rem",
                                    fontWeight: 800,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: MUTED,
                                  }}
                                >
                                  Număr:
                                </span>
                                <InlineEdit
                                  tag="span"
                                  editMode={editMode}
                                  value={block.content || "0700000000"}
                                  onChange={(v) =>
                                    updBlock(idx, { content: v })
                                  }
                                  style={{
                                    fontFamily: SANS,
                                    fontSize: "0.9rem",
                                    color: TEXT,
                                    fontWeight: 700,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </Reveal>
                      )}
                      {block.type === "rsvp" && (
                        <Reveal>
                          <div className="flex justify-center">
                            <button
                              onClick={() => {
                                if (!editMode) onOpenRSVP?.();
                              }}
                              className="group flex items-center justify-center px-6 py-3 rounded-full shadow-lg transition-all"
                              style={{
                                fontFamily: SANS,
                                background: `linear-gradient(to bottom, ${PINK_DARK}, ${PINK_L})`,
                                color: "white",
                              }}
                            >
                              {/* ICON WRAPPER */}
                              <div
                                className="flex items-center justify-center mr-2 transition-all"
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  backgroundColor: "rgba(255,255,255,0.2)",
                                }}
                              >
                                <svg
                                  className="transition-all duration-300 group-hover:rotate-45"
                                  viewBox="0 0 24 24"
                                  width="18"
                                  height="18"
                                  fill="white"
                                >
                                  <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                                </svg>
                              </div>

                              {/* TEXT */}
                              <span className="transition-all ml-1 text-sm font-bold tracking-wider uppercase">
                                <InlineEdit
                                  tag="span"
                                  editMode={editMode}
                                  value={block.label || "Confirmă Prezența"}
                                  onChange={(v) => updBlock(idx, { label: v })}
                                />
                              </span>
                            </button>
                          </div>
                        </Reveal>
                      )}
                      {block.type === "divider" && (
                        <Reveal>
                          <WildDivider />
                        </Reveal>
                      )}
                      {block.type === "date" && (
                        <Reveal>
                          <div
                            style={{ textAlign: "center", padding: "4px 0" }}
                          >
                            <p
                              style={{
                                fontFamily: SANS,
                                fontWeight: 700,
                                letterSpacing: "0.3em",
                                fontSize: "0.85rem",
                                color: PINK_DARK,
                                margin: 0,
                              }}
                            >
                              {dateStr}
                            </p>
                          </div>
                        </Reveal>
                      )}
                      {block.type === "description" && (
                        <Reveal>
                          <div
                            style={{ textAlign: "center", padding: "0 16px" }}
                          >
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(idx, { content: v })}
                              style={{
                                fontFamily: SERIF,
                                fontSize: "0.85rem",
                                color: MUTED,
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
                              <div
                                style={{
                                  background: "white",
                                  border: `1px solid ${PINK_L}`,
                                  borderRadius: 20,
                                  padding: "28px 24px",
                                  textAlign: "center",
                                }}
                              >
                                <div style={{ marginBottom: 20 }}>
                                  <InlineEdit
                                    tag="p"
                                    editMode={editMode}
                                    value={block.label || "Părinții copilului"}
                                    onChange={(v) =>
                                      updBlock(idx, { label: v })
                                    }
                                    style={{
                                      fontFamily: SANS,
                                      fontSize: "0.55rem",
                                      fontWeight: 700,
                                      letterSpacing: "0.35em",
                                      textTransform: "uppercase",
                                      color: MUTED,
                                      margin: "0 0 8px",
                                    }}
                                  />
                                  <InlineEdit
                                    tag="p"
                                    editMode={editMode}
                                    value={
                                      block.content || "Cu drag și recunoștință"
                                    }
                                    onChange={(v) =>
                                      updBlock(idx, { content: v })
                                    }
                                    style={{
                                      fontFamily: SERIF,
                                      fontStyle: "italic",
                                      fontSize: "0.9rem",
                                      color: MUTED,
                                      margin: 0,
                                      lineHeight: 1.6,
                                    }}
                                  />
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 14,
                                  }}
                                >
                                  {members.map((m, mi) => (
                                    <div
                                      key={mi}
                                      style={{ position: "relative" }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          gap: 10,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <InlineEdit
                                          tag="span"
                                          editMode={editMode}
                                          value={m.name1}
                                          onChange={(v) => {
                                            const nm = [...members];
                                            nm[mi] = { ...nm[mi], name1: v };
                                            updateMembers(nm);
                                          }}
                                          style={{
                                            fontFamily: SCRIPT,
                                            fontSize: "1.5rem",
                                            color: PINK_DARK,
                                          }}
                                        />
                                        <span
                                          style={{
                                            fontFamily: SERIF,
                                            fontStyle: "italic",
                                            color: PINK_L,
                                            fontSize: "1.3rem",
                                          }}
                                        >
                                          &amp;
                                        </span>
                                        <InlineEdit
                                          tag="span"
                                          editMode={editMode}
                                          value={m.name2}
                                          onChange={(v) => {
                                            const nm = [...members];
                                            nm[mi] = { ...nm[mi], name2: v };
                                            updateMembers(nm);
                                          }}
                                          style={{
                                            fontFamily: SCRIPT,
                                            fontSize: "1.5rem",
                                            color: PINK_DARK,
                                          }}
                                        />
                                        {editMode && members.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateMembers(
                                                members.filter(
                                                  (_, i) => i !== mi,
                                                ),
                                              )
                                            }
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
                                      {mi < members.length - 1 && (
                                        <div
                                          style={{
                                            height: 1,
                                            background: `linear-gradient(to right, transparent, ${PINK_L}88, transparent)`,
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
                                      background: PINK_XL,
                                      border: `1px dashed ${PINK_L}`,
                                      borderRadius: 99,
                                      padding: "5px 16px",
                                      cursor: "pointer",
                                      fontFamily: SANS,
                                      fontSize: "0.6rem",
                                      fontWeight: 700,
                                      letterSpacing: "0.2em",
                                      textTransform: "uppercase",
                                      color: PINK_DARK,
                                    }}
                                  >
                                    + Adaugă
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </Reveal>
                      )}
                    </BlockStyleProvider>
                  </div>
                  {/* Buton insert DUPĂ fiecare bloc */}
                  {editMode && (
                    <InsertBlockButton
                      insertIdx={idx}
                      openInsertAt={openInsertAt}
                      setOpenInsertAt={setOpenInsertAt}
                      BLOCK_TYPES={BLOCK_TYPES}
                      onInsert={(type, def) => {
                        addBlockAt(idx, type, def);
                        setOpenInsertAt(null);
                      }}
                    />
                  )}
                </div>
              ))}
          </div>

          {profile.showTimeline &&
            (() => {
              const timelineItems = safeJSON(profile.timeline, []);
              if (!timelineItems.length) return null;
              return (
                <Reveal>
                  <div
                    style={{
                      background: "white",
                      border: `1px solid ${PINK_L}`,
                      borderRadius: 16,
                      padding: "20px 24px",
                      marginTop: 40,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: SANS,
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
                            justifyContent: "flex-end",
                            paddingRight: 10,
                            paddingTop: 10,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: SERIF,
                              fontSize: 15,
                              fontWeight: 600,
                              color: PINK_DARK,
                              lineHeight: 1.2,
                            }}
                          >
                            {item.time}
                          </span>
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
                          <span
                            style={{
                              fontFamily: SANS,
                              fontSize: 15,
                              fontWeight: 600,
                              color: TEXT,
                              display: "block",
                              lineHeight: 1.3,
                            }}
                          >
                            {item.title}
                          </span>
                          {item.notice && (
                            <span
                              style={{
                                fontFamily: SERIF,
                                fontSize: 13,
                                fontStyle: "italic",
                                color: MUTED,
                                display: "block",
                                marginTop: 4,
                                lineHeight: 1.5,
                              }}
                            >
                              {item.notice}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              );
            })()}

          {/* {showRsvp && (
            <Reveal>
              <div className="text-center mt-10">
                <WildDivider />
                <button
                  onClick={() => onOpenRSVP?.()}
                  className="mt-6 px-10 py-4 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                  {rsvpText}
                </button>
              </div>
            </Reveal>
          )} */}

          {editMode && (
            <div className="mt-6 pt-6 border-t border-pink-100 text-center">
              <button
                onClick={resetToDefaults}
                className="px-6 py-2.5 bg-white border-2 border-rose-200 rounded-full text-[10px] font-bold text-rose-400 uppercase tracking-widest hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm flex items-center gap-2 mx-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Resetează la valorile implicite
              </button>
            </div>
          )}

          <div className="mt-24 text-center opacity-40">
            <WildDivider />
            <p className="font-serif italic text-xs  mt-4 py-8" >
              Creat cu dragoste de WeddingPro
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CastleMagicTemplate;
