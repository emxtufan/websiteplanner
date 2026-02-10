
import React, { useState } from "react";
import PublicInvitation from "./components/PublicInvitation";
import DashboardApp from "./components/DashboardApp";
import AdminApp from "./admin/AdminApp";
import LandingPage from "./landingpage/LandingPage"; // Import Landing Page
import { ToastProvider } from "./components/ui/use-toast";
import { Toaster } from "./components/ui/toaster";

const App = () => {
    const [viewMode, setViewMode] = useState<string>(() => {
        const path = window.location.pathname;
        
        // Admin Route
        if (path.startsWith('/admin')) return 'admin';
        
        // Public Invite Routes
        if (path.includes('/invite/') || path.includes('/public')) return 'invite';
        
        // If user is logged in (session exists), go to dashboard
        const savedSession = localStorage.getItem('weddingPro_session');
        if (savedSession) return 'dashboard';

        // Default to Landing Page for guests/logged out users
        return 'landing';
    });

    const handleNavigateToApp = () => {
        setViewMode('dashboard');
    };

    return (
        <ToastProvider>
            {viewMode === 'admin' ? (
                <AdminApp />
            ) : viewMode === 'invite' ? (
                <PublicInvitation />
            ) : viewMode === 'landing' ? (
                <LandingPage onNavigateApp={handleNavigateToApp} />
            ) : (
                <DashboardApp />
            )}
            <Toaster />
        </ToastProvider>
    );
};

export default App;
