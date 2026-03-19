import React, { useState, useEffect, useCallback, useRef} from "react";
import { Calendar, Clock, ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";

export const meta: TemplateMeta = {
  id: 'royal-rose',
  name: 'Royal Rose',
  category: 'wedding',
  description: 'Design romantic roz cu animație de deschidere și inițiale.',
  colors: ['#fff0f3', '#f9a8c9', '#c084a0'],
  previewClass: "bg-pink-50 border-pink-200",
  elementsClass: "bg-pink-200"
};

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return { days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000), minutes: Math.floor((diff%3600000)/60000), seconds: Math.floor((diff%60000)/1000), expired: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => { if (!target) return; const id = setInterval(() => setTime(calc()), 1000); return () => clearInterval(id); }, [target]);
  return time;
}

// ─── SVG decorations ──────────────────────────────────────────────────────────

const FloralCorner = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M5 5 Q20 5 20 20 Q20 5 35 5" stroke="#f9a8c9" strokeWidth="1" fill="none" opacity="0.6"/>
    <path d="M5 5 Q5 20 20 20 Q5 20 5 35" stroke="#f9a8c9" strokeWidth="1" fill="none" opacity="0.6"/>
    <circle cx="20" cy="20" r="3" fill="#f9a8c9" opacity="0.5"/>
    <circle cx="8" cy="8" r="1.5" fill="#e879a0" opacity="0.4"/>
    <path d="M12 20 Q16 14 20 20 Q24 14 28 20" stroke="#f472b6" strokeWidth="0.8" fill="none" opacity="0.5"/>
    <path d="M20 12 Q14 16 20 20 Q14 24 20 28" stroke="#f472b6" strokeWidth="0.8" fill="none" opacity="0.5"/>
    <circle cx="20" cy="20" r="1.5" fill="#db2777" opacity="0.6"/>
    <path d="M35 5 Q42 12 35 20 Q28 12 35 5" fill="#fce7f3" opacity="0.4"/>
    <path d="M5 35 Q12 28 20 35 Q12 42 5 35" fill="#fce7f3" opacity="0.4"/>
  </svg>
);

const RoseDivider = () => (
  <div className="flex items-center justify-center gap-3 my-2">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-pink-200" />
    <svg viewBox="0 0 40 20" className="w-10 h-5 shrink-0" fill="none">
      <path d="M20 10 Q15 4 10 10 Q15 16 20 10Z" fill="#f9a8c9" opacity="0.7"/>
      <path d="M20 10 Q25 4 30 10 Q25 16 20 10Z" fill="#f9a8c9" opacity="0.7"/>
      <path d="M20 10 Q14 10 10 6 Q14 14 20 10Z" fill="#e879a0" opacity="0.5"/>
      <circle cx="20" cy="10" r="2" fill="#db2777" opacity="0.5"/>
      <circle cx="5" cy="10" r="1.5" fill="#f9a8c9" opacity="0.5"/>
      <circle cx="35" cy="10" r="1.5" fill="#f9a8c9" opacity="0.5"/>
    </svg>
    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-pink-200" />
  </div>
);

