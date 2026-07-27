'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Users, Mail, Phone, ArrowUpDown, ChevronLeft, ChevronRight, Trash2, Eye } from 'lucide-react';

interface VendorPortalLeadsTableProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  paginatedLeads: any[];
  sortedLeads: any[];
  page: number;
  setPage: (val: number | ((p: number) => number)) => void;
  totalPages: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onRequestSort: (field: any) => void;
  isLoading: boolean;
  onDeleteLead?: (leadId: string) => void;
  onDeleteMultipleLeads?: (leadIds: string[]) => void;
}

export default function VendorPortalLeadsTable({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  paginatedLeads,
  sortedLeads,
  page,
  setPage,
  totalPages,
  itemsPerPage,
  sortField,
  sortDirection,
  onRequestSort,
  isLoading,
  onDeleteLead,
  onDeleteMultipleLeads
}: VendorPortalLeadsTableProps) {
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
    } else if (onDeleteLead) {
      if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected lead(s)?`)) return;
      selectedLeadIds.forEach((id) => onDeleteLead(id));
    }
    setSelectedLeadIds([]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden">
      {/* Filters Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-850 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 focus:text-slate-900" />
          <input
            type="text"
            placeholder="Search by ID, name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:text-slate-500 focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="SIGNED_RETAINER">Signed Retainer</option>
            <option value="REJECTED">Rejected</option>
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

      {/* Table Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : paginatedLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Users className="h-12 w-12 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-lg font-semibold">No leads submitted</h3>
          <p className="mt-1 text-sm text-slate-500">
            Submit a lead using the button above or route them to our API endpoint.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
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
                <th
                  onClick={() => onRequestSort('leadId')}
                  className="cursor-pointer p-4 font-semibold hover:text-primary transition-all select-none"
                >
                  Case Number <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                </th>
                <th
                  onClick={() => onRequestSort('firstName')}
                  className="cursor-pointer p-4 font-semibold hover:text-primary transition-all select-none"
                >
                  Full Name <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                </th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">State</th>
                <th className="p-4 font-semibold">Campaign</th>
                <th className="p-4 font-semibold">Status</th>
                <th
                  onClick={() => onRequestSort('createdAt')}
                  className="cursor-pointer p-4 font-semibold hover:text-primary transition-all select-none"
                >
                  Date Sent <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                </th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {paginatedLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className={`transition-all duration-150 ${isSelected
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
                    <td className="p-4 font-bold text-primary">
                      <Link
                        href={`/vendor-portal/leads/${lead.id}`}
                        className="hover:underline hover:text-primary/80 transition-colors"
                      >
                        {lead.leadId}
                      </Link>
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      <Link
                        href={`/vendor-portal/leads/${lead.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {lead.firstName} {lead.lastName}
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{lead.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{lead.state}</td>
                    <td className="p-4 text-xs text-slate-500">{lead.campaignName || 'General Campaign'}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${['QUALIFIED', 'SIGNED_RETAINER'].includes(lead.status)
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : lead.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-indigo-500/10 text-indigo-500'
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${['QUALIFIED', 'SIGNED_RETAINER'].includes(lead.status)
                            ? 'bg-emerald-500'
                            : lead.status === 'REJECTED'
                              ? 'bg-rose-500'
                              : 'bg-indigo-500'
                            }`}
                        />
                        {lead.status === 'SIGNED_RETAINER' ? 'RETAINED' : lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/vendor-portal/leads/${lead.id}`}
                          title="View Lead Details"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => onDeleteLead && onDeleteLead(lead.id)}
                          title="Delete Lead"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800 transition-colors"
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
      {sortedLeads.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 p-5 dark:border-slate-855">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, sortedLeads.length)} of{' '}
            {sortedLeads.length} leads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-550 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-850 dark:hover:bg-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-550 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-850 dark:hover:bg-slate-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
