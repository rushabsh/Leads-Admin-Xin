'use client';

import React from 'react';
import {
  ChevronLeft, Edit2, Trash2, Building2, Users, Scale, CreditCard,
  FolderKanban, FileText, PlusCircle, Mail, Phone
} from 'lucide-react';

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

interface LawFirmProfileViewProps {
  selectedLawFirm: LawFirmData;
  onBack: () => void;
  activeProfileTab: 'overview' | 'attorneys' | 'cases' | 'payments' | 'documents' | 'leads';
  setActiveProfileTab: (val: 'overview' | 'attorneys' | 'cases' | 'payments' | 'documents' | 'leads') => void;
  firmAttorneys: any[];
  isLoadingAttorneys: boolean;
  onOpenEditModal: (firm: LawFirmData) => void;
  onDeleteLawFirm: (id: string) => void;
  onOpenAddAttorney: () => void;
  onOpenEditAttorney: (attorney: any) => void;
  onDeleteAttorney: (id: string) => void;
}

export default function LawFirmProfileView({
  selectedLawFirm,
  onBack,
  activeProfileTab,
  setActiveProfileTab,
  firmAttorneys,
  isLoadingAttorneys,
  onOpenEditModal,
  onDeleteLawFirm,
  onOpenAddAttorney,
  onOpenEditAttorney,
  onDeleteAttorney
}: LawFirmProfileViewProps) {
  return (
    <div className="space-y-6">
      {/* Header & Back Navigation */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4 border-slate-100 dark:border-slate-850">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4.5 w-4.5" /> Back to Law Firms
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onOpenEditModal(selectedLawFirm)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900"
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit details
          </button>
          <button
            onClick={() => onDeleteLawFirm(selectedLawFirm.id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-950 dark:bg-rose-950/20"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Partner
          </button>
        </div>
      </div>

      {/* Firm summary cover */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-primary/10 p-4 text-primary shrink-0">
            <Building2 className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">{selectedLawFirm.name}</h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold ${
                  selectedLawFirm.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-slate-500/10 text-slate-500'
                }`}
              >
                {selectedLawFirm.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              ID: {selectedLawFirm.id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-850">
          <div className="text-center md:text-left px-2">
            <span className="text-2xs font-semibold text-slate-450 uppercase block">Attorneys</span>
            <span className="text-lg font-bold">{firmAttorneys.length}</span>
          </div>
          <div className="text-center md:text-left px-2 border-l border-slate-100 dark:border-slate-850">
            <span className="text-2xs font-semibold text-slate-455 uppercase block">Cases Council</span>
            <span className="text-lg font-bold">{selectedLawFirm.cases?.length || 0}</span>
          </div>
          <div className="text-center md:text-left px-2 border-l border-slate-100 dark:border-slate-850">
            <span className="text-2xs font-semibold text-slate-455 uppercase block">Leads Assigned</span>
            <span className="text-lg font-bold">{selectedLawFirm.leads?.length || 0}</span>
          </div>
          <div className="text-center md:text-left px-2 border-l border-slate-100 dark:border-slate-850">
            <span className="text-2xs font-semibold text-slate-455 uppercase block">Unpaid Bills</span>
            <span className="text-lg font-bold text-rose-500">
              {selectedLawFirm.invoices?.filter((i) => i.status !== 'PAID').length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
        {[
          { id: 'overview', label: 'Firm Details & Summary', icon: Building2 },
          { id: 'attorneys', label: 'Council Attorneys', icon: Users },
          { id: 'cases', label: 'Cases Received', icon: Scale },
          { id: 'payments', label: 'Payment / Invoices', icon: CreditCard },
          { id: 'leads', label: 'Assigned Leads', icon: FolderKanban },
          { id: 'documents', label: 'Contracts & Docs', icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveProfileTab(tab.id as any)}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-all duration-200 whitespace-nowrap focus:outline-none ${
              activeProfileTab === tab.id
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      <div className="min-h-80">
        {activeProfileTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-455 border-b pb-2 border-slate-100 dark:border-slate-850">
                Partner Contact Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Primary Contact Email</span>
                  <a
                    href={`mailto:${selectedLawFirm.email}`}
                    className="font-semibold text-primary hover:underline mt-0.5 block"
                  >
                    {selectedLawFirm.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Direct Office Phone</span>
                  <span className="font-semibold mt-0.5 block">{selectedLawFirm.phone || 'N/A'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block font-medium">Headquarters Address</span>
                  <span className="font-semibold mt-0.5 block">{selectedLawFirm.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-455 border-b pb-2 border-slate-100 dark:border-slate-850">
                Council Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Created</span>
                  <span className="font-semibold">
                    {new Date(selectedLawFirm.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Leads Ingestion</span>
                  <span className="font-semibold">{selectedLawFirm.leads?.length || 0} leads</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Cases Active</span>
                  <span className="font-semibold">{selectedLawFirm.cases?.length || 0} cases</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Billings Received</span>
                  <span className="font-semibold text-emerald-500">
                    $
                    {(
                      selectedLawFirm.cases?.reduce((sum, c) => sum + (c.settlementAmount || 0), 0) || 0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeProfileTab === 'attorneys' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-455">
                Firm Council Attorneys
              </h3>
              <button
                onClick={onOpenAddAttorney}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/95"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Add Attorney
              </button>
            </div>

            {isLoadingAttorneys ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : firmAttorneys.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-850">
                <Users className="mx-auto h-8 w-8 text-slate-355 dark:text-slate-700" />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  No attorneys registered for this law firm.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {firmAttorneys.map((att) => (
                  <div
                    key={att.id}
                    className="rounded-xl border border-slate-150 bg-white p-4 shadow-2xs dark:border-slate-850 dark:bg-slate-900/40 flex justify-between items-start gap-2"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">{att.name}</p>
                      <p className="text-2xs text-slate-450 font-mono">{att.email}</p>
                      {att.phone && <p className="text-2xs text-slate-550">{att.phone}</p>}
                      <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-3xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-450 font-mono">
                        Login ID: {att.username || att.email.split('@')[0]}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onOpenEditAttorney(att)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-primary dark:hover:bg-slate-850"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAttorney(att.id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-rose-500 dark:hover:bg-slate-850"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeProfileTab === 'cases' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-850 dark:bg-slate-955/20">
                  <th className="p-4 font-semibold">Case Number</th>
                  <th className="p-4 font-semibold">Medical Records Status</th>
                  <th className="p-4 font-semibold">Settlement Amount</th>
                  <th className="p-4 font-semibold">Jurisdiction / Court</th>
                  <th className="p-4 font-semibold">Transferred At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {!selectedLawFirm.cases || selectedLawFirm.cases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No litigation cases transferred to this firm yet.
                    </td>
                  </tr>
                ) : (
                  selectedLawFirm.cases.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{c.caseNumber}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold ${
                            c.medicalRecordsStatus === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {c.medicalRecordsStatus}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-500">
                        ${(c.settlementAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-650 dark:text-slate-400">
                        {c.courtDetails || 'State Court (Pending)'}
                      </td>
                      <td className="p-4 text-slate-450">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeProfileTab === 'payments' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-855 dark:bg-slate-950/20">
                  <th className="p-4 font-semibold">Invoice ID</th>
                  <th className="p-4 font-semibold">Billing Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Due Date</th>
                  <th className="p-4 font-semibold">Billing Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {!selectedLawFirm.invoices || selectedLawFirm.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No billing history or invoices found for this partner.
                    </td>
                  </tr>
                ) : (
                  selectedLawFirm.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="p-4 font-semibold font-mono text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-4 font-bold">${inv.amount.toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-650 dark:text-slate-400">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-450">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeProfileTab === 'leads' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-550 dark:border-slate-850 dark:bg-slate-950/20">
                  <th className="p-4 font-semibold">Lead ID</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Phone</th>
                  <th className="p-4 font-semibold">Priority</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {!selectedLawFirm.leads || selectedLawFirm.leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No leads currently assigned to this law firm.
                    </td>
                  </tr>
                ) : (
                  selectedLawFirm.leads.map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="p-4 font-semibold font-mono text-slate-900 dark:text-white">
                        {l.leadId}
                      </td>
                      <td className="p-4 font-bold">
                        {l.firstName} {l.lastName}
                      </td>
                      <td className="p-4 text-slate-650 dark:text-slate-400">{l.phone}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-2xs font-semibold ${
                            l.priority === 'HIGH'
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-slate-500/10 text-slate-550'
                          }`}
                        >
                          {l.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-2xs font-semibold text-indigo-500">
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-450">{new Date(l.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeProfileTab === 'documents' && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-850 space-y-3">
            <FileText className="mx-auto h-10 w-10 text-slate-355 dark:text-slate-700" />
            <h4 className="font-semibold text-sm">Contracts & Ingest Agreements</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Transfer retainer documents, corporate SLA contracts, and attorney-client privilege agreements here.
            </p>
            <div className="pt-2">
              <button className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 font-semibold text-xs px-4 py-2">
                Upload Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
