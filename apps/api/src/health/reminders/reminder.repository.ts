import { Injectable } from '@nestjs/common';
import type { Prisma, Reminder } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByDog(dogId: string, query: PaginationQueryDto): Promise<Reminder[]> {
    return this.prisma.reminder.findMany({
      where: { dogId, deletedAt: null, isActive: true },
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { dueDate: 'asc' },
    });
  }

  async findById(id: string): Promise<Reminder | null> {
    return this.prisma.reminder.findFirst({ where: { id, deletedAt: null } });
  }

  async create(data: Prisma.ReminderCreateInput): Promise<Reminder> {
    return this.prisma.reminder.create({ data });
  }

  async update(id: string, data: Prisma.ReminderUpdateInput): Promise<Reminder> {
    return this.prisma.reminder.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Reminder> {
    return this.prisma.reminder.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
