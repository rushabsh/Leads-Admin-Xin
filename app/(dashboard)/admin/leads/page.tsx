'use client';

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Upload, Download, Plus } from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../lib/api';

// Extracted modular components and hooks
import LeadsListTable from '../../../../components/admin/leads/LeadsListTable';
import LeadProfileView from '../../../../components/admin/leads/LeadProfileView';
import AddLeadModal from '../../../../components/admin/leads/AddLeadModal';
import CsvImportModal from '../../../../components/admin/leads/CsvImportModal';
import OcrPreviewModal from '../../../../components/admin/leads/OcrPreviewModal';
import useCsvImport from './useCsvImport';

const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

function LeadsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    leads, campaigns, vendors, fetchData
  } = useCRMStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Table Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Lead state for Full Page Profile
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadDetails, setLeadDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'case' | 'documents' | 'notes' | 'tasks' | 'audits'>('personal');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);

  // New Lead Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    state: 'CA',
    priority: 'MEDIUM',
    status: 'NEW',
    campaignId: '',
    vendorId: '',
    lawFirmId: '',
    dob: '',
    gender: 'Male',
    address: '',
    ssn: '',
    incidentDate: '',
    exposure: '',
    symptoms: '',
    diagnosis: '',
    hospital: '',
    attorney: '',
    caseDetails: ''
  });

  // Detailed Modal Tab State
  const [activeFormTab, setActiveFormTab] = useState<'personal' | 'case'>('personal');

  // Lead Profile Sub-states
  const [newNoteText, setNewNoteText] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [docUploadFolder, setDocUploadFolder] = useState('Medical Records');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // CSV Importer Hook
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
    handleDownloadTemplate
  } = useCsvImport(showToast);

  // Synchronize URL filters
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam !== null) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  // Auto-open lead profile if ID query parameter matches
  useEffect(() => {
    const leadIdParam = searchParams.get('id');
    if (leadIdParam && leads.length > 0) {
      const match = leads.find(l => l.id === leadIdParam || l.leadId === leadIdParam);
      if (match) {
        handleViewLeadProfile(match);
      }
    }
  }, [searchParams, leads]);

  // Gather unique states dynamically for filter
  const uniqueStates = useMemo(() => {
    const states = leads.map((l: any) => l.state).filter(Boolean);
    return Array.from(new Set(states)).sort();
  }, [leads]);

  // Trigger Add Lead from URL ?add=true
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  // Set default select campaign / vendor on mount / options load
  useEffect(() => {
    if (campaigns.length > 0 && !formData.campaignId) {
      setFormData(prev => ({ ...prev, campaignId: campaigns[0].id }));
    }
    if (vendors.length > 0 && !formData.vendorId) {
      setFormData(prev => ({ ...prev, vendorId: vendors[0].id }));
    }
  }, [campaigns, vendors, formData.campaignId, formData.vendorId]);

  // Load Lead Detailed Profile
  const handleViewLeadProfile = (lead: any) => {
    const targetId = lead.id || lead.leadId;
    router.push(`/admin/leads/${targetId}`);
  };

  const handleRefreshProfile = async () => {
    if (!selectedLead) return;
    try {
      const res = await api.get(`/leads/${selectedLead.id}`);
      setLeadDetails(res.data.lead);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (nextStatus: string) => {
    if (!selectedLead) return;
    try {
      await api.put(`/leads/${selectedLead.id}`, { status: nextStatus });
      showToast(`Status updated to ${nextStatus}`, 'success');
      fetchData();
      handleRefreshProfile();
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leads', formData);
      showToast('Lead created successfully!', 'success');
      setShowAddModal(false);
      fetchData();
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        state: 'CA',
        priority: 'MEDIUM',
        status: 'NEW',
        campaignId: campaigns[0]?.id || '',
        vendorId: vendors[0]?.id || '',
        lawFirmId: '',
        dob: '',
        gender: 'Male',
        address: '',
        ssn: '',
        incidentDate: '',
        exposure: '',
        symptoms: '',
        diagnosis: '',
        hospital: '',
        attorney: '',
        caseDetails: ''
      });
      setActiveFormTab('personal');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create lead', 'error');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${leadId}`);
      showToast('Lead deleted successfully', 'success');
      fetchData();
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
        setLeadDetails(null);
      }
    } catch (e) {
      showToast('Failed to delete lead', 'error');
    }
  };

  const handleDeleteMultipleLeads = async (leadIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${leadIds.length} selected lead(s)?`)) return;
    try {
      await Promise.all(leadIds.map((id) => api.delete(`/leads/${id}`).catch((err) => err)));
      leadIds.forEach((id) => {
        useCRMStore.getState().deleteLead(id);
      });
      showToast(`${leadIds.length} lead(s) deleted successfully`, 'success');
      fetchData();
      if (selectedLead && leadIds.includes(selectedLead.id)) {
        setSelectedLead(null);
        setLeadDetails(null);
      }
    } catch (e) {
      showToast('Failed to delete selected leads', 'error');
    }
  };

  // PROFILE SUB-TAB: NOTES MANAGEMENT
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedLead) return;
    try {
      await api.post(`/leads/${selectedLead.id}/activity`, {
        action: 'NOTE_ADDED',
        details: newNoteText
      });
      setNewNoteText('');
      showToast('Note added successfully!', 'success');
      handleRefreshProfile();
    } catch (err) {
      showToast('Failed to save note', 'error');
    }
  };

  // PROFILE SUB-TAB: DOCUMENT UPLOADING / OCR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLead) return;

    let ocrResult = `[OCR AUTOMATED SCAN] DOCUMENT TYPE: ${docUploadFolder.toUpperCase()}.\nFile metadata name: ${file.name}.\nDate parsed: ${new Date().toLocaleDateString()}.\nIdentified client: ${selectedLead.firstName} ${selectedLead.lastName}.\nJurisdiction check: Passed.\nContent evaluation: MATCHES CRITERIA.`;

    try {
      await api.post('/documents', {
        name: file.name,
        url: `/mock-files/${file.name}`,
        folder: docUploadFolder,
        ocrText: ocrResult,
        approvalStatus: 'APPROVED',
        leadId: selectedLead.id
      });

      await api.post(`/leads/${selectedLead.id}/activity`, {
        action: 'DOCUMENT_UPLOADED',
        details: `Uploaded document "${file.name}" to folder "${docUploadFolder}"`
      });

      showToast('Document uploaded and OCR processed!', 'success');
      handleRefreshProfile();
    } catch (err) {
      showToast('Failed to upload document', 'error');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      showToast('Document removed', 'success');
      handleRefreshProfile();
    } catch (e) {
      showToast('Failed to delete document', 'error');
    }
  };

  // PROFILE SUB-TAB: TASK CHECKLIST
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedLead) return;
    try {
      await api.post('/tasks', {
        title: newTaskTitle,
        dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : new Date(Date.now() + 86400000).toISOString(),
        priority: newTaskPriority,
        leadId: selectedLead.id,
        description: 'Lead follow up task reminder'
      });
      setNewTaskTitle('');
      setNewTaskDueDate('');
      showToast('Task reminder created!', 'success');
      handleRefreshProfile();
    } catch (err) {
      showToast('Failed to create task', 'error');
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
      showToast(nextStatus === 'COMPLETED' ? 'Task marked as completed' : 'Task opened', 'success');
      handleRefreshProfile();
    } catch (err) {
      showToast('Failed to update task status', 'error');
    }
  };

  // EXPORT EXCEL (CSV DOWNLOAD)
  const handleExportCSV = (exportMode: 'all' | 'filtered') => {
    const listToExport = exportMode === 'all' ? leads : filteredLeads;
    if (listToExport.length === 0) {
      showToast('No leads available to export.', 'error');
      return;
    }

    const headers = [
      'Lead ID',
      'First Name',
      'Last Name',
      'Phone',
      'Email',
      'State',
      'Status',
      'Priority',
      'Campaign',
      'Vendor',
      'SSN',
      'DOB',
      'Gender',
      'Address',
      'Case Details',
      'Lead Score',
      'AI Summary',
      'Duplicate Detected',
      'Incident Date',
      'Exposure',
      'Symptoms',
      'Diagnosis',
      'Hospital',
      'Attorney',
      'Created At'
    ];
    const csvRows = [headers.join(',')];

    listToExport.forEach((l: any) => {
      const row = [
        escapeCSV(l.leadId),
        escapeCSV(l.firstName),
        escapeCSV(l.lastName),
        escapeCSV(l.phone),
        escapeCSV(l.email),
        escapeCSV(l.state),
        escapeCSV(l.status),
        escapeCSV(l.priority),
        escapeCSV(l.campaign?.name || l.campaignName || 'N/A'),
        escapeCSV(l.vendor?.name || l.vendorName || 'N/A'),
        escapeCSV(l.ssn),
        escapeCSV(l.dob),
        escapeCSV(l.gender),
        escapeCSV(l.address),
        escapeCSV(l.caseDetails),
        escapeCSV(l.leadScore),
        escapeCSV(l.aiSummary),
        escapeCSV(l.duplicateDetected ? 'Yes' : 'No'),
        escapeCSV(l.incidentDate),
        escapeCSV(l.exposure),
        escapeCSV(l.symptoms),
        escapeCSV(l.diagnosis),
        escapeCSV(l.hospital),
        escapeCSV(l.attorney),
        escapeCSV(l.createdAt)
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MassCore_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads exported successfully!', 'success');
  };

  // FILTER COMPUTATIONS
  const filteredLeads = leads.filter((lead: any) => {
    const matchSearch =
      `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.leadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.campaign?.name && lead.campaign.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter ? lead.status === statusFilter : true;
    const matchPriority = priorityFilter ? lead.priority === priorityFilter : true;
    const matchState = stateFilter ? lead.state === stateFilter : true;
    const matchCampaign = campaignFilter ? lead.campaignId === campaignFilter : true;
    const matchVendor = vendorFilter ? lead.vendorId === vendorFilter : true;

    if (user?.role === 'Vendor') {
      return matchSearch && matchStatus && matchPriority && matchState && matchCampaign && matchVendor && lead.vendorId === user.vendorId;
    }
    if (user?.role === 'Law Firm' || user?.role === 'Attorney') {
      return matchSearch && matchStatus && matchPriority && matchState && matchCampaign && matchVendor && lead.lawFirmId === user.lawFirmId;
    }

    return matchSearch && matchStatus && matchPriority && matchState && matchCampaign && matchVendor;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = filteredLeads.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
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

      {!selectedLead ? (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads Ingestion Pipeline</h1>
              <p className="text-sm text-slate-500">
                Track client intake, qualify status details, and allocate cases.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" /> CSV Import
              </button>
              <button
                onClick={() => handleExportCSV('filtered')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Lead
              </button>
            </div>
          </div>

          <LeadsListTable
            campaigns={campaigns}
            vendors={vendors}
            uniqueStates={uniqueStates}
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
            vendorFilter={vendorFilter}
            setVendorFilter={setVendorFilter}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            filteredLeadsCount={filteredLeads.length}
            paginatedLeads={paginatedLeads}
            onViewLeadProfile={handleViewLeadProfile}
            onDeleteLead={handleDeleteLead}
            onDeleteMultipleLeads={handleDeleteMultipleLeads}
          />
        </>
      ) : (
        <LeadProfileView
          selectedLead={selectedLead}
          setSelectedLead={setSelectedLead}
          leadDetails={leadDetails}
          setLeadDetails={setLeadDetails}
          isLoadingDetails={isLoadingDetails}
          activeProfileTab={activeProfileTab}
          setActiveProfileTab={setActiveProfileTab}
          docUploadFolder={docUploadFolder}
          setDocUploadFolder={setDocUploadFolder}
          newNoteText={newNoteText}
          setNewNoteText={setNewNoteText}
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          newTaskDueDate={newTaskDueDate}
          setNewTaskDueDate={setNewTaskDueDate}
          newTaskPriority={newTaskPriority}
          setNewTaskPriority={setNewTaskPriority}
          fileInputRef={fileInputRef}
          onRefreshProfile={handleRefreshProfile}
          onUpdateStatus={handleUpdateStatus}
          onAddNote={handleAddNote}
          onFileUpload={handleFileUpload}
          onDeleteDocument={handleDeleteDocument}
          onPreviewDoc={setPreviewDoc}
          onCreateTask={handleCreateTask}
          onToggleTaskStatus={handleToggleTaskStatus}
          onDownloadSimulate={() => showToast('Simulating document download...', 'success')}
        />
      )}

      <AddLeadModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        formData={formData}
        setFormData={setFormData}
        activeFormTab={activeFormTab}
        setActiveFormTab={setActiveFormTab}
        campaigns={campaigns}
        vendors={vendors}
        onCreateLead={handleCreateLead}
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

      <OcrPreviewModal
        previewDoc={previewDoc}
        setPreviewDoc={setPreviewDoc}
      />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 w-full items-center justify-center ">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <LeadsPageContent />
    </Suspense>
  );
}
