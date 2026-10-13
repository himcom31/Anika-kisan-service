import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ borderRadius: 20, overflow: "hidden", background: "#fff", border: "1.5px solid #f0f0f0" }}>
    <div style={{
      height: 160,
      background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
      backgroundSize: "800px 100%", animation: "scShimmer 1.4s infinite linear",
    }} />
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ height: 14, width: "60%", borderRadius: 6, background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize: "800px 100%", animation: "scShimmer 1.4s infinite linear" }} />
      <div style={{ height: 11, width: "40%", borderRadius: 6, background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize: "800px 100%", animation: "scShimmer 1.4s infinite linear" }} />
    </div>
  </div>
);

// ─── Sub-Category Card ────────────────────────────────────────────────────────
const SubCatCard = ({ cat, index }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

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

  return (
    <div
      onClick={() => navigate(`/user/product?categories=${cat.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20, overflow: "hidden", background: "#fff",
        border: `1.5px solid ${hovered ? "rgba(45,158,45,0.3)" : "#f0f0f0"}`,
        boxShadow: hovered
          ? "0 16px 48px rgba(45,158,45,0.16), 0 4px 16px rgba(0,0,0,0.07)"
          : "0 2px 12px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        animation: `scFadeUp 0.4s ease ${index * 0.05}s both`,
      }}
    >
      {/* Image */}
      <div style={{
        height: 160, background: img ? "#f9fafb" : bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", position: "relative",
      }}>
        {img ? (
          <img src={img} alt={cat.name} style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }} />
        ) : (
          <span style={{ fontSize: 52, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}>🛒</span>
        )}

        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.18) 100%)",
          opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
        }} />

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
        }}>→</div>
      </div>

      {/* Info */}
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
          Browse products
          <span style={{
            transform: hovered ? "translateX(3px)" : "translateX(0)",
            transition: "transform 0.2s", display: "inline-block",
          }}>→</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Sub-Categories Page ─────────────────────────────────────────────────
export default function SubCategoriesPage() {
  const { categoryId } = useParams();  // /user/categories/:categoryId
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  const [parentCat, setParentCat] = useState(null);
  const [subCats, setSubCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASEA}/api/Category/all`)
      .then(r => r.json())
      .then(data => {
        const all = Array.isArray(data) ? data : data.categories || data.data || [];

        // Parent category dhundo
        const parent = all.find(c => String(c.id) === String(categoryId));
        setParentCat(parent || null);

        if (parent) {
          // Sub-categories parent ke andar se lo (nested)
          const subs = (parent.subCategories || []).filter(s => s.isActive !== false);

          // Agar nested nahi mila toh flat list mein se parent_id se match karo
          const flatSubs = subs.length > 0
            ? subs
            : all.filter(c => String(c.parent_id) === String(categoryId) && c.isActive !== false);

          setSubCats(flatSubs);
        } else {
          // Parent nahi mila → directly product page pe bhejo
          navigate(`/user/product?categories=${categoryId}`, { replace: true });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId]);

  // Agar parent mein koi sub-cat nahi → directly products pe redirect
  useEffect(() => {
    if (!loading && parentCat && subCats.length === 0) {
      navigate(`/user/product?categories=${categoryId}`, { replace: true });
    }
  }, [loading, parentCat, subCats, categoryId]);

  const filtered = subCats.filter(c =>
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
          @keyframes scFadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes scShimmer {
            0%   { background-position: -400px 0; }
            100% { background-position:  400px 0; }
          }
          .sc-search:focus { outline: none; border-color: #2d9e2d; box-shadow: 0 0 0 3px rgba(45,158,45,0.12); }
          .sc-search::placeholder { color: #bbb; }
        `}</style>

        {/* ── Breadcrumb ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 20, fontSize: 13, color: "#9ca3af",
        }}>
          <span
            onClick={() => navigate("/")}
            style={{ cursor: "pointer", color: "#6b7280" }}
            onMouseEnter={e => e.target.style.color = "#2d9e2d"}
            onMouseLeave={e => e.target.style.color = "#6b7280"}
          >Home</span>
          <span>›</span>
          <span
            onClick={() => navigate("/user/categories")}
            style={{ cursor: "pointer", color: "#6b7280" }}
            onMouseEnter={e => e.target.style.color = "#2d9e2d"}
            onMouseLeave={e => e.target.style.color = "#6b7280"}
          >Categories</span>
          <span>›</span>
          <span style={{ color: "#2d9e2d", fontWeight: 600 }}>
            {loading ? "Loading…" : (parentCat?.name || "Category")}
          </span>
        </div>

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
              {parentCat?.name || "Category"}
            </div>
            <h1 style={{
              fontSize: isMobile ? 22 : 30, fontWeight: 800,
              color: "#111", margin: 0, lineHeight: 1.15,
            }}>
              Sub-Categories
            </h1>
            {!loading && (
              <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6, fontWeight: 500 }}>
                {filtered.length} {filtered.length === 1 ? "sub-category" : "sub-categories"} available
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* View all products for this parent button */}
            <button
              onClick={() => navigate(`/user/product?categories=${categoryId}`)}
              style={{
                padding: "9px 18px", borderRadius: 10,
                border: "1.5px solid #2d9e2d", background: "#fff",
                color: "#2d9e2d", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#2d9e2d"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2d9e2d"; }}
            >
              View All {parentCat?.name} Products →
            </button>

            {/* Search */}
            <div style={{ position: "relative", width: isMobile ? "100%" : 240 }}>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#bbb" strokeWidth="2" strokeLinecap="round"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="sc-search"
                type="text"
                placeholder="Search sub-categories…"
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
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: isMobile ? 12 : 16 }}>
            {[...Array(isMobile ? 4 : 8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 && search ? (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#374151" }}>No sub-categories found</div>
            <button
              onClick={() => setSearch("")}
              style={{
                padding: "8px 24px", borderRadius: 10,
                border: "1.5px solid #2d9e2d", background: "#fff",
                color: "#2d9e2d", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >Clear Search</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: isMobile ? 12 : 16 }}>
            {filtered.map((cat, i) => (
              <SubCatCard key={cat.id || i} cat={cat} index={i} />
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
          }}>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#14532d", marginBottom: 8 }}>
              Want to see everything in {parentCat?.name}?
            </div>
            <div style={{ fontSize: 13, color: "#166534", marginBottom: 20, fontWeight: 500 }}>
              Browse all products under this category at once
            </div>
            <button
              onClick={() => navigate(`/user/product?categories=${categoryId}`)}
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
              View All {parentCat?.name} Products
            </button>
          </div>
        )}
      </div>
    </>
  );
}