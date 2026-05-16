import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Idempotent } from '../../common/decorators/idempotent.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import type { AuthUser } from '@dogapp/types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DogOwnerGuard } from '../../dogs/guards/dog-owner.guard';
import { CreateWeightDto } from './dto/create-weight.dto';
import { WeightService } from './weight.service';

@ApiTags('weight')
@Controller('dogs/:dogId/weight')
@UseGuards(JwtAuthGuard, DogOwnerGuard)
export class WeightController {
  constructor(private readonly service: WeightService) {}

  @Get()
  async findAll(
    @Param('dogId') dogId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<unknown> {
    return this.service.findAll(dogId, query);
  }

  @Post()
  @Idempotent()
  async create(
    @Param('dogId') dogId: string,
    @Body() dto: CreateWeightDto,
    @CurrentUser() user: AuthUser,
  ): Promise<unknown> {
    return this.service.create(dogId, dto, user.id);
  }
}
