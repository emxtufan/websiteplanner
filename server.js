
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
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005; 

// --- CONFIGURARE PRODUCȚIE VS DEV ---
// În producție, aceste valori vor veni din Environment Variables
const MONGO_URI = process.env.MONGO_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || ''; 
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''; 
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''; 
const CLIENT_URL = process.env.CLIENT_URL || ''; 

const stripe = new Stripe(STRIPE_SECRET_KEY);

// --- SECURITY MIDDLEWARE ---
app.use(helmet());

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL, 'http://localhost:3001', 'http://localhost:3000']         // doar domeniul tău public
  : ['http://localhost:3001', 'http://localhost:5173'];



app.use(cors({
  origin: allowedOrigins,
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));


// --- SCHEMAS ---
// NEW: System Configuration Schema (Dynamic Limits)
const SystemConfigSchema = new mongoose.Schema({
    key: { type: String, default: 'global_config', unique: true },
    limits: {
        free: {
            maxGuests: { type: Number, default: 1 },
            maxElements: { type: Number, default: 5 },
            maxCustomTasks: { type: Number, default: 3 },
            maxBudgetItems: { type: Number, default: 6 },
            maxCalculatorBudget: { type: Number, default: 500 } // NEW: Limit for budget calculator in free plan
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
        premiumPrice: { type: Number, default: 4900 }, // in bani (49 RON)
        oldPrice: { type: Number, default: 10000 }, // NEW: in bani (100 RON) - for strikethrough display
        currency: { type: String, default: 'ron' }
    }
});

const PaymentSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    amount: Number,
    invoiceId: String,
    billingEmail: String,
    invoicePdfUrl: String, 
    hostedInvoiceUrl: String,
    status: { type: String, default: 'Paid' }
});

const UserSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true }, 
  pass: { type: String, required: true }, 
  plan: { type: String, default: 'free', enum: ['free', 'premium'] },
  isAdmin: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now }, 
  payments: [PaymentSchema],
  profile: {
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
    eventTime: String
  }
});

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
  source: { type: String, default: 'manual' }, 
  rsvp: {
    confirmedCount: { type: Number, default: 0 },
    hasChildren: { type: Boolean, default: false },
    message: String,
    dietary: String
  }
});

const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Guest = mongoose.model('Guest', GuestSchema);
const SystemConfig = mongoose.model('SystemConfig', SystemConfigSchema);

// --- HELPER: GET DYNAMIC LIMITS ---
const getConfig = async () => {
    let config = await SystemConfig.findOne({ key: 'global_config' });
    if (!config) {
        config = new SystemConfig();
        await config.save();
    }
    return config;
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

    console.log(`💰 Payment success for User: ${userId}`);

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

        const newPayment = {
            date: new Date(),
            amount: amountTotal,
            invoiceId: session.invoice || session.id,
            billingEmail: customerEmail,
            invoicePdfUrl: invoicePdfUrl,
            hostedInvoiceUrl: hostedInvoiceUrl,
            status: 'Paid'
        };

        await User.findByIdAndUpdate(userId, {
            plan: 'premium',
            $push: { payments: newPayment }
        });
        
        console.log(`✅ Database updated for user ${userId} to PREMIUM`);
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
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- MONGODB CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- UTILS ---
const generateToken = () => Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

// --- ROUTES ---

// AUTH
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
      plan: 'free',
      isAdmin: isFirstUser, 
      profile: { 
          email: user, 
          weddingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), 
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
    
    const isMatch = await bcrypt.compare(pass, foundUser.pass);
    if (isMatch) {
      const config = await getConfig();
      const limits = config.limits[foundUser.plan || 'free'];
      const price = config.pricing.premiumPrice;

      const token = jwt.sign({ userId: foundUser._id, plan: foundUser.plan || 'free' }, JWT_SECRET, { expiresIn: '7d' });
      res.send({ 
        success: true, user: foundUser.user, userId: foundUser._id, 
        plan: foundUser.plan || 'free', 
        isAdmin: foundUser.isAdmin, 
        profile: foundUser.profile, 
        payments: foundUser.payments || [], 
        limits: limits, 
        premiumPrice: price,
        pricing: config.pricing, // Send full pricing object including oldPrice
        token: token 
      });
    } else { res.status(401).send({ error: 'Datele de autentificare sunt incorecte.' }); }
  } catch (error) { res.status(500).send({ error: 'Server error' }); }
});

app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).send({ error: 'User not found' });
    
    const config = await getConfig();
    const limits = config.limits[user.plan || 'free'];
    const price = config.pricing.premiumPrice;

    res.send({ 
        success: true, 
        user: user.user, 
        userId: user._id, 
        plan: user.plan || 'free', 
        isAdmin: user.isAdmin,
        profile: user.profile, 
        payments: user.payments || [], 
        limits: limits, 
        premiumPrice: price,
        pricing: config.pricing // Send full pricing object including oldPrice
    });
  } catch (error) {
    res.status(500).send({ error: 'Server error' });
  }
});

// --- ADMIN ROUTES ---

// Get Stats
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

// List Users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-pass'); 
        res.send(users);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Edit User
