import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { NOTIFICATION_QUEUE } from '../queue/queue.module';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

interface ReminderPushPayload {
  reminderId: string;
  dogId: string;
  daysBeforeDue: number;
}

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notifications: NotificationService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name === 'send-push') {
      await this.handleReminderPush(job as Job<ReminderPushPayload>);
    }
  }

  private async handleReminderPush(job: Job<ReminderPushPayload>): Promise<void> {
    const { reminderId, dogId, daysBeforeDue } = job.data;
    const reminder = await this.prisma.reminder.findFirst({
      where: { id: reminderId, deletedAt: null },
    });
    if (!reminder?.isActive) return;

    const dog = await this.prisma.dog.findFirst({ where: { id: dogId } });
    if (!dog) return;

    const title = `Rappel : ${reminder.label}`;
    const body = `Dans ${daysBeforeDue} jour(s) — ${dog.name}`;
    await this.notifications.sendPush(dog.ownerId, title, body);
    this.logger.log(`Push sent for reminder ${reminderId} (J-${daysBeforeDue})`);
  }
}
