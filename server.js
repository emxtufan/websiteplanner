import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 
import rateLimit from 'express-rate-limit'; 
import helmet from 'helmet'; 
import jwt from 'jsonwebtoken'; 
import morgan from 'morgan'; 
import Stripe from 'stripe'; 
import path from 'path';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005; 

// --- CONFIGURARE PRODUCȚIE VS DEV ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding-planner';
const JWT_SECRET = process.env.JWT_SECRET || 'secret-cheie-securizata-schimba-in-prod'; 
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''; 
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_7389ce1d132933699dee9189532cfbf8867420c5f5383319351846984a46707b'; 
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'; 

// --- IMPORTANT: Pune acelasi ID aici pentru verificare (deși e opțional dacă folosești doar token decoder simplu, e recomandat pentru securitate) ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'PASTE_YOUR_GOOGLE_CLIENT_ID_HERE';

const stripe = new Stripe(STRIPE_SECRET_KEY);
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- SECURITY MIDDLEWARE ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://esm.sh", "https://accounts.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https://*", "https://lh3.googleusercontent.com"],
        connectSrc: ["'self'", "https://*", "https://accounts.google.com"],
        frameSrc: ["'self'", "https://accounts.google.com"]
      },
    },
  })
);

app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://localhost:5173',
        'https://domeniul-tau.com', 
        'http://192.168.68.105:3000',
        'https://handmade-suggest-troops-handmade.trycloudflare.com',
        process.env.CLIENT_URL 
    ].filter(Boolean), 
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
}));

// --- SCHEMAS ---
const SystemConfigSchema = new mongoose.Schema({
    key: { type: String, default: 'global_config', unique: true },
    limits: {
        free: {
            maxGuests: { type: Number, default: 1 },
            maxElements: { type: Number, default: 5 },
            maxCustomTasks: { type: Number, default: 3 },
            maxBudgetItems: { type: Number, default: 6 },
            maxCalculatorBudget: { type: Number, default: 500 }
        },
        premium: {
            maxGuests: { type: Number, default: 9999 },
            maxElements: { type: Number, default: 9999 },
            maxCustomTasks: { type: Number, default: 9999 },
            maxBudgetItems: { type: Number, default: 9999 },
            maxCalculatorBudget: { type: Number, default: 999999999 }
        }
    },
    pricing: {
        premiumPrice: { type: Number, default: 4900 },
        oldPrice: { type: Number, default: 10000 },
        currency: { type: String, default: 'ron' }
    },
    servicesComingSoon: { type: Boolean, default: false }
});


// ── Template Defaults — setari globale per template (admin) ──────────────
const TemplateDefaultsSchema = new mongoose.Schema({
    templateId: { type: String, required: true, unique: true },
    colorTheme:             { type: String, default: 'default' },
    heroBgImage:            { type: String, default: null },
    heroBgImageMobile:      { type: String, default: null },
    heroContentImage:       { type: String, default: null },
    heroContentImageMobile: { type: String, default: null },
    castleIntroWelcome:     { type: String, default: 'WELCOME' },
    castleIntroSubtitle:    { type: String, default: 'into my little kingdom' },
    castleInviteTop:        { type: String, default: 'Cu multa bucurie va anuntam' },
    jungleHeaderText:       { type: String, default: 'Save The Date' },
    jungleOverlayText:      { type: String, default: 'Cu bucurie va invitam sa fiti parte din povestea noastra.' },
    jungleFooterText:       { type: String, default: '' },
    jungleIntroStyle:       { type: String, default: 'dissolve' },
    castleInviteMiddle:     { type: String, default: '' },
    castleInviteBottom:     { type: String, default: 'va fii botezata' },
    castleInviteTag:        { type: String, default: 'deschide portile' },
    videoUrl:               { type: String, default: null },
    introVariants:          { type: Object, default: {} },   // { [id]: { label, desktop, mobile } }
    defaultIntroVariant:    { type: String, default: null },
    updatedAt:              { type: Date, default: Date.now },
}, { strict: false });
const TemplateDefaults = mongoose.model('TemplateDefaults', TemplateDefaultsSchema);

const PaymentSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    amount: Number,
    invoiceId: String,
    billingEmail: String,
    invoicePdfUrl: String, 
    hostedInvoiceUrl: String,
    status: { type: String, default: 'Paid' },
    relatedEventDate: Date,
    relatedEventName: String // Added to track which event was paid for
});

const ArchivedSnapshotSchema = new mongoose.Schema({
    ownerId: String,
    createdAt: { type: Date, default: Date.now },
    data: Object // Stores the full dump: { profile, project, guests }
});

const UserSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true }, 
  pass: { type: String }, // Optional for Google Auth users
  authProvider: { type: String, default: 'local' }, // 'local' or 'google'
  googleId: String,
  plan: { type: String, default: 'free', enum: ['free', 'premium'] },
  isAdmin: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now }, 
  payments: [PaymentSchema],
  // History of past events
  archivedEvents: [{
      snapshotId: String, // ID referencing ArchivedSnapshot
      eventName: String,
      eventType: String,
      eventDate: Date,
      archivedAt: { type: Date, default: Date.now },
      guestCount: Number,
      totalSpent: Number
  }],
  profile: {
    isSetupComplete: { type: Boolean, default: false }, // NEW FLAG: Forces onboarding
    eventName: String, // Custom name: "Nunta Mariei si Ion"
    eventType: { type: String, default: 'wedding' },
    weddingDate: Date,
    guestEstimate: Number,
    partner1Name: String,
    partner2Name: String,
    firstName: String,
    lastName: String,
    phone: String,
    email: String, 
    address: String,
    godparents: String,
    parents: String,
    locationName: String,
    locationAddress: String,
    eventTime: String,
    venueWazeLink: String,
    churchTime: String,
    churchLocationName: String,
    churchLocationAddress: String,
    churchWazeLink: String,
    civilTime: String,
    civilLocationName: String,
    civilLocationAddress: String,
    civilWazeLink: String,
    timeline: String,
    welcomeText: String,
    celebrationText: String,
    churchLabel: String,
    venueLabel: String,
    civilLabel: String,
    inviteSlug: { type: String, lowercase: true, trim: true },
    avatarUrl: String,
    // Flag-uri vizibilitate
    showWelcomeText: { type: Boolean, default: true },
    showCelebrationText: { type: Boolean, default: true },
    showCivil: { type: Boolean, default: true },
    showChurch: { type: Boolean, default: true },
    showVenue: { type: Boolean, default: true },
    showTimeline: { type: Boolean, default: true },
    showGodparents: { type: Boolean, default: true },
    showParents: { type: Boolean, default: true },
    // Câmpuri noi pentru invitație
    showCountdown: { type: Boolean, default: true },
    showRsvpButton: { type: Boolean, default: true },
    rsvpButtonText: { type: String, default: '' },
    customSections: { type: String, default: '[]' },
    // ── Hero styling ──────────────────────────────────────────────────────
    heroFontFamily:    String,
    heroNameSize:      Number,
    heroDateSize:      Number,
    heroTextColor:     String,
    heroAlign:         String,
    heroBgColor:       String,
    heroLetterSpacing: Number,
    heroLineHeight:    Number,
    // ── CastleMagic intro ─────────────────────────────────────────────────
    heroBgImage:         String,
    heroBgImageMobile:   String,
    castleIntroSubtitle: String,
    castleIntroWelcome:  String,
    castleInviteTop:     String,
    jungleHeaderText:    String,
    jungleOverlayText:   String,
    jungleFooterText:    String,
    jungleIntroStyle:    String,
    castleInviteMiddle:  String,
    castleInviteBottom:  String,
    castleInviteTag:     String,
    // ── Camp-uri salvate cu strict:false — trebuie declarate explicit ────────
    heroContentImage:       String,
    heroContentImageMobile: String,
    colorTheme:             String,
  }
}, { strict: false });

const ProjectSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  name: { type: String, default: "Sala Principală" },
  slug: { type: String, default: "eveniment" },
  selectedTemplate: { type: String, default: "classic" },
  elements: { type: Array, default: [] },
  tasks: { type: Array, default: [] },
  budget: { type: Array, default: [] }, 
  totalBudget: { type: Number, default: 0 }, 
  updatedAt: { type: Date, default: Date.now }
});

const GuestSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: 'adult' },
  token: { type: String, required: true, unique: true },
  status: { type: String, default: 'pending' },
  openedAt: Date,
  isSent: { type: Boolean, default: false }, // TRACKING: Daca a fost trimis
  source: { type: String, default: 'manual' }, 
  rsvp: {
    confirmedCount: { type: Number, default: 0 },
    adultsCount: { type: Number, default: 0 },
    childrenCount: { type: Number, default: 0 },
    hasChildren: { type: Boolean, default: false },
    message: String,
    dietary: String
  }
});

const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Guest = mongoose.model('Guest', GuestSchema);
const ArchivedSnapshot = mongoose.model('ArchivedSnapshot', ArchivedSnapshotSchema);
const SystemConfig = mongoose.model('SystemConfig', SystemConfigSchema);

const InvitationTemplateSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    category: { type: String, default: 'wedding' },
    colors: [String],
    previewClass: String,
    elementsClass: String,
    thumbnailUrl: String,
    customStyles: String, // CSS string
    reactCode: String, // The actual React component code
    config: Object, // Extra config like font families, background positions, etc.
    isActive: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const InvitationTemplate = mongoose.model('InvitationTemplate', InvitationTemplateSchema);

// ── Marketplace Service Schema ────────────────────────────────────────────────
const ServiceSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    category:    { type: String, required: true, default: 'altele' },
    description: { type: String, default: '' },
    priceFrom:   { type: Number, default: 0 },
    priceTo:     { type: Number },
    priceUnit:   { type: String, default: 'total', enum: ['total','perPerson','perHour','negociabil'] },
    location:    { type: String, default: '' },
    phone:       { type: String },
    email:       { type: String },
    website:     { type: String },
    instagram:   { type: String },
    imageUrl:    { type: String },
    rating:      { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    tags:        [String],
    featured:    { type: Boolean, default: false },
    available:   { type: Boolean, default: true },
    createdAt:   { type: Date, default: Date.now },
});
const Service = mongoose.model('Service', ServiceSchema);
// ── Service Requests Schema ───────────────────────────────────────────────────
const ServiceRequestSchema = new mongoose.Schema({
  serviceId:       { type: String, required: true },
  serviceName:     { type: String, required: true },
  serviceCategory: { type: String, default: '' },
  name:            { type: String, required: true },
  email:           { type: String, required: true },
  phone:           { type: String, required: true },
  address:         { type: String, default: '' },
  contactTime:     { type: String, default: 'Oricând' },
  budget:          { type: String, default: '' },
  gdprAccepted:    { type: Boolean, default: false },
  callApproved:    { type: Boolean, default: false },
  status:          { type: String, enum: ['pending','sent_to_provider','finalized'], default: 'pending' },
  notes:           { type: String, default: '' },
  createdAt:       { type: Date, default: Date.now },
});
const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema);




const getConfig = async () => {
    let config = await SystemConfig.findOne({ key: 'global_config' });
    if (!config) {
        config = new SystemConfig();
        await config.save();
    }
    return config;
};

// --- HELPER: CHECK IF EVENT IS COMPLETED (24 HOURS AFTER) ---
const isEventCompleted = (weddingDate) => {
    if (!weddingDate) return false;
    const eventDate = new Date(weddingDate);
    // Expire 24 hours after the event date
    const oneDayAfter = new Date(eventDate);
    oneDayAfter.setDate(eventDate.getDate() + 1);
    return new Date() > oneDayAfter;
};

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) return res.sendStatus(401); 
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); 
    req.user = user; 
    next();
  });
};

const authenticateAdmin = async (req, res, next) => {
    authenticateToken(req, res, async () => {
        const user = await User.findById(req.user.userId);
        if (user && user.isAdmin) {
            next();
        } else {
            res.status(403).send({ error: 'Admin access required.' });
        }
    });
};

// --- NEW MIDDLEWARE: ENFORCE ACTIVE EVENT ONLY ---
// This middleware blocks write operations if the event is completed (past due + 1 day)
const ensureActiveEvent = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.sendStatus(404);

        if (isEventCompleted(user.profile.weddingDate)) {
            return res.status(403).send({ 
                error: 'Event Finished', 
                message: 'Acest eveniment a expirat (Offline). Arhivează-l pentru a începe unul nou.' 
            });
        }
        next();
    } catch (e) {
        res.status(500).send({ error: 'Check Failed' });
    }
};

// --- STRIPE WEBHOOK ---
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const customerEmail = session.customer_details?.email;
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0; 

    try {
        let invoicePdfUrl = null;
        let hostedInvoiceUrl = null;

        if (session.invoice) {
            try {
                const invoice = await stripe.invoices.retrieve(session.invoice);
                invoicePdfUrl = invoice.invoice_pdf;
                hostedInvoiceUrl = invoice.hosted_invoice_url;
            } catch (invErr) {
                console.error("⚠️ Failed to retrieve invoice details:", invErr.message);
            }
        }

        const user = await User.findById(userId);
        const relatedEventDate = user?.profile?.weddingDate;
        const relatedEventName = user?.profile?.eventName || 'Eveniment Nedenumit';

        const newPayment = {
            date: new Date(),
            amount: amountTotal,
            invoiceId: session.invoice || session.id,
            billingEmail: customerEmail,
            invoicePdfUrl: invoicePdfUrl,
            hostedInvoiceUrl: hostedInvoiceUrl,
            status: 'Paid',
            relatedEventDate: relatedEventDate,
            relatedEventName: relatedEventName // Store the name for history
        };

        await User.findByIdAndUpdate(userId, {
            plan: 'premium',
            $push: { payments: newPayment }
        });
    } catch (dbError) {
        console.error('❌ Database Update Failed:', dbError);
    }
  }

  res.json({ received: true });
});

// --- STANDARD MIDDLEWARE ---
app.use(morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    skip: (req) => {
        const authHeader = req.headers['authorization'];
        return authHeader && authHeader.startsWith('Bearer ');
    },
    message: 'Prea multe cereri de la acest IP.'
});
// app.use('/api/', limiter);

