'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import { useAuthStore } from '../../../../store/authStore';

// Extracted modular components
import VendorReportsDateFilter from '../../../../components/vendor-portal/reports/VendorReportsDateFilter';
import VendorReportsKpis from '../../../../components/vendor-portal/reports/VendorReportsKpis';
import VendorReportsCharts from '../../../../components/vendor-portal/reports/VendorReportsCharts';

export default function VendorReportsPage() {
  const { user } = useAuthStore();
  const { leads, campaigns: rawCampaigns, invoices: rawInvoices, fetchData } = useCRMStore();
  const campaigns = rawCampaigns as any[];
  const invoices = rawInvoices as any[];

  const vendorId = user?.vendorId || 'ven-1';

  // Date Filters
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Date filtering logic helper
  const filterByDate = (itemDateStr: string) => {
    const itemDate = new Date(itemDateStr);
    const now = new Date();

    if (dateRange === 'today') {
      return itemDate.toDateString() === now.toDateString();
    }
    if (dateRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return itemDate >= oneWeekAgo;
    }
    if (dateRange === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return itemDate >= oneMonthAgo;
    }
    if (dateRange === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return itemDate >= oneYearAgo;
    }
    if (dateRange === 'custom') {
      const start = customStart ? new Date(customStart) : new Date(0);
      const end = customEnd ? new Date(customEnd) : new Date();
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    }
    return true;
  };

  // Filter vendor restricted records
  const vendorLeads = leads.filter(l => l.vendorId === vendorId && filterByDate(l.createdAt));
  const vendorInvoices = invoices.filter(i => i.vendorId === vendorId && filterByDate(i.dueDate.toString()));

  // Metrics
  const totalLeads = vendorLeads.length;
  const newLeads = vendorLeads.filter(l => l.status === 'NEW').length;
  const qualifiedLeads = vendorLeads.filter(l => ['QUALIFIED', 'SIGNED_RETAINER'].includes(l.status)).length;
  const signedRetainers = vendorLeads.filter(l => l.status === 'SIGNED_RETAINER').length;

  const paidRevenue = vendorInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
  const conversionRate = totalLeads ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

  // Chart Data: Lead Status Distribution
  const statusData = [
    { name: 'New Ingests', value: newLeads, color: '#6366F1' },
    { name: 'Contacted', value: vendorLeads.filter(l => l.status === 'CONTACTED').length, color: '#3B82F6' },
    { name: 'Qualified / Retained', value: qualifiedLeads, color: '#10B981' },
    { name: 'Rejected', value: vendorLeads.filter(l => l.status === 'REJECTED').length, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Chart Data: Campaign Performance
  const campaignMap: { [key: string]: { name: string; leads: number } } = {};
  vendorLeads.forEach(l => {
    const cName = l.campaignName || 'Unknown Campaign';
    if (!campaignMap[cName]) {
      campaignMap[cName] = { name: cName, leads: 0 };
    }
    campaignMap[cName].leads += 1;
  });
  const campaignData = Object.values(campaignMap);

  // Chart Data: Ingestion Trend
  const dateMap: { [key: string]: number } = {};
  vendorLeads.forEach(l => {
    const date = new Date(l.createdAt);
    const label = dateRange === 'today' || dateRange === 'week'
      ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
      : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    dateMap[label] = (dateMap[label] || 0) + 1;
  });
  const trendData = Object.keys(dateMap).map(key => ({
    date: key,
    Leads: dateMap[key]
  }));

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value\n";
    csvContent += `Sent Leads,${totalLeads}\n`;
    csvContent += `Qualified Leads,${qualifiedLeads}\n`;
    csvContent += `Retainers Signed,${signedRetainers}\n`;
    csvContent += `Earned Paid Revenue,${paidRevenue}\n`;
    csvContent += `Conversion Rate,${conversionRate}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Vendor_Analytics_Report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Analytics Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View ingestion volume, lead conversions, and account payouts metrics.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-55 dark:border-slate-800 dark:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <VendorReportsDateFilter
        dateRange={dateRange}
        setDateRange={setDateRange}
        customStart={customStart}
        setCustomStart={setCustomStart}
        customEnd={customEnd}
        setCustomEnd={setCustomEnd}
      />

      <VendorReportsKpis
        totalLeads={totalLeads}
        qualifiedLeads={qualifiedLeads}
        paidRevenue={paidRevenue}
        conversionRate={conversionRate}
      />

      <VendorReportsCharts
        trendData={trendData}
        statusData={statusData}
        campaignData={campaignData}
      />
    </div>
  );
}
