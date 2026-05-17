import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { Reminder } from '@prisma/client';
import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE } from '../../queue/queue.module';

const OFFSETS_DAYS = [30, 14, 7, 1] as const;

@Injectable()
export class ReminderJobScheduler {
  private readonly logger = new Logger(ReminderJobScheduler.name);

  constructor(@InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue) {}

  async scheduleJobs(reminder: Reminder): Promise<void> {
    for (const days of OFFSETS_DAYS) {
      const target = new Date(reminder.dueDate);
      target.setDate(target.getDate() - days);
      const delayMs = target.getTime() - Date.now();
      if (delayMs <= 0) continue;
      const jobId = `reminder-${reminder.id}-${days}d`;
      await this.queue.add(
        'send-push',
        { reminderId: reminder.id, dogId: reminder.dogId, daysBeforeDue: days },
        { delay: delayMs, jobId },
      );
      this.logger.debug(`Scheduled ${jobId} in ${delayMs}ms`);
    }
  }

  async cancelJobs(reminderId: string): Promise<void> {
    for (const days of OFFSETS_DAYS) {
      const jobId = `reminder-${reminderId}-${days}d`;
      const job = await this.queue.getJob(jobId);
      await job?.remove();
    }
  }
}
