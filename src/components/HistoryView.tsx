
import React from "react";
import { UserSession } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Button from "./ui/button";
import { Calendar, Users, Wallet, Clock, CheckCircle2, AlertCircle, PlayCircle, Archive, LayoutDashboard, Eye } from "lucide-react";
import { cn } from "../lib/utils";

interface HistoryViewProps {
    session: UserSession;
    onViewEvent?: () => void;
    onLoadSnapshot?: (snapshotId: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ session, onViewEvent, onLoadSnapshot }) => {
    const { profile, isEventCompleted, archivedEvents } = session;
    const isSetup = profile?.isSetupComplete;

    // Status Determination
    let status = 'none';
    if (isSetup) {
        status = isEventCompleted ? 'pending' : 'live';
    }

    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Istoric Evenimente</h2>
                    <p className="text-muted-foreground">Gestionează evenimentul curent și vezi arhiva evenimentelor trecute.</p>
                </div>

                {/* ACTIVE / PENDING EVENT CARD */}
                {isSetup && (
                    <Card className={cn(
                        "border-l-4 shadow-md bg-white dark:bg-zinc-900", 
                        status === 'live' ? "border-l-green-500" : "border-l-amber-500"
                    )}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    {status === 'live' ? (
                                        <>
                                            <span className="relative flex h-3 w-3">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                            <span className="text-green-600 dark:text-green-400">Eveniment LIVE</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-5 h-5 text-amber-500" />
                                            <span className="text-amber-600 dark:text-amber-400">Expirat / Offline</span>
                                        </>
                                    )}
                                </CardTitle>
                                {status === 'live' && (
                                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider border border-green-200 dark:border-green-800">
                                        Activ
                                    </span>
                                )}
                                {status === 'pending' && (
                                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                                        Finalizat
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-6 mt-2">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Nume Eveniment</p>
                                    <p className="text-xl font-bold capitalize text-foreground">{profile.eventName || `Eveniment ${profile.eventType}`}</p>
                                    <p className="text-sm text-zinc-500">{profile.partner1Name} & {profile.partner2Name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Data</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-zinc-400" />
                                        <span className="text-lg font-medium text-foreground">
                                            {new Date(profile.weddingDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between items-start md:items-end">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1 text-left md:text-right">Acțiuni</p>
                                        <Button 
                                            size="sm" 
                                            onClick={onViewEvent}
                                            className={cn(
                                                "gap-2 shadow-sm transition-all",
                                                status === 'live' 
                                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                                                    : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                                            )}
                                        >
                                            {status === 'live' ? (
                                                <><LayoutDashboard className="w-4 h-4" /> Administrează</>
                                            ) : (
                                                <><Eye className="w-4 h-4" /> Vizualizare (Read-Only)</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-dashed">
                                <p className="text-xs text-muted-foreground">
                                    {status === 'live' 
                                        ? "Poți edita și gestiona toate detaliile în timp real." 
                                        : "Evenimentul a trecut în offline. Poți vedea datele, dar nu le mai poți modifica. Arhivează-l pentru a începe unul nou."
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ARCHIVED LIST */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Archive className="w-5 h-5 text-zinc-500" /> Arhivă
                    </h3>
                    
                    {archivedEvents && archivedEvents.length > 0 ? (
                        <div className="grid gap-4">
                            {archivedEvents.map((ev, idx) => (
                                <Card key={idx} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all">
                                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                                                <CheckCircle2 className="w-6 h-6 text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-foreground">{ev.eventName || 'Eveniment Arhivat'}</p>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">{ev.eventType}</p>
                                                <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(ev.eventDate).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Arhivat: {new Date(ev.archivedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4 items-center flex-wrap md:flex-nowrap w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-800 justify-end">
                                            <div className="text-right hidden sm:block mr-4">
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Statistici</p>
                                                <p className="font-mono font-medium flex items-center gap-2 justify-end text-foreground text-xs">
                                                    <span title="Invitați"><Users className="w-3 h-3 text-zinc-400 inline" /> {ev.guestCount}</span>
                                                    <span title="Cheltuieli"><Wallet className="w-3 h-3 text-zinc-400 inline" /> {ev.totalSpent}</span>
                                                </p>
                                            </div>
                                            {ev.snapshotId && onLoadSnapshot ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => onLoadSnapshot(ev.snapshotId!)}
                                                    className="gap-2"
                                                >
                                                    <Eye className="w-4 h-4" /> Vizualizează
                                                </Button>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    disabled 
                                                    className="gap-2 opacity-50 cursor-not-allowed border-dashed"
                                                >
                                                    <Eye className="w-4 h-4" /> Indisponibil
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Archive className="w-8 h-8 text-zinc-300" />
                            </div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Niciun eveniment arhivat</h3>
                            <p className="text-sm text-zinc-500 mt-1">Evenimentele finalizate vor apărea aici după arhivare.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryView;
