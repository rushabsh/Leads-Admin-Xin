'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Check, ChevronDown, Search, Users } from 'lucide-react';

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
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const vendorDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target as Node)) {
        setIsVendorDropdownOpen(false);
      }
    }
    if (isVendorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVendorDropdownOpen]);

  // Derived selected vendor IDs
  const selectedVendorIds: string[] = useMemo(() => {
    if (Array.isArray(formData.vendorIds)) return formData.vendorIds;
    if (formData.vendorId) return [formData.vendorId];
    return [];
  }, [formData.vendorIds, formData.vendorId]);

  // Filter vendors by search
  const filteredVendors = useMemo(() => {
    if (!vendorSearchTerm.trim()) return vendors;
    const term = vendorSearchTerm.toLowerCase();
    return vendors.filter((v) => v.name?.toLowerCase().includes(term));
  }, [vendors, vendorSearchTerm]);

  const handleToggleVendor = (id: string) => {
    const isSelected = selectedVendorIds.includes(id);
    if (isSelected) {
      alert('You cannot deassign the vendor from the campaign. (Because if the vendor has added leads inside it then all leads/data will be lost).');
      return;
    }

    const confirmAssign = window.confirm('Are you sure to assign a vendor?');
    if (!confirmAssign) {
      return;
    }

    const newIds = [...selectedVendorIds, id];
    setFormData({
      ...formData,
      vendorIds: newIds,
      vendorId: newIds[0] || ''
    });
  };

  const handleSelectAllVendors = () => {
    const unselected = vendors.filter((v) => !selectedVendorIds.includes(v.id));
    if (unselected.length === 0) return;

    const confirmAssign = window.confirm('Are you sure to assign a vendor?');
    if (!confirmAssign) return;

    const allIds = vendors.map((v) => v.id);
    setFormData({
      ...formData,
      vendorIds: allIds,
      vendorId: allIds[0] || ''
    });
  };

  const handleClearAllVendors = () => {
    if (selectedVendorIds.length > 0) {
      alert('You cannot deassign the vendor from the campaign. (Because if the vendor has added leads inside it then all leads/data will be lost).');
      return;
    }
    setFormData({
      ...formData,
      vendorIds: [],
      vendorId: ''
    });
  };

  if (!showAddEditModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="text-base font-bold text-slate-900">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h3>
          <button
            onClick={() => setShowAddEditModal(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Campaign Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Camp Lejeune Facebook Ads"
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Details about acquisition method, targets, etc..."
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Media Budget</label>
              <input
                type="number"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                placeholder="10000"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mass Tort Area</label>
              <select
                required
                value={formData.massTortId}
                onChange={(e) => setFormData({ ...formData, massTortId: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
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
            <div className="relative" ref={vendorDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Lead Vendors ({selectedVendorIds.length})
                </label>
                {selectedVendorIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllVendors}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsVendorDropdownOpen(!isVendorDropdownOpen)}
                className="mt-1 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-900 outline-none transition-all hover:border-slate-300 focus:border-blue-600 shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {selectedVendorIds.length === 0
                      ? 'All Vendors (Multi-Vendor Shared)'
                      : selectedVendorIds.length === 1
                      ? vendors.find((v) => v.id === selectedVendorIds[0])?.name || '1 Vendor Selected'
                      : `${selectedVendorIds.length} Vendors Selected`}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isVendorDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Popover */}
              {isVendorDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {/* Search and Action Header */}
                  <div className="border-b border-slate-100 p-2 bg-slate-50">
                    <div className="relative mb-1.5">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={vendorSearchTerm}
                        onChange={(e) => setVendorSearchTerm(e.target.value)}
                        placeholder="Search vendors..."
                        className="w-full rounded-lg border border-slate-200 bg-white py-1 pl-8 pr-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                      <button
                        type="button"
                        onClick={handleSelectAllVendors}
                        className="font-medium text-blue-600 hover:underline cursor-pointer"
                      >
                        Select All ({vendors.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllVendors}
                        className="font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        All / Open (None)
                      </button>
                    </div>
                  </div>

                  {/* Vendor Checkbox List */}
                  <div className="max-h-36 overflow-y-auto p-1 divide-y divide-slate-50">
                    {filteredVendors.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">No vendors found</div>
                    ) : (
                      filteredVendors.map((v) => {
                        const isSelected = selectedVendorIds.includes(v.id);
                        return (
                          <div
                            key={v.id}
                            onClick={() => handleToggleVendor(v.id)}
                            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                              <span className="text-xs text-slate-800 truncate font-medium">{v.name}</span>
                            </div>
                            {v.status && (
                              <span className="text-[10px] uppercase font-semibold text-slate-400 shrink-0 ml-1">
                                {v.status}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Selected Chips */}
              {selectedVendorIds.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                  {selectedVendorIds.map((id) => {
                    const vendor = vendors.find((v) => v.id === id);
                    if (!vendor) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 text-[11px] font-medium text-blue-700"
                      >
                        <span className="max-w-[100px] truncate">{vendor.name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleVendor(id)}
                          className="text-blue-400 hover:text-blue-700 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t pt-3 border-slate-100">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Law Firm (Optional)
              </label>
              <select
                value={formData.lawFirmId}
                onChange={(e) => setFormData({ ...formData, lawFirmId: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Marketing Source
              </label>
              <select
                value={formData.marketingSource}
                onChange={(e) => setFormData({ ...formData, marketingSource: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t pt-3 border-slate-100">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Cost per Lead ($)
              </label>
              <input
                type="number"
                value={formData.costPerLeadTarget}
                onChange={(e) => setFormData({ ...formData, costPerLeadTarget: parseFloat(e.target.value) || 0 })}
                placeholder="50"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Expected Ingestion Volume (leads)
              </label>
              <input
                type="number"
                value={formData.expectedLeadTarget}
                onChange={(e) => setFormData({ ...formData, expectedLeadTarget: parseInt(e.target.value) || 0 })}
                placeholder="200"
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddEditModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
