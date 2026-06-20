'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  FileText, 
  Trash2, 
  UserMinus, 
  RefreshCw,
  TrendingUp,
  Sliders,
  Flag,
  FileSpreadsheet,
  Globe,
  Tag,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'stats' | 'moderation' | 'users' | 'taxonomy' | 'content' | 'billing'>('stats');

  // Core Data States
  const [stats, setStats] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Taxonomy States
  const [categories, setCategories] = useState(['Software Development', 'Finance & Accounting', 'Marketing & Sales', 'Human Resources', 'Customer Success', 'Product Management']);
  const [newCategory, setNewCategory] = useState('');
  const [skillTags, setSkillTags] = useState(['React', 'TypeScript', 'Node.js', 'Next.js', 'Python', 'SQL', 'Figma', 'AWS', 'Docker']);
  const [newSkill, setNewSkill] = useState('');

  // Homepage Content States
  const [bannerTitle, setBannerTitle] = useState('Find Your Next Career Move');
  const [bannerSubtitle, setBannerSubtitle] = useState('Discover thousands of job openings from world-class companies, or build your recruitment pipeline to find elite candidates in minutes.');
  const [featuredCompanies, setFeaturedCompanies] = useState(['Google', 'Stripe', 'Meta', 'Netflix', 'Airbnb']);
  const [newCompany, setNewCompany] = useState('');

  // Support / Reports State
  const [abuseReports, setAbuseReports] = useState([
    { id: '1', reporter: 'alex@gmail.com', listing: 'Fake React Job Listing', reason: 'Spam/Scam advertising', status: 'PENDING' },
    { id: '2', reporter: 'lisa@yahoo.com', listing: 'Unpaid Internship Overtime', reason: 'Labor policy violation', status: 'RESOLVED' }
  ]);

  // Redirect if not admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [user, loading]);

  const loadData = async () => {
    setFetching(true);
    try {
      // 1. Fetch Stats
      const statsRes = await apiFetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // 2. Fetch jobs
      const jobsRes = await apiFetch('/api/jobs');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        // Decorate jobs with a mock moderation state
        const decorated = jobsData.jobs.map((j: any, i: number) => ({
          ...j,
          moderationStatus: i % 4 === 0 ? 'PENDING' : 'ACTIVE'
        }));
        setJobsList(decorated);
      }

      // 3. Fetch users
      const usersRes = await apiFetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // Decorate users with a mock verified status
        const decorated = usersData.users.map((u: any, i: number) => ({
          ...u,
          status: i % 5 === 0 ? 'SUSPENDED' : 'ACTIVE',
          verified: u.role === 'EMPLOYER' ? (i % 2 === 0) : true
        }));
        setUsersList(decorated);
      }

    } catch (err) {
      console.error(err);
      toast('Failed to load admin dashboard data', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Job Actions
  const handleApproveJob = (jobId: string) => {
    setJobsList(prev => prev.map(j => j.id === jobId ? { ...j, moderationStatus: 'ACTIVE' } : j));
    toast('Job listing approved and posted live!', 'success');
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this job listing from the platform?')) {
      return;
    }
    try {
      const res = await apiFetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Job listing removed successfully', 'success');
        setJobsList(prev => prev.filter(j => j.id !== jobId));
      } else {
        toast('Failed to remove job listing', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User Actions
  const handleToggleSuspendUser = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    toast(`User status updated to ${nextStatus}`, 'success');
  };

  const handleVerifyUser = (userId: string) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
    toast('Employer account verified successfully!', 'success');
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast('You cannot delete your own admin account', 'warning');
      return;
    }
    if (!confirm('Are you sure you want to delete this user? This will remove all their profile data permanently.')) {
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        toast('User deleted successfully', 'success');
        setUsersList(prev => prev.filter(u => u.id !== userId));
      } else {
        toast('Failed to delete user', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Taxonomy Actions
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    setCategories(prev => [...prev, newCategory.trim()]);
    setNewCategory('');
    toast('Job Category added to taxonomy!', 'success');
  };

  const handleDeleteCategory = (cat: string) => {
    setCategories(prev => prev.filter(c => c !== cat));
    toast('Job Category deleted from taxonomy', 'info');
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setSkillTags(prev => [...prev, newSkill.trim()]);
    setNewSkill('');
    toast('Skill Tag added to taxonomy!', 'success');
  };

  const handleDeleteSkill = (skill: string) => {
    setSkillTags(prev => prev.filter(s => s !== skill));
    toast('Skill Tag deleted from taxonomy', 'info');
  };

  // Homepage Content Actions
  const handleSaveContent = () => {
    toast('Homepage banner text updated successfully!', 'success');
  };

  const handleAddFeaturedCompany = () => {
    if (!newCompany.trim()) return;
    setFeaturedCompanies(prev => [...prev, newCompany.trim()]);
    setNewCompany('');
    toast('Featured partner company added!', 'success');
  };

  const handleDeleteCompany = (comp: string) => {
    setFeaturedCompanies(prev => prev.filter(c => c !== comp));
    toast('Partner company removed', 'info');
  };

  // Abuse Report Actions
  const handleResolveReport = (id: string) => {
    setAbuseReports(prev => prev.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
    toast('Report marked as resolved', 'success');
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary-600" /> Admin Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global management portal for users, job listings, taxonomy, and subscriptions.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Portal
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'stats' ? 'bg-primary-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Overview Stats
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'moderation' ? 'bg-primary-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Listing Moderation ({jobsList.filter(j => j.moderationStatus === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'users' ? 'bg-primary-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('taxonomy')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'taxonomy' ? 'bg-primary-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Taxonomy Manager
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'content' ? 'bg-primary-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Content Manager
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'billing' ? 'bg-primary-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Billing & Reports
        </button>
      </div>

      {/* Tab Panels */}
      
      {/* 1. OVERVIEW STATS */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
                <h3 className="text-2xl font-extrabold mt-1 text-slate-950 dark:text-white">{stats.totalUsers}</h3>
                <p className="text-[10px] text-slate-400 mt-1">{stats.seekerCount} Seekers &bull; {stats.employerCount} Employers</p>
              </div>
              <span className="p-3 bg-slate-100 text-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-400">
                <Users className="h-5 w-5" />
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Listings</span>
                <h3 className="text-2xl font-extrabold mt-1 text-slate-950 dark:text-white">{stats.totalJobs}</h3>
                <p className="text-[10px] text-slate-400 mt-1">{stats.activeJobs} Active Roles</p>
              </div>
              <span className="p-3 bg-slate-100 text-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-400">
                <Briefcase className="h-5 w-5" />
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Applications</span>
                <h3 className="text-2xl font-extrabold mt-1 text-slate-950 dark:text-white">{stats.totalApplications}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Across all openings</p>
              </div>
              <span className="p-3 bg-slate-100 text-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-400">
                <FileText className="h-5 w-5" />
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fulfillment Rate</span>
                <h3 className="text-2xl font-extrabold mt-1 text-slate-950 dark:text-white">
                  {stats.totalApplications > 0 
                    ? `${((stats.applicationDistribution.find((d: any) => d.status === 'HIRED')?.count || 0) / stats.totalApplications * 100).toFixed(0)}%`
                    : '0%'
                  }
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Hires to applications ratio</p>
              </div>
              <span className="p-3 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-slate-800 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </span>
            </div>
          </div>

          {/* Distribution breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Application Pipeline Status Distribution</h3>
              <div className="space-y-3">
                {stats.applicationDistribution.map((dist: any) => (
                  <div key={dist.status} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{dist.status}</span>
                      <span>{dist.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(dist.count / stats.totalApplications * 100).toFixed(0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Listings by Work Mode</h3>
              <div className="space-y-3">
                {stats.workModeDistribution.map((dist: any) => (
                  <div key={dist.workMode} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{dist.workMode.replace('_', ' ')}</span>
                      <span>{dist.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full" style={{ width: `${(dist.count / stats.activeJobs * 100).toFixed(0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LISTING MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-fadeIn">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Listing Moderation Queue</h2>
          <p className="text-xs text-slate-400">Review newly posted or flagged listings. Approve them to display in search index or delete violation listings.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Job Details</th>
                  <th className="pb-3 px-4">Company</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobsList.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/40">
                    <td className="py-4 pr-4">
                      <div>
                        <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" className="font-bold text-slate-900 dark:text-white hover:text-primary-600 text-sm">
                          {job.title}
                        </a>
                        <p className="text-[10px] text-slate-400 mt-0.5">{job.location} &bull; {job.jobType.replace('_', ' ')}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-500">{job.employer.companyName}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        job.moderationStatus === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-400'
                      }`}>
                        {job.moderationStatus === 'PENDING' ? 'PENDING REVIEW' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {job.moderationStatus === 'PENDING' && (
                          <Button onClick={() => handleApproveJob(job.id)} className="text-[10px] py-1 px-3 bg-emerald-600 hover:bg-emerald-500 border-0 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Approve
                          </Button>
                        )}
                        <Button onClick={() => handleDeleteJob(job.id)} variant="outline" className="text-[10px] py-1 px-3 text-red-500 hover:bg-red-50 border-slate-200 flex items-center gap-1 dark:hover:bg-red-950/20">
                          <Trash2 className="h-3 w-3" /> Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-fadeIn">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registered User Directory</h2>
          <p className="text-xs text-slate-400">Search users, audit account statuses, suspend malicious accounts, and verify recruiters.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">User Details</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Recruiter Status</th>
                  <th className="pb-3 px-4">Account Status</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/40">
                    <td className="py-4 pr-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{usr.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">ID: {usr.id} &bull; Joined: {new Date(usr.createdAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        usr.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/40' 
                          : usr.role === 'EMPLOYER' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40' 
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {usr.role === 'EMPLOYER' ? (
                        usr.verified ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><CheckCircle className="h-3.5 w-3.5" /> Verified Brand</span>
                        ) : (
                          <button onClick={() => handleVerifyUser(usr.id)} className="text-[10px] font-bold text-primary-600 hover:underline flex items-center gap-0.5">
                            <UserCheck className="h-3.5 w-3.5" /> Verify Account
                          </button>
                        )
                      ) : (
                        <span className="text-slate-400 font-light">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        usr.status === 'SUSPENDED' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/40' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40'
                      }`}>
                        {usr.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      {usr.id !== user?.id && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleToggleSuspendUser(usr.id, usr.status)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:underline"
                          >
                            {usr.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAXONOMY MANAGER */}
      {activeTab === 'taxonomy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* Categories */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary-500" /> Job Category Taxonomy
            </h2>
            <p className="text-xs text-slate-400">Configure corporate categories mapped on search drop-downs.</p>
            
            <div className="flex gap-2">
              <Input
                placeholder="New Category (e.g. Sales)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAddCategory} className="text-xs py-2 px-4 self-end">
                Add Category
              </Button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[250px] overflow-y-auto pt-2">
              {categories.map((cat) => (
                <div key={cat} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{cat}</span>
                  <button onClick={() => handleDeleteCategory(cat)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Tags */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-accent-500" /> Vetted Skill Tags
            </h2>
            <p className="text-xs text-slate-400">Vetted skills matching recruiter listings to seeker profiles.</p>

            <div className="flex gap-2">
              <Input
                placeholder="New Skill Tag (e.g. Rust)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAddSkill} className="text-xs py-2 px-4 self-end bg-accent-500 hover:bg-accent-400">
                Add Tag
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              {skillTags.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-semibold">
                  {skill}
                  <button onClick={() => handleDeleteSkill(skill)} className="text-slate-400 hover:text-red-500">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 5. CONTENT MANAGER */}
      {activeTab === 'content' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary-500" /> Homepage Banner Content
            </h2>
            <p className="text-xs text-slate-400">Update promotional text blocks displayed on the landing page.</p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <Input
              label="Homepage Hero Title"
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              className="w-full"
            />
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Homepage Hero Description
              </label>
              <textarea
                value={bannerSubtitle}
                onChange={(e) => setBannerSubtitle(e.target.value)}
                className="block w-full min-h-[95px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <Button onClick={handleSaveContent} className="text-xs py-2 px-5">
              Update Hero Text
            </Button>
          </div>

          {/* Featured Partners */}
          <div className="border-t border-slate-100 pt-6 dark:border-slate-800 space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Partner Brand Index</h3>
            
            <div className="flex gap-2">
              <Input
                placeholder="Partner Brand Name"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAddFeaturedCompany} className="text-xs py-2 px-4 self-end">
                Add Partner
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {featuredCompanies.map((comp) => (
                <span key={comp} className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-300">
                  {comp}
                  <button onClick={() => handleDeleteCompany(comp)} className="text-slate-400 hover:text-red-500">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. BILLING & REPORTS */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* Abuse Reports Queue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" /> Active Abuse Reports
            </h2>
            <p className="text-xs text-slate-400">Review flagged listings reported by job seekers for scams or labor violations.</p>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3 pt-2">
              {abuseReports.map((report) => (
                <div key={report.id} className="py-3 flex justify-between items-start gap-4 first:pt-0">
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Flagged: "{report.listing}"</p>
                    <p className="text-[10px] text-slate-400">Reason: {report.reason}</p>
                    <p className="text-[9px] text-slate-500">Reporter: {report.reporter}</p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    {report.status === 'PENDING' ? (
                      <Button onClick={() => handleResolveReport(report.id)} className="text-[9px] py-1 px-2.5 bg-primary-600 hover:bg-primary-500 border-0">
                        Mark Resolved
                      </Button>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5"><CheckCircle className="h-3 w-3" /> Resolved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscriptions Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary-500" /> Subscriptions & Billing Audits
            </h2>
            <p className="text-xs text-slate-400">Monitor active payment distribution metrics.</p>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl dark:bg-slate-950/20 text-xs">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Growth Plan subscriptions</p>
                  <p className="text-[9px] text-slate-400">₹6,999 / month tier</p>
                </div>
                <p className="text-base font-extrabold text-slate-950 dark:text-white">12 active recruiters</p>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl dark:bg-slate-950/20 text-xs">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Enterprise Plan subscriptions</p>
                  <p className="text-[9px] text-slate-400">₹19,999 / month tier</p>
                </div>
                <p className="text-base font-extrabold text-slate-950 dark:text-white">5 active companies</p>
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Estimated Monthly Recurring Revenue (MRR)</span>
                <span className="text-base font-black text-emerald-600">₹1,83,983 / mo</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
