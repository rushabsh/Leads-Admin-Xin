import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../../lib/authHelper';
import { AIService } from '../../../../../lib/aiService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'update:leads')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { leadId } = await params;
    const { callNotes, disposition } = await req.json();

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });

    const aiCallSummary = await AIService.generateCallSummary(callNotes);

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: disposition || 'CONTACTED',
        aiSummary: `${lead.aiSummary || ''}\n\n${aiCallSummary}`,
      },
    });

    // Write Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId,
        action: 'CALL_COMPLETED',
        details: `Call logged by agent. Notes: ${callNotes}. Disposition: ${disposition}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Intake call logged successfully',
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Call Log Route Error:', error);
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
