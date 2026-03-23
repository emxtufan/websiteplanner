import React, { createContext, useContext, useCallback, useMemo, useRef } from "react";
import { TextStyle } from "../types";

export interface BlockStyle {
  fontFamily?:    string;
  fontSize?:      number;   // px
  fontWeight?:    number;
  fontStyle?:     'normal' | 'italic';
  letterSpacing?: number;   // value * 0.01em  (e.g. 10 → 0.10em)
  lineHeight?:    number;   // value * 0.01     (e.g. 160 → 1.60)
  textColor?:     string;
  textAlign?:     'left' | 'center' | 'right';
  // Per-text styles and selection
  blockId?:       string;
  textStyles?:    Record<string, TextStyle>;
  onTextSelect?:  (textKey: string, label?: string) => void;
  getAutoKey?:    () => string;
}

export const BlockStyleCtx = createContext<BlockStyle>({});
export const TextSelectionCtx = createContext<{ selectedTextKey?: string }>({});

/** Merges the block-level overrides on top of a base style object.
 *  Context values are ONLY applied when explicitly set (not undefined/null). */
export function useBlockStyle(base: React.CSSProperties = {}, textKey?: string): React.CSSProperties {
  const ctx = useContext(BlockStyleCtx);
  const overrides: React.CSSProperties = {};

  if (ctx.fontFamily    != null) overrides.fontFamily    = ctx.fontFamily;
  if (ctx.fontSize      != null) overrides.fontSize      = `${ctx.fontSize}px`;
  if (ctx.fontWeight    != null) overrides.fontWeight    = ctx.fontWeight;
  if (ctx.fontStyle     != null) overrides.fontStyle     = ctx.fontStyle;
  if (ctx.letterSpacing != null) overrides.letterSpacing = `${ctx.letterSpacing * 0.01}em`;
  if (ctx.lineHeight    != null) overrides.lineHeight    = `${ctx.lineHeight   * 0.01}`;
  if (ctx.textColor     != null) overrides.color         = ctx.textColor;
  if (ctx.textAlign     != null) overrides.textAlign     = ctx.textAlign;

  const text = textKey ? ctx.textStyles?.[textKey] : undefined;
  if (text?.fontFamily    != null) overrides.fontFamily    = text.fontFamily;
  if (text?.fontSize      != null) overrides.fontSize      = `${text.fontSize}px`;
  if (text?.fontWeight    != null) overrides.fontWeight    = text.fontWeight;
  if (text?.fontStyle     != null) overrides.fontStyle     = text.fontStyle;
  if (text?.letterSpacing != null) overrides.letterSpacing = `${text.letterSpacing * 0.01}em`;
  if (text?.lineHeight    != null) overrides.lineHeight    = `${text.lineHeight   * 0.01}`;
  if (text?.color         != null) overrides.color         = text.color;
  if (text?.textAlign     != null) overrides.textAlign     = text.textAlign;

  // Context overrides win over hardcoded base styles
  return { ...base, ...overrides };
}

export const BlockStyleProvider: React.FC<{ value: BlockStyle; children: React.ReactNode }> = ({ value, children }) => {
  const autoIdx = useRef(0);
  autoIdx.current = 0;
  const getAutoKey = useCallback(() => {
    const idx = autoIdx.current++;
    return `${value.blockId || "block"}:${idx}`;
  }, [value.blockId]);
  const ctxValue = useMemo(() => ({ ...value, getAutoKey }), [value, getAutoKey]);
  return <BlockStyleCtx.Provider value={ctxValue}>{children}</BlockStyleCtx.Provider>;
};
