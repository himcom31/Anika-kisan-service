import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASEA = import.meta.env.VITE_API_URL;

const useResponsive = () => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return { isMobile: width < 640, isTablet: width >= 640 && width < 1024 };
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{
    borderRadius: 20, overflow: "hidden",
    background: "#fff", border: "1.5px solid #f0f0f0",
  }}>
    <div style={{
      height: 160,
      background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
      backgroundSize: "800px 100%",
      animation: "cpShimmer 1.4s infinite linear",
    }} />
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ height: 14, width: "60%", borderRadius: 6, background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize: "800px 100%", animation: "cpShimmer 1.4s infinite linear" }} />
      <div style={{ height: 11, width: "40%", borderRadius: 6, background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize: "800px 100%", animation: "cpShimmer 1.4s infinite linear" }} />
    </div>
  </div>
);

// ─── Category Card ────────────────────────────────────────────────────────────
const CategoryCard = ({ cat, index }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const hasSubCats = (cat.subCategories || []).filter(s => s.isActive !== false).length > 0;

  const gradients = [
    "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
    "linear-gradient(135deg,#fff3e0,#ffe0b2)",
    "linear-gradient(135deg,#e3f2fd,#bbdefb)",
    "linear-gradient(135deg,#fce4ec,#f8bbd0)",
    "linear-gradient(135deg,#f3e5f5,#e1bee7)",
    "linear-gradient(135deg,#e0f7fa,#b2ebf2)",
    "linear-gradient(135deg,#fff8e1,#ffecb3)",
    "linear-gradient(135deg,#e8eaf6,#c5cae9)",
  ];

  const bg = gradients[index % gradients.length];
  const img = cat.thumbnail || cat.image;

  const handleClick = () => {
    if (hasSubCats) {
      // Sub-categories hain → sub-cat page pe jao
      navigate(`/user/categories/${cat.id}`);
    } else {
      // Koi sub-cat nahi → directly products pe jao
      navigate(`/user/product?categories=${cat.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        background: "#fff",
        border: `1.5px solid ${hovered ? "rgba(45,158,45,0.3)" : "#f0f0f0"}`,
        boxShadow: hovered
          ? "0 16px 48px rgba(45,158,45,0.16), 0 4px 16px rgba(0,0,0,0.07)"
          : "0 2px 12px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        animation: `cpFadeUp 0.4s ease ${index * 0.04}s both`,
        position: "relative",
      }}
    >
      {/* Sub-cat badge */}
      {hasSubCats && (
        <div style={{
          position: "absolute", top: 10, left: 10, zIndex: 2,
          background: "rgba(45,158,45,0.9)", color: "#fff",
          fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
          padding: "3px 8px", borderRadius: 20,
          textTransform: "uppercase",
        }}>
          {(cat.subCategories || []).filter(s => s.isActive !== false).length} sub-cats
        </div>
      )}

      {/* Image area */}
      <div style={{
        height: 160,
        background: img ? "#f9fafb" : bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", position: "relative",
      }}>
        {img ? (
          <img
            src={img}
            alt={cat.name}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transform: hovered ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        ) : (
          <span style={{ fontSize: 52, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}>🛒</span>
        )}

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.18) 100%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
        }} />

        {/* Arrow badge on hover */}
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          width: 32, height: 32, borderRadius: "50%",
          background: "#2d9e2d", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scale(1)" : "scale(0.6)",
          transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 4px 12px rgba(45,158,45,0.4)",
        }}>
          {hasSubCats ? "▸" : "→"}
        </div>
      </div>

      {/* Info area */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: "#111",
          marginBottom: 4, lineHeight: 1.3,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {cat.name}
        </div>
        <div style={{
          fontSize: 12, color: hovered ? "#2d9e2d" : "#9ca3af",
          fontWeight: 500, transition: "color 0.2s",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          {hasSubCats ? `View ${(cat.subCategories || []).filter(s => s.isActive !== false).length} sub-categories` : "Browse products"}
          <span style={{
            transform: hovered ? "translateX(3px)" : "translateX(0)",
            transition: "transform 0.2s", display: "inline-block",
          }}>→</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Categories Page ─────────────────────────────────────────────────────
export default function CategoriesPage() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASEA}/api/Category/all`)
      .then(r => r.json())
      .then(data => {
        const all = Array.isArray(data) ? data : data.categories || data.data || [];
        // Sirf parent categories (jo top-level hain)
        setCats(all.filter(c => c.isActive !== false && !c.parent_id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = cats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const cols = isMobile ? "repeat(2,1fr)" : isTablet ? "repeat(3,1fr)" : "repeat(4,1fr)";

  return (
    <>
      

      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: isMobile ? "20px 14px 40px" : "32px 24px 60px",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}>
        <style>{`
          @keyframes cpFadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes cpShimmer {
            0%   { background-position: -400px 0; }
            100% { background-position:  400px 0; }
          }
          .cp-search:focus { outline: none; border-color: #2d9e2d; box-shadow: 0 0 0 3px rgba(45,158,45,0.12); }
          .cp-search::placeholder { color: #bbb; }
        `}</style>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between", flexDirection: isMobile ? "column" : "row",
          gap: 16, marginBottom: isMobile ? 24 : 32,
        }}>
          <div>
            <div style={{
              fontSize: isMobile ? 11 : 12, fontWeight: 700,
              letterSpacing: 2, textTransform: "uppercase",
              color: "#2d9e2d", marginBottom: 6,
            }}>
              Browse
            </div>
            <h1 style={{
              fontSize: isMobile ? 22 : 30, fontWeight: 800,
              color: "#111", margin: 0, lineHeight: 1.15,
            }}>
              All Categories
            </h1>
            {!loading && (
              <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6, fontWeight: 500 }}>
                {filtered.length} {filtered.length === 1 ? "category" : "categories"} available
              </div>
            )}
          </div>

          {/* Search */}
          <div style={{ position: "relative", width: isMobile ? "100%" : 280 }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#bbb" strokeWidth="2" strokeLinecap="round"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="cp-search"
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", paddingLeft: 40, paddingRight: 16,
                paddingTop: 10, paddingBottom: 10,
                border: "1.5px solid #e5e7eb", borderRadius: 12,
                fontSize: 13, fontWeight: 500, color: "#111",
                background: "#fff", fontFamily: "inherit",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#bbb", fontSize: 16, lineHeight: 1, padding: 2,
                }}
              >✕</button>
            )}
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: isMobile ? 12 : 16 }}>
            {[...Array(isMobile ? 6 : 8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "#f3f4f6", fontSize: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#374151" }}>
              No categories found
            </div>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>
              Try a different search term
            </div>
            <button
              onClick={() => setSearch("")}
              style={{
                padding: "8px 24px", borderRadius: 10,
                border: "1.5px solid #2d9e2d", background: "#fff",
                color: "#2d9e2d", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: isMobile ? 12 : 16 }}>
            {filtered.map((cat, i) => (
              <CategoryCard key={cat.id || i} cat={cat} index={i} />
            ))}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        {!loading && filtered.length > 0 && (
          <div style={{
            textAlign: "center", marginTop: isMobile ? 36 : 52,
            padding: isMobile ? "28px 20px" : "40px 32px",
            background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
            borderRadius: 20, border: "1.5px solid #bbf7d0",
            animation: "cpFadeUp 0.5s ease 0.3s both",
          }}>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#14532d", marginBottom: 8 }}>
              Can't find what you're looking for?
            </div>
            <div style={{ fontSize: 13, color: "#166534", marginBottom: 20, fontWeight: 500 }}>
              Browse all products and filter by your preference
            </div>
            <button
              onClick={() => navigate("/user/product")}
              style={{
                padding: "12px 36px", borderRadius: 12,
                background: "#2d9e2d", color: "#fff",
                border: "none", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 6px 20px rgba(45,158,45,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1e7b1e"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#2d9e2d"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </>
  );
}