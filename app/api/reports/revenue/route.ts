import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:reports')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const data = [
      { name: 'Jan', SourcingCosts: 5000, Revenue: 15000 },
      { name: 'Feb', SourcingCosts: 8000, Revenue: 22000 },
      { name: 'Mar', SourcingCosts: 11000, Revenue: 35000 },
      { name: 'Apr', SourcingCosts: 14000, Revenue: 48000 },
      { name: 'May', SourcingCosts: 20000, Revenue: 70000 },
      { name: 'Jun', SourcingCosts: 28000, Revenue: 105000 },
    ];

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
