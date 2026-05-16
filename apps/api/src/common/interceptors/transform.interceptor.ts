import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSnakeCase } from '@dogapp/utils';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (data === null || data === undefined) {
          return { data: null };
        }
        if (typeof data === 'object' && data !== null && 'data' in data) {
          return toSnakeCase(data);
        }
        return toSnakeCase({ data });
      }),
    );
  }
}
