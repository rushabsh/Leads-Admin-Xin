import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';
import { getCampaignVendorIds, updateCampaignVendorIds } from '../../../../lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:campaigns') && user.roleName !== 'Vendor') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        massTort: true,
        vendor: true,
        lawFirm: true,
        leads: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!campaign) return NextResponse.json({ success: false, message: 'Campaign not found' }, { status: 404 });

    const rawVendorIds = await getCampaignVendorIds(campaign.id);
    const effectiveVendorIds = rawVendorIds.length > 0
      ? rawVendorIds
      : (campaign.vendorId ? [campaign.vendorId] : []);

    const vendorDocs = await prisma.vendor.findMany({
      where: { id: { in: effectiveVendorIds } },
      select: { id: true, name: true, email: true, status: true }
    });

    const isAssignedToUser =
      user.roleName !== 'Vendor' ||
      !campaign.vendorId ||
      campaign.vendorId === user.vendorId ||
      effectiveVendorIds.includes(user.vendorId || '');

    if (!isAssignedToUser) {
      return NextResponse.json({ success: false, message: 'Forbidden: Access to campaign denied' }, { status: 403 });
    }

    const responseCampaign = {
      ...campaign,
      vendorIds: effectiveVendorIds,
      vendors: vendorDocs,
      vendor: campaign.vendor || vendorDocs[0] || null
    };

    return NextResponse.json({ success: true, campaign: responseCampaign });
  } catch (error) {
    console.error('Campaign GET Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'update:campaigns')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    if (body.tortTypeId) {
      body.massTortId = body.tortTypeId;
      delete body.tortTypeId;
    }

    // If name is being updated, validate and strictly check uniqueness (case-insensitive)
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ success: false, message: 'Campaign name cannot be empty' }, { status: 400 });
      }
      const trimmedName = body.name.trim();
      const existingCampaign = await prisma.campaign.findFirst({
        where: {
          name: {
            equals: trimmedName,
            mode: 'insensitive',
          },
          id: { not: id },
        },
      });

      if (existingCampaign) {
        return NextResponse.json(
          { success: false, message: `A campaign named "${trimmedName}" already exists. Please choose a unique name.` },
          { status: 400 }
        );
      }
      body.name = trimmedName;
    }

    // Vendor Assignment: Support single, multiple, or unassigned/all vendors (null)
    let finalVendorIds: string[] | undefined = undefined;
    if (body.vendorIds !== undefined) {
      if (Array.isArray(body.vendorIds)) {
        finalVendorIds = body.vendorIds.map((v: any) => String(v).trim()).filter(Boolean);
      }
    }
    if (body.vendorId !== undefined) {
      const vList: string[] = finalVendorIds ? [...finalVendorIds] : [];
      if (body.vendorId === 'all' || body.vendorId === '') {
        finalVendorIds = [];
      } else if (Array.isArray(body.vendorId)) {
        body.vendorId.forEach((v: any) => {
          const s = String(v).trim();
          if (s && !vList.includes(s)) vList.push(s);
        });
        finalVendorIds = vList;
      } else if (typeof body.vendorId === 'string' && body.vendorId.trim()) {
        const parts = body.vendorId.split(',').map((s: string) => s.trim()).filter(Boolean);
        parts.forEach((p: string) => {
          if (!vList.includes(p)) vList.push(p);
        });
        finalVendorIds = vList;
      }
    }
    if (finalVendorIds !== undefined) {
      finalVendorIds = Array.from(new Set(finalVendorIds));
      body.vendorId = finalVendorIds[0] || null;
    }
    delete body.vendorIds;

    // Sanitize lawFirmId (empty string to null)
    if (body.lawFirmId === '') {
      body.lawFirmId = null;
    }

    // Parse floats, ints, dates
    if (body.budget !== undefined) body.budget = body.budget !== null ? parseFloat(body.budget) : 0.0;
    if (body.costPerLeadTarget !== undefined) body.costPerLeadTarget = body.costPerLeadTarget !== null ? parseFloat(body.costPerLeadTarget) : 0.0;
    if (body.expectedLeadTarget !== undefined) body.expectedLeadTarget = body.expectedLeadTarget !== null ? parseInt(body.expectedLeadTarget) : 0;
    if (body.startDate !== undefined) body.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) body.endDate = body.endDate ? new Date(body.endDate) : null;

    const campaign = await prisma.campaign.update({
      where: { id },
      data: body,
      include: {
        massTort: true,
        vendor: true,
        lawFirm: true,
      },
    });

    if (finalVendorIds !== undefined) {
      await updateCampaignVendorIds(id, finalVendorIds);
    } else {
      finalVendorIds = await getCampaignVendorIds(id);
    }

    const assignedVendors = finalVendorIds && finalVendorIds.length > 0
      ? await prisma.vendor.findMany({
          where: { id: { in: finalVendorIds } },
          select: { id: true, name: true, email: true, status: true }
        })
      : (campaign.vendor ? [campaign.vendor] : []);

    const responseCampaign = {
      ...campaign,
      vendorIds: finalVendorIds,
      vendors: assignedVendors,
      vendor: campaign.vendor || assignedVendors[0] || null
    };

    return NextResponse.json({ success: true, message: 'Campaign updated successfully', campaign: responseCampaign });
  } catch (error: any) {
    console.error('Campaign PUT Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'delete:campaigns')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    await prisma.campaign.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Campaign DELETE Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
