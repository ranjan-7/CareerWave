'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import KanbanBoard, { Candidate } from '@/components/KanbanBoard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { 
  Building, 
  MapPin, 
  Star, 
  FileText, 
  MessageSquare, 
  Briefcase, 
  Award,
  ChevronLeft,
  Settings,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface ApplicantsPageProps {
  params: {
    id: string;
  };
}

export default function JobApplicantsPage({ params }: ApplicantsPageProps) {
  const jobId = params.id;
  
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [jobInfo, setJobInfo] = useState<any | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [fetching, setFetching] = useState(true);

  // Modal Detail States
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [ratingVal, setRatingVal] = useState('0');
  const [stageVal, setStageVal] = useState('APPLIED');
  const [savingDetails, setSavingDetails] = useState(false);

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

  const fetchData = async () => {
    setFetching(true);
    try {
      // 1. Fetch Job Info
      const jobRes = await apiFetch(`/api/jobs/${jobId}`);
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJobInfo(jobData.job);
      }

      // 2. Fetch Applicants
      const appRes = await apiFetch(`/api/applications?jobId=${jobId}`);
      if (appRes.ok) {
        const appData = await appRes.json();
        setCandidates(appData.applications);
      }
    } catch (err) {
      console.error(err);
      toast('Failed to load recruitment data', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Handle kanban drag/click stage transition
  const handleMoveStage = async (applicationId: string, newStage: string) => {
    try {
      const res = await apiFetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStage }),
      });

      if (res.ok) {
        // Update local candidates state
        setCandidates((prev) =>
          prev.map((c) => (c.id === applicationId ? { ...c, status: newStage } : c))
        );
        toast(`Candidate stage updated to: ${newStage.toLowerCase()}`, 'success');
      } else {
        toast('Failed to update stage', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Details Modal
  const handleOpenDetails = (candidate: Candidate) => {
    // We need to fetch full application info (including notes, rating details)
    fetchApplicationDetails(candidate.id);
  };

  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      const res = await apiFetch(`/api/applications/${applicationId}`);
      if (res.ok) {
        const data = await res.json();
        const fullApp = data.application;
        
        // Match mock candidate layout
        const matchedCandidate: Candidate = {
          id: fullApp.id,
          status: fullApp.status,
          appliedAt: fullApp.appliedAt,
          rating: fullApp.rating,
          resumeUrl: fullApp.resumeUrl,
          coverLetter: fullApp.coverLetter,
          seeker: {
            fullName: fullApp.seeker.fullName,
            headline: fullApp.seeker.headline,
            location: fullApp.seeker.location,
            skills: fullApp.seeker.skills,
            // Attach experience/education arrays parsed from profiles
            experience: JSON.parse(fullApp.seeker.experience || '[]'),
            education: JSON.parse(fullApp.seeker.education || '[]'),
            bio: fullApp.seeker.bio,
            linkedinUrl: fullApp.seeker.linkedinUrl,
            githubUrl: fullApp.seeker.githubUrl,
            portfolioUrl: fullApp.seeker.portfolioUrl,
            user: fullApp.seeker.user
          } as any
        };

        setSelectedCandidate(matchedCandidate);
        setNoteText(fullApp.internalNotes || '');
        setRatingVal(String(fullApp.rating || 0));
        setStageVal(fullApp.status);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      toast('Failed to load application details', 'error');
    }
  };

  // Save detailed review changes
  const handleSaveDetails = async () => {
    if (!selectedCandidate) return;
    setSavingDetails(true);

    try {
      const res = await apiFetch(`/api/applications/${selectedCandidate.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: stageVal,
          internalNotes: noteText,
          rating: ratingVal === '0' ? null : parseInt(ratingVal, 10),
        }),
      });

      setSavingDetails(false);

      if (res.ok) {
        toast('Applicant notes and scores updated successfully', 'success');
        setDetailModalOpen(false);
        // Refresh kanban board list
        fetchData();
      } else {
        toast('Failed to save details', 'error');
      }
    } catch (err) {
      console.error(err);
      setSavingDetails(false);
    }
  };

  const getEducationList = () => {
    const list = (selectedCandidate?.seeker as any)?.education || [];
    return list;
  };

  const getExperienceList = () => {
    const list = (selectedCandidate?.seeker as any)?.experience || [];
    return list;
  };

  if (loading || fetching) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[70vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6 flex-grow flex flex-col">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Link 
            href="/employer/dashboard" 
            className="rounded-lg p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500 hover:text-slate-700"
            title="Go back to Dashboard"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Applicants: {jobInfo?.title}
            </h1>
            <p className="text-xs text-slate-500">
              Manage hiring stages, score profiles, and exchange comments.
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Board
        </button>
      </div>

      {/* Kanban Board pipeline */}
      <div className="flex-grow">
        <KanbanBoard
          candidates={candidates}
          onMoveStage={handleMoveStage}
          onOpenDetails={handleOpenDetails}
        />
      </div>

      {/* Candidate Details dialog modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Review Candidate: ${selectedCandidate?.seeker.fullName}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDetails} isLoading={savingDetails}>
              Save Evaluation
            </Button>
          </div>
        }
      >
        {selectedCandidate && (
          <div className="space-y-6">
            {/* 1. Header Information */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-slate-50 p-4 rounded-xl dark:bg-slate-950/20">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  {selectedCandidate.seeker.fullName}
                </h3>
                <p className="text-xs font-semibold text-slate-500">{selectedCandidate.seeker.headline || 'Job Seeker'}</p>
                {selectedCandidate.seeker.location && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {selectedCandidate.seeker.location}</p>
                )}
                
                {/* Social links */}
                <div className="flex gap-2 pt-2 text-[10px]">
                  {(selectedCandidate.seeker as any).linkedinUrl && (
                    <a href={(selectedCandidate.seeker as any).linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      LinkedIn
                    </a>
                  )}
                  {(selectedCandidate.seeker as any).githubUrl && (
                    <a href={(selectedCandidate.seeker as any).githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      GitHub
                    </a>
                  )}
                  {(selectedCandidate.seeker as any).portfolioUrl && (
                    <a href={(selectedCandidate.seeker as any).portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      Portfolio
                    </a>
                  )}
                </div>
              </div>

              {/* Chat action button */}
              <div className="flex flex-col items-end gap-2">
                <Link
                  href={`/employer/messages?userId=${(selectedCandidate.seeker as any).user.id}`}
                  className="flex items-center gap-1 bg-primary-600 hover:bg-primary-500 text-white rounded-lg px-3.5 py-2 text-xs font-bold shadow-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Start Chat
                </Link>
                <a
                  href={selectedCandidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 bg-white"
                >
                  <FileText className="h-3.5 w-3.5 text-primary-500" /> View Resume
                </a>
              </div>
            </div>

            {/* 2. Review controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
              <Select
                label="Hiring Pipeline Stage"
                value={stageVal}
                onChange={(e) => setStageVal(e.target.value)}
                options={[
                  { label: 'Applied', value: 'APPLIED' },
                  { label: 'Reviewed', value: 'REVIEWED' },
                  { label: 'Shortlisted', value: 'SHORTLISTED' },
                  { label: 'Interview Scheduled', value: 'INTERVIEW' },
                  { label: 'Offer Sent', value: 'OFFER' },
                  { label: 'Hired 🎉', value: 'HIRED' },
                  { label: 'Rejected', value: 'REJECTED' },
                ]}
              />

              <Select
                label="Candidate Grade / Rating"
                value={ratingVal}
                onChange={(e) => setRatingVal(e.target.value)}
                options={[
                  { label: 'Unrated (0 Stars)', value: '0' },
                  { label: '1 Star (Weak Fit)', value: '1' },
                  { label: '2 Stars (Average)', value: '2' },
                  { label: '3 Stars (Good Fit)', value: '3' },
                  { label: '4 Stars (Excellent)', value: '4' },
                  { label: '5 Stars (Exceptional)', value: '5' },
                ]}
              />
            </div>

            {/* 3. Internal Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Internal Recruiter Notes
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write interview notes, evaluation summaries, or candidate feedback here..."
                className="block w-full min-h-[90px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* 4. Cover Letter */}
            {selectedCandidate.coverLetter && (
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Cover Letter / Note</h4>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 leading-relaxed whitespace-pre-wrap">
                  {selectedCandidate.coverLetter}
                </div>
              </div>
            )}

            {/* 5. Biography & Skills */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Profile Overview</h4>
              {(selectedCandidate.seeker as any).bio && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {(selectedCandidate.seeker as any).bio}
                </p>
              )}
              {selectedCandidate.seeker.skills && (
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.seeker.skills.split(',').map((s, i) => (
                    <span key={i} className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-600 dark:bg-slate-800 dark:text-primary-400">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Work Experience History */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-slate-400" /> Experience Timeline</h4>
              {getExperienceList().length === 0 ? (
                <p className="text-[10px] text-slate-400">No work history provided.</p>
              ) : (
                <div className="space-y-3">
                  {getExperienceList().map((exp: any, idx: number) => (
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

            {/* 7. Education History */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Award className="h-4 w-4 text-slate-400" /> Education History</h4>
              {getEducationList().length === 0 ? (
                <p className="text-[10px] text-slate-400">No education history provided.</p>
              ) : (
                <div className="space-y-3">
                  {getEducationList().map((edu: any, idx: number) => (
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
