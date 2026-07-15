import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../lib/prisma';
import { signAccessToken } from '../../../../lib/token';

export async function POST(req: NextRequest) {
  try {
    const { emailOrUsername, password } = await req.json();

    if (!emailOrUsername || !password) {
      return NextResponse.json({ success: false, message: 'Please provide credentials' }, { status: 400 });
    }

    const normalizedInput = emailOrUsername.toLowerCase().trim();

    // Query database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedInput },
          { username: normalizedInput }
        ]
      },
      include: {
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid Login ID or Password.' }, { status: 401 });
    }

    // Verify password
    let isValidPassword = false;
    if (user.passwordHash === 'mock_password_hash') {
      isValidPassword = (password === 'Password123!');
    } else {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: 'Invalid Login ID or Password.' }, { status: 401 });
    }

    // Verify that Vendor exists and is ACTIVE if role is Vendor
    if (user.role.name === 'Vendor') {
      if (!user.vendorId) {
        return NextResponse.json({ success: false, message: 'Vendor account is not associated with a registered vendor.' }, { status: 403 });
      }
      const vendor = await prisma.vendor.findUnique({
        where: { id: user.vendorId }
      });
      if (!vendor) {
        return NextResponse.json({ success: false, message: 'Vendor account no longer exists.' }, { status: 403 });
      }
      if (vendor.status !== 'ACTIVE') {
        return NextResponse.json({ success: false, message: 'Vendor account is inactive.' }, { status: 403 });
      }
    }

    const accessToken = signAccessToken(user.id, user.role.name, user.vendorId);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role.name,
        vendorId: user.vendorId,
        lawFirmId: user.lawFirmId
      }
    });

    response.cookies.set({
      name: 'token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Login Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
