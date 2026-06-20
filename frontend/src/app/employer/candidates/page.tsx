'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Search, MapPin, Briefcase, Award, MessageSquare, FileText, User } from 'lucide-react';

export default function CandidateSearchPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [candidates, setCandidates] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  
  // Search parameters
  const [skillQuery, setSkillQuery] = useState('');
  const [locQuery, setLocQuery] = useState('');
  
  // Details Modal
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const fetchCandidates = async () => {
    setFetching(true);
    try {
      // Direct call to fetch seekers. We mock this list since it's a prototype,
      // or rather fetch via an endpoint or a direct API.
      // Wait, let's create a custom route or fetch from `/api/seeker/profile` but wait:
      // We can fetch from `/api/jobs` or check if there is a `/api/admin/users` or let's create a `/api/employer/candidates` route!
      // Yes! That is extremely clean.
      // Let's create `/api/employer/candidates` route to retrieve candidates in SQLite whose visibility is PUBLIC or EMPLOYERS_ONLY!
      // I will write this API endpoint next, but let's build the frontend first.
      const queryParams = new URLSearchParams();
      if (skillQuery) queryParams.set('skills', skillQuery);
      if (locQuery) queryParams.set('location', locQuery);

      const res = await fetch(`/api/employer/candidates?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates);
      }
    } catch (err) {
      console.error(err);
      toast('Failed to load candidate directory', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCandidates();
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleClear = () => {
    setSkillQuery('');
    setLocQuery('');
    // Trigger fetch
    setTimeout(() => {
      fetchCandidates();
    }, 50);
  };

  const handleOpenDetails = (candidate: any) => {
    // Parse JSON lists safely
    const exp = typeof candidate.experience === 'string' ? JSON.parse(candidate.experience || '[]') : candidate.experience || [];
    const edu = typeof candidate.education === 'string' ? JSON.parse(candidate.education || '[]') : candidate.education || [];
    setSelectedCandidate({
      ...candidate,
      experienceList: exp,
      educationList: edu,
    });
    setModalOpen(true);
  };

  const [activePlan, setActivePlan] = useState('free');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plan = localStorage.getItem('employer_plan') || 'free';
      setActivePlan(plan);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[70vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (activePlan === 'free') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 w-full flex-grow flex flex-col items-center justify-center">
        <div className="w-full text-center rounded-3xl border border-slate-200 bg-white p-10 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-md space-y-6 max-w-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent-500/10 blur-2xl pointer-events-none" />
          
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-slate-800 dark:text-primary-400">
            <Search className="h-8 w-8" />
          </div>
          
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Talent Search is Locked</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Searching our candidate resume database by skills and location is a feature exclusive to employers on our <span className="font-semibold text-primary-500">Growth</span> or <span className="font-semibold text-accent-500">Enterprise</span> membership plans.
          </p>

          <div className="border-t border-slate-100 pt-6 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/employer/dashboard')} className="text-xs">
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push('/employer/plans')} className="text-xs bg-gradient-to-r from-primary-600 to-accent-500 text-white border-0">
              Upgrade Subscription Plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[70vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6 flex-grow flex flex-col">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Talent Database Search</h1>
        <p className="text-xs text-slate-500 mt-0.5">Explore active candidates matching criteria who are open to work.</p>
      </div>

      {/* Search filters form */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 items-end">
        <Input
          label="Search by Skills (e.g. React, Python)"
          value={skillQuery}
          onChange={(e) => setSkillQuery(e.target.value)}
          placeholder="Skill keyword..."
        />
        <Input
          label="Filter by Location"
          value={locQuery}
          onChange={(e) => setLocQuery(e.target.value)}
          placeholder="e.g. Austin, Remote"
        />
        <div className="flex gap-2">
          <Button type="submit" className="flex-grow py-2.5">
            Search Talent
          </Button>
          <Button type="button" variant="outline" onClick={handleClear} className="py-2.5">
            Clear
          </Button>
        </div>
      </form>

      {/* Candidate list cards */}
      {candidates.length === 0 ? (
        <div className="py-16 text-center text-slate-500 border border-dashed border-slate-200 rounded-2xl dark:border-slate-800">
          <User className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No candidates found</h4>
          <p className="text-xs max-w-xs mx-auto mt-1 leading-relaxed">
            Try adjusting your search criteria or looking up other skills/locations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => (
            <div 
              key={cand.id} 
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold dark:bg-slate-800 dark:text-slate-400">
                    {cand.fullName[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary-600">
                      {cand.fullName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold line-clamp-1 mt-0.5">
                      {cand.headline || 'Professional Professional'}
                    </p>
                  </div>
                </div>

                {cand.location && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-0.5 mt-3">
                    <MapPin className="h-3 w-3" /> {cand.location}
                  </p>
                )}

                {cand.skills && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {cand.skills.split(',').slice(0, 4).map((s: string, i: number) => (
                      <span key={i} className="rounded bg-primary-50 px-2 py-0.5 text-[9px] font-semibold text-primary-600 dark:bg-slate-800 dark:text-primary-400">
                        {s.trim()}
                      </span>
                    ))}
                    {cand.skills.split(',').length > 4 && (
                      <span className="text-[9px] text-slate-400 self-center">+{cand.skills.split(',').length - 4} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                {cand.openToWork ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                    Open To Work
                  </span>
                ) : <span />}
                
                <button
                  onClick={() => handleOpenDetails(cand)}
                  className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  View Profile &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Candidate Profile: ${selectedCandidate?.fullName}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Close
            </Button>
            {selectedCandidate && (
              <Link
                href={`/employer/messages?userId=${selectedCandidate.user.id}`}
                className="flex items-center gap-1 bg-primary-600 hover:bg-primary-500 text-white rounded-lg px-4 py-2 text-xs font-bold shadow-sm"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Message Candidate
              </Link>
            )}
          </div>
        }
      >
        {selectedCandidate && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl dark:bg-slate-950/20 space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedCandidate.fullName}</h3>
              <p className="text-xs font-semibold text-slate-500">{selectedCandidate.headline || 'Professional'}</p>
              {selectedCandidate.location && (
                <p className="text-[11px] text-slate-400 flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {selectedCandidate.location}</p>
              )}
              {selectedCandidate.resumeUrl && (
                <div className="pt-2">
                  <a
                    href={selectedCandidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    <FileText className="h-4 w-4" /> Download Resume Document
                  </a>
                </div>
              )}
            </div>

            {selectedCandidate.bio && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Summary</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{selectedCandidate.bio}</p>
              </div>
            )}

            {selectedCandidate.skills && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Core Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.skills.split(',').map((s: string, i: number) => (
                    <span key={i} className="rounded bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600 dark:bg-slate-800 dark:text-primary-400">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-slate-400" /> Work History</h4>
              {selectedCandidate.experienceList.length === 0 ? (
                <p className="text-[10px] text-slate-400">No work history provided.</p>
              ) : (
                <div className="space-y-3">
                  {selectedCandidate.experienceList.map((exp: any, idx: number) => (
                    <div key={idx} className="text-xs border-l-2 border-slate-200 pl-3 py-1 space-y-0.5">
                      <h5 className="font-bold text-slate-900 dark:text-white">{exp.title}</h5>
                      <p className="text-[11px] text-slate-500 font-semibold">{exp.company} &bull; {exp.location}</p>
                      <p className="text-[10px] text-slate-400">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                      {exp.description && (
                        <p className="text-slate-500 leading-relaxed mt-1 text-[11px]">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Award className="h-4 w-4 text-slate-400" /> Education History</h4>
              {selectedCandidate.educationList.length === 0 ? (
                <p className="text-[10px] text-slate-400">No education history provided.</p>
              ) : (
                <div className="space-y-3">
                  {selectedCandidate.educationList.map((edu: any, idx: number) => (
                    <div key={idx} className="text-xs border-l-2 border-slate-200 pl-3 py-1 space-y-0.5">
                      <h5 className="font-bold text-slate-900 dark:text-white">{edu.school}</h5>
                      <p className="text-[11px] text-slate-500 font-semibold">{edu.degree} in {edu.fieldOfStudy}</p>
                      <p className="text-[10px] text-slate-400">{edu.startDate} - {edu.endDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
