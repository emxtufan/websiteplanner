import React, { useState, useEffect } from "react";
import { Check, Sparkles, Lock, Heart, Baby, Gift, PartyPopper, Briefcase, AlertTriangle, Settings2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import { cn } from "../lib/utils";
import { templates as hardcodedTemplates, getTemplateComponent } from "./invitations/registry";
import { CASTLE_PREVIEW_DATA } from "./invitations/castleDefaults";
import { useToast } from "./ui/use-toast";
import { Dialog, DialogContent } from "./ui/dialog";
import { createComponentFromCode, DeviceFrame, PreviewContainer } from "../lib/template-utils";

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3005/api';

interface InvitationMarketplaceProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  onEditTemplate?: (templateId: string) => void;
  onCheckActive?: () => boolean;
  isEventActive?: boolean;
  eventType?: string;
}

const eventTypeConfig: Record<string, { label: string; icon: React.FC<any>; color: string; description: string }> = {
    wedding:     { label: 'Nuntă',      icon: Heart,       color: 'text-rose-600',   description: 'Design-uri elegante pentru ziua cea mare.' },
    baptism:     { label: 'Botez',      icon: Baby,        color: 'text-blue-600',   description: 'Design-uri delicate pentru botez.' },
    anniversary: { label: 'Aniversare', icon: PartyPopper, color: 'text-amber-600',  description: 'Design-uri festive pentru aniversare.' },
    office:      { label: 'Corporate',  icon: Briefcase,   color: 'text-zinc-600',   description: 'Design-uri profesionale pentru evenimente corporate.' },
    kids:        { label: 'Copii',      icon: Gift,        color: 'text-purple-600', description: 'Design-uri vesele pentru petrecerile copiilor.' },
};

const MarketplacePreviewContent = ({ template }: { template: any }) => {
    const CustomComponent = React.useMemo(() => {
        if (template.reactCode) return createComponentFromCode(template.reactCode);
        return null;
    }, [template.reactCode]);

    const Component = template.reactCode ? CustomComponent : getTemplateComponent(template.id);

    // Date de previzualizare specifice per template
    const templatePreviewData: Record<string, any> = {
        'castle-magic': CASTLE_PREVIEW_DATA,
    };

    const dummyData: any = templatePreviewData[template.id] || {
        guest: { name: "Invitat Exemplu", status: "pending", type: "adult" },
        project: { selectedTemplate: template.id },
        profile: {
            partner1Name: "Partener 1",
            partner2Name: "Partener 2",
            locationName: "Locație Exemplu",
            locationAddress: "Strada Exemplu, Nr. 1",
            eventTime: "19:00",
            showCivil: true,
            civilTime: "14:00",
            civilLocationName: "Primărie",
            showChurch: true,
            churchTime: "16:00",
            churchLocationName: "Biserică",
            godparents: "[]",
            parents: "{}",
            timeline: "[]",
            weddingDate: "2024-12-31",
        }
    };

    if (!Component) return <div className="p-8 text-center italic text-zinc-400">Designul nu poate fi previzualizat.</div>;

    return (
        <PreviewContainer>
            {template.customStyles && <style dangerouslySetInnerHTML={{ __html: template.customStyles }} />}
            <Component data={dummyData} onOpenRSVP={() => {}} />
        </PreviewContainer>
    );
};

