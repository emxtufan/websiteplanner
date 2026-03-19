import React, { useRef, useLayoutEffect } from 'react';
import { UserPlus, Palette, Rocket, Check, Sparkles, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    id: 1,
    label: 'STEP 01',
    title: 'Create Account',
    description: 'Începe gratuit. Creează un cont în câteva secunde. Nu cerem card bancar la înregistrare, doar dorința de a crea ceva frumos.',
    icon: UserPlus,
    color: 'from-blue-500/20 to-blue-900/5',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    visual: (
       <div className="relative w-full h-full bg-[#0c0c0e] rounded-xl overflow-hidden flex flex-col shadow-2xl border border-white/5">
          {/* Header Mockup */}
          <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-[#111113]">
              <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
          </div>
          {/* Form Mockup */}
          <div className="p-6 md:p-8 flex flex-col justify-center h-full relative z-10">
              <div className="text-white font-bold text-xl mb-6">Create account</div>
              <div className="space-y-4">
                 <div className="space-y-1">
                     <div className="h-2 w-16 bg-white/20 rounded"></div>
                     <div className="h-10 bg-white/5 rounded border border-white/10 w-full"></div>
                 </div>
                 <div className="space-y-1">
                     <div className="h-2 w-12 bg-white/20 rounded"></div>
                     <div className="h-10 bg-white/5 rounded border border-white/10 w-full"></div>
                 </div>
                 <div className="h-10 bg-white text-black font-bold text-xs rounded w-full flex items-center justify-center mt-4">
                    Get Started <ArrowRight size={14} className="ml-2"/>
                 </div>
              </div>
          </div>
       </div>
    )
  },
  {
    id: 2,
    label: 'STEP 02',
    title: 'Design & Preview',
    description: 'Alege tema preferată, modifică textul și previzualizează rezultatul în timp real pe mobil. Totul este drag-and-drop.',
    icon: Palette,
    color: 'from-purple-500/20 to-purple-900/5',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    visual: (
       <div className="relative w-full h-full bg-[#0c0c0e] rounded-xl overflow-hidden flex shadow-2xl border border-white/5">
          {/* Sidebar Mockup */}
          <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-[#111113]">
             <div className="w-8 h-8 rounded bg-white/10"></div>
             <div className="w-8 h-8 rounded bg-white/5"></div>
             <div className="w-8 h-8 rounded bg-white/5"></div>
             <div className="w-8 h-8 rounded-full border border-purple-500/50 text-purple-500 flex items-center justify-center mt-auto">
                <Palette size={14} />
             </div>
          </div>
          
          {/* Main Area Mockup */}
          <div className="flex-1 p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
              <div className="flex items-center justify-between mb-6">
                 <div className="h-2 w-32 bg-white/20 rounded"></div>
                 <div className="h-6 w-20 bg-white/5 rounded-full border border-white/10"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-[9/16] bg-black rounded-lg border border-white/10 relative overflow-hidden">
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                          <div className="text-white font-serif text-2xl text-center leading-tight">Alex<br/>&<br/>Maria</div>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <div className="h-20 bg-white/5 rounded border border-white/10"></div>
                      <div className="h-20 bg-white/5 rounded border border-white/10"></div>
                  </div>
              </div>
          </div>
       </div>
    )
  },
  {
    id: 3,
    label: 'STEP 03',
    title: 'Go Live',
    description: 'Activează evenimentul cu pachetul Premium. Primești link-ul unic, tracking RSVP și suport prioritar.',
    icon: Rocket,
    color: 'from-emerald-500/20 to-emerald-900/5',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    visual: (
       <div className="relative w-full h-full bg-[#0c0c0e] rounded-xl overflow-hidden flex flex-col items-center justify-center shadow-2xl relative border border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-[#0c0c0e] to-[#0c0c0e]"></div>
          
          <div className="relative z-10 flex flex-col items-center p-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-6 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                 <Rocket size={32} />
              </div>
              
              <div className="text-white font-bold text-2xl mb-2">Ready for Lift Off</div>
              <div className="text-gray-500 text-sm flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5 font-mono">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 yes.events/nunta
              </div>

              <div className="mt-8 flex gap-4">
                 <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><Check size={8} /></div>
                    Guests Unlimited
                 </div>
                 <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><Check size={8} /></div>
                    Analytics
                 </div>
              </div>
          </div>
       </div>
    )
  }
];

export default function ProcessSection() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        
        // Ensure the last card doesn't disappear completely or behaves differently if desired
        // But for the stack effect, we generally want previous cards to scale down
        if (i === STEPS.length - 1) return; 

        gsap.to(card, {
          scale: 0.85,
          opacity: 0,
          filter: 'blur(10px)',
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 15%", // Matches the top-[15vh] class
            end: "bottom 15%", // Animation completes when bottom of card hits the top area
            scrub: true,
            // markers: true, // Uncomment for debugging
          }
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-[#050505] relative w-full pt-32 pb-48 border-t border-white/5">
      <div className="wp-container">
        
        {/* Header */}
        <div className="text-center mb-20 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
              <Sparkles size={10} className="text-purple-400" />
              <span>How it works</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1]">
              Simple & <span className="italic font-serif font-normal text-purple-400">Smart Process</span>
            </h2>
            
            <p className="text-gray-400 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto px-4">
               De la prima idee până la confirmarea ultimului invitat, procesul este fluid și intuitiv.
            </p>
        </div>

        {/* Stack Container */}
        <div className="flex flex-col items-center gap-10 md:gap-20">
            {STEPS.map((step, index) => (
                <div 
                    key={step.id}
                    ref={(el) => { cardsRef.current[index] = el }}
                    className="sticky top-[15vh] w-full max-w-4xl bg-[#0c0c0e] rounded-[32px] border border-white/10 p-6 md:p-12 shadow-2xl origin-top overflow-hidden"
                >
                    {/* Background Gradient */}
                    <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl ${step.color} rounded-full blur-[100px] pointer-events-none opacity-40`}></div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                        
                        {/* Text Content */}
                        <div className="order-2 md:order-1 space-y-6">
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold font-mono uppercase tracking-widest px-2 py-1 rounded bg-white/5 border ${step.borderColor} ${step.iconColor}`}>
                                    {step.label}
                                </span>
                            </div>
                            
                            <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                                {step.title}
                            </h3>
                            
                            <p className="text-gray-400 text-lg leading-relaxed">
                                {step.description}
                            </p>

                            <div className={`inline-flex items-center gap-2 text-sm font-bold ${step.iconColor} border-b border-white/10 pb-1 cursor-pointer hover:border-${step.iconColor} transition-colors`}>
                                Learn more <ArrowRight size={14} />
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="order-1 md:order-2">
                             <div className="relative w-full aspect-[4/3] md:aspect-square max-h-[400px]">
                                {step.visual}
                             </div>
                        </div>

                    </div>
                </div>
            ))}
        </div>

      </div>
    </section>
  );
}
