import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type TimelinePreset = { icon: string; emoji: string; title: string };

const TIMELINE_PRESETS: TimelinePreset[] = [
  { icon: "diamond", emoji: "💍", title: "Pregatirea mirilor" },
  { icon: "dress", emoji: "👗", title: "Imbracarea miresei" },
  { icon: "ceremony", emoji: "⛪", title: "Ceremonia civila" },
  { icon: "candles", emoji: "🕯️", title: "Ceremonia religioasa" },
  { icon: "photo", emoji: "📷", title: "Sedinta foto" },
  { icon: "arch", emoji: "🌸", title: "Intrarea in sala" },
  { icon: "dance", emoji: "💃", title: "Dansul mirilor" },
  { icon: "cocktails", emoji: "🍸", title: "Cocktail & aperitiv" },
  { icon: "dinner", emoji: "🍽️", title: "Masa festiva" },
  { icon: "music", emoji: "🎵", title: "Muzica live" },
  { icon: "mic", emoji: "🎤", title: "Toast & discursuri" },
  { icon: "cake", emoji: "🎂", title: "Taierea tortului" },
  { icon: "bouquet", emoji: "💐", title: "Aruncarea buchetului" },
  { icon: "champagne", emoji: "🥂", title: "Sampanie & felicitari" },
  { icon: "car", emoji: "🚗", title: "Plecare miri" },
  { icon: "disco", emoji: "🪩", title: "After party" },
  { icon: "fireworks", emoji: "🎆", title: "Focuri de artificii" },
  { icon: "moon", emoji: "🌙", title: "Finalul evenimentului" },
];

export const TimelineInsertButton: React.FC<{
  editMode: boolean;
  disabled?: boolean;
  onAdd: (preset: TimelinePreset | null) => void;
  colors: { dark: string; light: string; xl: string; muted: string };
}> = ({ editMode, disabled, onAdd, colors }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    const update = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({
        left: rect.left + rect.width / 2,
        top: rect.top - 8,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  if (!editMode) return null;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 32,
        marginTop: 10,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: `repeating-linear-gradient(to right, ${colors.light} 0, ${colors.light} 6px, transparent 6px, transparent 12px)`,
          opacity: 1,
          zIndex: 1,
        }}
      />
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: open ? colors.dark : "white",
          border: `1.5px solid ${colors.light}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          color: open ? "white" : colors.dark,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          transition: "transform 0.15s, background 0.15s",
          zIndex: 60,
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        {open ? "×" : "+"}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                transform: "translate(-50%, -100%)",
                background: "white",
                borderRadius: 14,
                border: `1px solid ${colors.light}`,
                boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
                padding: "12px",
                zIndex: 999999,
                width: 260,
              }}
            >
              <p
                style={{
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: colors.muted,
                  margin: "0 0 10px",
                  textAlign: "center",
                }}
              >
                Adauga moment
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 6,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onAdd(null);
                    setOpen(false);
                  }}
                  style={{
                    gridColumn: "1 / -1",
                    background: colors.xl,
                    border: `1px dashed ${colors.light}`,
                    borderRadius: 10,
                    padding: "8px 10px",
                    cursor: "pointer",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: colors.dark,
                  }}
                >
                  + Moment gol
                </button>
                {TIMELINE_PRESETS.map((p) => (
                  <button
                    key={p.icon}
                    type="button"
                    onClick={() => {
                      onAdd(p);
                      setOpen(false);
                    }}
                    style={{
                      background: colors.xl,
                      border: `1px solid ${colors.light}`,
                      borderRadius: 10,
                      padding: "8px 6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: colors.dark,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{p.emoji}</span>
                    <span style={{ textAlign: "left" }}>{p.title}</span>
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
