
import React, { useState, useRef, useEffect } from "react";
import { IconArrow, IconPlus, IconCheck, IconLink, IconEye, IconMail, IconWallet, IconPieChart } from "./Icons";
import SpotlightCard from "./SpotlightCard";
import FallingText from './effectText/FallingText/FallingText';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';




import TextType from "./effectText/TextType/TextType";
import ShinyText from "./effectText/ShinyText/ShinyText";
import AnimatedList from "./effectText/AnimatedList/AnimatedList ";
import { GridScan } from "./bgEffects/GridScan";
import Noise from "./bgEffects/Noise";
import LightRays from "./LightRays";
import BlurText from "./effectText/BlurText/BlurText ";



const tasks = [
  { text: 'Rezervare locație', done: true, badge: 'High' },
  { text: 'Alegere meniu', done: true, badge: 'Med' },
  { text: 'Trimite invitații', done: false, badge: 'High' },
  { text: 'Comandă tort', done: false, badge: 'Med' },
  { text: 'Programare machiaj', done: false, badge: 'Med' },
];




// --- HELPERS ---
function NumberTicker({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000, step = 20;
        const increment = Math.ceil(target / (duration / step));
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          setValue(current);
          if (current >= target) clearInterval(timer);
        }, step);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

export function Logos() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [startPhysics, setStartPhysics] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "-40% 0px 0px 0px",
        threshold: 0,
      }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  // 🔥 Delay înainte să pornească spargerea
  useEffect(() => {
    if (!visible) return;

    const timeout = setTimeout(() => {
      setStartPhysics(true);
    }, 900); // ← modifică 700–1200 după gust

    return () => clearTimeout(timeout);
  }, [visible]);

  return (
    <div ref={sectionRef} className="wp-logos-section wp-fade-up">
      <div className="wp-container">
        <p className="wp-logos-label">
          Utilizat de miri din toată România
        </p>

        <div
          className="wp-logos-row"
          style={{
            position: "relative",
            height: 150,
            overflow: "hidden",
            borderRadius: 16,
          }}
        >
          <FallingText
              text="2,500+ cupluri   4.9/5 Rating   24/7 Suport    24/24 Back-up"
              highlightWords={["2,500+", "4.9/5", "24/7", "24/24"]}
              trigger="auto"
              backgroundColor="transparent"
              wireframes={false}
              gravity={0.18}               // 🔥 mult mai lent
              mouseConstraintStiffness={0.02}
            />
        </div>
      </div>
    </div>
  );
}
export function TasksSection() {
  const [showSecond, setShowSecond] = useState(false);

  return (
    <section className="wp-tasks-section">
      <div className="wp-container">
        <div className="wp-invite-split">
          
          <div className="wp-fade-up">
            <span className="wp-section-tag">Checklist</span>
            <BlurText text="Nu uita nimic important. Rămâi organizat"
                delay={30}
                animateBy="letters"
                direction="bottom"
                className="wp-section-titleX"
                onAnimationComplete={() => setShowSecond(true)} 
              />
               
            <p className="wp-section-desc" style={{ marginBottom: 32 }}>
              Urmărește fiecare pas al organizării. De la rezervarea locației până la ultimul detaliu, ai o listă clară cu sarcini prioritizate.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, fontWeight: 500, color: "var(--muted)" }}>
                <IconCheck color="var(--primary)" /> Sarcini Predefinite
                <div className="wp-divider-v" style={{ height: 16, margin: "0 8px" }} />
                <IconCheck color="var(--primary)" /> Categorii Smart
            </div>
          </div>

          <div className="wp-fade-up wp-d2" style={{ display: "flex", justifyContent: "center" }}>
             <SpotlightCard className="wp-task-ui" spotlightColor="rgba(255, 255, 255, 0.1)">
                <AnimatedList
                      items={tasks}
                      renderItem={(task) => (
                        <div className={`wp-task-item ${task.done ? 'done' : ''}`}>
                          <div className="wp-task-check">{task.done && <IconCheck />}</div>
                          <span className="wp-task-text">{task.text}</span>
                          <span className={`wp-task-badge ${task.badge.toLowerCase()}`}>{task.badge}</span>
                        </div>
                      )}
                      onItemSelect={(task, index) => console.log(task, index)}
                      className="wp-fade-up wp-d2 flex justify-center"
                      itemClassName="wp-task-ui" // pentru SpotlightCard sau stilul fiecărui item
                      showGradients
                      enableArrowNavigation
                      displayScrollbar
                    />
             </SpotlightCard>
          </div>

        </div>
      </div>
    </section>
  );
}



