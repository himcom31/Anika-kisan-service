// src/components/UserNavbar.jsx  Anika Kisan Service
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, LogOut, X, Menu, ChevronDown } from 'lucide-react';
import AuthModal from '../Pages/UserLogin';
import { fetchCart, fetchWishlist } from "../utils/cartWishlist";
import CartDrawer from "../Components/Cartdrawer";
const API_BASEA = import.meta.env.VITE_API_URL;

// ─── Category Dropdown List ───────────────────────────────────────────────────
const CatDropList = ({ onClose }) => {
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASEA}/api/Category/all`)
      .then(r => r.json())
      .then(data => {
        const all = Array.isArray(data) ? data : data.categories || data.data || [];
        setCats(all.filter(c => c.isActive !== false));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: '16px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
      Loading…
    </div>
  );

  if (cats.length === 0) return (
    <div style={{ padding: '16px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
      No categories found
    </div>
  );

  return (
    <div style={{ maxHeight: 360, overflowY: 'auto', padding: '6px 0' }}>
      {cats.map(cat => (
        <button
          key={cat.id}
          className="cat-drop-item"
          onClick={() => {
            navigate(`/user/product?categories=${cat.id}`);
            onClose();
          }}
          style={{
            width: '100%', textAlign: 'left',
            padding: '9px 16px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 13, fontWeight: 500, color: '#374151',
            fontFamily: 'inherit', transition: 'background 0.15s',
          }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: '#f0faf4', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', border: '1px solid #e8f5e9',
          }}>
            {cat.thumbnail || cat.image
              ? <img src={cat.thumbnail || cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 14 }}>🛒</span>
            }
          </div>
          {cat.name}
        </button>
      ))}
    </div>
  );
};

const NAV_LINKS = [
  { label: 'Home', to: '/', exact: true },
  { label: 'Categories', to: '/', scrollTo: 'feature-categories', dropdown: true },
  { label: 'Products', to: '/user/product' },
  { label: 'Most Popular', to: '/', scrollTo: 'popular-product' },
  { label: 'Contact', to: '/user/contect' },
  { label: 'Blogs', to: '/user/blog' },
];

// ─── Shared box style for icon buttons (search / account / cart) ──────────────
const BOX = {
  minWidth: 56,
  height: 56,
  padding: '0 14px',
  background: '#fff',
  color: '#1a1a1a',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  cursor: 'pointer',
  position: 'relative',
  fontFamily: "'Rajdhani', 'Inter', sans-serif",
  fontSize: 18,
  fontWeight: 700,
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s, box-shadow 0.2s',
};
const BOX_SQUARE = { ...BOX, width: 56, padding: 0 };

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Highlight matching text ──────────────────────────────────────────────────
const Highlight = ({ text = '', query = '' }) => {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span style={{ background: 'rgba(45,158,45,0.15)', color: '#1a6b1a', fontWeight: 800, borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </span>
  );
};

// ─── Search Bar with Suggestions ─────────────────────────────────────────────
const SearchBar = ({ isMobile = false, boxed = false, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const wrapRef = useRef(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 280);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setSuggestions(prev =>
        prev.products.length === 0 && prev.categories.length === 0
          ? prev
          : { products: [], categories: [] }
      );
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchSuggestions = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_BASEA}/api/Products/allFree?search=${encodeURIComponent(q)}&limit=5`),
          fetch(`${API_BASEA}/api/Category/all`),
        ]);
        if (cancelled) return;
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const products = (prodData.products || prodData.data || []).slice(0, 5);
        const allCats = Array.isArray(catData) ? catData : catData.categories || catData.data || [];

        const flatCats = allCats.flatMap(parent => [
          parent,
          ...(parent.subCategories || []),
        ]);

        const categories = flatCats
          .filter(c => c.isActive !== false && c.name.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 3);
        if (!cancelled) {
          setSuggestions({ products, categories });
          setLoading(false);
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setSuggestions({ products: [], categories: [] });
          setLoading(false);
        }
      }
    };

    fetchSuggestions();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  useEffect(() => {
    const handle = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const allSuggestions = [
    ...suggestions.categories.map(c => ({ type: 'category', item: c })),
    ...suggestions.products.map(p => ({ type: 'product', item: p })),
  ];

  const hasResults = suggestions.categories.length > 0 || suggestions.products.length > 0;
  const showDrop = open && query.trim().length > 0 && (loading || hasResults);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, allSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && allSuggestions[activeIndex]) {
        selectSuggestion(allSuggestions[activeIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const selectSuggestion = useCallback(({ type, item }) => {
    setOpen(false);
    setActiveIndex(-1);
    if (type === 'category') {
      setQuery(item.name);
      navigate(`/user/product?categories=${item.id}`);
    } else {
      const name = item.name || '';
      setQuery(name);
      navigate(`/user/product?search=${encodeURIComponent(name)}`);
    }
    if (isMobile && onClose) onClose();
  }, [navigate, isMobile, onClose]);

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    const q = query.trim();
    setOpen(false);
    setActiveIndex(-1);
    if (q) {
      navigate(`/user/product?search=${encodeURIComponent(q)}`);
      if (isMobile && onClose) onClose();
    }
  }, [query, navigate, isMobile, onClose]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setOpen(true);
    } else {
      setOpen(false);
      setSuggestions({ products: [], categories: [] });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions({ products: [], categories: [] });
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  let flatIdx = -1;

  if (isMobile) {
    return (
      <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
        <form onSubmit={handleSearch} className="flex items-center w-full">
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => { if (query.trim() && hasResults) setOpen(true); }}
              onKeyDown={handleKeyDown}
              placeholder="Search products or categories…"
              autoComplete="off"
              className="border border-gray-200 rounded-l-lg px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white w-full"
              style={{ paddingRight: query ? 32 : 14 }}
            />
            {query && (
              <button type="button" onClick={handleClear}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#bbb', display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            )}
          </div>
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg transition flex items-center gap-1 flex-shrink-0">
            <Search size={16} />
          </button>
        </form>
        {showDrop && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.13)', zIndex: 9999, overflow: 'hidden' }}>
            <SuggestionDropdown loading={loading} hasResults={hasResults} query={query} suggestions={suggestions} allSuggestions={allSuggestions} activeIndex={activeIndex} setActiveIndex={setActiveIndex} selectSuggestion={selectSuggestion} handleSearch={handleSearch} flatIdx={flatIdx} />
          </div>
        )}
      </div>
    );
  }

  // Desktop: icon box opens the search input
  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <style>{`
        @keyframes navSearchSlide {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      {!open ? (
        boxed ? (
          <button
            onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            style={BOX_SQUARE}
            aria-label="Search"
          >
            <Search size={22} />
          </button>
        ) : (
          <button
            onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="w-10 h-10 rounded-full border border-green-500 flex items-center justify-center text-green-600 hover:bg-green-50 transition"
          >
            <Search size={18} />
          </button>
        )
      ) : (
        <div style={{ animation: 'navSearchSlide 0.2s ease', display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => { if (query.trim() && hasResults) setOpen(true); }}
              onKeyDown={handleKeyDown}
              placeholder="Search products or categories…"
              autoComplete="off"
              className="border border-gray-200 rounded-l-lg px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              style={{ width: 280, height: 56, paddingRight: query ? 32 : 14 }}
            />
            {query && (
              <button type="button" onClick={handleClear}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#bbb', display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            )}
          </div>
          <button onClick={handleSearch} style={{ height: 56, width: 56, background: '#7ab800', color: '#fff', border: 'none', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <Search size={18} />
          </button>
          <button onClick={() => { setOpen(false); setQuery(''); setSuggestions({ products: [], categories: [] }); }} style={{ marginLeft: 8, padding: 6, background: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {showDrop && open && (
        <div ref={dropRef} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 380, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.13)', zIndex: 9999, overflow: 'hidden' }}>
          <SuggestionDropdown loading={loading} hasResults={hasResults} query={query} suggestions={suggestions} allSuggestions={allSuggestions} activeIndex={activeIndex} setActiveIndex={setActiveIndex} selectSuggestion={selectSuggestion} handleSearch={handleSearch} flatIdx={flatIdx} />
        </div>
      )}
    </div>
  );
};

// ─── Suggestion Dropdown Content ─────────────────────────────────────────────
const SuggestionDropdown = ({ loading, hasResults, query, suggestions, allSuggestions, activeIndex, setActiveIndex, selectSuggestion, handleSearch }) => {
  let flatIdx = -1;
  return (
    <>
      <style>{`
        @keyframes navSgFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .sg-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 14px; cursor: pointer; transition: background 0.12s; border: none; background: transparent; width: 100%; text-align: left; font-family: inherit; }
        .sg-nav-item:hover, .sg-nav-item.active { background: #f4faf4; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      {loading && (
        <div style={{ padding: '16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#bbb', fontSize: 13 }}>
          <div style={{ width: 16, height: 16, border: '2px solid #e0e0e0', borderTopColor: '#2d9e2d', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          Searching…
        </div>
      )}
      {!loading && !hasResults && (
        <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: 13, color: '#bbb' }}>
          No results for <strong>"{query}"</strong>
        </div>
      )}
      {!loading && hasResults && (
        <>
          {suggestions.categories.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#bbb', padding: '10px 14px 5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                Categories
              </div>
              {suggestions.categories.map(cat => {
                flatIdx++;
                const fi = flatIdx;
                return (
                  <button key={cat.id} className={`sg-nav-item${activeIndex === fi ? ' active' : ''}`}
                    onMouseDown={() => selectSuggestion({ type: 'category', item: cat })}
                    onMouseEnter={() => setActiveIndex(fi)}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {cat.thumbnail ? <img src={cat.thumbnail} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d9e2d" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><Highlight text={cat.name} query={query} /></div>
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>Browse category</div>
                    </div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                );
              })}
            </>
          )}
          {suggestions.categories.length > 0 && suggestions.products.length > 0 && <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />}
          {suggestions.products.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#bbb', padding: '10px 14px 5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                Products
              </div>
              {suggestions.products.map(prod => {
                flatIdx++;
                const fi = flatIdx;
                const price = Number(prod.sellingPrice || prod.buyingPrice || 0);
                const image = prod.thumbnail || prod.additionalImages?.[0];
                const cat = typeof prod.category === 'object' ? prod.category?.name : '';
                return (
                  <button key={prod.id} className={`sg-nav-item${activeIndex === fi ? ' active' : ''}`}
                    onMouseDown={() => selectSuggestion({ type: 'product', item: prod })}
                    onMouseEnter={() => setActiveIndex(fi)}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {image ? <img src={image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><Highlight text={prod.name || ''} query={query} /></div>
                      {cat && <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>{cat}</div>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#2d9e2d', flexShrink: 0 }}>₹{price.toFixed(2)}</div>
                  </button>
                );
              })}
            </>
          )}
          <div style={{ padding: '10px 14px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#bbb' }}>↑↓ navigate · Enter · Esc</span>
            <button onMouseDown={handleSearch} style={{ fontSize: 12, fontWeight: 700, color: '#2d9e2d', background: '#f0faf0', border: '1px solid #c8e6c9', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Search size={12} /> See all results
            </button>
          </div>
        </>
      )}
    </>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const UserNavbar = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('userToken'));
  const [cartOpen, setCartOpen] = useState(false);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const hasFetchedRef = useRef(false);

  // Home page par navbar transparent + fixed rahega (hero ke upar overlay).
  // Scroll karne par solid white ho jayega.
  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled;

  const T = {
    text: transparent ? '#fff' : '#374151',
    accent: transparent ? '#7ab800' : '#1a9e3f',
    iconColor: transparent ? '#1a1a1a' : '#374151',
  };

  const linkStyle = (active) => ({
    fontFamily: "'Rajdhani', 'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    color: active ? T.accent : T.text,
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    borderBottom: `2px solid ${active ? T.accent : 'transparent'}`,
    padding: '6px 0',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s, border-color 0.2s, opacity 0.2s',
    textShadow: transparent ? '0 1px 6px rgba(0,0,0,0.35)' : 'none',
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setCatDropOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!isLoggedIn) {
      hasFetchedRef.current = false;
      setCartCount(0);
      setWishlistCount(0);
      return;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchCart().then(data => {
      const total = (data?.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
      setCartCount(total);
    }).catch(() => setCartCount(0));

    fetchWishlist().then(data => {
      setWishlistCount((data?.products || []).length);
    }).catch(() => setWishlistCount(0));
  }, [isLoggedIn]);

  const onCartUpdate = useCallback((e) => {
    const total = (e.detail?.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
    setCartCount(total);
  }, []);

  const onWishlistUpdate = useCallback((e) => {
    setWishlistCount((e.detail?.products || []).length);
  }, []);

  useEffect(() => {
    window.addEventListener("cart-updated", onCartUpdate);
    window.addEventListener("wishlist-updated", onWishlistUpdate);
    return () => {
      window.removeEventListener("cart-updated", onCartUpdate);
      window.removeEventListener("wishlist-updated", onWishlistUpdate);
    };
  }, [onCartUpdate, onWishlistUpdate]);

  useEffect(() => {
    const handler = () => { setAuthMode('login'); setShowAuth(true); };
    window.addEventListener("open-login-modal", handler);
    return () => window.removeEventListener("open-login-modal", handler);
  }, []);

  const user = { name: 'John Doe', avatar: null };

  const openLogin = () => { setAuthMode('login'); setShowAuth(true); };

  const handleLoginSuccess = useCallback((token) => {
    localStorage.setItem('userToken', token);
    setIsLoggedIn(true);
    setShowAuth(false);
    navigate('/');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
    setShowDropdown(false);
    setMobileMenuOpen(false);
    setCartCount(0);
    setWishlistCount(0);
    navigate('/');
  }, [navigate]);

  const handleNavClick = useCallback((link) => {
    setMobileMenuOpen(false);
    setCatDropOpen(false);
    if (!link.scrollTo) { navigate(link.to); return; }
    const scrollToSection = () => {
      const el = document.getElementById(link.scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (location.pathname === link.to) {
      scrollToSection();
    } else {
      navigate(link.to);
      setTimeout(scrollToSection, 300);
    }
  }, [navigate, location.pathname]);

  // Reusable white icon box
  const IconBox = ({ onClick, children, label, style }) => (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        ...BOX_SQUARE,
        width: 'auto',
        border: transparent ? 'none' : '1px solid #e5e7eb',
        boxShadow: transparent ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .rg-navbar { font-family: 'Inter', 'Segoe UI', sans-serif; }
        .rg-nav-link:hover { opacity: 0.8; }
        .rg-icon-box:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.14) !important; }
        .rg-login-btn {
          border: 1.5px solid #7ab800; border-radius: 8px;
          padding: 8px 22px; font-size: 14px; font-weight: 600;
          color: #7ab800; background: #fff; cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .rg-login-btn:hover { background: #7ab800; color: #fff; }
        .cat-drop-item:hover { background: #f0faf4; color: #16a34a; }
        @keyframes catDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileMenuSlideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      <header
        className="rg-navbar w-full"
        style={{
          position: isHome ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: transparent ? 'transparent' : '#fff',
          boxShadow: transparent ? 'none' : '0 2px 12px rgba(0,0,0,0.07)',
          borderBottom: transparent ? 'none' : '1px solid #efefef',
          transition: 'background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* ═══════════════ DESKTOP ═══════════════ */}
        <div
          className="hidden md:flex items-center justify-between"
          style={{
            height: 100,
            padding: 'clamp(12px, 2vw, 20px) clamp(20px, 3.7vw, 70px)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
            <img src="/UserLogo.png" alt="Logo" className="h-12 w-auto object-contain" />
            <div className="leading-tight">
              <span className="block font-extrabold text-xl tracking-tight" style={{ color: transparent ? '#fff' : '#1a9e3f', fontFamily: "'Rajdhani', sans-serif", textShadow: transparent ? '0 1px 6px rgba(0,0,0,0.35)' : 'none' }}>
                Anika
              </span>
              <span className="block font-extrabold text-xl tracking-tight -mt-1" style={{ color: transparent ? '#7ab800' : '#f7941d', fontFamily: "'Rajdhani', sans-serif", textShadow: transparent ? '0 1px 6px rgba(0,0,0,0.35)' : 'none' }}>
                Kisan
              </span>
            </div>
          </div>

          {/* Right: nav links + icon boxes */}
          <div className="flex items-center" style={{ gap: 40 }}>
            <nav className="flex items-center" style={{ gap: 32 }}>
              {NAV_LINKS.map((link) => {
                if (link.dropdown) {
                  return (
                    <div key={link.label} style={{ position: 'relative' }}>
                      <button
                        className="rg-nav-link"
                        onClick={() => setCatDropOpen(p => !p)}
                        style={{ ...linkStyle(catDropOpen), display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {link.label}
                        <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: catDropOpen ? 'rotate(180deg)' : 'none' }} />
                      </button>

                      {catDropOpen && (
                        <>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setCatDropOpen(false)} />
                          <div style={{
                            position: 'absolute', top: 'calc(100% + 14px)', left: -10,
                            width: 240, background: '#fff', borderRadius: 12,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                            border: '1px solid #e8e8e8', zIndex: 41,
                            overflow: 'hidden', animation: 'catDropIn 0.18s ease',
                          }}>
                            <CatDropList onClose={() => setCatDropOpen(false)} />
                          </div>
                        </>
                      )}
                    </div>
                  );
                }

                if (link.scrollTo) {
                  return (
                    <button key={link.label} className="rg-nav-link" onClick={() => handleNavClick(link)} style={linkStyle(false)}>
                      {link.label}
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    end={link.exact}
                    className="rg-nav-link"
                    style={({ isActive }) => linkStyle(isActive)}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Icon boxes: search · account · cart */}
            <div className="flex items-center" style={{ gap: 12 }}>
              <div className="rg-icon-box">
                <SearchBar boxed />
              </div>

              {isLoggedIn ? (
                <div style={{ position: 'relative' }}>
                  <IconBox label="Account" onClick={() => setShowDropdown(p => !p)} style={{ width: 56, padding: 0 }}>
                    <User size={22} />
                  </IconBox>

                  {showDropdown && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                      width: 200, background: '#fff', borderRadius: 12,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)', border: '1px solid #f0f0f0',
                      padding: '8px 0', zIndex: 60,
                    }}>
                      <button onClick={() => { navigate('/user/userDashboard'); setShowDropdown(false); }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 14, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit' }}>
                        <User size={15} /> Dashboard
                      </button>
                      <button onClick={() => { navigate('/user/wishlist'); setShowDropdown(false); }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 14, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit' }}>
                        <Heart size={15} /> Wishlist
                        {wishlistCount > 0 && <span style={{ marginLeft: 'auto', background: '#1a9e3f', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '1px 7px' }}>{wishlistCount}</span>}
                      </button>
                      <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid #f0f0f0' }} />
                      <button onClick={handleLogout}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 14, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit' }}>
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <IconBox label="Login" onClick={openLogin} style={{ width: 56, padding: 0 }}>
                  <User size={22} />
                </IconBox>
              )}

              <IconBox label="Cart" onClick={() => setCartOpen(true)}>
                <ShoppingCart size={22} />
                <span style={{ fontSize: 18, fontWeight: 700 }}>{cartCount}</span>
              </IconBox>
            </div>
          </div>
        </div>

        {/* ═══════════════ MOBILE HEADER ═══════════════ */}
        <div className="flex md:hidden items-center justify-between px-4 py-3">
          <button
            onClick={() => { setMobileMenuOpen(p => !p); setMobileSearchOpen(false); }}
            className="p-1 transition"
            style={{ color: T.text }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/UserLogo.png" alt="Logo" className="h-9 w-auto object-contain" />
            <div className="leading-tight">
              <span className="block font-extrabold text-sm tracking-tight" style={{ color: transparent ? '#fff' : '#1a9e3f' }}>Anika</span>
              <span className="block font-extrabold text-sm tracking-tight -mt-0.5" style={{ color: transparent ? '#7ab800' : '#f7941d' }}>Kisan</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => { setMobileSearchOpen(p => !p); setMobileMenuOpen(false); }} className="p-1.5 transition" style={{ color: T.text }} aria-label="Search">
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            {isLoggedIn ? (
              <>
                <button onClick={() => setCartOpen(true)} className="p-1.5 transition relative" style={{ color: T.text }} aria-label="Cart">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: '#1a9e3f', color: '#fff', fontSize: 9, fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
                </button>
                <button onClick={() => setShowDropdown(p => !p)} className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white" style={{ border: `2px solid ${T.accent}` }}>
                  {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={16} className="text-gray-500" />}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setCartOpen(true)} className="p-1.5 transition" style={{ color: T.text }} aria-label="Cart">
                  <ShoppingCart size={20} />
                </button>
                <button onClick={openLogin} className="rg-login-btn" style={{ padding: '5px 12px', fontSize: 13 }}>Login</button>
              </>
            )}
          </div>
        </div>

        {/* Mobile search expand */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 bg-white border-t border-gray-100">
            <SearchBar isMobile={true} onClose={() => setMobileSearchOpen(false)} />
          </div>
        )}

        {/* Mobile user dropdown */}
        {showDropdown && isLoggedIn && (
          <div className="md:hidden absolute right-4 top-[60px] bg-white border border-gray-100 rounded-xl shadow-lg w-44 py-2 z-[200]">
            <button onClick={() => { navigate('/user/userDashboard'); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition flex items-center gap-2">
              <User size={15} /> Dashboard
            </button>
            <button onClick={() => { navigate('/user/wishlist'); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition flex items-center gap-2">
              <Heart size={15} /> Wishlist
            </button>
            <hr className="my-1 border-gray-100" />
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2">
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </header>

      {/* ═══════════════ MOBILE SLIDE-IN DRAWER ═══════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden" style={{ top: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col" style={{ animation: 'mobileMenuSlideIn 0.25s ease' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-green-50">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
                <img src="/UserLogo.png" alt="Logo" className="h-8 w-auto object-contain" />
                <span className="text-green-600 font-extrabold text-sm">Anika Kisan</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>

            <nav className="flex flex-col py-3 flex-1 overflow-y-auto">
              {NAV_LINKS.map((link) => {
                if (link.scrollTo) {
                  return (
                    <button key={link.label} onClick={() => handleNavClick(link)} className="text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition border-none bg-transparent">
                      {link.label}
                    </button>
                  );
                }
                return (
                  <NavLink key={link.label} to={link.to} end={link.exact} onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `px-5 py-3 text-sm font-medium transition ${isActive ? 'text-green-600 font-semibold bg-green-50' : 'text-gray-700 hover:bg-green-50 hover:text-green-600'}`}>
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
              {isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <button onClick={() => { navigate('/user/userDashboard'); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 py-2 transition">
                    <User size={16} /> Dashboard
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 py-2 transition">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              ) : (
                <button onClick={() => { openLogin(); setMobileMenuOpen(false); }} className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg py-2.5 transition flex items-center justify-center gap-2">
                  <User size={16} /> Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category dropdown + account dropdown ke bahar click karne ke liye backdrop */}
      {showDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
      )}

      {showAuth && (
        <AuthModal mode={authMode} onClose={() => setShowAuth(false)} onLoginSuccess={handleLoginSuccess} />
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default UserNavbar;