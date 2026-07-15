'use client';

import React from 'react';

interface VendorCampaignsTableProps {
  vendorCampaigns: any[];
  vendorLeads: any[];
  formatCurrency: (val: number) => string;
  onSelectCampaign: (camp: any) => void;
}

export default function VendorCampaignsTable({
  vendorCampaigns,
  vendorLeads,
  formatCurrency,
  onSelectCampaign
}: VendorCampaignsTableProps) {
  if (vendorCampaigns.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic text-center py-6">
        No marketing campaigns registered for this vendor.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-100 dark:border-slate-855 rounded-xl">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-555 dark:border-slate-850 dark:bg-slate-950/20">
            <th className="p-3.5 font-semibold">Campaign Name</th>
            <th className="p-3.5 font-semibold">Tort Type</th>
            <th className="p-3.5 font-semibold">Budget</th>
            <th className="p-3.5 font-semibold">Status</th>
            <th className="p-3.5 font-semibold">Lead Count</th>
            <th className="p-3.5 font-semibold">Qualified Leads</th>
            <th className="p-3.5 font-semibold">Conversion Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
          {vendorCampaigns.map((camp) => {
            const campLeads = vendorLeads.filter((l) => l.campaignId === camp.id);
            const leadsCount = campLeads.length || camp.leadCount || 0;
            const qualifiedCount =
              campLeads.filter((l) => l.status === 'QUALIFIED' || l.status === 'SIGNED_RETAINER').length || 0;
            const conversion = leadsCount > 0 ? Math.round((qualifiedCount / leadsCount) * 100) : 0;

            return (
              <tr
                key={camp.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150"
              >
                <td className="p-3.5">
                  <button
                    onClick={() => onSelectCampaign(camp)}
                    className="font-bold text-primary hover:underline hover:text-primary-hover text-left focus:outline-none transition-all duration-150 cursor-pointer"
                  >
                    {camp.name}
                  </button>
                </td>
                <td className="p-3.5 font-semibold text-indigo-500">{camp.tortName}</td>
                <td className="p-3.5 font-bold">{formatCurrency(camp.budget)}</td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-4xs font-bold uppercase ${
                      camp.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {camp.status}
                  </span>
                </td>
                <td className="p-3.5 font-semibold">{leadsCount}</td>
                <td className="p-3.5 font-semibold text-emerald-500">{qualifiedCount}</td>
                <td className="p-3.5 font-bold">
                  <span
                    className={`px-2 py-0.5 rounded text-3xs font-bold ${
                      conversion >= 50
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                    }`}
                  >
                    {conversion}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
