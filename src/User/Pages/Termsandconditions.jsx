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
  jurisdiction: "Patna, Bihar",
  effectiveDate: "January 1, 2026",
  lastUpdated: "July 2026",
  version: "1.0",
  canonical: "https://your-domain.com/user/termcondition", // add your domain
};

const INTRO = `Please read these Terms & Conditions carefully before using ${BRAND.name}. By accessing our website, mobile application, or any of our services, you agree to be bound by the terms below.`;

const SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    paragraphs: [
      "By accessing or using the Anika Kisan website, mobile application, or any of our services, you confirm that you have read, understood, and agree to these Terms & Conditions. If you do not agree, please discontinue use of our platform immediately.",
      "These terms apply to all visitors, users, and customers of Anika Kisan. We may update these terms at any time, and continued use of the platform means you accept the revised terms.",
    ],
  },
  {
    id: "about",
    title: "About Anika Kisan",
    paragraphs: [
      `${BRAND.name} is an online grocery platform dedicated to bridging the gap between local farmers and urban consumers. We connect farmers, artisans, and vendors with customers looking for fresh, authentic, and affordable produce.`,
      `Our mission is to support the local farming economy while delivering quality groceries to your doorstep. ${BRAND.name} operates as an e-commerce marketplace that facilitates transactions between buyers and registered sellers, headquartered in ${BRAND.city}.`,
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility & Account",
    paragraphs: [
      "To use our platform, you must be at least 18 years of age or have parental or guardian consent. By creating an account, you confirm that all information you provide is accurate, current, and complete.",
      `You are responsible for keeping your account credentials confidential. Please notify us immediately of any unauthorized use of your account. ${BRAND.name} is not liable for losses arising from unauthorized access caused by a failure to protect your login information.`,
    ],
  },
  {
    id: "orders",
    title: "Orders & Payments",
    paragraphs: [
      `All orders placed on ${BRAND.name} are subject to availability and confirmation. We reserve the right to cancel or refuse any order, including in cases of suspected fraud, inaccurate product information, or pricing errors.`,
      "Payments can be made through our supported methods, including UPI, credit or debit cards, net banking, and cash on delivery where available. Prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery Policy",
    paragraphs: [
      `${BRAND.name} strives to deliver your order within the estimated timeframe shown at checkout. Delivery times may vary based on your location, product availability, and external factors such as weather or public holidays.`,
      "We currently serve selected areas. Delivery charges, if any, will be clearly shown before you confirm your order. Risk of loss and ownership of products pass to you upon delivery.",
    ],
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    paragraphs: [
      "We want you to be satisfied with every purchase. If you receive a damaged, defective, or incorrect item, please report it within 24 hours of delivery through our app or customer support.",
      "Perishable items such as fresh produce and dairy are not eligible for return unless they arrive damaged or spoiled. Approved refunds will be processed to the original payment method within 5–7 business days.",
    ],
  },
  {
    id: "prohibited",
    title: "Prohibited Activities",
    paragraphs: [
      "Users must not engage in any activity that disrupts, damages, or impairs the platform. This includes placing fraudulent orders, scraping or harvesting data without authorization, impersonating other users or our staff, uploading malicious content, or attempting unauthorized access to our systems.",
      "Violations may result in immediate account suspension and legal action where applicable.",
    ],
  },
  {
    id: "ip",
    title: "Intellectual Property",
    paragraphs: [
      `All content on the ${BRAND.name} platform, including logos, text, images, graphics, and software, is the property of ${BRAND.name} or its licensors and is protected by applicable intellectual property laws.`,
      `You may not reproduce, distribute, modify, or create derivative works from any content on our platform without prior written permission from ${BRAND.name}.`,
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Data",
    paragraphs: [
      `Your privacy matters to us. ${BRAND.name} collects and processes personal data in accordance with our Privacy Policy. By using our platform, you consent to the collection and use of your data as described there.`,
      "We use industry-standard security measures to protect your data. However, no method of transmission over the internet is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    paragraphs: [
      `To the maximum extent permitted by law, ${BRAND.name} is not liable for any indirect, incidental, special, or consequential damages arising from your use of, or inability to use, our platform or services.`,
      "Our total liability for any claim arising from these terms is limited to the amount you paid for the specific order that gave rise to the claim.",
    ],
  },
  {
    id: "governing",
    title: "Governing Law",
    paragraphs: [
      `These Terms & Conditions are governed by the laws of India. Any dispute arising from these terms is subject to the exclusive jurisdiction of the courts located in ${BRAND.jurisdiction}.`,
      "If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.",
    ],
  },
  {
    id: "contact",
    title: "Contact Us",
    paragraphs: [
      "If you have any questions, concerns, or feedback about these Terms & Conditions, please reach out to us. Our support team is available during support hours.",
    ],
  },
];

export default function TermsAndConditions() {
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
        <title>Terms & Conditions - {BRAND.name} | User Agreement</title>
        <meta
          name="description"
          content={`Read the Terms & Conditions of ${BRAND.name}, connecting local farmers of ${BRAND.city} with families.`}
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
                Terms & <span className="text-orange-300">Conditions</span>
              </h1>
              <p className="text-green-100 leading-relaxed max-w-lg">
                Please read these terms carefully. By using {BRAND.name}, you agree to the conditions
                described on this page.
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
                    <dt className="text-stone-500">Version</dt>
                    <dd className="font-semibold">{BRAND.version}</dd>
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

            {/* Warning */}
            <div className="flex gap-4 rounded-2xl border-l-4 border-orange-500 bg-orange-50 p-5">
              <span className="text-2xl shrink-0">⚠️</span>
              <p className="text-sm leading-relaxed text-orange-900">
                By placing an order or creating an account, you legally agree to these Terms & Conditions.
                Questions? Email <strong>{BRAND.email}</strong>
              </p>
            </div>

            {SECTIONS.map((section, idx) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 bg-white rounded-2xl border border-stone-200 p-6 md:p-8"
              >
                <div className="flex items-center gap-4 mb-5">
                  <span className="w-10 h-10 rounded-full bg-green-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-stone-900">{section.title}</h2>
                </div>

                <div className="space-y-3">
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="text-sm md:text-base text-stone-600 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                {section.id === "contact" && (
                  <div className="grid sm:grid-cols-2 gap-3 mt-6">
                    <a
                      href={`tel:${BRAND.phoneTel}`}
                      className="flex items-center gap-3 bg-stone-50 hover:bg-green-50 rounded-xl border border-stone-200 p-4 transition-colors"
                    >
                      <span className="text-xl">📞</span>
                      <span className="text-sm font-semibold text-stone-800">{BRAND.phoneDisplay}</span>
                    </a>
                    <a
                      href={`mailto:${BRAND.email}`}
                      className="flex items-center gap-3 bg-stone-50 hover:bg-green-50 rounded-xl border border-stone-200 p-4 transition-colors break-all"
                    >
                      <span className="text-xl">✉️</span>
                      <span className="text-sm font-semibold text-stone-800">{BRAND.email}</span>
                    </a>
                    <a
                      href={BRAND.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-stone-50 hover:bg-green-50 rounded-xl border border-stone-200 p-4 transition-colors"
                    >
                      <span className="text-xl">📸</span>
                      <span className="text-sm font-semibold text-stone-800">{BRAND.instagramHandle}</span>
                    </a>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-xl border border-stone-200 p-4">
                      <span className="text-xl">📍</span>
                      <span className="text-sm font-semibold text-stone-800">{BRAND.address}</span>
                    </div>
                  </div>
                )}
              </section>
            ))}

            {/* Footer CTA */}
            <section className="rounded-3xl bg-green-800 text-white p-8 md:p-10 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-orange-400/20 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-300 mb-3">Our promise</p>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
                  You're in <span className="text-orange-300">good hands</span>
                </h2>
                <p className="text-green-100 leading-relaxed max-w-lg mb-6">
                  By using {BRAND.name}, you trust us with your grocery needs. We are committed to quality,
                  transparency, and fairness in everything we do.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={BRAND.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full text-center transition-colors"
                  >
                    💬 WhatsApp Us
                  </a>
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="bg-white text-green-800 hover:bg-orange-50 font-bold px-6 py-3 rounded-full text-center transition-colors"
                  >
                    ✉️ Send Email
                  </a>
                </div>
                <p className="mt-6 text-xs text-green-200">📍 {BRAND.address}</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}