import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '@dogapp/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DogOwnerGuard } from '../dogs/guards/dog-owner.guard';
import { AttachmentService } from './attachment.service';

@ApiTags('attachments')
@Controller('dogs/:dogId/health/records/:recordId/attachments')
@UseGuards(JwtAuthGuard, DogOwnerGuard)
export class AttachmentController {
  constructor(private readonly service: AttachmentService) {}

  @Post('upload-url')
  async uploadUrl(
    @CurrentUser() user: AuthUser,
    @Param('dogId') dogId: string,
    @Param('recordId') recordId: string,
    @Body() body: { fileName: string; contentType: string },
  ): Promise<unknown> {
    return this.service.getUploadUrl(user.id, dogId, recordId, body.fileName, body.contentType);
  }

  @Post('confirm')
  async confirm(
    @Param('recordId') recordId: string,
    @CurrentUser() user: AuthUser,
    @Body()
    body: { key: string; fileName: string; fileSizeBytes: number; mimeType: string },
  ): Promise<unknown> {
    return this.service.confirm(recordId, user.id, body);
  }
}
