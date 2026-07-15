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
            <stop offset="5%" stopColor="#7367F0" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#7367F0" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
        <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip />
        <Area type="monotone" dataKey="Leads" stroke="#7367F0" strokeWidth={2.5} fillOpacity={1} fill="url(#vendorLeadsGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
