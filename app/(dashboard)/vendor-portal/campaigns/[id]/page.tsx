'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Search, Filter, FolderKanban, Users, CheckCircle2,
  Percent, DollarSign, Calendar, Tag, Activity, Phone, Mail, MapPin, ChevronLeft, ChevronRight, Upload
} from 'lucide-react';
import api from '../../../../../lib/api';
import { useCRMStore } from '../../../../../store/crmStore';
import { useAuthStore } from '../../../../../store/authStore';
import CsvImportModal from '../../../../../components/admin/leads/CsvImportModal';
import useCsvImport from '../../../admin/leads/useCsvImport';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VendorCampaignDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const { campaigns: storeCampaigns, leads: storeLeads, fetchCampaigns, fetchLeads } = useCRMStore();

  const [campaign, setCampaign] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state for leads table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const vendorId = user?.vendorId || 'ven-1';

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

  useEffect(() => {
    let isMounted = true;
    async function loadCampaignDetails() {
      setIsLoading(true);
      try {
        // Try fetching campaign details from backend API
        const res = await api.get(`/campaigns/${id}`);
        if (res.data?.success && res.data?.campaign) {
          if (isMounted) {
            setCampaign(res.data.campaign);
            setLeads(res.data.campaign.leads || []);
          }
        }
      } catch (err) {
        console.warn('API error fetching campaign detail, falling back to CRM store...', err);
        // Fallback to store data
        await Promise.all([fetchCampaigns(), fetchLeads()]);
        const found = storeCampaigns.find((c: any) => c.id === id);
        if (found && isMounted) {
          setCampaign(found);
          const matchedLeads = storeLeads.filter(
            (l: any) => l.campaignId === id || l.campaignName === found.name
          );
          setLeads(matchedLeads);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCampaignDetails();

    return () => {
      isMounted = false;
    };
  }, [id, fetchCampaigns, fetchLeads, storeCampaigns, storeLeads]);

  // Combine API leads with store leads if needed
  const campaignLeads = useMemo(() => {
    if (leads.length > 0) return leads;
    return storeLeads.filter((l: any) => l.campaignId === id || (campaign && l.campaignName === campaign.name));
  }, [leads, storeLeads, id, campaign]);

  // Filter leads by search term & status
  const filteredLeads = useMemo(() => {
    return campaignLeads.filter((l: any) => {
      const leadName = `${l.firstName || ''} ${l.lastName || ''}`.toLowerCase();
      const email = (l.email || '').toLowerCase();
      const phone = (l.phone || '').toLowerCase();
      const leadId = (l.leadId || '').toLowerCase();
      const city = (l.city || '').toLowerCase();
      const state = (l.state || '').toLowerCase();

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        leadName.includes(search) ||
        email.includes(search) ||
        phone.includes(search) ||
        leadId.includes(search) ||
        city.includes(search) ||
        state.includes(search);

      const matchesStatus = statusFilter === '' || l.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaignLeads, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = filteredLeads.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Compute Campaign KPIs
  const totalLeadsCount = campaignLeads.length;
  const qualifiedLeadsCount = campaignLeads.filter((l: any) =>
    ['QUALIFIED', 'SIGNED_RETAINER'].includes(l.status)
  ).length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((qualifiedLeadsCount / totalLeadsCount) * 100) : 0;
  const budget = campaign?.budget || 0;
  const costPerLeadTarget = campaign?.costPerLeadTarget || 0;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <FolderKanban className="h-16 w-16 text-slate-400 dark:text-slate-600" />
        <h2 className="mt-4 text-xl font-bold">Campaign Not Found</h2>
        <p className="mt-1 text-sm text-slate-500">The requested campaign does not exist or you do not have permission to view it.</p>
        <Link
          href="/vendor-portal/campaigns"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Campaigns
        </Link>
      </div>
    );
  }

  const tortName = campaign.massTort?.name || campaign.tortName || 'General Mass Tort';

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Button */}
      <div>
        <Link
          href="/vendor-portal/campaigns"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Campaigns
        </Link>
      </div>

      {/* Main Campaign Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                campaign.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : campaign.status === 'PAUSED'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-slate-500/10 text-slate-500'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  campaign.status === 'ACTIVE' ? 'bg-emerald-500' : campaign.status === 'PAUSED' ? 'bg-amber-500' : 'bg-slate-500'
                }`} />
                {campaign.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {campaign.description || 'Dedicated media campaign targeting qualified mass tort lead volume.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                <Tag className="h-3.5 w-3.5" />
                {tortName}
              </span>
              {campaign.marketingSource && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-medium text-slate-600 dark:text-slate-300">
                  <Activity className="h-3.5 w-3.5 text-indigo-400" />
                  Channel: {campaign.marketingSource}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 md:border-t-0 md:pt-0">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-right">
              <span className="text-xs text-slate-400 block font-medium uppercase">Budget Cap</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">${budget.toLocaleString()}</span>
            </div>
            {costPerLeadTarget > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-right">
                <span className="text-xs text-slate-400 block font-medium uppercase">Target CPL</span>
                <span className="text-lg font-bold text-indigo-500">${costPerLeadTarget}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads Ingested</span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">{totalLeadsCount}</h3>
            <p className="mt-1 text-xs text-slate-400">Submissions under this campaign</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Qualified Leads</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">{qualifiedLeadsCount}</h3>
            <p className="mt-1 text-xs text-slate-400">Qualified & Retainer signed</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversion Rate</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-indigo-500">{conversionRate}%</h3>
            <p className="mt-1 text-xs text-slate-400">Ingestion to qualification ratio</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Expected Lead Goal</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">{campaign.expectedLeadTarget || 50}</h3>
            <p className="mt-1 text-xs text-slate-400">Target Volume Allocation</p>
          </div>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        {/* Filter Bar */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-850 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold">Campaign Leads Ingested</h2>
            <p className="text-xs text-slate-400">All database submissions originating from this campaign.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, city..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50/50 py-2 pr-4 pl-10 text-xs outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-black dark:border-slate-800 dark:bg-slate-950 dark:focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-xl border border-slate-200 bg-[#020618] px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">All Statuses</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="SIGNED_RETAINER">Signed Retainer</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <button
              onClick={() => { setShowImportModal(true); setCsvStep('upload'); }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-primary hover:bg-primary/5 hover:text-primary transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-primary dark:hover:bg-primary/10 dark:hover:text-primary active:scale-[0.98]"
            >
              <Upload className="h-3.5 w-3.5" />
              Import CSV Leads
            </button>
          </div>
        </div>

        {/* Table Content */}
        {paginatedLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-4 text-base font-semibold">No leads found</h3>
            <p className="mt-1 text-xs text-slate-500">
              {searchTerm || statusFilter
                ? 'Try adjusting your search criteria or status filter.'
                : 'No leads have been generated under this campaign yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-850 dark:bg-slate-950/20">
                  <th className="p-4 font-semibold">Lead ID & Name</th>
                  <th className="p-4 font-semibold">Contact Information</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Quality Score</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {paginatedLeads.map((l: any) => {
                  const leadName = `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Anonymous Lead';
                  const createdDate = l.createdAt
                    ? new Date(l.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'N/A';

                  return (
                    <tr key={l.id || l.leadId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150">
                      <td className="p-4 font-medium">
                        <div className="font-semibold text-slate-900 dark:text-white">{leadName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{l.leadId || l.id}</div>
                      </td>

                      <td className="p-4 space-y-1">
                        {l.email && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Mail className="h-3 w-3 text-slate-500" />
                            <span>{l.email}</span>
                          </div>
                        )}
                        {l.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="h-3 w-3 text-slate-500" />
                            <span>{l.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-300">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{[l.city, l.state].filter(Boolean).join(', ') || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          (l.leadScore || 70) >= 80
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : (l.leadScore || 70) >= 60
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          Score: {l.leadScore || 75}/100
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          ['QUALIFIED', 'SIGNED_RETAINER'].includes(l.status)
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : l.status === 'CONTACTED'
                            ? 'bg-indigo-500/10 text-indigo-500'
                            : l.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            ['QUALIFIED', 'SIGNED_RETAINER'].includes(l.status)
                              ? 'bg-emerald-500'
                              : l.status === 'CONTACTED'
                              ? 'bg-indigo-500'
                              : l.status === 'REJECTED'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`} />
                          {l.status}
                        </span>
                      </td>

                      <td className="p-4 text-right text-slate-400 font-mono text-[11px]">
                        {createdDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredLeads.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-850">
            <span className="text-xs text-slate-500">
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold px-2">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
