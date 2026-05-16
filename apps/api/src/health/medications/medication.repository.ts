import { Injectable } from '@nestjs/common';
import type { Medication, MedicationDoseLog, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MedicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByDog(dogId: string): Promise<Medication[]> {
    return this.prisma.medication.findMany({
      where: { dogId, deletedAt: null, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Medication | null> {
    return this.prisma.medication.findFirst({ where: { id, deletedAt: null } });
  }

  async create(data: Prisma.MedicationCreateInput): Promise<Medication> {
    return this.prisma.medication.create({ data });
  }

  async update(id: string, data: Prisma.MedicationUpdateInput): Promise<Medication> {
    return this.prisma.medication.update({ where: { id }, data });
  }

  async createDoseLog(data: Prisma.MedicationDoseLogCreateInput): Promise<MedicationDoseLog> {
    return this.prisma.medicationDoseLog.create({ data });
  }

  async findDoseLogs(medicationId: string): Promise<MedicationDoseLog[]> {
    return this.prisma.medicationDoseLog.findMany({
      where: { medicationId },
      orderBy: { scheduledAt: 'desc' },
    });
  }
}
