'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileEdit, Sparkles, Save, Eye, Link as LinkIcon, Copy, Check, ExternalLink,
  Plus, Trash2, CheckCircle2, ShieldCheck, HelpCircle, RefreshCw, Sliders,
  Layers, Lock, Unlock, Settings2, FileText, UserCheck, Stethoscope, Scale, Tag,
  AlertTriangle, History, Info, Building2, Megaphone, Filter
} from 'lucide-react';
import { useCRMStore } from '@/store/crmStore';
import NewCaseLeadFollowUpForm, {
  TYPE_OPTIONS,
  STATUS_OPTIONS,
  SUBSTATUS_OPTIONS,
  GENDER_OPTIONS,
  INCIDENT_TYPE_OPTIONS,
  DIAGNOSIS_OPTIONS
} from '@/components/vendor-portal/leads/NewCaseLeadFollowUpForm';

interface FormFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'checkbox' | 'textarea';
  section: 'leadInfo' | 'contactInfo' | 'poa' | 'diagnosis';
  required: boolean;
  active?: boolean;
  options?: string[];
  placeholder?: string;
}

const DEFAULT_FORM_FIELDS: FormFieldDefinition[] = [
  // ==========================================
  // SECTION 1: LEAD INFORMATION
  // ==========================================
  { id: '1', name: 'contactName', label: 'Contact Name', type: 'text', section: 'leadInfo', required: false, active: true, placeholder: 'e.g. Jane Doe' },
  { id: '2', name: 'campaignName', label: 'Campaign Name', type: 'select', section: 'leadInfo', required: true, active: true, placeholder: 'Select Campaign' },
  { id: '3', name: 'type', label: 'Tort Category', type: 'select', section: 'leadInfo', required: true, active: true, options: TYPE_OPTIONS },
  { id: '4', name: 'status', label: 'Initial Status', type: 'select', section: 'leadInfo', required: true, active: true, options: STATUS_OPTIONS },
  { id: '5', name: 'leadName', label: 'Lead Full Name', type: 'text', section: 'leadInfo', required: false, active: true, placeholder: 'e.g. Johnathan Smith Lead' },
  { id: '6', name: 'substatus', label: 'TCPA Substatus', type: 'select', section: 'leadInfo', required: false, active: true, options: SUBSTATUS_OPTIONS },
  { id: '7', name: 'billable', label: 'Billable Lead', type: 'checkbox', section: 'leadInfo', required: false, active: true },
  { id: '8', name: 'dateSent', label: 'Date Sent', type: 'date', section: 'leadInfo', required: false, active: true },
  { id: '9', name: 'dateSubscribed', label: 'Date Subscribed', type: 'date', section: 'leadInfo', required: false, active: true },
  { id: '10', name: 'tier', label: 'Intake Tier Allocation', type: 'text', section: 'leadInfo', required: false, active: true, placeholder: 'e.g. Tier 1 / Premium' },
  { id: '11', name: 'callDuration', label: 'Call Duration', type: 'text', section: 'leadInfo', required: false, active: true, placeholder: 'e.g. 05:45 or 345s' },
  { id: '12', name: 'reasonForRejection', label: 'Reason for Rejection', type: 'text', section: 'leadInfo', required: false, active: true, placeholder: 'e.g. Out of SOL' },
  { id: '13', name: 'reasonForDQ', label: 'Reason for DQ', type: 'text', section: 'leadInfo', required: false, active: true, placeholder: 'Disqualification rationale' },
  { id: '14', name: 'reasonForDoesntMeetCriteria', label: "Reason for Doesn't Meet Criteria", type: 'text', section: 'leadInfo', required: false, active: true, placeholder: 'Criteria failure details' },
  { id: '15', name: 'reasonForSpam', label: 'Reason for Spam', type: 'text', section: 'leadInfo', required: false, active: true, placeholder: 'Spam classification reason' },
  { id: '16', name: 'trustedForm', label: 'Trusted Form Certificate', type: 'textarea', section: 'leadInfo', required: false, active: true, placeholder: 'https://cert.trustedform.com/...' },

  // ==========================================
  // SECTION 2: CONTACT INFORMATION
  // ==========================================
  { id: '17', name: 'firstName', label: 'First Name', type: 'text', section: 'contactInfo', required: true, active: true, placeholder: 'First Name' },
  { id: '18', name: 'middleName', label: 'Middle Name', type: 'text', section: 'contactInfo', required: false, active: true, placeholder: 'Middle Name' },
  { id: '19', name: 'lastName', label: 'Last Name', type: 'text', section: 'contactInfo', required: true, active: true, placeholder: 'Last Name' },
  { id: '20', name: 'gender', label: 'Gender', type: 'select', section: 'contactInfo', required: false, active: true, options: GENDER_OPTIONS },
  { id: '21', name: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'contactInfo', required: false, active: true },
  { id: '22', name: 'phoneNumber', label: 'Phone Number', type: 'text', section: 'contactInfo', required: true, active: true, placeholder: '(555) 000-0000' },
  { id: '23', name: 'email', label: 'Email Address', type: 'text', section: 'contactInfo', required: true, active: true, placeholder: 'claimant@example.com' },
  { id: '24', name: 'addressStreet', label: 'Street Address', type: 'text', section: 'contactInfo', required: false, active: true, placeholder: '123 Main St, Suite 4' },
  { id: '25', name: 'city', label: 'City', type: 'text', section: 'contactInfo', required: false, active: true, placeholder: 'City' },
  { id: '26', name: 'state', label: 'State Jurisdiction', type: 'text', section: 'contactInfo', required: true, active: true, placeholder: 'e.g. CA' },
  { id: '27', name: 'areaCode', label: 'Area / Zip Code', type: 'text', section: 'contactInfo', required: false, active: true, placeholder: '90001' },

  // ==========================================
  // SECTION 3: POWER OF ATTORNEY
  // ==========================================
  { id: '28', name: 'powerOfAttorney', label: 'Power of Attorney Active?', type: 'checkbox', section: 'poa', required: false, active: true },
  { id: '29', name: 'victimName', label: 'Victim First Name', type: 'text', section: 'poa', required: false, active: true, placeholder: 'Victim First Name' },
  { id: '30', name: 'victimFullName', label: 'Victim Full Name', type: 'text', section: 'poa', required: false, active: true, placeholder: 'Victim Full Name' },
  { id: '31', name: 'victimLastName', label: 'Victim Last Name', type: 'text', section: 'poa', required: false, active: true, placeholder: 'Victim Last Name' },
  { id: '32', name: 'victimDOB', label: 'Victim Date of Birth', type: 'date', section: 'poa', required: false, active: true },
  { id: '33', name: 'victimDOD', label: 'Victim Date of Death (if deceased)', type: 'date', section: 'poa', required: false, active: true },

  // ==========================================
  // SECTION 4: DIAGNOSIS & INCIDENT INFORMATION
  // ==========================================
  { id: '34', name: 'incidentType', label: 'Which Incident Occurred', type: 'select', section: 'diagnosis', required: false, active: true, options: INCIDENT_TYPE_OPTIONS },
  { id: '35', name: 'diagnosis', label: 'Medical Diagnosis', type: 'select', section: 'diagnosis', required: true, active: true, options: DIAGNOSIS_OPTIONS },
  { id: '36', name: 'diagnosisYear', label: 'Diagnosis Year / Date', type: 'date', section: 'diagnosis', required: false, active: true },
  { id: '37', name: 'diagnosingDoctorName', label: "Diagnosing Doctor's Name", type: 'text', section: 'diagnosis', required: false, active: true, placeholder: 'Dr. Full Name' },
  { id: '38', name: 'treatingDoctorName', label: "Treating Doctor's Name", type: 'text', section: 'diagnosis', required: false, active: true, placeholder: 'Dr. Full Name' },
  { id: '39', name: 'diagnosingHospitalName', label: "Diagnosing Hospital's Name", type: 'text', section: 'diagnosis', required: false, active: true, placeholder: 'Hospital / Medical Center' },
  { id: '40', name: 'treatingFacilityName', label: 'Treating Facility Name', type: 'text', section: 'diagnosis', required: false, active: true, placeholder: 'Treating Clinic / Facility' },
  { id: '41', name: 'diagnosingHospitalAddress', label: "Diagnosing Hospital's Address", type: 'text', section: 'diagnosis', required: false, active: true, placeholder: 'Hospital Full Address' },
  { id: '42', name: 'treatingFacilityAddress', label: 'Treating Facility Address', type: 'text', section: 'diagnosis', required: false, active: true, placeholder: 'Facility Full Address' },
  { id: '43', name: 'diagnosingFacilityPhone', label: 'Diagnosing Facility Phone Number', type: 'text', section: 'diagnosis', required: false, active: true, placeholder: '(123) 456-7890' },
  { id: '44', name: 'treatingFacilityPhone', label: 'Treating Facility Phone Number', type: 'text', section: 'diagnosis', required: false, active: true, placeholder: '(123) 456-7890' },
];

