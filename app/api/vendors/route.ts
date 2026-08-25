import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'read:vendors')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const vendors = await prisma.vendor.findMany({
      include: {
        leads: true,
        campaigns: true,
        users: true,
        invoices: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error('Vendors GET Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'create:vendors')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const {
      name,
      email,
      contactEmail,
      phone,
      contactPhone,
      address,
      status,
      contactPerson,
      username,
      password,
    } = await req.json();

    const finalEmail = email || contactEmail;
    const finalPhone = phone || contactPhone;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Company Name is required' }, { status: 400 });
    }
    if (!finalEmail) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }
    if (!username) {
      return NextResponse.json({ success: false, message: 'Username/Login ID is required' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ success: false, message: 'Password is required' }, { status: 400 });
    }

    // 1. Check duplicate Vendor / User email
    const normalizedEmail = finalEmail.toLowerCase().trim();
    const existingVendorEmail = await prisma.vendor.findFirst({
      where: { email: normalizedEmail }
    });
    const existingUserEmail = await prisma.user.findFirst({
      where: { email: normalizedEmail }
    });
    if (existingVendorEmail || existingUserEmail) {
      return NextResponse.json({ success: false, message: 'Vendor email already exists' }, { status: 400 });
    }

    // 2. Check duplicate Vendor / User mobile number
    if (finalPhone && finalPhone.trim() !== '') {
      const normalizedPhone = finalPhone.trim();
      const existingVendorPhone = await prisma.vendor.findFirst({
        where: { phone: normalizedPhone }
      });
      const existingUserPhone = await prisma.user.findFirst({
        where: { phone: normalizedPhone }
      });
      if (existingVendorPhone || existingUserPhone) {
        return NextResponse.json({ success: false, message: 'Mobile number already exists' }, { status: 400 });
      }
    }

    // 3. Check duplicate Username / Login ID
    const normalizedUsername = username.toLowerCase().trim();
    const existingUserUsername = await prisma.user.findFirst({
      where: { username: normalizedUsername }
    });
    if (existingUserUsername) {
      return NextResponse.json({
        success: false,
        message: 'Username / Login ID already exists'
      }, { status: 400 });
    }

    // Fetch the Role with name 'Vendor'
    const vendorRole = await prisma.role.findUnique({
      where: { name: 'Vendor' }
    });
    if (!vendorRole) {
      return NextResponse.json({ success: false, message: 'Vendor role not found in system' }, { status: 500 });
    }

    // Hash the password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create Vendor and associated User in a transaction
    const newVendor = await prisma.$transaction(async (tx) => {
      const v = await tx.vendor.create({
        data: {
          name,
          email: normalizedEmail,
          phone: finalPhone,
          address,
          status: status || 'ACTIVE',
        }
      });

      await tx.user.create({
        data: {
          email: normalizedEmail,
          username: normalizedUsername,
          passwordHash,
          name: contactPerson || name, // Fallback to Vendor Name if contactPerson is not specified
          phone: finalPhone,
          vendorId: v.id,
          roleId: vendorRole.id,
        }
      });

      return v;
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor created successfully',
      vendor: newVendor,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Vendors POST Route Error:', error);
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

