'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import api from '../../../../lib/api';

// Extracted modular components
import LawFirmsKpis from '../../../../components/admin/lawfirms/LawFirmsKpis';
import LawFirmsListTable from '../../../../components/admin/lawfirms/LawFirmsListTable';
import LawFirmProfileView from '../../../../components/admin/lawfirms/LawFirmProfileView';
import AddEditLawFirmModal from '../../../../components/admin/lawfirms/AddEditLawFirmModal';
import AddEditAttorneyModal from '../../../../components/admin/lawfirms/AddEditAttorneyModal';

interface LawFirmData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  leads?: any[];
  cases?: any[];
  attorneys?: any[];
  invoices?: any[];
  createdAt?: string;
}

export default function LawFirmsPage() {
  const { lawFirms: storeLawFirms, fetchData, isLoading } = useCRMStore();
  const lawFirms = storeLawFirms as any[] as LawFirmData[];

  // Selected law firm for detail view (Profile)
  const [selectedLawFirm, setSelectedLawFirm] = useState<LawFirmData | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'attorneys' | 'cases' | 'payments' | 'documents' | 'leads'>('overview');

  // Search, filter, pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingLawFirm, setEditingLawFirm] = useState<LawFirmData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE'
  });

  // Attorney modal/sub-form state
  const [showAttorneyModal, setShowAttorneyModal] = useState(false);
  const [editingAttorney, setEditingAttorney] = useState<any | null>(null);
  const [attorneyFormData, setAttorneyFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
  });
  const [firmAttorneys, setFirmAttorneys] = useState<any[]>([]);
  const [isLoadingAttorneys, setIsLoadingAttorneys] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load attorneys when selected firm changes
  useEffect(() => {
    if (selectedLawFirm) {
      loadFirmAttorneys(selectedLawFirm.id);
    }
  }, [selectedLawFirm]);

  const loadFirmAttorneys = async (firmId: string) => {
    setIsLoadingAttorneys(true);
    try {
      const res = await api.get(`/law-firms/${firmId}/attorneys`);
      // Combine seeded models and user-attorneys
      const userAttorneys = res.data.data || [];
      const dbAttorneys = selectedLawFirm?.attorneys || [];
      
      // De-duplicate by email
      const combined = [...userAttorneys];
      dbAttorneys.forEach((att: any) => {
        if (!combined.some(c => c.email.toLowerCase() === att.email.toLowerCase())) {
          combined.push(att);
        }
      });

      setFirmAttorneys(combined);
    } catch (e) {
      setFirmAttorneys(selectedLawFirm?.attorneys || []);
    } finally {
      setIsLoadingAttorneys(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingLawFirm(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'ACTIVE'
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (firm: LawFirmData) => {
    setEditingLawFirm(firm);
    setFormData({
      name: firm.name,
      email: firm.email,
      phone: firm.phone || '',
      address: firm.address || '',
      status: firm.status
    });
    setShowAddEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingLawFirm) {
        await api.put(`/law-firms/${editingLawFirm.id}`, formData);
        showToast('Law Firm updated successfully!', 'success');
      } else {
        await api.post('/law-firms', formData);
        showToast('Law Firm created successfully!', 'success');
      }
      setShowAddEditModal(false);
      fetchData();
      // If we are currently viewing this profile, refresh state
      if (selectedLawFirm && selectedLawFirm.id === editingLawFirm?.id) {
        const fresh = lawFirms.find(l => l.id === selectedLawFirm.id);
        if (fresh) setSelectedLawFirm(fresh);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error processing request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this law firm? This will unassign its related cases.')) return;
    try {
      await api.delete(`/law-firms/${id}`);
      showToast('Law Firm deleted successfully!', 'success');
      fetchData();
      if (selectedLawFirm?.id === id) {
        setSelectedLawFirm(null);
      }
    } catch (error: any) {
      showToast('Failed to delete law firm.', 'error');
    }
  };

  // Attorney management handlers
  const handleOpenAddAttorney = () => {
    setEditingAttorney(null);
    setAttorneyFormData({
      name: '',
      email: '',
      phone: '',
      username: '',
    });
    setShowAttorneyModal(true);
  };

  const handleOpenEditAttorney = (attorney: any) => {
    setEditingAttorney(attorney);
    setAttorneyFormData({
      name: attorney.name,
      email: attorney.email,
      phone: attorney.phone || '',
      username: attorney.username || attorney.email.split('@')[0],
    });
    setShowAttorneyModal(true);
  };

  const handleAttorneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawFirm) return;
    setIsSubmitting(true);
    try {
      if (editingAttorney) {
        await api.put(`/law-firms/${selectedLawFirm.id}/attorneys/${editingAttorney.id}`, attorneyFormData);
        showToast('Attorney updated successfully!', 'success');
      } else {
        await api.post(`/law-firms/${selectedLawFirm.id}/attorneys`, attorneyFormData);
        showToast('Attorney added successfully!', 'success');
      }
      setShowAttorneyModal(false);
      loadFirmAttorneys(selectedLawFirm.id);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error processing attorney request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttorneyDelete = async (attorneyId: string) => {
    if (!confirm('Are you sure you want to remove this attorney?')) return;
    if (!selectedLawFirm) return;
    try {
      await api.delete(`/law-firms/${selectedLawFirm.id}/attorneys/${attorneyId}`);
      showToast('Attorney removed successfully!', 'success');
      loadFirmAttorneys(selectedLawFirm.id);
      fetchData();
    } catch (error: any) {
      showToast('Failed to remove attorney.', 'error');
    }
  };

  // Search & Filter computation
  const filteredLawFirms = lawFirms.filter(firm => {
    const matchSearch =
      firm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      firm.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (firm.phone && firm.phone.includes(searchTerm));
    const matchStatus = statusFilter === '' || firm.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredLawFirms.length / itemsPerPage) || 1;
  const paginatedLawFirms = filteredLawFirms.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // KPIs
  const totalFirms = lawFirms.length;
  const activeFirms = lawFirms.filter(f => f.status === 'ACTIVE').length;
  const totalAttorneys = lawFirms.reduce((acc, f) => acc + (f.attorneys?.length || 0), 0);
  const totalCases = lawFirms.reduce((acc, f) => acc + (f.cases?.length || 0), 0);

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

      {!selectedLawFirm ? (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Law Firms Management</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Register law firms, assign legal partners, and review case transfer logs.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add Law Firm
            </button>
          </div>

          <LawFirmsKpis
            totalFirms={totalFirms}
            activeFirms={activeFirms}
            totalAttorneys={totalAttorneys}
            totalCases={totalCases}
          />

          <LawFirmsListTable
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            isLoading={isLoading}
            paginatedLawFirms={paginatedLawFirms}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            filteredLawFirmsCount={filteredLawFirms.length}
            onSelectLawFirm={setSelectedLawFirm}
            onOpenEditModal={handleOpenEditModal}
            onDeleteLawFirm={handleDelete}
          />
        </>
      ) : (
        <LawFirmProfileView
          selectedLawFirm={selectedLawFirm}
          onBack={() => setSelectedLawFirm(null)}
          activeProfileTab={activeProfileTab}
          setActiveProfileTab={setActiveProfileTab}
          firmAttorneys={firmAttorneys}
          isLoadingAttorneys={isLoadingAttorneys}
          onOpenEditModal={handleOpenEditModal}
          onDeleteLawFirm={handleDelete}
          onOpenAddAttorney={handleOpenAddAttorney}
          onOpenEditAttorney={handleOpenEditAttorney}
          onDeleteAttorney={handleAttorneyDelete}
        />
      )}

      <AddEditLawFirmModal
        showAddEditModal={showAddEditModal}
        setShowAddEditModal={setShowAddEditModal}
        editingLawFirm={editingLawFirm}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <AddEditAttorneyModal
        showAttorneyModal={showAttorneyModal}
        setShowAttorneyModal={setShowAttorneyModal}
        editingAttorney={editingAttorney}
        attorneyFormData={attorneyFormData}
        setAttorneyFormData={setAttorneyFormData}
        isSubmitting={isSubmitting}
        onSubmit={handleAttorneySubmit}
      />
    </div>
  );
}

