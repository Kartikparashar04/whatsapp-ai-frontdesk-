import React from 'react';
import { 
  validateUrl, 
  validatePhoneNumber, 
  formatPhoneWithDefault91 
} from '../utils/validation';

const BACKEND_URL = 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:3000'
    : (import.meta.env.VITE_BACKEND_URL || 'https://app.frontdeskai.shop');

export default function OnboardingWizard({ user, setUser, nicheConfigs, setNicheConfigs, triggerToast, addActivity, authenticatedFetch }) {
  const [step, setStep] = React.useState(1);
  const [niche, setNiche] = React.useState(user.niche || 'dental');
  const [businessName, setBusinessName] = React.useState('');
  const [businessWebsite, setBusinessWebsite] = React.useState('');
  const [businessPhone, setBusinessPhone] = React.useState('');
  const [businessAddress, setBusinessAddress] = React.useState('');
  const [aiPersona, setAiPersona] = React.useState('Friendly');
  const [greetingMessage, setGreetingMessage] = React.useState('');

  React.useEffect(() => {
    const activeConfig = nicheConfigs[niche];
    if (activeConfig) {
      // Replace fallback placeholder if needed, otherwise use greeting from template
      const templateGreeting = activeConfig.greetingMessage || '';
      const personalizedGreeting = templateGreeting.replace(/Zenith Dental|Glow & Style Salon/g, businessName || activeConfig.businessName);
      setGreetingMessage(personalizedGreeting || `Hello! Welcome to ${businessName || activeConfig.businessName || 'our business'}. I'm your AI front desk assistant. How can I help you today?`);
    } else {
      setGreetingMessage(`Hello! Welcome to ${businessName || 'our business'}. I'm your AI front desk assistant. How can I help you today?`);
    }
  }, [niche, businessName, nicheConfigs]);

  const handleNext = () => {
    if (step === 1) {
      if (!businessName.trim() || businessName.trim().length < 2) {
        alert("Please enter a valid business name (at least 2 characters).");
        return;
      }
      if (businessWebsite.trim() && !validateUrl(businessWebsite)) {
        alert("Please enter a valid business website URL (e.g., https://mybusiness.com).");
        return;
      }
    } else if (step === 2) {
      const cleanedPhone = formatPhoneWithDefault91(businessPhone);
      if (!validatePhoneNumber(cleanedPhone)) {
        alert("Please enter a valid business phone number (e.g., +919876543210).");
        return;
      }
      setBusinessPhone(cleanedPhone);
      
      if (!businessAddress.trim() || businessAddress.trim().length < 5) {
        alert("Please enter a complete business address (at least 5 characters).");
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
    if (!greetingMessage.trim() || greetingMessage.trim().length < 10) {
      alert("Please write a custom welcome greeting message (at least 10 characters).");
      return;
    }
    
    const cleanedPhone = businessPhone.replace(/[\s\-\(\)]/g, '');
    const trimmedWebsite = businessWebsite.trim();
    const profilesLocal = localStorage.getItem('frontdesk_user_profiles');
    const profiles = profilesLocal ? JSON.parse(profilesLocal) : {};
    
    const systemPromptText = `You are the primary AI Front Desk agent for ${businessName.trim()}, a premium ${nicheConfigs[niche]?.businessName || niche} located at ${businessAddress.trim()}. 
Your contact phone is ${cleanedPhone} and website is ${trimmedWebsite}.
Your personality is ${aiPersona} (always polite, helpful, and concise).
Your main tasks are:
1. Capture client full name, WhatsApp number, requested service, and location.
2. Confirm slots and schedule appointments.
3. Share the Google Review link: ${nicheConfigs[niche]?.reviewUrl || ''} to invite feedback.`;

    const updatedUser = {
      ...user,
      isOnboarded: true,
      niche: niche,
      businessName: businessName.trim(),
      businessPhone: cleanedPhone,
      businessAddress: businessAddress.trim(),
      businessWebsite: trimmedWebsite,
      aiPersona: aiPersona,
      systemPrompt: systemPromptText,
      greetingMessage: greetingMessage.trim(),
      reviewUrl: nicheConfigs[niche]?.reviewUrl || ''
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
        businessName: businessName.trim(),
        greetingMessage: greetingMessage.trim(),
        systemPrompt: systemPromptText
      }
    };
    
    setNicheConfigs(updatedConfigs);
    localStorage.setItem(`frontdesk_configs_${user.email.toLowerCase()}`, JSON.stringify(updatedConfigs));
    
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
          <img src="/app_icon.png" className="logo-icon" style={{ margin: '0 auto 12px auto', width: '48px', height: '48px', objectFit: 'cover' }} alt="FrontDesk AI Logo" />
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
              
              <div className="onboarding-niche-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '12px', 
                maxHeight: '260px', 
                overflowY: 'auto', 
                padding: '8px 4px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.4)'
              }}>
                {Object.keys(nicheConfigs).map(key => (
                  <div 
                    key={key}
                    className={`onboarding-niche-select-card ${niche === key ? 'selected' : ''}`}
                    onClick={() => setNiche(key)}
                    style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span className="niche-emoji" style={{ fontSize: '1.5rem' }}>{nicheConfigs[key].logo || '💼'}</span>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: '4px 0 0 0' }}>{nicheConfigs[key].businessName}</h4>
                    <p style={{ fontSize: '0.7rem', opacity: '0.8', margin: 0, lineHeight: '1.3' }}>
                      {nicheConfigs[key].systemPrompt ? nicheConfigs[key].systemPrompt.split('.')[0] + '.' : `Setup custom front desk assistant.`}
                    </p>
                  </div>
                ))}
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
