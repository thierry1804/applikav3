import { Module } from '@nestjs/common';
import { HygieneModule } from './hygiene/hygiene.module';
import { WeightModule } from './weight/weight.module';

@Module({
  imports: [WeightModule, HygieneModule],
})
export class TrackingModule {}
