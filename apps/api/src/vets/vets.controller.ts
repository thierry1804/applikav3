import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '@dogapp/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VetsService } from './vets.service';

@ApiTags('vets')
@Controller()
export class VetsController {
  constructor(private readonly service: VetsService) {}

  @Get('vets')
  async search(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius = '5',
  ): Promise<unknown> {
    return this.service.searchNearby(Number(lat), Number(lng), Number(radius));
  }

  @Get('account/favorite-vets')
  @UseGuards(JwtAuthGuard)
  async listFavorites(@CurrentUser() user: AuthUser): Promise<unknown> {
    return this.service.listFavorites(user.id);
  }

  @Post('account/favorite-vets')
  @UseGuards(JwtAuthGuard)
  async addFavorite(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      placeId: string;
      name: string;
      address?: string;
      phone?: string;
      latitude: number;
      longitude: number;
    },
  ): Promise<unknown> {
    return this.service.addFavorite(user.id, body);
  }

  @Delete('account/favorite-vets/:placeId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavorite(
    @CurrentUser() user: AuthUser,
    @Param('placeId') placeId: string,
  ): Promise<void> {
    await this.service.removeFavorite(user.id, placeId);
  }
}
