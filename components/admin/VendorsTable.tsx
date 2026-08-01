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
          <Building2 className="h-10 w-10 text-slate-300" />
          <h3 className="mt-2 text-xs font-bold text-slate-700">No vendors configured</h3>
          <p className="text-[10px] text-slate-500">Vendors will appear once created.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Vendor Name</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Email</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Phone</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Campaigns</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Total Leads</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Qualified Leads</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Conversion Rate</th>
                <th className="p-3.5 font-semibold uppercase tracking-wider text-[11px]">Payments Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendorsTableData.map((vendor: any) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-3.5 font-semibold">
                    <button
                      onClick={() => router.push(`/admin/vendors/${vendor.id}`)}
                      className="hover:underline text-left font-bold text-sm tracking-tight text-blue-600"
                    >
                      {vendor.name}
                    </button>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">
                    {vendor.email}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {vendor.phone || 'N/A'}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900">
                    {vendor.campaignsCount}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900">
                    {vendor.totalLeads}
                  </td>
                  <td className="p-3.5 font-semibold text-emerald-600">
                    {vendor.qualifiedLeads}
                  </td>
                  <td className="p-3.5 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-3xs font-bold ${
                        vendor.conversionRate >= 50
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {vendor.conversionRate}%
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
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
