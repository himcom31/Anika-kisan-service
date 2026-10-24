// pages/admin/OrdersList.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Eye, RefreshCw, Search, Filter, X, ChevronLeft,
  ChevronRight, ChevronDown, Package, CreditCard,
  Banknote, Clock, CheckCircle, Truck, AlertCircle,
  Calendar, DollarSign, ArrowUpDown, RotateCcw,
} from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";

const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("adminToken");
const authHdr = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─── Constants ────────────────────────────────────────────────────────────────
const DELIVERY_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"];
const PAYMENT_STATUSES = ["Paid", "Pending", "Failed", "Refunded"];
const PAYMENT_METHODS = ["COD", "Razorpay", "Stripe", "Card"];
const LIMIT = 20;

// ─── Responsive hook ──────────────────────────────────────────────────────────
const useIsMobile = (bp = 768) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return isMobile;
};

const getShortNum = (o) => o.orderNumber?.replace("ORD-", "").split("-")[2] || o.orderNumber;

// ─── Colour helpers ───────────────────────────────────────────────────────────
const deliveryColor = (s) => ({
  Pending: { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  Processing: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
  Shipped: { bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd" },
  Delivered: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  Cancelled: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  Returned: { bg: "#ffedd5", color: "#9a3412", border: "#fdba74" },
}[s] || { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" });

const paymentColor = (s) => ({
  Paid: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  Pending: { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  Failed: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  Refunded: { bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd" },
}[s] || { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" });

// ─── Small reusable pieces ────────────────────────────────────────────────────
const StatusBadge = ({ label, type = "delivery" }) => {
  const c = type === "payment" ? paymentColor(label) : deliveryColor(label);
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
      border: `1px solid ${c.border}`, background: c.bg, color: c.color, whiteSpace: "nowrap",
    }}>{label}</span>
  );
};

const MethodIcon = ({ method }) =>
  method === "COD" ? <Banknote size={13} /> : <CreditCard size={13} />;

function FilterChip({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
      background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 20,
      fontSize: 12, fontWeight: 700, color: "#16a34a", maxWidth: "100%",
    }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <button onClick={onRemove} aria-label="Remove filter" style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#16a34a", display: "flex", padding: 0, lineHeight: 1, flexShrink: 0,
      }}>
        <X size={11} />
      </button>
    </span>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({ label, options, value, onChange, icon: Icon, fullWidth = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    document.addEventListener("touchstart", h);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("touchstart", h);
    };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flex: fullWidth ? "1 1 auto" : "0 0 auto", minWidth: 0 }}>
      <button onClick={() => setOpen(p => !p)} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", minHeight: 40,
        border: value ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
        borderRadius: 9, background: value ? "#f0fdf4" : "#fff",
        cursor: "pointer", fontFamily: "inherit", fontSize: 13,
        fontWeight: 600, color: value ? "#16a34a" : "#374151", whiteSpace: "nowrap",
        width: fullWidth ? "100%" : "auto",
        justifyContent: fullWidth ? "space-between" : "flex-start",
        overflow: "hidden",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, overflow: "hidden" }}>
          {Icon && <Icon size={14} style={{ flexShrink: 0 }} />}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{value || label}</span>
        </span>
        <ChevronDown size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160,
          maxWidth: "calc(100vw - 32px)", maxHeight: 300, overflowY: "auto", overflow: "hidden auto",
        }}>
          <div onClick={() => { onChange(""); setOpen(false); }} style={{
            padding: "11px 14px", cursor: "pointer", fontSize: 13,
            color: "#9ca3af", borderBottom: "1px solid #f3f4f6",
          }}>All</div>
          {options.map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }} style={{
              padding: "11px 14px", cursor: "pointer", fontSize: 13,
              fontWeight: value === opt ? 700 : 400,
              color: value === opt ? "#16a34a" : "#374151",
              background: value === opt ? "#f0fdf4" : "transparent",
            }}>{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Table styles (desktop) ───────────────────────────────────────────────────
const th = {
  padding: "10px 14px", fontSize: 12, fontWeight: 700, color: "#9ca3af",
  textAlign: "left", whiteSpace: "nowrap", textTransform: "uppercase",
  letterSpacing: "0.4px", borderBottom: "2px solid #f0f0f0",
  background: "#fafafa", userSelect: "none",
};
const td = {
  padding: "13px 14px", fontSize: 13, color: "#374151",
  borderBottom: "1px solid #f3f4f6", verticalAlign: "middle",
};

// ─── Mobile order card ────────────────────────────────────────────────────────
function OrderCard({ order, onView }) {
  const customer = order.user?.fullName || order.shippingAddress?.name || "—";
  return (
    <div style={{
      background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12,
      padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* Top row: id + total */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: "#1a2332" }}>#{getShortNum(order)}</span>
          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", wordBreak: "break-all" }}>{order.orderNumber}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#1a2332" }}>
            ₹{parseFloat(order.total || 0).toFixed(2)}
          </p>
          {order.couponDiscount > 0 && (
            <p style={{ margin: 0, fontSize: 11, color: "#ef4444" }}>
              -{parseFloat(order.couponDiscount || 0).toFixed(2)} coupon
            </p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        <StatusBadge label={order.status} />
        <StatusBadge label={order.paymentStatus} type="payment" />
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11,
          fontWeight: 600, color: "#6b7280", padding: "3px 8px", background: "#f9fafb",
          borderRadius: 6, border: "1px solid #e5e7eb",
        }}>
          <MethodIcon method={order.paymentMethod} /> {order.paymentMethod}
        </span>
      </div>

      {/* Customer + date */}
      <div style={{
        display: "flex", justifyContent: "space-between", gap: 10,
        marginTop: 12, paddingTop: 10, borderTop: "1px solid #f3f4f6",
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a2332", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {customer}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {order.user?.email || ""}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
            {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Items + view */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{ display: "flex", flexShrink: 0 }}>
            {order.items?.slice(0, 3).map((item, i) => (
              <div key={i} style={{
                width: 30, height: 30, borderRadius: 6, overflow: "hidden",
                border: "2px solid #fff", marginLeft: i > 0 ? -8 : 0,
                background: "#f3f4f6", flexShrink: 0,
              }}>
                {item.image
                  ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>📦</div>
                }
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>
            {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button onClick={onView} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "9px 14px", minHeight: 40,
          background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 8,
          cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#16a34a", flexShrink: 0,
        }}>
          <Eye size={14} /> View
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OrdersList() {
  const isMobile = useIsMobile();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: LIMIT, sortBy, sortOrder });
      if (search) params.set("search", search.trim());
      if (deliveryStatus) params.set("status", deliveryStatus);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);
      if (paymentMethod) params.set("paymentMethod", paymentMethod);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`${API_URL}/api/orders/admin/all?${params}`, { headers: authHdr() });
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } else {
        setError(data.message || "Failed to load orders");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, deliveryStatus, paymentStatus, paymentMethod, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const commitSearch = () => { setSearch(searchInput); setPage(1); };
  const clearSearch = () => { setSearchInput(""); setSearch(""); setPage(1); };
  const resetFilters = () => {
    setSearch(""); setSearchInput("");
    setDeliveryStatus(""); setPaymentStatus(""); setPaymentMethod("");
    setDateFrom(""); setDateTo("");
    setSortBy("createdAt"); setSortOrder("desc");
    setPage(1);
  };

  const handleStatusUpdate = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === id) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder(p => p === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortOrder("desc"); }
    setPage(1);
  };

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
  const paidCount = orders.filter(o => o.paymentStatus === "Paid").length;
  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const activeFilters = [deliveryStatus, paymentStatus, paymentMethod, dateFrom, dateTo].filter(Boolean).length;
  const hasAnyFilter = !!(search || activeFilters);

  const statCards = [
    { label: "Total Orders", value: total, icon: Package, color: "#1a2332" },
    { label: "Page Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "#16a34a" },
    { label: "Paid Orders", value: paidCount, icon: CheckCircle, color: "#16a34a" },
    { label: "Pending Orders", value: pendingCount, icon: Clock, color: "#d97706" },
  ];

  const skeletonCount = isMobile ? 4 : 8;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100dvh", background: "#f4f6f4", fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      width: "100%", maxWidth: "100vw", overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        img { max-width: 100%; }
        button { -webkit-tap-highlight-color: transparent; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity:0.5; cursor:pointer; }
        tr:hover td { background:#f8fdf8 !important; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: isMobile ? "16px 12px 40px" : "28px 24px" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, marginBottom: isMobile ? 16 : 24, flexWrap: "wrap",
        }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 800, color: "#1a2332" }}>Orders</h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#9ca3af" }}>
              {total} total order{total !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={fetchOrders} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", minHeight: 40,
            background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10,
            cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#374151",
          }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
          gap: isMobile ? 10 : 14, marginBottom: isMobile ? 14 : 22,
        }}>
          {statCards.map((s, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 14, padding: isMobile ? "12px 12px" : "16px 18px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center",
              gap: isMobile ? 10 : 14, minWidth: 0,
            }}>
              <div style={{
                width: isMobile ? 36 : 42, height: isMobile ? 36 : 42, borderRadius: 10,
                background: "#f0fdf4", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <s.icon size={isMobile ? 16 : 18} color={s.color} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: isMobile ? 15 : 20, fontWeight: 800, color: s.color, wordBreak: "break-word" }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Bar ── */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: isMobile ? 12 : "14px 18px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: 14,
        }}>
          <div style={{
            display: isMobile ? "grid" : "flex",
            gridTemplateColumns: isMobile ? "1fr 1fr" : undefined,
            flexWrap: isMobile ? undefined : "wrap",
            gap: 10, alignItems: "center",
          }}>

            {/* Search */}
            <div style={{
              display: "flex", gap: 8, minWidth: 0,
              gridColumn: isMobile ? "1 / -1" : undefined,
              flex: isMobile ? undefined : "1 1 260px",
            }}>
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                <input
                  type="text"
                  placeholder={isMobile ? "Search order, name, email…" : "Search by order ID, customer name, email…"}
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") commitSearch(); }}
                  style={{
                    width: "100%", paddingLeft: 34, paddingRight: searchInput ? 36 : 12,
                    paddingTop: 9, paddingBottom: 9, minHeight: 40,
                    border: search ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
                    borderRadius: 9, fontSize: 16, fontFamily: "inherit", color: "#374151",
                    outline: "none", background: search ? "#f0fdf4" : "#fff",
                  }}
                />
                {searchInput && (
                  <button onClick={clearSearch} aria-label="Clear search" style={{
                    position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9ca3af",
                    display: "flex", padding: 8,
                  }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <button onClick={commitSearch} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: isMobile ? "8px 12px" : "8px 14px", minHeight: 40,
                background: "#16a34a", border: "none", borderRadius: 9, cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", flexShrink: 0,
              }}>
                <Search size={14} />{!isMobile && " Search"}
              </button>
            </div>

            <Dropdown label="Delivery Status" options={DELIVERY_STATUSES} value={deliveryStatus}
              onChange={v => { setDeliveryStatus(v); setPage(1); }} icon={Truck} fullWidth={isMobile} />
            <Dropdown label="Payment Status" options={PAYMENT_STATUSES} value={paymentStatus}
              onChange={v => { setPaymentStatus(v); setPage(1); }} icon={CreditCard} fullWidth={isMobile} />
            <Dropdown label="Payment Method" options={PAYMENT_METHODS} value={paymentMethod}
              onChange={v => { setPaymentMethod(v); setPage(1); }} icon={Banknote} fullWidth={isMobile} />

            {/* Date & Sort toggle */}
            <button onClick={() => setShowFilters(p => !p)} style={{
              display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start",
              gap: 6, padding: "8px 12px", minHeight: 40,
              border: `1.5px solid ${showFilters || activeFilters > 0 ? "#16a34a" : "#e5e7eb"}`,
              borderRadius: 9, background: showFilters ? "#f0fdf4" : "#fff", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13, fontWeight: 600,
              color: showFilters ? "#16a34a" : "#374151", whiteSpace: "nowrap",
              width: isMobile ? "100%" : "auto",
            }}>
              <Filter size={14} /> Date & Sort
              {activeFilters > 0 && (
                <span style={{
                  background: "#16a34a", color: "#fff", borderRadius: "50%",
                  width: 18, height: 18, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 10, fontWeight: 800,
                }}>{activeFilters}</span>
              )}
            </button>

            {/* Clear all */}
            {hasAnyFilter && (
              <button onClick={resetFilters} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 12px", minHeight: 40,
                border: "1.5px solid #fee2e2", borderRadius: 9, background: "#fef2f2",
                cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                fontWeight: 600, color: "#ef4444", whiteSpace: "nowrap",
                gridColumn: isMobile ? "1 / -1" : undefined,
              }}>
                <RotateCcw size={13} /> Clear All
              </button>
            )}
          </div>

          {/* Expanded: date range + sort */}
          {showFilters && (
            <div style={{
              marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6",
              display: "flex", gap: 12, flexWrap: "wrap", alignItems: isMobile ? "stretch" : "center",
              flexDirection: isMobile ? "column" : "row",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: isMobile ? "1 1 auto" : "0 0 auto", minWidth: 0 }}>
                <Calendar size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>From</span>
                <input type="date" value={dateFrom} max={dateTo || undefined}
                  onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                  style={{
                    padding: "7px 10px", minHeight: 40, fontSize: 14, fontFamily: "inherit", color: "#374151",
                    outline: "none", borderRadius: 8, flex: isMobile ? 1 : "0 0 auto", minWidth: 0,
                    border: dateFrom ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
                    background: dateFrom ? "#f0fdf4" : "#fff",
                  }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: isMobile ? "1 1 auto" : "0 0 auto", minWidth: 0 }}>
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>To</span>
                <input type="date" value={dateTo} min={dateFrom || undefined}
                  onChange={e => { setDateTo(e.target.value); setPage(1); }}
                  style={{
                    padding: "7px 10px", minHeight: 40, fontSize: 14, fontFamily: "inherit", color: "#374151",
                    outline: "none", borderRadius: 8, flex: isMobile ? 1 : "0 0 auto", minWidth: 0,
                    border: dateTo ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
                    background: dateTo ? "#f0fdf4" : "#fff",
                  }} />
              </div>
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "6px 10px", minHeight: 40,
                  border: "1.5px solid #fee2e2", borderRadius: 8, background: "#fef2f2",
                  cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: "#ef4444",
                }}>
                  <X size={12} /> Clear dates
                </button>
              )}
              <div style={{
                display: "flex", alignItems: "center", gap: 8, flexWrap: isMobile ? "nowrap" : "wrap",
                width: isMobile ? "100%" : "auto",
              }}>
                <ArrowUpDown size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>Sort by</span>
                <div style={{ flex: isMobile ? 1 : "0 0 auto", minWidth: 0 }}>
                  <Dropdown label="Field" options={["createdAt", "total", "orderNumber"]}
                    value={sortBy} onChange={v => { if (v) { setSortBy(v); setPage(1); } }} fullWidth={isMobile} />
                </div>
                <div style={{ flex: isMobile ? 1 : "0 0 auto", minWidth: 0 }}>
                  <Dropdown label="Order" options={["desc", "asc"]}
                    value={sortOrder} onChange={v => { if (v) { setSortOrder(v); setPage(1); } }} fullWidth={isMobile} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Active Filter Chips ── */}
        {hasAnyFilter && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {search && <FilterChip label={`Search: "${search}"`} onRemove={clearSearch} />}
            {deliveryStatus && <FilterChip label={`Delivery: ${deliveryStatus}`} onRemove={() => { setDeliveryStatus(""); setPage(1); }} />}
            {paymentStatus && <FilterChip label={`Payment: ${paymentStatus}`} onRemove={() => { setPaymentStatus(""); setPage(1); }} />}
            {paymentMethod && <FilterChip label={`Method: ${paymentMethod}`} onRemove={() => { setPaymentMethod(""); setPage(1); }} />}
            {dateFrom && <FilterChip label={`From: ${dateFrom}`} onRemove={() => { setDateFrom(""); setPage(1); }} />}
            {dateTo && <FilterChip label={`To: ${dateTo}`} onRemove={() => { setDateTo(""); setPage(1); }} />}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
            marginBottom: 14, fontSize: 13, color: "#ef4444",
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* ── List: cards on mobile, table on desktop ── */}
        <div style={{
          background: isMobile ? "transparent" : "#fff",
          borderRadius: 14, overflow: "hidden",
          boxShadow: isMobile ? "none" : "0 2px 12px rgba(0,0,0,0.05)",
        }}>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loading ? (
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ height: 14, width: "40%", background: "#f3f4f6", borderRadius: 4, animation: "pulse 1.4s ease-in-out infinite" }} />
                    <div style={{ height: 12, width: "70%", background: "#f3f4f6", borderRadius: 4, marginTop: 10, animation: "pulse 1.4s ease-in-out infinite" }} />
                    <div style={{ height: 12, width: "55%", background: "#f3f4f6", borderRadius: 4, marginTop: 10, animation: "pulse 1.4s ease-in-out infinite" }} />
                  </div>
                ))
              ) : orders.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: 12, padding: "40px 16px", textAlign: "center", color: "#9ca3af", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <Package size={36} style={{ opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>No orders found</p>
                  {hasAnyFilter && (
                    <button onClick={resetFilters} style={{
                      padding: "9px 16px", background: "#f0fdf4", minHeight: 40,
                      border: "1.5px solid #86efac", borderRadius: 8, cursor: "pointer",
                      fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#16a34a",
                    }}>Clear filters</button>
                  )}
                </div>
              ) : (
                orders.map(order => (
                  <OrderCard key={order.id} order={order} onView={() => setSelectedOrder(order)} />
                ))
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr>
                    {[
                      { label: "Order ID", field: "orderNumber" },
                      { label: "Date", field: "createdAt" },
                      { label: "Customer", field: null },
                      { label: "Items", field: null },
                      { label: "Total Amount", field: "total" },
                      { label: "Delivery Status", field: "status" },
                      { label: "Payment", field: "paymentStatus" },
                      { label: "Method", field: "paymentMethod" },
                      { label: "Action", field: null },
                    ].map((col, i) => (
                      <th key={i}
                        style={{ ...th, cursor: col.field ? "pointer" : "default" }}
                        onClick={col.field ? () => toggleSort(col.field) : undefined}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          {col.label}
                          {col.field && sortBy === col.field && (
                            <span style={{ color: "#16a34a", fontSize: 10 }}>
                              {sortOrder === "desc" ? "↓" : "↑"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    Array.from({ length: skeletonCount }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <td key={j} style={td}>
                            <div style={{
                              height: 14, background: "#f3f4f6", borderRadius: 4,
                              width: j === 2 ? "80%" : j === 8 ? "40%" : "60%",
                              animation: "pulse 1.4s ease-in-out infinite",
                            }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ ...td, textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                          <Package size={36} style={{ opacity: 0.3 }} />
                          <p style={{ margin: 0, fontSize: 14 }}>No orders found</p>
                          {hasAnyFilter && (
                            <button onClick={resetFilters} style={{
                              marginTop: 4, padding: "7px 16px", background: "#f0fdf4",
                              border: "1.5px solid #86efac", borderRadius: 8, cursor: "pointer",
                              fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#16a34a",
                            }}>
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id}>
                        <td style={td}>
                          <span style={{ fontWeight: 800, fontSize: 12, color: "#1a2332" }}>
                            #{getShortNum(order)}
                          </span>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{order.orderNumber}</p>
                        </td>
                        <td style={td}>
                          <span style={{ fontSize: 12, color: "#6b7280" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
                            {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </td>
                        <td style={td}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#1a2332" }}>
                            {order.user?.fullName || order.shippingAddress?.name || "—"}
                          </span>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {order.user?.email}
                          </p>
                        </td>
                        <td style={td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ display: "flex" }}>
                              {order.items?.slice(0, 3).map((item, i) => (
                                <div key={i} style={{
                                  width: 28, height: 28, borderRadius: 6, overflow: "hidden",
                                  border: "2px solid #fff", marginLeft: i > 0 ? -8 : 0,
                                  background: "#f3f4f6", flexShrink: 0,
                                }}>
                                  {item.image
                                    ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>📦</div>
                                  }
                                </div>
                              ))}
                            </div>
                            <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                              {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td style={td}>
                          <span style={{ fontWeight: 800, fontSize: 14, color: "#1a2332" }}>
                            ₹{parseFloat(order.total || 0).toFixed(2)}
                          </span>
                          {order.couponDiscount > 0 && (
                            <p style={{ margin: 0, fontSize: 11, color: "#ef4444" }}>
                              -{parseFloat(order.couponDiscount || 0).toFixed(2)} coupon
                            </p>
                          )}
                        </td>
                        <td style={td}><StatusBadge label={order.status} /></td>
                        <td style={td}><StatusBadge label={order.paymentStatus} type="payment" /></td>
                        <td style={td}>
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                            <MethodIcon method={order.paymentMethod} /> {order.paymentMethod}
                          </span>
                        </td>
                        <td style={td}>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{
                              display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                              background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 8,
                              cursor: "pointer", fontFamily: "inherit", fontSize: 12,
                              fontWeight: 700, color: "#16a34a",
                            }}
                          >
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {pages > 1 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexDirection: isMobile ? "column" : "row", gap: 10,
              padding: isMobile ? "12px 0 0" : "14px 20px",
              borderTop: isMobile ? "none" : "1px solid #f3f4f6",
              marginTop: isMobile ? 6 : 0,
            }}>
              {!isMobile && (
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} results
                </span>
              )}
              {isMobile && (
                <span style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
                  Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
                </span>
              )}

              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-end",
              }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  aria-label="Previous page"
                  style={{
                    padding: "7px 10px", minWidth: 40, minHeight: 40, border: "1.5px solid #e5e7eb", borderRadius: 8,
                    background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1,
                  }}>
                  <ChevronLeft size={15} />
                </button>

                {isMobile ? (
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
                    Page {page} of {pages}
                  </span>
                ) : (
                  Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    let p = i + 1;
                    if (pages > 5 && page > 3) p = page - 2 + i;
                    if (p > pages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)} style={{
                        width: 34, height: 34,
                        border: `1.5px solid ${page === p ? "#16a34a" : "#e5e7eb"}`,
                        borderRadius: 8, background: page === p ? "#16a34a" : "#fff",
                        color: page === p ? "#fff" : "#374151",
                        fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      }}>{p}</button>
                    );
                  })
                )}

                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  aria-label="Next page"
                  style={{
                    padding: "7px 10px", minWidth: 40, minHeight: 40, border: "1.5px solid #e5e7eb", borderRadius: 8,
                    background: "#fff", cursor: page === pages ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", opacity: page === pages ? 0.4 : 1,
                  }}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}