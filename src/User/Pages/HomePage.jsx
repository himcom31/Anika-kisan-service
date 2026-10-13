import { useState, useEffect } from "react";
import { openLoginModal } from "../utils/authEvents";
import { addToCart, toggleWishlist, fetchWishlist } from "../utils/cartWishlist";
import { useNavigate } from "react-router-dom";
const API_BASEA = import.meta.env.VITE_API_URL;

// ─── Responsive Hook ──────────────────────────────────────────────────────────
const useResponsive = () => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    isMobile: width < 600,
    isTablet: width >= 600 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
);

const Icon = ({ size = 22, fill = "none", children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// ─── Cart Toast ───────────────────────────────────────────────────────────────
const CartToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      const { name, image } = e.detail || {};
      setToasts(prev => [...prev, { id, name, image, exiting: false }]);
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      }, 2800);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3200);
    };
    window.addEventListener("cart:added", handler);
    return () => window.removeEventListener("cart:added", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn { from { opacity: 0; transform: translateX(110%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes toastSlideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(110%); } }
        @keyframes toastProgress { from { width: 100%; } to { width: 0%; } }
      `}</style>
      <div style={{ position: "fixed", bottom: 24, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", pointerEvents: "none" }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(45,158,45,0.10)",
            padding: "10px 16px 10px 10px", minWidth: 260, maxWidth: 320,
            border: "1.5px solid #e8f5e9", position: "relative", overflow: "hidden",
            animation: toast.exiting ? "toastSlideOut 0.38s cubic-bezier(0.4,0,1,1) forwards" : "toastSlideIn 0.38s cubic-bezier(0,0,0.2,1) forwards",
            pointerEvents: "auto",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f0f9f0", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e8f5e9" }}>
              {toast.image ? <img src={toast.image} alt={toast.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>🛒</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#2d9e2d", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#2d9e2d" }}>Added to Cart!</span>
              </div>
              <div style={{ fontSize: 11, color: "#555", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{toast.name || "Product"}</div>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, background: "#2d9e2d", borderRadius: "0 0 0 12px", animation: `toastProgress 3s linear forwards` }} />
          </div>
        ))}
      </div>
    </>
  );
};

// ─── Fallback Hero Slide (API se banner na aaye to ye dikhega) ───────────────
const FALLBACK_HERO_SLIDE = {
  id: "fallback",
  title: "Tasty & Healthy Organic Food",
  description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore.",
  bannerImage: "/hero-bg.jpg",
  tagline: "100% genuine Products",
  link: "/user/product",
};

// ─── Full-page Hero (header ke peeche, poori width aur poori height) ─────────
const HeroSection = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/list`);
        const data = await res.json();
        if (data.success) {
          setSlides((data.data || []).filter(b => b.status === "Active"));
        }
      } catch (err) {
        console.error("Banner fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const list = slides.length ? slides : [FALLBACK_HERO_SLIDE];
  const total = list.length;
  const active = list[current] || list[0];

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total, current]);

  const next = () => setCurrent(c => (c + 1) % total);
  const prev = () => setCurrent(c => (c - 1 + total) % total);

  const padX = isMobile ? 20 : 70;

  const arrowBase = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: isMobile ? 44 : 88,
    height: isMobile ? 44 : 88,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#fff",
    cursor: "pointer",
    zIndex: 3,
    padding: 0,
  };

  if (loading) {
    return <div style={{ width: "100%", height: "100vh", minHeight: 600, background: "#1c1c1c" }} />;
  }

  return (
    <section style={{
      position: "relative",
      width: "100%",
      height: "100vh",
      minHeight: 600,
      overflow: "hidden",
      background: "#1c1c1c",
    }}>
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Background images (crossfade) */}
      {list.map((s, i) => (
        <div
          key={s.id || i}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${s.bannerImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        />
      ))}

      {/* Overlay: top (header readable) + left (text readable) */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%),
          linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.05) 100%)
        `,
      }} />

      {/* Content */}
      <div
        key={current}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: `100px ${padX}px 90px`,
          animation: "heroFadeUp 0.7s ease both",
        }}
      >
        <div style={{
          color: "#7ab800",
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 16 : 20,
          marginBottom: 6,
        }}>
          {active.tagline || "100% genuine Products"}
        </div>

        <h1 style={{
          color: "#fff",
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 42 : isTablet ? 58 : 76,
          lineHeight: 1.02,
          letterSpacing: -0.3,
          margin: "0 0 26px",
          maxWidth: 760,
        }}>
          {active.title}
        </h1>

        {active.description && (
          <p style={{
            color: "#fff",
            fontFamily: "'Open Sans', sans-serif",
            fontSize: isMobile ? 16 : 22,
            lineHeight: 1.7,
            margin: "0 0 40px",
            borderLeft: "1px solid rgba(255,255,255,0.4)",
            paddingLeft: isMobile ? 16 : 46,
            maxWidth: 700,
          }}>
            {active.description}
          </p>
        )}

        <button
          onClick={() => navigate(active.link || "/user/product")}
          style={{
            alignSelf: "flex-start",
            width: isMobile ? "100%" : 287,
            height: isMobile ? 56 : 89,
            background: "#7ab800",
            color: "#fff",
            border: "none",
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? 18 : 22,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#68a010")}
          onMouseLeave={e => (e.currentTarget.style.background = "#7ab800")}
        >
          Explore Products
        </button>
      </div>

      {/* Prev / Next arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            style={{ ...arrowBase, left: isMobile ? 10 : 36 }}
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            style={{ ...arrowBase, right: isMobile ? 10 : 36 }}
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div style={{
          position: "absolute",
          bottom: isMobile ? 20 : 36,
          left: padX,
          zIndex: 3,
          display: "flex",
          gap: 6,
        }}>
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: i === current ? 28 : 8,
                height: 4,
                borderRadius: 2,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === current ? "#7ab800" : "rgba(255,255,255,0.45)",
                transition: "width 0.3s, background 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// ─── Ad Cards (Hot Sales) ─────────────────────────────────────────────────────
// API se ads aayein to wo dikhenge, warna ye fallback cards dikhenge.
// Image dikhani ho to "image" field mein public folder ka path daalein (e.g. "/ad-1.png")
const FALLBACK_ADS = [
  {
    id: "ad-1",
    tag: "HOT SALES",
    title: "Big Sale",
    subtitle: "Mango & Juice",
    cta: "Buy Now",
    link: "/user/product",
    bg: "#ff9f0a",
    textColor: "#fff",
    emoji: "🍊",
  },
  {
    id: "ad-2",
    tag: "HOT SALES",
    title: "Save 20%",
    subtitle: "Every Order",
    cta: "Buy Now",
    link: "/user/product",
    bg: "#133a06",
    textColor: "#fff",
    emoji: "🍐",
  },
  {
    id: "ad-3",
    tag: "HERBAL POWDER",
    title: "Up To 20%",
    subtitle: "Every Package",
    cta: "Buy Now",
    link: "/user/product",
    bg: "#7ab800",
    textColor: "#fff",
    emoji: "🌿",
  },
];

// ─── Ad Card ──────────────────────────────────────────────────────────────────
const AdCard = ({ ad, height }) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [hover, setHover] = useState(false);

  const hoverStyle = {
    transform: hover ? "translateY(-4px)" : "none",
    boxShadow: hover ? "0 14px 30px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  };

  // Case 1: API wali image ad — image apne natural ratio mein poori dikhegi, koi overlay nahi
  if (ad.image) {
    return (
      <div
        onClick={() => navigate(ad.link || "/user/product")}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          borderRadius: 6,
          overflow: "hidden",
          cursor: "pointer",
          background: "transparent",
          ...hoverStyle,
        }}
      >
        <img
          src={ad.image}
          alt={ad.title || "Ad"}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>
    );
  }

  // Case 2: fallback card (text + emoji)
  const bg = ad.bg || "#f4f4f4";
  const textColor = ad.textColor || "#fff";
  const padX = isMobile ? 22 : 44;

  return (
    <div
      onClick={() => navigate(ad.link || "/user/product")}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        height,
        background: bg,
        borderRadius: 6,
        overflow: "hidden",
        cursor: "pointer",
        fontFamily: "'Rajdhani', sans-serif",
        ...hoverStyle,
      }}
    >
      <span
        style={{
          position: "absolute",
          right: isMobile ? 16 : 44,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: isMobile ? 64 : 150,
          lineHeight: 1,
          filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.25))",
        }}
      >
        {ad.emoji || "🛒"}
      </span>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          padding: `0 ${padX}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: textColor,
          maxWidth: isMobile ? "62%" : "60%",
        }}
      >
        {ad.tag && (
          <div style={{
            fontSize: isMobile ? 12 : 17,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            opacity: 0.9,
            marginBottom: 6,
          }}>
            {ad.tag}
          </div>
        )}
        <div style={{
          fontSize: isMobile ? 26 : 50,
          fontWeight: 700,
          lineHeight: 1.05,
          marginBottom: 4,
        }}>
          {ad.title}
        </div>
        {ad.subtitle && (
          <div style={{
            fontSize: isMobile ? 17 : 32,
            fontWeight: 600,
            lineHeight: 1.2,
            marginBottom: 14,
          }}>
            {ad.subtitle}
          </div>
        )}
        <div style={{
          fontSize: isMobile ? 14 : 20,
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}>
          {ad.cta || "Buy Now"} <span>→</span>
        </div>
      </div>
    </div>
  );
};