export default function InvitationMarketplace({
    selectedTemplate, onSelectTemplate, onEditTemplate,
    onCheckActive, isEventActive = true,
    eventType = 'wedding'
}: InvitationMarketplaceProps) {
  const { toast } = useToast();
  const [dynamicTemplates, setDynamicTemplates] = useState<any[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);

  const session = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  const isPaidPlan = session.plan === 'premium' || session.plan === 'basic';

  const config = eventTypeConfig[eventType] || eventTypeConfig['wedding'];
  const Icon = config.icon;

  useEffect(() => {
    const fetchDynamic = async () => {
      try {
        const res = await fetch(`${API_URL}/templates`);
        if (res.ok) setDynamicTemplates(await res.json());
      } catch (e) {
        console.error("Failed to fetch dynamic templates", e);
      }
    };
    fetchDynamic();
  }, []);

  // ── Compatibilitate eveniment ↔ template ─────────────────────────────────
  // Definește ce tag-uri sunt acceptate pentru fiecare tip de eveniment.
  // Kids/zi-de-naștere acceptă și template-urile de botez (vizual identice).
  const EVENT_COMPATIBLE_TAGS: Record<string, string[]> = {
    wedding:     ['wedding'],
    baptism:     ['baptism'],
    kids:        ['kids', 'baptism', 'birthday'],
    anniversary: ['anniversary', 'wedding'],
    office:      ['office', 'wedding'],
  };

  function isCompatible(t: any): boolean {
    const allowed = EVENT_COMPATIBLE_TAGS[eventType] ?? [eventType];
    // Dacă template-ul are tags explicit definite, le folosim drept criteriu
    if (t.tags && t.tags.length > 0) {
      return t.tags.some((tag: string) => allowed.includes(tag));
    }
    // Fără tags → fallback la category
    return allowed.includes(t.category);
  }

  // Afișează EXCLUSIV template-urile compatibile cu tipul de eveniment curent
  const filteredTemplates = [...hardcodedTemplates, ...dynamicTemplates].filter(isCompatible);

  const handleSelect = (template: any) => {
      if (onCheckActive && !onCheckActive()) return;
      const isFreeTemplate = template.id === 'classic' || template.id === `classic-${eventType}`;
      const isLocked = !isFreeTemplate && !isPaidPlan;
      if (isLocked) {
          toast({ title: "Funcționalitate Premium", description: "Treci la planul Premium pentru a debloca această temă.", variant: "destructive" });
          return;
      }
      onSelectTemplate(template.id);
      toast({ title: "Design Actualizat!", description: `Ai selectat tema "${template.name}".`, variant: "success" });
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50">
       <div className="max-w-6xl mx-auto space-y-8">

          {/* HEADER */}
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-xl bg-white shadow-sm border", config.color)}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Design Invitație</h2>
              <p className="text-muted-foreground">{config.description}</p>
            </div>
          </div>

          {/* BANNER AVERTIZARE */}
          <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-0">
              <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-background rounded-full shadow-sm">
                      <AlertTriangle className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                      <h4 className="font-semibold text-foreground">ATENȚIE</h4>
                      <p className="text-sm text-muted-foreground">
                         În previzualizare datele evenimentului nu sunt încărcate complet, unele secțiuni pot părea goale.<br />
                         Nu vă faceți griji — în invitația finală totul va fi vizibil.
                      </p>
                  </div>
              </CardContent>
          </Card>

          {/* GRID TEMPLATE-URI */}
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="p-5 bg-white rounded-2xl shadow-sm border">
                <Icon className={cn("w-10 h-10", config.color)} />
              </div>
              <div>
                <p className="text-lg font-semibold">Niciun design disponibil momentan</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Design-urile pentru <span className="font-medium">{config.label}</span> sunt în curs de adăugare.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => {
                    const isSelected = selectedTemplate === template.id;
                    const isFreeTemplate = template.id === 'classic' || template.id === `classic-${eventType}`;
                    const isLocked = !isFreeTemplate && !isPaidPlan;
                    
                    return (
                        <Card 
                          key={template.id} 
                          className={cn(
                            "cursor-pointer transition-all duration-300 group relative overflow-hidden",
                            "border border-border shadow-md hover:shadow-2xl", 
                            isSelected ? "ring-2 ring-primary border-primary shadow-lg" : "hover:border-primary/70",
                            (isLocked || !isEventActive) && "opacity-75"
                          )}
                          onClick={() => handleSelect(template)}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 z-20 bg-primary text-primary-foreground rounded-full p-1 shadow-md animate-in zoom-in">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                            {isLocked && isEventActive && (
                                <div className="absolute inset-0 z-10 bg-black/5 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="bg-black/80 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-xl">
                                        <Lock className="w-3 h-3" /> PREMIUM
                                    </div>
                                </div>
                            )}

                            <div className={cn("h-48 relative flex flex-col items-center justify-center overflow-hidden", template.previewClass)}>
                                {template.thumbnailUrl ? (
                                    <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4 gap-2 w-full h-full">
                                        <div className={cn("w-3/4 h-3 rounded-full opacity-30", template.elementsClass || "bg-zinc-900")}></div>
                                        <div className={cn("w-1/2 h-8 rounded-md opacity-40 my-2", template.elementsClass || "bg-zinc-900")}></div>
                                        <div className={cn("w-2/3 h-2 rounded-full opacity-20", template.elementsClass || "bg-zinc-900")}></div>
                                    </div>
                                )}
                                <div className="absolute bottom-3 left-3 flex gap-1">
                                    {template.colors.map((c: string) => (
                                        <div key={c} className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                                {isFreeTemplate && (
                                    <div className="absolute top-3 right-3">
                                        <span className="text-[9px] font-bold uppercase tracking-tighter bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow">
                                            GRATUIT
                                        </span>
                                    </div>
                                )}
                            </div>

                            <CardContent className="pt-6">
                              <h3 className="font-bold text-lg">{template.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1 mb-4 line-clamp-2 min-h-[40px]">
                                {template.description}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <Button
                                  size="sm"
                                  variant={isSelected ? "default" : "outline"}
                                  className="w-full sm:w-auto flex-1 sm:flex-none h-12 sm:h-10 px-4 py-2"
                                  disabled={isLocked || !isEventActive}
                                >
                                  {!isEventActive ? "Blocat (Read-Only)" : isSelected ? "✓ Selectat" : isLocked ? "🔒 Premium" : "Alege"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="w-full sm:w-auto h-8 text-[10px] font-bold"
                                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEditTemplate?.(template.id); }}
                                >
                                  <Settings2 className="w-3.5 h-3.5 mr-1" /> EDIT TEMPLATE
                                </Button>
                              </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
          )}

          <Card className="mt-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-0">
              <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-background rounded-full shadow-sm">
                      <Sparkles className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                      <h4 className="font-semibold text-foreground">Personalizare Completă</h4>
                      <p className="text-sm text-muted-foreground">
                          Editează textele, locațiile, nașii și programul din <strong>Config Template</strong>. 
                          Toate modificările se reflectă în timp real în invitație.
                      </p>
                  </div>
              </CardContent>
          </Card>
       </div>

       <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
            <DialogContent className="max-w-md h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                <div className="h-full flex flex-col items-center justify-center w-full">
                    <DeviceFrame>
                        {previewTemplate && <MarketplacePreviewContent template={previewTemplate} />}
                    </DeviceFrame>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
