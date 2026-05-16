import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AuditService } from '../../audit/audit.service';
import { HealthRecordRepository } from './health-record.repository';
import { HealthRecordService } from './health-record.service';

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
  });

  describe('findOne', () => {
    it('should throw NotFoundException when record missing', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
