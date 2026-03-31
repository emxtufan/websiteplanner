import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Heart, Baby, PartyPopper, Briefcase,
  Save, Trash2, Plus, AlertCircle, Info, RotateCcw, ChevronDown,
  Calendar, Palette, Clock, Sparkles, Sliders,
} from "lucide-react";
import Button from "./ui/button";
import Input from "./ui/input";
import { UserSession, UserProfile, TimelineItem, EventType, InvitationBlock } from "../types";
import { useToast } from "./ui/use-toast";
import { cn } from "../lib/utils";
import ClassicTemplate, { ClassicTemplateProps } from "./invitations/ClassicTemplate";
import RoyalRoseTemplate, { RoyalRoseProps } from "./invitations/RoyalRoseTemplate";
import DarkRoyalTemplate, { DarkRoyalProps } from "./invitations/DarkRoyalTemplate";
import BlushBloomTemplate, { BlushBloomProps } from "./invitations/BlushBloomTemplate";
import GardenRomanticTemplate, { GardenRomanticProps } from "./invitations/GardenRomanticTemplate";
import VelumTemplate, { VelumProps } from "./invitations/VelumTemplate";
import EternBotanicaTemplate, { EternBotanicaProps } from "./invitations/EternBotanicaTemplate";
import TerraBohoTemplate, { TerraBohoProps } from "./invitations/TerraBohoTemplate";
import ArchRoseTemplate, { ArchRoseProps } from "./invitations/ArchRoseTemplate";
import BlockPropertiesPanel from "./BlockPropertiesPanel";
import ChristeningTemplate from "./invitations/ChristeningTemplate";
import CastleMagicTemplate from "./invitations/CastleMagicTemplateBoy";
import CastleMagicTemplateBoys from "./invitations/BoyCastelMagicTemplates";
import CastleMagicTemplateGirl from "./invitations/GirlCastelMagicTemplates";
import CastleMagicTemplateRomantic from "./invitations/RomanticCastelMagicTemplates";
import JO from "./invitations/JungleMagicEffect";
import LordEffects from "./invitations/LordEffects";
import GabbysDollhouseTemplate from "./invitations/GabbysDollhouseTemplate";
import FrozenTemplate from "./invitations/FrozenTemplate";
import UnicornAcademyTemplate from "./invitations/UnicornAcademyTemplate";
import AdventureRoadTemplate from "./invitations/AdventureRoadTemplate";
import JurassicTemplate from "./invitations/JurassicTemplate";
import ZootropolisTemplate from "./invitations/ZootropolisTemplate";
import { TextSelectionCtx } from "./BlockStyleContext";
import LittleMermaidTemplate  from "./invitations/LittleMermaidTemplate";
import { CASTLE_THEMES, GIRL_THEMES, BOY_THEMES, CASTLE_DEFAULTS, CASTLE_DEFAULT_BLOCKS, CASTLE_PREVIEW_DATA, ROMANTIC_THEMES, LORD_MONO_THEMES, GABBY_THEMES, FROZEN_THEMES, UNICORN_THEMES, ADVENTURE_BOY_THEMES, ADVENTURE_GIRL_THEMES, JURASSIC_BOY_THEMES, JURASSIC_GIRL_THEMES, ZOOTROPOLIS_BOY_THEMES, ZOOTROPOLIS_GIRL_THEMES, MERMAID_BOY_THEMES, MERMAID_GIRL_THEMES } from "./invitations/castleDefaults";
import { getTemplateDefaultBlocks, getTemplateDefaultProfile } from "./invitations/registry";
import { TemplateMeta } from "./invitations/types";

type EditableTemplateProps = ClassicTemplateProps | RoyalRoseProps | DarkRoyalProps | BlushBloomProps | GardenRomanticProps | VelumProps | EternBotanicaProps | TerraBohoProps | ArchRoseProps;
const EDITABLE_TEMPLATES: Record<string, React.FC<EditableTemplateProps>> = {
  'classic':             ClassicTemplate as React.FC<EditableTemplateProps>,
  'classic-baptism':     ClassicTemplate as React.FC<EditableTemplateProps>,
  'classic-anniversary': ClassicTemplate as React.FC<EditableTemplateProps>,
  'classic-kids':        ClassicTemplate as React.FC<EditableTemplateProps>,
  'royal-rose':          RoyalRoseTemplate as React.FC<EditableTemplateProps>,
  'dark-royal':          DarkRoyalTemplate as React.FC<EditableTemplateProps>,
  'blush-bloom':         BlushBloomTemplate as React.FC<EditableTemplateProps>,
  'garden-romantic':     GardenRomanticTemplate as React.FC<EditableTemplateProps>,
  'velum':               VelumTemplate as React.FC<EditableTemplateProps>,
  'etern-botanica':      EternBotanicaTemplate as React.FC<EditableTemplateProps>,
  'terra-boho':          TerraBohoTemplate as React.FC<EditableTemplateProps>,
  'arch-rose':           ArchRoseTemplate as React.FC<EditableTemplateProps>,
  'christening-dark':    ChristeningTemplate as React.FC<EditableTemplateProps>,
  'castle-magic':        CastleMagicTemplate as React.FC<EditableTemplateProps>,
  'castle-magic-boys':   CastleMagicTemplateBoys as React.FC<EditableTemplateProps>,
  'castle-magic-girl':   CastleMagicTemplateGirl as React.FC<EditableTemplateProps>,
  'romantic':   CastleMagicTemplateRomantic as React.FC<EditableTemplateProps>,
  'regal':   JO as React.FC<EditableTemplateProps>,
  'lord-effects':   LordEffects as React.FC<EditableTemplateProps>,
  'gabbys-dollhouse': GabbysDollhouseTemplate as React.FC<EditableTemplateProps>,
  'frozen': FrozenTemplate as React.FC<EditableTemplateProps>,
  'unicorn-academy': UnicornAcademyTemplate as React.FC<EditableTemplateProps>,
  'adventure-road': AdventureRoadTemplate as React.FC<EditableTemplateProps>,
  'jurassic-park':  JurassicTemplate as React.FC<EditableTemplateProps>,
  'zootropolis':  ZootropolisTemplate as React.FC<EditableTemplateProps>,
  'little-mermaid':  LittleMermaidTemplate as React.FC<EditableTemplateProps>,
};
const getEditableTemplate = (id: string): React.FC<EditableTemplateProps> =>
  EDITABLE_TEMPLATES[id] || ClassicTemplate as React.FC<EditableTemplateProps>;

const INTRO_TEMPLATES = new Set([
  'castle-magic',
  'castle-magic-boys',
  'castle-magic-girl',
  'romantic',
  'lord-effects',
  'christening-dark',
  'regal',
  'jurassic-park',
]);

interface SettingsViewProps {
  session: UserSession;
  onUpdateProfile: (profile: UserProfile) => Promise<void>;
  selectedTemplate?: string;
  templateMeta?: TemplateMeta;
  onCheckActive?: () => boolean;
}

const API_URL = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3005/api";

// ─── Micro UI ──────────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button type="button" role="switch" aria-checked={on}
    onClick={e => { e.stopPropagation(); onChange(!on); }}
    className={cn("relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
      on ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700")}>
    <span className={cn("pointer-events-none block h-3 w-3 rounded-full bg-white transition-transform", on ? "translate-x-3" : "translate-x-0")} />
  </button>
);
const Lbl = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">{children}</p>
);
const SecTitle = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-3">
    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{children}</span>
    {action}
  </div>
);
const Collapsible: React.FC<{
  title: string;
  defaultOpen?: boolean;
  hint?: string;
  desc?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "card" | "sub";
  openSignal?: any;
  highlight?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultOpen = true, hint, desc, icon: Icon, variant = "card", openSignal, highlight, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggleOpen = () => setOpen(o => !o);
  const isCard = variant === "card";
  const prevSignal = useRef<any>(openSignal);
  useEffect(() => {
    if (openSignal == null) return;
    if (openSignal !== prevSignal.current) {
      setOpen(true);
      prevSignal.current = openSignal;
    }
  }, [openSignal]);
  return (
    <section className={cn(
      isCard && "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm",
      highlight && "ring-2 ring-amber-400/70 shadow-[0_0_18px_rgba(251,191,36,0.35)] animate-pulse"
    )}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
          }
        }}
        className={cn("w-full flex items-start justify-between group", isCard ? "py-0.5" : "mb-0 py-0.5")}
      >
        <div className="flex items-start gap-3 min-w-0">
          {isCard && Icon && (
            <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Icon className="w-4 h-4" />
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn(
                "font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400",
                isCard ? "text-[11px]" : "text-[10px]"
              )}>
                {title}
              </span>
              {!open && hint && (
                <span className="text-[9px] text-zinc-300 dark:text-zinc-600 font-normal normal-case tracking-normal truncate max-w-[160px]">
                  {hint}
                </span>
              )}
            </div>
            {isCard && desc && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                {desc}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isCard && hint && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-[9px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
              {hint}
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </div>
      {/* display:block/none — fără max-h, fără animație, fără tăiere conținut */}
      <div style={{ display: open ? 'block' : 'none', marginTop: isCard ? 14 : 12 }}>
        {children}
      </div>
    </section>
  );
};

const Hr = () => <hr className="border-zinc-100 dark:border-zinc-800 my-4" />;
const EventTypeBadge = ({ et }: { et: string }) => {
  const m: Record<string, { label: string; icon: any; cls: string }> = {
    wedding:     { label: "Nuntă",      icon: Heart,       cls: "bg-rose-50 text-rose-700 border-rose-200" },
    baptism:     { label: "Botez",      icon: Baby,        cls: "bg-blue-50 text-blue-700 border-blue-200" },
    anniversary: { label: "Aniversare", icon: PartyPopper, cls: "bg-amber-50 text-amber-700 border-amber-200" },
    office:      { label: "Corporate",  icon: Briefcase,   cls: "bg-zinc-50 text-zinc-700 border-zinc-300" },
    kids:        { label: "Copii",      icon: PartyPopper, cls: "bg-purple-50 text-purple-700 border-purple-200" },
  };
  const c = m[et] || m.wedding;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold", c.cls)}>
      <c.icon className="w-3 h-3" />{c.label}
    </span>
  );
};

