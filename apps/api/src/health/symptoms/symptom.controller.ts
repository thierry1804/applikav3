import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import type { AuthUser } from '@dogapp/types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DogOwnerGuard } from '../../dogs/guards/dog-owner.guard';
import { ConfirmPhotoDto } from './dto/confirm-photo.dto';
import { PhotoUploadQueryDto } from './dto/photo-upload-query.dto';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { SymptomService } from './symptom.service';

@ApiTags('symptoms')
@Controller('dogs/:dogId/health/symptoms')
@UseGuards(JwtAuthGuard, DogOwnerGuard)
export class SymptomController {
  constructor(private readonly service: SymptomService) {}

  @Get()
  async findAll(
    @Param('dogId') dogId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<unknown> {
    return this.service.findAll(dogId, query);
  }

  @Post()
  async create(
    @Param('dogId') dogId: string,
    @Body() dto: CreateSymptomDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: unknown }> {
    const data = await this.service.create(dogId, dto, user.id);
    return { data };
  }

  @Get('photo-upload-url')
  @ApiOperation({ summary: 'Get presigned URL to upload a symptom photo' })
  async getPhotoUploadUrl(
    @Param('dogId') dogId: string,
    @Query() query: PhotoUploadQueryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: unknown }> {
    const data = await this.service.getPhotoUploadUrl(
      user.id,
      dogId,
      query.fileName,
      query.contentType,
    );
    return { data };
  }

  @Patch(':symptomId/photo-confirm')
  @ApiOperation({ summary: 'Confirm photo upload and attach to symptom log' })
  async confirmPhoto(
    @Param('symptomId') symptomId: string,
    @Body() dto: ConfirmPhotoDto,
  ): Promise<{ data: unknown }> {
    const data = await this.service.confirmPhoto(symptomId, dto.key);
    return { data };
  }

  @Delete(':symptomId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('symptomId') symptomId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.service.remove(symptomId, user.id);
  }
}