export function CalendarSection() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  // Floating items mici
  const floatingItems = [
    { day: 1, offsetX: 0.1, text: "Plată Confirmată", size: 20 },  // 10% from left
    { day: 12, offsetX: 0, text: "Proba Costum", size: 18 }, // 50% from left
    { day: 30, offsetX: 0.8, text: "Plata DJ", size: 16 }, // 80% from left
    { day: 28, offsetX: 0.8, text: "Alege Rochia", size: 16 }, // 80% from left
  ];

  return (
    <section className="wp-calendar-section">
      <div className="wp-container">
        <div className="wp-invite-split flex flex-col md:grid md:grid-cols-2 gap-8">

          {/* Text Section */}
          <div className="wp-fade-up">
            <span className="wp-section-tag">Calendar</span>
            <h2 className="wp-section-title">
              <BlurText text="Planifica Vizual"
                          delay={20}
                          animateBy="letters"
                          direction="bottom"
                          className="wp-section-titleX"
                        /><br />
              <span className="muted-text"><BlurText text="Totul la timp."
                          delay={30}
                          animateBy="letters"
                          direction="top"
                          className="wp-section-titleX"
                        /></span>
            </h2>
            <p className="wp-section-desc mb-8">
              Vizualizează toate termenele limită și plățile scadente într-un calendar interactiv. Sincronizat automat cu sarcinile tale.
            </p>
          </div>

          {/* Calendar Section */}
          <div className="wp-fade-up wp-d2 relative flex justify-center perspective-1000">
            <div className="wp-cal-3d-wrap relative w-full">

              {/* Calendar */}
              <div className="wp-cal-ui relative">
                <div className="wp-cal-header flex justify-between items-center">
                  <span className="wp-cal-month">Iunie 2024</span>
                </div>
                <div className="wp-cal-grid relative">
                  {["L","M","M","J","V","S","D"].map(d => (
                    <div key={d} className="wp-cal-head">{d}</div>
                  ))}
                  {days.map(d => (
                    <div key={d} className={`wp-cal-day${d === 15 ? " active" : ""}${d === 24 ? " today" : ""}`}>
                      {d}
                    </div>
                  ))}

                  {/* Floating items mici */}
                  {/* Floating items mici */}
                    {floatingItems.map((f, i) => {
                      const dayIndex = f.day - 1;
                      const row = Math.floor(dayIndex / 7);
                      const col = dayIndex % 7;

                      return (
                        <div
                          key={i}
                          className="wp-cal-floating absolute flex items-center gap-1 bg-black/50 rounded-lg text-green"
                          style={{
                            top: `calc(${row * 40 + 20}px)`,           // poziția verticală
                            left: `calc(${col * 40 + f.offsetX * 40}px)`, // poziția orizontală
                            fontSize: `${f.size * 0.6}px`,
                            minWidth: "60px", 
                            maxWidth: "130px",                          // să nu fie prea îngust
                            padding: "10px 6px",
                            height: "auto",
                            lineHeight: 1,
                          }}
                        >
                          {/* Icon verde în stânga */}
                          <div className="flex-shrink-0 w-[1em] h-[1em] rounded bg-green/10 flex items-center justify-center">
                            <svg
                              width="100%"
                              height="100%"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>

                          {/* Textul */}
                          <span className="truncate">{f.text}</span>
                        </div>
                      );
                    })}

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


export function InviteSection() {
  return (
    <section className="wp-invite-section">
      <div className="wp-container">
        <div className="wp-invite-split">
          
          <div className="wp-fade-up">
            <span className="wp-section-tag">Invitații Smart</span>
            <h2 className="wp-section-title">
              <BlurText text="Control Total."
                          delay={20}
                          animateBy="letters"
                          direction="bottom"
                          className="wp-section-titleX"
                        /><br />
              <span className="muted-text"><BlurText text="Fără surprize."
                          delay={30}
                          animateBy="letters"
                          direction="top"
                          className="wp-section-titleX"
                        /></span>
            </h2>
            <p className="wp-section-desc" style={{ marginBottom: 40 }}>
              Uită de carnețele și mesaje pierdute pe WhatsApp. Trimite invitații digitale, vezi cine a deschis link-ul și primește confirmările direct în dashboard.
            </p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(232,121,249,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}><IconLink /></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Link Unic</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", maxWidth: 200 }}>Generează un link personalizat pentru fiecare invitat.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(52,211,153,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}><IconEye /></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Tracking Live</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", maxWidth: 200 }}>Vezi exact când invitatul a vizualizat invitația.</div>
                </div>
              </div>
            </div>
          </div>

          <SpotlightCard className="wp-invite-visual wp-fade-up wp-d2" spotlightColor="rgba(255, 255, 255, 0.1)">
            <div className="wp-guest-list-ui">
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted2)" }}>Invitat</div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted2)" }}>Status</div>
              </div>
              {/* Row 1 */}
              <div className="wp-guest-row">
                <div className="wp-guest-info">
                  <div className="wp-guest-avatar">AP</div>
                  <div>
                    <div className="wp-guest-name">Andrei Popescu</div>
                    <div className="wp-guest-meta">Link trimis acum 2 zile</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="wp-status-badge green"><IconCheck color="#34d399" /> Confirmat</div>
                  <div className="wp-action-btn"><IconMail /></div>
                </div>
              </div>
              {/* Row 2 */}
              <div className="wp-guest-row">
                <div className="wp-guest-info">
                  <div className="wp-guest-avatar">EI</div>
                  <div>
                    <div className="wp-guest-name">Elena Ionescu</div>
                    <div className="wp-guest-meta">Văzut acum 10 min</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="wp-status-badge blue"><IconEye /> Văzut</div>
                  <div className="wp-action-btn"><IconMail /></div>
                </div>
              </div>
              {/* Row 3 */}
              <div className="wp-guest-row">
                <div className="wp-guest-info">
                  <div className="wp-guest-avatar">VM</div>
                  <div>
                    <div className="wp-guest-name">Vlad Munteanu</div>
                    <div className="wp-guest-meta">Link generat</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="wp-status-badge gray">Trimis</div>
                  <div className="wp-action-btn" style={{ color: "var(--text)", background: "rgba(255,255,255,0.1)" }}><IconLink /></div>
                </div>
              </div>
              {/* Row 4 */}
              <div className="wp-guest-row">
                <div className="wp-guest-info">
                  <div className="wp-guest-avatar">FP</div>
                  <div>
                    <div className="wp-guest-name">Fam Popa</div>
                    <div className="wp-guest-meta">Link generat</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="wp-status-badge gray">Trimis</div>
                  <div className="wp-action-btn" style={{ color: "var(--text)", background: "rgba(255,255,255,0.1)" }}><IconLink /></div>
                </div>
              </div>
            </div>
{/* 
            Mobile Mockup Overlay
            <div className="wp-phone-mockup">
              <div className="wp-phone-screen">
                <div className="wp-phone-header">
                  <div style={{ fontSize: 10, fontWeight: 700 }}>9:41</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <div style={{ width: 12, height: 8, background: "#000", borderRadius: 2 }}></div>
                    <div style={{ width: 12, height: 8, background: "#000", borderRadius: 2 }}></div>
                  </div>
                </div>
                <div className="wp-invite-card-mock">
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#db2777", marginBottom: 8, fontWeight: 700 }}>Invitație</div>
                  <div className="wp-invite-title-mock">
                    Alex <span style={{ fontStyle: "italic", color: "#fbcfe8" }}>&</span> Maria
                  </div>
                  <div style={{ fontSize: 10, color: "#9d174d", lineHeight: 1.4 }}>
                    Te așteptăm cu drag să sărbătorim împreună.
                  </div>
                  <div className="wp-btn-mock">Confirmă</div>
                </div>
                <div className="wp-phone-bar"></div>
              </div>
            </div> */}

          </SpotlightCard>

        </div>
      </div>
    </section>
  );
}