app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const { plan, user, profile } = req.body;
        await User.findByIdAndUpdate(req.params.id, { plan, user, profile });
        res.send({ success: true });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Delete User
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        // Delete User and related data
        await User.findByIdAndDelete(userId);
        await Project.deleteMany({ ownerId: userId });
        await Guest.deleteMany({ ownerId: userId });
        res.send({ success: true });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Cancel Sub
app.post('/api/admin/cancel-sub', authenticateAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        await User.findByIdAndUpdate(userId, { plan: 'free' });
        res.send({ success: true });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// --- NEW ADMIN ROUTES FOR DYNAMIC SETTINGS ---

// Get Config
app.get('/api/admin/config', authenticateAdmin, async (req, res) => {
    try {
        const config = await getConfig();
        res.send(config);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Update Config
app.put('/api/admin/config', authenticateAdmin, async (req, res) => {
    try {
        const { limits, pricing } = req.body;
        await SystemConfig.findOneAndUpdate({ key: 'global_config' }, { limits, pricing }, { upsert: true });
        res.send({ success: true });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// CHECKOUT (Updated with Dynamic Price)
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
        return res.status(400).send({ error: "Email-ul de facturare este obligatoriu." });
    }

    if (billingEmail !== user.profile?.email) {
        await User.findByIdAndUpdate(userId, { "profile.email": billingEmail });
    }

    // Get Dynamic Price
    const config = await getConfig();
    const priceAmount = config.pricing.premiumPrice; // e.g., 4900 for 49.00

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

app.post('/api/profile', authenticateToken, async (req, res) => {
    const { profile } = req.body;
    await User.findByIdAndUpdate(req.user.userId, { profile });
    res.send({ success: true });
});

app.post('/api/project', authenticateToken, async (req, res) => {
    const { elements, tasks, budget, totalBudget, selectedTemplate } = req.body;
    const updateData = { updatedAt: new Date(), elements, tasks, budget, totalBudget, selectedTemplate };
    await Project.findOneAndUpdate({ ownerId: req.user.userId }, updateData, { new: true, upsert: true });
    res.send({ success: true });
});

app.get('/api/project/:userId', authenticateToken, async (req, res) => {
    const project = await Project.findOne({ ownerId: req.user.userId });
    res.send(project || {});
});

app.get('/api/guests/:userId', authenticateToken, async (req, res) => {
    const guests = await Guest.find({ ownerId: req.user.userId });
    res.send(guests);
});

app.post('/api/guests', authenticateToken, async (req, res) => {
    const { name, type } = req.body;
    
    // Check limits dynamically
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
        source: 'manual'
    });
    await newGuest.save();
    res.send(newGuest);
});

app.delete('/api/guests/:id', authenticateToken, async (req, res) => {
    await Guest.findByIdAndDelete(req.params.id);
    res.send({ success: true });
});

// PUBLIC ROUTES
app.get('/api/invite-data/:token', async (req, res) => {
    const guest = await Guest.findOne({ token: req.params.token });
    if(!guest) return res.sendStatus(404);
    const project = await Project.findOne({ ownerId: guest.ownerId });
    const user = await User.findById(guest.ownerId);
    res.send({ guest, project, profile: user.profile });
});

app.get('/api/public-invite-data/:slug', async (req, res) => {
    const { slug } = req.params;
    const users = await User.find({});
    const owner = users.find(u => {
        const p1 = u.profile?.partner1Name?.trim().toLowerCase();
        const p2 = u.profile?.partner2Name?.trim().toLowerCase();
        return `${p1}-${p2}` === slug.toLowerCase();
    });
    if (!owner) return res.status(404).send({ error: 'Eveniment inexistent.' });
    const project = await Project.findOne({ ownerId: owner._id });
    res.send({ 
        guest: { name: 'Dragă Invitat', status: 'pending', type: 'guest' },
        project: project || {}, 
        profile: owner.profile,
        isPublic: true,
        ownerId: owner._id 
    });
});

app.post('/api/guest/rsvp', async (req, res) => {
    const { token, status, rsvpData } = req.body;
    await Guest.findOneAndUpdate({ token: token }, { status: status, rsvp: rsvpData });
    res.send({ success: true });
});

app.post('/api/guest/public-rsvp', async (req, res) => {
    const { ownerId, name, rsvpData } = req.body;
    if (!ownerId || !name) return res.status(400).send({ error: 'Date incomplete.' });
    
    // Check limits dynamically
    const owner = await User.findById(ownerId);
    const config = await getConfig();
    const limits = config.limits[owner.plan || 'free'];
    const currentCount = await Guest.countDocuments({ ownerId });
    
    if (currentCount >= limits.maxGuests) return res.status(403).send({ error: 'Limita atinsă.' });
    
    const newGuest = new Guest({
        ownerId, name, type: 'adult', token: generateToken(),
        status: 'confirmed', source: 'public', rsvp: rsvpData
    });
    await newGuest.save();
    res.send({ success: true, guest: newGuest });
});

app.use((err, req, res, next) => {
    console.error("❌ GLOBAL ERROR:", err.stack);
    if (!res.headersSent) res.status(500).send({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));