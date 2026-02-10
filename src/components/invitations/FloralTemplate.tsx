
import React from "react";
import { Heart } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: 'floral',
  name: 'Romantic Floral',
  description: 'Motive botanice delicate și culori pastelate.',
  colors: ['#fff1f2', '#fecdd3', '#881337'],
  previewClass: "bg-rose-50 border-rose-100",
  elementsClass: "bg-rose-300" // Roz pentru elemente
};

const FloralTemplate: React.FC<InvitationTemplateProps> = ({ data, onOpenRSVP }) => {
  const { profile, guest } = data;

  return (
    <div className="min-h-screen bg-[#fff5f5] text-stone-800 font-serif">
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white shadow-xl overflow-hidden relative">
        <div className="h-3 bg-rose-300"></div>
        
        <div className="p-12 text-center space-y-8 flex-1 flex flex-col justify-center relative z-10">
          
          {/* Abstract Flower Decor CSS */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-orange-100/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

          <div className="relative animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-6 h-6 text-rose-400 fill-rose-200" />
            </div>
            
            <h1 className="text-5xl italic text-rose-950 mb-3 font-medium tracking-tight">{profile.partner1Name} <span className="text-rose-300">&</span> {profile.partner2Name}</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500 mb-8 font-sans">Wedding Invitation</p>
            
            <div className="py-10 border-y border-rose-100 space-y-6 relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                   <span className="text-rose-200 text-xl">❀</span>
               </div>

               <p className="text-xl font-medium text-stone-700">Dragă {guest.name},</p>
               <p className="text-stone-500 text-sm italic px-6 leading-relaxed">
                   "Dragostea nu constă în a ne privi unul pe celălalt, ci în a privi împreună în aceeași direcție."
               </p>
               
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white px-2">
                   <span className="text-rose-200 text-xl">❀</span>
               </div>
            </div>

            <div className="mt-12 space-y-4 font-sans">
              <div>
                  <p className="text-4xl font-light text-rose-900">
                      {profile.weddingDate ? new Date(profile.weddingDate).getDate() : "DD"}
                  </p>
                  <p className="uppercase text-sm tracking-widest text-rose-400">
                      {profile.weddingDate ? new Date(profile.weddingDate).toLocaleDateString('ro-RO', { month: 'long' }) : "Month"}
                  </p>
                  <p className="text-stone-400 text-sm mt-1">{profile.weddingDate ? new Date(profile.weddingDate).getFullYear() : "YYYY"}</p>
              </div>

              <div className="w-px h-12 bg-rose-200 mx-auto"></div>

              <div>
                  <p className="text-lg font-medium text-stone-800">{profile.locationName}</p>
                  <p className="text-sm text-stone-500 max-w-[200px] mx-auto">{profile.locationAddress}</p>
                  <p className="text-sm font-bold text-rose-500 mt-2">ora {profile.eventTime || "16:00"}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-6">
              <button 
                onClick={onOpenRSVP}
                className="bg-rose-400 text-white px-8 py-3 rounded-full shadow-lg shadow-rose-200 hover:bg-rose-500 transition-all text-sm font-bold tracking-wide"
              >
                  Confirmă Acum
              </button>
          </div>
        </div>
        <div className="h-3 bg-rose-300"></div>
      </div>
    </div>
  );
};

export default FloralTemplate;
