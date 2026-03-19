import React, { createContext, useContext } from "react";

export interface BlockStyle {
  fontFamily?:    string;
  fontSize?:      number;   // px
  letterSpacing?: number;   // value * 0.01em  (e.g. 10 → 0.10em)
  lineHeight?:    number;   // value * 0.01     (e.g. 160 → 1.60)
  textColor?:     string;
  textAlign?:     'left' | 'center' | 'right';
}

export const BlockStyleCtx = createContext<BlockStyle>({});

/** Merges the block-level overrides on top of a base style object.
 *  Context values are ONLY applied when explicitly set (not undefined/null). */
export function useBlockStyle(base: React.CSSProperties = {}): React.CSSProperties {
  const ctx = useContext(BlockStyleCtx);
  const overrides: React.CSSProperties = {};

  if (ctx.fontFamily    != null) overrides.fontFamily    = ctx.fontFamily;
  if (ctx.fontSize      != null) overrides.fontSize      = `${ctx.fontSize}px`;
  if (ctx.letterSpacing != null) overrides.letterSpacing = `${ctx.letterSpacing * 0.01}em`;
  if (ctx.lineHeight    != null) overrides.lineHeight    = `${ctx.lineHeight   * 0.01}`;
  if (ctx.textColor     != null) overrides.color         = ctx.textColor;
  if (ctx.textAlign     != null) overrides.textAlign     = ctx.textAlign;

  // Context overrides win over hardcoded base styles
  return { ...base, ...overrides };
}
