import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

/* ============================================================
   BRAND CONFIG — update your details here
   ============================================================ */
const BRAND = {
  name: "Anika Kisan",
  city: "Patna, Bihar",
  logo: "/Logo.png", // public/Logo.png
  email: "your-email@example.com", // add your email
  phoneDisplay: "+91 62991 90014",
  phoneTel: "+916299190014",
  whatsappLink: "https://wa.me/916299190014",
  address: "Raja Bazar, Patna, Bihar — 800014",
  instagram: "https://instagram.com/your-handle", // add your handle
  instagramHandle: "@your-handle",
  supportHours: "Mon–Sat, 9 AM – 6 PM IST",
  responseTime: "2 business days",
  effectiveDate: "January 1, 2026",
  lastUpdated: "July 2026",
  canonical: "https://your-domain.com/user/privacy", // add your domain
};

const INTRO = `This Privacy Policy explains how ${BRAND.name} ("we", "our", or "us") collects, uses, shares, and protects information obtained from users ("you") of our website and mobile application. By using ${BRAND.name}, you agree to the practices described in this policy. It applies to all grocery services we offer in India since our founding in 2026.`;

const SECTIONS = [
  {
    id: "information",
    title: "Information We Collect",
    items: [
      {
        subtitle: "Personal Information",
        text: `When you create an account or place an order on ${BRAND.name}, we collect your name, email address, phone number, and delivery address to process and fulfill your orders.`,
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you interact with our platform, including pages visited, items viewed, search queries, and device or browser details, to improve your shopping experience.",
      },
      {
        subtitle: "Payment Information",
        text: `Payments are processed through secure, encrypted third-party gateways. ${BRAND.name} does not store your full card details on our servers.`,
      },
    ],
  },
  {
    id: "usage",
    title: "How We Use Your Information",
    items: [
      {
        subtitle: "Order Processing",
        text: "Your personal data is used to confirm, process, and deliver your grocery orders and to share updates about your purchases.",
      },
      {
        subtitle: "Personalization",
        text: "We use your browsing and purchase history to recommend products and offers that match your preferences and local needs.",
      },
      {
        subtitle: "Service Improvement",
        text: "Aggregate usage data helps us improve our platform, add new features, and keep the experience smooth and reliable for all customers.",
      },
    ],
  },
  {
    id: "sharing",
    title: "Information Sharing",
    items: [
      {
        subtitle: "Delivery Partners",
        text: "We share your name, address, and contact number with delivery partners only to fulfill your orders. They may not use this data for any other purpose.",
      },
      {
        subtitle: "No Third-Party Selling",
        text: `${BRAND.name} does not sell, rent, or trade your personal information to marketers or advertisers.`,
      },
      {
        subtitle: "Legal Obligations",
        text: `We may disclose your information if required by law, court order, or to protect the rights and safety of ${BRAND.name}, our users, or the public.`,
      },
    ],
  },
  {
    id: "security",
    title: "Data Security",
    items: [
      {
        subtitle: "Encryption",
        text: "Data transmitted between your device and our servers is protected using industry-standard SSL/TLS encryption.",
      },
      {
        subtitle: "Access Control",
        text: "Only authorized team members can access your personal data, and only to the extent needed to perform their duties.",
      },
      {
        subtitle: "Breach Response",
        text: "If a data breach ever occurs, we will notify affected users promptly and take immediate steps to limit any harm.",
      },
    ],
  },
  {
    id: "rights",
    title: "Your Rights",
    items: [
      {
        subtitle: "Access & Correction",
        text: "You can access the personal information we hold about you and request corrections if any details are inaccurate or incomplete.",
      },
      {
        subtitle: "Deletion",
        text: `You can request deletion of your account and associated data at any time by contacting our support team at ${BRAND.email}.`,
      },
      {
        subtitle: "Opt-Out",
        text: "You can opt out of promotional emails and notifications at any time from your account settings or the unsubscribe link in any marketing email.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    items: [
      {
        subtitle: "Essential Cookies",
        text: "We use essential cookies to keep you logged in and remember your cart. The platform cannot function correctly without them.",
      },
      {
        subtitle: "Analytics Cookies",
        text: "Analytics cookies help us understand how users navigate our site so we can improve performance. You can disable them in your browser settings.",
      },
      {
        subtitle: "Marketing Cookies",
        text: "We may use marketing cookies to show relevant offers. You can manage your preferences at any time through the cookie settings panel.",
      },
    ],
  },
  {
    id: "children",
    title: "Children's Privacy",
    items: [
      {
        subtitle: "Age Restriction",
        text: `${BRAND.name} is not directed at children under 13, and we do not knowingly collect personal information from them.`,
      },
      {
        subtitle: "Parental Action",
        text: `If you believe your child has given us personal data, please contact us right away and we will delete it from our systems.`,
      },
    ],
  },
  {
    id: "updates",
    title: "Policy Updates",
    items: [
      {
        subtitle: "Changes",
        text: "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. The updated policy will be posted here with a revised date.",
      },
      {
        subtitle: "Notification",
        text: "For significant changes, we will notify registered users by email or a prominent notice on our platform before the changes take effect.",
      },
    ],
  },
];

/* ============================================================
   LOGO — image from public folder
   ============================================================ */
function Logo({ size = 40 }) {
  return (
    <img
      src={BRAND.logo}
      alt={`${BRAND.name} logo`}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

export default function PrivacyPolicy() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Highlight the section currently in view in the sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Helmet>
        <title>Privacy Policy - {BRAND.name} | Your Data is Safe With Us</title>
        <meta
          name="description"
          content={`Read the Privacy Policy of ${BRAND.name}, connecting local farmers of ${BRAND.city} with families.`}
        />
        <link rel="canonical" href={BRAND.canonical} />
      </Helmet>

      <div className="min-h-screen bg-[#fbf8f1] font-sans text-stone-800">

        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden bg-green-900 text-white">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-green-400/15 blur-3xl" />

          <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3">
              <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-full pl-1.5 pr-4 py-1.5 mb-6">
                <span className="bg-white rounded-full p-1">
                  <img src={BRAND.logo} alt={`${BRAND.name} logo`} className="w-5 h-5 object-contain" />
                </span>
                <span className="text-xs font-semibold tracking-widest uppercase">
                  {BRAND.name} · {BRAND.city}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                Privacy <span className="text-orange-300">Policy</span>
              </h1>
              <p className="text-green-100 leading-relaxed max-w-lg">
                Your trust matters to us. Here is how we collect, use, and protect your personal
                information when you shop with {BRAND.name}.
              </p>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white text-stone-800 rounded-3xl p-6 shadow-2xl">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Document Info</p>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-500">Effective</dt>
                    <dd className="font-semibold">{BRAND.effectiveDate}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-500">Last updated</dt>
                    <dd className="font-semibold">{BRAND.lastUpdated}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-500">Location</dt>
                    <dd className="font-semibold">{BRAND.city}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* ============ INTRO ============ */}
        <section className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-stone-100">
            <p className="text-stone-600 leading-relaxed">{INTRO}</p>
          </div>
        </section>

        {/* ============ BODY ============ */}
        <div className="max-w-5xl mx-auto px-6 py-16 grid lg:grid-cols-[220px_1fr] gap-10">

          {/* Sidebar */}
          <aside>
            <div className="lg:sticky lg:top-6">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">On this page</p>
              <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2">
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => handleNavClick(s.id)}
                    className={`whitespace-nowrap text-left text-sm px-4 py-2.5 rounded-xl border transition-colors ${
                      activeId === s.id
                        ? "bg-green-700 text-white border-green-700 font-semibold"
                        : "bg-white text-stone-600 border-stone-200 hover:border-green-300 hover:text-green-700"
                    }`}
                  >
                    {i + 1}. {s.title}
                  </button>
                ))}
              </nav>

              <div className="hidden lg:block mt-8 rounded-2xl bg-orange-500 text-white p-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-orange-100">Questions?</p>
                <a href={`tel:${BRAND.phoneTel}`} className="block text-sm font-semibold mb-2">
                  📞 {BRAND.phoneDisplay}
                </a>
                <a href={`mailto:${BRAND.email}`} className="block text-sm break-all mb-3">
                  ✉️ {BRAND.email}
                </a>
                <p className="text-xs text-orange-100">🕐 {BRAND.supportHours}</p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 space-y-6">
            {SECTIONS.map((section, idx) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 bg-white rounded-2xl border border-stone-200 p-6 md:p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-10 h-10 rounded-full bg-green-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-stone-900">{section.title}</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {section.items.map((item) => (
                    <div key={item.subtitle} className="rounded-xl bg-stone-50 border border-stone-100 p-5">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">
                        {item.subtitle}
                      </h3>
                      <p className="text-sm text-stone-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Contact CTA */}
            <section className="rounded-3xl bg-green-800 text-white p-8 md:p-10 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-orange-400/20 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-300 mb-3">Get in touch</p>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
                  Have questions or <span className="text-orange-300">concerns?</span>
                </h2>
                <p className="text-green-100 leading-relaxed max-w-lg mb-6">
                  Our support team can help with any privacy-related questions about your account. We
                  respond within {BRAND.responseTime}.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  <a
                    href={`tel:${BRAND.phoneTel}`}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl p-4 transition-colors"
                  >
                    <span className="text-xl">📞</span>
                    <span className="text-sm font-semibold">{BRAND.phoneDisplay}</span>
                  </a>
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl p-4 transition-colors break-all"
                  >
                    <span className="text-xl">✉️</span>
                    <span className="text-sm font-semibold">{BRAND.email}</span>
                  </a>
                  <a
                    href={BRAND.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl p-4 transition-colors"
                  >
                    <span className="text-xl">📸</span>
                    <span className="text-sm font-semibold">{BRAND.instagramHandle}</span>
                  </a>
                  <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl p-4">
                    <span className="text-xl">📍</span>
                    <span className="text-sm font-semibold">{BRAND.address}</span>
                  </div>
                </div>

                <a
                  href={BRAND.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full transition-colors"
                >
                  💬 WhatsApp Us
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}