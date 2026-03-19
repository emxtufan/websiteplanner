
import React, { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { API_URL } from "../constants";
import { createComponentFromCode, PreviewContainer } from "../lib/template-utils";
import { getTemplateComponent } from "./invitations/registry";
import Button from "./ui/button";

const TemplatePreviewPage = () => {
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const path = window.location.pathname;
        const parts = path.split('/');
        const templateId = parts[parts.indexOf('templates') + 1];

        const fetchTemplate = async () => {
            try {
                const res = await fetch(`${API_URL}/templates`);
                if (res.ok) {
                    const templates = await res.json();
                    const found = templates.find((t: any) => t.id === templateId);
                    if (found) {
                        setTemplate(found);
                    } else {
                        // Check hardcoded
                        const hardcoded = getTemplateComponent(templateId);
                        if (hardcoded) {
                            setTemplate({ id: templateId, name: templateId });
                        } else {
                            setError("Template-ul nu a fost găsit.");
                        }
                    }
                }
            } catch (e) {
                setError("Eroare la încărcarea template-ului.");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
                <p className="text-zinc-400 text-sm">Se încarcă previzualizarea...</p>
            </div>
        );
    }

    if (error || !template) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Eroare</h1>
                <p className="text-zinc-600 mb-6">{error || "Template invalid"}</p>
                <Button onClick={() => window.history.back()}>Înapoi</Button>
            </div>
        );
    }

    const dummyData = {
  guest: { name: "Invitat Exemplu", status: "pending", type: "adult" },
  profile: {
    title: "Evenimentul Nostru",
    partner1Name: "Partener 1",
    partner2Name: "Partener 2",
    address: "Strada Exemplu, Nr. 1",
    partner1: "Partener 1",
    partner2: "Partener 2",
    eventDate: "2024-12-31",
    locationName: "Locație Exemplu",
    locationAddress: "Strada Exemplu, Nr. 1",
    eventTime: "19:00",
    showCivil: true,
    civilTime: "14:00",
    civilLocationName: "Primărie",
    showChurch: true,
    churchTime: "16:00",
    churchLocationName: "Biserică",
    godparents: JSON.stringify([]),       // string JSON
    parents: JSON.stringify({}),          // string JSON
    timeline: JSON.stringify([]),         // string JSON
    weddingDate: "2024-12-31",
    guestEstimate: 100,
    firstName: "Maria",
    lastName: "Popescu",
    email: "maria@example.com",
    phone: "0722000000",
    city: "București",
    country: "România",
    budget: 10000
  },
  project: { selectedTemplate: template.id }
};

    const TemplateComponent = template.reactCode 
    ? createComponentFromCode(template.reactCode) 
    : getTemplateComponent(template.id);

    if (!TemplateComponent) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4 text-center">
                <p>Acest template nu poate fi previzualizat.</p>
                <Button onClick={() => window.history.back()} className="mt-4">Înapoi</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-100 flex flex-col">
            <div className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50 bg-[#262626]">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Înapoi
                    </Button>
                    {/* <h1 className="font-bold text-s">Previzualizare: {template.name}</h1> */}
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                    ID: {template.id}
                </div>
            </div>
            
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                <div className="w-full h-full bg-white shadow-2xl overflow-hidden relative">
                    <PreviewContainer>
                        {template.customStyles && <style dangerouslySetInnerHTML={{ __html: template.customStyles }} />}
                        <TemplateComponent data={dummyData} onOpenRSVP={() => alert("RSVP Clicked")} />
                    </PreviewContainer>
                </div>
            </div>
        </div>
    );
};

export default TemplatePreviewPage;
