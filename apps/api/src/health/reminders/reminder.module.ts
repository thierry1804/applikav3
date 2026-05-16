import { Module } from '@nestjs/common';
import { ReminderController } from './reminder.controller';
import { ReminderRepository } from './reminder.repository';
import { ReminderService } from './reminder.service';

@Module({
  controllers: [ReminderController],
  providers: [ReminderService, ReminderRepository],
})
export class ReminderModule {}
