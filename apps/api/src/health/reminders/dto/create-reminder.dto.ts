import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderType } from '@dogapp/types';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({ enum: ReminderType })
  @IsEnum(ReminderType)
  type!: ReminderType;

  @ApiProperty()
  @IsString()
  label!: string;

  @ApiProperty()
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  recurrenceDays?: number;
}
