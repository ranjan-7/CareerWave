'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Building, MapPin, Globe, Users, UploadCloud, CheckCircle2 } from 'lucide-react';

export default function EmployerOnboardingPage() {
  const { user, loading, refreshSession } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('11-50');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'EMPLOYER') {
        router.push('/');
      } else {
        // Prefill from profile if any exists
        const prof = user.profile;
        setCompanyName(prof?.companyName || '');
        setIndustry(prof?.industry || '');
        setSize(prof?.size || '11-50');
        setLocation(prof?.location || '');
        setWebsiteUrl(prof?.websiteUrl || '');
        setDescription(prof?.description || '');
        setLogoUrl(prof?.logoUrl || '');
      }
    }
  }, [user, loading]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext || '')) {
      toast('Please upload an image file (PNG, JPG, SVG, WEBP)', 'error');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLogoUrl(data.url);
        toast('Logo uploaded successfully!', 'success');
      } else {
        toast(data.error || 'Failed to upload logo', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Error uploading logo', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast('Company Name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/employer/profile', {
        method: 'PUT',
        body: JSON.stringify({
          companyName,
          industry,
          size,
          location,
          websiteUrl,
          description,
          logoUrl,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        toast('Company details saved! Let\'s choose a membership plan.', 'success');
        await refreshSession();
        // Redirect to Choose Plan
        router.push('/employer/plans');
      } else {
        toast(data.error || 'Failed to save company profile', 'error');
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
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-md relative overflow-hidden">
        
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-accent-500/5 blur-3xl pointer-events-none" />

        {/* Page Header */}
        <div className="border-b border-slate-100 pb-5 dark:border-slate-800 mb-6">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="h-6 w-6 text-primary-500" /> Company Profile Onboarding
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in your brand credentials. This company profile is displayed on all job listings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Logo & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
            <div className="relative h-24 w-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-950/20 overflow-hidden flex-shrink-0 cursor-pointer">
              <input
                type="file"
                onChange={handleLogoUpload}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadingLogo}
              />
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="h-full w-full object-contain p-2" />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <UploadCloud className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-[8px] font-bold block">Upload Logo</span>
                </div>
              )}
            </div>

            <div className="w-full space-y-4">
              <Input
                label="Company Name *"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Industry / Field"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Software, Finance"
                />
                <Select
                  label="Company Size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  options={[
                    { label: '1 - 10 employees', value: '1-10' },
                    { label: '11 - 50 employees', value: '11-50' },
                    { label: '51 - 200 employees', value: '51-200' },
                    { label: '201 - 500 employees', value: '201-500' },
                    { label: '501+ employees', value: '501+' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="Headquarters Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Austin, TX"
                className="w-full"
              />
              <MapPin className="absolute right-3.5 top-8.5 h-4.5 w-4.5 text-slate-400" />
            </div>

            <div className="relative">
              <Input
                label="Website URL"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="e.g. https://acme.org"
                className="w-full"
              />
              <Globe className="absolute right-3.5 top-8.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              About the Company
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your company, products, and culture..."
              className="block w-full min-h-[120px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button type="submit" isLoading={submitting} className="flex items-center gap-1.5 font-bold">
              Save & Proceed to Plans <CheckCircle2 className="h-4.5 w-4.5" />
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
}
