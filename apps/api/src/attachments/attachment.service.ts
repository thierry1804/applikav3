import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AttachmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
  ) {}

  async getUploadUrl(
    ownerId: string,
    dogId: string,
    healthRecordId: string,
    fileName: string,
    contentType: string,
  ): Promise<{ data: { uploadUrl: string; key: string } }> {
    const key = this.storageService.buildKey('dev', ownerId, dogId, 'health-records', fileName);
    const uploadUrl = await this.storageService.getUploadUrl(key, contentType);
    return { data: { uploadUrl, key } };
  }

  async confirm(
    healthRecordId: string,
    userId: string,
    dto: { key: string; fileName: string; fileSizeBytes: number; mimeType: string },
  ): Promise<{ data: unknown }> {
    const attachment = await this.prisma.attachment.create({
      data: {
        healthRecord: { connect: { id: healthRecordId } },
        fileKey: dto.key,
        fileName: dto.fileName,
        fileSizeBytes: dto.fileSizeBytes,
        mimeType: dto.mimeType,
      },
    });
    await this.auditService.log(userId, 'CREATE_ATTACHMENT', 'Attachment', attachment.id);
    return { data: attachment };
  }
}
