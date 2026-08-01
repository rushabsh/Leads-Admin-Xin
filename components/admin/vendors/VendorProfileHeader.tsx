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
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700 shadow-xs"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{vendor.name} Detail Profile</h1>
          <p className="text-xs text-slate-500 font-medium">
            View vendor lead pipeline performance, marketing campaigns, and billing statistics.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{vendor.name}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase mt-1 ${
                  vendor.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {vendor.status}
              </span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{vendor.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{vendor.phone || 'No Phone provided'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{vendor.address || 'No Address configured'}</span>
            </div>
            <div className="flex items-center gap-2.5 border-t border-slate-100 pt-3.5 mt-3.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Partner Since: {new Date(vendor.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
