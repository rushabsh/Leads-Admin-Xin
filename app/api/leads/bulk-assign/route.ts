import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'assign:leads')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { leadIds, lawFirmId, intakeAgentId } = await req.json();

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ success: false, message: 'No lead IDs provided' }, { status: 400 });
    }

    const updateData: any = {};
    if (lawFirmId !== undefined) updateData.lawFirmId = lawFirmId;
    if (intakeAgentId !== undefined) updateData.intakeAgentId = intakeAgentId;

    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: updateData,
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'BULK_LEADS_ASSIGNED',
        details: `Assigned ${leadIds.length} leads to firm: ${lawFirmId || 'none'}, agent: ${intakeAgentId || 'none'}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated assignments for ${leadIds.length} leads.`,
    });
  } catch (error) {
    console.error('Lead Bulk Assign Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
