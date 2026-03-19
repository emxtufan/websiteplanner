import React from 'react';
import { Sparkles, Calendar, Heart, Layers, Infinity, Zap } from 'lucide-react';

export default function AboutMeSection() {
  return (
    <section className="py-16 md:py-24  relative overflow-hidden  border-white/5">
       {/* Background Elements */}
       <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-900/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-purple-900/5 rounded-full blur-[60px] md:blur-[100px] pointer-events-none"></div>

       <div className="wp-container relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
             
             {/* Left: Image/Visual (Bottom on Mobile, Left on Desktop) */}
             <div className="w-full lg:w-1/2 relative order-last lg:order-first mt-8 lg:mt-0 px-4 lg:px-0">
                <div className="relative aspect-[4/5] max-w-[280px] md:max-w-sm mx-auto lg:mx-0 lg:ml-auto">
                    {/* Decorative Frame */}
                    <div className="absolute inset-0 border border-white/10 rounded-2xl transform rotate-6 scale-95 transition-transform duration-500 hover:rotate-3"></div>
                    <div className="absolute inset-0 bg-[#1a1a1a] rounded-2xl transform -rotate-3 border border-white/10 overflow-hidden shadow-2xl transition-transform duration-500 hover:rotate-0 hover:scale-105 z-10 group">
                        {/* Platform/Event Image */}
                        <img 
                           src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop" 
                           alt="YES Studio Platform" 
                           className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700"
                        />
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        
                        {/* Floating Brand Tag */}
                        <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">YES Studio</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                <p className="text-xs md:text-sm text-indigo-400 font-mono uppercase tracking-wider">Event Tech Platform</p>
                            </div>
                        </div>
                    </div>

                    {/* Floating Elements - Adjusted for mobile safety */}
                    <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-12 h-12 md:w-16 md:h-16 bg-[#0c0c0e] rounded-xl border border-white/10 flex items-center justify-center shadow-xl animate-bounce duration-[4000ms] z-20">
                        <Heart size={16} className="text-pink-500 md:w-5 md:h-5" fill="currentColor" />
                    </div>
                    <div className="absolute top-1/2 -right-6 md:-right-8 w-10 h-10 md:w-14 md:h-14 bg-[#0c0c0e] rounded-xl border border-white/10 flex items-center justify-center shadow-xl animate-pulse z-20">
                        <Zap size={16} className="text-yellow-400 md:w-5 md:h-5" fill="currentColor" />
                    </div>
                </div>
             </div>

             {/* Right: Text (Top on Mobile, Right on Desktop) */}
             <div className="w-full lg:w-1/2 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                    <Layers size={10} className="text-purple-400" />
                    <span>Despre Noi</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                    Mai mult decât <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">o simplă invitație.</span>
                </h2>

                <div className="space-y-6 text-gray-400 text-base md:text-lg leading-relaxed">
                    <p>
                        <span className="text-white font-bold">YES Studio</span> a apărut din dorința de a elimina haosul din organizarea nunților și a evenimentelor speciale. Știm că fiecare detaliu contează, iar instrumentele tradiționale nu mai sunt suficiente.
                    </p>
                    <p>
                        Nu suntem doar un builder de invitații. Suntem platforma care centralizează totul: de la designul impecabil al invitației digitale, la gestionarea listei de oaspeți și confirmări în timp real.
                    </p>
                    <p>
                        Misiunea noastră este să aducem puterea tehnologiei moderne în industria evenimentelor, oferind cuplurilor și organizatorilor liniște sufletească și o experiență digitală premium.
                    </p>
                    <p className="text-white italic font-serif border-l-2 border-indigo-500 pl-4 py-1 bg-white/5 rounded-r-lg text-sm md:text-base">
                        "Planificare fără stres. Design fără compromis."
                    </p>
                </div>

                <div className="mt-10 flex flex-wrap justify-start items-center gap-y-6 gap-x-4 md:gap-x-0">
                     <div className="flex items-center gap-3 pr-4 md:pr-6 border-r border-white/10">
                        <div className="text-2xl md:text-3xl font-black text-white">0</div>
                        <div className="text-[9px] md:text-[10px] uppercase text-gray-500 font-bold leading-tight text-left">Stres<br/>Logistic</div>
                     </div>
                     <div className="flex items-center gap-3 px-4 md:px-0 md:pr-6 md:pl-6 border-r border-transparent md:border-r md:border-white/10">
                        <div className="text-2xl md:text-3xl font-black text-white">100<span className="text-purple-500 text-lg md:text-xl">%</span></div>
                        <div className="text-[9px] md:text-[10px] uppercase text-gray-500 font-bold leading-tight text-left">Digital &<br/>Eco-Friendly</div>
                     </div>
                     <div className="flex items-center gap-2 pl-4 md:pl-6 group cursor-default w-full md:w-auto justify-start">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                             <Infinity size={16} className="text-emerald-500 md:w-[18px] md:h-[18px]" />
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-500 font-medium text-left leading-tight">Posibilități<br/>Nelimitated</span>
                     </div>
                </div>
             </div>

          </div>
       </div>
    </section>
  );
}