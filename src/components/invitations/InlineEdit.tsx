import React, { useRef, useEffect, useState, useContext } from "react";
import { cn } from "../../lib/utils";
import { useBlockStyle, BlockStyleCtx, TextSelectionCtx } from "../BlockStyleContext";

// ─── Editable text (contentEditable) ─────────────────────────────────────────
interface InlineEditProps {
  value: string;
  onChange: (val: string) => void;
  editMode: boolean;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  tag?: keyof JSX.IntrinsicElements;
  multiline?: boolean;
  textKey?: string;
  textLabel?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value, onChange, editMode, className, style, placeholder = "Click pentru a edita",
  tag: Tag = "span", multiline = false, textKey, textLabel,
}) => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [computedSuppressBg, setComputedSuppressBg] = useState(false);
  const ctx = useContext(BlockStyleCtx);
  const selection = useContext(TextSelectionCtx);
  const resolvedKey = textKey ?? ctx.getAutoKey?.();
  // Merge block-level style overrides — context wins over hardcoded component styles
  const mergedStyle = useBlockStyle(style, resolvedKey);
  const hasGradientText = (mergedStyle as any)?.WebkitTextFillColor === "transparent";
  const hasBg = !!(mergedStyle as any)?.background || !!(mergedStyle as any)?.backgroundImage;
  const hasTextClip =
    ((mergedStyle as any)?.backgroundClip || (mergedStyle as any)?.WebkitBackgroundClip || "").toString().includes("text");
  const wantsTextGradient = hasGradientText || hasTextClip;
  const suppressBg = wantsTextGradient || hasBg || computedSuppressBg;
  const patchedStyle = wantsTextGradient
    ? {
        ...mergedStyle,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }
    : mergedStyle;
  const isSelected = !!resolvedKey && selection?.selectedTextKey === resolvedKey;

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = value || "";
    }
  }, [value]);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    const el = ref.current;
    const cs = window.getComputedStyle(el);
    const bgImg = cs.backgroundImage;
    const clip = (cs as any).webkitBackgroundClip || (cs as any).WebkitBackgroundClip || cs.backgroundClip;
    const fill = (cs as any).webkitTextFillColor || (cs as any).WebkitTextFillColor;
    const hasComputedBg = !!bgImg && bgImg !== "none";
    const hasComputedClip = typeof clip === "string" && clip.includes("text");
    const fillTransparent = fill === "transparent" || fill === "rgba(0, 0, 0, 0)";
    setComputedSuppressBg(hasComputedBg || hasComputedClip || fillTransparent);
    if (hasComputedBg && (hasComputedClip || fillTransparent)) {
      el.style.webkitBackgroundClip = "text";
      (el.style as any).backgroundClip = "text";
      (el.style as any).webkitTextFillColor = "transparent";
      el.style.color = "transparent";
    }
  }, [mergedStyle, value, editMode]);

  const T = Tag as any;

  if (!editMode) {
    return <T className={className} style={mergedStyle}>{value}</T>;
  }

  return (
    <T
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      style={patchedStyle}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
      }}
      onFocus={() => {
        setActive(true);
        if (resolvedKey) ctx.onTextSelect?.(resolvedKey, textLabel);
        if (ref.current && !ref.current.textContent) ref.current.textContent = "";
      }}
      onBlur={e => { setActive(false); onChange(e.currentTarget.textContent?.trim() || ""); }}
      onKeyDown={e => { if (!multiline && e.key === "Enter") { e.preventDefault(); (e.target as HTMLElement).blur(); } }}
      className={cn(
        className,
        "outline-none transition-all duration-100 cursor-text",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-stone-300 empty:before:italic empty:before:pointer-events-none",
        active
          ? suppressBg
            ? "ring-2 ring-stone-400/30 ring-offset-2 rounded"
            : "ring-2 ring-stone-400/30 ring-offset-2 rounded bg-white/80"
          : suppressBg
            ? "hover:ring-1 hover:ring-stone-300/50 hover:ring-offset-1 hover:rounded"
            : "hover:ring-1 hover:ring-stone-300/50 hover:ring-offset-1 hover:rounded hover:bg-stone-50/60",
        isSelected && !active
          ? suppressBg
            ? "ring-2 ring-amber-400/60 ring-offset-2 rounded"
            : "ring-2 ring-amber-400/60 ring-offset-2 rounded bg-amber-50/70"
          : ""
      )}
    />
  );
};

// ─── Transparent time input ───────────────────────────────────────────────────
export const InlineTime: React.FC<{
  value: string; onChange: (v: string) => void; editMode: boolean;
  className?: string; style?: React.CSSProperties;
  inputRef?: React.Ref<HTMLInputElement>;
  textKey?: string;
  textLabel?: string;
}> = ({ value, onChange, editMode, className, style, inputRef, textKey, textLabel }) => {
  const ctx = useContext(BlockStyleCtx);
  const selection = useContext(TextSelectionCtx);
  const resolvedKey = textKey ?? ctx.getAutoKey?.();
  const mergedStyle = useBlockStyle(style, resolvedKey);
  const isSelected = !!resolvedKey && selection?.selectedTextKey === resolvedKey;

  if (!editMode) return <span className={className} style={mergedStyle}>{value}</span>;
  return (
    <input
      ref={inputRef}
      type="time" value={value} onChange={e => onChange(e.target.value)}
      style={mergedStyle}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (resolvedKey) ctx.onTextSelect?.(resolvedKey, textLabel);
      }}
      onFocus={() => {
        if (resolvedKey) ctx.onTextSelect?.(resolvedKey, textLabel);
      }}
      className={cn(
        className,
        "bg-transparent border-none outline-none cursor-pointer w-[6.5rem] text-center",
        "hover:bg-white/70 hover:ring-1 hover:ring-stone-300/60 rounded px-1 transition-all",
        isSelected ? "ring-2 ring-amber-400/60 ring-offset-2 rounded bg-amber-50/60" : ""
      )}
    />
  );
};

// ─── Waze link (icon → input on edit) ────────────────────────────────────────
export const InlineWaze: React.FC<{
  value: string; onChange: (v: string) => void; editMode: boolean;
}> = ({ value, onChange, editMode }) => {
  const [open, setOpen] = useState(false);

  if (!editMode) {
    if (!value) return null;
    return (
      <a href={value} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-stone-800 transition-colors">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm-1 4v7l6 3.5-1 1.7-7-4V6h2z"/></svg>
        Waze
      </a>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {open ? (
        <input autoFocus value={value} onChange={e => onChange(e.target.value)}
          onBlur={() => setOpen(false)}
          placeholder="https://waze.com/ul?..."
          className="text-[10px] font-mono text-stone-500 bg-white border border-stone-200 rounded px-2 py-1 outline-none w-52 focus:ring-1 focus:ring-stone-400" />
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded px-1.5 py-0.5",
            value ? "text-stone-500 hover:bg-stone-100" : "text-stone-300 border border-dashed border-stone-200 hover:border-stone-300 hover:text-stone-400"
          )}>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm-1 4v7l6 3.5-1 1.7-7-4V6h2z"/></svg>
          {value ? "Waze · click pentru a edita link" : "+ Waze · click pentru a edita link"}
        </button>
      )}
    </div>
  );
};
