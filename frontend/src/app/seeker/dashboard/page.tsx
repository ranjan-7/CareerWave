'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  Briefcase, 
  MapPin, 
  Bookmark, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

export default function SeekerDashboard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  // Redirect if not seeker
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'SEEKER') {
        router.push('/');
      }
    }
  }, [user, loading]);

  const fetchData = async () => {
    if (!user) return;
    setFetchingData(true);
    try {
      // 1. Fetch applications
      const appRes = await apiFetch('/api/applications');
      let apps = [];
      if (appRes.ok) {
        const appData = await appRes.json();
        apps = appData.applications;
        setApplications(apps);
      }

      // 2. Fetch saved jobs
      const saveRes = await apiFetch('/api/jobs/save');
      let bookmarks = [];
      if (saveRes.ok) {
        const saveData = await saveRes.json();
        bookmarks = saveData.savedJobs;
        setSavedJobs(bookmarks);
      }

      // 3. Fetch jobs for recommendation (matching skills)
      const jobsRes = await apiFetch('/api/jobs');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        const allJobs = jobsData.jobs;
        
        // Match skill tags
        const userSkills = user.profile?.skills
          ? user.profile.skills.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean)
          : [];

        if (userSkills.length > 0) {
          const matched = allJobs.filter((job: any) => {
            const jobSkills = job.skills.split(',').map((s: string) => s.trim().toLowerCase());
            // Check if any user skill matches job skills
            const hasMatch = jobSkills.some((s: string) => userSkills.includes(s));
            // Check if candidate already applied
            const alreadyApplied = apps.some((app: any) => app.jobId === job.id);
            return hasMatch && !alreadyApplied;
          });
          setRecommendedJobs(matched.slice(0, 3)); // show top 3 recommendations
        } else {
          // Fallback to latest featured jobs
          const fallback = allJobs
            .filter((j: any) => !apps.some((app: any) => app.jobId === j.id))
            .slice(0, 3);
          setRecommendedJobs(fallback);
        }
      }

    } catch (err) {
      console.error(err);
      toast('Failed to load dashboard data', 'error');
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUnsaveJob = async (jobId: string) => {
    try {
      const res = await apiFetch(`/api/jobs/save?jobId=${jobId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSavedJobs(prev => prev.filter(j => j.id !== jobId));
        toast('Job removed from saved bookmarks', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'HIRED':
        return { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400', label: 'Hired 🎉', icon: <CheckCircle2 className="h-4 w-4" /> };
      case 'REJECTED':
        return { bg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400', label: 'Rejected', icon: <XCircle className="h-4 w-4" /> };
      case 'OFFER':
        return { bg: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-400', label: 'Offer Received', icon: <Award className="h-4 w-4" /> };
      case 'INTERVIEW':
        return { bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400', label: 'Interview Scheduled', icon: <Clock className="h-4 w-4" /> };
      case 'SHORTLISTED':
        return { bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400', label: 'Shortlisted', icon: <Clock className="h-4 w-4" /> };
      case 'REVIEWED':
        return { bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400', label: 'Under Review', icon: <Clock className="h-4 w-4" /> };
      default:
        return { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400', label: 'Applied', icon: <Clock className="h-4 w-4" /> };
    }
  };

  if (loading || fetchingData) {
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
            Welcome back, {user?.profile?.fullName || 'Job Seeker'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track applications, update your profile, and discover recommended roles.
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/seeker/resume-builder"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm"
          >
            Build / Parse Resume
          </Link>
          <Link 
            href="/seeker/profile"
            className="rounded-lg bg-primary-600 hover:bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* 2. Overview Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Applied Positions</span>
            <h3 className="text-2xl font-extrabold mt-1 text-slate-950 dark:text-white">{applications.length}</h3>
          </div>
          <span className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-slate-800 dark:text-blue-400">
            <Briefcase className="h-5 w-5" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bookmarked Jobs</span>
            <h3 className="text-2xl font-extrabold mt-1 text-slate-950 dark:text-white">{savedJobs.length}</h3>
          </div>
          <span className="p-3 bg-accent-50 text-accent-500 rounded-lg dark:bg-slate-800 dark:text-accent-400">
            <Bookmark className="h-5 w-5" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Offers Received</span>
            <h3 className="text-2xl font-extrabold mt-1 text-slate-950 dark:text-white">
              {applications.filter(a => a.status === 'OFFER' || a.status === 'HIRED').length}
            </h3>
          </div>
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-slate-800 dark:text-emerald-400">
            <Award className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Application List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              Applications Tracker
            </h2>

            {applications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-sm">You haven't applied to any jobs yet.</p>
                <Link 
                  href="/jobs" 
                  className="mt-4 inline-flex rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-500"
                >
                  Browse open positions
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.map((app) => {
                  const statusInfo = getStatusStyle(app.status);
                  
                  return (
                    <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/jobs/${app.job.id}`}>
                            {app.job.title}
                          </Link>
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold">{app.job.employer.companyName}</p>
                        <p className="text-[10px] text-slate-400">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${statusInfo.bg}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                        
                        {/* Inbox Chat trigger if status is reviewed or further */}
                        {['REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED'].includes(app.status) && (
                          <Link
                            href={`/seeker/messages?userId=${app.job.employer.userId}`}
                            className="rounded-lg p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800"
                            title="Chat with Employer"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Saved jobs & Recommendations */}
        <div className="space-y-6">
          
          {/* Recommendations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              Recommended Roles
            </h2>

            {recommendedJobs.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Update your skills in profile to get matched jobs.
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedJobs.map((job) => (
                  <div key={job.id} className="group flex flex-col justify-between p-3 border border-slate-100 rounded-xl hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600">
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">{job.employer.companyName}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {job.location}</p>
                    </div>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="mt-3 flex items-center justify-end gap-0.5 text-[10px] font-bold text-primary-600 hover:underline dark:text-primary-400"
                    >
                      Apply Now <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Bookmarks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              Bookmarked Jobs
            </h2>

            {savedJobs.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No bookmarked jobs yet.
              </div>
            ) : (
              <div className="space-y-4">
                {savedJobs.map((job) => (
                  <div key={job.id} className="flex justify-between items-start gap-2 border-b border-slate-50 pb-3 last:border-b-0 last:pb-0 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-primary-600">
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </h4>
                      <p className="text-[10px] text-slate-500">{job.employer.companyName}</p>
                    </div>
                    <button
                      onClick={() => handleUnsaveJob(job.id)}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
