export const INITIAL_LEADS = [
  {
    id: 'l-1',
    name: 'Anjali Sharma',
    phone: '+91 98765 43210',
    requirement: 'Full Teeth Whitening & Polishing',
    budget: '₹4,500',
    location: 'Indiranagar, Bangalore',
    date: '2026-05-28T14:32:00Z',
    status: 'converted',
    niche: 'dental',
    source: 'WhatsApp AI'
  },
  {
    id: 'l-2',
    name: 'Rohan Verma',
    phone: '+91 99123 45678',
    requirement: 'Root Canal Consultation',
    budget: '₹6,000',
    location: 'Koramangala, Bangalore',
    date: '2026-05-29T10:15:00Z',
    status: 'new',
    niche: 'dental',
    source: 'WhatsApp AI'
  },
  {
    id: 'l-3',
    name: 'Priyanka Sen',
    phone: '+91 95555 88888',
    requirement: 'Balayage Hair Coloring & Hair Spa',
    budget: '₹7,500',
    location: 'HSR Layout, Bangalore',
    date: '2026-05-29T11:40:00Z',
    status: 'followed_up',
    niche: 'salon',
    source: 'WhatsApp AI'
  },
  {
    id: 'l-4',
    name: 'Amit Patel',
    phone: '+91 98222 33333',
    requirement: 'Dental Implants Pricing',
    budget: '₹35,000',
    location: 'Whitefield, Bangalore',
    date: '2026-05-27T09:05:00Z',
    status: 'new',
    niche: 'dental',
    source: 'WhatsApp AI'
  },
  {
    id: 'l-5',
    name: 'Karan Malhotra',
    phone: '+91 91234 56789',
    requirement: 'Haircut & Beard Styling',
    budget: '₹1,200',
    location: 'Jayanagar, Bangalore',
    date: '2026-05-28T17:20:00Z',
    status: 'converted',
    niche: 'salon',
    source: 'WhatsApp AI'
  },
  {
    id: 'l-6',
    name: 'Sneha Reddy',
    phone: '+91 88888 77777',
    requirement: 'Bridal Makeup consultation',
    budget: '₹15,000',
    location: 'Indiranagar, Bangalore',
    date: '2026-05-29T15:10:00Z',
    status: 'new',
    niche: 'salon',
    source: 'WhatsApp AI'
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    id: 'a-1',
    name: 'Anjali Sharma',
    phone: '+91 98765 43210',
    service: 'Teeth Whitening',
    dateTime: '2026-05-30T11:00:00',
    status: 'confirmed',
    niche: 'dental',
    reminderSent: true
  },
  {
    id: 'a-2',
    name: 'Karan Malhotra',
    phone: '+91 91234 56789',
    service: 'Premium Haircut & Beard',
    dateTime: '2026-05-30T14:30:00',
    status: 'confirmed',
    niche: 'salon',
    reminderSent: true
  },
  {
    id: 'a-3',
    name: 'Vikram Seth',
    phone: '+91 93211 44556',
    service: 'Dental Cleaning',
    dateTime: '2026-05-31T10:00:00',
    status: 'pending',
    niche: 'dental',
    reminderSent: false
  },
  {
    id: 'a-4',
    name: 'Priyanka Sen',
    phone: '+91 95555 88888',
    service: 'Balayage Coloring & Spa',
    dateTime: '2026-05-31T16:00:00',
    status: 'pending',
    niche: 'salon',
    reminderSent: false
  }
];

export const INITIAL_REFERRALS = [];

