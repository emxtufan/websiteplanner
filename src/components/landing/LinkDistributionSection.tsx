import React from 'react';
import { 
  Link, Globe, Lock, Copy, Search, User, 
  Trash2, ExternalLink, Send, Crown, AlertCircle, Settings
} from 'lucide-react';
import BlurText from './effectText/BlurText/BlurText ';

export default function LinkDistributionSection() {
  return (
    <section className="py-24 bg-[#09090b] relative overflow-hidden border-t border-white/5">
      {/* Background decoration */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="wp-container">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Text Content */}
          <div className="w-full lg:w-5/12 space-y-8">
            <div>
              <span className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 block">Distribuire & Acces</span>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                <BlurText text="Un Link."
                          delay={20}
                          animateBy="letters"
                          direction="bottom"
                          className="wp-section-titleX"
                        /><br/>
                <span className="text-gray-500">Sau sute de link-uri.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Alege cum vrei să distribui invitația. Configurează un link public pentru rețelele sociale sau generează link-uri unice pentru o experiență VIP și tracking precis.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Globe size={22} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1 group-hover:text-blue-400 transition-colors">Link Public (Slug)</h3>
                  <p className="text-gray-500 text-sm">Creează un URL personalizat (ex: <span className="font-mono text-blue-400/80 bg-blue-400/10 px-1 rounded">/nunta-noastra</span>) pe care îl poți trimite oricui, oriunde.</p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1 group-hover:text-purple-400 transition-colors">Link-uri Unice (Tracking)</h3>
                  <p className="text-gray-500 text-sm">Sistemul generează automat un link criptat pentru fiecare invitat adăugat în listă. Știi exact cine a intrat.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Mockup (Based on screenshot) */}
          <div className="w-full lg:w-7/12">
            <div className="relative rounded-xl bg-[#0c0c0e] border border-white/10 shadow-2xl overflow-hidden transform md:rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Window Header */}
              <div className="h-10 bg-[#111113] border-b border-white/5 flex items-center px-4 gap-2">
                 <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                 </div>
                 <div className="ml-auto sm:ml-4 px-3 py-1 bg-black/40 rounded text-[10px] text-gray-500 font-mono border border-white/5 flex items-center gap-2 max-w-[150px] sm:max-w-none">
                    <Lock size={8} className="shrink-0" /> 
                    <span className="truncate">yes.events/guests</span>
                 </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 md:p-6 bg-[#09090b]">
                
                {/* Page Header */}
                <div className="mb-6">
                   <h3 className="text-lg font-bold text-white mb-1">Listă Invitați & RSVP</h3>
                   <p className="text-xs text-gray-500">Gestionează link-urile și confirmările.</p>
                </div>

                {/* Configuration Alert Banner */}
                <div className="mb-6 p-4 rounded-lg bg-[#0F1218] border border-blue-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                   <div className="flex items-start gap-3 md:gap-4 z-10">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 mt-1 sm:mt-0">
                         <Link size={18} />
                      </div>
                      <div>
                         <h4 className="text-white text-sm font-bold mb-1">Configurează link-ul public</h4>
                         <p className="text-gray-400 text-xs max-w-sm leading-relaxed">Alege un nume (slug) pentru evenimentul tău în setări.</p>
                      </div>
                   </div>
                   <button className="z-10 w-full sm:w-auto px-4 py-2 bg-transparent border border-gray-600 text-white text-xs font-bold rounded hover:bg-white hover:text-black transition-colors whitespace-nowrap">
                      Configurare
                   </button>
                   {/* Gradient glow behind banner */}
                   <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none"></div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 bg-[#111113] border border-white/10 rounded px-3 py-2.5 flex items-center gap-2 text-gray-500 focus-within:text-white focus-within:border-white/20 transition-colors">
                        <Search size={14} />
                        <input type="text" placeholder="Caută invitat..." className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-gray-600" />
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-3 py-2 bg-[#111113] border border-white/10 rounded whitespace-nowrap">
                            <Lock size={12} className="text-purple-400" />
                            <span className="text-[10px] text-gray-400 font-medium">Limită (1/50)</span>
                            <button className="ml-1 px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-bold rounded flex items-center gap-1 transition-colors">
                                <Crown size={8} /> Upgrade
                            </button>
                        </div>

                        <button className="px-3 py-2 bg-white/5 border border-white/10 rounded text-gray-500 text-xs font-bold cursor-not-allowed opacity-50 flex items-center gap-2 shrink-0">
                            + <span className="hidden sm:inline">Adaugă</span>
                        </button>
                    </div>
                </div>

                {/* Table Header (Hidden on Mobile) */}
                <div className="hidden sm:flex items-center text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3 px-2">
                    <div className="w-8 text-center">#</div>
                    <div className="w-32">Nume</div>
                    <div className="flex-1 px-4">Link / Sursă</div>
                    <div className="w-24 text-center">Status</div>
                    <div className="w-24 text-right">Acțiuni</div>
                </div>

                {/* Table Row (Responsive Card) */}
                <div className="group bg-[#111113] hover:bg-[#161619] border border-white/5 hover:border-white/10 rounded-lg p-3 sm:p-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all">
                    {/* ID & Avatar */}
                    <div className="flex items-center gap-3 w-full sm:w-40">
                        <div className="hidden sm:block w-8 text-center text-xs text-gray-600 font-mono">1</div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                                <User size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">Alexandru P.</span>
                                <span className="sm:hidden text-[10px] text-gray-500">Adăugat acum 2 ore</span>
                            </div>
                        </div>
                    </div>

                    {/* Link Input */}
                    <div className="flex-1 w-full px-0 sm:px-4">
                        <div className="flex items-center bg-black/40 border border-white/10 rounded px-2 py-1.5 group-hover:border-white/20 transition-colors w-full">
                            <Link size={12} className="text-gray-600 mr-2 shrink-0" />
                            <div className="flex-1 min-w-0 flex items-center font-mono text-[10px]">
                                <span className="text-gray-500 truncate">.../invite/</span>
                                <span className="text-gray-300 truncate ml-0.5">txaohya13</span>
                            </div>
                            <button className="ml-2 text-gray-500 hover:text-white transition-colors shrink-0">
                                <Copy size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-2 mt-1 sm:mt-0">
                         <div className="flex-1 sm:w-24 flex justify-start sm:justify-center">
                            <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center gap-1.5">
                                Văzut <span className="hidden sm:inline text-[8px] opacity-60 font-normal">19.02</span>
                            </div>
                         </div>
                         
                         <div className="flex justify-end gap-1 sm:gap-2">
                             <button className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors" title="Trimite">
                                 <Send size={14} />
                             </button>
                             <button className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Șterge">
                                 <Trash2 size={14} />
                             </button>
                             <button className="p-1.5 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="Deschide">
                                 <ExternalLink size={14} />
                             </button>
                         </div>
                    </div>
                </div>

                {/* Table Row 2 (Ghost/Blurred for depth) */}
                <div className="mt-2 opacity-30 pointer-events-none filter blur-[1px]">
                     <div className="bg-[#111113] border border-white/5 rounded-lg p-3 sm:p-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="hidden sm:block w-8 text-center text-xs text-gray-600 font-mono">2</div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800"></div>
                            <div className="w-24 h-3 bg-gray-800 rounded"></div>
                         </div>
                         <div className="flex-1 h-8 bg-black/40 border border-white/5 rounded w-full"></div>
                     </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}