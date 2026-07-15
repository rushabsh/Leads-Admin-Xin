import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    const leadWhere: any = {};
    const caseWhere: any = {};
    const campaignWhere: any = {};
    const vendorWhere: any = {};
    const lawFirmWhere: any = {};
    const invoiceWhere: any = {};

    if (user.roleName === 'Vendor') {
      const vendorId = user.vendorId || 'none';
      leadWhere.vendorId = vendorId;
      campaignWhere.vendorId = vendorId;
      invoiceWhere.vendorId = vendorId;
      caseWhere.lead = { vendorId };
    } else if (user.roleName === 'Law Firm' || user.roleName === 'Attorney') {
      const lawFirmId = user.lawFirmId || 'none';
      leadWhere.lawFirmId = lawFirmId;
      caseWhere.lawFirmId = lawFirmId;
      invoiceWhere.lawFirmId = lawFirmId;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLeads,
      todaysLeads,
      qualifiedLeads,
      disqualifiedLeads,
      signedRetainers,
      campaignsCount,
      vendorsCount,
      lawFirmsCount,
      casesWithAmount,
      invoices,
    ] = await Promise.all([
      prisma.lead.count({ where: leadWhere }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          createdAt: { gte: today },
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          status: 'QUALIFIED',
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          status: 'REJECTED',
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          status: 'SIGNED_RETAINER',
        },
      }),
      prisma.campaign.count({ where: campaignWhere }),
      prisma.vendor.count({ where: vendorWhere }),
      prisma.lawFirm.count({ where: lawFirmWhere }),
      prisma.case.findMany({
        where: caseWhere,
        select: { settlementAmount: true },
      }),
      prisma.invoice.findMany({
        where: invoiceWhere,
        select: { amount: true, status: true },
      }),
    ]);

    const revenue = casesWithAmount.reduce((sum, c) => sum + (c.settlementAmount || 0), 0);
    const unpaidInvoicesAmount = invoices
      .filter((i) => i.status === 'UNPAID' || i.status === 'PENDING')
      .reduce((sum, i) => sum + i.amount, 0);
    const pendingPayments = unpaidInvoicesAmount || (totalLeads * 150);

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        todaysLeads,
        qualifiedLeads,
        disqualifiedLeads,
        signedRetainers,
        campaigns: campaignsCount,
        vendors: vendorsCount,
        lawFirms: lawFirmsCount,
        revenue,
        pendingPayments,
      },
    });
  } catch (error) {
    console.error('Dashboard Stats GET Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
