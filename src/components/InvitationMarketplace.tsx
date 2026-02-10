
import React from "react";
import { Check, Sparkles, Smartphone, Image as ImageIcon, Lock } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import { cn } from "../lib/utils";
// IMPORT FROM REGISTRY
import { templates } from "./invitations/registry";
// IMPORT TOAST HOOK
import { useToast } from "./ui/use-toast";

interface InvitationMarketplaceProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const InvitationMarketplace: React.FC<InvitationMarketplaceProps> = ({ selectedTemplate, onSelectTemplate }) => {
  const { toast } = useToast();

  // Hack: Read session directly from localStorage since we don't pass it down here yet, 
  // or we could refactor. For now, reading storage is safe enough for UI logic.
  const session = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  const isPremium = session.plan === 'premium';

  const handleSelect = (template: typeof templates[0]) => {
      const isLocked = template.id !== 'classic' && !isPremium;
      
      if (isLocked) {
          toast({
              title: "Funcționalitate Premium",
              description: "Treci la planul Premium pentru a debloca această temă.",
              variant: "destructive"
          });
          return;
      }

      onSelectTemplate(template.id);
      toast({
          title: "Design Actualizat!",
          description: `Ai selectat tema "${template.name}".`,
          variant: "success"
      });
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50">
       <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Design Invitație</h2>
            <p className="text-muted-foreground">Alege șablonul pe care îl vor vedea invitații tăi când deschid link-ul.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                  const isSelected = selectedTemplate === template.id;
                  const isLocked = template.id !== 'classic' && !isPremium;
                  
                  return (
                      <Card 
                        key={template.id} 
                        className={cn(
                          "cursor-pointer transition-all duration-300 group relative overflow-hidden",
                          "border border-border shadow-md hover:shadow-2xl", 
                          isSelected 
                            ? "ring-2 ring-primary border-primary shadow-lg" 
                            : "hover:border-primary/70",
                          isLocked && "opacity-75"
                        )}
                        onClick={() => handleSelect(template)}
                      >
                          {isSelected && (
                              <div className="absolute top-2 right-2 z-20 bg-primary text-primary-foreground rounded-full p-1 shadow-md animate-in zoom-in">
                                  <Check className="w-4 h-4" />
                              </div>
                          )}

                          {isLocked && (
                               <div className="absolute inset-0 z-10 bg-black/5 flex items-center justify-center backdrop-blur-[1px]">
                                   <div className="bg-black/80 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-xl">
                                       <Lock className="w-3 h-3" /> PREMIUM
                                   </div>
                               </div>
                          )}

                          {/* PREVIEW AREA */}
                          {template.thumbnailUrl ? (
                              // OPTION A: REAL IMAGE THUMBNAIL
                              <div className="h-48 w-full relative bg-muted">
                                  <img 
                                    src={template.thumbnailUrl} 
                                    alt={template.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                  />
                              </div>
                          ) : (
                              // OPTION B: CSS GENERATED PREVIEW (Default)
                              <div className={cn("h-48 relative flex flex-col items-center justify-center p-4 gap-2 transition-colors duration-300", template.previewClass)}>
                                  {/* Fake UI Elements using elementsClass from meta */}
                                  <div className={cn("w-3/4 h-3 rounded-full opacity-30", template.elementsClass || "bg-zinc-900")}></div>
                                  <div className={cn("w-1/2 h-8 rounded-md opacity-40 my-2", template.elementsClass || "bg-zinc-900")}></div>
                                  <div className={cn("w-2/3 h-2 rounded-full opacity-20", template.elementsClass || "bg-zinc-900")}></div>
                                  
                                  <div className="absolute bottom-3 left-3 flex gap-1">
                                      {template.colors.map(c => (
                                          <div key={c} className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c }} />
                                      ))}
                                  </div>
                              </div>
                          )}

                          <CardContent className="pt-6">
                              <h3 className="font-bold text-lg">{template.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1 mb-4 line-clamp-2 min-h-[40px]">{template.description}</p>
                              
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                                      <Smartphone className="w-4 h-4" /> Mobile Ready
                                  </div>
                                  <Button size="sm" variant={isSelected ? "default" : "outline"} className="w-full ml-4" disabled={isLocked}>
                                      {isSelected ? "Selectat" : isLocked ? "Blocat" : "Alege"}
                                  </Button>
                              </div>
                          </CardContent>
                      </Card>
                  );
              })}
          </div>

          <Card className="mt-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-0">
              <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-background rounded-full shadow-sm">
                      <Sparkles className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                      <h4 className="font-semibold text-foreground">Sfat Pro</h4>
                      <p className="text-sm text-muted-foreground">
                          Utilizatorii Premium au acces nelimitat la toate temele de invitații, inclusiv colecția Modern Dark și Floral Romantic.
                      </p>
                  </div>
              </CardContent>
          </Card>
       </div>
    </div>
  );
};

export default InvitationMarketplace;
