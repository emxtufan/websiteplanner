
import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: 'classic',  
  name: 'Classic Elegant',
  description: 'Design atemporal cu fonturi serif și accente aurii.',
  colors: ['#fff', '#f4f4f5', '#d4af37'],
  previewClass: "bg-white border-zinc-200",
  elementsClass: "bg-stone-300" // Gri deschis pentru elementele interne
};

const ClassicTemplate: React.FC<InvitationTemplateProps> = ({ data, onOpenRSVP }) => {
  const { profile, guest } = data;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-serif flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white shadow-2xl p-8 md:p-12 border-8 border-double border-stone-200 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div>
          <p className="text-stone-500 uppercase tracking-[0.2em] text-sm mb-4">Împreună cu familiile lor</p>
          <h1 className="text-5xl md:text-6xl text-stone-800 mb-4 leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
            {profile.partner1Name} <span className="text-3xl align-middle italic text-stone-400">&</span> {profile.partner2Name}
          </h1>
        </div>

        <div className="w-full h-px bg-stone-200"></div>

        <div className="space-y-4">
          <p className="text-xl italic text-stone-600">Au bucuria de a vă invita la celebrarea căsătoriei lor</p>
          <div className="py-4 bg-stone-50 rounded-lg border border-stone-100 mx-auto max-w-xs">
            <p className="font-bold text-lg">{guest.name}</p>
            {guest.type === 'family' && <span className="text-xs text-stone-400 uppercase">și Familia</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm pt-4">
          <div className="space-y-1">
            <Calendar className="w-5 h-5 mx-auto text-stone-400 mb-2" />
            <p className="font-bold uppercase text-xs text-stone-500">Data</p>
            <p>{profile.weddingDate ? new Date(profile.weddingDate).toLocaleDateString('ro-RO') : "Data nesetată"}</p>
          </div>
          <div className="space-y-1">
            <Clock className="w-5 h-5 mx-auto text-stone-400 mb-2" />
            <p className="font-bold uppercase text-xs text-stone-500">Ora</p>
            <p>{profile.eventTime || "--:--"}</p>
          </div>
          <div className="space-y-1">
            <MapPin className="w-5 h-5 mx-auto text-stone-400 mb-2" />
            <p className="font-bold uppercase text-xs text-stone-500">Locație</p>
            <p>{profile.locationName || "Locație"}</p>
          </div>
        </div>

        <div className="pt-8">
            <p className="text-sm text-stone-500 mb-2">{profile.locationAddress}</p>
            <button 
                onClick={onOpenRSVP}
                className="bg-stone-800 text-white px-6 py-2 rounded uppercase text-xs tracking-widest hover:bg-stone-700 transition-colors"
            >
                Confirmă Prezența
            </button>
        </div>
      </div>
    </div>
  );
};

export default ClassicTemplate;
