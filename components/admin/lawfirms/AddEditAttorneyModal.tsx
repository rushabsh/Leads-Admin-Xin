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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="text-base font-bold text-slate-900">{editingAttorney ? 'Edit Attorney' : 'Add Firm Attorney'}</h3>
          <button onClick={() => setShowAttorneyModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Attorney Name</label>
            <input
              type="text"
              required
              value={attorneyFormData.name}
              onChange={(e) => setAttorneyFormData({ ...attorneyFormData, name: e.target.value })}
              placeholder="e.g. John Morgan Jr."
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address (Login Username)</label>
            <input
              type="email"
              required
              value={attorneyFormData.email}
              onChange={(e) => setAttorneyFormData({ ...attorneyFormData, email: e.target.value })}
              placeholder="e.g. john.morgan@morganlaw.com"
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</label>
              <input
                type="text"
                value={attorneyFormData.phone}
                onChange={(e) => setAttorneyFormData({ ...attorneyFormData, phone: e.target.value })}
                placeholder="e.g. (800) 555-0191"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Login ID / Username</label>
              <input
                type="text"
                required
                value={attorneyFormData.username}
                onChange={(e) => setAttorneyFormData({ ...attorneyFormData, username: e.target.value })}
                placeholder="e.g. jmorgan"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Security Notice</span>
            <p className="text-slate-600 text-xs leading-relaxed">
              Attorneys will be registered as secure workspace logins with default password: <span className="font-mono font-bold text-slate-900">Password123!</span>. They can update their password on their first login.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAttorneyModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? 'Saving...' : editingAttorney ? 'Update Attorney' : 'Add Attorney'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
