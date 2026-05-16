import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_KEY = 'idempotent';
export const Idempotent = (): ReturnType<typeof SetMetadata> => SetMetadata(IDEMPOTENT_KEY, true);
