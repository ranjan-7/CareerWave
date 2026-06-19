'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Briefcase, KeyRound, Mail } from 'lucide-react';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      redirectUser(user.role);
    }
  }, [user, loading]);

  const redirectUser = (role: string) => {
    if (role === 'SEEKER') {
      if (user?.profile?.headline) {
        router.push('/seeker/dashboard');
      } else {
        router.push('/seeker/onboarding');
      }
    } else if (role === 'EMPLOYER') {
      if (user?.profile?.industry || user?.profile?.description) {
        router.push('/employer/dashboard');
      } else {
        router.push('/employer/onboarding');
      }
    } else if (role === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter both email and password', 'warning');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      toast('Welcome back! Logged in successfully.', 'success');
      // Router redirection is handled by useEffect
    } else {
      toast(res.error || 'Invalid credentials. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[70vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-grow items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-md">
        
        {/* Branding */}
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 text-white shadow shadow-primary-500/20">
            <Briefcase className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Log in to CareerWave
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Welcome back! Please enter your details below.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full"
              />
              <Mail className="absolute right-3.5 top-8.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
              />
              <KeyRound className="absolute right-3.5 top-8.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              Remember me
            </label>
            <a href="#" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            isLoading={submitting}
            className="w-full py-2.5"
          >
            Sign In
          </Button>
        </form>

        {/* Redirect */}
        <div className="text-center text-xs text-slate-500">
          New to CareerWave?{' '}
          <Link href="/register" className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
