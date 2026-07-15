import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'read:cases')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1') || 1;
    const limit = parseInt(searchParams.get('limit') || '10') || 10;
    const search = searchParams.get('search') || '';
    
    const lawFirmId = searchParams.get('lawFirmId');
    const stageId = searchParams.get('stageId');
    const medicalRecordsStatus = searchParams.get('medicalRecordsStatus');

    const skip = (page - 1) * limit;
    const where: any = {};

    // Role restrictions
    if (user.roleName === 'Law Firm' || user.roleName === 'Attorney') {
      where.lawFirmId = user.lawFirmId || 'none';
    } else if (lawFirmId) {
      where.lawFirmId = lawFirmId;
    }

    if (stageId) where.stageId = stageId;
    if (medicalRecordsStatus) where.medicalRecordsStatus = medicalRecordsStatus;

    if (search) {
      where.OR = [
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { lead: { firstName: { contains: search, mode: 'insensitive' } } },
        { lead: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          lead: true,
          lawFirm: true,
          attorney: true,
          stage: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.case.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: cases,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Cases GET Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'create:cases')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { leadId, attorneyId, lawFirmId, stageId, settlementAmount, medicalRecordsStatus, courtDetails } = body;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    }

    const count = await prisma.case.count();
    const caseNumber = `CASE-2026-${1000 + count + 1}`;

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        leadId,
        attorneyId,
        lawFirmId: lawFirmId || lead.lawFirmId || undefined,
        stageId,
        settlementAmount: settlementAmount || 0,
        medicalRecordsStatus: medicalRecordsStatus || 'PENDING',
        courtDetails,
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'SIGNED_RETAINER' },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId,
        action: 'CASE_CREATED',
        details: `Case file ${caseNumber} initialized for client.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Case created successfully',
      case: newCase,
    }, { status: 201 });
  } catch (error) {
    console.error('Cases POST Route Error:', error);
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
