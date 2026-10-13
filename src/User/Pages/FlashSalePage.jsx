import { useState, useEffect } from "react";
import { openLoginModal } from "../utils/authEvents";
import { addToCart, toggleWishlist, fetchWishlist } from "../utils/cartWishlist";
import { useNavigate } from "react-router-dom";
const API_BASEA = import.meta.env.VITE_API_URL;

// ─── Responsive Hooks ─────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [v, setV] = useState(() => typeof window !== "undefined" ? window.innerWidth < bp : false);
  useEffect(() => {
    const h = () => setV(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return v;
}
function useIsTablet(bp = 1024) {
  const [v, setV] = useState(() => typeof window !== "undefined" ? window.innerWidth < bp : false);
  useEffect(() => {
    const h = () => setV(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return v;
}

// ─── Global Styles ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f4f6f4; }

  @keyframes fs-pulse   { 0%,100%{opacity:1} 50%{opacity:0.45} }
  @keyframes fs-shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes fs-pop     { 0%{transform:scale(1)} 45%{transform:scale(1.3)} 100%{transform:scale(1.18)} }
  @keyframes fs-checkpop{ 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.18);opacity:1} 100%{transform:scale(1);opacity:1} }
  @keyframes fs-ripple  { 0%{transform:scale(0);opacity:0.4} 100%{transform:scale(4);opacity:0} }
  @keyframes fs-flash   { 0%,100%{opacity:1} 50%{opacity:0.6} }
  @keyframes fs-slideup { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes fs-fadein  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fs-spin    { to{transform:rotate(360deg)} }
  @keyframes fs-pulse-dot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.7} }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #f0f0f0; }
  ::-webkit-scrollbar-thumb { background: #c5d9c5; border-radius: 4px; }

  /* ── Product Card ── */
  .fs-card {
    background: #fff;
    border-radius: 16px;
    border: 1.5px solid #eef2ee;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s;
    animation: fs-fadein 0.4s ease both;
  }
  .fs-card:hover {
    box-shadow: 0 14px 40px rgba(45,158,45,0.15), 0 4px 14px rgba(0,0,0,0.06);
    transform: translateY(-4px) scale(1.01);
    border-color: rgba(45,158,45,0.25);
  }

  /* Image zone */
  .fs-img-zone {
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    background: linear-gradient(145deg, #f4faf4, #e8f4e8);
  }
  .fs-img-zone::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.5) 0%, transparent 65%);
    pointer-events: none;
    z-index: 1;
  }
  .fs-card-img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    display: block;
  }
  .fs-card:hover .fs-card-img { transform: scale(1.08); }

  /* Discount badge */
  .fs-badge {
    position: absolute;
    top: 8px; left: 8px;
    background: linear-gradient(135deg, #ff5722, #ff8a50);
    color: #fff;
    font-size: 9px; font-weight: 800;
    padding: 3px 7px; border-radius: 99px;
    letter-spacing: 0.4px;
    box-shadow: 0 2px 8px rgba(255,87,34,0.4);
    z-index: 3;
  }

  /* Wishlist btn */
  .fs-wish {
    position: absolute; top: 8px; right: 8px;
    background: rgba(255,255,255,0.92);
    border: none; border-radius: 50%;
    width: 30px; height: 30px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    transition: transform 0.2s, background 0.2s;
    z-index: 3; backdrop-filter: blur(4px);
  }
  .fs-wish:hover { transform: scale(1.15); background: #fff; }
  .fs-wish.wished svg { animation: fs-pop 0.35s ease forwards; }

  /* Stock pill */
  .fs-stock {
    position: absolute; bottom: 8px; left: 8px;
    font-size: 9px; font-weight: 700;
    padding: 3px 8px; border-radius: 99px;
    z-index: 3; letter-spacing: 0.2px;
  }
  .fs-stock.out { background: rgba(231,76,60,0.12); color: #c0392b; }
  .fs-stock.low { background: rgba(230,126,34,0.12); color: #d35400; }
  .fs-stock.in  { background: rgba(45,158,45,0.12);  color: #1a7a1a; }

  /* Card body */
  .fs-card-body { padding: 10px 10px 11px; display: flex; flex-direction: column; flex: 1; gap: 4px; }
  .fs-card-cat  { font-size: 9px; font-weight: 700; color: #2d9e2d; letter-spacing: 0.8px; text-transform: uppercase; }
  .fs-card-name {
    font-weight: 700; color: #111; line-height: 1.3;
    overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  .fs-stars { display: flex; align-items: center; gap: 2px; }
  .fs-star   { font-size: 10px; color: #f39c12; line-height: 1; }
  .fs-star.e { color: #ddd; }
  .fs-divider {
    height: 1px; margin: 3px 0;
    background: linear-gradient(90deg, transparent, #efefef 30%, #efefef 70%, transparent);
  }
  .fs-price-row { display: flex; align-items: baseline; gap: 5px; flex-wrap: wrap; }
  .fs-price     { font-weight: 900; color: #1a7a1a; letter-spacing: -0.3px; }
  .fs-oldprice  { font-size: 11px; color: #ccc; text-decoration: line-through; font-weight: 500; }
  .fs-unit      { margin-left: auto; font-size: 10px; color: #bbb; font-weight: 500; white-space: nowrap; }

  /* ATC button */
  .fs-atc {
    position: relative; overflow: hidden;
    width: 100%; border: none; border-radius: 10px;
    font-weight: 700; font-family: 'Inter', sans-serif;
    letter-spacing: 0.2px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 5px;
    transition: box-shadow 0.22s, transform 0.15s;
    margin-top: auto;
  }
  .fs-atc:not(:disabled):hover { box-shadow: 0 6px 18px rgba(45,158,45,0.4); transform: translateY(-1px); }
  .fs-atc:not(:disabled):active { transform: scale(0.97); }
  .fs-atc .fs-ripple {
    position: absolute; width: 60px; height: 60px;
    border-radius: 50%; background: rgba(255,255,255,0.28);
    transform: scale(0); pointer-events: none;
  }
  .fs-atc:active .fs-ripple { animation: fs-ripple 0.5s ease-out forwards; }
  .fs-check { animation: fs-checkpop 0.3s ease forwards; }
  .fs-spinner { animation: fs-spin 0.8s linear infinite; }

  /* Skeleton */
  .fs-skel {
    background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
    background-size: 600px 100%;
    animation: fs-shimmer 1.4s infinite linear;
  }

  /* Sidebar */
  .fs-sidebar-cat-btn {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; border: none; cursor: pointer;
    font-size: 13px; transition: all 0.15s; text-align: left;
    font-family: 'Inter', sans-serif; min-height: 42px;
  }
  .fs-sidebar-cat-btn:hover:not(.active) { background: #f5f8f5 !important; }

  /* Mobile drawer */
  .fs-drawer {
    position: fixed; bottom: 0; left: 0; right: 0;
    max-height: 82vh; background: #f8faf8;
    z-index: 401; border-radius: 22px 22px 0 0;
    overflow-y: auto;
    box-shadow: 0 -6px 28px rgba(0,0,0,0.14);
  }

  /* Flash label animation */
  .fs-flash-label { animation: fs-flash 1.4s ease-in-out infinite; }

  /* Category header */
  .fs-cat-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 12px; padding-bottom: 10px;
    border-bottom: 2px solid #f0f0f0;
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const FilterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const CartSVG = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

// ─── Countdown ────────────────────────────────────────────────────────────────
function calcTimeLeft(endDate, endTime) {
  if (!endDate) return { d: 0, h: 0, m: 0, s: 0 };
  const datePart = endDate.split("T")[0];
  const end = endTime ? new Date(`${datePart}T${endTime}:00`) : new Date(endDate);
  const diff = end - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

const CountdownTimer = ({ endDate, endTime, compact = false }) => {
  const [t, setT] = useState(() => calcTimeLeft(endDate, endTime));
  useEffect(() => {
    setT(calcTimeLeft(endDate, endTime));
    const id = setInterval(() => setT(calcTimeLeft(endDate, endTime)), 1000);
    return () => clearInterval(id);
  }, [endDate, endTime]);
  const pad = n => String(n).padStart(2, "0");

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {[[t.d,"D"],[t.h,"H"],[t.m,"M"],[t.s,"S"]].map(([val, lbl], i) => (
          <span key={lbl} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 7, padding: "5px 8px", fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: -0.5, minWidth: 34, textAlign: "center", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)" }}>
              {pad(val)}
            </span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{lbl}</span>
            {i < 3 && <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 900, fontSize: 14 }}>:</span>}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      {[[t.d,"DAYS"],[t.h,"HRS"],[t.m,"MIN"],[t.s,"SEC"]].map(([val, lbl], i) => (
        <span key={lbl} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ textAlign: "center" }}>
            <span style={{ display: "block", background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "8px 14px", fontSize: 26, fontWeight: 900, color: "#fff", minWidth: 58, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }}>
              {pad(val)}
            </span>
            <span style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 4, fontWeight: 700, letterSpacing: 0.6 }}>{lbl}</span>
          </span>
          {i < 3 && <span style={{ fontSize: 24, fontWeight: 900, color: "rgba(255,255,255,0.4)", alignSelf: "flex-start", paddingTop: 8 }}>:</span>}
        </span>
      ))}
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, discountBadge, compact = false }) => {
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const [added, setAdded]   = useState(false);
  const [loading, setLoading] = useState(false);

  const oldPrice   = Number(product.price || product.buyingPrice || 0);
  const price      = Number(product.oldPrice || product.sellingPrice || 0);
  const name       = product.name || product.title || "Product";
  const unit       = product.unit || product.weight || "1 KG";
  const image      = product.image || product.thumbnail || product.images?.[0];
  const stock      = product.stockQuantity ?? product.stock ?? 1;
  const isOOS      = stock === 0 || product.status === "out-of-stock";
  const isLow      = !isOOS && stock > 0 && stock <= 10;
  const discount   = oldPrice && price ? Math.round((1 - price / oldPrice) * 100) : discountBadge;
  const catName    = typeof product.category === "object" ? (product.category?.name || "") : (product.category || "");
  const imgH       = compact ? 120 : 160;

  const isLoggedIn = () => !!localStorage.getItem("userToken");

  useEffect(() => {
    if (!isLoggedIn()) return;
    fetchWishlist().then(d => {
      const ids = (d.products || []).map(p => p.id || p);
      setWished(ids.includes(product.id));
    }).catch(() => {});
  }, [product.id]);

  const handleCart = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { openLoginModal(); return; }
    if (loading || isOOS) return;
    setLoading(true);
    try {
      await addToCart(product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
      window.dispatchEvent(new CustomEvent("cart:added", { detail: { name, image } }));
    } catch { alert("Failed to add to cart."); }
    finally { setLoading(false); }
  };

  const handleWish = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { openLoginModal(); return; }
    try { await toggleWishlist(product.id, wished); setWished(w => !w); }
    catch { alert("Failed to update wishlist."); }
  };

  return (
    <div className="fs-card" onClick={() => product.slug && navigate(`/products/${product.slug}`)}>
      {/* Image */}
      <div className="fs-img-zone" style={{ height: imgH }}>
        {image
          ? <img className="fs-card-img" src={image} alt={name} onError={e => { e.target.style.display="none"; }} />
          : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize: compact?38:52 }}>🛒</div>
        }
        {discount > 0 && <span className="fs-badge">🏷 {discount}% OFF</span>}
        <button className={`fs-wish${wished?" wished":""}`} onClick={handleWish} aria-label="Wishlist">
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wished?"#e74c3c":"none"} stroke={wished?"#e74c3c":"#999"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <span className={`fs-stock ${isOOS?"out":isLow?"low":"in"}`}>
          ● {isOOS ? "Out of Stock" : isLow ? `Only ${stock} left` : "In Stock"}
        </span>
      </div>

      {/* Body */}
      <div className="fs-card-body">
        {catName && <div className="fs-card-cat">{catName}</div>}
        <div className="fs-card-name" style={{ fontSize: compact ? 12 : 13 }}>{name}</div>

        <div className="fs-stars">
          {[1,2,3,4,5].map(s => (
            <span key={s} className={`fs-star${s > Math.round(product.rating||4)?" e":""}`}>★</span>
          ))}
          <span style={{ fontSize:10, color:"#bbb", marginLeft:3, fontWeight:500 }}>({product.reviewCount||product.rating||"4.0"})</span>
        </div>

        <div className="fs-divider" />

        <div className="fs-price-row">
          <span className="fs-price" style={{ fontSize: compact ? 14 : 16 }}>₹{price.toFixed(2)}</span>
          {oldPrice > 0 && <span className="fs-oldprice">₹{oldPrice.toFixed(2)}</span>}
          <span className="fs-unit">{unit}</span>
        </div>

        <button
          className="fs-atc"
          onClick={handleCart}
          disabled={isOOS || loading}
          style={{
            padding: compact ? "8px 0" : "9px 0",
            fontSize: compact ? 11 : 12,
            background: isOOS ? "#ebebeb" : added ? "linear-gradient(135deg,#1a7a1a,#28a428)" : "linear-gradient(135deg,#2d9e2d,#3eb83e)",
            color: isOOS ? "#aaa" : "#fff",
            marginTop: 6,
          }}
        >
          <span className="fs-ripple" />
          {isOOS ? "Out of Stock"
            : loading ? <svg className="fs-spinner" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            : added ? <><svg className="fs-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Added!</>
            : <><CartSVG/>Add to Cart</>
          }
        </button>
      </div>
    </div>
  );
};

// ─── Category Section ─────────────────────────────────────────────────────────
const CategorySection = ({ categoryName, products, discountBadge, isMobile, isTablet }) => {
  const [expanded, setExpanded] = useState(true);
  const cols = isMobile ? 2 : isTablet ? 3 : 5;
  const defaultVisible = cols * 2;
  const visible = expanded ? products : products.slice(0, defaultVisible);

  return (
    <div style={{ marginBottom: isMobile ? 24 : 40, animation: "fs-fadein 0.4s ease both" }}>
      <div className="fs-cat-header">
        <div style={{ width: 4, height: 20, background: "linear-gradient(180deg,#2d9e2d,#52cc52)", borderRadius: 2, flexShrink: 0 }} />
        <h3 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: "#111", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {categoryName}
        </h3>
        <span style={{ background: "linear-gradient(135deg,#e8f5e9,#d4edda)", color: "#1a7a1a", fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 99, border: "1px solid rgba(45,158,45,0.15)", flexShrink: 0 }}>
          {products.length}
        </span>
        {products.length > defaultVisible && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ fontSize: 11, fontWeight: 700, color: "#2d9e2d", background: "transparent", border: "1.5px solid rgba(45,158,45,0.3)", borderRadius: 99, padding: "4px 12px", cursor: "pointer", flexShrink: 0, marginLeft: 6, transition: "all 0.18s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.background="#2d9e2d"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#2d9e2d"; }}
          >
            {expanded ? "Less ↑" : "View All →"}
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 10 : 14 }}>
        {visible.map((p, i) => (
          <ProductCard key={p.id || i} product={p} discountBadge={discountBadge} compact={isMobile} />
        ))}
      </div>
    </div>
  );
};

// ─── Sidebar Content ──────────────────────────────────────────────────────────
const SidebarContent = ({ searchQuery, setSearchQuery, sidebarCats, activeCategory, setActiveCategory, categoryCounts, products, isMobile, setSidebarOpen }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    {/* Search */}
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}><SearchIcon /></div>
      <input
        type="text"
        placeholder="Search products…"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        style={{
          width: "100%", padding: "10px 12px 10px 34px",
          borderRadius: 10, border: "1.5px solid #e4eae4",
          fontSize: 13, outline: "none",
          background: "#fff", boxSizing: "border-box",
          fontFamily: "Inter, sans-serif",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={e => { e.target.style.borderColor="#2d9e2d"; e.target.style.boxShadow="0 0 0 3px rgba(45,158,45,0.1)"; }}
        onBlur={e => { e.target.style.borderColor="#e4eae4"; e.target.style.boxShadow="none"; }}
      />
    </div>

    {/* Categories */}
    <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #eef2ee", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1.5px solid #f0f4f0", fontSize: 12, fontWeight: 800, color: "#333", letterSpacing: 0.5, textTransform: "uppercase" }}>
        Categories
      </div>
      {sidebarCats.map(cat => {
        const count = cat === "All" ? products.length : (categoryCounts[cat] || 0);
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            className={`fs-sidebar-cat-btn${isActive?" active":""}`}
            onClick={() => { setActiveCategory(cat); if (isMobile) setSidebarOpen(false); }}
            style={{
              background: isActive ? "linear-gradient(135deg,#f0faf0,#e4f4e4)" : "transparent",
              borderLeft: `3px solid ${isActive ? "#2d9e2d" : "transparent"}`,
              color: isActive ? "#1a7a1a" : "#555",
              fontWeight: isActive ? 700 : 500,
            }}
          >
            <span style={{ fontSize: 13 }}>{cat}</span>
            <span style={{
              background: isActive ? "linear-gradient(135deg,#2d9e2d,#3eb83e)" : "#f0f0f0",
              color: isActive ? "#fff" : "#999",
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FlashSalePage({ flashSaleId, onBack }) {
  const isMobile = useIsMobile(768);
  const isTablet = useIsTablet(1024);

  const [flashSale, setFlashSale]     = useState(null);
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fsRes  = await fetch(`${API_BASEA}/api/flash/all`);
        const fsData = await fsRes.json();
        const sales  = fsData.sales || fsData.flashSales || fsData.data || [];
        const sale   = flashSaleId ? sales.find(s => s.id === flashSaleId) : (sales.find(s => s.isActive) || sales[0]);
        setFlashSale(sale);

        let fetched = [], page = 1, totalPages = 1;
        do {
          const res  = await fetch(`${API_BASEA}/api/Products/allFree?page=${page}&limit=100`);
          const data = await res.json();
          const batch = Array.isArray(data) ? data : data.products || data.data || [];
          fetched = [...fetched, ...batch];
          totalPages = data.totalPages || 1;
          page++;
        } while (page <= totalPages);

        if (sale?.products?.length) {
          const ids = new Set(sale.products.map(id => typeof id === "object" ? id.id : id));
          const matched = fetched.filter(p => ids.has(p.id));
          setProducts(matched.length > 0 ? matched : fetched);
        } else {
          setProducts(fetched);
        }

        const catRes  = await fetch(`${API_BASEA}/api/Category/all`);
        const catData = await catRes.json();
        const cats = Array.isArray(catData) ? catData : catData.categories || catData.data || [];
        setCategories(cats.filter(c => c.isActive));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [flashSaleId]);

  const getCatName = (p) => {
    if (!p.category) return "Other";
    if (typeof p.category === "object") return p.category.name || "Other";
    const c = categories.find(c => c.id === p.category);
    return c ? c.name : "Other";
  };

  const filtered = products.filter(p => {
    const q = !searchQuery || (p.name || p.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const c = activeCategory === "All" || getCatName(p) === activeCategory;
    return q && c;
  });

  const grouped = filtered.reduce((acc, p) => {
    const c = getCatName(p); if (!acc[c]) acc[c] = []; acc[c].push(p); return acc;
  }, {});

  const catCounts = products.reduce((acc, p) => {
    const c = getCatName(p); acc[c] = (acc[c] || 0) + 1; return acc;
  }, {});

  const sidebarCats = ["All", ...Object.keys(catCounts).sort()];
  const cols = isMobile ? 2 : isTablet ? 3 : 5;
  const activeFilters = (activeCategory !== "All" ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a3d0a 0%, #145214 40%, #1e7b1e 75%, #2d9e2d 100%)",
        padding: isMobile ? "18px 0 0" : "28px 0 0",
        position: "relative", overflow: "hidden",
        marginBottom: isMobile ? 16 : 28,
      }}>
        {/* Decorative blobs */}
        <div style={{ position:"absolute", top:-80, right:-80, width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-50, left:120, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.035)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"30%", left:"45%", width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.025)", pointerEvents:"none" }} />

        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "0 14px" : "0 24px" }}>
          {/* Back btn */}
          <button
            onClick={onBack}
            style={{
              display:"flex", alignItems:"center", gap:6,
              background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
              color:"#fff", borderRadius:99, padding:"7px 14px",
              fontSize:12, fontWeight:600, cursor:"pointer",
              marginBottom: isMobile ? 14 : 20,
              transition:"background 0.2s", backdropFilter:"blur(4px)",
              fontFamily:"Inter,sans-serif",
            }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
          >
            <BackIcon /> Back to Home
          </button>

          {isMobile ? (
            /* ── Mobile Hero ── */
            <div style={{ paddingBottom: 20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                <span className="fs-flash-label" style={{ fontSize:18 }}>⚡</span>
                <span style={{ background:"#ffe600", color:"#111", fontSize:10, fontWeight:900, padding:"3px 10px", borderRadius:99, letterSpacing:0.8 }}>FLASH SALE</span>
                {flashSale?.minDiscount && (
                  <span style={{ background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99, backdropFilter:"blur(4px)" }}>
                    Up to {flashSale.minDiscount}% OFF
                  </span>
                )}
              </div>
              <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:-0.5, marginBottom:4, lineHeight:1.2 }}>
                {flashSale?.name || "Flash Sale"}
              </h1>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, marginBottom:14 }}>
                {products.length} deals · {Object.keys(grouped).length} categories
              </p>
              {flashSale?.endDate && (
                <>
                  <div style={{ display:"flex", alignItems:"center", gap:5, color:"rgba(255,255,255,0.65)", fontSize:11, fontWeight:600, marginBottom:8 }}>
                    <ClockIcon /> Ends in
                  </div>
                  <CountdownTimer endDate={flashSale.endDate} endTime={flashSale.endTime} compact />
                </>
              )}
            </div>
          ) : (
            /* ── Desktop Hero ── */
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24, paddingBottom:32, flexWrap:"wrap" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span className="fs-flash-label" style={{ fontSize:26 }}>⚡</span>
                  <span style={{ background:"#ffe600", color:"#111", fontSize:11, fontWeight:900, padding:"4px 12px", borderRadius:99, letterSpacing:1 }}>FLASH SALE</span>
                  {flashSale?.minDiscount && (
                    <span style={{ background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:99, backdropFilter:"blur(4px)" }}>
                      Up to {flashSale.minDiscount}% OFF
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize:38, fontWeight:900, color:"#fff", letterSpacing:-0.8, margin:"0 0 6px", textShadow:"0 2px 12px rgba(0,0,0,0.25)", lineHeight:1.1 }}>
                  {flashSale?.name || "Flash Sale"}
                </h1>
                <p style={{ color:"rgba(255,255,255,0.65)", fontSize:14, margin:0 }}>
                  {products.length} exclusive deals across {Object.keys(grouped).length} categories
                </p>
              </div>
              {flashSale?.endDate && (
                <div style={{ textAlign:"right" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,0.65)", fontSize:12, fontWeight:600, marginBottom:10, justifyContent:"flex-end" }}>
                    <ClockIcon /> Sale ends in
                  </div>
                  <CountdownTimer endDate={flashSale.endDate} endTime={flashSale.endTime} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom wave */}
        <svg viewBox="0 0 1440 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display:"block", marginTop:-1, width:"100%" }}>
          <path d="M0,28 C360,0 1080,0 1440,28 L1440,28 L0,28 Z" fill="#f4f6f4"/>
        </svg>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding: isMobile ? "0 12px 90px" : "0 20px 56px", display:"flex", gap: isMobile ? 0 : 22, alignItems:"flex-start" }}>

        {/* ── Mobile Bottom Bar ── */}
        {isMobile && (
          <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:300, background:"#fff", borderTop:"1.5px solid #eef2ee", padding:"10px 14px", display:"flex", gap:10, boxShadow:"0 -4px 16px rgba(0,0,0,0.1)" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, background: activeFilters > 0 ? "linear-gradient(135deg,#2d9e2d,#3eb83e)" : "#f4f6f4", border:"none", borderRadius:10, padding:"11px 0", fontSize:13, fontWeight:700, color: activeFilters > 0 ? "#fff" : "#333", cursor:"pointer", fontFamily:"Inter,sans-serif" }}
            >
              <FilterIcon />
              Filter & Search
              {activeFilters > 0 && (
                <span style={{ background:"rgba(255,255,255,0.3)", borderRadius:99, width:20, height:20, fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {activeFilters}
                </span>
              )}
            </button>
            {activeFilters > 0 && (
              <button
                onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                style={{ padding:"11px 16px", background:"#fff0f0", border:"1.5px solid #ffd5d5", borderRadius:10, fontSize:12, fontWeight:700, color:"#e74c3c", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        )}

        {/* ── Mobile Drawer ── */}
        {isMobile && (
          <>
            {sidebarOpen && (
              <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:400, backdropFilter:"blur(2px)" }} onClick={() => setSidebarOpen(false)} />
            )}
            <div className="fs-drawer" style={{ transform: sidebarOpen ? "translateY(0)" : "translateY(105%)", transition:"transform 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
              <div style={{ padding:"14px 16px 0", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"#f8faf8", zIndex:1, borderBottom:"1.5px solid #eef2ee", paddingBottom:12 }}>
                <span style={{ fontSize:15, fontWeight:800, color:"#111" }}>Filter Products</span>
                <button onClick={() => setSidebarOpen(false)} style={{ background:"#f0f4f0", border:"none", cursor:"pointer", padding:"6px 8px", borderRadius:8, display:"flex", alignItems:"center", color:"#555" }}>
                  <CloseIcon />
                </button>
              </div>
              <div style={{ padding:"16px 16px 100px" }}>
                <SidebarContent
                  searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                  sidebarCats={sidebarCats} activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory} categoryCounts={catCounts}
                  products={products} isMobile setSidebarOpen={setSidebarOpen}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Desktop Sidebar ── */}
        {!isMobile && (
          <aside style={{ width: isTablet ? 190 : 224, flexShrink:0, position:"sticky", top:20 }}>
            <SidebarContent
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              sidebarCats={sidebarCats} activeCategory={activeCategory}
              setActiveCategory={setActiveCategory} categoryCounts={catCounts}
              products={products} isMobile={false} setSidebarOpen={setSidebarOpen}
            />
          </aside>
        )}

        {/* ── Main Content ── */}
        <main style={{ flex:1, minWidth:0 }}>
          {/* Stats bar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: isMobile ? 14 : 20, flexWrap:"wrap", gap:8 }}>
            <p style={{ margin:0, fontSize: isMobile ? 12 : 13, color:"#666" }}>
              Showing <strong style={{ color:"#111" }}>{filtered.length}</strong> products
              {activeCategory !== "All" && <> in <strong style={{ color:"#1a7a1a" }}>{activeCategory}</strong></>}
              {searchQuery && <> for "<strong style={{ color:"#1a7a1a" }}>{searchQuery}</strong>"</>}
            </p>
            {!isMobile && activeFilters > 0 && (
              <button
                onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                style={{ fontSize:12, color:"#888", background:"#f5f5f5", border:"1px solid #e0e0e0", borderRadius:99, padding:"4px 14px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap: isMobile ? 10 : 14 }}>
              {[...Array(cols * 2)].map((_, i) => (
                <div key={i} style={{ borderRadius:16, overflow:"hidden" }}>
                  <div className="fs-skel" style={{ height: isMobile ? 120 : 160 }} />
                  <div style={{ padding:"10px 10px 12px", display:"flex", flexDirection:"column", gap:6 }}>
                    <div className="fs-skel" style={{ height:9, width:"50%", borderRadius:6 }} />
                    <div className="fs-skel" style={{ height:13, borderRadius:6 }} />
                    <div className="fs-skel" style={{ height:11, width:"70%", borderRadius:6 }} />
                    <div className="fs-skel" style={{ height:34, borderRadius:10, marginTop:4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"72px 0", color:"#bbb", animation:"fs-fadein 0.4s ease" }}>
              <div style={{ fontSize: isMobile ? 48 : 56, marginBottom:14 }}>🔍</div>
              <div style={{ fontSize: isMobile ? 15 : 17, fontWeight:700, color:"#888", marginBottom:6 }}>No products found</div>
              <div style={{ fontSize:13, color:"#bbb" }}>Try a different category or search term</div>
              <button
                onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                style={{ marginTop:20, padding:"10px 28px", background:"linear-gradient(135deg,#2d9e2d,#3eb83e)", color:"#fff", border:"none", borderRadius:99, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Inter,sans-serif", boxShadow:"0 4px 14px rgba(45,158,45,0.3)" }}
              >
                Clear Filters
              </button>
            </div>
          ) : activeCategory === "All" ? (
            Object.entries(grouped).map(([catName, catProds]) => (
              <CategorySection key={catName} categoryName={catName} products={catProds}
                discountBadge={flashSale?.minDiscount} isMobile={isMobile} isTablet={isTablet} />
            ))
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap: isMobile ? 10 : 14 }}>
              {filtered.map((p, i) => (
                <ProductCard key={p.id || i} product={p} discountBadge={flashSale?.minDiscount} compact={isMobile} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}