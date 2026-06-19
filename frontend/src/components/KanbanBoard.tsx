'use client';

import React from 'react';
import { 
  User, 
  MapPin, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  FileText 
} from 'lucide-react';

export interface Candidate {
  id: string;
  status: string;
  appliedAt: string;
  rating: number | null;
  resumeUrl: string;
  coverLetter: string | null;
  seeker: {
    fullName: string;
    headline: string | null;
    location: string | null;
    skills: string;
  };
}

interface KanbanBoardProps {
  candidates: Candidate[];
  onMoveStage: (id: string, newStage: string) => void;
  onOpenDetails: (candidate: Candidate) => void;
}

const STAGES = [
  { id: 'APPLIED', label: 'New / Applied', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' },
  { id: 'REVIEWED', label: 'Reviewed', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50' },
  { id: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50' },
  { id: 'INTERVIEW', label: 'Interviewing', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' },
  { id: 'OFFER', label: 'Offer Sent', color: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/50' },
  { id: 'HIRED', label: 'Hired 🎉', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' },
  { id: 'REJECTED', label: 'Rejected', color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50' },
];

export default function KanbanBoard({
  candidates,
  onMoveStage,
  onOpenDetails,
}: KanbanBoardProps) {
  
  // Group candidates by stage
  const candidatesByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = candidates.filter((c) => c.status === stage.id);
    return acc;
  }, {} as Record<string, Candidate[]>);

  // Helper to shift stage
  const shiftStage = (candidate: Candidate, direction: 'forward' | 'backward') => {
    const currentIndex = STAGES.findIndex((s) => s.id === candidate.status);
    if (direction === 'forward' && currentIndex < STAGES.length - 1) {
      onMoveStage(candidate.id, STAGES[currentIndex + 1].id);
    } else if (direction === 'backward' && currentIndex > 0) {
      onMoveStage(candidate.id, STAGES[currentIndex - 1].id);
    }
  };

  const renderStars = (rating: number | null) => {
    const score = rating || 0;
    return (
      <div className="flex items-center gap-0.5 mt-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < score 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
      {STAGES.map((stage) => {
        const list = candidatesByStage[stage.id] || [];
        const isFirst = STAGES.findIndex(s => s.id === stage.id) === 0;
        const isLast = STAGES.findIndex(s => s.id === stage.id) === STAGES.length - 1;

        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 rounded-2xl bg-slate-100/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 p-4 flex flex-col max-h-[75vh]"
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stage.color}`}>
                {stage.label}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {list.length}
              </span>
            </div>

            {/* Stage Cards List */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-1">
              {list.length === 0 ? (
                <div className="h-24 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                  Empty stage
                </div>
              ) : (
                list.map((c) => (
                  <div
                    key={c.id}
                    className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow dark:border-slate-800 dark:bg-slate-900 relative transition-all"
                  >
                    {/* Candidate Name & Info */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {c.seeker.fullName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-1">
                          {c.seeker.headline || 'Job Seeker'}
                        </p>
                      </div>
                      
                      {/* View details button */}
                      <button
                        onClick={() => onOpenDetails(c)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        title="View Application Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800/50 text-[11px] text-slate-500">
                      {c.seeker.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {c.seeker.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" /> 
                        <a 
                          href={c.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline text-primary-600 dark:text-primary-400 font-medium"
                        >
                          Resume Snapshot
                        </a>
                      </span>
                    </div>

                    {/* Ratings */}
                    <div className="mt-2 flex items-center justify-between">
                      {renderStars(c.rating)}
                      
                      {/* Stage shifters */}
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          disabled={isFirst}
                          onClick={() => shiftStage(c, 'backward')}
                          className="rounded p-0.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Backwards"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={isLast}
                          onClick={() => shiftStage(c, 'forward')}
                          className="rounded p-0.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Forwards"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
