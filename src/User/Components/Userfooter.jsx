// src/components/UserFooter.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

// ─── Feature card data (text screenshot jaisa hai, apne hisaab se badal sakte hain) ─
const FEATURES = [
  {
    title: "home delivery",
    text: "Provide home delivery for all products ",
    icon: "truck",
  },
  {
    title: "Quality Products",
    text: "We ensure the product quality that is our main goal",
    icon: "award",
  },
  {
    title: "3-4 Hours Return",
    text: "Return product within 3 to 3 hours for any product you buy",
    icon: "return",
  },
  {
    title: "Online Support",
    text: "We ensure the product quality that you can trust easily",
    icon: "support",
  },
];

// ─── Links ────────────────────────────────────────────────────────────────────
const COMPANY_LINKS = [
  { label: "About Us", to: "/user/about" },
  { label: "Blogs", to: "/user/blog" },
  { label: "All Products", to: "/user/product" },
  { label: "Become a Vendor", to: "/user/vendor" },
  { label: "Affiliate Program", to: "/user/affiliate" },
  { label: "Contact Us", to: "/user/contect" },
];

const SERVICE_LINKS = [
  { label: "Track My Order", to: "/user/track" },
  { label: "My Orders", to: "/user/orders" },
  { label: "My Wishlist", to: "/user/wishlist" },
  { label: "Sign In", to: "/user/login" },
  { label: "Promotions", to: "/user/promotions" },
];

const CARE_LINKS = [
  { label: "Help & Support", to: "/user/contect" },
  { label: "Terms & Conditions", to: "/user/termcondition" },
  { label: "Privacy Policy", to: "/user/privacy" },
  { label: "Delete Account", to: "/user/deleteaccount" },
];

const PAYMENTS = [
  { label: "VISA", style: { color: "#1a1f71", fontStyle: "italic", fontWeight: 800 } },
  { label: "Mastercard", style: { color: "#eb001b", fontWeight: 800 } },
  { label: "RuPay", style: { color: "#097969", fontWeight: 800 } },
  { label: "UPI", style: { color: "#6b3fa0", fontWeight: 800 } },
];

// ─── Feature icons (screenshot jaise line icons) ──────────────────────────────
const FeatureIcon = ({ name }) => {
  const common = {
    width: 44,
    height: 44,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#111",
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 },
  };

  if (name === "truck") {
    return (
      <svg {...common}>
        <rect x="1" y="6" width="13" height="10" rx="1" />
        <path d="M14 9h4.5l3 3.5V16h-7.5" />
        <circle cx="5" cy="18" r="2" />
        <circle cx="17.5" cy="18" r="2" />
        <path d="M1 9h5M1 12h4" />
      </svg>
    );
  }
  if (name === "award") {
    return (
      <svg {...common}>
        <circle cx="12" cy="9" r="6.5" />
        <circle cx="12" cy="9" r="3.5" />
        <path d="M12 6.2l.8 1.7 1.8.2-1.4 1.2.4 1.8-1.6-.9-1.6.9.4-1.8-1.4-1.2 1.8-.2z" />
        <path d="M8.5 14.5L7 22l5-2.5L17 22l-1.5-7.5" />
      </svg>
    );
  }
  if (name === "return") {
    return (
      <svg {...common}>
        <path d="M4 10a8 8 0 0 1 14-4.5L20 8" />
        <polyline points="20 3 20 8 15 8" />
        <path d="M20 14a8 8 0 0 1-14 4.5L4 16" />
        <polyline points="4 21 4 16 9 16" />
      </svg>
    );
  }
  // support (headset)
  return (
    <svg {...common}>
      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
      <rect x="2.5" y="13" width="4.5" height="7" rx="1.5" />
      <rect x="17" y="13" width="4.5" height="7" rx="1.5" />
      <path d="M21 19.5c0 1.4-1.6 2.5-4.5 2.5H13" />
    </svg>
  );
};

// ─── Social icons (monochrome, screenshot jaise) ──────────────────────────────
const SocialIcon = ({ name }) => {
  const size = 20;
  if (name === "facebook") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    );
  }
  if (name === "instagram") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  // whatsapp
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.122 1.532 5.855L.057 23.535a.75.75 0 00.916.918l5.803-1.46A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.7-.498-5.253-1.37l-.376-.214-3.898.981.998-3.792-.234-.389A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
};

const SOCIALS = [
  { key: "facebook", href: "https://www.facebook.com/people/Anika-Kisan/61593679281358/", label: "Facebook" },
  { key: "instagram", href: "https://instagram.com/anikakisan", label: "Instagram" },
  { key: "whatsapp", href: "https://wa.me/919463685829", label: "WhatsApp" },
];

