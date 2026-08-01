'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, DollarSign, Activity, TrendingUp } from 'lucide-react';

interface ReportsKpisProps {
  totalLeads: number;
  signedRetainers: number;
  conversionRate: number;
  revenue: number;
  lawFirmsCount: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80 } }
};

export default function ReportsKpis({
  totalLeads,
  signedRetainers,
  conversionRate,
  revenue,
  lawFirmsCount
}: ReportsKpisProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Leads Ingested</span>
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{totalLeads}</h3>
          <p className="mt-1 flex items-center text-xs text-slate-500">
            <TrendingUp className="h-3 w-3 text-emerald-600 mr-1" />
            <span>Pipeline entries in date range</span>
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Retainers Signed</span>
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{signedRetainers}</h3>
          <p className="mt-1 flex items-center text-xs text-slate-500">
            <TrendingUp className="h-3 w-3 text-emerald-600 mr-1" />
            <span>Conversion rate: {conversionRate}%</span>
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Case Settlements</span>
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">${revenue.toLocaleString()}</h3>
          <p className="mt-1 flex items-center text-xs text-slate-500">
            <TrendingUp className="h-3 w-3 text-indigo-600 mr-1" />
            <span>Aggregated settlement size</span>
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Distribution Partners</span>
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{lawFirmsCount} firms</h3>
          <p className="mt-1 flex items-center text-xs text-slate-500">
            <span>Receiving qualified intake leads</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
