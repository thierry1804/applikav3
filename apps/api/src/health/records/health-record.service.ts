import { Injectable, NotFoundException } from '@nestjs/common';
import type { HealthRecord as HealthRecordType } from '@dogapp/types';
import type { HealthRecord } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { sliceForPagination, toPaginatedMeta } from '../../common/utils/response.util';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { UpdateHealthRecordDto } from './dto/update-health-record.dto';
import { HealthRecordRepository } from './health-record.repository';

@Injectable()
export class HealthRecordService {
  constructor(
    private readonly repository: HealthRecordRepository,
    private readonly auditService: AuditService,
  ) {}

  async findAll(
    dogId: string,
    query: PaginationQueryDto,
  ): Promise<{ data: HealthRecordType[]; meta: ReturnType<typeof toPaginatedMeta> }> {
    const records = await this.repository.findAllByDog(dogId, query);
    const paginated = sliceForPagination(records, query.limit);
    return {
      data: paginated.data.map((r) => this.toResponse(r)),
      meta: toPaginatedMeta(paginated, query.limit),
    };
  }

  async findOne(id: string): Promise<HealthRecordType> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Health record not found');
    }
    return this.toResponse(record);
  }

  async create(
    dogId: string,
    dto: CreateHealthRecordDto,
    userId: string,
  ): Promise<HealthRecordType> {
    const record = await this.repository.create({
      dog: { connect: { id: dogId } },
      vetName: dto.vetName,
      visitDate: new Date(dto.visitDate),
      reason: dto.reason,
      diagnosis: dto.diagnosis ?? null,
      notes: dto.notes ?? null,
    });
    await this.auditService.log(userId, 'CREATE_HEALTH_RECORD', 'HealthRecord', record.id);
    return this.toResponse(record);
  }

  async update(id: string, dto: UpdateHealthRecordDto, userId: string): Promise<HealthRecordType> {
    const record = await this.repository.update(id, {
      ...(dto.vetName !== undefined && { vetName: dto.vetName }),
      ...(dto.visitDate !== undefined && { visitDate: new Date(dto.visitDate) }),
      ...(dto.reason !== undefined && { reason: dto.reason }),
      ...(dto.diagnosis !== undefined && { diagnosis: dto.diagnosis }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    });
    await this.auditService.log(userId, 'UPDATE_HEALTH_RECORD', 'HealthRecord', id);
    return this.toResponse(record);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.repository.softDelete(id);
    await this.auditService.log(userId, 'DELETE_HEALTH_RECORD', 'HealthRecord', id);
  }

  private toResponse(record: HealthRecord): HealthRecordType {
    return {
      id: record.id,
      dogId: record.dogId,
      vetName: record.vetName,
      visitDate: record.visitDate.toISOString().slice(0, 10),
      reason: record.reason,
      diagnosis: record.diagnosis,
      notes: record.notes,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
