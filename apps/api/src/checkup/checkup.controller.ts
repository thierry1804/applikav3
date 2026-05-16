import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DogOwnerGuard } from '../dogs/guards/dog-owner.guard';
import { CheckupService } from './checkup.service';

@ApiTags('checkup')
@Controller('dogs/:dogId/checkup')
@UseGuards(JwtAuthGuard, DogOwnerGuard)
export class CheckupController {
  constructor(private readonly service: CheckupService) {}

  @Get('questions')
  async getQuestions(@Param('dogId') dogId: string): Promise<unknown> {
    return this.service.getQuestions(dogId);
  }

  @Post()
  async submit(
    @Param('dogId') dogId: string,
    @Body() body: { answers: Record<string, boolean> },
  ): Promise<unknown> {
    return this.service.submit(dogId, body.answers);
  }
}
