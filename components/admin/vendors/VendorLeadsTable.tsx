'use client';

import React from 'react';
import { Search, Users, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface VendorLeadsTableProps {
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
  campaigns: any[];
  uniqueStates: string[];
  paginatedLeads: any[];
  filteredLeadsCount: number;
  page: number;
  setPage: (val: number | ((p: number) => number)) => void;
  totalPages: number;
  itemsPerPage: number;
  onOpenLead: (id: string) => void;
}

export default function VendorLeadsTable({
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
  campaigns,
  uniqueStates,
  paginatedLeads,
  filteredLeadsCount,
  page,
  setPage,
  totalPages,
  itemsPerPage,
  onOpenLead
}: VendorLeadsTableProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
        <div className="relative col-span-1 lg:col-span-2">
          <Search className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200/80 bg-white py-1.5 pr-4 pl-9 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950 dark:focus:border-primary"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
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
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
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
            className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
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

      {/* Table */}
      {filteredLeadsCount === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <Users className="h-10 w-10 text-slate-350 dark:text-slate-700" />
          <h3 className="mt-2 text-xs font-bold text-slate-655">No leads found</h3>
          <p className="text-[10px] text-slate-500">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-855 rounded-xl">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-555 dark:border-slate-850 dark:bg-slate-950/20">
                <th className="p-3.5 font-semibold">Lead ID</th>
                <th className="p-3.5 font-semibold">Client Name</th>
                <th className="p-3.5 font-semibold">Contact Info</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Campaign</th>
                <th className="p-3.5 font-semibold">State</th>
                <th className="p-3.5 font-semibold">Priority</th>
                <th className="p-3.5 font-semibold">Date Received</th>
                <th className="p-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150"
                >
                  <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                    <button onClick={() => onOpenLead(lead.id)} className="text-primary hover:underline text-left">
                      {lead.leadId}
                    </button>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="p-3.5 text-slate-555 dark:text-slate-400">
                    <div>{lead.email}</div>
                    <div>{lead.phone}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-3xs font-bold uppercase ${
                        lead.status === 'NEW'
                          ? 'bg-primary/10 text-primary border border-primary/10'
                          : lead.status === 'QUALIFIED'
                            ? 'bg-success/15 text-success border border-success/10'
                            : lead.status === 'SIGNED_RETAINER'
                              ? 'bg-warning/15 text-warning border border-warning/10'
                              : lead.status === 'REJECTED'
                                ? 'bg-rose-500/15 text-rose-500 border border-rose-500/10'
                                : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {lead.status === 'REJECTED' ? 'Disqualified' : lead.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-indigo-500">
                    {lead.campaign?.name || lead.campaignName || 'General Inbound'}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{lead.state}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-3xs font-semibold ${
                        lead.priority === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {lead.priority}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onOpenLead(lead.id)}
                      className="rounded-lg p-1 text-slate-450 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      title="Open Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredLeadsCount > itemsPerPage && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xs text-slate-450">
            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredLeadsCount)} of{' '}
            {filteredLeadsCount} leads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
