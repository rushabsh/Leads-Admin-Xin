'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FunnelItem {
  name: string;
  value: number;
}

interface ConversionFunnelProps {
  funnelData: FunnelItem[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

export default function ConversionFunnel({ funnelData }: ConversionFunnelProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="glass-panel p-6 col-span-1 md:col-span-2 flex flex-col justify-between"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          Conversion Pipeline Funnel
        </h2>
        <span className="text-xs text-slate-550">Lead Stages Overview</span>
      </div>
      <div className="space-y-4 py-4">
        {funnelData.map((item) => {
          const maxValue = funnelData[0]?.value || 0;
          const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                <span>
                  {item.value} ({Math.round(pct)}%)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
