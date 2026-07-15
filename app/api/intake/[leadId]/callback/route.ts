import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../../lib/authHelper';

export async function POST(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'update:leads')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { leadId } = await params;
    const { callbackTime, reason } = await req.json();

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });

    // Update status to CONTACTED (to call back later)
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'CONTACTED' },
    });

    // Create follow up task
    const task = await prisma.task.create({
      data: {
        title: `CALLBACK: Call client back`,
        description: reason || 'Scheduled callback',
        dueDate: new Date(callbackTime),
        priority: 'HIGH',
        status: 'PENDING',
        leadId,
        assignedToId: user.id,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId,
        action: 'CALLBACK_SCHEDULED',
        details: `Callback scheduled for ${new Date(callbackTime).toLocaleString()}. Reason: ${reason}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Callback scheduled successfully',
      task,
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
