import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '@dogapp/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post('device-tokens')
  async registerToken(
    @CurrentUser() user: AuthUser,
    @Body() body: { token: string; platform: string },
  ): Promise<unknown> {
    return this.service.registerDeviceToken(user.id, body.token, body.platform);
  }
}
