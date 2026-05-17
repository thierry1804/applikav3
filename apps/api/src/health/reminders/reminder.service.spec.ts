import { NotFoundException } from '@nestjs/common';
import { ReminderType } from '@dogapp/types';
import { mock } from 'jest-mock-extended';
import type { AuditService } from '../../audit/audit.service';
import type { ReminderJobScheduler } from './reminder.scheduler';
import type { ReminderRepository } from './reminder.repository';
import { ReminderService } from './reminder.service';

const baseReminder = {
  id: 'rem-1',
  dogId: 'dog-1',
  type: ReminderType.VACCINE,
  label: 'Annual vaccine',
  dueDate: new Date('2025-06-01'),
  recurrenceDays: null,
  lastDoneAt: null,
  isActive: true,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ReminderService', () => {
  let service: ReminderService;
  const repository = mock<ReminderRepository>();
  const auditService = mock<AuditService>();
  const scheduler = mock<ReminderJobScheduler>();

  beforeEach(() => {
    service = new ReminderService(repository, auditService, scheduler);
    jest.clearAllMocks();
    auditService.log.mockResolvedValue(undefined);
    scheduler.scheduleJobs.mockResolvedValue(undefined);
    scheduler.cancelJobs.mockResolvedValue(undefined);
  });

  it('findAll returns paginated reminders', async () => {
    repository.findAllByDog.mockResolvedValue([baseReminder]);
    const result = await service.findAll('dog-1', { limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.label).toBe('Annual vaccine');
  });

  it('create logs audit and returns reminder', async () => {
    repository.create.mockResolvedValue(baseReminder);
    const result = await service.create(
      'dog-1',
      { type: ReminderType.VACCINE, label: 'Annual vaccine', dueDate: '2025-06-01' },
      'user-1',
    );
    expect(result.id).toBe('rem-1');
    expect(auditService.log).toHaveBeenCalledWith('user-1', 'CREATE_REMINDER', 'Reminder', 'rem-1');
  });

  describe('markDone', () => {
    it('throws NotFoundException when reminder not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.markDone('missing', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('marks done and logs audit (no recurrence)', async () => {
      repository.findById.mockResolvedValue(baseReminder);
      repository.update.mockResolvedValue({ ...baseReminder, lastDoneAt: new Date() });
      const result = await service.markDone('rem-1', 'user-1');
      expect(result.lastDoneAt).not.toBeNull();
      expect(auditService.log).toHaveBeenCalledWith('user-1', 'DONE_REMINDER', 'Reminder', 'rem-1');
    });

    it('advances dueDate when recurrence is set', async () => {
      const recurring = { ...baseReminder, recurrenceDays: 30 };
      repository.findById.mockResolvedValue(recurring);
      repository.update.mockImplementation((_id, data) =>
        Promise.resolve({ ...recurring, ...(data as object), lastDoneAt: new Date() }),
      );
      const result = await service.markDone('rem-1', 'user-1');
      const newDue = new Date(result.dueDate);
      expect(newDue.getTime()).toBeGreaterThan(baseReminder.dueDate.getTime());
    });
  });

  it('remove soft deletes and logs audit', async () => {
    repository.softDelete.mockResolvedValue(baseReminder);
    await service.remove('rem-1', 'user-1');
    expect(repository.softDelete).toHaveBeenCalledWith('rem-1');
    expect(auditService.log).toHaveBeenCalledWith('user-1', 'DELETE_REMINDER', 'Reminder', 'rem-1');
  });
});
