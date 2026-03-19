import React, { useState } from 'react';
import { Play, CheckCircle2, ChevronRight, Layers, Users, Zap } from 'lucide-react';
import BlurText from './effectText/BlurText/BlurText ';

const TUTORIAL_STEPS = [
  {
    id: 'design',
    label: 'Design & Configurare',
    icon: Layers,
    title: 'Creează invitația perfectă.',
    description: 'Nu ai nevoie de experiență în design. Alege o temă, modifică fonturile și culorile, și vezi rezultatul în timp real. Totul este drag-and-drop.',
    videoId: 'dQw4w9WgXcQ', // Placeholder ID
    thumbnailText: 'Cum creezi o invitație în 2 minute'
  },
  {
    id: 'guests',
    label: 'Guest Management',
    icon: Users,
    title: 'Uită de Excel-uri.',
    description: 'Centralizează lista de invitați. Trimite link-uri unice, vezi cine a deschis invitația și primește notificări instant la fiecare RSVP.',
    videoId: 'M7lc1UVf-VE', // Placeholder ID
    thumbnailText: 'Gestionarea listei de invitați'
  },
  {
    id: 'advanced',
    label: 'Funcții Avansate',
    icon: Zap,
    title: 'Automatizare completă.',
    description: 'De la remindere automate pe WhatsApp până la hărți interactive și sugestii de cazare pentru invitații din alt oraș.',
    videoId: 'LXb3EKWsInQ', // Placeholder ID
    thumbnailText: 'Tips & Tricks pentru nunta ta'
  }
];

export default function TutorialSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeContent = TUTORIAL_STEPS[activeStep];

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsPlaying(false); // Reset video state when switching tabs
  };

  return (
    <section className="py-24  relative overflow-hidden border-t border-white/5" id='process'>
      {/* Background Dots Pattern */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="wp-container relative z-10">
        <div className="text-center mb-16">
             <span className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2 block">Tutorial</span>
             <h2 className="wp-section-title2 text-[64px] md:text-[80px] font-black text-white leading-tight">
              <BlurText text="Învață în"
                          delay={20}
                          animateBy="letters"
                          direction="bottom"
                          className="wp-section-titleX"
                        />{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%)",
                }}
              >
                câteva minute.
              </span>
            </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Interactive List */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {TUTORIAL_STEPS.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <div 
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`group cursor-pointer transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                     <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                        {step.label}
                     </span>
                     {isActive && <div className="h-[1px] flex-1 bg-[var(--primary)]/50"></div>}
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  
                  <p className={`text-sm md:text-base leading-relaxed transition-colors ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Video Player */}
          <div className="lg:col-span-8">
             {/* Increased height on mobile from aspect-video to h-[400px] to prevent cramping */}
             <div className="relative w-full h-[250px] md:h-auto md:aspect-video rounded-2xl overflow-hidden bg-[#111] border border-white/10 shadow-[0_0_50px_-12px_rgba(232,121,249,0.2)] group">
                
                {isPlaying ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${activeContent.videoId}?autoplay=1`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                ) : (
                  // Custom Cover Design
                  <div 
                    className="absolute inset-0 bg-[#0c0c0e] cursor-pointer"
                    onClick={() => setIsPlaying(true)}
                  >
                     {/* Background Image/Gradient */}
                     <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-dark)]/20 via-[#0c0c0e] to-[#0c0c0e] z-0"></div>
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629904853716-f004c64c703f?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                     
                     {/* Overlay Content */}
                     <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 z-10">
                        <div className="flex items-start justify-between">
                            <div className="max-w-lg relative z-20">
                                <div className="inline-flex items-center gap-2 px-2 py-1 md:px-3 rounded-full bg-white/5 border border-white/10 text-[var(--primary)] text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-3 md:mb-6 backdrop-blur-sm">
                                    <CheckCircle2 size={10} className="md:w-3 md:h-3" />
                                    <span>Video Tutorial</span>
                                </div>
                                
                                <h2 className="text-3xl md:text-6xl font-black text-white mb-2 md:mb-4 uppercase tracking-tighter leading-none">
                                    YES<span className="text-[var(--primary)]">.EVENTS</span>
                                </h2>
                                
                                <p className="text-sm md:text-2xl text-gray-300 font-medium leading-snug max-w-[85%] md:max-w-full">
                                    <span className="text-[var(--primary)] font-bold">How To:</span> {activeContent.thumbnailText}
                                </p>
                            </div>

                            {/* Play Button - Desktop */}
                            <div className="hidden md:flex w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-md items-center justify-center text-white group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:border-[var(--primary)] transition-all duration-300 shadow-2xl">
                                <Play size={32} fill="currentColor" className="ml-1" />
                            </div>
                        </div>
                     </div>

                     {/* Mobile Play Button (Centered) */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden z-10 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-[var(--primary)]/90 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                             <Play size={20} fill="currentColor" className="ml-1" />
                        </div>
                     </div>

                     {/* Bottom UI Elements */}
                     <div className="absolute bottom-4 md:bottom-6 left-6 md:left-16 right-6 md:right-8 flex items-center justify-between border-t border-white/10 pt-3 md:pt-4">
                        <div className="flex items-center gap-4 text-[10px] md:text-xs font-mono text-gray-500">
                           <span>00:00</span>
                           <div className="w-16 md:w-24 h-[2px] bg-white/10 rounded-full overflow-hidden">
                              <div className="w-1/3 h-full bg-[var(--primary)]"></div>
                           </div>
                           <span>04:20</span>
                        </div>
                        <div className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                           Watch Now
                        </div>
                     </div>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}