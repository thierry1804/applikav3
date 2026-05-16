import { Module } from '@nestjs/common';
import { WeightController } from './weight.controller';
import { WeightRepository } from './weight.repository';
import { WeightService } from './weight.service';

@Module({
  controllers: [WeightController],
  providers: [WeightService, WeightRepository],
})
export class WeightModule {}
