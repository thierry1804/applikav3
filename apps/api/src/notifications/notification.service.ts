import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerDeviceToken(
    userId: string,
    token: string,
    platform: string,
  ): Promise<{ data: unknown }> {
    const device = await this.prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform, isValid: true },
      create: { userId, token, platform },
    });
    return { data: device };
  }

  async sendPush(userId: string, title: string, body: string): Promise<void> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId, isValid: true },
    });
    for (const device of tokens) {
      this.logger.log(`Push to ${device.platform}: ${title} - ${body}`);
    }
  }

  async invalidateToken(token: string): Promise<void> {
    await this.prisma.deviceToken.updateMany({
      where: { token },
      data: { isValid: false },
    });
  }
}
