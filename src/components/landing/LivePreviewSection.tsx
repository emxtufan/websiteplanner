import React, { useEffect, useRef, useState } from 'react';
import { Smartphone, Wand2, Lock , BellDot, History} from 'lucide-react';
import gsap from 'gsap';
import BlurText from './effectText/BlurText/BlurText ';

export default function LivePreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Gentle floating loop for the whole card container stack
    if (containerRef.current) {
        gsap.to(containerRef.current, {
          y: -20,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
    }

    // Auto-swipe cycle
    const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % 3);
    }, 4000);

    return () => {
       gsap.killTweensOf("*");
       clearInterval(interval);
    };
  }, []);

  // Helper to determine style based on current active index
  // Preserves the exact visual positioning from the static design:
  // Position 0 (Front): 0deg rotation, full scale, top z-index
  // Position 1 (Middle): 6deg rotation, slightly smaller, middle z-index (Simulates the Black card position)
  // Position 2 (Back): -12deg rotation, smallest, back z-index (Simulates the Pink card position)
  const getCardStyle = (index: number): React.CSSProperties => {
      // Logic: Calculates relative position in the cycle (0, 1, or 2)
      const position = (index - activeIndex + 3) % 3;
      
      const baseStyle: React.CSSProperties = {
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'center center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          borderRadius: '2rem',
          overflow: 'hidden'
      };

      if (position === 0) {
          // FRONT Position (Matches original White Card)
          return {
              ...baseStyle,
              zIndex: 30,
              transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
              opacity: 1,
              filter: 'brightness(1)',
          };
      } else if (position === 1) {
          // MIDDLE Position (Matches original Black Card: rotate-6)
          return {
              ...baseStyle,
              zIndex: 20,
              // Scaling 0.96 simulates the width difference (300px vs 290px)
              transform: 'translate(-50%, -50%) scale(0.96) rotate(17deg)',
              opacity: 1,
              filter: 'brightness(1)', 
          };
      } else {
          // BACK Position (Matches original Pink Card: -rotate-12)
          return {
              ...baseStyle,
              zIndex: 10,
              // Scaling 0.92 simulates the width difference (300px vs 280px)
              transform: 'translate(-50%, -50%) scale(0.92) rotate(-12deg)',
              opacity: 0.9,
              filter: 'brightness(0.95)',
          };
      }
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden" id='design'>
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px]  from-indigo-900/10 to-transparent pointer-events-none" />

      <div className="wp-container">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-20 lg:gap-20">
          
          {/* Left: Text Story */}
          <div className="w-full lg:w-5/12 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full  border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Real-Time Preview
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1]">
              <BlurText text="Ce vezi"
                          delay={20}
                          animateBy="letters"
                          direction="bottom"
                          className="wp-section-titleX"
                        /><br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">este ce primești.</span>
            </h2>
            
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Fără refresh. Fără "Salvare și Previzualizare". <br/>
              Platforma noastră îți randează invitația instantaneu pe măsură ce scrii, exact așa cum o vor vedea invitații tăi pe mobil.
            </p>

            <div className="space-y-4">
               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#111113] border border-white/10 flex items-center justify-center text-white group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors">
                     <Wand2 size={20} />
                  </div>
                  <div>
                     <h4 className="text-white font-bold text-sm">Design Instant</h4>
                     <p className="text-gray-500 text-xs">Modifică tema, culorile și fonturile cu un click.</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#111113] border border-white/10 flex items-center justify-center text-white group-hover:border-purple-500/50 group-hover:text-purple-400 transition-colors">
                     <Smartphone size={20} />
                  </div>
                  <div>
                     <h4 className="text-white font-bold text-sm">Mobile First</h4>
                     <p className="text-gray-500 text-xs">Optimizat perfect pentru orice tip de ecran.</p>
                  </div>
               </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#111113] border border-white/10 flex items-center justify-center text-white group-hover:border-purple-500/50 group-hover:text-purple-400 transition-colors">
                     <BellDot size={20} />
                  </div>
                  <div>
                     <h4 className="text-white font-bold text-sm">Gestionare RSVP</h4>
                     <p className="text-gray-500 text-xs">Primești confirmările invitaților instant.</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#111113] border border-white/10 flex items-center justify-center text-white group-hover:border-purple-500/50 group-hover:text-purple-400 transition-colors">
                     <History size={20}/>
                  </div>
                  <div>
                     <h4 className="text-white font-bold text-sm">Editare în timp real</h4>
                     <p className="text-gray-500 text-xs">Vezi modificările instant, fără refresh.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right: The Card Stack with Swiper Logic */}
          <div className="w-full lg:w-6/12 relative flex justify-center items-center min-h-[500px] md:min-h-[600px] perspective-1000">
             
             {/* Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-gradient-to-tr from-indigo-600/10 via-purple-600/5 to-transparent blur-3xl rounded-full pointer-events-none"></div>

             {/* Container defining the base size of the cards - matches width of Front card */}
             <div ref={containerRef} className="relative w-[260px] md:w-[300px] aspect-[9/18]">
                
                 {/* === CARD 1 (White - "Alex & Maria") === */}
                 {/* Index 0 in cycle */}
                 <div style={getCardStyle(0)} className="bg-white border border-white/10">
                    <div className="w-full h-full flex flex-col">
                        {/* Browser Header with Search Bar (Original Design) */}
                        <div className="w-full h-14 bg-gray-50 border-b border-gray-100 flex items-end pb-3 px-4 gap-2 shrink-0">
                            <div className="w-full h-9 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center px-3 gap-2">
                                <Lock size={10} className="text-green-500" />
                                <span className="text-[10px] font-medium text-gray-500 font-sans flex-1 truncate">yes.events/alex-maria</span>
                                <div className="w-4 h-4 rounded-full bg-gray-100"></div>
                            </div>
                        </div>

                        {/* Screen Content */}
                        <div className="flex-1 flex flex-col relative p-6 md:p-8">
                            <div className="flex-1 flex flex-col items-center text-center relative z-10">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-8 mt-2">Save The Date</p>
                                <div className="relative mb-6">
                                    <h2 className="text-5xl font-serif text-gray-900 leading-none">Alex <br/><span className="text-gray-400 text-3xl font-sans font-light">&</span><br/> Maria</h2>
                                </div>
                                <div className="w-10 h-[1px] bg-gray-200 my-6"></div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-900 font-bold uppercase tracking-widest">24 August 2026</p>
                                    <p className="text-xs text-gray-500 font-serif italic">Palatul Snagov</p>
                                </div>
                                <div className="mt-auto w-full pt-6">
                                    <div className="w-full py-3 bg-[#1a1a1a] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-lg cursor-pointer flex items-center justify-center gap-2 group hover:bg-black transition-colors">
                                        Confirmă Prezența
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* === CARD 2 (Black - "A&M") === */}
                 {/* Index 1 in cycle */}
                 <div style={getCardStyle(1)} className="bg-[#1a1a1a] border border-white/10">
                     <div className="w-full h-full flex flex-col">
                         {/* Browser Bar (Original Design) */}
                         <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-3 gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-white/10"></div>
                            <div className="flex-1 h-5 bg-white/10 rounded-full flex items-center px-2">
                                <div className="w-16 h-1 bg-white/20 rounded-full"></div>
                            </div>
                         </div>
                         {/* Content */}
                         <div className="flex-1 p-6 flex flex-col items-center justify-center text-white opacity-80">
                             <p className="text-[8px] uppercase tracking-widest mb-6 text-gray-400">Save The Date</p>
                             <h1 className="text-5xl font-serif italic mb-2">A&M</h1>
                             <div className="w-8 h-[1px] bg-white/20 my-4"></div>
                             <p className="text-[10px] uppercase text-gray-400">August 2026</p>
                         </div>
                     </div>
                 </div>

                 {/* === CARD 3 (Pink - Abstract) === */}
                 {/* Index 2 in cycle */}
                 <div style={getCardStyle(2)} className="bg-[#fdf2f8] border border-white/5">
                     <div className="w-full h-full flex flex-col">
                         {/* Browser Bar (Original Design) */}
                         <div className="h-10 bg-white/50 border-b border-pink-100 flex items-center px-3 gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-pink-200"></div>
                            <div className="flex-1 h-5 bg-white rounded-full flex items-center px-2 opacity-60">
                                 <div className="w-12 h-1 bg-pink-100 rounded-full"></div>
                            </div>
                         </div>
                         {/* Abstract Content */}
                         <div className="flex-1 p-6 flex flex-col items-center justify-center opacity-40">
                            <div className="w-20 h-20 rounded-full border border-pink-900/20 mb-4"></div>
                            <div className="w-32 h-2 bg-pink-900/10 rounded mb-2"></div>
                            <div className="w-20 h-2 bg-pink-900/10 rounded"></div>
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