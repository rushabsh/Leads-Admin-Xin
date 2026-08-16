'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, ShieldAlert, Banknote, Clock,
  BarChart3, Mail, Phone, Calendar, FolderKanban, ChevronRight
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCRMStore } from '../../../store/crmStore';
import { useAuthStore } from '../../../store/authStore';
import VendorPortalLeadsTable from '../../../components/vendor-portal/leads/VendorPortalLeadsTable';

// Dynamic import of charts to lazy load recharts library
const VendorCharts = dynamic(() => import('../../../components/VendorCharts'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-400">
      Loading trend analytics...
    </div>
  )
});

export default function VendorPortal() {
  const { user } = useAuthStore();
  const {
    leads,
    campaigns: rawCampaigns,
    invoices: rawInvoices,
    dashboardStats,
    isLoadingDashboard,
    isLoading,
    fetchDashboard,
    fetchLeads,
    fetchCampaigns,
    fetchInvoices,
    deleteLead
  } = useCRMStore();

  const campaigns = rawCampaigns as any[];
  const invoices = rawInvoices as any[];

  // Table state for Recent Leads Pushed section
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Load only what is needed for Vendor Portal
  useEffect(() => {
    fetchDashboard();
    fetchLeads();
    fetchCampaigns();
    fetchInvoices();
  }, [fetchDashboard, fetchLeads, fetchCampaigns, fetchInvoices]);

  const vendorId = user?.vendorId || 'ven-1';

  // Memoized filtered lists
  const vendorLeads = useMemo(() => {
    return leads.filter(l => l.vendorId === vendorId);
  }, [leads, vendorId]);

  const vendorCampaigns = useMemo(() => {
    return campaigns.filter(c => c.vendorId === vendorId || vendorLeads.some(vl => vl.campaignId === c.id));
  }, [campaigns, vendorId, vendorLeads]);

  const activeVendorCampaigns = useMemo(() => {
    const active = vendorCampaigns.filter(c => c.status === 'ACTIVE');
    if (active.length > 0) return active;
    return campaigns.filter(c => c.status === 'ACTIVE');
  }, [vendorCampaigns, campaigns]);

  const vendorInvoices = useMemo(() => {
    return invoices.filter(i => i.vendorId === vendorId);
  }, [invoices, vendorId]);

  // Aggregate stats using useMemo
  const stats = useMemo(() => {
    if (dashboardStats) {
      // In backend mode, use computed dashboardStats
      return {
        totalLeads: dashboardStats.totalLeads,
        qualifiedLeads: dashboardStats.qualifiedLeads,
        rejectedLeads: vendorLeads.filter(l => l.status === 'REJECTED').length,
        revenue: dashboardStats.revenue,
        pendingPayments: dashboardStats.pendingPayments
      };
    }

    const totalLeads = vendorLeads.length;
    const qualifiedLeads = vendorLeads.filter(l => ['QUALIFIED', 'SIGNED_RETAINER'].includes(l.status)).length;
    const rejectedLeads = vendorLeads.filter(l => l.status === 'REJECTED').length;

    const revenue = vendorInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
    const pendingPayments = vendorInvoices.filter(i => i.status === 'UNPAID').reduce((sum, i) => sum + i.amount, 0);

    return {
      totalLeads,
      qualifiedLeads,
      rejectedLeads,
      revenue: revenue > 0 ? revenue : 11700,
      pendingPayments: pendingPayments > 0 ? pendingPayments : 7200
    };
  }, [dashboardStats, vendorLeads, vendorInvoices]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Memoized Chart Data: ingestion trend for this vendor
  const trendData = useMemo(() => {
    const dateMap: { [key: string]: number } = {};
    vendorLeads.forEach(l => {
      const date = new Date(l.createdAt);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap[label] = (dateMap[label] || 0) + 1;
    });
    return Object.keys(dateMap).map(key => ({
      date: key,
      Leads: dateMap[key]
    })).slice(-7); // last 7 points
  }, [vendorLeads]);

  // Sorting request handler
  const requestSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortField(field);
    setSortDirection(direction);
  };

  // Search & Status filters
  const filteredLeads = useMemo(() => {
    return vendorLeads.filter(lead => {
      const matchSearch =
        `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.leadId && lead.leadId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchTerm));
      const matchStatus = statusFilter === '' || lead.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vendorLeads, searchTerm, statusFilter]);

  // Sorted leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }
    });
  }, [filteredLeads, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    return sortedLeads.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [sortedLeads, page, itemsPerPage]);

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLead(leadId);
      await fetchLeads(true);
    } catch (e) {
      console.error('Failed to delete lead', e);
    }
  };

  const handleDeleteMultipleLeads = async (leadIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${leadIds.length} selected lead(s)?`)) return;
    try {
      await Promise.all(leadIds.map((id) => deleteLead(id)));
      await fetchLeads(true);
    } catch (e) {
      console.error('Failed to delete selected leads', e);
    }
  };

  const isStatsLoading = isLoadingDashboard && !dashboardStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vendor Portal Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back. Track your campaign performance, lead quality, and invoice status.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Sent Leads </span>
            <Users className="h-4.5 w-4.5 text-blue-600" />
          </div>
          {isStatsLoading ? (
            <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-lg mt-3" />
          ) : (
            <h3 className="text-2xl font-bold mt-3 text-slate-900">{stats.totalLeads}</h3>
          )}
          <span className="text-[10px] text-slate-400 block mt-1">Total database submissions</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">InProgress Leads</span>
            <UserCheck className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          {isStatsLoading ? (
            <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-lg mt-3" />
          ) : (
            <h3 className="text-2xl font-bold mt-3 text-slate-900">{stats.qualifiedLeads}</h3>
          )}
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
            {stats.totalLeads > 0 ? Math.round((stats.qualifiedLeads / stats.totalLeads) * 100) : 0}% Qualified Rate
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Close Lead</span>
            <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
          </div>
          {isStatsLoading ? (
            <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-lg mt-3" />
          ) : (
            <h3 className="text-2xl font-bold mt-3 text-slate-900">{stats.rejectedLeads}</h3>
          )}
          <span className="text-[10px] text-slate-400 block mt-1">Criteria match failures</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-bold text-slate-900">Your Lead Ingestion Trend</h3>
            <span className="text-xs text-slate-400">Last 7 active days</span>
          </div>
          <div className="h-64 w-full">
            {trendData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm">No recent leads sent</div>
            ) : (
              <VendorCharts trendData={trendData} />
            )}
          </div>
        </div>

        {/* Active Campaigns Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-bold text-slate-900">Active Campaigns</h3>
            <Link
              href="/vendor-portal/campaigns"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3.5 pr-1 animate-pulse">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-1/3 bg-slate-100 rounded" />
                    <div className="h-2 w-1/4 bg-slate-100 rounded" />
                  </div>
                  <div className="text-right space-y-1.5">
                    <div className="h-3 w-12 bg-slate-100 rounded ml-auto" />
                    <div className="h-4.5 w-10 bg-slate-100 rounded mt-0.5 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeVendorCampaigns.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <FolderKanban className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs text-slate-500">No active campaigns running.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {activeVendorCampaigns.map((camp) => (
                <div key={camp.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">{camp.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 border border-blue-200">
                        {camp.tortName || 'Mass Tort'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {camp.leadCount || 0} leads
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">
                      ${camp.budget ? camp.budget.toLocaleString() : '0'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads Pushed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Leads Pushed</h3>
          <Link
            href="/vendor-portal/leads"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <VendorPortalLeadsTable
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          paginatedLeads={paginatedLeads}
          sortedLeads={sortedLeads}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          sortField={sortField}
          sortDirection={sortDirection}
          onRequestSort={requestSort}
          isLoading={isLoading}
          onDeleteLead={handleDeleteLead}
          onDeleteMultipleLeads={handleDeleteMultipleLeads}
        />
      </div>
    </div>
  );
}
