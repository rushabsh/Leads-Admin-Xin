'use client';

import React from 'react';
import { Users, UserCheck, UserX, CreditCard, Banknote, ArrowUpRight } from 'lucide-react';

interface VendorStatsKpisProps {
  stats: {
    totalLeads: number;
    qualifiedLeads: number;
    disqualifiedLeads: number;
    conversionRate: number;
    totalInvoiced: number;
    paymentsCollected: number;
  };
  formatCurrency: (val: number) => string;
}

export default function VendorStatsKpis({ stats, formatCurrency }: VendorStatsKpisProps) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
      {/* Card 1 */}
      <div className="glass-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Leads</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold">{stats.totalLeads}</h3>
          <span className="text-[10px] text-slate-550 block mt-1">Leads ingested</span>
        </div>
      </div>

      {/* Card 2 */}
      <div className="glass-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Qualified Leads</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold">{stats.qualifiedLeads}</h3>
          <span className="text-[10px] text-success font-semibold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="h-3 w-3" /> {stats.conversionRate}% conversion
          </span>
        </div>
      </div>

      {/* Card 3 */}
      <div className="glass-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Disqualified Leads</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger">
            <UserX className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold">{stats.disqualifiedLeads}</h3>
          <span className="text-[10px] text-rose-500 block mt-1">Rejected claims</span>
        </div>
      </div>

      {/* Card 4 */}
      <div className="glass-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Invoiced Amount</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold">{formatCurrency(stats.totalInvoiced || stats.totalLeads * 150)}</h3>
          <span className="text-[10px] text-slate-550 block mt-1">Cumulative billing</span>
        </div>
      </div>

      {/* Card 5 */}
      <div className="glass-card p-5 flex flex-col justify-between sm:col-span-2">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Payments Collected</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Banknote className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold text-emerald-555">{formatCurrency(stats.paymentsCollected || stats.qualifiedLeads * 150)}</h3>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">Successfully cleared & paid</span>
        </div>
      </div>
    </div>
  );
}
