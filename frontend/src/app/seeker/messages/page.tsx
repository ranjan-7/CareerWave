'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import InboxChat from '@/components/InboxChat';

export default function SeekerMessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'SEEKER') {
        router.push('/');
      }
    }
  }, [user, loading]);

  if (loading || !user || user.role !== 'SEEKER') {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[70vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Messages Inbox</h1>
        <p className="text-xs text-slate-500 mt-0.5">Communicate directly with hiring managers and team members.</p>
      </div>
      <InboxChat />
    </div>
  );
}
