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
  isSent?: boolean;
  source?: 'manual' | 'public';
  openedAt?: string;
  rsvp?: {
    confirmedCount: number;
    adultsCount?: number;
    childrenCount?: number;
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

export interface TimelineItem {
  id: string;
  title: string;
  time: string;
  location: string;
  icon?: string;   // predefined key: 'bride' | 'ceremony' | 'photo' | 'entrance' | 'dance' | 'party' | 'cake' | 'bouquet' | 'end'
  notice?: string; // extra note: e.g. "Florin Salam", "Pauza foto 30 min"
}

// Sistem de blocuri flexibile pentru invitație (page builder)
export type InvitationBlockType =
  | 'location'    // Locație: oră, nume, adresă, waze
  | 'text'        // Paragraf de text liber
  | 'title'       // Titlu / heading
  | 'divider'     // Linie separatoare
  | 'spacer'      // Spațiu gol
  | 'godparents'  // Blocul cu nași
  | 'parents'     // Blocul cu părinți
  | 'family'      // Părinți & Nași combinat (Castle Magic)
  | 'date'        // Data evenimentului (hero)
  | 'description' // Paragraf scurt cu padding mic
  // ── Terra Boho extras ──
  | 'photo'       // Fotografie upload (base64)
  | 'calendar'    // Calendar luna evenimentului
  | 'countdown'   // Countdown numeric
  | 'timeline'    // Cronologia zilei
  | 'music'       // Player muzică cosmetic
  | 'dresscode'   // Cod vestimentar
  | 'gift'        // Registry cadouri / IBAN
  | 'nokids'      // Eveniment fără copii
  | 'quote'       // Citat / mesaj italic
  | 'thankyou'    // Secțiune mulțumire
  | 'whatsapp'    // Buton WhatsApp contact
  | 'rsvp';       // Formular confirmare prezență

export interface TextStyle {
  fontFamily?:    string;
  fontSize?:      number;   // px
  fontWeight?:    number;
  fontStyle?:     'normal' | 'italic';
  letterSpacing?: number;   // value * 0.01em (e.g. 10 → 0.10em)
  lineHeight?:    number;   // value * 0.01  (e.g. 160 → 1.60)
  textAlign?:     'left' | 'center' | 'right';
  color?:         string;
}

export interface InvitationBlock {
  id: string;
  type: InvitationBlockType;
  show: boolean;
  // location
  label?: string;
  time?: string;
  locationName?: string;
  locationAddress?: string;
  wazeLink?: string;
  icon?: string;
  // text / title / quote / thankyou / nokids / dresscode
  content?: string;
  // section title override (godparents / parents / dresscode / gift / nokids)
  sectionTitle?: string;
  // photo block
  imageData?: string;       // base64 data URL
  altText?: string;
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | 'free';
  photoClip?:   string;   // single clip shape: rect|rounded|circle|arch|hexagon|diagonal|blob|blob2|blob3|triangle|diamond|star|heart|squircle
  photoMasks?:  string[];  // additive mask effects: fade-b|fade-t|fade-l|fade-r|vignette|wave-b|wave-t|wave-both
  // music block
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;        // YouTube URL sau blob URL pentru MP3
  musicType?: 'youtube' | 'mp3' | 'none';
  // gift / registry block
  iban?: string;
  ibanName?: string;
  // family block (Castle Magic) — JSON string de { name1, name2 }[]
  members?: string;
  textStyles?: Record<string, TextStyle>;
  // ── Per-block styling (editable from properties panel) ───────────────────
  blockFontFamily?:    string;   // font override, e.g. 'Playfair Display'
  blockFontSize?:      number;   // px override for main text
  blockFontWeight?:    number;   // 300|400|500|600|700
  blockFontStyle?:     'normal' | 'italic';
  blockLetterSpacing?: number;   // em * 100 (e.g. 5 = 0.05em)
  blockLineHeight?:    number;   // e.g. 150 = 1.5
  blockPaddingTop?:    number;   // px, default 0
  blockPaddingBottom?: number;   // px, default 0
  blockPaddingH?:      number;   // px horizontal, default 0
  blockMarginTop?:     number;   // px, default 0
  blockMarginBottom?:  number;   // px, default 0
  blockAlign?:         'left' | 'center' | 'right';   // text alignment
  textColor?:          string;   // hex color override
  bgColor?:            string;   // hex background color
  blockRadius?:        number;   // border-radius px
  opacity?:            number;   // 0-100
  countdownTitle?: string; 
}

// backward compat alias
export type InvitationSection = InvitationBlock;

export type EventType = 'wedding' | 'baptism' | 'anniversary' | 'kids' | 'office';

export interface UserProfile {
  isSetupComplete?: boolean;
  eventName?: string;
  eventType?: EventType;
  weddingDate: string;
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
  city?: string;
  county?: string;
  country?: string;
  shippingCounty?: string;
  shippingCity?: string;
  shippingStreet?: string;
  shippingNumber?: string;
  shippingBlock?: string;
  shippingStaircase?: string;
  shippingFloor?: string;
  shippingApartment?: string;
  shippingPostalCode?: string;
  shippingLandmark?: string;
  shippingCountry?: string;
  eventRole?: string;
  billingType?: 'individual' | 'company' | string;
  billingName?: string;
  billingCompany?: string;
  billingVatCode?: string;
  billingRegNo?: string;
  billingAddress?: string;
  billingCity?: string;
  billingSector?: string;
  billingCounty?: string;
  billingCountry?: string;
  billingEmail?: string;
  billingPhone?: string;
  locationName?: string;
  locationAddress?: string;
  eventTime?: string;
  venueWazeLink?: string;
  churchTime?: string;
  churchLocationName?: string;
  churchLocationAddress?: string;
  churchWazeLink?: string;
  civilTime?: string;
  civilLocationName?: string;
  civilLocationAddress?: string;
  civilWazeLink?: string;
  timeline?: string;
  welcomeText?: string;
  celebrationText?: string;
  churchLabel?: string;
  venueLabel?: string;
  civilLabel?: string;
  inviteSlug?: string;
  // Vizibilitate secțiuni
  showWelcomeText?: boolean;
  showCelebrationText?: boolean;
  showCivil?: boolean;
  showChurch?: boolean;
  showVenue?: boolean;
  showTimeline?: boolean;
  showGodparents?: boolean;
  showParents?: boolean;
  // NOU: Countdown
  showCountdown?: boolean;
  // NOU: Buton RSVP
  rsvpButtonText?: string;        // Text custom pe buton (default: "Confirmă Prezența")
  showRsvpButton?: boolean;       // Afișează / ascunde butonul RSVP
  // NOU: Secțiuni extra custom (JSON string de InvitationSection[])
  customSections?: string;
  // ── Hero section styling ──────────────────────────────────────────────────
  heroFontFamily?:    string;
  heroNameSize?:      number;
  heroDateSize?:      number;
  heroTextColor?:     string;
  heroAlign?:         'left' | 'center' | 'right';
  heroBgColor?:       string;
  heroLetterSpacing?: number;  // * 0.01em
  heroLineHeight?:    number;  // * 0.01
  // Per-text hero styles (used by style panel for hero area)
  heroTextStyles?:    Record<string, TextStyle>;
  // Per-text intro styles (used by style panel for intro preview)
  introTextStyles?:   Record<string, TextStyle>;
  // Per-text timeline styles (used by style panel for timeline section)
  timelineTextStyles?: Record<string, TextStyle>;
  // ── CastleMagic intro ────────────────────────────────────────────────────
  heroBgImage?:          string;
  heroBgImageMobile?:    string;
  castleVideoUrl?:       string;
  castleIntroSubtitle?:  string;
  castleIntroWelcome?:   string;
  castleInviteTop?:      string;
  castleInviteMiddle?:   string;
  castleInviteBottom?:   string;
  castleInviteTag?:      string;
  jungleHeaderText?:     string;
  jungleOverlayText?:    string;
  jungleFooterText?:     string;
  jungleIntroStyle?:     'dissolve';
}

export interface PlanLimits {
    maxGuests: number;
    maxElements: number;
    maxCustomTasks: number;
    maxBudgetItems: number;
    maxCalculatorBudget?: number;
}

export interface SystemConfig {
    limits: {
        free: PlanLimits;
        basic: PlanLimits;
        premium: PlanLimits;
    };
    pricing: {
        basicPrice: number;
        premiumPrice: number;
        oldPrice?: number;
        currency: string;
    };
}

export interface PaymentRecord {
  date: string;
  amount: number;
  invoiceId: string;
  billingEmail: string;
    paymentMethod?: string;
    status: 'Paid' | 'Pending' | 'Failed';
    invoiceNumber?: string;
    invoicePdfUrl?: string;
  hostedInvoiceUrl?: string;
  relatedEventDate?: string;
  relatedEventName?: string;
  checkoutAddressSource?: "saved_account" | "manual_entry" | string;
  checkoutFirstName?: string;
  checkoutLastName?: string;
  checkoutPhone?: string;
  checkoutEmail?: string;
  checkoutCounty?: string;
  checkoutCity?: string;
  checkoutStreet?: string;
  checkoutNumber?: string;
  checkoutBlock?: string;
  checkoutStaircase?: string;
  checkoutFloor?: string;
  checkoutApartment?: string;
  checkoutPostalCode?: string;
  checkoutLandmark?: string;
  checkoutCountry?: string;
  savedAddressSnapshot?: {
    county?: string;
    city?: string;
    street?: string;
    number?: string;
    block?: string;
    staircase?: string;
    floor?: string;
    apartment?: string;
    postalCode?: string;
    landmark?: string;
    country?: string;
  };
  checkoutAddressSnapshot?: {
    county?: string;
    city?: string;
    street?: string;
    number?: string;
    block?: string;
    staircase?: string;
    floor?: string;
    apartment?: string;
    postalCode?: string;
    landmark?: string;
    country?: string;
  };
}

export interface ArchivedEvent {
    snapshotId?: string;
    eventName?: string;
    eventType: string;
    eventDate: string;
    archivedAt: string;
    guestCount: number;
    totalSpent: number;
}

export interface UserSession {
  userId: string;
  user: string;
  plan: 'free' | 'basic' | 'premium';
  profile: UserProfile;
  limits?: PlanLimits;
  token?: string;
  payments?: PaymentRecord[];
  archivedEvents?: ArchivedEvent[];
  isAdmin?: boolean;
  basicPrice?: number;
  premiumPrice?: number;
  pricing?: { basicPrice: number, premiumPrice: number, oldPrice?: number };
  isEventCompleted?: boolean;
}

export interface Task {
  id: string;
  type: string;
  tag: 'General' | 'Nunta' | 'Botez';
  title: string;
  notes?: string;
  status: 'Todo' | 'In Progress' | 'Backlog' | 'Done' | 'Canceled';
  priority: 'High' | 'Medium' | 'Low';
  isCustom?: boolean;
  dueDate?: string;
  dueTime?: string;
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
  percentage: number;
  items: BudgetItem[];
}

export type Language = 'ro';
