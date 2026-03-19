import React, { useState } from "react";
import { 
  Building2, Link as LinkIcon, Type, Clock, List, Mic, Users, 
  CheckCircle, Save, Heart, Baby, Gift, Calendar, 
  Plus, ToggleRight, ToggleLeft, PenLine
} from 'lucide-react';

// Reusable Input Component
const InputGroup = ({ label, value, icon: Icon }: { label: string, value: string, icon?: any }) => (
  <div>
    <label className="block text-[8px] uppercase font-bold text-gray-500 mb-1">{label}</label>
    <div className="relative">
        <input type="text" defaultValue={value} className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-white/20 transition-colors" />
        {Icon && <Icon size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />}
    </div>
  </div>
);

// Reusable Card Component
const ContentCard = ({ title, icon: Icon, children, headerAction }: { title: string, icon: any, children: React.ReactNode, headerAction?: React.ReactNode }) => (
  <div className="bg-[#0f0f11] border border-white/5 rounded-lg p-3 shadow-sm h-full flex flex-col">
    <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-1.5">
            <Icon size={12} className="text-gray-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-white truncate">{title}</span>
        </div>
        {headerAction}
    </div>
    <div className="flex-1 min-h-0">
      {children}
    </div>
  </div>
);

export default function CustomizationSection() {
  const [activeTab, setActiveTab] = useState<'wedding' | 'baptism' | 'anniversary' | 'office'>('wedding');

  return (
    <section className="wp-custom-section w-full relative overflow-hidden pb-0">
      <div className="wp-grid-bg"></div>
      
      <div className="wp-container">
        <div className="wp-section-header">
          <span className="wp-section-tag">Dashboard</span>
          <h2 className="wp-section-title">Control Total.</h2>
          <p className="wp-section-desc">Platforma YES îți oferă un panou de comandă complet. <br/>Editează detaliile evenimentului tău într-o interfață intuitivă.</p>
        </div>

        {/* Mobile Scaling Wrapper: 
            w-[420px] * scale-[0.85] = ~357px visual width.
            Fits perfectly on standard mobile screens without being too small.
            Cleaned up header for better visibility.
        */}
        <div className="w-full flex justify-center md:block h-[auto] md:h-auto overflow-hidden md:overflow-visible p-4">
            <div className="w-[420px] md:w-full shrink-0 transform scale-[0.85] md:scale-100 origin-top transition-transform duration-300">
                
                <div className="wp-dashboard-wrapper">
                  <div className="wp-dashboard-3d">
                    <div className="wp-dashboard-outer h-full">
                      <div className="wp-dashboard-inner h-full bg-[#09090b] flex flex-col">
                        
                        {/* Header - Simplified for Mobile Visibility */}
                        <div className="h-10 border-b border-white/10 flex items-center justify-center px-3 bg-[#09090b] shrink-0 gap-3 overflow-hidden">
                            
                            {/* Event Type Tabs - Centered & Prominent */}
                            <div className="flex-1 overflow-x-auto no-scrollbar mask-gradient-x flex justify-center">
                                <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                                    <button 
                                        onClick={() => setActiveTab('wedding')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-medium transition-colors whitespace-nowrap ${activeTab === 'wedding' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Heart size={10} /> <span>Nuntă</span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('baptism')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-medium transition-colors whitespace-nowrap ${activeTab === 'baptism' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Baby size={10} /> <span>Botez</span>
                                    </button>
                                     <button 
                                        onClick={() => setActiveTab('anniversary')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-medium transition-colors whitespace-nowrap ${activeTab === 'anniversary' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Gift size={10} /> <span>Aniversare</span>
                                    </button>
                                     <button 
                                        onClick={() => setActiveTab('office')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-medium transition-colors whitespace-nowrap ${activeTab === 'office' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Building2 size={10} /> <span>Office</span>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Content Scroll Area */}
                        <div className="p-2 overflow-y-auto bg-[#050505] text-white custom-scrollbar flex-1 h-[350px]">
                             <div className="max-w-5xl mx-auto space-y-2 pb-4 p-4">
                                
                                {/* WEDDING CONTENT */}
                                {(activeTab === 'wedding' || activeTab === 'anniversary') && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                           <ContentCard title={activeTab === 'anniversary' ? "Detalii" : "Detalii Nuntă"} icon={activeTab === 'anniversary' ? Gift : Heart}>
                                              <div className="space-y-1.5">
                                                 <InputGroup label="Partener 1" value="Prenume Nume" />
                                                 <InputGroup label="Partener 2" value="Prenume Nume" />
                                                 <InputGroup label="Data" value="08/07/2026" icon={Calendar} />
                                              </div>
                                           </ContentCard>
                                           <ContentCard title="Link Public" icon={LinkIcon}>
                                              <div className="space-y-1.5">
                                                  <div>
                                                      <label className="block text-[8px] uppercase font-bold text-gray-500 mb-1">Slug Personalizat</label>
                                                      <div className="flex items-center">
                                                          <div className="bg-[#27272a] border border-white/5 border-r-0 rounded-l px-2 py-1.5 text-[10px] text-gray-400 font-mono">events/</div>
                                                          <input type="text" defaultValue="nume-eveniment" className="flex-1 w-full min-w-0 bg-[#18181b] border border-white/5 rounded-r px-2 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-white/20 transition-colors" />
                                                      </div>
                                                  </div>
                                              </div>
                                           </ContentCard>
                                        </div>

                                        <ContentCard title="Texte Invitație" icon={Type}>
                                           <div className="space-y-2">
                                              <div>
                                                  <div className="flex items-center justify-between mb-1">
                                                      <label className="text-[8px] uppercase font-bold text-gray-500">Mesaj Intro</label>
                                                      <ToggleRight size={16} className="text-green-500 cursor-pointer" />
                                                  </div>
                                                  <input type="text" defaultValue="Ex: Împreună cu familiile noastre..." className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                              </div>
                                              <div>
                                                  <div className="flex items-center justify-between mb-1">
                                                      <label className="text-[8px] uppercase font-bold text-gray-500">Mesaj Celebrare</label>
                                                      <ToggleRight size={16} className="text-green-500 cursor-pointer" />
                                                  </div>
                                                  <input type="text" defaultValue="Ex: Vă invităm la sărbătorirea..." className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                              </div>
                                           </div>
                                        </ContentCard>

                                        <div className="grid grid-cols-3 gap-2">
                                           <ContentCard title="Civilă" icon={Clock} headerAction={<ToggleRight size={16} className="text-green-500" />}>
                                               <div className="space-y-1.5">
                                                  <div className="flex flex-col gap-1.5">
                                                      <input type="text" defaultValue="--:-- --" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px] text-center" />
                                                      <input type="text" defaultValue="Locația" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px]" />
                                                  </div>
                                                  <input type="text" defaultValue="Adresă" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px] text-gray-500" />
                                               </div>
                                           </ContentCard>
                                           <ContentCard title="Religioasă" icon={Clock} headerAction={<ToggleRight size={16} className="text-green-500" />}>
                                               <div className="space-y-1.5">
                                                  <div className="flex flex-col gap-1.5">
                                                      <input type="text" defaultValue="--:-- --" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px] text-center" />
                                                      <input type="text" defaultValue="Locația" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px]" />
                                                  </div>
                                                  <input type="text" defaultValue="Adresă" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px] text-gray-500" />
                                               </div>
                                           </ContentCard>
                                           <ContentCard title="Party" icon={Clock} headerAction={<ToggleRight size={16} className="text-green-500" />}>
                                               <div className="space-y-1.5">
                                                  <div className="flex flex-col gap-1.5">
                                                      <input type="text" defaultValue="--:-- --" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px] text-center" />
                                                      <input type="text" defaultValue="Sala" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px]" />
                                                  </div>
                                                  <input type="text" defaultValue="Adresă" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px] text-gray-500" />
                                               </div>
                                           </ContentCard>
                                        </div>

                                        <ContentCard title="Cronologie" icon={List} headerAction={<div className="flex items-center gap-1"><ToggleRight size={16} className="text-green-500" /><button className="px-1.5 py-0.5 border border-white/10 rounded text-[8px] uppercase font-bold">+</button></div>}>
                                           <div className="py-2 text-center text-gray-600 text-[9px] italic border border-dashed border-white/5 rounded">Niciun moment adăugat.</div>
                                        </ContentCard>

                                        <div className="grid grid-cols-2 gap-2">
                                           <ContentCard title="Nașii" icon={Users} headerAction={<div className="flex items-center gap-1"><ToggleLeft size={16} className="text-gray-600" /><button className="px-1.5 py-0.5 border border-white/10 rounded text-[8px] uppercase font-bold">+</button></div>}>
                                              <div className="grid grid-cols-2 gap-2">
                                                 <input type="text" defaultValue="Nașul" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                                 <input type="text" defaultValue="Nașa" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                              </div>
                                           </ContentCard>
                                           <ContentCard title="Părinții" icon={Users} headerAction={<ToggleRight size={16} className="text-green-500" />}>
                                              <div className="space-y-1.5">
                                                 <div className="grid grid-cols-2 gap-2">
                                                    <input type="text" defaultValue="Tatăl 1" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                                    <input type="text" defaultValue="Mama 1" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-2">
                                                    <input type="text" defaultValue="Tatăl 2" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                                    <input type="text" defaultValue="Mama 2" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                                 </div>
                                              </div>
                                           </ContentCard>
                                        </div>
                                    </>
                                )}

                                {/* BAPTISM CONTENT */}
                                {activeTab === 'baptism' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                           <ContentCard title="Detalii Botez" icon={Baby}>
                                              <div className="space-y-1.5">
                                                 <InputGroup label="Nume Copil" value="Numele Copilului" />
                                                 <InputGroup label="Data" value="08/07/2026" icon={Calendar} />
                                              </div>
                                           </ContentCard>
                                           <ContentCard title="Link Public" icon={LinkIcon}>
                                              <div className="space-y-1.5">
                                                  <div>
                                                      <label className="block text-[8px] uppercase font-bold text-gray-500 mb-1">Slug Personalizat</label>
                                                      <div className="flex items-center">
                                                          <div className="bg-[#27272a] border border-white/5 border-r-0 rounded-l px-2 py-1.5 text-[10px] text-gray-400 font-mono">events/</div>
                                                          <input type="text" defaultValue="nume-eveniment" className="flex-1 w-full min-w-0 bg-[#18181b] border border-white/5 rounded-r px-2 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-white/20 transition-colors" />
                                                      </div>
                                                  </div>
                                              </div>
                                           </ContentCard>
                                        </div>

                                        <ContentCard title="Texte Invitație" icon={Type}>
                                           <div className="space-y-2">
                                              <div>
                                                  <div className="flex items-center justify-between mb-1">
                                                      <label className="text-[8px] uppercase font-bold text-gray-500">Mesaj Intro</label>
                                                      <ToggleRight size={16} className="text-green-500 cursor-pointer" />
                                                  </div>
                                                  <input type="text" defaultValue="Ex: Împreună cu familiile noastre..." className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                              </div>
                                              <div>
                                                  <div className="flex items-center justify-between mb-1">
                                                      <label className="text-[8px] uppercase font-bold text-gray-500">Mesaj Celebrare</label>
                                                      <ToggleRight size={16} className="text-green-500 cursor-pointer" />
                                                  </div>
                                                  <input type="text" defaultValue="Ex: Vă invităm la sărbătorirea..." className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                              </div>
                                           </div>
                                        </ContentCard>

                                        <div className="grid grid-cols-2 gap-2">
                                           <ContentCard title="Sfântul Botez" icon={Clock} headerAction={<ToggleRight size={16} className="text-green-500" />}>
                                               <div className="space-y-1.5">
                                                  <div className="flex flex-col gap-1.5">
                                                      <input type="text" defaultValue="--:-- --" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px] text-center" />
                                                      <input type="text" defaultValue="Locația" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px]" />
                                                  </div>
                                                  <input type="text" defaultValue="Adresă" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px] text-gray-500" />
                                               </div>
                                           </ContentCard>
                                           <ContentCard title="Masa de Seară" icon={Clock} headerAction={<ToggleRight size={16} className="text-green-500" />}>
                                               <div className="space-y-1.5">
                                                  <div className="flex flex-col gap-1.5">
                                                      <input type="text" defaultValue="--:-- --" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px] text-center" />
                                                      <input type="text" defaultValue="Sala" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px]" />
                                                  </div>
                                                  <input type="text" defaultValue="Adresă" className="w-full bg-[#18181b] border border-white/5 rounded px-1.5 py-1 text-[9px] text-gray-500" />
                                               </div>
                                           </ContentCard>
                                        </div>

                                        <ContentCard title="Cronologie" icon={List} headerAction={<div className="flex items-center gap-1"><ToggleRight size={16} className="text-green-500" /><button className="px-1.5 py-0.5 border border-white/10 rounded text-[8px] uppercase font-bold">+</button></div>}>
                                           <div className="py-2 text-center text-gray-600 text-[9px] italic border border-dashed border-white/5 rounded">Niciun moment adăugat.</div>
                                        </ContentCard>

                                        <div className="grid grid-cols-2 gap-2">
                                           <ContentCard title="Nașii" icon={Users} headerAction={<div className="flex items-center gap-1"><ToggleLeft size={16} className="text-gray-600" /><button className="px-1.5 py-0.5 border border-white/10 rounded text-[8px] uppercase font-bold">+</button></div>}>
                                              <div className="grid grid-cols-2 gap-2">
                                                 <input type="text" defaultValue="Nașul" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                                 <input type="text" defaultValue="Nașa" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                              </div>
                                           </ContentCard>
                                           <ContentCard title="Părinții" icon={Users} headerAction={<ToggleRight size={16} className="text-green-500" />}>
                                              <div className="space-y-1.5">
                                                 <div className="grid grid-cols-2 gap-2">
                                                    <input type="text" defaultValue="Tatăl" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                                    <input type="text" defaultValue="Mama" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500" />
                                                 </div>
                                              </div>
                                           </ContentCard>
                                        </div>
                                    </>
                                )}

                                {/* OFFICE CONTENT */}
                                {activeTab === 'office' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <ContentCard title="Detalii Corporate" icon={Building2}>
                                                <div className="space-y-1.5">
                                                    <InputGroup label="Companie" value="Numele Companiei" />
                                                    <InputGroup label="Data" value="08/07/2026" icon={Calendar} />
                                                </div>
                                            </ContentCard>
                                            <ContentCard title="Link Public" icon={LinkIcon}>
                                                <div className="space-y-1.5">
                                                    <div>
                                                        <label className="block text-[8px] uppercase font-bold text-gray-500 mb-1">Slug Personalizat</label>
                                                        <div className="flex items-center">
                                                            <div className="bg-[#27272a] border border-white/5 border-r-0 rounded-l px-2 py-1.5 text-[10px] text-gray-400 font-mono">events/</div>
                                                            <input type="text" defaultValue="nume-eveniment" className="flex-1 w-full min-w-0 bg-[#18181b] border border-white/5 rounded-r px-2 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-white/20 transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </ContentCard>
                                        </div>
                                        
                                        <ContentCard title="Petrecerea" icon={Clock} headerAction={<div className="flex gap-2"><div className="text-gray-600 cursor-pointer hover:text-white transition-colors"><PenLine size={14}/></div><ToggleRight size={16} className="text-green-500 cursor-pointer" /></div>}>
                                            <div className="flex flex-col gap-1.5 mb-1.5">
                                                <input type="text" defaultValue="--:-- --" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-center text-gray-300 font-mono focus:outline-none focus:border-white/20" />
                                                <input type="text" defaultValue="Sala / Restaurantul" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500 focus:outline-none focus:border-white/20" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <input type="text" defaultValue="Adresă" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500 focus:outline-none focus:border-white/20" />
                                                <input type="text" defaultValue="Link Waze" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-500 focus:outline-none focus:border-white/20" />
                                            </div>
                                        </ContentCard>

                                        <div className="grid grid-cols-2 gap-2">
                                            <ContentCard title="Speakers / VIP" icon={Mic} headerAction={<div className="flex items-center gap-1.5"><ToggleLeft size={16} className="text-gray-600 cursor-pointer" /><button className="px-1.5 py-0.5 border border-white/10 rounded text-[8px] font-bold uppercase hover:bg-white/5 transition-colors text-gray-300"><Plus size={10} /> Add</button></div>}>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="text" defaultValue="Nume" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-600 focus:outline-none focus:border-white/20" />
                                                    <input type="text" defaultValue="Funcție" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-600 focus:outline-none focus:border-white/20" />
                                                </div>
                                            </ContentCard>

                                            <ContentCard title="Organizatori" icon={Users} headerAction={<ToggleRight size={16} className="text-green-500 ml-2 cursor-pointer" />}>
                                                <div className="space-y-1.5">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input type="text" defaultValue="Nume" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-400 focus:outline-none focus:border-white/20" />
                                                        <input type="text" defaultValue="Titlu" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-400 focus:outline-none focus:border-white/20" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input type="text" defaultValue="Nume" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-400 focus:outline-none focus:border-white/20" />
                                                        <input type="text" defaultValue="Titlu" className="w-full bg-[#18181b] border border-white/5 rounded px-2 py-1.5 text-[10px] text-gray-400 focus:outline-none focus:border-white/20" />
                                                    </div>
                                                </div>
                                            </ContentCard>
                                        </div>
                                    </>
                                )}

                             </div>
                        </div>

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