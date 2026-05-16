import { Module } from '@nestjs/common';
import { AttachmentModule } from '../attachments/attachment.module';
import { HealthRecordModule } from './records/health-record.module';
import { MedicationModule } from './medications/medication.module';
import { ReminderModule } from './reminders/reminder.module';
import { SymptomModule } from './symptoms/symptom.module';

@Module({
  imports: [HealthRecordModule, ReminderModule, SymptomModule, MedicationModule, AttachmentModule],
})
export class HealthModule {}
