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
      href: '/',
      icon: Heart,
      badge: 'Daily',
    },
    {
      name: 'Scan Prescription',
      href: '/scan',
      icon: Camera,
      badge: 'OCR',
    },
    {
      name: 'Caregiver Portal',
      href: '/caregiver',
      icon: ShieldCheck,
      badge: 'Family',
    },
  ];

  return (
    <nav aria-label="Main Navigation" className="bg-[#FFFFFF] border-b border-zinc-200 card-contrast sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-start sm:justify-start gap-1.5 sm:gap-2 py-2 overflow-x-auto no-scrollbar px-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`min-h-tap px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-sm sm:text-base flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                <span>{link.name}</span>
                {link.badge && (
                  <span
                    className={`text-[11px] sm:text-xs px-1.5 py-0.5 rounded-full font-medium ${
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
