import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { EnvConfig } from '../config/env.schema';

@Injectable()
export class StorageService {
  private readonly client: S3Client | null;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService<EnvConfig, true>) {
    const endpoint = config.get('R2_ENDPOINT', { infer: true });
    const accessKeyId = config.get('R2_ACCESS_KEY_ID', { infer: true });
    const secretAccessKey = config.get('R2_SECRET_ACCESS_KEY', { infer: true });
    this.bucket = config.get('R2_BUCKET_NAME', { infer: true }) ?? 'dogapp-dev';

    if (endpoint && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.client = null;
    }
  }

  buildKey(env: string, ownerId: string, dogId: string, feature: string, fileName: string): string {
    const ext = fileName.split('.').pop() ?? 'bin';
    const uuid = crypto.randomUUID();
    return `${env}/${ownerId}/${dogId}/${feature}/${uuid}.${ext}`;
  }

  async getUploadUrl(key: string, contentType: string): Promise<string> {
    if (!this.client) {
      return `http://localhost/mock-upload/${key}?contentType=${contentType}`;
    }
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 300 });
  }

  async getReadUrl(key: string): Promise<string> {
    if (!this.client) {
      return `http://localhost/mock-read/${key}`;
    }
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  async deleteObject(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
