import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Calendar, 
  Settings, 
  Share2, 
  Star, 
  MessageSquare, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Bell, 
  ArrowUpRight, 
  Send, 
  Smartphone, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Coins,
  Download,
  AlertTriangle,
  RotateCcw,
  X,
  Lock,
  Mail,
  User as UserIcon,
  LogOut,
  Sparkles,
  Shield,
  Link as LinkIcon,
  Copy,
  Info
} from 'lucide-react';
import { 
  INITIAL_LEADS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_REFERRALS, 
  INITIAL_REVIEWS, 
  NICHE_CONFIGS 
} from './mockData';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';

// Firebase Client Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyPlaceholder_ChangeMe",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "frontdesk-dummy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "frontdesk-dummy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "frontdesk-dummy.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:00000000000000"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Backend URL configuration (Vite environment variables)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://app.frontdeskai.shop'
    : 'http://localhost:3000');


// Document Tab Title Flashing Helper
const flashTabTitle = (alertMessage) => {
  const originalTitle = document.title;
  let isAlert = false;
  let count = 0;
  const interval = setInterval(() => {
    document.title = isAlert ? alertMessage : originalTitle;
    isAlert = !isAlert;
    count++;
    if (count > 10) {
      clearInterval(interval);
      document.title = originalTitle;
    }
  }, 1000);
};

// Web Audio API Helper
const playAudioSfx = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'receive') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === 'send') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (err) {
    console.warn("AudioContext playback blocked", err);
  }
};

