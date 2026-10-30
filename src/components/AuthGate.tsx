'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LoginPage } from './LoginPage';
import { Heart } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  // Fallback safety timeout: If network is slow or device is offline,
  // do not keep the user stuck on the loading screen for more than 2 seconds.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadTimedOut(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Loading state with reassuring CareEcho branding
  if (status === 'loading' && !loadTimedOut) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-3xl bg-sage-50 border-2 border-sage-200 flex items-center justify-center text-sage-600 shadow-sm animate-pulse">
            <Heart className="w-8 h-8 fill-sage-600 text-sage-600" />
          </div>
          <span className="absolute -inset-2 rounded-full border-2 border-sage-400/40 animate-ping" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Opening CareEcho...
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Connecting your health companion and secure vitals
        </p>
      </div>
    );
  }

  // If unauthenticated or timed out, show the Login / Demo Landing Page
  if (status === 'unauthenticated' || !session || loadTimedOut && !session) {
    return <LoginPage callbackUrl={pathname || '/'} />;
  }

  // If authenticated, render children (all companion features unlocked)
  return <>{children}</>;
};

export default AuthGate;
