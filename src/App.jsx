import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollToTop from './Components/ScrollToTop';  // adjust path as needed


// Admin Pages & Components
import LoginPage from './Admin/Pages/Login';
import AdminLayout from './Components/AdminLayout';
import CategoriesPage from './User/Pages/CategoriesPage';
import SubCategoriesPage from "./User/Pages/SubCategoriesPage";



// User Pages & Components
import UserLoginPage from './User/Pages/UserLogin';
import UserLayout from './User/UserLayout';
import HomePage from './User/Pages/HomePage';

// User Shell — visible on all user-side pages
import UserNavbar from './User/Components/Usernavbar';
import UserFooter from './User/Components/Userfooter';
import ResetPassword from './User/Pages/ResetPassword';  // ← add this import
import ForgotPassword from './User/Pages/ForgotPassword';


// driver
import DeliveryAgentApp from './Driver/Deliveryagentapp';



///////////////////////////

import ProductsPage from './User/Pages/Productspage';
import BlogPage from './User/Pages/Blogpage';
import ProductDetails from './User/Pages/Productdetails';
import ContactPage from './User/Pages/Contactpage';
import AboutUs from './User/Pages/Aboutus';
import TermsAndConditions from './User/Pages/Termsandconditions';
import PrivacyPolicy from './User/Pages/Privacypolicy';
import DeleteAccount from './User/Pages/Deleteaccount';


//////////////////////////////////////////////////////////////////////////////////

import CartToast from './User/Components/Carttoast'; // apna sahi path lagao


/////////////////////////////////////////////////////////////////////////////////

// ─────────────────────────────────────────
// Full-Page Loader Component
// ─────────────────────────────────────────
const PageLoader = ({ fading }) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0d0d',
    zIndex: 9999,
    opacity: fading ? 0 : 1,
    transition: 'opacity 2s ease',
  }}>

    <style>{`
      @keyframes spin-ring     { to { transform: rotate(360deg); } }
      @keyframes spin-ring-rev { to { transform: rotate(-360deg); } }
      @keyframes fade-up       { 0% { opacity:0; transform:translateY(16px); } 100% { opacity:1; transform:translateY(0); } }
      @keyframes shimmer       { 0%,100% { opacity:0.3; transform:scaleX(0.4); } 50% { opacity:1; transform:scaleX(1); } }
      @keyframes blink-dot     { 0%,100% { opacity:0.15; } 50% { opacity:1; } }
      @keyframes slide-in      { 0% { width:0; } 100% { width:100%; } }
      @keyframes glow-pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(76,175,80,0)} 50%{box-shadow:0 0 28px 6px rgba(76,175,80,0.22)} }
    `}</style>

    {/* Subtle grid background */}
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)',
      backgroundSize: '40px 40px',
    }} />

    {/* Top green accent line */}
    <div style={{
      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: 120, height: 2,
      background: 'linear-gradient(90deg,transparent,#4CAF50,transparent)',
      borderRadius: 99,
    }} />

    {/* Bottom orange accent line */}
    <div style={{
      position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: 80, height: 2,
      background: 'linear-gradient(90deg,transparent,#FF6B2B,transparent)',
      borderRadius: 99,
    }} />

    {/* Main content row */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 60, padding: 40 }}>

      {/* LEFT: Spinning ring + cart icon */}
      <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0, animation: 'glow-pulse 2.4s ease-in-out infinite' }}>

        {/* Outer dashed ring — green, clockwise */}
        <svg width="140" height="140" viewBox="0 0 140 140"
          style={{ position: 'absolute', inset: 0, animation: 'spin-ring 3s linear infinite' }}>
          <circle cx="70" cy="70" r="64" stroke="#4CAF50" strokeWidth="1.5" fill="none"
            strokeDasharray="8 6" strokeLinecap="round" opacity="0.5" />
        </svg>

        {/* Inner dashed ring — orange, counter-clockwise */}
        <svg width="140" height="140" viewBox="0 0 140 140"
          style={{ position: 'absolute', inset: 0, animation: 'spin-ring-rev 2s linear infinite' }}>
          <circle cx="70" cy="70" r="50" stroke="#FF6B2B" strokeWidth="1" fill="none"
            strokeDasharray="4 10" strokeLinecap="round" opacity="0.4" />
        </svg>

        {/* Center circle with cart icon */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 80, height: 80, background: '#141414',
          border: '1px solid rgba(76,175,80,0.3)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10h4.5l5 14h14l4-10H16" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="28" r="2.5" fill="#FF6B2B" />
            <circle cx="30" cy="28" r="2.5" fill="#FF6B2B" />
            <path d="M28 8 Q31 4 35 6 Q33 10 28 8Z" fill="#4CAF50" opacity="0.8" />
            <line x1="28" y1="8" x2="30" y2="13" stroke="#4CAF50" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* RIGHT: Brand text + progress */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Badge */}
        <div style={{
          animation: 'fade-up 0.5s ease both',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)',
          borderRadius: 99, padding: '3px 10px', marginBottom: 14, width: 'fit-content',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: '#4CAF50',
            animation: 'blink-dot 1.4s ease infinite',
          }} />
          <span style={{ fontSize: 11, color: '#4CAF50', letterSpacing: '1.5px', fontWeight: 500 }}>
            FRESH &amp; LOCAL
          </span>
        </div>

        {/* Brand name */}
        <div style={{ animation: 'fade-up 0.55s 0.1s ease both', display: 'flex', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontSize: 42, fontWeight: 700, color: '#e8e8e8', letterSpacing: -1, lineHeight: 1 }}>Orchard</span>
          <span style={{ fontSize: 42, fontWeight: 700, color: '#FF6B2B', letterSpacing: -1, lineHeight: 1 }}>Engine</span>
        </div>

        {/* Tagline */}
        <p style={{ animation: 'fade-up 0.6s 0.2s ease both', fontSize: 13, color: '#555', letterSpacing: '.5px', margin: '0 0 20px', fontWeight: 400 }}>
          Delivering fresh to your doorstep
        </p>

        {/* Progress bar */}
        <div style={{ animation: 'fade-up 0.65s 0.3s ease both', width: 220, marginBottom: 10 }}>
          <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg,#4CAF50,#FF6B2B)',
              borderRadius: 99,
              animation: 'slide-in 2.2s cubic-bezier(.4,0,.2,1) infinite alternate',
            }} />
          </div>
        </div>

        {/* Skeleton shimmer lines */}
        <div style={{ animation: 'fade-up 0.7s 0.35s ease both', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[{ w: 180, delay: '0s' }, { w: 130, delay: '0.25s' }].map(({ w, delay }, i) => (
            <div key={i} style={{ height: 8, width: w, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 4,
                background: i === 0 ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.15)',
                animation: `shimmer 1.8s ${delay} ease-in-out infinite`,
                transformOrigin: 'left',
              }} />
            </div>
          ))}
        </div>

      </div>
    </div>
  </div>
);







