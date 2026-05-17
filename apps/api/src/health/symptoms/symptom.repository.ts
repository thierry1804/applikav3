import { Injectable } from '@nestjs/common';
import type { Prisma, SymptomLog } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SymptomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByDog(dogId: string, query: PaginationQueryDto): Promise<SymptomLog[]> {
    return this.prisma.symptomLog.findMany({
      where: { dogId, deletedAt: null },
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { loggedAt: 'desc' },
    });
  }

  async create(data: Prisma.SymptomLogCreateInput): Promise<SymptomLog> {
    return this.prisma.symptomLog.create({ data });
  }

  async update(id: string, data: Prisma.SymptomLogUpdateInput): Promise<SymptomLog> {
    return this.prisma.symptomLog.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<SymptomLog> {
    return this.prisma.symptomLog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
