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
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { UpdateHealthRecordDto } from './dto/update-health-record.dto';
import { HealthRecordService } from './health-record.service';

@ApiTags('health-records')
@Controller('dogs/:dogId/health/records')
@UseGuards(JwtAuthGuard, DogOwnerGuard)
export class HealthRecordController {
  constructor(private readonly service: HealthRecordService) {}

  @Get()
  @ApiOperation({ summary: 'List health records' })
  async findAll(
    @Param('dogId') dogId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<unknown> {
    return this.service.findAll(dogId, query);
  }

  @Get(':recordId')
  @ApiOperation({ summary: 'Get health record' })
  async findOne(@Param('recordId') recordId: string): Promise<{ data: unknown }> {
    const data = await this.service.findOne(recordId);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Create health record' })
  async create(
    @Param('dogId') dogId: string,
    @Body() dto: CreateHealthRecordDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: unknown }> {
    const data = await this.service.create(dogId, dto, user.id);
    return { data };
  }

  @Patch(':recordId')
  @ApiOperation({ summary: 'Update health record' })
  async update(
    @Param('recordId') recordId: string,
    @Body() dto: UpdateHealthRecordDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: unknown }> {
    const data = await this.service.update(recordId, dto, user.id);
    return { data };
  }

  @Delete(':recordId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete health record' })
  async remove(@Param('recordId') recordId: string, @CurrentUser() user: AuthUser): Promise<void> {
    await this.service.remove(recordId, user.id);
  }
}
