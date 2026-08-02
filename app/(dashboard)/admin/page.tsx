'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCRMStore } from '../../../store/crmStore';
import { useAuthStore } from '../../../store/authStore';

// Admin dashboard modular components
import KpiCards from '../../../components/admin/KpiCards';
import QualifiedLeadsTable from '../../../components/admin/QualifiedLeadsTable';
import DisqualifiedLeadsTable from '../../../components/admin/DisqualifiedLeadsTable';
import VendorsTable from '../../../components/admin/VendorsTable';
import ConversionFunnel from '../../../components/admin/ConversionFunnel';
import ActionItemsChecklist from '../../../components/admin/ActionItemsChecklist';
import AuditLogStream from '../../../components/admin/AuditLogStream';

// Dynamic import of charts to lazy load recharts library
const DashboardCharts = dynamic(() => import('../../../components/DashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-80 w-full animate-pulse bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-sm text-slate-400">
        Loading volume analytics...
      </div>
      <div className="h-80 w-full animate-pulse bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-sm text-slate-400">
        Loading revenue analysis...
      </div>
    </div>
  )
});

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const {
    leads,
    cases,
    campaigns,
    vendors,
    lawFirms,
    tasks,
    logs,
    invoices,
    dashboardStats,
    isLoadingDashboard,
    isLoadingCases,
    isLoadingTasks,
    isLoadingLogs,
    fetchDashboard,
    fetchLeads,
    fetchCampaigns,
    fetchVendors,
    fetchTasks,
    fetchLogs,
    fetchInvoices
  } = useCRMStore();

  // Qualified table state
  const [qualSearch, setQualSearch] = useState('');
  const [qualStatus, setQualStatus] = useState('');
  const [qualCampaign, setQualCampaign] = useState('');
  const [qualVendor, setQualVendor] = useState('');
  const [qualState, setQualState] = useState('');
  const [qualPage, setQualPage] = useState(1);

  // Disqualified table state
  const [disqSearch, setDisqSearch] = useState('');
  const [disqCampaign, setDisqCampaign] = useState('');
  const [disqVendor, setDisqVendor] = useState('');
  const [disqPriority, setDisqPriority] = useState('');
  const [disqState, setDisqState] = useState('');
  const [disqPage, setDisqPage] = useState(1);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'qualified' | 'disqualified' | 'vendors'>('qualified');

  // Filter Qualified Leads (QUALIFIED or SIGNED_RETAINER)
  const filteredQualLeads = useMemo(() => {
    return leads.filter((lead: any) => {
      const isQualified = lead.status === 'QUALIFIED' || lead.status === 'SIGNED_RETAINER';
      if (!isQualified) return false;

      const matchSearch =
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(qualSearch.toLowerCase()) ||
        lead.leadId.toLowerCase().includes(qualSearch.toLowerCase()) ||
        lead.email.toLowerCase().includes(qualSearch.toLowerCase()) ||
        lead.phone.includes(qualSearch);

      const matchStatus = qualStatus ? lead.status === qualStatus : true;
      const matchCampaign = qualCampaign ? lead.campaignId === qualCampaign : true;
      const matchVendor = qualVendor ? lead.vendorId === qualVendor : true;
      const matchState = qualState ? lead.state === qualState : true;

      return matchSearch && matchStatus && matchCampaign && matchVendor && matchState;
    });
  }, [leads, qualSearch, qualStatus, qualCampaign, qualVendor, qualState]);

  // Filter Disqualified Leads (REJECTED)
  const filteredDisqLeads = useMemo(() => {
    return leads.filter((lead: any) => {
      const isDisqualified = lead.status === 'REJECTED';
      if (!isDisqualified) return false;

      const matchSearch =
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(disqSearch.toLowerCase()) ||
        lead.leadId.toLowerCase().includes(disqSearch.toLowerCase()) ||
        lead.email.toLowerCase().includes(disqSearch.toLowerCase()) ||
        lead.phone.includes(disqSearch);

      const matchCampaign = disqCampaign ? lead.campaignId === disqCampaign : true;
      const matchVendor = disqVendor ? lead.vendorId === disqVendor : true;
      const matchPriority = disqPriority ? lead.priority === disqPriority : true;
      const matchState = disqState ? lead.state === disqState : true;

      return matchSearch && matchCampaign && matchVendor && matchPriority && matchState;
    });
  }, [leads, disqSearch, disqCampaign, disqVendor, disqPriority, disqState]);

  // Unique States for Dropdowns
  const uniqueQualStates = useMemo(() => {
    const states = leads
      .filter(l => l.status === 'QUALIFIED' || l.status === 'SIGNED_RETAINER')
      .map(l => l.state)
      .filter(Boolean);
    return Array.from(new Set(states)).sort();
  }, [leads]);

  const uniqueDisqStates = useMemo(() => {
    const states = leads
      .filter(l => l.status === 'REJECTED')
      .map(l => l.state)
      .filter(Boolean);
    return Array.from(new Set(states)).sort();
  }, [leads]);

  // Vendors Table Data
  const vendorsTableData = useMemo(() => {
    return vendors.map((vendor: any) => {
      const vendorLeads = leads.filter((l: any) => l.vendorId === vendor.id);
      const totalLeadsCount = vendorLeads.length || vendor.leads?.length || 0;
      const qualifiedLeadsCount = vendorLeads.filter((l: any) => l.status === 'QUALIFIED' || l.status === 'SIGNED_RETAINER').length || 0;
      const conversionRate = totalLeadsCount > 0 ? Math.round((qualifiedLeadsCount / totalLeadsCount) * 100) : 0;

      const vendorInvoices = invoices.filter((inv: any) => inv.clientId === vendor.id || inv.vendorId === vendor.id);
      const paymentsCollected = vendorInvoices.filter((inv: any) => inv.status === 'PAID').reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;

      return {
        ...vendor,
        totalLeads: totalLeadsCount,
        qualifiedLeads: qualifiedLeadsCount,
        conversionRate,
        paymentsCollected,
        campaignsCount: vendor.campaigns?.length || 0
      };
    });
  }, [vendors, leads, invoices]);

  // Load all required dashboard and list data
  useEffect(() => {
    fetchDashboard();
    fetchTasks();
    fetchLogs();
    fetchLeads();
    fetchVendors();
    fetchCampaigns();
    fetchInvoices();
  }, [fetchDashboard, fetchTasks, fetchLogs, fetchLeads, fetchVendors, fetchCampaigns, fetchInvoices]);

  // Aggregate stats from dashboardStats or compute locally if not loaded
  const stats = useMemo(() => {
    if (dashboardStats) {
      return dashboardStats;
    }
    const totalLeads = leads.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysLeads = leads.filter(l => new Date(l.createdAt) >= today).length;
    const qualifiedLeads = leads.filter(l => l.status === 'QUALIFIED').length;
    const disqualifiedLeads = leads.filter(l => l.status === 'REJECTED').length;
    const signedRetainers = leads.filter(l => l.status === 'SIGNED_RETAINER').length;
    const activeCases = cases.filter(c => c.stageName !== 'Closed').length;
    const lawFirmsCount = lawFirms.length;
    const vendorsCount = vendors.length;
    const campaignsCount = campaigns.length;
    const totalRevenue = cases.reduce((sum, c) => sum + (c.settlementAmount || 0), 0);
    const pendingPayments = totalLeads * 150;

    return {
      totalLeads,
      todaysLeads,
      qualifiedLeads,
      disqualifiedLeads,
      signedRetainers,
      campaigns: campaignsCount,
      vendors: vendorsCount,
      lawFirms: lawFirmsCount,
      revenue: totalRevenue,
      pendingPayments
    };
  }, [dashboardStats, leads, cases, campaigns, vendors, lawFirms]);

  const activeCasesCount = useMemo(() => {
    return cases.filter(c => c.stageName !== 'Closed').length;
  }, [cases]);

  // Custom colors for charts
  const COLORS = useMemo(() => ['#7367F0', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444'], []);

  // Memoized chart data
  const leadGrowthData = useMemo(() => [
    { name: 'Jan', leads: 40, qualified: 24, signed: 15 },
    { name: 'Feb', leads: 65, qualified: 35, signed: 20 },
    { name: 'Mar', leads: 95, qualified: 50, signed: 32 },
    { name: 'Apr', leads: 130, qualified: 75, signed: 48 },
    { name: 'May', leads: 185, qualified: 110, signed: 74 },
    { name: 'Jun', leads: stats.totalLeads + 200, qualified: stats.qualifiedLeads + 120, signed: stats.signedRetainers + 80 },
  ], [stats.totalLeads, stats.qualifiedLeads, stats.signedRetainers]);

  const revenueData = useMemo(() => [
    { name: 'Jan', revenue: 45000, cost: 15000 },
    { name: 'Feb', revenue: 60000, cost: 18000 },
    { name: 'Mar', revenue: 85000, cost: 22000 },
    { name: 'Apr', revenue: 110000, cost: 35000 },
    { name: 'May', revenue: 150000, cost: 48000 },
    { name: 'Jun', revenue: stats.revenue > 0 ? stats.revenue : 210000, cost: stats.pendingPayments > 0 ? stats.pendingPayments : 62000 },
  ], [stats.revenue, stats.pendingPayments]);

  const sourceData = useMemo(() => [
    { name: 'Facebook Ads', value: leads.filter(l => l.sourceName === 'Facebook Ads').length || 40 },
    { name: 'Google Search', value: leads.filter(l => l.sourceName === 'Google Search').length || 25 },
    { name: 'TV Commercial', value: leads.filter(l => l.sourceName === 'TV Commercial').length || 15 },
    { name: 'Call Center', value: leads.filter(l => l.sourceName === 'Call Center').length || 10 },
  ], [leads]);

  const funnelData = useMemo(() => [
    { name: 'Intake / New', value: stats.totalLeads },
    { name: 'Contacted', value: leads.filter(l => ['CONTACTED', 'QUALIFIED', 'SIGNED_RETAINER'].includes(l.status)).length },
    { name: 'Qualified', value: leads.filter(l => ['QUALIFIED', 'SIGNED_RETAINER'].includes(l.status)).length },
    { name: 'Retained', value: stats.signedRetainers },
  ], [stats.totalLeads, stats.signedRetainers, leads]);

  const handleSelectTab = (tab: 'qualified' | 'disqualified' | 'vendors', status?: string) => {
    setActiveTab(tab);
    if (tab === 'qualified' && typeof status !== 'undefined') {
      setQualStatus(status);
    }
    const element = document.getElementById('ingestion-pipeline');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const isStatsLoading = isLoadingDashboard && !dashboardStats;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* ---------------------------------------------------- */}
      {/* HEADER SECTION */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">MassCore Workspace</h1>
          <p className="text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span>. Here is today&apos;s litigation status.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs text-blue-600 font-semibold shadow-xs">
          <ShieldCheck className="h-4 w-4" />
          <span>Security Clearance Level: {user?.role}</span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* KPI CARDS GRID */}
      {/* ---------------------------------------------------- */}
      <KpiCards
        stats={stats}
        isStatsLoading={isStatsLoading}
        isLoadingCases={isLoadingCases}
        activeCasesCount={activeCasesCount}
        onSelectTab={handleSelectTab}
      />

      {/* ---------------------------------------------------- */}
      {/* INGESTION & VENDOR ANALYTICS PIPELINE TABS */}
      {/* ---------------------------------------------------- */}
      <div id="ingestion-pipeline" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm grid grid-cols-1 gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">Ingestion & Vendor Analytics Pipeline</h2>
            <p className="text-xs text-slate-400">Manage qualified/disqualified client files and monitor marketing vendor feeds.</p>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              onClick={() => { setActiveTab('qualified'); setQualPage(1); }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${activeTab === 'qualified'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Qualified ({filteredQualLeads.length})
            </button>
            <button
              onClick={() => { setActiveTab('disqualified'); setDisqPage(1); }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${activeTab === 'disqualified'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Disqualified ({filteredDisqLeads.length})
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${activeTab === 'vendors'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Vendor List ({vendorsTableData.length})
            </button>
          </div>
        </div>

        {activeTab === 'qualified' && (
          <QualifiedLeadsTable
            campaigns={campaigns}
            vendors={vendors}
            uniqueQualStates={uniqueQualStates}
            qualSearch={qualSearch}
            setQualSearch={setQualSearch}
            qualStatus={qualStatus}
            setQualStatus={setQualStatus}
            qualCampaign={qualCampaign}
            setQualCampaign={setQualCampaign}
            qualVendor={qualVendor}
            setQualVendor={setQualVendor}
            qualState={qualState}
            setQualState={setQualState}
            qualPage={qualPage}
            setQualPage={setQualPage}
            filteredQualLeads={filteredQualLeads}
          />
        )}

        {activeTab === 'disqualified' && (
          <DisqualifiedLeadsTable
            campaigns={campaigns}
            vendors={vendors}
            uniqueDisqStates={uniqueDisqStates}
            disqSearch={disqSearch}
            setDisqSearch={setDisqSearch}
            disqCampaign={disqCampaign}
            setDisqCampaign={setDisqCampaign}
            disqVendor={disqVendor}
            setDisqVendor={setDisqVendor}
            disqPriority={disqPriority}
            setDisqPriority={setDisqPriority}
            disqState={disqState}
            setDisqState={setDisqState}
            disqPage={disqPage}
            setDisqPage={setDisqPage}
            filteredDisqLeads={filteredDisqLeads}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorsTable vendorsTableData={vendorsTableData} />
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* VISUAL CHARTS SECTION */}
      {/* ---------------------------------------------------- */}
      <DashboardCharts
        leadGrowthData={leadGrowthData}
        revenueData={revenueData}
        sourceData={sourceData}
        COLORS={COLORS}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Chart 4: Conversion Funnel */}
        <ConversionFunnel funnelData={funnelData} />

        {/* Widget 1: Today's Tasks */}
        <ActionItemsChecklist tasks={tasks} isLoadingTasks={isLoadingTasks} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Widget 2: Recent Activity audit logs */}
        <AuditLogStream logs={logs} isLoadingLogs={isLoadingLogs} />
      </div>
    </motion.div>
  );
}
