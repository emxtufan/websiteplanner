import React from 'react';
import { 
  Calendar, MapPin, Gift, Utensils, Camera, Clock, Bell, Users, 
  Grid, Sun, Bus, Bed, QrCode, Phone, CheckCircle, Music,
  MessageCircle, Heart, ShieldCheck, Zap, Search, Star, CreditCard
} from 'lucide-react';

// Master list of 20 items
const ALL_FEATURES = [
  { icon: CheckCircle, label: "RSVP Instant", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: MapPin, label: "Waze & Maps", color: "text-blue-400", bg: "bg-blue-400/10" },
  { icon: Gift, label: "Wishlist", color: "text-pink-400", bg: "bg-pink-400/10" },
  { icon: Utensils, label: "Meniu Digital", color: "text-orange-400", bg: "bg-orange-400/10" },
  { icon: ShieldCheck, label: "Admin Panel", color: "text-gray-300", bg: "bg-gray-400/10" },
  { icon: Camera, label: "Galerie Foto", color: "text-purple-400", bg: "bg-purple-400/10" },
  { icon: Clock, label: "Countdown", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { icon: Bell, label: "Notificări", color: "text-red-400", bg: "bg-red-400/10" },
  { icon: Users, label: "Guest List", color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { icon: Zap, label: "Automations", color: "text-amber-300", bg: "bg-amber-400/10" },
  { icon: Grid, label: "Așezare Mese", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { icon: Sun, label: "Meteo", color: "text-sky-400", bg: "bg-sky-400/10" },
  { icon: Bus, label: "Transport", color: "text-lime-400", bg: "bg-lime-400/10" },
  { icon: Bed, label: "Cazare", color: "text-rose-400", bg: "bg-rose-400/10" },
  { icon: MessageCircle, label: "Chat Box", color: "text-teal-400", bg: "bg-teal-400/10" },
  { icon: QrCode, label: "Access QR", color: "text-white", bg: "bg-white/10" },
  { icon: Phone, label: "Contact", color: "text-green-400", bg: "bg-green-400/10" },
  { icon: Music, label: "Playlist", color: "text-fuchsia-400", bg: "bg-fuchsia-400/10" },
  { icon: Search, label: "Căutare", color: "text-violet-400", bg: "bg-violet-400/10" },
  { icon: Star, label: "Highlights", color: "text-yellow-500", bg: "bg-yellow-500/10" },
];

// Desktop Columns (4 columns x 5 items)
const COL_1 = ALL_FEATURES.slice(0, 5);
const COL_2 = ALL_FEATURES.slice(5, 10);
const COL_3 = ALL_FEATURES.slice(10, 15);
const COL_4 = ALL_FEATURES.slice(15, 20);

// Mobile Rows (3 rows x ~7 items)
const ROW_1 = [...ALL_FEATURES.slice(0, 7)];
const ROW_2 = [...ALL_FEATURES.slice(7, 14)];
const ROW_3 = [...ALL_FEATURES.slice(14, 20), ALL_FEATURES[0]]; // Wrap around a bit

const FeatureCard = ({ item }: { item: any }) => (
  <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-[#111113] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-3 p-2 md:p-4 shadow-xl hover:border-white/20 transition-colors group mx-2 md:mx-0 md:my-3">
    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
      <item.icon size={16} className="md:w-6 md:h-6" strokeWidth={1.5} />
    </div>
    <span className="text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-white transition-colors text-center leading-tight">{item.label}</span>
  </div>
);

// Component for Desktop Vertical Scroll
const InfiniteColumn = ({ items, reverse = false, duration = "20s" }: { items: any[], reverse?: boolean, duration?: string }) => (
  <div className="flex flex-col h-[600px] overflow-hidden relative mask-gradient-y w-32">
    <div 
      className={`flex flex-col ${reverse ? 'animate-scroll-down' : 'animate-scroll-up'}`}
      style={{ animationDuration: duration }}
    >
      {[...items, ...items, ...items].map((item, idx) => (
        <FeatureCard key={`col-${item.label}-${idx}`} item={item} />
      ))}
    </div>
  </div>
);

// Component for Mobile Horizontal Scroll
const InfiniteRow = ({ items, reverse = false, duration = "40s" }: { items: any[], reverse?: boolean, duration?: string }) => {
  const scrollItems = [...items, ...items, ...items];
  return (
    <div className="flex overflow-hidden relative w-full mask-gradient-x py-1">
      <div 
        className={`flex ${reverse ? 'animate-scroll-right' : 'animate-scroll-left'}`}
        style={{ animationDuration: duration }}
      >
        {scrollItems.map((item, idx) => (
          <FeatureCard key={`row-${item.label}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
};

export default function InfiniteFeatureSection() {
  return (
    <section className="py-12 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 "></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full relative z-10 overflow-hidden">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-2 px-4 relative z-20">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight wp-section-title">
            Tot ce ai nevoie.<br/>
            <span className="text-gray-500">Într-un singur loc.</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Platforma integrează toate instrumentele necesare pentru o organizare fără cusur.
          </p>
        </div>

        {/* Main Content Area - Added negative top margin on mobile to reduce gap */}
        <div className="relative min-h-[500px] md:min-h-[700px] flex justify-center items-center -mt-24 md:mt-0">
            
            {/* DESKTOP: Left Columns */}
            <div className="hidden md:flex gap-4 mr-8 opacity-60 hover:opacity-100 transition-opacity duration-500">
               <div className="translate-y-12">
                   <InfiniteColumn items={COL_1} duration="35s" />
               </div>
               <div>
                   <InfiniteColumn items={COL_2} reverse duration="42s" />
               </div>
            </div>

            {/* MOBILE: Background Rows (Absolute) */}
            <div className="md:hidden absolute inset-0 flex flex-col justify-center gap-6 opacity-50 pointer-events-none">
               <InfiniteRow items={ROW_1} duration="45s" />
               <InfiniteRow items={ROW_2} reverse duration="50s" />
               <InfiniteRow items={ROW_3} duration="55s" />
            </div>

            {/* CENTRAL PHONE */}
            <div className="relative z-20 transform scale-[0.55] md:scale-100 transition-transform duration-500 shrink-0">
                {/* Phone Bezel */}
                <div className="relative w-[300px] h-[600px] bg-[#000] rounded-[3rem] border-8 border-[#1a1a1a] shadow-2xl overflow-hidden">
                    {/* Dynamic Island */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-30"></div>
                    
                    {/* Screen Content */}
                    <div className="w-full h-full bg-[#09090b] flex flex-col text-white overflow-hidden font-sans">
                        
                        {/* Status Bar */}
                        <div className="h-8 flex items-center justify-between px-5 pt-3 text-[10px] font-medium text-gray-400 shrink-0">
                            <span>19:02</span>
                            <div className="flex gap-1">
                                <div className="w-4 h-2.5 bg-white rounded-sm"></div>
                            </div>
                        </div>

                        {/* App Header */}
                        <div className="px-5 pt-2 pb-4 shrink-0 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Dashboard</div>
                                <div className="text-xl font-bold text-white">Panou Control</div>
                            </div>
                            <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[9px] text-green-500 font-bold flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                Live
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 no-scrollbar">
                            
                            {/* Countdown */}
                            <div className="text-center py-2">
                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-3">Timp Rămas Până La Eveniment</div>
                                <div className="flex justify-center gap-2">
                                    {[{val: '166', label: 'Zile'}, {val: '00', label: 'Ore'}, {val: '10', label: 'Min'}, {val: '46', label: 'Sec'}].map((t, i) => (
                                        <div key={i} className="bg-[#18181b] border border-white/10 rounded-lg p-2 w-14 flex flex-col items-center shadow-lg">
                                            <span className="text-xl font-bold leading-none mb-1 text-white">{t.val}</span>
                                            <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">{t.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Progress Card */}
                            <div className="bg-[#111113] border border-white/10 rounded-xl p-4 relative overflow-hidden shadow-lg group hover:border-blue-500/30 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_2px_rgba(59,130,246,0.5)]"></div>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1 rounded bg-blue-500/10 text-blue-500">
                                                <TargetIcon size={10} />
                                            </div>
                                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Progres General</span>
                                        </div>
                                        <div className="text-2xl font-bold ml-1">2<span className="text-sm text-gray-500 font-normal">/30</span></div>
                                    </div>
                                    <div className="text-blue-500 font-bold text-xl">7%</div>
                                </div>
                                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                                    <div className="w-[7%] h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-gray-400 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <CheckCircle size={10} className="text-green-500" />
                                    <span>Ai finalizat 2 sarcini. Mai ai 28.</span>
                                </div>
                            </div>

                            {/* Priorities List */}
                            <div className="bg-[#111113] border border-white/10 rounded-xl p-4 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 shadow-[0_0_15px_2px_rgba(234,179,8,0.3)]"></div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1 rounded bg-yellow-500/10 text-yellow-500">
                                        <Star size={10} fill="currentColor" />
                                    </div>
                                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Top Priorități</span>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        {task: "Stabilirea datei", date: "Feb 10"},
                                        {task: "Alegerea locației", date: "Feb 18"},
                                        {task: "Bugetul inițial", date: "Feb 20"},
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between bg-[#09090b] p-2.5 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]"></div>
                                                <span className="text-[10px] font-bold text-gray-200">{item.task}</span>
                                            </div>
                                            <span className="text-[9px] text-gray-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">{item.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#111113] border border-white/10 rounded-xl p-3 relative overflow-hidden shadow-lg">
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500"></div>
                                    <div className="flex justify-between items-start mb-2">
                                         <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Invitați</div>
                                         <Users size={12} className="text-indigo-500" />
                                    </div>
                                    <div className="text-xl font-bold text-white">124</div>
                                    <div className="text-[9px] text-gray-500 mt-1">din 150 locuri</div>
                                </div>
                                <div className="bg-[#111113] border border-white/10 rounded-xl p-3 relative overflow-hidden shadow-lg">
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"></div>
                                     <div className="flex justify-between items-start mb-2">
                                         <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Buget</div>
                                         <CreditCard size={12} className="text-purple-500" />
                                    </div>
                                    <div className="text-xl font-bold text-white">0 <span className="text-[10px]">LEI</span></div>
                                    <div className="text-[9px] text-gray-500 mt-1">0% cheltuit</div>
                                </div>
                            </div>

                        </div>

                        {/* Bottom Nav Mockup */}
                        <div className="h-14 border-t border-white/5 flex items-center justify-around px-2 bg-[#0c0c0e] shrink-0 z-20">
                            <div className="flex flex-col items-center gap-1.5 text-white">
                                <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 text-gray-700">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 border border-gray-700 rounded-sm"></div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 text-gray-700">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 border border-gray-700 rounded-sm"></div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 text-gray-700">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 border border-gray-700 rounded-sm"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                
                {/* Phone Glow */}
                <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-[3.2rem] blur opacity-40 -z-10 animate-pulse"></div>
            </div>

            {/* DESKTOP: Right Columns */}
            <div className="hidden md:flex gap-4 ml-8 opacity-60 hover:opacity-100 transition-opacity duration-500">
               <div>
                   <InfiniteColumn items={COL_3} duration="38s" />
               </div>
               <div className="translate-y-12">
                   <InfiniteColumn items={COL_4} reverse duration="48s" />
               </div>
            </div>

        </div>

      </div>

      <style>{`
        .mask-gradient-x {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .mask-gradient-y {
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
        
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-33.33%); }
          100% { transform: translateY(0); }
        }

        .animate-scroll-left { animation: scroll-left linear infinite; }
        .animate-scroll-right { animation: scroll-right linear infinite; }
        .animate-scroll-up { animation: scroll-up linear infinite; }
        .animate-scroll-down { animation: scroll-down linear infinite; }
      `}</style>
    </section>
  );
}

// Icon helper since Target isn't in main exports if needed, 
// but using Lucide icons generally available.
// Adding a small local component if TargetIcon is missing or use CheckCircle
const TargetIcon = ({ size = 16, ...props }: any) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
);