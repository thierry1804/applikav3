import type { Job } from 'bullmq';
import { mock } from 'jest-mock-extended';
import type { NotificationService } from './notification.service';
import type { PrismaService } from '../prisma/prisma.service';
import { NotificationProcessor } from './notification.processor';

const baseReminder = {
  id: 'rem-1',
  dogId: 'dog-1',
  label: 'Vaccin annuel',
  isActive: true,
  deletedAt: null,
};

const baseDog = {
  id: 'dog-1',
  ownerId: 'user-1',
  name: 'Rex',
};

const makeJob = (name: string, data: Record<string, unknown>): Job =>
  ({ name, data }) as unknown as Job;

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  const notifications = mock<NotificationService>();
  const reminderMock = { findFirst: jest.fn() };
  const dogMock = { findFirst: jest.fn() };
  const prisma = { reminder: reminderMock, dog: dogMock } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    notifications.sendPush.mockResolvedValue(undefined);
    reminderMock.findFirst.mockResolvedValue(baseReminder);
    dogMock.findFirst.mockResolvedValue(baseDog);
    processor = new NotificationProcessor(notifications, prisma);
  });

  describe('process', () => {
    it('ignores jobs with unknown name', async () => {
      const job = makeJob('unknown-event', {});
      await processor.process(job);
      expect(notifications.sendPush).not.toHaveBeenCalled();
    });

    it('routes send-push job to handleReminderPush', async () => {
      const job = makeJob('send-push', { reminderId: 'rem-1', dogId: 'dog-1', daysBeforeDue: 3 });
      await processor.process(job);
      expect(notifications.sendPush).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleReminderPush via process', () => {
    const pushJob = (
      overrides: Partial<{ reminderId: string; dogId: string; daysBeforeDue: number }> = {},
    ): Job =>
      makeJob('send-push', { reminderId: 'rem-1', dogId: 'dog-1', daysBeforeDue: 1, ...overrides });

    it('skips when reminder not found', async () => {
      reminderMock.findFirst.mockResolvedValue(null);
      await processor.process(pushJob());
      expect(notifications.sendPush).not.toHaveBeenCalled();
    });

    it('skips when reminder is inactive', async () => {
      reminderMock.findFirst.mockResolvedValue({ ...baseReminder, isActive: false });
      await processor.process(pushJob());
      expect(notifications.sendPush).not.toHaveBeenCalled();
    });

    it('skips when dog not found', async () => {
      dogMock.findFirst.mockResolvedValue(null);
      await processor.process(pushJob());
      expect(notifications.sendPush).not.toHaveBeenCalled();
    });

    it('sends push with correct title and body', async () => {
      await processor.process(pushJob({ daysBeforeDue: 3 }));

      expect(notifications.sendPush).toHaveBeenCalledWith(
        'user-1',
        'Rappel : Vaccin annuel',
        'Dans 3 jour(s) — Rex',
      );
    });
  });
});
