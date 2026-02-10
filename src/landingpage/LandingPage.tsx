
import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowRight, LayoutDashboard, Users, Wallet, 
  ShieldCheck, Zap, Menu, X, Sparkles, Command, 
  BarChart3, Globe, Lock, Cpu, Fingerprint
} from "lucide-react";
import { cn } from "../lib/utils";
import Button from "../components/ui/button";

const LandingPage = ({ onNavigateApp }: { onNavigateApp: () => void }) => {
  return (
    <Button 
                    onClick={onNavigateApp}
                    className="h-14 px-10 rounded-full bg-white text-black hover:bg-zinc-200 text-lg font-medium shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95"
                  >
                      Get Started
                  </Button>
  );
};

export default LandingPage;
