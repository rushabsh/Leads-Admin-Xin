'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, FolderKanban } from 'lucide-react';

interface VendorCampaignsTableProps {
  vendorCampaigns: any[];
  vendorLeads: any[];
  formatCurrency: (val: number) => string;
  onSelectCampaign?: (camp: any) => void;
}

export default function VendorCampaignsTable({
  vendorCampaigns,
  vendorLeads,
  formatCurrency,
  onSelectCampaign
}: VendorCampaignsTableProps) {
  const router = useRouter();

  if (vendorCampaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FolderKanban className="h-10 w-10 text-slate-300 mb-2" />
        <p className="text-xs text-slate-500 font-medium">
          No marketing campaigns assigned to this vendor.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
            <th className="p-3.5">Campaign Name</th>
            <th className="p-3.5">Mass Tort</th>
            <th className="p-3.5">Budget Cap</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5">Lead Count</th>
            <th className="p-3.5">Qualified Leads</th>
            <th className="p-3.5">Conversion Rate</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vendorCampaigns.map((camp) => {
            const campLeads = vendorLeads.filter((l) => l.campaignId === camp.id || l.campaignName === camp.name);
            const leadsCount = campLeads.length || camp.leadCount || 0;
            const qualifiedCount =
              campLeads.filter((l) => l.status === 'QUALIFIED' || l.status === 'SIGNED_RETAINER').length || 0;
            const conversion = leadsCount > 0 ? Math.round((qualifiedCount / leadsCount) * 100) : 0;

            return (
              <tr
                key={camp.id}
                onClick={() => router.push(`/admin/campaigns/${camp.id}`)}
                className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
              >
                <td className="p-3.5 font-bold text-slate-900">
                  <Link
                    href={`/admin/campaigns/${camp.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-slate-900 group-hover:text-blue-600 hover:underline transition-colors block"
                  >
                    {camp.name}
                  </Link>
                  {camp.description && <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate max-w-xs">{camp.description}</div>}
                </td>
                <td className="p-3.5 font-semibold text-slate-700">{camp.tortName || camp.massTort?.name || 'General Mass Tort'}</td>
                <td className="p-3.5 font-bold text-slate-900">{formatCurrency(camp.budget || 0)}</td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${camp.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${camp.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-500'}`} />
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
                <td className="p-3.5 text-right">
                  <Link
                    href={`/admin/campaigns/${camp.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Campaign Leads</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
