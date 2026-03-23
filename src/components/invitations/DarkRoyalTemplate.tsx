import React, { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, Clock, ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus, Navigation } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";

export const meta: TemplateMeta = {
  id: 'dark-royal',
  name: 'Dark Royal',
  category: 'wedding',
  description: 'Design modern dark navy cu accente aurii și timeline animat.',
  colors: ['#0d1117', '#1a2035', '#c9a84c'],
  previewClass: "bg-slate-900 border-yellow-700",
  elementsClass: "bg-yellow-600"
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

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Animated timeline line ───────────────────────────────────────────────────
function useTimelineProgress(containerRef: React.RefObject<HTMLDivElement>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight;
      const total = el.offsetHeight;
      const scrolled = Math.max(0, winH - rect.top);
      setProgress(Math.min(1, scrolled / (total + winH * 0.3)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
}

// ─── Opening animation ────────────────────────────────────────────────────────
const DarkIntro = ({ p1, p2, date, onDone }: { p1: string; p2: string; date: string; onDone: () => void }) => {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const d = date ? new Date(date) : null;
  const day   = d ? String(d.getDate()).padStart(2, '0') : '--';
  const month = d ? String(d.getMonth() + 1).padStart(2, '0') : '--';
  const year  = d ? String(d.getFullYear()).slice(-2) : '--';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 200);
    const t2 = setTimeout(() => setPhase('out'), 3000);
    const t3 = setTimeout(onDone, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 overflow-hidden",
      phase === 'out' ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
    )} style={{ background: 'linear-gradient(135deg, #060a14 0%, #0d1a2e 50%, #0a1020 100%)' }}>

      {/* Giant date numbers background */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <div className={cn("flex flex-col items-start leading-none transition-all duration-1000", phase === 'in' ? "opacity-0 translate-x-12" : "opacity-100 translate-x-0")}
          style={{ transitionDelay: '0.1s' }}>
          <span className="font-black text-[22vw] leading-none select-none" style={{ color: 'rgba(201,168,76,0.06)', fontFamily: 'Georgia, serif' }}>{day}</span>
          <span className="font-black text-[22vw] leading-none select-none" style={{ color: 'rgba(201,168,76,0.06)', fontFamily: 'Georgia, serif' }}>{month}</span>
          <span className="font-black text-[22vw] leading-none select-none" style={{ color: 'rgba(201,168,76,0.06)', fontFamily: 'Georgia, serif' }}>{year}</span>
        </div>
      </div>

      {/* Gold top line */}
      <div className={cn("absolute top-0 left-0 h-0.5 transition-all duration-1000", phase === 'in' ? "w-0" : "w-full")}
        style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', transitionDelay: '0.2s' }} />

      {/* Content */}
      <div className="relative text-center px-8">
        {/* Names */}
        <div className={cn("transition-all duration-700", phase === 'in' ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0")}
          style={{ transitionDelay: '0.3s' }}>
          <div className="flex items-end justify-center gap-4 mb-2">
            <div className="text-right">
              <div className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase" style={{ fontFamily: 'Georgia, serif' }}>{p1 || 'SOFIA'}</div>
            </div>
            <div className="text-3xl sm:text-5xl font-thin text-yellow-500 pb-1">&</div>
            <div className="text-left">
              <div className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase" style={{ fontFamily: 'Georgia, serif' }}>{p2 || 'MIHAI'}</div>
            </div>
          </div>
          {/* Gold line */}
          <div className={cn("h-px mx-auto transition-all duration-700 mt-4 mb-4", phase === 'in' ? "w-0" : "w-48")}
            style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', transitionDelay: '0.7s' }} />
          {/* Date */}
          <div className={cn("font-sans text-xs tracking-[0.5em] uppercase transition-all duration-700", phase === 'in' ? "opacity-0" : "opacity-100")}
            style={{ color: '#c9a84c', transitionDelay: '0.8s' }}>
            {d ? d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : '— — —'}
          </div>
        </div>
      </div>

      {/* Gold bottom line */}
      <div className={cn("absolute bottom-0 right-0 h-0.5 transition-all duration-1000", phase === 'in' ? "w-0" : "w-full")}
        style={{ background: 'linear-gradient(270deg, transparent, #c9a84c, transparent)', transitionDelay: '0.2s' }} />
    </div>
  );
};

// ─── Scroll-reveal location card ──────────────────────────────────────────────
const LocationCard = ({ block, idx, total, editMode, onUpdate, onUp, onDown, onToggle, onDelete }: {
  block: InvitationBlock; idx: number; total: number;
  editMode: boolean;
  onUpdate: (patch: Partial<InvitationBlock>) => void;
  onUp: () => void; onDown: () => void; onToggle: () => void; onDelete: () => void;
}) => {
  const { ref, visible } = useScrollReveal(0.1);
  const isLeft = idx % 2 === 0;

  return (
    <div ref={ref} className={cn(
      "relative flex items-center gap-0 transition-all duration-700",
      visible ? "opacity-100 translate-x-0" : isLeft ? "opacity-0 -translate-x-16" : "opacity-0 translate-x-16"
    )} style={{ transitionDelay: `${idx * 0.1}s` }}>

      {/* Left side */}
      <div className={cn("flex-1", !isLeft && "flex justify-end")}>
        {isLeft && (
          <CardContent block={block} editMode={editMode} onUpdate={onUpdate} isLeft={true} />
        )}
        {!isLeft && <div />}
      </div>

      {/* Center dot */}
      <div className="relative z-10 flex items-center justify-center w-12 shrink-0">
        <div className="w-4 h-4 rounded-full border-2 transition-all duration-500 shadow-lg"
          style={{ borderColor: '#c9a84c', backgroundColor: visible ? '#c9a84c' : 'transparent', boxShadow: visible ? '0 0 16px rgba(201,168,76,0.5)' : 'none' }} />
      </div>

      {/* Right side */}
      <div className={cn("flex-1", isLeft && "flex justify-start")}>
        {!isLeft && (
          <CardContent block={block} editMode={editMode} onUpdate={onUpdate} isLeft={false} />
        )}
        {isLeft && <div />}
      </div>

      {/* Edit toolbar */}
      {editMode && (
        <div className={cn(
          "absolute flex items-center gap-0.5 rounded-full border px-1.5 py-1 shadow-lg z-20",
          isLeft ? "-right-2 top-2" : "-left-2 top-2"
        )} style={{ background: '#1a2035', borderColor: '#c9a84c33' }}>
          <button type="button" onClick={onUp} disabled={idx === 0} className="p-0.5 rounded-full hover:bg-yellow-900/30 disabled:opacity-20"><ChevronUp className="w-3 h-3 text-yellow-500" /></button>
          <button type="button" onClick={onDown} disabled={idx === total - 1} className="p-0.5 rounded-full hover:bg-yellow-900/30 disabled:opacity-20"><ChevronDown className="w-3 h-3 text-yellow-500" /></button>
          <div className="w-px h-3 mx-0.5" style={{ background: '#c9a84c44' }} />
          <button type="button" onClick={onToggle} className="p-0.5 rounded-full hover:bg-yellow-900/30">
            {block.show !== false ? <Eye className="w-3 h-3 text-yellow-500" /> : <EyeOff className="w-3 h-3 text-yellow-600" />}
          </button>
          <button type="button" onClick={onDelete} className="p-0.5 rounded-full hover:bg-red-900/30"><Trash2 className="w-3 h-3 text-red-400" /></button>
        </div>
      )}
    </div>
  );
};

const CardContent = ({ block, editMode, onUpdate, isLeft }: {
  block: InvitationBlock; editMode: boolean;
  onUpdate: (patch: Partial<InvitationBlock>) => void; isLeft: boolean;
}) => (
  <div className={cn(
    "rounded-2xl p-5 max-w-[220px] w-full space-y-2 transition-all",
    isLeft ? "text-right mr-2" : "text-left ml-2"
  )} style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
    <InlineEdit tag="p" editMode={editMode} value={block.label || ''}
      onChange={v => onUpdate({ label: v })} placeholder="Eveniment..."
      className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#c9a84c' }} />
    <div className={cn("flex items-center gap-1.5 text-white font-semibold", isLeft ? "justify-end" : "justify-start")}>
      <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: '#c9a84c' }} />
      <InlineTime value={block.time || ''} onChange={v => onUpdate({ time: v })} editMode={editMode}
        className="text-white font-semibold text-sm" />
    </div>
    <InlineEdit tag="p" editMode={editMode} value={block.locationName || ''}
      onChange={v => onUpdate({ locationName: v })} placeholder="Locație..."
      className="font-semibold text-white text-sm" />
    <InlineEdit tag="p" editMode={editMode} value={block.locationAddress || ''}
      onChange={v => onUpdate({ locationAddress: v })} placeholder="Adresă..."
      className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }} />
    {(block.wazeLink || editMode) && (
      <div className={isLeft ? "flex justify-end" : "flex justify-start"}>
        <InlineWaze value={block.wazeLink || ''} onChange={v => onUpdate({ wazeLink: v })} editMode={editMode} />
      </div>
    )}
  </div>
);

