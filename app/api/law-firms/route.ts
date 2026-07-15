import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:lawfirms')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const lawFirms = await prisma.lawFirm.findMany({
      include: {
        leads: true,
        cases: true,
        attorneys: true,
      },
    });

    return NextResponse.json({ success: true, data: lawFirms });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'create:lawfirms')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { name, email, contactEmail, phone, contactPhone, address, status } = await req.json();

    const lawFirm = await prisma.lawFirm.create({
      data: {
        name,
        email: email || contactEmail,
        phone: phone || contactPhone,
        address,
        status: status || 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, message: 'Law Firm created successfully', lawFirm }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
