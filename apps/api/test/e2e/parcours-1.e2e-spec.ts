jest.mock('ioredis');

import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { AuditLog, Dog, RefreshToken, Reminder, User } from '@prisma/client';
import type { DeepMockProxy } from 'jest-mock-extended';
import type { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from '../helpers/test-app';

/**
 * Parcours 1: Inscription → Ajout chien → Création rappel vaccin → Marquage effectué
 */

const USER_ID = 'p1-user-1';
const DOG_ID = 'p1-dog-1';
const REM_ID = 'p1-rem-1';
const now = new Date();

// SAFE: E2E test fixture — shape matches all Prisma User scalar fields
const baseUser = {
  id: USER_ID,
  email: 'parcours1@test.com',
  passwordHash: '',
  name: 'P1 User',
  role: 'owner',
  isBreeder: false,
  avatarUrl: null,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
} as unknown as User;

// SAFE: E2E test fixture — shape matches all Prisma Dog scalar fields
const baseDog = {
  id: DOG_ID,
  ownerId: USER_ID,
  name: 'Rex',
  breed: 'Labrador',
  birthDate: new Date('2020-01-01'),
  sex: 'male',
  sterilized: false,
  weightKg: null,
  lofNumber: null,
  lomadNumber: null,
  chipNumber: null,
  photoUrl: null,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
} as unknown as Dog;

// SAFE: E2E test fixture — shape matches all Prisma Reminder scalar fields
const baseReminder = {
  id: REM_ID,
  dogId: DOG_ID,
  type: 'vaccine',
  label: 'Vaccin rage',
  dueDate: new Date('2026-06-01'),
  recurrenceDays: null,
  lastDoneAt: null,
  isActive: true,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
} as unknown as Reminder;

// SAFE: E2E test fixture
const baseRefreshToken = {
  id: 'p1-rt-1',
  userId: USER_ID,
  tokenHash: 'hash',
  expiresAt: new Date(Date.now() + 86400_000),
  revokedAt: null,
  createdAt: now,
} as unknown as RefreshToken;

// SAFE: E2E test fixture
const stubAuditLog = {
  id: 'audit-1',
  userId: USER_ID,
  action: 'x',
  entityType: 'x',
  entityId: 'x',
  retentionUntil: now,
  createdAt: now,
} as unknown as AuditLog;

describe('Parcours 1 — Inscription → Chien → Rappel → Marquage effectué', () => {
  let app: NestFastifyApplication;
  let prisma: DeepMockProxy<PrismaService>;
  let token: string;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('registers a new user and returns an access token', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null) // email uniqueness check → not found
      .mockResolvedValue(baseUser); // id lookup in issueTokens
    prisma.user.create.mockResolvedValue(baseUser);
    prisma.refreshToken.create.mockResolvedValue(baseRefreshToken);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'parcours1@test.com', password: 'password123', name: 'P1 User' },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.access_token).toBeDefined();
    token = body.data.access_token;
  });

  it('creates a dog for the registered user', async () => {
    prisma.user.findUnique.mockResolvedValue(baseUser); // JWT strategy validate
    prisma.dog.create.mockResolvedValue(baseDog);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/dogs',
      headers: { authorization: `Bearer ${token}` },
      payload: { name: 'Rex', breed: 'Labrador', birthDate: '2020-01-01', sex: 'male' },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.id).toBe(DOG_ID);
    expect(body.data.name).toBe('Rex');
  });

  it('creates a vaccine reminder for the dog', async () => {
    prisma.user.findUnique.mockResolvedValue(baseUser);
    prisma.dog.findFirst.mockResolvedValue(baseDog); // DogOwnerGuard
    prisma.reminder.create.mockResolvedValue(baseReminder);
    prisma.auditLog.create.mockResolvedValue(stubAuditLog);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/dogs/${DOG_ID}/health/reminders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: 'vaccine', label: 'Vaccin rage', dueDate: '2026-06-01' },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.id).toBe(REM_ID);
    expect(body.data.is_active).toBe(true);
    expect(body.data.due_date).toBe('2026-06-01');
  });

  it('marks the reminder as done', async () => {
    const doneAt = new Date('2026-05-17');
    // SAFE: E2E test fixture
    const updatedReminder = { ...baseReminder, lastDoneAt: doneAt } as unknown as Reminder;

    prisma.user.findUnique.mockResolvedValue(baseUser);
    prisma.dog.findFirst.mockResolvedValue(baseDog);
    prisma.reminder.findFirst.mockResolvedValue(baseReminder);
    prisma.reminder.update.mockResolvedValue(updatedReminder);
    prisma.auditLog.create.mockResolvedValue(stubAuditLog);

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/dogs/${DOG_ID}/health/reminders/${REM_ID}/done`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.id).toBe(REM_ID);
    expect(body.data.last_done_at).toBe('2026-05-17');
  });
});