// ─── Reset Modal ───────────────────────────────────────────────────────────────
const ResetModal: React.FC<{ resetting: boolean; onCancel: () => void; onConfirm: () => void }> = ({
  resetting, onCancel, onConfirm,
}) => ReactDOM.createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !resetting && onCancel()} />
    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-80 mx-4 flex flex-col gap-4">
      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
        <RotateCcw className="w-6 h-6 text-orange-500" />
      </div>
      <div className="text-center">
        <p className="font-bold text-sm text-zinc-900 dark:text-white mb-1">Resetezi setarile?</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Resetarea revine la valorile implicite ale template-ului.<br />
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Vor fi resetate si textele, pozele, stilurile, fonturile si culorile. Data evenimentului ramane.</span>
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} disabled={resetting}
          className="flex-1 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-40">
          Anulează
        </button>
        <button type="button" onClick={onConfirm} disabled={resetting}
          className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
          {resetting
            ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Se reseteaza...</>
            : <><RotateCcw className="w-3 h-3" /> Da, reseteaza</>
          }
        </button>
      </div>
    </div>
  </div>,
  document.body
);

// ─── Settings Content (shared between mobile and desktop) ─────────────────────
// ─── Timeline preset moments with icons ───────────────────────────────────────
const TIMELINE_PRESETS = [
  { icon: 'diamond',   emoji: '💍', title: 'Pregătirea mirilor' },
  { icon: 'dress',     emoji: '👗', title: 'Îmbrăcarea miresii' },
  { icon: 'ceremony',  emoji: '⛪', title: 'Ceremonia civilă' },
  { icon: 'candles',   emoji: '🕯️', title: 'Ceremonia religioasă' },
  { icon: 'photo',     emoji: '📷', title: 'Ședința foto' },
  { icon: 'arch',      emoji: '🌸', title: 'Intrarea în sală' },
  { icon: 'dance',     emoji: '💃', title: 'Dansul mirilor' },
  { icon: 'cocktails', emoji: '🍸', title: 'Cocktail & aperitiv' },
  { icon: 'dinner',    emoji: '🍽️', title: 'Masa festivă' },
  { icon: 'music',     emoji: '🎵', title: 'Muzică live' },
  { icon: 'mic',       emoji: '🎤', title: 'Toast & discursuri' },
  { icon: 'cake',      emoji: '🎂', title: 'Tăierea tortului' },
  { icon: 'bouquet',   emoji: '💐', title: 'Aruncarea buchetului' },
  { icon: 'champagne', emoji: '🥂', title: 'Șampanie & felicitări' },
  { icon: 'car',       emoji: '🚗', title: 'Plecare miri' },
  { icon: 'disco',     emoji: '🪩', title: 'After party' },
  { icon: 'fireworks', emoji: '🎆', title: 'Focuri de artificii' },
  { icon: 'moon',      emoji: '🌙', title: 'Finalul evenimentului' },
];

// ─── Default timeline per template (seeded when empty) ────────────────────────
const DEFAULT_TIMELINE_BASE: Array<{
  icon: string;
  title: string;
  time: string;
  notice: string;
}> = [
  { icon: 'candles', title: 'Ceremonia religioasa', time: '14:00', notice: 'Va rugam sa ajungeti cu 15 min inainte' },
  { icon: 'photo', title: 'Sedinta foto', time: '15:30', notice: 'Durata aproximativa 30 min' },
  { icon: 'arch', title: 'Intrarea in sala', time: '17:00', notice: 'Primirea invitatilor' },
  { icon: 'dinner', title: 'Masa festiva', time: '18:00', notice: 'Deschiderea meniului' },
  { icon: 'dance', title: 'Dansul mirilor', time: '20:00', notice: 'Deschidem petrecerea' },
  { icon: 'cake', title: 'Taierea tortului', time: '22:00', notice: 'Momentul dulce al serii' },
  { icon: 'bouquet', title: 'Aruncarea buchetului', time: '23:00', notice: 'Moment pentru domnisoare' },
  { icon: 'disco', title: 'After party', time: '00:00', notice: 'Muzica si dans' },
];

const buildDefaultTimeline = (prefix: string): TimelineItem[] =>
  DEFAULT_TIMELINE_BASE.map((item, idx) => ({
    id: `${prefix}-${idx}`,
    icon: item.icon,
    title: item.title,
    time: item.time,
    location: '',
    notice: item.notice,
  }));

const DEFAULT_TIMELINE_BY_TEMPLATE: Record<string, TimelineItem[]> = {
  'castle-magic': buildDefaultTimeline('castle-magic'),
  'castle-magic-boys': buildDefaultTimeline('castle-magic-boys'),
  'castle-magic-girl': buildDefaultTimeline('castle-magic-girl'),
  'romantic': buildDefaultTimeline('romantic'),
  'lord-effects': buildDefaultTimeline('lord-effects'),
  'regal': buildDefaultTimeline('regal'),
};

const INLINE_TIMELINE_TEMPLATES = new Set([
  "castle-magic",
  "castle-magic-boys",
  "castle-magic-girl",
  "romantic",
  "regal",
  "lord-effects",
  "gabbys-dollhouse",
  "frozen",
  "unicorn-academy",
]);

