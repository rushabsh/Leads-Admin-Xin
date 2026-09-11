'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, User, Scale, Stethoscope, Check, ArrowLeft,
  Calendar, Phone, Mail, MapPin, Building2, AlertCircle, Sparkles,
  CheckCircle2, Copy, RefreshCw, Save, Upload, Download, FileSpreadsheet, X
} from 'lucide-react';
import { useCRMStore } from '@/store/crmStore';
import { useAuthStore } from '@/store/authStore';
import { getQuestionsForTort, fetchCentralQuestionsFromApi } from '@/store/tortQuestionsStore';
import api from '@/lib/api';

// ==========================================
// CONSTANTS & DROPDOWN OPTIONS
// ==========================================
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const TYPE_OPTIONS = [
  'Depo-Provera',
  'PFAS',
  'Rideshare',
  'Roblox',
  'LA County JDC Sexual Abuse',
  'Roundup',
  'Storm',
  'Talcum',
  'Wildfire',
  "Women's Prisoner Abuse",
  'Camp Lejeune',
  'NEC Baby Formula',
  'Hair Straightener',
  'Boy Scouts',
  'Mesothelioma',
  'AFFF Firefighting Foam',
  'Toxic Water Contamination',
  'Medical Malpractice',
  'Personal Injury',
  'Mass Tort - General',
  'Other'
];

export const STATUS_OPTIONS = ['New', 'In Progress', 'Sent'];
export const SUBSTATUS_OPTIONS = ['None', 'No TCPA', 'Redo TCPA', 'TCPA OK'];
export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer Not to Say'];
export const YES_NO_OPTIONS = ['Yes', 'No'];
export const YES_NO_UPPER_OPTIONS = ['YES', 'NO'];
export const RIDESHARE_PROVIDER_OPTIONS = ['Lyft', 'UBER'];
export const REPORTED_TO_OPTIONS = ['Parents', 'Sibling', 'Relatives', 'Friends'];

export const INCIDENT_TYPE_OPTIONS = [
  'Oral Vaginal/anal – Rape',
  'Vaginal/anal – Penetration',
  'Digital penetration',
  'Grooming / Sexual Exploitation',
  'Physical Abuse',
  'Other'
];

export const DIAGNOSIS_OPTIONS = [
  'Sexual Dysfunction',
  'PTSD (Post-Traumatic Stress Disorder)',
  'Anxiety',
  'Depression',
  'Non-Hodgkin Lymphoma',
  'Renal Carcinoma / Kidney Cancer',
  'Leukemia / Blood Cancer',
  'Ovarian Cancer',
  'Parkinson\'s Disease',
  'Prostate Cancer',
  'Bladder Cancer',
  'Liver Cancer / Damage',
  'Multiple Myeloma',
  'Necrotizing Enterocolitis (NEC)',
  'Uterine Cancer',
  'Respiratory Illness / Lung Cancer',
  'Trauma / Physical Injury',
  'Sexual Abuse / Trauma',
  'Property / Environmental Loss',
  'Other Medical Condition'
];

export const LA_JDC_FACILITIES = [
  'MacLaren Hall',
  'Barry J. Nidorf Juvenile Hall (Sylmar)',
  'Los Padrinos Juvenile Hall',
  'Central Juvenile Hall',
  'Camp David Gonzales',
  'Camp Jarvis',
  'Camp Karl Holton',
  'Camp Kenyon Scudder',
  'Camp Kilpatrick',
  'Camp McNair',
  'Camp Onizuka',
  'Camp Resnick',
  'Camp Scobee',
  'Camp Scott',
  'Camp Smith',
  'Challenger Camps',
  'Los Prietos Boys Camp',
  'Dorothy F. Kirby Center',
  'Fred C. Nelles Youth Correctional Facility',
  'LAC Afflerbaugh-Paige Camp',
  'Southern Youth Correctional Reception Center & Clinic',
  'Other LA County Facility'
];

export const ROBLOX_EXCLUDED_STATES = ['CA', 'FL', 'CO', 'LA'];

// ==========================================
// FORM DATA INTERFACE & INITIAL STATE
// ==========================================
export interface LeadFollowUpFormData {
  // 1. Lead Information
  contactName: string;
  campaignName: string;
  type: string;
  status: string;
  leadName: string;
  substatus: string;
  billable: boolean;
  reasonForRejection: string;
  dateSent: string;
  dateSubscribed: string;
  tier: string;
  reasonForDQ: string;
  reasonForDoesntMeetCriteria: string;
  reasonForSpam: string;
  trustedForm: string;
  callDuration: string;

  // 2. Contact Information
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  addressStreet: string;
  city: string;
  state: string;
  areaCode: string;

  // 3. POA
  powerOfAttorney: boolean;
  victimName: string;
  victimFullName: string;
  victimLastName: string;
  victimDOB: string;
  victimDOD: string;

  // 4. Incident & Diagnosis Information
  incidentType: string;
  diagnosis: string;
  diagnosisYear: string;
  diagnosingDoctorName: string;
  treatingDoctorName: string;
  diagnosingHospitalName: string;
  treatingFacilityName: string;
  diagnosingHospitalAddress: string;
  treatingFacilityAddress: string;
  diagnosingFacilityPhone: string;
  treatingFacilityPhone: string;

  // 5. Campaign Screening & Qualification Criteria
  // Roblox specific
  robloxGamertag: string;
  robloxAccountAccess: string;
  robloxEvidenceTypes: string;
  robloxGroomingDoctorName: string;

  // LA County JDC specific
  jdcFacility: string;
  jdcAbuserInfo: string;
  jdcAbuserRole: string;
  jdcWitnessAvailable: string;
  jdcInmateOnInmate: string;

  // Rideshare (Uber/Lyft) specific
  rideshareProvider: string;
  rideshareAssaulted: string;
  rideshareProofOfRide: string;
  rideshareDriverName: string;
  rideshareIncidentAddress: string;
  rideshareIncidentDate: string;
  rideshareNarrative: string;
  rideshareReportedTo: string;
  rideshareSymptomsDetails: string;
  rideshareSymptomsDate: string;
  rideshareDiagnosisTestDetails: string;
  rideshareDiagnosisTestDate: string;
  rideshareTreatmentDetails: string;
  rideshareTreatmentDate: string;
  legalRepresentation: string;
  felonyConviction: string;
  hasMedicalRecords: string;
}

export const DEFAULT_LEAD_FOLLOW_UP_FORM_DATA: LeadFollowUpFormData = {
  contactName: '',
  campaignName: '',
  type: 'PFAS',
  status: 'New',
  leadName: '',
  substatus: 'None',
  billable: true,
  reasonForRejection: '',
  dateSent: new Date().toISOString().split('T')[0],
  dateSubscribed: '',
  tier: 'Tier 1',
  reasonForDQ: '',
  reasonForDoesntMeetCriteria: '',
  reasonForSpam: '',
  trustedForm: '',
  callDuration: '',

  firstName: '',
  middleName: '',
  lastName: '',
  gender: 'Male',
  dateOfBirth: '',
  phoneNumber: '',
  email: '',
  addressStreet: '',
  city: '',
  state: 'CA',
  areaCode: '',

  powerOfAttorney: false,
  victimName: '',
  victimFullName: '',
  victimLastName: '',
  victimDOB: '',
  victimDOD: '',

  incidentType: 'Oral Vaginal/anal – Rape',
  diagnosis: 'PTSD (Post-Traumatic Stress Disorder)',
  diagnosisYear: '',
  diagnosingDoctorName: '',
  treatingDoctorName: '',
  diagnosingHospitalName: '',
  treatingFacilityName: '',
  diagnosingHospitalAddress: '',
  treatingFacilityAddress: '',
  diagnosingFacilityPhone: '',
  treatingFacilityPhone: '',

  robloxGamertag: '',
  robloxAccountAccess: 'Yes',
  robloxEvidenceTypes: '',
  robloxGroomingDoctorName: '',

  jdcFacility: 'MacLaren Hall',
  jdcAbuserInfo: '',
  jdcAbuserRole: '',
  jdcWitnessAvailable: 'Yes',
  jdcInmateOnInmate: 'No',

  rideshareProvider: 'Uber',
  rideshareAssaulted: 'Yes',
  rideshareProofOfRide: 'Yes',
  rideshareDriverName: '',
  rideshareIncidentAddress: '',
  rideshareIncidentDate: '',
  rideshareNarrative: '',
  rideshareReportedTo: 'Parents',
  rideshareSymptomsDetails: '',
  rideshareSymptomsDate: '',
  rideshareDiagnosisTestDetails: '',
  rideshareDiagnosisTestDate: '',
  rideshareTreatmentDetails: '',
  rideshareTreatmentDate: '',
  legalRepresentation: 'No',
  felonyConviction: 'No',
  hasMedicalRecords: 'Yes',
};

