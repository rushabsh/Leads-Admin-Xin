'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useCRMStore } from '../../../../../store/crmStore';

// Extracted modular components
import VendorProfileHeader from '../../../../../components/admin/vendors/VendorProfileHeader';
import VendorStatsKpis from '../../../../../components/admin/vendors/VendorStatsKpis';
import VendorCampaignsTable from '../../../../../components/admin/vendors/VendorCampaignsTable';
import VendorLeadsTable from '../../../../../components/admin/vendors/VendorLeadsTable';
import VendorCampaignDrilldownModal from '../../../../../components/admin/vendors/VendorCampaignDrilldownModal';

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const { vendors, leads, campaigns, invoices, fetchData, isLoading } = useCRMStore();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'leads'>('campaigns');

  // Leads Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedCampaignForLeads, setSelectedCampaignForLeads] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Find vendor details
  const vendor = useMemo(() => {
    return vendors.find(v => v.id === id);
  }, [vendors, id]);

  // Calculate Vendor Stats
  const stats = useMemo(() => {
    if (!vendor) return { totalLeads: 0, qualifiedLeads: 0, disqualifiedLeads: 0, conversionRate: 0, totalInvoiced: 0, paymentsCollected: 0 };

    const vendorLeads = leads.filter((l: any) => l.vendorId === id);
    const totalLeads = vendorLeads.length;
    const qualifiedLeads = vendorLeads.filter((l: any) => l.status === 'QUALIFIED' || l.status === 'SIGNED_RETAINER').length;
    const disqualifiedLeads = vendorLeads.filter((l: any) => l.status === 'REJECTED').length;
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

    const vendorInvoices = invoices.filter((inv: any) => inv.clientId === id || inv.vendorId === id);
    const totalInvoiced = vendorInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paymentsCollected = vendorInvoices.filter((inv: any) => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0);

    return {
      totalLeads,
      qualifiedLeads,
      disqualifiedLeads,
      conversionRate,
      totalInvoiced,
      paymentsCollected
    };
  }, [leads, invoices, vendor, id]);

  // Filtered Campaigns
  const vendorCampaigns = useMemo(() => {
    return campaigns.filter((c: any) => c.vendorId === id || c.vendorName === vendor?.name);
  }, [campaigns, id, vendor]);

  // Filtered Leads
  const vendorLeads = useMemo(() => {
    return leads.filter((l: any) => l.vendorId === id);
  }, [leads, id]);

  // Qualified & Disqualified leads for the selected campaign
  const campaignQualifiedLeads = useMemo(() => {
    if (!selectedCampaignForLeads) return [];
    return vendorLeads.filter(
      (l: any) =>
        l.campaignId === selectedCampaignForLeads.id &&
        (l.status === 'QUALIFIED' || l.status === 'SIGNED_RETAINER')
    );
  }, [vendorLeads, selectedCampaignForLeads]);

  const campaignDisqualifiedLeads = useMemo(() => {
    if (!selectedCampaignForLeads) return [];
    return vendorLeads.filter(
      (l: any) =>
        l.campaignId === selectedCampaignForLeads.id &&
        l.status === 'REJECTED'
    );
  }, [vendorLeads, selectedCampaignForLeads]);

  const filteredLeads = useMemo(() => {
    return vendorLeads.filter((lead: any) => {
      const matchSearch =
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.leadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm);

      const matchStatus = statusFilter ? lead.status === statusFilter : true;
      const matchPriority = priorityFilter ? lead.priority === priorityFilter : true;
      const matchState = stateFilter ? lead.state === stateFilter : true;
      const matchCampaign = campaignFilter ? lead.campaignId === campaignFilter : true;

      return matchSearch && matchStatus && matchPriority && matchState && matchCampaign;
    });
  }, [vendorLeads, searchTerm, statusFilter, priorityFilter, stateFilter, campaignFilter]);

  const uniqueStates = useMemo(() => {
    const states = vendorLeads.map((l: any) => l.state).filter(Boolean);
    return Array.from(new Set(states)).sort();
  }, [vendorLeads]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = filteredLeads.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const handleOpenLead = (leadId: string) => {
    router.push(`/admin/leads?id=${leadId}`);
  };

  if (isLoading && !vendor) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col h-64 w-full items-center justify-center text-center gap-4">
        <ShieldAlert className="h-12 w-12 text-rose-500" />
        <h2 className="text-lg font-bold">Vendor Not Found</h2>
        <button onClick={() => router.push('/admin')} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VendorProfileHeader
        vendor={vendor}
        onBack={() => router.push('/admin')}
      />

      {/* Info Card & Stats Summary Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <VendorStatsKpis
            stats={stats}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* Main Tabbed section */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/50 p-1 dark:bg-slate-950/40 border border-slate-200/20 mb-5 max-w-xs">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${activeTab === 'campaigns'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-250'
              }`}
          >
            Campaigns ({vendorCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${activeTab === 'leads'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-250'
              }`}
          >
            Leads Ingested ({filteredLeads.length})
          </button>
        </div>

        {activeTab === 'campaigns' && (
          <VendorCampaignsTable
            vendorCampaigns={vendorCampaigns}
            vendorLeads={vendorLeads}
            formatCurrency={formatCurrency}
            onSelectCampaign={setSelectedCampaignForLeads}
          />
        )}

        {activeTab === 'leads' && (
          <VendorLeadsTable
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            stateFilter={stateFilter}
            setStateFilter={setStateFilter}
            campaignFilter={campaignFilter}
            setCampaignFilter={setCampaignFilter}
            campaigns={campaigns}
            uniqueStates={uniqueStates}
            paginatedLeads={paginatedLeads}
            filteredLeadsCount={filteredLeads.length}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onOpenLead={handleOpenLead}
          />
        )}
      </div>

      {/* Campaign Leads Drilldown Modal */}
      <AnimatePresence>
        {selectedCampaignForLeads && (
          <VendorCampaignDrilldownModal
            selectedCampaign={selectedCampaignForLeads}
            onClose={() => setSelectedCampaignForLeads(null)}
            campaignQualifiedLeads={campaignQualifiedLeads}
            campaignDisqualifiedLeads={campaignDisqualifiedLeads}
            onOpenLead={handleOpenLead}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
