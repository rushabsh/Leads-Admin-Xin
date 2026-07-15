import { NextRequest } from 'next/server';
import { verifyAccessToken } from './token';
import prisma from './prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  name: string;
  roleName: string;
  permissions: string[];
  vendorId?: string | null;
  lawFirmId?: string | null;
}

export async function verifyAuth(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    let token = '';
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      const cookieToken = req.cookies.get('token');
      if (cookieToken) {
        token = cookieToken.value;
      }
    }

    if (!token) return null;

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      roleName: user.role.name,
      permissions: user.role.permissions.map((p) => p.name),
      vendorId: user.vendorId,
      lawFirmId: user.lawFirmId,
    };
  } catch (error) {
    return null;
  }
}

export function checkPermission(user: AuthenticatedUser, permission: string): boolean {
  if (user.roleName === 'Super Admin') return true;
  if (user.permissions.includes(permission)) return true;

  // Map fine-grained action permissions (e.g. read:campaigns) to general management permission (e.g. manage:campaigns)
  const parts = permission.split(':');
  if (parts.length === 2) {
    const [action, resource] = parts;
    if (user.permissions.includes(`manage:${resource}`)) return true;
  }

  return false;
}

