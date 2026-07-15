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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-bold">Leads Ingestion Trend</h3>
          <TrendingUp className="h-4 w-4 text-slate-400" />
        </div>
        <div className="h-72 w-full">
          {trendData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-405 text-sm">
              No data available for this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7367F0" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7367F0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Leads" stroke="#7367F0" strokeWidth={2.5} fillOpacity={1} fill="url(#leadsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Lead Status Distribution */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-bold">Leads Status Breakdown</h3>
          <PieIcon className="h-4 w-4 text-slate-400" />
        </div>
        <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
          {statusData.length === 0 ? (
            <div className="text-slate-450 text-sm">No data available for this range</div>
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {statusData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {item.name}: <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-bold">Leads volume by Campaign</h3>
          <BarChart3 className="h-4 w-4 text-slate-400" />
        </div>
        <div className="h-72 w-full">
          {campaignData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-450 text-sm">
              No campaign lead data recorded in this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="leads" fill="#7367F0" radius={[4, 4, 0, 0]}>
                  {campaignData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#7367F0' : '#8F85F3'} />
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
