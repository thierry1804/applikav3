import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmPhotoDto {
  @ApiProperty()
  @IsString()
  key!: string;
}
