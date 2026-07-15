import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyAuth } from '../../../../../lib/authHelper';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const { id } = await params;
    const { action, details } = await req.json();

    const log = await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId: id,
        action: action || 'NOTE_ADDED',
        details,
      },
      include: {
        user: true,
      }
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error('Lead Activity POST Error:', error);
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
