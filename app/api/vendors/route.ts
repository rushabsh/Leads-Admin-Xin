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

    // Check duplicate Vendor email
    const existingVendor = await prisma.vendor.findUnique({
      where: { email: finalEmail.toLowerCase().trim() }
    });
    if (existingVendor) {
      return NextResponse.json({ success: false, message: 'Vendor email already exists' }, { status: 400 });
    }

    // Check duplicate User email or username
    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = finalEmail.toLowerCase().trim();
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: normalizedUsername }
        ]
      }
    });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'A user with this email or Username/Login ID already exists'
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

