import { Module } from '@nestjs/common';
import { CheckupController } from './checkup.controller';
import { CheckupService } from './checkup.service';

@Module({
  controllers: [CheckupController],
  providers: [CheckupService],
})
export class CheckupModule {}
