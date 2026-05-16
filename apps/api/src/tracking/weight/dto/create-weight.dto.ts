import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber } from 'class-validator';

export class CreateWeightDto {
  @ApiProperty()
  @IsDateString()
  weighedAt!: string;

  @ApiProperty()
  @IsNumber()
  weightKg!: number;
}
