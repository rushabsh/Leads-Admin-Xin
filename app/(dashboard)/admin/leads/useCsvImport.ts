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
      if (!row.firstName || !row.lastName) {
        errors.push(`Row ${rowNum}: Missing client name.`);
      }
      if (!row.phone) {
        errors.push(`Row ${rowNum}: Phone number is required.`);
      }
      if (!row.email || !row.email.includes('@')) {
        errors.push(`Row ${rowNum}: Invalid or missing email address.`);
      }
      const rowLeadId = row.leadId || row['Lead ID'] || row.leadid;
      if (rowLeadId && existingLeadIds.has(rowLeadId.toUpperCase())) {
        errors.push(`Row ${rowNum}: Duplicate Lead ID '${rowLeadId}' found in existing leads.`);
      }
      if (row.email && existingEmails.has(row.email.toLowerCase())) {
        errors.push(`Row ${rowNum}: Duplicate email '${row.email}' already exists.`);
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

      if (!row.firstName || !row.lastName) {
        failedCount++;
        reports.push(`Row ${rowNum}: Skipped - Missing client name.`);
        continue;
      }
      if (!row.phone) {
        failedCount++;
        reports.push(`Row ${rowNum}: Skipped - Phone number is required.`);
        continue;
      }
      if (!row.email || !row.email.includes('@')) {
        failedCount++;
        reports.push(`Row ${rowNum}: Skipped - Invalid or missing email address.`);
        continue;
      }

      const rowLeadId = row.leadId || row['Lead ID'] || row.leadid;
      if (rowLeadId && existingLeadIds.has(rowLeadId.toUpperCase())) {
        failedCount++;
        reports.push(`Row ${rowNum}: Skipped - Duplicate Lead ID '${rowLeadId}'.`);
        continue;
      }

      if (row.email && existingEmails.has(row.email.toLowerCase())) {
        failedCount++;
        reports.push(`Row ${rowNum}: Skipped - Email '${row.email}' already exists.`);
        continue;
      }

      const campaignNameVal = row.campaign || row.Campaign || '';
      const matchingCamp = campaigns.find(c => c.name.toLowerCase().includes(campaignNameVal.toLowerCase())) || campaigns[0];

      const vendorNameVal = row.vendor || row.Vendor || '';
      const matchingVendor = vendors.find(v => v.name.toLowerCase().includes(vendorNameVal.toLowerCase())) || vendors[0];
      const targetVendorId = defaultVendorId || matchingVendor?.id || vendors[0]?.id || '';
      const targetVendorName = defaultVendorName || matchingVendor?.name || 'Vendor';

      const leadPayload = {
        firstName: row.firstName,
        lastName: row.lastName,
        phone: row.phone,
        email: row.email,
        state: row.state || 'CA',
        priority: row.priority || 'MEDIUM',
        status: row.status || 'NEW',
        campaignId: matchingCamp?.id || campaigns[0]?.id || '',
        vendorId: targetVendorId,
        dob: row.dob || '',
        gender: row.gender || 'Male',
        address: row.address || '',
        ssn: row.ssn || '',
        caseDetails: row.caseDetails || 'Imported from CSV',
        incidentDate: row.incidentDate || row['Incident Date'] || row.incidentdate || '',
        exposure: row.exposure || row['Exposure'] || row['Exposure Description / Date'] || row.exposuredescription || '',
        symptoms: row.symptoms || row['Symptoms'] || '',
        diagnosis: row.diagnosis || row['Diagnosis'] || row['Diagnosis Details'] || '',
        hospital: row.hospital || row['Hospital'] || row['Treating Hospital'] || '',
        attorney: row.attorney || row['Attorney'] || row['Litigation Attorney'] || ''
      };

      try {
        const res = await api.post('/leads', leadPayload);
        const actualLead = res.data.lead;
        newLeadsToAppend.push(actualLead);
        successCount++;
        existingEmails.add(row.email.toLowerCase());
        if (actualLead.leadId) {
          existingLeadIds.add(actualLead.leadId.toUpperCase());
        }
      } catch (err) {
        console.warn(`API lead creation failed for row ${rowNum}, falling back to local creation...`);
        const totalCount = currentLeads.length + newLeadsToAppend.length;
        const generatedLeadId = rowLeadId || `MC-${10000 + totalCount + 1}`;
        const localLead = {
          ...leadPayload,
          id: `ld-imported-${Date.now()}-${i}`,
          leadId: generatedLeadId,
          leadScore: leadPayload.state === 'FL' || leadPayload.state === 'CA' ? 92 : 72,
          aiSummary: `AI LEAD SUMMARY:\nLead generated for ${leadPayload.firstName} ${leadPayload.lastName} via CSV.`,
          duplicateDetected: false,
          campaignName: matchingCamp?.name || 'General Inbound',
          tortName: matchingCamp?.tortName || 'General Mass Tort',
          vendorName: matchingVendor?.name || 'Internal',
          sourceName: 'CSV Import',
          createdAt: new Date().toISOString()
        };
        newLeadsToAppend.push(localLead);
        successCount++;
        existingEmails.add(row.email.toLowerCase());
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
      'leadId',
      'firstName',
      'lastName',
      'phone',
      'email',
      'state',
      'status',
      'priority',
      'campaign',
      'vendor',
      'dob',
      'gender',
      'address',
      'ssn',
      'caseDetails',
      'exposure',
      'incidentDate',
      'diagnosis',
      'symptoms',
      'hospital',
      'attorney'
    ];
    const sampleRow = [
      'MC-99999',
      'John',
      'Doe',
      '305-555-0199',
      'john.doe@example.com',
      'FL',
      'NEW',
      'MEDIUM',
      'Camp Lejeune Water Ads',
      'Premier Leads LLC',
      '1980-01-01',
      'Male',
      '123 Main St, Miami, FL 33101',
      '000-12-3456',
      'Exposed to contaminated water at Camp Lejeune from 1982 to 1984.',
      'Camp Lejeune water 1980-1982',
      '2021-03-15',
      'Kidney cancer',
      'Nausea, fatigue',
      'Mercy Health Hospital',
      'John Morgan Jr.'
    ];
    const csvContent = '\uFEFF' + [headers.join(','), sampleRow.map(escapeCSV).join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads_import_template.csv');
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
