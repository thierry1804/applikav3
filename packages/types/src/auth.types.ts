import type { UserRole } from './enums.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isBreeder: boolean;
  avatarUrl: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  isBreeder: boolean;
  iat: number;
  exp: number;
}
