'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, ChevronLeft, ChevronRight,
  FolderKanban, DollarSign, Activity, Percent, ArrowUpDown
} from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import { useAuthStore } from '../../../../store/authStore';

interface CampaignData {
  id: string;
  name: string;
  description?: string;
  budget: number;
  roi: number;
  revenue: number;
  leadCount: number;
  conversionRate: number;
  status: string;
  massTortId: string;
  tortName?: string;
  vendorId?: string;
  vendorName?: string;
}

export default function VendorCampaignsPage() {
  const { user } = useAuthStore();
  const { campaigns: rawCampaigns, leads, fetchData, isLoading } = useCRMStore();
  const campaigns = rawCampaigns as any[] as CampaignData[];

  const vendorId = user?.vendorId || 'ven-1';

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof CampaignData>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter campaigns assigned to this vendor
  const vendorLeads = leads.filter(l => l.vendorId === vendorId);
  const vendorCampaigns = campaigns.filter(c => c.vendorId === vendorId || vendorLeads.some(vl => vl.campaignId === c.id));

  // Search & Status filters
  const filteredCampaigns = vendorCampaigns.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.tortName && c.tortName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === '' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Sorting
  const requestSort = (field: keyof CampaignData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortField(field);
    setSortDirection(direction);
  };

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sortDirection === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedCampaigns.length / itemsPerPage) || 1;
  const paginatedCampaigns = sortedCampaigns.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // KPIs
  const totalBudget = vendorCampaigns.reduce((acc, c) => acc + c.budget, 0);
  const activeCampaignsCount = vendorCampaigns.filter(c => c.status === 'ACTIVE').length;
  const totalVendorLeadsCount = vendorLeads.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Campaigns</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitor media spend budgets, lead volume ingestion, and qualification metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Allocated Budget</span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">${totalBudget.toLocaleString()}</h3>
            <p className="mt-1 text-xs text-slate-400">Aggregate media buying cap</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Channels</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">{activeCampaignsCount} / {vendorCampaigns.length}</h3>
            <p className="mt-1 text-xs text-slate-400">Campaigns generating leads</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Leads Generated</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">{totalVendorLeadsCount}</h3>
            <p className="mt-1 text-xs text-slate-400">Historical database submissions</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        {/* Filters Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-850 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, mass tort..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-primary"
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
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : paginatedCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FolderKanban className="h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-4 text-lg font-semibold">No campaigns found</h3>
            <p className="mt-1 text-sm text-slate-500">Contact admin to set up campaigns mapping.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-850 dark:bg-slate-950/20">
                  <th onClick={() => requestSort('name')} className="cursor-pointer p-4 font-semibold hover:text-primary transition-all">
                    Campaign Name <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                  </th>
                  <th className="p-4 font-semibold">Mass Tort</th>
                  <th onClick={() => requestSort('budget')} className="cursor-pointer p-4 font-semibold hover:text-primary transition-all">
                    Budget Allocation <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                  </th>
                  <th onClick={() => requestSort('leadCount')} className="cursor-pointer p-4 font-semibold hover:text-primary transition-all">
                    Leads Ingested <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                  </th>
                  <th onClick={() => requestSort('conversionRate')} className="cursor-pointer p-4 font-semibold hover:text-primary transition-all">
                    Conv. Rate <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                  </th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {paginatedCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      <div>
                        <div>{camp.name}</div>
                        {camp.description && <div className="text-xs font-normal text-slate-400">{camp.description}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        {camp.tortName || 'No tort'}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">${camp.budget.toLocaleString()}</td>
                    <td className="p-4">{camp.leadCount || 0}</td>
                    <td className="p-4 font-medium text-indigo-500">{camp.conversionRate || 0}%</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${camp.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : camp.status === 'PAUSED'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-slate-500/10 text-slate-500'
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${camp.status === 'ACTIVE'
                          ? 'bg-emerald-500'
                          : camp.status === 'PAUSED'
                            ? 'bg-amber-500'
                            : 'bg-slate-500'
                          }`} />
                        {camp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredCampaigns.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 p-5 dark:border-slate-850">
            <span className="text-xs text-slate-500">
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-850 dark:hover:bg-slate-900"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-850 dark:hover:bg-slate-900"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
