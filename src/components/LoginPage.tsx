'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import {
  Heart,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle2,
  Lock,
  Globe,
  Camera,
  Bell,
  PhoneCall,
  Activity,
} from 'lucide-react';
import { useCare } from '@/context/CareContext';
import { SupportedLanguage } from '@/lib/types';

interface LoginPageProps {
  callbackUrl?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ callbackUrl = '/' }) => {
  const { language, setLanguage, highContrast, toggleHighContrast } = useCare();
  const [activeTab, setActiveTab] = useState<'quick' | 'oauth'>('quick');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check OAuth providers availability
  const [providers, setProviders] = useState<{ google: boolean; github: boolean }>({
    google: true,
    github: true,
  });

  useEffect(() => {
    fetch('/api/auth/providers')
      .then((res) => res.json())
      .then((data) => {
        setProviders({
          google: !!data?.google,
          github: !!data?.github,
        });
      })
      .catch(() => {});
  }, []);

  // Quick One-Click Demo Login Handler (Single Instance: Margaret Vance)
  const handleQuickLogin = async (role: 'senior' | 'caregiver' = 'senior') => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const name = 'Margaret Vance';
      const targetUrl = callbackUrl || '/';
      const result = await signIn('credentials', {
        name,
        role: 'senior',
        callbackUrl: targetUrl,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage('Failed to sign in. Please try again.');
        setIsSubmitting(false);
      } else if (result?.url) {
        window.location.href = result.url;
      } else {
        window.location.href = targetUrl;
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected login error.');
      setIsSubmitting(false);
    }
  };

  // OAuth Sign In
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await signIn(provider, { callbackUrl: callbackUrl || '/' });
    } catch (err: any) {
      setErrorMessage(`Failed to connect with ${provider}. You can use Instant Demo Access instead.`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between bg-[#FBFBFA] ${highContrast ? 'contrast-mode' : ''} text-slate-900 selection:bg-sage-200 selection:text-sage-900 antialiased relative overflow-hidden`}>
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sage-200/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Accessibility Bar */}
      <header className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-sage-600 text-white flex items-center justify-center shadow-md shadow-sage-600/20 shrink-0">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                CareEcho
              </span>
              <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
                Companion
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Real-Time Multimodal Health & Medication Companion
            </p>
          </div>
        </div>

        {/* Accessibility & Language Quick Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            aria-label="Toggle high contrast accessibility mode"
            className={`min-h-tap px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 transition-all border ${
              highContrast
                ? 'bg-black text-white border-black ring-2 ring-yellow-400'
                : 'bg-white hover:bg-zinc-100 text-slate-800 border-zinc-300 shadow-xs'
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Contrast</span>
          </button>

          {/* Language Selector */}
          <div className="relative inline-block">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              aria-label="Select spoken and display language"
              className="min-h-tap bg-white hover:bg-zinc-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl px-2 sm:px-2.5 py-1.5 border border-zinc-300 shadow-xs cursor-pointer focus:ring-2 focus:ring-sage-600 max-w-[105px] sm:max-w-none truncate"
            >
              <option value="en-US">🇺🇸 English</option>
              <option value="hi-IN">🇮🇳 हिंदी (Hindi)</option>
              <option value="ta-IN">🇮🇳 தமிழ் (Tamil)</option>
              <option value="te-IN">🇮🇳 తెలుగు (Telugu)</option>
              <option value="bn-IN">🇮🇳 বাংলা (Bengali)</option>
              <option value="mr-IN">🇮🇳 मराठी (Marathi)</option>
              <option value="gu-IN">🇮🇳 ગુજરાતી (Gujarati)</option>
              <option value="kn-IN">🇮🇳 ಕನ್ನಡ (Kannada)</option>
              <option value="ml-IN">🇮🇳 മലയാളം (Malayalam)</option>
              <option value="pa-IN">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="es-ES">🇪🇸 Español</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Login Hero & Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col justify-center items-center">
        
        {/* Reassuring Greeting & Headline */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 animate-fadeIn">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200 text-xs sm:text-sm font-bold shadow-xs mb-2.5 sm:mb-3">
            <Lock className="w-3.5 h-3.5 text-sage-600 shrink-0" />
            <span>Secure Elder & Family Health Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Welcome to CareEcho
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 font-medium mt-2 sm:mt-3 leading-relaxed">
            Please sign in to unlock your personalized medication timeline, real-time voice companion, prescription scanner, and family caregiver updates.
          </p>
        </div>

        {/* Auth Box Container */}
        <div className="w-full max-w-xl bg-white border-2 border-zinc-200 rounded-3xl shadow-xl p-4 sm:p-8 card-contrast transition-all relative">
          
          {/* Navigation Tabs between Instant Demo and Google/GitHub */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-2xl mb-6 border border-zinc-200 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => { setActiveTab('quick'); setErrorMessage(null); }}
              className={`flex-1 min-h-tap py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-zinc-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Instant Demo Access</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('oauth'); setErrorMessage(null); }}
              className={`flex-1 min-h-tap py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'oauth'
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-zinc-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4 text-sage-600" />
              <span>Google / GitHub</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">{errorMessage}</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Tip: Use the <strong>Instant Demo Access</strong> tab to explore immediately.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: Single Instant Demo Instance (Margaret Vance) */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Explore CareEcho with a single click — pre-loaded with Margaret Vance&apos;s senior companion timeline:
              </p>

              {/* Single Senior Companion Demo Card */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin('senior')}
                className="w-full text-left p-3 sm:p-5 rounded-2xl border-2 border-sage-300 hover:border-sage-600 bg-sage-50/70 hover:bg-sage-100/70 transition-all group shadow-sm active:scale-[0.99] flex items-center justify-between gap-2.5 sm:gap-4"
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-hidden">
                  <div className="relative shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=140&h=140&q=80"
                      alt="Margaret Vance avatar"
                      className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-sage-400 group-hover:ring-sage-600 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold border-2 border-white">
                      👵
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 group-hover:text-sage-800 truncate">
                        Launch Demo — Margaret
                      </h3>
                      <span className="text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        1-Click Demo
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5 line-clamp-2">
                      Medication timeline • Voice companion orb • Audio reminders • Emergency SOS
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-sage-200 group-hover:bg-sage-600 group-hover:text-white flex items-center justify-center text-sage-600 transition-colors shrink-0 shadow-xs">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </button>

              {isSubmitting && (
                <div className="p-3 text-center text-xs font-bold text-sage-700 bg-sage-50 rounded-xl animate-pulse">
                  Opening CareEcho companion...
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OAuth Sign In (Google & GitHub) */}
          {activeTab === 'oauth' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sage-50 border border-sage-200 text-xs sm:text-sm text-sage-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>First time signing in?</strong> CareEcho will ask for your role & companion name, then present the clean interface to add your medications with <strong>zero alarm medicines</strong>.
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleOAuthLogin('google')}
                className="w-full min-h-tap-lg flex items-center justify-center gap-3 px-5 py-3 bg-white hover:bg-zinc-50 text-slate-800 font-bold text-sm sm:text-base rounded-2xl border-2 border-zinc-300 hover:border-zinc-400 shadow-sm transition-all active:scale-[0.99]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* GitHub Sign In Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleOAuthLogin('github')}
                className="w-full min-h-tap-lg flex items-center justify-between px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base rounded-2xl border-2 border-slate-900 shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>Continue with GitHub</span>
                </div>
                {!providers.github && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                    Setup Needed
                  </span>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-xs text-slate-500">
                  Prefer a quick 1-click preview? Switch to{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('quick')}
                    className="text-sage-700 font-bold hover:underline"
                  >
                    Instant Demo
                  </button>
                </span>
              </div>
            </div>
          )}

          {/* Privacy & Security Footnote */}
          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              <span>HIPAA-aligned data privacy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>WCAG 2.1 AAA accessibility</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid Preview (reassurance of what's unlocked) */}
        <div className="mt-8 sm:mt-12 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fadeIn">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-zinc-200 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-sage-100 text-sage-700 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Voice Companion</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Talk naturally in 11 languages with our responsive AI orb.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-zinc-200 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Audio Dosage Alarms</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Audible spoken alerts remind when overdue medicines are pending.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-zinc-200 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">AI Prescription Scan</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Scan doctor slips or bottles to auto-extract dosage timings.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-zinc-200 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-700 shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Instant Family SOS</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                1-tap emergency dispatch notifies caregivers via SMS & WhatsApp.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-4 text-center text-xs text-slate-500 font-medium">
        CareEcho Companion © 2026 • Designed with compassion for senior citizens & families
      </footer>
    </div>
  );
};

export default LoginPage;
