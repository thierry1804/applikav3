import { Module } from '@nestjs/common';
import { HealthRecordController } from './health-record.controller';
import { HealthRecordRepository } from './health-record.repository';
import { HealthRecordService } from './health-record.service';

@Module({
  controllers: [HealthRecordController],
  providers: [HealthRecordService, HealthRecordRepository],
})
export class HealthRecordModule {}
