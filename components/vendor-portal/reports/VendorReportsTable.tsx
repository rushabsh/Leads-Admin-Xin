'use client';

import React, { useState } from 'react';
import { Layers, ShieldCheck, Award, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

export interface CampaignPerformanceRow {
  campaignName: string;
  caseType: string;
  totalLeads: number;
  qualifiedLeads: number;
  tcpaOkLeads: number;
  conversionRate: number;
  tcpaPassRate: number;
  status: string;
}

interface VendorReportsTableProps {
  data: CampaignPerformanceRow[];
}

export default function VendorReportsTable({ data }: VendorReportsTableProps) {
  const [sortField, setSortField] = useState<keyof CampaignPerformanceRow>('totalLeads');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const handleSort = (field: keyof CampaignPerformanceRow) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    return sortDir === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden space-y-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            Campaign & Case Type Performance Breakdown
          </h3>
          <p className="text-xs text-slate-500">Granular view of ingestion volume, TCPA compliance, and conversion quality.</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
          {data.length} Performance Rows
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th
                onClick={() => handleSort('campaignName')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Campaign Name
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('caseType')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Case Type (Litigation)
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('totalLeads')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  Total Leads
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('tcpaPassRate')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  TCPA Pass %
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('qualifiedLeads')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  Qualified Leads
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('conversionRate')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  Conversion Rate
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No campaign lead records found for this period.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    {row.campaignName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {row.caseType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {row.totalLeads}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center gap-1 font-semibold ${row.tcpaPassRate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <ShieldCheck className="h-3 w-3" />
                      {row.tcpaPassRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">
                    {row.qualifiedLeads}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Award className="h-3 w-3" />
                      {row.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing Page <span className="font-bold text-slate-800">{page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
