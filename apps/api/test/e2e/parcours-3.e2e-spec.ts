jest.mock('ioredis');

import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type {
  AuditLog,
  CheckupQuestion,
  CheckupResult,
  Dog,
  SymptomLog,
  User,
} from '@prisma/client';
import type { JwtService } from '@nestjs/jwt';
import type { DeepMockProxy } from 'jest-mock-extended';
import type { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from '../helpers/test-app';

/**
 * Parcours 3: Saisie symptômes → Check-up rapide → Résultat
 */

const USER_ID = 'p3-user-1';
const DOG_ID = 'p3-dog-1';
const SYMPTOM_ID = 'p3-symptom-1';
const Q1_ID = 'p3-q-1';
const Q2_ID = 'p3-q-2';
const now = new Date();

// SAFE: E2E test fixture
const baseUser = {
  id: USER_ID,
  email: 'parcours3@test.com',
  passwordHash: 'hash',
  name: 'P3 User',
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
  name: 'Max',
  breed: 'Bouledogue',
  birthDate: new Date('2019-06-10'),
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

// SAFE: E2E test fixture
const baseSymptomLog = {
  id: SYMPTOM_ID,
  dogId: DOG_ID,
  loggedAt: now,
  symptoms: ['léthargie', 'perte appétit'],
  severity: 2,
  notes: null,
  photoUrl: null,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
} as unknown as SymptomLog;

// SAFE: E2E test fixture
const baseQuestion = (id: string, questionKey: string, sortOrder: number): CheckupQuestion => ({
  id,
  questionKey,
  label: questionKey,
  sortOrder,
  minAgeMonths: null,
  maxAgeMonths: null,
  createdAt: now,
});

// SAFE: E2E test fixture
const stubAuditLog = { id: 'audit-1' } as unknown as AuditLog;

// SAFE: E2E test fixture
const stubCheckupResult = {
  id: 'p3-cr-1',
  dogId: DOG_ID,
  takenAt: now,
  score: 50,
  recommendation: 'watch',
  answers: {},
  createdAt: now,
} as unknown as CheckupResult;

describe('Parcours 3 — Symptômes → Check-up → Résultat', () => {
  let app: NestFastifyApplication;
  let prisma: DeepMockProxy<PrismaService>;
  let jwt: JwtService;
  let token: string;

  beforeAll(async () => {
    ({ app, prisma, jwt } = await createTestApp());
    token = await jwt.signAsync(
      { sub: USER_ID, email: 'parcours3@test.com', role: 'owner', isBreeder: false },
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

  it('logs a symptom entry for the dog', async () => {
    prisma.symptomLog.create.mockResolvedValue(baseSymptomLog);
    prisma.auditLog.create.mockResolvedValue(stubAuditLog);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/dogs/${DOG_ID}/health/symptoms`,
      headers: { authorization: `Bearer ${token}` },
      payload: { symptoms: ['léthargie', 'perte appétit'], severity: 2 },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.id).toBe(SYMPTOM_ID);
    expect(body.data.severity).toBe(2);
    expect(body.data.symptoms).toEqual(['léthargie', 'perte appétit']);
  });

  it('retrieves checkup questions filtered by dog age', async () => {
    prisma.dog.findUnique.mockResolvedValue(baseDog);
    prisma.checkupQuestion.findMany.mockResolvedValue([
      baseQuestion(Q1_ID, 'Mange-t-il normalement ?', 1),
      baseQuestion(Q2_ID, 'Est-il actif ?', 2),
    ]);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/dogs/${DOG_ID}/checkup/questions`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toHaveLength(2);
  });

  it('submits checkup answers and returns a recommendation', async () => {
    // SAFE: E2E test fixture
    prisma.checkupResult.create.mockResolvedValue(stubCheckupResult);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/dogs/${DOG_ID}/checkup`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        answers: {
          [Q1_ID]: true,
          [Q2_ID]: false,
        },
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.score).toBe(50);
    expect(body.data.recommendation).toBe('watch');
  });
});
