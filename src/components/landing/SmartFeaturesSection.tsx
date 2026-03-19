import React from "react";
import { MapPin, Calendar, CheckCircle, Navigation, Star, MessageCircle, HelpCircle } from 'lucide-react';

export default function SmartFeaturesSection() {
  return (
    <section className="md:py-20  relative overflow-hidden  border-white/5 pt-[50px]">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-30" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px', maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' }}>
        </div>

        <div className="wp-container relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-[var(--primary)]/20 blur-[100px] rounded-full pointer-events-none"></div>
                
                <h2 className="wp-section-title2 text-4xl md:text-5xl font-black text-white mb-6 leading-tight relative z-10 ">
                    Invitații tăi au <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%)' }}>întrebări</span>?
                    <br />Platforma ESA are răspunsurile.
                </h2>
                <p className="text-gray-400 text-lg md:text-xl font-light relative z-10">
                    Nu mai pierde timp răspunzând la mesaje. Invitația ta digitală funcționează ca un asistent personal.
                </p>
            </div>

            {/* Graphic Container */}
            <div className="relative w-full max-w-4xl mx-auto min-h-[600px] md:min-h-[700px] perspective-1000">
                
                {/* 1. The Blurred Text Background Container (The "Square") */}
                {/* Changed: Removed blur from parent, applied to content only. Made border sharper and bg more visible. */}
                <div className="absolute inset-0 top-0 bg-[#0c0c0e]/80 border border-white/10 rounded-3xl overflow-hidden transform scale-[0.95] origin-top transition-all duration-700 shadow-2xl backdrop-blur-sm group/container">
                     {/* Subtle inner glow */}
                     <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none"></div>
                     
                     {/* Blurred Content */}
                     <div className="w-full h-full p-8 md:p-16 flex flex-col gap-16 opacity-40 blur-[2px] select-none pointer-events-none group-hover/container:opacity-50 transition-opacity">
                         {/* Item 1 Area */}
                         <div className="w-full max-w-2xl space-y-4">
                            <div className="w-1/3 h-8 bg-white/20 rounded-md"></div>
                            <div className="w-full h-4 bg-white/5 rounded-md"></div>
                            <div className="w-3/4 h-4 bg-white/5 rounded-md"></div>
                         </div>

                         {/* Item 2 Area */}
                         <div className="w-full max-w-2xl space-y-4 ml-auto text-right flex flex-col items-end">
                            <div className="w-1/4 h-8 bg-white/20 rounded-md"></div>
                            <div className="w-5/6 h-4 bg-white/5 rounded-md"></div>
                            <div className="w-2/3 h-4 bg-white/5 rounded-md"></div>
                         </div>

                         {/* Item 3 Area */}
                         <div className="w-full max-w-2xl space-y-4 mx-auto text-center flex flex-col items-center">
                            <div className="w-1/3 h-8 bg-white/20 rounded-md"></div>
                            <div className="w-full h-4 bg-white/5 rounded-md"></div>
                            <div className="w-1/2 h-4 bg-white/5 rounded-md"></div>
                         </div>
                     </div>
                </div>

                {/* 2. The Main Floating Query */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 w-max max-w-[90vw]">
                     <div className="flex items-center gap-3 px-6 py-3 bg-[#18181b] border border-white/10 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] backdrop-blur-xl animate-[bounce_3s_infinite]">
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                             <HelpCircle size={14} />
                        </div>
                        <span className="text-gray-300 text-sm md:text-base font-medium italic">"Unde este, la ce oră și cum confirm?"</span>
                     </div>
                </div>

                {/* 3. The Feature Cards */}
                
                {/* Card 1: Navigation */}
                <div className="absolute top-[12%] left-[5%] md:left-[15%] z-30 group">
                    <div className="flex flex-col items-start gap-2 transform transition-transform duration-500 hover:scale-105">
                        <div className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] text-gray-300 font-mono mb-1 backdrop-blur-md shadow-lg">
                            1. Locație
                        </div>
                        <div className="flex items-center gap-3 px-5 py-3 bg-[#111113] border border-[var(--primary)]/40 group-hover:border-[var(--primary)] rounded-full shadow-[0_10px_40px_-10px_rgba(232,121,249,0.2)] transition-colors">
                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                <MapPin size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm md:text-base">Palatul Snagov</span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <Navigation size={10} className="text-[var(--primary)]" /> Deschide Waze
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Calendar */}
                <div className="absolute top-[40%] right-[5%] md:right-[15%] z-30 group text-right">
                    <div className="flex flex-col items-end gap-2 transform transition-transform duration-500 hover:scale-105">
                         <div className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] text-gray-300 font-mono mb-1 backdrop-blur-md shadow-lg">
                            2. Program
                        </div>
                        <div className="flex flex-row-reverse items-center gap-3 px-5 py-3 bg-[#111113] border border-indigo-500/40 group-hover:border-indigo-500 rounded-full shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)] transition-colors">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Calendar size={18} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-white font-bold text-sm md:text-base">24 Aug, 16:00</span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    Add to Calendar
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: RSVP */}
                <div className="absolute top-[70%] left-1/2 -translate-x-1/2 z-40 w-max group">
                     <div className="flex flex-col items-center gap-3 transform transition-transform duration-500 hover:scale-110">
                        <div className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] text-gray-300 font-mono backdrop-blur-md shadow-lg">
                            3. Confirmare
                        </div>
                        
                        <div className="flex items-center gap-4 px-8 py-5 bg-[#111113] border border-emerald-500/40 hover:border-emerald-500 rounded-full shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)] transition-colors relative">
                            <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
                            
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                <CheckCircle size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-lg leading-none">Confirmă Prezența</span>
                                <span className="text-emerald-500/70 text-xs uppercase font-bold tracking-widest mt-1.5">RSVP Instant</span>
                            </div>
                            
                            <div className="absolute -top-3 -right-3 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] text-yellow-500 font-bold flex items-center gap-1 shadow-sm backdrop-blur-md">
                                <Star size={10} fill="currentColor" /> Popular
                            </div>
                        </div>
                    </div>
                </div>

                {/* Connecting Lines (Desktop) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 hidden md:block">
                    {/* Curve from 1 to 2 */}
                    <path d="M250 160 Q 500 160 700 320" stroke="var(--primary)" strokeWidth="2" fill="none" strokeDasharray="6 6" />
                    {/* Curve from 2 to 3 */}
                    <path d="M700 380 Q 500 550 500 600" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="6 6" />
                </svg>

                {/* Connecting Lines (Mobile) */}
                <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40 md:hidden">
                     <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        {/* Curve from Item 1 (Top Left) to Item 2 (Mid Right) */}
                        <path d="M20 18 C 20 25, 80 25, 80 45" stroke="var(--primary)" strokeWidth="0.5" fill="none" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                        
                        {/* Curve from Item 2 (Mid Right) to Item 3 (Bottom Center) */}
                        <path d="M80 48 C 80 60, 50 60, 50 72" stroke="#6366f1" strokeWidth="0.5" fill="none" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                     </svg>
                </div>

            </div>
        </div>
    </section>
  );
}