'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, Megaphone, Sparkles, Filter, ShieldAlert } from 'lucide-react';
import NewCaseLeadFollowUpForm from '@/components/vendor-portal/leads/NewCaseLeadFollowUpForm';

import { useCRMStore } from '@/store/crmStore';

interface AddLeadModalProps {
  showAddModal: boolean;
  setShowAddModal: (val: boolean) => void;
  campaigns?: any[];
  vendors?: any[];
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
  const { campaigns: storeCampaigns, vendors: storeVendors, fetchCampaigns, fetchVendors } = useCRMStore();
  const allCampaigns = storeCampaigns && storeCampaigns.length > 0 ? storeCampaigns : campaigns;
  const allVendors = storeVendors && storeVendors.length > 0 ? storeVendors : vendors;

  // Target Vendor & Campaign Selection State
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  // Refresh campaigns and vendors whenever modal opens
  useEffect(() => {
    if (showAddModal) {
      fetchCampaigns(true);
      fetchVendors(true);
    }
  }, [showAddModal, fetchCampaigns, fetchVendors]);

  // Auto-initialize selected vendor on mount / modal open
  useEffect(() => {
    if (showAddModal && allVendors.length > 0 && !selectedVendorId) {
      setSelectedVendorId(allVendors[0].id);
    }
  }, [showAddModal, allVendors, selectedVendorId]);

  // Find active vendor object
  const selectedVendor = useMemo(() => {
    return allVendors.find((v) => v.id === selectedVendorId) || allVendors[0] || null;
  }, [allVendors, selectedVendorId]);

  // Filter campaigns assigned to selected vendor
  const assignedCampaigns = useMemo(() => {
    if (!selectedVendorId && !selectedVendor) return allCampaigns;
    const vId = selectedVendorId || selectedVendor?.id;
    const vName = selectedVendor?.name;
    return allCampaigns.filter((c: any) => {
      if (vId && (c.vendorId === vId || c.vendor?.id === vId)) return true;
      if (vName && c.vendorName && c.vendorName.toLowerCase() === vName.toLowerCase()) return true;
      if (vName && c.vendor?.name && c.vendor.name.toLowerCase() === vName.toLowerCase()) return true;
      if (vId && Array.isArray(c.vendorIds) && c.vendorIds.includes(vId)) return true;
      if (Array.isArray(c.vendors) && c.vendors.some((v: any) => {
        if (typeof v === 'string') return v === vId;
        return (v.id || v._id) === vId || (vName && v.name && v.name.toLowerCase() === vName.toLowerCase());
      })) return true;
      return false;
    });
  }, [allCampaigns, selectedVendorId, selectedVendor]);

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
    const vendorObj = allVendors.find((v) => v.id === newVendorId);
    const vName = vendorObj?.name;
    const filtered = allCampaigns.filter((c: any) => {
      if (newVendorId && (c.vendorId === newVendorId || c.vendor?.id === newVendorId)) return true;
      if (vName && c.vendorName && c.vendorName.toLowerCase() === vName.toLowerCase()) return true;
      if (vName && c.vendor?.name && c.vendor.name.toLowerCase() === vName.toLowerCase()) return true;
      if (newVendorId && Array.isArray(c.vendorIds) && c.vendorIds.includes(newVendorId)) return true;
      if (Array.isArray(c.vendors) && c.vendors.some((v: any) => {
        if (typeof v === 'string') return v === newVendorId;
        return (v.id || v._id) === newVendorId || (vName && v.name && v.name.toLowerCase() === vName.toLowerCase());
      })) return true;
      return false;
    });
    if (filtered.length > 0) {
      setSelectedCampaignId(filtered[0].id);
    } else {
      setSelectedCampaignId('');
    }
  };

  if (!showAddModal) return null;

  const selectedCampaign = allCampaigns.find((c) => c.id === selectedCampaignId) || assignedCampaigns[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-5xl my-auto overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Admin Lead Ingestion Form</h2>
              <p className="text-xs font-medium text-slate-500">
                Select target vendor and campaign allocation first, then fill in complete lead case details.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Target Vendor & Campaign Selector Bar */}
        <div className="p-5 border-b border-slate-200/80 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                <Filter className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Step 1: Select Target Vendor & Assigned Campaign
              </span>
            </div>
            {selectedVendor && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 px-3 py-1 text-[11px] font-bold text-blue-700 shadow-2xs">
                <Building2 className="h-3 w-3" />
                Active Vendor: {selectedVendor.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Dropdown */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                Select Vendor Provider <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => handleVendorChange(e.target.value)}
                className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all cursor-pointer"
              >
                {allVendors.length === 0 ? (
                  <option value="">No Vendors Found</option>
                ) : (
                  allVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.email ? `(${v.email})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Campaign Dropdown (Filtered by selected Vendor) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Megaphone className="h-3.5 w-3.5 text-indigo-600" />
                Assigned Campaign <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                disabled={assignedCampaigns.length === 0}
                className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-all cursor-pointer"
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
                <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1 mt-1">
                  <ShieldAlert className="h-3 w-3" />
                  No campaigns currently linked to {selectedVendor?.name || 'this vendor'}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Embedded Full Vendor Portal Lead Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <NewCaseLeadFollowUpForm
            key={`${selectedVendorId}_${selectedCampaignId}`}
            isModal={true}
            title="New Case: Lead Follow Up"
            subtitle={`Configured for ${selectedVendor?.name || 'Selected Vendor'} | Campaign: ${selectedCampaign?.name || 'Default Campaign'}`}
            vendorId={selectedVendorId}
            vendorName={selectedVendor?.name}
            initialValues={{
              campaignName: selectedCampaign?.name || '',
              type: selectedCampaign?.massTort?.name || selectedCampaign?.tortName || ''
            }}
            showCsvOption={false}
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
