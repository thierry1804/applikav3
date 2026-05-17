import { mock } from 'jest-mock-extended';
import type { AuditService } from '../../audit/audit.service';
import type { SymptomRepository } from './symptom.repository';
import { SymptomService } from './symptom.service';

const baseLog = {
  id: 'sym-1',
  dogId: 'dog-1',
  loggedAt: new Date('2025-01-15T10:00:00Z'),
  symptoms: ['vomiting'],
  severity: 2,
  notes: null,
  photoUrl: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('SymptomService', () => {
  let service: SymptomService;
  const repository = mock<SymptomRepository>();
  const auditService = mock<AuditService>();

  beforeEach(() => {
    service = new SymptomService(repository, auditService);
    jest.clearAllMocks();
    auditService.log.mockResolvedValue(undefined);
  });

  it('findAll returns paginated symptoms', async () => {
    repository.findAllByDog.mockResolvedValue([baseLog]);
    const result = await service.findAll('dog-1', { limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.symptoms).toEqual(['vomiting']);
  });

  it('create logs audit and returns symptom', async () => {
    repository.create.mockResolvedValue(baseLog);
    const result = await service.create('dog-1', { symptoms: ['vomiting'], severity: 2 }, 'user-1');
    expect(result.id).toBe('sym-1');
    expect(auditService.log).toHaveBeenCalledWith(
      'user-1',
      'CREATE_SYMPTOM',
      'SymptomLog',
      'sym-1',
    );
  });

  it('remove soft deletes and logs audit', async () => {
    repository.softDelete.mockResolvedValue(baseLog);
    await service.remove('sym-1', 'user-1');
    expect(repository.softDelete).toHaveBeenCalledWith('sym-1');
    expect(auditService.log).toHaveBeenCalledWith(
      'user-1',
      'DELETE_SYMPTOM',
      'SymptomLog',
      'sym-1',
    );
  });
});
