
export enum ElementType {
  TABLE = 'table',
  PRESIDIUM = 'presidium',
  STAGE = 'stage',
  DANCEFLOOR = 'dancefloor',
  DECOR = 'decor',
  ROOM = 'room'
}

export enum TableShape {
  ROUND = 'round',
  RECT = 'rect',
  SQUARE = 'square'
}

export interface Guest {
  id: string;
  name: string;
  menuType: 'standard' | 'vegetarian' | 'vegan' | 'kids' | 'special';
  isChild: boolean;
  allergies: string;
}

export interface GuestListEntry {
  _id: string;
  name: string;
  type: 'adult' | 'child' | 'family' | 'couple';
  token: string;
  status: 'pending' | 'opened' | 'confirmed' | 'declined';
  source?: 'manual' | 'public'; // New field
  openedAt?: string;
  rsvp?: {
    confirmedCount: number;
    hasChildren: boolean;
    message: string;
    dietary: string;
  }
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  shape?: TableShape;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  capacity?: number;
  name: string;
  guests?: (Guest | null)[]; 
  isStaff?: boolean;
  icon?: any;
}

export interface CanvasConfig {
  scale: number;
  panX: number;
  panY: number;
  width: number;
  height: number;
  rotation: number;
}

export interface UserProfile {
  weddingDate: string; // ISO Date string
  guestEstimate: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  partner1Name: string; 
  partner2Name: string; 
  godparents: string;
  parents: string;
  address: string;
  locationName?: string;
  locationAddress?: string;
  eventTime?: string;
}

export interface PlanLimits {
    maxGuests: number;
    maxElements: number;
    maxCustomTasks: number;
    maxBudgetItems: number;
    maxCalculatorBudget?: number; // New optional limit
}

export interface SystemConfig {
    limits: {
        free: PlanLimits;
        premium: PlanLimits;
    };
    pricing: {
        premiumPrice: number;
        oldPrice?: number; // New optional price
        currency: string;
    };
}

export interface PaymentRecord {
    date: string; 
    amount: number;
    invoiceId: string;
    billingEmail: string;
    status: 'Paid' | 'Pending' | 'Failed';
    invoicePdfUrl?: string;
    hostedInvoiceUrl?: string;
}

export interface UserSession {
  userId: string;
  user: string;
  plan: 'free' | 'premium'; 
  profile: UserProfile;
  limits?: PlanLimits;
  token?: string; // JWT Token
  payments?: PaymentRecord[];
  isAdmin?: boolean;
  premiumPrice?: number; // Fetched from server
  pricing?: { premiumPrice: number, oldPrice?: number }; // Extended pricing info
}

export interface Task {
  id: string;
  type: string; // Planning, Vendor, Guest, etc.
  tag: 'General' | 'Nunta' | 'Botez';
  title: string;
  notes?: string; // Additional details
  status: 'Todo' | 'In Progress' | 'Backlog' | 'Done' | 'Canceled';
  priority: 'High' | 'Medium' | 'Low';
  isCustom?: boolean; // True if added by user
  dueDate?: string; // ISO String for Calendar (YYYY-MM-DD)
  dueTime?: string; // HH:mm string
}

export interface BudgetItem {
  id: string;
  name: string;
  estimatedCost: number;
  finalCost: number;
  paidAmount: number;
  dueDate?: string;
  vendorName?: string;
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  percentage: number; // For auto-calculation
  items: BudgetItem[];
}

export type Language = 'ro';
