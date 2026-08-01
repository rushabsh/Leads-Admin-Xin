'use client';

import React from 'react';
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

interface VendorReportsChartsProps {
  trendData: any[];
  statusData: any[];
  campaignData: any[];
}

export default function VendorReportsCharts({
  trendData,
  statusData,
  campaignData
}: VendorReportsChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Ingestion Trend */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-bold text-slate-900">Leads Ingestion Trend</h3>
          <TrendingUp className="h-4 w-4 text-slate-400" />
        </div>
        <div className="h-72 w-full">
          {trendData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm">
              No data available for this range
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#0F172A', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="Leads" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#leadsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Lead Status Distribution */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-bold text-slate-900">Leads Status Breakdown</h3>
          <PieIcon className="h-4 w-4 text-slate-400" />
        </div>
        <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
          {statusData.length === 0 ? (
            <div className="text-slate-400 text-sm">No data available for this range</div>
          ) : (
            <>
              <div className="h-56 w-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#0F172A', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {statusData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
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

      {/* Campaign Performance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-bold text-slate-900">Leads volume by Campaign</h3>
          <BarChart3 className="h-4 w-4 text-slate-400" />
        </div>
        <div className="h-72 w-full">
          {campaignData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm">
              No campaign lead data recorded in this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#0F172A', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
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
