'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserX, ChevronLeft, ChevronRight } from 'lucide-react';

interface DisqualifiedLeadsTableProps {
  campaigns: any[];
  vendors: any[];
  uniqueDisqStates: string[];
  disqSearch: string;
  setDisqSearch: (val: string) => void;
  disqCampaign: string;
  setDisqCampaign: (val: string) => void;
  disqVendor: string;
  setDisqVendor: (val: string) => void;
  disqPriority: string;
  setDisqPriority: (val: string) => void;
  disqState: string;
  setDisqState: (val: string) => void;
  disqPage: number;
  setDisqPage: React.Dispatch<React.SetStateAction<number>>;
  filteredDisqLeads: any[];
}

const ITEMS_PER_PAGE = 5;

export default function DisqualifiedLeadsTable({
  campaigns,
  vendors,
  uniqueDisqStates,
  disqSearch,
  setDisqSearch,
  disqCampaign,
  setDisqCampaign,
  disqVendor,
  setDisqVendor,
  disqPriority,
  setDisqPriority,
  disqState,
  setDisqState,
  disqPage,
  setDisqPage,
  filteredDisqLeads
}: DisqualifiedLeadsTableProps) {
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
            value={disqSearch}
            onChange={(e) => {
              setDisqSearch(e.target.value);
              setDisqPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pr-4 pl-9 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-xs"
          />
        </div>

        <div>
          <select
            value={disqCampaign}
            onChange={(e) => {
              setDisqCampaign(e.target.value);
              setDisqPage(1);
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
            value={disqVendor}
            onChange={(e) => {
              setDisqVendor(e.target.value);
              setDisqPage(1);
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
            value={disqPriority}
            onChange={(e) => {
              setDisqPriority(e.target.value);
              setDisqPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <select
            value={disqState}
            onChange={(e) => {
              setDisqState(e.target.value);
              setDisqPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
          >
            <option value="">All States</option>
            {uniqueDisqStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredDisqLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <UserX className="h-10 w-10 text-slate-300" />
          <h3 className="mt-2 text-xs font-bold text-slate-700">No disqualified leads found</h3>
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
              {filteredDisqLeads
                .slice((disqPage - 1) * ITEMS_PER_PAGE, disqPage * ITEMS_PER_PAGE)
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
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-3xs font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                        Disqualified
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
      {filteredDisqLeads.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Showing {(disqPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(disqPage * ITEMS_PER_PAGE, filteredDisqLeads.length)} of{' '}
            {filteredDisqLeads.length} leads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setDisqPage((p) => Math.max(p - 1, 1))}
              disabled={disqPage === 1}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={() =>
                setDisqPage((p) =>
                  Math.min(p + 1, Math.ceil(filteredDisqLeads.length / ITEMS_PER_PAGE))
                )
              }
              disabled={disqPage === Math.ceil(filteredDisqLeads.length / ITEMS_PER_PAGE)}
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
