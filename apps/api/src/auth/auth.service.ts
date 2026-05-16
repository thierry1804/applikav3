import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { AuthTokens, AuthUser, JwtPayload } from '@dogapp/types';
import type { EnvConfig } from '../config/env.schema';
import { AuditService } from '../audit/audit.service';
import { AuthRepository } from './auth.repository';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: { email: string; password: string; name: string }): Promise<{
    user: AuthUser;
    tokens: AuthTokens;
  }> {
    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.authRepository.createUser({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    const tokens = await this.issueTokens(user.id, user.email, user.isBreeder);
    return { user: this.toAuthUser(user), tokens };
  }

  async login(dto: { email: string; password: string }): Promise<{
    user: AuthUser;
    tokens: AuthTokens;
  }> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.isBreeder);
    return { user: this.toAuthUser(user), tokens };
  }

  async refresh(tokenId: string, rawRefreshToken: string): Promise<AuthTokens> {
    const stored = await this.authRepository.findRefreshToken(tokenId);
    if (!stored || stored.revokedAt) {
      if (stored) {
        await this.handleRevokedTokenReuse(stored.userId);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    const valid = await bcrypt.compare(rawRefreshToken, stored.tokenHash);
    if (!valid || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.authRepository.revokeRefreshToken(tokenId);
    const user = await this.authRepository.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.issueTokens(user.id, user.email, user.isBreeder);
  }

  async refreshFromOpaque(combined: string): Promise<AuthTokens> {
    const dotIndex = combined.indexOf('.');
    if (dotIndex === -1) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokenId = combined.slice(0, dotIndex);
    const raw = combined.slice(dotIndex + 1);
    return this.refresh(tokenId, raw);
  }

  async logout(tokenId: string): Promise<void> {
    await this.authRepository.revokeRefreshToken(tokenId);
  }

  async revokeAll(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserTokens(userId);
  }

  async cleanupExpiredTokens(): Promise<number> {
    return this.authRepository.deleteExpiredTokens();
  }

  private async handleRevokedTokenReuse(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserTokens(userId);
    await this.auditService.log(userId, 'REVOKED_TOKEN_REUSE', 'User', userId);
  }

  private async issueTokens(
    userId: string,
    email: string,
    isBreeder: boolean,
  ): Promise<AuthTokens> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const payload: JwtPayload = {
      sub: userId,
      email,
      role: user.role as JwtPayload['role'],
      isBreeder,
      iat: Math.floor(Date.now() / 1000),
      exp: 0,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRY', { infer: true }),
    });

    const rawRefresh = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await bcrypt.hash(rawRefresh, BCRYPT_ROUNDS);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const refreshRecord = await this.authRepository.createRefreshToken({
      userId,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: `${refreshRecord.id}.${rawRefresh}`,
    };
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isBreeder: boolean;
    avatarUrl: string | null;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthUser['role'],
      isBreeder: user.isBreeder,
      avatarUrl: user.avatarUrl,
    };
  }
}
