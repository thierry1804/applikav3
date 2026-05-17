import { CheckupRecommendation } from '@dogapp/types';
import type { PrismaService } from '../prisma/prisma.service';
import { CheckupService } from './checkup.service';

const baseDog = {
  id: 'dog-1',
  birthDate: new Date(new Date().getFullYear() - 2, 0, 1),
};

const baseQuestion = (
  id: string,
): { id: string; text: string; sortOrder: number; minAgeMonths: null; maxAgeMonths: null } => ({
  id,
  text: `Question ${id}`,
  sortOrder: 1,
  minAgeMonths: null,
  maxAgeMonths: null,
});

describe('CheckupService', () => {
  let service: CheckupService;

  const dogMock = { findUnique: jest.fn() };
  const questionMock = { findMany: jest.fn() };
  const resultMock = { create: jest.fn() };
  const prisma = {
    dog: dogMock,
    checkupQuestion: questionMock,
    checkupResult: resultMock,
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    dogMock.findUnique.mockResolvedValue(baseDog);
    questionMock.findMany.mockResolvedValue([
      baseQuestion('q1'),
      baseQuestion('q2'),
      baseQuestion('q3'),
    ]);
    resultMock.create.mockResolvedValue({});
    service = new CheckupService(prisma);
  });

  describe('getQuestions', () => {
    it('fetches dog to compute age and queries questions with OR filter', async () => {
      const result = await service.getQuestions('dog-1');

      expect(dogMock.findUnique).toHaveBeenCalledWith({ where: { id: 'dog-1' } });
      expect(questionMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) }),
      );
      expect(result.data).toHaveLength(3);
    });

    it('uses ageMonths 0 when dog not found', async () => {
      dogMock.findUnique.mockResolvedValue(null);

      await service.getQuestions('missing');

      expect(questionMock.findMany).toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('returns GOOD when score >= 75', async () => {
      const answers = { q1: true, q2: true, q3: true, q4: true };
      const result = await service.submit('dog-1', answers);

      expect(result.data.recommendation).toBe(CheckupRecommendation.GOOD);
      expect(result.data.score).toBe(100);
    });

    it('returns WATCH when 50 <= score < 75', async () => {
      const answers = { q1: true, q2: true, q3: false, q4: false };
      const result = await service.submit('dog-1', answers);

      expect(result.data.recommendation).toBe(CheckupRecommendation.WATCH);
      expect(result.data.score).toBe(50);
    });

    it('returns CONSULT when score < 50', async () => {
      const answers = { q1: true, q2: false, q3: false, q4: false };
      const result = await service.submit('dog-1', answers);

      expect(result.data.recommendation).toBe(CheckupRecommendation.CONSULT);
      expect(result.data.score).toBe(25);
    });

    it('returns score 0 and CONSULT when all answers are false', async () => {
      const answers = { q1: false, q2: false };
      const result = await service.submit('dog-1', answers);

      expect(result.data.score).toBe(0);
      expect(result.data.recommendation).toBe(CheckupRecommendation.CONSULT);
    });

    it('persists result via prisma', async () => {
      await service.submit('dog-1', { q1: true });

      expect(resultMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ score: 100, recommendation: CheckupRecommendation.GOOD }),
        }),
      );
    });
  });
});
