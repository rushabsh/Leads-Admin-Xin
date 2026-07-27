'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SubmitLeadModalProps {
  showSubmitModal: boolean;
  setShowSubmitModal: (val: boolean) => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  vendorCampaignsList: any[];
  onCampaignChange: (campId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export default function SubmitLeadModal({
  showSubmitModal,
  setShowSubmitModal,
  formData,
  setFormData,
  vendorCampaignsList,
  onCampaignChange,
  onSubmit,
  isSubmitting
}: SubmitLeadModalProps) {
  if (!showSubmitModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-850 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-850">
          <h3 className="text-lg font-bold">Submit New Lead Prospect</h3>
          <button
            onClick={() => setShowSubmitModal(false)}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@example.com"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="5551234567"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">State Code</label>
              <input
                type="text"
                maxLength={2}
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                placeholder="FL"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Associated Campaign</label>
              <select
                required
                value={formData.campaignId}
                onChange={(e) => onCampaignChange(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              >
                <option value="" disabled>Select Campaign</option>
                {vendorCampaignsList.map((camp) => (
                  <option key={camp.id} value={camp.id}>{camp.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Exposure details & Medical Notes</label>
            <textarea
              rows={3}
              value={formData.caseDetails}
              onChange={(e) => setFormData({ ...formData, caseDetails: e.target.value })}
              placeholder="Explain water contamination timeline, roundup pesticide usage, or cancer diagnosis details..."
              className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-55 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Prospect'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
