'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import { useAuthStore } from '../../../../store/authStore';

// Extracted modular components
import VendorPortalLeadsTable from '../../../../components/vendor-portal/leads/VendorPortalLeadsTable';
import SubmitLeadModal from '../../../../components/vendor-portal/leads/SubmitLeadModal';

interface LeadData {
  id: string;
  leadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  status: string;
  priority: string;
  campaignId: string;
  campaignName?: string;
  tortName?: string;
  vendorId?: string;
  vendorName?: string;
  sourceName?: string;
  caseDetails?: string;
  createdAt: string;
}

export default function VendorLeadsPage() {
  const { user } = useAuthStore();
  const { leads, campaigns: rawCampaigns, fetchData, addLead, isLoading } = useCRMStore();
  const campaigns = rawCampaigns as any[];

  const vendorId = user?.vendorId || 'ven-1';

  // Filters, search, pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof LeadData>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Submit Lead Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    state: 'CA',
    priority: 'MEDIUM',
    status: 'NEW',
    campaignId: '',
    campaignName: '',
    tortName: '',
    vendorId: vendorId,
    vendorName: user?.name || 'Premier Leads LLC',
    sourceName: 'API Ingestion',
    caseDetails: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set default campaign when campaigns load
  useEffect(() => {
    const vendorCampaigns = campaigns.filter(c => c.vendorId === vendorId);
    if (vendorCampaigns.length > 0 && !formData.campaignId) {
      const defaultCamp = vendorCampaigns[0];
      setFormData(prev => ({
        ...prev,
        campaignId: defaultCamp.id,
        campaignName: defaultCamp.name,
        tortName: defaultCamp.tortName || 'Camp Lejeune'
      }));
    }
  }, [campaigns, vendorId, formData.campaignId]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCampaignChange = (campId: string) => {
    const camp = campaigns.find(c => c.id === campId);
    if (camp) {
      setFormData(prev => ({
        ...prev,
        campaignId: camp.id,
        campaignName: camp.name,
        tortName: camp.tortName || ''
      }));
    }
  };

  const handleOpenSubmitModal = () => {
    const vendorCampaigns = campaigns.filter(c => c.vendorId === vendorId);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      state: 'FL',
      priority: 'MEDIUM',
      status: 'NEW',
      campaignId: vendorCampaigns[0]?.id || '',
      campaignName: vendorCampaigns[0]?.name || '',
      tortName: vendorCampaigns[0]?.tortName || '',
      vendorId: vendorId,
      vendorName: user?.name || 'Premier Leads LLC',
      sourceName: 'Vendor Portal Form',
      caseDetails: ''
    });
    setShowSubmitModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addLead(formData);
      showToast('Lead submitted successfully!', 'success');
      setShowSubmitModal(false);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to submit lead', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sorting
  const requestSort = (field: keyof LeadData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortField(field);
    setSortDirection(direction);
  };

  // Vendor restricted filter
  const vendorLeads = leads.filter(l => l.vendorId === vendorId);

  // Search & Status filters
  const filteredLeads = vendorLeads.filter(lead => {
    const matchSearch =
      `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.leadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    const matchStatus = statusFilter === '' || lead.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Sorted
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (typeof valA === 'string') {
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sortDirection === 'asc' ? (valA as any) - (valB as any) : (valB as any) - (valA as any);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage) || 1;
  const paginatedLeads = sortedLeads.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const vendorCampaignsList = campaigns.filter(c => c.vendorId === vendorId);

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}
          >
            <Check className="h-4 w-4" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Submitted Leads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View history, real-time qualification statuses, and submit leads directly.
          </p>
        </div>
        <button
          onClick={handleOpenSubmitModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Submit Lead manually
        </button>
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
      />

      <SubmitLeadModal
        showSubmitModal={showSubmitModal}
        setShowSubmitModal={setShowSubmitModal}
        formData={formData}
        setFormData={setFormData}
        vendorCampaignsList={vendorCampaignsList}
        onCampaignChange={handleCampaignChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
