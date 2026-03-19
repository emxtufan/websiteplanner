
import React from "react";
import { IconCursor, IconWallet, IconLink, IconZap } from "./Icons";
import SpotlightCard from "./SpotlightCard";
import PixelBlast from './bgEffects/PixelBlast';
import Grainient from './bgEffects/Grainient';
import DotGrid from './bgEffects/DotGrid';
import TrueFocus from "./effectText/TrueFocus/TrueFocus";
import BlurText from "./effectText/BlurText/BlurText ";

const SEAT_ANGLES = [0, 60, 120, 180, 240, 300];

function SeatingVisual() {
  return (
    <div className="wp-seating-visual">
      {/* Local styles for the specific multi-table animation */}
      <style>{`
        @keyframes moveGuest {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          10% { transform: translate(0, 0) scale(1); opacity: 1; }
          20% { transform: translate(0, 0) scale(1.1); } /* Pick up */
          60% { transform: translate(120px, 90px) scale(1.1); } /* Move to Table 2 */
          70% { transform: translate(120px, 90px) scale(0); opacity: 1; } /* Drop */
          71% { opacity: 0; }
          100% { opacity: 0; transform: translate(0, 0); }
        }
        @keyframes fillSeat {
          0%, 65% { background: var(--bg-card2); border-color: rgba(255,255,255,.1); color: transparent; }
          70%, 95% { background: rgba(129,140,248,.15); border-color: rgba(129,140,248,.3); color: var(--accent); }
          100% { background: var(--bg-card2); border-color: rgba(255,255,255,.1); color: transparent; }
        }
        .wp-drag-guest-multi {
          position: absolute;
          top: 25%;
          left: 25%;
          z-index: 10;
          animation: moveGuest 4s ease-in-out infinite;
        }
        .wp-target-seat {
          animation: fillSeat 4s ease-in-out infinite;
        }
      `}</style>

      <div className="wp-seating-inner" style={{ position: 'relative' }}>
        
        {/* TABLE 1 (Source) */}
        <div className="wp-seat-table" style={{ position: 'absolute', top: '25%', left: '25%', transform: 'translate(-50%, -50%) scale(0.9)' }}>
          <div className="wp-seat-table-label">Masa 1</div>
          {SEAT_ANGLES.map((deg, i) => (
            <div
              key={deg}
              className={`wp-seat taken`}
              style={{
                top: "50%", left: "50%",
                transform: `translate(-50%,-50%) rotate(${deg}deg) translate(52px) rotate(-${deg}deg)`,
              }}
            >
              {/* Some guests */}
              {i < 3 ? String.fromCharCode(65 + i) : ""}
            </div>
          ))}
        </div>

        {/* TABLE 2 (Target) */}
        <div className="wp-seat-table" style={{ position: 'absolute', top: '65%', left: '70%', transform: 'translate(-50%, -50%) scale(0.9)' }}>
          <div className="wp-seat-table-label">Masa 2</div>
          {SEAT_ANGLES.map((deg, i) => {
            // The seat at 300 degrees is the target for the animation
            const isTarget = deg === 300; 
            return (
              <div
                key={deg}
                className={`wp-seat ${!isTarget && i > 1 ? "taken" : ""} ${isTarget ? "wp-target-seat" : ""}`}
                style={{
                  top: "50%", left: "50%",
                  transform: `translate(-50%,-50%) rotate(${deg}deg) translate(52px) rotate(-${deg}deg)`,
                }}
              >
                {/* Target seat gets filled by animation, others static */}
                {!isTarget && i > 1 ? String.fromCharCode(70 + i) : (isTarget ? "D" : "")}
              </div>
            );
          })}
        </div>

        {/* Dragging guest */}
        <div className="wp-drag-guest-multi">
          <div className="wp-drag-guest-chip">
            Dan
            <div className="wp-drag-green-dot" />
          </div>
          <div className="wp-drag-cursor"><IconCursor /></div>
        </div>

      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="wp-features-section">
      <div className="wp-container">
        <div className="wp-section-header wp-fade-up">
          <span className="wp-section-tag">Funcționalități</span>
          <h2 className="wp-section-title">
           <BlurText text="Construit pentru viteză"
                          delay={20}
                          animateBy="letters"
                          direction="bottom"
                          className="wp-section-titleX"
                        /><br />
            <span className="muted-text"><BlurText text="Optimizat pentru claritate."
                          delay={30}
                          animateBy="letters"
                          direction="top"
                          className="wp-section-titleXx"
                        /></span>
          </h2>
          
          


          <p className="wp-section-desc">
            Fiecare interacțiune din WeddingPro este gândită să fie instantanee. Elimină haosul din Excel.
          </p>
        </div>

        <div className="wp-bento-grid wp-fade-up">

          {/* CARD 1 — Seating (tall left) */}
          <SpotlightCard
              className="wp-bento-card primary wp-bento-seating"
              spotlightColor="rgba(232, 121, 249, 0.15)"
            >
              
              {/* 🔥 Pixel background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 0,
                  pointerEvents: "none"
                }}
              >
                <div style={{ width: '100%', height: '600px', position: 'relative' }}>
                  <DotGrid
                    dotSize={4}
                    gap={10}
                    baseColor="#271E37"
                    activeColor="#5227FF"
                    proximity={120}
                    shockRadius={250}
                    shockStrength={5}
                    resistance={750}
                    returnDuration={1}
                  />
                </div>
              </div>

              {/* 🔽 Conținutul tău */}
              <div className="wp-bento-card-content" style={{ maxWidth: 360, position: "relative", zIndex: 2 }}>
                <div className="wp-bento-icon pink">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </div>
                
                <TrueFocus 
                  sentence="Planificator Mese Drag & Drop"
                  manualMode={false}
                  blurAmount={2}
                  borderColor="#ff27e9"
                  animationDuration={0.1}
                  pauseBetweenAnimations={1.2}
                  fontSize="17px"
                  />
                <p>Organizează sala vizual în câteva minute. Trage invitații direct pe locurile libere, grupează familiile și gestionează conflictele automat.</p>
              </div>

              <div style={{ zIndex: 2 }}>
                <SeatingVisual />
              </div>

            </SpotlightCard>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* CARD 2 — RSVP */}
            <SpotlightCard className="wp-bento-card" style={{ flex: 1, minHeight: 240, position: "relative" }} spotlightColor="rgba(255, 255, 255, 0.1)">
              <div className="wp-bento-card-content">
                <div className="wp-bento-icon white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3"/></svg>
                </div>
                <TrueFocus 
                  sentence="RSVP Digital"
                  manualMode={false}
                  blurAmount={2}
                  borderColor="#ff27e9"
                  animationDuration={0.1}
                  pauseBetweenAnimations={1.2}
                  fontSize="17px"
                  />
                <p>Link unic sau public. Invitații confirmă online în timp real. Fără hârtie, fără telefoane.</p>
              </div>
              <div className="wp-rsvp-glow" />
              <div className="wp-rsvp-notif">
                <div className="wp-rsvp-pulse" />
                RSVP Nou: Maria I.
              </div>
            </SpotlightCard>

            {/* CARD 3 — Budget */}
            <SpotlightCard className="wp-bento-card green-accent" style={{ flex: 1, minHeight: 240 }} spotlightColor="rgba(52, 211, 153, 0.15)">
              <div className="wp-bento-card-content">
                <div className="wp-bento-icon green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <TrueFocus 
                  sentence="Buget Smart"
                  manualMode={false}
                  blurAmount={2}
                  borderColor="#ff27e9"
                  animationDuration={0.2}
                  pauseBetweenAnimations={1.5}
                  fontSize="17px"
                  />
                <p>Ține evidența cheltuielilor și plăților scadente în timp real.</p>
                <div className="wp-budget-bar-wrap">
                  <div className="wp-budget-bar-meta"><span>Cheltuit</span><span>75%</span></div>
                  <div className="wp-budget-bar-track">
                    <div className="wp-budget-bar-fill" style={{ width: "75%" }} />
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* CARD 4 — AI (full width) */}
          {/* <SpotlightCard className="wp-bento-card primary wp-bento-ai" spotlightColor="rgba(232, 121, 249, 0.1)">
            <div className="wp-bento-card-content">
              <div className="wp-ai-inner">
                <div className="wp-ai-text-side">
                  <div className="wp-bento-icon pink" style={{ marginBottom: 20 }}><IconZap /></div>
                  <h3>Asistent AI & Checklist</h3>
                  <TrueFocus 
                  sentence="Asistent AI & Checklist"
                  manualMode={false}
                  blurAmount={2}
                  borderColor="#ff27e9"
                  animationDuration={0.1}
                  pauseBetweenAnimations={1}
                  fontSize="17px"
                  />
                  <p>Nu știi de unde să începi? WeddingPro vine cu o listă de sarcini predefinită și un asistent AI care îți oferă sfaturi personalizate pe bugetul tău.</p>
                </div>
                <div className="wp-ai-chat-side">
                  <div className="wp-ai-chat-wrap">
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div className="wp-chat-row">
                        <div className="wp-chat-avatar ai"><IconZap /></div>
                        <div className="wp-chat-bubble ai">Salut! Pe baza bugetului tău, îți recomand să aloci 40% pentru locație.</div>
                      </div>
                      <div className="wp-chat-row right">
                        <div className="wp-chat-bubble user">Super, adaugă sarcina în listă.</div>
                      </div>
                      <div className="wp-chat-row">
                        <div className="wp-chat-avatar ai"><IconZap /></div>
                        <div className="wp-chat-bubble ai">Gata! Am adăugat „Rezervare locație" cu deadline în 3 zile. ✓</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard> */}

        </div>
      </div>
    </section>
  );
}
