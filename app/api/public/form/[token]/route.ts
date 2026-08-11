import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/public/form/[token]
 * Public unauthenticated endpoint to resolve Vendor info & available Campaigns by vendor ID or token.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Vendor token required' }, { status: 400 });
    }

    let vendor = null;
    if (token && token.length === 24) {
      vendor = await prisma.vendor.findUnique({
        where: { id: token },
        select: { id: true, name: true, email: true, status: true }
      }).catch(() => null);
    }

    if (!vendor) {
      vendor = await prisma.vendor.findFirst({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, email: true, status: true }
      }).catch(() => null);
    }

    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Vendor not found or inactive' }, { status: 404 });
    }

    // Fetch campaigns assigned to vendor or general active campaigns
    let campaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          { vendorId: vendor.id },
          { status: 'ACTIVE' }
        ]
      },
      include: {
        massTort: true
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    if (!campaigns || campaigns.length === 0) {
      const defaultMassTort = await prisma.massTort.findFirst().catch(() => null);
      campaigns = [
        {
          id: 'default-campaign',
          name: 'General Mass Tort Lead Intake',
          description: 'Standard Mass Tort Intake',
          budget: 0,
          roi: 0,
          revenue: 0,
          leadCount: 0,
          conversionRate: 0,
          status: 'ACTIVE',
          massTortId: defaultMassTort?.id || 'default',
          vendorId: vendor.id,
          lawFirmId: null,
          marketingSource: 'Public Form Link',
          startDate: null,
          endDate: null,
          costPerLeadTarget: 0,
          expectedLeadTarget: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          massTort: defaultMassTort || { id: 'default', name: 'General Mass Tort', description: '', isCustom: false, createdAt: new Date() }
        } as any
      ];
    }

    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email
      },
      campaigns: campaigns.map((c: any) => ({
        id: c.id,
        name: c.name,
        tortName: c.massTort?.name || c.name || 'General Mass Tort',
        description: c.description
      }))
    });
  } catch (error) {
    console.error('Public Form GET API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