// ==========================================
// REUSABLE HELPER UI COMPONENTS
// ==========================================
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ label, required, className = '', ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
      <span>{label} {required && <span className="text-rose-500">*</span>}</span>
    </label>
    <input
      required={required}
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 outline-none shadow-xs transition-all ${className}`}
    />
  </div>
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  required?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, options, required, className = '', ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
      <span>{label} {required && <span className="text-rose-500">*</span>}</span>
    </label>
    <select
      required={required}
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 outline-none shadow-xs transition-all cursor-pointer ${className}`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

interface FormSectionCardProps {
  number: number;
  title: string;
  badge: string;
  colorTheme: 'blue' | 'indigo' | 'amber' | 'emerald';
  children: React.ReactNode;
}

const FormSectionCard: React.FC<FormSectionCardProps> = ({ number, title, badge, colorTheme, children }) => {
  const themeClasses = {
    blue: { bg: 'bg-blue-100 text-blue-700', badgeBg: 'bg-blue-50', badgeBorder: 'border-blue-200' },
    indigo: { bg: 'bg-indigo-100 text-indigo-700', badgeBg: 'bg-indigo-50', badgeBorder: 'border-indigo-200' },
    amber: { bg: 'bg-amber-100 text-amber-700', badgeBg: 'bg-amber-50', badgeBorder: 'border-amber-200' },
    emerald: { bg: 'bg-emerald-100 text-emerald-700', badgeBg: 'bg-emerald-50', badgeBorder: 'border-emerald-200' },
  }[colorTheme];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        <div className="border-b border-slate-100 bg-slate-50/80 p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${themeClasses.bg} font-bold text-xs shadow-xs`}>
              {number}
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.bg} ${themeClasses.badgeBg} px-2.5 py-0.5 rounded-full border ${themeClasses.badgeBorder}`}>
            {badge}
          </span>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
};

// CSV Line Parser Utility
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

// ==========================================
// REUSABLE NEW CASE LEAD FOLLOW UP FORM PROPS
// ==========================================
export interface NewCaseLeadFollowUpFormProps {
  initialValues?: Partial<LeadFollowUpFormData>;
  onSuccess?: (leadData: any) => void;
  onCancel?: () => void;
  isModal?: boolean;
  isEditMode?: boolean;
  leadId?: string;
  title?: string;
  subtitle?: string;
  vendorId?: string;
  vendorName?: string;
  showCsvOption?: boolean;
  className?: string;
  customSchema?: any[];
}

export default function NewCaseLeadFollowUpForm({
  initialValues,
  onSuccess,
  onCancel,
  isModal = false,
  isEditMode = false,
  leadId,
  title = "New Case: Lead Follow Up",
  subtitle = "Fill out the grouped sections below to record complete case follow-up data.",
  vendorId,
  vendorName,
  showCsvOption = false,
  className = "",
  customSchema
}: NewCaseLeadFollowUpFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addLead, fetchData, fetchCampaigns, fetchVendors, campaigns, vendors } = useCRMStore();

  const activeVendorId = vendorId || user?.vendorId || 'ven-1';
  const matchedVendor = (vendors || []).find(
    (v: any) => v.id === activeVendorId || (vendorName && v.name?.toLowerCase() === vendorName.toLowerCase())
  );
  const activeVendorName = vendorName || matchedVendor?.name || user?.name || 'Premier Leads LLC';

  const [formData, setFormData] = useState<LeadFollowUpFormData>({
    ...DEFAULT_LEAD_FOLLOW_UP_FORM_DATA,
    ...initialValues
  });

  const [activeSchema, setActiveSchema] = useState<any[]>(customSchema || []);

  useEffect(() => {
    if (customSchema && customSchema.length > 0) {
      setActiveSchema(customSchema);
      return;
    }

    let isMounted = true;
    const fetchSchema = async () => {
      try {
        const matchedCamp = (campaigns || []).find(
          (c: any) => c.name === formData.campaignName || c.id === formData.campaignName
        );
        const campId = matchedCamp?.id;
        const q = new URLSearchParams();
        if (activeVendorId && activeVendorId !== 'all') q.set('vendorId', activeVendorId);
        if (campId) q.set('campaignId', campId);

        const res = await fetch(`/api/settings/form-schema?${q.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.schema?.fields && isMounted) {
            setActiveSchema(data.schema.fields);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote form schema, checking localStorage fallback:', err);
      }

      const saved = typeof window !== 'undefined' ? localStorage.getItem('lead_form_custom_schema') : null;
      if (saved && isMounted) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActiveSchema(parsed);
          }
        } catch (_) { }
      }
    };

    fetchSchema();

    const handleSchemaEvent = () => {
      fetchSchema();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('lead_form_schema_updated', handleSchemaEvent);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('lead_form_schema_updated', handleSchemaEvent);
      }
    };
  }, [customSchema, activeVendorId, formData.campaignName, campaigns]);

  useEffect(() => {
    fetchCentralQuestionsFromApi();
  }, []);

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues
      }));
    }
  }, [initialValues, vendorId]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // CSV Import Modal State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvParsedRows, setCsvParsedRows] = useState<any[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!campaigns || campaigns.length === 0) {
      fetchCampaigns();
    }
    if (!vendors || vendors.length === 0) {
      fetchVendors();
    }
  }, [campaigns, vendors, fetchCampaigns, fetchVendors]);

  // Filter campaigns available for this vendor
  const availableVendorCampaigns = React.useMemo(() => {
    if (!campaigns || campaigns.length === 0) return [];

    const filtered = campaigns.filter((c: any) => {
      // 1. Direct vendorId match
      if (activeVendorId && (c.vendorId === activeVendorId || c.vendor?.id === activeVendorId)) {
        return true;
      }
      // 2. Multi-vendor array match if present
      if (activeVendorId && Array.isArray(c.vendors) && c.vendors.includes(activeVendorId)) {
        return true;
      }
      // 3. Match by vendor name
      const campVendorName = c.vendorName || c.vendor?.name;
      if (campVendorName) {
        if (activeVendorName && campVendorName.toLowerCase() === activeVendorName.toLowerCase()) {
          return true;
        }
        if (matchedVendor?.name && campVendorName.toLowerCase() === matchedVendor.name.toLowerCase()) {
          return true;
        }
      }
      return false;
    });

    if (filtered.length > 0) return filtered;

    // Fallback: If no vendor-specific matches found, provide all campaigns
    return campaigns;
  }, [campaigns, activeVendorId, activeVendorName, matchedVendor]);

  // If formData.campaignName is empty and availableVendorCampaigns is populated, set default
  useEffect(() => {
    if (!formData.campaignName && availableVendorCampaigns.length > 0 && !initialValues?.campaignName) {
      setFormData((prev) => {
        if (prev.campaignName) return prev;
        return {
          ...prev,
          campaignName: availableVendorCampaigns[0].name
        };
      });
    }
  }, [availableVendorCampaigns, initialValues?.campaignName, formData.campaignName]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getFieldMeta = useCallback((name: string, defaultLabel: string, defaultRequired: boolean = false) => {
    if (!activeSchema || activeSchema.length === 0) {
      return { label: defaultLabel, required: defaultRequired, active: true };
    }
    const found = activeSchema.find((f: any) => f.name === name);
    if (!found) return { label: defaultLabel, required: defaultRequired, active: true };
    return {
      label: found.label || defaultLabel,
      required: found.required !== undefined ? found.required : defaultRequired,
      active: found.active !== false,
    };
  }, [activeSchema]);

  const isFieldActive = (name: string) => getFieldMeta(name, '', false).active;
  const getMeta = (name: string, defaultLabel: string, defaultRequired: boolean = false) =>
    getFieldMeta(name, defaultLabel, defaultRequired);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleResetForm = () => {
    if (confirm('Are you sure you want to reset all fields in this form?')) {
      setFormData({
        ...DEFAULT_LEAD_FOLLOW_UP_FORM_DATA,
        ...initialValues
      });
      showToast('Form reset to default values.', 'success');
    }
  };

  const copyPayloadJson = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    showToast('Form JSON copied to clipboard!', 'success');
  };

  // Build complete structured payload for lead database persistence
  const buildLeadPayload = (data: LeadFollowUpFormData) => {
    const primaryFirstName = data.firstName || data.leadName || data.contactName || 'Lead';
    const primaryLastName = data.lastName || 'FollowUp';
    const primaryPhone = data.phoneNumber || '(555) 000-0000';
    const primaryEmail = data.email || 'lead@example.com';
    const primaryState = data.state || 'CA';

    const selectedCampaign = (campaigns || []).find(
      (c: any) => c.name?.toLowerCase() === (data.campaignName || '').toLowerCase()
    ) || (campaigns || []).find(
      (c: any) => (c.vendorId === activeVendorId || c.vendorName === activeVendorName) && (c.tortName === data.type || c.massTort?.name === data.type)
    ) || (campaigns || []).find((c: any) => c.vendorId === activeVendorId) || (campaigns || [])[0];

    const finalCampaignName = data.campaignName || selectedCampaign?.name || `${data.type} Campaign`;
    const resolvedCampaignId = selectedCampaign?.id || activeVendorId;

    const caseDetailsFormatted = JSON.stringify({
      leadInfo: {
        contactName: data.contactName,
        campaignName: finalCampaignName,
        type: data.type,
        status: data.status,
        leadName: data.leadName,
        substatus: data.substatus,
        billable: data.billable,
        reasonForRejection: data.reasonForRejection,
        dateSent: data.dateSent,
        dateSubscribed: data.dateSubscribed,
        tier: data.tier,
        reasonForDQ: data.reasonForDQ,
        reasonForDoesntMeetCriteria: data.reasonForDoesntMeetCriteria,
        reasonForSpam: data.reasonForSpam,
        trustedForm: data.trustedForm,
        callDuration: data.callDuration,
      },
      contactInfo: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        phoneNumber: data.phoneNumber,
        email: data.email,
        addressStreet: data.addressStreet,
        city: data.city,
        state: data.state,
        areaCode: data.areaCode,
      },
      poa: {
        powerOfAttorney: data.powerOfAttorney,
        victimName: data.victimName,
        victimFullName: data.victimFullName,
        victimLastName: data.victimLastName,
        victimDOB: data.victimDOB,
        victimDOD: data.victimDOD,
      },
      diagnosisInfo: {
        incidentType: data.incidentType,
        diagnosis: data.diagnosis,
        diagnosisYear: data.diagnosisYear,
        diagnosingDoctorName: data.diagnosingDoctorName,
        treatingDoctorName: data.treatingDoctorName,
        diagnosingHospitalName: data.diagnosingHospitalName,
        treatingFacilityName: data.treatingFacilityName,
        diagnosingHospitalAddress: data.diagnosingHospitalAddress,
        treatingFacilityAddress: data.treatingFacilityAddress,
        diagnosingFacilityPhone: data.diagnosingFacilityPhone,
        treatingFacilityPhone: data.treatingFacilityPhone,
      },
      screeningCriteria: {
        ...data,
        // Roblox
        robloxGamertag: data.robloxGamertag,
        robloxAccountAccess: data.robloxAccountAccess,
        robloxEvidenceTypes: data.robloxEvidenceTypes,
        robloxGroomingDoctorName: data.robloxGroomingDoctorName,
        // LA JDC
        jdcFacility: data.jdcFacility,
        jdcAbuserInfo: data.jdcAbuserInfo,
        jdcAbuserRole: data.jdcAbuserRole,
        jdcWitnessAvailable: data.jdcWitnessAvailable,
        jdcInmateOnInmate: data.jdcInmateOnInmate,
        // Rideshare
        rideshareProvider: data.rideshareProvider,
        rideshareAssaulted: data.rideshareAssaulted,
        rideshareProofOfRide: data.rideshareProofOfRide,
        rideshareDriverName: data.rideshareDriverName,
        rideshareIncidentAddress: data.rideshareIncidentAddress,
        rideshareIncidentDate: data.rideshareIncidentDate,
        rideshareNarrative: data.rideshareNarrative,
        rideshareReportedTo: data.rideshareReportedTo,
        rideshareSymptomsDetails: data.rideshareSymptomsDetails,
        rideshareSymptomsDate: data.rideshareSymptomsDate,
        rideshareDiagnosisTestDetails: data.rideshareDiagnosisTestDetails,
        rideshareDiagnosisTestDate: data.rideshareDiagnosisTestDate,
        rideshareTreatmentDetails: data.rideshareTreatmentDetails,
        rideshareTreatmentDate: data.rideshareTreatmentDate,
        legalRepresentation: data.legalRepresentation,
        felonyConviction: data.felonyConviction,
        hasMedicalRecords: data.hasMedicalRecords
      }
    }, null, 2);

    return {
      firstName: primaryFirstName,
      lastName: primaryLastName,
      phone: primaryPhone,
      email: primaryEmail,
      state: primaryState,
      priority: data.tier === 'Tier 1' ? 'HIGH' : 'MEDIUM',
      status: data.status.toUpperCase() === 'NEW' ? 'NEW' : data.status.toUpperCase() === 'SENT' ? 'QUALIFIED' : 'CONTACTED',
      campaignId: resolvedCampaignId,
      campaignName: finalCampaignName,
      tortName: data.type,
      vendorId: activeVendorId,
      vendorName: activeVendorName,
      sourceName: 'Vendor Portal Lead Follow Up Form',
      dob: data.dateOfBirth,
      gender: data.gender,
      address: `${data.addressStreet}, ${data.city}, ${data.state} ${data.areaCode}`.trim(),
      diagnosis: data.diagnosis,
      hospital: data.diagnosingHospitalName || data.treatingFacilityName || '',
      caseDetails: caseDetailsFormatted
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate schema-defined required active fields
      for (const field of activeSchema) {
        if (field.active !== false && field.required) {
          const val = (formData as any)[field.name];
          if (val === undefined || val === null || val === '' || (field.type === 'checkbox' && !val)) {
            showToast(`Field "${field.label || field.name}" is required.`, 'error');
            setIsSubmitting(false);
            return;
          }
        }
      }

      const payload = buildLeadPayload(formData);

      if (isEditMode && leadId) {
        const updateRes = await api.put(`/leads/${leadId}`, payload);
        if (updateRes.data?.success) {
          showToast('Lead details updated successfully!', 'success');
          await fetchData(true);
          if (onSuccess) {
            onSuccess(updateRes.data.lead || payload);
          }
          return;
        } else {
          throw new Error(updateRes.data?.message || 'Failed to update lead');
        }
      }

      let createdLead: any = null;
      try {
        const res = await api.post('/leads', payload);
        if (res.data?.success && res.data?.lead) {
          createdLead = res.data.lead;
        }
      } catch (apiErr) {
        console.warn('Direct authenticated API POST lead creation failed, attempting public submit fallback:', apiErr);
        try {
          const publicRes = await fetch('/api/public/submit-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendorToken: activeVendorId,
              vendorId: activeVendorId,
              vendorName: activeVendorName,
              ...formData
            })
          });
          const publicData = await publicRes.json();
          if (publicData.success && publicData.data) {
            createdLead = publicData.data;
          }
        } catch (pubErr) {
          console.warn('Public submit lead fallback error:', pubErr);
        }
      }

      try {
        await addLead(createdLead || payload);
        await fetchData(true);
      } catch (_) { }

      showToast('"New Case: Lead Follow Up" saved to database successfully!', 'success');

      if (onSuccess) {
        onSuccess(createdLead || payload);
      } else {
        setTimeout(() => {
          if (window.location.pathname.startsWith('/forms')) {
            window.location.reload();
          } else {
            router.push('/vendor-portal/leads');
          }
        }, 1200);
      }
    } catch (err: any) {
      console.error('Error submitting lead follow up form:', err);
      showToast(err?.message || 'Failed to submit form. Please check input fields.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // CSV FILE HANDLING & IMPORT
  // ==========================================
  const handleCSVFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          setCsvError('CSV file must contain a header row and at least 1 data row.');
          return;
        }

        const rawHeaders = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
        const rows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = parseCSVLine(lines[i]);
          const rowObj: any = {};
          rawHeaders.forEach((h, idx) => {
            rowObj[h] = values[idx] || '';
          });
          rows.push(rowObj);
        }

        if (rows.length === 0) {
          setCsvError('No valid data rows found in CSV file.');
          return;
        }

        setCsvParsedRows(rows);
      } catch (err) {
        setCsvError('Failed to parse CSV file. Ensure it is valid CSV format.');
      }
    };
    reader.readAsText(file);
  };

  const handleApplySingleCsvRowToForm = () => {
    if (csvParsedRows.length === 0) return;
    const row = csvParsedRows[0];

    setFormData({
      contactName: row.contactName || row['Contact Name'] || row.contactname || '',
      campaignName: row.campaignName || row['Campaign Name'] || '',
      type: row.type || row['Type'] || 'PFAS',
      status: row.status || row['Status'] || 'New',
      leadName: row.leadName || row['Lead Name'] || '',
      substatus: row.substatus || row['Substatus'] || 'None',
      billable: row.billable !== undefined ? String(row.billable).toLowerCase() === 'true' : true,
      reasonForRejection: row.reasonForRejection || row['Reason for Rejection'] || '',
      dateSent: row.dateSent || row['Date Sent'] || new Date().toISOString().split('T')[0],
      dateSubscribed: row.dateSubscribed || row['Date Subscribed'] || '',
      tier: row.tier || row['Tier'] || 'Tier 1',
      reasonForDQ: row.reasonForDQ || row['Reason for DQ'] || '',
      reasonForDoesntMeetCriteria: row.reasonForDoesntMeetCriteria || row["Reason for Doesn't Meet Criteria"] || '',
      reasonForSpam: row.reasonForSpam || row['Reason for Spam'] || '',
      trustedForm: row.trustedForm || row['Trusted Form'] || '',
      callDuration: row.callDuration || row['Call Duration'] || '',

      firstName: row.firstName || row['First Name'] || row.firstname || '',
      middleName: row.middleName || row['Middle Name'] || '',
      lastName: row.lastName || row['Last Name'] || row.lastname || '',
      gender: row.gender || row['Gender'] || 'Male',
      dateOfBirth: row.dateOfBirth || row['Date of Birth'] || row.dob || '',
      phoneNumber: row.phoneNumber || row['Phone Number'] || row.phone || '',
      email: row.email || row['Email'] || '',
      addressStreet: row.addressStreet || row['Address Street'] || row.address || '',
      city: row.city || row['City'] || '',
      state: row.state || row['State'] || 'CA',
      areaCode: row.areaCode || row['Area Code'] || '',

      powerOfAttorney: row.powerOfAttorney !== undefined ? String(row.powerOfAttorney).toLowerCase() === 'true' : false,
      victimName: row.victimName || row['Victim Name'] || '',
      victimFullName: row.victimFullName || row['Victim Full Name'] || '',
      victimLastName: row.victimLastName || row['Victim Last Name'] || '',
      victimDOB: row.victimDOB || row['Victim DOB'] || '',
      victimDOD: row.victimDOD || row['Victim DOD'] || '',

      incidentType: row.incidentType || row['Incident Type'] || 'Oral Vaginal/anal – Rape',
      diagnosis: row.diagnosis || row['Diagnosis'] || 'PTSD (Post-Traumatic Stress Disorder)',
      diagnosisYear: row.diagnosisYear || row['Diagnosis Year'] || '',
      diagnosingDoctorName: row.diagnosingDoctorName || row["Diagnosing Doctor's Name"] || '',
      treatingDoctorName: row.treatingDoctorName || row["Treating Doctor's Name"] || '',
      diagnosingHospitalName: row.diagnosingHospitalName || row["Diagnosing Hospital's Name"] || '',
      treatingFacilityName: row.treatingFacilityName || row['Treating Facility Name'] || '',
      diagnosingHospitalAddress: row.diagnosingHospitalAddress || row["Diagnosing Hospital's Address"] || '',
      treatingFacilityAddress: row.treatingFacilityAddress || row['Treating Facility Address'] || '',
      diagnosingFacilityPhone: row.diagnosingFacilityPhone || row['Diagnosing Facility Phone Number'] || '',
      treatingFacilityPhone: row.treatingFacilityPhone || row['Treating Facility Phone Number'] || '',

      robloxGamertag: row.robloxGamertag || row['Roblox Gamertag'] || '',
      robloxAccountAccess: row.robloxAccountAccess || row['Roblox Account Access'] || 'Yes',
      robloxEvidenceTypes: row.robloxEvidenceTypes || row['Roblox Evidence Types'] || '',
      robloxGroomingDoctorName: row.robloxGroomingDoctorName || row['Roblox Grooming Doctor Name'] || '',

      jdcFacility: row.jdcFacility || row['JDC Facility'] || 'MacLaren Hall',
      jdcAbuserInfo: row.jdcAbuserInfo || row['JDC Abuser Info'] || '',
      jdcAbuserRole: row.jdcAbuserRole || row['JDC Abuser Role'] || '',
      jdcWitnessAvailable: row.jdcWitnessAvailable || row['JDC Witness Available'] || 'Yes',
      jdcInmateOnInmate: row.jdcInmateOnInmate || row['JDC Inmate On Inmate'] || 'No',

      rideshareProvider: row.rideshareProvider || row['Rideshare Provider'] || 'Uber',
      rideshareAssaulted: row.rideshareAssaulted || row['Rideshare Assaulted'] || 'Yes',
      rideshareProofOfRide: row.rideshareProofOfRide || row['Rideshare Proof Of Ride'] || 'Yes',
      rideshareDriverName: row.rideshareDriverName || row['Rideshare Driver Name'] || '',
      rideshareIncidentAddress: row.rideshareIncidentAddress || row['Rideshare Incident Address'] || '',
      rideshareIncidentDate: row.rideshareIncidentDate || row['Rideshare Incident Date'] || '',
      rideshareNarrative: row.rideshareNarrative || row['Rideshare Narrative'] || '',
      rideshareReportedTo: row.rideshareReportedTo || row['Rideshare Reported To'] || 'Parents',
      rideshareSymptomsDetails: row.rideshareSymptomsDetails || row['Rideshare Symptoms Details'] || '',
      rideshareSymptomsDate: row.rideshareSymptomsDate || row['Rideshare Symptoms Date'] || '',
      rideshareDiagnosisTestDetails: row.rideshareDiagnosisTestDetails || row['Rideshare Diagnosis Test Details'] || '',
      rideshareDiagnosisTestDate: row.rideshareDiagnosisTestDate || row['Rideshare Diagnosis Test Date'] || '',
      rideshareTreatmentDetails: row.rideshareTreatmentDetails || row['Rideshare Treatment Details'] || '',
      rideshareTreatmentDate: row.rideshareTreatmentDate || row['Rideshare Treatment Date'] || '',
      legalRepresentation: row.legalRepresentation || row['Legal Representation'] || 'No',
      felonyConviction: row.felonyConviction || row['Felony Conviction'] || 'No',
      hasMedicalRecords: row.hasMedicalRecords || row['Has Medical Records'] || 'Yes',
    });

    setShowCsvModal(false);
    setCsvParsedRows([]);
    showToast('Loaded CSV row data into form!', 'success');
  };

  const handleBulkImportCsvToDatabase = async () => {
    if (csvParsedRows.length === 0) return;
    setIsImportingCsv(true);
    let importedCount = 0;

    for (let i = 0; i < csvParsedRows.length; i++) {
      const row = csvParsedRows[i];
      const mappedFormData: LeadFollowUpFormData = {
        contactName: row.contactName || row['Contact Name'] || '',
        campaignName: row.campaignName || row['Campaign Name'] || '',
        type: row.type || row['Type'] || 'PFAS',
        status: row.status || row['Status'] || 'New',
        leadName: row.leadName || row['Lead Name'] || '',
        substatus: row.substatus || row['Substatus'] || 'None',
        billable: row.billable !== undefined ? String(row.billable).toLowerCase() === 'true' : true,
        reasonForRejection: row.reasonForRejection || '',
        dateSent: row.dateSent || new Date().toISOString().split('T')[0],
        dateSubscribed: row.dateSubscribed || '',
        tier: row.tier || 'Tier 1',
        reasonForDQ: row.reasonForDQ || '',
        reasonForDoesntMeetCriteria: row.reasonForDoesntMeetCriteria || '',
        reasonForSpam: row.reasonForSpam || '',
        trustedForm: row.trustedForm || '',
        callDuration: row.callDuration || '',

        firstName: row.firstName || row['First Name'] || `Lead-${i + 1}`,
        middleName: row.middleName || '',
        lastName: row.lastName || row['Last Name'] || 'CSV',
        gender: row.gender || 'Male',
        dateOfBirth: row.dateOfBirth || '',
        phoneNumber: row.phoneNumber || row['Phone Number'] || '(555) 000-0000',
        email: row.email || row['Email'] || `lead${i + 1}@csvimport.com`,
        addressStreet: row.addressStreet || '',
        city: row.city || '',
        state: row.state || 'CA',
        areaCode: row.areaCode || '',

        powerOfAttorney: row.powerOfAttorney !== undefined ? String(row.powerOfAttorney).toLowerCase() === 'true' : false,
        victimName: row.victimName || '',
        victimFullName: row.victimFullName || '',
        victimLastName: row.victimLastName || '',
        victimDOB: row.victimDOB || '',
        victimDOD: row.victimDOD || '',

        incidentType: row.incidentType || row['Incident Type'] || 'Oral Vaginal/anal – Rape',
        diagnosis: row.diagnosis || row['Diagnosis'] || 'PTSD (Post-Traumatic Stress Disorder)',
        diagnosisYear: row.diagnosisYear || '',
        diagnosingDoctorName: row.diagnosingDoctorName || '',
        treatingDoctorName: row.treatingDoctorName || '',
        diagnosingHospitalName: row.diagnosingHospitalName || '',
        treatingFacilityName: row.treatingFacilityName || '',
        diagnosingHospitalAddress: row.diagnosingHospitalAddress || '',
        treatingFacilityAddress: row.treatingFacilityAddress || '',
        diagnosingFacilityPhone: row.diagnosingFacilityPhone || '',
        treatingFacilityPhone: row.treatingFacilityPhone || '',

        robloxGamertag: row.robloxGamertag || row['Roblox Gamertag'] || '',
        robloxAccountAccess: row.robloxAccountAccess || row['Roblox Account Access'] || 'Yes',
        robloxEvidenceTypes: row.robloxEvidenceTypes || row['Roblox Evidence Types'] || '',
        robloxGroomingDoctorName: row.robloxGroomingDoctorName || row['Roblox Grooming Doctor Name'] || '',

        jdcFacility: row.jdcFacility || row['JDC Facility'] || 'MacLaren Hall',
        jdcAbuserInfo: row.jdcAbuserInfo || row['JDC Abuser Info'] || '',
        jdcAbuserRole: row.jdcAbuserRole || row['JDC Abuser Role'] || '',
        jdcWitnessAvailable: row.jdcWitnessAvailable || row['JDC Witness Available'] || 'Yes',
        jdcInmateOnInmate: row.jdcInmateOnInmate || row['JDC Inmate On Inmate'] || 'No',

        rideshareProvider: row.rideshareProvider || row['Rideshare Provider'] || 'Uber',
        rideshareAssaulted: row.rideshareAssaulted || row['Rideshare Assaulted'] || 'Yes',
        rideshareProofOfRide: row.rideshareProofOfRide || row['Rideshare Proof Of Ride'] || 'Yes',
        rideshareDriverName: row.rideshareDriverName || row['Rideshare Driver Name'] || '',
        rideshareIncidentAddress: row.rideshareIncidentAddress || row['Rideshare Incident Address'] || '',
        rideshareIncidentDate: row.rideshareIncidentDate || row['Rideshare Incident Date'] || '',
        rideshareNarrative: row.rideshareNarrative || row['Rideshare Narrative'] || '',
        rideshareReportedTo: row.rideshareReportedTo || row['Rideshare Reported To'] || 'Parents',
        rideshareSymptomsDetails: row.rideshareSymptomsDetails || row['Rideshare Symptoms Details'] || '',
        rideshareSymptomsDate: row.rideshareSymptomsDate || row['Rideshare Symptoms Date'] || '',
        rideshareDiagnosisTestDetails: row.rideshareDiagnosisTestDetails || row['Rideshare Diagnosis Test Details'] || '',
        rideshareDiagnosisTestDate: row.rideshareDiagnosisTestDate || row['Rideshare Diagnosis Test Date'] || '',
        rideshareTreatmentDetails: row.rideshareTreatmentDetails || row['Rideshare Treatment Details'] || '',
        rideshareTreatmentDate: row.rideshareTreatmentDate || row['Rideshare Treatment Date'] || '',
        legalRepresentation: row.legalRepresentation || row['Legal Representation'] || 'No',
        felonyConviction: row.felonyConviction || row['Felony Conviction'] || 'No',
        hasMedicalRecords: row.hasMedicalRecords || row['Has Medical Records'] || 'Yes',
      };

      try {
        const payload = buildLeadPayload(mappedFormData);
        await addLead(payload);
        importedCount++;
      } catch (err) {
        console.warn(`Error importing CSV row ${i + 1}:`, err);
      }
    }

    await fetchData();
    setIsImportingCsv(false);
    setShowCsvModal(false);
    setCsvParsedRows([]);
    showToast(`Successfully imported ${importedCount} leads into database!`, 'success');
  };

  const handleDownloadCsvTemplate = () => {
    const headers = [
      'contactName', 'type', 'status', 'leadName', 'substatus', 'billable',
      'reasonForRejection', 'dateSent', 'dateSubscribed', 'tier', 'reasonForDQ',
      'reasonForDoesntMeetCriteria', 'reasonForSpam', 'trustedForm', 'callDuration',
      'firstName', 'middleName', 'lastName', 'gender', 'dateOfBirth', 'phoneNumber',
      'email', 'addressStreet', 'city', 'state', 'areaCode', 'powerOfAttorney',
      'victimName', 'victimFullName', 'victimLastName', 'victimDOB', 'victimDOD',
      'diagnosis', 'diagnosisYear', 'diagnosingDoctorName', 'treatingDoctorName',
      'diagnosingHospitalName', 'treatingFacilityName', 'diagnosingHospitalAddress',
      'treatingFacilityAddress', 'diagnosingFacilityPhone', 'treatingFacilityPhone'
    ];

    const sampleRow = [
      'Jane Doe Contact', 'PFAS', 'New', 'Jane Lead', 'TCPA OK', 'true',
      '', '2026-08-02', '2026-08-01', 'Tier 1', '',
      '', '', 'https://cert.trustedform.com/sample', '05:30',
      'Jane', 'M', 'Doe', 'Female', '1985-04-12', '415-555-0199',
      'jane.doe@example.com', '100 Market St', 'San Francisco', 'CA', '415', 'false',
      '', '', '', '', '',
      'Non-Hodgkin Lymphoma', '2021', 'Dr. Vance', 'Dr. Rostova',
      'St. Jude Medical Center', 'Johns Hopkins Hospital', '123 Health Ave, Baltimore MD',
      '600 N Wolfe St, Baltimore MD', '410-555-0199', '410-555-0244'
    ];

    const csvContent = '\uFEFF' + [headers.join(','), sampleRow.map(val => `"${val}"`).join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'lead_followup_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-6 pb-20 ${className}`}>
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold shadow-xl border ${toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : 'bg-rose-950 text-rose-300 border-rose-800'
              }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSV IMPORT MODAL */}
      <AnimatePresence>
        {showCsvModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Upload CSV Leads</h3>
                    <p className="text-xs text-slate-500">Import structured Lead Follow Up CSV files into the form or database.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-xs font-bold text-slate-800">Click to select CSV File</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Supports Lead Follow Up CSV files</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVFileSelected}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CSV Template</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {csvError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
                  {csvError}
                </div>
              )}

              {/* Preview Parsed Summary */}
              {csvParsedRows.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Parsed {csvParsedRows.length} Row(s)</span>
                    <span className="text-emerald-600 font-mono text-[11px]">Ready to Import</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] text-slate-600 font-mono">
                    {csvParsedRows.slice(0, 5).map((r, idx) => (
                      <div key={idx} className="truncate border-b border-slate-200/60 pb-1">
                        Row {idx + 1}: {r.firstName || r['First Name']} {r.lastName || r['Last Name']} ({r.email || r['Email']})
                      </div>
                    ))}
                    {csvParsedRows.length > 5 && (
                      <div className="text-slate-400 italic pt-1">+ {csvParsedRows.length - 5} more rows...</div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                {csvParsedRows.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleApplySingleCsvRowToForm}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      Fill Form with Row 1
                    </button>
                    <button
                      type="button"
                      disabled={isImportingCsv}
                      onClick={handleBulkImportCsvToDatabase}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isImportingCsv ? 'Importing...' : `Import All ${csvParsedRows.length} to Database`}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Navigation Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-1 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href="/vendor-portal/leads"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Vendor Portal Leads</span>
            </Link>
          )}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
        </div>

      </div>

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* SECTION 1: LEAD INFORMATION */}
          <FormSectionCard number={1} title="Lead Information" badge="Case Core" colorTheme="blue">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isFieldActive('contactName') && (
                <FormInput
                  label={getMeta('contactName', 'Contact Name').label}
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="e.g. Jane Doe"
                  required={getMeta('contactName', 'Contact Name').required}
                />
              )}
              {isFieldActive('type') && (
                <FormSelect
                  label={getMeta('type', 'Tort', true).label}
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  options={TYPE_OPTIONS}
                  required={getMeta('type', 'Tort', true).required}
                />
              )}
              {isFieldActive('status') && (
                <FormSelect
                  label={getMeta('status', 'Status', true).label}
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={STATUS_OPTIONS}
                  required={getMeta('status', 'Status', true).required}
                />
              )}
              {isFieldActive('leadName') && (
                <FormInput
                  label={getMeta('leadName', 'Lead Name').label}
                  name="leadName"
                  value={formData.leadName}
                  onChange={handleInputChange}
                  placeholder="e.g. Johnathan Smith Lead"
                  required={getMeta('leadName', 'Lead Name').required}
                />
              )}
              {isFieldActive('campaignName') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>
                      {getMeta('campaignName', 'Campaign Name', true).label}{' '}
                      {getMeta('campaignName', 'Campaign Name', true).required && (
                        <span className="text-rose-500">*</span>
                      )}
                    </span>
                  </label>
                  <select
                    name="campaignName"
                    value={formData.campaignName}
                    onChange={handleInputChange}
                    required={getMeta('campaignName', 'Campaign Name', true).required}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 outline-none shadow-xs transition-all cursor-pointer"
                  >
                    <option value="" disabled>
                      {availableVendorCampaigns.length === 0 ? 'No campaigns available for this vendor' : 'Select Campaign'}
                    </option>
                    {availableVendorCampaigns.map((c: any) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {formData.campaignName && !availableVendorCampaigns.some((c: any) => c.name === formData.campaignName) && (
                      <option value={formData.campaignName}>
                        {formData.campaignName}
                      </option>
                    )}
                  </select>
                </div>
              )}
              {isFieldActive('substatus') && (
                <FormSelect
                  label={getMeta('substatus', 'Substatus').label}
                  name="substatus"
                  value={formData.substatus}
                  onChange={handleInputChange}
                  options={SUBSTATUS_OPTIONS}
                  required={getMeta('substatus', 'Substatus').required}
                />
              )}
              {isFieldActive('billable') && (
                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="billable"
                      checked={formData.billable}
                      onChange={handleInputChange}
                      required={getMeta('billable', 'Billable Lead').required}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {getMeta('billable', 'Billable Lead').label}
                      {getMeta('billable', 'Billable Lead').required && <span className="text-rose-500"> *</span>}
                    </span>
                  </label>
                </div>
              )}
              {isFieldActive('dateSent') && (
                <FormInput
                  label={getMeta('dateSent', 'Date Sent').label}
                  type="date"
                  name="dateSent"
                  value={formData.dateSent}
                  onChange={handleInputChange}
                  required={getMeta('dateSent', 'Date Sent').required}
                />
              )}
              {isFieldActive('dateSubscribed') && (
                <FormInput
                  label={getMeta('dateSubscribed', 'Date Subscribed').label}
                  type="date"
                  name="dateSubscribed"
                  value={formData.dateSubscribed}
                  onChange={handleInputChange}
                  required={getMeta('dateSubscribed', 'Date Subscribed').required}
                />
              )}
              {isFieldActive('tier') && (
                <FormInput
                  label={getMeta('tier', 'Tier').label}
                  name="tier"
                  value={formData.tier}
                  onChange={handleInputChange}
                  placeholder="e.g. Tier 1 / Premium"
                  required={getMeta('tier', 'Tier').required}
                />
              )}
              {isFieldActive('callDuration') && (
                <FormInput
                  label={getMeta('callDuration', 'Call Duration').label}
                  name="callDuration"
                  value={formData.callDuration}
                  onChange={handleInputChange}
                  placeholder="e.g. 05:45 or 345s"
                  required={getMeta('callDuration', 'Call Duration').required}
                />
              )}
              {isFieldActive('reasonForRejection') && (
                <FormInput
                  label={getMeta('reasonForRejection', 'Reason for Rejection').label}
                  name="reasonForRejection"
                  value={formData.reasonForRejection}
                  onChange={handleInputChange}
                  placeholder="e.g. Out of SOL"
                  required={getMeta('reasonForRejection', 'Reason for Rejection').required}
                />
              )}
              {isFieldActive('reasonForDQ') && (
                <FormInput
                  label={getMeta('reasonForDQ', 'Reason for DQ').label}
                  name="reasonForDQ"
                  value={formData.reasonForDQ}
                  onChange={handleInputChange}
                  placeholder="Disqualification rationale"
                  required={getMeta('reasonForDQ', 'Reason for DQ').required}
                />
              )}
              {isFieldActive('reasonForDoesntMeetCriteria') && (
                <FormInput
                  label={getMeta('reasonForDoesntMeetCriteria', "Reason for Doesn't Meet Criteria").label}
                  name="reasonForDoesntMeetCriteria"
                  value={formData.reasonForDoesntMeetCriteria}
                  onChange={handleInputChange}
                  placeholder="Criteria failure details"
                  required={getMeta('reasonForDoesntMeetCriteria', "Reason for Doesn't Meet Criteria").required}
                />
              )}
              {isFieldActive('reasonForSpam') && (
                <FormInput
                  label={getMeta('reasonForSpam', 'Reason for Spam').label}
                  name="reasonForSpam"
                  value={formData.reasonForSpam}
                  onChange={handleInputChange}
                  placeholder="Spam classification reason"
                  required={getMeta('reasonForSpam', 'Reason for Spam').required}
                />
              )}
            </div>
            {isFieldActive('trustedForm') && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {getMeta('trustedForm', 'Trusted Form Certificate / Payload').label}
                  {getMeta('trustedForm', 'Trusted Form Certificate / Payload').required && (
                    <span className="text-rose-500"> *</span>
                  )}
                </label>
                <textarea
                  name="trustedForm"
                  value={formData.trustedForm}
                  onChange={handleInputChange}
                  rows={3}
                  required={getMeta('trustedForm', 'Trusted Form Certificate / Payload').required}
                  placeholder="https://cert.trustedform.com/..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-xs transition-all font-mono"
                />
              </div>
            )}
          </FormSectionCard>

          {/* SECTION 2: CONTACT INFORMATION */}
          <FormSectionCard number={2} title="Contact Information" badge="Personal Details" colorTheme="indigo">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isFieldActive('firstName') && (
                <FormInput
                  label={getMeta('firstName', 'First Name', true).label}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  required={getMeta('firstName', 'First Name', true).required}
                />
              )}
              {isFieldActive('middleName') && (
                <FormInput
                  label={getMeta('middleName', 'Middle Name').label}
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  placeholder="Middle Name"
                  required={getMeta('middleName', 'Middle Name').required}
                />
              )}
              {isFieldActive('lastName') && (
                <FormInput
                  label={getMeta('lastName', 'Last Name', true).label}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  required={getMeta('lastName', 'Last Name', true).required}
                />
              )}
              {isFieldActive('gender') && (
                <FormSelect
                  label={getMeta('gender', 'Gender').label}
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  options={GENDER_OPTIONS}
                  required={getMeta('gender', 'Gender').required}
                />
              )}
              {isFieldActive('dateOfBirth') && (
                <FormInput
                  label={getMeta('dateOfBirth', 'Date of Birth').label}
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required={getMeta('dateOfBirth', 'Date of Birth').required}
                />
              )}
              {isFieldActive('phoneNumber') && (
                <FormInput
                  label={getMeta('phoneNumber', 'Phone Number', true).label}
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="(555) 000-0000"
                  required={getMeta('phoneNumber', 'Phone Number', true).required}
                />
              )}
              {isFieldActive('email') && (
                <FormInput
                  label={getMeta('email', 'Email Address', true).label}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  required={getMeta('email', 'Email Address', true).required}
                />
              )}
              {isFieldActive('areaCode') && (
                <FormInput
                  label={getMeta('areaCode', 'Area Code').label}
                  name="areaCode"
                  value={formData.areaCode}
                  onChange={handleInputChange}
                  placeholder="e.g. 415"
                  required={getMeta('areaCode', 'Area Code').required}
                />
              )}
              {isFieldActive('addressStreet') && (
                <div className="sm:col-span-2">
                  <FormInput
                    label={getMeta('addressStreet', 'Address Street').label}
                    name="addressStreet"
                    value={formData.addressStreet}
                    onChange={handleInputChange}
                    placeholder="Street Address, Apt / Suite"
                    required={getMeta('addressStreet', 'Address Street').required}
                  />
                </div>
              )}
              {isFieldActive('city') && (
                <FormInput
                  label={getMeta('city', 'City').label}
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required={getMeta('city', 'City').required}
                />
              )}
              {isFieldActive('state') && (
                <FormSelect
                  label={getMeta('state', 'State (50 US States)', true).label}
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  options={US_STATES}
                  required={getMeta('state', 'State (50 US States)', true).required}
                  className="font-mono font-semibold"
                />
              )}
            </div>
          </FormSectionCard>

          {/* SECTION 3: POA */}
          <FormSectionCard number={3} title="POA (Power of Attorney)" badge="Legal Rep" colorTheme="amber">
            {isFieldActive('powerOfAttorney') && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 mb-2">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="powerOfAttorney"
                    checked={formData.powerOfAttorney}
                    onChange={handleInputChange}
                    required={getMeta('powerOfAttorney', 'Power of Attorney').required}
                    className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-950">
                    {getMeta('powerOfAttorney', 'Power of Attorney (Representative Claim)').label}
                    {getMeta('powerOfAttorney', 'Power of Attorney').required && <span className="text-rose-500"> *</span>}
                  </span>
                </label>
                <p className="text-[11px] text-amber-800 mt-1 pl-6">
                  Check if claimant is acting as legal representative/next of kin for the victim.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isFieldActive('victimName') && (
                <FormInput
                  label={getMeta('victimName', 'Victim Name').label}
                  name="victimName"
                  value={formData.victimName}
                  onChange={handleInputChange}
                  placeholder="Victim First Name"
                  required={getMeta('victimName', 'Victim Name').required}
                />
              )}
              {isFieldActive('victimFullName') && (
                <FormInput
                  label={getMeta('victimFullName', 'Victim Full Name').label}
                  name="victimFullName"
                  value={formData.victimFullName}
                  onChange={handleInputChange}
                  placeholder="Victim Full Name"
                  required={getMeta('victimFullName', 'Victim Full Name').required}
                />
              )}
              {isFieldActive('victimLastName') && (
                <FormInput
                  label={getMeta('victimLastName', 'Victim Last Name').label}
                  name="victimLastName"
                  value={formData.victimLastName}
                  onChange={handleInputChange}
                  placeholder="Victim Last Name"
                  required={getMeta('victimLastName', 'Victim Last Name').required}
                />
              )}
              {isFieldActive('victimDOB') && (
                <FormInput
                  label={getMeta('victimDOB', 'Victim DOB').label}
                  type="date"
                  name="victimDOB"
                  value={formData.victimDOB}
                  onChange={handleInputChange}
                  required={getMeta('victimDOB', 'Victim DOB').required}
                />
              )}
              {isFieldActive('victimDOD') && (
                <div className="sm:col-span-2">
                  <FormInput
                    label={getMeta('victimDOD', 'Victim DOD (Date of Death if deceased)').label}
                    type="date"
                    name="victimDOD"
                    value={formData.victimDOD}
                    onChange={handleInputChange}
                    required={getMeta('victimDOD', 'Victim DOD').required}
                  />
                </div>
              )}
            </div>
          </FormSectionCard>

          {/* SECTION 4: DIAGNOSIS INFORMATION */}
          <FormSectionCard number={4} title="Diagnosis & Incident Information" badge="Medical Record" colorTheme="emerald">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isFieldActive('incidentType') && (
                <FormSelect
                  label={getMeta('incidentType', 'Which Incident Occurred').label}
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleInputChange}
                  options={INCIDENT_TYPE_OPTIONS}
                  required={getMeta('incidentType', 'Which Incident Occurred').required}
                />
              )}
              {isFieldActive('diagnosis') && (
                <FormSelect
                  label={getMeta('diagnosis', 'Diagnosis', true).label}
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  options={DIAGNOSIS_OPTIONS}
                  required={getMeta('diagnosis', 'Diagnosis', true).required}
                />
              )}
              {isFieldActive('diagnosisYear') && (
                <div className="sm:col-span-2">
                  <FormInput
                    label={getMeta('diagnosisYear', 'Diagnosis Year / Date').label}
                    type="date"
                    name="diagnosisYear"
                    value={formData.diagnosisYear}
                    onChange={handleInputChange}
                    required={getMeta('diagnosisYear', 'Diagnosis Year / Date').required}
                  />
                </div>
              )}
              {isFieldActive('diagnosingDoctorName') && (
                <FormInput
                  label={getMeta('diagnosingDoctorName', "Diagnosing Doctor's Name").label}
                  name="diagnosingDoctorName"
                  value={formData.diagnosingDoctorName}
                  onChange={handleInputChange}
                  placeholder="Dr. Full Name"
                  required={getMeta('diagnosingDoctorName', "Diagnosing Doctor's Name").required}
                />
              )}
              {isFieldActive('treatingDoctorName') && (
                <FormInput
                  label={getMeta('treatingDoctorName', "Treating Doctor's Name").label}
                  name="treatingDoctorName"
                  value={formData.treatingDoctorName}
                  onChange={handleInputChange}
                  placeholder="Dr. Full Name"
                  required={getMeta('treatingDoctorName', "Treating Doctor's Name").required}
                />
              )}
              {isFieldActive('diagnosingHospitalName') && (
                <FormInput
                  label={getMeta('diagnosingHospitalName', "Diagnosing Hospital's Name").label}
                  name="diagnosingHospitalName"
                  value={formData.diagnosingHospitalName}
                  onChange={handleInputChange}
                  placeholder="Hospital / Medical Center"
                  required={getMeta('diagnosingHospitalName', "Diagnosing Hospital's Name").required}
                />
              )}
              {isFieldActive('treatingFacilityName') && (
                <FormInput
                  label={getMeta('treatingFacilityName', 'Treating Facility Name').label}
                  name="treatingFacilityName"
                  value={formData.treatingFacilityName}
                  onChange={handleInputChange}
                  placeholder="Treating Clinic / Facility"
                  required={getMeta('treatingFacilityName', 'Treating Facility Name').required}
                />
              )}
              {isFieldActive('diagnosingHospitalAddress') && (
                <FormInput
                  label={getMeta('diagnosingHospitalAddress', "Diagnosing Hospital's Address").label}
                  name="diagnosingHospitalAddress"
                  value={formData.diagnosingHospitalAddress}
                  onChange={handleInputChange}
                  placeholder="Hospital Full Address"
                  required={getMeta('diagnosingHospitalAddress', "Diagnosing Hospital's Address").required}
                />
              )}
              {isFieldActive('treatingFacilityAddress') && (
                <FormInput
                  label={getMeta('treatingFacilityAddress', 'Treating Facility Address').label}
                  name="treatingFacilityAddress"
                  value={formData.treatingFacilityAddress}
                  onChange={handleInputChange}
                  placeholder="Facility Full Address"
                  required={getMeta('treatingFacilityAddress', 'Treating Facility Address').required}
                />
              )}
              {isFieldActive('diagnosingFacilityPhone') && (
                <FormInput
                  label={getMeta('diagnosingFacilityPhone', 'Diagnosing Facility Phone Number').label}
                  type="tel"
                  name="diagnosingFacilityPhone"
                  value={formData.diagnosingFacilityPhone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                  required={getMeta('diagnosingFacilityPhone', 'Diagnosing Facility Phone Number').required}
                />
              )}
              {isFieldActive('treatingFacilityPhone') && (
                <FormInput
                  label={getMeta('treatingFacilityPhone', 'Treating Facility Phone Number').label}
                  type="tel"
                  name="treatingFacilityPhone"
                  value={formData.treatingFacilityPhone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                  required={getMeta('treatingFacilityPhone', 'Treating Facility Phone Number').required}
                />
              )}
            </div>
          </FormSectionCard>

          {/* SECTION 5: OTHER CASE INFORMATION */}
          <div className="col-span-1 lg:col-span-2">
            <FormSectionCard
              number={5}
              title={`Other Case Information (${formData.type || 'Tort Qualifiers'})`}
              badge={`${formData.type || 'Tort'} Specific`}
              colorTheme="amber"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(() => {
                  const dynamicQuestions = getQuestionsForTort(formData.type);
                  return dynamicQuestions.map((q) => {
                    const fieldValue = (formData as any)[q.name] !== undefined ? (formData as any)[q.name] : '';

                    if (q.type === 'select') {
                      return (
                        <FormSelect
                          key={q.id || q.name}
                          label={q.label}
                          name={q.name}
                          value={fieldValue}
                          onChange={handleInputChange}
                          options={q.options || YES_NO_OPTIONS}
                          required={q.required}
                        />
                      );
                    }

                    if (q.type === 'textarea') {
                      return (
                        <div key={q.id || q.name} className="sm:col-span-2 md:col-span-3 space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                            <span>{q.label} {q.required && <span className="text-rose-500">*</span>}</span>
                            {q.categoryBadge && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                {q.categoryBadge}
                              </span>
                            )}
                          </label>
                          <textarea
                            name={q.name}
                            value={fieldValue}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder={q.placeholder || 'Describe details...'}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 outline-none shadow-xs transition-all"
                          />
                        </div>
                      );
                    }

                    return (
                      <FormInput
                        key={q.id || q.name}
                        label={q.label}
                        type={q.type === 'date' ? 'date' : 'text'}
                        name={q.name}
                        value={fieldValue}
                        onChange={handleInputChange}
                        placeholder={q.placeholder}
                        required={q.required}
                      />
                    );
                  });
                })()}

                <FormSelect
                  label="Did you have any legal representation with any law firm regarding this claim?"
                  name="legalRepresentation"
                  value={formData.legalRepresentation}
                  onChange={handleInputChange}
                  options={YES_NO_OPTIONS}
                />
                <FormSelect
                  label="Conviction Felony/Crime?"
                  name="felonyConviction"
                  value={formData.felonyConviction}
                  onChange={handleInputChange}
                  options={YES_NO_UPPER_OPTIONS}
                />
                <FormSelect
                  label="Do you have Medical Records?"
                  name="hasMedicalRecords"
                  value={formData.hasMedicalRecords}
                  onChange={handleInputChange}
                  options={YES_NO_OPTIONS}
                />
              </div>
            </FormSectionCard>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Ensure all required contact & case information fields are verified before saving to the database.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 sm:flex-none text-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <Link
                href="/vendor-portal/leads"
                className="flex-1 sm:flex-none text-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
              >
                Cancel
              </Link>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Lead Follow Up</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
