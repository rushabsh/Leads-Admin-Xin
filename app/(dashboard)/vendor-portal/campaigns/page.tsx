'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Search, Filter, ChevronLeft, ChevronRight,
    FolderKanban, DollarSign, Activity, Percent, ArrowUpDown, Eye
} from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import { useAuthStore } from '../../../../store/authStore';

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
    tortName?: string;
    vendorId?: string;
    vendorName?: string;
}

export default function VendorCampaignsPage() {
    const { user } = useAuthStore();
    const { campaigns: rawCampaigns, leads, fetchCampaigns, fetchLeads, isLoading } = useCRMStore();
    const campaigns = rawCampaigns as any[] as (CampaignData & { massTort?: any; vendor?: any })[];

    const vendorId = user?.vendorId || 'ven-1';

    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortField, setSortField] = useState<keyof CampaignData>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchCampaigns();
        fetchLeads();
    }, [fetchCampaigns, fetchLeads]);

    // Filter campaigns assigned to this vendor
    const vendorLeads = leads.filter(l => l.vendorId === vendorId);
    const vendorCampaigns = campaigns.filter(c =>
        c.vendorId === vendorId ||
        c.vendor?.id === vendorId ||
        c.vendorName === user?.name ||
        c.vendor?.name === user?.name ||
        vendorLeads.some(vl => vl.campaignId === c.id) ||
        (user?.roleName === 'Vendor')
    );

    // Search & Status filters
    const filteredCampaigns = vendorCampaigns.filter(c => {
        const tort = c.tortName || c.massTort?.name || '';
        const matchSearch =
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            tort.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === '' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Sorting
    const requestSort = (field: keyof CampaignData) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortField === field && sortDirection === 'asc') {
            direction = 'desc';
        }
        setSortField(field);
        setSortDirection(direction);
    };

    const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return sortDirection === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedCampaigns.length / itemsPerPage) || 1;
    const paginatedCampaigns = sortedCampaigns.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // KPIs
    const totalBudget = vendorCampaigns.reduce((acc, c) => acc + c.budget, 0);
    const activeCampaignsCount = vendorCampaigns.filter(c => c.status === 'ACTIVE').length;
    const totalVendorLeadsCount = vendorLeads.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Campaigns</h1>
                <p className="text-sm text-slate-500">
                    Monitor media spend budgets, lead volume ingestion, and qualification metrics.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Channels</span>
                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                            <Activity className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-bold text-slate-900">{activeCampaignsCount} / {vendorCampaigns.length}</h3>
                        <p className="mt-1 text-xs text-slate-500">Campaigns generating leads</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Leads Generated</span>
                        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                            <Percent className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-bold text-slate-900">{totalVendorLeadsCount}</h3>
                        <p className="mt-1 text-xs text-slate-500">Historical database submissions</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Allocated Campaigns</span>
                        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                            <Percent className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-bold text-slate-900">{vendorCampaigns.length}</h3>
                        <p className="mt-1 text-xs text-slate-500">Historical Allocated Campaigns</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Campaigns </span>
                        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                            <Percent className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-bold text-slate-900">{campaigns.length}</h3>
                        <p className="mt-1 text-xs text-slate-500">Total Campaigns Database</p>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Filters Header */}
                <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-5 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, mass tort..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 shadow-xs"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PAUSED">Paused</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Table Content */}
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : paginatedCampaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <FolderKanban className="h-12 w-12 text-slate-300" />
                        <h3 className="mt-4 text-sm font-bold text-slate-900">No campaigns found</h3>
                        <p className="mt-1 text-xs text-slate-500">Contact admin to set up campaigns mapping.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                                    <th onClick={() => requestSort('name')} className="cursor-pointer p-4 hover:text-blue-600 transition-colors">
                                        Campaign Name <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                                    </th>
                                    <th className="p-4">Mass Tort</th>
                                    <th onClick={() => requestSort('budget')} className="cursor-pointer p-4 hover:text-blue-600 transition-colors">
                                        Budget Allocation <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                                    </th>
                                    <th onClick={() => requestSort('leadCount')} className="cursor-pointer p-4 hover:text-blue-600 transition-colors">
                                        Leads Ingested <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                                    </th>
                                    <th onClick={() => requestSort('conversionRate')} className="cursor-pointer p-4 hover:text-blue-600 transition-colors">
                                        Conv. Rate <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                                    </th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedCampaigns.map((camp) => (
                                    <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">
                                            <div>
                                                <Link 
                                                    href={`/vendor-portal/campaigns/${camp.id}`}
                                                    className="hover:text-blue-600 transition-colors font-bold"
                                                >
                                                    {camp.name}
                                                </Link>
                                                {camp.description && <div className="text-xs font-normal text-slate-400 mt-0.5">{camp.description}</div>}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 border border-blue-200">
                                                {camp.tortName || camp.massTort?.name || 'No tort'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold text-slate-900">${camp.budget.toLocaleString()}</td>
                                        <td className="p-4 font-semibold text-slate-700">{camp.leadCount || 0}</td>
                                        <td className="p-4 font-semibold text-indigo-600">{camp.conversionRate || 0}%</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${camp.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : camp.status === 'PAUSED'
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${camp.status === 'ACTIVE'
                                                    ? 'bg-emerald-600'
                                                    : camp.status === 'PAUSED'
                                                        ? 'bg-amber-600'
                                                        : 'bg-slate-500'
                                                    }`} />
                                                {camp.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/vendor-portal/campaigns/${camp.id}`}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                View Leads
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                {filteredCampaigns.length > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-100 p-5">
                        <span className="text-xs text-slate-500">
                            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
