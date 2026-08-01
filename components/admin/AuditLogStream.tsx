'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  userName: string;
}

interface AuditLogStreamProps {
  logs: AuditLog[];
  isLoadingLogs: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

export default function AuditLogStream({ logs, isLoadingLogs }: AuditLogStreamProps) {
  return (
    <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm col-span-1 lg:col-span-3">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Audit Log & Event Stream
        </h2>
      </div>
      <div className="relative border-l border-slate-200 ml-3.5 pl-5 space-y-4">
        {isLoadingLogs ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="relative animate-pulse">
              <span className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-200 shrink-0" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-1/3 bg-slate-200 rounded" />
                  <div className="h-2 w-16 bg-slate-200 rounded" />
                </div>
                <div className="h-2.5 w-2/3 bg-slate-200 rounded" />
                <div className="h-2 w-24 bg-slate-200 rounded" />
              </div>
            </div>
          ))
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">No security audits recorded.</p>
        ) : (
          logs.slice(0, 4).map((log) => (
            <div key={log.id} className="relative">
              <span className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600" />
              <div className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{log.details}</p>
                <span className="text-[10px] text-slate-500 block mt-0.5">By: {log.userName}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
