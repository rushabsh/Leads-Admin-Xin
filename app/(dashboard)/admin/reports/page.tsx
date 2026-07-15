'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';

// Extracted modular components
import ReportsDateFilter from '../../../../components/admin/reports/ReportsDateFilter';
import ReportsKpis from '../../../../components/admin/reports/ReportsKpis';
import ReportsCharts from '../../../../components/admin/reports/ReportsCharts';

export default function ReportsPage() {
  const { leads, cases, campaigns, lawFirms, fetchData } = useCRMStore();

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
      // Adjust end date to include whole day
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    }
    return true;
  };

  // Filtered datasets
  const filteredLeads = leads.filter(l => filterByDate(l.createdAt));
  const filteredCases = cases.filter(c => filterByDate(c.createdAt));

  // Metrics
  const totalLeads = filteredLeads.length;
  const newLeads = filteredLeads.filter(l => l.status === 'NEW').length;
  const qualifiedLeads = filteredLeads.filter(l => ['QUALIFIED', 'SIGNED_RETAINER'].includes(l.status)).length;
  const signedRetainers = filteredLeads.filter(l => l.status === 'SIGNED_RETAINER').length;
  
  const revenue = filteredCases.reduce((acc, c) => acc + (c.settlementAmount || 0), 0);
  const conversionRate = totalLeads ? Math.round((signedRetainers / totalLeads) * 100) : 0;

  // Chart Data: Lead Status Distribution
  const statusData = [
    { name: 'New Ingests', value: newLeads, color: '#6366F1' },
    { name: 'Contacted', value: filteredLeads.filter(l => l.status === 'CONTACTED').length, color: '#3B82F6' },
    { name: 'Qualified', value: filteredLeads.filter(l => l.status === 'QUALIFIED').length, color: '#10B981' },
    { name: 'Retainers Signed', value: signedRetainers, color: '#8B5CF6' },
    { name: 'Rejected Claims', value: filteredLeads.filter(l => l.status === 'REJECTED').length, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Chart Data: Vendor Performance
  const vendorMap: { [key: string]: { name: string; count: number; retained: number } } = {};
  filteredLeads.forEach(l => {
    const vName = l.vendorName || 'Direct / Organic';
    if (!vendorMap[vName]) {
      vendorMap[vName] = { name: vName, count: 0, retained: 0 };
    }
    vendorMap[vName].count += 1;
    if (l.status === 'SIGNED_RETAINER') {
      vendorMap[vName].retained += 1;
    }
  });
  const vendorPerformanceData = Object.values(vendorMap);

  // Chart Data: Campaign Intake Metrics
  const campaignMap: { [key: string]: { name: string; leads: number; budget: number } } = {};
  filteredLeads.forEach(l => {
    const cName = l.campaignName || 'Unknown Campaign';
    if (!campaignMap[cName]) {
      campaignMap[cName] = { name: cName, leads: 0, budget: 0 };
    }
    campaignMap[cName].leads += 1;
  });
  // Inject budget info
  campaigns.forEach(c => {
    if (campaignMap[c.name]) {
      campaignMap[c.name].budget = c.budget;
    }
  });
  const campaignData = Object.values(campaignMap);

  // Chart Data: Monthly / Daily Ingestion Trend
  const dateMap: { [key: string]: number } = {};
  filteredLeads.forEach(l => {
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

  // Handle report export
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value\n";
    csvContent += `Total Ingested Leads,${totalLeads}\n`;
    csvContent += `New Ingested Leads,${newLeads}\n`;
    csvContent += `Qualified Cases,${qualifiedLeads}\n`;
    csvContent += `Signed Retainers,${signedRetainers}\n`;
    csvContent += `Projected Case Settlements,${revenue}\n`;
    csvContent += `Conversion Rate,${conversionRate}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MassCore_Analytics_Report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time insights on media performance, vendor conversions, and cases valuation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      <ReportsDateFilter
        dateRange={dateRange}
        setDateRange={setDateRange}
        customStart={customStart}
        setCustomStart={setCustomStart}
        customEnd={customEnd}
        setCustomEnd={setCustomEnd}
      />

      <ReportsKpis
        totalLeads={totalLeads}
        signedRetainers={signedRetainers}
        conversionRate={conversionRate}
        revenue={revenue}
        lawFirmsCount={lawFirms.length}
      />

      <ReportsCharts
        trendData={trendData}
        statusData={statusData}
        campaignData={campaignData}
        vendorPerformanceData={vendorPerformanceData}
        totalLeads={totalLeads}
      />
    </div>
  );
}
