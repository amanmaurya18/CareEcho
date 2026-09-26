'use client';

import React, { useEffect } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginRoutePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/');
    }
  }, [status, session, router]);

  return <LoginPage callbackUrl="/" />;
}
