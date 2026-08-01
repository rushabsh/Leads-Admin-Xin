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
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Timeline:</span>
        {(['today', 'week', 'month', 'year', 'custom'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setDateRange(mode)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              dateRange === mode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
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
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
          />
        </div>
      )}
    </div>
  );
}
