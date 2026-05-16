import { Injectable } from '@nestjs/common';
import type { Prisma, WeightLog } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WeightRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByDog(dogId: string, query: PaginationQueryDto): Promise<WeightLog[]> {
    return this.prisma.weightLog.findMany({
      where: { dogId },
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { weighedAt: 'desc' },
    });
  }

  async create(data: Prisma.WeightLogCreateInput): Promise<WeightLog> {
    return this.prisma.weightLog.create({ data });
  }

  async findBreedRange(
    breedName: string,
    ageMonths: number,
  ): Promise<{ minWeightKg: number; maxWeightKg: number } | null> {
    const breed = await this.prisma.breed.findUnique({ where: { name: breedName } });
    if (!breed) return null;
    const range = await this.prisma.breedWeightRange.findFirst({
      where: {
        breedId: breed.id,
        minAgeMonths: { lte: ageMonths },
        maxAgeMonths: { gte: ageMonths },
      },
    });
    if (!range) return null;
    return {
      minWeightKg: Number(range.minWeightKg),
      maxWeightKg: Number(range.maxWeightKg),
    };
  }
}
