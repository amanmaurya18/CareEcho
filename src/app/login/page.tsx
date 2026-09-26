'use client';

import React, { useEffect, Suspense } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  return <LoginPage callbackUrl={callbackUrl} />;
}

export default function LoginRoutePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBFBFA]" />}>
      <LoginContent />
    </Suspense>
  );
}
