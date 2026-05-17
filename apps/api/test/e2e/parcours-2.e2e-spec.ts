jest.mock('ioredis');

import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type {
  AuditLog,
  Dog,
  Medication,
  MedicationDoseLog,
  RefreshToken,
  User,
} from '@prisma/client';
import type { DeepMockProxy } from 'jest-mock-extended';
import * as bcrypt from 'bcrypt';
import type { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from '../helpers/test-app';

/**
 * Parcours 2: Login → Création médicament → Confirmation prise → Historique
 */

const USER_ID = 'p2-user-1';
const DOG_ID = 'p2-dog-1';
const MED_ID = 'p2-med-1';
const DOSE_ID = 'p2-dose-1';
const now = new Date();

// SAFE: E2E test fixture
const buildUser = (passwordHash: string): User => ({
  id: USER_ID,
  email: 'parcours2@test.com',
  passwordHash,
  name: 'P2 User',
  role: 'owner',
  isBreeder: false,
  avatarUrl: null,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
});

// SAFE: E2E test fixture
const baseDog = {
  id: DOG_ID,
  ownerId: USER_ID,
  name: 'Luna',
  breed: 'Berger',
  birthDate: new Date('2021-03-15'),
  sex: 'female',
  sterilized: true,
  weightKg: null,
  lofNumber: null,
  lomadNumber: null,
  chipNumber: null,
  photoUrl: null,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
} as unknown as Dog;

// SAFE: E2E test fixture
const baseMedication = {
  id: MED_ID,
  dogId: DOG_ID,
  name: 'Nexgard',
  dosage: '1 comprimé',
  frequency: { type: 'monthly' },
  startDate: new Date('2026-05-01'),
  endDate: null,
  stockCount: 3,
  stockAlertThreshold: 1,
  isActive: true,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
} as unknown as Medication;

// SAFE: E2E test fixture
const baseDoseLog = {
  id: DOSE_ID,
  medicationId: MED_ID,
  scheduledAt: now,
  takenAt: now,
  status: 'taken',
  idempotencyKey: null,
  createdAt: now,
} as unknown as MedicationDoseLog;

// SAFE: E2E test fixture
const baseRefreshToken = {
  id: 'p2-rt-1',
  userId: USER_ID,
  tokenHash: 'hash',
  expiresAt: new Date(Date.now() + 86400_000),
  revokedAt: null,
  createdAt: now,
} as unknown as RefreshToken;

// SAFE: E2E test fixture
const stubAuditLog = { id: 'audit-1' } as unknown as AuditLog;

describe('Parcours 2 — Login → Médicament → Dose → Historique', () => {
  let app: NestFastifyApplication;
  let prisma: DeepMockProxy<PrismaService>;
  let token: string;
  let hashedPassword: string;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    hashedPassword = await bcrypt.hash('password123', 12);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('logs in an existing user and returns an access token', async () => {
    const user = buildUser(hashedPassword);
    prisma.user.findUnique
      .mockResolvedValueOnce(user) // login email lookup
      .mockResolvedValue(user); // issueTokens id lookup
    prisma.refreshToken.create.mockResolvedValue(baseRefreshToken);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'parcours2@test.com', password: 'password123' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.access_token).toBeDefined();
    token = body.data.access_token;
  });

  it('creates a medication programme for the dog', async () => {
    const user = buildUser(hashedPassword);
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.dog.findFirst.mockResolvedValue(baseDog); // DogOwnerGuard
    prisma.medication.create.mockResolvedValue(baseMedication);
    prisma.auditLog.create.mockResolvedValue(stubAuditLog);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/dogs/${DOG_ID}/health/medications`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        name: 'Nexgard',
        dosage: '1 comprimé',
        frequency: { type: 'monthly' },
        startDate: '2026-05-01',
        stockCount: 3,
        stockAlertThreshold: 1,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.id).toBe(MED_ID);
    expect(body.data.name).toBe('Nexgard');
    expect(body.data.stock_count).toBe(3);
  });

  it('confirms a dose and returns the dose log', async () => {
    const user = buildUser(hashedPassword);
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.dog.findFirst.mockResolvedValue(baseDog); // DogOwnerGuard
    prisma.medication.findFirst.mockResolvedValue(baseMedication);
    prisma.medicationDoseLog.create.mockResolvedValue(baseDoseLog);
    // SAFE: E2E test fixture — updated stockCount after dose
    prisma.medication.update.mockResolvedValue({ ...baseMedication, stockCount: 2 });
    prisma.auditLog.create.mockResolvedValue(stubAuditLog);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/dogs/${DOG_ID}/health/medications/${MED_ID}/doses`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(201);
    // Service returns { data: doseLog, lowStock: bool } → TransformInterceptor → { data: {...}, low_stock: bool }
    const body = res.json();
    expect(body.data.id).toBe(DOSE_ID);
    expect(body.low_stock).toBe(false); // 2 > threshold 1
  });

  it('retrieves the dose history', async () => {
    const user = buildUser(hashedPassword);
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.dog.findFirst.mockResolvedValue(baseDog); // DogOwnerGuard
    prisma.medicationDoseLog.findMany.mockResolvedValue([baseDoseLog]);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/dogs/${DOG_ID}/health/medications/${MED_ID}/doses`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toHaveLength(1);
  });
});
