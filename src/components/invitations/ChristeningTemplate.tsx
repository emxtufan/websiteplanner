import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WeddingIcon } from "../TimelineIcons";
gsap.registerPlugin(ScrollTrigger);
import { BlockStyleProvider, BlockStyle } from '../BlockStyleContext';

import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus,
  Upload, Camera, Play, Pause, SkipForward, SkipBack,
  MapPin, Gift, Music, Heart, Sparkles, MessageCircle, Image as ImageIcon
} from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";

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
  id: 'castle-magic',
  name: 'Castle Magic',
  category: 'baptism',
  description: 'Design de poveste cu castel roz și efect de deschidere orizontală pe bază de scroll.',
  colors: ['#fdf2f8', '#be185d', '#f472b6'],
  previewClass: "bg-pink-50 border-pink-200",
  elementsClass: "bg-pink-500",
};

const PINK_DARK = '#e9bbd2';
const PINK_D    = '#e9bbd2';
const PINK_L    = '#e9bbd2';
const PINK_XL   = '#fdf2f8';
const CREAM     = '#fff5f7';
const TEXT      = '#4a1d1f';
const MUTED     = '#9d7074';
const GOLD      = '#d4af37';
const SERIF     = "'Playfair Display', serif";
const SCRIPT    = "'Great Vibes', cursive";
const SANS      = "'Montserrat', sans-serif";

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
  const ytId = block.musicType === 'youtube' ? extractYtId(block.musicUrl || '') : null;
  const ytContainerId = useRef(`yt-cm-${Math.random().toString(36).slice(2)}`).current;
  const playerRef = useRef<any>(null);
  const tickRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ytReady, setYtReady] = useState(false);
  const [ytPlay,  setYtPlay]  = useState(false);

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

  useEffect(() => {
    if (block.musicType !== 'youtube' || !ytId) return;
    loadYtApi_cm(() => {
      playerRef.current = new window.YT.Player(ytContainerId, {
        videoId: ytId,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: (e: any) => { setDuration(e.target.getDuration() || 0); setYtReady(true); },
          onStateChange: (e: any) => {
            const YT = window.YT.PlayerState;
            if (e.data === YT.PLAYING) {
              setYtPlay(true);
              setDuration(playerRef.current?.getDuration() || 0);
              tickRef.current = setInterval(() => setProgress(playerRef.current?.getCurrentTime() || 0), 500);
            } else {
              setYtPlay(false);
              if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
            }
          },
        },
      });
    });
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      try { playerRef.current?.destroy(); } catch {}
    };
  }, [ytId]);

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
  const toggleYt = () => {
    if (!ytReady || !playerRef.current) return;
    ytPlay ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };
  const seekYt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ytReady || !duration || !playerRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    playerRef.current.seekTo(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration, true);
  };
  const handleMp3 = (file: File) => {
    if (!file.type.startsWith('audio/')) return;
    const reader = new FileReader();
    reader.onload = e => { onUpdate({ musicUrl: e.target?.result as string, musicType: 'mp3' }); };
    reader.readAsDataURL(file);
  };
  const submitYt = async () => {
    const id = extractYtId(ytUrl.trim()); if (!id) return;
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
      if (res.ok) {
        const d = await res.json();
        if (d.title)       onUpdate({ musicTitle: d.title });
        if (d.author_name) onUpdate({ musicArtist: d.author_name });
      }
    } catch (_) {}
    onUpdate({ musicUrl: ytUrl.trim(), musicType: 'youtube' });
    setShowYt(false); setYtUrl('');
  };

  const isActive  = (block.musicType === 'youtube' && !!ytId) || (block.musicType === 'mp3' && !!block.musicUrl);
  const isPlaying = block.musicType === 'youtube' ? ytPlay : playing;

  // Expose unlock / play / pause to parent via imperativeRef
  useEffect(() => {
    if (!imperativeRef) return;
    imperativeRef.current = {
      // Called on user gesture (modal button click) — unlocks browser autoplay restriction
      unlock: () => {
        if (block.musicType === 'mp3' && audioRef.current && block.musicUrl) {
          audioRef.current.play().then(() => { audioRef.current!.pause(); audioRef.current!.currentTime = 0; }).catch(() => {});
        }
      },
      // Called when doors open — starts playback (already unlocked)
      play: () => {
        if (block.musicType === 'mp3' && audioRef.current && block.musicUrl) {
          audioRef.current.play().catch(() => {});
        } else if (block.musicType === 'youtube' && playerRef.current && ytReady) {
          try { playerRef.current.playVideo(); } catch (_) {}
        }
      },
      pause: () => {
        if (block.musicType === 'mp3' && audioRef.current) {
          audioRef.current.pause();
        } else if (block.musicType === 'youtube' && playerRef.current) {
          try { playerRef.current.pauseVideo(); } catch (_) {}
        }
      },
    };
  });
  const toggle    = block.musicType === 'youtube' ? toggleYt : toggleMp3;
  const seek      = block.musicType === 'youtube' ? seekYt   : seekMp3;

  return (
    <div style={{ background: 'white', border: `1px solid ${PINK_L}`, borderRadius: 16, padding: '20px 24px' }}>
      {block.musicType === 'mp3' && block.musicUrl && (
        <audio ref={audioRef} src={block.musicUrl} preload="metadata" />
      )}
      {block.musicType === 'youtube' && ytId && (
        <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, zIndex: -1 }}>
          <div id={ytContainerId} />
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: PINK_XL, border: `1.5px solid ${PINK_L}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Music className="w-4 h-4" style={{ color: PINK_DARK }} />
        </div>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: MUTED }}>
          Melodia Zilei
        </span>
      </div>

      {/* No source yet — edit mode */}
      {!isActive && editMode && (
        <div>
          {showYt ? (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input
                value={ytUrl} onChange={e => setYtUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitYt()}
                placeholder="https://youtu.be/..." autoFocus
                style={{ flex: 1, background: PINK_XL, border: `1px solid ${PINK_L}`, borderRadius: 8, padding: '9px 12px', fontFamily: SANS, fontSize: 11, color: TEXT, outline: 'none' }}
              />
              <button type="button" onClick={submitYt}
                style={{ background: PINK_DARK, border: 'none', borderRadius: 8, padding: '0 14px', cursor: 'pointer', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'white' }}>✓</button>
              <button type="button" onClick={() => { setShowYt(false); setYtUrl(''); }}
                style={{ background: PINK_XL, border: 'none', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: MUTED, fontSize: 14 }}>✕</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setShowYt(true)}
                style={{ flex: 1, background: PINK_XL, border: `1px dashed ${PINK_L}`, borderRadius: 10, padding: '14px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                  <rect width="22" height="16" rx="3.5" fill="#FF0000" opacity="0.85"/>
                  <path d="M9 5L15 8L9 11Z" fill="white"/>
                </svg>
                <span style={{ fontFamily: SANS, fontSize: 9, color: MUTED, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>YouTube</span>
              </button>
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

      {/* No source — view mode */}
      {!isActive && !editMode && (
        <div style={{ textAlign: 'center', padding: '16px 0', opacity: 0.4 }}>
          <Music className="w-8 h-8" style={{ color: PINK_DARK, display: 'block', margin: '0 auto 6px' }} />
          <p style={{ fontFamily: SERIF, fontSize: 12, fontStyle: 'italic', color: MUTED, margin: 0 }}>Melodia va apărea aici</p>
        </div>
      )}

      {/* Player */}
      {isActive && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            {block.musicType === 'youtube' && ytId ? (
              <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: `1.5px solid ${PINK_L}` }}>
                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 10, background: PINK_XL, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${PINK_L}` }}>
                <Music className="w-5 h-5" style={{ color: PINK_DARK, opacity: 0.4 }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle || ''} onChange={v => onUpdate({ musicTitle: v })} placeholder="Titlul melodiei..."
                style={{ fontFamily: SERIF, fontSize: 14, fontStyle: 'italic', color: TEXT, margin: 0, lineHeight: 1.3 }} />
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist || ''} onChange={v => onUpdate({ musicArtist: v })} placeholder="Artist..."
                style={{ fontFamily: SANS, fontSize: 10, color: MUTED, margin: '2px 0 0' }} />
            </div>
          </div>

          {/* Progress bar */}
          <div onClick={seek} style={{ height: 4, background: PINK_L, borderRadius: 99, marginBottom: 6, cursor: 'pointer', position: 'relative' }}>
            <div style={{ height: '100%', borderRadius: 99, background: PINK_DARK, width: pct, transition: 'width 0.3s linear' }} />
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: pct, marginLeft: -5, width: 10, height: 10, borderRadius: '50%', background: PINK_DARK, transition: 'left 0.3s linear' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: SANS, fontSize: 9, color: MUTED }}>{fmt(progress)}</span>
            <span style={{ fontFamily: SANS, fontSize: 9, color: MUTED }}>{duration ? fmt(duration) : '--:--'}</span>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <button type="button"
              onClick={() => {
                const a = audioRef.current; if (a) a.currentTime = Math.max(0, a.currentTime - 10);
                if (playerRef.current) playerRef.current.seekTo(Math.max(0, progress - 10), true);
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
                if (playerRef.current) playerRef.current.seekTo(Math.min(duration, progress + 10), true);
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
  <div className="flex items-center gap-4 my-8">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
    <Sparkles className="w-4 h-4 text-pink-400 opacity-60" />
    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-pink-300 to-transparent" />
  </div>
);
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-4 right-2 flex items-center gap-1 rounded-full border bg-white shadow-lg px-2 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto">
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
    <MapPin className="w-8 h-8 text-pink-100 mx-auto mb-4" />
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

// ── Door hint & welcome ───────────────────────────────────────────────────────
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

// ── Seam Particles — montate pe marginea ușii, urmăresc automat prin GSAP ─────
// Generat static — niciodată nu se recalculează
const _SEAM_PX = Array.from({ length: 240 }, (_, i) => {
  const a = (Math.imul(i * 2654435761 + 1013904223, 1) >>> 0);
  const b = (Math.imul((a ^ (a >> 16)) * 2246822519, 1) >>> 0);
  const c = (Math.imul((b ^ (b >> 13)) * 3266489917, 1) >>> 0);
  const d = (Math.imul((c ^ (c >> 15)) * 2654435761, 1) >>> 0);
  const spreadDeg = ((d % 120) - 60);
  const angleRad  = (spreadDeg * Math.PI) / 180;
  const dist = 80 + (b % 300);
  const size = 1 + (c % 15);  // 1px → 14px — mix de mici și mari
  return {
    top:    (i / 160) * 98 + 1,
    ex:     Math.round(Math.cos(angleRad) * dist),
    ey:     Math.round(Math.sin(angleRad) * dist),
    size,
    glow:   size * 2,          // glow proporțional cu mărimea
    dur:    `${0.4 + (a % 60) / 10}s`,
    delay:  `${-(b % 40) / 10}s`,
    warm:   158 + (b % 97),
    bright: 0.55 + (c % 5) * 0.09,
  };
});

const DoorSeam: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      [side === 'left' ? 'right' : 'left']: '-2px',
      width: 1,
      height: '100%',
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: 20,
    }}
  >
    <style>{`
      @keyframes sp-fly {
        0%   { opacity: 0; transform: translate(var(--sx),var(--sy)) scale(1.3); }
        15%  { opacity: 1; }
        70%  { opacity: 0.7; }
        100% { opacity: 0; transform: translate(var(--ex),var(--ey)) scale(0); }
      }

      @keyframes sp-line {
        0%,100% { opacity:.75 }
        50% { opacity:1 }
      }
    `}</style>

    {/* Linia roz pudrat */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 3,
        height: '100%',
        transform: 'translateX(-50%)',
        background: `
          linear-gradient(
            to bottom,
            transparent 0%,
            rgba(233,187,210,0.08) 5%,
            rgba(233,187,210,0.85) 32%,
            rgba(255,240,248,1) 50%,
            rgba(233,187,210,0.85) 68%,
            rgba(233,187,210,0.08) 95%,
            transparent 100%
          )
        `,
        boxShadow: `
  0 0 10px 3px rgba(233,187,210,0.8),
  0 0 30px 10px rgba(233,187,210,0.55),
  0 0 70px 25px rgba(233,187,210,0.35)
`,
        animation: 'sp-line 3.5s ease-in-out infinite',
      }}
    />

    {/* Halo difuz */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 60,
        height: '100%',
        transform: side === 'left' ? 'translateX(-100%)' : 'translateX(0%)',
        background:
          side === 'left'
            ? 'linear-gradient(to left, rgba(233,187,210,0.18) 0%, transparent 100%)'
            : 'linear-gradient(to right, rgba(233,187,210,0.18) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}
    />

    {/* Particule roz pudrat */}
    {_SEAM_PX.map((p, i) => {
      const finalEx = side === 'left' ? -Math.abs(p.ex) : Math.abs(p.ex)

      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${p.top}%`,
            left: 0,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: `rgba(233,187,210,${p.bright})`,
            boxShadow: `0 0 ${p.glow}px ${Math.round(
              p.glow / 2
            )}px rgba(233,187,210,0.45)`,
            animation: `sp-fly ${p.dur} ease-out ${p.delay} infinite`,
            willChange: 'transform, opacity',
            transform: 'translate(-50%, -50%)',
            ['--sx' as any]: '0px',
            ['--sy' as any]: '0px',
            ['--ex' as any]: `${finalEx}px`,
            ['--ey' as any]: `${p.ey}px`,
          }}
        />
      )
    })}
  </div>
)

// ── Castle overlay ────────────────────────────────────────────────────────────
const CastleOverlayText: React.FC<{ childName: string; subtitle: string; welcomeText: string; editMode?: boolean; overlayRef?: React.RefObject<HTMLDivElement>; onChildNameChange?: (v: string) => void; onSubtitleChange?: (v: string) => void; onWelcomeChange?: (v: string) => void }> =
  ({ childName, subtitle, welcomeText, editMode, overlayRef, onChildNameChange, onSubtitleChange, onWelcomeChange }) => (
  <div ref={overlayRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15, pointerEvents: editMode ? 'auto' : 'none' }}>
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0,0,0,0.48) 0%, transparent 100%)' }} />
    <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
      {editMode ? (
        <InlineEdit tag="p" editMode value={welcomeText} onChange={v => onWelcomeChange?.(v)} textKey="intro:welcome" textLabel="Intro Welcome" style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#e9bbd2',  }} />
      ) : (
        <svg width="290" height="74" viewBox="0 0 290 74" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
          <defs>
            <path id="castleArc" d="M 22,68 A 122,122 0 0,1 268,68" />
            <filter id="castleGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <text filter="url(#castleGlow)" fontFamily="Cinzel, serif" fontSize="20" fontWeight="700" letterSpacing="11" fill="#e9bbd2">
            <textPath href="#castleArc" startOffset="50%" textAnchor="middle">{welcomeText}</textPath>
          </text>
        </svg>
      )}
    </div>
    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', textAlign: 'center', zIndex: 1, padding: '0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <InlineEdit tag="h2" editMode={!!editMode} value={childName} onChange={v => onChildNameChange?.(v)} textKey="intro:name" textLabel="Intro Name" style={{ fontFamily: 'Great Vibes, cursive', fontSize: '3.2rem', lineHeight: 1.15, color: '#e9bbd2', textShadow: '0 2px 24px rgba(0,0,0,0.85), 0 0 40px rgba(255,180,0,0.35)', margin: '2px auto 0', maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word', textWrap: 'balance' }} />
      <InlineEdit tag="p" editMode={!!editMode} value={subtitle} onChange={v => onSubtitleChange?.(v)} textKey="intro:subtitle" textLabel="Intro Subtitle" style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#e9bbd2', textShadow: '0 2px 10px rgba(0,0,0,0.75)', marginTop: 2 }} />
    </div>
  </div>
);

// ── Castle Intro ──────────────────────────────────────────────────────────────
const CastleIntro: React.FC<{
  onDone: () => void; castleUrl?: string; castleUrlMobile?: string;
  editMode?: boolean; contentEl?: HTMLElement | null;
  scrollContainer?: HTMLElement | null;
  previewMode?: 'doors' | 'static';
  childName?: string; subtitle?: string; welcomeText?: string;
  onChildNameChange?: (v: string) => void; onSubtitleChange?: (v: string) => void; onWelcomeChange?: (v: string) => void;
  onDoorsOpen?: () => void;
}> = ({ onDone, castleUrl, castleUrlMobile, editMode, contentEl, scrollContainer, previewMode = 'doors', childName = '', subtitle = 'in my castle', welcomeText = 'WELCOME', onChildNameChange, onSubtitleChange, onWelcomeChange, onDoorsOpen }) => {
  const leftDoorRef  = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const hintRef      = useRef<HTMLDivElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const seamRef      = useRef<HTMLDivElement>(null);
  const seamRef2     = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (editMode || !leftDoorRef.current || !rightDoorRef.current || !contentEl) return;

    // Pure GPU transforms only — zero repaints, zero lag
    gsap.set(contentEl, { opacity: 0 });
    gsap.set(seamRef.current,  { opacity: 0 });
    gsap.set(seamRef2.current, { opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(leftDoorRef.current,  { xPercent: -100, ease: 'none', duration: 1 }, 0);
    tl.to(rightDoorRef.current, { xPercent:  100, ease: 'none', duration: 1 }, 0);
    tl.to(contentEl,            { opacity: 1,     ease: 'none', duration: 1 }, 0);
    if (hintRef.current)    tl.to(hintRef.current,    { opacity: 0, ease: 'none', duration: 0.2 }, 0);
    if (overlayRef.current) tl.to(overlayRef.current, { opacity: 0, ease: 'none', duration: 0.3 }, 0);
    // Particule: apar rapid la start, dispar spre final când ușile s-au deschis complet
    if (seamRef.current) {
      tl.to(seamRef.current,  { opacity: 1, ease: 'none', duration: 0.08 }, 0);
      tl.to(seamRef.current,  { opacity: 0, ease: 'power2.in', duration: 0.25 }, 0.75);
    }
    if (seamRef2.current) {
      tl.to(seamRef2.current, { opacity: 1, ease: 'none', duration: 0.08 }, 0);
      tl.to(seamRef2.current, { opacity: 0, ease: 'power2.in', duration: 0.25 }, 0.75);
    }

    let _musicFired = false;
    const st = ScrollTrigger.create({
      trigger: contentEl,
      scroller: scrollContainer || undefined,
      start: 'top top',
      end: '+=100%',      // 1 full viewport scroll = doors open completely
      pin: true,
      scrub: true,        // scrub:true = perfectly 1:1 with finger, zero lag
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        tl.progress(self.progress);
        if (!_musicFired && self.progress > 0.01) {
          _musicFired = true;
          onDoorsOpen?.();
        }
      },
      onLeave: () => {
        if (wrapRef.current) wrapRef.current.style.display = 'none';
      },
      onEnterBack: () => {
        _musicFired = false;
        if (wrapRef.current) { wrapRef.current.style.display = 'block'; }
      },
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { st.kill(); tl.kill(); gsap.set(contentEl, { clearProps: 'all' }); };
  }, [editMode, contentEl, scrollContainer]);

  const defaultCastle = "https://img.freepik.com/free-photo/view-castle-with-nature-landscape_23-2150743774.jpg?t=st=1773091383~exp=1773094983~hmac=439b5a8dcda86708005bb2443a8e6985cb302ae3eff9dac2d235698f4c24d914&w=2000";
  const finalImg = isMobile ? (castleUrlMobile || castleUrl || defaultCastle) : (castleUrl || castleUrlMobile || defaultCastle);

  if (editMode && previewMode === 'static') {
    return (
      <div style={{ position: 'relative', height: 580, borderRadius: 12, marginBottom: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${finalImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
        <CastleOverlayText
          childName={childName}
          subtitle={subtitle}
          welcomeText={welcomeText}
          editMode={true}
          onChildNameChange={onChildNameChange}
          onSubtitleChange={onSubtitleChange}
          onWelcomeChange={onWelcomeChange}
        />
      </div>
    );
  }

  if (editMode) {
    return (
      <div style={{ position: 'relative', height: 580, borderRadius: 12, marginBottom: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', overflow: 'hidden', borderRadius: '12px 0 0 12px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', backgroundImage: `url(${finalImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', overflow: 'hidden', borderRadius: '0 12px 12px 0' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', backgroundImage: `url(${finalImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}><DoorHint /></div>
        <CastleOverlayText childName={childName} subtitle={subtitle} welcomeText={welcomeText} editMode={true} onChildNameChange={onChildNameChange} onSubtitleChange={onSubtitleChange} onWelcomeChange={onWelcomeChange} />
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
        <div ref={seamRef} style={{ opacity: 0 }}>
          <DoorSeam side="left" />
        </div>
      </div>
      <div ref={rightDoorRef} style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100dvh', overflow: 'visible', willChange: 'transform' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', backgroundImage: `url(${finalImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
        </div>
        <div ref={seamRef2} style={{ opacity: 0 }}>
          <DoorSeam side="right" />
        </div>
      </div>
      <CastleOverlayText childName={childName} subtitle={subtitle} welcomeText={welcomeText} overlayRef={overlayRef} />
      <div ref={hintRef} style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}><DoorHint /></div>
    </div>
  );
};

// ── Audio Permission Modal ────────────────────────────────────────────────────
const AudioPermissionModal: React.FC<{
  childName: string;
  onAllow: () => void;
  onDeny: () => void;
}> = ({ childName, onAllow, onDeny }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {/* Backdrop — pink blur */}
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(157,23,77,0.65)', backdropFilter: 'blur(8px)' }} />
    {/* Card */}
    <div style={{ position: 'relative', background: 'white', borderRadius: 24, padding: '36px 32px 28px', maxWidth: 320, width: '90%', textAlign: 'center', boxShadow: '0 24px 80px rgba(157,23,77,0.35)', border: `1px solid ${PINK_L}` }}>
      <style>{`@keyframes apm-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
      {/* Icon */}
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg,${PINK_L},${PINK_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'apm-pulse 2s ease-in-out infinite', boxShadow: `0 8px 24px rgba(190,24,93,0.35)` }}>
        <Music className="w-8 h-8" style={{ color: 'white' }} />
      </div>
      {/* Text */}
      <p style={{ fontFamily: SCRIPT, fontSize: 26, color: PINK_DARK, margin: '0 0 6px', lineHeight: 1.2 }}>
        {childName}
      </p>
      <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>
        Te invită la o poveste magică 🌟
      </p>
      <p style={{ fontFamily: SANS, fontSize: 11, color: MUTED, margin: '0 0 28px', lineHeight: 1.6 }}>
        Această invitație are o melodie specială.<br/>
        Vrei să activezi muzica?
      </p>
      {/* Buttons */}
      <button type="button" onClick={onAllow}
        style={{ width: '100%', padding: '14px 0', background: `linear-gradient(135deg,${PINK_DARK},${PINK_D})`, border: 'none', borderRadius: 50, cursor: 'pointer', fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.1em', marginBottom: 10,  transition: 'transform 0.15s' }}
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
  const [showIntro, setShowIntro] = useState(!editMode);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

  // ── Audio permission ──────────────────────────────────────────────────────
  const hasMusicBlock = useCallback(() => {
    try { return (JSON.parse(profile.customSections || '[]') as InvitationBlock[]).some(b => b.type === 'music' && b.musicType !== 'none' && b.musicUrl); }
    catch { return false; }
  }, [profile.customSections]);
  const [showAudioModal, setShowAudioModal] = useState<boolean>(false);
  const [audioAllowed,   setAudioAllowed]   = useState(false);
  const audioAllowedRef = useRef(false);
  const musicPlayRef = useRef<{ unlock: () => void; play: () => void; pause: () => void } | null>(null);

  // Show modal only in public mode and only if there's a music block with a source
  useEffect(() => {
    if (!editMode) setShowAudioModal(hasMusicBlock());
  }, []); // once on mount

  useEffect(() => {
    setShowIntro(!editMode);
  }, [editMode]);

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };
  const [blocks, setBlocks] = useState<InvitationBlock[]>(() => safeJSON(profile.customSections, []));
  const [heroBgImage, setHeroBgImage] = useState<string | undefined>(profile.heroBgImage);
  const [heroBgImageMobile, setHeroBgImageMobile] = useState<string | undefined>(profile.heroBgImageMobile);

  useEffect(() => { setBlocks(safeJSON(profile.customSections, [])); }, [profile.customSections]);
  useEffect(() => { setHeroBgImage(profile.heroBgImage); }, [profile.heroBgImage]);
  useEffect(() => { setHeroBgImageMobile(profile.heroBgImageMobile); }, [profile.heroBgImageMobile]);

  const castleSubtitle = (profile as any).castleIntroSubtitle ?? 'in my castle';
  const castleWelcome  = (profile as any).castleIntroWelcome  ?? 'WELCOME';

  const upProfile = useCallback((field: string, value: any) => { onProfileUpdate?.({ [field]: value }); }, [onProfileUpdate]);
  const updBlock  = useCallback((idx: number, patch: Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb = prev.map((b, i) => i === idx ? { ...b, ...patch } : b); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const movBlock  = useCallback((idx: number, dir: -1 | 1) => {
    setBlocks(prev => { const nb = [...prev]; const to = idx + dir; if (to < 0 || to >= nb.length) return prev; [nb[idx], nb[to]] = [nb[to], nb[idx]]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const delBlock  = useCallback((idx: number) => {
    setBlocks(prev => { const nb = prev.filter((_, i) => i !== idx); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const addBlock  = useCallback((type: string, def: any) => {
    setBlocks(prev => { const nb = [...prev, { id: Date.now().toString(), type: type as InvitationBlockType, show: true, ...def }]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const name1    = profile.partner1Name || 'Prințesa Maria';
  const dateStr  = profile.weddingDate ? new Date(profile.weddingDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Data Evenimentului';
  const showRsvp = profile.showRsvpButton !== false;
  const rsvpText = profile.rsvpButtonText?.trim() || 'Confirmă Prezența';

  const BLOCK_TYPES = [
    { type: 'photo',     label: '📷 Foto',      def: { imageData: undefined, aspectRatio: '1:1', photoClip: 'rect', photoMasks: [] } },
    { type: 'text',      label: 'Text',          def: { content: 'O poveste magică începe...' } },
    { type: 'location',  label: 'Locație',       def: { locationName: 'Castelul Magic', locationAddress: 'Strada Basmului nr. 1' } },
    { type: 'calendar',  label: '📅 Calendar',  def: {} },
    { type: 'countdown', label: '⏱ Countdown', def: {} },
    { type: 'music',     label: '🎵 Muzică',    def: { musicTitle: '', musicArtist: '', musicType: 'none' } },
    { type: 'gift',      label: '🎁 Cadouri',   def: { sectionTitle: 'Sugestie cadou', content: '', iban: '', ibanName: '' } },
    { type: 'quote',     label: 'Citat',         def: { content: '' } },
    { type: 'whatsapp',  label: 'WhatsApp',      def: { label: 'Contact WhatsApp', content: '0700000000' } },
    { type: 'rsvp',      label: 'RSVP',          def: { label: 'Confirmă Prezența' } },
    { type: 'divider',   label: 'Linie',         def: {} },
  ];

  return (
    <>

      {showAudioModal && !editMode && (
        <AudioPermissionModal
          childName={profile.partner1Name || 'Prințesa'}
          onAllow={() => {
            audioAllowedRef.current = true;
            setAudioAllowed(true);
            // THIS is the user gesture — call unlock() which does play+pause on the audio element
            // This removes browser autoplay restriction; future .play() from scroll will work
            musicPlayRef.current?.unlock();
            setShowAudioModal(false);
          }}
          onDeny={() => { audioAllowedRef.current = false; setShowAudioModal(false); }}
        />
      )}

      {showIntro && (
        <BlockStyleProvider
          value={{ blockId: "__intro__", textStyles: (profile as any).introTextStyles }}
        >
          <CastleIntro onDone={() => {}} castleUrl={heroBgImage} castleUrlMobile={heroBgImageMobile}
          contentEl={contentEl} scrollContainer={scrollContainer} childName={profile.partner1Name || 'Numele Copilului'}
          subtitle={castleSubtitle} welcomeText={castleWelcome}
          onDoorsOpen={() => {
            // Fire immediately at onLeave (doors fully apart) — zero delay
            if (audioAllowedRef.current && musicPlayRef.current) {
              musicPlayRef.current.play();
            }
          }}
        />
        </BlockStyleProvider>
      )}

      <div ref={el => { contentRef.current = el; setContentEl(el); }} className="min-h-screen"
        style={{ backgroundColor: PINK_XL, backgroundImage: `radial-gradient(circle at 2px 2px, rgba(244, 114, 182, 0.05) 1px, transparent 0)`, backgroundSize: '40px 40px', fontFamily: SANS, paddingTop: showIntro ? '10vh' : '0px' }}>
        <div className="max-w-md mx-auto px-6 py-12 relative z-10">

          {/* Intro image editor */}
          {editMode && (
            <div className="mb-12 p-6 bg-white rounded-2xl border border-pink-100 shadow-sm">
              <h3 className="text-xs font-bold text-pink-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Imagini Intro (Uși)
              </h3>
              {introPreview && (
                <div className="mb-6">
                <p className="text-[10px] text-muted uppercase font-bold mb-2">Previzualizare Uși — click pe text pentru editare:</p>
                <div className="border border-pink-100 rounded-xl shadow-inner bg-pink-50/20" style={{ position: 'relative' }}>
                  <BlockStyleProvider
                    value={{
                      blockId: "__intro__",
                      textStyles: (profile as any).introTextStyles,
                      onTextSelect: (textKey, textLabel) =>
                        onBlockSelect?.(
                          { id: "__intro__", type: "intro", textStyles: (profile as any).introTextStyles } as any,
                          -1,
                          textKey,
                          textLabel
                        ),
                    }}
                  >
                    <CastleIntro editMode previewMode="static" castleUrl={heroBgImage} castleUrlMobile={heroBgImageMobile} onDone={() => {}}
                      childName={profile.partner1Name || 'Numele Copilului'} subtitle={castleSubtitle} welcomeText={castleWelcome}
                      onChildNameChange={v => upProfile('partner1Name', v)}
                      onSubtitleChange={v => upProfile('castleIntroSubtitle', v)}
                      onWelcomeChange={v => upProfile('castleIntroWelcome', v)} />
                  </BlockStyleProvider>
                </div>
                </div>
              )}
              <div className="flex gap-[10px] flex-col">
                <p className="text-[10px] uppercase font-bold mb-2">Landscape Preview:</p>

                <ProfileImageUpload url={heroBgImage} onUpload={url => { setHeroBgImage(url); upProfile('heroBgImage', url); }} onRemove={() => { setHeroBgImage(undefined); upProfile('heroBgImage', undefined); }} label="Desktop (Landscape)" editMode={editMode} aspectRatio="aspect-video" />
                <p className="text-[10px] uppercase font-bold mb-2">Portrait Preview</p>

                <ProfileImageUpload url={heroBgImageMobile} onUpload={url => { setHeroBgImageMobile(url); upProfile('heroBgImageMobile', url); }} onRemove={() => { setHeroBgImageMobile(undefined); upProfile('heroBgImageMobile', undefined); }} label="Mobile (Portrait)" editMode={editMode} aspectRatio="aspect-[9/16]" />
              </div>
            </div>
          )}

          {/* Hero */}
          <div className="text-center mb-16">
            <Reveal>
              <div className="mb-6 inline-block relative">
                <div className="absolute -inset-4 bg-pink-200/30 blur-xl rounded-full" />
                <Sparkles className="w-12 h-12 text-pink-400 relative z-10 animate-pulse" />
              </div>
              <InlineEdit tag="h1" editMode={editMode} value={name1} onChange={v => upProfile('partner1Name', v)} style={{ fontFamily: SCRIPT, fontSize: '4rem', color: PINK_DARK, lineHeight: 1.2 }} />
              <div className="h-px w-24 bg-pink-200 mx-auto my-6" />
              {profile.showWelcomeText !== false && (
                <InlineEdit tag="p" editMode={editMode} value={profile.welcomeText || 'Vă invităm la povestea noastră'} onChange={v => upProfile('welcomeText', v)} style={{ fontFamily: SERIF, fontStyle: 'italic', color: PINK_DARK, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: 8 }} />
              )}
              {profile.showCelebrationText !== false && (
                <InlineEdit tag="p" editMode={editMode} value={(profile as any).celebrationText || 'nunții noastre'} onChange={v => upProfile('celebrationText', v)} style={{ fontFamily: SERIF, fontStyle: 'italic', color: PINK_DARK, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: 8 }} />
              )}
              <p className="font-sans font-bold text-pink-400 tracking-[0.3em] text-[10px]">{dateStr}</p>
            </Reveal>
          </div>

          {/* Blocks */}
          <div className="space-y-10">
            {blocks.filter(b => editMode || b.show !== false).map((block, idx) => (
              <div key={block.id} className="relative group/block"
                style={{ marginTop: block.blockMarginTop != null ? `${block.blockMarginTop}px` : undefined, marginBottom: block.blockMarginBottom != null ? `${block.blockMarginBottom}px` : undefined }}>
                <BlockStyleProvider value={{ blockId: block.id, textStyles: block.textStyles, onTextSelect: (textKey, textLabel) => onBlockSelect?.(block, idx, textKey, textLabel), fontFamily: block.blockFontFamily, fontSize: block.blockFontSize, fontWeight: block.blockFontWeight, fontStyle: block.blockFontStyle, letterSpacing: block.blockLetterSpacing, lineHeight: block.blockLineHeight, textColor: block.textColor && block.textColor !== 'transparent' ? block.textColor : undefined, textAlign: block.blockAlign } as BlockStyle}>
                  {editMode && (
                    <BlockToolbar onUp={() => movBlock(idx, -1)} onDown={() => movBlock(idx, 1)} onToggle={() => updBlock(idx, { show: block.show === false })} onDelete={() => delBlock(idx)} visible={block.show !== false} isFirst={idx === 0} isLast={idx === blocks.length - 1} />
                  )}

                  {block.type === 'photo' && (
                    <Reveal>
                      <PhotoBlock imageData={block.imageData} altText={block.altText} editMode={editMode}
                        onUpload={url => updBlock(idx, { imageData: url })} onRemove={() => updBlock(idx, { imageData: undefined })}
                        onRatioChange={r => updBlock(idx, { aspectRatio: r })}
                        onClipChange={c => updBlock(idx, { photoClip: c })}
                        onMasksChange={m => updBlock(idx, { photoMasks: m } as any)}
                        aspectRatio={block.aspectRatio as any} photoClip={block.photoClip as any} photoMasks={block.photoMasks as any}
                        placeholderInitial1={name1[0]} />
                    </Reveal>
                  )}
                  {block.type === 'text' && (
                    <Reveal><div className="text-center px-4">
                      <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(idx, { content: v })} style={{ fontFamily: SERIF, fontSize: '1.1rem', color: TEXT, lineHeight: '1.8' }} />
                    </div></Reveal>
                  )}
                  {block.type === 'location' && (
                    <Reveal><LocCard block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)} /></Reveal>
                  )}
                  {block.type === 'calendar' && (
                    <Reveal><CalendarMonth date={profile.weddingDate} /></Reveal>
                  )}
                  {block.type === 'countdown' && (
                    <Reveal><CountdownSection date={profile.weddingDate} /></Reveal>
                  )}

                  {/* ✅ MUSIC BLOCK — was missing! */}
                  {block.type === 'music' && (
                    <Reveal>
                      <MusicBlock block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)}
                        imperativeRef={musicPlayRef} />
                    </Reveal>
                  )}

                  {block.type === 'gift' && (
                    <Reveal>
                      <div style={{ background: PINK_DARK, borderRadius: 16, padding: 24, textAlign: 'center', color: 'white' }}>
                        <Gift className="w-8 h-8 mx-auto mb-4 opacity-70" />
                        <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle || 'Sugestie de cadou'} onChange={v => updBlock(idx, { sectionTitle: v })} style={{ fontFamily: SCRIPT, fontSize: '2rem', marginBottom: 8 }} />
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(idx, { content: v })} multiline style={{ fontFamily: SANS, fontSize: 11, opacity: 0.8, lineHeight: 1.6 }} />
                        {(block.iban || editMode) && (
                          <div className="mt-4 p-3 bg-white/10 rounded-lg">
                            <InlineEdit tag="p" editMode={editMode} value={block.iban || ''} onChange={v => updBlock(idx, { iban: v })} placeholder="IBAN..." style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700 }} />
                          </div>
                        )}
                      </div>
                    </Reveal>
                  )}
                  {block.type === 'quote' && (
                    <Reveal>
                      <div className="text-center italic opacity-70 px-8">
                        <span className="text-4xl font-serif text-pink-300">"</span>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(idx, { content: v })} multiline style={{ fontFamily: SERIF, fontSize: '1rem', marginTop: -10 }} />
                        <span className="text-4xl font-serif text-pink-300 leading-none">"</span>
                      </div>
                    </Reveal>
                  )}
                  {block.type === 'whatsapp' && (
                    <Reveal>
                      <div className="flex justify-center">
                        <a href={`https://wa.me/${block.content}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <InlineEdit tag="span" editMode={editMode} value={block.label || 'Contact WhatsApp'} onChange={v => updBlock(idx, { label: v })} style={{ fontWeight: 700, fontSize: 12 }} />
                        </a>
                      </div>
                    </Reveal>
                  )}
                  {block.type === 'rsvp' && (
                    <Reveal>
                      <div className="flex justify-center">
                        <button onClick={() => onOpenRSVP?.()} className="px-8 py-3 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 transition-colors font-bold text-xs uppercase tracking-widest">
                          <InlineEdit tag="span" editMode={editMode} value={block.label || 'Confirmă Prezența'} onChange={v => updBlock(idx, { label: v })} />
                        </button>
                      </div>
                    </Reveal>
                  )}
                  {block.type === 'divider' && <Reveal><WildDivider /></Reveal>}
                </BlockStyleProvider>
              </div>
            ))}
          </div>

          {/* Timeline */}
          {profile.showTimeline && (() => {
            const timelineItems = safeJSON(profile.timeline, []);
            if (!timelineItems.length) return null;
            return (
              <Reveal>
                <div style={{ background: 'white', border: `1px solid ${PINK_L}`, borderRadius: 16, padding: '20px 24px', marginTop: 40 }}>
                  <p style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: '0.42em', textTransform: 'uppercase', color: PINK_DARK, textAlign: 'center', margin: '0 0 16px' }}>Programul Zilei</p>
                  {timelineItems.map((item: any, i: number) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '58px 44px 1fr', alignItems: 'stretch', minHeight: 64 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 10, paddingTop: 10 }}>
                        <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: PINK_DARK, lineHeight: 1.2 }}>{item.time}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: PINK_XL, border: `1.5px solid ${PINK_L}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <WeddingIcon iconKey={item.icon || 'party'} size={20} color={PINK_DARK} />
                        </div>
                        {i < timelineItems.length - 1 && <div style={{ flex: 1, width: 1, background: `linear-gradient(to bottom, ${PINK_L}, transparent)`, marginTop: 4 }} />}
                      </div>
                      <div style={{ paddingLeft: 12, paddingTop: 10, paddingBottom: i < timelineItems.length - 1 ? 20 : 0 }}>
                        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: TEXT, display: 'block', lineHeight: 1.3 }}>{item.title}</span>
                        {item.notice && <span style={{ fontFamily: SERIF, fontSize: 13, fontStyle: 'italic', color: MUTED, display: 'block', marginTop: 4, lineHeight: 1.5 }}>{item.notice}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })()}

          {profile.showCountdown && <Reveal><CountdownSection date={profile.weddingDate} /></Reveal>}

          {showRsvp && (
            <Reveal>
              <div className="text-center mt-10">
                <WildDivider />
                <button onClick={() => onOpenRSVP?.()} className="mt-6 px-10 py-4 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 transition-colors font-bold text-xs uppercase tracking-widest">
                  {rsvpText}
                </button>
              </div>
            </Reveal>
          )}

          {editMode && (
            <div className="mt-16 p-8 border-2 border-dashed border-pink-200 rounded-2xl bg-pink-50/30 text-center">
              <p className="text-[10px] font-bold text-pink-400 uppercase tracking-[0.3em] mb-6">Adaugă un capitol nou</p>
              <div className="flex flex-wrap justify-center gap-2">
                {BLOCK_TYPES.map(bt => (
                  <button key={bt.type} onClick={() => addBlock(bt.type, bt.def)}
                    className="px-4 py-2 bg-white border border-pink-100 rounded-full text-[10px] font-bold text-pink-600 uppercase tracking-widest hover:bg-pink-50 transition-colors shadow-sm">
                    + {bt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-24 text-center opacity-40">
            <WildDivider />
            <p className="font-serif italic text-xs text-pink-400 mt-4">Creat cu dragoste de WeddingPro</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CastleMagicTemplate;
