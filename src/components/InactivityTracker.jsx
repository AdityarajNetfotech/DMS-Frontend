import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, ShieldAlert, LogOut, CheckCircle } from 'lucide-react';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_MS = 14 * 60 * 1000; // 14 minutes (1 minute warning)

export default function InactivityTracker() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();

  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Check if current page is public or unauthenticated
  const isPublicPage = useCallback(() => {
    const publicPaths = [
      '/',
      '/login',
      '/superadminlogin',
      '/forgot-password',
      '/verify-otp',
      '/reset-password',
    ];
    const path = location.pathname;

    // Check exact root/login paths
    if (publicPaths.includes(path)) return true;

    // Check company slug auth paths (e.g. /:slug/login, /:slug/forgot-password, /:slug/reset-password)
    if (
      path.endsWith('/login') ||
      path.endsWith('/forgot-password') ||
      path.endsWith('/verify-otp') ||
      path.endsWith('/reset-password')
    ) {
      return true;
    }

    // Check if token exists
    const token = localStorage.getItem('accessToken') || localStorage.getItem('superAdminToken');
    if (!token) return true;

    return false;
  }, [location.pathname]);

  const performLogout = useCallback(() => {
    setShowWarning(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    const companySlug = localStorage.getItem('companySlug');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('superAdminToken');

    const redirectPath = companySlug ? `/${companySlug}/login` : '/login';
    sessionStorage.setItem(
      'session_expired_msg',
      'Your session has expired due to 15 minutes of inactivity for your security.'
    );
    navigate(redirectPath, {
      replace: true,
      state: {
        sessionExpired: true,
        message: 'Your session has expired due to 15 minutes of inactivity.'
      }
    });
  }, [navigate]);

  const stayLoggedIn = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setSecondsLeft(60);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const handleUserActivity = useCallback(() => {
    if (!showWarning) {
      lastActivityRef.current = Date.now();
    }
  }, [showWarning]);

  useEffect(() => {
    if (isPublicPage()) {
      setShowWarning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    // Register user activity listeners
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    let lastThrottledTime = Date.now();

    const throttledHandler = () => {
      const now = Date.now();
      if (now - lastThrottledTime > 1000) {
        lastThrottledTime = now;
        handleUserActivity();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, throttledHandler, { passive: true }));

    // Periodic check every 2 seconds
    timerRef.current = setInterval(() => {
      if (isPublicPage()) return;

      const idleDuration = Date.now() - lastActivityRef.current;

      if (idleDuration >= TIMEOUT_MS) {
        performLogout();
      } else if (idleDuration >= WARNING_MS && !showWarning) {
        setShowWarning(true);
        const remainingSeconds = Math.max(0, Math.ceil((TIMEOUT_MS - idleDuration) / 1000));
        setSecondsLeft(remainingSeconds);

        if (!countdownIntervalRef.current) {
          countdownIntervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
              if (prev <= 1) {
                performLogout();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    }, 2000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, throttledHandler));
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isPublicPage, handleUserActivity, performLogout, showWarning]);

  if (!showWarning || isPublicPage()) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Clock size={32} className="animate-pulse" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Session Timeout Warning
        </h3>

        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          You have been inactive for nearly 15 minutes. For security reasons, your session will automatically terminate in:
        </p>

        {/* Countdown Timer Display */}
        <div className="my-6 py-4 px-6 rounded-2xl bg-amber-50/80 border border-amber-200 inline-flex items-center gap-3">
          <ShieldAlert className="text-amber-600 w-6 h-6 animate-bounce" />
          <span className="text-3xl font-black font-mono text-amber-700 tracking-wider">
            {secondsLeft}s
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={performLogout}
            className="w-full py-3.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout Now</span>
          </button>

          <button
            type="button"
            onClick={stayLoggedIn}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle size={16} />
            <span>Stay Logged In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
