'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Users, Mail, Phone, ArrowUpDown, ChevronLeft, ChevronRight,
  Trash2, Eye, FileText, CheckCircle2, ShieldCheck, Tag, X, Stethoscope, Scale, User as UserIcon
} from 'lucide-react';

interface VendorPortalLeadsTableProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  paginatedLeads: any[];
  sortedLeads: any[];
  page: number;
  setPage: (val: number | ((p: number) => number)) => void;
  totalPages: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onRequestSort: (field: any) => void;
  isLoading: boolean;
  onDeleteLead?: (leadId: string) => void;
  onDeleteMultipleLeads?: (leadIds: string[]) => void;
}

// Helper to safely parse caseDetails JSON or return structured fallback object
function parseLeadDetails(lead: any) {
  if (!lead) return null;
  if (typeof lead.caseDetails === 'string' && lead.caseDetails.trim().startsWith('{')) {
    try {
      return JSON.parse(lead.caseDetails);
    } catch (_) {}
  }
  return null;
}

export default function VendorPortalLeadsTable({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  paginatedLeads,
  sortedLeads,
  page,
  setPage,
  totalPages,
  itemsPerPage,
  sortField,
  sortDirection,
  onRequestSort,
  isLoading,
  onDeleteLead,
  onDeleteMultipleLeads
}: VendorPortalLeadsTableProps) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeDetailLead, setActiveDetailLead] = useState<any | null>(null);

  const isAllPageSelected =
    paginatedLeads.length > 0 &&
    paginatedLeads.every((lead) => selectedLeadIds.includes(lead.id));

  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageIds = new Set(paginatedLeads.map((l) => l.id));
      setSelectedLeadIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newSelected = new Set([...selectedLeadIds, ...paginatedLeads.map((l) => l.id)]);
      setSelectedLeadIds(Array.from(newSelected));
    }
  };

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    if (onDeleteMultipleLeads) {
      onDeleteMultipleLeads(selectedLeadIds);
    } else if (onDeleteLead) {
      if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected lead(s)?`)) return;
      selectedLeadIds.forEach((id) => onDeleteLead(id));
    }
    setSelectedLeadIds([]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* QUICK VIEW LEAD FOLLOW-UP DETAIL MODAL */}
      <AnimatePresence>
        {activeDetailLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-base">
                    {activeDetailLead.firstName?.[0] || 'L'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeDetailLead.firstName} {activeDetailLead.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Lead ID: {activeDetailLead.leadId} | Status: {activeDetailLead.status}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDetailLead(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Details Grid */}
              {(() => {
                const parsed = parseLeadDetails(activeDetailLead);
                const leadInfo = parsed?.leadInfo || {};
                const contactInfo = parsed?.contactInfo || {};
                const poaInfo = parsed?.poa || {};
                const diagnosisInfo = parsed?.diagnosisInfo || {};

                return (
                  <div className="space-y-6 text-xs text-slate-800">

                    {/* Section 1: Lead Information */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h4 className="font-bold text-slate-900 text-sm">1. Lead Information</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div><strong className="text-slate-500 block">Contact Name:</strong> {leadInfo.contactName || activeDetailLead.contactName || '—'}</div>
                        <div><strong className="text-slate-500 block">Campaign Name:</strong> <span className="font-semibold text-slate-800">{activeDetailLead.campaignName || activeDetailLead.campaign?.name || leadInfo.campaignName || '—'}</span></div>
                        <div><strong className="text-slate-500 block">Type:</strong> <span className="font-semibold text-blue-700">{leadInfo.type || activeDetailLead.tortName || 'PFAS'}</span></div>
                        <div><strong className="text-slate-500 block">Status:</strong> {leadInfo.status || activeDetailLead.status}</div>
                        <div><strong className="text-slate-500 block">Lead Name:</strong> {leadInfo.leadName || '—'}</div>
                        <div><strong className="text-slate-500 block">Substatus:</strong> <span className="font-semibold text-indigo-600">{leadInfo.substatus || 'None'}</span></div>
                        <div><strong className="text-slate-500 block">Billable:</strong> {leadInfo.billable ? 'Yes (Billable)' : 'No'}</div>
                        <div><strong className="text-slate-500 block">Date Sent:</strong> {leadInfo.dateSent || new Date(activeDetailLead.createdAt).toLocaleDateString()}</div>
                        <div><strong className="text-slate-500 block">Date Subscribed:</strong> {leadInfo.dateSubscribed || '—'}</div>
                        <div><strong className="text-slate-500 block">Tier:</strong> {leadInfo.tier || 'Tier 1'}</div>
                        <div><strong className="text-slate-500 block">Call Duration:</strong> {leadInfo.callDuration || '—'}</div>
                        <div><strong className="text-slate-500 block">Reason for Rejection:</strong> {leadInfo.reasonForRejection || '—'}</div>
                        <div><strong className="text-slate-500 block">Reason for DQ:</strong> {leadInfo.reasonForDQ || '—'}</div>
                        <div><strong className="text-slate-500 block">Reason for Doesn't Meet Criteria:</strong> {leadInfo.reasonForDoesntMeetCriteria || '—'}</div>
                        <div><strong className="text-slate-500 block">Reason for Spam:</strong> {leadInfo.reasonForSpam || '—'}</div>
                        <div className="sm:col-span-2"><strong className="text-slate-500 block">Trusted Form:</strong> <span className="font-mono text-[11px] truncate block">{leadInfo.trustedForm || '—'}</span></div>
                      </div>
                    </div>

                    {/* Section 2: Contact Information */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <UserIcon className="h-4 w-4 text-indigo-600" />
                        <h4 className="font-bold text-slate-900 text-sm">2. Contact Information</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div><strong className="text-slate-500 block">First Name:</strong> {contactInfo.firstName || activeDetailLead.firstName}</div>
                        <div><strong className="text-slate-500 block">Middle Name:</strong> {contactInfo.middleName || '—'}</div>
                        <div><strong className="text-slate-500 block">Last Name:</strong> {contactInfo.lastName || activeDetailLead.lastName}</div>
                        <div><strong className="text-slate-500 block">Gender:</strong> {contactInfo.gender || activeDetailLead.gender || 'Male'}</div>
                        <div><strong className="text-slate-500 block">Date of Birth:</strong> {contactInfo.dateOfBirth || activeDetailLead.dob || '—'}</div>
                        <div><strong className="text-slate-500 block">Phone Number:</strong> {contactInfo.phoneNumber || activeDetailLead.phone}</div>
                        <div><strong className="text-slate-500 block">Email Address:</strong> {contactInfo.email || activeDetailLead.email}</div>
                        <div><strong className="text-slate-500 block">Area Code:</strong> {contactInfo.areaCode || '—'}</div>
                        <div><strong className="text-slate-500 block">State:</strong> {contactInfo.state || activeDetailLead.state}</div>
                        <div className="sm:col-span-3"><strong className="text-slate-500 block">Address Street & City:</strong> {contactInfo.addressStreet || activeDetailLead.address || '—'}, {contactInfo.city}</div>
                      </div>
                    </div>

                    {/* Section 3: POA */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Scale className="h-4 w-4 text-amber-600" />
                        <h4 className="font-bold text-slate-900 text-sm">3. POA (Power of Attorney)</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div><strong className="text-slate-500 block">Power of Attorney:</strong> <span className={poaInfo.powerOfAttorney ? "font-bold text-amber-700" : ""}>{poaInfo.powerOfAttorney ? 'Yes (Active POA)' : 'No'}</span></div>
                        <div><strong className="text-slate-500 block">Victim Name:</strong> {poaInfo.victimName || '—'}</div>
                        <div><strong className="text-slate-500 block">Victim Full Name:</strong> {poaInfo.victimFullName || '—'}</div>
                        <div><strong className="text-slate-500 block">Victim Last Name:</strong> {poaInfo.victimLastName || '—'}</div>
                        <div><strong className="text-slate-500 block">Victim DOB:</strong> {poaInfo.victimDOB || '—'}</div>
                        <div><strong className="text-slate-500 block">Victim DOD:</strong> {poaInfo.victimDOD || '—'}</div>
                      </div>
                    </div>

                    {/* Section 4: Diagnosis Information */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Stethoscope className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-bold text-slate-900 text-sm">4. Diagnosis Information</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div><strong className="text-slate-500 block">Diagnosis:</strong> <span className="font-bold text-emerald-700">{diagnosisInfo.diagnosis || activeDetailLead.diagnosis || 'Non-Hodgkin Lymphoma'}</span></div>
                        <div><strong className="text-slate-500 block">Diagnosis Year/Date:</strong> {diagnosisInfo.diagnosisYear || '—'}</div>
                        <div><strong className="text-slate-500 block">Diagnosing Doctor:</strong> {diagnosisInfo.diagnosingDoctorName || '—'}</div>
                        <div><strong className="text-slate-500 block">Treating Doctor:</strong> {diagnosisInfo.treatingDoctorName || '—'}</div>
                        <div><strong className="text-slate-500 block">Diagnosing Hospital:</strong> {diagnosisInfo.diagnosingHospitalName || activeDetailLead.hospital || '—'}</div>
                        <div><strong className="text-slate-500 block">Treating Facility:</strong> {diagnosisInfo.treatingFacilityName || '—'}</div>
                        <div><strong className="text-slate-500 block">Diagnosing Hospital Phone:</strong> {diagnosisInfo.diagnosingFacilityPhone || '—'}</div>
                        <div><strong className="text-slate-500 block">Treating Facility Phone:</strong> {diagnosisInfo.treatingFacilityPhone || '—'}</div>
                        <div className="sm:col-span-3"><strong className="text-slate-500 block">Hospital & Facility Addresses:</strong> {diagnosisInfo.diagnosingHospitalAddress || '—'} | {diagnosisInfo.treatingFacilityAddress || '—'}</div>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <Link
                  href={`/vendor-portal/leads/${activeDetailLead.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                >
                  <span>Open Full Lead Page</span> →
                </Link>
                <button
                  onClick={() => setActiveDetailLead(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close Quick View
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center bg-slate-50/40">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name, email, type, diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-xs hover:border-slate-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-xs hover:border-slate-300 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="SIGNED_RETAINER">Signed Retainer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>



      {/* Table Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : paginatedLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Users className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No leads submitted</h3>
          <p className="mt-1 text-sm text-slate-500">
            Submit a lead using the button above or route them to our API endpoint.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={toggleSelectAllPage}
                    title={isAllPageSelected ? 'Deselect Page' : 'Select All Page'}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => onRequestSort('leadId')}
                  className="cursor-pointer p-4 font-semibold uppercase tracking-wider text-xs hover:text-blue-600 transition-all select-none"
                >
                  Case ID <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                </th>
                <th
                  onClick={() => onRequestSort('firstName')}
                  className="cursor-pointer p-4 font-semibold uppercase tracking-wider text-xs hover:text-blue-600 transition-all select-none"
                >
                  Full Name / Contact <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                </th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Campaign Name</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Type</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Contact Info</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">State</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Substatus & Badges</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Diagnosis</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th
                  onClick={() => onRequestSort('createdAt')}
                  className="cursor-pointer p-4 font-semibold uppercase tracking-wider text-xs hover:text-blue-600 transition-all select-none"
                >
                  Date Sent <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                </th>
                <th className="p-4 text-right font-semibold uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                const parsed = parseLeadDetails(lead);
                const leadInfo = parsed?.leadInfo || {};
                const poaInfo = parsed?.poa || {};
                const diagnosisInfo = parsed?.diagnosisInfo || {};

                const displayType = leadInfo.type || lead.tortName || 'PFAS';
                const displayCampaignName = lead.campaignName || lead.campaign?.name || leadInfo.campaignName || `${displayType} Campaign`;
                const displaySubstatus = leadInfo.substatus || 'None';
                const displayDiagnosis = diagnosisInfo.diagnosis || lead.diagnosis || '—';
                const isBillable = leadInfo.billable !== false;
                const isPOA = poaInfo.powerOfAttorney === true;

                return (
                  <tr
                    key={lead.id}
                    className={`transition-colors ${isSelected
                      ? 'bg-rose-50/50'
                      : 'hover:bg-slate-50/60'
                      }`}
                  >
                    <td className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-blue-600">
                      <button
                        onClick={() => setActiveDetailLead(lead)}
                        className="hover:underline transition-colors cursor-pointer text-left"
                      >
                        {lead.leadId}
                      </button>
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      <button
                        onClick={() => setActiveDetailLead(lead)}
                        className="hover:text-blue-600 transition-colors text-left block"
                      >
                        {lead.firstName} {lead.lastName}
                      </button>
                      {leadInfo.contactName && leadInfo.contactName !== `${lead.firstName} ${lead.lastName}` && (
                        <span className="text-[11px] text-slate-400 block">Contact: {leadInfo.contactName}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 text-xs block truncate max-w-[150px]">
                        {displayCampaignName}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-semibold border border-blue-200">
                        <Tag className="h-3 w-3" />
                        {displayType}
                      </span>
                    </td>
                    <td className="p-4 text-xs space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 font-mono">{lead.state}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {displaySubstatus !== 'None' && (
                          <span className="rounded-md bg-indigo-50 text-indigo-700 px-1.5 py-0.5 text-[10px] font-bold border border-indigo-200">
                            {displaySubstatus}
                          </span>
                        )}
                        {isBillable && (
                          <span className="rounded-md bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px] font-bold border border-emerald-200">
                            Billable
                          </span>
                        )}
                        {isPOA && (
                          <span className="rounded-md bg-amber-50 text-amber-700 px-1.5 py-0.5 text-[10px] font-bold border border-amber-200">
                            POA
                          </span>
                        )}
                        {leadInfo.tier && (
                          <span className="rounded-md bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[10px] font-semibold border border-slate-200">
                            {leadInfo.tier}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 max-w-[160px] truncate text-slate-600 font-medium text-xs">
                      {displayDiagnosis}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${lead.status === 'NEW'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : lead.status === 'QUALIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : lead.status === 'SIGNED_RETAINER'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : lead.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                      >
                        {lead.status === 'REJECTED' ? 'Disqualified' : lead.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveDetailLead(lead)}
                          title="Quick View Lead Follow Up Details"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {sortedLeads.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 p-5">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, sortedLeads.length)} of{' '}
            {sortedLeads.length} leads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