// ─── Countdown unit ───────────────────────────────────────────────────────────
const CUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className="w-16 h-16 rounded-xl flex items-center justify-center relative"
      style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}>
      <span className="text-2xl font-black tabular-nums" style={{ color: '#c9a84c' }}>{String(value).padStart(2,'0')}</span>
    </div>
    <span className="text-[9px] uppercase tracking-widest font-bold font-sans" style={{ color: 'rgba(201,168,76,0.6)' }}>{label}</span>
  </div>
);

// ─── Block toolbar (non-location blocks) ─────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: {
  onUp: () => void; onDown: () => void; onToggle: () => void; onDelete: () => void;
  visible: boolean; isFirst: boolean; isLast: boolean;
}) => (
  <div className="absolute -top-3.5 right-2 flex items-center gap-0.5 rounded-full border px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto shadow-lg"
    style={{ background: '#1a2035', borderColor: '#c9a84c44' }}>
    <button onClick={e => { e.stopPropagation(); onUp(); }} disabled={isFirst} className="p-0.5 rounded-full hover:bg-yellow-900/30 disabled:opacity-20"><ChevronUp className="w-3 h-3 text-yellow-500" /></button>
    <button onClick={e => { e.stopPropagation(); onDown(); }} disabled={isLast} className="p-0.5 rounded-full hover:bg-yellow-900/30 disabled:opacity-20"><ChevronDown className="w-3 h-3 text-yellow-500" /></button>
    <div className="w-px h-3 mx-0.5" style={{ background: '#c9a84c44' }} />
    <button onClick={e => { e.stopPropagation(); onToggle(); }} className="p-0.5 rounded-full hover:bg-yellow-900/30">
      {visible ? <Eye className="w-3 h-3 text-yellow-500" /> : <EyeOff className="w-3 h-3 text-yellow-600" />}
    </button>
    <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-0.5 rounded-full hover:bg-red-900/30"><Trash2 className="w-3 h-3 text-red-400" /></button>
  </div>
);

