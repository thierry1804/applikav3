import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '../config/env.schema';

export const NOTIFICATION_QUEUE = 'notifications';
export const REMINDER_QUEUE = 'reminders';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig, true>) => {
        const url = config.get('REDIS_URL', { infer: true });
        return {
          connection: url ? { url } : { host: 'localhost', port: 6379 },
        };
      },
    }),
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    BullModule.registerQueue({ name: REMINDER_QUEUE }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
