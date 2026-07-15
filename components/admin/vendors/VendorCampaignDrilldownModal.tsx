'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Phone, MapPin } from 'lucide-react';

interface VendorCampaignDrilldownModalProps {
  selectedCampaign: any;
  onClose: () => void;
  campaignQualifiedLeads: any[];
  campaignDisqualifiedLeads: any[];
  onOpenLead: (leadId: string) => void;
}

export default function VendorCampaignDrilldownModal({
  selectedCampaign,
  onClose,
  campaignQualifiedLeads,
  campaignDisqualifiedLeads,
  onOpenLead
}: VendorCampaignDrilldownModalProps) {
  if (!selectedCampaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-850 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-850">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Campaign: {selectedCampaign.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Showing qualified and disqualified leads for this campaign.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4.5 w-4.5 text-slate-505 hover:text-slate-800 dark:hover:text-slate-200" />
          </button>
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-2 max-h-[65vh] overflow-y-auto bg-slate-50/20 dark:bg-slate-950/10">
          {/* Column 1: Qualified Leads */}
          <div className="flex flex-col h-full bg-white dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 p-4">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3 mb-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Qualified Leads ({campaignQualifiedLeads.length})
              </h4>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[40vh] pr-1">
              {campaignQualifiedLeads.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs italic">
                  No qualified leads registered.
                </div>
              ) : (
                campaignQualifiedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="group relative flex flex-col justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-900/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/30 hover:bg-white dark:hover:bg-slate-900/70 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenLead(lead.id);
                          }}
                          className="text-2xs font-mono font-bold text-primary group-hover:underline text-left focus:outline-none"
                        >
                          {lead.leadId}
                        </button>
                        <h5 className="font-bold text-xs text-slate-855 dark:text-slate-200 mt-0.5">
                          {lead.firstName} {lead.lastName}
                        </h5>
                      </div>
                      <span className="inline-flex items-center rounded bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 text-4xs font-bold uppercase border border-emerald-500/10">
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1 text-4xs text-slate-450 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>
                          State:{' '}
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold">{lead.state}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Disqualified Leads */}
          <div className="flex flex-col h-full bg-white dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-855 p-4">
            <div className="flex items-center justify-between border-b border-rose-500/10 pb-3 mb-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-505 animate-pulse" />
                Disqualified Leads ({campaignDisqualifiedLeads.length})
              </h4>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[40vh] pr-1">
              {campaignDisqualifiedLeads.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs italic">
                  No disqualified leads registered.
                </div>
              ) : (
                campaignDisqualifiedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="group relative flex flex-col justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-855 bg-slate-50/30 dark:bg-slate-900/30 hover:border-rose-500/20 dark:hover:border-rose-500/30 hover:bg-white dark:hover:bg-slate-900/70 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenLead(lead.id);
                          }}
                          className="text-2xs font-mono font-bold text-primary group-hover:underline text-left focus:outline-none"
                        >
                          {lead.leadId}
                        </button>
                        <h5 className="font-bold text-xs text-slate-855 dark:text-slate-200 mt-0.5">
                          {lead.firstName} {lead.lastName}
                        </h5>
                      </div>
                      <span className="inline-flex items-center rounded bg-rose-500/10 text-rose-500 px-1.5 py-0.5 text-4xs font-bold uppercase border border-rose-500/10">
                        Disqualified
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1 text-4xs text-slate-450 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>
                          State:{' '}
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold">{lead.state}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 p-4 dark:border-slate-855 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-250 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
