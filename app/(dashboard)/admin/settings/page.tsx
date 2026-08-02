'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings, ShieldCheck, Mail, Volume2, Plus, PlusCircle, Check,
    AlertTriangle, Key, History, Activity, Sparkles, Building, Loader2
} from 'lucide-react';
import { useCRMStore } from '../../../../store/crmStore';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../lib/api';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const { campaigns, logs, fetchData } = useCRMStore();

    const [settingsTab, setSettingsTab] = useState<'branding' | 'mass-torts' | 'smtp' | 'audits'>('mass-torts');

    // Custom Mass Tort state
    const [newTortName, setNewTortName] = useState('');
    const [newTortDesc, setNewTortDesc] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Smtp states
    const [smtpHost, setSmtpHost] = useState('smtp.mailtrap.io');
    const [smtpPort, setSmtpPort] = useState('2525');
    const [smtpUser, setSmtpUser] = useState('mc_smtp_dev');

    // Custom Mass Tort list (Pre-seeded + Custom)
    const [tortsList, setTortsList] = useState<Array<{ id: string; name: string; isCustom?: boolean }>>([
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

    const fetchMassTortsFromDB = async () => {
        try {
            const res = await api.get('/settings/mass-torts');
            const fetched: any[] = res.data?.data || res.data?.massTorts || [];
            if (fetched.length > 0) {
                setTortsList(fetched.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    isCustom: t.isCustom ?? true
                })));
            }
        } catch (e) {
            console.warn('Could not fetch mass torts from API, using default list.', e);
        }
    };

    useEffect(() => {
        fetchData();
        fetchMassTortsFromDB();
    }, [fetchData]);

    const handleAddCustomTort = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        const trimmedName = newTortName.trim();
        if (!trimmedName) {
            setErrorMsg('Lawsuit Name is required.');
            return;
        }

        // Duplicate Lawsuit Name Check (Case-Insensitive)
        const exists = tortsList.some(
            (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (exists) {
            setErrorMsg(`Lawsuit "${trimmedName}" already exists.`);
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await api.post('/settings/mass-torts', {
                name: trimmedName,
                description: newTortDesc.trim()
            });

            const createdTort = res.data?.massTort || {
                id: `t-${Date.now()}`,
                name: trimmedName,
                isCustom: true
            };

            setTortsList((prev) => [
                { id: createdTort.id, name: createdTort.name, isCustom: createdTort.isCustom ?? true },
                ...prev
            ]);

            setSuccessMsg(`Successfully registered custom mass tort: "${trimmedName}"`);
            setNewTortName('');
            setNewTortDesc('');

            setTimeout(() => {
                setSuccessMsg('');
            }, 4000);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to register custom mass tort.';
            setErrorMsg(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h1>
                <p className="text-sm text-slate-500">Configure client feeds, add custom mass tort litigations, and audit security events.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {/* Left Side: Nav Tabs */}
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm h-fit space-y-1">
                    <button
                        onClick={() => setSettingsTab('mass-torts')}
                        className={`w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${settingsTab === 'mass-torts' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Sparkles className="h-4.5 w-4.5" />
                        <span>Mass Tort Campaigns</span>
                    </button>

                    <button
                        onClick={() => setSettingsTab('smtp')}
                        className={`w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${settingsTab === 'smtp' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Mail className="h-4.5 w-4.5" />
                        <span>SMTP & Twilio Feeds</span>
                    </button>

                    <button
                        onClick={() => setSettingsTab('branding')}
                        className={`w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${settingsTab === 'branding' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Building className="h-4.5 w-4.5" />
                        <span>Company Branding</span>
                    </button>

                    <button
                        onClick={() => setSettingsTab('audits')}
                        className={`w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${settingsTab === 'audits' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <History className="h-4.5 w-4.5" />
                        <span>Security Audits</span>
                    </button>
                </div>

                {/* Right Side: Tab Panel Content */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-3 min-h-[400px]">
                    {/* Tab 1: Mass Torts Manager */}
                    {settingsTab === 'mass-torts' && (
                        <div className="space-y-6">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Mass Tort Litigations</h3>
                                <p className="text-xs text-slate-500 mt-1">Configure active built-in cases or define new customized tort templates.</p>
                            </div>

                            {successMsg && (
                                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-semibold">
                                    {successMsg}
                                </div>
                            )}

                            {errorMsg && (
                                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-semibold flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                    <button type="button" onClick={() => setErrorMsg('')} className="text-rose-700 hover:opacity-75 font-bold text-sm cursor-pointer">✕</button>
                                </div>
                            )}

                            {user?.roleName !== 'Admin' && user?.role !== 'Admin' && user?.roleName !== 'Super Admin' && user?.role !== 'Super Admin' ? (
                                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 flex items-center gap-2">
                                    <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                                    <span>Only Administrators can register custom campaign cases.</span>
                                </div>
                            ) : (
                                <form onSubmit={handleAddCustomTort} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="md:col-span-1">
                                        <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Lawsuit Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTortName}
                                            onChange={(e) => {
                                                setNewTortName(e.target.value);
                                                if (errorMsg) setErrorMsg('');
                                            }}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                                            placeholder="e.g. PFAS Contamination"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Litigation Details</label>
                                        <input
                                            type="text"
                                            value={newTortDesc}
                                            onChange={(e) => setNewTortDesc(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                                            placeholder="General description..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex justify-center items-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs text-white hover:bg-blue-700 font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <PlusCircle className="h-4 w-4" />
                                        )}
                                        <span>{isSubmitting ? 'Registering...' : 'Register Tort'}</span>
                                    </button>
                                </form>
                            )}

                            {/* Tort List */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Litigations Catalog</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                                    {tortsList.map(tort => (
                                        <div key={tort.id} className="flex justify-between items-center rounded-xl border border-slate-200 p-2.5 bg-slate-50/50">
                                            <span className="text-xs font-bold text-slate-900">{tort.name}</span>
                                            {tort.isCustom ? (
                                                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2 py-0.5 rounded-full">Custom</span>
                                            ) : (
                                                <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 font-semibold px-2 py-0.5 rounded-full">Built-In</span>
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
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Communication Servers</h3>
                                <p className="text-xs text-slate-500 mt-1">Configure SMTP relays and Twilio webhook integration configurations.</p>
                            </div>

                            <div className="space-y-4 text-xs">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMTP Server Relay</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold block text-slate-500 uppercase tracking-wider">SMTP Host</label>
                                        <input
                                            type="text"
                                            value={smtpHost}
                                            onChange={(e) => setSmtpHost(e.target.value)}
                                            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold block text-slate-500 uppercase tracking-wider">SMTP Port</label>
                                        <input
                                            type="text"
                                            value={smtpPort}
                                            onChange={(e) => setSmtpPort(e.target.value)}
                                            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Twilio SMS / WhatsApp API</h4>
                                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div>
                                            <p className="font-bold text-slate-900">Twilio Status Connected</p>
                                            <p className="text-xs text-slate-500 font-mono">Twilio Account SID: ACxxxxxxxxxxxxxxxxxxxxxx</p>
                                        </div>
                                        <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Branding */}
                    {settingsTab === 'branding' && (
                        <div className="space-y-6">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Workspace Branding</h3>
                                <p className="text-xs text-slate-500 mt-1">Configure company logos, theme coloring schemes, and corner radiuses.</p>
                            </div>

                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="font-bold block text-slate-500 uppercase tracking-wider">Company Name</label>
                                    <input
                                        type="text"
                                        defaultValue="MassCore CRM Inc."
                                        className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold block text-slate-500 uppercase tracking-wider">Primary Color Theme</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="h-6 w-6 rounded-full bg-blue-600"></span>
                                        <span className="font-mono text-slate-600">#2563EB (Royal Enterprise Blue)</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="font-bold block text-slate-500 uppercase tracking-wider">Border Radius (Radius)</label>
                                    <input
                                        type="text"
                                        defaultValue="16px"
                                        disabled
                                        className="mt-1 block w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Security Audits */}
                    {settingsTab === 'audits' && (
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Security Audits Feed</h3>
                                <p className="text-xs text-slate-500 mt-1">Audit security modifications, logins, and configurations updates.</p>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                {logs.map(log => (
                                    <div key={log.id} className="text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                                        <div className="flex justify-between items-center font-bold">
                                            <span className="text-blue-600 uppercase">{log.action.replace('_', ' ')}</span>
                                            <span className="text-slate-400 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-slate-600 mt-1">{log.details}</p>
                                        <span className="text-slate-400 block mt-0.5 font-mono text-xs">Author: {log.userName}</span>
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
