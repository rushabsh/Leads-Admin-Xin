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
      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Legal Partners</span>
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{totalFirms}</h3>
          <p className="mt-1 text-xs text-slate-500">Registered law firms</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Retainers</span>
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{activeFirms}</h3>
          <p className="mt-1 text-xs text-slate-500">Active ingestion firms</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Attorneys</span>
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{totalAttorneys}</h3>
          <p className="mt-1 text-xs text-slate-500">Total attorney logins</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cases Under Council</span>
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
            <Scale className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{totalCases}</h3>
          <p className="mt-1 text-xs text-slate-500">Active litigations assigned</p>
        </div>
      </motion.div>
    </div>
  );
}
