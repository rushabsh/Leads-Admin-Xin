import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:reports')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const data = [
      { name: 'Organic Search', value: 400 },
      { name: 'Paid Social Ads', value: 300 },
      { name: 'TV/Radio Broadcast', value: 200 },
      { name: 'Partner Referrals', value: 150 },
    ];

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