// ─── Default wedding blocks — used on setup AND when customSections is empty ──
const WEDDING_DEFAULT_BLOCKS = JSON.stringify([

                // ════════════════════════════════════════════════════════
                // FOTO 1 — Cuplu hero (arc + fade jos) — ca în preview
                // ════════════════════════════════════════════════════════
                {
                    id: "block-photo-1",
                    type: "photo",
                    show: true,
                    imageData: "https://picsum.photos/seed/terra-w1/400/533",
                    altText: "Fotografie cuplu",
                    aspectRatio: "3:4",
                    photoClip: "arch",
                    photoMasks: ["fade-b"]
                },

                // ════════════════════════════════════════════════════════
                // CITAT
                // ════════════════════════════════════════════════════════
                {
                    id: "block-quote-1",
                    type: "quote",
                    show: true,
                    content: "Dragostea noastră s-a născut în Dios, crește în Cristos și va rămâne prin harul Său.",
                    label: "1 Corinteni 13:4"
                },

                // ════════════════════════════════════════════════════════
                // MUZICĂ
                // ════════════════════════════════════════════════════════
                {
                    id: "block-music-1",
                    type: "music",
                    show: true,
                    musicTitle: "Cântecul nostru",
                    musicArtist: "Artist",
                    musicUrl: "",
                    musicType: "none"
                },

                // ════════════════════════════════════════════════════════
                // COUNTDOWN — dark section
                // ════════════════════════════════════════════════════════
                {
                    id: "block-countdown-1",
                    type: "countdown",
                    show: true
                },

                // ════════════════════════════════════════════════════════
                // CALENDAR
                // ════════════════════════════════════════════════════════
                {
                    id: "block-calendar-1",
                    type: "calendar",
                    show: true
                },

                // ════════════════════════════════════════════════════════
                // FOTO 2 — Landscape romantic
                // ════════════════════════════════════════════════════════
                {
                    id: "block-photo-2",
                    type: "photo",
                    show: true,
                    imageData: "https://picsum.photos/seed/terra-w2/800/450",
                    altText: "Fotografie romantic",
                    aspectRatio: "16:9",
                    photoClip: "rounded",
                    photoMasks: []
                },

                // ════════════════════════════════════════════════════════
                // FOTO 3 — Portret vertical
                // ════════════════════════════════════════════════════════
                {
                    id: "block-photo-3",
                    type: "photo",
                    show: true,
                    imageData: "https://picsum.photos/seed/terra-w3/400/533",
                    altText: "Fotografie portret",
                    aspectRatio: "3:4",
                    photoClip: "rounded",
                    photoMasks: []
                },

                // ════════════════════════════════════════════════════════
                // PĂRINȚI
                // ════════════════════════════════════════════════════════
                {
                    id: "block-parents-1",
                    type: "parents",
                    show: true,
                    sectionTitle: "Părinții Noștri",
                    content: "Cu drag și recunoștință, alături de părinții noștri:"
                },

                // ════════════════════════════════════════════════════════
                // NAȘI
                // ════════════════════════════════════════════════════════
                {
                    id: "block-godparents-1",
                    type: "godparents",
                    show: true,
                    sectionTitle: "Nașii Noștri",
                    content: "Alături de nașii noștri, care ne-au călăuzit pașii:"
                },

                // ════════════════════════════════════════════════════════
                // LOCAȚII
                // ════════════════════════════════════════════════════════
                {
                    id: "block-loc-civil",
                    type: "location",
                    show: true,
                    label: "Cununie Civilă",
                    time: "12:00",
                    locationName: "Starea Civilă",
                    locationAddress: "Str. Exemplu nr. 1, Oraș",
                    wazeLink: ""
                },
                {
                    id: "block-loc-church",
                    type: "location",
                    show: true,
                    label: "Cununie Religioasă",
                    time: "14:00",
                    locationName: "Biserica Sfânta Maria",
                    locationAddress: "Str. Bisericii nr. 5, Oraș",
                    wazeLink: ""
                },
                {
                    id: "block-loc-party",
                    type: "location",
                    show: true,
                    label: "Petrecere",
                    time: "18:00",
                    locationName: "Salon Grand Ballroom",
                    locationAddress: "Str. Petrecerii nr. 10, Oraș",
                    wazeLink: ""
                },

                // ════════════════════════════════════════════════════════
                // FOTO 4 — Cerc cu vignetă
                // ════════════════════════════════════════════════════════
                {
                    id: "block-photo-4",
                    type: "photo",
                    show: true,
                    imageData: "https://picsum.photos/seed/terra-w4/400/400",
                    altText: "Fotografie",
                    aspectRatio: "1:1",
                    photoClip: "circle",
                    photoMasks: ["vignette"]
                },

                // ════════════════════════════════════════════════════════
                // COD VESTIMENTAR
                // ════════════════════════════════════════════════════════
                {
                    id: "block-dresscode-1",
                    type: "dresscode",
                    show: true,
                    sectionTitle: "Cod vestimentar",
                    label: "Elegant",
                    content: "Doamne: Vă rugăm să evitați culorile alb, bej și roșu.\nDomni: Vă rugăm să evitați culoarea bej și tonurile similare."
                },

                // ════════════════════════════════════════════════════════
                // CADOURI
                // ════════════════════════════════════════════════════════
                {
                    id: "block-gift-1",
                    type: "gift",
                    show: true,
                    sectionTitle: "Sugestie de cadou",
                    content: "Cel mai frumos cadou este prezența voastră. Dacă doriți un detaliu, vă lăsăm mai jos o opțiune.",
                    iban: "RO00 BANK 0000 0000 0000 0000",
                    ibanName: "Camila & Sebastián"
                },

                // ════════════════════════════════════════════════════════
                // FĂRĂ COPII
                // ════════════════════════════════════════════════════════
                {
                    id: "block-nokids-1",
                    type: "nokids",
                    show: true,
                    sectionTitle: "Eveniment fără copii",
                    content: "Nunta noastră va fi un eveniment pentru adulți. Vă rugăm să luați în considerare îngrijirea copiilor în această zi specială. Vă mulțumim pentru înțelegere!"
                },

                // ════════════════════════════════════════════════════════
                // FOTO 5 — Final blob
                // ════════════════════════════════════════════════════════
                {
                    id: "block-photo-5",
                    type: "photo",
                    show: true,
                    imageData: "https://picsum.photos/seed/terra-w5/400/533",
                    altText: "Fotografie finală",
                    aspectRatio: "3:4",
                    photoClip: "blob",
                    photoMasks: ["fade-b"]
                },

                // ════════════════════════════════════════════════════════
                // MULȚUMIRE
                // ════════════════════════════════════════════════════════
                {
                    id: "block-thankyou-1",
                    type: "thankyou",
                    show: true,
                    content: "Vă așteptăm cu drag!",
                    label: "ESPERAMOS CONTAR CON SU PRESENCIA"
                }


]);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- MONGODB CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => { console.log('✅ Connected to MongoDB'); seedServices(); })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- UTILS ---
const generateToken = () => Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

// --- ROUTES ---

// AUTH LOCAL
app.post('/api/register', async (req, res) => {
  try {
    const { user, pass } = req.body; 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user || !emailRegex.test(user)) {
        return res.status(400).send({ error: 'Adresa de email este obligatorie și trebuie să fie validă.' });
    }
    if (!pass || pass.length < 6) {
        return res.status(400).send({ error: 'Parola trebuie să aibă minim 6 caractere.' });
    }

    const existingUser = await User.findOne({ user });
    if (existingUser) return res.status(400).send({ error: 'Există deja un cont cu acest email.' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);
    
    const isFirstUser = (await User.countDocuments({})) === 0;

    const newUser = new User({
      user, 
      pass: hashedPassword, 
      authProvider: 'local',
      plan: 'free',
      isAdmin: isFirstUser, 
      profile: { 
          email: user,
          isSetupComplete: false, // Forces setup modal on first login
          // Default values are empty now until setup
          eventType: 'wedding',
          guestEstimate: 150 
      }
    });
    
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id, plan: 'free' }, JWT_SECRET, { expiresIn: '7d' });
    res.send({ success: true, userId: newUser._id, plan: 'free', token });
  } catch (error) { res.status(500).send({ error: 'Server error' }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { user, pass } = req.body;
    const foundUser = await User.findOne({ user });
    if (!foundUser) return res.status(401).send({ error: 'Datele de autentificare sunt incorecte.' });
    
    if (foundUser.authProvider === 'google' && !foundUser.pass) {
        return res.status(401).send({ error: 'Acest cont folosește autentificarea Google.' });
    }

    const isMatch = await bcrypt.compare(pass, foundUser.pass);
    if (isMatch) {
      const config = await getConfig();
      const limits = config.limits[foundUser.plan || 'free'];
      const price = config.pricing.premiumPrice;
      const isCompleted = isEventCompleted(foundUser.profile.weddingDate);

      const token = jwt.sign({ userId: foundUser._id, plan: foundUser.plan || 'free' }, JWT_SECRET, { expiresIn: '7d' });
      res.send({ 
        success: true, user: foundUser.user, userId: foundUser._id, 
        plan: foundUser.plan || 'free', 
        isAdmin: foundUser.isAdmin, 
        profile: foundUser.profile, 
        payments: foundUser.payments || [],
        archivedEvents: foundUser.archivedEvents || [], 
        limits: limits, 
        premiumPrice: price,
        pricing: config.pricing, 
        isEventCompleted: isCompleted, 
        token: token 
      });
    } else { res.status(401).send({ error: 'Datele de autentificare sunt incorecte.' }); }
  } catch (error) { res.status(500).send({ error: 'Server error' }); }
});

