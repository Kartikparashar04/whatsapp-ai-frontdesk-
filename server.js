import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend dashboard

const PORT = process.env.PORT || 3000;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'deskflow_verify_token_secure_99';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// JSON DB Paths
const LEADS_FILE = path.join(process.cwd(), 'leads.json');
const APPOINTMENTS_FILE = path.join(process.cwd(), 'appointments.json');
const PROFILES_FILE = path.join(process.cwd(), 'business_profiles.json');

// Initialize JSON Database files if they don't exist
async function initDatabases() {
  try {
    await fs.access(LEADS_FILE);
  } catch {
    await fs.writeFile(LEADS_FILE, JSON.stringify([], null, 2), 'utf8');
  }

  try {
    await fs.access(APPOINTMENTS_FILE);
  } catch {
    await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify([], null, 2), 'utf8');
  }

  try {
    await fs.access(PROFILES_FILE);
  } catch {
    await fs.writeFile(PROFILES_FILE, JSON.stringify({}, null, 2), 'utf8');
  }
}
initDatabases();

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
    `);
    console.log('SQLite Database and users table initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize SQLite Database:', error.message);
  }
}
initSQLite();

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
 * Helper: Load a specific Business Profile by email
 */
async function getProfileByEmail(email) {
  try {
    const data = await fs.readFile(PROFILES_FILE, 'utf8');
    const profiles = JSON.parse(data);
    return profiles[email.toLowerCase()] || null;
  } catch (error) {
    return null;
  }
}

/**
 * Helper: Load Business Profile by phone number ID (for incoming webhooks)
 */
async function getProfileByPhoneId(phoneId) {
  try {
    const data = await fs.readFile(PROFILES_FILE, 'utf8');
    const profiles = JSON.parse(data);
    // Find the first profile that matches this phoneId
    const profile = Object.values(profiles).find(p => p.phoneNumberId === phoneId || p.businessPhoneId === phoneId);
    return profile || null;
  } catch (error) {
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
          email: 'default@deskflow.com'
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
app.post('/v1/business-profile', async (req, res) => {
  try {
    const profileData = req.body;
    console.log('Received business profile update request:', profileData);
    
    if (!profileData.email) {
      return res.status(400).json({ success: false, error: 'Email parameter is required to save profile.' });
    }

    const emailKey = profileData.email.toLowerCase();
    
    // Load profiles mapping
    let profiles = {};
    try {
      const data = await fs.readFile(PROFILES_FILE, 'utf8');
      profiles = JSON.parse(data);
    } catch (err) {}

    profiles[emailKey] = {
      ...profileData,
      email: emailKey,
      phoneNumberId: profileData.phoneNumberId || profileData.businessPhoneId || ''
    };

    await fs.writeFile(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf8');
    console.log(`Successfully synced business profile for: ${profileData.businessName} under email ${emailKey}`);
    return res.status(200).json({ success: true, message: 'Business profile synced successfully!' });
  } catch (error) {
    console.error('Error saving business profile:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3b. Receive user registration/login event and store credentials in SQLite DB
 */
app.post('/v1/users', async (req, res) => {
  try {
    const userData = req.body;
    console.log('Received user credential sync request:', userData);
    
    if (!userData.email) {
      return res.status(400).json({ success: false, error: 'Email parameter is required.' });
    }

    const emailKey = userData.email.toLowerCase();
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
app.get('/v1/users', async (req, res) => {
  try {
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
app.get('/v1/leads', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(200).json([]);
    }
    const data = await fs.readFile(LEADS_FILE, 'utf8');
    const leads = JSON.parse(data);
    const filtered = leads.filter(l => l.ownerEmail && l.ownerEmail.toLowerCase() === email.toLowerCase());
    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(200).json([]);
  }
});

/**
 * 5. GET WhatsApp booked CRM Appointments
 */
app.get('/v1/appointments', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(200).json([]);
    }
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const appts = JSON.parse(data);
    const filtered = appts.filter(a => a.ownerEmail && a.ownerEmail.toLowerCase() === email.toLowerCase());
    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(200).json([]);
  }
});

/**
 * 5b. DELETE WhatsApp booked CRM Appointment
 */
app.delete('/v1/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[CRM] Request to delete appointment ID: ${id}`);
    
    const apptsData = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const appts = JSON.parse(apptsData);
    
    const filtered = appts.filter(a => a.id !== id);
    await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify(filtered, null, 2), 'utf8');
    
    console.log(`[CRM] Deleted appointment ID: ${id}`);
    return res.status(200).json({ success: true, message: 'Appointment deleted successfully!' });
  } catch (error) {
    console.error('Error deleting appointment:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5c. DELETE WhatsApp captured CRM Lead
 */
app.delete('/v1/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[CRM] Request to delete lead ID: ${id}`);
    
    const leadsData = await fs.readFile(LEADS_FILE, 'utf8');
    const leads = JSON.parse(leadsData);
    
    const filtered = leads.filter(l => l.id !== id);
    await fs.writeFile(LEADS_FILE, JSON.stringify(filtered, null, 2), 'utf8');
    
    console.log(`[CRM] Deleted lead ID: ${id}`);
    return res.status(200).json({ success: true, message: 'Lead deleted successfully!' });
  } catch (error) {
    console.error('Error deleting lead:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. POST Clear CRM Mock Database
 */
app.post('/v1/clear-crm', async (req, res) => {
  try {
    await fs.writeFile(LEADS_FILE, JSON.stringify([], null, 2), 'utf8');
    await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify([], null, 2), 'utf8');
    console.log('[CRM] Database cleared successfully.');
    return res.status(200).json({ success: true, message: 'CRM data cleared successfully!' });
  } catch (error) {
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

    // 2. Save CRM details to database files
    const ownerEmail = profile.email || 'default@deskflow.com';

    if (parsed.isLead || parsed.isBooking) {
      const leadsData = await fs.readFile(LEADS_FILE, 'utf8');
      const leads = JSON.parse(leadsData);
      
      const exists = leads.find(l => l.phone === customerPhone && l.ownerEmail === ownerEmail);
      if (!exists) {
        const newLead = {
          id: 'wa-lead-' + Date.now(),
          ownerEmail: ownerEmail,
          name: parsed.customerName || customerName,
          phone: customerPhone,
          requirement: parsed.service || 'WhatsApp Inquiry',
          budget: 'N/A',
          location: 'WhatsApp Client',
          status: 'new',
          source: 'WhatsApp AI',
          date: new Date().toISOString()
        };
        leads.push(newLead);
        await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
        console.log(`[CRM] Saved new Lead from WhatsApp: ${newLead.name} under email ${ownerEmail}`);
      }
    }

    if (parsed.isBooking && parsed.dateTime) {
      const apptsData = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
      const appts = JSON.parse(apptsData);
      
      const newAppt = {
        id: 'wa-appt-' + Date.now(),
        ownerEmail: ownerEmail,
        name: parsed.customerName || customerName,
        phone: customerPhone,
        service: parsed.service || 'Appointment',
        dateTime: parsed.dateTime,
        status: 'confirmed',
        reminderSent: false
      };
      appts.push(newAppt);
      await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify(appts, null, 2), 'utf8');
      console.log(`[CRM] Saved new Appointment from WhatsApp: ${newAppt.name} on ${newAppt.dateTime} under email ${ownerEmail}`);
    }

  } catch (err) {
    console.error('[AI Engine] Error processing incoming message:', err.message);
    // Fallback reply if everything fails
    await sendWhatsAppMessage(customerPhone, `Hi ${customerName}, thank you for contacting us. We received your request and will get back to you shortly!`, profile);
  }
}

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 DeskFlow Express Webhook server running on port ${PORT}`);
  console.log(`🔗 Webhook Callback URL endpoint: http://localhost:${PORT}/v1/webhooks`);
  console.log(`🔑 Verification Token: ${VERIFY_TOKEN}`);
  console.log(`======================================================\n`);
});
