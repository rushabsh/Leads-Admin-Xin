'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface AddEditCampaignModalProps {
  showAddEditModal: boolean;
  setShowAddEditModal: (val: boolean) => void;
  editingCampaign: any;
  formData: any;
  setFormData: (val: any) => void;
  massTorts: any[];
  vendors: any[];
  lawFirms: any[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddEditCampaignModal({
  showAddEditModal,
  setShowAddEditModal,
  editingCampaign,
  formData,
  setFormData,
  massTorts,
  vendors,
  lawFirms,
  isSubmitting,
  onSubmit
}: AddEditCampaignModalProps) {
  if (!showAddEditModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-850 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-850">
          <h3 className="text-lg font-bold">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h3>
          <button
            onClick={() => setShowAddEditModal(false)}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Campaign Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Camp Lejeune Facebook Ads"
              className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Details about acquisition method, targets, etc..."
              className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Media Budget</label>
              <input
                type="number"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                placeholder="10000"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mass Tort Area</label>
              <select
                required
                value={formData.massTortId}
                onChange={(e) => setFormData({ ...formData, massTortId: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              >
                <option value="" disabled>
                  Select Mass Tort
                </option>
                {massTorts.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lead Vendor</label>
              <select
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              >
                <option value="">Direct Integration / Internal</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t pt-3 border-slate-100 dark:border-slate-850">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Law Firm (Optional)
              </label>
              <select
                value={formData.lawFirmId}
                onChange={(e) => setFormData({ ...formData, lawFirmId: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              >
                <option value="">No Direct Preferred Firm</option>
                {lawFirms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Marketing Source
              </label>
              <select
                value={formData.marketingSource}
                onChange={(e) => setFormData({ ...formData, marketingSource: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              >
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="Google Search">Google Search</option>
                <option value="TV Commercial">TV Commercial</option>
                <option value="Radio Broadcast">Radio Broadcast</option>
                <option value="Affiliate Network">Affiliate Network</option>
                <option value="Custom Landing Page">Custom Landing Page</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t pt-3 border-slate-100 dark:border-slate-850">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Cost per Lead ($)
              </label>
              <input
                type="number"
                value={formData.costPerLeadTarget}
                onChange={(e) => setFormData({ ...formData, costPerLeadTarget: parseFloat(e.target.value) || 0 })}
                placeholder="50"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Expected Ingestion Volume (leads)
              </label>
              <input
                type="number"
                value={formData.expectedLeadTarget}
                onChange={(e) => setFormData({ ...formData, expectedLeadTarget: parseInt(e.target.value) || 0 })}
                placeholder="200"
                className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-955"
              />
            </div>
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
              {isSubmitting ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