// AUTH GOOGLE
app.post('/api/google-auth', async (req, res) => {
    try {
        const { token } = req.body;
        
        let ticket;
        try {
            if (GOOGLE_CLIENT_ID.includes("PASTE_YOUR")) {
                 return res.status(500).send({ error: 'Server configuration error: GOOGLE_CLIENT_ID missing' });
            }

            ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID,
            });
        } catch (e) {
            console.error("Google verify error:", e);
            return res.status(400).send({ error: 'Invalid Google Token' });
        }

        const payload = ticket.getPayload();
        const { email, sub, name, picture } = payload;

        let user = await User.findOne({ user: email });

        if (!user) {
            const isFirstUser = (await User.countDocuments({})) === 0;
            const [firstName, ...lastNameParts] = (name || '').split(' ');
            
            user = new User({
                user: email,
                authProvider: 'google',
                googleId: sub,
                plan: 'free',
                isAdmin: isFirstUser,
                profile: {
                    email: email,
                    isSetupComplete: false,
                    firstName: firstName || '',
                    lastName: lastNameParts.join(' ') || '',
                    avatarUrl: picture,
                    eventType: 'wedding',
                    guestEstimate: 150
                }
            });
            await user.save();
        } else {
            if (user.authProvider === 'local' && !user.googleId) {
                user.googleId = sub;
            }
            if (!user.profile.avatarUrl && picture) {
                user.profile.avatarUrl = picture;
                await user.save();
            }
        }

        const config = await getConfig();
        const limits = config.limits[user.plan || 'free'];
        const price = config.pricing.premiumPrice;
        const isCompleted = isEventCompleted(user.profile.weddingDate);

        const sessionToken = jwt.sign({ userId: user._id, plan: user.plan || 'free' }, JWT_SECRET, { expiresIn: '7d' });
        
        res.send({ 
            success: true, 
            user: user.user, 
            userId: user._id, 
            plan: user.plan || 'free', 
            isAdmin: user.isAdmin, 
            profile: user.profile, 
            payments: user.payments || [],
            archivedEvents: user.archivedEvents || [],
            limits: limits, 
            premiumPrice: price,
            pricing: config.pricing, 
            isEventCompleted: isCompleted,
            token: sessionToken 
        });

    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'Authentication failed' });
    }
});


// ── Helper: filtreaza undefined/null din profil inainte de merge ─────────────
// Previne ca 'undefined' explicit din profilul userului sa suprascrie defaults
function cleanProfileForMerge(profile) {
    if (!profile) return {};
    return Object.fromEntries(
        Object.entries(profile).filter(([, v]) => v !== null && v !== undefined)
    );
}

app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    let user = await User.findById(req.user.userId);
    if (!user) return res.status(404).send({ error: 'User not found' });

    // ── Auto-inject default blocks if user has none ───────────────────────
    // Handles: existing users, accounts created before default blocks existed
    if (user.profile?.isSetupComplete) {
      let sections = [];
      try { sections = JSON.parse(user.profile?.customSections || '[]'); } catch {}
      if (!sections.length) {
        await User.findByIdAndUpdate(req.user.userId, {
          $set: { 'profile.customSections': WEDDING_DEFAULT_BLOCKS }
        });
        user = await User.findById(req.user.userId); // re-fetch with updated data
      }
    }
    
    const config = await getConfig();
    const limits = config.limits[user.plan || 'free'];
    const price = config.pricing.premiumPrice;
    const isCompleted = isEventCompleted(user.profile.weddingDate);

    // ── Merge template defaults < user profile ────────────────────────────
    // Citim template-ul ales din project
    const userProject = await Project.findOne({ ownerId: user._id });
    const templateId = userProject?.selectedTemplate || 'castle-magic';
    const tplDoc = await TemplateDefaults.findOne({ templateId });
    let mergedProfile = user.profile || {};
    if (tplDoc) {
        const tplRaw = tplDoc.toObject();
        delete tplRaw._id; delete tplRaw.__v; delete tplRaw.templateId; delete tplRaw.updatedAt;
        // Null/empty string din defaults nu suprascriu profilul userului
        const cleanDefaults = Object.fromEntries(
            Object.entries(tplRaw).filter(([, v]) => v !== null && v !== undefined && v !== '')
        );
        // user profile are prioritate: daca userul a setat ceva, ramane ce a setat el
        mergedProfile = { ...cleanDefaults, ...cleanProfileForMerge(user.profile?.toObject ? user.profile.toObject() : user.profile) };
    }

    res.send({ 
        success: true, 
        user: user.user, 
        userId: user._id, 
        plan: user.plan || 'free', 
        isAdmin: user.isAdmin, 
        profile: mergedProfile, 
        payments: user.payments || [],
        archivedEvents: user.archivedEvents || [],
        limits: limits, 
        premiumPrice: price,
        pricing: config.pricing,
        isEventCompleted: isCompleted
    });
  } catch (error) {
    res.status(500).send({ error: 'Server error' });
  }
});

// --- NEW ROUTE: SETUP EVENT (ONBOARDING) ---
app.post('/api/user/setup-event', authenticateToken, async (req, res) => {
    try {
        const { eventType, weddingDate, eventName } = req.body;
        
        if (!eventType || !weddingDate) {
            return res.status(400).send({ error: 'Tipul și data evenimentului sunt obligatorii.' });
        }

        // Default blocks & data per event type
        const defaultData = {};

        if (eventType === 'wedding') {
            // ── Demo names & texts (matches the template preview) ──────────
            defaultData["profile.partner1Name"] = "Camila";
            defaultData["profile.partner2Name"] = "Sebastián";
            defaultData["profile.welcomeText"] = "Ne bucurăm să anunțăm căsătoria noastră și dorim să împărțim cu tine acest moment special.";
            defaultData["profile.celebrationText"] = "nunții noastre";
            defaultData["profile.showWelcomeText"] = true;
            defaultData["profile.showCelebrationText"] = true;
            defaultData["profile.showCountdown"] = true;
            defaultData["profile.showRsvpButton"] = true;
            defaultData["profile.rsvpButtonText"] = "Confirmă Prezența";
            defaultData["profile.godparents"] = JSON.stringify([
                { godfather: "Prenume Naș", godmother: "Prenume Nașă" }
            ]);
            defaultData["profile.parents"] = JSON.stringify({
                p1_father: "Tatăl Miresei",
                p1_mother: "Mama Miresei",
                p2_father: "Tatăl Mirelui",
                p2_mother: "Mama Mirelui",
                others: []
            });
            defaultData["profile.customSections"] = WEDDING_DEFAULT_BLOCKS;
        }

        await User.findByIdAndUpdate
        await User.findByIdAndUpdate(req.user.userId, {
            $set: {
                "profile.eventName": eventName || `Eveniment ${eventType}`,
                "profile.eventType": eventType,
                "profile.weddingDate": new Date(weddingDate),
                "profile.isSetupComplete": true,
                ...defaultData
            }
        });

        res.send({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'Setup failed.' });
    }
});