export default function AdminFormEditPage() {
  const { vendors, campaigns, fetchData } = useCRMStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'publicLinks'>('editor');
  const [fields, setFields] = useState<FormFieldDefinition[]>(DEFAULT_FORM_FIELDS);
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Vendor & Campaign Selection State
  const [selectedVendorId, setSelectedVendorId] = useState<string>('all');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLinkToken, setCopiedLinkToken] = useState<string | null>(null);
  const [isSavingSchema, setIsSavingSchema] = useState(false);
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);

  // Metadata & versioning
  const [schemaVersion, setSchemaVersion] = useState<number>(1);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Find active vendor object
  const selectedVendor = useMemo(() => {
    if (selectedVendorId === 'all') return null;
    return vendors.find((v) => v.id === selectedVendorId) || null;
  }, [vendors, selectedVendorId]);

  // Filter campaigns assigned to selected vendor
  const assignedCampaigns = useMemo(() => {
    if (!selectedVendorId || selectedVendorId === 'all') return campaigns;
    const vendorObj = vendors.find((v) => v.id === selectedVendorId);
    return campaigns.filter(
      (c: any) =>
        c.vendorId === selectedVendorId ||
        c.vendor?.id === selectedVendorId ||
        (c.vendorName && vendorObj?.name && c.vendorName.toLowerCase() === vendorObj.name.toLowerCase()) ||
        (c.vendor?.name && vendorObj?.name && c.vendor.name.toLowerCase() === vendorObj.name.toLowerCase()) ||
        (c.vendors && Array.isArray(c.vendors) && c.vendors.includes(selectedVendorId))
    );
  }, [campaigns, selectedVendorId, vendors]);

  // Handle Vendor Selection Change & reset campaign selection
  const handleVendorChange = (newVendorId: string) => {
    setSelectedVendorId(newVendorId);
    setSelectedCampaignId('all');
  };

  // Load server-persisted schema with local fallback
  const fetchFormSchema = useCallback(async () => {
    setIsLoadingSchema(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedVendorId !== 'all') queryParams.set('vendorId', selectedVendorId);
      if (selectedCampaignId !== 'all') queryParams.set('campaignId', selectedCampaignId);

      const url = `/api/settings/form-schema?${queryParams.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.schema && Array.isArray(data.schema.fields)) {
          setFields(data.schema.fields);
          setSchemaVersion(data.schema.version || 1);
          setUpdatedAt(data.schema.updatedAt || null);
          setUpdatedBy(data.schema.updatedBy || null);
          localStorage.setItem('lead_form_custom_schema', JSON.stringify(data.schema.fields));
          setIsLoadingSchema(false);
          setIsDirty(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend schema fetch failed, falling back to localStorage:', err);
    }

    // Fallback to localStorage if API fails
    const saved = localStorage.getItem('lead_form_custom_schema');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFields(parsed);
        }
      } catch (_) {}
    }
    setIsLoadingSchema(false);
    setIsDirty(false);
  }, [selectedVendorId, selectedCampaignId]);

  useEffect(() => {
    fetchFormSchema();
  }, [fetchFormSchema]);

  // Unsaved changes browser prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved form schema changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleRequired = (fieldId: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, required: !f.required } : f))
    );
    setIsDirty(true);
  };

  const handleToggleActive = (fieldId: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          const nextActive = f.active === undefined ? false : !f.active;
          return { ...f, active: nextActive };
        }
        return f;
      })
    );
    setIsDirty(true);
  };

  const handleLabelChange = (fieldId: string, newLabel: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, label: newLabel } : f))
    );
    setIsDirty(true);
  };

  const handleSaveSchema = async () => {
    setIsSavingSchema(true);
    try {
      const res = await fetch('/api/settings/form-schema', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields,
          vendorId: selectedVendorId !== 'all' ? selectedVendorId : null,
          campaignId: selectedCampaignId !== 'all' ? selectedCampaignId : null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.schema) {
          setSchemaVersion(data.schema.version);
          setUpdatedAt(data.schema.updatedAt);
          setUpdatedBy(data.schema.updatedBy || 'Admin');
        }
        if (selectedVendorId === 'all') {
          localStorage.setItem('lead_form_custom_schema', JSON.stringify(fields));
        } else {
          const scopedKey = selectedCampaignId !== 'all' ? `lead_form_${selectedVendorId}_${selectedCampaignId}` : `lead_form_${selectedVendorId}`;
          localStorage.setItem(scopedKey, JSON.stringify(fields));
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('lead_form_schema_updated'));
        }
        setIsDirty(false);
        const targetDesc = selectedVendorId === 'all'
          ? 'Globally for all vendors and campaigns'
          : `for ${selectedVendor?.name || 'Vendor'}${selectedCampaignId !== 'all' ? ` (${assignedCampaigns.find((c: any) => c.id === selectedCampaignId)?.name || selectedCampaignId})` : ''}`;
        showToast(data.message || `Form schema saved ${targetDesc} (v${data.schema?.version || schemaVersion})!`);
      } else {
        localStorage.setItem('lead_form_custom_schema', JSON.stringify(fields));
        setIsDirty(false);
        showToast('Form schema saved locally!');
      }
    } catch (err) {
      console.error('Failed to save schema to backend:', err);
      localStorage.setItem('lead_form_custom_schema', JSON.stringify(fields));
      setIsDirty(false);
      showToast('Form schema saved to client storage (offline mode).');
    } finally {
      setIsSavingSchema(false);
    }
  };

  const handleResetSchema = async () => {
    if (confirm('Are you sure you want to reset the form schema to default layout? This will increment the schema version.')) {
      setIsSavingSchema(true);
      const defaultFields = DEFAULT_FORM_FIELDS;
      setFields(defaultFields);
      try {
        const res = await fetch('/api/settings/form-schema', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: defaultFields,
            vendorId: selectedVendorId !== 'all' ? selectedVendorId : null,
            campaignId: selectedCampaignId !== 'all' ? selectedCampaignId : null,
          }),
        });
        const data = await res.json();
        if (data.success && data.schema) {
          setSchemaVersion(data.schema.version);
          setUpdatedAt(data.schema.updatedAt);
        }
      } catch (_) {}
      localStorage.setItem('lead_form_custom_schema', JSON.stringify(defaultFields));
      setIsDirty(false);
      setIsSavingSchema(false);
      showToast('Form layout reset to system defaults.');
    }
  };

  const handleCopyPublicLink = (vendorName: string, token: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${baseUrl}/forms/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkToken(token);
    setTimeout(() => setCopiedLinkToken(null), 2500);
  };

  const filteredFields = selectedSection === 'all'
    ? fields
    : fields.filter((f) => f.section === selectedSection);

  // Vendor list for Public Links tab
  const displayVendors = selectedVendorId === 'all'
    ? vendors
    : vendors.filter((v) => v.id === selectedVendorId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl border border-slate-800"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <FileEdit className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Lead Ingestion Form Editor & Schema Builder
                </h1>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Admin Control Panel
                </span>

                {/* Schema Version Badge */}
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-700 border border-slate-200 flex items-center gap-1">
                  <History className="h-3 w-3 text-indigo-600" />
                  Schema v{schemaVersion}
                </span>

                {/* Unsaved Changes Indicator */}
                {isDirty && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-300 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    Unsaved Changes
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Customize lead follow-up form schema, field toggles, live preview, and vendor tokens.</span>
                {updatedAt && (
                  <span className="text-2xs text-slate-400 font-mono">
                    Last updated: {new Date(updatedAt).toLocaleDateString()} {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSchema}
              disabled={isSavingSchema}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Defaults
            </button>

            <button
              onClick={handleSaveSchema}
              disabled={isSavingSchema || isLoadingSchema}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                isDirty
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 ring-2 ring-blue-400/30'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
              }`}
            >
              <Save className="h-4 w-4" />
              {isSavingSchema ? 'Saving Schema...' : isDirty ? 'Save Changes *' : 'Save Form Schema'}
            </button>
          </div>
        </div>
      </div>

      {/* VIEW TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl px-4 p-1 shadow-2xs gap-2">
        {[
          { id: 'editor', label: 'Form Schema & Field Editor', icon: Sliders },
          { id: 'preview', label: 'Live Form Preview', icon: Eye },
          { id: 'publicLinks', label: 'Vendor Public Intake Links', icon: LinkIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (isDirty && tab.id !== 'editor') {
                if (!confirm('You have unsaved changes. Continue to switch tabs?')) return;
              }
              setActiveTab(tab.id as any);
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: FORM SCHEMA & FIELD EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* VENDOR & CAMPAIGN CONTEXT SELECTOR BAR */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Target Context (Vendor & Campaign)</h3>
                <p className="text-2xs text-slate-500">
                  {selectedVendor ? `Configuring for ${selectedVendor.name}` : 'Global form configuration'}
                  {selectedCampaignId !== 'all' && assignedCampaigns.find((c: any) => c.id === selectedCampaignId)
                    ? ` • Campaign: ${assignedCampaigns.find((c: any) => c.id === selectedCampaignId)?.name}`
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Vendor Dropdown */}
              <div className="relative w-full sm:w-56">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <select
                  value={selectedVendorId}
                  onChange={(e) => handleVendorChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/15 outline-none transition-all cursor-pointer"
                >
                  <option value="all">Global (All Vendors)</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campaign Dropdown - Displays only campaigns assigned to selected vendor */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Megaphone className="h-3.5 w-3.5" />
                </div>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/15 outline-none transition-all cursor-pointer"
                >
                  <option value="all">
                    {selectedVendorId === 'all'
                      ? 'All Campaigns (Global)'
                      : assignedCampaigns.length === 0
                      ? 'No campaigns assigned to this vendor'
                      : 'All Vendor Campaigns'}
                  </option>
                  {assignedCampaigns.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Safeguard Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Schema Safeguards Active:</span> System field keys are locked to preserve database compatibility, webhook ingestions, and audit history. To remove a field without breaking historical lead data, use the <span className="font-bold underline">Hide Field</span> toggle instead of deleting it.
            </div>
          </div>

          {/* Section Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Filter Section:</span>
            {[
              { id: 'all', label: 'All Sections' },
              { id: 'leadInfo', label: '1. Lead Information' },
              { id: 'contactInfo', label: '2. Contact Information' },
              { id: 'poa', label: '3. Power of Attorney' },
              { id: 'diagnosis', label: '4. Medical Diagnosis' }
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedSection === sec.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Form Fields Table Editor */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Configured Form Fields ({filteredFields.length})</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedVendor && (
                  <span className="text-2xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    Vendor: {selectedVendor.name}
                  </span>
                )}
                {selectedCampaignId !== 'all' && (
                  <span className="text-2xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    Campaign: {assignedCampaigns.find((c: any) => c.id === selectedCampaignId)?.name || selectedCampaignId}
                  </span>
                )}
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                  Interactive Configurator
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-2xs">
                    <th className="p-3.5 font-bold">Field Key (Locked)</th>
                    <th className="p-3.5 font-bold">Display Label</th>
                    <th className="p-3.5 font-bold">Input Type</th>
                    <th className="p-3.5 font-bold">Form Section</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold">Requirement</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFields.map((field) => {
                    const isFieldActive = field.active !== false;
                    return (
                      <tr key={field.id} className={`transition-colors ${!isFieldActive ? 'bg-slate-50/80 opacity-60' : 'hover:bg-slate-50/60'}`}>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {field.name}
                            </span>
                            <span title="System Key Locked for API Compatibility">
                              <Lock className="h-3 w-3 text-slate-400" />
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleLabelChange(field.id, e.target.value)}
                            disabled={!isFieldActive}
                            className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 focus:border-blue-600 outline-none disabled:bg-slate-100"
                          />
                        </td>
                        <td className="p-3.5">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs font-mono font-bold text-slate-700 uppercase">
                            {field.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">
                          {field.section === 'leadInfo' && '1. Lead Info'}
                          {field.section === 'contactInfo' && '2. Contact Info'}
                          {field.section === 'poa' && '3. Power of Attorney'}
                          {field.section === 'diagnosis' && '4. Diagnosis'}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-bold ${
                            isFieldActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isFieldActive ? 'VISIBLE' : 'HIDDEN'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-bold ${
                              field.required
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {field.required ? 'REQUIRED *' : 'OPTIONAL'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleToggleRequired(field.id)}
                            disabled={!isFieldActive}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                              field.required
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50'
                            }`}
                          >
                            {field.required ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            {field.required ? 'Make Optional' : 'Make Required'}
                          </button>

                          <button
                            onClick={() => handleToggleActive(field.id)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                              isFieldActive
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {isFieldActive ? 'Hide Field' : 'Show Field'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE FORM PREVIEW */}
      {activeTab === 'preview' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Live Lead Ingestion Form Preview</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedVendor && (
                <span className="text-2xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  Vendor: {selectedVendor.name}
                </span>
              )}
              {selectedCampaignId !== 'all' && (
                <span className="text-2xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Campaign: {assignedCampaigns.find((c: any) => c.id === selectedCampaignId)?.name || selectedCampaignId}
                </span>
              )}
              <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Schema v{schemaVersion} Active
              </span>
            </div>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
            <NewCaseLeadFollowUpForm
              title={`Admin Preview: New Case Lead Follow Up${selectedVendor ? ` (${selectedVendor.name})` : ''}`}
              subtitle={`Previewing current configured form layout${selectedCampaignId !== 'all' && assignedCampaigns.find((c: any) => c.id === selectedCampaignId) ? ` for ${assignedCampaigns.find((c: any) => c.id === selectedCampaignId)?.name}` : ''}.`}
              showCsvOption={true}
              customSchema={fields}
              vendorId={selectedVendorId !== 'all' ? selectedVendorId : undefined}
              vendorName={selectedVendor?.name}
              initialValues={{
                campaignName: assignedCampaigns.find((c: any) => c.id === selectedCampaignId)?.name || ''
              }}
            />
          </div>
        </div>
      )}

      {/* TAB 3: VENDOR PUBLIC INTAKE LINKS */}
      {activeTab === 'publicLinks' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Public Vendor Form Intake Links</h3>
              </div>
              <span className="text-2xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Token Manager
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Direct public form URLs allow external vendors and marketing partners to submit leads directly into your CRM using active form schema rules.
            </p>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {displayVendors.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active vendors found matching selection.
                </div>
              ) : (
                displayVendors.map((v) => {
                  const token = v.id;
                  const publicUrl = `/forms/${token}`;
                  return (
                    <div key={v.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{v.name}</span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs font-mono text-slate-600 font-semibold">
                            Token: {token}
                          </span>
                        </div>
                        <span className="font-mono text-2xs text-blue-600 block">{publicUrl}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyPublicLink(v.name, token)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          {copiedLinkToken === token ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Copied Link!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-slate-500" />
                              <span>Copy Public URL</span>
                            </>
                          )}
                        </button>

                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Open Form</span>
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
