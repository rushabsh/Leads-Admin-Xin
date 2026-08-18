'use client';

import React from 'react';
import { TrendingUp, PieChart as PieIcon, BarChart3, ShieldCheck, MapPin, Filter } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

interface VendorReportsChartsProps {
  trendData: any[];
  statusData: any[];
  campaignData: any[];
  caseTypeData?: any[];
  tcpaData?: any[];
  stateData?: any[];
  funnelData?: any[];
}

export default function VendorReportsCharts({
  trendData,
  statusData,
  campaignData,
  caseTypeData = [],
  tcpaData = [],
  stateData = [],
  funnelData = []
}: VendorReportsChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Ingestion Trend */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Leads Ingestion Trend</h3>
            <p className="text-xs text-slate-400">Daily lead arrival volume</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="h-64 w-full">
          {trendData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">
              No trend data available for this date range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="Leads" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#leadsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Lead Status Distribution */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Leads Status Breakdown</h3>
            <p className="text-xs text-slate-400">Current pipeline distribution</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <PieIcon className="h-4 w-4" />
          </div>
        </div>
        <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
          {statusData.length === 0 ? (
            <div className="text-slate-400 text-xs">No status data available for this date range</div>
          ) : (
            <>
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {statusData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600">
                      {item.name}: <span className="font-bold text-slate-900">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Case Type (Type) Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Leads by Case Type</h3>
            <p className="text-xs text-slate-400">Rideshare, PFAS, Roblox, Camp Lejeune, etc.</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <BarChart3 className="h-4 w-4" />
          </div>
        </div>
        <div className="h-64 w-full">
          {caseTypeData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">
              No case type breakdown recorded in this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caseTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} tickLine={false} width={120} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '12px' }} />
                <Bar dataKey="leads" fill="#10B981" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* TCPA Verification Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">TCPA & Compliance Status</h3>
            <p className="text-xs text-slate-400">TCPA OK vs Redo TCPA vs No TCPA</p>
          </div>
          <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
          {tcpaData.length === 0 ? (
            <div className="text-slate-400 text-xs">No TCPA data available for this range</div>
          ) : (
            <>
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tcpaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {tcpaData.map((entry, index) => (
                        <Cell key={`cell-tcpa-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {tcpaData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600">
                      {item.name}: <span className="font-bold text-slate-900">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Geographic Breakdown by State */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Geographic States</h3>
            <p className="text-xs text-slate-400">Lead distribution by state</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
            <MapPin className="h-4 w-4" />
          </div>
        </div>
        <div className="h-64 w-full">
          {stateData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">
              No geographic state data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '12px' }} />
                <Bar dataKey="leads" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Retainer Conversion Funnel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Lead Conversion Funnel</h3>
            <p className="text-xs text-slate-400">Submitted $\to$ Contacted $\to$ Qualified $\to$ Retained</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
            <Filter className="h-4 w-4" />
          </div>
        </div>
        <div className="h-64 w-full">
          {funnelData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">
              No funnel data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="stage" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={32}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-fn-${index}`} fill={['#6366F1', '#3B82F6', '#10B981', '#059669'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Lead Volume by Campaign</h3>
            <p className="text-xs text-slate-400">Comparison across vendor campaigns</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <BarChart3 className="h-4 w-4" />
          </div>
        </div>
        <div className="h-64 w-full">
          {campaignData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">
              No campaign lead data recorded in this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="leads" fill="#2563EB" radius={[4, 4, 0, 0]}>
                  {campaignData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563EB' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

