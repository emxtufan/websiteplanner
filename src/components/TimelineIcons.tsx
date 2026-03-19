/**
 * TimelineIcons.tsx — Wedding timeline icon library
 *
 * ═══════════════════════════════════════════════════════════
 *  CUM ADAUGI / ÎNLOCUIEȘTI UN ICON:
 *
 *  1. Deschide orice SVG editor (Figma, Illustrator, svg-repo.com…)
 *  2. Copiază DOAR conținutul interior al <svg> (path-urile, nu wrapper-ul)
 *  3. Lipește-l ca valoare a cheii dorite mai jos
 *  4. Gata. Componenta WeddingIcon se ocupă de wrapper-ul <svg>.
 *
 *  Exemple de surse gratuite SVG:
 *    https://www.svgrepo.com/collection/wedding-hand-drawn-doodle-icons/
 *    https://www.svgrepo.com/collection/wedding-icons/
 *
 *  IMPORTANT: Iconurile sunt proiectate pe un canvas 32×32 (viewBox "0 0 32 32").
 *  Dacă SVG-ul tău are alt viewBox, rescalează în Figma înainte de paste.
 *  stroke="currentColor" este moștenit automat — nu trebuie setat manual.
 * ═══════════════════════════════════════════════════════════
 */

import React from 'react';

// ─── Dicționar SVG strings ────────────────────────────────────────────────────
// Valoarea fiecărei chei = innerHTML-ul unui <svg viewBox="0 0 32 32">.
// Înlocuiește orice valoare cu SVG-ul tău preferat.

/**
 * Fiecare cheie poate fi:
 *   - un string simplu (viewBox implicit 0 0 32 32)
 *   - un obiect { vb: '0 0 64 64', html: `...paths...` }  ← pentru SVG-uri cu alt viewBox
 *
 * CUM ADAUGI UN SVG DE PE SVG REPO / FIGMA:
 *   1. Copiază SVG-ul complet
 *   2. Găsește viewBox-ul (ex: viewBox="0 0 64 64")
 *   3. Extrage DOAR conținutul interior (fără tag-ul <svg> și </svg>)
 *   4. Pune-l ca obiect: { vb: '0 0 64 64', html: `...conținut...` }
 */
