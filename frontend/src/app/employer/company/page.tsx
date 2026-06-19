'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { Building, UploadCloud, Eye, Globe, MapPin, Briefcase } from 'lucide-react';

export default function CompanyProfilePage() {
  const { user, loading, refreshSession } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('1-10');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'EMPLOYER') {
        router.push('/');
      } else {
        const prof = user.profile;
        setCompanyName(prof?.companyName || '');
        setLogoUrl(prof?.logoUrl || '');
        setCoverUrl(prof?.coverUrl || '');
        setDescription(prof?.description || '');
        setIndustry(prof?.industry || '');
        setSize(prof?.size || '1-10');
        setLocation(prof?.location || '');
        setWebsiteUrl(prof?.websiteUrl || '');
        setLinkedinUrl(prof?.linkedinUrl || '');
      }
    }
  }, [user, loading]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to images
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg' && ext !== 'webp') {
      toast('Please upload an image file (png, jpg, jpeg, webp)', 'error');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
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
      toast('Error uploading image', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast('Company name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/employer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          logoUrl,
          coverUrl,
          description,
          industry,
          size,
          location,
          websiteUrl,
          linkedinUrl,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        toast('Company profile saved successfully!', 'success');
        await refreshSession();
        router.push('/employer/dashboard');
      } else {
        toast(data.error || 'Failed to save profile', 'error');
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      toast('An error occurred during save', 'error');
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8 flex-grow">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Company Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize your employer presence. This data is rendered on company detail and job detail cards.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Company Settings Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary-500" /> Employer Branding
          </h2>

          <div className="flex flex-col sm:flex-row gap-5 items-center">
            {/* Logo Viewer */}
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950/20 font-bold text-3xl overflow-hidden relative group">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1.5" />
              ) : (
                companyName ? companyName[0].toUpperCase() : 'C'
              )}
            </div>

            {/* Logo Upload action */}
            <div className="flex-grow w-full">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Logo Image
              </label>
              <div className="relative border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 rounded-lg p-2 flex justify-center items-center text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  onChange={handleLogoUpload}
                  accept=".png,.jpg,.jpeg,.webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingLogo}
                />
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <UploadCloud className="h-4 w-4" /> 
                  {uploadingLogo ? 'Uploading logo image...' : 'Click to select logo file'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB. Standard square ratio suggested.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Legal Name *"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corporation"
            />
            <Input
              label="Headquarters Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Industry / Field"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Technology, Health Care, Finance"
            />
            <Select
              label="Company Employee Count"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              options={[
                { label: '1 - 10 employees', value: '1-10' },
                { label: '11 - 50 employees', value: '11-50' },
                { label: '51 - 200 employees', value: '51-200' },
                { label: '201 - 500 employees', value: '201-500' },
                { label: '500+ employees', value: '500+' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Website URL"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
            />
            <Input
              label="LinkedIn Page URL"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/example"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company Description & Culture summary
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell candidates about your company's mission, values, and working culture..."
              className="block w-full min-h-[120px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

        </div>

        {/* Action Panel */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/employer/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={submitting}
          >
            Save Changes
          </Button>
        </div>

      </form>
    </div>
  );
}
