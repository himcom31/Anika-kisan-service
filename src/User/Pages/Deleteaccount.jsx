import { useState } from "react";

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
  supportHours: "Monday – Saturday, 9:00 AM – 6:00 PM IST",
  processingDays: "7 business days",
  effectiveDate: "January 1, 2026",
  lastUpdated: "July 2026",
  version: "1.0",
};

const STEPS = [
  {
    title: "Send a Request",
    desc: `Email ${BRAND.email} from your registered address with the subject "Account Deletion Request".`,
  },
  {
    title: "Verify Your Identity",
    desc: "Include your full name and registered mobile number so our team can confirm it is you.",
  },
  {
    title: "Get Confirmation",
    desc: `We process the request within ${BRAND.processingDays} and email you once your data is removed.`,
  },
];

const DELETED_ITEMS = [
  "Profile information (name, email, phone number)",
  "Saved delivery addresses and location preferences",
  "Account credentials and login information",
  "App settings and notification preferences",
  "Wishlist, cart data, and saved product lists",
  "Loyalty points or wallet balance (non-refundable)",
];

const RETAINED_ITEMS = [
  "Order history and invoices, kept up to 90 days for accounting, tax, and legal compliance",
  "Records needed to resolve open disputes or meet legal obligations, kept only for the period the law requires",
];

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: `At ${BRAND.name}, we respect your right to control your personal data. If you wish to delete your account and all associated information, you can request deletion at any time using the process outlined below.

Once we receive your deletion request, our support team will process it within ${BRAND.processingDays} and send you a confirmation email once your account and data have been permanently removed from our grocery platform.`,
  },
  {
    id: "how-to-request",
    title: "How to Request Deletion",
    content: `To request deletion of your ${BRAND.name} account, please follow these steps:

1. Send an email to ${BRAND.email} from your registered email address, or mention your registered phone number in the email.
2. Use the subject line: "Account Deletion Request"
3. Include your full name and registered mobile number for identity verification.
4. Our support team will verify your identity and process the request within ${BRAND.processingDays}.

Alternatively, you can WhatsApp or call us at ${BRAND.phoneDisplay} during support hours (${BRAND.supportHours}) to initiate the request directly.`,
  },
  {
    id: "data-deleted",
    title: "What Data Will Be Deleted",
    content: "",
    list: DELETED_ITEMS,
    intro: "Upon successful verification of your request, the following data associated with your grocery account will be permanently deleted:",
  },
  {
    id: "data-retained",
    title: "What Data May Be Retained",
    content: "",
    list: RETAINED_ITEMS,
    intro: "In certain cases, we may need to keep some information even after deletion, in line with applicable laws and legitimate business purposes:",
    footer: "Once the retention period has passed, all remaining data will be permanently and irreversibly deleted from our systems.",
  },
  {
    id: "contact",
    title: "Contact Us",
    content: `If you have any questions about the deletion process or need help with your grocery orders before proceeding, reach out to us anytime during support hours.`,
  },
];

export default function DeleteAccount() {
  const [activeId, setActiveId] = useState("overview");

  const handleScroll = (id) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
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
              Delete Your <span className="text-orange-300">Account</span>
            </h1>
            <p className="text-green-100 leading-relaxed max-w-lg">
              We're sorry to see you go. Here is how you can request deletion of your {BRAND.name} account
              and all associated data.
            </p>
          </div>

          {/* Meta card */}
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

      {/* ============ QUICK STEPS ============ */}
      <section className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <div key={step.title} className="bg-white rounded-2xl p-6 shadow-md border border-stone-100">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-full bg-green-700 text-white font-bold flex items-center justify-center text-sm">
                  {i + 1}
                </span>
                <h3 className="font-bold text-stone-800">{step.title}</h3>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ BODY ============ */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid lg:grid-cols-[220px_1fr] gap-10">

        {/* Sidebar */}
        <aside>
          <div className="lg:sticky lg:top-6">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">On this page</p>
            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2">
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => handleScroll(s.id)}
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

            {/* Quick contact */}
            <div className="hidden lg:block mt-8 rounded-2xl bg-orange-500 text-white p-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-orange-100">Need help?</p>
              <a href={`tel:${BRAND.phoneTel}`} className="block text-sm font-semibold mb-2">
                📞 {BRAND.phoneDisplay}
              </a>
              <a href={`mailto:${BRAND.email}`} className="block text-sm break-all mb-3">
                ✉️ {BRAND.email}
              </a>
              <p className="text-xs text-orange-100">🕐 Mon–Sat, 9 AM – 6 PM</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0">

          {/* Warning */}
          <div className="flex gap-4 rounded-2xl border-l-4 border-orange-500 bg-orange-50 p-5 mb-10">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-sm leading-relaxed text-orange-900">
              Account deletion is <strong>permanent and cannot be undone.</strong> Saved addresses, order
              preferences, and wishlist items will be lost. Make sure you no longer need your order history
              before proceeding.
            </p>
          </div>

          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-8">
                <h2 className="text-2xl font-extrabold text-stone-900 mb-4 flex items-center gap-3">
                  <span className="h-6 w-1.5 rounded-full bg-green-600" />
                  {section.title}
                </h2>

                {section.content && (
                  <div className="space-y-3">
                    {section.content.split("\n\n").map((para, i) => (
                      <p key={i} className="text-stone-600 leading-relaxed whitespace-pre-line">
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {section.list && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6">
                    {section.intro && (
                      <p className="text-stone-600 leading-relaxed mb-5">{section.intro}</p>
                    )}
                    <ul className="space-y-3">
                      {section.list.map((item) => (
                        <li key={item} className="flex gap-3 text-sm text-stone-700 leading-relaxed">
                          <span
                            className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              section.id === "data-deleted" ? "bg-red-500" : "bg-green-600"
                            }`}
                          >
                            {section.id === "data-deleted" ? "✕" : "✓"}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    {section.footer && (
                      <p className="mt-5 pt-5 border-t border-stone-100 text-sm text-stone-500 leading-relaxed">
                        {section.footer}
                      </p>
                    )}
                  </div>
                )}

                {section.id === "contact" && (
                  <div className="grid sm:grid-cols-2 gap-4 mt-5">
                    <a href={`tel:${BRAND.phoneTel}`} className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 hover:border-green-300 transition-colors">
                      <span className="text-xl">📞</span>
                      <span className="text-sm font-semibold text-stone-800">{BRAND.phoneDisplay}</span>
                    </a>
                    <a href={`mailto:${BRAND.email}`} className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 hover:border-green-300 transition-colors break-all">
                      <span className="text-xl">✉️</span>
                      <span className="text-sm font-semibold text-stone-800">{BRAND.email}</span>
                    </a>
                    <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 hover:border-green-300 transition-colors">
                      <span className="text-xl">📸</span>
                      <span className="text-sm font-semibold text-stone-800">{BRAND.instagramHandle}</span>
                    </a>
                    <div className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4">
                      <span className="text-xl">📍</span>
                      <span className="text-sm font-semibold text-stone-800">{BRAND.address}</span>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-16 rounded-3xl bg-green-800 text-white p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-300 mb-3">Before you go</p>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-3">
                We'd love to <span className="text-orange-300">keep you</span>
              </h3>
              <p className="text-green-100 leading-relaxed max-w-lg mb-6">
                Having trouble with orders or delivery? Our support team is happy to help before you decide to leave.
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
          </div>

        </main>
      </div>
    </div>
  );
}