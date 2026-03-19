import React from 'react';

// Simple text-based SVGs to simulate editorial logos without external assets
const LOGOS = [
  {
    name: "VOGUE",
    svg: (
      <svg viewBox="0 0 120 40" fill="currentColor" className="h-8 w-auto">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="serif" fontSize="28" fontWeight="bold" letterSpacing="2">VOGUE</text>
      </svg>
    )
  },
  {
    name: "BRIDES",
    svg: (
      <svg viewBox="0 0 120 40" fill="currentColor" className="h-8 w-auto">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="serif" fontSize="26" fontStyle="italic" letterSpacing="1">Brides</text>
      </svg>
    )
  },
  {
    name: "THE KNOT",
    svg: (
      <svg viewBox="0 0 140 40" fill="currentColor" className="h-8 w-auto">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="22" fontWeight="900" letterSpacing="0">the knot</text>
      </svg>
    )
  },
  {
    name: "BAZAAR",
    svg: (
      <svg viewBox="0 0 140 40" fill="currentColor" className="h-8 w-auto">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="serif" fontSize="24" fontWeight="bold" letterSpacing="4">BAZAAR</text>
      </svg>
    )
  },
  {
    name: "MARTHA STEWART",
    svg: (
      <svg viewBox="0 0 200 40" fill="currentColor" className="h-8 w-auto">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="serif" fontSize="20" fontWeight="500" letterSpacing="1">MARTHA STEWART</text>
      </svg>
    )
  },
  {
    name: "GQ",
    svg: (
      <svg viewBox="0 0 80 40" fill="currentColor" className="h-8 w-auto">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="32" fontWeight="900" letterSpacing="-2">GQ</text>
      </svg>
    )
  },
  {
    name: "Vanity Fair",
    svg: (
      <svg viewBox="0 0 160 40" fill="currentColor" className="h-8 w-auto">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="serif" fontSize="24" fontWeight="bold" letterSpacing="0">VANITY FAIR</text>
      </svg>
    )
  }
];

export default function PartnersSection() {
  return (
    <section className="md:py-12 relative overflow-hidden">
      <div className="wp-container">
        
        {/* <div className="text-center mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Editorial & Partners
            </p>
        </div> */}

        <div className="relative w-full overflow-hidden">
          {/* Fade Masks */}
          <div className="absolute top-0 left-0 h-full w-20 md:w-40 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 h-full w-20 md:w-40 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling Container */}
          <div className="flex w-max animate-logo-scroll hover:[animation-play-state:paused]">
            
            {/* First Set of Logos */}
            <div className="flex items-center gap-16 md:gap-24 px-8 md:px-12">
              {LOGOS.map((logo, idx) => (
                <div 
                  key={`l1-${idx}`} 
                  className="text-gray-500 hover:text-white transition-colors duration-300 opacity-60 hover:opacity-100 cursor-default select-none grayscale hover:grayscale-0"
                  title={logo.name}
                >
                  {logo.svg}
                </div>
              ))}
            </div>

            {/* Duplicate Set for Infinite Loop */}
            <div className="flex items-center gap-16 md:gap-24 px-8 md:px-12" aria-hidden="true">
              {LOGOS.map((logo, idx) => (
                <div 
                  key={`l2-${idx}`} 
                  className="text-gray-500 hover:text-white transition-colors duration-300 opacity-60 hover:opacity-100 cursor-default select-none grayscale hover:grayscale-0"
                >
                  {logo.svg}
                </div>
              ))}
            </div>
             {/* Triplicate Set for smooth large screens */}
            <div className="flex items-center gap-16 md:gap-24 px-8 md:px-12" aria-hidden="true">
              {LOGOS.map((logo, idx) => (
                <div 
                  key={`l3-${idx}`} 
                  className="text-gray-500 hover:text-white transition-colors duration-300 opacity-60 hover:opacity-100 cursor-default select-none grayscale hover:grayscale-0"
                >
                  {logo.svg}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-logo-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </section>
  );
}
