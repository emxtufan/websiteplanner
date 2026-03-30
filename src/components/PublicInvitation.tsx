
import React, { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { API_URL } from "../constants";
import { InvitationData } from "./invitations/types";
import { cn } from "../lib/utils";
import { createComponentFromCode } from "../lib/template-utils";

// Import Registry instead of individual templates
import { getTemplateComponent } from "./invitations/registry";
import RsvpModal from "./invitations/RsvpModal";
import { useToast } from "./ui/use-toast";

gsap.registerPlugin(ScrollTrigger);

// Helper to turn string code into a React component
// (Moved to src/lib/template-utils.ts)

const PublicInvitation = () => {
    const [loading, setLoading] = useState(true);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<InvitationData | null>(null);
    const [dynamicTemplate, setDynamicTemplate] = useState<any | null>(null);
    const [isRsvpOpen, setIsRsvpOpen] = useState(false);
    const { toast } = useToast();

    // Store token for specific invite, or detect public mode
    const [token, setToken] = useState<string | null>(null);
    const [isPublicMode, setIsPublicMode] = useState(false);

    const fetchDynamicTemplate = async (id: string) => {
        setLoadingTemplate(true);
        try {
            const res = await fetch(`${API_URL}/templates`);
            if (res.ok) {
                const templates = await res.json();
                const found = templates.find((t: any) => t.id === id);
                if (found) setDynamicTemplate(found);
            }
        } catch (e) {
            console.error("Failed to fetch dynamic template", e);
        } finally {
            setLoadingTemplate(false);
        }
    };

    useEffect(() => {
        const path = window.location.pathname;
        
        const handleInviteData = (inviteData: InvitationData) => {
            setData(inviteData);
            const templateId = inviteData.project.selectedTemplate || 'classic';
            // If it's not a hardcoded template, fetch it
            if (!getTemplateComponent(templateId)) {
                fetchDynamicTemplate(templateId);
            }
        };
        // 1. Check for Public Link Mode: /events/:slug/public
        if (path.endsWith('/public')) {
            setIsPublicMode(true);
            const pathParts = path.split('/');
            // /events/slug/public -> index of 'events' + 1 is slug
            const eventsIndex = pathParts.indexOf('events');
            if (eventsIndex === -1 || eventsIndex + 1 >= pathParts.length) {
                setError("Link public invalid.");
                setLoading(false);
                return;
            }
            const slug = pathParts[eventsIndex + 1];
            
            fetch(`${API_URL}/public-invite-data/${slug}`)
                .then(res => {
                    if (!res.ok) throw new Error("Evenimentul nu a fost găsit sau link-ul este invalid.");
                    return res.json();
                })
                .then(inviteData => handleInviteData(inviteData))
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
            
            return;
        }

        // 2. Check for Specific Token Mode: /invite/:token
        const pathParts = path.split('/');
        const inviteIndex = pathParts.indexOf('invite');
        
        if (inviteIndex === -1 || inviteIndex === pathParts.length - 1) {
            setError("Link invalid (Token lipsă).");
            setLoading(false);
            return;
        }
        
        const extractedToken = pathParts[inviteIndex + 1];
        setToken(extractedToken);

        fetch(`${API_URL}/invite-data/${extractedToken}`)
            .then(res => {
                if (!res.ok) throw new Error("Invitația nu a fost găsită sau evenimentul a expirat.");
                return res.json();
            })
            .then(inviteData => {
                handleInviteData(inviteData);
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleRsvpSubmit = async (rsvpPayload: any) => {
        try {
            let res;
            
            if (isPublicMode) {
                // Public Mode: Create guest & RSVP
                if (!data?.ownerId) throw new Error("Owner ID missing");
                
                res = await fetch(`${API_URL}/guest/public-rsvp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ownerId: data.ownerId,
                        name: rsvpPayload.name, // Name collected from modal
                        status: rsvpPayload.status,
                        rsvpData: rsvpPayload.rsvpData
                    })
                });
            } else {
                // Token Mode: Update existing guest
                if (!token) return;
                res = await fetch(`${API_URL}/guest/rsvp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token,
                        status: rsvpPayload.status,
                        rsvpData: rsvpPayload.rsvpData
                    })
                });
            }

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to submit RSVP");
            }

            toast({
                title: rsvpPayload.status === 'confirmed' ? "Mulțumim pentru confirmare!" : "Răspuns înregistrat",
                description: rsvpPayload.status === 'confirmed' 
                    ? "Te așteptăm cu drag!" 
                    : "Ne pare rău că nu poți ajunge.",
                variant: rsvpPayload.status === 'confirmed' ? "success" : "default"
            });

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Eroare",
                description: error.message || "Nu am putut trimite răspunsul. Încearcă din nou.",
                variant: "destructive"
            });
        }
    };

    // Lenis smooth scroll — dezactivat pentru castle-magic (conflict cu GSAP pin)
    useEffect(() => {
        if (loading || loadingTemplate || !data) return;
        const templateId = data.project.selectedTemplate || 'classic';
        // if (templateId === 'castle-magic') return;

        const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });

        lenis.on("scroll", ScrollTrigger.update);

        const ticker = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(ticker);
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(ticker);
        };
    }, [loading, loadingTemplate, data]);

    const CustomComponent = useMemo(() => {
        if (dynamicTemplate?.reactCode) {
            return createComponentFromCode(dynamicTemplate.reactCode);
        }
        return null;
    }, [dynamicTemplate?.reactCode]);

    if (loading || loadingTemplate) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
                <p className="text-zinc-400 text-sm animate-pulse">Se încarcă invitația...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 text-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl border max-w-sm">
                    <h1 className="text-2xl font-bold text-zinc-800 mb-2">Ooops!</h1>
                    <p className="text-zinc-600 mb-4">{error}</p>
                    <a href="/" className="text-primary text-sm font-medium hover:underline">Mergi la pagina principală</a>
                </div>
            </div>
        );
    }

    if (!data) return null;

    // --- DYNAMIC TEMPLATE RENDERING ---
    const templateId = data.project.selectedTemplate || 'classic';
    const TemplateComponent = getTemplateComponent(templateId);

    // If it's a dynamic template from DB with custom code
    if (!TemplateComponent && CustomComponent) {
        return (
            <>
                {dynamicTemplate.customStyles && <style dangerouslySetInnerHTML={{ __html: dynamicTemplate.customStyles }} />}
                <CustomComponent 
                    data={data} 
                    onOpenRSVP={() => setIsRsvpOpen(true)} 
                />
                <RsvpModal 
                    isOpen={isRsvpOpen} 
                    onClose={() => setIsRsvpOpen(false)}
                    onSubmit={handleRsvpSubmit}
                    guestName={data.guest.name}
                    isPublic={isPublicMode}
                />
            </>
        );
    }

    // Fallback if template id doesn't exist (e.g. was deleted)
    if (!TemplateComponent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Template-ul "{templateId}" nu a fost găsit. Contactează suportul.</p>
            </div>
        );
    }

    return (
        <>
            <TemplateComponent 
                data={data} 
                onOpenRSVP={() => setIsRsvpOpen(true)} 
            />
            <RsvpModal 
                isOpen={isRsvpOpen} 
                onClose={() => setIsRsvpOpen(false)}
                onSubmit={handleRsvpSubmit}
                guestName={data.guest.name}
                isPublic={isPublicMode} // Pass public flag to Modal
            />
        </>
    );
};

export default PublicInvitation;
