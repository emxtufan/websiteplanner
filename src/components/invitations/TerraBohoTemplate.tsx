import React, { useState, useEffect, useRef, useCallback } from "react";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";

import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Upload,
  Camera,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  MapPin,
  Gift,
  Music,
  Shirt,
  Baby,
  Heart,
} from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { cn } from "../../lib/utils";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { WeddingIcon } from "../TimelineIcons";

// ─── API URL — same origin as the Express server ─────────────────────────────
const API_URL =
  (typeof window !== "undefined" && (window as any).__API_URL__) ||
  (import.meta as any)?.env?.VITE_API_URL ||
  "http://localhost:3005/api";

// ─── Shared helper: delete a file from the server ────────────────────────────
// Called on: replace photo, delete photo, delete block with photo
function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith("/uploads/")) return; // skip base64 or empty
  const _session = JSON.parse(
    localStorage.getItem("weddingPro_session") || "{}",
  );
  const token = _session?.token || "";
  // Fire-and-forget — we don't block UI on server cleanup
  fetch(`${API_URL}/upload`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  }).catch(() => {
    /* silently ignore network errors */
  });
}

export const meta: TemplateMeta = {
  id: "terra-boho",
  name: "Terra Boho",
  category: "wedding",
  description:
    "Bej terracotta & script — fotografii reale, calendar, player muzică, dress code, registry cadouri.",
  colors: ["#f5f0e8", "#8b6355", "#c9a84c"],
  previewClass: "bg-amber-100 border-amber-700",
  elementsClass: "bg-amber-700",
};

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BROWN = "#8b6355";
const BROWN_D = "#6a4a3c";
const BROWN_L = "#b08875";
const BROWN_XL = "#e8d8cc";
const CREAM = "#f5f0e8";
const IVORY = "#fdfaf7";
const TEXT = "#2a2118";
const MUTED = "#9a8a7a";
const GOLD = "#c9a84c";
const SERIF = "'Cormorant Garamond','Playfair Display',Georgia,serif";
const SCRIPT = "'Dancing Script','Pacifico',cursive,serif";
const SANS = "'DM Sans','Helvetica Neue',system-ui,sans-serif";

// ─── Wildflower sprigs SVG ────────────────────────────────────────────────────
const Wildflowers: React.FC<{
  flip?: boolean;
  scale?: number;
  style?: React.CSSProperties;
}> = ({ flip, scale = 1, style }) => (
  <svg
    viewBox="0 0 280 120"
    fill="none"
    style={{
      width: 280 * scale,
      height: 120 * scale,
      pointerEvents: "none",
      transform: flip ? "scaleX(-1)" : undefined,
      ...style,
    }}
  >
    {/* Stems */}
    <path
      d="M30 120 C32 90 40 60 55 40 C65 25 78 12 95 5"
      stroke="#8aaa78"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
      opacity="0.6"
    />
    <path
      d="M60 120 C62 95 68 70 78 52 C88 35 102 20 120 12"
      stroke="#8aaa78"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path
      d="M20 120 C18 92 25 65 40 45"
      stroke="#8aaa78"
      strokeWidth="0.9"
      fill="none"
      strokeLinecap="round"
      opacity="0.45"
    />
    {/* Side branches */}
    <path
      d="M55 40 L45 28 M55 40 L68 32"
      stroke="#8aaa78"
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path
      d="M78 52 L68 42 M78 52 L90 44"
      stroke="#8aaa78"
      strokeWidth="0.7"
      fill="none"
      strokeLinecap="round"
      opacity="0.45"
    />
    {/* Leaves */}
    {[
      [50, 65, -25],
      [70, 80, 20],
      [85, 62, -18],
      [100, 45, 12],
      [40, 88, -30],
    ].map(([lx, ly, rot], i) => (
      <ellipse
        key={i}
        cx={lx}
        cy={ly}
        rx="9"
        ry="5"
        fill="#a8c490"
        opacity="0.5"
        transform={`rotate(${rot} ${lx} ${ly})`}
      />
    ))}
    {/* White flowers */}
    {[
      [95, 5],
      [55, 40],
      [78, 52],
      [120, 12],
      [40, 45],
    ].map(([fx, fy], wi) => (
      <g key={wi}>
        {[0, 72, 144, 216, 288].map((a, i) => {
          const rad = (a * Math.PI) / 180;
          return (
            <ellipse
              key={i}
              cx={fx + Math.cos(rad) * 7}
              cy={fy + Math.sin(rad) * 7}
              rx="4"
              ry="6.5"
              fill="white"
              opacity="0.85"
              transform={`rotate(${a},${fx + Math.cos(rad) * 7},${fy + Math.sin(rad) * 7})`}
            />
          );
        })}
        <circle cx={fx} cy={fy} r="4" fill="#fde68a" opacity="0.9" />
        <circle cx={fx} cy={fy} r="2" fill="white" opacity="0.5" />
      </g>
    ))}
    {/* Tiny buds */}
    {[
      [130, 18],
      [108, 32],
      [155, 10],
    ].map(([bx, by], i) => (
      <g key={i}>
        <circle cx={bx} cy={by} r="4.5" fill="white" opacity="0.7" />
        <circle cx={bx} cy={by} r="2.5" fill="#fde68a" opacity="0.85" />
      </g>
    ))}
    {/* Gold sparkle dots */}
    {[
      [170, 15, 1.5],
      [200, 30, 1.2],
      [220, 8, 1.8],
      [240, 22, 1.3],
    ].map(([sx, sy, sr], i) => (
      <circle key={i} cx={sx} cy={sy} r={sr} fill={GOLD} opacity="0.6" />
    ))}
  </svg>
);

// ─── Photo upload component ────────────────────────────────────────────────────
// ─── Photo shape definitions ──────────────────────────────────────────────────
// ─── Shape System — Clip + Mask (combinable) ─────────────────────────────────
//
//  clipShape  : single value — controls the OUTLINE of the photo
//  maskEffects: array        — controls FADE/OVERLAY effects (combinable)
//
//  Example: circle + fade-b + fade-t = faded circle on both sides

// ── Clip shapes (mutually exclusive) ─────────────────────────────────────────
type ClipShape =
  | "rect"
  | "rounded"
  | "rounded-lg"
  | "squircle"
  | "circle"
  | "arch"
  | "arch-b"
  | "hexagon"
  | "diamond"
  | "triangle"
  | "star"
  | "heart"
  | "diagonal"
  | "diagonal-r"
  | "wave-b"
  | "wave-t"
  | "wave-both"
  | "blob"
  | "blob2"
  | "blob3"
  | "blob4";

// ── Mask effects (additive) ───────────────────────────────────────────────────
type MaskEffect = "fade-b" | "fade-t" | "fade-l" | "fade-r" | "vignette";

// ── Clip shape → CSS ─────────────────────────────────────────────────────────
function getClipStyle(clip: ClipShape): React.CSSProperties {
  const clips: Record<ClipShape, React.CSSProperties> = {
    rect: { borderRadius: 0 },
    rounded: { borderRadius: 16 },
    "rounded-lg": { borderRadius: 32 },
    squircle: { borderRadius: "30% 30% 30% 30% / 30% 30% 30% 30%" },
    circle: { borderRadius: "50%" },
    arch: { borderRadius: "50% 50% 0 0 / 40% 40% 0 0" },
    "arch-b": { borderRadius: "0 0 50% 50% / 0 0 40% 40%" },
    hexagon: {
      clipPath: "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)",
    },
    diamond: { clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)" },
    triangle: { clipPath: "polygon(50% 0%,100% 100%,0% 100%)" },
    star: {
      clipPath:
        "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
    },
    heart: { clipPath: "url(#clip-heart)" },
    diagonal: { clipPath: "polygon(0 0,100% 0,100% 80%,0 100%)" },
    "diagonal-r": { clipPath: "polygon(0 0,100% 0,100% 100%,0 80%)" },
    "wave-b": { clipPath: "url(#clip-wave-b)" },
    "wave-t": { clipPath: "url(#clip-wave-t)" },
    "wave-both": { clipPath: "url(#clip-wave-both)" },
    blob: { clipPath: "url(#clip-blob)" },
    blob2: { clipPath: "url(#clip-blob2)" },
    blob3: { clipPath: "url(#clip-blob3)" },
    blob4: { clipPath: "url(#clip-blob4)" },
  };
  return clips[clip] || {};
}

// ── Mask effects → CSS mask-image (combinable via multi-layer gradient) ───────
function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers: string[] = effects.map((e) => {
    switch (e) {
      case "fade-b":
        return "linear-gradient(to bottom,  black 40%, transparent 100%)";
      case "fade-t":
        return "linear-gradient(to top,     black 40%, transparent 100%)";
      case "fade-l":
        return "linear-gradient(to left,    black 40%, transparent 100%)";
      case "fade-r":
        return "linear-gradient(to right,   black 40%, transparent 100%)";
      case "vignette":
        return "radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)";
      default:
        return "none";
    }
  });
  // CSS supports multiple mask layers — combine with multiply
  const mask = layers.join(", ");
  return {
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskComposite: effects.length > 1 ? "source-in" : "unset",
    maskComposite: effects.length > 1 ? "intersect" : "unset",
  };
}

// ── Clip shape thumbnails SVG ─────────────────────────────────────────────────
const CLIP_SHAPES: ClipShape[] = [
  "rect",
  "rounded",
  "rounded-lg",
  "squircle",
  "circle",
  "arch",
  "arch-b",
  "hexagon",
  "diamond",
  "triangle",
  "star",
  "heart",
  "diagonal",
  "diagonal-r",
  "wave-b",
  "wave-t",
  "wave-both",
  "blob",
  "blob2",
  "blob3",
  "blob4",
];

const CLIP_LABELS: Record<ClipShape, string> = {
  rect: "Drept",
  rounded: "Rotund",
  "rounded-lg": "Rotund+",
  squircle: "Squircle",
  circle: "Cerc",
  arch: "Arc sus",
  "arch-b": "Arc jos",
  hexagon: "Hexagon",
  diamond: "Romb",
  triangle: "Triunghi",
  star: "Stea",
  heart: "Inimă",
  diagonal: "Diag ↗",
  "diagonal-r": "Diag ↘",
  "wave-b": "Val jos",
  "wave-t": "Val sus",
  "wave-both": "Val dublu",
  blob: "Blob 1",
  blob2: "Blob 2",
  blob3: "Blob 3",
  blob4: "Blob 4",
};

const MASK_EFFECTS: MaskEffect[] = [
  "fade-b",
  "fade-t",
  "fade-l",
  "fade-r",
  "vignette",
];
const MASK_LABELS: Record<MaskEffect, string> = {
  "fade-b": "Fade jos",
  "fade-t": "Fade sus",
  "fade-l": "Fade stânga",
  "fade-r": "Fade dreapta",
  vignette: "Vigneta",
};

function ClipThumb({ shape, active }: { shape: ClipShape; active: boolean }) {
  const fill = active ? BROWN : BROWN_XL;
  const sz = 40;
  // Map shape to SVG preview path
  const previews: Record<ClipShape, React.ReactNode> = {
    rect: <rect x="5" y="7" width="30" height="26" fill={fill} />,
    rounded: <rect x="5" y="7" width="30" height="26" rx="5" fill={fill} />,
    "rounded-lg": (
      <rect x="5" y="7" width="30" height="26" rx="10" fill={fill} />
    ),
    squircle: (
      <path
        d="M20 7 C30 7 35 10 35 20 C35 30 30 33 20 33 C10 33 5 30 5 20 C5 10 10 7 20 7Z"
        fill={fill}
      />
    ),
    circle: <circle cx="20" cy="20" r="13" fill={fill} />,
    arch: <path d="M6 34 L6 20 Q20 5 34 20 L34 34Z" fill={fill} />,
    "arch-b": <path d="M6 6 L6 20 Q20 35 34 20 L34 6Z" fill={fill} />,
    hexagon: <polygon points="20,6 32,13 32,27 20,34 8,27 8,13" fill={fill} />,
    diamond: <polygon points="20,6 34,20 20,34 6,20" fill={fill} />,
    triangle: <polygon points="20,6 35,34 5,34" fill={fill} />,
    star: (
      <polygon
        points="20,6 23,15 33,15 25,21 28,31 20,25 12,31 15,21 7,15 17,15"
        fill={fill}
      />
    ),
    heart: (
      <path
        d="M20 31 C20 31 6 22 6 14 C6 9 10 7 14 8 C17 9 20 12 20 12 C20 12 23 9 26 8 C30 7 34 9 34 14 C34 22 20 31 20 31Z"
        fill={fill}
      />
    ),
    diagonal: <polygon points="5,7 35,7 35,29 5,33" fill={fill} />,
    "diagonal-r": <polygon points="5,7 35,7 35,33 5,29" fill={fill} />,
    "wave-b": (
      <>
        <rect x="5" y="7" width="30" height="26" fill={fill} />
        <path
          d="M5 28 Q12 23 20 28 Q28 33 35 28 L35 34 L5 34Z"
          fill={active ? BROWN_D : CREAM}
        />
      </>
    ),
    "wave-t": (
      <>
        <rect x="5" y="7" width="30" height="26" fill={fill} />
        <path
          d="M5 12 Q12 7 20 12 Q28 17 35 12 L35 6 L5 6Z"
          fill={active ? BROWN_D : CREAM}
        />
      </>
    ),
    "wave-both": (
      <>
        <rect x="5" y="7" width="30" height="26" fill={fill} />
        <path
          d="M5 28 Q12 23 20 28 Q28 33 35 28 L35 34 L5 34Z"
          fill={active ? BROWN_D : CREAM}
        />
        <path
          d="M5 12 Q12 7 20 12 Q28 17 35 12 L35 6 L5 6Z"
          fill={active ? BROWN_D : CREAM}
        />
      </>
    ),
    // Blobs — organic shapes
    blob: (
      <path
        d="M20 7 C27 6 33 11 34 18 C35 25 30 32 22 34 C14 36 7 31 6 23 C5 15 10 8 20 7Z"
        fill={fill}
      />
    ),
    blob2: (
      <path
        d="M25 7 C31 10 35 17 34 24 C33 31 26 36 19 35 C12 34 6 28 7 21 C8 14 14 7 20 6 C22 5 24 6 25 7Z"
        fill={fill}
      />
    ),
    blob3: (
      <path
        d="M18 6 C25 4 33 9 35 17 C37 25 32 34 24 35 C16 36 8 31 7 22 C6 13 11 8 18 6Z"
        fill={fill}
      />
    ),
    blob4: (
      <path
        d="M22 8 C29 7 35 13 35 21 C35 28 30 35 22 35 C14 35 6 30 6 22 C6 14 11 8 16 7 C18 6 20 8 22 8Z"
        fill={fill}
      />
    ),
  };
  return (
    <svg
      width={sz}
      height={sz}
      viewBox={`0 0 ${sz} ${sz}`}
      fill="none"
      style={{ display: "block" }}
    >
      {previews[shape]}
    </svg>
  );
}

