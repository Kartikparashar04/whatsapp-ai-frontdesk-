import React, { useState, useEffect, useRef } from 'react';

const BLUE = "#3B82F6";
const BLUE_DARK = "#1D4ED8";
const GREEN = "#10B981";
const GREEN_DARK = "#059669";
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

export default function LandingPage({ navigateToLogin, navigateToSignup }) {
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
