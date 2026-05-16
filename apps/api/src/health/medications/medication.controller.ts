import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Idempotent } from '../../common/decorators/idempotent.decorator';
import type { AuthUser } from '@dogapp/types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DogOwnerGuard } from '../../dogs/guards/dog-owner.guard';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { MedicationService } from './medication.service';

@ApiTags('medications')
@Controller('dogs/:dogId/health/medications')
@UseGuards(JwtAuthGuard, DogOwnerGuard)
export class MedicationController {
  constructor(private readonly service: MedicationService) {}

  @Get()
  async findActive(@Param('dogId') dogId: string): Promise<unknown> {
    return this.service.findActive(dogId);
  }

  @Post()
  async create(
    @Param('dogId') dogId: string,
    @Body() dto: CreateMedicationDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: unknown }> {
    const data = await this.service.create(dogId, dto, user.id);
    return { data };
  }

  @Post(':medId/doses')
  @Idempotent()
  async confirmDose(
    @Param('medId') medId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<unknown> {
    return this.service.confirmDose(medId, user.id);
  }

  @Get(':medId/doses')
  async doseHistory(@Param('medId') medId: string): Promise<unknown> {
    return this.service.getDoseHistory(medId);
  }
}
