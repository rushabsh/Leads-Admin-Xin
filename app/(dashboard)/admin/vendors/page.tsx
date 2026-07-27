'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Edit2, Trash2, Check, X,
  Contact, Mail, Phone, MapPin, Activity, ChevronLeft, ChevronRight, BarChart3, FolderKanban
} from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import api from '../../../../lib/api';
interface VendorData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  leads?: any[];
  campaigns?: any[];
  invoices?: any[];
  users?: any[];
}

export default function VendorsPage() {
  const { vendors: rawVendors, fetchData, isLoading } = useCRMStore();
  const vendors = rawVendors as any[] as VendorData[];

  // Search, filter, pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE',
    contactPerson: '',
    username: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'ACTIVE',
      contactPerson: '',
      username: '',
      password: ''
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (vendor: VendorData) => {
    setEditingVendor(vendor);
    const associatedUser = vendor.users?.[0];
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone || '',
      address: vendor.address || '',
      status: vendor.status,
      contactPerson: associatedUser?.name || '',
      username: associatedUser?.username || '',
      password: '',
    });
    setShowAddEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingVendor) {
        await api.put(`/vendors/${editingVendor.id}`, formData);
        showToast('Vendor updated successfully!', 'success');
      } else {
        await api.post('/vendors', formData);
        showToast('Vendor created successfully!', 'success');
      }
      setShowAddEditModal(false);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error processing request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor? This will unassign its related campaigns.')) return;
    try {
      await api.delete(`/vendors/${id}`);
      showToast('Vendor deleted successfully!', 'success');
      fetchData();
    } catch (error: any) {
      showToast('Failed to delete vendor.', 'error');
    }
  };

  // Filter & Search
  const filteredVendors = vendors.filter(vendor => {
    const matchSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.phone && vendor.phone.includes(searchTerm));
    const matchStatus = statusFilter === '' || vendor.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage) || 1;
  const paginatedVendors = filteredVendors.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // KPIs
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'ACTIVE').length;
  const totalLeadsGen = vendors.reduce((acc, v) => acc + (v.leads?.length || 0), 0);

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80 } }
  };

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

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure third-party lead generation providers, API endpoints, and ingestion metrics.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Vendor
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Media Vendors</span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Contact className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">{totalVendors}</h3>
            <p className="mt-1 text-xs text-slate-400">Registered media agencies</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Ingestion</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">{activeVendors}</h3>
            <p className="mt-1 text-xs text-slate-400">Actively pushing API leads</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Ingested Leads</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">{totalLeadsGen}</h3>
            <p className="mt-1 text-xs text-slate-400">Historical count received</p>
          </div>
        </motion.div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-[#020618] shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        {/* Filters */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-850 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vendor name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#020618] py-2.5 pr-4 pl-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950 dark:focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="" >All Status</option>
              <option value="ACTIVE" >Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : paginatedVendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Contact className="h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-4 text-lg font-semibold">No Vendors registered</h3>
            <p className="mt-1 text-sm text-slate-500">Create a vendor to ingest and monitor media acquisition campaign data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-850 dark:bg-slate-950/20">
                  <th className="p-4 font-semibold">Vendor Name</th>
                  <th className="p-4 font-semibold">Contact Person</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Phone</th>
                  <th className="p-4 font-semibold">Login ID</th>
                  <th className="p-4 font-semibold">Campaigns</th>
                  <th className="p-4 font-semibold">Leads</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {paginatedVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <Contact className="h-4.5 w-4.5" />
                        </div>
                        <span>{vendor.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-600 dark:text-slate-300">{vendor.users?.[0]?.name || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{vendor.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{vendor.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                        {vendor.users?.[0]?.username || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <FolderKanban className="h-3.5 w-3.5 text-slate-400" />
                        {vendor.campaigns?.length || 0}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-primary">
                      {vendor.leads?.length || 0}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${vendor.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-500/10 text-slate-500'
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${vendor.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-500'
                          }`} />
                        {vendor.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(vendor)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredVendors.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 p-5 dark:border-slate-850">
            <span className="text-xs text-slate-500">
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredVendors.length)} of {filteredVendors.length} vendors
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

      {/* Add / Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-850 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-850">
              <h3 className="text-lg font-bold">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h3>
              <button onClick={() => setShowAddEditModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vendor/Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Premier Leads LLC"
                  className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact Person Name</label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g. Alex Vendor Manager"
                  className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@premierleads.com"
                  className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 012-3456"
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] px-3 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 500 Broadway, New York, NY"
                  className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] text-white px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Username / Login ID</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. vendoruser"
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-[#020618] text-white px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                  <input
                    type="password"
                    required={!editingVendor}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingVendor ? "Leave blank to keep same" : "••••••••"}
                    className="mt-1 block w-full rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 outline-none focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
