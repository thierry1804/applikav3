import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AuditService } from '../../audit/audit.service';
import { HealthRecordRepository } from './health-record.repository';
import { HealthRecordService } from './health-record.service';

const baseRecord = {
  id: 'rec-1',
  dogId: 'dog-1',
  vetName: 'Dr. Smith',
  visitDate: new Date('2025-01-15'),
  reason: 'Annual checkup',
  diagnosis: null,
  notes: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('HealthRecordService', () => {
  let service: HealthRecordService;
  const repository = mock<HealthRecordRepository>();
  const auditService = mock<AuditService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthRecordService,
        { provide: HealthRecordRepository, useValue: repository },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get(HealthRecordService);
    jest.clearAllMocks();
    auditService.log.mockResolvedValue(undefined);
  });

  describe('findAll', () => {
    it('returns paginated records', async () => {
      repository.findAllByDog.mockResolvedValue([baseRecord]);
      const result = await service.findAll('dog-1', { limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({ vetName: 'Dr. Smith' });
      expect(result.meta.hasMore).toBe(false);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when record missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns record when found', async () => {
      repository.findById.mockResolvedValue(baseRecord);
      const result = await service.findOne('rec-1');
      expect(result.id).toBe('rec-1');
      expect(result.visitDate).toBe('2025-01-15');
    });
  });

  describe('create', () => {
    it('creates record and logs audit', async () => {
      repository.create.mockResolvedValue(baseRecord);
      const result = await service.create(
        'dog-1',
        { vetName: 'Dr. Smith', visitDate: '2025-01-15', reason: 'Annual checkup' },
        'user-1',
      );
      expect(result.vetName).toBe('Dr. Smith');
      expect(auditService.log).toHaveBeenCalledWith(
        'user-1',
        'CREATE_HEALTH_RECORD',
        'HealthRecord',
        'rec-1',
      );
    });
  });

  describe('update', () => {
    it('updates and logs audit', async () => {
      repository.update.mockResolvedValue({ ...baseRecord, vetName: 'Dr. Jones' });
      const result = await service.update('rec-1', { vetName: 'Dr. Jones' }, 'user-1');
      expect(result.vetName).toBe('Dr. Jones');
      expect(auditService.log).toHaveBeenCalledWith(
        'user-1',
        'UPDATE_HEALTH_RECORD',
        'HealthRecord',
        'rec-1',
      );
    });
  });

  describe('remove', () => {
    it('soft deletes and logs audit', async () => {
      repository.softDelete.mockResolvedValue(baseRecord);
      await service.remove('rec-1', 'user-1');
      expect(repository.softDelete).toHaveBeenCalledWith('rec-1');
      expect(auditService.log).toHaveBeenCalledWith(
        'user-1',
        'DELETE_HEALTH_RECORD',
        'HealthRecord',
        'rec-1',
      );
    });
  });
});
