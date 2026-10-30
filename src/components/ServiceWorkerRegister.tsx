'use client';

import { useEffect } from 'react';

export const ServiceWorkerRegister: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Register Service Worker for offline resilience
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => {
              console.log('CareEcho Service Worker active with scope:', reg.scope);
            })
            .catch((err) => {
              console.warn('CareEcho PWA Service Worker notice:', err);
            });
        });
      }

      // 2. Request Notification permission for background medication alarms
      if ('Notification' in window && Notification.permission === 'default') {
        const askPermission = () => {
          Notification.requestPermission().catch(() => {});
          window.removeEventListener('click', askPermission);
          window.removeEventListener('touchstart', askPermission);
        };
        window.addEventListener('click', askPermission, { once: true });
        window.addEventListener('touchstart', askPermission, { once: true });
      }
    }
  }, []);

  return null;
};
