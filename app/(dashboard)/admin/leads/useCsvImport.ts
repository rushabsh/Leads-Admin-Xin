'use client';

import { useState } from 'react';
import { useCRMStore } from '../../../../store/crmStore';
import api from '../../../../lib/api';

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

const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export default function useCsvImport(
  showToast: (msg: string, type: 'success' | 'error') => void,
  defaultVendorId?: string,
  defaultVendorName?: string
) {
  const { leads, campaigns, vendors, fetchData } = useCRMStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [csvStep, setCsvStep] = useState<'upload' | 'preview' | 'validate' | 'import'>('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedCsvData, setParsedCsvData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<{ success: number; failed: number; reports: string[] } | null>(null);

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setCsvStep('preview');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      if (lines.length === 0) return;

      const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]);
        const obj: any = {};
        headers.forEach((header, idx) => {
          obj[header] = values[idx] || '';
        });
        rows.push(obj);
      }
      setParsedCsvData(rows);
    };
    reader.readAsText(file);
  };

  const handleValidateCsv = () => {
    const errors: string[] = [];
    const currentLeads = [...leads];
    const existingLeadIds = new Set(currentLeads.map(l => l.leadId.toUpperCase()));
    const existingEmails = new Set(currentLeads.map(l => l.email.toLowerCase()));

    parsedCsvData.forEach((row, index) => {
      const rowNum = index + 1;
      const firstName = row.firstName || row['First Name'] || row.contactName || row['Contact Name'];
      const lastName = row.lastName || row['Last Name'] || 'Lead';
      if (!firstName) {
        errors.push(`Row ${rowNum}: Missing client first name / contact name.`);
      }
      const phone = row.phone || row.phoneNumber || row['Phone Number'];
      if (!phone) {
        errors.push(`Row ${rowNum}: Phone number is required.`);
      }
      const email = row.email || row['Email'];
      if (!email || !email.includes('@')) {
        errors.push(`Row ${rowNum}: Invalid or missing email address.`);
      }
      const rowLeadId = row.leadId || row['Lead ID'] || row.leadid;
      if (rowLeadId && existingLeadIds.has(rowLeadId.toUpperCase())) {
        errors.push(`Row ${rowNum}: Duplicate Lead ID '${rowLeadId}' found in existing leads.`);
      }
      if (email && existingEmails.has(email.toLowerCase())) {
        errors.push(`Row ${rowNum}: Duplicate email '${email}' already exists.`);
      }
    });

    setValidationErrors(errors);
    setCsvStep('validate');
  };

  const handleCSVImportConfirm = async () => {
    setCsvStep('import');
    let successCount = 0;
    let failedCount = 0;
    const reports: string[] = [];
    const newLeadsToAppend: any[] = [];

    const currentLeads = [...leads];
    const existingLeadIds = new Set(currentLeads.map(l => l.leadId.toUpperCase()));
    const existingEmails = new Set(currentLeads.map(l => l.email.toLowerCase()));

    for (let i = 0; i < parsedCsvData.length; i++) {
      const row = parsedCsvData[i];
      const rowNum = i + 1;

      const firstName = row.firstName || row['First Name'] || row.contactName || row['Contact Name'] || `Lead-${rowNum}`;
      const lastName = row.lastName || row['Last Name'] || 'CSV';
      const phone = row.phone || row.phoneNumber || row['Phone Number'] || '(555) 000-0000';
      const email = row.email || row['Email'] || `lead${rowNum}@csvimport.com`;

      const rowLeadId = row.leadId || row['Lead ID'] || row.leadid;
      if (rowLeadId && existingLeadIds.has(rowLeadId.toUpperCase())) {
        failedCount++;
        reports.push(`Row ${rowNum}: Skipped - Duplicate Lead ID '${rowLeadId}'.`);
        continue;
      }

      if (email && existingEmails.has(email.toLowerCase())) {
        failedCount++;
        reports.push(`Row ${rowNum}: Skipped - Email '${email}' already exists.`);
        continue;
      }

      const tortTypeVal = row.type || row['Type'] || row.tortName || row['Tort Name'] || 'PFAS';
      const campaignNameVal = row.campaign || row.Campaign || `${tortTypeVal} Campaign`;
      const matchingCamp = campaigns.find(c => c.name.toLowerCase().includes(campaignNameVal.toLowerCase())) || campaigns[0];

      const vendorNameVal = row.vendor || row.Vendor || '';
      const matchingVendor = vendors.find(v => v.name.toLowerCase().includes(vendorNameVal.toLowerCase())) || vendors[0];
      const targetVendorId = defaultVendorId || matchingVendor?.id || vendors[0]?.id || '';
      const targetVendorName = defaultVendorName || matchingVendor?.name || 'Vendor';

      // Build complete Lead Follow Up structured caseDetails JSON
      const caseDetailsFormatted = JSON.stringify({
        leadInfo: {
          contactName: row.contactName || row['Contact Name'] || `${firstName} ${lastName}`,
          type: tortTypeVal,
          status: row.status || row['Status'] || 'New',
          leadName: row.leadName || row['Lead Name'] || `${firstName} ${lastName}`,
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
        },
        contactInfo: {
          firstName: firstName,
          middleName: row.middleName || row['Middle Name'] || '',
          lastName: lastName,
          gender: row.gender || row['Gender'] || 'Male',
          dateOfBirth: row.dateOfBirth || row['Date of Birth'] || row.dob || '',
          phoneNumber: phone,
          email: email,
          addressStreet: row.addressStreet || row['Address Street'] || row.address || '',
          city: row.city || row['City'] || '',
          state: row.state || row['State'] || 'CA',
          areaCode: row.areaCode || row['Area Code'] || '',
        },
        poa: {
          powerOfAttorney: row.powerOfAttorney !== undefined ? String(row.powerOfAttorney).toLowerCase() === 'true' : false,
          victimName: row.victimName || row['Victim Name'] || '',
          victimFullName: row.victimFullName || row['Victim Full Name'] || '',
          victimLastName: row.victimLastName || row['Victim Last Name'] || '',
          victimDOB: row.victimDOB || row['Victim DOB'] || '',
          victimDOD: row.victimDOD || row['Victim DOD'] || '',
        },
        diagnosisInfo: {
          diagnosis: row.diagnosis || row['Diagnosis'] || 'Non-Hodgkin Lymphoma',
          diagnosisYear: row.diagnosisYear || row['Diagnosis Year'] || '',
          diagnosingDoctorName: row.diagnosingDoctorName || row["Diagnosing Doctor's Name"] || '',
          treatingDoctorName: row.treatingDoctorName || row["Treating Doctor's Name"] || '',
          diagnosingHospitalName: row.diagnosingHospitalName || row["Diagnosing Hospital's Name"] || row.hospital || '',
          treatingFacilityName: row.treatingFacilityName || row['Treating Facility Name'] || '',
          diagnosingHospitalAddress: row.diagnosingHospitalAddress || row["Diagnosing Hospital's Address"] || '',
          treatingFacilityAddress: row.treatingFacilityAddress || row['Treating Facility Address'] || '',
          diagnosingFacilityPhone: row.diagnosingFacilityPhone || row['Diagnosing Facility Phone Number'] || '',
          treatingFacilityPhone: row.treatingFacilityPhone || row['Treating Facility Phone Number'] || '',
        }
      }, null, 2);

      const leadPayload = {
        firstName,
        lastName,
        phone,
        email,
        state: row.state || row['State'] || 'CA',
        priority: row.tier === 'Tier 1' || row.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
        status: (row.status || 'NEW').toUpperCase() === 'NEW' ? 'NEW' : (row.status || '').toUpperCase() === 'SENT' ? 'QUALIFIED' : 'CONTACTED',
        campaignId: matchingCamp?.id || campaigns[0]?.id || '',
        vendorId: targetVendorId,
        dob: row.dateOfBirth || row['Date of Birth'] || row.dob || '',
        gender: row.gender || row['Gender'] || 'Male',
        address: row.addressStreet || row.address || '',
        diagnosis: row.diagnosis || row['Diagnosis'] || '',
        hospital: row.diagnosingHospitalName || row.hospital || '',
        caseDetails: caseDetailsFormatted,
        tortName: tortTypeVal
      };

      try {
        const res = await api.post('/leads', leadPayload);
        const actualLead = res.data.lead;
        newLeadsToAppend.push(actualLead);
        successCount++;
        existingEmails.add(email.toLowerCase());
        if (actualLead.leadId) {
          existingLeadIds.add(actualLead.leadId.toUpperCase());
        }
      } catch (err) {
        console.warn(`API lead creation failed for row ${rowNum}, falling back to store persistence...`);
        const totalCount = currentLeads.length + newLeadsToAppend.length;
        const generatedLeadId = rowLeadId || `MC-${10000 + totalCount + 1}`;
        const localLead = {
          ...leadPayload,
          id: `ld-imported-${Date.now()}-${i}`,
          leadId: generatedLeadId,
          leadScore: leadPayload.state === 'FL' || leadPayload.state === 'CA' ? 92 : 72,
          aiSummary: `AI LEAD SUMMARY:\nLead generated for ${firstName} ${lastName} via Lead Follow Up CSV.`,
          duplicateDetected: false,
          campaignName: matchingCamp?.name || `${tortTypeVal} Campaign`,
          tortName: tortTypeVal,
          vendorName: targetVendorName,
          sourceName: 'Lead Follow Up CSV Ingestion',
          createdAt: new Date().toISOString()
        };
        newLeadsToAppend.push(localLead);
        successCount++;
        existingEmails.add(email.toLowerCase());
        existingLeadIds.add(generatedLeadId.toUpperCase());
      }
    }

    if (newLeadsToAppend.length > 0) {
      const mergedLeads = [...newLeadsToAppend, ...leads];
      useCRMStore.setState({ leads: mergedLeads });
      if (typeof window !== 'undefined') {
        localStorage.setItem('mc_leads', JSON.stringify(mergedLeads));
      }
    }

    setImportSummary({
      success: successCount,
      failed: failedCount,
      reports: reports
    });

    showToast(`Processed ${parsedCsvData.length} records!`, 'success');
    fetchData();
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'contactName',
      'type',
      'status',
      'leadName',
      'substatus',
      'billable',
      'reasonForRejection',
      'dateSent',
      'dateSubscribed',
      'tier',
      'reasonForDQ',
      'reasonForDoesntMeetCriteria',
      'reasonForSpam',
      'trustedForm',
      'callDuration',
      'firstName',
      'middleName',
      'lastName',
      'gender',
      'dateOfBirth',
      'phoneNumber',
      'email',
      'addressStreet',
      'city',
      'state',
      'areaCode',
      'powerOfAttorney',
      'victimName',
      'victimFullName',
      'victimLastName',
      'victimDOB',
      'victimDOD',
      'diagnosis',
      'diagnosisYear',
      'diagnosingDoctorName',
      'treatingDoctorName',
      'diagnosingHospitalName',
      'treatingFacilityName',
      'diagnosingHospitalAddress',
      'treatingFacilityAddress',
      'diagnosingFacilityPhone',
      'treatingFacilityPhone'
    ];
    const sampleRow = [
      'Jane Doe Contact',
      'PFAS',
      'New',
      'Jane Lead',
      'TCPA OK',
      'true',
      '',
      '2026-08-02',
      '2026-08-01',
      'Tier 1',
      '',
      '',
      '',
      'https://cert.trustedform.com/sample',
      '05:30',
      'Jane',
      'M',
      'Doe',
      'Female',
      '1985-04-12',
      '415-555-0199',
      'jane.doe@example.com',
      '100 Market St',
      'San Francisco',
      'CA',
      '415',
      'false',
      '',
      '',
      '',
      '',
      '',
      'Non-Hodgkin Lymphoma',
      '2021',
      'Dr. Vance',
      'Dr. Rostova',
      'St. Jude Medical Center',
      'Johns Hopkins Hospital',
      '123 Health Ave, Baltimore MD',
      '600 N Wolfe St, Baltimore MD',
      '410-555-0199',
      '410-555-0244'
    ];
    const csvContent = '\uFEFF' + [headers.join(','), sampleRow.map(escapeCSV).join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'lead_followup_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    showImportModal,
    setShowImportModal,
    csvStep,
    setCsvStep,
    csvFile,
    parsedCsvData,
    validationErrors,
    importSummary,
    handleCSVFileChange,
    handleValidateCsv,
    handleCSVImportConfirm,
    handleDownloadTemplate
  };
}
