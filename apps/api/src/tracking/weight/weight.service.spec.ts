import { mock } from 'jest-mock-extended';
import type { AuditService } from '../../audit/audit.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { WeightRepository } from './weight.repository';
import { WeightService } from './weight.service';

const baseLog = {
  id: 'wt-1',
  dogId: 'dog-1',
  weighedAt: new Date('2025-01-15'),
  weightKg: 12.5 as unknown as never,
  idempotencyKey: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseDog = {
  id: 'dog-1',
  breed: 'Labrador',
  birthDate: new Date('2022-01-01'),
};

describe('WeightService', () => {
  let service: WeightService;
  const repository = mock<WeightRepository>();
  const prisma = { dog: { findUnique: jest.fn() } } as unknown as InstanceType<
    typeof PrismaService
  >;
  const auditService = mock<AuditService>();

  beforeEach(() => {
    service = new WeightService(repository, prisma, auditService);
    jest.clearAllMocks();
    auditService.log.mockResolvedValue(undefined);
  });

  it('findAll returns paginated weight logs', async () => {
    repository.findAllByDog.mockResolvedValue([baseLog]);
    const result = await service.findAll('dog-1', { limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.weightKg).toBe(12.5);
  });

  describe('create', () => {
    it('creates log and returns outOfRange false when no breed range', async () => {
      repository.create.mockResolvedValue(baseLog);
      (prisma.dog.findUnique as jest.Mock).mockResolvedValue(baseDog);
      repository.findBreedRange.mockResolvedValue(null);

      const result = await service.create(
        'dog-1',
        { weighedAt: '2025-01-15', weightKg: 12.5 },
        'user-1',
      );
      expect(result.data.id).toBe('wt-1');
      expect(result.outOfRange).toBe(false);
    });

    it('detects out of range weight', async () => {
      repository.create.mockResolvedValue(baseLog);
      (prisma.dog.findUnique as jest.Mock).mockResolvedValue(baseDog);
      repository.findBreedRange.mockResolvedValue({ minWeightKg: 20, maxWeightKg: 35 });

      const result = await service.create(
        'dog-1',
        { weighedAt: '2025-01-15', weightKg: 12.5 },
        'user-1',
      );
      expect(result.outOfRange).toBe(true);
    });

    it('logs audit event', async () => {
      repository.create.mockResolvedValue(baseLog);
      (prisma.dog.findUnique as jest.Mock).mockResolvedValue(null);

      await service.create('dog-1', { weighedAt: '2025-01-15', weightKg: 12.5 }, 'user-1');
      expect(auditService.log).toHaveBeenCalledWith(
        'user-1',
        'CREATE_WEIGHT_LOG',
        'WeightLog',
        'wt-1',
      );
    });
  });
});
