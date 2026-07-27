'use client';

import React from 'react';
import {
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Pause, Play,
  Edit2, Trash2, FolderKanban
} from 'lucide-react';

interface CampaignsListTableProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  isLoading: boolean;
  paginatedCampaigns: any[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  itemsPerPage: number;
  filteredCampaignsCount: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onRequestSort: (field: any) => void;
  onViewDetails: (camp: any) => void;
  onToggleStatus: (camp: any) => void;
  onOpenEditModal: (camp: any) => void;
  onDeleteCampaign: (id: string) => void;
}

export default function CampaignsListTable({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  isLoading,
  paginatedCampaigns,
  page,
  setPage,
  totalPages,
  itemsPerPage,
  filteredCampaignsCount,
  sortField,
  sortDirection,
  onRequestSort,
  onViewDetails,
  onToggleStatus,
  onOpenEditModal,
  onDeleteCampaign
}: CampaignsListTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      {/* Filters Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-850 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary dark:border-slate-800 dark:bg-slate-950 dark:focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-[#020618] px-3 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-955"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : paginatedCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <FolderKanban className="h-12 w-12 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-lg font-semibold">No campaigns found</h3>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search options.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-550 dark:border-slate-850 dark:bg-slate-950/20">
                <th
                  onClick={() => onRequestSort('name')}
                  className="cursor-pointer p-4 font-semibold hover:text-primary transition-all"
                >
                  Campaign Name{' '}
                  <ArrowUpDown
                    className={`inline h-3.5 w-3.5 ml-1 transition-opacity ${sortField === 'name' ? 'opacity-100' : 'opacity-40'
                      }`}
                  />
                </th>
                <th className="p-4 font-semibold">Mass Tort</th>
                <th className="p-4 font-semibold">Lead Source</th>
                <th className="p-4 font-semibold">Law Firm</th>
                <th
                  onClick={() => onRequestSort('budget')}
                  className="cursor-pointer p-4 font-semibold hover:text-primary transition-all"
                >
                  Budget{' '}
                  <ArrowUpDown
                    className={`inline h-3.5 w-3.5 ml-1 transition-opacity ${sortField === 'budget' ? 'opacity-100' : 'opacity-40'
                      }`}
                  />
                </th>
                <th
                  onClick={() => onRequestSort('leadCount')}
                  className="cursor-pointer p-4 font-semibold hover:text-primary transition-all"
                >
                  Leads{' '}
                  <ArrowUpDown
                    className={`inline h-3.5 w-3.5 ml-1 transition-opacity ${sortField === 'leadCount' ? 'opacity-100' : 'opacity-40'
                      }`}
                  />
                </th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {paginatedCampaigns.map((camp) => (
                <tr
                  key={camp.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150"
                >
                  <td className="p-4 font-medium text-slate-900 dark:text-white">
                    <button
                      onClick={() => onViewDetails(camp)}
                      className="font-semibold text-primary hover:underline text-left focus:outline-none"
                    >
                      {camp.name}
                    </button>
                    {camp.description && (
                      <div className="text-xs font-normal text-slate-400">{camp.description}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {camp.massTort?.name || camp.tortName || 'No tort'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-semibold">{camp.marketingSource || 'Direct'}</span>
                      <div className="text-2xs text-slate-400">{camp.vendor?.name || 'Internal'}</div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {camp.lawFirm?.name || 'Direct Assign'}
                  </td>
                  <td className="p-4 font-semibold">${camp.budget.toLocaleString()}</td>
                  <td className="p-4">{camp.leadCount || 0}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${camp.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : camp.status === 'PAUSED'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-slate-500/10 text-slate-550'
                        }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${camp.status === 'ACTIVE'
                          ? 'bg-emerald-500'
                          : camp.status === 'PAUSED'
                            ? 'bg-amber-500'
                            : 'bg-slate-500'
                          }`}
                      />
                      {camp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(camp)}
                        title="Analytics Details"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(camp)}
                        title={camp.status === 'ACTIVE' ? 'Pause Campaign' : 'Resume Campaign'}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                      >
                        {camp.status === 'ACTIVE' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onOpenEditModal(camp)}
                        title="Edit"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCampaign(camp.id)}
                        title="Delete"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredCampaignsCount > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 p-5 dark:border-slate-850">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * itemsPerPage + 1} to{' '}
            {Math.min(page * itemsPerPage, filteredCampaignsCount)} of {filteredCampaignsCount} campaigns
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-855 dark:hover:bg-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-855 dark:hover:bg-slate-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