// --- NEW ROUTE: ARCHIVE AND RESET EVENT ---
app.post('/api/user/archive-event', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).send({ error: 'User not found' });

        // Use lean() to get plain JS objects for archiving
        const project = await Project.findOne({ ownerId: userId }).lean();
        const guests = await Guest.find({ ownerId: userId }).lean();
        
        // 1. SAVE FULL SNAPSHOT
        const snapshot = new ArchivedSnapshot({
            ownerId: userId,
            data: {
                profile: user.profile,
                project: project || {}, // Ensure project is at least empty object
                guests: guests || []
            }
        });
        await snapshot.save();

        const archiveEntry = {
            snapshotId: snapshot._id.toString(), // Store reference as string explicitly
            eventName: user.profile.eventName,
            eventType: user.profile.eventType,
            eventDate: user.profile.weddingDate,
            archivedAt: new Date(),
            guestCount: guests ? guests.length : 0,
            totalSpent: project ? project.totalBudget : 0
        };

        // 2. DELETE OLD DATA
        await Guest.deleteMany({ ownerId: userId });
        await Project.deleteMany({ ownerId: userId });

        const resetProfile = {
            ...user.profile.toObject(),
            isSetupComplete: false, // Forces user to setup again!
            eventName: "", // Reset name
            weddingDate: null, 
            eventTime: "",
            locationName: "",
            locationAddress: "",
            venueWazeLink: "",
            timeline: "",
            budget: 0,
            inviteSlug: ""
        };

        await User.findByIdAndUpdate(userId, {
            $push: { archivedEvents: archiveEntry },
            $set: { 
                profile: resetProfile,
                plan: 'free' 
            }
        });

        res.send({ success: true, message: 'Eveniment arhivat. Puteți începe planificarea noului eveniment.' });

    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'Nu am putut arhiva evenimentul.' });
    }
});

// --- NEW ROUTE: GET ARCHIVED SNAPSHOT ---
app.get('/api/archived-event/:snapshotId', authenticateToken, async (req, res) => {
    try {
        const snapshot = await ArchivedSnapshot.findOne({ _id: req.params.snapshotId, ownerId: req.user.userId });
        if (!snapshot) return res.status(404).send({ error: 'Arhivă inexistentă.' });
        res.send(snapshot.data);
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'Server error' });
    }
});

// --- DATA MODIFICATION ROUTES (Protected by ensureActiveEvent) ---

// ─── Media upload — folder ierarhic per user ─────────────────────────────────
//
//  Structură: uploads/{userId[0..1]}/{userId[2..3]}/{userId}/{timestamp}-{random}.jpg
//  Exemplu:   uploads/5f/3a/5f3ab2c1d.../1700000000-x7k2.jpg
//
//  De ce sharding pe 2 nivele:
//  - 100k useri × 8 poze = 800k fișiere total
//  - Cu 2 nivele hex (256 × 256 = 65536 bucket-uri) → avg 12 fișiere/folder
//  - readdir() rapid, backup selectiv, cleanup la ștergere cont

const UPLOADS_ROOT = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_ROOT)) fs.mkdirSync(UPLOADS_ROOT, { recursive: true });

// Returnează path-ul directorului pentru un userId și îl creează dacă nu există
function userUploadDir(userId) {
    const uid   = String(userId);
    const shard = uid.slice(-4, -2) || 'xx';  // ultimele 4 chars → 2 nivele
    const shard2= uid.slice(-2) || 'xx';
    const dir   = path.join(UPLOADS_ROOT, shard, shard2, uid);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

// Multer storage cu destination dinamic per user
const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        try {
            const dir = userUploadDir(req.user.userId);
            cb(null, dir);
        } catch (e) { cb(e, ''); }
    },
    filename: (_req, file, cb) => {
        const ext  = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.jpg';
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        cb(null, name);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 32 * 1024 * 1024 }, // 32 MB — audio files pot fi mai mari
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'image/jpeg','image/png','image/webp','image/gif','image/avif',
            'audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/aac',
            'audio/x-m4a','audio/mp4','video/mp4',
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Format neacceptat. Sunt permise imagini si fisiere audio.'));
    },
});

// Serve uploads ca static — cu cache headers agresive (imaginile nu se schimbă)
app.use('/uploads', express.static(UPLOADS_ROOT, {
    maxAge: '365d',          // browser cache 1 an
    immutable: true,         // nu re-validează niciodată
    etag: true,
}));

// POST /api/upload — un singur fișier, returnează { url, size }
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Niciun fișier primit.' });
        const uid   = String(req.user.userId);
        const shard = uid.slice(-4, -2) || 'xx';
        const shard2= uid.slice(-2) || 'xx';
        const url   = `/uploads/${shard}/${shard2}/${uid}/${req.file.filename}`;
        res.json({ url, size: req.file.size });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/download-yt-audio — descarcă audio de pe YouTube cu @ybd-project/ytdl-core
