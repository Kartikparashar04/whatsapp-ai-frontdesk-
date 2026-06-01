import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import admin from 'firebase-admin';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK for JWT verification
admin.initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'whatsappapi-1c0d8'
});

const app = express();
app.use(express.json());
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend dashboard

// Serve static files from the built React app (Vite build)
app.use(express.static(path.join(process.cwd(), 'dist')));

const PORT = process.env.PORT || 3000;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'deskflow_verify_token_secure_99';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;



// SQLite Database initialization
let db = null;
async function initSQLite() {
  try {
    db = await open({
      filename: path.join(process.cwd(), 'database.db'),
      driver: sqlite3.Database
    });
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        owner_email TEXT,
        name TEXT,
        phone TEXT,
        requirement TEXT,
        budget TEXT,
        location TEXT,
        status TEXT,
        source TEXT,
        date TEXT
      );
      
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        owner_email TEXT,
        name TEXT,
        phone TEXT,
        service TEXT,
        date_time TEXT,
        status TEXT,
        reminder_sent INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS business_profiles (
        email TEXT PRIMARY KEY,
        name TEXT,
        avatar TEXT,
        avatar_img TEXT,
        role TEXT,
        niche TEXT,
        is_onboarded INTEGER DEFAULT 0,
        business_name TEXT,
        business_phone TEXT,
        business_address TEXT,
        business_website TEXT,
        ai_persona TEXT,
        phone_number_id TEXT,
        whatsapp_config TEXT
      );
      
      CREATE TABLE IF NOT EXISTS referrals (
        id TEXT PRIMARY KEY,
        owner_email TEXT,
        referrer_name TEXT,
        referrer_phone TEXT,
        code TEXT,
        discount_value TEXT,
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        owner_email TEXT,
        customer_name TEXT,
        rating INTEGER,
        comment TEXT,
        status TEXT,
        niche TEXT
      );
    `);
    console.log('SQLite Database and all tables (users, leads, appointments, business_profiles, referrals, reviews) initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize SQLite Database:', error.message);
  }
}
initSQLite();

// Middleware: Verify Firebase JWT token
async function checkAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: No token provided.' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Demo Mode check (mock validation or non-JWT fallback)
    if (!process.env.VITE_FIREBASE_API_KEY || 
        process.env.VITE_FIREBASE_API_KEY.includes("ChangeMe") || 
        token.split('.').length !== 3) {
      req.user = { email: token.includes('@') ? token : 'kartikparashar15@gmail.com' };
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || `${decodedToken.uid}@deskflow.com`
    };
    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token.' });
  }
}

// Initialize Google Gemini AI SDK
let aiClient = null;
if (GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log('Gemini AI SDK initialized successfully!');
  } catch (error) {
    console.error('Error initializing Gemini AI SDK:', error.message);
  }
}

/**
 * Helper: Load a specific Business Profile by email from SQLite DB
 */
async function getProfileByEmail(email) {
  try {
    if (!db) return null;
    const row = await db.get('SELECT * FROM business_profiles WHERE email = ?', email.toLowerCase());
    if (row) {
      row.whatsappConfig = row.whatsapp_config ? JSON.parse(row.whatsapp_config) : {};
      row.isOnboarded = row.is_onboarded === 1;
      row.avatarImg = row.avatar_img;
      row.businessName = row.business_name;
      row.businessPhone = row.business_phone;
      row.businessAddress = row.business_address;
      row.businessWebsite = row.business_website;
      row.aiPersona = row.ai_persona;
    }
    return row || null;
  } catch (error) {
    console.error('Error fetching profile by email from SQL:', error.message);
    return null;
  }
}

/**
 * Helper: Load Business Profile by phone number ID (for incoming webhooks) from SQLite DB
 */
async function getProfileByPhoneId(phoneId) {
  try {
    if (!db) return null;
    const row = await db.get('SELECT * FROM business_profiles WHERE phone_number_id = ?', phoneId);
    if (row) {
      row.whatsappConfig = row.whatsapp_config ? JSON.parse(row.whatsapp_config) : {};
      row.isOnboarded = row.is_onboarded === 1;
      row.avatarImg = row.avatar_img;
      row.businessName = row.business_name;
      row.businessPhone = row.business_phone;
      row.businessAddress = row.business_address;
      row.businessWebsite = row.business_website;
      row.aiPersona = row.ai_persona;
    }
    return row || null;
  } catch (error) {
    console.error('Error fetching profile by phone ID from SQL:', error.message);
    return null;
  }
}

/**
 * Helper: Clean and parse LLM JSON responses (stripping markdown backticks if any)
 */
function parseCleanJSON(rawText) {
  let clean = rawText.trim();
  // Strip markdown blocks if generated
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(json)?/i, '');
    clean = clean.replace(/```$/i, '');
  }
  return JSON.parse(clean.trim());
}

