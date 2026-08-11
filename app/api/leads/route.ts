import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../lib/authHelper';
import { AIService } from '../../../lib/aiService';

/**
 * GET - Paginated and filtered leads list
 */
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'read:leads')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1') || 1;
    const limit = parseInt(searchParams.get('limit') || '10') || 10;
    const search = searchParams.get('search') || '';
    
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const campaignId = searchParams.get('campaignId');
    const vendorId = searchParams.get('vendorId');
    const lawFirmId = searchParams.get('lawFirmId');
    const state = searchParams.get('state');
    
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const skip = (page - 1) * limit;
    const where: any = {};

    // Role restrictions
    if (user.roleName === 'Vendor') {
      where.vendorId = user.vendorId || 'none';
    } else if (vendorId) {
      where.vendorId = vendorId;
    }

    if (user.roleName === 'Law Firm' || user.roleName === 'Attorney') {
      where.lawFirmId = user.lawFirmId || 'none';
    } else if (lawFirmId) {
      where.lawFirmId = lawFirmId;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (campaignId) where.campaignId = campaignId;
    if (state) where.state = state;

    if (search) {
      where.OR = [
        { leadId: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          campaign: { include: { massTort: true } },
          vendor: true,
          lawFirm: true,
          intakeAgent: true,
          source: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Leads GET Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST - Create new lead
 */
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'create:leads')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      state,
      status,
      priority,
      campaignId,
      vendorId,
      lawFirmId,
      sourceId,
      caseDetails,
      tortTypeId,
      dob,
      gender,
      address,
      ssn,
      incidentDate,
      exposure,
      symptoms,
      diagnosis,
      hospital,
      attorney,
      intakeAgentId
    } = body;

    // Check duplicate
    const duplicateDetected = await AIService.checkDuplicateLead(firstName, lastName, email, phone);

    // Calculate score
    const leadScore = AIService.calculateLeadScore(state, caseDetails);

    // Resolve campaign record safely
    let targetCampaignId = campaignId;
    let campaign = null;

    if (targetCampaignId && typeof targetCampaignId === 'string' && targetCampaignId.length === 24) {
      campaign = await prisma.campaign.findUnique({
        where: { id: targetCampaignId },
        include: { massTort: true }
      }).catch(() => null);
    }

    if (!campaign) {
      const activeVendorId = vendorId || user.vendorId;
      campaign = await prisma.campaign.findFirst({
        where: activeVendorId && typeof activeVendorId === 'string' && activeVendorId.length === 24 ? { vendorId: activeVendorId } : {},
        include: { massTort: true }
      }).catch(() => null);

      if (!campaign) {
        campaign = await prisma.campaign.findFirst({
          include: { massTort: true }
        }).catch(() => null);
      }
    }

    if (!campaign) {
      let defaultMassTort = await prisma.massTort.findFirst().catch(() => null);
      if (!defaultMassTort) {
        defaultMassTort = await prisma.massTort.create({
          data: { name: 'General Mass Tort', description: 'Default Mass Tort' }
        });
      }
      campaign = await prisma.campaign.create({
        data: {
          name: 'Default Campaign',
          description: 'Default System Campaign',
          budget: 10000,
          massTortId: defaultMassTort.id,
          vendorId: vendorId && typeof vendorId === 'string' && vendorId.length === 24 ? vendorId : (user.vendorId && user.vendorId.length === 24 ? user.vendorId : undefined)
        },
        include: { massTort: true }
      });
    }

    targetCampaignId = campaign.id;
    const tortName = campaign?.massTort?.name || 'General Mass Tort';
    const aiSummary = await AIService.generateLeadSummary(firstName, lastName, tortName, state, caseDetails);

    // Format custom ID safely
    const count = await prisma.lead.count();
    let leadId = `MC-${10000 + count + 1}`;
    let existingLead = await prisma.lead.findUnique({ where: { leadId } }).catch(() => null);
    let attempts = 0;
    while (existingLead && attempts < 100) {
      attempts++;
      leadId = `MC-${10000 + count + 1 + attempts}`;
      existingLead = await prisma.lead.findUnique({ where: { leadId } }).catch(() => null);
    }
    if (existingLead) {
      leadId = `MC-${Date.now().toString().slice(-6)}`;
    }

    const resolvedVendorId = vendorId && typeof vendorId === 'string' && vendorId.length === 24 ? vendorId : (user.vendorId && typeof user.vendorId === 'string' && user.vendorId.length === 24 ? user.vendorId : undefined);
    const resolvedLawFirmId = lawFirmId && typeof lawFirmId === 'string' && lawFirmId.length === 24 ? lawFirmId : undefined;
    const resolvedSourceId = sourceId && typeof sourceId === 'string' && sourceId.length === 24 ? sourceId : undefined;
    const resolvedTortTypeId = tortTypeId && typeof tortTypeId === 'string' && tortTypeId.length === 24 ? tortTypeId : undefined;
    const resolvedIntakeAgentId = intakeAgentId && typeof intakeAgentId === 'string' && intakeAgentId.length === 24 ? intakeAgentId : (user.roleName === 'Intake Agent' ? user.id : undefined);

    const lead = await prisma.lead.create({
      data: {
        leadId,
        firstName: firstName || 'Lead',
        lastName: lastName || 'FollowUp',
        phone: phone || '(555) 000-0000',
        email: email || 'lead@example.com',
        state: state || 'CA',
        status: status || 'NEW',
        priority: priority || 'MEDIUM',
        leadScore,
        aiSummary,
        duplicateDetected,
        campaignId: targetCampaignId,
        vendorId: resolvedVendorId,
        lawFirmId: resolvedLawFirmId,
        sourceId: resolvedSourceId,
        caseDetails,
        tortTypeId: resolvedTortTypeId,
        dob,
        gender,
        address,
        ssn,
        incidentDate,
        exposure,
        symptoms,
        diagnosis,
        hospital,
        attorney,
        intakeAgentId: resolvedIntakeAgentId,
      },
    });

    // Increment Campaign count
    await prisma.campaign.update({
      where: { id: targetCampaignId },
      data: { leadCount: { increment: 1 } }
    }).catch(() => null);

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId: lead.id,
        action: 'LEAD_CREATED',
        details: `Lead ${leadId} (${firstName} ${lastName}) created with score ${leadScore}`,
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      lead,
    }, { status: 201 });
  } catch (error) {
    console.error('Leads POST Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
