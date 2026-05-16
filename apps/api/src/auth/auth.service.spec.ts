import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AuditService } from '../audit/audit.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

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
    it('should throw ConflictException when email exists', async () => {
      repository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        passwordHash: 'x',
        name: 'Test',
        avatarUrl: null,
        role: 'owner',
        isBreeder: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.register({ email: 'a@b.com', password: 'password1', name: 'Test' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for unknown email', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@test.com', password: 'password1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
