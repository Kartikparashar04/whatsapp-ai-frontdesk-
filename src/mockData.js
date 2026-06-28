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
  },
  clinic: {
    id: 'clinic',
    businessName: 'CarePlus Medical Clinic',
    logo: '🏥',
    colorTheme: '#22c55e',
    whatsappNumber: '+91 90999 88888',
    agentName: 'CarePlus AI Triage',
    greetingMessage: 'Hello and welcome to CarePlus Medical Clinic 🏥. I am your AI receptionist. I can help you schedule consultation slots, check consulting fees, or view doctor timings. How can I help you today?',
    reviewUrl: 'https://g.page/r/careplus-medical-clinic/review',
    services: [
      { name: 'General Physician Consultation', duration: '20 mins', price: '₹500' },
      { name: 'Pediatric Specialist Consultation', duration: '30 mins', price: '₹800' },
      { name: 'Comprehensive Health Checkup', duration: '45 mins', price: '₹2,500' },
      { name: 'Dermatology Consultation', duration: '30 mins', price: '₹1,000' }
    ],
    systemPrompt: 'You are an empathetic, professional AI medical assistant for CarePlus Clinic. Answer patient queries politely, capture patient names and reasons for consultation, and schedule doctor visits.',
    mockAnswers: {
      prices: 'General consultation is ₹500, specialist is ₹800, and full body health check is ₹2,500. Which doctor consultation are you looking to book?',
      location: 'We are situated at MG Road Metro Station, Bangalore. Near Royal Plaza. What is your location?',
      timings: 'Doctors consult Monday to Saturday from 8:00 AM to 1:00 PM, and 4:00 PM to 9:00 PM.'
    }
  },
  gym: {
    id: 'gym',
    businessName: 'IronForce Fitness Club',
    logo: '🏋️',
    colorTheme: '#ef4444',
    whatsappNumber: '+91 90888 77777',
    agentName: 'IronForce FitBot',
    greetingMessage: 'Hey! Welcome to IronForce Fitness Club 🏋️. Ready to crush your goals? I can guide you through our membership plans, personal trainer bookings, or schedule a free trial workout!',
    reviewUrl: 'https://g.page/r/ironforce-fitness/review',
    services: [
      { name: 'Free Trial Workout Session', duration: '60 mins', price: '₹0' },
      { name: 'Monthly General Membership', duration: '30 days', price: '₹2,000' },
      { name: '1-on-1 Personal Trainer Consultation', duration: '45 mins', price: '₹1,500' },
      { name: 'Yoga & Pilates Group Class', duration: '60 mins', price: '₹500' }
    ],
    systemPrompt: 'You are an energetic, motivating fitness AI assistant for IronForce Fitness Club. Encourage prospective members, list facilities, and book gym trial slots.',
    mockAnswers: {
      prices: 'Memberships start at ₹2,000/month. Group classes are ₹500 per session. Personal training is ₹1,500 per session. Would you like to schedule a free trial workout today?',
      location: 'We are in Indiranagar, 80 Feet Road, Bangalore (opposite Gold Gym). Where are you located?',
      timings: 'We are open 24/7. Staff and trainers are available from 6:00 AM to 10:00 PM every day.'
    }
  },
  restaurant: {
    id: 'restaurant',
    businessName: 'The Royal Bistro Cafe',
    logo: '🍽️',
    colorTheme: '#eab308',
    whatsappNumber: '+91 90777 66666',
    agentName: 'Bistro Table Planner',
    greetingMessage: 'Namaste! Welcome to The Royal Bistro Cafe 🍽️. Looking for a delicious meal or want to reserve a table? I can help you reserve tables, check today\'s special menu, or view bistro hours!',
    reviewUrl: 'https://g.page/r/royal-bistro/review',
    services: [
      { name: 'Bistro Table Reservation (2-4 People)', duration: '90 mins', price: '₹0' },
      { name: 'Private Event Dining Booking', duration: '180 mins', price: '₹5,000' },
      { name: 'Chef Special Degustation Booking', duration: '120 mins', price: '₹2,500' }
    ],
    systemPrompt: 'You are a polite, helpful AI concierge for The Royal Bistro Cafe. Help guests book tables, describe menu categories, and answer dining timing questions.',
    mockAnswers: {
      prices: 'Table bookings are completely free of charge! Average cost for two is around ₹1,200. What slot shall I reserve for you?',
      location: 'We are located at Lakefront Road, Bangalore. Opposite City Garden. Where are you joining us from?',
      timings: 'We serve daily from 11:30 AM to 11:30 PM. Live music is performed on weekends.'
    }
  },
  coaching: {
    id: 'coaching',
    businessName: 'Apex Academic Academy',
    logo: '📚',
    colorTheme: 'var(--accent-blue)',
    whatsappNumber: '+91 90666 55555',
    agentName: 'Apex Info Desk',
    greetingMessage: 'Hello! Welcome to Apex Academic Academy 📚. We help students prepare for IIT-JEE, NEET, and Board Exams. I can help you register for counseling, query class batches, and check fee structures!',
    reviewUrl: 'https://g.page/r/apex-academy/review',
    services: [
      { name: 'Career Counseling & Admission Assessment', duration: '45 mins', price: '₹0' },
      { name: 'IIT-JEE/NEET Prep Batch Inquiry', duration: '30 mins', price: '₹0' },
      { name: '1-on-1 Math/Science Expert Mentorship', duration: '60 mins', price: '₹1,000' }
    ],
    systemPrompt: 'You are a professional, helpful academic guide for Apex Academic Academy. Assist parents and students with batch options, schedules, admission inquiries, and counselor bookings.',
    mockAnswers: {
      prices: 'Our general career counseling is free. Regular batches start from ₹4,500/month. expert mentorship is ₹1,000/hr. Would you like to schedule a free counseling session?',
      location: 'Our main learning center is in Jabalpur, Wright Town (near Civic Center). What is your hometown?',
      timings: 'Academic office is open Monday to Saturday, 10:00 AM to 7:00 PM. Evening classes run till 8:30 PM.'
    }
  }
};
