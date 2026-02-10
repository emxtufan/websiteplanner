
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ShieldCheck, Menu, LogOut, Settings, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { UserSession } from '../types';
import Button from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import AdminSettings from './AdminSettings';
import AuthForm from '../components/AuthForm';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

const AdminApp = () => {
    const [session, setSession] = useState<UserSession | null>(null);
    const [view, setView] = useState<'dashboard' | 'users' | 'settings'>('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { toast } = useToast();

    // Admin Auth Logic
    useEffect(() => {
        const savedSession = localStorage.getItem('weddingPro_session');
        if (savedSession) {
            try {
                const parsed = JSON.parse(savedSession);
                if (parsed.isAdmin) {
                    setSession(parsed);
                }
            } catch (e) {
                console.error(e);
            }
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (userSession: UserSession) => {
        if (userSession.isAdmin) {
            setSession(userSession);
            localStorage.setItem('weddingPro_session', JSON.stringify(userSession));
            toast({ title: "Admin Login Successful", variant: "success" });
        } else {
            toast({ title: "Acces Interzis", description: "Acest cont nu are drepturi de administrator.", variant: "destructive" });
        }
    };

    const handleLogout = () => {
        setSession(null);
        localStorage.removeItem('weddingPro_session');
        window.location.href = '/'; 
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground"><ShieldCheck className="w-10 h-10 animate-pulse" /></div>;

    // --- LOGIN SCREEN (Modernizat) ---
    if (!session) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
                <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -top-20 -left-20 animate-pulse pointer-events-none" />
                
                <div className="w-full max-w-md relative z-10 p-6">
                    <div className="text-center mb-8 space-y-2">
                        <div className="inline-flex items-center justify-center p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl mb-4">
                            <ShieldCheck className="w-12 h-12 text-indigo-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Portal</h1>
                        <p className="text-zinc-400">Autentificare securizată pentru administrare.</p>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1 shadow-2xl">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
                            <AuthForm onLogin={handleLogin} className="h-auto bg-transparent p-0 shadow-none border-0" />
                        </div>
                    </div>
                    
                    <div className="text-center mt-8">
                        <a href="/" className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2">
                            <ChevronLeft className="w-3 h-3" /> Întoarce-te la site-ul principal
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Utilizatori', icon: Users },
        { id: 'settings', label: 'Setări Sistem', icon: Settings },
    ];

    return (
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 font-sans text-foreground overflow-hidden">
            
            {/* SIDEBAR */}
            <aside 
                className={cn(
                    "bg-white dark:bg-zinc-900 border-r border-border z-20 transition-all duration-300 flex flex-col relative",
                    isSidebarCollapsed ? "w-[70px]" : "w-64"
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-4 border-b border-border">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className={cn(
                            "font-bold text-lg tracking-tight whitespace-nowrap transition-all duration-300",
                            isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                        )}>
                            WeddingPro
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2 mt-2 truncate">
                        {!isSidebarCollapsed && "Meniu Principal"}
                    </div>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as any)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group w-full",
                                view === item.id 
                                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                isSidebarCollapsed && "justify-center px-0"
                            )}
                            title={item.label}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0", view === item.id && "fill-current opacity-20")} />
                            <span className={cn(
                                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                                isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                            )}>
                                {item.label}
                            </span>
                            
                            {/* Active Indicator Bar */}
                            {view === item.id && !isSidebarCollapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-3 border-t border-border">
                    <button 
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full",
                            isSidebarCollapsed && "justify-center px-0"
                        )}
                        title="Deconectare"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className={cn(
                            "whitespace-nowrap transition-all duration-300 overflow-hidden",
                            isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        )}>
                            Ieșire
                        </span>
                    </button>
                </div>

                {/* Collapse Trigger (Absolute Center Right) */}
                <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-20 bg-background border border-border rounded-full p-1 shadow-md hover:bg-accent transition-colors z-30"
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 h-full relative">
                
                {/* Header */}
                <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
                    <div>
                        <h1 className="text-lg font-bold capitalize tracking-tight text-foreground">
                            {view === 'dashboard' ? 'Panou Control' : view === 'users' ? 'Utilizatori' : 'Setări Sistem'}
                        </h1>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                            Bun venit în zona de administrare.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                        </Button>
                        <div className="h-8 w-px bg-border mx-1" />
                        <div className="flex items-center gap-3 pl-1">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium leading-none">{session.user}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Super Admin</p>
                            </div>
                            <Avatar className="h-9 w-9 border border-border">
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                                    AD
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Scrollable View Content */}
                <div className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-black p-6 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto h-full">
                        {view === 'dashboard' && <AdminDashboard token={session.token || ''} />}
                        {view === 'users' && <UserManagement token={session.token || ''} />}
                        {view === 'settings' && <AdminSettings token={session.token || ''} />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminApp;
