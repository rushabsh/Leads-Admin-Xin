'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Check, Upload, FileText } from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../lib/api';

// Extracted modular components
import VendorPortalLeadsTable from '../../../../components/vendor-portal/leads/VendorPortalLeadsTable';
import SubmitLeadModal from '../../../../components/vendor-portal/leads/SubmitLeadModal';
import CsvImportModal from '../../../../components/admin/leads/CsvImportModal';
import useCsvImport from '../../admin/leads/useCsvImport';

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
  const { leads, campaigns: rawCampaigns, fetchData, addLead, deleteLead, isLoading } = useCRMStore();
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

  // CSV Import State Hook
  const {
    showImportModal,
    setShowImportModal,
    csvStep,
    setCsvStep,
    parsedCsvData,
    validationErrors,
    importSummary,
    handleCSVFileChange,
    handleValidateCsv,
    handleCSVImportConfirm,
    handleDownloadTemplate,
  } = useCsvImport(showToast, vendorId, user?.name);

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

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLead(leadId);
      showToast('Lead deleted successfully', 'success');
      await fetchData(true);
    } catch (e) {
      showToast('Failed to delete lead', 'error');
    }
  };

  const handleDeleteMultipleLeads = async (leadIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${leadIds.length} selected lead(s)?`)) return;
    try {
      await Promise.all(leadIds.map((id) => deleteLead(id)));
      showToast(`${leadIds.length} lead(s) deleted successfully`, 'success');
      await fetchData(true);
    } catch (e) {
      showToast('Failed to delete selected leads', 'error');
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
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${toast.type === 'success'
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Submitted Leads</h1>
          <p className="text-sm text-slate-500">
            View history, real-time qualification statuses, and submit leads directly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => { setShowImportModal(true); setCsvStep('upload'); }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-colors active:scale-[0.98] cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Import CSV Leads
          </button>
          <Link
            href="/vendor-portal/leads/follow-up"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors active:scale-[0.98] cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            New Case: Lead Follow Up
          </Link>
        </div>
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

      <CsvImportModal
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        csvStep={csvStep}
        setCsvStep={setCsvStep}
        parsedCsvData={parsedCsvData}
        validationErrors={validationErrors}
        importSummary={importSummary}
        onCSVFileChange={handleCSVFileChange}
        onValidateCsv={handleValidateCsv}
        onCSVImportConfirm={handleCSVImportConfirm}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
}
