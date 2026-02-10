




import { Task, BudgetCategory } from "./types";

// IMPORTANT: Portul trebuie să fie 3005 (noul port al backend-ului)
export const API_URL = "http://localhost:3005/api";
export const MIN_ELEMENT_SIZE = 60;
export const FIXED_CANVAS_WIDTH = 3000;
export const FIXED_CANVAS_HEIGHT = 2000;
export const MARGIN_PX = 20;

// --- CONFIGURARE LIMITE PLAN GRATUIT ---
// Modifică aici numerele pentru a schimba restricțiile
export const PLAN_LIMITS = {
    free: {
        maxGuests: 1,          // Maxim invitați în listă
        maxElements: 5,        // Maxim mese/scaune pe plan
        maxCustomTasks: 3,     // Maxim sarcini proprii
        maxBudgetItems: 6,     // Maxim rânduri per categorie buget
        maxCalculatorBudget: 500 // Limit for budget calculator in free plan
    },
    premium: {
        maxGuests: 9999,
        maxElements: 9999,
        maxCustomTasks: 9999,
        maxBudgetItems: 9999,
        maxCalculatorBudget: 999999999
    }
};

export const translations = {
  ro: {
    candyBar: 'Candy Bar',
    mainBar: 'Bar Principal',
    photoCorner: 'Photo Corner',
    lounge: 'Zonă Lounge'
  }
};

// Helper to get a date a few days from now
const daysFromNow = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  // --- GENERALE ---
  { id: 'EVT-1001', type: 'Planning', tag: 'General', title: 'Stabilirea datei evenimentului', status: 'Todo', priority: 'High', dueDate: daysFromNow(2) },
  { id: 'EVT-1002', type: 'Planning', tag: 'General', title: 'Stabilirea bugetului total', status: 'Todo', priority: 'High', dueDate: daysFromNow(5) },
  { id: 'EVT-1003', type: 'Vendor', tag: 'General', title: 'Alegerea locației', status: 'In Progress', priority: 'High', dueDate: daysFromNow(10) },
  { id: 'EVT-1004', type: 'Vendor', tag: 'General', title: 'Semnarea contractelor principale', status: 'Backlog', priority: 'High' },
  { id: 'EVT-1005', type: 'Guest', tag: 'General', title: 'Crearea listei de invitați', status: 'Todo', priority: 'Medium', dueDate: daysFromNow(15) },
  { id: 'EVT-1006', type: 'Design', tag: 'General', title: 'Alegerea tematicii / culorilor', status: 'Backlog', priority: 'Medium' },
  { id: 'EVT-1007', type: 'Logistics', tag: 'General', title: 'Programarea evenimentului (timeline)', status: 'Todo', priority: 'High' },
  { id: 'EVT-1008', type: 'Logistics', tag: 'General', title: 'Confirmarea furnizorilor cu 7 zile înainte', status: 'Backlog', priority: 'High' },
  { id: 'EVT-1009', type: 'Post-Event', tag: 'General', title: 'Colectarea pozelor și video', status: 'Todo', priority: 'Medium' },
  { id: 'EVT-1010', type: 'Post-Event', tag: 'General', title: 'Mulțumiri invitați / follow-up', status: 'Backlog', priority: 'Low' },

  // --- NUNTA ---
  { id: 'EVT-2001', type: 'Ceremony', tag: 'Nunta', title: 'Alegerea nașilor', status: 'Done', priority: 'High' },
  { id: 'EVT-2002', type: 'Ceremony', tag: 'Nunta', title: 'Programarea cununiei civile', status: 'In Progress', priority: 'High', dueDate: daysFromNow(20) },
  { id: 'EVT-2003', type: 'Ceremony', tag: 'Nunta', title: 'Programarea cununiei religioase', status: 'Backlog', priority: 'High' },
  { id: 'EVT-2004', type: 'Vendor', tag: 'Nunta', title: 'Contract formație / DJ', status: 'Todo', priority: 'High', dueDate: daysFromNow(12) },
  { id: 'EVT-2005', type: 'Vendor', tag: 'Nunta', title: 'Fotograf & videograf', status: 'In Progress', priority: 'High' },
  { id: 'EVT-2006', type: 'Outfit', tag: 'Nunta', title: 'Alegerea rochiei de mireasă', status: 'Todo', priority: 'Medium', dueDate: daysFromNow(30) },
  { id: 'EVT-2007', type: 'Outfit', tag: 'Nunta', title: 'Costum mire', status: 'Backlog', priority: 'Medium' },
  { id: 'EVT-2008', type: 'Guest', tag: 'Nunta', title: 'Trimiterea invitațiilor', status: 'Todo', priority: 'Medium', dueDate: daysFromNow(45) },
  { id: 'EVT-2009', type: 'Party', tag: 'Nunta', title: 'Aranjare mese & seating plan', status: 'Backlog', priority: 'Medium' },
  { id: 'EVT-2010', type: 'Party', tag: 'Nunta', title: 'Moment tort & artificii', status: 'Backlog', priority: 'Low' },

  // --- BOTEZ ---
  { id: 'EVT-3001', type: 'Ceremony', tag: 'Botez', title: 'Alegerea nașilor', status: 'Done', priority: 'High' },
  { id: 'EVT-3002', type: 'Ceremony', tag: 'Botez', title: 'Programare biserică', status: 'In Progress', priority: 'High' },
  { id: 'EVT-3003', type: 'Ceremony', tag: 'Botez', title: 'Pregătirea trusoului', status: 'Todo', priority: 'High' },
  { id: 'EVT-3004', type: 'Party', tag: 'Botez', title: 'Rezervare restaurant', status: 'Backlog', priority: 'High' },
  { id: 'EVT-3005', type: 'Design', tag: 'Botez', title: 'Tematică botez (culori, personaje)', status: 'Backlog', priority: 'Medium' },
  { id: 'EVT-3006', type: 'Vendor', tag: 'Botez', title: 'Fotograf eveniment', status: 'Todo', priority: 'Medium' },
  { id: 'EVT-3007', type: 'Outfit', tag: 'Botez', title: 'Hăinuțe copil', status: 'In Progress', priority: 'Medium' },
  { id: 'EVT-3008', type: 'Guest', tag: 'Botez', title: 'Invitați familie & prieteni', status: 'Todo', priority: 'Medium' },
  { id: 'EVT-3009', type: 'Party', tag: 'Botez', title: 'Candy bar / tort tematic', status: 'Backlog', priority: 'Low' },
  { id: 'EVT-3010', type: 'Post-Event', tag: 'Botez', title: 'Albume foto & amintiri', status: 'Backlog', priority: 'Low' },
];

