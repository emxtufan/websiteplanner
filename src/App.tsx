
import React, { useState, useEffect } from "react";
import PublicInvitation from "./components/PublicInvitation";
import TemplatePreviewPage from "./components/TemplatePreviewPage";
import DashboardApp from "./components/DashboardApp";
import AdminApp from "./admin/AdminApp";
import AuthForm from "./components/AuthForm";
import LandingPage from "./LandingPage"; // Import the new LandingPage
import { ToastProvider } from "./components/ui/use-toast";
import { Toaster } from "./components/ui/toaster";
import { GOOGLE_FONTS_URL } from "./config/fonts";

const App = () => {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPath(window.location.pathname);
        };
        window.addEventListener('popstate', handlePopState);

        // Apply theme
        const savedTheme = localStorage.getItem('weddingPro_theme');
        const isDark = savedTheme ? savedTheme === 'dark' : true;
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Determine view based on path
    const renderView = () => {
        const storedSessionRaw = localStorage.getItem('weddingPro_session');
        let hasActiveSession = false;
        if (storedSessionRaw) {
            try {
                const parsed = JSON.parse(storedSessionRaw);
                hasActiveSession = !!parsed?.token && !!parsed?.userId;
            } catch {
                hasActiveSession = false;
            }
        }

        if ((currentPath === '/login' || currentPath === '/register') && hasActiveSession) {
            window.history.replaceState({}, '', '/dashboard');
            setCurrentPath('/dashboard');
            return <DashboardApp />;
        }

        if (currentPath.startsWith('/admin')) {
            return <AdminApp />;
        }
        
        if (currentPath.includes('/invite/') || currentPath.includes('/public')) {
            return <PublicInvitation />;
        }

        if (currentPath.startsWith('/templates/') && currentPath.endsWith('/preview')) {
            return <TemplatePreviewPage />;
        }

        if (currentPath === '/home' || currentPath === '/') {
            return <LandingPage />;
        }

        if (currentPath === '/dashboard') {
            return <DashboardApp />;
        }

        if (currentPath === '/login') {
            return (
                <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                    <AuthForm 
                        onLogin={(s) => {
                            localStorage.setItem('weddingPro_session', JSON.stringify(s));
                            window.location.href = '/dashboard';
                        }} 
                        initialView="login"
                    />
                </div>
            );
        }

        if (currentPath === '/register') {
            return (
                <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                    <AuthForm 
                        onLogin={(s) => {
                            localStorage.setItem('weddingPro_session', JSON.stringify(s));
                            window.location.href = '/dashboard';
                        }} 
                        initialView="register"
                    />
                </div>
            );
        }

        // Default: Dashboard (Protected inside DashboardApp logic)
        return <DashboardApp />;
    };

    return (
        <ToastProvider>
            <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
            {renderView()}
            <Toaster />
        </ToastProvider>
    );
};

export default App;
