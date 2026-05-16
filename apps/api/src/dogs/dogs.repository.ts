import { Injectable } from '@nestjs/common';
import type { Dog, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class DogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByOwner(ownerId: string, query: PaginationQueryDto): Promise<Dog[]> {
    return this.prisma.dog.findMany({
      where: { ownerId, deletedAt: null },
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Dog | null> {
    return this.prisma.dog.findFirst({ where: { id, deletedAt: null } });
  }

  async create(data: Prisma.DogCreateInput): Promise<Dog> {
    return this.prisma.dog.create({ data });
  }

  async update(id: string, data: Prisma.DogUpdateInput): Promise<Dog> {
    return this.prisma.dog.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Dog> {
    return this.prisma.dog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
