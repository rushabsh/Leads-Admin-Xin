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
      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Media Budget</span>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">${totalBudget.toLocaleString()}</h3>
          <p className="mt-1 text-xs text-slate-400">Allocated media spend</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Campaigns</span>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{activeCampaignsCount} / {totalCampaignsCount}</h3>
          <p className="mt-1 text-xs text-slate-400">Currently generating leads</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Conv. Rate</span>
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
            <Percent className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{avgConversion}%</h3>
          <p className="mt-1 text-xs text-slate-400">Qualified retainer conversions</p>
        </div>
      </motion.div>
    </div>
  );
}
