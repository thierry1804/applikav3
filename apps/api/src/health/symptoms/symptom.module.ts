import { Module } from '@nestjs/common';
import { SymptomController } from './symptom.controller';
import { SymptomRepository } from './symptom.repository';
import { SymptomService } from './symptom.service';

@Module({
  controllers: [SymptomController],
  providers: [SymptomService, SymptomRepository],
})
export class SymptomModule {}
