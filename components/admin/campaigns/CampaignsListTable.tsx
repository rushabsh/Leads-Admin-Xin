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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Filters Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-5 md:flex-row md:items-center">
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
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-xs"
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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : paginatedCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <FolderKanban className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-bold text-slate-900">No campaigns found</h3>
          <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or search options.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                <th
                  onClick={() => onRequestSort('name')}
                  className="cursor-pointer p-4 hover:text-blue-600 transition-all"
                >
                  Campaign Name{' '}
                  <ArrowUpDown
                    className={`inline h-3.5 w-3.5 ml-1 transition-opacity ${sortField === 'name' ? 'opacity-100' : 'opacity-40'
                      }`}
                  />
                </th>
                <th className="p-4">Mass Tort</th>
                <th className="p-4">Lead Source</th>
                <th className="p-4">Law Firm</th>
                <th
                  onClick={() => onRequestSort('budget')}
                  className="cursor-pointer p-4 hover:text-blue-600 transition-all"
                >
                  Budget{' '}
                  <ArrowUpDown
                    className={`inline h-3.5 w-3.5 ml-1 transition-opacity ${sortField === 'budget' ? 'opacity-100' : 'opacity-40'
                      }`}
                  />
                </th>
                <th
                  onClick={() => onRequestSort('leadCount')}
                  className="cursor-pointer p-4 hover:text-blue-600 transition-all"
                >
                  Leads{' '}
                  <ArrowUpDown
                    className={`inline h-3.5 w-3.5 ml-1 transition-opacity ${sortField === 'leadCount' ? 'opacity-100' : 'opacity-40'
                      }`}
                  />
                </th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCampaigns.map((camp) => (
                <tr
                  key={camp.id}
                  onClick={() => onViewDetails(camp)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="p-4 font-medium text-slate-900">
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewDetails(camp); }}
                      className="font-bold text-blue-600 group-hover:underline text-left focus:outline-none cursor-pointer"
                    >
                      {camp.name}
                    </button>
                    {camp.description && (
                      <div className="text-xs font-normal text-slate-400 mt-0.5">{camp.description}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {camp.massTort?.name || camp.tortName || 'No tort'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-900">{camp.marketingSource || 'Direct'}</span>
                      <div className="text-xs text-slate-400">{camp.vendor?.name || 'Internal'}</div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700">
                    {camp.lawFirm?.name || 'Direct Assign'}
                  </td>
                  <td className="p-4 font-semibold text-slate-900">${camp.budget.toLocaleString()}</td>
                  <td className="p-4 font-semibold text-slate-900">{camp.leadCount || 0}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${camp.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : camp.status === 'PAUSED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${camp.status === 'ACTIVE'
                          ? 'bg-emerald-600'
                          : camp.status === 'PAUSED'
                            ? 'bg-amber-600'
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
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(camp)}
                        title={camp.status === 'ACTIVE' ? 'Pause Campaign' : 'Resume Campaign'}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
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
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCampaign(camp.id)}
                        title="Delete"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
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
        <div className="flex items-center justify-between border-t border-slate-100 p-5">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * itemsPerPage + 1} to{' '}
            {Math.min(page * itemsPerPage, filteredCampaignsCount)} of {filteredCampaignsCount} campaigns
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
