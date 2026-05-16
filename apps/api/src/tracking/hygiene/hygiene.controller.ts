import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@dogapp/types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DogOwnerGuard } from '../../dogs/guards/dog-owner.guard';
import { CreateHygieneDto } from './dto/create-hygiene.dto';
import { HygieneService } from './hygiene.service';

@ApiTags('hygiene')
@Controller('dogs/:dogId/hygiene')
@UseGuards(JwtAuthGuard, DogOwnerGuard)
export class HygieneController {
  constructor(private readonly service: HygieneService) {}

  @Get()
  async findAll(@Param('dogId') dogId: string): Promise<unknown> {
    return this.service.findAll(dogId);
  }

  @Post()
  async create(
    @Param('dogId') dogId: string,
    @Body() dto: CreateHygieneDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: unknown }> {
    const data = await this.service.create(dogId, dto, user.id);
    return { data };
  }

  @Patch(':id/done')
  async markDone(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: unknown }> {
    const data = await this.service.markDone(id, user.id);
    return { data };
  }
}
