'use client';

import React from 'react';
import { Users, Award, DollarSign, Activity, TrendingUp, ShieldCheck, XCircle } from 'lucide-react';

interface VendorReportsKpisProps {
  totalLeads: number;
  qualifiedLeads: number;
  paidRevenue: number;
  conversionRate: number;
  tcpaPassRate: number;
  rejectionRate: number;
}

export default function VendorReportsKpis({
  totalLeads,
  qualifiedLeads,
  paidRevenue,
  conversionRate,
  tcpaPassRate,
  rejectionRate
}: VendorReportsKpisProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* Sent Leads */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Sent Leads</span>
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{totalLeads}</h3>
          <p className="mt-1 flex items-center text-[11px] text-slate-400">
            <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
            <span>Total ingested volume</span>
          </p>
        </div>
      </div>

      {/* Qualified Leads */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Qualified Leads</span>
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{qualifiedLeads}</h3>
          <p className="mt-1 flex items-center text-[11px] text-slate-400">
            <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
            <span>Retained / Approved</span>
          </p>
        </div>
      </div>

      {/* TCPA Compliance Pass Rate */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">TCPA Compliance</span>
          <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{tcpaPassRate}%</h3>
          <p className="mt-1 flex items-center text-[11px] text-slate-400">
            <span>Verified consent rate</span>
          </p>
        </div>
      </div>

      {/* Rejection Rate */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Rejection Rate</span>
          <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
            <XCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{rejectionRate}%</h3>
          <p className="mt-1 flex items-center text-[11px] text-slate-400">
            <span>Disqualified / Duplicate</span>
          </p>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Conversion Quality</span>
          <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{conversionRate}%</h3>
          <p className="mt-1 flex items-center text-[11px] text-slate-400">
            <span>Submitted to Retainer %</span>
          </p>
        </div>
      </div>

      {/* Paid Revenue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Earned Revenue</span>
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">${paidRevenue.toLocaleString()}</h3>
          <p className="mt-1 flex items-center text-[11px] text-slate-400">
            <TrendingUp className="h-3 w-3 text-indigo-500 mr-1" />
            <span>Cleared payout</span>
          </p>
        </div>
      </div>
    </div>
  );
}

