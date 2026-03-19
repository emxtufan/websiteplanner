import React, { useState, useEffect } from 'react';
import { Star, Heart, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    couple: "Alex & Maria",
    type: "Modern Garden Wedding",
    location: "Palatul Snagov",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
    story: "Ne doream o nuntă relaxată, fără stresul listelor pe hârtie. Platforma ne-a permis să centralizăm totul. Invitații au fost impresionați de designul digital, iar noi am putut vedea confirmările în timp real.",
    stats: [
      { value: "98%", label: "Rată RSVP" },
      { value: "45h", label: "Timp Economisit" }
    ],
    quote: {
      text: "Au înțeles perfect viziunea noastră minimalistă. Funcția de RSVP automat a eliminat complet haosul telefoanelor.",
      highlight: "viziunea minimalistă",
      highlight2: "eliminat haosul"
    }
  },
  {
    id: 2,
    couple: "Andrei & Ioana",
    type: "Classic Cathedral",
    location: "Cluj-Napoca",
    image: "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=1974&auto=format&fit=crop",
    story: "Aveam invitați din toată lumea. Faptul că am putut pune link-uri de Waze și recomandări de cazare direct în invitație a fost un game-changer. Nimeni nu ne-a sunat să ne întrebe unde este locația.",
    stats: [
      { value: "250+", label: "Invitați Gestionați" },
      { value: "0", label: "Apeluri 'Unde e?'" }
    ],
    quote: {
      text: "Un instrument indispensabil pentru o nuntă mare. Oaspeții noștri au apreciat detaliile și organizarea impecabilă.",
      highlight: "instrument indispensabil",
      highlight2: "organizarea impecabilă"
    }
  },
  {
    id: 3,
    couple: "Ștefan & Elena",
    type: "Destination Wedding",
    location: "Toscana, Italy",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop",
    story: "Să organizezi o nuntă în altă țară e un coșmar logistic. YES ne-a ajutat să ținem toți invitații informați cu schimbările de program. Designul 'Botanical' s-a potrivit perfect cu peisajul.",
    stats: [
      { value: "100%", label: "Feedback Pozitiv" },
      { value: "3", label: "Update-uri Trimise" }
    ],
    quote: {
      text: "Designul a dat tonul evenimentului înainte ca acesta să înceapă. A fost simplu, elegant și incredibil de eficient.",
      highlight: "dat tonul",
      highlight2: "incredibil de eficient"
    }
  }
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getCardStyle = (index: number) => {
    // Calculate position in the stack (0 = Front, 1 = Middle Back, 2 = Far Back)
    const position = (index - activeIndex + TESTIMONIALS.length) % TESTIMONIALS.length;

    const baseStyle = {
        transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
        position: 'absolute' as 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    };

    if (position === 0) {
        // FRONT CARD
        return {
            ...baseStyle,
            zIndex: 30,
            transform: 'scale(1) translateY(0)',
            opacity: 1,
            filter: 'brightness(1)',
            pointerEvents: 'auto' as 'auto'
        };
    } else if (position === 1) {
        // SECOND CARD (Middle Back) - Adjusted for more visibility
        return {
            ...baseStyle,
            zIndex: 20,
            transform: 'scale(0.95) translateY(-45px)', 
            opacity: 1, 
            filter: 'brightness(0.6)',
            pointerEvents: 'none' as 'none'
        };
    } else {
        // THIRD CARD (Back) - Adjusted for more visibility
        return {
            ...baseStyle,
            zIndex: 10,
            transform: 'scale(0.90) translateY(-90px)',
            opacity: 1,
            filter: 'brightness(0.4)',
            pointerEvents: 'none' as 'none'
        };
    }
  };

  return (
    <section className="py-12 md:py-32 relative overflow-hidden  border-white/5" id='testimonials'>
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-purple-900/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="wp-container relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20 md:mb-32">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <Heart size={10} className="text-pink-500 fill-pink-500" />
              <span>Our Clients</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1] wp-section-title">
              Real Weddings to <span className="font-serif italic font-normal text-purple-400">Inspire</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-lg leading-relaxed max-w-xl mx-auto">
              Descoperă cum cuplurile moderne folosesc tehnologia pentru a scăpa de stres și a crea experiențe memorabile.
            </p>
        </div>

        {/* --- CARD STACK CAROUSEL --- */}
        {/* Fixed height container is crucial for absolute positioning children */}
        <div className="relative max-w-5xl mx-auto mb-16 h-[650px] md:h-[500px]">
            
            {TESTIMONIALS.map((item, index) => (
                <div 
                    key={item.id}
                    style={getCardStyle(index)}
                    className="rounded-3xl shadow-2xl overflow-hidden group bg-[#0c0c0e] border border-white/10"
                >
                    {/* Header Bar inside Card */}
                    <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-[#111113]">
                        <div className="flex gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-white/5"></div>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-white/20"></div>
                            <div className="w-1 h-1 rounded-full bg-white/20"></div>
                            <div className="w-1 h-1 rounded-full bg-white/20"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100%-40px)]">
                        
                        {/* Left: Content */}
                        <div className="p-6 md:p-10 flex flex-col justify-center relative bg-[#0c0c0e]">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4 md:mb-6">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-serif italic text-base md:text-lg shadow-lg">
                                        {item.couple.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-white text-lg md:text-xl font-bold leading-tight">{item.couple}</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">{item.location}</p>
                                    </div>
                                </div>

                                <h4 className="text-xl md:text-3xl font-serif text-gray-200 mb-4 md:mb-6 leading-tight">
                                    {item.type}
                                </h4>
                                
                                <p className="text-gray-400 text-sm leading-relaxed mb-8 md:mb-10 min-h-[60px] md:min-h-[80px]">
                                    {item.story}
                                </p>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    {item.stats.map((stat, idx) => (
                                        <div key={idx} className="bg-[#151518] border border-white/5 p-3 md:p-4 rounded-xl">
                                            <div className="text-xl md:text-3xl font-bold text-white mb-1 text-purple-400">{stat.value}</div>
                                            <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider font-bold">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Image */}
                        <div className="relative h-56 md:h-full overflow-hidden order-first md:order-last border-b md:border-b-0 md:border-l border-white/5">
                            <img 
                                src={item.image} 
                                alt={item.couple} 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent opacity-80 md:bg-gradient-to-l"></div>
                            
                            {/* Floating Rating Badge */}
                            <div className="absolute top-4 right-4 md:top-6 md:right-6 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1.5 text-white text-xs font-bold">
                                <div className="flex text-yellow-500">
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                </div>
                                <span>5.0</span>
                            </div>
                        </div>

                    </div>
                </div>
            ))}
            
        </div>

        {/* --- BOTTOM QUOTE & NAVIGATION --- */}
        <div className="max-w-4xl mx-auto text-center px-4 relative z-40">
            <div className="mb-8 relative min-h-[100px] flex flex-col items-center justify-center">
                <Quote className="absolute -top-6 left-1/2 -translate-x-1/2 text-white/5 w-12 h-12 rotate-180" />
                <p 
                    key={activeIndex} 
                    className="text-lg md:text-3xl font-serif text-gray-500 leading-normal md:leading-relaxed animate-fade-in-up px-4"
                >
                    "
                    {TESTIMONIALS[activeIndex].quote.text.split(TESTIMONIALS[activeIndex].quote.highlight).map((part, i, arr) => (
                        <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && (
                                <span className="text-white italic relative inline-block px-1">
                                    {TESTIMONIALS[activeIndex].quote.highlight}
                                    <span className="absolute bottom-1 left-0 w-full h-[1px] bg-purple-500/50"></span>
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                    "
                </p>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-3">
                {TESTIMONIALS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`transition-all duration-300 rounded-full ${
                            activeIndex === idx 
                                ? 'w-8 h-2 bg-purple-500' 
                                : 'w-2 h-2 bg-gray-700 hover:bg-gray-500'
                        }`}
                        aria-label={`Go to testimonial ${idx + 1}`}
                    />
                ))}
            </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}