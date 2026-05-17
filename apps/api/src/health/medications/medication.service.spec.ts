import { NotFoundException } from '@nestjs/common';
import { MedicationDoseStatus } from '@prisma/client';
import { mock } from 'jest-mock-extended';
import type { AuditService } from '../../audit/audit.service';
import type { MedicationRepository } from './medication.repository';
import { MedicationService } from './medication.service';

const baseMed = {
  id: 'med-1',
  dogId: 'dog-1',
  name: 'Amoxicillin',
  dosage: '250mg',
  frequency: { times: 2, unit: 'daily' },
  startDate: new Date('2025-01-01'),
  endDate: null,
  stockCount: 10,
  stockAlertThreshold: 3,
  isActive: true,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseDose = {
  id: 'dose-1',
  medicationId: 'med-1',
  scheduledAt: new Date(),
  takenAt: new Date(),
  status: MedicationDoseStatus.taken,
  idempotencyKey: null,
  createdAt: new Date(),
};

describe('MedicationService', () => {
  let service: MedicationService;
  const repository = mock<MedicationRepository>();
  const auditService = mock<AuditService>();

  beforeEach(() => {
    service = new MedicationService(repository, auditService);
    jest.clearAllMocks();
    auditService.log.mockResolvedValue(undefined);
  });

  it('findActive returns active meds', async () => {
    repository.findActiveByDog.mockResolvedValue([baseMed]);
    const result = await service.findActive('dog-1');
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.name).toBe('Amoxicillin');
  });

  it('create logs audit and returns medication', async () => {
    repository.create.mockResolvedValue(baseMed);
    const result = await service.create(
      'dog-1',
      { name: 'Amoxicillin', dosage: '250mg', frequency: { times: 2 }, startDate: '2025-01-01' },
      'user-1',
    );
    expect(result.id).toBe('med-1');
    expect(auditService.log).toHaveBeenCalledWith(
      'user-1',
      'CREATE_MEDICATION',
      'Medication',
      'med-1',
    );
  });

  describe('confirmDose', () => {
    it('throws NotFoundException when medication not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.confirmDose('missing', 'user-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('decrements stock and returns lowStock false when above threshold', async () => {
      repository.findById.mockResolvedValue(baseMed);
      repository.createDoseLog.mockResolvedValue(baseDose);
      repository.update.mockResolvedValue({ ...baseMed, stockCount: 9 });

      const result = await service.confirmDose('med-1', 'user-1');
      expect(result.lowStock).toBe(false);
      expect(repository.update).toHaveBeenCalledWith('med-1', { stockCount: 9 });
    });

    it('returns lowStock true when stock at or below threshold', async () => {
      repository.findById.mockResolvedValue({ ...baseMed, stockCount: 4, stockAlertThreshold: 3 });
      repository.createDoseLog.mockResolvedValue(baseDose);
      repository.update.mockResolvedValue({ ...baseMed, stockCount: 3 });

      const result = await service.confirmDose('med-1', 'user-1');
      expect(result.lowStock).toBe(true);
    });

    it('logs audit for dose', async () => {
      repository.findById.mockResolvedValue(baseMed);
      repository.createDoseLog.mockResolvedValue(baseDose);
      repository.update.mockResolvedValue(baseMed);

      await service.confirmDose('med-1', 'user-1');
      expect(auditService.log).toHaveBeenCalledWith(
        'user-1',
        'MEDICATION_DOSE_TAKEN',
        'MedicationDoseLog',
        'dose-1',
      );
    });
  });

  it('getDoseHistory returns logs', async () => {
    repository.findDoseLogs.mockResolvedValue([baseDose]);
    const result = await service.getDoseHistory('med-1');
    expect(result.data).toHaveLength(1);
  });
});
