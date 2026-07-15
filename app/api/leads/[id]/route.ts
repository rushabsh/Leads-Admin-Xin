import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';
import { AIService } from '../../../../lib/aiService';

/**
 * GET - Single Lead Profile Details
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'read:leads')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        campaign: { include: { massTort: true } },
        vendor: true,
        lawFirm: true,
        intakeAgent: true,
        source: true,
        case: { include: { stage: true } },
        tasks: { include: { assignedTo: true }, orderBy: { dueDate: 'asc' } },
        meetings: { orderBy: { startTime: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        activityLogs: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    }

    // Role restrictions
    if (user.roleName === 'Vendor' && lead.vendorId !== user.vendorId) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }
    if ((user.roleName === 'Law Firm' || user.roleName === 'Attorney') && lead.lawFirmId !== user.lawFirmId) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { recordId: id, tableName: 'Lead' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      lead: {
        ...lead,
        auditLogs,
      },
    });
  } catch (error) {
    console.error('Lead GET ID Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT - Update Lead Profile
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'update:leads')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    }

    // Role restrictions
    if (user.roleName === 'Vendor' && existingLead.vendorId !== user.vendorId) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }
    if ((user.roleName === 'Law Firm' || user.roleName === 'Attorney') && existingLead.lawFirmId !== user.lawFirmId) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    // Recalculate score if state or details changed
    if (body.state !== undefined || body.caseDetails !== undefined) {
      body.leadScore = AIService.calculateLeadScore(
        body.state !== undefined ? body.state : existingLead.state,
        body.caseDetails !== undefined ? body.caseDetails : existingLead.caseDetails || ''
      );
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: body,
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LEAD_UPDATED',
        tableName: 'Lead',
        recordId: id,
        oldValues: JSON.stringify(existingLead),
        newValues: JSON.stringify(updatedLead),
      },
    });

    // Create Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId: id,
        action: 'LEAD_UPDATED',
        details: `Lead status updated from ${existingLead.status} to ${updatedLead.status}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Lead PUT ID Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE - Delete Lead
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'delete:leads')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id } });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LEAD_DELETED',
        tableName: 'Lead',
        recordId: id,
        oldValues: JSON.stringify(lead),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('Lead DELETE ID Route Error:', error);
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
