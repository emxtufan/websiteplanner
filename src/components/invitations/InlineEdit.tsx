import React, { useRef, useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { useBlockStyle } from "../BlockStyleContext";

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
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value, onChange, editMode, className, style, placeholder = "Click pentru a edita",
  tag: Tag = "span", multiline = false,
}) => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  // Merge block-level style overrides — context wins over hardcoded component styles
  const mergedStyle = useBlockStyle(style);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = value || "";
    }
  }, [value]);

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
      style={mergedStyle}
      onFocus={() => { setActive(true); if (ref.current && !ref.current.textContent) ref.current.textContent = ""; }}
      onBlur={e => { setActive(false); onChange(e.currentTarget.textContent?.trim() || ""); }}
      onKeyDown={e => { if (!multiline && e.key === "Enter") { e.preventDefault(); (e.target as HTMLElement).blur(); } }}
      className={cn(
        className,
        "outline-none transition-all duration-100 cursor-text",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-stone-300 empty:before:italic empty:before:pointer-events-none",
        active
          ? "ring-2 ring-stone-400/30 ring-offset-2 rounded bg-white/80"
          : "hover:ring-1 hover:ring-stone-300/50 hover:ring-offset-1 hover:rounded hover:bg-stone-50/60"
      )}
    />
  );
};

// ─── Transparent time input ───────────────────────────────────────────────────
export const InlineTime: React.FC<{
  value: string; onChange: (v: string) => void; editMode: boolean;
  className?: string; style?: React.CSSProperties;
}> = ({ value, onChange, editMode, className, style }) => {
  if (!editMode) return <span className={className} style={style}>{value}</span>;
  return (
    <input
      type="time" value={value} onChange={e => onChange(e.target.value)}
      style={style}
      className={cn(className,
        "bg-transparent border-none outline-none cursor-pointer w-[6.5rem] text-center",
        "hover:bg-white/70 hover:ring-1 hover:ring-stone-300/60 rounded px-1 transition-all"
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
          {value ? "Waze" : "+ Waze"}
        </button>
      )}
    </div>
  );
};