function MaskThumb({
  effect,
  active,
}: {
  effect: MaskEffect;
  active: boolean;
}) {
  const fill = BROWN_XL;
  const sz = 40;
  const grad: Record<MaskEffect, React.ReactNode> = {
    "fade-b": (
      <defs>
        <linearGradient id={`m-b-${active}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="30%" stopColor={active ? BROWN : fill} />
          <stop offset="100%" stopColor={CREAM} stopOpacity="0" />
        </linearGradient>
      </defs>
    ),
    "fade-t": (
      <defs>
        <linearGradient id={`m-t-${active}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="30%" stopColor={active ? BROWN : fill} />
          <stop offset="100%" stopColor={CREAM} stopOpacity="0" />
        </linearGradient>
      </defs>
    ),
    "fade-l": (
      <defs>
        <linearGradient id={`m-l-${active}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="30%" stopColor={active ? BROWN : fill} />
          <stop offset="100%" stopColor={CREAM} stopOpacity="0" />
        </linearGradient>
      </defs>
    ),
    "fade-r": (
      <defs>
        <linearGradient id={`m-r-${active}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="30%" stopColor={active ? BROWN : fill} />
          <stop offset="100%" stopColor={CREAM} stopOpacity="0" />
        </linearGradient>
      </defs>
    ),
    vignette: (
      <defs>
        <radialGradient id={`m-v-${active}`} cx="50%" cy="50%" r="50%">
          <stop offset="30%" stopColor={active ? BROWN : fill} />
          <stop offset="100%" stopColor={CREAM} stopOpacity="0" />
        </radialGradient>
      </defs>
    ),
  };
  const gradId: Record<MaskEffect, string> = {
    "fade-b": `m-b-${active}`,
    "fade-t": `m-t-${active}`,
    "fade-l": `m-l-${active}`,
    "fade-r": `m-r-${active}`,
    vignette: `m-v-${active}`,
  };
  return (
    <svg
      width={sz}
      height={sz}
      viewBox={`0 0 ${sz} ${sz}`}
      fill="none"
      style={{ display: "block" }}
    >
      {grad[effect]}
      <rect
        x="5"
        y="7"
        width="30"
        height="26"
        fill={`url(#${gradId[effect]})`}
        rx="3"
      />
      {active && (
        <rect
          x="5"
          y="7"
          width="30"
          height="26"
          fill="none"
          rx="3"
          stroke={BROWN}
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

// ── Hidden SVG clip-path defs ─────────────────────────────────────────────────
const PhotoClipDefs: React.FC = () => (
  <svg
    width="0"
    height="0"
    style={{ position: "absolute", overflow: "hidden", pointerEvents: "none" }}
  >
    <defs>
      <clipPath id="clip-wave-b" clipPathUnits="objectBoundingBox">
        <path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z" />
      </clipPath>
      <clipPath id="clip-wave-t" clipPathUnits="objectBoundingBox">
        <path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z" />
      </clipPath>
      <clipPath id="clip-wave-both" clipPathUnits="objectBoundingBox">
        <path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z" />
      </clipPath>
      <clipPath id="clip-heart" clipPathUnits="objectBoundingBox">
        <path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z" />
      </clipPath>
      {/* Blob 1 — from user SVG, normalized to objectBoundingBox */}
      <clipPath id="clip-blob" clipPathUnits="objectBoundingBox">
        <path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z" />
      </clipPath>
      {/* Blob 2 — from user SVG (M25,-27.6...) normalized */}
      <clipPath id="clip-blob2" clipPathUnits="objectBoundingBox">
        <path
          d="M0.75,-0.276 C0.831,-0.229 0.911,-0.158 0.921,-0.078 C0.93,0.002 0.869,0.09 0.808,0.161 C0.747,0.232 0.685,0.285 0.611,0.316 C0.538,0.347 0.453,0.356 0.389,0.324 C0.326,0.292 0.285,0.22 0.233,0.147 C0.181,0.073 0.119,-0.003 0.113,-0.086 C0.107,-0.169 0.157,-0.259 0.231,-0.307 C0.305,-0.355 0.402,-0.362 0.493,-0.353 C0.584,-0.345 0.668,-0.322 0.75,-0.276Z"
          transform="translate(0.5,0.5) scale(0.9)"
        />
      </clipPath>
      {/* Blob 3 — rounder organic */}
      <clipPath id="clip-blob3" clipPathUnits="objectBoundingBox">
        <path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z" />
      </clipPath>
      {/* Blob 4 — wide organic */}
      <clipPath id="clip-blob4" clipPathUnits="objectBoundingBox">
        <path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z" />
      </clipPath>
    </defs>
  </svg>
);

// ─── Photo Placeholder — shown when no image uploaded yet ─────────────────────
//  Renders a beautiful SVG with gradients + couple initials + botanical elements
//  No external requests — fully self-contained

interface PhotoPlaceholderProps {
  aspectRatio: string;
  photoClip: ClipShape;
  photoMasks: MaskEffect[];
  initial1?: string; // first letter of partner 1
  initial2?: string; // first letter of partner 2
  variant?: number; // 0..3 — different botanical decorations
  editMode: boolean;
  onClick: () => void;
}

const PLACEHOLDER_GRADIENTS = [
  { a: "#c9a07a", b: "#8b6355", c: "#e8d8cc" },
  { a: "#b89880", b: "#7a5548", c: "#f0e6de" },
  { a: "#a07855", b: "#6a4a3c", c: "#ddd0c5" },
  { a: "#c4a882", b: "#9a7060", c: "#ede3da" },
];

const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({
  aspectRatio,
  photoClip,
  photoMasks,
  initial1 = "M",
  initial2 = "N",
  variant = 0,
  editMode,
  onClick,
}) => {
  const paddingMap: Record<string, string> = {
    "1:1": "100%",
    "4:3": "75%",
    "3:4": "133%",
    "16:9": "56.25%",
    free: "75%",
  };
  const pt = paddingMap[aspectRatio] || "75%";
  const clipStyle = getClipStyle(photoClip);
  const maskStyle = getMaskStyle(photoMasks);
  const g = PLACEHOLDER_GRADIENTS[variant % 4];
  const gId = `ph-grad-${variant}`;
  const i1 = (initial1 || "M")[0].toUpperCase();
  const i2 = (initial2 || "N")[0].toUpperCase();

  return (
    <div
      style={{
        position: "relative",
        paddingTop: pt,
        cursor: editMode ? "pointer" : "default",
        ...clipStyle,
        ...maskStyle,
        overflow: "hidden",
      }}
      onClick={editMode ? onClick : undefined}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={g.c} />
              <stop offset="50%" stopColor={g.a} />
              <stop offset="100%" stopColor={g.b} />
            </linearGradient>
            <radialGradient id={`${gId}-r`} cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
            </radialGradient>
          </defs>

          {/* Background */}
          <rect width="400" height="500" fill={`url(#${gId})`} />
          <rect width="400" height="500" fill={`url(#${gId}-r)`} />

          {/* Botanical — top-left stems */}
          <g
            opacity="0.22"
            stroke="white"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          >
            <path d="M-10 80 Q40 60 60 20" />
            <path d="M20 100 Q50 70 55 40" />
            <ellipse
              cx="55"
              cy="40"
              rx="10"
              ry="6"
              fill="white"
              stroke="none"
              opacity="0.6"
              transform="rotate(-30 55 40)"
            />
            <ellipse
              cx="60"
              cy="20"
              rx="10"
              ry="6"
              fill="white"
              stroke="none"
              opacity="0.5"
              transform="rotate(-50 60 20)"
            />
            <ellipse
              cx="40"
              cy="62"
              rx="9"
              ry="5"
              fill="white"
              stroke="none"
              opacity="0.4"
              transform="rotate(-20 40 62)"
            />
          </g>

          {/* Botanical — bottom-right stems */}
          <g
            opacity="0.22"
            stroke="white"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            transform="translate(400 500) rotate(180)"
          >
            <path d="M-10 80 Q40 60 60 20" />
            <path d="M20 100 Q50 70 55 40" />
            <ellipse
              cx="55"
              cy="40"
              rx="10"
              ry="6"
              fill="white"
              stroke="none"
              opacity="0.6"
              transform="rotate(-30 55 40)"
            />
            <ellipse
              cx="60"
              cy="20"
              rx="10"
              ry="6"
              fill="white"
              stroke="none"
              opacity="0.5"
              transform="rotate(-50 60 20)"
            />
            <ellipse
              cx="40"
              cy="62"
              rx="9"
              ry="5"
              fill="white"
              stroke="none"
              opacity="0.4"
              transform="rotate(-20 40 62)"
            />
          </g>

          {/* Thin frame */}
          <rect
            x="18"
            y="18"
            width="364"
            height="464"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />

          {/* Center monogram */}
          <text
            x="200"
            y="215"
            fontFamily="Cormorant Garamond, Georgia, serif"
            fontSize="100"
            fill="rgba(255,255,255,0.92)"
            textAnchor="middle"
            fontStyle="italic"
            fontWeight="400"
          >
            {i1}
          </text>
          {/* Ampersand */}
          <text
            x="200"
            y="268"
            fontFamily="Dancing Script, cursive"
            fontSize="36"
            fill="rgba(255,255,255,0.65)"
            textAnchor="middle"
          >
            &amp;
          </text>
          {/* Second initial */}
          <text
            x="200"
            y="330"
            fontFamily="Cormorant Garamond, Georgia, serif"
            fontSize="100"
            fill="rgba(255,255,255,0.92)"
            textAnchor="middle"
            fontStyle="italic"
            fontWeight="400"
          >
            {i2}
          </text>

          {/* Decorative line */}
          <line
            x1="150"
            y1="345"
            x2="250"
            y2="345"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
          />

          {/* Small flowers */}
          {[160, 200, 240].map((x, i) => (
            <g key={i} transform={`translate(${x} 355)`} opacity="0.45">
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <ellipse
                  key={a}
                  cx="0"
                  cy="-5"
                  rx="2.5"
                  ry="4"
                  fill="white"
                  transform={`rotate(${a})`}
                />
              ))}
              <circle cx="0" cy="0" r="2" fill="rgba(255,220,100,0.8)" />
            </g>
          ))}

          {/* Edit hint — only in edit mode */}
          {editMode && (
            <g>
              <rect
                x="130"
                y="390"
                width="140"
                height="36"
                rx="18"
                fill="rgba(255,255,255,0.18)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
              />
              <text
                x="200"
                y="413"
                fontFamily="DM Sans, sans-serif"
                fontSize="12"
                fill="white"
                textAnchor="middle"
                fontWeight="600"
                opacity="0.9"
              >
                + Adaugă fotografie
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

interface PhotoBlockProps {
  imageData: string | undefined;
  altText?: string;
  editMode: boolean;
  onUpload: (data: string) => void;
  onRemove: () => void;
  onClipChange: (clip: ClipShape) => void;
  onMasksChange: (masks: MaskEffect[]) => void;
  onRatioChange: (ratio: "1:1" | "4:3" | "3:4" | "16:9" | "free") => void;
  aspectRatio?: "1:1" | "4:3" | "3:4" | "16:9" | "free";
  photoClip?: ClipShape;
  photoMasks?: MaskEffect[];
  placeholder?: string;
  placeholderInitial1?: string;
  placeholderInitial2?: string;
  placeholderVariant?: number;
}

const PhotoBlock: React.FC<PhotoBlockProps> = ({
  imageData,
  altText,
  editMode,
  onUpload,
  onRemove,
  onClipChange,
  onMasksChange,
  onRatioChange,
  aspectRatio = "free",
  photoClip = "rect",
  photoMasks = [],
  placeholder = "Adaugă fotografie",
  placeholderInitial1,
  placeholderInitial2,
  placeholderVariant = 0,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const paddingMap: Record<string, string> = {
    "1:1": "100%",
    "4:3": "75%",
    "3:4": "133%",
    "16:9": "56.25%",
    free: "66.6%",
  };
  const pt = paddingMap[aspectRatio];

  // Toggle a mask effect on/off
  const toggleMask = (m: MaskEffect) => {
    const has = photoMasks.includes(m);
    onMasksChange(has ? photoMasks.filter((x) => x !== m) : [...photoMasks, m]);
  };

  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadErr("Doar imagini sunt acceptate.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setUploadErr("Fișierul depășește 12 MB.");
      return;
    }
    setUploadErr("");
    setUploading(true);

    // ── Șterge poza veche ÎNAINTE de a uploada cea nouă ──
    // (nu așteptăm răspunsul — UI nu trebuie blocat)
    deleteUploadedFile(imageData);

    try {
      const form = new FormData();
      form.append("file", file);
      const _session = JSON.parse(
        localStorage.getItem("weddingPro_session") || "{}",
      );
      const token = _session?.token || "";
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Upload eșuat.");
      }
      const { url } = await res.json();
      onUpload(url);
    } catch (e: any) {
      setUploadErr(e.message || "Eroare upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // reset so same file can be re-selected
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clipStyle = getClipStyle(photoClip);
  const maskStyle = getMaskStyle(photoMasks);
  const combinedStyle: React.CSSProperties = { ...clipStyle, ...maskStyle };
  const needsPadding = photoClip === "wave-b" || photoClip === "wave-both";
  const needsPaddingT = photoClip === "wave-t" || photoClip === "wave-both";

  // Resolve image src — server URL or legacy base64
  // Demo photos (picsum) are shown as-is but with a badge in edit mode
  const isDemoPhoto = !!imageData && imageData.includes("picsum.photos");
  const imgSrc = imageData || undefined;

  // Delete file from server when removing
  const handleRemove = () => {
    deleteUploadedFile(imageData); // șterge de pe server
    onRemove(); // curăță state-ul local
  };

  if (imgSrc) {
    return (
      <div>
        <PhotoClipDefs />
        {/* Uploading overlay (replacing image) */}
        {uploading && (
          <div
            style={{
              position: "relative",
              paddingTop: pt,
              background: BROWN_XL,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              ...combinedStyle,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: `3px solid ${BROWN_XL}`,
                  borderTop: `3px solid ${BROWN}`,
                  borderRadius: "50%",
                  animation: "yt-spin 0.8s linear infinite",
                }}
              />
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  fontWeight: 700,
                  color: BROWN,
                }}
              >
                Se încarcă...
              </span>
            </div>
          </div>
        )}
        {/* Image with shape applied */}
        {!uploading && (
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                paddingTop: pt,
                overflow: "hidden",
                ...combinedStyle,
              }}
            >
              <img
                src={imgSrc}
                alt={altText || ""}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  paddingTop: needsPaddingT ? "8%" : 0,
                  paddingBottom: needsPadding ? "8%" : 0,
                }}
              />
            </div>

            {/* Edit overlay */}
            {editMode && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: 0,
                  transition: "opacity 0.2s",
                  ...combinedStyle,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.opacity = "1")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.opacity = "0")
                }
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.42)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "7px 14px",
                    borderRadius: 99,
                    background: "white",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 700,
                    color: TEXT,
                  }}
                >
                  <Camera className="w-3.5 h-3.5" /> Schimbă
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "7px 14px",
                    borderRadius: 99,
                    background: "rgba(220,40,40,0.88)",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Șterge
                </button>
                {isDemoPhoto && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      borderRadius: 99,
                      padding: "4px 14px",
                      fontFamily: SANS,
                      fontSize: 9,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      letterSpacing: "0.05em",
                      zIndex: 2,
                    }}
                  >
                    📷 Fotografie demo — apasă Schimbă
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
      </div>
    );
  }

  // ── No image: show placeholder (always) + dropzone (edit only) ──
  return (
    <div style={{ position: "relative" }}>
      <PhotoClipDefs />
      {/* Beautiful placeholder — visible to everyone */}
      <PhotoPlaceholder
        aspectRatio={aspectRatio}
        photoClip={photoClip}
        photoMasks={photoMasks}
        initial1={placeholderInitial1}
        initial2={placeholderInitial2}
        variant={placeholderVariant}
        editMode={editMode}
        onClick={() => fileRef.current?.click()}
      />
      {/* Drag-and-drop overlay — edit mode only */}
      {editMode && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            transition: "opacity 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLDivElement).style.opacity = "1")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLDivElement).style.opacity = "0")
          }
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
            e.currentTarget.style.opacity = "1";
          }}
          onDragLeave={(e) => {
            setDragging(false);
            e.currentTarget.style.opacity = "0";
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            e.currentTarget.style.opacity = "0";
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: dragging
                ? "rgba(139,99,85,0.55)"
                : "rgba(0,0,0,0.35)",
              transition: "background 0.2s",
              ...getClipStyle(photoClip),
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "2px solid rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload className="w-5 h-5" style={{ color: "white" }} />
            </div>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 700,
                color: "white",
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              {dragging ? "Eliberează pentru upload" : "Înlocuiește fotografia"}
            </span>
          </div>
        </div>
      )}
      {/* Uploading spinner */}
      {uploading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(232,216,204,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            ...getClipStyle(photoClip),
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: `3px solid ${BROWN_XL}`,
              borderTop: `3px solid ${BROWN}`,
              borderRadius: "50%",
              animation: "yt-spin 0.8s linear infinite",
            }}
          />
          <span
            style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              color: BROWN,
            }}
          >
            Se încarcă...
          </span>
        </div>
      )}
      {/* Error */}
      {uploadErr && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(200,40,40,0.9)",
            color: "white",
            borderRadius: 99,
            padding: "4px 14px",
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {uploadErr}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

// ─── Calendar Month ────────────────────────────────────────────────────────────
const CalendarMonth: React.FC<{ date: string | undefined }> = ({ date }) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear(),
    month = d.getMonth(),
    day = d.getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    "IANUARIE",
    "FEBRUARIE",
    "MARTIE",
    "APRILIE",
    "MAI",
    "IUNIE",
    "IULIE",
    "AUGUST",
    "SEPTEMBRIE",
    "OCTOMBRIE",
    "NOIEMBRIE",
    "DECEMBRIE",
  ];
  const dayLabels = ["LUN", "MAR", "MIE", "JOI", "VIN", "SÂM", "DUM"];
  // Shift so Monday = 0
  const startOffset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div
      style={{
        background: BROWN,
        borderRadius: 8,
        padding: "20px 16px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: SERIF,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.38em",
          color: "white",
          textTransform: "uppercase",
          margin: "0 0 14px",
          opacity: 0.85,
        }}
      >
        EL GRAN DÍA — {monthNames[month]} {year}
      </p>
      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
          marginBottom: 6,
        }}
      >
        {dayLabels.map((l) => (
          <div
            key={l}
            style={{
              fontFamily: SANS,
              fontSize: 8,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              textAlign: "center",
              letterSpacing: "0.05em",
            }}
          >
            {l}
          </div>
        ))}
      </div>
      {/* Days grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
        }}
      >
        {cells.map((cell, i) => {
          const isToday = cell === day;
          return (
            <div
              key={i}
              style={{
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: isToday ? SERIF : SANS,
                fontSize: isToday ? 16 : 11,
                fontWeight: isToday ? 600 : 400,
                color: isToday
                  ? BROWN_D
                  : cell
                    ? "rgba(255,255,255,0.7)"
                    : "transparent",
                background: isToday ? "white" : "transparent",
                borderRadius: isToday ? "50%" : 0,
                width: 28,
                margin: "0 auto",
                boxShadow: isToday ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                transition: "all 0.15s",
              }}
            >
              {cell || ""}
            </div>
          );
        })}
      </div>
      {/* Day of week label */}
      <p
        style={{
          fontFamily: SANS,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
          margin: "14px 0 0",
        }}
      >
        {d.toLocaleDateString("ro-RO", { weekday: "long" }).toUpperCase()}
      </p>
    </div>
  );
};