/**
 * Public Privacy Policy Endpoint for Meta Compliance
 */
app.get('/privacy', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>DeskFlow AI Privacy Policy</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
          h1 { border-bottom: 1px solid #eee; padding-bottom: 10px; color: #111; }
        </style>
      </head>
      <body>
        <h1>Privacy Policy</h1>
        <p><strong>Last Updated: May 31, 2026</strong></p>
        <p>DeskFlow AI (referred to as "we", "us", or "our") values your privacy. This Privacy Policy details how we collect, store, and manage your WhatsApp Business credentials and customer communication logs.</p>
        <h2>1. Information We Collect</h2>
        <p>When you connect your WhatsApp account via Meta's Embedded Signup, we retrieve user access tokens and phone number identifiers to authenticate your webhook calls.</p>
        <h2>2. Data Processing and Storage</h2>
        <p>All data is processed using Gemini API and secure database storage to automate scheduling and CRM functions.</p>
      </body>
    </html>
  `);
});

/**
 * 1. Webhook Verification (Required by Meta when you save callback URL)
 */
app.get('/v1/webhooks', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully by Meta!');
    return res.status(200).send(challenge);
  } else {
    console.warn('Webhook verification failed. Tokens mismatch!');
    return res.sendStatus(403);
  }
});

/**
 * 2. Webhook Event Handler (Triggered when a customer sends a message)
 */
app.post('/v1/webhooks', async (req, res) => {
  try {
    const body = req.body;
    console.log('Webhook received event body:', JSON.stringify(body, null, 2));

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const customerPhone = message.from; // Customer's phone number
        const customerName = value.contacts?.[0]?.profile?.name || 'Customer';
        const userText = message.text.body;
        const phoneId = value.metadata?.phone_number_id;

        console.log(`Received message from ${customerName} (${customerPhone}) on Phone ID ${phoneId}: ${userText}`);

        // Route webhook to the corresponding user profile by matching phone ID
        const profile = await getProfileByPhoneId(phoneId);
        const activeProfile = profile || {
          businessName: 'DeskFlow Client',
          niche: 'dental',
          businessAddress: '100 Feet Road, Indiranagar, Bangalore',
          businessPhone: '+91 99000 88000',
          businessWebsite: 'https://www.deskflowai.com',
          aiPersona: 'Friendly',
          email: 'kartikparashar15@gmail.com'
        };

        // Process message, reply on WhatsApp, and save to CRM database in a single Gemini call
        if (aiClient) {
          processIncomingMessage(userText, customerPhone, customerName, activeProfile).catch(err => {
            console.error('Error running combined AI message processor:', err.message);
          });
        } else {
          console.warn('Gemini client not initialized, sending fallback placeholder reply.');
          await sendWhatsAppMessage(customerPhone, "Thank you for your message! Our AI assistant is configuring. How can we help you?", activeProfile);
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    console.error('Webhook handling error:', err.message);
    return res.status(500).send('Webhook processing error');
  }
});

/**
 * 3. Receive Business Profile updates from frontend dashboard
 */
app.post('/v1/business-profile', checkAuth, async (req, res) => {
  try {
    const profileData = req.body;
    const emailKey = req.user.email.toLowerCase();
    console.log('Received business profile update request for:', emailKey);

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database is not initialized.' });
    }

    const whatsappConfigStr = JSON.stringify(profileData.whatsappConfig || {});
    const is_onboarded = profileData.isOnboarded ? 1 : 0;

    await db.run(`
      INSERT INTO business_profiles (
        email, name, avatar, avatar_img, role, niche, is_onboarded, 
        business_name, business_phone, business_address, business_website, 
        ai_persona, phone_number_id, whatsapp_config
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        avatar = excluded.avatar,
        avatar_img = excluded.avatar_img,
        role = excluded.role,
        niche = excluded.niche,
        is_onboarded = excluded.is_onboarded,
        business_name = excluded.business_name,
        business_phone = excluded.business_phone,
        business_address = excluded.business_address,
        business_website = excluded.business_website,
        ai_persona = excluded.ai_persona,
        phone_number_id = excluded.phone_number_id,
        whatsapp_config = excluded.whatsapp_config
    `,
      emailKey,
      profileData.name || '',
      profileData.avatar || '',
      profileData.avatarImg || '',
      profileData.role || 'owner',
      profileData.niche || 'dental',
      is_onboarded,
      profileData.businessName || '',
      profileData.businessPhone || '',
      profileData.businessAddress || '',
      profileData.businessWebsite || '',
      profileData.aiPersona || 'Friendly',
      profileData.phoneNumberId || '',
      whatsappConfigStr
    );

    console.log(`Successfully synced business profile for email ${emailKey}`);
    return res.status(200).json({ success: true, message: 'Business profile synced in SQL successfully!' });
  } catch (error) {
    console.error('Error saving business profile to SQL:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3d. GET active user's business profile from SQL
 */
app.get('/v1/business-profile', checkAuth, async (req, res) => {
  try {
    const emailKey = req.user.email.toLowerCase();
    const profile = await getProfileByEmail(emailKey);
    return res.status(200).json(profile || { email: emailKey, isNew: true });
  } catch (error) {
    console.error('Error fetching business profile:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3b. Receive user registration/login event and store credentials in SQLite DB
 */
app.post('/v1/users', checkAuth, async (req, res) => {
  try {
    const userData = req.body;
    const emailKey = req.user.email.toLowerCase();
    console.log('Received user credential sync request for:', emailKey);

    const name = userData.name || emailKey.split('@')[0];
    const phone = userData.phone || '';
    const userId = userData.id || 'u-' + Date.now();

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database is not initialized.' });
    }

    // Upsert into SQL table using SQLite supported UPSERT statement:
    await db.run(`
      INSERT INTO users (id, name, email, phone, last_login)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        phone = excluded.phone,
        last_login = CURRENT_TIMESTAMP
    `, userId, name, emailKey, phone);

    console.log(`[SQL Database] Successfully logged credential record for: ${emailKey}`);
    return res.status(200).json({ success: true, message: 'User credential stored in SQL successfully!' });
  } catch (error) {
    console.error('Error saving user credential to SQL database:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3c. GET registered users/credentials list from SQLite DB (for verification/admin lookup)
 */
app.get('/v1/users', checkAuth, async (req, res) => {
  try {
    if (req.user.email.toLowerCase() !== 'admin@deskflow.com') {
      return res.status(403).json({ success: false, error: 'Access denied: Administrators only.' });
    }
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database is not initialized.' });
    }
    const rows = await db.all('SELECT * FROM users ORDER BY last_login DESC');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching users from SQL database:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. GET WhatsApp captured CRM Leads
 */
app.get('/v1/leads', checkAuth, async (req, res) => {
  try {
    const emailKey = req.user.email.toLowerCase();
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database is not initialized.' });
    }
    const rows = await db.all('SELECT * FROM leads WHERE owner_email = ? ORDER BY date DESC', emailKey);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching leads from SQL:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. GET WhatsApp booked CRM Appointments
 */
app.get('/v1/appointments', checkAuth, async (req, res) => {
  try {
    const emailKey = req.user.email.toLowerCase();
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database is not initialized.' });
    }
    const rows = await db.all('SELECT * FROM appointments WHERE owner_email = ? ORDER BY date_time DESC', emailKey);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching appointments from SQL:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5b. DELETE WhatsApp booked CRM Appointment
 */
app.delete('/v1/appointments/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const emailKey = req.user.email.toLowerCase();
    console.log(`[CRM] Request to delete appointment ID: ${id} by owner ${emailKey}`);

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database is not initialized.' });
    }

    await db.run('DELETE FROM appointments WHERE id = ? AND owner_email = ?', id, emailKey);
    return res.status(200).json({ success: true, message: 'Appointment deleted successfully!' });
  } catch (error) {
    console.error('Error deleting appointment from SQL:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5c. DELETE WhatsApp captured CRM Lead
 */
app.delete('/v1/leads/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const emailKey = req.user.email.toLowerCase();
    console.log(`[CRM] Request to delete lead ID: ${id} by owner ${emailKey}`);

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database is not initialized.' });
    }

    await db.run('DELETE FROM leads WHERE id = ? AND owner_email = ?', id, emailKey);
    return res.status(200).json({ success: true, message: 'Lead deleted successfully!' });
  } catch (error) {
    console.error('Error deleting lead from SQL:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. POST Clear CRM Mock Database
 */
app.post('/v1/clear-crm', checkAuth, async (req, res) => {
  try {
    const emailKey = req.user.email.toLowerCase();
    console.log(`[CRM] Clearing database records for owner: ${emailKey}`);

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database is not initialized.' });
    }

    await db.run('DELETE FROM leads WHERE owner_email = ?', emailKey);
    await db.run('DELETE FROM appointments WHERE owner_email = ?', emailKey);
    return res.status(200).json({ success: true, message: 'Your CRM data cleared successfully!' });
  } catch (error) {
    console.error('Error clearing CRM data in SQL:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 7. POST Create Manual/Simulator CRM Lead
 */
app.post('/v1/leads', checkAuth, async (req, res) => {
  try {
    const { id, name, phone, requirement, budget, location, status, source, date } = req.body;
    const ownerEmail = req.user.email.toLowerCase();
    if (!db) return res.status(500).json({ success: false, error: 'Database is not initialized.' });

    await db.run(`
      INSERT INTO leads (id, owner_email, name, phone, requirement, budget, location, status, source, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        phone = excluded.phone,
        requirement = excluded.requirement,
        budget = excluded.budget,
        location = excluded.location,
        status = excluded.status,
        source = excluded.source,
        date = excluded.date
    `, id, ownerEmail, name, phone, requirement, budget, location, status, source, date);

    return res.status(200).json({ success: true, message: 'Lead saved in SQL successfully!' });
  } catch (error) {
    console.error('Error saving lead to SQL:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 8. POST Create Manual/Simulator CRM Appointment
 */
app.post('/v1/appointments', checkAuth, async (req, res) => {
  try {
    const { id, name, phone, service, dateTime, status, reminderSent } = req.body;
    const ownerEmail = req.user.email.toLowerCase();
    if (!db) return res.status(500).json({ success: false, error: 'Database is not initialized.' });

    await db.run(`
      INSERT INTO appointments (id, owner_email, name, phone, service, date_time, status, reminder_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        phone = excluded.phone,
        service = excluded.service,
        date_time = excluded.date_time,
        status = excluded.status,
        reminder_sent = excluded.reminder_sent
    `, id, ownerEmail, name, phone, service, dateTime, status, reminderSent ? 1 : 0);

    return res.status(200).json({ success: true, message: 'Appointment saved in SQL successfully!' });
  } catch (error) {
    console.error('Error saving appointment to SQL:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 9. GET CRM Referrals
 */
app.get('/v1/referrals', checkAuth, async (req, res) => {
  try {
    const ownerEmail = req.user.email.toLowerCase();
    if (!db) return res.status(500).json({ success: false, error: 'Database is not initialized.' });
    const rows = await db.all('SELECT * FROM referrals WHERE owner_email = ?', ownerEmail);
    const mapped = rows.map(r => ({
      id: r.id,
      referrerName: r.referrer_name,
      referrerPhone: r.referrer_phone,
      code: r.code,
      discountValue: r.discount_value,
      status: r.status
    }));
    return res.status(200).json(mapped);
  } catch (error) {
    console.error('Error fetching referrals:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 10. POST Create/Update CRM Referral
 */
app.post('/v1/referrals', checkAuth, async (req, res) => {
  try {
    const { id, referrerName, referrerPhone, code, discountValue, status } = req.body;
    const ownerEmail = req.user.email.toLowerCase();
    if (!db) return res.status(500).json({ success: false, error: 'Database is not initialized.' });

    await db.run(`
      INSERT INTO referrals (id, owner_email, referrer_name, referrer_phone, code, discount_value, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        referrer_name = excluded.referrer_name,
        referrer_phone = excluded.referrer_phone,
        code = excluded.code,
        discount_value = excluded.discount_value,
        status = excluded.status
    `, id, ownerEmail, referrerName, referrerPhone, code, discountValue, status);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving referral:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 11. GET CRM Reviews
 */
app.get('/v1/reviews', checkAuth, async (req, res) => {
  try {
    const ownerEmail = req.user.email.toLowerCase();
    if (!db) return res.status(500).json({ success: false, error: 'Database is not initialized.' });
    const rows = await db.all('SELECT * FROM reviews WHERE owner_email = ?', ownerEmail);
    const mapped = rows.map(r => ({
      id: r.id,
      customerName: r.customer_name,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      niche: r.niche
    }));
    return res.status(200).json(mapped);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 12. POST Create/Update CRM Review
 */
app.post('/v1/reviews', checkAuth, async (req, res) => {
  try {
    const { id, customerName, rating, comment, status, niche } = req.body;
    const ownerEmail = req.user.email.toLowerCase();
    if (!db) return res.status(500).json({ success: false, error: 'Database is not initialized.' });

    await db.run(`
      INSERT INTO reviews (id, owner_email, customer_name, rating, comment, status, niche)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        customer_name = excluded.customer_name,
        rating = excluded.rating,
        comment = excluded.comment,
        status = excluded.status,
        niche = excluded.niche
    `, id, ownerEmail, customerName, rating, comment, status, niche);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving review:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 13. POST Live AI Simulator Endpoint
 */
app.post('/v1/test-agent-reply', checkAuth, async (req, res) => {
  try {
    const { message, customerPhone, customerName } = req.body;
    const emailKey = req.user.email.toLowerCase();

    // Fetch profile
    const profile = await getProfileByEmail(emailKey);
    const activeProfile = profile || {
      businessName: 'DeskFlow Client',
      niche: 'dental',
      businessAddress: '100 Feet Road, Indiranagar, Bangalore',
      businessPhone: '+91 99000 88000',
      businessWebsite: 'https://www.deskflowai.com',
      aiPersona: 'Friendly',
      email: emailKey
    };

    if (!aiClient) {
      return res.status(200).json({
        reply: "Gemini AI is not configured. Please set your GEMINI_API_KEY in the environment.",
        isBooking: false,
        isLead: false
      });
    }

    const today = new Date();
    const categoryLabel = activeProfile.niche === 'dental' ? 'Dental Clinic' : 'Hair Salon & Spa';

    const combinedPrompt = `You are a front desk database parser and conversational agent.
Analyze this WhatsApp client query: "${message}"
From sender: Name: "${customerName || 'Test Customer'}", Phone: "${customerPhone || '9999999999'}".
Current date is: ${today.toDateString()} (Day: ${today.toLocaleDateString('en-US', { weekday: 'long' })}).

You are the AI Front Desk for "${activeProfile.businessName}", a premium ${categoryLabel} located at "${activeProfile.businessAddress}".
Business contact: Phone: ${activeProfile.businessPhone}, Website: ${activeProfile.businessWebsite}.
Your personality: ${activeProfile.aiPersona} (always polite, helpful, and concise).

Tasks:
1. Generate a friendly reply to the client (strictly under 3 sentences) addressing their message or confirming their booking slot.
2. Determine if the customer is requesting to book an appointment or providing lead details. Extract structured booking information (Name, Service, computed ISO date-time string YYYY-MM-DDTHH:MM:SS assuming year is 2026, and brief notes).

You MUST reply ONLY with a valid JSON block matching this exact structure, do not wrap it in anything else, do not include markdown blocks:
{
  "reply": "conversational reply under 3 sentences to send to WhatsApp",
  "isBooking": true/false,
  "isLead": true/false,
  "customerName": "extracted customer name or fallback",
  "service": "extracted service name (e.g. Teeth Cleaning, Haircut) or null",
  "dateTime": "computed YYYY-MM-DDTHH:MM:SS format string or human-readable fallback or null",
  "notes": "brief summary of their query or null"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: combinedPrompt }]
        }
      ]
    });

    const parsed = parseCleanJSON(response.text);
    console.log('[AI Simulator Engine] Combined parsing output:', parsed);

    const targetPhone = customerPhone || '9999999999';
    const targetName = parsed.customerName || customerName || 'Test Customer';

    // Save CRM details to SQLite database
    if (db) {
      if (parsed.isLead || parsed.isBooking) {
        const exists = await db.get('SELECT id FROM leads WHERE phone = ? AND owner_email = ?', targetPhone, emailKey);
        if (!exists) {
          const leadId = 'wa-lead-' + Date.now();
          await db.run(`
            INSERT INTO leads (id, owner_email, name, phone, requirement, budget, location, status, source, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
            leadId,
            emailKey,
            targetName,
            targetPhone,
            parsed.service || 'Simulator Inquiry',
            'N/A',
            'Simulator Panel',
            'new',
            'Simulator AI',
            new Date().toISOString()
          );
        }
      }

      if (parsed.isBooking && parsed.dateTime) {
        const apptId = 'wa-appt-' + Date.now();
        await db.run(`
          INSERT INTO appointments (id, owner_email, name, phone, service, date_time, status, reminder_sent)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        `,
          apptId,
          emailKey,
          targetName,
          targetPhone,
          parsed.service || 'Appointment',
          parsed.dateTime,
          'confirmed'
        );
      }
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('[AI Simulator Engine] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Helper: Call Meta Graph API to send WhatsApp message
 */
async function sendWhatsAppMessage(toPhone, textBody, profile = null) {
  const token = (profile?.whatsappConfig?.accessToken && !profile.whatsappConfig.accessToken.includes('secure_bearer'))
    ? profile.whatsappConfig.accessToken
    : META_ACCESS_TOKEN;
  const phoneId = profile?.phoneNumberId || profile?.whatsappConfig?.phoneNumberId || PHONE_NUMBER_ID;

  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toPhone,
    type: "text",
    text: {
      preview_url: false,
      body: textBody
    }
  };

  try {
    console.log(`Sending message to ${toPhone} using Phone ID ${phoneId}...`);
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Message sent successfully. Message ID:', response.data.messages[0].id);
  } catch (error) {
    console.error('Meta Graph API Error:', error.response?.data || error.message);
  }
}

/**
 * Helper: Generate response using Gemini AI SDK with dynamic profile parameters
 */
/**
 * Combined Helper: Generate response and extract CRM details in a single Gemini call
 */
async function processIncomingMessage(userMessage, customerPhone, customerName, profile) {
  try {
    const today = new Date();
    const categoryLabel = profile.niche === 'dental' ? 'Dental Clinic' : 'Hair Salon & Spa';
    
    console.log(`[AI Engine] Processing message from ${customerName} (${customerPhone}) for ${profile.businessName}...`);

    const combinedPrompt = `You are a front desk database parser and conversational agent.
Analyze this WhatsApp client query: "${userMessage}"
From sender: Name: "${customerName}", Phone: "${customerPhone}".
Current date is: ${today.toDateString()} (Day: ${today.toLocaleDateString('en-US', { weekday: 'long' })}).

You are the AI Front Desk for "${profile.businessName}", a premium ${categoryLabel} located at "${profile.businessAddress}".
Business contact: Phone: ${profile.businessPhone}, Website: ${profile.businessWebsite}.
Your personality: ${profile.aiPersona} (always polite, helpful, and concise).

Tasks:
1. Generate a friendly reply to the client (strictly under 3 sentences) addressing their message or confirming their booking slot.
2. Determine if the customer is requesting to book an appointment or providing lead details. Extract structured booking information (Name, Service, computed ISO date-time string YYYY-MM-DDTHH:MM:SS assuming year is 2026, and brief notes).

You MUST reply ONLY with a valid JSON block matching this exact structure, do not wrap it in anything else, do not include markdown blocks:
{
  "reply": "conversational reply under 3 sentences to send to WhatsApp",
  "isBooking": true/false,
  "isLead": true/false,
  "customerName": "extracted customer name or fallback",
  "service": "extracted service name (e.g. Teeth Cleaning, Haircut) or null",
  "dateTime": "computed YYYY-MM-DDTHH:MM:SS format string or human-readable fallback or null",
  "notes": "brief summary of their query or null"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: combinedPrompt }]
        }
      ]
    });

    const parsed = parseCleanJSON(response.text);
    console.log('[AI Engine] Combined parsing output:', parsed);

    // 1. Send the AI reply back on WhatsApp
    if (parsed.reply) {
      await sendWhatsAppMessage(customerPhone, parsed.reply, profile);
    }

    // 2. Save CRM details to SQL database
    const ownerEmail = profile.email || 'kartikparashar15@gmail.com';

    if (!db) {
      console.warn('[AI Engine] Database not initialized. Skipping CRM log.');
      return;
    }

    if (parsed.isLead || parsed.isBooking) {
      const exists = await db.get('SELECT id FROM leads WHERE phone = ? AND owner_email = ?', customerPhone, ownerEmail.toLowerCase());
      if (!exists) {
        const leadId = 'wa-lead-' + Date.now();
        await db.run(`
          INSERT INTO leads (id, owner_email, name, phone, requirement, budget, location, status, source, date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          leadId,
          ownerEmail.toLowerCase(),
          parsed.customerName || customerName,
          customerPhone,
          parsed.service || 'WhatsApp Inquiry',
          'N/A',
          'WhatsApp Client',
          'new',
          'WhatsApp AI',
          new Date().toISOString()
        );
        console.log(`[SQL Database] Saved new Lead from WhatsApp: ${parsed.customerName || customerName} under email ${ownerEmail}`);
      }
    }

    if (parsed.isBooking && parsed.dateTime) {
      const apptId = 'wa-appt-' + Date.now();
      await db.run(`
        INSERT INTO appointments (id, owner_email, name, phone, service, date_time, status, reminder_sent)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `,
        apptId,
        ownerEmail.toLowerCase(),
        parsed.customerName || customerName,
        customerPhone,
        parsed.service || 'Appointment',
        parsed.dateTime,
        'confirmed'
      );
      console.log(`[SQL Database] Saved new Appointment from WhatsApp: ${parsed.customerName || customerName} on ${parsed.dateTime} under email ${ownerEmail}`);
    }

  } catch (err) {
    console.error('[AI Engine] Error processing incoming message:', err.message);
    // Fallback reply if everything fails
    await sendWhatsAppMessage(customerPhone, `Hi ${customerName}, thank you for contacting us. We received your request and will get back to you shortly!`, profile);
  }
}

// Catch-all route to serve the React index.html for client-side routing (Single Page App)
app.get('*all', (req, res, next) => {
  // If the request starts with /v1/ or is for Meta privacy policy, let it pass through to the routing handlers
  if (req.path.startsWith('/v1/') || req.path === '/privacy') {
    return next();
  }
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 DeskFlow Express Webhook server running on port ${PORT}`);
  console.log(`🔗 Webhook Callback URL endpoint: http://localhost:${PORT}/v1/webhooks`);
  console.log(`🔑 Verification Token: ${VERIFY_TOKEN}`);
  console.log(`======================================================\n`);
});
