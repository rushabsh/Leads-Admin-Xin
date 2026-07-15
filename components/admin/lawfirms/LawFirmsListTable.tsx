'use client';

import React from 'react';
import {
  Search, Filter, Building2, Mail, Phone, Users, Eye, Edit2, Trash2,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface LawFirmsListTableProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  isLoading: boolean;
  paginatedLawFirms: any[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  itemsPerPage: number;
  filteredLawFirmsCount: number;
  onSelectLawFirm: (firm: any) => void;
  onOpenEditModal: (firm: any) => void;
  onDeleteLawFirm: (id: string) => void;
}

export default function LawFirmsListTable({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  isLoading,
  paginatedLawFirms,
  page,
  setPage,
  totalPages,
  itemsPerPage,
  filteredLawFirmsCount,
  onSelectLawFirm,
  onOpenEditModal,
  onDeleteLawFirm
}: LawFirmsListTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      {/* Filters */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-850 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by law firm name, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-primary"
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
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-955"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : paginatedLawFirms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-lg font-semibold">No Law Firms registered</h3>
          <p className="mt-1 text-sm text-slate-550">
            Configure law firm accounts to transfer intake qualified leads.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-850 dark:bg-slate-950/20">
                <th className="p-4 font-semibold">Firm Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Attorneys</th>
                <th className="p-4 font-semibold">Cases</th>
                <th className="p-4 font-semibold">Leads</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {paginatedLawFirms.map((firm) => (
                <tr
                  key={firm.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150"
                >
                  <td className="p-4 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Building2 className="h-4.5 w-4.5" />
                      </div>
                      <button
                        onClick={() => onSelectLawFirm(firm)}
                        className="font-semibold text-primary hover:underline text-left focus:outline-none"
                      >
                        {firm.name}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{firm.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{firm.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {firm.attorneys?.length || 0}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    {firm.cases?.length || 0}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    {firm.leads?.length || 0}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${
                        firm.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-slate-500/10 text-slate-500'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          firm.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-500'
                        }`}
                      />
                      {firm.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectLawFirm(firm)}
                        title="View Profile"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onOpenEditModal(firm)}
                        title="Edit Firm"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteLawFirm(firm.id)}
                        title="Delete Firm"
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
      {filteredLawFirmsCount > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 p-5 dark:border-slate-850">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * itemsPerPage + 1} to{' '}
            {Math.min(page * itemsPerPage, filteredLawFirmsCount)} of {filteredLawFirmsCount} firms
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
