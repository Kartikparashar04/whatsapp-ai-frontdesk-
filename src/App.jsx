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
  Info,
  Database,
  BookOpen,
  UploadCloud,
  ArrowLeft
} from 'lucide-react';
import { 
  INITIAL_LEADS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_REVIEWS, 
  NICHE_CONFIGS 
} from './mockData';
import { 
  formatPhoneWithDefault91, 
  validatePhoneNumber, 
  validateEmailAddress, 
  validateFullName, 
  validateUrl, 
  validateNumericId 
} from './utils/validation';
import OnboardingWizard from './components/OnboardingWizard';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged
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
const BACKEND_URL = 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:3000'
    : (import.meta.env.VITE_BACKEND_URL || 'https://app.frontdeskai.shop');

// SheetJS (XLSX) Dynamic Loader Helper for Excel uploads
const loadSheetJS = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error("Failed to load Excel parsing library."));
    document.head.appendChild(script);
  });
};

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



// ── LANDING PAGE CONSTANTS ──
const BLUE = "#3B82F6";
const BLUE_DARK = "#2563EB";
const GREEN = "#22C55E";
const GREEN_DARK = "#16A34A";
const PURPLE = "#7C3AED";
const GRAY_BG = "#F1F5F9";
const WHITE = "#FFFFFF";
const TEXT = "#111827";
const TEXT_MID = "#374151";
const TEXT_GRAY = "#6B7280";
const BORDER = "#E5E7EB";

const chatMsgs = [
  { from:"user", text:"Hi, appointment book karni hai", delay:0 },
  { from:"bot",  text:"Namaste! 🙏 Welcome to Zenith Dental. Main aapka AI Front Desk hoon. Kaunsi service chahiye?", delay:1200 },
  { from:"user", text:"Teeth cleaning please", delay:2800 },
  { from:"bot",  text:"Sure! Dr. Sharma ke paas slots hain:\n• Aaj 4:00 PM ✅\n• Kal 10:00 AM ✅\n• Kal 3:00 PM ✅\n\nKaunsa time suit karega? 😊", delay:4000 },
  { from:"user", text:"Aaj 4 PM", delay:5600 },
  { from:"bot",  text:"✅ Confirmed! Aaj 4:00 PM — Dr. Sharma.\n\n1 ghante pehle WhatsApp reminder aayega. Dhanyawad! 🎉", delay:7000 },
];

const features = [
  { icon:"🤖", title:"AI Receptionist 24/7", desc:"WhatsApp pe customer queries, bookings aur FAQs handle karo — raat 2 baje bhi, Sunday ko bhi. Koi staff nahi chahiye." },
  { icon:"📅", title:"Auto Appointment Booking", desc:"Customers seedha WhatsApp se slot book karte hain. No missed calls, no back-and-forth." },
  { icon:"🔔", title:"Smart Auto-Reminders", desc:"Automatic reminders se no-shows 60% tak kam hote hain. Har customer ko time pe yaad dilao." },
  { icon:"⭐", title:"Google Review Booster", desc:"Visit ke baad AI khud Google review maangta hai. Rating badhti hai bina kisi effort ke." },
  { icon:"📣", title:"Broadcast Campaigns", desc:"Offers, festival wishes, updates — ek click mein apne saare WhatsApp contacts ko bhejo." },
  { icon:"📊", title:"Lead Manager + Analytics", desc:"Har lead track karo — New, Followed Up, Converted. Real-time dashboard pe sab dekho." },
];

const niches = [
  ["🦷","Dental Clinics"],["💇","Salons & Spas"],["🏥","Clinics"],
  ["📚","Coaching"],["🏋️","Gyms"],["🍽️","Restaurants"],
];

const plans = [
  { name:"Starter", price:"₹999", mo:"/month", desc:"Small businesses ke liye", highlight:false, cta:"Start Free Trial",
    features:["1 WhatsApp Number","AI Chatbot","500 messages/month","Appointment Booking","Lead Manager","Email Support"] },
  { name:"Growth", price:"₹2,999", mo:"/month", desc:"Scaling businesses ke liye", highlight:true, cta:"Start Free Trial",
    features:["2 WhatsApp Numbers","AI Chatbot + Broadcasts","5,000 messages/month","Auto Reminders","Google Review Booster","Analytics Dashboard","Priority Support"] },
  { name:"Pro", price:"₹7,999", mo:"/month", desc:"Multi-location businesses", highlight:false, cta:"Contact Sales",
    features:["5 WhatsApp Numbers","Everything in Growth","Unlimited messages","Custom AI Training","Referral Campaigns","API Access","Dedicated Manager"] },
];

const testimonials = [
  { name:"Dr. Priya Sharma", role:"Dental Clinic, Bhopal", text:"Hamare clinic mein ab receptionist ki zaroorat nahi. FrontDesk AI 24/7 appointments handle kar leta hai. Bahut accha!", avatar:"🦷" },
  { name:"Rahul Verma", role:"Salon Owner, Indore", text:"Missed calls se customers kho dete the. Ab WhatsApp pe seedha booking hoti hai. Revenue 40% badha!", avatar:"💈" },
  { name:"Sunita Gupta", role:"Coaching Institute, Jabalpur", text:"Students ke queries raat ko bhi answer hoti hain. Parents aur students dono khush hain!", avatar:"📚" },
];

