import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'masscore-jwt-secret-key-enterprise-production-ready';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'masscore-jwt-refresh-secret-key-enterprise-production-ready';

export interface TokenPayload {
  userId: string;
  role: string;
  vendorId?: string | null;
}

export const signAccessToken = (userId: string, role: string, vendorId?: string | null): string => {
  return jwt.sign({ userId, role, vendorId }, JWT_SECRET, { expiresIn: '1d' });
};

export const signRefreshToken = (userId: string, role: string, vendorId?: string | null): string => {
  return jwt.sign({ userId, role, vendorId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};
