'use client';

import React from 'react';
import { ChevronLeft, Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface VendorProfileHeaderProps {
  vendor: any;
  onBack: () => void;
}

export default function VendorProfileHeader({ vendor, onBack }: VendorProfileHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-55 dark:border-slate-800 dark:bg-slate-900 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{vendor.name} Detail Profile</h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
            View vendor lead pipeline performance, marketing campaigns, and billing statistics.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-panel p-6 flex flex-col justify-between border border-slate-100 dark:border-slate-850">
        <div>
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{vendor.name}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-4xs font-extrabold uppercase mt-1 ${
                  vendor.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/10'
                }`}
              >
                {vendor.status}
              </span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-555 dark:text-slate-400">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-slate-450 shrink-0" />
              <span className="truncate">{vendor.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-slate-450 shrink-0" />
              <span>{vendor.phone || 'No Phone provided'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-slate-450 shrink-0" />
              <span className="line-clamp-1">{vendor.address || 'No Address configured'}</span>
            </div>
            <div className="flex items-center gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-3.5 text-[10px] text-slate-400 font-semibold">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Partner Since: {new Date(vendor.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