// ─────────────────────────────────────────
// Admin Protected Route — checks adminToken
// If no token → redirect to /admin/login
// ─────────────────────────────────────────
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};


// ─────────────────────────────────────────
// User Protected Route — checks userToken
// If no token → redirect to /user/login
// ─────────────────────────────────────────
const UserProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    return <Navigate to="/user/login" replace />;
  }
  return children;
};


// ─────────────────────────────────────────
// Layout wrapper — shows navbar & footer
// only on non-admin routes
// ─────────────────────────────────────────
const AppLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');
  const isDriverRoute = pathname.startsWith('/driver');   // ← add this


  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />                              {/* ← ADD HERE */}
      {!isAdminRoute && !isDriverRoute && <UserNavbar />}   {/* ← updated */}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && !isDriverRoute && <UserFooter />}   {/* ← updated */}
    </div>
  );
};


function App() {
  const [appReady, setAppReady] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Simulates waiting for fonts, tokens, configs, etc.
    // Replace this with real async calls if needed
    const timer = setTimeout(() => {
      setFadeOut(true);                           // trigger fade animation
      setTimeout(() => setAppReady(true), 1000);  // unmount loader after fade
    }, 500); // small intentional delay so loader doesn't flash for fast loads

    return () => clearTimeout(timer);
  }, []);

  // Show loader until app is ready
  if (!appReady) return <PageLoader fading={fadeOut} />;

  return (
    <AppLayout>
      <CartToast />
      <Routes>

        <Route path="/" element={<HomePage />} />


        {/* 1. Default Route → redirect to home page */}

        {/* ──────────────────────────────── */}
        {/*         ADMIN ROUTES             */}
        {/* ──────────────────────────────── */}

        {/* 2. Public Route — Admin Login */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* 3. Protected Admin Routes
            - Any path under /admin/* is protected
            - No token → goes back to /admin/login automatically */}
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        />

        {/* ──────────────────────────────── */}
        {/*         USER ROUTES              */}
        {/* ──────────────────────────────── */}

        {/* 4. Public Routes — no token required */}
        <Route path="/user/login" element={<UserLoginPage />} />
        <Route path="/user/product" element={<ProductsPage />} />
        <Route path="/user/blog" element={<BlogPage />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/user/contect" element={<ContactPage />} />
        <Route path="/user/about" element={<AboutUs />} />
        <Route path="/user/termcondition" element={<TermsAndConditions />} />
        <Route path="/user/privacy" element={<PrivacyPolicy />} />
        <Route path="/user/deleteaccount" element={<DeleteAccount />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user/categories/:categoryId" element={<SubCategoriesPage />} />
<Route path="/user/categories" element={<CategoriesPage />} />









        {/* /////////////////// driver /////////////////////////////////// */}


        <Route path="/driver/*" element={<DeliveryAgentApp />} />

        {/* /////////////////// driver /////////////////////////////////// */}



        {/* 5. Protected User Routes
            - Any path under /user/* is protected
            - No token → goes back to /user/login automatically */}
        <Route
          path="/user/*"
          element={
            <UserProtectedRoute>
              <UserLayout />
            </UserProtectedRoute>
          }
        />

        {/* 6. 404 Fallback */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen font-bold text-2xl text-slate-400">
              404 - Page Not Found
            </div>
          }
        />

      </Routes>
    </AppLayout>
  );
}

export default App;