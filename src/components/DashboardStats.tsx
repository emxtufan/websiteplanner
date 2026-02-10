
import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CanvasElement, ElementType, BudgetCategory, Task, GuestListEntry } from "../types";
import { 
    CheckCircle2, User, Baby, Leaf, Wallet, ArrowRight, Target, CheckSquare, Zap, Activity, 
    Star, Link as LinkIcon, Eye, Share2, XCircle, Clock, Send, TrendingUp, 
    Armchair, UtensilsCrossed, Percent, LayoutGrid, Users, BarChart3, Sparkles 
} from "lucide-react";
import FlipClock from "./FlipClock";
import Button from "./ui/button";
import { cn } from "../lib/utils";

// Register ChartJS
ChartJS.register(
    ArcElement, 
    ChartTooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement, 
    LineElement, 
    Filler, 
    Title
);

interface DashboardStatsProps {
    elements: CanvasElement[];
    tasks?: Task[];
    guests?: GuestListEntry[];
    weddingDate?: string;
    budgetCategories?: BudgetCategory[];
    totalBudget?: number;
    onViewBudget?: () => void;
}

const DashboardStats = ({ elements, tasks = [], guests = [], weddingDate, budgetCategories, totalBudget, onViewBudget }: DashboardStatsProps) => {
    // --- TASK CALCULATIONS ---
    const today = new Date().toISOString().split('T')[0];
    const tasksToday = tasks.filter(t => t.dueDate === today && t.status !== 'Done').length;
    const tasksCompleted = tasks.filter(t => t.status === 'Done').length;
    const tasksTotal = tasks.length;
    const progressPercent = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
    
    // High Priority Pending
    const highPriorityTasks = tasks
        .filter(t => t.priority === 'High' && t.status !== 'Done')
        .slice(0, 3);

    // --- INVITE ENGAGEMENT CALCULATIONS ---
    const totalInvites = guests.length;
    const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
    const declinedCount = guests.filter(g => g.status === 'declined').length;
    const allViewedCount = guests.filter(g => ['opened', 'confirmed', 'declined'].includes(g.status)).length;
    const viewedNoReactionCount = Math.max(0, allViewedCount - (confirmedCount + declinedCount));
    const confirmationRate = totalInvites > 0 ? Math.round((confirmedCount / totalInvites) * 100) : 0;

    // --- CHART DATA FOR ACTIVITY RING ---
    const loadValue = Math.min(tasksToday * 20, 100); 
    const activityData = {
        labels: ['Tasks Today', 'Remaining'],
        datasets: [{
            data: [loadValue, 100 - loadValue],
            backgroundColor: ['#f43f5e', '#27272a'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
            cutout: '85%',
            borderRadius: 20,
        }]
    };

    // --- GUEST CALCULATIONS ---
    const totalGuests = elements.reduce((acc, el) => {
        if (el.isStaff || el.type === ElementType.DECOR) return acc;
        return acc + (el.guests?.filter(g => g !== null).length || 0);
    }, 0);

    const kidsCount = elements.reduce((acc, el) => {
        if (el.isStaff || el.type === ElementType.DECOR) return acc;
        return acc + (el.guests?.filter(g => g !== null && g.isChild).length || 0);
    }, 0);

    const maxCapacity = elements.reduce((acc, el) => {
        if (el.isStaff || el.type === ElementType.DECOR) return acc;
        return acc + (el.capacity || 0);
    }, 0);

    const tablesCount = elements.filter(el => el.type === ElementType.TABLE).length;
    const staffCount = elements.filter(el => el.isStaff).length;
    const occupancyRate = maxCapacity > 0 ? Math.round((totalGuests/maxCapacity)*100) : 0;

    // --- BUDGET CALCULATIONS ---
    const spent = budgetCategories ? budgetCategories.reduce((acc, cat) => acc + cat.items.reduce((s, i) => s + (i.finalCost || i.estimatedCost || 0), 0), 0) : 0;
    const budget = totalBudget || 1;
    const budgetPercent = Math.min(100, Math.round((spent / budget) * 100));

    // --- CHART DATA: SPENDING (BANKING STYLE) ---
    const spendTrendData = {
        labels: budgetCategories?.map(c => c.name) || [],
        datasets: [{
            label: 'Cheltuieli',
            data: budgetCategories?.map(c => c.items.reduce((s, i) => s + (i.finalCost || i.estimatedCost), 0)) || [],
            borderColor: '#6366f1', // Indigo 500
            backgroundColor: (context: any) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)'); // Indigo
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
                return gradient;
            },
            fill: true,
            tension: 0.4, // Smooth curves
            pointRadius: 0, // Hide points for clean look
            borderWidth: 2,
        }]
    };

    const spendChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
            x: { display: false },
            y: { display: false, min: 0 }
        },
        layout: { padding: 0 }
    };

    // --- CHART DATA: STACKED BAR (TABLES) ---
    // 1. Filter only tables/presidium
    const tableElements = elements
        .filter(el => (el.type === ElementType.TABLE || el.type === ElementType.PRESIDIUM) && !el.isStaff)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    const stackedBarData = {
        labels: tableElements.map(el => el.name.replace('Masa ', '#').replace('Prezidiu', 'Prez.')),
        datasets: [
            {
                label: 'Ocupat',
                data: tableElements.map(el => el.guests?.filter(g => g).length || 0),
                backgroundColor: (context: any) => {
                    const index = context.dataIndex;
                    const el = tableElements[index];
                    if (!el) return '#e4e4e7';
                    const count = el.guests?.filter(g => g).length || 0;
                    const capacity = el.capacity || 10;
                    
                    if (count > capacity) return '#f43f5e'; // Red (Overbooked)
                    if (count === capacity) return '#10b981'; // Green (Full)
                    return '#6366f1'; // Indigo (Normal)
                },
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.8
            },
            {
                label: 'Liber',
                data: tableElements.map(el => Math.max(0, (el.capacity || 0) - (el.guests?.filter(g => g).length || 0))),
                backgroundColor: 'rgba(0,0,0,0.05)', // Very subtle gray
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.8,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.05)'
            }
        ]
    };

    const stackedBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                padding: 10,
                cornerRadius: 6,
                callbacks: {
                    title: (items: any) => tableElements[items[0].dataIndex].name,
                    label: (context: any) => {
                        const el = tableElements[context.dataIndex];
                        const count = el.guests?.filter(g => g).length || 0;
                        const cap = el.capacity || 0;
                        return context.datasetIndex === 0 
                            ? `Ocupat: ${count} / ${cap}`
                            : `Liber: ${Math.max(0, cap - count)}`;
                    }
                }
            }
        },
        scales: {
            x: { 
                stacked: true,
                grid: { display: false },
                ticks: { 
                    font: { size: 10 },
                    maxRotation: 90,
                    minRotation: 0,
                    autoSkip: true, // Crucial for many tables
                    maxTicksLimit: 20
                }
            },
            y: {
                stacked: true,
                display: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                beginAtZero: true,
                ticks: { stepSize: 2 }
            }
        },
        layout: { padding: 10 }
    };

    // --- GUEST LIST TABLE DATA ---
    const allGuestsList = elements
        .filter(el => (el.type === ElementType.TABLE || el.type === ElementType.PRESIDIUM) && !el.isStaff)
        .flatMap(el => {
            if (!el.guests) return [];
            return el.guests.map((guest, index) => {
                if (!guest) return null;
                return {
                    id: `${el.id}-${index}`,
                    name: guest.name,
                    menu: guest.menuType,
                    isChild: guest.isChild,
                    tableName: el.name,
                    seatIndex: index + 1
                };
            }).filter(Boolean);
        }) as { id: string, name: string, menu: string, isChild: boolean, tableName: string, seatIndex: number }[];

    // --- CONFIG FOR STATS CARDS ---
    const statsConfig = [
        { 
            label: "Invitați Total", 
            val: totalGuests, 
            sub: `din ${maxCapacity} locuri`, 
            icon: Users,
            color: "blue",
            textColor: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/10",
            borderColor: "border-blue-100 dark:border-blue-800"
        },
        { 
            label: "Copii", 
            val: kidsCount, 
            sub: "Meniuri speciale", 
            icon: Baby,
            color: "pink",
            textColor: "text-pink-600 dark:text-pink-400",
            bgColor: "bg-pink-50 dark:bg-pink-900/10",
            borderColor: "border-pink-100 dark:border-pink-800"
        },
        { 
            label: "Mese Configurate", 
            val: tablesCount, 
            sub: "Pregătite", 
            icon: LayoutGrid,
            color: "violet",
            textColor: "text-violet-600 dark:text-violet-400",
            bgColor: "bg-violet-50 dark:bg-violet-900/10",
            borderColor: "border-violet-100 dark:border-violet-800"
        },
        { 
            label: "Mese Staff", 
            val: staffCount, 
            sub: "Auxiliare", 
            icon: UtensilsCrossed,
            color: "amber",
            textColor: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-900/10",
            borderColor: "border-amber-100 dark:border-amber-800"
        },
        { 
            label: "Grad Ocupare", 
            val: `${occupancyRate}%`, 
            sub: "Eficiență", 
            icon: Percent,
            color: "emerald",
            textColor: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
            borderColor: "border-emerald-100 dark:border-emerald-800"
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
             
             {/* COUNTDOWN TIMER */}
             {weddingDate && <FlipClock targetDate={weddingDate} />}

             {/* PRODUCTIVITY HUB (APPLE STYLE WIDGETS) */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* 1. TODAY'S INTENSITY (Radial Chart) */}
                 <Card className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative group">
                     {/* Background Gradient Effect */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/20 dark:group-hover:bg-rose-500/30 transition-all duration-700"></div>
                     
                     <CardHeader className="pb-2 relative z-10">
                         <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                             <Activity className="w-4 h-4 text-rose-500" /> Intensitatea Zilei
                         </CardTitle>
                     </CardHeader>
                     <CardContent className="relative z-10 flex items-center justify-between">
                         <div className="flex flex-col">
                             <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{tasksToday}</span>
                             <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">Sarcini Azi</span>
                             <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-3 max-w-[120px]">
                                 {tasksToday === 0 ? "O zi liniștită. Relaxează-te!" : tasksToday < 3 ? "Volum redus. Ușor de gestionat." : "Zi aglomerată! Prioritizează."}
                             </p>
                         </div>
                         <div className="h-[100px] w-[100px] relative">
                             <Doughnut data={activityData} options={{ maintainAspectRatio: false, cutout: '85%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
                             <div className="absolute inset-0 flex items-center justify-center pt-2">
                                 <Zap className="w-5 h-5 text-rose-500 fill-current" />
                             </div>
                         </div>
                     </CardContent>
                 </Card>

                 {/* 2. OVERALL PROGRESS (Linear Bars) */}
                 <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                     <CardHeader className="pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                             <Target className="w-4 h-4 text-indigo-500" /> Progres General
                         </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-5 pt-2">
                         <div className="flex items-end justify-between">
                             <div>
                                 <span className="text-3xl font-bold text-foreground">{tasksCompleted}</span>
                                 <span className="text-sm text-muted-foreground ml-1">/ {tasksTotal}</span>
                             </div>
                             <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
                         </div>
                         
                         {/* Modern Progress Bar */}
                         <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                             <div 
                                 className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                                 style={{ width: `${progressPercent}%` }}
                             ></div>
                         </div>

                         <div className="flex items-center gap-2 text-xs text-muted-foreground bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                             <CheckSquare className="w-3 h-3 text-green-500" />
                             <span>Ai finalizat {tasksCompleted} sarcini. Mai ai {tasksTotal - tasksCompleted} de făcut.</span>
                         </div>
                     </CardContent>
                 </Card>

                 {/* 3. PRIORITY TASKS LIST */}
                 <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/30 dark:bg-amber-900/10">
                     <CardHeader className="pb-2">
                         <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-500 flex items-center gap-2">
                             <Star className="w-4 h-4 fill-current" /> Top Priorități
                         </CardTitle>
                     </CardHeader>
                     <CardContent className="pt-2">
                         {highPriorityTasks.length > 0 ? (
                             <div className="space-y-2">
                                 {highPriorityTasks.map(t => (
                                     <div key={t.id} className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-md border border-amber-100 dark:border-amber-900/30 shadow-sm">
                                         <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse"></div>
                                         <span className="text-xs font-medium truncate flex-1">{t.title}</span>
                                         {t.dueDate && <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(t.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>}
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             <div className="h-full flex flex-col items-center justify-center text-center py-4 text-muted-foreground">
                                 <CheckCircle2 className="w-8 h-8 text-green-500 mb-2 opacity-50" />
                                 <p className="text-xs">Nicio sarcină critică restantă.<br/>Great job!</p>
                             </div>
                         )}
                     </CardContent>
                 </Card>
             </div>
                         
             {/* MAIN GRID - CHARTS */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* MY SPEND WIDGET - UPDATED WITH BANKING CHART */}
                 <Card className="col-span-1 border-indigo-200 dark:border-indigo-900 bg-white dark:bg-zinc-950 relative overflow-hidden group">
                    {/* Background Sparkline Chart */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 opacity-30 pointer-events-none z-0">
                        <Line data={spendTrendData} options={spendChartOptions} />
                    </div>

                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-indigo-600" /> My Spend
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30" onClick={onViewBudget}>
                            Vezi Detalii <ArrowRight className="w-3 h-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-foreground">{spent.toLocaleString()}</span>
                                    <span className="text-sm font-medium text-muted-foreground">LEI</span>
                                </div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <TrendingUp className="w-3 h-3 text-indigo-500" /> Total Cheltuit
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>Progres Buget</span>
                                    <span>{budgetPercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 shadow-sm ${budgetPercent > 100 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                        style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-muted-foreground text-right pt-1">
                                    din {budget.toLocaleString()} LEI
                                </p>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
                 {/* 1. DIGITAL ENGAGEMENT (DETAILED METRICS) */}
                 <Card className="col-span-1 border-indigo-100 dark:border-indigo-900 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-zinc-950">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                            <Share2 className="w-5 h-5 text-indigo-500" /> Digital Engagement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        
                        {/* Upper Stats Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-indigo-50 dark:border-indigo-900/50">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold leading-none">{totalInvites}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">Generate</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-indigo-50 dark:border-indigo-900/50">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                    <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold leading-none">{totalInvites}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">Trimise</span>
                                </div>
                            </div>
                        </div>

                        {/* Engagement Grid */}
                        <div className="grid grid-cols-2 gap-3">
                             {/* VAZUTE */}
                             <div className="flex flex-col p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <Eye className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Total Văzute</span>
                                </div>
                                <span className="text-xl font-bold">{allViewedCount}</span>
                             </div>

                             {/* NO REACTION */}
                             <div className="flex flex-col p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                                    <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Fără Reacție</span>
                                </div>
                                <span className="text-xl font-bold text-orange-800 dark:text-orange-200">{viewedNoReactionCount}</span>
                             </div>

                             {/* CONFIRMATE */}
                             <div className="flex flex-col p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Confirmate</span>
                                </div>
                                <span className="text-xl font-bold text-green-800 dark:text-green-200">{confirmedCount}</span>
                             </div>

                             {/* REFUZURI */}
                             <div className="flex flex-col p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-xs font-medium text-red-700 dark:text-red-400">Refuzate</span>
                                </div>
                                <span className="text-xl font-bold text-red-800 dark:text-red-200">{declinedCount}</span>
                             </div>
                        </div>

                        {/* Conversion Rate */}
                        <div className="pt-2 border-t border-indigo-50 dark:border-indigo-900/30">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-medium text-muted-foreground">Rata de Confirmare</span>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{confirmationRate}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${confirmationRate}%` }}></div>
                            </div>
                        </div>
                    </CardContent>
                 </Card>

                 

                 {/* DISTRIBUTIE MESE - STACKED BAR CHART (REVERTED AS REQUESTED) */}
                 <Card className="col-span-1 border-indigo-100 dark:border-indigo-900 overflow-hidden bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
                     {/* Minimalist Header */}
                     <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                         <h3 className="font-semibold text-sm flex items-center gap-2">
                             Distribuție Mese
                         </h3>
                         <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-white dark:bg-zinc-800 px-2 py-1 rounded shadow-sm border border-zinc-100 dark:border-zinc-700">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Live View
                         </span>
                     </div>
                     
                     {/* CHART CONTAINER - FIXED HEIGHT */}
                     <div className="p-2 relative w-full h-[320px] flex items-center justify-center">
                        {tableElements.length > 0 ? (
                            <Bar data={stackedBarData} options={stackedBarOptions} />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-xs p-4 text-center">
                                <Armchair className="w-8 h-8 opacity-20 mb-2" />
                                <p>Încă nu ai adăugat mese.</p>
                                <p className="opacity-50">Mergi la Planificator.</p>
                            </div>
                        )}
                     </div>
                 </Card>
             </div>

             {/* BOTTOM SECTION: GUEST LIST + STATS SIDEBAR */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 
                 {/* LEFT (Desktop) / SECOND (Mobile): GUEST LIST TABLE (Takes 2 cols) */}
                 <Card className="order-2 lg:order-1 lg:col-span-2 h-full flex flex-col min-h-[500px]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Lista Invitați Confirmați & Așezați
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {allGuestsList.length > 0 ? (
                            <div className="relative w-full overflow-auto max-h-[500px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b sticky top-0 bg-background z-10">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-12 text-center">#</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">Status</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Nume Invitat</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Masă</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground text-right">Loc</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {allGuestsList.map((guest, idx) => (
                                            <tr key={guest.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <td className="p-4 align-middle text-center font-mono text-xs text-muted-foreground">
                                                    {idx + 1}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/15 text-green-700 dark:text-green-400">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        OK
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle font-medium flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center relative">
                                                        {guest.isChild ? <Baby className="w-4 h-4 text-pink-500" /> : <User className="w-4 h-4 text-muted-foreground" />}
                                                        {(guest.menu === 'vegetarian' || guest.menu === 'vegan') && (
                                                            <div className="absolute -top-1 -right-1 bg-green-100 dark:bg-green-900 rounded-full p-0.5">
                                                                <Leaf className="w-2 h-2 text-green-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{guest.name}</span>
                                                        {guest.menu !== 'standard' && <span className="text-[10px] text-muted-foreground capitalize">{guest.menu}</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">{guest.tableName}</td>
                                                <td className="p-4 align-middle text-right font-mono">#{guest.seatIndex}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground h-full min-h-[200px]">
                                <p>Nu există invitați așezați la mese momentan.</p>
                                <p className="text-sm">Mergi la secțiunea "Planificator" pentru a adăuga invitați.</p>
                            </div>
                        )}
                    </CardContent>
                 </Card>

                 {/* RIGHT (Desktop) / FIRST (Mobile): VERTICAL STATS SIDEBAR (Takes 1 col) */}
                 <div className="order-1 lg:order-2 lg:col-span-1 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-4 h-full content-start">
                     {statsConfig.map((s, i) => (
                        <Card 
                            key={i} 
                            className={cn(
                                "relative overflow-hidden group hover:shadow-md transition-all duration-300 border-l-4 h-full lg:h-auto last:col-span-2 sm:last:col-span-1 lg:last:col-span-1",
                                s.borderColor.replace('border-', 'border-l-') // Convert full border to left border
                            )}
                        >
                            <div className={cn("absolute inset-0 opacity-[0.03] dark:opacity-[0.05]", s.bgColor.split(' ')[0].replace('bg-', 'bg-text-'))} />
                            
                            <CardContent className="p-6 flex items-center justify-between relative z-10 h-full">
                                <div className="flex flex-col justify-center">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                                    <div className="text-3xl font-bold tracking-tight text-foreground mt-2">{s.val}</div>
                                    <p className="text-[10px] text-muted-foreground font-medium mt-1">{s.sub}</p>
                                </div>
                                <div className={cn("p-3 rounded-xl bg-opacity-10", s.bgColor)}>
                                    <s.icon className={cn("h-6 w-6", s.textColor)} />
                                </div>
                            </CardContent>
                        </Card>
                     ))}
                 </div>
             </div>
        </div>
    )
}

export default DashboardStats;
