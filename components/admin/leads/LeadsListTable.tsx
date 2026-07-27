'use client';

import React, { useState } from 'react';
import {
  Search, Users, Mail, Phone, Eye, Trash2,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface LeadsListTableProps {
  campaigns: any[];
  vendors: any[];
  uniqueStates: string[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  stateFilter: string;
  setStateFilter: (val: string) => void;
  campaignFilter: string;
  setCampaignFilter: (val: string) => void;
  vendorFilter: string;
  setVendorFilter: (val: string) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  itemsPerPage: number;
  filteredLeadsCount: number;
  paginatedLeads: any[];
  onViewLeadProfile: (lead: any) => void;
  onDeleteLead: (leadId: string) => void;
  onDeleteMultipleLeads?: (leadIds: string[]) => void;
}

export default function LeadsListTable({
  campaigns,
  vendors,
  uniqueStates,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  stateFilter,
  setStateFilter,
  campaignFilter,
  setCampaignFilter,
  vendorFilter,
  setVendorFilter,
  page,
  setPage,
  totalPages,
  itemsPerPage,
  filteredLeadsCount,
  paginatedLeads,
  onViewLeadProfile,
  onDeleteLead,
  onDeleteMultipleLeads
}: LeadsListTableProps) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  const isAllPageSelected =
    paginatedLeads.length > 0 &&
    paginatedLeads.every((lead) => selectedLeadIds.includes(lead.id));

  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageIds = new Set(paginatedLeads.map((l) => l.id));
      setSelectedLeadIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newSelected = new Set([...selectedLeadIds, ...paginatedLeads.map((l) => l.id)]);
      setSelectedLeadIds(Array.from(newSelected));
    }
  };

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    if (onDeleteMultipleLeads) {
      onDeleteMultipleLeads(selectedLeadIds);
    } else {
      if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected lead(s)?`)) return;
      selectedLeadIds.forEach((id) => onDeleteLead(id));
    }
    setSelectedLeadIds([]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      {/* Multi Filters Header */}
      <div className="grid gap-3 p-5 border-b border-slate-100 dark:border-slate-850 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <div className="relative col-span-2">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name, email, phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-250 bg-slate-50/50 py-2 pr-4 pl-10 text-xs outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-primary"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="REJECTED">Disqualified</option>
            <option value="SIGNED_RETAINER">Retained</option>
          </select>
        </div>

        <div>
          <select
            value={campaignFilter}
            onChange={(e) => {
              setCampaignFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={vendorFilter}
            onChange={(e) => {
              setVendorFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="">All States</option>
            {uniqueStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedLeadIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-rose-500/10 border-b border-rose-500/20 px-5 py-3 dark:bg-rose-950/30 text-xs font-semibold text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-rose-600 px-2.5 py-0.5 text-2xs text-white font-bold">
              {selectedLeadIds.length}
            </span>
            <span>lead{selectedLeadIds.length > 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLeadIds([])}
              className="rounded-xl px-3 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-all text-xs font-semibold"
            >
              Deselect All
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-all active:scale-[0.98]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected ({selectedLeadIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Ingestion Table */}
      {paginatedLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Users className="h-12 w-12 text-slate-350 dark:text-slate-700" />
          <h3 className="mt-4 text-sm font-bold">No leads in pipeline</h3>
          <p className="mt-1 text-xs text-slate-550">
            Wait for API ingestion or manually upload CSV records.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-850 dark:bg-slate-950/20">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={toggleSelectAllPage}
                    title={isAllPageSelected ? 'Deselect Page' : 'Select All Page'}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-semibold">Lead ID</th>
                <th className="p-4 font-semibold">Client Name</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Campaign</th>
                <th className="p-4 font-semibold">Vendor</th>
                <th className="p-4 font-semibold">Intake Agent</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold">Date Received</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {paginatedLeads.map((lead: any) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className={`transition-all duration-150 ${
                      isSelected
                        ? 'bg-rose-500/5 dark:bg-rose-950/20'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
                    }`}
                  >
                    <td className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                    <button
                      onClick={() => onViewLeadProfile(lead)}
                      className="text-primary hover:underline text-left"
                    >
                      {lead.leadId}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {lead.dob ? `DOB: ${lead.dob}` : 'No DOB'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" /> {lead.email}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-slate-400" /> {lead.phone}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-indigo-500">
                    {lead.campaign?.name || 'General Inbound'}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-355">
                    {lead.vendor?.name || 'Direct API'}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-355">
                    {lead.intakeAgent?.name || 'Unassigned'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-semibold ${lead.status === 'NEW'
                          ? 'bg-primary/10 text-primary'
                          : lead.status === 'QUALIFIED' || lead.status === 'SIGNED_RETAINER'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : lead.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-amber-500/10 text-amber-500'
                        }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-3xs font-semibold ${lead.priority === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                    >
                      {lead.priority}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onViewLeadProfile(lead)}
                        title="Open Profile"
                        className="rounded-lg p-1 text-slate-450 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        title="Delete"
                        className="rounded-lg p-1 text-slate-450 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredLeadsCount > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 p-5 dark:border-slate-850">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * itemsPerPage + 1} to{' '}
            {Math.min(page * itemsPerPage, filteredLeadsCount)} of {filteredLeadsCount} leads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-850 dark:hover:bg-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-850 dark:hover:bg-slate-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