// MULTI-STEP ONBOARDING WIZARD COMPONENT
function OnboardingWizard({ user, setUser, nicheConfigs, setNicheConfigs, triggerToast, addActivity, authenticatedFetch }) {
  const [step, setStep] = React.useState(1);
  const [niche, setNiche] = React.useState(user.niche || 'dental');
  const [businessName, setBusinessName] = React.useState('');
  const [businessWebsite, setBusinessWebsite] = React.useState('');
  const [businessPhone, setBusinessPhone] = React.useState('');
  const [businessAddress, setBusinessAddress] = React.useState('');
  const [aiPersona, setAiPersona] = React.useState('Friendly');
  const [greetingMessage, setGreetingMessage] = React.useState('');

  React.useEffect(() => {
    if (niche === 'dental') {
      setGreetingMessage(`Hi! Thank you for contacting ${businessName || 'our clinic'}. 🦷 I'm your 24/7 AI front desk. How can I help you today? Would you like to schedule an appointment, check our service price list, or find our location?`);
    } else {
      setGreetingMessage(`Hello! Welcome to ${businessName || 'our salon'}. 💇‍♀️ I'm your personal AI front desk assistant. Would you like to book a styling or spa slot, explore our service prices, or know our timings?`);
    }
  }, [niche, businessName]);

  const handleNext = () => {
    if (step === 1) {
      if (!businessName.trim()) {
        alert("Please enter your business name.");
        return;
      }
    } else if (step === 2) {
      if (!businessPhone.trim()) {
        alert("Please enter a valid business phone number.");
        return;
      }
      if (!businessAddress.trim()) {
        alert("Please enter your business address.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleComplete = (e) => {
    e.preventDefault();
    
    const profilesLocal = localStorage.getItem('frontdesk_user_profiles');
    const profiles = profilesLocal ? JSON.parse(profilesLocal) : {};
    
    const updatedUser = {
      ...user,
      isOnboarded: true,
      niche: niche,
      businessName: businessName,
      businessPhone: businessPhone,
      businessAddress: businessAddress,
      businessWebsite: businessWebsite,
      aiPersona: aiPersona
    };
    
    localStorage.setItem('frontdesk_user', JSON.stringify(updatedUser));
    localStorage.setItem('frontdesk_user_profiles', JSON.stringify({
      ...profiles,
      [user.email.toLowerCase()]: updatedUser
    }));
    
    const updatedConfigs = {
      ...nicheConfigs,
      [niche]: {
        ...nicheConfigs[niche],
        businessName: businessName,
        greetingMessage: greetingMessage,
        systemPrompt: `You are the primary AI Front Desk agent for ${businessName}, a premium ${niche === 'dental' ? 'Dental Clinic' : 'Hair Salon & Spa'} located at ${businessAddress}. 
Your contact phone is ${businessPhone} and website is ${businessWebsite}.
Your personality is ${aiPersona} (always polite, helpful, and concise).
Your main tasks are:
1. Capture client full name, WhatsApp number, requested service, and location.
2. Confirm slots and schedule appointments.
3. Share the Google Review link: ${nicheConfigs[niche].reviewUrl} and referral codes to drive viral loyalty loops.`
      }
    };
    
    setNicheConfigs(updatedConfigs);
    localStorage.setItem('frontdesk_configs', JSON.stringify(updatedConfigs));
    
    setUser(updatedUser);
    
    // Sync profile to backend Express server
    authenticatedFetch(`${BACKEND_URL}/v1/business-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    }).catch(err => console.error("Error syncing profile with backend:", err));

    triggerToast("Your business profile has been initialized! Welcome to FrontDesk!", "green");
    addActivity(`New business profile onboarded: ${businessName} (${niche})`, 'success');
  };

  return (
    <div className="onboarding-backdrop">
      <div className="onboarding-card-panel">
        <div className="onboarding-header">
          <div className="logo-icon" style={{ margin: '0 auto 12px auto', width: '48px', height: '48px', fontSize: '1.6rem' }}>D</div>
          <h1>Complete Your Business Profile</h1>
          <p>Let's customize your WhatsApp AI assistant to fit your business</p>
        </div>

        {/* Progress Bar */}
        <div className="onboarding-progress-container">
          <div className="onboarding-progress-bar">
            <div 
              className="onboarding-progress-bar-fill" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
          </div>
          <div className={`onboarding-step-indicator ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className={`onboarding-step-indicator ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            {step > 2 ? '✓' : '2'}
          </div>
          <div className={`onboarding-step-indicator ${step === 3 ? 'active' : ''}`}>
            3
          </div>
        </div>

        <form onSubmit={handleComplete}>
          {/* Step 1: Business Identity & Category */}
          {step === 1 && (
            <div className="onboarding-step-content animate-slide-in">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px' }}>Step 1: Choose Your Business Category</h3>
              
              <div className="onboarding-niche-grid">
                <div 
                  className={`onboarding-niche-select-card ${niche === 'dental' ? 'selected' : ''}`}
                  onClick={() => setNiche('dental')}
                >
                  <span className="niche-emoji">🦷</span>
                  <h4>Dental Clinic</h4>
                  <p>For dental practices, surgeons, and cosmetic clinics (e.g. implants, whitening, checkups)</p>
                </div>
                
                <div 
                  className={`onboarding-niche-select-card ${niche === 'salon' ? 'selected' : ''}`}
                  onClick={() => setNiche('salon')}
                >
                  <span className="niche-emoji">💇‍♀️</span>
                  <h4>Hair Salon & Spa</h4>
                  <p>For hair styling, body massage, nail care, and wellness spas (e.g. haircuts, styling, manicure)</p>
                </div>
              </div>

              <div className="form-group">
                <label>Business Public Name</label>
                <input 
                  type="text" 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  placeholder={niche === 'dental' ? 'e.g. Zenith Dental Clinic' : 'e.g. Glow & Style Salon'} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Business Website (Optional)</label>
                <input 
                  type="url" 
                  value={businessWebsite} 
                  onChange={(e) => setBusinessWebsite(e.target.value)} 
                  placeholder="e.g. https://www.mybusiness.com" 
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <div className="onboarding-step-content animate-slide-in">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px' }}>Step 2: Business Address & Contact</h3>

              <div className="form-group">
                <label>Customer Phone Number (For WhatsApp Notifications)</label>
                <input 
                  type="tel" 
                  value={businessPhone} 
                  onChange={(e) => setBusinessPhone(e.target.value)} 
                  placeholder="e.g. +91 99000 88000" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Physical Store / Clinic Address</label>
                <input 
                  type="text" 
                  value={businessAddress} 
                  onChange={(e) => setBusinessAddress(e.target.value)} 
                  placeholder="e.g. 100 Feet Road, Indiranagar, Bangalore" 
                  required 
                />
              </div>
            </div>
          )}

          {/* Step 3: AI Setup */}
          {step === 3 && (
            <div className="onboarding-step-content animate-slide-in">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px' }}>Step 3: Setup AI Front Desk Behavior</h3>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ marginBottom: '8px', display: 'block' }}>Choose AI Assistant Persona/Tone</label>
                <div className="onboarding-tone-grid">
                  <div 
                    className={`onboarding-tone-card ${aiPersona === 'Professional' ? 'selected' : ''}`}
                    onClick={() => setAiPersona('Professional')}
                  >
                    <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>👔 Professional</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Polite, formal, healthcare-aligned.</p>
                  </div>
                  
                  <div 
                    className={`onboarding-tone-card ${aiPersona === 'Friendly' ? 'selected' : ''}`}
                    onClick={() => setAiPersona('Friendly')}
                  >
                    <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>🌸 Warm & Friendly</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Helpful, casual, welcoming tone.</p>
                  </div>
                  
                  <div 
                    className={`onboarding-tone-card ${aiPersona === 'Salesy' ? 'selected' : ''}`}
                    onClick={() => setAiPersona('Salesy')}
                  >
                    <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>⚡ Energetic & Salesy</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Focused on closing booking slots.</p>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Customize WhatsApp AI Welcome Message</label>
                <textarea 
                  value={greetingMessage} 
                  onChange={(e) => setGreetingMessage(e.target.value)} 
                  placeholder="Write the initial reply message..." 
                  style={{ minHeight: '110px' }}
                  required
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="onboarding-wizard-actions">
            {step > 1 ? (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleBack}
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleNext}
              >
                Continue
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-primary"
                style={{ background: 'var(--accent-green)', boxShadow: '0 2px 6px rgba(30,142,62,0.3)' }}
              >
                Launch My AI Front Desk 🚀
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  // Auth Session State
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem('frontdesk_user');
    return local ? JSON.parse(local) : null;
  });
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  
  const [authMode, setAuthMode] = useState('login'); // login, signup, admin_login, forgot_password
  const [authMethod, setAuthMethod] = useState('phone'); // phone, email
  
  // Firebase Auth states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  // Navigation & Niche Selection
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeNiche, setActiveNiche] = useState('dental');
  
  // App States
  const [leads, setLeads] = useState(() => {
    const local = localStorage.getItem('frontdesk_leads');
    return local ? JSON.parse(local) : [];
  });
  
  const [appointments, setAppointments] = useState(() => {
    const local = localStorage.getItem('frontdesk_appts');
    return local ? JSON.parse(local) : [];
  });
  
  const [referrals, setReferrals] = useState(() => {
    const local = localStorage.getItem('frontdesk_referrals');
    return local ? JSON.parse(local) : [];
  });
  
  const [reviews, setReviews] = useState(() => {
    const local = localStorage.getItem('frontdesk_reviews');
    return local ? JSON.parse(local) : [];
  });

  const [nicheConfigs, setNicheConfigs] = useState(() => {
    const local = localStorage.getItem('frontdesk_configs');
    return local ? JSON.parse(local) : NICHE_CONFIGS;
  });

  // WhatsApp Business API Config State
  const [whatsappConfig, setWhatsappConfig] = useState(() => {
    const local = localStorage.getItem('frontdesk_wa_config');
    return local ? JSON.parse(local) : { accessToken: '', phoneNumberId: '', accountId: '', isConnected: false };
  });

  // Modals Visibility
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [apptViewMode, setApptViewMode] = useState('cards');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [selectedPrefilledDate, setSelectedPrefilledDate] = useState('');
  const [metaStep, setMetaStep] = useState(1);
  const [metaOtpInput, setMetaOtpInput] = useState('');
  const [metaPhoneInput, setMetaPhoneInput] = useState('');
  const [metaOtpSent, setMetaOtpSent] = useState(false);
  const [metaVerificationError, setMetaVerificationError] = useState('');

  // Scheduling check variables
  const [selectedBookingTime, setSelectedBookingTime] = useState('');
  const [conflictWarning, setConflictWarning] = useState('');
  
  // UI Helpers
  const [searchQuery, setSearchQuery] = useState('');
  const [leadFilter, setLeadFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [activities, setActivities] = useState([
    { id: 1, text: 'Lead Anjali Sharma converted from WhatsApp', time: '10 mins ago', type: 'success' },
    { id: 2, text: 'Google Review Request clicked by Rohan Verma', time: '1 hour ago', type: 'info' },
    { id: 3, text: 'Referral coupon REF-SMILE-991 redeemed by client', time: '3 hours ago', type: 'reward' },
    { id: 4, text: 'AI assistant responded to enquiry for hair spa', time: '5 hours ago', type: 'ai' }
  ]);

  // Chat Simulator State
  const currentConfig = nicheConfigs[activeNiche];
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveAiMode, setIsLiveAiMode] = useState(false);
  const chatEndRef = useRef(null);

  // Chatbot State Machine tracking
  const [botState, setBotState] = useState({
    step: 'greeting',
    tempLead: { name: '', phone: '', requirement: '', budget: '', location: '' }
  });

  // REAL GOOGLE IDENTITY VERIFICATION INTEGRATION
  useEffect(() => {
    if (user) return; // Skip if already logged in

    const initGoogleGSI = () => {
      try {
        if (typeof window.google === 'undefined') {
          setTimeout(initGoogleGSI, 300);
          return;
        }

        window.google.accounts.id.initialize({
          client_id: "624702224877-qm9fe4fagh3janpme4jkfmbn7lli3ei0.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse
        });

        // Render official login button in the container
        const container = document.getElementById("google-signin-btn-container");
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: "370",
            shape: "pill"
          });
        }
      } catch (err) {
        console.warn("Google Client Identity API load error", err);
      }
    };

    initGoogleGSI();
  }, [user, authMode]);

  // Parse JWT token from Google login
  const handleGoogleCredentialResponse = (response) => {
    try {
      const token = response.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      const email = payload.email;

      const googleUser = {
        name: payload.name,
        email: payload.email,
        avatar: payload.name.substring(0, 1).toUpperCase(),
        avatarImg: payload.picture, // Google profile avatar url
        role: 'owner',
        niche: 'dental', // Default category
        isOnboarded: false, // Must onboard!
        businessName: '',
        businessPhone: '',
        businessAddress: '',
        businessWebsite: '',
        aiPersona: 'Friendly'
      };
      resolveUserProfileAndSetSession(googleUser);
      addActivity(`Google account connected: ${email}`, 'success');
    } catch (err) {
      console.error("Failed parsing Google credential JWT payload", err);
      triggerToast("Google credentials verification error.");
    }
  };

  // Auto-lock active niche based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        setActiveNiche(user.niche);
      }
    }
  }, [user]);

  // Dynamic WhatsApp CRM Sync Polling Hook
  useEffect(() => {
    if (!user) return;

    const mergeCRMData = (currentList, newList) => {
      const merged = [...currentList];
      let updated = false;
      
      newList.forEach(item => {
        const exists = merged.some(existing => existing.id === item.id);
        if (!exists) {
          merged.push(item);
          updated = true;
        }
      });
      return { merged, updated };
    };

    const interval = setInterval(async () => {
      try {
        // 1. Fetch leads from WhatsApp backend
        const resLeads = await authenticatedFetch(`${BACKEND_URL}/v1/leads`);
        if (!resLeads.ok) return;
        const waLeads = await resLeads.json();
        
        setLeads(prevLeads => {
          const { merged, updated } = mergeCRMData(prevLeads, waLeads);
          if (updated) {
            triggerToast("New Lead captured from WhatsApp AI!", "green");
            addActivity(`New lead captured from WhatsApp: ${waLeads[waLeads.length - 1].name}`, 'success');
            playAudioSfx('receive');
            flashTabTitle("⚠️ New WhatsApp Lead!");
          }
          return merged;
        });

        // 2. Fetch appointments from WhatsApp backend
        const resAppts = await authenticatedFetch(`${BACKEND_URL}/v1/appointments`);
        if (!resAppts.ok) return;
        const waAppts = await resAppts.json();
        
        setAppointments(prevAppts => {
          // Normalize appointments with local active niche
          const normalizedAppts = waAppts.map(appt => ({
            ...appt,
            dateTime: appt.dateTime || appt.date_time || '',
            niche: appt.niche || activeNiche
          }));

          const { merged, updated } = mergeCRMData(prevAppts, normalizedAppts);
          if (updated) {
            triggerToast("New Appointment booked via WhatsApp AI!", "green");
            addActivity(`Appointment scheduled via WhatsApp: ${normalizedAppts[normalizedAppts.length - 1].name || 'Client'}`, 'success');
            playAudioSfx('receive');
            flashTabTitle("📅 New Booking!");
          }
          return merged;
        });

        // 3. Fetch referrals from SQLite
        const resRefs = await authenticatedFetch(`${BACKEND_URL}/v1/referrals`);
        if (resRefs.ok) {
          const waRefs = await resRefs.json();
          setReferrals(prevRefs => {
            const { merged } = mergeCRMData(prevRefs, waRefs);
            return merged;
          });
        }

        // 4. Fetch reviews from SQLite
        const resRevs = await authenticatedFetch(`${BACKEND_URL}/v1/reviews`);
        if (resRevs.ok) {
          const waRevs = await resRevs.json();
          setReviews(prevRevs => {
            const { merged } = mergeCRMData(prevRevs, waRevs);
            return merged;
          });
        }

      } catch (err) {
        // Fail silently when server is offline or restarting
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user, activeNiche]);

  // Reset/Load user-specific data when user changes (login/logout/switch)
  useEffect(() => {
    if (user && user.email) {
      const emailKey = user.email.toLowerCase();
      
      const localLeads = localStorage.getItem(`frontdesk_leads_${emailKey}`);
      setLeads(localLeads ? JSON.parse(localLeads) : []);

      const localAppts = localStorage.getItem(`frontdesk_appts_${emailKey}`);
      setAppointments(localAppts ? JSON.parse(localAppts) : []);

      const localReferrals = localStorage.getItem(`frontdesk_referrals_${emailKey}`);
      setReferrals(localReferrals ? JSON.parse(localReferrals) : []);

      const localReviews = localStorage.getItem(`frontdesk_reviews_${emailKey}`);
      setReviews(localReviews ? JSON.parse(localReviews) : []);

      const localConfigs = localStorage.getItem(`frontdesk_configs_${emailKey}`);
      setNicheConfigs(localConfigs ? JSON.parse(localConfigs) : NICHE_CONFIGS);

      const localWaConfig = localStorage.getItem(`frontdesk_wa_config_${emailKey}`);
      setWhatsappConfig(localWaConfig ? JSON.parse(localWaConfig) : { accessToken: '', phoneNumberId: '', accountId: '', isConnected: false });
    } else {
      // Clear/Reset to default states when logged out
      setLeads([]);
      setAppointments([]);
      setReferrals([]);
      setReviews([]);
      setNicheConfigs(NICHE_CONFIGS);
      setWhatsappConfig({ accessToken: '', phoneNumberId: '', accountId: '', isConnected: false });
    }
  }, [user]);

  // Load Facebook JavaScript SDK on mount
  useEffect(() => {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId            : '866864605823070',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v21.0'
      });
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  // LocalStorage Synchronizers (scoped by user email)
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`frontdesk_leads_${user.email.toLowerCase()}`, JSON.stringify(leads));
    }
  }, [leads, user]);

  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`frontdesk_appts_${user.email.toLowerCase()}`, JSON.stringify(appointments));
    }
  }, [appointments, user]);

  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`frontdesk_referrals_${user.email.toLowerCase()}`, JSON.stringify(referrals));
    }
  }, [referrals, user]);

  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`frontdesk_reviews_${user.email.toLowerCase()}`, JSON.stringify(reviews));
    }
  }, [reviews, user]);

  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`frontdesk_configs_${user.email.toLowerCase()}`, JSON.stringify(nicheConfigs));
    }
  }, [nicheConfigs, user]);

  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`frontdesk_wa_config_${user.email.toLowerCase()}`, JSON.stringify(whatsappConfig));
      
      // Auto-sync WhatsApp config and phone ID to backend profiles mapping
      authenticatedFetch(`${BACKEND_URL}/v1/business-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...user,
          phoneNumberId: whatsappConfig?.phoneNumberId || '',
          whatsappConfig: whatsappConfig
        })
      }).catch(err => console.error("Error auto-syncing WhatsApp config to backend:", err));
    }
  }, [whatsappConfig, user]);

  // Save/Remove session key
  useEffect(() => {
    if (user) {
      localStorage.setItem('frontdesk_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('frontdesk_user');
    }
  }, [user]);

  // Monitor booking conflicts
  useEffect(() => {
    if (!selectedBookingTime) {
      setConflictWarning('');
      return;
    }
    const hasConflict = appointments.some(appt => 
      appt.niche === activeNiche && 
      appt.status === 'confirmed' &&
      appt.dateTime && selectedBookingTime &&
      typeof appt.dateTime === 'string' &&
      typeof selectedBookingTime === 'string' &&
      appt.dateTime.substring(0, 16) === selectedBookingTime.substring(0, 16)
    );
    if (hasConflict) {
      setConflictWarning("⚠️ Another confirmed booking exists at this exact slot. Recommend checking slot schedule.");
    } else {
      setConflictWarning('');
    }
  }, [selectedBookingTime, appointments, activeNiche]);

  // Handle Toast Trigger
  const triggerToast = (message, iconType = 'purple') => {
    setToast({ message, iconType });
    playAudioSfx('success');
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Reset Chat Simulator
  const handleResetChat = () => {
    setChatMessages([
      {
        id: 'msg-init',
        text: currentConfig.greetingMessage,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setBotState({
      step: 'greeting',
      tempLead: { name: '', phone: '', requirement: '', budget: '', location: '' }
    });
    triggerToast("Chat Simulator Reset!", "purple");
  };

  // Log Activity Helper
  const addActivity = (text, type = 'info') => {
    setActivities(prev => [
      { id: Date.now(), text, time: 'Just now', type },
      ...prev.slice(0, 10)
    ]);
  };

  // Helper: Authenticated fetch wrapper injecting Firebase ID token in Authorization header
  const authenticatedFetch = async (url, options = {}) => {
    try {
      const headers = { ...options.headers };
      
      // In Demo Mode, if the key is ChangeMe, we send the user email as a token fallback
      if (firebaseConfig.apiKey.includes("ChangeMe")) {
        const dummyToken = user ? user.email : 'kartikparashar15@gmail.com';
        headers['Authorization'] = `Bearer ${dummyToken}`;
      } else if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true);
        headers['Authorization'] = `Bearer ${token}`;
      } else if (user) {
        headers['Authorization'] = `Bearer ${user.email}`;
      }

      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      
      return fetch(url, {
        ...options,
        headers
      });
    } catch (err) {
      console.error("authenticatedFetch error:", err);
      return fetch(url, options);
    }
  };

  // Sync User Login/Registration credentials to Backend SQLite database
  const syncUserToBackend = (userData) => {
    if (!userData || !userData.email) return;
    
    authenticatedFetch(`${BACKEND_URL}/v1/users`, {
      method: 'POST',
      body: JSON.stringify({
        id: userData.id || userData.email,
        name: userData.name || '',
        email: userData.email,
        phone: userData.phone || ''
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Synced user credentials with SQLite database:", data);
    })
    .catch(err => {
      console.error("Failed to sync user credentials with SQLite:", err);
    });
  };

  // Helper: Try to restore user profile from backend SQLite DB on login
  const resolveUserProfileAndSetSession = async (authUser) => {
    const emailKey = authUser.email.toLowerCase();
    const profilesLocal = localStorage.getItem('frontdesk_user_profiles');
    const profiles = profilesLocal ? JSON.parse(profilesLocal) : {};
    let existingProfile = profiles[emailKey];

    // Use local storage profile temporarily if found
    let initialUser = existingProfile || authUser;
    setUser(initialUser);
    localStorage.setItem('frontdesk_user', JSON.stringify(initialUser));

    // Fetch the actual profile from the backend SQLite DB to get the latest database data
    try {
      const res = await fetch(`${BACKEND_URL}/v1/business-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authUser.email}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const profileData = await res.json();
        if (profileData && !profileData.isNew) {
          // Profile exists on SQL backend! Let's merge and mark as onboarded
          const fullProfile = {
            ...initialUser,
            ...profileData,
            isOnboarded: true
          };
          setUser(fullProfile);
          localStorage.setItem('frontdesk_user', JSON.stringify(fullProfile));
          
          // Save to profiles list
          profiles[emailKey] = fullProfile;
          localStorage.setItem('frontdesk_user_profiles', JSON.stringify(profiles));
          
          triggerToast(`Welcome back, ${fullProfile.name}!`, 'green');
          addActivity(`Logged in and restored profile from database: ${fullProfile.email}`, 'success');
          return;
        }
      }
    } catch (err) {
      console.error("Error fetching user profile from SQL backend:", err);
    }
    
    // Fallback: If not on backend and we didn't find local profile, sync initial user to backend
    if (!existingProfile) {
      syncUserToBackend(authUser);
    }
  };

  // Payments: Trigger Razorpay Checkout for Starter Plan Subscription (₹999/mo)
  const handlePayment = async () => {
    if (!user) {
      triggerToast("You must be logged in to activate a plan.", "red");
      return;
    }
    
    setIsPaymentLoading(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/v1/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 999,
          currency: 'INR'
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to create order on the server.");
      }
      
      const orderData = await response.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Order creation returned success=false.");
      }
      
      // Ensure Razorpay SDK is loaded
      if (typeof window.Razorpay === 'undefined') {
        // Fallback: Dynamically append Razorpay checkout script if not available
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "FrontDesk AI",
        description: "SaaS Starter Plan Subscription",
        image: user.avatarImg || "https://app.frontdeskai.shop/logo.png",
        order_id: orderData.orderId,
        handler: async function (paymentResponse) {
          try {
            triggerToast("Payment successful! Verifying signature...", "blue");
            const verifyResponse = await authenticatedFetch(`${BACKEND_URL}/v1/payments/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              })
            });
            
            if (!verifyResponse.ok) {
              throw new Error("Payment signature verification failed.");
            }
            
            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              triggerToast("Subscription activated successfully!", "green");
              // Re-fetch user profile to update state from SQLite database
              if (auth.currentUser) {
                resolveUserProfileAndSetSession(auth.currentUser);
              } else {
                resolveUserProfileAndSetSession(user);
              }
            } else {
              triggerToast(verifyData.error || "Payment signature verification failed.", "red");
            }
          } catch (err) {
            console.error("Error verifying payment signature:", err);
            triggerToast("Verification failed: " + err.message, "red");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.businessPhone || ""
        },
        notes: {
          email: user.email,
          businessName: user.businessName || ""
        },
        theme: {
          color: "#0070f3"
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (paymentFailResponse) {
        console.error("Razorpay Payment Failed:", paymentFailResponse.error);
        triggerToast("Payment failed: " + paymentFailResponse.error.description, "red");
      });
      rzp.open();
    } catch (err) {
      console.error("handlePayment error:", err);
      triggerToast("Error processing payment: " + err.message, "red");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // Auth: Recaptcha verification setup
  const setupRecaptcha = () => {
    try {
      // Clear the element and existing verifier to prevent "already rendered" error!
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
      
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // expired
        }
      });
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (error) {
      console.error("Recaptcha error:", error);
      return null;
    }
  };

  // Auth: Send OTP Handler
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;

    if (firebaseConfig.apiKey.includes("ChangeMe")) {
      setIsAuthLoading(true);
      setTimeout(() => {
        setIsAuthLoading(false);
        setOtpSent(true);
        triggerToast("Demo Mode: OTP sent successfully! (Use code 123456)", "purple");
      }, 1000);
      return;
    }

    try {
      setIsAuthLoading(true);
      const appVerifier = setupRecaptcha();
      if (!appVerifier) {
        throw new Error("Failed to initialize Recaptcha.");
      }
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setIsAuthLoading(false);
      triggerToast("Verification SMS sent successfully!", "green");
    } catch (error) {
      setIsAuthLoading(false);
      console.error("Error sending SMS:", error);
      alert("Error sending SMS: " + error.message);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  // Auth: Verify OTP Handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) return;

    if (firebaseConfig.apiKey.includes("ChangeMe")) {
      if (otpCode !== '123456') {
        alert("Demo Mode: Invalid OTP. Use 123456.");
        return;
      }
      
      setIsAuthLoading(true);
      setTimeout(() => {
        setIsAuthLoading(false);
        const email = `${phoneNumber.replace('+', '')}@frontdesk.com`;
        const name = `Phone User (${phoneNumber})`;
        
        const authUser = {
          name: name,
          email: email,
          phone: phoneNumber,
          avatar: 'P',
          role: 'owner',
          niche: 'dental',
          isOnboarded: false,
          businessName: '',
          businessPhone: phoneNumber,
          businessAddress: '',
          businessWebsite: '',
          aiPersona: 'Friendly'
        };
        resolveUserProfileAndSetSession(authUser);
        addActivity(`User verified via Phone OTP (Demo): ${phoneNumber}`, 'success');
      }, 1000);
      return;
    }

    try {
      setIsAuthLoading(true);
      const result = await confirmationResult.confirm(otpCode);
      const firebaseUser = result.user;
      const userPhone = firebaseUser.phoneNumber;
      const email = `${userPhone.replace('+', '')}@frontdesk.com`;
      const name = `User (${userPhone})`;

      const authUser = {
        name: name,
        email: email,
        phone: userPhone,
        avatar: 'P',
        role: 'owner',
        niche: 'dental',
        isOnboarded: false,
        businessName: '',
        businessPhone: userPhone,
        businessAddress: '',
        businessWebsite: '',
        aiPersona: 'Friendly'
      };
      resolveUserProfileAndSetSession(authUser);
      addActivity(`User verified via Phone OTP: ${userPhone}`, 'success');
      setIsAuthLoading(false);
    } catch (error) {
      setIsAuthLoading(false);
      console.error("Error verifying code:", error);
      alert("Invalid verification code. Please check and try again.");
    }
  };

  // Auth: Email/Password SignUp Handler
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    const name = e.target.name?.value || '';
    const email = emailInput.trim();
    const password = passwordInput;
    const selectedNiche = e.target.nicheType?.value || 'dental';

    if (name.length < 2) {
      alert("Please write a valid name.");
      return;
    }

    if (firebaseConfig.apiKey.includes("ChangeMe")) {
      setIsAuthLoading(true);
      setTimeout(() => {
        setIsAuthLoading(false);
        setVerificationEmailSent(true);
        triggerToast("Demo Mode: Verification OTP sent to email! (Use code 123456)", "purple");
      }, 1000);
      return;
    }

    try {
      setIsAuthLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await sendEmailVerification(firebaseUser);
      setVerificationEmailSent(true);
      setIsAuthLoading(false);
      triggerToast("Verification email sent! Please check your inbox.", "green");
    } catch (error) {
      setIsAuthLoading(false);
      console.error("Error creating email account:", error);
      alert("Registration error: " + error.message);
    }
  };

  // Auth: Verify Email OTP (Demo Mode)
  const handleVerifyEmailOtp = (e) => {
    e.preventDefault();
    if (otpCode !== '123456') {
      alert("Demo Mode: Invalid OTP. Use 123456.");
      return;
    }

    setIsAuthLoading(true);
    setTimeout(() => {
      setIsAuthLoading(false);
      
      const email = emailInput.trim();
      const emailKey = email.toLowerCase();
      
      const profilesLocal = localStorage.getItem('frontdesk_user_profiles');
      const profiles = profilesLocal ? JSON.parse(profilesLocal) : {};
      
      const nameInputEl = document.querySelector('input[name="name"]');
      const nicheSelectEl = document.querySelector('select[name="nicheType"]');
      const name = nameInputEl?.value || 'User';
      const selectedNiche = nicheSelectEl?.value || 'dental';

      const authUser = {
        name: name,
        email: email,
        avatar: name.substring(0, 1).toUpperCase(),
        role: 'owner',
        niche: selectedNiche,
        isOnboarded: false,
        businessName: '',
        businessPhone: '',
        businessAddress: '',
        businessWebsite: '',
        aiPersona: 'Friendly'
      };

      resolveUserProfileAndSetSession(authUser);
      triggerToast("Account created successfully!", "green");
      addActivity(`New user registered via Email (Demo): ${email}`, 'success');
      
      setVerificationEmailSent(false);
      setEmailInput('');
      setPasswordInput('');
      setOtpCode('');
    }, 1000);
  };

  // Auth: Check Email Verification (Real Mode)
  const checkEmailVerification = async () => {
    try {
      setIsAuthLoading(true);
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        await firebaseUser.reload();
        if (auth.currentUser.emailVerified) {
          setIsAuthLoading(false);
          const email = auth.currentUser.email;
          const emailKey = email.toLowerCase();
          
          const nameInputEl = document.querySelector('input[name="name"]');
          const nicheSelectEl = document.querySelector('select[name="nicheType"]');
          const name = nameInputEl?.value || email.split('@')[0];
          const selectedNiche = nicheSelectEl?.value || 'dental';

          const authUser = {
            name: name,
            email: email,
            avatar: name.substring(0, 1).toUpperCase(),
            role: 'owner',
            niche: selectedNiche,
            isOnboarded: false,
            businessName: '',
            businessPhone: '',
            businessAddress: '',
            businessWebsite: '',
            aiPersona: 'Friendly'
          };
          resolveUserProfileAndSetSession(authUser);
          addActivity(`User verified via Email: ${email}`, 'success');
          setVerificationEmailSent(false);
          setEmailInput('');
          setPasswordInput('');
        } else {
          setIsAuthLoading(false);
          alert("Email is not verified yet. Please check your inbox and click the verification link.");
        }
      } else {
        setIsAuthLoading(false);
        alert("No active session found. Please sign up again.");
      }
    } catch (error) {
      setIsAuthLoading(false);
      console.error("Error reloading user info:", error);
      alert("Error checking verification: " + error.message);
    }
  };

  // Auth: Email/Password SignIn Handler
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    const email = emailInput.trim();
    const password = passwordInput;

    if (firebaseConfig.apiKey.includes("ChangeMe")) {
      setIsAuthLoading(true);
      setTimeout(() => {
        setIsAuthLoading(false);
        const emailKey = email.toLowerCase();
        
        const prefix = email.split('@')[0];
        const name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        const authUser = {
          name: name,
          email: email,
          avatar: name.substring(0, 1).toUpperCase(),
          role: 'owner',
          niche: 'dental',
          isOnboarded: false,
          businessName: '',
          businessPhone: '',
          businessAddress: '',
          businessWebsite: '',
          aiPersona: 'Friendly'
        };
        resolveUserProfileAndSetSession(authUser);
        addActivity(`User signed in via Email (Demo): ${email}`, 'info');
        setEmailInput('');
        setPasswordInput('');
      }, 1000);
      return;
    }

    try {
      setIsAuthLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser.emailVerified) {
        setIsAuthLoading(false);
        alert("Please verify your email before logging in. A verification email has been sent to " + firebaseUser.email);
        await sendEmailVerification(firebaseUser);
        return;
      }

      const emailKey = firebaseUser.email.toLowerCase();
      const prefix = firebaseUser.email.split('@')[0];
      const name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      const authUser = {
        name: name,
        email: firebaseUser.email,
        avatar: name.substring(0, 1).toUpperCase(),
        role: 'owner',
        niche: 'dental',
        isOnboarded: false,
        businessName: '',
        businessPhone: '',
        businessAddress: '',
        businessWebsite: '',
        aiPersona: 'Friendly'
      };
      resolveUserProfileAndSetSession(authUser);
      addActivity(`User logged in via Email: ${firebaseUser.email}`, 'info');
      setIsAuthLoading(false);
      setEmailInput('');
      setPasswordInput('');
    } catch (error) {
      setIsAuthLoading(false);
      console.error("Error signing in with email:", error);
      alert("Sign-in failed: " + error.message);
    }
  };

  // Auth: Send Password Reset Email
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    if (firebaseConfig.apiKey.includes("ChangeMe")) {
      setIsAuthLoading(true);
      setTimeout(() => {
        setIsAuthLoading(false);
        setResetEmailSent(true);
        triggerToast("Demo Mode: Reset password email simulated!", "purple");
      }, 1000);
      return;
    }

    try {
      setIsAuthLoading(true);
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setIsAuthLoading(false);
      triggerToast("Password reset email sent successfully!", "green");
    } catch (error) {
      setIsAuthLoading(false);
      console.error("Error sending reset password email:", error);
      alert("Error sending password reset: " + error.message);
    }
  };

  // Auth: Email/Password Login & Signup Handler (Admin / Legacy)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    let authUser = null;

    if (email.trim().toLowerCase() === 'admin@frontdesk.com') {
      if (password === 'admin123') {
        authUser = {
          name: 'SaaS Super Admin',
          email: 'admin@frontdesk.com',
          avatar: 'A',
          role: 'admin',
          isOnboarded: true
        };
        setUser(authUser);
        triggerToast("Logged in as SaaS Super Admin", "green");
        addActivity("Admin signed in", "info");
        return;
      } else {
        alert("Invalid credentials for admin account.");
        return;
      }
    }
  };

  // Auth: Logout
  const handleLogOut = () => {
    playAudioSfx('send');
    if (auth.currentUser) {
      firebaseSignOut(auth).catch(err => console.error("Firebase Signout Error", err));
    }
    setUser(null);
    setActiveTab('dashboard');
    setOtpSent(false);
    setPhoneNumber('');
    setOtpCode('');
    setConfirmationResult(null);
    triggerToast("Logged out successfully.");
  };

  // Action: Save WhatsApp API Integration Credentials
  const handleSaveWhatsAppConfig = (e) => {
    e.preventDefault();
    const form = e.target;
    const accessToken = form.accessToken.value;
    const phoneNumberId = form.phoneNumberId.value;
    const accountId = form.accountId.value;

    let updatedConfig;
    if (accessToken.trim() && phoneNumberId.trim() && accountId.trim()) {
      updatedConfig = {
        accessToken,
        phoneNumberId,
        accountId,
        isConnected: true
      };
      setWhatsappConfig(updatedConfig);
      triggerToast("WhatsApp Business API Connected!", "green");
      addActivity("Connected Meta WhatsApp Business API endpoint", "success");

      // Sync credentials & phone ID with backend profile mapping
      if (user) {
        authenticatedFetch(`${BACKEND_URL}/v1/business-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...user,
            phoneNumberId: phoneNumberId,
            whatsappConfig: updatedConfig
          })
        }).catch(err => console.error("Error syncing profile with backend:", err));
      }
    } else {
      updatedConfig = {
        accessToken: '',
        phoneNumberId: '',
        accountId: '',
        isConnected: false
      };
      setWhatsappConfig(updatedConfig);
      triggerToast("WhatsApp API Configuration Disconnected.");

      // Sync disconnect status with backend
      if (user) {
        authenticatedFetch(`${BACKEND_URL}/v1/business-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...user,
            phoneNumberId: '',
            whatsappConfig: updatedConfig
          })
        }).catch(err => console.error("Error syncing profile with backend:", err));
      }
    }
  };

  // Meta official FB login callback handler for Embedded Signup
  const handleMetaLogin = () => {
    if (!window.FB) {
      triggerToast("Facebook SDK has not loaded yet. Please try again in a few seconds.", "red");
      return;
    }

    window.FB.login((response) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        triggerToast("Logged in with Facebook! Fetching WhatsApp details...", "blue");

        // 1. Fetch user's WhatsApp Business Accounts
        fetch(`https://graph.facebook.com/v21.0/me/whatsapp_business_accounts?access_token=${accessToken}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.data && data.data.length > 0) {
              const accountId = data.data[0].id;
              // 2. Fetch phone numbers associated with the first WABA account
              fetch(`https://graph.facebook.com/v21.0/${accountId}/phone_numbers?access_token=${accessToken}`)
                .then(res => res.json())
                .then(phoneData => {
                  if (phoneData && phoneData.data && phoneData.data.length > 0) {
                    const phoneNumberId = phoneData.data[0].id;
                    const phoneNumber = phoneData.data[0].display_phone_number;
                    
                    const updatedConfig = {
                      accessToken: accessToken,
                      phoneNumberId: phoneNumberId,
                      accountId: accountId,
                      phoneNumber: phoneNumber,
                      isConnected: true
                    };
                    
                    setWhatsappConfig(updatedConfig);
                    triggerToast("WhatsApp connected successfully via Meta Embedded Signup!", "green");
                    addActivity(`Connected WhatsApp account: ${phoneNumber} (ID: ${phoneNumberId})`, "success");
                  } else {
                    triggerToast("No phone numbers found in your Meta Business Account.", "red");
                  }
                })
                .catch(err => {
                  console.error("Error fetching phone numbers:", err);
                  triggerToast("Failed to fetch phone numbers from Meta Business Account.", "red");
                });
            } else {
              triggerToast("No WhatsApp Business Accounts found under this Facebook Profile.", "red");
            }
          })
          .catch(err => {
            console.error("Error fetching WABAs:", err);
            triggerToast("Failed to fetch WhatsApp Business Accounts from Meta.", "red");
          });
      } else {
        triggerToast("Facebook Embedded Signup flow cancelled or failed.", "red");
      }
    }, {
      scope: 'whatsapp_business_management,whatsapp_business_messaging',
      extras: {
        feature: 'whatsapp_embedded_signup',
        setup: {}
      }
    });
  };

  // Chat Simulator Message Processor
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    playAudioSfx('send');

    const newUserMessage = {
      id: `msg-user-${Date.now()}`,
      text: userText,
      sender: 'user',
      timestamp: timeStr
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsTyping(true);

    if (isLiveAiMode) {
      // Route to real Gemini backend simulator
      authenticatedFetch(`${BACKEND_URL}/v1/test-agent-reply`, {
        method: 'POST',
        body: JSON.stringify({
          message: userText,
          customerName: user.name || 'Test User',
          customerPhone: user.phone || '9999999999'
        })
      })
      .then(res => res.json())
      .then(data => {
        setIsTyping(false);
        if (data.reply) {
          setChatMessages(prev => [...prev, {
            id: `msg-bot-${Date.now()}`,
            text: data.reply,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          playAudioSfx('receive');
        }
      })
      .catch(err => {
        console.error("Live AI mode error:", err);
        setIsTyping(false);
        setChatMessages(prev => [...prev, {
          id: `msg-bot-${Date.now()}`,
          text: "Oops! I encountered an error checking in with the AI Desk. Check your server console logs.",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      });
      return;
    }

    setTimeout(() => {
      let botResponse = '';
      let nextStep = botState.step;
      let updatedTempLead = { ...botState.tempLead };

      const lowercaseText = userText.toLowerCase();

      if (lowercaseText.includes('price') || lowercaseText.includes('cost') || lowercaseText.includes('how much')) {
        botResponse = currentConfig.mockAnswers.prices;
      } else if (lowercaseText.includes('location') || lowercaseText.includes('where are you') || lowercaseText.includes('address')) {
        botResponse = currentConfig.mockAnswers.location;
      } else if (lowercaseText.includes('timing') || lowercaseText.includes('hours') || lowercaseText.includes('open')) {
        botResponse = currentConfig.mockAnswers.timings;
      } else {
        switch (botState.step) {
          case 'greeting':
            if (lowercaseText.includes('book') || lowercaseText.includes('appointment') || lowercaseText.includes('enquiry') || lowercaseText.includes('price') || lowercaseText.includes('hi') || lowercaseText.includes('hello')) {
              botResponse = "I'd be glad to assist you with booking! May I know your full name to start the profile?";
              nextStep = 'capture_name';
            } else {
              botResponse = "No problem! Would you like to review our pricing options, clinic locations, or secure a booking time?";
            }
            break;
            
          case 'capture_name':
            if (userText.length < 3 || /^\d+$/.test(userText)) {
              botResponse = "Hmm, that name seems a bit too short or contains numbers. Please type your full name.";
              nextStep = 'capture_name';
            } else {
              updatedTempLead.name = userText;
              botResponse = `Thanks, ${userText}! Could you please share your WhatsApp or mobile number so we can link your booking profile?`;
              nextStep = 'capture_phone';
            }
            break;

          case 'capture_phone':
            const cleanPhone = userText.replace(/[\s\-\(\)\+]/g, '');
            if (cleanPhone.length < 8 || !/^\d+$/.test(cleanPhone)) {
              botResponse = "That doesn't look like a valid phone number. Please enter a valid mobile number (e.g. +91 98765 43210) so we can message your reminder details.";
              nextStep = 'capture_phone';
            } else {
              updatedTempLead.phone = userText;
              botResponse = `Got it. Which services or treatment are you planning to visit us for?\n\nOur Services Menu:\n` + 
                currentConfig.services.map((s, idx) => `${idx + 1}. ${s.name} (${s.price})`).join('\n') + 
                `\n\n(Type the service name or option number)`;
              nextStep = 'capture_service';
            }
            break;

          case 'capture_service':
            let matchedService = '';
            const optionNum = parseInt(userText);
            if (optionNum >= 1 && optionNum <= currentConfig.services.length) {
              matchedService = currentConfig.services[optionNum - 1].name;
            } else {
              const found = currentConfig.services.find(s => lowercaseText.includes(s.name.toLowerCase()));
              if (found) matchedService = found.name;
            }

            if (!matchedService) {
              matchedService = userText;
            }
            
            updatedTempLead.requirement = matchedService;
            const serviceObj = currentConfig.services.find(s => s.name === matchedService) || { price: '₹1,500' };
            updatedTempLead.budget = serviceObj.price;
            
            botResponse = `Perfect, ${matchedService} selected! What is your current area location (neighborhood/town)? This helps us check slots at your nearest branch.`;
            nextStep = 'capture_details';
            break;

          case 'capture_details':
            if (userText.length < 2) {
              botResponse = "Please write down your location (e.g. Indiranagar, Bangalore) so we can route your profile correctly.";
              nextStep = 'capture_details';
            } else {
              updatedTempLead.location = userText;
              botResponse = `Perfect! I've loaded your details. Shall I confirm your booking slot for tomorrow at 11:00 AM? (Reply 'Yes' to confirm, or suggest another slot).`;
              nextStep = 'booking';
              
              const newLead = {
                id: `l-${Date.now()}`,
                name: updatedTempLead.name,
                phone: updatedTempLead.phone,
                requirement: updatedTempLead.requirement,
                budget: updatedTempLead.budget,
                location: updatedTempLead.location,
                date: new Date().toISOString(),
                status: 'new',
                niche: activeNiche,
                source: 'WhatsApp AI'
              };
              setLeads(prev => [newLead, ...prev]);
              triggerToast(`Lead Captured: ${newLead.name}`, 'green');
              addActivity(`Lead captured via WhatsApp AI: ${newLead.name}`, 'success');
            }
            break;

          case 'booking':
            botResponse = `🎉 Confirmed! Your slot for ${updatedTempLead.requirement} is registered. We've sent a calendar card to your phone.\n\n` + 
              `Here is a Google Review request link from your last check-up: ${currentConfig.reviewUrl} \n\n` + 
              `Share this referral code with friends so both of you get rewards: REF-${activeNiche.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
            nextStep = 'done';

            const newAppt = {
              id: `a-${Date.now()}`,
              name: updatedTempLead.name,
              phone: updatedTempLead.phone,
              service: updatedTempLead.requirement,
              dateTime: '2026-05-30T11:00:00',
              status: 'confirmed',
              niche: activeNiche,
              reminderSent: true
            };
            setAppointments(prev => [newAppt, ...prev]);
            triggerToast(`Appointment Booked: ${newAppt.name}`, 'purple');
            addActivity(`New Appointment confirmed: ${newAppt.name}`, 'info');
            break;

          default:
            botResponse = "Thank you! If you have any further questions or wish to reschedule, just let me know. We look forward to your visit.";
        }
      }

      setChatMessages(prev => [...prev, {
        id: `msg-bot-${Date.now()}`,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      setBotState({
        step: nextStep,
        tempLead: updatedTempLead
      });
      setIsTyping(false);
      playAudioSfx('receive');
    }, 1000);
  };

  // Helper: Trigger quick template typing
  const triggerQuickQuery = (text) => {
    setUserInput(text);
  };

  // Action: Manual Follow Up
  const handleFollowUpLead = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'followed_up' } : l));
    addActivity(`Follow-up WhatsApp sent to ${lead.name}`, 'info');
    triggerToast(`Follow-up template pushed!`, 'purple');

    setChatMessages(prev => [...prev, {
      id: `msg-system-${Date.now()}`,
      text: `📲 [AUTO-FOLLOWUP SENT TO ${lead.phone}]: Hi ${lead.name}, still looking to schedule your session for ${lead.requirement}? Let me know if you would like to book a slot.`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // Action: Delete Lead
  const handleDeleteLead = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    if (lead) {
      addActivity(`Deleted lead record: ${lead.name}`, 'info');
      triggerToast(`Removed lead: ${lead.name}`);

      // Sync deletion to backend
      authenticatedFetch(`${BACKEND_URL}/v1/leads/${leadId}`, {
        method: 'DELETE'
      }).catch(err => console.error("Error syncing lead deletion to backend:", err));
    }
  };

  // Action: Delete Appointment completely
  const handleDeleteAppointment = (apptId) => {
    const appt = appointments.find(a => a.id === apptId);
    setAppointments(prev => prev.filter(a => a.id !== apptId));
    if (appt) {
      addActivity(`Deleted appointment record: ${appt.name}`, 'info');
      triggerToast(`Removed appointment for: ${appt.name}`);

      // Sync deletion to backend
      authenticatedFetch(`${BACKEND_URL}/v1/appointments/${apptId}`, {
        method: 'DELETE'
      }).catch(err => console.error("Error syncing appointment deletion to backend:", err));
    }
  };

  // Action: Change Appointment Status
  const handleUpdateApptStatus = (apptId, status) => {
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status } : a));
    const appt = appointments.find(a => a.id === apptId);
    if (appt) {
      addActivity(`Appointment for ${appt.name} updated to ${status}`, 'info');
      triggerToast(`Booking updated to ${status}`);
    }
  };

  // Action: Add Manual Lead Form
  const handleManualAddLead = (e) => {
    e.preventDefault();
    const form = e.target;
    
    const newLead = {
      id: `l-${Date.now()}`,
      name: form.name.value,
      phone: form.phone.value,
      requirement: form.requirement.value,
      budget: form.budget.value,
      location: form.location.value,
      date: new Date().toISOString(),
      status: 'new',
      niche: activeNiche,
      source: 'Manual CRM Entry'
    };

    setLeads(prev => [newLead, ...prev]);
    setIsLeadModalOpen(false);
    triggerToast(`Manual lead registered: ${newLead.name}`, 'green');
    addActivity(`CRM manual lead registered: ${newLead.name}`, 'success');

    // Sync manual lead to SQLite backend
    authenticatedFetch(`${BACKEND_URL}/v1/leads`, {
      method: 'POST',
      body: JSON.stringify(newLead)
    }).catch(err => console.error("Error syncing manual lead:", err));
  };

  // Action: Add Manual Appointment Form
  const handleManualAddAppt = (e) => {
    e.preventDefault();
    const form = e.target;

    const newAppt = {
      id: `a-${Date.now()}`,
      name: form.name.value,
      phone: form.phone.value,
      service: form.service.value,
      dateTime: form.dateTime.value,
      status: 'confirmed',
      niche: activeNiche,
      reminderSent: false
    };

    setAppointments(prev => [newAppt, ...prev]);
    setIsApptModalOpen(false);
    setSelectedBookingTime('');
    triggerToast(`Booking scheduled for ${newAppt.name}`, 'purple');
    addActivity(`Manual appointment created: ${newAppt.name}`, 'info');

    // Sync manual appointment to SQLite backend
    authenticatedFetch(`${BACKEND_URL}/v1/appointments`, {
      method: 'POST',
      body: JSON.stringify(newAppt)
    }).catch(err => console.error("Error syncing manual appointment:", err));
  };

  // Action: Export Leads as CSV
  const handleExportCSV = () => {
    try {
      const activeLeads = leads.filter(l => l.niche === activeNiche);
      if (activeLeads.length === 0) {
        triggerToast("No lead data to export!");
        return;
      }

      const headers = ['Name', 'Phone', 'Requirement', 'Budget', 'Location', 'Date', 'Status', 'Source'];
      const rows = activeLeads.map(l => [
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.phone}"`,
        `"${l.requirement.replace(/"/g, '""')}"`,
        `"${l.budget}"`,
        `"${l.location.replace(/"/g, '""')}"`,
        `"${new Date(l.date).toLocaleString()}"`,
        `"${l.status}"`,
        `"${l.source}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `frontdesk_leads_${activeNiche}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast("CSV file downloaded!", "green");
      addActivity(`Exported leads table as CSV file`, 'info');
    } catch (err) {
      console.error(err);
      triggerToast("Export failed!");
    }
  };

  // Action: Save Niche Config settings
  const handleSaveConfig = (e) => {
    e.preventDefault();
    const form = e.target;
    const businessName = form.businessName.value;
    const greetingMessage = form.greetingMessage.value;
    const reviewUrl = form.reviewUrl.value;
    const systemPrompt = form.systemPrompt.value;

    setNicheConfigs(prev => ({
      ...prev,
      [activeNiche]: {
        ...prev[activeNiche],
        businessName,
        greetingMessage,
        reviewUrl,
        systemPrompt
      }
    }));

    triggerToast('Settings updated!', 'purple');
    addActivity(`AI agent configuration updated for ${businessName}`, 'ai');
  };

  // Filtered lists
  const filteredLeads = leads
    .filter(l => l.niche === activeNiche)
    .filter(l => {
      const query = searchQuery.toLowerCase();
      const matchSearch = l.name.toLowerCase().includes(query) || 
                          l.phone.includes(query) || 
                          l.requirement.toLowerCase().includes(query) ||
                          l.location.toLowerCase().includes(query);
      if (leadFilter === 'all') return matchSearch;
      return matchSearch && l.status === leadFilter;
    });

  const filteredAppointments = appointments.filter(a => a.niche === activeNiche);

  // Statistics calculation for current Niche
  const nicheLeadsCount = leads.filter(l => l.niche === activeNiche).length;
  const nicheConvertedCount = leads.filter(l => l.niche === activeNiche && l.status === 'converted').length;
  const conversionRate = nicheLeadsCount > 0 ? Math.round((nicheConvertedCount / nicheLeadsCount) * 100) : 0;
  
  const activeBookingsCount = appointments.filter(a => a.niche === activeNiche && a.status === 'confirmed').length;
  
  const averageReviewScore = reviews
    .filter(r => r.niche === activeNiche && r.rating > 0)
    .reduce((acc, curr, _, array) => acc + curr.rating / array.length, 0);

  const leadStatuses = ['new', 'followed_up', 'converted'];
  const leadStatusCounts = leadStatuses.map(status => {
    return leads.filter(l => l.niche === activeNiche && l.status === status).length;
  });

  // SCREEN RENDER 1: AUTHENTICATION ENTRANCE
  if (!user) {
    return (
      <div className="auth-page-backdrop">
        <div className="auth-ambient-orb-1"></div>
        <div className="auth-ambient-orb-2"></div>

        <div className="glass-panel auth-card-panel">
          <div className="auth-card-header">
            <div className="logo-icon" style={{ margin: '0 auto', width: '42px', height: '42px', fontSize: '1.4rem' }}>D</div>
            <h1 className="auth-card-title">FrontDesk AI</h1>
            <p className="auth-card-subtitle">WhatsApp AI Front Desk for Local Businesses</p>
          </div>

          {/* Test credentials warning */}
          {/* Firebase API Key Missing Warning (Demo Mode Banner) */}
          {firebaseConfig.apiKey.includes("ChangeMe") && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '0.75rem',
              lineHeight: '1.4',
              color: 'var(--text-secondary)'
            }}>
              <p style={{ fontWeight: '700', color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <AlertTriangle size={12} /> Firebase Demo Mode Active:
              </p>
              Real SMS OTP verification requires Firebase credentials. You can enter any phone number and use verification code <code style={{ color: 'white', fontWeight: 'bold' }}>123456</code> to test login.
            </div>
          )}

          {/* Test credentials warning for Admin Only */}
          {authMode === 'admin_login' && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.06)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '0.75rem',
              lineHeight: '1.4',
              color: 'var(--text-secondary)'
            }}>
              <p style={{ fontWeight: '700', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Shield size={12} /> SaaS Administrator Login:
              </p>
              Email: <code style={{ color: 'white' }}>admin@frontdesk.com</code> | Password: <code style={{ color: 'white' }}>admin123</code>
            </div>
          )}

          {authMode !== 'admin_login' && authMode !== 'forgot_password' && !verificationEmailSent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {/* Row 1: Auth Mode Toggle */}
              <div className="auth-tab-buttons" style={{ marginBottom: '0' }}>
                <button 
                  onClick={() => { setAuthMode('login'); setOtpSent(false); }} 
                  className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                  type="button"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthMode('signup'); setOtpSent(false); }} 
                  className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
                  type="button"
                >
                  Create Account
                </button>
              </div>

              {/* Row 2: Auth Method Toggle */}
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-light)' }}>
                <button
                  onClick={() => { setAuthMethod('phone'); setOtpSent(false); }}
                  className={`auth-tab-btn`}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    background: authMethod === 'phone' ? 'var(--accent-purple)' : 'transparent',
                    color: authMethod === 'phone' ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  type="button"
                >
                  📲 Phone OTP
                </button>
                <button
                  onClick={() => { setAuthMethod('email'); setOtpSent(false); }}
                  className={`auth-tab-btn`}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    background: authMethod === 'email' ? 'var(--accent-purple)' : 'transparent',
                    color: authMethod === 'email' ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  type="button"
                >
                  ✉️ Email / Password
                </button>
              </div>
            </div>
          )}

          {/* OFFICIAL GOOGLE OAUTH CONTAINER */}
          {authMode !== 'admin_login' && authMode !== 'forgot_password' && !verificationEmailSent && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div id="google-signin-btn-container"></div>
              </div>
              <div className="auth-divider">
                {authMethod === 'phone' ? 'or use Phone Number' : 'or use Email Address'}
              </div>
            </>
          )}

          {/* Render forms depending on authMode */}
          {authMode === 'admin_login' ? (
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> Admin Email
                </label>
                <input type="email" name="email" required placeholder="admin@frontdesk.com" defaultValue="admin@frontdesk.com" />
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} /> Admin Password
                </label>
                <input type="password" name="password" required placeholder="••••••••" defaultValue="admin123" />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
                Login as SaaS Administrator
              </button>
            </form>
          ) : authMode === 'forgot_password' ? (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                🔒 Enter your email address to receive a password reset link.
              </div>

              {resetEmailSent ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '12px', fontSize: '0.8rem', color: 'var(--accent-green)', textAlign: 'center' }}>
                  ✉️ Reset password link sent! Please check your inbox and follow the instructions.
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> Email Address
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={emailInput} 
                    onChange={(e) => setEmailInput(e.target.value)} 
                    placeholder="name@business.com" 
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isAuthLoading} 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '8px', padding: '12px' }}
              >
                {isAuthLoading ? 'Sending...' : 'Send Password Reset Email'}
              </button>

              <button 
                type="button" 
                onClick={() => { setAuthMode('login'); setResetEmailSent(false); }} 
                className="btn-secondary" 
                style={{ width: '100%', borderColor: 'transparent', padding: '6px', fontSize: '0.75rem' }}
              >
                Back to Sign In
              </button>
            </form>
          ) : verificationEmailSent ? (
            <>
              {firebaseConfig.apiKey.includes("ChangeMe") ? (
                <form onSubmit={handleVerifyEmailOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    📩 Simulated OTP sent to email: <strong style={{ color: 'white' }}>{emailInput}</strong>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={14} /> Enter 6-digit Email OTP
                    </label>
                    <input 
                      type="text" 
                      required 
                      maxLength="6"
                      value={otpCode} 
                      onChange={(e) => setOtpCode(e.target.value)} 
                      placeholder="e.g. 123456" 
                      style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.2rem', fontWeight: 'bold' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isAuthLoading} 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '8px', padding: '12px', background: 'var(--accent-green)' }}
                  >
                    {isAuthLoading ? 'Verifying...' : 'Verify Code & Create Account 🚀'}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setVerificationEmailSent(false); setOtpCode(''); }} 
                    className="btn-secondary" 
                    style={{ width: '100%', borderColor: 'transparent', padding: '6px', fontSize: '0.75rem' }}
                  >
                    Back to Edit Email
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    ✉️ Verification link sent to <strong style={{ color: 'white' }}>{emailInput}</strong>.
                    <p style={{ marginTop: '8px' }}>Please check your inbox (and spam folder) and verify your account. Once verified, click the button below.</p>
                  </div>

                  <button 
                    type="button" 
                    onClick={checkEmailVerification}
                    disabled={isAuthLoading} 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '8px', padding: '12px', background: 'var(--accent-green)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    {isAuthLoading ? 'Checking...' : 'I have verified my email 🚀'}
                  </button>

                  <button 
                    type="button" 
                    onClick={async () => {
                      try {
                        if (auth.currentUser) {
                          await sendEmailVerification(auth.currentUser);
                          triggerToast("Verification email resent!", "green");
                        }
                      } catch (err) {
                        alert("Error resending email: " + err.message);
                      }
                    }} 
                    className="btn-secondary" 
                    style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                  >
                    Resend Verification Email
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setVerificationEmailSent(false); }} 
                    className="btn-secondary" 
                    style={{ width: '100%', borderColor: 'transparent', padding: '6px', fontSize: '0.75rem' }}
                  >
                    Back to Edit Sign Up Form
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Invisible container for Firebase ReCAPTCHA */}
              <div id="recaptcha-container"></div>

              {authMethod === 'phone' ? (
                <>
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {authMode === 'signup' && (
                        <>
                          <div className="form-group" style={{ marginBottom: '0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <UserIcon size={14} /> Full Name
                            </label>
                            <input name="name" required placeholder="e.g. Kartik Gowda" />
                          </div>
                          
                          <div className="form-group" style={{ marginBottom: '0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Settings size={14} /> Business Category
                            </label>
                            <select name="nicheType" style={{ width: '100%' }}>
                              <option value="dental">🦷 Dental Clinic</option>
                              <option value="salon">💇‍♀️ Hair Salon & Spa</option>
                            </select>
                          </div>
                        </>
                      )}

                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Smartphone size={14} /> Business Phone Number (with Country Code)
                        </label>
                        <input 
                          type="tel" 
                          required 
                          value={phoneNumber} 
                          onChange={(e) => setPhoneNumber(e.target.value)} 
                          placeholder="e.g. +919876543210" 
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isAuthLoading} 
                        className="btn-primary" 
                        style={{ width: '100%', marginTop: '8px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                      >
                        {isAuthLoading ? 'Sending...' : 'Send Verification OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        📲 Verification OTP sent to <strong style={{ color: 'white' }}>{phoneNumber}</strong>
                      </div>

                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Lock size={14} /> Enter 6-digit Code
                        </label>
                        <input 
                          type="text" 
                          required 
                          maxLength="6"
                          value={otpCode} 
                          onChange={(e) => setOtpCode(e.target.value)} 
                          placeholder="e.g. 123456" 
                          style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.2rem', fontWeight: 'bold' }}
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isAuthLoading} 
                        className="btn-primary" 
                        style={{ width: '100%', marginTop: '8px', padding: '12px', background: 'var(--accent-green)' }}
                      >
                        {isAuthLoading ? 'Verifying...' : 'Verify and Login 🚀'}
                      </button>

                      <button 
                        type="button" 
                        onClick={() => { setOtpSent(false); setOtpCode(''); }} 
                        className="btn-secondary" 
                        style={{ width: '100%', borderColor: 'transparent', padding: '6px', fontSize: '0.75rem' }}
                      >
                        Change Phone Number / Resend SMS
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <form onSubmit={authMode === 'signup' ? handleEmailSignUp : handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {authMode === 'signup' && (
                    <>
                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UserIcon size={14} /> Full Name
                        </label>
                        <input name="name" required placeholder="e.g. Kartik Gowda" />
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Settings size={14} /> Business Category
                        </label>
                        <select name="nicheType" style={{ width: '100%' }}>
                          <option value="dental">🦷 Dental Clinic</option>
                          <option value="salon">💇‍♀️ Hair Salon & Spa</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} /> Email Address
                    </label>
                    <input 
                      type="email" 
                      required 
                      value={emailInput} 
                      onChange={(e) => setEmailInput(e.target.value)} 
                      placeholder="e.g. owner@business.com" 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={14} /> Password
                    </label>
                    <input 
                      type="password" 
                      required 
                      value={passwordInput} 
                      onChange={(e) => setPasswordInput(e.target.value)} 
                      placeholder="••••••••" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isAuthLoading} 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '8px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    {isAuthLoading ? 'Processing...' : authMode === 'signup' ? 'Sign Up & Verify 🚀' : 'Sign In with Email 🚀'}
                  </button>

                  {authMode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('forgot_password')} 
                      className="btn-secondary" 
                      style={{ width: '100%', borderColor: 'transparent', padding: '6px', fontSize: '0.75rem' }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </form>
              )}
            </>
          )}

          <p className="auth-page-footer-text" style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem' }}>
            {authMode === 'admin_login' ? (
              <span className="auth-footer-link" onClick={() => setAuthMode('login')} style={{ cursor: 'pointer', color: 'var(--accent-purple)' }}>
                Back to Phone OTP Login
              </span>
            ) : (
              <span className="auth-footer-link" onClick={() => setAuthMode('admin_login')} style={{ cursor: 'pointer', color: 'var(--accent-purple)' }}>
                SaaS Administrator Login
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Helper: Render appointments as a monthly calendar grid
  const renderAppointmentsCalendar = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const prevTotalDays = new Date(year, month, 0).getDate();
    const daysArray = [];
    
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      daysArray.push({ day: prevTotalDays - i, currentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      daysArray.push({ day: i, currentMonth: true });
    }
    const remaining = 42 - daysArray.length;
    for (let i = 1; i <= remaining; i++) {
      daysArray.push({ day: i, currentMonth: false });
    }
    
    return (
      <div className="glass-panel" style={{ padding: '20px', marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
            {monthNames[month]} {year}
          </h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentCalendarMonth(new Date(year, month - 1, 1))}
              className="action-btn"
              style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)' }}
            >
              Prev
            </button>
            <button 
              onClick={() => setCurrentCalendarMonth(new Date())}
              className="action-btn"
              style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)' }}
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentCalendarMonth(new Date(year, month + 1, 1))}
              className="action-btn"
              style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)' }}
            >
              Next
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
              {d}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', minHeight: '350px' }}>
          {daysArray.map((cell, idx) => {
            const dateStr = cell.currentMonth 
              ? `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
              : '';
            
            const cellAppts = filteredAppointments.filter(appt => {
              if (!cell.currentMonth) return false;
              const apptDate = new Date(appt.dateTime);
              return apptDate.getFullYear() === year && apptDate.getMonth() === month && apptDate.getDate() === cell.day;
            });
            
            return (
              <div 
                key={idx} 
                onClick={() => {
                  if (cell.currentMonth) {
                    setSelectedPrefilledDate(dateStr);
                    setIsApptModalOpen(true);
                  }
                }}
                style={{
                  background: cell.currentMonth ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.002)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  padding: '6px',
                  minHeight: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  cursor: cell.currentMonth ? 'pointer' : 'default',
                  opacity: cell.currentMonth ? 1 : 0.3,
                  transition: 'background 0.2s',
                  position: 'relative'
                }}
                className={cell.currentMonth ? 'calendar-day-cell' : ''}
              >
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  alignSelf: 'flex-start',
                  color: cell.currentMonth ? 'var(--text-secondary)' : 'var(--text-muted)'
                }}>
                  {cell.day}
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '60px' }}>
                  {cellAppts.map(appt => {
                    const parsedDate = appt.dateTime ? new Date(appt.dateTime) : null;
                    const time = (parsedDate && !isNaN(parsedDate.getTime())) 
                      ? parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : '';
                    return (
                      <div 
                        key={appt.id} 
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        style={{
                          fontSize: '0.65rem',
                          background: appt.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          borderLeft: appt.status === 'confirmed' ? '2px solid var(--accent-green)' : '2px solid var(--accent-yellow)',
                          color: appt.status === 'confirmed' ? 'var(--accent-green)' : 'var(--accent-yellow)',
                          padding: '2px 4px',
                          borderRadius: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'flex',
                          justify: 'space-between',
                          alignItems: 'center'
                        }}
                        title={`${appt.name} - ${appt.service} at ${time}`}
                      >
                        <span style={{ fontWeight: '600' }}>{appt.name}</span>
                        <span style={{ opacity: 0.8, fontSize: '0.6rem' }}>{time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // SCREEN RENDER 1.5: ONBOARDING WIZARD
  if (user && !user.isOnboarded && user.role === 'owner') {
    return (
      <OnboardingWizard 
        user={user} 
        setUser={setUser} 
        nicheConfigs={nicheConfigs}
        setNicheConfigs={setNicheConfigs}
        triggerToast={triggerToast}
        addActivity={addActivity}
        authenticatedFetch={authenticatedFetch}
      />
    );
  }

  // SCREEN RENDER 2: DASHBOARD HOME
  return (
    <div className="app-container">
      
      {/* Toast Banner */}
      {toast && (
        <div className="toast-notification">
          <div className="toast-icon">
            {toast.iconType === 'green' ? <CheckCircle2 size={16} /> : <Bell size={16} />}
          </div>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      {/* MANUAL LEAD MODAL */}
      {isLeadModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-dialog" style={{ background: 'var(--bg-secondary)', padding: '24px' }}>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} className="trend-up" />
                Add New Lead Manually
              </h3>
              <button onClick={() => setIsLeadModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualAddLead}>
              <div className="form-group">
                <label>Customer Full Name</label>
                <input name="name" required placeholder="e.g. Kartik Gowda" />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input name="phone" required placeholder="e.g. +91 99000 88000" />
              </div>
              <div className="form-group">
                <label>Requirement / Treatment / Style</label>
                <input name="requirement" required placeholder="e.g. Hair Wash or Dental Implant" defaultValue={currentConfig.services[0].name} />
              </div>
              <div className="form-group">
                <label>Stated Budget Estimations</label>
                <input name="budget" required placeholder="e.g. ₹2,500" defaultValue={currentConfig.services[0].price} />
              </div>
              <div className="form-group">
                <label>Location Area</label>
                <input name="location" required placeholder="e.g. Indiranagar, Bangalore" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsLeadModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Lead Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL APPOINTMENT MODAL */}
      {isApptModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-dialog" style={{ background: 'var(--bg-secondary)', padding: '24px' }}>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} style={{ color: 'var(--accent-purple)' }} />
                Schedule New Appointment
              </h3>
              <button onClick={() => setIsApptModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualAddAppt}>
              <div className="form-group">
                <label>Customer Full Name</label>
                <input name="name" required placeholder="e.g. Amit Sen" />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input name="phone" required placeholder="e.g. +91 95555 12345" />
              </div>
              
              <div className="form-group">
                <label>Service Type</label>
                <select name="service">
                  {currentConfig.services.map(s => (
                    <option key={s.name} value={s.name}>{s.name} ({s.price})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Preferred Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="dateTime" 
                  required 
                  defaultValue={selectedPrefilledDate ? `${selectedPrefilledDate}T11:00` : ""}
                  key={selectedPrefilledDate}
                  onChange={(e) => setSelectedBookingTime(e.target.value)}
                />
                
                {conflictWarning && (
                  <div className="conflict-warning">
                    <AlertTriangle size={14} />
                    <span>{conflictWarning}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => { setIsApptModalOpen(false); setSelectedBookingTime(''); }}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* META EMBEDDED SIGNUP SIMULATOR MODAL - DISABLED */}
      {false && isMetaModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="glass-panel modal-dialog" style={{ background: '#f0f2f5', padding: '0', overflow: 'hidden', width: '100%', maxWidth: '580px', borderRadius: '16px', boxShadow: '0 24px 54px rgba(0,0,0,0.15)' }}>
            
            {/* Pop-up Top Bar (Facebook Branding) */}
            <div style={{ background: '#1877f2', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '-0.02em' }}>Log in with Facebook</span>
              </div>
              <button onClick={() => setIsMetaModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Close">
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: '32px 24px' }}>
              
              {/* Progress Tracker inside Popup */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', maxWidth: '380px', margin: '0 auto 28px auto', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', left: '0', width: '100%', height: '2px', background: '#dadce0', zIndex: 1 }}></div>
                <div style={{ position: 'absolute', top: '12px', left: '0', width: `${((metaStep - 1) / 3) * 100}%`, height: '2px', background: '#1877f2', zIndex: 2, transition: 'width 0.3s ease' }}></div>
                
                {['Sign In', 'Profile', 'Number', 'Verify'].map((sName, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 3 }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: metaStep > idx + 1 ? '#1877f2' : metaStep === idx + 1 ? '#1877f2' : '#ffffff',
                      border: metaStep >= idx + 1 ? '2px solid #1877f2' : '2px solid #dadce0',
                      color: metaStep > idx + 1 ? 'white' : metaStep === idx + 1 ? 'white' : '#606770',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {metaStep > idx + 1 ? '✓' : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: metaStep === idx + 1 ? '700' : '500', color: metaStep === idx + 1 ? '#1877f2' : '#606770' }}>{sName}</span>
                  </div>
                ))}
              </div>

              {/* STEP 1: Sign in with Facebook Profile */}
              {metaStep === 1 && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-slide-in">
                  <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1c1e21' }}>Connect FrontDesk AI to Facebook</h4>
                  <p style={{ fontSize: '0.8rem', color: '#606770', lineHeight: '1.4' }}>
                    Signing in lets FrontDesk AI view your WhatsApp Business details and configure automation scripts automatically.
                  </p>
                  
                  <div style={{ background: 'white', border: '1px solid #dadce0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '340px', margin: '8px auto', textAlign: 'left' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: '700', fontSize: '1.2rem', overflow: 'hidden' }}>
                      {user.avatarImg ? <img src={user.avatarImg} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.avatar}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1c1e21' }}>{user.name}</p>
                      <p style={{ fontSize: '0.7rem', color: '#606770' }}>Logged in via Google Account</p>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setMetaStep(2)} 
                    className="btn-primary" 
                    style={{ background: '#1877f2', margin: '8px auto 0 auto', width: '100%', maxWidth: '340px', display: 'block', padding: '12px' }}
                  >
                    Continue as {user.name.split(' ')[0]}
                  </button>
                </div>
              )}

              {/* STEP 2: Choose Meta Business Account */}
              {metaStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-slide-in">
                  <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1c1e21', textAlign: 'center' }}>Select Your Meta Business Account</h4>
                  <p style={{ fontSize: '0.8rem', color: '#606770', textAlign: 'center', lineHeight: '1.4' }}>
                    Select the business manager profile that owns your salon or dental clinic store coordinates.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <div 
                      onClick={() => setMetaStep(3)} 
                      style={{ background: 'white', border: '2px solid #1877f2', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1c1e21' }}>{user.businessName || (activeNiche === 'dental' ? 'Zenith Dental Clinic' : 'Glow & Style Salon')}</p>
                        <p style={{ fontSize: '0.7rem', color: '#606770' }}>Meta Verified Business Profile</p>
                      </div>
                      <span style={{ color: '#1877f2', fontSize: '1.2rem' }}>✓</span>
                    </div>

                    <div style={{ background: '#f7f8fa', border: '1px solid #dadce0', borderRadius: '12px', padding: '16px', display: 'flex', justify: 'space-between', alignItems: 'center', opacity: '0.6', cursor: 'not-allowed' }}>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1c1e21' }}>Personal Account Sandbox</p>
                        <p style={{ fontSize: '0.7rem', color: '#606770' }}>Developer sandbox environment</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justify: 'space-between', marginTop: '16px' }}>
                    <button type="button" onClick={() => setMetaStep(1)} className="btn-secondary" style={{ padding: '8px 16px' }}>Back</button>
                    <button type="button" onClick={() => setMetaStep(3)} className="btn-primary" style={{ background: '#1877f2', padding: '8px 24px' }}>Continue</button>
                  </div>
                </div>
              )}

              {/* STEP 3: Setup Phone Number */}
              {metaStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-slide-in">
                  <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1c1e21', textAlign: 'center' }}>Connect WhatsApp Phone Number</h4>
                  <p style={{ fontSize: '0.8rem', color: '#606770', textAlign: 'center', lineHeight: '1.4' }}>
                    Provide the phone number you want to use for WhatsApp Business Automation.
                  </p>

                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label style={{ color: '#1c1e21' }}>Phone Number (with Country Code)</label>
                    <input 
                      type="tel" 
                      value={metaPhoneInput} 
                      onChange={(e) => setMetaPhoneInput(e.target.value)} 
                      placeholder="e.g. +91 99000 88000" 
                      style={{ background: 'white', border: '1px solid #dadce0', borderRadius: '8px', padding: '12px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: '#606770', background: '#e8f0fe', padding: '12px', borderRadius: '8px', border: '1px solid #d2e3fc' }}>
                    <span>ℹ️</span>
                    <p>Meta will send an official 6-digit verification code to this phone number via SMS to prove ownership.</p>
                  </div>

                  <div style={{ display: 'flex', justify: 'space-between', marginTop: '16px' }}>
                    <button type="button" onClick={() => setMetaStep(2)} className="btn-secondary" style={{ padding: '8px 16px' }}>Back</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (!metaPhoneInput.trim()) {
                          alert("Please enter a valid phone number.");
                          return;
                        }
                        setMetaOtpSent(true);
                        setMetaStep(4);
                      }} 
                      className="btn-primary" 
                      style={{ background: '#1877f2', padding: '8px 24px' }}
                    >
                      Send Verification OTP
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: OTP Verification */}
              {metaStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-slide-in">
                  <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1c1e21', textAlign: 'center' }}>Enter Verification Code</h4>
                  <p style={{ fontSize: '0.8rem', color: '#606770', textAlign: 'center', lineHeight: '1.4' }}>
                    We have sent a 6-digit confirmation code via SMS to **{metaPhoneInput}**. Enter it below.
                  </p>

                  <div className="form-group" style={{ alignItems: 'center', marginTop: '10px' }}>
                    <input 
                      type="text" 
                      value={metaOtpInput} 
                      onChange={(e) => {
                        setMetaOtpInput(e.target.value);
                        setMetaVerificationError('');
                      }} 
                      maxLength="6"
                      placeholder="e.g. 523194"
                      style={{ 
                        background: 'white', 
                        border: metaVerificationError ? '1px solid var(--accent-red)' : '1px solid #dadce0', 
                        borderRadius: '8px', 
                        padding: '12px',
                        width: '180px',
                        textAlign: 'center',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        letterSpacing: '0.15em'
                      }}
                    />
                    
                    {metaVerificationError && (
                      <p style={{ color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: '600', marginTop: '4px' }}>
                        {metaVerificationError}
                      </p>
                    )}
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#606770', textAlign: 'center' }}>
                    Didn't receive code? <span style={{ color: '#1877f2', cursor: 'pointer', fontWeight: '600' }} onClick={() => triggerToast("New OTP Sent!")}>Resend Code</span>
                  </p>

                  <div style={{ display: 'flex', justify: 'space-between', marginTop: '16px' }}>
                    <button type="button" onClick={() => setMetaStep(3)} className="btn-secondary" style={{ padding: '8px 16px' }}>Back</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        // Demo validation: accept any 6-digit numeric input
                        if (metaOtpInput.length !== 6 || !/^\d+$/.test(metaOtpInput)) {
                          setMetaVerificationError("❌ Invalid OTP. Enter a 6-digit code.");
                          return;
                        }

                        // Complete simulation
                        setWhatsappConfig({
                          accessToken: 'EAAd1a73e8EAAd1a73e8EAAd1a73e8_secure_bearer',
                          phoneNumberId: '1168815362979106',
                          accountId: '238128912389104',
                          phoneNumber: metaPhoneInput,
                          isConnected: true
                        });
                        setIsMetaModalOpen(false);
                        triggerToast("WhatsApp Connected via Meta Embedded Signup!", "green");
                        addActivity(`Connected WhatsApp account number: ${metaPhoneInput}`, "success");
                      }} 
                      className="btn-primary" 
                      style={{ background: '#1e8e3e', padding: '8px 24px', boxShadow: '0 2px 6px rgba(30,142,62,0.3)' }}
                    >
                      Verify and Link 🚀
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Sidebar Nav */}
      <aside className="sidebar">
        <div>
          <div className="logo-container">
            <div className="logo-icon">D</div>
            <span className="logo-text">FrontDesk AI</span>
          </div>

          {/* User Profile Block with Real Google Avatar */}
          <div className="user-profile-section">
            <div className="user-avatar" style={{ 
              background: user.role === 'admin' 
                ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))'
                : 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
              overflow: 'hidden'
            }}>
              {user.avatarImg ? (
                <img 
                  src={user.avatarImg} 
                  alt={user.name} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                user.avatar
              )}
            </div>
            <div className="user-info-text">
              <div className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{user.name}</span>
                {user.role === 'admin' && <Shield size={12} style={{ color: 'var(--accent-blue)' }} />}
              </div>
              <div className="user-email">
                {user.role === 'admin' ? 'SaaS Administrator' : `${user.businessName || (activeNiche === 'dental' ? 'Dental' : 'Salon')} Owner`}
              </div>
            </div>
          </div>

          <ul className="sidebar-menu">
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <Users size={18} />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('leads')}
                className={`menu-item ${activeTab === 'leads' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <MessageSquare size={18} />
                <span>Lead Manager</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('appointments')}
                className={`menu-item ${activeTab === 'appointments' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <Calendar size={18} />
                <span>Appointments</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('automation')}
                className={`menu-item ${activeTab === 'automation' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <Settings size={18} />
                <span>Automation Hub</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('rewards')}
                className={`menu-item ${activeTab === 'rewards' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <Share2 size={18} />
                <span>Reviews & Referrals</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('campaigns')}
                className={`menu-item ${activeTab === 'campaigns' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
                <span>Marketing Broadcast</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <UserIcon size={18} />
                <span>My Profile</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Admin Switcher & Sign Out */}
        <div className="sidebar-niche-select">
          <button 
            onClick={handleLogOut}
            className="menu-item"
            style={{ width: '100%', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--accent-pink)' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>

          {user.role === 'admin' ? (
            <>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Select Niche Dashboard</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => setActiveNiche('dental')}
                  className="niche-switcher-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left',
                    border: activeNiche === 'dental' ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                    background: activeNiche === 'dental' ? 'var(--accent-blue-glow)' : 'transparent',
                    width: '100%',
                    color: activeNiche === 'dental' ? '#22d3ee' : 'var(--text-secondary)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🦷</span>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>Zenith Dental</p>
                    <p style={{ fontSize: '0.7rem', opacity: '0.8' }}>Dental Clinic Niche</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveNiche('salon')}
                  className="niche-switcher-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left',
                    border: activeNiche === 'salon' ? '1px solid var(--accent-purple)' : '1px solid var(--border-light)',
                    background: activeNiche === 'salon' ? 'var(--accent-purple-glow)' : 'transparent',
                    width: '100%',
                    color: activeNiche === 'salon' ? '#c084fc' : 'var(--text-secondary)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>💇‍♀️</span>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>Glow & Style</p>
                    <p style={{ fontSize: '0.7rem', opacity: '0.8' }}>Salon & Spa Niche</p>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '0.75rem',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              Locked to {user.businessName || (activeNiche === 'dental' ? 'Dental Clinic' : 'Hair Salon & Spa')}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Header */}
        <div className="header-row">
          <div className="header-info">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{currentConfig.logo}</span>
              <span>{currentConfig.businessName}</span>
            </h2>
            <p>Front Desk Dashboard powered by FrontDesk AI</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="pulse-badge">
              <span className="pulse-dot"></span>
              WhatsApp Agent Active
            </span>
            <div className="glass-panel" style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Plan:</span>
              <span style={{ color: 'var(--accent-purple)', fontWeight: '600' }}>₹999/mo Starter</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Dashboard overview */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            
            <div className="kpi-grid">
              <div className="glass-panel kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Captured Leads</span>
                  <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-blue)' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div className="kpi-value">{nicheLeadsCount}</div>
                <div className="kpi-footer">
                  <span className="trend-up" style={{ display: 'flex', alignItems: 'center' }}><TrendingUp size={12} /> +15%</span>
                  <span>leads this week</span>
                </div>
              </div>

              <div className="glass-panel kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Confirmed Bookings</span>
                  <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
                    <Calendar size={18} />
                  </div>
                </div>
                <div className="kpi-value">{activeBookingsCount}</div>
                <div className="kpi-footer">
                  <span className="trend-up" style={{ display: 'flex', alignItems: 'center' }}><TrendingUp size={12} /> +10%</span>
                  <span>vs last week</span>
                </div>
              </div>

              <div className="glass-panel kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">CRM Conversion Rate</span>
                  <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' }}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div className="kpi-value">{conversionRate}%</div>
                <div className="kpi-footer">
                  <span className="trend-up" style={{ display: 'flex', alignItems: 'center' }}><TrendingUp size={12} /> +5%</span>
                  <span>conversion increase</span>
                </div>
              </div>

              <div className="glass-panel kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Google Rating</span>
                  <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-yellow)' }}>
                    <Star size={18} />
                  </div>
                </div>
                <div className="kpi-value">{averageReviewScore.toFixed(1)} / 5.0</div>
                <div className="kpi-footer">
                  <span style={{ color: 'var(--accent-yellow)', display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < Math.round(averageReviewScore) ? 'var(--accent-yellow)' : 'transparent'} />
                    ))}
                  </span>
                  <span>({reviews.filter(r => r.niche === activeNiche && r.status === 'completed').length} reviews)</span>
                </div>
              </div>
            </div>

            <div className="dashboard-details-grid">
              
              {/* CSS Bar Chart */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header">
                  <h3 className="panel-title">AI Conversion Pipeline</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lead status breakdown</span>
                </div>
                <div className="panel-body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justify: 'center' }}>
                  
                  <div className="chart-container">
                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar-fill" 
                        style={{ height: `${(leadStatusCounts[0]/nicheLeadsCount)*150 || 20}px`, backgroundColor: 'var(--accent-blue)' }}
                        data-value={leadStatusCounts[0]}
                      ></div>
                      <span className="chart-label">New Leads ({leadStatusCounts[0]})</span>
                    </div>

                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar-fill" 
                        style={{ height: `${(leadStatusCounts[1]/nicheLeadsCount)*150 || 20}px`, backgroundColor: 'var(--accent-yellow)' }}
                        data-value={leadStatusCounts[1]}
                      ></div>
                      <span className="chart-label">Followed Up ({leadStatusCounts[1]})</span>
                    </div>

                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar-fill" 
                        style={{ height: `${(leadStatusCounts[2]/nicheLeadsCount)*150 || 20}px`, backgroundColor: 'var(--accent-green)' }}
                        data-value={leadStatusCounts[2]}
                      ></div>
                      <span className="chart-label">Converted ({leadStatusCounts[2]})</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Total WhatsApp Captured: {nicheLeadsCount} Leads</span>
                    <span>Active Niche: {currentConfig.businessName}</span>
                  </div>
                </div>
              </div>

              {/* Feed Panel */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header">
                  <h3 className="panel-title">Realtime Front Desk Logs</h3>
                  <Sparkles size={16} className="trend-up" />
                </div>
                <div className="panel-body">
                  <div className="activity-list">
                    {activities.map(act => (
                      <div key={act.id} className="activity-item">
                        <span className="activity-dot" style={{ 
                          backgroundColor: act.type === 'success' ? 'var(--accent-green)' : 
                                           act.type === 'reward' ? 'var(--accent-yellow)' : 
                                           act.type === 'ai' ? 'var(--accent-blue)' : 'var(--accent-purple)'
                        }}></span>
                        <div style={{ flexGrow: 1 }}>
                          <p style={{ color: 'var(--text-primary)' }}>{act.text}</p>
                          <span className="activity-time">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Strategy Box */}
            <div className="glass-panel" style={{ display: 'flex', gap: '20px', padding: '24px', alignItems: 'center', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)' }}>
              <div style={{ fontSize: '2.5rem' }}>📢</div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: 'bold' }}>Viral Referrals Loop Active</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  FrontDesk AI automatically appends discount coupons (e.g. 10% Off or ₹500 Coupon) to confirmed appointment tickets. Give business owners and customers referral links to easily drive local acquisition.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('rewards')}
                className="btn-primary" 
                style={{ marginLeft: 'auto', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Check Rewards</span>
                <ArrowUpRight size={16} />
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Leads Table */}
        {activeTab === 'leads' && (
          <div className="tab-content">
            
            <div className="search-filter-row">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon-svg" />
                <input 
                  type="text" 
                  placeholder="Search leads by name, phone, area or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filters-btn-group">
                <button 
                  onClick={() => setLeadFilter('all')}
                  className={`filter-btn ${leadFilter === 'all' ? 'active' : ''}`}
                >All</button>
                <button 
                  onClick={() => setLeadFilter('new')}
                  className={`filter-btn ${leadFilter === 'new' ? 'active' : ''}`}
                >New</button>
                <button 
                  onClick={() => setLeadFilter('followed_up')}
                  className={`filter-btn ${leadFilter === 'followed_up' ? 'active' : ''}`}
                >Followed Up</button>
                <button 
                  onClick={() => setLeadFilter('converted')}
                  className={`filter-btn ${leadFilter === 'converted' ? 'active' : ''}`}
                >Converted</button>

                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-light)', margin: '0 8px' }}></div>

                <button 
                  onClick={handleExportCSV}
                  className="filter-btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)' }}
                  title="Export leads list as a CSV file"
                >
                  <Download size={14} />
                  <span>CSV Export</span>
                </button>

                <button 
                  onClick={() => setIsLeadModalOpen(true)}
                  className="btn-primary" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  <span>Add Lead</span>
                </button>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Lead Contact</th>
                      <th>Service Requirement</th>
                      <th>Captured Location</th>
                      <th>Stated Budget</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map(lead => (
                        <tr key={lead.id}>
                          <td>
                            <div className="lead-name-cell">{lead.name}</div>
                            <div className="lead-phone-cell">{lead.phone}</div>
                          </td>
                          <td style={{ fontWeight: '500' }}>{lead.requirement}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                              <MapPin size={12} style={{ color: 'var(--accent-blue)' }} />
                              <span>{lead.location}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--accent-green)', fontWeight: '600' }}>{lead.budget}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{lead.source}</td>
                          <td>
                            <span className={`badge ${
                              lead.status === 'new' ? 'badge-new' : 
                              lead.status === 'followed_up' ? 'badge-follow' : 'badge-converted'
                            }`}>
                              {lead.status === 'new' ? 'New' : 
                               lead.status === 'followed_up' ? 'Followed Up' : 'Converted'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {lead.status !== 'converted' && (
                                <button 
                                  onClick={() => handleFollowUpLead(lead.id)}
                                  className="action-btn" 
                                  title="Send WhatsApp Follow-up"
                                >
                                  <Send size={14} style={{ color: 'var(--accent-purple)' }} />
                                </button>
                              )}
                              <button 
                                onClick={() => handleUpdateApptStatus(lead.id, 'converted')} 
                                className="action-btn"
                                style={{ color: 'var(--accent-green)' }}
                                title="Mark Converted"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteLead(lead.id)}
                                className="action-btn action-btn-danger" 
                                title="Remove Lead Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          No leads matching query parameters. Check the simulator panel to populate live entries!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Appointments */}
        {activeTab === 'appointments' && (
          <div className="tab-content">
            
            <div className="calendar-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Active Booking Calendar</h3>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-light)' }}>
                  <button 
                    onClick={() => setApptViewMode('cards')}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.8rem', 
                      borderRadius: '6px', 
                      border: 'none',
                      background: apptViewMode === 'cards' ? 'var(--accent-purple)' : 'transparent',
                      color: apptViewMode === 'cards' ? 'white' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Feed List
                  </button>
                  <button 
                    onClick={() => setApptViewMode('calendar')}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.8rem', 
                      borderRadius: '6px', 
                      border: 'none',
                      background: apptViewMode === 'calendar' ? 'var(--accent-purple)' : 'transparent',
                      color: apptViewMode === 'calendar' ? 'white' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Month View
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setSelectedPrefilledDate('');
                    setIsApptModalOpen(true);
                  }}
                  className="btn-primary" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>

            {apptViewMode === 'calendar' ? renderAppointmentsCalendar() : (
              <div className="booking-cards-grid">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(appt => {
                  const conflict = appointments.filter(a => 
                    a.id !== appt.id && 
                    a.niche === activeNiche && 
                    a.status === 'confirmed' &&
                    a.dateTime && appt.dateTime &&
                    typeof a.dateTime === 'string' &&
                    typeof appt.dateTime === 'string' &&
                    a.dateTime.substring(0, 16) === appt.dateTime.substring(0, 16)
                  );
                  const isConflicting = conflict.length > 0;

                  return (
                    <div key={appt.id} className="glass-panel booking-card" style={{
                      borderLeft: appt.status === 'confirmed' ? '4px solid var(--accent-green)' : '4px solid var(--accent-yellow)',
                      position: 'relative'
                    }}>
                      <div className="booking-card-header">
                        <div>
                          <div className="booking-customer">{appt.name}</div>
                          <div className="booking-service">
                            <span>{currentConfig.logo}</span>
                            <span>{appt.service}</span>
                          </div>
                        </div>
                        
                        <span className={`badge ${appt.status === 'confirmed' ? 'badge-converted' : 'badge-follow'}`}>
                          {appt.status}
                        </span>
                      </div>

                      <div className="booking-time">
                        <Clock size={14} />
                        <span>{(() => {
                          const d = new Date(appt.dateTime);
                          return isNaN(d.getTime()) ? appt.dateTime : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
                        })()}</span>
                      </div>

                      {isConflicting && appt.status === 'confirmed' && (
                        <div className="conflict-warning" style={{ margin: '8px 0 0 0', padding: '4px 8px' }}>
                          <AlertTriangle size={12} />
                          <span style={{ fontSize: '0.7rem' }}>Time Conflict Warning!</span>
                        </div>
                      )}

                      <div className="booking-footer">
                        <div className="reminder-toggle">
                          <label className="toggle-switch">
                            <input 
                              type="checkbox" 
                              checked={appt.reminderSent} 
                              onChange={() => {
                                setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, reminderSent: !a.reminderSent } : a));
                                triggerToast(`Reminder status toggled!`);
                              }} 
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          <span>Auto-Reminder Sent</span>
                        </div>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          {appt.status !== 'completed' && (
                            <button 
                              onClick={() => handleUpdateApptStatus(appt.id, 'completed')}
                              className="action-btn"
                              style={{ color: 'var(--accent-green)' }}
                              title="Mark Completed"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteAppointment(appt.id)}
                            className="action-btn action-btn-danger"
                            title="Delete Booking"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }} className="glass-panel">
                  No appointments booked for this niche yet. Try confirming the booking in the WhatsApp Chat simulator to make appointments appear!
                </div>
              )}
            </div>
          )}

            <div className="glass-panel" style={{ padding: '20px', marginTop: '12px' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={16} style={{ color: 'var(--accent-purple)' }} />
                Real-time Calendar Conflict Check Enabled
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                The FrontDesk system flags potential booking time collisions on the scheduler feed. Double bookings trigger an alert card so front desk managers can adjust times manually before sending notifications.
              </p>
            </div>

          </div>
        )}

        {/* Tab 3.5: Broadcast Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="tab-content">
            <div className="calendar-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Outbound Broadcast Campaigns</h3>
              <span className="badge badge-converted">Marketing Engine Active</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '16px' }}>
              
              {/* Campaign Editor */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={16} style={{ color: 'var(--accent-purple)' }} />
                  Configure Broadcast Campaign
                </h4>
                
                <div className="form-group">
                  <label>Select Target Audience</label>
                  <select id="campaign-audience" style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                    <option value="all-leads">All Registered Leads ({leads.filter(l => l.niche === activeNiche).length} contacts)</option>
                    <option value="new-leads">Only New Leads ({leads.filter(l => l.niche === activeNiche && l.status === 'new').length} contacts)</option>
                    <option value="all-appts">Appointment Clients ({appointments.filter(a => a.niche === activeNiche).length} contacts)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Campaign Template</label>
                  <select 
                    id="campaign-template" 
                    onChange={(e) => {
                      const t = e.target.value;
                      const box = document.getElementById("campaign-text-preview");
                      if (t === 'promo') {
                        box.value = `Hi {{name}}, this is ${currentConfig.businessName}! 🦷 We are offering an exclusive 15% discount for our loyalty club members. Book your slot today and show coupon code: LOYALTY15 at check-out!`;
                      } else if (t === 'review') {
                        box.value = `Hello {{name}}! Thank you for visiting us recently. We hope you loved our service. Could you please take 30 seconds to rate us on Google Reviews: ${currentConfig.reviewUrl}? It helps our clinic grow!`;
                      } else {
                        box.value = `Hi {{name}}, we have a few slots open this week for ${activeNiche === 'dental' ? 'teeth cleanings' : 'hair stylings'}. Reply to this message if you would like to book an appointment!`;
                      }
                    }}
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)' }}
                  >
                    <option value="promo">Exclusive Niche Promotion (15% Coupon)</option>
                    <option value="review">Google Review Request Loop</option>
                    <option value="slot">Schedule Slot Inquiry Reminder</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message Content Preview</label>
                  <textarea 
                    id="campaign-text-preview"
                    rows={4}
                    defaultValue={`Hi {{name}}, this is ${currentConfig.businessName}! 🦷 We are offering an exclusive 15% discount for our loyalty club members. Book your slot today and show coupon code: LOYALTY15 at check-out!`}
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'none' }}
                  />
                </div>

                <button 
                  onClick={() => {
                    const aud = document.getElementById("campaign-audience").value;
                    const msg = document.getElementById("campaign-text-preview").value;
                    
                    let targets = [];
                    if (aud === 'all-leads') {
                      targets = leads.filter(l => l.niche === activeNiche);
                    } else if (aud === 'new-leads') {
                      targets = leads.filter(l => l.niche === activeNiche && l.status === 'new');
                    } else {
                      targets = appointments.filter(a => a.niche === activeNiche);
                    }

                    if (targets.length === 0) {
                      triggerToast("No target contacts in this group!");
                      return;
                    }

                    const logs = document.getElementById("campaign-logs");
                    logs.innerHTML = `⏳ Initializing marketing campaign broadcast...<br/>`;
                    logs.innerHTML += `📋 Selected target audience: ${aud} (${targets.length} recipients found)<br/>`;
                    
                    playAudioSfx('send');
                    let delay = 1000;
                    targets.forEach((t, i) => {
                      setTimeout(() => {
                        const filledMsg = msg.replace("{{name}}", t.name);
                        logs.innerHTML += `📲 [${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}] Sent WhatsApp message to ${t.name} (${t.phone}): <span style="color: var(--accent-green)">SUCCESS</span><br/>`;
                        addActivity(`Campaign broadcast sent to ${t.name}`, 'info');
                        
                        if (i === targets.length - 1) {
                          setTimeout(() => {
                            logs.innerHTML += `🎉 Broadcast Campaign completed! Sent successfully to ${targets.length} users.`;
                            triggerToast(`Campaign sent to ${targets.length} users!`, 'green');
                          }, 500);
                        }
                      }, delay);
                      delay += 800;
                    });
                  }}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '12px' }}
                >
                  🚀 Launch WhatsApp Broadcast Campaign
                </button>
              </div>

              {/* Campaign Logs */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: 'var(--accent-blue)' }} />
                  Live Campaign Sending Console
                </h4>
                <div 
                  id="campaign-logs"
                  style={{ 
                    flex: 1, 
                    background: 'black', 
                    color: '#00ff00', 
                    fontFamily: 'monospace', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    fontSize: '0.8rem',
                    overflowY: 'auto',
                    minHeight: '200px',
                    lineHeight: '1.5'
                  }}
                >
                  [CONSOLE IDLE] Select target group and click "Launch WhatsApp Broadcast Campaign" to begin.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: Automation Hub */}
        {activeTab === 'automation' && (
          <div className="tab-content">
            
            <div className="automation-sections">
              
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
                  AI Agent Instructions
                </h3>

                <form onSubmit={handleSaveConfig}>
                  <div className="form-group">
                    <label>Business Public Name</label>
                    <input 
                      name="businessName" 
                      defaultValue={currentConfig.businessName} 
                      placeholder="e.g. Zenith Dental Clinic"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>AI Greeting Message (Initial WhatsApp reply)</label>
                    <textarea 
                      name="greetingMessage" 
                      defaultValue={currentConfig.greetingMessage} 
                      placeholder="Type the message customers receive when they text Hello..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>System Prompt Instruction (How AI behaves)</label>
                    <textarea 
                      name="systemPrompt" 
                      defaultValue={currentConfig.systemPrompt} 
                      style={{ minHeight: '140px' }}
                      placeholder="Provide constraints, tone instructions, and data capture lists..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Google Review Request Link</label>
                    <input 
                      name="reviewUrl" 
                      defaultValue={currentConfig.reviewUrl} 
                      placeholder="https://g.page/r/your-business/review"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                    Save AI Front Desk Settings
                  </button>
                </form>
              </div>

              {/* WHATSAPP BUSINESS API INTEGRATION MODULE */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', justify: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smartphone size={18} style={{ color: '#00a884' }} />
                    WhatsApp Business API Integration
                  </span>
                  
                  <span className={`badge ${whatsappConfig.isConnected ? 'badge-converted' : 'badge-noshow'}`}>
                    {whatsappConfig.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, justifyContent: 'center' }}>
                  {whatsappConfig.isConnected ? (
                    <div style={{ background: '#e6f4ea', border: '1px solid #ceead6', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ fontWeight: '700', color: '#137333', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} /> Fully Connected to WhatsApp API!
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Your Meta Business profile and phone number are connected. Incoming client queries on your registered number will now automatically be processed by FrontDesk AI.
                      </p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid #dadce0', paddingTop: '10px', marginTop: '4px' }}>
                        <div><strong>Connected Number:</strong> {whatsappConfig.phoneNumber || '+91 99000 88000'}</div>
                        <div><strong>Phone ID:</strong> {whatsappConfig.phoneNumberId || '1168815362979106'}</div>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => {
                          setWhatsappConfig({ accessToken: '', phoneNumberId: '', accountId: '', isConnected: false });
                          triggerToast("WhatsApp connection disconnected.");
                          addActivity("Disconnected WhatsApp Account", "info");
                        }} 
                        className="btn-secondary" 
                        style={{ marginTop: '10px', width: '100%', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        Disconnect Account
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'stretch' }}>
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          Connect your business WhatsApp number instantly using Meta's official Embedded Signup flow. No manual developer token generation needed!
                        </p>
                        
                        <button 
                          type="button" 
                          onClick={handleMetaLogin} 
                          className="btn-primary" 
                          style={{ background: '#1877f2', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px', justifyContent: 'center', boxShadow: '0 2px 6px rgba(24,119,242,0.3)' }}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          <span>Connect with Meta (Embedded Signup)</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0' }}>
                        <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-light)' }}></div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>OR LINK MANUALLY</span>
                        <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-light)' }}></div>
                      </div>

                      <form onSubmit={handleSaveWhatsAppConfig} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="form-group" style={{ margin: '0' }}>
                          <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Meta Access Token</label>
                          <input 
                            name="accessToken" 
                            type="text" 
                            placeholder="Paste your Meta Access Token here (Temporary or System User)" 
                            required 
                            style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px', fontSize: '0.8rem' }}
                          />
                        </div>

                        <div className="form-group" style={{ margin: '0' }}>
                          <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Phone Number ID</label>
                          <input 
                            name="phoneNumberId" 
                            type="text" 
                            placeholder="e.g. 1168815362979106" 
                            required 
                            style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px', fontSize: '0.8rem' }}
                          />
                        </div>

                        <div className="form-group" style={{ margin: '0' }}>
                          <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>WhatsApp Business Account ID</label>
                          <input 
                            name="accountId" 
                            type="text" 
                            placeholder="e.g. 238128912389104" 
                            required 
                            style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px', fontSize: '0.8rem' }}
                          />
                        </div>

                        <button type="submit" className="btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '0.8rem', marginTop: '4px' }}>
                          Link Credentials Manually 🚀
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Webhook URLs Display */}
                <div style={{ background: '#f8f9fa', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <LinkIcon size={14} style={{ color: 'var(--accent-blue)' }} /> Copy Webhook Callback URL:
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Callback URL:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #dadce0', padding: '6px 10px', borderRadius: '8px', marginTop: '4px' }}>
                        <code style={{ flexGrow: 1, textOverflow: 'ellipsis', overflow: 'hidden' }}>https://api.frontdesk.com/v1/webhooks/{activeNiche}</code>
                        <button onClick={() => { navigator.clipboard.writeText(`https://api.frontdesk.com/v1/webhooks/${activeNiche}`); triggerToast("URL Copied!"); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Copy size={12} /></button>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Verify Token:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #dadce0', padding: '6px 10px', borderRadius: '8px', marginTop: '4px' }}>
                        <code style={{ flexGrow: 1 }}>frontdesk_verify_token_secure_99</code>
                        <button onClick={() => { navigator.clipboard.writeText("frontdesk_verify_token_secure_99"); triggerToast("Verify Token Copied!"); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Copy size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <Info size={16} style={{ flexShrink: 0, color: 'var(--accent-blue)' }} />
                  <p>Meta requires a secure SSL Callback URL (`https://...`) to hook events. Copy these details and paste them inside Meta's WhatsApp Developer App configuration settings.</p>
                </div>

              </div>

            </div>

            {/* Manual Guide */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} style={{ color: 'var(--accent-blue)' }} />
                Meta Developer Setup Guide (Connecting WhatsApp in 3 Steps)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '0.8rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
                <div style={{ background: '#f8f9fa', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>1. Register on Meta Portal</p>
                  Create a developer account at <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>developers.facebook.com</a>. Create an app, choose the **Business** category, and add **WhatsApp** to your dashboard product list.
                </div>

                <div style={{ background: '#f8f9fa', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>2. Setup Webhook URL</p>
                  Navigate to WhatsApp &gt; Configuration. Click Edit Webhook. Copy our **Callback URL** and **Verify Token** from this page and paste them. Subscribe to the `messages` event field.
                </div>

                <div style={{ background: '#f8f9fa', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>3. Input Access Keys</p>
                  Copy the generated **Access Token**, **Phone Number ID**, and **Account ID** from Meta's dashboard. Paste them into the configuration form above and click connect.
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 5: Rewards */}
        {activeTab === 'rewards' && (
          <div className="tab-content">
            
            <div className="dashboard-details-grid">
              
              {/* Referrals */}
              <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="panel-header">
                  <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Share2 size={18} style={{ color: 'var(--accent-blue)' }} />
                    Viral Referral Codes
                  </h3>
                  <span className="badge badge-converted">Engine Active</span>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Referrer</th>
                        <th>Coupon Code</th>
                        <th>Reward Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map(ref => (
                        <tr key={ref.id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>{ref.referrerName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ref.referrerPhone}</div>
                          </td>
                          <td>
                            <span className="referral-share-code">{ref.code}</span>
                          </td>
                          <td style={{ fontWeight: '500', color: 'var(--accent-green)' }}>{ref.discountValue}</td>
                          <td>
                            <span className={`badge ${
                              ref.status === 'redeemed' ? 'badge-converted' : 
                              ref.status === 'sent' ? 'badge-follow' : 'badge-new'
                            }`}>
                              {ref.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reviews */}
              <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="panel-header">
                  <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={18} style={{ color: 'var(--accent-yellow)' }} />
                    Google Review Request Loops
                  </h3>
                  <span className="badge badge-new">{reviews.filter(r => r.niche === activeNiche && r.status === 'completed').length} Received</span>
                </div>
                <div className="panel-body">
                  <div className="activity-list" style={{ maxHeight: '380px' }}>
                    {reviews.filter(r => r.niche === activeNiche).map(rev => (
                      <div key={rev.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{rev.customerName}</span>
                          <span className={`badge ${rev.status === 'completed' ? 'badge-converted' : 'badge-new'}`} style={{ fontSize: '0.65rem' }}>
                            {rev.status === 'completed' ? 'Submitted' : 'Link Sent'}
                          </span>
                        </div>
                        {rev.rating > 0 && (
                          <div className="star-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={12} fill={i < rev.rating ? 'var(--accent-yellow)' : 'transparent'} />
                            ))}
                          </div>
                        )}
                        {rev.comment && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', italic: 'true' }}>"{rev.comment}"</p>}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Request Date: {new Date(rev.sentDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={18} style={{ color: 'var(--accent-yellow)' }} />
                Your SaaS Pricing Architecture (For Manual Pitching)
              </h3>
              
              <div className="pricing-overview">
                <div className="pricing-card">
                  <span className="pricing-tag">Starter Tier</span>
                  <span className="pricing-price">₹999 / month</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Include AI Chat Capture, Appointment Booking and 100 Lead SMS/WhatsApp notifications.</p>
                </div>
                <div className="pricing-card" style={{ borderColor: 'var(--accent-purple)' }}>
                  <span className="pricing-tag" style={{ color: 'var(--accent-purple)' }}>Pro Tier (Recommended)</span>
                  <span className="pricing-price">₹2,499 / month</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Uncapped AI Messages, Review request growth automation, Referral code engine, and Analytics dashboard.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 6: My Profile */}
        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="profile-dashboard-layout">
              {/* Left card - account stats */}
              <div className="glass-panel profile-card-left">
                <div style={{ position: 'relative' }}>
                  {user.avatarImg ? (
                    <img 
                      src={user.avatarImg} 
                      alt={user.name} 
                      className="profile-img-lg" 
                    />
                  ) : (
                    <div className="profile-avatar-lg">{user.avatar}</div>
                  )}
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '6px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#1e8e3e',
                    border: '3px solid white',
                    display: 'block'
                  }} title="Online"></span>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{user.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>{user.email}</p>
                </div>

                <div className="profile-status-badge">
                  <Shield size={12} />
                  <span style={{ textTransform: 'capitalize' }}>Role: {user.role === 'admin' ? 'SaaS Super Admin' : 'Business Owner'}</span>
                </div>

                <div className="profile-usage-section">
                  {/* Monthly Subscription Card */}
                  <div className="glass-panel" style={{
                    background: user.isSubscribed 
                      ? 'linear-gradient(135deg, rgba(30, 142, 62, 0.08) 0%, rgba(20, 20, 20, 0.02) 100%)' 
                      : 'linear-gradient(135deg, rgba(242, 153, 74, 0.08) 0%, rgba(20, 20, 20, 0.02) 100%)',
                    border: user.isSubscribed ? '1px solid rgba(30, 142, 62, 0.25)' : '1px solid rgba(242, 153, 74, 0.25)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.03)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Subscription
                      </span>
                      {user.isSubscribed ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          color: '#1e8e3e',
                          backgroundColor: 'rgba(30, 142, 62, 0.12)',
                          border: '1px solid rgba(30, 142, 62, 0.15)'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#1e8e3e', display: 'inline-block' }}></span>
                          Active
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          color: '#d93025',
                          backgroundColor: 'rgba(217, 48, 37, 0.12)',
                          border: '1px solid rgba(217, 48, 37, 0.15)'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#d93025', display: 'inline-block' }}></span>
                          Inactive
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                          Starter Plan
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {user.isSubscribed 
                            ? `Next Billing: July 2, 2026 (₹999/mo)` 
                            : 'Access WhatsApp AI Engine (₹999/mo)'}
                        </p>
                      </div>
                      
                      <div>
                        {user.isSubscribed ? (
                          <button 
                            onClick={handlePayment}
                            disabled={isPaymentLoading}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-light)',
                              background: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}
                          >
                            {isPaymentLoading ? '...' : 'Extend Plan'}
                          </button>
                        ) : (
                          <button 
                            onClick={handlePayment}
                            disabled={isPaymentLoading}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #0070f3 0%, #00dfd8 100%)',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              boxShadow: '0 4px 10px 0 rgba(0, 118, 255, 0.25)',
                              transition: 'all 0.2s',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 6px 14px 0 rgba(0, 118, 255, 0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 4px 10px 0 rgba(0, 118, 255, 0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <Sparkles size={12} />
                            {isPaymentLoading ? '...' : 'Pay ₹999'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="usage-meter-group">
                    <div className="usage-meter-header">
                      <span>AI WhatsApp Responses</span>
                      <span>42 / 500 Msgs</span>
                    </div>
                    <div className="usage-meter-bar">
                      <div className="usage-meter-fill" style={{ width: '8.4%', backgroundColor: 'var(--accent-blue)' }}></div>
                    </div>
                  </div>

                  <div className="usage-meter-group">
                    <div className="usage-meter-header">
                      <span>Captured Leads Limit</span>
                      <span>{nicheLeadsCount} / Unlimited</span>
                    </div>
                    <div className="usage-meter-bar">
                      <div className="usage-meter-fill" style={{ width: '100%', backgroundColor: 'var(--accent-green)' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right panel - edit form */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <UserIcon size={18} style={{ color: 'var(--accent-blue)' }} />
                  Business Profile & Coordinates
                </h3>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  
                  const updatedName = form.profileName.value;
                  const updatedBusinessName = form.businessName.value;
                  const updatedWebsite = form.businessWebsite.value;
                  const updatedPhone = form.businessPhone.value;
                  const updatedAddress = form.businessAddress.value;
                  const updatedTone = form.aiPersona.value;

                  const updatedUser = {
                    ...user,
                    name: updatedName,
                    businessName: updatedBusinessName,
                    businessWebsite: updatedWebsite,
                    businessPhone: updatedPhone,
                    businessAddress: updatedAddress,
                    aiPersona: updatedTone
                  };

                  setUser(updatedUser);
                  localStorage.setItem('frontdesk_user', JSON.stringify(updatedUser));

                  // Save in profiles library
                  const profilesLocal = localStorage.getItem('frontdesk_user_profiles');
                  const profiles = profilesLocal ? JSON.parse(profilesLocal) : {};
                  localStorage.setItem('frontdesk_user_profiles', JSON.stringify({
                    ...profiles,
                    [user.email.toLowerCase()]: updatedUser
                  }));

                  // Update config as well
                  if (user.role === 'owner') {
                    const updatedConfigs = {
                      ...nicheConfigs,
                      [activeNiche]: {
                        ...nicheConfigs[activeNiche],
                        businessName: updatedBusinessName,
                        systemPrompt: `You are the primary AI Front Desk agent for ${updatedBusinessName}, a premium ${activeNiche === 'dental' ? 'Dental Clinic' : 'Hair Salon & Spa'} located at ${updatedAddress}. 
Your contact phone is ${updatedPhone} and website is ${updatedWebsite}.
Your personality is ${updatedTone} (always polite, helpful, and concise).
Your main tasks are:
1. Capture client full name, WhatsApp number, requested service, and location.
2. Confirm slots and schedule appointments.
3. Share the Google Review link: ${nicheConfigs[activeNiche].reviewUrl} and referral codes to drive viral loyalty loops.`
                      }
                    };
                    setNicheConfigs(updatedConfigs);
                    localStorage.setItem('frontdesk_configs', JSON.stringify(updatedConfigs));
                  }

                  triggerToast("Profile and business details updated!", "green");
                  addActivity(`Updated business coordinates for ${updatedBusinessName}`, "success");

                   // Sync updated profile details to backend Express server
                  authenticatedFetch(`${BACKEND_URL}/v1/business-profile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...updatedUser,
                      phoneNumberId: whatsappConfig?.phoneNumberId || ''
                    })
                  }).catch(err => console.error("Error syncing profile with backend:", err));
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Your Full Name</label>
                      <input 
                        type="text" 
                        name="profileName" 
                        defaultValue={user.name} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Verification Email (Locked)</label>
                      <input 
                        type="email" 
                        defaultValue={user.email} 
                        disabled 
                        style={{ background: '#f1f3f4', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Business Public Name</label>
                      <input 
                        type="text" 
                        name="businessName" 
                        defaultValue={user.businessName || currentConfig.businessName} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Business Category (Niche)</label>
                      <input 
                        type="text" 
                        defaultValue={activeNiche === 'dental' ? '🦷 Dental Clinic' : '💇‍♀️ Hair Salon & Spa'} 
                        disabled 
                        style={{ background: '#f1f3f4', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Business Website</label>
                      <input 
                        type="url" 
                        name="businessWebsite" 
                        defaultValue={user.businessWebsite || ''} 
                        placeholder="e.g. https://www.website.com" 
                      />
                    </div>

                    <div className="form-group">
                      <label>Business Phone Number</label>
                      <input 
                        type="tel" 
                        name="businessPhone" 
                        defaultValue={user.businessPhone || '+91 99000 88000'} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Store / Clinic Full Address</label>
                    <input 
                      type="text" 
                      name="businessAddress" 
                      defaultValue={user.businessAddress || '100 Feet Road, Indiranagar, Bangalore'} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>AI Assistant Tone</label>
                    <select name="aiPersona" defaultValue={user.aiPersona || 'Friendly'}>
                      <option value="Professional">👔 Professional / Formal</option>
                      <option value="Friendly">🌸 Warm & Friendly</option>
                      <option value="Salesy">⚡ Energetic & Sales-focused</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                    Save Profile Details
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* WhatsApp Playground Sidebar */}
      <section className="simulator-panel">
        
        <div className="simulator-header-text">
          <h3 style={{ display: 'flex', alignItems: 'center', justify: 'center', gap: '8px' }}>
            <Smartphone size={18} style={{ color: 'var(--accent-purple)' }} />
            WhatsApp AI Playground
            <button 
              onClick={handleResetChat} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
              title="Reset Chat Session"
            >
              <RotateCcw size={14} />
            </button>
          </h3>
          <p>Test the customer AI chat flow live</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-light)', width: 'fit-content', margin: '8px auto 0 auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '500', color: isLiveAiMode ? 'var(--accent-purple)' : 'var(--text-muted)' }}>
              {isLiveAiMode ? '🧠 Live Gemini AI Active' : '🤖 Offline Bot Mock'}
            </span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={isLiveAiMode} 
                onChange={(e) => {
                  setIsLiveAiMode(e.target.checked);
                  handleResetChat();
                }} 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="phone-mockup">
          <div className="phone-screen">
            
            <div className="phone-status-bar">
              <span>9:41</span>
              <div className="right-icons">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            <div className="chat-header">
              <div className="chat-avatar">{currentConfig.logo}</div>
              <div className="chat-info">
                <div className="chat-info-name">{currentConfig.businessName}</div>
                <div className="chat-info-status">
                  {isTyping ? 'typing...' : 'Online (AI Front Desk)'}
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`message-bubble ${msg.sender === 'bot' ? 'message-in' : 'message-out'}`}
                >
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="typing-bubble">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div style={{
              padding: '8px', 
              background: '#121b22', 
              display: 'flex', 
              gap: '6px', 
              overflowX: 'auto',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              whiteSpace: 'nowrap'
            }}>
              <button 
                onClick={() => triggerQuickQuery("I want to book an appointment")}
                style={{ background: '#202c33', color: '#e9edef', border: 'none', padding: '4px 10px', borderRadius: '12px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                📅 Book Appointment
              </button>
              <button 
                onClick={() => triggerQuickQuery("What are your service prices?")}
                style={{ background: '#202c33', color: '#e9edef', border: 'none', padding: '4px 10px', borderRadius: '12px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                💰 Price Menu
              </button>
              <button 
                onClick={() => triggerQuickQuery("Where are you located?")}
                style={{ background: '#202c33', color: '#e9edef', border: 'none', padding: '4px 10px', borderRadius: '12px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                📍 Location/Timings
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-bar">
              <div className="chat-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Type message as customer..." 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </div>
              <button type="submit" className="chat-send-btn">
                <Send size={16} />
              </button>
            </form>

          </div>
        </div>

      </section>

    </div>
  );
}
