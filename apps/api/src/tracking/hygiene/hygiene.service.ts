import { Injectable, NotFoundException } from '@nestjs/common';
import type { HygieneCare as HygieneCareType } from '@dogapp/types';
import type { HygieneCare } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { CreateHygieneDto } from './dto/create-hygiene.dto';
import { HygieneRepository } from './hygiene.repository';

@Injectable()
export class HygieneService {
  constructor(
    private readonly repository: HygieneRepository,
    private readonly auditService: AuditService,
  ) {}

  async findAll(dogId: string): Promise<{ data: HygieneCareType[] }> {
    const items = await this.repository.findAllByDog(dogId);
    return { data: items.map((h) => this.toResponse(h)) };
  }

  async create(dogId: string, dto: CreateHygieneDto, userId: string): Promise<HygieneCareType> {
    const nextDueAt = new Date();
    nextDueAt.setDate(nextDueAt.getDate() + dto.frequencyDays);
    const care = await this.repository.create({
      dog: { connect: { id: dogId } },
      careType: dto.careType,
      label: dto.label ?? null,
      frequencyDays: dto.frequencyDays,
      nextDueAt,
    });
    await this.auditService.log(userId, 'CREATE_HYGIENE', 'HygieneCare', care.id);
    return this.toResponse(care);
  }

  async markDone(id: string, userId: string): Promise<HygieneCareType> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Hygiene care not found');
    }
    const lastDoneAt = new Date();
    const nextDueAt = new Date(lastDoneAt);
    nextDueAt.setDate(nextDueAt.getDate() + existing.frequencyDays);
    const updated = await this.repository.update(id, { lastDoneAt, nextDueAt });
    await this.auditService.log(userId, 'DONE_HYGIENE', 'HygieneCare', id);
    return this.toResponse(updated);
  }

  private toResponse(h: HygieneCare): HygieneCareType {
    return {
      id: h.id,
      dogId: h.dogId,
      careType: h.careType as HygieneCareType['careType'],
      label: h.label,
      frequencyDays: h.frequencyDays,
      lastDoneAt: h.lastDoneAt ? h.lastDoneAt.toISOString().slice(0, 10) : null,
      nextDueAt: h.nextDueAt.toISOString().slice(0, 10),
      isActive: h.isActive,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
    };
  }
}
