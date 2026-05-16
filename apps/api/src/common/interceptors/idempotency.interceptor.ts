import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { IDEMPOTENT_KEY } from '../decorators/idempotent.decorator';
import { IdempotencyService } from '../../idempotency/idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const isIdempotent = this.reflector.get<boolean>(IDEMPOTENT_KEY, context.getHandler());
    if (!isIdempotent) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const keyHeader = request.headers['idempotency-key'];
    const key = Array.isArray(keyHeader) ? keyHeader[0] : keyHeader;

    if (!key) {
      return next.handle();
    }

    const cached = await this.idempotencyService.get(key);
    if (cached) {
      if (cached.status === 'processing') {
        throw new ConflictException('Request is already being processed');
      }
      return of(cached.response);
    }

    await this.idempotencyService.setProcessing(key);

    return new Observable((subscriber) => {
      next.handle().subscribe({
        next: (value: unknown) => {
          void this.idempotencyService.setCompleted(key, value).then(() => {
            subscriber.next(value);
            subscriber.complete();
          });
        },
        error: (err: unknown) => {
          void this.idempotencyService.remove(key).then(() => {
            subscriber.error(err);
          });
        },
      });
    });
  }
}
