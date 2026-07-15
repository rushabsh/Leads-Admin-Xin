'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';

interface VendorsTableProps {
  vendorsTableData: any[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

export default function VendorsTable({ vendorsTableData }: VendorsTableProps) {
  const router = useRouter();

  return (
    <div className="space-y-4 animate-fade-in">
      {vendorsTableData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <Building2 className="h-10 w-10 text-slate-350 dark:text-slate-700" />
          <h3 className="mt-2 text-xs font-bold text-slate-650">No vendors configured</h3>
          <p className="text-[10px] text-slate-500">Vendors will appear once created.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-xl">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-550 dark:border-slate-850 dark:bg-slate-950/20">
                <th className="p-3.5 font-semibold">Vendor Name</th>
                <th className="p-3.5 font-semibold">Email</th>
                <th className="p-3.5 font-semibold">Phone</th>
                <th className="p-3.5 font-semibold">Campaigns</th>
                <th className="p-3.5 font-semibold">Total Leads</th>
                <th className="p-3.5 font-semibold">Qualified Leads</th>
                <th className="p-3.5 font-semibold">Conversion Rate</th>
                <th className="p-3.5 font-semibold">Payments Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {vendorsTableData.map((vendor: any) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150"
                >
                  <td className="p-3.5 font-semibold text-primary">
                    <button
                      onClick={() => router.push(`/admin/vendors/${vendor.id}`)}
                      className="hover:underline text-left font-bold text-sm tracking-tight text-primary"
                    >
                      {vendor.name}
                    </button>
                  </td>
                  <td className="p-3.5 text-slate-550 dark:text-slate-400 font-medium">
                    {vendor.email}
                  </td>
                  <td className="p-3.5 text-slate-550 dark:text-slate-400">
                    {vendor.phone || 'N/A'}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {vendor.campaignsCount}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {vendor.totalLeads}
                  </td>
                  <td className="p-3.5 font-semibold text-emerald-500">
                    {vendor.qualifiedLeads}
                  </td>
                  <td className="p-3.5 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-3xs font-bold ${
                        vendor.conversionRate >= 50
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                      }`}
                    >
                      {vendor.conversionRate}%
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(vendor.paymentsCollected)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
