import React, { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, Clock, ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus, GripVertical } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";

export const meta: TemplateMeta = {
  id: 'classic', name: 'Classic Elegant', category: 'wedding',
  description: 'Design atemporal cu fonturi serif și accente aurii.',
  colors: ['#fff', '#f4f4f5', '#d4af37'],
  previewClass: "bg-white border-zinc-200", elementsClass: "bg-stone-300"
};

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(targetDate: string) {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-3xl md:text-4xl font-bold text-stone-800 tabular-nums w-14 text-center">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold font-sans">{label}</span>
  </div>
);

// ─── Block hover toolbar ──────────────────────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: {
  onUp: () => void; onDown: () => void; onToggle: () => void; onDelete: () => void;
  visible: boolean; isFirst: boolean; isLast: boolean;
}) => (
  <div className="absolute -top-3.5 right-3 flex items-center gap-0.5 bg-white border border-stone-200 rounded-full shadow-lg px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto">
    <button type="button" onClick={e => { e.stopPropagation(); onUp(); }} disabled={isFirst}
      className="p-0.5 rounded-full hover:bg-stone-100 disabled:opacity-25 transition-colors">
      <ChevronUp className="w-3 h-3 text-stone-500" />
    </button>
    <button type="button" onClick={e => { e.stopPropagation(); onDown(); }} disabled={isLast}
      className="p-0.5 rounded-full hover:bg-stone-100 disabled:opacity-25 transition-colors">
      <ChevronDown className="w-3 h-3 text-stone-500" />
    </button>
    <div className="w-px h-3 bg-stone-200 mx-0.5" />
    <button type="button" onClick={e => { e.stopPropagation(); onToggle(); }}
      className="p-0.5 rounded-full hover:bg-stone-100 transition-colors">
      {visible
        ? <Eye className="w-3 h-3 text-stone-500" />
        : <EyeOff className="w-3 h-3 text-stone-400" />}
    </button>
    <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }}
      className="p-0.5 rounded-full hover:bg-red-50 transition-colors">
      <Trash2 className="w-3 h-3 text-red-400" />
    </button>
  </div>
);

// ─── Add block strip (edit mode) ──────────────────────────────────────────────
const ADD_BLOCK_TYPES = [
  { type: 'location',   label: 'Locație',  def: { label: '', time: '', locationName: '', locationAddress: '', wazeLink: '' } },
  { type: 'text',       label: 'Text',     def: { content: '' } },
  { type: 'title',      label: 'Titlu',    def: { content: '' } },
  { type: 'divider',    label: 'Linie',    def: {} },
] as const;

