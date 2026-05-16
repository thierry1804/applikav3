import { Module } from '@nestjs/common';
import { HygieneController } from './hygiene.controller';
import { HygieneRepository } from './hygiene.repository';
import { HygieneService } from './hygiene.service';

@Module({
  controllers: [HygieneController],
  providers: [HygieneService, HygieneRepository],
})
export class HygieneModule {}
