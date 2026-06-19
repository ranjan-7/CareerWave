'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchFilterSidebar, { FilterState } from '@/components/SearchFilterSidebar';
import { ListingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { MapPin, Briefcase, DollarSign, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import Link from 'next/link';

function JobsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get('query') || '',
    location: searchParams.get('location') || '',
    workMode: searchParams.get('workMode') || '',
    jobType: searchParams.get('jobType') || '',
    salaryMin: searchParams.get('salaryMin') || '',
  });

  const [jobs, setJobs] = useState<any[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs when filters change
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.query) queryParams.set('query', filters.query);
      if (filters.location) queryParams.set('location', filters.location);
      if (filters.workMode) queryParams.set('workMode', filters.workMode);
      if (filters.jobType) queryParams.set('jobType', filters.jobType);
      if (filters.salaryMin) queryParams.set('salaryMin', filters.salaryMin);

      const res = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error(err);
      toast('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved jobs list for seeker bookmarks
  const fetchSavedJobs = async () => {
    if (!user || user.role !== 'SEEKER') return;
    try {
      const res = await fetch('/api/jobs/save');
      if (res.ok) {
        const data = await res.json();
        setSavedJobIds(data.savedJobs.map((j: any) => j.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      location: '',
      workMode: '',
      jobType: '',
      salaryMin: '',
    });
    router.push('/jobs');
  };

  const toggleSaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast('Please log in as a job seeker to bookmark jobs', 'warning');
      router.push('/login');
      return;
    }

    if (user.role !== 'SEEKER') {
      toast('Only job seekers can bookmark jobs', 'warning');
      return;
    }

    const isCurrentlySaved = savedJobIds.includes(jobId);

    try {
      if (isCurrentlySaved) {
        const res = await fetch(`/api/jobs/save?jobId=${jobId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setSavedJobIds(prev => prev.filter(id => id !== jobId));
          toast('Job removed from bookmarks', 'info');
        }
      } else {
        const res = await fetch('/api/jobs/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        });
        if (res.ok) {
          setSavedJobIds(prev => [...prev, jobId]);
          toast('Job added to bookmarks!', 'success');
        }
      }
    } catch (err) {
      console.error(err);
      toast('An error occurred. Please try again.', 'error');
    }
  };

  const formatWorkMode = (mode: string) => {
    return mode.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatJobType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col md:flex-row gap-8">
      {/* Sticky Filter Sidebar */}
      <div className="w-full md:w-80 flex-shrink-0">
        <SearchFilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      {/* Main Jobs Listing Container */}
      <div className="flex-grow space-y-6">

        {/* Summary header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Discover Job Openings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? 'Searching...' : `${jobs.length} jobs match your query`}
            </p>
          </div>
        </div>

        {/* Listings content */}
        {loading ? (
          <ListingSkeleton />
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center text-slate-500">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No matching jobs found</h3>
            <p className="text-xs mt-1.5 max-w-xs mx-auto text-slate-500">
              Try adjusting your keywords, broadening your location, or removing specific filter criteria.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-500"
            >
              Clear Search Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);

              return (
                <div
                  key={job.id}
                  className={`group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow dark:border-slate-800 dark:bg-slate-900 transition-all ${job.isFeatured ? 'ring-2 ring-primary-500/10 border-primary-200 dark:border-primary-900/40' : ''
                    }`}
                >
                  <div className="flex gap-4 items-start">

                    {/* Logo */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 font-bold text-lg dark:bg-slate-800 dark:text-slate-400">
                      {job.employer.logoUrl ? (
                        <img
                          src={job.employer.logoUrl}
                          alt={job.employer.companyName}
                          className="h-full w-full rounded-xl object-contain p-1"
                        />
                      ) : (
                        job.employer.companyName[0].toUpperCase()
                      )}
                    </div>

                    {/* Job Details info */}
                    <div className="flex-grow space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            <Link href={`/jobs/${job.id}`}>
                              {job.title}
                            </Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                            <span>{job.employer.companyName}</span>
                            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {job.location}</span>
                          </div>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => toggleSaveJob(job.id, e)}
                          className={`rounded-lg p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 ${isSaved
                              ? 'text-accent-500 bg-accent-50/20 border-accent-200 dark:border-accent-950 dark:bg-accent-950/20'
                              : 'text-slate-400 hover:text-slate-600'
                            }`}
                          title={isSaved ? "Remove Bookmark" : "Save Job"}
                        >
                          {isSaved ? <BookmarkCheck className="h-4.5 w-4.5" /> : <Bookmark className="h-4.5 w-4.5" />}
                        </button>
                      </div>

                      {/* Pill Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {formatWorkMode(job.workMode)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {formatJobType(job.jobType)}
                        </span>
                        {!job.hideSalary && (job.salaryMin || job.salaryMax) && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                            {job.salaryMin ? `₹${job.salaryMin >= 100000 ? `${(job.salaryMin / 100000).toFixed(1).replace('.0', '')}L` : `${(job.salaryMin / 1000).toFixed(0)}k/mo`}` : ''}
                            {job.salaryMin && job.salaryMax ? ' - ' : ''}
                            {job.salaryMax ? `₹${job.salaryMax >= 100000 ? `${(job.salaryMax / 100000).toFixed(1).replace('.0', '')}L` : `${(job.salaryMax / 1000).toFixed(0)}k/mo`}` : ''}
                          </span>
                        )}
                        {job.isUrgent && (
                          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                            Urgent
                          </span>
                        )}
                      </div>

                      {/* Brief description text */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-2.5 leading-relaxed">
                        {job.description.replace(/[#*_-]/g, '')}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/60 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Apply Now &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );

}
export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsPageContent />
    </Suspense>
  );
}

