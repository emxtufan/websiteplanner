
import React, { useState, useEffect } from "react";
import { 
  Calculator, Plus, Trash2, Save, CreditCard, DollarSign, PieChart, 
  TrendingUp, CalendarDays, Wallet, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, HelpCircle, Lock 
} from "lucide-react";
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Button from "./ui/button";
import Input from "./ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { BudgetCategory, BudgetItem } from "../types";
import { cn } from "../lib/utils";
import { useToast } from "./ui/use-toast";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "./ui/alert-dialog";
import { PLAN_LIMITS } from "../constants"; 
import BudgetPDF from "./BudgetPDF"; // Import BudgetPDF

// Register ChartJS
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

interface BudgetViewProps {
  categories: BudgetCategory[];
  setCategories: React.Dispatch<React.SetStateAction<BudgetCategory[]>>;
  totalBudget: number;
  setTotalBudget: (val: number) => void;
  isPremium?: boolean;
  onShowUpgrade?: () => void;
  maxCalculatorBudget?: number;
  onCheckActive?: () => boolean; // New prop for restriction check
  isEventActive?: boolean; // New prop for visual state
}

const BudgetView: React.FC<BudgetViewProps> = ({ 
    categories, setCategories, totalBudget, setTotalBudget, 
    isPremium = false, onShowUpgrade, maxCalculatorBudget = 0,
    onCheckActive, isEventActive = true
}) => {
  const { toast } = useToast();
  const [calculatorInput, setCalculatorInput] = useState(totalBudget.toString());
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories.map(c => c.id)); // All expanded by default

  // --- CALCULATIONS ---
  const totalEstimated = categories.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0), 0);
  const totalFinal = categories.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + (item.finalCost || 0), 0), 0);
  const totalPaid = categories.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + (item.paidAmount || 0), 0), 0);
  const totalPending = totalFinal > 0 ? (totalFinal - totalPaid) : (totalEstimated - totalPaid);

  // --- HANDLERS ---

  const handleDistributeBudget = () => {
    if (onCheckActive && !onCheckActive()) return;

    const amount = parseFloat(calculatorInput);
    if (isNaN(amount) || amount <= 0) return;

    // --- RESTRICTION FOR FREE PLAN WITH LIMIT ---
    // If NOT premium AND the requested amount exceeds the allowed limit
    if (!isPremium && amount > maxCalculatorBudget) {
        if (onShowUpgrade) {
            toast({ 
                title: "Funcție Limitată", 
                description: `În planul gratuit poți calcula bugete până la ${maxCalculatorBudget} LEI pentru testare.`,
                variant: "default"
            });
            onShowUpgrade();
        }
        return;
    }

    setTotalBudget(amount);

    // Auto distribute based on percentages
    const newCategories = categories.map(cat => {
      const catTotal = (amount * cat.percentage) / 100;
      const itemAvg = Math.floor(catTotal / cat.items.length);
      
      const newItems = cat.items.map(item => ({
        ...item,
        estimatedCost: item.estimatedCost === 0 ? itemAvg : item.estimatedCost // Only update if 0 to not overwrite user data
      }));
      return { ...cat, items: newItems };
    });

    setCategories(newCategories);
    toast({ title: "Buget Distribuit", description: "Sumele au fost alocate automat.", variant: "success" });
  };

  const updateItem = (catId: string, itemId: string, field: keyof BudgetItem, value: any) => {
    if (onCheckActive && !onCheckActive()) return;

    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
      };
    }));
  };

  // Helper to handle numeric inputs safely
  const handleNumChange = (catId: string, itemId: string, field: keyof BudgetItem, rawValue: string) => {
      if (onCheckActive && !onCheckActive()) return;
      const val = rawValue === '' ? 0 : parseFloat(rawValue);
      updateItem(catId, itemId, field, isNaN(val) ? 0 : val);
  };

  const addItem = (catId: string) => {
    if (onCheckActive && !onCheckActive()) return;

    const category = categories.find(c => c.id === catId);
    
    // --- RESTRICTION FOR FREE PLAN ---
    if (!isPremium && category && category.items.length >= PLAN_LIMITS.free.maxBudgetItems) {
         if (onShowUpgrade) onShowUpgrade();
         return;
    }

    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const newItem: BudgetItem = {
        id: `itm-${Date.now()}`,
        name: 'Cheltuială nouă',
        estimatedCost: 0,
        finalCost: 0,
        paidAmount: 0
      };
      return { ...cat, items: [...cat.items, newItem] };
    }));
    toast({ title: "Rând adăugat" });
  };

  const deleteItem = (catId: string, itemId: string) => {
    if (onCheckActive && !onCheckActive()) return;

    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return { ...cat, items: cat.items.filter(i => i.id !== itemId) };
    }));
    toast({ title: "Cheltuială ștearsă" });
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // --- CHART DATA ---
  const chartData = {
    labels: categories.map(c => c.name),
    datasets: [{
      label: 'Cheltuieli',
      data: categories.map(cat => cat.items.reduce((sum, i) => sum + (i.finalCost || i.estimatedCost), 0)),
      backgroundColor: [
        '#f472b6', // pink-400
        '#60a5fa', // blue-400
        '#34d399', // emerald-400
        '#fbbf24', // amber-400
        '#a78bfa', // violet-400
        '#94a3b8', // slate-400
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { boxWidth: 10, padding: 15, font: { size: 10 } } }
    }
  };

  return (
    <TooltipProvider>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50 flex flex-col gap-8 h-full">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Wallet className="w-6 h-6 text-primary" /> Bugetul Nunții
              </h2>
              <p className="text-sm text-muted-foreground">
                Adio stres financiar! Planifică, urmărește și gestionează toate plățile într-un singur loc.
              </p>
            </div>
            <BudgetPDF categories={categories} totalBudget={totalBudget} />
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Buget Total
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3 h-3 text-blue-400/70" /></TooltipTrigger>
                    <TooltipContent>Limita maximă pe care ți-ai propus să o cheltui.</TooltipContent>
                  </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalBudget.toLocaleString()} LEI</div>
              <div className="text-xs text-muted-foreground mt-1">Suma maximă alocată</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-100 dark:border-purple-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Total Cheltuit
                  </CardTitle>
                   <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3 h-3 text-purple-400/70" /></TooltipTrigger>
                    <TooltipContent>Suma costurilor finale (sau estimate, unde nu ai încă factură).</TooltipContent>
                  </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {(totalFinal > 0 ? totalFinal : totalEstimated).toLocaleString()} LEI
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Estimat: {totalEstimated.toLocaleString()}</span>
                <span className={cn("font-medium", totalFinal > totalBudget ? "text-red-500" : "text-green-600")}>
                  {Math.round(((totalFinal || totalEstimated) / (totalBudget || 1)) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Rămas de Plată
                  </CardTitle>
                   <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3 h-3 text-emerald-400/70" /></TooltipTrigger>
                    <TooltipContent>Diferența dintre costul total și ce ai achitat (avansuri) până acum.</TooltipContent>
                  </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{totalPending.toLocaleString()} LEI</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 flex-1 bg-emerald-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(totalPaid / (totalFinal || totalEstimated || 1)) * 100}%` }}></div>
                </div>
                <span className="text-xs font-medium text-emerald-700">{totalPaid.toLocaleString()} achitat</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* RIGHT COLUMN (TOOLS) - Order 1 on Mobile, Order 2 on Desktop */}
          <div className="space-y-6 order-1 xl:order-2 xl:col-span-1">
            
            {/* CALCULATOR - WITH CONDITIONAL LOCK */}
            <Card className={cn("relative overflow-hidden", !isPremium && maxCalculatorBudget === 0 && "border-indigo-200")}>
              {/* LOCK OVERLAY IF LIMIT IS 0 */}
              {!isPremium && maxCalculatorBudget === 0 && (
                  <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[2px] flex items-center justify-center text-center p-6">
                      <div className="bg-white dark:bg-zinc-900 shadow-xl border p-4 rounded-xl flex flex-col items-center gap-2 max-w-[250px]">
                           <Lock className="w-8 h-8 text-indigo-500" />
                           <h4 className="font-bold text-sm">Calculator Premium</h4>
                           <p className="text-xs text-muted-foreground">Deblochează distribuirea automată a bugetului.</p>
                           <Button size="sm" onClick={onShowUpgrade} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-1">Upgrade</Button>
                      </div>
                  </div>
              )}

              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Calculator Automat
                  <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>Distribuie automat bugetul total pe categorii folosind procente standard din industrie.</TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Introdu bugetul total și noi vom estima costurile pe categorii conform mediei pieței.
                </p>
                <div className="flex gap-2">
                  <Tooltip className="flex-1">
                    <Input 
                      type="number" 
                      placeholder="Ex: 50000" 
                      value={calculatorInput}
                      onChange={(e: any) => setCalculatorInput(e.target.value)}
                      disabled={!isPremium && maxCalculatorBudget === 0}
                    />
                    <TooltipContent>Introdu bugetul tău total (LEI)</TooltipContent>
                  </Tooltip>
                  <Button onClick={handleDistributeBudget} title="Aplică distribuția" disabled={!isPremium && maxCalculatorBudget === 0}>
                    Aplică
                  </Button>
                </div>
                {!isPremium && maxCalculatorBudget > 0 && (
                    <div className="text-[10px] text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Demo Mode: Max {maxCalculatorBudget} LEI
                    </div>
                )}
              </CardContent>
            </Card>

            {/* CHART */}
            <Card className="h-[300px]">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Distribuție Cheltuieli</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <Doughnut data={chartData} options={chartOptions} />
              </CardContent>
            </Card>

            {/* UPCOMING PAYMENTS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Plăți Necesare
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.slice(0, 3).map((cat, i) => {
                  const pending = cat.items.reduce((acc, it) => acc + ((it.finalCost || it.estimatedCost) - it.paidAmount), 0);
                  if (pending <= 0) return null;
                  
                  return (
                    <div key={i} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                      <div className="flex flex-col">
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-[10px] text-muted-foreground">Restant</span>
                      </div>
                      <span className="font-bold text-red-500">{pending.toLocaleString()} LEI</span>
                    </div>
                  )
                })}
                {totalPending === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-xs flex flex-col items-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mb-2" />
                    Toate plățile sunt la zi!
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* LEFT COLUMN (BREAKDOWN) - Order 2 on Mobile, Order 1 on Desktop */}
          <div className="space-y-6 order-2 xl:order-1 xl:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-muted-foreground" /> Detaliere Cheltuieli
              </h3>
              <Button variant="outline" size="sm" onClick={() => setExpandedCategories(expandedCategories.length > 0 ? [] : categories.map(c => c.id))}>
                {expandedCategories.length > 0 ? "Restrânge Tot" : "Extinde Tot"}
              </Button>
            </div>

            {categories.map(category => {
              const catEstimate = category.items.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
              const catFinal = category.items.reduce((acc, i) => acc + (i.finalCost || 0), 0);
              const catPaid = category.items.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
              const isExpanded = expandedCategories.includes(category.id);

              return (
                <Card key={category.id} className="overflow-hidden border-l-4 border-l-primary/50">
                  <div 
                    className="p-4 flex items-center justify-between bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      <span className="font-semibold">{category.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{Math.round((catEstimate / (totalEstimated || 1)) * 100)}% din total</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="hidden sm:block text-muted-foreground">
                        Estimat: <span className="font-medium text-foreground">{catEstimate.toLocaleString()}</span>
                      </div>
                      <div className="font-bold text-foreground">
                        {catFinal > 0 ? catFinal.toLocaleString() : catEstimate.toLocaleString()} LEI
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30 border-b">
                            <tr>
                              <th className="text-left font-medium text-muted-foreground p-3 pl-6 w-[30%]">Serviciu / Produs</th>
                              <th className="text-right font-medium text-muted-foreground p-3 w-[15%]">
                                  <div className="flex items-center justify-end gap-1">
                                      Estimat
                                      <Tooltip>
                                          <TooltipTrigger><HelpCircle className="w-3 h-3" /></TooltipTrigger>
                                          <TooltipContent>Prețul de listă sau oferta inițială.</TooltipContent>
                                      </Tooltip>
                                  </div>
                              </th>
                              <th className="text-right font-medium text-muted-foreground p-3 w-[15%]">
                                  <div className="flex items-center justify-end gap-1">
                                      Final
                                      <Tooltip>
                                          <TooltipTrigger><HelpCircle className="w-3 h-3" /></TooltipTrigger>
                                          <TooltipContent>Suma finală de pe factură/contract. Are prioritate.</TooltipContent>
                                      </Tooltip>
                                  </div>
                              </th>
                              <th className="text-right font-medium text-muted-foreground p-3 w-[15%]">
                                  <div className="flex items-center justify-end gap-1">
                                      Achitat
                                      <Tooltip>
                                          <TooltipTrigger><HelpCircle className="w-3 h-3" /></TooltipTrigger>
                                          <TooltipContent>Suma totală plătită până acum (avansuri + rate).</TooltipContent>
                                      </Tooltip>
                                  </div>
                              </th>
                              <th className="text-left font-medium text-muted-foreground p-3 w-[15%] hidden sm:table-cell">Furnizor / Note</th>
                              <th className="w-[10%]"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {category.items.map(item => (
                              <tr key={item.id} className="group hover:bg-muted/10 transition-colors">
                                <td className="p-2 pl-6">
                                  <Tooltip className="w-full">
                                    <Input 
                                      className="h-8 border-transparent hover:border-input focus:border-input bg-transparent" 
                                      value={item.name}
                                      onChange={(e: any) => updateItem(category.id, item.id, 'name', e.target.value)}
                                    />
                                    <TooltipContent>Denumirea cheltuielii (ex: Avans Sala)</TooltipContent>
                                  </Tooltip>
                                </td>
                                <td className="p-2 text-right">
                                  <Tooltip className="w-full">
                                    <div className="relative group/input">
                                        <Input 
                                          type="number"
                                          className="h-8 text-right border-transparent hover:border-input focus:border-input bg-transparent" 
                                          value={item.estimatedCost === 0 ? '' : item.estimatedCost}
                                          placeholder="0"
                                          onChange={(e: any) => handleNumChange(category.id, item.id, 'estimatedCost', e.target.value)}
                                        />
                                    </div>
                                    <TooltipContent>Cât preconizezi să coste</TooltipContent>
                                  </Tooltip>
                                </td>
                                <td className="p-2 text-right">
                                  <Tooltip className="w-full">
                                    <Input 
                                      type="number"
                                      className={cn(
                                        "h-8 text-right border-transparent hover:border-input focus:border-input bg-transparent font-medium",
                                        item.finalCost > item.estimatedCost && item.estimatedCost > 0 ? "text-red-500" : ""
                                      )} 
                                      value={item.finalCost === 0 ? '' : item.finalCost}
                                      placeholder="0"
                                      onChange={(e: any) => handleNumChange(category.id, item.id, 'finalCost', e.target.value)}
                                    />
                                    <TooltipContent>Costul final real (de pe factură)</TooltipContent>
                                  </Tooltip>
                                </td>
                                <td className="p-2 text-right">
                                  <Tooltip className="w-full">
                                    <Input 
                                      type="number"
                                      className="h-8 text-right border-transparent hover:border-input focus:border-input bg-transparent text-emerald-600" 
                                      value={item.paidAmount === 0 ? '' : item.paidAmount}
                                      placeholder="0"
                                      onChange={(e: any) => handleNumChange(category.id, item.id, 'paidAmount', e.target.value)}
                                    />
                                    <TooltipContent>Cât ai achitat până acum</TooltipContent>
                                  </Tooltip>
                                </td>
                                <td className="p-2 hidden sm:table-cell">
                                  <Tooltip className="w-full">
                                    <Input 
                                      placeholder="Note..."
                                      className="h-8 border-transparent hover:border-input focus:border-input bg-transparent text-xs text-muted-foreground" 
                                      value={item.notes || ""}
                                      onChange={(e: any) => updateItem(category.id, item.id, 'notes', e.target.value)}
                                    />
                                    <TooltipContent>Detalii furnizor, deadline-uri etc.</TooltipContent>
                                  </Tooltip>
                                </td>
                                <td className="p-2 text-center">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 text-muted-foreground hover:text-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Ștergi {item.name}?</AlertDialogTitle>
                                                <AlertDialogDescription>Această acțiune nu poate fi anulată.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Anulează</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteItem(category.id, item.id)} className="bg-red-600">Șterge</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-2 bg-muted/20 border-t flex justify-center">
                        <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-muted-foreground" onClick={() => addItem(category.id)}>
                          <Plus className="w-3 h-3" /> Adaugă Cheltuială
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BudgetView;
