
import React, { useState, useEffect } from "react";
import {
  Plus, Search, Copy, Check, ExternalLink, Trash2, Mail, Users, Baby, Heart,
  AlertTriangle, MessageSquare, Info, Lock, Crown, UserPlus, Globe, Link as LinkIcon, Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import Button from "./ui/button";
import Input from "./ui/input";
import { API_URL, PLAN_LIMITS as DEFAULT_LIMITS } from "../constants";
import { GuestListEntry, UserSession } from "../types";
import { cn } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useToast } from "./ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

interface GuestListViewProps {
  session: UserSession;
  isPremium?: boolean;
  onShowUpgrade?: () => void;
  onNavigateToSettings?: () => void;
  onCheckActive?: () => boolean; // Global restriction check
  isEventActive?: boolean; // NEW: Visual state for read-only mode
  snapshotGuests?: GuestListEntry[]; // NEW: Data from archive
}

const GuestListView: React.FC<GuestListViewProps> = ({
  session,
  isPremium = false,
  onShowUpgrade,
  onNavigateToSettings,
  onCheckActive,
  isEventActive = true,
  snapshotGuests
}) => {
  const { toast } = useToast();
  const [guests, setGuests] = useState<GuestListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestType, setNewGuestType] = useState("adult");
  const [isAdding, setIsAdding] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);
  
  // Dynamic Limits
  const limits = session.limits || DEFAULT_LIMITS.free;
  const maxGuests = limits.maxGuests;

  // Link Configuration Logic
  const hasInviteSlug = !!session.profile?.inviteSlug;
  const slug = hasInviteSlug ? session.profile.inviteSlug : "";
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    // If in Archive Mode, use passed data
    if (!isEventActive && snapshotGuests) {
        setGuests(snapshotGuests);
        return;
    }

    if (session.token) {
      fetchGuests();
    }
  }, [session.userId, session.token, isEventActive, snapshotGuests]);

  const fetchGuests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/guests/${session.userId}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGuests(data);
      }
    } catch (error) {
      console.error("Failed to fetch guests", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onCheckActive && !onCheckActive()) return;
    if (!newGuestName.trim()) return;

    if (guests.length >= maxGuests) {
      if (onShowUpgrade) onShowUpgrade();
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch(`${API_URL}/guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          userId: session.userId, 
          name: newGuestName,
          type: newGuestType,
        }),
      });

      if (res.ok) {
        const newGuest = await res.json();
        setGuests((prev) => [...prev, newGuest]);
        setNewGuestName("");
        toast({ title: "Invitat adăugat", variant: "success" });
      } else {
          const err = await res.json();
          if (err.error === 'Limit reached.') {
              if(onShowUpgrade) onShowUpgrade();
          }
      }
    } catch (error) {
      console.error("Failed to add guest", error);
      toast({
        title: "Eroare",
        description: "Nu am putut adăuga invitatul.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (onCheckActive && !onCheckActive()) return;
    try {
      await fetch(`${API_URL}/guests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.token}` },
      });
      setGuests((prev) => prev.filter((g) => g._id !== id));
      toast({ title: "Invitat șters", variant: "default" });
    } catch (error) {
      console.error("Failed to delete", error);
      toast({
        title: "Eroare",
        description: "Nu am putut șterge invitatul.",
        variant: "destructive",
      });
    }
  };

  const toggleSentStatus = async (id: string, currentStatus: boolean) => {
      if (onCheckActive && !onCheckActive()) return;
      try {
          const res = await fetch(`${API_URL}/guests/${id}/sent`, {
              method: 'PUT',
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
              body: JSON.stringify({ isSent: !currentStatus })
          });
          if (res.ok) {
              setGuests(prev => prev.map(g => g._id === id ? { ...g, isSent: !currentStatus } : g));
              toast({ title: !currentStatus ? "Marcat ca Trimis" : "Marcat ca Netrimis" });
          }
      } catch (error) { console.error(error); }
  };

  const copyToClipboard = (fullUrl: string, token: string, id: string, isSent: boolean) => {
    if (onCheckActive && !onCheckActive()) return; // Prevent generating invites if inactive
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    toast({
      title: "Link copiat",
      description: isSent ? "Link-ul este în clipboard." : "Marchează ca trimis dacă l-ai expediat.",
      duration: 2000,
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const copyPublicLink = () => {
    if (onCheckActive && !onCheckActive()) return; // Block copy if read-only
    if (!hasInviteSlug) {
        toast({ title: "Vă rugăm să configurați preferința link-ului", variant: "warning" });
        return;
    }
    const url = `${origin}/events/${slug}/public`;
    navigator.clipboard.writeText(url);
    setPublicLinkCopied(true);
    toast({
      title: "Link Public Copiat!",
      description: "Oricine are acest link se poate înscrie.",
      variant: "success",
    });
    setTimeout(() => setPublicLinkCopied(false), 2000);
  };

  const simulateOpenInvite = async (token: string) => {
        const targetUrl = `${origin}/invite/${token}`;
        try {
            await fetch(`${API_URL}/guest/rsvp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, status: 'opened' })
            });
            fetchGuests();
            window.open(targetUrl, '_blank');
        } catch (e) { 
            console.error(e);
            window.open(targetUrl, '_blank');
        }
    };

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(filter.toLowerCase()),
  );

  const formatAccessDate = (dateStr?: string) => {
      if (!dateStr) return null;
      return new Date(dateStr).toLocaleDateString('ro-RO', {
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      });
  };

  const getStatusBadge = (status: string, openedAt?: string, isSent?: boolean) => {
    switch (status) {
      case "confirmed":
        return (
            <div className="flex flex-col items-start">
                <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20">Confirmat</span>
                {openedAt && <span className="text-[10px] text-muted-foreground mt-0.5" title="Ultima accesare">{formatAccessDate(openedAt)}</span>}
            </div>
        );
      case "declined":
        return (
            <div className="flex flex-col items-start">
                <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20">Refuzat</span>
                {openedAt && <span className="text-[10px] text-muted-foreground mt-0.5" title="Ultima accesare">{formatAccessDate(openedAt)}</span>}
            </div>
        );
      case "opened":
        return (
            <div className="flex flex-col items-start">
                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-500/20">Văzut</span>
                {openedAt && <span className="text-[10px] text-muted-foreground mt-0.5" title="Ultima accesare">{formatAccessDate(openedAt)}</span>}
            </div>
        );
      default:
        if (isSent) {
            return (
                <div className="flex flex-col items-start">
                    <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/20">Trimis</span>
                    {openedAt && <span className="text-[10px] text-muted-foreground mt-0.5" title="Ultima accesare">{formatAccessDate(openedAt)}</span>}
                </div>
            );
        }
        return <span className="inline-flex items-center rounded-full bg-gray-50 dark:bg-zinc-800/50 px-2 py-1 text-xs font-medium text-gray-600 dark:text-zinc-400 ring-1 ring-inset ring-gray-500/10 dark:ring-zinc-700">Nevăzut</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "child": return <Baby className="w-4 h-4 text-pink-500" />;
      case "family": return <Users className="w-4 h-4 text-indigo-500" />;
      case "couple": return <Heart className="w-4 h-4 text-red-500" />;
      default: return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  );

  const inviteBaseUrl = `${origin}/invite/`;
  const isLocked = guests.length >= maxGuests;

  return (
    <TooltipProvider>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50 flex flex-col gap-8 h-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Listă Invitați & RSVP</h2>
            <p className="text-muted-foreground">Gestionează link-urile și confirmările.</p>
          </div>
        </div>

        {/* WARNING BANNER IF SLUG IS MISSING */}
        {!hasInviteSlug && isEventActive && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full shrink-0">
                <LinkIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">Vă rugăm să configurați preferința link-ului</h3>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Pentru a putea genera link-ul public, trebuie să alegeți un nume pentru acesta în setări.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={onNavigateToSettings} className="border-indigo-200 text-indigo-800 hover:bg-indigo-100 whitespace-nowrap">
              Configurare Link
            </Button>
          </div>
        )}

        {/* PUBLIC LINK CARD - DISABLED IF READ ONLY */}
        {hasInviteSlug && (
            <div className={cn(
                "bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-900 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4",
                !isEventActive && "opacity-50 grayscale pointer-events-none"
            )}>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
                    <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="font-semibold text-sm">Link Public Universal</h3>
                    <p className="text-xs text-muted-foreground">
                        {isEventActive 
                            ? "Oricine îl accesează își poate introduce numele și confirma prezența." 
                            : "Generarea link-urilor este dezactivată în modul Read-Only."}
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 pl-3 rounded-lg border shadow-sm w-full md:w-auto">
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[150px]">.../events/{slug}/public</span>
                    <Button size="sm" variant="ghost" onClick={copyPublicLink} className={cn("h-7", publicLinkCopied && "text-green-600")} disabled={!isEventActive}>
                    {publicLinkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
        )}

        {/* ADD GUEST CARD */}
        <div className={cn("relative rounded-xl border bg-card shadow-sm transition-all overflow-hidden", isLocked || !isEventActive ? "border-indigo-200 dark:border-indigo-900 bg-indigo-50/20" : "")}>
          {/* Lock Overlay for Read Only or Max Limit */}
          {(isLocked || !isEventActive) && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-zinc-950/60 backdrop-blur-[2px]">
              <div className="flex items-center gap-4 bg-background border px-4 py-2 rounded-full shadow-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium text-muted-foreground">
                      {!isEventActive ? "Modificări blocate (Read-Only)" : `Limită atinsă (${maxGuests} invitat)`}
                  </span>
                </div>
                {isLocked && isEventActive && (
                    <Button size="sm" onClick={onShowUpgrade} className="h-7 text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0">
                      <Crown className="w-3 h-3 mr-1 text-yellow-200" /> Upgrade
                    </Button>
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={handleAddGuest}
            className={cn(
              "flex flex-col md:flex-row items-center p-3 gap-3",
              (isLocked || !isEventActive) && "opacity-20 pointer-events-none",
            )}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0"><UserPlus className="w-4 h-4" /></div>
            <div className="flex-1 w-full relative">
              <Input
                placeholder="Nume Invitat Manual (ex: Familia Popescu)"
                value={newGuestName}
                onChange={(e: any) => setNewGuestName(e.target.value)}
                className="bg-transparent border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9 font-medium text-foreground placeholder:text-muted-foreground/60"
                disabled={isLocked || !isEventActive}
              />
            </div>
            <div className="w-full h-px bg-border md:w-px md:h-6 mx-2" />
            <select
              className="w-full md:w-44 h-9 rounded-md border border-input bg-background text-foreground text-sm font-medium px-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              value={newGuestType}
              onChange={(e) => setNewGuestType(e.target.value)}
              disabled={isLocked || !isEventActive}
            >
              <option value="adult">👤 Adult (Single)</option>
              <option value="couple">💑 Cuplu</option>
              <option value="family">👨‍👩‍👧‍👦 Familie</option>
              <option value="child">👶 Copil</option>
            </select>
            <Button type="submit" disabled={isAdding || isLocked || !isEventActive} size="sm" className="w-full md:w-auto md:px-6"><Plus className="w-4 h-4 mr-1.5" /> Adaugă</Button>
          </form>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">Invitați ({guests.length})</CardTitle>
              <CardDescription>Lista completă de confirmări</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Caută invitat..." className="pl-8" value={filter} onChange={(e: any) => setFilter(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground w-[50px]">#</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground w-[200px]">Nume</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground">Link / Sursă</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground w-[100px]">Status</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground w-[150px]">Detalii RSVP</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground text-right w-[120px]">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredGuests.length > 0 ? (
                    filteredGuests.map((guest, idx) => {
                      const fullInviteUrl = `${inviteBaseUrl}${guest.token}`;
                      const isPublicSource = guest.source === "public";
                      const rsvp = guest.rsvp;
                      
                      return (
                        <tr key={guest._id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-mono text-xs text-muted-foreground">{idx + 1}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2 font-medium">
                              <div className="p-1.5 bg-muted rounded-full">{getTypeIcon(guest.type)}</div>
                              {guest.name}
                              {isPublicSource && <span className="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/20" title="Venit din Link Public"><Globe className="w-3 h-3 mr-1" /> Public</span>}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            {isPublicSource ? (
                              <span className="text-xs text-muted-foreground italic">Înregistrat via Public Link</span>
                            ) : (
                              <div data-slot="input-group" className={cn("group/input-group relative flex h-8 w-full max-w-md items-center rounded-lg border border-input bg-background shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring", !isEventActive && "opacity-60")}>
                                <div className="flex items-center justify-center pl-2 pr-1 text-muted-foreground border-r border-border/50 mr-1 h-full"><LinkIcon className="w-3.5 h-3.5" /></div>
                                <div className="flex items-center text-xs text-muted-foreground select-none px-1 bg-muted/30 h-full overflow-hidden whitespace-nowrap">.../invite/</div>
                                <input readOnly className="flex-1 min-w-0 bg-transparent px-1 text-xs font-mono text-foreground focus:outline-none" value={guest.token} disabled={!isEventActive} />
                                <button type="button" onClick={() => copyToClipboard(fullInviteUrl, guest.token, guest._id, !!guest.isSent)} className="flex items-center justify-center h-full px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-lg transition-colors border-l border-border/50" title="Copiază Link" disabled={!isEventActive}>
                                  {copiedToken === guest.token ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-4 align-middle">{getStatusBadge(guest.status, guest.openedAt, guest.isSent)}</td>
                          <td className="p-4 align-middle">
                            <div className="flex flex-col gap-1">
                              {guest.status === "confirmed" && rsvp && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Adults */}
                                  <div title="Adulți" className="flex items-center gap-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                                      <Users className="w-3 h-3" /> {(rsvp.adultsCount !== undefined) ? rsvp.adultsCount : (rsvp.confirmedCount || 1)}
                                  </div>
                                  
                                  {/* Children */}
                                  {(rsvp.childrenCount || (rsvp.hasChildren && !rsvp.childrenCount)) && (
                                      <div title="Copii" className="flex items-center gap-1 text-xs bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 px-1.5 py-0.5 rounded border border-pink-100 dark:border-pink-900">
                                          <Baby className="w-3 h-3" /> {rsvp.childrenCount ? rsvp.childrenCount : "Da"}
                                      </div>
                                  )}
                                </div>
                              )}
                              {guest.rsvp?.message && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <MessageSquare className="w-3 h-3" />
                                    <span className="italic truncate max-w-[150px]">"{guest.rsvp.message}"</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end gap-2">
                              {!isPublicSource && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className={cn("h-8 w-8", guest.isSent ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100")}
                                    onClick={() => toggleSentStatus(guest._id, !!guest.isSent)}
                                    title={guest.isSent ? "Marcat ca Trimis" : "Marchează ca Trimis"}
                                    disabled={!isEventActive}
                                  >
                                      <Send className="w-4 h-4" />
                                  </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-500/20" disabled={!isEventActive}><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Ștergi acest invitat?</AlertDialogTitle><AlertDialogDescription>Această acțiune nu poate fi anulată. Link-ul lor va deveni invalid.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel>Anulează</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteGuest(guest._id)} className="bg-red-600">Șterge</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => simulateOpenInvite(guest.token)} title="Simulează vizualizarea"><ExternalLink className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Niciun invitat găsit. Adaugă unul mai sus sau distribuie Link-ul Public!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default GuestListView;
