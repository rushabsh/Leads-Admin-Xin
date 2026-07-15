import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
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

  try {
    const token = tokenCookie.value;
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    // Expired check
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error('Token expired');
    }

    const userRole = payload.role;

    if (isAdminRoute && userRole !== 'Admin' && userRole !== 'Super Admin') {
      return NextResponse.redirect(new URL('/admin-login', req.url));
    }

    if (isVendorRoute && userRole !== 'Vendor') {
      return NextResponse.redirect(new URL('/vendor-login', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    const redirectResponse = NextResponse.redirect(
      new URL(isAdminRoute ? '/admin-login' : '/vendor-login', req.url)
    );
    // Clear expired/invalid cookie
    redirectResponse.cookies.set({
      name: 'token',
      value: '',
      path: '/',
      maxAge: 0
    });
    return redirectResponse;
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor-portal/:path*',
  ],
};
