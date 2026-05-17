import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PhotoUploadQueryDto {
  @ApiProperty()
  @IsString()
  fileName!: string;

  @ApiProperty()
  @IsString()
  contentType!: string;
}
