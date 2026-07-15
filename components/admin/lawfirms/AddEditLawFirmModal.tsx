'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface AddEditLawFirmModalProps {
  showAddEditModal: boolean;
  setShowAddEditModal: (val: boolean) => void;
  editingLawFirm: any;
  formData: any;
  setFormData: (val: any) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddEditLawFirmModal({
  showAddEditModal,
  setShowAddEditModal,
  editingLawFirm,
  formData,
  setFormData,
  isSubmitting,
  onSubmit
}: AddEditLawFirmModalProps) {
  if (!showAddEditModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-850 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-850">
          <h3 className="text-lg font-bold">{editingLawFirm ? 'Edit Law Firm' : 'Add New Law Firm'}</h3>
          <button onClick={() => setShowAddEditModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Firm Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Morgan & Morgan"
              className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-955"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. contacts@morganlaw.com"
              className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-955"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(800) 555-0199"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-955"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 100 Legal Way, New York, NY"
              className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-955"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => setShowAddEditModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingLawFirm ? 'Update Firm' : 'Add Firm'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
