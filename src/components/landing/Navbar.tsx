
import React, { useState, useEffect } from "react";
import { IconArrow, IconHamburger } from "./Icons";

export default function Navbar() {
  const [open, setOpen] = useState(false);
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

  const close = () => setOpen(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
            {session ? (
              <>
                <a href={session.isAdmin ? "/admin" : "/dashboard"} className="wp-btn-primary">
                  {session.isAdmin ? "Panou Admin" : "Panou Control"} <IconArrow />
                </a>
              </>
            ) : (
              <>
                <a href="/login" className="wp-btn-ghost">Autentificare</a>
                <a href="/register" className="wp-btn-primary">Începe Gratuit <IconArrow /></a>
              </>
            )}
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
          {session ? (
            <a href={session.isAdmin ? "/admin" : "/dashboard"} onClick={close}>
              {session.isAdmin ? "Panou Admin" : "Panou Control"} →
            </a>
          ) : (
            <>
              <a href="/login"    onClick={close}>Autentificare</a>
              <a href="/register" onClick={close}>Creează Cont Gratuit →</a>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
