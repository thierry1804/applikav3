import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { EnvConfig } from '../config/env.schema';

interface CachedEntry {
  status: 'processing' | 'completed';
  response?: unknown;
}

@Injectable()
export class IdempotencyService implements OnModuleDestroy {
  private readonly redis: Redis | null;
  private readonly memory = new Map<string, CachedEntry>();
  private readonly ttlSeconds = 86400;

  constructor(config: ConfigService<EnvConfig, true>) {
    const redisUrl = config.get('REDIS_URL', { infer: true });
    this.redis = redisUrl ? new Redis(redisUrl) : null;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async get(key: string): Promise<CachedEntry | null> {
    if (this.redis) {
      const raw = await this.redis.get(`idempotency:${key}`);
      if (!raw) return null;
      return JSON.parse(raw) as CachedEntry;
    }
    return this.memory.get(key) ?? null;
  }

  async setProcessing(key: string): Promise<void> {
    const entry: CachedEntry = { status: 'processing' };
    if (this.redis) {
      await this.redis.set(`idempotency:${key}`, JSON.stringify(entry), 'EX', this.ttlSeconds);
    } else {
      this.memory.set(key, entry);
    }
  }

  async setCompleted(key: string, response: unknown): Promise<void> {
    const entry: CachedEntry = { status: 'completed', response };
    if (this.redis) {
      await this.redis.set(`idempotency:${key}`, JSON.stringify(entry), 'EX', this.ttlSeconds);
    } else {
      this.memory.set(key, entry);
    }
  }

  async remove(key: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(`idempotency:${key}`);
    } else {
      this.memory.delete(key);
    }
  }
}
