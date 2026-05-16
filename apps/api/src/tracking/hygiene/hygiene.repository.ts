import { Injectable } from '@nestjs/common';
import type { HygieneCare, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HygieneRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByDog(dogId: string): Promise<HygieneCare[]> {
    return this.prisma.hygieneCare.findMany({
      where: { dogId, deletedAt: null, isActive: true },
      orderBy: { nextDueAt: 'asc' },
    });
  }

  async create(data: Prisma.HygieneCareCreateInput): Promise<HygieneCare> {
    return this.prisma.hygieneCare.create({ data });
  }

  async update(id: string, data: Prisma.HygieneCareUpdateInput): Promise<HygieneCare> {
    return this.prisma.hygieneCare.update({ where: { id }, data });
  }

  async findById(id: string): Promise<HygieneCare | null> {
    return this.prisma.hygieneCare.findFirst({ where: { id, deletedAt: null } });
  }
}
