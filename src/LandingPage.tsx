
import React, { useEffect } from "react";
import "./landing-page.css"; // Styles are now scoped to #landing-root

// Components
import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Pricing from "./components/landing/Pricing";
import CustomizationSection from "./components/landing/CustomizationSection";
import { Logos, TasksSection, CalendarSection, InviteSection, BudgetSection, Stats, FAQ, CTA } from "./components/landing/Sections";
import DotGrid from "./components/landing/bgEffects/DotGrid";
import LinkDistributionSection from "./components/landing/LinkDistributionSection";
import LivePreviewSection from "./components/landing/LivePreviewSection";
import TutorialSection from "./components/landing/TutorialSection";
import SmartFeaturesSection from "./components/landing/SmartFeaturesSection";
import Footer from "./components/landing/Footer";
import PartnersSection from "./components/landing/bgEffects/PartnersSection";
import ProcessSection from "./components/landing/ProcessSection";
import TestimonialsSection from "./components/landing/TestimonialsSection";
import InfiniteFeatureSection from "./components/landing/InfiniteFeatureSection";
import AboutMeSection from "./components/landing/AboutMeSection";




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

export default function LandingPage() {
  useFadeUp();

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Wrapper ID matches CSS Scope */}
      <div id="landing-root">
        <div className="wp-grid-bg" />
        {/* <div className="wp-noise" /> */}
        <div style={{ width: '100%', height: '100%', position: 'fixed' }}>
          <DotGrid
            dotSize={2}
            gap={13}
            baseColor="#271E37"
            activeColor="#5227FF"
            proximity={50}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>


        <Navbar />
        <Hero />
        {/* <Logos /> */}
        <Features />
        <TasksSection />
        <CalendarSection />
        {/* <CustomizationSection /> */}
        <InviteSection />
        <BudgetSection />
        <LinkDistributionSection />
        <LivePreviewSection />
        <TutorialSection />
        <PartnersSection/>
        <Stats />
        <SmartFeaturesSection/>
        <ProcessSection/>
        <Pricing />
        <TestimonialsSection />
        <InfiniteFeatureSection />
        <FAQ />
        <CTA />
        <AboutMeSection />
        <Footer />
      </div>
    </>
  );
}
