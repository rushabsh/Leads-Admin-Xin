import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:reports')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const [total, contacted, qualified, signed] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'CONTACTED' } }),
      prisma.lead.count({ where: { status: 'QUALIFIED' } }),
      prisma.lead.count({ where: { status: 'SIGNED_RETAINER' } }),
    ]);

    const data = [
      { name: 'Total Submissions', value: total },
      { name: 'Contacted (Voicemail/Busy)', value: contacted + qualified + signed },
      { name: 'Qualified Cases', value: qualified + signed },
      { name: 'Signed Retainers', value: signed },
    ];

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
