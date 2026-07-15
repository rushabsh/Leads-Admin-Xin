import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:campaigns')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        massTort: true,
        vendor: true,
        lawFirm: true,
        leads: true,
      },
    });

    if (!campaign) return NextResponse.json({ success: false, message: 'Campaign not found' }, { status: 404 });
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Campaign GET Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'update:campaigns')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    if (body.tortTypeId) {
      body.massTortId = body.tortTypeId;
      delete body.tortTypeId;
    }

    // Parse floats, ints, dates
    if (body.budget !== undefined) body.budget = body.budget !== null ? parseFloat(body.budget) : 0.0;
    if (body.costPerLeadTarget !== undefined) body.costPerLeadTarget = body.costPerLeadTarget !== null ? parseFloat(body.costPerLeadTarget) : 0.0;
    if (body.expectedLeadTarget !== undefined) body.expectedLeadTarget = body.expectedLeadTarget !== null ? parseInt(body.expectedLeadTarget) : 0;
    if (body.startDate !== undefined) body.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) body.endDate = body.endDate ? new Date(body.endDate) : null;

    const campaign = await prisma.campaign.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, message: 'Campaign updated successfully', campaign });
  } catch (error: any) {
    console.error('Campaign PUT Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'delete:campaigns')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    await prisma.campaign.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Campaign DELETE Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