// ─── Main Template ────────────────────────────────────────────────────────────
export type ClassicTemplateProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({
  data, onOpenRSVP,
  editMode = false,
  onProfileUpdate,
  onBlocksUpdate,
  onBlockSelect,
  selectedBlockId,
}) => {
  const { profile, guest } = data;

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const [blocks, setBlocks]       = useState<InvitationBlock[]>(() => safeJSON(profile.customSections, []));
  const [godparents, setGodparents] = useState<any[]>(() => safeJSON(profile.godparents, []));
  const [parentsData, setParentsData] = useState<any>(() => safeJSON(profile.parents, {}));

  useEffect(() => { setBlocks(safeJSON(profile.customSections, [])); }, [profile.customSections]);
  useEffect(() => { setGodparents(safeJSON(profile.godparents, [])); }, [profile.godparents]);
  useEffect(() => { setParentsData(safeJSON(profile.parents, {})); }, [profile.parents]);

  const countdown = useCountdown(profile.weddingDate || '');

  // ── Debounced helpers — prevents API call on every keystroke ────────────────
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
    setBlocks(prev => {
      const nb = prev.map((b, i) => i === idx ? { ...b, ...patch } : b);
      _debouncedBlocksSave(nb);
      return nb;
    });
  }, [_debouncedBlocksSave]);

  const movBlock = useCallback((idx: number, dir: -1 | 1) => {
    setBlocks(prev => {
      const nb = [...prev]; const to = idx + dir;
      if (to < 0 || to >= nb.length) return prev;
      [nb[idx], nb[to]] = [nb[to], nb[idx]];
      onBlocksUpdate?.(nb); // structural change — save immediately
      return nb;
    });
  }, [onBlocksUpdate]);

  const delBlock = useCallback((idx: number) => {
    setBlocks(prev => {
      const nb = prev.filter((_, i) => i !== idx);
      onBlocksUpdate?.(nb); // structural change — save immediately
      return nb;
    });
  }, [onBlocksUpdate]);

  const addBlock = useCallback((type: string, def: any) => {
    setBlocks(prev => {
      const nb = [...prev, { id: Date.now().toString(), type: type as any, show: true, ...def }];
      onBlocksUpdate?.(nb); // structural change — save immediately
      return nb;
    });
  }, [onBlocksUpdate]);

  const updGodparent = (i: number, field: 'godfather' | 'godmother', val: string) => {
    setGodparents(prev => {
      const ng = prev.map((g, j) => j === i ? { ...g, [field]: val } : g);
      upProfile('godparents', JSON.stringify(ng));
      return ng;
    });
  };
  const addGodparent = () => {
    setGodparents(prev => {
      const ng = [...prev, { godfather: '', godmother: '' }];
      upProfile('godparents', JSON.stringify(ng));
      return ng;
    });
  };
  const delGodparent = (i: number) => {
    setGodparents(prev => {
      const ng = prev.filter((_, j) => j !== i);
      upProfile('godparents', JSON.stringify(ng));
      return ng;
    });
  };

  const updParent = (field: string, val: string) => {
    setParentsData((prev: any) => {
      const np = { ...prev, [field]: val };
      upProfile('parents', JSON.stringify(np));
      return np;
    });
  };

  const welcomeText     = profile.welcomeText?.trim()     || 'Împreună cu familiile noastre';
  const celebrationText = profile.celebrationText?.trim() || 'nunții noastre';
  const rsvpText        = profile.rsvpButtonText?.trim()  || 'Confirmă Prezența';
  const showRsvp        = profile.showRsvpButton !== false;
  const isBaptism       = profile.eventType === 'baptism' || profile.eventType === 'kids';
  const displayBlocks   = editMode ? blocks : blocks.filter(b => b.show !== false);

  return (
    <div className={cn("min-h-screen bg-stone-100 text-stone-900 font-serif flex items-start justify-center p-4", editMode ? "edit-mode py-8" : "py-12 items-center")}>

      {/* ── Edit mode hint bar ── */}
      {editMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-stone-900/90 backdrop-blur text-white rounded-full px-4 py-1.5 shadow-2xl text-[10px] font-bold pointer-events-none select-none">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="uppercase tracking-widest">Editare Directă</span>
          <span className="text-stone-400 font-normal">— click pe orice text pentru a edita</span>
        </div>
      )}

      <div className={cn(
        "max-w-lg w-full bg-white shadow-2xl p-8 md:p-12 border-8 border-double border-stone-200 text-center space-y-10",
        !editMode && "animate-in fade-in zoom-in-95 duration-700",
        editMode && "mt-10"
      )}>

        {/* ── HERO ── */}
        <div>
          {profile.showWelcomeText && (
            <InlineEdit tag="p" editMode={editMode} value={welcomeText}
              onChange={v => upProfile('welcomeText', v)}
              placeholder="Cine invită..."
              className="text-stone-500 uppercase tracking-[0.2em] text-[10px] mb-4 font-sans font-bold" />
          )}

          {isBaptism ? (
            <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || ''}
              onChange={v => upProfile('partner1Name', v)} placeholder="Prenume"
              className="text-5xl md:text-6xl text-stone-800 mb-4 leading-tight block" />
          ) : (
            <h1 className="text-5xl md:text-6xl text-stone-800 mb-4 leading-tight">
              <InlineEdit tag="span" editMode={editMode} value={profile.partner1Name || ''}
                onChange={v => upProfile('partner1Name', v)} placeholder="Ea" />
              <span className="text-3xl align-middle italic text-stone-400 mx-2">&</span>
              <InlineEdit tag="span" editMode={editMode} value={profile.partner2Name || ''}
                onChange={v => upProfile('partner2Name', v)} placeholder="El" />
            </h1>
          )}

          {profile.showCelebrationText && (
            <p className="text-xl italic text-stone-600 mt-6 font-serif">
              vă invită la{' '}
              <InlineEdit tag="span" editMode={editMode} value={celebrationText}
                onChange={v => upProfile('celebrationText', v)}
                placeholder="descriere eveniment..." />
            </p>
          )}
        </div>

        {/* ── GUEST BADGE ── */}
        <div className="py-4 bg-stone-50 rounded-lg border border-stone-100 mx-auto max-w-xs font-sans">
          <p className="font-bold text-lg text-stone-800">{guest?.name || 'Nume Invitat'}</p>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Sunteți invitații noștri de onoare</p>
        </div>

        {/* ── DATE ── */}
        <div className="flex flex-col items-center gap-2 font-sans text-sm">
          <Calendar className="w-5 h-5 text-stone-400" />
          {editMode ? (
            <input
              type="date"
              value={profile.weddingDate ? new Date(profile.weddingDate).toISOString().split('T')[0] : ''}
              onChange={e => upProfile('weddingDate', e.target.value)}
              className="font-bold uppercase tracking-widest text-stone-600 bg-transparent border-b-2 border-stone-200 hover:border-stone-400 focus:border-stone-600 text-center outline-none cursor-pointer transition-colors text-sm py-1"
            />
          ) : (
            <p className="font-bold uppercase tracking-widest text-stone-600">
              {profile.weddingDate
                ? new Date(profile.weddingDate).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                : 'Data Evenimentului'}
            </p>
          )}
        </div>

        {/* ── COUNTDOWN ── */}
        {profile.showCountdown && profile.weddingDate && !countdown.expired && (
          <div className="border-y border-stone-100 py-6 font-sans">
            <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold mb-4">Până la eveniment</p>
            <div className="flex justify-center gap-6">
              <CountdownUnit value={countdown.days}    label="Zile" />
              <CountdownUnit value={countdown.hours}   label="Ore" />
              <CountdownUnit value={countdown.minutes} label="Min" />
              <CountdownUnit value={countdown.seconds} label="Sec" />
            </div>
          </div>
        )}

        {/* ── BLOCURI ── */}
        {displayBlocks.map((block, idx) => {
          const isVisible = block.show !== false;
          const allBlocks = blocks; // for toolbar isFirst/isLast against full array
          const realIdx   = blocks.indexOf(block);

          return (
            <div key={block.id}
              className={cn(
                "relative group/block",
                editMode && "rounded-xl transition-all",
                editMode && !isVisible && "opacity-35"
              )}
              onClick={editMode ? () => onBlockSelect?.(block, realIdx) : undefined}>

              {/* Toolbar */}
              {editMode && (
                <BlockToolbar
                  onUp={() => movBlock(realIdx, -1)}
                  onDown={() => movBlock(realIdx, 1)}
                  onToggle={() => updBlock(realIdx, { show: !isVisible })}
                  onDelete={() => delBlock(realIdx)}
                  visible={isVisible}
                  isFirst={realIdx === 0}
                  isLast={realIdx === blocks.length - 1}
                />
              )}

              {/* Hover ring in edit mode */}
              {editMode && (
                <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover/block:ring-stone-200 transition-all pointer-events-none" />
              )}

              <BlockStyleProvider value={{
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
              } as BlockStyle}>

                {/* ── LOCAȚIE ── */}
                {block.type === 'location' && (
                  <div className={cn("space-y-3 py-6 border-b border-stone-100 last:border-0 text-sm font-sans", editMode && "px-3")}>
                    <InlineEdit tag="p" editMode={editMode} value={block.label || ''}
                      onChange={v => updBlock(realIdx, { label: v })}
                      placeholder="Titlu locație (ex: Cununie Civilă)"
                      className="font-bold uppercase text-[10px] text-stone-400 tracking-widest" />
                    <div className="flex items-center justify-center gap-2 font-bold text-base text-stone-800">
                      <Clock className="w-4 h-4 text-stone-300 shrink-0" />
                      <InlineTime value={block.time || ''} onChange={v => updBlock(realIdx, { time: v })} editMode={editMode}
                        className="font-bold text-base text-stone-800" />
                    </div>
                    <InlineEdit tag="p" editMode={editMode} value={block.locationName || ''}
                      onChange={v => updBlock(realIdx, { locationName: v })}
                      placeholder="Numele locației / sălii..."
                      className="font-semibold text-stone-700" />
                    <InlineEdit tag="p" editMode={editMode} value={block.locationAddress || ''}
                      onChange={v => updBlock(realIdx, { locationAddress: v })}
                      placeholder="Adresă completă..."
                      className="text-xs text-stone-500 italic leading-snug" />
                    <InlineWaze value={block.wazeLink || ''} onChange={v => updBlock(realIdx, { wazeLink: v })} editMode={editMode} />
                  </div>
                )}

              {/* ── NAȘI ── */}
              {block.type === 'godparents' && (
                <div className={cn("space-y-3 font-sans text-sm", editMode && "px-3 py-2")}>
                  <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Nașii Noștri'}
                    onChange={v => updBlock(realIdx, { sectionTitle: v })}
                    placeholder="Titlu secțiune..."
                    className="text-[10px] font-bold uppercase text-stone-400 tracking-widest" />
                  <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                    onChange={v => updBlock(realIdx, { content: v })}
                    placeholder="Text introductiv (ex: Alături de nașii noștri dragi...)"
                    className="text-sm italic text-stone-500 font-serif" multiline />
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {godparents.map((g: any, i: number) => (
                      <div key={i} className={cn("text-sm italic text-stone-700 flex items-center gap-1.5", editMode && "group/gp relative")}>
                        <InlineEdit tag="span" editMode={editMode} value={g.godfather || ''}
                          onChange={v => updGodparent(i, 'godfather', v)} placeholder="Naș" />
                        <span className="text-stone-300">&</span>
                        <InlineEdit tag="span" editMode={editMode} value={g.godmother || ''}
                          onChange={v => updGodparent(i, 'godmother', v)} placeholder="Nașă" />
                        {editMode && (
                          <button type="button" onClick={() => delGodparent(i)}
                            className="opacity-0 group-hover/gp:opacity-100 transition-opacity ml-0.5 p-0.5 rounded hover:bg-red-50">
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                    {editMode && (
                      <button type="button" onClick={addGodparent}
                        className="text-[10px] text-stone-300 hover:text-stone-500 border border-dashed border-stone-200 hover:border-stone-300 rounded-full px-2 py-0.5 flex items-center gap-1 transition-colors">
                        <Plus className="w-2.5 h-2.5" /> adaugă pereche
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── PĂRINȚI ── */}
              {block.type === 'parents' && (
                <div className={cn("space-y-3 font-sans text-sm", editMode && "px-3 py-2")}>
                  <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Părinții Noștri'}
                    onChange={v => updBlock(realIdx, { sectionTitle: v })}
                    placeholder="Titlu secțiune..."
                    className="text-[10px] font-bold uppercase text-stone-400 tracking-widest" />
                  <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                    onChange={v => updBlock(realIdx, { content: v })}
                    placeholder="Text introductiv (ex: Cu binecuvântarea părinților noștri...)"
                    className="text-sm italic text-stone-500 font-serif" multiline />
                  <div className={cn("flex flex-col gap-1", editMode && "items-center")}>
                    {([
                      { key: 'p1_father', ph: 'Tatăl Miresei' },
                      { key: 'p1_mother', ph: 'Mama Miresei' },
                      { key: 'p2_father', ph: 'Tatăl Mirelui' },
                      { key: 'p2_mother', ph: 'Mama Mirelui' },
                    ] as const).map(({ key, ph }) => {
                      const val = parentsData?.[key];
                      if (!val && !editMode) return null;
                      return (
                        <InlineEdit key={key} tag="p" editMode={editMode} value={val || ''}
                          onChange={v => updParent(key, v)}
                          placeholder={ph}
                          className="text-sm italic text-stone-700" />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── TEXT LIBER ── */}
              {block.type === 'text' && (
                <div className={cn(editMode && "px-3 py-2")}>
                  <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                    onChange={v => updBlock(realIdx, { content: v })}
                    placeholder="Scrieți un mesaj, o urare, o poezie..."
                    className="text-sm text-stone-600 italic leading-relaxed font-serif px-4" multiline />
                </div>
              )}

              {/* ── TITLU ── */}
              {block.type === 'title' && (
                <InlineEdit tag="p" editMode={editMode} value={block.content || ''}
                  onChange={v => updBlock(realIdx, { content: v })}
                  placeholder="Titlu secțiune..."
                  className="text-[10px] font-bold uppercase text-stone-400 tracking-widest font-sans" />
              )}

              {block.type === 'divider' && <div className="w-16 h-px bg-stone-200 mx-auto" />}
              {block.type === 'spacer'  && <div className="h-4" />}
              </BlockStyleProvider>
            </div>
          );
        })}

        {/* ── ADD BLOCK strip (edit mode only) ── */}
        {editMode && (
          <div className="border-2 border-dashed border-stone-100 hover:border-stone-200 rounded-xl py-4 transition-colors">
            <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-2.5">Adaugă bloc</p>
            <div className="flex flex-wrap justify-center gap-2">
              {ADD_BLOCK_TYPES.map(({ type, label, def }) => (
                <button key={type} type="button" onClick={() => addBlock(type, def)}
                  className="px-3 py-1 text-[10px] font-bold border border-stone-200 hover:border-stone-300 rounded-full text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-all">
                  + {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── RSVP ── */}
        {showRsvp && (
          <div className="pt-4">
            {editMode ? (
              <div className="inline-block">
                <InlineEdit tag="span" editMode={editMode} value={rsvpText}
                  onChange={v => upProfile('rsvpButtonText', v)}
                  className="bg-stone-800 text-white px-10 py-3 rounded uppercase text-[10px] font-bold tracking-[0.3em] cursor-text inline-block" />
              </div>
            ) : (
              <button onClick={() => onOpenRSVP && onOpenRSVP()}
                className="bg-stone-800 text-white px-10 py-3 rounded uppercase text-[10px] font-bold tracking-[0.3em] hover:bg-stone-700 transition-all shadow-xl">
                {rsvpText}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ClassicTemplate;
