'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface QualifiedLeadsTableProps {
  campaigns: any[];
  vendors: any[];
  uniqueQualStates: string[];
  qualSearch: string;
  setQualSearch: (val: string) => void;
  qualStatus: string;
  setQualStatus: (val: string) => void;
  qualCampaign: string;
  setQualCampaign: (val: string) => void;
  qualVendor: string;
  setQualVendor: (val: string) => void;
  qualState: string;
  setQualState: (val: string) => void;
  qualPage: number;
  setQualPage: React.Dispatch<React.SetStateAction<number>>;
  filteredQualLeads: any[];
}

const ITEMS_PER_PAGE = 5;

export default function QualifiedLeadsTable({
  campaigns,
  vendors,
  uniqueQualStates,
  qualSearch,
  setQualSearch,
  qualStatus,
  setQualStatus,
  qualCampaign,
  setQualCampaign,
  qualVendor,
  setQualVendor,
  qualState,
  setQualState,
  qualPage,
  setQualPage,
  filteredQualLeads
}: QualifiedLeadsTableProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="relative col-span-1 lg:col-span-2">
          <Search className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name, email, phone..."
            value={qualSearch}
            onChange={(e) => {
              setQualSearch(e.target.value);
              setQualPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pr-4 pl-9 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-xs"
          />
        </div>

        <div>
          <select
            value={qualStatus}
            onChange={(e) => {
              setQualStatus(e.target.value);
              setQualPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
          >
            <option value="">All Qualified Statuses</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="SIGNED_RETAINER">Retained</option>
          </select>
        </div>

        <div>
          <select
            value={qualCampaign}
            onChange={(e) => {
              setQualCampaign(e.target.value);
              setQualPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
          >
            <option value="">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={qualVendor}
            onChange={(e) => {
              setQualVendor(e.target.value);
              setQualPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
          >
            <option value="">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={qualState}
            onChange={(e) => {
              setQualState(e.target.value);
              setQualPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
          >
            <option value="">All States</option>
            {uniqueQualStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredQualLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <Users className="h-10 w-10 text-slate-300" />
          <h3 className="mt-2 text-xs font-bold text-slate-700">No qualified leads found</h3>
          <p className="text-[10px] text-slate-500">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Lead ID</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Client Name</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Contact Info</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Campaign</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Vendor</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">State</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Priority</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Date Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQualLeads
                .slice((qualPage - 1) * ITEMS_PER_PAGE, qualPage * ITEMS_PER_PAGE)
                .map((lead: any) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="p-3.5 font-mono font-bold">
                      <button
                        onClick={() => router.push(`/admin/leads?id=${lead.id}`)}
                        className="text-blue-600 hover:underline text-left"
                      >
                        {lead.leadId}
                      </button>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      <div>{lead.email}</div>
                      <div>{lead.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-3xs font-bold uppercase ${
                          lead.status === 'SIGNED_RETAINER'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {lead.status === 'SIGNED_RETAINER' ? 'Retained' : 'Qualified'}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-blue-600">
                      {lead.campaign?.name || lead.campaignName || 'General Inbound'}
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {lead.vendor?.name || lead.vendorName || 'Direct API'}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {lead.state}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-3xs font-semibold ${
                          lead.priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredQualLeads.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Showing {(qualPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(qualPage * ITEMS_PER_PAGE, filteredQualLeads.length)} of{' '}
            {filteredQualLeads.length} leads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setQualPage((p) => Math.max(p - 1, 1))}
              disabled={qualPage === 1}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={() =>
                setQualPage((p) =>
                  Math.min(p + 1, Math.ceil(filteredQualLeads.length / ITEMS_PER_PAGE))
                )
              }
              disabled={qualPage === Math.ceil(filteredQualLeads.length / ITEMS_PER_PAGE)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
