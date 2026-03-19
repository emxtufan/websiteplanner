import React from "react";
import { 
  Link as LinkIcon, Eye, CheckCircle, Mail, MoreHorizontal, ArrowRight, ShieldCheck 
} from 'lucide-react';

export default function InviteSection() {
  return (
    <section className="wp-invite-section py-20 relative overflow-hidden">
      <div className="wp-container">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Text Content */}
          <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
            <div>
              <span className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2 block">Guest Management</span>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                Nu pierde <br/>niciun detaliu.
              </h2>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                Uită de listele pe hârtie. Gestionează confirmările, vezi cine a deschis invitația și trimite remindere automate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
               <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                    <LinkIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">Link-uri Unice</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">Fiecare invitat primește un link personalizat.</p>
                  </div>
               </div>
               <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">RSVP Securizat</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">Confirmări actualizate instant în dashboard.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Visual Content - Dashboard Widget */}
          <div className="w-full lg:w-1/2">
             <div className="relative max-w-md mx-auto">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur-2xl opacity-50"></div>
                
                <div className="relative bg-[#111113] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    {/* Header Widget */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                           <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-full border-2 border-[#111113] bg-gray-700 flex items-center justify-center text-[10px] text-white font-medium">JD</div>
                              <div className="w-8 h-8 rounded-full border-2 border-[#111113] bg-gray-600 flex items-center justify-center text-[10px] text-white font-medium">AM</div>
                              <div className="w-8 h-8 rounded-full border-2 border-[#111113] bg-[#18181b] flex items-center justify-center text-[10px] text-gray-400 font-medium">+142</div>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-white text-xs font-bold">Invitați Recenți</span>
                              <span className="text-gray-500 text-[10px]">Actualizat acum 2 min</span>
                           </div>
                        </div>
                        <button className="text-gray-500 hover:text-white transition-colors">
                           <MoreHorizontal size={16} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-white/5">
                        {/* Row 1: Confirmed */}
                        <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                                 AP
                              </div>
                              <div>
                                 <div className="text-white text-sm font-medium">Andrei P.</div>
                                 <div className="text-emerald-500/70 text-[10px] flex items-center gap-1">
                                    <CheckCircle size={10} /> Confirmat
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                 Yes
                              </span>
                           </div>
                        </div>

                        {/* Row 2: Viewed */}
                        <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                                 EI
                              </div>
                              <div>
                                 <div className="text-white text-sm font-medium">Elena I.</div>
                                 <div className="text-blue-400/70 text-[10px] flex items-center gap-1">
                                    <Eye size={10} /> Văzut 5m
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                               <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                 Seen
                              </span>
                           </div>
                        </div>

                        {/* Row 3: Sent */}
                        <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 font-bold text-xs shrink-0">
                                 VM
                              </div>
                              <div>
                                 <div className="text-gray-300 text-sm font-medium">Vlad M.</div>
                                 <div className="text-gray-500 text-[10px] flex items-center gap-1">
                                    <Mail size={10} /> Trimis 1h
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                 <ArrowRight size={14} />
                              </button>
                           </div>
                        </div>
                    </div>
                    
                    {/* Footer Stats */}
                    <div className="px-6 py-4 bg-[#0c0c0e] border-t border-white/5 flex items-center justify-between">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Confirmări</span>
                           <span className="text-lg text-white font-bold font-mono">84<span className="text-gray-600 text-sm">/120</span></span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10"></div>
                         <div className="flex flex-col items-end">
                           <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Rată</span>
                           <span className="text-lg text-emerald-400 font-bold font-mono">70%</span>
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