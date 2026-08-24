import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'masscore-jwt-secret-key-enterprise-production-ready';

async function verifyTokenSignature(token: string, secret: string): Promise<any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Convert secret string to Uint8Array
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    // Import key for Web Crypto HMAC-SHA256
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode Base64URL signature to Uint8Array
    const base64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
    const binarySignature = atob(paddedBase64);
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }

    // Verify cryptographic HMAC signature over "header.payload"
    const dataBytes = encoder.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes,
      dataBytes
    );

    if (!isValid) return null;

    // Decode verified payload
    const base64UrlPayload = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64UrlPayload)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    // Expired check
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const tokenCookie = req.cookies.get('token');
  const pathname = req.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith('/admin');
  const isVendorRoute = pathname.startsWith('/vendor-portal');

  if (!tokenCookie) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin-login', req.url));
    }
    if (isVendorRoute) {
      return NextResponse.redirect(new URL('/vendor-login', req.url));
    }
    return NextResponse.next();
  }

  const token = tokenCookie.value;
  const payload = await verifyTokenSignature(token, JWT_SECRET);

  if (!payload || !payload.role) {
    const redirectResponse = NextResponse.redirect(
      new URL(isAdminRoute ? '/admin-login' : '/vendor-login', req.url)
    );
    redirectResponse.cookies.set({
      name: 'token',
      value: '',
      path: '/',
      maxAge: 0
    });
    return redirectResponse;
  }

  const userRole = payload.role;

  if (isAdminRoute && userRole !== 'Admin' && userRole !== 'Super Admin') {
    return NextResponse.redirect(new URL('/admin-login', req.url));
  }

  if (isVendorRoute && userRole !== 'Vendor') {
    return NextResponse.redirect(new URL('/vendor-login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor-portal/:path*',
  ],
};
