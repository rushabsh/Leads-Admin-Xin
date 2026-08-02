'use client';

import React, { useState, useRef } from 'react';
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
  'PFAS',
  'Rideshare',
  'Roblox',
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
export const DIAGNOSIS_OPTIONS = [
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

  // 4. Diagnosis Information
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

  diagnosis: 'Non-Hodgkin Lymphoma',
  diagnosisYear: '',
  diagnosingDoctorName: '',
  treatingDoctorName: '',
  diagnosingHospitalName: '',
  treatingFacilityName: '',
  diagnosingHospitalAddress: '',
  treatingFacilityAddress: '',
  diagnosingFacilityPhone: '',
  treatingFacilityPhone: '',
};

// ==========================================
// REUSABLE HELPER UI COMPONENTS
// ==========================================
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ label, required, className = '', ...props }) => (
  <div>
    <label className="text-xs font-semibold text-slate-700 block mb-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-xs transition-all ${className}`}
    />
  </div>
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  required?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, options, required, className = '', ...props }) => (
  <div>
    <label className="text-xs font-semibold text-slate-700 block mb-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <select
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-xs transition-all ${className}`}
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
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', badgeBg: 'bg-blue-50', badgeBorder: 'border-blue-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', badgeBg: 'bg-indigo-50', badgeBorder: 'border-indigo-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', badgeBg: 'bg-amber-50', badgeBorder: 'border-amber-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', badgeBg: 'bg-emerald-50', badgeBorder: 'border-emerald-200' },
  }[colorTheme];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <div className="border-b border-slate-100 bg-slate-50/60 p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${themeClasses.bg} ${themeClasses.text} font-bold text-xs`}>
              {number}
            </div>
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.text} ${themeClasses.badgeBg} px-2 py-0.5 rounded-md border ${themeClasses.badgeBorder}`}>
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
  title?: string;
  subtitle?: string;
  vendorId?: string;
  vendorName?: string;
  showCsvOption?: boolean;
  className?: string;
}

export default function NewCaseLeadFollowUpForm({
  initialValues,
  onSuccess,
  onCancel,
  isModal = false,
  title = "New Case: Lead Follow Up",
  subtitle = "Fill out the grouped sections below to record complete case follow-up data.",
  vendorId,
  vendorName,
  showCsvOption = true,
  className = ""
}: NewCaseLeadFollowUpFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addLead, fetchData, campaigns } = useCRMStore();

  const [formData, setFormData] = useState<LeadFollowUpFormData>({
    ...DEFAULT_LEAD_FOLLOW_UP_FORM_DATA,
    ...initialValues
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // CSV Import Modal State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvParsedRows, setCsvParsedRows] = useState<any[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeVendorId = vendorId || user?.vendorId || 'ven-1';
  const activeVendorName = vendorName || user?.name || 'Premier Leads LLC';

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
      const payload = buildLeadPayload(formData);

      let createdLead: any = null;
      try {
        const res = await api.post('/leads', payload);
        if (res.data?.success && res.data?.lead) {
          createdLead = res.data.lead;
        }
      } catch (apiErr) {
        console.warn('Direct API POST lead creation warning, falling back to addLead:', apiErr);
      }

      await addLead(createdLead || payload);
      await fetchData(true);

      showToast('"New Case: Lead Follow Up" saved to database successfully!', 'success');

      if (onSuccess) {
        onSuccess(createdLead || payload);
      } else {
        setTimeout(() => {
          router.push('/vendor-portal/leads');
        }, 1000);
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

      diagnosis: row.diagnosis || row['Diagnosis'] || 'Non-Hodgkin Lymphoma',
      diagnosisYear: row.diagnosisYear || row['Diagnosis Year'] || '',
      diagnosingDoctorName: row.diagnosingDoctorName || row["Diagnosing Doctor's Name"] || '',
      treatingDoctorName: row.treatingDoctorName || row["Treating Doctor's Name"] || '',
      diagnosingHospitalName: row.diagnosingHospitalName || row["Diagnosing Hospital's Name"] || '',
      treatingFacilityName: row.treatingFacilityName || row['Treating Facility Name'] || '',
      diagnosingHospitalAddress: row.diagnosingHospitalAddress || row["Diagnosing Hospital's Address"] || '',
      treatingFacilityAddress: row.treatingFacilityAddress || row['Treating Facility Address'] || '',
      diagnosingFacilityPhone: row.diagnosingFacilityPhone || row['Diagnosing Facility Phone Number'] || '',
      treatingFacilityPhone: row.treatingFacilityPhone || row['Treating Facility Phone Number'] || '',
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

        diagnosis: row.diagnosis || 'Non-Hodgkin Lymphoma',
        diagnosisYear: row.diagnosisYear || '',
        diagnosingDoctorName: row.diagnosingDoctorName || '',
        treatingDoctorName: row.treatingDoctorName || '',
        diagnosingHospitalName: row.diagnosingHospitalName || '',
        treatingFacilityName: row.treatingFacilityName || '',
        diagnosingHospitalAddress: row.diagnosingHospitalAddress || '',
        treatingFacilityAddress: row.treatingFacilityAddress || '',
        diagnosingFacilityPhone: row.diagnosingFacilityPhone || '',
        treatingFacilityPhone: row.treatingFacilityPhone || '',
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
              <FormInput
                label="Contact Name"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                placeholder="e.g. Jane Doe"
              />
              <FormSelect
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={TYPE_OPTIONS}
                required
              />
              <FormSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={STATUS_OPTIONS}
                required
              />
              <FormInput
                label="Lead Name"
                name="leadName"
                value={formData.leadName}
                onChange={handleInputChange}
                placeholder="e.g. Johnathan Smith Lead"
              />
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Campaign Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="campaignName"
                  list="campaign-name-options"
                  value={formData.campaignName}
                  onChange={handleInputChange}
                  placeholder="e.g. PFAS Media Campaign"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-xs transition-all"
                />
                <datalist id="campaign-name-options">
                  {(campaigns || []).map((c: any) => (
                    <option key={c.id || c.name} value={c.name} />
                  ))}
                  <option value="PFAS Media Campaign" />
                  <option value="Camp Lejeune National Inbound" />
                  <option value="Roundup Agricultural Claims" />
                  <option value="Talcum Ovarian Claims" />
                  <option value="General Mass Tort" />
                </datalist>
              </div>
              <FormSelect
                label="Substatus"
                name="substatus"
                value={formData.substatus}
                onChange={handleInputChange}
                options={SUBSTATUS_OPTIONS}
              />
              <div className="flex items-center pt-5">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="billable"
                    checked={formData.billable}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">Billable Lead</span>
                </label>
              </div>
              <FormInput
                label="Date Sent"
                type="date"
                name="dateSent"
                value={formData.dateSent}
                onChange={handleInputChange}
              />
              <FormInput
                label="Date Subscribed"
                type="date"
                name="dateSubscribed"
                value={formData.dateSubscribed}
                onChange={handleInputChange}
              />
              <FormInput
                label="Tier"
                name="tier"
                value={formData.tier}
                onChange={handleInputChange}
                placeholder="e.g. Tier 1 / Premium"
              />
              <FormInput
                label="Call Duration"
                name="callDuration"
                value={formData.callDuration}
                onChange={handleInputChange}
                placeholder="e.g. 05:45 or 345s"
              />
              <FormInput
                label="Reason for Rejection"
                name="reasonForRejection"
                value={formData.reasonForRejection}
                onChange={handleInputChange}
                placeholder="e.g. Out of SOL"
              />
              <FormInput
                label="Reason for DQ"
                name="reasonForDQ"
                value={formData.reasonForDQ}
                onChange={handleInputChange}
                placeholder="Disqualification rationale"
              />
              <FormInput
                label="Reason for Doesn't Meet Criteria"
                name="reasonForDoesntMeetCriteria"
                value={formData.reasonForDoesntMeetCriteria}
                onChange={handleInputChange}
                placeholder="Criteria failure details"
              />
              <FormInput
                label="Reason for Spam"
                name="reasonForSpam"
                value={formData.reasonForSpam}
                onChange={handleInputChange}
                placeholder="Spam classification reason"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Trusted Form Certificate / Payload
              </label>
              <textarea
                name="trustedForm"
                value={formData.trustedForm}
                onChange={handleInputChange}
                rows={3}
                placeholder="https://cert.trustedform.com/..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-xs transition-all font-mono"
              />
            </div>
          </FormSectionCard>

          {/* SECTION 2: CONTACT INFORMATION */}
          <FormSectionCard number={2} title="Contact Information" badge="Personal Details" colorTheme="indigo">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                required
              />
              <FormInput
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                placeholder="Middle Name"
              />
              <FormInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                required
              />
              <FormSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                options={GENDER_OPTIONS}
              />
              <FormInput
                label="Date of Birth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
              <FormInput
                label="Phone Number"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="(555) 000-0000"
                required
              />
              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                required
              />
              <FormInput
                label="Area Code"
                name="areaCode"
                value={formData.areaCode}
                onChange={handleInputChange}
                placeholder="e.g. 415"
              />
              <div className="sm:col-span-2">
                <FormInput
                  label="Address Street"
                  name="addressStreet"
                  value={formData.addressStreet}
                  onChange={handleInputChange}
                  placeholder="Street Address, Apt / Suite"
                />
              </div>
              <FormInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
              />
              <FormSelect
                label="State (50 US States)"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                options={US_STATES}
                required
                className="font-mono font-semibold"
              />
            </div>
          </FormSectionCard>

          {/* SECTION 3: POA */}
          <FormSectionCard number={3} title="POA (Power of Attorney)" badge="Legal Rep" colorTheme="amber">
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 mb-2">
              <label className="inline-flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="powerOfAttorney"
                  checked={formData.powerOfAttorney}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-amber-950">
                  Power of Attorney (Representative Claim)
                </span>
              </label>
              <p className="text-[11px] text-amber-800 mt-1 pl-6">
                Check if claimant is acting as legal representative/next of kin for the victim.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Victim Name"
                name="victimName"
                value={formData.victimName}
                onChange={handleInputChange}
                placeholder="Victim First Name"
              />
              <FormInput
                label="Victim Full Name"
                name="victimFullName"
                value={formData.victimFullName}
                onChange={handleInputChange}
                placeholder="Victim Full Name"
              />
              <FormInput
                label="Victim Last Name"
                name="victimLastName"
                value={formData.victimLastName}
                onChange={handleInputChange}
                placeholder="Victim Last Name"
              />
              <FormInput
                label="Victim DOB"
                type="date"
                name="victimDOB"
                value={formData.victimDOB}
                onChange={handleInputChange}
              />
              <div className="sm:col-span-2">
                <FormInput
                  label="Victim DOD (Date of Death if deceased)"
                  type="date"
                  name="victimDOD"
                  value={formData.victimDOD}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </FormSectionCard>

          {/* SECTION 4: DIAGNOSIS INFORMATION */}
          <FormSectionCard number={4} title="Diagnosis Information" badge="Medical Record" colorTheme="emerald">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                options={DIAGNOSIS_OPTIONS}
                required
              />
              <FormInput
                label="Diagnosis Year / Date"
                type="date"
                name="diagnosisYear"
                value={formData.diagnosisYear}
                onChange={handleInputChange}
              />
              <FormInput
                label="Diagnosing Doctor's Name"
                name="diagnosingDoctorName"
                value={formData.diagnosingDoctorName}
                onChange={handleInputChange}
                placeholder="Dr. Full Name"
              />
              <FormInput
                label="Treating Doctor's Name"
                name="treatingDoctorName"
                value={formData.treatingDoctorName}
                onChange={handleInputChange}
                placeholder="Dr. Full Name"
              />
              <FormInput
                label="Diagnosing Hospital's Name"
                name="diagnosingHospitalName"
                value={formData.diagnosingHospitalName}
                onChange={handleInputChange}
                placeholder="Hospital / Medical Center"
              />
              <FormInput
                label="Treating Facility Name"
                name="treatingFacilityName"
                value={formData.treatingFacilityName}
                onChange={handleInputChange}
                placeholder="Treating Clinic / Facility"
              />
              <FormInput
                label="Diagnosing Hospital Address"
                name="diagnosingHospitalAddress"
                value={formData.diagnosingHospitalAddress}
                onChange={handleInputChange}
                placeholder="Hospital Full Address"
              />
              <FormInput
                label="Treating Facility Address"
                name="treatingFacilityAddress"
                value={formData.treatingFacilityAddress}
                onChange={handleInputChange}
                placeholder="Facility Full Address"
              />
              <FormInput
                label="Diagnosing Facility Phone Number"
                type="tel"
                name="diagnosingFacilityPhone"
                value={formData.diagnosingFacilityPhone}
                onChange={handleInputChange}
                placeholder="(555) 000-0000"
              />
              <FormInput
                label="Treating Facility Phone Number"
                type="tel"
                name="treatingFacilityPhone"
                value={formData.treatingFacilityPhone}
                onChange={handleInputChange}
                placeholder="(555) 000-0000"
              />
            </div>
          </FormSectionCard>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Ensure all required contact & case information fields are verified before saving to the database.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 sm:flex-none text-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <Link
                href="/vendor-portal/leads"
                className="flex-1 sm:flex-none text-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
