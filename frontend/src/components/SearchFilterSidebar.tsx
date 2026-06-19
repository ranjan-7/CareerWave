'use client';

import React from 'react';
import { Search, MapPin, DollarSign, RefreshCw } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';

export interface FilterState {
  query: string;
  location: string;
  workMode: string;
  jobType: string;
  salaryMin: string;
}

interface SearchFilterSidebarProps {
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string) => void;
  onClear: () => void;
}

export default function SearchFilterSidebar({
  filters,
  onChange,
  onClear,
}: SearchFilterSidebarProps) {
  const workModeOptions = [
    { label: 'All Work Modes', value: '' },
    { label: 'Remote', value: 'REMOTE' },
    { label: 'Hybrid', value: 'HYBRID' },
    { label: 'On-site', value: 'ON_SITE' },
  ];

  const jobTypeOptions = [
    { label: 'All Job Types', value: '' },
    { label: 'Full-time', value: 'FULL_TIME' },
    { label: 'Part-time', value: 'PART_TIME' },
    { label: 'Contract', value: 'CONTRACT' },
    { label: 'Internship', value: 'INTERNSHIP' },
  ];

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sticky top-20">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <RefreshCw className="h-3 w-3" /> Reset
        </button>
      </div>

      <div className="space-y-4">
        {/* Keyword Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Keyword Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => onChange('query', e.target.value)}
              placeholder="Job title, skills, etc..."
              className="block w-full rounded-lg border pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Location Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => onChange('location', e.target.value)}
              placeholder="City, country, or remote..."
              className="block w-full rounded-lg border pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Work Mode */}
        <Select
          label="Work Mode"
          value={filters.workMode}
          onChange={(e) => onChange('workMode', e.target.value)}
          options={workModeOptions}
        />

        {/* Job Type */}
        <Select
          label="Job Type"
          value={filters.jobType}
          onChange={(e) => onChange('jobType', e.target.value)}
          options={jobTypeOptions}
        />

        {/* Minimum Salary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Minimum Annual Salary ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="number"
              value={filters.salaryMin}
              onChange={(e) => onChange('salaryMin', e.target.value)}
              placeholder="e.g. 80000"
              className="block w-full rounded-lg border pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
