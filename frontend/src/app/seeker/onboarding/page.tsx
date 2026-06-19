'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Briefcase, MapPin, Sparkles, Code, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function SeekerOnboardingPage() {
  const { user, loading, refreshSession } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('MID');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'SEEKER') {
        router.push('/');
      } else if (user.profile?.headline) {
        // If they already have profile data, allow them to skip or go to dashboard
        // But let them onboarding if they explicitly want to
      }
    }
  }, [user, loading]);

  const handleNext = () => {
    if (step === 1 && !jobTitle.trim()) {
      toast('Please enter a target job title', 'warning');
      return;
    }
    if (step === 2 && !skills.trim()) {
      toast('Please enter at least one skill tag', 'warning');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!location.trim()) {
      toast('Please enter your preferred location', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Put initial details into the seeker profile
      const res = await fetch('/api/seeker/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: user?.profile?.fullName || 'Job Seeker',
          headline: jobTitle,
          location,
          skills,
          experience: user?.profile?.experience || '[]',
          education: user?.profile?.education || '[]',
          bio: `Experienced specialist in ${jobTitle}.`,
          openToWork: true,
          visibility: 'PUBLIC',
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        toast('Onboarding completed! Let\'s build your profile detail.', 'success');
        await refreshSession();
        // Redirect to Profile Builder to complete details
        router.push('/seeker/profile');
      } else {
        toast(data.error || 'Failed to complete onboarding', 'error');
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      toast('An error occurred during onboarding', 'error');
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
    <div className="flex flex-grow items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950 min-h-[85vh]">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-md relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent-500/5 blur-3xl pointer-events-none" />

        {/* Steps header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-500 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Step {step} of 3
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              {step === 1 && "What's your focus area?"}
              {step === 2 && "Highlight your expertise"}
              {step === 3 && "Where are you looking?"}
            </h1>
          </div>
          <div className="flex gap-1">
            <span className={`h-1.5 w-6 rounded-full transition-all ${step >= 1 ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
            <span className={`h-1.5 w-6 rounded-full transition-all ${step >= 2 ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
            <span className={`h-1.5 w-6 rounded-full transition-all ${step >= 3 ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[180px] flex flex-col justify-center">
          
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tell us your target job title. This helps us match you with relevant roles.
              </p>
              <div className="relative">
                <Input
                  label="Target Job Title *"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full"
                />
                <Briefcase className="absolute right-3.5 top-8.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your experience level and key skills to stand out to recruiters.
              </p>
              
              <Select
                label="Experience Level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                options={[
                  { label: 'Junior / Entry Level (0-2 years)', value: 'ENTRY' },
                  { label: 'Mid-Level (2-5 years)', value: 'MID' },
                  { label: 'Senior Specialist (5-8 years)', value: 'SENIOR' },
                  { label: 'Lead / Principal (8+ years)', value: 'LEAD' },
                  { label: 'Executive Management', value: 'EXECUTIVE' },
                ]}
              />

              <div className="relative mt-2">
                <Input
                  label="Core Skills (Comma separated)"
                  required
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, TypeScript, AWS"
                  helperText="List your top skills separated by commas."
                  className="w-full"
                />
                <Code className="absolute right-3.5 top-8.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Let us know where you are located and where you want to work.
              </p>
              <div className="relative">
                <Input
                  label="Current / Preferred Location *"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  className="w-full"
                />
                <MapPin className="absolute right-3.5 top-8.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-10 pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={handleNext} className="flex items-center gap-1.5">
              Next Step <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={submitting} className="flex items-center gap-1.5">
              Finish Onboarding <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