// ─── Opening animation — initials circle ─────────────────────────────────────
const InitialsIntro = ({ initials, onDone }: { initials: string; onDone: () => void }) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2800);
    const t3 = setTimeout(onDone, 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 transition-all duration-700",
      phase === 'exit' ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
    )}>
      {/* Petals background */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-pink-200/30"
          style={{
            width: `${20 + (i % 4) * 15}px`,
            height: `${20 + (i % 4) * 15}px`,
            top: `${10 + (i * 7.5) % 80}%`,
            left: `${5 + (i * 8.3) % 90}%`,
            animationDelay: `${i * 0.2}s`,
            transform: `rotate(${i * 30}deg)`,
            opacity: 0.4 + (i % 3) * 0.15,
          }} />
      ))}

      {/* Main circle */}
      <div className={cn(
        "relative flex items-center justify-center transition-all duration-700",
        phase === 'enter' ? "opacity-0 scale-75" : "opacity-100 scale-100"
      )}>
        {/* Outer ring - animated */}
        <svg className="absolute w-72 h-72 -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#fce7f3" strokeWidth="1.5"/>
          <circle cx="100" cy="100" r="90" fill="none" stroke="#f9a8c9" strokeWidth="1"
            strokeDasharray="565" strokeDashoffset={phase === 'enter' ? 565 : 0}
            style={{ transition: 'stroke-dashoffset 1.8s ease-out' }}/>
          {/* Dots on circle */}
          {[0,45,90,135,180,225,270,315].map((angle, i) => (
            <circle key={i}
              cx={100 + 90 * Math.cos((angle * Math.PI) / 180)}
              cy={100 + 90 * Math.sin((angle * Math.PI) / 180)}
              r="2" fill="#f472b6" opacity="0.6"/>
          ))}
        </svg>

        {/* Middle ring */}
        <svg className="absolute w-60 h-60" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#fce7f3" strokeWidth="8"/>
          <circle cx="100" cy="100" r="80" fill="none" stroke="url(#roseGrad)" strokeWidth="0.5" strokeDasharray="4 4"/>
          <defs>
            <radialGradient id="roseGrad">
              <stop offset="0%" stopColor="#f9a8c9"/>
              <stop offset="100%" stopColor="#db2777"/>
            </radialGradient>
          </defs>
        </svg>

        {/* Inner decorative circle */}
        <div className="absolute w-52 h-52 rounded-full border border-pink-200/60" />
        <div className="absolute w-44 h-44 rounded-full bg-white/70 backdrop-blur-sm shadow-2xl shadow-pink-200/50" />

        {/* Floral corners inside */}
        <div className="absolute w-44 h-44">
          <FloralCorner className="absolute top-1 left-1 w-10 h-10 opacity-60" />
          <FloralCorner className="absolute top-1 right-1 w-10 h-10 opacity-60 scale-x-[-1]" />
          <FloralCorner className="absolute bottom-1 left-1 w-10 h-10 opacity-60 scale-y-[-1]" />
          <FloralCorner className="absolute bottom-1 right-1 w-10 h-10 opacity-60 scale-[-1]" />
        </div>

        {/* Initials */}
        <div className={cn(
          "relative text-center transition-all duration-500",
          phase === 'enter' ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
        )} style={{ transitionDelay: '0.4s' }}>
          <p className="font-serif text-5xl text-rose-800 tracking-widest leading-none" style={{ fontVariant: 'small-caps' }}>
            {initials}
          </p>
          <p className="text-[9px] uppercase tracking-[0.4em] text-pink-400 mt-2 font-sans font-bold">
            se căsătoresc
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Block toolbar ────────────────────────────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: {
  onUp: () => void; onDown: () => void; onToggle: () => void; onDelete: () => void;
  visible: boolean; isFirst: boolean; isLast: boolean;
}) => (
  <div className="absolute -top-3.5 right-3 flex items-center gap-0.5 bg-white border border-pink-200 rounded-full shadow-lg px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto">
    <button type="button" onClick={e => { e.stopPropagation(); onUp(); }} disabled={isFirst} className="p-0.5 rounded-full hover:bg-pink-50 disabled:opacity-25 transition-colors"><ChevronUp className="w-3 h-3 text-pink-400" /></button>
    <button type="button" onClick={e => { e.stopPropagation(); onDown(); }} disabled={isLast} className="p-0.5 rounded-full hover:bg-pink-50 disabled:opacity-25 transition-colors"><ChevronDown className="w-3 h-3 text-pink-400" /></button>
    <div className="w-px h-3 bg-pink-100 mx-0.5" />
    <button type="button" onClick={e => { e.stopPropagation(); onToggle(); }} className="p-0.5 rounded-full hover:bg-pink-50 transition-colors">
      {visible ? <Eye className="w-3 h-3 text-pink-400" /> : <EyeOff className="w-3 h-3 text-pink-300" />}
    </button>
    <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }} className="p-0.5 rounded-full hover:bg-red-50 transition-colors"><Trash2 className="w-3 h-3 text-red-400" /></button>
  </div>
);

// ─── Countdown unit ───────────────────────────────────────────────────────────
const CUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-14 h-14 rounded-2xl bg-white/80 border border-pink-200 shadow-sm flex items-center justify-center">
      <span className="text-2xl font-bold text-rose-700 tabular-nums">{String(value).padStart(2,'0')}</span>
    </div>
    <span className="text-[9px] uppercase tracking-widest text-pink-400 font-bold font-sans">{label}</span>
  </div>
);

// ─── Main Template ────────────────────────────────────────────────────────────
export type RoyalRoseProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
};

