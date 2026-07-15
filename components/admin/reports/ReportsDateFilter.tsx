'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface ReportsDateFilterProps {
  dateRange: 'today' | 'week' | 'month' | 'year' | 'custom';
  setDateRange: (mode: 'today' | 'week' | 'month' | 'year' | 'custom') => void;
  customStart: string;
  setCustomStart: (val: string) => void;
  customEnd: string;
  setCustomEnd: (val: string) => void;
}

export default function ReportsDateFilter({
  dateRange,
  setDateRange,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd
}: ReportsDateFilterProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-505 mr-2">Timeline:</span>
        {(['today', 'week', 'month', 'year', 'custom'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setDateRange(mode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              dateRange === mode
                ? 'bg-primary text-white'
                : 'bg-slate-50 text-slate-650 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {dateRange === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
      )}
    </div>
  );
}
