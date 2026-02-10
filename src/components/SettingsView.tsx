
import React, { useState } from "react";
import { User, MapPin, Calendar, Heart, Users, Save, Loader2, AlertTriangle, Clock, Plus, Trash2, UserPlus, Baby, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import Button from "./ui/button";
import Input from "./ui/input";
import { UserSession, UserProfile } from "../types";
import { useToast } from "./ui/use-toast";

interface SettingsViewProps {
  session: UserSession;
  onUpdateProfile: (profile: UserProfile) => Promise<void>;
}

interface GodparentPair {
    godfather: string;
    godmother: string;
}

interface ParentsData {
    p1_father: string;
    p1_mother: string;
    p2_father: string;
    p2_mother: string;
    others: string[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ session, onUpdateProfile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // --- INITIAL DATA PARSING ---
  const parseGodparents = (str: string | undefined): GodparentPair[] => {
      if (!str) return [{ godfather: "", godmother: "" }];
      try {
          const parsed = JSON.parse(str);
          // Check if it's the new structure (array of objects)
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
              return parsed;
          }
          // Legacy: Array of strings ["Ion & Maria"] -> Convert to structure
          if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
              return parsed.map(s => ({ godfather: s, godmother: "" }));
          }
      } catch (e) {
          // Fallback for plain string
          return [{ godfather: str, godmother: "" }];
      }
      return [{ godfather: "", godmother: "" }];
  };

  const parseParents = (str: string | undefined): ParentsData => {
      const defaultStructure = { p1_father: "", p1_mother: "", p2_father: "", p2_mother: "", others: [] };
      if (!str) return defaultStructure;
      try {
          const parsed = JSON.parse(str);
          if (!Array.isArray(parsed) && typeof parsed === 'object') {
              return { ...defaultStructure, ...parsed };
          }
          // Legacy: Array of strings -> Move to 'others' or try to map
          if (Array.isArray(parsed)) {
              return { ...defaultStructure, others: parsed };
          }
      } catch (e) {
          return defaultStructure;
      }
      return defaultStructure;
  };

  // --- STATE ---
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: session.profile?.firstName || "",
    lastName: session.profile?.lastName || "",
    email: session.profile?.email || session.user || "", // Sync with user email initially if profile email empty
    phone: session.profile?.phone || "",
    address: session.profile?.address || "",
    weddingDate: session.profile?.weddingDate ? new Date(session.profile.weddingDate).toISOString().split('T')[0] : "",
    guestEstimate: session.profile?.guestEstimate || 0,
    partner1Name: session.profile?.partner1Name || "",
    partner2Name: session.profile?.partner2Name || "",
    locationName: session.profile?.locationName || "",
    locationAddress: session.profile?.locationAddress || "",
    eventTime: session.profile?.eventTime || ""
  });

  const [godparents, setGodparents] = useState<GodparentPair[]>(parseGodparents(session.profile?.godparents));
  const [parents, setParents] = useState<ParentsData>(parseParents(session.profile?.parents));

  // --- HANDLERS ---

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError(null);
  };

  const validateSingleName = (name: string | undefined) => {
    return name && name.trim().length > 0 && !name.trim().includes(' ');
  };

  const validateEmail = (email: string | undefined) => {
      return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Godparents Logic
  const handleGodparentChange = (index: number, field: keyof GodparentPair, value: string) => {
      const newG = [...godparents];
      newG[index][field] = value;
      setGodparents(newG);
  };
  const addGodparentPair = () => setGodparents([...godparents, { godfather: "", godmother: "" }]);
  const removeGodparentPair = (index: number) => {
      if (godparents.length === 1) {
          setGodparents([{ godfather: "", godmother: "" }]); // Clear instead of delete last
      } else {
          setGodparents(godparents.filter((_, i) => i !== index));
      }
  };

  // Parents Logic
  const handleParentMainChange = (field: keyof Omit<ParentsData, 'others'>, value: string) => {
      setParents(prev => ({ ...prev, [field]: value }));
  };
  const handleOtherParentChange = (index: number, value: string) => {
      const newOthers = [...parents.others];
      newOthers[index] = value;
      setParents(prev => ({ ...prev, others: newOthers }));
  };
  const addOtherParent = () => setParents(prev => ({ ...prev, others: [...prev.others, ""] }));
  const removeOtherParent = (index: number) => {
      setParents(prev => ({ ...prev, others: prev.others.filter((_, i) => i !== index) }));
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    // 1. Validate Partners
    if (!validateSingleName(formData.partner1Name) || !validateSingleName(formData.partner2Name)) {
        setValidationError("Numele mirilor sunt obligatorii și trebuie să fie un singur prenume (fără spații).");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // 2. Validate Email
    if (!validateEmail(formData.email)) {
        setValidationError("Adresa de email este invalidă. Este necesară pentru confirmări și facturare.");
        return;
    }

    // 3. Validate Godparents (At least one name in the first pair)
    const firstPair = godparents[0];
    if (!firstPair.godfather.trim() && !firstPair.godmother.trim()) {
        setValidationError("Te rugăm să adaugi cel puțin o pereche de nași (Nume Naș sau Nașă).");
        return;
    }

    setIsLoading(true);
    try {
      const finalProfile: UserProfile = {
          ...session.profile,
          ...formData as UserProfile,
          godparents: JSON.stringify(godparents),
          parents: JSON.stringify(parents)
      };

      await onUpdateProfile(finalProfile);
      
    } catch (error) {
      console.error(error);
      toast({ title: "Eroare la salvare", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50">
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Setări Cont & Eveniment</h2>
          <p className="text-muted-foreground">Configurează detaliile principale, părinții și nașii pentru invitații.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* VALIDATION ERROR BANNER */}
            {validationError && (
                 <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm p-4 rounded-md flex gap-3 items-start border border-red-200 dark:border-red-900 animate-in slide-in-from-top-2">
                     <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                     <div>
                         <p className="font-semibold">Atenție!</p>
                         <p>{validationError}</p>
                     </div>
                 </div>
             )}

            {/* --- SECTION 0: ACCOUNT INFO --- */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-500" /> Date Cont
                    </CardTitle>
                    <CardDescription>Email-ul este folosit pentru login și facturare.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="adresa@email.com"
                                value={formData.email}
                                onChange={(e: any) => handleChange('email', e.target.value)}
                                className={`pl-9 ${!validateEmail(formData.email) && validationError ? "border-red-500" : ""}`}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Notă: Modificarea email-ului aici va actualiza adresa de contact și facturare. Login-ul rămâne neschimbat momentan.</p>
                    </div>
                </CardContent>
            </Card>

            {/* --- SECTION 1: MIRI & LOCATIE --- */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-rose-500" /> Configurare Miri <span className="text-red-500">*</span>
                        </CardTitle>
                        <CardDescription>
                            Link invitație: <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">.../events/{formData.partner1Name || '?'}-{formData.partner2Name || '?'}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prenume Partener 1 (Mireasă/Mire)</label>
                            <Input 
                                placeholder="Ex: Maria"
                                value={formData.partner1Name}
                                onChange={(e: any) => handleChange('partner1Name', e.target.value)}
                                className={!validateSingleName(formData.partner1Name) && validationError ? "border-red-500 bg-red-50" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prenume Partener 2 (Mire/Mireasă)</label>
                            <Input 
                                placeholder="Ex: Ion"
                                value={formData.partner2Name}
                                onChange={(e: any) => handleChange('partner2Name', e.target.value)}
                                className={!validateSingleName(formData.partner2Name) && validationError ? "border-red-500 bg-red-50" : ""}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-500" /> Detalii Eveniment
                        </CardTitle>
                        <CardDescription>Unde și când are loc evenimentul.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Data</label>
                                <div className="relative">
                                    <Input type="date" value={formData.weddingDate} onChange={(e: any) => handleChange('weddingDate', e.target.value)} className="pl-9" />
                                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ora</label>
                                <div className="relative">
                                    <Input type="time" value={formData.eventTime} onChange={(e: any) => handleChange('eventTime', e.target.value)} className="pl-9" />
                                    <Clock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Locație (Nume & Adresă)</label>
                            <Input placeholder="Ex: Salonul Imperial" value={formData.locationName} onChange={(e: any) => handleChange('locationName', e.target.value)} />
                            <Input placeholder="Strada Exemplului nr. 5" value={formData.locationAddress} onChange={(e: any) => handleChange('locationAddress', e.target.value)} className="text-xs" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- SECTION 2: PARINTI (Split View) --- */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Baby className="w-5 h-5 text-blue-500" /> Părinții
                    </CardTitle>
                    <CardDescription>Introduceți numele părinților pentru a apărea pe invitație.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* PARTNER 1 PARENTS */}
                        <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" /> Părinți {formData.partner1Name || "Partener 1"}
                            </h4>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Tată</label>
                                    <Input 
                                        placeholder="Prenume Tată" 
                                        value={parents.p1_father}
                                        onChange={(e: any) => handleParentMainChange('p1_father', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Mamă</label>
                                    <Input 
                                        placeholder="Prenume Mamă" 
                                        value={parents.p1_mother}
                                        onChange={(e: any) => handleParentMainChange('p1_mother', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PARTNER 2 PARENTS */}
                        <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" /> Părinți {formData.partner2Name || "Partener 2"}
                            </h4>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Tată</label>
                                    <Input 
                                        placeholder="Prenume Tată" 
                                        value={parents.p2_father}
                                        onChange={(e: any) => handleParentMainChange('p2_father', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Mamă</label>
                                    <Input 
                                        placeholder="Prenume Mamă" 
                                        value={parents.p2_mother}
                                        onChange={(e: any) => handleParentMainChange('p2_mother', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* OTHER FAMILY MEMBERS */}
                    <div className="mt-6 pt-6 border-t">
                        <label className="text-sm font-medium block mb-2">Alți membri familie (opțional)</label>
                        <div className="space-y-2">
                            {parents.others.map((p, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input 
                                        placeholder="Ex: Părinte Vitreg, Frate..."
                                        value={p}
                                        onChange={(e: any) => handleOtherParentChange(idx, e.target.value)}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOtherParent(idx)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addOtherParent} className="text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Adaugă membru
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- SECTION 3: NASI (Godparents) --- */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Nașii <span className="text-red-500 text-sm ml-1">*</span>
                    </CardTitle>
                    <CardDescription>Adaugă perechile de nași. Minim o pereche necesară.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {godparents.map((pair, idx) => (
                         <div key={idx} className="p-4 rounded-lg border bg-zinc-50/50 dark:bg-zinc-900/50 relative group">
                             <div className="absolute right-2 top-2">
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => removeGodparentPair(idx)}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                             </div>
                             <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Perechea {idx + 1}</h4>
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <label className="text-xs font-medium flex items-center gap-1"><User className="w-3 h-3" /> Nume Naș</label>
                                     <Input 
                                        placeholder="Ex: Andrei" 
                                        value={pair.godfather}
                                        onChange={(e: any) => handleGodparentChange(idx, 'godfather', e.target.value)}
                                        className="bg-white dark:bg-zinc-950"
                                     />
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-xs font-medium flex items-center gap-1"><User className="w-3 h-3 text-pink-500" /> Nume Nașă</label>
                                     <Input 
                                        placeholder="Ex: Elena" 
                                        value={pair.godmother}
                                        onChange={(e: any) => handleGodparentChange(idx, 'godmother', e.target.value)}
                                        className="bg-white dark:bg-zinc-950"
                                     />
                                 </div>
                             </div>
                         </div>
                     ))}
                     
                     <Button type="button" variant="outline" className="w-full border-dashed" onClick={addGodparentPair}>
                         <UserPlus className="w-4 h-4 mr-2" /> Adaugă încă o pereche de nași
                     </Button>
                </CardContent>
            </Card>
            
            <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t flex justify-end z-20">
                <Button type="submit" size="lg" disabled={isLoading} className="shadow-lg">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvează Modificările
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
