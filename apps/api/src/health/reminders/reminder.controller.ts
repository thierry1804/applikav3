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
import { Idempotent } from '../../common/decorators/idempotent.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import type { AuthUser } from '@dogapp/types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DogOwnerGuard } from '../../dogs/guards/dog-owner.guard';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderService } from './reminder.service';

@ApiTags('reminders')
@Controller('dogs/:dogId/health/reminders')
@UseGuards(JwtAuthGuard, DogOwnerGuard)
export class ReminderController {
  constructor(private readonly service: ReminderService) {}

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
    @Body() dto: CreateReminderDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: unknown }> {
    const data = await this.service.create(dogId, dto, user.id);
    return { data };
  }

  @Patch(':remId/done')
  @Idempotent()
  @ApiOperation({ summary: 'Mark reminder as done' })
  async markDone(
    @Param('remId') remId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: unknown }> {
    const data = await this.service.markDone(remId, user.id);
    return { data };
  }

  @Delete(':remId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('remId') remId: string, @CurrentUser() user: AuthUser): Promise<void> {
    await this.service.remove(remId, user.id);
  }
}
