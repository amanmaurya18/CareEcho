'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Camera, Activity, ShieldCheck } from 'lucide-react';

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const links = [
    {
      name: 'Senior Companion',
      shortName: 'Companion',
      href: '/',
      icon: Heart,
      badge: 'Daily',
    },
    {
      name: 'Scan Prescription',
      shortName: 'Scan Rx',
      href: '/scan',
      icon: Camera,
      badge: 'OCR',
    },
    {
      name: 'Caregiver Portal',
      shortName: 'Caregiver',
      href: '/caregiver',
      icon: ShieldCheck,
      badge: 'Family',
    },
  ];

  return (
    <nav aria-label="Main Navigation" className="bg-[#FFFFFF] border-b border-zinc-200 card-contrast sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6">
        <div className="grid grid-cols-3 sm:flex sm:justify-start gap-1.5 sm:gap-2 py-1.5 sm:py-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`min-h-tap px-1.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl font-bold sm:font-semibold text-[11px] sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all text-center min-w-0 overflow-hidden ${
                  isActive
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                <span className="sm:hidden leading-tight truncate w-full">{link.shortName}</span>
                <span className="hidden sm:inline">{link.name}</span>
                {link.badge && (
                  <span
                    className={`hidden sm:inline-block text-[11px] sm:text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-sage-700 text-sage-100'
                        : 'bg-zinc-200 text-slate-700'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
