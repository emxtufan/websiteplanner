
import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: 'modern',
  name: 'Modern Dark',
  description: 'Stil minimalist, bold, perfect pentru evenimente de seară.',
  colors: ['#18181b', '#27272a', '#fff'],
  previewClass: "bg-zinc-950 border-zinc-800",
  elementsClass: "bg-white",
  thumbnailUrl: "card_website/2.jpg" 
};

const ModernTemplate: React.FC<InvitationTemplateProps> = ({ data, onOpenRSVP }) => {
  const { profile, guest } = data;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-white selection:text-black">
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-black shadow-2xl overflow-hidden relative border-x border-zinc-900">
        {/* HERO */}
        <div className="h-[45vh] bg-zinc-900 relative flex items-center justify-center p-8 text-center group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-black opacity-50 group-hover:opacity-70 transition-opacity duration-1000"></div>
          
          <div className="relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <p className="text-zinc-500 uppercase tracking-[0.4em] text-[10px]">Save The Date</p>
            <h1 className="text-6xl font-black tracking-tighter leading-[0.9]">
              {profile.partner1Name} <br/> <span className="text-zinc-700 font-light">&</span> <br/> {profile.partner2Name}
            </h1>
            <div className="w-12 h-1 bg-white mx-auto"></div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="flex-1 p-8 space-y-10 bg-black">
          <div className="text-center space-y-4">
            <div className="inline-block border border-zinc-800 bg-zinc-900/50 px-6 py-2 rounded-full">
                <p className="text-lg font-medium">Salut, <span className="text-white">{guest.name}</span>!</p>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed px-4">
              Te invităm să fii alături de noi în cel mai important capitol al poveștii noastre.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Când</p>
                <p className="font-bold text-lg">{profile.weddingDate ? new Date(profile.weddingDate).toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Data indisponibilă"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                 <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Ora</p>
                <p className="font-bold text-lg">{profile.eventTime || "14:00"}</p>
              </div>
            </div>

            <div className="flex items-center gap-5 p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Unde</p>
                <p className="font-bold text-lg">{profile.locationName || "Locație"}</p>
                <p className="text-sm text-zinc-500 mt-1">{profile.locationAddress}</p>
              </div>
            </div>
          </div>
          
          {/* FOOTER */}
          <div className="text-center pt-4">
            <button 
                onClick={onOpenRSVP}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors text-sm uppercase tracking-wide"
            >
                Confirm Participarea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
