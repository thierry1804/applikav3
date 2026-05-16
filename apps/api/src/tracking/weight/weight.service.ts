import { Injectable } from '@nestjs/common';
import type { WeightLog as WeightLogType } from '@dogapp/types';
import type { WeightLog } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { sliceForPagination, toPaginatedMeta } from '../../common/utils/response.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWeightDto } from './dto/create-weight.dto';
import { WeightRepository } from './weight.repository';

@Injectable()
export class WeightService {
  constructor(
    private readonly repository: WeightRepository,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(
    dogId: string,
    query: PaginationQueryDto,
  ): Promise<{ data: WeightLogType[]; meta: ReturnType<typeof toPaginatedMeta> }> {
    const logs = await this.repository.findAllByDog(dogId, query);
    const paginated = sliceForPagination(logs, query.limit);
    return {
      data: paginated.data.map((w) => this.toResponse(w)),
      meta: toPaginatedMeta(paginated, query.limit),
    };
  }

  async create(
    dogId: string,
    dto: CreateWeightDto,
    userId: string,
    idempotencyKey?: string,
  ): Promise<{ data: WeightLogType; outOfRange: boolean }> {
    const log = await this.repository.create({
      dog: { connect: { id: dogId } },
      weighedAt: new Date(dto.weighedAt),
      weightKg: dto.weightKg,
      idempotencyKey: idempotencyKey ?? null,
    });
    await this.auditService.log(userId, 'CREATE_WEIGHT_LOG', 'WeightLog', log.id);

    const dog = await this.prisma.dog.findUnique({ where: { id: dogId } });
    let outOfRange = false;
    if (dog) {
      const ageMonths = this.getAgeMonths(dog.birthDate);
      const range = await this.repository.findBreedRange(dog.breed, ageMonths);
      if (range) {
        outOfRange = dto.weightKg < range.minWeightKg || dto.weightKg > range.maxWeightKg;
      }
    }

    return { data: this.toResponse(log), outOfRange };
  }

  private getAgeMonths(birthDate: Date): number {
    const now = new Date();
    return (
      (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth())
    );
  }

  private toResponse(w: WeightLog): WeightLogType {
    return {
      id: w.id,
      dogId: w.dogId,
      weighedAt: w.weighedAt.toISOString().slice(0, 10),
      weightKg: Number(w.weightKg),
      createdAt: w.createdAt.toISOString(),
    };
  }
}
