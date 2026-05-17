import { Module } from '@nestjs/common';
import { QueueModule } from '../../queue/queue.module';
import { ReminderController } from './reminder.controller';
import { ReminderJobScheduler } from './reminder.scheduler';
import { ReminderRepository } from './reminder.repository';
import { ReminderService } from './reminder.service';

@Module({
  imports: [QueueModule],
  controllers: [ReminderController],
  providers: [ReminderService, ReminderRepository, ReminderJobScheduler],
})
export class ReminderModule {}