export type SvgIconValue = string | { vb: string; html: string };
export const SVG_ICONS: Record<string, SvgIconValue> = {

  // ── 💍 Inele (SVG Repo, viewBox 64×64) ──────────────────────────────────
  //  Înlocuit cu icon de pe svgrepo.com — format obiect { vb, html }
  rings: {
    vb: '0 0 64 64',
    html: `
      <path d="M61.063 60.125h-.938v-15.01c.731.035 1.443-.371 1.739-1.074a1.754 1.754 0 0 0-.965-2.297l-15.774-6.443v-6.386l.348.141c.906.367 1.956-.058 2.329-.944c.376-.887-.059-1.914-.963-2.28l-13.276-5.523V9.813h4.688V6.688h-4.688V2h-3.125v4.688H25.75v3.125h4.688v10.495l-13.276 5.523c-.904.366-1.339 1.394-.963 2.28c.373.887 1.423 1.312 2.327.944l.35-.142V35.3L3.099 41.744a1.754 1.754 0 0 0-.963 2.297c.294.703 1.008 1.11 1.739 1.074v15.01h-.937c-.517 0-.938.422-.938.938s.421.937.938.937h58.125c.514 0 .937-.422.937-.937s-.423-.938-.937-.938m-42.188 0H5.75V44.466l13.125-5.361v21.02m12.188-1.562H28.25V55.75h2.813v2.813m0-4.063H28.25v-2.813c0-1.742 1.199-3.198 2.813-3.617v6.43m4.687 4.063h-2.813V55.75h2.813v2.813m0-4.063h-2.813v-6.429c1.612.419 2.813 1.875 2.813 3.616V54.5m7.5 5.625h-5.625v-8.438a5.625 5.625 0 0 0-11.25 0v8.438H20.75V28.153L32 23.59l11.25 4.564v31.971m15 0H45.125V39.104l13.125 5.361v15.66" fill="currentColor" stroke="none"/>
      <path d="M31.044 34.998c.319.433.517.351.438-.181l-.723-4.859a.89.89 0 0 0-1.095-.746s-.129.03-.658.248c-.529.22-.639.29-.639.29a.889.889 0 0 0-.247 1.302l2.924 3.946" fill="currentColor" stroke="none"/>
      <path d="M25.274 35.447l4.856.722c.53.08.613-.117.179-.438l-3.942-2.923a.83.83 0 0 0-1.254.277l-.529 1.279a.83.83 0 0 0 .69 1.083" fill="currentColor" stroke="none"/>
      <path d="M30.129 37.206l-4.858.723a.889.889 0 0 0-.745 1.095s.029.129.247.658c.22.528.29.639.29.639a.889.889 0 0 0 1.302.247l3.945-2.924c.434-.32.351-.518-.181-.438" fill="currentColor" stroke="none"/>
      <path d="M31.044 38.376l-2.922 3.944a.828.828 0 0 0 .276 1.253l1.279.53a.828.828 0 0 0 1.081-.69l.723-4.856c.08-.531-.117-.614-.437-.181" fill="currentColor" stroke="none"/>
      <path d="M33.241 43.417a.89.89 0 0 0 1.095.745s.129-.029.658-.247c.527-.22.639-.29.639-.29a.889.889 0 0 0 .247-1.302l-2.924-3.947c-.32-.433-.519-.35-.438.182l.723 4.859" fill="currentColor" stroke="none"/>
      <path d="M38.726 37.928l-4.856-.722c-.53-.08-.613.117-.181.438l3.944 2.922a.827.827 0 0 0 1.252-.276l.531-1.279a.83.83 0 0 0-.69-1.083" fill="currentColor" stroke="none"/>
      <path d="M33.869 36.169l4.86-.723a.89.89 0 0 0 .745-1.096s-.029-.128-.247-.657c-.22-.528-.29-.639-.29-.639a.888.888 0 0 0-1.302-.247l-3.947 2.924c-.432.32-.349.518.181.438" fill="currentColor" stroke="none"/>
      <path d="M32.956 34.998l2.922-3.943a.828.828 0 0 0-.276-1.253l-1.279-.53a.83.83 0 0 0-1.083.69l-.721 4.855c-.081.532.117.615.437.181" fill="currentColor" stroke="none"/>
      <path d="M53.983 29.188S62 20.75 62 16.532c0-2.329-1.988-4.219-4.442-4.219c-1.767 0-3.281.988-3.995 2.41c-.714-1.422-2.229-2.41-3.997-2.41c-2.452 0-4.44 1.89-4.44 4.219c-.001 4.218 8.857 12.656 8.857 12.656" fill="currentColor" stroke="none"/>
      <path d="M10.858 29.188s8.017-8.438 8.017-12.656c0-2.329-1.988-4.219-4.442-4.219c-1.767 0-3.281.988-3.995 2.41c-.714-1.422-2.229-2.41-3.997-2.41c-2.452 0-4.44 1.89-4.44 4.219C2 20.75 10.858 29.188 10.858 29.188" fill="currentColor" stroke="none"/>
    `,
  },

  // ── 💎 Inel solitaire cu diamant ─────────────────────────────────────────
  diamond: `
    <circle cx="16" cy="21" r="9"/>
    <path d="M11 15 L21 15"/>
    <path d="M11 15 L16 5 L21 15 Z"/>
    <path d="M11 15 L16 11 L21 15"/>
    <line x1="16" y1="5" x2="16" y2="15"/>
    <line x1="13" y1="10" x2="16" y2="15"/>
    <line x1="19" y1="10" x2="16" y2="15"/>
    <line x1="3.4" y1="9" x2="6.6" y2="9" stroke-width="0.9"/>
    <line x1="5" y1="7.4" x2="5" y2="10.6" stroke-width="0.9"/>
    <line x1="25.3" y1="7" x2="28.7" y2="7" stroke-width="0.9"/>
    <line x1="27" y1="5.4" x2="27" y2="8.6" stroke-width="0.9"/>
    <circle cx="28" cy="13" r="1" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="15" r="1" fill="currentColor" stroke="none"/>
  `,

  // ── ⛪ Biserică cu cruce, ferestre arcuite, ușă ───────────────────────────
  ceremony: `
    <line x1="16" y1="0.5" x2="16" y2="5"/>
    <line x1="14" y1="2.5" x2="18" y2="2.5"/>
    <path d="M13 5 L16 2 L19 5 L19 12 L13 12 Z"/>
    <path d="M4 15 L16 8 L28 15"/>
    <rect x="4" y="15" width="24" height="15"/>
    <circle cx="16" cy="10" r="1.8"/>
    <path d="M13 30 L13 23 Q16 19.5 19 23 L19 30"/>
    <circle cx="18.2" cy="26.5" r="0.7" fill="currentColor" stroke="none"/>
    <path d="M6.5 18 L6.5 23 Q8.5 21 10.5 23 L10.5 18 Z"/>
    <path d="M21.5 18 L21.5 23 Q23.5 21 25.5 23 L25.5 18 Z"/>
    <circle cx="3" cy="11" r="1" fill="currentColor" stroke="none"/>
    <circle cx="29" cy="11" r="1" fill="currentColor" stroke="none"/>
  `,

  // ── 🕯️ Trei lumânări pe sfeșnice ─────────────────────────────────────────
  candles: `
    <rect x="5.5" y="14" width="4" height="12"/>
    <line x1="7.5" y1="14" x2="7.5" y2="11"/>
    <path d="M6.3 12 Q7.5 9 8.7 12 Q8.4 13.5 7.5 14 Q6.6 13.5 6.3 12 Z"
          fill="currentColor" fill-opacity="0.2" stroke-width="0.9"/>
    <path d="M5.5 17 Q7 15.5 9.5 17" stroke-width="0.8"/>
    <path d="M4.5 26 Q7.5 24.5 10.5 26"/>
    <path d="M6.5 26 L6 29.5 M8.5 26 L9 29.5"/>
    <path d="M6 29.5 L9 29.5"/>
    <ellipse cx="7.5" cy="30.5" rx="3" ry="1.2"/>
    <rect x="14" y="8" width="4" height="16"/>
    <line x1="16" y1="8" x2="16" y2="5"/>
    <path d="M14.8 6 Q16 3 17.2 6 Q16.8 7.5 16 8 Q15.2 7.5 14.8 6 Z"
          fill="currentColor" fill-opacity="0.22" stroke-width="0.9"/>
    <path d="M14 11 Q16 9.5 18 11" stroke-width="0.8"/>
    <path d="M14 15 Q15 13.5 18 15" stroke-width="0.8"/>
    <path d="M12 24 Q16 22.5 20 24"/>
    <path d="M14 24 L13.5 27.5 M18 24 L18.5 27.5"/>
    <path d="M13.5 27.5 L18.5 27.5"/>
    <ellipse cx="16" cy="28.8" rx="3.5" ry="1.3"/>
    <rect x="22.5" y="14" width="4" height="12"/>
    <line x1="24.5" y1="14" x2="24.5" y2="11"/>
    <path d="M23.3 12 Q24.5 9 25.7 12 Q25.4 13.5 24.5 14 Q23.6 13.5 23.3 12 Z"
          fill="currentColor" fill-opacity="0.2" stroke-width="0.9"/>
    <path d="M22.5 17 Q24 15.5 26.5 17" stroke-width="0.8"/>
    <path d="M21.5 26 Q24.5 24.5 27.5 26"/>
    <path d="M23.5 26 L23 29.5 M25.5 26 L26 29.5"/>
    <path d="M23 29.5 L26 29.5"/>
    <ellipse cx="24.5" cy="30.5" rx="3" ry="1.2"/>
  `,

  // ── 📷 Cameră foto DSLR vintage ──────────────────────────────────────────
  photo: `
    <rect x="2" y="10" width="28" height="17" rx="2"/>
    <path d="M10 10 L10 7 L15 5 L17 5 L22 7 L22 10"/>
    <rect x="3.5" y="7" width="5" height="3" rx="0.5"/>
    <circle cx="16" cy="18.5" r="6.5"/>
    <circle cx="16" cy="18.5" r="5"/>
    <circle cx="16" cy="18.5" r="3.2"/>
    <circle cx="16" cy="18.5" r="2" fill="currentColor" fill-opacity="0.18"/>
    <circle cx="14.3" cy="16.8" r="1" fill="currentColor" fill-opacity="0.35" stroke="none"/>
    <rect x="24" y="11" width="4.5" height="3" rx="0.5"/>
    <circle cx="6" cy="9.5" r="1.5" fill="currentColor" fill-opacity="0.2"/>
    <line x1="25" y1="22" x2="28" y2="22" stroke-width="0.9"/>
    <line x1="25" y1="24" x2="28" y2="24" stroke-width="0.9"/>
    <line x1="25.9" y1="8" x2="29.1" y2="8" stroke-width="0.9"/>
    <line x1="27.5" y1="6.4" x2="27.5" y2="9.6" stroke-width="0.9"/>
  `,

  // ── 🌸 Arc floral (intrare în sală) ──────────────────────────────────────
  arch: `
    <line x1="7" y1="32" x2="7" y2="15"/>
    <line x1="25" y1="32" x2="25" y2="15"/>
    <path d="M7 15 Q7 4 16 4 Q25 4 25 15"/>
    <circle cx="5" cy="22" r="2.2"/>
    <circle cx="8" cy="17" r="1.8"/>
    <circle cx="4.5" cy="28" r="1.8"/>
    <path d="M5 22 Q2.5 20 3.5 18" stroke-width="0.8"/>
    <path d="M5 22 Q2 23.5 3 26" stroke-width="0.8"/>
    <path d="M5 22 Q4 20 5 18.5" stroke-width="0.8"/>
    <circle cx="27" cy="22" r="2.2"/>
    <circle cx="24" cy="17" r="1.8"/>
    <circle cx="27.5" cy="28" r="1.8"/>
    <path d="M27 22 Q29.5 20 28.5 18" stroke-width="0.8"/>
    <path d="M27 22 Q30 23.5 29 26" stroke-width="0.8"/>
    <circle cx="16" cy="3.5" r="2"/>
    <circle cx="11" cy="6" r="1.6"/>
    <circle cx="21" cy="6" r="1.6"/>
    <circle cx="8" cy="11" r="1.5"/>
    <circle cx="24" cy="11" r="1.5"/>
    <path d="M7 15 Q11 19 16 17.5 Q21 19 25 15" stroke-width="0.9"/>
    <path d="M10 9 Q8 7 9 6" stroke-width="0.8"/>
    <path d="M22 9 Q24 7 23 6" stroke-width="0.8"/>
    <line x1="14.2" y1="2.5" x2="17.8" y2="2.5" stroke-width="0.9"/>
    <line x1="16" y1="0.7" x2="16" y2="4.3" stroke-width="0.9"/>
  `,

  // ── 💃 Cuplu dansând, rochia în vânt ─────────────────────────────────────
  dance: `
    <circle cx="11" cy="5" r="2.5"/>
    <path d="M9 3 L9 1.5 L13 1.5 L13 3"/>
    <path d="M11 7.5 L11 16"/>
    <path d="M11 10 L16.5 8"/>
    <path d="M11 10 L7 13"/>
    <path d="M11 16 L9 23"/>
    <path d="M11 16 L13.5 22"/>
    <path d="M9 23 Q8 24 7 23"/>
    <path d="M13.5 22 Q14.5 23.5 15.5 22.5"/>
    <circle cx="21" cy="6" r="2.5"/>
    <path d="M19 4.5 Q21 2.5 23 4.5 Q23 6.5 21 8.5" stroke-width="1"/>
    <path d="M21 8.5 L20 15"/>
    <path d="M20 11 L16.5 8"/>
    <path d="M20 10 L24 8"/>
    <path d="M20 15 Q12 20 10 28 Q16 25 20 28 Q24 25 28 27 Q27 20 20 15 Z"
          fill="currentColor" fill-opacity="0.07" stroke-width="1"/>
    <path d="M10 28 Q13 26 16 28 Q19 26 22 28 Q25 26 28 27" stroke-width="0.9"/>
    <path d="M19.5 15 Q20.5 16 21.5 15" stroke-width="0.9"/>
  `,

  // ── 🍸 Pahare cocktail + martini ─────────────────────────────────────────
  cocktails: `
    <path d="M3.5 7 L5.5 24 L15.5 24 L17.5 7 Z"/>
    <rect x="5.5" y="14.5" width="4" height="3.5" rx="0.5"
          fill="currentColor" fill-opacity="0.12"/>
    <rect x="9" y="16" width="4" height="4" rx="0.5"
          fill="currentColor" fill-opacity="0.1"/>
    <path d="M3.5 7 L4 10 L17 10 L17.5 7Z"
          fill="currentColor" fill-opacity="0.08" stroke="none"/>
    <line x1="13.5" y1="7" x2="15.5" y2="22" stroke-width="1.1"/>
    <ellipse cx="14.5" cy="7" rx="3" ry="2.5" transform="rotate(-20 14.5 7)"/>
    <line x1="12" y1="6" x2="17" y2="8" stroke-width="0.8"/>
    <line x1="14.5" y1="4.5" x2="14.5" y2="9.5" stroke-width="0.8"/>
    <path d="M19 5 L29 5 L24 16 L24 23"/>
    <path d="M22 23 L26 23"/>
    <line x1="22" y1="23.5" x2="26" y2="23.5" stroke-width="1.4"/>
    <line x1="21.5" y1="10" x2="27" y2="8" stroke-width="0.9"/>
    <circle cx="27" cy="8" r="1.8" fill="currentColor" fill-opacity="0.15"/>
    <circle cx="27" cy="8" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="6.5" cy="12" r="1" fill="currentColor" stroke="none"/>
    <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none"/>
  `,

  // ── 🍽️ Farfurie + furculiță + cuțit ──────────────────────────────────────
  dinner: `
    <circle cx="16" cy="17" r="9.5"/>
    <circle cx="16" cy="17" r="7"/>
    <line x1="5" y1="5" x2="5" y2="29"/>
    <line x1="3.5" y1="5" x2="3.5" y2="10"/>
    <line x1="6.5" y1="5" x2="6.5" y2="10"/>
    <path d="M3.5 10 Q5 11.5 6.5 10"/>
    <path d="M3.5 5 Q5 4 6.5 5"/>
    <line x1="27" y1="5" x2="27" y2="29"/>
    <path d="M27 5 Q30.5 8 29.5 14 L27 14"/>
  `,

  // ── 🎵 Cheie sol + note muzicale + inimi ─────────────────────────────────
  music: `
    <path d="M12 27 Q7 26 8 21 Q9 16 12 15 Q15 14 15 10 Q15 5 12 3
             Q9 1.5 8 4.5 Q7 7.5 9.5 9.5 Q12 11.5 13 15
             Q15 19 14 23 Q13 27 10 28 Q7 28 7.5 25" stroke-width="1.1"/>
    <line x1="21" y1="8" x2="21" y2="19"/>
    <ellipse cx="19.5" cy="19.5" rx="2.8" ry="2"
             transform="rotate(-12 19.5 19.5)"/>
    <line x1="27" y1="6" x2="27" y2="16"/>
    <ellipse cx="25.5" cy="16.5" rx="2.8" ry="2"
             transform="rotate(-12 25.5 16.5)"/>
    <line x1="21" y1="8" x2="27" y2="6" stroke-width="2.2"/>
    <path d="M20 24 C20 24 18.5 22.5 18.5 21.5 C18.5 20.5 19.2 20 20 20.8
             C20.8 20 21.5 20.5 21.5 21.5 C21.5 22.5 20 24 20 24Z"
          stroke-width="0.8"/>
    <path d="M26 23 C26 23 24.5 21.5 24.5 20.5 C24.5 19.5 25.2 19 26 19.8
             C26.8 19 27.5 19.5 27.5 20.5 C27.5 21.5 26 23 26 23Z"
          stroke-width="0.7"/>
  `,

  // ── 🎤 Microfon dropped ───────────────────────────────────────────────────
  mic: `
    <ellipse cx="20" cy="10" rx="5.5" ry="7" transform="rotate(-40 20 10)"/>
    <ellipse cx="20" cy="10" rx="3.5" ry="5" transform="rotate(-40 20 10)"
             fill="currentColor" fill-opacity="0.1"/>
    <line x1="15" y1="8" x2="22" y2="5.5" stroke-width="0.8"/>
    <line x1="14.5" y1="11" x2="23.5" y2="8" stroke-width="0.8"/>
    <line x1="15.5" y1="14" x2="23" y2="11" stroke-width="0.8"/>
    <path d="M13 16 Q14.5 16.5 15.5 15" stroke-width="1.4"/>
    <line x1="10" y1="19" x2="15" y2="15.5"/>
    <line x1="5" y1="25" x2="10" y2="19"/>
    <path d="M5 25 Q3 27 2 29" stroke-width="0.9"/>
    <circle cx="2" cy="29.5" r="1" fill="currentColor" stroke="none"/>
  `,

  // ── 🎂 Tort 3 niveluri cu perle, lumânare + flacără ──────────────────────
  cake: `
    <rect x="15" y="4" width="2" height="5"/>
    <path d="M14.5 5.5 Q16 2 17.5 5.5 Q17.5 7.5 16 8 Q14.5 7.5 14.5 5.5 Z"
          fill="currentColor" fill-opacity="0.2" stroke-width="0.8"/>
    <path d="M10 9 L22 9 L22 14 L10 14 Z"/>
    <path d="M10 11.5 Q11.5 10 13 11.5 Q14.5 13 16 11.5
             Q17.5 10 19 11.5 Q20.5 13 22 11.5" stroke-width="0.8"/>
    <circle cx="13" cy="9.8" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="9.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="9.8" r="0.9" fill="currentColor" stroke="none"/>
    <path d="M7 14 L25 14 L25 20 L7 20 Z"/>
    <path d="M7 17 Q8.5 15.5 10 17 Q11.5 18.5 13 17 Q14.5 15.5 16 17
             Q17.5 18.5 19 17 Q20.5 15.5 22 17 Q23.5 18.5 25 17" stroke-width="0.8"/>
    <path d="M10 20 C10 20 9 19 9 18.3 C9 17.6 9.5 17.2 10 17.8
             C10.5 17.2 11 17.6 11 18.3 C11 19 10 20 10Z" stroke-width="0.7"/>
    <path d="M16 20 C16 20 15 19 15 18.3 C15 17.6 15.5 17.2 16 17.8
             C16.5 17.2 17 17.6 17 18.3 C17 19 16 20 16Z" stroke-width="0.7"/>
    <path d="M22 20 C22 20 21 19 21 18.3 C21 17.6 21.5 17.2 22 17.8
             C22.5 17.2 23 17.6 23 18.3 C23 19 22 20 22Z" stroke-width="0.7"/>
    <path d="M3 20 L29 20 L29 27 L3 27 Z"/>
    <path d="M3 23 Q4.5 21.5 6 23 Q7.5 24.5 9 23 Q10.5 21.5 12 23
             Q13.5 24.5 15 23 Q16.5 21.5 18 23 Q19.5 24.5 21 23
             Q22.5 21.5 24 23 Q25.5 24.5 27 23 Q28.5 21.5 29 23" stroke-width="0.8"/>
    <circle cx="6"  cy="25.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="10" cy="25.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="14" cy="25.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="18" cy="25.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="22" cy="25.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="26" cy="25.5" r="1" fill="currentColor" stroke="none"/>
    <path d="M13.5 27 L12 30 L20 30 L18.5 27"/>
    <line x1="10" y1="30" x2="22" y2="30" stroke-width="1.5"/>
  `,

  // ── 💐 Buchet de trandafiri cu fundă ─────────────────────────────────────
  bouquet: `
    <path d="M13 32 Q13 26 16 22"/>
    <path d="M16 32 L16 22"/>
    <path d="M19 32 Q19 26 16 22"/>
    <path d="M10.5 30 Q11 24 14 21"/>
    <path d="M21.5 30 Q21 24 18 21"/>
    <path d="M11 25 Q13 22 16 24 Q19 22 21 25" stroke-width="1"/>
    <path d="M11 25 Q12.5 27.5 14.5 26.5"/>
    <path d="M21 25 Q19.5 27.5 17.5 26.5"/>
    <circle cx="16" cy="24.5" r="0.8" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="12" r="3.5"/>
    <path d="M13 12 Q13.5 9 16 8 Q18.5 9 19 12 Q18.5 15 16 16
             Q13.5 15 13 12 Z" stroke-width="0.8"/>
    <path d="M14 9.5 Q16 8 18 9.5" stroke-width="0.8"/>
    <path d="M12.5 13 Q12 11 13 10" stroke-width="0.8"/>
    <path d="M19.5 13 Q20 11 19 10" stroke-width="0.8"/>
    <path d="M15 12 Q16 11 17 12 Q16.5 13.5 15.5 12.5" stroke-width="0.7"/>
    <circle cx="10" cy="18" r="3"/>
    <path d="M7.5 18 Q8 15.5 10 15 Q12 15.5 12.5 18 Q12 20.5 10 21
             Q8 20.5 7.5 18 Z" stroke-width="0.8"/>
    <path d="M8.5 16 Q10 15 11.5 16" stroke-width="0.7"/>
    <circle cx="22" cy="18" r="3"/>
    <path d="M19.5 18 Q20 15.5 22 15 Q24 15.5 24.5 18 Q24 20.5 22 21
             Q20 20.5 19.5 18 Z" stroke-width="0.8"/>
    <path d="M20.5 16 Q22 15 23.5 16" stroke-width="0.7"/>
    <path d="M13 21 Q9 20 10 16" stroke-width="0.9" fill="currentColor" fill-opacity="0.08"/>
    <path d="M19 21 Q23 20 22 16" stroke-width="0.9" fill="currentColor" fill-opacity="0.08"/>
    <line x1="14.2" y1="5" x2="17.8" y2="5" stroke-width="0.9"/>
    <line x1="16" y1="3.2" x2="16" y2="6.8" stroke-width="0.9"/>
    <circle cx="13" cy="5.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="5"   r="1" fill="currentColor" stroke="none"/>
  `,

  // ── 🥂 Două pahare de șampanie ────────────────────────────────────────────
  champagne: `
    <path d="M8 4 L6.5 16 Q6.5 20 10 20 Q13.5 20 13.5 16 L12 4 Z"/>
    <line x1="10" y1="20" x2="10" y2="27"/>
    <path d="M7.5 27 Q10 25.5 12.5 27"/>
    <path d="M8 4 L8.5 8 L11.5 8 L12 4 Z"
          fill="currentColor" fill-opacity="0.1" stroke="none"/>
    <circle cx="9"   cy="11" r="1" fill="currentColor" stroke="none"/>
    <circle cx="10.5" cy="14" r="1" fill="currentColor" stroke="none"/>
    <circle cx="9.5"  cy="17" r="1" fill="currentColor" stroke="none"/>
    <path d="M20 4 L18.5 16 Q18.5 20 22 20 Q25.5 20 25.5 16 L24 4 Z"/>
    <line x1="22" y1="20" x2="22" y2="27"/>
    <path d="M19.5 27 Q22 25.5 24.5 27"/>
    <path d="M20 4 L20.5 8 L23.5 8 L24 4 Z"
          fill="currentColor" fill-opacity="0.1" stroke="none"/>
    <circle cx="21"   cy="11" r="1" fill="currentColor" stroke="none"/>
    <circle cx="22.5" cy="14" r="1" fill="currentColor" stroke="none"/>
    <circle cx="21.5" cy="17" r="1" fill="currentColor" stroke="none"/>
    <line x1="13.8" y1="3" x2="18.2" y2="3" stroke-width="0.9"/>
    <line x1="16"   y1="1" x2="16"   y2="5" stroke-width="0.9"/>
    <circle cx="13" cy="3"   r="1" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="3"   r="1" fill="currentColor" stroke="none"/>
    <circle cx="14" cy="1.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="18" cy="1.5" r="1" fill="currentColor" stroke="none"/>
  `,

  // ── 🚗 Mașina Just Married cu cutii + panglici ────────────────────────────
  car: `
    <path d="M3 13 L3 22 Q3 23 4 23 L28 23 Q29 23 29 22 L29 13
             Q29 12 28 12 L4 12 Q3 12 3 13 Z"/>
    <path d="M7 12 Q9 6.5 16 6.5 Q23 6.5 25 12"/>
    <path d="M9 12 L10.5 8 L15 7.5 L15 12"/>
    <path d="M17 12 L17 7.5 L21.5 8 L23 12"/>
    <rect x="3"    y="14" width="2.5" height="4" rx="0.3"
          fill="currentColor" fill-opacity="0.2"/>
    <rect x="26.5" y="14" width="2.5" height="4" rx="0.3"
          fill="currentColor" fill-opacity="0.2"/>
    <circle cx="9"  cy="23" r="4"/>
    <circle cx="23" cy="23" r="4"/>
    <circle cx="9"  cy="23" r="1.8" fill="currentColor" fill-opacity="0.12"/>
    <circle cx="23" cy="23" r="1.8" fill="currentColor" fill-opacity="0.12"/>
    <rect x="12" y="16" width="8" height="4" rx="0.5"/>
    <path d="M14.5 18 C14.5 18 13.5 17.2 13.5 16.5 C13.5 15.8 14 15.5 14.5 16
             C15 15.5 15.5 15.8 15.5 16.5 C15.5 17.2 14.5 18 14.5 18Z"
          stroke-width="0.7"/>
    <line x1="11" y1="27" x2="10"   y2="31.5" stroke-width="0.8"/>
    <line x1="15" y1="27" x2="14"   y2="31.5" stroke-width="0.8"/>
    <line x1="19" y1="27" x2="18"   y2="31.5" stroke-width="0.8"/>
    <line x1="22" y1="27" x2="21.5" y2="31.5" stroke-width="0.8"/>
    <rect x="8.5"  y="31.5" width="3" height="2.5" rx="0.5"/>
    <rect x="12.5" y="31.5" width="3" height="2.5" rx="0.5"/>
    <rect x="16.5" y="31.5" width="3" height="2.5" rx="0.5"/>
    <rect x="20"   y="31.5" width="3" height="2.5" rx="0.5"/>
    <path d="M12 6.5 L10 4 M16 6.5 L16 4 M20 6.5 L22 4" stroke-width="0.85"/>
    <circle cx="10" cy="3.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="3.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="22" cy="3.5" r="1" fill="currentColor" stroke="none"/>
  `,

  // ── 🪩 Disco ball cu grilă + diamante sparkle ────────────────────────────
  disco: `
    <line x1="16" y1="5" x2="16" y2="3"/>
    <line x1="13" y1="3" x2="19" y2="3"/>
    <circle cx="16" cy="18" r="11"/>
    <path d="M5 12 Q16 10 27 12"/>
    <path d="M5 15.5 Q16 13 27 15.5"/>
    <path d="M5 18.5 Q16 16.5 27 18.5"/>
    <path d="M5 22 Q16 24 27 22"/>
    <path d="M6 25.5 Q16 27.5 26 25.5"/>
    <path d="M10 7.5 Q8 18 10 28.5"/>
    <path d="M13 6 Q11 18 13 30"/>
    <line x1="16" y1="7" x2="16" y2="29"/>
    <path d="M19 6 Q21 18 19 30"/>
    <path d="M22 7.5 Q24 18 22 28.5"/>
    <path d="M1.5 10 L3 8.5 L4.5 10 L3 11.5 Z" stroke-width="0.9"/>
    <path d="M27.5 7.5 L29 6 L30.5 7.5 L29 9 Z" stroke-width="0.9"/>
    <path d="M1.5 22 L2.5 21 L3.5 22 L2.5 23 Z" stroke-width="0.8"/>
    <path d="M29.5 23 L30.5 22 L31.5 23 L30.5 24 Z" stroke-width="0.8"/>
    <circle cx="4"  cy="16" r="1" fill="currentColor" stroke="none"/>
    <circle cx="28" cy="15" r="1" fill="currentColor" stroke="none"/>
  `,

  // ── 🎆 Artificii / explozii tip păpădie ──────────────────────────────────
  fireworks: `
    <circle cx="9" cy="18" r="1.8" fill="currentColor" fill-opacity="0.2"/>
    <line x1="9" y1="14"   x2="9" y2="9.5"   stroke-width="0.95"/>
    <circle cx="9"    cy="9.5"  r="1" fill="currentColor" stroke="none"/>
    <line x1="11.6" y1="14.7" x2="14.2" y2="11"   stroke-width="0.95"/>
    <circle cx="14.2" cy="11"   r="1" fill="currentColor" stroke="none"/>
    <line x1="13"   y1="16.5" x2="17"   y2="15.5" stroke-width="0.95"/>
    <circle cx="17"   cy="15.5" r="1" fill="currentColor" stroke="none"/>
    <line x1="12"   y1="19.2" x2="16.5" y2="20.5" stroke-width="0.95"/>
    <circle cx="16.5" cy="20.5" r="1" fill="currentColor" stroke="none"/>
    <line x1="9.5"  y1="21.7" x2="10"   y2="26.5" stroke-width="0.95"/>
    <circle cx="10"   cy="26.5" r="1" fill="currentColor" stroke="none"/>
    <line x1="6.5"  y1="21.7" x2="5"    y2="25.5" stroke-width="0.95"/>
    <circle cx="5"    cy="25.5" r="1" fill="currentColor" stroke="none"/>
    <line x1="5"    y1="19.2" x2="1.5"  y2="20.5" stroke-width="0.95"/>
    <circle cx="1.5"  cy="20.5" r="1" fill="currentColor" stroke="none"/>
    <line x1="5"    y1="16.5" x2="1"    y2="15.5" stroke-width="0.95"/>
    <circle cx="1"    cy="15.5" r="1" fill="currentColor" stroke="none"/>
    <line x1="6.4"  y1="14.7" x2="3.8"  y2="11"   stroke-width="0.95"/>
    <circle cx="3.8"  cy="11"   r="1" fill="currentColor" stroke="none"/>
    <circle cx="22" cy="10" r="1.5" fill="currentColor" fill-opacity="0.2"/>
    <line x1="22" y1="7"    x2="22"   y2="3.5"  stroke-width="0.9"/>
    <circle cx="22"   cy="3.5"  r="0.8" fill="currentColor" stroke="none"/>
    <line x1="24.1" y1="7.6"  x2="26.5" y2="5"    stroke-width="0.9"/>
    <circle cx="26.5" cy="5"    r="0.8" fill="currentColor" stroke="none"/>
    <line x1="25"   y1="9.8"  x2="28.5" y2="9.5"  stroke-width="0.9"/>
    <circle cx="28.5" cy="9.5"  r="0.8" fill="currentColor" stroke="none"/>
    <line x1="24.1" y1="12"   x2="26.5" y2="15"   stroke-width="0.9"/>
    <circle cx="26.5" cy="15"   r="0.8" fill="currentColor" stroke="none"/>
    <line x1="22"   y1="13"   x2="22"   y2="16.5" stroke-width="0.9"/>
    <circle cx="22"   cy="16.5" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="19.9" y1="12"   x2="17.5" y2="15"   stroke-width="0.9"/>
    <circle cx="17.5" cy="15"   r="0.8" fill="currentColor" stroke="none"/>
    <line x1="19"   y1="9.8"  x2="15.5" y2="9.5"  stroke-width="0.9"/>
    <circle cx="15.5" cy="9.5"  r="0.8" fill="currentColor" stroke="none"/>
    <line x1="19.9" y1="7.6"  x2="17.5" y2="5"    stroke-width="0.9"/>
    <circle cx="17.5" cy="5"    r="0.8" fill="currentColor" stroke="none"/>
    <path d="M28.5 21 L30 19.5 L31.5 21 L30 22.5 Z" stroke-width="0.9"/>
    <circle cx="4"  cy="7"  r="1" fill="currentColor" stroke="none"/>
    <circle cx="29" cy="28" r="1" fill="currentColor" stroke="none"/>
  `,

  // ── 🌙 Lună + stele (finalul evenimentului) ───────────────────────────────
  moon: `
    <path d="M21 14 A9 9 0 1 1 11 24 A7 7 0 0 0 21 14 Z"/>
    <path d="M22 5 L22.8 7.5 L25.5 7.5 L23.3 9.2 L24.1 11.7
             L22 10 L19.9 11.7 L20.7 9.2 L18.5 7.5 L21.2 7.5 Z"
          stroke-width="0.9"/>
    <path d="M27 17 L27.5 18.5 L29 18.5 L27.8 19.5 L28.3 21
             L27 20 L25.7 21 L26.2 19.5 L25 18.5 L26.5 18.5 Z"
          stroke-width="0.8"/>
    <circle cx="5"  cy="6"  r="1" fill="currentColor" stroke="none"/>
    <circle cx="8"  cy="3"  r="1" fill="currentColor" stroke="none"/>
    <circle cx="4"  cy="12" r="1" fill="currentColor" stroke="none"/>
    <circle cx="27" cy="25" r="1" fill="currentColor" stroke="none"/>
  `,

  // ── 🍷 Pahar de vin elegant ───────────────────────────────────────────────
  wine: `
    <path d="M8 3 L24 3 Q24 14 16 17 Q8 14 8 3 Z"/>
    <path d="M8 3 L24 3 Q23.5 8 16 10 Q8.5 8 8 3 Z"
          fill="currentColor" fill-opacity="0.1" stroke="none"/>
    <path d="M8.5 8.5 Q16 10.5 23.5 8.5" stroke-width="0.9"/>
    <line x1="16" y1="17" x2="16" y2="26"/>
    <path d="M10 26 Q16 24.5 22 26"/>
    <path d="M9 27.5 Q16 26 23 27.5"/>
  `,

  // ── 👗 Rochie de mireasă tip prințesă ─────────────────────────────────────
  dress: `
    <path d="M11 2 Q10 4 10 7 L13 11 L19 11 L22 7 Q22 4 21 2"/>
    <path d="M11 2 Q12.5 5.5 16 4.5 Q19.5 5.5 21 2"/>
    <path d="M10 7 Q6 7.5 5 10.5 Q6 12 8 11 Q9.5 10 10 9"/>
    <path d="M22 7 Q26 7.5 27 10.5 Q26 12 24 11 Q22.5 10 22 9"/>
    <path d="M12.5 11 Q16 13 19.5 11"/>
    <path d="M12 12 Q14 13.5 16 13 Q18 13.5 20 12" stroke-width="0.8"/>
    <path d="M13 11 Q5 18 3 30 L29 30 Q27 18 19 11"/>
    <path d="M11 19 Q16 21.5 21 19" stroke-width="0.9"/>
    <path d="M8 25 Q16 27.5 24 25" stroke-width="0.9"/>
    <circle cx="15.5" cy="7"  r="1" fill="currentColor" stroke="none"/>
    <circle cx="16"   cy="9"  r="1" fill="currentColor" stroke="none"/>
    <circle cx="16"   cy="11" r="1" fill="currentColor" stroke="none"/>
    <line x1="4"   y1="5" x2="7"   y2="5" stroke-width="0.9"/>
    <line x1="5.5" y1="3.5" x2="5.5" y2="6.5" stroke-width="0.9"/>
    <circle cx="27" cy="5.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="27" cy="8.5" r="1" fill="currentColor" stroke="none"/>
    <line x1="26.4" y1="11" x2="29.6" y2="11" stroke-width="0.9"/>
    <line x1="28"   y1="9.4" x2="28"   y2="12.6" stroke-width="0.9"/>
  `,

};

// ─── Alias-uri pentru chei vechi / alternative ───────────────────────────────
const ALIASES: Record<string, string> = {
  bride:    'diamond',
  entrance: 'arch',
  party:    'champagne',
  end:      'moon',
};

// ─── Componenta React ─────────────────────────────────────────────────────────
export interface WeddingIconProps {
  iconKey: string;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Randează un icon din SVG_ICONS.
 * Dacă cheia nu există, afișează 'champagne' ca fallback.
 */
export const WeddingIcon: React.FC<WeddingIconProps> = ({
  iconKey,
  size = 28,
  color = 'currentColor',
  className,
}) => {
  const key = ALIASES[iconKey] ?? iconKey;
  const raw = SVG_ICONS[key] ?? SVG_ICONS.champagne;

  // Suportă atât string simplu cât și obiect { vb, html }
  const viewBox = typeof raw === 'object' ? raw.vb : '0 0 32 32';
  const inner   = typeof raw === 'object' ? raw.html : raw;

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth={typeof raw === 'object' ? '2' : '1.2'}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
      className={className}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
};

export default WeddingIcon;