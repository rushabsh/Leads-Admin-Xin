import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:campaigns')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const massTorts = await prisma.massTort.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: massTorts });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'write:settings')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { name, description } = await req.json();

    const massTort = await prisma.massTort.create({
      data: {
        name,
        description,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'MASSTORT_CREATED',
        tableName: 'MassTort',
        recordId: massTort.id,
        newValues: JSON.stringify({ name, description }),
      },
    });

    return NextResponse.json({ success: true, message: 'Mass Tort litigation registered successfully', massTort }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
