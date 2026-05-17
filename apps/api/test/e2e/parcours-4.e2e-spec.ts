jest.mock('ioredis');

import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { AuditLog, BreedWeightRange, Dog, User, WeightLog } from '@prisma/client';
import type { JwtService } from '@nestjs/jwt';
import type { DeepMockProxy } from 'jest-mock-extended';
import type { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from '../helpers/test-app';

/**
 * Parcours 4: Pesée → Affichage courbe → Alerte hors plage
 */

const USER_ID = 'p4-user-1';
const DOG_ID = 'p4-dog-1';
const now = new Date();

// SAFE: E2E test fixture
const baseUser = {
  id: USER_ID,
  email: 'parcours4@test.com',
  passwordHash: 'hash',
  name: 'P4 User',
  role: 'owner',
  isBreeder: false,
  avatarUrl: null,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
} as unknown as User;

// SAFE: E2E test fixture
const baseDog = {
  id: DOG_ID,
  ownerId: USER_ID,
  name: 'Bella',
  breed: 'Golden Retriever',
  birthDate: new Date('2018-04-01'),
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

// SAFE: E2E test fixture — Prisma Decimal represented as number in mock
const makeWeightLog = (id: string, weightKg: number, weighedAt: string): WeightLog => ({
  id,
  dogId: DOG_ID,
  weighedAt: new Date(weighedAt),
  weightKg: weightKg as unknown as WeightLog['weightKg'],
  idempotencyKey: null,
  createdAt: now,
});

// SAFE: E2E test fixture
const stubAuditLog = { id: 'audit-1' } as unknown as AuditLog;

describe('Parcours 4 — Pesée → Courbe → Alerte hors plage', () => {
  let app: NestFastifyApplication;
  let prisma: DeepMockProxy<PrismaService>;
  let jwt: JwtService;
  let token: string;

  beforeAll(async () => {
    ({ app, prisma, jwt } = await createTestApp());
    token = await jwt.signAsync(
      { sub: USER_ID, email: 'parcours4@test.com', role: 'owner', isBreeder: false },
      { expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.user.findUnique.mockResolvedValue(baseUser);
    prisma.dog.findFirst.mockResolvedValue(baseDog);
  });

  it('records a new weight entry and returns out_of_range=false (no breed data)', async () => {
    const weightLog = makeWeightLog('p4-wl-1', 28.5, '2026-05-17');
    prisma.weightLog.create.mockResolvedValue(weightLog);
    prisma.dog.findUnique.mockResolvedValue(baseDog); // range check — returns dog
    prisma.breed.findUnique.mockResolvedValue(null); // no breed range → outOfRange=false
    prisma.auditLog.create.mockResolvedValue(stubAuditLog);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/dogs/${DOG_ID}/weight`,
      headers: { authorization: `Bearer ${token}` },
      payload: { weighedAt: '2026-05-17', weightKg: 28.5 },
    });

    expect(res.statusCode).toBe(201);
    // Service returns { data: WeightLogType, outOfRange: bool }
    // TransformInterceptor: has 'data' key → toSnakeCase → { data: {...}, out_of_range: bool }
    const body = res.json();
    expect(body.data.id).toBe('p4-wl-1');
    expect(body.data.weight_kg).toBe(28.5);
    expect(body.out_of_range).toBe(false);
  });

  it('retrieves weight history as a paginated list', async () => {
    const logs = [
      makeWeightLog('p4-wl-1', 28.5, '2026-05-17'),
      makeWeightLog('p4-wl-2', 27.8, '2026-04-01'),
    ];
    prisma.weightLog.findMany.mockResolvedValue(logs);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/dogs/${DOG_ID}/weight`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toHaveLength(2);
    expect(body.meta.has_more).toBe(false);
  });

  it('flags out_of_range=true when weight exceeds breed maximum', async () => {
    const heavyLog = makeWeightLog('p4-wl-3', 55.0, '2026-05-17');
    prisma.weightLog.create.mockResolvedValue(heavyLog);
    prisma.dog.findUnique.mockResolvedValue(baseDog);
    // SAFE: E2E test fixture — breed exists, triggers range check
    prisma.breed.findUnique.mockResolvedValue({
      id: 'br-golden',
      name: 'Golden Retriever',
      createdAt: now,
      updatedAt: now,
    });
    // SAFE: E2E test fixture — breed range: 25–40 kg; 55 kg exceeds max
    prisma.breedWeightRange.findFirst.mockResolvedValue({
      id: 'bwr-1',
      breedId: 'br-golden',
      minAgeMonths: 0,
      maxAgeMonths: 200,
      minWeightKg: 25 as unknown as BreedWeightRange['minWeightKg'],
      maxWeightKg: 40 as unknown as BreedWeightRange['maxWeightKg'],
      createdAt: now,
      updatedAt: now,
    });
    prisma.auditLog.create.mockResolvedValue(stubAuditLog);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/dogs/${DOG_ID}/weight`,
      headers: { authorization: `Bearer ${token}` },
      payload: { weighedAt: '2026-05-17', weightKg: 55.0 },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.id).toBe('p4-wl-3');
    expect(body.out_of_range).toBe(true);
  });
});
