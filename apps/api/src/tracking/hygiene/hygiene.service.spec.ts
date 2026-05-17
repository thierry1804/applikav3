import { NotFoundException } from '@nestjs/common';
import { HygieneCareType } from '@dogapp/types';
import { mock } from 'jest-mock-extended';
import type { AuditService } from '../../audit/audit.service';
import type { HygieneRepository } from './hygiene.repository';
import { HygieneService } from './hygiene.service';

const baseCare = {
  id: 'hyg-1',
  dogId: 'dog-1',
  careType: HygieneCareType.BATH,
  label: null,
  frequencyDays: 14,
  lastDoneAt: null,
  nextDueAt: new Date('2025-06-15'),
  isActive: true,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('HygieneService', () => {
  let service: HygieneService;
  const repository = mock<HygieneRepository>();
  const auditService = mock<AuditService>();

  beforeEach(() => {
    service = new HygieneService(repository, auditService);
    jest.clearAllMocks();
    auditService.log.mockResolvedValue(undefined);
  });

  it('findAll returns hygiene list', async () => {
    repository.findAllByDog.mockResolvedValue([baseCare]);
    const result = await service.findAll('dog-1');
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.careType).toBe(HygieneCareType.BATH);
  });

  it('create sets nextDueAt and logs audit', async () => {
    repository.create.mockResolvedValue(baseCare);
    const result = await service.create(
      'dog-1',
      { careType: HygieneCareType.BATH, frequencyDays: 14 },
      'user-1',
    );
    expect(result.id).toBe('hyg-1');
    expect(auditService.log).toHaveBeenCalledWith(
      'user-1',
      'CREATE_HYGIENE',
      'HygieneCare',
      'hyg-1',
    );
  });

  describe('markDone', () => {
    it('throws NotFoundException when not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.markDone('missing', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates nextDueAt and logs audit', async () => {
      repository.findById.mockResolvedValue(baseCare);
      repository.update.mockImplementation((_id, data) =>
        Promise.resolve({ ...baseCare, ...(data as object) }),
      );
      const result = await service.markDone('hyg-1', 'user-1');
      expect(result.lastDoneAt).not.toBeNull();
      expect(auditService.log).toHaveBeenCalledWith(
        'user-1',
        'DONE_HYGIENE',
        'HygieneCare',
        'hyg-1',
      );
    });
  });
});
