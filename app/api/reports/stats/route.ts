import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:reports')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const where: any = {};
    if (user.roleName === 'Vendor') {
      where.vendorId = user.vendorId || 'none';
    } else if (user.roleName === 'Law Firm' || user.roleName === 'Attorney') {
      where.lawFirmId = user.lawFirmId || 'none';
    }

    const [totalLeads, qualifiedLeads, signRetainers, rejectedLeads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({ where: { ...where, status: 'QUALIFIED' } }),
      prisma.lead.count({ where: { ...where, status: 'SIGNED_RETAINER' } }),
      prisma.lead.count({ where: { ...where, status: 'REJECTED' } }),
    ]);

    const activeCases = await prisma.case.count({
      where: {
        lawFirmId: user.lawFirmId || undefined,
        stage: { name: { not: 'Closed' } },
      },
    });

    const conversionRate = totalLeads > 0 ? Math.round(((qualifiedLeads + signRetainers) / totalLeads) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads,
        qualifiedLeads: qualifiedLeads + signRetainers,
        conversionRate,
        activeCases,
        rejectedLeads,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
