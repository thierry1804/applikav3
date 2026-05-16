import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DogSex } from '@dogapp/types';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDogDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  breed!: string;

  @ApiProperty()
  @IsDateString()
  birthDate!: string;

  @ApiProperty({ enum: DogSex })
  @IsEnum(DogSex)
  sex!: DogSex;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sterilized?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lofNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lomadNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chipNumber?: string;
}