app.post('/api/download-yt-audio', authenticateToken, async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL lipsă.' });

    const ytIdMatch = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (!ytIdMatch) return res.status(400).json({ error: 'URL YouTube invalid.' });
    const cleanUrl = `https://www.youtube.com/watch?v=${ytIdMatch[1]}`;

    try {
        const { YtdlCore, toPipeableStream } = await import('@ybd-project/ytdl-core');

        // 1. Metadata
        let title = '', author = '';
        try {
            const info = await YtdlCore.getInfo(cleanUrl);
            title  = info.videoDetails?.title || '';
            author = info.videoDetails?.author || info.videoDetails?.ownerChannelName || '';
            console.log('[ytdl] downloading:', title, 'by', author);
        } catch (e) {
            console.warn('[ytdl] metadata warn:', e.message);
        }

        // 2. Salvează audio
        const uid   = String(req.user.userId);
        const dir   = userUploadDir(uid);
        const fname = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webm`;
        const fpath = path.join(dir, fname);

        await new Promise((resolve, reject) => {
            // toPipeableStream primește URL + opțiuni, returnează un stream Node.js
            const pipeable = toPipeableStream(cleanUrl, {
                filter: 'audioonly',
                quality: 'highestaudio',
            });
            const file = fs.createWriteStream(fpath);
            pipeable.pipe(file);
            pipeable.on('error', reject);
            file.on('finish', resolve);
            file.on('error', reject);
        });

        const shard   = uid.slice(-4, -2) || 'xx';
        const shard2  = uid.slice(-2)     || 'xx';
        const fileUrl = `/uploads/${shard}/${shard2}/${uid}/${fname}`;

        console.log('[ytdl] saved:', fileUrl);
        res.json({ url: fileUrl, title, author });

    } catch (e) {
        console.error('[ytdl] error:', e.message);
        res.status(500).json({ error: 'Nu s-a putut descărca melodia. ' + e.message });
    }
});

// DELETE /api/upload — șterge un fișier; verifică că aparține userului autentificat
app.delete('/api/upload', authenticateToken, (req, res) => {
    try {
        const { url } = req.body;
        if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL lipsă.' });

        // Reconstruiește path-ul absolut și verifică că e în folderul userului
        const uid      = String(req.user.userId);
        const shard    = uid.slice(-4, -2) || 'xx';
        const shard2   = uid.slice(-2) || 'xx';
        const userDir  = path.join(UPLOADS_ROOT, shard, shard2, uid);
        const filename = path.basename(url);                          // extrage doar numele
        const filepath = path.join(userDir, filename);

        // Security: path traversal check — filepath trebuie să fie în userDir
        if (!filepath.startsWith(userDir + path.sep)) {
            return res.status(403).json({ error: 'Acces interzis.' });
        }

        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE /api/upload/all/:userId — șterge tot folderul unui user (la ștergere cont)
app.delete('/api/upload/all/:userId', authenticateToken, (req, res) => {
    try {
        // Doar adminul sau userul însuși poate face asta
        if (req.user.userId !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acces interzis.' });
        }
        const uid    = String(req.params.userId);
        const shard  = uid.slice(-4, -2) || 'xx';
        const shard2 = uid.slice(-2) || 'xx';
        const dir    = path.join(UPLOADS_ROOT, shard, shard2, uid);
        if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
        res.json({ success: true, message: `Folderul userului ${uid} a fost șters.` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/profile', authenticateToken, ensureActiveEvent, async (req, res) => {
    try {
        const { profile } = req.body;

        // Safety: strip any leftover base64 imageData from blocks
        if (profile?.customSections) {
            try {
                const blocks = JSON.parse(profile.customSections);
                profile.customSections = JSON.stringify(
                    blocks.map((b) => {
                        if (b.type === 'photo' && b.imageData?.startsWith('data:')) {
                            const { imageData, ...rest } = b;
                            return rest;
                        }
                        return b;
                    })
                );
            } catch { /* invalid JSON, leave as-is */ }
        }

        // Convert to dot-notation $set so Mongoose strict mode never strips any field
        const $setPayload = {};
        for (const [key, val] of Object.entries(profile)) {
            $setPayload[`profile.${key}`] = val;
        }

        await User.findOneAndUpdate(
            { _id: req.user.userId },
            { $set: $setPayload },
            { new: true, strict: false }
        );
        res.send({ success: true });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.post('/api/project', authenticateToken, ensureActiveEvent, async (req, res) => {
    const { elements, tasks, budget, totalBudget, selectedTemplate } = req.body;
    const updateData = { updatedAt: new Date(), elements, tasks, budget, totalBudget, selectedTemplate };
    await Project.findOneAndUpdate({ ownerId: req.user.userId }, updateData, { new: true, upsert: true });
    res.send({ success: true });
});

app.post('/api/guests', authenticateToken, ensureActiveEvent, async (req, res) => {
    const { name, type } = req.body;
    
    const user = await User.findById(req.user.userId);
    const config = await getConfig();
    const limits = config.limits[user.plan || 'free'];
    const currentCount = await Guest.countDocuments({ ownerId: req.user.userId });
    
    if (currentCount >= limits.maxGuests) {
        return res.status(403).send({ error: 'Limit reached.' });
    }

    const newGuest = new Guest({ 
        ownerId: req.user.userId, 
        name, 
        type, 
        token: generateToken(), 
        status: 'pending',
        isSent: false,
        source: 'manual'
    });
    await newGuest.save();
    res.send(newGuest);
});

app.put('/api/guests/:id/sent', authenticateToken, ensureActiveEvent, async (req, res) => {
    try {
        const { isSent } = req.body;
        const guest = await Guest.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user.userId },
            { isSent: isSent },
            { new: true }
        );
        res.send(guest);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.delete('/api/guests/:id', authenticateToken, ensureActiveEvent, async (req, res) => {
    await Guest.findByIdAndDelete(req.params.id);
    res.send({ success: true });
});

// --- READ-ONLY ROUTES (Always allowed even if completed) ---

app.get('/api/project/:userId', authenticateToken, async (req, res) => {
    const project = await Project.findOne({ ownerId: req.user.userId });
    res.send(project || {});
});

app.get('/api/guests/:userId', authenticateToken, async (req, res) => {
    const guests = await Guest.find({ ownerId: req.user.userId });
    res.send(guests);
});

// --- PUBLIC ROUTES & ADMIN ---
// ... (Keeping existing Admin and Public routes same)

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const premiumUsers = await User.countDocuments({ plan: 'premium' });
        
        const usersWithPayments = await User.find({ "payments.0": { "$exists": true } });
        let totalRevenue = 0;
        let recentPayments = [];

        usersWithPayments.forEach(u => {
            u.payments.forEach(p => {
                if (p.status === 'Paid') {
                    totalRevenue += p.amount || 0;
                    recentPayments.push({
                        userEmail: u.user,
                        amount: p.amount,
                        date: p.date,
                        invoiceId: p.invoiceId
                    });
                }
            });
        });

        recentPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.send({
            totalUsers,
            premiumUsers,
            freeUsers: totalUsers - premiumUsers,
            totalRevenue,
            recentPayments: recentPayments.slice(0, 10)
        });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-pass'); 
        res.send(users);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// --- ADMIN TEMPLATE ROUTES ---
app.get('/api/admin/templates', authenticateAdmin, async (req, res) => {
    try {
        const templates = await InvitationTemplate.find({});
        res.send(templates);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.post('/api/admin/templates', authenticateAdmin, async (req, res) => {
    try {
        const templateData = req.body;
        const template = new InvitationTemplate(templateData);
        await template.save();
        res.send(template);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.put('/api/admin/templates/:id', authenticateAdmin, async (req, res) => {
    try {
        const template = await InvitationTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(template);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.delete('/api/admin/templates/:id', authenticateAdmin, async (req, res) => {
    try {
        await InvitationTemplate.findByIdAndDelete(req.params.id);
        res.send({ success: true });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// --- PUBLIC TEMPLATE ROUTES ---
app.get('/api/templates', async (req, res) => {
    try {
        const templates = await InvitationTemplate.find({ isActive: true });
        res.send(templates);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const { plan, user, profile } = req.body;
        await User.findByIdAndUpdate(req.params.id, { plan, user, profile });
        res.send({ success: true });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        await Project.deleteMany({ ownerId: userId });
        await Guest.deleteMany({ ownerId: userId });
        res.send({ success: true });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.post('/api/admin/cancel-sub', authenticateAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        await User.findByIdAndUpdate(userId, { plan: 'free' });
        res.send({ success: true });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.get('/api/admin/config', authenticateAdmin, async (req, res) => {
    try {
        const config = await getConfig();
        res.send(config);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.put('/api/admin/config', authenticateAdmin, async (req, res) => {
    try {
        const { limits, pricing } = req.body;
        await SystemConfig.findOneAndUpdate({ key: 'global_config' }, { limits, pricing }, { upsert: true });
        res.send({ success: true });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// ── Services coming soon flag — public read ───────────────────────────────────
app.get('/api/config/services-coming-soon', async (req, res) => {
    try {
        const config = await getConfig();
        res.json({ enabled: !!config?.servicesComingSoon });
    } catch (e) { res.status(500).send({ error: e.message }); }
});

// ── Services coming soon flag — admin toggle ──────────────────────────────────
app.put('/api/admin/config/services-coming-soon', authenticateAdmin, async (req, res) => {
    try {
        const { enabled } = req.body;
        await SystemConfig.findOneAndUpdate(
            { key: 'global_config' },
            { $set: { servicesComingSoon: !!enabled } },
            { upsert: true }
        );
        res.json({ enabled: !!enabled });
    } catch (e) { res.status(500).send({ error: e.message }); }
});


// ── Template Defaults — public read (folosit de DashboardApp la incarcare) ──
app.get('/api/config/template-defaults/:templateId', async (req, res) => {
    try {
        const doc = await TemplateDefaults.findOne({ templateId: req.params.templateId });
        if (!doc) return res.json({});
        const { _id, __v, updatedAt, templateId, ...rest } = doc.toObject();
        // strip null values so frontend ?? fallback works correctly
        const clean = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== null && v !== undefined));
        res.json(clean);
    } catch (e) { res.status(500).send({ error: e.message }); }
});

// ── Template Defaults — admin read ───────────────────────────────────────────
// DELETE /api/admin/config/template-defaults/:templateId — resetează config + șterge fișierele
app.delete('/api/admin/config/template-defaults/:templateId', authenticateAdmin, async (req, res) => {
    try {
        const { templateId } = req.params;
        const doc = await TemplateDefaults.findOne({ templateId });
        if (!doc) return res.json({ ok: true, deleted: 0 });

        const toDelete = [];

        // Colectăm toate URL-urile de fișiere
        if (doc.heroBgImage)       toDelete.push(doc.heroBgImage);
        if (doc.heroBgImageMobile) toDelete.push(doc.heroBgImageMobile);
        if (doc.themeImages) {
            for (const theme of Object.values(doc.themeImages)) {
                if (theme && typeof theme === 'object') {
                    if (theme.desktop) toDelete.push(theme.desktop);
                    if (theme.mobile)  toDelete.push(theme.mobile);
                }
            }
        }
        // introVariants — cleanup fișiere regal
        if (doc.introVariants) {
            for (const variant of Object.values(doc.introVariants)) {
                if (variant && typeof variant === 'object') {
                    if (variant.desktop) toDelete.push(variant.desktop);
                    if (variant.mobile)  toDelete.push(variant.mobile);
                }
            }
        }

        // Ștergem fișierele fizice
        let deletedFiles = 0;
        for (const url of toDelete) {
            if (!url || !url.startsWith('/uploads/')) continue;
            try {
                const filepath = path.join(UPLOADS_ROOT, url.replace('/uploads/', ''));
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                    deletedFiles++;
                }
            } catch (e) { console.error('Could not delete file:', url, e.message); }
        }

        // Ștergem documentul din DB
        await TemplateDefaults.deleteOne({ templateId });

        res.json({ ok: true, deleted: deletedFiles, totalUrls: toDelete.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/config/template-defaults/:templateId', authenticateAdmin, async (req, res) => {
    try {
        const doc = await TemplateDefaults.findOne({ templateId: req.params.templateId });
        if (!doc) return res.json({});
        const { _id, __v, templateId, ...rest } = doc.toObject();
        res.json(rest);
    } catch (e) { res.status(500).send({ error: e.message }); }
});

// ── Template Defaults — admin write ──────────────────────────────────────────
app.post('/api/admin/config/template-defaults/:templateId', authenticateAdmin, async (req, res) => {
    try {
        const { templateId } = req.params;
        const patch = { ...req.body, templateId, updatedAt: new Date() };

        // Ștergem fișierele vechi înlocuite
        const existing = await TemplateDefaults.findOne({ templateId });
        if (existing && patch.themeImages) {
            const oldThemeImages = existing.themeImages || {};
            for (const [themeId, newImgs] of Object.entries(patch.themeImages || {})) {
                const oldImgs = oldThemeImages[themeId] || {};
                for (const side of ['desktop', 'mobile']) {
                    const oldUrl = oldImgs[side];
                    const newUrl = newImgs?.[side];
                    if (oldUrl && newUrl && oldUrl !== newUrl && oldUrl.startsWith('/uploads/')) {
                        try {
                            const fp = path.join(UPLOADS_ROOT, oldUrl.replace('/uploads/', ''));
                            if (fs.existsSync(fp)) fs.unlinkSync(fp);
                        } catch(e) {}
                    }
                }
            }
            // heroBgImage
            for (const field of ['heroBgImage', 'heroBgImageMobile', 'videoUrl']) {
                const oldUrl = existing[field];
                const newUrl = patch[field];
                if (oldUrl && newUrl && oldUrl !== newUrl && oldUrl.startsWith('/uploads/')) {
                    try {
                        const fp = path.join(UPLOADS_ROOT, oldUrl.replace('/uploads/', ''));
                        if (fs.existsSync(fp)) fs.unlinkSync(fp);
                    } catch(e) {}
                }
            }
            // introVariants — șterge imaginile înlocuite
            if (existing.introVariants && patch.introVariants) {
                for (const [varId, newVar] of Object.entries(patch.introVariants || {})) {
                    const oldVar = existing.introVariants[varId] || {};
                    for (const side of ['desktop', 'mobile']) {
                        const oldUrl = oldVar[side];
                        const newUrl = newVar?.[side];
                        if (oldUrl && newUrl && oldUrl !== newUrl && oldUrl.startsWith('/uploads/')) {
                            try {
                                const fp = path.join(UPLOADS_ROOT, oldUrl.replace('/uploads/', ''));
                                if (fs.existsSync(fp)) fs.unlinkSync(fp);
                            } catch(e) {}
                        }
                    }
                }
                // șterge imaginile variantelor eliminate complet
                for (const [varId, oldVar] of Object.entries(existing.introVariants)) {
                    if (!patch.introVariants[varId]) {
                        for (const side of ['desktop', 'mobile']) {
                            const oldUrl = oldVar?.[side];
                            if (oldUrl && oldUrl.startsWith('/uploads/')) {
                                try {
                                    const fp = path.join(UPLOADS_ROOT, oldUrl.replace('/uploads/', ''));
                                    if (fs.existsSync(fp)) fs.unlinkSync(fp);
                                } catch(e) {}
                            }
                        }
                    }
                }
            }
        }

        // strip undefined/null for fields explicitly cleared
        await TemplateDefaults.findOneAndUpdate(
            { templateId },
            { $set: patch },
            { upsert: true, new: true, strict: false }
        );
        res.json({ success: true });
    } catch (e) { res.status(500).send({ error: e.message }); }
});

// ── Services Marketplace — public read ───────────────────────────────────────
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find({ available: true }).sort({ featured: -1, createdAt: -1 });
        res.json(services);
    } catch (e) { res.status(500).send({ error: e.message }); }
});

// ── Services Marketplace — admin CRUD ────────────────────────────────────────
app.get('/api/admin/services', authenticateAdmin, async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json(services);
    } catch (e) { res.status(500).send({ error: e.message }); }
});

app.post('/api/admin/services', authenticateAdmin, async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json(service);
    } catch (e) { res.status(400).send({ error: e.message }); }
});

app.put('/api/admin/services/:id', authenticateAdmin, async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) return res.status(404).send({ error: 'Not found' });
        res.json(service);
    } catch (e) { res.status(400).send({ error: e.message }); }
});

app.delete('/api/admin/services/:id', authenticateAdmin, async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).send({ error: e.message }); }
});

// ── Seed default services if collection is empty ──────────────────────────────
async function seedServices() {
    const count = await Service.countDocuments();
    if (count > 0) return;
    const defaults = [
        { name: 'Sweet Dreams Candy Bar', category: 'candybar', description: 'Candy bar de lux cu dulciuri artizanale, decoruri personalizate și setup complet pentru evenimentul tău. Include masă decorată, recipiente de sticlă, etichetare și livrare.', priceFrom: 1200, priceTo: 3500, priceUnit: 'total', location: 'București', phone: '0721 000 001', instagram: '@sweetdreams.ro', imageUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&q=80', rating: 4.9, reviewCount: 84, tags: ['lux','personalizat','livrare'], featured: true, available: true },
        { name: 'Formația Romantica', category: 'formatie', description: 'Formație completă cu 6 muzicieni, repertoriu variat: muzică populară, manele, internațional. Experiență de peste 15 ani în nunți și evenimente.', priceFrom: 3500, priceTo: 6000, priceUnit: 'total', location: 'București & împrejurimi', phone: '0745 000 002', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80', rating: 4.8, reviewCount: 127, tags: ['populară','manele','internațional'], featured: true, available: true },
        { name: 'DJ Alex Pro', category: 'dj', description: 'DJ profesionist cu echipament premium, lumini și sistem de sunet. Playlist personalizat, mixing live, experiență la peste 300 de nunți.', priceFrom: 1500, priceTo: 2500, priceUnit: 'total', location: 'Nationwide', phone: '0733 000 003', instagram: '@djAlexPro', imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', rating: 4.7, reviewCount: 203, tags: ['lumini','mixing live','nationwide'], featured: false, available: true },
        { name: 'Atelier Floral Irina', category: 'florarie', description: 'Aranjamente florale pentru nunți: buchete mireasă, centrepiece-uri, arcuri florale, decoruri sală. Flori proaspete din import și locale.', priceFrom: 2000, priceUnit: 'total', location: 'Cluj-Napoca', phone: '0756 000 004', website: 'www.atelierfloral.ro', imageUrl: 'https://images.unsplash.com/photo-1487530811015-780de7c30f3a?w=600&q=80', rating: 5.0, reviewCount: 56, tags: ['buchete','aranjamente','arcuri'], featured: true, available: true },
        { name: 'Studio Lumina Foto', category: 'foto-video', description: 'Pachet complet foto + video pentru nuntă: 2 fotografi, 2 cameramani, album premium, clip cinematic 4K, drone, livrare în 60 zile.', priceFrom: 4500, priceTo: 8000, priceUnit: 'total', location: 'București', phone: '0766 000 005', website: 'www.studiolumina.ro', imageUrl: 'https://images.unsplash.com/photo-1606216794079-73f9c1f1a108?w=600&q=80', rating: 4.9, reviewCount: 91, tags: ['4K','drone','album premium'], featured: true, available: true },
        { name: 'Tort de Vis Cofetărie', category: 'cofetarie', description: 'Torturi de nuntă personalizate, desert table, cupcakes și prăjituri. Design unic creat împreună cu voi. Livrare și montaj inclus.', priceFrom: 800, priceTo: 3000, priceUnit: 'total', location: 'Iași', phone: '0722 000 006', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', rating: 4.8, reviewCount: 142, tags: ['personalizat','livrare','desert table'], featured: false, available: true },
    ];
    // Folosim create() în loc de insertMany() — aplică schema defaults corect
    for (const d of defaults) await Service.create(d);
    console.log('✅ Seeded', defaults.length, 'default services');
}

// ── Fix documente vechi fără câmpul available ─────────────────────────────────
app.post('/api/admin/services/fix-available', authenticateAdmin, async (req, res) => {
    try {
        const result = await Service.updateMany(
            { available: { $exists: false } },
            { $set: { available: true } }
        );
        res.json({ fixed: result.modifiedCount });
    } catch (e) { res.status(500).send({ error: e.message }); }
});

// ── Force reseed ──────────────────────────────────────────────────────────────
app.post('/api/admin/services/reseed', authenticateAdmin, async (req, res) => {
    try {
        await Service.deleteMany({});
        await seedServices();
        const services = await Service.find();
        res.json({ seeded: services.length });
    } catch (e) { res.status(500).send({ error: e.message }); }
});



// ── Service Requests — public submit ─────────────────────────────────────────
app.post('/api/service-requests', authenticateToken, async (req, res) => {
    try {
        const { serviceId, serviceName, serviceCategory, name, email, phone, address, contactTime, budget, gdprAccepted, callApproved } = req.body;
        if (!name || !email || !phone || !serviceId) return res.status(400).send({ error: 'Câmpuri obligatorii lipsă.' });
        const req2 = new ServiceRequest({ serviceId, serviceName, serviceCategory, name, email, phone, address, contactTime, budget, gdprAccepted, callApproved });
        await req2.save();
        res.status(201).json(req2);
    } catch (e) { res.status(500).send({ error: e.message }); }
});

// ── Service Requests — user: own requests ────────────────────────────────────
app.get('/api/service-requests/mine', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).lean();
        if (!user) return res.status(404).send({ error: 'User not found' });
        const requests = await ServiceRequest.find({ email: user.profile?.email || '' }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (e) { res.status(500).send({ error: e.message }); }
});

// ── Service Requests — admin: all ────────────────────────────────────────────
app.get('/api/admin/service-requests', authenticateAdmin, async (req, res) => {
    try {
        const requests = await ServiceRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (e) { res.status(500).send({ error: e.message }); }
});

// ── Service Requests — admin: update status ───────────────────────────────────
app.put('/api/admin/service-requests/:id', authenticateAdmin, async (req, res) => {
    try {
        const { status, notes } = req.body;
        const updated = await ServiceRequest.findByIdAndUpdate(req.params.id, { status, notes }, { new: true });
        if (!updated) return res.status(404).send({ error: 'Not found' });
        res.json(updated);
    } catch (e) { res.status(500).send({ error: e.message }); }
});

app.post('/api/upgrade', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { email } = req.body; 
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ error: "Utilizator inexistent." });

    let billingEmail = email; 
    if (!billingEmail && user.profile?.email) billingEmail = user.profile.email;
    if (!billingEmail && user.user && user.user.includes('@')) billingEmail = user.user;

    if (!billingEmail || !billingEmail.includes('@')) {
        return res.status(400).send({ error: "Email-ul de facturare este obligatorie." });
    }

    if (billingEmail !== user.profile?.email) {
        await User.findByIdAndUpdate(userId, { "profile.email": billingEmail });
    }

    const config = await getConfig();
    const priceAmount = config.pricing.premiumPrice; 

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: 'Wedding Planner Premium',
              description: 'Acces nelimitat la funcții premium pe viață.',
            },
            unit_amount: priceAmount, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment', 
      customer_email: billingEmail, 
      client_reference_id: userId,
      invoice_creation: { enabled: true },
      success_url: `${CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${CLIENT_URL}/dashboard?payment=canceled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Nu am putut iniția plata securizată.' });
  }
});