// ─── Ad Section (Hot Sales) ───────────────────────────────────────────────────
const AdSection = () => {
  const { isMobile } = useResponsive();
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch(`${API_BASEA}/api/ad/`)
      .then(r => r.json())
      .then(data => setAds((data.ads || []).filter(a => a.isActive)))
      .catch(() => { });
  }, []);

  const list = (ads.length ? ads : FALLBACK_ADS).slice(0, 3);
  const height = isMobile ? 170 : 340;
  const columns = isMobile ? "1fr" : `repeat(${list.length}, 1fr)`;

  return (
    <section style={{
      margin: isMobile ? "28px 0" : "70px 0 60px",
      padding: isMobile ? "0 10px" : "0 clamp(20px, 3.7vw, 70px)",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: columns,
        gap: isMobile ? 14 : 45,
        alignItems: "start",
      }}>
        {list.map((ad, i) => (
          <AdCard key={ad.id || i} ad={ad} height={height} />
        ))}
      </div>
    </section>
  );
};

// ─── Feature Categories ───────────────────────────────────────────────────────
const FeatureCategories = ({ categories, loading }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [currentSlide, setCurrentSlide] = useState(0);

  const visibleCount = isMobile ? 2 : isTablet ? 3 : 5;
  const total = categories.length;
  const totalSlides = Math.max(0, total - visibleCount + 1);

  const handleCategoryClick = (cat) => {
    const hasSubCats = (cat.subCategories || []).filter(s => s.isActive !== false).length > 0;
    if (hasSubCats) {
      navigate(`/user/categories/${cat.id}`);
    } else {
      navigate(`/user/product?categories=${cat.id}`);
    }
  };
  const goPrev = () => setCurrentSlide(s => Math.max(0, s - 1));
  const goNext = () => setCurrentSlide(s => Math.min(totalSlides - 1, s + 1));

  const CARD_W = isMobile ? 120 : isTablet ? 160 : 190;
  const CARD_H = isMobile ? 110 : isTablet ? 150 : 170;
  const GAP = isMobile ? 10 : 16;

  return (
    <section
      id="feature-categories"
      style={{ marginBottom: isMobile ? 36 : isTablet ? 52 : 72, scrollMarginTop: 80 }}
    >
      <style>{`
        #feature-categories * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

        @keyframes fc-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }

        .fc-card {
          flex-shrink: 0;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .fc-img-wrap {
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(145deg, #f9fdf9, #edf7ed);
          border: 2px solid rgba(45,158,45,0.12);
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.28s ease,
                      border-color 0.28s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .fc-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55) 0%, transparent 70%);
          pointer-events: none;
        }
        .fc-img-wrap img {
          width: 76%;
          height: 76%;
          object-fit: contain;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
          z-index: 1;
        }

        .fc-card:hover .fc-img-wrap {
          transform: translateY(-6px) scale(1.04);
          box-shadow: 0 14px 36px rgba(45,158,45,0.22), 0 4px 12px rgba(0,0,0,0.06);
          border-color: rgba(45,158,45,0.32);
        }
        .fc-card:hover .fc-img-wrap img {
          transform: scale(1.06);
        }
        .fc-card:hover .fc-label {
          color: #1e7b1e;
        }

        .fc-label {
          font-size: 13px;
          font-weight: 700;
          color: #2a2a2a;
          text-align: center;
          letter-spacing: 0.08px;
          transition: color 0.2s;
          line-height: 1.3;
          padding: 0 4px;
        }

        .fc-arrow {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid rgba(45,158,45,0.25);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(45,158,45,0.18);
          transition: background 0.18s, border-color 0.18s,
                      transform 0.18s, box-shadow 0.18s;
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          z-index: 10;
          flex-shrink: 0;
        }
        .fc-arrow svg { transition: transform 0.18s; }
        .fc-arrow:hover {
          background: #2d9e2d;
          border-color: #2d9e2d;
          box-shadow: 0 4px 18px rgba(45,158,45,0.38);
        }
        .fc-arrow:hover svg { transform: scale(1.15); }
        .fc-arrow:hover svg polyline { stroke: #fff; }
        .fc-arrow:disabled {
          background: #f5f5f5;
          border-color: #e0e0e0;
          cursor: default;
          box-shadow: none;
          opacity: 0.55;
        }
        .fc-arrow:disabled svg polyline { stroke: #b0b0b0; }

        .fc-dot {
          width: 7px; height: 7px;
          border-radius: 999px;
          border: none; cursor: pointer; padding: 0;
          transition: background 0.22s, width 0.22s, transform 0.22s;
          background: #d5d5d5;
        }
        .fc-dot.active {
          background: linear-gradient(90deg, #2d9e2d, #52cc52);
          width: 22px;
          border-radius: 999px;
        }

        .fc-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e4e4e4 50%, #f0f0f0 75%);
          background-size: 800px 100%;
          animation: fc-shimmer 1.4s infinite linear;
          border-radius: 20px;
        }

        .fc-viewall {
          border: 2px solid #2d9e2d;
          border-radius: 99px;
          padding: 10px 52px;
          font-size: 14px;
          font-weight: 700;
          color: #2d9e2d;
          background: #fff;
          cursor: pointer;
          letter-spacing: 0.4px;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.15s;
          display: inline-block;
        }
        .fc-viewall:hover {
          background: linear-gradient(135deg, #2d9e2d, #3eb83e);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 6px 22px rgba(45,158,45,0.32);
          transform: translateY(-1px);
        }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: isMobile ? 22 : 32 }}>
        <p style={{
          fontSize: isMobile ? 11 : 12,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          color: "#2d9e2d",
          margin: "0 0 8px",
        }}>
          Shop by Category
        </p>
        <h2 style={{
          fontSize: isMobile ? 20 : isTablet ? 26 : 30,
          fontWeight: 800,
          color: "#111",
          margin: "0 0 12px",
          lineHeight: 1.15,
        }}>
          Featured Categories
        </h2>
        <div style={{
          width: isMobile ? 56 : 80,
          height: 3,
          borderRadius: 99,
          background: "linear-gradient(90deg, #2d9e2d, #88e088)",
          margin: "0 auto",
        }} />
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: GAP, justifyContent: "center", padding: `0 ${isMobile ? 40 : 56}px`, overflow: "hidden" }}>
          {[...Array(visibleCount)].map((_, i) => (
            <div key={i} style={{ flexShrink: 0, width: CARD_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div className="fc-skeleton" style={{ width: CARD_W, height: CARD_H }} />
              <div className="fc-skeleton" style={{ width: 64, height: 12, borderRadius: 6 }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <button
            className="fc-arrow"
            onClick={goPrev}
            disabled={currentSlide === 0}
            style={{ left: isMobile ? 0 : 4 }}
            aria-label="Previous"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d9e2d" strokeWidth="2.8" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div style={{ overflow: "hidden", margin: `0 ${isMobile ? 44 : 60}px` }}>
            <div style={{
              display: "flex",
              gap: GAP,
              transform: `translateX(-${currentSlide * (CARD_W + GAP)}px)`,
              transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
            }}>
              {categories.map((cat, i) => {
                const img = cat.thumbnail || cat.image;
                return (
                  <div
                    key={cat.id || i}
                    className="fc-card"
                    style={{ width: CARD_W }}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <div className="fc-img-wrap" style={{ width: CARD_W, height: CARD_H }}>
                      {img ? (
                        <img
                          src={img}
                          alt={cat.name}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <span style={{ fontSize: isMobile ? 36 : 52 }}>🛒</span>
                      )}
                    </div>
                    <span className="fc-label" style={{ fontSize: isMobile ? 12 : 13 }}>
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="fc-arrow"
            onClick={goNext}
            disabled={currentSlide >= totalSlides - 1}
            style={{ right: isMobile ? 0 : 4 }}
            aria-label="Next"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d9e2d" strokeWidth="2.8" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {!loading && totalSlides > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: isMobile ? 18 : 24 }}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              className={`fc-dot${currentSlide === i ? " active" : ""}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: isMobile ? 18 : 26 }}>
        <button className="fc-viewall" onClick={() => navigate("/user/categories")}>
          View All Categories
        </button>
      </div>
    </section>
  );
};

