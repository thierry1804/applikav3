import { Injectable } from '@nestjs/common';
import type { SymptomLog as SymptomLogType } from '@dogapp/types';
import type { SymptomLog } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { sliceForPagination, toPaginatedMeta } from '../../common/utils/response.util';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { SymptomRepository } from './symptom.repository';

@Injectable()
export class SymptomService {
  constructor(
    private readonly repository: SymptomRepository,
    private readonly auditService: AuditService,
  ) {}

  async findAll(
    dogId: string,
    query: PaginationQueryDto,
  ): Promise<{ data: SymptomLogType[]; meta: ReturnType<typeof toPaginatedMeta> }> {
    const items = await this.repository.findAllByDog(dogId, query);
    const paginated = sliceForPagination(items, query.limit);
    return {
      data: paginated.data.map((s) => this.toResponse(s)),
      meta: toPaginatedMeta(paginated, query.limit),
    };
  }

  async create(dogId: string, dto: CreateSymptomDto, userId: string): Promise<SymptomLogType> {
    const log = await this.repository.create({
      dog: { connect: { id: dogId } },
      loggedAt: new Date(),
      symptoms: dto.symptoms,
      severity: dto.severity,
      notes: dto.notes ?? null,
    });
    await this.auditService.log(userId, 'CREATE_SYMPTOM', 'SymptomLog', log.id);
    return this.toResponse(log);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.repository.softDelete(id);
    await this.auditService.log(userId, 'DELETE_SYMPTOM', 'SymptomLog', id);
  }

  private toResponse(s: SymptomLog): SymptomLogType {
    const symptoms = Array.isArray(s.symptoms) ? (s.symptoms as string[]) : [];
    return {
      id: s.id,
      dogId: s.dogId,
      loggedAt: s.loggedAt.toISOString(),
      symptoms,
      severity: s.severity,
      notes: s.notes,
      photoUrl: s.photoUrl,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  }
}
