import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

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
const PROFILE_FILE = path.join(process.cwd(), 'business_profile.json');

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
}
initDatabases();

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
 * Helper: Load Business Profile coordinates dynamically
 */
async function loadBusinessProfile() {
  try {
    const data = await fs.readFile(PROFILE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      businessName: 'DeskFlow Client',
      niche: 'dental',
      businessAddress: '100 Feet Road, Indiranagar, Bangalore',
      businessPhone: '+91 99000 88000',
      businessWebsite: 'https://www.deskflowai.com',
      aiPersona: 'Friendly'
    };
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

        console.log(`Received message from ${customerName} (${customerPhone}): ${userText}`);

        // A. Generate reply using Gemini AI
        let aiResponse = "Thank you for your message! Our AI assistant is configuring. How can we help you?";
        if (aiClient) {
          aiResponse = await generateAIResponse(userText, customerName);
        } else {
          console.warn('Gemini client not initialized, using placeholder reply.');
        }

        // B. Send the AI reply back to the customer on WhatsApp
        await sendWhatsAppMessage(customerPhone, aiResponse);

        // C. Parse the message for CRM leads/appointments in the background
        if (aiClient) {
          parseAndSaveCRM(userText, customerPhone, customerName).catch(err => {
            console.error('Error running CRM background sync parser:', err.message);
          });
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
    await fs.writeFile(PROFILE_FILE, JSON.stringify(profileData, null, 2), 'utf8');
    console.log(`Successfully synced business profile for: ${profileData.businessName}`);
    return res.status(200).json({ success: true, message: 'Business profile synced successfully!' });
  } catch (error) {
    console.error('Error saving business profile:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. GET WhatsApp captured CRM Leads
 */
app.get('/v1/leads', async (req, res) => {
  try {
    const data = await fs.readFile(LEADS_FILE, 'utf8');
    return res.status(200).json(JSON.parse(data));
  } catch (error) {
    return res.status(200).json([]);
  }
});

/**
 * 5. GET WhatsApp booked CRM Appointments
 */
app.get('/v1/appointments', async (req, res) => {
  try {
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    return res.status(200).json(JSON.parse(data));
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
async function sendWhatsAppMessage(toPhone, textBody) {
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
  
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
    console.log(`Sending message to ${toPhone}...`);
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
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
async function generateAIResponse(userMessage, customerName) {
  try {
    const profile = await loadBusinessProfile();
    const categoryLabel = profile.niche === 'dental' ? 'Dental Clinic' : 'Hair Salon & Spa';
    
    console.log(`Generating dynamic AI response for ${profile.businessName} (Niche: ${profile.niche})...`);

    const systemPrompt = `You are the primary AI Front Desk assistant for "${profile.businessName}", a premium ${categoryLabel} located at "${profile.businessAddress}".
Your business contact phone number is ${profile.businessPhone} and website is ${profile.businessWebsite}.
Your personality tone is ${profile.aiPersona} (always polite, helpful, and concise).

Your tasks are:
1. Greet the client (their name is ${customerName}).
2. Assist them with slot bookings, clinic/salon services, price quotes, and locations.
3. Keep responses friendly, helpful, and concise (strictly under 3 sentences).

Customer's message: "${userMessage}"`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ]
    });

    return response.text;
  } catch (error) {
    console.error('Gemini AI Generation Error:', error.message);
    return `Hi ${customerName}, thank you for contacting us. We received your message and will get back to you shortly!`;
  }
}

/**
 * Helper: Background parsing of incoming messages to extract structured leads/appointments
 */
async function parseAndSaveCRM(userMessage, customerPhone, customerName) {
  try {
    console.log(`[CRM Parser] Scanning message from ${customerPhone} for structured data...`);
    const today = new Date();
    
    const extractionPrompt = `You are a database extraction parser. Analyze this WhatsApp client query: "${userMessage}"
From sender details: Name: "${customerName}", Phone: "${customerPhone}".
Current date is: ${today.toDateString()} (Day: ${today.toLocaleDateString('en-US', { weekday: 'long' })}).

Determine if the customer is:
1. Requesting to book an appointment (e.g., booking a slot, scheduling, haircut on Monday 2pm).
2. Providing lead details or showing interest (e.g. sharing their name, asking for services/prices).

For the date and time, if they specify a relative time (like "tomorrow at 5pm", "this Friday 11am", "Monday 10am"), compute the correct target date and time. Output it as a standard ISO date-time string (YYYY-MM-DDTHH:MM:SS format, assume year is 2026). If it is too vague, fallback to a readable string.

You MUST reply ONLY with a valid JSON block matching this exact structure, do not wrap it in anything else, do not include markdown blocks:
{
  "isBooking": true/false,
  "isLead": true/false,
  "customerName": "extracted name or fallback to customerName",
  "service": "extracted service name (e.g. Dental Cleaning, Teeth Whitening, Haircut, Styling) or null",
  "dateTime": "computed YYYY-MM-DDTHH:MM:SS format string or human-readable fallback or null",
  "notes": "brief summary of their query or null"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: extractionPrompt }]
        }
      ]
    });

    const parsed = parseCleanJSON(response.text);
    console.log('[CRM Parser] Structured parsing output:', parsed);

    // Save Lead if they express interest or book
    if (parsed.isLead || parsed.isBooking) {
      const leadsData = await fs.readFile(LEADS_FILE, 'utf8');
      const leads = JSON.parse(leadsData);
      
      // Prevent duplicate leads for the same phone number
      const exists = leads.find(l => l.phone === customerPhone);
      if (!exists) {
        const newLead = {
          id: 'wa-lead-' + Date.now(),
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
        console.log(`[CRM] Saved new Lead from WhatsApp: ${newLead.name}`);
      }
    }

    // Save Appointment if isBooking is true
    if (parsed.isBooking && parsed.dateTime) {
      const apptsData = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
      const appts = JSON.parse(apptsData);
      
      const newAppt = {
        id: 'wa-appt-' + Date.now(),
        name: parsed.customerName || customerName, // Uses matching key "name"
        phone: customerPhone,
        service: parsed.service || 'Appointment',
        dateTime: parsed.dateTime, // standard ISO string or text
        status: 'confirmed',
        reminderSent: false
      };
      appts.push(newAppt);
      await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify(appts, null, 2), 'utf8');
      console.log(`[CRM] Saved new Appointment from WhatsApp: ${newAppt.name} on ${newAppt.dateTime}`);
    }

  } catch (err) {
    console.error('[CRM Parser] Extraction sync error:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 DeskFlow Express Webhook server running on port ${PORT}`);
  console.log(`🔗 Webhook Callback URL endpoint: http://localhost:${PORT}/v1/webhooks`);
  console.log(`🔑 Verification Token: ${VERIFY_TOKEN}`);
  console.log(`======================================================\n`);
});
