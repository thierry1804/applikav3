import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { mock } from 'jest-mock-extended';
import { AuditService } from '../audit/audit.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

const baseUser = {
  id: 'user-1',
  email: 'a@b.com',
  passwordHash: 'hashed',
  name: 'Test',
  avatarUrl: null,
  role: 'owner' as const,
  isBreeder: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseRefreshToken = {
  id: 'token-1',
  userId: 'user-1',
  tokenHash: 'hashed-refresh',
  expiresAt: new Date(Date.now() + 86400_000),
  revokedAt: null,
  createdAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  const repository = mock<AuthRepository>();
  const jwtService = mock<JwtService>();
  const auditService = mock<AuditService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: repository },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string): string => {
              if (key === 'JWT_EXPIRY') return '15m';
              if (key === 'JWT_REFRESH_EXPIRY') return '30d';
              return 'test-secret-minimum-32-characters-long';
            },
          },
        },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws ConflictException when email exists', async () => {
      repository.findByEmail.mockResolvedValue(baseUser);
      await expect(
        service.register({ email: 'a@b.com', password: 'password1', name: 'Test' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('returns user and tokens on success', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.createUser.mockResolvedValue(baseUser);
      repository.findById.mockResolvedValue(baseUser);
      repository.createRefreshToken.mockResolvedValue(baseRefreshToken);
      jwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.register({
        email: 'new@b.com',
        password: 'password1',
        name: 'New',
      });

      expect(result.user.email).toBe('a@b.com');
      expect(result.tokens.accessToken).toBe('access-token');
      expect(result.tokens.refreshToken).toContain('token-1.');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      repository.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'unknown@test.com', password: 'password1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException for deleted user', async () => {
      repository.findByEmail.mockResolvedValue({ ...baseUser, deletedAt: new Date() });
      await expect(service.login({ email: 'a@b.com', password: 'p' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct', 12);
      repository.findByEmail.mockResolvedValue({ ...baseUser, passwordHash: hash });
      await expect(service.login({ email: 'a@b.com', password: 'wrong' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('returns user and tokens on valid credentials', async () => {
      const hash = await bcrypt.hash('password1', 12);
      repository.findByEmail.mockResolvedValue({ ...baseUser, passwordHash: hash });
      repository.findById.mockResolvedValue(baseUser);
      repository.createRefreshToken.mockResolvedValue(baseRefreshToken);
      jwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.login({ email: 'a@b.com', password: 'password1' });
      expect(result.tokens.accessToken).toBe('access-token');
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException when token not found', async () => {
      repository.findRefreshToken.mockResolvedValue(null);
      await expect(service.refresh('tid', 'raw')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when token already revoked and revokes all', async () => {
      repository.findRefreshToken.mockResolvedValue({ ...baseRefreshToken, revokedAt: new Date() });
      repository.revokeAllUserTokens.mockResolvedValue(undefined);
      auditService.log.mockResolvedValue(undefined);

      await expect(service.refresh('tid', 'raw')).rejects.toBeInstanceOf(UnauthorizedException);
      expect(repository.revokeAllUserTokens).toHaveBeenCalledWith('user-1');
    });

    it('throws UnauthorizedException for expired token', async () => {
      const hash = await bcrypt.hash('raw', 12);
      repository.findRefreshToken.mockResolvedValue({
        ...baseRefreshToken,
        tokenHash: hash,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.refresh('tid', 'raw')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rotates refresh token on valid input', async () => {
      const raw = 'valid-raw-token';
      const hash = await bcrypt.hash(raw, 12);
      repository.findRefreshToken.mockResolvedValue({ ...baseRefreshToken, tokenHash: hash });
      repository.revokeRefreshToken.mockResolvedValue(undefined);
      repository.findById.mockResolvedValue(baseUser);
      repository.createRefreshToken.mockResolvedValue(baseRefreshToken);
      jwtService.signAsync.mockResolvedValue('new-access-token');

      const tokens = await service.refresh('tid', raw);
      expect(tokens.accessToken).toBe('new-access-token');
      expect(repository.revokeRefreshToken).toHaveBeenCalledWith('tid');
    });
  });

  describe('logout', () => {
    it('revokes the token', async () => {
      repository.revokeRefreshToken.mockResolvedValue(undefined);
      await service.logout('token-id');
      expect(repository.revokeRefreshToken).toHaveBeenCalledWith('token-id');
    });
  });

  describe('revokeAll', () => {
    it('calls revokeAllUserTokens', async () => {
      repository.revokeAllUserTokens.mockResolvedValue(undefined);
      await service.revokeAll('user-1');
      expect(repository.revokeAllUserTokens).toHaveBeenCalledWith('user-1');
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('delegates to repository', async () => {
      repository.deleteExpiredTokens.mockResolvedValue(5);
      const count = await service.cleanupExpiredTokens();
      expect(count).toBe(5);
    });
  });
});