export const INITIAL_BUDGET_CATEGORIES: BudgetCategory[] = [
  { 
    id: 'cat-1', name: 'Locație & Mâncare', percentage: 45, items: [
      { id: 'itm-1', name: 'Închiriere Sală', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-2', name: 'Meniu Mâncare', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-3', name: 'Băuturi (Open Bar)', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-4', name: 'Tort & Candy Bar', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  },
  {
    id: 'cat-2', name: 'Foto & Video', percentage: 12, items: [
      { id: 'itm-5', name: 'Fotograf Principal', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-6', name: 'Videograf', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-7', name: 'Cabină Foto / 360', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  },
  {
    id: 'cat-3', name: 'Muzică & Atmosferă', percentage: 10, items: [
      { id: 'itm-8', name: 'Formație / Band', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-9', name: 'DJ & Sonorizare', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-10', name: 'Lumini & Scenă', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  },
  {
    id: 'cat-4', name: 'Ținute & Styling', percentage: 8, items: [
      { id: 'itm-11', name: 'Rochie de Mireasă', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-12', name: 'Costum Mire', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-13', name: 'Make-up & Hairstyle', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  },
  {
    id: 'cat-5', name: 'Flori & Decor', percentage: 10, items: [
      { id: 'itm-14', name: 'Buchet Mireasă & Nașă', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-15', name: 'Aranjamente Mese', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-16', name: 'Decor Prezidiu', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  },
  {
    id: 'cat-6', name: 'Diverse', percentage: 15, items: [
      { id: 'itm-17', name: 'Invitații & Papetărie', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-18', name: 'Transport & Cazare', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-19', name: 'Mărturii', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-20', name: 'Verighete', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  }
];