const RoyalRoseTemplate: React.FC<RoyalRoseProps> = ({
  data, onOpenRSVP,
  editMode = false,
  onProfileUpdate,
  onBlocksUpdate,
}) => {
  const { profile, guest } = data;

  const [showIntro, setShowIntro] = useState(!editMode);
  const [contentVisible, setContentVisible] = useState(editMode);

  useEffect(() => {
    if (editMode) { setShowIntro(false); setContentVisible(true); return; }
    setShowIntro(true); setContentVisible(false);
  }, [editMode]);

  const handleIntroDone = () => {
    setShowIntro(false);
    setTimeout(() => setContentVisible(true), 100);
  };

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const [blocks, setBlocks]         = useState<InvitationBlock[]>(() => safeJSON(profile.customSections, []));
  const [godparents, setGodparents] = useState<any[]>(() => safeJSON(profile.godparents, []));
  const [parentsData, setParentsData] = useState<any>(() => safeJSON(profile.parents, {}));

  useEffect(() => { setBlocks(safeJSON(profile.customSections, [])); }, [profile.customSections]);
  useEffect(() => { setGodparents(safeJSON(profile.godparents, [])); }, [profile.godparents]);
  useEffect(() => { setParentsData(safeJSON(profile.parents, {})); }, [profile.parents]);

  const countdown = useCountdown(profile.weddingDate || '');

  // Debounce profile & blocks updates — prevents API call on every keystroke
  const _profileQueue = useRef<Record<string, any>>({});
  const _profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const _blocksTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upProfile = useCallback((field: string, value: any) => {
    _profileQueue.current = { ..._profileQueue.current, [field]: value };
    if (_profileTimer.current) clearTimeout(_profileTimer.current);
    _profileTimer.current = setTimeout(() => {
      onProfileUpdate?.(_profileQueue.current);
      _profileQueue.current = {};
    }, 500);
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

  // Compute initials
  const p1 = (profile.partner1Name || 'A').trim()[0]?.toUpperCase() || 'A';
  const p2 = (profile.partner2Name || 'M').trim()[0]?.toUpperCase() || 'M';
  const initials = `${p1} & ${p2}`;

  const welcomeText     = profile.welcomeText?.trim()    || 'Împreună cu familiile noastre';
  const celebrationText = profile.celebrationText?.trim() || 'nunții noastre';
  const rsvpText        = profile.rsvpButtonText?.trim()  || 'Confirmă Prezența';
  const showRsvp        = profile.showRsvpButton !== false;
  const isBaptism       = profile.eventType === 'baptism' || profile.eventType === 'kids';
  const displayBlocks   = editMode ? blocks : blocks.filter(b => b.show !== false);
  const timeline: any[] = (() => { try { return profile.timeline ? JSON.parse(profile.timeline) : []; } catch { return []; } })();

  return (
    <div className="relative min-h-screen font-serif" style={{ background: 'linear-gradient(160deg, #fff0f5 0%, #fce7f3 40%, #fdf2f8 100%)' }}>

      {/* Opening intro */}
      {showIntro && <InitialsIntro initials={initials} onDone={handleIntroDone} />}

      {/* Edit hint bar */}
      {editMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-rose-900/90 backdrop-blur text-white rounded-full px-4 py-1.5 shadow-2xl text-[10px] font-bold pointer-events-none select-none">
          <span className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse" />
          <span className="uppercase tracking-widest">Editare Directă</span>
          <span className="text-rose-300 font-normal">— click pe orice text</span>
        </div>
      )}

      {/* Main content */}
      <div className={cn(
        "flex items-start justify-center p-4 min-h-screen transition-all duration-1000",
        editMode ? "py-12 pt-16 opacity-100" : contentVisible ? "py-12 opacity-100" : "opacity-0"
      )}>
        <div className="max-w-lg w-full relative">

          {/* Corner florals */}
          <FloralCorner className="absolute -top-3 -left-3 w-20 h-20 opacity-70" />
          <FloralCorner className="absolute -top-3 -right-3 w-20 h-20 opacity-70 scale-x-[-1]" />
          <FloralCorner className="absolute -bottom-3 -left-3 w-20 h-20 opacity-70 scale-y-[-1]" />
          <FloralCorner className="absolute -bottom-3 -right-3 w-20 h-20 opacity-70 scale-[-1]" />

          {/* Card */}
          <div className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl shadow-pink-200/60 border border-pink-100 overflow-hidden">

            {/* Top gradient bar */}
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #f9a8d4, #ec4899, #be185d, #ec4899, #f9a8d4)' }} />

            <div className="p-8 md:p-12 text-center space-y-8">

              {/* ── INITIALS MEDALLION ── */}
              <div className="flex justify-center">
                <div className="relative w-28 h-28">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="56" fill="none" stroke="#fce7f3" strokeWidth="2"/>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#f9a8c9" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <circle cx="60" cy="60" r="46" fill="url(#medalGrad)" />
                    <defs>
                      <radialGradient id="medalGrad" cx="40%" cy="35%">
                        <stop offset="0%" stopColor="#fff1f5"/>
                        <stop offset="100%" stopColor="#fce7f3"/>
                      </radialGradient>
                    </defs>
                    {[0,60,120,180,240,300].map((a, i) => (
                      <circle key={i}
                        cx={60 + 56 * Math.cos((a * Math.PI) / 180)}
                        cy={60 + 56 * Math.sin((a * Math.PI) / 180)}
                        r="2.5" fill="#f472b6" opacity="0.6"/>
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl text-rose-700 tracking-widest" style={{ fontVariant: 'small-caps', fontFamily: 'Georgia, serif' }}>
                      {p1}&amp;{p2}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── HERO ── */}
              <div className="space-y-3">
                {profile.showWelcomeText && (
                  <InlineEdit tag="p" editMode={editMode} value={welcomeText}
                    onChange={v => upProfile('welcomeText', v)}
                    placeholder="Cine invită..."
                    className="text-pink-400 uppercase tracking-[0.25em] text-[10px] font-sans font-bold" />
                )}

                {isBaptism ? (
                  <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || ''}
                    onChange={v => upProfile('partner1Name', v)} placeholder="Prenume"
                    className="block text-5xl md:text-6xl text-rose-800 leading-tight"
                    style={{ fontFamily: 'Georgia, Palatino, serif' } as any} />
                ) : (
                  <div className="flex flex-col items-center gap-1" style={{ fontFamily: 'Georgia, Palatino, serif' }}>
                    <InlineEdit tag="span" editMode={editMode} value={profile.partner1Name || ''}
                      onChange={v => upProfile('partner1Name', v)} placeholder="Ea"
                      className="block text-5xl md:text-6xl text-rose-800 leading-tight text-center break-words w-full" />
                    <span className="text-pink-300 italic text-4xl leading-none">&</span>
                    <InlineEdit tag="span" editMode={editMode} value={profile.partner2Name || ''}
                      onChange={v => upProfile('partner2Name', v)} placeholder="El"
                      className="block text-5xl md:text-6xl text-rose-800 leading-tight text-center break-words w-full" />
                  </div>
                )}

                {profile.showCelebrationText && (
                  <p className="text-base italic text-pink-500 font-serif">
                    vă invită cu drag la{' '}
                    <InlineEdit tag="span" editMode={editMode} value={celebrationText}
                      onChange={v => upProfile('celebrationText', v)}
                      placeholder="descriere eveniment..." />
                  </p>
                )}
              </div>

              <RoseDivider />

              {/* ── GUEST BADGE ── */}
              <div className="mx-auto max-w-xs rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 py-4 px-6 shadow-sm">
                <p className="font-bold text-lg text-rose-800">{guest?.name || 'Nume Invitat'}</p>
                <p className="text-[10px] text-pink-400 uppercase tracking-widest mt-1 font-sans">invitat de onoare</p>
              </div>

              {/* ── DATE ── */}
              <div className="flex flex-col items-center gap-2 font-sans">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-pink-400" />
                </div>
                {editMode ? (
                  <input type="date"
                    value={profile.weddingDate ? new Date(profile.weddingDate).toISOString().split('T')[0] : ''}
                    onChange={e => upProfile('weddingDate', e.target.value)}
                    className="font-bold uppercase tracking-widest text-rose-700 bg-transparent border-b-2 border-pink-200 hover:border-pink-400 focus:border-rose-500 text-center outline-none cursor-pointer transition-colors text-sm py-1" />
                ) : (
                  <p className="font-bold uppercase tracking-widest text-rose-700 text-sm">
                    {profile.weddingDate
                      ? new Date(profile.weddingDate).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Data Evenimentului'}
                  </p>
                )}
              </div>

              {/* ── COUNTDOWN ── */}
              {profile.showCountdown && profile.weddingDate && !countdown.expired && (
                <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 py-6 px-4">
                  <p className="text-[9px] uppercase tracking-widest text-pink-400 font-bold font-sans mb-4">Până la marele eveniment</p>
                  <div className="flex justify-center gap-4">
                    <CUnit value={countdown.days}    label="Zile" />
                    <CUnit value={countdown.hours}   label="Ore" />
                    <CUnit value={countdown.minutes} label="Min" />
                    <CUnit value={countdown.seconds} label="Sec" />
                  </div>
                </div>
              )}

              {/* ── BLOCURI ── */}
              {displayBlocks.map((block, idx) => {
                const isVisible = block.show !== false;
                const realIdx   = blocks.indexOf(block);

                return (
                  <div key={block.id} className={cn("relative group/block", !isVisible && editMode && "opacity-35")}>
                    {editMode && (
                      <BlockToolbar
                        onUp={() => movBlock(realIdx, -1)} onDown={() => movBlock(realIdx, 1)}
                        onToggle={() => updBlock(realIdx, { show: !isVisible })} onDelete={() => delBlock(realIdx)}
                        visible={isVisible} isFirst={realIdx === 0} isLast={realIdx === blocks.length - 1}
                      />
                    )}
                    {editMode && <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover/block:ring-pink-200 transition-all pointer-events-none" />}

                    {/* LOCAȚIE */}
                    {block.type === 'location' && (
                      <div className={cn("rounded-2xl border border-pink-100 bg-white/60 p-5 space-y-3 text-sm font-sans", editMode && "hover:bg-pink-50/40 transition-colors")}>
                        <InlineEdit tag="p" editMode={editMode} value={block.label || ''}
                          onChange={v => updBlock(realIdx, { label: v })} placeholder="Titlu locație..."
                          className="font-bold uppercase text-[10px] text-pink-400 tracking-widest" />
                        <div className="flex items-center justify-center gap-2 font-bold text-lg text-rose-800">
                          <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                            <Clock className="w-3 h-3 text-pink-400" />
                          </div>
                          <InlineTime value={block.time || ''} onChange={v => updBlock(realIdx, { time: v })} editMode={editMode}
                            className="font-bold text-lg text-rose-800" />
                        </div>
                        <InlineEdit tag="p" editMode={editMode} value={block.locationName || ''}
                          onChange={v => updBlock(realIdx, { locationName: v })} placeholder="Numele locației..."
                          className="font-semibold text-rose-700" />
                        <InlineEdit tag="p" editMode={editMode} value={block.locationAddress || ''}
                          onChange={v => updBlock(realIdx, { locationAddress: v })} placeholder="Adresă..."
                          className="text-xs text-pink-400 italic leading-snug" />
                        <InlineWaze value={block.wazeLink || ''} onChange={v => updBlock(realIdx, { wazeLink: v })} editMode={editMode} />
                      </div>
                    )}

                    {/* NAȘI */}
                    {block.type === 'godparents' && (
                      <div className={cn("space-y-3 font-sans text-sm", editMode && "rounded-2xl px-3 py-3 hover:bg-pink-50/40 transition-colors")}>
                        <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Nașii Noștri'}
                          onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                          className="text-[10px] font-bold uppercase text-pink-400 tracking-widest" />
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..."
                          className="text-sm italic text-rose-500 font-serif" multiline />
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                          {godparents.map((g: any, i: number) => (
                            <div key={i} className={cn("text-sm italic text-rose-700 flex items-center gap-1.5", editMode && "group/gp relative")}>
                              <InlineEdit tag="span" editMode={editMode} value={g.godfather || ''} onChange={v => updGodparent(i, 'godfather', v)} placeholder="Naș" />
                              <span className="text-pink-300">&</span>
                              <InlineEdit tag="span" editMode={editMode} value={g.godmother || ''} onChange={v => updGodparent(i, 'godmother', v)} placeholder="Nașă" />
                              {editMode && <button type="button" onClick={() => delGodparent(i)} className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400" /></button>}
                            </div>
                          ))}
                          {editMode && <button type="button" onClick={addGodparent} className="text-[10px] text-pink-300 hover:text-pink-500 border border-dashed border-pink-200 hover:border-pink-300 rounded-full px-2 py-0.5 flex items-center gap-1 transition-colors"><Plus className="w-2.5 h-2.5" /> adaugă</button>}
                        </div>
                      </div>
                    )}

                    {/* PĂRINȚI */}
                    {block.type === 'parents' && (
                      <div className={cn("space-y-3 font-sans text-sm", editMode && "rounded-2xl px-3 py-3 hover:bg-pink-50/40 transition-colors")}>
                        <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Părinții Noștri'}
                          onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                          className="text-[10px] font-bold uppercase text-pink-400 tracking-widest" />
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..."
                          className="text-sm italic text-rose-500 font-serif" multiline />
                        <div className="flex flex-col items-center gap-1">
                          {([
                            { key: 'p1_father', ph: 'Tatăl Miresei' }, { key: 'p1_mother', ph: 'Mama Miresei' },
                            { key: 'p2_father', ph: 'Tatăl Mirelui' }, { key: 'p2_mother', ph: 'Mama Mirelui' },
                          ] as const).map(({ key, ph }) => {
                            const val = parentsData?.[key];
                            if (!val && !editMode) return null;
                            return <InlineEdit key={key} tag="p" editMode={editMode} value={val || ''}
                              onChange={v => updParent(key, v)} placeholder={ph}
                              className="text-sm italic text-rose-700" />;
                          })}
                        </div>
                      </div>
                    )}

                    {block.type === 'text' && (
                      <div className={cn(editMode && "rounded-2xl px-3 py-2 hover:bg-pink-50/40 transition-colors")}>
                        <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                          onChange={v => updBlock(realIdx, { content: v })} placeholder="Scrieți un mesaj..."
                          className="text-sm text-rose-600 italic leading-relaxed font-serif" multiline />
                      </div>
                    )}

                    {block.type === 'title' && (
                      <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                        onChange={v => updBlock(realIdx, { content: v })} placeholder="Titlu secțiune..."
                        className="text-[10px] font-bold uppercase text-pink-400 tracking-widest font-sans" />
                    )}

                    {block.type === 'divider' && <RoseDivider />}
                    {block.type === 'spacer'  && <div className="h-4" />}
                  </div>
                );
              })}

              {/* Add block strip */}
              {editMode && (
                <div className="border-2 border-dashed border-pink-100 hover:border-pink-200 rounded-2xl py-4 transition-colors">
                  <p className="text-[9px] text-pink-300 uppercase tracking-widest mb-2.5 font-sans">Adaugă bloc</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { type:'location', label:'Locație', def: { label:'', time:'', locationName:'', locationAddress:'', wazeLink:'' } },
                      { type:'text',     label:'Text',    def: { content:'' } },
                      { type:'title',    label:'Titlu',   def: { content:'' } },
                      { type:'divider',  label:'Linie',   def: {} },
                    ].map(({ type, label, def }) => (
                      <button key={type} type="button" onClick={() => addBlock(type, def)}
                        className="px-3 py-1 text-[10px] font-bold border border-pink-200 hover:border-pink-300 rounded-full text-pink-400 hover:text-rose-600 hover:bg-pink-50 transition-all font-sans">
                        + {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CRONOLOGIE ── */}
              {profile.showTimeline && timeline.length > 0 && (
                <div className="space-y-3 font-sans">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f9a8c9' }}>Programul Zilei</p>
                  <div className="space-y-2 max-w-xs mx-auto">
                    {timeline.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                        <span className="font-bold text-pink-400 tabular-nums shrink-0">{item.time}</span>
                        <div className="flex-1 h-px bg-pink-100" />
                        <span className="text-rose-700 font-medium text-right">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <RoseDivider />

              {/* RSVP */}
              {showRsvp && (
                <div>
                  {editMode ? (
                    <div className="inline-block rounded-full px-10 py-3 font-sans"
                      style={{ background: 'linear-gradient(135deg, #f472b6, #be185d)' }}>
                      <InlineEdit tag="span" editMode={editMode} value={rsvpText}
                        onChange={v => upProfile('rsvpButtonText', v)}
                        className="text-white uppercase text-[10px] font-bold tracking-[0.3em] cursor-text" />
                    </div>
                  ) : (
                    <button onClick={() => onOpenRSVP && onOpenRSVP()}
                      className="rounded-full px-10 py-3 text-white uppercase text-[10px] font-bold tracking-[0.3em] shadow-lg shadow-pink-300/40 hover:shadow-pink-400/50 hover:scale-105 transition-all duration-200 font-sans"
                      style={{ background: 'linear-gradient(135deg, #f472b6, #be185d)' }}>
                      {rsvpText}
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Bottom gradient bar */}
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #f9a8d4, #ec4899, #be185d, #ec4899, #f9a8d4)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyalRoseTemplate;