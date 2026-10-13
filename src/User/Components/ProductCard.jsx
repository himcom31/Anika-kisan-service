// src/components/ProductCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable ProductCard — works on HomePage, Wishlist, ProductsPage, SearchPage
// Pass any product object from any API endpoint; all field variations handled.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { openLoginModal } from "../utils/authEvents";
import { addToCart, toggleWishlist, fetchWishlist } from "../utils/cartWishlist";

// ─── Responsive Hook ──────────────────────────────────────────────────────────
const useResponsive = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
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
const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24"
    fill={filled ? "#ff4757" : "none"}
    stroke={filled ? "#ff4757" : "rgba(255,255,255,0.9)"}
    strokeWidth="2.2"
    style={{ filter: filled ? "drop-shadow(0 0 4px rgba(255,71,87,0.5))" : "none", transition: "all 0.25s" }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const StarIcon = ({ filled, half }) => (
  <svg width="11" height="11" viewBox="0 0 24 24"
    fill={filled ? "#FBBF24" : "none"}
    stroke={filled ? "#FBBF24" : "#D1D5DB"}
    strokeWidth="1.5"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarRating = ({ rating = 4 }) => (
  <span style={{ display: "flex", gap: 2, alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <StarIcon key={i} filled={i <= Math.round(rating)} />
    ))}
    <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: 3, fontWeight: 500 }}>
      ({rating.toFixed(1)})
    </span>
  </span>
);

// ─── Field Normaliser ─────────────────────────────────────────────────────────
const normalise = (product) => {
  if (!product) return {};

  const displayPrice = Number(
    product.sellingPrice ?? product.discountPrice ?? product.price ?? 0
  );

  const rawStrike = Number(
    product.mrp ?? product.oldPrice ?? product.buyingPrice ?? 0
  );
  const strikePrice = rawStrike > displayPrice ? rawStrike : null;

  const discountPct =
    strikePrice && displayPrice > 0
      ? Math.round((1 - displayPrice / strikePrice) * 100)
      : null;

  const image =
    product.thumbnail || product.image || product.images?.[0] ||
    product.additionalImages?.[0] || null;

  const name = product.name || product.title || "Product";

  const category =
    typeof product.category === "object"
      ? product.category?.name || ""
      : product.category || product.categoryName || "";

  const stock = Number(
    product.stockQuantity ?? product.stock ?? product.quantity ?? 0
  );
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 10;

  const unit = product.unit || product.weight || product.unitLabel || "";
  const navSlug = product.slug || product.id || null;
  const rating = Number(product.rating || product.averageRating || 4);

  return {
    displayPrice, strikePrice, discountPct, image, name, category,
    stock, isOutOfStock, isLowStock, unit, navSlug, rating,
  };
};

// ─── Styles (injected once) ───────────────────────────────────────────────────
const styleId = "product-card-styles";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .pc-root {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #fff;
      border-radius: 16px;
      border: 1px solid #F0F0F0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      cursor: pointer;
      transition: box-shadow 0.3s ease, transform 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    .pc-root:hover {
      box-shadow: 0 12px 40px rgba(0,0,0,0.13);
      transform: translateY(-4px);
    }

    .pc-root:hover .pc-img img {
      transform: scale(1.06);
    }

    .pc-img {
      position: relative;
      overflow: hidden;
      background: #F8F8F8;
    }

    .pc-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      display: block;
    }

    .pc-img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #F5F7FA 0%, #E8ECF0 100%);
      font-size: 48px;
    }

    .pc-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: linear-gradient(135deg, #FF6B35 0%, #FF4500 100%);
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 20px;
      text-transform: uppercase;
      box-shadow: 0 2px 8px rgba(255,107,53,0.4);
    }

    .pc-wishlist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.35);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.2s;
      z-index: 2;
    }

    .pc-wishlist-btn:hover {
      background: rgba(0,0,0,0.55);
      transform: scale(1.12);
    }

    .pc-wishlist-btn.wished {
      background: rgba(255,71,87,0.15);
      border: 1px solid rgba(255,71,87,0.3);
    }

    .pc-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 12px 12px 14px;
      gap: 5px;
    }

    .pc-category {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #16A34A;
    }

    .pc-name {
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 36px;
    }

    .pc-name.mobile {
      font-size: 12px;
      min-height: 32px;
    }

    .pc-stars {
      display: flex;
      align-items: center;
    }

    .pc-stock {
      font-size: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pc-stock-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .pc-price-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 2px;
    }

    .pc-price {
      font-size: 18px;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.5px;
    }

    .pc-price.mobile {
      font-size: 15px;
    }

    .pc-strike {
      font-size: 12px;
      color: #9CA3AF;
      text-decoration: line-through;
      font-weight: 500;
    }

    .pc-unit {
      margin-left: auto;
      font-size: 10px;
      color: #9CA3AF;
      background: #F3F4F6;
      padding: 2px 7px;
      border-radius: 20px;
      font-weight: 500;
      white-space: nowrap;
    }

    .pc-cart-btn {
      width: 100%;
      padding: 10px 0;
      background: #111827;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      margin-top: auto;
      font-family: inherit;
    }

    .pc-cart-btn:hover:not(:disabled) {
      background: #1F2937;
      box-shadow: 0 4px 16px rgba(17,24,39,0.3);
      transform: translateY(-1px);
    }

    .pc-cart-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .pc-cart-btn.added {
      background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
      box-shadow: 0 4px 16px rgba(22,163,74,0.3);
    }

    .pc-cart-btn.loading {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .pc-cart-btn:disabled {
      background: #E5E7EB;
      color: #9CA3AF;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    .pc-out-of-stock-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      pointer-events: none;
    }

    .pc-out-of-stock-label {
      background: rgba(0,0,0,0.7);
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 20px;
    }
  `;
  document.head.appendChild(style);
}

// ─── ProductCard Component ────────────────────────────────────────────────────
const ProductCard = ({ product, onUnwish }) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const {
    displayPrice, strikePrice, discountPct, image, name,
    category, stock, isOutOfStock, isLowStock, unit, navSlug, rating,
  } = normalise(product);

  const isLoggedIn = () => !!localStorage.getItem("userToken");

  useEffect(() => {
    if (!isLoggedIn()) return;
    fetchWishlist()
      .then((data) => {
        const ids = (data.products || []).map((p) => p.id || p);
        setWished(ids.includes(product.id));
      })
      .catch(() => {});
  }, [product.id]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { openLoginModal(); return; }
    if (cartLoading) return;
    setCartLoading(true);
    try {
      await addToCart(product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
      window.dispatchEvent(new CustomEvent("cart:added", { detail: { name, image } }));
    } catch {
      console.log("error");
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { openLoginModal(); return; }
    try {
      await toggleWishlist(product.id, wished);
      const nowWished = !wished;
      setWished(nowWished);
      if (!nowWished && typeof onUnwish === "function") onUnwish(product.id);
    } catch {
      console.log("error");
    }
  };

  const handleCardClick = () => {
    if (navSlug) navigate(`/products/${navSlug}`);
  };

  const imgHeight = isMobile ? 140 : 190;

  // ── Stock indicator config ──
  const stockConfig = isOutOfStock
    ? { color: "#EF4444", dotColor: "#EF4444", label: "Out of Stock" }
    : isLowStock
    ? { color: "#F59E0B", dotColor: "#F59E0B", label: `Only ${stock} left` }
    : { color: "#10B981", dotColor: "#10B981", label: `In Stock` };

  return (
    <div className="pc-root" onClick={handleCardClick}>

      {/* ── Image Block ── */}
      <div className="pc-img" style={{ height: imgHeight }}>
        {image && !imgError ? (
          <img src={image} alt={name} onError={() => setImgError(true)} />
        ) : (
          <div className="pc-img-placeholder">🛒</div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="pc-out-of-stock-overlay">
            <span className="pc-out-of-stock-label">Out of Stock</span>
          </div>
        )}

        {/* Discount badge */}
        {discountPct && discountPct > 0 && !isOutOfStock && (
          <span className="pc-badge">{discountPct}% off</span>
        )}

        {/* Wishlist button */}
        <button
          className={`pc-wishlist-btn${wished ? " wished" : ""}`}
          onClick={handleWishlist}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon filled={wished} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="pc-body">

        {/* Category */}
        {category ? <div className="pc-category">{category}</div> : null}

        {/* Name */}
        <div className={`pc-name${isMobile ? " mobile" : ""}`}>{name}</div>

        {/* Stars */}
        <div className="pc-stars">
          <StarRating rating={rating} />
        </div>

        {/* Stock */}
        <div className="pc-stock" style={{ color: stockConfig.color }}>
          <span className="pc-stock-dot" style={{ background: stockConfig.dotColor }} />
          {stockConfig.label}
        </div>

        {/* Price Row */}
        <div className="pc-price-row">
          <span className={`pc-price${isMobile ? " mobile" : ""}`}>
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>
          {strikePrice && (
            <span className="pc-strike">₹{strikePrice.toLocaleString("en-IN")}</span>
          )}
          {unit ? <span className="pc-unit">{unit}</span> : null}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || cartLoading}
          className={`pc-cart-btn${added ? " added" : ""}${cartLoading ? " loading" : ""}`}
          style={{ marginTop: 10 }}
        >
          {added ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added to Cart
            </>
          ) : cartLoading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: "pc-spin 0.8s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Adding...
            </>
          ) : isOutOfStock ? (
            "Unavailable"
          ) : (
            <>
              <CartIcon />
              Add to Cart
            </>
          )}
        </button>

      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes pc-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ProductCard;