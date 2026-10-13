import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

/* ============================================================
   BRAND CONFIG — update your details here
   ============================================================ */
const BRAND = {
  name: "Anika Kisan",
  city: "Patna, Bihar",
  logo: "/Logo.png", // public/Logo.png
  phoneDisplay: "+91 62991 90014",
  phoneTel: "+916299190014",
  whatsappLink: "https://wa.me/916299190014",
  address: "Raja Bazar, Patna, Bihar — 800014",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=Raja+Bazar+Patna+Bihar+800014",
  canonical: "https://your-domain.com/user/about", // add your domain
};

// Placeholder numbers — replace with your actual numbers
const STATS = [
  { value: "1000+", label: "Happy Customers" },
  { value: "500+", label: "Products Available" },
  { value: "50+", label: "Local Farmers" },
  { value: "5+", label: "Areas Served" },
];

const STEPS = [
  {
    no: "01",
    title: "Place Your Order",
    desc: "Choose the products you need through our app or by phone and place your order.",
  },
  {
    no: "02",
    title: "Fresh from the Farm",
    desc: "Fresh produce from our local farmers is picked and prepared for your order directly.",
  },
  {
    no: "03",
    title: "Delivered to Your Door",
    desc: "Safe and on-time delivery to your doorstep, with no middlemen involved.",
  },
];

const VALUES = [
  {
    icon: "🌾",
    title: "Farm Fresh",
    desc: "Fresh produce sourced daily from local farmers, so only the best quality reaches your kitchen.",
  },
  {
    icon: "🤝",
    title: "Farmers First",
    desc: "We work to get farmers a fair price and a fair share of the value they create.",
  },
  {
    icon: "💰",
    title: "Fair Prices",
    desc: "By removing middlemen, both farmers and customers get better value.",
  },
  {
    icon: "🚚",
    title: "Quick Delivery",
    desc: "On-time delivery within our service areas, so your household essentials never run short.",
  },
];

/* ============================================================
   LOGO — image from public folder
   ============================================================ */
function Logo({ size = 56 }) {
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

function CountUp({ target }) {
  const [count, setCount] = useState(0);
  const numeric = parseInt(target.replace(/\D/g, ""), 10) || 0;
  const suffix = target.replace(/[0-9,]/g, "");

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.ceil(numeric / 60));
    const timer = setInterval(() => {
      current += step;
      if (current >= numeric) {
        setCount(numeric);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [numeric]);

  return (
    <span>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function AboutUs() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Helmet>
        <title>About Us - {BRAND.name} | Fresh Farm Products {BRAND.city}</title>
        <meta
          name="description"
          content={`Learn about ${BRAND.name} — connecting local farmers of ${BRAND.city} directly with families.`}
        />
        <link rel="canonical" href={BRAND.canonical} />
      </Helmet>

      <div className="min-h-screen bg-stone-50 font-sans text-stone-800">

        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-green-400/20 blur-3xl" />

          <div
            className={`relative max-w-5xl mx-auto px-6 py-20 md:py-28 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-white rounded-2xl p-3 shadow-lg mb-6">
                <Logo size={72} />
              </div>

              <span className="inline-block bg-orange-500/90 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest mb-5">
                {BRAND.city}
              </span>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
                {BRAND.name}
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-orange-300 mb-4">
                From the Farm to Your Home
              </p>
              <p className="text-green-100 max-w-2xl leading-relaxed mb-10">
                {BRAND.name} builds a direct connection between local farmers and families,
                so you get fresh, pure, and honest groceries.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`tel:${BRAND.phoneTel}`}
                  className="bg-white text-green-800 font-bold px-7 py-3 rounded-full hover:bg-orange-100 transition-colors shadow"
                >
                  📞 Call Us
                </a>
                <a
                  href={BRAND.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 text-white font-bold px-7 py-3 rounded-full hover:bg-orange-600 transition-colors shadow"
                >
                  💬 WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STATS BAND ============ */}
        <section className="bg-orange-500 text-white">
          <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold">
                  <CountUp target={s.value} />
                </p>
                <p className="text-sm text-orange-100 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ OUR STORY ============ */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3 mb-6 leading-snug text-stone-800">
                A <span className="text-green-700">Simple Idea</span> That Started It All
              </h2>
              <p className="text-stone-600 leading-relaxed mb-4">
                {BRAND.name} began with a simple observation: farmers work hard, yet much of
                their earnings and the money city families spend on groceries never reach
                the people who grow the food.
              </p>
              <p className="text-stone-600 leading-relaxed">
                So we built a platform that connects directly with local farmers, bringing
                fresh vegetables, grains, dairy, and everyday essentials to your home.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-3xl translate-x-4 translate-y-4" />
              <div className="relative bg-gradient-to-br from-green-700 to-green-600 rounded-3xl p-10 flex flex-col items-center text-center text-white shadow-xl">
                <div className="bg-white rounded-2xl p-4 mb-6">
                  <Logo size={96} />
                </div>
                <p className="text-2xl font-bold mb-2">{BRAND.name}</p>
                <p className="text-green-100 text-sm">Farm to Family · {BRAND.city}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="bg-white border-y border-stone-200">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
                How It Works
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3 text-stone-800">
                Three Simple Steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step) => (
                <div
                  key={step.no}
                  className="relative p-8 rounded-2xl bg-stone-50 border border-stone-200 hover:border-green-300 transition-colors"
                >
                  <span className="absolute -top-5 left-8 bg-green-700 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                    {step.no}
                  </span>
                  <h3 className="text-lg font-bold text-stone-800 mt-3 mb-2">{step.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ VALUES ============ */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3 text-stone-800">What We Stand For</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="group p-7 rounded-2xl bg-white border-t-4 border-green-600 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">
                  {v.icon}
                </div>
                <h3 className="font-bold text-lg text-stone-800 mb-2">{v.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section className="bg-green-900 text-white">
          <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-300">
                Get in Touch
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3 mb-4">Contact Us</h2>
              <p className="text-green-200 mb-10 leading-relaxed">
                Have a question or want to partner with us? We'd love to hear from you.
              </p>

              <div className="space-y-5">
                <a
                  href={`tel:${BRAND.phoneTel}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-xl">📞</div>
                  <div>
                    <p className="text-xs text-green-300 mb-0.5">Call / WhatsApp</p>
                    <p className="font-bold">{BRAND.phoneDisplay}</p>
                  </div>
                </a>

                <a
                  href={BRAND.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-xl">📍</div>
                  <div>
                    <p className="text-xs text-green-300 mb-0.5">Our Address</p>
                    <p className="font-bold leading-snug">{BRAND.address}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick card */}
            <div className="flex flex-col justify-center">
              <div className="bg-white text-stone-800 rounded-3xl p-8 shadow-2xl">
                <Logo size={48} />
                <h3 className="text-2xl font-extrabold mt-4 mb-2">Order Today</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  Fresh products, fair prices, and on-time delivery. A single call or message is all it takes.
                </p>
                <a
                  href={BRAND.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FOOTER STRIP ============ */}
        <section className="bg-orange-500 text-white">
          <div className="max-w-5xl mx-auto px-6 py-10 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
              Fresh from the Farm, Right to Your Door 🌿
            </h2>
            <p className="text-orange-100">
              Trusted by thousands of families who shop with {BRAND.name}.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}