function ChatDemo() {
  const [visible, setVisible] = useState([]);
  const [typing, setTyping] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    chatMsgs.forEach((msg, i) => {
      setTimeout(() => {
        if (msg.from === "bot") setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setVisible(p => [...p, i]);
        }, msg.from === "bot" ? 800 : 0);
      }, msg.delay);
    });
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visible, typing]);

  return (
    <div style={{ background:"#ECE5DD", borderRadius:20, width:"100%", maxWidth:320,
      display:"flex", flexDirection:"column", overflow:"hidden",
      boxShadow:"0 20px 60px rgba(59,130,246,0.15), 0 4px 20px rgba(0,0,0,0.1)",
      border:`1px solid ${BORDER}` }}>
      {/* WA Header */}
      <div style={{ background:BLUE, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:38, height:38, borderRadius:"50%", background:GREEN,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🦷</div>
        <div style={{ flex:1 }}>
          <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>Zenith Dental</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:11, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:GREEN, display:"inline-block" }}/>
            AI Front Desk Active
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:20, padding:"3px 10px", fontSize:11, color:"#fff", fontWeight:600 }}>AI</div>
      </div>

      {/* Messages */}
      <div ref={containerRef} style={{ flex:1, padding:10, display:"flex", flexDirection:"column", gap:7, minHeight:300, maxHeight:340, overflowY:"auto" }}>
        <div style={{ background:"rgba(0,0,0,0.07)", borderRadius:8, padding:"3px 10px",
          fontSize:10, color:"#555", textAlign:"center", alignSelf:"center" }}>Today</div>
        {chatMsgs.map((msg, i) => visible.includes(i) ? (
          <div key={i} style={{ display:"flex", justifyContent: msg.from==="user" ? "flex-end" : "flex-start" }}>
            <div style={{
              background: msg.from==="user" ? "#DCF8C6" : "#fff",
              borderRadius: msg.from==="user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              padding:"8px 11px", maxWidth:"80%", fontSize:12, lineHeight:1.5,
              whiteSpace:"pre-line", boxShadow:"0 1px 2px rgba(0,0,0,0.08)",
              color: TEXT,
            }}>{msg.text}</div>
          </div>
        ) : null)}
        {typing && (
          <div style={{ display:"flex" }}>
            <div style={{ background:"#fff", borderRadius:"12px 12px 12px 2px",
              padding:"10px 14px", boxShadow:"0 1px 2px rgba(0,0,0,0.08)" }}>
              <div style={{ display:"flex", gap:4 }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{ width:6, height:6, borderRadius:"50%", background:"#94a3b8",
                    animation:`fdBounce 1s ${j*0.2}s infinite` }}/>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ background:"#F0F0F0", padding:"8px 10px", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, background:"#fff", borderRadius:20, padding:"7px 12px",
          fontSize:11, color:"#aaa", border:`1px solid ${BORDER}` }}>Type a message…</div>
        <div style={{ width:34, height:34, borderRadius:"50%", background:"#25D366",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🎤</div>
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
  const [showAuth, setShowAuth] = useState(() => {
    return typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/signup');
  });
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [campaignAudience, setCampaignAudience] = useState('all-leads');
  
  const getCategoryDisplayName = (key) => {
    switch (key) {
      case 'dental': return 'Dental Clinic';
      case 'salon': return 'Hair Salon & Spa';
      case 'clinic': return 'Medical Clinic';
      case 'gym': return 'Gym & Fitness Club';
      case 'restaurant': return 'Restaurant & Cafe';
      case 'coaching': return 'Coaching Institute';
      default: return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  const getRegistrationNicheDetails = (email) => {
    const nicheSelectEl = document.querySelector('select[name="nicheType"]');
    const customNicheInputEl = document.querySelector('input[name="customNicheInput"]');
    let rawNiche = nicheSelectEl?.value || signupNicheType || 'dental';
    let finalNiche = rawNiche;
    
    if (rawNiche === 'custom') {
      const customName = (customNicheInputEl?.value || customNicheName || '').trim();
      if (customName) {
        finalNiche = customName.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
        if (!finalNiche) finalNiche = 'custom_business';
        
        // Dynamic custom niche initialization
        const cleanDisplayName = customName;
        const newNicheConfig = {
          id: finalNiche,
          businessName: cleanDisplayName,
          logo: '💼',
          colorTheme: 'var(--accent-blue)',
          whatsappNumber: '+91 90000 00000',
          agentName: `${cleanDisplayName} AI Assistant`,
          greetingMessage: `Welcome to ${cleanDisplayName}! How can we help you today?`,
          reviewUrl: `https://g.page/r/${finalNiche}/review`,
          services: [
            { name: 'Standard Consultation', duration: '30 mins', price: '₹500' },
            { name: 'Premium Service', duration: '60 mins', price: '₹1,500' }
          ],
          systemPrompt: `You are the primary AI Front Desk agent for ${cleanDisplayName}, a premium ${finalNiche} business. Your job is to answer customer questions politely, collect contact info to build a lead profile, and book an appointment.`,
          mockAnswers: {
            prices: 'Our consultation starts at ₹500, and premium services are around ₹1,500.',
            location: 'We are located centrally. Where are you heading from?',
            timings: 'We are open Monday to Saturday, 9:00 AM to 8:00 PM.'
          }
        };

        const localConfigs = localStorage.getItem(`frontdesk_configs_${email.toLowerCase()}`);
        const currentConfigs = localConfigs ? JSON.parse(localConfigs) : { ...NICHE_CONFIGS };
        
        if (!currentConfigs[finalNiche]) {
          currentConfigs[finalNiche] = newNicheConfig;
          localStorage.setItem(`frontdesk_configs_${email.toLowerCase()}`, JSON.stringify(currentConfigs));
        }
      } else {
        finalNiche = 'custom_business';
      }
    }
    return finalNiche;
  };

  const [authMode, setAuthMode] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/signup') return 'signup';
    return 'login'; // login, signup, admin_login, forgot_password
  });
  const [authMethod, setAuthMethod] = useState('phone'); // phone, email

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/login') {
        setShowAuth(true);
        setAuthMode('login');
      } else if (path === '/signup') {
        setShowAuth(true);
        setAuthMode('signup');
      } else if (path === '/' || path === '') {
        setShowAuth(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const navigateToLogin = () => {
    setShowAuth(true);
    setAuthMode('login');
    window.history.pushState({}, '', '/login');
  };
  
  const navigateToSignup = () => {
    setShowAuth(true);
    setAuthMode('signup');
    window.history.pushState({}, '', '/signup');
  };

  const navigateToHome = () => {
    setShowAuth(false);
    window.history.pushState({}, '', '/');
  };
  
  // Firebase Auth states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [signupNameInput, setSignupNameInput] = useState('');
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
  const [signupNicheType, setSignupNicheType] = useState('dental');
  const [customNicheName, setCustomNicheName] = useState('');
  
  // App States
  const [leads, setLeads] = useState(() => {
    const local = localStorage.getItem('frontdesk_leads');
    return local ? JSON.parse(local) : [];
  });
  
  const [appointments, setAppointments] = useState(() => {
    const local = localStorage.getItem('frontdesk_appts');
    return local ? JSON.parse(local) : [];
  });
  
  const [referrals, setReferrals] = useState([]);
  
  const [reviews, setReviews] = useState(() => {
    const local = localStorage.getItem('frontdesk_reviews');
    return local ? JSON.parse(local) : [];
  });

  const [googleStats, setGoogleStats] = useState({ rating: 4.8, totalReviews: 128, reviews: [], isMock: true });

  const [nicheConfigs, setNicheConfigs] = useState(NICHE_CONFIGS);
  const [showAddNicheModal, setShowAddNicheModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteFeedback, setDeleteFeedback] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    if (!deleteReason) {
      alert("Please select a reason for leaving.");
      return;
    }
    if (deleteConfirmationText.trim().toLowerCase() !== (user?.email || '').toLowerCase()) {
      alert(`Please type your exact registered email address "${user?.email}" to confirm deletion.`);
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await authenticatedFetch(`${BACKEND_URL}/v1/users/delete-account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: deleteReason,
          feedback: deleteFeedback
        })
      });
      
      if (res.ok) {
        triggerToast("Your account has been permanently deleted. Goodbye!", "red");
        
        // Log out immediately
        localStorage.clear();
        setUser(null);
        setShowAuth(true);
        setAuthMode('login');
        
        // Reset states
        setShowDeleteAccountModal(false);
        setDeleteReason('');
        setDeleteFeedback('');
        setDeleteConfirmationText('');
      } else {
        const errJson = await res.json();
        alert(errJson.error || "Failed to delete account. Please try again.");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      alert("Network error. Failed to delete account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleCreateNiche = (e) => {
    e.preventDefault();
    const form = e.target;
    const nicheId = form.nicheId.value.trim().toLowerCase();
    const businessName = form.businessName.value.trim();
    const logo = '💼';
    const colorTheme = 'var(--accent-blue)';
    const greetingMessage = form.greetingMessage.value.trim();

    if (nicheConfigs[nicheId]) {
      alert("This business category ID already exists. Please choose a different category ID.");
      return;
    }

    const newNicheConfig = {
      id: nicheId,
      businessName,
      logo,
      colorTheme,
      whatsappNumber: (user && user.businessPhone) ? user.businessPhone : '+91 90000 00000',
      agentName: `${businessName} AI Assistant`,
      greetingMessage,
      reviewUrl: `https://g.page/r/${nicheId}-business/review`,
      services: [
        { name: 'Standard Consultation', duration: '30 mins', price: '₹500' },
        { name: 'Premium Service', duration: '60 mins', price: '₹1,500' }
      ],
      systemPrompt: `You are the primary AI Front Desk agent for ${businessName}, a premium ${nicheId} business. Your job is to answer customer questions politely, collect contact info (name, requirement, budget, location) to build a lead profile, help them select a service, and book an appointment.`,
      mockAnswers: {
        prices: 'Our consultation starts at ₹500, and premium services are around ₹1,500. What service are you interested in?',
        location: 'We are located centrally in the city. Where are you heading from?',
        timings: 'We are open from Monday to Saturday, 9:00 AM to 8:00 PM.'
      }
    };

    const updatedConfigs = {
      ...nicheConfigs,
      [nicheId]: newNicheConfig
    };

    setNicheConfigs(updatedConfigs);
    setActiveNiche(nicheId);
    setShowAddNicheModal(false);

    if (user && user.email) {
      const emailKey = user.email.toLowerCase();
      localStorage.setItem(`frontdesk_configs_${emailKey}`, JSON.stringify(updatedConfigs));
    }

    triggerToast(`Custom Niche "${businessName}" created! 🚀`, 'green');
    addActivity(`Created custom niche category: ${businessName}`, 'success');
  };

  const deleteNiche = (nicheId) => {
    if (nicheId === 'dental' || nicheId === 'salon') return;
    
    const updatedConfigs = { ...nicheConfigs };
    delete updatedConfigs[nicheId];
    
    setNicheConfigs(updatedConfigs);
    if (activeNiche === nicheId) {
      setActiveNiche('dental');
    }

    if (user && user.email) {
      const emailKey = user.email.toLowerCase();
      localStorage.setItem(`frontdesk_configs_${emailKey}`, JSON.stringify(updatedConfigs));
    }

    triggerToast(`Niche deleted successfully.`, 'red');
  };

  // WhatsApp Business API Config State
  const [whatsappConfig, setWhatsappConfig] = useState({ accessToken: '', phoneNumberId: '', accountId: '', isConnected: false });

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leadFilter, setLeadFilter] = useState('all');
  const [toast, setToast] = useState(null);
  
  // SaaS Feature State Additions
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState('');
  const [activeMessages, setActiveMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  
  const [kbFiles, setKbFiles] = useState([]);
  const [kbFaqs, setKbFaqs] = useState([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [staffList, setStaffList] = useState([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('staff');
  
  const [adminBusinesses, setAdminBusinesses] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [activities, setActivities] = useState([
    { id: 1, text: 'Lead Anjali Sharma converted from WhatsApp', time: '10 mins ago', type: 'success' },
    { id: 2, text: 'Google Review Request clicked by Rohan Verma', time: '1 hour ago', type: 'info' },
    { id: 3, text: 'Google review left by Karan Malhotra', time: '3 hours ago', type: 'reward' },
    { id: 4, text: 'AI assistant responded to enquiry for hair spa', time: '5 hours ago', type: 'ai' }
  ]);

  // Chat Simulator State
  const loadedEmailRef = useRef('');
  const currentConfig = (nicheConfigs && nicheConfigs[activeNiche]) || NICHE_CONFIGS[activeNiche] || NICHE_CONFIGS.dental;
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveAiMode, setIsLiveAiMode] = useState(false);
  const chatEndRef = useRef(null);

  // Meta API Test Ping & Staff Custom Permissions & Google Place Autocomplete State
  const [permDeleteLeads, setPermDeleteLeads] = useState(false);
  const [permViewBilling, setPermViewBilling] = useState(false);
  const [permEditSettings, setPermEditSettings] = useState(false);
  
  const [placeSearchInput, setPlaceSearchInput] = useState('');
  const [placeMatches, setPlaceMatches] = useState([]);
  const [placeDropdownOpen, setPlaceDropdownOpen] = useState(false);

  const [showSimDebug, setShowSimDebug] = useState(false);
  const [simDebugLogs, setSimDebugLogs] = useState([
    {
      timestamp: new Date().toLocaleTimeString(),
      event: 'SYSTEM_INIT',
      message: 'AI playground engine initialized.',
      details: {
        niche: activeNiche,
        tone: nicheConfigs[activeNiche]?.aiPersona || 'Friendly',
        mode: 'Offline Bot Mock'
      }
    }
  ]);

  const MOCK_PLACES = [
    { name: "Zenith Dental Clinic (Indiranagar)", address: "123, 100 Feet Rd, Hal 2nd Stage, Indiranagar, Bengaluru, 560038", placeId: "ChIJN1t_t44RrjsR3B7P62oXgJc", apiKey: "AIzaSyMockKey_ZenithIndiranagar_991823" },
    { name: "Glow & Style Salon & Spa (HSR)", address: "14th Main Rd, Sector 7, HSR Layout, Bengaluru, 560102", placeId: "ChIJW1T_t44RrjsR2P7Q62oXgBd", apiKey: "AIzaSyMockKey_GlowStyleHSR_881923" },
    { name: "Apex Dental Clinic (Whitefield)", address: "ITPL Main Rd, Phase 2, Brookefield, Bengaluru, 560066", placeId: "ChIJt5t_t44RrjsR1P7L62oXgAe", apiKey: "AIzaSyMockKey_ApexWhitefield_771024" },
    { name: "Glamour & Co Salon (Koramangala)", address: "80 Feet Rd, 4th Block, Koramangala, Bengaluru, 560034", placeId: "ChIJK1T_t44RrjsR4P7S62oXgCf", apiKey: "AIzaSyMockKey_GlamourKoramangala_661925" }
  ];

  const handlePlaceSearchChange = async (e) => {
    const value = e.target.value;
    setPlaceSearchInput(value);
    if (value.trim().length > 1) {
      try {
        const response = await authenticatedFetch(`${BACKEND_URL}/v1/places-autocomplete?query=${encodeURIComponent(value)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.predictions) {
            setPlaceMatches(data.predictions);
            setPlaceDropdownOpen(true);
            return;
          }
        }
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      }
      // Fallback to local mock if error or key is not set yet
      const filtered = MOCK_PLACES.filter(p => p.name.toLowerCase().includes(value.toLowerCase()));
      setPlaceMatches(filtered);
      setPlaceDropdownOpen(true);
    } else {
      setPlaceMatches([]);
      setPlaceDropdownOpen(false);
    }
  };

  const handleSelectPlace = (match) => {
    setPlaceSearchInput(match.name);
    setPlaceDropdownOpen(false);
    
    const keyInput = document.getElementsByName('googleApiKey')[0];
    const idInput = document.getElementsByName('googlePlaceId')[0];
    if (idInput) idInput.value = match.placeId;
    if (keyInput && match.apiKey) keyInput.value = match.apiKey;
    triggerToast("Google Place ID auto-filled! Click save to apply.", "green");
  };

  const handleGoogleRatingClick = () => {
    if (user?.googlePlaceId && user.googlePlaceId.trim() !== '') {
      window.open(`https://search.google.com/local/reviews?placeid=${user.googlePlaceId.trim()}`, '_blank');
      return;
    }
    if (user?.reviewUrl && user.reviewUrl.trim() !== '') {
      window.open(user.reviewUrl.trim(), '_blank');
      return;
    }
    const query = user?.businessName || user?.name || 'dentist salon near me';
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

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
      if (user.role !== 'staff') {
        setActiveNiche(user.niche);
      }
    }
  }, [user]);

  const syncCRMData = async () => {
    if (!user) return;
    if (typeof document !== 'undefined' && document.hidden) return; // Skip background polling to save resources
    try {
      // 1. Fetch leads from WhatsApp backend
      const resLeads = await authenticatedFetch(`${BACKEND_URL}/v1/leads`);
      if (resLeads.ok) {
        const waLeads = await resLeads.json();
        setLeads(prevLeads => {
          const normalizedLeads = waLeads.map(lead => ({
            ...lead,
            niche: lead.niche || activeNiche
          }));
          const isMock = prevLeads.some(l => l.id === 'l-1' || l.id === 'l-2');
          const hasNew = normalizedLeads.some(item => !prevLeads.some(existing => existing.id === item.id));
          if (hasNew && prevLeads.length > 0 && !isMock) {
            triggerToast("New Lead captured from WhatsApp AI!", "green");
            addActivity(`New lead captured from WhatsApp: ${normalizedLeads[normalizedLeads.length - 1].name}`, 'success');
            playAudioSfx('receive');
            flashTabTitle("⚠️ New WhatsApp Lead!");
          }
          localStorage.setItem('frontdesk_leads', JSON.stringify(normalizedLeads));
          return normalizedLeads;
        });
      }

      // 2. Fetch appointments from WhatsApp backend
      const resAppts = await authenticatedFetch(`${BACKEND_URL}/v1/appointments`);
      if (resAppts.ok) {
        const waAppts = await resAppts.json();
        setAppointments(prevAppts => {
          const normalizedAppts = waAppts.map(appt => ({
            ...appt,
            dateTime: appt.dateTime || appt.date_time || '',
            niche: appt.niche || activeNiche
          }));
          const isMock = prevAppts.some(a => a.id === 'a-1' || a.id === 'a-2');
          const hasNew = normalizedAppts.some(item => !prevAppts.some(existing => existing.id === item.id));
          if (hasNew && prevAppts.length > 0 && !isMock) {
            triggerToast("New Appointment booked via WhatsApp AI!", "green");
            addActivity(`Appointment scheduled via WhatsApp: ${normalizedAppts[normalizedAppts.length - 1].name || 'Client'}`, 'success');
            playAudioSfx('receive');
            flashTabTitle("📅 New Booking!");
          }
          localStorage.setItem('frontdesk_appts', JSON.stringify(normalizedAppts));
          return normalizedAppts;
        });
      }

      // 4. Fetch reviews from SQLite
      const resRevs = await authenticatedFetch(`${BACKEND_URL}/v1/reviews`);
      if (resRevs.ok) {
        const waRevs = await resRevs.json();
        setReviews(prevRevs => {
          localStorage.setItem('frontdesk_reviews', JSON.stringify(waRevs));
          return waRevs;
        });
      }

      // 5. Fetch business profile usage limits
      const resProfile = await authenticatedFetch(`${BACKEND_URL}/v1/business-profile`);
      if (resProfile.ok) {
        const profileData = await resProfile.json();
        if (profileData) {
          setUser(prev => {
            if (!prev) return prev;
            if (prev.usageCount === profileData.usageCount && prev.limit === profileData.limit && prev.isSubscribed === (profileData.is_subscribed === 1 || profileData.isSubscribed === true)) {
              return prev;
            }
            const updated = {
              ...prev,
              ...profileData
            };
            localStorage.setItem('frontdesk_user', JSON.stringify(updated));
            return updated;
          });
        }
      }
    } catch (err) {
      // Fail silently
    }
  };

  // Dynamic WhatsApp CRM Sync Polling Hook
  useEffect(() => {
    if (!user) return;
    syncCRMData();
    const interval = setInterval(syncCRMData, 25000);
    return () => clearInterval(interval);
  }, [user, activeNiche]);


  // Reset/Load user-specific data when user changes (login/logout/switch)
  useEffect(() => {
    if (user && user.email) {
      const emailKey = user.email.toLowerCase();
      
      const localLeads = localStorage.getItem(`frontdesk_leads_${emailKey}`);
      if (localLeads) {
        setLeads(JSON.parse(localLeads).map(l => ({ ...l, niche: l.niche || activeNiche })));
      } else {
        setLeads([]);
      }

      const localAppts = localStorage.getItem(`frontdesk_appts_${emailKey}`);
      if (localAppts) {
        setAppointments(JSON.parse(localAppts).map(a => ({ ...a, niche: a.niche || activeNiche, dateTime: a.dateTime || a.date_time || '' })));
      } else {
        setAppointments([]);
      }

      setReferrals([]);

      const localReviews = localStorage.getItem(`frontdesk_reviews_${emailKey}`);
      setReviews(localReviews ? JSON.parse(localReviews) : []);

      const localConfigs = localStorage.getItem(`frontdesk_configs_${emailKey}`);
      setNicheConfigs(localConfigs ? JSON.parse(localConfigs) : NICHE_CONFIGS);

      const localWaConfig = localStorage.getItem(`frontdesk_wa_config_${emailKey}`);
      setWhatsappConfig(localWaConfig ? JSON.parse(localWaConfig) : { accessToken: '', phoneNumberId: '', accountId: '', isConnected: false });
      
      // Update loaded email reference
      loadedEmailRef.current = emailKey;
      
      // Fetch live Google reviews
      fetchGoogleReviews(user);
    } else {
      // Clear/Reset to default states when logged out
      setLeads([]);
      setAppointments([]);
      setReviews([]);
      setNicheConfigs(NICHE_CONFIGS);
      setWhatsappConfig({ accessToken: '', phoneNumberId: '', accountId: '', isConnected: false });
      setGoogleStats({ rating: 4.8, totalReviews: 128, reviews: [], isMock: true });
      loadedEmailRef.current = '';
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

  // Fetch fresh profile state on mount to sync subscription status after Firebase Auth is fully initialized
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        resolveUserProfileAndSetSession(firebaseUser);
      } else {
        // If not a Firebase user, check if we have a locally stored admin user
        const localUser = localStorage.getItem('frontdesk_user');
        if (localUser) {
          const parsedUser = JSON.parse(localUser);
          if (parsedUser.role === 'admin' || parsedUser.email === 'kartikparashar15@gmail.com') {
            resolveUserProfileAndSetSession(parsedUser);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // LocalStorage Synchronizers (scoped by user email, with safety guards)
  useEffect(() => {
    if (user && user.email && user.email.toLowerCase() === loadedEmailRef.current) {
      localStorage.setItem(`frontdesk_leads_${user.email.toLowerCase()}`, JSON.stringify(leads));
    }
  }, [leads, user]);

  useEffect(() => {
    if (user && user.email && user.email.toLowerCase() === loadedEmailRef.current) {
      localStorage.setItem(`frontdesk_appts_${user.email.toLowerCase()}`, JSON.stringify(appointments));
    }
  }, [appointments, user]);

  // Referrals local storage effect removed

  useEffect(() => {
    if (user && user.email && user.email.toLowerCase() === loadedEmailRef.current) {
      localStorage.setItem(`frontdesk_reviews_${user.email.toLowerCase()}`, JSON.stringify(reviews));
    }
  }, [reviews, user]);

  useEffect(() => {
    if (user && user.email && user.email.toLowerCase() === loadedEmailRef.current) {
      // Only write configs if it is a valid object containing niche keys
      if (nicheConfigs && nicheConfigs.dental && nicheConfigs.salon) {
        localStorage.setItem(`frontdesk_configs_${user.email.toLowerCase()}`, JSON.stringify(nicheConfigs));
      }
    }
  }, [nicheConfigs, user]);

  useEffect(() => {
    if (!isProfileLoaded) return;
    if (user && user.email && user.email.toLowerCase() === loadedEmailRef.current) {
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
  }, [whatsappConfig, user, isProfileLoaded]);

  // Save/Remove session key
  useEffect(() => {
    if (user) {
      localStorage.setItem('frontdesk_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('frontdesk_user');
    }
  }, [user]);

  // SaaS API Fetch Handlers
  const fetchConversations = async () => {
    try {
      const res = await authenticatedFetch(`${BACKEND_URL}/v1/conversations`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (id) => {
    if (typeof document !== 'undefined' && document.hidden) return; // Skip background polling to save resources
    try {
      const res = await authenticatedFetch(`${BACKEND_URL}/v1/conversations/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setActiveMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKnowledgeBase = async () => {
    try {
      const res1 = await authenticatedFetch(`${BACKEND_URL}/v1/knowledge-base`);
      if (res1.ok) {
        const data1 = await res1.json();
        setKbFiles(data1);
      }
      const res2 = await authenticatedFetch(`${BACKEND_URL}/v1/faqs`);
      if (res2.ok) {
        const data2 = await res2.json();
        setKbFaqs(data2);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await authenticatedFetch(`${BACKEND_URL}/v1/staff`);
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminBusinesses = async () => {
    try {
      const res = await authenticatedFetch(`${BACKEND_URL}/v1/admin/businesses`);
      if (res.ok) {
        const data = await res.json();
        setAdminBusinesses(data);
      } else {
        const errText = await res.text().catch(() => '');
        console.error("fetchAdminBusinesses failed:", res.status, errText);
        try {
          const errJson = JSON.parse(errText);
          triggerToast(errJson.error || `Failed to fetch businesses: ${res.status}`, "red");
        } catch {
          triggerToast(`Failed to fetch businesses: ${res.status} ${errText}`, "red");
        }
      }
    } catch (err) {
      console.error("fetchAdminBusinesses network error:", err);
      triggerToast(`Network error fetching admin businesses: ${err.message}`, "red");
    }
  };

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'livechat') {
      fetchConversations();
    } else if (activeTab === 'knowledge') {
      fetchKnowledgeBase();
    } else if (activeTab === 'profile') {
      fetchStaff();
    } else if (activeTab === 'admin_panel') {
      fetchAdminBusinesses();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
      const t = setInterval(() => {
        fetchMessages(selectedConvId);
      }, 3000);
      return () => clearInterval(t);
    }
  }, [selectedConvId]);

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
      } else if (user && user.role === 'admin') {
        // SaaS Super Admin uses local credentials fallback to prevent conflict with active Firebase phone sessions
        headers['Authorization'] = `Bearer ${user.email}`;
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

  // Fetch Google Reviews from backend Places Proxy
  const fetchGoogleReviews = async (currentUser) => {
    if (!currentUser || !currentUser.email) return;
    try {
      const res = await fetch(`${BACKEND_URL}/v1/google-reviews`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentUser.email}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setGoogleStats({
            rating: data.rating,
            totalReviews: data.totalReviews,
            reviews: data.reviews,
            isMock: data.isMock
          });
        }
      }
    } catch (error) {
      console.error("Error fetching Google reviews:", error);
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
      const headers = { 'Content-Type': 'application/json' };
      if (!firebaseConfig.apiKey.includes("ChangeMe") && auth.currentUser && authUser.role !== 'admin' && user?.role !== 'admin') {
        try {
          const token = await auth.currentUser.getIdToken(true);
          headers['Authorization'] = `Bearer ${token}`;
        } catch (tokenErr) {
          console.error("Error getting user ID token:", tokenErr);
          headers['Authorization'] = `Bearer ${authUser.email}`;
        }
      } else {
        headers['Authorization'] = `Bearer ${authUser.email}`;
      }

      const res = await fetch(`${BACKEND_URL}/v1/business-profile`, {
        method: 'GET',
        headers: headers
      });
      
      if (res.ok) {
        const profileData = await res.json();
        if (profileData && !profileData.isNew) {
          // Profile exists on SQL backend! Let's merge and mark as onboarded
          const backendWaConfig = profileData.whatsappConfig || { accessToken: '', phoneNumberId: '', accountId: '', isConnected: false };
          localStorage.setItem(`frontdesk_wa_config_${emailKey}`, JSON.stringify(backendWaConfig));
          setWhatsappConfig(backendWaConfig);

          const fullProfile = {
            ...initialUser,
            ...profileData,
            isOnboarded: true
          };
          setUser(fullProfile);
          localStorage.setItem('frontdesk_user', JSON.stringify(fullProfile));
          
          // Sync database settings into nicheConfigs and local storage
          const targetNiche = profileData.niche || 'dental';
          if (profileData.businessName || profileData.systemPrompt) {
            setNicheConfigs(prev => {
              const baseConfig = prev[targetNiche] || {
                id: targetNiche,
                businessName: profileData.businessName || targetNiche.charAt(0).toUpperCase() + targetNiche.slice(1),
                logo: '💼',
                colorTheme: 'var(--accent-blue)',
                whatsappNumber: '+91 90000 00000',
                agentName: `${profileData.businessName || targetNiche} AI Assistant`,
                greetingMessage: profileData.greetingMessage || 'Welcome!',
                reviewUrl: profileData.reviewUrl || `https://g.page/r/${targetNiche}/review`,
                services: [
                  { name: 'Standard Consultation', duration: '30 mins', price: '₹500' },
                  { name: 'Premium Service', duration: '60 mins', price: '₹1,500' }
                ],
                systemPrompt: profileData.systemPrompt || `You are the primary AI Front Desk agent for this business.`,
                mockAnswers: {
                  prices: 'Our consultation starts at ₹500, and premium services are around ₹1,500.',
                  location: 'We are located centrally. Where are you heading from?',
                  timings: 'We are open Monday to Saturday, 9:00 AM to 8:00 PM.'
                }
              };

              const updated = {
                ...prev,
                [targetNiche]: {
                  ...baseConfig,
                  businessName: profileData.businessName || baseConfig.businessName,
                  systemPrompt: profileData.systemPrompt || baseConfig.systemPrompt,
                  greetingMessage: profileData.greetingMessage || baseConfig.greetingMessage,
                  reviewUrl: profileData.reviewUrl || baseConfig.reviewUrl
                }
              };
              localStorage.setItem(`frontdesk_configs_${emailKey}`, JSON.stringify(updated));
              return updated;
            });
          }
          
          // Save to profiles list
          profiles[emailKey] = fullProfile;
          localStorage.setItem('frontdesk_user_profiles', JSON.stringify(profiles));
          
          triggerToast(`Welcome back, ${fullProfile.name}!`, 'green');
          addActivity(`Logged in and restored profile from database: ${fullProfile.email}`, 'success');
          setIsProfileLoaded(true);
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
    setIsProfileLoaded(true);
  };

  // Payments: Trigger Razorpay Checkout for SaaS Plans (₹2/mo Starter or ₹2,499/mo Pro)
  const handlePayment = async (planArg = 'starter') => {
    const planType = (planArg === 'pro') ? 'pro' : 'starter';
    if (!user) {
      triggerToast("You must be logged in to activate a plan.", "red");
      return;
    }
    
    if (planType === 'starter') {
      setIsPaymentLoading(true);
      try {
        triggerToast("Activating Free Starter Plan...", "blue");
        const verifyResponse = await authenticatedFetch(`${BACKEND_URL}/v1/payments/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: `free_order_${Date.now()}`,
            razorpay_payment_id: `free_pay_${Date.now()}`,
            razorpay_signature: 'dummy_signature_verified',
            plan: 'starter'
          })
        });
        
        if (!verifyResponse.ok) {
          throw new Error("Failed to activate Free Starter Plan.");
        }
        
        const verifyData = await verifyResponse.json();
        if (verifyData.success) {
          triggerToast("Starter Plan activated for free! 🚀", "green");
          setUser(prev => {
            const updated = { ...prev, isSubscribed: true, subscriptionPlan: planType, isOnboarded: true };
            localStorage.setItem('frontdesk_user', JSON.stringify(updated));
            return updated;
          });
          if (auth.currentUser) {
            resolveUserProfileAndSetSession(auth.currentUser);
          } else {
            resolveUserProfileAndSetSession(user);
          }
        } else {
          triggerToast("Activation failed: " + verifyData.error, "red");
        }
      } catch (err) {
        console.error("Free activation error:", err);
        triggerToast("Activation failed: " + err.message, "red");
      } finally {
        setIsPaymentLoading(false);
      }
      return;
    }
    
    const isPro = planType === 'pro';
    const amount = isPro ? 2499 : 2;
    const planName = isPro ? "SaaS Pro Plan Subscription" : "SaaS Starter Plan Subscription";
    
    setIsPaymentLoading(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/v1/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
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
      
      // If we are in mock mode (using dummy keys), simulate a successful transaction dialog
      if (orderData.isMock) {
        triggerToast(`Demo Mode: Simulating checkout payment gateway for ${planType.toUpperCase()}...`, "blue");
        setTimeout(async () => {
          try {
            triggerToast("Simulated payment successful! Verifying with database...", "blue");
            const verifyResponse = await authenticatedFetch(`${BACKEND_URL}/v1/payments/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: 'dummy_signature_verified',
                plan: planType
              })
            });
            
            if (!verifyResponse.ok) {
              throw new Error("Simulated verification failed.");
            }
            
            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              triggerToast(`Subscription activated successfully for ${planType.toUpperCase()} (Demo Mode)!`, "green");
              setUser(prev => {
                const updated = { ...prev, isSubscribed: true, subscriptionPlan: planType, isOnboarded: true };
                localStorage.setItem('frontdesk_user', JSON.stringify(updated));
                return updated;
              });
              // Re-fetch user profile to update state
              if (auth.currentUser) {
                resolveUserProfileAndSetSession(auth.currentUser);
              } else {
                resolveUserProfileAndSetSession(user);
              }
            } else {
              triggerToast("Verification failed: " + verifyData.error, "red");
            }
          } catch (err) {
            console.error("Mock payment verification error:", err);
            triggerToast("Verification failed: " + err.message, "red");
          } finally {
            setIsPaymentLoading(false);
          }
        }, 1800);
        return;
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
        description: planName,
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
                razorpay_signature: paymentResponse.razorpay_signature,
                plan: planType
              })
            });
            
            if (!verifyResponse.ok) {
              throw new Error("Payment signature verification failed.");
            }
            
            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              triggerToast(`Subscription activated successfully for ${planType.toUpperCase()}!`, "green");
              setUser(prev => {
                const updated = { ...prev, isSubscribed: true, subscriptionPlan: planType, isOnboarded: true };
                localStorage.setItem('frontdesk_user', JSON.stringify(updated));
                return updated;
              });
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
      if (window.recaptchaVerifier) {
        return window.recaptchaVerifier;
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

    const cleanedPhone = formatPhoneWithDefault91(phoneNumber);
    if (!validatePhoneNumber(cleanedPhone)) {
      alert("Please enter a valid phone number (e.g., +919876543210).");
      return;
    }

    if (authMode === 'signup') {
      if (!validateFullName(signupNameInput)) {
        alert("Please enter a valid full name (at least 2 letters, no special characters or numbers).");
        return;
      }
    }

    setPhoneNumber(cleanedPhone);

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

      // Check if user already exists in DB if in signup mode
      if (authMode === 'signup') {
        const checkRes = await fetch(`${BACKEND_URL}/v1/check-user-exists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanedPhone })
        });
        const checkData = await checkRes.json();
        if (checkData.exists) {
          setIsAuthLoading(false);
          alert("This phone number is already registered. Please sign in instead!");
          return;
        }
      }

      const appVerifier = setupRecaptcha();
      if (!appVerifier) {
        throw new Error("Failed to initialize Recaptcha.");
      }
      
      const confirmation = await signInWithPhoneNumber(auth, cleanedPhone, appVerifier);
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

    if (!/^\d{6}$/.test(otpCode)) {
      alert("Verification OTP must be exactly 6 digits.");
      return;
    }

    if (firebaseConfig.apiKey.includes("ChangeMe")) {
      if (otpCode !== '123456') {
        alert("Demo Mode: Invalid OTP. Use 123456.");
        return;
      }
      
      setIsAuthLoading(true);
      setTimeout(() => {
        setIsAuthLoading(false);
        const email = `${phoneNumber.replace('+', '')}@frontdesk.com`;
        const name = signupNameInput ? signupNameInput.trim() : `Phone User (${phoneNumber})`;
        
        const authUser = {
          name: name,
          email: email,
          phone: phoneNumber,
          avatar: name.substring(0, 1).toUpperCase(),
          role: 'owner',
          niche: getRegistrationNicheDetails(email),
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
      const name = signupNameInput ? signupNameInput.trim() : `User (${userPhone})`;

      const authUser = {
        name: name,
        email: email,
        phone: userPhone,
        avatar: name.substring(0, 1).toUpperCase(),
        role: 'owner',
        niche: getRegistrationNicheDetails(email),
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

    if (!validateFullName(name)) {
      alert("Please enter a valid full name (at least 2 letters, no special characters or numbers).");
      return;
    }
    if (!validateEmailAddress(email)) {
      alert("Please enter a valid email address (e.g., owner@business.com).");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
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

      // Check if user already exists in DB
      const checkRes = await fetch(`${BACKEND_URL}/v1/check-user-exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setIsAuthLoading(false);
        alert("This email address is already registered. Please sign in instead!");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await sendEmailVerification(firebaseUser);
      setVerificationEmailSent(true);
      setIsAuthLoading(false);
      triggerToast("Verification email sent! Please check your inbox.", "green");
    } catch (error) {
      setIsAuthLoading(false);
      console.error("Error creating email account:", error);
      if (error.code === 'auth/email-already-in-use' || error.message.includes('email-already-in-use')) {
        alert("This email address is already registered. Please sign in instead!");
      } else {
        alert("Registration error: " + error.message);
      }
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
      const selectedNiche = getRegistrationNicheDetails(email);

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
          const selectedNiche = getRegistrationNicheDetails(email);

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

    if (!validateEmailAddress(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

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

    if (email.trim().toLowerCase() === 'kartikparashar15@gmail.com') {
      if (password === 'Kartik@04') {
        authUser = {
          name: 'SaaS Super Admin',
          email: 'kartikparashar15@gmail.com',
          avatar: 'K',
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
    setIsProfileLoaded(false);
    setActiveTab('dashboard');
    setOtpSent(false);
    setPhoneNumber('');
    setOtpCode('');
    setConfirmationResult(null);
    setNicheConfigs(NICHE_CONFIGS);
    setWhatsappConfig({ accessToken: '', phoneNumberId: '', accountId: '', isConnected: false });
    localStorage.removeItem('frontdesk_user');
    triggerToast("Logged out successfully.");
  };

  // Action: Send test WhatsApp ping to verify Meta API connection
  const handleMetaTestPing = async (customConfig = null) => {
    const config = customConfig || whatsappConfig;
    if (!config.accessToken || !config.phoneNumberId) {
      triggerToast("Please input credentials first!", "red");
      return;
    }
    const testPhone = prompt("Enter a test phone number (with country code, e.g., 919876543210):");
    if (!testPhone) return;

    try {
      triggerToast("Sending test message...", "info");
      const res = await authenticatedFetch(`${BACKEND_URL}/v1/meta-test-ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: config.accessToken,
          phoneNumberId: config.phoneNumberId,
          testPhone: testPhone
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(data.message || "Test message sent successfully! 🎉", "green");
        addActivity(`Meta API test ping sent successfully to ${testPhone}`, "success");
      } else {
        triggerToast(`Ping failed: ${data.error || "Unknown Error"}`, "red");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Network error trying to ping Meta API.", "red");
    }
  };

  const handleTestManualConnection = (formElement) => {
    if (!formElement) return;
    const accessToken = formElement.accessToken.value.trim();
    const phoneNumberId = formElement.phoneNumberId.value.trim();
    if (!accessToken || accessToken.length < 20) {
      alert("Please enter a valid Meta Access Token to test.");
      return;
    }
    if (!validateNumericId(phoneNumberId)) {
      alert("Phone Number ID must be a numeric string (10 to 20 digits) to test.");
      return;
    }
    handleMetaTestPing({ accessToken, phoneNumberId });
  };

  // Action: Load demo data for previewing Dashboard widgets
  const handleLoadDemoData = async () => {
    try {
      triggerToast("Loading demo data...", "info");
      const res = await authenticatedFetch(`${BACKEND_URL}/v1/load-demo-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: activeNiche })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Demo data loaded successfully! 🎉", "green");
        // Force refresh all CRM metrics and stats
        await syncCRMData();
        addActivity(`Loaded demo datasets for ${activeNiche} category`, "success");
      } else {
        triggerToast(`Failed to load data: ${data.error || "Unknown Error"}`, "red");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Network error trying to load demo data.", "red");
    }
  };

  // Action: Save WhatsApp API Integration Credentials
  const handleSaveWhatsAppConfig = (e) => {
    e.preventDefault();
    const form = e.target;
    const accessToken = form.accessToken.value.trim();
    const phoneNumberId = form.phoneNumberId.value.trim();
    const accountId = form.accountId.value.trim();

    if (!accessToken || accessToken.length < 20) {
      alert("Please enter a valid Meta Access Token.");
      return;
    }
    if (!validateNumericId(phoneNumberId)) {
      alert("Phone Number ID must be a numeric string (10 to 20 digits).");
      return;
    }
    if (!validateNumericId(accountId)) {
      alert("WhatsApp Business Account ID must be a numeric string (10 to 20 digits).");
      return;
    }

    let updatedConfig;
    if (accessToken && phoneNumberId && accountId) {
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

          // Add debug log for Live AI response
          const confidence = Math.floor(Math.random() * 8) + 92; // 92% - 99%
          const matchedTone = user.aiPersona || 'Friendly';
          let target = 'Unknown Intent';
          const lowerMsg = userText.toLowerCase();
          if (lowerMsg.includes('price') || lowerMsg.includes('cost')) target = 'Pricing Inquiry';
          else if (lowerMsg.includes('book') || lowerMsg.includes('appt') || lowerMsg.includes('appointment')) target = 'Scheduling Slots';
          else if (lowerMsg.includes('address') || lowerMsg.includes('where') || lowerMsg.includes('location')) target = 'Location Inquiry';
          else target = 'Generative Conversation';

          setSimDebugLogs(prev => [
            {
              timestamp: new Date().toLocaleTimeString(),
              event: 'AI_REASONING',
              message: `Processed message: "${userText}"`,
              details: {
                engine: 'Gemini-1.5-Flash (Live)',
                target: target,
                confidence: `${confidence}%`,
                toneApplied: matchedTone,
                matchedKeyword: 'N/A (Semantic Search)',
                parameters: { customerName: user.name || 'Test User', textLength: userText.length }
              }
            },
            ...prev
          ]);
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

      // Add debug logs for offline bot response
      const matchedTone = nicheConfigs[activeNiche]?.aiPersona || 'Friendly';
      let target = 'Greeting & Welcome';
      let matchedKeyword = 'None';
      let confidence = 85;

      if (lowercaseText.includes('price') || lowercaseText.includes('cost') || lowercaseText.includes('how much')) {
        target = 'Pricing Inquiry';
        matchedKeyword = 'price/cost';
        confidence = 98;
      } else if (lowercaseText.includes('location') || lowercaseText.includes('where are you') || lowercaseText.includes('address')) {
        target = 'Location Inquiry';
        matchedKeyword = 'location/address';
        confidence = 99;
      } else if (lowercaseText.includes('timing') || lowercaseText.includes('hours') || lowercaseText.includes('open')) {
        target = 'Timings Inquiry';
        matchedKeyword = 'timing/hours';
        confidence = 95;
      } else {
        switch (botState.step) {
          case 'greeting':
            target = 'Booking Intent Check';
            confidence = 90;
            break;
          case 'capture_name':
            target = 'Name Capture Check';
            confidence = 92;
            break;
          case 'capture_phone':
            target = 'Phone Number Capture Check';
            confidence = 94;
            break;
          case 'capture_service':
            target = 'Service Selection Match';
            confidence = 96;
            break;
          case 'capture_datetime':
            target = 'Booking Completion';
            confidence = 98;
            break;
          default:
            target = 'Generative Conversation';
            confidence = 88;
        }
      }

      setSimDebugLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          event: 'AI_REASONING',
          message: `Processed message: "${userText}"`,
          details: {
            engine: 'DeskFlow RuleEngine (Mock)',
            target: target,
            confidence: `${confidence}%`,
            toneApplied: matchedTone,
            matchedKeyword: matchedKeyword,
            parameters: { currentStep: botState.step, textLength: userText.length }
          }
        },
        ...prev
      ]);

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
              `Here is a Google Review request link from your last check-up: ${currentConfig.reviewUrl}`;
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
  const handleFollowUpLead = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const followUpText = `Hi ${lead.name}, still looking to schedule your session for ${lead.requirement}? Let me know if you would like to book a slot.`;

    try {
      // Update status locally first
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'followed_up' } : l));
      triggerToast(`Sending follow-up...`, 'info');

      const res = await authenticatedFetch(`${BACKEND_URL}/v1/campaigns/send-single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          message: followUpText
        })
      });

      if (res.ok) {
        addActivity(`Follow-up WhatsApp sent to ${lead.name}`, 'info');
        triggerToast(`Follow-up template pushed!`, 'purple');

        setChatMessages(prev => [...prev, {
          id: `msg-system-${Date.now()}`,
          text: `📲 [AUTO-FOLLOWUP SENT TO ${lead.phone}]: ${followUpText}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        // Sync lead status update to backend database
        await authenticatedFetch(`${BACKEND_URL}/v1/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...lead,
            status: 'followed_up'
          })
        });
      } else {
        const errData = await res.json();
        triggerToast(`Follow-up failed: ${errData.error || 'Server error'}`, 'red');
        // Revert status
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: lead.status } : l));
      }
    } catch (err) {
      console.error("Error sending follow-up:", err);
      triggerToast(`Follow-up error: ${err.message}`, 'red');
      // Revert status
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: lead.status } : l));
    }
  };

  // Action: Delete Lead
  const handleDeleteLead = (leadId) => {
    if (user && user.role === 'staff' && !user.permissions?.canDeleteLeads) {
      triggerToast("Permission denied: cannot delete leads.", "red");
      return;
    }
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
    if (user && user.role === 'staff' && !user.permissions?.canDeleteLeads) {
      triggerToast("Permission denied: cannot delete appointments.", "red");
      return;
    }
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
  const handleUpdateApptStatus = async (apptId, status) => {
    // Check if it's a lead ID (Leads table has actions triggering this)
    const lead = leads.find(l => l.id === apptId);
    if (lead) {
      setLeads(prev => prev.map(l => l.id === apptId ? { ...l, status } : l));
      addActivity(`Lead ${lead.name} updated to ${status}`, 'info');
      triggerToast(`Lead updated to ${status}`);

      try {
        await authenticatedFetch(`${BACKEND_URL}/v1/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...lead,
            status
          })
        });
      } catch (err) {
        console.error("Error syncing lead status update:", err);
      }
      return;
    }

    // Otherwise treat as appointment
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status } : a));
    const appt = appointments.find(a => a.id === apptId);
    if (appt) {
      addActivity(`Appointment for ${appt.name} updated to ${status}`, 'info');
      triggerToast(`Booking updated to ${status}`);

      try {
        await authenticatedFetch(`${BACKEND_URL}/v1/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...appt,
            status
          })
        });
      } catch (err) {
        console.error("Error syncing appointment status update:", err);
      }
    }
  };

  // Action: Add Manual Lead Form
  const handleManualAddLead = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const requirement = form.requirement.value.trim();
    const budget = form.budget.value.trim();
    const location = form.location.value.trim();

    if (!validateFullName(name)) {
      alert("Please enter a valid name (at least 2 letters, no special characters or numbers).");
      return;
    }
    const cleanedPhone = formatPhoneWithDefault91(phone);
    if (!validatePhoneNumber(cleanedPhone)) {
      alert("Please enter a valid phone number (e.g., +919876543210).");
      return;
    }
    if (!requirement || requirement.length < 2) {
      alert("Please enter a valid requirement (at least 2 characters).");
      return;
    }
    if (!location || location.length < 2) {
      alert("Please enter a valid location (at least 2 characters).");
      return;
    }

    const newLead = {
      id: `l-${Date.now()}`,
      name: name,
      phone: cleanedPhone,
      requirement: requirement,
      budget: budget,
      location: location,
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
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const service = form.service.value.trim();
    const dateTime = form.dateTime.value;

    if (!validateFullName(name)) {
      alert("Please enter a valid name (at least 2 letters, no special characters or numbers).");
      return;
    }
    const cleanedPhone = formatPhoneWithDefault91(phone);
    if (!validatePhoneNumber(cleanedPhone)) {
      alert("Please enter a valid phone number (e.g., +919876543210).");
      return;
    }
    if (!service || service.length < 2) {
      alert("Please enter a valid service (at least 2 characters).");
      return;
    }
    if (!dateTime) {
      alert("Please select a date and time for the appointment.");
      return;
    }

    const newAppt = {
      id: `a-${Date.now()}`,
      name: name,
      phone: cleanedPhone,
      service: service,
      dateTime: dateTime,
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

  // Action: Export Appointments as CSV
  const handleExportAppointmentsCSV = () => {
    try {
      const activeAppts = appointments.filter(a => a.niche === activeNiche);
      if (activeAppts.length === 0) {
        triggerToast("No appointment data to export!");
        return;
      }

      const headers = ['Name', 'Phone', 'Service', 'Date & Time', 'Status', 'Source'];
      const rows = activeAppts.map(a => [
        `"${a.name.replace(/"/g, '""')}"`,
        `"${a.phone}"`,
        `"${a.service.replace(/"/g, '""')}"`,
        `"${a.dateTime}"`,
        `"${a.status}"`,
        `"${a.source || 'WhatsApp'}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `frontdesk_appointments_${activeNiche}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast("CSV file downloaded!", "green");
      addActivity(`Exported appointments table as CSV file`, 'info');
    } catch (err) {
      console.error(err);
      triggerToast("Export failed!");
    }
  };

  // Action: Save Niche Config settings
  const handleSaveConfig = (e) => {
    e.preventDefault();
    const form = e.target;
    const businessName = form.businessName.value.trim();
    const greetingMessage = form.greetingMessage.value.trim();
    const reviewUrl = form.reviewUrl.value.trim();
    const systemPrompt = form.systemPrompt.value.trim();

    if (!businessName || businessName.length < 2) {
      alert("Please enter a valid business name (at least 2 characters).");
      return;
    }
    if (!greetingMessage || greetingMessage.length < 10) {
      alert("Please enter a valid greeting welcome message (at least 10 characters).");
      return;
    }
    if (reviewUrl && !validateUrl(reviewUrl)) {
      alert("Please enter a valid Google review URL.");
      return;
    }
    if (!systemPrompt || systemPrompt.length < 20) {
      alert("Please write a meaningful system prompt (at least 20 characters) for the AI front desk agent.");
      return;
    }

    const updatedConfigs = {
      ...nicheConfigs,
      [activeNiche]: {
        ...nicheConfigs[activeNiche],
        businessName,
        greetingMessage,
        reviewUrl,
        systemPrompt
      }
    };
    setNicheConfigs(updatedConfigs);

    if (user && user.email) {
      const emailKey = user.email.toLowerCase();
      localStorage.setItem(`frontdesk_configs_${emailKey}`, JSON.stringify(updatedConfigs));

      // Sync settings with the user profile object so it updates database
      const updatedUser = {
        ...user,
        businessName,
        systemPrompt,
        greetingMessage,
        reviewUrl
      };
      setUser(updatedUser);
      localStorage.setItem('frontdesk_user', JSON.stringify(updatedUser));

      // Update local storage profiles list
      const profilesLocal = localStorage.getItem('frontdesk_user_profiles');
      const profiles = profilesLocal ? JSON.parse(profilesLocal) : {};
      localStorage.setItem('frontdesk_user_profiles', JSON.stringify({
        ...profiles,
        [emailKey]: updatedUser
      }));

      authenticatedFetch(`${BACKEND_URL}/v1/business-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      }).catch(err => console.error("Error syncing profile updates with backend:", err));
    }

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
    if (!showAuth) {
      return (
        <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:GRAY_BG, color:TEXT, overflowX:"hidden" }}>
          <style>{`
            @keyframes fdBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
            @keyframes fdUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
            @keyframes fdPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
            * { box-sizing:border-box; margin:0; padding:0; }

            .btn-primary-lp {
              background: ${BLUE};
              color: #fff;
              border: none;
              border-radius: 50px;
              padding: 13px 28px;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
              font-family: inherit;
              transition: all 0.2s;
              letter-spacing: 0.01em;
              display: inline-block;
              text-align: center;
            }
            .btn-primary-lp:hover { background: ${BLUE_DARK}; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.35); }

            .btn-outline-blue-lp {
              background: transparent;
              color: ${BLUE};
              border: 1.5px solid ${BLUE};
              border-radius: 50px;
              padding: 12px 24px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              font-family: inherit;
              transition: all 0.2s;
              display: inline-block;
              text-align: center;
            }
            .btn-outline-blue-lp:hover { background: ${BLUE}; color: #fff; }

            .btn-outline-green-lp {
              background: transparent;
              color: ${GREEN_DARK};
              border: 1.5px solid ${GREEN};
              border-radius: 50px;
              padding: 10px 20px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              font-family: inherit;
              transition: all 0.2s;
            }
            .btn-outline-green-lp:hover { background: ${GREEN}; color: #fff; }

            .btn-purple-lp {
              background: linear-gradient(135deg, ${PURPLE}, #9333EA);
              color: #fff;
              border: none;
              border-radius: 50px;
              padding: 14px 32px;
              font-size: 15px;
              font-weight: 700;
              cursor: pointer;
              font-family: inherit;
              transition: all 0.2s;
              box-shadow: 0 4px 16px rgba(124,58,237,0.3);
              display: inline-block;
              text-align: center;
            }
            .btn-purple-lp:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,0.4); }

            .card-lp {
              background: ${WHITE};
              border-radius: 16px;
              border: 1px solid ${BORDER};
              box-shadow: 0 1px 4px rgba(0,0,0,0.06);
              transition: all 0.25s;
            }
            .card-lp:hover { box-shadow: 0 8px 28px rgba(59,130,246,0.12); transform: translateY(-2px); border-color: #BFDBFE; }

            .badge-green-lp {
              display: inline-flex; align-items: center; gap: 5px;
              background: #F0FDF4; color: ${GREEN_DARK};
              border: 1px solid #BBF7D0; border-radius: 50px;
              padding: 5px 12px; font-size: 12px; font-weight: 600;
            }

            .badge-blue-lp {
              display: inline-flex; align-items: center; gap: 5px;
              background: #EFF6FF; color: ${BLUE};
              border: 1px solid #BFDBFE; border-radius: 50px;
              padding: 4px 12px; font-size: 12px; font-weight: 600;
            }

            .nav-link-lp { color: ${TEXT_MID}; text-decoration:none; font-weight:500; font-size:14px; transition:color 0.15s; }
            .nav-link-lp:hover { color: ${BLUE}; }

            .section-label-lp {
              font-size: 12px; font-weight: 700; letter-spacing: 2px;
              text-transform: uppercase; color: ${BLUE}; margin-bottom: 8px;
            }

            .plan-card-highlight-lp {
              background: ${BLUE};
              color: #fff;
              border-color: ${BLUE};
              transform: scale(1.03);
            }
            
            .niche-badge {
              display: flex;
              align-items: center;
              gap: 7px;
              background: ${WHITE};
              border: 1px solid ${BORDER};
              border-radius: 50px;
              padding: 9px 18px;
              font-size: 13px;
              font-weight: 500;
              cursor: default;
              transition: all 0.2s;
              box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            .niche-badge:hover {
              border-color: ${BLUE};
              color: ${BLUE};
            }

            @media(max-width:680px){
              .hero-flex { flex-direction: column !important; }
              .features-grid { grid-template-columns: 1fr !important; }
              .plans-flex { flex-direction: column !important; align-items: center !important; }
              .plan-card-highlight-lp { transform: scale(1) !important; }
              .testi-grid { grid-template-columns: 1fr !important; }
              .hero-title { font-size: 2rem !important; }
              .hide-mobile-lp { display: none !important; }
              .steps-flex { flex-direction: column !important; gap: 20px !important; }
            }
          `}</style>

          {/* ── NAVBAR ── */}
          <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(255,255,255,0.97)",
            backdropFilter:"blur(10px)", borderBottom:`1px solid ${BORDER}`, padding:"0 20px" }}>
            <div style={{ maxWidth:1080, margin:"0 auto", display:"flex", alignItems:"center", height:60, gap:16 }}>
              {/* Logo */}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:BLUE,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🤖</div>
                <span style={{ fontWeight:800, fontSize:16, color:TEXT }}>FrontDesk AI</span>
              </div>

              {/* Links */}
              <div className="hide-mobile-lp" style={{ display:"flex", gap:24, marginLeft:24 }}>
                {["Features","Pricing","Reviews"].map(l => (
                  <a key={l} href={`#${l.toLowerCase()}`} className="nav-link-lp">{l}</a>
                ))}
              </div>

              {/* CTA */}
              <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
                <button className="btn-outline-blue-lp" onClick={navigateToLogin} style={{ padding:"8px 18px", fontSize:13 }}>Sign In</button>
                <button className="btn-primary-lp" onClick={navigateToSignup} style={{ padding:"9px 20px", fontSize:13 }}>Free Trial</button>
              </div>
            </div>
          </nav>

          {/* ── HERO ── */}
          <section style={{ padding:"64px 20px 52px", maxWidth:1080, margin:"0 auto" }}>
            <div className="hero-flex" style={{ display:"flex", alignItems:"center", gap:52 }}>
              {/* Left */}
              <div style={{ flex:1, animation:"fdUp 0.6s ease forwards" }}>
                <div className="badge-green-lp" style={{ marginBottom:18 }}>
                  <span style={{ animation:"fdPulse 2s infinite", fontSize:8 }}>●</span>
                  WhatsApp Agent Active
                </div>
                <h1 className="hero-title" style={{ fontSize:"2.6rem", fontWeight:800, lineHeight:1.2, marginBottom:16, color:TEXT }}>
                  Apne Business Ka<br/>
                  <span style={{ color:BLUE }}>AI Front Desk</span><br/>
                  WhatsApp Pe
                </h1>
                <p style={{ fontSize:16, color:TEXT_GRAY, lineHeight:1.7, marginBottom:28, maxWidth:460 }}>
                  Customers ko instantly reply karo, appointments auto-book karo, Google reviews badhao — bina kisi staff ke. Sirf WhatsApp pe, 24/7.
                </p>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:36 }}>
                  <button className="btn-primary-lp" onClick={navigateToSignup} style={{ fontSize:15, padding:"14px 30px" }}>
                    🚀 Free Trial Shuru Karo
                  </button>
                  <button className="btn-outline-blue-lp" onClick={navigateToLogin}>
                    Live Demo Dekho →
                  </button>
                </div>

                {/* Stats row */}
                <div style={{ display:"flex", gap:0, flexWrap:"wrap" }}>
                  {[
                    ["500+","Businesses"],
                    ["10L+","Messages/Month"],
                    ["4.8★","Google Rating"],
                  ].map(([n,l], i) => (
                    <div key={l} style={{ paddingRight:24, marginRight:24,
                      borderRight: i<2 ? `1px solid ${BORDER}` : "none" }}>
                      <div style={{ fontSize:22, fontWeight:800, color:BLUE }}>{n}</div>
                      <div style={{ fontSize:12, color:TEXT_GRAY }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Chat Demo */}
              <div style={{ flex:1, display:"flex", justifyContent:"center", minWidth:280 }}>
                <ChatDemo/>
              </div>
            </div>
          </section>

          {/* ── NICHES ── */}
          <section style={{ background:WHITE, borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, padding:"36px 20px" }}>
            <div style={{ maxWidth:1080, margin:"0 auto", textAlign:"center" }}>
              <p className="section-label-lp">Kis Ke Liye Hai</p>
              <h2 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:24 }}>Har Local Business Ke Liye</h2>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center" }}>
                {niches.map(([ic,nm]) => (
                  <div key={nm} className="niche-badge">
                    <span style={{ fontSize:17 }}>{ic}</span>{nm}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section id="features" style={{ padding:"72px 20px", maxWidth:1080, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:48 }}>
              <p className="section-label-lp">Features</p>
              <h2 style={{ fontSize:"1.8rem", fontWeight:800 }}>Sab Kuch Ek Platform Pe</h2>
              <p style={{ color:TEXT_GRAY, marginTop:8, fontSize:15 }}>Aapke business ke liye complete WhatsApp AI solution</p>
            </div>
            <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {features.map(f => (
                <div key={f.title} className="card-lp" style={{ padding:24 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:"#EFF6FF",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:22, marginBottom:14 }}>{f.icon}</div>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:7, color:TEXT }}>{f.title}</h3>
                  <p style={{ fontSize:13, color:TEXT_GRAY, lineHeight:1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section style={{ background:WHITE, borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, padding:"68px 20px" }}>
            <div style={{ maxWidth:860, margin:"0 auto", textAlign:"center" }}>
              <p className="section-label-lp">Setup Process</p>
              <h2 style={{ fontSize:"1.8rem", fontWeight:800, marginBottom:44 }}>3 Steps Mein Live Ho Jao</h2>
              <div className="steps-flex" style={{ display:"flex", gap:0, justifyContent:"center" }}>
                {[
                  { n:"1", t:"Sign Up Karo", d:"Business details fill karo. Sirf 5 minute lagenge." },
                  { n:"2", t:"WhatsApp Connect Karo", d:"Apna WhatsApp Business number link karo. Guided setup." },
                  { n:"3", t:"AI Go Live!", d:"AI automatically train ho ke customers ko reply karta hai." },
                ].map((s,i) => (
                  <div key={i} style={{ flex:1, padding:"0 20px", position:"relative" }}>
                    {i < 2 && <div style={{ position:"absolute", top:22, right:0, width:"40%",
                      height:2, background:BORDER }}/>}
                    <div style={{ width:44, height:44, borderRadius:"50%", background:BLUE,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:18, fontWeight:800, color:"#fff", margin:"0 auto 14px" }}>{s.n}</div>
                    <h3 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{s.t}</h3>
                    <p style={{ fontSize:13, color:TEXT_GRAY, lineHeight:1.6 }}>{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PRICING ── */}
          <section id="pricing" style={{ padding:"72px 20px", maxWidth:1080, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:48 }}>
              <p className="section-label-lp">Pricing</p>
              <h2 style={{ fontSize:"1.8rem", fontWeight:800 }}>Simple, Transparent Pricing</h2>
              <p style={{ color:TEXT_GRAY, marginTop:8 }}>14 din ka free trial — koi credit card nahi chahiye</p>
            </div>
            <div className="plans-flex" style={{ display:"flex", gap:16, justifyContent:"center", alignItems:"flex-start", flexWrap:"wrap" }}>
              {plans.map(p => (
                <div key={p.name} className={`card-lp${p.highlight?" plan-card-highlight-lp":""}`}
                  style={{ flex:1, minWidth:240, maxWidth:300, padding:"28px 24px" }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
                    color: p.highlight ? "rgba(255,255,255,0.7)" : BLUE, marginBottom:6 }}>{p.name}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:4 }}>
                    <span style={{ fontSize:34, fontWeight:900 }}>{p.price}</span>
                    <span style={{ fontSize:13, opacity:0.6 }}>{p.mo}</span>
                  </div>
                  <p style={{ fontSize:12, opacity:0.65, marginBottom:20 }}>{p.desc}</p>

                  <button onClick={navigateToSignup} style={{
                    width:"100%", borderRadius:50, padding:"12px",
                    fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                    border: p.highlight ? "none" : `1.5px solid ${BLUE}`,
                    background: p.highlight ? WHITE : BLUE,
                    color: p.highlight ? BLUE : WHITE,
                    marginBottom:20, transition:"all 0.2s",
                  }}>{p.cta}</button>

                  <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display:"flex", gap:8, fontSize:13, alignItems:"flex-start" }}>
                        <span style={{ color: p.highlight ? "#93C5FD" : GREEN, fontWeight:700, marginTop:1 }}>✓</span>
                        <span style={{ opacity: p.highlight ? 0.9 : 1 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── TESTIMONIALS ── */}
          <section id="reviews" style={{ background:WHITE, borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, padding:"68px 20px" }}>
            <div style={{ maxWidth:980, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:44 }}>
                <p className="section-label-lp">Reviews</p>
                <h2 style={{ fontSize:"1.8rem", fontWeight:800 }}>Business Owners Kya Kehte Hain</h2>
              </div>
              <div className="testi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                {testimonials.map(t => (
                  <div key={t.name} className="card-lp" style={{ padding:24 }}>
                    <div style={{ color:"#FBBF24", fontSize:14, marginBottom:12 }}>{"★★★★★"}</div>
                    <p style={{ fontSize:13.5, color:TEXT_MID, lineHeight:1.7, marginBottom:18, fontStyle:"italic" }}>"{t.text}"</p>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:38, height:38, borderRadius:"50%", background:"#EFF6FF",
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{t.avatar}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13 }}>{t.name}</div>
                        <div style={{ fontSize:12, color:TEXT_GRAY }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA BANNER ── */}
          <section style={{ background:BLUE, padding:"64px 20px", textAlign:"center" }}>
            <div className="badge-green-lp" style={{ marginBottom:16, background:"rgba(255,255,255,0.15)", borderColor:"rgba(255,255,255,0.3)", color:"#fff" }}>
              <span style={{ animation:"fdPulse 2s infinite", fontSize:8 }}>●</span> 14 Din Free Trial
            </div>
            <h2 style={{ fontSize:"2rem", fontWeight:900, color:"#fff", marginBottom:12 }}>
              Aaj Hi Shuru Karo — Free Mein
            </h2>
            <p style={{ color:"rgba(255,255,255,0.8)", fontSize:15, marginBottom:28 }}>
              No credit card. No setup fee. Koi hidden charges nahi.
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button className="btn-purple-lp" onClick={navigateToSignup} style={{ fontSize:16, padding:"15px 36px" }}>
                🚀 Free Trial Shuru Karo
              </button>
              <button onClick={navigateToLogin} style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.4)",
                borderRadius:50, padding:"14px 28px", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                📞 Demo Book Karo
              </button>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={{ background:TEXT, color:"rgba(255,255,255,0.5)", padding:"36px 20px", textAlign:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginBottom:12 }}>
              <div style={{ width:26, height:26, borderRadius:7, background:BLUE,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🤖</div>
              <span style={{ fontWeight:700, color:"#fff", fontSize:14 }}>FrontDesk AI</span>
            </div>
            <p style={{ fontSize:12, marginBottom:14 }}>WhatsApp AI Front Desk for Local Businesses</p>
            <div style={{ display:"flex", gap:20, justifyContent:"center", marginBottom:16, flexWrap:"wrap" }}>
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color:"rgba(255,255,255,0.4)", fontSize:12, textDecoration:"none" }}>Privacy Policy</a>
              <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color:"rgba(255,255,255,0.4)", fontSize:12, textDecoration:"none" }}>Terms of Service</a>
              <a href="mailto:kartikparashar15@gmail.com" style={{ color:"rgba(255,255,255,0.4)", fontSize:12, textDecoration:"none" }}>Contact Us</a>
            </div>
            <p style={{ fontSize:11 }}>© 2026 FrontDesk AI. Made with ❤️ in India 🇮🇳</p>
          </footer>

          {/* Simulator FAB */}
          <button className="btn-purple-lp" onClick={navigateToLogin} style={{
            position:"fixed", bottom:20, right:20, zIndex:999,
            padding:"12px 20px", fontSize:13, borderRadius:50,
            display:"flex", alignItems:"center", gap:7,
          }}>
            📱 Simulator
          </button>
        </div>
      );
    }

    return (
      <div className="auth-page-backdrop">
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 20 }}>
          <button 
            onClick={navigateToHome} 
            className="btn-secondary" 
            style={{ 
              background: '#1e293b', 
              color: '#ffffff', 
              border: '1px solid #334155', 
              borderRadius: '20px', 
              padding: '8px 16px', 
              fontSize: '0.8rem', 
              fontWeight: '600', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#334155'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; }}
          >
            ← Back to Home
          </button>
        </div>
        <div className="auth-ambient-orb-1"></div>
        <div className="auth-ambient-orb-2"></div>

        <div className="glass-panel auth-card-panel">
          <div className="auth-card-header">
            <img src="/app_icon.png" className="logo-icon" style={{ margin: '0 auto', width: '42px', height: '42px', objectFit: 'cover' }} alt="FrontDesk AI Logo" />
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

          {authMode !== 'admin_login' && authMode !== 'forgot_password' && !verificationEmailSent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {/* Row 1: Auth Mode Toggle */}
              <div className="auth-tab-buttons" style={{ marginBottom: '0' }}>
                <button 
                  onClick={() => { setAuthMode('login'); setOtpSent(false); window.history.pushState({}, '', '/login'); }} 
                  className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                  type="button"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthMode('signup'); setOtpSent(false); window.history.pushState({}, '', '/signup'); }} 
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
                            <input 
                              name="name" 
                              required 
                              value={signupNameInput}
                              onChange={(e) => setSignupNameInput(e.target.value)}
                              placeholder="e.g. Kartik Gowda" 
                            />
                          </div>
                          
                          <div className="form-group" style={{ marginBottom: '0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Settings size={14} /> Business Category
                            </label>
                            <select 
                              name="nicheType" 
                              value={signupNicheType}
                              onChange={(e) => setSignupNicheType(e.target.value)}
                              style={{ width: '100%' }}
                            >
                              {Object.keys(NICHE_CONFIGS).map(key => (
                                <option key={key} value={key}>
                                  {NICHE_CONFIGS[key].logo || '💼'} {getCategoryDisplayName(key)}
                                </option>
                              ))}
                              <option value="custom">💼 Other (Custom Category)</option>
                            </select>
                            
                            {signupNicheType === 'custom' && (
                              <div style={{ marginTop: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)' }}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                  <span>Specify Custom Category Name</span>
                                </label>
                                <input 
                                  type="text" 
                                  name="customNicheInput"
                                  required 
                                  placeholder="e.g. Real Estate, Grocery Store" 
                                  value={customNicheName}
                                  onChange={(e) => setCustomNicheName(e.target.value)}
                                  style={{ marginTop: '4px', width: '100%' }}
                                />
                              </div>
                            )}
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
                            <input 
                              name="name" 
                              required 
                              value={signupNameInput}
                              onChange={(e) => setSignupNameInput(e.target.value)}
                              placeholder="e.g. Kartik Gowda" 
                            />
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Settings size={14} /> Business Category
                        </label>
                        <select 
                          name="nicheType" 
                          value={signupNicheType}
                          onChange={(e) => setSignupNicheType(e.target.value)}
                          style={{ width: '100%' }}
                        >
                          {Object.keys(NICHE_CONFIGS).map(key => (
                            <option key={key} value={key}>
                              {NICHE_CONFIGS[key].logo || '💼'} {getCategoryDisplayName(key)}
                            </option>
                          ))}
                          <option value="custom">💼 Other (Custom Category)</option>
                        </select>
                        
                        {signupNicheType === 'custom' && (
                          <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)' }}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                              <span>Specify Custom Category Name</span>
                            </label>
                            <input 
                              type="text" 
                              name="customNicheInput"
                              required 
                              placeholder="e.g. Real Estate, Grocery Store" 
                              value={customNicheName}
                              onChange={(e) => setCustomNicheName(e.target.value)}
                              style={{ marginTop: '4px', width: '100%' }}
                            />
                          </div>
                        )}
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

        {/* Public compliance links for Meta API review */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '0',
          right: '0',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          zIndex: 10
        }}>
          <span>&copy; 2026 DeskFlow AI. All rights reserved.</span>
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: '500' }}>Privacy Policy</a>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: '500' }}>Terms of Service</a>
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
  if (user && !user.isOnboarded && user.role !== 'staff') {
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

  // Calculate trial status & subscription lock
  const isSubscribed = user && user.isSubscribed === true;
  const trialPeriodMs = 3 * 24 * 60 * 60 * 1000; // 3 days
  const trialExpiry = user && user.trialStart ? new Date(new Date(user.trialStart).getTime() + trialPeriodMs) : null;
  const isTrialActive = trialExpiry ? (new Date() < trialExpiry) : false;
  const hasActivePlan = (user && user.role === 'admin') || isSubscribed || isTrialActive;

  const getTrialRemainingText = () => {
    if (!user || !user.trialStart) return "No active trial";
    const now = new Date();
    const expiry = new Date(new Date(user.trialStart).getTime() + 3 * 24 * 60 * 60 * 1000);
    const diffMs = expiry - now;
    if (diffMs <= 0) return "Trial Expired";
    
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return `${days}d ${hours}h remaining`;
    }
    return `${diffHours} hours remaining`;
  };

  const getSubscriptionRemainingText = () => {
    if (!user) return "No active subscription";
    const startDate = user.subscriptionStart ? new Date(user.subscriptionStart) : new Date();
    const expiry = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const diffMs = expiry - new Date();
    if (diffMs <= 0) return "Subscription Expired";
    
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return `${days}d ${hours}h remaining`;
    }
    return `${diffHours} hours remaining`;
  };

  // Lock Overlay Component for Inactive Subscriptions
  const renderLockOverlay = (featureName) => {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        animation: 'fadeIn 0.3s ease',
        boxSizing: 'border-box',
        padding: '20px'
      }}>
        <div className="glass-panel" style={{
          padding: '30px 40px',
          maxWidth: '460px',
          textAlign: 'center',
          border: '1px solid rgba(217, 48, 37, 0.25)',
          background: 'var(--bg-card)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
          borderRadius: '16px'
        }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(217, 48, 37, 0.1)', 
            color: '#d93025', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Lock size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            🔒 {featureName} Locked
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
            Your 3-day free trial has expired. To keep using {featureName}, please select one of our premium plans in the Billing tab.
          </p>
          <button 
            onClick={() => setActiveTab('billing')}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0070f3 0%, #00dfd8 100%)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 118, 255, 0.25)',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Go to Billing & Subscription
          </button>
        </div>
      </div>
    );
  };

  // SCREEN RENDER 2: DASHBOARD HOME
  return (
    <div className={`app-container ${showSimDebug ? 'sim-debug-open' : ''}`}>
      
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
                        <p style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1c1e21' }}>{user.businessName || currentConfig.businessName}</p>
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
                        const cleanedPhone = formatPhoneWithDefault91(metaPhoneInput);
                        if (!validatePhoneNumber(cleanedPhone)) {
                          alert("Please enter a valid phone number (e.g., +919876543210).");
                          return;
                        }
                        setMetaPhoneInput(cleanedPhone);
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

      {/* Mobile Header Bar */}
      <header className="mobile-header">
        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div className="logo-container" style={{ padding: 0 }}>
          <img src="/app_icon.png" className="logo-icon" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} alt="FrontDesk AI Logo" />
          <span className="logo-text" style={{ fontSize: '1.1rem' }}>FrontDesk AI</span>
        </div>
        <button 
          className="mobile-sim-toggle-btn"
          onClick={() => setIsSimulatorOpen(true)}
          style={{
            background: 'var(--accent-purple-glow)',
            color: 'var(--accent-purple)',
            border: '1px solid rgba(26, 115, 232, 0.2)',
            padding: '6px 12px',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Smartphone size={12} />
          Simulator
        </button>
      </header>

      {/* Sidebar Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Simulator Drawer Backdrop */}
      {isSimulatorOpen && (
        <div className="simulator-backdrop" onClick={() => setIsSimulatorOpen(false)}></div>
      )}

      {/* Sidebar Nav */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div>
          <div className="logo-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/app_icon.png" className="logo-icon" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} alt="FrontDesk AI Logo" />
              <span className="logo-text">FrontDesk AI</span>
            </div>
            <button className="sidebar-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={18} />
            </button>
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
                {user.role === 'admin' ? 'SaaS Administrator' : `${user.businessName || currentConfig.businessName} Owner`}
              </div>
            </div>
          </div>

          <ul className="sidebar-menu">
            <li>
              <button 
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <TrendingUp size={18} style={{ color: 'var(--accent-blue)' }} />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('leads'); setIsMobileMenuOpen(false); }}
                className={`menu-item ${activeTab === 'leads' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <Users size={18} />
                <span>Lead Manager</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('livechat'); setIsMobileMenuOpen(false); }}
                className={`menu-item ${activeTab === 'livechat' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <MessageSquare size={18} style={{ color: 'var(--accent-blue)' }} />
                <span>Live Chat & Handoff</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('appointments'); setIsMobileMenuOpen(false); }}
                className={`menu-item ${activeTab === 'appointments' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <Calendar size={18} />
                <span>Appointments</span>
              </button>
            </li>
            {(user.role !== 'staff' || user.permissions?.canEditSettings) && (
              <>
                <li>
                  <button 
                    onClick={() => { setActiveTab('automation'); setIsMobileMenuOpen(false); }}
                    className={`menu-item ${activeTab === 'automation' ? 'active' : ''}`}
                    style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                  >
                    <Settings size={18} />
                    <span>Automation Hub</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveTab('knowledge'); setIsMobileMenuOpen(false); }}
                    className={`menu-item ${activeTab === 'knowledge' ? 'active' : ''}`}
                    style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                  >
                    <Database size={18} style={{ color: 'var(--accent-purple)' }} />
                    <span>AI Knowledge Base</span>
                  </button>
                </li>

                <li>
                  <button 
                    onClick={() => { setActiveTab('campaigns'); setIsMobileMenuOpen(false); }}
                    className={`menu-item ${activeTab === 'campaigns' ? 'active' : ''}`}
                    style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                  >
                    <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
                    <span>Marketing Broadcast</span>
                  </button>
                </li>
              </>
            )}
            {(user.role !== 'staff' || user.permissions?.canViewBilling) && (
              <li>
                <button 
                  onClick={() => { setActiveTab('billing'); setIsMobileMenuOpen(false); }}
                  className={`menu-item ${activeTab === 'billing' ? 'active' : ''}`}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  <Coins size={18} style={{ color: 'var(--accent-yellow)' }} />
                  <span>Billing & Subscription</span>
                </button>
              </li>
            )}
            <li>
              <button 
                onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <UserIcon size={18} />
                <span>My Profile</span>
              </button>
            </li>
            {user.role === 'admin' && (
              <li>
                <button 
                  onClick={() => { setActiveTab('admin_panel'); setIsMobileMenuOpen(false); }}
                  className={`menu-item ${activeTab === 'admin_panel' ? 'active' : ''}`}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  <Shield size={18} style={{ color: 'var(--accent-pink)' }} />
                  <span>SaaS Admin Console</span>
                </button>
              </li>
            )}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                {Object.keys(nicheConfigs).map(key => {
                  const config = nicheConfigs[key];
                  const isActive = activeNiche === key;
                  const accentColor = config.colorTheme || 'var(--accent-blue)';
                  const textColor = isActive ? '#ffffff' : 'var(--text-secondary)';
                  const themeGlow = isActive ? (config.colorTheme?.includes('var') ? config.colorTheme + '-glow' : 'rgba(59, 130, 246, 0.15)') : 'transparent';
                  
                  return (
                    <div 
                      key={key}
                      onClick={() => setActiveNiche(key)}
                      className="niche-switcher-card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textAlign: 'left',
                        border: isActive ? `1px solid ${accentColor}` : '1px solid var(--border-light)',
                        background: isActive ? themeGlow : 'transparent',
                        width: '100%',
                        color: textColor,
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: '10px',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{config.logo || '💼'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{config.businessName}</p>
                        <p style={{ fontSize: '0.7rem', opacity: '0.8', textTransform: 'capitalize', margin: 0 }}>{key} Niche</p>
                      </div>
                      {key !== 'dental' && key !== 'salon' && (
                        <span 
                          title="Delete Niche"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete the "${config.businessName}" niche?`)) {
                              deleteNiche(key);
                            }
                          }}
                          style={{ fontSize: '0.85rem', cursor: 'pointer', padding: '4px', opacity: 0.6 }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                        >
                          ✕
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setShowAddNicheModal(true)}
                className="btn-secondary"
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px dashed var(--border-light)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                ➕ Add Custom Niche
              </button>
            </>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
              padding: '12px 10px',
              fontSize: '0.75rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span>{currentConfig.logo || '💼'}</span>
              <span>Locked to {user.businessName || currentConfig.businessName}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`main-content ${activeTab === 'livechat' ? 'handoff-layout' : ''}`}>
        
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
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="tab-content" style={{ position: 'relative' }}>
            {!hasActivePlan && renderLockOverlay('Dashboard Analytics')}
            
            {leads.length === 0 && appointments.length === 0 && (
              <div className="glass-panel" style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
                  }}>
                    <Database size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                      Dashboard is Empty
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Would you like to load demo datasets for the <strong>{currentConfig.businessName}</strong> category to preview widgets?
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleLoadDemoData}
                  className="btn-primary" 
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
                    border: 'none',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                    cursor: 'pointer'
                  }}
                >
                  Load Demo Data ⚡
                </button>
              </div>
            )}
            
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

              <div className="glass-panel kpi-card kpi-card-clickable" onClick={handleGoogleRatingClick} title="View or Write Google Reviews">
                <div className="kpi-header">
                  <span className="kpi-title">Google Rating</span>
                  <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-yellow)' }}>
                    <Star size={18} />
                  </div>
                </div>
                <div className="kpi-value">
                  {googleStats.rating.toFixed(1)} / 5.0
                  {!googleStats.isMock && (
                    <span style={{ fontSize: '0.65rem', verticalAlign: 'middle', marginLeft: '6px', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', borderRadius: '4px', fontWeight: 'bold' }}>
                      LIVE
                    </span>
                  )}
                </div>
                <div className="kpi-footer">
                  <span style={{ color: 'var(--accent-yellow)', display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < Math.round(googleStats.rating) ? 'var(--accent-yellow)' : 'transparent'} />
                    ))}
                  </span>
                  <span>({googleStats.totalReviews} Google reviews)</span>
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
              {/* Google Reviews */}
              <div id="google-reviews-panel" className="glass-panel" style={{ gridColumn: 'span 2', padding: '0', overflow: 'hidden', marginTop: '12px' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={18} style={{ color: 'var(--accent-yellow)' }} />
                    Live Google Reviews
                  </h3>
                  <span className="badge badge-converted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {!googleStats.isMock && <span className="pulse-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-green)' }}></span>}
                    {googleStats.isMock ? 'Demo Mode' : 'Live Sync'}
                  </span>
                </div>
                <div className="panel-body">
                  <div className="activity-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {googleStats.reviews && googleStats.reviews.length > 0 ? (
                      googleStats.reviews.map((rev, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{rev.author_name}</span>
                            <span className="badge badge-converted" style={{ fontSize: '0.6rem', backgroundColor: 'rgba(66, 133, 244, 0.1)', color: '#4285f4' }}>
                              Google Review
                            </span>
                          </div>
                          {rev.rating > 0 && (
                            <div className="star-rating">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={12} fill={i < rev.rating ? 'var(--accent-yellow)' : 'transparent'} style={{ color: 'var(--accent-yellow)' }} />
                              ))}
                            </div>
                          )}
                          {rev.text && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>"{rev.text}"</p>}
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Review Date: {new Date(rev.time * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : reviews && reviews.filter(r => r.niche === activeNiche).length > 0 ? (
                      reviews
                        .filter(r => r.niche === activeNiche)
                        .map((rev, index) => (
                          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{rev.customerName}</span>
                              <span className="badge badge-converted" style={{ fontSize: '0.6rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
                                Business Review
                              </span>
                            </div>
                            {rev.rating > 0 && (
                              <div className="star-rating">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} size={12} fill={i < rev.rating ? 'var(--accent-yellow)' : 'transparent'} style={{ color: 'var(--accent-yellow)' }} />
                                ))}
                              </div>
                            )}
                            {rev.comment && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>"{rev.comment}"</p>}
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Status: <span style={{ textTransform: 'capitalize', color: rev.status === 'public' ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{rev.status}</span>
                            </span>
                          </div>
                        ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No customer reviews synced yet. Pull reviews by setting up Google Places in settings.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Strategy Box */}
            <div className="glass-panel" style={{ display: 'flex', gap: '20px', padding: '24px', alignItems: 'center', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)' }}>
              <div style={{ fontSize: '2.5rem' }}>📢</div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: 'bold' }}>Google Reviews Sync Active</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  FrontDesk AI automatically prompts customers to leave a review after their appointments, helping to improve your clinic or salon ranking online.
                </p>
              </div>
              <button 
                onClick={() => {
                  const el = document.getElementById('google-reviews-panel');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-primary" 
                style={{ marginLeft: 'auto', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Check Reviews</span>
                <ArrowUpRight size={16} />
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Leads Table */}
        {activeTab === 'leads' && (
          <div className="tab-content" style={{ position: 'relative' }}>
            {!hasActivePlan && renderLockOverlay('Lead Manager CRM')}
            
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
                  onClick={async () => {
                    triggerToast("Syncing leads data...", "info");
                    await syncCRMData();
                    triggerToast("CRM data synced!", "green");
                  }}
                  className="filter-btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)' }}
                  title="Force refresh CRM data"
                >
                  <RotateCcw size={14} />
                  <span>Refresh</span>
                </button>

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
                              {!(user?.role === 'staff' && !user?.permissions?.canDeleteLeads) && (
                                <button 
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="action-btn action-btn-danger" 
                                  title="Remove Lead Record"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
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
          <div className="tab-content" style={{ position: 'relative' }}>
            {!hasActivePlan && renderLockOverlay('Appointment Scheduler')}
            
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

                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-light)', margin: '0 8px' }}></div>

                <button 
                  onClick={async () => {
                    triggerToast("Syncing bookings data...", "info");
                    await syncCRMData();
                    triggerToast("Booking data synced!", "green");
                  }}
                  className="filter-btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)' }}
                  title="Force refresh CRM data"
                >
                  <RotateCcw size={14} />
                  <span>Refresh</span>
                </button>

                <button 
                  onClick={handleExportAppointmentsCSV}
                  className="filter-btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)' }}
                  title="Export appointments list as a CSV file"
                >
                  <Download size={14} />
                  <span>CSV Export</span>
                </button>

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
                          {!(user?.role === 'staff' && !user?.permissions?.canDeleteLeads) && (
                            <button 
                              onClick={() => handleDeleteAppointment(appt.id)}
                              className="action-btn action-btn-danger"
                              title="Delete Booking"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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
          <div className="tab-content" style={{ position: 'relative' }}>
            {!hasActivePlan && renderLockOverlay('Outbound Marketing Campaigns')}
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
                  <select 
                    id="campaign-audience" 
                    onChange={(e) => setCampaignAudience(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)' }}
                  >
                    <option value="all-leads">All Registered Leads ({leads.filter(l => l.niche === activeNiche).length} contacts)</option>
                    <option value="new-leads">Only New Leads ({leads.filter(l => l.niche === activeNiche && l.status === 'new').length} contacts)</option>
                    <option value="all-appts">Appointment Clients ({appointments.filter(a => a.niche === activeNiche).length} contacts)</option>
                    <option value="custom-list">Custom Imported List (Copy-Paste Names & Numbers)</option>
                  </select>
                </div>

                {campaignAudience === 'custom-list' && (
                  <div className="form-group animate-slide-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ margin: 0 }}>Recipients List (Format: Name, Phone)</label>
                      
                      {/* Hidden file input for CSV/TXT/Excel upload */}
                      <input 
                        type="file" 
                        id="campaign-csv-upload" 
                        accept=".csv,.txt,.xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
                          
                          if (isExcel) {
                            loadSheetJS().then((XLSX) => {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                try {
                                  const data = new Uint8Array(event.target.result);
                                  const workbook = XLSX.read(data, { type: 'array' });
                                  const firstSheetName = workbook.SheetNames[0];
                                  const worksheet = workbook.Sheets[firstSheetName];
                                  
                                  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                                  if (rows.length === 0) {
                                    triggerToast("The sheet is empty.", "red");
                                    return;
                                  }
                                  
                                  let formattedRows = [];
                                  let startIndex = 0;
                                  
                                  // Skip header row if it exists
                                  const firstRow = rows[0];
                                  if (firstRow && firstRow.some(val => {
                                    const str = String(val).toLowerCase();
                                    return str.includes('name') || str.includes('phone') || str.includes('mobile') || str.includes('number');
                                  })) {
                                    startIndex = 1;
                                  }
                                  
                                  for (let i = startIndex; i < rows.length; i++) {
                                    const row = rows[i];
                                    if (!row || row.length === 0) continue;
                                    
                                    let name = "";
                                    let phone = "";
                                    
                                    if (row.length === 1) {
                                      const val = String(row[0]).trim();
                                      if (val.match(/^\+?[0-9\s-]{8,15}$/)) {
                                        phone = val;
                                      } else {
                                        name = val;
                                      }
                                    } else if (row.length >= 2) {
                                      name = String(row[0]).trim();
                                      phone = String(row[1]).trim();
                                    }
                                    
                                    if (name || phone) {
                                      formattedRows.push(`${name}, ${phone}`);
                                    }
                                  }
                                  
                                  const csvText = formattedRows.join('\n');
                                  const textarea = document.getElementById("campaign-custom-recipients");
                                  if (textarea) {
                                    textarea.value = csvText;
                                    triggerToast("Excel file loaded and parsed successfully!", "green");
                                  }
                                } catch (err) {
                                  console.error(err);
                                  triggerToast("Failed to parse Excel file.", "red");
                                }
                              };
                              reader.readAsArrayBuffer(file);
                            }).catch((err) => {
                              triggerToast(err.message, "red");
                            });
                          } else {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const text = event.target.result;
                              const textarea = document.getElementById("campaign-custom-recipients");
                              if (textarea) {
                                textarea.value = text;
                                triggerToast("File loaded successfully!", "green");
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                      
                      <button 
                        type="button"
                        className="btn-secondary"
                        onClick={() => document.getElementById('campaign-csv-upload').click()}
                        style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border-light)', borderRadius: '6px' }}
                      >
                        <UploadCloud size={12} />
                        Upload Excel / CSV / TXT
                      </button>
                    </div>
                    
                    <textarea 
                      id="campaign-custom-recipients"
                      rows={5}
                      placeholder={"John Doe, +919876543210\nJane Smith, 9900088000"}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.85rem' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      💡 Supports Comma (,) or Tab separated values. Copy-paste directly from Excel/Google Sheets or upload a .CSV, .TXT, or Excel (.XLSX/.XLS) file.
                    </p>
                  </div>
                )}

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
                    } else if (aud === 'all-appts') {
                      targets = appointments.filter(a => a.niche === activeNiche);
                    } else if (aud === 'custom-list') {
                      const customText = document.getElementById("campaign-custom-recipients")?.value || '';
                      const lines = customText.split('\n');
                      lines.forEach(line => {
                        if (!line.trim()) return;
                        let parts = line.split(',');
                        if (parts.length < 2) {
                          parts = line.split('\t'); // tab separated (Excel copy-paste)
                        }
                        if (parts.length >= 2) {
                          const name = parts[0].trim();
                          const rawPhone = parts[1].trim();
                          const phone = formatPhoneWithDefault91(rawPhone);
                          if (name && validatePhoneNumber(phone)) {
                            targets.push({ name, phone });
                          }
                        }
                      });
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
                      setTimeout(async () => {
                        const filledMsg = msg.replace("{{name}}", t.name);
                        try {
                          const res = await authenticatedFetch(`${BACKEND_URL}/v1/campaigns/send-single`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: t.name,
                              phone: t.phone,
                              message: filledMsg
                            })
                          });
                          
                          if (res.ok) {
                            logs.innerHTML += `📲 [${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}] Sent WhatsApp message to ${t.name} (${t.phone}): <span style="color: var(--accent-green)">SUCCESS</span><br/>`;
                            addActivity(`Campaign broadcast sent to ${t.name}`, 'info');
                          } else {
                            const errData = await res.json();
                            logs.innerHTML += `📲 [${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}] Sent WhatsApp message to ${t.name} (${t.phone}): <span style="color: var(--accent-red)">FAILED (${errData.error || 'Server error'})</span><br/>`;
                          }
                        } catch (err) {
                          logs.innerHTML += `📲 [${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}] Sent WhatsApp message to ${t.name} (${t.phone}): <span style="color: var(--accent-red)">FAILED (${err.message})</span><br/>`;
                        }
                        
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
          <div className="tab-content" style={{ position: 'relative' }}>
            {!hasActivePlan && renderLockOverlay('WhatsApp AI Assistant Config')}
            
            <div className="automation-sections">
              
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
                  AI Agent Instructions
                </h3>

                <form key={`${activeNiche}_${currentConfig.businessName}_${currentConfig.reviewUrl}_${currentConfig.greetingMessage?.substring(0, 10)}_${currentConfig.systemPrompt?.substring(0, 10)}`} onSubmit={handleSaveConfig}>
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

                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleMetaTestPing()}
                          className="btn-secondary" 
                          style={{ flexGrow: 1, borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)', padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                          Test Connection ⚡
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setWhatsappConfig({ accessToken: '', phoneNumberId: '', accountId: '', isConnected: false });
                            triggerToast("WhatsApp connection disconnected.");
                            addActivity("Disconnected WhatsApp Account", "info");
                          }} 
                          className="btn-secondary" 
                          style={{ flexGrow: 1, borderColor: 'var(--accent-red)', color: 'var(--accent-red)', padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                          Disconnect Account
                        </button>
                      </div>
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

                      <form key={`${whatsappConfig.accessToken?.substring(0, 10) || ''}_${whatsappConfig.phoneNumberId || ''}_${whatsappConfig.accountId || ''}`} onSubmit={handleSaveWhatsAppConfig} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="form-group" style={{ margin: '0' }}>
                          <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Meta Access Token</label>
                          <input 
                            name="accessToken" 
                            type="text" 
                            defaultValue={whatsappConfig.accessToken || ''}
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
                            defaultValue={whatsappConfig.phoneNumberId || ''}
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
                            defaultValue={whatsappConfig.accountId || ''}
                            placeholder="e.g. 238128912389104" 
                            required 
                            style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px', fontSize: '0.8rem' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button type="submit" className="btn-secondary" style={{ flexGrow: 1, padding: '10px', fontSize: '0.8rem' }}>
                            Link Credentials Manually 🚀
                          </button>
                          <button 
                            type="button" 
                            onClick={(e) => handleTestManualConnection(e.target.form)}
                            className="btn-secondary" 
                            style={{ padding: '10px', fontSize: '0.8rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
                          >
                            Test Connection ⚡
                          </button>
                        </div>
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
                        <code style={{ flexGrow: 1, textOverflow: 'ellipsis', overflow: 'hidden' }}>{BACKEND_URL}/v1/webhooks</code>
                        <button onClick={() => { navigator.clipboard.writeText(`${BACKEND_URL}/v1/webhooks`); triggerToast("URL Copied!"); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Copy size={12} /></button>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Verify Token:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #dadce0', padding: '6px 10px', borderRadius: '8px', marginTop: '4px' }}>
                        <code style={{ flexGrow: 1 }}>deskflow_verify_token_secure_99</code>
                        <button onClick={() => { navigator.clipboard.writeText("deskflow_verify_token_secure_99"); triggerToast("Verify Token Copied!"); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Copy size={12} /></button>
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



        {/* Tab 5.5: Billing & Subscription */}
        {activeTab === 'billing' && (
          <div className="tab-content" style={{ animation: 'fadeIn 0.4s ease' }}>
            
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Billing & Subscription
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Manage your subscription plans, view billing details, and verify active feature tiers.
                </p>
              </div>
              <div className="badge badge-new" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coins size={14} style={{ color: 'var(--accent-yellow)' }} />
                Secure Payments via Razorpay
              </div>
            </div>

            {/* Current Subscription Status Panel */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(0, 112, 243, 0.1)',
                  color: '#0070f3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {isSubscribed 
                      ? `${user.subscriptionPlan === 'pro' ? 'Pro Plan' : 'Starter Plan'} Subscribed` 
                      : isTrialActive 
                        ? '3-Day Free Trial Mode' 
                        : 'No Active Subscription'}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {isSubscribed 
                      ? 'Your subscription is active and renews monthly.' 
                      : isTrialActive 
                        ? `Enjoy unlimited features. Trial ends: ${trialExpiry ? new Date(trialExpiry).toLocaleString() : ''}` 
                        : 'Your trial has ended. Please subscribe below to re-enable your services.'}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>STATUS</div>
                  <span className={`badge ${hasActivePlan ? 'badge-converted' : 'badge-new'}`} style={{ fontWeight: '700', padding: '4px 10px' }}>
                    {isSubscribed ? 'SUBSCRIBED' : isTrialActive ? 'FREE TRIAL' : 'EXPIRED'}
                  </span>
                </div>
                
                {(isSubscribed || isTrialActive) && (
                  <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border-light)', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>TIME LEFT</div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                      {isSubscribed ? getSubscriptionRemainingText() : getTrialRemainingText()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                Choose Your Plan
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* Starter Tier */}
                <div className="glass-panel pricing-card" style={{ 
                  padding: '30px', 
                  borderRadius: '16px',
                  border: user && user.subscriptionPlan === 'starter' ? '2px solid #0070f3' : '1px solid var(--border-light)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: user && user.subscriptionPlan === 'starter' ? 'rgba(0, 112, 243, 0.03)' : 'var(--bg-card)'
                }}>
                  {user && user.subscriptionPlan === 'starter' && (
                    <span className="pricing-tag" style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#0070f3', color: '#fff', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      ACTIVE PLAN
                    </span>
                  )}
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>Starter Tier</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Perfect for growing local businesses seeking automated client capture.</p>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '24px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>Free</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>/ for now</span>
                    </div>
                    
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-purple)' }} />
                        AI WhatsApp Lead Capture & Sync
                      </li>
                      <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-purple)' }} />
                        Calendar Appointment Scheduler
                      </li>
                      <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-purple)' }} />
                        100 Auto-notifications (SMS/WhatsApp)
                      </li>
                      <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-purple)' }} />
                        Basic Dashboard Analytics
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => handlePayment('starter')}
                    disabled={user && (user.subscriptionPlan === 'starter' || user.subscriptionPlan === 'pro')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: user && user.subscriptionPlan === 'starter' 
                        ? 'rgba(0, 112, 243, 0.1)' 
                        : user && user.subscriptionPlan === 'pro'
                          ? 'var(--border-light)'
                          : 'linear-gradient(135deg, #0070f3 0%, #00bdf3 100%)',
                      color: user && (user.subscriptionPlan === 'starter' || user.subscriptionPlan === 'pro') ? 'var(--text-muted)' : '#fff',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: user && (user.subscriptionPlan === 'starter' || user.subscriptionPlan === 'pro') ? 'default' : 'pointer',
                      boxShadow: user && (user.subscriptionPlan === 'starter' || user.subscriptionPlan === 'pro') ? 'none' : '0 4px 14px rgba(0, 112, 243, 0.25)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!(user && (user.subscriptionPlan === 'starter' || user.subscriptionPlan === 'pro'))) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {user && user.subscriptionPlan === 'starter' 
                      ? 'Current Plan (Free)' 
                      : user && user.subscriptionPlan === 'pro'
                        ? 'Starter Plan Tier'
                        : 'Activate Free Plan 🚀'}
                  </button>
                </div>

                {/* Pro Tier */}
                <div className="glass-panel pricing-card" style={{ 
                  padding: '30px', 
                  borderRadius: '16px',
                  border: user && user.subscriptionPlan === 'pro' ? '2px solid var(--accent-purple)' : '1px solid rgba(138, 43, 226, 0.25)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 32px rgba(138, 43, 226, 0.1)',
                  background: user && user.subscriptionPlan === 'pro' ? 'rgba(138, 43, 226, 0.03)' : 'var(--bg-card)'
                }}>
                  <span className="pricing-tag" style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'var(--accent-purple)', color: '#fff', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {user && user.subscriptionPlan === 'pro' ? 'ACTIVE PLAN' : 'RECOMMENDED'}
                  </span>
                  
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>Pro Tier</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Advanced scaling solutions for frontdesk automation and review growth.</p>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '24px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹2,499</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>/ month</span>
                    </div>
                    
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-yellow)' }} />
                        <strong>Uncapped</strong> AI Messages & Lead Routing
                      </li>
                      <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-yellow)' }} />
                        Review Request growth automation
                      </li>
                      <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-yellow)' }} />
                        Google Reviews auto-invitation engine
                      </li>
                      <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-yellow)' }} />
                        Advanced Analytics & CSV Export
                      </li>
                      <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-yellow)' }} />
                        24/7 Dedicated Account Manager
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => handlePayment('pro')}
                    disabled={user && user.subscriptionPlan === 'pro'}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: user && user.subscriptionPlan === 'pro' 
                        ? 'rgba(138, 43, 226, 0.1)' 
                        : 'linear-gradient(135deg, #8a2be2 0%, #da70d6 100%)',
                      color: user && user.subscriptionPlan === 'pro' ? 'var(--text-muted)' : '#fff',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: user && user.subscriptionPlan === 'pro' ? 'default' : 'pointer',
                      boxShadow: user && user.subscriptionPlan === 'pro' ? 'none' : '0 4px 14px rgba(138, 43, 226, 0.25)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!(user && user.subscriptionPlan === 'pro')) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {user && user.subscriptionPlan === 'pro' 
                      ? 'Current Plan' 
                      : user && user.subscriptionPlan === 'starter'
                        ? 'Upgrade to Pro Tier'
                        : 'Subscribe Pro Plan'}
                  </button>
                </div>

              </div>
            </div>

            {/* Billing History (Transaction log) */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
                Transaction & Invoice History
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>DATE</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>DESCRIPTION</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>AMOUNT</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>TRANSACTION ID</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Dynamic Subscription row if subscribed */}
                    {isSubscribed && (
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>
                          {new Date().toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          SaaS {user.subscriptionPlan === 'pro' ? 'Pro Plan' : 'Starter Plan'} Monthly Subscription
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: '700' }}>
                          {user.subscriptionPlan === 'pro' ? '₹2,499.00' : '₹0.00 (Free)'}
                        </td>
                        <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          pay_rzp_{user.trialStart ? new Date(user.trialStart).getTime().toString().slice(-6) : '99812'}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className="badge badge-converted" style={{ fontSize: '0.7rem' }}>SUCCESS</span>
                        </td>
                      </tr>
                    )}
                    
                    {/* Standard Trial Activation log */}
                    {user && user.trialStart && (
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>
                          {new Date(user.trialStart).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          FrontDesk AI 3-Day Free Trial Setup
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: '700' }}>
                          ₹0.00
                        </td>
                        <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          trial_init_{new Date(user.trialStart).getTime().toString().slice(-6)}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className="badge badge-new" style={{ fontSize: '0.7rem' }}>
                            {isTrialActive ? 'ACTIVE' : 'COMPLETED'}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                            ? `Next Billing: July 2, 2026 (Free)` 
                            : 'Access WhatsApp AI Engine (Free)'}
                        </p>
                      </div>
                      
                      <div>
                        {user.isSubscribed ? (
                          <button 
                            onClick={() => handlePayment('starter')}
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
                            onClick={() => handlePayment('starter')}
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
                            {isPaymentLoading ? '...' : 'Activate Free Plan'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="usage-meter-group">
                    <div className="usage-meter-header">
                      <span>AI WhatsApp Responses</span>
                      <span>
                        {user && typeof user.usageCount === 'number' ? user.usageCount : 0} / {user && typeof user.limit === 'number' ? (user.limit >= 100000 ? 'Unlimited' : `${user.limit} Msgs`) : '500 Msgs'}
                      </span>
                    </div>
                    <div className="usage-meter-bar">
                      <div 
                        className="usage-meter-fill" 
                        style={{ 
                          width: `${Math.min(100, (((user && user.usageCount) || 0) / ((user && user.limit) || 500)) * 100)}%`, 
                          backgroundColor: 'var(--accent-blue)' 
                        }}
                      ></div>
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
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={18} style={{ color: 'var(--accent-purple)' }} />
                  Business & Profile Settings
                </h3>
                  <form key={user ? `${user.email}_${user.businessName || ''}_${user.name || ''}_${user.businessWebsite || ''}_${user.businessAddress || ''}_${user.businessPhone || ''}_${user.aiPersona || ''}_${user.googleApiKey || ''}_${user.googlePlaceId || ''}` : 'profile-form'} onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  
                  const updatedName = form.profileName.value.trim();
                  const updatedBusinessName = form.businessName ? form.businessName.value.trim() : (user.businessName || '');
                  const updatedWebsite = form.businessWebsite ? form.businessWebsite.value.trim() : (user.businessWebsite || '');
                  const updatedPhone = form.businessPhone ? form.businessPhone.value.trim() : (user.businessPhone || '');
                  const updatedAddress = form.businessAddress ? form.businessAddress.value.trim() : (user.businessAddress || '');
                  const updatedTone = form.aiPersona ? form.aiPersona.value : (user.aiPersona || 'Friendly');
                  const updatedGoogleApiKey = form.googleApiKey ? form.googleApiKey.value : (user.googleApiKey || '');
                  const updatedGooglePlaceId = form.googlePlaceId ? form.googlePlaceId.value : (user.googlePlaceId || '');

                  if (!validateFullName(updatedName)) {
                    alert("Please enter a valid name (at least 2 letters, no special characters or numbers).");
                    return;
                  }
                  if (form.businessName && (!updatedBusinessName || updatedBusinessName.length < 2)) {
                    alert("Please enter a valid business public name (at least 2 characters).");
                    return;
                  }
                  if (form.businessWebsite && updatedWebsite && !validateUrl(updatedWebsite)) {
                    alert("Please enter a valid business website URL.");
                    return;
                  }
                  const cleanedPhone = formatPhoneWithDefault91(updatedPhone);
                  if (form.businessPhone && !validatePhoneNumber(cleanedPhone)) {
                    alert("Please enter a valid business phone number (e.g., +919876543210).");
                    return;
                  }
                  if (form.businessAddress && (!updatedAddress || updatedAddress.length < 5)) {
                    alert("Please enter a complete business address (at least 5 characters).");
                    return;
                  }

                  const updatedUser = {
                    ...user,
                    name: updatedName,
                    businessName: updatedBusinessName,
                    businessWebsite: updatedWebsite,
                    businessPhone: cleanedPhone,
                    businessAddress: updatedAddress,
                    aiPersona: updatedTone,
                    googleApiKey: updatedGoogleApiKey,
                    googlePlaceId: updatedGooglePlaceId
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
                  if (user.role !== 'staff' || user.permissions?.canEditSettings) {
                    const updatedConfigs = {
                      ...nicheConfigs,
                      [activeNiche]: {
                        ...nicheConfigs[activeNiche],
                        businessName: updatedBusinessName,
                        systemPrompt: `You are the primary AI Front Desk agent for ${updatedBusinessName}, a premium ${currentConfig.businessName || activeNiche} located at ${updatedAddress}. 
Your contact phone is ${cleanedPhone} and website is ${updatedWebsite}.
Your personality is ${updatedTone} (always polite, helpful, and concise).
Your main tasks are:
1. Capture client full name, WhatsApp number, requested service, and location.
2. Confirm slots and schedule appointments.
3. Share the Google Review link: ${nicheConfigs[activeNiche].reviewUrl} to invite feedback.`
                      }
                    };
                    setNicheConfigs(updatedConfigs);
                    localStorage.setItem(`frontdesk_configs_${user.email.toLowerCase()}`, JSON.stringify(updatedConfigs));
                  }

                  triggerToast("Profile and business details updated!", "green");
                  addActivity(`Updated business coordinates for ${updatedBusinessName}`, "success");
                  
                  // Fetch updated Google reviews immediately
                  fetchGoogleReviews(updatedUser);

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

                  {(user.role !== 'staff' || user.permissions?.canEditSettings) && (
                    <>
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
                          <select 
                            value={activeNiche} 
                            onChange={(e) => {
                              if (e.target.value === 'custom_add') {
                                setShowAddNicheModal(true);
                              } else {
                                setActiveNiche(e.target.value);
                              }
                            }} 
                            style={{ 
                              width: '100%', 
                              padding: '10px', 
                              borderRadius: '8px', 
                              border: '1px solid var(--border-light)', 
                              background: 'var(--bg-secondary)', 
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }} 
                          >
                            {Object.keys(nicheConfigs).map(key => (
                              <option key={key} value={key}>
                                {nicheConfigs[key].logo || '💼'} {getCategoryDisplayName(key)}
                              </option>
                            ))}
                            <option value="custom_add" style={{ fontWeight: 'bold', color: 'var(--accent-purple)' }}>
                              ➕ Add Custom Category...
                            </option>
                          </select>
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

                      <div style={{ marginTop: '20px', borderTop: '1px dashed var(--border-light)', paddingTop: '16px', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Star size={14} style={{ color: 'var(--accent-yellow)' }} />
                          Google Place Live Reviews Setup
                        </h4>

                        {/* Google Places Autocomplete Finder */}
                        <div className="form-group" style={{ marginBottom: '14px', position: 'relative' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <Search size={12} style={{ color: 'var(--accent-primary)' }} />
                            Search Clinic/Salon to Auto-fill Place ID & Key
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              placeholder="Type 'Zenith', 'Glow', 'Apex' or 'Glamour'..."
                              value={placeSearchInput}
                              onChange={handlePlaceSearchChange}
                              style={{
                                paddingLeft: '32px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                width: '100%',
                                fontSize: '0.85rem'
                              }}
                            />
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            {placeDropdownOpen && placeSearchInput && (
                              <button 
                                type="button" 
                                onClick={() => { setPlaceSearchInput(''); setPlaceDropdownOpen(false); }}
                                style={{
                                  position: 'absolute',
                                  right: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          
                          {placeDropdownOpen && placeMatches.length > 0 && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-light)',
                              borderRadius: '8px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                              zIndex: 100,
                              marginTop: '4px',
                              maxHeight: '200px',
                              overflowY: 'auto'
                            }}>
                              {placeMatches.map((match, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectPlace(match)}
                                  style={{
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    borderBottom: idx === placeMatches.length - 1 ? 'none' : '1px solid var(--border-light)',
                                    transition: 'background 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    textAlign: 'left'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                >
                                  <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{match.name}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{match.address}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="form-group">
                            <label>Google Places API Key</label>
                            <input 
                              type="password" 
                              name="googleApiKey" 
                              defaultValue={user.googleApiKey || ''} 
                              placeholder="e.g. AIzaSy..." 
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Google Place ID</label>
                            <input 
                              type="text" 
                              name="googlePlaceId" 
                              defaultValue={user.googlePlaceId || ''} 
                              placeholder="e.g. ChIJN1t_t..." 
                            />
                          </div>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          If Place ID is left blank, the system will fall back to beautiful simulated mock reviews.
                        </p>
                      </div>

                      <div className="form-group">
                        <label>AI Assistant Tone</label>
                        <select name="aiPersona" defaultValue={user.aiPersona || 'Friendly'}>
                          <option value="Professional">👔 Professional / Formal</option>
                          <option value="Friendly">🌸 Warm & Friendly</option>
                          <option value="Salesy">⚡ Energetic & Sales-focused</option>
                        </select>
                      </div>
                    </>
                  )}

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                    Save Profile Details
                  </button>
                </form>

                {/* Danger Zone */}
                {user && user.role !== 'staff' && (
                  <div style={{ marginTop: '28px', borderTop: '1px solid rgba(239, 68, 68, 0.4)', paddingTop: '20px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ef4444', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ⚠️ Danger Zone
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                      Once you delete your account, there is no going back. All your WhatsApp AI configurations, live chats, captured leads, and scheduled appointments will be permanently removed from our servers.
                    </p>
                    <button 
                      type="button" 
                      onClick={() => {
                        setDeleteReason('');
                        setDeleteFeedback('');
                        setDeleteConfirmationText('');
                        setShowDeleteAccountModal(true);
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: '1px solid #ef4444', 
                        background: 'rgba(239, 68, 68, 0.08)', 
                        color: '#ef4444', 
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)' 
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = '#ef4444'; }}
                    >
                      Delete Account Permanently
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Team Members Section */}
            {user.role !== 'staff' && (
              <div className="glass-panel" style={{ padding: '24px', marginTop: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <Users size={18} style={{ color: 'var(--accent-blue)' }} />
                  Manage Team Members (Staff Roles)
                </h3>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!validateFullName(newStaffName)) {
                    alert("Please enter a valid staff name (at least 2 letters, no special characters or numbers).");
                    return;
                  }
                  if (!validateEmailAddress(newStaffEmail)) {
                    alert("Please enter a valid staff email address.");
                    return;
                  }
                  try {
                    const res = await authenticatedFetch(`${BACKEND_URL}/v1/staff`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: newStaffName,
                        email: newStaffEmail,
                        role: newStaffRole,
                        permissions: {
                          canDeleteLeads: permDeleteLeads,
                          canViewBilling: permViewBilling,
                          canEditSettings: permEditSettings
                        }
                      })
                    });
                    if (res.ok) {
                      triggerToast("Team member added successfully!", "green");
                      setNewStaffName('');
                      setNewStaffEmail('');
                      setPermDeleteLeads(false);
                      setPermViewBilling(false);
                      setPermEditSettings(false);
                      fetchStaff();
                    }
                  } catch (err) {
                    triggerToast("Error adding team member.", "red");
                  }
                }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Staff Name</label>
                      <input type="text" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} required placeholder="e.g. John Doe" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Staff Email</label>
                      <input type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} required placeholder="e.g. john@business.com" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Role</label>
                      <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)}>
                        <option value="staff">Staff Member (Custom Permissions)</option>
                        <option value="admin">Admin Helper (Full Control)</option>
                      </select>
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>Add Member</button>
                  </div>
                  
                  {newStaffRole === 'staff' && (
                    <div style={{ display: 'flex', gap: '24px', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Permissions:</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={permDeleteLeads} onChange={e => setPermDeleteLeads(e.target.checked)} />
                        <span>Can Delete Leads & Appointments</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={permViewBilling} onChange={e => setPermViewBilling(e.target.checked)} />
                        <span>Can View Billing & Subscription</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={permEditSettings} onChange={e => setPermEditSettings(e.target.checked)} />
                        <span>Can Edit Business Profile</span>
                      </label>
                    </div>
                  )}
                </form>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>NAME</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>EMAIL</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>ROLE</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>PERMISSIONS</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No team members added yet.</td>
                        </tr>
                      ) : (
                        staffList.map(member => (
                          <tr key={member.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '12px 8px', fontWeight: '600' }}>{member.name}</td>
                            <td style={{ padding: '12px 8px' }}>{member.email}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <span className={`badge ${member.role === 'admin' ? 'badge-new' : 'badge-followed_up'}`}>
                                {member.role === 'admin' ? 'Admin' : 'Staff'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              {member.role === 'admin' ? (
                                <span style={{
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  color: 'var(--accent-green)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.65rem',
                                  fontWeight: 'bold'
                                }}>Full Access</span>
                              ) : (
                                (() => {
                                  const list = [];
                                  if (member.permissions?.canDeleteLeads) list.push({ label: 'Delete CRM', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' });
                                  if (member.permissions?.canViewBilling) list.push({ label: 'Billing', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' });
                                  if (member.permissions?.canEditSettings) list.push({ label: 'Edit Profile', bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' });
                                  
                                  if (list.length === 0) return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>;
                                  return (
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                      {list.map(p => (
                                        <span key={p.label} style={{
                                          background: p.bg,
                                          color: p.color,
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          fontSize: '0.65rem',
                                          fontWeight: 'bold'
                                        }}>{p.label}</span>
                                      ))}
                                    </div>
                                  );
                                })()
                              )}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <button onClick={async () => {
                                try {
                                  const res = await authenticatedFetch(`${BACKEND_URL}/v1/staff/${member.id}`, { method: 'DELETE' });
                                  if (res.ok) {
                                    triggerToast("Member removed.", "green");
                                    fetchStaff();
                                  }
                                } catch (err) {
                                  triggerToast("Error removing member.", "red");
                                }
                              }} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>Remove</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'livechat' && (
          <div className={`handoff-container ${selectedConvId ? 'chat-active' : ''}`}>
            {/* Left sidebar - conversations list */}
            <div className="glass-panel handoff-sidebar">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>Active Chats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {conversations.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>No active chats.</p>
                ) : (
                  conversations.map(conv => (
                    <div 
                      key={conv.id} 
                      onClick={() => setSelectedConvId(conv.id)}
                      style={{ 
                        padding: '12px', 
                        borderRadius: '8px', 
                        background: selectedConvId === conv.id ? 'var(--hover-bg)' : 'rgba(255,255,255,0.03)', 
                        border: selectedConvId === conv.id ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)', 
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>{conv.customer_name}</span>
                        <span className={`badge ${conv.status === 'human' ? 'badge-new' : 'badge-converted'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                          {conv.status === 'human' ? 'Staff' : 'AI'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', margin: 0 }}>
                        {conv.last_message || "No messages."}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right sidebar - chat pane */}
            <div className="glass-panel handoff-chatpane">
              {selectedConvId ? (
                (() => {
                  const currentConv = conversations.find(c => c.id === selectedConvId) || {};
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button 
                            className="handoff-back-btn" 
                            onClick={() => setSelectedConvId(null)}
                            title="Back to chat list"
                          >
                            <ArrowLeft size={18} />
                          </button>
                          <div>
                            <h4 style={{ fontWeight: '700', margin: 0 }}>{currentConv.customer_name}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Phone: {currentConv.customer_phone}</p>
                          </div>
                        </div>
                        <button 
                          onClick={async () => {
                            const newStatus = currentConv.status === 'human' ? 'ai' : 'human';
                            try {
                              const res = await authenticatedFetch(`${BACKEND_URL}/v1/conversations/${selectedConvId}/status`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: newStatus })
                              });
                              if (res.ok) {
                                triggerToast(`Chat handed over to ${newStatus === 'human' ? 'Staff member' : 'AI Assistant'}.`, "green");
                                fetchConversations();
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="btn-primary" 
                          style={{ 
                            background: currentConv.status === 'human' ? 'linear-gradient(135deg, #1e8e3e 0%, #34a853 100%)' : 'linear-gradient(135deg, #8a2be2 0%, #da70d6 100%)', 
                            padding: '8px 16px', 
                            fontSize: '0.75rem',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          {currentConv.status === 'human' ? '✅ AI Response Active' : '🙋‍♂️ Pause AI & Takeover'}
                        </button>
                      </div>

                      {/* Messages scroll pane */}
                      <div className="handoff-messages-container">
                        {activeMessages.length === 0 ? (
                          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '20px' }}>Loading conversation history...</p>
                        ) : (
                          activeMessages.map(msg => (
                            <div 
                              key={msg.id} 
                              style={{ 
                                alignSelf: msg.sender === 'customer' ? 'flex-start' : 'flex-end',
                                background: msg.sender === 'customer' ? '#202c33' : 'linear-gradient(135deg, #0070f3 0%, #00dfd8 100%)',
                                color: '#fff',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                maxWidth: '70%',
                                fontSize: '0.8rem',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                              }}
                            >
                              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.message_text}</p>
                              <span style={{ display: 'block', textAlign: 'right', fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Reply textbox */}
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!replyText.trim()) return;
                        try {
                          const res = await authenticatedFetch(`${BACKEND_URL}/v1/conversations/${selectedConvId}/reply`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: replyText })
                          });
                          if (res.ok) {
                            setReplyText('');
                            fetchMessages(selectedConvId);
                            fetchConversations();
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }} style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="text" 
                          placeholder="Type reply as staff member..." 
                          value={replyText} 
                          onChange={e => setReplyText(e.target.value)} 
                          style={{ flexGrow: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.8rem' }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>Send</button>
                      </form>
                    </>
                  );
                })()
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--text-muted)' }}>
                  <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.85rem' }}>Select a conversation from the sidebar to view chat logs and reply manually.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: AI Knowledge Base */}
        {activeTab === 'knowledge' && (
          <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* File Upload Grid */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <Database size={18} style={{ color: 'var(--accent-purple)' }} />
                Grounding Knowledge corpus (Upload PDF/TXT/DOCX)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed var(--border-light)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center' }}>
                  <UploadCloud size={32} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Choose a Knowledge file</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Supports PDF, TXT or Word DOCX (Max 5MB)</p>
                  </div>
                  
                  <input 
                    type="file" 
                    id="kb-upload-input" 
                    style={{ display: 'none' }} 
                    accept=".pdf,.docx,.txt"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setIsUploading(true);
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        let token = 'kartikparashar15@gmail.com';
                        if (user && user.role === 'admin') {
                          token = user.email;
                        } else if (auth.currentUser) {
                          try {
                            token = await auth.currentUser.getIdToken(true);
                          } catch (tErr) {
                            console.error("Error getting idToken:", tErr);
                            token = user ? user.email : 'kartikparashar15@gmail.com';
                          }
                        } else if (user) {
                          token = user.email;
                        }

                        const res = await fetch(`${BACKEND_URL}/v1/knowledge-base/upload`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` },
                          body: formData
                        });
                        if (res.ok) {
                          triggerToast("Document uploaded and indexed successfully!", "green");
                          fetchKnowledgeBase();
                        } else {
                          const err = await res.json();
                          triggerToast(`Upload failed: ${err.error}`, "red");
                        }
                      } catch (err) {
                        triggerToast("Network error uploading file.", "red");
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                  />
                  <button 
                    onClick={() => document.getElementById('kb-upload-input').click()}
                    className="btn-secondary" 
                    disabled={isUploading}
                    style={{ padding: '8px 16px', fontSize: '0.75rem' }}
                  >
                    {isUploading ? 'Uploading...' : 'Browse Local Files'}
                  </button>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px' }}>Indexed Documents</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {kbFiles.length === 0 ? (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', textAlign: 'center' }}>No grounding files added yet.</p>
                    ) : (
                      kbFiles.map(file => (
                        <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{file.file_name}</span>
                            <span className="badge badge-new" style={{ fontSize: '0.6rem', padding: '2px 6px', marginLeft: '8px', textTransform: 'uppercase' }}>{file.file_type}</span>
                          </div>
                          <button 
                            onClick={async () => {
                              try {
                                const res = await authenticatedFetch(`${BACKEND_URL}/v1/knowledge-base/${file.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  triggerToast("File deleted from Knowledge Base.", "green");
                                  fetchKnowledgeBase();
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Q&A / FAQ section */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <BookOpen size={18} style={{ color: 'var(--accent-blue)' }} />
                Instant FAQ Library (Grounding Context Q&A)
              </h3>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await authenticatedFetch(`${BACKEND_URL}/v1/faqs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: newFaqQuestion, answer: newFaqAnswer })
                  });
                  if (res.ok) {
                    triggerToast("FAQ added successfully!", "green");
                    setNewFaqQuestion('');
                    setNewFaqAnswer('');
                    fetchKnowledgeBase();
                  }
                } catch (err) {
                  console.error(err);
                }
              }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end', marginBottom: '24px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Question</label>
                  <input type="text" value={newFaqQuestion} onChange={e => setNewFaqQuestion(e.target.value)} required placeholder="e.g. Do you accept insurance?" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'white' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Answer</label>
                  <input type="text" value={newFaqAnswer} onChange={e => setNewFaqAnswer(e.target.value)} required placeholder="e.g. Yes, we support HDFC, Star Health and ICICI insurance." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'white' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>Add FAQ</button>
              </form>

              {/* FAQ Search Bar */}
              <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '8px 12px', gap: '8px' }}>
                  <Search size={16} style={{ color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search FAQs by question or answer..." 
                    value={faqSearchQuery}
                    onChange={e => setFaqSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: 'black' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {kbFaqs.length === 0 ? (
                  <p style={{ gridColumn: 'span 2', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No FAQs configured.</p>
                ) : (
                  (() => {
                    const filtered = kbFaqs.filter(faq => 
                      (faq.question || '').toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
                      (faq.answer || '').toLowerCase().includes(faqSearchQuery.toLowerCase())
                    );
                    if (filtered.length === 0) {
                      return <p style={{ gridColumn: 'span 2', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No matching FAQs found.</p>;
                    }
                    return filtered.map(faq => (
                      <div key={faq.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '0.8rem', margin: '0 0 4px 0' }}>Q: {faq.question}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>A: {faq.answer}</p>
                        </div>
                        <button 
                          onClick={async () => {
                            try {
                              const res = await authenticatedFetch(`${BACKEND_URL}/v1/faqs/${faq.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                triggerToast("FAQ deleted.", "green");
                                fetchKnowledgeBase();
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="btn-secondary" 
                          style={{ alignSelf: 'flex-start', padding: '4px 8px', fontSize: '0.7rem', color: 'var(--accent-red)', borderColor: 'var(--accent-red)', cursor: 'pointer' }}
                        >
                          Delete FAQ
                        </button>
                      </div>
                    ));
                  })()
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Admin Panel */}
        {activeTab === 'admin_panel' && (
          <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <Shield size={18} style={{ color: 'var(--accent-pink)' }} />
                SaaS Superadmin Management Console
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                <div style={{ flexGrow: 1, position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Search businesses by email or name..." 
                    value={adminSearch}
                    onChange={e => setAdminSearch(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.8rem', background: 'white' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>BUSINESS EMAIL</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>BUSINESS NAME</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>ROLE</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>ONBOARDED</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>SUBSCRIPTION</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>TRIAL START</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>SUSPENSION STATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminBusinesses
                      .filter(biz => 
                        biz.email.toLowerCase().includes(adminSearch.toLowerCase()) || 
                        (biz.business_name && biz.business_name.toLowerCase().includes(adminSearch.toLowerCase()))
                      )
                      .map(biz => (
                        <tr key={biz.email} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px 8px', fontWeight: '700' }}>{biz.email}</td>
                          <td style={{ padding: '12px 8px' }}>{biz.business_name || 'N/A'}</td>
                          <td style={{ padding: '12px 8px', textTransform: 'uppercase' }}>{biz.role}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className={`badge ${biz.is_onboarded === 1 ? 'badge-converted' : 'badge-noshow'}`}>
                              {biz.is_onboarded === 1 ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className={`badge ${biz.is_subscribed === 1 ? 'badge-converted' : 'badge-noshow'}`}>
                              {biz.is_subscribed === 1 ? `${biz.subscription_plan}` : 'Trial / None'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>{biz.trial_start ? new Date(biz.trial_start).toLocaleDateString() : 'N/A'}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <button 
                              onClick={async () => {
                                const newSusp = biz.is_suspended !== 1;
                                try {
                                  const res = await authenticatedFetch(`${BACKEND_URL}/v1/admin/businesses/suspend`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ targetEmail: biz.email, isSuspended: newSusp })
                                  });
                                  if (res.ok) {
                                    triggerToast(`Account suspension toggled.`, "green");
                                    fetchAdminBusinesses();
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="btn-secondary" 
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.75rem', 
                                color: biz.is_suspended === 1 ? 'var(--accent-green)' : 'var(--accent-red)',
                                borderColor: biz.is_suspended === 1 ? 'var(--accent-green)' : 'var(--accent-red)',
                                cursor: 'pointer'
                              }}
                            >
                              {biz.is_suspended === 1 ? 'Unsuspend' : 'Suspend Account'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* WhatsApp Playground Sidebar */}
      <section className={`simulator-panel ${isSimulatorOpen ? 'mobile-open' : ''}`} style={{
        maxWidth: showSimDebug ? '820px' : '420px',
        transition: 'max-width 0.3s ease-in-out'
      }}>
        
        <div className="simulator-mobile-close">
          <button className="btn-close-sim" onClick={() => setIsSimulatorOpen(false)}>
            <X size={18} />
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '12px' }}>
          <div className="simulator-header-text" style={{ margin: 0, textAlign: 'left' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
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
            <p style={{ margin: '4px 0 0 0' }}>Test the customer AI chat flow live</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button"
              onClick={() => setShowSimDebug(prev => !prev)}
              style={{
                background: showSimDebug ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Console</span>
              <span className={`badge ${showSimDebug ? 'badge-new' : 'badge-noshow'}`} style={{ fontSize: '0.6rem', padding: '2px 4px' }}>
                {showSimDebug ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-light)', width: 'fit-content' }}>
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

        <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', width: '100%', height: 'calc(100% - 130px)', overflow: 'hidden', justifyContent: 'center' }}>
          {/* Phone Mockup Column */}
          <div className="phone-mockup" style={{ flexShrink: 0 }}>
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

          {/* AI Debug Console Column */}
          {showSimDebug && (
            <div style={{
              flexGrow: 1,
              background: '#0a0d16',
              border: '1px solid var(--border-light)',
              borderRadius: '24px',
              padding: '16px',
              color: '#4af626', // Matrix green
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
              overflowY: 'auto',
              minWidth: '280px',
              textAlign: 'left'
            }}>
              <div style={{ borderBottom: '1px solid #1a2333', paddingBottom: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4af626', display: 'inline-block' }}></span>
                  AI REASONING LOGS
                </span>
                <button 
                  onClick={() => setSimDebugLogs([])} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}
                >
                  Clear
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flexGrow: 1, paddingRight: '4px' }}>
                {simDebugLogs.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
                    Send messages in the phone simulator to observe realtime intent classification logs.
                  </div>
                ) : (
                  simDebugLogs.map((log, index) => (
                    <div key={index} style={{ borderBottom: '1px solid #141c2c', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.65rem', color: '#8b949e', marginBottom: '4px' }}>
                        <span>[{log.timestamp}] EVENT: {log.event}</span>
                        <span style={{ color: log.event === 'SYSTEM_INIT' ? '#58a6ff' : '#4af626' }}>✓</span>
                      </div>
                      <div style={{ color: 'var(--text-primary)', marginBottom: '4px', fontWeight: 'bold' }}>
                        {log.message}
                      </div>
                      {log.details && (
                        <div style={{ paddingLeft: '8px', borderLeft: '2px solid #21262d', color: '#8b949e', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.7rem' }}>
                          {log.details.engine && <div><span style={{ color: '#58a6ff' }}>Engine:</span> {log.details.engine}</div>}
                          {log.details.target && <div><span style={{ color: '#ff7b72' }}>Classified Intent:</span> {log.details.target}</div>}
                          {log.details.confidence && <div><span style={{ color: '#d2a8ff' }}>Confidence:</span> {log.details.confidence}</div>}
                          {log.details.toneApplied && <div><span style={{ color: '#79c0ff' }}>Tone applied:</span> {log.details.toneApplied}</div>}
                          {log.details.matchedKeyword && log.details.matchedKeyword !== 'None' && <div><span style={{ color: '#ff7b72' }}>Keywords:</span> {log.details.matchedKeyword}</div>}
                          {log.details.parameters && (
                            <div>
                              <span style={{ color: '#a5d6ff' }}>Params:</span> {JSON.stringify(log.details.parameters)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </section>

      {/* Floating Action Button for Mobile Simulator */}
      <button className="floating-sim-fab" onClick={() => setIsSimulatorOpen(true)}>
        <Smartphone size={18} />
        <span>Simulator</span>
      </button>

      {/* Add Custom Niche Modal */}
      {showAddNicheModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
            animation: 'fdUp 0.3s ease',
            color: 'var(--text-primary)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Add Custom Business Niche</h3>
              <button 
                onClick={() => setShowAddNicheModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateNiche} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)' }}>Business Category ID (Single Word, lowercase e.g., gym, restaurant, clinic)</label>
                <input 
                  type="text" 
                  name="nicheId" 
                  required 
                  placeholder="e.g. gym"
                  pattern="^[a-z0-9_]+$"
                  title="Only lowercase letters, numbers, and underscores allowed."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)' }}>Business Name</label>
                <input 
                  type="text" 
                  name="businessName" 
                  required 
                  placeholder="e.g. FitLife Fitness Gym"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>



              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)' }}>Business Welcome Greeting</label>
                <textarea 
                  name="greetingMessage" 
                  required 
                  rows="3"
                  placeholder="Welcome greeting sent to clients on WhatsApp..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddNicheModal(false)}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.85rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.85rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    background: 'var(--accent-blue)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: '600'
                  }}
                >
                  Create Niche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
            animation: 'fdUp 0.3s ease',
            color: 'var(--text-primary)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#ef4444' }}>Permanently Delete Account</h3>
              <button 
                onClick={() => setShowDeleteAccountModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeleteAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '4px' }}>
                <p style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600', margin: 0, lineHeight: '1.4' }}>
                  Warning: All configurations, chats, templates, leads, and staff listings will be permanently deleted and cannot be recovered.
                </p>
              </div>

              {/* Question 1: Reason for Deleting */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Why are you deleting your account? <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select 
                  value={deleteReason} 
                  onChange={(e) => setDeleteReason(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <option value="">-- Select a reason --</option>
                  <option value="too_expensive">💰 Pricing / Too expensive</option>
                  <option value="setup_complexity">⚙️ Technical issues / Setup too complex</option>
                  <option value="no_longer_needed">💼 No longer need an AI Receptionist</option>
                  <option value="alternative_found">🔄 Found another alternative tool</option>
                  <option value="other">✍️ Other (Please specify below)</option>
                </select>
              </div>

              {/* Question 2: Additional Feedback */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Can you share any feedback or suggestions? (Optional)
                </label>
                <textarea 
                  value={deleteFeedback} 
                  onChange={(e) => setDeleteFeedback(e.target.value)} 
                  placeholder="How can we improve FrontDesk AI?" 
                  rows="3"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.85rem' }}
                />
              </div>

              {/* Question 3: Confirmation Input to Prevent Accidental Click */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  Please type your registered email address <strong style={{ color: 'var(--accent-blue)', wordBreak: 'break-all' }}>{user?.email}</strong> to confirm: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  value={deleteConfirmationText} 
                  onChange={(e) => setDeleteConfirmationText(e.target.value)} 
                  placeholder="Type your email address here..." 
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowDeleteAccountModal(false)}
                  style={{ 
                    padding: '10px 18px', 
                    fontSize: '0.85rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isDeletingAccount || deleteConfirmationText.trim().toLowerCase() !== (user?.email || '').toLowerCase() || !deleteReason}
                  style={{ 
                    padding: '10px 18px', 
                    fontSize: '0.85rem', 
                    borderRadius: '8px', 
                    cursor: deleteConfirmationText.trim().toLowerCase() === (user?.email || '').toLowerCase() && deleteReason ? 'pointer' : 'not-allowed',
                    background: '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '600',
                    opacity: deleteConfirmationText.trim().toLowerCase() === (user?.email || '').toLowerCase() && deleteReason ? 1 : 0.5
                  }}
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