// ─── Footer ───────────────────────────────────────────────────────────────────
const UserFooter = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="ofo-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Open+Sans:wght@400;500;600&display=swap');

        .ofo-root {
          font-family: 'Open Sans', sans-serif;
          color: #0d1f1f;
          width: 100%;
        }
        .ofo-head { font-family: 'Rajdhani', sans-serif; }

        /* ── Top: white band + cream band ── */
        .ofo-top {
          background: linear-gradient(to bottom, #ffffff 0, #ffffff 100px, #f7f5ee 100px);
          padding: 0 6vw;
        }
        .ofo-feat-card {
          max-width: 1670px;
          margin: 40px auto 0;
          background: #fff;
          box-shadow: 0 12px 40px rgba(0,0,0,0.07);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .ofo-feat-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 40px 36px;
          min-width: 0;
        }
        .ofo-feat-item + .ofo-feat-item { border-left: 1px solid #e6e6e6; }
        .ofo-feat-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0d1f1f;
          line-height: 1.15;
          margin: 0 0 6px;
        }
        .ofo-feat-text {
          font-size: 15px;
          line-height: 1.6;
          color: #333;
          margin: 0;
        }
        .ofo-top-spacer { height: 70px; }

        /* ── Main footer (cream) ── */
        .ofo-main {
          background: #f7f5ee;
          padding: 40px 6vw 60px;
          display: grid;
          grid-template-columns: 1.25fr 1fr 1fr 1fr 1.35fr;
          gap: 40px;
        }
        .ofo-col-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #0d1f1f;
          margin: 0 0 22px;
          line-height: 1.1;
        }
        .ofo-brand-row {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          margin-bottom: 20px;
        }
        .ofo-brand-text {
          font-family: 'Rajdhani', sans-serif;
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.3px;
        }
        .ofo-desc {
          font-size: 16px;
          line-height: 1.8;
          color: #333;
          margin: 0 0 24px;
          max-width: 360px;
        }
        .ofo-contact-list {
          list-style: none;
          margin: 0 0 26px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ofo-contact-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 16px;
          color: #222;
          line-height: 1.5;
        }
        .ofo-contact-list svg { flex-shrink: 0; margin-top: 3px; color: #7ab800; }
        .ofo-socials { display: flex; gap: 18px; align-items: center; }
        .ofo-socials a {
          color: #0d1f1f;
          display: inline-flex;
          transition: color 0.2s, transform 0.2s;
        }
        .ofo-socials a:hover { color: #7ab800; transform: translateY(-2px); }

        .ofo-links { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 18px; }
        .ofo-links a {
          font-size: 16px;
          color: #222;
          text-decoration: none;
          transition: color 0.15s;
        }
        .ofo-links a:hover { color: #7ab800; }

        .ofo-news-text {
          font-size: 16px;
          line-height: 1.75;
          color: #333;
          margin: 0 0 24px;
        }
        .ofo-form { display: flex; height: 56px; }
        .ofo-input {
          flex: 1;
          min-width: 0;
          border: 1px solid #e0e0e0;
          border-right: none;
          background: #fff;
          padding: 0 18px;
          font-family: 'Open Sans', sans-serif;
          font-size: 15px;
          color: #0d1f1f;
          outline: none;
        }
        .ofo-input::placeholder { color: #444; }
        .ofo-input:focus { border-color: #7ab800; }
        .ofo-submit {
          width: 64px;
          flex-shrink: 0;
          border: none;
          background: #7ab800;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ofo-submit:hover { background: #68a010; }
        .ofo-sub-msg {
          font-size: 14px;
          color: #3c8a1e;
          margin: 10px 0 0;
        }
        .ofo-accept-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0d1f1f;
          margin: 36px 0 14px;
        }
        .ofo-pay-box {
          background: #fff;
          padding: 16px 18px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .ofo-pay-box span {
          font-size: 16px;
          letter-spacing: 0.2px;
        }

        /* ── Bottom bar (dark) ── */
        .ofo-bottom {
          background: #0b1f22;
          color: #fff;
          padding: 22px 6vw;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }
        .ofo-copy {
          font-size: 16px;
          color: #fff;
        }
        .ofo-copy b { font-weight: 700; }
        .ofo-credit {
          font-size: 13px;
          color: #9ca3af;
          margin-top: 4px;
        }
        .ofo-credit a {
          color: #7ab800;
          font-weight: 600;
          text-decoration: none;
        }
        .ofo-credit a:hover { text-decoration: underline; }
        .ofo-bottom-links {
          display: flex;
          gap: 26px;
          flex-wrap: wrap;
        }
        .ofo-bottom-links a {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          text-decoration: none;
          transition: color 0.15s;
        }
        .ofo-bottom-links a:hover { color: #7ab800; }

        /* ── Tablet ── */
        @media (max-width: 1100px) {
          .ofo-feat-card { grid-template-columns: repeat(2, 1fr); }
          .ofo-feat-item:nth-child(3) { border-left: none; }
          .ofo-feat-item:nth-child(n+3) { border-top: 1px solid #e6e6e6; }
          .ofo-main { grid-template-columns: repeat(3, 1fr); }
          .ofo-brand-col { grid-column: 1 / -1; }
          .ofo-news-col { grid-column: 1 / -1; }
          .ofo-desc { max-width: 560px; }
          .ofo-news-col .ofo-form { max-width: 560px; }
          .ofo-news-col .ofo-pay-box { max-width: 560px; }
        }

        /* ── Mobile ── */
        @media (max-width: 760px) {
          .ofo-top { padding: 0 16px; background: linear-gradient(to bottom, #ffffff 0, #ffffff 60px, #f7f5ee 60px); }
          .ofo-feat-card { grid-template-columns: 1fr; margin-top: 24px; }
          .ofo-feat-item { padding: 22px 20px; }
          .ofo-feat-item + .ofo-feat-item { border-left: none; border-top: 1px solid #e6e6e6; }
          .ofo-feat-item:nth-child(n+3) { border-top: 1px solid #e6e6e6; }
          .ofo-top-spacer { height: 40px; }
          .ofo-main { grid-template-columns: 1fr 1fr; gap: 32px 24px; padding: 32px 16px 40px; }
          .ofo-brand-col, .ofo-news-col { grid-column: 1 / -1; }
          .ofo-col-title { font-size: 21px; margin-bottom: 16px; }
          .ofo-links { gap: 14px; }
          .ofo-bottom { padding: 20px 16px; flex-direction: column; align-items: flex-start; }
          .ofo-bottom-links { gap: 18px; }
        }

        @media (max-width: 480px) {
          .ofo-main { grid-template-columns: 1fr; }
          .ofo-pay-box span { font-size: 14px; }
        }
      `}</style>

      {/* ══════════════ TOP: FEATURE CARD ══════════════ */}
      <div className="ofo-top">
        <div className="ofo-feat-card">
          {FEATURES.map((f) => (
            <div className="ofo-feat-item" key={f.title}>
              <FeatureIcon name={f.icon} />
              <div>
                <h4 className="ofo-feat-title">{f.title}</h4>
                <p className="ofo-feat-text">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="ofo-top-spacer" />
      </div>

      {/* ══════════════ MAIN FOOTER ══════════════ */}
      <div className="ofo-main">
        {/* Brand + contact + socials */}
        <div className="ofo-brand-col">
          <div className="ofo-brand-row" onClick={() => navigate("/")}>
            <img src="/UserLogo.png" alt="Anika Kisan" style={{ height: 52, width: "auto", objectFit: "contain" }} />
            <span className="ofo-brand-text" style={{ color: "#1a9e3f" }}>
              Anika <span style={{ color: "#f7941d" }}>Kisan</span>
            </span>
          </div>

          <p className="ofo-desc">
            The Anika Kisan is an eco friendly shopping cart and delivery service that brings farm fresh fruits and vegetables straight to your doorstep with a live EV cart.
          </p>

          <ul className="ofo-contact-list">
            <li>
              <MapPin size={18} />
              <span>Aadarsh Nagar road no 2 phulwari Sharif Patna Bihar 801505</span>
            </li>
            <li>
              <Phone size={18} />
              <a href="tel:+916299190014" style={{ color: "#222", textDecoration: "none" }}>+91 62991 90014</a>
            </li>
            <li>
              <Mail size={18} />
              <a href="mailto:anikakisan@gmail.com" style={{ color: "#222", textDecoration: "none" }}>anikakisan@gmail.com</a>
            </li>
            <li>
              <Clock size={18} />
              <span>Mon – Sat, 9:00 – 20:00</span>
            </li>
          </ul>

          <div className="ofo-socials">
            {SOCIALS.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <SocialIcon name={s.key} />
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="ofo-col-title ofo-head">Company</h4>
          <ul className="ofo-links">
            {COMPANY_LINKS.map((l) => (
              <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="ofo-col-title ofo-head">Services</h4>
          <ul className="ofo-links">
            {SERVICE_LINKS.map((l) => (
              <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Customer care */}
        <div>
          <h4 className="ofo-col-title ofo-head">Customer Care</h4>
          <ul className="ofo-links">
            {CARE_LINKS.map((l) => (
              <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Newsletter + payments */}
        <div className="ofo-news-col">
          <h4 className="ofo-col-title ofo-head">Newsletter</h4>
          <p className="ofo-news-text">
            Subscribe to our weekly newsletter and receive updates via email.
          </p>

          <form className="ofo-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              className="ofo-input"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSubscribed(false); }}
              required
            />
            <button type="submit" className="ofo-submit" aria-label="Subscribe">
              <Send size={22} />
            </button>
          </form>
          {subscribed && <p className="ofo-sub-msg">Thanks for subscribing!</p>}

          <h4 className="ofo-accept-title ofo-head">We Accept</h4>
          <div className="ofo-pay-box">
            {PAYMENTS.map((p) => (
              <span key={p.label} style={p.style}>{p.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ BOTTOM BAR ══════════════ */}
      <div className="ofo-bottom">
        <div>
          <div className="ofo-copy">
            Copyright © <b>Anika Kisan Services</b> All Right Reserved.
          </div>
          <div className="ofo-credit">
            Design & Development by{" "}
            <a href="https://www.hexileservices.com/" target="_blank" rel="noopener noreferrer">Hexile Services Pvt. Ltd.</a>
          </div>
        </div>

        <div className="ofo-bottom-links">
          <Link to="/user/termcondition">Terms & Conditions</Link>
          <Link to="/user/privacy">Privacy Policy</Link>
          <Link to="/user/contect">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;