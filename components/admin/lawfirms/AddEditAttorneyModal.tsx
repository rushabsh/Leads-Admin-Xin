'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface AddEditAttorneyModalProps {
  showAttorneyModal: boolean;
  setShowAttorneyModal: (val: boolean) => void;
  editingAttorney: any;
  attorneyFormData: any;
  setAttorneyFormData: (val: any) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddEditAttorneyModal({
  showAttorneyModal,
  setShowAttorneyModal,
  editingAttorney,
  attorneyFormData,
  setAttorneyFormData,
  isSubmitting,
  onSubmit
}: AddEditAttorneyModalProps) {
  if (!showAttorneyModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-850 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-850">
          <h3 className="text-lg font-bold">{editingAttorney ? 'Edit Attorney' : 'Add Firm Attorney'}</h3>
          <button onClick={() => setShowAttorneyModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Attorney Name</label>
            <input
              type="text"
              required
              value={attorneyFormData.name}
              onChange={(e) => setAttorneyFormData({ ...attorneyFormData, name: e.target.value })}
              placeholder="e.g. John Morgan Jr."
              className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-955"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address (Login Username)</label>
            <input
              type="email"
              required
              value={attorneyFormData.email}
              onChange={(e) => setAttorneyFormData({ ...attorneyFormData, email: e.target.value })}
              placeholder="e.g. john.morgan@morganlaw.com"
              className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-955"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</label>
              <input
                type="text"
                value={attorneyFormData.phone}
                onChange={(e) => setAttorneyFormData({ ...attorneyFormData, phone: e.target.value })}
                placeholder="e.g. (800) 555-0191"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-955"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Login ID / Username</label>
              <input
                type="text"
                required
                value={attorneyFormData.username}
                onChange={(e) => setAttorneyFormData({ ...attorneyFormData, username: e.target.value })}
                placeholder="e.g. jmorgan"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-955"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Security Notice</span>
            <p className="text-slate-500 text-3xs leading-relaxed">
              Attorneys will be registered as secure workspace logins with the default password: <span className="font-mono font-bold text-slate-700 dark:text-slate-350">Password123!</span>. They can update their password on their first login.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => setShowAttorneyModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingAttorney ? 'Update Attorney' : 'Add Attorney'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
