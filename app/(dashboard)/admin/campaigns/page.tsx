'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import api from '../../../../lib/api';

// Extracted modular components
import CampaignsKpis from '../../../../components/admin/campaigns/CampaignsKpis';
import CampaignsListTable from '../../../../components/admin/campaigns/CampaignsListTable';
import CampaignProfileView from '../../../../components/admin/campaigns/CampaignProfileView';
import AddEditCampaignModal from '../../../../components/admin/campaigns/AddEditCampaignModal';

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
  massTort?: { id: string; name: string };
  vendorId?: string;
  vendor?: { id: string; name: string };
  lawFirmId?: string;
  lawFirm?: { id: string; name: string };
  marketingSource?: string;
  startDate?: string;
  endDate?: string;
  costPerLeadTarget?: number;
  expectedLeadTarget?: number;
  leads?: any[];
  tortName?: string;
}

interface MassTortData {
  id: string;
  name: string;
}

interface VendorData {
  id: string;
  name: string;
}

interface LawFirmData {
  id: string;
  name: string;
}

export default function CampaignsPage() {
  const { campaigns: rawCampaigns, fetchData, isLoading } = useCRMStore();
  const campaigns = rawCampaigns as any[] as CampaignData[];
  const [massTorts, setMassTorts] = useState<MassTortData[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [lawFirms, setLawFirms] = useState<LawFirmData[]>([]);

  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'leads' | 'vendors' | 'lawfirms' | 'budget' | 'activity'>('overview');
  const [campaignLeads, setCampaignLeads] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof CampaignData>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: 0,
    massTortId: '',
    vendorId: '',
    lawFirmId: '',
    marketingSource: 'Facebook Ads',
    startDate: '',
    endDate: '',
    costPerLeadTarget: 0,
    expectedLeadTarget: 0,
    status: 'ACTIVE'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
    api.get('/settings/mass-torts').then(res => setMassTorts(res.data.massTorts || [])).catch(() => {
      setMassTorts([
        { id: '1', name: 'Camp Lejeune' },
        { id: '2', name: 'Roundup' },
        { id: '3', name: 'AFFF Firefighting Foam' }
      ]);
    });
    api.get('/vendors').then(res => setVendors(res.data.data || [])).catch(() => { });
    api.get('/law-firms').then(res => setLawFirms(res.data.data || [])).catch(() => { });
  }, [fetchData]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      description: '',
      budget: 10000,
      massTortId: massTorts[0]?.id || '',
      vendorId: vendors[0]?.id || '',
      lawFirmId: '',
      marketingSource: 'Facebook Ads',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      costPerLeadTarget: 50,
      expectedLeadTarget: 200,
      status: 'ACTIVE'
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (campaign: CampaignData) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      budget: campaign.budget,
      massTortId: campaign.massTortId,
      vendorId: campaign.vendorId || '',
      lawFirmId: campaign.lawFirmId || '',
      marketingSource: campaign.marketingSource || 'Facebook Ads',
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
      costPerLeadTarget: campaign.costPerLeadTarget || 0,
      expectedLeadTarget: campaign.expectedLeadTarget || 0,
      status: campaign.status
    });
    setShowAddEditModal(true);
  };

  const handleViewDetails = async (camp: CampaignData) => {
    setIsLoadingDetails(true);
    setSelectedCampaign(camp);
    setActiveDetailTab('overview');
    try {
      const res = await api.get(`/campaigns/${camp.id}`);
      const c = res.data.campaign;
      setSelectedCampaign(c);
      setCampaignLeads(c.leads || []);
    } catch (e) {
      console.error(e);
      setCampaignLeads([]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCampaign) {
        await api.put(`/campaigns/${editingCampaign.id}`, formData);
        showToast('Campaign updated successfully!', 'success');
      } else {
        await api.post('/campaigns', formData);
        showToast('Campaign created successfully!', 'success');
      }
      setShowAddEditModal(false);
      fetchData();
      if (selectedCampaign && selectedCampaign.id === editingCampaign?.id) {
        handleViewDetails(selectedCampaign);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error processing request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      showToast('Campaign deleted successfully!', 'success');
      fetchData();
      if (selectedCampaign?.id === id) {
        setSelectedCampaign(null);
      }
    } catch (error: any) {
      showToast('Failed to delete campaign.', 'error');
    }
  };

  const toggleStatus = async (campaign: CampaignData) => {
    const nextStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.put(`/campaigns/${campaign.id}`, { status: nextStatus });
      showToast(`Campaign status updated to ${nextStatus}`, 'success');
      fetchData();
      if (selectedCampaign?.id === campaign.id) {
        setSelectedCampaign({ ...selectedCampaign, status: nextStatus });
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const requestSort = (field: keyof CampaignData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortField(field);
    setSortDirection(direction);
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.massTort?.name && c.massTort.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === '' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    let valA: any = a[sortField as keyof typeof a];
    let valB: any = b[sortField as keyof typeof b];

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (typeof valA === 'string') {
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
  });

  const totalPages = Math.ceil(sortedCampaigns.length / itemsPerPage) || 1;
  const paginatedCampaigns = sortedCampaigns.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const activeCampaignsCount = campaigns.filter(c => c.status === 'ACTIVE').length;
  const avgConversion = campaigns.length
    ? Math.round(campaigns.reduce((acc, c) => acc + (c.conversionRate || 0), 0) / campaigns.length)
    : 0;

  const metrics = useMemo(() => {
    if (!selectedCampaign) return null;
    const leads = campaignLeads;
    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === 'NEW').length;
    const qualifiedLeads = leads.filter(l => l.status === 'QUALIFIED' || l.status === 'SIGNED_RETAINER' || l.status === 'RETAINED' || l.status === 'SETTLED').length;
    const rejectedLeads = leads.filter(l => l.status === 'REJECTED' || l.status === 'DISQUALIFIED').length;
    const conversion = totalLeads ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

    const costPerLead = totalLeads ? Math.round(selectedCampaign.budget / totalLeads) : 0;
    const actualSpend = totalLeads * (selectedCampaign.costPerLeadTarget || 40);
    const revenue = leads.filter(l => l.status === 'SETTLED' || l.status === 'RETAINED').length * 2500;
    const roi = actualSpend ? Math.round(((revenue - actualSpend) / actualSpend) * 100) : 0;

    const datesMap: { [key: string]: number } = {};
    leads.forEach(l => {
      const d = new Date(l.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      datesMap[d] = (datesMap[d] || 0) + 1;
    });
    const leadsOverTime = Object.keys(datesMap).map(k => ({ date: k, leads: datesMap[k] })).slice(-7);

    const vendorsMap: { [key: string]: number } = {};
    leads.forEach(l => {
      const v = l.vendor?.name || selectedCampaign.vendor?.name || 'Direct';
      vendorsMap[v] = (vendorsMap[v] || 0) + 1;
    });
    const leadsByVendor = Object.keys(vendorsMap).map(k => ({ name: k, count: vendorsMap[k] }));

    const statusMap: { [key: string]: number } = {};
    leads.forEach(l => {
      statusMap[l.status] = (statusMap[l.status] || 0) + 1;
    });
    const statusDist = Object.keys(statusMap).map(k => ({ name: k, value: statusMap[k] }));

    const budgetVsSpend = [
      { name: 'Budget Limit', amount: selectedCampaign.budget },
      { name: 'Actual Spend', amount: actualSpend }
    ];

    const vendorMetrics = Object.keys(vendorsMap).map(k => {
      const vLeads = leads.filter(l => (l.vendor?.name || selectedCampaign.vendor?.name || 'Direct') === k);
      const vQual = vLeads.filter(l => l.status === 'QUALIFIED' || l.status === 'SIGNED_RETAINER').length;
      return {
        name: k,
        submitted: vLeads.length,
        qualified: vQual,
        conversion: vLeads.length ? Math.round((vQual / vLeads.length) * 100) : 0,
        cpl: vLeads.length ? Math.round((selectedCampaign.budget / 4) / vLeads.length) : 0
      };
    });

    const lawFirmsMap: { [key: string]: any } = {};
    leads.forEach(l => {
      if (l.lawFirmId) {
        const lfName = l.lawFirm?.name || 'Assigned Council';
        if (!lawFirmsMap[lfName]) lawFirmsMap[lfName] = { assigned: 0, accepted: 0, rejected: 0 };
        lawFirmsMap[lfName].assigned += 1;
        if (l.status === 'SIGNED_RETAINER' || l.status === 'RETAINED') lawFirmsMap[lfName].accepted += 1;
        if (l.status === 'REJECTED') lawFirmsMap[lfName].rejected += 1;
      }
    });
    const lawFirmMetrics = Object.keys(lawFirmsMap).map(k => ({
      name: k,
      ...lawFirmsMap[k]
    }));

    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      rejectedLeads,
      conversion,
      costPerLead,
      actualSpend,
      revenue,
      roi,
      leadsOverTime,
      leadsByVendor,
      statusDist,
      budgetVsSpend,
      vendorMetrics,
      lawFirmMetrics
    };
  }, [selectedCampaign, campaignLeads]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-all ${toast.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}
          >
            <Check className="h-4 w-4" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedCampaign ? (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Campaigns Manager</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configure acquisition channels, media buying budgets, and lead vendors.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </button>
          </div>

          <CampaignsKpis
            totalBudget={totalBudget}
            activeCampaignsCount={activeCampaignsCount}
            totalCampaignsCount={campaigns.length}
            avgConversion={avgConversion}
          />

          <CampaignsListTable
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            isLoading={isLoading}
            paginatedCampaigns={paginatedCampaigns}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            filteredCampaignsCount={filteredCampaigns.length}
            sortField={sortField}
            sortDirection={sortDirection}
            onRequestSort={requestSort}
            onViewDetails={handleViewDetails}
            onToggleStatus={toggleStatus}
            onOpenEditModal={handleOpenEditModal}
            onDeleteCampaign={handleDelete}
          />
        </>
      ) : (
        <CampaignProfileView
          selectedCampaign={selectedCampaign}
          onBack={() => setSelectedCampaign(null)}
          activeDetailTab={activeDetailTab}
          setActiveDetailTab={setActiveDetailTab}
          isLoadingDetails={isLoadingDetails}
          metrics={metrics}
          campaignLeads={campaignLeads}
          onToggleStatus={toggleStatus}
          onOpenEditModal={handleOpenEditModal}
        />
      )}

      <AddEditCampaignModal
        showAddEditModal={showAddEditModal}
        setShowAddEditModal={setShowAddEditModal}
        editingCampaign={editingCampaign}
        formData={formData}
        setFormData={setFormData}
        massTorts={massTorts}
        vendors={vendors}
        lawFirms={lawFirms}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
