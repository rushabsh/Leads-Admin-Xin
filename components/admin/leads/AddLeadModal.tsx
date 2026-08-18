'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, Megaphone, Sparkles, Filter, ShieldAlert } from 'lucide-react';
import NewCaseLeadFollowUpForm from '@/components/vendor-portal/leads/NewCaseLeadFollowUpForm';

interface AddLeadModalProps {
  showAddModal: boolean;
  setShowAddModal: (val: boolean) => void;
  campaigns: any[];
  vendors: any[];
  formData?: any;
  setFormData?: (val: any) => void;
  activeFormTab?: 'personal' | 'case';
  setActiveFormTab?: (val: 'personal' | 'case') => void;
  onCreateLead?: (e: React.FormEvent) => void;
  onSuccess?: () => void;
}

export default function AddLeadModal({
  showAddModal,
  setShowAddModal,
  campaigns = [],
  vendors = [],
  onSuccess
}: AddLeadModalProps) {
  // Target Vendor & Campaign Selection State
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  // Auto-initialize selected vendor on mount / modal open
  useEffect(() => {
    if (showAddModal && vendors.length > 0 && !selectedVendorId) {
      setSelectedVendorId(vendors[0].id);
    }
  }, [showAddModal, vendors, selectedVendorId]);

  // Find active vendor object
  const selectedVendor = useMemo(() => {
    return vendors.find((v) => v.id === selectedVendorId) || vendors[0] || null;
  }, [vendors, selectedVendorId]);

  // Filter campaigns assigned to selected vendor
  const assignedCampaigns = useMemo(() => {
    if (!selectedVendorId && !selectedVendor) return campaigns;
    return campaigns.filter(
      (c) =>
        c.vendorId === selectedVendorId ||
        c.vendorId === selectedVendor?.id ||
        (c.vendorName && selectedVendor?.name && c.vendorName.toLowerCase() === selectedVendor.name.toLowerCase()) ||
        (c.vendors && Array.isArray(c.vendors) && c.vendors.includes(selectedVendorId))
    );
  }, [campaigns, selectedVendorId, selectedVendor]);

  // Update selected campaign whenever assigned campaigns change
  useEffect(() => {
    if (assignedCampaigns.length > 0) {
      const exists = assignedCampaigns.some((c) => c.id === selectedCampaignId);
      if (!exists) {
        setSelectedCampaignId(assignedCampaigns[0].id);
      }
    } else {
      setSelectedCampaignId('');
    }
  }, [assignedCampaigns, selectedCampaignId]);

  // Handle Vendor Selection Change
  const handleVendorChange = (newVendorId: string) => {
    setSelectedVendorId(newVendorId);
    const vendorObj = vendors.find((v) => v.id === newVendorId);
    const filtered = campaigns.filter(
      (c) =>
        c.vendorId === newVendorId ||
        (c.vendorName && vendorObj?.name && c.vendorName.toLowerCase() === vendorObj.name.toLowerCase())
    );
    if (filtered.length > 0) {
      setSelectedCampaignId(filtered[0].id);
    } else {
      setSelectedCampaignId('');
    }
  };

  if (!showAddModal) return null;

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || assignedCampaigns[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-5xl my-auto overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Lead Ingestion Form</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select target vendor and campaign allocation first, then fill in complete lead case details.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Target Vendor & Campaign Selector Bar */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-850 dark:to-slate-900 dark:border-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Step 1: Select Target Vendor & Assigned Campaign
              </span>
            </div>
            {selectedVendor && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Building2 className="h-3 w-3" />
                Active Vendor: {selectedVendor.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Dropdown */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                Select Vendor Provider <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => handleVendorChange(e.target.value)}
                className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {vendors.length === 0 ? (
                  <option value="">No Vendors Found</option>
                ) : (
                  vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.email ? `(${v.email})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Campaign Dropdown (Filtered by selected Vendor) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Megaphone className="h-3.5 w-3.5 text-indigo-600" />
                Assigned Campaign <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                disabled={assignedCampaigns.length === 0}
                className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {assignedCampaigns.length === 0 ? (
                  <option value="">No Campaigns Assigned to this Vendor</option>
                ) : (
                  assignedCampaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.tortName ? `[${c.tortName}]` : ''}
                    </option>
                  ))
                )}
              </select>
              {assignedCampaigns.length === 0 && (
                <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                  <ShieldAlert className="h-3 w-3" />
                  No campaigns currently linked to {selectedVendor?.name || 'this vendor'}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Embedded Full Vendor Portal Lead Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/40">
          <NewCaseLeadFollowUpForm
            isModal={true}
            title="Step 2: Enter Lead Prospect & Case Details"
            subtitle={`Configured for ${selectedVendor?.name || 'Selected Vendor'} | Campaign: ${selectedCampaign?.name || 'Default Campaign'}`}
            vendorId={selectedVendorId}
            vendorName={selectedVendor?.name}
            initialValues={{
              campaignName: selectedCampaign?.name || ''
            }}
            showCsvOption={true}
            onCancel={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              if (onSuccess) onSuccess();
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
