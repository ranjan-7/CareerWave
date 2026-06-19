'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Check, CreditCard, Sparkles, ShieldCheck, Zap, Lock } from 'lucide-react';

export default function EmployerPlansPage() {
  const { user, loading, refreshSession } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [activePlan, setActivePlan] = useState('free');
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Stripe Simulator States
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'EMPLOYER') {
        router.push('/');
      } else {
        const plan = localStorage.getItem('employer_plan') || 'free';
        setActivePlan(plan);
      }
    }
  }, [user, loading]);

  const handleSelectPlan = (planId: string, price: string, name: string) => {
    if (planId === 'free') {
      localStorage.setItem('employer_plan', 'free');
      setActivePlan('free');
      toast('Free Plan Selected!', 'success');
      router.push('/employer/dashboard');
      return;
    }

    setSelectedPlan({ id: planId, price, name });
    setCheckoutOpen(true);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 16 || expiry.length < 4 || cvc.length < 3) {
      toast('Please enter valid credit card details', 'warning');
      return;
    }

    setProcessing(true);
    // Simulate Stripe payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      setTimeout(() => {
        localStorage.setItem('employer_plan', selectedPlan.id);
        setActivePlan(selectedPlan.id);
        setCheckoutOpen(false);
        setSuccess(false);
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setZip('');
        
        toast(`Payment of ${selectedPlan.price} received! Upgraded to ${selectedPlan.name} plan.`, 'success');
        router.push('/employer/dashboard');
      }, 1500);

    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[70vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const PLAN_TIERS = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '₹0',
      period: 'forever',
      description: 'Get started with posting standard job positions on the network.',
      features: [
        'Post up to 3 basic job listings',
        'Review applicant count per job',
        'Standard Kanban ATS Pipeline Board',
        'In-app communications'
      ],
      icon: <Zap className="h-6 w-6 text-slate-400" />,
      cta: 'Choose Free',
      accentColor: 'border-slate-200 dark:border-slate-800'
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: '₹6,999',
      period: 'month',
      description: 'Unlock recruiter search in database and advanced listing features.',
      features: [
        'Post up to 15 active job listings',
        'Unlock Search Candidate Resume Database',
        'Filter applicants by skill matching',
        'Highlight jobs as "Featured" or "Urgent"',
        'View basic page analytics & candidate views'
      ],
      icon: <Sparkles className="h-6 w-6 text-primary-500" />,
      cta: 'Buy Growth',
      accentColor: 'border-primary-500 dark:border-primary-500 ring-2 ring-primary-500/10'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: '₹19,999',
      period: 'month',
      description: 'Complete corporate scale recruitment workspace with multi-user team handles.',
      features: [
        'Post unlimited active listings',
        'Add team members (Recruiters, Hiring Managers)',
        'Full candidate resume search database',
        'Custom screening questionnaires per job',
        'Priority premium ticket & dedicated agent support',
        'Advanced traffic metrics & exportable analytics'
      ],
      icon: <ShieldCheck className="h-6 w-6 text-accent-500" />,
      cta: 'Buy Enterprise',
      accentColor: 'border-slate-200 dark:border-slate-800 hover:border-accent-500'
    }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow space-y-8 text-center flex flex-col justify-center">
      
      {/* Header */}
      <div className="max-w-xl mx-auto space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-500">Recruiter Memberships</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Choose Your Hiring Power</h1>
        <p className="text-xs text-slate-500">
          Pick a plan that fits your corporate recruitment volume. Upgrade, downgrade, or cancel subscription anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-6">
        {PLAN_TIERS.map((tier) => {
          const isActive = activePlan === tier.id;
          return (
            <div
              key={tier.id}
              className={`rounded-3xl border bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-md transition-all hover:shadow-lg relative overflow-hidden text-left ${tier.accentColor}`}
            >
              {isActive && (
                <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                  Current Active Plan
                </span>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="p-3 bg-slate-50 rounded-2xl dark:bg-slate-850">
                    {tier.icon}
                  </span>
                  <span className="text-2xl font-black text-slate-950 dark:text-white">
                    {tier.price}<span className="text-xs font-semibold text-slate-400">/{tier.period}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{tier.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{tier.description}</p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  onClick={() => handleSelectPlan(tier.id, tier.price, tier.name)}
                  variant={tier.id === 'growth' ? 'accent' : 'outline'}
                  className="w-full text-xs font-bold"
                  disabled={isActive}
                >
                  {isActive ? 'Current Plan' : tier.cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Payment Simulator Modal */}
      <Modal
        isOpen={checkoutOpen}
        onClose={() => !processing && setCheckoutOpen(false)}
        title="Secure Checkout via Stripe"
      >
        {success ? (
          <div className="py-12 text-center space-y-4 animate-scaleUp">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Payment Successful</h3>
            <p className="text-xs text-slate-500">Upgrading your subscription tier. Please wait...</p>
          </div>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="space-y-5 text-left">
            <div className="bg-slate-50 p-4 rounded-2xl dark:bg-slate-950/20 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{selectedPlan?.name}</p>
                <p className="text-[10px] text-slate-400">Recruiter Membership Upgrade</p>
              </div>
              <p className="text-base font-black text-slate-950 dark:text-white">{selectedPlan?.price}</p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Input
                  label="Card Number"
                  required
                  maxLength={16}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="4242 •••• •••• 4242"
                  className="w-full"
                />
                <CreditCard className="absolute right-3.5 top-8.5 h-4.5 w-4.5 text-slate-400" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Expires"
                  required
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full"
                />
                <Input
                  label="CVC"
                  required
                  placeholder="123"
                  maxLength={4}
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                  className="w-full"
                />
                <Input
                  label="ZIP Code"
                  required
                  placeholder="94103"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
              <Lock className="h-3 w-3" /> Encrypted Stripe processing connection. Test card: any numbers.
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)} disabled={processing} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" isLoading={processing} className="text-xs bg-gradient-to-r from-primary-600 to-accent-500 text-white border-0">
                Pay & Upgrade Plan
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
