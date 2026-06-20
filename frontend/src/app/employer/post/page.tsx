'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { PlusSquare, Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';

export default function PostJobPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Job Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('REMOTE');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [hideSalary, setHideSalary] = useState(false);
  const [deadline, setDeadline] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Redirect if not employer
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'EMPLOYER') {
        router.push('/');
      }
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !requirements.trim() || !skills.trim() || !location.trim()) {
      toast('Please fill in all required job details', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          requirements,
          skills,
          location,
          workMode,
          jobType,
          salaryMin: salaryMin || null,
          salaryMax: salaryMax || null,
          hideSalary,
          deadline: deadline || null,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        toast(`Job posting "${title}" published successfully!`, 'success');
        router.push('/employer/dashboard');
        router.refresh();
      } else {
        toast(data.error || 'Failed to publish job', 'error');
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      toast('An error occurred during submission', 'error');
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8 flex-grow">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Post a New Position
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish a job listing to find candidates. You can edit, close, or renew this posting at any time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary-500" /> Position Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Position Title *"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
            />
            <Input
              label="Job Location *"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX (or Hybrid, or Remote)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Work Mode *"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              options={[
                { label: 'Remote', value: 'REMOTE' },
                { label: 'Hybrid', value: 'HYBRID' },
                { label: 'On-site', value: 'ON_SITE' },
              ]}
            />
            <Select
              label="Employment Type *"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              options={[
                { label: 'Full-time', value: 'FULL_TIME' },
                { label: 'Part-time', value: 'PART_TIME' },
                { label: 'Contract', value: 'CONTRACT' },
                { label: 'Internship', value: 'INTERNSHIP' },
              ]}
            />
            <Input
              label="Skills & Technologies *"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Next.js, Postgres"
              helperText="Separate tags with a comma"
            />
          </div>
        </div>

        {/* Rich Editors for description and requirements */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
            <PlusSquare className="h-5 w-5 text-primary-500" /> Rich Content Descriptions
          </h2>

          <RichTextEditor
            label="Job Description *"
            value={description}
            onChange={setDescription}
            placeholder="Introduce the company mission, define the role scope, and outline work duties..."
          />

          <RichTextEditor
            label="Requirements & Qualifications *"
            value={requirements}
            onChange={setRequirements}
            placeholder="Specify required experience levels, coding proficiencies, degrees, or certifications..."
          />
        </div>

        {/* Salary options */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
            <span className="text-primary-500 font-extrabold text-lg leading-none">₹</span> Compensation & Deadlines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input
              label="Min Annual Salary (₹)"
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="e.g. 600000"
            />
            <Input
              label="Max Annual Salary (₹)"
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="e.g. 1800000"
            />
            
            <div className="flex flex-col justify-end pb-2.5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideSalary}
                  onChange={(e) => setHideSalary(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                Hide salary range from public listing
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
            <Input
              label="Application Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
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
            variant="accent"
          >
            Publish Job Listing
          </Button>
        </div>

      </form>
    </div>
  );
}
