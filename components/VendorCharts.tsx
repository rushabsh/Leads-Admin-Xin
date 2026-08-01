'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface VendorChartsProps {
  trendData: any[];
}

export default function VendorCharts({ trendData }: VendorChartsProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={trendData}>
        <defs>
          <linearGradient id="vendorLeadsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
        <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#0F172A', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
        <Area type="monotone" dataKey="Leads" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#vendorLeadsGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