// ─── Gold divider ─────────────────────────────────────────────────────────────
const GoldDivider = () => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4))' }} />
    <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#c9a84c' }} />
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(270deg, transparent, rgba(201,168,76,0.4))' }} />
  </div>
);

// ─── Main Template ────────────────────────────────────────────────────────────
export type DarkRoyalProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const DarkRoyalTemplate: React.FC<DarkRoyalProps> = ({
  data, onOpenRSVP, editMode = false, introPreview = false, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId,
}) => {
  const { profile, guest } = data;

  const [showIntro, setShowIntro] = useState(!editMode || introPreview);
  const [contentVisible, setContentVisible] = useState(editMode && !introPreview);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineProgress = useTimelineProgress(timelineRef);

  useEffect(() => {
    if (editMode) {
      if (introPreview) { setShowIntro(true); setContentVisible(false); }
      else { setShowIntro(false); setContentVisible(true); }
      return;
    }
    setShowIntro(true); setContentVisible(false);
  }, [editMode, introPreview]);

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const [blocks, setBlocks]           = useState<InvitationBlock[]>(() => safeJSON(profile.customSections, []));
  const [godparents, setGodparents]   = useState<any[]>(() => safeJSON(profile.godparents, []));
  const [parentsData, setParentsData] = useState<any>(() => safeJSON(profile.parents, {}));

  useEffect(() => { setBlocks(safeJSON(profile.customSections, [])); }, [profile.customSections]);
  useEffect(() => { setGodparents(safeJSON(profile.godparents, [])); }, [profile.godparents]);
  useEffect(() => { setParentsData(safeJSON(profile.parents, {})); }, [profile.parents]);

  const countdown = useCountdown(profile.weddingDate || '');

  // Debounced updates
  const _profileQueue = useRef<Record<string, any>>({});
  const _profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const _blocksTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upProfile = useCallback((field: string, value: any) => {
    _profileQueue.current = { ..._profileQueue.current, [field]: value };
    if (_profileTimer.current) clearTimeout(_profileTimer.current);
    _profileTimer.current = setTimeout(() => { onProfileUpdate?.(_profileQueue.current); _profileQueue.current = {}; }, 500);
  }, [onProfileUpdate]);

  const _debouncedBlocksSave = useCallback((nb: InvitationBlock[]) => {
    if (_blocksTimer.current) clearTimeout(_blocksTimer.current);
    _blocksTimer.current = setTimeout(() => onBlocksUpdate?.(nb), 500);
  }, [onBlocksUpdate]);

  const updBlock = useCallback((idx: number, patch: Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb = prev.map((b, i) => i === idx ? { ...b, ...patch } : b); _debouncedBlocksSave(nb); return nb; });
  }, [_debouncedBlocksSave]);

  const movBlock = useCallback((idx: number, dir: -1 | 1) => {
    setBlocks(prev => { const nb = [...prev]; const to = idx + dir; if (to < 0 || to >= nb.length) return prev; [nb[idx], nb[to]] = [nb[to], nb[idx]]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const delBlock = useCallback((idx: number) => {
    setBlocks(prev => { const nb = prev.filter((_, i) => i !== idx); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const addBlock = useCallback((type: string, def: any) => {
    setBlocks(prev => { const nb = [...prev, { id: Date.now().toString(), type: type as any, show: true, ...def }]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const updGodparent = (i: number, field: 'godfather' | 'godmother', val: string) => {
    setGodparents(prev => { const ng = prev.map((g, j) => j === i ? { ...g, [field]: val } : g); upProfile('godparents', JSON.stringify(ng)); return ng; });
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

  const locationBlocks  = displayBlocks.filter(b => b.type === 'location');
  const otherBlocks     = displayBlocks.filter(b => b.type !== 'location');

  const d = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const dayStr   = d ? String(d.getDate()).padStart(2,'0') : '--';
  const monthStr = d ? String(d.getMonth()+1).padStart(2,'0') : '--';
  const yearStr  = d ? String(d.getFullYear()).slice(-2) : '--';

  const bgStyle = { background: 'linear-gradient(160deg, #060a14 0%, #0d1520 60%, #0a1018 100%)' };

  return (
    <div className="relative min-h-screen font-sans" style={bgStyle}>

      {showIntro && (
        <DarkIntro
          p1={profile.partner1Name || ''} p2={profile.partner2Name || ''}
          date={profile.weddingDate || ''} onDone={() => { setShowIntro(false); setTimeout(() => setContentVisible(true), 100); }}
        />
      )}

      {editMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-1.5 shadow-2xl text-[10px] font-bold pointer-events-none select-none"
          style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#c9a84c' }} />
          <span className="uppercase tracking-widest">Editare Directă</span>
          <span style={{ color: 'rgba(201,168,76,0.5)' }} className="font-normal">— click pe orice text</span>
        </div>
      )}

      <div className={cn("transition-all duration-1000 min-h-screen", contentVisible ? "opacity-100" : "opacity-0", editMode && "pt-12")}>

        {/* ── HERO ── */}
        <div className="relative overflow-hidden min-h-screen flex items-center">

          {/* Giant background date */}
          <div className="absolute right-0 top-0 flex flex-col items-end leading-none pointer-events-none select-none overflow-hidden h-full justify-center pr-4">
            <span className="font-black leading-none" style={{ fontSize: 'clamp(100px, 28vw, 280px)', color: 'rgba(201,168,76,0.045)', fontFamily: 'Georgia, serif', lineHeight: 0.85 }}>{dayStr}</span>
            <span className="font-black leading-none" style={{ fontSize: 'clamp(100px, 28vw, 280px)', color: 'rgba(201,168,76,0.045)', fontFamily: 'Georgia, serif', lineHeight: 0.85 }}>{monthStr}</span>
            <span className="font-black leading-none" style={{ fontSize: 'clamp(100px, 28vw, 280px)', color: 'rgba(201,168,76,0.045)', fontFamily: 'Georgia, serif', lineHeight: 0.85 }}>{yearStr}</span>
          </div>

          {/* Left gold accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: 'linear-gradient(180deg, transparent, #c9a84c, transparent)' }} />

          <div className="relative z-10 px-8 md:px-16 py-20 max-w-2xl">

            {profile.showWelcomeText && (
              <div className="mb-6">
                <InlineEdit tag="p" editMode={editMode} value={welcomeText}
                  onChange={v => upProfile('welcomeText', v)} placeholder="Text intro..."
                  className="text-xs font-bold uppercase tracking-[0.35em]" style={{ color: 'rgba(201,168,76,0.7)' }} />
              </div>
            )}

            {isBaptism ? (
              <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || ''}
                onChange={v => upProfile('partner1Name', v)} placeholder="Prenume"
                className="block font-black text-white uppercase mb-2"
                style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', letterSpacing: '-0.02em', fontFamily: 'Georgia, serif' }} />
            ) : (
              <div className="mb-4">
                <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                  <InlineEdit tag="span" editMode={editMode} value={profile.partner1Name || ''}
                    onChange={v => upProfile('partner1Name', v)} placeholder="EA"
                    className="font-black text-white uppercase" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', letterSpacing: '-0.02em', fontFamily: 'Georgia, serif' }} />
                  <span className="font-thin text-4xl pb-2" style={{ color: '#c9a84c' }}>&</span>
                  <InlineEdit tag="span" editMode={editMode} value={profile.partner2Name || ''}
                    onChange={v => upProfile('partner2Name', v)} placeholder="EL"
                    className="font-black text-white uppercase" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', letterSpacing: '-0.02em', fontFamily: 'Georgia, serif' }} />
                </div>
              </div>
            )}

            {/* Gold line */}
            <div className="w-24 h-0.5 mb-6" style={{ background: 'linear-gradient(90deg, #c9a84c, transparent)' }} />

            {profile.showCelebrationText && (
              <InlineEdit tag="p" editMode={editMode} value={celebrationText}
                onChange={v => upProfile('celebrationText', v)} placeholder="Descriere eveniment..."
                className="text-base italic leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif' }} />
            )}

            {/* Date display */}
            <div className="edit-mode flex items-center gap-4 font-bold uppercase tracking-[0.4em] text-sm"
              style={{ color: 'rgba(201,168,76,0.9)' }}>
              {editMode ? (
                <input type="date"
                  value={profile.weddingDate ? new Date(profile.weddingDate).toISOString().split('T')[0] : ''}
                  onChange={e => upProfile('weddingDate', e.target.value)}
                  className="bg-transparent border-b outline-none cursor-pointer text-sm font-bold uppercase tracking-widest"
                  style={{ borderColor: 'rgba(201,168,76,0.4)', color: '#c9a84c' }} />
              ) : d ? (
                <>
                  <span>{dayStr}</span>
                  <div className="w-1 h-1 rounded-full" style={{ background: '#c9a84c' }} />
                  <span>{d.toLocaleDateString('ro-RO', { month: 'long' }).toUpperCase()}</span>
                  <div className="w-1 h-1 rounded-full" style={{ background: '#c9a84c' }} />
                  <span>{d.getFullYear()}</span>
                </>
              ) : (
                <span style={{ color: 'rgba(201,168,76,0.4)' }}>DATA EVENIMENTULUI</span>
              )}
            </div>

            {/* Guest badge */}
            {guest?.name && guest.name !== 'Nume Invitat' && (
              <div className="mt-8 inline-block rounded-lg px-5 py-3" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <p className="font-bold text-white text-base">{guest.name}</p>
                <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'rgba(201,168,76,0.6)' }}>invitat de onoare</p>
              </div>
            )}
          </div>
        </div>

        {/* ── COUNTDOWN ── */}
        {profile.showCountdown && profile.weddingDate && !countdown.expired && (
          <div className="py-12 px-8 text-center" style={{ borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            <p className="text-[10px] uppercase tracking-[0.4em] mb-8 font-bold" style={{ color: 'rgba(201,168,76,0.5)' }}>Până la marele eveniment</p>
            <div className="flex justify-center gap-4 sm:gap-8">
              <CUnit value={countdown.days}    label="Zile" />
              <CUnit value={countdown.hours}   label="Ore" />
              <CUnit value={countdown.minutes} label="Min" />
              <CUnit value={countdown.seconds} label="Sec" />
            </div>
          </div>
        )}

        {/* ── TIMELINE — Location blocks ── */}
        {locationBlocks.length > 0 && (
          <div ref={timelineRef} className="relative py-16 px-4">
            <p className="text-center text-[10px] uppercase tracking-[0.4em] mb-12 font-bold" style={{ color: 'rgba(201,168,76,0.5)' }}>
              Programul Evenimentului
            </p>

            {/* Animated vertical line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-28 bottom-8 w-px" style={{ background: 'rgba(201,168,76,0.1)' }}>
              <div className="w-full origin-top transition-none" style={{ height: `${timelineProgress * 100}%`, background: 'linear-gradient(180deg, #c9a84c, rgba(201,168,76,0.2))', transition: 'height 0.1s linear' }} />
            </div>

            <div className="space-y-8 max-w-2xl mx-auto">
              {locationBlocks.map((block, i) => {
                const realIdx = blocks.indexOf(block);
                return (
                  <div key={block.id} onClick={editMode ? () => onBlockSelect?.(block, realIdx) : undefined}>
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
                      <LocationCard
                        block={block} idx={i} total={locationBlocks.length}
                        editMode={editMode}
                        onUpdate={patch => updBlock(realIdx, patch)}
                        onUp={() => movBlock(realIdx, -1)}
                        onDown={() => movBlock(realIdx, 1)}
                        onToggle={() => updBlock(realIdx, { show: block.show === false ? true : false })}
                        onDelete={() => delBlock(realIdx)}
                      />
                    </BlockStyleProvider>
                  </div>
                );
              })}
            </div>

            {editMode && (
              <div className="text-center mt-8">
                <button onClick={() => addBlock('location', { label: '', time: '', locationName: '', locationAddress: '', wazeLink: '' })}
                  className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full transition-all"
                  style={{ color: '#c9a84c', border: '1px dashed rgba(201,168,76,0.3)' }}>
                  + Adaugă locație
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── OTHER BLOCKS (nași, părinți, text, title, divider) ── */}
        <div className="max-w-xl mx-auto px-8 pb-16 space-y-8">

          {otherBlocks.map((block) => {
            const realIdx = blocks.indexOf(block);
            const isVisible = block.show !== false;
            return (
              <div key={block.id} className={cn("relative group/block", !isVisible && editMode && "opacity-30")}
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
                {block.type === 'godparents' && (
                  <div className="text-center space-y-4 py-6">
                    <GoldDivider />
                    <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Nașii Noștri'}
                      onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                      className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#c9a84c' }} />
                    <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                      onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..."
                      className="text-sm italic" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif' }} multiline />
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                      {godparents.map((g: any, i: number) => (
                        <div key={i} className={cn("text-sm font-medium text-white flex items-center gap-2", editMode && "group/gp")}>
                          <InlineEdit tag="span" editMode={editMode} value={g.godfather || ''} onChange={v => updGodparent(i, 'godfather', v)} placeholder="Naș" className="text-white" />
                          <span style={{ color: '#c9a84c' }}>&</span>
                          <InlineEdit tag="span" editMode={editMode} value={g.godmother || ''} onChange={v => updGodparent(i, 'godmother', v)} placeholder="Nașă" className="text-white" />
                          {editMode && <button type="button" onClick={() => delGodparent(i)} className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-900/30"><Trash2 className="w-3 h-3 text-red-400" /></button>}
                        </div>
                      ))}
                      {editMode && <button type="button" onClick={addGodparent} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors" style={{ color: '#c9a84c', border: '1px dashed rgba(201,168,76,0.3)' }}><Plus className="w-2.5 h-2.5 inline" /> adaugă</button>}
                    </div>
                    <GoldDivider />
                  </div>
                )}

                {block.type === 'parents' && (
                  <div className="text-center space-y-3 py-4">
                    <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Părinții Noștri'}
                      onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                      className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#c9a84c' }} />
                    <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                      onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..."
                      className="text-sm italic" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif' }} multiline />
                    <div className="flex flex-col gap-1">
                      {([
                        { key: 'p1_father', ph: 'Tatăl Miresei' }, { key: 'p1_mother', ph: 'Mama Miresei' },
                        { key: 'p2_father', ph: 'Tatăl Mirelui' }, { key: 'p2_mother', ph: 'Mama Mirelui' },
                      ] as const).map(({ key, ph }) => {
                        const val = parentsData?.[key];
                        if (!val && !editMode) return null;
                        return <InlineEdit key={key} tag="p" editMode={editMode} value={val || ''} onChange={v => updParent(key, v)} placeholder={ph} className="text-sm text-white italic" />;
                      })}
                    </div>
                  </div>
                )}

                {block.type === 'text' && (
                  <div className="text-center py-2">
                    <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                      onChange={v => updBlock(realIdx, { content: v })} placeholder="Text liber..."
                      className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Georgia, serif' }} multiline />
                  </div>
                )}

                {block.type === 'title' && (
                  <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                    onChange={v => updBlock(realIdx, { content: v })} placeholder="Titlu secțiune..."
                    className="text-center text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#c9a84c' }} />
                )}

                {block.type === 'divider' && <GoldDivider />}
                {block.type === 'spacer'  && <div className="h-6" />}
                </BlockStyleProvider>
              </div>
            );
          })}

          {/* Add non-location blocks */}
          {editMode && (
            <div className="text-center pt-4">
              <p className="text-[9px] uppercase tracking-widest mb-3 font-bold" style={{ color: 'rgba(201,168,76,0.4)' }}>Adaugă bloc</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { type:'godparents', label:'Nași',    def:{ sectionTitle:'Nașii Noștri', content:'' } },
                  { type:'parents',    label:'Părinți',  def:{ sectionTitle:'Părinții Noștri', content:'' } },
                  { type:'text',       label:'Text',     def:{ content:'' } },
                  { type:'title',      label:'Titlu',    def:{ content:'' } },
                  { type:'divider',    label:'Linie',    def:{} },
                ].map(({ type, label, def }) => (
                  <button key={type} onClick={() => addBlock(type, def)}
                    className="px-3 py-1 text-[10px] font-bold rounded-full transition-all uppercase tracking-wider"
                    style={{ color: '#c9a84c', border: '1px dashed rgba(201,168,76,0.3)' }}>
                    + {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RSVP */}
          {showRsvp && (
            <div className="text-center pt-8 pb-4">
              <GoldDivider />
              <div className="mt-8">
                {editMode ? (
                  <div className="inline-block rounded px-10 py-3 font-bold uppercase text-[10px] tracking-[0.4em]"
                    style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.4)' }}>
                    <InlineEdit tag="span" editMode={editMode} value={rsvpText}
                      onChange={v => upProfile('rsvpButtonText', v)}
                      className="font-bold uppercase text-[10px] tracking-[0.4em] cursor-text" style={{ color: '#c9a84c' }} />
                  </div>
                ) : (
                  <button onClick={() => onOpenRSVP && onOpenRSVP()}
                    className="rounded px-10 py-3 font-bold uppercase text-[10px] tracking-[0.4em] transition-all duration-300 hover:scale-105"
                    style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.5)', color: '#c9a84c', boxShadow: '0 0 30px rgba(201,168,76,0.1)' }}>
                    {rsvpText}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom gold line */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c44, transparent)' }} />
      </div>
    </div>
  );
};

export default DarkRoyalTemplate;
