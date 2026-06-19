import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Users, 
  Building, 
  TrendingUp, 
  ChevronRight,
  Code,
  LineChart,
  Megaphone,
  UserCheck,
  ShieldCheck,
  Zap
} from 'lucide-react';

// Categories mock
const CATEGORIES = [
  { name: 'Software Development', icon: <Code className="h-5 w-5" />, slug: 'tech' },
  { name: 'Finance & Accounting', icon: <LineChart className="h-5 w-5" />, slug: 'finance' },
  { name: 'Marketing & Sales', icon: <Megaphone className="h-5 w-5" />, slug: 'marketing' },
  { name: 'Human Resources', icon: <Users className="h-5 w-5" />, slug: 'hr' },
];

export const revalidate = 0; // Disable caching to ensure fresh landing page data

export default async function HomePage() {
  let stats = { jobs: 0, companies: 0, seekers: 0 };
  let featuredJobs: any[] = [];

  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${BACKEND_URL}/api/jobs/homepage`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      stats = data.stats || stats;
      featuredJobs = data.featuredJobs || [];
    }
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 px-4 py-20 sm:px-6 lg:px-8 text-center text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#0c406e,transparent)] opacity-40 pointer-events-none" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl pointer-events-none animate-pulse-slow" />
        
        <div className="relative mx-auto max-w-4xl space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3.5 py-1 text-xs font-semibold text-primary-400 border border-primary-500/20">
            <Zap className="h-3.5 w-3.5" /> Empowering careers worldwide
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Find Your Next Career Move
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-300">
            Discover thousands of job openings from world-class companies, or build your recruitment pipeline to find elite candidates in minutes.
          </p>

          {/* Simple Search Form (client redirect) */}
          <form action="/jobs" method="GET" className="mx-auto mt-10 max-w-2xl flex flex-col sm:flex-row gap-3 bg-white/10 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex-grow flex items-center bg-white dark:bg-slate-900 rounded-xl px-3 border border-transparent focus-within:border-primary-500">
              <Briefcase className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                name="query"
                placeholder="Job title, skills, keywords..."
                className="w-full bg-transparent border-0 py-3.5 px-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-accent-500 hover:bg-accent-400 px-6 py-3.5 text-sm font-semibold text-white shadow shadow-accent-500/20 transition-colors"
            >
              Search Jobs
            </button>
          </form>

          {/* Core metrics badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
            <span className="flex items-center gap-1.5"><TrendingUp className="h-4.5 w-4.5 text-primary-400" /> {stats.jobs}+ Active Roles</span>
            <span className="flex items-center gap-1.5"><Building className="h-4.5 w-4.5 text-primary-400" /> {stats.companies}+ Companies Hiring</span>
            <span className="flex items-center gap-1.5"><Users className="h-4.5 w-4.5 text-primary-400" /> {stats.seekers}+ Professionals</span>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Popular Industries
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Find positions sorted by specialized career streams.
            </p>
          </div>
          <Link href="/jobs" className="group flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            View All Jobs <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              href={`/jobs?query=${cat.name}`}
              className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow hover:border-slate-300 transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-400">
                {cat.icon}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-500">Explore open listings</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Jobs */}
      <section className="bg-slate-100/40 dark:bg-slate-900/10 py-16 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Featured Job Openings
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Check out these premium opportunities vetted for quality.
            </p>
          </div>

          {featuredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800">
              No active listings available. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <div
                  key={job.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    {/* Header */}
                    <div className="flex gap-4 items-start">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 font-bold text-lg dark:bg-slate-800 dark:text-slate-400">
                        {job.employer.logoUrl ? (
                          <img src={job.employer.logoUrl} alt={job.employer.companyName} className="h-full w-full rounded-xl object-contain p-1" />
                        ) : (
                          job.employer.companyName[0].toUpperCase()
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          <Link href={`/jobs/${job.id}`}>
                            {job.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{job.employer.companyName}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.workMode.replace('_', ' ')}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.jobType.replace('_', ' ')}
                      </span>
                      {!job.hideSalary && (job.salaryMin || job.salaryMax) && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                          {job.salaryMin ? `₹${job.salaryMin >= 100000 ? `${(job.salaryMin/100000).toFixed(1).replace('.0', '')}L` : `${(job.salaryMin/1000).toFixed(0)}k/mo`}` : ''} 
                          {job.salaryMin && job.salaryMax ? ' - ' : ''}
                          {job.salaryMax ? `₹${job.salaryMax >= 100000 ? `${(job.salaryMax/100000).toFixed(1).replace('.0', '')}L` : `${(job.salaryMax/1000).toFixed(0)}k/mo`}` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/60 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </span>
                    <span>
                      {new Date(job.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Featured badge */}
                  {job.isFeatured && (
                    <span className="absolute top-3 right-3 rounded bg-accent-500/10 px-1.5 py-0.5 text-[9px] font-bold text-accent-600 border border-accent-200/30 dark:border-accent-900/50">
                      Featured
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Why Choose CareerWave?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            A premium experience engineered for speed, safety, and visual tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-slate-800 dark:text-primary-400">
              <UserCheck className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">One-Click Applies</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Upload your resume once and apply to multiple relevant listings with a single click. Keep your search fast and focused.
            </p>
          </div>
          
          <div className="text-center p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-slate-800 dark:text-primary-400">
              <TrendingUp className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Applicant Tracking System</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Employers manage recruitments with a Kanban-style pipeline. Candidates see application stage progress in real-time.
            </p>
          </div>

          <div className="text-center p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-slate-800 dark:text-primary-400">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Trust & Moderation</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Platform listing moderation gates scam postings, protecting seekers and maintaining a vetted company network.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
