import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../../lib/authHelper';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:lawfirms')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const attorneys = await prisma.user.findMany({
      where: {
        lawFirmId: id,
        role: { name: 'Attorney' },
      },
    });

    return NextResponse.json({ success: true, data: attorneys });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'update:lawfirms')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const { email, username, name, phone } = await req.json();

    const attorneyRole = await prisma.role.findFirst({ where: { name: 'Attorney' } });
    if (!attorneyRole) return NextResponse.json({ success: false, message: 'Attorney role not found' }, { status: 400 });

    const newAttorney = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: '$2b$10$UvT.R9X0/e9iQyW6qVezU.yv16c3XGq44Teql6lHnC3Lp5F2HqRbe', // default seeded Password123! hash
        name,
        phone,
        roleId: attorneyRole.id,
        lawFirmId: id,
      },
    });

    return NextResponse.json({ success: true, message: 'Attorney added successfully', attorney: newAttorney }, { status: 201 });
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
