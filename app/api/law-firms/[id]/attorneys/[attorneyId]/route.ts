import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../../../lib/authHelper';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string, attorneyId: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'update:lawfirms')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { attorneyId } = await params;
    const { name, email, username, phone } = await req.json();

    // Check if it's in the User model
    const existingUser = await prisma.user.findUnique({ where: { id: attorneyId } });
    if (existingUser) {
      const updated = await prisma.user.update({
        where: { id: attorneyId },
        data: { name, email, username, phone },
      });
      return NextResponse.json({ success: true, message: 'Attorney updated successfully', attorney: updated });
    }

    // Check if it's in the Attorney model
    const existingAttorney = await prisma.attorney.findUnique({ where: { id: attorneyId } });
    if (existingAttorney) {
      const updated = await prisma.attorney.update({
        where: { id: attorneyId },
        data: { name, email, phone },
      });
      return NextResponse.json({ success: true, message: 'Attorney updated successfully', attorney: updated });
    }

    return NextResponse.json({ success: false, message: 'Attorney not found' }, { status: 404 });
  } catch (error) {
    console.error('Attorney PUT Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, attorneyId: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'update:lawfirms')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { attorneyId } = await params;

    // Check if it's in User model
    const existingUser = await prisma.user.findUnique({ where: { id: attorneyId } });
    if (existingUser) {
      await prisma.user.delete({ where: { id: attorneyId } });
      return NextResponse.json({ success: true, message: 'Attorney deleted successfully' });
    }

    // Check if it's in Attorney model
    const existingAttorney = await prisma.attorney.findUnique({ where: { id: attorneyId } });
    if (existingAttorney) {
      await prisma.attorney.delete({ where: { id: attorneyId } });
      return NextResponse.json({ success: true, message: 'Attorney deleted successfully' });
    }

    return NextResponse.json({ success: false, message: 'Attorney not found' }, { status: 404 });
  } catch (error) {
    console.error('Attorney DELETE Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
