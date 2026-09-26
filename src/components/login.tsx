'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, X, ShieldCheck, User, AlertCircle, RefreshCw } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LoginProps {
  className?: string;
}

export const Login: React.FC<LoginProps> = ({ className = '' }) => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
      setIsOpen(false);
    } catch (err) {
      console.error('Sign out failed', err);
    }
  };

  const handleSwitchRole = async (targetRole: 'senior' | 'caregiver') => {
    try {
      const name = targetRole === 'caregiver' ? 'Sarah Vance' : 'Margaret Vance';
      const targetUrl = targetRole === 'caregiver' ? '/caregiver' : '/';
      await signIn('credentials', {
        name,
        role: targetRole,
        callbackUrl: targetUrl,
        redirect: false,
      });
      setIsOpen(false);
      router.push(targetUrl);
    } catch (err) {
      console.error('Switch role failed', err);
    }
  };

  const user = session?.user;
  const userRole = (user as any)?.role || 'senior';

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Top Right Trigger Button */}
      {status === 'authenticated' && user ? (
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="User profile and account settings"
          className="min-h-tap px-3 py-1.5 bg-sage-50 hover:bg-sage-100 text-sage-800 font-semibold text-xs sm:text-sm rounded-xl border border-sage-200 flex items-center gap-2 shadow-xs active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-sage-600"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User avatar'}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-sage-400"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-sage-200 text-sage-700 flex items-center justify-center text-[10px] font-bold">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
          <span className="max-w-[100px] truncate font-bold text-slate-800">
            {user.name?.split(' ')[0] || 'Account'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      ) : (
        <button
          onClick={() => router.push('/login')}
          aria-label="Open sign in page"
          className="min-h-tap px-3.5 py-1.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-sage-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-sage-600"
        >
          <LogIn className="w-4 h-4 text-white" />
          <span>Log In</span>
        </button>
      )}

      {/* Revealed Dropdown / Popover Menu */}
      {isOpen && status === 'authenticated' && user && (
        <div
          role="dialog"
          aria-label="Account menu"
          className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-80 bg-white rounded-2xl shadow-xl border border-zinc-200 p-3.5 sm:p-4 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User avatar'}
                  className="w-10 h-10 rounded-full object-cover border border-sage-300 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {user.name || 'Logged In'}
                  </h3>
                </div>
                <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-sage-100 text-sage-800 border border-sage-200 mt-0.5">
                  {userRole === 'caregiver' ? '👩‍⚕️ Caregiver' : '👵 Senior Companion'}
                </span>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {user.email || 'active@careecho.health'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close account menu"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Switch Role Option */}
          <div className="my-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Switch Profile
            </span>
            {userRole === 'caregiver' ? (
              <button
                type="button"
                onClick={() => handleSwitchRole('senior')}
                className="w-full text-left p-2.5 rounded-xl border border-zinc-200 hover:border-sage-300 hover:bg-sage-50 text-xs font-bold text-slate-800 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <span>👵</span>
                  <span>Switch to Senior Companion</span>
                </div>
                <RefreshCw className="w-3.5 h-3.5 text-sage-600" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSwitchRole('caregiver')}
                className="w-full text-left p-2.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-xs font-bold text-slate-800 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <span>👩‍⚕️</span>
                  <span>Switch to Caregiver Portal</span>
                </div>
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            )}
          </div>

          {/* Status Note */}
          <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Account synced with CareEcho Companion</span>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full min-h-tap flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-sos-50 text-slate-700 hover:text-sos-700 hover:border-sos-200 font-bold text-xs sm:text-sm rounded-xl border border-zinc-300 shadow-xs transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4 text-sos-600" />
            <span>Sign Out & Lock Features</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;