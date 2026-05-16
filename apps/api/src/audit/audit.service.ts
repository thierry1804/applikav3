import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(userId: string, action: string, entityType: string, entityId: string): Promise<void> {
    const retentionUntil = new Date();
    retentionUntil.setFullYear(retentionUntil.getFullYear() + 1);

    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        retentionUntil,
      },
    });
  }
}
