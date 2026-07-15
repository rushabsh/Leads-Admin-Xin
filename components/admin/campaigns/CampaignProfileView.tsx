'use client';

import React from 'react';
import {
  TrendingUp, Users, Target, Scale, DollarSign, FileText, ChevronLeft,
  Pause, Play, Edit2, Calendar, FolderKanban, Check, Plus
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

interface CampaignProfileViewProps {
  selectedCampaign: any;
  onBack: () => void;
  activeDetailTab: 'overview' | 'leads' | 'vendors' | 'lawfirms' | 'budget' | 'activity';
  setActiveDetailTab: (tab: 'overview' | 'leads' | 'vendors' | 'lawfirms' | 'budget' | 'activity') => void;
  isLoadingDetails: boolean;
  metrics: any;
  campaignLeads: any[];
  onToggleStatus: (camp: any) => void;
  onOpenEditModal: (camp: any) => void;
}

const COLORS = ['#7367F0', '#28C76F', '#EA5455', '#FF9F43', '#00CFE8'];

export default function CampaignProfileView({
  selectedCampaign,
  onBack,
  activeDetailTab,
  setActiveDetailTab,
  isLoadingDetails,
  metrics,
  campaignLeads,
  onToggleStatus,
  onOpenEditModal
}: CampaignProfileViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4 border-slate-100 dark:border-slate-850">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4.5 w-4.5" /> Back to Campaigns
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleStatus(selectedCampaign)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-55 dark:border-slate-850 dark:bg-slate-900"
          >
            {selectedCampaign.status === 'ACTIVE' ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-500" /> Pause Campaign
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-500" /> Resume Campaign
              </>
            )}
          </button>
          <button
            onClick={() => onOpenEditModal(selectedCampaign)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-55 dark:border-slate-850 dark:bg-slate-900"
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit Campaign
          </button>
        </div>
      </div>

      {/* Campaign Details Cover */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-primary/10 p-4 text-primary shrink-0">
              <FolderKanban className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{selectedCampaign.name}</h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold ${
                    selectedCampaign.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : selectedCampaign.status === 'PAUSED'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-slate-500/10 text-slate-500'
                  }`}
                >
                  {selectedCampaign.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                Mass Tort: {selectedCampaign.massTort?.name || selectedCampaign.tortName || 'N/A'} • Source:{' '}
                {selectedCampaign.marketingSource} • Vendor: {selectedCampaign.vendor?.name || 'Direct'}
              </p>
            </div>
          </div>
          {selectedCampaign.startDate && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Calendar className="h-4.5 w-4.5 text-slate-400" />
              <span>
                {new Date(selectedCampaign.startDate).toLocaleDateString()} -{' '}
                {selectedCampaign.endDate
                  ? new Date(selectedCampaign.endDate).toLocaleDateString()
                  : 'Active'}
              </span>
            </div>
          )}
        </div>
      </div>

      {isLoadingDetails ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : metrics ? (
        <>
          {/* Campaign Analytics KPIs */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-450 uppercase block">Total Budget</span>
              <span className="text-xl font-extrabold mt-1 block">${selectedCampaign.budget.toLocaleString()}</span>
              <span className="text-3xs text-slate-400 mt-1 block">
                Expected leads target: {selectedCampaign.expectedLeadTarget || 0}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-450 uppercase block">Total Spend</span>
              <span className="text-xl font-extrabold mt-1 block">${metrics.actualSpend.toLocaleString()}</span>
              <span className="text-3xs text-emerald-500 font-semibold mt-1 block">
                Remaining: ${(selectedCampaign.budget - metrics.actualSpend).toLocaleString()}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-450 uppercase block">Leads Ingested</span>
              <span className="text-xl font-extrabold mt-1 block">{metrics.totalLeads}</span>
              <span className="text-3xs text-indigo-500 font-semibold mt-1 block">
                Qualified: {metrics.qualifiedLeads} ({metrics.conversion}%)
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-455 uppercase block">Cost Per Lead (CPL)</span>
              <span className="text-xl font-extrabold mt-1 block">${metrics.costPerLead}</span>
              <span className="text-3xs text-slate-400 mt-1 block">
                Target CPL: ${selectedCampaign.costPerLeadTarget || 0}
              </span>
            </div>
          </div>

          {/* Detail Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
            {[
              { id: 'overview', label: 'Dashboard & Charts', icon: TrendingUp },
              { id: 'leads', label: 'Leads List', icon: Users },
              { id: 'vendors', label: 'Ingested Vendors', icon: Target },
              { id: 'lawfirms', label: 'Assigned Law Firms', icon: Scale },
              { id: 'budget', label: 'Budget Analysis', icon: DollarSign },
              { id: 'activity', label: 'Audit Trail Logs', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-all duration-200 whitespace-nowrap focus:outline-none ${
                  activeDetailTab === tab.id
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content panels */}
          <div className="min-h-80">
            {activeDetailTab === 'overview' && (
              <div className="space-y-6">
                {/* Charts Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* 1. Leads Over Time */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450">Leads Over Time</h4>
                    <div className="h-56">
                      {metrics.leadsOverTime.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">
                          No time data available
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={metrics.leadsOverTime}>
                            <defs>
                              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7367F0" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#7367F0" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#E2E8F0"
                              className="dark:stroke-slate-800"
                            />
                            <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="leads"
                              stroke="#7367F0"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorLeads)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* 2. Leads by Vendor */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450">Leads by Vendor</h4>
                    <div className="h-56">
                      {metrics.leadsByVendor.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">
                          No vendor data available
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.leadsByVendor}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#E2E8F0"
                              className="dark:stroke-slate-800"
                            />
                            <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#28C76F" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* 3. Lead Status Distribution */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450">
                      Lead Status Distribution
                    </h4>
                    <div className="h-56 flex flex-col sm:flex-row items-center justify-center gap-4">
                      {metrics.statusDist.length === 0 ? (
                        <div className="text-xs text-slate-400">No status data available</div>
                      ) : (
                        <>
                          <div className="w-1/2 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={metrics.statusDist}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={45}
                                  outerRadius={65}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {metrics.statusDist.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex-1 space-y-2 text-2xs">
                            {metrics.statusDist.map((item: any, index: number) => (
                              <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  />
                                  <span className="font-semibold">{item.name}</span>
                                </div>
                                <span className="text-slate-400">
                                  {item.value} ({Math.round((item.value / metrics.totalLeads) * 100)}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 4. Budget vs Spend */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450">
                      Budget vs Actual Spend
                    </h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.budgetVsSpend} layout="vertical">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke="#E2E8F0"
                            className="dark:stroke-slate-800"
                          />
                          <XAxis type="number" stroke="#94A3B8" fontSize={10} tickLine={false} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            stroke="#94A3B8"
                            fontSize={10}
                            tickLine={false}
                            width={80}
                          />
                          <Tooltip formatter={(value) => `$${value}`} />
                          <Bar dataKey="amount" fill="#7367F0" radius={[0, 4, 4, 0]}>
                            {metrics.budgetVsSpend.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#EA5455' : '#7367F0'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Timeline Activity Log */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-455 border-b pb-2 border-slate-100 dark:border-slate-850">
                    Recent Campaign Activity
                  </h4>
                  <div className="relative border-l border-slate-100 pl-4 ml-2 dark:border-slate-850 text-xs space-y-4">
                    <div className="relative">
                      <span className="absolute -left-6.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-2 w-2" />
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">Campaign Activated</span>
                      <p className="text-slate-450 text-3xs mt-0.5">
                        Initial campaign launch with budget ${selectedCampaign.budget.toLocaleString()}
                      </p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-6.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-white">
                        <Plus className="h-2 w-2" />
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Vendor Lead Pipeline Set
                      </span>
                      <p className="text-slate-450 text-3xs mt-0.5">
                        Mapped campaign inbound endpoint for {selectedCampaign.vendor?.name || 'Direct vendors'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDetailTab === 'leads' && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-850 dark:bg-slate-950/20">
                      <th className="p-4 font-semibold">Lead ID</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Phone</th>
                      <th className="p-4 font-semibold">Vendor</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {campaignLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No leads linked to this campaign.
                        </td>
                      </tr>
                    ) : (
                      campaignLeads.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="p-4 font-mono font-semibold text-slate-900 dark:text-white">
                            {l.leadId}
                          </td>
                          <td className="p-4 font-bold">
                            {l.firstName} {l.lastName}
                          </td>
                          <td className="p-4 text-slate-650 dark:text-slate-400">{l.phone}</td>
                          <td className="p-4 text-slate-650 dark:text-slate-400">
                            {l.vendor?.name || selectedCampaign.vendor?.name || 'Direct'}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-semibold ${
                                l.status === 'NEW'
                                  ? 'bg-primary/10 text-primary'
                                  : l.status === 'QUALIFIED'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-slate-500/10 text-slate-550'
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-455">{new Date(l.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeDetailTab === 'vendors' && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-850 dark:bg-slate-950/20">
                      <th className="p-4 font-semibold">Vendor Name</th>
                      <th className="p-4 font-semibold">Leads Submitted</th>
                      <th className="p-4 font-semibold">Qualified Leads</th>
                      <th className="p-4 font-semibold">Conversion %</th>
                      <th className="p-4 font-semibold">Cost Per Lead (Est)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {metrics.vendorMetrics.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          No vendor assignments.
                        </td>
                      </tr>
                    ) : (
                      metrics.vendorMetrics.map((v: any) => (
                        <tr key={v.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="p-4 font-semibold">{v.name}</td>
                          <td className="p-4">{v.submitted}</td>
                          <td className="p-4 text-emerald-500 font-bold">{v.qualified}</td>
                          <td className="p-4 font-semibold text-primary">{v.conversion}%</td>
                          <td className="p-4">${selectedCampaign.costPerLeadTarget || 40}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeDetailTab === 'lawfirms' && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 dark:border-slate-850 dark:bg-slate-950/20">
                      <th className="p-4 font-semibold">Law Firm Name</th>
                      <th className="p-4 font-semibold">Assigned Leads</th>
                      <th className="p-4 font-semibold">Accepted Leads</th>
                      <th className="p-4 font-semibold">Rejected Leads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {metrics.lawFirmMetrics.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
                          No lead transfers to law firms for this campaign yet.
                        </td>
                      </tr>
                    ) : (
                      metrics.lawFirmMetrics.map((f: any) => (
                        <tr key={f.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="p-4 font-semibold">{f.name}</td>
                          <td className="p-4">{f.assigned}</td>
                          <td className="p-4 text-emerald-500 font-bold">{f.accepted}</td>
                          <td className="p-4 text-rose-500 font-bold">{f.rejected}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeDetailTab === 'budget' && (
              <div className="grid gap-6 md:grid-cols-2 text-xs">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-455 border-b pb-2 border-slate-100 dark:border-slate-850">
                    Budget Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Media Budget Limit</span>
                      <span className="font-semibold">${selectedCampaign.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Spent (to Date)</span>
                      <span className="font-semibold">${metrics.actualSpend.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Remaining Budget</span>
                      <span className="font-semibold text-emerald-500">
                        ${(selectedCampaign.budget - metrics.actualSpend).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-455 border-b pb-2 border-slate-100 dark:border-slate-850">
                    ROI Metrics
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target CPL (Cost per Lead)</span>
                      <span className="font-semibold">${selectedCampaign.costPerLeadTarget || 40}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actual CPL</span>
                      <span className="font-semibold">${metrics.costPerLead}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Revenue</span>
                      <span className="font-semibold text-emerald-500">${metrics.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated ROI</span>
                      <span
                        className={`font-semibold ${metrics.roi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                      >
                        {metrics.roi}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDetailTab === 'activity' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-455 border-b pb-2 border-slate-100 dark:border-slate-850">
                  Audit log
                </h4>
                <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                  <div className="text-slate-500 border-b border-dashed pb-1.5 border-slate-100 dark:border-slate-850">
                    <span className="text-slate-400">[2026-07-08 10:15]</span> Campaign{' '}
                    <span className="text-primary font-bold">"{selectedCampaign.name}"</span> created by Admin.
                    Initial budget: ${selectedCampaign.budget}.
                  </div>
                  <div className="text-slate-500 border-b border-dashed pb-1.5 border-slate-100 dark:border-slate-850">
                    <span className="text-slate-400">[2026-07-08 10:18]</span> Vendor{' '}
                    <span className="text-emerald-500 font-bold">
                      "{selectedCampaign.vendor?.name || 'Premier Leads LLC'}"
                    </span>{' '}
                    assigned as primary acquisition lead partner.
                  </div>
                  {selectedCampaign.lawFirm && (
                    <div className="text-slate-500 border-b border-dashed pb-1.5 border-slate-100 dark:border-slate-850">
                      <span className="text-slate-400">[2026-07-08 10:20]</span> Law firm{' '}
                      <span className="text-amber-500 font-bold">"{selectedCampaign.lawFirm.name}"</span> linked as
                      preferred transfer partner.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
