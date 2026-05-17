import { Injectable, NotFoundException } from '@nestjs/common';
import type { Reminder as ReminderType } from '@dogapp/types';
import type { Reminder } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { sliceForPagination, toPaginatedMeta } from '../../common/utils/response.util';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderJobScheduler } from './reminder.scheduler';
import { ReminderRepository } from './reminder.repository';

@Injectable()
export class ReminderService {
  constructor(
    private readonly repository: ReminderRepository,
    private readonly auditService: AuditService,
    private readonly scheduler: ReminderJobScheduler,
  ) {}

  async findAll(
    dogId: string,
    query: PaginationQueryDto,
  ): Promise<{ data: ReminderType[]; meta: ReturnType<typeof toPaginatedMeta> }> {
    const items = await this.repository.findAllByDog(dogId, query);
    const paginated = sliceForPagination(items, query.limit);
    return {
      data: paginated.data.map((r) => this.toResponse(r)),
      meta: toPaginatedMeta(paginated, query.limit),
    };
  }

  async create(dogId: string, dto: CreateReminderDto, userId: string): Promise<ReminderType> {
    const reminder = await this.repository.create({
      dog: { connect: { id: dogId } },
      type: dto.type,
      label: dto.label,
      dueDate: new Date(dto.dueDate),
      recurrenceDays: dto.recurrenceDays ?? null,
    });
    await this.auditService.log(userId, 'CREATE_REMINDER', 'Reminder', reminder.id);
    await this.scheduler.scheduleJobs(reminder);
    return this.toResponse(reminder);
  }

  async markDone(id: string, userId: string): Promise<ReminderType> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Reminder not found');
    }
    const lastDoneAt = new Date();
    let dueDate = existing.dueDate;
    if (existing.recurrenceDays) {
      dueDate = new Date(lastDoneAt);
      dueDate.setDate(dueDate.getDate() + existing.recurrenceDays);
    }
    const updated = await this.repository.update(id, {
      lastDoneAt,
      dueDate,
    });
    await this.auditService.log(userId, 'DONE_REMINDER', 'Reminder', id);
    if (existing.recurrenceDays) {
      await this.scheduler.cancelJobs(id);
      await this.scheduler.scheduleJobs(updated);
    }
    return this.toResponse(updated);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.scheduler.cancelJobs(id);
    await this.repository.softDelete(id);
    await this.auditService.log(userId, 'DELETE_REMINDER', 'Reminder', id);
  }

  private toResponse(r: Reminder): ReminderType {
    return {
      id: r.id,
      dogId: r.dogId,
      type: r.type as ReminderType['type'],
      label: r.label,
      dueDate: r.dueDate.toISOString().slice(0, 10),
      recurrenceDays: r.recurrenceDays,
      lastDoneAt: r.lastDoneAt ? r.lastDoneAt.toISOString().slice(0, 10) : null,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}
