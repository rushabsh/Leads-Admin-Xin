'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, ShieldAlert, Banknote, Clock,
  BarChart3, Mail, Phone, Calendar, FolderKanban, ChevronRight
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCRMStore } from '../../../store/crmStore';
import { useAuthStore } from '../../../store/authStore';

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
    fetchInvoices
  } = useCRMStore();

  const campaigns = rawCampaigns as any[];
  const invoices = rawInvoices as any[];

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

      {/* Recent Leads Ingested */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="text-md font-bold text-slate-900">Recent Leads Pushed</h3>
          <span className="text-xs text-slate-400">Showing last 5 submissions</span>
        </div>
        <div className="overflow-x-auto">
          {vendorLeads.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No leads pushed yet.</div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Lead ID</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Contact Name</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Email</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">State</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Campaign</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorLeads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-600">{lead.leadId}</td>
                    <td className="p-4 font-medium text-slate-900">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="p-4 text-slate-600">{lead.email}</td>
                    <td className="p-4 font-medium text-slate-800">{lead.state}</td>
                    <td className="p-4 text-xs text-slate-500">{lead.campaignName || 'General campaign'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${['QUALIFIED', 'SIGNED_RETAINER'].includes(lead.status)
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : lead.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
