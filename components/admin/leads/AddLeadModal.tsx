'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface AddLeadModalProps {
  showAddModal: boolean;
  setShowAddModal: (val: boolean) => void;
  formData: any;
  setFormData: (val: any) => void;
  activeFormTab: 'personal' | 'case';
  setActiveFormTab: (val: 'personal' | 'case') => void;
  campaigns: any[];
  vendors: any[];
  onCreateLead: (e: React.FormEvent) => void;
}

export default function AddLeadModal({
  showAddModal,
  setShowAddModal,
  formData,
  setFormData,
  activeFormTab,
  setActiveFormTab,
  campaigns,
  vendors,
  onCreateLead
}: AddLeadModalProps) {
  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-850 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-850">
          <div>
            <h3 className="text-base font-bold">Add Ingestion Lead</h3>
            <p className="text-[10px] text-slate-400">
              Complete personal and case qualifiers to run auto-qualify validation.
            </p>
          </div>
          <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1 hover:bg-slate-50">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Tabs selection in form */}
        <div className="flex border-b border-slate-100 px-5 pt-2 dark:border-slate-850 gap-2">
          <button
            type="button"
            onClick={() => setActiveFormTab('personal')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeFormTab === 'personal'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-400'
            }`}
          >
            1. Personal Details
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('case')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeFormTab === 'case'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-400'
            }`}
          >
            2. Case Qualifiers
          </button>
        </div>

        <form onSubmit={onCreateLead} className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeFormTab === 'personal' ? (
            // FORM TAB 1: PERSONAL DETAILS
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="800-555-0199"
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    SSN (Confidential / Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ssn}
                    onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                    placeholder="e.g. 000-00-0000"
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Jurisdiction State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. CA"
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="100 Main St, City, State Zip"
                  className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>
          ) : (
            // FORM TAB 2: CASE QUALIFIERS
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Campaign Channel</label>
                  <select
                    required
                    value={formData.campaignId}
                    onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Vendor Provider</label>
                  <select
                    required
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Exposure Description / Date
                  </label>
                  <input
                    type="text"
                    value={formData.exposure}
                    onChange={(e) => setFormData({ ...formData, exposure: e.target.value })}
                    placeholder="e.g. Camp Lejeune water 1980-1982"
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Incident Date</label>
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Diagnosis Details</label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="e.g. Kidney cancer / Lymphoma"
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Symptoms</label>
                  <input
                    type="text"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    placeholder="e.g. Nausea, fatigue"
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Treating Hospital</label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    placeholder="e.g. Mercy Health Hospital"
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Litigation Attorney</label>
                  <input
                    type="text"
                    value={formData.attorney}
                    onChange={(e) => setFormData({ ...formData, attorney: e.target.value })}
                    placeholder="e.g. John Morgan Jr."
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Case Ingestion Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SIGNED_RETAINER">Retained</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Lead Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Case Details Notes</label>
                <textarea
                  rows={2}
                  value={formData.caseDetails}
                  onChange={(e) => setFormData({ ...formData, caseDetails: e.target.value })}
                  placeholder="Add exposure timestamps, diagnosis certificates details..."
                  className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800"
            >
              Cancel
            </button>
            {activeFormTab === 'personal' ? (
              <button
                type="button"
                onClick={() => setActiveFormTab('case')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/95"
              >
                Next: Case details
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600"
              >
                Save Lead
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
