import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../../lib/authHelper';

export async function POST(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'assign:leads')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { leadId } = await params;
    const { lawFirmId, comments } = await req.json();

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });

    const firm = await prisma.lawFirm.findUnique({ where: { id: lawFirmId } });
    if (!firm) return NextResponse.json({ success: false, message: 'Law firm not found' }, { status: 404 });

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        lawFirmId,
        status: 'QUALIFIED',
      },
    });

    // Write Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId,
        action: 'LEAD_TRANSFERRED',
        details: `Transferred case to Law Firm: ${firm.name}. Comments: ${comments || 'No comments'}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Lead transferred to ${firm.name} successfully`,
      lead: updatedLead,
    });
  } catch (error) {
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