app.get('/api/invite-data/:token', async (req, res) => {
    try {
        const guest = await Guest.findOne({ token: req.params.token });
        if (!guest) return res.sendStatus(404);

        guest.openedAt = new Date();
        if (guest.status === 'pending') guest.status = 'opened';
        await guest.save();

        const project = await Project.findOne({ ownerId: guest.ownerId });
        const user = await User.findById(guest.ownerId);
        if (!user) return res.sendStatus(404);

        // Merge template defaults < user profile (user are prioritate)
        const templateId = project?.selectedTemplate || 'castle-magic';
        const tplDoc = await TemplateDefaults.findOne({ templateId });
        const tplDefaults = tplDoc ? tplDoc.toObject() : {};
        // stergem campurile Mongoose interne
        delete tplDefaults._id; delete tplDefaults.__v; delete tplDefaults.templateId; delete tplDefaults.updatedAt;
        // null-urile din defaults nu suprascriu profilul
        const cleanDefaults = Object.fromEntries(Object.entries(tplDefaults).filter(([, v]) => v !== null && v !== undefined && v !== ''));
        const mergedProfile = { ...cleanDefaults, ...cleanProfileForMerge(user.profile?.toObject ? user.profile.toObject() : user.profile) };

        res.send({ guest, project, profile: mergedProfile });
    } catch (e) {
        console.error('invite-data error:', e);
        res.status(500).send({ error: e.message });
    }
});

