import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../../lib/authHelper';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'assign:leads')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { lawFirmId, intakeAgentId } = await req.json();

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    }

    const updateData: any = {};
    const logDetails: string[] = [];

    if (lawFirmId !== undefined) {
      updateData.lawFirmId = lawFirmId;
      const firm = lawFirmId ? await prisma.lawFirm.findUnique({ where: { id: lawFirmId } }) : null;
      logDetails.push(`Law Firm assigned: ${firm ? firm.name : 'Unassigned'}`);
    }

    if (intakeAgentId !== undefined) {
      updateData.intakeAgentId = intakeAgentId;
      const agent = intakeAgentId ? await prisma.user.findUnique({ where: { id: intakeAgentId } }) : null;
      logDetails.push(`Intake Agent assigned: ${agent ? agent.name : 'Unassigned'}`);
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    // Write Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId: id,
        action: 'LEAD_ASSIGNED',
        details: logDetails.join(', '),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead assignment updated successfully',
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Lead Assign Route Error:', error);
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