export function BudgetSection() {
  return (
    <section className="wp-budget-section">
      <div className="wp-container">
        <div className="wp-budget-container">
          
          {/* TEXT SIDE */}
          <div className="wp-fade-up">
            <span className="wp-section-tag">Buget & Finanțe</span>
            <h2 className="wp-section-title">
              <BlurText text="Fiecare leu contează."
                          delay={20}
                          animateBy="letters"
                          direction="bottom"
                          className="wp-section-titleX"
                        /><br />
              <span className="muted-text"><BlurText text="Planifică inteligent."
                          delay={30}
                          animateBy="letters"
                          direction="top"
                          className="wp-section-titleX"
                        /></span>
            </h2>
            <p className="wp-section-desc" style={{ marginBottom: 32 }}>
              Stabilește un buget total și urmărește cheltuielile în timp real. Vezi exact cât ai plătit, ce restanțe ai și generează rapoarte PDF pentru furnizori.
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(232,121,249,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}><IconWallet /></div>
                    Estimări vs Real
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(52,211,153,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}><IconPieChart /></div>
                    Rapoarte Automate
                </div>
            </div>
          </div>

          {/* VISUAL SIDE */}
          <div className="wp-fade-up wp-d2" style={{ position: 'relative' }}>
             <SpotlightCard className="wp-budget-card" spotlightColor="rgba(52, 211, 153, 0.15)">
                <div className="wp-budget-header">
                    <div>
                        <div className="wp-budget-total-label">Buget Total</div>
                        <div className="wp-budget-total-val"><BlurText text="45.000 LEI"
                          delay={2}
                          animateBy="words"
                          direction="top"
                          className=""
                        /></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                       <div style={{ padding: "6px 12px", background: "rgba(52,211,153,0.1)", color: "#34d399", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>PAID 75%</div>
                    </div>
                </div>

                <div className="wp-donut-wrap">
                    <div className="wp-donut-chart">
                        <div className="wp-donut-inner">
                            <span className="wp-donut-label">Cheltuit</span>
                            <span className="wp-donut-pct">33.7K</span>
                        </div>
                    </div>
                </div>

                <div className="wp-budget-list">
                    <div className="wp-budget-item">
                        <div className="wp-budget-item-name"><span className="wp-budget-dot" style={{background: "var(--primary)"}}/> Locație & Meniu</div>
                        <div style={{ fontWeight: 700 }}>22.500 LEI</div>
                    </div>
                    <div className="wp-budget-item">
                        <div className="wp-budget-item-name"><span className="wp-budget-dot" style={{background: "var(--accent)"}}/> Foto & Video</div>
                        <div style={{ fontWeight: 700 }}>6.800 LEI</div>
                    </div>
                    <div className="wp-budget-item">
                        <div className="wp-budget-item-name"><span className="wp-budget-dot" style={{background: "var(--green)"}}/> Muzică</div>
                        <div style={{ fontWeight: 700 }}>4.400 LEI</div>
                    </div>
                </div>
             </SpotlightCard>

             {/* Floating elements */}
             <div className="wp-float-card">
                 <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", color: "var(--green)" }}><IconCheck /></div>
                 <div>
                     <div style={{ fontSize: 11, fontWeight: 700 }}>Avans Foto</div>
                     <div style={{ fontSize: 10, color: "var(--muted)" }}>Achitat azi</div>
                 </div>
             </div>
             
             <div className="wp-float-card bottom">
                 <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", color: "var(--primary)" }}><IconWallet /></div>
                 <div>
                     <div style={{ fontSize: 11, fontWeight: 700 }}>Buget Actualizat</div>
                     <div style={{ fontSize: 10, color: "var(--muted)" }}>+ 2.000 LEI</div>
                 </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export function Stats() {
  return (
    <section className="wp-stats-section relative overflow-hidden">

     

      {/* CONTENT */}
      <div className="relative z-10 wp-container-sm">
        <div className="wp-stats-card wp-fade-up relative overflow-hidden">
           <div className="absolute inset-0 pointer-events-none">
            <Noise
              patternSize={250}
              patternScaleX={2}
              patternScaleY={2}
              patternRefreshInterval={2}
              patternAlpha={10}
            />
          </div>
          {[
            { target: 2500, suffix: "+", label: "Cupluri care au ales WeddingPro" },
            { target: 98,   suffix: "%", label: "Satisfacție confirmată de utilizatori" },
            { target: 40,   suffix: "h", label: "Timp economisit per eveniment" },
          ].map(({ target, suffix, label }) => (
            <div key={label} className="wp-stat-item">
              <div className="wp-stat-num">
                <span><NumberTicker target={target} /></span>{suffix}
              </div>
              <div className="wp-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}




const FAQ_ITEMS = [
  { q: "Este plata recurentă?",                   a: "Nu. Plătești o singură dată suma de 49 LEI și ai acces pe viață la contul tău pentru un eveniment. Nicio taxă ascunsă, niciun abonament lunar." },
  { q: "Pot exporta lista de invitați?",          a: "Da, poți exporta lista completă în format PDF, gata de trimis către locație sau firma de catering. Formatul este profesional și include toate detaliile necesare." },
  { q: "Pot folosi platforma de pe telefon?",     a: "Da, platforma este optimizată pentru mobil. Totuși, pentru planificarea meselor (drag & drop) recomandăm un ecran mai mare — laptop sau tabletă." },
  { q: "Datele mele sunt în siguranță?",          a: "Absolut. Toate datele sunt criptate end-to-end și stocate pe servere securizate. Nu partajăm niciodată informațiile tale cu terți fără consimțământul tău explicit." },
  { q: "Pot organiza mai multe nunți?",           a: "Planul Premium include un eveniment complet. Dacă ești organizator profesionist, contactează-ne pentru un plan personalizat la prețuri speciale." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (i: number) => {
    setOpen(prev => prev === i ? null : i);
  };

  return (
    <section id="faq" className="wp-faq-section">
      <div className="wp-container-sm">
        <div className="wp-section-header wp-fade-up">
          <span className="wp-section-tag">Întrebări</span>
          <h2 className="wp-section-title">Întrebări frecvente</h2>
        </div>
        <div className="wp-faq-list wp-fade-up">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`wp-faq-item${open === i ? " open" : ""}`}>
              <button className="wp-faq-btn" onClick={() => toggle(i)}>
                {item.q}
                <div className="wp-faq-icon"><IconPlus /></div>
              </button>
              <div
                className="wp-faq-body"
                ref={el => { bodyRefs.current[i] = el; }}
                style={{ maxHeight: open === i ? (bodyRefs.current[i]?.scrollHeight ?? 200) + "px" : "0" }}
              >
                <div className="wp-faq-body-inner">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export  function CTA() {
  const [session, setSession] = React.useState<any>(null);
  
    useEffect(() => {
      const saved = localStorage.getItem('weddingPro_session');
      if (saved) {
        try {
          setSession(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }, []);

  return (
    
    <section className="py-24 relative overflow-hidden">
      <div className="wp-container relative z-10">
        
        {/* Main Card Container */}
        <div className="relative w-full max-w-5xl mx-auto bg-[#0c0c0e] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group">
             <LightRays
                raysOrigin="top-center"
                raysColor="#000000"
                raysSpeed={1}
                lightSpread={0.5}
                rayLength={3}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0}
                distortion={0}
                className="custom-rays"
                pulsating={false}
                fadeDistance={1}
                saturation={1}
            />
            {/* --- Background Effects --- */}
            
            {/* 1. Purple Top Spotlight/Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#6d28d9] blur-[150px] opacity-40 pointer-events-none rounded-full mix-blend-screen -translate-y-1/2"></div>
            
            {/* 2. Ray/Beam Simulation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0deg,rgba(124,58,237,0.03)_20deg,transparent_40deg,transparent_320deg,rgba(124,58,237,0.03)_340deg,transparent_360deg)] opacity-50"></div>
            </div>

            {/* 3. Noise Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100 mix-blend-overlay"></div>
            
            {/* 4. Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" 
                 style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
            </div>


            {/* --- Content --- */}
            <div className="relative z-10 px-6 py-20 md:py-28 flex flex-col items-center text-center">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e1b4b] border border-[#4c1d95]/50 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] mb-8 cursor-default transition-transform group-hover:scale-105 duration-500">
                    <div className="w-5 h-5 rounded-full bg-[#5b21b6] flex items-center justify-center text-white">
                        <CheckCircle2 size={12} strokeWidth={3} />
                    </div>
                    <span className="text-white text-xs font-bold uppercase tracking-widest pr-1">
                        Become a Part of Us
                    </span>
                </div>

                {/* Headline */}
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight max-w-4xl mx-auto wp-section-titleX ">
                    Ready to Elevate Your <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
                        Wedding Experience?
                    </span>
                </h2>

                {/* Subheadline */}
                <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
                    Ready to take the next step? Join us now and start transforming your vision into reality with expert support.
                </p>

                {/* CTA Button */}
                
                
                
                {session ? (
                            <a href={session.isAdmin ? "/admin" : "/dashboard"} className="group/btn relative inline-flex items-center justify-center px-8 py-4 bg-[#7c3aed] text-white font-bold text-sm md:text-base rounded-xl overflow-hidden transition-all hover:bg-[#6d28d9] hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.6)]">
                    <span className="relative z-10 flex items-center gap-2">
                        Administreaza <ArrowRight size={18} />
                    </span>
                    {/* Button Shine */}
                    <div className="absolute inset-0 -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                </a>

                          ) : (
                           <a href="/register" className="group/btn relative inline-flex items-center justify-center px-8 py-4 bg-[#7c3aed] text-white font-bold text-sm md:text-base rounded-xl overflow-hidden transition-all hover:bg-[#6d28d9] hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.6)]">
                            <span className="relative z-10 flex items-center gap-2">
                                Register <ArrowRight size={18} />
                            </span>
                            {/* Button Shine */}
                            <div className="absolute inset-0 -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                        </a>
                          )}



                {/* No Credit Card Text */}
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 font-mono opacity-60">
                    <Sparkles size={10} />
                    <span>No credit card required</span>
                </div>

            </div>
        </div>

      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="wp-footer">
      <div className="wp-container">
        <div className="wp-footer-inner">
          <a href="/" className="wp-footer-logo">
            <div className="wp-nav-logo-icon" style={{ width: 24, height: 24, fontSize: 11 }}>W</div>
            WeddingPro
          </a>
          <div className="wp-footer-links">
            <a href="#">Termeni</a>
            <a href="#">Confidențialitate</a>
            <a href="#">Contact</a>
            <a href="#faq" onClick={e => { e.preventDefault(); const el = document.getElementById("faq"); if(el) el.scrollIntoView({behavior:"smooth"}); }}>Întrebări</a>
          </div>
          <div className="wp-footer-copy">© {new Date().getFullYear()} WeddingPro. Toate drepturile rezervate.</div>
        </div>
      </div>
    </footer>
  );
}
