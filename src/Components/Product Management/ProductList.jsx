import React, { useState, useEffect, useCallback } from 'react';
import ProductDetailModal from './Productdetailmodal';
import AddProductPage from '../Admin/Addproductpage';
import BulkImportModal from './BulkImportModal';

import { Search, Filter, RefreshCw, Eye, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
const API_BASEA = import.meta.env.VITE_API_URL;

const API_URL = `${API_BASEA}/api/products/all`;
const PER_PAGE = 20;

const getName = (field) => {
  if (!field) return null;
  if (typeof field === 'object') return field.name ?? field.title ?? null;
  if (/^[a-f\d]{24}$/i.test(field)) return null;
  return field;
};

// ── Responsive hook ──
const useIsMobile = (bp = 768) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return isMobile;
};

// ── Thumbnail with fallback ──
function Thumb({ src, alt, size }) {
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    return (
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setBroken(true)}
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: 6, border: '1px solid #EAECF0', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, background: '#F3F4F6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 10, flexShrink: 0 }}>
      N/A
    </div>
  );
}

// ── Mobile product card ──
function ProductCard({ p, sl, fmt, onView, onEdit, onDelete }) {
  const rows = [
    { label: 'Shop', value: p.shop ?? p.shopName },
    { label: 'Brand', value: getName(p.brand) },
    { label: 'Category', value: getName(p.category) },
    { label: 'Price', value: fmt(p.sellingPrice ?? p.price) },
    { label: 'Discount', value: fmt(p.discountPrice) },
  ];

  return (
    <div style={{ border: '1px solid #EAECF0', borderRadius: 12, padding: 12, background: '#fff' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Thumb src={p.thumbnail} alt={p.name} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#1A1F2B', lineHeight: 1.3, wordBreak: 'break-word' }}>
              {p.name}
            </span>
            <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>#{sl}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px', marginTop: 12 }}>
        {rows.map(r => (
          <div key={r.label} style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {r.label}
            </div>
            <div style={{ fontSize: 13, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.value ?? <span style={{ color: '#9CA3AF' }}>—</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={onView} style={cardBtn('#F0FBF4', '#C7EDDA', '#00B14F')}>
          <Eye size={15} /> View
        </button>
        <button onClick={onEdit} style={cardBtn('#EFF6FF', '#BFDBFE', '#3B82F6')}>
          <Pencil size={15} /> Edit
        </button>
        <button onClick={onDelete} style={cardBtn('#FFF1F2', '#FECDD3', '#EF4444')}>
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </div>
  );
}

export default function ProductList() {
  const isMobile = useIsMobile();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [shopFilter, setShopFilter] = useState('All Shop');
  const [catFilter, setCatFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('All Brand');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  /* ── fetch ── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}?limit=1000&page=1`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.status === 401) throw new Error('Unauthorized – please log in again');
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.products ?? json.data ?? []);
      setProducts(list);
      setFiltered(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ── filter ── */
  useEffect(() => {
    let list = [...products];
    if (search.trim())
      list = list.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
    if (shopFilter && shopFilter !== 'All Shop')
      list = list.filter(p => (p.shop ?? p.shopName ?? '') === shopFilter);
    if (catFilter)
      list = list.filter(p => getName(p.category) === catFilter);
    if (brandFilter && brandFilter !== 'All Brand')
      list = list.filter(p => getName(p.brand) === brandFilter);
    setFiltered(list);
    setPage(1);
  }, [search, shopFilter, catFilter, brandFilter, products]);

  /* ── delete ── */
  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASEA}/api/products/delete/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      showToast('Product deleted successfully!');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  /* ── pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const shops = ['All Shop', ...new Set(products.map(p => p.shop ?? p.shopName).filter(Boolean))];
  const cats = ['', ...new Set(products.map(p => getName(p.category)).filter(Boolean))];
  const brands = ['All Brand', ...new Set(products.map(p => getName(p.brand)).filter(Boolean))];

  const pageNumbers = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pageNumbers.push(i);

  const fmt = (v) => (v && v > 0 ? `₹${v}` : '$0');
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, filtered.length);

  /* ── if edit mode, show the form overlay ── */
  if (editProduct) {
    return (
      <AddProductPage
        existingProduct={editProduct}
        onSaved={() => { setEditProduct(null); fetchProducts(); showToast('Product updated successfully!'); }}
        onCancel={() => setEditProduct(null)}
      />
    );
  }

  // ── Responsive style values ──
  const ctlSelect = isMobile
    ? { ...selectStyle, width: '100%', minWidth: 0, height: 40, boxSizing: 'border-box', fontSize: 14 }
    : selectStyle;

  const controlsWrap = isMobile
    ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
    : { display: 'flex', alignItems: 'center', gap: 10 };

  const buttonsWrap = isMobile
    ? { gridColumn: '1 / -1', display: 'flex', gap: 8 }
    : { display: 'contents' };

  const mGreen = isMobile ? { flex: 1, justifyContent: 'center', height: 40 } : {};
  const mIcon = isMobile ? { width: 40, height: 40, flexShrink: 0 } : {};

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F8F9FB', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* ── Top bar ── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #EAECF0',
        padding: isMobile ? '12px 14px' : '14px 28px',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between',
        gap: isMobile ? 12 : 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1F2B' }}>Product List</span>

        <div style={controlsWrap}>
          <select value={shopFilter} onChange={e => setShopFilter(e.target.value)} style={ctlSelect}>
            {shops.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={ctlSelect}>
            {cats.map(c => <option key={c ?? '__none__'} value={c ?? ''}>{c || 'Select Category'}</option>)}
          </select>
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            style={{ ...ctlSelect, gridColumn: isMobile ? '1 / -1' : undefined }}
          >
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <div style={buttonsWrap}>
            <button style={{ ...greenBtnStyle, ...mGreen }}>
              <Filter size={14} style={{ marginRight: 5 }} /> Filter
            </button>
            <button onClick={() => setShowImport(true)} style={{ ...greenBtnStyle, ...mGreen }}>
              📥 Bulk Import
            </button>
            <button onClick={fetchProducts} style={{ ...iconBtnStyle, ...mIcon }} title="Refresh">
              <RefreshCw size={15} />
            </button>
            {!isMobile && (
              <button style={iconBtnStyle}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
            )}
          </div>

          <div style={{ position: 'relative', gridColumn: isMobile ? '1 / -1' : undefined, order: isMobile ? -1 : 0 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search here..."
              style={{
                ...selectStyle,
                paddingRight: 32,
                width: isMobile ? '100%' : 180,
                height: isMobile ? 40 : 34,
                boxSizing: 'border-box',
                fontSize: isMobile ? 16 : 13,
              }}
            />
            <Search size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* ── Table / Cards ── */}
      <div style={{
        margin: isMobile ? 12 : '20px 28px',
        background: '#fff', borderRadius: 10, border: '1px solid #EAECF0', overflow: 'hidden',
      }}>
        {loading && (
          <div style={{ padding: 60, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px', display: 'block' }} />
            Loading products...
          </div>
        )}
        {error && (
          <div style={{ padding: 40, textAlign: 'center', color: '#DC2626', fontSize: 14 }}>
            ⚠️ {error} &nbsp;
            <button onClick={fetchProducts} style={{ color: '#00B14F', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 8 }}>Retry</button>
          </div>
        )}

        {!loading && !error && isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10, background: '#F8F9FB' }}>
            {paginated.length === 0 && (
              <div style={{ textAlign: 'center', padding: 30, color: '#9CA3AF', fontSize: 14, background: '#fff', borderRadius: 10 }}>
                No products found.
              </div>
            )}
            {paginated.map((p, i) => (
              <ProductCard
                key={p.id}
                p={p}
                sl={(page - 1) * PER_PAGE + i + 1}
                fmt={fmt}
                onView={() => setSelectedProduct(p)}
                onEdit={() => setEditProduct(p)}
                onDelete={() => setDeleteConfirm(p)}
              />
            ))}
          </div>
        )}

        {!loading && !error && !isMobile && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #EAECF0' }}>
                  {['SL.', 'Thumbnail', 'Product Name', 'Shop', 'Brand', 'Category', 'Price', 'Discount Price', 'Action'].map(h => (
                    <th key={h} style={thStyle(h)}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 14 }}>
                      No products found.
                    </td>
                  </tr>
                )}
                {paginated.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle('SL.')}>{(page - 1) * PER_PAGE + i + 1}</td>
                    <td style={tdStyle('Thumbnail')}>
                      {p.thumbnail
                        ? <img src={p.thumbnail} alt={p.name} referrerPolicy="no-referrer" crossOrigin="anonymous"
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #EAECF0' }}
                          onError={e => { e.target.style.display = 'none'; }} />
                        : <div style={{ width: 40, height: 40, background: '#F3F4F6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 10 }}>N/A</div>
                      }
                    </td>
                    <td style={tdStyle('Product Name')}>
                      <span style={{ fontWeight: 500, color: '#1A1F2B' }}>{p.name}</span>
                    </td>
                    <td style={tdStyle('Shop')}>{p.shop ?? p.shopName ?? <span style={{ color: '#9CA3AF' }}>—</span>}</td>
                    <td style={tdStyle('Brand')}>{getName(p.brand) ?? <span style={{ color: '#9CA3AF' }}>—</span>}</td>
                    <td style={tdStyle('Category')}>{getName(p.category) ?? <span style={{ color: '#9CA3AF' }}>—</span>}</td>
                    <td style={tdStyle('Price')}>{fmt(p.sellingPrice ?? p.price)}</td>
                    <td style={tdStyle('Discount Price')}>{fmt(p.discountPrice)}</td>
                    <td style={{ ...tdStyle('Action'), whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button style={actionBtnStyle('#F0FBF4', '#C7EDDA')} title="View" onClick={() => setSelectedProduct(p)}>
                          <Eye size={14} color="#00B14F" />
                        </button>
                        <button style={actionBtnStyle('#EFF6FF', '#BFDBFE')} title="Edit" onClick={() => setEditProduct(p)}>
                          <Pencil size={14} color="#3B82F6" />
                        </button>
                        <button style={actionBtnStyle('#FFF1F2', '#FECDD3')} title="Delete" onClick={() => setDeleteConfirm(p)}>
                          <Trash2 size={14} color="#EF4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Footer / Pagination ── */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row', gap: 12,
          padding: isMobile ? '0 12px 24px' : '0 28px 28px',
        }}>
          <span style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
            Showing {from} to {to} of {filtered.length} results
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageNavBtn(page === 1)}>
              <ChevronLeft size={14} />
            </button>
            {pageNumbers.map(n => (
              <button key={n} onClick={() => setPage(n)} style={pageNumBtn(n === page)}>{n}</button>
            ))}
            {totalPages > 5 && <span style={{ fontSize: 13, color: '#9CA3AF' }}>...</span>}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageNavBtn(page === totalPages)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select:focus, input:focus { outline: none; border-color: #00B14F !important; box-shadow: 0 0 0 2px rgba(0,177,79,0.12); }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* ── Product Detail Modal ── */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* ── Delete Confirm Dialog ── */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: isMobile ? 22 : 32,
            width: isMobile ? '100%' : 380, maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.2s ease-out', boxSizing: 'border-box',
          }}>
            <div style={{ width: 52, height: 52, background: '#FFF1F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={22} color="#EF4444" />
            </div>
            <h3 style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#1A1F2B', margin: '0 0 8px' }}>Delete Product</h3>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', margin: '0 0 24px', lineHeight: 1.6, wordBreak: 'break-word' }}>
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, height: 44, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{ flex: 1, height: 44, borderRadius: 8, border: 'none', background: '#EF4444', fontSize: 14, fontWeight: 600, color: '#fff', cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1 }}
              >
                {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Import Modal ── */}
      {showImport && (
        <BulkImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => { setShowImport(false); fetchProducts(); showToast('Products imported successfully!'); }}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2000, display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
          color: '#fff', background: toast.type === 'error' ? '#EF4444' : '#00B14F',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', animation: 'toastIn 0.2s ease-out',
          width: 'max-content', maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box',
        }}>
          {toast.type === 'error' ? '⚠️' : '✓'} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Style helpers ── */
const selectStyle = {
  height: 34, padding: '0 10px', fontSize: 13, color: '#374151',
  border: '1px solid #DCDFE4', borderRadius: 7, background: '#fff', cursor: 'pointer',
};
const greenBtnStyle = {
  height: 34, padding: '0 14px', background: '#00B14F', color: '#fff',
  border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500,
  cursor: 'pointer', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
};
const iconBtnStyle = {
  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#1A1F2B', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', flexShrink: 0,
};
const actionBtnStyle = (bg, border) => ({
  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: bg, border: `1px solid ${border}`, borderRadius: 6, cursor: 'pointer',
});
const cardBtn = (bg, border, color) => ({
  flex: 1, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  background: bg, border: `1px solid ${border}`, borderRadius: 8, color,
  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
});
const thStyle = (h) => ({
  padding: '10px 14px',
  textAlign: ['SL.', 'Price', 'Discount Price', 'Action'].includes(h) ? 'center' : 'left',
  fontWeight: 600, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap',
});
const tdStyle = (h) => ({
  padding: '10px 14px', color: '#374151',
  textAlign: ['SL.', 'Price', 'Discount Price', 'Action'].includes(h) ? 'center' : 'left',
});
const pageNumBtn = (active) => ({
  width: 34, height: 34, borderRadius: 6, border: active ? 'none' : '1px solid #DCDFE4',
  background: active ? '#00B14F' : '#fff', color: active ? '#fff' : '#374151',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
});
const pageNavBtn = (disabled) => ({
  width: 34, height: 34, borderRadius: 6, border: '1px solid #DCDFE4',
  background: '#fff', color: disabled ? '#D1D5DB' : '#374151',
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});