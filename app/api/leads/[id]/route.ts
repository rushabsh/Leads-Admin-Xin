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

    const lead = await prisma.lead.findFirst({
      where: { OR: [{ id }, { leadId: id }] },
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
      where: { recordId: lead.id, tableName: 'Lead' },
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
 * PUT - Update Lead Profile (Admin Only)
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

    // Restrict editing lead details strictly to Admin or Super Admin roles
    if (user.roleName !== 'Super Admin' && user.roleName !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only Admins can edit lead details' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const existingLead = await prisma.lead.findFirst({
      where: { OR: [{ id }, { leadId: id }] },
    });
    if (!existingLead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    }

    // Helper to sanitize ObjectId fields
    const sanitizeObjectId = (val: any) => {
      if (typeof val === 'string' && val.trim().length === 24) {
        return val.trim();
      }
      return null;
    };

    const updateData: any = {};

    // Standard Lead Fields
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.dob !== undefined) updateData.dob = body.dob;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.ssn !== undefined) updateData.ssn = body.ssn;

    // Case Qualifier & Medical details
    if (body.incidentDate !== undefined) updateData.incidentDate = body.incidentDate;
    if (body.exposure !== undefined) updateData.exposure = body.exposure;
    if (body.symptoms !== undefined) updateData.symptoms = body.symptoms;
    if (body.diagnosis !== undefined) updateData.diagnosis = body.diagnosis;
    if (body.hospital !== undefined) updateData.hospital = body.hospital;
    if (body.attorney !== undefined) updateData.attorney = body.attorney;
    if (body.caseDetails !== undefined) updateData.caseDetails = typeof body.caseDetails === 'object' ? JSON.stringify(body.caseDetails) : body.caseDetails;

    // Foreign Keys / References
    if (body.campaignId !== undefined) {
      const cId = sanitizeObjectId(body.campaignId);
      if (cId) updateData.campaignId = cId;
    }
    if (body.vendorId !== undefined) {
      updateData.vendorId = sanitizeObjectId(body.vendorId);
    }
    if (body.lawFirmId !== undefined) {
      updateData.lawFirmId = sanitizeObjectId(body.lawFirmId);
    }
    if (body.sourceId !== undefined) {
      updateData.sourceId = sanitizeObjectId(body.sourceId);
    }
    if (body.tortTypeId !== undefined) {
      updateData.tortTypeId = sanitizeObjectId(body.tortTypeId);
    }
    if (body.intakeAgentId !== undefined) {
      updateData.intakeAgentId = sanitizeObjectId(body.intakeAgentId);
    }

    // Recalculate score if state or details changed
    if (body.state !== undefined || body.caseDetails !== undefined) {
      updateData.leadScore = AIService.calculateLeadScore(
        body.state !== undefined ? body.state : existingLead.state,
        body.caseDetails !== undefined
          ? (typeof body.caseDetails === 'object' ? JSON.stringify(body.caseDetails) : body.caseDetails)
          : existingLead.caseDetails || ''
      );
    }

    const updatedLead = await prisma.lead.update({
      where: { id: existingLead.id },
      data: updateData,
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LEAD_UPDATED',
        tableName: 'Lead',
        recordId: existingLead.id,
        oldValues: JSON.stringify(existingLead),
        newValues: JSON.stringify(updatedLead),
      },
    });

    // Create Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId: existingLead.id,
        action: 'LEAD_UPDATED',
        details: `Admin updated lead details for ${updatedLead.firstName} ${updatedLead.lastName} (${updatedLead.leadId})`,
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

    const lead = await prisma.lead.findFirst({
      where: { OR: [{ id }, { leadId: id }] },
    });
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id: lead.id } });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LEAD_DELETED',
        tableName: 'Lead',
        recordId: lead.id,
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
