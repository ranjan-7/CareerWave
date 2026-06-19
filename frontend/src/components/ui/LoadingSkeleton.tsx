import React from 'react';

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 animate-pulse">
      <div className="flex gap-4 items-start">
        {/* Logo mock */}
        <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="flex-grow space-y-2">
          {/* Title mock */}
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          {/* Company mock */}
          <div className="h-3.5 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
          {/* Tags */}
          <div className="flex gap-2 pt-2">
            <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        {/* Info tags */}
        <div className="h-3.5 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
        {/* Date */}
        <div className="h-3.5 w-1/6 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="space-y-4 w-full">
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 h-28" />
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 h-96" />
    </div>
  );
}
