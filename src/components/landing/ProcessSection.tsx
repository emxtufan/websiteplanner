import React, { useState } from 'react';
import { UserPlus, Palette, Rocket, Check, Sparkles, X } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    label: 'STEP 1',
    tabLabel: 'Register',
    title: 'Create Account',
    description: 'Începe gratuit. Creează un cont în câteva secunde. Nu cerem card bancar la înregistrare, doar dorința de a crea ceva frumos.',
    modalTitle: "Pasul 1: Crearea Contului",
    modalDescription: "Platforma YES este construită pentru a elimina barierele de intrare. Îți poți crea un cont gratuit folosind doar adresa de email sau contul Google. Nu cerem informații de plată în această etapă. Ai acces imediat la toate temele și funcționalitățile de editare pentru a te convinge că este platforma potrivită pentru tine înainte de a plăti.",
    icon: UserPlus,
    visual: (
       <div className="relative w-full h-full bg-[#0c0c0e] rounded-xl overflow-hidden flex flex-col shadow-2xl group border border-white/5">
          {/* Header Mockup */}
          <div className="h-8 md:h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-[#111113]">
              <div className="flex gap-1.5">
                  <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
          </div>
          {/* Form Mockup */}
          <div className="p-4 md:p-8 flex flex-col justify-center h-full relative z-10">
              <div className="text-white font-bold text-lg md:text-xl mb-4 md:mb-6">Create your account</div>
              <div className="space-y-3 md:space-y-4">
                 <div className="space-y-1">
                     <div className="h-1.5 md:h-2 w-16 bg-white/20 rounded"></div>
                     <div className="h-8 md:h-10 bg-white/5 rounded border border-white/10 w-full group-hover:border-purple-500/50 transition-colors"></div>
                 </div>
                 <div className="space-y-1">
                     <div className="h-1.5 md:h-2 w-12 bg-white/20 rounded"></div>
                     <div className="h-8 md:h-10 bg-white/5 rounded border border-white/10 w-full group-hover:border-purple-500/50 transition-colors delay-75"></div>
                 </div>
                 <div className="h-8 md:h-10 bg-white text-black font-bold text-[10px] md:text-xs rounded w-full flex items-center justify-center mt-2 md:mt-4">
                    Get Started
                 </div>
              </div>
          </div>
          
          {/* Background Glow */}
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none"></div>
       </div>
    )
  },
  {
    id: 2,
    label: 'STEP 2',
    tabLabel: 'Test & Customize',
    title: 'Design & Preview',
    description: 'Editează detaliile evenimentului. Alege tema preferată, modifică textul și previzualizează rezultatul în timp real pe mobil.',
    modalTitle: "Pasul 2: Personalizare și Testare",
    modalDescription: "Ai control total asupra aspectului. Poți schimba tema (avem opțiuni precum Editorial, Classic, Botanical), paleta de culori și fonturile. Funcția noastră unică de Live Preview îți arată instant cum va arăta invitația pe un telefon mobil, exact așa cum o vor vedea oaspeții tăi. Poți modifica textele, adăuga detalii despre locație și program oricând.",
    icon: Palette,
    visual: (
       <div className="relative w-full h-full bg-[#0c0c0e] rounded-xl overflow-hidden flex shadow-2xl border border-white/5">
          {/* Sidebar Mockup */}
          <div className="w-14 md:w-20 border-r border-white/5 flex flex-col items-center py-4 md:py-6 gap-4 md:gap-6 bg-[#111113]">
             <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-white/10"></div>
             <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-white/5"></div>
             <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-white/5"></div>
             <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-purple-500/50 text-purple-500 flex items-center justify-center mt-auto">
                <Palette size={12} className="md:w-[14px] md:h-[14px]" />
             </div>
          </div>
          
          {/* Main Area Mockup */}
          <div className="flex-1 p-4 md:p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
              
              <div className="flex items-center justify-between mb-4 md:mb-6">
                 <div className="h-1.5 md:h-2 w-24 md:w-32 bg-white/20 rounded"></div>
                 <div className="h-5 md:h-6 w-16 md:w-20 bg-white/5 rounded-full border border-white/10"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="aspect-[9/16] bg-black rounded-lg border border-white/10 relative overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                          <div className="text-white font-serif text-lg md:text-2xl text-center leading-tight">Alex<br/>&<br/>Maria</div>
                      </div>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                      <div className="h-14 md:h-20 bg-white/5 rounded border border-white/10"></div>
                      <div className="h-14 md:h-20 bg-white/5 rounded border border-white/10"></div>
                      <div className="h-14 md:h-20 bg-white/5 rounded border border-white/10"></div>
                  </div>
              </div>
          </div>
       </div>
    )
  },
  {
    id: 3,
    label: 'STEP 3',
    tabLabel: 'Buy & Use',
    title: 'No Limits',
    description: 'Totul arată perfect? Activează evenimentul cu pachetul Premium. Primești link-ul unic, tracking RSVP și suport prioritar.',
    modalTitle: "Pasul 3: Activare și Distribuire",
    modalDescription: "După ce invitația este perfectă, activezi pachetul Premium. Acesta deblochează link-ul tău unic (de exemplu yes.events/nunta-maria-si-andrei), elimină watermark-ul și îți oferă acces la panoul de administrare a oaspeților (Guest Management). Vei putea vedea cine a confirmat, cine a vizualizat invitația și vei putea exporta lista finală.",
    icon: Rocket,
    visual: (
       <div className="relative w-full h-full bg-[#0c0c0e] rounded-xl overflow-hidden flex flex-col items-center justify-center shadow-2xl relative group border border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-[#0c0c0e] to-[#0c0c0e]"></div>
          
          <div className="relative z-10 flex flex-col items-center p-4">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-4 md:mb-6 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-500">
                 <Rocket size={24} className="md:w-9 md:h-9" />
              </div>
              
              <div className="text-white font-bold text-lg md:text-2xl mb-2">Ready for Lift Off</div>
              <div className="text-gray-500 text-[10px] md:text-sm flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5 font-mono">
                 <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 yes.events/nunta-noastra
              </div>

              <div className="mt-6 md:mt-8 flex gap-3 md:gap-4">
                 <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-400">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><Check size={6} className="md:w-2 md:h-2"/></div>
                    Guests Unlimited
                 </div>
                 <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-400">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><Check size={6} className="md:w-2 md:h-2"/></div>
                    RSVP Analytics
                 </div>
              </div>
          </div>
       </div>
    )
  }
];

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeContent = STEPS.find(s => s.id === activeStep) || STEPS[0];

  return (
    <section className="py-16 md:py-24  relative overflow-hidden border-white/5">
      <div className="wp-container">
        
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6 backdrop-blur-md">
              <Sparkles size={10} className="text-purple-400" />
              <span>How it works</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 leading-[1.1] wp-section-title2">
              Our Simple & <span className="italic font-serif font-normal text-purple-400">Smart Process</span>
            </h2>
            
            <p className="text-gray-400 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto px-4">
              Everything you need to create, customize, and share your perfect invitation in minutes.
            </p>
        </div>

        {/* Interactive Container */}
        <div className="bg-[#111113]/50 border border-white/10 rounded-2xl md:rounded-3xl p-2 md:p-4 max-w-5xl mx-auto backdrop-blur-sm">
            
            {/* Steps Navigation */}
            <div className="grid grid-cols-3 gap-1.5 md:gap-2 mb-4 md:mb-8">
                {STEPS.map((step) => (
                    <button
                        key={step.id}
                        onClick={() => setActiveStep(step.id)}
                        className={`py-3 md:py-6 px-1 md:px-4 rounded-lg md:rounded-xl border text-center transition-all duration-300 relative overflow-hidden group ${
                            activeStep === step.id 
                            ? 'bg-[#18181b] border-white/10 text-white shadow-lg' 
                            : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
                        }`}
                    >
                        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1 opacity-70 group-hover:opacity-100">{step.label}</div>
                        <div className="text-xs md:text-base font-bold leading-tight px-1">{step.tabLabel}</div>
                        
                        {/* Active Indicator Line */}
                        {activeStep === step.id && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 md:w-12 h-1 bg-purple-500 rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center p-4 md:p-8 min-h-[auto] lg:min-h-[400px]">
                
                {/* Visual Mockup - Swapped order visually on mobile by typical design patterns, but keeping DOM order standard */}
                <div className="relative w-full h-[300px] md:h-auto md:aspect-[4/3] lg:aspect-square md:max-h-[400px] mx-auto">
                   <div key={activeContent.id} className="w-full h-full animate-fade-in">
                       {activeContent.visual}
                   </div>
                </div>

                {/* Text Content */}
                <div className="flex flex-col justify-center space-y-4 md:space-y-6 text-center lg:text-left">
                    <div className="text-4xl md:text-7xl font-black text-white/5 font-sans leading-none select-none">
                        0{activeContent.id}
                    </div>
                    
                    <div>
                        <h3 className="text-xl md:text-4xl font-bold text-white mb-2 md:mb-4">
                            {activeContent.title}
                        </h3>
                        <p className="text-gray-400 text-sm md:text-lg leading-relaxed">
                            {activeContent.description}
                        </p>
                    </div>

                    <div className="pt-2 md:pt-4 flex justify-center lg:justify-start">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-white border-b border-purple-500 pb-0.5 hover:text-purple-400 hover:border-purple-400 transition-colors cursor-pointer"
                        >
                            Learn more about this step
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
      
      {/* Modal Overlay */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" 
          onClick={() => setIsModalOpen(false)}
        >
            <div 
                className="bg-[#111113] border border-white/10 p-6 md:p-8 rounded-2xl max-w-lg w-full relative shadow-2xl transform transition-all scale-100" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X size={18}/>
                </button>
                
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                        {activeContent.label}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                        {activeContent.modalTitle}
                    </h3>
                </div>
                
                <div className="space-y-4">
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                        {activeContent.modalDescription}
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Închide
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}