// ─── Round action button (Popular Products ke hover par) ──────────────────────
const ActionBtn = ({ label, onClick, primary, disabled, size = 60, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "translateY(-3px)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: "none",
      padding: 0,
      background: primary ? "#7ab800" : "#fff",
      color: primary ? "#fff" : "#0d1f1f",
      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      transition: "transform 0.2s ease",
      flexShrink: 0,
    }}
  >
    {children}
  </button>
);

// ─── Countdown (compact) ──────────────────────────────────────────────────────
const getRemaining = (endDate) => {
  const diff = new Date(endDate).getTime() - Date.now();
  if (isNaN(diff) || diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    mins: Math.floor(diff / 60000) % 60,
    secs: Math.floor(diff / 1000) % 60,
  };
};

const Countdown = ({ endDate, hidden }) => {
  const [time, setTime] = useState(() => getRemaining(endDate));

  useEffect(() => {
    setTime(getRemaining(endDate));
    const id = setInterval(() => setTime(getRemaining(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!time) return null;

  const units = [
    ["days", "Days"],
    ["hours", "Hours"],
    ["mins", "Mins"],
    ["secs", "Secs"],
  ];

  return (
    <div style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      background: "#fff",
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      textAlign: "center",
      padding: "6px 0 5px",
      zIndex: 2,
      opacity: hidden ? 0 : 1,
      transition: "opacity 0.25s ease",
      pointerEvents: "none",
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      {units.map(([key, label]) => (
        <div key={key}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f1f", lineHeight: 1 }}>
            {String(time[key]).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 11, color: "#333", marginTop: 2 }}>{label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Product Card (Popular Products, compact) ─────────────────────────────────
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [hover, setHover] = useState(false);

  const oldPrice = Number(product.price || product.buyingPrice || 0);
  const price = Number(product.oldPrice || product.sellingPrice || 0);
  const name = product.name || product.title || "Product";
  const image = product.image || product.thumbnail || product.images?.[0];
  const stock = product.stockQuantity ?? 0;
  const isOutOfStock = stock === 0;
  const hasOffer = oldPrice > price && price > 0;
  const discount = hasOffer ? Math.round((1 - price / oldPrice) * 100) : 0;
  const endDate = product.offerEndDate || product.discountEndDate;

  const imgHeight = isMobile ? 140 : isTablet ? 170 : 190;
  const iconSize = isMobile ? 13 : 17;
  const btnSize = isMobile ? 30 : 42;
  const showActions = hover || isMobile;

  const isLoggedIn = () => !!localStorage.getItem("userToken");

  useEffect(() => {
    if (!isLoggedIn()) return;
    fetchWishlist().then(data => {
      const ids = (data.products || []).map(p => p.id || p);
      setWished(ids.includes(product.id));
    }).catch(() => { });
  }, [product.id]);

  const handleView = (e) => {
    e?.stopPropagation();
    if (product.slug) navigate(`/products/${product.slug}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { openLoginModal(); return; }
    if (adding || isOutOfStock) return;
    setAdding(true);
    try {
      await addToCart(product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
      window.dispatchEvent(new CustomEvent("cart:added", { detail: { name, image } }));
    } catch {
      alert("Failed to add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { openLoginModal(); return; }
    try {
      await toggleWishlist(product.id, wished);
      setWished(w => !w);
    } catch {
      alert("Failed to update wishlist. Please try again.");
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleView}
        style={{
          background: "#fff",
          border: "1px solid #efefef",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          boxShadow: hover ? "0 12px 30px rgba(0,0,0,0.10)" : "none",
          transition: "box-shadow 0.3s ease",
          fontFamily: "'Rajdhani', sans-serif",
          height: "100%",
        }}
      >
        {/* Image area */}
        <div style={{
          position: "relative",
          height: imgHeight,
          background: "#f7f7f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          {image ? (
            <img
              src={image}
              alt={name}
              onError={e => { e.currentTarget.style.display = "none"; }}
              style={{
                width: "76%",
                height: "76%",
                objectFit: "contain",
                transform: hover ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.4s ease",
              }}
            />
          ) : (
            <span style={{ fontSize: isMobile ? 32 : 44 }}>🛒</span>
          )}

          {/* Discount badge */}
          {hasOffer && (
            <span style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#7ab800",
              color: "#fff",
              fontSize: isMobile ? 11 : 12,
              fontWeight: 700,
              padding: isMobile ? "2px 7px" : "4px 10px",
              borderRadius: 2,
              zIndex: 2,
            }}>
              -{discount}%
            </span>
          )}

          {/* Countdown */}
          {endDate && <Countdown endDate={endDate} hidden={hover && !isMobile} />}

          {/* Hover actions */}
          <div style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: isMobile ? 8 : 16,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: isMobile ? 4 : 8,
            zIndex: 3,
            opacity: showActions ? 1 : 0,
            transform: showActions ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            pointerEvents: showActions ? "auto" : "none",
          }}>
            <ActionBtn label="Quick view" size={btnSize} onClick={handleView}>
              <Icon size={iconSize}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </Icon>
            </ActionBtn>

            <ActionBtn
              label="Add to cart"
              primary
              size={btnSize}
              disabled={isOutOfStock || adding}
              onClick={handleAddToCart}
            >
              {adding ? (
                <span style={{
                  width: iconSize - 2,
                  height: iconSize - 2,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }} />
              ) : added ? (
                <Icon size={iconSize}><polyline points="20 6 9 17 4 12" /></Icon>
              ) : (
                <Icon size={iconSize}>
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </Icon>
              )}
            </ActionBtn>

            <ActionBtn label="Wishlist" size={btnSize} onClick={handleWishlist}>
              <Icon size={iconSize} fill={wished ? "#e74c3c" : "none"}>
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke={wished ? "#e74c3c" : "currentColor"}
                />
              </Icon>
            </ActionBtn>

            <ActionBtn label="Compare" size={btnSize} onClick={e => e.stopPropagation()}>
              <Icon size={iconSize}>
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </Icon>
            </ActionBtn>
          </div>
        </div>

        {/* Body */}
        <div style={{
          padding: isMobile ? "8px 8px 10px" : "14px 12px 16px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isMobile ? 4 : 6,
          flex: 1,
        }}>
          <div
            title={name}
            style={{
              fontSize: isMobile ? 13 : 15,
              fontWeight: 700,
              color: "#0d1f1f",
              lineHeight: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: isMobile ? 0 : 38,
            }}
          >
            {name}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: "#7ab800" }}>
              ₹{price.toFixed(2)}
            </span>
            {hasOffer && (
              <span style={{
                fontSize: isMobile ? 11 : 13,
                fontWeight: 600,
                color: "#7ab800",
                opacity: 0.55,
                textDecoration: "line-through",
              }}>
                ₹{oldPrice.toFixed(2)}
              </span>
            )}
          </div>

          {isOutOfStock && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#c0392b" }}>Out of stock</span>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Popular Products (4 per row) ─────────────────────────────────────────────
const PopularProducts = ({ products, loading }) => {
  const { isMobile, isTablet } = useResponsive();
  const [categories, setCategories] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASEA}/api/Category/all`)
      .then(r => r.json())
      .then(data => {
        const cats = Array.isArray(data) ? data : data.categories || data.data || [];
        setCategories(cats.filter(c => c.isActive));
      })
      .catch(() => { });
  }, []);

  // Koi tab select nahi hai to pehli category active rahegi
  const currentId = activeId ?? categories[0]?.id ?? null;

  const getProductCatId = (p) => {
    if (!p.category) return "";
    if (typeof p.category === "object") return p.category.id || "";
    return p.category;
  };

  const displayedProducts = products
    .filter(p => getProductCatId(p) === currentId)
    .slice(0, 8);

  // Desktop aur tablet par 4 cards ek row mein, mobile par 2
  const columns = isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)";
  const gap = isMobile ? 10 : 20;

  return (
    <section id="popular-product" style={{ marginBottom: isMobile ? 40 : 80 }}>
      <h2 style={{
        textAlign: "center",
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: isMobile ? 34 : isTablet ? 44 : 58,
        fontWeight: 700,
        color: "#0d1f1f",
        margin: isMobile ? "0 0 24px" : "0 0 40px",
        lineHeight: 1.05,
      }}>
        Popular Products
      </h2>

      {/* Category tabs */}
      <div style={{
        display: "flex",
        justifyContent: isMobile ? "flex-start" : "center",
        alignItems: "center",
        overflowX: "auto",
        scrollbarWidth: "none",
        marginBottom: isMobile ? 24 : 40,
        paddingBottom: 2,
      }}>
        {categories.map((cat, i) => {
          const active = cat.id === currentId;
          return (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {i > 0 && (
                <span style={{ width: 1, height: 16, background: "#cfd8cf", flexShrink: 0 }} />
              )}
              <button
                onClick={() => setActiveId(cat.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: isMobile ? "8px 14px 10px" : "8px 36px 12px",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: isMobile ? 14 : 18,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                  color: active ? "#7ab800" : "#0d1f1f",
                  borderBottom: `2px solid ${active ? "#7ab800" : "transparent"}`,
                  whiteSpace: "nowrap",
                  transition: "color 0.2s, border-color 0.2s",
                }}
              >
                {cat.name}
              </button>
            </div>
          );
        })}
      </div>

      {/* Product grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: columns, gap }}>
          {[...Array(isMobile ? 4 : 8)].map((_, i) => (
            <div key={i} style={{ height: isMobile ? 220 : 300, background: "#f0f0f0", animation: "pulse 1.4s ease-in-out infinite" }} />
          ))}
        </div>
      ) : displayedProducts.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: columns, gap, gridAutoRows: "1fr" }}>
          {displayedProducts.map((p, i) => (
            <ProductCard key={p.id || i} product={p} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 15, fontFamily: "'Rajdhani', sans-serif" }}>
          No products found in this category.
        </div>
      )}
    </section>
  );
};

// ─── News Feed (Blog) ─────────────────────────────────────────────────────────
const BLOG_API_LIST = `${API_BASEA}/api/blog/all`;

const formatBlogDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const getBlogAuthor = (blog) => {
  if (!blog.author) return "Admin";
  if (typeof blog.author === "object") return blog.author.name || "Admin";
  return blog.author;
};

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ab800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ab800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [hover, setHover] = useState(false);

  const imgHeight = isMobile ? 210 : isTablet ? 220 : 250;
  const title = blog.title || "Untitled";
  const dateText = formatBlogDate(blog.createdAt);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate("/user/blog")}
      style={{
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        boxShadow: hover ? "0 14px 34px rgba(0,0,0,0.10)" : "0 2px 10px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.3s ease",
        height: "100%",
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      {/* Image */}
      <div style={{ height: imgHeight, overflow: "hidden", background: "#eef2ee", flexShrink: 0 }}>
        {blog.thumbnail ? (
          <img
            src={blog.thumbnail}
            alt={title}
            onError={e => { e.currentTarget.style.display = "none"; }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: hover ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 14 }}>
            No Image
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{
        padding: isMobile ? "18px 18px 20px" : "24px 26px 24px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#0d1f1f", marginBottom: 12 }}>
          <UserIcon />
          <span>by: {getBlogAuthor(blog)}</span>
        </div>

        <h3
          title={title}
          style={{
            fontSize: isMobile ? 20 : 24,
            fontWeight: 700,
            color: "#0d1f1f",
            lineHeight: 1.2,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: isMobile ? 0 : 58,
          }}
        >
          {title}
        </h3>

        <div style={{ height: 1, background: "#ececec", margin: "18px 0 16px" }} />

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#0d1f1f" }}>
            <CalendarIcon />
            <span>{dateText}</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#7ab800" }}>Read More</span>
        </div>
      </div>
    </div>
  );
};

const BlogSection = () => {
  const { isMobile, isTablet } = useResponsive();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(BLOG_API_LIST)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const all = Array.isArray(data) ? data : data.blogs || data.data || [];
        const latest = all
          .filter(b => b.isActive !== false)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 9);
        setBlogs(latest);
      })
      .catch(() => { })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Blog data nahi hai to pura section hide
  if (!loading && blogs.length === 0) return null;

  const perPage = isMobile ? 1 : isTablet ? 2 : 3;
  const totalPages = Math.max(1, Math.ceil(blogs.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * perPage;
  const visible = blogs.slice(start, start + perPage);
  const columns = `repeat(${perPage}, 1fr)`;
  const gap = isMobile ? 16 : 30;
  const showArrows = totalPages > 1;

  const goPrev = () => setPage(p => Math.max(0, p - 1));
  const goNext = () => setPage(p => Math.min(totalPages - 1, p + 1));

  return (
    <section id="news-feed" style={{ marginBottom: isMobile ? 40 : 80 }}>
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 40 }}>
        <p style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: isMobile ? 14 : 17,
          fontWeight: 700,
          color: "#7ab800",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          margin: "0 0 6px",
        }}>
          Blog & Insights
        </p>
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: isMobile ? 34 : isTablet ? 44 : 58,
          fontWeight: 700,
          color: "#0d1f1f",
          margin: 0,
          lineHeight: 1.05,
        }}>
          News Feed<span style={{ color: "#7ab800" }}>.</span>
        </h2>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: columns, gap }}>
          {[...Array(perPage)].map((_, i) => (
            <div key={i} style={{ height: isMobile ? 360 : 420, background: "#f0f0f0", animation: "pulse 1.4s ease-in-out infinite" }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ position: "relative", padding: isMobile ? 0 : "0 56px" }}>
            <div style={{ display: "grid", gridTemplateColumns: columns, gap, gridAutoRows: "1fr" }}>
              {visible.map((b, i) => (
                <BlogCard key={b.id || i} blog={b} />
              ))}
            </div>

            {showArrows && !isMobile && (
              <>
                <CarouselArrow dir="left" disabled={safePage === 0} onClick={goPrev}
                  style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }} />
                <CarouselArrow dir="right" disabled={safePage >= totalPages - 1} onClick={goNext}
                  style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }} />
              </>
            )}
          </div>

          {showArrows && isMobile && (
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 18 }}>
              <CarouselArrow dir="left" disabled={safePage === 0} onClick={goPrev} />
              <CarouselArrow dir="right" disabled={safePage >= totalPages - 1} onClick={goNext} />
            </div>
          )}
        </>
      )}
    </section>
  );
};

