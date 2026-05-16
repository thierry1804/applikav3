import { Injectable, NotFoundException } from '@nestjs/common';
import type { Medication as MedicationType } from '@dogapp/types';
import type { Medication, Prisma } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { MedicationRepository } from './medication.repository';

@Injectable()
export class MedicationService {
  constructor(
    private readonly repository: MedicationRepository,
    private readonly auditService: AuditService,
  ) {}

  async findActive(dogId: string): Promise<{ data: MedicationType[] }> {
    const meds = await this.repository.findActiveByDog(dogId);
    return { data: meds.map((m) => this.toResponse(m)) };
  }

  async create(dogId: string, dto: CreateMedicationDto, userId: string): Promise<MedicationType> {
    const med = await this.repository.create({
      dog: { connect: { id: dogId } },
      name: dto.name,
      dosage: dto.dosage,
      frequency: dto.frequency as Prisma.InputJsonValue, // SAFE: validated as object by IsObject decorator
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      stockCount: dto.stockCount ?? null,
      stockAlertThreshold: dto.stockAlertThreshold ?? null,
    });
    await this.auditService.log(userId, 'CREATE_MEDICATION', 'Medication', med.id);
    return this.toResponse(med);
  }

  async confirmDose(
    medicationId: string,
    userId: string,
    idempotencyKey?: string,
  ): Promise<{ data: unknown; lowStock: boolean }> {
    const med = await this.repository.findById(medicationId);
    if (!med) {
      throw new NotFoundException('Medication not found');
    }

    const doseLog = await this.repository.createDoseLog({
      medication: { connect: { id: medicationId } },
      scheduledAt: new Date(),
      takenAt: new Date(),
      status: 'taken',
      idempotencyKey: idempotencyKey ?? null,
    });

    let lowStock = false;
    if (med.stockCount !== null && med.stockCount > 0) {
      const newStock = med.stockCount - 1;
      await this.repository.update(medicationId, { stockCount: newStock });
      if (med.stockAlertThreshold !== null && newStock <= med.stockAlertThreshold) {
        lowStock = true;
      }
    }

    await this.auditService.log(userId, 'MEDICATION_DOSE_TAKEN', 'MedicationDoseLog', doseLog.id);
    return { data: doseLog, lowStock };
  }

  async getDoseHistory(medicationId: string): Promise<{ data: unknown[] }> {
    const logs = await this.repository.findDoseLogs(medicationId);
    return { data: logs };
  }

  private toResponse(m: Medication): MedicationType {
    const frequency =
      typeof m.frequency === 'object' && m.frequency !== null
        ? (m.frequency as Record<string, unknown>)
        : {};
    return {
      id: m.id,
      dogId: m.dogId,
      name: m.name,
      dosage: m.dosage,
      frequency,
      startDate: m.startDate.toISOString().slice(0, 10),
      endDate: m.endDate ? m.endDate.toISOString().slice(0, 10) : null,
      stockCount: m.stockCount,
      stockAlertThreshold: m.stockAlertThreshold,
      isActive: m.isActive,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }
}
