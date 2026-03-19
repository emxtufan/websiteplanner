
import React, { useState, useEffect, useRef } from "react";

/* ─── CSS ──────────────────────────────────────────────────────────────── */
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #09090b; --bg-card: #111113; --bg-card2: #18181b;
    --border: rgba(255,255,255,0.08); --border-hover: rgba(255,255,255,0.14);
    --text: #fafafa; --muted: #a1a1aa; --muted2: #52525b;
    --primary: #e879f9; --primary-dark: #c026d3;
    --primary-glow: rgba(232,121,249,0.22); --primary-glow2: rgba(232,121,249,0.07);
    --accent: #818cf8; --green: #34d399; --radius: 12px; --radius-lg: 20px;
  }
  html { background: var(--bg); color: var(--text); font-family: 'Geist', sans-serif; scroll-behavior: smooth; }
  body { min-height: 100vh; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 3px; }
  .wp-container    { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .wp-container-sm { max-width: 860px;  margin: 0 auto; padding: 0 24px; }

  /* GRID BG */
  .wp-grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%);
  }
  .wp-noise {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  /* NAVBAR */
  nav.wp-navbar {
    position: sticky; top: 0; z-index: 100;
    border-bottom: 1px solid var(--border);
    background: rgba(9,9,11,.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  }
  .wp-nav-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
  .wp-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text); font-weight: 700; font-size: 17px; }
  .wp-nav-logo-icon { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: #fff; flex-shrink: 0; }
  .wp-nav-links { display: flex; gap: 32px; list-style: none; }
  .wp-nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; }
  .wp-nav-links a:hover { color: var(--text); }
  .wp-nav-actions { display: flex; align-items: center; gap: 12px; }
  .wp-btn-ghost { background: none; border: 1px solid var(--border); color: var(--muted); font-family: inherit; font-size: 13px; font-weight: 500; padding: 7px 18px; border-radius: 100px; cursor: pointer; text-decoration: none; transition: all .2s; }
  .wp-btn-ghost:hover { border-color: var(--border-hover); color: var(--text); }
  .wp-btn-primary {
    position: relative; overflow: hidden;
    background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: #fff; border: none; font-family: inherit; font-size: 13px; font-weight: 600;
    padding: 8px 20px; border-radius: 100px; cursor: pointer; text-decoration: none;
    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
    box-shadow: 0 0 20px var(--primary-glow);
  }
  .wp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 32px var(--primary-glow), 0 8px 24px rgba(0,0,0,.4); }
  .wp-btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,.12) 0%, transparent 100%); pointer-events: none; }
  .wp-hamburger { display: none; background: none; border: 1px solid var(--border); border-radius: 8px; padding: 6px; cursor: pointer; color: var(--muted); align-items: center; justify-content: center; }
  .wp-mobile-menu { display: none; background: var(--bg); border-bottom: 1px solid var(--border); padding: 16px 24px; position: relative; z-index: 99; }
  .wp-mobile-menu a { display: block; color: var(--muted); text-decoration: none; font-size: 15px; font-weight: 500; padding: 10px 0; border-bottom: 1px solid var(--border); transition: color .2s; }
  .wp-mobile-menu a:last-child { border: none; color: var(--primary); }
  .wp-mobile-menu a:hover { color: var(--text); }

  /* HERO */
  .wp-hero { position: relative; padding: 96px 0 80px; text-align: center; overflow: hidden; }
  .wp-hero-glow { position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; pointer-events: none; background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%); }
  .wp-badge { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(232,121,249,.3); border-radius: 100px; background: rgba(232,121,249,.06); color: var(--primary); font-size: 12px; font-weight: 600; padding: 5px 14px; margin-bottom: 28px; letter-spacing: .04em; text-transform: uppercase; }
  .wp-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); animation: wp-pulse 2s infinite; }
  @keyframes wp-pulse { 0%,100% { box-shadow: 0 0 0 0 var(--primary-glow); } 50% { box-shadow: 0 0 0 6px transparent; } }
  .wp-hero h1 { font-size: clamp(38px, 7vw, 80px); font-weight: 900; line-height: 1.05; letter-spacing: -.04em; max-width: 820px; margin: 0 auto 24px; background: linear-gradient(180deg, #fafafa 0%, rgba(250,250,250,.45) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .wp-hero h1 em { font-style: normal; background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .wp-hero p { color: var(--muted); font-size: clamp(15px, 2vw, 18px); max-width: 560px; margin: 0 auto 36px; line-height: 1.7; }
  .wp-hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 72px; }
  .wp-btn-lg { font-size: 15px; padding: 12px 28px; border-radius: 100px; font-weight: 600; }
  .wp-btn-outline-lg { display: inline-flex; align-items: center; gap: 8px; background: none; border: 1px solid var(--border); color: var(--text); font-family: inherit; font-size: 15px; font-weight: 500; padding: 12px 28px; border-radius: 100px; cursor: pointer; text-decoration: none; transition: all .2s; }
  .wp-btn-outline-lg:hover { border-color: var(--border-hover); background: rgba(255,255,255,.04); }

  /* DASHBOARD 3D */
  .wp-dashboard-wrapper { position: relative; max-width: 1000px; margin: 0 auto; perspective: 2000px; }
  .wp-dashboard-3d { animation: wp-unrotate 1s 0.6s cubic-bezier(0.22,1,.36,1) both; }
  @keyframes wp-unrotate { from { transform: rotateX(18deg) translateY(40px); } to { transform: rotateX(0deg) translateY(0px); } }
  .wp-dashboard-outer { border: 1px solid var(--border); border-radius: 16px; background: rgba(255,255,255,.03); padding: 6px; box-shadow: 0 40px 100px rgba(0,0,0,.7), 0 0 0 1px var(--border) inset; }
  .wp-dashboard-inner { border-radius: 12px; overflow: hidden; background: #0d0d0f; border: 1px solid rgba(255,255,255,.06); }
  .wp-window-chrome { height: 40px; background: #111113; border-bottom: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
  .wp-window-dots { display: flex; gap: 6px; }
  .wp-window-dot { width: 12px; height: 12px; border-radius: 50%; }
  .wp-dot-red { background: #ff5f57; } .wp-dot-yellow { background: #ffbd2e; } .wp-dot-green { background: #27c93f; }
  .wp-window-url { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06); border-radius: 6px; padding: 4px 12px; font-size: 11px; color: var(--muted2); font-family: monospace; letter-spacing: .01em; }
  .wp-db-body { display: grid; grid-template-columns: 220px 1fr; height: 540px; }
  .wp-db-sidebar { border-right: 1px solid rgba(255,255,255,.05); background: rgba(255,255,255,.02); padding: 20px 12px; display: flex; flex-direction: column; gap: 2px; }
  .wp-db-sidebar-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--muted2); padding: 0 12px 8px; margin-bottom: 4px; }
  .wp-db-nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; color: var(--muted); cursor: default; }
  .wp-db-nav-item.active { background: rgba(232,121,249,.1); color: var(--primary); }
  .wp-db-nav-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--muted2); flex-shrink: 0; }
  .wp-db-nav-dot.active { background: var(--primary); box-shadow: 0 0 8px var(--primary-glow); }
  .wp-db-sidebar-bottom { margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.05); }
  .wp-db-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); }
  .wp-db-main { display: flex; flex-direction: column; overflow: hidden; }
  .wp-db-topbar { height: 56px; border-bottom: 1px solid rgba(255,255,255,.05); display: flex; align-items: center; justify-content: space-between; padding: 0 28px; background: rgba(255,255,255,.01); flex-shrink: 0; }
  .wp-db-topbar-title { font-size: 14px; font-weight: 700; }
  .wp-db-topbar-sub { font-size: 11px; color: var(--muted2); margin-top: 1px; }
  .wp-db-content { padding: 24px 28px; overflow: hidden; display: flex; flex-direction: column; gap: 20px; flex: 1; }
  .wp-db-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .wp-db-kpi { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 10px; padding: 14px 16px; }
  .wp-db-kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted2); margin-bottom: 6px; font-weight: 600; }
  .wp-db-kpi-val { font-size: 22px; font-weight: 800; letter-spacing: -.03em; }
  .wp-db-kpi-val.pink { color: var(--primary); } .wp-db-kpi-val.indigo { color: var(--accent); } .wp-db-kpi-val.green { color: var(--green); }
  .wp-db-charts { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; flex: 1; min-height: 0; }
  .wp-db-chart-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 10px; padding: 18px 20px; display: flex; flex-direction: column; overflow: hidden; }
  .wp-db-chart-title { font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 16px; }
  .wp-db-bars { display: flex; align-items: flex-end; gap: 5px; flex: 1; }
  .wp-db-bar { flex: 1; border-radius: 3px 3px 0 0; background: linear-gradient(180deg, rgba(232,121,249,.7) 0%, rgba(232,121,249,.2) 100%); animation: wp-barGrow 1s ease forwards; transform-origin: bottom; }
  @keyframes wp-barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
  .wp-db-activity { display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
  .wp-db-act-item { display: flex; align-items: center; gap: 10px; }
  .wp-db-act-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, var(--primary), var(--accent)); border: 1px solid rgba(255,255,255,.1); }
  .wp-db-act-avatar.indigo { background: linear-gradient(135deg, #818cf8, #6366f1); }
  .wp-db-act-avatar.green  { background: linear-gradient(135deg, #34d399, #10b981); }
  .wp-db-act-text { font-size: 12px; color: var(--muted); }
  .wp-db-act-time { font-size: 10px; color: var(--muted2); }
  .wp-db-notif { position: absolute; top: 80px; right: -16px; z-index: 20; background: var(--bg-card2); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; width: 240px; box-shadow: 0 20px 60px rgba(0,0,0,.6); animation: wp-floatIn 0.5s 1.2s ease both; }
  @keyframes wp-floatIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  .wp-db-notif-icon { width: 32px; height: 32px; border-radius: 50%; background: rgba(52,211,153,.1); border: 1px solid rgba(52,211,153,.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .wp-db-notif-title { font-size: 12px; font-weight: 700; }
  .wp-db-notif-sub { font-size: 10px; color: var(--muted); margin-top: 1px; }
  .wp-db-glow { position: absolute; bottom: -50px; left: 50%; transform: translateX(-50%); width: 70%; height: 180px; background: radial-gradient(ellipse, var(--primary-glow) 0%, transparent 70%); filter: blur(30px); pointer-events: none; }

  /* LOGOS */
  .wp-logos-section { padding: 40px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .wp-logos-label { text-align: center; color: var(--muted2); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 22px; }
  .wp-logos-row { display: flex; align-items: center; justify-content: center; gap: 40px; flex-wrap: wrap; }
  .wp-logo-chip { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 13px; font-weight: 600; opacity: .5; transition: opacity .2s; }
  .wp-logo-chip:hover { opacity: .8; }
  .wp-divider-v { width: 1px; height: 20px; background: var(--border); }

  /* SECTION HELPERS */
  .wp-section-tag { display: inline-block; color: var(--primary); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 14px; }
  .wp-section-title { font-size: clamp(28px, 4vw, 46px); font-weight: 900; letter-spacing: -.03em; background: linear-gradient(180deg, #fafafa 0%, rgba(250,250,250,.5) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 14px; line-height: 1.1; }
  .wp-section-title .muted-text { background: none; -webkit-background-clip: unset; background-clip: unset; -webkit-text-fill-color: rgba(161,161,170,.7); color: rgba(161,161,170,.7); }
  .wp-section-desc { color: var(--muted); font-size: 16px; line-height: 1.7; }
  .wp-section-header { text-align: center; margin-bottom: 60px; }
  .wp-section-header .wp-section-desc { max-width: 520px; margin: 0 auto; }

  /* BENTO */
  .wp-features-section { padding: 100px 0; border-top: 1px solid var(--border); background: rgba(255,255,255,.01); }
  .wp-bento-grid { display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: auto auto; gap: 16px; }
  .wp-bento-card { position: relative; overflow: hidden; border-radius: 24px; border: 1px solid var(--border); background: var(--bg-card); transition: border-color .3s, transform .3s; }
  .wp-bento-card:hover { border-color: var(--border-hover); transform: translateY(-3px); }
  .wp-bento-card.primary:hover { border-color: rgba(232,121,249,.25); }
  .wp-bento-card.green-accent:hover { border-color: rgba(52,211,153,.2); }
  .wp-bento-card-content { padding: 32px; position: relative; z-index: 2; }
  .wp-bento-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid; }
  .wp-bento-icon.pink   { background: rgba(232,121,249,.08); border-color: rgba(232,121,249,.2); color: var(--primary); }
  .wp-bento-icon.indigo { background: rgba(129,140,248,.08); border-color: rgba(129,140,248,.2); color: var(--accent); }
  .wp-bento-icon.green  { background: rgba(52,211,153,.08);  border-color: rgba(52,211,153,.2);  color: var(--green); }
  .wp-bento-icon.white  { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.1);  color: var(--text); }
  .wp-bento-card h3 { font-size: 20px; font-weight: 800; letter-spacing: -.02em; margin-bottom: 10px; }
  .wp-bento-card p  { font-size: 13px; color: var(--muted); line-height: 1.65; }
  .wp-bento-seating { grid-row: span 2; min-height: 560px; }
  .wp-seating-visual { position: absolute; right: 0; bottom: 0; width: 65%; height: 60%; border-top: 1px solid rgba(255,255,255,.06); border-left: 1px solid rgba(255,255,255,.06); border-radius: 16px 0 0 0; overflow: hidden; background: #0d0d0f; }
  .wp-seating-inner { width: 100%; height: 100%; background-image: radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px); background-size: 18px 18px; display: flex; align-items: center; justify-content: center; position: relative; }
  .wp-seat-table { width: 100px; height: 100px; border-radius: 50%; border: 2px solid rgba(255,255,255,.1); background: rgba(255,255,255,.03); display: flex; align-items: center; justify-content: center; position: relative; }
  .wp-seat-table-label { font-size: 9px; font-weight: 700; color: var(--muted2); text-transform: uppercase; letter-spacing: .06em; }
  .wp-seat { position: absolute; width: 26px; height: 26px; border-radius: 50%; border: 1px solid rgba(255,255,255,.1); background: var(--bg-card2); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; }
  .wp-seat.taken { background: rgba(129,140,248,.15); border-color: rgba(129,140,248,.3); color: var(--accent); }
  .wp-drag-guest { position: absolute; z-index: 10; animation: wp-dragAnim 4s ease-in-out infinite; }
  .wp-drag-guest-chip { width: 38px; height: 38px; border-radius: 50%; background: #fff; color: #000; font-size: 10px; font-weight: 800; border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,.5), 0 0 0 4px rgba(129,140,248,.15); position: relative; }
  .wp-drag-green-dot { position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: var(--green); border-radius: 50%; border: 2px solid var(--bg); }
  .wp-drag-cursor { position: absolute; bottom: -18px; right: -16px; color: var(--accent); animation: wp-cursorPulse 1s ease-in-out infinite alternate; }
  @keyframes wp-dragAnim { 0% { transform: translate(60px,50px); } 40% { transform: translate(-6px,-44px); } 60% { transform: translate(-6px,-44px); } 100% { transform: translate(60px,50px); } }
  @keyframes wp-cursorPulse { from { opacity: .7; } to { opacity: 1; } }
  .wp-rsvp-notif { position: absolute; bottom: 24px; right: 24px; z-index: 5; background: var(--bg-card2); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; animation: wp-bounce 3s ease-in-out infinite; box-shadow: 0 12px 32px rgba(0,0,0,.4); }
  @keyframes wp-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  .wp-rsvp-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: wp-pulse 1.5s infinite; }
  .wp-rsvp-glow { position: absolute; bottom: -40px; right: -40px; width: 180px; height: 180px; border-radius: 50%; background: rgba(129,140,248,.1); filter: blur(40px); pointer-events: none; }
  .wp-budget-bar-wrap { margin-top: 20px; }
  .wp-budget-bar-meta { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
  .wp-budget-bar-track { height: 6px; background: rgba(255,255,255,.06); border-radius: 3px; overflow: hidden; }
  .wp-budget-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--green), #10b981); animation: wp-barFill 1.5s 0.5s ease both; }
  @keyframes wp-barFill { from { width: 0 !important; } }
  .wp-bento-ai { grid-column: span 2; }
  .wp-ai-chat-wrap { width: 100%; max-width: 420px; background: var(--bg-card2); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-left: auto; transform: rotate(1deg); transition: transform .4s; }
  .wp-bento-ai:hover .wp-ai-chat-wrap { transform: rotate(0deg); }
  .wp-chat-row { display: flex; gap: 10px; align-items: flex-start; }
  .wp-chat-row.right { flex-direction: row-reverse; }
  .wp-chat-avatar { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .wp-chat-avatar.ai { background: linear-gradient(135deg, var(--primary), var(--accent)); }
  .wp-chat-bubble { padding: 10px 14px; border-radius: 14px; font-size: 12px; line-height: 1.6; max-width: 80%; }
  .wp-chat-bubble.ai { background: rgba(255,255,255,.05); border: 1px solid var(--border); color: var(--muted); border-radius: 4px 14px 14px 14px; }
  .wp-chat-bubble.user { background: linear-gradient(135deg, var(--primary-dark), var(--accent)); color: #fff; font-weight: 500; border-radius: 14px 4px 14px 14px; }
  .wp-ai-inner { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
  .wp-ai-text-side { flex: 1; min-width: 220px; }
  .wp-ai-chat-side { flex: 1; min-width: 280px; }

  /* STATS */
  .wp-stats-section { padding: 80px 0; }
  .wp-stats-card { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); padding: 60px 48px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; position: relative; overflow: hidden; }
  .wp-stats-card::before { content: ''; position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 600px; height: 300px; background: radial-gradient(ellipse, var(--primary-glow) 0%, transparent 70%); pointer-events: none; }
  .wp-stat-item { text-align: center; }
  .wp-stat-num { font-size: clamp(40px,5vw,64px); font-weight: 900; letter-spacing: -.05em; background: linear-gradient(135deg,#fff 0%,var(--muted) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .wp-stat-num span { background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .wp-stat-label { color: var(--muted); font-size: 14px; margin-top: 6px; }

  /* PRICING */
  .wp-pricing-section { padding: 100px 0; }
  .wp-pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 800px; margin: 0 auto; }
  .wp-price-card { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); padding: 36px; position: relative; overflow: hidden; transition: transform .25s; }
  .wp-price-card:hover { transform: translateY(-2px); }
  .wp-price-card.featured { border-color: rgba(232,121,249,.3); }
  .wp-price-card.featured::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--primary), transparent); }
  .wp-price-card.featured::after { content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 300px; height: 200px; background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%); pointer-events: none; }
  .wp-price-badge { position: absolute; top: 20px; right: 20px; background: rgba(232,121,249,.1); border: 1px solid rgba(232,121,249,.25); color: var(--primary); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; padding: 4px 10px; border-radius: 100px; }
  .wp-price-name { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .wp-price-desc { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
  .wp-price-amount { font-size: 44px; font-weight: 900; letter-spacing: -.04em; margin-bottom: 4px; }
  .wp-price-amount.paid { background: linear-gradient(135deg,#fafafa,#a1a1aa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .wp-price-orig { font-size: 14px; color: var(--muted2); text-decoration: line-through; margin-left: 8px; }
  .wp-price-period { font-size: 13px; color: var(--muted); margin-bottom: 28px; }
  .wp-price-divider { height: 1px; background: var(--border); margin: 24px 0; }
  .wp-price-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
  .wp-price-list li { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); }
  .wp-price-list li.active { color: var(--text); }
  .wp-price-check { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .wp-price-check.main  { background: rgba(232,121,249,.12); border: 1px solid rgba(232,121,249,.2); }
  .wp-price-check.muted { background: rgba(255,255,255,.04); border: 1px solid var(--border); }
  .wp-btn-plan { display: block; text-align: center; text-decoration: none; font-family: inherit; font-size: 14px; font-weight: 600; padding: 13px; border-radius: 10px; transition: all .2s; cursor: pointer; border: none; width: 100%; }
  .wp-btn-plan.secondary { background: rgba(255,255,255,.06); color: var(--text); border: 1px solid var(--border); }
  .wp-btn-plan.secondary:hover { background: rgba(255,255,255,.1); }
  .wp-btn-plan.main { background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%); color: #fff; box-shadow: 0 4px 24px var(--primary-glow); }
  .wp-btn-plan.main:hover { transform: translateY(-1px); box-shadow: 0 8px 32px var(--primary-glow); }

  /* FAQ */
  .wp-faq-section { padding: 100px 0; background: rgba(255,255,255,.01); border-top: 1px solid var(--border); }
  .wp-faq-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .wp-faq-item { background: var(--bg); }
  .wp-faq-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; background: none; border: none; color: var(--text); font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer; text-align: left; transition: background .2s; }
  .wp-faq-btn:hover { background: rgba(255,255,255,.02); }
  .wp-faq-icon { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--muted); transition: all .25s; }
  .wp-faq-item.open .wp-faq-icon { border-color: rgba(232,121,249,.3); color: var(--primary); background: rgba(232,121,249,.06); transform: rotate(45deg); }
  .wp-faq-body { overflow: hidden; transition: max-height .35s cubic-bezier(0.4,0,0.2,1); }
  .wp-faq-body-inner { padding: 16px 24px 20px; color: var(--muted); font-size: 14px; line-height: 1.75; border-top: 1px solid var(--border); }

  /* CTA */
  .wp-cta-section { padding: 80px 0 120px; }
  .wp-cta-box { position: relative; border: 1px solid var(--border); border-radius: 24px; background: var(--bg-card); padding: 80px 48px; text-align: center; overflow: hidden; }
  .wp-cta-box::before { content: ''; position: absolute; top: -120px; left: 50%; transform: translateX(-50%); width: 800px; height: 400px; background: radial-gradient(ellipse, var(--primary-glow) 0%, transparent 65%); pointer-events: none; }
  .wp-cta-beam { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 1px; height: 100%; background: linear-gradient(180deg, transparent 0%, var(--primary) 50%, transparent 100%); opacity: .3; }
  .wp-cta-pattern { position: absolute; bottom: 0; left: 0; right: 0; height: 120px; pointer-events: none; background: repeating-linear-gradient(90deg, transparent 0, transparent 59px, var(--border) 59px, var(--border) 60px), repeating-linear-gradient(0deg, transparent 0, transparent 59px, var(--border) 59px, var(--border) 60px); mask-image: linear-gradient(180deg, transparent 0%, black 100%); opacity: .4; }
  .wp-cta-box h2 { font-size: clamp(28px,4vw,52px); font-weight: 900; letter-spacing: -.04em; max-width: 600px; margin: 0 auto 16px; background: linear-gradient(180deg,#fafafa 0%,rgba(250,250,250,.5) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .wp-cta-box p { color: var(--muted); font-size: 16px; max-width: 440px; margin: 0 auto 36px; line-height: 1.7; }
  .wp-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .wp-cta-note { font-size: 12px; color: var(--muted2); margin-top: 16px; }

  /* FOOTER */
  footer.wp-footer { border-top: 1px solid var(--border); padding: 48px 0; }
  .wp-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
  .wp-footer-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: var(--text); font-weight: 700; font-size: 15px; }
  .wp-footer-links { display: flex; gap: 28px; }
  .wp-footer-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color .2s; }
  .wp-footer-links a:hover { color: var(--text); }
  .wp-footer-copy { color: var(--muted2); font-size: 13px; }

  /* SCROLL ANIMATION */
  .wp-fade-up { opacity: 0; transform: translateY(28px); transition: opacity .7s cubic-bezier(0.22,1,.36,1), transform .7s cubic-bezier(0.22,1,.36,1); }
  .wp-fade-up.visible { opacity: 1; transform: translateY(0); }
  .wp-d1{transition-delay:.05s}.wp-d2{transition-delay:.1s}.wp-d3{transition-delay:.15s}.wp-d4{transition-delay:.2s}

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .wp-db-body { grid-template-columns: 1fr; }
    .wp-db-sidebar { display: none; }
    .wp-db-kpis { grid-template-columns: repeat(2, 1fr); }
    .wp-db-charts { grid-template-columns: 1fr; }
    .wp-bento-grid { grid-template-columns: 1fr; }
    .wp-bento-seating { grid-row: span 1; }
    .wp-bento-ai { grid-column: span 1; }
    .wp-stats-card { grid-template-columns: 1fr; padding: 40px 28px; gap: 32px; }
    .wp-pricing-grid { grid-template-columns: 1fr; max-width: 420px; }
    .wp-ai-inner { flex-direction: column; }
  }
  @media (max-width: 640px) {
    .wp-nav-links, .wp-btn-ghost { display: none; }
    .wp-hamburger { display: flex; }
    .wp-hero { padding: 60px 0 48px; }
    .wp-hero-btns { flex-direction: column; align-items: center; }
    .wp-hero-btns a { width: 100%; max-width: 280px; justify-content: center; }
    .wp-cta-box { padding: 48px 24px; }
    .wp-footer-inner { flex-direction: column; text-align: center; }
    .wp-footer-links { flex-wrap: wrap; justify-content: center; }
    .wp-db-notif { display: none; }
    .wp-db-body { height: 380px; }
    .wp-db-content { padding: 16px; }
    .wp-db-kpis { grid-template-columns: repeat(2,1fr); gap: 8px; }
  }
`;

/* ─── SVG ICONS ─────────────────────────────────────────────────────────── */
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);
const IconPlay = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21"/></svg>
);
const IconLock = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const IconCheck = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);
const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const IconCursor = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#818cf8" stroke="#fff" strokeWidth="1"><path d="M4 2l16 10-8 2-4 8z"/></svg>
);
const IconHamburger = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);

/* ─── NUMBER TICKER ──────────────────────────────────────────────────────── */
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

/* ─── FADE UP HOOK ───────────────────────────────────────────────────────── */
function useFadeUp() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".wp-fade-up:not(.visible)").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── SMOOTH SCROLL HELPER ───────────────────────────────────────────────── */
function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ══════════════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════════════ */
function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="wp-navbar">
      <div className="wp-container">
        <div className="wp-nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="/" className="wp-nav-logo">
              <div className="wp-nav-logo-icon">W</div>
              WeddingPro
            </a>
            <ul className="wp-nav-links">
              <li><a href="#features" onClick={e => { e.preventDefault(); scrollTo("features"); }}>Funcționalități</a></li>
              <li><a href="#pricing"  onClick={e => { e.preventDefault(); scrollTo("pricing");  }}>Prețuri</a></li>
              <li><a href="#faq"      onClick={e => { e.preventDefault(); scrollTo("faq");      }}>Întrebări</a></li>
            </ul>
          </div>
          <div className="wp-nav-actions">
            <a href="/login" className="wp-btn-ghost">Autentificare</a>
            <a href="/register" className="wp-btn-primary">Începe Gratuit <IconArrow /></a>
            <button className="wp-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
              <IconHamburger />
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="wp-mobile-menu">
          <a href="#features" onClick={() => { scrollTo("features"); close(); }}>Funcționalități</a>
          <a href="#pricing"  onClick={() => { scrollTo("pricing");  close(); }}>Prețuri</a>
          <a href="#faq"      onClick={() => { scrollTo("faq");      close(); }}>Întrebări</a>
          <a href="/login"    onClick={close}>Autentificare</a>
          <a href="/register" onClick={close}>Creează Cont Gratuit →</a>
        </div>
      )}
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HERO + DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
const DB_BARS = [38, 62, 45, 80, 55, 92, 68, 74, 50, 88];

function Hero() {
  return (
    <section className="wp-hero">
      <div className="wp-hero-glow" />
      <div className="wp-container">

        <div className="wp-badge" style={{ margin: "0 auto 28px" }}>
          <span className="wp-badge-dot" />
          Versiunea 2.0 este live!
        </div>

        <h1 className="wp-fade-up visible">
          Give your wedding<br />
          <em>the plan it deserves</em>
        </h1>
        <p className="wp-fade-up visible wp-d1">
          Platforma completă pentru miri și organizatori. Gestionează invitați, așezarea la mese, bugetul și confirmările RSVP — într-un singur loc.
        </p>

        <div className="wp-hero-btns wp-fade-up visible wp-d2">
          <a href="/register" className="wp-btn-primary wp-btn-lg">
            Începe Gratuit <IconArrow />
          </a>
          <a href="#features" className="wp-btn-outline-lg" onClick={e => { e.preventDefault(); scrollTo("features"); }}>
            <IconPlay /> Demo Live
          </a>
        </div>

        {/* ── DASHBOARD 3D ──────────────────────────────── */}
        <div className="wp-dashboard-wrapper wp-fade-up visible wp-d3">
          {/* Floating notification */}
          <div className="wp-db-notif">
            <div className="wp-db-notif-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div className="wp-db-notif-title">Invitat Confirmat</div>
              <div className="wp-db-notif-sub">Alexandru Popa a confirmat.</div>
            </div>
          </div>

          <div className="wp-dashboard-3d">
            <div className="wp-dashboard-outer">
              <div className="wp-dashboard-inner">
                {/* Window chrome */}
                <div className="wp-window-chrome">
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
                {/* Body */}
                <div className="wp-db-body">
                  {/* Sidebar */}
                  <div className="wp-db-sidebar">
                    <div className="wp-db-sidebar-label">Meniu</div>
                    {["Overview","Invitați","Planificator","Buget","Setări"].map((item, i) => (
                      <div key={item} className={`wp-db-nav-item${i === 0 ? " active" : ""}`}>
                        <span className={`wp-db-nav-dot${i === 0 ? " active" : ""}`} />
                        {item}
                      </div>
                    ))}
                    <div className="wp-db-sidebar-bottom">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="wp-db-avatar" />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>Alex & Maria</div>
                          <div style={{ fontSize: 10, color: "var(--muted2)" }}>Premium</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Main */}
                  <div className="wp-db-main">
                    <div className="wp-db-topbar">
                      <div>
                        <div className="wp-db-topbar-title">Bun venit, Alex & Maria</div>
                        <div className="wp-db-topbar-sub">Ai 3 sarcini noi astăzi. Nunta în 24 de zile.</div>
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,var(--primary),var(--accent))" }} />
                    </div>
                    <div className="wp-db-content">
                      {/* KPIs */}
                      <div className="wp-db-kpis">
                        {[
                          { label: "Invitați", val: "142", cls: "" },
                          { label: "Buget",    val: "45K", cls: "" },
                          { label: "Zile",     val: "24",  cls: " indigo" },
                          { label: "Confirmări",val: "78%", cls: " green" },
                        ].map(({ label, val, cls }) => (
                          <div key={label} className="wp-db-kpi">
                            <div className="wp-db-kpi-label">{label}</div>
                            <div className={`wp-db-kpi-val${cls}`}>{val}</div>
                          </div>
                        ))}
                      </div>
                      {/* Charts */}
                      <div className="wp-db-charts">
                        <div className="wp-db-chart-card">
                          <div className="wp-db-chart-title">Cheltuieli Lunare</div>
                          <div className="wp-db-bars">
                            {DB_BARS.map((h, i) => (
                              <div key={i} className="wp-db-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }} />
                            ))}
                          </div>
                        </div>
                        <div className="wp-db-chart-card">
                          <div className="wp-db-chart-title">Activitate Recentă</div>
                          <div className="wp-db-activity">
                            {[
                              { label: "Confirmare nouă",    time: "Acum 2 minute",  cls: "" },
                              { label: "Masă editată",       time: "Acum 18 minute", cls: " indigo" },
                              { label: "Buget actualizat",   time: "Acum 1 oră",     cls: " green" },
                            ].map(({ label, time, cls }) => (
                              <div key={label} className="wp-db-act-item">
                                <div className={`wp-db-act-avatar${cls}`} />
                                <div>
                                  <div className="wp-db-act-text">{label}</div>
                                  <div className="wp-db-act-time">{time}</div>
                                </div>
                              </div>
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
          <div className="wp-db-glow" />
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   LOGOS
══════════════════════════════════════════════════════════════════════════ */
function Logos() {
  return (
    <div className="wp-logos-section wp-fade-up">
      <div className="wp-container">
        <p className="wp-logos-label">Utilizat de miri din toată România</p>
        <div className="wp-logos-row">
          <div className="wp-logo-chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            2,500+ cupluri
          </div>
          <div className="wp-divider-v" />
          <div className="wp-logo-chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Rating 4.9 / 5
          </div>
          <div className="wp-divider-v" />
          <div className="wp-logo-chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Suport 24/7
          </div>
          <div className="wp-divider-v" />
          <div className="wp-logo-chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Date securizate
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FEATURES BENTO
══════════════════════════════════════════════════════════════════════════ */
const SEAT_ANGLES = [0, 60, 120, 180, 240, 300];

function SeatingVisual() {
  return (
    <div className="wp-seating-visual">
      <div className="wp-seating-inner">
        <div className="wp-seat-table">
          <div className="wp-seat-table-label">Masa 1</div>
          {SEAT_ANGLES.map((deg, i) => (
            <div
              key={deg}
              className={`wp-seat${i > 0 ? " taken" : ""}`}
              style={{
                top: "50%", left: "50%",
                transform: `translate(-50%,-50%) rotate(${deg}deg) translate(52px) rotate(-${deg}deg)`,
              }}
            >
              {i > 0 ? String.fromCharCode(64 + i) : ""}
            </div>
          ))}
        </div>
        {/* Dragging guest */}
        <div className="wp-drag-guest">
          <div className="wp-drag-guest-chip">
            Ioan
            <div className="wp-drag-green-dot" />
          </div>
          <div className="wp-drag-cursor"><IconCursor /></div>
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="wp-features-section">
      <div className="wp-container">
        <div className="wp-section-header wp-fade-up">
          <span className="wp-section-tag">Funcționalități</span>
          <h2 className="wp-section-title">
            Construit pentru viteză.<br />
            <span className="muted-text">Optimizat pentru claritate.</span>
          </h2>
          <p className="wp-section-desc">
            Fiecare interacțiune din WeddingPro este gândită să fie instantanee. Elimină haosul din Excel.
          </p>
        </div>

        <div className="wp-bento-grid wp-fade-up">

          {/* CARD 1 — Seating (tall left) */}
          <div className="wp-bento-card primary wp-bento-seating">
            <div className="wp-bento-card-content" style={{ maxWidth: 360 }}>
              <div className="wp-bento-icon pink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <h3>Planificator Mese Drag & Drop</h3>
              <p>Organizează sala vizual în câteva minute. Trage invitații direct pe locurile libere, grupează familiile și gestionează conflictele automat.</p>
            </div>
            <SeatingVisual />
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* CARD 2 — RSVP */}
            <div className="wp-bento-card" style={{ flex: 1, minHeight: 240, position: "relative" }}>
              <div className="wp-bento-card-content">
                <div className="wp-bento-icon white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3"/></svg>
                </div>
                <h3>RSVP Digital</h3>
                <p>Link unic sau public. Invitații confirmă online în timp real. Fără hârtie, fără telefoane.</p>
              </div>
              <div className="wp-rsvp-glow" />
              <div className="wp-rsvp-notif">
                <div className="wp-rsvp-pulse" />
                RSVP Nou: Maria I.
              </div>
            </div>

            {/* CARD 3 — Budget */}
            <div className="wp-bento-card green-accent" style={{ flex: 1, minHeight: 240 }}>
              <div className="wp-bento-card-content">
                <div className="wp-bento-icon green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <h3>Buget Smart</h3>
                <p>Ține evidența cheltuielilor și plăților scadente în timp real.</p>
                <div className="wp-budget-bar-wrap">
                  <div className="wp-budget-bar-meta"><span>Cheltuit</span><span>75%</span></div>
                  <div className="wp-budget-bar-track">
                    <div className="wp-budget-bar-fill" style={{ width: "75%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4 — AI (full width) */}
          <div className="wp-bento-card primary wp-bento-ai">
            <div className="wp-bento-card-content">
              <div className="wp-ai-inner">
                <div className="wp-ai-text-side">
                  <div className="wp-bento-icon pink" style={{ marginBottom: 20 }}><IconZap /></div>
                  <h3>Asistent AI & Checklist</h3>
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
          </div>

        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════════════════════════ */
function Stats() {
  return (
    <section className="wp-stats-section">
      <div className="wp-container-sm">
        <div className="wp-stats-card wp-fade-up">
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

/* ══════════════════════════════════════════════════════════════════════════
   PRICING
══════════════════════════════════════════════════════════════════════════ */
const FREE_FEATURES  = ["1 Invitat Demo","5 Elemente Canvas","Acces Tema \"Classic\"","Checklist de bază"];
const PRO_FEATURES   = ["Invitați Nelimitați","Planificator Mese Nelimitat","Toate Temele (Modern, Floral)","Calculator Buget Automat","Asistent AI & Export PDF"];

function Pricing() {
  return (
    <section id="pricing" className="wp-pricing-section">
      <div className="wp-container">
        <div className="wp-section-header wp-fade-up">
          <span className="wp-section-tag">Prețuri</span>
          <h2 className="wp-section-title">Investiție unică.<br />Acces pe viață.</h2>
          <p className="wp-section-desc">Fără abonamente lunare ascunse. Plătești o singură dată și ai acces nelimitat.</p>
        </div>
        <div className="wp-pricing-grid">

          {/* FREE */}
          <div className="wp-price-card wp-fade-up wp-d1">
            <div className="wp-price-name">Starter</div>
            <div className="wp-price-desc">Perfect pentru a testa platforma.</div>
            <div className="wp-price-amount">Gratuit</div>
            <div className="wp-price-period">Pentru totdeauna</div>
            <div className="wp-price-divider" />
            <ul className="wp-price-list">
              {FREE_FEATURES.map(f => (
                <li key={f} className="active">
                  <span className="wp-price-check muted"><IconCheck /></span>
                  {f}
                </li>
              ))}
            </ul>
            <a href="/register" className="wp-btn-plan secondary">Începe Gratuit</a>
          </div>

          {/* PREMIUM */}
          <div className="wp-price-card featured wp-fade-up wp-d2">
            <span className="wp-price-badge">Popular</span>
            <div className="wp-price-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Premium <IconStar />
            </div>
            <div className="wp-price-desc">Plată unică. Acces nelimitat.</div>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <div className="wp-price-amount paid">49 LEI</div>
              <span className="wp-price-orig">99 LEI</span>
            </div>
            <div className="wp-price-period">O singură plată · Acces pe viață</div>
            <div className="wp-price-divider" />
            <ul className="wp-price-list">
              {PRO_FEATURES.map(f => (
                <li key={f} className="active">
                  <span className="wp-price-check main"><IconCheck color="var(--primary)" /></span>
                  {f}
                </li>
              ))}
            </ul>
            <a href="/register" className="wp-btn-plan main">Activează Premium</a>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════════════════════ */
const FAQ_ITEMS = [
  { q: "Este plata recurentă?",                   a: "Nu. Plătești o singură dată suma de 49 LEI și ai acces pe viață la contul tău pentru un eveniment. Nicio taxă ascunsă, niciun abonament lunar." },
  { q: "Pot exporta lista de invitați?",          a: "Da, poți exporta lista completă în format PDF, gata de trimis către locație sau firma de catering. Formatul este profesional și include toate detaliile necesare." },
  { q: "Pot folosi platforma de pe telefon?",     a: "Da, platforma este optimizată pentru mobil. Totuși, pentru planificarea meselor (drag & drop) recomandăm un ecran mai mare — laptop sau tabletă." },
  { q: "Datele mele sunt în siguranță?",          a: "Absolut. Toate datele sunt criptate end-to-end și stocate pe servere securizate. Nu partajăm niciodată informațiile tale cu terți fără consimțământul tău explicit." },
  { q: "Pot organiza mai multe nunți?",           a: "Planul Premium include un eveniment complet. Dacă ești organizator profesionist, contactează-ne pentru un plan personalizat la prețuri speciale." },
];

function FAQ() {
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

/* ══════════════════════════════════════════════════════════════════════════
   CTA
══════════════════════════════════════════════════════════════════════════ */
function CTA() {
  return (
    <section className="wp-cta-section">
      <div className="wp-container">
        <div className="wp-cta-box wp-fade-up">
          <div className="wp-cta-beam" />
          <div className="wp-cta-pattern" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="wp-badge" style={{ margin: "0 auto 28px" }}>
              <span className="wp-badge-dot" />
              Ofertă limitată — 50% reducere
            </div>
            <h2>Gata să organizezi nunta visurilor?</h2>
            <p>Alătură-te celor peste 2,500 de cupluri care au scăpat de stresul planificării cu WeddingPro.</p>
            <div className="wp-cta-btns">
              <a href="/register" className="wp-btn-primary wp-btn-lg">
                Creează Cont Gratuit <IconArrow />
              </a>
              <a href="#pricing" className="wp-btn-outline-lg" onClick={e => { e.preventDefault(); scrollTo("pricing"); }}>
                Vede Prețuri
              </a>
            </div>
            <p className="wp-cta-note">Nu necesită card de credit pentru înregistrare.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════════════════ */
function Footer() {
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
            <a href="#faq" onClick={e => { e.preventDefault(); scrollTo("faq"); }}>Întrebări</a>
          </div>
          <div className="wp-footer-copy">© {new Date().getFullYear()} WeddingPro. Toate drepturile rezervate.</div>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  useFadeUp();

  return (
    <>
      <style>{css}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div className="wp-grid-bg" />
      <div className="wp-noise" />

      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Geist', sans-serif" }}>
        <Navbar />
        <Hero />
        <Logos />
        <Features />
        <Stats />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
