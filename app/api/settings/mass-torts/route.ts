import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:campaigns')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const massTorts = await prisma.massTort.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: massTorts, massTorts });
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

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Lawsuit Name is required.' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check duplicate case-insensitively
    const existing = await prisma.massTort.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Lawsuit "${trimmedName}" already exists.` },
        { status: 400 }
      );
    }

    const massTort = await prisma.massTort.create({
      data: {
        name: trimmedName,
        description: description ? description.trim() : null,
        isCustom: true,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'MASSTORT_CREATED',
        tableName: 'MassTort',
        recordId: massTort.id,
        newValues: JSON.stringify({ name: trimmedName, description }),
      },
    });

    return NextResponse.json({ success: true, message: `Mass Tort litigation "${trimmedName}" registered successfully`, massTort }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'A lawsuit with this name already exists.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
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
