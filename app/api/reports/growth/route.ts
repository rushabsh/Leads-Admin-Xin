import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:reports')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const data = [
      { name: 'Jan', Leads: 65, Qualified: 40 },
      { name: 'Feb', Leads: 85, Qualified: 55 },
      { name: 'Mar', Leads: 120, Qualified: 80 },
      { name: 'Apr', Leads: 155, Qualified: 105 },
      { name: 'May', Leads: 230, Qualified: 165 },
      { name: 'Jun', Leads: 340, Qualified: 250 },
    ];

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