// ─── YouTube IFrame API types (window.YT) ────────────────────────────────────
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Singleton: load the YT script once per page
let ytApiLoaded = false;
let ytApiLoading = false;
const ytReadyCbs: Array<() => void> = [];

function loadYtApi(cb: () => void) {
  if (ytApiLoaded && window.YT?.Player) {
    cb();
    return;
  }
  ytReadyCbs.push(cb);
  if (ytApiLoading) return;
  ytApiLoading = true;
  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
  window.onYouTubeIframeAPIReady = () => {
    ytApiLoaded = true;
    ytReadyCbs.forEach((fn) => fn());
    ytReadyCbs.length = 0;
  };
}

// ─── YouTube Audio-only player ────────────────────────────────────────────────
interface YtAudioProps {
  ytId: string;
  title: string;
  artist: string;
  editMode: boolean;
  onTitleChange: (v: string) => void;
  onArtistChange: (v: string) => void;
}

const YoutubeAudioPlayer: React.FC<YtAudioProps> = ({
  ytId,
  title,
  artist,
  editMode,
  onTitleChange,
  onArtistChange,
}) => {
  const containerId = useRef(
    `yt-${ytId}-${Math.random().toString(36).slice(2)}`,
  ).current;
  const playerRef = useRef<any>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  // Init YT player
  useEffect(() => {
    loadYtApi(() => {
      playerRef.current = new window.YT.Player(containerId, {
        videoId: ytId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (e: any) => {
            setDuration(e.target.getDuration() || 0);
            setReady(true);
            setLoading(false);
          },
          onStateChange: (e: any) => {
            const YT = window.YT.PlayerState;
            if (e.data === YT.PLAYING) {
              setPlaying(true);
              setDuration(playerRef.current?.getDuration() || 0);
              tickRef.current = setInterval(() => {
                setProgress(playerRef.current?.getCurrentTime() || 0);
                setDuration(playerRef.current?.getDuration() || 0);
              }, 500);
            } else {
              setPlaying(false);
              if (tickRef.current) {
                clearInterval(tickRef.current);
                tickRef.current = null;
              }
              if (e.data === window.YT.PlayerState.ENDED) {
                setProgress(0);
                playerRef.current?.seekTo(0, true);
              }
            }
          },
          onError: () => setLoading(false),
        },
      });
    });
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      try {
        playerRef.current?.destroy();
      } catch {}
    };
  }, [ytId]);

  const togglePlay = () => {
    if (!ready || !playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ready || !duration || !playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    playerRef.current.seekTo(ratio * duration, true);
    setProgress(ratio * duration);
  };

  const skip = (delta: number) => {
    if (!ready || !playerRef.current) return;
    const current = playerRef.current.getCurrentTime() || 0;
    playerRef.current.seekTo(
      Math.max(0, Math.min(duration, current + delta)),
      true,
    );
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = duration ? `${(progress / duration) * 100}%` : "0%";

  return (
    <div>
      {/* ── Hidden YT iframe container — 1px, tucked away ── */}
      <div
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div id={containerId} />
      </div>

      {/* ── Thumbnail + track info ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {/* Album art from YT thumbnail */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            overflow: "hidden",
            flexShrink: 0,
            background: BROWN_D,
            position: "relative",
            boxShadow: playing
              ? `0 4px 20px rgba(0,0,0,0.35)`
              : "0 2px 10px rgba(0,0,0,0.2)",
            transition: "box-shadow 0.3s",
          }}
        >
          <img
            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Overlay when playing — subtle pulse ring */}
          {playing && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 10,
                boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.3)`,
                animation: "yt-ring 2s ease-in-out infinite",
              }}
            />
          )}
          {/* Loading spinner */}
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "yt-spin 0.8s linear infinite",
                }}
              />
            </div>
          )}
        </div>

        {/* Title + artist */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <InlineEdit
            tag="p"
            editMode={editMode}
            value={title}
            onChange={onTitleChange}
            placeholder="Titlul cântecului..."
            style={{
              fontFamily: SERIF,
              fontSize: 14,
              fontStyle: "italic",
              color: "white",
              margin: 0,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
          <InlineEdit
            tag="p"
            editMode={editMode}
            value={artist}
            onChange={onArtistChange}
            placeholder="Artist..."
            style={{
              fontFamily: SANS,
              fontSize: 10,
              color: "rgba(255,255,255,0.55)",
              margin: "3px 0 0",
            }}
          />
          {/* Animated bars (playing indicator) */}
          {playing && (
            <div
              style={{
                display: "flex",
                gap: 2,
                alignItems: "flex-end",
                height: 12,
                marginTop: 5,
              }}
            >
              {[1, 1.5, 0.8, 1.3, 1].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    background: "rgba(255,255,255,0.5)",
                    borderRadius: 2,
                    height: `${h * 8}px`,
                    animation: `mp3-bar ${0.55 + i * 0.1}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div
        onClick={seek}
        style={{
          height: 4,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 99,
          marginBottom: 6,
          cursor: ready ? "pointer" : "default",
          position: "relative",
          opacity: ready ? 1 : 0.4,
          transition: "opacity 0.3s",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            background: "white",
            width: pct,
            transition: "width 0.4s linear",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            left: pct,
            marginLeft: -5,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            transition: "left 0.4s linear",
          }}
        />
      </div>

      {/* ── Time ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: 9,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {fmt(progress)}
        </span>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 9,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {duration ? fmt(duration) : "--:--"}
        </span>
      </div>

      {/* ── Controls ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
        }}
      >
        <button
          type="button"
          onClick={() => skip(-10)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            opacity: ready ? 0.7 : 0.3,
            transition: "opacity 0.2s",
          }}
        >
          <SkipBack className="w-4 h-4" style={{ color: "white" }} />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          disabled={!ready}
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: ready ? "white" : "rgba(255,255,255,0.3)",
            border: "none",
            cursor: ready ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: ready ? "0 3px 16px rgba(0,0,0,0.3)" : "none",
            transform: playing ? "scale(0.93)" : "scale(1)",
            transition: "transform 0.12s, background 0.2s, box-shadow 0.2s",
          }}
        >
          {playing ? (
            <Pause className="w-4 h-4" style={{ color: BROWN_D }} />
          ) : (
            <Play
              className="w-4 h-4"
              style={{ color: BROWN_D, marginLeft: 2 }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => skip(10)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            opacity: ready ? 0.7 : 0.3,
            transition: "opacity 0.2s",
          }}
        >
          <SkipForward className="w-4 h-4" style={{ color: "white" }} />
        </button>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes yt-spin { to { transform: rotate(360deg); } }
        @keyframes yt-ring {
          0%,100% { box-shadow: inset 0 0 0 2px rgba(255,255,255,0.2); }
          50%      { box-shadow: inset 0 0 0 2px rgba(255,255,255,0.45); }
        }
      `}</style>
    </div>
  );
};

// ─── YouTube ID extractor ─────────────────────────────────────────────────────
function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ─── Music player — YouTube + MP3 ─────────────────────────────────────────────
interface MusicPlayerProps {
  title: string;
  artist: string;
  musicUrl: string;
  musicType: "youtube" | "mp3" | "none";
  editMode: boolean;
  onTitleChange: (v: string) => void;
  onArtistChange: (v: string) => void;
  onUrlChange: (url: string, type: "youtube" | "mp3" | "none") => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  title,
  artist,
  musicUrl,
  musicType,
  editMode,
  onTitleChange,
  onArtistChange,
  onUrlChange,
}) => {
  // ── MP3 state ──
  const audioRef = useRef<HTMLAudioElement>(null);
  const mp3Ref = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);

  // ── YouTube state ──
  const [ytUrl, setYtUrl] = useState("");
  const [showYtInput, setShowYtInput] = useState(false);
  const [ytError, setYtError] = useState("");
  const [ytFetching, setYtFetching] = useState(false);

  const ytId = musicType === "youtube" ? extractYoutubeId(musicUrl) : null;

  // sync audio events
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onDuration = () => setDuration(a.duration);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDuration);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDuration);
      a.removeEventListener("ended", onEnded);
    };
  }, [musicUrl, musicType]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a || musicType !== "mp3") return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (musicType !== "mp3" || !audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    audioRef.current.currentTime = ratio * duration;
    setProgress(ratio * duration);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  // ── MP3 file upload ──
  const handleMp3File = (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      onUrlChange(data, "mp3");
      setPlaying(false);
      setProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const handleMp3Input = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleMp3File(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleMp3File(f);
  };

  // ── YouTube submit ──
  const submitYt = async () => {
    const rawUrl = ytUrl.trim();
    const id = extractYoutubeId(rawUrl);
    if (!id) {
      setYtError(
        "Link YouTube invalid. Încearcă un link de tip: youtu.be/... sau youtube.com/watch?v=...",
      );
      return;
    }
    setYtError("");
    setYtFetching(true);
    try {
      // oEmbed — public, no API key needed
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      );
      if (res.ok) {
        const data = await res.json();
        // data.title   = "Shape of You"
        // data.author_name = "Ed Sheeran"
        if (data.title) onTitleChange(data.title);
        if (data.author_name) onArtistChange(data.author_name);
      }
    } catch (_) {
      // silently ignore — user can edit manually
    } finally {
      setYtFetching(false);
    }
    onUrlChange(rawUrl, "youtube");
    setShowYtInput(false);
    setYtUrl("");
  };

  const handleYtKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submitYt();
    if (e.key === "Escape") {
      setShowYtInput(false);
      setYtError("");
      setYtUrl("");
    }
  };

  const removeSource = () => {
    setPlaying(false);
    setProgress(0);
    onUrlChange("", "none");
    if (audioRef.current) audioRef.current.src = "";
  };

  // ── Render ──
  return (
    <div style={{ background: BROWN, borderRadius: 8, padding: "16px 20px" }}>
      {/* Hidden audio element for MP3 */}
      {musicType === "mp3" && musicUrl && (
        <audio ref={audioRef} src={musicUrl} preload="metadata" />
      )}

      {/* Header label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Music
            className="w-3 h-3"
            style={{ color: "rgba(255,255,255,0.5)" }}
          />
          <span
            style={{
              fontFamily: SANS,
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Cântecul nostru
          </span>
        </div>
        {/* Remove button */}
        {editMode && (musicType === "youtube" || musicType === "mp3") && (
          <button
            type="button"
            onClick={removeSource}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 99,
              padding: "3px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Trash2
              className="w-3 h-3"
              style={{ color: "rgba(255,255,255,0.5)" }}
            />
            <span
              style={{
                fontFamily: SANS,
                fontSize: 9,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Șterge
            </span>
          </button>
        )}
      </div>

      {/* ── NO SOURCE YET — edit mode upload UI ── */}
      {(musicType === "none" || !musicUrl) && editMode && (
        <div>
          {/* YouTube input */}
          {showYtInput ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  value={ytUrl}
                  onChange={(e) => {
                    setYtUrl(e.target.value);
                    setYtError("");
                  }}
                  onKeyDown={handleYtKeyDown}
                  placeholder="https://youtu.be/... sau youtube.com/watch?v=..."
                  autoFocus
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.12)",
                    border: `1px solid ${ytError ? "#ff6b6b" : "rgba(255,255,255,0.2)"}`,
                    borderRadius: 6,
                    padding: "9px 12px",
                    fontFamily: SANS,
                    fontSize: 11,
                    color: "white",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={submitYt}
                  disabled={ytFetching}
                  style={{
                    background: ytFetching ? BROWN_XL : "white",
                    border: "none",
                    borderRadius: 6,
                    padding: "0 14px",
                    cursor: ytFetching ? "wait" : "pointer",
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 700,
                    color: BROWN_D,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "background 0.2s",
                  }}
                >
                  {ytFetching ? (
                    <>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          border: "2px solid rgba(107,74,60,0.3)",
                          borderTop: "2px solid " + BROWN_D,
                          borderRadius: "50%",
                          animation: "yt-spin 0.8s linear infinite",
                          flexShrink: 0,
                        }}
                      />
                      Se încarcă...
                    </>
                  ) : (
                    "✓ Adaugă"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowYtInput(false);
                    setYtError("");
                    setYtUrl("");
                  }}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    borderRadius: 6,
                    padding: "0 10px",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 14,
                  }}
                >
                  ✕
                </button>
              </div>
              {ytError && (
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    color: "#ff9999",
                    margin: "6px 0 0",
                    lineHeight: 1.4,
                  }}
                >
                  {ytError}
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                onClick={() => setShowYtInput(true)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px dashed rgba(255,255,255,0.25)",
                  borderRadius: 6,
                  padding: "10px 0",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {/* YouTube icon */}
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  <rect
                    width="20"
                    height="14"
                    rx="3"
                    fill="#FF0000"
                    opacity="0.8"
                  />
                  <path d="M8 4.5 L14 7 L8 9.5Z" fill="white" />
                </svg>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 9,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.65)",
                    letterSpacing: "0.05em",
                  }}
                >
                  Link YouTube
                </span>
              </button>
              <button
                type="button"
                onClick={() => mp3Ref.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  flex: 1,
                  background: dragging
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(255,255,255,0.1)",
                  border: `1px dashed ${dragging ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)"}`,
                  borderRadius: 6,
                  padding: "10px 0",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.15s",
                }}
              >
                <Upload
                  className="w-5 h-5"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                />
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 9,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.65)",
                    letterSpacing: "0.05em",
                  }}
                >
                  Încarcă MP3
                </span>
              </button>
              <input
                ref={mp3Ref}
                type="file"
                accept="audio/*,.mp3,.m4a,.ogg,.wav"
                onChange={handleMp3Input}
                style={{ display: "none" }}
              />
            </div>
          )}

          {/* Placeholder player UI (no source) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 10,
              opacity: 0.35,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: BROWN_D,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Music
                className="w-5 h-5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 13,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.5)",
                  margin: 0,
                }}
              >
                Titlul cântecului
              </p>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  margin: "2px 0 0",
                }}
              >
                Artist
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── NO SOURCE — view mode placeholder ── */}
      {(musicType === "none" || !musicUrl) && !editMode && (
        <div style={{ textAlign: "center", padding: "16px 0", opacity: 0.4 }}>
          <Music
            className="w-8 h-8"
            style={{ color: "white", display: "block", margin: "0 auto 6px" }}
          />
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 12,
              fontStyle: "italic",
              color: "white",
              margin: 0,
            }}
          >
            Melodia va apărea aici
          </p>
        </div>
      )}

      {/* ── YOUTUBE AUDIO-ONLY PLAYER ── */}
      {musicType === "youtube" && ytId && (
        <YoutubeAudioPlayer
          ytId={ytId}
          title={title}
          artist={artist}
          editMode={editMode}
          onTitleChange={onTitleChange}
          onArtistChange={onArtistChange}
        />
      )}

      {/* ── MP3 PLAYER ── */}
      {musicType === "mp3" && musicUrl && (
        <div>
          {/* Track info — editable */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 12,
            }}
          >
            {/* Album art placeholder with music wave */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                background: BROWN_D,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {playing ? (
                /* Animated bars when playing */
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-end",
                    height: 20,
                  }}
                >
                  {[1, 1.6, 0.8, 1.4, 1].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: 3,
                        background: "rgba(255,255,255,0.6)",
                        borderRadius: 2,
                        height: `${h * 12}px`,
                        animation: `mp3-bar ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Music
                  className="w-5 h-5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit
                tag="p"
                editMode={editMode}
                value={title}
                onChange={onTitleChange}
                placeholder="Titlul cântecului..."
                style={{
                  fontFamily: SERIF,
                  fontSize: 14,
                  fontStyle: "italic",
                  color: "white",
                  margin: 0,
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
              <InlineEdit
                tag="p"
                editMode={editMode}
                value={artist}
                onChange={onArtistChange}
                placeholder="Artist..."
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.55)",
                  margin: "2px 0 0",
                }}
              />
            </div>
          </div>

          {/* Progress bar — clickable */}
          <div
            onClick={seek}
            style={{
              height: 4,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 99,
              marginBottom: 6,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 99,
                background: "white",
                width: duration ? `${(progress / duration) * 100}%` : "0%",
                transition: "width 0.25s linear",
              }}
            />
            {/* Thumb dot */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                left: duration ? `${(progress / duration) * 100}%` : "0%",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "white",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                marginLeft: -5,
                transition: "left 0.25s linear",
              }}
            />
          </div>

          {/* Time */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontSize: 9,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {fmt(progress)}
            </span>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 9,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {duration ? fmt(duration) : "--:--"}
            </span>
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(
                    0,
                    audioRef.current.currentTime - 10,
                  );
                }
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <SkipBack
                className="w-4 h-4"
                style={{ color: "rgba(255,255,255,0.55)" }}
              />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 14px rgba(0,0,0,0.25)",
                transition: "transform 0.15s, box-shadow 0.15s",
                transform: playing ? "scale(0.94)" : "scale(1)",
              }}
            >
              {playing ? (
                <Pause className="w-4 h-4" style={{ color: BROWN_D }} />
              ) : (
                <Play
                  className="w-4 h-4"
                  style={{ color: BROWN_D, marginLeft: 2 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.min(
                    duration,
                    audioRef.current.currentTime + 10,
                  );
                }
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <SkipForward
                className="w-4 h-4"
                style={{ color: "rgba(255,255,255,0.55)" }}
              />
            </button>
          </div>

          <style>{`
            @keyframes mp3-bar {
              from { transform: scaleY(0.4); }
              to   { transform: scaleY(1.2); }
            }
          `}</style>
        </div>
      )}

      {/* ── EDIT MODE: change source button (when source exists) ── */}
      {editMode && (musicType === "youtube" || musicType === "mp3") && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 6,
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setShowYtInput(true);
              removeSource();
            }}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 99,
              padding: "5px 14px",
              cursor: "pointer",
              fontFamily: SANS,
              fontSize: 9,
              fontWeight: 700,
              color: "rgba(255,255,255,0.55)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
              <rect width="12" height="9" rx="2" fill="#FF0000" opacity="0.7" />
              <path d="M4.5 2.5 L8.5 4.5 L4.5 6.5Z" fill="white" />
            </svg>
            Schimbă YouTube
          </button>
          <button
            type="button"
            onClick={() => {
              removeSource();
              mp3Ref.current?.click();
            }}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 99,
              padding: "5px 14px",
              cursor: "pointer",
              fontFamily: SANS,
              fontSize: 9,
              fontWeight: 700,
              color: "rgba(255,255,255,0.55)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Upload className="w-3 h-3" /> MP3
          </button>
          <input
            ref={mp3Ref}
            type="file"
            accept="audio/*,.mp3,.m4a,.ogg,.wav"
            onChange={handleMp3Input}
            style={{ display: "none" }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Dress code block ──────────────────────────────────────────────────────────
const DressCodeBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  textColorOverride?: string;
}> = ({ block, editMode, onUpdate, textColorOverride }) => (
  <div
    style={{
      background: CREAM,
      border: `1px solid ${BROWN_XL}`,
      borderRadius: 8,
      padding: "20px 24px",
      textAlign: (block.blockAlign as any) || "center",
    }}
  >
    <div
      style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}
    >
      <Shirt className="w-8 h-8" style={{ color: BROWN, opacity: 0.8 }} />
    </div>
    <InlineEdit
      tag="p"
      editMode={editMode}
      value={block.sectionTitle || "Cod vestimentar"}
      onChange={(v) => onUpdate({ sectionTitle: v })}
      placeholder="Titlu..."
      style={{
        fontFamily: SCRIPT,
        fontSize: 24,
        color: textColorOverride || BROWN_D,
        margin: "0 0 4px",
        display: "block",
      }}
    />
    <InlineEdit
      tag="p"
      editMode={editMode}
      value={block.label || "Elegant"}
      onChange={(v) => onUpdate({ label: v })}
      placeholder="Ex: Formal, Elegant..."
      style={{
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: MUTED,
        margin: "0 0 14px",
        display: "block",
      }}
    />
    <div style={{ textAlign: "left" }}>
      <InlineEdit
        tag="p"
        editMode={editMode}
        value={block.content || ""}
        onChange={(v) => onUpdate({ content: v })}
        placeholder="Detalii cod vestimentar..."
        multiline
        style={{
          fontFamily: SANS,
          fontSize: 12,
          color: textColorOverride || TEXT,
          lineHeight: 1.7,
          opacity: 0.75,
        }}
      />
    </div>
  </div>
);

// ─── Gift registry block ───────────────────────────────────────────────────────
const GiftBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  textColorOverride?: string;
}> = ({ block, editMode, onUpdate, textColorOverride }) => (
  <div
    style={{
      background: BROWN,
      borderRadius: 8,
      padding: "20px 24px",
      textAlign: (block.blockAlign as any) || "center",
    }}
  >
    <Gift
      className="w-7 h-7"
      style={{
        color: "rgba(255,255,255,0.6)",
        display: "block",
        margin: "0 auto 10px",
      }}
    />
    <InlineEdit
      tag="p"
      editMode={editMode}
      value={block.sectionTitle || "Sugestie de cadou"}
      onChange={(v) => onUpdate({ sectionTitle: v })}
      placeholder="Titlu..."
      style={{
        fontFamily: SCRIPT,
        fontSize: 22,
        color: textColorOverride || "white",
        margin: "0 0 8px",
        display: "block",
      }}
    />
    <InlineEdit
      tag="p"
      editMode={editMode}
      value={
        block.content ||
        "Cel mai frumos cadou este prezența voastră. Dar dacă doriți un detaliu, vă lăsăm aceste opțiuni."
      }
      onChange={(v) => onUpdate({ content: v })}
      placeholder="Mesaj introductiv..."
      multiline
      style={{
        fontFamily: SANS,
        fontSize: 11,
        color: "rgba(255,255,255,0.65)",
        lineHeight: 1.7,
        margin: "0 0 16px",
        display: "block",
      }}
    />
    {/* IBAN / transfer */}
    <div
      style={{
        background: "rgba(0,0,0,0.12)",
        borderRadius: 6,
        padding: "12px 16px",
        textAlign: "left",
      }}
    >
      <p
        style={{
          fontFamily: SANS,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          margin: "0 0 6px",
        }}
      >
        Transfer bancar
      </p>
      <InlineEdit
        tag="p"
        editMode={editMode}
        value={block.iban || ""}
        onChange={(v) => onUpdate({ iban: v })}
        placeholder="IBAN: RO49 AAAA 0000 0000 0000 0000"
        style={{
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 600,
          color: "white",
          margin: 0,
          letterSpacing: "0.05em",
        }}
      />
      <InlineEdit
        tag="p"
        editMode={editMode}
        value={block.ibanName || ""}
        onChange={(v) => onUpdate({ ibanName: v })}
        placeholder="Prenume Nume"
        style={{
          fontFamily: SANS,
          fontSize: 11,
          color: "rgba(255,255,255,0.55)",
          margin: "3px 0 0",
        }}
      />
    </div>
  </div>
);

// ─── No kids block ─────────────────────────────────────────────────────────────
const NoKidsBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  textColorOverride?: string;
}> = ({ block, editMode, onUpdate, textColorOverride }) => (
  <div
    style={{
      background: CREAM,
      border: `1px solid ${BROWN_XL}`,
      borderRadius: 8,
      padding: "20px 24px",
      textAlign: (block.blockAlign as any) || "center",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginBottom: 10,
      }}
    >
      <Baby className="w-6 h-6" style={{ color: BROWN, opacity: 0.5 }} />
      <div
        style={{
          width: 2,
          height: 24,
          background: BROWN,
          opacity: 0.3,
          transform: "rotate(15deg)",
          alignSelf: "center",
        }}
      />
    </div>
    <InlineEdit
      tag="p"
      editMode={editMode}
      value={block.sectionTitle || "Eveniment fără copii"}
      onChange={(v) => onUpdate({ sectionTitle: v })}
      placeholder="Titlu..."
      style={{
        fontFamily: SANS,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.35em",
        textTransform: "uppercase",
        color: textColorOverride || BROWN,
        margin: "0 0 8px",
        display: "block",
      }}
    />
    <InlineEdit
      tag="p"
      editMode={editMode}
      value={
        block.content ||
        "Nunta noastră va fi un eveniment pentru adulți. Vă rugăm să luați în considerare îngrijirea copiilor în această zi specială."
      }
      onChange={(v) => onUpdate({ content: v })}
      placeholder="Mesaj..."
      multiline
      style={{
        fontFamily: SANS,
        fontSize: 11,
        color: textColorOverride || MUTED,
        lineHeight: 1.7,
      }}
    />
  </div>
);

// ─── Quote block ───────────────────────────────────────────────────────────────
const QuoteBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  textColorOverride?: string;
}> = ({ block, editMode, onUpdate, textColorOverride }) => (
  <div
    style={{
      textAlign: (block.blockAlign as any) || "center",
      padding: "8px 16px",
    }}
  >
    <span
      style={{
        fontFamily: SERIF,
        fontSize: 28,
        color: BROWN_XL,
        lineHeight: 0.5,
        display: "block",
        marginBottom: -8,
      }}
    >
      "
    </span>
    <InlineEdit
      tag="p"
      editMode={editMode}
      value={
        block.content ||
        "Nuestro amor nació en Dios, crece en Cristo y permanecerá por su gracia."
      }
      onChange={(v) => onUpdate({ content: v })}
      placeholder="Citat sau text personalizat..."
      multiline
      style={{
        fontFamily: SERIF,
        fontSize: 14,
        fontStyle: "italic",
        color: textColorOverride || TEXT,
        lineHeight: 1.8,
        opacity: 0.72,
        margin: "0 0 6px",
      }}
    />
    {block.label && (
      <InlineEdit
        tag="p"
        editMode={editMode}
        value={block.label || ""}
        onChange={(v) => onUpdate({ label: v })}
        placeholder="Sursă citată..."
        style={{
          fontFamily: SANS,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      />
    )}
  </div>
);

// ─── Thank you block ───────────────────────────────────────────────────────────
const ThankyouBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  initials: string;
  textColorOverride?: string;
}> = ({ block, editMode, onUpdate, initials, textColorOverride }) => (
  <div
    style={{
      textAlign: (block.blockAlign as any) || "center",
      padding: "12px 0",
    }}
  >
    <InlineEdit
      tag="p"
      editMode={editMode}
      value={block.label || "ESPERAMOS CONTAR CON SU PRESENCIA"}
      onChange={(v) => onUpdate({ label: v })}
      placeholder="Text subtitlu..."
      style={{
        fontFamily: SANS,
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: "0.4em",
        textTransform: "uppercase",
        color: MUTED,
        margin: "0 0 10px",
      }}
    />
    <InlineEdit
      tag="p"
      editMode={editMode}
      value={block.content || "¡Muchas Gracias! · Mulțumim din suflet!"}
      onChange={(v) => onUpdate({ content: v })}
      placeholder="Text mulțumire..."
      style={{
        fontFamily: SCRIPT,
        fontSize: 32,
        color: textColorOverride || BROWN_D,
        lineHeight: 1.2,
      }}
    />
    {initials && (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 16,
          border: `1px solid ${BROWN_XL}`,
          padding: "8px 20px",
          borderRadius: 2,
        }}
      >
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 18,
            fontWeight: 300,
            color: BROWN,
          }}
        >
          {initials}
        </span>
      </div>
    )}
  </div>
);

// ─── Countdown dark section ────────────────────────────────────────────────────
function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

const CountdownSection: React.FC<{ date: string | undefined }> = ({ date }) => {
  const cd = useCountdown(date || "");
  if (!date || cd.expired) return null;
  const d = new Date(date);
  const monthNames = [
    "IAN",
    "FEB",
    "MAR",
    "APR",
    "MAI",
    "IUN",
    "IUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  return (
    <div
      style={{
        background: BROWN,
        borderRadius: 8,
        padding: "24px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          borderBottom: "0.5px solid rgba(255,255,255,0.15)",
          paddingBottom: 12,
        }}
      >
        <p
          style={{
            fontFamily: SANS,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            margin: 0,
          }}
        >
          {monthNames[d.getMonth()]}
        </p>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            margin: 0,
          }}
        >
          {d.toLocaleDateString("ro-RO", { weekday: "long" }).toUpperCase()}
        </p>
      </div>

      {/* Big date display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              width: 48,
              height: 0.5,
              background: "rgba(255,255,255,0.25)",
              marginBottom: 4,
            }}
          />
          <p
            style={{
              fontFamily: SANS,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: "rgba(255,255,255,0.35)",
              margin: 0,
            }}
          >
            {d.toLocaleDateString("ro-RO", { weekday: "short" }).toUpperCase()}
          </p>
        </div>
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 72,
            fontWeight: 300,
            color: "white",
            lineHeight: 0.9,
          }}
        >
          {d.getDate()}
        </span>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.25em",
              color: "rgba(255,255,255,0.35)",
              margin: 0,
            }}
          >
            {d.getFullYear()}
          </p>
          <div
            style={{
              width: 48,
              height: 0.5,
              background: "rgba(255,255,255,0.25)",
              marginTop: 4,
              marginLeft: "auto",
            }}
          />
        </div>
      </div>

      <p
        style={{
          fontFamily: SANS,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          margin: "0 0 14px",
        }}
      >
        FALTAN
      </p>

      {/* Counter digits */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        {[
          { val: cd.days, label: "ZILE" },
          { val: cd.hours, label: "ORE" },
          { val: cd.minutes, label: "MIN" },
          { val: cd.seconds, label: "SEC" },
        ].map(({ val, label }, i) => (
          <React.Fragment key={i}>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 42,
                  fontWeight: 300,
                  color: "white",
                  lineHeight: 1,
                  display: "block",
                  minWidth: 52,
                }}
              >
                {String(val).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 7,
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            </div>
            {i < 3 && (
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 38,
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1,
                  alignSelf: "flex-start",
                  padding: "0 2px",
                }}
              >
                :
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setVis(true), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.06 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const { ref, vis } = useReveal(delay);
  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.75s cubic-bezier(0.4,0,0.2,1), transform 0.75s cubic-bezier(0.4,0,0.2,1)`,
        transitionDelay: `${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Dividers ─────────────────────────────────────────────────────────────────
const WildDivider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        flex: 1,
        height: 0.5,
        background: `linear-gradient(to right, transparent, ${BROWN_XL})`,
      }}
    />
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[6, 8, 6].map((s, i) => (
        <div
          key={i}
          style={{
            width: s,
            height: s,
            borderRadius: "50%",
            background: BROWN_XL,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
    <div
      style={{
        flex: 1,
        height: 0.5,
        background: `linear-gradient(to left, transparent, ${BROWN_XL})`,
      }}
    />
  </div>
);

// ─── Block toolbar ────────────────────────────────────────────────────────────
const BlockToolbar = ({
  onUp,
  onDown,
  onToggle,
  onDelete,
  visible,
  isFirst,
  isLast,
}: any) => (
  <div
    className="absolute -top-3.5 right-2 flex items-center gap-0.5 rounded-full border shadow-lg px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto"
    style={{ background: IVORY, borderColor: `${BROWN_XL}` }}
  >
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onUp();
      }}
      disabled={isFirst}
      className="p-0.5 rounded-full disabled:opacity-20"
    >
      <ChevronUp className="w-3 h-3" style={{ color: BROWN }} />
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDown();
      }}
      disabled={isLast}
      className="p-0.5 rounded-full disabled:opacity-20"
    >
      <ChevronDown className="w-3 h-3" style={{ color: BROWN }} />
    </button>
    <div className="w-px h-3 mx-0.5" style={{ background: BROWN_XL }} />
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="p-0.5 rounded-full"
    >
      {visible ? (
        <Eye className="w-3 h-3" style={{ color: BROWN }} />
      ) : (
        <EyeOff className="w-3 h-3" style={{ color: MUTED }} />
      )}
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="p-0.5 rounded-full hover:bg-red-50"
    >
      <Trash2 className="w-3 h-3 text-red-400" />
    </button>
  </div>
);

// ─── Location card ────────────────────────────────────────────────────────────
const LocCard: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  textColorOverride?: string;
}> = ({ block, editMode, onUpdate, textColorOverride }) => {
  const { ref, vis } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        background: CREAM,
        border: `1px solid ${BROWN_XL}`,
        borderRadius: 8,
        padding: "20px 24px",
        textAlign: (block.blockAlign as any) || "center",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(18px)",
        transition:
          "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <MapPin
        className="w-6 h-6"
        style={{
          color: BROWN,
          opacity: 0.7,
          display: "block",
          margin: "0 auto 10px",
        }}
      />
      <InlineEdit
        tag="p"
        editMode={editMode}
        value={block.label || ""}
        onChange={(v) => onUpdate({ label: v })}
        placeholder="Eveniment..."
        style={{
          fontFamily: SANS,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: MUTED,
          margin: "0 0 8px",
          display: "block",
        }}
      />
      <InlineTime
        value={block.time || ""}
        onChange={(v) => onUpdate({ time: v })}
        editMode={editMode}
        style={{
          fontFamily: SERIF,
          fontSize: 22,
          fontWeight: 300,
          color: textColorOverride || BROWN_D,
          display: "block",
          marginBottom: 4,
        }}
      />
      <InlineEdit
        tag="p"
        editMode={editMode}
        value={block.locationName || ""}
        onChange={(v) => onUpdate({ locationName: v })}
        placeholder="Locație..."
        style={{
          fontFamily: SCRIPT,
          fontSize: 22,
          color: textColorOverride || BROWN_D,
          margin: "0 0 4px",
          display: "block",
        }}
      />
      <InlineEdit
        tag="p"
        editMode={editMode}
        value={block.locationAddress || ""}
        onChange={(v) => onUpdate({ locationAddress: v })}
        placeholder="Adresă..."
        multiline
        style={{
          fontFamily: SANS,
          fontSize: 11,
          color: textColorOverride || MUTED,
          margin: 0,
          lineHeight: 1.5,
        }}
      />
      {(block.wazeLink || editMode) && (
        <div style={{ marginTop: 12 }}>
          <InlineWaze
            value={block.wazeLink || ""}
            onChange={(v) => onUpdate({ wazeLink: v })}
            editMode={editMode}
          />
        </div>
      )}
    </div>
  );
};

// ─── Intro animation ──────────────────────────────────────────────────────────
const TerraIntro: React.FC<{
  name1: string;
  name2: string;
  date: string;
  onDone: () => void;
}> = ({ name1, name2, date, onDone }) => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 1700),
      setTimeout(() => setPhase(5), 2300),
      setTimeout(() => setPhase(6), 3100),
      setTimeout(onDone, 3800),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: BROWN,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: phase === 6 ? 0 : 1,
        transition: phase === 6 ? "opacity 0.7s ease-in" : "none",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes tb-name-in { from{opacity:0;transform:translateY(16px);filter:blur(8px)} to{opacity:1;transform:translateY(0);filter:blur(0)} }
        @keyframes tb-flower { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        @keyframes tb-sparkle { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.7;transform:scale(1.5)} }
      `}</style>

      {/* Top wildflowers */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "scale(1)" : "scale(0.7)",
          transformOrigin: "top left",
          transition:
            "opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <Wildflowers />
      </div>
      {/* Bottom right wildflowers */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "scale(1)" : "scale(0.7)",
          transformOrigin: "bottom right",
          transition:
            "opacity 0.8s 0.15s cubic-bezier(0.22,1,0.36,1), transform 0.8s 0.15s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <Wildflowers flip />
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "0 40px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Serif intro label */}
        <p
          style={{
            fontFamily: SANS,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.42em",
            color: "rgba(255,255,255,0.45)",
            textTransform: "uppercase",
            margin: "0 0 16px",
            opacity: phase >= 2 ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          nos casamos
        </p>

        {/* Names */}
        <h1
          style={{
            fontFamily: SCRIPT,
            fontSize: 64,
            lineHeight: 1.1,
            color: "white",
            margin: 0,
            animation:
              phase >= 2
                ? "tb-name-in 1.2s cubic-bezier(0.4,0,0.2,1) both"
                : "none",
            textShadow: "0 2px 24px rgba(0,0,0,0.15)",
          }}
        >
          {name1}{" "}
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 44,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            &
          </span>{" "}
          {name2}
        </h1>

        {/* Date */}
        <p
          style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.35em",
            color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase",
            marginTop: 20,
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(8px)",
            transition:
              "opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s",
          }}
        >
          {date}
        </p>

        {/* Gold line */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 18,
            opacity: phase >= 4 ? 1 : 0,
            transition: "opacity 0.5s 0.3s",
          }}
        >
          <div
            style={{
              width: 40,
              height: 0.6,
              background: "rgba(255,255,255,0.3)",
              alignSelf: "center",
            }}
          />
          <div
            style={{
              width: 6,
              height: 6,
              background: "rgba(255,255,255,0.4)",
              transform: "rotate(45deg)",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              width: 40,
              height: 0.6,
              background: "rgba(255,255,255,0.3)",
              alignSelf: "center",
            }}
          />
        </div>
      </div>

      {/* Sparkles */}
      {[
        [15, 20],
        [85, 15],
        [8, 75],
        [92, 68],
        [50, 10],
      ].map(([px, py], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${px}%`,
            top: `${py}%`,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.4)",
            opacity: phase >= 3 ? 1 : 0,
            transition: `opacity 0.4s ${0.6 + i * 0.1}s`,
            animation:
              phase >= 3
                ? `tb-sparkle ${2 + i * 0.4}s ease-in-out infinite ${i * 0.3}s`
                : "none",
          }}
        />
      ))}
    </div>
  );
};

// ─── Main Template ─────────────────────────────────────────────────────────────
// ─── Timeline icons imported from TimelineIcons.tsx ────────────────────────────

export type TerraBohoProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const TerraBohoTemplate: React.FC<TerraBohoProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introPreview = false,
  onProfileUpdate,
  onBlocksUpdate,
  onBlockSelect,
  selectedBlockId,
}) => {
  const { profile, guest } = data;
  const [showIntro, setShowIntro] = useState(!editMode || introPreview);
  const [contentVis, setContentVis] = useState(editMode && !introPreview);

  useEffect(() => {
    if (editMode) {
      if (introPreview) { setShowIntro(true); setContentVis(false); }
      else { setShowIntro(false); setContentVis(true); }
    } else {
      setShowIntro(true);
      setContentVis(false);
    }
  }, [editMode, introPreview]);

  const safeJSON = (s: string | undefined, fb: any) => {
    try {
      return s ? JSON.parse(s) : fb;
    } catch {
      return fb;
    }
  };

  const [blocks, setBlocks] = useState<InvitationBlock[]>(() =>
    safeJSON(profile.customSections, []),
  );
  const [godparents, setGodparents] = useState<any[]>(() =>
    safeJSON(profile.godparents, []),
  );
  const [parentsData, setParentsData] = useState<any>(() =>
    safeJSON(profile.parents, {}),
  );

  useEffect(() => {
    setBlocks((prev) => {
      const incoming: InvitationBlock[] = safeJSON(profile.customSections, []);
      // Preserve any imageData that exists locally but hasn't propagated to the saved profile yet
      // (race condition: upload finishes → local state updated → save debounce still pending)
      return incoming.map((b) => {
        if (b.type === "photo" && !b.imageData) {
          const local = prev.find((pb) => pb.id === b.id);
          if (local?.imageData) return { ...b, imageData: local.imageData };
        }
        return b;
      });
    });
  }, [profile.customSections]);
  useEffect(() => {
    setGodparents(safeJSON(profile.godparents, []));
  }, [profile.godparents]);
  useEffect(() => {
    setParentsData(safeJSON(profile.parents, {}));
  }, [profile.parents]);

  const _pq = useRef<Record<string, any>>({});
  const _pt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const _bt = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upProfile = useCallback(
    (field: string, value: any) => {
      _pq.current = { ..._pq.current, [field]: value };
      if (_pt.current) clearTimeout(_pt.current);
      _pt.current = setTimeout(() => {
        onProfileUpdate?.(_pq.current);
        _pq.current = {};
      }, 500);
    },
    [onProfileUpdate],
  );

  const debBlocks = useCallback(
    (nb: InvitationBlock[]) => {
      if (_bt.current) clearTimeout(_bt.current);
      _bt.current = setTimeout(() => onBlocksUpdate?.(nb), 600);
    },
    [onBlocksUpdate],
  );

  // For photos, save quickly — URL is just a short string, not base64 anymore
  const debBlocksPhoto = useCallback(
    (nb: InvitationBlock[]) => {
      if (_bt.current) clearTimeout(_bt.current);
      _bt.current = setTimeout(() => onBlocksUpdate?.(nb), 100);
    },
    [onBlocksUpdate],
  );

  const updBlock = useCallback(
    (idx: number, patch: Partial<InvitationBlock>) => {
      setBlocks((prev) => {
        const nb = prev.map((b, i) => (i === idx ? { ...b, ...patch } : b));
        // Use longer debounce if it's a photo update
        const hasImage = "imageData" in patch;
        if (hasImage) debBlocksPhoto(nb);
        else debBlocks(nb);
        return nb;
      });
    },
    [debBlocks, debBlocksPhoto],
  );

  const movBlock = useCallback(
    (idx: number, dir: -1 | 1) => {
      setBlocks((prev) => {
        const nb = [...prev];
        const to = idx + dir;
        if (to < 0 || to >= nb.length) return prev;
        [nb[idx], nb[to]] = [nb[to], nb[idx]];
        onBlocksUpdate?.(nb);
        return nb;
      });
    },
    [onBlocksUpdate],
  );
  const delBlock = useCallback(
    (idx: number) => {
      setBlocks((prev) => {
        const block = prev[idx];
        // Dacă blocul are o poză uploadată, o ștergem de pe server
        if (block?.type === "photo" && block.imageData) {
          deleteUploadedFile(block.imageData);
        }
        const nb = prev.filter((_, i) => i !== idx);
        onBlocksUpdate?.(nb);
        return nb;
      });
    },
    [onBlocksUpdate],
  );
  const addBlock = useCallback(
    (type: string, def: any) => {
      setBlocks((prev) => {
        const nb = [
          ...prev,
          {
            id: Date.now().toString(),
            type: type as InvitationBlockType,
            show: true,
            ...def,
          },
        ];
        onBlocksUpdate?.(nb);
        return nb;
      });
    },
    [onBlocksUpdate],
  );

  const updGodparent = (i: number, f: "godfather" | "godmother", v: string) => {
    setGodparents((prev) => {
      const ng = prev.map((g, j) => (j === i ? { ...g, [f]: v } : g));
      upProfile("godparents", JSON.stringify(ng));
      return ng;
    });
  };
  const addGodparent = () =>
    setGodparents((prev) => {
      const ng = [...prev, { godfather: "", godmother: "" }];
      upProfile("godparents", JSON.stringify(ng));
      return ng;
    });
  const delGodparent = (i: number) =>
    setGodparents((prev) => {
      const ng = prev.filter((_, j) => j !== i);
      upProfile("godparents", JSON.stringify(ng));
      return ng;
    });
  const updParent = (field: string, val: string) =>
    setParentsData((prev: any) => {
      const np = { ...prev, [field]: val };
      upProfile("parents", JSON.stringify(np));
      return np;
    });

  const name1 = profile.partner1Name || "Camila";
  const name2 = profile.partner2Name || "Sebastián";
  const isBaptism =
    profile.eventType === "baptism" || profile.eventType === "kids";
  const showRsvp = profile.showRsvpButton !== false;
  const rsvpText = profile.rsvpButtonText?.trim() || "Confirmă Prezența";
  const displayBlocks = editMode
    ? blocks
    : blocks.filter((b) => b.show !== false);

  const initials = isBaptism
    ? (name1[0] || "").toUpperCase()
    : `${(name1[0] || "").toUpperCase()} | ${(name2[0] || "").toUpperCase()}`;

  const d = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const dateStrShort = d
    ? `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
    : "DD.MM.YYYY";
  const dateStrFull = d
    ? d.toLocaleDateString("ro-RO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Data Evenimentului";

  // Block add configs
  const BLOCK_TYPES = [
    {
      type: "photo",
      label: "📷 Fotografie",
      def: {
        imageData: undefined,
        altText: "Fotografie",
        photoClip: "rect",
        photoMasks: [],
      },
    },
    {
      type: "location",
      label: "Locație",
      def: { label: "", time: "", locationName: "", locationAddress: "" },
    },
    {
      type: "godparents",
      label: "Nași",
      def: { sectionTitle: "Nașii Noștri", content: "" },
    },
    {
      type: "parents",
      label: "Părinți",
      def: { sectionTitle: "Părinții Noștri", content: "" },
    },
    { type: "calendar", label: "📅 Calendar", def: {} },
    { type: "countdown", label: "⏱ Countdown", def: {} },
    {
      type: "music",
      label: "🎵 Muzică",
      def: { musicTitle: "", musicArtist: "" },
    },
    {
      type: "dresscode",
      label: "Dress Code",
      def: { sectionTitle: "Cod vestimentar", label: "Elegant", content: "" },
    },
    {
      type: "gift",
      label: "🎁 Cadouri",
      def: {
        sectionTitle: "Sugestie cadou",
        content: "",
        iban: "",
        ibanName: "",
      },
    },
    {
      type: "nokids",
      label: "Fără copii",
      def: { sectionTitle: "Eveniment fără copii", content: "" },
    },
    { type: "quote", label: "Citat", def: { content: "" } },
    {
      type: "thankyou",
      label: "Mulțumire",
      def: { content: "¡Muchas Gracias! · Mulțumim!", label: "" },
    },
    { type: "text", label: "Text", def: { content: "" } },
    { type: "title", label: "Titlu", def: { content: "" } },
    { type: "divider", label: "Linie", def: {} },
  ];

  return (
    <>
      <style>{`
        @keyframes tb-name-reveal { from{opacity:0;filter:blur(10px);transform:translateY(8px)} to{opacity:1;filter:blur(0);transform:translateY(0)} }
        @keyframes tb-sparkle { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.7;transform:scale(1.5)} }
        @keyframes tb-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>

      {showIntro && (
        <TerraIntro
          name1={name1}
          name2={name2}
          date={dateStrShort}
          onDone={() => {
            setShowIntro(false);
            setTimeout(() => setContentVis(true), 60);
          }}
        />
      )}

      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${IVORY} 0%, ${CREAM} 60%, ${IVORY} 100%)`,
          fontFamily: SANS,
          position: "relative",
          overflow: "hidden",
          opacity: contentVis ? 1 : 0,
          transform: contentVis ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s",
          paddingTop: editMode ? 56 : 0,
        }}
      >
        {/* Paper grain */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.028'/%3E%3C/svg%3E")`,
            opacity: 0.8,
          }}
        />

        {/* Wildflowers fixed bg */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.35,
          }}
        >
          <Wildflowers />
        </div>
        <div
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.3,
          }}
        >
          <Wildflowers flip />
        </div>

        {editMode && (
          <div
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-1.5 shadow-lg text-[10px] font-bold pointer-events-none select-none"
            style={{
              background: IVORY,
              border: `1px solid ${BROWN_XL}`,
              color: BROWN_D,
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: BROWN }}
            />
            <span className="uppercase tracking-widest">Editare Directă</span>
            <span className="font-normal" style={{ color: MUTED }}>
              — click pe orice text
            </span>
          </div>
        )}

        <div
          style={{
            maxWidth: 460,
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
            padding: "0 20px 56px",
          }}
        >
          {/* ── HERO ── */}
          <div
            style={{
              textAlign: "center",
              padding: editMode ? "24px 0 32px" : "52px 0 32px",
            }}
          >
            {/* Envelope-style header — selectable in edit mode */}
            <div
              onClick={
                editMode
                  ? (e) => {
                      e.stopPropagation();
                    }
                  : undefined
              }
              style={{
                background: profile.heroBgColor || BROWN,
                borderRadius: 8,
                padding: "32px 28px 28px",
                marginBottom: 0,
                position: "relative",
                overflow: "hidden",
                cursor: editMode ? "pointer" : "default",
                outline:
                  editMode && selectedBlockId === "__hero__"
                    ? "2px solid #c9a07a"
                    : "2px solid transparent",
                outlineOffset: 3,
                transition: "outline-color 0.1s",
              }}
            >
              {editMode && selectedBlockId !== "__hero__" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    zIndex: 10,
                    background: "rgba(0,0,0,0.55)",
                    color: "white",
                    borderRadius: 99,
                    padding: "2px 8px",
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: "system-ui",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    pointerEvents: "none",
                    opacity: 0,
                    transition: "opacity 0.1s",
                  }}
                  className="hero-style-hint"
                >
                  Stil
                </div>
              )}
              {/* Envelope flap shape */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  background: BROWN_D,
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  opacity: 0.4,
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Wildflowers small top */}
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    left: -20,
                    opacity: 0.4,
                    pointerEvents: "none",
                  }}
                >
                  <Wildflowers scale={0.55} />
                </div>

                <BlockStyleProvider
                  value={{
                    fontFamily: profile.heroFontFamily,
                    fontSize: profile.heroNameSize,
                    letterSpacing: (profile as any).heroLetterSpacing,
                    lineHeight: (profile as any).heroLineHeight,
                    textColor: profile.heroTextColor || "white",
                    textAlign: (profile.heroAlign as any) || "center",
                  }}
                >
                  <InlineEdit
                    tag="h1"
                    editMode={editMode}
                    value={profile.partner1Name || ""}
                    onChange={(v) => upProfile("partner1Name", v)}
                    placeholder="Camila"
                    style={{
                      fontFamily: profile.heroFontFamily || SCRIPT,
                      fontSize: profile.heroNameSize
                        ? profile.heroNameSize
                        : 62,
                      lineHeight: 1.0,
                      color: profile.heroTextColor || "white",
                      display: "block",
                      margin: "16px 0 0",
                      textAlign: (profile.heroAlign as any) || "center",
                      animation:
                        !editMode && contentVis
                          ? "tb-name-reveal 1.2s cubic-bezier(0.4,0,0.2,1) 0.15s both"
                          : "none",
                      textShadow: "0 2px 24px rgba(0,0,0,0.15)",
                    }}
                  />

                  {!isBaptism && (
                    <>
                      <span
                        style={{
                          fontFamily: SERIF,
                          fontSize: 36,
                          fontStyle: "italic",
                          color: "rgba(255,255,255,0.55)",
                          display: "block",
                          lineHeight: 1,
                          animation: contentVis
                            ? "tb-name-reveal 0.8s ease-out 0.4s both"
                            : "none",
                        }}
                      >
                        &
                      </span>
                      <InlineEdit
                        tag="h1"
                        editMode={editMode}
                        value={profile.partner2Name || ""}
                        onChange={(v) => upProfile("partner2Name", v)}
                        placeholder="Sebastián"
                        style={{
                          fontFamily: profile.heroFontFamily || SCRIPT,
                          fontSize: profile.heroNameSize
                            ? profile.heroNameSize
                            : 62,
                          lineHeight: 1.0,
                          color: profile.heroTextColor || "white",
                          display: "block",
                          textAlign: (profile.heroAlign as any) || "center",
                          animation:
                            !editMode && contentVis
                              ? "tb-name-reveal 1.2s cubic-bezier(0.4,0,0.2,1) 0.35s both"
                              : "none",
                          textShadow: "0 2px 24px rgba(0,0,0,0.15)",
                        }}
                      />
                    </>
                  )}
                </BlockStyleProvider>

                <div
                  style={{
                    width: 40,
                    height: 0.5,
                    background: "rgba(255,255,255,0.25)",
                    margin: "16px auto 12px",
                  }}
                />

                {editMode ? (
                  <input
                    type="date"
                    value={
                      profile.weddingDate
                        ? new Date(profile.weddingDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) => upProfile("weddingDate", e.target.value)}
                    style={{
                      fontFamily: SANS,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.25em",
                      color: "rgba(255,255,255,0.55)",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.2)",
                      outline: "none",
                      textAlign: "center",
                      cursor: "pointer",
                      display: "block",
                      margin: "0 auto",
                      width: "auto",
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.25em",
                      color: "rgba(255,255,255,0.55)",
                      margin: 0,
                    }}
                  >
                    {dateStrShort}
                  </p>
                )}
              </div>
            </div>

            {/* Monogram badge */}
            <Reveal delay={300}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  margin: "24px 0",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: `1px solid ${BROWN_XL}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 3 L10 17 M6 7 Q10 3 14 7"
                      stroke={BROWN}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <ellipse
                      cx="10"
                      cy="12"
                      rx="3.5"
                      ry="4"
                      stroke={BROWN}
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 22,
                    fontWeight: 300,
                    color: BROWN_D,
                    margin: 0,
                  }}
                >
                  {initials}
                </p>
                {profile.showWelcomeText && (
                  <InlineEdit
                    tag="p"
                    editMode={editMode}
                    value={
                      profile.welcomeText?.trim() ||
                      "Nos complace anunciar nuestro matrimonio y queremos compartir contigo este momento."
                    }
                    onChange={(v) => upProfile("welcomeText", v)}
                    placeholder="Text introductiv..."
                    multiline
                    style={{
                      fontFamily: SERIF,
                      fontSize: 13,
                      fontStyle: "italic",
                      color: MUTED,
                      lineHeight: 1.8,
                      textAlign: "center",
                      maxWidth: 320,
                    }}
                  />
                )}
              </div>
            </Reveal>

            {/* Guest badge */}
            {guest?.name && (
              <Reveal delay={350}>
                <div
                  style={{
                    display: "inline-block",
                    border: `1px solid ${BROWN_XL}`,
                    borderRadius: 2,
                    padding: "12px 24px",
                    marginBottom: 8,
                  }}
                >
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: "0.42em",
                      textTransform: "uppercase",
                      color: MUTED,
                      margin: "0 0 5px",
                    }}
                  >
                    Dragă
                  </p>
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontSize: 20,
                      fontWeight: 300,
                      fontStyle: "italic",
                      color: TEXT,
                      margin: 0,
                    }}
                  >
                    {guest.name}
                  </p>
                </div>
              </Reveal>
            )}
          </div>

          {/* ── BLOCKS ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayBlocks.map((block, displayIdx) => {
              const isVisible = block.show !== false;
              const realIdx = blocks.indexOf(block);

              const isSelected =
                editMode &&
                block.type === "photo" &&
                selectedBlockId === block.id;
              return (
                <div
                  key={block.id}
                  className={cn(
                    "relative group/block",
                    !isVisible && editMode && "opacity-30",
                  )}
                  onClick={
                    editMode
                      ? (e) => {
                          e.stopPropagation();
                          if (block.type === "photo")
                            onBlockSelect?.(block, realIdx);
                        }
                      : undefined
                  }
                  style={
                    {
                      cursor: editMode ? "pointer" : "default",
                      outline: isSelected
                        ? "2px solid #c9a07a"
                        : editMode
                          ? "1px dashed transparent"
                          : "none",
                      outlineOffset: "3px",
                      borderRadius: block.blockRadius
                        ? `${block.blockRadius}px`
                        : undefined,
                      marginTop:
                        block.blockMarginTop != null
                          ? `${block.blockMarginTop}px`
                          : undefined,
                      marginBottom:
                        block.blockMarginBottom != null
                          ? `${block.blockMarginBottom}px`
                          : undefined,
                      paddingTop:
                        block.blockPaddingTop != null
                          ? `${block.blockPaddingTop}px`
                          : undefined,
                      paddingBottom:
                        block.blockPaddingBottom != null
                          ? `${block.blockPaddingBottom}px`
                          : undefined,
                      paddingLeft:
                        block.blockPaddingH != null
                          ? `${block.blockPaddingH}px`
                          : undefined,
                      paddingRight:
                        block.blockPaddingH != null
                          ? `${block.blockPaddingH}px`
                          : undefined,
                      background:
                        block.bgColor && block.bgColor !== "transparent"
                          ? block.bgColor
                          : undefined,
                      opacity:
                        block.opacity != null && block.opacity !== 100
                          ? block.opacity / 100
                          : undefined,
                      textAlign: (block.blockAlign as any) || undefined,
                      fontFamily: block.blockFontFamily || undefined,
                      fontWeight: block.blockFontWeight || undefined,
                      fontStyle: block.blockFontStyle || undefined,
                      fontSize: block.blockFontSize
                        ? `${block.blockFontSize}px`
                        : undefined,
                      lineHeight: block.blockLineHeight
                        ? `${block.blockLineHeight / 100}`
                        : undefined,
                      letterSpacing: block.blockLetterSpacing
                        ? `${block.blockLetterSpacing / 100}em`
                        : undefined,
                      transition: "outline-color 0.1s",
                      "--block-text":
                        block.textColor && block.textColor !== "transparent"
                          ? block.textColor
                          : undefined,
                      "--block-bg":
                        block.bgColor && block.bgColor !== "transparent"
                          ? block.bgColor
                          : undefined,
                      "--block-font": block.blockFontFamily || undefined,
                      "--block-size": block.blockFontSize
                        ? `${block.blockFontSize}px`
                        : undefined,
                      "--block-align": block.blockAlign || undefined,
                    } as React.CSSProperties
                  }
                >
                  <BlockStyleProvider
                    value={
                      {
                        blockId: block.id,
                        textStyles: block.textStyles,
                        onTextSelect: (textKey, textLabel) => onBlockSelect?.(block, realIdx, textKey, textLabel),
                        fontFamily: block.blockFontFamily,
                        fontSize: block.blockFontSize,
                        letterSpacing: block.blockLetterSpacing,
                        lineHeight: block.blockLineHeight,
                        textColor:
                          block.textColor && block.textColor !== "transparent"
                            ? block.textColor
                            : undefined,
                        textAlign: block.blockAlign,
                      } as BlockStyle
                    }
                  >
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
                    {/* Style hint pill — only for photo blocks */}
                    {editMode && block.type === "photo" && (
                      <div className="absolute bottom-1 right-1 opacity-0 group-hover/block:opacity-100 transition-opacity duration-100 pointer-events-none z-10">
                        <div
                          style={{
                            background: isSelected
                              ? "#8b6355"
                              : "rgba(0,0,0,0.55)",
                            color: "white",
                            borderRadius: 99,
                            padding: "2px 8px",
                            fontSize: 9,
                            fontWeight: 700,
                            fontFamily: "system-ui",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            backdropFilter: "blur(4px)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          <svg
                            width="9"
                            height="9"
                            viewBox="0 0 9 9"
                            fill="none"
                          >
                            <circle
                              cx="4.5"
                              cy="4.5"
                              r="3.5"
                              stroke="white"
                              strokeWidth="1"
                            />
                            <path
                              d="M4.5 2.5v2l1.5 1"
                              stroke="white"
                              strokeWidth="1"
                              strokeLinecap="round"
                            />
                          </svg>
                          {isSelected ? "Activ →" : "Stil"}
                        </div>
                      </div>
                    )}

                    {/* ── PHOTO BLOCK ── */}
                    {block.type === "photo" && (
                      <Reveal>
                        <PhotoBlock
                          imageData={block.imageData}
                          altText={block.altText}
                          editMode={editMode}
                          onUpload={(data) =>
                            updBlock(realIdx, { imageData: data })
                          }
                          onRemove={() =>
                            updBlock(realIdx, { imageData: undefined })
                          }
                          onRatioChange={(r) =>
                            updBlock(realIdx, { aspectRatio: r })
                          }
                          onClipChange={(cl) =>
                            updBlock(realIdx, { photoClip: cl })
                          }
                          onMasksChange={(ms) =>
                            updBlock(realIdx, { photoMasks: ms } as any)
                          }
                          aspectRatio={block.aspectRatio || "free"}
                          photoClip={(block.photoClip as any) || "rect"}
                          photoMasks={(block.photoMasks as any) || []}
                          placeholder="Adaugă fotografie"
                          placeholderInitial1={name1[0]}
                          placeholderInitial2={name2[0]}
                          placeholderVariant={realIdx % 4}
                        />
                      </Reveal>
                    )}

                    {/* LOCATION */}
                    {block.type === "location" && (
                      <LocCard
                        block={block}
                        editMode={editMode}
                        onUpdate={(p) => updBlock(realIdx, p)}
                        textColorOverride={block.textColor}
                      />
                    )}

                    {/* CALENDAR */}
                    {block.type === "calendar" && (
                      <Reveal>
                        <CalendarMonth date={profile.weddingDate} />
                      </Reveal>
                    )}

                    {/* COUNTDOWN */}
                    {block.type === "countdown" && (
                      <Reveal>
                        <CountdownSection date={profile.weddingDate} />
                      </Reveal>
                    )}

                    {/* MUSIC */}
                    {block.type === "music" && (
                      <Reveal>
                        <MusicPlayer
                          title={block.musicTitle || ""}
                          artist={block.musicArtist || ""}
                          musicUrl={block.musicUrl || ""}
                          musicType={block.musicType || "none"}
                          editMode={editMode}
                          onTitleChange={(v) =>
                            updBlock(realIdx, { musicTitle: v })
                          }
                          onArtistChange={(v) =>
                            updBlock(realIdx, { musicArtist: v })
                          }
                          onUrlChange={(url, type) =>
                            updBlock(realIdx, {
                              musicUrl: url,
                              musicType: type,
                            })
                          }
                        />
                      </Reveal>
                    )}

                    {/* DRESS CODE */}
                    {block.type === "dresscode" && (
                      <Reveal>
                        <DressCodeBlock
                          block={block}
                          editMode={editMode}
                          onUpdate={(p) => updBlock(realIdx, p)}
                          textColorOverride={block.textColor}
                        />
                      </Reveal>
                    )}

                    {/* GIFT */}
                    {block.type === "gift" && (
                      <Reveal>
                        <GiftBlock
                          block={block}
                          editMode={editMode}
                          onUpdate={(p) => updBlock(realIdx, p)}
                          textColorOverride={block.textColor}
                        />
                      </Reveal>
                    )}

                    {/* NO KIDS */}
                    {block.type === "nokids" && (
                      <Reveal>
                        <NoKidsBlock
                          block={block}
                          editMode={editMode}
                          onUpdate={(p) => updBlock(realIdx, p)}
                          textColorOverride={block.textColor}
                        />
                      </Reveal>
                    )}

                    {/* QUOTE */}
                    {block.type === "quote" && (
                      <Reveal>
                        <QuoteBlock
                          block={block}
                          editMode={editMode}
                          onUpdate={(p) => updBlock(realIdx, p)}
                          textColorOverride={block.textColor}
                        />
                      </Reveal>
                    )}

                    {/* THANK YOU */}
                    {block.type === "thankyou" && (
                      <Reveal>
                        <ThankyouBlock
                          block={block}
                          editMode={editMode}
                          onUpdate={(p) => updBlock(realIdx, p)}
                          initials={initials}
                          textColorOverride={block.textColor}
                        />
                      </Reveal>
                    )}

                    {/* GODPARENTS */}
                    {block.type === "godparents" && (
                      <Reveal>
                        <div
                          style={{
                            background: CREAM,
                            border: `1px solid ${BROWN_XL}`,
                            borderRadius: 8,
                            padding: "20px 24px",
                            textAlign: (block.blockAlign as any) || "center",
                          }}
                        >
                          <Heart
                            className="w-5 h-5"
                            style={{
                              color: BROWN,
                              opacity: 0.6,
                              display: "block",
                              margin: "0 auto 8px",
                            }}
                          />
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.sectionTitle || "Nașii Noștri"}
                            onChange={(v) =>
                              updBlock(realIdx, { sectionTitle: v })
                            }
                            placeholder="Titlu..."
                            style={{
                              fontFamily: SCRIPT,
                              fontSize: 22,
                              color: BROWN_D,
                              margin: "0 0 6px",
                              display: "block",
                            }}
                          />
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.content || ""}
                            onChange={(v) => updBlock(realIdx, { content: v })}
                            placeholder="Text introductiv..."
                            multiline
                            style={{
                              fontFamily: SERIF,
                              fontSize: 12,
                              fontStyle: "italic",
                              color: MUTED,
                              margin: "0 0 12px",
                              lineHeight: 1.7,
                              display: "block",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            {godparents.map((g: any, i: number) => (
                              <div
                                key={i}
                                className={cn(
                                  "flex items-center justify-center gap-2",
                                  editMode && "group/gp",
                                )}
                              >
                                <InlineEdit
                                  tag="span"
                                  editMode={editMode}
                                  value={g.godfather || ""}
                                  onChange={(v) =>
                                    updGodparent(i, "godfather", v)
                                  }
                                  placeholder="Naș"
                                  style={{
                                    fontFamily: SERIF,
                                    fontSize: 17,
                                    fontWeight: 300,
                                    color: block.textColor || TEXT,
                                  }}
                                />
                                <span
                                  style={{
                                    color: BROWN,
                                    fontFamily: SERIF,
                                    fontStyle: "italic",
                                    margin: "0 6px",
                                  }}
                                >
                                  &
                                </span>
                                <InlineEdit
                                  tag="span"
                                  editMode={editMode}
                                  value={g.godmother || ""}
                                  onChange={(v) =>
                                    updGodparent(i, "godmother", v)
                                  }
                                  placeholder="Nașă"
                                  style={{
                                    fontFamily: SERIF,
                                    fontSize: 17,
                                    fontWeight: 300,
                                    color: block.textColor || TEXT,
                                  }}
                                />
                                {editMode && (
                                  <button
                                    type="button"
                                    onClick={() => delGodparent(i)}
                                    className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                  </button>
                                )}
                              </div>
                            ))}
                            {editMode && (
                              <button
                                type="button"
                                onClick={addGodparent}
                                className="text-[10px] font-bold border border-dashed rounded-full px-2 py-0.5 flex items-center gap-1 mx-auto"
                                style={{ color: BROWN, borderColor: BROWN_XL }}
                              >
                                <Plus className="w-2.5 h-2.5" /> adaugă
                              </button>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    )}

                    {/* PARENTS */}
                    {block.type === "parents" && (
                      <Reveal>
                        <div
                          style={{
                            background: CREAM,
                            border: `1px solid ${BROWN_XL}`,
                            borderRadius: 8,
                            padding: "20px 24px",
                            textAlign: (block.blockAlign as any) || "center",
                          }}
                        >
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.sectionTitle || "Părinții Noștri"}
                            onChange={(v) =>
                              updBlock(realIdx, { sectionTitle: v })
                            }
                            placeholder="Titlu..."
                            style={{
                              fontFamily: SCRIPT,
                              fontSize: 22,
                              color: BROWN_D,
                              margin: "0 0 6px",
                              display: "block",
                            }}
                          />
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.content || ""}
                            onChange={(v) => updBlock(realIdx, { content: v })}
                            placeholder="Text introductiv..."
                            multiline
                            style={{
                              fontFamily: SERIF,
                              fontSize: 12,
                              fontStyle: "italic",
                              color: MUTED,
                              margin: "0 0 12px",
                              lineHeight: 1.7,
                              display: "block",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              alignItems: "center",
                            }}
                          >
                            {(
                              [
                                { key: "p1_father", ph: "Tatăl Miresei" },
                                { key: "p1_mother", ph: "Mama Miresei" },
                                { key: "p2_father", ph: "Tatăl Mirelui" },
                                { key: "p2_mother", ph: "Mama Mirelui" },
                              ] as const
                            ).map(({ key, ph }) => {
                              const val = parentsData?.[key];
                              if (!val && !editMode) return null;
                              return (
                                <InlineEdit
                                  key={key}
                                  tag="p"
                                  editMode={editMode}
                                  value={val || ""}
                                  onChange={(v) => updParent(key, v)}
                                  placeholder={ph}
                                  style={{
                                    fontFamily: SERIF,
                                    fontSize: 15,
                                    fontWeight: 300,
                                    color: TEXT,
                                    margin: "1px 0",
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </Reveal>
                    )}

                    {/* TEXT */}
                    {block.type === "text" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "6px 0" }}>
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.content || ""}
                            onChange={(v) => updBlock(realIdx, { content: v })}
                            placeholder="Text liber..."
                            multiline
                            style={{
                              fontFamily: SERIF,
                              fontSize: 14,
                              fontStyle: "italic",
                              color: MUTED,
                              lineHeight: 1.85,
                            }}
                          />
                        </div>
                      </Reveal>
                    )}

                    {/* TITLE */}
                    {block.type === "title" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "4px 0" }}>
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.content || ""}
                            onChange={(v) => updBlock(realIdx, { content: v })}
                            placeholder="Titlu secțiune..."
                            style={{
                              fontFamily: SANS,
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.42em",
                              textTransform: "uppercase",
                              color: BROWN,
                            }}
                          />
                        </div>
                      </Reveal>
                    )}

                    {block.type === "divider" && (
                      <Reveal>
                        <WildDivider />
                      </Reveal>
                    )}
                    {block.type === "spacer" && <div style={{ height: 16 }} />}
                  </BlockStyleProvider>
                </div>
              );
            })}
          </div>

          {/* ── ADD BLOCK STRIP ── */}
          {editMode && (
            <div
              style={{
                marginTop: 16,
                padding: "16px",
                border: `2px dashed ${BROWN_XL}`,
                borderRadius: 8,
                background: `${CREAM}88`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: MUTED,
                  marginBottom: 12,
                }}
              >
                Adaugă bloc
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {BLOCK_TYPES.map(({ type, label, def }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type, def)}
                    style={{
                      padding: "5px 12px",
                      border: `1px solid ${BROWN_XL}`,
                      borderRadius: 99,
                      fontFamily: SANS,
                      fontSize: 10,
                      fontWeight: 700,
                      background: type === "photo" ? BROWN : "transparent",
                      color: type === "photo" ? "white" : BROWN_D,
                      cursor: "pointer",
                    }}
                  >
                    + {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {profile.showTimeline &&
            (() => {
              const timeline = safeJSON(profile.timeline, []);
              if (!timeline.length) return null;
              return (
                <Reveal style={{ marginTop: 10 }}>
                  <div
                    style={{
                      background: CREAM,
                      border: `1px solid ${BROWN_XL}`,
                      borderRadius: 8,
                      padding: "20px 24px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: SANS,
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: "0.42em",
                        textTransform: "uppercase",
                        color: BROWN,
                        textAlign: "center",
                        margin: "0 0 16px",
                      }}
                    >
                      Programul Zilei
                    </p>
                    {timeline.map((item: any, i: number) => (
                      <div
                        key={item.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "58px 52px 1fr",
                          alignItems: "stretch",
                          minHeight: 64,
                        }}
                      >
                        {/* ── Time column ── */}
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
                              color: BROWN,
                              lineHeight: 1.2,
                            }}
                          >
                            {item.time}
                          </span>
                        </div>

                        {/* ── Spine: big icon circle + connector line ── */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          {/* Icon bubble */}
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: "50%",
                              background: IVORY,
                              border: `1.5px solid ${BROWN_XL}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              boxShadow: `0 2px 8px rgba(0,0,0,0.06)`,
                            }}
                          >
                            <WeddingIcon
                              iconKey={item.icon || "party"}
                              size={24}
                              color={BROWN}
                            />
                          </div>
                          {/* Connector line */}
                          {i < timeline.length - 1 && (
                            <div
                              style={{
                                flex: 1,
                                width: 1,
                                background: `linear-gradient(to bottom, ${BROWN_XL}, transparent)`,
                                marginTop: 4,
                                marginBottom: 0,
                              }}
                            />
                          )}
                        </div>

                        {/* ── Content: title + notice ── */}
                        <div
                          style={{
                            paddingLeft: 12,
                            paddingTop: 10,
                            paddingBottom: i < timeline.length - 1 ? 20 : 0,
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
                                color: BROWN,
                                display: "block",
                                marginTop: 4,
                                opacity: 0.75,
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

          {/* RSVP */}
          {showRsvp && (
            <Reveal style={{ marginTop: 16 }}>
              <div style={{ textAlign: "center" }}>
                <WildDivider />
                <div style={{ marginTop: 20 }}>
                  {editMode ? (
                    <div
                      style={{
                        display: "inline-block",
                        padding: "16px 40px",
                        background: BROWN,
                        borderRadius: 4,
                      }}
                    >
                      <InlineEdit
                        tag="span"
                        editMode={editMode}
                        value={rsvpText}
                        onChange={(v) => upProfile("rsvpButtonText", v)}
                        style={{
                          fontFamily: SANS,
                          fontWeight: 700,
                          fontSize: 10,
                          letterSpacing: "0.4em",
                          textTransform: "uppercase",
                          color: "white",
                          cursor: "text",
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenRSVP?.()}
                      style={{
                        padding: "16px 48px",
                        background: BROWN,
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontFamily: SANS,
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: "0.4em",
                        textTransform: "uppercase",
                        color: "white",
                        boxShadow: `0 6px 24px ${BROWN}55`,
                        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = BROWN_D;
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.letterSpacing = "0.5em";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = BROWN;
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.letterSpacing = "0.4em";
                      }}
                    >
                      {rsvpText}
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {/* Footer */}
          <Reveal style={{ marginTop: 40, textAlign: "center" }}>
            <WildDivider />
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 11,
                fontStyle: "italic",
                color: `${MUTED}88`,
                marginTop: 14,
              }}
            >
              cu drag · WeddingPro
            </p>
          </Reveal>
        </div>
      </div>
    </>
  );
};

export default TerraBohoTemplate;