// ─── Featured Card (Just For You) ─────────────────────────────────────────────
const FEATURED_BG = ["#fef9e7", "#f5f7f5", "#fffcf2", "#fdf0e1", "#f0f8f0", "#fbf5ec", "#f7f7f7", "#fef4e6"];

const FeaturedCard = ({ product, bg }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [hover, setHover] = useState(false);

  const oldPrice = Number(product.price || product.buyingPrice || 0);
  const price = Number(product.oldPrice || product.sellingPrice || 0);
  const name = product.name || product.title || "Product";
  const image = product.image || product.thumbnail || product.images?.[0];
  const hasOffer = oldPrice > price && price > 0;
  const discount = hasOffer ? Math.round((1 - price / oldPrice) * 100) : 0;

  const imgHeight = isMobile ? 150 : isTablet ? 200 : 230;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => product.slug && navigate(`/products/${product.slug}`)}
      style={{
        background: "#fff",
        border: "1px solid #efefef",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        boxShadow: hover ? "0 12px 30px rgba(0,0,0,0.10)" : "none",
        transition: "box-shadow 0.3s ease",
        fontFamily: "'Rajdhani', sans-serif",
        height: "100%",
      }}
    >
      {/* Image area (pastel background) */}
      <div style={{
        position: "relative",
        height: imgHeight,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {image ? (
          <img
            src={image}
            alt={name}
            onError={e => { e.currentTarget.style.display = "none"; }}
            style={{
              width: "70%",
              height: "70%",
              objectFit: "contain",
              transform: hover ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.4s ease",
            }}
          />
        ) : (
          <span style={{ fontSize: isMobile ? 32 : 44 }}>🛒</span>
        )}

        {hasOffer && (
          <span style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "#7ab800",
            color: "#fff",
            fontSize: isMobile ? 11 : 13,
            fontWeight: 700,
            padding: isMobile ? "2px 7px" : "4px 10px",
            zIndex: 2,
          }}>
            -{discount}%
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{
        padding: isMobile ? "10px 8px 12px" : "16px 12px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: isMobile ? 4 : 8,
        flex: 1,
      }}>
        <div
          title={name}
          style={{
            fontSize: isMobile ? 14 : 17,
            fontWeight: 700,
            color: "#0d1f1f",
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: isMobile ? 0 : 42,
          }}
        >
          {name}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#7ab800" }}>
            ₹{price.toFixed(2)}
          </span>
          {hasOffer && (
            <span style={{
              fontSize: isMobile ? 12 : 14,
              fontWeight: 600,
              color: "#7ab800",
              opacity: 0.55,
              textDecoration: "line-through",
            }}>
              ₹{oldPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Carousel Arrow (Just For You / News Feed) ────────────────────────────────
const CarouselArrow = ({ dir, disabled, onClick, style }) => (
  <button
    type="button"
    aria-label={dir === "left" ? "Previous" : "Next"}
    disabled={disabled}
    onClick={onClick}
    onMouseEnter={e => {
      if (!disabled) {
        e.currentTarget.style.background = "#7ab800";
        e.currentTarget.style.color = "#fff";
        e.currentTarget.style.borderColor = "#7ab800";
      }
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "#fff";
      e.currentTarget.style.color = "#0d1f1f";
      e.currentTarget.style.borderColor = "#e5e5e5";
    }}
    style={{
      width: 48,
      height: 48,
      borderRadius: "50%",
      border: "1px solid #e5e5e5",
      background: "#fff",
      color: "#0d1f1f",
      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.35 : 1,
      transition: "background 0.2s, color 0.2s, border-color 0.2s",
      padding: 0,
      flexShrink: 0,
      ...style,
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left"
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  </button>
);

// ─── Just For You (Featured style, paginated) ─────────────────────────────────
const PAGE_SIZE = 8;

const JustForYou = ({ products, loading }) => {
  const { isMobile, isTablet } = useResponsive();
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * PAGE_SIZE;
  const paginated = products.slice(start, start + PAGE_SIZE);

  const columns = isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(3, 1fr)" : "repeat(4, 1fr)";
  const gap = isMobile ? 10 : isTablet ? 16 : 20;

  const goPrev = () => setPage(p => Math.max(0, p - 1));
  const goNext = () => setPage(p => Math.min(totalPages - 1, p + 1));

  const showArrows = totalPages > 1;

  return (
    <section id="just-for-you" style={{ marginBottom: isMobile ? 40 : 80 }}>
      <h2 style={{
        textAlign: "center",
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: isMobile ? 34 : isTablet ? 44 : 58,
        fontWeight: 700,
        color: "#0d1f1f",
        margin: isMobile ? "0 0 24px" : "0 0 40px",
        lineHeight: 1.05,
      }}>
        Just For You
      </h2>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: columns, gap }}>
          {[...Array(isMobile ? 4 : 8)].map((_, i) => (
            <div key={i} style={{ height: isMobile ? 240 : 320, background: "#f0f0f0", animation: "pulse 1.4s ease-in-out infinite" }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 15, fontFamily: "'Rajdhani', sans-serif" }}>
          No products found.
        </div>
      ) : (
        <>
          <div style={{ position: "relative", padding: isMobile ? 0 : "0 56px" }}>
            <div style={{ display: "grid", gridTemplateColumns: columns, gap, gridAutoRows: "1fr" }}>
              {paginated.map((p, i) => (
                <FeaturedCard
                  key={p.id || i}
                  product={p}
                  bg={FEATURED_BG[(start + i) % FEATURED_BG.length]}
                />
              ))}
            </div>

            {showArrows && !isMobile && (
              <>
                <CarouselArrow dir="left" disabled={safePage === 0} onClick={goPrev}
                  style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }} />
                <CarouselArrow dir="right" disabled={safePage >= totalPages - 1} onClick={goNext}
                  style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }} />
              </>
            )}
          </div>

          {showArrows && isMobile && (
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 18 }}>
              <CarouselArrow dir="left" disabled={safePage === 0} onClick={goPrev} />
              <CarouselArrow dir="right" disabled={safePage >= totalPages - 1} onClick={goNext} />
            </div>
          )}
        </>
      )}
    </section>
  );
};

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isMobile } = useResponsive();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.location.hash === "#feature-categories") {
      const timer = setTimeout(() => {
        const el = document.getElementById("feature-categories");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASEA}/api/Category/all`)
      .then(r => r.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : data.categories || data.data || []);
        setCatLoading(false);
      })
      .catch(() => {
        setCatLoading(false);
        setError("Could not load categories.");
      });

    const fetchAllProducts = async () => {
      try {
        let allProducts = [], p = 1, totalPages = 1;
        do {
          const res = await fetch(`${API_BASEA}/api/Products/allFree?page=${p}&limit=100`);
          const data = await res.json();
          const batch = Array.isArray(data) ? data : data.products || data.data || [];
          allProducts = [...allProducts, ...batch];
          totalPages = data.totalPages || 1;
          p++;
        } while (p <= totalPages);
        setProducts(allProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setProdLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  return (
    <>
      

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Nunito:wght@400;500;600;700;800;900&family=Open+Sans:wght@400;500;600&family=Rajdhani:wght@500;600;700&display=swap');

        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        body { font-family: 'Nunito', sans-serif; }
        ::-webkit-scrollbar { display: none; }
        button { touch-action: manipulation; }
        img { max-width: 100%; }
      `}</style>

      <CartToast />

      <HeroSection />

      <AdSection />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "20px 10px 0" : "0 16px" }}>
        {error && (
          <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 6, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#856404" }}>⚠️ {error}</div>
        )}

        <FeatureCategories categories={categories} loading={catLoading} />
        <PopularProducts products={products} loading={prodLoading} />
        <BlogSection />
        <JustForYou products={products} loading={prodLoading} />
      </div>
    </>
  );
}