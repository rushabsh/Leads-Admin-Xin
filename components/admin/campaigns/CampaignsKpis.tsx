'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Activity, Percent } from 'lucide-react';

interface CampaignsKpisProps {
  totalBudget: number;
  activeCampaignsCount: number;
  totalCampaignsCount: number;
  avgConversion: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80 } }
};

export default function CampaignsKpis({
  totalBudget,
  activeCampaignsCount,
  totalCampaignsCount,
  avgConversion
}: CampaignsKpisProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Media Budget</span>
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">${totalBudget.toLocaleString()}</h3>
          <p className="mt-1 text-xs text-slate-500">Allocated media spend</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Campaigns</span>
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{activeCampaignsCount} / {totalCampaignsCount}</h3>
          <p className="mt-1 text-xs text-slate-500">Currently generating leads</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Conv. Rate</span>
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <Percent className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{avgConversion}%</h3>
          <p className="mt-1 text-xs text-slate-500">Qualified retainer conversions</p>
        </div>
      </motion.div>
    </div>
  );
}
