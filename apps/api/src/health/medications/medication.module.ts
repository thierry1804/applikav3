import { Module } from '@nestjs/common';
import { MedicationController } from './medication.controller';
import { MedicationRepository } from './medication.repository';
import { MedicationService } from './medication.service';

@Module({
  controllers: [MedicationController],
  providers: [MedicationService, MedicationRepository],
})
export class MedicationModule {}
