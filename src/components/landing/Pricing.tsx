
import React, { useState, useEffect } from "react";
import { IconCheck, IconStar } from "./Icons";
import SpotlightCard from "./SpotlightCard";

const FREE_FEATURES  = ["1 Invitat Demo","5 Elemente Canvas","Acces Tema \"Classic\"","Checklist de bază"];
const PRO_FEATURES   = ["Invitați Nelimitați","Planificator Mese Nelimitat","Toate Temele (Modern, Floral)","Calculator Buget Automat","Asistent AI & Export PDF"];

export default function Pricing() {
  const [session, setSession] = useState<any>(null);

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
    <section id="pricing" className="wp-pricing-section">
      <div className="wp-container">
        <div className="wp-section-header wp-fade-up">
          <span className="wp-section-tag">Prețuri</span>
          <h2 className="wp-section-title">Investiție unică.<br />Acces pe viață.</h2>
          <p className="wp-section-desc">Fără abonamente lunare ascunse. Plătești o singură dată și ai acces nelimitat.</p>
        </div>
        <div className="wp-pricing-grid">

          {/* FREE */}
          <SpotlightCard className="wp-price-card wp-fade-up wp-d1" spotlightColor="rgba(255, 255, 255, 0.1)">
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
            <a href={session ? (session.isAdmin ? "/admin" : "/dashboard") : "/register"} className="wp-btn-plan secondary">
              {session ? "Mergi la Dashboard" : "Începe Gratuit"}
            </a>
          </SpotlightCard>

          {/* PREMIUM */}
          <SpotlightCard className="wp-price-card featured wp-fade-up wp-d2" spotlightColor="rgba(232, 121, 249, 0.2)">
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
            <a href={session ? (session.isAdmin ? "/admin" : "/dashboard") : "/register"} className="wp-btn-plan main">
              {session ? "Mergi la Dashboard" : "Activează Premium"}
            </a>
          </SpotlightCard>

        </div>
      </div>
    </section>
  );
}