const SettingsContent: React.FC<{
  profile: UserProfile;
  timeline: TimelineItem[];
  isActive: boolean;
  hc: (field: keyof UserProfile, value: any) => void;
  guard: (fn: () => void) => void;
  pushTimeline: (nt: TimelineItem[]) => void;
  selectedTemplate?: string;
  templateMeta?: TemplateMeta;
  doorImages?: Record<string, { desktop?: string; mobile?: string }>;
  introVariants?: Record<string, { label: string; desktop?: string; mobile?: string }>;
  defaultIntroVariant?: string;
  inlineBlockPanel?: React.ReactNode;
  introPreview?: boolean;
  onIntroPreviewChange?: (v: boolean) => void;
  hasIntro?: boolean;
  selectedTextKey?: string;
  selectedBlockId?: string;
  selectedBlockType?: string;
}> = ({ profile, timeline, isActive, hc, guard, pushTimeline, selectedTemplate, templateMeta, doorImages = {}, introVariants = {}, defaultIntroVariant, inlineBlockPanel, introPreview = false, onIntroPreviewChange, hasIntro = false, selectedTextKey, selectedBlockId, selectedBlockType }) => {
  const [expandedTheme, setExpandedTheme] = React.useState<string | null>(null);
  const useInlineTimeline = INLINE_TIMELINE_TEMPLATES.has(selectedTemplate || "");
  return (
  <div className="w-full">
    <div className="p-5 space-y-6">

      {/* ① DATA & LINK */}
      <Collapsible
        title="Date Eveniment"
        hint={profile.weddingDate || "neconfigurată"}
        desc="Data eveniment, nume participanți și link public."
        icon={Calendar}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div>
            <Lbl>Data evenimentului</Lbl>
            <Input type="date" value={profile.weddingDate || ""}
              onChange={(e: any) => hc("weddingDate", e.target.value)}
              disabled={!isActive} className="h-8 text-xs" />
            <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> Expiră la 24h după eveniment.
            </p>
          </div>
          {/* Nume parteneri */}
          {(() => {
            const tags = templateMeta?.tags ?? [];
            const eventType = (profile.eventType || 'wedding') as string;
            const isBaptism = tags.length > 0
              ? tags.includes('baptism') && !tags.includes('wedding')
              : (
                  eventType === 'baptism' ||
                  eventType === 'kids' ||
                  selectedTemplate?.includes('baptis') ||
                  selectedTemplate?.includes('christening') ||
                  selectedTemplate?.includes('kids')
                );
            return isBaptism ? (
              <div>
                <Lbl>Numele copilului</Lbl>
                <Input
                  value={(profile as any).partner1Name || ''}
                  onChange={(e: any) => hc('partner1Name' as any, e.target.value)}
                  placeholder="Prenume copil"
                  disabled={!isActive}
                  className="h-8 text-xs w-full"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Lbl>El — Prenume</Lbl>
                  <Input
                    value={(profile as any).partner1Name || ''}
                    onChange={(e: any) => hc('partner1Name' as any, e.target.value)}
                    placeholder="Mihai"
                    disabled={!isActive}
                    className="h-8 text-xs w-full"
                  />
                </div>
                <div>
                  <Lbl>Ea — Prenume</Lbl>
                  <Input
                    value={(profile as any).partner2Name || ''}
                    onChange={(e: any) => hc('partner2Name' as any, e.target.value)}
                    placeholder="Elena"
                    disabled={!isActive}
                    className="h-8 text-xs w-full"
                  />
                </div>
              </div>
            );
          })()}
          <div>
            <Lbl>Link public</Lbl>
            <div className="flex items-center">
              <span className="bg-zinc-50 dark:bg-zinc-800 px-2 py-[7px] rounded-l border border-r-0 text-[10px] text-zinc-400 whitespace-nowrap">events/</span>
              <Input className="rounded-l-none h-8 text-xs" placeholder="slug-url"
                value={profile.inviteSlug || ""}
                onChange={(e: any) => hc("inviteSlug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                disabled={!isActive} />
            </div>
            {profile.inviteSlug && (
              <p className="mt-1 text-[10px] font-mono text-zinc-400 truncate flex items-center gap-1">
                <Info className="w-3 h-3 shrink-0" />
                {typeof window !== "undefined" ? window.location.origin : ""}/events/{profile.inviteSlug}/public
              </p>
            )}
          </div>

        </div>
      </Collapsible>

      {((selectedTemplate?.startsWith('castle-magic')) || selectedTemplate === 'lord-effects' || selectedTemplate === 'romantic' || selectedTemplate === 'royal-rose' || selectedTemplate === 'gabbys-dollhouse' || selectedTemplate === 'frozen' || selectedTemplate === 'unicorn-academy' || selectedTemplate === 'adventure-road' || selectedTemplate === 'jurassic-park' || selectedTemplate === 'zootropolis' || selectedTemplate === 'little-mermaid') && (() => {
        const themes = selectedTemplate === 'lord-effects'
          ? LORD_MONO_THEMES
          : selectedTemplate === 'castle-magic-boys'
            ? BOY_THEMES
          : selectedTemplate === 'castle-magic-girl'
            ? GIRL_THEMES
            : selectedTemplate === 'gabbys-dollhouse'
              ? GABBY_THEMES
              : selectedTemplate === 'frozen'
                ? FROZEN_THEMES
                : selectedTemplate === 'unicorn-academy'
                  ? UNICORN_THEMES
                  : selectedTemplate === 'adventure-road'
                    ? [...ADVENTURE_BOY_THEMES, ...ADVENTURE_GIRL_THEMES]
                  : selectedTemplate === 'jurassic-park'
                    ? [...JURASSIC_BOY_THEMES, ...JURASSIC_GIRL_THEMES]
                  : selectedTemplate === 'zootropolis'
                    ? [...ZOOTROPOLIS_BOY_THEMES, ...ZOOTROPOLIS_GIRL_THEMES]
                  : selectedTemplate === 'little-mermaid'
                    ? [...MERMAID_BOY_THEMES, ...MERMAID_GIRL_THEMES]
                  : selectedTemplate === 'romantic' || selectedTemplate === 'royal-rose'
                    ? ROMANTIC_THEMES
                    : CASTLE_THEMES;

        const activeTheme = themes.find(t => ((profile as any).colorTheme ?? 'default') === t.id);

        return (
          <Collapsible
            title="Paleta de culori"
            hint={activeTheme ? activeTheme.name : "neconfigurat"}
            desc="Alege tema cromatică a invitației."
            icon={Palette}
            defaultOpen={false}
          >
              <div className="space-y-1">
                {themes.map(t => {
                  const active = ((profile as any).colorTheme ?? 'default') === t.id;
                  const selectTheme = () => hc('colorTheme' as any, t.id);
                  return (
                    <React.Fragment key={t.id}>
                      <div
                        role="button"
                        tabIndex={isActive ? 0 : -1}
                        aria-pressed={active}
                        aria-disabled={!isActive}
                        onClick={() => { if (isActive) selectTheme(); }}
                        onKeyDown={(e) => {
                          if (!isActive) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectTheme();
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg border transition-all text-left",
                          isActive ? "cursor-pointer" : "opacity-50 pointer-events-none",
                          active
                            ? "border-zinc-400 dark:border-zinc-400 bg-zinc-50 dark:bg-zinc-800"
                            : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 bg-white dark:bg-zinc-900"
                        )}>
                        <div className="flex gap-1 shrink-0">
                          {[t.PINK_DARK, t.PINK_L, t.PINK_XL].map((c, i) => (
                            <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block' }} />
                          ))}
                        </div>
                        <span className="flex-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200">{t.emoji} {t.name}</span>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setExpandedTheme(expandedTheme === t.id ? null : t.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                          title={doorImages[t.id]?.desktop ? "Vezi imaginile ușilor" : "Fără imagini încărcate"}
                        >
                          <svg
                            width="12" height="12" viewBox="0 0 12 12"
                            style={{
                              color: doorImages[t.id]?.desktop ? '#6b7280' : '#d1d5db',
                              transform: expandedTheme === t.id ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s',
                            }}
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                          >
                            <polyline points="2,4 6,8 10,4"/>
                          </svg>
                        </button>
                        {active && (
                          <svg className="w-3 h-3 text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      {/* Collapsible door preview */}
                      {expandedTheme === t.id && (
                        <div style={{
                          marginTop: 4, marginBottom: 4,
                          borderRadius: 10,
                          border: '1px solid',
                          borderColor: doorImages[t.id]?.desktop ? t.PINK_DARK + '33' : '#e5e7eb',
                          overflow: 'hidden',
                          background: doorImages[t.id]?.desktop ? t.PINK_XL || '#fdf2f8' : '#f9fafb',
                          padding: doorImages[t.id]?.desktop ? 8 : 10,
                        }}>
                          {doorImages[t.id]?.desktop || doorImages[t.id]?.mobile ? (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                              {/* Desktop preview */}
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 4px', fontSize: 8, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Desktop</p>
                                {doorImages[t.id]?.desktop ? (
                                  <div style={{
                                    width: '100%', paddingTop: '56.25%', position: 'relative',
                                    borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)',
                                  }}>
                                    <img
                                      src={doorImages[t.id]?.desktop}
                                      alt="Desktop door"
                                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  </div>
                                ) : (
                                  <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', borderRadius: 6, background: '#f3f4f6', border: '1px dashed #e5e7eb' }}>
                                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#9ca3af' }}>lipsă</span>
                                  </div>
                                )}
                              </div>
                              {/* Mobile preview */}
                              <div style={{ width: 44 }}>
                                <p style={{ margin: '0 0 4px', fontSize: 8, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mobile</p>
                                {doorImages[t.id]?.mobile ? (
                                  <div style={{
                                    width: 44, paddingTop: '177%', position: 'relative',
                                    borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)',
                                  }}>
                                    <img
                                      src={doorImages[t.id]?.mobile}
                                      alt="Mobile door"
                                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  </div>
                                ) : (
                                  <div style={{ width: 44, paddingTop: '177%', position: 'relative', borderRadius: 6, background: '#f3f4f6', border: '1px dashed #e5e7eb' }}>
                                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#9ca3af', writingMode: 'vertical-rl' }}>lipsă</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 14 }}>🖼️</span>
                              <div>
                                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#6b7280' }}>Imagini implicite</p>
                                <p style={{ margin: '1px 0 0', fontSize: 9, color: '#9ca3af' }}>Se folosesc imaginile temei Default</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
          </Collapsible>
        );
      })()}

      {inlineBlockPanel && (
        <Collapsible
          title="Proprietăți"
          desc={
            selectedBlockType === 'photo'
              ? "Dimensiune, formă, mască și poziționare pentru imagine."
              : "Font, dimensiune, spațiere și culoare pentru textul selectat."
          }
          icon={Sliders}
          defaultOpen={false}
          openSignal={selectedTextKey || (selectedBlockType === 'photo' ? selectedBlockId : undefined)}
          highlight={!!selectedTextKey || selectedBlockType === 'photo'}
        >
          {inlineBlockPanel}
        </Collapsible>
      )}

      {hasIntro && (
        <Collapsible
          title="Intro"
          desc="Animația de început, texte și variante."
          icon={Sparkles}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2">
              <div>
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Arată intro în preview</p>
                <p className="text-[10px] text-zinc-400">Util pentru a regla textele înainte de publicare.</p>
              </div>
              <Toggle on={introPreview} onChange={(v) => onIntroPreviewChange?.(v)} />
            </div>

            {(selectedTemplate?.startsWith('castle-magic') || selectedTemplate === 'lord-effects') && (
              <Collapsible title="Texte Intro Castel" defaultOpen={false} variant="sub">
                <div className="space-y-3">
                  <p className="text-[9px] text-zinc-400 italic mb-2">
                    Textele care apar în animația de scroll înainte de deschiderea ușilor.
                  </p>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Rând 1 (deasupra numelui)
                    </label>
                    <Input
                      value={(profile as any).castleInviteTop ?? 'Cu bucurie vă anunțăm'}
                      onChange={(e: any) => hc('castleInviteTop', e.target.value)}
                      placeholder="Cu bucurie vă anunțăm"
                      className="h-7 text-xs w-full"
                      disabled={!isActive}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Rând 2 (text script central)
                    </label>
                    <Input
                      value={(profile as any).castleInviteMiddle ?? 'în lumina credinței'}
                      onChange={(e: any) => hc('castleInviteMiddle', e.target.value)}
                      placeholder="în lumina credinței"
                      className="h-7 text-xs w-full"
                      disabled={!isActive}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Rând 3 (sub textul central)
                    </label>
                    <Input
                      value={(profile as any).castleInviteBottom ?? 'a fost botezat'}
                      onChange={(e: any) => hc('castleInviteBottom', e.target.value)}
                      placeholder="a fost botezat"
                      className="h-7 text-xs w-full"
                      disabled={!isActive}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Tag (ultimul rând)
                    </label>
                    <Input
                      value={(profile as any).castleInviteTag ?? '✦ deschide porțile ✦'}
                      onChange={(e: any) => hc('castleInviteTag', e.target.value)}
                      placeholder="✦ deschide porțile ✦"
                      className="h-7 text-xs w-full"
                      disabled={!isActive}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Subtitlu uși (sub numele copilului pe uși)
                    </label>
                    <Input
                      value={(profile as any).castleIntroSubtitle ?? 'in my castle'}
                      onChange={(e: any) => hc('castleIntroSubtitle', e.target.value)}
                      placeholder="in my castle"
                      className="h-7 text-xs w-full"
                      disabled={!isActive}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Text arcuit (Welcome)
                    </label>
                    <Input
                      value={(profile as any).castleIntroWelcome ?? 'WELCOME'}
                      onChange={(e: any) => hc('castleIntroWelcome', e.target.value)}
                      placeholder="WELCOME"
                      className="h-7 text-xs w-full"
                      disabled={!isActive}
                    />
                  </div>
                </div>
              </Collapsible>
            )}

            {selectedTemplate === 'royal-rose' && (
              <Collapsible title="Video Intro Royal" defaultOpen={false} variant="sub">
                <div className="space-y-3">
                  <p className="text-[9px] text-zinc-400 italic">
                    Video care apare ca fundal în intro-ul animat.
                  </p>
                  {(profile as any).castleVideoUrl ? (
                    <div className="relative group rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <video
                        src={(profile as any).castleVideoUrl}
                        muted loop playsInline autoPlay
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => guard(() => hc('castleVideoUrl' as any, undefined))}
                          className="p-2 bg-white rounded-full text-red-500 text-xs font-bold"
                        >
                          Șterge
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-400 transition-colors bg-zinc-50 dark:bg-zinc-900 ${!isActive ? 'opacity-50 pointer-events-none' : ''}`} style={{ aspectRatio: '16/9' }}>
                      <span className="text-lg">🎬</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Upload video .mp4</span>
                      <input
                        type="file" accept="video/mp4,video/*" className="hidden"
                        disabled={!isActive}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const form = new FormData();
                          form.append('file', file);
                          const tok = JSON.parse(localStorage.getItem('weddingPro_session') || '{}')?.token || '';
                          try {
                            const res = await fetch(`${API_URL}/upload`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${tok}` },
                              body: form,
                            });
                            const { url } = await res.json();
                            hc('castleVideoUrl' as any, url);
                          } catch {}
                        }}
                      />
                    </label>
                  )}
                </div>
              </Collapsible>
            )}

            {selectedTemplate === 'regal' && (
              <Collapsible title="Texte Intro Jungle" defaultOpen={false} variant="sub">
                <div className="space-y-3">
                  <p className="text-[9px] text-zinc-400 italic">
                    Câmpuri dedicate pentru intro-ul template-ului Jungle/Regal.
                  </p>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Text sus
                    </label>
                    <Input
                      value={(profile as any).jungleHeaderText ?? 'Save The Date'}
                      onChange={(e: any) => hc('jungleHeaderText' as any, e.target.value)}
                      placeholder="Save The Date"
                      className="h-7 text-xs w-full"
                      disabled={!isActive}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Text principal editorial
                    </label>
                    <textarea
                      value={(profile as any).jungleOverlayText ?? 'Cu bucurie vă invităm să fiți parte din povestea noastră.'}
                      onChange={(e: any) => hc('jungleOverlayText' as any, e.target.value)}
                      placeholder="Textul care apare cuvânt cu cuvânt în intro..."
                      className="w-full min-h-[88px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs"
                      disabled={!isActive}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Text jos
                    </label>
                    <Input
                      value={(profile as any).jungleFooterText ?? ''}
                      onChange={(e: any) => hc('jungleFooterText' as any, e.target.value)}
                      placeholder="Lasă gol pentru a folosi data nunții"
                      className="h-7 text-xs w-full"
                      disabled={!isActive}
                    />
                  </div>
                </div>
              </Collapsible>
            )}

            {selectedTemplate === 'regal' && Object.keys(introVariants).length > 0 && (
              <Collapsible title="Variantă Intro" defaultOpen={false} variant="sub">
                <div className="space-y-1">
                  {Object.entries(introVariants).map(([ivId, iv]) => {
                    const activeVariantId = (profile as any).introVariant ?? defaultIntroVariant ?? Object.keys(introVariants)[0];
                    const isChosen = activeVariantId === ivId;
                    const hasImg = !!(iv.desktop || iv.mobile);
                    const isExpanded = expandedTheme === ivId;
                    return (
                      <React.Fragment key={ivId}>
                        <div
                          role="button"
                          tabIndex={isActive ? 0 : -1}
                          aria-pressed={isChosen}
                          aria-disabled={!isActive || !hasImg}
                          onClick={() => { if (isActive && hasImg) guard(() => hc('introVariant' as any, ivId)); }}
                          onKeyDown={(e) => {
                            if (!isActive || !hasImg) return;
                            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); guard(() => hc('introVariant' as any, ivId)); }
                          }}
                          className={cn(
                            "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg border transition-all text-left",
                            (!isActive || !hasImg) ? "opacity-50 pointer-events-none" : "cursor-pointer",
                            isChosen
                              ? "border-zinc-400 dark:border-zinc-400 bg-zinc-50 dark:bg-zinc-800"
                              : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 bg-white dark:bg-zinc-900"
                          )}>
                          {iv.desktop ? (
                            <div className="shrink-0 rounded overflow-hidden border border-zinc-200" style={{ width: 32, height: 18 }}>
                              <img src={iv.desktop} alt={iv.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                          ) : (
                            <div className="shrink-0 rounded bg-zinc-100 border border-dashed border-zinc-300" style={{ width: 32, height: 18 }} />
                          )}
                          <span className="flex-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 truncate">{iv.label}</span>
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setExpandedTheme(isExpanded ? null : ivId); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                            title={hasImg ? 'Vezi previzualizare' : 'Fără imagini'}
                          >
                            <svg
                              width="12" height="12" viewBox="0 0 12 12"
                              style={{
                                color: hasImg ? '#6b7280' : '#d1d5db',
                                transform: isExpanded ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s',
                              }}
                              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            >
                              <polyline points="2,4 6,8 10,4"/>
                            </svg>
                          </button>
                          {isChosen && (
                            <svg className="w-3 h-3 text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>

                        {isExpanded && (
                          <div style={{
                            marginTop: 4, marginBottom: 4,
                            borderRadius: 10,
                            border: '1px solid',
                            borderColor: hasImg ? '#92400e33' : '#e5e7eb',
                            overflow: 'hidden',
                            background: hasImg ? '#fffbeb' : '#f9fafb',
                            padding: hasImg ? 8 : 10,
                          }}>
                            {hasImg ? (
                              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                {/* Desktop preview */}
                                <div style={{ flex: 1 }}>
                                  <p style={{ margin: '0 0 4px', fontSize: 8, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Desktop</p>
                                  {iv.desktop ? (
                                    <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                                      <img src={iv.desktop} alt="Desktop" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                  ) : (
                                    <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', borderRadius: 6, background: '#f3f4f6', border: '1px dashed #e5e7eb' }}>
                                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#9ca3af' }}>lipsă</span>
                                    </div>
                                  )}
                                </div>
                                {/* Mobile preview */}
                                <div style={{ width: 44 }}>
                                  <p style={{ margin: '0 0 4px', fontSize: 8, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mobile</p>
                                  {iv.mobile ? (
                                    <div style={{ width: 44, paddingTop: '177%', position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                                      <img src={iv.mobile} alt="Mobile" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                  ) : (
                                    <div style={{ width: 44, paddingTop: '177%', position: 'relative', borderRadius: 6, background: '#f3f4f6', border: '1px dashed #e5e7eb' }}>
                                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#9ca3af', writingMode: 'vertical-rl' }}>lipsă</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 14 }}>🖼️</span>
                                <div>
                                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#6b7280' }}>Fără imagini</p>
                                  <p style={{ margin: '1px 0 0', fontSize: 9, color: '#9ca3af' }}>Configurează imaginile din Admin → Template Management</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </Collapsible>
            )}

            {selectedTemplate === 'regal' && (
              <Collapsible title="Stil Intro" defaultOpen={false} hint="animația de deschidere" variant="sub">
                <div className="space-y-2">
                  {[
                    {
                      id: 'dissolve',
                      title: 'Dissolve',
                      desc: 'Varianta actuală, cu scroll și efectul canvas.',
                    },
                  ].map((styleOption) => {
                    const activeStyle = ((profile as any).jungleIntroStyle || 'dissolve') === styleOption.id;
                    return (
                      <button
                        key={styleOption.id}
                        type="button"
                        onClick={() => guard(() => hc('jungleIntroStyle' as any, styleOption.id))}
                        disabled={!isActive}
                        className={cn(
                          "w-full rounded-xl border px-3 py-2 text-left transition-all",
                          !isActive && "opacity-50 cursor-not-allowed",
                          activeStyle
                            ? "border-zinc-400 bg-zinc-50 dark:bg-zinc-800"
                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-100">
                              {styleOption.title}
                            </div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {styleOption.desc}
                            </div>
                          </div>
                          {activeStyle && (
                            <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Collapsible>
            )}
          </div>
        </Collapsible>
      )}

      {/* ③ OPȚIUNI */}
      {/* <Collapsible title="Opțiuni" defaultOpen={false}>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Countdown</p>
              <p className="text-[10px] text-zinc-400">Numărătoare inversă</p>
            </div>
            <Toggle on={!!profile.showCountdown} onChange={v => hc("showCountdown", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Buton RSVP</p>
              <p className="text-[10px] text-zinc-400">Confirmă prezența</p>
            </div>
            <Toggle on={false} onChange={v => hc("showRsvpButton", v)} />
          </div>
        </div>
        <p className="text-[9px] text-zinc-400 mt-2 italic">Textul butonului se editează direct ←</p>
      </Collapsible>

      <Hr /> */}

      {/* ④ CRONOLOGIE */}
      {!useInlineTimeline && (
        <Collapsible
          title="Cronologie"
          defaultOpen={false}
          desc="Programul zilei și momentele cheie."
          icon={Clock}
        >
          <div className="flex items-center gap-2 mb-3">
            <Toggle on={!!profile.showTimeline} onChange={v => hc("showTimeline", v)} />
            <button type="button" disabled={!isActive}
              onClick={() => guard(() => pushTimeline([...timeline, { id: Date.now().toString(), title: "", time: "", location: "", icon: "party", notice: "" }]))}
              className="flex items-center gap-0.5 text-[10px] font-bold text-zinc-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-30">
              <Plus className="w-3 h-3" /> Adaugă moment
            </button>
          </div>

          {/* Quick-add preset buttons */}
          <div className={cn("flex flex-wrap gap-1 mb-3", !profile.showTimeline && "opacity-40 pointer-events-none")}>
            {TIMELINE_PRESETS.map(p => (
              <button key={p.icon} type="button" disabled={!isActive}
                onClick={() => guard(() => pushTimeline([...timeline, { id: Date.now().toString(), title: p.title, time: "", location: "", icon: p.icon, notice: "" }]))}
                className="flex items-center gap-1 px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-[9px] font-bold text-zinc-500 hover:border-amber-400 hover:text-amber-700 disabled:opacity-30 transition-colors">
                <span>{p.emoji}</span>{p.title}
              </button>
            ))}
          </div>

          <div className={cn("space-y-2", !profile.showTimeline && "opacity-40 pointer-events-none")}>
            {timeline.length === 0 && (
              <p className="text-[10px] text-zinc-400 italic">Niciun moment adăugat. Folosește butoanele de mai sus sau adaugă manual.</p>
            )}
            {timeline.map(item => (
              <div key={item.id} className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-2 space-y-1.5 group">
                {/* Row 1: icon selector + time + title + delete */}
                <div className="flex gap-1 items-center">
                  {/* Icon picker */}
                  <select value={item.icon || 'party'} disabled={!isActive}
                    onChange={(e: any) => pushTimeline(timeline.map(t => t.id === item.id ? { ...t, icon: e.target.value } : t))}
                    className="h-7 w-8 text-base border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 shrink-0 text-center cursor-pointer disabled:opacity-30"
                    style={{ paddingLeft: 2 }}>
                    {TIMELINE_PRESETS.map(p => (
                      <option key={p.icon} value={p.icon}>{p.emoji}</option>
                    ))}
                  </select>
                  <Input type="time" value={item.time} className="w-20 h-7 text-xs shrink-0"
                    onChange={(e: any) => pushTimeline(timeline.map(t => t.id === item.id ? { ...t, time: e.target.value } : t))}
                    disabled={!isActive} />
                  <Input placeholder="Moment..." value={item.title} className="flex-1 h-7 text-xs"
                    onChange={(e: any) => pushTimeline(timeline.map(t => t.id === item.id ? { ...t, title: e.target.value } : t))}
                    disabled={!isActive} />
                  <button type="button" onClick={() => pushTimeline(timeline.filter(t => t.id !== item.id))}
                    className="opacity-0 group-hover:opacity-100 shrink-0 p-1 hover:text-red-500 text-zinc-300 transition-all" disabled={!isActive}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                {/* Row 2: notice (optional extra info) */}
                <Input placeholder="Notă (ex: Florin Salam, pauză 30 min...)" value={item.notice || ''} className="h-6 text-[10px] w-full"
                  onChange={(e: any) => pushTimeline(timeline.map(t => t.id === item.id ? { ...t, notice: e.target.value } : t))}
                  disabled={!isActive} />
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {false && (selectedTemplate?.startsWith('castle-magic') || selectedTemplate === 'lord-effects') && (
        <>
          <Hr />
          {/* ⑤ TEXTE INTRO CASTEL */}
          <Collapsible title="Texte Intro Castel" defaultOpen={false}>
            <div className="space-y-3">
              <p className="text-[9px] text-zinc-400 italic mb-2">
                Textele care apar în animația de scroll înainte de deschiderea ușilor.
              </p>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Rând 1 (deasupra numelui)
                </label>
                <Input
                  value={(profile as any).castleInviteTop ?? 'Cu bucurie vă anunțăm'}
                  onChange={(e: any) => hc('castleInviteTop', e.target.value)}
                  placeholder="Cu bucurie vă anunțăm"
                  className="h-7 text-xs w-full"
                  disabled={!isActive}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Rând 2 (text script central)
                </label>
                <Input
                  value={(profile as any).castleInviteMiddle ?? 'în lumina credinței'}
                  onChange={(e: any) => hc('castleInviteMiddle', e.target.value)}
                  placeholder="în lumina credinței"
                  className="h-7 text-xs w-full"
                  disabled={!isActive}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Rând 3 (sub textul central)
                </label>
                <Input
                  value={(profile as any).castleInviteBottom ?? 'a fost botezat'}
                  onChange={(e: any) => hc('castleInviteBottom', e.target.value)}
                  placeholder="a fost botezat"
                  className="h-7 text-xs w-full"
                  disabled={!isActive}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Tag (ultimul rând)
                </label>
                <Input
                  value={(profile as any).castleInviteTag ?? '✦ deschide porțile ✦'}
                  onChange={(e: any) => hc('castleInviteTag', e.target.value)}
                  placeholder="✦ deschide porțile ✦"
                  className="h-7 text-xs w-full"
                  disabled={!isActive}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Subtitlu uși (sub numele copilului pe uși)
                </label>
                <Input
                  value={(profile as any).castleIntroSubtitle ?? 'in my castle'}
                  onChange={(e: any) => hc('castleIntroSubtitle', e.target.value)}
                  placeholder="in my castle"
                  className="h-7 text-xs w-full"
                  disabled={!isActive}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Text arcuit (Welcome)
                </label>
                <Input
                  value={(profile as any).castleIntroWelcome ?? 'WELCOME'}
                  onChange={(e: any) => hc('castleIntroWelcome', e.target.value)}
                  placeholder="WELCOME"
                  className="h-7 text-xs w-full"
                  disabled={!isActive}
                />
              </div>
            </div>
          </Collapsible>

        </>
      )}

      {false && selectedTemplate === 'royal-rose' && (
        <>
          <Hr />
          <Collapsible title="🎬 Video Intro Royal" defaultOpen={false}>
            <div className="space-y-3">
              <p className="text-[9px] text-zinc-400 italic">
                Video care apare ca fundal în intro-ul animat.
              </p>
              {(profile as any).castleVideoUrl ? (
                <div className="relative group rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <video
                    src={(profile as any).castleVideoUrl}
                    muted loop playsInline autoPlay
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => guard(() => hc('castleVideoUrl' as any, undefined))}
                      className="p-2 bg-white rounded-full text-red-500 text-xs font-bold"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-400 transition-colors bg-zinc-50 dark:bg-zinc-900 ${!isActive ? 'opacity-50 pointer-events-none' : ''}`} style={{ aspectRatio: '16/9' }}>
                  <span className="text-lg">🎬</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Upload video .mp4</span>
                  <input
                    type="file" accept="video/mp4,video/*" className="hidden"
                    disabled={!isActive}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append('file', file);
                      const tok = JSON.parse(localStorage.getItem('weddingPro_session') || '{}')?.token || '';
                      try {
                        const res = await fetch(`${API_URL}/upload`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${tok}` },
                          body: form,
                        });
                        const { url } = await res.json();
                        hc('castleVideoUrl' as any, url);
                      } catch {}
                    }}
                  />
                </label>
              )}
            </div>
          </Collapsible>
        </>
      )}

      {false && selectedTemplate === 'regal' && (
        <>
          <Hr />
          <Collapsible title="Texte Intro Jungle" defaultOpen={false}>
            <div className="space-y-3">
              <p className="text-[9px] text-zinc-400 italic">
                Câmpuri dedicate pentru intro-ul template-ului Jungle/Regal.
              </p>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Text sus
                </label>
                <Input
                  value={(profile as any).jungleHeaderText ?? 'Save The Date'}
                  onChange={(e: any) => hc('jungleHeaderText' as any, e.target.value)}
                  placeholder="Save The Date"
                  className="h-7 text-xs w-full"
                  disabled={!isActive}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Text principal editorial
                </label>
                <textarea
                  value={(profile as any).jungleOverlayText ?? 'Cu bucurie vă invităm să fiți parte din povestea noastră.'}
                  onChange={(e: any) => hc('jungleOverlayText' as any, e.target.value)}
                  placeholder="Textul care apare cuvânt cu cuvânt în intro..."
                  className="w-full min-h-[88px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs"
                  disabled={!isActive}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Text jos
                </label>
                <Input
                  value={(profile as any).jungleFooterText ?? ''}
                  onChange={(e: any) => hc('jungleFooterText' as any, e.target.value)}
                  placeholder="Lasă gol pentru a folosi data nunții"
                  className="h-7 text-xs w-full"
                  disabled={!isActive}
                />
              </div>
            </div>
          </Collapsible>
        </>
      )}

      {selectedTemplate === 'regal' && (
        <>
          {Object.keys(introVariants).length > 0 && (
            <>
              <Hr />
              <Collapsible title="🖼 Variantă Intro" defaultOpen={true}>
                <div className="space-y-1">
                  {Object.entries(introVariants).map(([ivId, iv]) => {
                    const activeVariantId = (profile as any).introVariant ?? defaultIntroVariant ?? Object.keys(introVariants)[0];
                    const isChosen = activeVariantId === ivId;
                    const hasImg = !!(iv.desktop || iv.mobile);
                    const isExpanded = expandedTheme === ivId;
                    return (
                      <React.Fragment key={ivId}>
                        <div
                          role="button"
                          tabIndex={isActive ? 0 : -1}
                          aria-pressed={isChosen}
                          aria-disabled={!isActive || !hasImg}
                          onClick={() => { if (isActive && hasImg) guard(() => hc('introVariant' as any, ivId)); }}
                          onKeyDown={(e) => {
                            if (!isActive || !hasImg) return;
                            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); guard(() => hc('introVariant' as any, ivId)); }
                          }}
                          className={cn(
                            "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg border transition-all text-left",
                            (!isActive || !hasImg) ? "opacity-50 pointer-events-none" : "cursor-pointer",
                            isChosen
                              ? "border-zinc-400 dark:border-zinc-400 bg-zinc-50 dark:bg-zinc-800"
                              : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 bg-white dark:bg-zinc-900"
                          )}>
                          {iv.desktop ? (
                            <div className="shrink-0 rounded overflow-hidden border border-zinc-200" style={{ width: 32, height: 18 }}>
                              <img src={iv.desktop} alt={iv.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                          ) : (
                            <div className="shrink-0 rounded bg-zinc-100 border border-dashed border-zinc-300" style={{ width: 32, height: 18 }} />
                          )}
                          <span className="flex-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 truncate">{iv.label}</span>
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setExpandedTheme(isExpanded ? null : ivId); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                            title={hasImg ? 'Vezi previzualizare' : 'Fără imagini'}
                          >
                            <svg
                              width="12" height="12" viewBox="0 0 12 12"
                              style={{
                                color: hasImg ? '#6b7280' : '#d1d5db',
                                transform: isExpanded ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s',
                              }}
                              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            >
                              <polyline points="2,4 6,8 10,4"/>
                            </svg>
                          </button>
                          {isChosen && (
                            <svg className="w-3 h-3 text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>

                        {isExpanded && (
                          <div style={{
                        marginTop: 4, marginBottom: 4,
                        borderRadius: 10,
                        border: '1px solid',
                        borderColor: hasImg ? '#92400e33' : '#e5e7eb',
                        overflow: 'hidden',
                        background: hasImg ? '#fffbeb' : '#f9fafb',
                        padding: hasImg ? 8 : 10,
                      }}>
                        {hasImg ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            {/* Desktop preview */}
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: '0 0 4px', fontSize: 8, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Desktop</p>
                              {iv.desktop ? (
                                <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                                  <img src={iv.desktop} alt="Desktop" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              ) : (
                                <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', borderRadius: 6, background: '#f3f4f6', border: '1px dashed #e5e7eb' }}>
                                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#9ca3af' }}>lipsă</span>
                                </div>
                              )}
                            </div>
                            {/* Mobile preview */}
                            <div style={{ width: 44 }}>
                              <p style={{ margin: '0 0 4px', fontSize: 8, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mobile</p>
                              {iv.mobile ? (
                                <div style={{ width: 44, paddingTop: '177%', position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                                  <img src={iv.mobile} alt="Mobile" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              ) : (
                                <div style={{ width: 44, paddingTop: '177%', position: 'relative', borderRadius: 6, background: '#f3f4f6', border: '1px dashed #e5e7eb' }}>
                                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#9ca3af', writingMode: 'vertical-rl' }}>lipsă</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14 }}>🖼️</span>
                            <div>
                              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#6b7280' }}>Fără imagini</p>
                              <p style={{ margin: '1px 0 0', fontSize: 9, color: '#9ca3af' }}>Configurează imaginile din Admin → Template Management</p>
                            </div>
                          </div>
                        )}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </Collapsible>
            </>
          )}

          <div className={cn(Object.keys(introVariants).length > 0 ? "mt-3" : "")}>
            <Collapsible title="Stil Intro" defaultOpen={true} hint="animația de deschidere">
              <div className="space-y-2">
                {[
                  {
                    id: 'dissolve',
                    title: 'Dissolve',
                    desc: 'Varianta actuală, cu scroll și efectul canvas.',
                  },
                ].map((styleOption) => {
                  const activeStyle = ((profile as any).jungleIntroStyle || 'dissolve') === styleOption.id;
                  return (
                    <button
                      key={styleOption.id}
                      type="button"
                      onClick={() => guard(() => hc('jungleIntroStyle' as any, styleOption.id))}
                      disabled={!isActive}
                      className={cn(
                        "w-full rounded-xl border px-3 py-2 text-left transition-all",
                        !isActive && "opacity-50 cursor-not-allowed",
                        activeStyle
                          ? "border-zinc-400 bg-zinc-50 dark:bg-zinc-800"
                          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-100">
                            {styleOption.title}
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {styleOption.desc}
                          </div>
                        </div>
                        {activeStyle && (
                          <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Collapsible>
          </div>
        </>
      )}

      {!isActive && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10px] text-amber-700">
          Evenimentul s-a încheiat. Invitația este în modul de vizualizare.
        </div>
      )}

      <div className="h-6" />
    </div>
  </div>
  );
};

// ─── MobilePhotoPreview — live photo preview with clip/mask applied ──────────────
const CLIP_CSS: Record<string, string> = {
  rect:         'none',
  rounded:      'none',
  'rounded-lg': 'none',
  squircle:     'none',
  circle:       'circle(50% at 50% 50%)',
  arch:         'polygon(0% 100%, 0% 60%, 50% 0%, 100% 60%, 100% 100%)',
  'arch-b':     'polygon(0% 0%, 0% 40%, 50% 100%, 100% 40%, 100% 0%)',
  hexagon:      'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  diamond:      'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  triangle:     'polygon(50% 0%, 100% 100%, 0% 100%)',
  star:         'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
  heart:        'none',
  diagonal:     'polygon(0% 0%, 100% 0%, 100% 100%, 0% 80%)',
  'diagonal-r': 'polygon(0% 0%, 100% 0%, 100% 80%, 0% 100%)',
  'wave-b':     'polygon(0% 0%, 100% 0%, 100% 75%, 75% 90%, 50% 75%, 25% 90%, 0% 75%)',
  'wave-t':     'polygon(0% 25%, 25% 10%, 50% 25%, 75% 10%, 100% 25%, 100% 100%, 0% 100%)',
  'wave-both':  'polygon(0% 25%, 25% 10%, 50% 25%, 75% 10%, 100% 25%, 100% 75%, 75% 90%, 50% 75%, 25% 90%, 0% 75%)',
  blob:  'none', blob2: 'none', blob3: 'none', blob4: 'none',
};
const BORDER_RADIUS: Record<string, string> = {
  rounded: '0.75rem', 'rounded-lg': '1.5rem', squircle: '40%',
};
const MASK_GRADIENT: Record<string, string> = {
  'fade-b':   'linear-gradient(to bottom, black 50%, transparent 100%)',
  'fade-t':   'linear-gradient(to top, black 50%, transparent 100%)',
  'fade-l':   'linear-gradient(to left, black 50%, transparent 100%)',
  'fade-r':   'linear-gradient(to right, black 50%, transparent 100%)',
  'vignette': 'radial-gradient(ellipse at center, black 40%, transparent 100%)',
};

const MobilePhotoPreview: React.FC<{ block: InvitationBlock }> = ({ block }) => {
  const clip = block.photoClip || 'rect';
  const masks = block.photoMasks || [];
  const ar = block.aspectRatio || 'free';
  const img = block.imageData || '';

  const arPad: Record<string, string> = { '1:1':'100%', '4:3':'75%', '3:4':'133%', '16:9':'56.25%', free:'100%' };
  const clipPath = CLIP_CSS[clip] || 'none';
  const borderRadius = BORDER_RADIUS[clip] || (clip === 'rect' ? '0' : '0');

  // Combine masks into a CSS mask-image
  const maskImage = masks.length
    ? masks.map(m => MASK_GRADIENT[m] || '').filter(Boolean).join(', ')
    : 'none';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 gap-2 p-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Preview live</div>
      <div className="relative" style={{ width: '140px' }}>
        <div style={{ paddingBottom: arPad[ar] || '100%', position: 'relative', overflow: 'hidden' }}>
          <img
            src={img}
            alt="preview"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              clipPath,
              borderRadius,
              WebkitMaskImage: maskImage,
              maskImage,
              WebkitMaskComposite: 'source-in',
              maskComposite: 'intersect',
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 text-[9px] text-zinc-400">
        {clip !== 'rect' && <span className="bg-zinc-200 rounded-full px-2 py-0.5">{clip}</span>}
        {masks.map(m => <span key={m} className="bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">{m}</span>)}
        <span className="bg-zinc-100 rounded-full px-2 py-0.5">{ar}</span>
      </div>
    </div>
  );
};

// ─── Theme hook — reads weddingPro_theme from localStorage ──────────────────────
function useAppDarkMode(): boolean {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('weddingPro_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    // Cross-tab sync via storage event
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'weddingPro_theme') setDark(e.newValue === 'dark');
    };
    window.addEventListener('storage', onStorage);

    // Same-tab sync — only update when the dark class itself changes
    let prevDark = document.documentElement.classList.contains('dark');
    const observer = new MutationObserver(() => {
      const nowDark = document.documentElement.classList.contains('dark');
      if (nowDark !== prevDark) {
        prevDark = nowDark;
        setDark(nowDark);
      }
    });
    observer.observe(document.documentElement, { attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
    };
  }, []);

  return dark;
}

// ─── Main component ────────────────────────────────────────────────────────────
const SettingsView: React.FC<SettingsViewProps> = ({
  session, onUpdateProfile, selectedTemplate, templateMeta, onCheckActive,
}) => {
  const { toast } = useToast();
  const isActive = !session.isEventCompleted;
  const isDark   = useAppDarkMode();
  const et = (session.profile?.eventType || "wedding") as EventType | "office";

  const safeJSON = <T,>(s: string | undefined, fb: T): T => {
    try { return s ? JSON.parse(s) : fb; } catch { return fb; }
  };

  // ── Responsive ───────────────────────────────────────────────────────────────
  const [isMobile,  setIsMobile]  = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMobilePropsOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    if (activeTab === 'settings') setMobilePropsOpen(false);
  }, [activeTab, isMobile]);

  // ── Resizable settings panel (desktop) ───────────────────────────────────────
  const [settingsW,      setSettingsW]      = useState(450);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
  const [previewScroller, setPreviewScroller] = useState<HTMLDivElement | null>(null);
  const MOBILE_PREVIEW_SCALE = 0.62;
  const MOBILE_SELECTED_TOP_OFFSET = 96;
  const lastPreviewPointerEl = useRef<Element | null>(null);
  const suppressNextMobileSelectRef = useRef(false);
  const suppressMobileSelectUntilRef = useRef(0);
  const mobileTopChromeRef = useRef<HTMLDivElement | null>(null);
  const mobileHintRef = useRef<HTMLDivElement | null>(null);
  const mobilePreviewInnerRef = useRef<HTMLDivElement | null>(null);
  const [mobilePreviewVisualHeight, setMobilePreviewVisualHeight] = useState<number | null>(null);
  const isInteractivePreviewTarget = useCallback((el: Element | null) => {
    if (!el) return false;
    return !!el.closest(
      'button,[role="button"],a,input,select,textarea,label,svg,path,[data-block-toolbar],[class*="group-hover/block:"]',
    );
  }, []);
  const shouldSuppressMobileSelectFromEvent = useCallback((evtTarget: EventTarget | null, evt?: Event) => {
    if (evtTarget instanceof Element && isInteractivePreviewTarget(evtTarget)) return true;
    const path = (evt as any)?.composedPath?.() as EventTarget[] | undefined;
    if (Array.isArray(path)) {
      for (const node of path) {
        if (node instanceof Element && isInteractivePreviewTarget(node)) return true;
      }
    }
    return false;
  }, [isInteractivePreviewTarget]);
  const setPreviewScrollerRef = useCallback((el: HTMLDivElement | null) => {
    setPreviewScroller(el);
  }, []);
  const scrollSelectedPreviewIntoView = useCallback(() => {
    if (!previewScroller) return;

    let target: Element | null = null;
    const active = document.activeElement;
    if (active instanceof HTMLElement && previewScroller.contains(active)) {
      target = active;
    }

    if (!target && lastPreviewPointerEl.current && previewScroller.contains(lastPreviewPointerEl.current)) {
      target = lastPreviewPointerEl.current;
    }

    if (!target) {
      const highlighted = previewScroller.querySelector(".ring-amber-400\\/60") as Element | null;
      if (highlighted) target = highlighted;
    }

    if (!target) return;

    const scrollerRect = previewScroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const topChromeHeight = mobileTopChromeRef.current?.getBoundingClientRect().height ?? 0;
    const hintHeight = mobileHintRef.current?.getBoundingClientRect().height ?? 0;
    const dynamicOffset = Math.max(MOBILE_SELECTED_TOP_OFFSET, Math.round(topChromeHeight + hintHeight + 20));
    const nextTop =
      previewScroller.scrollTop + (targetRect.top - scrollerRect.top) - dynamicOffset;
    previewScroller.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
  }, [previewScroller, MOBILE_SELECTED_TOP_OFFSET]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startW: settingsW };
    const onMove = (mv: MouseEvent) => {
      if (!dragRef.current) return;
      setSettingsW(Math.min(480, Math.max(220, dragRef.current.startW + dragRef.current.startX - mv.clientX)));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ── Form state ────────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...session.profile,
    weddingDate:         session.profile?.weddingDate ? new Date(session.profile.weddingDate).toISOString().split("T")[0] : "",
    partner1Name:        session.profile?.partner1Name || "",
    partner2Name:        session.profile?.partner2Name || "",
    welcomeText:         session.profile?.welcomeText ?? "",
    celebrationText:     session.profile?.celebrationText ?? "",
    inviteSlug:          session.profile?.inviteSlug || "",
    showWelcomeText:     session.profile?.showWelcomeText ?? true,
    showCelebrationText: session.profile?.showCelebrationText ?? true,
    showTimeline:        session.profile?.showTimeline ?? true,
    showCountdown:       session.profile?.showCountdown ?? true,
    showRsvpButton:      session.profile?.showRsvpButton ?? true,
    rsvpButtonText:      session.profile?.rsvpButtonText || "Confirmă Prezența",
    godparents:          session.profile?.godparents || JSON.stringify([{ godfather: "Prenume Naș", godmother: "Prenume Nașă" }]),
    parents:             session.profile?.parents || JSON.stringify({ p1_father: "Tatăl Miresei", p1_mother: "Mama Miresei", p2_father: "Tatăl Mirelui", p2_mother: "Mama Mirelui", others: [] }),
    customSections:      session.profile?.customSections || "[]",
  } as UserProfile));

  const [introPreview, setIntroPreview] = useState(false);
  useEffect(() => { setIntroPreview(false); }, [selectedTemplate]);

  const [selectedBlock, setSelectedBlock] = useState<{ block: InvitationBlock; idx: number; textKey?: string; textLabel?: string } | null>(null);
  const [resetKey,      setResetKey]      = useState(0); // increment to force template remount
  const [localBlocks,   setLocalBlocks]   = useState<InvitationBlock[]>([]);
  const [timeline,      setTimeline]      = useState<TimelineItem[]>(() => safeJSON(session.profile?.timeline, []));
  const seededTimelineRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isMobile || !mobilePropsOpen || !selectedBlock) return;
    const id1 = setTimeout(() => scrollSelectedPreviewIntoView(), 120);
    const id2 = setTimeout(() => scrollSelectedPreviewIntoView(), 420);
    return () => {
      clearTimeout(id1);
      clearTimeout(id2);
    };
  }, [isMobile, mobilePropsOpen, selectedBlock, scrollSelectedPreviewIntoView]);
  useEffect(() => {
    if (!isMobile || activeTab !== "preview") return;
    const el = mobilePreviewInnerRef.current;
    if (!el) return;

    const recalc = () => {
      const rawHeight = el.offsetHeight || el.scrollHeight || 0;
      const visualHeight = Math.max(0, Math.round(rawHeight * MOBILE_PREVIEW_SCALE));
      setMobilePreviewVisualHeight(visualHeight);
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile, activeTab, resetKey, selectedTemplate, MOBILE_PREVIEW_SCALE]);

  // ── Door images preview — fetch din admin config ─────────────────────────────
  const [doorImages, setDoorImages] = useState<Record<string, { desktop?: string; mobile?: string }>>({});
  useEffect(() => {
    if (!(selectedTemplate?.startsWith('castle-magic') || selectedTemplate === 'lord-effects' || selectedTemplate === 'jurassic-park' || selectedTemplate === 'zootropolis' || selectedTemplate === 'little-mermaid')) return;
    fetch(`${API_URL}/config/template-defaults/${selectedTemplate}`, {
      headers: { Authorization: `Bearer ${session?.token || ''}` },
    })
      .then(r => r.ok ? r.json() : {})
      .then((d: any) => setDoorImages(d.themeImages || {}))
      .catch(() => {});
  }, [selectedTemplate]);

  // ── Intro variants — fetch pentru regal ──────────────────────────────────────
  const [introVariants, setIntroVariants] = useState<Record<string, { label: string; desktop?: string; mobile?: string }>>({});
  const [defaultIntroVariant, setDefaultIntroVariant] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (selectedTemplate !== 'regal') return;
    fetch(`${API_URL}/config/template-defaults/regal`, {
      headers: { Authorization: `Bearer ${session?.token || ''}` },
    })
      .then(r => r.ok ? r.json() : {})
      .then((d: any) => {
        setIntroVariants(d.introVariants || {});
        setDefaultIntroVariant(d.defaultIntroVariant || undefined);
      })
      .catch(() => {});
  }, [selectedTemplate]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting,        setResetting]        = useState(false);

  // ── Debounced save ────────────────────────────────────────────────────────────
  const saveTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestProfile  = useRef<UserProfile>(profile);

  const scheduleSave = useCallback((next: UserProfile) => {
    latestProfile.current = next;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { onUpdateProfile(latestProfile.current); }, 600);
  }, [onUpdateProfile]);

  useEffect(() => () => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); onUpdateProfile(latestProfile.current); }
  }, []);

  const patchProfile = useCallback((patch: Partial<UserProfile>) => {
    if (onCheckActive && !onCheckActive()) return;
    if (patch.timeline !== undefined) {
      const nextTimeline = safeJSON(
        typeof patch.timeline === "string" ? patch.timeline : JSON.stringify(patch.timeline),
        [],
      );
      setTimeline(nextTimeline);
    }
    setProfile(prev => { const next = { ...prev, ...patch }; scheduleSave(next); return next; });
  }, [scheduleSave, onCheckActive]);

  const hc = (field: keyof UserProfile, value: any) => patchProfile({ [field]: value });

  const saveAll = () => {
    if (onCheckActive && !onCheckActive()) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    onUpdateProfile({ ...latestProfile.current, timeline: JSON.stringify(timeline) });
    toast({ title: "Salvat!", description: "Modificările au fost înregistrate." });
  };

  const resetToDefault = () => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    setResetting(true);
    const tpl = selectedTemplate || "";
    const tplDefaults = getTemplateDefaultBlocks(tpl);
    const hasDefaults = Array.isArray(tplDefaults) && tplDefaults.length > 0;
    const ts = Date.now();
    const freshBlocks = hasDefaults
      ? tplDefaults!.map((b, i) => ({ ...b, id: `def-${ts}-${i}` }))
      : [];

    const tplProfileDefaults = getTemplateDefaultProfile(tpl);
    const baseReset: Record<string, any> = tplProfileDefaults
      ? { ...tplProfileDefaults }
      : {
          showWelcomeText: true,
          showCelebrationText: true,
          showTimeline: true,
          showCountdown: true,
          showRsvpButton: true,
          welcomeText: "",
          celebrationText: "",
          partner1Name: "",
          partner2Name: "",
          weddingDate: "",
          rsvpButtonText: "",
          churchLabel: "",
          venueLabel: "",
          civilLabel: "",
          colorTheme: "default",
        };

    baseReset.colorTheme = "default";
    baseReset.weddingDate = profile.weddingDate ?? baseReset.weddingDate;
    baseReset.heroTextStyles = undefined;
    baseReset.introTextStyles = undefined;
    baseReset.timelineTextStyles = undefined;

    if (tpl === 'regal') {
      baseReset.introVariant = defaultIntroVariant;
    }

    if (hasDefaults) {
      setLocalBlocks(freshBlocks);
      baseReset.customSections = JSON.stringify(freshBlocks);
    } else {
      setLocalBlocks([]);
      baseReset.customSections = JSON.stringify([]);
    }

    const nextTimeline: TimelineItem[] = [];
    setTimeline(nextTimeline);
    baseReset.timeline = JSON.stringify(nextTimeline);

    setSelectedBlock(null);
    setResetKey(k => k + 1);
    patchProfile(baseReset);
    toast({ title: "Reset efectuat!", description: "Template-ul a fost resetat complet la valorile implicite." });
    setResetting(false);
    setShowResetConfirm(false);
  };

  const pushTimeline = (nt: TimelineItem[]) => {
    setTimeline(nt);
    patchProfile({ timeline: JSON.stringify(nt) });
  };

  useEffect(() => {
    if (!isActive) return;
    const tpl = selectedTemplate || '';
    if (!tpl) return;
    if (INLINE_TIMELINE_TEMPLATES.has(tpl)) {
      seededTimelineRef.current = tpl;
      return;
    }
    if (seededTimelineRef.current === tpl) return;
    const defaults = DEFAULT_TIMELINE_BY_TEMPLATE[tpl];
    if (!defaults || defaults.length === 0) {
      seededTimelineRef.current = tpl;
      return;
    }
    const storedTimeline = typeof profile.timeline === 'string' ? profile.timeline : '';
    const hasStoredTimeline = !!storedTimeline && storedTimeline !== '[]' && storedTimeline !== 'null';
    if (hasStoredTimeline) {
      seededTimelineRef.current = tpl;
      return;
    }
    if (timeline.length === 0) {
      seededTimelineRef.current = tpl;
      const seeded = defaults.map((t, i) => ({ ...t, id: `${tpl}-${Date.now()}-${i}` }));
      pushTimeline(seeded);
      if (profile.showTimeline !== true) hc('showTimeline', true);
    }
  }, [isActive, selectedTemplate, timeline.length, profile.timeline, profile.showTimeline]);

  const guard = (fn: () => void) => { if (onCheckActive && !onCheckActive()) return; fn(); };

  const previewData = useMemo(() => {
    // Pentru castle-magic: dacă profile-ul nu are customSections, injectăm defaulturile
    const isCastle = (selectedTemplate?.startsWith('castle-magic') || selectedTemplate === 'lord-effects') ?? false;
    const hasBlocks = profile.customSections && profile.customSections !== '[]' && profile.customSections !== 'null';
    
    const baseProfile = { ...profile, timeline: JSON.stringify(timeline) };
    
    if (isCastle && !hasBlocks) {
      const tplDefaults = getTemplateDefaultBlocks(selectedTemplate || "");
      const blockDefaults = tplDefaults && tplDefaults.length > 0 ? tplDefaults : CASTLE_DEFAULT_BLOCKS;
      // Injectăm datele default pentru previzualizare
      return {
        guest:   { name: "Invitat Drag", status: "pending", type: "adult" },
        project: { selectedTemplate },
        profile: {
          ...CASTLE_DEFAULTS,
          ...baseProfile,
          weddingDate: baseProfile.weddingDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customSections: JSON.stringify(blockDefaults),
        },
      };
    }

    return {
      guest:   { name: "Nume Invitat", status: "pending", type: "adult" },
      project: { selectedTemplate },
      profile: baseProfile,
    };
  }, [profile, timeline, selectedTemplate]);

  // ── Block selection — photo only ──────────────────────────────────────────────
  const handleBlockSelect = (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => {
    if (isMobile && Date.now() < suppressMobileSelectUntilRef.current) {
      return;
    }
    if (isMobile && suppressNextMobileSelectRef.current) {
      suppressNextMobileSelectRef.current = false;
      return;
    }
    const pointerEl = lastPreviewPointerEl.current;
    const tappedToolbar =
      !!pointerEl?.closest('[class*="group-hover/block:"]') ||
      !!pointerEl?.closest('[data-block-toolbar]');
    const tappedInteractiveControl = !!pointerEl?.closest(
      'button,[role="button"],a,input,select,textarea,label'
    );
    if (isMobile && (tappedToolbar || tappedInteractiveControl)) {
      return;
    }
    if (!block) {
      setSelectedBlock(null);
      if (isMobile) setMobilePropsOpen(false);
      return;
    }
    setSelectedBlock({ block: { ...block }, idx, textKey, textLabel });
    if (isMobile) {
      setActiveTab('preview');
      setMobilePropsOpen(true);
      setTimeout(() => scrollSelectedPreviewIntoView(), 220);
    }
  };

  const handleBlockPropertyUpdate = (patch: Partial<InvitationBlock>) => {
    if (!selectedBlock) return;
    const updated = { ...selectedBlock.block, ...patch };
    setSelectedBlock(prev => prev ? { ...prev, block: updated } : null);
    if (updated.id === "__hero__") {
      patchProfile({ heroTextStyles: Object.keys(updated.textStyles || {}).length === 0 ? null : updated.textStyles });
      return;
    }
    if (updated.id === "__intro__") {
      patchProfile({ introTextStyles: Object.keys(updated.textStyles || {}).length === 0 ? null : updated.textStyles });
      return;
    }
    if (updated.id === "__timeline__") {
      patchProfile({ timelineTextStyles: Object.keys(updated.textStyles || {}).length === 0 ? null : updated.textStyles });
      return;
    }
    const currentBlocks: InvitationBlock[] = localBlocks.length
      ? [...localBlocks]
      : safeJSON(profile.customSections, []);
    const blockIdx = currentBlocks.findIndex(b => b.id === updated.id);
    if (blockIdx !== -1) {
      currentBlocks[blockIdx] = updated;
      setLocalBlocks(currentBlocks);
      patchProfile({ customSections: JSON.stringify(currentBlocks) });
    }
  };

  const hasIntro = !!selectedTemplate && INTRO_TEMPLATES.has(selectedTemplate);

  // ── Template panel JSX — memoized so heavy template doesn't re-render on every state change
  const EditableTpl = getEditableTemplate(selectedTemplate);
  const templatePanel = useMemo(() => (
    <TextSelectionCtx.Provider value={{ selectedTextKey: selectedBlock?.textKey }}>
      <EditableTpl
        key={resetKey}
        data={previewData as any}
        onOpenRSVP={() => {}}
        editMode={isActive}
        introPreview={introPreview && hasIntro}
        scrollContainer={previewScroller}
        onProfileUpdate={patch => {
          if (onCheckActive && !onCheckActive()) return;
          patchProfile(patch as Partial<UserProfile>);
        }}
        onBlocksUpdate={nb => {
          if (onCheckActive && !onCheckActive()) return;
          try {
            const uid = session?.userId;
            if (uid) localStorage.setItem(`weddingPro_hasCustomSections_${uid}`, "1");
            else localStorage.setItem("weddingPro_hasCustomSections", "1");
          } catch {}
          setLocalBlocks([...nb]);
          patchProfile({ customSections: JSON.stringify(nb) });
          if (selectedBlock) {
            const refreshed = nb.find(b => b.id === selectedBlock.block.id);
            if (refreshed) setSelectedBlock(prev => prev ? { ...prev, block: { ...refreshed }, idx: nb.indexOf(refreshed) } : null);
          }
        }}
        onBlockSelect={(blk, idx, textKey, textLabel) => {
          handleBlockSelect(blk, idx, textKey, textLabel);
        }}
        selectedBlockId={selectedBlock?.block.id}
      />
    </TextSelectionCtx.Provider>
  ), [previewData, isActive, onCheckActive, selectedBlock, isMobile, resetKey, introPreview, hasIntro, previewScroller]);

  const inlineBlockPanel = (
    <BlockPropertiesPanel
      block={selectedBlock?.block ?? null}
      onUpdate={handleBlockPropertyUpdate}
      onClose={() => setSelectedBlock(null)}
      forceDark={isDark}
      selectedTextKey={selectedBlock?.textKey}
      selectedTextLabel={selectedBlock?.textLabel}
      inline
    />
  );

  const settingsContentProps = {
    profile,
    timeline,
    isActive,
    hc,
    guard,
    pushTimeline,
    selectedTemplate,
    doorImages,
    introVariants,
    defaultIntroVariant,
    inlineBlockPanel: !isMobile ? inlineBlockPanel : undefined,
    introPreview,
    onIntroPreviewChange: setIntroPreview,
    hasIntro,
    selectedTextKey: selectedBlock?.textKey,
    selectedBlockId: selectedBlock?.block?.id,
    selectedBlockType: selectedBlock?.block?.type,
  };

  // ── MOBILE ────────────────────────────────────────────────────────────────────
  if (isMobile) {
    const showProps = selectedBlock != null;
    const hideMobileTopChrome = activeTab === "preview" && showProps && mobilePropsOpen;

    return (
      <div className="relative flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950/50">
        {/* Top actions + tabs */}
        <div
          ref={mobileTopChromeRef}
          className={cn(
            "shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            hideMobileTopChrome
              ? "max-h-0 opacity-0 -translate-y-6 pointer-events-none border-transparent"
              : "max-h-44 opacity-100 translate-y-0",
          )}
        >
          <div className="px-3 pt-3 pb-2 flex items-center justify-between gap-2">
            <EventTypeBadge et={et} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={!isActive}
                className="h-7 px-2 rounded flex items-center gap-1 text-[10px] font-bold border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-300 disabled:opacity-30"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <Button
                size="sm"
                className="h-7 bg-black text-white hover:bg-zinc-800 gap-1 text-[10px]"
                onClick={saveAll}
                disabled={!isActive}
              >
                <Save className="w-3 h-3" /> Salvează
              </Button>
            </div>
          </div>

          <div className="px-2 pb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={cn(
                "flex-1 h-8 rounded-md text-[11px] font-bold border transition-colors",
                activeTab === 'preview'
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                  : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
              )}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={cn(
                "flex-1 h-8 rounded-md text-[11px] font-bold border transition-colors",
                activeTab === 'settings'
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                  : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
              )}
            >
              Setări
            </button>
            {showProps && (
              <button
                type="button"
                onClick={() => setMobilePropsOpen(true)}
                className={cn(
                  "h-8 px-3 rounded-md text-[11px] font-bold border transition-colors whitespace-nowrap",
                  mobilePropsOpen
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                    : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
                )}
              >
                Proprietăți
              </button>
            )}
          </div>
        </div>

        {/* Active panel */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'preview' && (
            <div
              ref={setPreviewScrollerRef}
              onPointerDownCapture={(e) => {
                if (e.target instanceof Element) lastPreviewPointerEl.current = e.target;
                const hitInteractive = shouldSuppressMobileSelectFromEvent(e.target, e.nativeEvent);
                suppressNextMobileSelectRef.current = hitInteractive;
                if (hitInteractive) suppressMobileSelectUntilRef.current = Date.now() + 450;
              }}
              onTouchStartCapture={(e) => {
                if (e.target instanceof Element) lastPreviewPointerEl.current = e.target;
                const hitInteractive = shouldSuppressMobileSelectFromEvent(e.target, e.nativeEvent);
                suppressNextMobileSelectRef.current = hitInteractive;
                if (hitInteractive) suppressMobileSelectUntilRef.current = Date.now() + 450;
              }}
              onClickCapture={(e) => {
                if (e.target instanceof Element) lastPreviewPointerEl.current = e.target;
                const hitInteractive = shouldSuppressMobileSelectFromEvent(e.target, e.nativeEvent);
                suppressNextMobileSelectRef.current = hitInteractive;
                if (hitInteractive) suppressMobileSelectUntilRef.current = Date.now() + 450;
              }}
              className="mobile-edit-preview h-full overflow-y-auto overflow-x-hidden bg-stone-100"
            >
              <style>{`
                @media (hover: none), (pointer: coarse) {
                  .mobile-edit-preview [class*="group-hover/block:pointer-events-auto"] {
                    opacity: 1 !important;
                    pointer-events: auto !important;
                  }
                }
              `}</style>
              <div ref={mobileHintRef} className={cn(
                "sticky top-0 z-10 px-3 py-2 text-[10px] text-zinc-500 bg-white/85 dark:bg-zinc-900/85 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                hideMobileTopChrome
                  ? "max-h-0 opacity-0 -translate-y-4 pointer-events-none py-0 border-transparent"
                  : "max-h-10 opacity-100 translate-y-0",
              )}>
                Atinge un text sau o poză pentru a edita rapid din „Proprietăți”.
              </div>
              <div
                className="relative"
                style={{
                  height: mobilePreviewVisualHeight ? `${mobilePreviewVisualHeight}px` : undefined,
                  overflow: "hidden",
                }}
              >
                <div
                  ref={mobilePreviewInnerRef}
                  style={{
                    transform: `scale(${MOBILE_PREVIEW_SCALE})`,
                    transformOrigin: "top center",
                    width: "162%",
                    marginLeft: "-31%",
                  }}
                >
                  {templatePanel}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full overflow-y-auto bg-white dark:bg-zinc-900">
              <SettingsContent templateMeta={templateMeta} {...settingsContentProps} />
            </div>
          )}

        </div>

        {/* iOS-like bottom sheet for selected element properties */}
        {showProps && (
          <>
            <button
              type="button"
              aria-label="Închide panoul proprietăți"
              onClick={() => setMobilePropsOpen(false)}
              className={cn(
                "absolute inset-0 z-20 bg-black/35 transition-opacity",
                mobilePropsOpen ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
            />

            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-30 rounded-t-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col transition-transform duration-300",
                "h-[64dvh]",
                mobilePropsOpen ? "translate-y-0" : "translate-y-full",
              )}
            >
              <div className="shrink-0 border-b border-zinc-100 dark:border-zinc-800 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-6 w-14" />
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 mb-1" />
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      Proprietăți {selectedBlock?.textLabel ? `• ${selectedBlock.textLabel}` : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobilePropsOpen(false)}
                    className="h-6 px-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-600 dark:text-zinc-300"
                  >
                    Închide
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <BlockPropertiesPanel
                  block={selectedBlock!.block}
                  onUpdate={handleBlockPropertyUpdate}
                  onClose={() => setMobilePropsOpen(false)}
                  forceDark={isDark}
                  selectedTextKey={selectedBlock?.textKey}
                  selectedTextLabel={selectedBlock?.textLabel}
                />
              </div>
            </div>
          </>
        )}

        {showResetConfirm && (
          <ResetModal resetting={resetting} onCancel={() => setShowResetConfirm(false)} onConfirm={resetToDefault} />
        )}
      </div>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950/50">

      {/* Invitație */}
      <div ref={setPreviewScrollerRef} className="flex-1 overflow-y-auto bg-stone-100 min-w-0">
        <div className="relative overflow-hidden" style={{ transform: 'translateZ(0)' }}>
          {templatePanel}
        </div>
      </div>

      {/* ── SETĂRI — spine + panel ── */}
      <div className="flex shrink-0 h-full">

        {/* Spine cotor */}
        <div
          onClick={() => setSettingsOpen(o => !o)}
          className={cn(
            "w-8 h-full flex flex-col items-center justify-between py-4 cursor-pointer select-none shrink-0 border-l border-r",
            "bg-white border-zinc-200 hover:bg-zinc-50",
            "dark:bg-zinc-950 dark:border-zinc-800 dark:hover:bg-black",
          )}
        >
          <ChevronDown className={cn(
            "w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400",
            settingsOpen ? "-rotate-90" : "rotate-90"
          )} />
          <span
            className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-600 dark:text-zinc-300"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Setări
          </span>
          <div className="w-1 h-1 rounded-full bg-amber-400" />
        </div>

        {/* Panel Setări */}
        <div
          style={{ width: settingsOpen ? settingsW : 0 }}
          className="flex flex-col h-full bg-white dark:bg-black overflow-hidden min-h-0 text-zinc-900 dark:text-zinc-100"
        >
          {/* Drag handle */}
          <div className="absolute z-10 h-full" style={{ left: 0 }}>
            <div
              onMouseDown={startDrag}
              className="w-1.5 h-full cursor-col-resize hover:bg-amber-400/60 active:bg-amber-500/80 transition-colors"
              style={{ background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)' }}
            />
          </div>

          {/* Header */}
          <div className="shrink-0 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-black tracking-tight whitespace-nowrap text-zinc-900 dark:text-zinc-100">Setări</span>
              <EventTypeBadge et={et} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => setShowResetConfirm(true)} disabled={!isActive}
                className="h-7 px-2 rounded flex items-center gap-1 text-[10px] font-bold border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-300 hover:text-red-500 hover:border-red-200 dark:hover:border-red-400/40 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <Button size="sm" className="h-7 bg-black text-white hover:bg-zinc-800 gap-1 text-[10px]"
                onClick={saveAll} disabled={!isActive}>
                <Save className="w-3 h-3" /> Salvează
              </Button>
            </div>
          </div>

          {/* Scrollable body — flex-1 + min-h-0 is the correct flexbox scroll pattern */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-black">
            <SettingsContent templateMeta={templateMeta} {...settingsContentProps} />
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <ResetModal resetting={resetting} onCancel={() => setShowResetConfirm(false)} onConfirm={resetToDefault} />
      )}
    </div>
  );
};

export default React.memo(SettingsView);
