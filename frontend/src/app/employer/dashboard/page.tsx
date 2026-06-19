'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  Plus, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Edit, 
  Trash2, 
  ArrowRight,
  Eye,
  CheckCircle,
  FileText
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function EmployerDashboard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<any>({
    totalJobs: 0,
    activeJobsCount: 0,
    totalApplications: 0,
    jobs: [],
    funnel: []
  });
  const [fetching, setFetching] = useState(true);

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

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/employer/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
      toast('Failed to load recruitment dashboard', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job listing? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast('Job listing deleted successfully', 'success');
        // Filter out locally
        setAnalytics((prev: any) => ({
          ...prev,
          jobs: prev.jobs.filter((j: any) => j.id !== jobId),
          totalJobs: prev.totalJobs - 1,
        }));
      } else {
        toast('Failed to delete job listing', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'PAUSED':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8 flex-grow">
      
      {/* 1. Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hiring Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Recruiting workspace for {user?.profile?.companyName || 'Employer'}.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link 
            href="/employer/company"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm"
          >
            Company Profile
          </Link>
          <Link 
            href="/employer/post"
            className="flex items-center gap-1.5 rounded-lg bg-accent-500 hover:bg-accent-400 px-4 py-2 text-xs font-bold text-white shadow shadow-accent-500/15"
          >
            <Plus className="h-4 w-4" /> Post a Job
          </Link>
        </div>
      </div>

      {/* 2. Overview Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Listings</span>
            <h3 className="text-2xl font-extrabold mt-1 text-slate-950 dark:text-white">{analytics.totalJobs}</h3>
          </div>
          <span className="p-3 bg-slate-100 text-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-400">
            <Briefcase className="h-5 w-5" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Openings</span>
            <h3 className="text-2xl font-extrabold mt-1 text-slate-950 dark:text-white">{analytics.activeJobsCount}</h3>
          </div>
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-slate-800 dark:text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Applicants Volume</span>
            <h3 className="text-2xl font-extrabold mt-1 text-slate-950 dark:text-white">{analytics.totalApplications}</h3>
          </div>
          <span className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-slate-800 dark:text-blue-400">
            <Users className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* 3. Job Openings list table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
          Job Openings & Pipelines
        </h2>

        {analytics.jobs.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No jobs posted yet</h4>
            <p className="text-xs max-w-xs mx-auto mt-1 leading-relaxed">
              Create your first job post today to start receiving applications and tracking candidates.
            </p>
            <Link href="/employer/post" className="mt-4 inline-flex items-center gap-1 bg-primary-600 hover:bg-primary-500 text-white rounded-lg px-4 py-2 text-xs font-semibold">
              <Plus className="h-4 w-4" /> Post first job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Job Title</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Posted Date</th>
                  <th className="pb-3 px-4">Applicants</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {analytics.jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                        <Link href={`/jobs/${job.id}`} className="hover:text-primary-600">
                          {job.title}
                        </Link>
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        {job.isFeatured && (
                          <span className="rounded bg-accent-50 text-accent-600 px-1 py-0.5 text-[9px] font-bold">Featured</span>
                        )}
                        {job.isUrgent && (
                          <span className="rounded bg-red-50 text-red-600 px-1 py-0.5 text-[9px] font-bold">Urgent</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${getStatusBadge(job.status)}`}>
                        {job.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {job.applicantsCount > 0 ? (
                        <Link 
                          href={`/employer/jobs/${job.id}/applicants`}
                          className="flex items-center gap-1 text-primary-600 hover:underline"
                        >
                          <Users className="h-3.5 w-3.5" /> {job.applicantsCount} candidates
                        </Link>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 0</span>
                      )}
                    </td>

                    <td className="py-4 pl-4 text-right space-x-2">
                      <Link
                        href={`/employer/jobs/${job.id}/applicants`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="View Candidates"
                      >
                        ATS Board <ArrowRight className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
