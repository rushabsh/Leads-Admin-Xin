import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:settings')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const logs = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Map logs to match UI data
    const formatted = logs.map(l => ({
      id: l.id,
      action: l.action,
      createdAt: l.createdAt,
      details: `Table: ${l.tableName || 'N/A'}, Record: ${l.recordId || 'N/A'}`,
      userName: l.user?.name || 'System',
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
