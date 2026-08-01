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
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Campaign Name</th>
            <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Tort Type</th>
            <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Budget</th>
            <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Status</th>
            <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Lead Count</th>
            <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Qualified Leads</th>
            <th className="p-3.5 font-semibold uppercase tracking-wider text-xs">Conversion Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vendorCampaigns.map((camp) => {
            const campLeads = vendorLeads.filter((l) => l.campaignId === camp.id);
            const leadsCount = campLeads.length || camp.leadCount || 0;
            const qualifiedCount =
              campLeads.filter((l) => l.status === 'QUALIFIED' || l.status === 'SIGNED_RETAINER').length || 0;
            const conversion = leadsCount > 0 ? Math.round((qualifiedCount / leadsCount) * 100) : 0;

            return (
              <tr
                key={camp.id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <td className="p-3.5">
                  <button
                    onClick={() => onSelectCampaign(camp)}
                    className="font-bold text-blue-600 hover:underline text-left focus:outline-none transition-colors cursor-pointer"
                  >
                    {camp.name}
                  </button>
                </td>
                <td className="p-3.5 font-semibold text-slate-700">{camp.tortName}</td>
                <td className="p-3.5 font-bold text-slate-900">{formatCurrency(camp.budget)}</td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${camp.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {camp.status}
                  </span>
                </td>
                <td className="p-3.5 font-semibold text-slate-900">{leadsCount}</td>
                <td className="p-3.5 font-semibold text-emerald-600">{qualifiedCount}</td>
                <td className="p-3.5 font-bold">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${conversion >= 50
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
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
