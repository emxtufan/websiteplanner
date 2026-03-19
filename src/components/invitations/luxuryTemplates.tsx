// src/components/invitations/LuxuryTemplate.tsx
import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { InvitationBlock } from "../../types";
import { cn } from "../../lib/utils";
import { InlineEdit } from "./InlineEdit";

/* ───────────────────────────────────────────── */
/* Countdown Hook */
/* ───────────────────────────────────────────── */
export const meta: TemplateMeta = {
  id: 'luxury', name: 'LuxuryTemplate', category: 'wedding',
  description: 'dwdwdw',
  colors: ['#fff', '#f4f4f5', '#d4af37'],
  previewClass: "bg-white border-zinc-200", elementsClass: "bg-stone-300"
};


function useCountdown(targetDate: string) {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
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

  const [time, setTime] = useState(calc);

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}

/* ───────────────────────────────────────────── */
/* Main Component */
/* ───────────────────────────────────────────── */

const LuxuryTemplate: React.FC<
  InvitationTemplateProps & {
    editMode?: boolean;
    onProfileUpdate?: (patch: Record<string, any>) => void;
    onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  }
> = ({ data, editMode = false, onProfileUpdate, onBlocksUpdate }) => {
  const { profile, guest } = data;

  const safe = (str: string | undefined, fb: any) => {
    try {
      return str ? JSON.parse(str) : fb;
    } catch {
      return fb;
    }
  };

  const [blocks, setBlocks] = useState<InvitationBlock[]>(
    () => safe(profile.customSections, [])
  );

  useEffect(() => {
    setBlocks(safe(profile.customSections, []));
  }, [profile.customSections]);

  const countdown = useCountdown(profile.weddingDate || "");

  const updateProfile = (patch: Record<string, any>) => {
    onProfileUpdate?.(patch);
  };

  const visibleBlocks = editMode
    ? blocks
    : blocks.filter((b) => b.show !== false);

  /* ───────────────────────────────────────────── */

  return (
    <div
      className={cn(
        "min-h-screen bg-[#f7f5f0] text-stone-900",
        editMode && "edit-mode"
      )}
    >
      <div className="max-w-5xl mx-auto px-8 py-28 space-y-32">

        {/* ───────── HERO ───────── */}
        <section className="text-center space-y-10">

          <InlineEdit
            tag="p"
            editMode={editMode}
            value={profile.welcomeText || ""}
            onChange={(v) => updateProfile({ welcomeText: v })}
            className="uppercase tracking-[0.35em] text-xs text-stone-500"
            placeholder="Text introductiv"
          />

          <h1 className="text-7xl md:text-8xl font-light leading-none">
            <InlineEdit
              tag="span"
              editMode={editMode}
              value={profile.partner1Name || ""}
              onChange={(v) =>
                updateProfile({ partner1Name: v })
              }
              placeholder="Nume"
            />

            <span className="mx-6 text-stone-400 italic">&</span>

            <InlineEdit
              tag="span"
              editMode={editMode}
              value={profile.partner2Name || ""}
              onChange={(v) =>
                updateProfile({ partner2Name: v })
              }
              placeholder="Nume"
            />
          </h1>

          <InlineEdit
            tag="p"
            editMode={editMode}
            value={profile.celebrationText || ""}
            onChange={(v) =>
              updateProfile({ celebrationText: v })
            }
            className="text-xl italic text-stone-600 max-w-2xl mx-auto"
            placeholder="Descriere eveniment"
            multiline
          />
        </section>

        {/* ───────── DATE ───────── */}
        <section className="text-center border-t border-stone-200 pt-20 space-y-8">

          <Calendar className="mx-auto w-5 h-5 text-stone-400" />

          <p className="uppercase tracking-[0.3em] text-sm text-stone-600">
            {profile.weddingDate
              ? new Date(profile.weddingDate).toLocaleDateString("ro-RO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Data Evenimentului"}
          </p>

          {!countdown.expired && profile.showCountdown && (
            <div className="flex justify-center gap-12 font-sans text-stone-700">
              <div>{countdown.days} Zile</div>
              <div>{countdown.hours} Ore</div>
              <div>{countdown.minutes} Min</div>
              <div>{countdown.seconds} Sec</div>
            </div>
          )}
        </section>

        {/* ───────── BLOCKS ───────── */}
        <section className="space-y-24">
          {visibleBlocks.map((block) => (
            <div key={block.id} className="text-center space-y-6">

              {block.type === "title" && (
                <h2 className="uppercase tracking-[0.3em] text-sm text-stone-500">
                  {block.content}
                </h2>
              )}

              {block.type === "text" && (
                <p className="text-lg italic max-w-2xl mx-auto leading-relaxed">
                  {block.content}
                </p>
              )}

              {block.type === "divider" && (
                <div className="w-16 h-px bg-stone-300 mx-auto" />
              )}

              {block.type === "location" && (
                <div className="space-y-2">
                  <p className="uppercase text-xs tracking-[0.3em] text-stone-400">
                    {block.label}
                  </p>
                  <p className="text-2xl font-light">
                    {block.locationName}
                  </p>
                  <p className="text-stone-500 italic">
                    {block.locationAddress}
                  </p>
                  <p className="text-sm text-stone-600">
                    {block.time}
                  </p>
                </div>
              )}

            </div>
          ))}
        </section>

        {/* ───────── RSVP ───────── */}
        {profile.showRsvpButton !== false && (
          <section className="text-center pt-10">
            <button
              onClick={() => {}}
              className="
                px-14 py-4
                border border-stone-900
                uppercase tracking-[0.35em]
                text-xs
                hover:bg-stone-900 hover:text-white
                transition-all duration-300
              "
            >
              {profile.rsvpButtonText || "Confirmă Prezența"}
            </button>
          </section>
        )}

      </div>
    </div>
  );
};

export default LuxuryTemplate;