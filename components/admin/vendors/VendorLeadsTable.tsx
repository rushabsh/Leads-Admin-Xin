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
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
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
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pr-4 pl-9 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
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
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
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
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
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
          <Users className="h-10 w-10 text-slate-300" />
          <h3 className="mt-2 text-xs font-bold text-slate-700">No leads found</h3>
          <p className="text-[10px] text-slate-500">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Lead ID</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Client Name</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Contact Info</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Campaign</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">State</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Priority</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Date Received</th>
                <th className="p-3.5 text-right font-semibold uppercase tracking-wider text-xs">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-3.5 font-mono font-bold text-blue-600">
                    <button onClick={() => onOpenLead(lead.id)} className="text-blue-600 hover:underline text-left">
                      {lead.leadId}
                    </button>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div>{lead.email}</div>
                    <div className="text-slate-400">{lead.phone}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        lead.status === 'NEW'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : lead.status === 'QUALIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : lead.status === 'SIGNED_RETAINER'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : lead.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {lead.status === 'REJECTED' ? 'Disqualified' : lead.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-blue-600">
                    {lead.campaign?.name || lead.campaignName || 'General Inbound'}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{lead.state}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                        lead.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {lead.priority}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onOpenLead(lead.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
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
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredLeadsCount)} of{' '}
            {filteredLeadsCount} leads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
