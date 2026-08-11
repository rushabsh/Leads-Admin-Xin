import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AIService } from '@/lib/aiService';

/**
 * POST /api/public/submit-lead
 * Public unauthenticated endpoint for Vendor Employees to submit leads.
 * Saves lead directly into the CRM database under the dedicated Vendor and Lead table.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      vendorToken,
      vendorId: inputVendorId,
      submittedByEmployee,
      firstName,
      lastName,
      phone,
      email,
      state,
      city,
      addressStreet,
      areaCode,
      dob,
      gender,
      campaignId,
      campaignName,
      type,
      incidentType,
      diagnosis,
      diagnosisYear,
      diagnosingDoctorName,
      treatingDoctorName,
      diagnosingHospitalName,
      treatingFacilityName,
      diagnosingHospitalAddress,
      treatingFacilityAddress,
      diagnosingFacilityPhone,
      treatingFacilityPhone,
      // Screening fields
      robloxGamertag,
      robloxAccountAccess,
      robloxEvidenceTypes,
      robloxGroomingDoctorName,
      jdcFacility,
      jdcAbuserInfo,
      jdcAbuserRole,
      jdcWitnessAvailable,
      jdcInmateOnInmate,
      rideshareProvider,
      rideshareAssaulted,
      rideshareProofOfRide,
      rideshareDriverName,
      rideshareIncidentAddress,
      rideshareIncidentDate,
      rideshareNarrative,
      rideshareReportedTo,
      rideshareSymptomsDate,
      rideshareDiagnosisTestDate,
      rideshareTreatmentDate,
      legalRepresentation,
      felonyConviction,
      hasMedicalRecords,
      trustedForm,
      tier
    } = body;

    // Resolve Vendor
    let vendor = null;
    const targetVendorId = inputVendorId || vendorToken;
    if (targetVendorId && typeof targetVendorId === 'string' && targetVendorId.length === 24) {
      vendor = await prisma.vendor.findUnique({ where: { id: targetVendorId } }).catch(() => null);
    }
    if (!vendor) {
      vendor = await prisma.vendor.findFirst({ where: { status: 'ACTIVE' } }).catch(() => null);
    }

    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Invalid or inactive vendor token' }, { status: 400 });
    }

    // Resolve Campaign
    let campaign = null;
    if (campaignId && typeof campaignId === 'string' && campaignId.length === 24) {
      campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { massTort: true }
      }).catch(() => null);
    }

    if (!campaign) {
      campaign = await prisma.campaign.findFirst({
        where: { vendorId: vendor.id },
        include: { massTort: true }
      }).catch(() => null);
    }

    if (!campaign) {
      let defaultMassTort = await prisma.massTort.findFirst().catch(() => null);
      if (!defaultMassTort) {
        defaultMassTort = await prisma.massTort.create({
          data: { name: type || 'General Mass Tort', description: 'Auto-created Mass Tort' }
        });
      }
      campaign = await prisma.campaign.create({
        data: {
          name: campaignName || `${type || 'Vendor'} Public Campaign`,
          description: 'Created via Public Vendor Employee Link',
          massTortId: defaultMassTort.id,
          vendorId: vendor.id
        },
        include: { massTort: true }
      });
    }

    const primaryFirstName = firstName || 'PublicLead';
    const primaryLastName = lastName || 'VendorEntry';
    const primaryPhone = phone || '(555) 000-0000';
    const primaryEmail = email || `public.lead.${Date.now()}@example.com`;
    const primaryState = state || 'CA';

    // Duplicate check
    const duplicateDetected = await AIService.checkDuplicateLead(primaryFirstName, primaryLastName, primaryEmail, primaryPhone);

    // Build structured caseDetails JSON payload
    const caseDetailsObj = {
      leadInfo: {
        contactName: `${primaryFirstName} ${primaryLastName}`,
        campaignName: campaignName || campaign.name,
        type: type || campaign.massTort?.name || 'General Mass Tort',
        status: 'NEW',
        billable: true,
        submittedByEmployee: submittedByEmployee || 'Public Employee Link',
        trustedForm: trustedForm || '',
        source: 'Public Vendor Form Link'
      },
      contactInfo: {
        firstName: primaryFirstName,
        lastName: primaryLastName,
        gender: gender || 'Male',
        dateOfBirth: dob || '',
        phoneNumber: primaryPhone,
        email: primaryEmail,
        addressStreet: addressStreet || '',
        city: city || '',
        state: primaryState,
        areaCode: areaCode || ''
      },
      diagnosisInfo: {
        incidentType: incidentType || 'Rape / Assault',
        diagnosis: diagnosis || 'PTSD',
        diagnosisYear: diagnosisYear || '',
        diagnosingDoctorName: diagnosingDoctorName || '',
        treatingDoctorName: treatingDoctorName || '',
        diagnosingHospitalName: diagnosingHospitalName || '',
        treatingFacilityName: treatingFacilityName || '',
        diagnosingHospitalAddress: diagnosingHospitalAddress || '',
        treatingFacilityAddress: treatingFacilityAddress || '',
        diagnosingFacilityPhone: diagnosingFacilityPhone || '',
        treatingFacilityPhone: treatingFacilityPhone || ''
      },
      screeningCriteria: {
        // Roblox
        robloxGamertag: robloxGamertag || '',
        robloxAccountAccess: robloxAccountAccess || 'Yes',
        robloxEvidenceTypes: robloxEvidenceTypes || '',
        robloxGroomingDoctorName: robloxGroomingDoctorName || '',
        // LA JDC
        jdcFacility: jdcFacility || 'MacLaren Hall',
        jdcAbuserInfo: jdcAbuserInfo || '',
        jdcAbuserRole: jdcAbuserRole || '',
        jdcWitnessAvailable: jdcWitnessAvailable || 'Yes',
        jdcInmateOnInmate: jdcInmateOnInmate || 'No',
        // Rideshare
        rideshareProvider: rideshareProvider || 'Uber',
        rideshareAssaulted: rideshareAssaulted || 'Yes',
        rideshareProofOfRide: rideshareProofOfRide || 'Yes',
        rideshareDriverName: rideshareDriverName || '',
        rideshareIncidentAddress: rideshareIncidentAddress || '',
        rideshareIncidentDate: rideshareIncidentDate || '',
        rideshareNarrative: rideshareNarrative || '',
        rideshareReportedTo: rideshareReportedTo || 'Parents',
        rideshareSymptomsDate: rideshareSymptomsDate || '',
        rideshareDiagnosisTestDate: rideshareDiagnosisTestDate || '',
        rideshareTreatmentDate: rideshareTreatmentDate || '',
        legalRepresentation: legalRepresentation || 'No',
        felonyConviction: felonyConviction || 'No',
        hasMedicalRecords: hasMedicalRecords || 'Yes'
      }
    };

    const caseDetailsFormatted = JSON.stringify(caseDetailsObj, null, 2);

    // Calculate score
    const leadScore = AIService.calculateLeadScore(primaryState, caseDetailsFormatted);
    const aiSummary = await AIService.generateLeadSummary(
      primaryFirstName,
      primaryLastName,
      campaign.massTort?.name || type || 'Mass Tort',
      primaryState,
      caseDetailsFormatted
    );

    // Generate unique Lead ID (e.g. MC-10045)
    const totalLeads = await prisma.lead.count();
    let leadId = `MC-${10000 + totalLeads + 1}`;
    let existingLead = await prisma.lead.findUnique({ where: { leadId } }).catch(() => null);
    let attempts = 0;
    while (existingLead && attempts < 100) {
      attempts++;
      leadId = `MC-${10000 + totalLeads + 1 + attempts}`;
      existingLead = await prisma.lead.findUnique({ where: { leadId } }).catch(() => null);
    }
    if (existingLead) {
      leadId = `MC-${Date.now().toString().slice(-6)}`;
    }

    const lead = await prisma.lead.create({
      data: {
        leadId,
        firstName: primaryFirstName,
        lastName: primaryLastName,
        phone: primaryPhone,
        email: primaryEmail,
        state: primaryState,
        status: 'NEW',
        priority: tier === 'Tier 1' ? 'HIGH' : 'MEDIUM',
        leadScore,
        aiSummary,
        duplicateDetected,
        campaignId: campaign.id,
        vendorId: vendor.id,
        dob: dob || '',
        gender: gender || 'Male',
        address: `${addressStreet || ''}, ${city || ''}, ${primaryState} ${areaCode || ''}`.trim(),
        diagnosis: diagnosis || 'PTSD',
        hospital: diagnosingHospitalName || treatingFacilityName || '',
        caseDetails: caseDetailsFormatted
      },
      include: {
        vendor: true,
        campaign: { include: { massTort: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully!',
      data: {
        id: lead.id,
        leadId: lead.leadId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        vendorName: vendor.name,
        campaignName: campaign.name,
        createdAt: lead.createdAt
      }
    });
  } catch (error) {
    console.error('Public Lead Submit Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit lead'
    }, { status: 500 });
  }
}
