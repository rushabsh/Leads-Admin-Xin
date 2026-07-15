import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:leads')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysLeads = await prisma.lead.findMany({
      where: {
        status: 'NEW',
        createdAt: { gte: today },
      },
      include: { campaign: true },
      orderBy: { createdAt: 'asc' },
    });

    const pendingCallbacks = await prisma.lead.findMany({
      where: {
        OR: [
          { status: 'CONTACTED' },
          {
            AND: [
              { status: 'NEW' },
              { createdAt: { lt: today } },
            ],
          },
        ],
      },
      include: { campaign: true },
      orderBy: { updatedAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      todaysQueue: todaysLeads,
      pendingQueue: pendingCallbacks,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
