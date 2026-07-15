'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Activity, Users, Scale } from 'lucide-react';

interface LawFirmsKpisProps {
  totalFirms: number;
  activeFirms: number;
  totalAttorneys: number;
  totalCases: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80 } }
};

export default function LawFirmsKpis({
  totalFirms,
  activeFirms,
  totalAttorneys,
  totalCases
}: LawFirmsKpisProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Legal Partners</span>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{totalFirms}</h3>
          <p className="mt-1 text-xs text-slate-400">Registered law firms</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Retainers</span>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{activeFirms}</h3>
          <p className="mt-1 text-xs text-slate-400">Active ingestion firms</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Registered Attorneys</span>
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{totalAttorneys}</h3>
          <p className="mt-1 text-xs text-slate-400">Total attorney logins</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Cases Under Council</span>
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
            <Scale className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{totalCases}</h3>
          <p className="mt-1 text-xs text-slate-400">Active litigations assigned</p>
        </div>
      </motion.div>
    </div>
  );
}
