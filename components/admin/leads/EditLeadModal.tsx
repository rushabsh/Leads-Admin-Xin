'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import NewCaseLeadFollowUpForm, { LeadFollowUpFormData } from '@/components/vendor-portal/leads/NewCaseLeadFollowUpForm';

interface EditLeadModalProps {
  showEditModal: boolean;
  setShowEditModal: (val: boolean) => void;
  lead: any;
  campaigns?: any[];
  vendors?: any[];
  lawFirms?: any[];
  onSuccess?: () => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
}

export function extractLeadFormInitialValues(lead: any): Partial<LeadFollowUpFormData> {
  if (!lead) return {};
  let parsed: any = {};
  if (typeof lead.caseDetails === 'string' && lead.caseDetails.trim().startsWith('{')) {
    try {
      parsed = JSON.parse(lead.caseDetails);
    } catch (_) {}
  }

  const leadInfo = parsed.leadInfo || {};
  const contactInfo = parsed.contactInfo || {};
  const poa = parsed.poa || {};
  const diagnosisInfo = parsed.diagnosisInfo || {};
  const screening = parsed.screeningCriteria || parsed.screening || {};

  return {
    // Section 1: Lead Information
    contactName: leadInfo.contactName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
    campaignName: leadInfo.campaignName || lead.campaign?.name || '',
    type: leadInfo.type || lead.tortName || lead.campaign?.massTort?.name || 'PFAS',
    status: leadInfo.status || (lead.status === 'QUALIFIED' || lead.status === 'SIGNED_RETAINER' ? 'Sent' : lead.status === 'REJECTED' ? 'Disqualified' : 'New'),
    leadName: leadInfo.leadName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
    substatus: leadInfo.substatus || 'None',
    billable: leadInfo.billable !== undefined ? leadInfo.billable : true,
    reasonForRejection: leadInfo.reasonForRejection || '',
    dateSent: leadInfo.dateSent || (lead.createdAt ? new Date(lead.createdAt).toISOString().split('T')[0] : ''),
    dateSubscribed: leadInfo.dateSubscribed || '',
    tier: leadInfo.tier || (lead.priority === 'HIGH' ? 'Tier 1' : 'Tier 2'),
    reasonForDQ: leadInfo.reasonForDQ || '',
    reasonForDoesntMeetCriteria: leadInfo.reasonForDoesntMeetCriteria || '',
    reasonForSpam: leadInfo.reasonForSpam || '',
    trustedForm: leadInfo.trustedForm || '',
    callDuration: leadInfo.callDuration || '',

    // Section 2: Contact Information
    firstName: contactInfo.firstName || lead.firstName || '',
    middleName: contactInfo.middleName || '',
    lastName: contactInfo.lastName || lead.lastName || '',
    gender: contactInfo.gender || lead.gender || 'Male',
    dateOfBirth: contactInfo.dateOfBirth || lead.dob || '',
    phoneNumber: contactInfo.phoneNumber || lead.phone || '',
    email: contactInfo.email || lead.email || '',
    addressStreet: contactInfo.addressStreet || lead.address || '',
    city: contactInfo.city || '',
    state: contactInfo.state || lead.state || 'CA',
    areaCode: contactInfo.areaCode || '',

    // Section 3: Power of Attorney
    powerOfAttorney: poa.powerOfAttorney !== undefined ? poa.powerOfAttorney : false,
    victimName: poa.victimName || '',
    victimFullName: poa.victimFullName || '',
    victimLastName: poa.victimLastName || '',
    victimDOB: poa.victimDOB || '',
    victimDOD: poa.victimDOD || '',

    // Section 4: Diagnosis Information
    incidentType: diagnosisInfo.incidentType || 'Oral Vaginal/anal – Rape',
    diagnosis: diagnosisInfo.diagnosis || lead.diagnosis || 'PTSD (Post-Traumatic Stress Disorder)',
    diagnosisYear: diagnosisInfo.diagnosisYear || '',
    diagnosingDoctorName: diagnosisInfo.diagnosingDoctorName || '',
    treatingDoctorName: diagnosisInfo.treatingDoctorName || '',
    diagnosingHospitalName: diagnosisInfo.diagnosingHospitalName || lead.hospital || '',
    treatingFacilityName: diagnosisInfo.treatingFacilityName || '',
    diagnosingHospitalAddress: diagnosisInfo.diagnosingHospitalAddress || '',
    treatingFacilityAddress: diagnosisInfo.treatingFacilityAddress || '',
    diagnosingFacilityPhone: diagnosisInfo.diagnosingFacilityPhone || '',
    treatingFacilityPhone: diagnosisInfo.treatingFacilityPhone || '',

    // Section 5: Screening & Other Criteria
    robloxGamertag: screening.robloxGamertag || '',
    robloxAccountAccess: screening.robloxAccountAccess || 'Yes',
    robloxEvidenceTypes: screening.robloxEvidenceTypes || '',
    robloxGroomingDoctorName: screening.robloxGroomingDoctorName || '',

    jdcFacility: screening.jdcFacility || 'MacLaren Hall',
    jdcAbuserInfo: screening.jdcAbuserInfo || '',
    jdcAbuserRole: screening.jdcAbuserRole || '',
    jdcWitnessAvailable: screening.jdcWitnessAvailable || 'Yes',
    jdcInmateOnInmate: screening.jdcInmateOnInmate || 'No',

    rideshareProvider: screening.rideshareProvider || 'Uber',
    rideshareAssaulted: screening.rideshareAssaulted || 'Yes',
    rideshareProofOfRide: screening.rideshareProofOfRide || 'Yes',
    rideshareDriverName: screening.rideshareDriverName || '',
    rideshareIncidentAddress: screening.rideshareIncidentAddress || '',
    rideshareIncidentDate: screening.rideshareIncidentDate || lead.incidentDate || '',
    rideshareNarrative: screening.rideshareNarrative || '',
    rideshareReportedTo: screening.rideshareReportedTo || 'Parents',
    rideshareSymptomsDetails: screening.rideshareSymptomsDetails || lead.symptoms || '',
    rideshareSymptomsDate: screening.rideshareSymptomsDate || '',
    rideshareDiagnosisTestDetails: screening.rideshareDiagnosisTestDetails || '',
    rideshareDiagnosisTestDate: screening.rideshareDiagnosisTestDate || '',
    rideshareTreatmentDetails: screening.rideshareTreatmentDetails || '',
    rideshareTreatmentDate: screening.rideshareTreatmentDate || '',
    legalRepresentation: screening.legalRepresentation || 'No',
    felonyConviction: screening.felonyConviction || 'No',
    hasMedicalRecords: screening.hasMedicalRecords || 'Yes',
  };
}

export default function EditLeadModal({
  showEditModal,
  setShowEditModal,
  lead,
  onSuccess
}: EditLeadModalProps) {
  const initialValues = useMemo(() => {
    return extractLeadFormInitialValues(lead);
  }, [lead]);

  if (!showEditModal || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-5xl my-auto overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Edit Lead Prospect & Case Details</h2>
                <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-mono font-bold text-blue-700 border border-blue-200">
                  {lead.leadId}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Update exact lead follow-up form details for {lead.firstName} {lead.lastName}. All changes save to DB and sync with vendor views.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Embedded Full Lead Form in Edit Mode */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <NewCaseLeadFollowUpForm
            isModal={true}
            isEditMode={true}
            leadId={lead.id}
            title={`Edit Lead Details (${lead.leadId})`}
            subtitle={`Configured for Vendor: ${lead.vendor?.name || 'Direct API'} | Campaign: ${lead.campaign?.name || 'Default Campaign'}`}
            vendorId={lead.vendorId || lead.vendor?.id}
            vendorName={lead.vendor?.name}
            initialValues={initialValues}
            showCsvOption={false}
            onCancel={() => setShowEditModal(false)}
            onSuccess={() => {
              setShowEditModal(false);
              if (onSuccess) onSuccess();
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
