'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Briefcase, User, Building, Mail, KeyRound } from 'lucide-react';

export default function RegisterPage() {
  const { user, register, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [role, setRole] = useState<'SEEKER' | 'EMPLOYER'>('SEEKER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      redirectUser(user.role);
    }
  }, [user, loading]);

  const redirectUser = (userRole: string) => {
    if (userRole === 'SEEKER') {
      router.push('/seeker/onboarding');
    } else if (userRole === 'EMPLOYER') {
      router.push('/employer/onboarding');
    } else if (userRole === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast('Please enter an email and password', 'warning');
      return;
    }

    if (role === 'SEEKER' && !fullName.trim()) {
      toast('Please enter your full name', 'warning');
      return;
    }

    if (role === 'EMPLOYER' && !companyName.trim()) {
      toast('Please enter your company name', 'warning');
      return;
    }

    setSubmitting(true);
    const res = await register({
      email,
      password,
      role,
      fullName: role === 'SEEKER' ? fullName : undefined,
      companyName: role === 'EMPLOYER' ? companyName : undefined,
    });
    setSubmitting(false);

    if (res.success) {
      toast('Registration successful! Welcome to CareerWave.', 'success');
      // Router redirection is handled by useEffect
    } else {
      toast(res.error || 'Registration failed. Please try again.', 'error');
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
            Create an Account
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Join CareerWave today to find jobs or hire talent.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setRole('SEEKER')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
              role === 'SEEKER'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <User className="h-4 w-4" /> Job Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole('EMPLOYER')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
              role === 'EMPLOYER'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Building className="h-4 w-4" /> Employer
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {role === 'SEEKER' ? (
              <Input
                label="Full Name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full"
              />
            ) : (
              <Input
                label="Company / Employer Name"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full"
              />
            )}

            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
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
                placeholder="At least 6 characters"
                className="w-full"
              />
              <KeyRound className="absolute right-3.5 top-8.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            By creating an account, you agree to our{' '}
            <a href="#" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">Terms of Service</a> and{' '}
            <a href="#" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">Privacy Policy</a>.
          </div>

          <Button
            type="submit"
            isLoading={submitting}
            className="w-full py-2.5"
          >
            Get Started
          </Button>
        </form>

        {/* Redirect */}
        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Log in here
          </Link>
        </div>

      </div>
    </div>
  );
}
