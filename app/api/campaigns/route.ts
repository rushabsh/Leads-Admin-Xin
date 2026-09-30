import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../lib/authHelper';
import { getAllCampaignVendorIds, updateCampaignVendorIds } from '../../../lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:campaigns') && user.roleName !== 'Vendor') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const campaigns = await prisma.campaign.findMany({
      include: {
        massTort: true,
        vendor: true,
        lawFirm: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch raw vendorIds mapping from MongoDB
    const rawVendorIdsMap = await getAllCampaignVendorIds();

    // Collect all vendor IDs across all campaigns to batch-fetch vendor details
    const allReferencedVendorIds = new Set<string>();
    campaigns.forEach(c => {
      if (c.vendorId) allReferencedVendorIds.add(c.vendorId);
      const list = rawVendorIdsMap[c.id];
      if (Array.isArray(list)) {
        list.forEach(vid => allReferencedVendorIds.add(vid));
      }
    });

    const vendorDocs = await prisma.vendor.findMany({
      where: { id: { in: Array.from(allReferencedVendorIds) } },
      select: { id: true, name: true, email: true, status: true }
    });
    const vendorMap = new Map(vendorDocs.map(v => [v.id, v]));

    // Enrich each campaign with vendorIds array and populated vendors array
    let enrichedCampaigns = campaigns.map(c => {
      const explicitVendorIds = rawVendorIdsMap[c.id] || (c.vendorId ? [c.vendorId] : []);
      const matchedVendors = explicitVendorIds.map(vid => vendorMap.get(vid)).filter(Boolean);
      if (c.vendor && !matchedVendors.some(v => v?.id === c.vendor?.id)) {
        matchedVendors.unshift(c.vendor);
      }
      return {
        ...c,
        vendorIds: explicitVendorIds,
        vendors: matchedVendors,
        vendor: c.vendor || matchedVendors[0] || null
      };
    });

    // If user is Vendor, include assigned campaigns (by vendorId, in vendorIds, or open to all)
    if (user.roleName === 'Vendor') {
      const userVendorId = user.vendorId || 'none';
      enrichedCampaigns = enrichedCampaigns.filter(c =>
        c.vendorId === userVendorId ||
        c.vendorIds.includes(userVendorId) ||
        c.vendors.some((v: any) => v.id === userVendorId) ||
        !c.vendorId
      );
    }

    return NextResponse.json({ success: true, data: enrichedCampaigns });
  } catch (error) {
    console.error('Campaigns GET Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'create:campaigns')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const {
      name,
      massTortId,
      tortTypeId,
      vendorId,
      vendorIds,
      lawFirmId,
      marketingSource,
      budget,
      startDate,
      endDate,
      costPerLeadTarget,
      expectedLeadTarget,
      status,
      description,
    } = body;

    // Strict validation: Campaign name is required
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Campaign name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Strict uniqueness check: Prevent duplicate campaign names (case-insensitive)
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
      },
    });

    if (existingCampaign) {
      return NextResponse.json(
        { success: false, message: `A campaign named "${trimmedName}" already exists. Please choose a unique name.` },
        { status: 400 }
      );
    }

    // Collect all vendor IDs
    let finalVendorIds: string[] = [];
    if (Array.isArray(vendorIds)) {
      finalVendorIds = vendorIds.map(v => String(v).trim()).filter(Boolean);
    }
    if (vendorId && vendorId !== 'all') {
      if (Array.isArray(vendorId)) {
        vendorId.forEach(v => {
          const s = String(v).trim();
          if (s && !finalVendorIds.includes(s)) finalVendorIds.push(s);
        });
      } else if (typeof vendorId === 'string' && vendorId.trim()) {
        const parts = vendorId.split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => {
          if (!finalVendorIds.includes(p)) finalVendorIds.push(p);
        });
      }
    }
    finalVendorIds = Array.from(new Set(finalVendorIds));
    const singleVendorId = finalVendorIds[0] || null;

    const campaign = await prisma.campaign.create({
      data: {
        name: trimmedName,
        massTortId: massTortId || tortTypeId,
        vendorId: singleVendorId,
        lawFirmId: lawFirmId || null,
        marketingSource: marketingSource || null,
        budget: budget ? parseFloat(budget) : 0.0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        costPerLeadTarget: costPerLeadTarget ? parseFloat(costPerLeadTarget) : 0.0,
        expectedLeadTarget: expectedLeadTarget ? parseInt(expectedLeadTarget) : 0,
        status: status || 'ACTIVE',
        description: description ? description.trim() : null,
      },
      include: {
        massTort: true,
        vendor: true,
        lawFirm: true,
      },
    });

    // Save vendorIds in MongoDB
    if (finalVendorIds.length > 0) {
      await updateCampaignVendorIds(campaign.id, finalVendorIds);
    }

    const assignedVendors = finalVendorIds.length > 0
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

    return NextResponse.json({ success: true, message: 'Campaign created successfully', campaign: responseCampaign }, { status: 201 });
  } catch (error: any) {
    console.error('Campaigns POST Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
