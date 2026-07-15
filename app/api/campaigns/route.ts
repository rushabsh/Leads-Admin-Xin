import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:campaigns')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const campaigns = await prisma.campaign.findMany({
      include: {
        massTort: true,
        vendor: true,
        lawFirm: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('Campaigns GET Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'create:campaigns')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const {
      name,
      massTortId,
      tortTypeId,
      vendorId,
      lawFirmId,
      marketingSource,
      budget,
      startDate,
      endDate,
      costPerLeadTarget,
      expectedLeadTarget,
      status,
      description,
    } = await req.json();

    const campaign = await prisma.campaign.create({
      data: {
        name,
        massTortId: massTortId || tortTypeId,
        vendorId: vendorId || null,
        lawFirmId: lawFirmId || null,
        marketingSource: marketingSource || null,
        budget: budget ? parseFloat(budget) : 0.0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        costPerLeadTarget: costPerLeadTarget ? parseFloat(costPerLeadTarget) : 0.0,
        expectedLeadTarget: expectedLeadTarget ? parseInt(expectedLeadTarget) : 0,
        status: status || 'ACTIVE',
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Campaign created successfully', campaign }, { status: 201 });
  } catch (error: any) {
    console.error('Campaigns POST Route Error:', error);
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
