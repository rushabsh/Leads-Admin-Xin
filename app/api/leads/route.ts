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

    // Generate AI Summary
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { massTort: true }
    });
    const tortName = campaign?.massTort?.name || 'General Mass Tort';
    const aiSummary = await AIService.generateLeadSummary(firstName, lastName, tortName, state, caseDetails);

    // Format custom ID
    const count = await prisma.lead.count();
    const leadId = `MC-${10000 + count + 1}`;

    const lead = await prisma.lead.create({
      data: {
        leadId,
        firstName,
        lastName,
        phone,
        email,
        state,
        status: status || 'NEW',
        priority: priority || 'MEDIUM',
        leadScore,
        aiSummary,
        duplicateDetected,
        campaignId,
        vendorId: vendorId || user.vendorId || undefined,
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
        intakeAgentId: intakeAgentId || (user.roleName === 'Intake Agent' ? user.id : undefined),
      },
    });

    // Increment Campaign count
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { leadCount: { increment: 1 } }
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId: lead.id,
        action: 'LEAD_CREATED',
        details: `Lead ${leadId} (${firstName} ${lastName}) created with score ${leadScore}`,
      },
    });

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
