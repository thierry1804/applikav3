import { Injectable } from '@nestjs/common';
import type { HealthRecord, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthRecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByDog(dogId: string, query: PaginationQueryDto): Promise<HealthRecord[]> {
    return this.prisma.healthRecord.findMany({
      where: { dogId, deletedAt: null },
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { visitDate: 'desc' },
    });
  }

  async findById(id: string): Promise<HealthRecord | null> {
    return this.prisma.healthRecord.findFirst({ where: { id, deletedAt: null } });
  }

  async create(data: Prisma.HealthRecordCreateInput): Promise<HealthRecord> {
    return this.prisma.healthRecord.create({ data });
  }

  async update(id: string, data: Prisma.HealthRecordUpdateInput): Promise<HealthRecord> {
    return this.prisma.healthRecord.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<HealthRecord> {
    return this.prisma.healthRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
