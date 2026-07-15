'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, ShieldCheck, Mail, Volume2, Plus, PlusCircle, Check,
  AlertTriangle, Key, History, Activity, Sparkles, Building
} from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import { useAuthStore } from '../../../../store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { campaigns, logs, addCustomMassTort, fetchData } = useCRMStore();

  const [settingsTab, setSettingsTab] = useState<'branding' | 'mass-torts' | 'smtp' | 'audits'>('mass-torts');

  // Custom Mass Tort state
  const [newTortName, setNewTortName] = useState('');
  const [newTortDesc, setNewTortDesc] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Smtp states
  const [smtpHost, setSmtpHost] = useState('smtp.mailtrap.io');
  const [smtpPort, setSmtpPort] = useState('2525');
  const [smtpUser, setSmtpUser] = useState('mc_smtp_dev');

  // Custom Mass Tort list (Pre-seeded + Custom)
  const [tortsList, setTortsList] = useState([
    { id: 't-1', name: 'Camp Lejeune', isCustom: false },
    { id: 't-2', name: 'Roundup', isCustom: false },
    { id: 't-3', name: 'Paraquat', isCustom: false },
    { id: 't-4', name: 'Hair Relaxer', isCustom: false },
    { id: 't-5', name: 'AFFF Firefighting Foam', isCustom: false },
    { id: 't-6', name: 'Depo-Provera', isCustom: false },
    { id: 't-7', name: 'NEC Infant Formula', isCustom: false },
    { id: 't-8', name: 'Talcum Powder', isCustom: false },
    { id: 't-9', name: 'Ozempic Gastro', isCustom: false },
    { id: 't-10', name: 'Social Media Harm', isCustom: false },
    { id: 't-11', name: 'Exactech Hip', isCustom: false },
    { id: 't-12', name: 'Hernia Mesh', isCustom: false },
    { id: 't-13', name: 'Bard PowerPort', isCustom: false },
    { id: 't-14', name: 'Elmiron', isCustom: false },
    { id: 't-15', name: 'Mesothelioma Asbestos', isCustom: false },
    { id: 't-16', name: 'Ride Share Assault', isCustom: false }
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddCustomTort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTortName) return;

    addCustomMassTort(newTortName, newTortDesc);

    // Add to local state list
    setTortsList([
      { id: `t-${Date.now()}`, name: newTortName, isCustom: true },
      ...tortsList
    ]);

    setSuccessMsg(`Successfully registered custom mass tort: "${newTortName}"`);
    setNewTortName('');
    setNewTortDesc('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure client feeds, add custom mass tort litigations, and audit security events.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Left Side: Nav Tabs */}
        <div className="glass-panel p-4 h-fit space-y-1">
          <button
            onClick={() => setSettingsTab('mass-torts')}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${settingsTab === 'mass-torts' ? 'bg-primary text-white' : 'text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
          >
            <Sparkles className="h-4.5 w-4.5" />
            <span>Mass Tort Campaigns</span>
          </button>

          <button
            onClick={() => setSettingsTab('smtp')}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${settingsTab === 'smtp' ? 'bg-primary text-white' : 'text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
          >
            <Mail className="h-4.5 w-4.5" />
            <span>SMTP & Twilio Feeds</span>
          </button>

          <button
            onClick={() => setSettingsTab('branding')}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${settingsTab === 'branding' ? 'bg-primary text-white' : 'text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
          >
            <Building className="h-4.5 w-4.5" />
            <span>Company Branding</span>
          </button>

          <button
            onClick={() => setSettingsTab('audits')}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${settingsTab === 'audits' ? 'bg-primary text-white' : 'text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
          >
            <History className="h-4.5 w-4.5" />
            <span>Security Audits</span>
          </button>
        </div>

        {/* Right Side: Tab Panel Content */}
        <div className="glass-panel p-6 md:col-span-3 min-h-[400px]">
          {/* Tab 1: Mass Torts Manager */}
          {settingsTab === 'mass-torts' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-850">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Mass Tort Litigations</h3>
                <p className="text-2xs text-slate-450 mt-1">Configure active built-in cases or define new customized tort templates.</p>
              </div>

              {successMsg && (
                <div className="rounded-lg bg-success/15 border border-success/20 p-3 text-xs text-success font-semibold">
                  {successMsg}
                </div>
              )}

              {user?.roleName !== 'Super Admin' && user?.role !== 'Super Admin' ? (
                <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 text-xs text-warning flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5" />
                  <span>Only Super Administrators can register custom campaign cases.</span>
                </div>
              ) : (
                <form onSubmit={handleAddCustomTort} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs items-end bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="md:col-span-1">
                    <label className="font-semibold text-slate-400 block mb-1">Lawsuit Name</label>
                    <input
                      type="text"
                      required
                      value={newTortName}
                      onChange={(e) => setNewTortName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus:border-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                      placeholder="e.g. PFAS Contamination"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="font-semibold text-slate-400 block mb-1">Litigation Details</label>
                    <input
                      type="text"
                      value={newTortDesc}
                      onChange={(e) => setNewTortDesc(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus:border-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                      placeholder="General description..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex justify-center items-center gap-1.5 rounded-lg bg-primary py-2 text-white hover:bg-primary-hover font-semibold shadow shadow-primary/20"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Register Tort</span>
                  </button>
                </form>
              )}

              {/* Tort List */}
              <div className="space-y-2">
                <h4 className="text-2xs font-bold text-slate-450 uppercase tracking-wider">Litigations Catalog</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {tortsList.map(tort => (
                    <div key={tort.id} className="flex justify-between items-center rounded-lg border border-slate-100 p-2.5 dark:border-slate-850 bg-slate-50/20">
                      <span className="text-xs font-semibold">{tort.name}</span>
                      {tort.isCustom ? (
                        <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">Custom</span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500 font-bold px-1.5 py-0.5 rounded">Built-In</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: SMTP Config */}
          {settingsTab === 'smtp' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-850">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Communication Servers</h3>
                <p className="text-2xs text-slate-450 mt-1">Configure SMTP relays and Twilio webhook integration configurations.</p>
              </div>

              <div className="space-y-4 text-xs">
                <h4 className="text-2xs font-bold text-slate-450 uppercase tracking-wider">SMTP Server Relay</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block text-slate-400">SMTP Host</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block text-slate-400">SMTP Port</label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4">
                  <h4 className="text-2xs font-bold text-slate-450 uppercase tracking-wider">Twilio SMS / WhatsApp API</h4>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-150 dark:border-slate-850">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Twilio Status Connected</p>
                      <p className="text-[10px] text-slate-400">Twilio Account SID: ACxxxxxxxxxxxxxxxxxxxxxx</p>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-success"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Branding */}
          {settingsTab === 'branding' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-850">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Workspace Branding</h3>
                <p className="text-2xs text-slate-450 mt-1">Configure company logos, theme coloring schemes, and corner radiuses.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold block text-slate-400">Company Name</label>
                  <input
                    type="text"
                    defaultValue="MassCore CRM Inc."
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-slate-400">Primary Color Theme</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary"></span>
                    <span className="font-mono text-slate-500">#7367F0 (Indigo Violet)</span>
                  </div>
                </div>
                <div>
                  <label className="font-semibold block text-slate-400">Border Radius (Radius)</label>
                  <input
                    type="text"
                    defaultValue="20px"
                    disabled
                    className="mt-1 block w-28 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-center dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Security Audits */}
          {settingsTab === 'audits' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-850">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Security Audits Feed</h3>
                <p className="text-2xs text-slate-450 mt-1">Audit security modifications, logins, and configurations updates.</p>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {logs.map(log => (
                  <div key={log.id} className="text-2xs rounded-lg border border-slate-100 p-3 dark:border-slate-850 bg-slate-50/20">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-primary uppercase">{log.action.replace('_', ' ')}</span>
                      <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-550 dark:text-slate-400 mt-1">{log.details}</p>
                    <span className="text-slate-400 block mt-0.5">Author: {log.userName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