app.get('/api/public-invite-data/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const owner = await User.findOne({ "profile.inviteSlug": slug.toLowerCase() });
        if (!owner) return res.status(404).send({ error: 'Eveniment inexistent.' });

        const project = await Project.findOne({ ownerId: owner._id });

        // Merge template defaults < owner profile
        const templateId = project?.selectedTemplate || 'castle-magic';
        const tplDoc = await TemplateDefaults.findOne({ templateId });
        const tplDefaults = tplDoc ? tplDoc.toObject() : {};
        delete tplDefaults._id; delete tplDefaults.__v; delete tplDefaults.templateId; delete tplDefaults.updatedAt;
        const cleanDefaults = Object.fromEntries(Object.entries(tplDefaults).filter(([, v]) => v !== null && v !== undefined && v !== ''));
        const mergedProfile = { ...cleanDefaults, ...cleanProfileForMerge(owner.profile?.toObject ? owner.profile.toObject() : owner.profile) };

        res.send({
            guest: { name: '', status: 'pending', type: 'guest' },
            project: project || {},
            profile: mergedProfile,
            isPublic: true,
            ownerId: owner._id
        });
    } catch (e) {
        console.error('public-invite-data error:', e);
        res.status(500).send({ error: e.message });
    }
});

app.post('/api/guest/rsvp', async (req, res) => {
    const { token, status, rsvpData } = req.body;
    await Guest.findOneAndUpdate({ token: token }, { status: status, rsvp: rsvpData });
    res.send({ success: true });
});

app.post('/api/guest/public-rsvp', async (req, res) => {
    const { ownerId, name, rsvpData } = req.body;
    if (!ownerId || !name) return res.status(400).send({ error: 'Date incomplete.' });
    
    const owner = await User.findById(ownerId);
    
    // Check if event is active before allowing new public RSVPs
    if (isEventCompleted(owner.profile.weddingDate)) {
        return res.status(403).send({ error: 'Acest eveniment a fost încheiat.' });
    }

    const config = await getConfig();
    const limits = config.limits[owner.plan || 'free'];
    const currentCount = await Guest.countDocuments({ ownerId });
    
    if (currentCount >= limits.maxGuests) return res.status(403).send({ error: 'Limita atinsă.' });
    
    const newGuest = new Guest({
        ownerId, name, type: 'adult', token: generateToken(),
        status: 'confirmed', isSent: true, source: 'public', rsvp: rsvpData
    });
    await newGuest.save();
    res.send({ success: true, guest: newGuest });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error("❌ GLOBAL ERROR:", err.stack);
    if (!res.headersSent) res.status(500).send({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
