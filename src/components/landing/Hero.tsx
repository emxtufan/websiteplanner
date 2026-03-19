import React, { useRef, useEffect } from "react";
import {
  IconLock,
  IconArrow,
  IconPlay,
  IconActivity,
  IconZap,
  IconTarget,
  IconStar,
  IconLink,
  IconEye,
  IconCheck,
  IconWallet,
} from "./Icons";
// Assuming these components exist from previous context, if not, standard text is rendered
import TextType from "./effectText/TextType/TextType";
import ShinyText from "./effectText/ShinyText/ShinyText";





const DB_BARS = [38, 62, 45, 80, 55, 92, 68, 74, 50, 88];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
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

  // Scroll-driven animation logic
  useEffect(() => {
    const handleScroll = () => {
      if (!dashboardRef.current) return;

      // Robustly get scroll position from window or potential scroll containers
      const scrollY =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        document.getElementById("root")?.scrollTop ||
        0;

      const maxScroll = 800; // Animation range
      const rawProgress = Math.min(scrollY / maxScroll, 1);

      // Ease out cubic for pop effect
      const progress = 1 - Math.pow(1 - rawProgress, 3);

      // Update CSS variable for children cards
      dashboardRef.current.style.setProperty(
        "--wp-progress",
        progress.toString(),
      );

      // Calculate Container Transforms
      const rotateX = 35 - progress * 35; // 35deg -> 0deg
      const scale = 1.4 - progress * 0.4; // 0.9 -> 1.0
      const translateY = 80 - progress * 80; // 80px -> 0px

      dashboardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) scale(${scale}) translateY(${translateY}px)`;
    };

    // Attach listeners to window and root to catch any scroll behavior
    window.addEventListener("scroll", handleScroll, { passive: true });
    document
      .getElementById("root")
      ?.addEventListener("scroll", handleScroll, { passive: true });

    // Initial call to set state before scroll
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document
        .getElementById("root")
        ?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    // Added overflow: visible to allow 3D elements to pop out of the section bounds
    <section
      className="wp-hero"
      ref={containerRef}
      style={{ overflow: "visible" }}
    >
      <div
        className="wp-container"
        style={{ position: "relative", zIndex: 10 }}
      >
        <div className="wp-badge" style={{ margin: "0 auto 28px" }}>
          <span className="wp-badge-dot" />
          <ShinyText
            text="Payment Security"
            speed={2}
            delay={0}
            color="#b5b5b5"
            shineColor="#ffffff"
            spread={120}
            direction="left"
            yoyo={false}
            pauseOnHover={false}
            disabled={false}
          />
        </div>

        <h1 className="wp-fade-up visible">
          Planifică
          <TextType
            text={[" Nunta", " Botezul", " Party"]}
            typingSpeed={75}
            pauseDuration={1000}
            showCursor
            cursorCharacter="_"
            deletingSpeed={50}
            variableSpeedEnabled={false}
            variableSpeedMin={60}
            variableSpeedMax={120}
            variableSpeed={true}
             onSentenceComplete={() => {}}
            cursorBlinkDuration={0.5}
          />
          
          <br />
          <em>În doar câteva minute.</em>
        </h1>
        <p className="wp-fade-up visible wp-d1">
          <ShinyText
            text="Platforma completă pentru miri și organizatori. Gestionează invitați, așezarea la mese, bugetul și confirmările RSVP — într-un singur loc."
            speed={2}
            delay={0}
            color="#b5b5b5"
            shineColor="#ffffff"
            spread={120}
            direction="left"
            yoyo={false}
            pauseOnHover={false}
            disabled={false}
          />
        </p>

        <div className="wp-hero-btns wp-fade-up visible wp-d2">
          {session ? (
            <a href={session.isAdmin ? "/admin" : "/dashboard"} className="wp-btn-primary wp-btn-lg">
              {session.isAdmin ? "Panou Admin" : "Panou Control"} <IconArrow />
            </a>
          ) : (
            <a href="/register" className="wp-btn-primary wp-btn-lg">
              Începe Gratuit <IconArrow />
            </a>
          )}
          <a
            href="#features"
            className="wp-btn-outline-lg"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("features");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <IconPlay /> Demo Live
          </a>
        </div>

        {/* ── DASHBOARD 3D WRAPPER ──────────────────────── */}
        <div
          ref={dashboardRef}
          className="wp-dashboard-wrapper"
          style={
            {
              willChange: "transform",
              transformStyle: "preserve-3d", // Crucial for 3D children
              "--wp-progress": "0",
            } as React.CSSProperties
          }
        >
          {/* --- LEFT SIDE CARDS (3) --- */}

          {/* Left 1: Budget Alert - Scattered Position */}
          <div
            className="wp-db-notif"
            style={{
              right: "auto",
              left: "-60px",
              top: "-10px",
              transform: `translate3d(0, 0, calc(60px + (var(--wp-progress) * 280px)))`,
            }}
          >
            <div className="wp-db-notif-icon">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
              >
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <div
                className="wp-db-notif-title"
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                Cheltuială Nouă
              </div>
              <div
                className="wp-db-notif-sub"
                style={{ fontSize: 10, color: "var(--muted)" }}
              >
                - 2.500 LEI (Avans Foto)
              </div>
            </div>
          </div>

          {/* Left 2: Task Completion - Scattered Position */}
          <div
            className="wp-db-notif"
            style={{
              right: "auto",
              left: "-150px",
              top: "240px",
              transform: `translate3d(0, 0, calc(40px + (var(--wp-progress) * 160px)))`,
            }}
          >
            <div className="wp-db-notif-icon">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div
                className="wp-db-notif-title"
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                Sarcină Finalizată
              </div>
              <div
                className="wp-db-notif-sub"
                style={{ fontSize: 10, color: "var(--muted)" }}
              >
                Degustare meniu ✓
              </div>
            </div>
          </div>

          {/* Left 3: Seating/Tables - Scattered Position */}
          <div
            className="wp-db-notif"
            style={{
              right: "auto",
              left: "-30px",
              top: "440px",
              transform: `translate3d(0, 0, calc(80px + (var(--wp-progress) * 320px)))`,
            }}
          >
            <div className="wp-db-notif-icon">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div
                className="wp-db-notif-title"
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                Masă Organizată
              </div>
              <div
                className="wp-db-notif-sub"
                style={{ fontSize: 10, color: "var(--muted)" }}
              >
                Masa 5 este completă (10/10).
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE CARDS (3) --- */}

          {/* Right 1 (Top): RSVP - Scattered Position */}
          <div
            className="wp-db-notif"
            style={{
              right: "-110px",
              top: "30px",
              transform: `translate3d(0, 0, calc(60px + (var(--wp-progress) * 230px)))`,
            }}
          >
            <div className="wp-db-notif-icon">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div
                className="wp-db-notif-title"
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                Invitat Confirmat
              </div>
              <div
                className="wp-db-notif-sub"
                style={{ fontSize: 10, color: "var(--muted)" }}
              >
                Alexandru Popa a confirmat.
              </div>
            </div>
          </div>

          {/* Right 2 (Mid): Calendar/Deadline - Scattered Position */}
          <div
            className="wp-db-notif"
            style={{
              top: "280px",
              right: "-70px",
              transform: `translate3d(0, 0, calc(50px + (var(--wp-progress) * 150px)))`,
            }}
          >
            <div className="wp-db-notif-icon">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div
                className="wp-db-notif-title"
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                Deadline Mâine
              </div>
              <div
                className="wp-db-notif-sub"
                style={{ fontSize: 10, color: "var(--muted)" }}
              >
                Plată tranșa 2 locație.
              </div>
            </div>
          </div>

          {/* Right 3 (Bottom): Message/Guest - Scattered Position */}
          <div
            className="wp-db-notif"
            style={{
              top: "410px",
              right: "-130px",
              transform: `translate3d(0, 0, calc(70px + (var(--wp-progress) * 290px)))`,
            }}
          >
            <div className="wp-db-notif-icon">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2.5"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <div
                className="wp-db-notif-title"
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                Mesaj Nou
              </div>
              <div
                className="wp-db-notif-sub"
                style={{ fontSize: 10, color: "var(--muted)" }}
              >
                Fam. Ionescu: "Venim cu drag!"
              </div>
            </div>
          </div>

          <div
            className="wp-dashboard-3d"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="wp-dashboard-outer"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="wp-dashboard-inner"
                style={{ transformStyle: "preserve-3d", overflow: "visible" }}
              >
                {/* Window Chrome - Stays relatively flat but distinct */}
                <div
                  className="wp-window-chrome"
                  style={{
                    transform:
                      "translate3d(0, 0, calc(10px + (var(--wp-progress) * 20px)))",
                  }}
                >
                  <div className="wp-window-dots">
                    <div className="wp-window-dot wp-dot-red" />
                    <div className="wp-window-dot wp-dot-yellow" />
                    <div className="wp-window-dot wp-dot-green" />
                  </div>
                  <div className="wp-window-url">
                    <IconLock /> weddingpro.app/dashboard
                  </div>
                  <div style={{ width: 56 }} />
                </div>

                {/* Body - 3D Container */}
                <div
                  className="wp-db-body"
                  style={{ transformStyle: "preserve-3d", overflow: "visible" }}
                >
                  {/* Sidebar - Floats out 40px */}
                  <div
                    className="wp-db-sidebar"
                    style={{
                      transform:
                        "translate3d(0, 0, calc(20px + (var(--wp-progress) * 40px)))",
                      boxShadow: "5px 0 20px rgba(0,0,0,0.2)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className="wp-db-sidebar-label"
                      style={{
                        transform:
                          "translate3d(0, 0, calc(5px + (var(--wp-progress) * 10px)))",
                      }}
                    >
                      Meniu
                    </div>
                    <div style={{ transformStyle: "preserve-3d" }}>
                      {[
                        {
                          label: "Dashboard",
                          icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
                        },
                        { label: "Planner", icon: "M3 3h7v7H3zM14 3h7v7h-7z" },
                        {
                          label: "Calendar",
                          icon: "M19 4h-1V3a1 1 0 0 0-2 0v1H8V3a1 1 0 0 0-2 0v1H5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V8h14v12z",
                        },
                        {
                          label: "Sarcini",
                          icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
                        },
                        {
                          label: "Buget",
                          icon: "M20 12V8H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h12v4",
                        },
                        {
                          label: "Invitați",
                          icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`wp-db-nav-item${i === 0 ? " active" : ""}`}
                          style={{
                            // Stagger sidebar items
                            transform: `translate3d(0, 0, calc(5px + (var(--wp-progress) * ${5 + i * 8}px)))`,
                          }}
                        >
                          <svg
                            className="wp-db-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d={item.icon} />
                          </svg>
                          {item.label}
                        </div>
                      ))}
                    </div>

                    {/* Sidebar Bottom - Floats even further from sidebar (20px relative, total 60px) */}
                    <div
                      className="wp-db-sidebar-bottom"
                      style={{
                        transform:
                          "translate3d(0, 0, calc(10px + (var(--wp-progress) * 60px)))",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div className="wp-db-avatar" />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>
                            Alex & Maria
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted2)" }}>
                            Premium
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Area - 3D Container */}
                  <div
                    className="wp-db-main"
                    style={{
                      transformStyle: "preserve-3d",
                      overflow: "visible",
                    }}
                  >
                    {/* Topbar - Floats out 50px */}
                    <div
                      className="wp-db-topbar"
                      style={{
                        transform:
                          "translate3d(0, 0, calc(20px + (var(--wp-progress) * 50px)))",
                        background: "rgba(255,255,255,0.02)", // Slightly distinct background
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div>
                        <div className="wp-db-topbar-title">
                          Bun venit, Alex & Maria
                        </div>
                        <div className="wp-db-topbar-sub">
                          Nunta în 24 de zile.
                        </div>
                      </div>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg,var(--primary),var(--accent))",
                        }}
                      />
                    </div>

                    <div
                      className="wp-db-content"
                      style={{
                        transformStyle: "preserve-3d",
                        overflow: "visible",
                      }}
                    >
                      {/* Top Stats Row - High Explosion (up to 150px) with stagger */}
                      <div
                        className="wp-db-stats-row"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* Card 1 - Pop 150px */}
                        <div
                          className="wp-db-card"
                          style={{
                            transform:
                              "translate3d(0, 0, calc(40px + (var(--wp-progress) * 180px)))",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          <div
                            className="wp-db-card-header"
                            style={{
                              transform:
                                "translate3d(0, 0, calc(10px + (var(--wp-progress) * 20px)))",
                            }}
                          >
                            <IconActivity /> Intensitatea Zilei
                          </div>
                          <div
                            className="wp-db-card-body flex-row"
                            style={{
                              transform:
                                "translate3d(0, 0, calc(5px + (var(--wp-progress) * 10px)))",
                              transformStyle: "preserve-3d",
                            }}
                          >
                            <div
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(10px + (var(--wp-progress) * 20px)))",
                              }}
                            >
                              <div className="wp-db-big-num">3</div>
                              <div className="wp-db-sub-label">Sarcini Azi</div>
                            </div>
                            <div
                              className="wp-db-radial-mock"
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(20px + (var(--wp-progress) * 40px))) rotate(-45deg)",
                              }}
                            >
                              <div className="wp-db-radial-icon">
                                <IconZap />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card 2 - Pop 120px */}
                        <div
                          className="wp-db-card"
                          style={{
                            transform:
                              "translate3d(0, 0, calc(40px + (var(--wp-progress) * 150px)))",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          <div
                            className="wp-db-card-header"
                            style={{
                              transform:
                                "translate3d(0, 0, calc(10px + (var(--wp-progress) * 15px)))",
                            }}
                          >
                            <IconTarget /> Progres General
                          </div>
                          <div
                            className="wp-db-card-body"
                            style={{
                              transform:
                                "translate3d(0, 0, calc(5px + (var(--wp-progress) * 10px)))",
                              transformStyle: "preserve-3d",
                            }}
                          >
                            <div
                              className="wp-db-flex-between"
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(10px + (var(--wp-progress) * 15px)))",
                              }}
                            >
                              <div className="wp-db-big-num">
                                12<span className="small">/45</span>
                              </div>
                              <div className="wp-db-pct text-indigo">28%</div>
                            </div>
                            <div
                              className="wp-db-prog-bar"
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(10px + (var(--wp-progress) * 20px)))",
                              }}
                            >
                              <div style={{ width: "28%" }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Card 3 - Pop 135px */}
                        <div
                          className="wp-db-card"
                          style={{
                            borderLeft: "3px solid #f59e0b",
                            transform:
                              "translate3d(0, 0, calc(40px + (var(--wp-progress) * 165px)))",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          <div
                            className="wp-db-card-header"
                            style={{
                              color: "#f59e0b",
                              transform:
                                "translate3d(0, 0, calc(10px + (var(--wp-progress) * 15px)))",
                            }}
                          >
                            <IconStar /> Top Priorități
                          </div>
                          <div
                            className="wp-db-card-body"
                            style={{
                              transform:
                                "translate3d(0, 0, calc(5px + (var(--wp-progress) * 10px)))",
                              transformStyle: "preserve-3d",
                            }}
                          >
                            <div
                              className="wp-db-list-item"
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(10px + (var(--wp-progress) * 15px)))",
                              }}
                            >
                              <span>Rezervare locație</span>
                              <span className="wp-db-date">Azi</span>
                            </div>
                            <div
                              className="wp-db-list-item"
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(15px + (var(--wp-progress) * 25px)))",
                              }}
                            >
                              <span>Contract Foto</span>
                              <span className="wp-db-date">Mâine</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Grid Row - Medium Explosion (80-100px) */}
                      <div
                        className="wp-db-main-grid"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* Digital Engagement - Pop 100px */}
                        <div
                          className="wp-db-card"
                          style={{
                            transform:
                              "translate3d(0, 0, calc(40px + (var(--wp-progress) * 130px)))",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          <div
                            className="wp-db-card-header"
                            style={{
                              transform:
                                "translate3d(0, 0, calc(10px + (var(--wp-progress) * 15px)))",
                            }}
                          >
                            <IconLink /> Engagement Digital
                          </div>
                          <div
                            className="wp-db-grid-2x2"
                            style={{
                              transform:
                                "translate3d(0, 0, calc(5px + (var(--wp-progress) * 10px)))",
                              transformStyle: "preserve-3d",
                            }}
                          >
                            <div
                              className="wp-db-stat-box"
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(5px + (var(--wp-progress) * 10px)))",
                              }}
                            >
                              <span>
                                <IconEye /> Văzute
                              </span>
                              <b>142</b>
                            </div>
                            <div
                              className="wp-db-stat-box"
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(10px + (var(--wp-progress) * 20px)))",
                              }}
                            >
                              <span>
                                <IconCheck color="#34d399" /> Confirmate
                              </span>
                              <b>86</b>
                            </div>
                            <div
                              className="wp-db-stat-box"
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(5px + (var(--wp-progress) * 15px)))",
                              }}
                            >
                              <span>Refuzate</span>
                              <b>4</b>
                            </div>
                            <div
                              className="wp-db-stat-box"
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(10px + (var(--wp-progress) * 25px)))",
                              }}
                            >
                              <span>Fără Răspuns</span>
                              <b>52</b>
                            </div>
                          </div>
                        </div>

                        {/* Spend / Distribution - Pop 80px */}
                        <div
                          className="wp-db-card"
                          style={{
                            transform:
                              "translate3d(0, 0, calc(40px + (var(--wp-progress) * 110px)))",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          <div
                            className="wp-db-card-header"
                            style={{
                              transform:
                                "translate3d(0, 0, calc(10px + (var(--wp-progress) * 15px)))",
                            }}
                          >
                            <IconWallet /> Cheltuieli
                          </div>
                          <div
                            className="wp-db-card-body"
                            style={{
                              transform:
                                "translate3d(0, 0, calc(5px + (var(--wp-progress) * 10px)))",
                              transformStyle: "preserve-3d",
                            }}
                          >
                            <div
                              style={{
                                transform:
                                  "translate3d(0, 0, calc(5px + (var(--wp-progress) * 10px)))",
                              }}
                            >
                              <div className="wp-db-big-num">
                                22.5K <span className="small">LEI</span>
                              </div>
                              <div className="wp-db-sub-label">
                                Total Cheltuit
                              </div>
                            </div>
                            <div
                              className="wp-db-chart-bars-simple"
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              {DB_BARS.slice(0, 7).map((h, i) => (
                                <div
                                  key={i}
                                  className="wp-db-chart-bar-s"
                                  style={{
                                    height: `${h}%`,
                                    transform: `translate3d(0, 0, calc(5px + (var(--wp-progress) * ${5 + i * 8}px)))`,
                                  }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="wp-db-glow" />
        </div>
      </div>
    </section>
  );
}
