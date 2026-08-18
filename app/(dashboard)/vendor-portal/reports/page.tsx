'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import { useAuthStore } from '../../../../store/authStore';

// Extracted modular components
import VendorReportsDateFilter from '../../../../components/vendor-portal/reports/VendorReportsDateFilter';
import VendorReportsKpis from '../../../../components/vendor-portal/reports/VendorReportsKpis';
import VendorReportsCharts from '../../../../components/vendor-portal/reports/VendorReportsCharts';
import VendorReportsTable, { CampaignPerformanceRow } from '../../../../components/vendor-portal/reports/VendorReportsTable';

// Helper to safely extract case details
function getLeadCaseType(lead: any): string {
  if (lead?.type) return lead.type;
  if (typeof lead?.caseDetails === 'string' && lead.caseDetails.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(lead.caseDetails);
      if (parsed?.type) return parsed.type;
    } catch (_) {}
  }
  return 'General Mass Tort';
}

function getLeadSubstatus(lead: any): string {
  if (lead?.substatus) return lead.substatus;
  if (typeof lead?.caseDetails === 'string' && lead.caseDetails.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(lead.caseDetails);
      if (parsed?.substatus) return parsed.substatus;
    } catch (_) {}
  }
  return 'TCPA OK';
}

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
  const vendorInvoices = invoices.filter(i => i.vendorId === vendorId && filterByDate(i.dueDate ? i.dueDate.toString() : new Date().toISOString()));

  // Metrics
  const totalLeads = vendorLeads.length;
  const newLeads = vendorLeads.filter(l => l.status === 'NEW').length;
  const contactedLeads = vendorLeads.filter(l => l.status === 'CONTACTED').length;
  const qualifiedLeads = vendorLeads.filter(l => ['QUALIFIED', 'SIGNED_RETAINER'].includes(l.status)).length;
  const signedRetainers = vendorLeads.filter(l => l.status === 'SIGNED_RETAINER').length;
  const rejectedLeads = vendorLeads.filter(l => l.status === 'REJECTED').length;

  const tcpaOkCount = vendorLeads.filter(l => getLeadSubstatus(l) === 'TCPA OK' || getLeadSubstatus(l) === 'None').length;
  const tcpaPassRate = totalLeads ? Math.round((tcpaOkCount / totalLeads) * 100) : 100;
  const rejectionRate = totalLeads ? Math.round((rejectedLeads / totalLeads) * 100) : 0;

  const paidRevenue = vendorInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
  const conversionRate = totalLeads ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

  // Chart Data: Lead Status Distribution
  const statusData = [
    { name: 'New Ingests', value: newLeads, color: '#6366F1' },
    { name: 'Contacted', value: contactedLeads, color: '#3B82F6' },
    { name: 'Qualified / Retained', value: qualifiedLeads, color: '#10B981' },
    { name: 'Rejected', value: rejectedLeads, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Chart Data: Campaign Performance
  const campaignMap: { [key: string]: { name: string; leads: number } } = {};
  vendorLeads.forEach(l => {
    const cName = l.campaignName || 'General Campaign';
    if (!campaignMap[cName]) {
      campaignMap[cName] = { name: cName, leads: 0 };
    }
    campaignMap[cName].leads += 1;
  });
  const campaignData = Object.values(campaignMap);

  // Chart Data: Case Type Breakdown
  const typeMap: { [key: string]: number } = {};
  vendorLeads.forEach(l => {
    const cType = getLeadCaseType(l);
    typeMap[cType] = (typeMap[cType] || 0) + 1;
  });
  const caseTypeData = Object.keys(typeMap).map(type => ({
    name: type,
    leads: typeMap[type]
  })).sort((a, b) => b.leads - a.leads).slice(0, 6);

  // Chart Data: TCPA Breakdown
  const tcpaMap: { [key: string]: number } = {};
  vendorLeads.forEach(l => {
    const sub = getLeadSubstatus(l);
    tcpaMap[sub] = (tcpaMap[sub] || 0) + 1;
  });
  const tcpaData = [
    { name: 'TCPA OK', value: tcpaMap['TCPA OK'] || tcpaOkCount, color: '#10B981' },
    { name: 'Redo TCPA', value: tcpaMap['Redo TCPA'] || 0, color: '#F59E0B' },
    { name: 'No TCPA', value: tcpaMap['No TCPA'] || 0, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Chart Data: Top States
  const stateMap: { [key: string]: number } = {};
  vendorLeads.forEach(l => {
    const st = l.state || 'Other';
    stateMap[st] = (stateMap[st] || 0) + 1;
  });
  const stateData = Object.keys(stateMap).map(st => ({
    name: st,
    leads: stateMap[st]
  })).sort((a, b) => b.leads - a.leads).slice(0, 6);

  // Chart Data: Funnel Data
  const funnelData = [
    { stage: 'Ingested', count: totalLeads },
    { stage: 'Contacted', count: newLeads + contactedLeads + qualifiedLeads },
    { stage: 'Qualified', count: qualifiedLeads },
    { stage: 'Retained', count: signedRetainers },
  ];

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

  // Performance Table Breakdown Data
  const perfMap: { [key: string]: CampaignPerformanceRow } = {};
  vendorLeads.forEach(l => {
    const cName = l.campaignName || 'General Campaign';
    const cType = getLeadCaseType(l);
    const key = `${cName}||${cType}`;
    if (!perfMap[key]) {
      perfMap[key] = {
        campaignName: cName,
        caseType: cType,
        totalLeads: 0,
        qualifiedLeads: 0,
        tcpaOkLeads: 0,
        conversionRate: 0,
        tcpaPassRate: 0,
        status: 'Active'
      };
    }
    perfMap[key].totalLeads += 1;
    if (['QUALIFIED', 'SIGNED_RETAINER'].includes(l.status)) {
      perfMap[key].qualifiedLeads += 1;
    }
    if (getLeadSubstatus(l) === 'TCPA OK' || getLeadSubstatus(l) === 'None') {
      perfMap[key].tcpaOkLeads += 1;
    }
  });

  const tableData: CampaignPerformanceRow[] = Object.values(perfMap).map(row => {
    const conv = row.totalLeads ? Math.round((row.qualifiedLeads / row.totalLeads) * 100) : 0;
    const tcpaRate = row.totalLeads ? Math.round((row.tcpaOkLeads / row.totalLeads) * 100) : 100;
    return {
      ...row,
      conversionRate: conv,
      tcpaPassRate: tcpaRate
    };
  });

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "=== VENDOR ANALYTICS REPORT SUMMARY ===\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Sent Leads,${totalLeads}\n`;
    csvContent += `Qualified / Retained Leads,${qualifiedLeads}\n`;
    csvContent += `Retainers Signed,${signedRetainers}\n`;
    csvContent += `TCPA Pass Rate,${tcpaPassRate}%\n`;
    csvContent += `Rejection Rate,${rejectionRate}%\n`;
    csvContent += `Earned Paid Revenue,${paidRevenue}\n`;
    csvContent += `Conversion Quality,${conversionRate}%\n\n`;

    csvContent += "=== CAMPAIGN & CASE TYPE BREAKDOWN ===\n";
    csvContent += "Campaign Name,Case Type,Total Leads,Qualified Leads,TCPA Pass Rate %,Conversion Rate %\n";
    tableData.forEach(row => {
      csvContent += `"${row.campaignName}","${row.caseType}",${row.totalLeads},${row.qualifiedLeads},${row.tcpaPassRate}%,${row.conversionRate}%\n`;
    });

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Analytics Reports</h1>
          <p className="text-sm text-slate-500">
            View ingestion volume, case type performance, TCPA compliance, and payout analytics.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Report CSV
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
        tcpaPassRate={tcpaPassRate}
        rejectionRate={rejectionRate}
      />

      <VendorReportsCharts
        trendData={trendData}
        statusData={statusData}
        campaignData={campaignData}
        caseTypeData={caseTypeData}
        tcpaData={tcpaData}
        stateData={stateData}
        funnelData={funnelData}
      />

      <VendorReportsTable data={tableData} />
    </div>
  );
}

