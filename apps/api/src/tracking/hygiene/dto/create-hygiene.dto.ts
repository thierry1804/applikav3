import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HygieneCareType } from '@dogapp/types';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateHygieneDto {
  @ApiProperty({ enum: HygieneCareType })
  @IsEnum(HygieneCareType)
  careType!: HygieneCareType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty()
  @IsInt()
  frequencyDays!: number;
}