export const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    customerName: 'Anjali Sharma',
    rating: 5,
    comment: 'Wonderful whitening service! The booking process on WhatsApp was insanely fast.',
    status: 'completed',
    sentDate: '2026-05-28T16:00:00Z',
    niche: 'dental'
  },
  {
    id: 'rev-2',
    customerName: 'Karan Malhotra',
    rating: 5,
    comment: 'Loved the haircut. Got a direct WhatsApp review reminder and easy booking experience.',
    status: 'completed',
    sentDate: '2026-05-28T19:30:00Z',
    niche: 'salon'
  },
  {
    id: 'rev-3',
    customerName: 'Rohan Verma',
    rating: 4,
    comment: 'Quick service, but busy schedule.',
    status: 'completed',
    sentDate: '2026-05-29T12:00:00Z',
    niche: 'dental'
  },
  {
    id: 'rev-4',
    customerName: 'Amit Patel',
    rating: 0,
    comment: '',
    status: 'sent',
    sentDate: '2026-05-29T15:00:00Z',
    niche: 'dental'
  }
];

export const NICHE_CONFIGS = {
  dental: {
    id: 'dental',
    businessName: 'Zenith Dental Clinic',
    logo: '🦷',
    colorTheme: 'var(--accent-blue)',
    whatsappNumber: '+91 90123 90123',
    agentName: 'Dr. Zenith\'s AI Assistant',
    greetingMessage: 'Hello! Welcome to Zenith Dental Clinic 🦷. I\'m your virtual assistant. How can I help you today? You can ask about our treatments, check prices, or book an appointment directly!',
    reviewUrl: 'https://g.page/r/zenith-dental-clinic/review',
    services: [
      { name: 'Teeth Whitening', duration: '45 mins', price: '₹4,500' },
      { name: 'Dental Cleaning & Polishing', duration: '30 mins', price: '₹1,500' },
      { name: 'Root Canal Treatment', duration: '60 mins', price: '₹6,500' },
      { name: 'Orthodontics (Braces/Aligners) Consultation', duration: '30 mins', price: '₹1,000' }
    ],
    systemPrompt: 'You are a warm, helpful virtual assistant for Zenith Dental Clinic. Your job is to answer questions politely, collect contact info (name, requirement, budget, location) to build a lead profile, help them select a dental service, and book an appointment.',
    mockAnswers: {
      prices: 'Our prices are very affordable! Cleaning is ₹1,500, Whitening is ₹4,500, and Root Canal is around ₹6,500 depending on the case. What treatment are you considering?',
      location: 'We are located at 12th Main Road, Indiranagar, Bangalore. Just 2 mins walk from the metro station! Where are you located?',
      timings: 'We are open from Monday to Saturday, 9:30 AM to 8:30 PM. Sunday is emergency bookings only.'
    }
  },
  salon: {
    id: 'salon',
    businessName: 'Glow & Style Salon & Spa',
    logo: '💇‍♀️',
    colorTheme: 'var(--accent-purple)',
    whatsappNumber: '+91 90456 90456',
    agentName: 'Glow & Style AI Stylist',
    greetingMessage: 'Hi there! Welcome to Glow & Style Salon & Spa 💇‍♀️. Looking to pamper yourself? I can help you check our styling menu, pricing, and book your pamper session instantly!',
    reviewUrl: 'https://g.page/r/glow-style-salon/review',
    services: [
      { name: 'Balayage Hair Coloring', duration: '120 mins', price: '₹7,500' },
      { name: 'Keratin Hair Treatment', duration: '90 mins', price: '₹5,000' },
      { name: 'Premium Pedicure & Manicure', duration: '60 mins', price: '₹1,800' },
      { name: 'Bridal Makeup Consultation', duration: '45 mins', price: '₹3,000' }
    ],
    systemPrompt: 'You are an upbeat, friendly styling assistant for Glow & Style Salon & Spa. Help clients explore services, capture their budget and requirements, and book styling appointments.',
    mockAnswers: {
      prices: 'Our haircuts start at ₹800. Balayage is ₹7,500, Keratin is ₹5,000, and Mani-Pedi is ₹1,800. What service can we prep for you today?',
      location: 'We are in HSR Layout, Sector 6, Bangalore. Right next to the Central Park. Where are you heading from?',
      timings: 'We are open all 7 days of the week, from 10:00 AM to 9:00 PM.'
    }
  }
};
