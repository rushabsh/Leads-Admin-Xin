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
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
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
            className="w-full rounded-xl border border-slate-200/80 bg-white py-1.5 pr-4 pl-9 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950 dark:focus:border-primary"
          />
        </div>

        <div>
          <select
            value={disqCampaign}
            onChange={(e) => {
              setDisqCampaign(e.target.value);
              setDisqPage(1);
            }}
            className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
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
            className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
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
            className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
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
            className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
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
          <UserX className="h-10 w-10 text-slate-350 dark:text-slate-700" />
          <h3 className="mt-2 text-xs font-bold text-slate-650">No disqualified leads found</h3>
          <p className="text-[10px] text-slate-550">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-xl">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-550 dark:border-slate-850 dark:bg-slate-950/20">
                <th className="p-3.5 font-semibold">Lead ID</th>
                <th className="p-3.5 font-semibold">Client Name</th>
                <th className="p-3.5 font-semibold">Contact Info</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Campaign</th>
                <th className="p-3.5 font-semibold">Vendor</th>
                <th className="p-3.5 font-semibold">State</th>
                <th className="p-3.5 font-semibold">Priority</th>
                <th className="p-3.5 font-semibold">Date Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredDisqLeads
                .slice((disqPage - 1) * ITEMS_PER_PAGE, disqPage * ITEMS_PER_PAGE)
                .map((lead: any) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150"
                  >
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      <button
                        onClick={() => router.push(`/admin/leads?id=${lead.id}`)}
                        className="text-primary hover:underline text-left"
                      >
                        {lead.leadId}
                      </button>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      <div>{lead.email}</div>
                      <div>{lead.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-3xs font-bold uppercase bg-rose-500/15 text-rose-500 border border-rose-500/10">
                        Disqualified
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-indigo-500">
                      {lead.campaign?.name || lead.campaignName || 'General Inbound'}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-355 font-medium">
                      {lead.vendor?.name || lead.vendorName || 'Direct API'}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {lead.state}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-3xs font-semibold ${
                          lead.priority === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
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
          <span className="text-2xs text-slate-450">
            Showing {(disqPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(disqPage * ITEMS_PER_PAGE, filteredDisqLeads.length)} of{' '}
            {filteredDisqLeads.length} leads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setDisqPage((p) => Math.max(p - 1, 1))}
              disabled={disqPage === 1}
              className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <button
              onClick={() =>
                setDisqPage((p) =>
                  Math.min(p + 1, Math.ceil(filteredDisqLeads.length / ITEMS_PER_PAGE))
                )
              }
              disabled={disqPage === Math.ceil(filteredDisqLeads.length / ITEMS_PER_PAGE)}
              className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
