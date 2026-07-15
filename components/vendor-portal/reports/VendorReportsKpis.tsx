'use client';

import React from 'react';
import { Users, Award, DollarSign, Activity, TrendingUp } from 'lucide-react';

interface VendorReportsKpisProps {
  totalLeads: number;
  qualifiedLeads: number;
  paidRevenue: number;
  conversionRate: number;
}

export default function VendorReportsKpis({
  totalLeads,
  qualifiedLeads,
  paidRevenue,
  conversionRate
}: VendorReportsKpisProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Sent Leads */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Sent Leads</span>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{totalLeads}</h3>
          <p className="mt-1 flex items-center text-xs text-slate-400">
            <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
            <span>Sent in date range</span>
          </p>
        </div>
      </div>

      {/* Qualified Leads */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Qualified Leads</span>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{qualifiedLeads}</h3>
          <p className="mt-1 flex items-center text-xs text-slate-400">
            <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
            <span>Approved conversion rate: {conversionRate}%</span>
          </p>
        </div>
      </div>

      {/* Paid Revenue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Earned Revenue</span>
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">${paidRevenue.toLocaleString()}</h3>
          <p className="mt-1 flex items-center text-xs text-slate-400">
            <TrendingUp className="h-3 w-3 text-indigo-500 mr-1" />
            <span>Cleared invoice payout</span>
          </p>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Conversion Quality</span>
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{conversionRate}%</h3>
          <p className="mt-1 flex items-center text-xs text-slate-400">
            <span>Overall lead approval ratio</span>
          </p>
        </div>
      </div>
    </div>
  );
}
