import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:vendors')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        leads: true,
        campaigns: true,
        users: true,
        invoices: true,
      },
    });

    if (!vendor) return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });
    return NextResponse.json({ success: true, vendor });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'update:vendors')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    const {
      name,
      email,
      phone,
      address,
      status,
      contactPerson,
      username,
      password,
    } = body;

    // Find the associated User record
    const existingUser = await prisma.user.findFirst({
      where: { vendorId: id }
    });

    // 1. Check duplicate Vendor / User email
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingVendorEmail = await prisma.vendor.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id }
        }
      });
      const existingUserEmail = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: existingUser ? { id: existingUser.id } : undefined
        }
      });
      if (existingVendorEmail || existingUserEmail) {
        return NextResponse.json({ success: false, message: 'Vendor email already exists' }, { status: 400 });
      }
    }

    // 2. Check duplicate Vendor / User phone number
    if (phone && phone.trim() !== '') {
      const normalizedPhone = phone.trim();
      const existingVendorPhone = await prisma.vendor.findFirst({
        where: {
          phone: normalizedPhone,
          NOT: { id }
        }
      });
      const existingUserPhone = await prisma.user.findFirst({
        where: {
          phone: normalizedPhone,
          NOT: existingUser ? { id: existingUser.id } : undefined
        }
      });
      if (existingVendorPhone || existingUserPhone) {
        return NextResponse.json({ success: false, message: 'Mobile number already exists' }, { status: 400 });
      }
    }

    // 3. Check duplicate Username / Login ID
    if (username) {
      const normalizedUsername = username.toLowerCase().trim();
      const duplicateUsername = await prisma.user.findFirst({
        where: {
          username: normalizedUsername,
          NOT: existingUser ? { id: existingUser.id } : undefined
        }
      });

      if (duplicateUsername) {
        return NextResponse.json({
          success: false,
          message: 'Username / Login ID already exists'
        }, { status: 400 });
      }
    }

    // Hash the password if provided
    let passwordHash = undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Perform updates in transaction
    const vendor = await prisma.$transaction(async (tx) => {
      // Update Vendor
      const v = await tx.vendor.update({
        where: { id },
        data: {
          name,
          email: email?.toLowerCase().trim(),
          phone,
          address,
          status,
        }
      });

      // Update or create User
      if (existingUser) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name: contactPerson,
            email: email?.toLowerCase().trim(),
            username: username?.toLowerCase().trim(),
            phone,
            ...(passwordHash ? { passwordHash } : {}),
          }
        });
      } else {
        // Find Vendor role
        const vendorRole = await tx.role.findUnique({
          where: { name: 'Vendor' }
        });
        if (!vendorRole) {
          throw new Error('Vendor role not found in system');
        }

        const finalHash = passwordHash || await bcrypt.hash('Password123!', 10);
        await tx.user.create({
          data: {
            email: email?.toLowerCase().trim() || v.email,
            username: username?.toLowerCase().trim() || v.email.split('@')[0],
            passwordHash: finalHash,
            name: contactPerson || v.name,
            phone: phone || v.phone,
            vendorId: id,
            roleId: vendorRole.id,
          }
        });
      }

      return v;
    });

    return NextResponse.json({ success: true, message: 'Vendor updated successfully', vendor });
  } catch (error: any) {
    console.error('Vendor PUT Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'delete:vendors')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { id } = await params;

    // Delete associated User accounts first in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.deleteMany({ where: { vendorId: id } });
      await tx.vendor.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Vendor DELETE Error:', error);
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

