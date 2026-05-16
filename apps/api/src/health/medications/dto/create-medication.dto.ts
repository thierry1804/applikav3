import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateMedicationDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  dosage!: string;

  @ApiProperty()
  @IsObject()
  frequency!: Record<string, unknown>;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  stockCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  stockAlertThreshold?: number;
}
