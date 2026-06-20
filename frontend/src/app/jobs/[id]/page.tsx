import React from 'react';
import { notFound } from 'next/navigation';
import JobApplyButton from '@/components/JobApplyButton';
import { 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Building, 
  ExternalLink,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface JobPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0; // Ensure fresh job details page load

// Quick Markdown Parser for Server Side Rendering
function renderMarkdown(md: string) {
  if (!md) return '';
  
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-slate-800 dark:text-white mt-4 mb-1 border-b pb-0.5 border-slate-100 dark:border-slate-800">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-slate-800 dark:text-white mt-5 mb-2 border-b pb-1 border-slate-100 dark:border-slate-800">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-extrabold text-slate-900 dark:text-white mt-6 mb-2.5">$1</h1>');
  
  // Bold & Italic
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
  
  // Bullet Lists
  html = html.replace(/^\s*-\s+(.*)$/gim, '<li class="list-disc ml-5 mb-1 text-slate-600 dark:text-slate-300">$1</li>');
  html = html.replace(/^\s*\*\s+(.*)$/gim, '<li class="list-disc ml-5 mb-1 text-slate-600 dark:text-slate-300">$1</li>');
  
  // Numbered Lists
  html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="list-decimal ml-5 mb-1 text-slate-600 dark:text-slate-300">$1</li>');
  
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-3.5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">');
  html = html.replace(/\n/g, '<br />');

  return `<p class="mb-3.5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">${html}</p>`;
}

export default async function JobDetailPage({ params }: JobPageProps) {
  let job: any = null;

  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const res = await fetch(`${BACKEND_URL}/api/jobs/${params.id}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      job = data.job;
    }
  } catch (error) {
    console.error('Failed to fetch job details:', error);
  }

  if (!job || job.status !== 'ACTIVE') {
    notFound();
  }

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: typeof job.createdAt === 'string' ? job.createdAt : job.createdAt.toISOString(),
    validThrough: job.deadline ? (typeof job.deadline === 'string' ? job.deadline : job.deadline.toISOString()) : undefined,
    employmentType: job.jobType === 'FULL_TIME' ? 'FULL_TIME' : job.jobType,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.employer.companyName,
      sameAs: job.employer.websiteUrl || undefined,
      logo: job.employer.logoUrl || undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
      },
    },
    baseSalary: !job.hideSalary && job.salaryMin && job.salaryMax ? {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: 'YEAR',
      },
    } : undefined,
  };

  const skillsList = job.skills.split(',').map((s: string) => s.trim()).filter(Boolean);

  const formatWorkMode = (mode: string) => {
    return mode.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatJobType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow space-y-8">
      {/* Google Jobs Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex gap-5 items-start">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 font-bold text-2xl dark:bg-slate-800 dark:text-slate-400">
            {job.employer.logoUrl ? (
              <img src={job.employer.logoUrl} alt={job.employer.companyName} className="h-full w-full rounded-2xl object-contain p-1" />
            ) : (
              job.employer.companyName[0].toUpperCase()
            )}
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1"><Building className="h-4 w-4" /> {job.employer.companyName}</span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {formatWorkMode(job.workMode)}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {formatJobType(job.jobType)}
              </span>
              {!job.hideSalary && (job.salaryMin || job.salaryMax) && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  {job.salaryMin ? `₹${job.salaryMin >= 100000 ? `${(job.salaryMin/100000).toFixed(1).replace('.0', '')}L` : `${(job.salaryMin/1000).toFixed(0)}k/mo`}` : ''}
                  {job.salaryMin && job.salaryMax ? ' - ' : ''}
                  {job.salaryMax ? `₹${job.salaryMax >= 100000 ? `${(job.salaryMax/100000).toFixed(1).replace('.0', '')}L` : `${(job.salaryMax/1000).toFixed(0)}k/mo`}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-48 flex-shrink-0">
          <JobApplyButton
            jobId={job.id}
            jobTitle={job.title}
            companyName={job.employer.companyName}
          />
        </div>
      </div>

      {/* Main body split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Job detail description */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description container */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              Job Description
            </h2>
            <div 
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(job.description) }}
            />
          </div>

          {/* Requirements container */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              Requirements & Qualifications
            </h2>
            <div 
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(job.requirements) }}
            />
          </div>

          {/* Skills checklist */}
          {skillsList.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                Key Skills & Technologies
              </h2>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-600 dark:bg-slate-800 dark:text-primary-400"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary-500" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Company card & metadata */}
        <div className="space-y-6">
          {/* Company Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sticky top-20">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              About the Company
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 font-bold text-lg dark:bg-slate-800 dark:text-slate-400">
                  {job.employer.logoUrl ? (
                    <img src={job.employer.logoUrl} alt={job.employer.companyName} className="h-full w-full rounded-xl object-contain p-1" />
                  ) : (
                    job.employer.companyName[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {job.employer.companyName}
                  </h4>
                  {job.employer.industry && (
                    <p className="text-xs text-slate-500">{job.employer.industry}</p>
                  )}
                </div>
              </div>

              {job.employer.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                  {job.employer.description}
                </p>
              )}

              <div className="border-t border-slate-100 pt-3 dark:border-slate-800/60 space-y-2 text-xs">
                {job.employer.size && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Company Size:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{job.employer.size} employees</span>
                  </div>
                )}
                {job.employer.location && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Headquarters:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{job.employer.location}</span>
                  </div>
                )}
              </div>

              {job.employer.websiteUrl && (
                <a
                  href={job.employer.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 w-full"
                >
                  Visit Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Posting metadata */}
            <div className="border-t border-slate-100 mt-6 pt-4 dark:border-slate-800/60 space-y-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              {job.deadline && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
