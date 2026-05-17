import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('passes through the response and logs', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/api/v1/dogs' }),
      }),
    } as unknown as ExecutionContext;

    const handler: CallHandler = { handle: () => of({ data: [] }) };
    const logSpy = jest.spyOn(interceptor['logger'], 'log').mockImplementation(() => undefined);

    interceptor.intercept(mockContext, handler).subscribe({
      next: (value) => {
        expect(value).toEqual({ data: [] });
      },
      complete: () => {
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('GET /api/v1/dogs'));
        done();
      },
    });
  });
});
