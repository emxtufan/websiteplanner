
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { API_URL } from '../constants';
import { useToast } from '../components/ui/use-toast';
import { Save, AlertTriangle, Crown, User, Calculator } from 'lucide-react';
import { SystemConfig, PlanLimits } from '../types';

const AdminSettings = ({ token }: { token: string }) => {
    const { toast } = useToast();
    const [config, setConfig] = useState<SystemConfig | null>(null);
    const [basicPriceInput, setBasicPriceInput] = useState("");
    const [priceInput, setPriceInput] = useState("");
    const [oldPriceInput, setOldPriceInput] = useState(""); // New input state
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/admin/config`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            const normalized = {
                ...data,
                limits: {
                    free: data?.limits?.free || { maxGuests: 1, maxElements: 5, maxCustomTasks: 3, maxBudgetItems: 6, maxCalculatorBudget: 500 },
                    basic: data?.limits?.basic || { maxGuests: 9999, maxElements: 0, maxCustomTasks: 0, maxBudgetItems: 0, maxCalculatorBudget: 0 },
                    premium: data?.limits?.premium || { maxGuests: 9999, maxElements: 9999, maxCustomTasks: 9999, maxBudgetItems: 9999, maxCalculatorBudget: 999999999 },
                },
                pricing: {
                    currency: data?.pricing?.currency || 'ron',
                    basicPrice: Number(data?.pricing?.basicPrice ?? 1900),
                    premiumPrice: Number(data?.pricing?.premiumPrice ?? 4900),
                    oldPrice: Number(data?.pricing?.oldPrice ?? 10000),
                },
            };
            setConfig(normalized);
            if (normalized?.pricing?.premiumPrice !== undefined) {
                // Convert Cents to RON for display
                setPriceInput((normalized.pricing.premiumPrice / 100).toString());
            }
            if (normalized?.pricing?.basicPrice !== undefined) {
                setBasicPriceInput((normalized.pricing.basicPrice / 100).toString());
            }
            if (normalized?.pricing?.oldPrice !== undefined) {
                setOldPriceInput((normalized.pricing.oldPrice / 100).toString());
            }
        })
        .catch(err => console.error(err));
    }, [token]);

    const handleSave = async () => {
        if (!config) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/config`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                toast({ title: "Setări Salvate", description: "Modificările au fost aplicate global.", variant: "success" });
            } else {
                throw new Error("Save failed");
            }
        } catch (e) {
            toast({ title: "Eroare", description: "Nu am putut salva setările.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const updateLimit = (plan: 'free' | 'basic' | 'premium', key: keyof PlanLimits, value: string) => {
        if (!config) return;
        const val = parseInt(value) || 0;
        setConfig({
            ...config,
            limits: {
                ...config.limits,
                [plan]: {
                    ...config.limits[plan],
                    [key]: val
                }
            }
        });
    };

    const updatePrice = (field: 'basicPrice' | 'premiumPrice' | 'oldPrice', value: string) => {
        if (!config) return;
        
        if (field === 'basicPrice') setBasicPriceInput(value);
        if (field === 'premiumPrice') setPriceInput(value);
        if (field === 'oldPrice') setOldPriceInput(value);
        
        // Allow empty string to clear input
        if (value === '') return;

        // Convert RON to Cents
        const val = parseFloat(value);
        const cents = isNaN(val) ? 0 : Math.round(val * 100);

        setConfig({
            ...config,
            pricing: {
                ...config.pricing,
                [field]: cents
            }
        });
    };

    if (!config) return <div>Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
                    <p className="text-muted-foreground">Configure global limits and pricing.</p>
                </div>
                <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" /> 
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* FREE PLAN LIMITS */}
                <Card className="border-l-4 border-l-zinc-400">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" /> Free Plan Limits
                        </CardTitle>
                        <CardDescription>Default limits for new users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Guests</label>
                            <Input 
                                type="number" 
                                value={config.limits.free.maxGuests}
                                onChange={(e) => updateLimit('free', 'maxGuests', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Canvas Elements</label>
                            <Input 
                                type="number" 
                                value={config.limits.free.maxElements}
                                onChange={(e) => updateLimit('free', 'maxElements', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Custom Tasks</label>
                            <Input 
                                type="number" 
                                value={config.limits.free.maxCustomTasks}
                                onChange={(e) => updateLimit('free', 'maxCustomTasks', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Budget Items (per category)</label>
                            <Input 
                                type="number" 
                                value={config.limits.free.maxBudgetItems}
                                onChange={(e) => updateLimit('free', 'maxBudgetItems', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 pt-2 border-t">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-indigo-500" /> Max Calculator Budget (LEI)
                            </label>
                            <Input 
                                type="number" 
                                value={config.limits.free.maxCalculatorBudget || 0}
                                onChange={(e) => updateLimit('free', 'maxCalculatorBudget', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Dacă bugetul introdus e sub această limită, calculatorul e deblocat (Demo Mode). Pune 0 pentru a bloca complet.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* PREMIUM PLAN LIMITS */}
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-600">
                            <Crown className="w-5 h-5" /> Premium Plan Limits
                        </CardTitle>
                        <CardDescription>Unlocked features for paid users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Guests</label>
                            <Input 
                                type="number" 
                                value={config.limits.premium.maxGuests}
                                onChange={(e) => updateLimit('premium', 'maxGuests', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Canvas Elements</label>
                            <Input 
                                type="number" 
                                value={config.limits.premium.maxElements}
                                onChange={(e) => updateLimit('premium', 'maxElements', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Custom Tasks</label>
                            <Input 
                                type="number" 
                                value={config.limits.premium.maxCustomTasks}
                                onChange={(e) => updateLimit('premium', 'maxCustomTasks', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Budget Items</label>
                            <Input 
                                type="number" 
                                value={config.limits.premium.maxBudgetItems}
                                onChange={(e) => updateLimit('premium', 'maxBudgetItems', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* BASIC PLAN LIMITS */}
                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-600">
                            <Crown className="w-5 h-5" /> Basic Plan Limits
                        </CardTitle>
                        <CardDescription>Invitatii + RSVP. Restul modulelor blocate.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Guests</label>
                            <Input 
                                type="number" 
                                value={config.limits.basic.maxGuests}
                                onChange={(e) => updateLimit('basic', 'maxGuests', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Canvas Elements</label>
                            <Input 
                                type="number" 
                                value={config.limits.basic.maxElements}
                                onChange={(e) => updateLimit('basic', 'maxElements', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Custom Tasks</label>
                            <Input 
                                type="number" 
                                value={config.limits.basic.maxCustomTasks}
                                onChange={(e) => updateLimit('basic', 'maxCustomTasks', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Budget Items</label>
                            <Input 
                                type="number" 
                                value={config.limits.basic.maxBudgetItems}
                                onChange={(e) => updateLimit('basic', 'maxBudgetItems', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Calculator Budget</label>
                            <Input 
                                type="number" 
                                value={config.limits.basic.maxCalculatorBudget || 0}
                                onChange={(e) => updateLimit('basic', 'maxCalculatorBudget', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PRICING */}
            <Card>
                <CardHeader>
                    <CardTitle>Pricing & Stripe</CardTitle>
                    <CardDescription>Set the checkout amount sent to Stripe.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Basic Price (RON)</label>
                            <div className="flex gap-2">
                                <Input 
                                    type="number"
                                    step="0.01" 
                                    value={basicPriceInput}
                                    onChange={(e) => updatePrice('basicPrice', e.target.value)}
                                />
                                <div className="flex items-center justify-center bg-muted px-3 rounded-md border text-sm font-medium">
                                    RON
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Pretul pentru planul Basic.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Premium Price (RON)</label>
                            <div className="flex gap-2">
                                <Input 
                                    type="number"
                                    step="0.01" 
                                    value={priceInput}
                                    onChange={(e) => updatePrice('premiumPrice', e.target.value)}
                                />
                                <div className="flex items-center justify-center bg-muted px-3 rounded-md border text-sm font-medium">
                                    RON
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Prețul actual de vânzare.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Old Price (RON) - Visual Only</label>
                            <div className="flex gap-2">
                                <Input 
                                    type="number"
                                    step="0.01" 
                                    value={oldPriceInput}
                                    onChange={(e) => updatePrice('oldPrice', e.target.value)}
                                />
                                <div className="flex items-center justify-center bg-muted px-3 rounded-md border text-sm font-medium">
                                    RON
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Prețul vechi tăiat (ex: 249 RON). Folosit pentru marketing.</p>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800 text-sm">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>Changing the "Premium Price" will immediately affect all new Checkout sessions. "Old Price" is cosmetic.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSettings;
