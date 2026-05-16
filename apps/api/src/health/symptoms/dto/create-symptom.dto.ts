import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSymptomDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  symptoms!: string[];

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(3)
  severity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
