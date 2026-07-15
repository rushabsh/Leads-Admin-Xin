import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

/**
 * GET - Single Case Details
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'read:cases')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: {
        lead: {
          include: {
            campaign: { include: { massTort: true } },
            vendor: true,
          },
        },
        lawFirm: true,
        attorney: true,
        stage: true,
        documents: true,
      },
    });

    if (!caseItem) {
      return NextResponse.json({ success: false, message: 'Case not found' }, { status: 404 });
    }

    // Role restrictions
    if ((user.roleName === 'Law Firm' || user.roleName === 'Attorney') && caseItem.lawFirmId !== user.lawFirmId) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      case: caseItem,
    });
  } catch (error) {
    console.error('Case GET ID Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT - Update Case
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'update:cases')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existingCase = await prisma.case.findUnique({ where: { id } });
    if (!existingCase) {
      return NextResponse.json({ success: false, message: 'Case not found' }, { status: 404 });
    }

    // Role restrictions
    if ((user.roleName === 'Law Firm' || user.roleName === 'Attorney') && existingCase.lawFirmId !== user.lawFirmId) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const updatedCase = await prisma.case.update({
      where: { id },
      data: body,
    });

    // Write Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId: existingCase.leadId,
        action: 'CASE_UPDATED',
        details: `Case details updated: ${JSON.stringify(body)}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Case updated successfully',
      case: updatedCase,
    });
  } catch (error) {
    console.error('Case PUT ID Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE - Delete Case
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'delete:cases')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const caseItem = await prisma.case.findUnique({ where: { id } });
    if (!caseItem) {
      return NextResponse.json({ success: false, message: 'Case not found' }, { status: 404 });
    }

    await prisma.case.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Case deleted successfully',
    });
  } catch (error) {
    console.error('Case DELETE ID Route Error:', error);
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
