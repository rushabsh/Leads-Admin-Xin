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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold text-slate-900">{stats.totalLeads}</h3>
          <span className="text-[10px] text-slate-500 block mt-1">Leads ingested</span>
        </div>
      </div>

      {/* Card 2 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qualified Leads</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold text-slate-900">{stats.qualifiedLeads}</h3>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="h-3 w-3" /> {stats.conversionRate}% conversion
          </span>
        </div>
      </div>

      {/* Card 3 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disqualified Leads</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
            <UserX className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold text-slate-900">{stats.disqualifiedLeads}</h3>
          <span className="text-[10px] text-rose-500 block mt-1">Rejected claims</span>
        </div>
      </div>
    </div>
  );
}
