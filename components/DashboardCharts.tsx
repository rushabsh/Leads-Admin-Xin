'use client';

import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip
} from 'recharts';

interface DashboardChartsProps {
  leadGrowthData: any[];
  revenueData: any[];
  sourceData: any[];
  COLORS: string[];
}

export default function DashboardCharts({ leadGrowthData, revenueData, sourceData, COLORS }: DashboardChartsProps) {
  return (
    <>
      {/* Chart 1: Lead growth */}
      <div className="glass-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Lead Volume & Qualification</h2>
          <span className="text-xs text-slate-550">6-Month Trend</span>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={leadGrowthData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7367F0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7367F0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Area type="monotone" dataKey="leads" stroke="#7367F0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" />
              <Area type="monotone" dataKey="qualified" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorQualified)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Revenue vs Expenses */}
      {/* <div className="glass-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Revenue Trends & Cost Acquisition</h2>
          <span className="text-xs text-slate-550">Total Settlement Billing</span>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#7367F0" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cost" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      {/* Chart 3: Lead sources */}
      <div className="glass-panel p-6 flex flex-col justify-between">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Source Distribution</h2>
        </div>
        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-2xs mt-4">
          {sourceData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="text-slate-555 dark:text-slate-400">{entry.name} ({entry.value})</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
